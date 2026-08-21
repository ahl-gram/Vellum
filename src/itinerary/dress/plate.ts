import { el, type SvgNode } from "../../render/svg.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { ribbonTitle } from "../prose.ts";
import { layoutRibbon, RIBBON_H, RIBBON_MARGIN, RIBBON_W } from "./layout.ts";
import { stripNodes } from "./strip.ts";

function grain(c: DressContext, id: string, seed: number): SvgNode[] {
  const alpha = c.style.name === "antique" ? 0.05 : 0.028;
  return [
    el("filter", { id }, [
      el("feTurbulence", {
        type: "fractalNoise",
        baseFrequency: 0.82,
        numOctaves: 2,
        seed: seed % 997,
        stitchTiles: "stitch",
      }),
      el("feColorMatrix", {
        type: "matrix",
        values: `0 0 0 0 0.29 0 0 0 0 0.22 0 0 0 0 0.15 0 0 0 ${alpha} 0`,
      }),
    ]),
  ];
}

function titleBand(c: DressContext, input: RibbonInput): SvgNode[] {
  const { title, subtitle } = ribbonTitle(input);
  const cx = RIBBON_W / 2;
  const top = RIBBON_MARGIN;
  const fit = Math.min(25, ((RIBBON_W - 120) / Math.max(1, title.length)) / 0.62);
  const ruleY = top + 66;
  return [
    el("text", {
      x: cx,
      y: top + 30,
      "text-anchor": "middle",
      "font-family": c.style.fontFamilyTitle,
      "font-size": r1(fit),
      "letter-spacing": 1.4,
      fill: c.ink,
    }, [title]),
    el("text", {
      x: cx,
      y: top + 47,
      "text-anchor": "middle",
      "font-family": c.style.fontFamily,
      "font-size": 11.5,
      "font-style": "italic",
      fill: c.soft,
    }, [subtitle[0] ?? ""]),
    el("text", {
      x: cx,
      y: top + 61,
      "text-anchor": "middle",
      "font-family": c.style.fontFamily,
      "font-size": 10,
      "font-style": "italic",
      fill: c.soft,
    }, [subtitle[1] ?? ""]),
    el("path", {
      d: `M${cx - 190} ${ruleY}H${cx - 8}M${cx + 8} ${ruleY}H${cx + 190}M${cx - 6} ${ruleY}l6 -3.4l6 3.4l-6 3.4Z`,
      fill: c.ink,
      stroke: c.ink,
      "stroke-width": 0.7,
    }),
  ];
}

function plateFrame(c: DressContext): SvgNode[] {
  const m = RIBBON_MARGIN - 14;
  return [
    el("rect", { x: m, y: m, width: RIBBON_W - m * 2, height: RIBBON_H - m * 2, fill: "none", stroke: c.ink, "stroke-width": 1.7 }),
    el("rect", { x: m + 4, y: m + 4, width: RIBBON_W - (m + 4) * 2, height: RIBBON_H - (m + 4) * 2, fill: "none", stroke: c.soft, "stroke-width": 0.6 }),
  ];
}

function colophon(c: DressContext, input: RibbonInput): SvgNode {
  return el("text", {
    x: RIBBON_W / 2,
    y: RIBBON_H - RIBBON_MARGIN + 9,
    "text-anchor": "middle",
    "font-family": c.style.fontFamily,
    "font-size": 8,
    "letter-spacing": 1.6,
    fill: c.soft,
  }, [`CHART № ${input.seed} · ${input.worldName.toUpperCase()}`]);
}

export function renderRibbon(c: DressContext, input: RibbonInput, rng: Rng): SvgNode {
  const layout = layoutRibbon(input);
  const grainId = `ribbon-grain-${c.style.name}-${input.seed}-${input.fromIdx}-${input.toIdx}`;
  const strips = layout.strips.map((s, i) =>
    stripNodes(c, input, s, rng, i === layout.strips.length - 1),
  );
  return el("g", {}, [
    el("defs", {}, grain(c, grainId, input.seed)),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, fill: c.style.paper }),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, filter: `url(#${grainId})` }),
    ...plateFrame(c),
    ...titleBand(c, input),
    ...strips,
    colophon(c, input),
  ]);
}
