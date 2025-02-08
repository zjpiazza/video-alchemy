'use client'

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import * as tus from 'tus-js-client'
import { useTransformVideo } from '@/hooks/useProcessVideo'
import { generatePublicAccessToken } from "@/lib/trigger"
import type { Effect } from '@/components/video/effects'
import type { ProcessingStage, ProcessingMetrics, TransformationStatus, UploadProgressState } from '@/components/video/types'

export function useServerVideoProcessing({
  onStageChange,
  effect,
  video
}: {
  onStageChange: (stage: ProcessingStage) => void
  effect: Effect
  video: File | null
}) {
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0
  })
  const [transformation, setTransformation] = useState<TransformationStatus | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()
  
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    type: 'server',
    progress: 0,
    time: '00:00:00',
    fps: 0,
    speed: 0,
    frames: 0,
    size: 0
  })

  // Get transform status updates
  const transformHook = accessToken && transformation?.id 
    ? useTransformVideo(transformation.id.toString())
    : { status: null, error: null }

  const { status: transformStatus, error: transformError } = transformHook

  useEffect(() => {
    if (transformStatus) {
      setProcessingMetrics({
        type: 'server',
        progress: transformStatus.progress || 0,
        time: transformStatus.timemark || '00:00:00',
        fps: transformStatus.currentFps || 0,
        speed: transformStatus.currentKbps || 0,
        frames: transformStatus.frames || 0,
        size: transformStatus.targetSize || 0
      })

      if (transformStatus.state === 'completed' && transformStatus.output) {
        setProcessedVideoUrl(transformStatus.output)
        onStageChange('complete')
      }
    }
  }, [transformStatus, onStageChange])

  const uploadToStorage = async (file: File, fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session found')

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'videos',
          objectName: fileName,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: (error) => {
          console.error('Upload failed:', error)
          reject(error)
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
          setUploadProgress({
            bytesUploaded,
            bytesTotal,
            percentage: parseFloat(percentage)
          })
        },
        onSuccess: () => {
          console.log('Upload completed')
          resolve(fileName)
        },
      })

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0])
        }
        upload.start()
      })
    })
  }

  const processVideo = async () => {
    if (!video) return
    
    try {
      setIsUploading(true)
      onStageChange('processing')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `${user.id}/original/${uuidv4()}.mp4`
      await uploadToStorage(video, fileName)
      
      const { data: transformData } = await supabase
        .from('transformations')
        .insert([{
          source_path: fileName,
          effect: effect,
          status: 'pending',
          user_id: user.id
        }])
        .select()
        .single()

      setTransformation(transformData)
      
      // Get access token for real-time updates
      if (transformData?.id) {
        const token = await generatePublicAccessToken(transformData.id.toString())
        setAccessToken(token)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ 
        title: "Error", 
        description: "Failed to process video",
        variant: "destructive"
      })
      onStageChange('upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = useCallback(() => {
    onStageChange('upload')
    toast({ title: "Cancelled", description: "Video processing cancelled" })
  }, [onStageChange, toast])

  return {
    processedVideoUrl,
    isUploading,
    uploadProgress,
    transformation,
    accessToken,
    processingMetrics,
    processVideo,
    handleCancel
  }
} 