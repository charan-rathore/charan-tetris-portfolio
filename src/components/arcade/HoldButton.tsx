"use client";

import type { PieceName } from "../tetris/types";
import { sfx } from "../tetris/audio";
import { holdProject, projectSlug, useHeldProject } from "./hold";

/** Park this project in the HUD slot, or let it go if it is already there. */
export function HoldButton({ title, piece }: { title: string; piece: PieceName }) {
  const held = useHeldProject();
  const id = projectSlug(title);
  const isHeld = held?.id === id;

  return (
    <button
      className={`hold-button ${isHeld ? "is-held" : ""}`}
      type="button"
      aria-pressed={isHeld}
      onClick={() => {
        sfx.unlock();
        sfx.hold();
        holdProject({ id, title, piece });
      }}
      title={isHeld ? `Release ${title} from the hold slot` : `Hold ${title} to come back to it`}
    >
      {isHeld ? "HELD ✓" : "HOLD ⇧"}
    </button>
  );
}
