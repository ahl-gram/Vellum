import { el, type SvgNode } from "../../render/svg.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { ribbonTitle, stagesLine } from "../prose.ts";
import { layoutRibbon, RIBBON_H, RIBBON_MARGIN, RIBBON_W } from "./layout.ts";
import { stripNodes } from "./strip.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";

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

function subtitleLines(c: DressContext, subtitle: readonly string[], cx: number, top: number): SvgNode[] {
  return [
    el(
      "text",
      {
        x: cx,
        y: top + 47,
        "text-anchor": "middle",
        "font-family": c.style.fontFamily,
        "font-size": 11.5,
        "font-style": "italic",
        fill: c.soft,
      },
      [subtitle[0] ?? ""],
    ),
    el(
      "text",
      {
        x: cx,
        y: top + 61,
        "text-anchor": "middle",
        "font-family": c.style.fontFamily,
        "font-size": 10,
        "font-style": "italic",
        fill: c.soft,
      },
      [subtitle[1] ?? ""],
    ),
  ];
}

function titleBand(c: DressContext, input: RibbonInput): SvgNode[] {
  const { title, subtitle } = ribbonTitle(input);
  const cx = RIBBON_W / 2;
  const top = RIBBON_MARGIN;
  const fit = Math.min(25, (RIBBON_W - 120) / Math.max(1, title.length) / 0.62);
  const ruleY = top + 66;
  return [
    el(
      "text",
      {
        x: cx,
        y: top + 30,
        "text-anchor": "middle",
        "font-family": c.style.fontFamilyTitle,
        "font-size": r1(fit),
        "letter-spacing": 1.4,
        fill: c.ink,
      },
      [title],
    ),
    ...subtitleLines(c, subtitle, cx, top),
    el("path", {
      d: `M${cx - 190} ${ruleY}H${cx - 8}M${cx + 8} ${ruleY}H${cx + 190}M${cx - 6} ${ruleY}l6 -3.4l6 3.4l-6 3.4Z`,
      fill: c.ink,
      stroke: c.ink,
      "stroke-width": 0.7,
    }),
  ];
}

function bannerCloth(c: RibbonContext, paint: RibbonPaint): SvgNode[] {
  const cx = RIBBON_W / 2;
  const yc = RIBBON_MARGIN + 24;
  const hh = 15;
  const x0 = cx - 330;
  const x1 = cx + 330;
  const d = `M${x0 + 16} ${yc - hh}H${x1 - 16}L${x1} ${yc - hh}L${x1 - 9} ${yc}L${x1} ${yc + hh}L${x1 - 16} ${yc + hh}H${x0 + 16}L${x0} ${yc + hh}L${x0 + 9} ${yc}L${x0} ${yc - hh}Z`;
  return [
    el("path", { d, fill: paint.sepia, "fill-opacity": 0.25, transform: "translate(2 3)" }),
    el("path", { d, fill: paint.gamboge, stroke: c.ink, "stroke-width": 1, "stroke-linejoin": "round" }),
    el("rect", { x: x0 + 16, y: yc - hh, width: 9, height: hh * 2, fill: paint.sepia, "fill-opacity": 0.35 }),
    el("rect", { x: x1 - 25, y: yc - hh, width: 9, height: hh * 2, fill: paint.sepia, "fill-opacity": 0.35 }),
  ];
}

function bannerLettering(c: RibbonContext, input: RibbonInput): SvgNode[] {
  const { title, subtitle } = ribbonTitle(input);
  const cx = RIBBON_W / 2;
  const top = RIBBON_MARGIN;
  const line = (y: number, size: number, text: string, fill: string, extra: Record<string, string | number>): SvgNode =>
    el(
      "text",
      { x: cx, y, "text-anchor": "middle", "font-family": c.style.fontFamily, "font-size": size, ...extra, fill },
      [text],
    );
  return [
    el(
      "text",
      {
        x: cx,
        y: top + 30.5,
        "text-anchor": "middle",
        "font-family": c.style.fontFamilyTitle,
        "font-size": r1(Math.min(20, 580 / Math.max(1, title.length) / 0.62)),
        "letter-spacing": 1.2,
        fill: c.ink,
      },
      [title],
    ),
    line(top + 58, 11, subtitle[0] ?? "", c.soft, { "font-style": "italic" }),
    line(top + 71, 9.5, subtitle[1] ?? "", c.soft, { "font-style": "italic" }),
    line(top + 85, 8.6, stagesLine(input), c.ink, { "font-style": "italic", "fill-opacity": 0.8 }),
  ];
}

function bannerTitle(c: RibbonContext, paint: RibbonPaint, input: RibbonInput): SvgNode[] {
  return [...bannerCloth(c, paint), ...bannerLettering(c, input)];
}

function plateFrame(c: DressContext): SvgNode[] {
  const m = RIBBON_MARGIN - 14;
  return [
    el("rect", {
      x: m,
      y: m,
      width: RIBBON_W - m * 2,
      height: RIBBON_H - m * 2,
      fill: "none",
      stroke: c.ink,
      "stroke-width": 1.7,
    }),
    el("rect", {
      x: m + 4,
      y: m + 4,
      width: RIBBON_W - (m + 4) * 2,
      height: RIBBON_H - (m + 4) * 2,
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.6,
    }),
  ];
}

function colophon(c: DressContext, input: RibbonInput): SvgNode {
  return el(
    "text",
    {
      x: RIBBON_W / 2,
      y: RIBBON_H - RIBBON_MARGIN + 9,
      "text-anchor": "middle",
      "font-family": c.style.fontFamily,
      "font-size": 8,
      "letter-spacing": 1.6,
      fill: c.soft,
    },
    [`CHART № ${input.seed} · ${input.worldName.toUpperCase()}`],
  );
}

export function renderRibbon(c: RibbonContext, input: RibbonInput, rng: Rng): SvgNode {
  const layout = layoutRibbon(input);
  const grainId = `ribbon-grain-${c.style.name}-${input.seed}-${input.fromIdx}-${input.toIdx}`;
  const drawn = layout.strips.map((s, i) => stripNodes(c, input, s, rng, i === layout.strips.length - 1));
  return el("g", {}, [
    el("defs", {}, grain(c, grainId, input.seed)),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, fill: c.style.paper }),
    el("rect", { x: 0, y: 0, width: RIBBON_W, height: RIBBON_H, filter: `url(#${grainId})` }),
    ...plateFrame(c),
    ...(c.paint ? bannerTitle(c, c.paint, input) : titleBand(c, input)),
    ...drawn.map((d) => d.art),
    el(
      "g",
      {},
      drawn.flatMap((d) => [...d.captions]),
    ),
    colophon(c, input),
  ]);
}
