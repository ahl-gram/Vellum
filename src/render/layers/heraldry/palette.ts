import type { MapStyle } from "../../style.ts";
import type { Tincture } from "../../../society/heraldry.ts";

/**
 * Tincture palettes for arms. PURE: a small lookup keyed off the map style, so
 * the same arms render identically wherever they are drawn.
 */

export type ArmsPalette = {
  /** Fill hex for a tincture. */
  tincture(t: Tincture): string;
  /** Shield outline + charge linework. */
  readonly outline: string;
};

// Canonical heraldic tinctures, muted a touch to sit on parchment.
const HERALDIC: Record<Tincture, string> = {
  or: "#c8a032",
  argent: "#efe8d6",
  gules: "#a83232",
  azure: "#2f5a86",
  sable: "#2b2722",
  vert: "#3f6b46",
  purpure: "#6f4a78",
};

// Monochrome styles read heraldry as a value ladder (hatching is a later polish).
const GREYS: Record<Tincture, string> = {
  argent: "#f1ece1",
  or: "#d6d0c2",
  vert: "#938a7d",
  gules: "#827a6e",
  azure: "#665f56",
  purpure: "#6f675c",
  sable: "#2b2722",
};

export function paletteForStyle(style: MapStyle): ArmsPalette {
  const table = style.name === "ink" ? GREYS : HERALDIC;
  return {
    tincture: (t) => table[t],
    outline: style.ink,
  };
}
