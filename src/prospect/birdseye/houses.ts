import { createRng } from "../../core/rng.ts";
import type { PlanPoint, TownPlan } from "../town-plan/types.ts";
import { dist, distanceToPolyline, insideRing } from "../town-plan/geom.ts";
import type { BirdseyeKind } from "./types.ts";

export type LeanHouse = { readonly at: PlanPoint; readonly w: number; readonly d: number; readonly n: PlanPoint };

// Cells: a house's frontage and depth, and the share of its lots a block leaves empty. The lean tier the town-plan round ruled (Issue #793): wider houses, more gaps, the yards left open. Picked to make the picture.
const FRONT = { capital: 0.3, seat: 0.31, town: 0.32, village: 0.34 } as const;
const DEPTH = 0.22;
const GAP_ODDS = { capital: 0.06, seat: 0.1, town: 0.14, village: 0.32 } as const;
const LEAN = { front: 1.3, gap: 0.38 } as const;

// Which side of the block's edges its inside lies, read off the longest edge rather than the ring's winding.
function inwardSign(block: ReadonlyArray<PlanPoint>): number {
  let longest = 0;
  let span = -1;
  for (let i = 0; i < block.length; i++) {
    const a = block[i]!;
    const c = block[(i + 1) % block.length]!;
    const l = (c.x - a.x) * (c.x - a.x) + (c.y - a.y) * (c.y - a.y);
    if (l > span) {
      span = l;
      longest = i;
    }
  }
  const a = block[longest]!;
  const c = block[(longest + 1) % block.length]!;
  const len = Math.sqrt(span) || 1;
  const probe = { x: (a.x + c.x) / 2 + (-(c.y - a.y) / len) * 0.03, y: (a.y + c.y) / 2 + ((c.x - a.x) / len) * 0.03 };
  return insideRing(probe, block) ? 1 : -1;
}

export function leanHouses(plan: TownPlan, kind: BirdseyeKind): LeanHouse[] {
  const out: LeanHouse[] = [];
  const front = FRONT[kind] * LEAN.front;
  const gapOdds = Math.max(GAP_ODDS[kind], LEAN.gap);
  plan.blocks.forEach((block, b) => {
    const rng = createRng(plan.seed).fork(`mock-houses:${plan.index}:land:${b}`);
    const n = block.length;
    const sign = inwardSign(block);
    const cum = [0];
    for (let i = 0; i < n; i++) cum.push(cum[i]! + dist(block[i]!, block[(i + 1) % n]!));
    const total = cum[n]!;
    const along = (t: number): PlanPoint => {
      const s = ((t % total) + total) % total;
      let i = 0;
      while (i < n - 1 && cum[i + 1]! < s) i++;
      const a = block[i]!;
      const c = block[(i + 1) % n]!;
      const len = cum[i + 1]! - cum[i]! || 1;
      const u = (s - cum[i]!) / len;
      return { x: a.x + (c.x - a.x) * u, y: a.y + (c.y - a.y) * u };
    };
    const count = Math.floor(total / front);
    for (let k = 0; k < count; k++) {
      const mid = (k + 0.5) * (total / count);
      const p = along(mid);
      const p0 = along(mid - front / 2);
      const p1 = along(mid + front / 2);
      const tx = p1.x - p0.x;
      const ty = p1.y - p0.y;
      const len = Math.sqrt(tx * tx + ty * ty);
      if (len < front * 0.6) continue;
      const nx = (sign * -ty) / len;
      const ny = (sign * tx) / len;
      const c = { x: p.x + (nx * DEPTH) / 2, y: p.y + (ny * DEPTH) / 2 };
      if (!insideRing(c, block) || distanceToPolyline(c, block, true) < DEPTH * 0.35) continue;
      if (rng.next() < gapOdds) continue;
      out.push({ at: c, w: front * 0.92, d: DEPTH, n: { x: nx, y: ny } });
    }
  });
  return out;
}
