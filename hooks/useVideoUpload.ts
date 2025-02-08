'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import * as tus from 'tus-js-client'
import type { UploadProgressState } from '@/components/video/types'

export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0
  })
  const supabase = createClient()

  const uploadToStorage = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session found')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileName = `${user.id}/original/${uuidv4()}.mp4`

    setIsUploading(true)

    try {
      await new Promise((resolve, reject) => {
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
          onError: reject,
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
            setUploadProgress({
              bytesUploaded,
              bytesTotal,
              percentage: parseFloat(percentage)
            })
          },
          onSuccess: () => resolve(fileName),
        })

        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
          }
          upload.start()
        })
      })

      return fileName
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    uploadProgress,
    uploadToStorage
  }
} 