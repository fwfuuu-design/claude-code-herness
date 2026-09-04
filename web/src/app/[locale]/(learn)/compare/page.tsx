"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ArrowRight, Box, Braces, FileCode2, Wrench } from "lucide-react";
import { ArchDiagram } from "@/components/architecture/arch-diagram";
import { CodeDiff } from "@/components/diff/code-diff";
import { LayerBadge } from "@/components/ui/badge";
import { buildArchitectureSnapshot } from "@/lib/architecture-data";
import { LEARNING_PATH, VERSION_META, type VersionId } from "@/lib/constants";
import { useTranslations } from "@/lib/i18n";
import versionData from "@/data/generated/versions.json";
import type { AgentVersion, VersionIndex } from "@/types/agent-data";

const data = versionData as VersionIndex;
const PRESETS = [
  ["s01", "s02", "dispatch"],
  ["s03", "s04", "hooks"],
  ["s08", "s09", "memory"],
  ["s10", "s13", "teams"],
  ["s14", "s15", "integration"],
  ["s15", "s16", "workflow"],
  ["s16", "s17", "goal"],
] as const;

function names(items: Array<{ name: string }>) {
  return items.map((item) => item.name);
}

function difference(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

export default function ComparePage() {
  const t = useTranslations("compare");
  const tSession = useTranslations("sessions");
  const tSubtitle = useTranslations("session_subtitles");
  const tLayer = useTranslations("layer_labels");
  const [versionA, setVersionA] = useState<VersionId>("s01");
  const [versionB, setVersionB] = useState<VersionId>("s02");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const a = query.get("a");
    const b = query.get("b");
    if (LEARNING_PATH.includes(a as VersionId)) setVersionA(a as VersionId);
    if (LEARNING_PATH.includes(b as VersionId)) setVersionB(b as VersionId);
  }, []);

  const infoA = data.versions.find((version) => version.id === versionA)!;
  const infoB = data.versions.find((version) => version.id === versionB)!;
  const architectureA = useMemo(
    () => buildArchitectureSnapshot(data.versions, data.diffs, versionA),
    [versionA]
  );
  const architectureB = useMemo(
    () => buildArchitectureSnapshot(data.versions, data.diffs, versionB),
    [versionB]
  );
  const comparison = useMemo(() => {
    const toolsA = infoA.tools;
    const toolsB = infoB.tools;
    const classesA = names(infoA.classes);
    const classesB = names(infoB.classes);
    const functionsA = names(infoA.functions);
    const functionsB = names(infoB.functions);
    return {
      locDelta: infoB.loc - infoA.loc,
      toolsAdded: difference(toolsB, toolsA),
      toolsRemoved: difference(toolsA, toolsB),
      toolsShared: toolsA.filter((item) => toolsB.includes(item)),
      classesAdded: difference(classesB, classesA),
      classesRemoved: difference(classesA, classesB),
      functionsAdded: difference(functionsB, functionsA),
      functionsRemoved: difference(functionsA, functionsB),
    };
  }, [infoA, infoB]);

  function select(a: VersionId, b: VersionId) {
    setVersionA(a);
    setVersionB(b);
    const url = new URL(window.location.href);
    url.searchParams.set("a", a);
    url.searchParams.set("b", b);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const relationKey = `${versionA}-${versionB}`;
  const boundaryKey = (["s10-s13", "s14-s15", "s15-s16", "s16-s17"] as string[]).includes(relationKey)
    ? relationKey.replace("-", "_")
    : "default";

  return (
    <div className="py-4">
      <header className="mb-12 border-b border-[var(--color-border)] pb-10">
        <p className="section-eyebrow">A / B · {t("eyebrow")}</p>
        <h1 className="mt-5 font-display text-5xl font-normal sm:text-6xl">{t("title")}</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-[var(--color-smoke)]">{t("subtitle")}</p>
      </header>

      <section aria-labelledby="comparison-inputs" className="border border-[var(--color-border)] bg-[var(--color-carbon)] p-4 sm:p-6">
        <h2 id="comparison-inputs" className="sr-only">{t("selectors")}</h2>
        <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
          <VersionSelect label={t("select_a")} value={versionA} onChange={(value) => select(value, versionB)} tSession={tSession} />
          <ArrowRight className="mb-3 hidden text-[var(--color-smoke)] md:block" size={18} aria-hidden="true" />
          <VersionSelect label={t("select_b")} value={versionB} onChange={(value) => select(versionA, value)} tSession={tSession} />
          <button type="button" onClick={() => select(versionB, versionA)} className="button-secondary" aria-label={t("swap")}>
            <ArrowDownUp size={15} aria-hidden="true" />{t("swap")}
          </button>
        </div>
        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("presets")}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESETS.map(([a, b, key]) => (
              <button key={key} type="button" onClick={() => select(a, b)} className="min-h-11 shrink-0 border border-[var(--color-iron)] px-3 text-left font-mono text-[10px] transition-colors hover:border-[var(--color-ash)]" aria-pressed={versionA === a && versionB === b}>
                <span className="block text-[var(--color-chalk)]">{a} → {b}</span>
                <span className="mt-1 block text-[var(--color-smoke)]">{t(`preset_${key}`)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-live="polite">
        <div className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
          <VersionSummary version={infoA} side="A" tSession={tSession} tSubtitle={tSubtitle} tLayer={tLayer} />
          <VersionSummary version={infoB} side="B" tSession={tSession} tSubtitle={tSubtitle} tLayer={tLayer} />
        </div>

        <div className="mt-6 border-l-2 border-[var(--color-accent)] bg-[var(--color-carbon)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("comparison_boundary")}</p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--color-ash)]">{t(`boundary_${boundaryKey}`)}</p>
        </div>

        <h2 className="mt-16 font-display text-3xl font-normal">{t("structural_changes")}</h2>
        <div className="mt-6 grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          <DeltaCard icon={FileCode2} label={t("loc_delta")} value={`${comparison.locDelta >= 0 ? "+" : ""}${comparison.locDelta}`} detail={t("lines")} />
          <DeltaCard icon={Wrench} label={t("tools")} added={comparison.toolsAdded} removed={comparison.toolsRemoved} />
          <DeltaCard icon={Box} label={t("classes")} added={comparison.classesAdded} removed={comparison.classesRemoved} />
          <DeltaCard icon={Braces} label={t("functions")} added={comparison.functionsAdded} removed={comparison.functionsRemoved} />
        </div>

        <section className="mt-16" aria-labelledby="tool-comparison">
          <h2 id="tool-comparison" className="font-display text-3xl font-normal">{t("tool_comparison")}</h2>
          <div className="mt-6 grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
            <ItemGroup title={`${t("only_in")} ${versionA}`} items={comparison.toolsRemoved} kind="removed" empty={t("none")} />
            <ItemGroup title={t("shared")} items={comparison.toolsShared} kind="shared" empty={t("none")} />
            <ItemGroup title={`${t("only_in")} ${versionB}`} items={comparison.toolsAdded} kind="added" empty={t("none")} />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="architecture-comparison">
          <h2 id="architecture-comparison" className="font-display text-3xl font-normal">{t("architecture")}</h2>
          <div className="mt-6 grid gap-8 xl:grid-cols-2">
            <div className="min-w-0 border border-[var(--color-border)] p-4"><h3 className="mb-5 font-mono text-xs font-normal">A / {versionA} · {tSession(versionA)}</h3><ArchDiagram snapshot={architectureA} /></div>
            <div className="min-w-0 border border-[var(--color-border)] p-4"><h3 className="mb-5 font-mono text-xs font-normal">B / {versionB} · {tSession(versionB)}</h3><ArchDiagram snapshot={architectureB} /></div>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="source-comparison">
          <h2 id="source-comparison" className="mb-6 font-display text-3xl font-normal">{t("source_diff")}</h2>
          <CodeDiff oldSource={infoA.source} newSource={infoB.source} oldLabel={`${infoA.id} (${infoA.filename})`} newLabel={`${infoB.id} (${infoB.filename})`} />
        </section>
      </section>
    </div>
  );
}

function VersionSelect({ label, value, onChange, tSession }: { label: string; value: VersionId; onChange: (value: VersionId) => void; tSession: (key: string) => string }) {
  return <label className="block min-w-0"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as VersionId)} className="min-h-12 w-full border border-[var(--color-iron)] bg-[var(--color-obsidian)] px-3 text-sm"><option disabled value="">—</option>{LEARNING_PATH.map((id) => <option key={id} value={id}>{id} — {tSession(id)}</option>)}</select></label>;
}

function VersionSummary({ version, side, tSession, tSubtitle, tLayer }: { version: AgentVersion; side: string; tSession: (key: string) => string; tSubtitle: (key: string) => string; tLayer: (key: string) => string }) {
  const meta = VERSION_META[version.id as VersionId];
  const t = useTranslations("compare");
  return <article className="min-h-52 bg-[var(--color-obsidian)] p-5 sm:p-7"><span className="font-mono text-[10px] text-[var(--color-accent)]">{side} / {version.id}</span><h2 className="mt-5 font-display text-2xl font-normal">{tSession(version.id)}</h2><p className="mt-2 text-sm text-[var(--color-smoke)]">{tSubtitle(version.id)}</p><div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[10px] text-[var(--color-smoke)]"><span>{version.loc} LOC</span><span>{version.tools.length} {t("tools")}</span><span>{version.classes.length} {t("classes")}</span><span>{version.functions.length} {t("functions")}</span>{meta && <LayerBadge layer={meta.layer}>{tLayer(meta.layer)}</LayerBadge>}</div></article>;
}

function DeltaCard({ icon: Icon, label, value, detail, added = [], removed = [] }: { icon: typeof FileCode2; label: string; value?: string; detail?: string; added?: string[]; removed?: string[] }) {
  const t = useTranslations("compare");
  return <article className="min-h-48 bg-[var(--color-obsidian)] p-5"><div className="flex items-center gap-2 text-[var(--color-smoke)]"><Icon size={15} aria-hidden="true" /><h3 className="font-mono text-[10px] font-normal uppercase tracking-[0.06em]">{label}</h3></div>{value !== undefined && <p className="mt-7 font-mono text-3xl">{value} <span className="text-xs text-[var(--color-smoke)]">{detail}</span></p>}<div className="mt-5 space-y-2">{added.map((item) => <p key={`add-${item}`} className="border-l-2 border-[var(--color-accent)] pl-2 font-mono text-[10px]"><span className="sr-only">{t("added")}: </span>+ {item}</p>)}{removed.map((item) => <p key={`remove-${item}`} className="pl-2 font-mono text-[10px] text-[var(--color-smoke)] line-through opacity-60"><span className="sr-only">{t("removed")}: </span>− {item}</p>)}{value === undefined && !added.length && !removed.length && <p className="text-xs text-[var(--color-smoke)]">{t("none")}</p>}</div></article>;
}

function ItemGroup({ title, items, kind, empty }: { title: string; items: string[]; kind: "added" | "removed" | "shared"; empty: string }) {
  return <article className="min-h-36 bg-[var(--color-obsidian)] p-5"><h3 className="font-mono text-[10px] font-normal uppercase tracking-[0.06em] text-[var(--color-smoke)]">{title}</h3><div className="mt-4 flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className={kind === "added" ? "border-l-2 border-[var(--color-accent)] bg-[var(--color-carbon)] px-2 py-1 font-mono text-[10px]" : kind === "removed" ? "px-2 py-1 font-mono text-[10px] text-[var(--color-smoke)] line-through opacity-60" : "border border-[var(--color-graphite)] px-2 py-1 font-mono text-[10px] text-[var(--color-ash)]"}>{kind === "added" ? "+ " : kind === "removed" ? "− " : ""}{item}</span>) : <span className="text-xs text-[var(--color-smoke)]">{empty}</span>}</div></article>;
}
