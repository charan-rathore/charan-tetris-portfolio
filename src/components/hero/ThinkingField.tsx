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
    current: "I",   // sequence[0] = 'I' is the first piece to fall
    next: "T",      // sequence[1] = 'T' is what NEXT IDEA shows first
  });
  const update = useCallback((value: ThoughtProgress) => setProgress(value), []);
  const chapter = Math.floor(progress.placed / 4) % CHAPTERS.length;

  // Clicking the stage drops the current piece immediately — a hidden interaction.
  const handleStageClick = () => {
    if (!paused) setDrop(n => n + 1);
  };

  return (
    <div
      className="thinking-field"
      role="group"
      aria-label="Charan's thinking engine, played as a real Tetris sequence"
    >
      <div className="thought-stage" data-now={progress.current} data-next={progress.next} data-placed={progress.placed}>
        <div className="thought-stage-top">
          <span>COGNITIVE ENGINE</span>
          <span>
            <i /> {paused ? "PAUSED" : "AUTO PLAY"}
          </span>
        </div>
        {/* Clicking the playfield drops the current piece — discoverable, not labelled. */}
        <div
          className="thought-playfield thought-playfield--clickable"
          onClick={handleStageClick}
          role="button"
          tabIndex={0}
          aria-label="Click to drop the current idea"
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleStageClick(); } }}
        >
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
          <div className="thought-now-next">
            <div className="thought-now" aria-label={`Falling: ${progress.current}`}>
              <span>NOW</span>
              <div style={{ color: PIECES[progress.current].color }} data-piece={progress.current}>
                {PIECES[progress.current].rotations[0].map(([x, y], i) => (
                  <i key={i} style={{ left: x * 9, top: y * 9 }} />
                ))}
              </div>
              <span style={{ color: PIECES[progress.current].color }}>{progress.current}</span>
            </div>
            <span className="thought-arrow" aria-hidden="true">→</span>
            <div className="thought-next" aria-label={`Next piece: ${progress.next}`}>
              <span>NEXT IDEA</span>
              <div style={{ color: PIECES[progress.next].color }} data-piece={progress.next}>
                {PIECES[progress.next].rotations[0].map(([x, y], i) => (
                  <i key={i} style={{ left: x * 11, top: y * 11 }} />
                ))}
              </div>
              <span style={{ color: PIECES[progress.next].color }}>{progress.next}</span>
            </div>
          </div>
          <button
            type="button"
            aria-label={paused ? "Resume the thinking engine" : "Pause the thinking engine"}
            aria-pressed={paused}
            onClick={() => setPaused(v => !v)}
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
