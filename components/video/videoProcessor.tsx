'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Upload, Laptop, Server, Wand2 } from 'lucide-react'
import type { Effect } from './effects'
import { getFFmpegFilterCommand } from './effects'
import EffectSelector from './effectSelector'
import { cn } from "@/lib/utils"
import { ProcessingDescription } from './ProcessingDescription'
import { LoadingAnimation } from '@/components/loadingAnimation'
import { Progress } from '@/components/ui/progress'
import { ProcessingStats } from './ProcessingStats'
import * as tus from 'tus-js-client'


// Types
type ProcessingStage = 'upload' | 'processing' | 'complete'
type ProcessingMode = 'client' | 'server'


interface ClientProcessingMetrics {
  type: 'client'
  progress: number
  time: string
}

interface ServerProcessingMetrics {
  type: 'server'
  progress: number
  time: string
  fps: number
  speed: number
  frames: number
  size: number
}

type ProcessingMetrics = ClientProcessingMetrics | ServerProcessingMetrics

interface TransformationStatus {
  id: string
  video_source_path: string
  video_transformed_path: string | null
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

interface UploadProgressState {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
}

// Animation variants
const fadeVariants = {
  enter: {
    opacity: 0
  },
  center: {
    opacity: 1
  },
  exit: {
    opacity: 0
  }
}

// Add a consistent aspect ratio wrapper class
const VIDEO_CONTAINER_CLASS = "w-full aspect-video rounded-lg overflow-hidden bg-muted"

// Mode selector component
function ProcessingModeSelector({ 
  mode, 
  onModeChange,
  serverDisabled,
  disabled = false
}: { 
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void 
  serverDisabled: boolean
  disabled?: boolean
}) {
  return (
    <div className="mb-12">
      <Tabs 
        value={mode}
        onValueChange={(value) => onModeChange(value as ProcessingMode)}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="client" 
            className="flex items-center gap-2"
            disabled={disabled}
          >
            <Laptop className="h-4 w-4" />
            Client Processing
          </TabsTrigger>
          <TabsTrigger 
            value="server" 
            className="flex items-center gap-2"
            disabled={disabled || serverDisabled}
          >
            <Server className="h-4 w-4" />
            {serverDisabled ? (
              <div className="flex items-center gap-2">
                Server Processing
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">
                  Sign in required
                </span>
              </div>
            ) : (
              "Server Processing"
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {serverDisabled && mode === 'client' && (
        <div className="text-sm text-muted-foreground mt-2">
          <p>
            Sign in to unlock server-side processing for more demanding transformations 
            and higher quality outputs.
          </p>
        </div>
      )}
    </div>
  )
}

// Upload stage component
function UploadStage({ 
  onFileSelect, 
  mode,
  previewUrl,
  effect,
  onEffectChange,
  onProcess
}: { 
  onFileSelect: (file: File) => void
  mode: ProcessingMode
  previewUrl: string | null
  effect: Effect
  onEffectChange: (effect: Effect) => void
  onProcess: () => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) onFileSelect(acceptedFiles[0])
    },
    accept: { 'video/*': [] }
  })

  return (
    <div className="space-y-6">
      {!previewUrl ? (
        <div 
          {...getRootProps()} 
          className={cn(
            VIDEO_CONTAINER_CLASS,
            "drop-zone p-8 text-center cursor-pointer transition-colors",
            "border-2 border-dashed hover:border-primary",
            "flex flex-col items-center justify-center gap-4",
            isDragActive && "border-primary border-opacity-100"
          )}
        >
          <input {...getInputProps()} />
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-center"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {isDragActive ? "Drop the video here ..." : "Drag & drop a video here, or click to select one"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports MP4, WebM, and MOV formats
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={VIDEO_CONTAINER_CLASS}
          >
            <video 
              src={previewUrl} 
              controls 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <EffectSelector 
              value={effect}
              onChange={(value) => onEffectChange(value as Effect)}
            />
            
            <Button 
              onClick={onProcess}
              disabled={effect === 'none'}
              className="w-full"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Apply Effect
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Processing stage component
function ProcessingStage({
  mode,
  metrics,
  isUploading,
  uploadProgress,
  transformation,
  onCancel
}: {
  mode: ProcessingMode
  metrics: ProcessingMetrics
  isUploading: boolean
  uploadProgress: number
  transformation: TransformationStatus | null
  onCancel: () => void
}) {
  return (
    <div className="space-y-6">
      <div className={VIDEO_CONTAINER_CLASS}>
        <LoadingAnimation />
      </div>
      
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isUploading ? (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-muted-foreground">
              Uploading: {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : (
          <Card className="p-4">
            <div className="text-lg font-medium text-center">
              {mode === 'server' && transformation?.status === 'pending' 
                ? 'Video Queued for Processing'
                : 'Processing Video'
              }
            </div>
            {mode === 'server' && transformation?.status === 'pending' ? (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Your video is queued and will begin processing shortly...
              </p>
            ) : (
              <>
                <ProcessingStats stats={metrics} />
              </>
            )}
          </Card>
        )}
        
        <Button 
          variant="destructive"
          onClick={onCancel}
          className="w-full"
        >
          Cancel Processing
        </Button>
      </motion.div>
    </div>
  )
}

// Complete stage component
function CompleteStage({
  videoUrl,
  originalFileName,
  onRestart
}: {
  videoUrl: string
  originalFileName: string
  onRestart: () => void
}) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={VIDEO_CONTAINER_CLASS}
      >
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full object-contain"
        />
      </motion.div>
      
      <motion.div 
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button 
          onClick={() => {
            const link = document.createElement('a')
            link.href = videoUrl
            link.download = `transformed-${originalFileName}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          className="flex-1"
        >
          Download Video
        </Button>
        
        <Button 
          onClick={onRestart}
          variant="outline"
          className="flex-1"
        >
          Start New Transform
        </Button>
      </motion.div>
    </div>
  )
}

interface VideoProcessorProps {
  serverProcessingEnabled: boolean
}

export function VideoProcessor({ serverProcessingEnabled }: VideoProcessorProps) {
  const [stage, setStage] = useState<ProcessingStage>('upload')
  const [mode, setMode] = useState<ProcessingMode>('client')
  const [video, setVideo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [effect, setEffect] = useState<Effect>('none')
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)

  // Processing state
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    type: 'client',
    progress: 0,
    time: '00:00:00'
  })

  // Server-specific state
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0
  })
  const [transformation, setTransformation] = useState<TransformationStatus | null>(null)
  
  // FFmpeg initialization
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const { toast } = useToast()

  // Add loading state
  const [isFFmpegReady, setIsFFmpegReady] = useState(false)

  const resetState = useCallback(() => {
    setVideo(null)
    setPreviewUrl(null)
    setEffect('none')
    setProcessedVideoUrl(null)
    setProcessingMetrics(mode === 'client' 
      ? {
          type: 'client',
          progress: 0,
          time: '00:00:00'
        }
      : {
          type: 'server',
          progress: 0,
          time: '00:00:00',
          fps: 0,
          speed: 0,
          frames: 0,
          size: 0
        }
    )
    setTransformation(null)
    setIsUploading(false)
    setIsProcessing(false)
    setUploadProgress({
      bytesUploaded: 0,
      bytesTotal: 0,
      percentage: 0
    })
  }, [mode])

  const goToStage = useCallback((newStage: ProcessingStage) => {
    if (newStage === 'upload') {
      resetState()
    }
    setStage(newStage)
  }, [resetState])

  

  const handleModeChange = (newMode: ProcessingMode) => {
    // Force client mode if server processing is not enabled
    if (!serverProcessingEnabled && newMode === 'server') {
      toast({
        title: "Server Processing Unavailable",
        description: "Please sign in to use server-side processing",
        variant: "destructive"
      })
      return
    }
    setMode(newMode)
    resetState()
  }

  // Ensure we start in client mode if server processing is disabled
  useEffect(() => {
    if (!serverProcessingEnabled && mode === 'server') {
      setMode('client')
    }
  }, [serverProcessingEnabled, mode])



  const handleFileSelect = useCallback((file: File) => {
    setVideo(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const uploadToStorage = async (file: File, fileName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

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
          console.error('Upload failed:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress({
            bytesUploaded,
            bytesTotal,
            percentage: parseFloat(percentage)
          });
        },
        onSuccess: () => {
          console.log('Upload completed');
          resolve(fileName);
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  };

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
        setProcessingMetrics(prev => ({
          type: 'client',
          progress: progressValue,
          time: String(event.time || '00:00:00')
        }))
      })

      // Load FFmpeg first
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
  }, [toast])

  // Update the useEffect to handle the initialization
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpegRef.current) {
        await initFFmpeg()
      }
    }
    loadFFmpeg()
  }, [initFFmpeg])

  const processVideo = async () => {
    if (!video) return
    
    // Prevent server-side processing if not enabled
    if (mode === 'server' && !serverProcessingEnabled) {
      toast({ 
        title: "Server Processing Unavailable", 
        description: "Please sign in to use server-side processing",
        variant: "destructive"
      })
      return
    }

    // Reset metrics before starting new transformation
    setProcessingMetrics(mode === 'client' 
      ? {
          type: 'client',
          progress: 0,
          time: '00:00:00'
        }
      : {
          type: 'server',
          progress: 0,
          time: '00:00:00',
          fps: 0,
          speed: 0,
          frames: 0,
          size: 0
        }
    )
    
    goToStage('processing')
    setIsProcessing(true)
    
    if (mode === 'client') {
      if (!ffmpegRef.current || !isFFmpegReady) {  // Check both conditions
        toast({ 
          title: "Error", 
          description: "FFmpeg is not ready. Please try again.",
          variant: "destructive"
        })
        return
      }

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
        
        goToStage('complete')

        await ffmpeg.deleteFile(inputFileName)
        await ffmpeg.deleteFile(outputFileName)
      } catch (error) {
        console.error('Processing error:', error)
        toast({ 
          title: "Error", 
          description: "Failed to process video",
          variant: "destructive"
        })
        goToStage('upload')
      }
    } else if (mode === 'server' && serverProcessingEnabled) {
      try {
        setIsUploading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const fileName = `${user.id}/original/${uuidv4()}.mp4`
        await uploadToStorage(video, fileName)
        
        const { data: transformData } = await supabase
          .from('transformations')
          .insert([{
              video_source_path: fileName,
            effect: effect,
            status: 'pending',
            user_id: user.id
          }])
          .select()
          .single()

          setTransformation(transformData)
      } catch (error) {
        console.error('Error:', error)
        toast({ 
          title: "Error", 
          description: "Failed to process video",
          variant: "destructive"
        })
        goToStage('upload')
      } finally {
        setIsUploading(false)
      }
    }
    setIsProcessing(false)
  }

  const handleCancel = useCallback(() => {
    if (ffmpegRef.current && mode === 'client') {
      ffmpegRef.current.terminate()
    }
    goToStage('upload')
    toast({ title: "Cancelled", description: "Video processing cancelled" })
  }, [mode, toast, goToStage])

  const handleRestart = useCallback(() => {
    resetState()
    goToStage('upload')
  }, [resetState])

  // Subscribe to server-side transformation updates
  useEffect(() => {
    if (mode === 'server' && transformation) {
      console.log('Setting up subscription for transformation:', transformation.id)

      const channel = supabase
        .channel(`transformation-${transformation.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transformations',
          filter: `id=eq.${transformation.id}`,
        }, async (payload: any) => {
          console.log('Received update:', payload)
          
          const newStatus = payload.new as TransformationStatus
          setTransformation(newStatus)
          
          if (newStatus.status === 'processing') {
            setProcessingMetrics({
              type: 'server',
              progress: newStatus.progress || 0,
              time: newStatus.time || '00:00:00',
              fps: newStatus.fps || 0,
              speed: newStatus.speed || 0,
              frames: newStatus.frames || 0,
              size: newStatus.size || 0
            })
          }

          if (newStatus.status === 'completed' && newStatus.video_transformed_path) {
            const { data: { signedUrl } } = await supabase.storage
              .from('videos')
              .createSignedUrl(newStatus.video_transformed_path, 3600)
            
            if (signedUrl) {
              setProcessedVideoUrl(signedUrl)
              goToStage('complete')
            }
          }
        })

      channel.subscribe((status: { status: string }) => {
        console.log('Subscription status:', status)
      })

      return () => {
        console.log('Cleaning up subscription')
        supabase.removeChannel(channel)
      }
    }
  }, [mode, transformation, supabase, goToStage])

  return (
    <Card className="p-6">
      <ProcessingModeSelector 
        mode={mode}
        onModeChange={handleModeChange}
        serverDisabled={!serverProcessingEnabled}
      />

      <ProcessingDescription 
        type={mode}
      />

      <AnimatePresence mode="wait">
        {stage === 'upload' && (
          <motion.div
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ opacity: { duration: 0.2 } }}
          >
            <UploadStage 
              onFileSelect={handleFileSelect}
              mode={mode}
              previewUrl={previewUrl}
              effect={effect}
              onEffectChange={setEffect}
              onProcess={processVideo}
            />
          </motion.div>
        )}
        
        {stage === 'processing' && (
          <motion.div
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ opacity: { duration: 0.2 } }}
          >
            <ProcessingStage 
              mode={mode}
              metrics={processingMetrics}
              isUploading={isUploading}
              uploadProgress={uploadProgress.percentage}
              transformation={transformation}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
        
        {stage === 'complete' && processedVideoUrl && video && (
          <motion.div
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ opacity: { duration: 0.2 } }}
          >
            <CompleteStage 
              videoUrl={processedVideoUrl}
              originalFileName={video.name}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}