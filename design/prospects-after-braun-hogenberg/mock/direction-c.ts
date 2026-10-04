// Direction C, the bird's-eye after Cologne and Antwerp: a window of the real heightfield around the site, projected obliquely, with the coast, the rivers, the roads, the biomes and the neighbours the engine already holds, and the town laid out as blocks of oblique houses inside its wall. The second camera the Civitates mostly used.
import { el, renderSvg, type SvgNode } from "../../../src/render/svg.ts";
import { createRng, type Rng } from "../../../src/core/rng.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1 } from "../../../src/prospect/geometry.ts";
import { sampleBilinear, viewRight } from "../../../src/prospect/transect.ts";
import { biomeName } from "../../../src/climate/biomes.ts";
import type { Dress } from "./dress.ts";
import type { Scene } from "./data.ts";
import { hatchNode, poly, r1, stroke, treeClump, waterLines, type Pt } from "./burin.ts";
import { parchmentDefs, parchmentOverlay } from "./direction-a.ts";
import { shipEngraved } from "./townscape.ts";
import { banderole, cardinalWords, chartRoundel, footerLine, frameNodes, keyPanel, titleCartouche, wreathedArms, type KeyLine } from "./furniture.ts";
import { figureNodes } from "./staffage.ts";

const CX = PLATE_W / 2;
const HALF_U = 17;
const V_NEAR = -8;
const V_FAR = 15;
const STEP = 0.5;
const SX = (VIEW_X1 - VIEW_X0) / (2 * HALF_U);
const SY = SX * 0.52;
const BASE_Y = 236;
const LIFT = 52;
const TOP_Y = 100;

type Proj = { readonly u: number; readonly v: number; readonly x: number; readonly y: number; readonly e: number; readonly land: boolean; readonly biome: string };

type Window = {
  readonly cols: number;
  readonly rows: number;
  readonly at: (i: number, j: number) => Proj;
  readonly project: (u: number, v: number, e: number) => Pt;
  readonly toUV: (gx: number, gy: number) => { u: number; v: number };
  readonly rel: (e: number) => number;
};

function buildWindow(scene: Scene): Window {
  const { world, input } = scene;
  const s = world.settlements[input.index]!;
  const right = viewRight(input.view);
  const view = input.view;
  const span = Math.max(...Array.from(world.elev.data)) - world.seaLevel || 1;
  const rel = (e: number): number => Math.max(0, (e - world.seaLevel) / span);
  const project = (u: number, v: number, e: number): Pt => ({ x: CX + u * SX, y: BASE_Y - v * SY - rel(e) * LIFT });
  const cols = Math.round((2 * HALF_U) / STEP) + 1;
  const rows = Math.round((V_FAR - V_NEAR) / STEP) + 1;
  const cache = new Map<number, Proj>();
  const at = (i: number, j: number): Proj => {
    const key = j * cols + i;
    const hit = cache.get(key);
    if (hit) return hit;
    const u = -HALF_U + i * STEP, v = V_NEAR + j * STEP;
    const gx = s.x + u * right.dx + v * view.dx, gy = s.y + u * right.dy + v * view.dy;
    const e = sampleBilinear(world.elev, gx, gy);
    const w = world.elev.w;
    const xi = Math.max(0, Math.min(w - 1, Math.round(gx))), yi = Math.max(0, Math.min(world.elev.h - 1, Math.round(gy)));
    const p = { u, v, ...project(u, v, e), e, land: e > world.seaLevel, biome: biomeName(world.biomes[xi + yi * w] as number) };
    cache.set(key, p);
    return p;
  };
  const toUV = (gx: number, gy: number): { u: number; v: number } => {
    const ox = gx - s.x, oy = gy - s.y;
    return { u: ox * right.dx + oy * right.dy, v: ox * view.dx + oy * view.dy };
  };
  return { cols, rows, at, project, toUV, rel };
}

/** Land as one filled strip per run of land samples along a row, drawn far to near so nearer ground covers farther. */
function landStrips(d: Dress, W: Window): SvgNode[] {
  const out: SvgNode[] = [];
  const fill = d.coloured ? d.wash.ground : d.paper;
  for (let j = W.rows - 1; j >= 1; j--) {
    let i = 0;
    while (i < W.cols) {
      if (!W.at(i, j).land) { i++; continue; }
      let k = i;
      while (k < W.cols && W.at(k, j).land) k++;
      const top: Pt[] = [], bottom: Pt[] = [];
      for (let q = i; q < k; q++) { top.push(W.at(q, j)); bottom.push(W.at(q, j - 1)); }
      const pts = [...top, ...bottom.reverse()];
      if (pts.length >= 3) out.push(el("path", { d: poly(pts), fill, stroke: fill, "stroke-width": 0.6 }));
      i = k;
    }
  }
  return out;
}

/** The coast by marching squares over the sample grid, interpolated to the sea level and projected. */
function coastPath(W: Window, seaLevel: number): string {
  const parts: string[] = [];
  const lerp = (a: Proj, b: Proj): Pt => {
    const t = (seaLevel - a.e) / (b.e - a.e || 1e-9);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };
  for (let j = 0; j < W.rows - 1; j++) {
    for (let i = 0; i < W.cols - 1; i++) {
      const a = W.at(i, j), b = W.at(i + 1, j), c = W.at(i + 1, j + 1), dd = W.at(i, j + 1);
      const code = (a.land ? 1 : 0) | (b.land ? 2 : 0) | (c.land ? 4 : 0) | (dd.land ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const e: Pt[] = [];
      if ((code & 1) !== (code & 2) >> 1) e.push(lerp(a, b));
      if ((code & 2) >> 1 !== (code & 4) >> 2) e.push(lerp(b, c));
      if ((code & 4) >> 2 !== (code & 8) >> 3) e.push(lerp(c, dd));
      if ((code & 8) >> 3 !== (code & 1)) e.push(lerp(dd, a));
      for (let q = 0; q + 1 < e.length; q += 2) parts.push(`M${r1(e[q]!.x)} ${r1(e[q]!.y)}L${r1(e[q + 1]!.x)} ${r1(e[q + 1]!.y)}`);
    }
  }
  return parts.join("");
}

/** Hill hatching: a stroke down the fall line wherever the ground stands above the site, longer where steeper, and a second darker stroke on faces turned from the light. */
function hillHatch(d: Dress, W: Window, siteRel: number): SvgNode[] {
  const parts: string[] = [], dark: string[] = [];
  for (let j = 2; j < W.rows - 2; j += 3) {
    for (let i = 2; i < W.cols - 2; i += 3) {
      const p = W.at(i, j);
      if (!p.land) continue;
      const rise = W.rel(p.e) - siteRel;
      if (rise < 0.05) continue;
      const gx = W.rel(W.at(i + 2, j).e) - W.rel(W.at(i - 2, j).e);
      const gy = W.rel(W.at(i, j + 2).e) - W.rel(W.at(i, j - 2).e);
      const len = Math.min(14, 4 + rise * 26);
      const dx = -gx * 40, dy = gy * 40;
      parts.push(`M${r1(p.x)} ${r1(p.y)}l${r1(dx * len * 0.3 + (gx === 0 && gy === 0 ? 1 : 0))} ${r1(dy * len * 0.3 + len * 0.6)}`);
      if (gx > 0.03) dark.push(`M${r1(p.x + 1.5)} ${r1(p.y - 1)}l${r1(len * 0.35)} ${r1(len * 0.75)}`);
    }
  }
  return [
    el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.38, "stroke-opacity": 0.55 }),
    el("path", { d: dark.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.45, "stroke-opacity": 0.6 }),
  ];
}

const TREE_BIOMES = new Set(["temperateForest", "rainforest", "taiga", "tropicalForest", "jungle"]);
const FIELD_BIOMES = new Set(["grassland", "steppe", "shrubland", "savanna"]);

function vegetation(d: Dress, W: Window, rng: Rng, townR: number): SvgNode[] {
  const out: SvgNode[] = [];
  for (let j = W.rows - 1; j >= 0; j -= 2) {
    for (let i = 1; i < W.cols - 1; i += 2) {
      const p = W.at(i, j);
      if (!p.land) continue;
      const inTown = p.u * p.u + p.v * p.v < (townR + 0.6) * (townR + 0.6);
      if (inTown) continue;
      if (TREE_BIOMES.has(p.biome) && rng.next() < 0.42) {
        const s = 0.8 + rng.next() * 0.9;
        out.push(...treeClump(d, p.x + (rng.next() - 0.5) * 4, p.y + 2, s, rng, p.biome === "taiga" ? "pine" : p.biome === "jungle" || p.biome === "tropicalForest" ? "palm" : "round"));
      } else if (FIELD_BIOMES.has(p.biome) && p.u * p.u + p.v * p.v < 81 && rng.next() < 0.5) {
        const w = 6 + rng.next() * 8, h = 3 + rng.next() * 3;
        const quad = [{ x: p.x - w / 2, y: p.y - h / 2 }, { x: p.x + w / 2 + 1.5, y: p.y - h / 2 }, { x: p.x + w / 2, y: p.y + h / 2 }, { x: p.x - w / 2 - 1.5, y: p.y + h / 2 }];
        if (d.coloured) out.push(el("path", { d: poly(quad), fill: rng.next() < 0.5 ? d.wash.grass : d.wash.ground, stroke: "none" }));
        out.push(hatchNode(d, quad, rng.next() < 0.5 ? 0.08 : 0.5, 1.3, 0.3, 0.6));
      } else if (p.biome === "marsh" && rng.next() < 0.3) {
        out.push(el("path", { d: `M${r1(p.x - 2)} ${r1(p.y)}h4M${r1(p.x - 1)} ${r1(p.y - 1.4)}h2M${r1(p.x)} ${r1(p.y - 1.4)}v-2`, fill: "none", stroke: d.ink, "stroke-width": 0.45 }));
      }
    }
  }
  return out;
}

function clipped(W: Window, pts: ReadonlyArray<{ x: number; y: number }>, e: (gx: number, gy: number) => number): Pt[][] {
  const runs: Pt[][] = [];
  let cur: Pt[] = [];
  for (const p of pts) {
    const { u, v } = W.toUV(p.x, p.y);
    if (Math.abs(u) <= HALF_U && v >= V_NEAR && v <= V_FAR) cur.push(W.project(u, v, e(p.x, p.y)));
    else if (cur.length > 0) { runs.push(cur); cur = []; }
  }
  if (cur.length > 0) runs.push(cur);
  return runs;
}

function riversAndRoads(d: Dress, scene: Scene, W: Window): SvgNode[] {
  const { world } = scene;
  const out: SvgNode[] = [];
  const e = (gx: number, gy: number): number => sampleBilinear(world.elev, gx, gy);
  for (const river of world.rivers) {
    for (const run of clipped(W, river.points, e)) {
      if (run.length < 2) continue;
      const dd = poly(run, false);
      if (d.coloured) out.push(el("path", { d: dd, fill: "none", stroke: d.wash.water, "stroke-width": 3.2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      out.push(el("path", { d: dd, fill: "none", stroke: d.ink, "stroke-width": 0.8, "stroke-linejoin": "round" }));
      out.push(el("path", { d: poly(run.map((p) => ({ x: p.x, y: p.y + 1.6 })), false), fill: "none", stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.7, "stroke-linejoin": "round" }));
    }
  }
  for (const road of world.roads) {
    for (const run of clipped(W, road.points, e)) {
      if (run.length < 2) continue;
      out.push(el("path", { d: poly(run, false), fill: "none", stroke: d.ink, "stroke-width": road.rank === "trunk" ? 0.9 : 0.6, "stroke-dasharray": "2 1.4", "stroke-opacity": 0.85, "stroke-linejoin": "round" }));
    }
  }
  return out;
}

type House = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly depth: number; readonly church: boolean };

function houseNodes(d: Dress, hs: House, rng: Rng): SvgNode[] {
  const { x, y, w, h, depth } = hs;
  const roofFill = d.coloured ? (hs.church ? d.wash.roofChurch : d.wash.roof) : d.paper;
  const front = [{ x, y }, { x: x + w, y }, { x: x + w, y: y - h }, { x, y: y - h }];
  const roof = [{ x, y: y - h }, { x: x + w, y: y - h }, { x: x + w + depth * 0.5, y: y - h - depth }, { x: x + depth * 0.5, y: y - h - depth }];
  const side = [{ x: x + w, y }, { x: x + w + depth * 0.5, y: y - depth }, { x: x + w + depth * 0.5, y: y - h - depth }, { x: x + w, y: y - h }];
  const out: SvgNode[] = [
    el("path", { d: poly(front), fill: d.paper, ...stroke(d, 0.45) }),
    el("path", { d: poly(side), fill: d.paper, ...stroke(d, 0.45) }),
    hatchNode(d, side, 3, 1.1, 0.35, 0.9),
    el("path", { d: poly(roof), fill: roofFill, ...stroke(d, 0.45) }),
  ];
  if (!d.coloured || hs.church) out.push(hatchNode(d, roof, 0.1, 1.0, 0.3, 0.7));
  if (rng.next() < 0.6 && h > 3) out.push(el("rect", { x: r1(x + w * 0.4), y: r1(y - h * 0.65), width: 0.8, height: 1.2, fill: d.ink }));
  return out;
}

const TOWN_R: Record<string, number> = { capital: 4.6, seat: 3.8, town: 3.0, village: 1.9, hamlet: 1.2 };

function footprint(W: Window, R: number, rng: Rng): Pt[] {
  const TAB = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]] as const;
  return TAB.map(([cu, cv]) => {
    const rr = R * (0.88 + rng.next() * 0.24);
    const u = cu * rr, v = cv * rr;
    const p = W.at(Math.round((u + HALF_U) / STEP), Math.round((v - V_NEAR) / STEP));
    return W.project(u, v, p.e);
  });
}

function insidePoly(pts: ReadonlyArray<Pt>, x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]!, b = pts[j]!;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

function town(d: Dress, scene: Scene, W: Window, rng: Rng): { nodes: SvgNode[]; R: number; wallPts: Pt[] } {
  const { input } = scene;
  const factor = Math.min(1.2, Math.max(0.8, input.score / (input.kind === "capital" ? 6 : input.kind === "seat" ? 4.5 : input.kind === "town" ? 3.5 : 1.8)));
  const R = (TOWN_R[input.kind] ?? 1.4) * factor;
  const walled = (input.kind === "capital" || input.kind === "seat" || input.kind === "town") && scene.era === "standing";
  const ring = footprint(W, R, rng);
  const out: SvgNode[] = [];
  if (scene.era === "before-founding") return { nodes: [], R: 0, wallPts: [] };
  out.push(el("path", { d: poly(ring), fill: d.coloured ? d.wash.ground : d.paper, stroke: "none" }));
  const siteE = W.at(Math.round(HALF_U / STEP), Math.round(-V_NEAR / STEP)).e;
  const streetU = 0.22, streetV = 0.22;
  const houses: House[] = [];
  const hw = 0.38, hd = 0.2;
  for (let v = R; v >= -R; v -= 0.5) {
    for (let u = -R; u <= R; u += 0.46) {
      if (Math.abs(u) < streetU || Math.abs(v) < streetV) continue;
      if (input.kind === "capital" && Math.abs(u - v) < 0.25) continue;
      const p = W.project(u, v, siteE);
      if (!insidePoly(ring, p.x, p.y)) continue;
      if (rng.next() < 0.12) continue;
      if (scene.era === "ruined" && rng.next() < 0.7) continue;
      houses.push({ x: p.x - (hw * SX) / 2, y: p.y, w: hw * SX, h: 2.2 + rng.next() * 1.6, depth: hd * SY * 2, church: false });
    }
  }
  for (const h of houses) out.push(...houseNodes(d, h, rng));
  const centre = W.project(0, 0, siteE);
  if (input.kind !== "hamlet" && scene.era === "standing") {
    const cx = centre.x + 0.6 * SX, cy = centre.y + 0.5 * SY;
    out.push(...houseNodes(d, { x: cx - 5, y: cy, w: 10, h: 7, depth: 5, church: true }, rng));
    out.push(el("path", { d: `M${r1(cx - 6)} ${r1(cy)}V${r1(cy - 11)}H${r1(cx - 2.5)}V${r1(cy)}Z`, fill: d.paper, ...stroke(d, 0.5) }));
    out.push(el("path", { d: `M${r1(cx - 6.6)} ${r1(cy - 11)}L${r1(cx - 4.25)} ${r1(cy - 20)}L${r1(cx - 1.9)} ${r1(cy - 11)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
    out.push(hatchNode(d, [{ x: cx - 4.25, y: cy - 20 }, { x: cx - 1.9, y: cy - 11 }, { x: cx - 4.25, y: cy - 11 }], -3.8, 1.1, 0.35));
  }
  if ((input.kind === "capital" || input.kind === "seat") && scene.era === "standing") {
    const kx = centre.x - 1.4 * SX, ky = centre.y - 0.9 * SY;
    out.push(...houseNodes(d, { x: kx - 7, y: ky, w: 14, h: 11, depth: 7, church: false }, rng));
    for (const [tx, ty] of [[kx - 7, ky], [kx + 7, ky], [kx - 3.5, ky - 7], [kx + 10.5, ky - 7]] as const) {
      out.push(el("path", { d: `M${r1(tx - 1.6)} ${r1(ty)}V${r1(ty - 14)}H${r1(tx + 1.6)}V${r1(ty)}Z`, fill: d.paper, ...stroke(d, 0.5) }));
      out.push(el("path", { d: `M${r1(tx - 2.2)} ${r1(ty - 14)}L${r1(tx)} ${r1(ty - 17.5)}L${r1(tx + 2.2)} ${r1(ty - 14)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
    }
  }
  if (walled) {
    const outer = ring.map((p) => ({ x: p.x + (p.x - centre.x) * 0.06, y: p.y + (p.y - centre.y) * 0.06 }));
    out.push(el("path", { d: poly(outer), fill: "none", ...stroke(d, 2.2) }));
    out.push(el("path", { d: poly(outer), fill: "none", stroke: d.paper, "stroke-width": 1.0 }));
    const teeth: string[] = [];
    for (let i = 0; i < outer.length; i++) {
      const a = outer[i]!, b = outer[(i + 1) % outer.length]!;
      const n = 6;
      for (let k = 1; k < n; k++) {
        const t = k / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        teeth.push(`M${r1(x)} ${r1(y)}v-1.6`);
      }
      out.push(el("circle", { cx: r1(a.x), cy: r1(a.y - 1), r: 2.1, fill: d.paper, ...stroke(d, 0.6) }));
      out.push(el("path", { d: `M${r1(a.x - 2.4)} ${r1(a.y - 2)}L${r1(a.x)} ${r1(a.y - 6)}L${r1(a.x + 2.4)} ${r1(a.y - 2)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.5) }));
    }
    out.push(el("path", { d: teeth.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.5 }));
    return { nodes: out, R, wallPts: outer };
  }
  return { nodes: out, R, wallPts: ring };
}

function harbourWorks(d: Dress, scene: Scene, W: Window, R: number, rng: Rng): SvgNode[] {
  if (!scene.input.harbor || scene.era !== "standing") return [];
  const out: SvgNode[] = [];
  const seaLevel = scene.world.seaLevel;
  let nearest: Proj | null = null, best = 1e9;
  for (let j = 0; j < W.rows; j++) for (let i = 0; i < W.cols; i++) {
    const p = W.at(i, j);
    if (p.land) continue;
    const dd = p.u * p.u + p.v * p.v;
    if (dd < best) { best = dd; nearest = p; }
  }
  if (!nearest) return [];
  const qx0 = nearest.x - R * SX * 0.8, qx1 = nearest.x + R * SX * 0.8, qy = nearest.y + 1;
  out.push(el("path", { d: `M${r1(qx0)} ${r1(qy)}H${r1(qx1)}`, fill: "none", ...stroke(d, 2.0) }));
  out.push(el("path", { d: `M${r1(qx0)} ${r1(qy - 0.6)}H${r1(qx1)}`, fill: "none", stroke: d.paper, "stroke-width": 0.6 }));
  if (scene.input.kind === "capital" || scene.input.kind === "seat") {
    const mx = qx1 + 2, my = qy;
    out.push(el("path", { d: `M${r1(mx)} ${r1(my)}q${r1(10)} ${r1(6)} ${r1(6)} ${r1(16)}`, fill: "none", ...stroke(d, 2.0) }));
    out.push(el("path", { d: `M${r1(mx + 4.6)} ${r1(my + 16)}V${r1(my + 9)}H${r1(mx + 7.4)}V${r1(my + 16)}Z`, fill: d.paper, ...stroke(d, 0.6) }));
  }
  const ships = scene.input.kind === "capital" ? 7 : scene.input.kind === "village" ? 2 : 4;
  for (let k = 0; k < ships; k++) {
    for (let tries = 0; tries < 12; tries++) {
      const u = (rng.next() - 0.5) * 2 * (R + 7), v = -R - 0.6 - rng.next() * 7;
      const i = Math.round((u + HALF_U) / STEP), j = Math.round((v - V_NEAR) / STEP);
      if (i < 0 || j < 0 || i >= W.cols || j >= W.rows) continue;
      const p = W.at(i, j);
      if (p.land || p.e > seaLevel) continue;
      out.push(...shipEngraved(d, p.x, p.y, 0.42 + rng.next() * 0.25, rng.next() < 0.4, rng));
      break;
    }
  }
  return out;
}

function neighbours(d: Dress, scene: Scene, W: Window, rng: Rng): SvgNode[] {
  const out: SvgNode[] = [];
  const { world, input } = scene;
  world.settlements.forEach((n, i) => {
    if (i === input.index) return;
    const { u, v } = W.toUV(n.x, n.y);
    if (Math.abs(u) > HALF_U - 1.5 || v < V_NEAR + 1 || v > V_FAR - 1) return;
    const e = sampleBilinear(world.elev, n.x, n.y);
    const p = W.project(u, v, e);
    const count = n.kind === "capital" ? 7 : n.kind === "town" ? 5 : 3;
    for (let k = 0; k < count; k++) {
      const hx = p.x + (rng.next() - 0.5) * 9, hy = p.y + (rng.next() - 0.5) * 5;
      out.push(...houseNodes(d, { x: hx, y: hy, w: 3.2, h: 2.2, depth: 1.8, church: false }, rng));
    }
    if (n.kind !== "village") out.push(el("path", { d: `M${r1(p.x)} ${r1(p.y)}V${r1(p.y - 7)}l1.4 2.2l1.4 -2.2V${r1(p.y)}`, fill: d.paper, ...stroke(d, 0.5) }));
    out.push(el("text", { x: r1(p.x), y: r1(p.y - 8), "text-anchor": "middle", "font-family": d.font, "font-size": 6.2, "font-style": "italic", fill: d.ink, stroke: d.paper, "stroke-width": 1.8, "paint-order": "stroke" }, [n.name]));
  });
  return out;
}

function waterNames(d: Dress, scene: Scene, W: Window): SvgNode[] {
  const out: SvgNode[] = [];
  if (scene.input.harbor) {
    let bestP: Proj | null = null, bestScore = -1;
    for (let j = 0; j < W.rows; j += 2) for (let i = 4; i < W.cols - 4; i += 2) {
      const p = W.at(i, j);
      if (p.land) continue;
      let run = 0;
      for (let k = i; k < W.cols && !W.at(k, j).land; k++) run++;
      const score = run - Math.abs(p.v - V_NEAR - 4) * 2;
      if (score > bestScore) { bestScore = score; bestP = p; }
    }
    if (bestP && bestScore > 12) {
      const name = scene.seaName.toUpperCase();
      const half = name.length * 6.2;
      const x = Math.max(VIEW_X0 + half + 6, Math.min(VIEW_X1 - half - 6, bestP.x + (bestScore * STEP * SX) / 2));
      out.push(el("text", { x: r1(x), y: r1(bestP.y), "text-anchor": "middle", "font-family": d.font, "font-size": 9, "font-style": "italic", "letter-spacing": 3, fill: d.ink, "fill-opacity": 0.8 }, [name]));
    }
  }
  return out;
}

export function keyLinesC(scene: Scene): KeyLine[] {
  const lines: string[] = [];
  const standing = scene.era === "standing";
  if (standing && (scene.input.kind === "capital" || scene.input.kind === "seat")) lines.push("The Keep");
  if (standing && scene.input.kind !== "hamlet") lines.push("The Great Church");
  if (standing && scene.input.harbor) lines.push("The Quay");
  if (standing && scene.input.harbor && (scene.input.kind === "capital" || scene.input.kind === "seat")) lines.push("The Mole");
  if (scene.input.harbor) lines.push(scene.seaName);
  if (scene.riverName) lines.push(scene.riverName);
  if (scene.forestName) lines.push(scene.forestName);
  for (const n of scene.neighbours.slice(0, 2)) lines.push(`The road to ${n.name}`);
  return lines.slice(0, 8).map((label, i) => ({ n: i + 1, label }));
}

export function plateC(d: Dress, scene: Scene): string {
  const g = scene.geometry;
  const suffix = `c-${d.key}-${g.seed}-${g.index}`;
  const rng = createRng(g.seed).fork(`mock:${g.index}:c`);
  const W = buildWindow(scene);
  const seaLevel = scene.world.seaLevel;
  const viewRect = { x0: VIEW_X0, x1: VIEW_X1, y0: TOP_Y, y1: PLATE_H - 34 };
  const sea: SvgNode[] = [];
  if (d.coloured) sea.push(el("rect", { x: viewRect.x0, y: viewRect.y0, width: viewRect.x1 - viewRect.x0, height: viewRect.y1 - viewRect.y0, fill: d.wash.water }));
  sea.push(waterLines(d, viewRect.x0, viewRect.x1, viewRect.y0, viewRect.y1, [], rng));
  const t = town(d, scene, W, rng);
  const lines = keyLinesC(scene);
  const cols = lines.length > 4 ? 2 : 1;
  const panelH = Math.ceil(lines.length / cols) * 8.6 + 10;
  const bank = [{ x: VIEW_X0, y: viewRect.y1 - 30 }, { x: VIEW_X0 + 40, y: viewRect.y1 - 36 }, { x: VIEW_X0 + 88, y: viewRect.y1 - 22 }, { x: VIEW_X0 + 104, y: viewRect.y1 }, { x: VIEW_X0, y: viewRect.y1 }];
  const bankNodes: SvgNode[] = scene.era === "standing" ? [
    el("path", { d: poly(bank), fill: d.coloured ? d.wash.grassDeep : d.paper, ...stroke(d, 0.9) }),
    hatchNode(d, bank, -0.2, 2.6, 0.4, 0.6),
    ...treeClump(d, VIEW_X0 + 14, viewRect.y1 - 14, 4.2, rng),
  ] : [];
  const figures = scene.era === "standing"
    ? [figureNodes(d, { kind: scene.input.kind === "village" || scene.input.kind === "hamlet" ? "fisher" : "gentleman", x: VIEW_X0 + 30, y: viewRect.y1 - 6, h: 34, flip: false }, scene.input.arms),
       figureNodes(d, { kind: scene.input.kind === "village" || scene.input.kind === "hamlet" ? "waterbearer" : "lady", x: VIEW_X0 + 56, y: viewRect.y1 - 4, h: 34, flip: true }, scene.input.arms)]
    : [];
  const children: SvgNode[] = [
    ...parchmentDefs(d, suffix, (g.seed * 31 + g.index * 7) % 9973),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: d.paper }),
    ...sea,
    ...landStrips(d, W),
    el("path", { d: coastPath(W, seaLevel), fill: "none", ...stroke(d, 0.9) }),
    ...hillHatch(d, W, scene.input.siteRel),
    ...riversAndRoads(d, scene, W),
    ...vegetation(d, W, rng, t.R),
    ...t.nodes,
    ...harbourWorks(d, scene, W, t.R, rng),
    ...neighbours(d, scene, W, rng),
    ...waterNames(d, scene, W),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: viewRect.y0, fill: d.paper }),
    el("rect", { x: 0, y: viewRect.y1, width: PLATE_W, height: PLATE_H - viewRect.y1, fill: d.paper }),
    el("rect", { x: 0, y: 0, width: VIEW_X0, height: PLATE_H, fill: d.paper }),
    el("rect", { x: VIEW_X1, y: 0, width: PLATE_W - VIEW_X1, height: PLATE_H, fill: d.paper }),
    el("rect", { x: viewRect.x0, y: viewRect.y0, width: viewRect.x1 - viewRect.x0, height: viewRect.y1 - viewRect.y0, fill: "none", ...stroke(d, 0.8) }),
    ...bankNodes,
    ...figures,
    ...parchmentOverlay(d, suffix),
    ...titleCartouche(d, scene, 44),
    ...banderole(d, scene.caption.yearLine ? `${scene.caption.epithet}, founded An. ${scene.input.founded}` : scene.caption.epithet, 70),
    ...(scene.input.arms && scene.era !== "before-founding" ? wreathedArms(d, scene.input.arms, 64, 60, suffix) : []),
    ...chartRoundel(d, scene, PLATE_W - 64, 60),
    ...keyPanel(d, lines, VIEW_X1 - (cols * 92 + 10) - 4, viewRect.y1 - panelH - 6, cols),
    ...cardinalWords(d, scene, 14, PLATE_H - 15),
    footerLine(d, scene, PLATE_H - 15),
    ...frameNodes(d),
  ];
  return renderSvg(el("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${PLATE_W} ${PLATE_H}`, width: PLATE_W, height: PLATE_H, role: "img", "aria-label": `Direction C, ${scene.input.name}` }, children));
}
