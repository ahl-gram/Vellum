import type { World } from "../../world/types.ts";
import { biomeName } from "../../climate/biomes.ts";
import { minMax } from "../../core/grid.ts";
import { clamp } from "../../core/math.ts";
import { PLATE_H, PLATE_W, VIEW_X0, VIEW_X1, type Pt } from "../geometry.ts";
import { sampleBilinear, viewRight, type ProspectView } from "../transect.ts";
import type { PlanPoint } from "../town-plan/types.ts";
import type { BirdseyeWindow, Sample } from "./types.ts";

export const CX = PLATE_W / 2;
export const HALF_U = 17;
export const V_NEAR = -8;
export const V_FAR = 15;
export const SAMPLE_STEP = 0.5;
export const SX = (VIEW_X1 - VIEW_X0) / (2 * HALF_U);
export const SY = SX * 0.52;
export const BASE_Y = 236;
export const RELIEF_LIFT = 52;
export const VIEW_TOP = 100;
export const VIEW_BOTTOM = PLATE_H - 34;

export const rel = (w: BirdseyeWindow, e: number): number => Math.max(0, (e - w.seaLevel) / w.span);

export function project(w: BirdseyeWindow, u: number, v: number, e: number): Pt {
  return { x: CX + u * SX, y: BASE_Y - v * SY - rel(w, e) * RELIEF_LIFT };
}

export function buildWindow(world: World, site: PlanPoint, view: ProspectView): BirdseyeWindow {
  const right = viewRight(view);
  const seaLevel = world.seaLevel;
  const span = minMax(world.elev).max - seaLevel || 1;
  const cols = Math.round((2 * HALF_U) / SAMPLE_STEP) + 1;
  const rows = Math.round((V_FAR - V_NEAR) / SAMPLE_STEP) + 1;
  const shell: BirdseyeWindow = { cols, rows, samples: [], site, view, right, seaLevel, span };
  const { w: width, h: height } = world.elev;
  const samples: Sample[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = -HALF_U + i * SAMPLE_STEP;
      const v = V_NEAR + j * SAMPLE_STEP;
      const gx = site.x + u * right.dx + v * view.dx;
      const gy = site.y + u * right.dy + v * view.dy;
      const e = sampleBilinear(world.elev, gx, gy);
      const xi = clamp(Math.round(gx), 0, width - 1);
      const yi = clamp(Math.round(gy), 0, height - 1);
      samples.push({
        u,
        v,
        ...project(shell, u, v, e),
        e,
        land: e > seaLevel,
        biome: biomeName(world.biomes[xi + yi * width] as number),
      });
    }
  }
  return { ...shell, samples };
}

export const sampleAt = (w: BirdseyeWindow, i: number, j: number): Sample => w.samples[j * w.cols + i]!;

export function toUV(w: BirdseyeWindow, g: PlanPoint): { readonly u: number; readonly v: number } {
  const ox = g.x - w.site.x;
  const oy = g.y - w.site.y;
  return { u: ox * w.right.dx + oy * w.right.dy, v: ox * w.view.dx + oy * w.view.dy };
}

export function projector(world: World, w: BirdseyeWindow): (g: PlanPoint) => Pt {
  return (g) => {
    const { u, v } = toUV(w, g);
    return project(w, u, v, sampleBilinear(world.elev, g.x, g.y));
  };
}

export function inView(w: BirdseyeWindow, g: PlanPoint): boolean {
  const { u, v } = toUV(w, g);
  return Math.abs(u) <= HALF_U && v >= V_NEAR && v <= V_FAR;
}
