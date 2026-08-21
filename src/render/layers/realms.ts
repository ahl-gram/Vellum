import { boxBlur } from "../../core/box-blur.ts";
import { createField } from "../../core/grid.ts";
import { chainBorderSegments, labelBorderSegments } from "../../core/segment-chains.ts";
import { chaikinSmooth, marchingSquares } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";

export function realmTintsLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  const { labels, seats } = world.realms;
  if (!style.politicalTints || seats.length <= 1) return null;

  const carried = world.region?.realmRings;
  if (carried) {
    return el(
      "g",
      { id: "layer-realm-tints" },
      carried.map(({ realm, rings }) =>
        el("path", {
          d: rings
            .map((r) => pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true))
            .join(""),
          fill: style.realmTints[ctx.realmTint[realm] as number] as string,
          "fill-opacity": style.name === "topographic" ? 0.16 : 0.11,
          "fill-rule": "evenodd",
        }),
      ),
    );
  }

  const { w, h } = world.elev;
  const nodes: SvgNode[] = [];

  for (let realm = 0; realm < seats.length; realm++) {
    const indicator = createField(w, h, (x, y) =>
      labels[x + y * w] === realm ? 1 : 0,
    );
    const soft = boxBlur(indicator, 3);
    const rings = marchingSquares(soft, 0.5)
      .filter((c) => c.closed)
      .map((c) => chaikinSmooth(c.points, true, 2));
    if (rings.length === 0) continue;
    const d = rings
      .map((r) =>
        pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true),
      )
      .join("");
    nodes.push(
      el("path", {
        d,
        fill: style.realmTints[ctx.realmTint[realm] as number] as string,
        "fill-opacity": style.name === "topographic" ? 0.16 : 0.11,
        "fill-rule": "evenodd",
      }),
    );
  }

  return el("g", { id: "layer-realm-tints" }, nodes);
}


export function realmBordersLayer(ctx: RenderCtx): SvgNode | null {
  const { world, proj, style } = ctx;
  const { labels, seats } = world.realms;
  if (seats.length <= 1) return null;
  const { w, h } = world.elev;
  const k = proj.widthPx / 1500;

  // Per-realm rings trace a shared seam twice, and the coincident dash phases measured as a SOLID line in real paint (plate-reader, seed 42), which no structural test can see.
  const carried = world.region?.realmBorders;
  if (carried) {
    return el(
      "g",
      { id: "layer-realm-borders" },
      carried.map((chain) =>
        el("path", {
          d: pathFrom(chain.map(([x, y]) => [proj.px(x), proj.py(y)] as const), false),
          fill: "none",
          stroke: style.borderStroke,
          "stroke-width": style.borderWidth * k,
          "stroke-dasharray": style.borderDash.map((d) => d * k).join(" "),
          "stroke-linecap": "round",
          "stroke-opacity": style.borderOpacity,
        }),
      ),
    );
  }

  const segs = labelBorderSegments(labels, w, h);
  if (segs.length === 0) return null;

  const chains = chainBorderSegments(segs).map((chain) =>
    chaikinSmooth(chain, false, 2).map(
      ([x, y]) => [proj.px(x), proj.py(y)] as const,
    ),
  );

  // KEEP THIS ATTRIBUTE ORDER: attributes serialize in insertion order, and reordering them regenerates the committed charts for no reason.
  return el(
    "g",
    { id: "layer-realm-borders" },
    chains.map((chain) =>
      el("path", {
        d: pathFrom(chain, false),
        fill: "none",
        stroke: style.borderStroke,
        "stroke-width": style.borderWidth * k,
        "stroke-dasharray": style.borderDash.map((d) => d * k).join(" "),
        "stroke-linecap": "round",
        "stroke-opacity": style.borderOpacity,
      }),
    ),
  );
}
