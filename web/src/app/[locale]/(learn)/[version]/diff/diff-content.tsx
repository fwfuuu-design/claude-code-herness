"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "@/lib/i18n";
import { VERSION_META } from "@/lib/constants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/ui/badge";
import { CodeDiff } from "@/components/diff/code-diff";
import { ArrowLeft, Plus, Minus, FileCode, Wrench, Box, FunctionSquare } from "lucide-react";
import type { AgentVersion, VersionDiff, VersionIndex } from "@/types/agent-data";
import versionData from "@/data/generated/versions.json";

const data = versionData as VersionIndex;

interface DiffPageContentProps {
  version: string;
}

export function DiffPageContent({ version }: DiffPageContentProps) {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tSession = useTranslations("sessions");
  const tSubtitle = useTranslations("session_subtitles");
  const tLayer = useTranslations("layer_labels");
  const meta = VERSION_META[version as keyof typeof VERSION_META];

  const { currentVersion, prevVersion, diff } = useMemo(() => {
    const current = data.versions.find((v) => v.id === version);
    const prevId = meta?.prevVersion;
    const prev = prevId ? data.versions.find((v) => v.id === prevId) : null;
    const d = data.diffs.find((d) => d.to === version);
    return { currentVersion: current, prevVersion: prev, diff: d };
  }, [version, meta]);

  if (!meta || !currentVersion) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">Version not found.</p>
        <Link href={`/${locale}/course`} className="mt-4 inline-block text-sm text-[var(--color-chalk)] underline decoration-[var(--color-compass-gold)]">
          Back to {tNav("course")}
        </Link>
      </div>
    );
  }

  if (!prevVersion || !diff) {
    return (
      <div className="py-12">
        <Link
          href={`/${locale}/${version}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to {tSession(version)}
        </Link>
        <h1 className="text-3xl font-normal">{tSession(version)}</h1>
        <p className="mt-4 text-zinc-500">
          This is the first version -- there is no previous version to compare against.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Link
        href={`/${locale}/${version}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        Back to {tSession(version)}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {tSession(prevVersion.id)} → {tSession(version)}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {prevVersion.id} ({prevVersion.loc} LOC) → {version} ({currentVersion.loc} LOC)
        </p>
      </div>

      {/* Structural Diff */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileCode size={16} />
              <span className="text-sm">LOC Delta</span>
            </div>
          </CardHeader>
          <CardTitle>
            <span className="font-mono text-[var(--color-chalk)]">
              {diff.locDelta >= 0 ? "+" : ""}{diff.locDelta}
            </span>
            <span className="ml-2 text-sm font-normal text-zinc-500">lines</span>
          </CardTitle>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Wrench size={16} />
              <span className="text-sm">New Tools</span>
            </div>
          </CardHeader>
          <CardTitle>
            <span className="font-mono text-[var(--color-chalk)]">{diff.newTools.length}</span>
          </CardTitle>
          {diff.newTools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {diff.newTools.map((tool) => (
                <span key={tool} className="rounded-[var(--radius-label)] border-l-2 border-l-[var(--color-compass-gold)] bg-[var(--color-carbon)] px-1.5 py-0.5 text-xs text-[var(--color-ash)]">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Box size={16} />
              <span className="text-sm">New Classes</span>
            </div>
          </CardHeader>
          <CardTitle>
            <span className="font-mono text-[var(--color-chalk)]">{diff.newClasses.length}</span>
          </CardTitle>
          {diff.newClasses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {diff.newClasses.map((cls) => (
                <span key={cls} className="rounded-[var(--radius-label)] border-l-2 border-l-[var(--color-compass-gold)] bg-[var(--color-carbon)] px-1.5 py-0.5 text-xs text-[var(--color-ash)]">
                  {cls}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FunctionSquare size={16} />
              <span className="text-sm">New Functions</span>
            </div>
          </CardHeader>
          <CardTitle>
            <span className="font-mono text-[var(--color-chalk)]">{diff.newFunctions.length}</span>
          </CardTitle>
          {diff.newFunctions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {diff.newFunctions.map((fn) => (
                <span key={fn} className="rounded-[var(--radius-label)] border-l-2 border-l-[var(--color-compass-gold)] bg-[var(--color-carbon)] px-1.5 py-0.5 text-xs text-[var(--color-ash)]">
                  {fn}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Version Info Comparison */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-l-2 border-l-[var(--color-smoke)] opacity-70">
          <CardHeader>
            <CardTitle>{tSession(prevVersion.id)}</CardTitle>
            <p className="text-sm text-zinc-500">{tSubtitle(prevVersion.id)}</p>
          </CardHeader>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>{prevVersion.loc} LOC</p>
            <p>{prevVersion.tools.length} tools: {prevVersion.tools.join(", ")}</p>
            <LayerBadge layer={prevVersion.layer}>{tLayer(prevVersion.layer)}</LayerBadge>
          </div>
        </Card>
        <Card className="border-l-2 border-l-[var(--color-compass-gold)]">
          <CardHeader>
            <CardTitle>{tSession(version)}</CardTitle>
            <p className="text-sm text-zinc-500">{tSubtitle(version)}</p>
          </CardHeader>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>{currentVersion.loc} LOC</p>
            <p>{currentVersion.tools.length} tools: {currentVersion.tools.join(", ")}</p>
            <LayerBadge layer={currentVersion.layer}>{tLayer(currentVersion.layer)}</LayerBadge>
          </div>
        </Card>
      </div>

      {/* Code Diff */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Source Code Diff</h2>
        <CodeDiff
          oldSource={prevVersion.source}
          newSource={currentVersion.source}
          oldLabel={`${prevVersion.id} (${prevVersion.filename})`}
          newLabel={`${version} (${currentVersion.filename})`}
        />
      </div>
    </div>
  );
}
