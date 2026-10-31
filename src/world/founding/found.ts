import { hashString } from "../../core/rng.ts";
import type { CultureId } from "../../society/culture-ids.ts";
import { defaultRecipe } from "../generate.ts";
import type { WorldRecipe } from "../types.ts";
import {
  CLIMATE_TRADITION,
  COAST_WARP,
  FOUNDING_VERSION,
  LAND_FACTOR,
  SHORE_RAGGEDNESS,
  SMALL_WORDS,
  type Steer,
} from "./lexicon.ts";
import { BAND_WORDS } from "./lexicon-shapes.ts";
import { countAt } from "./counts.ts";
import { longestEntryAt } from "./listed.ts";
import { displayForm, foundingWords, type Refusal } from "./normalize.ts";
import { shapeAt } from "./shapes.ts";

export type FoundingOverrides = Partial<
  Pick<
    WorldRecipe,
    "mapType" | "band" | "landFraction" | "coastWarp" | "culture" | "outline" | "islands" | "isleSize" | "raggedness"
  >
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

type Segment = { readonly words: ReadonlyArray<string>; readonly phrase?: string; readonly own?: ReadonlyArray<Steer> };
type Kept = { readonly phrase: string; readonly own: ReadonlyArray<Steer>; readonly steers: ReadonlyArray<Steer> };

const phrased = (words: ReadonlyArray<string>, at: number, taken: number, own: ReadonlyArray<Steer>): Segment => {
  const used = words.slice(at, at + taken);
  return { words: used, phrase: used.join(" "), own };
};

function segmentAt(words: ReadonlyArray<string>, at: number): Segment | "unloaded" {
  const shape = shapeAt(words, at);
  if (shape === "unloaded") return shape;
  const hit = shape ?? countAt(words, at);
  if (hit !== null) return phrased(words, at, hit.taken, hit.steers);
  const entry = longestEntryAt(words, at);
  const word = words[at] ?? "";
  const band = entry === undefined ? BAND_WORDS.get(word) : undefined;
  if (band !== undefined) return { words: [word], phrase: word, own: [{ subject: "islands", value: band }] };
  if (entry === undefined) return { words: [word] };
  return { words: words.slice(at, at + entry.phrase.split(" ").length), phrase: entry.phrase, own: entry.steers };
}

function scan(words: ReadonlyArray<string>): Segment[] | "unloaded" {
  const segments: Segment[] = [];
  let at = 0;
  while (at < words.length) {
    const segment = segmentAt(words, at);
    if (segment === "unloaded") return segment;
    segments.push(segment);
    at += segment.words.length;
  }
  return segments;
}

function contestedSubjects(segments: ReadonlyArray<Segment>): Set<Steer["subject"]> {
  const values = new Map<Steer["subject"], Set<Steer["value"]>>();
  for (const steer of segments.flatMap((s) => s.own ?? [])) {
    values.set(steer.subject, (values.get(steer.subject) ?? new Set()).add(steer.value));
  }
  return new Set([...values].filter(([, seen]) => seen.size > 1).map(([subject]) => subject));
}

type Settled = { readonly steered: Kept[]; readonly contested: Recognised[]; readonly loose: string[] };

const COUNT_PARTS: ReadonlySet<Steer["subject"]> = new Set(["islands", "isleSize"]);

function refuse(lists: ReadonlyArray<ReadonlyArray<Steer>>): ReadonlyArray<ReadonlyArray<Steer>> {
  const all = lists.flat();
  const shaped = all.some((s) => s.subject === "outline");
  const counted =
    !shaped &&
    all.some((s) => s.subject === "islands") &&
    all.some((s) => s.subject === "mapType" && s.value === "archipelago");
  const dropped = (s: Steer): boolean =>
    (!counted && COUNT_PARTS.has(s.subject)) ||
    ((counted || shaped) && s.subject === "land") ||
    (shaped && s.subject === "coast");
  return lists.map((list) => list.filter((s) => !dropped(s)));
}

function settle(segments: ReadonlyArray<Segment>): Settled {
  const cancelled = contestedSubjects(segments);
  const surviving = refuse(segments.map((s) => (s.own ?? []).filter((steer) => !cancelled.has(steer.subject))));
  const steered: Kept[] = [];
  const contested: Recognised[] = [];
  const loose: string[] = [];
  segments.forEach(({ words, phrase, own }, i) => {
    const kept = surviving[i] ?? [];
    if (phrase !== undefined && own !== undefined && kept.length > 0) steered.push({ phrase, own, steers: kept });
    else {
      if (phrase !== undefined) contested.push({ phrase, steers: own ?? [] });
      loose.push(...words);
    }
  });
  return { steered, contested, loose };
}

const tongueOf = (steers: ReadonlyArray<Steer>): CultureId | undefined => {
  for (const steer of steers) if (steer.subject === "culture") return steer.value;
  return undefined;
};

function creditClimateTongue(steered: ReadonlyArray<Kept>): ReadonlyArray<Recognised> {
  const climate = steered.filter((r) => r.steers.some((s) => s.subject === "band"));
  const named = new Set(climate.map((r) => tongueOf(r.own)).filter((tongue) => tongue !== undefined));
  return steered.map((r) =>
    named.size === 1 && climate.includes(r) && tongueOf(r.own) !== undefined
      ? {
          phrase: r.phrase,
          steers: r.own.filter((s) => s.subject === "culture" || r.steers.some((k) => k.subject === s.subject)),
        }
      : { phrase: r.phrase, steers: r.steers },
  );
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
      case "outline":
        choice.outline = steer.value;
        break;
      case "islands":
        choice.islands = steer.value;
        break;
      case "isleSize":
        choice.isleSize = steer.value;
        break;
    }
  }
  return choice;
}

function overridesFor(seed: number, steered: ReadonlyArray<Recognised>): FoundingOverrides {
  const { mapType, band, land, coast, culture: named, outline, islands, isleSize } = choose(steered);
  const culture = named ?? (band !== undefined ? CLIMATE_TRADITION[band] : undefined);
  return {
    ...(mapType !== undefined ? { mapType } : {}),
    ...(band !== undefined ? { band } : {}),
    ...(land !== undefined ? { landFraction: landShare(seed, mapType, LAND_FACTOR[land]) } : {}),
    ...(coast !== undefined && islands === undefined ? { coastWarp: COAST_WARP[coast] } : {}),
    ...(culture !== undefined ? { culture } : {}),
    ...(outline !== undefined ? { outline } : {}),
    ...(islands !== undefined ? { islands } : {}),
    ...(isleSize === "varied" ? { isleSize } : {}),
    ...(islands !== undefined && coast !== undefined && SHORE_RAGGEDNESS[coast] !== 0
      ? { raggedness: SHORE_RAGGEDNESS[coast] }
      : {}),
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
  const segments = scan(foundingWords(display.sentence));
  if (segments === "unloaded") return { ok: false, reason: "places-not-loaded" };
  const settled = settle(segments);
  const steered = creditClimateTongue(settled.steered);
  const residual = settled.loose.filter((word) => !SMALL_WORDS.has(word)).join(" ");
  const seed = hashString(residual);
  return {
    ok: true,
    version,
    sentence: display.sentence,
    seed,
    overrides: overridesFor(seed, steered),
    steered,
    contested: settled.contested,
    residual,
  };
}
