"use client"

import React from "react"

import { Check, Loader2 } from "lucide-react"
import { useTransformation } from "@/contexts/transformation-context"

interface StepProps {
  step: number
  label: string
}

function Step({ step, label }: StepProps) {
  const { currentStep, status, goToStep } = useTransformation()

  const isActive = currentStep === step
  const isCompleted = currentStep > step || status === "completed"
  const isPending = currentStep < step
  const isProcessing = isActive && status === "processing"

  const handleClick = () => {
    // Only allow navigation to completed steps or the next available step
    if (isCompleted || step === currentStep + 1) {
      goToStep(step)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={isPending && step !== currentStep + 1}
        className={`
          relative flex h-10 w-10 items-center justify-center rounded-full border-2 
          transition-colors
          ${isActive ? "border-primary bg-primary text-primary-foreground" : ""}
          ${isCompleted ? "border-primary bg-primary text-primary-foreground" : ""}
          ${isPending ? "border-muted-foreground bg-background text-muted-foreground" : ""}
        `}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isCompleted ? (
          <Check className="h-5 w-5" />
        ) : (
          <span>{step + 1}</span>
        )}
      </button>
      <span className={`mt-2 text-sm ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

export function TransformationStepper() {
  const steps = [{ label: "Select Video" }, { label: "Choose Effect" }, { label: "Configure" }, { label: "Result" }]

  return (
    <div className="w-full py-6">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Step step={index} label={step.label} />
            {index < steps.length - 1 && (
              <div className="flex-1 self-center">
                <div className="h-[2px] bg-muted" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
