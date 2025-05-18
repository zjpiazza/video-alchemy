"\"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type {
  VideoFile,
  TransformationConfig,
  TransformationProgress,
  TransformationStatus,
  TransformationResult,
  TransformationError,
} from "@/types/video"
import { getEffectById } from "@/lib/transformation-effects"

interface TransformationContextType {
  // Current state
  currentStep: number
  videoFile: VideoFile | null
  transformationConfig: TransformationConfig | null
  status: TransformationStatus
  progress: TransformationProgress | null
  result: TransformationResult | null
  error: TransformationError | null

  // Actions
  setVideoFile: (file: File) => void
  clearVideoFile: () => void
  selectEffect: (effectId: string) => void
  updateEffectParams: (params: Record<string, any>) => void
  startTransformation: () => Promise<void>
  cancelTransformation: () => void
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const TransformationContext = createContext<TransformationContextType | undefined>(undefined)

export function TransformationProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [videoFile, setVideoFileState] = useState<VideoFile | null>(null)
  const [transformationConfig, setTransformationConfig] = useState<TransformationConfig | null>(null)
  const [status, setStatus] = useState<TransformationStatus>("idle")
  const [progress, setProgress] = useState<TransformationProgress | null>(null)
  const [result, setResult] = useState<TransformationResult | null>(null)
  const [error, setError] = useState<TransformationError | null>(null)

  const setVideoFile = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setVideoFileState({
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: objectUrl,
      source: "local",
    })
    setCurrentStep(1) // Move to effect selection step
  }, [])

  const clearVideoFile = useCallback(() => {
    if (videoFile?.url && videoFile.source === "local") {
      URL.revokeObjectURL(videoFile.url)
    }
    setVideoFileState(null)
  }, [videoFile])

  const selectEffect = useCallback((effectId: string) => {
    const effect = getEffectById(effectId)
    if (effect) {
      setTransformationConfig({
        effectId,
        params: { ...effect.defaultParams },
      })
      setCurrentStep(2) // Move to configuration step
    }
  }, [])

  const updateEffectParams = useCallback((params: Record<string, any>) => {
    setTransformationConfig((prev) => (prev ? { ...prev, params: { ...prev.params, ...params } } : null))
  }, [])

  const startTransformation = useCallback(async () => {
    if (!videoFile || !transformationConfig) return

    setStatus("preparing")
    setProgress({ stage: "processing", percent: 0 })
    setError(null)

    try {
      // Mock transformation process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setProgress({ stage: "processing", percent: i })
      }

      // Mock result
      setResult({
        id: uuidv4(),
        outputUrl: videoFile.url, // In a real app, this would be the transformed video URL
        thumbnailUrl: videoFile.url,
        metadata: {
          duration: 30,
          width: 1280,
          height: 720,
          format: "mp4",
        },
      })

      setStatus("completed")
      setCurrentStep(3) // Move to result step
    } catch (err) {
      setStatus("failed")
      setError({
        message: "Failed to transform video",
        details: err instanceof Error ? err.message : String(err),
      })
    }
  }, [videoFile, transformationConfig])

  const cancelTransformation = useCallback(() => {
    setStatus("idle")
    setProgress(null)
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 3) {
      setCurrentStep(step)
    }
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const reset = useCallback(() => {
    clearVideoFile()
    setTransformationConfig(null)
    setStatus("idle")
    setProgress(null)
    setResult(null)
    setError(null)
    setCurrentStep(0)
  }, [clearVideoFile])

  return (
    <TransformationContext.Provider
      value={{
        currentStep,
        videoFile,
        transformationConfig,
        status,
        progress,
        result,
        error,
        setVideoFile,
        clearVideoFile,
        selectEffect,
        updateEffectParams,
        startTransformation,
        cancelTransformation,
        goToStep,
        nextStep,
        prevStep,
        reset,
      }}
    >
      {children}
    </TransformationContext.Provider>
  )
}

export function useTransformation() {
  const context = useContext(TransformationContext)
  if (context === undefined) {
    throw new Error("useTransformation must be used within a TransformationProvider")
  }
  return context
}

export { TransformationContext }
