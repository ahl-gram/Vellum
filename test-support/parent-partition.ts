import type { Field } from "../src/core/grid.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";
import { labelLandmasses } from "../src/world/landmass.ts";

/** The parent's own landmass id under each child cell, -1 where the parent is sea or does not cover the cell. Labelled on the parent's WHOLE grid, so one landmass entering the window twice stays one landmass, and resampled by rounding rather than by anything the construction under test also uses: a guard measured against a resampled reference shares its oracle with the defect, which is why 1428 green tests could not see #443. */
export function parentPartitionOnWindow(
  parent: Field,
  parentWindow: UvWindow,
  childWindow: UvWindow,
  w: number,
  h: number,
  seaLevel: number,
): Int32Array {
  const { ids } = labelLandmasses(parent, seaLevel);
  const pdu = parentWindow.u1 - parentWindow.u0;
  const pdv = parentWindow.v1 - parentWindow.v0;
  const cdu = childWindow.u1 - childWindow.u0;
  const cdv = childWindow.v1 - childWindow.v0;
  const out = new Int32Array(w * h).fill(-1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = childWindow.u0 + (x / (w - 1)) * cdu;
      const v = childWindow.v0 + (y / (h - 1)) * cdv;
      const px = Math.round(((u - parentWindow.u0) / pdu) * (parent.w - 1));
      const py = Math.round(((v - parentWindow.v0) / pdv) * (parent.h - 1));
      if (px < 0 || px > parent.w - 1 || py < 0 || py > parent.h - 1) continue;
      out[x + y * w] = ids[px + py * parent.w] as number;
    }
  }
  return out;
}

export type FusionReport = {
  /** Excess links: a child landmass covering k parent landmasses contributes k-1. */
  readonly pairs: number;
  /** Cells assigned to a parent landmass other than the first one seen in their child landmass. */
  readonly cells: number;
  readonly groups: ReadonlyArray<ReadonlyArray<number>>;
};

export function parentFusion(child: Field, partition: Int32Array, seaLevel: number): FusionReport {
  const { ids: childIds } = labelLandmasses(child, seaLevel);
  const owner = new Map<number, Set<number>>();
  const first = new Map<number, number>();
  let cells = 0;
  for (let i = 0; i < partition.length; i++) {
    const pid = partition[i] as number;
    const cid = childIds[i] as number;
    if (pid === -1 || cid === -1) continue;
    let s = owner.get(cid);
    if (s === undefined) {
      s = new Set();
      owner.set(cid, s);
    }
    s.add(pid);
    const seen = first.get(cid);
    if (seen === undefined) first.set(cid, pid);
    else if (seen !== pid) cells++;
  }
  let pairs = 0;
  const groups: number[][] = [];
  for (const [, s] of owner) {
    if (s.size < 2) continue;
    pairs += s.size - 1;
    groups.push([...s].sort((a, b) => a - b));
  }
  return { pairs, cells, groups };
}

/** Parent landmasses that reach into the window and hold no land at all in the child: the promise that a shore does not simply vanish as the Glass descends. */
export function parentMassesLost(child: Field, partition: Int32Array, seaLevel: number): number[] {
  const present = new Set<number>();
  const survives = new Set<number>();
  for (let i = 0; i < partition.length; i++) {
    const pid = partition[i] as number;
    if (pid === -1) continue;
    present.add(pid);
    if ((child.data[i] as number) > seaLevel) survives.add(pid);
  }
  return [...present].filter((pid) => !survives.has(pid));
}
