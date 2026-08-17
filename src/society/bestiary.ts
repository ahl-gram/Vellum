import type { Rng } from "../core/rng.ts";
import { createNamer, isNearExisting, type Culture } from "./names.ts";

/** Every world's deep water is haunted. Beasts are drawn on their own fork, so nothing else in the world moves; whether a chart SHOWS them is a view option, so committed charts hold byte-for-byte. */

export type BeastKind = "serpent" | "whale" | "kraken";

export type SeaBeast = {
  readonly kind: BeastKind;
  /** A bare word in the world's own tongue, e.g. "Hakua". */
  readonly name: string;
  /** "the Island that Swims"; lowercase article, appended after the name. */
  readonly epithet: string;
  /** The haunt, in grid coordinates. */
  readonly x: number;
  readonly y: number;
  readonly firstSeen: number;
  readonly tale: string;
};

const COUNT_BY_TYPE: Record<string, number> = {
  island: 3,
  archipelago: 4,
  continent: 2,
  citystate: 2,
};

const KINDS: ReadonlyArray<BeastKind> = ["serpent", "whale", "kraken"];

const EPITHETS: Record<BeastKind, readonly string[]> = {
  serpent: [
    "the Deep Worm",
    "the Long Coil",
    "the Eater of Anchors",
    "Old Winding",
    "the Knot in the Tide",
  ],
  whale: [
    "the Island that Swims",
    "the Grey Titan",
    "the Breath of the Deep",
    "the Bearer of Storms",
    "the Drowned Hill",
  ],
  kraken: [
    "the Thousand Arms",
    "the Ship-Taker",
    "the Reaching Dark",
    "the Lord of the Under-Currents",
    "the Weed That Wakes",
  ],
};

const TALES = [
  "First sighted off %t in the year %y; the crews there will not speak of it after dark.",
  "The chronicle of %t records it rising from the deep in the year %y.",
  "Mariners out of %t have marked it on their rutters since the year %y.",
  "Seen first in the year %y, and blamed since for every ship that %t has lost.",
  "It broke a mole at %t in the year %y, and the harbor wall bears the scar yet.",
  "The fisher-folk of %t have left it offerings of salt since the year %y.",
  "Pilots of %t swear the water darkens a league around it; so it has been since the year %y.",
];

type Haunt = { readonly x: number; readonly y: number };

type Settled = {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly harbor: boolean;
  readonly founded: number;
};

export type BestiaryInput = {
  readonly gridW: number;
  readonly gridH: number;
  /** Hop distance from the nearest land cell, over water. */
  readonly oceanDist: Float64Array;
  /** 1 = border-connected sea. */
  readonly seaMask: Uint8Array;
  readonly mapType: string;
  readonly culture: Culture;
  readonly settlements: ReadonlyArray<Settled>;
  readonly presentYear: number;
};

const DEEP = 16;
const DEEP_FALLBACK = 8;
const EDGE = 26;

function deepCells(input: BestiaryInput, deep: number): Haunt[] {
  const { gridW, gridH, oceanDist, seaMask } = input;
  const out: Haunt[] = [];
  for (let y = EDGE; y < gridH - EDGE; y += 2) {
    for (let x = EDGE; x < gridW - EDGE; x += 2) {
      const i = x + y * gridW;
      if (seaMask[i] !== 1) continue;
      if ((oceanDist[i] as number) < deep) continue;
      out.push({ x, y });
    }
  }
  return out;
}

function pickHaunts(cells: Haunt[], count: number, minSep: number, rng: Rng): Haunt[] {
  const picked: Haunt[] = [];
  for (const c of rng.shuffled(cells)) {
    if (picked.length >= count) break;
    if (picked.every((p) => Math.hypot(p.x - c.x, p.y - c.y) >= minSep)) {
      picked.push(c);
    }
  }
  return picked;
}

function nearestPort(haunt: Haunt, settlements: ReadonlyArray<Settled>): Settled | undefined {
  const by = (list: ReadonlyArray<Settled>): Settled | undefined =>
    list.length === 0
      ? undefined
      : list.reduce((a, b) =>
          Math.hypot(b.x - haunt.x, b.y - haunt.y) < Math.hypot(a.x - haunt.x, a.y - haunt.y)
            ? b
            : a,
        );
  return by(settlements.filter((s) => s.harbor)) ?? by(settlements);
}

function freshPick<T>(rng: Rng, list: readonly T[], used: Set<T>): T {
  if (used.size >= list.length) used.clear();
  const avail = list.filter((x) => !used.has(x));
  const choice = rng.pick(avail);
  used.add(choice);
  return choice;
}

export function conjureBestiary(
  input: BestiaryInput,
  rng: Rng,
  takenNames: ReadonlySet<string>,
): ReadonlyArray<SeaBeast> {
  const taken = new Set(takenNames);
  const count = COUNT_BY_TYPE[input.mapType] ?? 2;
  let cells = deepCells(input, DEEP);
  if (cells.length < count * 12) cells = deepCells(input, DEEP_FALLBACK);
  if (cells.length === 0) return [];

  const minSep = Math.max(40, Math.round((input.gridW + input.gridH) / 8));
  const haunts = pickHaunts(cells, count, minSep, rng.fork("haunts"));

  const kindRng = rng.fork("kinds");
  const kinds = kindRng.shuffled(KINDS);
  while (kinds.length < haunts.length) kinds.push(kindRng.pick(KINDS));

  const namer = createNamer(rng.fork("names"), input.culture);
  const loreRng = rng.fork("lore");
  const usedEpithets = new Map<BeastKind, Set<string>>();
  const usedTales = new Set<string>();

  const earliest = input.settlements.length
    ? Math.min(...input.settlements.map((s) => s.founded))
    : input.presentYear - 100;

  return haunts.map((haunt, i) => {
    const kind = kinds[i] as BeastKind;

    let name = namer.name("bare");
    for (let attempt = 0; attempt < 12 && isNearExisting(name.toLowerCase(), taken); attempt++) {
      name = namer.name("bare");
    }
    taken.add(name.toLowerCase());

    let seen = usedEpithets.get(kind);
    if (!seen) {
      seen = new Set();
      usedEpithets.set(kind, seen);
    }
    const epithet = freshPick(loreRng, EPITHETS[kind], seen);

    const span = Math.max(1, input.presentYear - earliest);
    const firstSeen = earliest + loreRng.int(span);

    const port = nearestPort(haunt, input.settlements);
    const tale = freshPick(loreRng, TALES, usedTales)
      .replace(/%t/g, port?.name ?? "the coast")
      .replace(/%y/g, String(firstSeen));

    return { kind, name, epithet, x: haunt.x, y: haunt.y, firstSeen, tale };
  });
}
