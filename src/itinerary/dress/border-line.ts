import { el, type SvgNode } from "../../render/svg.ts";
import type { Box } from "../../render/geometry.ts";
import { r1 } from "../../prospect/dress/context.ts";
import type { RibbonInput } from "../input.ts";
import { stripPos, type StripLayout } from "./layout.ts";
import { BAND, stripBody } from "./cloth.ts";
import type { RibbonContext } from "./context.ts";
import type { SeatKeep } from "./seats.ts";

const GIVE = 2;
const MIN_RUN = 3;
const LINE_WIDTH = 1.1;

export function borderHeights(input: RibbonInput, strip: StripLayout): number[] {
  return input.events.flatMap((e) =>
    e.kind === "border" && strip.d0 <= e.dist && e.dist < strip.d1 ? [stripPos(strip, e.dist).sy] : [],
  );
}

export function onBorderLine(boxes: ReadonlyArray<Box>, ys: ReadonlyArray<number>): boolean {
  return boxes.some((b) => ys.some((y) => b.y - GIVE < y && y < b.y + b.h + GIVE));
}

function runsOf(x0: number, x1: number, y: number, give: ReadonlyArray<Box>): Array<readonly [number, number]> {
  const cuts = give
    .filter((b) => b.y - GIVE < y && y < b.y + b.h + GIVE)
    .map((b): readonly [number, number] => [b.x - GIVE, b.x + b.w + GIVE])
    .sort((p, q) => p[0] - q[0]);
  const runs: Array<readonly [number, number]> = [];
  let from = x0;
  for (const [a, b] of cuts) {
    if (a > from) runs.push([from, Math.min(a, x1)]);
    from = Math.max(from, b);
  }
  if (from < x1) runs.push([from, x1]);
  return runs.filter(([a, b]) => b - a >= MIN_RUN);
}

export function borderLines(
  c: RibbonContext,
  strip: StripLayout,
  ys: ReadonlyArray<number>,
  keep: SeatKeep,
): SvgNode[] {
  const give: Box[] = [
    ...keep.boxes,
    ...keep.discs.map((d) => ({ x: d.x - d.r, y: d.y - d.r, w: 2 * d.r, h: 2 * d.r })),
  ];
  const body = stripBody(strip);
  return ys.flatMap((sy) => {
    const x0 = c.paint !== null ? body.left(sy) + BAND : strip.x0 + 3;
    const x1 = c.paint !== null ? body.right(sy) - BAND : strip.x0 + strip.w - 3;
    const d = runsOf(x0, x1, sy, give)
      .map(([a, b]) => `M${r1(a)} ${r1(sy)}H${r1(b)}`)
      .join("");
    return d === ""
      ? []
      : [
          el("path", {
            class: "border",
            d,
            fill: "none",
            stroke: c.style.borderStroke,
            "stroke-width": LINE_WIDTH,
            "stroke-dasharray": c.style.borderDash.join(" "),
            "stroke-linecap": "round",
            "stroke-opacity": c.style.borderOpacity,
          }),
        ];
  });
}
