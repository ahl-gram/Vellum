import { el, type SvgNode } from "../../render/svg.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import { BIOMES } from "../../climate/biomes.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonPaint } from "./context.ts";
import type { StripLayout } from "./layout.ts";
import { BAND, type StripBody } from "./cloth.ts";
import { paintedWave } from "./glyphs.ts";

const SHORE_INSET = 4;
const WAVE_LENGTH = 11.2;

type Run = readonly [number, number];
type Point = readonly [number, number];

function riverPath(x0: number, x1: number, sy: number): string {
  const span = (x1 - x0) / 4;
  let d = `M${r1(x0)} ${r1(sy)}`;
  for (let i = 0; i < 4; i++) {
    d += `q${r1(span / 2)} ${i % 2 === 0 ? -3 : 3} ${r1(span)} 0`;
  }
  return d;
}

export function riverBand(c: DressContext, strip: StripLayout, sy: number, tiltDeg: number): SvgNode {
  const x0 = strip.x0 + 4;
  const x1 = strip.x0 + strip.w - 4;
  const d = riverPath(x0, x1, sy);
  return el("g", { transform: `rotate(${r1(tiltDeg)} ${r1((x0 + x1) / 2)} ${r1(sy)})` }, [
    el("path", { d, fill: "none", stroke: c.style.river, "stroke-width": 2.1, "stroke-opacity": 0.85 }),
    el("path", {
      d,
      fill: "none",
      stroke: c.style.river,
      "stroke-width": 0.7,
      "stroke-opacity": 0.5,
      transform: "translate(0 2.6)",
    }),
  ]);
}

export function paintedRiverBand(paint: RibbonPaint, body: StripBody, sy: number, tiltDeg: number): SvgNode {
  const x0 = body.left(sy) + BAND + 1;
  const x1 = body.right(sy) - BAND - 1;
  const d = riverPath(x0, x1, sy);
  return el("g", { transform: `rotate(${r1(tiltDeg)} ${r1((x0 + x1) / 2)} ${r1(sy)})` }, [
    el("path", { d, fill: "none", stroke: paint.azuriteWash, "stroke-width": 7, "stroke-opacity": 0.75 }),
    el("path", {
      d,
      fill: "none",
      stroke: paint.azurite,
      "stroke-width": 1.4,
      "stroke-opacity": 0.9,
      transform: "translate(0 -3)",
    }),
    el("path", {
      d,
      fill: "none",
      stroke: paint.azurite,
      "stroke-width": 1.0,
      "stroke-opacity": 0.7,
      transform: "translate(0 3)",
    }),
  ]);
}

function smooth(pts: ReadonlyArray<Point>): string {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i] as Point;
    const b = pts[i + 1] as Point;
    d += `Q${r1(a[0])} ${r1(a[1])} ${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2)}`;
  }
  const last = pts[pts.length - 1] as Point;
  return `${d}L${r1(last[0])} ${r1(last[1])}`;
}

function seaRuns(strip: StripLayout, side: -1 | 1): Run[] {
  const isSea = (i: number): boolean =>
    (side < 0 ? strip.samples[i]?.biomeL : strip.samples[i]?.biomeR) === BIOMES.ocean;
  const runs: Run[] = [];
  let i = 0;
  while (i < strip.samples.length) {
    if (!isSea(i)) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < strip.samples.length && isSea(j + 1)) j++;
    if (j - i >= 1) runs.push([i, j]);
    i = j + 1;
  }
  return runs;
}

function washRun(paint: RibbonPaint, strip: StripLayout, body: StripBody, side: -1 | 1, run: Run, rng: Rng): SvgNode[] {
  const [i, j] = run;
  const clampY = (y: number): number => Math.min(strip.y0 + strip.h - 4, Math.max(strip.y0 + 4, y));
  const inner: Point[] = strip.pts.slice(Math.max(0, i - 1), Math.min(strip.pts.length, j + 2)).map((p) => {
    const y = clampY(p.sy);
    const x = p.sx + side * (26 + rng.range(0, 12));
    return [
      side > 0 ? Math.min(x, body.right(y) - BAND - SHORE_INSET) : Math.max(x, body.left(y) + BAND + SHORE_INSET),
      y,
    ];
  });
  const yBot = clampY(Math.max(...inner.map((p) => p[1])) + 12);
  const yTop = clampY(Math.min(...inner.map((p) => p[1])) - 12);
  const mid = (yBot + yTop) / 2;
  const edgeX = side < 0 ? body.left(mid) + BAND : body.right(mid) - BAND;
  const onCloth = (x: number, y: number): Point => [
    side > 0 ? Math.min(x, body.right(y)) : Math.max(x, body.left(y)),
    y,
  ];
  const edgeBot = onCloth(edgeX, yBot);
  const edgeTop = onCloth(edgeX, yTop);
  const shore: Point[] = [onCloth(edgeX - side * 6, yBot), ...inner, onCloth(edgeX - side * 6, yTop)];
  const nodes: SvgNode[] = [
    el("path", {
      d: `M${r1(edgeBot[0])} ${r1(edgeBot[1])}${smooth(shore)}L${r1(edgeTop[0])} ${r1(edgeTop[1])}Z`,
      fill: paint.azuriteWash,
      "fill-opacity": 0.55,
      stroke: paint.azurite,
      "stroke-width": 0.8,
      "stroke-opacity": 0.65,
      "stroke-linejoin": "round",
    }),
  ];
  for (let k = 0; k < Math.max(2, Math.round((yBot - yTop) / 40)); k++) {
    const p = inner[Math.floor(rng.range(0, inner.length - 0.01))] as Point;
    const wx = p[0] + side * rng.range(4, 12) - 8;
    const wy = p[1] + rng.range(-8, 8);
    const held = Math.min(Math.max(wx, body.left(wy) + BAND), body.right(wy) - BAND - WAVE_LENGTH);
    nodes.push(paintedWave(paint, held, wy, 0.7));
  }
  return nodes;
}

export function seaWash(paint: RibbonPaint, strip: StripLayout, body: StripBody, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  for (const side of [-1, 1] as const) {
    for (const run of seaRuns(strip, side)) nodes.push(...washRun(paint, strip, body, side, run, rng));
  }
  return nodes;
}
