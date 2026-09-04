"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LayerBadge } from "@/components/ui/badge";
import { LAYERS, VERSION_META } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";
import type { VersionIndex } from "@/types/agent-data";
import versionData from "@/data/generated/versions.json";

const data = versionData as VersionIndex;

export default function TopicsPage() {
  const t = useTranslations("topics");
  const tLayer = useTranslations("layer_labels");
  const tSession = useTranslations("sessions");
  const tSubtitle = useTranslations("session_subtitles");
  const tInsight = useTranslations("session_insights");
  const tVersion = useTranslations("version");
  const locale = useLocale();

  return (
    <div className="py-4">
      <header className="mb-12 border-b border-[var(--color-border)] pb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-smoke)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl font-normal sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--color-smoke)]">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-12">
        {LAYERS.map((layer, index) => (
          <section
            key={layer.id}
            aria-labelledby={`topic-${layer.id}`}
            className="relative border-t border-[var(--color-border)] pt-6"
          >
            <div className="mb-6 grid gap-3 md:grid-cols-[3rem_16rem_1fr] md:items-start">
              <span className="grid h-10 w-10 place-items-center border border-[var(--color-compass-gold)] font-mono text-xs text-[var(--color-ash)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2
                id={`topic-${layer.id}`}
                className="font-display text-2xl font-normal"
              >
                {tLayer(layer.id)}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-smoke)]">
                {t(layer.id)}
              </p>
            </div>

            <div className="relative pl-5 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-px before:bg-[var(--color-compass-gold)]">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {layer.versions.map((versionId) => {
                  const info = data.versions.find(
                    (version) => version.id === versionId
                  );
                  const meta = VERSION_META[versionId];

                  return (
                    <Link
                      key={versionId}
                      href={`/${locale}/${versionId}`}
                      className="group block"
                    >
                      <Card className="h-full bg-transparent p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs uppercase text-[var(--color-smoke)]">
                                {versionId}
                              </span>
                              <LayerBadge layer={meta.layer}>
                                {tLayer(meta.layer)}
                              </LayerBadge>
                            </div>
                            <h3 className="mt-3 font-display text-xl font-normal text-[var(--color-chalk)]">
                              {tSession(versionId)}
                            </h3>
                            <p className="mt-1 text-xs text-[var(--color-smoke)]">
                              {tSubtitle(versionId)}
                            </p>
                          </div>
                          <ChevronRight
                            size={17}
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-[var(--color-chalk)] transition-transform group-hover:translate-x-1"
                          />
                        </div>

                        <div className="mt-4 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--color-smoke)]">
                          <span>{info?.loc ?? "—"} LOC</span>
                          <span>
                            {info?.tools.length ?? "—"} {tVersion("tools")}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--color-smoke)]">
                          {tInsight(versionId)}
                        </p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
