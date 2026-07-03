import { BIOMES } from "../../climate/biomes.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";
import type { World } from "../../world/types.ts";
import type { MapStyle, StyleName } from "../style.ts";
import {
  BIOME_COLORS, BIOME_INK_LEVEL, VEG_INK_RAMP, VEGETATION_DEFAULT, VEGETATION_GROUPS,
  TEMP_BANDS, TEMP_RAMPS, TEMP_KEY,
  MOIST_BANDS, MOIST_RAMPS, MOIST_KEY,
  POP_LEVELS, POP_RAMPS, POP_LABELS,
} from "./field-palettes.ts";

/**
 * Thematic "data plates": the simulation that the normal chart discards for
 * display — biome, climate, moisture, settlement density — painted as flat
 * colored cells.
 *
 * One painter serves every theme. Each theme assigns each land cell an integer
 * class and a style-aware color; the painter run-length merges same-class cells
 * per row into <rect>s and clips the lot to the smooth coastline. The grid is
 * fine enough (≈4.7px/cell at 1500px) that the blocky fill reads as a continuous
 * wash, and staying in cells avoids the speckle and seams that per-class marching
 * squares would produce over noisy biome masks.
 *
 * Palettes follow the active map style (#71): the per-style ramps and biome
 * tables live in `field-palettes.ts`; this module just classes cells and looks
 * the colors up.
 */

export type ThemeName = "vegetation" | "climate" | "moisture" | "population";

export type SwatchRow = { readonly color: string; readonly label: string };

export type ThemeSpec = {
  readonly name: ThemeName;
  /** Per-cell class for the painter; null leaves the cell unpainted (ocean / no data). */
  cellClass(world: World): (i: number) => number | null;
  /** Fill color for a class index, in the active map style. */
  color(cls: number, style: MapStyle): string;
  /** Key rows for the active style; the palette may draw finer distinctions than the key groups. */
  legendRows(world: World, style: MapStyle): SwatchRow[];
  /** The legend's footnote for this theme. */
  readonly note: string;
  /** Legend label for the plate's iso lines, when it carries any. */
  readonly isoLabel?: string;
};

const isOcean = (world: World, i: number): boolean =>
  (world.biomes[i] as number) === BIOMES.ocean;

/** Quantize a [0,1] field cell into one of `n` bands. */
function band(value: number, n: number): number {
  return Math.max(0, Math.min(n - 1, Math.floor(value * n)));
}

// --- vegetation: land colored by biome ----------------------------------------

const VEGETATION: ThemeSpec = {
  name: "vegetation",
  cellClass: (world) => (i) =>
    isOcean(world, i) ? null : (world.biomes[i] as number),
  color: (cls, style) =>
    style.name === "ink"
      ? (VEG_INK_RAMP[BIOME_INK_LEVEL[cls] ?? 3] as string)
      : (BIOME_COLORS[cls] ?? VEGETATION_DEFAULT),
  legendRows: (world, style) => {
    const present = new Set<number>(world.biomes);
    return VEGETATION_GROUPS.filter((g) => g.ids.some((id) => present.has(id))).map(
      (g) => ({
        color: style.name === "ink" ? (VEG_INK_RAMP[g.inkLevel] as string) : g.color,
        label: g.label,
      }),
    );
  },
  note: "land coloured by biome",
};

// --- climate (temperature) and moisture: quantized continuous fields ----------

function scalarTheme(
  name: ThemeName,
  field: (world: World) => Float64Array,
  bands: number,
  ramps: Record<StyleName, string[]>,
  key: ReadonlyArray<[number, string]>,
  note: string,
  isoLabel: string,
): ThemeSpec {
  return {
    name,
    cellClass: (world) => {
      const data = field(world);
      return (i) => (isOcean(world, i) ? null : band(data[i] as number, bands));
    },
    color: (cls, style) => {
      const colors = ramps[style.name];
      return colors[cls] ?? (colors[colors.length - 1] as string);
    },
    legendRows: (_world, style) =>
      key.map(([i, label]) => ({ color: ramps[style.name][i] as string, label })),
    note,
    isoLabel,
  };
}

const CLIMATE = scalarTheme(
  "climate",
  (world) => world.climate.temperature.data,
  TEMP_BANDS, TEMP_RAMPS, TEMP_KEY,
  "warm to cool, by latitude & height",
  "Isotherm",
);

const MOISTURE = scalarTheme(
  "moisture",
  (world) => world.climate.moisture.data,
  MOIST_BANDS, MOIST_RAMPS, MOIST_KEY,
  "dry to wet rainfall; streaks mark the prevailing wind",
  "Isohyet",
);

// --- population: choropleth over realms, shaded by settlement density ----------

const POP_WEIGHT: Record<string, number> = { capital: 4, town: 2, village: 1 };

/** A density level (0..POP_LEVELS-1) per realm, from weighted settlements / area. */
function realmDensityLevels(world: World): number[] {
  const { labels, seats } = world.realms;
  const R = seats.length;
  if (R === 0) return [];
  const weight = new Array<number>(R).fill(0);
  const area = new Array<number>(R).fill(0);
  for (let i = 0; i < labels.length; i++) {
    const r = labels[i] as number;
    if (r >= 0) area[r] = (area[r] as number) + 1;
  }
  const w = world.elev.w;
  for (const s of world.settlements) {
    const r = labels[s.x + s.y * w] as number;
    if (r >= 0) weight[r] = (weight[r] as number) + (POP_WEIGHT[s.kind] ?? 1);
  }
  const density = weight.map((wt, i) =>
    (area[i] as number) > 0 ? wt / (area[i] as number) : 0,
  );
  if (R === 1) return [Math.floor(POP_LEVELS / 2)];
  const dmin = Math.min(...density);
  const dmax = Math.max(...density);
  const span = dmax - dmin || 1;
  return density.map((d) => Math.round(((d - dmin) / span) * (POP_LEVELS - 1)));
}

const POPULATION: ThemeSpec = {
  name: "population",
  cellClass: (world) => {
    const { labels } = world.realms;
    const level = realmDensityLevels(world);
    return (i) => {
      const r = labels[i] as number;
      return r >= 0 ? (level[r] as number) : null;
    };
  },
  color: (cls, style) => {
    const colors = POP_RAMPS[style.name];
    return colors[cls] ?? (colors[colors.length - 1] as string);
  },
  legendRows: (_world, style) =>
    POP_LABELS.map((label, i) => ({ color: POP_RAMPS[style.name][i] as string, label })),
  note: "realms shaded by settlement density",
};

export const THEMES: Record<ThemeName, ThemeSpec> = {
  vegetation: VEGETATION,
  climate: CLIMATE,
  moisture: MOISTURE,
  population: POPULATION,
};

/** Flat colored cells for the active theme, clipped to land. Null when no theme. */
export function fieldLayer(ctx: RenderCtx): SvgNode | null {
  if (!ctx.theme) return null;
  const theme = THEMES[ctx.theme];
  const { world, proj, style } = ctx;
  const { w, h } = world.elev;
  const classOf = theme.cellClass(world);
  const half = proj.scale / 2;
  const sliver = 0.5; // overdraw a hair to seal anti-aliased hairlines between cells

  const rects: SvgNode[] = [];
  for (let y = 0; y < h; y++) {
    const yPx = proj.py(y) - half;
    let x = 0;
    while (x < w) {
      const cls = classOf(x + y * w);
      if (cls === null) {
        x++;
        continue;
      }
      let x2 = x + 1;
      while (x2 < w && classOf(x2 + y * w) === cls) x2++;
      const x0 = proj.px(x) - half;
      const x1 = proj.px(x2 - 1) + half;
      rects.push(
        el("rect", {
          x: x0.toFixed(2),
          y: yPx.toFixed(2),
          width: (x1 - x0 + sliver).toFixed(2),
          height: (proj.scale + sliver).toFixed(2),
          fill: theme.color(cls, style),
        }),
      );
      x = x2;
    }
  }

  const coastD = ctx.coastRings.map((r) => pathFrom(r, true)).join("");
  const clipPath = el("clipPath", { id: "field-clip" }, [
    el("path", { d: coastD, "clip-rule": "evenodd" }),
  ]);

  return el("g", { id: "layer-field" }, [
    clipPath,
    el("g", { "clip-path": "url(#field-clip)" }, rects),
    // the cells cover the inner half of the land layer's coast stroke; redraw it
    // on top so the defining coastline stays crisp
    el("path", {
      d: coastD,
      fill: "none",
      stroke: style.coastStroke,
      "stroke-width": 1.3,
      "stroke-linejoin": "round",
    }),
  ]);
}
