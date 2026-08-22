/**
 * Core Tetris data: board dimensions, piece definitions with all four SRS
 * rotation states, and SRS wall-kick tables.
 *
 * Coordinates: x grows right, y grows DOWN. Row 0 is the top of the hidden
 * spawn zone; visible play area is rows HIDDEN_ROWS .. ROWS-1.
 */

export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 2;
export const ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

export type PieceName = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type CellOffset = readonly [number, number];

export type ActivePiece = {
  name: PieceName;
  /** Board column of the piece bounding-box origin. */
  x: number;
  /** Board row of the piece bounding-box origin. */
  y: number;
  /** Rotation state: 0 spawn, 1 CW, 2 180°, 3 CCW. */
  rot: 0 | 1 | 2 | 3;
};

export type GameStatus = "ready" | "playing" | "clearing" | "paused" | "over";

/** Board cell: null = empty, string = locked block color. Indexed [y][x]. */
export type Board = (string | null)[][];

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
}

export const PIECE_COLORS: Record<PieceName, string> = {
  I: "#00e0ff",
  O: "#ffd500",
  T: "#b968ff",
  S: "#3ee66c",
  Z: "#ff4d5e",
  J: "#4d7cff",
  L: "#ff9f2e",
};

type PieceDefinition = {
  color: string;
  /** Four rotation states, each four [x, y] offsets within the bounding box. */
  rotations: readonly (readonly CellOffset[])[];
};

/** Rotate a cell clockwise inside an n×n bounding box (screen coords, y down). */
function rotateCW(cells: readonly CellOffset[], size: number): CellOffset[] {
  return cells.map(([x, y]) => [size - 1 - y, x] as const);
}

function buildRotations(
  spawn: readonly CellOffset[],
  size: number,
): readonly (readonly CellOffset[])[] {
  const r0 = spawn;
  const r1 = rotateCW(r0, size);
  const r2 = rotateCW(r1, size);
  const r3 = rotateCW(r2, size);
  return [r0, r1, r2, r3];
}

export const PIECES: Record<PieceName, PieceDefinition> = {
  I: {
    color: PIECE_COLORS.I,
    rotations: buildRotations(
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      4,
    ),
  },
  O: {
    color: PIECE_COLORS.O,
    // O never changes shape when rotated; all states identical.
    rotations: [
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
    ],
  },
  T: {
    color: PIECE_COLORS.T,
    rotations: buildRotations(
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      3,
    ),
  },
  S: {
    color: PIECE_COLORS.S,
    rotations: buildRotations(
      [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      3,
    ),
  },
  Z: {
    color: PIECE_COLORS.Z,
    rotations: buildRotations(
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      3,
    ),
  },
  J: {
    color: PIECE_COLORS.J,
    rotations: buildRotations(
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      3,
    ),
  },
  L: {
    color: PIECE_COLORS.L,
    rotations: buildRotations(
      [
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      3,
    ),
  },
};

/**
 * SRS wall-kick tables, in GUIDELINE coordinates (positive y = UP).
 * The engine flips the y sign when applying them to our y-down board.
 * Keyed "from>to".
 */
export const KICKS_JLSTZ: Record<string, readonly CellOffset[]> = {
  "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

export const KICKS_I: Record<string, readonly CellOffset[]> = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

/** Absolute board cells occupied by a piece in its current position. */
export function pieceCells(piece: ActivePiece): CellOffset[] {
  return PIECES[piece.name].rotations[piece.rot].map(
    ([cx, cy]) => [piece.x + cx, piece.y + cy] as const,
  );
}

/** Spawn centered horizontally, fully inside the hidden zone. */
export function spawnPiece(name: PieceName): ActivePiece {
  return { name, x: 3, y: 0, rot: 0 };
}
