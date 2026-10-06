import type { SvgNode } from "../../render/svg.ts";
import type { ForegroundElement } from "../geometry.ts";
import type { DressContext } from "./context.ts";
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
import { drownedStubNodes } from "./buildings.ts";
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

type WorksElement = Extract<
  ForegroundElement,
  { kind: "stilts" | "quay" | "mastRow" | "ship" | "mole" | "beachedHulls" | "jetty" | "nets" | "bridge" | "weir" | "mill" | "rubble" | "beams" | "drownedStubs" }
>;

/** Exhaustive on purpose: a new foreground kind without a dress breaks the build here, not silently on a blank plate. */
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
    case "birds":
      return e.items.map((i) => bird(c, i));
    case "seaSerpent":
      return [seaSerpent(c, e.x, e.y, e.s)];
    case "stilts":
    case "quay":
    case "mastRow":
    case "ship":
    case "mole":
    case "beachedHulls":
    case "jetty":
    case "nets":
    case "bridge":
    case "weir":
    case "mill":
    case "rubble":
    case "beams":
    case "drownedStubs":
      return worksNodes(c, e);
    default:
      return unreachable(e);
  }
}

function worksNodes(c: DressContext, e: WorksElement): SvgNode[] {
  switch (e.kind) {
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
  }
}

function unreachable(e: never): never {
  throw new RangeError(`no dress for foreground kind ${JSON.stringify(e)}`);
}
