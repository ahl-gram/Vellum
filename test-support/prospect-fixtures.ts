// Hand-built ProspectInput fixtures (#239): a 609-settlement sweep (seeds 1-24, 2026-08-10) found the fen, stilt, drowned, bridge, and hamlet arms unreachable on real worlds; the weir arm IS real-world reachable.

import type { ProspectInput } from "../src/prospect/input.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../src/prospect/transect.ts";
import type { BiomeName } from "../src/climate/biomes.ts";
import { TYPICAL_SCORE } from "../src/prospect/masses.ts";

/** Re-exported so fixture default scores track the composer's per-tier table and cannot drift (a fixed score would hit the clamp differently per tier). */
export { TYPICAL_SCORE };

/** Flat shoulders, one central rise: high enough above the default siteRel to exercise the ridge path. */
export function defaultBackdrop(): ReadonlyArray<number> {
  const mid = (BACKDROP_SAMPLES - 1) / 2;
  return Array.from({ length: BACKDROP_SAMPLES }, (_, i) => {
    const t = Math.max(0, 1 - ((i - mid) / 48) ** 2);
    return 0.05 + 0.25 * t * t;
  });
}

/** Build a foreground band from runs; throws unless the runs total exactly FOREGROUND_SAMPLES, so a band cannot silently thin. */
export function bandOf(
  ...runs: ReadonlyArray<readonly [BiomeName, number]>
): ReadonlyArray<BiomeName> {
  const out: BiomeName[] = [];
  for (const [name, count] of runs) {
    for (let i = 0; i < count; i++) out.push(name);
  }
  if (out.length !== FOREGROUND_SAMPLES) {
    throw new RangeError(`band has ${out.length} samples, needs ${FOREGROUND_SAMPLES}`);
  }
  return out;
}

export function makeInput(overrides: Partial<ProspectInput> = {}): ProspectInput {
  const kind = overrides.kind ?? "town";
  return {
    seed: 4242,
    index: 0,
    name: "Testholm",
    kind,
    score: TYPICAL_SCORE[kind],
    harbor: false,
    onRiver: false,
    founded: 1100,
    ruined: false,
    ruinedYear: null,
    realm: 0,
    realmName: "Testrealm",
    arms: null,
    view: { dx: 0, dy: -1 },
    siteRel: 0.12,
    backdrop: defaultBackdrop(),
    foreground: bandOf(["grassland", FOREGROUND_SAMPLES]),
    ...overrides,
  };
}
