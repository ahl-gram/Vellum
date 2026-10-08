import { minMax } from "../../core/grid.ts";
import { el, type SvgNode } from "../svg.ts";
import { prunePoints, boxesOverlap, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { MapStyle } from "../style.ts";
import type { Rng } from "../../core/rng.ts";
import type { CartouchePlan } from "./cartouche.ts";
import type { CompassPlan } from "./compass.ts";

type Spot = { x: number; y: number; depth: number; dist: number };

function soundingCandidates(ctx: RenderCtx, avoid: ReadonlyArray<Box>, srng: Rng): { spots: Spot[]; rocks: Spot[] } {
  const { world, proj } = ctx;
  const { w, h, data } = world.elev;
  const sea = world.seaLevel;
  const { min } = minMax(world.elev);
  const below = Math.max(1e-9, sea - min);

  const clear = (px: number, py: number): boolean =>
    avoid.every((b) => !boxesOverlap(b, { x: px - 8, y: py - 8, w: 16, h: 16 }, 8));

  const spots: Spot[] = [];
  const rocks: Spot[] = [];
  for (let gy = 2; gy < h - 2; gy += 2) {
    for (let gx = 2; gx < w - 2; gx += 2) {
      const i = gx + gy * w;
      const e = data[i] as number;
      if (e > sea) continue;
      if (world.region?.seaGate && world.region.seaGate[i] === 0) continue;
      const dist = world.oceanDist[i] as number;
      const px = proj.px(gx + srng.range(-0.6, 0.6));
      const py = proj.py(gy + srng.range(-0.6, 0.6));
      if (px < proj.margin + 14 || px > proj.widthPx - proj.margin - 14) continue;
      if (py < proj.margin + 14 || py > proj.heightPx - proj.margin - 14) continue;
      if (!clear(px, py)) continue;
      const depth = (sea - e) / below;
      if (dist >= 2) spots.push({ x: px, y: py, depth, dist });
      else if (dist >= 1 && depth < 0.12) rocks.push({ x: px, y: py, depth, dist });
    }
  }
  return { spots, rocks };
}

function soundingNodes(style: MapStyle, k: number, srng: Rng, picked: ReadonlyArray<Spot>): SvgNode[] {
  return picked.map((s) => {
    const fathoms = Math.max(1, Math.round(s.depth * 38));
    const tilt = srng.range(-9, 9);
    return el(
      "text",
      {
        x: s.x.toFixed(1),
        y: s.y.toFixed(1),
        "text-anchor": "middle",
        transform: `rotate(${tilt.toFixed(0)} ${s.x.toFixed(1)} ${s.y.toFixed(1)})`,
        "font-family": style.fontFamily,
        "font-size": (8.5 * k).toFixed(1),
        "font-style": "italic",
        fill: style.ink,
        "fill-opacity": 0.62,
      },
      [String(fathoms)],
    );
  });
}

function rockNodes(style: MapStyle, k: number, rockPicked: ReadonlyArray<Spot>): SvgNode[] {
  return rockPicked.flatMap((r) => {
    const s = 3 * k;
    return [
      el("path", {
        d: `M${(r.x - s).toFixed(1)} ${r.y.toFixed(1)}H${(r.x + s).toFixed(1)}M${r.x.toFixed(1)} ${(r.y - s).toFixed(1)}V${(r.y + s).toFixed(1)}`,
        stroke: style.ink,
        "stroke-width": (0.9 * k).toFixed(2),
        "stroke-opacity": 0.7,
      }),
      el("circle", {
        cx: r.x.toFixed(1),
        cy: r.y.toFixed(1),
        r: (0.8 * k).toFixed(2),
        fill: style.ink,
        "fill-opacity": 0.7,
      }),
    ];
  });
}

export function soundingsLayer(ctx: RenderCtx, cartouche: CartouchePlan, compass: CompassPlan | null): SvgNode | null {
  const { style, proj, rng } = ctx;
  if (!style.soundings) return null;
  const k = proj.widthPx / 1500;
  const srng = rng.fork("soundings");

  const avoid: Box[] = [cartouche.rect];
  if (compass) avoid.push(compass.box);
  const { spots, rocks } = soundingCandidates(ctx, avoid, srng);

  const picked = prunePoints(srng.shuffled(spots), 52 * k, 170);
  const rockPicked = prunePoints(srng.shuffled(rocks), 110 * k, 10);

  return el("g", { id: "layer-soundings" }, [
    ...soundingNodes(style, k, srng, picked),
    ...rockNodes(style, k, rockPicked),
  ]);
}
