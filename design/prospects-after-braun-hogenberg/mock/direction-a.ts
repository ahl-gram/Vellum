// The engraved vignette over the engine's own geometry, with the town band shiftable (dy) and the water deepenable (waterBottom) so directions B, D and E can recompose it. Direction A is this vignette unshifted under today's furniture.
import { el, renderSvg, type SvgNode } from "../../../src/render/svg.ts";
import { createRng, type Rng } from "../../../src/core/rng.ts";
import { BACK_ROW_RAISE, PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../../../src/prospect/geometry.ts";
import { plateFurniture } from "../../../src/prospect/dress/furniture.ts";
import { dressContext } from "../../../src/prospect/dress/context.ts";
import type { Dress } from "./dress.ts";
import type { Scene } from "./data.ts";
import { birdFlock, groundSweep, hillTone, poly, r1, skyLines, stroke, treeClump, yOnPolyline, type Pt } from "./burin.ts";
import { foregroundEngraved, massIsChurch, massNodesEngraved, wallNodesEngraved, waterEngraved } from "./townscape.ts";

export function parchmentDefs(d: Dress, suffix: string, grainSeed: number): SvgNode[] {
  if (!d.style.parchmentTexture) return [];
  const ch = (i: number): string => (parseInt(d.ink.slice(i, i + 2), 16) / 255).toFixed(2);
  return [
    el("filter", { id: `parch-${suffix}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.014", numOctaves: 3, seed: grainSeed, stitchTiles: "stitch" }),
      el("feColorMatrix", { values: `0 0 0 0 ${ch(1)}  0 0 0 0 ${ch(3)}  0 0 0 0 ${ch(5)}  0.45 0 0 0 0` }),
    ]),
    el("radialGradient", { id: `vig-${suffix}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": d.ink, "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": d.ink, "stop-opacity": 0.16 }),
    ]),
  ];
}

export function parchmentOverlay(d: Dress, suffix: string): SvgNode[] {
  if (!d.style.parchmentTexture) return [];
  return [
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, filter: `url(#parch-${suffix})`, opacity: 0.5 }),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: `url(#vig-${suffix})` }),
  ];
}

export function cloudsFor(rng: Rng, horizon: number, top: number, avoid: ReadonlyArray<{ x0: number; x1: number }> = []): Array<{ x: number; y: number; w: number; h: number }> {
  const n = 2 + Math.floor(rng.next() * 2);
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const c = { x: VIEW_X0 + 60 + rng.next() * (VIEW_X1 - VIEW_X0 - 120), y: top + 14 + rng.next() * Math.max(10, (horizon - top) * 0.5), w: 70 + rng.next() * 90, h: 7 + rng.next() * 6 };
    if (avoid.some((a) => c.x + c.w / 2 > a.x0 && c.x - c.w / 2 < a.x1)) continue;
    out.push(c);
  }
  return out;
}

export function ridgeEngraved(d: Dress, ridge: ReadonlyArray<Pt>, horizon: number, rng: Rng): SvgNode[] {
  const out: SvgNode[] = hillTone(d, [...ridge], horizon, true, rng);
  for (let i = 0; i < 26; i++) {
    const x = VIEW_X0 + 10 + rng.next() * (VIEW_X1 - VIEW_X0 - 20);
    const yTop = yOnPolyline(ridge, x);
    const h = horizon - yTop;
    if (h < 6) continue;
    const t = rng.next();
    out.push(...treeClump(d, x, horizon - h * t * t, 0.9 + (1 - t) * 1.4, rng));
  }
  return out;
}

export type VignetteOptions = {
  readonly dy: number;
  readonly waterBottom: number | null;
  readonly skyTop: number;
  readonly avoidClouds?: ReadonlyArray<{ x0: number; x1: number }>;
  readonly nearBandBottom?: number;
};

export type Vignette = { readonly nodes: SvgNode[]; readonly horizon: number; readonly horizonYAt: (x: number) => number };

export function vignetteTown(d: Dress, scene: Scene, rng: Rng, o: VignetteOptions): Vignette {
  const g = scene.geometry;
  const horizon = g.ground.base + 2 + o.dy;
  const clouds = cloudsFor(rng, horizon, o.skyTop, o.avoidClouds ?? []);
  const hullGaps: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];
  const split = (() => { const i = g.masses.findIndex((m) => m.raise < BACK_ROW_RAISE); return i === -1 ? g.masses.length : i; })();
  const foreground = g.foreground.flatMap((e) => foregroundEngraved(d, e, rng, hullGaps));
  const line = g.ground.line;
  const groundNodes: SvgNode[] = [];
  if (g.ground.rise > 0) {
    const outline = [{ x: line[0]!.x, y: g.ground.base + 3 }, ...line, { x: line[line.length - 1]!.x, y: g.ground.base + 3 }];
    groundNodes.push(el("path", { d: poly(outline), fill: d.coloured ? d.wash.grass : d.paper, ...stroke(d, 1.1) }));
    groundNodes.push(...groundSweep(d, outline, 0.35, 2.6, rng, 20));
  } else {
    groundNodes.push(el("path", { d: poly(line, false), fill: "none", ...stroke(d, 1.1) }));
  }
  const nearBottom = (o.nearBandBottom ?? g.ground.base + 44 + o.dy) - o.dy;
  const nearBand = g.water === null ? [{ x: VIEW_X0, y: g.ground.base }, { x: VIEW_X1, y: g.ground.base }, { x: VIEW_X1, y: nearBottom }, { x: VIEW_X0, y: nearBottom }] : null;
  const town: SvgNode[] = [
    ...(g.ridge ? ridgeEngraved(d, g.ridge, g.ground.base + 2, rng) : []),
    ...(nearBand && d.coloured ? [el("path", { d: poly(nearBand), fill: d.wash.grass })] : []),
    ...groundNodes,
    ...g.masses.slice(0, split).flatMap((m) => massNodesEngraved(d, m, 0.8, massIsChurch(m, g))),
    ...g.walls.flatMap((w) => wallNodesEngraved(d, g.ground, w)),
    ...g.masses.slice(split).flatMap((m) => massNodesEngraved(d, m, m.form === "keep" ? 1.2 : 1.0, massIsChurch(m, g))),
  ];
  const water: SvgNode[] = [];
  if (g.water) {
    const bottom = o.waterBottom ?? g.water.y1 + o.dy;
    water.push(...waterEngraved(d, VIEW_X0, VIEW_X1, g.water.y0 + o.dy, bottom, hullGaps.map((h) => ({ ...h, y0: h.y0 + o.dy, y1: h.y1 + o.dy })), rng));
    if (g.water.kind === "river" && o.waterBottom === null) water.push(el("path", { d: `M${VIEW_X0} ${r1(g.water.y1 + o.dy)}H${VIEW_X1}`, fill: "none", ...stroke(d, 1.0) }));
  }
  const nodes: SvgNode[] = [
    ...skyLines(d, VIEW_X0 + 4, VIEW_X1 - 4, o.skyTop, horizon - 1, clouds, rng),
    birdFlock(d, VIEW_X0 + 60 + rng.next() * 200, o.skyTop + 30 + rng.next() * 30, 5, rng),
    el("g", { transform: `translate(0 ${r1(o.dy)})` }, town),
    ...water,
    el("g", { transform: `translate(0 ${r1(o.dy)})` }, [
      ...(nearBand ? groundSweep(d, nearBand, 0.08, 3.2, rng, 36) : []),
      ...foreground,
    ]),
  ];
  const horizonYAt = (x: number): number => (g.ridge ? yOnPolyline(g.ridge, x) + o.dy : horizon);
  return { nodes, horizon, horizonYAt };
}

export function plateA(d: Dress, scene: Scene): string {
  const g = scene.geometry;
  const suffix = `a-${d.key}-${g.seed}-${g.index}`;
  const rng = createRng(g.seed).fork(`mock:${g.index}:a`);
  const c = dressContext(d.style);
  const hangs = scene.input.kind === "capital" || scene.input.kind === "seat";
  const arms = hangs && scene.era !== "before-founding" ? scene.input.arms : null;
  const { engraved, furniture } = plateFurniture(c, scene.caption, scene.era, scene.key, arms, suffix);
  const v = vignetteTown(d, scene, rng, { dy: 0, waterBottom: null, skyTop: Math.max(40, g.ground.base - 148) });
  const children: SvgNode[] = [
    ...parchmentDefs(d, suffix, (g.seed * 31 + g.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...v.nodes,
    ...engraved,
    ...parchmentOverlay(d, suffix),
    ...furniture,
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `Direction A, ${scene.input.name}` }, children));
}
