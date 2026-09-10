"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { PIECES } from "../tetris/types";
import type { ThoughtProgress } from "./ThoughtScene";
const ThoughtScene = dynamic(
  () => import("./ThoughtScene").then((module) => module.ThoughtScene),
  { ssr: false },
);
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
          <ThinkingFallback />
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

function ThinkingFallback() {
  const rows = [
    "00001111110000",
    "00111111111100",
    "01110111011110",
    "11101101110111",
    "11111011101111",
    "11101110111011",
    "01111101111110",
    "00111111111100",
    "00011100111000",
  ];
  return (
    <div className="thought-fallback" aria-hidden="true">
      <svg
        viewBox="0 0 560 170"
        role="img"
        aria-label="A mind made of interlocking ideas, connecting curiosity to building, testing and shipping"
      >
        <defs>
          <pattern
            id="thought-grid"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M16 0H0V16"
              fill="none"
              stroke="#233146"
              strokeWidth=".5"
            />
          </pattern>
        </defs>
        <rect width="560" height="170" fill="url(#thought-grid)" />
        <g className="thought-brain">
          {rows.flatMap((row, y) =>
            [...row].map((cell, x) =>
              cell === "1" ? (
                <rect
                  key={`${x}-${y}`}
                  x={x * 12 + 155}
                  y={y * 12 + 21}
                  width="10"
                  height="10"
                  fill={
                    ["#00e0ff", "#b968ff", "#ffd500"][
                      (x + Math.floor(y / 3)) % 3
                    ]
                  }
                  opacity={0.35 + ((x + y) % 4) * 0.2}
                />
              ) : null,
            ),
          )}
        </g>
        <g fill="none" strokeWidth="2">
          <path
            className="thought-wire"
            d="M35 44H116V80H152M328 55H394V30H522"
            stroke="#00e0ff"
          />
          <path
            className="thought-wire"
            d="M35 128H100V112H166M328 100H421V137H522"
            stroke="#b968ff"
          />
        </g>
        <g fill="#070c16" stroke="#456078">
          <rect x="18" y="29" width="68" height="30" />
          <rect x="18" y="113" width="68" height="30" />
          <rect x="450" y="15" width="88" height="30" />
          <rect x="450" y="122" width="88" height="30" />
        </g>
        <g fill="#cad7eb" fontSize="10" fontFamily="monospace">
          <text x="28" y="48">
            ASK WHY
          </text>
          <text x="29" y="132">
            CONNECT
          </text>
          <text x="460" y="34">
            MAKE IT REAL
          </text>
          <text x="464" y="141">
            TEST · SHIP
          </text>
          <text x="182" y="158" fill="#7c94b3">
            CURIOSITY → CAPABILITY
          </text>
        </g>
      </svg>
    </div>
  );
}
