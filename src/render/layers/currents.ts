import { el, type SvgNode } from "../svg.ts";
import { prunePoints, boxesOverlap, type Box } from "../geometry.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { fbm2 } from "../../noise/fbm.ts";
import type { RenderCtx } from "../context.ts";
import type { World } from "../../world/types.ts";
import type { CartouchePlan } from "./cartouche.ts";
import type { CompassPlan } from "./compass.ts";

type Vec = readonly [number, number];

const FREQ = 0.02; // gyre scale: lower = broader sweeps
const STEP = 1.5; // grid units advanced per integration step
const HALF_STEPS = 16; // steps traced each way from the seed
const MIN_OCEAN_DIST = 4; // a streamline stays this many hops off any coast
const START_OCEAN_DIST = 7; // seeds sit well offshore so lines have room

/**
 * Flow direction at a grid point: the curl (perpendicular gradient) of an fBm
 * stream function. Curl is divergence-free, so streamlines swirl into closed
 * gyres rather than the uniform drift of the wind arrows. Returns null where
 * the field is too flat to give a stable direction.
 */
function flowAt(x: number, y: number, seed: number): Vec | null {
  const eps = 0.6;
  const p = (xx: number, yy: number): number =>
    fbm2(xx * FREQ, yy * FREQ, seed, { octaves: 3, gain: 0.55 });
  const dpdx = (p(x + eps, y) - p(x - eps, y)) / (2 * eps);
  const dpdy = (p(x, y + eps) - p(x, y - eps)) / (2 * eps);
  const vx = dpdy;
  const vy = -dpdx;
  const m = Math.hypot(vx, vy);
  if (m < 1e-6) return null;
  return [vx / m, vy / m];
}

/**
 * Trace one current streamline through open water, in GRID coordinates, by
 * integrating the flow field forward and backward from a seed cell. Every
 * returned point sits at least MIN_OCEAN_DIST hops from land and inside the
 * grid; tracing in a direction stops the moment it would leave open water.
 * Pure and deterministic — the water-adherence guarantee is unit-tested here.
 */
export function traceStreamline(
  world: World,
  x0: number,
  y0: number,
  seed: number,
): Array<[number, number]> {
  const { w, h } = world.elev;
  const od = world.oceanDist;
  const gate = world.region?.seaGate; // #251: parent's genuine-sea partition, if a region
  const inWater = (x: number, y: number): boolean => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 1 || iy < 1 || ix > w - 2 || iy > h - 2) return false;
    // A streamline stays in genuine sea: oceanDist cannot tell an inland lake from
    // the open sea, and on a region the crop can reconnect a lake to the border.
    if (gate && gate[ix + iy * w] === 0) return false;
    return (od[ix + iy * w] as number) >= MIN_OCEAN_DIST;
  };
  if (!inWater(x0, y0)) return [];

  const trace = (sign: 1 | -1): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    let x = x0;
    let y = y0;
    for (let s = 0; s < HALF_STEPS; s++) {
      const v = flowAt(x, y, seed);
      if (!v) break;
      x += sign * v[0] * STEP;
      y += sign * v[1] * STEP;
      if (!inWater(x, y)) break;
      out.push([x, y]);
    }
    return out;
  };

  const back = trace(-1).reverse();
  const fwd = trace(1);
  return [...back, [x0, y0], ...fwd];
}

function chevron(
  tip: readonly [number, number],
  angle: number,
  k: number,
  style: RenderCtx["style"],
): SvgNode {
  const hl = 4.5 * k;
  const a1 = angle + Math.PI * 0.78;
  const a2 = angle - Math.PI * 0.78;
  const [tx, ty] = tip;
  return el("path", {
    d:
      `M${tx.toFixed(1)} ${ty.toFixed(1)}L${(tx + Math.cos(a1) * hl).toFixed(1)} ${(ty + Math.sin(a1) * hl).toFixed(1)}` +
      `M${tx.toFixed(1)} ${ty.toFixed(1)}L${(tx + Math.cos(a2) * hl).toFixed(1)} ${(ty + Math.sin(a2) * hl).toFixed(1)}`,
    fill: "none",
    stroke: style.inkSoft,
    "stroke-width": (1.15 * k).toFixed(2),
    "stroke-opacity": 0.58,
    "stroke-linecap": "round",
  });
}

/**
 * Ocean-current streamlines over open water (nautical charts). Flowing,
 * curving lines with a few downstream chevrons — read as currents, and stay
 * distinct from the straight, single-headed prevailing-wind arrows.
 */
export function currentsLayer(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  compass: CompassPlan | null,
): SvgNode | null {
  const { style, world, proj, rng } = ctx;
  if (!style.currents) return null;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const crng = rng.fork("currents");
  const seed = world.recipe.seed + 7919;

  const avoid: Box[] = [cartouche.rect];
  if (compass) avoid.push(compass.box);
  const clear = (px: number, py: number): boolean =>
    avoid.every(
      (b) => !boxesOverlap(b, { x: px - 30, y: py - 30, w: 60, h: 60 }, 8),
    );

  const spots: Array<{ x: number; y: number; gx: number; gy: number }> = [];
  for (let gy = 5; gy < h - 5; gy += 4) {
    for (let gx = 5; gx < w - 5; gx += 4) {
      if ((world.oceanDist[gx + gy * w] as number) < START_OCEAN_DIST) continue;
      // #251: seed streamlines only in the parent's genuine sea, never an inland lake.
      if (world.region?.seaGate && world.region.seaGate[gx + gy * w] === 0) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      const edge = Math.min(
        px - proj.margin, py - proj.margin,
        proj.widthPx - proj.margin - px, proj.heightPx - proj.margin - py,
      );
      if (edge < 60 * k || !clear(px, py)) continue;
      spots.push({ x: px, y: py, gx, gy });
    }
  }

  const picked = prunePoints(crng.shuffled(spots), 170 * k, 9);
  const strokes: SvgNode[] = [];
  for (const s of picked) {
    const grid = traceStreamline(world, s.gx, s.gy, seed);
    if (grid.length < 9) continue; // drop stubs that hit land at once
    const px: Array<[number, number]> = grid.map(([x, y]) => [
      proj.px(x),
      proj.py(y),
    ]);
    const line = chaikinSmooth(px, false, 2);

    let d = `M${line[0]![0].toFixed(1)} ${line[0]![1].toFixed(1)}`;
    for (let i = 1; i < line.length; i++) {
      d += `L${line[i]![0].toFixed(1)} ${line[i]![1].toFixed(1)}`;
    }
    strokes.push(
      el("path", {
        d,
        fill: "none",
        stroke: style.inkSoft,
        "stroke-width": (1.15 * k).toFixed(2),
        "stroke-opacity": 0.52,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );

    // a few downstream chevrons spaced along the smoothed line
    const chevrons = 3;
    for (let c = 1; c <= chevrons; c++) {
      const i = Math.round(((line.length - 1) * c) / (chevrons + 1));
      if (i <= 0 || i >= line.length - 1) continue;
      const a = line[i - 1]!;
      const b = line[i + 1]!;
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      strokes.push(chevron(line[i]!, angle, k, style));
    }
  }

  if (strokes.length === 0) return null;
  return el("g", { id: "layer-currents" }, strokes);
}
