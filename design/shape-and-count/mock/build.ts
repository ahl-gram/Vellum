// Issue #849: draws every case and direction (world sheet and band-1 close-up, antique and ink) into the main
// checkout's out/844/svg/, and writes the measured facts every caption quotes to out/844/facts.json.
// OUT is absolute on purpose: the code runs from the designer's tree while the stills land where Alex looks.
// Run from the tree: node out/844/mock/build.ts [slug-substring ...]
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import type { StyleName } from "../../../src/render/style.ts";
import type { World } from "../../../src/world/types.ts";
import { countCases, extraCases, shapeCases, wobbleCases, type Case, type Dir } from "./cases.ts";
import { buildCloseUp, buildWorld, closeUpDisagreement, recipeFor, renderCloseUp, renderWorld, shapeFacts, sheetFacts, type SheetFacts, type ShapeFacts } from "./sheets.ts";
import type { TerrainInputs } from "./terrain.ts";

export const OUT = "/Users/ahl/CodeProjects/Vellum/out/844";
export const SHA = "581a6de3";
export const DRESSES: ReadonlyArray<StyleName> = ["antique", "ink"];
const SVG_DIR = `${OUT}/svg`;

export type Plate = {
  readonly id: string;
  readonly caseSlug: string;
  readonly dir: string;
  readonly label: string;
  readonly pipeline: "engine" | "spike";
  readonly closeUpPipeline: "engine" | "spike";
  readonly mine?: string;
  readonly recipe: { seed: number; mapType: string; landFraction: number; band: string; coastWarp?: number };
  readonly asked?: Dir["asked"];
  readonly world: SheetFacts;
  readonly shape?: ShapeFacts;
  readonly outlineFit?: string;
  readonly closeUp: SheetFacts & { readonly disagreement: number; readonly title: string; readonly dropped: number };
  readonly window: { u0: number; v0: number; u1: number; v1: number };
  readonly title: string;
  readonly files: Record<string, string>;
  readonly ms: number;
};

// Settlements the world sheet seats inside the close-up window (the inset `projectSettlements` in `src/world/region.ts` keeps) that the close-up found no land for.
function droppedTowns(world: World, region: World): number {
  const win = region.region?.window;
  if (win === undefined) return 0;
  const du = win.u1 - win.u0, dv = win.v1 - win.v0, inset = 0.02;
  const inWindow = world.settlements.filter((s) => {
    const u = s.x / (world.recipe.gridW - 1), v = s.y / (world.recipe.gridH - 1);
    return u >= win.u0 + du * inset && u <= win.u1 - du * inset && v >= win.v0 + dv * inset && v <= win.v1 - dv * inset;
  }).length;
  return inWindow - region.settlements.filter((s) => s.kind !== "hamlet").length;
}

function plateFor(c: Case, d: Dir, controlCache: Map<string, World>, fileCache: Map<string, Record<string, string>>): Plate {
  const t0 = performance.now();
  const seed = d.seed ?? c.seed;
  const coastWarp = d.coastWarp ?? c.coastWarp;
  const overrides = { mapType: c.mapType, ...(c.overrides ?? {}), ...(coastWarp !== undefined ? { coastWarp } : {}), ...(d.landFraction !== undefined ? { landFraction: d.landFraction } : {}) };
  const recipe = recipeFor(seed, overrides);
  const inputs: TerrainInputs = { seed, mapType: c.mapType, ...(coastWarp !== undefined ? { coastWarp } : {}), edge: d.edge };
  const cacheKey = `${seed}|${c.mapType}|${JSON.stringify(c.overrides ?? {})}|${coastWarp ?? "-"}|${d.landFraction ?? "-"}`;
  let world: World;
  if (d.pipeline === "engine") {
    world = controlCache.get(cacheKey) ?? buildWorld(recipe, "engine", inputs);
    controlCache.set(cacheKey, world);
  } else world = buildWorld(recipe, "spike", inputs);
  const { region, spec } = buildCloseUp(world, c.window, d.pipeline, inputs);
  const id = `${c.slug}--${d.key}`;
  const fileKey = d.pipeline === "engine" ? `${cacheKey}|${c.window.u0},${c.window.v0}` : "";
  const reused = fileKey ? fileCache.get(fileKey) : undefined;
  const files: Record<string, string> = reused ? { ...reused } : {};
  if (fileKey && !reused) fileCache.set(fileKey, files);
  for (const style of reused ? [] : DRESSES) {
    const w = `${id}--world-${style}.svg`;
    const r = `${id}--close-${style}.svg`;
    writeFileSync(`${SVG_DIR}/${w}`, renderWorld(world, style));
    writeFileSync(`${SVG_DIR}/${r}`, renderCloseUp(world, region, spec, style));
    files[`world-${style}`] = w;
    files[`close-${style}`] = r;
  }
  const outline = d.outline ?? c.outline;
  return {
    id,
    caseSlug: c.slug,
    dir: d.key,
    label: d.label,
    pipeline: d.pipeline,
    closeUpPipeline: d.pipeline,
    ...(d.mine !== undefined ? { mine: d.mine } : {}),
    recipe: { seed: recipe.seed, mapType: recipe.mapType, landFraction: recipe.landFraction, band: recipe.band, ...(recipe.coastWarp !== undefined ? { coastWarp: recipe.coastWarp } : {}) },
    ...(d.asked !== undefined ? { asked: d.asked } : {}),
    world: sheetFacts(world),
    ...(outline !== undefined ? { shape: shapeFacts(world, outline), outlineFit: outline.outline.fit } : {}),
    closeUp: { ...sheetFacts(region), disagreement: closeUpDisagreement(world, region), title: region.title.title, dropped: droppedTowns(world, region) },
    window: { ...c.window },
    title: world.title.title,
    files,
    ms: Math.round(performance.now() - t0),
  };
}

const filters = process.argv.slice(2);
const cases = [...shapeCases(), ...countCases(), ...extraCases(), ...wobbleCases()].filter((c) => filters.length === 0 || filters.some((f) => c.slug.includes(f)));
mkdirSync(SVG_DIR, { recursive: true });
const factsFile = `${OUT}/facts.json`;
const previous: { cases: unknown[]; plates: Plate[] } = existsSync(factsFile) ? (JSON.parse(readFileSync(factsFile, "utf8")) as { cases: unknown[]; plates: Plate[] }) : { cases: [], plates: [] };
const keep = previous.plates.filter((p) => !cases.some((c) => c.slug === p.caseSlug));
const controlCache = new Map<string, World>();
const fileCache = new Map<string, Record<string, string>>();
const plates: Plate[] = [];
for (const c of cases) {
  for (const d of c.dirs) {
    const p = plateFor(c, d, controlCache, fileCache);
    plates.push(p);
    console.log(`${p.id}: islands ${p.world.islands}${p.asked ? ` of ${p.asked.n} asked` : ""}, land ${(100 * p.world.landShare).toFixed(1)}%, border ${p.world.borderLand}${p.shape ? `, outline ${(100 * p.shape.outlineShare).toFixed(0)}%, likeness ${p.shape.likeness.toFixed(2)}` : ""}, close-up disagreement ${(100 * p.closeUp.disagreement).toFixed(2)}%, ${p.ms} ms`);
  }
}
const allCases = [...shapeCases(), ...countCases(), ...extraCases(), ...wobbleCases()].map((c) => ({ slug: c.slug, group: c.group, title: c.title, why: c.why, seed: c.seed, mapType: c.mapType, coastWarp: c.coastWarp, overrides: c.overrides, window: c.window, primary: c.primary, outline: c.outline ? { id: c.outline.outline.id, name: c.outline.outline.name, source: c.outline.outline.source, fit: c.outline.outline.fit } : undefined, dirs: c.dirs.map((d) => d.key) }));
writeFileSync(factsFile, JSON.stringify({ sha: SHA, cases: allCases, plates: [...keep, ...plates] }, null, 1));
console.log(`${plates.length} plates (${plates.length * 4} SVGs) written to ${SVG_DIR}; facts in ${factsFile}`);
