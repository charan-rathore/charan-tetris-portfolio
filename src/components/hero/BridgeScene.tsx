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
      <defs><radialGradient id="network-glow"><stop stopColor="#173f59"/><stop offset="1" stopColor="#080f1c"/></radialGradient></defs>
      <rect width="600" height="300" fill="url(#network-glow)" />
      {Array.from({length:42},(_,i)=><circle key={i} className="galaxy-dust" cx={(i*127+53)%590} cy={(i*83+17)%290} r={i%7===0?1.1:.55} fill="#a3cee5" style={{'--delay':`${i%9*.31}s`} as React.CSSProperties}/>)}
      {galaxyEdges.map(([a,b])=>{const p=byId.get(a),q=byId.get(b);return p&&q?<line key={a+b} x1={p.x*6} y1={p.y*3} x2={q.x*6} y2={q.y*3} stroke="#52b5d4" strokeOpacity=".25"/>:null})}
      <path d="M238 129 300 97 362 129V179L300 212 238 179Z" fill="#091b29" stroke={color} strokeWidth="2"/>
      <path d="M238 129 300 163 362 129M300 163V212" stroke={color} strokeOpacity=".6" fill="none"/>
      <g className="bridge-core-piece">{PIECES.T.rotations[0].map(([x,y],i)=><IsoBlock key={i} x={300+(x-y)*17} y={120+(x+y)*8} size={16} height={16} color={color}/>)}</g>
    </svg>
    {stars.map((node,i)=><Link key={node.id} className="galaxy-star-link" href={`/galaxy?focus=${node.id}`} style={{left:`${node.x}%`,top:`${node.y}%`,color:node.color,'--drift':`${i%2?'-3':'3'}px`,'--delay':`${i*.36}s`} as React.CSSProperties} aria-label={`Explore ${node.label} in Charan's work galaxy`}><i aria-hidden="true"/><span>{node.label}</span></Link>)}
  </div>;
}
