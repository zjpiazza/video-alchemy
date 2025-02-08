export type ProcessingStage = 'upload' | 'processing' | 'complete'
export type ProcessingMode = 'client' | 'server'

export interface ClientProcessingMetrics {
  type: 'client'
  progress: number
  time: string
}

export interface ServerProcessingMetrics {
  type: 'server'
  progress: number
  time: string
  fps: number
  speed: number
  frames: number
  size: number
}

export type ProcessingMetrics = ClientProcessingMetrics | ServerProcessingMetrics

export interface TransformationStatus {
  id: string
  source_path: string
  transformed_path: string | null
  created_at: string
  user_id: string
  effect: string
  status: string
  progress: number
  frames: number
  fps: number
  speed: number
  time: string
  size: number
}

export interface UploadProgressState {
  bytesUploaded: number
  bytesTotal: number
  percentage: number
} 