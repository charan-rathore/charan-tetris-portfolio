/** Identical extruded geometry in accelerated and software browsers. */
export function IsoBlock({ x, y, color, size = 12, height = 10, ghost = false }: { x: number; y: number; color: string; size?: number; height?: number; ghost?: boolean }) {
  const s = size, h = height;
  return <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth=".7" opacity={ghost ? .3 : 1}>
    <path d={`M0 ${-h} ${s} ${s / 2 - h} 0 ${s - h} ${-s} ${s / 2 - h}Z`} fill={ghost ? 'none' : color} />
    <path d={`M${-s} ${s / 2 - h} 0 ${s - h}V${s}L${-s} ${s / 2}Z`} fill={ghost ? 'none' : color} fillOpacity=".35" />
    <path d={`M0 ${s - h} ${s} ${s / 2 - h}V${s / 2}L0 ${s}Z`} fill={ghost ? 'none' : color} fillOpacity=".65" />
    {!ghost && <path d={`M${-s + 2} ${s / 2 - h} 0 ${2 - h} ${s - 2} ${s / 2 - h}`} stroke="white" strokeOpacity=".5" fill="none" />}
  </g>;
}
