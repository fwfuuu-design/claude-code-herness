"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { localizeVisualizationStep } from "@/data/visualization-localization";
import { useLocale, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isPlaying: boolean;
  onToggleAutoPlay: () => void;
  stepTitle: string;
  stepDescription: string;
  version?: string;
  className?: string;
}

export function StepControls({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
  isPlaying,
  onToggleAutoPlay,
  stepTitle,
  stepDescription,
  version,
  className,
}: StepControlsProps) {
  const t = useTranslations("sim");
  const locale = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const localizedStep = localizeVisualizationStep(locale, version, currentStep, {
    title: stepTitle,
    description: stepDescription,
  });
  const controlClass =
    "flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-transparent text-[var(--color-smoke)] transition-colors hover:border-[var(--color-iron)] hover:text-[var(--color-chalk)] disabled:opacity-30";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-[var(--radius-card)] border border-[var(--color-graphite)] border-l-2 border-l-[var(--color-compass-gold)] bg-[var(--color-carbon)] px-4 py-3">
        <div className="mb-1 text-sm font-medium text-[var(--color-chalk)]">
          {localizedStep.title}
        </div>
        <div className="text-sm text-[var(--color-smoke)]">
          {localizedStep.description}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className={controlClass}
            title={t("reset")}
            aria-label={t("reset")}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep === 0}
            className={controlClass}
            title={t("previous_step")}
            aria-label={t("previous_step")}
          >
            <SkipBack size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggleAutoPlay}
            disabled={reducedMotion}
            className={controlClass}
            title={reducedMotion ? t("manual_mode") : isPlaying ? t("pause") : t("auto_play")}
            aria-label={reducedMotion ? t("manual_mode") : isPlaying ? t("pause") : t("auto_play")}
          >
            {isPlaying ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className={controlClass}
            title={t("next_step")}
            aria-label={t("next_step")}
          >
            <SkipForward size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-[var(--color-pulse-green)]"
                    : index < currentStep
                      ? "bg-[var(--color-compass-gold)]"
                      : "bg-[var(--color-graphite)]"
                )}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-[var(--color-smoke)]">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
