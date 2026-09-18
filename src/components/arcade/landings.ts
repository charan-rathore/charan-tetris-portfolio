/**
 * Rows the piece can land on. Driving the page from the keyboard steps
 * between these: every stage of the page, and every project inside the stack.
 *
 * The geometry lives here as a pure function so the stepping rules can be
 * tested without a browser.
 */

/** Stages and project cards, returned by the browser in document order. */
export const LANDING_SELECTOR = "main > section[id], .project-card";

/**
 * How far a row can sit from its resting place and still count as the row you
 * are on · without it, a pixel of drift would make one press step twice.
 */
export const LANDING_EPSILON = 24;

/**
 * The row to step to, given each row's top edge measured from where scrolling
 * to it would leave it, or null when the board ends in that direction · the
 * caller then leaves the keypress to the browser so the page still scrolls.
 */
export function landingTarget(
  offsets: readonly number[],
  direction: 1 | -1,
  epsilon: number = LANDING_EPSILON,
): number | null {
  if (direction === 1) {
    const index = offsets.findIndex((offset) => offset > epsilon);
    return index === -1 ? null : index;
  }
  for (let index = offsets.length - 1; index >= 0; index -= 1) {
    if (offsets[index] < -epsilon) return index;
  }
  return null;
}

/** The row currently at rest, used as the origin for sideways moves. */
export function currentLanding(offsets: readonly number[], epsilon: number = LANDING_EPSILON): number {
  let current = 0;
  for (let index = 0; index < offsets.length; index += 1) {
    if (offsets[index] <= epsilon) current = index;
  }
  return current;
}

/** Trim a heading down to something worth announcing in the HUD. */
export function shortLabel(text: string, limit = 42): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit - 1).trimEnd()}…` : clean;
}
