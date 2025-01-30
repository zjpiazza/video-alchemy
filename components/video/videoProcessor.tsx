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

// Mode selector component
function ProcessingModeSelector({ 
  mode, 
  onModeChange,
  disabled
}: { 
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void 
  disabled: boolean
}) {
  return (
    <div className="mb-12">
      <Tabs 
        value={mode}
        onValueChange={(value) => onModeChange(value as ProcessingMode)}
        className="mb-6"
        disabled={disabled}
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
            disabled={disabled}
          >
            <Server className="h-4 w-4" />
            Server Processing
          </TabsTrigger>
        </TabsList>
      </Tabs>
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
    <motion.div
      variants={fadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        opacity: { duration: 0.2 }
      }}
      className="absolute w-full"
    >
      <div className="space-y-6">
        {!previewUrl ? (
          <div 
            {...getRootProps()} 
            className={cn(
              "drop-zone rounded-lg p-8 text-center cursor-pointer transition-colors min-h-[400px]",
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
            >
              <video 
                src={previewUrl} 
                controls 
                className="w-full rounded-lg aspect-video"
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
    </motion.div>
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
    <motion.div
      variants={fadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        opacity: { duration: 0.2 }
      }}
      className="absolute w-full"
    >
      <div className="space-y-6">
        <LoadingAnimation />
        
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
    </motion.div>
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
    <motion.div
      variants={fadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        opacity: { duration: 0.2 }
      }}
      className="absolute w-full"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <video 
            src={videoUrl} 
            controls 
            className="w-full rounded-lg aspect-video"
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
    </motion.div>
  )
}

export default function VideoProcessor() {
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

  const goToStage = (newStage: ProcessingStage) => {
    if (newStage === 'upload') {
      resetState()
    }
    setStage(newStage)
  }

  const handleModeChange = (newMode: ProcessingMode) => {
    setMode(newMode)
    resetState()
  }

  const resetState = useCallback(() => {
    setVideo(null)
    setPreviewUrl(null)
    setEffect('none')
    setProcessedVideoUrl(null)
    setProcessingMetrics({
      type: 'client',
      progress: 0,
      time: '00:00:00'
    })
    setTransformation(null)
    setIsUploading(false)
    setIsProcessing(false)
    setUploadProgress({
      bytesUploaded: 0,
      bytesTotal: 0,
      percentage: 0
    })
  }, [])

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

  const processVideo = async () => {
    if (!video) return
    
    goToStage('processing')
    setIsProcessing(true)
    
    if (mode === 'client') {
      if (!ffmpegRef.current) {
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
    } else {
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

  const initFFmpeg = useCallback(async () => {
    try {
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
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      })
      
      ffmpegRef.current = ffmpeg
    } catch (error) {
      console.error('Error initializing FFmpeg:', error)
      toast({ 
        title: "Error", 
        description: "Failed to initialize video processor" 
      })
    }
  }, [toast])

  // Initialize FFmpeg for client-side processing
  useEffect(() => {
    if (!ffmpegRef.current) {
      initFFmpeg()
    }
  }, [initFFmpeg])

  // Subscribe to server-side transformation updates
  useEffect(() => {
    if (mode === 'server' && transformation) {
      console.log('Setting up subscription for transformation:', transformation.id) // Debug log

      const channel = supabase
        .channel(`transformation-${transformation.id}`) // Give unique channel name
        .on('postgres_changes', {
          event: '*', // Listen to all events to debug
          schema: 'public',
          table: 'transformations',
          filter: `id=eq.${transformation.id}`,
        }, async (payload: any) => {
          console.log('Received update:', payload) // Debug log
          
          const newStatus = payload.new as TransformationStatus
          setTransformation(newStatus)
          
          // Update processing metrics from transformation status
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

      channel.subscribe((status) => {
        console.log('Subscription status:', status) // Debug log
      })

      return () => {
        console.log('Cleaning up subscription') // Debug log
        supabase.removeChannel(channel)
      }
    }
  }, [mode, transformation?.id, supabase, goToStage])

  return (
    <Card className="p-6">
      <ProcessingModeSelector 
        mode={mode}
        onModeChange={handleModeChange}
        disabled={stage !== 'upload'}
      />

      <ProcessingDescription 
          type={mode}
        />

      <div className="relative h-[500px]">
        <AnimatePresence mode="wait">
          {stage === 'upload' && (
            <UploadStage 
              onFileSelect={handleFileSelect}
              mode={mode}
              previewUrl={previewUrl}
              effect={effect}
              onEffectChange={setEffect}
              onProcess={processVideo}
            />
          )}
          
          {stage === 'processing' && (
            <ProcessingStage 
              mode={mode}
              metrics={processingMetrics}
              isUploading={isUploading}
              uploadProgress={uploadProgress.percentage}
              transformation={transformation}
              onCancel={handleCancel}
            />
          )}
          
          {stage === 'complete' && processedVideoUrl && video && (
            <CompleteStage 
              videoUrl={processedVideoUrl}
              originalFileName={video.name}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
        </div>
    </Card>
  )
}