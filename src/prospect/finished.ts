import type { World } from "../world/types.ts";
import type { MapStyle } from "../render/style.ts";
import { renderSvg, type SvgNode } from "../render/svg.ts";
import { buildProspectInput, type ProspectInput } from "./input.ts";
import { composeProspect } from "./compose.ts";
import { eraFor, plateCaption, type PlateCaption, type PlateEra } from "./caption.ts";
import { plateKey, type PlateKeyEntry } from "./key.ts";
import { dressContext } from "./dress/context.ts";
import { plateFurniture } from "./dress/furniture.ts";
import { renderProspect } from "./dress/plate.ts";

export type PlateOptions = {
  readonly idSuffix?: string;
  readonly seaName?: string | null;
  readonly widthPx?: number;
};

type Engraving = {
  readonly node: SvgNode;
  readonly era: PlateEra;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};

function engrave(input: ProspectInput, style: MapStyle, year: number, opts: PlateOptions): Engraving {
  const c = dressContext(style);
  const era = eraFor(input, year);
  const g =
    era === "before-founding"
      ? composeProspect(input, { era: "before-founding" })
      : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  const caption = plateCaption(input, g, era, year, opts.seaName ?? null);
  const key = plateKey(g);
  const hangs = input.kind === "capital" || input.kind === "seat";
  const arms = hangs && era !== "before-founding" ? input.arms : null;
  const suffix = opts.idSuffix ?? `${style.name}-${g.seed}-${g.index}`;
  const { engraved, furniture } = plateFurniture(c, caption, era, key, arms, suffix);
  const node = renderProspect(g, style, {
    idSuffix: suffix,
    engraved,
    furniture,
    ariaLabel: `The prospect of ${input.name}, chart ${input.seed}`,
    widthPx: opts.widthPx,
  });
  return { node, era, caption, key };
}

export function finishProspect(
  input: ProspectInput,
  style: MapStyle,
  year: number,
  opts: PlateOptions = {},
): SvgNode {
  return engrave(input, style, year, opts).node;
}

export type EngravedProspect = {
  readonly svg: string;
  readonly era: PlateEra;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};

export function engraveProspect(
  input: ProspectInput,
  style: MapStyle,
  year: number,
  opts: PlateOptions = {},
): EngravedProspect {
  const { node, era, caption, key } = engrave(input, style, year, opts);
  return { svg: renderSvg(node), era, caption, key };
}

export function engravedProspectPlate(world: World, index: number, style: MapStyle, year: number): EngravedProspect {
  return engraveProspect(buildProspectInput(world, index), style, year, { seaName: world.names.sea });
}

export function finishedPlateSvg(
  input: ProspectInput,
  style: MapStyle,
  year: number,
  opts: PlateOptions = {},
): string {
  return renderSvg(finishProspect(input, style, year, opts));
}

export function prospectPlate(
  world: World,
  index: number,
  style: MapStyle,
  year: number,
  widthPx?: number,
): string {
  return finishedPlateSvg(buildProspectInput(world, index), style, year, {
    seaName: world.names.sea,
    widthPx,
  });
}
