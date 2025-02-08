'use client'

import { Card } from "@/components/ui/card"
import { Cpu, Cloud } from "lucide-react"

interface ProcessingDescriptionProps {
  type: 'client' | 'server'
}

export function ProcessingDescription({ type }: ProcessingDescriptionProps) {
  if (type === 'client') {
    return (
      <div className="mb-8 space-y-2">
        <h3 className="font-medium">Client-Side Processing</h3>
        <p className="text-sm text-muted-foreground">
          Your video will be processed directly in your browser using WebAssembly. 
          This is faster for small videos but may be limited by your device's capabilities.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-8 space-y-2">
      <h3 className="font-medium">Server-Side Processing</h3>
      <p className="text-sm text-muted-foreground">
        Your video will be processed on our servers using powerful hardware. 
        This is better for longer videos and more complex transformations.
      </p>
    </div>
  )
} 