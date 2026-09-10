"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const BridgeScene = dynamic(() => import("./BridgeScene").then(m => m.BridgeScene), { ssr: false });

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
      <div className="mcp-bridge"><BridgeScene color={active.color} mode={channel} /><div className="bridge-labels"><span>CHARAN</span><span>CONTEXT FITS HERE</span><span>THE WORLD</span></div>
      <svg className="mcp-diagram" viewBox="0 0 600 300" role="img" aria-label={`${active.input} connects through Charan to ${active.output}`}>
        <defs>
          <pattern id="mcp-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#30394e" /></pattern>
        </defs>
        <rect width="600" height="300" fill="url(#mcp-grid)" />
        <g fill="none" stroke="#30394e" strokeWidth="2"><path d="M60 90 H170 V150 H254 M60 210 H170 V150 M346 150 H420 V70 H546 M420 150 H546 M420 150 V230 H546" /></g>
        <path className="mcp-signal-line" d={channel === 0 ? "M60 90 H170 V150 H420 V70 H546" : channel === 1 ? "M60 210 H170 V150 H546" : "M60 90 H170 V150 H420 V230 H546"} fill="none" stroke="var(--signal)" strokeWidth="2" />
        <g className="mcp-port"><rect x="254" y="104" width="92" height="92" rx="20" fill="#101622" stroke="var(--signal)" /><path d="M281 135 H319 V147 H307 V171 H293 V147 H281 Z" fill="var(--signal)" /></g>
        <g fill="#07090f" stroke="#58647b" strokeWidth="2"><rect x="40" y="72" width="36" height="36" rx="5" /><rect x="40" y="192" width="36" height="36" rx="5" /><circle cx="548" cy="70" r="18" /><circle cx="548" cy="150" r="18" /><circle cx="548" cy="230" r="18" /></g>
        <g fill="var(--signal)"><rect x="50" y="82" width="16" height="16" rx="2" /><rect x="50" y="202" width="16" height="16" rx="2" /><circle cx="548" cy={70 + channel * 80} r="7" /></g>
        <g fill="#a9b3c6" fontSize="11" fontFamily="monospace"><text x="25" y="48">CHARAN</text><text x="273" y="228">CONTEXT</text><text x="511" y="32">THE WORLD</text><text x="474" y="105">SYSTEMS</text><text x="462" y="185">DECISIONS</text><text x="432" y="265">CONVERSATIONS</text></g>
      </svg></div>
      <div className="mcp-output" aria-live="polite" aria-atomic="true">
        <span>{active.input} <i aria-hidden="true">→</i> {active.output}</span>
        <p>{active.detail}</p>
        <a href={`#${active.target}`}>{active.cta} <span aria-hidden="true">↗</span></a>
      </div>
      <div className="mcp-console-foot"><span>01 HUMAN · EVERY PIECE HAS A PLACE</span><span>TRY A CONNECTION ↑</span></div>
    </div>
  );
}
