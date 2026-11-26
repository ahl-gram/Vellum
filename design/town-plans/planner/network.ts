// Issue #793 round: what both street systems share: the street corridors, the blocks left between the streets, the noise that wobbles a street, and turning a lattice path into a street.
import type { Rng } from "../../../src/core/rng.ts";
import type { P } from "./types.ts";
import { chaikin, distanceToPolyline, insideRing, ringArea, simplify, dist } from "./geom.ts";
import { boundaryRings, components, maskOf, type Lattice, type Mask } from "./lattice.ts";
import { nodeP, STRAND, type Ground } from "./ground.ts";

export type Plot = { readonly at: P; readonly r: number };

// A smooth field in [0, 1) from the plan's stream: values on a one-cell grid, read bilinearly.
export function noiseField(L: Lattice, rng: Rng): (p: P) => number {
  const side = Math.ceil(L.n * L.h) + 2;
  const v = Array.from({ length: side * side }, () => rng.next());
  return (p) => {
    const fx = Math.max(0, Math.min(side - 1.001, p.x - L.x0)),
      fy = Math.max(0, Math.min(side - 1.001, p.y - L.y0));
    const i = Math.floor(fx),
      j = Math.floor(fy),
      tx = fx - i,
      ty = fy - j;
    const a = v[j * side + i]!,
      b = v[j * side + i + 1]!,
      c = v[(j + 1) * side + i]!,
      d = v[(j + 1) * side + i + 1]!;
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}

// A lattice path as a street: thinned, softened once, its two ends kept exactly where they were.
export function streetFrom(L: Lattice, nodes: ReadonlyArray<number>, head: P | null, tail: P | null): P[] {
  const pts = nodes.map((k) => nodeP(L, k));
  const thin = simplify(pts, 0.07, false);
  const soft = thin.length > 2 ? chaikin(thin, false) : thin;
  const body = soft.slice(head ? 1 : 0, tail ? soft.length - 1 : soft.length);
  return [...(head ? [head] : []), ...body, ...(tail ? [tail] : [])];
}

function bbox(line: ReadonlyArray<P>, pad: number) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const p of line) {
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x);
    y1 = Math.max(y1, p.y);
  }
  return { x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad };
}

export function corridor(L: Lattice, streets: ReadonlyArray<ReadonlyArray<P>>, half: number): Mask {
  const boxes = streets.map((s) => bbox(s, half));
  return maskOf(L, (p) =>
    streets.some((s, i) => {
      const b = boxes[i]!;
      return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1 && distanceToPolyline(p, s) <= half;
    }),
  );
}

export const plotMask = (L: Lattice, plots: ReadonlyArray<Plot>): Mask =>
  maskOf(L, (p) => plots.some((q) => dist(p, q.at) <= q.r));

// Cells squared: a scrap of ground smaller than this is left as yard, not a block.
const MIN_BLOCK = 0.05;

// The blocks: the town's ground less the streets, the plots, the river and a strip inside the wall, each piece outlined and softened.
export function blocksOf(
  G: Ground,
  inside: Mask,
  street: Mask,
  plots: Mask,
  wall: ReadonlyArray<P> | null,
  wallStrip: number,
): P[][] {
  const { L } = G;
  const ok = maskOf(L, (p, k) => {
    if (inside[k] !== 1 || street[k] === 1 || plots[k] === 1 || G.river[k] === 1) return false;
    if (G.seaDist[k]! <= STRAND + 0.06) return false;
    return wall === null || distanceToPolyline(p, wall, true) > wallStrip;
  });
  const out: P[][] = [];
  for (const comp of components(L, ok)) {
    if (comp.length * L.h * L.h < MIN_BLOCK) continue;
    const rings = boundaryRings(L, comp);
    const outer = rings.reduce<P[]>((a, r) => (Math.abs(ringArea(r)) > Math.abs(ringArea(a)) ? r : a), []);
    if (outer.length < 4) continue;
    out.push(simplify(chaikin(outer, true), 0.035, true));
  }
  return out;
}

// The ground a block may stand on: inside the wall, back from it and from the strand.
export function buildable(G: Ground, inside: Mask, wall: ReadonlyArray<P> | null, wallStrip: number): Mask {
  return maskOf(G.L, (p, k) => inside[k] === 1 && G.seaDist[k]! > STRAND + 0.06 && (wall === null || distanceToPolyline(p, wall, true) > wallStrip));
}

export function outlines(G: Ground, ok: Mask): P[][] {
  return components(G.L, ok)
    .filter((c) => c.length * G.L.h * G.L.h >= MIN_BLOCK)
    .map((c) => boundaryRings(G.L, c).reduce<P[]>((a, r) => (Math.abs(ringArea(r)) > Math.abs(ringArea(a)) ? r : a), []))
    .filter((r) => r.length >= 4)
    .map((r) => simplify(r, 0.03, true));
}

// A grid cell the river or a landmark's ground runs through, cut from the lattice instead of clipped: null where neither touches it.
export function carver(G: Ground, ok: Mask, plots: ReadonlyArray<Plot>): (rect: ReadonlyArray<P>) => P[][] | null {
  return (rect) => {
    const hit = plots.some((q) => insideRing(q.at, rect) || distanceToPolyline(q.at, rect, true) < q.r);
    let wet = false;
    const nodes: number[] = [];
    for (let k = 0; k < ok.length; k++) {
      const p = { x: G.L.x0 + (k % G.L.n) * G.L.h, y: G.L.y0 + Math.floor(k / G.L.n) * G.L.h };
      if (!insideRing(p, rect)) continue;
      if (G.river[k] === 1) wet = true;
      nodes.push(k);
    }
    if (!hit && !wet) return null;
    const keep = maskOf(G.L, () => false);
    for (const k of nodes) {
      const p = { x: G.L.x0 + (k % G.L.n) * G.L.h, y: G.L.y0 + Math.floor(k / G.L.n) * G.L.h };
      if (ok[k] === 1 && G.river[k] !== 1 && !plots.some((q) => dist(p, q.at) <= q.r)) keep[k] = 1;
    }
    return outlines(G, keep);
  };
}
