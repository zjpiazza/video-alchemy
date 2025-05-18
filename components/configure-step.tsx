"use client"
import { useTransformation } from "@/contexts/transformation-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEffectById } from "@/lib/transformation-effects"
import { LoadingAnimation } from "@/components/loading-animation"

export function ConfigureStep() {
  const { videoFile, transformationConfig, updateEffectParams, startTransformation, prevStep, status, progress } =
    useTransformation()

  const effect = transformationConfig ? getEffectById(transformationConfig.effectId) : null
  const params = transformationConfig?.params || {}
  const isProcessing = status === "processing" || status === "preparing"

  if (!videoFile || !effect) return null

  const renderParamControl = (paramName: string, value: any) => {
    switch (paramName) {
      case "width":
      case "height":
        return (
          <div key={paramName} className="space-y-2">
            <Label htmlFor={paramName} className="capitalize">
              {paramName}
            </Label>
            <Input
              id={paramName}
              type="number"
              value={value}
              onChange={(e) => updateEffectParams({ [paramName]: Number.parseInt(e.target.value) })}
              min={1}
              max={3840}
            />
          </div>
        )

      case "quality":
        return (
          <div key={paramName} className="space-y-2">
            <Label htmlFor={paramName} className="capitalize">
              {paramName}
            </Label>
            <Select value={value} onValueChange={(val) => updateEffectParams({ [paramName]: val })}>
              <SelectTrigger id={paramName}>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case "format":
        return (
          <div key={paramName} className="space-y-2">
            <Label htmlFor={paramName} className="capitalize">
              {paramName}
            </Label>
            <Select value={value} onValueChange={(val) => updateEffectParams({ [paramName]: val })}>
              <SelectTrigger id={paramName}>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case "angle":
        return (
          <div key={paramName} className="space-y-2">
            <Label htmlFor={paramName} className="capitalize">
              {paramName}
            </Label>
            <Select
              value={value.toString()}
              onValueChange={(val) => updateEffectParams({ [paramName]: Number.parseInt(val) })}
            >
              <SelectTrigger id={paramName}>
                <SelectValue placeholder="Select angle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90°</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270°</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case "factor":
        return (
          <div key={paramName} className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={paramName}>Speed Factor</Label>
              <span className="text-sm text-muted-foreground">{value}x</span>
            </div>
            <Slider
              id={paramName}
              min={0.25}
              max={4}
              step={0.25}
              value={[value]}
              onValueChange={([val]) => updateEffectParams({ [paramName]: val })}
            />
          </div>
        )

      case "start":
      case "end":
        return (
          <div key={paramName} className="space-y-2">
            <Label htmlFor={paramName} className="capitalize">
              {paramName} Time (seconds)
            </Label>
            <Input
              id={paramName}
              type="number"
              value={value}
              onChange={(e) => updateEffectParams({ [paramName]: Number.parseFloat(e.target.value) })}
              min={0}
              step={0.1}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configure {effect.name}</h2>
        <Button variant="ghost" onClick={prevStep} disabled={isProcessing}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video src={videoFile.url} className="w-full h-full object-contain" controls />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {isProcessing ? (
              <LoadingAnimation />
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Effect Parameters</h3>
                <div className="space-y-4">
                  {Object.entries(params).map(([key, value]) => renderParamControl(key, value))}
                </div>
                <Button onClick={() => startTransformation()} className="w-full mt-6" disabled={isProcessing}>
                  Transform Video
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
