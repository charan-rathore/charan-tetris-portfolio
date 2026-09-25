"use client";
import { BridgeScene } from "./BridgeScene";

export function McpHero() {
  return <div className="mcp-console">
    <div className="mcp-console-top"><span className="pixel-label">THE HUMAN INTERFACE</span><span><i /> A CONNECTED BODY OF WORK</span></div>
    <div className="mcp-bridge"><BridgeScene color="#00e0ff" mode={0} /><a className="bridge-core-action" href="https://github.com/charan-rathore" target="_blank" rel="noreferrer" aria-label="Open Charan's GitHub profile">OPEN<br/>GITHUB ↗</a></div>
    <div className="mcp-output"><span>FROM EVIDENCE TO SYSTEMS</span><p>The center opens GitHub. Explore the graph to follow connections between the work.</p><a href="#context">EXPLORE THE GRAPH ↗</a></div>
    <div className="mcp-console-foot"><span>RAG · MEMORY · EVALUATION · INFERENCE</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB PROFILE ↗</a></div>
  </div>;
}
