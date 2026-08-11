/**
 * The water band (#240): ocean sheet, the chart's 3-pass waterline halo,
 * the coast stroke, and dressed waves. Ink's ocean IS its paper (a token
 * fact, style.ts), so the sheet drops out and the waterline alone carries
 * the water, exactly as the chart behaves in that dress.
 */

import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { VIEW_X0, VIEW_X1, type Water } from "../geometry.ts";
import { rippleDash, waveFlourish } from "./glyphs.ts";
import { r1, stroke, type DressContext } from "./context.ts";

/** The 3-pass halo the chart lays along its coasts, scaled to the plate. */
const HALO = [
  { w: 5.5, o: 0.16 },
  { w: 3.3, o: 0.26 },
  { w: 1.6, o: 0.42 },
] as const;

export function waterBandNodes(c: DressContext, water: Water, rng: Rng): SvgNode[] {
  const st = c.style;
  const { y0, y1 } = water;
  const out: SvgNode[] = [];
  if (st.ocean !== st.paper) {
    out.push(
      el("rect", { x: VIEW_X0, y: r1(y0), width: VIEW_X1 - VIEW_X0, height: r1(y1 - y0), fill: st.ocean }),
    );
  }
  for (const ring of HALO) {
    out.push(
      el("path", {
        d: `M${VIEW_X0} ${r1(y0)}H${VIEW_X1}`,
        fill: "none",
        stroke: st.waterline,
        "stroke-width": ring.w,
        "stroke-opacity": ring.o,
      }),
    );
  }
  out.push(
    el("path", { d: `M${VIEW_X0} ${r1(y0)}H${VIEW_X1}`, fill: "none", stroke: st.coastStroke, "stroke-width": 1.2 }),
  );
  const waves = st.name === "ink" ? 5 : 3;
  for (let i = 0; i < waves; i++) {
    out.push(
      waveFlourish(
        c,
        VIEW_X0 + 30 + rng.next() * (VIEW_X1 - VIEW_X0 - 90),
        y0 + 8 + rng.next() * (y1 - y0 - 16),
        0.9 + rng.next() * 0.3,
      ),
    );
  }
  for (let i = 0; i < 2; i++) {
    out.push(
      rippleDash(
        c,
        VIEW_X0 + 40 + rng.next() * (VIEW_X1 - VIEW_X0 - 140),
        y0 + 6 + rng.next() * (y1 - y0 - 12),
        1,
      ),
    );
  }
  return out;
}

/** The river's near bank below the water: a bank line and its grasses.
 * Painted before the foreground so the bridge lands over it. */
export function riverBankNodes(c: DressContext, water: Water, rng: Rng): SvgNode[] {
  const parts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const x = VIEW_X0 + 16 + rng.next() * (VIEW_X1 - VIEW_X0 - 32);
    const y = water.y1 + 5 + rng.next() * 9;
    parts.push(`M${r1(x)} ${r1(y)}l${r1(2 + rng.next() * 3)} 0`);
  }
  return [
    el("path", { d: `M${VIEW_X0} ${r1(water.y1)}H${VIEW_X1}`, fill: "none", ...stroke(c, 1.1) }),
    el("path", {
      d: parts.join(""),
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.6,
      "stroke-opacity": 0.8,
    }),
  ];
}
