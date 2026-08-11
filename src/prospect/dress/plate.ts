/**
 * The dress (#240): ProspectGeometry + a ratified style -> engraved SVG.
 * Ink and texture only: composition is Sub 2's (masses, walls, foreground,
 * in paint order), frame and caption are Sub 4's. Every color is a
 * render/style.ts token; the two-dress contract lives in context.ts.
 *
 * Determinism: dress-level jitter (waves, grass) draws from labeled forks
 * of the geometry's own seed, so the same (geometry, style) yields
 * byte-identical SVG; nothing here may call libm (guarded by
 * test/prospect/dress.test.ts). Coordinates round to 0.1 at emit, the
 * geometry.ts contract ("Sub 3 rounds at SVG emit").
 */

import { el, renderSvg, type SvgNode } from "../../render/svg.ts";
import type { MapStyle } from "../../render/style.ts";
import { createRng } from "../../core/rng.ts";
import {
  BACK_ROW_RAISE,
  PLATE_H,
  PLATE_W,
  VIEW_X0,
  VIEW_X1,
  groundAt,
  type ForegroundElement,
  type ProspectGeometry,
} from "../geometry.ts";
import { dressContext, r1, type DressContext } from "./context.ts";
import {
  beamNodes,
  bird,
  dune,
  fieldRowNodes,
  marshTuft,
  rippleDash,
  rubbleNodes,
  scrubRowNodes,
  seaSerpent,
  stiltNodes,
  treePalm,
  treePine,
  treeRound,
} from "./glyphs.ts";
import { drownedStubNodes, massNodes, wallNodes } from "./buildings.ts";
import { grassFlicks, groundNodes, ridgeNodes, skyNodes } from "./terrain.ts";
import { riverBankNodes, waterBandNodes } from "./water.ts";
import {
  beachedHullNodes,
  jettyNodes,
  mastRowNodes,
  moleNodes,
  netNodes,
  quayNodes,
  shipNodes,
} from "./harbor.ts";
import { bridgeNodes, millNodes, weirNodes } from "./rivercraft.ts";

export { PROSPECT_DRESSES, type ProspectDress } from "./context.ts";

export type DressOptions = {
  /** Scopes filter/gradient ids when many plates share one document. */
  readonly idSuffix?: string;
};

/** One foreground element's ink. Exhaustive: a kind Sub 2 grows without a
 * dress breaks the build here, not silently on a blank plate. */
export function foregroundNodes(c: DressContext, e: ForegroundElement): SvgNode[] {
  switch (e.kind) {
    case "fieldRows":
      return [fieldRowNodes(c, e.rows)];
    case "scrubRows":
      return [scrubRowNodes(c, e.rows)];
    case "trees": {
      const glyph = e.species === "pine" ? treePine : e.species === "palm" ? treePalm : treeRound;
      return e.items.map((i) => glyph(c, i));
    }
    case "marshTufts":
      return e.items.map((i) => marshTuft(c, i));
    case "dunes":
      return e.items.map((i) => dune(c, i));
    case "ripples":
      return e.items.map((i) => rippleDash(c, i.x, i.y, i.s));
    case "stilts":
      return [stiltNodes(c, e.posts)];
    case "quay":
      return quayNodes(c, e);
    case "mastRow":
      return mastRowNodes(c, e.masts);
    case "ship":
      return shipNodes(c, e.x, e.y, e.s);
    case "mole":
      return moleNodes(c, e);
    case "beachedHulls":
      return beachedHullNodes(c, e.hulls);
    case "jetty":
      return jettyNodes(c, e);
    case "nets":
      return netNodes(c, e.x, e.y);
    case "bridge":
      return bridgeNodes(c, e);
    case "weir":
      return weirNodes(c, e);
    case "mill":
      return millNodes(c, e);
    case "rubble":
      return [rubbleNodes(c, e.stones)];
    case "beams":
      return [beamNodes(c, e.items)];
    case "drownedStubs":
      return e.stubs.flatMap((s) => drownedStubNodes(c, s));
    case "birds":
      return e.items.map((i) => bird(c, i));
    case "seaSerpent":
      return [seaSerpent(c, e.x, e.y, e.s)];
    default:
      return unreachable(e);
  }
}

function unreachable(e: never): never {
  throw new RangeError(`no dress for foreground kind ${JSON.stringify(e)}`);
}

/** #rrggbb -> "r g b" channels in 0..1, 2dp, for the grain's color matrix. */
function inkChannels(ink: string): [string, string, string] {
  const ch = (i: number): string => (parseInt(ink.slice(i, i + 2), 16) / 255).toFixed(2);
  return [ch(1), ch(3), ch(5)];
}

function parchmentDefs(c: DressContext, suffix: string, grainSeed: number): SvgNode[] {
  const [r, g, b] = inkChannels(c.ink);
  return [
    el("filter", { id: `prospect-parch-${suffix}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", {
        type: "fractalNoise",
        baseFrequency: "0.012 0.014",
        numOctaves: 3,
        seed: grainSeed,
        stitchTiles: "stitch",
      }),
      el("feColorMatrix", {
        values: `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0.45 0 0 0 0`,
      }),
    ]),
    el("radialGradient", { id: `prospect-vig-${suffix}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": c.ink, "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": c.ink, "stop-opacity": 0.16 }),
    ]),
  ];
}

function parchmentOverlay(suffix: string): SvgNode[] {
  return [
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, filter: `url(#prospect-parch-${suffix})`, opacity: 0.5 }),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: `url(#prospect-vig-${suffix})` }),
  ];
}

export function renderProspect(
  g: ProspectGeometry,
  style: MapStyle,
  opts: DressOptions = {},
): SvgNode {
  const c = dressContext(style);
  const suffix = opts.idSuffix ?? `${style.name}-${g.seed}-${g.index}`;
  const parchment = style.parchmentTexture;

  const rng = createRng(g.seed);
  const rWaves = rng.fork(`prospect:${g.index}:dress:waves`);
  const rGrass = rng.fork(`prospect:${g.index}:dress:grass`);

  // Masses arrive back-to-front by descending raise; the walls paint after
  // the depth-raised back row and before everything at ground level, the
  // spike's ratified layering (geometry.ts's paint-order contract).
  const splitAt = g.masses.findIndex((m) => m.raise < BACK_ROW_RAISE);
  const split = splitAt === -1 ? g.masses.length : splitAt;
  const weightOf = (m: ProspectGeometry["masses"][number]): number =>
    m.raise >= BACK_ROW_RAISE ? 0.9 : m.form === "keep" ? 1.3 : 1.2;

  const children: SvgNode[] = [
    ...(parchment ? parchmentDefs(c, suffix, (g.seed * 31 + g.index * 7) % 9973) : []),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: style.paper }),
    ...(style.name === "ink" ? skyNodes(c) : []),
    ...(g.ridge ? ridgeNodes(c, g.ridge, g.ground.base) : []),
    ...groundNodes(c, g.ground, g.water?.kind === "drowned"),
    ...g.masses.slice(0, split).flatMap((m) => massNodes(c, m, weightOf(m))),
    ...g.walls.flatMap((w) => wallNodes(c, g.ground, w)),
    ...g.masses.slice(split).flatMap((m) => massNodes(c, m, weightOf(m))),
    ...(g.water ? waterBandNodes(c, g.water, rWaves) : []),
    ...(g.water?.kind === "river" ? riverBankNodes(c, g.water, rGrass) : []),
    ...g.foreground.flatMap((e) => foregroundNodes(c, e)),
    ...(g.water === null
      ? [grassFlicks(c, rGrass, (x) => groundAt(g.ground, x), VIEW_X0 + 14, VIEW_X1 - 14, 12)]
      : []),
    ...(parchment ? parchmentOverlay(suffix) : []),
  ];

  return el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 ${PLATE_W} ${PLATE_H}`,
      width: PLATE_W,
      height: PLATE_H,
      role: "img",
      "aria-label": `An engraved prospect, plate ${r1(g.index)} of seed ${r1(g.seed)}`,
    },
    children,
  );
}

export function prospectSvg(
  g: ProspectGeometry,
  style: MapStyle,
  opts: DressOptions = {},
): string {
  return renderSvg(renderProspect(g, style, opts));
}
