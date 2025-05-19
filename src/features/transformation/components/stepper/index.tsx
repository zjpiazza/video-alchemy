import React from "react";
import { TransformationStep } from "./types";

export function TransformationStepper({ currentStep = 0 }: { currentStep?: number | TransformationStep }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {Object.values(TransformationStep).map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < Number(currentStep);
        
        return (
          <div key={step} className="flex-1 relative">
            {/* Connector line */}
            {idx > 0 && (
              <div className={`absolute top-4 left-0 right-0 h-0.5 -translate-y-1/2 ${isPast ? 'bg-primary' : 'bg-muted'}`} 
                style={{ left: '-50%', right: '50%' }} />
            )}
            
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div 
                className={`rounded-full w-8 h-8 flex items-center justify-center z-10 transition-colors
                  ${isActive ? 'bg-primary text-white' : 
                    isPast ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-muted text-muted-foreground'}`}
              >
                {idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium transition-colors
                ${isActive ? 'text-primary' : isPast ? 'text-primary/80' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 