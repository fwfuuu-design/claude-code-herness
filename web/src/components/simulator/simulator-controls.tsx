"use client";

import { useTranslations } from "@/lib/i18n";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatorControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  currentIndex: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export function SimulatorControls({
  isPlaying,
  isComplete,
  currentIndex,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}: SimulatorControlsProps) {
  const t = useTranslations("sim");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        {isPlaying ? (
          <button
            onClick={onPause}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-signal-white)] text-[var(--color-carbon)] transition-opacity hover:opacity-80"
            title={t("pause")}
            aria-label={t("pause")}
          >
            <Pause size={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={isComplete}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-signal-white)] text-[var(--color-carbon)] transition-opacity hover:opacity-80 disabled:opacity-40"
            title={t("play")}
            aria-label={t("play")}
          >
            <Play size={16} aria-hidden="true" />
          </button>
        )}
        <button
          onClick={onStep}
          disabled={isComplete}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-iron)] transition-colors hover:border-[var(--color-ash)] disabled:opacity-40"
          title={t("step")}
          aria-label={t("step")}
        >
          <SkipForward size={16} aria-hidden="true" />
        </button>
        <button
          onClick={onReset}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-iron)] transition-colors hover:border-[var(--color-ash)]"
          title={t("reset")}
          aria-label={t("reset")}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {t("speed")}:
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              "min-h-11 rounded-[var(--radius-label)] px-2 text-xs font-medium transition-colors",
              speed === s
                ? "border border-[var(--color-chalk)] bg-[var(--color-chalk)] text-[var(--color-carbon)]"
                : "border border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            )}
          >
            {s}x
          </button>
        ))}
      </div>

      <span className="ml-auto text-xs tabular-nums text-[var(--color-text-secondary)]">
        {Math.max(0, currentIndex + 1)} {t("step_of")} {totalSteps}
      </span>
    </div>
  );
}
