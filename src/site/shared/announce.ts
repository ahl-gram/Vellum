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
  const hold = deps.holdMs ?? SAY_HOLD_MS;
  const fade = deps.fadeMs ?? SAY_FADE_MS;
  let booked: T | null = null;
  const unbook = (): void => {
    if (booked !== null) deps.cancel(booked);
    booked = null;
  };
  return (line: string): void => {
    unbook();
    deps.pill.classList.remove(FADING);
    deps.pill.textContent = line;
    if (line === "") return;
    booked = deps.after(() => {
      booked = null;
      if (deps.pill.textContent !== line) return;
      deps.pill.classList.add(FADING);
      booked = deps.after(() => {
        booked = null;
        if (deps.pill.textContent === line) deps.pill.textContent = "";
        deps.pill.classList.remove(FADING);
      }, fade);
    }, hold);
  };
}
