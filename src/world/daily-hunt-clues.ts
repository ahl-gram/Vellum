import { createRng } from "../core/rng.ts";
import {
  buildClueFacts,
  type ClueCandidate,
  type ClueFindability,
} from "./daily-hunt-clue-facts.ts";
import type { Quarry } from "./daily-hunt.ts";
import type { World } from "./types.ts";

export type ClueKind =
  | "framing"
  | "ew"
  | "ns"
  | "river"
  | "lake"
  | "coast"
  | "onriver"
  | "realm"
  | "terrain"
  | "road"
  | "near";

/**
 * One antique survey line. `subject` carries the geometric fact a feature clue
 * asserts (a feature name, or a band token for the positional/terrain/road
 * clues) so callers and tests can verify truthfulness without parsing prose.
 * A `near` clue also carries `leagues`, the round scale-bar bound its text
 * quotes, for the same reason.
 */
export type Clue = {
  readonly kind: ClueKind;
  readonly text: string;
  readonly subject?: string;
  readonly leagues?: number;
};

/** Ratified narrowing target (#335): the walk stops once at most this many
 *  candidate villages stay consistent with every emitted clue. */
const NARROW_TARGET = 3;

/** Cap on a day's total lines (framing included), so a wide field cannot run
 *  the survey voice long. Mirrored by the narrowing test. */
const MAX_LINES = 8;

/** Seeded target lengths (framing included) the color pass fills toward. The
 *  reduction walk alone often stops at three lines, which reads thin next to
 *  the survey voice the hunt shipped with; extra truthful lines only ever make
 *  the puzzle fairer, never false. */
const TARGET_LINES = [5, 6];

const FRAMING: Clue = {
  kind: "framing",
  text:
    "Today's survey hides one small place, set down on the chart but left " +
    "unnamed in these notes. Read the lines, then find it.",
};

/**
 * Emit only geometrically truthful antique clues, chosen by a seeded,
 * discriminative walk (#335) rather than a fixed template:
 *
 * 1. Candidates come from `buildClueFacts` in
 *    `src/world/daily-hunt-clue-facts.ts`, each true of the quarry, FINDABLE
 *    on the rendered sheet (the page's `findable` gates run before selection,
 *    so every guarantee below holds on the list the player sees), and
 *    carrying a predicate any candidate village can be tested against.
 * 2. A fresh top-level fork ("daily-hunt-clues") picks ONE compass band to
 *    guarantee (ratified: at least one always survives) and shuffles the
 *    rest; the other compass axis goes to the END of the pool, so variety of
 *    kind is preferred over a second compass line.
 * 3. Reduction walk: each pool clue is kept only if it strictly shrinks the
 *    set of candidate villages consistent with everything kept so far. The
 *    walk stops at NARROW_TARGET remaining (or MAX_LINES, or an exhausted
 *    pool), so the ratified narrowing guarantee holds.
 * 4. Color pass: the list then fills toward a seeded TARGET_LINES length with
 *    further truthful clues that no longer need to reduce (features before
 *    the spare compass axis). Extra truth only makes the hunt fairer.
 * 5. Floor: never fewer than three lines, so featureless off-grid seeds and
 *    the page's readiness check keep their guarantee.
 *
 * Clue count floats by design.
 */
export function buildClues(
  world: World,
  quarry: Quarry,
  findable: ClueFindability = {},
): Clue[] {
  const facts = buildClueFacts(world, quarry, findable);
  const rng = createRng(world.recipe.seed).fork("daily-hunt-clues");

  const first = rng.pick(facts.compass);
  const other = facts.compass.find((c) => c !== first);
  const pool = [...rng.shuffled(facts.features), ...(other ? [other] : [])];
  const target = rng.pick(TARGET_LINES);

  const chosen: ClueCandidate[] = [first];
  let remaining = facts.pool.filter((e) => first.holds(e));
  for (const cand of pool) {
    if (remaining.length <= NARROW_TARGET || chosen.length >= MAX_LINES - 1) break;
    const next = remaining.filter((e) => cand.holds(e));
    if (next.length < remaining.length) {
      chosen.push(cand);
      remaining = next;
    }
  }

  for (const cand of pool) {
    if (chosen.length >= target - 1) break;
    if (!chosen.includes(cand)) chosen.push(cand);
  }

  return [FRAMING, ...chosen.map((c) => c.clue)];
}

// pruneUnlabeledFeatureClues is gone (#335): a post-hoc prune could delete a
// clue the reduction walk had counted on, silently breaking the narrowing and
// floor guarantees on the delivered list. Findability now gates candidates
// BEFORE selection via ClueFindability in src/world/daily-hunt-clue-facts.ts.
