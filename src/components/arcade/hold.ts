"use client";

/**
 * The hold queue, borrowed from the game: park one project in the HUD slot and
 * come back to it later. Holding a second project swaps it in, exactly like
 * holding a piece mid-game.
 */

import { useSyncExternalStore } from "react";
import type { PieceName } from "../tetris/types";

export type HeldProject = {
  /** Element id of the project card to return to. */
  id: string;
  title: string;
  piece: PieceName;
};

let held: HeldProject | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function holdProject(project: HeldProject): void {
  held = held?.id === project.id ? null : project;
  for (const listener of listeners) listener();
}

export function releaseHold(): void {
  if (!held) return;
  held = null;
  for (const listener of listeners) listener();
}

export function useHeldProject(): HeldProject | null {
  return useSyncExternalStore(
    subscribe,
    () => held,
    () => null,
  );
}

export function projectSlug(title: string): string {
  return `project-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
