"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { sfx } from "../tetris/audio";
import { readStoredNumber, writeStoredNumber } from "@/lib/storage";
import type { PieceName } from "../tetris/types";
import { STAGES } from "./progress";
import { holdProject, releaseHold } from "./hold";
import {
  LANDING_EPSILON,
  LANDING_SELECTOR,
  currentLanding,
  landingTarget,
  shortLabel,
} from "./landings";

/**
 * The page answers to Tetris controls: the arrows step the piece between
 * rows, space hard-drops to the next unread stage, C holds a project.
 *
 * Two rules keep this from being hostile. Nothing is intercepted while you
 * are typing, activating a control, or holding a modifier · and when a key
 * would move off the end of the board the browser keeps it, so plain
 * scrolling still works everywhere the game has nothing to say.
 */

const MUTE_KEY = "cr-tetris-muted";
const SEEN_KEY = "cr-controls-seen";
const NOTE_MS = 1600;
/** One move per press: long enough that key-repeat cannot stack scrolls. */
const COOLDOWN_MS = 220;

type Move = { key: number; text: string };

const KEYS: { keys: string; action: string }[] = [
  { keys: "↓ / ↑", action: "SOFT DROP · step a row" },
  { keys: "← / →", action: "SHIFT · previous / next project" },
  { keys: "SPACE", action: "HARD DROP · next unread stage" },
  { keys: "C", action: "HOLD · park the project you are on" },
  { keys: "ESC", action: "RELEASE the hold slot" },
  { keys: "?", action: "THESE CONTROLS" },
];

/** The hint is for first-time visitors only, so the tab reads localStorage live. */
function subscribeSeen(onChange: () => void) {
  window.addEventListener(`${SEEN_KEY}-updated`, onChange);
  return () => window.removeEventListener(`${SEEN_KEY}-updated`, onChange);
}

/** Once someone has taken the controls, stop nudging them · written once. */
function markSeen(): void {
  if (!readStoredNumber(SEEN_KEY, 0)) writeStoredNumber(SEEN_KEY, 1);
}

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True while the keystroke belongs to a text field or an actual control. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return /^(input|textarea|select)$/i.test(target.tagName);
}

function isControl(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && !!target.closest("button, a, summary, [role=button]");
}

/**
 * The bonus round owns the same keys. While the cabinet has focus the arrows
 * drive the piece on its board, not the piece the page is made of.
 */
function inGame(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && !!target.closest("#play");
}

function rows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(LANDING_SELECTOR));
}

/**
 * Each row's top edge, measured from where scrolling to it would leave it ·
 * the page's scroll padding plus the row's own scroll margin. Measuring
 * against the real rest position is what stops a press from re-targeting the
 * row it just landed on.
 */
function offsetsOf(nodes: readonly HTMLElement[]): number[] {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return nodes.map(
    (node) =>
      node.getBoundingClientRect().top -
      padding -
      (parseFloat(getComputedStyle(node).scrollMarginTop) || 0),
  );
}

/** True when the page has nothing left to give in that direction. */
function atEdge(direction: 1 | -1): boolean {
  if (direction === -1) return window.scrollY <= 0;
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
}

function labelOf(node: HTMLElement): string {
  const heading = node.querySelector<HTMLElement>("h1, h2, h3");
  // innerText, so a heading broken over a <br> does not run its words together.
  const text = heading ? heading.innerText || heading.textContent : node.id;
  return shortLabel(text ?? "").toUpperCase() || "SECTION";
}

function land(node: HTMLElement): void {
  // Focus first, so a screen reader and the Tab order both follow the piece.
  if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
  node.focus({ preventScroll: true });
  node.scrollIntoView({ behavior: reduced() ? "instant" : "smooth", block: "start" });
}

export function Controls() {
  const [open, setOpen] = useState(false);
  const [move, setMove] = useState<Move | null>(null);
  const seen = useSyncExternalStore(
    subscribeSeen,
    () => readStoredNumber(SEEN_KEY, 0),
    () => 1,
  );
  const counter = useRef(0);
  const noteTimer = useRef(0);
  const closer = useRef<HTMLButtonElement>(null);

  const note = useCallback((text: string) => {
    counter.current += 1;
    setMove({ key: counter.current, text });
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setMove(null), NOTE_MS);
  }, []);

  useEffect(() => {
    if (open) closer.current?.focus();
  }, [open]);

  useEffect(() => {
    let lastMove = 0;
    const muted = () => readStoredNumber(MUTE_KEY, 0) === 1;

    const play = (sound: "move" | "softStep" | "hardDrop" | "hold") => {
      sfx.unlock();
      if (!muted()) sfx[sound]();
    };

    /** Step one row; returns false when the board ends and the browser should scroll. */
    const step = (direction: 1 | -1): boolean => {
      if (atEdge(direction)) return false;
      const nodes = rows();
      const index = landingTarget(offsetsOf(nodes), direction);
      if (index === null) return false;
      land(nodes[index]);
      play("softStep");
      note(`${direction === 1 ? "DROP" : "LIFT"} · ${labelOf(nodes[index])}`);
      return true;
    };

    /** Slide sideways through the stack, the way a piece moves before it locks. */
    const shift = (direction: 1 | -1): boolean => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".project-card"));
      if (!cards.length || atEdge(direction)) return false;
      const offsets = offsetsOf(cards);
      // Approaching the stack, the first press enters it instead of skipping one.
      const approaching = offsets[0] > LANDING_EPSILON;
      const past = offsets[offsets.length - 1] < -LANDING_EPSILON;
      // Two cards share a grid row and so share an offset · follow the focused
      // one when there is one, or the stack would skip its neighbour.
      const focused = cards.indexOf(document.activeElement as HTMLElement);
      const from = focused >= 0 ? focused : currentLanding(offsets);
      const target = approaching
        ? direction === 1
          ? 0
          : -1
        : past
          ? direction === 1
            ? cards.length
            : cards.length - 1
          : from + direction;
      if (target < 0 || target >= cards.length) return false;
      land(cards[target]);
      play("move");
      note(`SHIFT · ${labelOf(cards[target])}`);
      return true;
    };

    /** Hard drop: slam to the next stage that has not been read to the end. */
    const drop = (): boolean => {
      if (atEdge(1)) return false;
      const sections = STAGES.map((stage) => document.getElementById(stage.id)).filter(
        (node): node is HTMLElement => !!node,
      );
      const offsets = offsetsOf(sections);
      const index = landingTarget(offsets, 1);
      if (index === null) return false;
      land(sections[index]);
      play("hardDrop");
      note(`HARD DROP · ${labelOf(sections[index])}`);
      return true;
    };

    /** Hold whatever project the line is sitting on. */
    const hold = (): boolean => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".project-card"));
      const offsets = offsetsOf(cards);
      // The project you stepped onto, or failing that whichever one is on
      // screen and closest to resting · never one you have scrolled past.
      let chosen = cards.indexOf(document.activeElement as HTMLElement);
      if (chosen < 0) {
        let nearest = Infinity;
        cards.forEach((node, index) => {
          const box = node.getBoundingClientRect();
          if (box.bottom <= 0 || box.top >= window.innerHeight) return;
          if (Math.abs(offsets[index]) >= nearest) return;
          nearest = Math.abs(offsets[index]);
          chosen = index;
        });
      }
      const card = chosen >= 0 ? cards[chosen] : null;
      const piece = card?.dataset.piece as PieceName | undefined;
      if (!card?.id || !piece) {
        note("NOTHING TO HOLD · SCROLL TO A PROJECT");
        return true;
      }
      holdProject({ id: card.id, title: card.dataset.title ?? labelOf(card), piece });
      play("hold");
      note(`HOLD · ${labelOf(card)}`);
      return true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || inGame(event.target)) return;

      if (event.key === "?") {
        event.preventDefault();
        setOpen((current) => !current);
        markSeen();
        play("move");
        return;
      }
      if (event.key === "Escape") {
        if (open) setOpen(false);
        else releaseHold();
        return;
      }
      if (event.shiftKey) return;
      // Space and letters belong to a focused button or link before they belong here.
      if (!event.key.startsWith("Arrow") && isControl(event.target)) return;
      // A held-down key should not queue a dozen smooth scrolls on top of each other.
      if (Date.now() - lastMove < COOLDOWN_MS) {
        if (event.key.startsWith("Arrow") || event.key === " ") event.preventDefault();
        return;
      }

      let handled = false;
      switch (event.key) {
        case "ArrowDown":
          handled = step(1);
          break;
        case "ArrowUp":
          handled = step(-1);
          break;
        case "ArrowRight":
          handled = shift(1);
          break;
        case "ArrowLeft":
          handled = shift(-1);
          break;
        case " ":
          handled = drop();
          break;
        case "c":
        case "C":
          handled = hold();
          break;
        default:
          return;
      }
      if (handled) {
        event.preventDefault();
        lastMove = Date.now();
        markSeen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [note, open]);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  return (
    <>
      <p className="sr-only" role="status">
        {move?.text ?? ""}
      </p>

      {move && (
        <span className="arcade-move" key={move.key} aria-hidden="true">
          {move.text}
        </span>
      )}

      <button
        className={`controls-hint ${seen ? "" : "is-new"}`}
        type="button"
        onClick={() => {
          sfx.unlock();
          setOpen(true);
          markSeen();
        }}
        aria-haspopup="dialog"
      >
        <b>?</b>
        <span className="pixel-label">TAKE THE CONTROLS</span>
      </button>

      {open && (
        <div className="controls-sheet" role="dialog" aria-modal="false" aria-label="Keyboard controls">
          <div className="controls-card">
            <span className="pixel-label accent-cyan">PLAYER 1 · CONTROLS</span>
            <p>The page is the board. Drive it the way you would drive a piece.</p>
            <dl>
              {KEYS.map((row) => (
                <div key={row.keys}>
                  <dt>{row.keys}</dt>
                  <dd>{row.action}</dd>
                </div>
              ))}
            </dl>
            <button ref={closer} type="button" onClick={() => setOpen(false)}>
              GOT IT ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
