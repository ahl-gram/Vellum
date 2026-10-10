import type { ClimateBand } from "../../climate/climate.ts";
import type { CultureId } from "../../society/culture-ids.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import { PEOPLE_WORDS } from "./lexicon-peoples.ts";

export const FOUNDING_VERSION = 1;
export const MAX_SENTENCE_CODE_POINTS = 120;
export const SMALL_WORDS: ReadonlySet<string> = new Set(["a", "an", "the", "of", "and", "with", "where"]);
export const LAND_FACTOR = { less: 0.55, more: 1.4 } as const;
export const COAST_WARP = { ragged: 0.95, smooth: 0.1 } as const;
export const CLIMATE_TRADITION: Readonly<Record<ClimateBand, CultureId>> = {
  polar: "norden",
  tropical: "oromi",
  temperate: "sylvan",
};

export type Steer =
  | { readonly subject: "mapType"; readonly value: MapType }
  | { readonly subject: "band"; readonly value: ClimateBand }
  | { readonly subject: "land"; readonly value: keyof typeof LAND_FACTOR }
  | { readonly subject: "coast"; readonly value: keyof typeof COAST_WARP }
  | { readonly subject: "culture"; readonly value: CultureId };

export type LexiconEntry = { readonly phrase: string; readonly steers: ReadonlyArray<Steer> };

const type = (value: MapType): Steer => ({ subject: "mapType", value });
const band = (value: ClimateBand): Steer => ({ subject: "band", value });
const land = (value: keyof typeof LAND_FACTOR): Steer => ({ subject: "land", value });
const coast = (value: keyof typeof COAST_WARP): Steer => ({ subject: "coast", value });

const group = (steers: ReadonlyArray<Steer>, phrases: ReadonlyArray<string>): LexiconEntry[] =>
  phrases.map((phrase) => ({ phrase, steers }));

export const LEXICON: ReadonlyArray<LexiconEntry> = [
  ...group([type("island")], ["island", "isle", "islet"]),
  ...group(
    [type("archipelago")],
    [
      "archipelago",
      "isles",
      "islands",
      "islets",
      "archipelagos",
      "island chain",
      "island group",
      "isle strewn",
      "island strewn",
      "island studded",
      "many isled",
      "island chains",
      "island groups",
    ],
  ),
  ...group(
    [type("continent")],
    [
      "continent",
      "mainland",
      "continents",
      "landmass",
      "subcontinent",
      "inland sea",
      "main land",
      "mainlands",
      "subcontinents",
      "inland seas",
      "land locked seas",
      "terra australis",
    ],
  ),
  ...group(
    [type("citystate")],
    [
      "city state",
      "free city",
      "citystate",
      "walled city",
      "port city",
      "city republic",
      "sovereign city",
      "free town",
      "walled town",
      "fortified city",
      "harbor city",
      "lone city",
      "city kingdom",
    ],
  ),
  ...group(
    [band("polar")],
    [
      "cold",
      "frozen",
      "icy",
      "polar",
      "glacial",
      "wintry",
      "boreal",
      "frigid",
      "arctic",
      "snowy",
      "snowbound",
      "icebound",
      "frost",
      "frosty",
      "freezing",
      "ice",
      "glacier",
      "glaciers",
      "tundra",
      "permafrost",
      "winter",
      "snow",
      "hoarfrost",
      "reindeer",
      "winters",
      "mammoths",
      "hyperborean",
      "iceberg",
      "icebergs",
      "floe",
      "floes",
      "antarctic",
      "circumpolar",
      "eternal snows",
      "icefields",
      "thule",
      "ultima thule",
      "icefield",
    ],
  ),
  ...group(
    [band("tropical")],
    [
      "warm",
      "tropical",
      "sweltering",
      "sun drenched",
      "steaming",
      "hot",
      "humid",
      "sultry",
      "balmy",
      "torrid",
      "tropic",
      "tropics",
      "equatorial",
      "scorching",
      "sunbaked",
      "sun baked",
      "monsoon",
      "monsoons",
      "jungle",
      "jungles",
      "palm",
      "palms",
      "rainforest",
      "savanna",
      "scorched",
      "coral",
      "reef",
      "reefs",
      "mangrove",
      "sunburnt",
      "sirocco",
      "mangroves",
      "rainforests",
      "savannas",
    ],
  ),
  ...group(
    [band("temperate")],
    [
      "temperate",
      "mild",
      "verdant",
      "green hills",
      "four seasons",
      "hedgerow",
      "hedgerows",
      "gentle clime",
      "green hill",
    ],
  ),
  ...group(
    [land("less")],
    [
      "drowned",
      "sunken",
      "flooded",
      "drowning",
      "sinking",
      "submerged",
      "inundated",
      "foundered",
      "mostly ocean",
      "sea swallowed",
      "sunk",
      "risen seas",
      "waters prevailed",
    ],
  ),
  ...group(
    [land("more")],
    [
      "vast",
      "sprawling",
      "endless",
      "boundless",
      "immense",
      "terra firma",
      "shrunken seas",
      "waters receded",
      "seas receded",
      "receding seas",
      "waters abated",
    ],
  ),
  ...group(
    [coast("ragged")],
    [
      "ragged",
      "jagged",
      "shattered",
      "craggy",
      "rugged",
      "fretted",
      "splintered",
      "fractured",
      "inlet",
      "inlets",
      "cove",
      "coves",
      "rocky coast",
      "broken coastline",
      "indented",
      "deeply indented",
      "cragged",
      "headlands",
      "promontories",
      "broken coast",
      "rocky coasts",
      "broken coastlines",
      "broken coasts",
    ],
  ),
  ...group(
    [coast("smooth")],
    [
      "smooth",
      "gentle",
      "sandy",
      "beach",
      "beaches",
      "long strand",
      "unbroken shore",
      "unbroken coast",
      "sweeping shore",
      "sweeping coast",
      "curving shore",
      "even shore",
      "rounded shore",
      "long strands",
      "unbroken shores",
      "unbroken coasts",
      "sweeping shores",
      "sweeping coasts",
      "curving shores",
      "even shores",
      "rounded shores",
    ],
  ),
  ...group([type("continent"), land("more")], ["supercontinent", "supercontinents"]),
  ...group(
    [type("archipelago"), band("tropical")],
    ["cays", "coral isles", "coral islands", "spice islands", "coral isle"],
  ),
  ...PEOPLE_WORDS,
];

const smallWords = [...SMALL_WORDS].join(", ");

export const FOUNDING_RULES: ReadonlyArray<string> = [
  `A sentence is at most ${MAX_SENTENCE_CODE_POINTS} characters; an empty one, one holding a control character, or one holding a character this browser does not know is refused.`,
  "Capitals, punctuation, extra spaces, symbols and emoji make no difference; a hyphen reads as a space, an apostrophe is dropped, and a possessive 's is ignored.",
  "Words on the list steer the world: its shape, its climate, how much land it has, how ragged its coast is, and the tongue its places are named in.",
  "Two words that disagree about the same thing both stop steering it; a word left steering nothing counts toward the chart number instead.",
  "A world whose words name no tongue, or two that disagree, takes the tongue named by the words still setting its climate, when they name just one; when they name none, or two that differ, it takes the tongue its climate always gives; with no word left setting its climate, the chart number chooses.",
  `Every other word except ${smallWords} makes the chart number, in the order it was written.`,
];
