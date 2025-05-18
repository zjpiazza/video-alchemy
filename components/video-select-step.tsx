"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useTransformation } from "@/contexts/transformation-context"

export function VideoSelectStep() {
  const [dragActive, setDragActive] = useState(false)
  const { setVideoFile, status } = useTransformation()
  const { toast } = useToast()
  const isProcessing = status === "processing" || status === "preparing"

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndProcessFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      validateAndProcessFile(file)
    }
  }

  const validateAndProcessFile = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, or MOV).",
        variant: "destructive",
      })
      return
    }

    // Check supported formats
    const supportedFormats = ["video/mp4", "video/webm", "video/quicktime"]
    if (!supportedFormats.includes(file.type)) {
      toast({
        title: "Unsupported format",
        description: "Please upload an MP4, WebM, or MOV file.",
        variant: "destructive",
      })
      return
    }

    setVideoFile(file)
  }

  return (
    <Card className={`border-2 ${dragActive ? "border-primary border-dashed" : "border-border"} transition-all`}>
      <CardContent className="p-0">
        <div
          className="flex flex-col items-center justify-center p-8 text-center h-64"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <FileVideo className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Drag & drop a video here, or click to select</h3>
          <p className="text-sm text-muted-foreground mb-4">Supports MP4, WebM, and MOV formats</p>
          <Button asChild disabled={isProcessing}>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Select Video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
