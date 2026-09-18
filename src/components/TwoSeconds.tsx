"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IsoBlock } from "./hero/IsoBlock";
import { PIECE_COLORS } from "./tetris/types";
import { sfx } from "./tetris/audio";

/**
 * The two seconds you never see.
 *
 * Charan's essay stretches the gap between pressing Enter and the first word
 * of an answer. Here that gap is exactly one Tetris line: ten cells, 200ms
 * each. Identity, memory and context fill most of the row; the model only
 * arrives for the final act. Complete the line and the answer lands.
 *
 * The timings are illustrative units of the story, not a benchmark.
 */

const POST = "https://charanrathore.substack.com/p/the-2-seconds-you-never-see";
const BANTER = "https://x.com/huesofbanter";

/** One cell of the line is 200ms of the two seconds. */
const CELL_MS = 200;
const SPAN_MS = 2000;
const CELLS = SPAN_MS / CELL_MS;
/** Real time spent replaying the two seconds. */
const STRETCH_MS = 9000;

type Stop = {
  label: string;
  colour: string;
  cells: number;
  question: string;
  answer: string;
};

const STOPS: Stop[] = [
  {
    label: "IDENTITY",
    colour: PIECE_COLORS.I,
    cells: 1,
    question: "Who just pressed Enter?",
    answer:
      "Before anything can be remembered or retrieved, one question has to be answered. The login screen you scroll past is solving the hardest problem on the internet, and it isn't intelligence. It's identity.",
  },
  {
    label: "MEMORY",
    colour: PIECE_COLORS.O,
    cells: 2,
    question: "What deserves to be remembered?",
    answer:
      "Your name outlives the conversation. The bug you are debugging today does not. Something has to sort what survives, and it makes that trade the same way you do.",
  },
  {
    label: "CONTEXT",
    colour: PIECE_COLORS.T,
    cells: 2,
    question: "Is your prompt still your prompt?",
    answer:
      "It has quietly been expanded: earlier turns, retrieved memories, standing instructions. The model never reads the sentence you actually typed.",
  },
  {
    label: "THE MODEL",
    colour: PIECE_COLORS.L,
    cells: 5,
    question: "So when does the AI finally show up?",
    answer:
      "In the final act. If this were a film, the model would have three minutes of screen time. Most of the work was already finished before it read a single word.",
  },
];

/** Which stop owns each cell of the line, in order. */
const OWNER = STOPS.flatMap((stop, index) => Array<number>(stop.cells).fill(index));

function reduced(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Screen position of cell `i` along the receding line. */
function cellPoint(i: number) {
  return { x: 54 + i * 37, y: 66 + i * 9.5 };
}

export function TwoSeconds() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const ticker = useRef(0);
  const landed = useRef(0);

  const finish = useCallback(() => {
    setElapsed(SPAN_MS);
    setRunning(false);
    setDone(true);
    sfx.clear(1, false);
  }, []);

  const stop = useCallback(() => {
    window.clearInterval(ticker.current);
    ticker.current = 0;
  }, []);

  useEffect(() => stop, [stop]);

  function play() {
    stop();
    sfx.unlock();
    sfx.start();
    setDone(false);
    setSkipped(false);
    setElapsed(0);
    landed.current = 0;
    if (reduced()) {
      finish();
      return;
    }
    setRunning(true);
    const began = performance.now();
    // The line lands in ten discrete steps, so a coarse timer reads the clock
    // more reliably than animation frames, which stall in occluded windows.
    ticker.current = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / STRETCH_MS);
      const ms = Math.round(progress * SPAN_MS);
      setElapsed(ms);
      const cells = Math.floor(ms / CELL_MS);
      if (cells > landed.current) {
        landed.current = cells;
        if (cells < CELLS) sfx.softStep();
      }
      if (progress >= 1) {
        stop();
        finish();
      }
    }, 50);
  }

  function skip() {
    stop();
    sfx.unlock();
    setSkipped(true);
    landed.current = CELLS;
    finish();
  }

  const filled = done ? CELLS : Math.floor(elapsed / CELL_MS);
  const active = STOPS[OWNER[Math.min(filled, CELLS - 1)]];
  const idle = !running && !done;

  return (
    <section className="two-seconds" aria-labelledby="two-seconds-title">
      <div className="second-intro">
        <span className="pixel-label accent-cyan">SIDE QUEST · FROM THE BLOG</span>
        <h2 id="two-seconds-title">
          The two seconds
          <br />
          you never see.
        </h2>
        <p>
          You press Enter and an answer appears. I spent months on what happens
          in between. Stretched out, those two seconds are exactly one Tetris
          line: ten cells, and the model only turns up for the last five.
        </p>

        <div className="second-prompt" data-state={idle ? "waiting" : "spent"}>
          <span className="second-prompt-text">
            what actually happens after we press enter?
            <i aria-hidden="true" />
          </span>
          <button
            className="second-key"
            type="button"
            onClick={play}
            aria-label={
              idle
                ? "Stretch the two seconds"
                : "Stretch the two seconds again"
            }
          >
            {idle ? "⏎ ENTER" : "⏎ AGAIN"}
          </button>
        </div>

        <div className="second-readout" aria-live="off">
          <b>{(Math.min(elapsed, SPAN_MS) / 1000).toFixed(2)}s</b>
          <span>
            of 2.00s · {running ? "stretched ×4.5" : done ? "line complete" : "waiting on you"}
          </span>
          {running && (
            <button className="second-skip" type="button" onClick={skip}>
              SKIP THE WAIT
            </button>
          )}
        </div>

        <div className="second-stop" style={{ borderColor: active.colour }}>
          <span className="pixel-label" style={{ color: active.colour }}>
            {active.label}
          </span>
          <h3>{done ? "…and only now, the first word." : active.question}</h3>
          <p role="status">
            {done
              ? skipped
                ? "You skipped it. Everyone does, about a hundred times a day. That reflex is exactly why these two seconds stay invisible."
                : "Identity, memory and context did their work before the model saw your question. The answer was the easy part."
              : active.answer}
          </p>
        </div>

        {done && (
          <div className="second-exits">
            <a href={POST} target="_blank" rel="noreferrer">
              THE FULL 20 MINUTES · SUBSTACK ↗
            </a>
            <a className="is-banter" href={BANTER} target="_blank" rel="noreferrer">
              THE 2-SECOND VERSION · @huesofbanter ↗
            </a>
            <p>
              Same idea at two speeds. Long-form when it earns twenty minutes,
              hues of banter when it earns two hundred and eighty characters.
            </p>
          </div>
        )}
      </div>

      <div className="second-board" data-clearing={done ? "yes" : "no"}>
        <svg viewBox="0 0 460 210" role="img" aria-label={`The two seconds as one Tetris line: ${filled} of ${CELLS} cells filled.`}>
          <path d="M18 96 415 196M18 110 415 210" stroke="#22394d" fill="none" />
          {Array.from({ length: CELLS }, (_, i) => {
            const at = cellPoint(i);
            const owner = STOPS[OWNER[i]];
            if (i >= filled) {
              return <IsoBlock key={i} {...at} color="#2d475e" size={15} height={12} ghost />;
            }
            return (
              <g className="second-cell" key={i}>
                <IsoBlock {...at} color={owner.colour} size={15} height={13} />
              </g>
            );
          })}
          {STOPS.map((item, index) => {
            const first = OWNER.indexOf(index);
            const at = cellPoint(first);
            const reached = filled > first;
            return (
              <text
                key={item.label}
                className="second-tick"
                x={at.x - 14}
                y={at.y - 26}
                fill={reached ? item.colour : "#4e657c"}
                fontSize="9"
              >
                {first * CELL_MS}ms {item.label}
              </text>
            );
          })}
          <text x="18" y="24" fill="#6f879e" fontSize="9">
            ONE LINE = 2.00s · ONE CELL = 200ms · ILLUSTRATIVE, NOT A BENCHMARK
          </text>
          {done && (
            <text className="second-flash" x="230" y="150" textAnchor="middle" fill="#eaf4ff" fontSize="14">
              LINE COMPLETE
            </text>
          )}
        </svg>

        <dl className="second-ledger">
          {STOPS.map((item, index) => {
            const first = OWNER.indexOf(index);
            const reached = filled > first;
            return (
              <div
                key={item.label}
                data-reached={reached ? "yes" : "no"}
                style={{ "--hue": item.colour } as React.CSSProperties}
              >
                <dt>
                  <i aria-hidden="true" />
                  {item.label}
                </dt>
                <dd>
                  <span>
                    {first * CELL_MS}–{(first + item.cells) * CELL_MS}ms
                  </span>
                  <b style={{ width: `${(item.cells / CELLS) * 100}%` }} aria-hidden="true" />
                  <small>{item.cells * 10}% of the wait</small>
                </dd>
              </div>
            );
          })}
          <p>
            Three invisible systems, then the model. Half the wait is the part
            everyone credits; the other half is the part that makes it possible.
          </p>
        </dl>
      </div>
    </section>
  );
}
