"use client";
import { useState } from "react";
import './knowledge-well.css';

type Node = { id: string; title: string; category: string; detail: string; href: string; x: number; y: number };
const nodes: Node[] = [
  {id:'github',title:'GitHub / Charan',category:'THE HUB',detail:'Start with the code. The edges show how evidence, memory and open-source contributions inform one another.',href:'https://github.com/charan-rathore',x:50,y:50},
  {id:'rag',title:'Retrieval + evidence',category:'PRACTICE',detail:'Making answers traceable to their sources, rather than asking users to trust a black box.',href:'https://github.com/charan-rathore/IntelliRAG',x:22,y:24},
  {id:'intellirag',title:'IntelliRAG',category:'FLAGSHIP / REPO',detail:'An end-to-end RAG system: ingestion, retrieval, citations, workers and evaluation. Follow the evidence behind an answer.',href:'https://github.com/charan-rathore/IntelliRAG',x:11,y:10},
  {id:'eval',title:'Evaluation',category:'PRACTICE',detail:'Test cases and inspectable failures make an AI system better, not merely more convincing.',href:'https://github.com/charan-rathore/IntelliRAG',x:40,y:10},
  {id:'memory',title:'Memory + context',category:'PRACTICE',detail:'Useful context should stay connected to its origin, even as it moves into new formats.',href:'https://github.com/charan-rathore/memoRABLE',x:16,y:64},
  {id:'memorable',title:'memoRABLE',category:'PRODUCT / REPO',detail:'Turns documents into six source-linked memory blocks, then into useful output without losing the source.',href:'https://github.com/charan-rathore/memoRABLE',x:8,y:84},
  {id:'magpie',title:'magpie / merged',category:'OPEN SOURCE / PR',detail:'A merged provider fix preserves prompts when two Codex accounts save with the same timestamp.',href:'https://github.com/yetone/magpie/pull/74',x:79,y:12},
  {id:'copilotkit',title:'CopilotKit / open',category:'OPEN SOURCE / PR',detail:'An open PR fixes the upsert of same-ID activity messages in the agent frontend stack.',href:'https://github.com/CopilotKit/CopilotKit/pull/7453',x:94,y:31},
  {id:'vllm',title:'vLLM',category:'INFERENCE / FORK',detail:'Exploring the high-throughput serving engine and its contribution surface.',href:'https://github.com/charan-rathore/vllm',x:87,y:57},
  {id:'llama',title:'llama.cpp',category:'INFERENCE / FORK',detail:'Exploring efficient local C/C++ inference, close to the system underneath an answer.',href:'https://github.com/charan-rathore/llama.cpp',x:91,y:83},
  {id:'interface',title:'Human interface',category:'PRACTICE',detail:'Present the output, evidence and decisions clearly so that someone can act on them.',href:'https://github.com/charan-rathore/charan-tetris-portfolio',x:59,y:83},
  {id:'systris',title:'Systris',category:'PORTFOLIO / REPO',detail:'This Tetris-inspired interface connects the projects to the decisions behind them.',href:'https://github.com/charan-rathore/charan-tetris-portfolio',x:42,y:94},
  {id:'miq',title:'MiQ / analytics',category:'EXPERIENCE',detail:'Analyst work across MENA: turning signals into decisions.',href:'https://github.com/charan-rathore',x:36,y:73},
  {id:'forecast',title:'Temperature modelling',category:'PROJECT / REPO',detail:'Time-series forecasting through statistical modelling, seasonal decomposition and tests.',href:'https://github.com/charan-rathore/Time-Series-Temperature-Modelling',x:72,y:94},
];
const connections: [string,string][] = [
  ['github','rag'],['github','memory'],['github','magpie'],['github','copilotkit'],['github','vllm'],['github','llama'],['github','interface'],['github','miq'],
  ['rag','intellirag'],['rag','eval'],['intellirag','eval'],['rag','memory'],['memory','memorable'],['memory','interface'],['eval','magpie'],['magpie','copilotkit'],['copilotkit','interface'],['vllm','llama'],['vllm','rag'],['llama','rag'],['interface','systris'],['miq','forecast'],['miq','interface'],['forecast','rag'],['systris','github']
];
const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
export function KnowledgeWell() {
  const [active,setActive]=useState('github');
  const [expanded,setExpanded]=useState(false);
  const node=byId[active];
  return <section id="context" className="work-network" aria-labelledby="network-title">
    <div className="network-heading"><div><span className="pixel-label accent-cyan">THE WORK / CONNECTED</span><h2 id="network-title">One hub. Many connected questions.</h2><p>Click the graph to explore the source code, projects and open-source work. Lines show editorial connections, not measured impact.</p></div><button type="button" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'CLOSE GRAPH':'OPEN THE FULL GRAPH ↗'}</button></div>
    <div className={'network-content'+(expanded?' expanded':'')}>
      <div className="network-canvas" role="group" aria-label="Interactive graph of projects and open-source work">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{connections.map(([a,b],i)=><line key={i} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} className={a===active||b===active?'is-active':''}/>)}</svg>
        {nodes.map(n=><button key={n.id} type="button" className={'network-node '+(n.id==='github'?'hub ':'')+(n.id===active?'selected':'')} style={{left:`${n.x}%`,top:`${n.y}%`}} onClick={()=>{setActive(n.id);setExpanded(true)}} aria-pressed={n.id===active}><span className="network-dot"/><span>{n.title}</span></button>)}
      </div>
      <aside className="network-detail" aria-live="polite"><span className="pixel-label accent-yellow">{node.category}</span><h3>{node.title}</h3><p>{node.detail}</p><div className="network-neighbors"><span>CONNECTED TO</span>{connections.filter(([a,b])=>a===active||b===active).map(([a,b])=>{const other=byId[a===active?b:a];return <button key={other.id} onClick={()=>setActive(other.id)}>{other.title} ↗</button>})}</div><a href={node.href} target="_blank" rel="noreferrer">{node.id==='github'?'OPEN GITHUB PROFILE':'VIEW SOURCE / WORK'} ↗</a></aside>
    </div>
  </section>;
}
