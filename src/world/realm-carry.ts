import { boxBlur } from "../core/box-blur.ts";
import { createField } from "../core/grid.ts";
import { chainBorderSegments, labelBorderSegments } from "../core/segment-chains.ts";
import { frameVertexPredicate } from "../render/coast.ts";
import { chaikinSmooth, chaikinSmoothPinned, closedIsoRings } from "../terrain/contours.ts";
import type { World } from "./types.ts";

// Ratified 2026-08-20: measured max reach today is 4 parent cells and Issue #376's coast excursion adds up to ~2.4 more (the sweep is recorded on Issue #423), so 8 is generous without letting a realm wander the open ocean.
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

const grownCache = new WeakMap<World, Int16Array>();

/** The parent's labels grown over parent water, memoized per world. */
export function grownRealmLabels(world: World): Int16Array {
  const cached = grownCache.get(world);
  if (cached) return cached;
  const { w, h, data } = world.elev;
  const grown = growRealmLabels(world.realms.labels, (i) => (data[i] as number) <= world.seaLevel, w, h);
  grownCache.set(world, grown);
  return grown;
}

/** One tint ring set per realm present in `owner`, blurred from the owner field at region scale and closed against the window frame. */
export function regionRealmRings(owner: Int16Array, gridW: number, gridH: number): RealmRings {
  const present = new Set<number>();
  for (const o of owner) if (o >= 0) present.add(o);
  const onFrame = frameVertexPredicate(gridW, gridH);
  const out: Array<{ realm: number; rings: RealmRing[] }> = [];
  for (const realm of [...present].sort((a, b) => a - b)) {
    const indicator = createField(gridW, gridH, (x, y) => (owner[x + y * gridW] === realm ? 1 : 0));
    const soft = boxBlur(indicator, 3);
    const rings = closedIsoRings(soft, 0.5).map((c) => chaikinSmoothPinned(c.points, 2, onFrame) as RealmRing);
    if (rings.length > 0) out.push({ realm, rings });
  }
  return out;
}

/** The land-to-land boundary of the region's own labels, chained and smoothed: one chain per boundary, so a seam is never inked twice and no segment can sit on a coastline. */
export function regionRealmBorders(labels: Int16Array, gridW: number, gridH: number): ReadonlyArray<RealmRing> {
  return chainBorderSegments(labelBorderSegments(labels, gridW, gridH)).map(
    (chain) => chaikinSmooth(chain, false, 3) as RealmRing,
  );
}
