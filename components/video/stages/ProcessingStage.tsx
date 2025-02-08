'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LoadingAnimation } from '@/components/loadingAnimation'
import { ProcessingStats } from '../ProcessingStats'
import { useVideoProcessing } from '../VideoProcessingContext'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { useToast } from '@/hooks/use-toast'

const VIDEO_CONTAINER_CLASS = "w-full aspect-video rounded-lg overflow-hidden bg-muted"

interface ProcessingStageProps {
  mode: 'client' | 'server'
}

export function ProcessingStage({ mode }: ProcessingStageProps) {
  if (mode === 'server') {
    return <ServerProcessingStage />
  }
  return <ClientProcessingStage />
}

function ClientProcessingStage() {
  const { processingMetrics, setStage } = useVideoProcessing()
  const { toast } = useToast()

  const handleCancel = () => {
    setStage('upload')
    toast({ title: "Cancelled", description: "Video processing cancelled" })
  }

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
        <Card className="p-4">
          <div className="text-lg font-medium text-center">
            Processing Video
          </div>
          <ProcessingStats stats={processingMetrics} />
        </Card>
        
        <Button 
          variant="destructive"
          onClick={handleCancel}
          className="w-full"
        >
          Cancel Processing
        </Button>
      </motion.div>
    </div>
  )
}

function ServerProcessingStage() {
  const { processingMetrics, transformation, setStage } = useVideoProcessing()
  const { isUploading, uploadProgress } = useVideoUpload()
  const { toast } = useToast()

  const handleCancel = () => {
    setStage('upload')
    toast({ title: "Cancelled", description: "Video processing cancelled" })
  }

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
            <Progress value={uploadProgress.percentage} />
            <p className="text-sm text-center text-muted-foreground">
              Uploading: {Math.round(uploadProgress.percentage)}%
            </p>
          </div>
        ) : (
          <Card className="p-4">
            <div className="text-lg font-medium text-center">
              {transformation?.status === 'pending' 
                ? 'Video Queued for Processing'
                : 'Processing Video'
              }
            </div>
            {transformation?.status === 'pending' ? (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Your video is queued and will begin processing shortly...
              </p>
            ) : (
              <ProcessingStats stats={processingMetrics} />
            )}
          </Card>
        )}
        
        <Button 
          variant="destructive"
          onClick={handleCancel}
          className="w-full"
        >
          Cancel Processing
        </Button>
      </motion.div>
    </div>
  )
} 