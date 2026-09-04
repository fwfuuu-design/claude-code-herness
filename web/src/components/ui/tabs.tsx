"use client";

import { KeyboardEvent, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || "");
  const instanceId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAt(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActive(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    selectAt(nextIndex);
  }

  const panelId = `${instanceId}-panel`;

  return (
    <div className={className}>
      <div
        className="flex overflow-x-auto border-b border-[var(--color-border)]"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const selected = active === tab.id;
          const tabId = `${instanceId}-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative min-h-11 shrink-0 px-4 font-mono text-xs uppercase tracking-[0.06em] transition-colors",
                selected
                  ? "text-[var(--color-chalk)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[var(--color-chalk)]"
                  : "text-[var(--color-smoke)] hover:text-[var(--color-chalk)]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${instanceId}-${active}`}
        tabIndex={0}
        className="mt-5"
      >
        {children(active)}
      </div>
    </div>
  );
}
