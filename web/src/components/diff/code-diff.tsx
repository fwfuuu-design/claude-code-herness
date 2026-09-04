"use client";

import { useState, useMemo } from "react";
import { diffLines, Change } from "diff";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

interface CodeDiffProps {
  oldSource: string;
  newSource: string;
  oldLabel: string;
  newLabel: string;
}

export function CodeDiff({ oldSource, newSource, oldLabel, newLabel }: CodeDiffProps) {
  const t = useTranslations("code_diff");
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  const changes = useMemo(() => diffLines(oldSource, newSource), [oldSource, newSource]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 truncate text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{oldLabel}</span>
          {" → "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{newLabel}</span>
        </div>
        <div className="flex shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border)]">
          <button
            type="button"
            aria-pressed={viewMode === "unified"}
            onClick={() => setViewMode("unified")}
            className={cn(
              "min-h-11 px-3 text-xs font-medium transition-colors",
              viewMode === "unified"
                ? "bg-[var(--color-chalk)] text-[var(--color-carbon)]"
                : "text-[var(--color-smoke)] hover:text-[var(--color-chalk)]"
            )}
          >
            {t("unified")}
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "split"}
            onClick={() => setViewMode("split")}
            className={cn(
              "hidden min-h-11 px-3 text-xs font-medium transition-colors sm:inline-flex",
              viewMode === "split"
                ? "bg-[var(--color-chalk)] text-[var(--color-carbon)]"
                : "text-[var(--color-smoke)] hover:text-[var(--color-chalk)]"
            )}
          >
            {t("split")}
          </button>
        </div>
      </div>

      {viewMode === "unified" ? (
        <UnifiedView changes={changes} label={t("unified_label")} />
      ) : (
        <SplitView changes={changes} label={t("split_label")} />
      )}
    </div>
  );
}

function UnifiedView({ changes, label }: { changes: Change[]; label: string }) {
  let oldLine = 1;
  let newLine = 1;

  const rows: { oldNum: number | null; newNum: number | null; type: "add" | "remove" | "context"; text: string }[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (change.added) {
        rows.push({ oldNum: null, newNum: newLine++, type: "add", text: line });
      } else if (change.removed) {
        rows.push({ oldNum: oldLine++, newNum: null, type: "remove", text: line });
      } else {
        rows.push({ oldNum: oldLine++, newNum: newLine++, type: "context", text: line });
      }
    }
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
      <table aria-label={label} className="w-full border-collapse font-mono text-xs leading-5">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                row.type === "add" && "border-l-2 border-l-[var(--color-compass-gold)]",
                row.type === "remove" && "opacity-60"
              )}
            >
              <td className="w-10 select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
                {row.oldNum ?? ""}
              </td>
              <td className="w-10 select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
                {row.newNum ?? ""}
              </td>
              <td className="w-4 select-none px-1 text-center">
                {row.type === "add" && <span className="text-[var(--color-chalk)]">+</span>}
                {row.type === "remove" && <span className="text-[var(--color-smoke)]">−</span>}
              </td>
              <td className="whitespace-pre px-2">
                <span
                  className={cn(
                    row.type === "add" && "text-[var(--color-chalk)]",
                    row.type === "remove" && "text-[var(--color-smoke)] line-through",
                    row.type === "context" && "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {row.text}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SplitView({ changes, label }: { changes: Change[]; label: string }) {
  let oldLine = 1;
  let newLine = 1;

  type SplitRow = {
    left: { num: number | null; text: string; type: "remove" | "context" | "empty" };
    right: { num: number | null; text: string; type: "add" | "context" | "empty" };
  };

  const rows: SplitRow[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    if (change.removed) {
      for (const line of lines) {
        rows.push({
          left: { num: oldLine++, text: line, type: "remove" },
          right: { num: null, text: "", type: "empty" },
        });
      }
    } else if (change.added) {
      let filled = 0;
      for (const line of lines) {
        // Try to fill in empty right-side slots from preceding removes
        const lastUnfilled = rows.length - lines.length + filled;
        if (
          lastUnfilled >= 0 &&
          lastUnfilled < rows.length &&
          rows[lastUnfilled].right.type === "empty" &&
          rows[lastUnfilled].left.type === "remove"
        ) {
          rows[lastUnfilled].right = { num: newLine++, text: line, type: "add" };
        } else {
          rows.push({
            left: { num: null, text: "", type: "empty" },
            right: { num: newLine++, text: line, type: "add" },
          });
        }
        filled++;
      }
    } else {
      for (const line of lines) {
        rows.push({
          left: { num: oldLine++, text: line, type: "context" },
          right: { num: newLine++, text: line, type: "context" },
        });
      }
    }
  }

  const cellClass = (type: string) =>
    cn(
      "whitespace-pre px-2",
      type === "add" && "border-l-2 border-l-[var(--color-compass-gold)] text-[var(--color-chalk)]",
      type === "remove" && "text-[var(--color-smoke)] line-through opacity-60",
      type === "context" && "text-zinc-700 dark:text-zinc-300",
      type === "empty" && "bg-[var(--color-carbon)]"
    );

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
      <table aria-label={label} className="w-full border-collapse font-mono text-xs leading-5">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="w-10 select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
                {row.left.num ?? ""}
              </td>
              <td className={cn("w-1/2 border-r border-zinc-200 dark:border-zinc-700", cellClass(row.left.type))}>
                {row.left.text}
              </td>
              <td className="w-10 select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
                {row.right.num ?? ""}
              </td>
              <td className={cn("w-1/2", cellClass(row.right.type))}>
                {row.right.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
