"use client";
import { IsoBlock } from "./IsoBlock";
import { PIECES } from "../tetris/types";

const points = [
  [68,148,"RAG"],[126,64,"EVAL"],[186,180,"MEMORY"],[258,62,"OSS"],
  [355,66,"MAGPIE"],[447,90,"COPILOTKIT"],[524,167,"vLLM"],[456,231,"llama.cpp"],[296,244,"PROJECTS"],[141,249,"MiQ"]
] as const;
const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[3,6],[6,7],[4,5],[5,8],[8,9],[9,0],[7,8],[2,8]];
export function BridgeScene({ color }: { color: string; mode: number }) {
  return <div className="bridge-render vector-opening" data-ready="true">
    <svg viewBox="0 0 600 300" role="img" aria-label="Network of Charan's RAG, memory, evaluation and open-source work around his GitHub profile">
      <defs><radialGradient id="network-glow"><stop stopColor="#173f59"/><stop offset="1" stopColor="#080f1c"/></radialGradient></defs>
      <rect width="600" height="300" fill="url(#network-glow)" />
      {edges.map(([a,b],i)=><line key={i} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} stroke="#4bc8e3" strokeOpacity=".32" strokeWidth="1.5"/>)}
      {points.map(([x,y,label],i)=><g key={label}><circle cx={x} cy={y} r={i%3===0?7:5} fill={i%3===0?"#ffd166":color}/><text x={x} y={y-15} fill="#c9d8e7" fontSize="10" textAnchor="middle" fontFamily="monospace">{label}</text></g>)}
      <path d="M238 129 300 97 362 129V179L300 212 238 179Z" fill="#091b29" stroke={color} strokeWidth="2"/>
      <path d="M238 129 300 163 362 129M300 163V212" stroke={color} strokeOpacity=".6" fill="none"/>
      <g className="bridge-core-piece">{PIECES.T.rotations[0].map(([x,y],i)=><IsoBlock key={i} x={300+(x-y)*17} y={120+(x+y)*8} size={16} height={16} color={color}/>)}</g>
    </svg>
  </div>;
}
