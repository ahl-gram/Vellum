import type { MapStyle } from "./style.ts";
import { washConflictMatrix } from "./cvd.ts";

export type Centroid = { readonly x: number; readonly y: number };

export const BASE_TINTS = 5;

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

export function assignRealmTints(
  centroids: readonly Centroid[],
  adjacency: readonly ReadonlySet<number>[],
  conflict: readonly (readonly boolean[])[],
  confusionDist: number,
): number[] {
  const n = centroids.length;
  const p = conflict.length;
  const near = confusionDist * confusionDist;

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
    const idBlocked = new Array<boolean>(p).fill(false);
    const cvdBlocked = new Array<boolean>(p).fill(false);
    for (const m of neigh[r]!) {
      const c = color[m]!;
      if (c < 0) continue;
      idBlocked[c] = true;
      for (let k = 0; k < p; k++) if (conflict[c]?.[k]) cvdBlocked[k] = true;
    }

    let pick = -1;
    for (let c = 0; c < p; c++) {
      if (!idBlocked[c] && !cvdBlocked[c]) {
        pick = c;
        break;
      }
    }
    if (pick < 0) {
      for (let c = 0; c < p; c++) {
        if (!idBlocked[c]) {
          pick = c;
          break;
        }
      }
    }
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
  const confusionDist = 0.5 * Math.min(w, h);
  return assignRealmTints(centroids, adjacency, conflict, confusionDist);
}
