import { createRng, type Rng } from "../core/rng.ts";

const ISLE_SIZES = ["equal", "varied"] as const;

export type IsleSize = (typeof ISLE_SIZES)[number];

export function isIsleSize(value: string): value is IsleSize {
  return (ISLE_SIZES as readonly string[]).includes(value);
}

export const MIN_ISLANDS = 2;
export const MAX_ISLANDS = 100;

export function isIslandCount(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_ISLANDS && value <= MAX_ISLANDS;
}

export function isRaggedness(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export type Lobe = { readonly cx: number; readonly cy: number; readonly r: number };

const LOBE_SEED_SALT = 0x5bd1e995;
const LOBE_INSET = 0.14;
const LOBE_COVERAGE = 0.3;
const CANDIDATES = 24;
const VARIED_LOW = 0.45;
const VARIED_HIGH = 1.55;

function farthestCandidate(rng: Rng, placed: ReadonlyArray<Lobe>, aspect: number): { cx: number; cy: number } {
  let best = { cx: 0.5, cy: 0.5 };
  let bestD = -1;
  for (let k = 0; k < CANDIDATES; k++) {
    const cx = rng.range(LOBE_INSET, 1 - LOBE_INSET);
    const cy = rng.range(LOBE_INSET, 1 - LOBE_INSET);
    let d = placed.length === 0 ? 1 : Infinity;
    for (const l of placed) d = Math.min(d, Math.hypot((cx - l.cx) * aspect, cy - l.cy));
    if (d > bestD) {
      bestD = d;
      best = { cx, cy };
    }
  }
  return best;
}

export function placeLobes(seed: number, count: number, size: IsleSize, aspect: number): Lobe[] {
  const rng = createRng((seed ^ LOBE_SEED_SALT) >>> 0);
  const baseR = Math.sqrt((LOBE_COVERAGE * aspect) / (count * Math.PI));
  const lobes: Lobe[] = [];
  for (let i = 0; i < count; i++) {
    const centre = farthestCandidate(rng, lobes, aspect);
    lobes.push({ ...centre, r: size === "equal" ? baseR : baseR * rng.range(VARIED_LOW, VARIED_HIGH) });
  }
  if (size === "equal") return lobes;
  const grow = Math.max(1, Math.sqrt((count * baseR * baseR) / lobes.reduce((t, l) => t + l.r * l.r, 0)));
  return grow === 1 ? lobes : lobes.map((l) => ({ ...l, r: l.r * grow }));
}
