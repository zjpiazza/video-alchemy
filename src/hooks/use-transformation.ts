"use client"

import { useContext } from "react"
import { TransformationContext } from "~/contexts/transformation-context"

export function useTransformation() {
  const context = useContext(TransformationContext)
  if (!context) {
    throw new Error("useTransformation must be used within a TransformationProvider")
  }
  return context
}
