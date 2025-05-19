import React, { useEffect, useState } from "react";
import { useTransformation } from "../../contexts/transformation";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { api } from "~/trpc/react";
import { TriggerAuthContext } from "@trigger.dev/react-hooks";
import { Loader2, CheckCircle2 } from "lucide-react";
import { StepperLayout } from "./layout";
import { TransformationStep } from "./types";

export function MonitorProgressStep() {
  const { name, inputUrl, effect, effectParams, setCurrentStep, setResult } = useTransformation();
  const [runId, setRunId] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { mutate: createTransformation, data: transformationResult } = api.transformation.create.useMutation({
    onSuccess: (data) => {
      setRunId(data.runId);
      setAccessToken(data.publicAccessToken);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error creating transformation:", error);
      setIsLoading(false);
      setError("Failed to create transformation. Please try again.");
    }
  });

  useEffect(() => {
    if (!name || !inputUrl || !effect) {
      setError("Missing required information. Please go back and fill all fields.");
      setIsLoading(false);
      return;
    }
    
    createTransformation({
      name: name,
      inputUrl: inputUrl,
      effectId: effect,
      effectParams: effectParams
    });
  }, []);

  const handleBack = () => {
    setCurrentStep(TransformationStep.Upload);
  };
  
  if (isLoading || !runId || !accessToken) {
    return (
      <StepperLayout
        title="Processing"
        hideNavigation={true}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                onClick={() => setCurrentStep(TransformationStep.Upload)}
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 animate-spin mb-6 text-primary" />
              <h3 className="text-lg font-medium mb-2">Creating Transformation...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we set up your transformation</p>
            </>
          )}
        </div>
      </StepperLayout>
    );
  }
  
  return (
    <TriggerAuthContext value={{accessToken: accessToken}} >
      <Progress runId={runId} />
    </TriggerAuthContext>
  );
}

function Progress({ runId }: { runId: string | undefined }) {
  const realtimeRun = useRealtimeRun(runId);
  const run = realtimeRun?.run;
  const isLoaded = !!run;
  const { setCurrentStep, setResult } = useTransformation();
  
  // Check if the run is completed
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Poll for status update and automatically redirect when complete
  useEffect(() => {
    if (!run) return;
    
    // Check run status and set completion
    if (run.status === "COMPLETED") {
      setIsCompleted(true);
      
      // Extract result information if available from run.output
      if (run.output) {
        try {
          const output = typeof run.output === 'string' ? JSON.parse(run.output) : run.output;
          setResult({
            id: run.id,
            outputUrl: output.outputUrl || "",
            metadata: output.metadata || {
              width: 0,
              height: 0,
              format: "mp4",
              duration: 0
            }
          });
          
          // Auto-navigate to results after a short delay
          setTimeout(() => {
            setCurrentStep(TransformationStep.Result);
          }, 1500);
        } catch (err) {
          console.error("Error parsing run output:", err);
        }
      }
      
      setProgress(100);
    } else if (run.status === "EXECUTING") {
      // Calculate approximate progress based on steps completed or time elapsed
      // Since we don't have direct access to tasks, estimate progress
      setProgress(Math.min(95, Math.round(Math.random() * 30) + 30)); // Between 30-60%
    } else if (run.status === "FAILED") {
      setProgress(0);
    }
  }, [run, setCurrentStep, setResult]);
  
  const handleNext = () => {
    if (isCompleted) {
      setCurrentStep(TransformationStep.Result);
    }
  };
  
  return (
    <StepperLayout
      title="Processing Video"
      nextLabel="View Result"
      nextDisabled={!isCompleted}
      onNext={handleNext}
      backDisabled={true}
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-6">
          {isCompleted ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
        </div>
        
        <h3 className="text-lg font-medium mb-4">
          {isCompleted ? "Transformation Complete!" : "Your video is being transformed..."}
        </h3>
        
        {!isLoaded ? (
          <div className="flex flex-col items-center mt-4">
            <p className="text-sm text-muted-foreground">Loading transformation status...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-4 max-w-md mx-auto">
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isCompleted ? "Processing complete" : "Processing video..."}
            </p>
            <p className="text-xs text-muted-foreground">
              Run ID: {runId}
            </p>
          </div>
        )}
      </div>
    </StepperLayout>
  );
}