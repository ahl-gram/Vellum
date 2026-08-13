/** Coordinates are NOT rounded here: dressing rounds at SVG emit, and groundingViolations relies on exact equality. */

export type Pt = { readonly x: number; readonly y: number };

/** A placed decoration: position plus the glyph's local scale. */
export type XYS = { readonly x: number; readonly y: number; readonly s: number };

export const PLATE_W = 520;
export const PLATE_H = 384;
export const PLATE_MARGIN = 23;
export const VIEW_X0 = PLATE_MARGIN;
export const VIEW_X1 = PLATE_W - PLATE_MARGIN;
export const BASE_GROUND = 232;
export const RIVER_BANK_DROP = 12;
export const SHORE_DROP = 6;
export const WATER_BOTTOM = 276;
export const BACK_ROW_RAISE = 8;
export const WALLED_KEEP_RAISE = 4;
export const MOUND_HALF_SPAN = 200;
export const MOUND_MAX_RISE = 56;
export const RIDGE_SCALE = 140;
export const RIDGE_MIN_RISE = 0.02;
export const GROUND_SAMPLE_STEP = 8;

export type MassForm = "gable" | "ridge" | "tower" | "spire" | "keep";

/** base is the y of the mass's foot; raise is how far above the ground function that foot deliberately sits. */
export type Mass = {
  readonly form: MassForm;
  readonly x: number;
  readonly w: number;
  readonly h: number;
  readonly base: number;
  readonly raise: number;
  readonly broken: boolean;
};

/** Feet follow the ground function; heel is a lean in degrees, nonzero only on a ruined stub. */
export type WallSegment = {
  readonly x0: number;
  readonly x1: number;
  readonly h: number;
  readonly gate: boolean;
  readonly heel: number;
};

export type Ground = {
  readonly base: number;
  readonly rise: number;
  readonly line: ReadonlyArray<Pt>;
};

export type WaterKind = "sea" | "river" | "drowned";
export type Water = { readonly kind: WaterKind; readonly y0: number; readonly y1: number };

export type ForegroundElement =
  | { readonly kind: "fieldRows"; readonly rows: ReadonlyArray<{ readonly y: number; readonly x0: number; readonly x1: number }> }
  | { readonly kind: "scrubRows"; readonly rows: ReadonlyArray<{ readonly y: number; readonly x0: number; readonly x1: number }> }
  | { readonly kind: "trees"; readonly species: "round" | "pine" | "palm"; readonly items: ReadonlyArray<XYS> }
  | { readonly kind: "marshTufts"; readonly items: ReadonlyArray<XYS> }
  | { readonly kind: "dunes"; readonly items: ReadonlyArray<XYS> }
  | { readonly kind: "ripples"; readonly items: ReadonlyArray<XYS> }
  | { readonly kind: "stilts"; readonly posts: ReadonlyArray<Pt> }
  | {
      readonly kind: "quay";
      readonly x0: number;
      readonly x1: number;
      readonly y: number;
      readonly bollards: ReadonlyArray<number>;
      readonly steps: { readonly x: number; readonly y: number; readonly count: number };
      readonly arcade: { readonly x0: number; readonly x1: number; readonly arches: number };
    }
  | { readonly kind: "mastRow"; readonly masts: ReadonlyArray<{ readonly x: number; readonly hullY: number; readonly mastH: number }> }
  | { readonly kind: "ship"; readonly x: number; readonly y: number; readonly s: number }
  | { readonly kind: "mole"; readonly rootX: number; readonly headX: number; readonly headY: number }
  | { readonly kind: "beachedHulls"; readonly hulls: ReadonlyArray<{ readonly x: number; readonly y: number; readonly tilt: number }> }
  | { readonly kind: "jetty"; readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number; readonly posts: ReadonlyArray<Pt> }
  | { readonly kind: "nets"; readonly x: number; readonly y: number }
  | {
      readonly kind: "bridge";
      readonly x0: number;
      readonly x1: number;
      readonly deckY: number;
      readonly waterY: number;
      readonly arches: number;
      readonly gateTower: Mass;
    }
  | { readonly kind: "weir"; readonly x0: number; readonly x1: number; readonly y: number }
  | { readonly kind: "mill"; readonly house: Mass; readonly wheel: { readonly cx: number; readonly cy: number; readonly r: number } }
  | { readonly kind: "rubble"; readonly stones: ReadonlyArray<XYS> }
  | { readonly kind: "beams"; readonly items: ReadonlyArray<{ readonly x: number; readonly y: number; readonly dx: number; readonly dy: number }> }
  | { readonly kind: "drownedStubs"; readonly stubs: ReadonlyArray<{ readonly x: number; readonly w: number; readonly h: number; readonly base: number; readonly tilt: number }> }
  | { readonly kind: "birds"; readonly items: ReadonlyArray<XYS> }
  | { readonly kind: "seaSerpent"; readonly x: number; readonly y: number; readonly s: number };

export type ProspectGeometry = {
  readonly seed: number;
  readonly index: number;
  readonly ground: Ground;
  readonly ridge: ReadonlyArray<Pt> | null;
  readonly water: Water | null;
  readonly masses: ReadonlyArray<Mass>;
  readonly walls: ReadonlyArray<WallSegment>;
  readonly foreground: ReadonlyArray<ForegroundElement>;
};

export function groundAt(ground: Pick<Ground, "base" | "rise">, x: number): number {
  if (ground.rise === 0) return ground.base;
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  const dx = (x - cx) / MOUND_HALF_SPAN;
  const t = Math.max(0, 1 - dx * dx);
  return ground.base - ground.rise * t * t;
}

const EPS = 1e-6;

type Interval = { readonly x0: number; readonly x1: number };

function mergeIntervals(spans: Interval[]): Interval[] {
  const sorted = [...spans].sort((a, b) => a.x0 - b.x0);
  const out: Interval[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.x0 <= last.x1 + EPS) {
      out[out.length - 1] = { x0: last.x0, x1: Math.max(last.x1, s.x1) };
    } else {
      out.push(s);
    }
  }
  return out;
}

function covered(cover: ReadonlyArray<Interval>, x0: number, x1: number): boolean {
  return cover.some((c) => x0 >= c.x0 - EPS && x1 <= c.x1 + EPS);
}

export function groundingViolations(g: ProspectGeometry): string[] {
  const out: string[] = [];
  for (const p of g.ground.line) {
    if (Math.abs(p.y - groundAt(g.ground, p.x)) > EPS) {
      out.push(`ground line point at x=${p.x} disagrees with groundAt`);
    }
  }
  for (const [i, m] of g.masses.entries()) {
    const gy = groundAt(g.ground, m.x + m.w / 2);
    if (Math.abs(m.base - (gy - m.raise)) > EPS) {
      out.push(`mass ${i} (${m.form}) floats: base ${m.base}, ground ${gy}, raise ${m.raise}`);
    }
  }
  const cover = mergeIntervals([
    ...g.masses.filter((m) => m.raise === 0).map((m) => ({ x0: m.x, x1: m.x + m.w })),
    ...g.walls.map((w) => ({ x0: w.x0, x1: w.x1 })),
  ]);
  for (const [i, m] of g.masses.entries()) {
    if (m.raise > 0 && !covered(cover, m.x, m.x + m.w)) {
      out.push(`mass ${i} (${m.form}) is depth-raised outside the front cover`);
    }
  }
  return out;
}
