"use client";

import { lazy, Suspense } from "react";
import { useTranslations } from "@/lib/i18n";

const visualizations: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<{ title?: string }>>
> = {
  s01: lazy(() => import("./s01-agent-loop")),
  s02: lazy(() => import("./s02-tool-dispatch")),
  s03: lazy(() => import("./s03-permission")),
  s04: lazy(() => import("./s04-hooks")),
  s05: lazy(() => import("./s03-todo-write")),
  s06: lazy(() => import("./s06-subagent")),
  s07: lazy(() => import("./s07-skill-loading")),
  s08: lazy(() => import("./s08-context-compact")),
  s09: lazy(() => import("./s09-memory")),
  s10: lazy(() => import("./s10-task-system")),
  s11: lazy(() => import("./s11-background-tasks")),
  s12: lazy(() => import("./s12-cron-scheduler")),
  s13: lazy(() => import("./s13-team-runtime")),
  s14: lazy(() => import("./s14-mcp-tools")),
  s15: lazy(() => import("./s15-integrated-harness")),
};

export function SessionVisualization({ version }: { version: string }) {
  const t = useTranslations("viz");
  const Component = visualizations[version];
  if (!Component) return <GenericSystemView title={t(version)} version={version} />;
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      }
    >
      <div className="min-h-[500px]">
        <Component title={t(version)} />
      </div>
    </Suspense>
  );
}

function GenericSystemView({ title, version }: { title: string; version: string }) {
  const t = useTranslations("viz");
  return (
    <section className="grid min-h-[22rem] place-items-center border border-[var(--color-border)] bg-[var(--color-carbon)] p-6" aria-label={title}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-smoke)]">{version} / {t("system_view")}</p>
          <span className="status-dot" aria-hidden="true" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-normal">{title}</h2>
        <div className="mt-10 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 font-mono text-[9px] sm:text-xs">
          <span className="grid min-h-20 place-items-center border border-[var(--color-ash)] p-2 text-center">{t("model")}</span>
          <span className="text-[var(--color-accent)]" aria-hidden="true">→</span>
          <span className="grid min-h-20 place-items-center border border-[var(--color-accent)] p-2 text-center">{version === "s16" ? t("workflow") : t("evaluator")}</span>
          <span className="text-[var(--color-accent)]" aria-hidden="true">→</span>
          <span className="grid min-h-20 place-items-center border border-[var(--color-ash)] p-2 text-center">{t("result")}</span>
        </div>
      </div>
    </section>
  );
}
