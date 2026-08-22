"use client";

/**
 * The Intel Vault: score-gated reveals that reward play with information
 * about Charan that isn't printed anywhere else on the page.
 *
 * Design follows classic reward-schedule structure: the first file is cheap
 * (everyone who clears a line or two gets a taste), later files are spaced
 * so they keep their value, and thresholds are always visible so play stays
 * goal-oriented. Unlocks persist per device.
 */

import { useMemo, useSyncExternalStore } from "react";
import { readStoredString, writeStoredString } from "@/lib/storage";

export type IntelItem = {
  id: string;
  /** Score required to decrypt. */
  at: number;
  label: string;
  title: string;
  blurb: string;
  href?: string;
  cta?: string;
};

export const INTEL: IntelItem[] = [
  {
    id: "origin",
    at: 400,
    label: "FILE 01 · ORIGIN",
    title: "THE PIVOT",
    blurb:
      "Mechanical engineer who got lost in data and never looked back. The hardest engineering problems aren't about machines. They're about information.",
  },
  {
    id: "x",
    at: 1200,
    label: "FILE 02 · CHANNEL",
    title: "@huesofbanter",
    blurb:
      "The unfiltered feed. Memes, banter, and unpolished takes on AI, product, and whatever broke in production this week.",
    href: "https://x.com/huesofbanter",
    cta: "FOLLOW ON X ↗",
  },
  {
    id: "substack",
    at: 3000,
    label: "FILE 03 · CHANNEL",
    title: "SUBSTACK",
    blurb:
      "Long-form systems thinking. How I reason about infrastructure, product decisions, and what actually scales.",
    href: "https://substack.com/@charanrathore",
    cta: "READ ON SUBSTACK ↗",
  },
  {
    id: "thesis",
    at: 6000,
    label: "FILE 04 · CLASSIFIED",
    title: "THE THESIS",
    blurb:
      "Tetris took one ruthless, simple idea to a billion people. I'm building toward a systems idea with that kind of leverage. If you're building it too, this is the direct line.",
    href: "mailto:ra7hore.charan@gmail.com?subject=THE%20THESIS",
    cta: "OPEN A DIRECT LINE ↗",
  },
];

export const INTEL_KEY = "cr-intel-unlocked";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(`${INTEL_KEY}-updated`, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(`${INTEL_KEY}-updated`, onChange);
  };
}

/** Reactive set of unlocked intel ids, shared across components and tabs. */
export function useUnlockedIntel(): Set<string> {
  const csv = useSyncExternalStore(
    subscribe,
    () => readStoredString(INTEL_KEY, ""),
    () => "",
  );
  return useMemo(() => new Set(csv.split(",").filter(Boolean)), [csv]);
}

export function unlockIntel(id: string): void {
  const current = new Set(
    readStoredString(INTEL_KEY, "").split(",").filter(Boolean),
  );
  if (current.has(id)) return;
  current.add(id);
  writeStoredString(INTEL_KEY, [...current].join(","));
}

export function unlockAllIntel(): void {
  writeStoredString(INTEL_KEY, INTEL.map((item) => item.id).join(","));
}
