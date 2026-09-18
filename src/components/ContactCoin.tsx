"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "./tetris/audio";

/**
 * The arcade credit loop.
 *
 * One credit buys one conversation. The coin arcs into the Gmail slot; if mail
 * isn't how you want to talk, the machine passes the credit to the message box
 * instead. Walk away from both and the coin drops back into the tray, so the
 * whole move can be played again.
 */
type Phase = "idle" | "drop" | "slotted" | "handoff" | "held" | "return";

const DROP_MS = 860;
/** How long the mail slot stays the offer before the form takes over. */
const MAIL_GRACE_MS = 1500;
const RETURN_MS = 760;
const TRAIL_MS = 700;

const STATUS: Record<Phase, string> = {
  idle: "1 CREDIT IN THE TRAY",
  drop: "CREDIT DROPPING…",
  slotted: "MAIL SLOT ARMED · GMAIL IS OPEN",
  handoff: "NOT A MAIL PERSON? THE MESSAGE BOX IS YOURS",
  held: "CREDIT IN PLAY · FINISH YOUR MESSAGE",
  return: "CREDIT RETURNED · INSERT AGAIN ANY TIME",
};

const DRAFT_FIELDS = ["name", "email", "message"];

function instant(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function centre(node: Element): { x: number; y: number } {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

type Trail = { x: number; y: number; dx: number; dy: number };

export function ContactCoin() {
  const coin = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [trail, setTrail] = useState<Trail | null>(null);
  const live = useRef<Phase>("idle");
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  }, []);

  const go = useCallback((next: Phase) => {
    live.current = next;
    setPhase(next);
  }, []);

  const host = useCallback(
    () => coin.current?.closest("section") ?? null,
    [],
  );
  const slot = useCallback(
    () => host()?.querySelector<HTMLElement>(".contact-gmail-icon") ?? null,
    [host],
  );
  const messageBox = useCallback(
    () =>
      host()?.querySelector<HTMLTextAreaElement>(
        ".contact-form textarea[name=message]",
      ) ?? null,
    [host],
  );

  /** A started draft means the credit is being spent; nothing to refund. */
  const drafting = useCallback(() => {
    const form = host()?.querySelector<HTMLFormElement>(".contact-form");
    if (!form) return false;
    return DRAFT_FIELDS.some((name) => {
      const field = form.elements.namedItem(name);
      return (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      )
        ? field.value.trim().length > 0
        : false;
    });
  }, [host]);

  const refund = useCallback(() => {
    if (live.current === "idle" || live.current === "drop") return;
    clear();
    setTrail(null);
    sfx.coinReturn();
    go("return");
    later(instant() ? 0 : RETURN_MS, () => go("idle"));
  }, [clear, go, later]);

  /** Hand the credit to the message box and put the caret where it belongs. */
  const handoff = useCallback(() => {
    if (live.current !== "slotted") return;
    const box = messageBox();
    const mail = slot();
    if (!box) return;
    go("handoff");
    sfx.ui();
    if (mail && !instant()) {
      const from = centre(mail);
      const to = centre(box);
      setTrail({ x: from.x, y: from.y, dx: to.x - from.x, dy: to.y - from.y });
      later(TRAIL_MS, () => setTrail(null));
    }
    box.scrollIntoView({
      block: "center",
      behavior: instant() ? "instant" : "smooth",
    });
    later(instant() ? 0 : 430, () => box.focus({ preventScroll: true }));
  }, [go, later, messageBox, slot]);

  function insert() {
    if (live.current !== "idle" && live.current !== "return") return;
    clear();
    sfx.unlock();
    sfx.coin();

    const scene = coin.current?.querySelector(".coin-scene");
    const mail = slot();
    if (scene && mail && coin.current) {
      const from = centre(scene);
      const to = centre(mail);
      coin.current.style.setProperty("--coin-dx", `${Math.round(to.x - from.x)}px`);
      coin.current.style.setProperty("--coin-dy", `${Math.round(to.y - from.y)}px`);
    }

    go("drop");
    later(instant() ? 0 : DROP_MS, () => {
      go("slotted");
      sfx.lock();
      later(MAIL_GRACE_MS, handoff);
    });
  }

  /** Mirror the phase onto the section so the slot and form can respond. */
  useEffect(() => {
    const section = host();
    if (!section) return;
    section.dataset.coin = phase;
  }, [host, phase]);

  useEffect(() => clear, [clear]);

  useEffect(() => {
    const spent = () => live.current === "slotted" || live.current === "handoff" || live.current === "held";

    const onPointerDown = (event: Event) => {
      if (!spent() || drafting()) return;
      const target = event.target as Element | null;
      if (
        target?.closest(".contact-coin-bay, .contact-layout, .contact-gmail-icon")
      )
        return;
      refund();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && spent() && !drafting()) refund();
    };
    const onInput = (event: Event) => {
      if (!spent()) return;
      if (!(event.target as Element | null)?.closest(".contact-form")) return;
      if (drafting()) {
        clear();
        go("held");
      } else if (live.current === "held") {
        go("handoff");
      }
    };
    const onMail = () => {
      if (!spent()) return;
      clear();
      go("held");
    };

    const mail = slot();
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("input", onInput, true);
    mail?.addEventListener("click", onMail);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("input", onInput, true);
      mail?.removeEventListener("click", onMail);
    };
  }, [clear, drafting, go, refund, slot]);

  const inMachine = phase === "slotted" || phase === "handoff" || phase === "held";

  return (
    <div className="contact-coin-bay">
      <button
        ref={coin}
        className={`contact-coin is-${phase}`}
        type="button"
        onClick={insert}
        disabled={inMachine}
        aria-label={
          inMachine
            ? "Credit inserted. Use the coin return to play again."
            : "Insert coin and start a message"
        }
      >
        <span className="coin-scene" aria-hidden="true">
          <span className="coin-object ambient-motion">
            <span className="coin-front">
              CR<span>1 GOOD IDEA</span>
            </span>
            <span className="coin-back">↗</span>
            {Array.from({ length: 8 }, (_, i) => (
              <i
                key={i}
                className="coin-rim"
                style={{ transform: `translateZ(${i - 4}px)` }}
              />
            ))}
          </span>
        </span>
        <span className="pixel-label" aria-hidden="true">
          {inMachine ? "CREDIT INSERTED ✓" : "INSERT COIN ↓"}
        </span>
      </button>

      <p className="coin-status" role="status">
        {STATUS[phase]}
      </p>

      {inMachine && (
        <button className="coin-return" type="button" onClick={refund}>
          ↺ COIN RETURN
        </button>
      )}

      {trail && (
        <span
          className="coin-trail"
          aria-hidden="true"
          style={
            {
              left: trail.x,
              top: trail.y,
              "--trail-dx": `${trail.dx}px`,
              "--trail-dy": `${trail.dy}px`,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: 4 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </span>
      )}
    </div>
  );
}
