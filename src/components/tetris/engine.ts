/** Pure board/piece logic: collision, SRS rotation, clears, gravity curve. */

import {
  ActivePiece,
  Board,
  COLS,
  HIDDEN_ROWS,
  KICKS_I,
  KICKS_JLSTZ,
  PieceName,
  ROWS,
  pieceCells,
} from "./types";

const BAG: PieceName[] = ["I", "O", "T", "S", "Z", "J", "L"];

/** 7-bag randomizer: every piece exactly once per bag (Fisher–Yates). */
export function shuffledBag(): PieceName[] {
  const bag = [...BAG];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function collides(board: Board, piece: ActivePiece): boolean {
  for (const [x, y] of pieceCells(piece)) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
    if (board[y][x] !== null) return true;
  }
  return false;
}

export function isGrounded(board: Board, piece: ActivePiece): boolean {
  return collides(board, { ...piece, y: piece.y + 1 });
}

/** Lowest row this piece can drop to from its current position. */
export function ghostY(board: Board, piece: ActivePiece): number {
  let y = piece.y;
  while (!collides(board, { ...piece, y: y + 1 })) y += 1;
  return y;
}

/**
 * SRS rotation with wall kicks. Returns the rotated piece and whether a
 * non-trivial kick was used, or null if every kick position collides.
 */
export function tryRotate(
  board: Board,
  piece: ActivePiece,
  clockwise: boolean,
): { piece: ActivePiece; kicked: boolean } | null {
  const from = piece.rot;
  const to = ((from + (clockwise ? 1 : 3)) % 4) as ActivePiece["rot"];

  if (piece.name === "O") {
    // O has no kicks and an identical shape in every state.
    return { piece: { ...piece, rot: to }, kicked: false };
  }

  const table = piece.name === "I" ? KICKS_I : KICKS_JLSTZ;
  const kicks = table[`${from}>${to}`];
  for (let index = 0; index < kicks.length; index += 1) {
    const [dx, dyUp] = kicks[index];
    // Kick tables are in guideline coords (y up); our board y grows down.
    const candidate: ActivePiece = {
      ...piece,
      rot: to,
      x: piece.x + dx,
      y: piece.y - dyUp,
    };
    if (!collides(board, candidate)) {
      return { piece: candidate, kicked: index > 0 };
    }
  }
  return null;
}

/** Immutable merge of a piece into the board. */
export function mergePiece(board: Board, piece: ActivePiece, color: string): Board {
  const next = board.map((row) => [...row]);
  for (const [x, y] of pieceCells(piece)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = color;
  }
  return next;
}

export function fullRows(board: Board): number[] {
  const rows: number[] = [];
  for (let y = 0; y < ROWS; y += 1) {
    if (board[y].every((cell) => cell !== null)) rows.push(y);
  }
  return rows;
}

export function collapseRows(board: Board, rows: number[]): Board {
  const clearing = new Set(rows);
  const kept = board.filter((_, y) => !clearing.has(y));
  const fresh = Array.from({ length: rows.length }, () =>
    Array<string | null>(COLS).fill(null),
  );
  return [...fresh, ...kept];
}

/** Guideline gravity curve: (0.8 − (level−1)·0.007)^(level−1) seconds per row. */
export function gravityMs(level: number): number {
  const seconds = Math.pow(0.8 - (level - 1) * 0.007, level - 1);
  return Math.max(seconds * 1000, 16);
}

/** Lock-out rule: game over if a piece locks entirely inside the hidden zone. */
export function lockedOut(piece: ActivePiece): boolean {
  return pieceCells(piece).every(([, y]) => y < HIDDEN_ROWS);
}
