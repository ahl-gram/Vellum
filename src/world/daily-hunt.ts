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
 */

export type ClueKind =
  | "framing"
  | "ew"
  | "ns"
  | "river"
  | "lake"
  | "coast"
  | "onriver"
  | "realm";

/**
 * One antique survey line. `subject` carries the geometric fact a feature clue
 * asserts (a feature name, or a band token for the positional clues) so callers
 * and tests can verify truthfulness without parsing prose.
 */
export type Clue = {
  readonly kind: ClueKind;
  readonly text: string;
  readonly subject?: string;
};

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

export type DistanceBand = "cold" | "cool" | "warm" | "hot";

/** Grid-cell radius within which a named river or lake is "near" the quarry. */
const NEAR = 4;

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
 * Emit only geometrically truthful antique clues, always at least three: a
 * constant framing line plus an always-true east/west band and an always-true
 * north/south band (each with a central-tie wording so neither is ever empty).
 * Feature clues are appended only when each holds, so the floor of three is
 * guaranteed for any world, including featureless off-grid seeds.
 */
export function buildClues(world: World, quarry: Quarry): Clue[] {
  const s = quarry.settlement;
  const { x, y } = s;
  const clues: Clue[] = [];

  clues.push({
    kind: "framing",
    text:
      "Today's survey hides one small place, set down on the chart but left " +
      "unnamed in these notes. Read the lines, then find it.",
  });

  const cx = (world.elev.w - 1) / 2;
  const ew = x < cx ? "west" : x > cx ? "east" : "central";
  clues.push({
    kind: "ew",
    subject: ew,
    text:
      ew === "east"
        ? "It lies toward the eastern reach of the chart."
        : ew === "west"
          ? "It lies toward the western reach of the chart."
          : "It sits near the chart's central meridian, neither east nor west.",
  });

  const cy = (world.elev.h - 1) / 2;
  const ns = y < cy ? "north" : y > cy ? "south" : "central";
  clues.push({
    kind: "ns",
    subject: ns,
    text:
      ns === "north"
        ? "It lies in the northern part of the chart."
        : ns === "south"
          ? "It lies in the southern part of the chart."
          : "It sits near the chart's middle latitude, neither north nor south.",
  });

  const river = nearestNamedRiver(world, x, y);
  if (river && river.dist <= NEAR) {
    clues.push({
      kind: "river",
      subject: river.name,
      text: `It stands within sight of the river ${river.name}.`,
    });
  }

  const lake = nearestNamedLake(world, x, y);
  if (lake && lake.dist <= NEAR) {
    clues.push({
      kind: "lake",
      subject: lake.name,
      text: `Its prospect takes in the waters of ${lake.name}.`,
    });
  }

  if (s.harbor) {
    clues.push({ kind: "coast", text: "It is a harbor settlement, open to the sea." });
  }

  if (s.onRiver) {
    clues.push({ kind: "onriver", text: "A river runs through its bounds." });
  }

  const realm = realmNameAt(world, x, y);
  if (realm) {
    clues.push({ kind: "realm", subject: realm, text: `It answers to ${realm}.` });
  }

  return clues;
}

/**
 * Drop feature clues that name a map feature the chart never labeled, so the
 * hunt never sends a player looking for a name that is not printed anywhere.
 *
 * `buildClues` is a pure function of the World and (correctly) cites the nearest
 * NAMED river/lake, but the renderer only draws a subset of those labels (short
 * courses and collision losers are skipped, see `feature-labels.ts`). This prune
 * runs AFTER `buildClues`, keying off each clue's `subject`, and keeps a
 * `river`/`lake` clue only when `isLabeled(subject)` reports the label was drawn.
 * The caller (the page, which owns the rendered SVG) supplies `isLabeled`; all
 * other clue kinds pass through untouched. Returns a new array (never mutates).
 */
export function pruneUnlabeledFeatureClues(
  clues: readonly Clue[],
  isLabeled: (name: string) => boolean,
): Clue[] {
  return clues.filter((c) => {
    if (c.kind !== "river" && c.kind !== "lake") return true;
    return c.subject !== undefined && isLabeled(c.subject);
  });
}

/**
 * Map a grid distance to a warmer/colder band for click feedback. Monotonic:
 * a direct hit (distance 0) is "hot", and increasing distance never warms.
 */
export function classifyDistanceBand(gridDist: number, gridDiagonal: number): DistanceBand {
  const ratio = gridDiagonal > 0 ? gridDist / gridDiagonal : 0;
  if (ratio <= 0.1) return "hot";
  if (ratio <= 0.25) return "warm";
  if (ratio <= 0.5) return "cool";
  return "cold";
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

// --- internal geometry -------------------------------------------------------

function nearestNamedRiver(
  world: World,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const [i, name] of world.names.rivers) {
    const river = world.rivers[i];
    if (!river) continue;
    let d = Infinity;
    for (const p of river.points) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    if (best === null || d < best.dist) best = { name, dist: d };
  }
  return best;
}

function nearestNamedLake(
  world: World,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { name: lk.name, dist: d };
  }
  return best;
}

function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w];
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}
