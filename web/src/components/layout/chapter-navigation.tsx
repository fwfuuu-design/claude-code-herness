"use client";

import { List, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "./sidebar";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

function useChapterHeadings() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  const collect = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("#chapter-content h2[id], #chapter-content h3[id]"));
    setHeadings(nodes.map((node) => ({ id: node.id, text: node.textContent?.trim() || node.id, level: Number(node.tagName[1]) })));
    if (!activeId && nodes[0]) setActiveId(nodes[0].id);
  }, [activeId]);

  useEffect(() => {
    collect();
    const root = document.getElementById("chapter-content");
    if (!root) return;
    const mutation = new MutationObserver(collect);
    mutation.observe(root, { childList: true, subtree: true });
    return () => mutation.disconnect();
  }, [collect]);

  useEffect(() => {
    const nodes = headings.map((heading) => document.getElementById(heading.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headings]);

  return { headings, activeId };
}

function ContentsList({ headings, activeId, onNavigate }: { headings: Heading[]; activeId: string; onNavigate?: () => void }) {
  const t = useTranslations("chapter");
  if (!headings.length) return <p className="text-xs text-[var(--color-smoke)]">{t("toc_empty")}</p>;

  return (
    <ol className="space-y-1">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? "pl-3" : undefined}>
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "location" : undefined}
            onClick={onNavigate}
            className={cn(
              "grid min-h-11 grid-cols-[0.5rem_1fr] items-center gap-2 text-xs leading-snug transition-colors",
              activeId === heading.id ? "text-[var(--color-chalk)]" : "text-[var(--color-smoke)] hover:text-[var(--color-chalk)]"
            )}
          >
            <span className={cn("h-1.5 w-1.5", activeId === heading.id ? "rounded-full bg-[var(--color-accent)]" : "border border-[var(--color-iron)]")} aria-hidden="true" />
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ChapterMobileNavigation() {
  const t = useTranslations("chapter");
  const { headings, activeId } = useChapterHeadings();
  const [drawer, setDrawer] = useState<"course" | "toc" | null>(null);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  return (
    <>
      <div className="sticky top-[var(--header-height)] z-30 -mx-1 mb-6 flex gap-2 border-b border-[var(--color-border)] bg-[color:rgb(16_16_16_/_0.94)] px-1 py-2 backdrop-blur min-[1200px]:hidden">
        <button type="button" onClick={() => setDrawer("course")} className="button-secondary flex-1">
          <Menu size={15} aria-hidden="true" />{t("course_navigation")}
        </button>
        <button type="button" onClick={() => setDrawer("toc")} className="button-secondary flex-1">
          <List size={15} aria-hidden="true" />{t("on_this_page")}
        </button>
      </div>
      <Drawer open={drawer !== null} title={drawer === "course" ? t("course_navigation") : t("on_this_page")} onClose={closeDrawer}>
        {drawer === "course" ? <Sidebar mobile /> : <ContentsList headings={headings} activeId={activeId} onNavigate={closeDrawer} />}
      </Drawer>
    </>
  );
}

export function OnThisPage() {
  const t = useTranslations("chapter");
  const { headings, activeId } = useChapterHeadings();
  return (
    <aside className="hidden w-[11.5rem] shrink-0 min-[1200px]:block" aria-label={t("on_this_page")}>
      <div className="sticky top-[calc(var(--header-height)+2rem)]">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("on_this_page")}</p>
        <ContentsList headings={headings} activeId={activeId} />
      </div>
    </aside>
  );
}

function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const t = useTranslations("chapter");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className="absolute inset-y-0 left-0 w-[min(22rem,88vw)] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-carbon)] p-5">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <h2 className="font-display text-xl font-normal">{title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center border border-[var(--color-iron)]" aria-label={`${t("close_drawer")}: ${title}`}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
