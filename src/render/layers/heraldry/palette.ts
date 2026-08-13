import type { MapStyle } from "../../style.ts";
import type { Tincture } from "../../../society/heraldry.ts";
import { inkHatch, type HatchScheme } from "./hatch.ts";

export type ArmsPalette = {
  tincture(t: Tincture): string;
  readonly outline: string;
  readonly hatch: HatchScheme | null;
};

const HERALDIC: Record<Tincture, string> = {
  or: "#c8a032",
  argent: "#efe8d6",
  gules: "#a83232",
  azure: "#2f5a86",
  sable: "#2b2722",
  vert: "#3f6b46",
  purpure: "#6f4a78",
};

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
  const isInk = style.name === "ink";
  const table = isInk ? GREYS : HERALDIC;
  return {
    tincture: (t) => table[t],
    outline: style.ink,
    hatch: isInk ? inkHatch(style.paper, style.ink) : null,
  };
}
