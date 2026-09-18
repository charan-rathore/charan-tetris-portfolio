"use client";

import { useId, useState } from "react";

const stages = [
  { name: "Notice", verb: "Find the real question.", color: "#ffd56a", input: "A behavior that doesn’t make sense.",
    decision: "Start with what someone is trying to do. In seller analytics, that means following the journey before deciding what to measure.",
    tradeoff: "A clean dashboard is useful only if it changes a decision.", proof: "Read the breakdown · Substack", href: "https://substack.com/@charanrathore", piece: "01" },
  { name: "Connect", verb: "Keep the context attached.", color: "#66d9ef", input: "Scattered evidence. An answer that needs checking.",
    decision: "In IntelliRAG, bring the relevant passages into the answer and keep the citations in reach. Let people inspect what the system used.",
    tradeoff: "An honest gap in the evidence is more useful than a confident guess.", proof: "Inspect IntelliRAG", href: "https://intellirag-live-own-track.vercel.app/", piece: "02" },
  { name: "Build", verb: "Make the idea usable.", color: "#c7a0ff", input: "A system that works, but still asks too much of its user.",
    decision: "Give the next action a clear shape. This portfolio turns projects into pieces you can explore, with the code one click away.",
    tradeoff: "Play should invite curiosity. It should never be the price of seeing the work.", proof: "Explore the project stack", href: "#work", piece: "03" },
  { name: "Reconsider", verb: "Ask what would prove it wrong.", color: "#9de7b5", input: "A promising result that might not generalize.",
    decision: "Compare against a simpler baseline. Inspect the failures. Keep measured results separate from the things I still want to achieve.",
    tradeoff: "A small experiment can guide the next change; it cannot prove a universal win.", proof: "Read the experiments", href: "https://github.com/charan-rathore/IntelliRAG/tree/main/eval/repo-support", piece: "04" },
] as const;

export function WorkingSystem() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const stage = stages[selected];
  return <section className="working-system" aria-labelledby={`${id}-title`}>
    <div className="working-intro">
      <span className="pixel-label">THE HUMAN BEHIND THE SYSTEMS</span>
      <h2 id={`${id}-title`}>Curiosity in.<br />Something useful out.</h2>
      <p>Analytics taught me to look for the signal. Building makes me test whether I understood it. Here’s the loop I’m trying to get better at.</p>
      <div className="working-loop" role="group" aria-label="Explore how I work">
        {stages.map((item, i) => <button key={item.name} type="button" aria-pressed={selected === i} aria-controls={`${id}-detail`} onClick={() => setSelected(i)}>
          <span aria-hidden="true">{item.piece}</span>{item.name}<b aria-hidden="true">{i === 3 ? "↺" : "→"}</b>
        </button>)}
      </div>
    </div>
    <div className="working-detail" id={`${id}-detail`} aria-live="polite" style={{ borderColor: stage.color }}>
      <div className="working-detail-head"><span className="pixel-label" style={{ color: stage.color }}>MOVE {stage.piece} / {stage.name.toUpperCase()}</span><span className="working-piece" style={{ color: stage.color }} aria-hidden="true">▟</span></div>
      <h3>{stage.verb}</h3>
      <dl><div><dt>What comes in</dt><dd>{stage.input}</dd></div><div><dt>The choice</dt><dd>{stage.decision}</dd></div><div><dt>What I keep in mind</dt><dd>{stage.tradeoff}</dd></div></dl>
      <a href={stage.href} {...(stage.href.startsWith("https:") ? { target: "_blank", rel: "noreferrer" } : {})}>{stage.proof} ↗</a>
    </div>
  </section>;
}
