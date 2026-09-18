"use client";

import { useEffect, useState } from "react";
import { sfx } from "../tetris/audio";
import { readStoredNumber } from "@/lib/storage";
import { CLEAR_LINE, STAGES, armStage, clearStage, stageStatus } from "./progress";

/**
 * Scroll a stage past the top of the window and its bottom edge clears like a
 * completed line. Scrolling back re-arms it, so the board can be replayed.
 */

const MUTE_KEY = "cr-tetris-muted";
const FLASH_MS = 1400;

type Flash = { key: number; y: number; label: string; points: number };

export function LineClears() {
  const [flashes, setFlashes] = useState<Flash[]>([]);

  useEffect(() => {
    let key = 0;
    let gestured = false;
    let pending = 0;
    const timers: number[] = [];

    const onGesture = () => {
      gestured = true;
    };

    const check = () => {
      pending = 0;
      const doc = document.documentElement;
      const view = window.innerHeight;
      const atEnd = window.scrollY + view >= doc.scrollHeight - 4;
      for (const stage of STAGES) {
        const node = document.getElementById(stage.id);
        if (!node) continue;
        const box = node.getBoundingClientRect();
        const status = stageStatus(box.bottom, view, atEnd);
        if (status !== "cleared") {
          if (status === "armed") armStage(stage.id);
          continue;
        }
        if (!clearStage(stage.id)) continue;

        key += 1;
        const flash: Flash = {
          key,
          y: Math.min(Math.max(box.bottom, CLEAR_LINE), view - 4),
          label: stage.label,
          points: stage.points,
        };
        setFlashes((current) => [...current, flash]);
        timers.push(
          window.setTimeout(
            () => setFlashes((current) => current.filter((item) => item.key !== flash.key)),
            FLASH_MS,
          ),
        );
        // Never the first sound a visitor hears: wait for a real gesture.
        if (gestured && !readStoredNumber(MUTE_KEY, 0)) sfx.clear(1, false);
      }
    };

    // Coalesce bursts of scroll events, but always run the trailing check:
    // dropping the last event of a fling would leave the line uncleared.
    const schedule = () => {
      if (!pending) pending = window.setTimeout(check, 80);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.clearTimeout(pending);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  return (
    <div className="clear-layer" aria-hidden="true">
      {flashes.map((flash, index) => (
        <div key={flash.key}>
          <i className="clear-flash" style={{ top: flash.y }} />
          <span className="clear-toast" style={{ top: `calc(var(--header-h) + ${14 + index * 36}px)` }}>
            LINE CLEAR · {flash.label}
            <b>+{flash.points}</b>
          </span>
        </div>
      ))}
    </div>
  );
}
