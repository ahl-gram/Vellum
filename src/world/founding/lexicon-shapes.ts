import { MAX_ISLANDS, type IsleSize } from "../../terrain/lobes.ts";
import type { FormId } from "../outline-ids.ts";
import type { LexiconEntry, Steer } from "./lexicon.ts";

const outline = (value: FormId): Steer => ({ subject: "outline", value });

export const SHAPE_WORDS: ReadonlyArray<LexiconEntry> = [
  { phrase: "crescent", steers: [outline("crescent")] },
  { phrase: "crescent shaped", steers: [outline("crescent")] },
  { phrase: "round island", steers: [outline("round"), { subject: "mapType", value: "island" }] },
];

export const NUMBER_WORDS: ReadonlyMap<string, number> = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
]);

export const SCALE_WORDS: ReadonlyMap<string, number> = new Map([
  ["dozen", 12],
  ["hundred", 100],
  ["thousand", 1000],
]);

export const BAND_WORDS: ReadonlyMap<string, number> = new Map([
  ["few", 5],
  ["countless", MAX_ISLANDS],
]);

export const ISLAND_WORDS: ReadonlyArray<string> = [
  "islands",
  "isles",
  "islets",
  "atolls",
  "cays",
  "skerries",
  "coral islands",
  "coral isles",
  "spice islands",
];

export const BETWEEN_WORDS: ReadonlyMap<string, IsleSize | null> = new Map<string, IsleSize | null>([
  ["equal", "equal"],
  ["equal sized", "equal"],
  ["evenly sized", "equal"],
  ["same sized", "equal"],
  ["varied", "varied"],
  ["different sized", "varied"],
  ["unequal", "varied"],
  ["small", null],
  ["little", null],
  ["tiny", null],
  ["round", null],
]);

export const SHAPE_TRIGGERS: ReadonlyArray<string> = ["in the shape of", "the shape of", "shaped like"];
export const SHAPE_ARTICLES: ReadonlySet<string> = new Set(["a", "an", "the"]);
export const SHAPE_FORMS: ReadonlyMap<string, FormId> = new Map<string, FormId>([
  ["crescent", "crescent"],
  ["ring", "ring"],
  ["circle", "round"],
]);

export const PLACE_ARTICLE = "the";
export const KINDS_AFTER_THE: ReadonlySet<string> = new Set(["country", "unit", "lake"]);
export const DIRECTION_WORDS: ReadonlySet<string> = new Set([
  "north",
  "south",
  "east",
  "west",
  "northern",
  "southern",
  "eastern",
  "western",
  "northeast",
  "northwest",
  "southeast",
  "southwest",
  "northeastern",
  "northwestern",
  "southeastern",
  "southwestern",
  "central",
  "centre",
  "far",
  "upper",
]);

export const PLACE_KINDS: ReadonlyArray<string> = ["country", "unit", "state", "lake"];
export const PLACE_PREFERENCES: ReadonlyArray<readonly [key: string, id: string]> = [
  ["florida", "ne-1159315207"],
  ["georgia", "ne-1159311857"],
  ["maryland", "ne-1159315329"],
  ["montana", "ne-1159315333"],
  ["manchester", "ne-1159317507"],
];
