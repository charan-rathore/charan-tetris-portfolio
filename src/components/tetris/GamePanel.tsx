"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { readStoredNumber, writeStoredNumber } from "@/lib/storage";
import { sfx } from "./audio";
import type { GameEvent, GameSnapshot } from "./game";
import { TetrisGame } from "./game";
import { INTEL, unlockAllIntel, unlockIntel, useUnlockedIntel } from "./intel";
import { PIECES, PieceName } from "./types";

const BoardScene = dynamic(
  () => import("./BoardScene").then((module) => module.BoardScene),
  {
    ssr: false,
    loading: () => <div className="board-loading">BOOTING RENDERER…</div>,
  },
);

const HIGH_SCORE_KEY = "cr-tetris-high-score";
const MUTE_KEY = "cr-tetris-muted";

function subscribeHighScore(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(`${HIGH_SCORE_KEY}-updated`, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(`${HIGH_SCORE_KEY}-updated`, onChange);
  };
}

function PiecePreview({ name }: { name: PieceName | null }) {
  if (!name) return <div className="piece-preview is-empty" />;
  const cells = PIECES[name].rotations[0];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  const width = Math.max(...cells.map(([x]) => x)) - minX + 1;
  const height = Math.max(...cells.map(([, y]) => y)) - minY + 1;
  const filled = new Set(cells.map(([x, y]) => `${x - minX},${y - minY}`));
  return (
    <div
      className="piece-preview"
      style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
      aria-label={`${name} piece`}
    >
      {Array.from({ length: width * height }, (_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        const on = filled.has(`${x},${y}`);
        return (
          <i
            key={index}
            style={
              on
                ? {
                    background: PIECES[name].color,
                    boxShadow: `0 0 6px ${PIECES[name].color}66`,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

const CLEAR_LABELS = ["", "SINGLE", "DOUBLE", "TRIPLE", "TETRIS"];

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Toast = { title: string; sub: string; key: number };

export function GamePanel() {
  const gameRef = useRef<TetrisGame | null>(null);
  if (!gameRef.current) gameRef.current = new TetrisGame();
  const game = gameRef.current;

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => game.snapshot());
  const [toast, setToast] = useState<Toast | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const sectionRef = useRef<HTMLElement>(null);

  const highScore = useSyncExternalStore(
    subscribeHighScore,
    () => readStoredNumber(HIGH_SCORE_KEY, 0),
    () => 0,
  );
  const unlocked = useUnlockedIntel();

  useEffect(() => {
    setMuted(readStoredNumber(MUTE_KEY, 0) === 1);
  }, []);

  // Decrypt intel files as the score (or best on this device) crosses thresholds.
  useEffect(() => {
    const floor = Math.max(snapshot.score, highScore);
    for (const item of INTEL) {
      if (floor >= item.at && !unlocked.has(item.id)) {
        unlockIntel(item.id);
        if (snapshot.score >= item.at) {
          setToast({
            title: "INTEL DECRYPTED",
            sub: `${item.label} · ${item.title}`,
            key: Date.now(),
          });
          if (!mutedRef.current) sfx.intel();
        }
      }
    }
  }, [snapshot.score, highScore, unlocked]);

  // Konami code: instantly opens the whole vault for the curious.
  useEffect(() => {
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        unlockAllIntel();
        setToast({
          title: "CHEAT CODE ACCEPTED",
          sub: "VAULT OPEN · ALL FILES DECRYPTED",
          key: Date.now(),
        });
        if (!mutedRef.current) sfx.intel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    game.onChange(() => setSnapshot(game.snapshot()));
  }, [game]);

  const handleEvents = useCallback(
    (events: GameEvent[]) => {
      const quiet = mutedRef.current;
      for (const event of events) {
        switch (event.type) {
          case "start":
            if (!quiet) sfx.start();
            break;
          case "move":
            if (!quiet) sfx.move();
            break;
          case "rotate":
            if (!quiet) sfx.rotate(event.kicked);
            break;
          case "softstep":
            if (!quiet) sfx.softStep();
            break;
          case "harddrop":
            if (!quiet) sfx.hardDrop();
            break;
          case "lock":
            if (!quiet) sfx.lock();
            break;
          case "hold":
            if (!quiet) sfx.hold();
            break;
          case "clear": {
            if (!quiet) sfx.clear(event.lines, event.backToBack);
            const title =
              event.lines === 4
                ? event.backToBack
                  ? "B2B TETRIS"
                  : "TETRIS"
                : CLEAR_LABELS[event.lines];
            const parts = [`+${event.points}`];
            if (event.combo > 0) parts.push(`COMBO ×${event.combo}`);
            setToast({ title, sub: parts.join("  ·  "), key: Date.now() });
            if (event.lines === 4) setFlashKey((value) => value + 1);
            break;
          }
          case "levelup":
            if (!quiet) sfx.levelUp();
            setToast({
              title: `LEVEL ${event.level}`,
              sub: "GRAVITY INCREASED",
              key: Date.now(),
            });
            break;
          case "gameover":
            if (!quiet) sfx.gameOver();
            if (event.score > readStoredNumber(HIGH_SCORE_KEY, 0)) {
              writeStoredNumber(HIGH_SCORE_KEY, event.score);
            }
            break;
        }
      }
      setSnapshot((previous) => {
        const next = game.snapshot();
        return previous.score !== next.score ||
          previous.status !== next.status ||
          previous.lines !== next.lines ||
          previous.combo !== next.combo ||
          previous.hold !== next.hold ||
          previous.queue.join() !== next.queue.join()
          ? next
          : previous;
      });
    },
    [game],
  );

  const startGame = useCallback(() => {
    sfx.unlock();
    game.start();
  }, [game]);

  // Keyboard: DAS-aware press/release handling.
  useEffect(() => {
    const gameKeys = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "ArrowUp",
      " ",
      "x",
      "X",
      "z",
      "Z",
      "c",
      "C",
      "Shift",
    ]);
    const onKeyDown = (event: KeyboardEvent) => {
      const active = game.status === "playing" || game.status === "clearing";
      if (event.key === "Enter" && (game.status === "ready" || game.status === "over")) {
        startGame();
        return;
      }
      if (event.key === "p" || event.key === "P" || event.key === "Escape") {
        game.togglePause();
        return;
      }
      if (!active && game.status !== "paused") return;
      if (gameKeys.has(event.key)) event.preventDefault();
      if (event.repeat) return;
      switch (event.key) {
        case "ArrowLeft":
          game.pressMove(-1);
          break;
        case "ArrowRight":
          game.pressMove(1);
          break;
        case "ArrowDown":
          game.pressSoft();
          break;
        case "ArrowUp":
        case "x":
        case "X":
          game.rotate(true);
          break;
        case "z":
        case "Z":
          game.rotate(false);
          break;
        case " ":
          game.hardDrop();
          break;
        case "c":
        case "C":
        case "Shift":
          game.holdSwap();
          break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") game.releaseMove(-1);
      if (event.key === "ArrowRight") game.releaseMove(1);
      if (event.key === "ArrowDown") game.releaseSoft();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [game, startGame]);

  // Auto-pause when the tab or section loses attention mid-game.
  useEffect(() => {
    const pauseIfPlaying = () => {
      if (game.status === "playing") game.togglePause();
    };
    const onVisibility = () => {
      if (document.hidden) pauseIfPlaying();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) pauseIfPlaying();
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [game]);

  // Touch: drag to move, quick tap to rotate, fast downward fling to drop.
  const touchState = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    time: 0,
    moved: false,
  });
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    const state = touchState.current;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.lastX = event.clientX;
    state.time = performance.now();
    state.moved = false;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" || game.status !== "playing") return;
    const state = touchState.current;
    const cell = 30;
    while (event.clientX - state.lastX > cell) {
      game.pressMove(1);
      game.releaseMove(1);
      state.lastX += cell;
      state.moved = true;
    }
    while (state.lastX - event.clientX > cell) {
      game.pressMove(-1);
      game.releaseMove(-1);
      state.lastX -= cell;
      state.moved = true;
    }
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" || game.status !== "playing") return;
    const state = touchState.current;
    const dy = event.clientY - state.startY;
    const dx = Math.abs(event.clientX - state.startX);
    const elapsed = performance.now() - state.time;
    if (dy > 70 && dy > dx && elapsed < 260) {
      game.hardDrop();
    } else if (!state.moved && elapsed < 220 && dx < 12 && Math.abs(dy) < 12) {
      game.rotate(true);
    }
  };

  const toggleMute = () => {
    setMuted((value) => {
      writeStoredNumber(MUTE_KEY, value ? 0 : 1);
      return !value;
    });
  };

  const nextIntel = INTEL.find((item) => !unlocked.has(item.id)) ?? null;

  const displayedBest = Math.max(highScore, snapshot.score);
  const stats = useMemo(
    () => [
      { label: "SCORE", value: String(snapshot.score).padStart(6, "0") },
      { label: "BEST", value: String(displayedBest).padStart(6, "0") },
      { label: "LEVEL", value: String(snapshot.level).padStart(2, "0") },
      { label: "LINES", value: String(snapshot.lines).padStart(3, "0") },
      {
        label: "COMBO",
        value: snapshot.combo > 0 ? `×${snapshot.combo}` : "·",
      },
    ],
    [snapshot, displayedBest],
  );

  const status = snapshot.status;

  return (
    <section
      className="arcade"
      id="play"
      ref={sectionRef}
      aria-label="Playable Tetris"
    >
      <div className="arcade-shell">
        <div className="arcade-side arcade-left" aria-label="Game statistics">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <span>{stat.label}</span>
              <b>{stat.value}</b>
            </div>
          ))}
          <button
            type="button"
            className="sound-toggle"
            onClick={toggleMute}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? "SOUND OFF" : "SOUND ON"}
          </button>
        </div>

        <div
          className="arcade-board"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <BoardScene game={game} onEvents={handleEvents} />
          {flashKey > 0 && <div className="board-flash" key={flashKey} />}
          {toast && (
            <div className="board-toast" key={toast.key}>
              <b>{toast.title}</b>
              <span>{toast.sub}</span>
            </div>
          )}
          {status !== "playing" && status !== "clearing" && (
            <div className="board-overlay">
              {status === "ready" && (
                <>
                  <span className="pixel-label">CREDIT 00 · FREE PLAY</span>
                  <h3>TETRIS, DONE PROPERLY.</h3>
                  <p>
                    SRS wall kicks · 7-bag randomizer · DAS &amp; ARR · lock
                    delay. Judge me by the feel.
                  </p>
                  <button type="button" className="start-button" onClick={startGame}>
                    ▶ PRESS START
                  </button>
                </>
              )}
              {status === "paused" && (
                <>
                  <span className="pixel-label">SYSTEM HALTED</span>
                  <h3>PAUSED</h3>
                  <button
                    type="button"
                    className="start-button"
                    onClick={() => game.togglePause()}
                  >
                    RESUME · P
                  </button>
                </>
              )}
              {status === "over" && (
                <>
                  <span className="pixel-label">GAME OVER</span>
                  <h3>{String(snapshot.score).padStart(6, "0")}</h3>
                  <p>
                    {snapshot.score >= highScore && snapshot.score > 0
                      ? "New personal best · saved on this device."
                      : `Best on this device: ${String(displayedBest).padStart(6, "0")}`}
                  </p>
                  <button type="button" className="start-button" onClick={startGame}>
                    ↻ PLAY AGAIN
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="arcade-side arcade-right">
          <div className="queue-block">
            <span>HOLD</span>
            <PiecePreview name={snapshot.hold} />
          </div>
          <div className="queue-block">
            <span>NEXT</span>
            <PiecePreview name={snapshot.queue[0] ?? null} />
            <PiecePreview name={snapshot.queue[1] ?? null} />
            <PiecePreview name={snapshot.queue[2] ?? null} />
          </div>
          <div className="keys-legend" aria-hidden="true">
            <div><i>←→</i> MOVE</div>
            <div><i>↑ / X</i> ROTATE</div>
            <div><i>Z</i> COUNTER</div>
            <div><i>↓</i> SOFT DROP</div>
            <div><i>SPACE</i> HARD DROP</div>
            <div><i>C</i> HOLD</div>
            <div><i>P</i> PAUSE</div>
          </div>
        </div>
      </div>

      <div className="touch-controls" aria-label="Touch controls">
        <button
          type="button"
          onPointerDown={() => game.pressMove(-1)}
          onPointerUp={() => game.releaseMove(-1)}
          onPointerLeave={() => game.releaseMove(-1)}
          aria-label="Move left"
        >
          ←
        </button>
        <button type="button" onClick={() => game.rotate(true)} aria-label="Rotate">
          ↻
        </button>
        <button
          type="button"
          onPointerDown={() => game.pressMove(1)}
          onPointerUp={() => game.releaseMove(1)}
          onPointerLeave={() => game.releaseMove(1)}
          aria-label="Move right"
        >
          →
        </button>
        <button
          type="button"
          onPointerDown={() => game.pressSoft()}
          onPointerUp={() => game.releaseSoft()}
          onPointerLeave={() => game.releaseSoft()}
          aria-label="Soft drop"
        >
          ↓
        </button>
        <button type="button" onClick={() => game.hardDrop()} aria-label="Hard drop">
          DROP
        </button>
        <button type="button" onClick={() => game.holdSwap()} aria-label="Hold piece">
          HOLD
        </button>
      </div>

      <div className="intel-vault" aria-label="Intel vault · unlock by scoring">
        <div className="vault-header">
          <span className="pixel-label accent-yellow">THE INTEL VAULT</span>
          <p>
            {nextIntel
              ? `Score decrypts files the page doesn't show. Next decrypt at ${nextIntel.at.toLocaleString()} pts.`
              : "Every file decrypted. You've seen more than most recruiters ever will."}
          </p>
        </div>
        <div className="intel-grid">
          {INTEL.map((item) => {
            const isOpen = unlocked.has(item.id);
            return (
              <article
                key={item.id}
                className={`intel-card ${isOpen ? "is-open" : "is-locked"}`}
              >
                <span className="pixel-label">{item.label}</span>
                {isOpen ? (
                  <>
                    <h3>{item.title}</h3>
                    <p>{item.blurb}</p>
                    {item.href && item.cta && (
                      <a href={item.href} target="_blank" rel="noreferrer">
                        {item.cta}
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <h3 aria-hidden="true">▓▓▓▓▓▓▓▓</h3>
                    <p className="intel-locked-note">
                      ENCRYPTED · DECRYPT AT {item.at.toLocaleString()} PTS
                    </p>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
