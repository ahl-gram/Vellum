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
 * degraded "straight") arrival as a ride, and the origin as a departure. Since #181 a
 * sea arrival whose leg rode a genuine overland stub (`inlandHandoff`) narrates the
 * full ride-sail-ride instead, in the ratified three-part shape. The plan's leg
 * geometry is untouched (that is #118/#120 territory); only the prose lives here.
 *
 * The scrollable panel + the reveal-per-arrival wiring live in src/site/living-chart/voyage.ts
 * and are covered by the Explorer e2e. Only this deterministic prose is unit-tested.
 */

/** A port in visit order, carrying the mode of the leg that ARRIVED at it. The origin
 *  has no arriving leg, so its arrivalMode is null (it departs, it does not arrive).
 *  `inlandHandoff` (#181) is true when that arriving leg rode a genuine overland stub
 *  to or from the water (RoutedLeg.inlandHandoff), which earns the ride-sail-ride
 *  narrative below in place of the plain sea arrival. */
export type VoyageLogPort = {
  readonly idx: number;
  readonly name: string;
  readonly kind: SettlementKind;
  readonly founded: number;
  readonly arrivalMode: LegMode | null;
  readonly inlandHandoff: boolean;
  /** Grid-space length of the ARRIVING leg (#312); the origin departs, so it is 0. */
  readonly legLength: number;
};

/** The closing leg's character, for the homecoming entry (#275). The capital is already
 *  `ports[0]`, so only the leg crosses this boundary, never a repeated port: the
 *  homecoming is an ARRIVAL at a port already logged, not a new port. */
export type VoyageHomecoming = {
  readonly arrivalMode: LegMode;
  readonly inlandHandoff: boolean;
  /** Grid-space length of the closing leg (#312), for the homecoming's day. */
  readonly legLength: number;
};

export type VoyageLogEntry = {
  readonly idx: number;
  readonly year: number;
  /** The day of the voyage this entry is written on (#312): the prologue gutter
   *  counts days, strictly increasing, while `year` stays the survey's one date. */
  readonly day: number;
  readonly text: string;
};

/**
 * Grid units the survey travels in a day (#312). Measured 2026-07-28 over seeds
 * 42/7/100/953/2024 (320x240 grid, 24-leg round trips): totals ran 994-1212 units,
 * legs 7-200, median 30-50. At 14 a whole voyage runs 70-90 days (out in spring,
 * home by late summer), a median leg is 2-3 days, and the longest sails jump about
 * 14, so the gutter reads with real variety. Days are STRICTLY increasing by the
 * #312 ruling: each entry is max(previousDay + 1, 1 + round(cum / this)).
 */
export const GRID_UNITS_PER_DAY = 14;

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

// #181 (ratified 2026-07-24): a crossing whose port sits genuinely inland reads as the
// full ride-sail-ride it draws: "We rode from X to the coast, took ship, and made
// landfall below Y, a town standing since N, <closing>." Each closing completes that
// sentence, so every entry is a participle or trailing clause, never a fresh sentence.
export const HANDOFF_CLOSINGS: readonly string[] = [
  "riding the last miles to its gates before dark",
  "and led the horses up from the strand",
  "the shore party glad to feel dry ground again",
  "and came up from the water as the light failed",
  "with the masts small behind us by the time its walls rose",
];

// #275 (prose shape ratified by Alex 2026-07-24): the survey sails home, and the closing
// leg earns one entry in the same annalist register. Mode-split like SEA_ARRIVALS /
// LAND_ARRIVALS, because the prose forces it ("we handed the last of the sail" cannot
// follow "We rode on to"). Each entry completes the sentence
// "<verb> <capital> again, whence we set out, <closing>." so every one is a trailing
// clause and none carries its own final stop, exactly as HANDOFF_CLOSINGS does.
// Deliberately NO fixed "the survey is closed" sentence: the log simply stops, the way
// it does today at the final port.
export const SEA_HOMECOMINGS: readonly string[] = [
  "and came to our own moorings on the evening tide",
  "and handed the last of our sail in water we knew by heart",
  "the watch on the wall knowing our colours before ever we were hailed",
  "and let go the anchor in the roads we had left in the spring",
  "the pilot idle at last, every shoal of it long since in our own book",
  "and the quay stood crowded before we had the warps ashore",
];

export const LAND_HOMECOMINGS: readonly string[] = [
  "and the horses found their own stalls without asking",
  "and came up the last mile at a walk, in no haste at all",
  "the gate standing open, as it had the morning we rode out",
  "and gave the reeve back his road, none the worse for our using of it",
  "the bells being rung, though we had sent no word ahead",
  "and slept that night under a roof we had some claim on",
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

/** #275: the homecoming's pool, split on the same rule as poolFor. */
function homecomingPoolFor(mode: LegMode): readonly string[] {
  return mode === "sea" ? SEA_HOMECOMINGS : LAND_HOMECOMINGS;
}

/**
 * The closing leg's entry (#275). The capital is `ports[0]` and is already logged as the
 * departure, so this is an ARRIVAL at a port the log has met: "whence we set out" stands
 * in for a descriptor, because repeating "seat of this survey, its walls raised in the
 * year N" would read as a second founding.
 *
 * A closing leg that hands off inland keeps #181's ratified three-part shape, with the
 * ride departing the LAST port and the landfall below the capital. HANDOFF_CLOSINGS is
 * reused there rather than grown a fourth pool: those clauses are mode-neutral.
 *
 * Returns null when there is nothing to sail home from (fewer than two ports), so a
 * one-port survey logs its departure and stops.
 */
function homecomingEntry(
  ports: ReadonlyArray<VoyageLogPort>,
  presentYear: number,
  day: number,
  homecoming: VoyageHomecoming,
  pick: (list: readonly string[]) => string,
): VoyageLogEntry | null {
  if (ports.length < 2) return null;
  const home = ports[0]!;
  const last = ports[ports.length - 1]!;
  const { arrivalMode: mode, inlandHandoff } = homecoming;
  const text =
    mode === "sea" && inlandHandoff
      ? `Year ${presentYear}. We rode from ${last.name} to the coast, took ship, ` +
        `and made landfall below ${home.name}, whence we set out, ${pick(HANDOFF_CLOSINGS)}.`
      : `Year ${presentYear}. ${arrivalVerb(mode)} ${home.name} again, whence we set out, ` +
        `${pick(homecomingPoolFor(mode))}.`;
  return { idx: home.idx, year: presentYear, day, text };
}

/**
 * Compose the survey's margin log from its ports in visit order. Every port is dated with
 * the single survey year (there is no per-port timeline in the world data, so an invented
 * per-port date would be fiction, not world-derived). The flavor clause is the only
 * randomness, drawn no-repeat off `createRng(seed).fork("voyage-log")`.
 *
 * INVARIANT (#275): `entries = legs + 1`, one departure plus one entry per leg. Pass the
 * closing leg as `homecoming` and the round trip logs its return; pass null and this is
 * the open-path log it always was, byte for byte. `ports` NEVER repeats the capital, so
 * the homecoming entry shares entry 0's idx: rows are revealed by POSITION, not by idx.
 */
export function buildVoyageLog(
  ports: ReadonlyArray<VoyageLogPort>,
  presentYear: number,
  seed: number,
  subtitle: string,
  homecoming: VoyageHomecoming | null = null,
): VoyageLog {
  const pick = makeCycler(createRng(seed).fork("voyage-log"));
  // #312: the days of the voyage, a pure function of the legs (no RNG). Cumulative
  // grid length at GRID_UNITS_PER_DAY, strictly increasing by ruling: a long sail
  // jumps many days, a short hop advances at least one, no two rows share a day.
  let cumLength = 0;
  let prevDay = 0;
  const nextDay = (legLength: number): number => {
    cumLength += legLength;
    const computed = 1 + Math.round(cumLength / GRID_UNITS_PER_DAY);
    prevDay = Math.max(prevDay + 1, computed);
    return prevDay;
  };
  const portEntries = ports.map((port, i) => {
    const isOrigin = i === 0;
    const mode = isOrigin ? null : port.arrivalMode;
    // #181: a sea arrival whose leg rode a genuine overland stub narrates all three
    // parts of what the mark draws: the ride from the previous port to the coast, the
    // crossing, and the landfall short of the walls. Only a sea leg can hand off, and
    // the origin never arrives, so both stay on the plain clause below.
    const text =
      !isOrigin && mode === "sea" && port.inlandHandoff
        ? `Year ${presentYear}. We rode from ${ports[i - 1]!.name} to the coast, took ship, ` +
          `and made landfall below ${port.name}, ${descriptor(port, false)}, ${pick(HANDOFF_CLOSINGS)}.`
        : `Year ${presentYear}. ${arrivalVerb(mode)} ${port.name}, ` +
          `${descriptor(port, isOrigin)}. ${pick(poolFor(mode))}`;
    // The origin's legLength is ignored like its arrivalMode: it departs on day 1.
    return { idx: port.idx, year: presentYear, day: nextDay(isOrigin ? 0 : port.legLength), text };
  });
  // #275: the homecoming draws LAST, off the same forked stream, so adding it cannot
  // reshuffle a single port's flavor: an open-path log and the first n entries of a
  // round-trip log over the same ports are identical.
  const home = homecoming ? homecomingEntry(ports, presentYear, nextDay(homecoming.legLength), homecoming, pick) : null;
  const entries = home ? [...portEntries, home] : portEntries;
  // The summary counts PORTS, not entries. The homecoming is an arrival at a port
  // already counted, so a round trip charts the same number of ports as an open path.
  const n = ports.length;
  const summary = `The survey is charted: ${n} ${n === 1 ? "port" : "ports"} set down in the surveyor's hand.`;
  return { attribution: subtitle, summary, entries };
}
