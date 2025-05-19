import React, { useMemo, useState } from "react";
import { useTransformation } from "../../contexts/transformation";
import { api } from '~/trpc/react';
import { TransformationStep } from "./types";
import { StepperLayout } from "./layout";
import { Input } from "~/components/ui/input";

export function ConfigureStep() {
  const { effect: selectedEffectId, setEffectParams, setCurrentStep } = useTransformation();
  const { data: effects } = api.effect.list.useQuery();
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    // TODO: Validate the effect parameters
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      setEffectParams(params);
      setCurrentStep(TransformationStep.Upload);
    } else {
      setError("Please fill out required fields.");
    }
  };

  const handleBack = () => {
    setCurrentStep(TransformationStep.SelectEffect);
  };

  // Find the selected effect object
  const selectedEffect = useMemo(() => effects?.find(e => e.id === selectedEffectId), [effects, selectedEffectId]);
  const [params, setParams] = useState<Record<string, any>>(() => (
    selectedEffect && typeof selectedEffect.defaultParams === 'object' && selectedEffect.defaultParams !== null
      ? { ...selectedEffect.defaultParams }
      : {}
  ));

  // Update params when effect changes
  React.useEffect(() => {
    setParams(
      selectedEffect && typeof selectedEffect.defaultParams === 'object' && selectedEffect.defaultParams !== null
        ? { ...selectedEffect.defaultParams }
        : {}
    );
  }, [selectedEffect]);

  if (!selectedEffect) {
    return (
      <StepperLayout
        title="Configure Effect"
        onNext={handleNext}
        nextDisabled={true}
        onBack={handleBack}
      >
        <div className="p-8 text-center text-muted-foreground">No effect selected.</div>
      </StepperLayout>
    );
  }

  // Render a form field for each param
  const renderField = (key: string, value: any) => {
    // Number
    if (typeof value === 'number') {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 font-medium capitalize text-sm">{key}</label>
          <Input
            type="number"
            value={params[key] ?? ''}
            onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: Number(e.target.value) }))}
            className="w-full"
          />
        </div>
      );
    }
    // String (could be select for known options)
    if (typeof value === 'string') {
      // Example: direction, type, color
      if (key === 'direction') {
        return (
          <div key={key} className="mb-4">
            <label className="block mb-1 font-medium capitalize text-sm">{key}</label>
            <select
              className="w-full border rounded px-3 py-2 bg-background"
              value={params[key]}
              onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.value }))}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
        );
      }
      if (key === 'type') {
        return (
          <div key={key} className="mb-4">
            <label className="block mb-1 font-medium capitalize text-sm">{key}</label>
            <select
              className="w-full border rounded px-3 py-2 bg-background"
              value={params[key]}
              onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.value }))}
            >
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
          </div>
        );
      }
      if (key === 'color') {
        return (
          <div key={key} className="mb-4">
            <label className="block mb-1 font-medium capitalize text-sm">{key}</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={params[key] ?? ''}
                onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.value }))}
                placeholder="e.g. red, #ff0000"
                className="w-full"
              />
              <Input
                type="color"
                value={params[key]?.startsWith('#') ? params[key] : '#000000'}
                onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.value }))}
                className="w-12 p-1 h-full"
              />
            </div>
          </div>
        );
      }
      // Default string input
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 font-medium capitalize text-sm">{key}</label>
          <Input
            type="text"
            value={params[key] ?? ''}
            onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.value }))}
            className="w-full"
          />
        </div>
      );
    }
    // Boolean
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!params[key]}
            onChange={e => setParams((p: Record<string, any>) => ({ ...p, [key]: e.target.checked }))}
            className="h-4 w-4"
          />
          <label className="font-medium capitalize text-sm">{key}</label>
        </div>
      );
    }
    return null;
  };

  return (
    <StepperLayout
      title={`Configure: ${selectedEffect.name}`}
      onNext={handleNext}
      onBack={handleBack}
    >
      <div className="max-w-md mx-auto">
        {selectedEffect.defaultParams &&
          Object.entries(selectedEffect.defaultParams).map(([key, value]) => renderField(key, value))}
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
      </div>
    </StepperLayout>
  );
} 