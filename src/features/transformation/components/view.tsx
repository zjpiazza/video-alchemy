"use client"


import { TransformationStepper } from "./stepper/index"
import { TransformationStep } from "./stepper/types"
import { VideoSelectStep } from "./stepper/video-select"
import { EffectSelectStep } from "./stepper/effect"
import { ConfigureStep } from "./stepper/configure"
import { ResultStep } from "./stepper/result"
import { MonitorProgressStep } from "./stepper/progress"
import { useAuth } from "~/contexts/auth-context"
import { VideoUpload } from "./stepper/upload"
import { useTransformation } from "../contexts/transformation"
import { TransformationProvider } from "../contexts/transformation"

export default function TransformationView() {
  const { isAuthenticated } = useAuth()

  return (
    <TransformationProvider>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Transform Your Video</h1>
        
        <div className="mb-8">
          <TransformationStepper />
        </div>
        
        <div className="bg-card rounded-lg border-2 border-border shadow-sm">
          <TransformationSteps />
        </div>
      </div>
    </TransformationProvider>
  )
}

function TransformationSteps() {
  const { currentStep } = useTransformation()

  switch (currentStep) {
    case TransformationStep.SelectVideo:
      return <VideoSelectStep />
    case TransformationStep.SelectEffect:
      return <EffectSelectStep />
    case TransformationStep.Configure:
      return <ConfigureStep />
    case TransformationStep.Upload:
      return <VideoUpload />
    case TransformationStep.Progress:
      return <MonitorProgressStep />
    case TransformationStep.Result:
      return <ResultStep />
    default:
      return <VideoSelectStep />
  }
}
