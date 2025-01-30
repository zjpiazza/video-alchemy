import { Card } from "@/components/ui/card"
import { Cpu, Cloud } from "lucide-react"

interface ProcessingDescriptionProps {
  type: 'client' | 'server'
}

export function ProcessingDescription({ type }: ProcessingDescriptionProps) {
  return (
    <Card className="p-4 mb-6 bg-muted/50 min-h-[120px]">
      <div className="flex items-start gap-3">
        {type === 'client' ? (
          <>
            <Cpu className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium leading-tight">Client-Side Processing</h3>
              <p className="text-sm text-muted-foreground leading-normal">
                Using FFmpeg.wasm to process videos directly in your browser. 
                This method runs entirely on your device, ensuring privacy and 
                immediate results without uploading files to a server.
              </p>
            </div>
          </>
        ) : (
          <>
            <Cloud className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium leading-tight">Server-Side Processing</h3>
              <p className="text-sm text-muted-foreground leading-normal">
                Leveraging Supabase Database webhooks and Trigger.dev for robust video processing. 
                Files are securely uploaded and processed in the background, with automatic 
                notifications when processing is complete.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
} 