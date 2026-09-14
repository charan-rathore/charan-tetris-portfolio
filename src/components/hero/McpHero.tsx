"use client";

import { useState } from "react";
import { BridgeScene } from "./BridgeScene";

const channels = [
  { name: "BUILD", color: "#00e0ff", input: "An idea", output: "A working system", detail: "RAG, memory, and tools that carry their evidence with them.", target: "work", cta: "EXPLORE THE SYSTEMS" },
  { name: "ANALYZE", color: "#ffd500", input: "A question", output: "A clearer decision", detail: "Analyst at MiQ, working across MENA markets.", target: "about", cta: "FOLLOW THE JOURNEY" },
  { name: "CONNECT", color: "#b968ff", input: "Your curiosity", output: "A conversation", detail: "A good connection is where the next interesting thing starts.", target: "contact", cta: "SAY HELLO" },
];

export function McpHero() {
  const [channel, setChannel] = useState(0);
  const active = channels[channel];
  return (
    <div className="mcp-console" style={{ "--signal": active.color } as React.CSSProperties}>
      <div className="mcp-console-top"><span className="pixel-label">THE HUMAN INTERFACE</span><span><i /> PIECES CONNECTED</span></div>
      <div className="mcp-channel-tabs" role="group" aria-label="Explore a connection">
        {channels.map((item, i) => <button key={item.name} aria-pressed={i === channel} onClick={() => setChannel(i)}>{item.name}</button>)}
      </div>
      <div className="mcp-bridge"><BridgeScene color={active.color} mode={channel} /></div>
      <div className="mcp-output" aria-live="polite" aria-atomic="true">
        <span>{active.input} <i aria-hidden="true">→</i> {active.output}</span>
        <p>{active.detail}</p>
        <a href={`#${active.target}`}>{active.cta} <span aria-hidden="true">↗</span></a>
      </div>
      <div className="mcp-console-foot"><span>01 HUMAN · EVERY PIECE HAS A PLACE</span><span>TRY A CONNECTION ↑</span></div>
    </div>
  );
}
