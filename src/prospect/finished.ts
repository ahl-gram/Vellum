import type { World } from "../world/types.ts";
import type { MapStyle } from "../render/style.ts";
import { renderSvg, type SvgNode } from "../render/svg.ts";
import { buildProspectInput, type ProspectInput } from "./input.ts";
import { composeProspect } from "./compose.ts";
import { eraFor, plateCaption } from "./caption.ts";
import { plateKey } from "./key.ts";
import { dressContext } from "./dress/context.ts";
import { plateFurniture } from "./dress/furniture.ts";
import { renderProspect } from "./dress/plate.ts";

export type PlateOptions = {
  readonly idSuffix?: string;
  readonly seaName?: string | null;
  readonly widthPx?: number;
};

export function finishProspect(
  input: ProspectInput,
  style: MapStyle,
  year: number,
  opts: PlateOptions = {},
): SvgNode {
  const c = dressContext(style);
  const era = eraFor(input, year);
  const g =
    era === "before-founding"
      ? composeProspect(input, { era: "before-founding" })
      : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  const caption = plateCaption(input, g, era, year, opts.seaName ?? null);
  const hangs = input.kind === "capital" || input.kind === "seat";
  const arms = hangs && era !== "before-founding" ? input.arms : null;
  const suffix = opts.idSuffix ?? `${style.name}-${g.seed}-${g.index}`;
  const { engraved, furniture } = plateFurniture(c, caption, era, plateKey(g), arms, suffix);
  return renderProspect(g, style, {
    idSuffix: suffix,
    engraved,
    furniture,
    ariaLabel: `The prospect of ${input.name}, chart ${input.seed}`,
    widthPx: opts.widthPx,
  });
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
