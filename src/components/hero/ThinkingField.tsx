export function ThinkingField() {
  const rows = ["00001111110000","00111111111100","01110111011110","11101101110111","11111011101111","11101110111011","01111101111110","00111111111100","00011100111000"];
  return <div className="thinking-field">
    <svg viewBox="0 0 560 170" role="img" aria-label="A mind made of interlocking ideas, connecting curiosity to building, testing and shipping">
      <defs><pattern id="thought-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#233146" strokeWidth=".5" /></pattern></defs>
      <rect width="560" height="170" fill="url(#thought-grid)" />
      <g className="thought-brain">{rows.flatMap((row,y)=>[...row].map((cell,x)=>cell==='1'?<rect key={`${x}-${y}`} x={x*12+155} y={y*12+21} width="10" height="10" fill={['#00e0ff','#b968ff','#ffd500'][(x+Math.floor(y/3))%3]} opacity={.35+((x+y)%4)*.2} />:null))}</g>
      <g fill="none" strokeWidth="2"><path className="thought-wire" d="M35 44H116V80H152M328 55H394V30H522" stroke="#00e0ff"/><path className="thought-wire" d="M35 128H100V112H166M328 100H421V137H522" stroke="#b968ff"/></g>
      <g fill="#070c16" stroke="#456078"><rect x="18" y="29" width="68" height="30"/><rect x="18" y="113" width="68" height="30"/><rect x="450" y="15" width="88" height="30"/><rect x="450" y="122" width="88" height="30"/></g>
      <g fill="#cad7eb" fontSize="10" fontFamily="monospace"><text x="28" y="48">ASK WHY</text><text x="29" y="132">CONNECT</text><text x="460" y="34">MAKE IT REAL</text><text x="464" y="141">TEST · SHIP</text><text x="182" y="158" fill="#7c94b3">CURIOSITY → CAPABILITY</text></g>
    </svg>
    <span className="pixel-label">A MIND IN MOTION. EVERY IDEA FINDS ITS FIT.</span>
  </div>;
}
