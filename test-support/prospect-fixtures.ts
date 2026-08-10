/**
 * Hand-built ProspectInput fixtures for the composer tests (#239). Real
 * worlds cannot reach every composition arm: hamlets are region-only
 * (src/society/hamlets.ts, out of scope for buildProspectInput), and a
 * 609-settlement sweep over seeds 1-24 (2026-08-10, re-run for this file)
 * measured ZERO marsh-dominant foreground bands and ZERO non-harbor river
 * sites above village rank, so the fen, stilt, drowned, bridge, and hamlet
 * arms are reachable only synthetically today. The weir arm is NOT in that
 * list: the same sweep found all 19 inland sites are river villages, and
 * every one composes the weir on a real world sheet.
 */

import type { ProspectInput } from "../src/prospect/input.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../src/prospect/transect.ts";
import type { BiomeName } from "../src/climate/biomes.ts";
import { TYPICAL_SCORE } from "../src/prospect/masses.ts";

/** The composer's own per-tier normalization table, re-exported so fixture
 * default scores can never drift from the grammar (the default tracks the
 * KIND: a fixed score would hit the composer's clamp differently per tier). */
export { TYPICAL_SCORE };

/** A gentle inland ridge profile: flat shoulders, one central rise, enough
 * above the default siteRel to exercise the ridge path on every fixture. */
export function defaultBackdrop(): ReadonlyArray<number> {
  const mid = (BACKDROP_SAMPLES - 1) / 2;
  return Array.from({ length: BACKDROP_SAMPLES }, (_, i) => {
    const t = Math.max(0, 1 - ((i - mid) / 48) ** 2);
    return 0.05 + 0.25 * t * t;
  });
}

/** Build a foreground band from runs, e.g. bandOf(["marsh", 33]) or
 * bandOf(["temperateForest", 20], ["grassland", 13]). Throws unless the
 * runs total exactly FOREGROUND_SAMPLES, so a band cannot silently thin. */
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
