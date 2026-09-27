import { boxBlur } from "../../core/box-blur.ts";
import { createField } from "../../core/grid.ts";
import { chainBorderSegments, labelBorderSegments } from "../../core/segment-chains.ts";
import { chaikinSmooth, marchingSquares } from "../../terrain/contours.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";
import type { MapStyle } from "../style.ts";
import type { World } from "../../world/types.ts";

type CarriedRings = NonNullable<NonNullable<World["region"]>["realmRings"]>;

function carriedTintPaths(ctx: RenderCtx, carried: CarriedRings): SvgNode[] {
  const { proj, style } = ctx;
  return carried.map(({ realm, rings }) =>
    el("path", {
      d: rings
        .map((r) => pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true))
        .join(""),
      fill: style.realmTints[ctx.realmTint[realm] as number] as string,
      "fill-opacity": style.name === "topographic" ? 0.16 : 0.11,
      "fill-rule": "evenodd",
    }),
  );
}

function realmTintPath(ctx: RenderCtx, realm: number): SvgNode | null {
  const { world, proj, style } = ctx;
  const { labels } = world.realms;
  const { w, h } = world.elev;
  const indicator = createField(w, h, (x, y) =>
    labels[x + y * w] === realm ? 1 : 0,
  );
  const soft = boxBlur(indicator, 3);
  const rings = marchingSquares(soft, 0.5)
    .filter((c) => c.closed)
    .map((c) => chaikinSmooth(c.points, true, 2));
  if (rings.length === 0) return null;
  const d = rings
    .map((r) =>
      pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)] as const), true),
    )
    .join("");
  return el("path", {
    d,
    fill: style.realmTints[ctx.realmTint[realm] as number] as string,
    "fill-opacity": style.name === "topographic" ? 0.16 : 0.11,
    "fill-rule": "evenodd",
  });
}

export function realmTintsLayer(ctx: RenderCtx): SvgNode | null {
  const { world, style } = ctx;
  const { seats } = world.realms;
  if (!style.politicalTints || seats.length <= 1) return null;

  const carried = world.region?.realmRings;
  if (carried) return el("g", { id: "layer-realm-tints" }, carriedTintPaths(ctx, carried));

  const nodes: SvgNode[] = [];
  for (let realm = 0; realm < seats.length; realm++) {
    const node = realmTintPath(ctx, realm);
    if (node) nodes.push(node);
  }

  return el("g", { id: "layer-realm-tints" }, nodes);
}

// KEEP THIS ATTRIBUTE ORDER: attributes serialize in insertion order, and reordering them regenerates the committed charts for no reason.
function borderPathNode(path: string, style: MapStyle, k: number): SvgNode {
  return el("path", {
    d: path,
    fill: "none",
    stroke: style.borderStroke,
    "stroke-width": style.borderWidth * k,
    "stroke-dasharray": style.borderDash.map((d) => d * k).join(" "),
    "stroke-linecap": "round",
    "stroke-opacity": style.borderOpacity,
  });
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
        borderPathNode(pathFrom(chain.map(([x, y]) => [proj.px(x), proj.py(y)] as const), false), style, k),
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

  return el(
    "g",
    { id: "layer-realm-borders" },
    chains.map((chain) => borderPathNode(pathFrom(chain, false), style, k)),
  );
}
