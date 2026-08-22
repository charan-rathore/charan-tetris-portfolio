import {
  collapseRows,
  collides,
  fullRows,
  ghostY,
  gravityMs,
  isGrounded,
  lockedOut,
  mergePiece,
  shuffledBag,
  tryRotate,
} from "./engine";
import {
  ActivePiece,
  Board,
  GameStatus,
  PIECES,
  PieceName,
  createBoard,
  spawnPiece,
} from "./types";

/** Input tuning. DAS/ARR values picked for a snappy, guideline-adjacent feel. */
const DAS_MS = 140;
const ARR_MS = 33;
const SOFT_DROP_MS = 30;
const LOCK_DELAY_MS = 500;
const MAX_LOCK_RESETS = 15;
const CLEAR_DELAY_MS = 300;

const CLEAR_POINTS = [0, 100, 300, 500, 800];

export type GameEvent =
  | { type: "start" }
  | { type: "move" }
  | { type: "rotate"; kicked: boolean }
  | { type: "softstep" }
  | { type: "harddrop"; distance: number; cells: ReadonlyArray<readonly [number, number]> }
  | { type: "lock"; cells: ReadonlyArray<readonly [number, number]>; color: string }
  | {
      type: "clear";
      rows: number[];
      lines: number;
      points: number;
      combo: number;
      backToBack: boolean;
    }
  | { type: "hold" }
  | { type: "levelup"; level: number }
  | { type: "gameover"; score: number };

export type GameSnapshot = {
  status: GameStatus;
  score: number;
  lines: number;
  level: number;
  combo: number;
  queue: PieceName[];
  hold: PieceName | null;
  canHold: boolean;
};

/**
 * Guideline-style Tetris state machine, framework-free.
 * Drive it with update(dt) from a rAF loop; render from public fields.
 */
export class TetrisGame {
  board: Board = createBoard();
  active: ActivePiece | null = null;
  status: GameStatus = "ready";
  score = 0;
  lines = 0;
  level = 1;
  combo = -1;
  hold: PieceName | null = null;
  canHold = true;
  queue: PieceName[] = [];
  clearingRows: number[] = [];
  /** 0 → 1 progress of the line clear animation. */
  clearProgress = 0;

  private events: GameEvent[] = [];
  private gravityAcc = 0;
  private lockTimer = 0;
  private lockResets = 0;
  private wasGrounded = false;
  private clearTimer = 0;
  private lastClearWasTetris = false;

  private dasDirection: -1 | 0 | 1 = 0;
  private dasTimer = 0;
  private arrTimer = 0;
  private softHeld = false;

  private onChangeCallback: (() => void) | null = null;

  onChange(callback: () => void) {
    this.onChangeCallback = callback;
  }

  private notify() {
    this.onChangeCallback?.();
  }

  private emit(event: GameEvent) {
    this.events.push(event);
  }

  drainEvents(): GameEvent[] {
    if (this.events.length === 0) return [];
    const drained = this.events;
    this.events = [];
    return drained;
  }

  snapshot(): GameSnapshot {
    return {
      status: this.status,
      score: this.score,
      lines: this.lines,
      level: this.level,
      combo: this.combo,
      queue: this.queue.slice(0, 3),
      hold: this.hold,
      canHold: this.canHold,
    };
  }

  ghostRow(): number {
    return this.active ? ghostY(this.board, this.active) : 0;
  }

  start() {
    this.board = createBoard();
    this.queue = [...shuffledBag(), ...shuffledBag()];
    this.hold = null;
    this.canHold = true;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = -1;
    this.lastClearWasTetris = false;
    this.clearingRows = [];
    this.gravityAcc = 0;
    this.dasDirection = 0;
    this.softHeld = false;
    this.status = "playing";
    this.spawnNext();
    this.emit({ type: "start" });
    this.notify();
  }

  togglePause() {
    if (this.status === "playing") {
      this.status = "paused";
      this.notify();
    } else if (this.status === "paused") {
      this.status = "playing";
      this.notify();
    }
  }

  private spawnNext() {
    if (this.queue.length < 7) this.queue.push(...shuffledBag());
    const name = this.queue.shift()!;
    const piece = spawnPiece(name);
    this.canHold = true;
    this.gravityAcc = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.wasGrounded = false;
    if (collides(this.board, piece)) {
      this.active = piece;
      this.gameOver();
      return;
    }
    this.active = piece;
    this.notify();
  }

  private gameOver() {
    this.status = "over";
    this.emit({ type: "gameover", score: this.score });
    this.notify();
  }

  // ── Input ──────────────────────────────────────────────────────────────

  pressMove(direction: -1 | 1) {
    if (this.dasDirection === direction) return;
    this.dasDirection = direction;
    this.dasTimer = 0;
    this.arrTimer = 0;
    this.stepHorizontal(direction);
  }

  releaseMove(direction: -1 | 1) {
    if (this.dasDirection === direction) this.dasDirection = 0;
  }

  pressSoft() {
    this.softHeld = true;
  }

  releaseSoft() {
    this.softHeld = false;
  }

  rotate(clockwise: boolean) {
    if (this.status !== "playing" || !this.active) return;
    const result = tryRotate(this.board, this.active, clockwise);
    if (!result) return;
    this.active = result.piece;
    this.onSuccessfulShift();
    this.emit({ type: "rotate", kicked: result.kicked });
  }

  hardDrop() {
    if (this.status !== "playing" || !this.active) return;
    const targetY = ghostY(this.board, this.active);
    const distance = targetY - this.active.y;
    this.active = { ...this.active, y: targetY };
    this.score += distance * 2;
    this.emit({
      type: "harddrop",
      distance,
      cells: PIECES[this.active.name].rotations[this.active.rot].map(
        ([cx, cy]) => [this.active!.x + cx, this.active!.y + cy] as const,
      ),
    });
    this.lockActive();
  }

  holdSwap() {
    if (this.status !== "playing" || !this.active || !this.canHold) return;
    const current = this.active.name;
    if (this.hold) {
      const swapped = spawnPiece(this.hold);
      this.hold = current;
      if (collides(this.board, swapped)) {
        this.active = swapped;
        this.gameOver();
        return;
      }
      this.active = swapped;
      this.gravityAcc = 0;
      this.lockTimer = 0;
      this.lockResets = 0;
      this.wasGrounded = false;
    } else {
      this.hold = current;
      this.spawnNext();
    }
    this.canHold = false;
    this.emit({ type: "hold" });
    this.notify();
  }

  // ── Simulation ─────────────────────────────────────────────────────────

  update(dt: number) {
    if (this.status === "clearing") {
      this.clearTimer += dt;
      this.clearProgress = Math.min(this.clearTimer / CLEAR_DELAY_MS, 1);
      if (this.clearTimer >= CLEAR_DELAY_MS) {
        this.board = collapseRows(this.board, this.clearingRows);
        this.clearingRows = [];
        this.status = "playing";
        this.spawnNext();
      }
      return;
    }
    if (this.status !== "playing" || !this.active) return;

    this.updateHorizontal(dt);
    this.updateGravity(dt);
  }

  private updateHorizontal(dt: number) {
    if (this.dasDirection === 0) return;
    this.dasTimer += dt;
    if (this.dasTimer < DAS_MS) return;
    this.arrTimer += dt;
    while (this.arrTimer >= ARR_MS) {
      this.arrTimer -= ARR_MS;
      if (!this.stepHorizontal(this.dasDirection)) {
        this.arrTimer = 0;
        break;
      }
    }
  }

  private stepHorizontal(direction: -1 | 1): boolean {
    if (this.status !== "playing" || !this.active) return false;
    const candidate = { ...this.active, x: this.active.x + direction };
    if (collides(this.board, candidate)) return false;
    this.active = candidate;
    this.onSuccessfulShift();
    this.emit({ type: "move" });
    return true;
  }

  /** Move-reset lock delay, capped so pieces cannot stall forever. */
  private onSuccessfulShift() {
    if (!this.active) return;
    if (isGrounded(this.board, this.active) || this.wasGrounded) {
      if (this.lockResets < MAX_LOCK_RESETS) {
        this.lockResets += 1;
        this.lockTimer = 0;
      }
    }
    this.gravityAcc = Math.min(this.gravityAcc, gravityMs(this.level) * 0.5);
  }

  private updateGravity(dt: number) {
    if (!this.active) return;
    const grounded = isGrounded(this.board, this.active);

    if (grounded) {
      this.wasGrounded = true;
      this.lockTimer += dt;
      if (this.lockTimer >= LOCK_DELAY_MS) this.lockActive();
      return;
    }

    const interval = this.softHeld
      ? Math.min(gravityMs(this.level) / 20, SOFT_DROP_MS)
      : gravityMs(this.level);
    this.gravityAcc += dt;
    let falling: ActivePiece | null = this.active;
    while (this.gravityAcc >= interval && falling) {
      this.gravityAcc -= interval;
      const candidate: ActivePiece = { ...falling, y: falling.y + 1 };
      if (collides(this.board, candidate)) break;
      falling = candidate;
      this.active = candidate;
      if (this.softHeld) {
        this.score += 1;
        this.emit({ type: "softstep" });
      }
      if (isGrounded(this.board, candidate)) {
        this.lockTimer = 0;
        break;
      }
    }
  }

  private lockActive() {
    if (!this.active) return;
    const piece = this.active;
    const color = PIECES[piece.name].color;
    const cells = PIECES[piece.name].rotations[piece.rot].map(
      ([cx, cy]) => [piece.x + cx, piece.y + cy] as const,
    );
    this.board = mergePiece(this.board, piece, color);
    this.active = null;
    this.emit({ type: "lock", cells, color });

    if (lockedOut(piece)) {
      this.gameOver();
      return;
    }

    const rows = fullRows(this.board);
    if (rows.length > 0) {
      this.applyClearScore(rows.length);
      this.clearingRows = rows;
      this.clearTimer = 0;
      this.clearProgress = 0;
      this.status = "clearing";
      this.emit({
        type: "clear",
        rows,
        lines: rows.length,
        points: this.lastClearPoints,
        combo: this.combo,
        backToBack: this.lastClearWasBackToBack,
      });
      this.notify();
      return;
    }

    this.combo = -1;
    this.notify();
    this.spawnNext();
  }

  private lastClearPoints = 0;
  private lastClearWasBackToBack = false;

  private applyClearScore(count: number) {
    this.combo += 1;
    const backToBack = count === 4 && this.lastClearWasTetris;
    let points = CLEAR_POINTS[count] * this.level;
    if (backToBack) points = Math.floor(points * 1.5);
    if (this.combo > 0) points += 50 * this.combo * this.level;
    this.score += points;
    this.lastClearPoints = points;
    this.lastClearWasBackToBack = backToBack;
    this.lastClearWasTetris = count === 4;

    this.lines += count;
    const nextLevel = Math.floor(this.lines / 10) + 1;
    if (nextLevel > this.level) {
      this.level = nextLevel;
      this.emit({ type: "levelup", level: nextLevel });
    }
  }
}
