import type { AgentLayer } from "@/types/agent-data";

/** The only chapter IDs exposed by the learning site, in reading order. */
export const VERSION_ORDER = [
  "s01",
  "s02",
  "s03",
  "s04",
  "s05",
  "s06",
  "s07",
  "s08",
  "s09",
  "s10",
  "s11",
  "s12",
  "s13",
  "s14",
  "s15",
  "s16",
  "s17",
] as const;

export const LEARNING_PATH = VERSION_ORDER;

export type VersionId = (typeof VERSION_ORDER)[number];

/**
 * Structural chapter metadata only. User-facing chapter copy lives in the
 * locale message files so the order/dependency graph cannot drift by locale.
 */
export const VERSION_META: Record<
  VersionId,
  { layer: AgentLayer; prevVersion: VersionId | null }
> = {
  s01: { layer: "tools", prevVersion: null },
  s02: { layer: "tools", prevVersion: "s01" },
  s03: { layer: "tools", prevVersion: "s02" },
  s04: { layer: "tools", prevVersion: "s03" },
  s05: { layer: "planning", prevVersion: "s04" },
  s06: { layer: "planning", prevVersion: "s05" },
  s07: { layer: "planning", prevVersion: "s06" },
  s08: { layer: "memory", prevVersion: "s07" },
  s09: { layer: "memory", prevVersion: "s08" },
  s10: { layer: "collaboration", prevVersion: "s09" },
  s11: { layer: "concurrency", prevVersion: "s10" },
  s12: { layer: "concurrency", prevVersion: "s11" },
  s13: { layer: "collaboration", prevVersion: "s12" },
  s14: { layer: "collaboration", prevVersion: "s13" },
  s15: { layer: "collaboration", prevVersion: "s14" },
  s16: { layer: "concurrency", prevVersion: "s15" },
  s17: { layer: "planning", prevVersion: "s16" },
};

/** Topic grouping is structural; labels and explanations are translated. */
export const LAYERS = [
  {
    id: "tools" as const,
    versions: ["s01", "s02", "s03", "s04"] as const,
  },
  {
    id: "planning" as const,
    versions: ["s05", "s06", "s07", "s17"] as const,
  },
  {
    id: "memory" as const,
    versions: ["s08", "s09"] as const,
  },
  {
    id: "concurrency" as const,
    versions: ["s11", "s12", "s16"] as const,
  },
  {
    id: "collaboration" as const,
    versions: ["s10", "s13", "s14", "s15"] as const,
  },
] as const;
