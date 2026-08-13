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

/** subject carries the geometric fact (and leagues the quoted bound) so truth can be verified without parsing prose. */
export type Clue = {
  readonly kind: ClueKind;
  readonly text: string;
  readonly subject?: string;
  readonly leagues?: number;
};

const NARROW_TARGET = 3;

const MAX_LINES = 8;

/** Seeded lengths the color pass fills toward; extra truthful lines only make the hunt fairer, never false. */
const TARGET_LINES = [5, 6];

const FRAMING: Clue = {
  kind: "framing",
  text:
    "Today's survey hides one small place, set down on the chart but left " +
    "unnamed in these notes. Read the lines, then find it.",
};

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

