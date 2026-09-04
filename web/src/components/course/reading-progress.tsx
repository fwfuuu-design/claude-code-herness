"use client";

import { Check } from "lucide-react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useTranslations } from "@/lib/i18n";
import type { VersionId } from "@/lib/constants";

export function ReadingStatusBadge({ version }: { version: VersionId }) {
  const t = useTranslations("progress");
  const { getStatus } = useReadingProgress(version);
  const status = getStatus(version);
  return (
    <span className="inline-flex min-h-7 items-center gap-2 border border-[var(--color-border)] bg-[var(--color-carbon)] px-2 font-mono text-[10px] uppercase text-[var(--color-ash)]">
      <span className={status === "current" ? "status-dot" : status === "read" ? "h-2 w-2 bg-[var(--color-chalk)]" : "h-2 w-2 border border-[var(--color-iron)]"} aria-hidden="true" />
      {t(status)}
    </span>
  );
}

export function MarkReadButton({ version }: { version: VersionId }) {
  const t = useTranslations("progress");
  const { getStatus, markRead } = useReadingProgress(version);
  const read = getStatus(version) === "read";
  return (
    <button type="button" onClick={() => markRead(version)} disabled={read} className="button-secondary">
      <Check size={15} aria-hidden="true" />{read ? t("read") : t("mark_read")}
    </button>
  );
}

export function ClearProgressButton() {
  const t = useTranslations("progress");
  const { clear } = useReadingProgress();
  function handleClear() {
    if (window.confirm(t("clear_confirm"))) clear();
  }
  return <button type="button" onClick={handleClear} className="button-secondary">{t("clear")}</button>;
}
