"use client";

import { localizeVisualizationLabel } from "@/data/visualization-localization";
import { useLocale } from "@/lib/i18n";

export function VisualizationText({ text }: { text: string }) {
  const locale = useLocale();
  return <>{localizeVisualizationLabel(locale, text)}</>;
}
