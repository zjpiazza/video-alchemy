'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ProcessingModeSelector } from './ProcessingModeSelector'
import { ProcessingDescription } from './ProcessingDescription'
import { ClientVideoProcessor } from './ClientVideoProcessor'
import { ServerVideoProcessor } from './ServerVideoProcessor'
import { VideoProcessingProvider } from './VideoProcessingContext'
import type { ProcessingMode, ProcessingStage } from './types'
import type { Effect } from './effects'
import { useToast } from '@/hooks/use-toast'

interface VideoProcessorProps {
  serverProcessingEnabled: boolean
}

export function VideoProcessor({ serverProcessingEnabled }: VideoProcessorProps) {
  const [mode, setMode] = useState<ProcessingMode>('client')
  const [video, setVideo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [effect, setEffect] = useState<Effect>('none')
  const { toast } = useToast()

  const handleModeChange = (newMode: ProcessingMode) => {
    if (!serverProcessingEnabled && newMode === 'server') {
      toast({
        title: "Server Processing Unavailable",
        description: "Please sign in to use server-side processing",
        variant: "destructive"
      })
      return
    }
    setMode(newMode)
    setVideo(null)
    setPreviewUrl(null)
    setEffect('none')
  }

  const handleFileSelect = (file: File) => {
    setVideo(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <VideoProcessingProvider>
      <Card className="p-6">
        <ProcessingModeSelector 
          mode={mode}
          onModeChange={handleModeChange}
          serverDisabled={!serverProcessingEnabled}
        />

        <ProcessingDescription type={mode} />

        {mode === 'client' ? (
          <ClientVideoProcessor
            video={video}
            previewUrl={previewUrl}
            effect={effect}
            onFileSelect={handleFileSelect}
            onEffectChange={setEffect}
          />
        ) : (
          <ServerVideoProcessor
            video={video}
            previewUrl={previewUrl}
            effect={effect}
            onFileSelect={handleFileSelect}
            onEffectChange={setEffect}
          />
        )}
      </Card>
    </VideoProcessingProvider>
  )
}