// String-level SVG probes shared by the prospect dress and finished-plate tests: assertions are on the exact emitted bytes, not a parsed DOM.

import type { MapStyle } from "../src/render/style.ts";
import type { Tincture } from "../src/society/heraldry.ts";
import { paletteForStyle } from "../src/render/layers/heraldry.ts";

const TINCTURES: ReadonlyArray<Tincture> = ["or", "argent", "gules", "azure", "sable", "vert", "purpure"];

/** The tokens the dress may draw from: the style's inks and papers, its limner's washes, and the heraldic palette the realm's clothes are cut from; deliberately NOT the whole style object: realmTints are excluded so a hard-coded grey that happens to equal a tint still fails. */
export function tokenColors(s: MapStyle): Set<string> {
  const palette = paletteForStyle(s);
  return new Set(
    [s.paper, s.ink, s.inkSoft, s.ocean, s.waterline, s.coastStroke, s.land, ...Object.values(s.limner ?? {}), ...TINCTURES.map((t) => palette.tincture(t))].map((c) =>
      c.toLowerCase(),
    ),
  );
}

export function fnv1a(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function attrsOf(elem: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of elem.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    out[m[1]!] = m[2]!;
  }
  return out;
}

/** Every outlined solid's d, sorted: paths that fill and carry a stroke. Their shapes are the composition, which the dress may recolour but never redraw. */
export function outlinedSolids(svg: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const a = attrsOf(m[0]);
    if (a.d !== undefined && a.fill !== undefined && a.fill !== "none" && a.stroke !== undefined) out.push(a.d);
  }
  return out.sort();
}
