"use client";
import { BridgeScene } from "./BridgeScene";

export function McpHero() {
  return <div className="mcp-console">
    <div className="mcp-console-top"><span className="pixel-label">THE HUMAN INTERFACE</span><span><i /> A CONNECTED BODY OF WORK</span></div>
    <div className="mcp-bridge"><BridgeScene color="#00e0ff" mode={0} /><a className="bridge-core-action" href="https://github.com/charan-rathore" target="_blank" rel="noreferrer" aria-label="Open Charan's GitHub profile"><span className="sr-only">Open Charan&apos;s GitHub profile</span></a></div>
    <div className="mcp-output"><span>FROM EVIDENCE TO SYSTEMS</span><p>Follow the connections around the GitHub block, then trace a project from question to evidence below.</p><a href="#context">TRACE THE WORK ↗</a></div>
    <div className="mcp-console-foot"><span>RAG · MEMORY · EVALUATION · INFERENCE</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB PROFILE ↗</a></div>
  </div>;
}
