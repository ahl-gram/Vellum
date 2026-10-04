import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../world/generate.ts";
import { renderMap } from "../render/map-renderer.ts";
import type { StyleName } from "../render/style.ts";
import type { ThemeName } from "../render/layers/field.ts";
import type { MapType } from "../terrain/heightfield.ts";
import type { ClimateBand } from "../climate/climate.ts";
import { findBrowser, rasterizeSvg, NO_BROWSER_HINT } from "./raster.ts";

const HELP = `vellum: an atelier of imaginary cartography

Usage:
  node src/cli/main.ts chart [options]   Draft a single chart (SVG)

Options:
  --seed <n>        World seed (default: random; always printed)
  --style <s>       antique | topographic | ink | nautical  (default: antique)
  --type <t>        island | archipelago | continent | citystate  (default: by seed)
  --band <b>        temperate | tropical | polar      (default: by seed)
  --grid <WxH>      Simulation grid (default: 320x240)
  --width <px>      Output width in pixels, 400 to 6000 (default: 1500)
  --land <f>        Land fraction 0.1 to 0.7 (default: by map type)
  --coast-warp <f>  Coastline raggedness 0 to 1 (default: by seed)
  --png             Also rasterize to PNG (uses an installed browser)
  --scale <n>       PNG pixel scale 0.5 to 4 (default: 2)
  --legend          Draw a compact key explaining the symbols (default: off)
  --arms            Draw each realm's coat of arms beside its label (default: off)
  --beasts          Summon the deep's named beasts onto the open sea (default: off)
  --theme <t>       Thematic data plate: vegetation | climate | moisture | population
  --out <path>      Output file (default: out/chart-<seed>-<style>.svg)

Posters, atlases, and printing moved to the Print Room on the site:
https://www.vellumworlds.com/print-room/
`;

type ParsedGrid = { gridW: number; gridH: number };

function parseGrid(s: string | undefined): ParsedGrid | undefined {
  if (!s) return undefined;
  const m = /^(\d+)x(\d+)$/i.exec(s);
  if (!m) throw new Error(`--grid expects WxH (e.g. 320x240), got "${s}"`);
  const gridW = Number(m[1]);
  const gridH = Number(m[2]);
  if (gridW < 40 || gridH < 30 || gridW > 1200 || gridH > 900) {
    throw new Error("--grid must be between 40x30 and 1200x900");
  }
  return { gridW, gridH };
}

function validateStyle(s: string): StyleName {
  if (s === "antique" || s === "topographic" || s === "ink" || s === "nautical") {
    return s;
  }
  throw new Error(
    `unknown style "${s}" (use antique | topographic | ink | nautical)`,
  );
}

function validateType(s: string | undefined): MapType | undefined {
  if (s === undefined) return undefined;
  if (
    s === "island" || s === "archipelago" || s === "continent" ||
    s === "citystate"
  ) {
    return s;
  }
  throw new Error(`unknown map type "${s}"`);
}

function validateBand(s: string | undefined): ClimateBand | undefined {
  if (s === undefined) return undefined;
  if (s === "temperate" || s === "tropical" || s === "polar") return s;
  throw new Error(`unknown climate band "${s}"`);
}

function validateTheme(s: string | undefined): ThemeName | undefined {
  if (s === undefined) return undefined;
  if (s === "vegetation" || s === "climate" || s === "moisture" || s === "population") {
    return s;
  }
  throw new Error(
    `unknown theme "${s}" (use vegetation | climate | moisture | population)`,
  );
}

async function writeOut(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

export const CHART_OPTIONS = {
  seed: { type: "string" },
  style: { type: "string" },
  type: { type: "string" },
  band: { type: "string" },
  grid: { type: "string" },
  width: { type: "string" },
  land: { type: "string" },
  "coast-warp": { type: "string" },
  png: { type: "boolean", default: false },
  scale: { type: "string" },
  legend: { type: "boolean", default: false },
  arms: { type: "boolean", default: false },
  beasts: { type: "boolean", default: false },
  theme: { type: "string" },
  out: { type: "string" },
  help: { type: "boolean", default: false },
} as const satisfies ParseArgsOptionsConfig;

function withoutEmpty<T extends object>(values: T): T {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "")) as T;
}

function parseChartArgs(args: string[]) {
  const { values } = parseArgs({ args, options: CHART_OPTIONS });
  return { ...withoutEmpty(values), seed: values.seed };
}

type ChartArgs = ReturnType<typeof parseChartArgs>;

const num = (s: string): number => (s.trim() === "" ? Number.NaN : Number(s));

function chartOptions(values: ChartArgs) {
  const seed =
    values.seed !== undefined
      ? Number(values.seed) >>> 0
      : (Date.now() % 0xffffffff) >>> 0;
  if (values.seed !== undefined && !Number.isFinite(num(values.seed))) {
    throw new Error(`--seed must be a number, got "${values.seed}"`);
  }
  const grid = parseGrid(values.grid);
  const mapType = validateType(values.type);
  const band = validateBand(values.band);
  const theme = validateTheme(values.theme);
  const widthPx = values.width !== undefined ? num(values.width) : 1500;
  if (!Number.isFinite(widthPx) || widthPx < 400 || widthPx > 6000) {
    throw new Error("--width must be between 400 and 6000");
  }
  const landFraction = values.land !== undefined ? num(values.land) : undefined;
  if (landFraction !== undefined && (!Number.isFinite(landFraction) || landFraction < 0.1 || landFraction > 0.7)) {
    throw new Error("--land must be between 0.1 and 0.7");
  }
  const coastWarp =
    values["coast-warp"] !== undefined ? num(values["coast-warp"]) : undefined;
  if (coastWarp !== undefined && (!Number.isFinite(coastWarp) || coastWarp < 0 || coastWarp > 1)) {
    throw new Error("--coast-warp must be between 0 and 1");
  }
  const scale = values.scale !== undefined ? num(values.scale) : 2;
  if (!Number.isFinite(scale) || scale < 0.5 || scale > 4) {
    throw new Error("--scale must be between 0.5 and 4");
  }
  return { seed, grid, mapType, band, theme, widthPx, landFraction, coastWarp, scale };
}

type ChartOptions = ReturnType<typeof chartOptions>;

function chartRecipe(o: ChartOptions) {
  return defaultRecipe(o.seed, {
    ...(o.grid ?? {}),
    ...(o.mapType ? { mapType: o.mapType } : {}),
    ...(o.band ? { band: o.band } : {}),
    ...(o.landFraction !== undefined ? { landFraction: o.landFraction } : {}),
    ...(o.coastWarp !== undefined ? { coastWarp: o.coastWarp } : {}),
  });
}

async function drawChart(values: ChartArgs, o: ChartOptions, recipe: ReturnType<typeof chartRecipe>, style: StyleName): Promise<string> {
  const t0 = performance.now();
  const world = generateWorld(recipe);
  const t1 = performance.now();
  const svg = renderMap(world, { widthPx: o.widthPx, style, legend: values.legend, arms: values.arms, beasts: values.beasts, theme: o.theme });
  const t2 = performance.now();
  const out = resolve(values.out ?? `out/chart-${o.seed}-${style}.svg`);
  await writeOut(out, svg);
  console.log(`seed ${o.seed} · ${recipe.mapType} · ${world.title.title}`);
  console.log(
    `world ${(t1 - t0).toFixed(0)}ms · render ${(t2 - t1).toFixed(0)}ms · ${out}`,
  );
  return out;
}

async function rasterizeChart(out: string, scale: number): Promise<void> {
  const browser = findBrowser();
  if (!browser) {
    console.error(NO_BROWSER_HINT);
    return;
  }
  const pngOut = out.replace(/\.svg$/, ".png");
  const t3 = performance.now();
  await rasterizeSvg(browser, out, pngOut, scale);
  console.log(
    `png ${(performance.now() - t3).toFixed(0)}ms · scale ${scale} · ${pngOut}`,
  );
}

export async function main(argv: string[]): Promise<void> {
  const command = argv[0];
  const values = parseChartArgs(argv.slice(1));

  if (!command || values.help || command === "help") {
    console.log(HELP);
    return;
  }
  if (command !== "chart") {
    throw new Error(`unknown command "${command}"\n${HELP}`);
  }

  const o = chartOptions(values);
  const recipe = chartRecipe(o);
  const style = validateStyle(values.style ?? "antique");
  const out = await drawChart(values, o, recipe, style);
  if (values.png) await rasterizeChart(out, o.scale);
}

const isDirectRun = process.argv[1]?.endsWith("main.ts") ?? false;
if (isDirectRun) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
