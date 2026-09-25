"use client";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { galaxyEdges, galaxyNodes } from "../../data/galaxy";
import { GitHubPulse } from "../GitHubPulse";
import "./galaxy.css";

const clusters = ["All", "Trust", "Measure", "Build", "Infrastructure", "Work"];
const byId = new Map(galaxyNodes.map(node => [node.id, node]));

export function GalaxyAtlas() {
  const [focus, setFocus] = useState(() => {
    if (typeof window === "undefined") return "systris";
    const selected = new URLSearchParams(location.search).get("focus");
    return selected && byId.has(selected) ? selected : "systris";
  });
  const [cluster, setCluster] = useState("All");
  const [motion, setMotion] = useState(true);
  const node = byId.get(focus) ?? galaxyNodes[0];
  const connected = useMemo(() => new Set(galaxyEdges.filter(([a,b]) => a === focus || b === focus).flat()), [focus]);
  const select = (id: string) => {
    setFocus(id);
    history.replaceState(null, "", `/galaxy?focus=${encodeURIComponent(id)}`);
  };
  return <main className={`galaxy-page ${motion ? "" : "galaxy-paused"}`}>
    <div className="galaxy-backdrop" aria-hidden="true" />
    <header className="galaxy-header"><Link href="/" className="galaxy-home">← SYSTRIS</Link><span>CHARAN RATHORE / THE WORK GALAXY</span><a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">GITHUB ↗</a></header>
    <div className="galaxy-intro"><span className="galaxy-kicker">A CONNECTED BODY OF WORK</span><h1>Follow the thread.</h1><p>Pick a star. See the question behind the work, then follow the source. These links are an editorial map, not an algorithmic score or a complete GitHub history.</p></div>
    <div className="galaxy-controls" role="group" aria-label="Filter the galaxy">{clusters.map(c => <button type="button" key={c} className={cluster === c ? "is-active" : ""} aria-pressed={cluster === c} onClick={() => setCluster(c)}>{c}</button>)}<button type="button" className="galaxy-motion" aria-pressed={!motion} onClick={() => setMotion(!motion)}>{motion ? "Ⅱ PAUSE MOTION" : "▷ RESUME MOTION"}</button></div>
    <div className="galaxy-stage">
      <div className="galaxy-map" aria-label="Interactive map of projects and work">
        <svg className="galaxy-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="atlas-glow"><stop stopColor="#1a4057"/><stop offset="1" stopColor="#090e18"/></radialGradient></defs><rect width="100" height="100" fill="url(#atlas-glow)"/>
          {Array.from({length:80}, (_,i) => <circle key={i} className="galaxy-speck" cx={(i*37+7)%100} cy={(i*79+13)%100} r={i%6===0?.16:.08} fill="#c5e9ff" style={{"--delay":`${i%11*.31}s`} as CSSProperties}/>)}
          {galaxyEdges.map(([a,b]) => {const p=byId.get(a)!,q=byId.get(b)!;return <line key={a+b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={a===focus||b===focus ? "is-connected" : ""} stroke="#82cde8" strokeWidth={a===focus||b===focus?.24:.1} opacity={cluster === "All" || (p.cluster===cluster && q.cluster===cluster) ? 1 : .18}/>})}
        </svg>
        {galaxyNodes.map((n,i) => <button type="button" key={n.id} onClick={() => select(n.id)} aria-pressed={focus === n.id} aria-label={`${n.label}: ${n.kicker}`} className={`galaxy-point ${focus === n.id ? "is-selected" : ""} ${connected.has(n.id) ? "is-neighbor" : ""} ${cluster!=="All" && n.cluster!==cluster ? "is-dim" : ""}`} style={{left:`${n.x}%`,top:`${n.y}%`,color:n.color,"--delay":`${i*.23}s`} as CSSProperties}><i aria-hidden="true"/><span>{n.label}</span></button>)}
      </div>
      <aside className="galaxy-inspector" aria-live="polite"><span className="galaxy-kicker">{node.cluster} / {node.kicker}</span><h2>{node.label}</h2><p className="galaxy-story">{node.story}</p><div className="galaxy-proof"><span>SOURCE NOTE</span><p>{node.evidence}</p></div><a href={node.href} target="_blank" rel="noreferrer">INSPECT THE SOURCE ↗</a><div className="galaxy-neighbors"><span>CONNECTED THREADS</span><div>{galaxyNodes.filter(n => connected.has(n.id) && n.id !== focus).map(n => <button type="button" onClick={() => select(n.id)} key={n.id}>{n.label} ↗</button>)}</div></div></aside>
    </div>
    <section className="galaxy-index"><div><span className="galaxy-kicker">THE SHORT VERSION</span><h2>From a question to the proof.</h2><p>The map is a way into the work. The repositories and résumé are the record; follow those when you want the details.</p></div><div className="galaxy-index-list">{galaxyNodes.map(n => <button type="button" onClick={() => {select(n.id);document.querySelector('.galaxy-stage')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}} key={n.id}><span style={{color:n.color}}>✦</span><strong>{n.label}</strong><small>{n.kicker}</small><span>↗</span></button>)}</div></section>
    <section className="galaxy-activity" id="activity"><div className="galaxy-activity-head"><span className="galaxy-kicker">PUBLIC GITHUB ACTIVITY</span><h2>The work keeps moving.</h2><p>A recent contribution window, with its last successful check shown when the upstream feed is unavailable. It is not a count of merged PRs.</p></div><GitHubPulse /></section>
    <footer className="galaxy-footer"><Link href="/#context">← BACK TO THE PROJECT STORY</Link><span>CURATED FROM THE WORK. NOT A COMPLETE BIOGRAPHY.</span></footer>
  </main>;
}
