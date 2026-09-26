"use client";
import Link from "next/link";
import { galaxyEdges, galaxyNodes } from "../../data/galaxy";
import { IsoBlock } from "./IsoBlock";
import { PIECES } from "../tetris/types";

const featured = ['intellirag','memorable','thermosense','evals','magpie','miq','vllm','llama'];
const stars = galaxyNodes.filter(n => featured.includes(n.id));
export function BridgeScene({ color }: { color: string; mode: number }) {
  const byId = new Map(stars.map(n => [n.id,n]));
  return <div className="bridge-render galaxy-preview" data-ready="true">
    <svg viewBox="0 0 600 300" role="img" aria-label="A constellation of Charan's work; use the labeled links to explore each story">
      <defs><radialGradient id="network-glow"><stop stopColor="#174057"/><stop offset=".55" stopColor="#0b2030"/><stop offset="1" stopColor="#040a14"/></radialGradient><radialGradient id="orbit-core"><stop stopColor="#63e6ff" stopOpacity=".28"/><stop offset="1" stopColor="#63e6ff" stopOpacity="0"/></radialGradient></defs>
      <rect width="600" height="300" fill="url(#network-glow)" />
      <circle cx="300" cy="150" r="115" fill="url(#orbit-core)" className="galaxy-halo" />
      <g className="galaxy-orbits" fill="none" stroke="#8bd9f0">
        <ellipse cx="300" cy="150" rx="103" ry="63" transform="rotate(-18 300 150)" />
        <ellipse cx="300" cy="150" rx="177" ry="93" transform="rotate(13 300 150)" />
        <ellipse cx="300" cy="150" rx="252" ry="119" transform="rotate(-12 300 150)" />
      </g>
      <g className="galaxy-travelers" aria-hidden="true"><circle r="2.4" fill="#a8f1ff"><animateMotion dur="13s" repeatCount="indefinite" path="M 403 150 A 103 63 -18 1 1 197 150 A 103 63 -18 1 1 403 150" /></circle><circle r="2" fill="#ffd166"><animateMotion dur="23s" repeatCount="indefinite" path="M 477 150 A 177 93 13 1 1 123 150 A 177 93 13 1 1 477 150" /></circle></g>
      {Array.from({length:70},(_,i)=><circle key={i} className="galaxy-dust" cx={(i*127+53)%590} cy={(i*83+17)%290} r={i%7===0?1.1:.55} fill="#a3cee5" style={{'--delay':`${i%9*.31}s`} as React.CSSProperties}/>)}
      {galaxyEdges.map(([a,b])=>{const p=byId.get(a),q=byId.get(b);return p&&q?<line key={a+b} x1={p.x*6} y1={p.y*3} x2={q.x*6} y2={q.y*3} stroke="#52b5d4" strokeOpacity=".25"/>:null})}
      <circle cx="300" cy="150" r="53" fill="#083147" stroke={color} strokeOpacity=".5" className="galaxy-core-halo"/>
      <g className="bridge-core-piece">{PIECES.T.rotations[0].map(([x,y],i)=><IsoBlock key={i} x={300+(x-y)*22} y={142+(x+y)*11} size={21} height={19} color={color}/>)}</g>
    </svg>
    {stars.map((node,i)=><Link key={node.id} className="galaxy-star-link" href={`/galaxy?focus=${node.id}`} style={{left:`${node.x}%`,top:`${node.y}%`,color:node.color,'--drift':`${i%2?'-3':'3'}px`,'--delay':`${i*.36}s`} as React.CSSProperties} aria-label={`Explore ${node.label} in Charan's work galaxy`}><i aria-hidden="true"/><span>{node.label}</span></Link>)}
  </div>;
}
