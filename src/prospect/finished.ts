import type { World } from "../world/types.ts";
import type { MapStyle } from "../render/style.ts";
import { renderSvg, type SvgNode } from "../render/svg.ts";
import { buildProspectInput, type ProspectInput } from "./input.ts";
import { composeProspect } from "./compose.ts";
import type { ProspectGeometry } from "./geometry.ts";
import { eraFor, plateCaption, type PlateCaption, type PlateEra } from "./caption.ts";
import { plateKey, type PlateKeyEntry } from "./key.ts";
import { NO_SURROUNDINGS, plateSurroundings, type Surroundings } from "./surroundings.ts";
import { engraveE, type EngravedE } from "./dress/compose-e.ts";

export type PlateOptions = {
  readonly idSuffix?: string;
  readonly surroundings?: Surroundings;
  readonly widthPx?: number;
};

type Engraving = EngravedE & {
  readonly g: ProspectGeometry;
  readonly era: PlateEra;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};

export function engravePlate(input: ProspectInput, style: MapStyle, year: number, opts: PlateOptions = {}): Engraving {
  const era = eraFor(input, year);
  const g =
    era === "before-founding"
      ? composeProspect(input, { era: "before-founding" })
      : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  const surroundings = opts.surroundings ?? NO_SURROUNDINGS;
  const caption = plateCaption(input, g, era, year, surroundings.seaName);
  const key = plateKey(g, { input, surroundings, era });
  const suffix = opts.idSuffix ?? `${style.name}-${g.seed}-${g.index}`;
  const engraved = engraveE(style, { input, g, era, year, caption, key, surroundings, suffix, ...(opts.widthPx === undefined ? {} : { widthPx: opts.widthPx }) });
  return { ...engraved, g, era, caption, key };
}

export function finishProspect(input: ProspectInput, style: MapStyle, year: number, opts: PlateOptions = {}): SvgNode {
  return engravePlate(input, style, year, opts).node;
}

export type EngravedProspect = {
  readonly svg: string;
  readonly era: PlateEra;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};

export function engraveProspect(input: ProspectInput, style: MapStyle, year: number, opts: PlateOptions = {}): EngravedProspect {
  const { node, era, caption, key } = engravePlate(input, style, year, opts);
  return { svg: renderSvg(node), era, caption, key };
}

export function engravedProspectPlate(world: World, index: number, style: MapStyle, year: number): EngravedProspect {
  return engraveProspect(buildProspectInput(world, index), style, year, { surroundings: plateSurroundings(world, index, year) });
}

export function finishedPlateSvg(input: ProspectInput, style: MapStyle, year: number, opts: PlateOptions = {}): string {
  return renderSvg(finishProspect(input, style, year, opts));
}

export function prospectPlate(world: World, index: number, style: MapStyle, year: number, widthPx?: number): string {
  return finishedPlateSvg(buildProspectInput(world, index), style, year, {
    surroundings: plateSurroundings(world, index, year),
    ...(widthPx === undefined ? {} : { widthPx }),
  });
}
