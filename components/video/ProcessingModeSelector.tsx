'use client'

import { Laptop, Server } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProcessingMode } from './types'

interface ProcessingModeSelectorProps {
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void
  serverDisabled: boolean
  disabled?: boolean
}

export function ProcessingModeSelector({ 
  mode, 
  onModeChange,
  serverDisabled,
  disabled = false
}: ProcessingModeSelectorProps) {
  return (
    <div className="mb-12">
      <Tabs 
        value={mode}
        onValueChange={(value) => onModeChange(value as ProcessingMode)}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="client" 
            className="flex items-center gap-2"
            disabled={disabled}
          >
            <Laptop className="h-4 w-4" />
            Client Processing
          </TabsTrigger>
          <TabsTrigger 
            value="server" 
            className="flex items-center gap-2"
            disabled={disabled || serverDisabled}
          >
            <Server className="h-4 w-4" />
            {serverDisabled ? (
              <div className="flex items-center gap-2">
                Server Processing
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">
                  Sign in required
                </span>
              </div>
            ) : (
              "Server Processing"
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {serverDisabled && mode === 'client' && (
        <div className="text-sm text-muted-foreground mt-2">
          <p>
            Sign in to unlock server-side processing for more demanding transformations 
            and higher quality outputs.
          </p>
        </div>
      )}
    </div>
  )
} 