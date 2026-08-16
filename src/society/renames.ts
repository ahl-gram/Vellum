import type { Rng } from "../core/rng.ts";
import { createNamer, isNearExisting, type Culture } from "./names.ts";

/** #49: a few living towns were called something else once. A different word from the same tongue, not an older form of the current one (that is #282's ground). Drawn on its own fork, so nothing else in the world moves. */

const SHARE = 0.15;
const MIN = 1;
const MAX = 4;
const NAME_DRAWS = 40;

type Renameable = {
  readonly name: string;
  readonly ruined: boolean;
};

function howMany(eligible: number): number {
  if (eligible === 0) return 0;
  return Math.min(MAX, Math.max(MIN, Math.round(eligible * SHARE)));
}

export function assignFormerNames(
  settlements: ReadonlyArray<Renameable>,
  culture: Culture,
  rng: Rng,
  taken: ReadonlySet<string>,
): ReadonlyMap<number, string> {
  const eligible = settlements.flatMap((s, i) => (s.ruined ? [] : [i]));
  const chosen = rng.shuffled(eligible).slice(0, howMany(eligible.length)).sort((a, b) => a - b);

  const namer = createNamer(rng, culture);
  const avoid = new Set(taken);
  const out = new Map<number, string>();

  for (const idx of chosen) {
    for (let draw = 0; draw < NAME_DRAWS; draw++) {
      const stem = namer.name("settlement");
      const key = stem.toLowerCase();
      if (avoid.has(key) || isNearExisting(key, avoid)) continue;
      avoid.add(key);
      out.set(idx, stem);
      break;
    }
  }
  return out;
}
