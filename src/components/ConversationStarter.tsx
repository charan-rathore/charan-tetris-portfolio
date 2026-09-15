"use client";
import { useEffect, useRef, useState } from 'react';
import { PIECES } from './tetris/types';
import { IsoBlock } from './hero/IsoBlock';

const prompts = [
  { piece:'T' as const, title:'Build something useful', message:"Hi Charan, I have a product idea I'd love to explore with you. The problem is…" },
  { piece:'L' as const, title:'Talk data & decisions', message:"Hi Charan, I'd like to discuss an analytics challenge. The decision we're trying to make is…" },
  { piece:'S' as const, title:'Explore an opportunity', message:"Hi Charan, I'd love to connect about an opportunity. A little context about the team and role…" },
];

export function ConversationStarter({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const item = prompts[selected], piece = PIECES[item.piece];
  const cells = piece.rotations[rotation].map(([x, y]) => [x + 3, y + 1]);
  const point = (x: number, y: number) => ({ x: 140 + (x - y) * 19, y: 74 + (x + y) * 9.5 });
  function reset(index = selected) { if (timer.current) clearTimeout(timer.current); setSelected(index); setLanded(false); }
  function drop() {
    if (landed) return;
    setLanded(true);
    timer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('contact-prompt', { detail: item.message }));
      document.getElementById('contact')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  }
  return <aside className={`conversation-starter conversation-game ${compact ? 'is-compact' : ''}`}>
    <span className="pixel-label accent-yellow">YOUR IDEA · NEXT IN QUEUE</span>
    <h3>The next piece could be yours.</h3>
    <p>Pick a piece. Rotate it. Drop it into your next conversation.</p>
    <div className="conversation-board" aria-label={`Conversation board: ${item.title}`}>
      <svg viewBox="0 0 400 240" aria-hidden="true">
        <path d="M140 66 303 147 199 199 36 118V132L199 213 303 161V147M199 199V213" fill="#0b1927" stroke="#38556d" />
        {Array.from({ length: 5 }, (_, y) => Array.from({ length: 8 }, (_, x) => cells.some(([cx, cy]) => cx === x && cy === y) ? <IsoBlock key={`${x}:${y}`} {...point(x, y)} color={piece.color} size={17} height={9} ghost /> : <IsoBlock key={`${x}:${y}`} {...point(x, y)} color={(x + y) % 3 === 0 ? '#29485c' : '#183345'} size={17} height={9} />))}
        <g className={`conversation-falling ${landed ? 'is-landed' : ''}`} style={{ color:piece.color }}>
          {cells.map(([x, y], i) => <IsoBlock key={i} {...point(x, y)} color={piece.color} size={17} height={13} />)}
        </g>
        <text x="370" y="220" textAnchor="end" fill={piece.color} fontSize="10" fontFamily="inherit">{landed ? 'LINE COMPLETE. MESSAGE READY.' : 'ONE SPACE. YOUR POSSIBILITY.'}</text>
      </svg>
    </div>
    <div className="conversation-options" role="group" aria-label="Choose a conversation">{prompts.map((p, i) => <button key={p.title} aria-pressed={i === selected} onClick={() => reset(i)}><b aria-hidden="true"><svg viewBox="0 0 56 44" width="42" height="34">{PIECES[p.piece].rotations[0].map(([x,y],j)=><rect key={j} x={x*12+2} y={y*12+2} width="10" height="10" fill={PIECES[p.piece].color} />)}</svg></b><span>{p.title}</span><i aria-hidden="true">{i === selected ? '◆' : '+'}</i></button>)}</div>
    <div className="conversation-actions"><button onClick={() => { reset(); setRotation((rotation + 1) % 4); }} aria-label="Rotate your conversation piece">↻ Rotate</button><button onClick={landed ? () => reset() : drop}>{landed ? 'Try another fit ↶' : 'Drop & start a message ↓'}</button></div>
    <p className="conversation-note" role="status">{landed ? 'The form is ready. Your own draft stays safe; send when ready.' : 'A starting message, ready for your own words.'}</p>
  </aside>;
}
