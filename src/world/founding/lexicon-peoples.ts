import type { ClimateBand } from "../../climate/climate.ts";
import type { CultureId } from "../../society/culture-ids.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { COAST_WARP, LexiconEntry, Steer } from "./lexicon.ts";

const type = (value: MapType): Steer => ({ subject: "mapType", value });
const band = (value: ClimateBand): Steer => ({ subject: "band", value });
const coast = (value: keyof typeof COAST_WARP): Steer => ({ subject: "coast", value });
const tongue = (value: CultureId): Steer => ({ subject: "culture", value });

const group = (steers: ReadonlyArray<Steer>, phrases: ReadonlyArray<string>): LexiconEntry[] =>
  phrases.map((phrase) => ({ phrase, steers }));

export const PEOPLE_WORDS: ReadonlyArray<LexiconEntry> = [
  ...group([coast("ragged"), tongue("norden")], ["fjords", "fjord"]),
  ...group(
    [tongue("norden")],
    [
      "jarls",
      "black pines",
      "jarl",
      "vikings",
      "norse",
      "rune",
      "runes",
      "longship",
      "longships",
      "skald",
      "skalds",
      "mead halls",
    ],
  ),
  ...group(
    [tongue("draket")],
    ["margrave", "margraves", "kaiser", "kaisers", "iron crown", "iron crowns", "black eagle", "black eagles"],
  ),
  ...group([tongue("zoryan")], ["birch", "birches", "boyar", "boyars", "tsar", "tsars", "onion domes"]),
  ...group([band("polar"), tongue("zoryan")], ["taiga"]),
  ...group(
    [tongue("ordai")],
    ["steppe", "horde", "steppes", "hordes", "khan", "khans", "yurt", "yurts", "kurgan", "kurgans"],
  ),
  ...group([band("tropical"), tongue("veshari")], ["dunes", "dune", "desert", "deserts"]),
  ...group([tongue("veshari")], ["oasis", "oases", "sultan", "sultans", "caravan", "caravans", "minaret", "minarets"]),
  ...group([type("archipelago"), band("tropical"), tongue("oromi")], ["atolls"]),
  ...group([type("island"), band("tropical"), tongue("oromi")], ["atoll"]),
  ...group(
    [tongue("oromi")],
    ["lagoon", "lagoons", "outrigger", "outriggers", "canoe", "canoes", "chiefdom", "chiefdoms", "fire peaks"],
  ),
  ...group(
    [tongue("thalassic")],
    [
      "olive",
      "marble",
      "olives",
      "temple",
      "temples",
      "oracle",
      "oracles",
      "trireme",
      "triremes",
      "laurel",
      "wine dark",
    ],
  ),
  ...group(
    [tongue("tsuren")],
    [
      "shrines",
      "cherry",
      "shrine",
      "cherry blossoms",
      "samurai",
      "shogun",
      "shoguns",
      "torii",
      "pagoda",
      "pagodas",
      "bamboo",
    ],
  ),
  ...group(
    [tongue("tezcal")],
    ["pyramids", "jade", "pyramid", "cenote", "cenotes", "jaguar", "jaguars", "obsidian", "feathered serpent"],
  ),
  ...group(
    [tongue("sylvan")],
    [
      "meadows",
      "elven",
      "meadow",
      "elf",
      "elves",
      "elvish",
      "druid",
      "druids",
      "glen",
      "glens",
      "faerie",
      "standing stones",
    ],
  ),
];
