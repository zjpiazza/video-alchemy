"use client"

import { TransformationProvider } from "~/contexts/transformation-context"
import { TransformationStepper } from "~/components/transformation-stepper"
import { VideoSelectStep } from "~/components/video-select-step"
import { EffectSelectStep } from "~/components/effect-select-step"
import { ConfigureStep } from "~/components/configure-step"
import { ResultStep } from "~/components/result-step"
import { useTransformation } from "~/contexts/transformation-context"
import { useAuth } from "~/contexts/auth-context"
import { Header } from "~/components/header"

export default function ProcessPage() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Header />
      <div className="container mx-auto py-6 px-4">
        <TransformationProvider>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Transform Your Video</h1>

            <TransformationStepper />

            <TransformationSteps isLoggedIn={isAuthenticated} />
          </div>
        </TransformationProvider>
      </div>
    </>
  )
}

function TransformationSteps({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { currentStep } = useTransformation()

  switch (currentStep) {
    case 0:
      return <VideoSelectStep />
    case 1:
      return <EffectSelectStep isLoggedIn={isLoggedIn} />
    case 2:
      return <ConfigureStep />
    case 3:
      return <ResultStep />
    default:
      return <VideoSelectStep />
  }
}
