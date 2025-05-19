import React, { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useTransformation } from "../../contexts/transformation";
import { api } from '~/trpc/react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { TransformationStep } from "./types";
import { StepperLayout } from "./layout";

export function EffectSelectStep() {
  const { data: effects, isLoading } = api.effect.list.useQuery();
  const { setCurrentStep, setEffect, videoFile } = useTransformation();
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const handleSelect = (effectId: string) => {
    setSelectedEffectId(effectId);
  };

  const handleNext = () => {
    if (selectedEffectId) {
      setEffect(selectedEffectId);
      setCurrentStep(TransformationStep.Configure);
    }
  };

  const handleBack = () => {
    setCurrentStep(TransformationStep.SelectVideo);
  };

  return (
    <StepperLayout
      title="Select Effect"
      onNext={handleNext}
      nextDisabled={!selectedEffectId || isLoading}
      onBack={handleBack}
    >
      <div className="py-2">
        <Carousel className="w-full">
          <CarouselContent className="-mx-2">
            {effects?.map((effect) => (
              <CarouselItem key={effect.id} className="basis-1/3 px-2 flex justify-center">
                <Card
                  onClick={() => handleSelect(effect.id)}
                  className={`w-full cursor-pointer transition-all border-2 h-full
                    ${selectedEffectId === effect.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/60'}`}
                >
                  <CardHeader className="flex flex-col items-center gap-2 p-4">
                    {effect.icon && typeof effect.icon === 'string' ? (
                      <img src={effect.icon} alt={effect.name} className="h-12 w-12 mb-2" />
                    ) : effect.icon ? (
                      <span className="h-12 w-12 mb-2">{effect.icon}</span>
                    ) : null}
                    <CardTitle className="text-center text-base">{effect.name}</CardTitle>
                    <CardDescription className="text-center text-xs">{effect.description}</CardDescription>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-between mt-4">
            <CarouselPrevious className="relative left-0 translate-x-0" />
            <CarouselNext className="relative right-0 translate-x-0" />
          </div>
        </Carousel>
      </div>
    </StepperLayout>
  );
} 