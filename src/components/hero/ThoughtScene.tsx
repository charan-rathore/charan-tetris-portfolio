"use client";
import { useEffect, useRef, useState } from 'react';
import { demoBoard, planDrop } from '../tetris/project-demo';
import { collapseRows, fullRows, mergePiece } from '../tetris/engine';
import { PIECES, pieceCells, type PieceName } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

export type ThoughtProgress = { score: number; lines: number; placed: number; next: PieceName };
const sequence: PieceName[] = ['I', 'T', 'L', 'S', 'J', 'O', 'Z', 'I', 'T', 'L', 'O', 'I'];
const fresh = () => ({ board: demoBoard(0), target: planDrop(demoBoard(0), 'I'), elapsed: 0, score: 0, lines: 0, placed: 0, index: 0 });

/** Legal Tetris placement with the same extruded artwork in every browser. */
export function ThoughtScene({ drop, paused, onProgress }: { drop: number; paused: boolean; onProgress: (value: ThoughtProgress) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const control = useRef({ drop, paused });
  const [scene, setScene] = useState(fresh);
  useEffect(() => { control.current = { drop, paused }; }, [drop, paused]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let visible = false, seenDrop = control.current.drop;
    const m = fresh();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(el);
    const report = () => onProgress({ score: m.score, lines: m.lines, placed: m.placed, next: sequence[(m.index + 1) % sequence.length] });
    report();
    const tick = setInterval(() => {
      const manual = seenDrop !== control.current.drop;
      if (!manual && (!visible || document.hidden || control.current.paused || reduced.matches)) return;
      m.elapsed += 64;
      if (manual || m.elapsed >= 2000) {
        seenDrop = control.current.drop;
        if (m.target) {
          const locked = mergePiece(m.board, m.target, PIECES[m.target.name].color);
          const rows = fullRows(locked);
          m.board = collapseRows(locked, rows);
          m.lines += rows.length;
          m.score += (rows.length === 4 ? 800 : rows.length * 100) + m.target.y * 2;
          m.placed++;
          m.index = (m.index + 1) % sequence.length;
        }
        if (!m.target || m.index === 0) m.board = demoBoard(Math.floor(m.placed / sequence.length));
        m.target = planDrop(m.board, sequence[m.index]);
        m.elapsed = 0;
        report();
      }
      setScene({ ...m });
    }, 64);
    return () => { clearInterval(tick); observer.disconnect(); };
  }, [onProgress]);
  const m = scene;
  const cells = m.board.flatMap((row, y) => row.flatMap((color, x) => color ? [{ x, y, color }] : []));
  const phase = Math.min(1, m.elapsed / 1800);
  const falling = m.target ? pieceCells({ ...m.target, y: m.target.y * phase * phase }).map(([x, y]) => ({ x, y, color: PIECES[m.target!.name].color })) : [];
  const point = (x: number, y: number) => ({ x: 245 + (x - y) * 10, y: 32 + (x + y) * 5.5 });
  return <div ref={host} className="thought-scene vector-opening" data-ready="true" data-renderer="isometric-svg" aria-hidden="true">
    <svg viewBox="0 0 430 240">
      <path d="M245 20 352 79 126 203 19 144V158L126 217 352 93V79M126 203V217" fill="#0a1929" stroke="#526b86" />
      {Array.from({ length: 11 }, (_, x) => { const a = point(x, 0), b = point(x, 22); return <path key={`x${x}`} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke="#213e55" />; })}
      {Array.from({ length: 23 }, (_, y) => { const a = point(0, y), b = point(10, y); return <path key={`y${y}`} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke="#213e55" />; })}
      {m.target && pieceCells(m.target).map(([x, y], i) => <IsoBlock key={`ghost${i}`} {...point(x, y)} color={PIECES[m.target!.name].color} size={9} height={7} ghost />)}
      {[...cells, ...falling].sort((a, b) => a.x + a.y - b.x - b.y).map((cell, i) => <IsoBlock key={i} {...point(cell.x, cell.y)} color={cell.color} size={9} height={9} />)}
      <text x="26" y="234" fill="#88a5c0" fontSize="9" letterSpacing="2">IDEAS LAND. PATTERNS EMERGE.</text>
    </svg>
  </div>;
}
