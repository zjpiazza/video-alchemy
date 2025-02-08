'use client'

import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import type { Effect } from '../effects'
import EffectSelector from '../effectSelector'

const VIDEO_CONTAINER_CLASS = "w-full aspect-video rounded-lg overflow-hidden bg-muted"

interface UploadStageProps {
  onFileSelect: (file: File) => void
  mode: 'client' | 'server'
  previewUrl: string | null
  effect: Effect
  onEffectChange: (effect: Effect) => void
  onProcess: () => void
}

export function UploadStage({ 
  onFileSelect, 
  mode,
  previewUrl,
  effect,
  onEffectChange,
  onProcess
}: UploadStageProps) {
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