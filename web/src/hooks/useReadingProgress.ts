"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { VERSION_ORDER, type VersionId } from "@/lib/constants";

export type ReadingStatus = "read" | "current" | "unread";

type ProgressData = {
  read: VersionId[];
  current: VersionId | null;
};

const STORAGE_KEY = "harness-reading-progress-v1";
const EVENT_NAME = "harness-progress-change";
const EMPTY: ProgressData = { read: [], current: null };
let cachedRaw: string | null | undefined;
let cachedValue: ProgressData = EMPTY;

function isVersionId(value: unknown): value is VersionId {
  return typeof value === "string" && VERSION_ORDER.includes(value as VersionId);
}

function readProgress(): ProgressData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    if (!raw) {
      cachedRaw = raw;
      cachedValue = EMPTY;
      return cachedValue;
    }
    const parsed = JSON.parse(raw) as { read?: unknown; current?: unknown };
    cachedRaw = raw;
    cachedValue = {
      read: Array.isArray(parsed.read)
        ? parsed.read.filter(isVersionId)
        : [],
      current: isVersionId(parsed.current) ? parsed.current : null,
    };
    return cachedValue;
  } catch {
    cachedRaw = undefined;
    cachedValue = EMPTY;
    return cachedValue;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
  };
}

function writeProgress(progress: ProgressData) {
  try {
    const raw = JSON.stringify(progress);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedValue = progress;
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Storage can be disabled or full. Reading must remain available.
  }
}

export function useReadingProgress(activeVersion?: string) {
  const progress = useSyncExternalStore(subscribe, readProgress, () => EMPTY);

  useEffect(() => {
    if (!isVersionId(activeVersion)) return;
    const latest = readProgress();
    if (latest.read.includes(activeVersion) || latest.current === activeVersion) return;
    writeProgress({ ...latest, current: activeVersion });
  }, [activeVersion]);

  const getStatus = useCallback(
    (version: VersionId): ReadingStatus => {
      if (progress.read.includes(version)) return "read";
      if (progress.current === version) return "current";
      return "unread";
    },
    [progress]
  );

  const markRead = useCallback((version: VersionId) => {
    const latest = readProgress();
    writeProgress({
      read: Array.from(new Set([...latest.read, version])),
      current: latest.current === version ? null : latest.current,
    });
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      cachedRaw = null;
      cachedValue = EMPTY;
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
      // Keep the site usable when storage access is unavailable.
    }
  }, []);

  return { progress, getStatus, markRead, clear };
}
