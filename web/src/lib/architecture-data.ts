import type { AgentVersion, VersionDiff } from "@/types/agent-data";

export interface ArchitectureClass {
  name: string;
  introducedIn: string;
  isNew: boolean;
}

export interface ArchitectureSnapshot {
  classes: ArchitectureClass[];
  tools: string[];
}

/**
 * Build the small, display-only data set used by the architecture diagram.
 * Keeping source code out of this shape prevents chapter pages from shipping
 * the complete versions index to the browser.
 */
export function buildArchitectureSnapshot(
  versions: AgentVersion[],
  diffs: VersionDiff[],
  targetId: string
): ArchitectureSnapshot {
  const targetIndex = versions.findIndex((version) => version.id === targetId);
  const target = targetIndex >= 0 ? versions[targetIndex] : undefined;
  const directDiff = diffs.find((diff) => diff.to === targetId);
  const newClassNames = new Set(
    directDiff?.newClasses ?? target?.classes.map((item) => item.name) ?? []
  );

  return {
    classes:
      target?.classes.map((item) => ({
        name: item.name,
        introducedIn:
          versions
            .slice(0, targetIndex + 1)
            .find((candidate) =>
              candidate.classes.some((candidateClass) => candidateClass.name === item.name)
            )?.id ?? targetId,
        isNew: newClassNames.has(item.name),
      })) ?? [],
    tools: target?.tools ?? [],
  };
}
