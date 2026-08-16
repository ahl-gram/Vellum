import { createRng } from "../core/rng.ts";
import { createLoreWriter } from "../society/lore.ts";
import { createProjection } from "../render/transform.ts";
import { quarryPool } from "./daily-hunt-clue-facts.ts";
import type { NamedSettlement, World } from "./types.ts";

/** Pure functions of a finished World, never imported by generate.ts; randomness comes only from createRng(seed).fork("daily-hunt"), so no world-generation stream reshuffles and no chart byte changes. */

export {
  buildClues,
  type Clue,
  type ClueKind,
} from "./daily-hunt-clues.ts";
export {
  TERRAIN_RADIUS,
  type ClueFindability,
  type TerrainBand,
} from "./daily-hunt-clue-facts.ts";
export {
  classifyClick,
  classifyDistanceBand,
  type ClickFeedback,
  type DistanceBand,
} from "./daily-hunt-click.ts";

export type Quarry = {
  readonly idx: number;
  readonly settlement: NamedSettlement;
};

/** Render-pixel rect shaped to match the browser's getBBox, measured by the page. */
export type LegendBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type Reveal = {
  readonly name: string;
  readonly formerName?: string;
  readonly founded: number;
  readonly line: string;
};

export function chooseQuarry(
  world: World,
  opts: { exclude?: ReadonlySet<number> } = {},
): Quarry | null {
  const { exclude } = opts;
  const base = quarryPool(world);
  if (base.length === 0) return null;

  const open = exclude && exclude.size > 0 ? base.filter(({ idx }) => !exclude.has(idx)) : base;
  const pool = open.length > 0 ? open : base;

  const chosen = createRng(world.recipe.seed).fork("daily-hunt").pick(pool);
  return { idx: chosen.idx, settlement: chosen.s };
}

export function legendExcluded(
  world: World,
  legendBox: LegendBox | null,
  widthPx = 1500,
): ReadonlySet<number> {
  const out = new Set<number>();
  if (!legendBox) return out;
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, Math.round(widthPx * 0.045));
  // Pad by about half a legend row so a glyph tucked under the card edge counts as hidden.
  const pad = 12 * (widthPx / 1500);
  const x0 = legendBox.x - pad;
  const y0 = legendBox.y - pad;
  const x1 = legendBox.x + legendBox.width + pad;
  const y1 = legendBox.y + legendBox.height + pad;
  world.settlements.forEach((s, i) => {
    const px = proj.px(s.x);
    const py = proj.py(s.y);
    if (px >= x0 && px <= x1 && py >= y0 && py <= y1) out.add(i);
  });
  return out;
}

/** The reveal draws on its own "daily-hunt-lore" fork, distinct from the page's lore fork, so it never echoes the capital blurb. */
/** Ruling 4's form, shared with the place card and the gazetteer so one fact reaches the reader in one voice. */
export function revealFormerLine(r: Reveal): string | null {
  return r.formerName ? `Once called ${r.formerName}.` : null;
}

export function revealLore(world: World, quarry: Quarry): Reveal {
  const s = quarry.settlement;
  if (s.ruined) {
    const event = world.history.events.find(
      (e) => e.kind === "ruin" && e.settlement === quarry.idx,
    );
    const line = event
      ? event.text
      : `${s.name} is marked on older charts, yet no living hand keeps its survey.`;
    return { name: s.name, founded: s.founded, line };
  }
  const lore = createLoreWriter(world, createRng(world.recipe.seed).fork("daily-hunt-lore"));
  return {
    name: s.name,
    ...(s.formerName === undefined ? {} : { formerName: s.formerName }),
    founded: s.founded,
    line: lore.settlementNote(s),
  };
}
