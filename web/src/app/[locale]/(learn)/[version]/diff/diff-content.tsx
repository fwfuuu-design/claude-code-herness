"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CodeDiff } from "@/components/diff/code-diff";
import { LayerBadge } from "@/components/ui/badge";
import { LEARNING_PATH, VERSION_META, type VersionId } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";
import versionData from "@/data/generated/versions.json";
import type { VersionIndex } from "@/types/agent-data";

const data = versionData as VersionIndex;

export function DiffPageContent({ version }: { version: string }) {
  const locale = useLocale();
  const t = useTranslations("chapter_diff");
  const tSession = useTranslations("sessions");
  const tLayer = useTranslations("layer_labels");
  const id = version as VersionId;
  const index = LEARNING_PATH.indexOf(id);
  const current = data.versions.find((item) => item.id === id);
  const baselineId = index > 0 ? LEARNING_PATH[index - 1] : null;
  const baseline = baselineId ? data.versions.find((item) => item.id === baselineId) : null;

  if (!current) {
    return <div className="py-12"><p className="text-[var(--color-smoke)]">{t("not_found")}</p><Link href={`/${locale}/course`} className="button-secondary mt-5">{t("back_course")}</Link></div>;
  }

  if (!baseline) {
    return <div className="py-12"><Link href={`/${locale}/${version}`} className="button-secondary"><ArrowLeft size={14} aria-hidden="true" />{t("back_lesson")}</Link><h1 className="mt-8 font-display text-4xl font-normal">{tSession(version)}</h1><p className="mt-4 max-w-2xl text-[var(--color-smoke)]">{t("first_lesson")}</p></div>;
  }

  const toolsAdded = current.tools.filter((item) => !baseline.tools.includes(item));
  const toolsRemoved = baseline.tools.filter((item) => !current.tools.includes(item));
  const classesA = baseline.classes.map((item) => item.name);
  const classesB = current.classes.map((item) => item.name);
  const functionsA = baseline.functions.map((item) => item.name);
  const functionsB = current.functions.map((item) => item.name);
  const classesAdded = classesB.filter((item) => !classesA.includes(item));
  const classesRemoved = classesA.filter((item) => !classesB.includes(item));
  const functionsAdded = functionsB.filter((item) => !functionsA.includes(item));
  const functionsRemoved = functionsA.filter((item) => !functionsB.includes(item));
  const meta = VERSION_META[id];

  return (
    <div className="py-4">
      <Link href={`/${locale}/${version}`} className="button-secondary"><ArrowLeft size={14} aria-hidden="true" />{t("back_lesson")}</Link>
      <header className="mt-8 border-b border-[var(--color-border)] pb-9">
        <p className="section-eyebrow">{baseline.id} / {current.id}</p>
        <h1 className="mt-5 font-display text-4xl font-normal sm:text-5xl">{tSession(baseline.id)} <span className="text-[var(--color-accent)]">→</span> {tSession(current.id)}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--color-smoke)]">{t("direct_comparison").replace("{a}", baseline.id).replace("{b}", current.id)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] text-[var(--color-smoke)]"><span>{baseline.loc} LOC</span><ArrowRight size={13} aria-hidden="true" /><span>{current.loc} LOC</span><LayerBadge layer={meta.layer}>{tLayer(meta.layer)}</LayerBadge></div>
      </header>

      <section className="mt-10 grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4" aria-label={t("summary")}>
        <ChangeGroup title={t("tools")} added={toolsAdded} removed={toolsRemoved} none={t("none")} />
        <ChangeGroup title={t("classes")} added={classesAdded} removed={classesRemoved} none={t("none")} />
        <ChangeGroup title={t("functions")} added={functionsAdded} removed={functionsRemoved} none={t("none")} />
        <article className="min-h-40 bg-[var(--color-obsidian)] p-5"><h2 className="font-mono text-[10px] font-normal uppercase text-[var(--color-smoke)]">{t("loc_delta")}</h2><p className="mt-6 font-mono text-3xl">{current.loc - baseline.loc >= 0 ? "+" : ""}{current.loc - baseline.loc}</p></article>
      </section>

      <section className="mt-14" aria-labelledby="chapter-source-diff">
        <h2 id="chapter-source-diff" className="mb-6 font-display text-3xl font-normal">{t("source_diff")}</h2>
        <CodeDiff oldSource={baseline.source} newSource={current.source} oldLabel={`${baseline.id} (${baseline.filename})`} newLabel={`${current.id} (${current.filename})`} />
      </section>
      <Link href={`/${locale}/compare?a=${baseline.id}&b=${current.id}`} className="button-primary mt-8">{t("open_compare")}<ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
  );
}

function ChangeGroup({ title, added, removed, none }: { title: string; added: string[]; removed: string[]; none: string }) {
  return <article className="min-h-40 bg-[var(--color-obsidian)] p-5"><h2 className="font-mono text-[10px] font-normal uppercase text-[var(--color-smoke)]">{title}</h2><div className="mt-5 space-y-2">{added.map((item) => <p key={`a-${item}`} className="border-l-2 border-[var(--color-accent)] pl-2 font-mono text-[10px]">+ {item}</p>)}{removed.map((item) => <p key={`r-${item}`} className="pl-2 font-mono text-[10px] text-[var(--color-smoke)] line-through opacity-60">− {item}</p>)}{!added.length && !removed.length && <p className="text-xs text-[var(--color-smoke)]">{none}</p>}</div></article>;
}
