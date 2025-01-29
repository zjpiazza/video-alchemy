'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { effects, Effect } from './effects'
import { v4 as uuidv4 } from 'uuid'
import EffectSelector from './effectSelector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TransformationStatus {
  id: string
  video_source_path: string
  video_transformed_path: string | null
  created_at: string
  user_id: string
  effect: string
  status: string
}

export default function ServerVideoProcessor() {
  const [video, setVideo] = useState<File | null>(null)
  const [effect, setEffect] = useState<Effect>('none')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [currentTransformation, setCurrentTransformation] = useState<TransformationStatus | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user?.id)
    }
    getUser()
  }, [supabase.auth])

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0]

      if (file.type.startsWith('video/')) {
        setVideo(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        toast({ title: "Error", description: "Please upload a video file" })
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] }
  })

  const uploadVideo = async () => {
    if (!video) return

    try {
      setIsUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `${user.id}/original/${uuidv4()}.mp4`
      
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, video, {
          // TODO: Add type for progress
          onUploadProgress: (progress: any) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })


      if (error) throw error
      
      setUploadedPath(data.path)
      await startTransformation(data.path)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to upload video" })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const startTransformation = async (videoPath: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('transformations')
        .insert([
          {
            video_source_path: videoPath,
            video_title: video?.name,
            effect: effect,
            status: 'pending',
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      setCurrentTransformation(data)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to start transformation" })
    }
  }

  const getProcessedVideoUrl = async (path: string) => {
    try {
      const { data: { publicUrl }, error } = supabase.storage
        .from('videos')
        .getPublicUrl(`processed/${path}`)
      
      if (error) throw error
      return publicUrl
    } catch (error) {
      console.error('Error getting video URL:', error)
      return null
    }
  }

  useEffect(() => {
    if (!currentTransformation) return

    const channel = supabase
      .channel('transformations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transformations',
        filter: `id=eq.${currentTransformation.id}`,
        // TODO: Add type for payload
      }, async (payload: any) => {
        const newStatus = payload.new as TransformationStatus
        setCurrentTransformation(newStatus)
        if (newStatus.status === 'completed' && newStatus.video_transformed_path) {

          const url = await getProcessedVideoUrl(newStatus.video_transformed_path)
          setProcessedVideoUrl(url)
          toast({ title: "Success", description: "Video processed successfully!" })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentTransformation?.id, supabase, toast])

  return (
    <Card className="p-6">
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the video here ...</p>
        ) : (
          <p>Drag & drop a video here, or click to select one</p>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4">
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger 
                value="transformed"
                disabled={!processedVideoUrl}
              >
                Transformed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="original">
              <video src={previewUrl} controls className="w-full rounded-lg" />
            </TabsContent>
            <TabsContent value="transformed">
              {processedVideoUrl ? (
                <video src={processedVideoUrl} controls className="w-full rounded-lg" />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Process the video to see the transformation
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {video && (
        <div className="mt-4 space-y-4 bg-gray-100 p-4 rounded-lg">
          <EffectSelector 
            value={effect} 
            onChange={(value) => setEffect(value as Effect)}
          />

          <Button 
            onClick={uploadVideo} 
            disabled={isUploading || effect === 'none'}
            className="w-full"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Process Video'}
          </Button>

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">
                Uploading: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {currentTransformation && (
            <div className="text-sm text-center text-gray-600">
              Status: {currentTransformation.status}
            </div>
          )}
        </div>
      )}

      {currentTransformation?.status === 'completed' && processedVideoUrl && (
        <div className="mt-4">
          <Button 
            onClick={() => window.open(processedVideoUrl, '_blank')}
            className="w-full"
            variant="outline"
          >
            Download Processed Video
          </Button>
        </div>
      )}
    </Card>
  )
}