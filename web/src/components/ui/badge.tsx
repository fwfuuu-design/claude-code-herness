import { cn } from "@/lib/utils";
import type { AgentLayer } from "@/types/agent-data";

interface BadgeProps {
  layer: AgentLayer;
  children: React.ReactNode;
  className?: string;
}

/**
 * Topic badges intentionally share one visual treatment. The text identifies
 * the topic; color is never used as a category legend.
 */
export function LayerBadge({ layer, children, className }: BadgeProps) {
  return (
    <span
      data-layer={layer}
      className={cn(
        "inline-flex min-h-6 items-center rounded-[var(--radius-label)] border border-[var(--color-graphite)] bg-[var(--color-carbon)] px-2 font-mono text-[10px] font-normal uppercase tracking-[0.06em] text-[var(--color-ash)]",
        className
      )}
    >
      {children}
    </span>
  );
}
