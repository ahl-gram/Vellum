import { el, type SvgNode } from "../svg.ts";
import type { MapStyle } from "../style.ts";
import type { BeastKind } from "../../society/bestiary.ts";

/** Profile beasts on a plan-view sea, per the chart's period convention; (x, y) is the waterline center. */

const SCALE: Record<BeastKind, number> = { serpent: 2.0, whale: 2.1, kraken: 2.3 };

type Stroke = {
  readonly stroke: string;
  readonly "stroke-width": string;
  readonly "stroke-linecap": "round";
  readonly "stroke-linejoin": "round";
};

function inkStroke(style: MapStyle, k: number, w = 1.5): Stroke {
  return {
    stroke: style.ink,
    "stroke-width": (w * k).toFixed(2),
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };
}

function waterDashes(x: number, y: number, s: number, style: MapStyle, k: number): SvgNode {
  return el("path", {
    d: `M${x - 40 * s} ${y + 4 * s}h${9 * s}m${5 * s} 0h${13 * s}m${7 * s} 0h${12 * s}m${6 * s} 0h${9 * s}`,
    fill: "none",
    stroke: style.inkSoft,
    "stroke-width": (0.8 * k).toFixed(2),
    "stroke-opacity": 0.55,
  });
}

function serpent(x: number, y: number, k: number, style: MapStyle): SvgNode[] {
  const s = SCALE.serpent * k;
  const stroke = inkStroke(style, k);
  const coil = (x0: number, w: number, rise: number): SvgNode =>
    el("path", {
      d: `M${x0} ${y}q${(w / 2) * s} ${-rise * s} ${w * s} 0`,
      fill: style.paper,
      ...stroke,
    });
  return [
    el("path", {
      d: `M${x - 36 * s} ${y}l${-7 * s} ${-8 * s}m${7 * s} ${8 * s}l${-9 * s} ${-2.5 * s}`,
      fill: "none",
      ...stroke,
    }),
    coil(x - 34 * s, 15, 14),
    coil(x - 16 * s, 16, 18),
    coil(x + 2 * s, 14, 15),
    el("path", {
      d:
        `M${x + 17 * s} ${y}q${2.5 * s} ${-13 * s} ${9 * s} ${-14.5 * s}` +
        `q${8 * s} ${-1.8 * s} ${8 * s} ${4.5 * s}q0 ${4 * s} ${-5.5 * s} ${3 * s}` +
        `l${3.5 * s} ${3 * s}m${-3.5 * s} ${-3 * s}l${4.5 * s} ${0.5 * s}`,
      fill: style.paper,
      ...stroke,
    }),
    el("path", {
      d: `M${x + 25 * s} ${y - 15.5 * s}l${-2 * s} ${-4 * s}l${3.5 * s} ${1.5 * s}Z`,
      fill: style.ink,
      ...stroke,
    }),
    el("circle", {
      cx: (x + 28.5 * s).toFixed(1),
      cy: (y - 11 * s).toFixed(1),
      r: (1.0 * k).toFixed(2),
      fill: style.ink,
    }),
    el("path", {
      d:
        `M${x - 29 * s} ${y - 6.2 * s}l${1 * s} ${-2.6 * s}m${3.8 * s} ${1.4 * s}l${0.9 * s} ${-2.6 * s}` +
        `M${x - 10.5 * s} ${y - 8.4 * s}l${1 * s} ${-2.8 * s}m${3.8 * s} ${1 * s}l${0.9 * s} ${-2.6 * s}` +
        `M${x + 8 * s} ${y - 7 * s}l${1 * s} ${-2.6 * s}`,
      fill: "none",
      ...stroke,
    }),
    waterDashes(x, y, s * 0.85, style, k),
  ];
}

function whale(x: number, y: number, k: number, style: MapStyle): SvgNode[] {
  const s = SCALE.whale * k;
  const stroke = inkStroke(style, k);
  return [
    el("path", {
      d:
        `M${x - 31 * s} ${y + 1 * s}` +
        `C${x - 34 * s} ${y - 6 * s} ${x - 28 * s} ${y - 13 * s} ${x - 17 * s} ${y - 15.5 * s}` +
        `C${x - 6 * s} ${y - 18 * s} ${x + 7 * s} ${y - 15 * s} ${x + 13 * s} ${y - 9 * s}` +
        `Q${x + 17 * s} ${y - 5 * s} ${x + 18 * s} ${y + 1 * s}Z`,
      fill: style.paper,
      ...stroke,
    }),
    el("path", {
      d:
        `M${x + 16 * s} ${y - 3 * s}Q${x + 20 * s} ${y - 6 * s} ${x + 21 * s} ${y - 11 * s}` +
        `Q${x + 21.5 * s} ${y - 14 * s} ${x + 25 * s} ${y - 17 * s}` +
        `Q${x + 24 * s} ${y - 12 * s} ${x + 25.5 * s} ${y - 10 * s}` +
        `Q${x + 29 * s} ${y - 11.5 * s} ${x + 32 * s} ${y - 9 * s}` +
        `Q${x + 27 * s} ${y - 6 * s} ${x + 23 * s} ${y - 3 * s}` +
        `Q${x + 20 * s} ${y - 1 * s} ${x + 18 * s} ${y + 1 * s}Z`,
      fill: style.paper,
      ...stroke,
    }),
    el("path", {
      d: `M${x - 30.5 * s} ${y - 4 * s}Q${x - 24 * s} ${y - 8.5 * s} ${x - 16 * s} ${y - 8 * s}`,
      fill: "none",
      ...stroke,
    }),
    el("path", {
      d:
        `M${x - 20 * s} ${y - 15 * s}q${-3.5 * s} ${-3.5 * s} ${-3.5 * s} ${-7.5 * s}` +
        `M${x - 20 * s} ${y - 15 * s}q${0.2 * s} ${-4.5 * s} ${1 * s} ${-8 * s}` +
        `M${x - 20 * s} ${y - 15 * s}q${3 * s} ${-3.5 * s} ${5 * s} ${-6.5 * s}`,
      fill: "none",
      ...stroke,
    }),
    el("circle", {
      cx: (x - 14.5 * s).toFixed(1),
      cy: (y - 6.5 * s).toFixed(1),
      r: (1.0 * k).toFixed(2),
      fill: style.ink,
    }),
    waterDashes(x, y, s * 0.9, style, k),
  ];
}

function kraken(x: number, y: number, k: number, style: MapStyle): SvgNode[] {
  const s = SCALE.kraken * k;
  const stroke = inkStroke(style, k, 1.3);
  const arm = (bx: number, lean: number, rise: number, c: number): SvgNode => {
    const w0 = 2.4 * s;
    const tx = bx + lean * s;
    const ty = y - rise * s;
    return el("path", {
      d:
        `M${bx - w0} ${y}` +
        `Q${bx - w0 + lean * s * 0.35} ${y - rise * s * 0.55} ${tx - c * 3 * s} ${ty - 1 * s}` +
        `Q${tx} ${ty - 4 * s} ${tx + c * 3.5 * s} ${ty - 2.5 * s}` +
        `Q${tx + c * 5 * s} ${ty + 0.5 * s} ${tx + c * 2.5 * s} ${ty + 1.8 * s}` +
        `Q${tx + c * 0.5 * s} ${ty + 2.2 * s} ${tx - c * 0.5 * s} ${ty + 0.8 * s}` +
        `Q${bx + w0 + lean * s * 0.3} ${y - rise * s * 0.5} ${bx + w0} ${y}Z`,
      fill: style.paper,
      ...stroke,
    });
  };
  return [
    arm(x - 20 * s, -6, 24, -1),
    arm(x + 20 * s, 6, 26, 1),
    arm(x - 14 * s, -5, 19, 1),
    arm(x + 14 * s, 5, 20, -1),
    el("path", {
      d:
        `M${x - 12 * s} ${y}Q${x - 13 * s} ${y - 9 * s} ${x - 8 * s} ${y - 13.5 * s}` +
        `Q${x - 4 * s} ${y - 17 * s} ${x} ${y - 17.5 * s}` +
        `Q${x + 4 * s} ${y - 17 * s} ${x + 8 * s} ${y - 13.5 * s}` +
        `Q${x + 13 * s} ${y - 9 * s} ${x + 12 * s} ${y}Z`,
      fill: style.paper,
      ...stroke,
    }),
    arm(x - 6 * s, -1.5, 7, -1),
    arm(x + 6 * s, 1.5, 7.5, 1),
    el("circle", {
      cx: (x - 4.5 * s).toFixed(1),
      cy: (y - 9 * s).toFixed(1),
      r: (2.0 * k).toFixed(2),
      fill: style.paper,
      stroke: style.ink,
      "stroke-width": (1.0 * k).toFixed(2),
    }),
    el("circle", {
      cx: (x + 4.5 * s).toFixed(1),
      cy: (y - 9 * s).toFixed(1),
      r: (2.0 * k).toFixed(2),
      fill: style.paper,
      stroke: style.ink,
      "stroke-width": (1.0 * k).toFixed(2),
    }),
    el("circle", {
      cx: (x - 4.5 * s).toFixed(1),
      cy: (y - 9 * s).toFixed(1),
      r: (1.0 * k).toFixed(2),
      fill: style.ink,
    }),
    el("circle", {
      cx: (x + 4.5 * s).toFixed(1),
      cy: (y - 9 * s).toFixed(1),
      r: (1.0 * k).toFixed(2),
      fill: style.ink,
    }),
    waterDashes(x, y, s * 0.8, style, k),
  ];
}

export function beastGlyph(
  kind: BeastKind,
  x: number,
  y: number,
  k: number,
  style: MapStyle,
): SvgNode[] {
  switch (kind) {
    case "serpent":
      return serpent(x, y, k, style);
    case "whale":
      return whale(x, y, k, style);
    case "kraken":
      return kraken(x, y, k, style);
  }
}

/** Half-extents of the drawn glyph around (x, y), for arena claims and clearance checks. */
export function beastExtents(kind: BeastKind, k: number): { readonly halfW: number; readonly up: number; readonly down: number } {
  const s = SCALE[kind] * k;
  switch (kind) {
    case "serpent":
      return { halfW: 45 * s, up: 22 * s, down: 6 * s };
    case "whale":
      return { halfW: 37 * s, up: 26 * s, down: 6 * s };
    case "kraken":
      return { halfW: 35 * s, up: 31 * s, down: 6 * s };
  }
}
