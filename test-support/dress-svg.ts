// String-level SVG probes shared by the prospect dress and finished-plate tests (#240, #241): assertions are on the exact emitted bytes, not a parsed DOM.

import type { MapStyle } from "../src/render/style.ts";

/** The tokens the dress may draw from; deliberately NOT the whole style object: realmTints are excluded so a hard-coded grey that happens to equal a tint still fails. */
export function tokenColors(s: MapStyle): Set<string> {
  return new Set(
    [s.paper, s.ink, s.inkSoft, s.ocean, s.waterline, s.coastStroke, s.land].map((c) =>
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

/** All land-filled <path> d strings, sorted: the composition solids, whose d multiset must be dress-invariant. */
export function landPathD(svg: string, land: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const a = attrsOf(m[0]!);
    if (a.fill === land && a.d !== undefined) out.push(a.d);
  }
  return out.sort();
}
