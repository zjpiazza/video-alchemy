// @ts-ignore
// TODO: Fix this?
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { logger } from "@trigger.dev/sdk/v3"
import os from "os"
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod"
import { db } from "~/server/api/prisma";
import { put } from "@vercel/blob";
import { updateStatus } from "~/lib/trigger/metadataStore";
import { randomUUID } from "crypto";

// Helper to build FFmpeg filter string from effect and params
type EffectType = { name: string };
function buildFFmpegFilter(effect: EffectType, params: Record<string, any>) {
  // Example: extend this for more effects/params
  switch (effect.name.toLowerCase()) {
    case "sepia":
      return "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0";
    case "grayscale":
      return "format=gray";
    case "vignette":
      return "vignette=PI/4";
    case "blur":
      return params?.strength ? `boxblur=${params.strength}:1` : "gblur=sigma=2";
    // Add more cases as needed
    default:
      return "";
  }
}

// Create a safe file path for temporary files
function createTempFilePath(prefix: string, extension: string): string {
  const tempDir = path.resolve(os.tmpdir());
  const fileName = `${prefix}_${randomUUID()}${extension}`;
  return path.join(tempDir, fileName);
}

// Ensure the directory exists
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await fs.promises.access(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

export const transformVideo = schemaTask({
  id: "video-transform",
  schema: z.object({
    transformationId: z.string(),
  }),
  run: async (payload: { transformationId: string }) => {
    const { transformationId } = payload;
    let inputPath = "";
    let outputPath = "";

    try {
      // Fetch transformation and effect from DB
      const transformation = await db.transformation.findUnique({
        where: { id: transformationId },
        include: { effect: true },
      });
      if (!transformation) throw new Error("Transformation not found");
      if (!transformation.inputUrl) throw new Error("No inputUrl on transformation");
      if (!transformation.effect) throw new Error("No effect found for transformation");

      // Update status to PROCESSING in DB
      await db.transformation.update({
        where: { id: transformationId },
        data: { status: "PROCESSING" },
      });

      // Set initial metadata status
      updateStatus({ progress: 0, label: "Starting processing" });

      // Create temp file paths with safe names
      inputPath = createTempFilePath("input", ".mp4");
      outputPath = createTempFilePath("output", ".mp4");

      // Ensure directories exist
      await ensureDirectoryExists(inputPath);
      await ensureDirectoryExists(outputPath);

      // Download input video from blob storage
      logger.log(`Downloading video: ${transformation.inputUrl}`);
      updateStatus({ progress: 0, label: "Downloading video" });
      
      const response = await fetch(transformation.inputUrl);
      if (!response.ok) throw new Error(`Failed to download input video: ${response.statusText}`);
      
      const arrayBuffer = await response.arrayBuffer();
      await fs.promises.writeFile(inputPath, Buffer.from(arrayBuffer));
      
      // Verify the input file exists and has content
      const stats = await fs.promises.stat(inputPath);
      if (stats.size === 0) throw new Error("Downloaded file is empty");
      
      logger.log(`Downloaded video successfully (${stats.size} bytes)`);
      updateStatus({ progress: 10, label: "Download complete" });

      // Build FFmpeg filter string
      const filterCommand = buildFFmpegFilter(
        transformation.effect,
        (transformation.effectParams && typeof transformation.effectParams === 'object' && transformation.effectParams !== null)
          ? transformation.effectParams as Record<string, any>
          : {}
      );
      logger.log(`Processing video with effect: ${transformation.effect.name}`);

      // Process the video using FFmpeg
      await new Promise<void>((resolve, reject) => {
        let lastLogTime = 0;
        const THROTTLE_INTERVAL = 5000;
        
        const ffmpegCommand = ffmpeg(inputPath);
        
        // Add video filter if it exists
        if (filterCommand) {
          ffmpegCommand.videoFilter(filterCommand);
        }
        
        ffmpegCommand
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'ultrafast', // Use ultrafast for faster processing
            '-crf', '23',
            '-movflags', '+faststart',
            '-pix_fmt', 'yuv420p',
            '-profile:v', 'main',
            '-threads', '0',
            '-f', 'mp4'
          ])
          .on('start', (commandLine: string) => {
            logger.log('FFmpeg processing started');
            logger.log(`FFmpeg command: ${commandLine}`);
            updateStatus({ progress: 20, label: "FFmpeg started" });
          })
          .on('progress', (progress: { percent?: number }) => {
            const now = Date.now();
            if (now - lastLogTime >= THROTTLE_INTERVAL) {
              const progressPercent = Math.round(progress.percent || 0);
              // Scale the progress from 20% to 90%
              const scaledProgress = 20 + (progressPercent * 0.7);
              
              updateStatus({
                progress: Math.round(scaledProgress),
                label: `Processing: ${progressPercent}%`,
              });
              lastLogTime = now;
            }
          })
          .output(outputPath)
          .on('end', () => {
            logger.log('Processing: complete');
            updateStatus({ progress: 90, label: "Processing complete" });
            resolve();
          })
          .on('error', (err: Error, stdout: string, stderr: string) => {
            logger.error(`Processing failed: ${err.message}`);
            logger.error(`FFmpeg stderr: ${stderr}`);
            logger.error(`FFmpeg stdout: ${stdout}`);
            updateStatus({ progress: 0, label: `Error: ${err.message}` });
            reject(err);
          })
          .run();
      });

      // Verify output file exists and has content
      const outputStats = await fs.promises.stat(outputPath);
      if (outputStats.size === 0) throw new Error("Processed file is empty");

      logger.log(`Video processed, uploading result (${outputStats.size} bytes)`);
      updateStatus({ progress: 95, label: "Uploading result" });

      // Upload the processed video to Vercel Blob Storage
      const fileStream = fs.createReadStream(outputPath);
      const { url: outputUrl } = await put(
        `processed/${path.basename(outputPath)}`,
        fileStream,
        { access: 'public' }
      );

      // Update transformation as completed
      await db.transformation.update({
        where: { id: transformationId },
        data: {
          status: "COMPLETED",
          outputUrl,
          fileSize: outputStats.size,
          completedAt: new Date(),
        },
      });

      updateStatus({ progress: 100, label: "Transformation complete" });

      return {
        message: `Video processed successfully: ${outputUrl}`,
        outputUrl,
        metadata: {
          format: "mp4",
          width: 1280, // These are placeholders - ideally you'd get real metadata
          height: 720,
          duration: 10,
        }
      };
    } catch (error) {
      logger.error(`Transformation failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Update DB status to failed
      await db.transformation.update({
        where: { id: transformationId },
        data: { 
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : String(error)
        },
      });
      
      throw error;
    } finally {
      // Cleanup temporary files
      try {
        if (inputPath && fs.existsSync(inputPath)) {
          await fs.promises.unlink(inputPath);
        }
        if (outputPath && fs.existsSync(outputPath)) {
          await fs.promises.unlink(outputPath);
        }
        logger.log(`Temporary files cleaned up`);
      } catch (cleanupError) {
        logger.error(`Error cleaning up temporary files: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
      }
    }
  },
});