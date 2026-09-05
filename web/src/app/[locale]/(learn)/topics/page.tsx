"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LAYERS, VERSION_META } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";

export default function TopicsPage() {
  const t = useTranslations("topics");
  const tLayer = useTranslations("layer_labels");
  const tSession = useTranslations("sessions");
  const tQuestion = useTranslations("session_questions");
  const tAddition = useTranslations("session_additions");
  const locale = useLocale();

  return (
    <div className="py-4">
      <header className="mb-16 border-b border-[var(--color-border)] pb-10">
        <p className="section-eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-normal leading-[1.02] sm:text-6xl">{t("title")}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-smoke)]">{t("subtitle")}</p>
      </header>

      <div className="space-y-20">
        {LAYERS.map((layer, index) => (
          <section key={layer.id} aria-labelledby={`topic-${layer.id}`}>
            <div className="grid gap-5 border-t border-[var(--color-border)] pt-6 md:grid-cols-[4rem_16rem_1fr]">
              <span className="font-mono text-xs text-[var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
              <h2 id={`topic-${layer.id}`} className="font-display text-3xl font-normal">{tLayer(layer.id)}</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-smoke)]">{t(layer.id)}</p>
            </div>

            <div className="mt-9">
              <div className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-2">
                {layer.versions.map((versionId) => (
                  <Link
                    key={versionId}
                    href={`/${locale}/${versionId}`}
                    className="group relative min-h-60 bg-[var(--color-obsidian)] p-5 transition-colors hover:bg-[var(--color-surface)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs uppercase">{versionId}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--color-smoke)]">
                          {t(`module_${VERSION_META[versionId].layer}`)}
                        </span>
                      </div>
                      <ArrowUpRight size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-7 font-display text-2xl font-normal">{tSession(versionId)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-smoke)]">{tQuestion(versionId)}</p>
                    <p className="mt-6 border-t border-[var(--color-border)] pt-4 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--color-ash)]">
                      + {tAddition(versionId)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
