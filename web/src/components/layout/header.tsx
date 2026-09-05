"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";

const REPOSITORY_URL = "https://github.com/fwfuuu-design/claude-code-herness";

const NAV_ITEMS = [
  { key: "course", href: "/course" },
  { key: "topics", href: "/topics" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    mobileMenuRef.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    const target = `/${locale}${item.href}`;
    if (pathname === target || pathname === `${target}/`) return true;

    return (
      item.key === "course" &&
      new RegExp(`^/${locale}/s\\d{2}(?:/|$)`).test(pathname)
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)] border-b border-[var(--color-border)] bg-[color:rgb(8_8_8_/_0.9)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[var(--page-max)] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/`}
          className="font-display text-xl font-medium tracking-[-0.04em] text-[var(--color-chalk)] transition-opacity hover:opacity-70"
          aria-label={`Harness — ${t("home")}`}
        >
          Harness
        </Link>

        <nav className="hidden h-full items-center gap-8 md:flex" aria-label={t("primary_navigation")}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center font-mono text-xs uppercase tracking-[0.08em] transition-colors",
                  active
                    ? "text-[var(--color-chalk)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[var(--color-active)]"
                    : "text-[var(--color-smoke)] hover:text-[var(--color-chalk)]"
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch />
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 min-w-11 items-center justify-center text-[var(--color-smoke)] transition-colors hover:text-[var(--color-chalk)]"
            aria-label={t("github")}
          >
            <Github size={17} aria-hidden="true" />
          </a>
          <Link href={`/${locale}/s01`} className="button-primary">
            {t("start_s01")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex min-h-11 min-w-11 items-center justify-center text-[var(--color-chalk)] md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? t("close_menu") : t("open_menu")}
        >
          {mobileOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="max-h-[calc(100svh-var(--header-height))] overflow-y-auto border-b border-[var(--color-border)] bg-[var(--color-carbon)] px-4 pb-6 pt-3 md:hidden"
        >
          <nav className="mx-auto max-w-[var(--page-max)]" aria-label={t("primary_navigation")}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center justify-between border-b border-[var(--color-border)] font-mono text-xs uppercase tracking-[0.08em]",
                    active
                      ? "text-[var(--color-chalk)]"
                      : "text-[var(--color-smoke)]"
                  )}
                >
                  {t(item.key)}
                  <span aria-hidden="true">{active ? "●" : "→"}</span>
                </Link>
              );
            })}

            <div className="mt-5 grid gap-3">
              <LanguageSwitch />
              <Link href={`/${locale}/s01`} className="button-primary w-full">
                {t("start_s01")}
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary w-full"
              >
                <Github size={16} aria-hidden="true" />
                GitHub
                <span className="sr-only">— {t("github")}</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
