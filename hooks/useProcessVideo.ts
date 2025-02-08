"use client";

import { parseStatus } from "@/lib/metadataStore";
import { videoTransform } from "@/trigger/tasks";
import { useRealtimeRun } from "@trigger.dev/react-hooks";


interface TransformVideoStatus {
  state: "running" | "completed";
  progress: number;
  label: string;
  output?: string;
  // FFmpeg progress details
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent: number;
}


/**
 * Hook that subscribes to the generateFunctionDocs task and returns the status and output of the task.
 *
 * Uses the `useRealtimeRun` hook to subscribe to the task.
 *
 * See more about the `useRealtimeRun` hook in the [Trigger docs](https://trigger.dev/docs/frontend/react-hooks#userealtimerun).
 *
 * @param id the run id of the generateFunctionDocs task
 */
export function useTransformVideo(id: string) {
  const { run, error } = useRealtimeRun(id);


  const status: TransformVideoStatus = {
    state: run?.status === "COMPLETED" ? "completed" : "running",
    progress: 0,
    label: "Initializing...",
    output: run?.output?.result ?? undefined,
    // Default FFmpeg values
    frames: 0,
    currentFps: 0,
    currentKbps: 0,
    targetSize: 0,
    timemark: "00:00:00",
    percent: 0
  };


  // Parse metadata if available
  if (run?.metadata) {
    const parsedStatus = parseStatus(run.metadata);
    Object.assign(status, parsedStatus);
  }

  return {
    status,
    error,
    run,
  };
}