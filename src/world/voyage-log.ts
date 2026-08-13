import { createRng, type Rng } from "../core/rng.ts";
import type { SettlementKind } from "../society/sites.ts";
import type { LegMode } from "../render/voyage-route.ts";

/** Pure post-world prose. Randomness comes only from createRng(seed).fork("voyage-log"), a top-level fork that cannot reshuffle any world-generation stream; it adds no World field and changes no chart byte. */

export type VoyageLogPort = {
  readonly idx: number;
  readonly name: string;
  readonly kind: SettlementKind;
  readonly founded: number;
  readonly arrivalMode: LegMode | null;
  readonly inlandHandoff: boolean;
  /** Grid-space length of the arriving leg; 0 for the origin. */
  readonly legLength: number;
};

export type VoyageHomecoming = {
  readonly arrivalMode: LegMode;
  readonly inlandHandoff: boolean;
  readonly legLength: number;
};

export type VoyageLogEntry = {
  readonly idx: number;
  readonly year: number;
  readonly day: number;
  readonly text: string;
};

export const GRID_UNITS_PER_DAY = 14;

export type VoyageLog = {
  readonly attribution: string;
  readonly summary: string;
  readonly entries: ReadonlyArray<VoyageLogEntry>;
};

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

// Closings complete the landfall sentence: trailing clauses only, never a fresh sentence.
export const HANDOFF_CLOSINGS: readonly string[] = [
  "riding the last miles to its gates before dark",
  "and led the horses up from the strand",
  "the shore party glad to feel dry ground again",
  "and came up from the water as the light failed",
  "with the masts small behind us by the time its walls rose",
];

// Homecoming closings complete "...whence we set out, <closing>." so none carries its own final stop.
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

function homecomingPoolFor(mode: LegMode): readonly string[] {
  return mode === "sea" ? SEA_HOMECOMINGS : LAND_HOMECOMINGS;
}

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

/** The homecoming shares entry 0's idx, so consumers reveal rows by POSITION, never by idx. */
export function buildVoyageLog(
  ports: ReadonlyArray<VoyageLogPort>,
  presentYear: number,
  seed: number,
  subtitle: string,
  homecoming: VoyageHomecoming | null = null,
): VoyageLog {
  const pick = makeCycler(createRng(seed).fork("voyage-log"));
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
    const text =
      !isOrigin && mode === "sea" && port.inlandHandoff
        ? `Year ${presentYear}. We rode from ${ports[i - 1]!.name} to the coast, took ship, ` +
          `and made landfall below ${port.name}, ${descriptor(port, false)}, ${pick(HANDOFF_CLOSINGS)}.`
        : `Year ${presentYear}. ${arrivalVerb(mode)} ${port.name}, ` +
          `${descriptor(port, isOrigin)}. ${pick(poolFor(mode))}`;
    return { idx: port.idx, year: presentYear, day: nextDay(isOrigin ? 0 : port.legLength), text };
  });
  const home = homecoming ? homecomingEntry(ports, presentYear, nextDay(homecoming.legLength), homecoming, pick) : null;
  const entries = home ? [...portEntries, home] : portEntries;
  const n = ports.length;
  const summary = `The survey is charted: ${n} ${n === 1 ? "port" : "ports"} set down in the surveyor's hand.`;
  return { attribution: subtitle, summary, entries };
}
