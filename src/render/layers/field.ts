import { BIOMES } from "../../climate/biomes.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";
import type { World } from "../../world/types.ts";

/**
 * Thematic "data plates": the simulation that the normal chart discards for
 * display — biome, climate, moisture, settlement density — painted as flat
 * colored cells.
 *
 * One painter serves every theme. Each theme assigns each land cell an integer
 * class and a color; the painter run-length merges same-class cells per row into
 * <rect>s and clips the lot to the smooth coastline. The grid is fine enough
 * (≈4.7px/cell at 1500px) that the blocky fill reads as a continuous wash, and
 * staying in cells avoids the speckle and seams that per-class marching squares
 * would produce over noisy biome masks.
 */

export type ThemeName = "vegetation" | "climate" | "moisture" | "population";

export type SwatchRow = { readonly color: string; readonly label: string };

export type ThemeSpec = {
  readonly name: ThemeName;
  /** Per-cell class for the painter; null leaves the cell unpainted (ocean / no data). */
  cellClass(world: World): (i: number) => number | null;
  /** Fill color for a class index. */
  color(cls: number): string;
  /** Key rows; the palette may draw finer distinctions than the key groups. */
  legendRows(world: World): SwatchRow[];
  /** The legend's footnote for this theme. */
  readonly note: string;
};

const isOcean = (world: World, i: number): boolean =>
  (world.biomes[i] as number) === BIOMES.ocean;

// --- color ramp helper: interpolate N colors through a few anchor stops -------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
}

/** N evenly-spaced colors interpolated through the anchor hex stops. */
function ramp(anchors: ReadonlyArray<string>, n: number): string[] {
  const rgb = anchors.map(hexToRgb);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const seg = t * (rgb.length - 1);
    const lo = Math.min(Math.floor(seg), rgb.length - 2);
    const f = seg - lo;
    const a = rgb[lo] as [number, number, number];
    const b = rgb[lo + 1] as [number, number, number];
    out.push(
      `#${toHex(a[0] + (b[0] - a[0]) * f)}${toHex(a[1] + (b[1] - a[1]) * f)}${toHex(a[2] + (b[2] - a[2]) * f)}`,
    );
  }
  return out;
}

/** Quantize a [0,1] field cell into one of `n` bands. */
function band(value: number, n: number): number {
  return Math.max(0, Math.min(n - 1, Math.floor(value * n)));
}

// --- vegetation: land colored by biome ----------------------------------------

const BIOME_COLORS: Record<number, string> = {
  [BIOMES.beach]: "#e6d8ad",
  [BIOMES.marsh]: "#9fae74",
  [BIOMES.tundra]: "#cbcab9",
  [BIOMES.taiga]: "#6f8d6c",
  [BIOMES.steppe]: "#cdbf86",
  [BIOMES.grassland]: "#b3c07c",
  [BIOMES.shrubland]: "#bcab6a",
  [BIOMES.temperateForest]: "#7b9a5f",
  [BIOMES.rainforest]: "#56823f",
  [BIOMES.savanna]: "#cbb56a",
  [BIOMES.desert]: "#e0cd9a",
  [BIOMES.tropicalForest]: "#5f8a4f",
  [BIOMES.jungle]: "#46733c",
  [BIOMES.alpine]: "#bcb4a3",
  [BIOMES.snow]: "#eef0ec",
};

const VEGETATION_GROUPS: ReadonlyArray<{ label: string; color: string; ids: number[] }> = [
  { label: "Forest", color: "#6f8d6c", ids: [BIOMES.temperateForest, BIOMES.rainforest, BIOMES.taiga, BIOMES.tropicalForest, BIOMES.jungle] },
  { label: "Grass & steppe", color: "#b3c07c", ids: [BIOMES.grassland, BIOMES.steppe, BIOMES.savanna, BIOMES.shrubland] },
  { label: "Desert", color: "#e0cd9a", ids: [BIOMES.desert] },
  { label: "Wetland & shore", color: "#9fae74", ids: [BIOMES.marsh, BIOMES.beach] },
  { label: "Tundra & alpine", color: "#cbcab9", ids: [BIOMES.tundra, BIOMES.alpine] },
  { label: "Snow & ice", color: "#eef0ec", ids: [BIOMES.snow] },
];

const VEGETATION: ThemeSpec = {
  name: "vegetation",
  cellClass: (world) => (i) =>
    isOcean(world, i) ? null : (world.biomes[i] as number),
  color: (cls) => BIOME_COLORS[cls] ?? "#cabf9f",
  legendRows: (world) => {
    const present = new Set<number>(world.biomes);
    return VEGETATION_GROUPS.filter((g) => g.ids.some((id) => present.has(id))).map(
      (g) => ({ color: g.color, label: g.label }),
    );
  },
  note: "land coloured by biome",
};

// --- climate (temperature) and moisture: quantized continuous fields ----------

const TEMP_BANDS = 12;
const TEMP_RAMP = ramp(["#7d96b6", "#a9bfae", "#cdca8f", "#d6a96d", "#bd6f53"], TEMP_BANDS);
const TEMP_KEY: ReadonlyArray<[number, string]> = [
  [0, "Cold"], [3, "Cool"], [6, "Temperate"], [9, "Warm"], [11, "Hot"],
];

const MOIST_BANDS = 10;
const MOIST_RAMP = ramp(["#d8c592", "#c7c789", "#9fbb84", "#74a78f", "#5b8f9a"], MOIST_BANDS);
const MOIST_KEY: ReadonlyArray<[number, string]> = [
  [0, "Arid"], [3, "Dry"], [5, "Moderate"], [7, "Humid"], [9, "Wet"],
];

function scalarTheme(
  name: ThemeName,
  field: (world: World) => Float64Array,
  bands: number,
  colors: ReadonlyArray<string>,
  key: ReadonlyArray<[number, string]>,
  note: string,
): ThemeSpec {
  return {
    name,
    cellClass: (world) => {
      const data = field(world);
      return (i) => (isOcean(world, i) ? null : band(data[i] as number, bands));
    },
    color: (cls) => colors[cls] ?? (colors[colors.length - 1] as string),
    legendRows: () => key.map(([i, label]) => ({ color: colors[i] as string, label })),
    note,
  };
}

const CLIMATE = scalarTheme(
  "climate",
  (world) => world.climate.temperature.data,
  TEMP_BANDS, TEMP_RAMP, TEMP_KEY,
  "warm to cool, by latitude & height",
);

const MOISTURE = scalarTheme(
  "moisture",
  (world) => world.climate.moisture.data,
  MOIST_BANDS, MOIST_RAMP, MOIST_KEY,
  "dry to wet rainfall",
);

// --- population: choropleth over realms, shaded by settlement density ----------

const POP_LEVELS = 5;
const POP_RAMP = ramp(["#e7ddc1", "#cdb88a", "#b08d5f", "#855f3e"], POP_LEVELS);
const POP_LABELS = ["Sparse", "Light", "Moderate", "Settled", "Dense"];
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
  color: (cls) => POP_RAMP[cls] ?? (POP_RAMP[POP_RAMP.length - 1] as string),
  legendRows: () => POP_LABELS.map((label, i) => ({ color: POP_RAMP[i] as string, label })),
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
          fill: theme.color(cls),
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
