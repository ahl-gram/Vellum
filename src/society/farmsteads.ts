import { createRng } from "../core/rng.ts";
import type { Field } from "../core/grid.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import { landSnapRadius, snapToStandingLand, type Footprint } from "../world/snap-to-land.ts";
import type { NamedSettlement, World } from "../world/types.ts";
import {
  HAMLET_LATTICE_WORLD_CELLS,
  hamletGround,
  hamletName,
  hamletSite,
  hamletSpotAt,
  worldNameSet,
  type HamletGround,
} from "./hamlets.ts";

const FARMSTEAD_LATTICE_WORLD_CELLS = 1;
const FARMSTEAD_DENSITY = 0.11;
export const FARMSTEAD_SPACING_WORLD_CELLS = 0.45;
export const MILL_REACH_WORLD_CELLS = 0.18;
export const FARMSTEAD_MAX_WINDOW_UV = 1 / 32;

export const MARK_FOOTPRINT: Footprint = { up: 3, down: 2, side: 2 };

const JITTER = 0.7;

const WINDOW_INSET = 0.02;

export type FarmsteadCandidate = {
  readonly u: number;
  readonly v: number;
  readonly name: string;
  readonly score: number;
  readonly founded: number;
};

type Spot = { readonly x: number; readonly y: number };

type HamletSpots = (hx: number, hy: number) => Spot | null;

function hamletSpotsOf(world: World, ground: HamletGround, taken: ReadonlySet<string>): HamletSpots {
  const spots = new Map<string, Spot | null>();
  return (hx, hy) => {
    const key = `${hx},${hy}`;
    if (!spots.has(key)) spots.set(key, hamletSpotAt(world, ground, taken, hx, hy));
    return spots.get(key) ?? null;
  };
}

function farmsteadAt(
  world: World,
  ground: HamletGround,
  ix: number,
  iy: number,
  taken: ReadonlySet<string>,
  hamlets: HamletSpots,
): FarmsteadCandidate | null {
  const { gridW, gridH, seed } = world.recipe;
  const r = createRng(seed).fork(`farmstead:${ix},${iy}`);
  const roll = r.next();
  const ju = r.next();
  const jv = r.next();
  const x = (ix + 0.5 + (ju - 0.5) * JITTER) * FARMSTEAD_LATTICE_WORLD_CELLS;
  const y = (iy + 0.5 + (jv - 0.5) * JITTER) * FARMSTEAD_LATTICE_WORLD_CELLS;

  const score = hamletSite(world, ground, Math.round(x), Math.round(y));
  if (score === null || roll >= FARMSTEAD_DENSITY * score) return null;

  const spacing2 = FARMSTEAD_SPACING_WORLD_CELLS ** 2;
  if (world.settlements.some((s) => (s.x - x) ** 2 + (s.y - y) ** 2 < spacing2)) return null;
  const hamlet = hamlets(Math.floor(x / HAMLET_LATTICE_WORLD_CELLS), Math.floor(y / HAMLET_LATTICE_WORLD_CELLS));
  if (hamlet !== null && (hamlet.x - x) ** 2 + (hamlet.y - y) ** 2 < spacing2) return null;

  const name = hamletName(r.fork("name"), world.culture, taken);
  if (name === null) return null;

  const presentYear = world.title.year;
  const founded = presentYear - 8 - r.fork("age").int(Math.max(1, Math.min(240, presentYear - 16)));
  return { u: x / (gridW - 1), v: y / (gridH - 1), name, score, founded };
}

export function farmsteadCandidates(world: World, window: UvWindow): FarmsteadCandidate[] {
  const { gridW, gridH } = world.recipe;
  const ground = hamletGround(world);
  const taken = worldNameSet(world);
  const hamlets = hamletSpotsOf(world, ground, taken);
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const u0 = window.u0 + du * WINDOW_INSET;
  const u1 = window.u1 - du * WINDOW_INSET;
  const v0 = window.v0 + dv * WINDOW_INSET;
  const v1 = window.v1 - dv * WINDOW_INSET;

  const ix0 = Math.max(0, Math.floor((u0 * (gridW - 1)) / FARMSTEAD_LATTICE_WORLD_CELLS) - 1);
  const ix1 = Math.floor((u1 * (gridW - 1)) / FARMSTEAD_LATTICE_WORLD_CELLS) + 1;
  const iy0 = Math.max(0, Math.floor((v0 * (gridH - 1)) / FARMSTEAD_LATTICE_WORLD_CELLS) - 1);
  const iy1 = Math.floor((v1 * (gridH - 1)) / FARMSTEAD_LATTICE_WORLD_CELLS) + 1;
  const out: FarmsteadCandidate[] = [];
  for (let iy = iy0; iy <= iy1; iy++) {
    for (let ix = ix0; ix <= ix1; ix++) {
      const c = farmsteadAt(world, ground, ix, iy, taken, hamlets);
      if (c !== null && c.u >= u0 && c.u <= u1 && c.v >= v0 && c.v <= v1) out.push(c);
    }
  }
  return out;
}

function nearestRiverCell(riverCells: Uint8Array, w: number, h: number, x: number, y: number, reach2: number): number {
  const span = Math.ceil(Math.sqrt(reach2));
  let best = -1;
  let bestD2 = Infinity;
  for (let cy = Math.max(0, y - span); cy <= Math.min(h - 1, y + span); cy++) {
    for (let cx = Math.max(0, x - span); cx <= Math.min(w - 1, x + span); cx++) {
      const d2 = (cx - x) ** 2 + (cy - y) ** 2;
      if (d2 <= reach2 && d2 < bestD2 && riverCells[cx + cy * w] === 1) {
        best = cx + cy * w;
        bestD2 = d2;
      }
    }
  }
  return best;
}

export function placeFarmsteads(
  world: World,
  window: UvWindow,
  ground: { readonly elev: Field; readonly seaLevel: number; readonly riverCells: Uint8Array },
): NamedSettlement[] {
  const { elev, seaLevel, riverCells } = ground;
  const w = elev.w;
  const h = elev.h;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const cellsPerWorldCell = (w - 1) / (du * (world.recipe.gridW - 1));
  const reach2 = (MILL_REACH_WORLD_CELLS * cellsPerWorldCell) ** 2;
  const radius = landSnapRadius(w, window, world.recipe.gridW);

  const out: NamedSettlement[] = [];
  for (const c of farmsteadCandidates(world, window)) {
    const gx = Math.round(((c.u - window.u0) / du) * (w - 1));
    const gy = Math.round(((c.v - window.v0) / dv) * (h - 1));
    const cell = snapToStandingLand(elev, seaLevel, gx, gy, radius, MARK_FOOTPRINT);
    if (cell === null) continue;
    const mill = nearestRiverCell(riverCells, w, h, cell.x, cell.y, reach2) >= 0;
    out.push({
      x: cell.x,
      y: cell.y,
      kind: mill ? "mill" : "farmstead",
      harbor: false,
      onRiver: mill,
      score: c.score,
      name: c.name,
      founded: c.founded,
      ruined: false,
    });
  }
  return out;
}
