'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cloud, Laptop } from 'lucide-react'
import ClientVideoProcessor from './clientVideoProcessor'
import ServerVideoProcessor from './serverVideoProcessor'
import NoSSRWrapper from '@/app/NoSSRWrapper'

export const effects = {
  none: 'Original',
  sepia: 'Sepia',
  grayscale: 'Grayscale',
  vignette: 'Vignette',
  blur: 'Blur Effect',
} as const

export type ProcessingMethod = 'client' | 'edge'
export type Effect = keyof typeof effects

export function VideoProcessor() {
  const [processingMethod, setProcessingMethod] = useState<ProcessingMethod>('client')

  return (
    <div className="space-y-6">
      {/* Processing Method Selection */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Processing Method</h3>
        <div className="flex gap-4">
          <Button
            variant={processingMethod === 'client' ? 'default' : 'outline'}
            onClick={() => setProcessingMethod('client')}
            className="flex-1"
          >
            <Laptop className="w-4 h-4 mr-2" />
            Client-side
          </Button>
          <Button
            variant={processingMethod === 'edge' ? 'default' : 'outline'}
            onClick={() => setProcessingMethod('edge')}
            className="flex-1"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Edge Function
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {processingMethod === 'client' 
            ? 'Process videos directly in your browser. Works offline, but may be slower.'
            : 'Process videos using Supabase Edge Functions. Faster, but requires internet connection.'}
        </p>
      </Card>

      {/* Render appropriate processor based on method */}
      {processingMethod === 'client' ? (
        <NoSSRWrapper>
          <ClientVideoProcessor />
        </NoSSRWrapper>
      ) : (
        <ServerVideoProcessor />
      )}

    </div>
  )
}