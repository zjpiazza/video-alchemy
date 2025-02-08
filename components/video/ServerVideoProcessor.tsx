'use client'

import { useEffect } from 'react'
import { useVideoProcessing } from './VideoProcessingContext'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { useTransformationManager } from '@/hooks/useTransformationManager'
import { TriggerProvider } from "@trigger.dev/react"
import type { Effect } from './effects'
import { UploadStage, ProcessingStage, CompleteStage } from './stages'

interface ServerVideoProcessorProps {
  video: File | null
  previewUrl: string | null
  effect: Effect
  onFileSelect: (file: File) => void
  onEffectChange: (effect: Effect) => void
}

export function ServerVideoProcessor(props: ServerVideoProcessorProps) {
  return (
    <TriggerProvider publicApiKey={process.env.NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY!}>
      <ServerVideoProcessorInner {...props} />
    </TriggerProvider>
  )
}

function ServerVideoProcessorInner({
  video,
  previewUrl,
  effect,
  onFileSelect,
  onEffectChange
}: ServerVideoProcessorProps) {
  const { stage, setStage, processedVideoUrl, transformation, accessToken } = useVideoProcessing()
  const { uploadToStorage } = useVideoUpload()
  const { createTransformation } = useTransformationManager()

  const handleProcess = async () => {
    if (!video) return
    
    try {
      setStage('processing')
      const fileName = await uploadToStorage(video)
      await createTransformation(fileName, effect)
    } catch (error) {
      console.error('Error:', error)
      setStage('upload')
    }
  }

  return (
    <>
      {stage === 'upload' && (
        <UploadStage
          onFileSelect={onFileSelect}
          mode="server"
          previewUrl={previewUrl}
          effect={effect}
          onEffectChange={onEffectChange}
          onProcess={handleProcess}
        />
      )}
      
      {stage === 'processing' && accessToken && transformation?.id ? (
        <ProcessingStage mode="server" />
      ) : stage === 'processing' && (
        <ProcessingStage mode="server" />
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