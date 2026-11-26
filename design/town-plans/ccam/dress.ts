// The mock's dress: the two prospect dresses' own tokens (src/render/style.ts) plus the limner's washes for the hand-coloured antique.
import { STYLES, type MapStyle } from "../../../src/render/style.ts";

export type Dress = {
  readonly key: "antique" | "ink";
  readonly style: MapStyle;
  readonly paper: string;
  readonly ink: string;
  readonly soft: string;
  readonly font: string;
  readonly coloured: boolean;
  readonly wash: {
    readonly roof: string;
    readonly roofChurch: string;
    readonly grass: string;
    readonly grassDeep: string;
    readonly wood: string;
    readonly water: string;
    readonly hill: string;
    readonly ground: string;
    readonly gold: string;
    readonly vermilion: string;
    readonly cartouche: string;
    readonly skin: string;
  };
};

const LIMNER = {
  roof: "#c9553a",
  roofChurch: "#7d93a6",
  grass: "#b9c98f",
  grassDeep: "#8aa96a",
  wood: "#6f9460",
  water: "#c6d6d0",
  hill: "#d6c79a",
  ground: "#e3d7b3",
  gold: "#c9a24a",
  vermilion: "#c23b22",
  cartouche: "#b7cbd3",
  skin: "#e8cfae",
} as const;

export function dressFor(key: "antique" | "ink", coloured: boolean): Dress {
  const style = STYLES[key];
  return {
    key, style, paper: style.paper, ink: style.ink, soft: style.inkSoft, font: style.fontFamily,
    coloured: coloured && key === "antique",
    wash: LIMNER,
  };
}

export const ANTIQUE_COLOURED = dressFor("antique", true);
export const ANTIQUE_PLAIN = dressFor("antique", false);
export const INK = dressFor("ink", false);
