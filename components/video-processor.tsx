"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import React, { useEffect, useRef, useState } from 'react'
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
    load()
  }, []) // Load FFmpeg on component mount

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const load = async () => {
    if (loaded) return
    setIsLoading(true)
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
      const ffmpeg = ffmpegRef.current
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100))
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
  }

  const transcodeForPreview = async (file: File) => {
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
  }

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
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

    try {
      const ffmpeg = ffmpegRef.current
      const inputExt = SUPPORTED_FORMATS[video.type as keyof typeof SUPPORTED_FORMATS]
      const inputFileName = `input.${inputExt}`
      const transcodedFileName = 'transcoded.mp4'
      const outputFileName = 'output.mp4'
      
      console.log('Writing input file...')
      await ffmpeg.writeFile(inputFileName, await fetchFile(video))

      // Transcode to MP4 if needed
      if (inputExt !== 'mp4') {
        console.log('Transcoding to MP4...')
        await ffmpeg.exec(['-i', inputFileName, '-c:v', 'libx264', '-c:a', 'aac', transcodedFileName])
        await ffmpeg.deleteFile(inputFileName)
      }

      const sourceFile = inputExt === 'mp4' ? inputFileName : transcodedFileName

      // Prepare the FFmpeg command based on the selected effect
      let command: string[] = []
      switch (effect) {
        case 'sepia':
          command = ['-i', sourceFile, '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0', outputFileName]
          break
        case 'grayscale':
          command = ['-i', sourceFile, '-vf', 'colorspace=gray', outputFileName]
          break
        case 'vignette':
          command = ['-i', sourceFile, '-vf', 'vignette=PI/4', outputFileName]
          break
        case 'blur':
          command = ['-i', sourceFile, '-vf', 'gblur=sigma=2', outputFileName]
          break
        default:
          command = ['-i', sourceFile, '-c', 'copy', outputFileName]
      }

      console.log('Applying effect...')
      await ffmpeg.exec(command)

      // Clean up intermediate file if it exists
      if (inputExt !== 'mp4') {
        await ffmpeg.deleteFile(transcodedFileName)
      }

      console.log('Reading output file...')
      const data = await ffmpeg.readFile(outputFileName)
      const blob = new Blob([data instanceof Uint8Array ? data : new TextEncoder().encode(data)], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      // Create and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `processed_${effect}_${video.name.replace(/\.[^/.]+$/, '.mp4')}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url) // Clean up the URL object

      toast({
        title: "Success!",
        description: "Your video has been processed and downloaded",
      })
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Error",
        description: "Failed to process video",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setProgress(100)
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
              <SelectContent>
                {Object.entries(effects).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
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
            <Progress value={progress} className="w-full" />
          )}
          <p ref={messageRef} className="text-sm text-muted-foreground"></p>
        </div>
      )}
    </Card>
  )
}