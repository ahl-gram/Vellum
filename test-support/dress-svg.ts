// String-level SVG probes for the prospect dress tests (#240): assertions are on the exact emitted bytes, not a parsed DOM.

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
