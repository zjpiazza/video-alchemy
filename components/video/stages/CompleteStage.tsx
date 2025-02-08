'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const VIDEO_CONTAINER_CLASS = "w-full aspect-video rounded-lg overflow-hidden bg-muted"

interface CompleteStageProps {
  videoUrl: string
  originalFileName: string
  onRestart: () => void
}

export function CompleteStage({
  videoUrl,
  originalFileName,
  onRestart
}: CompleteStageProps) {
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