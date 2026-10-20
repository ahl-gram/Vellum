// Issue #849 spike: the heightfield with its edge made pluggable, so one function builds the world sheet, the close-up
// and every chain ancestor from the SAME terrain inputs (the behaviour Sub 1, Issue #850, builds for the real engine).
// `elevationAt` and `coastDistance` are restated from src/terrain/heightfield.ts at 581a6de3, which does not export
// them; with `edge: { kind: "dome" }` this file must reproduce `buildHeightfield` bit for bit (checked by selfcheck.ts).
import { createField, type Field } from "../../../src/core/grid.ts";
import { lerp, smoothstep } from "../../../src/core/math.ts";
import { createRng } from "../../../src/core/rng.ts";
import { fbm2, ridged2, warped2 } from "../../../src/noise/fbm.ts";
import { MAX_DETAIL, type MapType, type UvWindow } from "../../../src/terrain/heightfield.ts";
import { isInside, signedDistance, type OutlineField } from "./outlines.ts";

type Shape = { featureScale: number; warpStrength: number; ridgedWeight: number; falloffStart: number; falloffEnd: number; baseKeep: number; sinkDepth: number; coastWarp: number };
export const SHAPES: Record<MapType, Shape> = {
  island: { featureScale: 3.0, warpStrength: 0.45, ridgedWeight: 0.4, falloffStart: 0.62, falloffEnd: 1.02, baseKeep: 0.4, sinkDepth: 0.3, coastWarp: 0.55 },
  archipelago: { featureScale: 4.6, warpStrength: 0.7, ridgedWeight: 0.25, falloffStart: 0.55, falloffEnd: 1.05, baseKeep: 0.55, sinkDepth: 0.22, coastWarp: 0.55 },
  continent: { featureScale: 2.2, warpStrength: 0.4, ridgedWeight: 0.45, falloffStart: 0.78, falloffEnd: 1.12, baseKeep: 0.55, sinkDepth: 0.25, coastWarp: 0.55 },
  citystate: { featureScale: 2.6, warpStrength: 0.4, ridgedWeight: 0.3, falloffStart: 0.5, falloffEnd: 0.92, baseKeep: 0.36, sinkDepth: 0.34, coastWarp: 0.55 },
};
const RIDGE_SEED_SALT = 0x7fe9b2c5;
const COAST_SEED_SALT_X = 0x3c6ef35f;
const COAST_SEED_SALT_Y = 0x1b56c4e9;
const COAST_WARP_SCALE = 4.0;
const COAST_WARP_OCTAVES = 5;
const BASE_FBM_OCTAVES = 6;

// The count's lobes (Sub 3, Issue #852), as `out/844-breakdown/probe-lobes-2.ts` states them, with the dome's detail octaves added to the wobble so a close-up refines it the way it refines the dome.
export const LOBE_SEED_SALT = 0x5bd1e995;
export const LOBE_INSET = 0.14;
export const LOBE_COVERAGE = 0.3;
export const WOBBLE_IN_LOBE_UNITS = 0.5;
export const SUNK = { baseKeep: 0.2, sinkDepth: 0.4 } as const;
// The hard cut-out's floor: one value under every cell inside, so the land share's quantile lands on it whenever the shape covers less of the sheet than the share (`count-through-outline.md`, the cut-out arithmetic). Just under the lowest the noise reaches inside (e01 >= 0 less the detail octaves' excess, about 0.01), so the land keeps its own relief above the sea; a deep floor (-5 was tried) makes every land cell read as high ground, and the world grows no towns.
export const HARD_FLOOR = -0.05;

export type Lobe = { readonly cx: number; readonly cy: number; readonly r: number };

export type Edge =
  | { readonly kind: "dome" }
  | { readonly kind: "soft"; readonly outline: OutlineField }
  | { readonly kind: "hard"; readonly outline: OutlineField }
  | { readonly kind: "bias"; readonly outline: OutlineField; readonly strength: number }
  | { readonly kind: "lobes"; readonly lobes: ReadonlyArray<Lobe>; readonly sunk: boolean; readonly within?: OutlineField; readonly wobble?: LobeWobble };

// The designer's own direction, not ruled: a wobble that bites. Each island's coast is warped by noise at its own scale (SCALE noise units across the mean lobe radius) and by AMP lobe radii times the coast slider, so a counted island stops reading as a disc and the slider has something to do.
export type LobeWobble = { readonly scale: number; readonly amp: number };

export type TerrainInputs = { readonly seed: number; readonly mapType: MapType; readonly coastWarp?: number; readonly edge: Edge };
export type GridSpec = { readonly gridW: number; readonly gridH: number; readonly window?: UvWindow; readonly worldAspect?: number; readonly detail?: number };

export function edgeKey(edge: Edge): string {
  switch (edge.kind) {
    case "dome":
      return "dome";
    case "soft":
    case "hard":
      return `${edge.kind}:${edge.outline.outline.id}`;
    case "bias":
      return `bias${edge.strength}:${edge.outline.outline.id}`;
    case "lobes":
      return `lobes${edge.lobes.length}:${edge.sunk ? "sunk" : "measured"}:${edge.within?.outline.id ?? "-"}:${edge.wobble ? `${edge.wobble.scale}/${edge.wobble.amp}` : "-"}:${edge.lobes.map((l) => `${l.cx},${l.cy},${l.r}`).join(";")}`;
  }
}

type Settings = { seed: number; shape: Shape; coastWarp: number; detail: number; aspect: number; edge: Edge };

function warpAt(u: number, v: number, s: Settings): readonly [number, number] {
  const { seed, detail, aspect } = s;
  const wx = fbm2(u * COAST_WARP_SCALE * aspect, v * COAST_WARP_SCALE, (seed ^ COAST_SEED_SALT_X) >>> 0, { octaves: COAST_WARP_OCTAVES + detail, normOctaves: COAST_WARP_OCTAVES });
  const wy = fbm2(u * COAST_WARP_SCALE * aspect + 41.7, v * COAST_WARP_SCALE + 17.3, (seed ^ COAST_SEED_SALT_Y) >>> 0, { octaves: COAST_WARP_OCTAVES + detail, normOctaves: COAST_WARP_OCTAVES });
  return [wx, wy];
}

// Today's dome, exactly as `coastDistance` draws it: half-sheet units, NOT aspect-corrected.
function domeDistance(u: number, v: number, s: Settings): number {
  const dx = (u - 0.5) * 2;
  const dy = (v - 0.5) * 2;
  if (s.coastWarp === 0) return Math.hypot(dx, dy);
  const [wx, wy] = warpAt(u, v, s);
  return Math.hypot(dx + s.coastWarp * wx, dy + s.coastWarp * wy);
}

// The soft likeness (D7). STAND-IN mapping, not ruled: the signed distance to the outline (sheet heights) is doubled into half-sheet units and offset so the outline's edge sits at the type's `falloffStart`; the dome's falloff then runs from the edge outward over the same (falloffEnd - falloffStart). The coast warp moves the sample point by exactly the displacement it gives the dome (cw * w half-sheets = cw * w / 2 of the sheet).
function outlineDistance(u: number, v: number, s: Settings, f: OutlineField): number {
  if (s.coastWarp === 0) return s.shape.falloffStart + 2 * signedDistance(f, u, v);
  const [wx, wy] = warpAt(u, v, s);
  return s.shape.falloffStart + 2 * signedDistance(f, u + (s.coastWarp * wx) / 2, v + (s.coastWarp * wy) / 2);
}

function lobeDistance(u: number, v: number, s: Settings, lobes: ReadonlyArray<Lobe>, wobble?: LobeWobble): number {
  let ax: number, ay: number;
  if (wobble === undefined) {
    const [wx, wy] = warpAt(u, v, s);
    ax = s.coastWarp * WOBBLE_IN_LOBE_UNITS * wx;
    ay = s.coastWarp * WOBBLE_IN_LOBE_UNITS * wy;
  } else {
    const r0 = lobes.reduce((t, l) => t + l.r, 0) / lobes.length;
    const f = wobble.scale / r0;
    const wx = fbm2(u * f * s.aspect, v * f, (s.seed ^ COAST_SEED_SALT_X) >>> 0, { octaves: COAST_WARP_OCTAVES + s.detail, normOctaves: COAST_WARP_OCTAVES });
    const wy = fbm2(u * f * s.aspect + 41.7, v * f + 17.3, (s.seed ^ COAST_SEED_SALT_Y) >>> 0, { octaves: COAST_WARP_OCTAVES + s.detail, normOctaves: COAST_WARP_OCTAVES });
    ax = s.coastWarp * wobble.amp * wx;
    ay = s.coastWarp * wobble.amp * wy;
  }
  let d = Infinity;
  for (const l of lobes) d = Math.min(d, Math.hypot(((u - l.cx) * s.aspect) / l.r + ax, (v - l.cy) / l.r + ay));
  return d;
}

function noiseAt(u: number, v: number, s: Settings): number {
  const { seed, shape, detail, aspect } = s;
  const nx = u * shape.featureScale * aspect;
  const ny = v * shape.featureScale;
  const base = warped2(nx, ny, seed, { octaves: BASE_FBM_OCTAVES + detail, normOctaves: BASE_FBM_OCTAVES, warpStrength: shape.warpStrength });
  const e01 = (base + 1) / 2;
  const ridge = ridged2(nx * 1.8 + 31.4, ny * 1.8 + 27.2, (seed ^ RIDGE_SEED_SALT) >>> 0, { octaves: 5 });
  return e01 + shape.ridgedWeight * ridge * smoothstep(0.52, 0.78, e01);
}

function edgeSink(u: number, v: number): number {
  const edge = Math.min(u, 1 - u, v, 1 - v);
  return (1 - smoothstep(0, 0.05, edge)) * 0.8;
}

function elevationAt(u: number, v: number, s: Settings): number {
  const e0 = noiseAt(u, v, s);
  const edge = s.edge;
  if (edge.kind === "hard") return isInside(edge.outline, u, v) ? e0 - edgeSink(u, v) : HARD_FLOOR;
  let d: number;
  let keep = s.shape.baseKeep;
  let sink = s.shape.sinkDepth;
  if (edge.kind === "dome") d = domeDistance(u, v, s);
  else if (edge.kind === "soft") d = outlineDistance(u, v, s, edge.outline);
  else if (edge.kind === "bias") d = lerp(domeDistance(u, v, s), outlineDistance(u, v, s, edge.outline), edge.strength);
  else {
    d = lobeDistance(u, v, s, edge.lobes, edge.wobble);
    if (edge.sunk) {
      keep = SUNK.baseKeep;
      sink = SUNK.sinkDepth;
    }
  }
  const falloff = 1 - smoothstep(s.shape.falloffStart, s.shape.falloffEnd, d);
  const e = e0 * lerp(keep, 1, falloff) - (1 - falloff) * sink;
  return e - edgeSink(u, v);
}

export function spikeHeightfield(inputs: TerrainInputs, grid: GridSpec): Field {
  const { gridW, gridH } = grid;
  const shape = SHAPES[inputs.mapType];
  const detail = grid.detail ?? 0;
  if (!Number.isInteger(detail) || detail < 0 || detail > MAX_DETAIL) throw new RangeError(`detail ${detail}`);
  const s: Settings = {
    seed: inputs.seed,
    shape,
    coastWarp: inputs.coastWarp ?? shape.coastWarp,
    detail,
    aspect: grid.worldAspect ?? (gridW - 1) / (gridH - 1),
    edge: inputs.edge,
  };
  const win = grid.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };
  return createField(gridW, gridH, (x, y) => {
    const u = win.u0 + (x / (gridW - 1)) * (win.u1 - win.u0);
    const v = win.v0 + (y / (gridH - 1)) * (win.v1 - win.v0);
    return elevationAt(u, v, s);
  });
}

// Placement from the SEED ALONE (probe-lobes-2's `placeLobes`), optionally kept inside an outline: a candidate outside it is redrawn, up to a bound, so a chain ancestor rebuilds the same lobes from the seed.
export function placeLobes(seed: number, n: number, spread: "equal" | "varied", coverage: number, within?: OutlineField): Lobe[] {
  const aspect = 319 / 239;
  const rng = createRng((seed ^ LOBE_SEED_SALT) >>> 0);
  const baseR = Math.sqrt((coverage * aspect) / (n * Math.PI));
  const lobes: Lobe[] = [];
  const draw = (): { cx: number; cy: number } => {
    for (let tries = 0; tries < 200; tries++) {
      const cx = rng.range(LOBE_INSET, 1 - LOBE_INSET);
      const cy = rng.range(LOBE_INSET, 1 - LOBE_INSET);
      if (within === undefined || isInside(within, cx, cy)) return { cx, cy };
    }
    throw new Error("no lobe centre found inside the outline");
  };
  for (let i = 0; i < n; i++) {
    let best = { cx: 0.5, cy: 0.5 };
    let bestD = -1;
    for (let k = 0; k < 24; k++) {
      const c = draw();
      let d = Infinity;
      for (const l of lobes) d = Math.min(d, Math.hypot((c.cx - l.cx) * aspect, c.cy - l.cy));
      if (lobes.length === 0) d = 1;
      if (d > bestD) {
        bestD = d;
        best = c;
      }
    }
    const r = spread === "equal" ? baseR : baseR * rng.range(0.45, 1.55);
    lobes.push({ ...best, r });
  }
  return lobes;
}
