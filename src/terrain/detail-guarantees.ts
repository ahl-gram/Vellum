import { createField, fieldFrom, type Field } from "../core/grid.ts";
import type { UvWindow } from "./heightfield.ts";
import { labelLandmasses } from "../world/landmass.ts";
import { labelComponents } from "../core/mask-components.ts";

export const BRIDGE_REJECT_EPS = 1e-6;

const COVER_TOL = 1e-9;

/** The parent's elevation surface resampled onto a child window's grid, bilinearly so protected ground keeps the parent's gradient (#397; the naive per-cell clamp and nearest-neighbour sampling both draw staircase coasts at depth). Child cells outside the parent window come back NaN. */
export function parentSurfaceOnWindow(
  parent: Field,
  parentWindow: UvWindow,
  childWindow: UvWindow,
  w: number,
  h: number,
): Field {
  const pdu = parentWindow.u1 - parentWindow.u0;
  const pdv = parentWindow.v1 - parentWindow.v0;
  const cdu = childWindow.u1 - childWindow.u0;
  const cdv = childWindow.v1 - childWindow.v0;
  return createField(w, h, (x, y) => {
    const u = childWindow.u0 + (x / (w - 1)) * cdu;
    const v = childWindow.v0 + (y / (h - 1)) * cdv;
    const px = ((u - parentWindow.u0) / pdu) * (parent.w - 1);
    const py = ((v - parentWindow.v0) / pdv) * (parent.h - 1);
    if (px < -COVER_TOL || px > parent.w - 1 + COVER_TOL) return NaN;
    if (py < -COVER_TOL || py > parent.h - 1 + COVER_TOL) return NaN;
    const cx = Math.min(Math.max(px, 0), parent.w - 1);
    const cy = Math.min(Math.max(py, 0), parent.h - 1);
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

/** Floors the fine field with the parent surface, cell by cell. Raising is the only move it has, so coarse land cannot sink by construction; NaN surface cells (outside the parent window) leave the fine value alone. */
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

/** Labels the land gained over the coarse field and rejects every gained component that touches two or more coarse landmasses, sending its cells back just under the waterline. Zero touches is a new islet and one is a spur, both kept; 4-connectivity throughout, matching labelLandmasses and the gained components, which is what makes the anti-merge guarantee structural: any new-land path joining two landmasses is one gained component touching both. */
export function rejectBridges(coarse: Field, fine: Field, seaLevel: number): Field {
  if (coarse.w !== fine.w || coarse.h !== fine.h) {
    throw new RangeError(
      `rejectBridges: field sizes differ (${coarse.w}x${coarse.h} vs ${fine.w}x${fine.h})`,
    );
  }
  const { w, h } = coarse;
  const n = w * h;
  const { ids: coarseIds } = labelLandmasses(coarse, seaLevel);
  const gained = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if ((coarse.data[i] as number) <= seaLevel && (fine.data[i] as number) > seaLevel) {
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
