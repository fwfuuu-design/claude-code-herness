"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { COURSE_STAGES, MILESTONE_VERSIONS, VERSION_META } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { ClearProgressButton } from "@/components/course/reading-progress";
import type { VersionId } from "@/lib/constants";
import versionsData from "@/data/generated/versions.json";

function getVersionData(id: string) {
  return versionsData.versions.find((version) => version.id === id);
}

export function Timeline() {
  const t = useTranslations("course");
  const tVersion = useTranslations("version");
  const tSession = useTranslations("sessions");
  const tQuestion = useTranslations("session_questions");
  const tAddition = useTranslations("session_additions");
  const tLayer = useTranslations("layer_labels");
  const locale = useLocale();
  const reduceMotion = !!useReducedMotion();
  const { getStatus } = useReadingProgress();
  const tProgress = useTranslations("progress");

  return (
    <div>
      <aside className="mb-16 grid gap-5 border border-[var(--color-border)] bg-[var(--color-carbon)] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-6">
        <span className="grid h-10 w-10 place-items-center border border-[var(--color-accent)] font-mono text-xs" aria-hidden="true">!</span>
        <div>
          <h2 className="font-display text-xl font-normal">{t("boundary_title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-smoke)]">{t("boundary_desc")}</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--color-smoke)]">{tProgress("local_only")}</p>
        </div>
        <ClearProgressButton />
      </aside>

      <div className="space-y-20">
        {COURSE_STAGES.map((stage, stageIndex) => (
          <section key={stage.id} aria-labelledby={`course-stage-${stage.id}`}>
            <header className="grid gap-5 border-t border-[var(--color-border)] pt-6 md:grid-cols-[4rem_1fr_1fr]">
              <span className="font-mono text-xs text-[var(--color-accent)]">{String(stageIndex + 1).padStart(2, "0")}</span>
              <h2 id={`course-stage-${stage.id}`} className="font-display text-3xl font-normal sm:text-4xl">
                {t(`stage_${stage.id}`)}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--color-smoke)] md:pt-1">{t(`stage_${stage.id}_desc`)}</p>
            </header>

            <div className="relative mt-8 border-l border-[var(--color-graphite)] pl-5 sm:pl-8">
              <div className="grid gap-4 lg:grid-cols-2">
                {stage.versions.map((versionId, index) => {
                  const data = getVersionData(versionId);
                  const meta = VERSION_META[versionId];
                  const milestone = MILESTONE_VERSIONS.includes(versionId as (typeof MILESTONE_VERSIONS)[number]);
                  const status = getStatus(versionId as VersionId);
                  return (
                    <motion.article
                      key={versionId}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : index * 0.04 }}
                      className="relative"
                    >
                      <span className="absolute -left-[1.6rem] top-7 h-2 w-2 bg-[var(--color-accent)] sm:-left-[2.25rem]" aria-hidden="true" />
                      <Link
                        href={`/${locale}/${versionId}`}
                        className="group flex h-full min-h-72 flex-col border border-[var(--color-border)] bg-[var(--color-obsidian)] p-5 transition-colors hover:border-[var(--color-border-strong)] sm:p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm uppercase text-[var(--color-chalk)]">{versionId}</span>
                            <span className="font-mono text-[10px] uppercase text-[var(--color-smoke)]">{tLayer(meta.layer)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {milestone && (
                              <span className="border border-[var(--color-ash)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em]">{t("milestone")}</span>
                            )}
                            <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase text-[var(--color-smoke)]">
                              <span className={status === "current" ? "status-dot" : status === "read" ? "h-2 w-2 bg-[var(--color-chalk)]" : "h-2 w-2 border border-[var(--color-iron)]"} aria-hidden="true" />
                              {tProgress(status)}
                            </span>
                          </div>
                        </div>
                        <h3 className="mt-7 font-display text-2xl font-normal sm:text-3xl">{tSession(versionId)}</h3>
                        <div className="mt-5 border-l border-[var(--color-graphite)] pl-4">
                          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("core_question")}</p>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ash)]">{tQuestion(versionId)}</p>
                        </div>
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("new_mechanism")}</p>
                            <p className="mt-1 text-sm text-[var(--color-chalk)]">{tAddition(versionId)}</p>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--color-smoke)]">
                            <span>{data?.loc ?? "—"} {tVersion("loc")}</span>
                            <ArrowUpRight size={16} className="text-[var(--color-chalk)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-20 border-t border-[var(--color-border)] pt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">
        {t("open_access")}
      </p>
    </div>
  );
}
