"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/i18n";
import { LEARNING_PATH, VERSION_META, LAYERS } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import versionsData from "@/data/generated/versions.json";
import { MessageFlow } from "@/components/architecture/message-flow";

function getVersionData(id: string) {
  return versionsData.versions.find((v) => v.id === id);
}

export default function HomePage() {
  const t = useTranslations("home");
  const tSession = useTranslations("sessions");
  const tInsight = useTranslations("session_insights");
  const tLayer = useTranslations("layer_labels");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center px-2 pt-8 text-center sm:pt-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("hero_title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-text-secondary)] sm:text-xl">
          {t("hero_subtitle")}
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/course`}
            className="button-primary"
          >
            {t("start")}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Core Pattern Section */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("core_pattern")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
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
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>
              <span className="text-purple-400">while</span>
              <span className="text-zinc-300"> </span>
              <span className="text-orange-300">True</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-zinc-300">{"    "}response = client.messages.</span>
              <span className="text-blue-400">create</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">messages=</span>
              <span className="text-zinc-300">messages</span>
              <span className="text-zinc-500">,</span>
              <span className="text-zinc-300"> tools=</span>
              <span className="text-zinc-300">tools</span>
              <span className="text-zinc-500">)</span>
              {"\n"}
              <span className="text-purple-400">{"    "}if</span>
              <span className="text-zinc-300"> response.stop_reason != </span>
              <span className="text-green-400">&quot;tool_use&quot;</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-purple-400">{"        "}break</span>
              {"\n"}
              <span className="text-purple-400">{"    "}for</span>
              <span className="text-zinc-300"> tool_call </span>
              <span className="text-purple-400">in</span>
              <span className="text-zinc-300"> response.content</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-zinc-300">{"        "}result = </span>
              <span className="text-blue-400">execute_tool</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">tool_call.name</span>
              <span className="text-zinc-500">,</span>
              <span className="text-zinc-300"> tool_call.input</span>
              <span className="text-zinc-500">)</span>
              {"\n"}
              <span className="text-zinc-300">{"        "}messages.</span>
              <span className="text-blue-400">append</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">result</span>
              <span className="text-zinc-500">)</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Message Flow Visualization */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("message_flow")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {t("message_flow_desc")}
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <MessageFlow />
        </div>
      </section>

      {/* Learning Path Preview */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("learning_path")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {t("learning_path_desc")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PATH.map((versionId) => {
            const meta = VERSION_META[versionId];
            const data = getVersionData(versionId);
            if (!meta || !data) return null;
            return (
              <Link
                key={versionId}
                href={`/${locale}/${versionId}`}
                className="group block"
              >
                <Card className="h-full bg-transparent transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <LayerBadge layer={meta.layer}>{versionId}</LayerBadge>
                    <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
                      {data.loc} {t("loc")}
                    </span>
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

      {/* Layer Overview */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("layers_title")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {t("layers_desc")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-transparent p-4"
            >
              <div className="w-px self-stretch bg-[var(--color-compass-gold)]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{tLayer(layer.id)}</h3>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {layer.versions.length} {t("versions_in_layer")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {layer.versions.map((vid) => {
                    return (
                      <Link key={vid} href={`/${locale}/${vid}`}>
                        <LayerBadge
                          layer={layer.id}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        >
                          {vid}: {tSession(vid)}
                        </LayerBadge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
