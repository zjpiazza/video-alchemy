"use client"

import { useTransformation } from "@/contexts/transformation-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Download, RotateCcw } from "lucide-react"

export function ResultStep() {
  const { result, reset } = useTransformation()

  if (!result) return null

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = result.outputUrl
    a.download = "transformed-video.mp4" // In a real app, use the actual file name and extension
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transformation Complete</h2>
        <Button variant="outline" onClick={reset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Start New Transformation
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <video src={result.outputUrl} className="w-full aspect-video" controls autoPlay />
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div>
            <h3 className="font-medium">Transformation Details</h3>
            <p className="text-sm text-muted-foreground">
              {result.metadata?.width}x{result.metadata?.height} • {result.metadata?.format.toUpperCase()} •{" "}
              {Math.round(result.metadata?.duration || 0)}s
            </p>
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
