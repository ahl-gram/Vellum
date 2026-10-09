import { hashString } from "../../core/rng.ts";
import { defaultRecipe } from "../generate.ts";
import type { WorldRecipe } from "../types.ts";
import {
  CLIMATE_TRADITION,
  COAST_WARP,
  FOUNDING_VERSION,
  LAND_FACTOR,
  LEXICON,
  SMALL_WORDS,
  type LexiconEntry,
  type Steer,
} from "./lexicon.ts";
import { displayForm, foundingWords, type Refusal } from "./normalize.ts";

export type FoundingOverrides = Partial<
  Pick<WorldRecipe, "mapType" | "band" | "landFraction" | "coastWarp" | "culture">
>;
export type Recognised = { readonly phrase: string; readonly steers: ReadonlyArray<Steer> };
export type Founding = {
  readonly ok: true;
  readonly version: number;
  readonly sentence: string;
  readonly seed: number;
  readonly overrides: FoundingOverrides;
  readonly steered: ReadonlyArray<Recognised>;
  readonly contested: ReadonlyArray<Recognised>;
  readonly residual: string;
};

type Segment = { readonly words: ReadonlyArray<string>; readonly entry?: LexiconEntry };

const BY_PHRASE = new Map(LEXICON.map((entry) => [entry.phrase, entry]));
const LONGEST = Math.max(...LEXICON.map((entry) => entry.phrase.split(" ").length));

function longestEntryAt(words: ReadonlyArray<string>, at: number): LexiconEntry | undefined {
  for (let span = Math.min(LONGEST, words.length - at); span > 0; span--) {
    const entry = BY_PHRASE.get(words.slice(at, at + span).join(" "));
    if (entry !== undefined) return entry;
  }
  return undefined;
}

function scan(words: ReadonlyArray<string>): Segment[] {
  const segments: Segment[] = [];
  let at = 0;
  while (at < words.length) {
    const entry = longestEntryAt(words, at);
    const taken = entry === undefined ? 1 : entry.phrase.split(" ").length;
    segments.push({ words: words.slice(at, at + taken), ...(entry !== undefined ? { entry } : {}) });
    at += taken;
  }
  return segments;
}

function contestedSubjects(segments: ReadonlyArray<Segment>): Set<Steer["subject"]> {
  const values = new Map<Steer["subject"], Set<string>>();
  for (const steer of segments.flatMap((s) => s.entry?.steers ?? [])) {
    values.set(steer.subject, (values.get(steer.subject) ?? new Set()).add(steer.value));
  }
  return new Set([...values].filter(([, seen]) => seen.size > 1).map(([subject]) => subject));
}

type Settled = { readonly steered: Recognised[]; readonly contested: Recognised[]; readonly loose: string[] };

function settle(segments: ReadonlyArray<Segment>): Settled {
  const cancelled = contestedSubjects(segments);
  const steered: Recognised[] = [];
  const contested: Recognised[] = [];
  const loose: string[] = [];
  for (const { words, entry } of segments) {
    const surviving = entry?.steers.filter((s) => !cancelled.has(s.subject)) ?? [];
    if (entry !== undefined && surviving.length > 0) steered.push({ phrase: entry.phrase, steers: surviving });
    else {
      if (entry !== undefined) contested.push({ phrase: entry.phrase, steers: entry.steers });
      loose.push(...words);
    }
  }
  return { steered, contested, loose };
}

type Choice = { -readonly [S in Steer as S["subject"]]?: S["value"] };

function choose(steered: ReadonlyArray<Recognised>): Choice {
  const choice: Choice = {};
  for (const steer of steered.flatMap((r) => r.steers)) {
    switch (steer.subject) {
      case "mapType":
        choice.mapType = steer.value;
        break;
      case "band":
        choice.band = steer.value;
        break;
      case "land":
        choice.land = steer.value;
        break;
      case "coast":
        choice.coast = steer.value;
        break;
      case "culture":
        choice.culture = steer.value;
        break;
    }
  }
  return choice;
}

function overridesFor(seed: number, steered: ReadonlyArray<Recognised>): FoundingOverrides {
  const { mapType, band, land, coast, culture: named } = choose(steered);
  const culture = named ?? (band !== undefined ? CLIMATE_TRADITION[band] : undefined);
  return {
    ...(mapType !== undefined ? { mapType } : {}),
    ...(band !== undefined ? { band } : {}),
    ...(land !== undefined ? { landFraction: landShare(seed, mapType, LAND_FACTOR[land]) } : {}),
    ...(coast !== undefined ? { coastWarp: COAST_WARP[coast] } : {}),
    ...(culture !== undefined ? { culture } : {}),
  };
}

function landShare(seed: number, mapType: WorldRecipe["mapType"] | undefined, factor: number): number {
  const own = defaultRecipe(seed, mapType !== undefined ? { mapType } : {}).landFraction;
  return Math.round(own * factor * 1000) / 1000;
}

export function foundWorld(sentence: string, version: number = FOUNDING_VERSION): Founding | Refusal {
  if (version !== FOUNDING_VERSION) return { ok: false, reason: "unknown-version" };
  const display = displayForm(sentence);
  if (!display.ok) return display;
  const { steered, contested, loose } = settle(scan(foundingWords(display.sentence)));
  const residual = loose.filter((word) => !SMALL_WORDS.has(word)).join(" ");
  const seed = hashString(residual);
  return {
    ok: true,
    version,
    sentence: display.sentence,
    seed,
    overrides: overridesFor(seed, steered),
    steered,
    contested,
    residual,
  };
}
