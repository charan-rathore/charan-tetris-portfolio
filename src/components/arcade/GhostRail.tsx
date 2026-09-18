"use client";

import { useEffect, useRef, useState } from "react";
import { PIECES } from "../tetris/types";
import { sfx } from "../tetris/audio";
import { STAGES, useClearedStages } from "./progress";
import { type Band, bandAt, bandsOf, depthOf, ghostOf } from "./well";

/**
 * The page seen edgewise, as the well it is: a track down the left margin
 * with the reader's piece on it and a ghost outline resting on the stage
 * below · the same preview the game draws under a falling piece.
 *
 * Each band is a stage, and cleared ones fill with their piece colour, so
 * the rail doubles as a record of how much of the board has come down.
 *
 * Scrolling paints CSS variables straight onto the track rather than going
 * back through React · this runs on every scroll frame, and a re-render per
 * frame is a cost the page should not pay to move two markers.
 */

function measure(): Band[] {
  const measured = STAGES.flatMap((stage) => {
    const node = document.getElementById(stage.id);
    if (!node) return [];
    const box = node.getBoundingClientRect();
    return [{ id: stage.id, label: stage.label, top: box.top + window.scrollY, height: box.height }];
  });
  return bandsOf(measured, window.innerHeight, document.documentElement.scrollHeight);
}

function pieceOf(id: string) {
  return STAGES.find((stage) => stage.id === id)?.piece ?? "T";
}

function sameBands(a: readonly Band[], b: readonly Band[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (band, index) =>
        band.id === b[index].id &&
        band.start === b[index].start &&
        band.end === b[index].end,
    )
  );
}

export function GhostRail() {
  const [bands, setBands] = useState<Band[]>([]);
  const [here, setHere] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const cleared = useClearedStages();

  // The page changes height as artwork loads and drawers open, so the bands
  // are measured from the page itself rather than assumed once.
  useEffect(() => {
    const remeasure = () => {
      const next = measure();
      setBands((current) => (sameBands(current, next) ? current : next));
    };
    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = track.current;
    if (!node || !bands.length) return;
    const paint = () => {
      const depth = depthOf(
        window.scrollY,
        window.innerHeight,
        document.documentElement.scrollHeight,
      );
      node.style.setProperty("--depth", String(depth));
      node.style.setProperty("--ghost", String(ghostOf(bands, depth)));
      if (readout.current) readout.current.textContent = String(Math.round(depth * 100));
      // Which band is lit changes a handful of times per page, so React can
      // own it · only the two markers are cheap enough to move every frame.
      const next = bandAt(bands, depth);
      setHere((current) => (current === next ? current : next));
    };
    paint();
    window.addEventListener("scroll", paint, { passive: true });
    return () => window.removeEventListener("scroll", paint);
  }, [bands]);

  if (!bands.length) return null;

  return (
    <aside className="ghost-rail" aria-hidden="true">
      <span className="pixel-label ghost-cap">WELL</span>
      <div className="ghost-track" ref={track}>
        {bands.map((band, index) => (
          <button
            key={band.id}
            type="button"
            tabIndex={-1}
            className={`ghost-band ${cleared.includes(band.id) ? "is-cleared" : ""} ${
              index === here ? "is-here" : ""
            }`}
            style={{
              top: `${band.start * 100}%`,
              height: `${Math.max(band.end - band.start, 0.02) * 100}%`,
              ["--piece" as string]: PIECES[pieceOf(band.id)].color,
            }}
            onClick={() => {
              sfx.unlock();
              sfx.ui();
              document.getElementById(band.id)?.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              });
            }}
            title={band.label}
          >
            <em>{band.label}</em>
          </button>
        ))}
        <i className="ghost-drop" />
        <i className="ghost-piece" />
      </div>
      {/* Left empty so React never owns the text the scroll handler writes. */}
      <span className="ghost-depth" ref={readout} />
    </aside>
  );
}
