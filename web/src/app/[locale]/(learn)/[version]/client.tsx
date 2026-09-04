"use client";

import { lazy, Suspense } from "react";
import { ArchDiagram } from "@/components/architecture/arch-diagram";
import { WhatsNew } from "@/components/diff/whats-new";
import { DesignDecisions } from "@/components/architecture/design-decisions";
import { DocRenderer } from "@/components/docs/doc-renderer";
import { AgentLoopSimulator } from "@/components/simulator/agent-loop-simulator";
import { ExecutionFlow } from "@/components/architecture/execution-flow";
import { SessionVisualization } from "@/components/visualizations";
import { Tabs } from "@/components/ui/tabs";
import type { ArchitectureSnapshot } from "@/lib/architecture-data";
import { useTranslations } from "@/lib/i18n";

const SourceViewer = lazy(() =>
  import("@/components/code/source-viewer").then((module) => ({ default: module.SourceViewer }))
);

interface VersionDetailClientProps {
  version: string;
  diff: {
    from: string;
    to: string;
    newClasses: string[];
    newFunctions: string[];
    newTools: string[];
    locDelta: number;
  } | null;
  docHtml: string;
  translationFallback: boolean;
  translationMissingLabel: string;
  architecture: ArchitectureSnapshot;
}

export function VersionDetailClient({
  version,
  diff,
  docHtml,
  translationFallback,
  translationMissingLabel,
  architecture,
}: VersionDetailClientProps) {
  const t = useTranslations("version");

  const tabs = [
    { id: "learn", label: t("tab_learn") },
    { id: "simulate", label: t("tab_simulate") },
    { id: "code", label: t("tab_code") },
    { id: "deep-dive", label: t("tab_deep_dive") },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Visualization */}
      <div className="chapter-visualization">
        <SessionVisualization version={version} />
      </div>

      {/* Tabbed content */}
      <div id="chapter-content">
        <Tabs tabs={tabs} defaultTab="learn">
          {(activeTab) => (
            <>
              {activeTab === "learn" && (
                <DocRenderer
                  html={docHtml}
                  translationFallback={translationFallback}
                  translationMissingLabel={translationMissingLabel}
                />
              )}
              {activeTab === "simulate" && <AgentLoopSimulator version={version} />}
              {activeTab === "code" && (
                <Suspense fallback={<TabLoading label={t("loading_source")} />}>
                  <SourceViewer version={version} />
                </Suspense>
              )}
              {activeTab === "deep-dive" && (
                <div className="space-y-10">
                  <section>
                    <h2 className="mb-4 font-display text-2xl font-normal">{t("execution_flow")}</h2>
                    <ExecutionFlow version={version} />
                  </section>
                  <section>
                    <h2 className="mb-4 font-display text-2xl font-normal">{t("architecture")}</h2>
                    <ArchDiagram snapshot={architecture} />
                  </section>
                  {diff && <WhatsNew diff={diff} />}
                  <DesignDecisions version={version} />
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function TabLoading({ label }: { label: string }) {
  return (
    <div role="status" className="min-h-40 border border-[var(--color-border)] bg-[var(--color-carbon)] p-5 text-sm text-[var(--color-smoke)]">
      {label}
    </div>
  );
}
