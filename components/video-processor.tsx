'use client'
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useDropzone } from 'react-dropzone'

const SUPPORTED_FORMATS = {
  'video/mp4': 'mp4',
  'video/x-msvideo': 'avi',
} as const

const effects = {
  none: 'Original',
  sepia: 'Sepia',
  grayscale: 'Grayscale',
  vignette: 'Vignette',
  blur: 'Blur Effect',
}

export function VideoProcessor() {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [video, setVideo] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [effect, setEffect] = useState('none')
  const ffmpegRef = useRef(new FFmpeg())
  const messageRef = useRef<HTMLParagraphElement | null>(null)
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isTranscoding, setIsTranscoding] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const load = useCallback(async () => {
    if (loaded) return
    setIsLoading(true)
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
      const ffmpeg = ffmpegRef.current
      ffmpeg.on("progress", ({ progress }) => {
        const progressValue = Math.round(progress * 100)
        setProgress(progressValue)
        console.log('Progress:', progressValue)
      })
      ffmpeg.on("log", ({ message }) => {
        if (messageRef.current) messageRef.current.innerHTML = message
        console.log(message)
      })
      
      // Load FFmpeg with the correct configuration
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      })
      setLoaded(true)
    } catch (error) {
      console.error('Error loading FFmpeg:', error)
      toast({
        title: "Error",
        description: "Failed to load video processor: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [loaded, toast])

  useEffect(() => {
    load()
  }, [load])


  const transcodeForPreview = useCallback(async (file: File) => {
    setIsTranscoding(true)
    try {
      const ffmpeg = ffmpegRef.current
      const inputFileName = 'input.avi'
      const previewFileName = 'preview.mp4'

      await ffmpeg.writeFile(inputFileName, await fetchFile(file))
      
      // Transcode to MP4 with lower quality for preview
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-crf', '28', // Lower quality for preview
        '-preset', 'ultrafast',
        '-c:a', 'aac',
        '-y', // Overwrite output file
        previewFileName
      ])

      const data = await ffmpeg.readFile(previewFileName)
      const blob = new Blob([data instanceof Uint8Array ? data : new TextEncoder().encode(data)], { type: 'video/mp4' })
      const previewUrl = URL.createObjectURL(blob)
      setPreviewUrl(previewUrl)

      // Cleanup
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(previewFileName)
    } catch (error) {
      console.error('Transcoding error:', error)
      toast({
        title: "Error",
        description: "Failed to create video preview",
        variant: "destructive"
      })
    } finally {
      setIsTranscoding(false)
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Cleanup previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    console.log('onDrop', acceptedFiles)
    if (!loaded) {
      toast({
        title: "Please wait",
        description: "Video processor is still loading",
        variant: "destructive"
      })
      return
    }

    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0]
      console.log('File type:', file.type)
      
      // Handle AVI files
      if (file.name.toLowerCase().endsWith('.avi')) {
        setVideo(file)
        await transcodeForPreview(file)
        toast({
          title: "Video selected",
          description: "You can now apply effects to your video",
        })
        return
      }
      
      // Handle MP4 files directly
      if (file.type === 'video/mp4') {
        const preview = URL.createObjectURL(file)
        setPreviewUrl(preview)
        setVideo(file)
        toast({
          title: "Video selected",
          description: "You can now apply effects to your video",
        })
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload an MP4 or AVI file",
          variant: "destructive"
        })
      }
    }
  }, [loaded, toast, previewUrl, transcodeForPreview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/avi': ['.avi'],  // Some systems use this MIME type
      'video/*': ['.avi', '.mp4']  // Fallback for any video type
    },
    disabled: !loaded || isLoading,
    multiple: false
  })

  const processVideo = async () => {
    if (!video || !loaded) return

    setProcessing(true)
    setProgress(0)
    console.log('Starting processing, progress:', progress)

    try {
      const ffmpeg = ffmpegRef.current
      ffmpeg.on("progress", ({ progress }) => {
        const progressValue = Math.round(progress * 100)
        console.log('Progress update:', progressValue)
        setProgress(progressValue)
      })

      const inputFileName = video.type === 'video/mp4' ? 'input.mp4' : 'input.avi'
      const outputFileName = 'output.mp4'
      
      console.log('Writing input file...')
      const fileData = await fetchFile(video)
      console.log('Input file size:', fileData.byteLength)
      await ffmpeg.writeFile(inputFileName, fileData)

      // Prepare the FFmpeg command based on the selected effect
      let command: string[] = []
      const baseFlags = [
        '-preset', 'ultrafast',    // Fastest encoding preset
        '-threads', '0',           // Use all available threads
        '-movflags', '+faststart', // Enable fast start for web playback
      ]

      switch (effect) {
        case 'sepia':
          command = [
            '-i', inputFileName,
            '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0',
            '-c:v', 'libx264',
            ...baseFlags,
            '-crf', '28',
            '-c:a', 'copy',
            '-y',
            outputFileName
          ]
          break
        case 'grayscale':
          command = [
            '-i', inputFileName,
            '-vf', 'format=gray',
            '-c:v', 'libx264',
            ...baseFlags,
            '-crf', '28',
            '-c:a', 'copy',
            '-y',
            outputFileName
          ]
          break
        case 'vignette':
          command = [
            '-i', inputFileName,
            '-vf', 'vignette=PI/4',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-y',
            outputFileName
          ]
          break
        case 'blur':
          command = [
            '-i', inputFileName,
            '-vf', 'gblur=sigma=2',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-y',
            outputFileName
          ]
          break
        default:
          command = [
            '-i', inputFileName,
            '-c:v', 'libx264',
            ...baseFlags,
            '-crf', '23',
            '-c:a', 'aac',
            '-strict', 'experimental',
            '-y',
            outputFileName
          ]
      }

      console.log('Applying effect with command:', command)
      await ffmpeg.exec(command)

      console.log('Reading output file...')
      const data = await ffmpeg.readFile(outputFileName)
      console.log('Output data type:', typeof data)
      console.log('Output data length:', data instanceof Uint8Array ? data.length : 'not a Uint8Array')

      if (!data) {
        throw new Error('No output data received')
      }

      if (data.length === 0) {
        throw new Error('Output file is empty')
      }

      const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer)
      console.log('Uint8Array length:', uint8Array.length)

      const blob = new Blob([uint8Array], { type: 'video/mp4' })
      console.log('Blob size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Generated blob is empty')
      }

      const url = URL.createObjectURL(blob)

      // Create and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `processed_${effect}_${video.name.replace(/\.[^/.]+$/, '.mp4')}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Cleanup
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)

      toast({
        title: "Success!",
        description: "Your video has been processed and downloaded",
      })
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Error",
        description: "Failed to process video: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setProgress(100)
      console.log('Processing complete, final progress:', progress)
    }
  }

  return (
    <Card className="p-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          !loaded || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="animate-spin">
              <svg
                viewBox="0 0 1024 1024"
                focusable="false"
                data-icon="loading"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
              </svg>
            </span>
            <p>Loading video processor...</p>
          </div>
        ) : isDragActive ? (
          <p>Drop the video here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop a video here, or click to select</p>
            <p className="text-sm text-muted-foreground">Supported formats: MP4, AVI</p>
          </div>
        )}
      </div>

      {video && loaded && (
        <div className="mt-6 space-y-4">
          {isTranscoding ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <span className="animate-spin">
                  <svg
                    viewBox="0 0 1024 1024"
                    focusable="false"
                    data-icon="loading"
                    width="2em"
                    height="2em"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                  </svg>
                </span>
                <p>Creating preview...</p>
              </div>
            </div>
          ) : previewUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <video
                src={previewUrl}
                controls
                className="h-full w-full"
                onError={() => {
                  toast({
                    title: "Error",
                    description: "Failed to preview video",
                    variant: "destructive"
                  })
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <Select value={effect} onValueChange={setEffect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select effect" />
              </SelectTrigger>
              <SelectContent className="bg-background border rounded-md shadow-md min-w-[180px]">
                {Object.entries(effects).map(([value, label]) => (
                  <SelectItem 
                    key={value} 
                    value={value}
                    className="hover:bg-accent focus:bg-accent cursor-pointer"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={processVideo} 
              disabled={processing || !loaded}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {processing ? 'Processing...' : 'Apply Effect'}
            </Button>
          </div>

          {processing && (
            <div className="space-y-2 relative z-40 bg-background p-4 rounded-lg border">
              <div className="flex justify-between text-sm font-medium">
                <span>Processing video...</span>
                <span>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-3"
                aria-label="Processing progress"
              />
            </div>
          )}
          <p ref={messageRef} className="text-sm text-muted-foreground"></p>
        </div>
      )}
    </Card>
  )
}