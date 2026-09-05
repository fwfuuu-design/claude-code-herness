"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./home-motion.module.css";

/** Finite, once-per-mount animation; static full content is the SSR fallback. */
function useEntranceProgress(ref: RefObject<HTMLElement | null>, duration: number, interval: number) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    setProgress(1);
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setInterval> | undefined;
    setProgress(0);
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      timer = setInterval(() => {
        const next = Math.min(1, (performance.now() - start) / duration);
        setProgress(next);
        if (next === 1) clearInterval(timer);
      }, interval);
    }, { threshold: 0.2 });
    observer.observe(ref.current);
    return () => { observer.disconnect(); clearInterval(timer); };
  }, [ref, duration, interval, reduced]);

  return reduced ? 1 : progress;
}

const GLYPHS = "#%&+/<>{}[]01";

export function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const progress = useEntranceProgress(ref, 2800, 80);
  const resolved = Math.floor(Math.max(0, (progress - 0.15) / 0.85) * text.length);
  const frame = Math.floor(progress * 35);

  return (
    <span ref={ref} data-home-scramble data-complete={progress === 1}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((character, index) => (
          <span key={index} className={styles.scrambleCharacter}>
            <span className={styles.characterMeasure}>{character}</span>
            <span className={styles.characterDisplay}>
              {index < resolved ? character : GLYPHS[(frame * 5 + index * 3) % GLYPHS.length]}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

// Keep the original homepage pseudocode and its syntax colors intact.
const TOKENS = [
  ["while", "text-purple-400"], [" ", "text-zinc-300"], ["True", "text-orange-300"], [":", "text-zinc-500"],
  ["\n    response = client.messages.", "text-zinc-300"], ["create", "text-blue-400"], ["(", "text-zinc-500"],
  ["messages=messages, tools=tools", "text-zinc-300"], [")", "text-zinc-500"],
  ["\n    if", "text-purple-400"], [" response.stop_reason != ", "text-zinc-300"], ["\"tool_use\"", "text-green-400"], [":", "text-zinc-500"],
  ["\n        break", "text-purple-400"], ["\n    for", "text-purple-400"], [" tool_call ", "text-zinc-300"],
  ["in", "text-purple-400"], [" response.content", "text-zinc-300"], [":", "text-zinc-500"],
  ["\n        result = ", "text-zinc-300"], ["execute_tool", "text-blue-400"], ["(", "text-zinc-500"],
  ["tool_call.name, tool_call.input", "text-zinc-300"], [")", "text-zinc-500"],
  ["\n        messages.", "text-zinc-300"], ["append", "text-blue-400"], ["(", "text-zinc-500"],
  ["result", "text-zinc-300"], [")", "text-zinc-500"],
] as const;

let offset = 0;
const CODE_TOKENS = TOKENS.map(([text, className]) => {
  const start = offset;
  offset += text.length;
  return { text, className, start };
});
const CODE_LENGTH = offset;

export function TypingCode() {
  const ref = useRef<HTMLPreElement>(null);
  const progress = useEntranceProgress(ref, 2600, 32);
  const count = Math.floor(progress * CODE_LENGTH);

  return (
    <pre ref={ref} className="overflow-x-auto p-4 text-sm leading-relaxed" data-home-typing data-typed={count} data-complete={progress === 1}>
      <code>
        {CODE_TOKENS.map(({ text, className, start }) => {
          const visible = Math.max(0, Math.min(text.length, count - start));
          const cursor = count >= start && count < start + text.length;
          return (
            <span key={start} className={className}>
              {text.slice(0, visible)}
              {cursor && <span className={styles.typingCursor} aria-hidden="true" />}
              <span style={{ opacity: progress === 1 ? 1 : 0 }}>{text.slice(visible)}</span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}
