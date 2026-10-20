// Issue #849 spike: the outlines a shaped world is drawn inside, and the signed distance to one.
// Space (Sub 2, Issue #851, item 2): sheet coordinates u, v in 0..1 (v grows southward), and every distance is
// measured with the horizontal offset multiplied by the grid aspect, so a stored circle draws round on the 4:3 sheet.
// Distances below are in SHEET HEIGHTS (aspect-corrected).
import { readFileSync } from "node:fs";

export const NE_DIR = "/Users/ahl/CodeProjects/Vellum/out/844/refs/natural-earth/";
export const ASPECT = 319 / 239;

export type Pt = readonly [number, number];
export type Ring = ReadonlyArray<Pt>;
export type Outline = {
  readonly id: string;
  readonly name: string;
  readonly rings: ReadonlyArray<Ring>;
  readonly source: string;
  readonly fit: string;
};

// STAND-IN, not ruled: "the inner box" the issue names is defined nowhere. This round fits every outline
// north-up and centred into the box inset INNER_INSET of the sheet on every side (the lobes' own inset, 0.14,
// `probe-lobes-2.ts`), so the shape spans at most 72 percent of the sheet's height or width.
export const INNER_INSET = 0.14;

type Projected = { readonly rings: ReadonlyArray<Ring>; readonly note: string };

function bbox(rings: ReadonlyArray<Ring>): { x0: number; y0: number; x1: number; y1: number } {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const r of rings)
    for (const [x, y] of r) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return { x0, y0, x1, y1 };
}

// Fit rings given in a north-up plane (x east, y NORTH, equal units both ways) into the inner box, centred.
export function fitNorthUp(rings: ReadonlyArray<Ring>, inset: number = INNER_INSET): Ring[] {
  const b = bbox(rings);
  const boxW = (1 - 2 * inset) * ASPECT;
  const boxH = 1 - 2 * inset;
  const s = Math.min(boxW / (b.x1 - b.x0), boxH / (b.y1 - b.y0));
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  return rings.map((r) => r.map(([x, y]) => [0.5 + ((x - cx) * s) / ASPECT, 0.5 - (y - cy) * s] as const));
}

// Sub 4's projection (Issue #853): longitude scaled by the cosine of the place's middle latitude, a plate carree centred on the place.
function projectDegrees(rings: ReadonlyArray<Ring>): Projected {
  const b = bbox(rings);
  const lat0 = (b.y0 + b.y1) / 2;
  const k = Math.cos((lat0 * Math.PI) / 180);
  return {
    rings: rings.map((r) => r.map(([lon, lat]) => [lon * k, lat] as const)),
    note: `longitude x cos(${lat0.toFixed(2)} deg) = x ${k.toFixed(4)}`,
  };
}

// Turned so the shape's long axis lies along the sheet's long (east-west) axis: the principal axis of the vertices.
function turnToLongAxis(rings: ReadonlyArray<Ring>): { rings: Ring[]; degrees: number } {
  let n = 0,
    mx = 0,
    my = 0;
  for (const r of rings)
    for (const [x, y] of r) {
      mx += x;
      my += y;
      n++;
    }
  mx /= n;
  my /= n;
  let sxx = 0,
    syy = 0,
    sxy = 0;
  for (const r of rings)
    for (const [x, y] of r) {
      sxx += (x - mx) ** 2;
      syy += (y - my) ** 2;
      sxy += (x - mx) * (y - my);
    }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const c = Math.cos(-theta),
    s = Math.sin(-theta);
  return {
    rings: rings.map((r) => r.map(([x, y]) => [(x - mx) * c - (y - my) * s, (x - mx) * s + (y - my) * c] as const)),
    degrees: (theta * 180) / Math.PI,
  };
}

type Feature = { properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } };

function featureRings(file: string, match: (p: Record<string, unknown>) => boolean): { rings: Ring[]; parts: number[] } {
  const json = JSON.parse(readFileSync(`${NE_DIR}${file}`, "utf8")) as { features: Feature[] };
  const f = json.features.find((x) => match(x.properties));
  if (f === undefined) throw new Error(`no matching feature in ${file}`);
  const g = f.geometry;
  const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as number[][][][];
  // Holes dropped, every part kept as its own ring (Sub 4's rule: Japan and Hawaii are island chains).
  const rings = polys.map((p) => (p[0] as number[][]).map(([x, y]) => [x as number, y as number] as const));
  return { rings, parts: rings.map((r) => r.length) };
}

function closedCircle(cx: number, cy: number, r: number, n: number, from: number, to: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

// A hand-drawn house form: a crescent, the outer disc less an inner disc set off to the east, horns to the north-east and south-east.
function crescentRings(): Ring[] {
  const R = 1,
    r = 0.9,
    off = 0.5;
  // Where the two circles cross: x = (R^2 - r^2 + off^2) / (2 off), y = +-sqrt(R^2 - x^2).
  const xi = (R * R - r * r + off * off) / (2 * off);
  const yi = Math.sqrt(R * R - xi * xi);
  const aOuter = Math.atan2(yi, xi);
  const aInner = Math.atan2(yi, xi - off);
  const outer = closedCircle(0, 0, R, 96, aOuter, 2 * Math.PI - aOuter);
  const inner = closedCircle(off, 0, r, 72, 2 * Math.PI - aInner, aInner).slice(1, -1);
  // Outer arc runs west round the back (anticlockwise in a y-north plane), inner arc returns through the bite.
  return [[...outer, ...inner]];
}

export function crescent(inset: number = INNER_INSET): Outline {
  return { id: "crescent", name: "the crescent (a hand-drawn house form)", rings: fitNorthUp(crescentRings(), inset), source: "drawn for this round", fit: `north-up in the inner box inset ${inset}` };
}

export function texas(inset: number = INNER_INSET): Outline {
  const { rings, parts } = featureRings("ne_110m_admin_1_states_provinces.geojson", (p) => p["name"] === "Texas");
  const pr = projectDegrees(rings);
  return { id: "texas", name: "Texas", rings: fitNorthUp(pr.rings, inset), source: `Natural Earth 1:110m admin 1 (ne_110m_admin_1_states_provinces.geojson), feature "Texas" (US-TX), ${parts.length} ring of ${parts.join("+")} vertices; ${pr.note}`, fit: `north-up in the inner box inset ${inset}` };
}

export function japan(turned: boolean, inset: number = INNER_INSET): Outline {
  const { rings, parts } = featureRings("ne_110m_admin_0_countries.geojson", (p) => p["NAME"] === "Japan");
  const pr = projectDegrees(rings);
  if (!turned) {
    return { id: "japan", name: "Japan, north up", rings: fitNorthUp(pr.rings, inset), source: `Natural Earth 1:110m admin 0 (ne_110m_admin_0_countries.geojson), feature "Japan" (JPN), ${parts.length} rings of ${parts.join("+")} vertices; ${pr.note}`, fit: `north-up in the inner box inset ${inset}` };
  }
  const t = turnToLongAxis(pr.rings);
  return { id: "japan-turned", name: "Japan, turned to the sheet's long axis", rings: fitNorthUp(t.rings, inset), source: `as "Japan, north up", then turned ${(-t.degrees).toFixed(1)} deg so its principal axis lies east-west`, fit: `turned, then fitted in the inner box inset ${inset}` };
}

// Segments in aspect-corrected space, precomputed once per outline for the per-cell distance.
export type OutlineField = {
  readonly outline: Outline;
  readonly ax: Float64Array;
  readonly ay: Float64Array;
  readonly bx: Float64Array;
  readonly by: Float64Array;
};

export function outlineField(outline: Outline): OutlineField {
  const segs: number[][] = [];
  for (const r of outline.rings) {
    for (let i = 0; i < r.length; i++) {
      const a = r[i] as Pt;
      const b = r[(i + 1) % r.length] as Pt;
      if (a[0] === b[0] && a[1] === b[1]) continue;
      segs.push([a[0] * ASPECT, a[1], b[0] * ASPECT, b[1]]);
    }
  }
  return {
    outline,
    ax: Float64Array.from(segs, (s) => s[0] as number),
    ay: Float64Array.from(segs, (s) => s[1] as number),
    bx: Float64Array.from(segs, (s) => s[2] as number),
    by: Float64Array.from(segs, (s) => s[3] as number),
  };
}

// Negative inside (even-odd over every ring), positive outside, in sheet heights.
export function signedDistance(f: OutlineField, u: number, v: number): number {
  const px = u * ASPECT;
  const py = v;
  let best = Infinity;
  let inside = false;
  const n = f.ax.length;
  for (let i = 0; i < n; i++) {
    const ax = f.ax[i] as number,
      ay = f.ay[i] as number,
      bx = f.bx[i] as number,
      by = f.by[i] as number;
    const dx = bx - ax,
      dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = ax + t * dx - px,
      qy = ay + t * dy - py;
    const d2 = qx * qx + qy * qy;
    if (d2 < best) best = d2;
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  const d = Math.sqrt(best);
  return inside ? -d : d;
}

export function isInside(f: OutlineField, u: number, v: number): boolean {
  return signedDistance(f, u, v) < 0;
}
