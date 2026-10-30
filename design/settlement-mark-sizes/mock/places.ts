// Issue #1104 round: the places the sitting looks at, chosen by out/1104/sweep-windows.ts and out/1104/measure/seat-spacing.ts, and the engine calls that draw them exactly as the Explorer and the atlas do.
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle, windowAround } from "../../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../../src/world/lod.ts";
import { createChainCache, type ChainCache } from "../../../src/world/detail-chain.ts";
import { renderMap } from "../../../src/render/map-renderer.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import type { StyleName } from "../../../src/render/style.ts";
import type { World } from "../../../src/world/types.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";

export type Place = {
  readonly key: string;
  readonly seed: number;
  readonly anchor: string;
  readonly band5: { readonly u0: number; readonly v0: number };
  readonly why: string;
  readonly crops: ReadonlyArray<{ readonly names: readonly string[]; readonly what: string }>;
};

export const PLACES: readonly Place[] = [
  {
    key: "aelegwei",
    seed: 56,
    anchor: "Aelegwei",
    band5: { u0: 191 / 256, v0: 183 / 256 },
    why: "the capital Aelegwei with a village, a hamlet, six farmsteads and a mill, three of them within a crop of it (out/1104/sweep-windows.ts 1 150 1 2)",
    crops: [
      { names: ["Aelegwei", "Weilasmere", "Fene"], what: "the capital Aelegwei, the farmstead Fene, the mill Weilasmere" },
      { names: ["Brielorae"], what: "the hamlet Brielorae (the village Aeleiril lies under the cartouche on this sheet)" },
    ],
  },
  {
    key: "leal",
    seed: 84,
    anchor: "Leal",
    band5: { u0: 132 / 256, v0: 166 / 256 },
    why: "the capital Leal beside the town Liomiomere (the key is drawn over the town, and the mill Talair over the capital), with a hamlet, eight farmsteads and a mill: of the two capital-or-seat and town pairs in seeds 1 to 150 near enough to share a deepest-band window (out/1104/measure/seat-spacing.ts 1 150), the only one some lattice window holds (out/1104/measure/pair-windows.ts: seven windows on chart 84, none on chart 83)",
    crops: [
      { names: ["Leal", "Maromorca"], what: "the capital Leal, the mill Talair drawn on it, the farmstead Maromorca" },
      { names: ["Liomiomere"], what: "the town Liomiomere, under the key" },
    ],
  },
  {
    key: "fiela",
    seed: 75,
    anchor: "Fiela",
    band5: { u0: 202 / 256, v0: 130 / 256 },
    why: "the town Fiela with a village, a hamlet, thirteen farmsteads and two mills (out/1104/sweep-windows.ts 1 150 1 2)",
    crops: [
      { names: ["Fiela", "Fenewenglade", "Loriefene", "Feniefehollow"], what: "the town Fiela, the farmsteads Fenewenglade and Loriefene, the mill Feniefehollow" },
      { names: ["Aelefenae", "Wieth"], what: "the village Aelefenae and the hamlet Wieth" },
    ],
  },
  {
    key: "vyrna",
    seed: 127,
    anchor: "Vyrna",
    band5: { u0: 103 / 256, v0: 207 / 256 },
    why: "the realm seat Vyrna with a village, a hamlet and twelve farmsteads (out/1104/sweep-windows.ts 1 150 1 2)",
    crops: [
      { names: ["Vyrna", "Relbungrad"], what: "the realm seat Vyrna and the farmstead Relbungrad" },
      { names: ["Grykzvo"], what: "the village Grykzvo" },
    ],
  },
];

const worlds = new Map<number, World>();
export const worldOf = (seed: number): World => {
  const hit = worlds.get(seed);
  if (hit) return hit;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
};

const caches = new Map<number, ChainCache>();
const cacheOf = (seed: number): ChainCache => {
  const hit = caches.get(seed);
  if (hit) return hit;
  const c = createChainCache();
  caches.set(seed, c);
  return c;
};

export const band5Window = (p: Place): UvWindow => {
  const size = LOD_BANDS[5]!.sizeUV;
  return { u0: p.band5.u0, v0: p.band5.v0, u1: p.band5.u0 + size, v1: p.band5.v0 + size };
};

export function bandWindow(p: Place, band: number): UvWindow {
  const size = LOD_BANDS[band]!.sizeUV;
  const w5 = band5Window(p);
  const q = quantizeCenter((w5.u0 + w5.u1) / 2, (w5.v0 + w5.v1) / 2, size);
  return lodWindowFor(q.cx, q.cy, size);
}

export type Sheet = { readonly world: World; readonly window: UvWindow | null; readonly title: string };

const regions = new Map<string, Sheet>();
export function explorerRegion(p: Place, band: number): Sheet {
  const key = `${p.seed}:${band}`;
  const hit = regions.get(key);
  if (hit) return hit;
  const world = worldOf(p.seed);
  const window = band === 5 ? band5Window(p) : bandWindow(p, band);
  const title = regionTitle(world, window);
  const b = LOD_BANDS[band]!;
  const region = generateRegionWorld(world, { window, gridW: b.gridW, gridH: b.gridH, title, detail: true, chainCache: cacheOf(p.seed) });
  const sheet = { world: region, window, title };
  regions.set(key, sheet);
  return sheet;
}

export function explorerSvg(sheet: Sheet, style: StyleName = "antique"): string {
  const base = { style, widthPx: 1500, legend: true, arms: false, beasts: false, theme: undefined };
  if (sheet.window === null) return renderMap(sheet.world, base);
  const spec = { window: sheet.window, gridW: sheet.world.elev.w, gridH: sheet.world.elev.h, title: sheet.title, detail: true };
  const regionRecipe = { window: sheet.window, worldGridW: 320, detail: regionDetailLevel(spec) };
  return renderMap(sheet.world, { ...base, regionRecipe });
}

export const worldSheet = (p: Place): Sheet => ({ world: worldOf(p.seed), window: null, title: worldOf(p.seed).title.title });

const atlases = new Map<number, World>();
export function atlasRegion(p: Place): World {
  const world = worldOf(p.seed);
  const hit = atlases.get(p.seed);
  if (hit) return hit;
  const capital = world.settlements.find((s) => s.kind === "capital")!;
  const region = generateRegionWorld(world, {
    window: windowAround(world, capital, 0.38),
    gridW: world.recipe.gridW,
    gridH: world.recipe.gridH,
    title: `The Environs of ${capital.name}`,
  });
  atlases.set(p.seed, region);
  return region;
}

export const atlasRegionSvg = (p: Place, width = 1500): string =>
  renderMap(atlasRegion(p), { style: "antique", widthPx: width, legend: true });

export function centreOf(world: World, names: readonly string[]): { x: number; y: number } {
  const pts = names.map((n) => anchorIn(world, n));
  return { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length };
}

export function anchorIn(world: World, name: string): { x: number; y: number } {
  const s = world.settlements.find((t) => t.name === name);
  if (!s) throw new Error(`${name} is not on this sheet`);
  const proj = createProjection(world.elev.w, world.elev.h, 1500, marginFor(1500));
  return { x: proj.px(s.x), y: proj.py(s.y) };
}
