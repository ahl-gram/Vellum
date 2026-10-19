import { el } from "../../render/svg.ts";
import { r1, washOr, type Engraver } from "./burin.ts";
import type { Inked } from "./furniture.ts";

const RING: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0.866, 0.5],
  [0.5, 0.866],
  [0, 1],
  [-0.5, 0.866],
  [-0.866, 0.5],
  [-1, 0],
  [-0.866, -0.5],
  [-0.5, -0.866],
  [0, -1],
  [0.5, -0.866],
  [0.866, -0.5],
];

export function wreath(e: Engraver, cx: number, cy: number, r: number): Inked {
  const leaves: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = RING[i % 12]!,
      b = RING[(i + 1) % 12]!;
    const t = (i % 2) * 0.5;
    const ux = a[0] * (1 - t) + b[0] * t,
      uy = a[1] * (1 - t) + b[1] * t;
    const px = cx + ux * r,
      py = cy + uy * r,
      tx = -uy,
      ty = ux,
      dir = ux < 0 ? 1 : -1;
    leaves.push(
      `M${r1(px)} ${r1(py)}q${r1(ux * 2.4 + tx * 3 * dir)} ${r1(uy * 2.4 + ty * 3 * dir)} ${r1(ux * 0.6 + tx * 6.4 * dir)} ${r1(uy * 0.6 + ty * 6.4 * dir)}q${r1(-ux * 2 + tx * 3 * dir)} ${r1(-uy * 2 + ty * 3 * dir)} ${r1(-ux * 0.6 - tx * 6.4 * dir)} ${r1(-uy * 0.6 - ty * 6.4 * dir)}`,
    );
    leaves.push(
      `M${r1(px - ux * 2.2)} ${r1(py - uy * 2.2)}q${r1(-ux * 2.4 + tx * 3 * dir)} ${r1(-uy * 2.4 + ty * 3 * dir)} ${r1(-ux * 0.6 + tx * 6.4 * dir)} ${r1(-uy * 0.6 + ty * 6.4 * dir)}`,
    );
  }
  return {
    nodes: [
      el("circle", {
        cx: r1(cx),
        cy: r1(cy),
        r: r1(r),
        fill: e.paper,
        stroke: e.ink,
        "stroke-width": 0.5,
        "stroke-opacity": 0.6,
      }),
      el("path", {
        d: leaves.join(""),
        fill: washOr(e, "wood"),
        stroke: e.ink,
        "stroke-width": 0.5,
        "stroke-linejoin": "round",
      }),
      el("path", {
        d: `M${r1(cx - 3)} ${r1(cy + r + 3)}q3 -4 6 0q-3 2 -6 0M${r1(cx)} ${r1(cy + r + 1)}l-3 7M${r1(cx)} ${r1(cy + r + 1)}l3 7`,
        fill: "none",
        stroke: e.ink,
        "stroke-width": 0.6,
      }),
    ],
    boxes: [{ x0: cx - r - 7, x1: cx + r + 7, y0: cy - r - 7, y1: cy + r + 9 }],
  };
}
