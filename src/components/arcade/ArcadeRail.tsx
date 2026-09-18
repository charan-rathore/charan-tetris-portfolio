"use client";

import { PIECES, type PieceName } from "../tetris/types";
import { sfx } from "../tetris/audio";
import { STAGES, scoreOf, useClearedStages } from "./progress";
import { releaseHold, useHeldProject } from "./hold";

/**
 * The cabinet HUD, kept where a Tetris HUD belongs: score, lines, the next
 * stage in the queue, and a hold slot for a project worth coming back to.
 *
 * It lives in the page margin as a slim strip and opens on hover or focus, so
 * it never competes with the reading column.
 */

function Glyph({ piece }: { piece: PieceName }) {
  const cells = PIECES[piece].rotations[0];
  return (
    <svg className="rail-glyph" viewBox="0 0 48 36" aria-hidden="true">
      {cells.map(([x, y], index) => (
        <rect
          key={index}
          x={x * 12 + 1}
          y={y * 12 + 1}
          width={10}
          height={10}
          fill={PIECES[piece].color}
        />
      ))}
    </svg>
  );
}

function jumpTo(id: string) {
  sfx.unlock();
  sfx.ui();
  const target = document.getElementById(id);
  const drawer = target?.closest("details");
  if (drawer) drawer.open = true;
  target?.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}

export function ArcadeRail() {
  const cleared = useClearedStages();
  const held = useHeldProject();
  const next = STAGES.find((stage) => !cleared.includes(stage.id));
  const score = scoreOf(cleared);

  return (
    <aside className="arcade-rail" aria-label="Arcade HUD">
      <div className="rail-score">
        <span className="pixel-label">SCORE</span>
        <b>{String(score).padStart(4, "0")}</b>
        <small>
          LINES {cleared.length}/{STAGES.length}
        </small>
      </div>

      <div className="rail-slot">
        <span className="pixel-label">NEXT</span>
        {next ? (
          <button type="button" onClick={() => jumpTo(next.id)}>
            <Glyph piece={next.piece} />
            <em>{next.label}</em>
          </button>
        ) : (
          <p className="rail-empty">
            <span aria-hidden="true">★</span>
            <em>BOARD CLEAR</em>
          </p>
        )}
      </div>

      <div className="rail-slot rail-hold">
        <span className="pixel-label">HOLD</span>
        {held ? (
          <>
            <button type="button" onClick={() => jumpTo(held.id)}>
              <Glyph piece={held.piece} />
              <em>{held.title}</em>
            </button>
            <button className="rail-release" type="button" onClick={releaseHold}>
              RELEASE ✕
            </button>
          </>
        ) : (
          <p className="rail-empty">
            <span aria-hidden="true">▢</span>
            <em>PARK A PROJECT HERE</em>
          </p>
        )}
      </div>
    </aside>
  );
}
