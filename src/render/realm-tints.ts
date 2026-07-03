import type { MapStyle } from "./style.ts";
import { washConflictMatrix } from "./cvd.ts";

export type Centroid = { readonly x: number; readonly y: number };

/** The frozen per-style base palette size; distance-aware assignment engages
 *  only beyond it, so every committed <=5-realm chart stays byte-identical. */
export const BASE_TINTS = 5;

/** Territory centroid (mean cell position) of each realm, indexed by realm id. */
export function realmCentroids(
  labels: Int16Array,
  w: number,
  h: number,
  count: number,
): Centroid[] {
  const sx = new Float64Array(count);
  const sy = new Float64Array(count);
  const cnt = new Float64Array(count);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = labels[x + y * w] as number;
      if (r >= 0 && r < count) {
        sx[r]! += x;
        sy[r]! += y;
        cnt[r]! += 1;
      }
    }
  }
  const out: Centroid[] = [];
  for (let r = 0; r < count; r++) {
    const c = cnt[r]! || 1;
    out.push({ x: sx[r]! / c, y: sy[r]! / c });
  }
  return out;
}

/** Realm border adjacency: `adjacency[i]` holds every realm id sharing a
 *  4-connected land border with realm i. */
export function realmAdjacency(
  labels: Int16Array,
  w: number,
  h: number,
  count: number,
): Set<number>[] {
  const adj: Set<number>[] = Array.from({ length: count }, () => new Set<number>());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = labels[x + y * w] as number;
      if (a < 0 || a >= count) continue;
      if (x + 1 < w) {
        const b = labels[x + 1 + y * w] as number;
        if (b >= 0 && b < count && b !== a) {
          adj[a]!.add(b);
          adj[b]!.add(a);
        }
      }
      if (y + 1 < h) {
        const b = labels[x + (y + 1) * w] as number;
        if (b >= 0 && b < count && b !== a) {
          adj[a]!.add(b);
          adj[b]!.add(a);
        }
      }
    }
  }
  return adj;
}

const dist2 = (a: Centroid, b: Centroid): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/**
 * Assign a palette index to each realm so that realms which read as visually
 * close - within `confusionDist`, or sharing a land border - never receive the
 * same or a colour-blind-confusable tint, while far-apart realms may reuse a
 * colour. Proximity drives the difference, per #78 (two nearby islands must not
 * read as one nation), with border adjacency as an extra same-landmass guard.
 *
 * Pure and deterministic: realms are coloured in a fixed Welsh-Powell order
 * (highest confusion-degree first, realm id breaking ties), so the result is a
 * function of geometry alone with no float-ordering fragility.
 */
export function assignRealmTints(
  centroids: readonly Centroid[],
  adjacency: readonly ReadonlySet<number>[],
  conflict: readonly (readonly boolean[])[],
  confusionDist: number,
): number[] {
  const n = centroids.length;
  const p = conflict.length;
  const near = confusionDist * confusionDist;

  // confusion graph: an edge means the two realms must differ (proximity OR border)
  const neigh: Set<number>[] = Array.from({ length: n }, () => new Set<number>());
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (adjacency[i]?.has(j) || dist2(centroids[i]!, centroids[j]!) < near) {
        neigh[i]!.add(j);
        neigh[j]!.add(i);
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => neigh[b]!.size - neigh[a]!.size || a - b,
  );

  const color = new Array<number>(n).fill(-1);
  for (const r of order) {
    // Two levels of block from already-coloured close neighbours: `idBlocked`
    // is the hard one (the spec: a close realm must not share the exact tint);
    // `cvdBlocked` is the soft one (avoid a colour-blind-confusable class).
    const idBlocked = new Array<boolean>(p).fill(false);
    const cvdBlocked = new Array<boolean>(p).fill(false);
    for (const m of neigh[r]!) {
      const c = color[m]!;
      if (c < 0) continue;
      idBlocked[c] = true;
      for (let k = 0; k < p; k++) if (conflict[c]?.[k]) cvdBlocked[k] = true;
    }

    let pick = -1;
    // 1: a distinct tint that is also colour-blind-safe against the neighbours.
    for (let c = 0; c < p; c++) {
      if (!idBlocked[c] && !cvdBlocked[c]) {
        pick = c;
        break;
      }
    }
    // 2: the palette is CVD-constrained, but the spec's hard guarantee still
    // holds - take a distinct tint even if it is a colour-blind twin of one.
    if (pick < 0) {
      for (let c = 0; c < p; c++) {
        if (!idBlocked[c]) {
          pick = c;
          break;
        }
      }
    }
    // 3: genuinely more mutually-confusable realms (close or bordering) than
    // tints - pigeonhole. Reuse the tint whose nearest same-tinted realm is
    // farthest, id breaking ties. Unreachable on real planar maps at 7-8 tints.
    if (pick < 0) {
      let bestSep = -1;
      for (let c = 0; c < p; c++) {
        let sep = Infinity;
        for (let m = 0; m < n; m++) {
          if (m === r || color[m] !== c) continue;
          sep = Math.min(sep, dist2(centroids[r]!, centroids[m]!));
        }
        if (sep > bestSep) {
          bestSep = sep;
          pick = c;
        }
      }
      if (pick < 0) pick = 0;
    }

    color[r] = pick;
  }

  return color;
}

/**
 * Per-realm palette index for a world+style. Identity (byte-stable) for worlds
 * within the frozen base palette; the distance-aware assignment beyond it.
 */
export function realmTintIndices(
  labels: Int16Array,
  w: number,
  h: number,
  count: number,
  style: MapStyle,
): number[] {
  if (count <= BASE_TINTS) return Array.from({ length: count }, (_, i) => i);
  const opacity = style.name === "topographic" ? 0.16 : 0.11;
  const conflict = washConflictMatrix(style.realmTints, style.paper, opacity);
  const centroids = realmCentroids(labels, w, h, count);
  const adjacency = realmAdjacency(labels, w, h, count);
  // Starting point on the 320x240 grid; calibrated on real archipelagos in #79.
  const confusionDist = 0.5 * Math.min(w, h);
  return assignRealmTints(centroids, adjacency, conflict, confusionDist);
}
