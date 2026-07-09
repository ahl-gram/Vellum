/**
 * Independent ground truth for #175: reconstruct what a label ACTUALLY draws, so a
 * test can catch glyphs overlapping even when their claimed boxes did not.
 *
 * Deliberately does not import `spacedTextBox`: the whole bug is that the claim
 * geometry disagreed with the rendered geometry, so a test that reuses the claim
 * helper would be blind to it. Everything here is derived from the SVG output.
 */

export type Pt = { readonly x: number; readonly y: number };
export type Poly = ReadonlyArray<Pt>;

/** Caps run wider than the 0.56 mixed-case factor `spacedTextBox` used to assume. */
export const CAPS_WIDTH_FACTOR = 0.72;

export type LabelNode = {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly fontSize: number;
  readonly letterSpacing: number;
  /** SVG `rotate(deg ox oy)`, when the label is spun along a ridge. */
  readonly rotate: { deg: number; ox: number; oy: number } | null;
};

const NUM = "([-\\d.]+)";

/** Every <text> node in the SVG, with the attributes label geometry depends on. */
export function textNodes(svg: string): LabelNode[] {
  const out: LabelNode[] = [];
  for (const m of svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)) {
    const attrs = m[1] as string;
    const text = m[2] as string;
    const x = Number(attrs.match(new RegExp(` x="${NUM}"`))?.[1]);
    const y = Number(attrs.match(new RegExp(` y="${NUM}"`))?.[1]);
    const fontSize = Number(attrs.match(new RegExp(`font-size="${NUM}"`))?.[1]);
    const letterSpacing = Number(attrs.match(new RegExp(`letter-spacing="${NUM}"`))?.[1] ?? 0);
    const r = attrs.match(new RegExp(`transform="rotate\\(${NUM} ${NUM} ${NUM}\\)"`));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(fontSize)) continue;
    out.push({
      text,
      x,
      y,
      fontSize,
      letterSpacing,
      rotate: r ? { deg: Number(r[1]), ox: Number(r[2]), oy: Number(r[3]) } : null,
    });
  }
  return out;
}

function rotatePt(p: Pt, deg: number, ox: number, oy: number): Pt {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = p.x - ox;
  const dy = p.y - oy;
  return { x: ox + dx * c - dy * s, y: oy + dx * s + dy * c };
}

/**
 * The quadrilateral the glyphs actually cover. `text-anchor="middle"` centres the
 * run on x; the baseline sits at y, with the cap height above it. Matches
 * spacedTextBox's own vertical convention (top at y - fontSize, height 1.2em).
 */
export function glyphPoly(n: LabelNode, widthFactor = CAPS_WIDTH_FACTOR): Poly {
  const w = n.text.length * (n.fontSize * widthFactor + n.letterSpacing);
  const h = n.fontSize * 1.2;
  const x0 = n.x - w / 2;
  const y0 = n.y - n.fontSize;
  const corners: Pt[] = [
    { x: x0, y: y0 },
    { x: x0 + w, y: y0 },
    { x: x0 + w, y: y0 + h },
    { x: x0, y: y0 + h },
  ];
  if (!n.rotate) return corners;
  return corners.map((p) => rotatePt(p, n.rotate!.deg, n.rotate!.ox, n.rotate!.oy));
}

/** Separating-axis test for two convex polygons. Touching edges do not count. */
export function polysOverlap(a: Poly, b: Poly): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i]!;
      const p2 = poly[(i + 1) % poly.length]!;
      const axis = { x: -(p2.y - p1.y), y: p2.x - p1.x };
      const proj = (p: Poly) => p.map((q) => q.x * axis.x + q.y * axis.y);
      const pa = proj(a);
      const pb = proj(b);
      if (Math.max(...pa) <= Math.min(...pb) || Math.max(...pb) <= Math.min(...pa)) return false;
    }
  }
  return true;
}

/** How far two polygons overlap, as a fraction of the smaller one's area (0..1). */
export function polyArea(p: Poly): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}
