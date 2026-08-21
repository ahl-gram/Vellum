import { createRng } from "../core/rng.ts";
import { el, renderSvg } from "../render/svg.ts";
import { STYLES, type StyleName } from "../render/style.ts";
import type { World } from "../world/types.ts";
import { buildRibbonInput, type RibbonInput } from "./input.ts";
import { ribbonDress } from "./dress/context.ts";
import { RIBBON_H, RIBBON_W } from "./dress/layout.ts";
import { renderRibbon } from "./dress/plate.ts";

export { RIBBON_H, RIBBON_W };

export function ribbonAria(input: RibbonInput): string {
  return (
    `An itinerary strip chart of the road from ${input.fromName} to ${input.toName}, ` +
    `${Math.round(input.totalLeagues)} leagues, drawn as a scroll in the manner of an old road atlas.`
  );
}

export function ribbonSvgFor(input: RibbonInput, styleName: StyleName): string {
  const style = STYLES[styleName];
  const c = ribbonDress(style);
  const rng = createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`);
  const root = el("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: RIBBON_W,
    height: RIBBON_H,
    viewBox: `0 0 ${RIBBON_W} ${RIBBON_H}`,
    role: "img",
    "aria-label": ribbonAria(input),
  }, [renderRibbon(c, input, rng)]);
  return renderSvg(root);
}

/** The facade: world + two settlement indices to a finished plate, or null when no road joins them. */
export function ribbonPlate(
  world: World,
  fromIdx: number,
  toIdx: number,
  styleName: StyleName,
): string | null {
  const input = buildRibbonInput(world, fromIdx, toIdx);
  if (input === null) return null;
  return ribbonSvgFor(input, styleName);
}
