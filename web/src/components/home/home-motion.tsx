"use client";

import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./home-motion.module.css";

/** Progressive enhancement: content is visible even before JS or observers run. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current || typeof IntersectionObserver === "undefined" || typeof Element.prototype.animate !== "function") return;
    const container = root.current;
    const elements = container.querySelectorAll("[data-home-reveal]");
    const animations = new Map<Element, Animation>();
    const outside = new Set<Element>();
    function resetPanel(panel: Element) {
      if (panel.contains(document.activeElement)) return;
      animations.get(panel)?.cancel();
      animations.delete(panel);
      panel.setAttribute("data-home-pending", "");
    }
    // Reset only well outside the viewport. This buffer prevents the entrance
    // translation or small scroll reversals from repeatedly restarting a panel.
    const exitObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          outside.delete(entry.target);
        } else {
          outside.add(entry.target);
          resetPanel(entry.target);
        }
      }
    }, { rootMargin: "80px 0px", threshold: 0 });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!entry.target.hasAttribute("data-home-pending")) continue;
        entry.target.removeAttribute("data-home-pending");
        const animation = entry.target.animate(
          [{ opacity: 0, transform: "translateY(36px)" }, { opacity: 1, transform: "translateY(0)" }],
          {
            duration: 1400,
            delay: Number(entry.target.getAttribute("data-home-delay") || 0),
            easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
            fill: "backwards",
          }
        );
        animations.set(entry.target, animation);
        animation.onfinish = () => animations.delete(entry.target);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    elements.forEach((element) => {
      element.setAttribute("data-home-pending", "");
      observer.observe(element);
      exitObserver.observe(element);
    });
    // A keyboard user must never land on a still-hidden link or panel.
    function revealFocused(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const panel = event.target.closest("[data-home-reveal]");
      if (!panel) return;
      panel.removeAttribute("data-home-pending");
      animations.get(panel)?.cancel();
      animations.delete(panel);
    }
    function resetBlurred(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const panel = event.target.closest("[data-home-reveal]");
      if (!panel || !outside.has(panel) || (event.relatedTarget instanceof Node && panel.contains(event.relatedTarget))) return;
      // focusout fires before activeElement has necessarily moved.
      panel.setAttribute("data-home-pending", "");
    }
    container.addEventListener("focusin", revealFocused);
    container.addEventListener("focusout", resetBlurred);
    return () => {
      observer.disconnect();
      exitObserver.disconnect();
      container.removeEventListener("focusin", revealFocused);
      container.removeEventListener("focusout", resetBlurred);
      animations.forEach((animation) => animation.cancel());
      elements.forEach((element) => element.removeAttribute("data-home-pending"));
    };
  }, [reduced]);

  return <div ref={root} className={`${styles.home} flex flex-col gap-20 pb-16`}>{children}</div>;
}

// Seventeen decorative strands, not an architecture or execution diagram.
const STRANDS = Array.from({ length: 17 }, (_, index) => {
  const y = 148 + index * 8;
  return `M -40 ${y} C 155 ${y - 100}, 265 ${y + 105}, 480 ${y + 38} S 800 ${y - 100}, 1240 ${y + 15}`;
});

export function MotionHero({ children }: { children: ReactNode }) {
  const id = useId();
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 90, damping: 26 });
  const springY = useSpring(y, { stiffness: 90, damping: 26 });

  useEffect(() => {
    if (reduced) {
      x.set(0);
      y.set(0);
      springX.jump(0);
      springY.jump(0);
    }
  }, [reduced, x, y, springX, springY]);

  function followPointer(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 22);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 14);
  }

  return (
    <section
      className={styles.hero}
      onPointerMove={followPointer}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div
        aria-hidden="true"
        className={styles.contours}
        style={{ x: reduced ? 0 : springX, y: reduced ? 0 : springY }}
      >
        <svg viewBox="0 0 1200 400" fill="none" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <linearGradient id={`${id}-fade`}>
              <stop stopColor="black" />
              <stop offset="0.18" stopColor="white" />
              <stop offset="0.82" stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <mask id={`${id}-mask`}><rect width="1200" height="400" fill={`url(#${id}-fade)`} /></mask>
          </defs>
          <g mask={`url(#${id}-mask)`}>
            {STRANDS.map((path, index) => (
              <path
                key={index}
                d={path}
                pathLength="1"
                className={index === 3 || index === 13 ? styles.accentStrand : styles.strand}
              />
            ))}
          </g>
        </svg>
      </motion.div>
      <div className={styles.heroContent}>{children}</div>
    </section>
  );
}
