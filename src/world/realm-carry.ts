import { boxBlur } from "../core/box-blur.ts";
import { createField } from "../core/grid.ts";
import { chainBorderSegments, labelBorderSegments } from "../core/segment-chains.ts";
import { chaikinSmooth, marchingSquares } from "../terrain/contours.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { World } from "./types.ts";

// Measured max reach today is 4 parent cells (seeds 42/7/2/15/23, bands 1-3 + the atlas 0.38 window, out/measure-realm-cap.ts); #376's coast excursion adds up to ~2.4 more, so 8 is generous without letting a realm wander the open ocean.
export const REALM_REACH_CAP = 8;

export type RealmRing = ReadonlyArray<readonly [number, number]>;
export type RealmRings = ReadonlyArray<{
  readonly realm: number;
  readonly rings: ReadonlyArray<RealmRing>;
}>;

const N4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function growRealmLabels(
  labels: Int16Array,
  isSea: (i: number) => boolean,
  w: number,
  h: number,
  cap: number = REALM_REACH_CAP,
): Int16Array {
  const grown = Int16Array.from(labels);
  let queue: number[] = [];
  for (let i = 0; i < grown.length; i++) if (grown[i]! >= 0) queue.push(i);
  for (let hop = 0; hop < cap && queue.length > 0; hop++) {
    const next: number[] = [];
    for (const i of queue) {
      const x = i % w;
      const y = (i / w) | 0;
      for (const [dx, dy] of N4) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const j = nx + ny * w;
        if (grown[j]! >= 0 || !isSea(j)) continue;
        grown[j] = grown[i]!;
        next.push(j);
      }
    }
    queue = next;
  }
  return grown;
}

const ringCache = new WeakMap<World, RealmRings>();
const borderCache = new WeakMap<World, ReadonlyArray<RealmRing>>();

/** The same chains the world sheet strokes (label-boundary segments, chained, smoothed), in parent grid coordinates: one per land boundary, so a seam is never inked twice and no segment can sit on a coastline. */
export function realmBorderChains(world: World): ReadonlyArray<RealmRing> {
  const cached = borderCache.get(world);
  if (cached) return cached;
  const { w, h } = world.elev;
  const segs = labelBorderSegments(world.realms.labels, w, h);
  const chains = chainBorderSegments(segs).map(
    (chain) => chaikinSmooth(chain, false, 2) as RealmRing,
  );
  borderCache.set(world, chains);
  return chains;
}

export function mapChainsToWindow(
  chains: ReadonlyArray<RealmRing>,
  window: UvWindow,
  parentW: number,
  parentH: number,
  gridW: number,
  gridH: number,
): ReadonlyArray<RealmRing> {
  const mapped = mapRingsToWindow(
    [{ realm: 0, rings: chains }],
    window,
    parentW,
    parentH,
    gridW,
    gridH,
  );
  return mapped[0]?.rings ?? [];
}

export function realmCarryRings(world: World): RealmRings {
  const cached = ringCache.get(world);
  if (cached) return cached;
  const { w, h } = world.elev;
  const { data } = world.elev;
  const sl = world.seaLevel;
  const grown = growRealmLabels(
    world.realms.labels,
    (i) => (data[i] as number) <= sl,
    w,
    h,
  );
  const out: Array<{ realm: number; rings: RealmRing[] }> = [];
  for (let realm = 0; realm < world.realms.seats.length; realm++) {
    const indicator = createField(w, h, (x, y) => (grown[x + y * w] === realm ? 1 : 0));
    const soft = boxBlur(indicator, 3);
    // Owned SEA cells are floored above the iso: offshore the ring is invisible (the region land clip is the drawn coast), so precision there buys nothing, while the blur's bite on a thin grown finger would bare the finer shoreline inside it. Land cells keep the world sheet's exact blur behavior.
    const floored = createField(w, h, (x, y) => {
      const i = x + y * w;
      const v = soft.data[i] as number;
      return grown[i] === realm && (data[i] as number) <= sl ? Math.max(v, 0.75) : v;
    });
    const rings = marchingSquares(floored, 0.5)
      .filter((c) => c.closed)
      .map((c) => chaikinSmooth(c.points, true, 2) as RealmRing);
    if (rings.length > 0) out.push({ realm, rings });
  }
  ringCache.set(world, out);
  return out;
}

/** Rings kept only if their bbox meets the window: a fully disjoint ring adds no even-odd parity inside it, while a containing ring's bbox always meets it, so culling cannot flip a hole. */
export function mapRingsToWindow(
  rings: RealmRings,
  window: UvWindow,
  parentW: number,
  parentH: number,
  gridW: number,
  gridH: number,
): RealmRings {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const x0 = window.u0 * (parentW - 1);
  const x1 = window.u1 * (parentW - 1);
  const y0 = window.v0 * (parentH - 1);
  const y1 = window.v1 * (parentH - 1);
  const gx = (x: number): number => ((x / (parentW - 1) - window.u0) / du) * (gridW - 1);
  const gy = (y: number): number => ((y / (parentH - 1) - window.v0) / dv) * (gridH - 1);

  const out: Array<{ realm: number; rings: RealmRing[] }> = [];
  for (const { realm, rings: parentRings } of rings) {
    const kept: RealmRing[] = [];
    for (const ring of parentRings) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const [x, y] of ring) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      if (maxX < x0 || minX > x1 || maxY < y0 || minY > y1) continue;
      kept.push(ring.map(([x, y]) => [gx(x), gy(y)] as const));
    }
    if (kept.length > 0) out.push({ realm, rings: kept });
  }
  return out;
}
