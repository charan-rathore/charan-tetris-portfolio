"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const began = useRef(0);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const onPrompt = (event: Event) => { const message = (event as CustomEvent).detail; if (typeof message !== "string" || !messageRef.current) return; if (!messageRef.current.value.trim()) messageRef.current.value = message; messageRef.current.focus({preventScroll:true}); };
    window.addEventListener("contact-prompt",onPrompt);return () => window.removeEventListener("contact-prompt",onPrompt);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    setPending(true); setStatus("Sending your message…");
    const body = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, elapsed: Date.now()-began.current }), signal: AbortSignal.timeout(15_000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your message could not be sent. Please try again.");
      setStatus("Message accepted for delivery. Thank you — Charan can reply directly to your email.");
      form.reset(); began.current = 0;
    } catch (error) { setStatus(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The connection timed out. Your message is still here; please retry."); }
    finally { setPending(false); }
  }
  return <form className="contact-form" onSubmit={submit} onFocus={() => { if (!began.current) began.current = Date.now(); }}>
    <div className="contact-form-heading"><span className="pixel-label accent-cyan">PLAYER 2 · JOIN THE CONVERSATION</span><span aria-hidden="true">▟ ▙ ▟</span></div>
    <div className="contact-fields"><label>Username / name<input name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="What should I call you?" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label></div>
    <label>Your message<textarea ref={messageRef} name="message" required minLength={10} maxLength={5000} rows={4} placeholder="An idea, a question, or the next thing we could build…" /></label>
    <label className="contact-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="contact-form-bottom"><span>Delivered privately to Charan. Your email is used to reply.</span><button className="btn-primary" type="submit" disabled={pending}>{pending ? "SENDING…" : "SEND MESSAGE ↗"}</button></div>
    <p className="contact-form-status" role="status" aria-live="polite">{status}</p>
  </form>;
}
