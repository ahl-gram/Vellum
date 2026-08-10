/**
 * The tier ladder (#239, #237 GO condition 2): building masses from kind
 * and score, to the spike's second state (PR #342). Five tiers, packed
 * front and back rows, verticals rising from front-row slots, a keep for
 * capital and seat, and the curtain wall. The mapping is frozen: the same
 * site always composes the same skyline.
 */

import type { Rng } from "../core/rng.ts";
import type { ProspectKind } from "./input.ts";
import {
  BACK_ROW_RAISE,
  VIEW_X0,
  VIEW_X1,
  WALLED_KEEP_RAISE,
  groundAt,
  type Ground,
  type Mass,
  type WallSegment,
} from "./geometry.ts";

type Tier = {
  readonly n: number;
  readonly hMin: number;
  readonly hMax: number;
  readonly spires: number;
  readonly keepW: number;
  readonly walled: boolean;
};

/** The five-tier ladder, from the spike's ratified townscape() table. */
const TIERS: Record<ProspectKind, Tier> = {
  capital: { n: 11, hMin: 16, hMax: 30, spires: 3, keepW: 34, walled: true },
  seat: { n: 9, hMin: 14, hMax: 25, spires: 2, keepW: 26, walled: true },
  town: { n: 9, hMin: 13, hMax: 23, spires: 2, keepW: 0, walled: true },
  village: { n: 5, hMin: 10, hMax: 16, spires: 1, keepW: 0, walled: false },
  hamlet: { n: 3, hMin: 9, hMax: 13, spires: 0, keepW: 0, walled: false },
};

/** Typical raw scores per tier (sites run ~0.3-8, hamlets sit on a slimmer
 * scale capped near 2; see input.ts). Score modulates WITHIN a kind. */
const TYPICAL_SCORE: Record<ProspectKind, number> = {
  capital: 6,
  seat: 4.5,
  town: 3.5,
  village: 1.8,
  hamlet: 1.2,
};

/** Score factor, clamped so tiers stay legible: an exceptional village never
 * out-masses a poor town's floor. */
function scoreFactor(kind: ProspectKind, score: number): number {
  return Math.min(1.25, Math.max(0.75, score / TYPICAL_SCORE[kind]));
}

const KEEP_TALL_BONUS = 16;
const KEEP_SHORT_BONUS = 10;
/** Verticals ride above the roofline by a bonus dominated by the score's
 * height scale, keeping "higher score composes taller" true for every draw
 * (the random span 6 is smaller than the +-10% the scale can move). */
const VERTICAL_BONUS = 10;
const VERTICAL_JITTER = 6;
const WALL_MARGIN = 12;

export type Townscape = {
  readonly masses: ReadonlyArray<Mass>;
  readonly walls: ReadonlyArray<WallSegment>;
  readonly front: ReadonlyArray<Mass>;
  readonly runX0: number;
  readonly runX1: number;
};

function packRow(
  rng: Rng,
  n: number,
  hMin: number,
  hMax: number,
  hScale: number,
  ruined: boolean,
): Array<{ x: number; w: number; h: number; form: "gable" | "ridge"; broken: boolean }> {
  const row: Array<{ x: number; w: number; h: number; form: "gable" | "ridge"; broken: boolean }> = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    const w = 15 + rng.next() * 13;
    const h = (hMin + rng.next() * (hMax - hMin)) * hScale;
    const form = rng.next() < 0.55 ? "gable" : "ridge";
    const broken = ruined && rng.next() < 0.85;
    row.push({ x, w, h, form, broken });
    x += w * (0.62 + rng.next() * 0.28);
  }
  const last = row[row.length - 1]!;
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  const shift = cx - (last.x + last.w) / 2;
  return row.map((b) => ({ ...b, x: b.x + shift }));
}

/**
 * Compose the townscape for one site. `fen` drops the wall (nothing walls a
 * fen town). Masses return in paint order: back row, keep, front row,
 * verticals; walls paint between the back row and the keep.
 */
export function composeTownscape(
  kind: ProspectKind,
  score: number,
  ruined: boolean,
  fen: boolean,
  ground: Ground,
  rng: Rng,
): Townscape {
  const tier = TIERS[kind];
  const f = scoreFactor(kind, score);
  const n = Math.max(2, Math.min(tier.n + 2, Math.max(tier.n - 2, Math.round(tier.n * f))));
  const hs = 0.9 + (f - 0.75) * 0.4;
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  const g = (x: number): number => groundAt(ground, x);

  const backRow = packRow(rng, Math.round(n * 0.6), tier.hMin, tier.hMax, 0.8 * hs, ruined);
  const frontRow = packRow(rng, n, tier.hMin, tier.hMax, hs, ruined);
  const first = frontRow[0]!;
  const lastB = frontRow[frontRow.length - 1]!;
  const runX0 = first.x - WALL_MARGIN;
  const runX1 = lastB.x + lastB.w + WALL_MARGIN;

  const verticals: Mass[] = [];
  for (let i = 0; i < tier.spires; i++) {
    const slot = frontRow[Math.floor(rng.next() * frontRow.length)]!;
    const form: Mass["form"] = i === 0 ? "spire" : rng.next() < 0.5 ? "tower" : "spire";
    const x = slot.x + slot.w * 0.2;
    const w = 9 + rng.next() * 4;
    const h = (tier.hMax + VERTICAL_BONUS + rng.next() * VERTICAL_JITTER) * hs;
    const broken = ruined && rng.next() < 0.8;
    verticals.push({ form, x, w, h, base: g(x + w / 2), raise: 0, broken });
  }

  const walled = tier.walled && !fen;
  let keep: Mass | null = null;
  if (tier.keepW > 0) {
    const w = tier.keepW;
    const h = (tier.hMax + (w > 30 ? KEEP_TALL_BONUS : KEEP_SHORT_BONUS)) * hs;
    const raise = walled ? WALLED_KEEP_RAISE : 0;
    const broken = ruined && rng.next() < 0.6;
    keep = { form: "keep", x: cx - w / 2, w, h, base: g(cx) - raise, raise, broken };
  }

  // GROUNDING INVARIANT (#237 GO condition 8, the spike's twice-seen failure
  // class): a back-row mass is raised for depth, so it may exist ONLY where
  // the packed front row fully covers it; anywhere else its raised base
  // reads as a floating building. Packing keeps the front span one
  // contiguous interval, so containment is the whole check, and
  // groundingViolations() re-verifies the class on the finished geometry.
  const back: Mass[] = backRow
    .map((b) => ({ ...b, x: b.x + 6 }))
    .filter((b) => b.x >= first.x && b.x + b.w <= lastB.x + lastB.w)
    .map((b) => ({
      form: b.form,
      x: b.x,
      w: b.w,
      h: b.h,
      base: g(b.x + b.w / 2) - BACK_ROW_RAISE,
      raise: BACK_ROW_RAISE,
      broken: b.broken,
    }));

  const front: Mass[] = frontRow.map((b) => ({
    form: b.form,
    x: b.x,
    w: b.w,
    h: b.h,
    base: g(b.x + b.w / 2),
    raise: 0,
    broken: b.broken,
  }));

  let masses: Mass[] = [...back, ...(keep ? [keep] : []), ...front, ...verticals];
  // A ruined skyline must SHOW ruin: if every per-mass draw came up intact,
  // break the tallest front mass (correctness insurance, rarely taken).
  if (ruined && !masses.some((m) => m.broken)) {
    let tallest = 0;
    front.forEach((m, i) => {
      if (m.h > front[tallest]!.h) tallest = i;
    });
    const target = front[tallest]!;
    masses = masses.map((m) => (m === target ? { ...m, broken: true } : m));
  }

  const walls: WallSegment[] = [];
  if (walled && !ruined) {
    walls.push({ x0: runX0, x1: runX1, h: kind === "capital" ? 13 : 10, gate: true, heel: 0 });
  }
  if (walled && ruined) {
    // The broken wall: two stubs hugging the run, the right one heeling over.
    walls.push({ x0: runX0, x1: runX0 + 44, h: 9, gate: false, heel: 0 });
    walls.push({ x0: runX1 - 38, x1: runX1, h: 8, gate: false, heel: -5 });
  }

  return { masses, walls, front, runX0, runX1 };
}
