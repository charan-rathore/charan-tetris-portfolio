"use client";
import { useEffect, useRef } from 'react';
import { PIECES } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

// SVG viewBox constants
const CX = 300;   // orbit + platform center X
const CY = 162;   // orbit + platform center Y (vertical midpoint of the hexagon)
const PORT_R = 128; // circular orbit radius for the three port pieces
const PORT_NAMES = ['T', 'O', 'L'] as const;

// Base angles for the three ports, evenly spaced 120° apart.
// 210° = upper-left, 330° = upper-right, 90° = bottom.
const BASE_DEG = [210, 330, 90];
const BASE_RADS = BASE_DEG.map(d => (d * Math.PI) / 180);

// Pre-compute base (x, y) for each port at rotation=0
const BASE_PORTS = BASE_RADS.map(a => ({
  x: CX + Math.cos(a) * PORT_R,
  y: CY + Math.sin(a) * PORT_R,
}));

/**
 * The human-interface switchboard.
 *
 * Two independent RAF loops run simultaneously:
 *  - Outer orbit marks  → slow elliptical CW rotation, 90 s/rev
 *  - Port tetrominos    → faster circular CCW rotation, 42 s/rev
 *
 * The center T-piece, ellipse tracks, and circular guide ring are fixed.
 * SVG `rotate(angle cx cy)` is used everywhere — no CSS transform-box quirks.
 *
 * Extras:
 *  - Mouse-parallax tilt: the SVG drifts ±10 px toward the cursor
 *  - Mode-change pulse: an expanding ring fires when the active channel switches
 */
export function BridgeScene({ color, mode }: { color: string; mode: number }) {
  const orbitRef = useRef<SVGGElement>(null);
  const portsRef = useRef<SVGGElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const raf = useRef({ ms: 0, last: 0, id: 0 });
  const prevMode = useRef(mode);

  // ─── RAF animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    const r = raf.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let running = false;

    const tick = (now: number) => {
      const dt = r.last ? Math.min(now - r.last, 100) : 0;
      r.last = now;
      r.ms += dt;

      // Outer marks: clockwise elliptical orbit, 90 s/rev
      const orbitDeg = (r.ms / 90_000) * 360 % 360;
      orbitRef.current?.setAttribute('transform', `rotate(${orbitDeg.toFixed(2)} 300 174)`);

      // Port pieces: counter-clockwise circular orbit, 42 s/rev
      // Counter-rotation creates a visually engaging mechanical contrast.
      const portDeg = -(r.ms / 42_000) * 360 % 360;
      portsRef.current?.setAttribute('transform', `rotate(${portDeg.toFixed(2)} ${CX} ${CY})`);

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

    reduced.addEventListener('change', () => (reduced.matches ? stop() : start()));
    start();
    return stop;
  }, []);

  // ─── Mode-change pulse ring ───────────────────────────────────────────────
  useEffect(() => {
    if (mode === prevMode.current) return;
    prevMode.current = mode;
    const el = pulseRef.current;
    if (!el) return;
    // Re-trigger CSS animation by removing + re-adding the class
    el.classList.remove('bridge-pulse-fire');
    void el.offsetWidth; // force reflow
    el.classList.add('bridge-pulse-fire');
  }, [mode]);

  // ─── Mouse-parallax tilt ─────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const svg  = svgRef.current;
    if (!wrap || !svg) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      cx = ((e.clientX - r.left) / r.width  - 0.5) * 2; // −1 … 1
      cy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      tx = cx * 10;
      ty = cy * 5;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    // Smooth lerp so it never jerks
    let frame = 0;
    let curX = 0, curY = 0;
    const lerp = () => {
      curX += (tx - curX) * 0.08;
      curY += (ty - curY) * 0.08;
      svg.style.transform = `translate(${curX.toFixed(2)}px,${curY.toFixed(2)}px)`;
      frame = requestAnimationFrame(lerp);
    };
    frame = requestAnimationFrame(lerp);

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="bridge-render vector-opening" data-ready="true" data-renderer="isometric-svg">
      <svg ref={svgRef} viewBox="0 0 600 300" aria-hidden="true" className="bridge-svg">
        {/* Background stars */}
        {Array.from({ length: 42 }, (_, i) => (
          <circle key={`star-${i}`}
            cx={22 + (i * 137) % 554} cy={14 + (i * 71) % 272}
            r={i % 7 === 0 ? 1.3 : 0.65}
            fill="#b5c5e4"
            opacity={i % 3 === 0 ? 0.45 : 0.18}
          />
        ))}

        {/* Fixed outer ellipse tracks (never animated) */}
        <ellipse cx="300" cy="174" rx="210" ry="91" fill="none" stroke="#283a50" strokeDasharray="2 12" />
        <ellipse cx="300" cy="174" rx="168" ry="71" fill="none" stroke={color} strokeOpacity=".12" />

        {/* Fixed circular guide ring for the port pieces */}
        <circle cx={CX} cy={CY} r={PORT_R} fill="none" stroke={color} strokeOpacity=".10" strokeDasharray="4 20" />

        {/* Outer orbit marks — slow CW elliptical rotation */}
        <g ref={orbitRef}>
          {Array.from({ length: 28 }, (_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const highlight = Math.round((i / 28) * 8) % 8 === (mode * 2) % 8;
            return (
              <IsoBlock key={i}
                x={300 + Math.cos(a) * 210}
                y={174 + Math.sin(a) * 91}
                color={highlight ? color : '#1e3448'}
                size={highlight ? 8 : 6}
                height={highlight ? 6 : 4}
              />
            );
          })}
        </g>

        {/*
          Port pieces + connecting lines — faster CCW circular rotation.
          Each line starts at the rotation center (CX, CY), so it always
          anchors at the platform center and the far end orbits with the port.
        */}
        <g ref={portsRef}>
          {BASE_PORTS.map(({ x, y }, i) => {
            const active = i === mode;
            return (
              <g key={i} opacity={active ? 1 : 0.35}>
                {/* Connecting line — anchored at rotation center */}
                <line
                  x1={CX} y1={CY}
                  x2={x}  y2={y}
                  stroke={active ? color : '#3a5872'}
                  strokeWidth={active ? 2.5 : 1}
                />
                {/* Animated signal on active channel */}
                {active && (
                  <line
                    className="bridge-current"
                    x1={CX} y1={CY}
                    x2={x}  y2={y}
                    stroke="white"
                    strokeWidth="2.5"
                    strokeDasharray="4 40"
                  />
                )}
                {/* Port tetromino */}
                {PIECES[PORT_NAMES[i]].rotations[0].map(([cx, cy], j) => (
                  <IsoBlock key={j}
                    x={x + (cx - cy) * 13}
                    y={y + (cx + cy) * 6}
                    color={active ? color : '#3a5872'}
                  />
                ))}
              </g>
            );
          })}
        </g>

        {/* Mode-change pulse ring — re-triggered from useEffect */}
        <circle
          ref={pulseRef}
          cx={CX} cy={CY} r="20"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Center platform (hexagonal shell) — always fixed */}
        <path d="M229 148 300 115 371 148V176L300 213 229 176Z" fill="#071221" stroke={color} strokeOpacity=".7" />
        <path d="M229 148 300 185 371 148M300 185V213" stroke={color} strokeOpacity=".4" fill="none" />

        {/* Center T-piece — fixed, color + rotation follow active mode */}
        <g className="bridge-core" key={mode}>
          {PIECES.T.rotations[mode].map(([x, y], i) => (
            <IsoBlock key={i}
              x={CX + (x - y) * 22}
              y={119 + (x + y) * 11}
              size={21} height={22}
              color={color}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
