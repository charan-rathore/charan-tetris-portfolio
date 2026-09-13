"use client";

import { useId, useRef, useState, type CSSProperties } from 'react';
import { childrenOf, contextGraph, nodeById, parentsOf, pathTo, type ContextNode } from '../../data/context-graph';
import { PIECES, type PieceName } from '../tetris/types';
import './knowledge-well.css';

const FLOORS = ['Interests', 'Projects & work', 'Tools & practice', 'The thinking', 'Open the evidence'];
const PROMPTS = ['What pulls you in?', 'Choose a piece of the work.', 'Follow a tool or a practice.', 'What was the point?', 'Go to the source.'];
const COLORS = ['#00e0ff', '#b877ff', '#ffd600', '#3cf08e', '#ff9364'];
const FLOOR_PIECES: PieceName[] = ['T', 'I', 'O', 'S', 'L'];
const floorY = (depth: number) => 86 + depth * 126;

function Block({ x, y, color, cells }: { x: number; y: number; color: string; cells: readonly (readonly [number, number])[] }) {
  return <g transform={`translate(${x} ${y})`}>
    {cells.toSorted((a, b) => a[1] + a[0] - b[1] - b[0]).map(([cx, cy]) => {
      const bx = (cx - cy) * 13, by = (cx + cy) * 6;
      return <g key={`${cx}:${cy}`} transform={`translate(${bx} ${by})`}>
        <path d="M0 -17 13 -11 0 -5 -13 -11Z" fill={color} />
        <path d="M-13 -11 0 -5 0 11 -13 5Z" fill={color} opacity=".5" />
        <path d="M0 -5 13 -11 13 5 0 11Z" fill={color} opacity=".8" />
        <path d="M-13 -11 0 -5 13 -11M0 -5V11" fill="none" stroke="#fff" strokeOpacity=".28" />
      </g>;
    })}
  </g>;
}

export function KnowledgeWell() {
  const [trail, setTrail] = useState<string[]>([]);
  const [depth, setDepth] = useState(0);
  const [query, setQuery] = useState('');
  const [flat, setFlat] = useState(false);
  const inspector = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const gradientId = useId().replace(/:/g, '');
  const candidates = depth === 0
    ? contextGraph.nodes.filter(n => n.depth === 0).map(node => ({ node, relation: 'start here' }))
    : childrenOf(trail[depth - 1]);
  const selected = nodeById.get(trail[Math.max(0, depth - 1)]);
  const results = query.trim() ? contextGraph.nodes.filter(n => `${n.label} ${n.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) : [];
  const color = COLORS[depth];
  const focusInspector = () => requestAnimationFrame(() => inspector.current?.focus({ preventScroll: true }));
  function choose(node: ContextNode, fromSearch = false) {
    setTrail(fromSearch ? pathTo(node.id) : [...trail.slice(0, node.depth), node.id]);
    setDepth(Math.min(node.depth + 1, 4));
    setQuery('');
    focusInspector();
  }
  function goToFloor(next: number) {
    setDepth(next); setQuery(''); focusInspector();
  }
  function downloadGraph() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(contextGraph, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'systris-context-graph.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const floors = FLOORS.map((name, d) => ({ name, nodes: d === depth ? candidates.slice(0, 3).map(c => c.node) : d < depth && trail[d] ? [nodeById.get(trail[d])!] : [] }));

  return <section id="context" className="knowledge-well" aria-labelledby={titleId} style={{ '--well-color': color } as CSSProperties}>
    <header className="well-heading">
      <div><p className="pixel-label accent-cyan">SIDE QUEST 01 / THE CONTEXT WELL</p>
        <h2 id={titleId}>There’s always<br /><em>another layer.</em></h2>
      </div>
      <p>A tool is only the surface. Follow the pieces down to the projects, the thinking, and the work you can actually open.</p>
    </header>
    <div className="well-console">
      <div className="well-toolbar"><span><i /> GRAPHIFY / CONTEXT MAP</span><span>{contextGraph.nodes.length} NODES <b>·</b> 5 LAYERS</span>
        <button type="button" aria-pressed={flat} onClick={() => setFlat(!flat)}>{flat ? '↗ Depth view' : '☷ Reading view'}</button>
      </div>
      <div className={`well-layout${flat ? ' well-layout--flat' : ''}`}>
        <div className="well-visual">
          <div className="well-stage" aria-label={`Five layers of context. Exploring ${FLOORS[depth]}.`}>
            <svg viewBox="0 0 800 780" aria-hidden="true" className="well-drawing">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#173744" stopOpacity=".6" /><stop offset="1" stopColor="#07101b" stopOpacity=".3" /></linearGradient>
              </defs>
              {[130, 685].map(x => <path key={x} d={`M${x} 75V705`} stroke="#234050" strokeDasharray="3 9" />)}
              {floors.map((floor, d) => {
                const y = floorY(d), active = d === depth, reached = d <= depth;
                return <g key={floor.name} className={`well-plane ${active ? 'is-active' : ''} ${reached ? 'is-reached' : ''}`} style={{ '--floor-color': COLORS[d] } as CSSProperties}>
                  <path d={`M85 ${y + 24} 475 ${y - 42} 735 ${y + 34} 345 ${y + 101}Z`} fill={`url(#${gradientId})`} className="well-plane-top" />
                  <path d={`M85 ${y + 24}V${y + 35}L345 ${y + 112} 735 ${y + 45}V${y + 34}L345 ${y + 101}Z`} fill="#07121f" stroke="#263947" />
                  {[1, 2, 3, 4, 5].map(n => <path key={n} d={`M${85 + 65 * n} ${y + 24 - 11 * n}l260 77M${85 + 43 * n} ${y + 24 + 12.8 * n}l390 -66`} stroke="#7abbcc" strokeOpacity=".07" />)}
                  <text x="26" y={y + 38} className="well-floor-number">0{d + 1}</text>
                  {floor.nodes.length ? floor.nodes.map((node, i) => <Block key={node.id} x={floor.nodes.length === 1 ? 420 : 240 + i * 180} y={y + 11} color={reached ? PIECES[node.piece].color : '#233447'} cells={PIECES[node.piece].rotations[0]} />) : <Block x={420} y={y + 11} color="#243446" cells={PIECES[FLOOR_PIECES[d]].rotations[0]} />}
                  {!reached ? <text x="420" y={y + 68} textAnchor="middle" className="well-locked-label">{floor.name.toUpperCase()}</text> : null}
                </g>;
              })}
              {trail.slice(0, depth).flatMap((key, d) => d < 4 ? floors[d + 1].nodes.map((node, i, next) => {
                const x = next.length === 1 ? 420 : 240 + i * 180;
                const relation = contextGraph.links.find(edge => edge.source === key && edge.target === node.id)?.relation;
                return <g key={`${key}:${node.id}`}><path className="well-thread" d={`M420 ${floorY(d) + 48}C420 ${floorY(d) + 87},${x} ${floorY(d + 1) - 38},${x} ${floorY(d + 1) - 8}`} stroke={COLORS[d]} fill="none" />{next.length === 1 ? <text x="438" y={floorY(d) + 90} className="well-relation">{relation}</text> : null}</g>;
              }) : [])}
            </svg>
            {floors.flatMap((floor, d) => floor.nodes.map((node, i) => <button
              key={`${d}:${node.id}`} data-context-node={node.id} type="button" className={`well-node ${d === depth ? 'well-node--choice' : ''}`}
              style={{ left: `${(floor.nodes.length === 1 ? 420 : 240 + i * 180) / 8}%`, top: `${(floorY(d) + 46) / 7.8}%`, '--node-color': PIECES[node.piece].color } as CSSProperties}
              onClick={() => d < depth ? goToFloor(d) : d === 4 ? window.open(node.href || node.source_file, '_blank', 'noopener,noreferrer') : choose(node)} aria-label={`${d < depth ? 'Revisit' : d === 4 ? 'Open' : 'Explore'} ${node.label}`}>
              {node.label}<span aria-hidden="true">{d < depth ? '↶' : d === 4 ? '◆' : '↓'}</span>
            </button>))}
          </div>
          <div className="well-legend"><span><i /> YOUR PATH</span><span>{candidates.length > 3 ? `3 of ${candidates.length} choices shown · all listed alongside` : 'Choose a piece. Reveal what’s beneath.'}</span></div>
        </div>
        <div className="well-inspector">
          <nav className="well-depths" aria-label="Context layers">
            {FLOORS.map((name, d) => <button key={name} type="button" disabled={d > trail.length} aria-current={depth === d ? 'step' : undefined} onClick={() => goToFloor(d)} title={name}><span>0{d + 1}</span><small>{name}</small></button>)}
          </nav>
          <div className="well-search"><label htmlFor={`${titleId}-search`}>Jump to a project, tool or idea</label><input id={`${titleId}-search`} type="search" autoComplete="off" placeholder="Try Redis, vision, Flipkart…" value={query} onChange={e => setQuery(e.target.value)} /></div>
          {query.trim() ? <div className="well-results" aria-live="polite">
            <p>{results.length ? 'Matching connections' : 'No matching nodes. Try another term.'}</p>
            {results.map(node => <button key={node.id} type="button" onClick={() => choose(node, true)}>{node.label}<small>0{node.depth + 1} / {FLOORS[node.depth]} ↗</small></button>)}
          </div> : <>
            <p className="well-depth-label">LAYER 0{depth + 1} / {FLOORS[depth].toUpperCase()}</p>
            <h3 ref={inspector} tabIndex={-1}>{PROMPTS[depth]}</h3>
            <p className="well-context-copy">{selected ? selected.detail : 'Three ways into the same mind. Pick an interest and watch its connections fall into place. You decide how deep to go.'}</p>
            {selected ? <div className="well-selected"><span>FROM</span><strong>{selected.label}</strong>{selected.href ? <a href={selected.href} target="_blank" rel="noreferrer">Open docs ↗</a> : null}</div> : null}
            <div className="well-choices" aria-label={`Connections in ${FLOORS[depth]}`}>
              {candidates.map(({ node, relation }, i) => depth === 4 ? <a className="well-evidence" key={node.id} href={node.href || node.source_file} target="_blank" rel="noreferrer"><span>0{i + 1}</span><div><strong>{node.label}</strong><small>{relation}</small></div><b>↗</b></a> : <button key={node.id} type="button" onClick={() => choose(node)} style={{ '--node-color': PIECES[node.piece].color } as CSSProperties}><span className="well-choice-piece" aria-hidden="true">{node.piece}</span><div><strong>{node.label}</strong><small>{relation}{node.depth === 2 ? ` · ${parentsOf(node.id).length} connections above` : ''}</small></div><b>↓</b></button>)}
            </div>
            {selected && parentsOf(selected.id).length > 1 ? <details className="well-crosslinks"><summary>Also connected to {parentsOf(selected.id).length} nodes above</summary><p>A shared tool can lead into a different project. Follow the labeled context below.</p>{parentsOf(selected.id).map(({ node, relation }) => <button key={node.id} type="button" onClick={() => choose(node, true)}>{node.label}<small>{relation} ↗</small></button>)}</details> : null}
            {selected ? <a className="well-provenance" href={selected.source_file} target="_blank" rel="noreferrer">Where this context comes from ↗</a> : null}
          </>}
          <div className="well-footer"><button type="button" onClick={() => { setTrail([]); goToFloor(0); }}>↶ Start a new path</button><a href="#work">All project stories ↓</a></div>
        </div>
      </div>
      <footer className="well-bottom"><p><strong>Depth, on your terms.</strong> Curated connections · no generated claims</p><button type="button" onClick={downloadGraph}>Export Graphify JSON ↗</button></footer>
    </div>
  </section>;
}
