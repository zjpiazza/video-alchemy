'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { useToast } from '@/hooks/use-toast'
import { useVideoProcessing } from '@/components/video/VideoProcessingContext'
import type { Effect } from '@/components/video/effects'
import { getFFmpegFilterCommand } from '@/components/video/effects'

export function useClientVideoProcessing() {
  const [isFFmpegReady, setIsFFmpegReady] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const { toast } = useToast()
  const { setProcessedVideoUrl, setProcessingMetrics, setStage } = useVideoProcessing()

  const initFFmpeg = useCallback(async () => {
    try {
      if (ffmpegRef.current) {
        setIsFFmpegReady(true)
        return
      }

      const ffmpeg = new FFmpeg()
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      
      ffmpeg.on('progress', (event) => {
        const progressValue = Math.min(100, Math.max(0, Math.round(event.progress * 100)))
        setProcessingMetrics({
          type: 'client',
          progress: progressValue,
          time: String(event.time || '00:00:00')
        })
      })

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      })

      ffmpegRef.current = ffmpeg
      setIsFFmpegReady(true)
    } catch (error) {
      console.error('Error initializing FFmpeg:', error)
      toast({ 
        title: "Error", 
        description: "Failed to initialize video processor" 
      })
      setIsFFmpegReady(false)
    }
  }, [toast, setProcessingMetrics])

  useEffect(() => {
    initFFmpeg()
  }, [initFFmpeg])

  const processVideo = async (video: File, effect: Effect) => {
    if (!ffmpegRef.current || !isFFmpegReady) {
      toast({ 
        title: "Error", 
        description: "FFmpeg is not ready. Please try again.",
        variant: "destructive"
      })
      return
    }

    setStage('processing')
    
    try {
      const ffmpeg = ffmpegRef.current
      const inputFileName = 'input.mp4'
      const outputFileName = 'output.mp4'

      await ffmpeg.writeFile(inputFileName, await fetchFile(video))
      
      const filterCommand = getFFmpegFilterCommand(effect)
      await ffmpeg.exec([
        '-i', inputFileName,
        '-threads', '0',
        '-preset', 'ultrafast',
        ...(filterCommand ? filterCommand.split(' ') : []),
        outputFileName
      ])

      const data = await ffmpeg.readFile(outputFileName) as any
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      setProcessedVideoUrl(url)
      
      setStage('complete')

      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)
    } catch (error) {
      console.error('Processing error:', error)
      toast({ 
        title: "Error", 
        description: "Failed to process video",
        variant: "destructive"
      })
      setStage('upload')
    }
  }

  const terminate = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
    }
  }, [])

  return {
    isFFmpegReady,
    processVideo,
    terminate
  }
} 