export type VideoSource = "local" | "server"

export interface VideoFile {
  id: string
  name: string
  type: string
  size: number
  url: string // Object URL for local files or server URL for uploaded files
  source: VideoSource
}

export interface TransformationProgress {
  stage: "uploading" | "processing" | "downloading"
  percent: number
  message?: string
}

export type TransformationStatus = "idle" | "preparing" | "processing" | "completed" | "failed"

export interface TransformationResult {
  id: string
  outputUrl: string
  thumbnailUrl?: string
  metadata?: {
    duration: number
    width: number
    height: number
    format: string
  }
}

export interface TransformationError {
  message: string
  code?: string
  details?: string
}

export interface TransformationEffect {
  id: string
  name: string
  description: string
  icon: string
  category: "filter" | "resize" | "trim" | "convert" | "audio" | "advanced"
  clientSupported: boolean
  serverSupported: boolean
  defaultParams: Record<string, any>
}

export interface TransformationConfig {
  effectId: string
  params: Record<string, any>
}
