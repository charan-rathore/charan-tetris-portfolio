"use client";

/**
 * Reading the page is playing the board: every stage you scroll to the end of
 * is a line cleared. Session-only on purpose · the score should reflect this
 * visit, not a number the page remembers about you.
 *
 * Shared by the clear effect, the HUD rail and the credit wallet.
 */

import { useSyncExternalStore } from "react";

export type Stage = {
  /** Element id of the section that owns the line. */
  id: string;
  label: string;
  points: number;
};

export const STAGES: Stage[] = [
  { id: "top", label: "THE HUMAN INTERFACE", points: 100 },
  { id: "context", label: "THE CONTEXT GRAPH", points: 100 },
  { id: "work", label: "THE PROJECT STACK", points: 200 },
  { id: "about", label: "PLAYER STATS", points: 200 },
  { id: "contact", label: "CONTINUE?", points: 400 },
];

/** Distance below the header at which a stage counts as read to the end. */
export const CLEAR_LINE = 96;
/** The edge must fall back well below the line before the stage re-arms. */
export const REARM_GAP = 160;

export type StageStatus = "cleared" | "reading" | "armed";

/**
 * A stage is read to the end when its bottom edge passes the clear line, or
 * when the page cannot scroll any further and that edge is already on screen ·
 * the closing stage can never leave the top of the window. The gap before
 * re-arming keeps a stage from flickering while it sits near the line.
 */
export function stageStatus(
  bottom: number,
  viewport: number,
  atPageEnd: boolean,
): StageStatus {
  if (bottom <= CLEAR_LINE || (atPageEnd && bottom <= viewport + 4)) {
    return "cleared";
  }
  return bottom > CLEAR_LINE + REARM_GAP ? "armed" : "reading";
}

const EMPTY: readonly string[] = [];

let cleared: readonly string[] = EMPTY;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function emit() {
  for (const listener of listeners) listener();
}

/** Returns true when this is the first clear of the stage since it was reset. */
export function clearStage(id: string): boolean {
  if (cleared.includes(id)) return false;
  cleared = [...cleared, id];
  emit();
  return true;
}

/** Scrolling a stage fully back into view re-arms its line. */
export function armStage(id: string): void {
  if (!cleared.includes(id)) return;
  cleared = cleared.filter((item) => item !== id);
  emit();
}

export function useClearedStages(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => cleared,
    () => EMPTY,
  );
}

export function scoreOf(ids: readonly string[]): number {
  return STAGES.reduce(
    (total, stage) => (ids.includes(stage.id) ? total + stage.points : total),
    0,
  );
}
