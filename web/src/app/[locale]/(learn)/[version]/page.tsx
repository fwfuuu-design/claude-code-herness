import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COURSE_STAGES, LEARNING_PATH, VERSION_META, type VersionId } from "@/lib/constants";
import { buildArchitectureSnapshot } from "@/lib/architecture-data";
import { renderCourseMarkdown } from "@/lib/course-markdown";
import { LayerBadge } from "@/components/ui/badge";
import { ChapterMobileNavigation, OnThisPage } from "@/components/layout/chapter-navigation";
import { MarkReadButton, ReadingStatusBadge } from "@/components/course/reading-progress";
import docsData from "@/data/generated/docs.json";
import versionsData from "@/data/generated/versions.json";
import { VersionDetailClient } from "./client";
import { getTranslations } from "@/lib/i18n-server";
import type { VersionIndex } from "@/types/agent-data";

const data = versionsData as VersionIndex;

export function generateStaticParams() {
  return LEARNING_PATH.map((version) => ({ version }));
}

export default async function VersionPage({ params }: { params: Promise<{ locale: string; version: string }> }) {
  const { locale, version } = await params;
  const versionId = version as VersionId;
  const versionData = data.versions.find((item) => item.id === version);
  const meta = VERSION_META[versionId];
  const diff = data.diffs.find((item) => item.to === version) ?? null;
  if (!versionData || !meta) notFound();

  const requestedDoc = docsData.find((item) => item.version === version && item.locale === locale);
  const fallbackDoc = docsData.find((item) => item.version === version && item.locale === "en");
  const doc = requestedDoc ?? fallbackDoc;
  if (!doc) notFound();
  const architecture = buildArchitectureSnapshot(data.versions, data.diffs, version);
  const docHtml = renderCourseMarkdown(doc.content);

  const t = getTranslations(locale, "version");
  const tChapter = getTranslations(locale, "chapter");
  const tSession = getTranslations(locale, "sessions");
  const tQuestion = getTranslations(locale, "session_questions");
  const tAddition = getTranslations(locale, "session_additions");
  const tInsight = getTranslations(locale, "session_insights");
  const tLayer = getTranslations(locale, "layer_labels");
  const tCourse = getTranslations(locale, "course");
  const pathIndex = LEARNING_PATH.indexOf(versionId);
  const prevVersion = pathIndex > 0 ? LEARNING_PATH[pathIndex - 1] : null;
  const nextVersion = pathIndex < LEARNING_PATH.length - 1 ? LEARNING_PATH[pathIndex + 1] : null;
  const stageIndex = COURSE_STAGES.findIndex((stage) => stage.versions.includes(versionId as never));
  const stage = COURSE_STAGES[stageIndex];

  return (
    <div className="min-w-0 py-4">
      <ChapterMobileNavigation />
      <header className="border-b border-[var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-accent)]">{version} / {tChapter("stage")} {String(stageIndex + 1).padStart(2, "0")}</span>
          <span className="text-[var(--color-iron)]" aria-hidden="true">/</span>
          <span className="font-mono text-[10px] uppercase text-[var(--color-smoke)]">{stage ? tCourse(`stage_${stage.id}`) : tLayer(meta.layer)}</span>
          <ReadingStatusBadge version={versionId} />
        </div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-normal leading-[1.05] sm:text-5xl">{tSession(version)}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--color-ash)]">{tInsight(version)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <LayerBadge layer={meta.layer}>{tLayer(meta.layer)}</LayerBadge>
          <span className="border border-[var(--color-border)] bg-[var(--color-carbon)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--color-ash)]">+ {tAddition(version)}</span>
          <span className="font-mono text-[10px] text-[var(--color-smoke)]">{versionData.loc} LOC / {versionData.tools.length} {t("tools")}</span>
        </div>
        <nav className="mt-7 flex flex-wrap gap-3" aria-label={tChapter("adjacent_lessons")}>
          {prevVersion && <Link href={`/${locale}/${prevVersion}`} className="button-secondary"><ArrowLeft size={14} aria-hidden="true" />{t("prev")} {prevVersion}</Link>}
          {nextVersion && <Link href={`/${locale}/${nextVersion}`} className="button-secondary">{t("next")} {nextVersion}<ArrowRight size={14} aria-hidden="true" /></Link>}
        </nav>
      </header>

      <div className="mt-10 flex min-w-0 gap-6 xl:gap-8">
        <div className="min-w-0 flex-1">
          <VersionDetailClient
            version={version}
            diff={diff}
            docHtml={docHtml}
            translationFallback={!requestedDoc && locale !== "en"}
            translationMissingLabel={tChapter("translation_missing")}
            architecture={architecture}
          />

          <section className="mt-20 border-t border-[var(--color-border)] pt-8" aria-labelledby="chapter-summary">
            <p className="section-eyebrow">{tChapter("complete_eyebrow")}</p>
            <h2 id="chapter-summary" className="mt-4 font-display text-3xl font-normal sm:text-4xl">{tChapter("takeaways")}</h2>
            <div className="mt-8 grid border-l border-t border-[var(--color-border)] sm:grid-cols-3">
              <SummaryItem number="01" label={tChapter("insight")} text={tInsight(version)} />
              <SummaryItem number="02" label={tChapter("mechanism")} text={tAddition(version)} />
              <SummaryItem number="03" label={tChapter("implementation")} text={`${versionData.loc} LOC · ${versionData.functions.length} ${tChapter("functions")} · ${versionData.tools.length} ${t("tools")}`} />
            </div>
            <div className="mt-8 grid gap-6 border border-[var(--color-border)] bg-[var(--color-carbon)] p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <h3 className="font-mono text-xs font-normal uppercase tracking-[0.06em]">{tChapter("observe")}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--color-smoke)]">
                  <li>— {tChapter("observe_loop")}</li>
                  <li>— {tChapter("observe_source")}</li>
                  <li>— {tChapter("observe_boundary")}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-xs font-normal uppercase tracking-[0.06em]">{nextVersion ? tChapter("next_question") : tChapter("course_complete")}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-ash)]">{nextVersion ? tQuestion(nextVersion) : tChapter("course_complete_desc")}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MarkReadButton version={versionId} />
              {nextVersion ? (
                <Link href={`/${locale}/${nextVersion}`} className="button-primary">{tChapter("continue_to")} {nextVersion}<ArrowRight size={14} aria-hidden="true" /></Link>
              ) : (
                <Link href={`/${locale}/course`} className="button-primary">{tChapter("back_course")}<ArrowRight size={14} aria-hidden="true" /></Link>
              )}
              <Link href={`/${locale}/course`} className="button-secondary">{tChapter("back_course")}</Link>
            </div>
          </section>
        </div>
        <OnThisPage />
      </div>
    </div>
  );
}

function SummaryItem({ number, label, text }: { number: string; label: string; text: string }) {
  return (
    <article className="min-h-44 border-b border-r border-[var(--color-border)] p-5">
      <span className="font-mono text-[10px] text-[var(--color-accent)]">{number}</span>
      <h3 className="mt-5 font-mono text-[10px] font-normal uppercase tracking-[0.06em] text-[var(--color-smoke)]">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ash)]">{text}</p>
    </article>
  );
}
