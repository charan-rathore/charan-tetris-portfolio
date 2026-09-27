"use client";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { knowledgeEdges, knowledgeDetails, traceFrom } from "../../data/galaxy-knowledge";
import { galaxyNodes } from "../../data/galaxy";
import { GitHubPulse } from "../GitHubPulse";
import { GalaxySpace } from "./GalaxySpace";
import "./galaxy.css";
import "./electric-graph.css";

const byId = new Map(galaxyNodes.map(n => [n.id, n]));
export function GalaxyAtlas({ initialFocus }: { initialFocus: string }) {
  const [focus,setFocus]=useState(initialFocus);
  const [run,setRun]=useState(0);
  const [motion,setMotion]=useState(true);
  const [speed,setSpeed]=useState(1);
  const [glow,setGlow]=useState(3);
  const [orbits,setOrbits]=useState(true);
  const node=focus ? byId.get(focus) : undefined;
  const trace=useMemo(()=>focus ? traceFrom(focus) : null,[focus]);
  function select(id:string){setFocus(id);setRun(r=>r+1);history.replaceState(null,"",`/galaxy?focus=${encodeURIComponent(id)}`)}
  function clear(){setFocus("");history.replaceState(null,"","/galaxy") }
  return <main className={`galaxy-page electric-galaxy ${motion ? "" : "galaxy-paused"}`}>
    <header className="galaxy-header"><Link href="/" className="galaxy-home">← SYSTRIS</Link><span>CHARAN RATHORE / THE WORK GALAXY</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB ↗</a></header>
    <div className="electric-head"><span className="galaxy-kicker">THE WORK / CONNECTED</span><h1>Find the thread.</h1><p className="electric-instruction">Pick a quiet star. Watch the closest ideas connect, then read why each path exists.</p><div className="electric-tuning"><span>DRAG TO ORBIT · SCROLL TO ZOOM</span><button type="button" aria-pressed={!motion} onClick={()=>setMotion(!motion)}>{motion ? "Ⅱ PAUSE" : "▷ PLAY"}</button><label>SPEED <input aria-label="Orbit speed" type="range" min="0" max="3" step=".25" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label><label>GLOW <input aria-label="Star glow" type="range" min="0" max="5" value={glow} onChange={e=>setGlow(+e.target.value)}/></label><label><input type="checkbox" checked={orbits} onChange={e=>setOrbits(e.target.checked)}/> ORBITS</label></div></div>
    <section className="electric-stage" aria-label="Navigable graph of Charan's projects and their connected parts">
      <div className="galaxy-map electric-map" style={{"--signal":node?.color??"#d6e2d6"} as CSSProperties}>
        <GalaxySpace speed={speed} glow={glow} orbits={orbits} paused={!motion} focus={focus}/>
        <svg className="electric-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g className="electric-orbits" fill="none"><ellipse cx="51" cy="50" rx="23" ry="17" transform="rotate(-18 51 50)"/><ellipse cx="51" cy="50" rx="39" ry="34" transform="rotate(17 51 50)"/><ellipse cx="51" cy="50" rx="48" ry="44" transform="rotate(-10 51 50)"/></g>
          {knowledgeEdges.map(e=>{const p=byId.get(e.from)!,q=byId.get(e.to)!;const delay=trace?.segments.get([e.from,e.to].sort().join("|"));return <g key={e.from+e.to} className={delay===undefined?"electric-muted":"electric-fired"} style={{"--step":`${(delay??0)*.8}s`} as CSSProperties}><path d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>{delay!==undefined&&<path key={run} className="electric-discovery" d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>}</g>})}
          {node&&["idea","method"].map((kind,j)=>{const x=Math.max(8,Math.min(92,node.x+(j?8:-8))),y=Math.max(9,Math.min(91,node.y+(j?7:-7)));return <g key={kind} className="electric-fired" style={{"--step":`${.3+j*.45}s`} as CSSProperties}><path d={`M${node.x} ${node.y} L${x} ${y}`} pathLength="100"/><path key={run} className="electric-discovery" d={`M${node.x} ${node.y} L${x} ${y}`} pathLength="100"/></g>})}
        </svg>
        {node&&["idea","method"].map((kind,j)=><span key={kind} className="electric-fact" style={{left:`${Math.max(8,Math.min(92,node.x+(j?8:-8)))}%`,top:`${Math.max(9,Math.min(91,node.y+(j?7:-7)))}%`,"--step":`${.3+j*.45}s`} as CSSProperties}><i aria-hidden="true"/><span>{kind === "idea" ? "THE IDEA" : "THE WORK"}</span></span>)}
        {galaxyNodes.map(n=>{const reached=trace?.routes.has(n.id),step=trace?.routes.get(n.id)??0;return <button type="button" key={n.id} onClick={()=>select(n.id)} aria-pressed={focus===n.id} aria-label={`Explore ${n.label}`} title={`Explore ${n.label}`} className={`electric-node ${focus===n.id?"is-live":""} ${reached&&focus!==n.id?"is-reached":""}`} style={{left:`${n.x}%`,top:`${n.y}%`,"--step":`${step*.8}s`} as CSSProperties}><i aria-hidden="true"/><span>{n.label}</span></button>})}
        <span className="electric-map-prompt">{node ? "SELECT ANOTHER STAR TO TRACE A NEW PATH" : "✦  PICK A STAR TO REVEAL ITS CONNECTIONS"}</span>
        {node&&<div className="electric-source" key={focus}><div className="electric-source-main"><span className="electric-source-name">{node.label}</span><p>{knowledgeDetails[focus].idea}</p><p className="electric-method">{knowledgeDetails[focus].method}</p><div className="electric-relations">{knowledgeEdges.filter(e=>trace?.segments.has([e.from,e.to].sort().join("|"))).map(e=><span key={e.from+e.to}>{byId.get(e.from)?.label} <b>{e.relation}</b> {byId.get(e.to)?.label}<small>{e.why}</small></span>)}</div></div><div className="electric-source-actions"><a href={node.href} target="_blank" rel="noreferrer" aria-label={`Open source for ${node.label}`}>SOURCE ↗</a><button type="button" onClick={clear}>CLEAR ×</button></div></div>}
      </div>
    </section>
    <p className="electric-data-link">These links are curated themes, not shared code or a collaboration claim. <a href="/galaxy/graph.json">Read the graph as JSON ↗</a></p>
    <section className="galaxy-activity" id="activity"><div className="galaxy-activity-head"><span className="galaxy-kicker">PUBLIC GITHUB ACTIVITY</span><h2>The work keeps moving.</h2><p>30-day contributions, checked against GitHub when you open this page.</p></div><GitHubPulse/></section>
    <footer className="galaxy-footer"><Link href="/#context">← BACK TO THE PROJECT STORY</Link><span>CURATED FROM THE WORK. NOT A COMPLETE BIOGRAPHY.</span></footer>
  </main>;
}
