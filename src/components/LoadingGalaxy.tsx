"use client";

import { useEffect, useState } from "react";
import { IsoBlock } from "./hero/IsoBlock";
import { PIECES } from "./tetris/types";

const pieces = [
  { name: "I" as const, x: 16, y: 31, hue: "#c9a56e" },
  { name: "O" as const, x: 68, y: 18, hue: "#e9dfcc" },
  { name: "L" as const, x: 78, y: 58, hue: "#ffd166" },
  { name: "S" as const, x: 24, y: 66, hue: "#7e8fff" },
  { name: "T" as const, x: 50, y: 47, hue: "#56e4ff" },
];

export function LoadingGalaxy() {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("systris-intro-seen") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const show = requestAnimationFrame(() => { sessionStorage.setItem("systris-intro-seen", "1"); setActive(true); });
    const fade = window.setTimeout(() => setLeaving(true), 3550);
    const hide = window.setTimeout(() => setActive(false), 4300);
    return () => { cancelAnimationFrame(show); clearTimeout(fade); clearTimeout(hide); };
  }, []);
  if (!active) return null;
  return <div className={`loading-galaxy ${leaving ? "is-leaving" : ""}`} aria-label="Entering Charan's Tetris space" role="status">
    <div className="loading-field" aria-hidden="true">
      <div className="loading-rings" />
      <div className="loading-nebula" />
      {Array.from({ length: 34 }, (_, i) => <i key={i} className="loading-speck" style={{ left: `${(i * 47 + 17) % 98}%`, top: `${(i * 73 + 11) % 94}%`, animationDelay: `${i * -.13}s` }} />)}
      {pieces.map(({ name, x, y, hue }, i) => <svg key={name} className="loading-piece" viewBox="0 0 180 120" style={{ left: `${x}%`, top: `${y}%`, color: hue, animationDelay: `${.4 + i * .18}s` }}><g>{PIECES[name].rotations[0].map(([px,py], n) => <IsoBlock key={n} x={90 + (px - py) * 19} y={56 + (px + py) * 10} size={17} height={16} color={hue}/>)}</g></svg>)}
      <div className="loading-core">✦</div>
    </div>
    <div className="loading-copy"><span>SYSTRIS / ENTERING THE WORK</span><strong>Find where the pieces connect.</strong><i /></div>
    <button className="loading-skip" type="button" onClick={() => setLeaving(true)}>SKIP INTRO ↗</button>
  </div>;
}
