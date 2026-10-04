// Directions B and E: the prospect from the rise. The horizon climbs to the upper third, the town sits across the bay or the plain, and the near ground is a hill with the place's people on it. B keeps today's caption; E (the recommended composite) wears direction D's furniture and takes the whole plate. D is today's side-on composition under that furniture.
import { el, renderSvg, type SvgNode } from "../../../src/render/svg.ts";
import { createRng, type Rng } from "../../../src/core/rng.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../../../src/prospect/geometry.ts";
import { plateFurniture } from "../../../src/prospect/dress/furniture.ts";
import { dressContext } from "../../../src/prospect/dress/context.ts";
import type { Dress } from "./dress.ts";
import type { Scene } from "./data.ts";
import { groundSweep, poly, r1, stroke, treeClump, yOnPolyline, type Pt } from "./burin.ts";
import { parchmentDefs, parchmentOverlay, vignetteTown } from "./direction-a.ts";
import { castFor, figureNodes, type Figure, type FigureKind } from "./staffage.ts";
import { shipEngraved } from "./townscape.ts";
import { banderole, cardinalWords, chartRoundel, footerLine, frameNodes, horizonTowns, keyLines, keyPanel, keyTags, titleCartouche, wreathedArms } from "./furniture.ts";

export type RiseLayout = {
  readonly dy: number;
  readonly waterBottom: number;
  readonly riseTop: ReadonlyArray<Pt>;
  readonly riseBottom: number;
  readonly figureH: number;
  readonly figureSpan: readonly [number, number];
  readonly skyTop: number;
};

export const LAYOUT_B: RiseLayout = {
  dy: -84, waterBottom: 240,
  riseTop: [{ x: VIEW_X0, y: 228 }, { x: VIEW_X0 + 90, y: 212 }, { x: VIEW_X0 + 170, y: 203 }, { x: VIEW_X0 + 260, y: 210 }, { x: VIEW_X1 - 120, y: 219 }, { x: VIEW_X1, y: 234 }],
  riseBottom: 285, figureH: 36, figureSpan: [VIEW_X0 + 70, VIEW_X0 + 250], skyTop: 36,
};

export const LAYOUT_E: RiseLayout = {
  dy: -70, waterBottom: 268,
  riseTop: [{ x: VIEW_X0, y: 250 }, { x: VIEW_X0 + 80, y: 232 }, { x: VIEW_X0 + 170, y: 218 }, { x: VIEW_X0 + 270, y: 226 }, { x: VIEW_X1 - 120, y: 238 }, { x: VIEW_X1, y: 258 }],
  riseBottom: 358, figureH: 50, figureSpan: [VIEW_X0 + 50, VIEW_X0 + 270], skyTop: 92,
};

const FIGURE_WIDTH: Record<FigureKind, number> = {
  gentleman: 22, lady: 22, traveller: 24, fisher: 22, waterbearer: 16, shepherd: 22, rider: 34, dog: 16, sheep: 12, porter: 20, surveyor: 24,
};

function placeFigures(scene: Scene, L: RiseLayout, rng: Rng): Figure[] {
  const cast = castFor(scene, rng);
  const [x0, x1] = L.figureSpan;
  const total = cast.reduce((s, k) => s + FIGURE_WIDTH[k] * (L.figureH / 30), 0) + (cast.length - 1) * 6;
  let x = (x0 + x1) / 2 - total / 2;
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  return cast.map((kind) => {
    const w = FIGURE_WIDTH[kind] * (L.figureH / 30);
    const fx = x + w / 2 + (rng.next() - 0.5) * 4;
    x += w + 6;
    const h = (kind === "dog" || kind === "sheep") ? L.figureH * 0.45 : L.figureH * (0.94 + rng.next() * 0.12);
    const y = yOnPolyline(L.riseTop, fx) + 8 + rng.next() * 8;
    return { kind, x: fx, y, h, flip: fx > cx };
  });
}

function riseNodes(d: Dress, scene: Scene, L: RiseLayout, rng: Rng): SvgNode[] {
  const outline = [...L.riseTop, { x: VIEW_X1, y: L.riseBottom }, { x: VIEW_X0, y: L.riseBottom }];
  const out: SvgNode[] = [
    el("path", { d: poly(outline), fill: d.coloured ? d.wash.grassDeep : d.paper, ...stroke(d, 1.1) }),
    ...groundSweep(d, outline, -0.12, 3.0, rng, 70),
  ];
  const path: string[] = [];
  const px0 = (VIEW_X0 + VIEW_X1) / 2 + 40;
  path.push(`M${r1(px0)} ${r1(yOnPolyline(L.riseTop, px0) + 1)}q${r1(30)} ${r1((L.riseBottom - yOnPolyline(L.riseTop, px0)) * 0.5)} ${r1(90)} ${r1(L.riseBottom - yOnPolyline(L.riseTop, px0) - 1)}`);
  path.push(`M${r1(px0 + 5)} ${r1(yOnPolyline(L.riseTop, px0) + 1)}q${r1(30)} ${r1((L.riseBottom - yOnPolyline(L.riseTop, px0)) * 0.5)} ${r1(90)} ${r1(L.riseBottom - yOnPolyline(L.riseTop, px0) - 1)}`);
  out.push(el("path", { d: path.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.45, "stroke-dasharray": "1.4 1.6", "stroke-opacity": 0.8 }));
  const lower = [{ x: VIEW_X0, y: L.riseBottom - (L.riseBottom - L.riseTop[0]!.y) * 0.45 }, { x: VIEW_X1, y: L.riseBottom - (L.riseBottom - L.riseTop[L.riseTop.length - 1]!.y) * 0.45 }, { x: VIEW_X1, y: L.riseBottom }, { x: VIEW_X0, y: L.riseBottom }];
  out.push(...groundSweep(d, lower, 0.3, 4.2, rng, 10));
  for (let i = 0; i < 4; i++) {
    const bx = VIEW_X1 - 30 - rng.next() * 150;
    const by = yOnPolyline(L.riseTop, bx) + 8 + rng.next() * 26;
    out.push(...treeClump(d, bx, by, 2.4 + rng.next() * 2.6, rng));
  }
  out.push(...treeClump(d, VIEW_X0 + 26, yOnPolyline(L.riseTop, VIEW_X0 + 26) + 34, 7, rng));
  const fence: string[] = [];
  const fx0 = px0 + 14, fy0 = yOnPolyline(L.riseTop, px0) + 4;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const fx = fx0 + 60 * t * t + 10 * t, fy = fy0 + (L.riseBottom - fy0) * 0.62 * t;
    fence.push(`M${r1(fx)} ${r1(fy)}v${r1(-5 - 4 * t)}`);
    if (i > 0) fence.push(`M${r1(fx - 1)} ${r1(fy - 3 - 3 * t)}L${r1(fx0 + 60 * ((i - 1) / 6) * ((i - 1) / 6) + 10 * ((i - 1) / 6))} ${r1(fy0 + (L.riseBottom - fy0) * 0.62 * ((i - 1) / 6) - 3 - 3 * ((i - 1) / 6))}`);
  }
  out.push(el("path", { d: fence.join(""), fill: "none", ...stroke(d, 0.7) }));
  const rocks: string[] = [];
  for (let i = 0; i < 5; i++) {
    const rx = VIEW_X0 + 8 + rng.next() * 60, ry = L.riseBottom - 6 - rng.next() * 24;
    const rs = 3 + rng.next() * 5;
    rocks.push(`M${r1(rx)} ${r1(ry)}l${r1(rs * 0.4)} ${r1(-rs * 0.7)}l${r1(rs * 0.8)} ${r1(-rs * 0.1)}l${r1(rs * 0.5)} ${r1(rs * 0.8)}Z`);
  }
  out.push(el("path", { d: rocks.join(""), fill: d.paper, ...stroke(d, 0.7) }));
  const figures = placeFigures(scene, L, rng).sort((a, b) => a.y - b.y);
  for (const f of figures) out.push(figureNodes(d, f, scene.input.arms));
  return out;
}

function nearShip(d: Dress, scene: Scene, L: RiseLayout, rng: Rng): SvgNode[] {
  if (!scene.geometry.water || scene.geometry.water.kind !== "sea" || scene.era !== "standing") return [];
  const x = VIEW_X1 - 70 - rng.next() * 30;
  const y = L.waterBottom - 26;
  return shipEngraved(d, x, y, 1.45, scene.input.kind !== "hamlet", rng);
}

/** The world's sea beast surfacing in the near water, three coils and a head, after the serpent the chart already draws. */
function serpentNodes(d: Dress, x: number, y: number, rng: Rng): SvgNode[] {
  const s = 1.6;
  const coil = (cx: number, h: number): string => `M${r1(cx - 9 * s)} ${r1(y)}q${r1(9 * s)} ${r1(-h * s)} ${r1(18 * s)} 0`;
  const out: SvgNode[] = [];
  for (const [dx, h] of [[-36, 12], [-12, 15], [12, 11]] as const) {
    out.push(el("path", { d: coil(x + dx, h), fill: d.coloured ? d.wash.wood : d.paper, ...stroke(d, 1.1) }));
    out.push(el("path", { d: `M${r1(x + dx - 6 * s)} ${r1(y - 2)}q${r1(6 * s)} ${r1(-h * 0.5 * s)} ${r1(12 * s)} 0`, fill: "none", stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.7 }));
  }
  out.push(el("path", { d: `M${r1(x + 30)} ${r1(y)}q${r1(3 * s)} ${r1(-14 * s)} ${r1(10 * s)} ${r1(-15 * s)}q${r1(8 * s)} ${r1(-1.4 * s)} ${r1(8 * s)} ${r1(4.6 * s)}q0 ${r1(3.6 * s)} ${r1(-5.4 * s)} ${r1(3 * s)}l${r1(2.4 * s)} ${r1(2.6 * s)}`, fill: d.coloured ? d.wash.wood : d.paper, ...stroke(d, 1.1) }));
  out.push(el("circle", { cx: r1(x + 30 + 13 * s), cy: r1(y - 12 * s), r: 1, fill: d.ink }));
  const spray: string[] = [];
  for (let i = 0; i < 4; i++) spray.push(`M${r1(x - 50 + rng.next() * 100)} ${r1(y + 2 + rng.next() * 4)}q4 -1.4 8 0`);
  out.push(el("path", { d: spray.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.45, "stroke-opacity": 0.7 }));
  return out;
}

function riseVignette(d: Dress, scene: Scene, L: RiseLayout, rng: Rng, avoidClouds: ReadonlyArray<{ x0: number; x1: number }>): { nodes: SvgNode[]; horizonYAt: (x: number) => number } {
  const g = scene.geometry;
  const river = g.water?.kind === "river";
  const v = vignetteTown(d, scene, rng, { dy: L.dy, waterBottom: river ? null : L.waterBottom, skyTop: L.skyTop, avoidClouds, nearBandBottom: L.waterBottom });
  const plain: SvgNode[] = [];
  const meadowTop = g.water ? (river ? g.water.y1 + L.dy : null) : g.ground.base + L.dy;
  if (meadowTop !== null) {
    const band = [{ x: VIEW_X0, y: meadowTop }, { x: VIEW_X1, y: meadowTop }, { x: VIEW_X1, y: L.waterBottom + 4 }, { x: VIEW_X0, y: L.waterBottom + 4 }];
    plain.push(el("path", { d: poly(band), fill: d.coloured ? d.wash.grass : d.paper, stroke: "none" }));
    if (river) plain.push(...groundSweep(d, band, 0.05, 3.4, rng, 24));
  }
  const beast = scene.beast && g.water?.kind === "sea"
    ? serpentNodes(d, (VIEW_X0 + VIEW_X1) / 2 + Math.max(-150, Math.min(150, scene.beast.lateral * 200)) - 60, L.waterBottom - 10, rng)
    : [];
  return { nodes: [...(river ? [] : plain), ...v.nodes, ...(river ? plain : []), ...nearShip(d, scene, L, rng), ...beast, ...riseNodes(d, scene, L, rng)], horizonYAt: v.horizonYAt };
}

export function plateB(d: Dress, scene: Scene): string {
  const g = scene.geometry;
  const suffix = `b-${d.key}-${g.seed}-${g.index}`;
  const rng = createRng(g.seed).fork(`mock:${g.index}:b`);
  const c = dressContext(d.style);
  const hangs = scene.input.kind === "capital" || scene.input.kind === "seat";
  const arms = hangs && scene.era !== "before-founding" ? scene.input.arms : null;
  const { engraved, furniture } = plateFurniture(c, scene.caption, scene.era, scene.key.map((k) => ({ ...k, y: k.y + LAYOUT_B.dy })), arms, suffix);
  const v = riseVignette(d, scene, LAYOUT_B, rng, []);
  const children: SvgNode[] = [
    ...parchmentDefs(d, suffix, (g.seed * 31 + g.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...v.nodes,
    ...engraved,
    ...parchmentOverlay(d, suffix),
    ...furniture,
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `Direction B, ${scene.input.name}` }, children));
}

/** Direction D's furniture laid over a vignette: the cartouche and banderole in the sky, the wreathed arms and the chart roundel, the key panel, the cardinal words, the horizon towns and the footer line. */
export function namedFurniture(d: Dress, scene: Scene, suffix: string, horizonYAt: (x: number) => number, keyDy: number, panel: { x: number; y: number; cols: number }): SvgNode[] {
  const lines = keyLines(scene);
  const towns = horizonTowns(d, scene, horizonYAt, 0, scene.townRun);
  const tagged = towns.tags.map((t) => {
    const n = lines.findIndex((l) => l.label === `The road to ${scene.neighbours[t.n]!.name}`) + 1;
    return { ...t, n };
  }).filter((t) => t.n > 0);
  const epithet = scene.caption.yearLine === null ? scene.caption.epithet
    : scene.era === "ruined" ? `founded An. ${scene.input.founded}, ${scene.caption.epithet}`
    : `${scene.caption.epithet}, founded An. ${scene.input.founded}`;
  const arms = scene.input.arms && scene.era !== "before-founding" ? wreathedArms(d, scene.input.arms, 64, 60, suffix) : [];
  return [
    ...towns.nodes,
    ...titleCartouche(d, scene, 44),
    ...banderole(d, epithet, 70),
    ...arms,
    ...chartRoundel(d, scene, PLATE_W - 64, 60),
    ...keyPanel(d, lines, panel.x, panel.y, panel.cols),
    ...keyTags(d, scene, keyDy, tagged),
    ...cardinalWords(d, scene, 14, PLATE_H - 15),
    footerLine(d, scene, PLATE_H - 15),
    ...frameNodes(d),
  ];
}

export function plateE(d: Dress, scene: Scene): string {
  const g = scene.geometry;
  const suffix = `e-${d.key}-${g.seed}-${g.index}`;
  const rng = createRng(g.seed).fork(`mock:${g.index}:e`);
  const v = riseVignette(d, scene, LAYOUT_E, rng, [{ x0: 150, x1: 370 }]);
  const lines = keyLines(scene);
  const cols = lines.length > 4 ? 2 : 1;
  const panelW = cols * 92 + 10;
  const children: SvgNode[] = [
    ...parchmentDefs(d, suffix, (g.seed * 31 + g.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...v.nodes,
    ...parchmentOverlay(d, suffix),
    ...namedFurniture(d, scene, suffix, v.horizonYAt, LAYOUT_E.dy, { x: VIEW_X1 - panelW - 2, y: LAYOUT_E.riseBottom - 14 - (Math.ceil(lines.length / cols) * 8.6 + 10), cols }),
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `Direction E, ${scene.input.name}` }, children));
}

/** Direction D: today's side-on composition carried 40 px down into the band the old caption held, under the named furniture. */
export function plateD(d: Dress, scene: Scene): string {
  const g = scene.geometry;
  const suffix = `d-${d.key}-${g.seed}-${g.index}`;
  const rng = createRng(g.seed).fork(`mock:${g.index}:d`);
  const dy = 40;
  const v = vignetteTown(d, scene, rng, { dy, waterBottom: g.water ? g.water.y1 + dy + 30 : null, skyTop: 92, avoidClouds: [{ x0: 150, x1: 370 }], nearBandBottom: PLATE_H - 40 });
  const lines = keyLines(scene);
  const cols = lines.length > 4 ? 2 : 1;
  const children: SvgNode[] = [
    ...parchmentDefs(d, suffix, (g.seed * 31 + g.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...v.nodes,
    ...parchmentOverlay(d, suffix),
    ...namedFurniture(d, scene, suffix, v.horizonYAt, dy, { x: VIEW_X0 + 2, y: PLATE_H - 32 - (Math.ceil(lines.length / cols) * 8.6 + 10), cols }),
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `Direction D, ${scene.input.name}` }, children));
}
