"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import type { SimStep } from "@/types/agent-data";
import { User, Bot, Terminal, ArrowRight, AlertCircle } from "lucide-react";

interface SimulatorMessageProps {
  step: SimStep;
  index: number;
}

const TYPE_CONFIG: Record<
  string,
  { icon: typeof User; label: string; bgClass: string; borderClass: string }
> = {
  user_message: {
    icon: User,
    label: "User",
    bgClass: "bg-[var(--color-surface)]",
    borderClass: "border-[var(--color-graphite)] border-r-2 border-r-[var(--color-ash)]",
  },
  assistant_text: {
    icon: Bot,
    label: "Assistant",
    bgClass: "bg-[var(--color-surface)]",
    borderClass: "border-[var(--color-graphite)] border-l-2 border-l-[var(--color-ash)]",
  },
  tool_call: {
    icon: Terminal,
    label: "Tool Call",
    bgClass: "bg-[var(--color-carbon)]",
    borderClass: "border-[var(--color-graphite)] border-l-2 border-l-[var(--color-compass-gold)]",
  },
  tool_result: {
    icon: ArrowRight,
    label: "Tool Result",
    bgClass: "bg-[var(--color-carbon)]",
    borderClass: "border-[var(--color-graphite)] border-l-2 border-l-[var(--color-pulse-green)]",
  },
  system_event: {
    icon: AlertCircle,
    label: "System",
    bgClass: "bg-[var(--color-carbon)]",
    borderClass: "border-dashed border-[var(--color-iron)]",
  },
};

export function SimulatorMessage({ step, index }: SimulatorMessageProps) {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("sim");
  const config = TYPE_CONFIG[step.type] || TYPE_CONFIG.assistant_text;
  const Icon = config.icon;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={cn(
        "rounded-lg border p-3",
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Icon size={14} className="shrink-0 text-[var(--color-text-secondary)]" />
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {t(`type_${step.type}`)}
          {step.toolName && (
            <span className="ml-1.5 font-mono text-[var(--color-text)]">
              {step.toolName}
            </span>
          )}
        </span>
      </div>

      {step.type === "tool_call" || step.type === "tool_result" ? (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-zinc-900 p-2.5 font-mono text-xs leading-relaxed text-zinc-100 dark:bg-zinc-950">
          {step.content || t("empty_result")}
        </pre>
      ) : step.type === "system_event" ? (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[var(--color-surface)] p-2.5 font-mono text-xs leading-relaxed text-[var(--color-ash)]">
          {step.content}
        </pre>
      ) : (
        <p className="text-sm leading-relaxed">{step.content}</p>
      )}

      <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">
        {step.annotation}
      </p>
    </motion.div>
  );
}
