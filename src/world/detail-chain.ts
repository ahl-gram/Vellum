import { fieldFrom, type Field } from "../core/grid.ts";
import {
  buildHeightfield,
  MAX_DETAIL,
  type MapType,
  type UvWindow,
} from "../terrain/heightfield.ts";
import { floorToParent, parentSurfaceOnWindow, rejectBridges } from "../terrain/detail-guarantees.ts";
import { FULL_WINDOW, LOD_BANDS, lodWindowFor, quantizeCenter, type LodBand } from "./lod.ts";

export type ChainSpec = {
  readonly seed: number;
  readonly mapType: MapType;
  readonly band: number;
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

/** Derived from the WINDOW alone, never the camera path or the band: two routes to one window must agree cell for cell, the byte-identity contract in lod.ts. A window that cannot be doubled inside the sheet parents on the full window, which covers bands 0 and 1 without asking what band it is, so the atlas window (not a LOD band, #423) chains too. */
export function canonicalParent(win: UvWindow): UvWindow {
  const parentSize = (win.u1 - win.u0) * 2;
  if (parentSize >= 1) return FULL_WINDOW;
  const q = quantizeCenter((win.u0 + win.u1) / 2, (win.v0 + win.v1) / 2, parentSize);
  return lodWindowFor(q.cx, q.cy, parentSize);
}

/** The window's ancestry, nearest parent first, ending at the full window. */
export function ancestorWindows(win: UvWindow): UvWindow[] {
  const out: UvWindow[] = [];
  let w = win;
  while (w.u1 - w.u0 < 1) {
    w = canonicalParent(w);
    out.push(w);
    if (w.u1 - w.u0 >= 1) break;
  }
  return out;
}

export function detailForWindow(win: UvWindow): number {
  const size = win.u1 - win.u0;
  const level = Math.round(Math.log2(1 / size));
  return Math.min(Math.max(level, 0), MAX_DETAIL);
}

export function chainCacheKey(spec: ChainSpec): string {
  const w = spec.window;
  return [
    spec.seed,
    spec.mapType,
    spec.band,
    detailForWindow(spec.window),
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

/** NaN means a cell no ancestor covers, so it must not win the max and must stay NaN when every ancestor abstains: floorToParent then leaves the fine value alone. */
function maxOfSurfaces(surfaces: ReadonlyArray<Field>, w: number, h: number): Field {
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

function bandGrid(band: number): { readonly gridW: number; readonly gridH: number } {
  const b = LOD_BANDS[band] as LodBand | undefined;
  return b ? { gridW: b.gridW, gridH: b.gridH } : { gridW: 320, gridH: 240 };
}

/** Each band floored and de-bridged against the PREVIOUS band's adjusted field, not against band 0: anchoring everything to the world chart leaves features born mid-descent unprotected at the next band. */
export function buildChainedField(spec: ChainSpec, cache?: ChainCache): Field {
  const key = chainCacheKey(spec);
  const hit = cache?.get(key);
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

  let out = bare;
  if (spec.band > 0) {
    // Floored against EVERY ancestor, not just the parent (Alex, 2026-08-22). Two bilinear resamples in a row smooth differently from one, so parent-only flooring let ~30 waterline cells per window sink relative to a grandparent; the elementwise max makes "nothing that was land ever sinks" exact from any ancestor at any depth.
    const windows = ancestorWindows(spec.window).slice(0, spec.band);
    const surfaces = windows.map((w, i) =>
      parentSurfaceOnWindow(
        buildChainedField(
          { ...spec, band: spec.band - 1 - i, window: w, ...bandGrid(spec.band - 1 - i) },
          cache,
        ),
        w,
        spec.window,
        spec.gridW,
        spec.gridH,
      ),
    );
    const coarse = maxOfSurfaces(surfaces, spec.gridW, spec.gridH);
    out = rejectBridges(coarse, floorToParent(bare, coarse), spec.seaLevel);
  }

  cache?.set(key, out);
  return out;
}
