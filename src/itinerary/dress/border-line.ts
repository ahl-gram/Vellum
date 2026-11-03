import type { SvgNode } from "../../render/svg.ts";
import type { Box } from "../../render/geometry.ts";
import type { RibbonInput } from "../input.ts";
import type { StripLayout } from "./layout.ts";
import type { RibbonContext } from "./context.ts";
import type { SeatKeep } from "./seats.ts";

export function borderHeights(_input: RibbonInput, _strip: StripLayout): number[] {
  return [];
}

export function onBorderLine(_boxes: ReadonlyArray<Box>, _ys: ReadonlyArray<number>): boolean {
  return false;
}

export function borderLines(
  _c: RibbonContext,
  _strip: StripLayout,
  _ys: ReadonlyArray<number>,
  _keep: SeatKeep,
): SvgNode[] {
  return [];
}
