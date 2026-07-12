/**
 * Independent ground truth for #175 / #178: reconstruct what a label ACTUALLY
 * draws, so a test can catch glyphs overlapping even when their claimed boxes did
 * not.
 *
 * Deliberately does not import `spacedTextBox`: the whole bug is that the claim
 * geometry disagreed with the rendered geometry, so a test that reuses the claim
 * helper would be blind to it. Everything here is derived from the SVG output.
 *
 * #178 taught it two things it used to be blind to: a river name's text is wrapped
 * in a `<tspan dy=...>` (so the old `[^<]*` content match skipped it entirely, and
 * the `dy` shifts the baseline), and settlement names are `text-anchor="start"`,
 * not the `middle` that `glyphPoly` used to assume.
 */

export type Pt = { readonly x: number; readonly y: number };
export type Poly = ReadonlyArray<Pt>;

/** Caps run wider than the 0.56 mixed-case factor `spacedTextBox` used to assume. */
export const CAPS_WIDTH_FACTOR = 0.72;
/** Sea, forest and river names draw as written (mixed case), italic. */
export const MIXED_WIDTH_FACTOR = 0.56;

/** Caps labels (realm/range/capital) render `.toUpperCase()` and run ~20% wider. */
function autoWidthFactor(text: string): number {
  return text === text.toUpperCase() && /[A-Za-z]/.test(text)
    ? CAPS_WIDTH_FACTOR
    : MIXED_WIDTH_FACTOR;
}

export type LabelNode = {
  readonly text: string;
  readonly x: number;
  /** Baseline y, with any `<tspan dy>` offset already folded in. */
  readonly y: number;
  readonly fontSize: number;
  readonly letterSpacing: number;
  readonly anchor: "start" | "middle" | "end";
  /** SVG `rotate(deg ox oy)`, when the label is spun along a ridge or reach. */
  readonly rotate: { deg: number; ox: number; oy: number } | null;
};

const NUM = "([-\\d.]+)";

/** Every <text> node in the SVG, with the attributes label geometry depends on. */
export function textNodes(svg: string): LabelNode[] {
  const out: LabelNode[] = [];
  // Non-greedy body so a river label's `<tspan>...</tspan>` is captured whole; the
  // old `[^<]*` stopped at the tspan's `<` and dropped every river name.
  for (const m of svg.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attrs = m[1] as string;
    let text = m[2] as string;
    let dy = 0;
    const tspan = text.match(new RegExp(`<tspan([^>]*)>([\\s\\S]*?)</tspan>`));
    if (tspan) {
      dy = Number(tspan[1]!.match(new RegExp(`dy="${NUM}"`))?.[1] ?? 0);
      text = tspan[2] as string;
    }
    const x = Number(attrs.match(new RegExp(` x="${NUM}"`))?.[1]);
    const y = Number(attrs.match(new RegExp(` y="${NUM}"`))?.[1]);
    const fontSize = Number(attrs.match(new RegExp(`font-size="${NUM}"`))?.[1]);
    const letterSpacing = Number(attrs.match(new RegExp(`letter-spacing="${NUM}"`))?.[1] ?? 0);
    const anchorRaw = attrs.match(new RegExp(`text-anchor="(start|middle|end)"`))?.[1];
    const r = attrs.match(new RegExp(`transform="rotate\\(${NUM} ${NUM} ${NUM}\\)"`));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(fontSize)) continue;
    out.push({
      text,
      x,
      y: y + dy,
      fontSize,
      letterSpacing,
      anchor: (anchorRaw as "start" | "middle" | "end") ?? "start",
      // The rotate origin is the text element's own (x, y); the tspan dy shifts the
      // baseline INSIDE that frame, so it must not move the pivot.
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
 * The quadrilateral the glyphs actually cover. The run is placed off x per its
 * `text-anchor` (start/middle/end); the baseline sits at y (tspan dy already folded
 * in), with the cap height above it. Matches spacedTextBox's own vertical convention
 * (top at y - fontSize, height 1.2em). The width factor defaults to caps vs mixed by
 * the label's own casing, so one call handles a rotated caps range label and an
 * italic mixed-case river name alike.
 */
export function glyphPoly(n: LabelNode, widthFactor = autoWidthFactor(n.text)): Poly {
  const w = n.text.length * (n.fontSize * widthFactor + n.letterSpacing);
  const h = n.fontSize * 1.2;
  const x0 = n.anchor === "start" ? n.x : n.anchor === "end" ? n.x - w : n.x - w / 2;
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

/** Absolute area of a simple polygon (shoelace). */
export function polyArea(p: Poly): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** Signed shoelace area; > 0 for counter-clockwise winding (standard convention). */
function signedArea(p: Poly): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/**
 * Area shared by two CONVEX polygons (Sutherland-Hodgman clip of `subject` by each
 * edge of `clip`). Both glyph quads are convex, so this is exact. The clip is
 * oriented counter-clockwise so "inside" is `cross >= 0` for every edge.
 */
function convexIntersectionArea(subject: Poly, clip: Poly): number {
  const c = signedArea(clip) < 0 ? [...clip].reverse() : clip;
  let out: Pt[] = [...subject];
  for (let i = 0; i < c.length && out.length > 0; i++) {
    const a = c[i]!;
    const b = c[(i + 1) % c.length]!;
    const inside = (p: Pt) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= 0;
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const P = input[j]!;
      const Q = input[(j + 1) % input.length]!;
      const pIn = inside(P);
      const qIn = inside(Q);
      if (pIn) out.push(P);
      if (pIn !== qIn) {
        // segment PQ crosses edge AB: add the intersection point
        const d1 = (b.x - a.x) * (P.y - a.y) - (b.y - a.y) * (P.x - a.x);
        const d2 = (b.x - a.x) * (Q.y - a.y) - (b.y - a.y) * (Q.x - a.x);
        const t = d1 / (d1 - d2);
        out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t });
      }
    }
  }
  return out.length < 3 ? 0 : polyArea(out);
}

/**
 * How much two glyph quads overlap, as a fraction of the SMALLER one's area (0..1) --
 * the same metric #178 measured. A hair of touching (< ~0.15) is sub-visual; a real
 * collision buries a chunk of the smaller label.
 */
export function overlapFraction(a: Poly, b: Poly): number {
  const inter = convexIntersectionArea(a, b);
  if (inter <= 0) return 0;
  return inter / Math.max(1e-9, Math.min(polyArea(a), polyArea(b)));
}
