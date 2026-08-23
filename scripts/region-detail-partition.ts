import { type Field } from "../src/core/grid.ts";
import { buildHeightfield, type UvWindow } from "../src/terrain/heightfield.ts";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { labelLandmasses } from "../src/world/landmass.ts";
import { floorToParent, parentSurfaceOnWindow, rejectBridges } from "../src/terrain/detail-guarantees.ts";
import {
  ancestorWindows,
  buildChainedField,
  createChainCache,
  detailForWindow,
  maxOfSurfaces,
  type ChainSpec,
} from "../src/world/detail-chain.ts";
import { LOD_BANDS, lodWindowFor, type LodBand } from "../src/world/lod.ts";
import type { World } from "../src/world/types.ts";

/** #443's measurement half: the world chart's OWN partition, before and after the fix, so the anti-merge claim and the vanishing-landmass census both reproduce from one command. Committed rather than left in a worktree's out/, because this epic has lost its evidence twice, once with #376's prototype scratchpad and once with #443's own probes, and both had to be re-earned.
 *
 * `before` rebuilds the construction #397 and #398 shipped: an UNGATED bilinear floor rejected against that same blurred max. That is expressible with today's exports, so no revert is needed to reproduce the comparison.
 *
 * Costs minutes. Not in `npm test`; the unit-scale versions of these claims are in test/world/detail-chain-world.test.ts. */


function gridForWindow(win: UvWindow): { gridW: number; gridH: number } {
  const size = win.u1 - win.u0;
  const b = LOD_BANDS.find((x) => Math.abs(x.sizeUV - size) < 1e-9) ?? (LOD_BANDS[0] as LodBand);
  return { gridW: b.gridW, gridH: b.gridH };
}

function buildOldField(spec: ChainSpec, cache: Map<string, Field>): Field {
  const w = spec.window;
  const key = [w.u0, w.v0, w.u1, w.v1].join("|");
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const bare = buildHeightfield({
    seed: spec.seed, gridW: spec.gridW, gridH: spec.gridH, mapType: spec.mapType,
    window: spec.window, worldAspect: spec.worldAspect, detail: detailForWindow(spec.window),
  });
  const ancestors = ancestorWindows(spec.window);
  let out = bare;
  if (ancestors.length > 0) {
    const surfaces = ancestors.map((aw) =>
      parentSurfaceOnWindow(buildOldField({ ...spec, window: aw, ...gridForWindow(aw) }, cache), aw, spec.window, spec.gridW, spec.gridH),
    );
    const coarse = maxOfSurfaces(surfaces, spec.gridW, spec.gridH);
    out = rejectBridges(coarse, coarse, floorToParent(bare, coarse), spec.seaLevel);
  }
  cache.set(key, out);
  return out;
}

type Tally = { fused: number; lost: number; drowned: number; masses: number };

type LostMass = {
  readonly seed: number;
  readonly band: number;
  readonly arm: string;
  readonly window: UvWindow;
  readonly id: number;
  readonly worldCells: number;
  readonly regionCellsInWindow: number;
};

function tally(
  world: World,
  field: Field,
  window: UvWindow,
  worldIds: Int32Array,
  worldSizes: ReadonlyArray<number>,
  lost: LostMass[],
  seed: number,
  band: number,
  arm: string,
): Tally {
  const { gridW, gridH } = { gridW: field.w, gridH: field.h };
  const sea = world.seaLevel;
  const Ww = world.recipe.gridW;
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const ids = labelLandmasses(field, sea).ids;
  const coveredBy = new Map<number, Set<number>>();
  const present = new Map<number, number>();
  const alive = new Set<number>();
  let drowned = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const i = gx + gy * gridW;
      const u = window.u0 + (gx / (gridW - 1)) * du;
      const v = window.v0 + (gy / (gridH - 1)) * dv;
      const wi = Math.round(u * (Ww - 1)) + Math.round(v * (world.recipe.gridH - 1)) * Ww;
      const wid = worldIds[wi] as number;
      if (wid < 0) continue;
      present.set(wid, (present.get(wid) ?? 0) + 1);
      const rid = ids[i] as number;
      if (rid < 0) { drowned++; continue; }
      alive.add(wid);
      let s = coveredBy.get(rid);
      if (s === undefined) { s = new Set(); coveredBy.set(rid, s); }
      s.add(wid);
    }
  }
  for (const [id, cells] of present) {
    if (alive.has(id)) continue;
    lost.push({
      seed, band, arm, window, id,
      worldCells: worldSizes[id] as number,
      regionCellsInWindow: cells,
    });
  }
  return {
    fused: [...coveredBy.values()].reduce((a, s) => a + Math.max(0, s.size - 1), 0),
    lost: present.size - alive.size,
    drowned,
    masses: present.size,
  };
}

const SEEDS = [42, 7, 2, 15, 23];
const ARMS = ["bare", "before", "after"] as const;
type Arm = (typeof ARMS)[number];
const rows = new Map<number, Record<Arm, Tally>>();
const lost: LostMass[] = [];
const zero = (): Tally => ({ fused: 0, lost: 0, drowned: 0, masses: 0 });
for (const band of [1, 2, 3]) rows.set(band, { bare: zero(), before: zero(), after: zero() });

for (const seed of SEEDS) {
  const world = generateWorld(defaultRecipe(seed));
  const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);
  const { ids: worldIds, sizes: worldSizes } = labelLandmasses(world.elev, world.seaLevel);
  const oldCache = new Map<string, Field>();
  const newCache = createChainCache(400);
  for (const idx of [1, 2, 3]) {
    const band = LOD_BANDS[idx] as LodBand;
    const n = Math.round(1 / band.sizeUV);
    const row = rows.get(idx) as Record<Arm, Tally>;
    for (let iy = 0; iy < n; iy++) {
      for (let ix = 0; ix < n; ix++) {
        const win = lodWindowFor((ix + 0.5) * band.sizeUV, (iy + 0.5) * band.sizeUV, band.sizeUV);
        const spec: ChainSpec = {
          seed, mapType: world.recipe.mapType, window: win,
          gridW: band.gridW, gridH: band.gridH, worldAspect, seaLevel: world.seaLevel,
        };
        // The SHIPPED bare arm takes no `detail` at all, matching region.ts for detail:false; passing the octaves here would measure an arm nothing draws.
        const arms: ReadonlyArray<readonly [Arm, Field]> = [
          ["bare", buildHeightfield({
            seed, gridW: band.gridW, gridH: band.gridH, mapType: world.recipe.mapType,
            window: win, worldAspect,
          })],
          ["before", buildOldField(spec, oldCache)],
          ["after", buildChainedField(spec, newCache)],
        ];
        for (const [key, f] of arms) {
          const t = tally(world, f, win, worldIds, worldSizes, lost, seed, idx, key);
          const acc = row[key];
          acc.fused += t.fused;
          acc.lost += t.lost;
          acc.drowned += t.drowned;
          acc.masses += t.masses;
        }
      }
    }
    console.error(`seed ${seed} band ${idx} done`);
  }
}

console.log("band  arm     worldFusedPairs  worldMassesLost  worldLandCellsDrowned  worldMassesInWindow");
for (const [band, byArm] of rows) {
  for (const arm of ARMS) {
    const t = byArm[arm];
    console.log(
      `${String(band).padStart(4)}  ${arm.padEnd(6)}  ${String(t.fused).padStart(13)}  ${String(t.lost).padStart(15)}  ${String(t.drowned).padStart(21)}  ${String(t.masses).padStart(19)}`,
    );
  }
}

console.log("\nevery world landmass that loses all its land, with the footprint it had in that window:");
for (const l of lost.sort((a, b) => a.band - b.band || a.seed - b.seed || a.id - b.id)) {
  console.log(
    `  band ${l.band} ${l.arm.padEnd(6)} seed ${String(l.seed).padStart(2)} window ${l.window.u0.toFixed(3)},${l.window.v0.toFixed(3)}` +
    ` id ${String(l.id).padStart(3)}: ${l.worldCells} world cells, ${l.regionCellsInWindow} region cells in window`,
  );
}
