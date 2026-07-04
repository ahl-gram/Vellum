import { el, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";
import { settlementGlyph, ruinGlyph } from "./settlements.ts";
import { isoStroke } from "./iso.ts";

export type Icon =
  | { kind: "settlement"; tier: "capital" | "seat" | "town" | "village" }
  | { kind: "ruin" }
  | { kind: "glyph"; sym: string }
  | { kind: "river" }
  | { kind: "road"; rank: "trunk" | "lane" }
  | { kind: "realm" }
  | { kind: "hypso" }
  | { kind: "contour" }
  | { kind: "sounding" }
  | { kind: "rock" }
  | { kind: "wind" }
  | { kind: "current" }
  | { kind: "iso" }
  | { kind: "swatch"; color: string };

export function iconNode(icon: Icon, cx: number, cy: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  switch (icon.kind) {
    case "settlement":
      return settlementGlyph(icon.tier, cx, cy + (icon.tier === "capital" || icon.tier === "seat" ? 3 * k : 0), ctx);
    case "ruin":
      return ruinGlyph(cx, cy + 3 * k, ctx);
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
    case "current": {
      // a curving stroke with one downstream chevron, echoing the layer glyph
      const x1 = cx - 10 * k;
      const x2 = cx + 10 * k;
      const hl = 4 * k;
      const a = Math.PI * 0.78;
      return el("path", {
        d:
          `M${x1.toFixed(1)} ${(cy + 3 * k).toFixed(1)}Q${cx.toFixed(1)} ${(cy - 5 * k).toFixed(1)} ${x2.toFixed(1)} ${(cy + 2 * k).toFixed(1)}` +
          `M${cx.toFixed(1)} ${(cy - 1.5 * k).toFixed(1)}L${(cx - Math.cos(a) * hl).toFixed(1)} ${(cy - 1.5 * k - Math.sin(a) * hl).toFixed(1)}` +
          `M${cx.toFixed(1)} ${(cy - 1.5 * k).toFixed(1)}L${(cx - Math.cos(a) * hl).toFixed(1)} ${(cy - 1.5 * k + Math.sin(a) * hl).toFixed(1)}`,
        fill: "none", stroke: style.inkSoft, "stroke-width": (1.0 * k).toFixed(1),
        "stroke-opacity": 0.6, "stroke-linecap": "round",
      });
    }
    case "iso": {
      // a short contour squiggle in the plate's own iso stroke: bold grey-brown
      // for the rainfall isohyets, the faint style stroke for the isotherms
      const s = isoStroke(ctx.theme ?? "", style);
      return el("path", {
        d: `M${(cx - 10 * k).toFixed(1)} ${(cy + 2 * k).toFixed(1)}Q${(cx - 3 * k).toFixed(1)} ${(cy - 4 * k).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}Q${(cx + 4 * k).toFixed(1)} ${(cy + 3 * k).toFixed(1)} ${(cx + 10 * k).toFixed(1)} ${(cy - 2 * k).toFixed(1)}`,
        fill: "none", stroke: s.color, "stroke-width": (s.width * k).toFixed(2),
        "stroke-opacity": s.opacity, "stroke-linecap": "round",
      });
    }
    case "swatch":
      return el("rect", {
        x: cx - 9 * k, y: cy - 6 * k, width: 18 * k, height: 12 * k, rx: 1.5 * k,
        fill: icon.color,
        stroke: style.inkSoft, "stroke-width": 0.6 * k, "stroke-opacity": 0.5,
      });
  }
}
