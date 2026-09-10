import { collides, ghostY, mergePiece, fullRows, collapseRows } from "./engine";
import { createBoard, PIECES, ROWS, COLS, type ActivePiece, type Board, type PieceName } from "./types";

export function demoBoard(level: number): Board {
  const board = createBoard();
  const colors = Object.values(PIECES).map(p => p.color);
  const well = (level * 3 + 7) % COLS;
  for (let y = ROWS-4; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (x !== well) board[y][x] = colors[(Math.floor(x/2)+y+level)%colors.length];
  }
  return board;
}

/** Enumerate legal hard drops and prefer clears, low height, and no holes. */
export function planDrop(board: Board, name: PieceName): ActivePiece | null {
  let best: ActivePiece | null = null, bestCost = Infinity;
  for (let rot = 0; rot < 4; rot++) for (let x = -2; x < COLS; x++) {
    const candidate: ActivePiece = {name, rot: rot as ActivePiece["rot"], x, y: 0};
    if (collides(board,candidate)) continue;
    candidate.y = ghostY(board,candidate);
    const locked = mergePiece(board,candidate,PIECES[name].color);
    const rows = fullRows(locked), next = collapseRows(locked,rows);
    let holes = 0; const heights: number[] = [];
    for (let col = 0; col < COLS; col++) {
      let top = ROWS;
      for (let y = 0; y < ROWS; y++) { if (next[y][col] && top === ROWS) top = y; else if (!next[y][col] && top < y) holes++; }
      heights.push(ROWS-top);
    }
    const roughness = heights.slice(1).reduce((sum,h,i)=>sum+Math.abs(h-heights[i]),0);
    const cost = holes*40 + heights.reduce((a,b)=>a+b,0)*.7 + roughness*.5 - rows.length*25;
    if (cost < bestCost) { bestCost = cost; best = candidate; }
  }
  return best;
}
