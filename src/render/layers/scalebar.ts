import { el, type SvgNode } from "../svg.ts";
import type { Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";

const CELLS_PER_LEAGUE = 2.2;
const NICE_TOTALS = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200];
// #249: a regional survey zooms in (up to 8x), so px-per-league grows until even
// the smallest world total (20) overruns the frame. Extend the ladder downward
// with smaller round totals, all even so the mid tick (total / 2) stays whole.
const REGION_NICE_TOTALS = [2, 4, 10, ...NICE_TOTALS];

export type ScalebarPlan = { readonly box: Box };

export function planScalebar(ctx: RenderCtx): ScalebarPlan {
  const { proj } = ctx;
  const k = proj.widthPx / 1500;
  const w = 215 * k;
  const h = 34 * k;
  return {
    box: {
      x: proj.margin + 22 * k,
      y: proj.heightPx - proj.margin - 24 * k - h,
      w,
      h,
    },
  };
}

export function scalebarLayer(ctx: RenderCtx, plan: ScalebarPlan): SvgNode {
  const { style, proj, world } = ctx;
  const k = proj.widthPx / 1500;
  // leagues are defined in WORLD cells; regional charts zoom the scale
  const worldCellsPerCell = world.region
    ? ((world.region.window.u1 - world.region.window.u0) *
        (world.region.worldGridW - 1)) /
      (world.elev.w - 1)
    : 1;
  const pxPerLeague = (proj.scale / worldCellsPerCell) * CELLS_PER_LEAGUE;
  const target = 200 * k;

  let total: number;
  if (world.region) {
    // #249: at a region's zoom the bar must FIT the plot, not merely sit closest
    // to the target width, or a deep survey's bar overruns the frame. Take the
    // largest round total whose bar is within target, falling back to the smallest
    // (the extended ladder's floor always fits, so this never overflows).
    total = REGION_NICE_TOTALS[0] as number;
    for (const t of REGION_NICE_TOTALS) {
      if (t * pxPerLeague <= target) total = t;
    }
  } else {
    total = NICE_TOTALS[NICE_TOTALS.length - 1] as number;
    let bestDiff = Infinity;
    for (const t of NICE_TOTALS) {
      const diff = Math.abs(t * pxPerLeague - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        total = t;
      }
    }
  }

  const barW = total * pxPerLeague;
  const barH = 7 * k;
  const x0 = plan.box.x;
  const y0 = plan.box.y + plan.box.h - barH - 12 * k;
  const segments = 4;
  const segW = barW / segments;

  const cells: SvgNode[] = [];
  for (let i = 0; i < segments; i++) {
    cells.push(
      el("rect", {
        x: x0 + i * segW, y: y0, width: segW, height: barH,
        fill: i % 2 === 0 ? style.ink : style.paper,
        stroke: style.ink, "stroke-width": 1 * k,
      }),
    );
  }

  const label = (lx: number, value: number): SvgNode =>
    el(
      "text",
      {
        x: lx, y: y0 + barH + 11 * k, "text-anchor": "middle",
        "font-family": style.fontFamily, "font-size": (9.5 * k).toFixed(1),
        fill: style.ink,
      },
      [String(value)],
    );

  return el("g", { id: "layer-scalebar" }, [
    el("rect", {
      x: plan.box.x - 8 * k, y: plan.box.y - 4 * k,
      width: plan.box.w + 16 * k, height: plan.box.h + 8 * k,
      fill: style.paper, "fill-opacity": 0.72, rx: 3 * k,
    }),
    el(
      "text",
      {
        x: x0 + barW / 2, y: y0 - 6 * k, "text-anchor": "middle",
        "font-family": style.fontFamily, "font-size": (10.5 * k).toFixed(1),
        "font-style": "italic", fill: style.ink,
      },
      ["Leagues"],
    ),
    ...cells,
    label(x0, 0),
    label(x0 + barW / 2, total / 2),
    label(x0 + barW, total),
  ]);
}
