"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/i18n";
import styles from "./language-switch.module.css";

const LOCALES = [
  { code: "en", shortLabel: "EN", labelKey: "english" },
  { code: "zh", shortLabel: "中文", labelKey: "chinese" },
] as const;

export function LanguageSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);
  const navigation = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selected = pending ?? locale;

  useEffect(() => {
    setPending(null);
    return () => {
      if (navigation.current !== null) clearTimeout(navigation.current);
    };
  }, [locale, pathname]);

  function switchLocale(nextLocale: string) {
    if (navigation.current !== null) clearTimeout(navigation.current);
    if (nextLocale === locale) {
      setPending(null);
      return;
    }
    setPending(nextLocale);
    const path = pathname.replace(/^\/(en|zh)(?=\/|$)/, `/${nextLocale}`);
    const suffix = `${window.location.search}${window.location.hash}`;
    // Let the thumb arrive before the document navigation; rapid clicks cancel
    // the previous intent. Keep the existing path, query, and hash behavior.
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    navigation.current = setTimeout(() => window.location.assign(`${path}${suffix}`), delay);
  }

  return (
    <div className={styles.switch} role="group" aria-label={t("language")} aria-busy={pending !== null} data-locale={selected}>
      <span className={styles.track} aria-hidden="true" />
      <span className={styles.thumb} aria-hidden="true" />
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          className={styles.option}
          onClick={() => switchLocale(item.code)}
          aria-label={t(item.labelKey)}
          aria-pressed={selected === item.code}
        >
          {item.shortLabel}
        </button>
      ))}
    </div>
  );
}
