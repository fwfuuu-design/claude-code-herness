"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface SteppedVisualizationOptions {
  totalSteps: number;
  autoPlayInterval?: number; // ms, default 2000
}

interface SteppedVisualizationReturn {
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  reset: () => void;
  goToStep: (step: number) => void;
  isPlaying: boolean;
  toggleAutoPlay: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useSteppedVisualization({
  totalSteps,
  autoPlayInterval = 2000,
}: SteppedVisualizationOptions): SteppedVisualizationReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
    },
    [totalSteps]
  );

  const toggleAutoPlay = useCallback(() => {
    if (reducedMotion) return;
    setIsPlaying((prev) => !prev);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) setIsPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (isPlaying && !reducedMotion) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSteps, autoPlayInterval, reducedMotion]);

  return {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    goToStep,
    isPlaying,
    toggleAutoPlay,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}
