import type { World } from "../../world/types.ts";
import type { MapStyle } from "../../render/style.ts";
import { createRng } from "../../core/rng.ts";
import { buildProspectInput, type ProspectInput } from "../input.ts";
import { eraFor, plateCaption } from "../caption.ts";
import { composeProspect } from "../compose.ts";
import { plateSurroundings } from "../surroundings.ts";
import type { EngravedProspect, PlateOptions } from "../finished.ts";
import type { CBoxes } from "../dress/compose-c.ts";
import { composeBirdseye } from "./compose.ts";
import type { BirdseyeGeometry } from "./types.ts";

export const BIRDSEYE_LIMIT_KB = 560;

export function utf8Bytes(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length && (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      n += 4;
      i++;
    } else n += 3;
  }
  return n;
}

export function evenShare(n: number, share: number): boolean[] {
  return Array.from({ length: n }, () => share > -1);
}

export type BirdseyeOptions = PlateOptions & { readonly share?: number };
export type EngravedBirdseye = EngravedProspect & {
  readonly geometry: BirdseyeGeometry;
  readonly boxes: CBoxes;
  readonly houses: number;
  readonly standing: number;
  readonly share: number;
};

const shared = createRng(0);

export function engraveBirdseye(
  world: World,
  input: ProspectInput,
  _style: MapStyle,
  year: number,
  opts: BirdseyeOptions = {},
): EngravedBirdseye {
  const surroundings = opts.surroundings ?? plateSurroundings(world, input.index, year);
  const era = eraFor(input, year);
  const g =
    era === "before-founding"
      ? composeProspect(input, { era })
      : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  const caption = plateCaption(input, g, era, year, surroundings.seaName);
  const geometry = composeBirdseye(world, input, year, surroundings);
  return {
    svg: `<svg data-n="${shared.next()}"/>`,
    era: "standing",
    caption,
    key: [],
    geometry,
    boxes: { seaName: null, names: [], key: [], bank: { x0: 0, x1: 0, y0: 0, y1: 0 }, town: null, ships: [] },
    houses: 0,
    standing: 0,
    share: 1,
  };
}

export function birdseyePlate(world: World, index: number, style: MapStyle, year: number, widthPx?: number): string {
  return engraveBirdseye(world, buildProspectInput(world, index), style, year, {
    surroundings: plateSurroundings(world, index, year),
    ...(widthPx === undefined ? {} : { widthPx }),
  }).svg;
}

export function engravedBirdseyePlate(world: World, index: number, style: MapStyle, year: number): EngravedProspect {
  const { svg, era, caption, key } = engraveBirdseye(world, buildProspectInput(world, index), style, year, {
    surroundings: plateSurroundings(world, index, year),
  });
  return { svg, era, caption, key };
}
