// @ts-ignore
// TODO: Fix this?
import { createClient } from "@supabase/supabase-js"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { Database } from "../database.types"
import { logger, task } from "@trigger.dev/sdk/v3"
import os from "os"

interface TransformationOptions {
    effect: 'none' | 'sepia' | 'grayscale' | 'vignette' | 'blur'
}

interface FFmpegProgress {
    /** Total number of frames processed */
    frames: number;
    /** Current processing frame rate */
    currentFps: number;
    /** Current processing throughput in kbps */
    currentKbps: number;
    /** Current size of target file in kilobytes */
    targetSize: number;
    /** Timestamp of current frame in seconds */
    timemark: string;
    /** Estimated progress percentage */
    percent?: number;
}

export const videoTransform = task({
    id: "video-transform",
    run: async (payload: {
        videoPath: string;
        userId: string;
        videoTitle: string;
        transformations: TransformationOptions;
    }) => {
        const { videoPath, userId, videoTitle, transformations } = payload;

        logger.log(`Downloading video: ${videoPath}`);

        const { data: fileData, error: downloadError } = await createClient<Database>(
            process.env.SUPABASE_PROJECT_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        )
            .storage
            .from('videos')
            .download(videoPath);

        if (downloadError) throw downloadError;
        if (!fileData) throw new Error('No file data received');

        // Generate temporary file names
        const tempDirectory = os.tmpdir();
        const inputPath = path.join(tempDirectory, `input_${Date.now()}.mp4`);
        const outputPath = path.join(tempDirectory, `output_${Date.now()}.mp4`);

        // Write downloaded file to disk
        // @ts-ignore
        await fs.promises.writeFile(inputPath, Buffer.from(await fileData.arrayBuffer()));


        logger.log(`Processing video with effect: ${transformations.effect}`);

        // Process the video using FFmpeg
        await new Promise<void>((resolve, reject) => {
            let lastLogTime = 0;
            const THROTTLE_INTERVAL = 30000;
            let filterCommand: string;
            switch (transformations.effect) {
                case 'sepia':
                    filterCommand = 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0';
                    break;
                case 'grayscale':
                    filterCommand = 'format=gray';
                    break;
                case 'vignette':
                    filterCommand = 'vignette=PI/4';
                    break;
                case 'blur':
                    filterCommand = 'gblur=sigma=2';
                    break;
                default:
                    filterCommand = '';
            }

            ffmpeg(inputPath)
                .videoFilter(filterCommand)
                .outputOptions([
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '23',
                    '-movflags', '+faststart',
                    '-pix_fmt', 'yuv420p',
                    '-profile:v', 'main',
                    '-f', 'mp4'
                ])
                .on('progress', (progress: FFmpegProgress) => {
                    const now = Date.now();
                    if (now - lastLogTime >= THROTTLE_INTERVAL) {
                        logger.log(
                            'FFmpeg Progress:\n' +
                            `  Progress: ${progress.percent?.toFixed(1) || 'unknown'}%\n` +
                            `  Frames: ${progress.frames}\n` +
                            `  FPS: ${progress.currentFps}\n` +
                            `  Speed: ${progress.currentKbps} kbps\n` +
                            `  Size: ${(progress.targetSize / 1024).toFixed(2)} MB\n` +
                            `  Time: ${progress.timemark}`
                        );
                        lastLogTime = now;
                    }
                })
                .output(outputPath)
                .on('end', () => {
                    logger.log('Processing: complete');
                    resolve();
                })
                .on('error', (err: Error) => {
                    logger.error(`Processing failed: ${err.message}`);
                    reject(err);
                })
                .run();
        });

        logger.log(`Video processed, uploading result`);

        // Upload the processed video
        const processedPath = `${userId}/processed/${Date.now()}-${videoTitle}.mp4`;
        const { error: uploadError } = await createClient<Database>(
            process.env.SUPABASE_PROJECT_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        )
            .storage
            .from('videos')
            .upload(processedPath, await fs.promises.readFile(outputPath), {
                contentType: 'video/mp4',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Failed to upload processed video: ${uploadError.message}`);
        }

        // Update the database
        const { error: updateError } = await createClient<Database>(
            process.env.SUPABASE_PROJECT_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        )
            .from('transformations')
            .update({ video_transformed_path: processedPath, status: 'completed' })
            .eq('video_source_path', videoPath);

        if (updateError) {
            throw new Error(`Failed to update transformation record: ${updateError.message}`);
        }

        // Cleanup temporary files
        await fs.promises.unlink(inputPath);
        await fs.promises.unlink(outputPath);
        logger.log(`Temporary files cleaned up`);

        return {
            message: `Video processed successfully: ${processedPath}`,
            processedPath
        };
    },
});