'use client'
import { createClient } from '@/utils/supabase/client'
import VideoProcessor from "@/components/video/VideoProcessor"
import { useState, useEffect } from 'react'

export default function TransformPage() {
  const [isServerProcessingEnabled, setIsServerProcessingEnabled] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsServerProcessingEnabled(!!user)
      console.log(isServerProcessingEnabled)
    }
    
    checkAuth()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Transform Your Video</h1>
        <p className="text-muted-foreground">
          Choose an effect and transform your video right in your browser. 
          Sign in to unlock cloud processing for more demanding transformations.
        </p>
      </div>
      
      <VideoProcessor serverProcessingEnabled={isServerProcessingEnabled} />
    </div>
  )
} 