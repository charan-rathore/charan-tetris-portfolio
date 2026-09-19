"use client";
import { PIECES } from '../tetris/types';
import { IsoBlock } from './IsoBlock';

/** An isometric switchboard. The surrounding orbit marks rotate; the center piece and ports stay fixed. */
export function BridgeScene({ color, mode }: { color: string; mode: number }) {
  const ports = [[128, 80], [470, 80], [310, 245]];
  return <div className="bridge-render vector-opening" data-ready="true" data-renderer="isometric-svg">
    <svg viewBox="0 0 600 300" aria-hidden="true">
      {Array.from({length:42},(_,i)=><circle key={`star-${i}`} cx={22+(i*137)%554} cy={14+(i*71)%272} r={i%7===0?1.3:.65} fill="#b5c5e4" opacity={i%3===0?.45:.18}/>)}

      {/* Fixed ellipse track — does not rotate */}
      <ellipse cx="300" cy="174" rx="210" ry="91" fill="none" stroke="#283a50" strokeDasharray="2 12" />
      <ellipse cx="300" cy="174" rx="168" ry="71" fill="none" stroke={color} strokeOpacity=".18" />

      {/*
        Orbit marks on a circle centered at (300,174).
        transform-box:fill-box + transform-origin:center makes CSS rotate()
        pivot around THIS <g>'s own bounding-box center in SVG coordinates.
      */}
      <g className="bridge-orbit ambient-motion">
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const highlight = Math.round((i / 28) * 8) % 8 === mode * 2 % 8;
          return (
            <IsoBlock
              key={i}
              x={300 + Math.cos(a) * 210}
              y={174 + Math.sin(a) * 91}
              color={highlight ? color : '#1e3448'}
              size={highlight ? 8 : 6}
              height={highlight ? 6 : 4}
            />
          );
        })}
      </g>

      {ports.map(([x, y], i) => <g key={i} opacity={i === mode ? 1 : .3}>
        <path d={`M300 162H${x}V${y}`} stroke={i === mode ? color : '#52708d'} strokeWidth={i === mode ? 3 : 1} fill="none" />
        {i === mode && <path className="bridge-current" d={`M300 162H${x}V${y}`} stroke="white" strokeWidth="3" fill="none" strokeDasharray="5 45" />}
        {PIECES[(['T', 'O', 'L'] as const)[i]].rotations[0].map(([cx, cy], j) => <IsoBlock key={j} x={x + (cx - cy) * 13} y={y + (cx + cy) * 6} color={i === mode ? color : '#557089'} />)}
      </g>)}

      {/* Center platform + piece — always stationary */}
      <path d="M229 155 300 122 371 155V183L300 220 229 183Z" fill="#071221" stroke={color} strokeOpacity=".7" />
      <path d="M229 155 300 192 371 155M300 192V220" stroke={color} strokeOpacity=".4" fill="none" />
      <g className="bridge-core" key={mode}>
        {PIECES.T.rotations[mode].map(([x, y], i) => <IsoBlock key={i} x={300 + (x - y) * 22} y={126 + (x + y) * 11} size={21} height={22} color={color} />)}
      </g>
    </svg>
  </div>;
}
