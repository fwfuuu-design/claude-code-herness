"use client";

import { useTranslations } from "@/lib/i18n";
import { Timeline } from "@/components/timeline/timeline";

export default function CoursePage() {
  const t = useTranslations("course");

  return (
    <div>
      <header className="mb-10 border-b border-[var(--color-border)] pb-8">
        <h1 className="font-display text-4xl font-normal sm:text-5xl">{t("title")}</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          {t("subtitle")}
        </p>
      </header>
      <Timeline />
    </div>
  );
}
