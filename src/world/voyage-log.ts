import { createRng, type Rng } from "../core/rng.ts";
import type { SettlementKind } from "../society/sites.ts";
import type { LegMode } from "../render/voyage-route.ts";

/**
 * The margin log (#121, Sub 4 of the Wayfarer's Passage epic #117): the survey's
 * dated journal, one entry per port, in the surveyor's own period voice.
 *
 * A PURE post-world module on the daily-hunt pattern (world/daily-hunt.ts). It draws
 * its randomness from `createRng(seed).fork("voyage-log")`, a fresh top-level fork off
 * the recipe seed that cannot reshuffle any world-generation stream, and it adds no
 * World field. So it is never imported by world/generate.ts, nothing crosses the
 * Explorer worker boundary, and no chart byte changes: no seed re-roll, no parity tax,
 * the golden checksum untouched (golden-seed42.test.ts holds the line).
 *
 * It consumes the leg `mode` from #120: a sea arrival reads as a voyage, a road (or the
 * degraded "straight") arrival as a ride, and the origin as a departure. The plan's leg
 * geometry is untouched (that is #118/#120 territory); only the prose lives here.
 *
 * The scrollable panel + the reveal-per-arrival wiring live in docs/explorer/voyage.js
 * and are covered by the Explorer e2e. Only this deterministic prose is unit-tested.
 */

/** A port in visit order, carrying the mode of the leg that ARRIVED at it. The origin
 *  has no arriving leg, so its arrivalMode is null (it departs, it does not arrive). */
export type VoyageLogPort = {
  readonly idx: number;
  readonly name: string;
  readonly kind: SettlementKind;
  readonly founded: number;
  readonly arrivalMode: LegMode | null;
};

export type VoyageLogEntry = {
  readonly idx: number;
  readonly year: number;
  readonly text: string;
};

export type VoyageLog = {
  /** The surveyor's signature, straight from the #116 subtitle protocol field. */
  readonly attribution: string;
  /** One polite screen-reader announcement for the whole survey (no per-port spam). */
  readonly summary: string;
  readonly entries: ReadonlyArray<VoyageLogEntry>;
};

// The authored phrase pools, in the annalist register the atlas already speaks. Small
// and good (Alex, 2026-07-10): about two dozen lines, no em-dashes, every one derived
// from nothing but the pool so the output stays deterministic per seed. Kept mode-leaning
// so a sea arrival smells of salt and a road arrival of dust.
export const SEA_ARRIVALS: readonly string[] = [
  "We stood in past the shoals on a slack tide, the pilot wary of the reef.",
  "A stiff breeze served us, and we made the roads before the light failed.",
  "The harbour lay open and easy, though the pilot spoke ill of its holding ground.",
  "We handed sail off the point and warped in under the walls.",
  "The swell ran long from the west, and we came to anchor much relieved.",
  "Fog held us off the bar till noon, when it lifted and we stood in.",
  "The water shoaled quickly, and we sounded our way to the quay with care.",
  "A fair wind and a following sea carried us in by the forenoon watch.",
  "We doubled the headland close, the tide setting hard against us.",
];

export const LAND_ARRIVALS: readonly string[] = [
  "The way was dry underfoot, and its fences are kept in good repair.",
  "Its walls are sound, though the north tower wants mortar.",
  "We came down through the ferns to its gate as the bells were rung.",
  "The road ran fair, and the market stood busy as we entered.",
  "A cold rain met us on the last mile, and we were glad of its hearths.",
  "The country about lay well tilled, its hedgerows straight and old.",
  "We forded a swollen beck below the walls and came in wet to the knee.",
  "Its people were civil, and the reeve gave us bread and an honest bed.",
  "The track climbed steeply, and we walked the horses the last of it.",
  "Sheep held the road ahead of us, and we came in behind the flock.",
  "The hedges were white with may, and the air sweet the whole way down.",
];

export const DEPARTURES: readonly string[] = [
  "The glass stood fair, and the tide served at dawn.",
  "We took our leave at first light, the whole company in good heart.",
  "A gentle wind rose with the sun, and we set the survey in hand.",
  "The morning broke clear over the roads, and we made ready to go.",
  "We watered the horses, blessed the work, and turned our faces outward.",
];

// Cycle a pool without repeating until it is exhausted, then wrap. The same idiom as
// lore.ts freshPick and history.ts makeCycler, both closure-private (and freshPick's
// pools are the gazetteer register, not this journal one), so it is re-implemented here.
// One cycler is shared across all pools so each pool tracks its own used-set, and every
// draw comes off the one forked stream, keeping the whole log deterministic per seed.
function makeCycler(rng: Rng): (list: readonly string[]) => string {
  const used = new Map<readonly string[], Set<string>>();
  return (list) => {
    let seen = used.get(list);
    if (!seen) {
      seen = new Set();
      used.set(list, seen);
    }
    if (seen.size >= list.length) seen.clear();
    const choice = rng.pick(list.filter((x) => !seen.has(x)));
    seen.add(choice);
    return choice;
  };
}

/** The arrival clause, deterministic from the leg mode. A road leg never crosses open
 *  water and a "straight" leg is a degraded overland hop (voyage-route.ts), so both ride;
 *  only a "sea" leg sails. The origin has no arriving leg, so it departs. */
function arrivalVerb(mode: LegMode | null): string {
  if (mode === null) return "We set out from";
  if (mode === "sea") return "We made sail for";
  if (mode === "straight") return "We pressed overland to";
  return "We rode on to";
}

function descriptor(port: VoyageLogPort, isOrigin: boolean): string {
  if (isOrigin) return `seat of this survey, its walls raised in the year ${port.founded}`;
  const noun = port.kind === "village" ? "village" : "town";
  return `a ${noun} standing since ${port.founded}`;
}

function poolFor(mode: LegMode | null): readonly string[] {
  if (mode === null) return DEPARTURES;
  if (mode === "sea") return SEA_ARRIVALS;
  return LAND_ARRIVALS; // road and the degraded straight both ride overland
}

/**
 * Compose the survey's margin log from its ports in visit order. Every port is dated with
 * the single survey year (there is no per-port timeline in the world data, so an invented
 * per-port date would be fiction, not world-derived). The flavor clause is the only
 * randomness, drawn no-repeat off `createRng(seed).fork("voyage-log")`.
 */
export function buildVoyageLog(
  ports: ReadonlyArray<VoyageLogPort>,
  presentYear: number,
  seed: number,
  subtitle: string,
): VoyageLog {
  const pick = makeCycler(createRng(seed).fork("voyage-log"));
  const entries = ports.map((port, i) => {
    const isOrigin = i === 0;
    const mode = isOrigin ? null : port.arrivalMode;
    const text =
      `Year ${presentYear}. ${arrivalVerb(mode)} ${port.name}, ` +
      `${descriptor(port, isOrigin)}. ${pick(poolFor(mode))}`;
    return { idx: port.idx, year: presentYear, text };
  });
  const n = ports.length;
  const summary = `The survey is charted: ${n} ${n === 1 ? "port" : "ports"} set down in the surveyor's hand.`;
  return { attribution: subtitle, summary, entries };
}
