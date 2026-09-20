"use client";
import { useEffect, useRef } from 'react';
import { PIECES } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

/**
 * An isometric switchboard.
 *
 * The 28 orbit marks rotate via RAF + SVG `rotate(angle cx cy)`, which pivots
 * around the exact SVG-coordinate point (300, 174) regardless of how the SVG
 * scales in CSS. `transform-box`/`transform-origin` is NOT used — those have
 * browser-specific quirks on <g> elements.
 *
 * The center piece, ellipse tracks and three ports are never touched by the
 * animation and stay visually fixed.
 */
export function BridgeScene({ color, mode }: { color: string; mode: number }) {
  const orbitRef = useRef<SVGGElement>(null);
  const raf = useRef<{ angle: number; last: number; id: number }>({ angle: 0, last: 0, id: 0 });

  useEffect(() => {
    const r = raf.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let running = false;

    const tick = (now: number) => {
      const dt = r.last ? Math.min(now - r.last, 100) : 0;
      r.last = now;
      // 90 s per full revolution
      r.angle = (r.angle + dt * (360 / 90_000)) % 360;
      orbitRef.current?.setAttribute('transform', `rotate(${r.angle.toFixed(2)} 300 174)`);
      r.id = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced.matches) return;
      running = true;
      r.last = 0;
      r.id = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(r.id);
    };

    const onMotion = () => (reduced.matches ? stop() : start());
    reduced.addEventListener('change', onMotion);

    // Also pause when the page's ambient control is set
    const onAmbient = (e: Event) => {
      const main = (e.target as Element).closest('main');
      if (main?.getAttribute('data-ambient') === 'paused') stop(); else start();
    };
    document.addEventListener('ambientchange', onAmbient);

    start();
    return () => {
      stop();
      reduced.removeEventListener('change', onMotion);
      document.removeEventListener('ambientchange', onAmbient);
    };
  }, []);

  const ports = [[128, 80], [470, 80], [310, 245]] as const;

  return (
    <div className="bridge-render vector-opening" data-ready="true" data-renderer="isometric-svg">
      <svg viewBox="0 0 600 300" aria-hidden="true">
        {Array.from({ length: 42 }, (_, i) => (
          <circle key={`star-${i}`}
            cx={22 + (i * 137) % 554} cy={14 + (i * 71) % 272}
            r={i % 7 === 0 ? 1.3 : 0.65}
            fill="#b5c5e4"
            opacity={i % 3 === 0 ? 0.45 : 0.18}
          />
        ))}

        {/* Fixed ellipse tracks — never animated */}
        <ellipse cx="300" cy="174" rx="210" ry="91" fill="none" stroke="#283a50" strokeDasharray="2 12" />
        <ellipse cx="300" cy="174" rx="168" ry="71" fill="none" stroke={color} strokeOpacity=".18" />

        {/*
          Orbit marks — rotated by RAF via SVG `rotate(angle 300 174)`.
          The three args (angle, cx, cy) are in SVG viewBox coordinates,
          so the pivot is always the exact center of the ellipse.
        */}
        <g ref={orbitRef}>
          {Array.from({ length: 28 }, (_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const highlight = Math.round((i / 28) * 8) % 8 === mode * 2 % 8;
            return (
              <IsoBlock
                key={i}
                x={300 + Math.cos(a) * 210}
                y={174 + Math.sin(a) * 91}
                color={highlight ? color : '#1e3448'}
                size={highlight ? 8 : 6}
                height={highlight ? 6 : 4}
              />
            );
          })}
        </g>

        {/* Ports — fixed, wired to the center */}
        {ports.map(([x, y], i) => (
          <g key={i} opacity={i === mode ? 1 : 0.3}>
            <path d={`M300 162H${x}V${y}`} stroke={i === mode ? color : '#52708d'} strokeWidth={i === mode ? 3 : 1} fill="none" />
            {i === mode && (
              <path className="bridge-current" d={`M300 162H${x}V${y}`} stroke="white" strokeWidth="3" fill="none" strokeDasharray="5 45" />
            )}
            {PIECES[(['T', 'O', 'L'] as const)[i]].rotations[0].map(([cx, cy], j) => (
              <IsoBlock key={j} x={x + (cx - cy) * 13} y={y + (cx + cy) * 6} color={i === mode ? color : '#557089'} />
            ))}
          </g>
        ))}

        {/* Center platform — fixed */}
        <path d="M229 155 300 122 371 155V183L300 220 229 183Z" fill="#071221" stroke={color} strokeOpacity=".7" />
        <path d="M229 155 300 192 371 155M300 192V220" stroke={color} strokeOpacity=".4" fill="none" />

        {/* Center piece — fixed, changes with mode */}
        <g className="bridge-core" key={mode}>
          {PIECES.T.rotations[mode].map(([x, y], i) => (
            <IsoBlock key={i} x={300 + (x - y) * 22} y={126 + (x + y) * 11} size={21} height={22} color={color} />
          ))}
        </g>
      </svg>
    </div>
  );
}
