"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "@/lib/i18n";
import { LAYERS, LEARNING_PATH, VERSION_META } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import versionsData from "@/data/generated/versions.json";

function getVersionData(id: string) {
  return versionsData.versions.find((version) => version.id === id);
}

const MAX_LOC = Math.max(
  ...versionsData.versions
    .filter((version) =>
      LEARNING_PATH.includes(version.id as (typeof LEARNING_PATH)[number])
    )
    .map((version) => version.loc)
);

export function Timeline() {
  const t = useTranslations("course");
  const tVersion = useTranslations("version");
  const tSession = useTranslations("sessions");
  const tSubtitle = useTranslations("session_subtitles");
  const tAddition = useTranslations("session_additions");
  const tInsight = useTranslations("session_insights");
  const tLayer = useTranslations("layer_labels");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="topic-legend-heading">
        <h2
          id="topic-legend-heading"
          className="mb-3 font-mono text-xs font-normal uppercase tracking-[0.08em] text-[var(--color-smoke)]"
        >
          {t("layer_legend")}
        </h2>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {LAYERS.map((layer, index) => (
            <div key={layer.id} className="flex items-center gap-2">
              <span
                className="grid h-5 w-5 place-items-center border border-[var(--color-compass-gold)] font-mono text-[9px] text-[var(--color-ash)]"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-xs text-[var(--color-ash)]">
                {tLayer(layer.id)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="relative">
        {LEARNING_PATH.map((versionId, index) => {
          const meta = VERSION_META[versionId];
          const data = getVersionData(versionId);
          if (!data) return null;

          const last = index === LEARNING_PATH.length - 1;
          const locPercent = Math.round((data.loc / MAX_LOC) * 100);

          return (
            <article key={versionId} className="relative flex gap-4 pb-8 sm:gap-6">
              <div className="flex flex-col items-center" aria-hidden="true">
                <div className="z-10 grid h-9 w-9 shrink-0 place-items-center border border-[var(--color-compass-gold)] bg-[var(--color-carbon)] font-mono text-[10px] text-[var(--color-chalk)] sm:h-10 sm:w-10">
                  {versionId.toUpperCase()}
                </div>
                {!last && (
                  <div className="w-px flex-1 bg-[var(--color-graphite)]" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-2">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)] sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <LayerBadge layer={meta.layer}>{tLayer(meta.layer)}</LayerBadge>
                    <span className="font-mono text-[11px] text-[var(--color-smoke)]">
                      {tAddition(versionId)}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-normal text-[var(--color-chalk)]">
                    {tSession(versionId)}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-smoke)]">
                    {tSubtitle(versionId)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--color-smoke)]">
                    <span className="tabular-nums">
                      {data.loc} {tVersion("loc")}
                    </span>
                    <span className="tabular-nums">
                      {data.tools.length} {tVersion("tools")}
                    </span>
                  </div>

                  <div
                    className="mt-2 h-px w-full bg-[var(--color-graphite)]"
                    aria-hidden="true"
                  >
                    <div
                      className="h-px bg-[var(--color-compass-gold)]"
                      style={{ width: `${locPercent}%` }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-smoke)]">
                    {tInsight(versionId)}
                  </p>

                  <Link
                    href={`/${locale}/${versionId}`}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-chalk)] transition-opacity hover:opacity-70"
                  >
                    {t("learn_more")}
                    <span aria-hidden="true">→</span>
                  </Link>
                </motion.div>
              </div>
            </article>
          );
        })}
      </div>

      <section aria-labelledby="source-scale-heading">
        <h2
          id="source-scale-heading"
          className="mb-5 font-display text-xl font-normal"
        >
          {t("loc_growth")}
        </h2>
        <div className="flex flex-col gap-3">
          {LEARNING_PATH.map((versionId) => {
            const data = getVersionData(versionId);
            if (!data) return null;
            const widthPercent = Math.max(
              2,
              Math.round((data.loc / MAX_LOC) * 100)
            );

            return (
              <div key={versionId} className="grid grid-cols-[2.5rem_1fr_3.5rem] items-center gap-3">
                <span className="font-mono text-[11px] text-[var(--color-smoke)]">
                  {versionId}
                </span>
                <div className="h-5 border border-[var(--color-graphite)] bg-[var(--color-carbon)]">
                  <motion.div
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={{ width: `${widthPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 0.4 }}
                    className="h-full bg-[var(--color-compass-gold)]"
                  />
                </div>
                <span className="text-right font-mono text-[10px] tabular-nums text-[var(--color-smoke)]">
                  {data.loc}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
