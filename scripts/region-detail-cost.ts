import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../src/world/region.ts";
import { buildChainedField, canonicalParent, createChainCache } from "../src/world/detail-chain.ts";
import { LOD_BANDS, lodWindowFor, type LodBand } from "../src/world/lod.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";
import type { World } from "../src/world/types.ts";

/** The cost half of #400's acceptance: what a Glass descent costs on each arm, and what a chain cache shared ACROSS region jobs would buy. The browser number is the one that counts (the caption's "drawn in Nms"); this is the engine-side control that says where the time goes. Not in `npm test`: a chained band-3 region costs about a second and the whole run takes minutes. */

const SEEDS = [42, 2, 15, 23];
const REPEATS = 3;
const CX = 0.5625;
const CY = 0.4375;

function bestOf(runs: number, fn: () => void): number {
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn();
    best = Math.min(best, performance.now() - t0);
  }
  return best;
}

function regionAt(world: World, window: UvWindow, band: LodBand, detail: boolean): void {
  generateRegionWorld(world, {
    window,
    gridW: band.gridW,
    gridH: band.gridH,
    title: regionTitle(world, window),
    detail,
  });
}

const sameWindow = (a: UvWindow, b: UvWindow): boolean =>
  Math.abs(a.u0 - b.u0) < 1e-9 && Math.abs(a.v0 - b.v0) < 1e-9;

const DEEPEST = LOD_BANDS[LOD_BANDS.length - 1] as LodBand;
const STEP = DEEPEST.sizeUV / 8; // the lattice step quantizeCenter snaps to

/** The two kinds of neighbour a pan at the deepest band reaches: one whose canonical parent is the one just built, one whose is not. Which is which is a property of the lattice, so it is derived here rather than assumed. */
function neighbours(home: UvWindow): { readonly shared: UvWindow; readonly fresh: UvWindow } {
  const homeParent = canonicalParent(home);
  let shared: UvWindow | null = null;
  let fresh: UvWindow | null = null;
  for (const sign of [-1, 1]) {
    const win = lodWindowFor(CX + sign * STEP, CY, DEEPEST.sizeUV);
    if (sameWindow(canonicalParent(win), homeParent)) shared ??= win;
    else fresh ??= win;
  }
  if (!shared || !fresh) throw new Error("the lattice gave no pair of neighbours to contrast");
  return { shared, fresh };
}

function fmt(n: number): string {
  return `${n.toFixed(0)}`.padStart(6);
}

function main(): void {
  console.log(`region draw cost, best of ${REPEATS}, ms; centre (${CX}, ${CY})`);
  console.log("");
  const totals = new Map<string, { bare: number; detail: number; n: number }>();
  const cacheTotals = { cold: 0, shared: 0, fresh: 0, n: 0 };

  for (const seed of SEEDS) {
    const world = generateWorld(defaultRecipe(seed));
    const worldAspect = (world.recipe.gridW - 1) / (world.recipe.gridH - 1);

    console.log(`seed ${seed}`);
    console.log("  a whole region draw, as the Glass dispatches it today (fresh chain cache per call)");
    for (const band of LOD_BANDS.slice(1)) {
      const window = lodWindowFor(CX, CY, band.sizeUV);
      const bare = bestOf(REPEATS, () => regionAt(world, window, band, false));
      const detail = bestOf(REPEATS, () => regionAt(world, window, band, true));
      const label = `band ${band.index}`;
      console.log(`    ${label.padEnd(16)} bare ${fmt(bare)}   detail ${fmt(detail)}   x${(detail / bare).toFixed(1)}`);
      const acc = totals.get(label) ?? { bare: 0, detail: 0, n: 0 };
      totals.set(label, { bare: acc.bare + bare, detail: acc.detail + detail, n: acc.n + 1 });
    }

    // What a chain cache LIVING ACROSS region jobs would buy, terrain only. A pan at the
    // deepest band reaches two kinds of neighbour and they are not the same price.
    const chainSpec = (window: UvWindow, band: LodBand): Parameters<typeof buildChainedField>[0] => ({
      seed: world.recipe.seed,
      mapType: world.recipe.mapType,
      window,
      gridW: band.gridW,
      gridH: band.gridH,
      worldAspect,
      seaLevel: world.seaLevel,
    });
    const home = lodWindowFor(CX, CY, DEEPEST.sizeUV);
    const { shared, fresh } = neighbours(home);
    const cache = createChainCache(64);
    const cold = bestOf(1, () => buildChainedField(chainSpec(home, DEEPEST), cache));
    const warmShared = bestOf(1, () => buildChainedField(chainSpec(shared, DEEPEST), cache));
    const warmFresh = bestOf(1, () => buildChainedField(chainSpec(fresh, DEEPEST), cache));
    console.log("  terrain only, one chain cache held across the calls");
    console.log(
      `    ${"first descent".padEnd(16)} ${fmt(cold)}   pan to a neighbour sharing its parent ${fmt(warmShared)}   pan to one that does not ${fmt(warmFresh)}`,
    );
    console.log("");
    cacheTotals.cold += cold;
    cacheTotals.shared += warmShared;
    cacheTotals.fresh += warmFresh;
    cacheTotals.n++;
  }

  console.log("mean over seeds, whole region draw");
  for (const [label, acc] of totals) {
    console.log(
      `  ${label.padEnd(16)} bare ${fmt(acc.bare / acc.n)}   detail ${fmt(acc.detail / acc.n)}   x${(acc.detail / acc.bare).toFixed(1)}`,
    );
  }
  console.log("mean over seeds, terrain only with a held cache");
  console.log(
    `  ${"band 3".padEnd(16)} first ${fmt(cacheTotals.cold / cacheTotals.n)}   parent-sharing pan ${fmt(cacheTotals.shared / cacheTotals.n)}   fresh-parent pan ${fmt(cacheTotals.fresh / cacheTotals.n)}`,
  );
}

main();
