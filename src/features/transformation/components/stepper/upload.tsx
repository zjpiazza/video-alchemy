import React, { useState } from "react";
import { useTransformation } from "../../contexts/transformation";
import { Button } from "~/components/ui/button";
import { upload } from "@vercel/blob/client";
import { LoadingAnimation } from "~/components/loading-animation";
import { TransformationStep } from "./types";
import { StepperLayout } from "./layout";
import { ArrowUp, Check, Upload } from "lucide-react";

export function VideoUpload() {
  const { setCurrentStep, videoFile, setInputUrl } = useTransformation();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!videoFile) {
      setError("No video file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 300);
      
      const newBlob = await upload(videoFile.name, videoFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      clearInterval(progressInterval);
      setProgress(100);
      setUploadedUrl(newBlob.url);
      setInputUrl(newBlob.url);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!uploadedUrl) {
      setError("Please upload a video first.");
      return;
    }
    
    setCurrentStep(TransformationStep.Progress);
  };

  const handleBack = () => {
    setCurrentStep(TransformationStep.Configure);
  };

  return (
    <StepperLayout
      title="Upload Video"
      onNext={handleNext}
      nextDisabled={!uploadedUrl}
      onBack={handleBack}
      backDisabled={uploading}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-md">
          {uploadedUrl ? (
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 mb-4">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Upload Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your video has been successfully uploaded and is ready for processing.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Ready to Upload</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to start uploading your video for processing
              </p>
              
              <Button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="mb-6 px-8"
                size="lg"
              >
                {uploading ? "Uploading..." : "Start Upload"}
                {!uploading && <ArrowUp className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {uploading && (
            <div className="w-full">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">{progress}%</div>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800 mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </StepperLayout>
  );
} 