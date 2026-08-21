import type { SettlementKind } from "../society/sites.ts";
import type { World } from "../world/types.ts";
import { CELLS_PER_LEAGUE } from "../render/layers/scalebar.ts";
import { roadMask, roadWalk } from "./route.ts";
import { findEvents, type RibbonEvent } from "./events.ts";

const FLANK_OFFSET = 2.5;

export type RibbonSample = {
  readonly x: number;
  readonly y: number;
  readonly dist: number;
  readonly rel: number;
  readonly relL: number;
  readonly relR: number;
  readonly biomeL: number;
  readonly biomeR: number;
};

export type RibbonInput = {
  readonly seed: number;
  readonly fromIdx: number;
  readonly toIdx: number;
  readonly fromName: string;
  readonly toName: string;
  readonly fromKind: SettlementKind;
  readonly toKind: SettlementKind;
  readonly realmName: string | null;
  readonly worldName: string;
  readonly year: number;
  readonly totalCells: number;
  readonly totalLeagues: number;
  readonly samples: ReadonlyArray<RibbonSample>;
  readonly events: ReadonlyArray<RibbonEvent>;
};

function relAt(world: World, x: number, y: number): number {
  const cx = Math.min(world.elev.w - 1, Math.max(0, Math.round(x)));
  const cy = Math.min(world.elev.h - 1, Math.max(0, Math.round(y)));
  return (world.elev.at(cx, cy) - world.seaLevel) / (1 - world.seaLevel);
}

function biomeAt(world: World, x: number, y: number): number {
  const cx = Math.min(world.elev.w - 1, Math.max(0, Math.round(x)));
  const cy = Math.min(world.elev.h - 1, Math.max(0, Math.round(y)));
  return world.biomes[cx + cy * world.elev.w] as number;
}

/** Central-difference travel direction, smoothed over two cells each way. */
function directionAt(chain: ReadonlyArray<number>, w: number, k: number): { x: number; y: number } {
  const a = chain[Math.max(0, k - 2)] as number;
  const b = chain[Math.min(chain.length - 1, k + 2)] as number;
  const dx = (b % w) - (a % w);
  const dy = ((b / w) | 0) - ((a / w) | 0);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function buildRibbonInput(world: World, fromIdx: number, toIdx: number): RibbonInput | null {
  const from = world.settlements[fromIdx];
  const to = world.settlements[toIdx];
  if (!from || !to) return null;
  const mask = roadMask(world);
  const chain = roadWalk(world, mask, fromIdx, toIdx);
  if (!chain || chain.length < 4) return null;

  const w = world.elev.w;
  const samples: RibbonSample[] = [];
  const dists: number[] = [];
  let dist = 0;
  for (let k = 0; k < chain.length; k++) {
    const c = chain[k] as number;
    const x = c % w;
    const y = (c / w) | 0;
    if (k > 0) {
      const p = chain[k - 1] as number;
      dist += Math.hypot(x - (p % w), y - ((p / w) | 0));
    }
    dists.push(dist);
    const t = directionAt(chain, w, k);
    const rx = -t.y;
    const ry = t.x;
    samples.push({
      x,
      y,
      dist,
      rel: relAt(world, x, y),
      relL: relAt(world, x - rx * FLANK_OFFSET, y - ry * FLANK_OFFSET),
      relR: relAt(world, x + rx * FLANK_OFFSET, y + ry * FLANK_OFFSET),
      biomeL: biomeAt(world, x - rx * FLANK_OFFSET, y - ry * FLANK_OFFSET),
      biomeR: biomeAt(world, x + rx * FLANK_OFFSET, y + ry * FLANK_OFFSET),
    });
  }

  const events = findEvents(world, mask, chain, dists, fromIdx, toIdx);
  const realm = world.realms.labels[to.x + to.y * w] ?? -1;
  return {
    seed: world.recipe.seed,
    fromIdx,
    toIdx,
    fromName: from.name,
    toName: to.name,
    fromKind: from.kind,
    toKind: to.kind,
    realmName: realm >= 0 ? (world.names.realms[realm] ?? null) : null,
    worldName: world.title.title,
    year: world.title.year,
    totalCells: dist,
    totalLeagues: dist / CELLS_PER_LEAGUE,
    samples,
    events,
  };
}
