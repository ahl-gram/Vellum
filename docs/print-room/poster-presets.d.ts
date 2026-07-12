// Types for poster-presets.js, consumed from TypeScript by the unit tests
// (test/print-room/poster-presets.test.ts, test/cli/poster-parity.test.ts). The module
// is pure + DOM-free, so the project tsconfig (no "dom" lib) type-checks it; the worker
// and download wiring lives in app.js and is verified by the print-room e2e (PR10-PR15).

export interface PosterPreset {
  /** Stable key carried on the button's data-poster attribute. */
  key: string;
  /** Human label on the plate button. */
  label: string;
  /** Render width in pixels; also the clamp envelope bound. */
  width: number;
}

/** Desk 2400 / Wall 3300 / Grand 4200. Grand is the old CLI poster width. */
export const POSTER_PRESETS: PosterPreset[];

/** Bound any width to the [Desk, Grand] envelope; a non-number falls back to Grand. */
export function clampPosterWidth(w: unknown): number;

/** The self-describing artifact name: vellum-poster-{seed}-{style}-{width}.svg. */
export function posterFilename(seed: number, style: string, width: number): string;

/** The PNG twin, named by OUTPUT pixel width: vellum-poster-{seed}-{style}-{outWidth}.png. */
export function posterPngFilename(seed: number, style: string, outWidth: number): string;
