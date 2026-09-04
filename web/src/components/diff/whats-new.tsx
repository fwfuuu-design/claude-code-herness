"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "@/lib/i18n";
import { Card } from "@/components/ui/card";

interface WhatsNewProps {
  diff: {
    from: string;
    to: string;
    newClasses: string[];
    newFunctions: string[];
    newTools: string[];
    locDelta: number;
  } | null;
}

export function WhatsNew({ diff }: WhatsNewProps) {
  const t = useTranslations("version");
  const td = useTranslations("diff");
  const reduceMotion = useReducedMotion();

  if (!diff) {
    return null;
  }

  const hasContent =
    diff.newClasses.length > 0 ||
    diff.newTools.length > 0 ||
    diff.newFunctions.length > 0 ||
    diff.locDelta !== 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("whats_new")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {diff.newClasses.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.1 }}
          >
            <Card className="h-full">
              <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {td("new_classes")}
              </h3>
              <div className="space-y-1.5">
                {diff.newClasses.map((cls) => (
                  <div
                    key={cls}
                    className="rounded-[var(--radius-label)] border-l-2 border-l-[var(--color-compass-gold)] bg-[var(--color-carbon)] px-3 py-1.5 font-mono text-sm text-[var(--color-chalk)]"
                  >
                    {cls}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {diff.newTools.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.15 }}
          >
            <Card className="h-full">
              <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {td("new_tools")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {diff.newTools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-[var(--radius-label)] border border-[var(--color-graphite)] bg-[var(--color-carbon)] px-3 py-1 font-mono text-xs text-[var(--color-ash)]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {diff.newFunctions.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 }}
          >
            <Card className="h-full">
              <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {td("new_functions")}
              </h3>
              <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {diff.newFunctions.map((fn) => (
                  <li key={fn} className="font-mono">
                    <span className="text-zinc-400 dark:text-zinc-500">
                      def{" "}
                    </span>
                    {fn}()
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {diff.locDelta !== 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.25 }}
          >
            <Card className="flex h-full items-center">
              <div>
                <h3 className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {td("loc_delta")}
                </h3>
                <p className="font-mono text-2xl text-[var(--color-chalk)]">
                  {diff.locDelta >= 0 ? "+" : ""}{diff.locDelta} {td("lines")}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
