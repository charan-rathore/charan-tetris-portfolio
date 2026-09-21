"use client";
import { useEffect, useRef } from 'react';
import { PIECES } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

const CX = 300;
const CY = 162;
const PORT_R = 128;
const DOCK_R = 54; // cable leaves the platform face, never the interior
const PORT_NAMES = ['T', 'O', 'L'] as const;
const BASE_RADS = [210, 330, 90].map(d => (d * Math.PI) / 180);

/**
 * Human-interface switchboard.
 *
 * Outer marks rotate slowly on the ellipse. The three port tetrominos orbit
 * on a circle. The *active* port is joined to the platform by a short isometric
 * cable that docks at the platform face — never a line through the core.
 */
export function BridgeScene({ color, mode }: { color: string; mode: number }) {
  const orbitRef = useRef<SVGGElement>(null);
  const portsRef = useRef<SVGGElement>(null);
  const cableRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGPathElement>(null);
  const dockRef = useRef<SVGCircleElement>(null);
  const jackRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const raf = useRef({ ms: 0, last: 0, id: 0, mode: 0 });
  const prevMode = useRef(mode);

  useEffect(() => { raf.current.mode = mode; }, [mode]);

  useEffect(() => {
    const r = raf.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let running = false;

    const tick = (now: number) => {
      const dt = r.last ? Math.min(now - r.last, 100) : 0;
      r.last = now;
      r.ms += dt;

      const orbitDeg = (r.ms / 90_000) * 360 % 360;
      orbitRef.current?.setAttribute('transform', `rotate(${orbitDeg.toFixed(2)} 300 174)`);

      const portDeg = -(r.ms / 42_000) * 360 % 360;
      portsRef.current?.setAttribute('transform', `rotate(${portDeg.toFixed(2)} ${CX} ${CY})`);

      // Active satellite world position (base angle + current rotation).
      const a = BASE_RADS[r.mode] + (portDeg * Math.PI) / 180;
      const sx = CX + Math.cos(a) * PORT_R;
      const sy = CY + Math.sin(a) * PORT_R;
      const dx = sx - CX;
      const dy = sy - CY;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      // Dock sits on the platform face, toward the satellite.
      const dockX = CX + ux * DOCK_R;
      const dockY = CY + uy * DOCK_R;
      // Jack sits just short of the satellite so the cable meets the piece, not its centre.
      const jackX = CX + ux * (PORT_R - 18);
      const jackY = CY + uy * (PORT_R - 18);
      // Control point: isometric elbow, bowed slightly outward.
      const midX = (dockX + jackX) / 2;
      const midY = (dockY + jackY) / 2;
      const cpx = midX - uy * 22 + ux * 6;
      const cpy = midY + ux * 22 + uy * 6;
      const d = `M${dockX.toFixed(1)} ${dockY.toFixed(1)} Q${cpx.toFixed(1)} ${cpy.toFixed(1)} ${jackX.toFixed(1)} ${jackY.toFixed(1)}`;
      cableRef.current?.setAttribute('d', d);
      pulseRef.current?.setAttribute('d', d);
      dockRef.current?.setAttribute('cx', dockX.toFixed(1));
      dockRef.current?.setAttribute('cy', dockY.toFixed(1));
      jackRef.current?.setAttribute('cx', jackX.toFixed(1));
      jackRef.current?.setAttribute('cy', jackY.toFixed(1));

      r.id = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced.matches) return;
      running = true;
      r.last = 0;
      r.id = requestAnimationFrame(tick);
    };
    const stop = () => { running = false; cancelAnimationFrame(r.id); };

    reduced.addEventListener('change', () => (reduced.matches ? stop() : start()));
    start();
    return stop;
  }, []);

  useEffect(() => {
    if (mode === prevMode.current) return;
    prevMode.current = mode;
    const el = ringRef.current;
    if (!el) return;
    el.classList.remove('bridge-pulse-fire');
    void el.getBBox();
    el.classList.add('bridge-pulse-fire');
  }, [mode]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    let tx = 0, ty = 0, curX = 0, curY = 0, frame = 0;
    const onMove = (e: MouseEvent) => {
      const box = wrap.getBoundingClientRect();
      tx = ((e.clientX - box.left) / box.width - 0.5) * 16;
      ty = ((e.clientY - box.top) / box.height - 0.5) * 8;
    };
    const onLeave = () => { tx = 0; ty = 0; };
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
        {Array.from({ length: 42 }, (_, i) => (
          <circle key={`star-${i}`}
            cx={22 + (i * 137) % 554} cy={14 + (i * 71) % 272}
            r={i % 7 === 0 ? 1.3 : 0.65}
            fill="#b5c5e4"
            opacity={i % 3 === 0 ? 0.45 : 0.18}
          />
        ))}

        <ellipse cx="300" cy="174" rx="210" ry="91" fill="none" stroke="#283a50" strokeDasharray="2 12" />
        <ellipse cx="300" cy="174" rx="168" ry="71" fill="none" stroke={color} strokeOpacity=".12" />

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

        {/* Satellites only — cables are drawn separately so they never cut the core. */}
        <g ref={portsRef}>
          {BASE_RADS.map((a, i) => {
            const x = CX + Math.cos(a) * PORT_R;
            const y = CY + Math.sin(a) * PORT_R;
            const active = i === mode;
            return (
              <g key={i} opacity={active ? 1 : 0.28}>
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

        {/* Soft under-stroke so the cable reads as a trace, not a raw line. */}
        <path ref={cableRef} fill="none" stroke={color} strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
        <path ref={pulseRef} className="bridge-current" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="7 18" />
        <circle ref={dockRef} r="3.4" fill={color} stroke="#071221" strokeWidth="1.4" />
        <circle ref={jackRef} r="2.4" fill="#f4fbff" stroke={color} strokeWidth="1.2" />

        <circle ref={ringRef} cx={CX} cy={CY} r="20" fill="none" stroke={color} strokeWidth="2" />

        <path d="M229 148 300 115 371 148V176L300 213 229 176Z" fill="#071221" stroke={color} strokeOpacity=".7" />
        <path d="M229 148 300 185 371 148M300 185V213" stroke={color} strokeOpacity=".4" fill="none" />

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
