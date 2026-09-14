"use client";
import { useId, useState, type CSSProperties } from 'react';
import { childrenOf, contextGraph, nodeById } from '../../data/context-graph';
import { PIECES } from '../tetris/types';
import { IsoBlock } from '../hero/IsoBlock';
import './knowledge-well.css';

export function KnowledgeWell() {
  const titleId = useId();
  const [trail, setTrail] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [reading, setReading] = useState(false);
  const current = nodeById.get(trail.at(-1) || '');
  const candidates = current ? childrenOf(current.id) : contextGraph.nodes.filter(n => n.depth === 0).map(node => ({ node, relation: 'start here', importance: 2 }));
  const visible = candidates.slice(page * 4, page * 4 + 4);
  const color = current ? PIECES[current.piece].color : '#00e0ff';
  const choose = (id: string) => { setTrail([...trail, id]); setPage(0); };
  const back = (length: number) => { setTrail(trail.slice(0, length)); setPage(0); };
  const download = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(contextGraph, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'charan-context-graph.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const positions = visible.map((_, i) => { const angle = -Math.PI / 2 + i * Math.PI * 2 / visible.length; return { x: 250 + Math.cos(angle) * 180, y: 250 + Math.sin(angle) * 178 }; });
  return <section id="context" className="context-dial" aria-labelledby={titleId} style={{ '--dial-color': color } as CSSProperties}>
    <div className="dial-heading"><div><span className="pixel-label accent-cyan">FOLLOW YOUR CURIOSITY</span><h2 id={titleId}>Every piece has a story.</h2><p>Choose what interests you. The next connection appears when you do.</p></div><button type="button" onClick={() => setReading(!reading)} aria-pressed={reading}>{reading ? 'Show the dial' : 'Read as a list'}</button></div>
    <nav className="dial-trail" aria-label="Your story path"><button onClick={() => back(0)}>The outside</button>{trail.map((id, i) => <span key={id}><i aria-hidden="true">›</i><button aria-current={i === trail.length - 1 ? 'step' : undefined} onClick={() => back(i + 1)}>{nodeById.get(id)!.label}</button></span>)}</nav>
    <div className="dial-layout">
      <div>
        <div className={`dial-stage ${reading ? 'is-reading' : ''}`}>
          {!reading && <svg viewBox="0 0 500 500" aria-hidden="true">
            <circle cx="250" cy="250" r="179" className="dial-orbit" />
            {Array.from({ length: 48 }, (_, i) => { const a = i * Math.PI / 24; return <rect key={i} x={248 + Math.cos(a) * 214} y={248 + Math.sin(a) * 214} width={4} height={4} fill={i % 4 === 0 ? color : '#283c50'} transform={`rotate(${i * 7.5} ${250 + Math.cos(a) * 214} ${250 + Math.sin(a) * 214})`} />; })}
            {visible.map(({ node, importance }, i) => <path key={node.id} data-story-edge={node.id} d={`M250 250L${positions[i].x} ${positions[i].y}`} fill="none" stroke={PIECES[node.piece].color} strokeOpacity=".55" strokeWidth={importance * 1.5} />)}
            <path d="M185 227 250 196 315 227V277L250 308 185 277Z" fill="#0b1422" stroke={color} strokeOpacity=".4" />
            <path d="M185 227 250 259 315 227M250 259V308" fill="none" stroke={color} strokeOpacity=".3" />
            <g key={current?.id || 'outside'} className="dial-piece">{PIECES[current?.piece || 'T'].rotations[0].map(([x, y], i) => <IsoBlock key={i} x={250 + (x - y) * 18} y={208 + (x + y) * 9} size={17} height={19} color={color} />)}</g>
          </svg>}
          {!reading && <div className="dial-center"><span>{current ? 'YOU ARE HERE' : 'PICK A PIECE'}</span><strong>{current?.label || 'A little curiosity.'}</strong></div>}
          <div className="dial-nodes" aria-label="Next connections">{visible.map(({ node, relation }, i) => <button key={node.id} data-context-node={node.id} className="dial-node" style={{ '--node-color': PIECES[node.piece].color, left: `${positions[i].x / 5}%`, top: `${positions[i].y / 5}%` } as CSSProperties} onClick={() => choose(node.id)}><small>{relation}</small><strong>{node.label}</strong><span aria-hidden="true">{node.depth === 4 ? '↗' : '+'}</span></button>)}</div>
        </div>
        <div className="dial-legend"><span><b>━</b> Main thread <b>─</b> Supporting connection</span>{candidates.length > 4 && <button onClick={() => setPage((page + 1) % Math.ceil(candidates.length / 4))}>More paths · {page + 1}/{Math.ceil(candidates.length / 4)} →</button>}</div>
      </div>
      <div className="dial-story" aria-live="polite">
        <span className="pixel-label">{current ? ['THE INTEREST', 'THE QUESTION', 'THE CHOICE', 'THE RESULT', 'THE EVIDENCE'][current.depth] : 'THE STORY STARTS WITH YOU'}</span>
        <h3>{current?.label || 'What pulls you in?'}</h3>
        <p>{current?.detail || 'Useful AI. Signals worth following. Interfaces that make sense. Three ways into my work; one connection at a time.'}</p>
        {current?.tools && <p className="dial-tools"><span>In this project</span>{current.tools.join(' · ')}</p>}
        {current?.href && <a className="dial-open" href={current.href} target="_blank" rel="noreferrer">{current.label} ↗</a>}
        {current && <a className="dial-source" href={current.source_file} target="_blank" rel="noreferrer">Where this story comes from ↗</a>}
        <div className="dial-navigation">{trail.length > 0 && <button onClick={() => back(trail.length - 1)}>← One connection back</button>}<a href="#work">Browse all projects ↓</a></div>
        <p className="dial-note">Line width highlights the main story, not a performance score. Every connection is curated from the work.</p>
      </div>
    </div>
    <div className="dial-bottom"><span className="pixel-label">THERE’S MORE WHEN YOU’RE READY.</span><button onClick={download}>Export Graphify JSON ↗</button></div>
  </section>;
}
