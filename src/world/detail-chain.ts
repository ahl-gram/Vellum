import { fieldFrom, type Field } from "../core/grid.ts";
import {
  buildHeightfield,
  MAX_DETAIL,
  type MapType,
  type UvWindow,
} from "../terrain/heightfield.ts";
import {
  floorToParent,
  gateToParentLand,
  parentCellsOnWindow,
  parentSurfaceOnWindow,
  rejectBridges,
} from "../terrain/detail-guarantees.ts";
import { FULL_WINDOW, LOD_BANDS, lodWindowFor, quantizeCenter, type LodBand } from "./lod.ts";

/** No band index: the window alone fixes the ancestry, its depth and every detail level, so a caller cannot pass a band that disagrees with its window. */
export type ChainSpec = {
  readonly seed: number;
  readonly mapType: MapType;
  readonly window: UvWindow;
  readonly gridW: number;
  readonly gridH: number;
  readonly worldAspect: number;
  readonly seaLevel: number;
  readonly coastWarp?: number;
};

export type ChainCache = {
  get(key: string): Field | undefined;
  set(key: string, field: Field): void;
  readonly hits: number;
  readonly misses: number;
};

const CACHE_CAPACITY = 24;

/** Derived from the WINDOW alone, never the camera path or a band index: two routes to one window must agree cell for cell, the byte-identity contract in lod.ts. A window that cannot be doubled inside the sheet parents on the full window. */
export function canonicalParent(win: UvWindow): UvWindow {
  const parentSize = (win.u1 - win.u0) * 2;
  if (parentSize >= 1) return FULL_WINDOW;
  const q = quantizeCenter((win.u0 + win.u1) / 2, (win.v0 + win.v1) / 2, parentSize);
  return lodWindowFor(q.cx, q.cy, parentSize);
}

/** The window's ancestry, nearest parent first, ending at the full window. Each step at least doubles the size, so it terminates. */
export function ancestorWindows(win: UvWindow): UvWindow[] {
  const out: UvWindow[] = [];
  let w = win;
  while (w.u1 - w.u0 < 1) {
    w = canonicalParent(w);
    out.push(w);
  }
  return out;
}

export function detailForWindow(win: UvWindow): number {
  const size = win.u1 - win.u0;
  const level = Math.round(Math.log2(1 / size));
  return Math.min(Math.max(level, 0), MAX_DETAIL);
}

/** The window fixes the detail level, so the window bounds here carry it; a spec that ever takes an EXPLICIT detail must add it to this key. */
export function chainCacheKey(spec: ChainSpec): string {
  const w = spec.window;
  return [
    spec.seed,
    spec.mapType,
    w.u0, w.v0, w.u1, w.v1,
    spec.gridW, spec.gridH,
    spec.worldAspect,
    spec.seaLevel,
    spec.coastWarp ?? "-",
  ].join("|");
}

export function createChainCache(capacity: number = CACHE_CAPACITY): ChainCache {
  const entries = new Map<string, Field>();
  let hits = 0;
  let misses = 0;
  return {
    get(key) {
      const found = entries.get(key);
      if (found === undefined) {
        misses++;
        return undefined;
      }
      hits++;
      entries.delete(key);
      entries.set(key, found);
      return found;
    },
    set(key, field) {
      entries.set(key, field);
      if (entries.size > capacity) {
        const oldest = entries.keys().next();
        if (!oldest.done) entries.delete(oldest.value);
      }
    },
    get hits() {
      return hits;
    },
    get misses() {
      return misses;
    },
  };
}

/** The chain's coarse reference: what it floors against. Since #443 it is NOT what rejectBridges partitions, which is each ancestor's own cells. NaN means a cell no ancestor covers, so it must not win the max and must stay NaN when every ancestor abstains. */
export function maxOfSurfaces(surfaces: ReadonlyArray<Field>, w: number, h: number): Field {
  const data = new Float64Array(w * h).fill(NaN);
  for (const s of surfaces) {
    for (let i = 0; i < data.length; i++) {
      const v = s.data[i] as number;
      if (!Number.isFinite(v)) continue;
      const cur = data[i] as number;
      if (!Number.isFinite(cur) || v > cur) data[i] = v;
    }
  }
  return fieldFrom(w, h, data);
}

/** An ancestor is a canonical thing, so it draws at its own band's grid and siblings share it whatever grid the target asked for. */
function gridForWindow(win: UvWindow): { readonly gridW: number; readonly gridH: number } {
  const size = win.u1 - win.u0;
  const band = LOD_BANDS.find((b) => Math.abs(b.sizeUV - size) < 1e-9) ?? (LOD_BANDS[0] as LodBand);
  return { gridW: band.gridW, gridH: band.gridH };
}

/** Floored and de-bridged against EVERY ancestor, not only the nearest: two bilinear resamples in a row smooth differently from one, so parent-only flooring lets waterline cells sink relative to a grandparent. The cache defaults to a fresh one per top-level call because the recursion would otherwise rebuild each ancestor's own ancestry, costing 2^depth field builds instead of depth. */
export function buildChainedField(spec: ChainSpec, cache: ChainCache = createChainCache()): Field {
  const key = chainCacheKey(spec);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const bare = buildHeightfield({
    seed: spec.seed,
    gridW: spec.gridW,
    gridH: spec.gridH,
    mapType: spec.mapType,
    window: spec.window,
    worldAspect: spec.worldAspect,
    detail: detailForWindow(spec.window),
    ...(spec.coastWarp !== undefined ? { coastWarp: spec.coastWarp } : {}),
  });

  const ancestors = ancestorWindows(spec.window);
  let out = bare;
  if (ancestors.length > 0) {
    const fields = ancestors.map((w) =>
      buildChainedField({ ...spec, window: w, ...gridForWindow(w) }, cache),
    );
    const surfaces = fields.map((f, i) =>
      parentSurfaceOnWindow(f, ancestors[i] as UvWindow, spec.window, spec.gridW, spec.gridH),
    );
    const cells = fields.map((f, i) =>
      parentCellsOnWindow(f, ancestors[i] as UvWindow, spec.window, spec.gridW, spec.gridH),
    );
    const floors = surfaces.map((s, i) => gateToParentLand(s, cells[i] as Field, spec.seaLevel));
    const coarse = maxOfSurfaces(floors, spec.gridW, spec.gridH);
    const worldCells = cells[cells.length - 1] as Field;
    out = floorToParent(bare, coarse);
    for (const nn of cells) out = rejectBridges(nn, worldCells, out, spec.seaLevel);
  }

  cache.set(key, out);
  return out;
}
