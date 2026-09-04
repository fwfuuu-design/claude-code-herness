"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n";

const PARTS = ["tools", "knowledge", "observation", "action", "permissions"] as const;

export function HarnessPanel() {
  const t = useTranslations("home");
  const reduceMotion = !!useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="button-secondary"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {t("what_is_harness")}
        <span aria-hidden="true">+</span>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70]">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-black/70"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="harness-panel-title"
              initial={reduceMotion ? false : mobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }}
              animate={{ x: 0, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : mobile ? { y: "100%" } : { x: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-carbon)] p-5 sm:inset-y-0 sm:left-auto sm:w-[min(26rem,90vw)] sm:border-l sm:border-t-0 sm:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-accent)]">
                    {t("panel_eyebrow")}
                  </p>
                  <h2 id="harness-panel-title" className="mt-3 font-display text-3xl font-normal">
                    {t("panel_title")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid min-h-11 min-w-11 place-items-center border border-[var(--color-iron)]"
                  aria-label={t("panel_close")}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="mt-6 text-base leading-relaxed text-[var(--color-ash)]">
                {t("panel_definition")}
              </p>

              <div className="mt-8 border-t border-[var(--color-border)]">
                {PARTS.map((part, index) => (
                  <div
                    key={part}
                    className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-[var(--color-border)] py-4"
                  >
                    <span className="font-mono text-[10px] text-[var(--color-smoke)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-mono text-xs font-normal uppercase tracking-[0.06em]">
                        {t(`harness_${part}`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-smoke)]">
                        {t(`harness_${part}_desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
