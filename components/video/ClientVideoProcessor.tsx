'use client'

import { useVideoProcessing } from './VideoProcessingContext'
import { useClientVideoProcessing } from '@/hooks/useClientVideoProcessing'
import type { Effect } from './effects'
import { UploadStage, ProcessingStage, CompleteStage } from './stages'

interface ClientVideoProcessorProps {
  video: File | null
  previewUrl: string | null
  effect: Effect
  onFileSelect: (file: File) => void
  onEffectChange: (effect: Effect) => void
}

export function ClientVideoProcessor({
  video,
  previewUrl,
  effect,
  onFileSelect,
  onEffectChange
}: ClientVideoProcessorProps) {
  const { stage, setStage, processedVideoUrl } = useVideoProcessing()
  const { processVideo } = useClientVideoProcessing()

  const handleProcess = async () => {
    if (!video) return
    await processVideo(video, effect)
  }

  return (
    <>
      {stage === 'upload' && (
        <UploadStage
          onFileSelect={onFileSelect}
          mode="client"
          previewUrl={previewUrl}
          effect={effect}
          onEffectChange={onEffectChange}
          onProcess={handleProcess}
        />
      )}
      
      {stage === 'processing' && (
        <ProcessingStage mode="client" />
      )}
      
      {stage === 'complete' && processedVideoUrl && video && (
        <CompleteStage
          videoUrl={processedVideoUrl}
          originalFileName={video.name}
          onRestart={() => setStage('upload')}
        />
      )}
    </>
  )
} 