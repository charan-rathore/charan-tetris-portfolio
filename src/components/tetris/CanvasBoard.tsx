"use client";

import { useEffect, useRef } from "react";
import type { GameEvent, TetrisGame } from "./game";
import { COLS, HIDDEN_ROWS, VISIBLE_ROWS, PIECES, pieceCells } from "./types";

/** GPU-independent renderer; drives the exact same game and scoring state. */
export function CanvasBoard({ game, onEvents }: {
  game: TetrisGame;
  onEvents: (events: GameEvent[]) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const eventsRef = useRef(onEvents);
  useEffect(() => { eventsRef.current = onEvents; }, [onEvents]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = 32;
    canvas.width = COLS * cell;
    canvas.height = VISIBLE_ROWS * cell;
    let frame = 0;
    let last = performance.now();
    const block = (x: number, y: number, color: string, ghost = false) => {
      const row = y - HIDDEN_ROWS;
      if (row < 0) return;
      ctx.globalAlpha = ghost ? 0.25 : 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * cell + 1, row * cell + 1, cell - 2, cell - 2);
      ctx.strokeStyle = ghost ? color : "#ffffff55";
      ctx.strokeRect(x * cell + 3, row * cell + 3, cell - 6, cell - 6);
      ctx.globalAlpha = 1;
    };
    const render = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      if (!document.hidden) {
        game.update(dt);
        const events = game.drainEvents();
        if (events.length) eventsRef.current(events);
        ctx.fillStyle = "#07090f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#2a335044";
        for (let y = 0; y < VISIBLE_ROWS; y++) {
          for (let x = 0; x < COLS; x++) ctx.strokeRect(x * cell, y * cell, cell, cell);
        }
        game.board.forEach((row, y) => row.forEach((color, x) => {
          if (color) block(x, y, color);
        }));
        if (game.active) {
          const color = PIECES[game.active.name].color;
          pieceCells({ ...game.active, y: game.ghostRow() }).forEach(([x, y]) => block(x, y, color, true));
          pieceCells(game.active).forEach(([x, y]) => block(x, y, color));
        }
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [game]);

  return <canvas ref={ref} className="board-canvas board-canvas-2d" aria-label="Tetris board" />;
}
