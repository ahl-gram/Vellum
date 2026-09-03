import type { ThemeName } from "../render/layers/field.ts";
import type { StyleName } from "../render/style.ts";

/** The curated theme-to-style pairing the bound atlas shows, in the atlas's own order; the Explorer still crosses every style with every theme. A leaf, so the Print Room's contents can number the surveys from it without pulling the renderer into its bundle (#465 ruling 7). */
export const THEMATIC: ReadonlyArray<{ readonly theme: ThemeName; readonly title: string; readonly style: StyleName }> = [
  { theme: "vegetation", title: "Vegetation", style: "antique" },
  { theme: "climate", title: "Temperature", style: "topographic" },
  { theme: "moisture", title: "Rainfall", style: "nautical" },
  { theme: "population", title: "Population", style: "ink" },
];
