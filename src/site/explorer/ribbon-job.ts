// The ribbon job's engine glue, shared by ./worker.ts and runInline in ./worker-client.ts
// (the prospect-job.ts pattern) so the two transports cannot drift apart.
import { createRng } from "../../core/rng.ts";
import { buildRibbonInput, type RibbonInput } from "../../itinerary/input.ts";
import { ribbonSvgFor } from "../../itinerary/finished.ts";
import { eventCaption } from "../../itinerary/prose.ts";
import { eventSeat, layoutRibbon, RIBBON_H, RIBBON_W } from "../../itinerary/dress/layout.ts";
import { roadMask, roadReachable, roadWalk } from "../../itinerary/route.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { RibbonEvent } from "../../itinerary/events.ts";
import type { SettlementKind } from "../../society/sites.ts";
import type { PlateDress } from "./prospect-job.ts";
import type { World } from "../../world/types.ts";

export interface RibbonSpec {
  readonly from: number | null;
  readonly to: number | null;
  readonly dress: PlateDress;
}

export interface RibbonOption {
  readonly i: number;
  readonly name: string;
  readonly kind: string;
  /** Whether any road leaves the place: only such a place can be set out from. */
  readonly roads: boolean;
}

export interface RibbonRow {
  readonly kind: RibbonEvent["kind"];
  readonly leagues: number;
  readonly text: string;
  readonly tier?: SettlementKind;
  readonly index?: number;
  readonly nx: number;
  readonly ny: number;
}

export interface RibbonPlateData {
  readonly svg: string;
  readonly fromIdx: number;
  readonly toIdx: number;
  readonly fromName: string;
  readonly toName: string;
  readonly leagues: number;
  readonly title: string;
  readonly year: number;
  readonly realm: string | null;
  readonly events: ReadonlyArray<RibbonRow>;
  readonly options: ReadonlyArray<RibbonOption>;
  readonly reachable: ReadonlyArray<number>;
}

function itineraryRows(input: RibbonInput): ReadonlyArray<RibbonRow> {
  const rng = createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`);
  const layout = layoutRibbon(input);
  return input.events.flatMap((e) => {
    const seat = eventSeat(layout, e.dist);
    if (seat === null) return [];
    return [{
      kind: e.kind,
      leagues: e.dist / CELLS_PER_LEAGUE,
      text: eventCaption(e, rng),
      ...(e.kind === "waypoint" ? { tier: e.tier, index: e.index } : {}),
      nx: seat.sx / RIBBON_W,
      ny: seat.sy / RIBBON_H,
    }];
  });
}

function validIndex(world: World, i: number | null): number | null {
  return i != null && Number.isInteger(i) && i >= 0 && i < world.settlements.length ? i : null;
}

function farthestReachable(world: World, mask: Uint8Array, from: number, reachable: ReadonlyArray<number>): number | null {
  let best: number | null = null;
  let bestLen = -1;
  for (const i of reachable) {
    const chain = roadWalk(world, mask, from, i);
    if (chain && chain.length > bestLen) {
      bestLen = chain.length;
      best = i;
    }
  }
  return best;
}

export function ribbonResultFor(world: World, spec: RibbonSpec): RibbonPlateData {
  const mask = roadMask(world);
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  let fromIdx = validIndex(world, spec.from) ?? (capital >= 0 ? capital : 0);
  let reachable = roadReachable(world, mask, fromIdx);
  if (reachable.length === 0 && fromIdx !== capital && capital >= 0) {
    fromIdx = capital;
    reachable = roadReachable(world, mask, fromIdx);
  }
  if (reachable.length === 0) {
    throw new Error("no road leaves this place: the survey has nothing to unroll");
  }
  const requested = validIndex(world, spec.to);
  const toIdx =
    requested !== null && requested !== fromIdx && reachable.includes(requested)
      ? requested
      : farthestReachable(world, mask, fromIdx, reachable);
  if (toIdx === null) throw new Error("no road joins these places");
  const input = buildRibbonInput(world, fromIdx, toIdx);
  if (input === null) throw new Error("no road joins these places");
  return {
    svg: ribbonSvgFor(input, spec.dress),
    fromIdx,
    toIdx,
    fromName: input.fromName,
    toName: input.toName,
    leagues: input.totalLeagues,
    title: world.title.title,
    year: input.year,
    realm: input.realmName,
    events: itineraryRows(input),
    options: world.settlements.map((s, i) => ({ i, name: s.name, kind: s.kind, roads: roadReachable(world, mask, i).length > 0 })),
    reachable,
  };
}
