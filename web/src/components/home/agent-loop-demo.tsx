"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SimStep, SimStepType } from "@/types/agent-data";

const STEP_TYPES: SimStepType[] = [
  "user_message",
  "assistant_text",
  "tool_call",
  "tool_result",
  "assistant_text",
];

const NODE_LABELS = ["USER", "MODEL", "TOOL_USE", "TOOL_RESULT", "MODEL"];

interface AgentLoopDemoProps {
  compact?: boolean;
}

export function AgentLoopDemo({ compact = false }: AgentLoopDemoProps) {
  const t = useTranslations("home");
  const tSim = useTranslations("sim");
  const reduceMotion = !!useReducedMotion();
  const steps = useMemo<SimStep[]>(
    () =>
      STEP_TYPES.map((type, index) => ({
        type,
        content: t(`loop_step_${index + 1}_content`),
        annotation: t(`loop_step_${index + 1}_annotation`),
        ...(type === "tool_call" || type === "tool_result"
          ? { toolName: "bash" }
          : {}),
      })),
    [t]
  );
  const simulator = useSimulator(steps);
  const activeIndex = Math.max(0, simulator.currentIndex);
  const currentStep = simulator.currentIndex >= 0 ? steps[simulator.currentIndex] : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-carbon)]",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-smoke)]">
            {t("loop_label")}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--color-chalk)]">messages[]</p>
        </div>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--color-smoke)]">
          <span className={cn("status-dot", simulator.isPlaying && "animate-pulse")} />
          {simulator.isPlaying ? t("loop_running") : t("loop_ready")}
        </span>
      </div>

      <div className="flex w-full items-center" aria-label={t("loop_path_label")}>
        {NODE_LABELS.map((label, index) => {
          const reached = simulator.currentIndex >= index;
          const active = simulator.currentIndex === index;
          return (
            <div className="contents" key={`${label}-${index}`}>
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { y: active && simulator.isPlaying ? -2 : 0, opacity: index <= activeIndex ? 1 : 0.48 }
                }
                transition={{ duration: 0.18 }}
                className={cn(
                  "grid min-h-14 min-w-0 flex-1 place-items-center border px-1 text-center font-mono text-[8px] leading-tight sm:text-[10px]",
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-chalk)]"
                    : reached
                      ? "border-[var(--color-ash)] text-[var(--color-chalk)]"
                      : "border-[var(--color-graphite)] text-[var(--color-smoke)]"
                )}
                aria-current={active ? "step" : undefined}
              >
                <span className="break-all sm:break-normal">{label}</span>
              </motion.div>
              {index < NODE_LABELS.length - 1 && (
                <span
                  className={cn(
                    "h-px w-2 shrink-0 sm:w-4",
                    simulator.currentIndex > index
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-graphite)]"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "mt-5 border-l border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3",
          compact ? "min-h-24" : "min-h-32"
        )}
        aria-live="polite"
      >
        {currentStep ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">
              {String(simulator.currentIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </p>
            {!compact && (
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-chalk)]">
                {currentStep.content}
              </pre>
            )}
            <p className={cn("text-sm leading-relaxed text-[var(--color-ash)]", compact ? "mt-2" : "mt-3")}>
              {currentStep.annotation}
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--color-smoke)]">{t("loop_idle")}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {simulator.isPlaying ? (
          <ControlButton onClick={simulator.pause} label={tSim("pause")} icon={Pause} />
        ) : (
          <ControlButton
            onClick={simulator.play}
            label={tSim("play")}
            icon={Play}
            disabled={simulator.isComplete || reduceMotion}
            title={reduceMotion ? t("loop_manual_mode") : undefined}
          />
        )}
        <ControlButton
          onClick={simulator.stepForward}
          label={tSim("step")}
          icon={SkipForward}
          disabled={simulator.isComplete}
        />
        <ControlButton onClick={simulator.reset} label={tSim("reset")} icon={RotateCcw} />
        <span className="col-span-2 flex min-h-11 items-center justify-center font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-smoke)] sm:ml-auto">
          {reduceMotion ? t("loop_manual_mode") : `${Math.max(0, simulator.currentIndex + 1)} ${tSim("step_of")} ${steps.length}`}
        </span>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  icon: Icon,
  disabled,
  title,
  onClick,
}: {
  label: string;
  icon: typeof Play;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--color-iron)] px-3 font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--color-chalk)] transition-colors hover:border-[var(--color-ash)] disabled:text-[var(--color-smoke)]"
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );
}
