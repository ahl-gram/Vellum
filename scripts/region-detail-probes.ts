import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { buildHeightfield, type UvWindow } from "../src/terrain/heightfield.ts";
import { buildChainedField, detailForWindow } from "../src/world/detail-chain.ts";
import { parentSurfaceOnWindow } from "../src/terrain/detail-guarantees.ts";
import { landSnapRadius, snapToLand } from "../src/world/snap-to-land.ts";
import { hamletCandidates } from "../src/society/hamlets.ts";
import { windowAround } from "../src/world/region.ts";
import { FULL_WINDOW, LOD_BANDS, lodWindowFor, type LodBand } from "../src/world/lod.ts";
import type { World } from "../src/world/types.ts";

/** The two follow-up isolations behind #399's PR and its comment on #443. Committed rather than left in a worktree's out/, because #376's prototype numbers and #443's probes both died with their scratchpads and had to be re-earned. `npm run check` does not cover scripts/; type-check by hand against tsconfig's options if you edit this. */

const SEEDS = [42, 7, 2, 15, 23];
const INSET = 0.02; // region.ts's own open-window inset
const ATLAS_SIZE = 0.38; // src/atlas/compose.ts:149

/** Does the band-scaled snap radius rescue anything the old radius-1 scan dropped? Bare field only: that is what ships today, so a nonzero answer is a change to sheets Alex can already see. */
function counterfactual(): void {
  type Row = { onWater: number; rescued: number; lostAnyway: number; radius: number };
  const tally = new Map<string, Row>();
  const rescued: string[] = [];

  const count = (world: World, label: string, window: UvWindow, gridW: number, gridH: number): void => {
    const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);
    const elev = buildHeightfield({
      seed: world.recipe.seed, gridW, gridH, mapType: world.recipe.mapType, window, worldAspect,
    });
    const du = window.u1 - window.u0;
    const dv = window.v1 - window.v0;
    const radius = landSnapRadius(gridW, window, world.recipe.gridW);
    const row = tally.get(label) ?? { onWater: 0, rescued: 0, lostAnyway: 0, radius };
    row.radius = radius;

    const probe = (u: number, v: number, who: string): void => {
      if (u < window.u0 + du * INSET || u > window.u1 - du * INSET) return;
      if (v < window.v0 + dv * INSET || v > window.v1 - dv * INSET) return;
      const gx = Math.round(((u - window.u0) / du) * (gridW - 1));
      const gy = Math.round(((v - window.v0) / dv) * (gridH - 1));
      if ((elev.data[gx + gy * gridW] as number) > world.seaLevel) return;
      row.onWater++;
      const at1 = snapToLand(elev, world.seaLevel, gx, gy, 1);
      const atR = snapToLand(elev, world.seaLevel, gx, gy, radius);
      if (at1 === null && atR !== null) {
        row.rescued++;
        rescued.push(`${who} (seed ${world.recipe.seed}, ${label}, region cell ${gx},${gy})`);
      } else if (at1 === null && atR === null) {
        row.lostAnyway++;
      }
    };

    for (const s of world.settlements) {
      probe(s.x / (world.recipe.gridW - 1), s.y / (world.recipe.gridH - 1), `town ${s.name}`);
    }
    const deepest = (LOD_BANDS[LOD_BANDS.length - 1] as LodBand).sizeUV;
    if (du <= deepest + 1e-9) {
      for (const c of hamletCandidates(world, window)) probe(c.u, c.v, `hamlet ${c.name}`);
    }
    tally.set(label, row);
  };

  for (const seed of SEEDS) {
    const world = generateWorld(defaultRecipe(seed));
    for (const idx of [1, 2, 3]) {
      const band = LOD_BANDS[idx] as LodBand;
      const n = Math.round(1 / band.sizeUV);
      for (let iy = 0; iy < n; iy++) {
        for (let ix = 0; ix < n; ix++) {
          const window = lodWindowFor((ix + 0.5) * band.sizeUV, (iy + 0.5) * band.sizeUV, band.sizeUV);
          count(world, `band ${idx}`, window, band.gridW, band.gridH);
        }
      }
    }
    const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0];
    if (capital === undefined) continue;
    const far = world.settlements.reduce((a, b) =>
      Math.hypot(b.x - capital.x, b.y - capital.y) > Math.hypot(a.x - capital.x, a.y - capital.y) ? b : a,
    );
    for (const anchor of [capital, far]) {
      count(world, `atlas ${ATLAS_SIZE}`, windowAround(world, anchor, ATLAS_SIZE), world.recipe.gridW, world.recipe.gridH);
    }
  }

  for (const line of rescued) console.log(`rescued: ${line}`);
  for (const [k, v] of [...tally].sort()) {
    console.log(`${k} radius=${v.radius} landingOnWater=${v.onWater} rescuedByTheNewRadius=${v.rescued} droppedEitherWay=${v.lostAnyway}`);
  }
}

/** Which term of the chained construction lifts a parent water cell above the waterline. The two cells are the river mouths #399's sweep could not walk to water; the answer is on #443. */
function mouthMechanism(): void {
  const cases: ReadonlyArray<readonly [number, UvWindow, number, number]> = [
    [15, lodWindowFor(0.4375, 0.1875, 0.125), 115, 105],
    [23, lodWindowFor(0.6875, 0.4375, 0.125), 61, 195],
  ];
  for (const [seed, window, tx, ty] of cases) {
    const world = generateWorld(defaultRecipe(seed));
    const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);
    const common = { seed, gridW: 320, gridH: 240, mapType: world.recipe.mapType, window, worldAspect };
    const i = tx + ty * 320;
    const worldField = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: world.recipe.mapType, worldAspect });
    const surface = parentSurfaceOnWindow(worldField, FULL_WINDOW, window, 320, 240);
    const chained = buildChainedField({
      seed, mapType: world.recipe.mapType, window, gridW: 320, gridH: 240, worldAspect, seaLevel: world.seaLevel,
    });
    const d = (v: number): string => (v - world.seaLevel).toFixed(5);
    console.log(
      `seed ${seed} cell (${tx},${ty}) detail=${detailForWindow(window)}`,
      `bare=${d(buildHeightfield(common).data[i] as number)}`,
      `bare+octaves=${d(buildHeightfield({ ...common, detail: detailForWindow(window) }).data[i] as number)}`,
      `band0BilinearFloor=${d(surface.data[i] as number)}`,
      `chained=${d(chained.data[i] as number)}`,
    );
  }
}

const mode = process.argv[2];
if (mode === "counterfactual") counterfactual();
else if (mode === "mouths") mouthMechanism();
else {
  console.error("usage: node scripts/region-detail-probes.ts <counterfactual|mouths>");
  process.exitCode = 1;
}
