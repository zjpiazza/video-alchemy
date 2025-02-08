import { metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";

// FFmpeg progress type
export const FFmpegProgress = z.object({
  progress: z.number(),
  frames: z.number(),
  currentFps: z.number(),
  currentKbps: z.number(),
  targetSize: z.number(),
  timemark: z.string(),
  percent: z.number(),
});

export type FFmpegProgress = z.infer<typeof FFmpegProgress>;

// UI status type
export const TransformVideoStatus = z.object({
  state: z.enum(["running", "completed"]),
  progress: z.number(),
  label: z.string(),
  output: z.string().optional(),
  // FFmpeg specific progress info
  frames: z.number(),
  currentFps: z.number(),
  currentKbps: z.number(),
  targetSize: z.number(),
  timemark: z.string(),
  percent: z.number(),
});

export type TransformVideoStatus = z.infer<typeof TransformVideoStatus>;

const TransformVideoMetadata = z.object({
  status: TransformVideoStatus,
});

type TransformVideoMetadata = z.infer<typeof TransformVideoMetadata>;

/**
 * Update the status of the generate function docs task. Wraps the `metadata.set` method.
 */
export function updateStatus(status: TransformVideoStatus) {
  // `metadata.set` can be used to update the status of the task
  // as long as `updateStatus` is called within the task's `run` function.
  metadata.set("status", status);
}

/**
 * Parse the status from the metadata.
 *
 * Used by the `useTransformVideo` hook to parse the status
 */
export function parseStatus(data: unknown): TransformVideoStatus {
  return TransformVideoMetadata.parse(data).status;
}