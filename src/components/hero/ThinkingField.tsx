"use client";

import { useCallback, useState } from "react";
import { PIECES } from "../tetris/types";
import type { ThoughtProgress } from "./ThoughtScene";
import { ThoughtScene } from "./ThoughtScene";
const CHAPTERS = [
  ["Curiosity finds the gap.", "Ask a better question."],
  ["Evidence changes the shape.", "Test the idea. Keep what holds."],
  ["Make it worth using.", "Build, connect, and send it out."],
];

export function ThinkingField() {
  const [drop, setDrop] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<ThoughtProgress>({
    score: 0,
    lines: 0,
    placed: 0,
    next: "T",
  });
  const update = useCallback(
    (value: ThoughtProgress) => setProgress(value),
    [],
  );
  const chapter = Math.floor(progress.placed / 4) % CHAPTERS.length;
  return (
    <div
      className="thinking-field"
      role="group"
      aria-label="Charan’s thinking engine, played as a real Tetris sequence"
    >
      <div className="thought-stage">
        <div className="thought-stage-top">
          <span>COGNITIVE ENGINE</span>
          <span>
            <i /> {paused ? "PAUSED" : "AUTO PLAY"}
          </span>
        </div>
        <div className="thought-playfield">
          <ThoughtScene drop={drop} paused={paused} onProgress={update} />
        </div>
        <div className="thought-story">
          <span className="pixel-label accent-cyan">
            THINK · PLACE · MAKE ROOM
          </span>
          <h3 key={chapter}>{CHAPTERS[chapter][0]}</h3>
          <p>{CHAPTERS[chapter][1]}</p>
          <div className="thought-score">
            <b>{String(progress.score).padStart(6, "0")}</b>
            <span>{progress.lines} LINES CLEARED</span>
          </div>
        </div>
        <div className="thought-controls">
          <div className="thought-next">
            <span>NEXT IDEA</span>
            <div
              aria-label={`Next piece ${progress.next}`}
              style={{ color: PIECES[progress.next].color }}
            >
              {PIECES[progress.next].rotations[0].map(([x, y], i) => (
                <i key={i} style={{ left: x * 8, top: y * 8 }} />
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setDrop((n) => n + 1)}>
            DROP IDEA ↓
          </button>
          <button
            type="button"
            aria-label={
              paused
                ? "Resume the thinking engine"
                : "Pause the thinking engine"
            }
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "▶" : "Ⅱ"}
          </button>
        </div>
      </div>
      <span className="pixel-label">
        A MIND IN MOTION. EVERY IDEA FINDS ITS FIT.
      </span>
    </div>
  );
}
