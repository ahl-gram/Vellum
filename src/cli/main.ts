import { parseArgs } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { generateWorld } from "../world/generate.ts";
import { recipeForCommand } from "./recipe.ts";
import { renderMap } from "../render/map-renderer.ts";
import type { StyleName } from "../render/style.ts";
import type { ThemeName } from "../render/layers/field.ts";
import type { MapType } from "../terrain/heightfield.ts";
import type { ClimateBand } from "../climate/climate.ts";
import { buildAtlas } from "./atlas.ts";
import { buildGallery } from "./gallery.ts";
import {
  findBrowser,
  rasterizeSvg,
  printToPdf,
  NO_BROWSER_HINT,
  NO_BROWSER_HINT_PDF,
} from "./raster.ts";

const HELP = `vellum — an atelier of imaginary cartography

Usage:
  node src/cli/main.ts chart [options]   Draft a single chart (SVG)
  node src/cli/main.ts poster [options]    Wall-art chart: same world, 4200px, PNG
  node src/cli/main.ts atlas [options]     Bind a full atlas (HTML + charts)
  node src/cli/main.ts gallery [options]   Contact sheet of many worlds
  node src/cli/main.ts demo  [options]     Draft one chart in each style

Options:
  --seed <n>      World seed (default: random; always printed)
  --style <s>     antique | topographic | ink | nautical  (default: antique)
  --type <t>      island | archipelago | continent | citystate  (default: by seed)
  --band <b>      temperate | tropical | polar      (default: by seed)
  --grid <WxH>    Simulation grid (default: 320x240)
  --width <px>    Output width in pixels (default: 1500)
  --land <f>      Land fraction 0.1–0.7 (default: by map type)
  --count <n>     Gallery: number of worlds (default 12, max 48)
  --png           Also rasterize to PNG (uses an installed browser)
  --pdf           Atlas: also bind the atlas into one PDF (uses a browser)
  --scale <n>     PNG pixel scale (default 2; poster default 1)
  --legend        Draw a compact key explaining the symbols (default: off)
  --arms          Draw each realm's coat of arms beside its label (default: off)
  --theme <t>     Thematic data plate: vegetation | climate | moisture |
                  population  (chart/poster/demo)
  --out <path>    Output file (default: out/chart-<seed>-<style>.svg)
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

export async function main(argv: string[]): Promise<void> {
  const command = argv[0];
  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      seed: { type: "string" },
      style: { type: "string", default: "antique" },
      type: { type: "string" },
      band: { type: "string" },
      grid: { type: "string" },
      width: { type: "string" },
      land: { type: "string" },
      count: { type: "string" },
      png: { type: "boolean", default: false },
      pdf: { type: "boolean", default: false },
      scale: { type: "string" },
      legend: { type: "boolean", default: false },
      arms: { type: "boolean", default: false },
      theme: { type: "string" },
      out: { type: "string" },
      help: { type: "boolean", default: false },
    },
  });

  if (!command || values.help || command === "help") {
    console.log(HELP);
    return;
  }

  const seed =
    values.seed !== undefined
      ? Number(values.seed) >>> 0
      : (Date.now() % 0xffffffff) >>> 0;
  if (values.seed !== undefined && !Number.isFinite(Number(values.seed))) {
    throw new Error(`--seed must be a number, got "${values.seed}"`);
  }
  const grid = parseGrid(values.grid);
  const mapType = validateType(values.type);
  const band = validateBand(values.band);
  const theme = validateTheme(values.theme);
  const widthPx = values.width ? Number(values.width) : 1500;
  if (!Number.isFinite(widthPx) || widthPx < 400 || widthPx > 6000) {
    throw new Error("--width must be between 400 and 6000");
  }
  const landFraction = values.land ? Number(values.land) : undefined;
  if (landFraction !== undefined && (landFraction < 0.1 || landFraction > 0.7)) {
    throw new Error("--land must be between 0.1 and 0.7");
  }

  const recipe = recipeForCommand(command, seed, {
    ...(grid ?? {}),
    ...(mapType ? { mapType } : {}),
    ...(band ? { band } : {}),
    ...(landFraction !== undefined ? { landFraction } : {}),
  });

  if (command === "chart" || command === "poster") {
    const style = validateStyle(values.style as string);
    const poster = command === "poster";
    // a poster is the same world as the chart, only larger and rasterized
    const posterWidth = poster && !values.width ? 4200 : widthPx;

    const t0 = performance.now();
    const world = generateWorld(recipe);
    const t1 = performance.now();
    const svg = renderMap(world, { widthPx: posterWidth, style, legend: values.legend, arms: values.arms, theme });
    const t2 = performance.now();
    const out = resolve(
      values.out ?? `out/${command}-${seed}-${style}.svg`,
    );
    await writeOut(out, svg);
    console.log(`seed ${seed} · ${recipe.mapType} · ${world.title.title}`);
    console.log(
      `world ${(t1 - t0).toFixed(0)}ms · render ${(t2 - t1).toFixed(0)}ms · ${out}`,
    );

    const wantPng = values.png || poster;
    if (wantPng) {
      const browser = findBrowser();
      if (!browser) {
        console.error(NO_BROWSER_HINT);
        return;
      }
      const scale = values.scale ? Number(values.scale) : poster ? 1 : 2;
      if (!Number.isFinite(scale) || scale < 0.5 || scale > 4) {
        throw new Error("--scale must be between 0.5 and 4");
      }
      const pngOut = out.replace(/\.svg$/, ".png");
      const t3 = performance.now();
      await rasterizeSvg(browser, out, pngOut, scale);
      console.log(
        `png ${(performance.now() - t3).toFixed(0)}ms · scale ${scale} · ${pngOut}`,
      );
    }
    return;
  }

  if (command === "atlas") {
    const t0 = performance.now();
    const dir = await buildAtlas(seed, {
      width: widthPx,
      ...(values.out ? { out: values.out } : {}),
      recipe: {
        ...(grid ?? {}),
        ...(mapType ? { mapType } : {}),
        ...(band ? { band } : {}),
        ...(landFraction !== undefined ? { landFraction } : {}),
      },
    });
    console.log(`seed ${seed} · atlas bound in ${(performance.now() - t0).toFixed(0)}ms`);
    console.log(`  ${dir}/index.html`);

    if (values.pdf) {
      const browser = findBrowser();
      if (!browser) {
        console.error(NO_BROWSER_HINT_PDF);
        return;
      }
      const pdfPath = join(dir, `atlas-${seed}.pdf`);
      const t1 = performance.now();
      await printToPdf(browser, join(dir, "index.html"), pdfPath);
      console.log(`pdf ${(performance.now() - t1).toFixed(0)}ms · ${pdfPath}`);
    }
    return;
  }

  if (command === "gallery") {
    const style = validateStyle(values.style as string);
    const count = values.count ? Number(values.count) : 12;
    if (!Number.isInteger(count) || count < 1 || count > 48) {
      throw new Error("--count must be an integer between 1 and 48");
    }
    const t0 = performance.now();
    const dir = await buildGallery(seed, {
      count,
      style,
      ...(values.out ? { out: values.out } : {}),
    });
    console.log(
      `gallery of ${count} worlds in ${((performance.now() - t0) / 1000).toFixed(1)}s`,
    );
    console.log(`  ${dir}/index.html`);
    return;
  }

  if (command === "demo") {
    const world = generateWorld(recipe);
    console.log(`seed ${seed} · ${recipe.mapType} · ${world.title.title}`);
    for (const style of ["antique", "topographic", "ink", "nautical"] as const) {
      const svg = renderMap(world, { widthPx, style, legend: values.legend, arms: values.arms, theme });
      const out = resolve(`out/chart-${seed}-${style}.svg`);
      await writeOut(out, svg);
      console.log(`  ${out}`);
    }
    return;
  }

  throw new Error(`unknown command "${command}"\n${HELP}`);
}

const isDirectRun = process.argv[1]?.endsWith("main.ts") ?? false;
if (isDirectRun) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
