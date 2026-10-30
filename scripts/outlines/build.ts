import { decodeRings, encodeRings } from "../../src/terrain/outline-codec.ts";
import { ASPECT, CELL, boxOf, diagonal2, fitScale, gap2, ringArea, type Box } from "./plane.ts";
import { simplifyRing, type P } from "../simplify.ts";

export const EPSILON = 1;
export const KEEP_CELLS = 1;
export const NEAR = 3;

function pointsOf(part: readonly number[]): P[] {
  const pts: P[] = [];
  for (let i = 0; i < part.length; i += 2) pts.push([part[i]!, part[i + 1]!]);
  return pts;
}

function nearParts(rings: readonly P[][], alive: readonly boolean[]): boolean[] {
  const boxes: Box[] = rings.map((r) => boxOf([r]));
  const reach2 = boxes.map((b) => NEAR * NEAR * diagonal2(b));
  const kept = rings.map((_, i) => i === 0);
  for (let grew = true; grew;) {
    grew = false;
    for (let i = 1; i < rings.length; i++) {
      if (kept[i] || !alive[i]) continue;
      if (boxes.some((b, j) => kept[j] && gap2(boxes[i]!, b) <= reach2[i]!)) {
        kept[i] = true;
        grew = true;
      }
    }
  }
  return kept;
}

function thousandths(rings: readonly P[][]): number[][] {
  const b = boxOf(rings);
  const s = fitScale(b);
  const cx = (b.x0 + b.x1) / 2,
    cy = (b.y0 + b.y1) / 2;
  const out: number[][] = [];
  for (const ring of rings) {
    const q: number[] = [];
    for (const [x, y] of ring) {
      const u = Math.round((0.5 + ((x - cx) * s) / ASPECT) * 1000);
      const v = Math.round((0.5 - (y - cy) * s) * 1000);
      if (q.length >= 2 && q[q.length - 2] === u && q[q.length - 1] === v) continue;
      q.push(u, v);
    }
    while (q.length >= 4 && q[0] === q[q.length - 2] && q[1] === q[q.length - 1]) q.splice(-2, 2);
    if (q.length >= 6) out.push(q);
  }
  return out;
}

export function buildPlace(parts: readonly (readonly number[])[]): number[][] {
  const rings = parts.map(pointsOf);
  const s0 = fitScale(boxOf([rings[0]!]));
  const least = (KEEP_CELLS * CELL * CELL) / (s0 * s0);
  const alive = rings.map((r, i) => i === 0 || ringArea(r) >= least);
  const kept = nearParts(rings, alive);
  const chosen = rings.filter((_, i) => kept[i]);
  const s1 = fitScale(boxOf(chosen));
  return thousandths(chosen.map((r) => simplifyRing(r, EPSILON / 1000 / s1)));
}

export type KitPlace = {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly parts: string;
};
export type Kind = "country" | "unit" | "state" | "lake";
export type Roster = { readonly table: string; readonly idsModule: string; readonly names: string };

export function buildRoster(kit: ReadonlyArray<readonly [Kind, readonly KitPlace[]]>): Roster {
  const rows: Array<readonly [string, string, Kind, string, string]> = [];
  for (const [kind, places] of kit)
    for (const p of places) rows.push([p.id, p.name, kind, p.country, encodeRings(buildPlace(decodeRings(p.parts)))]);
  rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const table = `{\n${rows.map((r) => `${JSON.stringify(r[0])}: ${JSON.stringify(r[4])}`).join(",\n")}\n}\n`;
  const idsModule = `export const PLACE_ID_LIST =\n  ${JSON.stringify(rows.map((r) => r[0]).join("\n"))};\n`;
  const names = `[\n${rows.map((r) => `  ${JSON.stringify([r[0], r[1], r[2], r[3]])}`).join(",\n")}\n]\n`;
  return { table, idsModule, names };
}
