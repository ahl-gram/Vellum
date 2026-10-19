import { el, type SvgNode } from "../../render/svg.ts";
import type { Mass } from "../geometry.ts";
import { hatchNode, poly, r1, stroke, washOr, type Engraver } from "./burin.ts";

const SHADOW = 0.3;

function windows(e: Engraver, m: Mass, rows: number): SvgNode[] {
  const cols = m.w > 22 ? 3 : m.w > 12 ? 2 : 1;
  const out: SvgNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wy = m.base - m.h * (0.72 - r * 0.3);
      if (wy <= m.base - 4)
        out.push(
          el("rect", { x: r1(m.x + m.w * ((c + 0.5) / cols) - 0.7), y: r1(wy), width: 1.4, height: 2.4, fill: e.ink }),
        );
    }
  }
  return out;
}

function door(e: Engraver, cx: number, base: number, hw: number, rise: number): SvgNode {
  return el("path", {
    d: `M${r1(cx - hw)} ${r1(base)}V${r1(base - rise)}Q${r1(cx)} ${r1(base - rise * 1.5)} ${r1(cx + hw)} ${r1(base - rise)}V${r1(base)}Z`,
    fill: e.ink,
  });
}

function shadowStrip(e: Engraver, x: number, w: number, top: number, base: number): SvgNode {
  const sx = x + w * (1 - SHADOW);
  return hatchNode(
    e,
    [
      { x: sx, y: top },
      { x: x + w, y: top },
      { x: x + w, y: base },
      { x: sx, y: base },
    ],
    6,
    1.5,
    0.42,
    0.9,
  );
}

function brokenGable(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const pts = [
    { x, y: base },
    { x, y: top + h * 0.25 },
    { x: x + w * 0.3, y: top + h * 0.55 },
    { x: x + w * 0.55, y: top + h * 0.3 },
    { x: x + w * 0.78, y: top + h * 0.6 },
    { x: x + w, y: top + h * 0.45 },
    { x: x + w, y: base },
  ];
  return [
    el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }),
    hatchNode(e, pts.slice(2), 1.2, 2.2, 0.4, 0.7),
    shadowStrip(e, x, w, top + h * 0.45, base),
  ];
}

function ridgeRoof(
  e: Engraver,
  weight: number,
  x: number,
  w: number,
  top: number,
  gh: number,
  roofFill: string,
): SvgNode[] {
  const out: SvgNode[] = [];
  const rw = w * 0.22;
  const roof = [
    { x: x - 0.6, y: top },
    { x: x + rw, y: top - gh },
    { x: x + w - rw, y: top - gh },
    { x: x + w + 0.6, y: top },
  ];
  out.push(el("path", { d: poly(roof), fill: roofFill, ...stroke(e, weight) }), hatchNode(e, roof, 0, 1.3, 0.35, 0.8));
  out.push(
    hatchNode(
      e,
      [
        { x: x + w - rw, y: top - gh },
        { x: x + w + 0.6, y: top },
        { x: x + w - rw * 1.4, y: top },
      ],
      -(gh / rw),
      1.4,
      0.4,
      0.85,
    ),
  );
  if (w > 18)
    out.push(
      el("path", {
        d: `M${r1(x + w * 0.62)} ${r1(top - gh - 3.4)}h2.6v${r1(gh * 0.6 + 3.4)}`,
        fill: e.paper,
        ...stroke(e, 0.6),
      }),
    );
  return out;
}

export function gableMass(e: Engraver, m: Mass, weight: number, church: boolean): SvgNode[] {
  if (m.broken) return brokenGable(e, m, weight);
  const { x, w, h, base } = m;
  const top = base - h;
  const gh = m.form === "gable" ? Math.min(9, h * 0.45) : Math.min(7, h * 0.4);
  const roofFill = washOr(e, church ? "roofChurch" : "roof");
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`,
      fill: e.paper,
      ...stroke(e, weight),
    }),
    shadowStrip(e, x, w, top, base),
  ];
  if (m.form === "gable") {
    out.push(
      el("path", {
        d: poly([
          { x: x - 0.6, y: top },
          { x: x + w / 2, y: top - gh },
          { x: x + w + 0.6, y: top },
        ]),
        fill: roofFill,
        ...stroke(e, weight),
      }),
    );
    out.push(
      hatchNode(
        e,
        [
          { x: x + w / 2, y: top - gh },
          { x: x + w + 0.6, y: top },
          { x: x + w / 2, y: top },
        ],
        -(gh / (w / 2)),
        1.4,
        0.4,
        0.85,
      ),
    );
  } else {
    out.push(...ridgeRoof(e, weight, x, w, top, gh, roofFill));
  }
  out.push(...windows(e, m, h > 20 ? 2 : 1));
  if (w > 14 && h > 12) out.push(door(e, x + w * 0.42, base, 1.5, 3));
  return out;
}

function courses(e: Engraver, x: number, w: number, y0: number, y1: number, step: number): SvgNode {
  const parts: string[] = [];
  for (let y = y0 + step; y < y1 - 1; y += step) parts.push(`M${r1(x + 0.8)} ${r1(y)}H${r1(x + w - 0.8)}`);
  return el("path", { d: parts.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.3, "stroke-opacity": 0.55 });
}

function battlements(e: Engraver, x: number, w: number, top: number, teeth: number, weight: number): SvgNode {
  const t = w / (teeth * 2 - 1);
  let d = `M${r1(x - 0.5)} ${r1(top)}`;
  for (let i = 0; i < teeth; i++) {
    const tx = x - 0.5 + i * 2 * t;
    d += `L${r1(tx)} ${r1(top - 2.6)}H${r1(tx + t)}V${r1(top)}${i < teeth - 1 ? `H${r1(tx + 2 * t)}` : ""}`;
  }
  return el("path", { d, fill: e.paper, ...stroke(e, weight * 0.85) });
}

function spireRoof(e: Engraver, weight: number, x: number, w: number, h: number, top: number): SvgNode[] {
  const out: SvgNode[] = [];
  const sp = Math.max(12, h * 0.55);
  const cx = x + w / 2;
  out.push(
    el("path", {
      d: poly([
        { x: x - 0.6, y: top },
        { x: cx, y: top - sp },
        { x: x + w + 0.6, y: top },
      ]),
      fill: washOr(e, "roofChurch"),
      ...stroke(e, weight),
    }),
  );
  out.push(
    hatchNode(
      e,
      [
        { x: cx, y: top - sp },
        { x: x + w + 0.6, y: top },
        { x: cx, y: top },
      ],
      -(sp / (w / 2 + 0.6)),
      1.3,
      0.4,
      0.85,
    ),
  );
  out.push(
    el("path", {
      d: `M${r1(cx)} ${r1(top - sp - 1)}V${r1(top - sp - 4.6)}M${r1(cx - 1.8)} ${r1(top - sp - 3.2)}H${r1(cx + 1.8)}`,
      fill: "none",
      ...stroke(e, 0.8),
    }),
  );
  out.push(el("path", { d: `M${r1(cx - 1.4)} ${r1(top + 3)}v3.4q1.4 -1.2 2.8 0v-3.4Z`, fill: e.ink }));
  return out;
}

export function verticalMass(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  if (m.broken) {
    const pts = [
      { x, y: base },
      { x, y: top + h * 0.2 },
      { x: x + w * 0.35, y: top + h * 0.38 },
      { x: x + w * 0.65, y: top + h * 0.12 },
      { x: x + w, y: top + h * 0.3 },
      { x: x + w, y: base },
    ];
    return [
      el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }),
      shadowStrip(e, x, w, top + h * 0.3, base),
      courses(e, x, w, top + h * 0.4, base, 3),
    ];
  }
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`,
      fill: e.paper,
      ...stroke(e, weight),
    }),
    courses(e, x, w, top, base, 3.2),
    shadowStrip(e, x, w, top, base),
  ];
  if (m.form === "tower") {
    out.push(battlements(e, x, w, top, 3, weight));
    out.push(
      el("path", {
        d: `M${r1(x + 1)} ${r1(top - 2.6)}L${r1(x + w / 2)} ${r1(top - 2.6 - w * 0.55)}L${r1(x + w - 1)} ${r1(top - 2.6)}Z`,
        fill: washOr(e, "roofChurch"),
        ...stroke(e, 0.7),
      }),
    );
  } else {
    out.push(...spireRoof(e, weight, x, w, h, top));
  }
  out.push(el("rect", { x: r1(x + w / 2 - 0.6), y: r1(top + h * 0.3), width: 1.2, height: 3, fill: e.ink }));
  if (h > 30)
    out.push(el("rect", { x: r1(x + w / 2 - 0.6), y: r1(top + h * 0.56), width: 1.2, height: 3, fill: e.ink }));
  return out;
}

function keepTowers(e: Engraver, weight: number, x: number, w: number, base: number, top: number): SvgNode[] {
  const out: SvgNode[] = [];
  for (const tx of [x - 1, x + w - 5]) {
    out.push(
      el("path", {
        d: `M${r1(tx)} ${r1(base)}V${r1(top - 9)}H${r1(tx + 6)}V${r1(base)}Z`,
        fill: e.paper,
        ...stroke(e, weight * 0.9),
      }),
    );
    out.push(
      hatchNode(
        e,
        [
          { x: tx + 3.6, y: top - 9 },
          { x: tx + 6, y: top - 9 },
          { x: tx + 6, y: base },
          { x: tx + 3.6, y: base },
        ],
        6,
        1.4,
        0.4,
        0.9,
      ),
    );
    out.push(
      el("path", {
        d: `M${r1(tx - 0.6)} ${r1(top - 9)}L${r1(tx + 3)} ${r1(top - 15)}L${r1(tx + 6.6)} ${r1(top - 9)}Z`,
        fill: washOr(e, "roofChurch"),
        ...stroke(e, weight * 0.9),
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(tx + 3)} ${r1(top - 15)}V${r1(top - 19.5)}l4 1.4l-4 1.4`,
        fill: "none",
        ...stroke(e, 0.7),
      }),
    );
  }
  return out;
}

export function keepMass(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  if (m.broken) {
    const pts = [
      { x, y: base },
      { x, y: top + h * 0.15 },
      { x: x + w * 0.2, y: top + h * 0.4 },
      { x: x + w * 0.42, y: top + h * 0.1 },
      { x: x + w * 0.66, y: top + h * 0.45 },
      { x: x + w, y: top + h * 0.22 },
      { x: x + w, y: base },
    ];
    return [
      el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }),
      shadowStrip(e, x, w, top + h * 0.45, base),
      courses(e, x, w, top + h * 0.45, base, 3.4),
      door(e, x + w / 2, base, 2.2, 4.2),
    ];
  }
  const out: SvgNode[] = [
    el("path", {
      d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`,
      fill: e.paper,
      ...stroke(e, weight),
    }),
    courses(e, x, w, top, base, 3.4),
    shadowStrip(e, x, w, top, base),
    battlements(e, x + 4, w - 8, top, 4, weight),
  ];
  out.push(...keepTowers(e, weight, x, w, base, top));
  out.push(door(e, x + w / 2, base, 2.2, 4.2));
  out.push(
    el("rect", { x: r1(x + w * 0.3), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: e.ink }),
    el("rect", { x: r1(x + w * 0.66), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: e.ink }),
  );
  return out;
}
