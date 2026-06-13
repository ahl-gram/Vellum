import { BIOMES } from "../../climate/biomes.ts";
import { el, type SvgNode } from "../svg.ts";
import { boxesOverlap, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import { settlementGlyph } from "./settlements.ts";

/**
 * A compact, style-aware "key" panel. It lists only the symbols a given map
 * actually carries and reuses the real glyph definitions so the key matches
 * the chart exactly. Opt-in (RenderOptions.legend); planned as furniture so
 * it sits clear of the cartouche, compass, and scale bar.
 */

type Icon =
  | { kind: "settlement"; tier: "capital" | "town" | "village" }
  | { kind: "glyph"; sym: string }
  | { kind: "river" }
  | { kind: "road"; rank: "trunk" | "lane" }
  | { kind: "realm" }
  | { kind: "hypso" }
  | { kind: "contour" }
  | { kind: "sounding" }
  | { kind: "rock" }
  | { kind: "wind" };

type Row = { icon: Icon; label: string };

export type LegendPlan = {
  readonly box: Box;
  readonly rows: ReadonlyArray<Row>;
  readonly note: string;
};

function metrics(k: number) {
  return {
    pad: 11 * k,
    titleFs: 9.5 * k,
    titleGap: 13 * k,
    rowH: 19 * k,
    iconCol: 24 * k,
    labelFs: 10.5 * k,
    noteFs: 8.5 * k,
    noteGap: 11 * k,
  };
}

const FOREST: ReadonlyArray<{ biomes: number[]; sym: string }> = [
  { biomes: [BIOMES.temperateForest, BIOMES.rainforest], sym: "gl-tree-round" },
  { biomes: [BIOMES.taiga], sym: "gl-tree-pine" },
  { biomes: [BIOMES.tropicalForest, BIOMES.jungle], sym: "gl-tree-palm" },
];

/** The most common forest type's tree symbol, or null if no forests. */
function dominantTree(ctx: RenderCtx): string | null {
  const counts = FOREST.map(() => 0);
  for (const b of ctx.world.biomes) {
    FOREST.forEach((f, i) => {
      if (f.biomes.includes(b as number)) counts[i] = (counts[i] as number) + 1;
    });
  }
  let best = -1;
  let bestN = 0;
  counts.forEach((n, i) => {
    if (n > bestN) {
      bestN = n;
      best = i;
    }
  });
  return best >= 0 ? (FOREST[best] as { sym: string }).sym : null;
}

function buildRows(ctx: RenderCtx): { rows: Row[]; note: string } {
  const { style, world } = ctx;
  const rows: Row[] = [];
  const tiers = new Set(world.settlements.map((s) => s.kind));
  if (tiers.has("capital")) rows.push({ icon: { kind: "settlement", tier: "capital" }, label: "Capital" });
  if (tiers.has("town")) rows.push({ icon: { kind: "settlement", tier: "town" }, label: "Town" });
  if (tiers.has("village")) rows.push({ icon: { kind: "settlement", tier: "village" }, label: "Village" });

  if (style.name === "nautical") {
    rows.push({ icon: { kind: "sounding" }, label: "Depth, fathoms" });
    rows.push({ icon: { kind: "rock" }, label: "Rock awash" });
    if (style.winds) rows.push({ icon: { kind: "wind" }, label: "Prevailing wind" });
  } else if (style.glyphs) {
    rows.push({ icon: { kind: "glyph", sym: "gl-mtn-1" }, label: "Mountains" });
    const tree = dominantTree(ctx);
    if (tree) rows.push({ icon: { kind: "glyph", sym: tree }, label: "Forest" });
  } else if (style.hypsometric) {
    rows.push({ icon: { kind: "hypso" }, label: "Low to high ground" });
    if (style.contourStroke) rows.push({ icon: { kind: "contour" }, label: "Contour line" });
  }

  if (world.rivers.length > 0) rows.push({ icon: { kind: "river" }, label: "River" });
  const roadRanks = new Set(world.roads.map((r) => r.rank));
  if (roadRanks.has("trunk")) rows.push({ icon: { kind: "road", rank: "trunk" }, label: "Road" });
  if (roadRanks.has("lane")) rows.push({ icon: { kind: "road", rank: "lane" }, label: "Track" });
  if (style.politicalTints && world.realms.seats.length > 1) {
    rows.push({ icon: { kind: "realm" }, label: "Realm & border" });
  }

  const note = style.name === "nautical"
    ? "italic = water · numbers = fathoms"
    : "italic = water · SPACED CAPS = realm";
  return { rows, note };
}

export function planLegend(ctx: RenderCtx, reserved: ReadonlyArray<Box>): LegendPlan | null {
  const { proj } = ctx;
  const k = proj.widthPx / 1500;
  const { rows, note } = buildRows(ctx);
  if (rows.length === 0) return null;
  const m = metrics(k);

  const textW = (s: string, fs: number): number => s.length * fs * 0.55;
  const maxRowText = Math.max(...rows.map((r) => textW(r.label, m.labelFs)));
  const contentW = Math.max(m.iconCol + maxRowText, textW(note, m.noteFs));
  const bw = m.pad * 2 + contentW;
  const bh = m.pad * 2 + m.titleFs + m.titleGap + rows.length * m.rowH + m.noteGap + m.noteFs;

  // try each corner, prefer the first that clears all reserved furniture
  const inset = 16 * k;
  const mg = proj.margin;
  const right = proj.widthPx - mg - inset - bw;
  const bottom = proj.heightPx - mg - inset - bh;
  const top = mg + inset;
  const left = mg + inset;
  const corners: Array<{ x: number; y: number }> = [
    { x: right, y: bottom },
    { x: right, y: top },
    { x: left, y: top },
    { x: left, y: bottom },
  ];

  let best = corners[0] as { x: number; y: number };
  let bestHits = Infinity;
  for (const c of corners) {
    const box: Box = { x: c.x, y: c.y, w: bw, h: bh };
    const hits = reserved.filter((r) => boxesOverlap(box, r, 6 * k)).length;
    if (hits < bestHits) {
      bestHits = hits;
      best = c;
    }
    if (hits === 0) break;
  }

  return { box: { x: best.x, y: best.y, w: bw, h: bh }, rows, note };
}

function iconNode(icon: Icon, cx: number, cy: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  switch (icon.kind) {
    case "settlement":
      return settlementGlyph(icon.tier, cx, cy + (icon.tier === "capital" ? 3 * k : 0), ctx);
    case "glyph":
      return el("use", {
        href: `#${icon.sym}`,
        transform: `translate(${cx.toFixed(1)} ${(cy + 6 * k).toFixed(1)}) scale(${(1.15 * k).toFixed(2)})`,
      });
    case "river":
      return el("path", {
        d: `M${(cx - 9 * k).toFixed(1)} ${cy.toFixed(1)}Q${cx.toFixed(1)} ${(cy - 3 * k).toFixed(1)} ${(cx + 9 * k).toFixed(1)} ${cy.toFixed(1)}`,
        fill: "none", stroke: style.river, "stroke-width": (2.3 * k).toFixed(1),
        "stroke-linecap": "round",
      });
    case "road": {
      const trunk = icon.rank === "trunk";
      const x1 = cx - 10 * k;
      const x2 = cx + 10 * k;
      const d = `M${x1.toFixed(1)} ${cy.toFixed(1)}H${x2.toFixed(1)}`;
      if (style.name === "topographic") {
        return el("g", {}, [
          el("path", {
            d, fill: "none", stroke: style.paper,
            "stroke-width": ((trunk ? 3.2 : 2.2) * k).toFixed(1),
            "stroke-linecap": "round",
          }),
          el("path", {
            d, fill: "none", stroke: style.road,
            "stroke-width": ((trunk ? 1.7 : 1.0) * k).toFixed(1),
          }),
        ]);
      }
      return el("path", {
        d, fill: "none", stroke: style.road,
        "stroke-width": ((trunk ? 1.5 : 1.0) * k).toFixed(1),
        "stroke-dasharray": trunk
          ? `${(5 * k).toFixed(1)} ${(3.5 * k).toFixed(1)}`
          : `${(2.5 * k).toFixed(1)} ${(3.5 * k).toFixed(1)}`,
        "stroke-opacity": trunk ? 0.85 : 0.7,
      });
    }
    case "realm":
      return el("rect", {
        x: cx - 9 * k, y: cy - 6 * k, width: 18 * k, height: 12 * k, rx: 2 * k,
        fill: style.realmTints[0] as string, "fill-opacity": 0.5,
        stroke: style.name === "topographic" ? style.ink : style.road,
        "stroke-width": 1.1 * k,
        "stroke-dasharray": `${(1.4 * k).toFixed(1)} ${(2.6 * k).toFixed(1)}`,
      });
    case "hypso": {
      const stops = style.hypsometric ?? [];
      const n = stops.length;
      const segW = (20 * k) / Math.max(1, n);
      return el("g", {},
        stops.map((s, i) =>
          el("rect", {
            x: cx - 10 * k + i * segW, y: cy - 4 * k, width: segW + 0.5, height: 8 * k,
            fill: s.color,
          }),
        ),
      );
    }
    case "contour":
      return el("path", {
        d: `M${(cx - 10 * k).toFixed(1)} ${(cy + 2 * k).toFixed(1)}Q${(cx - 3 * k).toFixed(1)} ${(cy - 4 * k).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}Q${(cx + 4 * k).toFixed(1)} ${(cy + 3 * k).toFixed(1)} ${(cx + 10 * k).toFixed(1)} ${(cy - 2 * k).toFixed(1)}`,
        fill: "none", stroke: style.contourStroke ?? style.inkSoft,
        "stroke-width": (0.9 * k).toFixed(1),
      });
    case "sounding":
      return el("text", {
        x: cx, y: cy + 3 * k, "text-anchor": "middle",
        "font-family": style.fontFamily, "font-size": (10 * k).toFixed(1),
        "font-style": "italic", fill: style.ink, "fill-opacity": 0.7,
      }, ["5"]);
    case "rock": {
      const s = 3.2 * k;
      return el("g", {}, [
        el("path", {
          d: `M${(cx - s).toFixed(1)} ${cy.toFixed(1)}H${(cx + s).toFixed(1)}M${cx.toFixed(1)} ${(cy - s).toFixed(1)}V${(cy + s).toFixed(1)}`,
          stroke: style.ink, "stroke-width": (0.9 * k).toFixed(1), "stroke-opacity": 0.7,
        }),
        el("circle", { cx, cy, r: 0.9 * k, fill: style.ink, "fill-opacity": 0.7 }),
      ]);
    }
    case "wind": {
      const x1 = cx - 10 * k;
      const x2 = cx + 10 * k;
      const hl = 5 * k;
      return el("path", {
        d: `M${x1.toFixed(1)} ${cy.toFixed(1)}L${x2.toFixed(1)} ${cy.toFixed(1)}` +
          `M${x2.toFixed(1)} ${cy.toFixed(1)}L${(x2 - hl).toFixed(1)} ${(cy - hl).toFixed(1)}` +
          `M${x2.toFixed(1)} ${cy.toFixed(1)}L${(x2 - hl).toFixed(1)} ${(cy + hl).toFixed(1)}` +
          `M${x1.toFixed(1)} ${cy.toFixed(1)}L${(x1).toFixed(1)} ${(cy - 4 * k).toFixed(1)}`,
        fill: "none", stroke: style.inkSoft, "stroke-width": (1.1 * k).toFixed(1),
        "stroke-opacity": 0.7, "stroke-linecap": "round",
      });
    }
  }
}

export function legendLayer(ctx: RenderCtx, plan: LegendPlan): SvgNode {
  const { style, proj } = ctx;
  const k = proj.widthPx / 1500;
  const m = metrics(k);
  const { box, rows, note } = plan;

  const children: SvgNode[] = [
    el("rect", {
      x: box.x, y: box.y, width: box.w, height: box.h, rx: 3 * k,
      fill: style.paper, "fill-opacity": 0.82,
      stroke: style.inkSoft, "stroke-width": 0.8 * k, "stroke-opacity": 0.6,
    }),
    el("text", {
      x: box.x + m.pad, y: box.y + m.pad + m.titleFs, "text-anchor": "start",
      "font-family": style.fontFamily, "font-size": m.titleFs.toFixed(1),
      "letter-spacing": (2 * k).toFixed(1), fill: style.inkSoft,
    }, ["KEY"]),
  ];

  const rowTop = box.y + m.pad + m.titleFs + m.titleGap;
  const iconCx = box.x + m.pad + m.iconCol / 2;
  const textX = box.x + m.pad + m.iconCol;
  rows.forEach((row, i) => {
    const cy = rowTop + i * m.rowH + m.rowH / 2;
    children.push(iconNode(row.icon, iconCx, cy, ctx));
    children.push(
      el("text", {
        x: textX, y: cy + m.labelFs * 0.34, "text-anchor": "start",
        "font-family": style.fontFamily, "font-size": m.labelFs.toFixed(1),
        fill: style.labelColor,
      }, [row.label]),
    );
  });

  children.push(
    el("text", {
      x: box.x + m.pad, y: rowTop + rows.length * m.rowH + m.noteGap + m.noteFs * 0.3,
      "text-anchor": "start",
      "font-family": style.fontFamily, "font-size": m.noteFs.toFixed(1),
      "font-style": "italic", fill: style.inkSoft,
    }, [note]),
  );

  return el("g", { id: "layer-legend" }, children);
}
