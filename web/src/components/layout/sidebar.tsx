"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS } from "@/lib/constants";
import { useLocale, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const tSession = useTranslations("sessions");
  const tLayer = useTranslations("layer_labels");
  const tNav = useTranslations("nav");

  return (
    <nav
      className="hidden w-60 shrink-0 border-r border-[var(--color-border)] pr-5 md:block"
      aria-label={tNav("course")}
    >
      <div className="sticky top-[calc(var(--header-height)+2rem)] space-y-7">
        {LAYERS.map((layer, layerIndex) => (
          <section key={layer.id} aria-labelledby={`sidebar-${layer.id}`}>
            <div className="flex items-center gap-2 pb-2">
              <span
                className="h-2 w-2 border border-[var(--color-compass-gold)]"
                aria-hidden="true"
              />
              <h2
                id={`sidebar-${layer.id}`}
                className="font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[var(--color-smoke)]"
              >
                {String(layerIndex + 1).padStart(2, "0")} / {tLayer(layer.id)}
              </h2>
            </div>
            <ul className="space-y-0.5">
              {layer.versions.map((versionId) => {
                const href = `/${locale}/${versionId}`;
                const active =
                  pathname === href ||
                  pathname === `${href}/` ||
                  pathname.startsWith(`${href}/diff`);

                return (
                  <li key={versionId}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group grid min-h-10 grid-cols-[2.5rem_1fr_auto] items-center border-l px-2 text-sm transition-colors",
                        active
                          ? "border-[var(--color-chalk)] bg-[var(--color-surface)] text-[var(--color-chalk)]"
                          : "border-transparent text-[var(--color-smoke)] hover:border-[var(--color-iron)] hover:text-[var(--color-chalk)]"
                      )}
                    >
                      <span className="font-mono text-[11px] uppercase">
                        {versionId}
                      </span>
                      <span className="truncate">{tSession(versionId)}</span>
                      {active && (
                        <span className="status-dot" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
