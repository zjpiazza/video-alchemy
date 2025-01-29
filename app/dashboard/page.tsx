'use client'
import DeployButton from '@/components/DeployButton'
// TODO: AuthButton does not work on client side
// import AuthButton from '@/components/AuthButton'
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import { VideoProcessor } from '@/components/video'
import { useState, useEffect } from 'react'

export default function ProtectedPage() {
  // Move auth check to a separate component or middleware since we're now client-side
  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/login')
    }
  }

  // Call checkAuth when component mounts
  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-20 items-center p-10">

      <div className="max-w-3xl mx-auto w-full px-4">
        <VideoProcessor />
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{' '}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  )
}
