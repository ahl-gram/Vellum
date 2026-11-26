// Issue #793 round, direction B: streets laid out on a grid. The grid squares to the shore on a harbour, else to the road of the gate nearest the market; the market fills the grid's middle square, the two main streets past it cross the river on bridges, and every other street stops at the bank; each gate's road comes in straight to the nearest street.
import type { P, PlanGate } from "./types.ts";
import { dist, insideRing, nearestOnPolyline, segmentCross, unit } from "./geom.ts";
import type { Ground, PlanKind } from "./ground.ts";
import { RIVER_HALF } from "./ground.ts";
import type { Plot } from "./network.ts";

// Cells between streets along the grid's axis and across it, by kind. Picked to make the picture.
export const SPACING = { capital: [1.25, 0.82], seat: [1.2, 0.8], town: [1.15, 0.78], village: [1.1, 0.75] } as const;

export type GridInput = {
  readonly G: Ground;
  readonly kind: PlanKind;
  readonly wall: ReadonlyArray<P>;
  readonly gates: ReadonlyArray<PlanGate>;
  readonly market: P;
  readonly axis: P;
  readonly blocked: ReadonlyArray<Plot>;
};

export function gridAxis(gates: ReadonlyArray<PlanGate>, quay: ReadonlyArray<ReadonlyArray<P>>, market: P): P {
  const runs = [...quay].sort((a, b) => dist(nearestOnPolyline(market, a), market) - dist(nearestOnPolyline(market, b), market));
  const near = runs[0];
  if (near !== undefined && near.length >= 2) {
    const a = near[0]!,
      b = near[near.length - 1]!;
    const u = unit(b.x - a.x, b.y - a.y);
    if (u) return u;
  }
  const g = [...gates].sort((p, q) => dist(p.at, market) - dist(q.at, market))[0];
  return (g && unit(g.at.x - market.x, g.at.y - market.y)) ?? { x: 1, y: 0 };
}

type Run = { readonly pts: P[]; readonly main: boolean };

function insideRuns(gi: GridInput, origin: P, dir: P, reach: number, main: boolean): Run[] {
  const { G, wall, blocked } = gi;
  const step = 0.06;
  const runs: Run[] = [];
  let cur: P[] = [];
  for (let t = -reach; t <= reach + 1e-9; t += step) {
    const p = { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
    const ok = insideRing(p, wall) && G.elev(p) > G.world.seaLevel && !blocked.some((b) => dist(p, b.at) <= b.r + 0.06);
    if (ok) cur.push(p);
    else if (cur.length > 0) {
      if (cur.length >= 3) runs.push({ pts: [cur[0]!, cur[cur.length - 1]!], main });
      cur = [];
    }
  }
  if (cur.length >= 3) runs.push({ pts: [cur[0]!, cur[cur.length - 1]!], main });
  return runs;
}

// A street that meets the river stops at its bank, unless it is a main street, which takes a bridge.
function cutAtRivers(G: Ground, run: Run): P[][] {
  const [a, b] = run.pts as [P, P];
  const hits: number[] = [];
  for (const r of G.rivers)
    for (let i = 0; i + 1 < r.length; i++) {
      const x = segmentCross(a, b, r[i]!, r[i + 1]!);
      if (x) hits.push(x.t);
    }
  if (hits.length === 0 || run.main) return [run.pts];
  const len = dist(a, b);
  const gap = (RIVER_HALF + 0.08) / (len || 1);
  const cuts = [...hits].sort((p, q) => p - q);
  const pieces: P[][] = [];
  let t0 = 0;
  const at = (t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  for (const t of cuts) {
    if (t - gap > t0 + 0.02) pieces.push([at(t0), at(t - gap)]);
    t0 = t + gap;
  }
  if (t0 < 0.98) pieces.push([at(t0), b]);
  return pieces.filter((s) => dist(s[0]!, s[1]!) > 0.25);
}

export function gridStreets(gi: GridInput): P[][] {
  const { G, kind, market, axis, gates } = gi;
  const across = { x: -axis.y, y: axis.x };
  const [sa, sb] = SPACING[kind];
  const reach = G.R + 1.5;
  const runs: Run[] = [];
  for (let k = -Math.ceil(reach / sb); k <= Math.ceil(reach / sb); k++) {
    const off = (k + 0.5) * sb;
    const o = { x: market.x + across.x * off, y: market.y + across.y * off };
    runs.push(...insideRuns(gi, o, axis, reach, k === 0));
  }
  for (let k = -Math.ceil(reach / sa); k <= Math.ceil(reach / sa); k++) {
    const off = (k + 0.5) * sa;
    const o = { x: market.x + axis.x * off, y: market.y + axis.y * off };
    runs.push(...insideRuns(gi, o, across, reach, k === 0));
  }
  const streets = runs.flatMap((r) => cutAtRivers(G, r));
  const connectors = gates.flatMap((g) => {
    const near = streets
      .map((s) => nearestOnPolyline(g.at, s))
      .reduce<P | null>((a, b) => (a === null || dist(b, g.at) < dist(a, g.at) ? b : a), null);
    return near === null || dist(near, g.at) < 0.05 ? [] : [[g.at, near]];
  });
  return [...streets, ...connectors];
}

// Sutherland and Hodgman: any ring clipped by a convex one (the grid's cell), so a cell the wall or the shore cuts keeps its straight street fronts.
function clipConvex(subject: ReadonlyArray<P>, clip: ReadonlyArray<P>): P[] {
  let out: P[] = [...subject];
  const sideOf = (a: P, b: P, p: P): number => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const orient = sideOf(clip[0]!, clip[1]!, clip[2]!) > 0 ? 1 : -1;
  for (let i = 0; i < clip.length && out.length > 0; i++) {
    const a = clip[i]!,
      b = clip[(i + 1) % clip.length]!;
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j]!,
        q = input[(j + 1) % input.length]!;
      const sp = orient * sideOf(a, b, p),
        sq = orient * sideOf(a, b, q);
      if (sp >= 0) out.push(p);
      if (sp >= 0 !== sq >= 0) {
        const t = sp / (sp - sq);
        out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
      }
    }
  }
  return out;
}

export type GridBlocksInput = {
  readonly gi: GridInput;
  readonly deep: ReadonlyArray<ReadonlyArray<P>>;
  readonly carve: (rect: ReadonlyArray<P>) => P[][] | null;
  readonly half: number;
};

// The grid's blocks are its cells less the streets: whole where the cell stands clear, clipped where the wall or the shore cuts it, and handed to `carve` where the river or a landmark's ground runs through it.
export function gridBlocks(b: GridBlocksInput): P[][] {
  const { gi, deep, carve, half } = b;
  const { G, kind, market, axis } = gi;
  const across = { x: -axis.y, y: axis.x };
  const [sa, sb] = SPACING[kind];
  const reach = G.R + 1.5;
  const out: P[][] = [];
  for (let i = -Math.ceil(reach / sa); i <= Math.ceil(reach / sa); i++)
    for (let j = -Math.ceil(reach / sb); j <= Math.ceil(reach / sb); j++) {
      if (i === 0 && j === 0) continue;
      const c = { x: market.x + axis.x * i * sa + across.x * j * sb, y: market.y + axis.y * i * sa + across.y * j * sb };
      const ha = sa / 2 - half,
        hb = sb / 2 - half;
      const rect = [
        [-ha, -hb],
        [ha, -hb],
        [ha, hb],
        [-ha, hb],
      ].map(([u, v]) => ({ x: c.x + axis.x * u! + across.x * v!, y: c.y + axis.y * u! + across.y * v! }));
      const carved = carve(rect);
      if (carved !== null) {
        out.push(...carved);
        continue;
      }
      for (const ring of deep) {
        const piece = clipConvex(ring, rect);
        if (piece.length >= 3 && Math.abs(area(piece)) > 0.09) out.push(piece);
      }
    }
  return out;
}

function area(r: ReadonlyArray<P>): number {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += r[j]!.x * r[i]!.y - r[i]!.x * r[j]!.y;
  return s / 2;
}
