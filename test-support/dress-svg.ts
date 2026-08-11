/**
 * SVG-string probes for the prospect dress tests (#240). String-level on
 * purpose: the tests assert on the exact bytes the renderer emits, not on a
 * parsed DOM's idea of them.
 */

export function attrsOf(elem: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of elem.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    out[m[1]!] = m[2]!;
  }
  return out;
}

/** All <path> d strings whose fill is the style's land token, sorted. The
 * paper-filled solids (masses, walls, ridge, mound, hulls...) are exactly
 * the composition, so their d multiset must be dress-invariant. */
export function landPathD(svg: string, land: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const a = attrsOf(m[0]!);
    if (a.fill === land && a.d !== undefined) out.push(a.d);
  }
  return out.sort();
}
