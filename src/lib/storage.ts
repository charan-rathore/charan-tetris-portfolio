/** localStorage helpers that never throw and broadcast updates for useSyncExternalStore. */

export function readStoredNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredNumber(key: string, value: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(value));
    window.dispatchEvent(new Event(`${key}-updated`));
  } catch {
    // Storage unavailable (private mode, quota) · silently skip persistence.
  }
}

export function readStoredString(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredString(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(`${key}-updated`));
  } catch {
    // Storage unavailable (private mode, quota) · silently skip persistence.
  }
}
