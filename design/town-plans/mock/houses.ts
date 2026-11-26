// Issue #793 round: the houses a drawer stands in a block, in grid space, one stream per block, so the bird's-eye and the plan view stand the same houses. Every size here is a value picked to make the picture.
import { createRng } from "../../../src/core/rng.ts";
import type { P, TownPlan } from "../planner/types.ts";
import { dist, distanceToPolyline, insideRing } from "../planner/geom.ts";

export type House = { readonly at: P; readonly w: number; readonly d: number; readonly n: P };
type Kind = "capital" | "seat" | "town" | "village";

// Cells: a house's frontage and depth, and how full each kind builds its yards.
export const FRONT = { capital: 0.3, seat: 0.31, town: 0.32, village: 0.34 } as const;
export const DEPTH = { capital: 0.22, seat: 0.22, town: 0.22, village: 0.22 } as const;
const YARD_FILL = { capital: 0.88, seat: 0.5, town: 0.18, village: 0 } as const;
// The lean tier the size budget's menu offers: wider houses with more gaps between them along the streets, and the yards left open. Picked to make the picture.
const LEAN = { front: 1.3, gap: 0.38 } as const;
export type Detail = "full" | "lean";
const GAP_ODDS = { capital: 0.06, seat: 0.1, town: 0.14, village: 0.32 } as const;

export function housesOf(plan: TownPlan, kind: Kind, detail: Detail = "full"): House[] {
  const out: House[] = [];
  plan.blocks.forEach((block, b) => {
    const rng = createRng(plan.seed).fork(`mock-houses:${plan.index}:${plan.direction}:${b}`);
    const n = block.length;
    const sign = inwardSign(block);
    const f = FRONT[kind] * (detail === "full" ? 1 : LEAN.front),
      d = DEPTH[kind];
    const gapOdds = detail === "full" ? GAP_ODDS[kind] : Math.max(GAP_ODDS[kind], LEAN.gap);
    const cum = [0];
    for (let i = 0; i < n; i++) cum.push(cum[i]! + dist(block[i]!, block[(i + 1) % n]!));
    const total = cum[n]!;
    const at = (t: number): P => {
      const s = ((t % total) + total) % total;
      let i = 0;
      while (i < n - 1 && cum[i + 1]! < s) i++;
      const a = block[i]!,
        c = block[(i + 1) % n]!;
      const len = cum[i + 1]! - cum[i]! || 1;
      const u = (s - cum[i]!) / len;
      return { x: a.x + (c.x - a.x) * u, y: a.y + (c.y - a.y) * u };
    };
    const count = Math.floor(total / f);
    for (let k = 0; k < count; k++) {
      const s0 = (k + 0.5) * (total / count);
      const p = at(s0),
        p0 = at(s0 - f / 2),
        p1 = at(s0 + f / 2);
      const tx = p1.x - p0.x,
        ty = p1.y - p0.y;
      const len = Math.sqrt(tx * tx + ty * ty);
      if (len < f * 0.6) continue;
      const nx = (sign * -ty) / len,
        ny = (sign * tx) / len;
      const c = { x: p.x + (nx * d) / 2, y: p.y + (ny * d) / 2 };
      if (!insideRing(c, block) || distanceToPolyline(c, block, true) < d * 0.35) continue;
      if (rng.next() < gapOdds) continue;
      out.push({ at: c, w: f * 0.92, d, n: { x: nx, y: ny } });
    }
    const fill = detail === "full" ? YARD_FILL[kind] : 0;
    if (fill === 0) return;
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const p of block) {
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x);
      y1 = Math.max(y1, p.y);
    }
    for (let y = y0 + d * 1.5; y < y1; y += d * 1.3)
      for (let x = x0 + f; x < x1; x += f * 1.15) {
        const at = { x, y };
        if (!insideRing(at, block) || distanceToPolyline(at, block, true) < d * 1.35) continue;
        if (rng.next() > fill) continue;
        out.push({ at, w: f * 0.9, d, n: { x: 0, y: 1 } });
      }
  });
  return out;
}

// Which side of the block's edges its inside lies, read off the longest edge rather than the ring's winding.
function inwardSign(block: ReadonlyArray<P>): number {
  let best = 0,
    bl = -1;
  for (let i = 0; i < block.length; i++) {
    const a = block[i]!,
      c = block[(i + 1) % block.length]!;
    const l = (c.x - a.x) * (c.x - a.x) + (c.y - a.y) * (c.y - a.y);
    if (l > bl) {
      bl = l;
      best = i;
    }
  }
  const a = block[best]!,
    c = block[(best + 1) % block.length]!;
  const len = Math.sqrt(bl) || 1;
  const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  const probe = { x: mid.x + (-(c.y - a.y) / len) * 0.03, y: mid.y + ((c.x - a.x) / len) * 0.03 };
  return insideRing(probe, block) ? 1 : -1;
}
