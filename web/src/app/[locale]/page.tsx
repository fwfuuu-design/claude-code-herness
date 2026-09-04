"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AgentLoopDemo } from "@/components/home/agent-loop-demo";
import { HarnessPanel } from "@/components/home/harness-panel";
import { COURSE_STAGES, LEARNING_PATH, MILESTONE_VERSIONS } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";

const HARNESS_PARTS = ["tools", "knowledge", "observation", "action", "permissions"] as const;
const VALUE_KEYS = ["tools", "context", "state", "control"] as const;

export default function HomePage() {
  const t = useTranslations("home");
  const tSession = useTranslations("sessions");
  const tQuestion = useTranslations("session_questions");
  const tAddition = useTranslations("session_additions");
  const tCourse = useTranslations("course");
  const locale = useLocale();

  return (
    <div className="-mt-8 sm:-mt-8 lg:-mt-8">
      <section className="grid min-h-[calc(100svh-var(--header-height))] items-center gap-10 border-x border-b border-[var(--color-border)] px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-14">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-carbon)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ash)]">
            <span className="status-dot" aria-hidden="true" />
            {t("hero_status")}
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(3rem,6.2vw,5.5rem)] font-normal leading-[0.96] tracking-[-0.055em]">
            {t("hero_title_line_1")}
            <br />
            <span className="text-[var(--color-smoke)]">{t("hero_title_line_2")}</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-[var(--color-ash)] sm:text-lg">
            {t("hero_subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/s01`} className="button-primary">
              {t("start")}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href={`/${locale}/course`} className="button-secondary">
              {t("explore_course")}
            </Link>
            <HarnessPanel />
          </div>
          <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-smoke)]">
            {t("brand_line")}
          </p>
        </div>
        <AgentLoopDemo compact />
      </section>

      <section className="border-x border-b border-[var(--color-border)] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <p className="section-eyebrow">01 / {t("philosophy_eyebrow")}</p>
        <h2 className="mt-5 max-w-5xl font-display text-[clamp(2.3rem,5vw,4.5rem)] font-normal leading-[1.02]">
          {t("philosophy_title_1")}
          <br />
          <span className="text-[var(--color-smoke)]">{t("philosophy_title_2")}</span>
        </h2>
        <div className="mt-14 grid border-l border-t border-[var(--color-border)] md:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-r border-[var(--color-border)] p-6 sm:p-9">
            <p className="font-mono text-xs text-[var(--color-smoke)]">{t("agent_product")}</p>
            <p className="mt-5 font-display text-3xl font-normal sm:text-4xl">
              MODEL <span className="text-[var(--color-accent)]">+</span> HARNESS
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-[var(--color-smoke)]">
              {t("philosophy_desc")}
            </p>
          </div>
          <div className="border-b border-r border-[var(--color-border)]">
            {HARNESS_PARTS.map((part, index) => (
              <div key={part} className="grid grid-cols-[2.5rem_1fr] border-b border-[var(--color-border)] px-5 py-3 last:border-b-0">
                <span className="font-mono text-[10px] text-[var(--color-smoke)]">0{index + 1}</span>
                <span className="font-mono text-xs uppercase tracking-[0.05em]">{t(`harness_${part}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-x border-b border-[var(--color-border)] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="section-eyebrow">02 / {t("value_eyebrow")}</p>
            <h2 className="mt-5 font-display text-4xl font-normal sm:text-5xl">{t("value_title")}</h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--color-smoke)] lg:justify-self-end">
            {t("value_intro")}
          </p>
        </div>
        <div className="mt-12 grid border-l border-t border-[var(--color-border)] sm:grid-cols-2">
          {VALUE_KEYS.map((key, index) => (
            <article key={key} className="min-h-56 border-b border-r border-[var(--color-border)] p-6 sm:p-8">
              <span className="font-mono text-[10px] text-[var(--color-accent)]">0{index + 1}</span>
              <h3 className="mt-8 font-display text-2xl font-normal">{t(`value_${key}`)}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-smoke)]">{t(`value_${key}_desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-x border-b border-[var(--color-border)] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">03 / {t("path_eyebrow")}</p>
            <h2 className="mt-5 font-display text-4xl font-normal sm:text-5xl">{t("learning_path")}</h2>
            <p className="mt-4 max-w-2xl text-[var(--color-smoke)]">{t("learning_path_desc")}</p>
          </div>
          <Link href={`/${locale}/course`} className="button-secondary shrink-0">{t("view_full_course")} →</Link>
        </div>
        <div className="relative mt-12 grid gap-px bg-[var(--color-border)] border border-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PATH.map((versionId) => {
            const milestone = MILESTONE_VERSIONS.includes(versionId as (typeof MILESTONE_VERSIONS)[number]);
            return (
              <Link
                key={versionId}
                href={`/${locale}/${versionId}`}
                className="group relative min-h-40 bg-[var(--color-obsidian)] p-5 transition-colors hover:bg-[var(--color-surface)] focus-visible:z-10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-[var(--color-chalk)]">{versionId}</span>
                  <span className={milestone ? "status-dot" : "h-2 w-2 border border-[var(--color-iron)]"} aria-hidden="true" />
                </div>
                <h3 className="mt-6 font-display text-xl font-normal">{tSession(versionId)}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-smoke)]">{tQuestion(versionId)}</p>
                <p className="mt-4 font-mono text-[10px] uppercase text-[var(--color-ash)]">+ {tAddition(versionId)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-x border-b border-[var(--color-border)] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <p className="section-eyebrow">04 / {t("stages_eyebrow")}</p>
        <h2 className="mt-5 font-display text-4xl font-normal sm:text-5xl">{t("stages_title")}</h2>
        <div className="mt-12 border-t border-[var(--color-border)]">
          {COURSE_STAGES.map((stage, index) => (
            <article key={stage.id} className="grid gap-4 border-b border-[var(--color-border)] py-7 md:grid-cols-[4rem_1fr_1fr] md:items-start">
              <span className="grid h-10 w-10 place-items-center border border-[var(--color-accent)] font-mono text-[10px]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl font-normal">{tCourse(`stage_${stage.id}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-smoke)]">{tCourse(`stage_${stage.id}_desc`)}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {stage.versions.map((versionId) => (
                  <Link key={versionId} href={`/${locale}/${versionId}`} className="inline-flex min-h-11 items-center border border-[var(--color-graphite)] px-3 font-mono text-[10px] uppercase hover:border-[var(--color-ash)]">
                    {versionId} / {tSession(versionId)}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 border-x border-b border-[var(--color-border)] px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.72fr_1.28fr] lg:px-12">
        <div>
          <p className="section-eyebrow">05 / {t("core_loop_eyebrow")}</p>
          <h2 className="mt-5 font-display text-4xl font-normal sm:text-5xl">{t("core_loop_title")}</h2>
          <p className="mt-5 max-w-md leading-relaxed text-[var(--color-smoke)]">{t("core_loop_desc")}</p>
        </div>
        <AgentLoopDemo />
      </section>

      <section className="border-x border-b border-[var(--color-border)] px-5 py-24 text-center sm:px-8 sm:py-36 lg:px-12">
        <p className="section-eyebrow justify-center">06 / {t("closing_eyebrow")}</p>
        <h2 className="mx-auto mt-6 max-w-5xl font-display text-[clamp(2.5rem,5vw,4.75rem)] font-normal leading-[1.05]">
          {t("closing_line_1")}<br />
          <span className="text-[var(--color-smoke)]">{t("closing_line_2")}</span>
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}/s01`} className="button-primary">{t("start")} →</Link>
          <Link href={`/${locale}/course`} className="button-secondary">{t("view_full_course")}</Link>
        </div>
      </section>
    </div>
  );
}
