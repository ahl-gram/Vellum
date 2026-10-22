import type { Road } from "../../society/roads.ts";
import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

export function roadDress(
  rank: Road["rank"],
  region: boolean,
): { readonly width: number; readonly dash: readonly [number, number]; readonly opacity: number } {
  void region;
  return rank === "trunk"
    ? { width: 1.5, dash: [5, 3.5], opacity: 0.85 }
    : { width: 1.0, dash: [2.5, 3.5], opacity: 0.7 };
}

export function roadsLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  if (world.roads.length === 0) return null;
  const k = proj.widthPx / 1500;
  const topo = style.name === "topographic";
  const region = world.region !== undefined;
  const nodes: SvgNode[] = [];

  for (const road of world.roads) {
    const pts = road.points.map((p) => [proj.px(p.x), proj.py(p.y)] as const);
    const d = pathFrom(chaikinSmooth(pts, false, 2), false);
    const trunk = road.rank === "trunk";

    if (topo) {
      nodes.push(
        el("path", {
          d,
          fill: "none",
          stroke: style.paper,
          "stroke-width": (trunk ? 3.2 : 2.2) * k,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
        el("path", {
          d,
          fill: "none",
          stroke: style.road,
          "stroke-width": (trunk ? 1.7 : 1.0) * k,
          "stroke-linejoin": "round",
        }),
      );
    } else {
      const dress = roadDress(road.rank, region);
      nodes.push(
        el("path", {
          d,
          fill: "none",
          stroke: style.road,
          "stroke-width": dress.width * k,
          "stroke-dasharray": `${dress.dash[0] * k} ${dress.dash[1] * k}`,
          "stroke-opacity": dress.opacity,
          "stroke-linejoin": "round",
        }),
      );
    }
  }

  return el("g", { id: "layer-roads" }, nodes);
}
