"use client";

import { useEffect, useMemo, useRef } from "react";
import { PIECES, PieceName } from "./tetris/types";

type LangItem = { name: string; count: number; color: string; piece: PieceName };

function LangGlyph({
  name,
  color,
  size,
}: {
  name: PieceName;
  color: string;
  size: number;
}) {
  const cells = PIECES[name].rotations[0];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  const width = Math.max(...cells.map(([x]) => x)) - minX + 1;
  const height = Math.max(...cells.map(([, y]) => y)) - minY + 1;
  const filled = new Set(cells.map(([x, y]) => `${x - minX},${y - minY}`));
  const cell = Math.max(7, Math.round(size));
  return (
    <div
      className="lang-glyph"
      style={{
        gridTemplateColumns: `repeat(${width}, ${cell}px)`,
        gap: Math.max(2, Math.round(cell * 0.1)),
      }}
      aria-hidden="true"
    >
      {Array.from({ length: width * height }, (_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        return (
          <i
            key={index}
            style={
              filled.has(`${x},${y}`)
                ? {
                    width: cell,
                    height: cell,
                    background: color,
                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2), 0 0 14px ${color}66`,
                  }
                : { width: cell, height: cell, opacity: 0 }
            }
          />
        );
      })}
    </div>
  );
}

type SimPiece = {
  el: HTMLAnchorElement;
  x: number;
  y: number;
  rot: number;
  targetX: number;
  targetY: number;
  delay: number;
  vy: number;
  phase: "fall" | "settle" | "done";
};

/**
 * Language blocks spawn scrambled, then lock into an ordered bottom row.
 */
export function LangCrushBoard({
  items,
  hrefFor,
  onActivate,
}: {
  items: LangItem[];
  hrefFor: (name: string) => string;
  onActivate: () => void;
}) {
  const wellRef = useRef<HTMLDivElement>(null);
  const maxCount = Math.max(1, ...items.map((item) => item.count));

  const ordered = useMemo(() => {
    const n = Math.max(items.length, 1);
    return items.map((item, index) => {
      const slot = index / Math.max(n - 1, 1);
      return {
        ...item,
        targetX: 10 + slot * 80,
        targetY: 70,
        size: 9 + (item.count / maxCount) * 13,
      };
    });
  }, [items, maxCount]);

  useEffect(() => {
    const well = wellRef.current;
    if (!well) return;
    const nodes = [
      ...well.querySelectorAll<HTMLAnchorElement>(".lang-crush-piece"),
    ];
    if (nodes.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sims: SimPiece[] = nodes.map((el, index) => {
      const target = ordered[index];
      if (reduced) {
        el.style.left = `${target.targetX}%`;
        el.style.top = `${target.targetY}%`;
        el.style.transform = "translate(-50%, -50%) rotate(0deg)";
        el.dataset.phase = "done";
        return {
          el,
          x: target.targetX,
          y: target.targetY,
          rot: 0,
          targetX: target.targetX,
          targetY: target.targetY,
          delay: 0,
          vy: 0,
          phase: "done",
        };
      }
      const startX = 8 + Math.random() * 84;
      const startY = -12 - Math.random() * 35;
      const startRot = (Math.random() - 0.5) * 55;
      el.style.left = `${startX}%`;
      el.style.top = `${startY}%`;
      el.style.transform = `translate(-50%, -50%) rotate(${startRot}deg)`;
      el.dataset.phase = "fall";
      return {
        el,
        x: startX,
        y: startY,
        rot: startRot,
        targetX: target.targetX,
        targetY: target.targetY,
        delay: index * 120 + Math.random() * 240,
        vy: 0,
        phase: "fall",
      };
    });

    if (reduced) return;

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt * 1000;

      let allDone = true;
      for (const piece of sims) {
        if (piece.phase === "done") continue;
        allDone = false;
        if (elapsed < piece.delay) continue;

        if (piece.phase === "fall") {
          piece.vy += 460 * dt;
          piece.y += piece.vy * dt;
          piece.x += (piece.targetX - piece.x) * Math.min(1, dt * 1.5);
          piece.rot *= Math.exp(-dt * 1.6);
          if (piece.y >= piece.targetY - 1.5) {
            piece.y = piece.targetY;
            piece.vy = 0;
            piece.phase = "settle";
            piece.el.dataset.phase = "settle";
          }
        } else {
          piece.x += (piece.targetX - piece.x) * Math.min(1, dt * 7);
          piece.y += (piece.targetY - piece.y) * Math.min(1, dt * 9);
          piece.rot *= Math.exp(-dt * 12);
          if (
            Math.abs(piece.x - piece.targetX) < 0.35 &&
            Math.abs(piece.y - piece.targetY) < 0.35 &&
            Math.abs(piece.rot) < 0.4
          ) {
            piece.x = piece.targetX;
            piece.y = piece.targetY;
            piece.rot = 0;
            piece.phase = "done";
            piece.el.dataset.phase = "done";
          }
        }
        piece.el.style.left = `${piece.x}%`;
        piece.el.style.top = `${piece.y}%`;
        piece.el.style.transform = `translate(-50%, -50%) rotate(${piece.rot}deg)`;
      }

      if (!allDone) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [ordered]);

  // Render in final order so settle targets match DOM index.
  return (
    <div
      className="lang-crush-well"
      ref={wellRef}
      aria-label="Language mix as Tetris blocks"
    >
      <div className="lang-crush-grid" aria-hidden="true" />
      <div className="lang-crush-floor" aria-hidden="true" />
      {ordered.map((item) => (
        <a
          key={item.name}
          className="lang-crush-piece"
          href={hrefFor(item.name)}
          target="_blank"
          rel="noreferrer"
          title={`${item.name}: ${item.count} repos`}
          style={{ "--piece": item.color } as React.CSSProperties}
          onClick={() => onActivate()}
        >
          <LangGlyph name={item.piece} color={item.color} size={item.size} />
          <span className="lang-crush-label">
            {item.name}
            <b>{item.count}</b>
          </span>
        </a>
      ))}
    </div>
  );
}
