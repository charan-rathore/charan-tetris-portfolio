"use client";

import { useState } from "react";
import { BridgeScene } from "./BridgeScene";

const channels = [
  { name: "Make it work", color: "#00e0ff", input: "An idea", output: "Something you can use", detail: "Open a project. Try it. Look under the hood.", target: "work", cta: "SEE WHAT I’VE BUILT" },
  { name: "Make it clear", color: "#ffd500", input: "A messy question", output: "A decision you can explain", detail: "From seller journeys at Flipkart to market context at MiQ.", target: "about", cta: "HOW I APPROACH THE WORK" },
  { name: "Make a connection", color: "#b968ff", input: "Something on your mind", output: "Let’s talk about it", detail: "A project, a question, or a good rabbit hole. I’m listening.", target: "contact", cta: "START A CONVERSATION" },
];

export function McpHero() {
  const [channel, setChannel] = useState(0);
  const active = channels[channel];
  return (
    <div className="mcp-console" style={{ "--signal": active.color } as React.CSSProperties}>
      <div className="mcp-console-top"><span className="pixel-label">THE HUMAN INTERFACE</span><span><i /> PIECES CONNECTED</span></div>
      <div className="mcp-bridge"><BridgeScene color={active.color} mode={channel} /></div>
      <div className="bridge-choices" role="group" aria-label="Explore a connection">
        {channels.map((item, i) => <button key={item.name} aria-pressed={i === channel} onClick={() => setChannel(i)} style={{'--port-color':item.color} as React.CSSProperties}><small>0{i+1}</small><span>{item.name}</span><b aria-hidden="true">↗</b></button>)}
      </div>
      <div className="mcp-output" aria-live="polite" aria-atomic="true">
        <span>{active.input} <i aria-hidden="true">→</i> {active.output}</span>
        <p>{active.detail}</p>
        <a href={`#${active.target}`}>{active.cta} <span aria-hidden="true">↗</span></a>
      </div>
      <div className="mcp-console-foot"><span>ONE PERSON. A FEW DIFFERENT SIDES.</span><span>CHOOSE YOUR WAY IN ↑</span></div>
    </div>
  );
}
