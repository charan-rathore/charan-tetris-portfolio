"use client";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { projectTrees, traceFrom } from "../../data/galaxy-knowledge";
import { galaxyNodes } from "../../data/galaxy";
import { GitHubPulse } from "../GitHubPulse";
import { GalaxySpace } from "./GalaxySpace";
import "./galaxy.css";
import "./electric-graph.css";

const byId = new Map(galaxyNodes.map(n => [n.id, n]));
function positionsFor(node:(typeof galaxyNodes)[number]){
  const inward=node.x>50?-1:1,vertical=node.y>51?-1:1;
  const clamp=(v:number)=>Math.min(91,Math.max(9,v));
  return {
    [node.id]:{x:node.x,y:node.y},
    [`${node.id}:idea`]:{x:clamp(node.x+inward*13),y:clamp(node.y-vertical*13)},
    [`${node.id}:work`]:{x:clamp(node.x+inward*17),y:clamp(node.y+vertical*12)},
    [`${node.id}:decision`]:{x:clamp(node.x+inward*29),y:clamp(node.y-vertical*19)},
    [`${node.id}:source`]:{x:clamp(node.x+inward*31),y:clamp(node.y+vertical*18)},
  };
}
const allPositions=Object.fromEntries(galaxyNodes.map(n=>[n.id,positionsFor(n)]));
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
    <div className="electric-head"><span className="galaxy-kicker">THE WORK / CONNECTED</span><h1>Find the thread.</h1><p className="electric-instruction">Pick a quiet star. Its own idea and work will branch out; the other projects stay in the background.</p><div className="electric-tuning"><span>DRAG TO ORBIT · SCROLL TO ZOOM</span><button type="button" aria-pressed={!motion} onClick={()=>setMotion(!motion)}>{motion ? "Ⅱ PAUSE" : "▷ PLAY"}</button><label>SPEED <input aria-label="Orbit speed" type="range" min="0" max="3" step=".25" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label><label>GLOW <input aria-label="Star glow" type="range" min="0" max="5" value={glow} onChange={e=>setGlow(+e.target.value)}/></label><label><input type="checkbox" checked={orbits} onChange={e=>setOrbits(e.target.checked)}/> ORBITS</label></div></div>
    <section className="electric-stage" aria-label="Navigable graph of Charan's projects and their connected parts">
      <div className="galaxy-map electric-map" style={{"--signal":node?.color??"#d6e2d6"} as CSSProperties}>
        <GalaxySpace speed={speed} glow={glow} orbits={orbits} paused={!motion} focus={focus}/>
        <svg className="electric-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g className="electric-orbits" fill="none"><ellipse cx="51" cy="50" rx="23" ry="17" transform="rotate(-18 51 50)"/><ellipse cx="51" cy="50" rx="39" ry="34" transform="rotate(17 51 50)"/><ellipse cx="51" cy="50" rx="48" ry="44" transform="rotate(-10 51 50)"/></g>
          {galaxyNodes.flatMap(project=>projectTrees[project.id].edges.map(e=>{const p=allPositions[project.id][e.from],q=allPositions[project.id][e.to];const selected=project.id===focus,delay=selected ? trace?.edges.get(`${e.from}|${e.to}`)??0 : 0;return <g key={e.to} className={selected?"electric-fired":"electric-muted"} style={{"--step":`${delay*.7}s`} as CSSProperties}><path d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>{selected&&<path key={run} className="electric-discovery" d={`M${p.x} ${p.y} L${q.x} ${q.y}`} pathLength="100"/>}</g>}))}
        </svg>
        {galaxyNodes.flatMap(project=>projectTrees[project.id].nodes.slice(1).map(n=>{const selected=project.id===focus,at=allPositions[project.id][n.id];return <span key={n.id} className={`electric-fact tree-fact ${selected?"is-selected":"is-background"}`} style={{left:`${at.x}%`,top:`${at.y}%`,"--step":`${selected?(trace?.nodes.get(n.id)??0)*.7:0}s`} as CSSProperties}><i aria-hidden="true"/><span>{n.label}</span></span>}))}
        {galaxyNodes.map(n=><button type="button" key={n.id} onClick={()=>select(n.id)} aria-pressed={focus===n.id} aria-label={`Explore ${n.label}`} title={`Explore ${n.label}`} className={`electric-node ${focus===n.id?"is-live":""}`} style={{left:`${n.x}%`,top:`${n.y}%`} as CSSProperties}><i aria-hidden="true"/><span>{n.label}</span></button>)}
        <span className="electric-map-prompt">{node ? "TRACE THIS PROJECT’S OWN TREE · SELECT ANOTHER STAR" : "✦  PICK A STAR TO REVEAL ITS PROJECT TREE"}</span>
        {node&&<div className="electric-source" key={focus}><div className="electric-source-main"><span className="electric-source-name">{node.label}</span><p>{node.story}</p><div className="electric-relations">{projectTrees[focus].nodes.slice(1).map(n=><span key={n.id}><b>{n.label}</b><small>{n.detail}</small></span>)}</div></div><div className="electric-source-actions"><a href={node.href} target="_blank" rel="noreferrer" aria-label={`Open source for ${node.label}`}>SOURCE ↗</a><button type="button" onClick={clear}>CLEAR ×</button></div></div>}
      </div>
    </section>
    <p className="electric-data-link">Each project has its own tree. The other stars are separate projects. <a href="/galaxy-graph.json">Read the graph as JSON ↗</a></p>
    <section className="galaxy-activity" id="activity"><div className="galaxy-activity-head"><span className="galaxy-kicker">PUBLIC GITHUB ACTIVITY</span><h2>The work keeps moving.</h2><p>30-day contributions, checked against GitHub when you open this page.</p></div><GitHubPulse/></section>
    <footer className="galaxy-footer"><Link href="/#context">← BACK TO THE PROJECT STORY</Link><span>CURATED FROM THE WORK. NOT A COMPLETE BIOGRAPHY.</span></footer>
  </main>;
}
