export const UNITS_PER_EM = 2048;
/** Outlines are stored on a grid of this many font units (ruling D8, the fine outline). */
export const GRID = 2;

export type FaceName = "roman" | "caps" | "italic";

/** [advance, xMin, xMax, yMin, yMax] in font units with y up, then the outline in grid units with y down. */
export type Glyph = readonly [number, number, number, number, number, string];

export type FaceTable = {
  readonly name: FaceName;
  readonly glyphs: Readonly<Record<string, Glyph>>;
  /** Longest first, each a key of glyphs. */
  readonly ligatures: ReadonlyArray<string>;
  /** Font units, keyed by the left glyph's key then the right's. */
  readonly kern: Readonly<Record<string, Readonly<Record<string, number>>>>;
};
