import { Card } from "@/components/ui/card"
import { VideoIcon } from "lucide-react"

export function VideoPlaceholder() {
  return (
    <Card className="aspect-video w-full flex items-center justify-center bg-muted/50">
      <div className="text-center space-y-4 text-muted-foreground">
        <VideoIcon className="h-10 w-10 mx-auto" />
        <p>No Video Selected</p>
      </div>
    </Card>
  )
} 