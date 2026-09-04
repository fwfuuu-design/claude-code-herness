"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import versionsData from "@/data/generated/versions.json";

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
  version: string;
}

function getNodeTone(): { border: string; bg: string } {
  return {
    border: "border-[var(--color-compass-gold)]",
    bg: "bg-[var(--color-carbon)]",
  };
}

function collectClassesForVersion(
  targetId: string
): { name: string; introducedIn: string }[] {
  const targetIndex = versionsData.versions.findIndex((v) => v.id === targetId);
  const version = targetIndex >= 0 ? versionsData.versions[targetIndex] : undefined;

  return (
    version?.classes?.map((cls) => ({
      name: cls.name,
      introducedIn:
        versionsData.versions
          .slice(0, targetIndex + 1)
          .find((candidate) =>
            candidate.classes?.some((candidateCls) => candidateCls.name === cls.name)
          )?.id ?? targetId,
    })) ?? []
  );
}

function getNewClassNames(version: string): Set<string> {
  const diff = versionsData.diffs.find((d) => d.to === version);
  if (!diff) {
    const v = versionsData.versions.find((ver) => ver.id === version);
    return new Set(v?.classes?.map((c) => c.name) ?? []);
  }
  return new Set(diff.newClasses ?? []);
}

export function ArchDiagram({ version }: ArchDiagramProps) {
  const reduceMotion = useReducedMotion();
  const allClasses = collectClassesForVersion(version);
  const newClassNames = getNewClassNames(version);
  const versionData = versionsData.versions.find((v) => v.id === version);
  const tools = versionData?.tools ?? [];

  const reversed = [...allClasses].reverse();

  return (
    <div className="space-y-3">
      {reversed.map((cls, i) => {
        const isNew = newClassNames.has(cls.name);
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
                : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    isNew
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {cls.name}
                </span>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    isNew
                      ? "text-zinc-600 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {CLASS_DESCRIPTIONS[cls.name] || ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {cls.introducedIn}
                </span>
                {isNew && (
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-white dark:text-zinc-900">
                    NEW
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        );
      })}

      {allClasses.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-600">
          No classes in this version (functions only)
        </div>
      )}

      {tools.length > 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : reversed.length * 0.08 + 0.1 }}
          className="flex flex-wrap gap-1.5 pt-2"
        >
          {tools.map((tool) => (
            <span
              key={tool}
              className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tool}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
