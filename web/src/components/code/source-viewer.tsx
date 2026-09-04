"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { diffLines } from "diff";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/lib/i18n";
import { ANNOTATIONS, type Decision } from "@/components/architecture/design-decisions";
import { cn } from "@/lib/utils";
import type { SourcePayload } from "@/types/agent-data";

interface SourceViewerProps {
  version: string;
}

const sourceModules: Record<string, () => Promise<{ default: SourcePayload }>> = {
  s01: () => import("@/data/generated/sources/s01.json") as Promise<{ default: SourcePayload }>,
  s02: () => import("@/data/generated/sources/s02.json") as Promise<{ default: SourcePayload }>,
  s03: () => import("@/data/generated/sources/s03.json") as Promise<{ default: SourcePayload }>,
  s04: () => import("@/data/generated/sources/s04.json") as Promise<{ default: SourcePayload }>,
  s05: () => import("@/data/generated/sources/s05.json") as Promise<{ default: SourcePayload }>,
  s06: () => import("@/data/generated/sources/s06.json") as Promise<{ default: SourcePayload }>,
  s07: () => import("@/data/generated/sources/s07.json") as Promise<{ default: SourcePayload }>,
  s08: () => import("@/data/generated/sources/s08.json") as Promise<{ default: SourcePayload }>,
  s09: () => import("@/data/generated/sources/s09.json") as Promise<{ default: SourcePayload }>,
  s10: () => import("@/data/generated/sources/s10.json") as Promise<{ default: SourcePayload }>,
  s11: () => import("@/data/generated/sources/s11.json") as Promise<{ default: SourcePayload }>,
  s12: () => import("@/data/generated/sources/s12.json") as Promise<{ default: SourcePayload }>,
  s13: () => import("@/data/generated/sources/s13.json") as Promise<{ default: SourcePayload }>,
  s14: () => import("@/data/generated/sources/s14.json") as Promise<{ default: SourcePayload }>,
  s15: () => import("@/data/generated/sources/s15.json") as Promise<{ default: SourcePayload }>,
  s16: () => import("@/data/generated/sources/s16.json") as Promise<{ default: SourcePayload }>,
  s17: () => import("@/data/generated/sources/s17.json") as Promise<{ default: SourcePayload }>,
};

function highlightLine(line: string): React.ReactNode[] {
  const keywords = new Set(["def", "class", "import", "from", "return", "if", "elif", "else", "while", "for", "in", "not", "and", "or", "is", "None", "True", "False", "try", "except", "raise", "with", "as", "yield", "break", "continue", "pass", "global", "lambda", "async", "await"]);
  const parts = line.split(/(\b(?:def|class|import|from|return|if|elif|else|while|for|in|not|and|or|is|None|True|False|try|except|raise|with|as|yield|break|continue|pass|global|lambda|async|await|self)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|f"(?:[^"\\]|\\.)*"|f'(?:[^'\\]|\\.)*'|#.*$|\b\d+(?:\.\d+)?\b)/);
  return parts.map((part, index) => {
    if (!part) return null;
    if (keywords.has(part)) return <span key={index} className="text-[#b8aec8]">{part}</span>;
    if (part === "self") return <span key={index} className="text-[#aebdca]">{part}</span>;
    if (part.startsWith("#")) return <span key={index} className="text-[#727272] italic">{part}</span>;
    if (/^(?:f)?["']/.test(part)) return <span key={index} className="text-[#a8c59c]">{part}</span>;
    if (/^\d/.test(part)) return <span key={index} className="text-[#c5ad8d]">{part}</span>;
    return <span key={index}>{part}</span>;
  });
}

function addedLineNumbers(source: string, previousSource: string | null): Set<number> {
  if (!previousSource) return new Set(source.split("\n").map((_, index) => index + 1));
  let targetLine = 1;
  const added = new Set<number>();
  for (const chunk of diffLines(previousSource, source)) {
    const count = chunk.count ?? chunk.value.split("\n").length - 1;
    if (chunk.added) {
      for (let index = 0; index < count; index += 1) added.add(targetLine + index);
      targetLine += count;
    } else if (!chunk.removed) {
      targetLine += count;
    }
  }
  return added;
}

function symbolTokens(name: string) {
  return name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase().split(/_+/).filter((token) => token.length > 2);
}

export function SourceViewer({ version }: SourceViewerProps) {
  const t = useTranslations("source");
  const [loaded, setLoaded] = useState<{ payload: SourcePayload; baselineSource: string | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loader = sourceModules[version];
    setLoaded(null);
    setFailed(false);
    if (!loader) {
      setFailed(true);
      return () => { cancelled = true; };
    }

    loader()
      .then(async ({ default: payload }) => {
        const baselineLoader = payload.baselineId ? sourceModules[payload.baselineId] : null;
        const baselineSource = baselineLoader ? (await baselineLoader()).default.source : null;
        if (!cancelled) setLoaded({ payload, baselineSource });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => { cancelled = true; };
  }, [version]);

  if (failed) {
    return <div role="alert" className="min-h-40 border border-[var(--color-border)] bg-[var(--color-carbon)] p-5 text-sm text-[var(--color-smoke)]">{t("load_error")}</div>;
  }
  if (!loaded) {
    return <div role="status" className="min-h-40 border border-[var(--color-border)] bg-[var(--color-carbon)] p-5 text-sm text-[var(--color-smoke)]">{t("loading")}</div>;
  }

  return <LoadedSourceViewer version={version} payload={loaded.payload} baselineSource={loaded.baselineSource} />;
}

function LoadedSourceViewer({ version, payload, baselineSource }: { version: string; payload: SourcePayload; baselineSource: string | null }) {
  const t = useTranslations("source");
  const locale = useLocale();
  const { source, filename } = payload;
  const [addedOnly, setAddedOnly] = useState(false);
  const [copied, setCopied] = useState<"source" | "path" | null>(null);
  const copyTimer = useRef<number | null>(null);
  const lines = useMemo(() => source.split("\n"), [source]);
  const relation = payload.baselineId ? { from: payload.baselineId } : null;
  const added = useMemo(() => addedLineNumbers(source, baselineSource), [source, baselineSource]);
  const symbols = [
    ...payload.classes.map((item) => ({ type: "class", name: item.name, line: item.startLine })),
    ...payload.functions.map((item) => ({ type: "function", name: item.name, line: item.startLine })),
  ].sort((a, b) => a.line - b.line);
  const notesByLine = useMemo(() => {
    const result = new Map<number, Decision[]>();
    const decisions = ANNOTATIONS[version]?.decisions ?? [];
    for (const decision of decisions) {
      const haystack = `${decision.id} ${decision.title} ${decision.description}`.toLowerCase();
      const ranked = symbols
        .map((symbol) => ({ symbol, score: symbolTokens(symbol.name).filter((token) => haystack.includes(token)).length }))
        .sort((a, b) => b.score - a.score || a.symbol.line - b.symbol.line);
      if (!ranked[0] || ranked[0].score === 0) continue;
      const existing = result.get(ranked[0].symbol.line) ?? [];
      result.set(ranked[0].symbol.line, [...existing, decision]);
    }
    return result;
  }, [symbols, version]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  async function copy(value: string, kind: "source" | "path") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  function goToLine(line: number) {
    setAddedOnly(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(`source-${version}-line-${line}`);
      target?.scrollIntoView({ block: "center" });
      target?.focus({ preventScroll: true });
    });
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-carbon)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-3 py-3 sm:px-4">
        <FileCode2 size={15} aria-hidden="true" className="text-[var(--color-smoke)]" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--color-ash)]">{filename}</span>
        <button type="button" onClick={() => copy(filename, "path")} className="button-secondary px-3" aria-label={t("copy_path")}>
          {copied === "path" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied === "path" ? t("copied") : t("path")}
        </button>
        <button type="button" onClick={() => copy(source, "source")} className="button-secondary px-3" aria-label={t("copy_source")}>
          {copied === "source" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied === "source" ? t("copied") : t("copy")}
        </button>
      </div>

      <div className="grid border-b border-[var(--color-border)] lg:grid-cols-[13rem_1fr]">
        <nav className="max-h-52 overflow-y-auto border-b border-[var(--color-border)] p-3 lg:max-h-none lg:border-b-0 lg:border-r" aria-label={t("symbols")}>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("symbols")}</p>
          <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5">
            {symbols.map((symbol) => (
              <button key={`${symbol.type}-${symbol.name}-${symbol.line}`} type="button" onClick={() => goToLine(symbol.line)} className="flex min-h-11 shrink-0 items-center gap-2 px-2 text-left font-mono text-[10px] text-[var(--color-smoke)] hover:text-[var(--color-chalk)] lg:w-full">
                <span aria-hidden="true">{symbol.type === "class" ? "C" : "ƒ"}</span>
                <span className="truncate">{symbol.name}</span>
                <span className="ml-auto text-[var(--color-iron)]">:{symbol.line}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-smoke)]">{t("view")}</p>
              <p className="mt-1 text-xs text-[var(--color-ash)]">
                {addedOnly && relation ? t("baseline").replace("{version}", relation.from) : t("full_source")}
              </p>
              {addedOnly && relation && <p className="mt-1 max-w-lg text-[10px] leading-relaxed text-[var(--color-smoke)]">{t("baseline_note")}</p>}
            </div>
            <button type="button" aria-pressed={addedOnly} disabled={!relation} onClick={() => setAddedOnly((value) => !value)} className="button-secondary">
              {!relation ? t("no_baseline") : addedOnly ? t("show_all") : t("show_added")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto bg-[#080808]">
        <pre className="min-w-max p-3 text-[11px] leading-5 sm:p-4 sm:text-xs">
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              if (addedOnly && !added.has(lineNumber)) return null;
              const notes = notesByLine.get(lineNumber) ?? [];
              return (
                <div key={lineNumber}>
                  <div
                    id={`source-${version}-line-${lineNumber}`}
                    tabIndex={-1}
                    className={cn("flex border-l-2 border-transparent px-1 focus:bg-[var(--color-surface)] focus:outline-none", added.has(lineNumber) && "border-l-[var(--color-accent)] bg-[color:rgb(152_255_56_/_0.025)]")}
                  >
                    <span className="mr-4 inline-block w-10 shrink-0 select-none text-right text-[var(--color-iron)]">{lineNumber}</span>
                    <span className="whitespace-pre text-[var(--color-ash)]">{highlightLine(line) || " "}</span>
                  </div>
                  {notes.map((note) => {
                    const localized = locale === "zh" ? note.zh : undefined;
                    return (
                      <div key={note.id} className="ml-14 my-2 max-w-3xl border-l border-[var(--color-accent)] bg-[var(--color-surface)] px-3 py-2 whitespace-normal">
                        <strong className="font-sans text-xs font-normal text-[var(--color-chalk)]">{localized?.title ?? note.title}</strong>
                        <p className="mt-1 font-sans text-[11px] leading-relaxed text-[var(--color-smoke)]">{localized?.description ?? note.description}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
      <p className="sr-only" aria-live="polite">{copied ? t("copied") : ""}</p>
    </div>
  );
}
