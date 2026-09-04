"use client";

import { useTranslations } from "@/lib/i18n";
import { Timeline } from "@/components/timeline/timeline";

export default function CoursePage() {
  const t = useTranslations("course");

  return (
    <div className="py-4">
      <header className="mb-14 border-b border-[var(--color-border)] pb-10">
        <p className="section-eyebrow">01 / 17 {t("eyebrow")}</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-normal leading-[1.02] sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          {t("subtitle")}
        </p>
      </header>
      <Timeline />
    </div>
  );
}
