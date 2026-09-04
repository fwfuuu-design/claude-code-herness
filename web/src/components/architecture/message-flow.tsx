"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const FLOW_STEPS = [
  { role: "user", label: "user", tone: "border-r-[var(--color-ash)]" },
  { role: "assistant", label: "assistant", tone: "border-l-[var(--color-ash)]" },
  { role: "tool_call", label: "tool_call", tone: "border-[var(--color-compass-gold)]" },
  { role: "tool_result", label: "tool_result", tone: "border-l-[var(--color-pulse-green)]" },
  { role: "assistant", label: "assistant", tone: "border-l-[var(--color-ash)]" },
  { role: "tool_call", label: "tool_call", tone: "border-[var(--color-compass-gold)]" },
  { role: "tool_result", label: "tool_result", tone: "border-l-[var(--color-pulse-green)]" },
  { role: "assistant", label: "assistant (final)", tone: "border-l-[var(--color-ash)]" },
];

export function MessageFlow() {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setCount(FLOW_STEPS.length);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev >= FLOW_STEPS.length) {
          if (!restartRef.current) {
            restartRef.current = setTimeout(() => {
              setCount(0);
              restartRef.current = null;
            }, 1500);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (restartRef.current) clearTimeout(restartRef.current);
    };
  }, [reduceMotion]);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-carbon)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          messages[]
        </span>
        <span className="ml-auto rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs tabular-nums dark:bg-zinc-800">
          len={count}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <AnimatePresence>
          {FLOW_STEPS.slice(0, count).map((step, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className={`flex shrink-0 items-center rounded-[var(--radius-label)] border border-[var(--color-graphite)] bg-[var(--color-surface)] px-2.5 py-1.5 ${step.tone}`}
            >
              <span className="whitespace-nowrap font-mono text-[10px] font-medium text-white">
                {step.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {count === 0 && (
          <div className="flex h-7 items-center text-xs text-[var(--color-text-secondary)]">
            []
          </div>
        )}
      </div>
    </div>
  );
}
