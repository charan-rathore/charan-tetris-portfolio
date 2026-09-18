/**
 * The page as a Tetris well, seen from the side. Reading it is the piece
 * falling: how far down you are, and where the next stage would catch you.
 *
 * Pure geometry, so the rail's behaviour can be tested without a browser.
 */

export type Band = {
  id: string;
  label: string;
  /** Fractions of the whole descent, 0 at the top of the page, 1 at the end. */
  start: number;
  end: number;
};

/** How far down the well the reader has fallen, clamped to the track. */
export function depthOf(scrollY: number, viewport: number, pageHeight: number): number {
  const travel = pageHeight - viewport;
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / travel));
}

/**
 * Stages as bands of the track. Measured against the same travel as the
 * reader, so a stage's band lines up with the scroll that reaches it.
 */
export function bandsOf(
  stages: readonly { id: string; label: string; top: number; height: number }[],
  viewport: number,
  pageHeight: number,
): Band[] {
  const travel = Math.max(1, pageHeight - viewport);
  return stages.map(({ id, label, top, height }) => ({
    id,
    label,
    start: Math.min(1, Math.max(0, top / travel)),
    end: Math.min(1, Math.max(0, (top + height) / travel)),
  }));
}

/**
 * Where the piece would come to rest: the start of the next band below.
 * At the last band there is nothing left to fall to, so the floor is it.
 */
export function ghostOf(bands: readonly Band[], depth: number, epsilon = 0.004): number {
  const next = bands.find((band) => band.start > depth + epsilon);
  return next ? next.start : 1;
}

/** The band the reader is inside, or the last one passed. */
export function bandAt(bands: readonly Band[], depth: number): number {
  let current = 0;
  for (let index = 0; index < bands.length; index += 1) {
    if (bands[index].start <= depth) current = index;
  }
  return current;
}
