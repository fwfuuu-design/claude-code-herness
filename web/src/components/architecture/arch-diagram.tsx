"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ArchitectureSnapshot } from "@/lib/architecture-data";
import { useTranslations } from "@/lib/i18n";

const CLASS_DESCRIPTIONS: Record<string, string> = {
  TodoManager: "Visible task planning with constraints",
  SkillLoader: "Dynamic knowledge injection from SKILL.md files",
  ContextManager: "Three-layer context compression pipeline",
  Task: "File-based persistent task with dependencies",
  TaskManager: "File-based persistent task CRUD with dependencies",
  BackgroundTask: "Single background execution unit",
  BackgroundManager: "Non-blocking thread execution + notification queue",
  TeammateManager: "Multi-agent team lifecycle and coordination",
  Teammate: "Individual agent identity and state tracking",
  SharedBoard: "Cross-agent shared state coordination",
  CronJob: "Durable recurring job definition",
  ProtocolState: "Pending team protocol requests and response matching",
  MCPClient: "External tool discovery and invocation client",
  RecoveryState: "Retry, fallback, and continuation state",
};

interface ArchDiagramProps {
  snapshot: ArchitectureSnapshot;
}

function getNodeTone(): { border: string; bg: string } {
  return {
    border: "border-[var(--color-compass-gold)]",
    bg: "bg-[var(--color-carbon)]",
  };
}

export function ArchDiagram({ snapshot }: ArchDiagramProps) {
  const t = useTranslations("architecture");
  const reduceMotion = useReducedMotion();
  const reversed = [...snapshot.classes].reverse();

  return (
    <div className="space-y-3">
      {reversed.map((cls, i) => {
        const isNew = cls.isNew;
        const colorClasses = getNodeTone();

        return (
          <div key={cls.name}>
            {i > 0 && (
              <div className="flex justify-center py-1">
                <motion.svg
                  width="24"
                  height="20"
                  viewBox="0 0 24 20"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduceMotion ? 0 : i * 0.08 + 0.05 }}
                >
                  <motion.line
                    x1={12}
                    y1={0}
                    x2={12}
                    y2={14}
                    stroke="var(--color-text-secondary)"
                    strokeWidth={1.5}
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : i * 0.08 }}
                  />
                  <motion.polygon
                    points="7,12 12,19 17,12"
                    fill="var(--color-text-secondary)"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: reduceMotion ? 0 : i * 0.08 + 0.2 }}
                  />
                </motion.svg>
              </div>
            )}
            <motion.div
            key={cls.name}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.08, duration: reduceMotion ? 0 : 0.2 }}
            className={cn(
              "rounded-lg border-2 px-4 py-3 transition-colors",
              isNew
                ? cn(colorClasses.border, colorClasses.bg)
                : "border-[var(--color-graphite)] bg-[var(--color-carbon)]"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    isNew
                      ? "text-[var(--color-chalk)]"
                      : "text-[var(--color-smoke)]"
                  )}
                >
                  {cls.name}
                </span>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    isNew
                      ? "text-[var(--color-ash)]"
                      : "text-[var(--color-smoke)]"
                  )}
                >
                  {CLASS_DESCRIPTIONS[cls.name] ? t(`class_${cls.name}`) : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-smoke)]">
                  {cls.introducedIn}
                </span>
                {isNew && (
                  <span className="rounded-[var(--radius-label)] border border-[var(--color-accent)] bg-[var(--color-carbon)] px-2 py-0.5 font-mono text-[10px] font-normal uppercase text-[var(--color-chalk)]">
                    {t("new")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        );
      })}

      {snapshot.classes.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-graphite)] bg-[var(--color-carbon)] px-4 py-6 text-center text-sm text-[var(--color-smoke)]">
          {t("functions_only")}
        </div>
      )}

      {snapshot.tools.length > 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : reversed.length * 0.08 + 0.1 }}
          className="flex flex-wrap gap-1.5 pt-2"
        >
          {snapshot.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-[var(--radius-label)] border border-[var(--color-graphite)] bg-[var(--color-carbon)] px-2 py-1 font-mono text-xs text-[var(--color-ash)]"
            >
              {tool}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
