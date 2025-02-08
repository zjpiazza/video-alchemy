'use client'

import { createContext, useContext, useState } from 'react'
import type { ProcessingStage, ProcessingMetrics, TransformationStatus } from './types'

interface VideoProcessingState {
  stage: ProcessingStage
  processedVideoUrl: string | null
  transformation: TransformationStatus | null
  processingMetrics: ProcessingMetrics
  accessToken: string | null
}

interface VideoProcessingContextType extends VideoProcessingState {
  setStage: (stage: ProcessingStage) => void
  setProcessedVideoUrl: (url: string | null) => void
  setTransformation: (transformation: TransformationStatus | null) => void
  setProcessingMetrics: (metrics: ProcessingMetrics) => void
  setAccessToken: (token: string | null) => void
}

const VideoProcessingContext = createContext<VideoProcessingContextType | null>(null)

export function VideoProcessingProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<ProcessingStage>('upload')
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [transformation, setTransformation] = useState<TransformationStatus | null>(null)
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    type: 'server',
    progress: 0,
    time: '00:00:00',
    fps: 0,
    speed: 0,
    frames: 0,
    size: 0
  })
  const [accessToken, setAccessToken] = useState<string | null>(null)

  return (
    <VideoProcessingContext.Provider value={{
      stage,
      setStage,
      processedVideoUrl,
      setProcessedVideoUrl,
      transformation,
      setTransformation,
      processingMetrics,
      setProcessingMetrics,
      accessToken,
      setAccessToken,
    }}>
      {children}
    </VideoProcessingContext.Provider>
  )
}

export const useVideoProcessing = () => {
  const context = useContext(VideoProcessingContext)
  if (!context) {
    throw new Error('useVideoProcessing must be used within a VideoProcessingProvider')
  }
  return context
} 