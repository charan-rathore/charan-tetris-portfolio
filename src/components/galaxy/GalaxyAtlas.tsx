"use client";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { galaxyEdges, galaxyNodes } from "../../data/galaxy";
import { GitHubPulse } from "../GitHubPulse";
import { GalaxySpace } from "./GalaxySpace";
import "./galaxy.css";
import "./electric-graph.css";

const byId = new Map(galaxyNodes.map(n => [n.id, n]));
// Each small satellite is a source-backed part of the named project, not invented work.
const details: Record<string, [string, string]> = {
  intellirag:["Async pipelines","RAGAS checks"], memorable:["Linked sources","Local memory"],
  thermosense:["Rooftop sensors","Bias tracking"], systris:["Tetris interface","Project paths"],
  evals:["RAGAS evaluation","Failure cases"], research:["Zeolite extraction","arXiv study"],
  magpie:["Model gateway","Provider routing"], copilotkit:["Agent UI","State updates"],
  openmuse:["Agent tools","Browser state"], vllm:["Model serving","Inference"],
  llama:["Local inference","Constraints"], miq:["MENA analytics","Market signals"],
  flipkart:["Seller funnel","Dashboards"],
  "project-management-tool":["Shared board","Drag and decide"],
  "agentic-finance-advisor":["Agent research","Confidence checks"],
  "drone-wildlife-detection":["Drone footage","Blackbuck detections"],
  "bolt-dataset":["CAD shapes","Dataset labels"]
};
const satellites = galaxyNodes.flatMap((n,i) => details[n.id].map((label,j) => ({
  id:`${n.id}-${j}`, parent:n.id, label,
  x:Math.max(7,Math.min(93,n.x+(j ? 7 : -7))),
  y:Math.max(6,Math.min(94,n.y+(j ? 6 : -6) + (i%2 ? 1 : -1)))
})));

export function GalaxyAtlas({ initialFocus }: { initialFocus: string }) {
  const [focus,setFocus]=useState(initialFocus);
  const [motion,setMotion]=useState(true);
  const [speed,setSpeed]=useState(1);
  const [glow,setGlow]=useState(3);
  const [orbits,setOrbits]=useState(true);
  const node=byId.get(focus) ?? galaxyNodes[0];
  const related=useMemo(()=>new Set(galaxyEdges.filter(([a,b])=>a===focus||b===focus).flat()),[focus]);
  function select(id:string){setFocus(id);history.replaceState(null,"",`/galaxy?focus=${encodeURIComponent(id)}`)}
  return <main className={`galaxy-page electric-galaxy ${motion ? "" : "galaxy-paused"}`}>
    <header className="galaxy-header"><Link href="/" className="galaxy-home">← SYSTRIS</Link><span>CHARAN RATHORE / THE WORK GALAXY</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB ↗</a></header>
    <div className="electric-head"><span className="galaxy-kicker">THE WORK / CONNECTED</span><h1>Follow the current.</h1><div className="electric-tuning"><span>DRAG TO ORBIT · SCROLL TO ZOOM</span><button type="button" aria-pressed={!motion} onClick={()=>setMotion(!motion)}>{motion ? "Ⅱ PAUSE" : "▷ PLAY"}</button><label>SPEED <input aria-label="Orbit speed" type="range" min="0" max="3" step=".25" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label><label>GLOW <input aria-label="Star glow" type="range" min="0" max="5" value={glow} onChange={e=>setGlow(+e.target.value)}/></label><label><input type="checkbox" checked={orbits} onChange={e=>setOrbits(e.target.checked)}/> ORBITS</label></div></div>
    <section className="electric-stage" aria-label="Navigable graph of Charan's projects and their connected parts">
      <div className="galaxy-map electric-map" style={{"--signal":node.color} as CSSProperties}>
        <GalaxySpace speed={speed} glow={glow} orbits={orbits} paused={!motion} focus={focus}/>
        <svg className="electric-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g className="electric-orbits" fill="none"><ellipse cx="51" cy="50" rx="23" ry="17" transform="rotate(-18 51 50)"/><ellipse cx="51" cy="50" rx="39" ry="34" transform="rotate(17 51 50)"/><ellipse cx="51" cy="50" rx="48" ry="44" transform="rotate(-10 51 50)"/></g>
          {galaxyEdges.map(([a,b])=>{const p=byId.get(a)!,q=byId.get(b)!;const lit=a===focus||b===focus;return <g key={a+b} className={lit?"electric-lit":"electric-muted"}><path d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>{lit&&<path className="electric-pulse" d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>}</g>})}
          {satellites.map(s=>{const p=byId.get(s.parent)!;const lit=s.parent===focus;return <g key={s.id} className={lit?"electric-lit":"electric-muted"}><path d={`M${p.x} ${p.y} L${s.x} ${s.y}`} pathLength="100"/>{lit&&<path className="electric-pulse" d={`M${p.x} ${p.y} L${s.x} ${s.y}`} pathLength="100"/>}</g>})}
        </svg>
        {satellites.map(s=><span key={s.id} className={`electric-detail ${s.parent===focus?"is-live":""}`} style={{left:`${s.x}%`,top:`${s.y}%`}}><i aria-hidden="true"/>{s.label}</span>)}
        {galaxyNodes.map(n=><button type="button" key={n.id} onClick={()=>select(n.id)} aria-pressed={focus===n.id} aria-label={`Explore ${n.label}`} className={`electric-node ${focus===n.id?"is-live":""} ${related.has(n.id)&&focus!==n.id?"is-related":""}`} style={{left:`${n.x}%`,top:`${n.y}%`}}><i aria-hidden="true"/><span>{n.label}</span></button>)}
        <div className="electric-source"><span className="electric-source-name">{node.label}</span><span className="electric-source-links">{galaxyNodes.filter(n=>related.has(n.id)&&n.id!==focus).length} CONNECTED NODES</span><a href={node.href} target="_blank" rel="noreferrer" aria-label={`Open source for ${node.label}`}>SOURCE ↗</a></div>
      </div>
    </section>
    <section className="galaxy-activity" id="activity"><div className="galaxy-activity-head"><span className="galaxy-kicker">PUBLIC GITHUB ACTIVITY</span><h2>The work keeps moving.</h2><p>30-day contributions, checked against GitHub when you open this page.</p></div><GitHubPulse/></section>
    <footer className="galaxy-footer"><Link href="/#context">← BACK TO THE PROJECT STORY</Link><span>CURATED FROM THE WORK. NOT A COMPLETE BIOGRAPHY.</span></footer>
  </main>;
}
