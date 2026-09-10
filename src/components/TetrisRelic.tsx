/** Four extruded CSS cubes; no extra WebGL context or downloaded 3D asset. */
export function TetrisRelic() {
  return (
    <div className="tetris-relic" aria-hidden="true">
      <div className="relic-piece">
        {[
          [0, 0],
          [1, 0],
          [2, 0],
          [1, 1],
        ].map(([x, y], i) => (
          <span
            className="relic-cube"
            key={i}
            style={{ left: x * 20, top: y * 20 }}
          >
            <i />
            <i />
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}
