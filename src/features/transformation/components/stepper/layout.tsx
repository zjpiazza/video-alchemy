import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { StepperLayoutProps } from "./types";

export function StepperLayout({
  title,
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  nextDisabled = false,
  backLabel = "Back",
  backDisabled = false,
  hideNavigation = false,
}: StepperLayoutProps) {
  return (
    <Card className="w-full flex flex-col h-full min-h-[500px]">
      {title && (
        <CardHeader className="pb-0">
          <CardTitle className="text-xl text-center">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col flex-1 p-6">
        <div className="flex-1 overflow-auto">{children}</div>
        
        {!hideNavigation && (
          <div className="flex justify-between mt-auto pt-6 border-t">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={backDisabled}
              className="w-28"
            >
              {backLabel}
            </Button>
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              className="w-28"
            >
              {nextLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 