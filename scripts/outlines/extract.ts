import { readFileSync } from "node:fs";
import { join } from "node:path";
import { encodeRings } from "../../src/terrain/outline-codec.ts";
import { serialId } from "./ids.ts";
import { CELL, boxOf, diagonal2, fitScale, ringArea } from "./plane.ts";
import { projectPlace, type LonLat } from "./project.ts";
import { simplifyRing } from "../simplify.ts";
import type { Kind } from "./build.ts";

export const THIN = 1e-4;
export const STEP = 1e-4;
export const EXTRACT_KEEP_CELLS = 0.1;

export type Feature = {
  readonly properties: Readonly<Record<string, unknown>>;
  readonly geometry: { readonly type: string; readonly coordinates: unknown } | null;
};
export type Source = { readonly kind: Kind; readonly file: string };
export const SOURCES: readonly Source[] = [
  { kind: "country", file: "ne_10m_admin_0_countries.geojson" },
  { kind: "unit", file: "ne_10m_admin_0_map_units.geojson" },
  { kind: "state", file: "ne_10m_admin_1_states_provinces.geojson" },
  { kind: "lake", file: "ne_10m_lakes.geojson" },
];

export function text(f: Feature, key: string): string {
  const v = f.properties[key];
  return typeof v === "string" ? v : "";
}

export function readFeatures(dir: string, file: string): Feature[] {
  return (JSON.parse(readFileSync(join(dir, file), "utf8")) as { features: Feature[] }).features;
}

export function featureRings(f: Feature): LonLat[][] {
  const g = f.geometry;
  if (g === null) return [];
  const polygons = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  const rings: LonLat[][] = [];
  for (const polygon of polygons) {
    const outer = polygon[0]!.map(([lon, lat]) => [lon!, lat!] as const);
    const [a, b] = [outer[0]!, outer[outer.length - 1]!];
    const open = a[0] === b[0] && a[1] === b[1] ? outer.slice(0, -1) : outer;
    if (open.length >= 3) rings.push(open);
  }
  return rings;
}

export function extractParts(rings: readonly (readonly LonLat[])[]): number[][] {
  const { rings: plane, main } = projectPlace(rings);
  const lp = boxOf([plane[main]!]);
  const s = fitScale(lp);
  const least = (EXTRACT_KEEP_CELLS * CELL * CELL) / (s * s);
  const diag = Math.sqrt(diagonal2(lp));
  const unit = diag * STEP;
  const ox = (lp.x0 + lp.x1) / 2,
    oy = (lp.y0 + lp.y1) / 2;
  const out: number[][] = [];
  plane.forEach((ring, i) => {
    if (i !== main && ringArea(ring) < least) return;
    const q: number[] = [];
    for (const [x, y] of simplifyRing(ring, THIN * diag)) {
      const qx = Math.round((x - ox) / unit),
        qy = Math.round((y - oy) / unit);
      if (q.length >= 2 && q[q.length - 2] === qx && q[q.length - 1] === qy) continue;
      q.push(qx, qy);
    }
    while (q.length >= 4 && q[0] === q[q.length - 2] && q[1] === q[q.length - 1]) q.splice(-2, 2);
    if (q.length < 6) return;
    if (i === main) out.unshift(q);
    else out.push(q);
  });
  return out;
}

export function extractText(f: Feature): string {
  return encodeRings(extractParts(featureRings(f)));
}

export type Candidate = {
  readonly kind: Kind;
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly feature: Feature;
};

export function candidates(features: Readonly<Record<Kind, readonly Feature[]>>): Candidate[] {
  const countries = features.country;
  const admins = new Set(countries.map((c) => text(c, "ADMIN")));
  const byA3 = new Map(countries.map((c) => [text(c, "ADM0_A3"), c]));
  const out: Candidate[] = [];
  const add = (kind: Kind, f: Feature, serial: string, name: string, country: string) =>
    out.push({ kind, id: serialId(f.properties[serial]), name, country, feature: f });
  for (const f of countries) add("country", f, "NE_ID", text(f, "ADMIN"), "");
  for (const f of features.unit)
    if (text(f, "GU_A3") !== text(f, "ADM0_A3") && !admins.has(text(f, "GEOUNIT")))
      add("unit", f, "NE_ID", text(f, "GEOUNIT"), text(f, "ADMIN"));
  for (const f of features.state) {
    const c = byA3.get(text(f, "adm0_a3"));
    if (c === undefined) throw new RangeError(`state ${text(f, "adm1_code")} has no country ${text(f, "adm0_a3")}`);
    add("state", f, "ne_id", text(f, "name_en") || text(f, "name") || text(f, "adm1_code"), text(c, "ADMIN"));
  }
  for (const f of features.lake) if (text(f, "name") !== "") add("lake", f, "ne_id", text(f, "name"), "");
  const order: Record<Kind, number> = { country: 0, unit: 1, state: 2, lake: 3 };
  return out.sort((a, b) => order[a.kind] - order[b.kind] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
