'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Effect } from './effects'
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Wand2, X, ChevronDown, ChevronUp, Upload, Laptop, Server } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EffectSelector from './effectSelector'
import { getFFmpegFilterCommand } from './effects'
import { cn } from "@/lib/utils"
import { ProcessingStats } from './ProcessingStats'
import { ProcessingDescription } from './ProcessingDescription'
import { VideoPlaceholder } from './VideoPlaceholder'

type ProcessingMode = 'client' | 'server'

interface VideoProcessorProps {}

interface ProcessingMetrics {
  progress: number
  fps: number
  time: string
  bitrate: string
  speed: string
}

interface TransformationStatus {
  id: string
  video_source_path: string
  video_transformed_path: string | null
  created_at: string
  user_id: string
  effect: string
  status: string
}

export default function VideoProcessor({}: VideoProcessorProps) {
  // Add mode state
  const [mode, setMode] = useState<ProcessingMode>('client')
  
  // Shared state
  const [video, setVideo] = useState<File | null>(null)
  const [effect, setEffect] = useState<Effect>('none')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Client-side processing state
  const [loaded, setLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ffmpegRef] = useState<{ current: FFmpeg | null }>({ current: null })
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    progress: 0,
    fps: 0,
    time: '00:00:00',
    bitrate: '0 kbits/s',
    speed: '0',
  })
  const [ffmpegLogs, setFfmpegLogs] = useState<string[]>([])
  const [isDebugExpanded, setIsDebugExpanded] = useState(false)

  // Server-side processing state
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [currentTransformation, setCurrentTransformation] = useState<TransformationStatus | null>(null)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)

  // Add reset function for mode switching
  const resetState = useCallback(() => {
    setVideo(null)
    setEffect('none')
    setPreviewUrl(null)
    setProcessing(false)
    setFfmpegLogs([])
    setIsUploading(false)
    setUploadProgress(0)
    setUploadedPath(null)
    setCurrentTransformation(null)
    setProcessedVideoUrl(null)
    setProcessingMetrics({
      progress: 0,
      fps: 0,
      time: '00:00:00',
      bitrate: '0 kbits/s',
      speed: '0',
    })
  }, [])

  // Add mode change handler
  const handleModeChange = useCallback((newMode: ProcessingMode) => {
    resetState()
    setMode(newMode)
  }, [resetState])

  // Initialize FFmpeg for client-side processing
  useEffect(() => {
    if (mode === 'client') {
      const initFFmpeg = async () => {
        try {
          const ffmpeg = new FFmpeg()
          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
          
          ffmpeg.on('progress', ({ progress, time }) => {
            const progressValue = Math.min(100, Math.max(0, Math.round(progress * 100)))
            setProcessingMetrics(prev => ({
              ...prev,
              progress: progressValue,
              time: new Date(time * 1000).toISOString().substr(11, 8)
            }))
          })

          ffmpeg.on('log', ({ message }) => {
            setFfmpegLogs(prev => [...prev, message])
            
            const fpsMatch = message.match(/fps=\s*([0-9.]+)/)
            const bitrateMatch = message.match(/bitrate=\s*([0-9.]+ ?[km]bits\/s)/)
            const speedMatch = message.match(/speed=\s*([0-9.]+)x/)
            
            setProcessingMetrics(prev => ({
              ...prev,
              fps: fpsMatch ? parseFloat(fpsMatch[1]) : prev.fps,
              bitrate: bitrateMatch ? bitrateMatch[1] : prev.bitrate,
              speed: speedMatch ? speedMatch[1] : prev.speed,
            }))
          })
          
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
          })
          
          ffmpegRef.current = ffmpeg
          setLoaded(true)
        } catch (error) {
          console.error('Error initializing FFmpeg:', error)
          toast({ 
            title: "Error", 
            description: "Failed to initialize video processor" 
          })
        }
      }

      initFFmpeg()
    }
  }, [mode, toast])

  // Handle file selection
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] }
  })

  // Server-side processing functions
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
        .insert([{
          video_source_path: videoPath,
          video_title: video?.name,
          effect: effect,
          status: 'pending',
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error
      setCurrentTransformation(data)
    } catch (error) {
      console.error('Error:', error)
      toast({ title: "Error", description: "Failed to start transformation" })
    }
  }

  // Client-side processing functions
  const processVideoClient = async () => {
    if (!video || !ffmpegRef.current) return

    try {
      setProcessing(true)
      setFfmpegLogs([])
      const ffmpeg = ffmpegRef.current
      const inputFileName = 'input.mp4'
      const outputFileName = 'output.mp4'

      await ffmpeg.writeFile(inputFileName, await fetchFile(video))

      const filterCommand = getFFmpegFilterCommand(effect)
      const command = [
        '-i', inputFileName,
        '-threads', '0',
        '-preset', 'ultrafast',
        ...(filterCommand ? filterCommand.split(' ') : []),
        outputFileName
      ]

      await ffmpeg.exec(command)

      const data = await ffmpeg.readFile(outputFileName) as any
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setProcessedVideoUrl(url)
      setPreviewUrl(url)
      
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)
      
      toast({ title: "Success", description: "Video processed successfully!" })
    } catch (error) {
      console.error('Processing error:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to process video",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const cancelProcessing = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
      setProcessing(false)
      toast({ title: "Cancelled", description: "Video processing cancelled" })
    }
  }, [toast])

  // Add getSignedUrl function inside component
  const getSignedUrl = useCallback(async (path: string) => {
    try {

      console.log('Getting signed URL for:', path)
      const { data: { signedUrl }, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(path, 3600) // 1 hour expiry

      if (error) throw error
      return signedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return null
    }
  }, [supabase.storage])

  // Update server-side transformation subscription
  useEffect(() => {
    if (mode === 'server' && currentTransformation) {
      const channel = supabase
        .channel('transformations')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'transformations',
          filter: `id=eq.${currentTransformation.id}`,
        }, async (payload: any) => {
          const newStatus = payload.new as TransformationStatus
          setCurrentTransformation(newStatus)
          if (newStatus.status === 'completed' && newStatus.video_transformed_path) {
            const url = await getSignedUrl(newStatus.video_transformed_path)
            if (url) setProcessedVideoUrl(url)
            toast({ title: "Success", description: "Video processed successfully!" })
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [mode, currentTransformation?.id, supabase, getSignedUrl, toast])

  return (
    <Card className="p-6">
      <Tabs 
        defaultValue="client" 
        className="mb-6"
        onValueChange={(value) => handleModeChange(value as ProcessingMode)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            Client Processing
          </TabsTrigger>
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Server Processing
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ProcessingDescription type={mode} />
      
      <div 
        {...getRootProps()} 
        className={cn(
          "drop-zone rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:border-opacity-50",
          isDragActive && "border-primary border-opacity-100"
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-foreground">Drop the video here ...</p>
        ) : (
          <p className="text-muted-foreground">Drag & drop a video here, or click to select one</p>
        )}
      </div>

      <div className="mt-4">
        {previewUrl ? (
          mode === 'server' ? (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="transformed" disabled={!processedVideoUrl}>
                  Transformed
                </TabsTrigger>
              </TabsList>
              <TabsContent value="original">
                <video src={previewUrl} controls className="w-full rounded-lg aspect-video" />
              </TabsContent>
              <TabsContent value="transformed">
                {processedVideoUrl ? (
                  <video src={processedVideoUrl} controls className="w-full rounded-lg aspect-video" />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Process the video to see the transformation
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <video 
              ref={videoRef}
              src={previewUrl} 
              controls 
              className="w-full rounded-lg aspect-video"
              onError={(e) => {
                console.error('Video playback error:', e)
                toast({ 
                  title: "Error", 
                  description: "Failed to play video", 
                  variant: "destructive" 
                })
              }}
            />
          )
        ) : (
          <VideoPlaceholder />
        )}
      </div>

      {video && (
        <div className="mt-4 space-y-4 bg-card p-4 rounded-lg border">
          <EffectSelector 
            value={effect} 
            onChange={(value) => setEffect(value as Effect)}
          />

          {mode === 'server' && !uploadedPath ? (
            <Button 
              onClick={uploadVideo} 
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          ) : (
            <div className="flex gap-2">
              {processing ? (
                <Button 
                  onClick={cancelProcessing}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Processing
                </Button>
              ) : (
                <Button 
                  onClick={mode === 'client' ? processVideoClient : startTransformation}
                  disabled={!loaded || effect === 'none' || (mode === 'server' && !uploadedPath)}
                  className="w-full"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Apply Effect
                </Button>
              )}
            </div>
          )}

          {mode === 'client' && processing && (
            <div className="space-y-4">
              <ProcessingStats stats={processingMetrics} />

              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDebugExpanded(!isDebugExpanded)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full justify-between"
                >
                  Debug Logs
                  {isDebugExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                
                {isDebugExpanded && (
                  <div className="mt-2 p-2 bg-muted rounded-md font-mono text-xs max-h-40 overflow-y-auto">
                    {ffmpegLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap text-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'server' && (
            <>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {currentTransformation && (
                <div className="text-sm text-center text-muted-foreground">
                  Status: {currentTransformation.status}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  )
}