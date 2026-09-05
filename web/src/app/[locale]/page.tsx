"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomeMotion, MotionHero } from "@/components/home/home-motion";
import { ScrambleText, TypingCode } from "@/components/home/home-text-effects";
import { MessageFlow } from "@/components/architecture/message-flow";
import { LayerBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LAYERS, LEARNING_PATH, VERSION_META } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";

export default function HomePage() {
  const t = useTranslations("home");
  const tSession = useTranslations("sessions");
  const tInsight = useTranslations("session_insights");
  const tLayer = useTranslations("layer_labels");
  const locale = useLocale();

  return (
    <HomeMotion>
      <MotionHero>
        <h1 className="font-display text-4xl font-normal tracking-tight sm:text-6xl lg:text-7xl">
          <ScrambleText text={t("hero_title")} />
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] sm:text-xl">
          {t("hero_subtitle_initial")}
        </p>
        <div className="mt-8">
          <Link href={`/${locale}/course`} className="button-primary">
            {t("start")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </MotionHero>

      <section data-home-reveal>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="font-display text-3xl font-normal sm:text-4xl">{t("core_pattern")}</h2>
          <p className="max-w-3xl text-[var(--color-text-secondary)]">
            {t("core_pattern_desc")}
          </p>
        </div>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <span className="h-2 w-2 border border-[var(--color-iron)]" />
            <span className="h-2 w-2 border border-[var(--color-iron)]" />
            <span className="h-2 w-2 bg-[var(--color-compass-gold)]" />
            <span className="ml-3 text-xs text-zinc-500">agent_loop.py</span>
          </div>
          <TypingCode />
        </div>
      </section>

      <section data-home-reveal>
        <div className="mb-6 text-center">
          <h2 className="font-display text-3xl font-normal sm:text-4xl">{t("message_flow")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("message_flow_desc")}</p>
        </div>
        <div className="mx-auto max-w-2xl">
          <MessageFlow />
        </div>
      </section>

      <section>
        <div className="mb-6 text-center" data-home-reveal>
          <h2 className="font-display text-3xl font-normal sm:text-4xl">{t("learning_path_initial")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("learning_path_desc_initial")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PATH.map((versionId, index) => {
            const meta = VERSION_META[versionId];
            return (
              <Link key={versionId} href={`/${locale}/${versionId}`} className="home-course-card group block" data-home-reveal data-home-delay={(index % 3) * 70}>
                <Card className="h-full bg-transparent transition-colors">
                  <div className="flex items-center justify-between">
                    <LayerBadge layer={meta.layer}>{versionId}</LayerBadge>
                    <ArrowUpRight size={16} className="home-card-arrow text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold group-hover:underline">
                    {tSession(versionId)}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {tInsight(versionId)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-6 text-center" data-home-reveal>
          <h2 className="font-display text-3xl font-normal sm:text-4xl">{t("layers_title")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t("layers_desc")}</p>
        </div>
        <div className="flex flex-col gap-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              data-home-reveal
              className="home-topic flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-transparent p-4"
            >
              <div className="w-px self-stretch bg-[var(--color-compass-gold)]" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium">{tLayer(layer.id)}</h3>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {layer.versions.length} {t("versions_in_layer")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {layer.versions.map((versionId) => (
                    <Link key={versionId} href={`/${locale}/${versionId}`}>
                      <LayerBadge
                        layer={layer.id}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                      >
                        {versionId}: {tSession(versionId)}
                      </LayerBadge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </HomeMotion>
  );
}
