import { el, pathFrom, type SvgNode } from "../svg.ts";
import { prunePoints, boxesOverlap, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { CartouchePlan } from "./cartouche.ts";
import type { CompassPlan } from "./compass.ts";

/**
 * Prevailing-wind arrows over open water (nautical charts). One seeded
 * direction per world, feathered shafts with a little angular jitter so
 * they read as hand-noted observations rather than a stamped pattern.
 */
export function windsLayer(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  compass: CompassPlan | null,
): SvgNode | null {
  const { style, world, proj, rng } = ctx;
  if (!style.winds) return null;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const wrng = rng.fork("winds"); // placement and jitter only; direction is the world's
  const prevailing = world.winds.dir;

  const avoid: Box[] = [cartouche.rect];
  if (compass) avoid.push(compass.box);
  const clear = (px: number, py: number): boolean =>
    avoid.every(
      (b) => !boxesOverlap(b, { x: px - 30, y: py - 30, w: 60, h: 60 }, 8),
    );

  const spots: Array<{ x: number; y: number }> = [];
  for (let gy = 4; gy < h - 4; gy += 3) {
    for (let gx = 4; gx < w - 4; gx += 3) {
      const d = world.oceanDist[gx + gy * w] as number;
      if (d < 6) continue;
      // #251: gate to the parent's genuine sea so a region's wind arrows never land
      // in an inland lake (oceanDist alone cannot tell a lake from the sea). Inert on
      // world sheets, so the committed goldens stay byte-identical.
      if (world.region?.seaGate && world.region.seaGate[gx + gy * w] === 0) continue;
      const px = proj.px(gx);
      const py = proj.py(gy);
      const edge = Math.min(
        px - proj.margin, py - proj.margin,
        proj.widthPx - proj.margin - px, proj.heightPx - proj.margin - py,
      );
      if (edge < 50 * k || !clear(px, py)) continue;
      spots.push({ x: px, y: py });
    }
  }

  const picked = prunePoints(wrng.shuffled(spots), 165 * k, 9);
  const arrows: SvgNode[] = [];
  for (const spot of picked) {
    const a = prevailing + wrng.range(-0.16, 0.16);
    const len = (24 + wrng.range(0, 8)) * k;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const x1 = spot.x - (dx * len) / 2;
    const y1 = spot.y - (dy * len) / 2;
    const x2 = spot.x + (dx * len) / 2;
    const y2 = spot.y + (dy * len) / 2;
    // chevron head
    const ha = a + Math.PI * 0.82;
    const hb = a - Math.PI * 0.82;
    const hl = 6.5 * k;
    // feather ticks at the tail
    const fa = a + Math.PI / 2;
    const ticks: string[] = [];
    for (const t of [0, 0.18]) {
      const tx = x1 + dx * len * t;
      const ty = y1 + dy * len * t;
      ticks.push(
        `M${tx.toFixed(1)} ${ty.toFixed(1)}L${(tx + Math.cos(fa) * 5 * k).toFixed(1)} ${(ty + Math.sin(fa) * 5 * k).toFixed(1)}`,
      );
    }
    arrows.push(
      el("path", {
        d:
          `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}` +
          `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(x2 + Math.cos(ha) * hl).toFixed(1)} ${(y2 + Math.sin(ha) * hl).toFixed(1)}` +
          `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(x2 + Math.cos(hb) * hl).toFixed(1)} ${(y2 + Math.sin(hb) * hl).toFixed(1)}` +
          ticks.join(""),
        fill: "none",
        stroke: style.inkSoft,
        "stroke-width": (1.1 * k).toFixed(2),
        "stroke-opacity": 0.6,
        "stroke-linecap": "round",
      }),
    );
  }

  if (arrows.length === 0) return null;
  return el("g", { id: "layer-winds" }, arrows);
}

/**
 * Faint streaks across the Rainfall plate's land, following the prevailing
 * wind, so the plate shows the wind that (from #74) drives it. Null for any
 * other theme. Clipped to the coastline; the nautical arrows keep the sea.
 */
export function windStreamsLayer(ctx: RenderCtx): SvgNode | null {
  if (ctx.theme !== "moisture") return null;
  const { style, world, proj, rng } = ctx;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;
  const srng = rng.fork("wind-streams");

  const spots: Array<{ x: number; y: number }> = [];
  for (let gy = 2; gy < h - 2; gy += 2) {
    for (let gx = 2; gx < w - 2; gx += 2) {
      if ((world.elev.data[gx + gy * w] as number) <= world.seaLevel) continue;
      spots.push({ x: proj.px(gx), y: proj.py(gy) });
    }
  }

  const picked = prunePoints(srng.shuffled(spots), 55 * k, 64);
  const streaks: SvgNode[] = [];
  for (const spot of picked) {
    const a = world.winds.dir + srng.range(-0.06, 0.06);
    const len = (26 + srng.range(0, 12)) * k;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const x1 = spot.x - (dx * len) / 2;
    const y1 = spot.y - (dy * len) / 2;
    streaks.push(
      el("path", {
        d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${(x1 + dx * len).toFixed(1)} ${(y1 + dy * len).toFixed(1)}`,
        fill: "none",
        // the strong ink: inkSoft washes out against the moisture fills
        stroke: style.ink,
        "stroke-width": (1.0 * k).toFixed(2),
        "stroke-opacity": 0.35,
        "stroke-linecap": "round",
      }),
    );
  }
  if (streaks.length === 0) return null;

  const coastD = ctx.coastRings.map((r) => pathFrom(r, true)).join("");
  return el("g", { id: "layer-wind-streams" }, [
    el("clipPath", { id: "wind-streams-clip" }, [
      el("path", { d: coastD, "clip-rule": "evenodd" }),
    ]),
    el("g", { "clip-path": "url(#wind-streams-clip)" }, streaks),
  ]);
}
