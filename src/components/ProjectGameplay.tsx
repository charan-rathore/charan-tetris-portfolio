"use client";

import { useEffect, useRef } from "react";
import { demoBoard, planDrop } from "./tetris/project-demo";
import { collapseRows, fullRows, mergePiece } from "./tetris/engine";
import { HIDDEN_ROWS, ROWS, PIECES, pieceCells, type PieceName } from "./tetris/types";

/**
 * Renders the Tetris gameplay canvas.
 *
 * skip / replay are owned by the parent (Portfolio.tsx) so the SHOW ARTWORK
 * button can live BELOW the project-media element rather than overlaid on it.
 */
export function ProjectGameplay({
  level,
  systems,
  skip,
  replay,
}: {
  level: number;
  systems: { name: string }[];
  skip: boolean;
  replay: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false,
      finished = reduced.matches || skip,
      last = 0,
      time = 0,
      elapsed = 0,
      index = 0,
      score = 0,
      lines = 0,
      frame = 0;
    let board = demoBoard(level),
      target = planDrop(board, "I");
    const sequence: PieceName[] = ["I", "T", "L", "S", "J", "O", "Z", "I", "T", "L", "O", "I"];
    const count = Math.min(12, 6 + systems.length);
    const stepMs = 670;
    el.dataset.done = String(finished);

    const draw = () => {
      const w = el.clientWidth,
        h = el.clientHeight,
        dpr = Math.min(devicePixelRatio, 1.5);
      if (!w || !h) return;
      if (
        el.width !== Math.round(w * dpr) ||
        el.height !== Math.round(h * dpr)
      ) {
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#070c16";
      ctx.fillRect(0, 0, w, h);
      const cell = (h - 24) / (ROWS - HIDDEN_ROWS),
        ox = 16,
        oy = 12;
      ctx.strokeStyle = "#233248";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= 10; x++) {
        ctx.beginPath();
        ctx.moveTo(ox + x * cell, oy);
        ctx.lineTo(ox + x * cell, h - 12);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS - HIDDEN_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + y * cell);
        ctx.lineTo(ox + 10 * cell, oy + y * cell);
        ctx.stroke();
      }
      const paint = (x: number, y: number, color: string, alpha = 1) => {
        if (y < HIDDEN_ROWS) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(
          ox + x * cell + 1,
          oy + (y - HIDDEN_ROWS) * cell + 1,
          cell - 2,
          cell - 2
        );
        ctx.fillStyle = "#ffffff55";
        ctx.fillRect(
          ox + x * cell + 1,
          oy + (y - HIDDEN_ROWS) * cell + 1,
          cell - 2,
          2
        );
        ctx.globalAlpha = 1;
      };
      board.forEach((row, y) =>
        row.forEach((color, x) => {
          if (color) paint(x, y, color);
        })
      );
      const phase = Math.min(time / stepMs, 1);
      if (target) {
        pieceCells(target).forEach(([x, y]) =>
          paint(x, y, PIECES[target!.name].color, 0.2)
        );
        const drop = Math.min(1, Math.max(0, (phase - 0.35) / 0.5));
        const moving = {
          ...target,
          x:
            phase < 0.35
              ? Math.round(3 + (target.x - 3) * (phase / 0.35))
              : target.x,
          y: Math.round(2 + (target.y - 2) * drop * drop),
        };
        ctx.shadowColor = PIECES[target.name].color;
        ctx.shadowBlur = 8;
        pieceCells(moving).forEach(([x, y]) =>
          paint(x, y, PIECES[target!.name].color)
        );
        ctx.shadowBlur = 0;
      }
      const tx = ox + 10 * cell + 20,
        available = w - tx - 12;
      ctx.fillStyle = "#00e0ff";
      ctx.font = "10px monospace";
      ctx.fillText(
        `AUTO RUN / LEVEL ${String(level + 1).padStart(2, "0")}`,
        tx,
        28,
        available
      );
      ctx.fillStyle = "#edf3ff";
      ctx.font = "bold 22px monospace";
      ctx.fillText(String(score).padStart(6, "0"), tx, 60, available);
      ctx.fillStyle = "#8da1bc";
      ctx.font = "10px monospace";
      ctx.fillText(`DEMO SCORE · ${lines} LINES`, tx, 80, available);
      ctx.fillStyle = lines >= 4 ? "#ffd500" : "#b968ff";
      ctx.fillText(lines >= 4 ? "TETRIS! +800" : "FIND THE FIT", tx, 105, available);
      systems.slice(0, 4).forEach((system, i) => {
        ctx.fillStyle = i <= index / 2 ? "#dbeaff" : "#526075";
        ctx.fillText(
          `${i <= index / 2 ? "■" : "□"} ${system.name}`,
          tx,
          132 + i * 20,
          available
        );
      });
      ctx.fillStyle = "#00e0ff";
      ctx.fillRect(tx, h - 24, Math.max(0, available) * (index / count), 3);
      ctx.fillStyle = "#72849d";
      ctx.fillText("ASSEMBLING THE PROJECT", tx, h - 34, available);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden || finished) {
        last = now;
        return;
      }
      if (!target) {
        finished = true;
        el.dataset.done = "true";
        return;
      }
      const wallDelta = last ? now - last : 0;
      elapsed += wallDelta;
      if (elapsed >= 10000) {
        finished = true;
        el.dataset.done = "true";
        return;
      }
      const dt = Math.min(wallDelta, 250);
      last = now;
      time += dt;
      if (time >= stepMs && target) {
        board = mergePiece(board, target, PIECES[target.name].color);
        const cleared = fullRows(board);
        board = collapseRows(board, cleared);
        lines += cleared.length;
        score += (cleared.length === 4 ? 800 : cleared.length * 100) + target.y * 2;
        index++;
        time = 0;
        if (index >= count) {
          finished = true;
          el.dataset.done = "true";
          el.dataset.lines = String(lines);
          el.dataset.score = String(score);
        } else {
          target = planDrop(board, sequence[index]);
        }
      }
      draw();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        last = 0;
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    const resize = new ResizeObserver(draw);
    resize.observe(el);
    draw();
    frame = requestAnimationFrame(loop);
    const motion = () => {
      if (reduced.matches) {
        finished = true;
        el.dataset.done = "true";
      }
    };
    reduced.addEventListener("change", motion);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      reduced.removeEventListener("change", motion);
    };
  }, [level, replay, systems, skip]);

  return <canvas ref={canvas} className="project-gameplay" aria-hidden="true" />;
}
