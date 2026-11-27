import type { World } from "../../world/types.ts";
import type { MapStyle } from "../../render/style.ts";
import { renderSvg } from "../../render/svg.ts";
import { buildProspectInput, type ProspectInput } from "../input.ts";
import { eraFor, plateCaption } from "../caption.ts";
import { composeProspect } from "../compose.ts";
import { plateSurroundings } from "../surroundings.ts";
import type { EngravedProspect, PlateOptions } from "../finished.ts";
import { engraver } from "../dress/burin.ts";
import { houseItemNodes } from "../dress/birdseye-town.ts";
import { engraveC, type CBoxes } from "../dress/compose-c.ts";
import { composeBirdseye } from "./compose.ts";
import type { BirdseyeGeometry, TownItem } from "./types.ts";

export const BIRDSEYE_LIMIT_KB = 560;

const STEPS = 20;

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
  return Array.from({ length: n }, (_, i) => Math.floor((i + 1) * share) > Math.floor(i * share));
}

export type BirdseyeOptions = PlateOptions & { readonly share?: number };
export type EngravedBirdseye = EngravedProspect & {
  readonly geometry: BirdseyeGeometry;
  readonly boxes: CBoxes;
  readonly houses: number;
  readonly standing: number;
  readonly share: number;
};

type HouseItem = Extract<TownItem, { kind: "house" }>;
const isHouse = (item: TownItem): item is HouseItem => item.kind === "house";

function thinned(geometry: BirdseyeGeometry, share: number): BirdseyeGeometry {
  if (geometry.town === null) return geometry;
  const stands = evenShare(geometry.town.items.filter(isHouse).length, share);
  let seen = 0;
  const items = geometry.town.items.filter((item) => !isHouse(item) || stands[seen++]!);
  return { ...geometry, town: { ...geometry.town, items } };
}

export function engraveBirdseye(
  world: World,
  input: ProspectInput,
  style: MapStyle,
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
  const suffix = opts.idSuffix ?? `c-${style.name}-${input.seed}-${input.index}`;
  const render = (geo: BirdseyeGeometry) => {
    const { node, boxes } = engraveC(style, {
      input,
      geometry: geo,
      year,
      caption,
      surroundings,
      suffix,
      ...(opts.widthPx === undefined ? {} : { widthPx: opts.widthPx }),
    });
    return { svg: renderSvg(node), boxes };
  };
  const items = geometry.town?.items ?? [];
  const houses = items.filter(isHouse);
  const finish = (share: number, drawn: ReturnType<typeof render>, standing: number): EngravedBirdseye => ({
    svg: drawn.svg,
    era,
    caption,
    key: geometry.key,
    geometry,
    boxes: drawn.boxes,
    houses: houses.length,
    standing,
    share,
  });
  if (opts.share !== undefined) {
    const at = thinned(geometry, opts.share);
    return finish(opts.share, render(at), (at.town?.items ?? []).filter(isHouse).length);
  }
  const whole = render(geometry);
  const limit = BIRDSEYE_LIMIT_KB * 1024;
  const bytes = utf8Bytes(whole.svg);
  if (bytes <= limit) return finish(1, whole, houses.length);
  const e = engraver(style);
  const each = houses.map((item) => houseItemNodes(e, item).reduce((sum, node) => sum + renderSvg(node).length, 0));
  const fits = (k: number): boolean => {
    const stands = evenShare(houses.length, k / STEPS);
    return bytes - each.reduce((sum, n, i) => sum + (stands[i]! ? 0 : n), 0) <= limit;
  };
  let k = STEPS - 1;
  while (k > 0 && !fits(k)) k--;
  const share = k / STEPS;
  const at = thinned(geometry, share);
  return finish(share, render(at), (at.town?.items ?? []).filter(isHouse).length);
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
