/**
 * PaperFold — a quiet section break inspired by paper.design's circular
 * arc reveals and folded-sheet depth. Not a scrolling conveyor: a single
 * large arc with a few tetrominos resting on the crease, like objects
 * left on a sheet of paper.
 */
import { IsoBlock } from './hero/IsoBlock';
import { PIECES } from './tetris/types';

const REST = [
  { name: 'T' as const, x: 220, y: 58 },
  { name: 'O' as const, x: 390, y: 42 },
  { name: 'I' as const, x: 560, y: 64 },
  { name: 'S' as const, x: 740, y: 38 },
];

export function PaperFold() {
  return (
    <div className="paper-fold" aria-hidden="true">
      <svg viewBox="0 0 960 110" preserveAspectRatio="xMidYMid slice">
        {/* Giant circle whose top edge is the paper peel */}
        <circle className="paper-fold-arc" cx="480" cy="420" r="370" fill="none" stroke="#d8c9a8" strokeOpacity=".18" strokeWidth="1.4" />
        <circle className="paper-fold-arc paper-fold-arc--slow" cx="480" cy="420" r="370" fill="none" stroke="#00e0ff" strokeOpacity=".28" strokeWidth="1.6" strokeDasharray="18 540" />
        {/* Crease shadow — the fold itself */}
        <path d="M0 78 Q480 18 960 78 L960 110 0 110Z" fill="#0b1422" />
        <path d="M0 78 Q480 18 960 78" fill="none" stroke="#e8d9b8" strokeOpacity=".22" strokeWidth="1.2" />
        {REST.map(({ name, x, y }) => (
          <g key={name} className="paper-fold-piece">
            {PIECES[name].rotations[0].map(([cx, cy], i) => (
              <IsoBlock
                key={i}
                x={x + (cx - cy) * 11}
                y={y + (cx + cy) * 6}
                size={10}
                height={9}
                color={PIECES[name].color}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
