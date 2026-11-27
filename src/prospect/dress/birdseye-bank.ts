import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arms } from "../../society/heraldry.ts";
import { VIEW_X0 } from "../geometry.ts";
import type { ProspectKind } from "../input.ts";
import type { PlateEra } from "../caption.ts";
import type { Box } from "../birdseye/types.ts";
import { VIEW_BOTTOM } from "../birdseye/window.ts";
import { hatchNode, poly, stroke, treeClump, washOr, type Engraver } from "./burin.ts";
import { FIGURE_WIDTH, castFor, figureNodes } from "./figures.ts";

export type BankParts = {
  readonly kind: ProspectKind;
  readonly harbor: boolean;
  readonly roads: number;
  readonly era: PlateEra;
  readonly arms: Arms | null;
};

const HEIGHT = 34;
const GAP = 6;
const EDGE = 22;

export function bankOf(e: Engraver, p: BankParts, rng: Rng): { readonly nodes: SvgNode[]; readonly box: Box } {
  const cast = castFor(p.kind, p.harbor, p.roads, p.era);
  const widths = cast.map((k) => (FIGURE_WIDTH[k] * HEIGHT) / 30);
  const span = Math.max(104, EDGE + widths.reduce((a, b) => a + b, 0) + GAP * (cast.length - 1) + EDGE);
  const k = span / 104;
  const outline = [
    { x: VIEW_X0, y: VIEW_BOTTOM - 30 },
    { x: VIEW_X0 + 40 * k, y: VIEW_BOTTOM - 36 },
    { x: VIEW_X0 + 88 * k, y: VIEW_BOTTOM - 22 },
    { x: VIEW_X0 + 104 * k, y: VIEW_BOTTOM },
    { x: VIEW_X0, y: VIEW_BOTTOM },
  ];
  const nodes: SvgNode[] = [
    el("path", { d: poly(outline), fill: washOr(e, "grassDeep"), ...stroke(e, 0.9) }),
    hatchNode(e, outline, -0.2, 2.6, 0.4, 0.6),
    ...treeClump(e, VIEW_X0 + 14, VIEW_BOTTOM - 14, 4.2, rng),
  ];
  let x = VIEW_X0 + EDGE;
  cast.forEach((kind, i) => {
    const width = widths[i]!;
    nodes.push(
      figureNodes(
        e,
        { kind, x: x + width / 2, y: VIEW_BOTTOM - 6 + (i % 2) * 2, h: HEIGHT, flip: i % 2 === 1 },
        p.arms,
      ),
    );
    x += width + GAP;
  });
  return { nodes, box: { x0: VIEW_X0, x1: VIEW_X0 + 104 * k, y0: VIEW_BOTTOM - 72, y1: VIEW_BOTTOM } };
}
