// The stage's announcement, which leaves on its own (#547, ruled 2026-09-13): every chart room's status pill is one aria-live region with several owners, so this holds the line for a moment, fades it, and clears it ONLY if the text it wrote is still the text standing there.

export const SAY_HOLD_MS = 8000;
export const SAY_FADE_MS = 450;
export const FADING = "fading";

export interface AnnouncePill {
  textContent: string | null;
  readonly classList: { add(token: string): void; remove(token: string): void };
}

export interface AnnounceDeps<T> {
  readonly pill: AnnouncePill;
  readonly after: (run: () => void, ms: number) => T;
  readonly cancel: (timer: T) => void;
  readonly holdMs?: number;
  readonly fadeMs?: number;
}

export function makeAnnouncer<T>(deps: AnnounceDeps<T>): (line: string) => void {
  return (line: string): void => {
    deps.pill.textContent = line;
  };
}
