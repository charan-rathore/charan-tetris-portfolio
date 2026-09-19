"use client";
import { PIECES } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

/** An isometric switchboard with no alternate GPU-only design. */
export function BridgeScene({ color, mode }: { color: string; mode: number }) {
  const ports = [[128, 80], [470, 80], [310, 245]];
  return <div className="bridge-render vector-opening" data-ready="true" data-renderer="isometric-svg">
    <svg viewBox="0 0 600 300" aria-hidden="true">
      {Array.from({length:42},(_,i)=><circle key={`star-${i}`} cx={22+(i*137)%554} cy={14+(i*71)%272} r={i%7===0?1.3:.65} fill="#b5c5e4" opacity={i%3===0?.45:.18}/>)}
      {/* Dial ring: surrounding marks turn slowly; center piece and ports stay fixed. */}
      <g className="bridge-dial ambient-motion">
        <ellipse cx="300" cy="178" rx="210" ry="91" fill="none" stroke="#283a50" strokeDasharray="2 12" />
        <ellipse cx="300" cy="178" rx="168" ry="71" fill="none" stroke={color} strokeOpacity=".15" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = i * Math.PI / 12;
          return <IsoBlock key={i} x={300 + Math.cos(a) * 206} y={170 + Math.sin(a) * 88} color={i % 8 === mode * 2 ? color : '#233b52'} size={7} height={5} />;
        })}
      </g>
      {ports.map(([x, y], i) => <g key={i} opacity={i === mode ? 1 : .3}>
        <path d={`M300 166H${x}V${y}`} stroke={i === mode ? color : '#52708d'} strokeWidth={i === mode ? 3 : 1} fill="none" />
        {i === mode && <path className="bridge-current" d={`M300 166H${x}V${y}`} stroke="white" strokeWidth="3" fill="none" strokeDasharray="5 45" />}
        {PIECES[(['T', 'O', 'L'] as const)[i]].rotations[0].map(([cx, cy], j) => <IsoBlock key={j} x={x + (cx - cy) * 13} y={y + (cx + cy) * 6} color={i === mode ? color : '#557089'} />)}
      </g>)}
      <path d="M229 159 300 126 371 159V187L300 224 229 187Z" fill="#071221" stroke={color} strokeOpacity=".7" />
      <path d="M229 159 300 196 371 159M300 196V224" stroke={color} strokeOpacity=".4" fill="none" />
      <g className="bridge-core" key={mode}>
        {PIECES.T.rotations[mode].map(([x, y], i) => <IsoBlock key={i} x={300 + (x - y) * 22} y={130 + (x + y) * 11} size={21} height={22} color={color} />)}
      </g>
    </svg>
  </div>;
}
