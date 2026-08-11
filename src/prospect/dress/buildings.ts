/**
 * Building ink (#240): one mass -> engraved SVG, the roof or spire drawn
 * from form + dimensions exactly as geometry.ts assigns ("the form's roof
 * or spire rides on top and is Sub 3's to draw"). Shapes quote the spike's
 * second state (PR #342): paper-filled ink outlines, separate thin shading
 * strokes, solid-ink doors and windows quoting the chart's castle glyph.
 */

import { el, type SvgNode } from "../../render/svg.ts";
import { groundAt, type Ground, type Mass, type WallSegment } from "../geometry.ts";
import { r1, stroke, type DressContext } from "./context.ts";

function windowDashes(c: DressContext, m: Mass): SvgNode[] {
  if (m.h < 12 || m.w < 8) return [];
  const cols = m.w > 20 ? 2 : 1;
  const out: SvgNode[] = [];
  for (let i = 0; i < cols; i++) {
    const wx = m.x + m.w * (cols === 1 ? 0.5 : 0.3 + i * 0.4);
    out.push(
      el("rect", { x: r1(wx - 0.7), y: r1(m.base - m.h * 0.62), width: 1.4, height: 2.6, fill: c.ink }),
    );
  }
  return out;
}

/** Roof-shade flicks: the chart's freehand hatch idiom turned to a roof
 * pitch. Geometry-derived, never random per render (#240). */
function roofHatch(
  parts: string[],
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  n: number,
  step: number,
): void {
  for (let i = 0; i < n; i++) {
    parts.push(`M${r1(x0 + i * step)} ${r1(y0 + i * step * 0.14)}l${r1(dx)} ${r1(dy)}`);
  }
}

function archedDoor(c: DressContext, cx: number, base: number, hw: number, rise: number): SvgNode {
  return el("path", {
    d: `M${r1(cx - hw)} ${r1(base)}L${r1(cx - hw)} ${r1(base - rise)}Q${r1(cx)} ${r1(base - rise * 1.5)} ${r1(cx + hw)} ${r1(base - rise)}L${r1(cx + hw)} ${r1(base)}Z`,
    fill: c.ink,
  });
}

function gableNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const out: SvgNode[] = [];
  const hatch: string[] = [];
  const gh = m.form === "gable" ? Math.min(9, h * 0.45) : Math.min(7, h * 0.4);
  if (m.broken) {
    const d = `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top + h * 0.25)}L${r1(x + w * 0.3)} ${r1(top + h * 0.55)}L${r1(x + w * 0.55)} ${r1(top + h * 0.3)}L${r1(x + w * 0.78)} ${r1(top + h * 0.6)}L${r1(x + w)} ${r1(top + h * 0.45)}L${r1(x + w)} ${r1(base)}Z`;
    out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
    hatch.push(`M${r1(x + w * 0.62)} ${r1(top + h * 0.55)}l${r1(w * 0.2)} ${r1(h * 0.28)}`);
    hatch.push(`M${r1(x + w * 0.5)} ${r1(top + h * 0.72)}l${r1(w * 0.22)} ${r1(h * 0.2)}`);
    hatch.push(`M${r1(x + w * 0.16)} ${r1(top + h * 0.5)}l${r1(w * 0.14)} ${r1(h * 0.24)}`);
    hatch.push(`M${r1(x + w * 0.3)} ${r1(top + h * 0.66)}l${r1(w * 0.16)} ${r1(h * 0.2)}`);
  } else if (m.form === "gable") {
    const d = `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top)}L${r1(x + w / 2)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${r1(base)}Z`;
    out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
    roofHatch(hatch, x + w * 0.55, top - gh * 0.55, w * 0.16, gh * 0.55, 2, w * 0.14);
  } else {
    const rw = w * 0.24;
    const d = `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top)}L${r1(x + rw)} ${r1(top - gh)}L${r1(x + w - rw)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${r1(base)}Z`;
    out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
    roofHatch(hatch, x + rw + 1, top - gh + 1.2, w * 0.1, gh * 0.8, 3, (w - 2 * rw - 2) / 3);
  }
  if (!m.broken) {
    out.push(...windowDashes(c, m));
    if (w > 16 && h > 14) out.push(archedDoor(c, x + w / 2, base, 1.6, 3));
  }
  if (hatch.length > 0) out.push(el("path", { d: hatch.join(""), fill: "none", ...stroke(c, 0.7) }));
  return out;
}

/** The broken tower or spire: the jagged shell, no merlons, no finial. */
function brokenVerticalNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const d = `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top + h * 0.2)}L${r1(x + w * 0.35)} ${r1(top + h * 0.38)}L${r1(x + w * 0.65)} ${r1(top + h * 0.12)}L${r1(x + w)} ${r1(top + h * 0.3)}L${r1(x + w)} ${r1(base)}Z`;
  const hatch = [
    `M${r1(x + w * 0.55)} ${r1(top + h * 0.35)}l${r1(w * 0.28)} ${r1(h * 0.22)}`,
    `M${r1(x + w * 0.2)} ${r1(top + h * 0.5)}l${r1(w * 0.3)} ${r1(h * 0.24)}`,
  ].join("");
  return [
    el("path", { d, fill: c.paper, ...stroke(c, weight) }),
    el("path", { d: hatch, fill: "none", ...stroke(c, 0.7) }),
  ];
}

function verticalNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  if (m.broken) return brokenVerticalNodes(c, m, weight);
  const { x, w, h, base } = m;
  const top = base - h;
  const out: SvgNode[] = [];
  const hatch: string[] = [];
  out.push(
    el("path", {
      d: `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${r1(base)}Z`,
      fill: c.paper,
      ...stroke(c, weight),
    }),
  );
  if (m.form === "tower") {
    // merlons, quoting the chart's castle glyph
    const t = w / 5;
    const d = `M${r1(x - 0.5)} ${r1(top)}L${r1(x - 0.5)} ${r1(top - 2.6)}L${r1(x + t)} ${r1(top - 2.6)}L${r1(x + t)} ${r1(top)}M${r1(x + 2 * t)} ${r1(top)}L${r1(x + 2 * t)} ${r1(top - 2.6)}L${r1(x + 3 * t)} ${r1(top - 2.6)}L${r1(x + 3 * t)} ${r1(top)}M${r1(x + 4 * t)} ${r1(top)}L${r1(x + 4 * t)} ${r1(top - 2.6)}L${r1(x + w + 0.5)} ${r1(top - 2.6)}L${r1(x + w + 0.5)} ${r1(top)}`;
    out.push(el("path", { d, fill: "none", ...stroke(c, weight * 0.85) }));
  } else {
    const sp = Math.max(12, h * 0.55);
    const cx = x + w / 2;
    out.push(
      el("path", {
        d: `M${r1(x - 0.6)} ${r1(top)}L${r1(cx)} ${r1(top - sp)}L${r1(x + w + 0.6)} ${r1(top)}Z`,
        fill: c.paper,
        ...stroke(c, weight),
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(cx)} ${r1(top - sp - 1)}L${r1(cx)} ${r1(top - sp - 4.4)}M${r1(cx - 1.8)} ${r1(top - sp - 3.2)}L${r1(cx + 1.8)} ${r1(top - sp - 3.2)}`,
        fill: "none",
        ...stroke(c, 0.8),
      }),
    );
    roofHatch(hatch, cx + 0.8, top - sp * 0.55, w * 0.2, sp * 0.3, 2, 1.8);
  }
  const wx = x + w / 2;
  out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.28), width: 1.2, height: 3, fill: c.ink }));
  if (h > 30) {
    out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.55), width: 1.2, height: 3, fill: c.ink }));
  }
  if (hatch.length > 0) out.push(el("path", { d: hatch.join(""), fill: "none", ...stroke(c, 0.7) }));
  return out;
}

/** A thrown-down keep: the jagged shell, no crenellation, no turrets, and
 * above all no pennant (GO condition 3: a ruin must read ruinous; the
 * intact crown on a fallen hold was the hole vellum-guard-prover found). */
function brokenKeepNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const d = `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top + h * 0.15)}L${r1(x + w * 0.2)} ${r1(top + h * 0.4)}L${r1(x + w * 0.42)} ${r1(top + h * 0.1)}L${r1(x + w * 0.66)} ${r1(top + h * 0.45)}L${r1(x + w)} ${r1(top + h * 0.22)}L${r1(x + w)} ${r1(base)}Z`;
  const hatch = [
    `M${r1(x + w * 0.5)} ${r1(top + h * 0.4)}l${r1(w * 0.18)} ${r1(h * 0.24)}`,
    `M${r1(x + w * 0.28)} ${r1(top + h * 0.55)}l${r1(w * 0.2)} ${r1(h * 0.2)}`,
    `M${r1(x + w * 0.7)} ${r1(top + h * 0.55)}l${r1(w * 0.16)} ${r1(h * 0.22)}`,
  ].join("");
  return [
    el("path", { d, fill: c.paper, ...stroke(c, weight) }),
    el("path", { d: hatch, fill: "none", ...stroke(c, 0.7) }),
    archedDoor(c, x + w / 2, base, 2.2, 4.2),
  ];
}

function keepNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  if (m.broken) return brokenKeepNodes(c, m, weight);
  const { x, w, h, base } = m;
  const top = base - h;
  const t = w / 7;
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(top)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${r1(base)}Z`,
      fill: c.paper,
      ...stroke(c, weight),
    }),
    el("path", {
      d: `M${r1(x)} ${r1(top)}L${r1(x)} ${r1(top - 3)}L${r1(x + t)} ${r1(top - 3)}L${r1(x + t)} ${r1(top)}M${r1(x + 3 * t)} ${r1(top)}L${r1(x + 3 * t)} ${r1(top - 3)}L${r1(x + 4 * t)} ${r1(top - 3)}L${r1(x + 4 * t)} ${r1(top)}M${r1(x + 6 * t)} ${r1(top)}L${r1(x + 6 * t)} ${r1(top - 3)}L${r1(x + w)} ${r1(top - 3)}L${r1(x + w)} ${r1(top)}`,
      fill: "none",
      ...stroke(c, weight * 0.85),
    }),
  ];
  for (const tx of [x + 2, x + w - 6]) {
    out.push(
      el("path", {
        d: `M${r1(tx)} ${r1(base)}L${r1(tx)} ${r1(top - 9)}L${r1(tx + 4)} ${r1(top - 9)}L${r1(tx + 4)} ${r1(base)}Z`,
        fill: c.paper,
        ...stroke(c, weight * 0.9),
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(tx - 0.6)} ${r1(top - 9)}L${r1(tx + 2)} ${r1(top - 14)}L${r1(tx + 4.6)} ${r1(top - 9)}Z`,
        fill: c.paper,
        ...stroke(c, weight * 0.9),
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(tx + 2)} ${r1(top - 14)}L${r1(tx + 2)} ${r1(top - 18)}l4 1.4l-4 1.4`,
        fill: "none",
        ...stroke(c, 0.7),
      }),
    );
  }
  out.push(archedDoor(c, x + w / 2, base, 2.2, 4.2));
  out.push(el("rect", { x: r1(x + w * 0.3), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: c.ink }));
  out.push(el("rect", { x: r1(x + w * 0.66), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: c.ink }));
  return out;
}

/** Rubble at a broken mass's foot (the ruin bar: collapse, not just a
 * jagged roofline; the strewn field itself is a foreground element). */
function footRubble(c: DressContext, m: Mass): SvgNode {
  const parts: string[] = [];
  for (let i = 0; i < 3; i++) {
    const rx = m.x + (i + 0.3) * (m.w / 3);
    parts.push(`M${r1(rx)} ${r1(m.base)}l2.4 -1.8l2 1.8Z`);
  }
  return el("path", { d: parts.join(""), fill: c.paper, ...stroke(c, 0.7) });
}

/** One building mass in the dress. Weight is the outline stroke width; the
 * plate assigns 0.9 to the raised back row, 1.3 to the keep, 1.2 forward. */
export function massNodes(c: DressContext, m: Mass, weight: number): SvgNode[] {
  const body =
    m.form === "gable" || m.form === "ridge"
      ? gableNodes(c, m, weight)
      : m.form === "keep"
        ? keepNodes(c, m, weight)
        : verticalNodes(c, m, weight);
  return m.broken ? [...body, footRubble(c, m)] : body;
}

/** A curtain-wall run whose feet follow the ground function; a ruined stub
 * heels over about its own center. */
export function wallNodes(c: DressContext, ground: Ground, w: WallSegment): SvgNode[] {
  const g = (x: number): number => groundAt(ground, x);
  const step = 8;
  const topPts: string[] = [];
  for (let x = w.x0; x <= w.x1; x += step) topPts.push(`${r1(x)} ${r1(g(x) - w.h)}`);
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(w.x0)} ${r1(g(w.x0))}L${topPts.join("L")}L${r1(w.x1)} ${r1(g(w.x1))}Z`,
      fill: c.paper,
      ...stroke(c, 1.1),
    }),
  ];
  const teeth: string[] = [];
  for (let x = w.x0 + 3; x < w.x1 - 3; x += 7) {
    teeth.push(
      `M${r1(x)} ${r1(g(x) - w.h)}L${r1(x)} ${r1(g(x) - w.h - 2.4)}L${r1(x + 3.4)} ${r1(g(x + 3.4) - w.h - 2.4)}L${r1(x + 3.4)} ${r1(g(x + 3.4) - w.h)}`,
    );
  }
  out.push(el("path", { d: teeth.join(""), fill: "none", ...stroke(c, 0.8) }));
  if (w.gate) {
    const cx = (w.x0 + w.x1) / 2;
    const gb = g(cx);
    out.push(
      el("path", {
        d: `M${r1(cx - 4)} ${r1(gb)}L${r1(cx - 4)} ${r1(gb - 6)}Q${r1(cx)} ${r1(gb - 10)} ${r1(cx + 4)} ${r1(gb - 6)}L${r1(cx + 4)} ${r1(gb)}Z`,
        fill: c.ink,
      }),
    );
  }
  if (w.heel !== 0) {
    const px = (w.x0 + w.x1) / 2;
    return [el("g", { transform: `rotate(${r1(w.heel)} ${r1(px)} ${r1(g(px))})` }, out)];
  }
  return out;
}

/** A drowned stub standing in the flood: tall-thin reads as a leaning tower
 * with a slit window, squat reads as a half-sunk gable (the spike's
 * Saltmere pair, generalized on proportion). */
export function drownedStubNodes(
  c: DressContext,
  s: { x: number; w: number; h: number; base: number; tilt: number },
): SvgNode[] {
  const { x, w, h, base } = s;
  const body: SvgNode[] =
    h >= 2 * w
      ? [
          el("path", {
            d: `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(base - h + 5)}L${r1(x + w * 0.42)} ${r1(base - h)}L${r1(x + w)} ${r1(base - h + 9)}L${r1(x + w)} ${r1(base)}Z`,
            fill: c.paper,
            ...stroke(c, 1.1),
          }),
          el("rect", { x: r1(x + w * 0.42), y: r1(base - h + 13), width: 1.4, height: 3, fill: c.ink }),
        ]
      : [
          el("path", {
            d: `M${r1(x)} ${r1(base)}L${r1(x)} ${r1(base - h + 8)}L${r1(x + w / 2)} ${r1(base - h)}L${r1(x + w)} ${r1(base - h + 10)}L${r1(x + w)} ${r1(base)}Z`,
            fill: c.paper,
            ...stroke(c, 1.0),
          }),
        ];
  if (s.tilt !== 0) {
    return [el("g", { transform: `rotate(${r1(s.tilt)} ${r1(x + w / 2)} ${r1(base - 2)})` }, body)];
  }
  return body;
}
