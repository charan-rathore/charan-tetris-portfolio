/**
 * TetrisMarquee — inspired by paper.design's infinite horizontal content strips.
 *
 * A seamless looping strip of all 7 isometric Tetris pieces in their natural
 * colors, scrolling at a slow constant speed. The strip is duplicated so the
 * CSS animation creates a perfect infinite loop without a jump.
 *
 * Used as a visual section break between the hero/context and the work grid.
 */
import { IsoBlock } from './hero/IsoBlock';
import { PIECES } from './tetris/types';

// One full set of pieces + repetitions fills the strip generously.
const NAMES = ['I', 'T', 'L', 'S', 'J', 'O', 'Z'] as const;

// Pre-render each piece as a compact isometric glyph in an 80×56 viewBox.
function PieceGlyph({ name, dimmed = false }: { name: (typeof NAMES)[number]; dimmed?: boolean }) {
  const def = PIECES[name];
  const cells = def.rotations[0];
  return (
    <svg viewBox="0 0 80 56" className="marquee-piece" aria-hidden="true">
      <g opacity={dimmed ? 0.35 : 0.9}>
        {cells.map(([x, y], i) => (
          <IsoBlock
            key={i}
            x={28 + (x - y) * 13}
            y={14 + (x + y) * 7}
            size={11}
            height={10}
            color={def.color}
          />
        ))}
      </g>
    </svg>
  );
}

// Build one unit of 21 pieces with alternating normal/dimmed to add rhythm.
const UNIT: { name: (typeof NAMES)[number]; dimmed: boolean }[] = Array.from(
  { length: 21 },
  (_, i) => ({ name: NAMES[i % NAMES.length], dimmed: i % 3 === 2 })
);

export function TetrisMarquee() {
  return (
    <div className="tetris-marquee" aria-hidden="true" role="presentation">
      {/* Duplicate the track so the CSS translateX(-50%) loop is seamless */}
      <div className="tetris-marquee-track">
        {[...UNIT, ...UNIT].map(({ name, dimmed }, i) => (
          <PieceGlyph key={i} name={name} dimmed={dimmed} />
        ))}
      </div>
    </div>
  );
}
