// Types for the parts of verso.js consumed from TypeScript. Only buildDocket (the
// pure docket-string builder) is unit-tested and imported by a .ts, so only it is
// declared here; renderVerso / toggleFlip / isFlipped touch the DOM and are consumed
// solely by the untyped browser conductor (app.js), verified by e2e + a CDP probe.
// Keeping this DOM-free lets the project tsconfig (no "dom" lib) type-check the test.

export interface DocketFields {
  /** The world's seed (the chart number). */
  seed: number;
  /** The chart's title. */
  title: string;
  /** The world's present year. */
  presentYear: number;
  /** The capital's name, when the world has one (omitted otherwise). */
  capital?: string;
}

/** The docket line stamped along the fold: chart number, title, year, and capital. */
export function buildDocket(o: DocketFields): string;
