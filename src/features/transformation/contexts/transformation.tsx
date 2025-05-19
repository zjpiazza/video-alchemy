import React, { createContext, useContext, useState } from "react";

const TransformationContext = createContext<any>(null);

export function TransformationProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<string>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [effect, setEffect] = useState<string | null>(null);
  const [effectParams, setEffectParams] = useState<any>(null);
  const [name, setName] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);

  const reset = () => {
    setCurrentStep(0);
    setResult(null);
    setStatus("idle");
    setVideoFile(null);
    setEffect(null);
    setEffectParams(null);
    setName(null);
    setInputUrl(null);
  };

  return (
    <TransformationContext.Provider value={{
      currentStep,
      setCurrentStep,
      result,
      setResult,
      status,
      setStatus,
      videoFile,
      setVideoFile,
      effect,
      setEffect,
      effectParams,
      setEffectParams,
      name,
      setName,
      inputUrl,
      setInputUrl,
      reset
    }}>
      {children}
    </TransformationContext.Provider>
  );
}

export function useTransformation() {
  const ctx = useContext(TransformationContext);
  if (!ctx) throw new Error("useTransformation must be used within a TransformationProvider");
  return ctx;
} 