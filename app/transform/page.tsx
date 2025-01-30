'use client'
import { createClient } from '@/utils/supabase/client'
import { VideoProcessor } from "@/components/video"
import { useState, useEffect } from 'react'
import { AuthChangeEvent, Session } from '@supabase/auth-js'

export default function TransformPage() {
  const [isServerProcessingEnabled, setIsServerProcessingEnabled] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsServerProcessingEnabled(!!session)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setIsServerProcessingEnabled(!!session)
    })

    return () => subscription.unsubscribe()
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