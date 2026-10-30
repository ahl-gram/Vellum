// Issue #1104 round: the size ladders drawn for the sitting, the grow-with-depth law, and the two reads the variant modules make of whichever is in force (globalThis.__marks1104, set by build.ts before each render).
import type { StyleName } from "../../../src/render/style.ts";

export type Tier = "capital" | "seat" | "town" | "village" | "hamlet" | "farmstead" | "mill";
export const TIERS: readonly Tier[] = ["capital", "seat", "town", "village", "hamlet", "farmstead", "mill"];
export type Mults = Readonly<Record<Tier, number>>;

export type Ladder = { readonly key: string; readonly name: string; readonly blurb: string; readonly mult: Mults };

const ONE: Mults = { capital: 1, seat: 1, town: 1, village: 1, hamlet: 1, farmstead: 1, mill: 1 };

// The finer marks sized by their box's larger side: today's farmstead house is 8.64 wide and the mill wheel 7.8 across, at a 1500 px sheet.
const FARM = 8.64;
const MILL = 7.8;

export const LADDERS: readonly Ladder[] = [
  { key: "today", name: "Today (control)", blurb: "every mark as drawn at 108f8db6", mult: ONE },
  {
    key: "a",
    name: "A. Order only",
    blurb: "capital, seat, town, village and hamlet as today; farmstead and mill brought down to 3.6, between the hamlet and the village",
    mult: { ...ONE, farmstead: 3.6 / FARM, mill: 3.6 / MILL },
  },
  {
    key: "b",
    name: "B. The great made greater",
    blurb: "capital and seat half as big again; town, village and hamlet as today; farmstead and mill at 3.6",
    mult: { ...ONE, capital: 1.5, seat: 1.5, farmstead: 3.6 / FARM, mill: 3.6 / MILL },
  },
  {
    key: "c",
    name: "C. Three sizes, far apart",
    blurb: "capital and seat twice today; town, village and hamlet a tenth smaller; farmstead and mill at 3.2",
    mult: { capital: 2, seat: 2, town: 0.9, village: 0.9, hamlet: 0.9, farmstead: 3.2 / FARM, mill: 3.2 / MILL },
  },
];

export const ladder = (key: string): Ladder => {
  const l = LADDERS.find((x) => x.key === key);
  if (!l) throw new Error(`no ladder ${key}`);
  return l;
};

// The grow law is this round's pick, not a ruling: each band of the Glass draws the marks 2^(1/3) (about 1.26) times the band above, so band 5 draws them 2^(5/3), about 3.17 times their world-sheet size.
export const GROW_PER_BAND = 2 ** (1 / 3);
export const growAt = (band: number): number => GROW_PER_BAND ** band;

export const scaled = (m: Mults, f: number): Mults =>
  Object.fromEntries(TIERS.map((t) => [t, m[t] * f])) as unknown as Mults;

type MarksState = { readonly mult: Mults; readonly style: StyleName; readonly keyMult: Mults; keying: boolean };
const g = globalThis as unknown as { __marks1104?: MarksState };

export const setMarks = (mult: Mults, style: StyleName, keyMult: Mults = mult): void => {
  g.__marks1104 = { mult, style, keyMult, keying: false };
};

export function inKey<T>(draw: () => T): T {
  const st = g.__marks1104;
  if (!st) return draw();
  st.keying = true;
  try {
    return draw();
  } finally {
    st.keying = false;
  }
}

export const tierMult = (tier: string): number => {
  const st = g.__marks1104;
  if (!st) return 1;
  return (st.keying ? st.keyMult : st.mult)[tier as Tier];
};

const CASTLE_HALF = 5.5;
const STAR_HALF = 6.5;
const HALF_TODAY: Record<Exclude<Tier, "capital" | "seat">, number> = {
  town: 3.4,
  village: 2.3,
  hamlet: 1.5,
  farmstead: 2.4 * 1.8,
  mill: 3.9,
};

export function halfWidthToday(tier: Tier, style: StyleName): number {
  if (tier === "capital" || tier === "seat") {
    const scale = tier === "capital" ? 1.25 : 0.85;
    return (style === "antique" || style === "ink" ? CASTLE_HALF : STAR_HALF) * scale;
  }
  return HALF_TODAY[tier];
}

export const gapShift = (tier: string): number => {
  const st = g.__marks1104;
  if (!st) return 0;
  const shift = (tierMult(tier) - 1) * halfWidthToday(tier as Tier, st.style);
  return process.env["GAP_SHRINKS_1104"] === "1" ? shift : Math.max(0, shift);
};
