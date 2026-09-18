"use client";

import { useState } from "react";
import { PIECE_COLORS, type PieceName } from "./tetris/types";

/**
 * Seven pieces, seven hues, one player. The handle came long before the
 * portfolio did, so the footer signs off in its own colours: hover a hue to
 * meet the side of me it stands for.
 */
const HUES: { piece: PieceName; voice: string }[] = [
  { piece: "I", voice: "the long one · essays that earn their length" },
  { piece: "O", voice: "the steady one · the analyst who shows up daily" },
  { piece: "T", voice: "the show-off · the spin that took years of practice" },
  { piece: "S", voice: "the optimist · this will absolutely work" },
  { piece: "Z", voice: "the counter-take · are we sure, though?" },
  { piece: "J", voice: "the quiet fix · nobody noticed it was broken" },
  { piece: "L", voice: "the late idea · 1am, and it won't wait" },
];

const DEFAULT = "seven hues, one player · @huesofbanter";

export function HuesSignature() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <a
      className="hues-signature"
      href="https://x.com/huesofbanter"
      target="_blank"
      rel="noreferrer"
      onPointerLeave={() => setHovered(null)}
      aria-label="Charan on X: huesofbanter"
    >
      <span className="hues-swatches" aria-hidden="true">
        {HUES.map((hue, index) => (
          <i
            key={hue.piece}
            style={{ background: PIECE_COLORS[hue.piece] }}
            data-lit={hovered === index ? "yes" : "no"}
            onPointerEnter={() => setHovered(index)}
          />
        ))}
      </span>
      <span className="hues-name pixel-label">HUES OF BANTER</span>
      <small>{hovered === null ? DEFAULT : HUES[hovered].voice}</small>
    </a>
  );
}
