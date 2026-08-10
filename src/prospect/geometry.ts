/**
 * Prospect geometry (#239): the neutral shape vocabulary the silhouette
 * grammar composes into and Sub 3 dresses. Shapes and positions ONLY: no
 * style tokens, no ink, no SVG. Coordinates live in the spike's ratified
 * plate space (#237 GO, PR #342 second state): a 520x384 plate, ground line
 * at y 232, y growing downward.
 *
 * Determinism contract: geometry numbers come from integer-mixed RNG draws
 * (core/rng.ts) combined with +,-,*,/ only, so they are bit-identical across
 * platforms. Math.sin/cos/atan2/hypot must not creep into this layer; see
 * the same rule in transect.ts. Coordinates are NOT rounded here: Sub 3
 * rounds at SVG emit, and groundingViolations relies on exact equality.
 */

export type Pt = { readonly x: number; readonly y: number };

/** A placed decoration: position plus the glyph's local scale. */
export type XYS = { readonly x: number; readonly y: number; readonly s: number };

/** The plate frame the composition is laid out against. */
export const PLATE_W = 520;
export const PLATE_H = 384;
export const PLATE_MARGIN = 23;
export const VIEW_X0 = PLATE_MARGIN;
export const VIEW_X1 = PLATE_W - PLATE_MARGIN;
/** The flat ground line; river prospects stand on a raised bank above it
 * so the bridge reads in front of the town. */
export const BASE_GROUND = 232;
export const RIVER_BANK_DROP = 12;
/** Waterline and water-band bottom on sea plates. */
export const SHORE_DROP = 6;
export const WATER_BOTTOM = 276;
/** Depth raises: a back-row mass sits this many px above the ground line to
 * read as one street behind; a walled keep sits slightly above the wall. */
export const BACK_ROW_RAISE = 8;
export const WALLED_KEEP_RAISE = 4;
/** The seat hill (#237 GO condition 5): a quadratic mound of this half-span,
 * centered on the plate, rising MOUND_MAX px at full siteRel. */
export const MOUND_HALF_SPAN = 200;
export const MOUND_MAX_RISE = 56;
/** Backdrop ridge: vertical px per unit of relative elevation above the
 * site, and the rise below which the horizon reads flat and is omitted. */
export const RIDGE_SCALE = 140;
export const RIDGE_MIN_RISE = 0.02;
/** Ground polyline sample step, matching the spike's 8px. */
export const GROUND_SAMPLE_STEP = 8;

export type MassForm = "gable" | "ridge" | "tower" | "spire" | "keep";

/**
 * One building mass. `base` is the y of its foot; `raise` declares how far
 * above the ground function that foot deliberately sits (0 = on the ground
 * line). h is the wall height; the form's roof or spire rides on top and is
 * Sub 3's to draw from form + dimensions.
 */
export type Mass = {
  readonly form: MassForm;
  readonly x: number;
  readonly w: number;
  readonly h: number;
  readonly base: number;
  readonly raise: number;
  readonly broken: boolean;
};

/** A curtain-wall run. Feet follow the ground function between x0 and x1;
 * `heel` is a lean in degrees (nonzero only on a ruined stub). */
export type WallSegment = {
  readonly x0: number;
  readonly x1: number;
  readonly h: number;
  readonly gate: boolean;
  readonly heel: number;
};

/** The ground: a flat base with an optional centered mound. `line` is the
 * sampled polyline for rendering; groundAt() is the exact function. */
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

/**
 * A composed prospect. `masses`, `walls`, and `foreground` are in paint
 * order (back to front); within masses that is descending raise, with walls
 * painted between the back row and any walled keep, exactly the spike's
 * layering.
 */
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

/** The exact ground function: base minus the centered quadratic mound. */
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

/**
 * The structural grounding check (#237 GO condition 8). The floating class
 * appeared twice in the spike (a seat on the far ridge, a raised back-row
 * house past the front row's cover), so this guards the CLASS, not the
 * instance: every mass must stand exactly on the ground function less its
 * declared raise, and any raise above zero is legal only where the merged
 * span of on-ground masses and walls fully covers it. Returns one message
 * per violation; empty means grounded.
 */
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
