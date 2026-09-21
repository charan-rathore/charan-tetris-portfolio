/**
 * Paper peel — paper.design's circular sheet reveal, no tetromino bar.
 * A cream disc rises through the dark page like a folded page turning.
 */
export function PaperFold() {
  return (
    <div className="paper-fold" aria-hidden="true">
      <svg viewBox="0 0 960 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="paper-sheet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6edd8" />
            <stop offset="55%" stopColor="#e4d2ae" />
            <stop offset="100%" stopColor="#b89a68" />
          </linearGradient>
          <linearGradient id="paper-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="50%" stopColor="#3a2c14" stopOpacity=".18" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="480" cy="520" r="400" fill="url(#paper-sheet)" />
        <circle cx="480" cy="520" r="400" fill="url(#paper-shade)" />
        <circle cx="480" cy="520" r="400" fill="none" stroke="#8d7348" strokeWidth="1.2" />
        <circle
          className="paper-fold-arc--slow"
          cx="480" cy="520" r="400"
          fill="none"
          stroke="#5a4524"
          strokeWidth="2.2"
          strokeDasharray="28 980"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
