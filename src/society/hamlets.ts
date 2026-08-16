import { createRng, type Rng } from "../core/rng.ts";
import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { BIOMES } from "../climate/biomes.ts";
import { slopeField } from "../terrain/slope.ts";
import { clamp } from "../core/math.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { FeatureNames, NamedSettlement, World } from "../world/types.ts";
import { BIOME_APPEAL, EDGE_MARGIN } from "./sites.ts";
import { createNamer, type Culture } from "./names.ts";

export const HAMLET_LATTICE_WORLD_CELLS = 5;

export const HAMLET_SPACING_WORLD_CELLS = 2.5;

const JITTER = 0.7;

const DENSITY = 0.22;

/** The same open-window inset region.ts applies when projecting settlements. */
const WINDOW_INSET = 0.02;

const MAX_ELEV_BAND = 0.6;

const NAME_DRAWS = 12;

export type HamletCandidate = {
  readonly u: number;
  readonly v: number;
  readonly name: string;
  readonly harbor: boolean;
  readonly onRiver: boolean;
  readonly score: number;
  readonly founded: number;
};

export function nameSetOf(
  settlements: ReadonlyArray<NamedSettlement>,
  n: FeatureNames,
): Set<string> {
  const taken = new Set<string>();
  for (const s of settlements) {
    taken.add(s.name.toLowerCase());
    if (s.formerName) taken.add(s.formerName.toLowerCase());
  }
  taken.add(n.sea.toLowerCase());
  if (n.range) taken.add(n.range.toLowerCase());
  if (n.forest) taken.add(n.forest.toLowerCase());
  for (const name of n.rivers.values()) taken.add(name.toLowerCase());
  for (const lake of n.lakes) taken.add(lake.name.toLowerCase());
  for (const realm of n.realms) taken.add(realm.toLowerCase());
  return taken;
}

export function worldNameSet(world: World): Set<string> {
  return nameSetOf(world.settlements, world.names);
}

/** Null when the namespace is too tight: the point is dropped, never renamed, or retry order would break window-independence. */
export function hamletName(
  rng: Rng,
  culture: Culture,
  taken: ReadonlySet<string>,
): string | null {
  const namer = createNamer(rng, culture);
  for (let i = 0; i < NAME_DRAWS; i++) {
    const name = namer.name("settlement");
    if (!taken.has(name.toLowerCase())) return name;
  }
  return null;
}

export function hamletCandidates(world: World, window: UvWindow): HamletCandidate[] {
  const { seed, gridW, gridH } = world.recipe;
  const { data } = world.elev;
  const slope = slopeField(world.elev);
  const taken = worldNameSet(world);
  const root = createRng(seed);

  let worldMax = -Infinity;
  for (const v of data) worldMax = Math.max(worldMax, v as number);
  const span = Math.max(1e-9, worldMax - world.seaLevel);

  const stepU = HAMLET_LATTICE_WORLD_CELLS / (gridW - 1);
  const stepV = HAMLET_LATTICE_WORLD_CELLS / (gridH - 1);
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const u0 = window.u0 + du * WINDOW_INSET;
  const u1 = window.u1 - du * WINDOW_INSET;
  const v0 = window.v0 + dv * WINDOW_INSET;
  const v1 = window.v1 - dv * WINDOW_INSET;

  const ix0 = Math.max(0, Math.floor(u0 / stepU) - 1);
  const ix1 = Math.floor(u1 / stepU) + 1;
  const iy0 = Math.max(0, Math.floor(v0 / stepV) - 1);
  const iy1 = Math.floor(v1 / stepV) + 1;

  const out: HamletCandidate[] = [];
  for (let iy = iy0; iy <= iy1; iy++) {
    for (let ix = ix0; ix <= ix1; ix++) {
      // One fork per lattice cell, FIXED draw order within it: reordering draws re-rolls every hamlet.
      const r = root.fork(`hamlet:${ix},${iy}`);
      const roll = r.next();
      const ju = r.next();
      const jv = r.next();
      const u = (ix + 0.5 + (ju - 0.5) * JITTER) * stepU;
      const v = (iy + 0.5 + (jv - 0.5) * JITTER) * stepV;
      if (u < u0 || u > u1 || v < v0 || v > v1) continue;

      const wx = Math.round(u * (gridW - 1));
      const wy = Math.round(v * (gridH - 1));
      if (
        wx < EDGE_MARGIN || wy < EDGE_MARGIN ||
        wx >= gridW - EDGE_MARGIN || wy >= gridH - EDGE_MARGIN
      ) {
        continue;
      }
      const i = wx + wy * gridW;
      const e = data[i] as number;
      if (e <= world.seaLevel) continue;
      const biome = world.biomes[i] as number;
      if (biome === BIOMES.snow || biome === BIOMES.alpine) continue;
      if ((e - world.seaLevel) / span > MAX_ELEV_BAND) continue;

      const score =
        (1 - Math.min(1, (slope.data[i] as number) * 8)) +
        (BIOME_APPEAL[biome] ?? 0.3);
      if (roll >= DENSITY * score) continue;

      const tooNear = world.settlements.some(
        (s) =>
          Math.hypot(s.x - u * (gridW - 1), s.y - v * (gridH - 1)) <
          HAMLET_SPACING_WORLD_CELLS,
      );
      if (tooNear) continue;

      let harbor = false;
      let riverNear = false;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = wx + dx;
        const ny = wy + dy;
        if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;
        const ni = nx + ny * gridW;
        if ((data[ni] as number) <= world.seaLevel) harbor = true;
        if (world.riverCells[ni] === 1) riverNear = true;
      }
      const onRiver = world.riverCells[i] === 1 || riverNear;

      const name = hamletName(r.fork("name"), world.culture, taken);
      if (name === null) continue;

      const presentYear = world.title.year;
      const founded =
        presentYear - 8 - r.fork("age").int(Math.max(1, Math.min(240, presentYear - 16)));

      out.push({ u, v, name, harbor, onRiver, score, founded });
    }
  }
  return out;
}

export function placeHamlets(
  world: World,
  window: UvWindow,
  elev: Field,
  seaLevel: number,
): NamedSettlement[] {
  const candidates = hamletCandidates(world, window);
  if (candidates.length === 0) return [];
  const gridW = elev.w;
  const gridH = elev.h;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;

  const out: NamedSettlement[] = [];
  for (const c of candidates) {
    let gx = Math.round(((c.u - window.u0) / du) * (gridW - 1));
    let gy = Math.round(((c.v - window.v0) / dv) * (gridH - 1));
    if ((elev.data[gx + gy * gridW] as number) <= seaLevel) {
      let snapped = false;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = clamp(gx + dx, 0, gridW - 1);
        const ny = clamp(gy + dy, 0, gridH - 1);
        if ((elev.data[nx + ny * gridW] as number) > seaLevel) {
          gx = nx;
          gy = ny;
          snapped = true;
          break;
        }
      }
      if (!snapped) continue;
    }
    out.push({
      x: gx,
      y: gy,
      kind: "hamlet",
      harbor: c.harbor,
      onRiver: c.onRiver,
      score: c.score,
      name: c.name,
      founded: c.founded,
      ruined: false,
    });
  }
  return out;
}
