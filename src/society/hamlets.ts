import { createRng, type Rng } from "../core/rng.ts";
import { NEIGHBORS_8, type Field } from "../core/grid.ts";
import { BIOMES } from "../climate/biomes.ts";
import { slopeField } from "../terrain/slope.ts";
import { clamp } from "../core/math.ts";
import type { UvWindow } from "../terrain/heightfield.ts";
import type { NamedSettlement, World } from "../world/types.ts";
import { BIOME_APPEAL, EDGE_MARGIN } from "./sites.ts";
import { createNamer, type Culture } from "./names.ts";

/**
 * Hamlets (#171): the smallest places, revealed only on the deepest zoom band's
 * regional surveys. Candidates sit on a fixed world-space lattice and each lattice
 * point is hashed independently off the world seed, so a hamlet's existence, spot,
 * and name never depend on which window asked or in what order — the same seed +
 * window yields byte-identical sheets on every machine. Screening runs against the
 * PARENT world grid (fixed per seed), never the window's fine grid, for the same
 * reason; only the final snap-to-land happens at region resolution, mirroring how
 * region.ts projects settlements.
 */

/** Lattice pitch in parent-world grid cells (world-space, window-independent). */
export const HAMLET_LATTICE_WORLD_CELLS = 5;

/** Minimum world-grid distance a hamlet keeps from every world settlement. */
export const HAMLET_SPACING_WORLD_CELLS = 2.5;

/** How far into its lattice cell a point may wander (fraction of the cell). At
 *  0.7, neighbours jittered toward each other still keep 0.3 cells apart. */
const JITTER = 0.7;

/** Acceptance scale against the site score below: flat grassland keeps roughly
 *  a third of its lattice points, steep desert almost none. The knob for overall
 *  density; measured over 16 seeds it yields a median of ~9 hamlets per
 *  deepest-band window (settlement-centred), max in the low 20s. */
const DENSITY = 0.22;

/** The same open-window inset region.ts applies when projecting settlements. */
const WINDOW_INSET = 0.02;

/** The same settled-elevation ceiling placeSettlements screens by. */
const MAX_ELEV_BAND = 0.6;

/** Name draws before a too-tight namespace drops the point instead. */
const NAME_DRAWS = 12;

/** A screened, named lattice point in world uv space (pre-projection). */
export type HamletCandidate = {
  readonly u: number;
  readonly v: number;
  readonly name: string;
  readonly harbor: boolean;
  readonly onRiver: boolean;
  readonly score: number;
  readonly founded: number;
};

/** Every name already spoken for on the world sheet, lowercased: settlements
 *  plus all feature names. The set is FIXED per seed, so a collision check
 *  against it is window-independent. */
export function worldNameSet(world: World): Set<string> {
  const taken = new Set<string>();
  for (const s of world.settlements) taken.add(s.name.toLowerCase());
  const n = world.names;
  taken.add(n.sea.toLowerCase());
  if (n.range) taken.add(n.range.toLowerCase());
  if (n.forest) taken.add(n.forest.toLowerCase());
  for (const name of n.rivers.values()) taken.add(name.toLowerCase());
  for (const lake of n.lakes) taken.add(lake.name.toLowerCase());
  for (const realm of n.realms) taken.add(realm.toLowerCase());
  return taken;
}

/** A hamlet's name: settlement-style draws until one clears `taken`, or null
 *  when the namespace is too tight (the point is dropped, never renamed — a
 *  rename would depend on retry order and break window-independence). */
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

/** The window's screened lattice candidates, in lattice order. Pure per-point:
 *  each candidate is a function of (world seed, lattice cell) alone. */
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

  // one cell of slack each side so a point jittered into the window still shows
  const ix0 = Math.max(0, Math.floor(u0 / stepU) - 1);
  const ix1 = Math.floor(u1 / stepU) + 1;
  const iy0 = Math.max(0, Math.floor(v0 / stepV) - 1);
  const iy1 = Math.floor(v1 / stepV) + 1;

  const out: HamletCandidate[] = [];
  for (let iy = iy0; iy <= iy1; iy++) {
    for (let ix = ix0; ix <= ix1; ix++) {
      // One fork per lattice cell, keyed by the cell alone, and a FIXED draw
      // order within it: existence, spot, and name depend on nothing but the
      // seed and the cell (the #171 covenant).
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

      // the same terrain appeal placeSettlements scores by, thresholded
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

      // a modest age: hamlets are recent places, never older than the chronicle
      const presentYear = world.title.year;
      const founded =
        presentYear - 8 - r.fork("age").int(Math.max(1, Math.min(240, presentYear - 16)));

      out.push({ u, v, name, harbor, onRiver, score, founded });
    }
  }
  return out;
}

/** Candidates projected onto the region grid (snap-to-land like region.ts does
 *  for settlements; unsnappable points drop), ready to append after the
 *  projected world settlements. */
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
    // fine-grid coastline may wiggle off the base grid's land: snap to a nearby
    // land cell or drop the point (the region.ts settlement precedent)
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
