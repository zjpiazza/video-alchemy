"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, FileVideo, CheckCircle, XCircle } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useToast } from "~/components/ui/use-toast"
import { useTransformation } from "../../contexts/transformation"
import { TransformationStep } from "./types"
import { StepperLayout } from "./layout"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export function VideoSelectStep() {
  const [dragActive, setDragActive] = useState(false)
  const { setVideoFile, status, setCurrentStep, videoFile, setName, name } = useTransformation()
  const [transformationName, setTransformationName] = useState(name || "")
  const { toast } = useToast()
  const isProcessing = status === "processing" || status === "preparing"

  // Auto-generate a default name when a file is selected
  useEffect(() => {
    if (videoFile && !transformationName) {
      // Generate a default name from the file name if available
      if (typeof videoFile !== 'string' && videoFile.name) {
        // Remove extension and replace non-alphanumeric with spaces
        const baseName = videoFile.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, " ")
        setTransformationName(`${baseName} Transformation`)
      } else {
        setTransformationName(`New Transformation ${new Date().toLocaleDateString()}`)
      }
    }
  }, [videoFile, transformationName])

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

  const handleNext = () => {
    if (!transformationName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your transformation.",
        variant: "destructive",
      })
      return
    }
    
    setName(transformationName.trim())
    setCurrentStep(TransformationStep.SelectEffect)
  }

  const handleReset = () => {
    setVideoFile(null)
    setTransformationName("")
  }

  return (
    <StepperLayout
      title="Select Video"
      onNext={handleNext}
      nextDisabled={!videoFile}
      backDisabled={true}
    >
      <div className="flex flex-col">
        {!videoFile ? (
          // Step 1: Video selection UI
          <div
            className={`flex flex-col items-center justify-center p-8 text-center border-2 rounded-lg ${
              dragActive ? "border-primary border-dashed" : "border-border"
            } transition-all min-h-[300px]`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="rounded-full bg-primary/10 p-5 mb-5">
              <FileVideo className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3">Drag & drop a video here</h3>
            <p className="text-sm text-muted-foreground mb-6">Supports MP4, WebM, and MOV formats</p>
            <Button asChild size="lg" disabled={isProcessing}>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-5 w-5" />
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
        ) : (
          // Step 2: Video preview and name input UI
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Selected Video</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Change Video
              </Button>
            </div>
            
            <div className="rounded-lg overflow-hidden border shadow-sm">
              <video
                src={typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile)}
                controls
                className="w-full max-h-[320px]"
              />
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {typeof videoFile !== 'string' && videoFile.name 
                  ? `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB)`
                  : 'Video selected'}
              </div>
              
              <Label htmlFor="transformation-name" className="text-sm font-medium">
                Transformation Name
              </Label>
              <Input
                id="transformation-name"
                value={transformationName}
                onChange={(e) => setTransformationName(e.target.value)}
                placeholder="Enter a name for your transformation"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Give your transformation a descriptive name
              </p>
            </div>
          </div>
        )}
      </div>
    </StepperLayout>
  )
}
