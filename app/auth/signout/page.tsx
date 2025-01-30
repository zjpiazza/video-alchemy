'use client'

import { useEffect } from 'react'
import { signOut } from './actions'

export default function SignOutPage() {
  useEffect(() => {
    signOut()
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <p className="text-foreground/60">Signing out...</p>
    </div>
  )
} 