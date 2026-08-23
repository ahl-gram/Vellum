import { createField, fieldFrom, type Field } from "../core/grid.ts";
import type { UvWindow } from "./heightfield.ts";
import { labelLandmasses } from "../world/landmass.ts";
import { labelComponents } from "../core/mask-components.ts";

export const BRIDGE_REJECT_EPS = 1e-6;

const COVER_TOL = 1e-9;

function parentCoords(
  parent: Field,
  parentWindow: UvWindow,
  childWindow: UvWindow,
  w: number,
  h: number,
  x: number,
  y: number,
): { readonly px: number; readonly py: number } | null {
  const u = childWindow.u0 + (x / (w - 1)) * (childWindow.u1 - childWindow.u0);
  const v = childWindow.v0 + (y / (h - 1)) * (childWindow.v1 - childWindow.v0);
  const px = ((u - parentWindow.u0) / (parentWindow.u1 - parentWindow.u0)) * (parent.w - 1);
  const py = ((v - parentWindow.v0) / (parentWindow.v1 - parentWindow.v0)) * (parent.h - 1);
  if (px < -COVER_TOL || px > parent.w - 1 + COVER_TOL) return null;
  if (py < -COVER_TOL || py > parent.h - 1 + COVER_TOL) return null;
  return { px: Math.min(Math.max(px, 0), parent.w - 1), py: Math.min(Math.max(py, 0), parent.h - 1) };
}

/** Nearest-neighbour sampling and the naive per-cell clamp both draw the shore as rectangular staircases at depth, which no test can pin (#397). */
export function parentSurfaceOnWindow(
  parent: Field,
  parentWindow: UvWindow,
  childWindow: UvWindow,
  w: number,
  h: number,
): Field {
  return createField(w, h, (x, y) => {
    const p = parentCoords(parent, parentWindow, childWindow, w, h, x, y);
    if (p === null) return NaN;
    const cx = p.px;
    const cy = p.py;
    const x0 = Math.min(Math.floor(cx), parent.w - 2);
    const y0 = Math.min(Math.floor(cy), parent.h - 2);
    const tx = cx - x0;
    const ty = cy - y0;
    const a = parent.at(x0, y0);
    const b = parent.at(x0 + 1, y0);
    const c = parent.at(x0, y0 + 1);
    const d = parent.at(x0 + 1, y0 + 1);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  });
}

/** The parent's OWN cell under each child cell, nearest neighbour. Interpolation cannot carry a channel one cell wide, so the parent's verdict on land and water has to travel unblurred (#443). */
export function parentCellsOnWindow(
  parent: Field,
  parentWindow: UvWindow,
  childWindow: UvWindow,
  w: number,
  h: number,
): Field {
  return createField(w, h, (x, y) => {
    const p = parentCoords(parent, parentWindow, childWindow, w, h, x, y);
    if (p === null) return NaN;
    return parent.at(
      Math.min(Math.round(p.px), parent.w - 1),
      Math.min(Math.round(p.py), parent.h - 1),
    );
  });
}

/** The parent's cell decides WHETHER it floors, its interpolated surface decides how high. Ungated, the surface rises over a one-cell strait and fills a one-cell basin, inventing land the parent never had (#443). */
export function gateToParentLand(surface: Field, cells: Field, seaLevel: number): Field {
  if (surface.w !== cells.w || surface.h !== cells.h) {
    throw new RangeError(
      `gateToParentLand: field sizes differ (${surface.w}x${surface.h} vs ${cells.w}x${cells.h})`,
    );
  }
  const data = new Float64Array(surface.data.length);
  for (let i = 0; i < data.length; i++) {
    data[i] = (cells.data[i] as number) > seaLevel ? (surface.data[i] as number) : NaN;
  }
  return fieldFrom(surface.w, surface.h, data);
}

export function floorToParent(fine: Field, parentSurface: Field): Field {
  if (fine.w !== parentSurface.w || fine.h !== parentSurface.h) {
    throw new RangeError(
      `floorToParent: field sizes differ (${fine.w}x${fine.h} vs ${parentSurface.w}x${parentSurface.h})`,
    );
  }
  const data = new Float64Array(fine.data.length);
  for (let i = 0; i < data.length; i++) {
    const n = fine.data[i] as number;
    const pv = parentSurface.data[i] as number;
    data[i] = Number.isFinite(pv) ? Math.max(n, pv) : n;
  }
  return fieldFrom(fine.w, fine.h, data);
}

/** 4-connectivity throughout, matching labelLandmasses, is what makes anti-merge structural: any new-land path joining two landmasses is one gained component touching both. */
export function rejectBridges(
  coarse: Field,
  immovable: Field,
  fine: Field,
  seaLevel: number,
): Field {
  if (coarse.w !== fine.w || coarse.h !== fine.h) {
    throw new RangeError(
      `rejectBridges: field sizes differ (${coarse.w}x${coarse.h} vs ${fine.w}x${fine.h})`,
    );
  }
  // A short immovable field reads as undefined, then NaN, then not-land, and every protected cell silently becomes rejectable.
  if (immovable.w !== fine.w || immovable.h !== fine.h) {
    throw new RangeError(
      `rejectBridges: immovable size differs (${immovable.w}x${immovable.h} vs ${fine.w}x${fine.h})`,
    );
  }
  const { w, h } = coarse;
  const n = w * h;
  const { ids: coarseIds } = labelLandmasses(coarse, seaLevel);
  const gained = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    // Negated rather than <=, so a NaN coarse cell counts as not-land and its fine land joins the gained mask; labelLandmasses reads NaN as sea the same way.
    if (
      !((coarse.data[i] as number) > seaLevel) &&
      !((immovable.data[i] as number) > seaLevel) &&
      (fine.data[i] as number) > seaLevel
    ) {
      gained[i] = 1;
    }
  }
  const gainIds = labelComponents(gained, w, h, 4);
  const touched = new Map<number, Set<number>>();
  for (let i = 0; i < n; i++) {
    const gid = gainIds[i] as number;
    if (gid === -1) continue;
    const x = i % w;
    const y = (i / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const cid = coarseIds[nx + ny * w] as number;
      if (cid === -1) continue;
      let set = touched.get(gid);
      if (!set) {
        set = new Set();
        touched.set(gid, set);
      }
      set.add(cid);
    }
  }
  const data = Float64Array.from(fine.data);
  for (let i = 0; i < n; i++) {
    const gid = gainIds[i] as number;
    if (gid === -1) continue;
    if ((touched.get(gid)?.size ?? 0) >= 2) data[i] = seaLevel - BRIDGE_REJECT_EPS;
  }
  return fieldFrom(w, h, data);
}
