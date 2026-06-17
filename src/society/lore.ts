import type { Rng } from "../core/rng.ts";
import { BIOMES } from "../climate/biomes.ts";
import type { NamedSettlement, World } from "../world/types.ts";

/**
 * Travelers' notes for the atlas gazetteer: one or two deterministic
 * sentences per settlement, flavored by culture, situation, and rank.
 * A LoreWriter owns its repeat-avoidance memory, so one writer per
 * gazetteer pass keeps neighboring entries from echoing each other.
 */

// Trade goods come in two registers so templates draw an appropriate fill:
// AROMATIC for "smell of %a" (scented, organic), CARGO for "laden with %c"
// (any freight, including minerals and craft goods).
export const AROMATIC_GOODS: Record<string, readonly string[]> = {
  thalassic: ["olive oil", "brined olives", "orange peel", "salt cod", "pine pitch"],
  norden: ["whale oil", "pine tar", "smoked herring", "tallow", "juniper smoke"],
  veshari: ["saffron", "rose attar", "cardamom", "sandalwood", "ripe dates"],
  sylvan: ["heather honey", "cider", "beeswax", "woodsmoke", "pressed apples"],
  oromi: ["palm wine", "coconut oil", "smoked fish", "frangipani", "copra"],
  draket: ["bitter ale", "pine pitch", "hot tar", "smoked mutton", "peat smoke"],
};

export const CARGO_GOODS: Record<string, readonly string[]> = {
  thalassic: ["salt cod", "pearl-shell", "amber", "dyed sailcloth", "olive oil"],
  norden: ["whale oil", "iron blooms", "pine tar", "sealskin", "smoked herring"],
  veshari: ["saffron", "indigo", "dates", "rose attar", "glazed tiles"],
  sylvan: ["heather honey", "cider", "willow-bark", "wool", "carved oak"],
  oromi: ["dried fish", "black pearls", "feather cloaks", "obsidian", "palm wine"],
  draket: ["iron ingots", "black granite", "wolf pelts", "siege timber", "bitter ale"],
};

export const HARBOR_NOTES = [
  "Its quays smell of %a and old rope.",
  "A breakwater of grey stone shelters boats laden with %c.",
  "Pilots here will see a ship past the shoals for a fair price.",
  "The harbor bell rings whenever fog comes off the water.",
  "Ships water here before standing out to the deep.",
  "Half the town turns out when a sail crests the horizon.",
  "Chandlers along the front sell %c by the bale.",
  "The tide leaves the inner moorings dry by noon.",
  "Gulls quarrel over the offal thrown from the cleaning sheds.",
  "Its warehouses hold %c against the winter freight.",
  "A crooked light leans over the harbor mouth.",
  "Sailors swear the spray here tastes of %a.",
  "Nets hang drying along every seawall and railing.",
  "Foreign flags are common at its wharves in the trading season.",
];

export const RIVER_NOTES = [
  "Barges put in here loaded with %c.",
  "A weathered ferry crosses on a rope older than its ferryman.",
  "The mill wheel turns all year on the cold current.",
  "Floods leave the lower lanes ankle-deep each spring.",
  "Eels from this reach are said to be the realm's finest.",
  "The bridge toll is one coin, two for strangers.",
  "Rafts of timber are poled downstream past its landings.",
  "Willow baskets of %c wait at the landings for the spring rise.",
  "A fish weir bars the shallows just above the town.",
  "Watermen know every gravel bar between here and the sea.",
  "The river fog does not lift here until midmorning.",
  "Its smithy draws trade from a day's walk in any direction.",
  "Osiers cut from the banks are woven into %c.",
  "A drowned bell is said to toll under the deepest pool.",
];

export const INLAND_NOTES = [
  "Drovers rest their herds by the old market cross.",
  "Known along the road for its stubborn mules and honest scales.",
  "The inn keeps a fire lit for travelers come down from the hills.",
  "Little happens here, which suits its people well.",
  "Its wool travels three valleys away under the name %c.",
  "An old beacon tower watches the road from the rise.",
  "Pack trains halt here to shoe horses and mend harness.",
  "The threshing floor is the widest for a day's ride.",
  "Its market keeps to the old calendar of feast days.",
  "Shepherds bring %c down from the high pastures in autumn.",
  "A stone well at the crossroads has never run dry.",
  "Hedges divide its fields into a patchwork older than the realm.",
  "Travelers remember its bread and forget its name.",
  "Wolves are heard in the hills on the coldest nights.",
];

// The capital draws from its own register and never reuses a generic
// situational line, so the entry readers look at first stays distinct.
export const CAPITAL_NOTES = [
  "Here the court keeps its ledgers, levies, and grudges.",
  "Its walls were raised thrice and breached only once.",
  "All roads on this chart, sooner or later, lead here.",
  "The realm's coin is struck behind these gates.",
  "Envoys wait weeks in its antechambers for a single audience.",
  "Its archives hold charters no living hand can read.",
  "The great bell is rung only for a death or a crowning.",
  "Banners of every vassal hang in its council hall.",
];

export const CAPITAL_DETAILS = [
  "Caravans arrive heavy with %c and leave heavier with tax.",
  "Its markets set the price that lesser towns must follow.",
  "Guildhalls crowd the square below the citadel.",
  "Watchmen call the hours from its gate-towers through the night.",
  "Money-changers keep their benches along the colonnade.",
  "Petitioners throng its steps on court days.",
];

const REALM_MOODS = [
  "keeps its own counsel",
  "pays its tithes late",
  "claims the better fishing grounds",
  "remembers older borders",
  "mints a thinner coin",
  "guards its mountain passes jealously",
  "has not forgiven the last war",
  "weds its daughters to settle its debts",
  "answers letters from the capital slowly",
  "swears fealty with one hand on its sword",
];

const BIOME_NOTES: Partial<Record<number, string>> = {
  [BIOMES.marsh]: "Reed-cutters work the fens at low water.",
  [BIOMES.desert]: "Wells here are deep, and guarded jealously.",
  [BIOMES.taiga]: "Snow lies on the rooftops half the year.",
  [BIOMES.jungle]: "The forest takes back any field left fallow a season.",
  [BIOMES.tundra]: "Winters here are measured in lamp-oil.",
};

export type LoreWriter = {
  settlementNote(s: NamedSettlement): string;
  realmNote(realmName: string): string;
};

export function createLoreWriter(world: World, rng: Rng): LoreWriter {
  const aromatic = AROMATIC_GOODS[world.culture.id] ?? AROMATIC_GOODS["thalassic"]!;
  const cargo = CARGO_GOODS[world.culture.id] ?? CARGO_GOODS["thalassic"]!;
  const used = new Map<readonly string[], Set<string>>();

  // cycle the whole pool before any repeat: pick only from the unused
  // members, resetting when the pool is exhausted. Keeps distribution even
  // and adjacent repeats rare, while staying a pure function of the seed.
  const freshPick = (list: readonly string[]): string => {
    let seen = used.get(list);
    if (!seen) {
      seen = new Set();
      used.set(list, seen);
    }
    if (seen.size >= list.length) seen.clear();
    const avail = list.filter((x) => !seen.has(x));
    const choice = rng.pick(avail);
    seen.add(choice);
    return choice;
  };

  const fill = (template: string): string => {
    let out = template;
    if (out.includes("%a")) out = out.replace("%a", freshPick(aromatic));
    if (out.includes("%c")) out = out.replace("%c", freshPick(cargo));
    return out;
  };

  return {
    settlementNote(s: NamedSettlement): string {
      const parts: string[] = [];
      if (s.kind === "capital") {
        parts.push(freshPick(CAPITAL_NOTES));
        parts.push(fill(freshPick(CAPITAL_DETAILS)));
      } else if (s.harbor) {
        parts.push(fill(freshPick(HARBOR_NOTES)));
      } else if (s.onRiver) {
        parts.push(fill(freshPick(RIVER_NOTES)));
      } else {
        parts.push(fill(freshPick(INLAND_NOTES)));
      }
      const biome = world.biomes[s.x + s.y * world.elev.w] as number;
      const biomeNote = BIOME_NOTES[biome];
      if (biomeNote && s.kind !== "capital" && rng.next() < 0.7) {
        parts.push(biomeNote);
      }
      return parts.join(" ");
    },
    realmNote(realmName: string): string {
      return `${realmName} ${freshPick(REALM_MOODS)}.`;
    },
  };
}
