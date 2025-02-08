'use client'

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { Effect } from '@/components/video/effects'
import type { transformVideo } from '@/trigger/tasks'
import type { TransformVideoStatus } from '@/lib/metadataStore'

// These types should match your trigger task
interface TransformVideoOutput {
  url: string;
  fps: number;
  speed: number;
  frames: number;
  size: number;
  timemark: string;
}

interface TransformVideoMetadata {
  progress: number;
  fps?: number;
  speed?: number;
  frames?: number;
  timemark?: string;
}

interface TransformationStatus {
  state: "pending" | "running" | "completed" | "failed";
  progress: number;
  output?: string;
  fps?: number;
  speed?: number;
  frames?: number;
  size?: number;
  timemark?: string;
}

/**
 * Hook that subscribes to the video processing task and returns the status and output.
 * Uses the `useRealtimeRun` hook to subscribe to the task.
 */
export function useTransformationManager(id?: string) {
  const { run, error } = useRealtimeRun<typeof transformVideo>(id);

  const status: TransformationStatus = {
    state: run?.status === "COMPLETED" ? "completed" : 
           run?.status === "EXECUTING" ? "running" : "pending",
    progress: 0,
    output: run?.output?.processedPath,
    fps: Number(run?.metadata?.currentFps) || undefined,
    speed: Number(run?.metadata?.currentKbps) || undefined,
    frames: Number(run?.metadata?.frames) || undefined,
    size: Number(run?.metadata?.targetSize) || undefined,
    timemark: run?.metadata?.timemark?.toString()
  };

  if (run?.metadata) {
    status.progress = Number(run.metadata.progress) || 0;
  }

  return { status, error, run };
} 