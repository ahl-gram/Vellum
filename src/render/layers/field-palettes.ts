import { BIOMES } from "../../climate/biomes.ts";
import type { StyleName } from "../style.ts";

/**
 * Per-style palettes for the thematic data plates (#71). Each map style paints
 * the same simulated field in its own register: antique keeps its parchment
 * ramps, topographic brightens onto clean paper, nautical leans into navy ink,
 * and ink collapses to a single light-to-dark monochrome wash. The tables are
 * built once at module load so the field painter's per-cell `color()` stays a
 * cheap array lookup rather than re-interpolating a ramp for every cell.
 *
 * Antique's tables are kept byte-identical to the pre-#71 constants so the
 * committed style charts and the antique-assigned plate never drift.
 */

// --- hex ramp helpers --------------------------------------------------------

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

type ByStyle<T> = Record<StyleName, T>;
const byStyle = <T,>(f: (s: StyleName) => T): ByStyle<T> => ({
  antique: f("antique"),
  topographic: f("topographic"),
  ink: f("ink"),
  nautical: f("nautical"),
});

// ink: a single warm light-to-dark wash, shared by every theme so the pen-and-
// ink plates read as monochrome surveys rather than the antique colour ramps.
const INK_LIGHT = "#ddd6c4";
const INK_DARK = "#241c10";

// --- temperature: cold -> hot ------------------------------------------------

export const TEMP_BANDS = 12;
const TEMP_ANCHORS: ByStyle<readonly string[]> = {
  antique: ["#7d96b6", "#a9bfae", "#cdca8f", "#d6a96d", "#bd6f53"],
  topographic: ["#5a8cc0", "#9ec6c1", "#dcd79a", "#e0a76a", "#cc5d47"],
  nautical: ["#3f6690", "#7f9fb2", "#c7c39c", "#c68f63", "#a8543f"],
  ink: [INK_LIGHT, INK_DARK],
};
export const TEMP_RAMPS: ByStyle<string[]> = byStyle((s) => ramp(TEMP_ANCHORS[s], TEMP_BANDS));
export const TEMP_KEY: ReadonlyArray<[number, string]> = [
  [0, "Cold"], [3, "Cool"], [6, "Temperate"], [9, "Warm"], [11, "Hot"],
];

// --- moisture: dry -> wet ----------------------------------------------------

export const MOIST_BANDS = 10;
const MOIST_ANCHORS: ByStyle<readonly string[]> = {
  antique: ["#d8c592", "#c7c789", "#9fbb84", "#74a78f", "#5b8f9a"],
  topographic: ["#e3d4a0", "#c5cf90", "#8fc0a0", "#5aa6b0", "#3f7fa6"],
  nautical: ["#ddcfa6", "#a9bba0", "#7ba0a8", "#4f86a6", "#2f6585"],
  ink: [INK_LIGHT, INK_DARK],
};
export const MOIST_RAMPS: ByStyle<string[]> = byStyle((s) => ramp(MOIST_ANCHORS[s], MOIST_BANDS));
export const MOIST_KEY: ReadonlyArray<[number, string]> = [
  [0, "Arid"], [3, "Dry"], [5, "Moderate"], [7, "Humid"], [9, "Wet"],
];

// --- population: sparse -> dense ---------------------------------------------

export const POP_LEVELS = 5;
const POP_ANCHORS: ByStyle<readonly string[]> = {
  antique: ["#e7ddc1", "#cdb88a", "#b08d5f", "#855f3e"],
  topographic: ["#ece5d1", "#d3bd8f", "#bb8f5d", "#8f5f38"],
  nautical: ["#dfe2dc", "#a9bcc4", "#6e93a8", "#3c6680"],
  ink: [INK_LIGHT, INK_DARK],
};
export const POP_RAMPS: ByStyle<string[]> = byStyle((s) => ramp(POP_ANCHORS[s], POP_LEVELS));
export const POP_LABELS = ["Sparse", "Light", "Moderate", "Settled", "Dense"];

// --- vegetation: categorical biomes ------------------------------------------
// Colored styles share the earthy biome palette: the biome greens and tans sit
// well on any of the three warm papers, and the field painter redraws the coast
// in each style's stroke. Ink collapses the biomes to six density levels, barren
// ground pale and closed canopy dark, so the plate reads as a monochrome survey.

export const BIOME_COLORS: Record<number, string> = {
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
export const VEGETATION_DEFAULT = "#cabf9f";

/**
 * The legend's vegetation groups, in key order (densest first). Each carries its
 * antique swatch colour and an `inkLevel` (0 barren .. 5 forest) for the ink
 * monochrome plate. This is the single source of truth for both the legend rows
 * and the per-biome ink shade.
 */
export const VEGETATION_GROUPS: ReadonlyArray<{
  readonly label: string;
  readonly color: string;
  readonly inkLevel: number;
  readonly ids: ReadonlyArray<number>;
}> = [
  { label: "Forest", color: "#6f8d6c", inkLevel: 5, ids: [BIOMES.temperateForest, BIOMES.rainforest, BIOMES.taiga, BIOMES.tropicalForest, BIOMES.jungle] },
  { label: "Grass & steppe", color: "#b3c07c", inkLevel: 3, ids: [BIOMES.grassland, BIOMES.steppe, BIOMES.savanna, BIOMES.shrubland] },
  { label: "Desert", color: "#e0cd9a", inkLevel: 1, ids: [BIOMES.desert] },
  { label: "Wetland & shore", color: "#9fae74", inkLevel: 4, ids: [BIOMES.marsh, BIOMES.beach] },
  { label: "Tundra & alpine", color: "#cbcab9", inkLevel: 2, ids: [BIOMES.tundra, BIOMES.alpine] },
  { label: "Snow & ice", color: "#eef0ec", inkLevel: 0, ids: [BIOMES.snow] },
];

const VEG_INK_LEVELS = 6;
export const VEG_INK_RAMP = ramp([INK_LIGHT, INK_DARK], VEG_INK_LEVELS);

/** Biome id -> ink density level (0..5), derived from the vegetation groups. */
export const BIOME_INK_LEVEL: Record<number, number> = (() => {
  const m: Record<number, number> = {};
  for (const g of VEGETATION_GROUPS) for (const id of g.ids) m[id] = g.inkLevel;
  return m;
})();
