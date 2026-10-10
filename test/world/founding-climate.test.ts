import { test } from "node:test";
import assert from "node:assert/strict";
import type { ClimateBand } from "../../src/climate/climate.ts";
import { CULTURE_IDS, type CultureId } from "../../src/society/culture-ids.ts";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { CLIMATE_TRADITION, LEXICON, type LexiconEntry, type Steer } from "../../src/world/founding/lexicon.ts";

const founded = (sentence: string): Founding => {
  const f = foundWorld(sentence);
  assert.ok(f.ok, `"${sentence}" should found a world, was refused: ${f.ok ? "" : f.reason}`);
  return f;
};

const phrases = (list: Founding["steered"]): string[] => list.map((r) => r.phrase);

const steersOf = (f: Founding, phrase: string): ReadonlyArray<Steer> => {
  const found = f.steered.find((r) => r.phrase === phrase);
  assert.ok(found !== undefined, `"${phrase}" should steer`);
  return found.steers;
};

const bandOf = (steers: ReadonlyArray<Steer>): ClimateBand | undefined => {
  for (const steer of steers) if (steer.subject === "band") return steer.value;
  return undefined;
};

const tongueOf = (steers: ReadonlyArray<Steer>): CultureId | undefined => {
  for (const steer of steers) if (steer.subject === "culture") return steer.value;
  return undefined;
};

const climateWords = (namesAPeople: boolean): LexiconEntry[] =>
  LEXICON.filter((e) => bandOf(e.steers) !== undefined && (tongueOf(e.steers) !== undefined) === namesAPeople);
const NAMING_CLIMATE = climateWords(true);
const PLAIN_CLIMATE = climateWords(false);
const BEATS_TABLE = NAMING_CLIMATE.filter((e) => {
  const band = bandOf(e.steers);
  return band !== undefined && tongueOf(e.steers) !== CLIMATE_TRADITION[band];
});
const TONGUE_WORDS = LEXICON.filter((e) => e.steers.length === 1 && tongueOf(e.steers) !== undefined);

const oneWordPerOtherPeople = (own: CultureId): string[] => {
  const words = CULTURE_IDS.filter((id) => id !== own).flatMap((id) =>
    TONGUE_WORDS.filter((e) => tongueOf(e.steers) === id)
      .slice(0, 1)
      .map((e) => e.phrase),
  );
  assert.equal(words.length, CULTURE_IDS.length - 1, `every people but ${own} needs a word naming only it`);
  return words;
};

const climateAndPeople = (entry: LexiconEntry): { band: ClimateBand; own: CultureId } => {
  const band = bandOf(entry.steers);
  const own = tongueOf(entry.steers);
  assert.ok(band !== undefined && own !== undefined, entry.phrase);
  return { band, own };
};

const keptBeside = (word: LexiconEntry, beside: LexiconEntry): ReadonlyArray<Steer> =>
  word.steers.filter(
    (s) => s.subject === "culture" || !beside.steers.some((t) => t.subject === s.subject && t.value !== s.value),
  );

const rivalsOf = (lost: Steer): LexiconEntry[] =>
  LEXICON.filter((rival) => {
    const [only] = rival.steers;
    return (
      rival.steers.length === 1 && only !== undefined && only.subject === lost.subject && only.value !== lost.value
    );
  });

test("a clashed tradition falls to the climate word that names it, which is credited with it beside a plain climate word", () => {
  const f = founded("sun-drenched atolls ringed with shrines where the old kings drowned");
  assert.deepEqual(f.overrides, { mapType: "archipelago", band: "tropical", landFraction: 0.132, culture: "oromi" });
  assert.deepEqual(steersOf(f, "atolls"), [
    { subject: "mapType", value: "archipelago" },
    { subject: "band", value: "tropical" },
    { subject: "culture", value: "oromi" },
  ]);
  assert.deepEqual(steersOf(f, "sun drenched"), [{ subject: "band", value: "tropical" }]);
  assert.deepEqual(phrases(f.contested), ["shrines"]);
  assert.equal(f.residual, "ringed shrines old kings");
});

test("a climate word that names a people settles a clash over the names with its own, and is credited with it", () => {
  const f = founded("a desert of sultans and temples");
  assert.deepEqual(f.overrides, { band: "tropical", culture: "veshari" });
  assert.deepEqual(f.steered, [
    {
      phrase: "desert",
      steers: [
        { subject: "band", value: "tropical" },
        { subject: "culture", value: "veshari" },
      ],
    },
  ]);
  assert.deepEqual(phrases(f.contested), ["sultans", "temples"]);
  assert.equal(f.residual, "sultans temples");
  assert.deepEqual(founded("taiga of jarls and boyars").overrides, { band: "polar", culture: "zoryan" });
  assert.deepEqual(founded("desert shrines").overrides, { band: "tropical", culture: "veshari" });
  assert.deepEqual(founded("dunes and pagodas").overrides, { band: "tropical", culture: "veshari" });
});

test("every climate word that names a people, against a word of every other people, settles the clash with its own", () => {
  assert.ok(BEATS_TABLE.length > 0, "some swept word must name a people its climate's table would not give");
  for (const entry of NAMING_CLIMATE) {
    const { band, own } = climateAndPeople(entry);
    for (const other of oneWordPerOtherPeople(own)) {
      for (const sentence of [`${entry.phrase} ${other}`, `${other} ${entry.phrase}`]) {
        const f = founded(sentence);
        assert.equal(f.overrides.band, band, sentence);
        assert.equal(f.overrides.culture, own, sentence);
        assert.deepEqual(steersOf(f, entry.phrase), entry.steers, sentence);
        assert.deepEqual(phrases(f.contested), [other], sentence);
      }
    }
  }
});

test("a credited climate word takes back only its people, never a meaning another word clashed with", () => {
  const cases = NAMING_CLIMATE.flatMap((entry) =>
    entry.steers
      .filter((s) => s.subject !== "band" && s.subject !== "culture")
      .flatMap((lost) =>
        rivalsOf(lost).flatMap((rival) =>
          oneWordPerOtherPeople(climateAndPeople(entry).own).map((other) => ({
            entry,
            lost,
            sentence: `${entry.phrase} ${rival.phrase} ${other}`,
          })),
        ),
      ),
  );
  assert.ok(
    cases.length > 0,
    "the list must hold a climate word naming a people with a third meaning a rival can clash with",
  );
  for (const { entry, lost, sentence } of cases) {
    const f = founded(sentence);
    assert.equal(f.overrides.culture, climateAndPeople(entry).own, sentence);
    assert.deepEqual(
      steersOf(f, entry.phrase),
      entry.steers.filter((s) => s !== lost),
      sentence,
    );
  }
  assert.deepEqual(founded("atolls island shrines").overrides, { band: "tropical", culture: "oromi" });
  assert.deepEqual(founded("a continent of atolls and shrines").overrides, { band: "tropical", culture: "oromi" });
});

test("a plain climate word steps aside, and is not credited with the people", () => {
  const f = founded("a hot desert of sultans and temples");
  assert.deepEqual(f.overrides, { band: "tropical", culture: "veshari" });
  assert.deepEqual(steersOf(f, "hot"), [{ subject: "band", value: "tropical" }]);
  assert.deepEqual(founded("frozen taiga of jarls and boyars").overrides, { band: "polar", culture: "zoryan" });
  const both = founded("desert and dunes of sultans and temples");
  assert.equal(both.overrides.culture, "veshari");
  for (const word of ["desert", "dunes"]) assert.equal(tongueOf(steersOf(both, word)), "veshari", word);
});

test("every plain climate word, before or after every climate word of its climate that names a people, steps aside", () => {
  assert.ok(BEATS_TABLE.some((e) => PLAIN_CLIMATE.some((p) => bandOf(p.steers) === bandOf(e.steers))));
  for (const entry of NAMING_CLIMATE) {
    const { band, own } = climateAndPeople(entry);
    for (const plain of PLAIN_CLIMATE.filter((p) => bandOf(p.steers) === band)) {
      for (const other of oneWordPerOtherPeople(own)) {
        for (const sentence of [
          `${plain.phrase} ${entry.phrase} ${other}`,
          `${entry.phrase} ${plain.phrase} ${other}`,
        ]) {
          const f = founded(sentence);
          assert.equal(f.overrides.culture, own, sentence);
          assert.deepEqual(steersOf(f, plain.phrase), keptBeside(plain, entry), sentence);
          assert.deepEqual(steersOf(f, entry.phrase), keptBeside(entry, plain), sentence);
        }
      }
    }
  }
});

test("when the climate table gives the people, no word is credited with it", () => {
  const f = founded("a cold land of quiet towns");
  assert.equal(f.overrides.culture, "norden");
  assert.deepEqual(steersOf(f, "cold"), [{ subject: "band", value: "polar" }]);
});

test("climate words of one climate that name different peoples leave the names to the table, crediting neither", () => {
  const pairs = NAMING_CLIMATE.flatMap((a) =>
    NAMING_CLIMATE.filter(
      (b) => bandOf(b.steers) === bandOf(a.steers) && tongueOf(b.steers) !== tongueOf(a.steers),
    ).map((b) => [a, b] as const),
  );
  assert.ok(pairs.length > 0, "the list must hold two climate words of one climate naming different peoples");
  for (const [a, b] of pairs) {
    const sentence = `${a.phrase} ${b.phrase}`;
    const f = founded(sentence);
    assert.equal(f.overrides.culture, CLIMATE_TRADITION[climateAndPeople(a).band], sentence);
    for (const word of [a, b]) assert.equal(tongueOf(steersOf(f, word.phrase)), undefined, sentence);
  }
  for (const sentence of ["dunes and atolls", "atolls and dunes", "desert dunes and atolls"]) {
    assert.equal(founded(sentence).overrides.culture, "oromi", sentence);
  }
});

test("only a word that sets the climate settles a clash over the names", () => {
  const f = founded("mild fjords and birches");
  assert.deepEqual(f.overrides, { band: "temperate", coastWarp: 0.95, culture: "sylvan" });
  assert.deepEqual(steersOf(f, "fjords"), [{ subject: "coast", value: "ragged" }]);
});

test("a word that names a people but sets no climate is never credited beside a climate word that names one", () => {
  const unclimatic = LEXICON.filter(
    (e) => e.steers.length > 1 && bandOf(e.steers) === undefined && tongueOf(e.steers) !== undefined,
  );
  assert.ok(unclimatic.length > 0, "the list must hold a word naming a people beside another meaning but no climate");
  for (const entry of NAMING_CLIMATE) {
    const { own } = climateAndPeople(entry);
    for (const other of unclimatic.filter((o) => tongueOf(o.steers) !== own)) {
      for (const sentence of [`${entry.phrase} ${other.phrase}`, `${other.phrase} ${entry.phrase}`]) {
        const f = founded(sentence);
        assert.equal(f.overrides.culture, own, sentence);
        const kept = keptBeside(other, entry).filter((s) => s.subject !== "culture");
        if (kept.length === 0) assert.ok(phrases(f.contested).includes(other.phrase), sentence);
        else assert.deepEqual(steersOf(f, other.phrase), kept, sentence);
      }
    }
  }
});
