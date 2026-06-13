import { chaikinSmooth } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

export function roadsLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  if (world.roads.length === 0) return null;
  const k = proj.widthPx / 1500;
  const topo = style.name === "topographic";
  const nodes: SvgNode[] = [];

  for (const road of world.roads) {
    const pts = road.points.map(
      (p) => [proj.px(p.x), proj.py(p.y)] as const,
    );
    const d = pathFrom(chaikinSmooth(pts, false, 2), false);
    const trunk = road.rank === "trunk";

    if (topo) {
      nodes.push(
        el("path", {
          d, fill: "none", stroke: style.paper,
          "stroke-width": (trunk ? 3.2 : 2.2) * k,
          "stroke-linecap": "round", "stroke-linejoin": "round",
        }),
        el("path", {
          d, fill: "none", stroke: style.road,
          "stroke-width": (trunk ? 1.7 : 1.0) * k,
          "stroke-linejoin": "round",
        }),
      );
    } else {
      nodes.push(
        el("path", {
          d, fill: "none", stroke: style.road,
          "stroke-width": (trunk ? 1.5 : 1.0) * k,
          "stroke-dasharray": trunk ? `${5 * k} ${3.5 * k}` : `${2.5 * k} ${3.5 * k}`,
          "stroke-opacity": trunk ? 0.85 : 0.7,
          "stroke-linejoin": "round",
        }),
      );
    }
  }

  return el("g", { id: "layer-roads" }, nodes);
}
