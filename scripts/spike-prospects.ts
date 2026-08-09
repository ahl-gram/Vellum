/**
 * THROWAWAY SPIKE (#237, epic #229 "The Prospects"): a hand-faked contact sheet
 * of ~20 engraved prospect vignettes, written once for a single go/no-go review
 * of the silhouette-and-hatching grammar. Nothing here survives into Subs 1-5:
 * every skyline, ridge, and shoreline is hand-authored fakery; no world is
 * generated and no settlement data is read. The only engine imports are the
 * ratified vocabulary being quoted: style tokens, the SVG builder, the heater
 * shield, and the site palette for the sheet chrome.
 *
 * Run: node scripts/spike-prospects.ts   ->  out/prospect-spike.html
 * Delete after the go/no-go is recorded on #237.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { el, renderSvg, escapeXml, type SvgNode } from "../src/render/svg.ts";
import { STYLES, type MapStyle, type StyleName } from "../src/render/style.ts";
import { geom, shieldPath } from "../src/render/layers/heraldry/geom.ts";
import { paletteRootCss } from "../src/atlas/palette.ts";

// ---------------------------------------------------------------- plate frame
const W = 520;
const H = 384;
const M = 23; // margin, ~0.045 * W like transform.ts
const VX0 = M;
const VX1 = W - M;
const BASE = 232; // ground line
const SHORE = BASE + 6; // waterline on coast/river plates
const WATER_BOT = 276; // bottom of the vignette region

type Kind = "capital" | "town" | "village";
type Biome =
  | "fields" | "forest" | "pines" | "marsh" | "coast"
  | "river" | "mountain" | "hills" | "dunes";
type Special = "harbor" | "bridge" | "ruin" | "weir" | null;

type Prospect = {
  readonly n: number;
  readonly name: string;
  readonly epithet: string;
  readonly style: StyleName;
  readonly kind: Kind;
  readonly biome: Biome;
  readonly special: Special;
  readonly seed: number;
  readonly shield?: readonly [number, number];
};

// Style row (1-4) shares one seed so the composition is identical in all four
// dresses; geometry consumes RNG only in style-independent code to keep that true.
const CASES: ReadonlyArray<Prospect> = [
  { n: 1, name: "Hakoawelu", epithet: "a harbour town upon the Great Woaku · founded An. 1123", style: "antique", kind: "town", biome: "coast", special: "harbor", seed: 71 },
  { n: 2, name: "Hakoawelu", epithet: "the same prospect in the surveyor's dress", style: "topographic", kind: "town", biome: "coast", special: "harbor", seed: 71 },
  { n: 3, name: "Hakoawelu", epithet: "the same prospect in the engraver's dress", style: "ink", kind: "town", biome: "coast", special: "harbor", seed: 71 },
  { n: 4, name: "Hakoawelu", epithet: "the same prospect in the pilot's dress", style: "nautical", kind: "town", biome: "coast", special: "harbor", seed: 71 },

  { n: 5, name: "Laukuwelua", epithet: "chief city of the realm of Rekekoa · founded An. 1059", style: "antique", kind: "capital", biome: "fields", special: null, seed: 11, shield: [0, 3] },
  { n: 6, name: "Karag Druum", epithet: "a mountain seat of the draket kings · founded An. 918", style: "ink", kind: "capital", biome: "mountain", special: null, seed: 23, shield: [1, 4] },
  { n: 7, name: "Tessavar", epithet: "chief port of the veshari shore, her mole and customs house · An. 1204", style: "nautical", kind: "capital", biome: "coast", special: "harbor", seed: 37, shield: [3, 1] },
  { n: 8, name: "Zoryhav", epithet: "a river capital of five arches · founded An. 987", style: "topographic", kind: "capital", biome: "river", special: "bridge", seed: 41, shield: [1, 3] },

  { n: 9, name: "Aelthorn", epithet: "a market town under the greenwood · founded An. 1266", style: "antique", kind: "town", biome: "forest", special: null, seed: 53 },
  { n: 10, name: "Miremouth", epithet: "a grey town of the fens · founded An. 1189", style: "ink", kind: "town", biome: "marsh", special: null, seed: 59 },
  { n: 11, name: "Skelbru", epithet: "a bridge town of the norden reach · founded An. 1042", style: "antique", kind: "town", biome: "river", special: "bridge", seed: 61 },
  { n: 12, name: "Tsulan", epithet: "a terraced town among the hills · founded An. 1131", style: "topographic", kind: "town", biome: "hills", special: null, seed: 67 },

  { n: 13, name: "Furrowdene", epithet: "a village of the open fields · founded An. 1310", style: "antique", kind: "village", biome: "fields", special: null, seed: 73 },
  { n: 14, name: "Nadelwik", epithet: "a village under the pinewood · founded An. 1287", style: "topographic", kind: "village", biome: "pines", special: null, seed: 79 },
  { n: 15, name: "Moku-iti", epithet: "a fisher village of the strand · founded An. 1352", style: "nautical", kind: "village", biome: "coast", special: "harbor", seed: 83 },
  { n: 16, name: "Reedholt", epithet: "a fenland hamlet upon stilts · founded An. 1224", style: "ink", kind: "village", biome: "marsh", special: null, seed: 89 },

  { n: 17, name: "Old Weluarapa", epithet: "founded An. 1120 · burned in the realm wars An. 1361", style: "antique", kind: "town", biome: "fields", special: "ruin", seed: 97 },
  { n: 18, name: "Karag Voss", epithet: "a fallen mountain hold · thrown down An. 1266", style: "ink", kind: "capital", biome: "mountain", special: "ruin", seed: 101 },
  { n: 19, name: "Saltmere", epithet: "a drowned village of the marshes · lost to the sea An. 1402", style: "nautical", kind: "village", biome: "marsh", special: "ruin", seed: 103 },

  { n: 20, name: "Oromi-Kai", epithet: "a far isle village under the palms · founded An. 1373", style: "antique", kind: "village", biome: "dunes", special: null, seed: 107 },
  { n: 21, name: "Eelwater", epithet: "a village at the weir · founded An. 1298", style: "nautical", kind: "village", biome: "river", special: "weir", seed: 109 },
];

// ------------------------------------------------------------------- helpers
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (x: number) => Math.round(x * 10) / 10;

type Ctx = {
  readonly style: MapStyle;
  readonly ink: string;
  readonly soft: string;
  readonly paper: string; // building/glyph fill = style.land, per glyph-symbols.ts
};

function ctxFor(style: MapStyle): Ctx {
  return { style, ink: style.ink, soft: style.inkSoft, paper: style.land };
}

function stroke(c: Ctx, w: number) {
  return {
    stroke: c.ink,
    "stroke-width": w,
    "stroke-linecap": "round" as const,
    "stroke-linejoin": "round" as const,
  };
}

// glyph-symbols.ts vocabulary, inlined (no <use>/<defs> so 21 inline SVGs can
// share one page without id collisions)
function placed(x: number, y: number, s: number, nodes: SvgNode[]): SvgNode {
  return el("g", { transform: `translate(${r1(x)} ${r1(y)}) scale(${s.toFixed(2)})` }, nodes);
}
function treeRound(c: Ctx, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0L0 -3.4", fill: "none", ...stroke(c, 0.9) }),
    el("path", {
      d: "M-3.4 -5.4Q-3.4 -8.8 0 -8.8Q3.4 -8.8 3.4 -5.4Q3.4 -2.6 0 -3.2Q-3.4 -2.6 -3.4 -5.4Z",
      fill: c.paper, ...stroke(c, 0.9),
    }),
  ]);
}
function treePine(c: Ctx, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0L0 -2", fill: "none", ...stroke(c, 0.9) }),
    el("path", { d: "M-3 -2L0 -9.5L3 -2Z", fill: c.paper, ...stroke(c, 0.9) }),
  ]);
}
function treePalm(c: Ctx, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M0 0Q1 -4 0.6 -7", fill: "none", ...stroke(c, 1.0) }),
    el("path", {
      d: "M0.6 -7Q-3.4 -8.4 -5 -6M0.6 -7Q-1.4 -10.4 -3.8 -10.6M0.6 -7Q2.2 -10 5 -9.4M0.6 -7Q4 -7.6 5.6 -5.4",
      fill: "none", ...stroke(c, 0.9),
    }),
  ]);
}
function marshTuft(c: Ctx, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", {
      d: "M-6 0H6M-4 -2.4H4M-2 -4.6H2M0 -4.6L0 -7M-1.6 -5L-2.6 -7M1.6 -5L2.6 -7",
      fill: "none", ...stroke(c, 0.8),
    }),
  ]);
}
function dune(c: Ctx, x: number, y: number, s: number): SvgNode {
  return placed(x, y, s, [
    el("path", { d: "M-6 0Q-2 -3 2 0M2 -1Q5 -3 7 -1", fill: "none", ...stroke(c, 0.8) }),
  ]);
}
function birds(c: Ctx, r: () => number, count: number, cy: number): SvgNode[] {
  const out: SvgNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = VX0 + 60 + r() * (VX1 - VX0 - 120);
    const y = cy - 18 + r() * 36;
    const s = 0.7 + r() * 0.5;
    out.push(el("path", {
      d: `M${r1(x - 4.5 * s)} ${r1(y)}q${r1(2.2 * s)} ${r1(-2.8 * s)} ${r1(4.5 * s)} ${r1(-0.6 * s)}q${r1(2.3 * s)} ${r1(-2.2 * s)} ${r1(4.5 * s)} ${r1(0.6 * s)}`,
      fill: "none", ...stroke(c, 0.8),
    }));
  }
  return out;
}

// ------------------------------------------------------------------- terrain
type GroundFn = (x: number) => number;

/** River prospects stand on a raised bank so the bridge reads in front of the town. */
const BANK = BASE - 12;

function baseFor(p: Prospect): number {
  return p.biome === "river" ? BANK : BASE;
}

function groundFor(p: Prospect): GroundFn {
  const rise = p.biome === "mountain" ? 56 : p.biome === "hills" ? 24 : 0;
  const cx = (VX0 + VX1) / 2;
  const base = baseFor(p);
  return (x: number) => {
    if (rise === 0) return base;
    const t = Math.max(0, 1 - ((x - cx) / 200) ** 2);
    return base - rise * t * t;
  };
}

const KIND_SPREAD = { capital: 150, town: 120, village: 78 } as const;

/** Far ridge: scaled-up gl-mtn silhouettes, paper-filled, hatched right flank.
 *  Centered under the town only on mountain/hills seats; otherwise the peaks
 *  FLANK the skyline so they never poke through gaps between buildings.
 *  Fen prospects stay flat: no ridge at all. */
function farRidge(c: Ctx, r: () => number, p: Prospect): SvgNode[] {
  if (p.biome === "marsh") return [];
  const topo = c.style.name === "topographic";
  const big = p.biome === "mountain";
  const centered = big || p.biome === "hills";
  const peaks = centered ? 3 : 2;
  const vcx = (VX0 + VX1) / 2;
  const spread = KIND_SPREAD[p.kind];
  const out: SvgNode[] = [];
  for (let i = 0; i < peaks; i++) {
    const w = big ? 95 + r() * 45 : 55 + r() * 30;
    const raw = centered
      ? VX0 + 70 + (i + 0.5) * ((VX1 - VX0 - 140) / peaks) + (r() - 0.5) * 50
      : vcx + (i === 0 ? -1 : 1) * (spread + 62 + r() * 60);
    const cx = Math.max(VX0 + w + 6, Math.min(VX1 - w - 6, raw));
    const h = big ? 58 + r() * 26 : p.biome === "hills" ? 26 + r() * 12 : 30 + r() * 14;
    const apex = cx + (r() - 0.5) * w * 0.2;
    const base = baseFor(p) + (big ? 2 : 0);
    const d = `M${r1(cx - w)} ${base}Q${r1(cx - w * 0.45)} ${r1(base - h * 0.3)} ${r1(apex)} ${r1(base - h)}Q${r1(cx + w * 0.5)} ${r1(base - h * 0.28)} ${r1(cx + w)} ${base}Z`;
    const fill = topo
      ? (big ? "#cfa67d" : "#c3d5a1")
      : c.paper;
    out.push(el("path", { d, fill, ...stroke(c, topo ? 1.0 : 1.2) }));
    if (topo) {
      // contour bands instead of hatch
      for (const f of [0.4, 0.65]) {
        out.push(el("path", {
          d: `M${r1(cx - w * (1 - f) - 4)} ${r1(base - h * f * 0.82)}Q${r1(apex)} ${r1(base - h * f * 1.25)} ${r1(cx + w * (1 - f) + 4)} ${r1(base - h * f * 0.8)}`,
          fill: "none", stroke: c.style.contourStroke ?? c.soft, "stroke-width": 0.65, "stroke-opacity": 0.8,
        }));
      }
    } else {
      // flank hatch flicks, quoting gl-mtn-1's shading
      const hx = apex;
      const flicks = c.style.name === "ink" ? 4 : 3;
      const parts: string[] = [];
      for (let j = 0; j < flicks; j++) {
        const t0 = 0.18 + j * (0.75 / flicks);
        const x0 = hx + (cx + w - hx) * t0 * 0.5;
        const y0 = base - h * (1 - t0) * 0.92;
        parts.push(`M${r1(x0)} ${r1(y0)}L${r1(x0 + 6 + j * 2)} ${r1(y0 + h * 0.16)}`);
      }
      out.push(el("path", { d: parts.join(""), fill: "none", ...stroke(c, 0.7) }));
    }
  }
  return out;
}

function groundLine(c: Ctx, g: GroundFn, x0: number, x1: number): SvgNode {
  const pts: string[] = [`M${r1(x0)} ${r1(g(x0))}`];
  for (let x = x0 + 8; x <= x1; x += 8) pts.push(`L${r1(x)} ${r1(g(x))}`);
  return el("path", { d: pts.join(""), fill: "none", ...stroke(c, 1.3) });
}

function grassFlicks(c: Ctx, r: () => number, g: GroundFn, x0: number, x1: number, count: number): SvgNode {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = g(x) + 3 + r() * 9;
    parts.push(`M${r1(x)} ${r1(y)}l${r1(2 + r() * 3)} 0`);
  }
  return el("path", { d: parts.join(""), fill: "none", stroke: c.soft, "stroke-width": 0.6, "stroke-opacity": 0.8 });
}

// ----------------------------------------------------------------- buildings
type Bld = {
  readonly x: number; readonly w: number; readonly h: number;
  readonly form: "gable" | "ridge" | "tower" | "spire" | "keep";
  readonly broken: boolean;
};

function windowDashes(c: Ctx, b: Bld, base: number): SvgNode[] {
  if (b.h < 12 || b.w < 8) return [];
  const cols = b.w > 20 ? 2 : 1;
  const out: SvgNode[] = [];
  for (let i = 0; i < cols; i++) {
    const wx = b.x + b.w * (cols === 1 ? 0.5 : 0.3 + i * 0.4);
    out.push(el("rect", {
      x: r1(wx - 0.7), y: r1(base - b.h * 0.62), width: 1.4, height: 2.6, fill: c.ink,
    }));
  }
  return out;
}

function roofHatch(c: Ctx, parts: string[], x0: number, y0: number, dx: number, dy: number, n: number, step: number): void {
  for (let i = 0; i < n; i++) {
    parts.push(`M${r1(x0 + i * step)} ${r1(y0 + i * step * 0.14)}l${r1(dx)} ${r1(dy)}`);
  }
}

/** One building mass: paper-filled ink outline + separate thin shading strokes. */
function building(c: Ctx, b: Bld, base: number, weight: number): SvgNode[] {
  const topo = c.style.name === "topographic";
  const out: SvgNode[] = [];
  const hatch: string[] = [];
  const { x, w, h } = b;
  const top = base - h;

  if (b.form === "gable" || b.form === "ridge") {
    const gh = b.form === "gable" ? Math.min(9, h * 0.45) : Math.min(7, h * 0.4);
    if (b.broken) {
      const d = `M${r1(x)} ${base}L${r1(x)} ${r1(top + h * 0.25)}L${r1(x + w * 0.3)} ${r1(top + h * 0.55)}L${r1(x + w * 0.55)} ${r1(top + h * 0.3)}L${r1(x + w * 0.78)} ${r1(top + h * 0.6)}L${r1(x + w)} ${r1(top + h * 0.45)}L${r1(x + w)} ${base}Z`;
      out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
      hatch.push(`M${r1(x + w * 0.62)} ${r1(top + h * 0.55)}l${r1(w * 0.2)} ${r1(h * 0.28)}`);
      hatch.push(`M${r1(x + w * 0.5)} ${r1(top + h * 0.72)}l${r1(w * 0.22)} ${r1(h * 0.2)}`);
    } else if (b.form === "gable") {
      const d = `M${r1(x)} ${base}L${r1(x)} ${r1(top)}L${r1(x + w / 2)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${base}Z`;
      out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
      if (topo) {
        out.push(el("path", { d: `M${r1(x)} ${r1(top)}L${r1(x + w / 2)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}Z`, fill: c.ink, "fill-opacity": 0.85 }));
      } else {
        roofHatch(c, hatch, x + w * 0.55, top - gh * 0.55, w * 0.16, gh * 0.55, 2, w * 0.14);
      }
    } else {
      const rw = w * 0.24;
      const d = `M${r1(x)} ${base}L${r1(x)} ${r1(top)}L${r1(x + rw)} ${r1(top - gh)}L${r1(x + w - rw)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${base}Z`;
      out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
      if (topo) {
        out.push(el("path", { d: `M${r1(x)} ${r1(top)}L${r1(x + rw)} ${r1(top - gh)}L${r1(x + w - rw)} ${r1(top - gh)}L${r1(x + w)} ${r1(top)}Z`, fill: c.ink, "fill-opacity": 0.85 }));
      } else {
        roofHatch(c, hatch, x + rw + 1, top - gh + 1.2, w * 0.1, gh * 0.8, 3, (w - 2 * rw - 2) / 3);
      }
    }
    if (!b.broken) out.push(...windowDashes(c, b, base));
    if (!b.broken && w > 16 && h > 14) {
      // arched door, solid ink, quoting the castle glyph's door
      const dx = x + w / 2;
      out.push(el("path", {
        d: `M${r1(dx - 1.6)} ${base}L${r1(dx - 1.6)} ${r1(base - 3)}Q${r1(dx)} ${r1(base - 4.6)} ${r1(dx + 1.6)} ${r1(base - 3)}L${r1(dx + 1.6)} ${base}Z`,
        fill: c.ink,
      }));
    }
  } else if (b.form === "tower" || b.form === "spire") {
    if (b.broken) {
      const d = `M${r1(x)} ${base}L${r1(x)} ${r1(top + h * 0.2)}L${r1(x + w * 0.35)} ${r1(top + h * 0.38)}L${r1(x + w * 0.65)} ${r1(top + h * 0.12)}L${r1(x + w)} ${r1(top + h * 0.3)}L${r1(x + w)} ${base}Z`;
      out.push(el("path", { d, fill: c.paper, ...stroke(c, weight) }));
      hatch.push(`M${r1(x + w * 0.55)} ${r1(top + h * 0.35)}l${r1(w * 0.28)} ${r1(h * 0.22)}`);
    } else {
      out.push(el("path", { d: `M${r1(x)} ${base}L${r1(x)} ${r1(top)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${base}Z`, fill: c.paper, ...stroke(c, weight) }));
      if (b.form === "tower") {
        // merlons, quoting settlements.ts castleGlyph
        const t = w / 5;
        const d = `M${r1(x - 0.5)} ${r1(top)}L${r1(x - 0.5)} ${r1(top - 2.6)}L${r1(x + t)} ${r1(top - 2.6)}L${r1(x + t)} ${r1(top)}M${r1(x + 2 * t)} ${r1(top)}L${r1(x + 2 * t)} ${r1(top - 2.6)}L${r1(x + 3 * t)} ${r1(top - 2.6)}L${r1(x + 3 * t)} ${r1(top)}M${r1(x + 4 * t)} ${r1(top)}L${r1(x + 4 * t)} ${r1(top - 2.6)}L${r1(x + w + 0.5)} ${r1(top - 2.6)}L${r1(x + w + 0.5)} ${r1(top)}`;
        out.push(el("path", { d, fill: "none", ...stroke(c, weight * 0.85) }));
      } else {
        const sp = Math.max(12, h * 0.55);
        const cxx = x + w / 2;
        out.push(el("path", { d: `M${r1(x - 0.6)} ${r1(top)}L${r1(cxx)} ${r1(top - sp)}L${r1(x + w + 0.6)} ${r1(top)}Z`, fill: topo ? c.ink : c.paper, ...(topo ? {} : stroke(c, weight)) }));
        out.push(el("path", { d: `M${r1(cxx)} ${r1(top - sp - 1)}L${r1(cxx)} ${r1(top - sp - 4.4)}M${r1(cxx - 1.8)} ${r1(top - sp - 3.2)}L${r1(cxx + 1.8)} ${r1(top - sp - 3.2)}`, fill: "none", ...stroke(c, 0.8) }));
        if (!topo) roofHatch(c, hatch, cxx + 0.8, top - sp * 0.55, w * 0.2, sp * 0.3, 2, 1.8);
      }
      // slit windows
      const wx = x + w / 2;
      out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.28), width: 1.2, height: 3, fill: c.ink }));
      if (h > 30) out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.55), width: 1.2, height: 3, fill: c.ink }));
    }
  } else {
    // keep: broad crenellated mass + two turrets with pennants
    const t = w / 7;
    out.push(el("path", { d: `M${r1(x)} ${base}L${r1(x)} ${r1(top)}L${r1(x + w)} ${r1(top)}L${r1(x + w)} ${base}Z`, fill: c.paper, ...stroke(c, weight) }));
    const d = `M${r1(x)} ${r1(top)}L${r1(x)} ${r1(top - 3)}L${r1(x + t)} ${r1(top - 3)}L${r1(x + t)} ${r1(top)}M${r1(x + 3 * t)} ${r1(top)}L${r1(x + 3 * t)} ${r1(top - 3)}L${r1(x + 4 * t)} ${r1(top - 3)}L${r1(x + 4 * t)} ${r1(top)}M${r1(x + 6 * t)} ${r1(top)}L${r1(x + 6 * t)} ${r1(top - 3)}L${r1(x + w)} ${r1(top - 3)}L${r1(x + w)} ${r1(top)}`;
    out.push(el("path", { d, fill: "none", ...stroke(c, weight * 0.85) }));
    for (const tx of [x + 2, x + w - 6]) {
      out.push(el("path", { d: `M${r1(tx)} ${base}L${r1(tx)} ${r1(top - 9)}L${r1(tx + 4)} ${r1(top - 9)}L${r1(tx + 4)} ${base}Z`, fill: c.paper, ...stroke(c, weight * 0.9) }));
      out.push(el("path", { d: `M${r1(tx - 0.6)} ${r1(top - 9)}L${r1(tx + 2)} ${r1(top - 14)}L${r1(tx + 4.6)} ${r1(top - 9)}Z`, fill: topo ? c.ink : c.paper, ...(topo ? {} : stroke(c, weight * 0.9)) }));
      out.push(el("path", { d: `M${r1(tx + 2)} ${r1(top - 14)}L${r1(tx + 2)} ${r1(top - 18)}l4 1.4l-4 1.4`, fill: "none", ...stroke(c, 0.7) }));
    }
    const dx = x + w / 2;
    out.push(el("path", {
      d: `M${r1(dx - 2.2)} ${base}L${r1(dx - 2.2)} ${r1(base - 4.2)}Q${r1(dx)} ${r1(base - 6.4)} ${r1(dx + 2.2)} ${r1(base - 4.2)}L${r1(dx + 2.2)} ${base}Z`,
      fill: c.ink,
    }));
    out.push(el("rect", { x: r1(x + w * 0.3), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: c.ink }));
    out.push(el("rect", { x: r1(x + w * 0.66), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: c.ink }));
  }

  if (hatch.length > 0) {
    out.push(el("path", { d: hatch.join(""), fill: "none", ...stroke(c, 0.7) }));
  }
  if (b.broken) {
    // rubble at the foot
    const rb: string[] = [];
    for (let i = 0; i < 3; i++) {
      const rx = x + (i + 0.3) * (w / 3);
      rb.push(`M${r1(rx)} ${base}l${r1(2.4)} ${-1.8}l${r1(2)} ${1.8}Z`);
    }
    out.push(el("path", { d: rb.join(""), fill: c.paper, ...stroke(c, 0.7) }));
  }
  return out;
}

function curtainWall(c: Ctx, g: GroundFn, x0: number, x1: number, h: number, gate: boolean): SvgNode[] {
  const out: SvgNode[] = [];
  const step = 8;
  const topPts: string[] = [];
  for (let x = x0; x <= x1; x += step) topPts.push(`${r1(x)} ${r1(g(x) - h)}`);
  const d = `M${r1(x0)} ${r1(g(x0))}L${topPts.join("L")}L${r1(x1)} ${r1(g(x1))}Z`;
  out.push(el("path", { d, fill: c.paper, ...stroke(c, 1.1) }));
  // merlon teeth along the top
  const teeth: string[] = [];
  for (let x = x0 + 3; x < x1 - 3; x += 7) {
    teeth.push(`M${r1(x)} ${r1(g(x) - h)}L${r1(x)} ${r1(g(x) - h - 2.4)}L${r1(x + 3.4)} ${r1(g(x + 3.4) - h - 2.4)}L${r1(x + 3.4)} ${r1(g(x + 3.4) - h)}`);
  }
  out.push(el("path", { d: teeth.join(""), fill: "none", ...stroke(c, 0.8) }));
  if (gate) {
    const cx = (x0 + x1) / 2;
    const gb = g(cx);
    out.push(el("path", {
      d: `M${r1(cx - 4)} ${r1(gb)}L${r1(cx - 4)} ${r1(gb - 6)}Q${r1(cx)} ${r1(gb - 10)} ${r1(cx + 4)} ${r1(gb - 6)}L${r1(cx + 4)} ${r1(gb)}Z`,
      fill: c.ink,
    }));
  }
  return out;
}

/** Packed medieval skyline: back row first (thinner stroke), then the front row. */
function townscape(c: Ctx, r: () => number, p: Prospect, g: GroundFn): SvgNode[] {
  const ruined = p.special === "ruin";
  const params = {
    capital: { n: 11, hMin: 16, hMax: 30, spires: 3, keep: true, wall: true },
    town: { n: 9, hMin: 13, hMax: 23, spires: 2, keep: false, wall: p.biome !== "marsh" },
    village: { n: 5, hMin: 10, hMax: 16, spires: 1, keep: false, wall: false },
  }[p.kind];
  const cx = (VX0 + VX1) / 2;

  // geometry first (consumes rng identically whatever the style);
  // packed run built at 0 then re-centered on the vignette
  const mkRow = (n: number, hScale: number): Bld[] => {
    const blds: Bld[] = [];
    let x = 0;
    for (let i = 0; i < n; i++) {
      const w = 15 + r() * 13;
      const h = (params.hMin + r() * (params.hMax - params.hMin)) * hScale;
      const form: Bld["form"] = r() < 0.55 ? "gable" : "ridge";
      blds.push({ x, w, h, form, broken: ruined && r() < 0.6 });
      x += w * (0.62 + r() * 0.28);
    }
    const last = blds[blds.length - 1]!;
    const shift = cx - (last.x + last.w) / 2;
    return blds.map((b) => ({ ...b, x: b.x + shift }));
  };
  const back = mkRow(Math.round(params.n * 0.6), 0.8);
  const front = mkRow(params.n, 1);
  const first = front[0]!;
  const lastB = front[front.length - 1]!;
  const runX0 = first.x - 12;
  const runX1 = lastB.x + lastB.w + 12;
  // spires + towers replace/join front-row slots
  const verticals: Bld[] = [];
  for (let i = 0; i < params.spires; i++) {
    const bi = front[Math.floor(r() * front.length)]!;
    const form: Bld["form"] = i === 0 ? "spire" : r() < 0.5 ? "tower" : "spire";
    verticals.push({ x: bi.x + bi.w * 0.2, w: 9 + r() * 4, h: params.hMax + 8 + r() * 10, form, broken: ruined && r() < 0.5 });
  }
  const keep: Bld | null = params.keep
    ? { x: cx - 17, w: 34, h: params.hMax + 16, form: "keep", broken: ruined && r() < 0.5 }
    : null;

  const out: SvgNode[] = [];
  for (const b of back) out.push(...building(c, { ...b, x: b.x + 6 }, g(b.x + b.w / 2) - 8, 0.9));
  if (params.wall && !ruined) out.push(...curtainWall(c, g, runX0, runX1, p.kind === "capital" ? 13 : 10, true));
  if (params.wall && ruined) {
    // broken wall: two stubs hugging the run
    out.push(...curtainWall(c, g, runX0, runX0 + 44, 9, false));
    out.push(...curtainWall(c, g, runX1 - 38, runX1, 9, false));
  }
  if (keep) out.push(...building(c, keep, g(cx) - (params.wall ? 4 : 0), 1.3));
  for (const b of front) out.push(...building(c, b, g(b.x + b.w / 2), 1.2));
  for (const b of verticals) out.push(...building(c, b, g(b.x + b.w / 2), 1.2));
  // stilts under two hamlet houses, for the fen case
  if (p.biome === "marsh" && p.kind === "village" && !ruined) {
    const st: string[] = [];
    for (const b of front.slice(0, 3)) {
      st.push(`M${r1(b.x + 2)} ${r1(g(b.x))}l0 5M${r1(b.x + b.w - 2)} ${r1(g(b.x))}l0 5`);
    }
    out.push(el("path", { d: st.join(""), fill: "none", ...stroke(c, 0.9) }));
  }
  return out;
}

// -------------------------------------------------------------------- water
function waveFlourish(c: Ctx, x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}q${r1(4 * s)} ${r1(-3 * s)} ${r1(8 * s)} 0q${r1(4 * s)} ${r1(3 * s)} ${r1(8 * s)} 0`,
    fill: "none", stroke: c.soft, "stroke-width": 0.9, "stroke-opacity": 0.5, "stroke-linecap": "round",
  });
}
function rippleDash(c: Ctx, x: number, y: number, s: number): SvgNode {
  return el("path", {
    d: `M${r1(x)} ${r1(y)}h${r1(8 * s)}m${r1(5 * s)} 0h${r1(10 * s)}m${r1(4 * s)} 0h${r1(7 * s)}`,
    fill: "none", stroke: c.soft, "stroke-width": 0.8, "stroke-opacity": 0.55,
  });
}

/** The sea-decor ship, quoted at local scale. */
function ship(c: Ctx, x: number, y: number, s: number): SvgNode {
  const sk = stroke(c, 1.3);
  return el("g", { opacity: 0.9 }, [
    el("path", { d: `M${r1(x - 13 * s)} ${r1(y - 2 * s)}q${r1(13 * s)} ${r1(7 * s)} ${r1(26 * s)} 0l${r1(-3 * s)} ${r1(-2.4 * s)}h${r1(-20 * s)}Z`, fill: c.paper, ...sk }),
    el("path", { d: `M${r1(x)} ${r1(y - 4.4 * s)}V${r1(y - 22 * s)}`, fill: "none", ...sk }),
    el("path", { d: `M${r1(x)} ${r1(y - 21 * s)}q${r1(-11 * s)} ${r1(7 * s)} 0 ${r1(15 * s)}Z`, fill: c.paper, ...sk }),
    el("path", { d: `M${r1(x + 1.4 * s)} ${r1(y - 20 * s)}q${r1(8 * s)} ${r1(6 * s)} ${r1(1 * s)} ${r1(13 * s)}Z`, fill: c.paper, ...sk }),
    el("path", { d: `M${r1(x)} ${r1(y - 22 * s)}l${r1(5 * s)} ${r1(1.8 * s)}l${r1(-5 * s)} ${r1(1.8 * s)}Z`, fill: c.ink }),
    rippleDash(c, x - 18 * s, y + 3 * s, s),
  ]);
}

/** Moored masts + bare hulls along a quay. */
function mastRow(c: Ctx, r: () => number, x0: number, x1: number, y: number, count: number): SvgNode[] {
  const out: SvgNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = x0 + (i + 0.5) * ((x1 - x0) / count) + (r() - 0.5) * 8;
    const hy = y + 2 + r() * 6;
    const mh = 42 + r() * 26;
    const s = 0.8;
    out.push(el("path", { d: `M${r1(x - 11 * s)} ${r1(hy)}q${r1(11 * s)} ${r1(5.5 * s)} ${r1(22 * s)} 0l${r1(-2.5 * s)} ${r1(-3 * s)}h${r1(-17 * s)}Z`, fill: c.paper, ...stroke(c, 1.1) }));
    out.push(el("path", { d: `M${r1(x)} ${r1(hy - 2)}V${r1(hy - mh)}`, fill: "none", ...stroke(c, 1.0) }));
    out.push(el("path", { d: `M${r1(x - 7)} ${r1(hy - mh * 0.72)}h14`, fill: "none", ...stroke(c, 0.8) }));
    out.push(el("path", { d: `M${r1(x)} ${r1(hy - mh)}l4 1.4l-4 1.4`, fill: "none", ...stroke(c, 0.7) }));
    out.push(el("path", { d: `M${r1(x)} ${r1(hy - mh * 0.72)}L${r1(x - 8)} ${r1(hy - 2)}M${r1(x)} ${r1(hy - mh * 0.72)}L${r1(x + 8)} ${r1(hy - 2)}`, fill: "none", stroke: c.ink, "stroke-width": 0.45, "stroke-opacity": 0.8 }));
  }
  return out;
}

function quay(c: Ctx, x0: number, x1: number, y: number): SvgNode[] {
  const topo = c.style.name === "topographic";
  const out: SvgNode[] = [
    el("path", { d: `M${r1(x0)} ${r1(y - 4)}L${r1(x1)} ${r1(y - 4)}L${r1(x1)} ${r1(y + 4)}L${r1(x0)} ${r1(y + 4)}Z`, fill: c.paper, ...stroke(c, 1.1) }),
  ];
  if (topo) {
    // cased red road along the quay top, quoting the topo road treatment
    out.push(el("path", { d: `M${r1(x0 + 2)} ${r1(y - 4)}H${r1(x1 - 2)}`, fill: "none", stroke: c.style.paper, "stroke-width": 2.6 }));
    out.push(el("path", { d: `M${r1(x0 + 2)} ${r1(y - 4)}H${r1(x1 - 2)}`, fill: "none", stroke: c.style.road, "stroke-width": 1.4 }));
  }
  const joints: string[] = [];
  for (let x = x0 + 6; x < x1 - 2; x += 7) joints.push(`M${r1(x)} ${r1(y - 3.4)}V${r1(y + 3.4)}`);
  out.push(el("path", { d: joints.join(""), fill: "none", stroke: c.ink, "stroke-width": 0.55, "stroke-opacity": 0.75 }));
  for (const bx of [x0 + 10, (x0 + x1) / 2, x1 - 10]) {
    out.push(el("circle", { cx: r1(bx), cy: r1(y - 5.6), r: 1.1, fill: c.ink }));
  }
  return out;
}

function waterBand(c: Ctx, r: () => number, p: Prospect, y0: number, y1: number): SvgNode[] {
  const st = c.style;
  const out: SvgNode[] = [];
  if (st.ocean !== st.paper) {
    out.push(el("rect", { x: VX0, y: r1(y0), width: VX1 - VX0, height: r1(y1 - y0), fill: st.ocean }));
  }
  if (st.shoalTint) {
    out.push(el("rect", { x: VX0, y: r1(y0), width: VX1 - VX0, height: 9, fill: st.shoalTint }));
    out.push(el("path", { d: `M${VX0} ${r1(y0 + 9)}H${VX1}`, fill: "none", stroke: c.soft, "stroke-width": 0.8, "stroke-dasharray": "4 2.6", "stroke-opacity": 0.55 }));
  }
  // the 3-pass waterline halo, scaled to the plate
  for (const ring of [{ w: 5.5, o: 0.16 }, { w: 3.3, o: 0.26 }, { w: 1.6, o: 0.42 }]) {
    out.push(el("path", { d: `M${VX0} ${r1(y0)}H${VX1}`, fill: "none", stroke: st.waterline, "stroke-width": ring.w, "stroke-opacity": ring.o }));
  }
  out.push(el("path", { d: `M${VX0} ${r1(y0)}H${VX1}`, fill: "none", stroke: st.coastStroke, "stroke-width": 1.2 }));
  if (st.seaDecorations) {
    const waves = st.name === "ink" ? 5 : 3;
    for (let i = 0; i < waves; i++) {
      out.push(waveFlourish(c, VX0 + 30 + r() * (VX1 - VX0 - 90), y0 + 8 + r() * (y1 - y0 - 16), 0.9 + r() * 0.3));
    }
    for (let i = 0; i < 2; i++) {
      out.push(rippleDash(c, VX0 + 40 + r() * (VX1 - VX0 - 140), y0 + 6 + r() * (y1 - y0 - 12), 1));
    }
  } else {
    for (let i = 0; i < 3; i++) {
      out.push(rippleDash(c, VX0 + 40 + r() * (VX1 - VX0 - 140), y0 + 6 + r() * (y1 - y0 - 12), 1));
    }
  }
  if (st.soundings) {
    const depths = [3, 5, 2, 7];
    for (let i = 0; i < 4; i++) {
      const sx = VX0 + 50 + r() * (VX1 - VX0 - 100);
      const sy = y0 + 10 + r() * (y1 - y0 - 16);
      const tilt = Math.round((r() - 0.5) * 18);
      out.push(el("text", {
        x: r1(sx), y: r1(sy), "text-anchor": "middle",
        transform: `rotate(${tilt} ${r1(sx)} ${r1(sy)})`,
        "font-family": st.fontFamily, "font-size": 7.5, "font-style": "italic",
        fill: st.ink, "fill-opacity": 0.62,
      }, [String(depths[i % depths.length])]));
    }
  }
  void p;
  return out;
}

function bridge(c: Ctx, x0: number, x1: number, deckY: number, waterY: number, arches: number): SvgNode[] {
  const topo = c.style.name === "topographic";
  const out: SvgNode[] = [];
  const span = (x1 - x0) / arches;
  // deck with a slight camber
  const midY = deckY - 5;
  out.push(el("path", { d: `M${r1(x0 - 14)} ${r1(deckY + 2)}L${r1(x0)} ${r1(deckY)}Q${r1((x0 + x1) / 2)} ${r1(midY - 3)} ${r1(x1)} ${r1(deckY)}L${r1(x1 + 14)} ${r1(deckY + 2)}`, fill: "none", ...stroke(c, 1.3) }));
  out.push(el("path", { d: `M${r1(x0 - 12)} ${r1(deckY - 3)}L${r1(x0)} ${r1(deckY - 3.4)}Q${r1((x0 + x1) / 2)} ${r1(midY - 6.4)} ${r1(x1)} ${r1(deckY - 3.4)}L${r1(x1 + 12)} ${r1(deckY - 3)}`, fill: "none", ...stroke(c, 0.8) }));
  if (topo) {
    out.push(el("path", { d: `M${r1(x0)} ${r1(deckY - 1.6)}Q${r1((x0 + x1) / 2)} ${r1(midY - 4.6)} ${r1(x1)} ${r1(deckY - 1.6)}`, fill: "none", stroke: c.style.paper, "stroke-width": 2.4 }));
    out.push(el("path", { d: `M${r1(x0)} ${r1(deckY - 1.6)}Q${r1((x0 + x1) / 2)} ${r1(midY - 4.6)} ${r1(x1)} ${r1(deckY - 1.6)}`, fill: "none", stroke: c.style.road, "stroke-width": 1.3 }));
  }
  for (let i = 0; i <= arches; i++) {
    const px = x0 + i * span;
    if (i > 0 && i < arches) {
      out.push(el("path", { d: `M${r1(px - 2.4)} ${r1(deckY)}V${r1(waterY)}L${r1(px - 5)} ${r1(waterY)}L${r1(px)} ${r1(waterY - 4.6)}L${r1(px + 5)} ${r1(waterY)}L${r1(px + 2.4)} ${r1(waterY)}V${r1(deckY)}`, fill: c.paper, ...stroke(c, 0.9) }));
    }
    if (i < arches) {
      const ax0 = px + 4.5;
      const ax1 = px + span - 4.5;
      out.push(el("path", { d: `M${r1(ax0)} ${r1(waterY)}Q${r1(ax0)} ${r1(deckY + 3)} ${r1((ax0 + ax1) / 2)} ${r1(deckY + 3)}Q${r1(ax1)} ${r1(deckY + 3)} ${r1(ax1)} ${r1(waterY)}`, fill: "none", ...stroke(c, 0.9) }));
      out.push(rippleDash(c, (ax0 + ax1) / 2 - 12, waterY + 5 + (i % 2) * 4, 0.7));
    }
  }
  return out;
}

// ------------------------------------------------------------------ dressing
function parchmentDefs(c: Ctx, id: number): SvgNode[] {
  if (!c.style.parchmentTexture) return [];
  return [
    el("filter", { id: `parch-${id}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.014", numOctaves: 3, seed: id * 7, stitchTiles: "stitch" }),
      el("feColorMatrix", { values: "0 0 0 0 0.30  0 0 0 0 0.23  0 0 0 0 0.12  0.45 0 0 0 0" }),
    ]),
    el("radialGradient", { id: `vig-${id}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": "#4a3826", "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": "#4a3826", "stop-opacity": 0.16 }),
    ]),
  ];
}

function shieldNode(c: Ctx, id: number, tints: readonly [number, number]): SvgNode[] {
  const size = 27;
  const g = geom(VX1 - 36, 62, size);
  const d = shieldPath(g);
  const clipId = `arms-${id}`;
  const tint = (i: number) => c.style.realmTints[i % c.style.realmTints.length]!;
  const fieldNodes: SvgNode[] =
    c.style.name === "ink"
      ? [
          el("rect", { x: g.x0, y: g.top, width: g.w, height: g.h, fill: c.style.paper }),
          // per-pale azure: horizontal Petra Sancta lines on the dexter half
          el("path", {
            d: Array.from({ length: 8 }, (_, i) => `M${r1(g.x0)} ${r1(g.top + 2 + i * (g.h / 8))}H${r1(g.cx)}`).join(""),
            fill: "none", stroke: c.ink, "stroke-width": 0.55,
          }),
        ]
      : [
          el("rect", { x: g.x0, y: g.top, width: g.half, height: g.h, fill: tint(tints[0]) }),
          el("rect", { x: g.cx, y: g.top, width: g.half, height: g.h, fill: tint(tints[1]) }),
        ];
  return [
    el("g", {}, [
      // straps up to the neatline, as if hung on the plate
      el("path", { d: `M${r1(g.cx - 6)} ${r1(g.top)}L${r1(g.cx - 3)} ${M}M${r1(g.cx + 6)} ${r1(g.top)}L${r1(g.cx + 3)} ${M}`, fill: "none", stroke: c.ink, "stroke-width": 0.6, "stroke-opacity": 0.7 }),
      el("clipPath", { id: clipId }, [el("path", { d })]),
      el("g", { "clip-path": `url(#${clipId})` }, fieldNodes),
      el("path", { d, fill: "none", stroke: c.ink, "stroke-width": r1(g.w * 0.045), "stroke-linejoin": "round" }),
    ]),
  ];
}

function caption(c: Ctx, p: Prospect): SvgNode[] {
  const cx = W / 2;
  const st = c.style;
  const title = `THE PROSPECT OF ${p.name.toUpperCase()}`;
  const fs = Math.min(14.5, (W - 120) / (title.length * 0.62));
  const ruined = p.special === "ruin";
  return [
    el("line", { x1: cx - 76, y1: 294, x2: cx + 76, y2: 294, stroke: st.ink, "stroke-width": 0.9 }),
    el("path", { d: `M${cx} 290.8L${cx + 3.2} 294L${cx} 297.2L${cx - 3.2} 294Z`, fill: st.ink }),
    el("text", {
      x: cx, y: 316, "text-anchor": "middle",
      "font-family": st.fontFamilyTitle, "font-size": r1(fs),
      "letter-spacing": 1.3, fill: st.ink,
      ...(ruined ? { "font-style": "italic", "fill-opacity": 0.85 } : {}),
    }, [title]),
    el("text", {
      x: cx, y: 334, "text-anchor": "middle",
      "font-family": st.fontFamily, "font-size": 9.5, "font-style": "italic", fill: st.inkSoft,
    }, [p.epithet]),
    el("text", {
      x: cx, y: 353, "text-anchor": "middle",
      "font-family": st.fontFamily, "font-size": 8, "letter-spacing": 2.2, fill: st.inkSoft,
    }, [`VELLUM · PROSPECT № ${p.n} · ${st.name.toUpperCase()}`]),
  ];
}

function plateFrame(c: Ctx): SvgNode[] {
  const oi = Math.round(M * 0.45);
  return [
    el("rect", { x: oi, y: oi, width: W - 2 * oi, height: H - 2 * oi, fill: "none", stroke: c.ink, "stroke-width": 2 }),
    el("rect", { x: oi + 4, y: oi + 4, width: W - 2 * oi - 8, height: H - 2 * oi - 8, fill: "none", stroke: c.ink, "stroke-width": 0.7 }),
  ];
}

// ------------------------------------------------------------ biome dressing
function foreground(c: Ctx, r: () => number, p: Prospect, g: GroundFn): SvgNode[] {
  const out: SvgNode[] = [];
  const cx = (VX0 + VX1) / 2;
  switch (p.biome) {
    case "fields": {
      for (let row = 0; row < 4; row++) {
        const y = BASE + 10 + row * 9;
        const xa = VX0 + 18 + row * 12 + r() * 8;
        const xb = VX1 - 20 - row * 9 - r() * 8;
        const dashes: string[] = [];
        for (let x = xa; x < xb; x += 13) dashes.push(`M${r1(x)} ${r1(y + Math.sin(x * 0.02) * 1.5)}h8`);
        out.push(el("path", { d: dashes.join(""), fill: "none", stroke: c.soft, "stroke-width": 0.6, "stroke-opacity": 0.85 }));
      }
      out.push(treeRound(c, VX0 + 42 + r() * 20, BASE + 26, 1.7));
      out.push(treeRound(c, VX1 - 50 - r() * 20, BASE + 30, 1.9));
      break;
    }
    case "forest": {
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = cx + side * (105 + r() * 105);
        out.push(treeRound(c, x, BASE - 4 - r() * 10, 1.3 + r() * 0.5));
      }
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = cx + side * (66 + r() * 145);
        out.push(treeRound(c, x, BASE + 12 + r() * 22, 1.9 + r() * 0.9));
      }
      break;
    }
    case "pines": {
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        out.push(treePine(c, cx + side * (100 + r() * 110), BASE - 2 - r() * 10, 1.4 + r() * 0.5));
      }
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        out.push(treePine(c, cx + side * (60 + r() * 150), BASE + 12 + r() * 22, 2.0 + r() * 0.8));
      }
      break;
    }
    case "marsh": {
      for (let i = 0; i < 9; i++) {
        out.push(marshTuft(c, VX0 + 30 + r() * (VX1 - VX0 - 60), BASE + 12 + r() * 26, 1.5 + r() * 0.7));
      }
      for (let i = 0; i < 4; i++) {
        out.push(rippleDash(c, VX0 + 30 + r() * (VX1 - VX0 - 120), BASE + 14 + r() * 22, 0.8));
      }
      break;
    }
    case "dunes": {
      // the strand: dunes stay on the beach band above the waterline
      for (let i = 0; i < 5; i++) {
        out.push(dune(c, VX0 + 40 + r() * (VX1 - VX0 - 80), BASE - 8 + r() * 11, 1.6 + r() * 0.5));
      }
      out.push(treePalm(c, cx - 95 - r() * 30, BASE - 2, 2.1));
      out.push(treePalm(c, cx + 88 + r() * 30, BASE - 4, 2.4));
      out.push(treePalm(c, cx - 130 - r() * 30, BASE + 1, 2.6));
      break;
    }
    case "mountain":
    case "hills": {
      const dashes: string[] = [];
      for (let row = 0; row < 3; row++) {
        const y = BASE + 12 + row * 9;
        for (let x = VX0 + 30 + row * 16; x < VX1 - 30 - row * 12; x += 15) dashes.push(`M${r1(x)} ${r1(y)}h7`);
      }
      out.push(el("path", { d: dashes.join(""), fill: "none", stroke: c.soft, "stroke-width": 0.6, "stroke-opacity": 0.8 }));
      if (p.biome === "hills") {
        out.push(treeRound(c, cx - 150 - r() * 30, BASE + 20, 1.8));
        out.push(treeRound(c, cx + 150 + r() * 20, BASE + 26, 2));
      }
      break;
    }
    case "coast":
    case "river":
      break; // water dressing handles these
  }
  return out;
}

function specialLayer(c: Ctx, r: () => number, p: Prospect): SvgNode[] {
  const out: SvgNode[] = [];
  const cx = (VX0 + VX1) / 2;
  if (p.biome === "coast" || p.biome === "dunes") {
    out.push(...waterBand(c, r, p, SHORE, WATER_BOT));
    if (p.special === "harbor" && p.kind !== "village") {
      const q0 = cx - 130;
      const q1 = cx + 40;
      out.push(...quay(c, q0, q1, SHORE));
      out.push(...mastRow(c, r, q1 + 14, VX1 - 60, SHORE + 8, p.kind === "capital" ? 5 : 4));
      out.push(ship(c, VX0 + 70 + r() * 30, WATER_BOT - 16, 1.15));
      if (p.kind === "capital") {
        // the mole, curving out with a light at its head
        const mx = VX1 - 52;
        out.push(el("path", { d: `M${r1(VX1 - 10)} ${r1(SHORE - 2)}Q${r1(mx + 18)} ${r1(SHORE + 2)} ${r1(mx)} ${r1(SHORE + 10)}L${r1(mx)} ${r1(SHORE + 16)}`, fill: "none", ...stroke(c, 1.6) }));
        out.push(el("path", { d: `M${r1(mx - 3)} ${r1(SHORE + 16)}L${r1(mx - 2)} ${r1(SHORE - 6)}L${r1(mx + 2)} ${r1(SHORE - 6)}L${r1(mx + 3)} ${r1(SHORE + 16)}Z`, fill: c.paper, ...stroke(c, 1) }));
        out.push(el("path", { d: `M${r1(mx - 2.6)} ${r1(SHORE - 6)}L${r1(mx)} ${r1(SHORE - 10)}L${r1(mx + 2.6)} ${r1(SHORE - 6)}Z`, fill: c.paper, ...stroke(c, 0.9) }));
        out.push(el("circle", { cx: r1(mx), cy: r1(SHORE - 7.4), r: 1, fill: c.ink }));
      }
    }
    if (p.special === "harbor" && p.kind === "village") {
      // beached hulls on the sand, a post jetty, drying nets
      for (const [bx, tilt] of [[cx - 60, -7], [cx + 34, 5]] as const) {
        out.push(el("g", { transform: `rotate(${tilt} ${r1(bx)} ${r1(SHORE - 2)})` }, [
          el("path", { d: `M${r1(bx - 11)} ${r1(SHORE - 2)}q11 5.5 22 0l-2.5 -3h-17Z`, fill: c.paper, ...stroke(c, 1.1) }),
        ]));
      }
      const jx = cx + 110;
      out.push(el("path", { d: `M${r1(jx - 30)} ${r1(SHORE - 1)}L${r1(jx + 34)} ${r1(SHORE + 6)}`, fill: "none", ...stroke(c, 1.2) }));
      const posts: string[] = [];
      for (let i = 0; i < 4; i++) posts.push(`M${r1(jx - 20 + i * 16)} ${r1(SHORE + 0.5 + i * 1.6)}v6`);
      out.push(el("path", { d: posts.join(""), fill: "none", ...stroke(c, 0.9) }));
      const nx = cx - 122;
      out.push(el("path", { d: `M${r1(nx)} ${r1(SHORE - 16)}h16M${r1(nx + 2)} ${r1(SHORE - 16)}v12M${r1(nx + 8)} ${r1(SHORE - 16)}v12M${r1(nx + 14)} ${r1(SHORE - 16)}v12M${r1(nx)} ${r1(SHORE - 11)}h16M${r1(nx)} ${r1(SHORE - 6.6)}h16`, fill: "none", stroke: c.ink, "stroke-width": 0.5, "stroke-opacity": 0.85 }));
    }
  }
  if (p.biome === "river") {
    const wy0 = BANK + 10;
    const wy1 = BANK + 38;
    out.push(...waterBand(c, r, p, wy0, wy1));
    // the near bank below the river
    out.push(el("path", { d: `M${VX0} ${r1(wy1)}H${VX1}`, fill: "none", ...stroke(c, 1.1) }));
    out.push(grassFlicks(c, r, () => wy1 + 2, VX0 + 16, VX1 - 16, 10));
    if (p.special === "bridge") {
      const grand = p.kind === "capital";
      const arches = grand ? 5 : 3;
      const bx0 = grand ? cx - 150 : cx + 10;
      const bx1 = grand ? cx + 150 : cx + 158;
      out.push(...bridge(c, bx0, bx1, wy0 - 3, wy1 - 5, arches));
    }
    if (p.special === "weir") {
      out.push(el("path", { d: `M${r1(cx - 90)} ${r1(wy0 + 9)}L${r1(cx + 90)} ${r1(wy0 + 9)}M${r1(cx - 90)} ${r1(wy0 + 11.4)}L${r1(cx + 90)} ${r1(wy0 + 11.4)}`, fill: "none", ...stroke(c, 1) }));
      const foam: string[] = [];
      for (let x = cx - 84; x < cx + 84; x += 9) foam.push(`M${r1(x)} ${r1(wy0 + 14)}v2.6`);
      out.push(el("path", { d: foam.join(""), fill: "none", stroke: c.soft, "stroke-width": 0.6, "stroke-opacity": 0.8 }));
      // the mill on the near bank, wheel dipped into the race
      const mx = cx + 108;
      out.push(...building(c, { x: mx, w: 22, h: 15, form: "gable", broken: false }, wy1 + 9, 1.2));
      const wcx = mx - 4;
      const wcy = wy1 + 1;
      out.push(el("circle", { cx: r1(wcx), cy: r1(wcy), r: 6, fill: "none", ...stroke(c, 0.9) }));
      const spokes: string[] = [];
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        spokes.push(`M${r1(wcx - Math.cos(a) * 6)} ${r1(wcy - Math.sin(a) * 6)}L${r1(wcx + Math.cos(a) * 6)} ${r1(wcy + Math.sin(a) * 6)}`);
      }
      out.push(el("path", { d: spokes.join(""), fill: "none", stroke: c.ink, "stroke-width": 0.55 }));
    }
  }
  if (p.special === "ruin" && p.biome === "marsh") {
    // the drowned village: a water sheet over the fen, a leaning tower and a
    // half-sunk gable still standing in it
    out.push(...waterBand(c, r, p, BASE + 14, WATER_BOT));
    out.push(el("g", { transform: `rotate(-9 ${cx + 60} ${BASE + 16})` }, [
      el("path", { d: `M${r1(cx + 54)} ${r1(BASE + 18)}L${r1(cx + 54)} ${r1(BASE - 22)}L${r1(cx + 59)} ${r1(BASE - 27)}L${r1(cx + 66)} ${r1(BASE - 18)}L${r1(cx + 66)} ${r1(BASE + 18)}Z`, fill: c.paper, ...stroke(c, 1.1) }),
      el("rect", { x: r1(cx + 59), y: r1(BASE - 14), width: 1.4, height: 3, fill: c.ink }),
    ]));
    out.push(el("path", { d: `M${r1(cx - 52)} ${r1(BASE + 17)}L${r1(cx - 52)} ${r1(BASE + 2)}L${r1(cx - 44)} ${r1(BASE - 6)}L${r1(cx - 36)} ${r1(BASE + 4)}L${r1(cx - 36)} ${r1(BASE + 17)}Z`, fill: c.paper, ...stroke(c, 1.0) }));
    out.push(rippleDash(c, cx + 40, BASE + 22, 0.9));
    out.push(rippleDash(c, cx - 66, BASE + 24, 0.8));
  }
  return out;
}

// ------------------------------------------------------------------ assembly
function prospect(p: Prospect): string {
  const c = ctxFor(STYLES[p.style]);
  const st = c.style;
  const rGeo = mulberry32(p.seed);
  const rDecor = mulberry32(p.seed * 7 + 1);
  const g = groundFor(p);

  const sky: SvgNode[] = [];
  if (st.name === "ink") {
    const lines: string[] = [];
    for (let i = 0; i < 4; i++) lines.push(`M${VX0 + 14} ${58 + i * 7}H${VX1 - 14}`);
    sky.push(el("path", { d: lines.join(""), fill: "none", stroke: c.soft, "stroke-width": 0.45, "stroke-opacity": 0.3 }));
  }
  if (p.special === "ruin" || p.biome === "coast") {
    sky.push(...birds(c, rDecor, p.special === "ruin" ? 4 : 2, 88));
  }
  const lateDecor: SvgNode[] = [];
  if (p.n === 20) {
    // one far-off serpent for the far isles, quoting sea-decor (delight, flagged);
    // drawn after the water band so it swims on it, not under it
    const x = VX0 + 74;
    const y = BASE + 30;
    const s = 0.55;
    lateDecor.push(el("g", { opacity: 0.85 }, [
      el("path", { d: `M${r1(x - 32 * s)} ${r1(y)}q${r1(7 * s)} ${r1(-13 * s)} ${r1(14 * s)} 0`, fill: c.paper, ...stroke(c, 1.1) }),
      el("path", { d: `M${r1(x - 14 * s)} ${r1(y)}q${r1(7 * s)} ${r1(-16 * s)} ${r1(14 * s)} 0`, fill: c.paper, ...stroke(c, 1.1) }),
      el("path", { d: `M${r1(x + 4 * s)} ${r1(y)}q${r1(2 * s)} ${r1(-12 * s)} ${r1(8 * s)} ${r1(-13 * s)}q${r1(7 * s)} ${r1(-1.4 * s)} ${r1(7 * s)} ${r1(4 * s)}q0 ${r1(3.4 * s)} ${r1(-5 * s)} ${r1(2.6 * s)}l${r1(2 * s)} ${r1(2.4 * s)}`, fill: c.paper, ...stroke(c, 1.1) }),
      el("circle", { cx: r1(x + 14.6 * s), cy: r1(y - 10.4 * s), r: 0.8, fill: c.ink }),
      rippleDash(c, x - 20, y + 3, 0.7),
    ]));
  }

  const hasWaterFg =
    p.biome === "coast" || p.biome === "river" || p.biome === "dunes" ||
    (p.special === "ruin" && p.biome === "marsh");
  const drowned = p.special === "ruin" && p.biome === "marsh";
  const children: SvgNode[] = [
    ...parchmentDefs(c, p.n),
    el("rect", { x: 0, y: 0, width: W, height: H, fill: st.paper }),
    ...sky,
    ...farRidge(c, rGeo, p),
    ...(drowned ? [] : [groundLine(c, g, VX0 + 6, VX1 - 6)]),
    ...townscape(c, rGeo, p, g),
    ...foreground(c, rDecor, p, g),
    ...specialLayer(c, rDecor, p),
    ...lateDecor,
    ...(hasWaterFg ? [] : [grassFlicks(c, rDecor, g, VX0 + 14, VX1 - 14, 12)]),
    ...(p.shield ? shieldNode(c, p.n, p.shield) : []),
    ...(st.parchmentTexture
      ? [
          el("rect", { x: 0, y: 0, width: W, height: H, filter: `url(#parch-${p.n})`, opacity: 0.5 }),
          el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#vig-${p.n})` }),
        ]
      : []),
    ...caption(c, p),
    ...plateFrame(c),
  ];

  return renderSvg(
    el("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 ${W} ${H}`,
      width: W, height: H,
      role: "img", "aria-label": `An engraved prospect of ${p.name}`,
    }, children),
  );
}

// ---------------------------------------------------------------------- page
type Section = { readonly title: string; readonly blurb: string; readonly nums: ReadonlyArray<number> };
const SECTIONS: ReadonlyArray<Section> = [
  { title: "I. One town, four dresses", blurb: "The same harbour town, identical composition, once in each style. Judge whether one grammar survives four inks.", nums: [1, 2, 3, 4] },
  { title: "II. Capitals", blurb: "Walled skylines with keeps, gates and arms. Kind should read without the caption.", nums: [5, 6, 7, 8] },
  { title: "III. Towns", blurb: "Middling skylines: a spire or two, sometimes a wall.", nums: [9, 10, 11, 12] },
  { title: "IV. Villages", blurb: "A handful of gables. The special cases: a fisher strand, a fen hamlet on stilts.", nums: [13, 14, 15, 16] },
  { title: "V. Ruins", blurb: "Broken silhouettes and birds. The year parameter's other endpoint.", nums: [17, 18, 19] },
  { title: "VI. Far shores", blurb: "Palms, dunes, a weir and its mill: the grammar at its edges.", nums: [20, 21] },
];

function page(): string {
  const byN = new Map(CASES.map((p) => [p.n, p]));
  const sections = SECTIONS.map((s) => {
    const figures = s.nums.map((n) => {
      const p = byN.get(n)!;
      const meta = [p.kind, p.biome, p.special, p.style].filter(Boolean).join(" · ");
      return `<figure>\n${prospect(p)}\n<figcaption><strong>${escapeXml(p.name)}</strong><br>\n<span>plate ${p.n} · ${escapeXml(meta)}</span></figcaption>\n</figure>`;
    }).join("\n");
    return `<section>\n<h2>${escapeXml(s.title)}</h2>\n<p class="sub">${escapeXml(s.blurb)}</p>\n<div class="grid">\n${figures}\n</div>\n</section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Prospects · Sub 0 spike (#237)</title>
<style>
:root { color-scheme: light; }
${paletteRootCss()}
body {
  margin: 0; padding: 2.5rem 1.5rem 5rem;
  background: var(--parchment);
  background-image:
    radial-gradient(ellipse at 20% 10%, rgb(255 250 235 / 0.5), transparent 60%),
    radial-gradient(ellipse at 85% 90%, rgb(120 95 50 / 0.18), transparent 55%);
  color: var(--ink-dark);
  font-family: var(--font-body, 'Iowan Old Style', 'Palatino', Georgia, serif);
}
main { max-width: 1560px; margin-inline: auto; }
header { margin-bottom: 1.5rem; }
h1 { font-size: 1.7rem; margin: 0 0 0.4rem; }
h2 { font-size: 1.15rem; color: var(--ink-brown); border-bottom: 1px solid var(--line-faint); padding-bottom: 0.3rem; margin: 2.2rem 0 0.2rem; }
p.sub { color: var(--ink-faded); font-style: italic; margin: 0.2rem 0 1.1rem; }
.note { background: var(--parchment-panel); border: 1px solid var(--line-tan); padding: 0.8rem 1rem; max-width: 62rem; line-height: 1.5; }
.note ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(430px, 1fr)); gap: 1.6rem; }
figure { margin: 0; }
figure svg { width: 100%; height: auto; display: block; border: 1px solid var(--line-tan);
  box-shadow: 0 6px 18px rgb(from var(--chart-ink) r g b / 0.15); }
figcaption { text-align: center; padding-top: 0.5rem; line-height: 1.45; }
figcaption span { font-size: 0.8rem; color: var(--ink-faded); letter-spacing: 0.08em; }
footer { margin-top: 3rem; text-align: center; color: var(--ink-faded); font-size: 0.85rem; letter-spacing: 0.12em; }
</style>
</head>
<body>
<main>
<header>
<h1>The Prospects · Sub 0 spike</h1>
<p class="sub">issue #237 · a throwaway gallery to prove the silhouette-and-hatching grammar before it is built · every vignette hand-faked, no world sampled</p>
<div class="note">
<strong>The review question:</strong> do these read as engraved prospect plates from the same atelier as the charts?
The bar is <em>good enough to build</em> (Sub 3 owns per-style polish), not good enough to ship.
<ul>
<li>Does the silhouette read at arm's length: capital &gt; town &gt; village, without captions?</li>
<li>Do biomes and specials read: harbor, bridge, ruin, marsh, fields?</li>
<li>Does each of the four dresses feel native, or does one fight the grammar?</li>
</ul>
</div>
</header>
${sections}
<footer>DRAWN BY VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY</footer>
</main>
</body>
</html>
`;
}

const outPath = resolve("out/prospect-spike.html");
await mkdir(resolve("out"), { recursive: true });
await writeFile(outPath, page(), "utf8");
console.log(`wrote ${outPath} (${CASES.length} plates)`);
