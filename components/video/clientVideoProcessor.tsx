'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Effect } from './VideoProcessor'
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import EffectSelector from './effectSelector'
import { getFFmpegFilterCommand } from './effects'
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils"
import { ProcessingStats } from './ProcessingStats'
import { ProcessingDescription } from './ProcessingDescription'
import { VideoPlaceholder } from './VideoPlaceholder'

interface ClientVideoProcessorProps {
  getSignedUrl: (path: string) => Promise<string | null>
}

interface ProcessingMetrics {
  progress: number
  fps: number
  time: string
  bitrate: string
  speed: string
}

export default function ClientVideoProcessor({ getSignedUrl }: ClientVideoProcessorProps) {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [video, setVideo] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [effect, setEffect] = useState<Effect>('none')
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ffmpegLogs, setFfmpegLogs] = useState<string[]>([])
  const [isDebugExpanded, setIsDebugExpanded] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    progress: 0,
    fps: 0,
    time: '00:00:00',
    bitrate: '0 kbits/s',
    speed: '0',
  })

  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg()
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        
        ffmpeg.on('progress', ({ progress, time }) => {
          const progressValue = Math.min(100, Math.max(0, Math.round(progress * 100)))
          setProgress(progressValue)
          setProcessingMetrics(prev => ({
            ...prev,
            progress: progressValue,
            time: new Date(time * 1000).toISOString().substr(11, 8)
          }))
        })

        ffmpeg.on('log', ({ message }) => {
          setFfmpegLogs(prev => [...prev, message])
          
          // Parse FFmpeg output for metrics
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
  }, [toast])

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl)
      if (processedUrl) URL.revokeObjectURL(processedUrl)
    }
  }, [originalUrl, processedUrl])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0]
      if (file.type.startsWith('video/')) {
        setVideo(file)
        // Cleanup previous URL
        if (originalUrl) URL.revokeObjectURL(originalUrl)
        const url = URL.createObjectURL(file)
        setOriginalUrl(url)
        setPreviewUrl(url)
      } else {
        toast({ title: "Error", description: "Please upload a video file" })
      }
    }
  }, [originalUrl, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] }
  })

  const processVideo = async () => {
    if (!video || !ffmpegRef.current) return

    try {
      setProcessing(true)
      setProgress(0)
      setFfmpegLogs([])
      const ffmpeg = ffmpegRef.current
      const inputFileName = 'input.mp4'
      const outputFileName = 'output.mp4'

      // Write input file
      await ffmpeg.writeFile(inputFileName, await fetchFile(video))

      const baseFlags = [
        '-threads', '0',
        '-preset', 'ultrafast',
      ]

      const filterCommand = getFFmpegFilterCommand(effect)
      const command = [
        '-i', inputFileName,
        ...baseFlags,
        ...(filterCommand ? filterCommand.split(' ') : []),
        outputFileName
      ]

      // Log the full command
      console.log('FFmpeg command:', command.join(' '))
      await ffmpeg.exec(command)

      // Read the file as in the example
      const data = await ffmpeg.readFile(outputFileName) as any
      
      if (!data) {
        throw new Error('No output data received from FFmpeg')
      }

      // Create blob using data.buffer as in the example
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      
      if (blob.size === 0) {
        throw new Error('Generated video is empty')
      }

      if (processedUrl) {
        URL.revokeObjectURL(processedUrl)
      }

      const url = URL.createObjectURL(blob)
      setProcessedUrl(url)
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
      setProgress(0)
    }
  }

  const cancelProcessing = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
      setProcessing(false)
      setProgress(0)
      toast({ title: "Cancelled", description: "Video processing cancelled" })
    }
  }, [toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo(file)
      // Create a local preview URL for the selected file
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
    }
  }

  return (
    <Card className="p-6">
      <ProcessingDescription type="client" />
      
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

      {previewUrl ? (
        <div className="mt-4">
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
        </div>
      ) : (
        <div className="mt-4">
          <VideoPlaceholder />
        </div>
      )}

      {video && (
        <div className="mt-4 space-y-4 bg-card p-4 rounded-lg border">
          <EffectSelector 
            value={effect} 
            onChange={(value) => setEffect(value as Effect)}
          />

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
                onClick={processVideo} 
                disabled={!loaded || effect === 'none'}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Apply Effect
              </Button>
            )}
          </div>

          {processing && (
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
        </div>
      )}
    </Card>
  )
}