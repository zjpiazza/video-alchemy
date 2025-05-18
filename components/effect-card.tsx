"use client"

import type React from "react"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScalingIcon as Resize, Scissors, FileType, FastForward, Stamp, RotateCw, Aperture, Layers } from "lucide-react"
import type { TransformationEffect } from "@/types/video"

interface EffectCardProps {
  effect: TransformationEffect
  onClick: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  resize: <Resize className="h-5 w-5" />,
  scissors: <Scissors className="h-5 w-5" />,
  "file-type": <FileType className="h-5 w-5" />,
  "fast-forward": <FastForward className="h-5 w-5" />,
  watermark: <Stamp className="h-5 w-5" />,
  rotate: <RotateCw className="h-5 w-5" />,
  grayscale: <Aperture className="h-5 w-5" />,
  compress: <Layers className="h-5 w-5" />,
}

export function EffectCard({ effect, onClick }: EffectCardProps) {
  const icon = iconMap[effect.icon] || <Aperture className="h-5 w-5" />

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">{icon}</div>
        <CardTitle>{effect.name}</CardTitle>
        <CardDescription>{effect.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-4">
        <Button onClick={onClick} className="w-full">
          Select
        </Button>
      </CardFooter>
    </Card>
  )
}
