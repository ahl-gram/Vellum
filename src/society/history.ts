import type { Rng } from "../core/rng.ts";
import type { Settlement } from "./sites.ts";

/** Runs on its own rng.fork("history"), appended LAST in the pipeline, so it can never reshuffle a seed's geography or names. */

export type EventKind = "founding" | "rise" | "war" | "ruin";

export type HistoricalEvent = {
  readonly year: number;
  readonly kind: EventKind;
  readonly text: string;
  readonly settlement?: number;
  readonly realm?: number;
};

export type History = {
  readonly events: ReadonlyArray<HistoricalEvent>;
};

type SettlementCore = Settlement & { readonly name: string };

export type HistoryInput = {
  readonly settlements: ReadonlyArray<SettlementCore>;
  readonly seats: ReadonlyArray<number>;
  readonly realmNames: ReadonlyArray<string>;
  readonly presentYear: number;
};

export type HistoryResult = {
  readonly events: ReadonlyArray<HistoricalEvent>;
  readonly founded: ReadonlyArray<number>;
  readonly ruined: ReadonlyArray<boolean>;
};

const FOUNDING_TEMPLATES = [
  "%s was founded in a year the chronicles set down with care.",
  "Settlers raised the first walls of %s.",
  "The hearths of %s were first lit in this year.",
  "%s grew from a lone anchorage to a seat of some note.",
];

const RISE_TEMPLATES = [
  "%r was proclaimed, and its banners raised over the land.",
  "The lords of %r first swore the compact that bound them.",
  "%r rose to claim the country between the waters.",
  "The standard of %r was carried to the borders it holds yet.",
];

const WAR_TEMPLATES = [
  "%r and %r2 fell to war over the border marches.",
  "The long quarrel of %r with %r2 came at last to open war.",
  "%r marched against %r2; the chronicle does not record who prevailed.",
  "Fire passed between %r and %r2 in a war neither has forgiven.",
];

const RUIN_TEMPLATES = [
  "%s was abandoned, and is now a haunt of gulls and ghosts.",
  "Plague and poor harvests emptied %s; its roofs have since fallen.",
  "%s was sacked in the wars and never rebuilt.",
  "The people of %s drifted away, leaving only stones to the wind.",
];

function makeCycler(rng: Rng, pool: readonly string[]): () => string {
  const used = new Set<string>();
  return () => {
    if (used.size >= pool.length) used.clear();
    const avail = pool.filter((t) => !used.has(t));
    const choice = rng.pick(avail);
    used.add(choice);
    return choice;
  };
}

export function simulateHistory(input: HistoryInput, rng: Rng): HistoryResult {
  const { settlements, seats, realmNames, presentYear } = input;
  const n = settlements.length;

  const span = Math.min(900, Math.max(150, Math.round(presentYear * 0.7)));
  const epochStart = presentYear - span;
  const yearAt = (f: number): number =>
    Math.round(epochStart + Math.max(0, Math.min(1, f)) * span);

  const founded: number[] = settlements.map((s) => {
    const base = s.kind === "capital" ? 0.02 : s.kind === "town" ? 0.3 : 0.55;
    const f = base + rng.next() * 0.3;
    return Math.min(presentYear - 1, yearAt(f));
  });

  const seatSet = new Set(seats);
  const villageIdxs = settlements
    .map((_, i) => i)
    .filter((i) => settlements[i]!.kind === "village" && !seatSet.has(i));
  const ruinCount = Math.max(0, Math.min(2, Math.floor(villageIdxs.length / 6)));
  const ruinedIdx = rng.shuffled(villageIdxs).slice(0, ruinCount);
  const ruinedSet = new Set(ruinedIdx);
  const ruined: boolean[] = settlements.map((_, i) => ruinedSet.has(i));

  const events: HistoricalEvent[] = [];
  const founding = makeCycler(rng, FOUNDING_TEMPLATES);
  const rise = makeCycler(rng, RISE_TEMPLATES);
  const war = makeCycler(rng, WAR_TEMPLATES);
  const ruin = makeCycler(rng, RUIN_TEMPLATES);

  const capIdx = settlements.findIndex((s) => s.kind === "capital");
  const townIdxs = settlements
    .map((_, i) => i)
    .filter((i) => settlements[i]!.kind === "town")
    .sort((a, b) => founded[a]! - founded[b]!)
    .slice(0, 2);
  const foundingPicks = [capIdx, ...townIdxs].filter((i) => i >= 0);
  for (const i of foundingPicks) {
    events.push({
      year: founded[i]!,
      kind: "founding",
      text: founding().replace("%s", settlements[i]!.name),
      settlement: i,
    });
  }

  realmNames.forEach((rn, realmId) => {
    if (rng.next() < 0.7) {
      events.push({
        year: yearAt(0.2 + rng.next() * 0.3),
        kind: "rise",
        text: rise().replace("%r", rn),
        realm: realmId,
      });
    }
  });

  if (realmNames.length >= 2) {
    const warCount = rng.int(3);
    for (let k = 0; k < warCount; k++) {
      const a = rng.int(realmNames.length);
      let b = rng.int(realmNames.length);
      if (b === a) b = (b + 1) % realmNames.length;
      events.push({
        year: yearAt(0.5 + rng.next() * 0.45),
        kind: "war",
        text: war().replace("%r2", realmNames[b]!).replace("%r", realmNames[a]!),
        realm: a,
      });
    }
  }

  for (const i of ruinedIdx) {
    const fy = founded[i]!;
    const ay = Math.min(
      presentYear - 1,
      Math.round(fy + (presentYear - fy) * (0.4 + rng.next() * 0.5)),
    );
    events.push({
      year: ay,
      kind: "ruin",
      text: ruin().replace("%s", settlements[i]!.name),
      settlement: i,
    });
  }

  events.sort((e1, e2) => e1.year - e2.year);

  return { events: events.slice(0, 14), founded, ruined };
}
