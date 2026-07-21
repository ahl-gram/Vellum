import { el, type SvgNode } from "../svg.ts";
import { prunePoints } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { CompassPlan } from "./compass.ts";
import type { CartouchePlan } from "./cartouche.ts";

/** Wave flourishes, one sea serpent, one ship — antique/ink open water. */
export function seaDecorLayer(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  compass: CompassPlan | null,
): SvgNode | null {
  const { style, world, proj, rng } = ctx;
  if (!style.seaDecorations) return null;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const drng = rng.fork("sea-decor");

  const avoid: Array<{ x: number; y: number; r: number }> = [
    {
      x: cartouche.rect.x + cartouche.rect.w / 2,
      y: cartouche.rect.y + cartouche.rect.h / 2,
      r: cartouche.rect.w * 0.7,
    },
  ];
  if (compass) avoid.push({ x: compass.cx, y: compass.cy, r: compass.r * 2.2 });

  const clearOf = (px: number, py: number, extra = 0): boolean =>
    avoid.every((a) => Math.hypot(px - a.x, py - a.y) > a.r + extra);

  const edgeClear = (px: number, py: number, need: number): boolean =>
    px - proj.margin > need &&
    py - proj.margin > need &&
    proj.widthPx - proj.margin - px > need &&
    proj.heightPx - proj.margin - py > need;

  const open: Array<{ x: number; y: number; d: number; edgeOk: boolean }> = [];
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const d = world.oceanDist[gx + gy * w] as number;
      if (d < 5) continue;
      // #251: oceanDist runs just as deep inside an inland lake, so on a region gate
      // to the parent's genuine sea or a wave/serpent/ship lands in a lake. Inert on
      // world sheets (no seaGate), keeping the committed goldens byte-identical.
      if (world.region?.seaGate && world.region.seaGate[gx + gy * w] === 0) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      if (!clearOf(px, py, 30 * k)) continue;
      open.push({ x: px, y: py, d, edgeOk: edgeClear(px, py, 75 * k) });
    }
  }

  const nodes: SvgNode[] = [];

  // wave clusters
  const waveSpots = prunePoints(drng.fork("waves").shuffled(open), 120 * k, 16);
  for (const spot of waveSpots) {
    const s = (0.85 + drng.range(0, 0.35)) * k;
    const wave = (ox: number, oy: number): SvgNode =>
      el("path", {
        d: `M${(spot.x + ox * s).toFixed(1)} ${(spot.y + oy * s).toFixed(1)}q${(4 * s).toFixed(1)} ${(-3 * s).toFixed(1)} ${(8 * s).toFixed(1)} 0q${(4 * s).toFixed(1)} ${(3 * s).toFixed(1)} ${(8 * s).toFixed(1)} 0`,
        fill: "none",
        stroke: style.inkSoft,
        "stroke-width": (0.9 * k).toFixed(2),
        "stroke-opacity": 0.5,
        "stroke-linecap": "round",
      });
    nodes.push(wave(-8, 0), wave(-2, 5));
  }

  // sea serpent: three humps, a curled head, a tail fin
  const deepSpots = open
    .filter((o) => o.d >= 8 && o.edgeOk && clearOf(o.x, o.y, 90 * k))
    .sort((a, b) => b.d - a.d);
  const claimSpot = (o: { x: number; y: number } | undefined, half: number) =>
    o && ctx.labels.tryClaim(
      { x: o.x - half, y: o.y - half, w: half * 2, h: half * 2 },
      6,
    )
      ? o
      : undefined;
  const serpentAt = claimSpot(
    deepSpots.find((o) => clearOf(o.x, o.y, 90 * k)),
    60 * k,
  );
  if (serpentAt) {
    const s = 1.5 * k;
    const { x, y } = serpentAt;
    const stroke = {
      stroke: style.ink, "stroke-width": (1.5 * k).toFixed(2),
      "stroke-linecap": "round" as const, "stroke-linejoin": "round" as const,
    };
    nodes.push(
      el("g", { id: "sea-serpent", opacity: 0.85 }, [
        // tail fin
        el("path", {
          d: `M${x - 34 * s} ${y}l${-6 * s} ${-7 * s}m${6 * s} ${7 * s}l${-8 * s} ${-2 * s}`,
          fill: "none", ...stroke,
        }),
        // humps
        el("path", {
          d: `M${x - 32 * s} ${y}q${7 * s} ${-13 * s} ${14 * s} 0`,
          fill: style.paper, ...stroke,
        }),
        el("path", {
          d: `M${x - 14 * s} ${y}q${7 * s} ${-16 * s} ${14 * s} 0`,
          fill: style.paper, ...stroke,
        }),
        // neck and head
        el("path", {
          d: `M${x + 4 * s} ${y}q${2 * s} ${-12 * s} ${8 * s} ${-13 * s}q${7 * s} ${-1.4 * s} ${7 * s} ${4 * s}q0 ${3.4 * s} ${-5 * s} ${2.6 * s}l${2 * s} ${2.4 * s}`,
          fill: style.paper, ...stroke,
        }),
        // eye
        el("circle", {
          cx: (x + 14.6 * s).toFixed(1), cy: (y - 10.4 * s).toFixed(1),
          r: (0.9 * k).toFixed(2), fill: style.ink,
        }),
        // ripples
        el("path", {
          d: `M${x - 38 * s} ${y + 4 * s}h${10 * s}m${6 * s} 0h${12 * s}m${8 * s} 0h${10 * s}`,
          fill: "none", stroke: style.inkSoft,
          "stroke-width": (0.8 * k).toFixed(2), "stroke-opacity": 0.55,
        }),
      ]),
    );
  }

  // a small ship under sail, somewhere else in open water
  const shipAt = claimSpot(
    deepSpots.find(
      (o) =>
        !serpentAt ||
        Math.hypot(o.x - serpentAt.x, o.y - serpentAt.y) > 260 * k,
    ),
    45 * k,
  );
  if (shipAt) {
    const s = 1.25 * k;
    const { x, y } = shipAt;
    const stroke = {
      stroke: style.ink, "stroke-width": (1.4 * k).toFixed(2),
      "stroke-linecap": "round" as const, "stroke-linejoin": "round" as const,
    };
    nodes.push(
      el("g", { id: "sea-ship", opacity: 0.85 }, [
        el("path", {
          d: `M${x - 13 * s} ${y - 2 * s}q${13 * s} ${7 * s} ${26 * s} 0l${-3 * s} ${-2.4 * s}h${-20 * s}Z`,
          fill: style.paper, ...stroke,
        }),
        el("path", { d: `M${x} ${y - 4.4 * s}V${y - 22 * s}`, fill: "none", ...stroke }),
        el("path", {
          d: `M${x} ${y - 21 * s}q${-11 * s} ${7 * s} 0 ${15 * s}Z`,
          fill: style.paper, ...stroke,
        }),
        el("path", {
          d: `M${x + 1.4 * s} ${y - 20 * s}q${8 * s} ${6 * s} ${1 * s} ${13 * s}Z`,
          fill: style.paper, ...stroke,
        }),
        el("path", {
          d: `M${x} ${y - 22 * s}l${5 * s} ${1.8 * s}l${-5 * s} ${1.8 * s}Z`,
          fill: style.ink,
        }),
        el("path", {
          d: `M${x - 18 * s} ${y + 3 * s}h${8 * s}m${5 * s} 0h${10 * s}m${4 * s} 0h${7 * s}`,
          fill: "none", stroke: style.inkSoft,
          "stroke-width": (0.8 * k).toFixed(2), "stroke-opacity": 0.55,
        }),
      ]),
    );
  }

  return el("g", { id: "layer-sea-decor" }, nodes);
}
