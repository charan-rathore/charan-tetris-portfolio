"use client";

import { useEffect, useRef } from "react";
import { PIECE_COLORS, PIECES, PieceName } from "./types";

const COLS = 10;
const ROWS = 20;
const NAMES = Object.keys(PIECES) as PieceName[];

type Cell = string | null;
type Active = {
  name: PieceName;
  x: number;
  y: number;
  rot: 0 | 1 | 2 | 3;
};

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

function cellsOf(piece: Active) {
  return PIECES[piece.name].rotations[piece.rot].map(
    ([dx, dy]) => [piece.x + dx, piece.y + dy] as const,
  );
}

function collides(board: Cell[][], piece: Active) {
  return cellsOf(piece).some(([x, y]) => {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y < 0) return false;
    return board[y][x] !== null;
  });
}

function lock(board: Cell[][], piece: Active) {
  const next = board.map((row) => row.slice());
  const color = PIECES[piece.name].color;
  for (const [x, y] of cellsOf(piece)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = color;
  }
  return next;
}

function clearLines(board: Cell[][]) {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array<Cell>(COLS).fill(null));
  return { board: kept, cleared };
}

function spawn(name?: PieceName): Active {
  const pick = name ?? NAMES[Math.floor(Math.random() * NAMES.length)];
  return { name: pick, x: 3, y: -1, rot: 0 };
}

/**
 * Looping 2D “ideal run” preview so the start screen never shows a dead board.
 * Feels like a gameplay GIF: gravity, soft locks, and line clears on repeat.
 */
export function GameplayPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let board = emptyBoard();
    let piece = spawn("T");
    let bag = [...NAMES].sort(() => Math.random() - 0.5);
    let dropAccum = 0;
    let clearFlash: number[] = [];
    let flashLife = 0;
    let running = true;
    let last = performance.now();
    let raf = 0;

    const nextFromBag = () => {
      if (bag.length === 0) bag = [...NAMES].sort(() => Math.random() - 0.5);
      return bag.pop()!;
    };

    const resetRun = () => {
      board = emptyBoard();
      // Seed a small “well” so the loop feels mid-game immediately.
      for (let y = ROWS - 4; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          if (Math.random() > 0.35 && x !== 4 && x !== 5) {
            board[y][x] =
              Object.values(PIECE_COLORS)[
                Math.floor(Math.random() * 7)
              ];
          }
        }
      }
      piece = spawn(nextFromBag());
      dropAccum = 0;
      clearFlash = [];
      flashLife = 0;
    };

    resetRun();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w < 2 || h < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(w * dpr));
      const nextH = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const tryMove = (dx: number, dy: number, dRot = 0) => {
      const next: Active = {
        ...piece,
        x: piece.x + dx,
        y: piece.y + dy,
        rot: (((piece.rot + dRot) % 4) + 4) % 4 as 0 | 1 | 2 | 3,
      };
      if (!collides(board, next)) {
        piece = next;
        return true;
      }
      return false;
    };

    const hardishStep = () => {
      // Occasional AI-ish decisions so the loop looks intentional.
      if (Math.random() < 0.18) tryMove(Math.random() < 0.5 ? -1 : 1, 0);
      if (Math.random() < 0.12) tryMove(0, 0, Math.random() < 0.5 ? 1 : -1);
      if (!tryMove(0, 1)) {
        board = lock(board, piece);
        const result = clearLines(board);
        board = result.board;
        if (result.cleared > 0) {
          clearFlash = Array.from({ length: result.cleared }, (_, i) => ROWS - 1 - i);
          flashLife = 0.28;
        }
        piece = spawn(nextFromBag());
        if (collides(board, piece)) resetRun();
      }
    };

    const draw = (dt: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w < 2 || h < 2) return;
      const cell = Math.min(w / COLS, h / ROWS);
      const ox = (w - cell * COLS) / 2;
      const oy = (h - cell * ROWS) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060b";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(42, 51, 80, 0.45)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x += 1) {
        ctx.beginPath();
        ctx.moveTo(ox + x * cell, oy);
        ctx.lineTo(ox + x * cell, oy + ROWS * cell);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y += 1) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + y * cell);
        ctx.lineTo(ox + COLS * cell, oy + y * cell);
        ctx.stroke();
      }

      const paintCell = (x: number, y: number, color: string, glow = false) => {
        if (y < 0) return;
        const px = ox + x * cell;
        const py = oy + y * cell;
        const inset = Math.max(1, cell * 0.08);
        ctx.fillStyle = color;
        ctx.fillRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(px + inset, py + inset, cell - inset * 2, Math.max(2, cell * 0.18));
        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = color;
          ctx.fillRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2);
          ctx.shadowBlur = 0;
        }
      };

      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          const color = board[y][x];
          if (color) paintCell(x, y, color);
        }
      }

      if (flashLife > 0) {
        flashLife -= dt;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, flashLife) * 2})`;
        for (const y of clearFlash) {
          ctx.fillRect(ox, oy + y * cell, COLS * cell, cell);
        }
      }

      for (const [x, y] of cellsOf(piece)) {
        paintCell(x, y, PIECES[piece.name].color, true);
      }

      // Ghost
      const ghost = { ...piece };
      while (!collides(board, { ...ghost, y: ghost.y + 1 })) ghost.y += 1;
      if (ghost.y !== piece.y) {
        ctx.globalAlpha = 0.22;
        for (const [x, y] of cellsOf(ghost)) {
          paintCell(x, y, PIECES[piece.name].color);
        }
        ctx.globalAlpha = 1;
      }
    };

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      dropAccum += dt;
      // ~4.5 cells/sec — readable “ideal” pace
      while (dropAccum >= 0.22) {
        dropAccum -= 0.22;
        hardishStep();
      }
      draw(dt);
    };

    const loop = (now: number) => {
      if (!running) return;
      step(now);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    raf = requestAnimationFrame(loop);
    // Keep animating if the tab throttles rAF (common in background tools).
    const interval = window.setInterval(() => {
      if (!running) return;
      if (performance.now() - last > 250) step(performance.now());
    }, 200);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="gameplay-preview"
      aria-hidden="true"
    />
  );
}
