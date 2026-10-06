export const UNITS_PER_EM = 2048;
export const GRID = 2;

export type FaceName = "roman" | "caps" | "italic";

export type Glyph = readonly [advance: number, xMin: number, xMax: number, yMin: number, yMax: number, gridPathYDown: string];

export type FaceTable = {
  readonly name: FaceName;
  readonly glyphs: Readonly<Record<string, Glyph>>;
  readonly ligatures: ReadonlyArray<string>;
  readonly kern: Readonly<Record<string, Readonly<Record<string, number>>>>;
};
