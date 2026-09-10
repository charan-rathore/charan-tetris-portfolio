"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PIECES, type PieceName } from "./tetris/types";

/** The portfolio runs itself; only the optional intel vault requires play. */
export function ProjectLevel({ index, piece, featured, children }: { index: number; piece: PieceName; featured?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLanded(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <article ref={ref} className={`project-card project-level ${featured ? "is-featured" : ""} ${landed ? "is-landed" : ""}`} style={{ "--piece": PIECES[piece].color } as CSSProperties}>
    <div className="level-header"><span className="pixel-label">LEVEL {String(index + 1).padStart(2, "0")}</span><span className="pixel-label level-state">{landed ? "PIECE LOCKED ↓" : "NEXT IN QUEUE"}</span></div>
    {children}
    <div className="level-foundation" aria-hidden="true">{Array.from({length: 20}, (_, i) => <i key={i} />)}</div>
  </article>;
}
