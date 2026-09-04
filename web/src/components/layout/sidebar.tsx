"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COURSE_STAGES, type VersionId } from "@/lib/constants";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useLocale, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const locale = useLocale();
  const tSession = useTranslations("sessions");
  const tCourse = useTranslations("course");
  const tNav = useTranslations("nav");
  const tProgress = useTranslations("progress");
  const { getStatus } = useReadingProgress();

  return (
    <nav
      className={cn(
        mobile ? "w-full" : "hidden w-[13.5rem] shrink-0 border-r border-[var(--color-border)] pr-5 min-[1200px]:block"
      )}
      aria-label={tNav("course")}
    >
      <div className={cn(!mobile && "sticky top-[calc(var(--header-height)+2rem)] max-h-[calc(100vh-var(--header-height)-3rem)] overflow-y-auto pr-1", "space-y-6")}>
        {COURSE_STAGES.map((stage, stageIndex) => (
          <section key={stage.id} aria-labelledby={`${mobile ? "drawer" : "sidebar"}-${stage.id}`}>
            <h2
              id={`${mobile ? "drawer" : "sidebar"}-${stage.id}`}
              className="pb-2 font-mono text-[9px] font-normal uppercase tracking-[0.08em] text-[var(--color-smoke)]"
            >
              {String(stageIndex + 1).padStart(2, "0")} / {tCourse(`stage_${stage.id}`)}
            </h2>
            <ul className="space-y-px">
              {stage.versions.map((versionId) => {
                const href = `/${locale}/${versionId}`;
                const active = pathname === href || pathname === `${href}/`;
                const status = getStatus(versionId as VersionId);
                return (
                  <li key={versionId}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group grid min-h-10 grid-cols-[2.5rem_1fr_auto] items-center border-l px-2 text-sm transition-colors",
                        active
                          ? "course-nav-current bg-[var(--color-surface)] text-[var(--color-chalk)]"
                          : "border-transparent text-[var(--color-smoke)] hover:border-[var(--color-iron)] hover:text-[var(--color-chalk)]"
                      )}
                    >
                      <span className="font-mono text-[10px] uppercase">{versionId}</span>
                      <span className="truncate text-xs">{tSession(versionId)}</span>
                      <span className="sr-only">{tProgress(status)}</span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5",
                          status === "read" && "bg-[var(--color-chalk)]",
                          status === "current" && "rounded-full bg-[var(--color-accent)]",
                          status === "unread" && "border border-[var(--color-iron)]"
                        )}
                        aria-hidden="true"
                      />
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
