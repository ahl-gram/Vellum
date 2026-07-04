import { createRng } from "../core/rng.ts";
import { createLoreWriter } from "../society/lore.ts";
import { createProjection } from "../render/transform.ts";
import type { NamedSettlement, World } from "./types.ts";

/**
 * The Daily Hunt: a deterministic click-to-find puzzle layered on the
 * seed-of-the-day page. Each day's seed hides one "forgotten place" that every
 * visitor hunts together, found by reading truthful antique clues and clicking
 * the chart.
 *
 * Every function here is a PURE function of a finished `World`. The module is
 * deliberately NOT imported by `world/generate.ts`: it runs after the world
 * exists, reads finished fields, and draws its own randomness from
 * `createRng(world.recipe.seed).fork("daily-hunt")` (a fresh top-level fork
 * that cannot reshuffle any world-generation stream). No `World` field is
 * added, so nothing crosses the Explorer worker boundary and no chart bytes
 * change: there is no seed re-roll and no parity tax.
 *
 * Clue building and click scoring live in ./daily-hunt-clues.ts and
 * ./daily-hunt-click.ts; they are re-exported here so importers keep this path.
 */

export {
  buildClues,
  pruneUnlabeledFeatureClues,
  type Clue,
  type ClueKind,
} from "./daily-hunt-clues.ts";
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

/**
 * A rectangle in render-pixel space (the chart's viewBox coordinates), shaped
 * to match the browser's `getBBox`/`getBoundingClientRect`. The page measures
 * the rendered legend into one of these so the hunt can avoid hiding its quarry
 * beneath the legend card.
 */
export type LegendBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type Reveal = {
  readonly name: string;
  readonly founded: number;
  readonly line: string;
};

/**
 * Pick the day's target deterministically from the broad village pool (the
 * uniform-glyph settlements, ~16 to 18 per seed), so the hunt is a real search
 * rather than a visible coin-flip between the two ruin glyphs. Ruined villages
 * stay IN the pool; ruin status is revealed only in the post-win payoff.
 *
 * Falls back gracefully so a target always exists where any settlement does:
 * non-seat villages, then any non-seat non-capital settlement, then anything.
 *
 * `opts.exclude` drops settlements the caller wants kept off the board (the page
 * passes the indices hidden under the legend, see `legendExcluded`); if that
 * would empty the pool the full pool is used, so a target always exists.
 */
export function chooseQuarry(
  world: World,
  opts: { exclude?: ReadonlySet<number> } = {},
): Quarry | null {
  const { exclude } = opts;
  const seats = new Set(world.realms.seats);
  const indexed = world.settlements.map((s, idx) => ({ s, idx }));

  const villages = indexed.filter(({ s, idx }) => s.kind === "village" && !seats.has(idx));
  const nonCapital = indexed.filter(({ s, idx }) => s.kind !== "capital" && !seats.has(idx));
  const base = villages.length > 0 ? villages : nonCapital.length > 0 ? nonCapital : indexed;
  if (base.length === 0) return null;

  const open = exclude && exclude.size > 0 ? base.filter(({ idx }) => !exclude.has(idx)) : base;
  const pool = open.length > 0 ? open : base;

  const chosen = createRng(world.recipe.seed).fork("daily-hunt").pick(pool);
  return { idx: chosen.idx, settlement: chosen.s };
}

/**
 * Indices of settlements whose projected position falls inside `legendBox` (in
 * render-pixel space), so `chooseQuarry` can keep the day's quarry from hiding
 * under the legend card. Pure: rebuilds the same grid->pixel projection the
 * chart used from `widthPx`, then tests each settlement against the measured
 * box. A null box (legend off) excludes nothing.
 */
export function legendExcluded(
  world: World,
  legendBox: LegendBox | null,
  widthPx = 1500,
): ReadonlySet<number> {
  const out = new Set<number>();
  if (!legendBox) return out;
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, Math.round(widthPx * 0.045));
  // A small pad (about half a legend row) so a settlement whose glyph merely
  // tucks under the card's edge is treated as hidden too, not just its center.
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

/**
 * The post-win payoff: the place's name, its founding year, and one secret
 * line. For a ruined quarry that is the chronicle's own abandonment event; for
 * a living one it is a fresh gazetteer note drawn on a fork distinct from the
 * page's "seed-of-the-day" lore fork, so the reveal never echoes the capital
 * blurb already shown.
 */
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
  return { name: s.name, founded: s.founded, line: lore.settlementNote(s) };
}
