"use client";
import Link from "next/link";
import { BridgeScene } from "./BridgeScene";

export function McpHero() {
  return <div className="mcp-console">
    <div className="mcp-console-top"><span className="pixel-label">THE HUMAN INTERFACE</span><span><i /> A CONNECTED BODY OF WORK</span></div>
    <div className="mcp-bridge"><BridgeScene color="#00e0ff" mode={0} /><a className="bridge-core-action" href="https://github.com/charan-rathore" target="_blank" rel="noreferrer" aria-label="Open Charan's GitHub profile"><span className="sr-only">Open Charan&apos;s GitHub profile</span></a></div>
    <div className="mcp-output"><span>A MAP OF THE WORK</span><p>Pick a star to open its story. The GitHub block opens the source; the full galaxy connects the projects.</p><Link href="/galaxy">EXPLORE THE FULL GALAXY ↗</Link></div>
    <div className="mcp-console-foot"><span>RAG · MEMORY · EVALUATION · INFERENCE</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB PROFILE ↗</a></div>
  </div>;
}
