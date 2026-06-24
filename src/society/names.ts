import type { Rng } from "../core/rng.ts";
import type { MapType } from "../terrain/heightfield.ts";
import { editDistanceWithin1 } from "../core/text.ts";

// Common English words the syllable grammar can stumble into. A base matching
// one only reads as plain English when it surfaces as its OWN word in a name
// ("the main atolls", "the sea of dad"); fused into a longer token — a town
// suffix ("Manvik") or a glued template ("%ia" -> "Braia") — it reads as
// invented and is fine. So this screen only fires for a standalone slot (see
// uniqueBase). Small and targeted, not exhaustive.
export const ENGLISH_BLOCKLIST = new Set<string>([
  "main", "deep", "reach", "run", "rest", "sand", "land", "band",
  "mine", "mane", "mare", "more", "core", "bore", "sore", "lore", "gore",
  "moan", "moor", "lord", "word", "ward", "born", "corn", "horn", "worn",
  "barn", "darn", "yarn", "men", "man", "sun", "son", "sin", "din", "den",
  "don", "dun", "ten", "tin", "tan", "ton", "ran", "van", "wan", "mist",
  "mast", "most", "last", "lost", "cost", "rust", "dust", "must", "fast",
  "vast", "then", "than", "thin", "dell", "hall", "hill", "well", "bell",
  "tell", "sell", "fell", "mark", "dark", "lark", "bark", "stark", "stork",
  "mom", "dad", "bra",
]);

function isShortPrefix(a: string, b: string): boolean {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length <= 3 && longer.startsWith(shorter);
}

// A template's "%" reads as its own word only when it is not glued to letters
// on either side: "The Sea of %" / "Greater %" are standalone slots, while
// "%ia" / "The %wood" fuse the base into a longer token.
export function isStandaloneSlot(template: string): boolean {
  const i = template.indexOf("%");
  const isLetter = (c: string | undefined): boolean =>
    c !== undefined && /[a-z]/i.test(c);
  return !isLetter(template[i - 1]) && !isLetter(template[i + 1]);
}

/**
 * Syllable-grammar name generator. Each culture defines phoneme inventories
 * and pattern templates (O = onset, N = nucleus, C = coda). Feature names
 * (rivers, seas, peaks…) wrap a generated base in culture-flavored templates,
 * where "%" stands for the base.
 */

export type Culture = {
  readonly id: string;
  readonly onsets: readonly string[];
  readonly nuclei: readonly string[];
  readonly codas: readonly string[];
  readonly patterns: readonly string[];
  readonly townSuffixes: readonly string[];
  readonly riverTemplates: readonly string[];
  readonly peakTemplates: readonly string[];
  readonly seaTemplates: readonly string[];
  readonly lakeTemplates: readonly string[];
  readonly forestTemplates: readonly string[];
  readonly realmTemplates: readonly string[];
};

export const CULTURES: readonly Culture[] = [
  {
    id: "thalassic",
    onsets: ["th", "v", "s", "m", "n", "l", "r", "c", "mar", "vel", "sel", "tal", "or"],
    nuclei: ["a", "e", "o", "i", "ia", "ea", "ai", "io"],
    codas: ["", "n", "r", "s", "l", "th", "ra", "mor", "lis", "dor"],
    patterns: ["ONC", "ON", "ONON", "ONCON", "ONONC"],
    townSuffixes: ["mere", "haven", "port", "mar", "cove"],
    riverTemplates: ["River %", "The % Run", "The %water"],
    peakTemplates: ["The % Peaks", "Mount %", "The Spires of %"],
    seaTemplates: ["The Sea of %", "The % Deep", "The % Expanse"],
    lakeTemplates: ["Lake %", "The % Mere", "The Mirror of %"],
    forestTemplates: ["The %wood", "The Groves of %", "% Forest"],
    realmTemplates: ["The Realm of %", "The % Dominion", "%ia"],
  },
  {
    id: "norden",
    onsets: ["k", "g", "h", "br", "dr", "sk", "thr", "gr", "v", "hj", "kal", "sten"],
    nuclei: ["a", "o", "u", "e", "ei", "au"],
    codas: ["", "k", "g", "rk", "nd", "rg", "ld", "rn", "st"],
    patterns: ["ONC", "ON", "ONCON", "ONCONC"],
    townSuffixes: ["stad", "vik", "fell", "gard", "fjord"],
    riverTemplates: ["The % Torrent", "River %", "The %flow"],
    peakTemplates: ["The % Crags", "The Teeth of %", "% Fell"],
    seaTemplates: ["The % Reach", "The Frozen Sea of %", "The % Gulf"],
    lakeTemplates: ["% Vatn", "Lake %", "The % Tarn"],
    forestTemplates: ["The %mark", "The Pines of %", "% Wilds"],
    realmTemplates: ["The Jarldom of %", "The % March", "Greater %"],
  },
  {
    id: "veshari",
    onsets: ["z", "sh", "kh", "q", "s", "n", "m", "az", "ish", "far", "sah"],
    nuclei: ["a", "i", "u", "aa", "ai", "ara"],
    codas: ["", "r", "n", "sh", "m", "l", "din", "zar"],
    patterns: ["ONC", "ONON", "ON", "ONCON"],
    townSuffixes: ["abad", "ara", "esh", "ir", "qash"],
    riverTemplates: ["The % Flow", "The Waters of %", "Wadi %"],
    peakTemplates: ["The Dunespires of %", "The % Heights", "Mount %"],
    seaTemplates: ["The Sea of %", "The % Mirror", "The Gulf of %"],
    lakeTemplates: ["The Pool of %", "Lake %", "The % Basin"],
    forestTemplates: ["The % Oasis", "The Palms of %", "% Thicket"],
    realmTemplates: ["The Sultanate of %", "The % Expanse", "Greater %"],
  },
  {
    id: "sylvan",
    onsets: ["w", "l", "f", "el", "ael", "br", "th", "gw", "lor", "fen"],
    nuclei: ["e", "i", "a", "ae", "ie", "ei"],
    codas: ["", "l", "n", "th", "wen", "ril", "las", "mir"],
    patterns: ["ONC", "ONON", "ONCON", "ON"],
    townSuffixes: ["dell", "mere", "brook", "hollow", "glade"],
    riverTemplates: ["The % Brook", "River %", "The Silver %"],
    peakTemplates: ["The % Downs", "The Sleeping %", "% Tor"],
    seaTemplates: ["The % Calm", "The Sea of %", "The % Shallows"],
    lakeTemplates: ["% Mere", "The Still %", "Lake %"],
    forestTemplates: ["The %wold", "Old %", "The Heart of %"],
    realmTemplates: ["The Vale of %", "The % Compact", "Fair %"],
  },
  {
    id: "oromi",
    onsets: ["k", "t", "m", "n", "h", "r", "l", "p", "w", "kai", "tau", "moa"],
    nuclei: ["a", "o", "u", "e", "ai", "au", "oa"],
    codas: ["", "", "n", "ng", "ki", "lo"],
    patterns: ["ONON", "ON", "ONONON", "ONC"],
    townSuffixes: ["lua", "koa", "nui", "tani", "pua"],
    riverTemplates: ["The Waters of %", "The % Falls", "River %"],
    peakTemplates: ["The Fire Peaks of %", "Mount %", "The Smoking %"],
    seaTemplates: ["The Great %", "The Sea of %", "The % Vast"],
    lakeTemplates: ["The Eye of %", "Lake %", "The % Pool"],
    forestTemplates: ["The % Groves", "The Ferns of %", "Deep %"],
    realmTemplates: ["The % Atolls", "The Chiefdom of %", "Greater %"],
  },
  {
    id: "draket",
    onsets: ["dr", "kr", "gr", "th", "mal", "bar", "z", "d", "g", "vor", "skar"],
    nuclei: ["a", "e", "o", "u", "ya"],
    codas: ["", "k", "th", "rg", "d", "mar", "gat"],
    patterns: ["ONC", "ONCONC", "ONCON", "ON"],
    townSuffixes: ["hold", "spire", "gate", "keep", "burg"],
    riverTemplates: ["The % Cut", "River %", "The Black %"],
    peakTemplates: ["The % Fangs", "The Throne of %", "% Spire"],
    seaTemplates: ["The % Maw", "The Sea of %", "The Iron %"],
    lakeTemplates: ["The % Depths", "Lake %", "The Drowned %"],
    forestTemplates: ["The % Thorns", "The Dark of %", "% Forest"],
    realmTemplates: ["The Empire of %", "The % Dominion", "Iron %"],
  },
];

export type NameKind =
  | "settlement"
  | "river"
  | "peak"
  | "sea"
  | "lake"
  | "forest"
  | "realm"
  | "bare";

export type Namer = {
  readonly culture: Culture;
  name(kind: NameKind): string;
};

const ROMAN = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function createNamer(rng: Rng, culture: Culture): Namer {
  const used = new Set<string>();
  // the raw stems accepted so far, screened so no two are near-duplicates
  const usedBases: string[] = [];
  let overflow = 0;

  const rawBase = (): string => {
    const pattern = rng.pick(culture.patterns);
    let s = "";
    for (const ch of pattern) {
      if (ch === "O") s += rng.pick(culture.onsets);
      else if (ch === "N") s += rng.pick(culture.nuclei);
      else s += rng.pick(culture.codas);
    }
    return s;
  };

  // reject a stem that sits within one edit (or is a short prefix) of one
  // already used — "Mai"/"Main", "Vela"/"Veles" and the like
  const nearDuplicate = (stem: string): boolean =>
    usedBases.some((b) => editDistanceWithin1(b, stem) || isShortPrefix(b, stem));

  // `standalone` is true when the base will read as its own word in the final
  // name (a settlement with no suffix, or a template whose "%" is a standalone
  // slot). Only then does an English-word base read as plain English and get
  // re-rolled; fused into a longer token it is left alone.
  const uniqueBase = (suffix: string, standalone: boolean): string => {
    for (let attempt = 0; attempt < 30; attempt++) {
      let s = rawBase();
      if (s.length < 3 || s.length > 9 || s.length + suffix.length > 13) continue;
      if (/[aeiou]{3}/.test(s) || /(.)\1\1/.test(s)) continue;
      const stem = s.toLowerCase();
      if (standalone && ENGLISH_BLOCKLIST.has(stem)) continue;
      if (nearDuplicate(stem)) continue;
      if (suffix) {
        if (s.endsWith(suffix[0] as string)) s = s.slice(0, -1);
        else if (/[aeiou]$/.test(s) && /^[aeiou]/.test(suffix)) s = s.slice(0, -1);
        if (s.length < 3) continue;
      }
      const full = capitalize(s + suffix);
      if (!used.has(full.toLowerCase())) {
        used.add(full.toLowerCase());
        usedBases.push(stem);
        return full;
      }
    }
    // tight namespace: a Roman-numeral base, kept unique by construction. The
    // numeral disambiguates, so these are exempt from the near-dup screen — but
    // the base still renders as its own word ("Bra II"), so the English-word
    // screen always applies here.
    for (let tries = 0; tries < 1000; tries++) {
      const base = rawBase();
      if (ENGLISH_BLOCKLIST.has(base.toLowerCase())) continue;
      const fallback = `${capitalize(base)} ${ROMAN[overflow++ % ROMAN.length]}`;
      if (!used.has(fallback.toLowerCase())) {
        used.add(fallback.toLowerCase());
        return fallback;
      }
    }
    // unreachable in practice; guarantees termination
    return `${capitalize(rawBase())} ${overflow++}`;
  };

  const templated = (templates: readonly string[]): string => {
    const t = rng.pick(templates);
    return t.replace("%", uniqueBase("", isStandaloneSlot(t)));
  };

  return {
    culture,
    name(kind: NameKind): string {
      switch (kind) {
        case "settlement": {
          const wantSuffix = rng.next() < 0.4;
          const suffix = wantSuffix ? rng.pick(culture.townSuffixes) : "";
          return uniqueBase(suffix, suffix === "");
        }
        case "river":
          return templated(culture.riverTemplates);
        case "peak":
          return templated(culture.peakTemplates);
        case "sea":
          return templated(culture.seaTemplates);
        case "lake":
          return templated(culture.lakeTemplates);
        case "forest":
          return templated(culture.forestTemplates);
        case "realm":
          return templated(culture.realmTemplates);
        case "bare":
          return uniqueBase("", true);
      }
    },
  };
}

const TITLE_ADJECTIVES = [
  "Sundered", "Verdant", "Gilded", "Mistbound", "Amber", "Whispering",
  "Salt-Worn", "Untamed", "Drowned", "Shining", "Storm-Held", "Quiet",
];

const AGES = ["Lantern", "Ember", "Tide", "Crane", "Iron", "Pale", "Cedar"];

const TITLE_PATTERNS: Record<MapType, readonly string[]> = {
  island: ["The @ Isle of %", "The Isle of %", "% , the @ Isle"],
  archipelago: ["The @ Isles of %", "The % Archipelago", "The Scattered Isles of %"],
  continent: ["The @ Reaches of %", "The Realm of %", "Terra %"],
  citystate: ["The Free City of %", "% and its Hinterland", "The City-State of %"],
};

export type MapTitle = {
  readonly title: string;
  readonly subtitle: string;
  readonly year: number;
};

export function makeMapTitle(
  rng: Rng,
  culture: Culture,
  mapType: MapType,
  baseOverride?: string,
): MapTitle {
  const namer = createNamer(rng.fork("title-base"), culture);
  const base = baseOverride ?? namer.name("bare");
  const pattern = rng.pick(TITLE_PATTERNS[mapType]);
  const title = pattern
    .replace("@", rng.pick(TITLE_ADJECTIVES))
    .replace("%", base)
    .replace(" ,", ",");
  const year = 200 + rng.int(1100);
  const age = rng.pick(AGES);
  const surveyor = createNamer(rng.fork("surveyor"), culture).name("bare");
  const subtitle =
    `Being a true & faithful chart of these waters, as surveyed by ` +
    `${surveyor} the Wayfarer in the year ${year} of the ${age} Age`;
  return { title, subtitle, year };
}
