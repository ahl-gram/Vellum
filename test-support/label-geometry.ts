// Independent ground truth for #175 / #178: label geometry derived from the SVG output only.
// Deliberately does NOT import spacedTextBox: reusing the claim helper would be blind to claim-vs-render disagreement.

export type Pt = { readonly x: number; readonly y: number };
export type Poly = ReadonlyArray<Pt>;

/** Caps run wider than the 0.56 mixed-case factor `spacedTextBox` used to assume. */
export const CAPS_WIDTH_FACTOR = 0.72;
export const MIXED_WIDTH_FACTOR = 0.56;

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
  readonly rotate: { deg: number; ox: number; oy: number } | null;
};

const NUM = "([-\\d.]+)";

export function textNodes(svg: string): LabelNode[] {
  const out: LabelNode[] = [];
  // Non-greedy body: a river label's <tspan> must be captured whole; the old [^<]* match dropped every river name.
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
      // Rotate origin is the text's own (x, y); tspan dy shifts the baseline inside that frame, never the pivot.
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

/** Glyph quad: run anchored off x per text-anchor, top at y - fontSize, height 1.2em (spacedTextBox's vertical convention); width factor auto caps vs mixed. */
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

/** Area shared by two CONVEX polygons: Sutherland-Hodgman clip, exact for glyph quads; clip oriented CCW so inside is cross >= 0. */
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
        const d1 = (b.x - a.x) * (P.y - a.y) - (b.y - a.y) * (P.x - a.x);
        const d2 = (b.x - a.x) * (Q.y - a.y) - (b.y - a.y) * (Q.x - a.x);
        const t = d1 / (d1 - d2);
        out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t });
      }
    }
  }
  return out.length < 3 ? 0 : polyArea(out);
}

/** Overlap as a fraction of the SMALLER quad's area (0..1), the metric #178 measured; below ~0.15 reads as sub-visual touching. */
export function overlapFraction(a: Poly, b: Poly): number {
  const inter = convexIntersectionArea(a, b);
  if (inter <= 0) return 0;
  return inter / Math.max(1e-9, Math.min(polyArea(a), polyArea(b)));
}
