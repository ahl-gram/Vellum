# Issue #856 plan: the founding words for shape, count and size, the number rule, and the shape pins

- **Planned at:** `origin/main` 6aa9420fff844ae2649d5c717303274c118194c9 (PR #1153), 2026-10-31, re-read after the rulings the same day. Issue #856 comment count 3 (6281757291, the 2026-10-20 re-baseline; 6282681072, the Issue #829 pointer; 6547808210, Alex's rulings). Epic Issue #844 comment count 11, of which this plan rests on 6099188094 (D5, D6, D8, D13, D14), 6281585030 (the Sub 0 sitting), 6281585596 (its premise corrections), 6281800234 (the typed request is version 1) and 6545165577 (the Issue #855 sitting: the mechanism is frozen). Also read: Issue #851 comments 6340875127 and 6341958994, Issue #852 comments 6281723780, 6484149133, 6488564906 and 6488894044, Issue #853 comments 6281725148, 6512462029 and 6512894383, Issue #854 comments 6527008800, 6528036863 and 6533770339, Issue #855 comment 6545170470, Issue #1142's body.
- **Rulings:** https://github.com/ahl-gram/Vellum/issues/856#issuecomment-6547808210 (Alex, 2026-10-31), on the nine questions of this plan's menu. Quoted, not paraphrased:
  1. Number rule: "C: "few" and "countless" count anywhere in an island sentence". Confirmed on a follow-up check as ON TOP of option A's rule: "Yes, on top of A". So "100 equal sized round islands" still needs only size and shore words between, "100 tropical islands" still sets no count, and "few" (about 5) and "countless" (the ceiling) count anywhere in a sentence that makes an archipelago. The planner's measured values for C (three kept sentences move) apply.
  2. "scattered": "A: leave it out (Recommended)". "scattered isles" still makes an archipelago, with no set count.
  3. Count beside another kind of land: "A: the two cancel each other (Recommended)".
  4. Count beside a shape: "A: the shape wins (Recommended)". The land is exactly the place and the count sets nothing.
  5. Coast words in a counted sentence: "A: they roughen each island's shore (Recommended)".
  6. Bare shape words (crescent, crescent shaped, round island): "A: yes, they join (Recommended)".
  7. Places sharing a name: "B: map data order, plus our own short list (Recommended)".
  8. Where the founding finds place names: "A: the list the Explorer's shape box already fetches (Recommended)".
  9. The kept test sample: "A: keep the sample as written (Recommended)".
- **What the rulings changed against the plan Alex was shown:** ruling 1 adds the band words' reading outside the count phrase (the scan, commit 5, four new rows, two more kept rows re-pinned, T5's third form); the other eight confirm the design as it stood. The menu's "three kept sentences move" for option C counted "Scattered isles in a warm turquoise sea", which ruling 2 keeps out, so two move under ruling 1: "Mostly ocean please, with a few warm atolls ..." and "Lo, the sea is wide and the islands few." (measured, `final-ruled.log`); with ruling 6's two crescent rows and the Aegean row, five kept rows move in all.
- **Open decisions: none.**
- **Recon:** `vellum-spec-recon`, 2026-10-31 at 6aa9420f. Blocking STALE: D14 (a count on every type) is reversed by Sub 0 ruling 7 and Issue #852 R1, and the terrain refuses a count off the archipelago or beside an outline (`countedOf` in `src/terrain/heightfield.ts`); the ceiling is `MAX_ISLANDS = 100`, the floor `MIN_ISLANDS = 2` (`src/terrain/lobes.ts`); the recipe has five new fields, not three (`outline`, `looseness`, `islands`, `isleSize`, `raggedness`); the roster is 5,646 places named by serial number, its names in `src/world/outline-place-names.json`. Cosmetic STALE: the land-mask checksum lives in `test/world/land-mask-pins.test.ts` (`checksum`), not in `test/world/golden-seed42.test.ts`, whose `labelsChecksum` hashes realm labels. CURRENT: every example's founding today, the list checksum 2379797468, the kept-sample word counts, `FOUNDING_GLOBALS` (`Array`, `Map`, `Math`, `Set`, `undefined`). Ruled since the body: a founded outline rests at the exact shape (no `looseness`) and a founded count at round shores (no `raggedness`), Issue #844 comment 6545165577 parts A1 and B.

## Specs

- `handbook/specs/engine-invariants.md`, "Founding a world from a sentence" (every paragraph; four are edited and one is added, Rosters and doctrine), "World identity is entry-point independent" (a sentence founds through `defaultRecipe`), and "An outline is world identity" and "A count is world identity too" in the same section (what the terrain refuses).
- `handbook/specs/rulebook.md`, the Issue #844 slot line (the words are version 1 and land before Issue #393). No golden, committed chart or seed moves: a numeric seed never founds.
- `handbook/specs/check-placement.md`, "The unit suite" (a test reads the committed name index as data, which `SOURCE_READS` does not list) and "The lint" (the founding rule, `vellum/founding-locale-clock-free`).
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" (the spec edits), "How code is cited", and the comment rule in `CLAUDE.md`.

## What this builds

A founding sentence learns four things, all inside version 1 of the founding (`FOUNDING_VERSION`), before Issue #393 locks it:

1. **The number rule (D6).** A number before a word for islands sets the archipelago's island count: "100 islands", "1,000 islands", "twenty five atolls", "a few islands", "countless islands", "a dozen islets". Listed size and shore words may stand between ("100 equal sized round islands", "a thousand small isles", "100 varied islands", "a hundred jagged isles").
2. **The band words anywhere (ruling 1).** "few" and "countless", standing anywhere else in a sentence that makes an archipelago, set its count too: "the islands few", "a few rival kingdoms among the isles", "isles countless". In a sentence that makes no archipelago they set nothing and are contested.
3. **The shape phrase (D5).** "shaped like", "in the shape of" and "the shape of", followed by a real place's name or by "crescent", "ring" or "circle", set the outline. A place's name alone still sets only what it sets today.
4. **The bare shape words** "crescent", "crescent shaped" and "round island" (ruling 6).

The founding never hands the terrain a pair it refuses: a count with no archipelago, or beside a shape, is dropped (rulings 3 and 4); beside a count or a shape a land word is dropped, as D8 rules; beside a shape a coast word is dropped, since a founded shape rests exact and the coast draws nothing there; beside a count a coast word sets the islands' own raggedness (ruling 5).

Then two founded worlds are pinned by the land mask they draw (D13), after Issue #855 froze the mechanism.

## The design

### Where each rule lives

- **Word tables:** a new `src/world/founding/lexicon-shapes.ts`, beside `src/world/founding/lexicon-peoples.ts`, holding the shape words that join `LEXICON` and the tables the rules read. Every table a sentence's word is looked up in is a `ReadonlyMap` or `ReadonlySet`, never a plain object, so a word such as "constructor" never reads an object's own member (covenant rows "constructor islands" and "shaped like constructor").
- **The number rule:** a new `src/world/founding/counts.ts`, `countAt`.
- **The shape phrase and the place names:** a new `src/world/founding/shapes.ts`, `shapeAt` and `setFoundingGazetteer`.
- **The listed-phrase lookup** moves out of `src/world/founding/found.ts` into a new `src/world/founding/listed.ts` (`longestEntryAt`, `entryNamed`), since `counts.ts` reads it too and `found.ts` imports `counts.ts`.
- **`src/world/founding/found.ts`** keeps the scan (with the band words' reading outside a count phrase), the clash, a new cross-subject pass (`refuse`), the tongue credit and the overrides.

None of the rules is a `LEXICON` row, so the list checksum does not see them; they are pinned by covenant rows of their own, by per-table rows that name every word, by a number sweep and by a checksum over every place name.

### The scan

At each position, in this order:

1. a shape phrase (`shapeAt`);
2. a count phrase (`countAt`);
3. the longest listed phrase (`longestEntryAt`);
4. a band word standing alone (a key of `BAND_WORDS` where no listed phrase starts): a one-word segment whose phrase is the word and whose own steers are `[{ subject: "islands", value: BAND_WORDS.get(word) }]`;
5. one loose word.

A shape or count hit is one segment whose phrase is its words joined by a space and whose own steers are the hit's. A segment's own steers travel with it (`own`), so the clash, the new pass and the tongue credit read them from the segment and not from a lookup by phrase, which a hit's phrase is not. A band word in a count phrase ("a few islands") is read by step 2 as part of that phrase; one anywhere else ("the islands few") by step 4. Two counts in one sentence ("100 islands and a few atolls") disagree and cancel by the clash rule, as two climates do.

### The number rule (`countAt`)

- **The number**, at the position:
  - a run of ASCII digits `[0-9]+`; when it has at most three digits, each following word of exactly three digits joins it ("1,000" cleans to `1`, `000` and reads 1000; "12,345" reads 12345). Digits are read by a hand loop, `Math.min(value * 10 + (code - 48), MAX_ISLANDS)` per character, so no `Number` or `parseInt` joins `FOUNDING_GLOBALS`. Leading zeros read ("007" is 7). A digit in any other script is an ordinary word.
  - or a band word: `BAND_WORDS`, "few" 5 and "countless" `MAX_ISLANDS` (D6; "scattered" is out, ruling 2).
  - or a run of number words: each of `NUMBER_WORDS` ("one" to "nineteen", "twenty" to "ninety") adds its value, each of `SCALE_WORDS` ("dozen" 12, "hundred" 100, "thousand" 1000) multiplies the value so far (1 when nothing came before), every step clamped at `MAX_ISLANDS`; "and" joins two number words ("a hundred and fifty"). "a" before a number word stays a small word outside the hit.
  - a value under `MIN_ISLANDS` (0 or 1) is no count: the words stay as they are today.
- **Then, word by word:** if an island word starts here (the longest of `ISLAND_WORDS`), the hit ends after it; else if a between word starts here, it is taken and the walk goes on; else there is no hit.
  - `ISLAND_WORDS`: "islands", "isles", "islets", "atolls", "cays", "skerries", "coral islands", "coral isles", "spice islands", each a listed phrase that steers the archipelago (a lexicon test holds that).
  - A between word is the longer of: a key of `BETWEEN_WORDS` ("equal", "equal sized", "evenly sized", "same sized" give `isleSize` "equal"; "varied", "different sized", "unequal" give "varied"; "small", "little", "tiny", "round" give nothing); or a listed phrase whose only steer is a coast ("jagged", "rocky coast", "smooth", "sandy"...). On a tie, the `BETWEEN_WORDS` key. No other listed word may stand between (ruling 1 keeps option A's rule): "100 tropical islands" is no count phrase.
- **The hit's steers**, in order, the first of each equal subject and value kept: `{ subject: "islands", value }`, then each between word's, then the island word's own listed steers ("atolls" adds the archipelago, the tropics and the Polynesian names).

### The shape phrase (`shapeAt`)

- **The triggers** `SHAPE_TRIGGERS`: "in the shape of", "the shape of", "shaped like". A bare "like X" never fires (D5).
- After the trigger, one of "a", "an", "the" may stand before the name (`SHAPE_ARTICLES`); the name is tried at the word right after the trigger first, then after the article, so "A Coruña" and "The Bahamas" read whole.
- **Forms first:** the single word at either start, folded, in `SHAPE_FORMS` ("crescent" crescent, "ring" ring, "circle" round). No place in the roster is named any of the three.
- **Then places**, only once forms have missed: with no gazetteer installed the result is `"unloaded"`, and `foundWorld` returns the refusal `{ ok: false, reason: "places-not-loaded" }`; with one, the longest run of words (up to the longest name) whose key is in the gazetteer.
- **A key** is the words joined by a space, then `normalize("NFD")` with every `\p{M}` removed, the same accent folding the shape box does (Issue #854 pull request 2, design 8): "curacao" finds Curaçao.
- **The gazetteer** (`setFoundingGazetteer(rows)`), built from the name index's rows `[id, name, kind, country]` as the host installs them, the list the Explorer's shape box fetches (ruling 8): each name's key is `foundingWords(name)` folded; where several rows share a key, the lowest kind wins (`PLACE_KINDS`: country, then unit, then state, then lake), then the row first in the index's order; then each pair of `PLACE_PREFERENCES` replaces its key's place (ruling 7). Each chosen ID is branded through `placeId` from `src/world/outline-ids.ts`, which throws on an ID the roster does not hold: that is the host's error at install time, never a founding's.
- **The hit's steers:** `[{ subject: "outline", value: id }]` and nothing else. A place's name keeps no listed meaning inside the phrase: none of the three readers read Japanese names from "in the shape of Japan" (Measurements).

### The cross-subject pass (`refuse`), after the clash

The clash cancels a subject two words disagree on, as today. Then, over every segment's surviving steers at once:

- `shaped` is true when an `outline` survives anywhere.
- `counted` is true when not `shaped`, an `islands` survives, and the surviving map type is the archipelago.
- Dropped from every segment: `islands` and `isleSize` unless `counted` (a count needs its archipelago, ruling 3; a shape wins over a count, ruling 4; a band word in a sentence that makes no archipelago sets nothing, ruling 1); `land` when `counted` or `shaped` (D8; Issue #851 ruling 3); `coast` when `shaped` (a founded shape rests exact, Issue #844 comment 6545165577 A1, and the coast draws nothing there, Issue #854 ruling M2).
- A segment left with no steer is contested and its words count toward the chart number, as today.

### The overrides

Beside today's five fields, in this key order after `culture`: `outline`; `islands`; `isleSize` only when "varied" (equal is the field's resting value, spelled by omission as the link does, Issue #854 call 9); `raggedness` only on a counted world with a ragged coast word, at `SHORE_RAGGEDNESS.ragged`, which is `COAST_WARP.ragged`, 0.95 (ruling 5). On a counted world a coast word sets no `coastWarp`. Nothing ever sets `looseness`.

### Rejected

- **Any listed word between a number and its island word** (the menu's option B): ruling 1 keeps option A's narrower rule.
- **"scattered" as a band word**: ruling 2; all three readers read spacing, not a count.
- **The founding importing the name index**: the Node-run engine tree does not take JSON import attributes (Issue #854 pull request 2's plan), the founding lint refuses `fs`, and `handbook/specs/site-architecture.md` keeps the index out of every bundle; ruling 8 takes the installed list.
- **A throw when no gazetteer is installed**: `handbook/specs/engine-invariants.md` makes every refusal a value, and a throw would need `RangeError` in `FOUNDING_GLOBALS`.
- **Two pull requests** (counts first, shapes with the pins second): the pins need both rules, and version 1's covenant is re-pinned once.
- **Area as the tie between shared names**: no committed file keeps a place's real size; each extract is scaled to its own width (`extractParts` in `scripts/outlines/extract.ts`).

## Files

| file | change | lines after |
|---|---|---|
| `src/world/founding/lexicon-shapes.ts` | new: the shape words and the rules' tables | about 75 |
| `src/world/founding/listed.ts` | new: the listed-phrase lookup, moved from `found.ts` | about 20 |
| `src/world/founding/counts.ts` | new: the number rule | about 85 |
| `src/world/founding/shapes.ts` | new: the shape phrase and the gazetteer | about 70 |
| `src/world/founding/found.ts` | edit: segments carry their steers, the band words alone, `refuse`, the new subjects, the refusal | about 220 |
| `src/world/founding/lexicon.ts` | edit: `Steer`, `SHORE_RAGGEDNESS`, `LEXICON`, `FOUNDING_RULES` | about 310 |
| `src/world/founding/normalize.ts` | edit: one refusal reason | 43 |
| `test-support/founding-gazetteer.ts` | new | about 15 |
| `test-support/mask-checksum.ts` | new: `checksum` moved out of `test/world/land-mask-pins.test.ts` | about 10 |
| `test/world/founding-count-covenant.test.ts` | new (its row table formats to 126 lines, measured) | about 310 |
| `test/world/founding-shape-covenant.test.ts` | new (its row table formats to 87 lines, measured) | about 220 |
| `test/world/founding-gazetteer.test.ts` | new | about 40 |
| `test/world/founding-drawable.test.ts` | new | about 45 |
| `test/world/founding-shape-pins.test.ts` | new | about 35 |
| `test/world/founding-covenant.test.ts` | edit: the list checksum | 163 |
| `test/world/founding-lexicon.test.ts` | edit: two table tests | about 110 |
| `test/world/founding-sample.json` | edit: five rows | 202 |
| `test/world/founding-sample.test.ts` | edit: one coverage test | about 100 |
| `test/world/land-mask-pins.test.ts` | edit: imports `maskChecksum` | 65 |
| `handbook/specs/engine-invariants.md` | edit: four paragraphs, one new | |
| `handbook/plans/800/856/856-plan.md` | new: this plan, archived | |

No function passes 50 lines, and none in `found.ts` passes 30.

### `src/world/founding/lexicon-shapes.ts` (new)

```ts
import { MAX_ISLANDS, type IsleSize } from "../../terrain/lobes.ts";
import type { FormId } from "../outline-ids.ts";
import type { LexiconEntry, Steer } from "./lexicon.ts";

const outline = (value: FormId): Steer => ({ subject: "outline", value });

export const SHAPE_WORDS: ReadonlyArray<LexiconEntry> = [
  { phrase: "crescent", steers: [outline("crescent")] },
  { phrase: "crescent shaped", steers: [outline("crescent")] },
  { phrase: "round island", steers: [outline("round"), { subject: "mapType", value: "island" }] },
];
export const NUMBER_WORDS: ReadonlyMap<string, number>; // one 1 ... nineteen 19, twenty 20, thirty 30, forty 40, fifty 50, sixty 60, seventy 70, eighty 80, ninety 90: 27 entries
export const SCALE_WORDS: ReadonlyMap<string, number>; // dozen 12, hundred 100, thousand 1000
export const BAND_WORDS: ReadonlyMap<string, number>; // few 5, countless MAX_ISLANDS
export const ISLAND_WORDS: ReadonlyArray<string>; // "islands", "isles", "islets", "atolls", "cays", "skerries", "coral islands", "coral isles", "spice islands"
export const BETWEEN_WORDS: ReadonlyMap<string, IsleSize | null>; // equal, equal sized, evenly sized, same sized: "equal"; varied, different sized, unequal: "varied"; small, little, tiny, round: null
export const SHAPE_TRIGGERS: ReadonlyArray<string>; // "in the shape of", "the shape of", "shaped like"
export const SHAPE_ARTICLES: ReadonlySet<string>; // "a", "an", "the"
export const SHAPE_FORMS: ReadonlyMap<string, FormId>; // crescent: "crescent", ring: "ring", circle: "round"
export const PLACE_KINDS: ReadonlyArray<string>; // "country", "unit", "state", "lake"
export const PLACE_PREFERENCES: ReadonlyArray<readonly [key: string, id: string]>; // ["florida", "ne-1159315207"], ["georgia", "ne-1159311857"], ["maryland", "ne-1159315329"], ["montana", "ne-1159315333"], ["manchester", "ne-1159317507"]
```

Each `ReadonlyMap` is a `new Map<...>([...])` of exactly the pairs in its comment, in that order; each array exactly the listed strings, in that order. `lexicon-shapes.ts` imports only types from `lexicon.ts`, so `lexicon.ts` may import its values without a cycle at run time. The five preferred IDs are, in the committed index: Florida and Georgia, Maryland and Montana in the United States of America, and Manchester in the United Kingdom.

### `src/world/founding/listed.ts` (new)

```ts
import { LEXICON, type LexiconEntry } from "./lexicon.ts";
export function entryNamed(phrase: string): LexiconEntry | undefined;
export function longestEntryAt(words: ReadonlyArray<string>, at: number): LexiconEntry | undefined;
```

`BY_PHRASE` and `LONGEST` move here from `found.ts` unchanged; `longestEntryAt` moves unchanged; `entryNamed` is `BY_PHRASE.get(phrase)`. `found.ts` loses `BY_PHRASE`, `LONGEST`, `longestEntryAt` and `ownSteers`.

### `src/world/founding/counts.ts` (new)

```ts
import { MAX_ISLANDS, MIN_ISLANDS } from "../../terrain/lobes.ts";
import type { Steer } from "./lexicon.ts";
import { BAND_WORDS, BETWEEN_WORDS, ISLAND_WORDS, NUMBER_WORDS, SCALE_WORDS } from "./lexicon-shapes.ts";
import { entryNamed, longestEntryAt } from "./listed.ts";

export type Hit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };
export function countAt(words: ReadonlyArray<string>, at: number): Hit | null;
```

The behaviour is "The number rule" above, to the letter. Internal helpers are the builder's to name; the reference shapes, which the instrument (Measurements) runs and which the predicted values come from:

```ts
const DIGITS = /^[0-9]+$/;
const GROUP = /^[0-9]{3}$/;
const withDigits = (value: number, word: string): number => {
  let next = value;
  for (let i = 0; i < word.length; i++) next = Math.min(next * 10 + (word.charCodeAt(i) - 48), MAX_ISLANDS);
  return next;
};
// numberAt: digits (with GROUP words joined when the first run has at most 3 digits), else BAND_WORDS.get(first), else
// the number-word loop: added = NUMBER_WORDS.get(word) -> value = Math.min(value + added, MAX_ISLANDS);
// scale = SCALE_WORDS.get(word) -> value = Math.min(Math.max(value, 1) * scale, MAX_ISLANDS);
// "and" with taken > 0 and a NUMBER_WORDS or SCALE_WORDS word right after -> taken past it; anything else ends the run.
// betweenAt: size = the longest BETWEEN_WORDS key at the position (keys are one or two words); entry = longestEntryAt;
// if size and its word count >= the entry's -> { taken, steers: value === null ? [] : [{ subject: "isleSize", value }] };
// else if entry has exactly one steer and it is a coast -> { taken, steers: entry.steers }; else null.
// countAt: number below MIN_ISLANDS -> null; steers = [{ subject: "islands", value }]; then loop: island word (the
// longest of ISLAND_WORDS at the position) -> push entryNamed(island).steers, end; else betweenAt or null; finally keep
// the first steer of each equal subject and value.
```

### `src/world/founding/shapes.ts` (new)

```ts
import { placeId, type OutlineId } from "../outline-ids.ts";
import type { Steer } from "./lexicon.ts";
import { PLACE_KINDS, PLACE_PREFERENCES, SHAPE_ARTICLES, SHAPE_FORMS, SHAPE_TRIGGERS } from "./lexicon-shapes.ts";
import { foundingWords } from "./normalize.ts";

export type GazetteerRow = readonly [id: string, name: string, kind: string, country: string];
export type ShapeHit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };
export const placeKey: (words: ReadonlyArray<string>) => string; // words.join(" ").normalize("NFD").replace(/\p{M}/gu, "")
export function setFoundingGazetteer(rows: ReadonlyArray<GazetteerRow> | null): void;
export function shapeAt(words: ReadonlyArray<string>, at: number): ShapeHit | "unloaded" | null;
```

Module state: `places: ReadonlyMap<string, OutlineId> | null` (null until installed, and again after `setFoundingGazetteer(null)`) and `longestName: number`, the most words of any key. `setFoundingGazetteer` builds `places` as "The shape phrase" says: a `Map` of key to `{ id, rank }`, rank `PLACE_KINDS.indexOf(kind)` (an unknown kind ranks `PLACE_KINDS.length`), a row replacing the held one only when its rank is lower; then each preference whose key is present replaces it; then every chosen ID through `placeId`. `shapeAt`: the trigger whose words all match at `at`, else null; no word after it, null; `starts` is the word after it and, when that word is in `SHAPE_ARTICLES`, the word after that too; the form check at each start; then `"unloaded"` when `places` is null; then for each start, spans from `Math.min(longestName, words.length - start)` down to 1, the first key in `places`; else null. `taken` runs from `at` to the end of the name.

### `src/world/founding/found.ts` (edit)

- Imports: `countAt` from `./counts.ts`, `longestEntryAt` from `./listed.ts`, `shapeAt` from `./shapes.ts`, `BAND_WORDS` from `./lexicon-shapes.ts`, `SHORE_RAGGEDNESS` from `./lexicon.ts`; `LEXICON` and `type LexiconEntry` leave the import.
- `export type FoundingOverrides = Partial<Pick<WorldRecipe, "mapType" | "band" | "landFraction" | "coastWarp" | "culture" | "outline" | "islands" | "isleSize" | "raggedness">>;` `Recognised` and `Founding` are unchanged.
- `type Segment = { readonly words: ReadonlyArray<string>; readonly phrase?: string; readonly own?: ReadonlyArray<Steer> };`
- `type Kept = { readonly phrase: string; readonly own: ReadonlyArray<Steer>; readonly steers: ReadonlyArray<Steer> };`
- `function scan(words: ReadonlyArray<string>): Segment[] | "unloaded"` as "The scan" says; step 4 is: `const entry = longestEntryAt(words, at); const band = entry === undefined ? BAND_WORDS.get(words[at] ?? "") : undefined;` and, when `band !== undefined`, the segment `{ words: [word], phrase: word, own: [{ subject: "islands", value: band }] }` and one step on.
- `function contestedSubjects(segments: ReadonlyArray<Segment>): Set<Steer["subject"]>` reads `own`, its value sets typed `Set<Steer["value"]>`.
- `function refuse(lists: ReadonlyArray<ReadonlyArray<Steer>>): ReadonlyArray<ReadonlyArray<Steer>>`:

```ts
const COUNT_PARTS: ReadonlySet<Steer["subject"]> = new Set(["islands", "isleSize"]);

function refuse(lists: ReadonlyArray<ReadonlyArray<Steer>>): ReadonlyArray<ReadonlyArray<Steer>> {
  const all = lists.flat();
  const shaped = all.some((s) => s.subject === "outline");
  const counted =
    !shaped && all.some((s) => s.subject === "islands") && all.some((s) => s.subject === "mapType" && s.value === "archipelago");
  const dropped = (s: Steer): boolean =>
    (!counted && COUNT_PARTS.has(s.subject)) ||
    ((counted || shaped) && s.subject === "land") ||
    (shaped && s.subject === "coast");
  return lists.map((list) => list.filter((s) => !dropped(s)));
}
```

- `settle(segments)` returns `{ steered: Kept[]; contested: Recognised[]; loose: string[] }`: the surviving lists are `refuse(segments.map((s) => (s.own ?? []).filter((steer) => !cancelled.has(steer.subject))))`; a segment with a phrase and a non-empty surviving list is `{ phrase, own, steers }`; one with a phrase and none is contested `{ phrase, steers: own }` and its words go loose, as today.
- `creditClimateTongue(steered: ReadonlyArray<Kept>): ReadonlyArray<Recognised>` is today's function reading `r.own` where it called `ownSteers(r)`, returning `{ phrase, steers }` objects.
- `choose` gains the cases `"outline"`, `"islands"` and `"isleSize"`.
- `overridesFor` destructures `outline`, `islands` and `isleSize` too and returns, in this order: `mapType`, `band`, `landFraction` (unchanged), `coastWarp` only when `coast !== undefined && islands === undefined`, `culture` (unchanged), `outline` when set, `islands` when set, `isleSize` only when `"varied"`, `raggedness` when `islands !== undefined && coast !== undefined && SHORE_RAGGEDNESS[coast] !== 0`, at that value.
- `foundWorld`: after `displayForm`, `const segments = scan(foundingWords(display.sentence)); if (segments === "unloaded") return { ok: false, reason: "places-not-loaded" };` then as today.

### `src/world/founding/lexicon.ts` (edit)

- Imports gain `import type { OutlineId } from "../outline-ids.ts";`, `import { MAX_ISLANDS, MIN_ISLANDS, type IsleSize } from "../../terrain/lobes.ts";` and `import { BAND_WORDS, BETWEEN_WORDS, ISLAND_WORDS, PLACE_PREFERENCES, SHAPE_FORMS, SHAPE_TRIGGERS, SHAPE_WORDS } from "./lexicon-shapes.ts";`.
- `Steer` gains three members: `{ readonly subject: "outline"; readonly value: OutlineId }`, `{ readonly subject: "islands"; readonly value: number }`, `{ readonly subject: "isleSize"; readonly value: IsleSize }`.
- After `COAST_WARP`: `export const SHORE_RAGGEDNESS: Readonly<Record<keyof typeof COAST_WARP, number>> = { ragged: COAST_WARP.ragged, smooth: 0 };`
- `LEXICON` ends `...PEOPLE_WORDS, ...SHAPE_WORDS,`.
- `FOUNDING_RULES` gains four entries after the sixth, with `const quoted = (words: Iterable<string>): string => [...words].map((w) => `"${w}"`).join(", ");` above it:
  1. `` `A number right before a word for islands (${quoted(ISLAND_WORDS)}) sets about how many islands an archipelago has, written in figures or in words up to "thousand"; ${quoted(BAND_WORDS.keys())} set it there or anywhere else in a sentence that makes an archipelago. A number above ${MAX_ISLANDS} reads as ${MAX_ISLANDS}, and one below ${MIN_ISLANDS} sets nothing.` ``
  2. `` `Between that number and the word for islands may stand only words for the islands' size and shape (${quoted(BETWEEN_WORDS.keys())}) and words for the coast.` ``
  3. `` `${quoted(SHAPE_TRIGGERS)}, followed by the name of a real place on the map or by ${quoted(SHAPE_FORMS.keys())}, draws the land exactly in that shape; a place's name on its own draws no shape. Where places share a name, a country comes before its parts and they before a lake, then the first on the map's own list, and ${quoted(PLACE_PREFERENCES.map(([key]) => key))} are settled by hand.` ``
  4. `"A count needs the archipelago: beside a word for another kind of land, or beside a shape, it sets nothing. Beside a count or a shape, words for more or less land set nothing; beside a shape, words for the coast set nothing, and beside a count they set how ragged each island's shore is."`

### `src/world/founding/normalize.ts` (edit)

`RefusalReason` gains `"places-not-loaded"`, last.

### `test-support/founding-gazetteer.ts` (new)

```ts
import { readFileSync } from "node:fs";
import { setFoundingGazetteer, type GazetteerRow } from "../src/world/founding/shapes.ts";

export const PLACE_NAMES = new URL("../src/world/outline-place-names.json", import.meta.url);
export function committedGazetteer(): ReadonlyArray<GazetteerRow>; // parsed once, memoised in a module-level variable
export function useCommittedGazetteer(): void; // setFoundingGazetteer(committedGazetteer())
```

The index is JSON, read as data: no `SOURCE_READS` entry (`isSource` in `test-support/source-read-guard.ts` reads only `.ts`, `.astro` and `.css`).

### `test-support/mask-checksum.ts` (new)

`export function maskChecksum(mask: Uint8Array): number`, the body of `checksum` in `test/world/land-mask-pins.test.ts`, moved unchanged; that file imports it and loses its own `checksum`, its pins and messages untouched.

## Tests, in the order they are written

Every value below was read through the instrument (Measurements), which reproduces today's `foundWorld` on 3,271 inputs and the list checksum 2379797468 before any rule is on, and then ran the ruled set. A built value that differs from the one printed here is a hand-back (Stop conditions), never a re-pin.

**T1. `test/world/founding-count-covenant.test.ts`** (new). Top: imports of `test`, `assert`, `hashString`, `foundWorld`, `type FoundingOverrides`, `FOUNDING_VERSION`, `LEXICON` and the five count tables; the same `LOCK` string as `test/world/founding-covenant.test.ts`, restated; `type Row = readonly [sentence: string, seed: number, residual: string, overrides: FoundingOverrides, steered: ReadonlyArray<string>, contested: ReadonlyArray<string>]`.

- T1a, one test per row, "the covenant: "<sentence>" founds the count and sizes version 1 founds". It asserts, in this order: `f.ok`; `assert.deepEqual(f.overrides, overrides, LOCK)`; `assert.deepEqual(f.steered.map((r) => r.phrase), steered, LOCK)`; `assert.deepEqual(f.contested.map((r) => r.phrase), contested, LOCK)`; `assert.equal(f.residual, residual)`; `assert.equal(hashString(residual), seed, "the pinned seed is the hand-derived residual's own hash")`; `assert.equal(f.seed, seed, LOCK)`; `assert.equal(f.version, FOUNDING_VERSION)`. The rows, `COUNT_SHEET`, verbatim:

```
["exactly 100 equal sized round islands", 1524000883, "exactly", {"mapType":"archipelago","islands":100}, ["100 equal sized round islands"], []],
["1,000 islands", 2166136261, "", {"mapType":"archipelago","islands":100}, ["1 000 islands"], []],
["100 islands on a vast continent", 900114535, "100 islands on continent", {"landFraction":0.336}, ["vast"], ["100 islands","continent"]],
["five continents", 2931049365, "five", {"mapType":"continent"}, ["continents"], []],
["three isles", 2166136261, "", {"mapType":"archipelago","islands":3}, ["three isles"], []],
["a thousand small isles", 2166136261, "", {"mapType":"archipelago","islands":100}, ["thousand small isles"], []],
["a vast archipelago of 100 islands", 833488191, "vast", {"mapType":"archipelago","islands":100}, ["archipelago","100 islands"], ["vast"]],
["twenty five atolls", 2166136261, "", {"mapType":"archipelago","band":"tropical","culture":"oromi","islands":25}, ["twenty five atolls"], []],
["a few islands", 2166136261, "", {"mapType":"archipelago","islands":5}, ["few islands"], []],
["countless islands", 2166136261, "", {"mapType":"archipelago","islands":100}, ["countless islands"], []],
["a dozen islets", 2166136261, "", {"mapType":"archipelago","islands":12}, ["dozen islets"], []],
["scattered isles", 1666792920, "scattered", {"mapType":"archipelago"}, ["isles"], []],
["one island", 3123124719, "one", {"mapType":"island"}, ["island"], []],
["000 islands", 3855301319, "000", {"mapType":"archipelago"}, ["islands"], []],
["007 skerries", 2166136261, "", {"mapType":"archipelago","culture":"norden","islands":7}, ["007 skerries"], []],
["12,345 islands", 2166136261, "", {"mapType":"archipelago","islands":100}, ["12 345 islands"], []],
["100 varied islands", 2166136261, "", {"mapType":"archipelago","islands":100,"isleSize":"varied"}, ["100 varied islands"], []],
["a hundred jagged isles", 2166136261, "", {"mapType":"archipelago","islands":100,"raggedness":0.95}, ["hundred jagged isles"], []],
["a hundred smooth isles", 2166136261, "", {"mapType":"archipelago","islands":100}, ["hundred smooth isles"], []],
["seven islands and a free city", 168068561, "seven islands free city", {}, [], ["seven islands","free city"]],
["a hundred and fifty coral islands", 2166136261, "", {"mapType":"archipelago","band":"tropical","culture":"oromi","islands":100}, ["hundred and fifty coral islands"], []],
["two hundred islands", 2166136261, "", {"mapType":"archipelago","islands":100}, ["two hundred islands"], []],
["100 tropical islands", 1731450012, "100", {"mapType":"archipelago","band":"tropical","culture":"oromi"}, ["tropical","islands"], []],
["a vast land of 100 islands", 4276328868, "vast land", {"mapType":"archipelago","islands":100}, ["100 islands"], ["vast"]],
["a few warm atolls", 2166136261, "", {"mapType":"archipelago","band":"tropical","culture":"oromi","islands":5}, ["few","warm","atolls"], []],
["constructor islands", 4066221903, "constructor", {"mapType":"archipelago"}, ["islands"], []],
["the islands few", 2166136261, "", {"mapType":"archipelago","islands":5}, ["islands","few"], []],
["a few rival kingdoms among the isles", 201153723, "rival kingdoms among", {"mapType":"archipelago","islands":5}, ["few","isles"], []],
["a few kingdoms", 1176359413, "few kingdoms", {}, [], ["few"]],
["100 islands and a few atolls", 2166136261, "", {"mapType":"archipelago","band":"tropical","culture":"oromi"}, ["100 islands","few atolls"], []],
["isles countless", 2166136261, "", {"mapType":"archipelago","islands":100}, ["isles","countless"], []],
```

- T1b "a count phrase steers its count, its sizes, its coast and its island word's own meanings, and a band word alone steers its count": `assert.deepEqual(foundWorld(s).steered, expected)` for "twenty five atolls" `[{"phrase":"twenty five atolls","steers":[{"subject":"islands","value":25},{"subject":"mapType","value":"archipelago"},{"subject":"band","value":"tropical"},{"subject":"culture","value":"oromi"}]}]`, "100 varied islands" `[{"phrase":"100 varied islands","steers":[{"subject":"islands","value":100},{"subject":"isleSize","value":"varied"},{"subject":"mapType","value":"archipelago"}]}]`, "exactly 100 equal sized round islands" `[{"phrase":"100 equal sized round islands","steers":[{"subject":"islands","value":100},{"subject":"isleSize","value":"equal"},{"subject":"mapType","value":"archipelago"}]}]`, "a hundred jagged isles" `[{"phrase":"hundred jagged isles","steers":[{"subject":"islands","value":100},{"subject":"coast","value":"ragged"},{"subject":"mapType","value":"archipelago"}]}]` and "the islands few" `[{"phrase":"islands","steers":[{"subject":"mapType","value":"archipelago"}]},{"phrase":"few","steers":[{"subject":"islands","value":5}]}]`.
- T1c "every number form before an island word founds its count, and one below two founds none": for `n` from 0 to 150, `foundWorld(`${n} islands`).overrides.islands` is `undefined` when `n < 2`, else `Math.min(n, 100)`; for each of the words "two" to "nineteen" and the tens "twenty" to "ninety" (restated in the test as `[word, value]` pairs, 26 of them), `${word} islands` founds that value; for each tens word and each of "one" to "nine", `${tens} ${unit} islands` founds their sum; "one islands" founds no count; "a dozen islands" 12, "two dozen islands" 24, "a hundred islands" 100, "one hundred islands" 100, "a hundred and fifty islands" 100, "a thousand islands" 100, "a few islands" 5, "countless islands" 100, "hundreds of islands" none. The expected count is in the message.
- T1d "every word that may stand between a number and an island word founds what it says, and the table holds no other": `const BETWEEN = [["equal","equal"],["equal sized","equal"],["evenly sized","equal"],["same sized","equal"],["varied","varied"],["different sized","varied"],["unequal","varied"],["small",null],["little",null],["tiny",null],["round",null]]` restated; `assert.deepEqual([...BETWEEN_WORDS.keys()], BETWEEN.map(([w]) => w))`; each `100 ${w} islands` founds `{ mapType: "archipelago", islands: 100, ...(size === "varied" ? { isleSize: "varied" } : {}) }` with steered phrases `[`100 ${w} islands`]`, the word in the message.
- T1e "every island word ends a count and brings its own meanings, and the table holds no other": the nine words restated; `assert.deepEqual(ISLAND_WORDS, NINE)`; each `100 ${w}` has `steered` `[{ phrase: `100 ${w}`, steers: [{ subject: "islands", value: 100 }, ...entry.steers] }]`, where `entry` is the `LEXICON` row of that phrase, and `overrides.islands` 100.
- T1f "the number and band tables hold exactly the words the rule reads": `NUMBER_WORDS`, `SCALE_WORDS` and `BAND_WORDS` each deep-equal, as `[...map]`, to the pairs restated in the test (`BAND_WORDS` is `[["few", 5], ["countless", 100]]`).

Stub (commit 1): `countAt` returns `null`, `scan` has no step 4; the tables exist with their real contents. Red on `assert.deepEqual(f.overrides, ...)` in every T1a row that gains a count, and on `f.contested` in the rows whose count is dropped ("100 islands on a vast continent", "seven islands and a free city": today they contest "islands", the row contests the whole phrase; "a few kingdoms": today nothing is contested); the rows that found as today ("five continents", "scattered isles", "one island", "000 islands", "100 tropical islands", "constructor islands") are green from the first commit and guard that the rules leave them alone. T1b to T1e red on the count; T1f green from commit 1 (it pins the tables, not the rule). Mutations once green: `countAt` returning `null` (T1a, T1c, T1d, T1e red); `BAND_WORDS` without "few" ("a few islands" and "the islands few" red); step 4 of the scan removed ("the islands few", "a few rival kingdoms among the isles", "isles countless" red); the `GROUP` join removed ("1,000 islands" red); the clamp removed ("12,345 islands" founds 12345, red on overrides); "unequal" removed from `BETWEEN_WORDS` (T1d red by name); `NUMBER_WORDS` built as a plain object read by key (`"constructor islands"` red: "constructor" reads the object's own constructor).

**T2. `test/world/founding-shape-covenant.test.ts`** (new). Top: as T1, plus `useCommittedGazetteer()` from `test-support/founding-gazetteer.ts` at module scope.

- T2a, one test per row, "the covenant: "<sentence>" founds the shape version 1 founds", the same assertions in the same order as T1a. `SHAPE_SHEET`, verbatim:

```
["100 islands shaped like Texas", 2166136261, "", {"mapType":"archipelago","outline":"ne-1159315211"}, ["100 islands","shaped like texas"], []],
["an island shaped like texas", 2166136261, "", {"mapType":"island","outline":"ne-1159315211"}, ["island","shaped like texas"], []],
["tropical island in the shape of Texas", 2166136261, "", {"mapType":"island","band":"tropical","culture":"oromi","outline":"ne-1159315211"}, ["tropical","island","in the shape of texas"], []],
["a land the shape of japan", 1844065948, "land", {"outline":"ne-1159320937"}, ["the shape of japan"], []],
["shaped like the united kingdom", 2166136261, "", {"outline":"ne-1159320713"}, ["shaped like the united kingdom"], []],
["in the shape of a crescent", 2166136261, "", {"outline":"crescent"}, ["in the shape of a crescent"], []],
["shaped like a ring", 2166136261, "", {"outline":"ring"}, ["shaped like a ring"], []],
["shaped like a circle", 2166136261, "", {"outline":"round"}, ["shaped like a circle"], []],
["shaped like Florida", 2166136261, "", {"outline":"ne-1159315207"}, ["shaped like florida"], []],
["shaped like Georgia", 2166136261, "", {"outline":"ne-1159311857"}, ["shaped like georgia"], []],
["shaped like Curacao", 2166136261, "", {"outline":"ne-1159321099"}, ["shaped like curacao"], []],
["a vast island shaped like texas", 833488191, "vast", {"mapType":"island","outline":"ne-1159315211"}, ["island","shaped like texas"], ["vast"]],
["a ragged island shaped like texas", 3707108931, "ragged", {"mapType":"island","outline":"ne-1159315211"}, ["island","shaped like texas"], ["ragged"]],
["shaped like atlantis", 686541379, "shaped like atlantis", {}, [], []],
["a texas island", 1052843674, "texas", {"mapType":"island"}, ["island"], []],
["shaped like A Coruna", 2166136261, "", {"outline":"ne-1159310639"}, ["shaped like a coruna"], []],
["shaped like constructor", 3544313065, "shaped like constructor", {}, [], []],
["a crescent of warm islands", 2166136261, "", {"mapType":"archipelago","band":"tropical","culture":"oromi","outline":"crescent"}, ["crescent","warm","islands"], []],
["a round island", 2166136261, "", {"mapType":"island","outline":"round"}, ["round island"], []],
["a crescent shaped island", 2166136261, "", {"mapType":"island","outline":"crescent"}, ["crescent shaped","island"], []],
```

- T2b "a shape phrase steers its outline and nothing else": `foundWorld("100 islands shaped like Texas").steered` deep-equals `[{"phrase":"100 islands","steers":[{"subject":"mapType","value":"archipelago"}]},{"phrase":"shaped like texas","steers":[{"subject":"outline","value":"ne-1159315211"}]}]`, and `foundWorld("in the shape of a crescent").steered` deep-equals `[{"phrase":"in the shape of a crescent","steers":[{"subject":"outline","value":"crescent"}]}]`.
- T2c "every trigger before every form, with and without an article, draws that form, and the tables hold no other": triggers and forms restated; `assert.deepEqual(SHAPE_TRIGGERS, THREE)`, `assert.deepEqual([...SHAPE_FORMS], FORM_PAIRS)`; for each trigger `t`, form name `n` and prefix `""` or `"a "`, `${t} ${prefix}${n}` founds `{ outline: FORM_PAIRS's value }`.
- T2d "every place name, after a shape phrase, founds what version 1 founds": `assert.equal(hashString(JSON.stringify(committedGazetteer().map(([, name]) => foundWorld(`shaped like ${name}`)))), 2072831757, LOCK)`, and, beside it, every one of the 5,646 founds some `outline` (none is refused or shapeless).
- T2e "every preferred place is a place of that name that shares it with another": for each `[key, id]` of `PLACE_PREFERENCES`, the committed rows hold `id` with `placeKey(foundingWords(name)) === key`, and at least one other row has that key.

Stub (commit 1): `shapeAt` returns `null`; `setFoundingGazetteer` stores nothing; `SHAPE_WORDS` is `[]`; tables real. Red on `f.overrides` in every row with an outline (T2a), on T2b to T2d; T2e green from commit 1. Mutations: `shapeAt` returning `null` (T2a to T2d red); "the shape of" removed from `SHAPE_TRIGGERS` ("a land the shape of japan" red); the article skip removed ("shaped like a ring" red); accent folding removed ("shaped like Curacao" red); the Georgia pair removed from `PLACE_PREFERENCES` ("shaped like Georgia" founds the country, red; T2d red); the place's own listed steers added to the hit ("a land the shape of japan" gains the Japanese names, red); `SHAPE_WORDS` emptied ("a crescent of warm islands" red).

**T3. `test/world/founding-gazetteer.test.ts`** (new). "a sentence asking for a real place's outline is refused until the gazetteer is installed, and a form, a count or a plain sentence needs none": `setFoundingGazetteer(null)`; `foundWorld("shaped like texas")` deep-equals `{ ok: false, reason: "places-not-loaded" }`; `foundWorld("shaped like a crescent").ok` with `outline` "crescent"; `foundWorld("exactly 100 equal sized round islands").ok`; `foundWorld("a cold land of quiet towns").ok`; `useCommittedGazetteer()`; `foundWorld("shaped like texas").ok` with `outline` "ne-1159315211"; `setFoundingGazetteer(null)` again and the refusal returns; last, `useCommittedGazetteer()` once more and `foundWorld("shaped like texas").ok` again, so the file leaves the list installed. (`npm test` runs each test file in its own process, `package.json`'s `test` script naming no isolation flag, so no file sees another's install; ending installed keeps it so if that changes.) Stub: `shapeAt` returns `null`, so the first assertion is red (it founds). Mutation: `shapeAt` returning `null` in place of `"unloaded"`.

**T4. `test/world/founding-lexicon.test.ts`** (edit), two new tests:
- "every word of the count and shape tables is already in the form the cleanup gives, and none is a listed phrase": each key of `NUMBER_WORDS`, `SCALE_WORDS`, `BAND_WORDS`, `BETWEEN_WORDS` and `SHAPE_FORMS`, each of `SHAPE_TRIGGERS`, `SHAPE_ARTICLES` and `ISLAND_WORDS`: `foundingWords(w).join(" ") === w`; and none of the number, scale, band and between keys is a `LEXICON` phrase (the form names are read inside a shape phrase before the list, so "crescent" may be both). Green from commit 1. Mutation: "Equal" in `BETWEEN_WORDS`.
- "every island word is a listed phrase that steers the archipelago": each of `ISLAND_WORDS` has a `LEXICON` row whose steers include `{ subject: "mapType", value: "archipelago" }`. Green from commit 1. Mutation: "island" added to `ISLAND_WORDS`.

**T5. `test/world/founding-drawable.test.ts`** (new), written after commit 3 and before `refuse` (commit 4). "no founding asks the terrain for what it refuses: every listed phrase beside a count, a band word and a shaped count, either side": `useCommittedPlaces()`; for each `LEXICON` phrase `p` and each form of `["100 varied islands", "100 islands shaped like a crescent", "few"]`, both `${form} ${p}` and `${p} ${form}`: `f = foundWorld(...)`, `recipe = defaultRecipe(f.seed, { ...f.overrides, gridW: 17, gridH: 13 })`, and `assert.doesNotThrow(() => { buildHeightfield({ seed: f.seed, gridW: 17, gridH: 13, mapType: recipe.mapType, ...terrainInputsOf(recipe) }); landShareOf(recipe); }, sentence)`. 2,868 foundings (478 listed phrases, three forms, two sides); the instrument's run of the same sweep took 2.7 s. Red at commit 3 (no `refuse`): "100 varied islands continent" asks a count of a continent. Mutations: the archipelago arm of `counted` removed; the `!shaped` arm removed; `COUNT_PARTS` without "isleSize".

**T6. `test/world/founding-shape-pins.test.ts`** (new), commit 6. "a founded outlined world and a founded counted world keep their land, cell for cell (Issue #856, D13)": `useCommittedPlaces()`, `useCommittedGazetteer()`; `PINS = [["tropical island in the shape of Texas", 139361013], ["exactly 100 equal sized round islands", 3918878483]]`; for each, `f = foundWorld(s)`, `recipe = defaultRecipe(f.seed, f.overrides)`, `elev = buildHeightfield({ seed: f.seed, gridW: recipe.gridW, gridH: recipe.gridH, mapType: recipe.mapType, ...terrainInputsOf(recipe) })`, `assert.equal(maskChecksum(landMask(elev, pickSeaLevel(elev, landShareOf(recipe)))), pin, `${s}: the land of a founded world moved, and the mechanism was frozen at Issue #855`)`. One comment line above `PINS`: `// Measured 2026-10-31 (Issue #856) after Issue #855 froze the mechanism; a mask flips only where a cell ties the sea level within float drift, the exposure the golden already accepts.` The two readings and the mutation reading (Measurements): Texas 139361013 and 651414096 with Texas's last point dropped. Mutations for the prover: the last point of `"ne-1159315211"` in `src/terrain/outline-places.json` dropped (Texas pin red, measured); `LOBE_COVERAGE` in `src/terrain/lobes.ts` from 0.3 to 0.31 (counted pin red).

**T7. `test/world/founding-sample.test.ts`** (edit), commit 5. New test "the kept sample reaches a shape and an island count": `SAMPLE.some((r) => r.overrides.outline !== undefined)` and `SAMPLE.some((r) => r.overrides.islands !== undefined)`, each with its message. The existing coverage test is unchanged and stays green: measured over the re-pinned sample, every map type, climate, both coast warps, both land directions and all ten traditions are still reached, with outline "crescent" and counts 100 and 5 (Measurements). Mutation: "crescent" removed from `SHAPE_WORDS` (the outline clause red, with the two crescent rows).

**T8. Re-pins**: `test/world/founding-covenant.test.ts`'s list checksum from 2379797468 to 1363090399 in commit 3 (the three shape words join `LEXICON`); in commit 5, in `test/world/founding-sample.json`, the five rows below replace the rows of the same sentence, one line each, nothing else moved:

```
{"sentence":"Mostly ocean please, with a few warm atolls where navigators sing the names of stars.","seed":972393975,"residual":"mostly ocean please navigators sing names stars","overrides":{"mapType":"archipelago","band":"tropical","culture":"oromi","islands":5},"steered":["few","warm","atolls"]},
{"sentence":"The Aegean: a thousand small isles, olive groves, a warm wine-dark sea, and gods with Greek names.","seed":591310577,"residual":"groves sea gods names","overrides":{"mapType":"archipelago","band":"tropical","culture":"thalassic","islands":100},"steered":["aegean","thousand small isles","olive","warm","wine dark","greek"]},
{"sentence":"Amid the warm southern seas there lieth a crescent of green islands, home to a gentle and seafaring folk.","seed":2270264016,"residual":"amid southern seas there lieth green home to gentle seafaring folk","overrides":{"mapType":"archipelago","band":"tropical","culture":"oromi","outline":"crescent"},"steered":["warm","crescent","islands"]},
{"sentence":"Picture a crescent of land around a bright lagoon, the climate always spring, the people small and fond of kites.","seed":2866275865,"residual":"picture land around bright climate always spring people small fond kites","overrides":{"culture":"oromi","outline":"crescent"},"steered":["crescent","lagoon"]},
{"sentence":"Lo, the sea is wide and the islands few.","seed":795690916,"residual":"lo sea is wide","overrides":{"mapType":"archipelago","islands":5},"steered":["islands","few"]},
```

Grouped for the PR body: count, the Aegean row; band words alone, "a few warm atolls" (which also loses "mostly ocean" to D8) and "the islands few"; shape, the two crescent rows. No other kept row, `SHEET` row or test literal in `test/world/founding*.test.ts` or `test/render/cartouche-engraving.test.ts` moves (465 literals read, Measurements). Three more kept rows ("Mostly land, a few inland seas ...", "Mostly ocean, just a few cold rocks ...", "What if the sea swallowed almost everything and only a few jagged rocks stuck out?") gain "few" in `contested` and nothing the sample test pins.

**What the prover owes** (step 11, `vellum-guard-prover`): T1a to T1e, T2a to T2d, T3, T5, T6 and T7, with the mutations named at each. T1f, T2e and T4 pin tables and data and are proved by the implementing session with the mutation named at each (step 15's terms).

## Order of commits

Push at the first.

1. `#856 The founding plan, and the count and shape covenant rows red on their shape`: `handbook/plans/800/856/856-plan.md` (this file, unchanged); `lexicon-shapes.ts` with every table real and `SHAPE_WORDS` `[]`; `counts.ts` with `countAt` returning `null`; `shapes.ts` with `shapeAt` returning `null` and `setFoundingGazetteer` a no-op; `listed.ts`; the `Steer` members, `SHORE_RAGGEDNESS` and `"places-not-loaded"`; `test-support/founding-gazetteer.ts`; T1, T2, T3, T4. Red: T1 (count rows), T2 (shape rows), T3. Every existing test green, the list checksum 2379797468 included.
2. `#856 Each segment carries its own steers`: `found.ts` refactored as "Files" says, with `scan` calling the two stubs (steps 1 to 3 and 5; no step 4 yet), `settle`, `Kept`, the credit reading `own`, `listed.ts` in use; no `refuse`, no new override yet. Every existing test green and unchanged, the list checksum 2379797468 included; T1 to T3 still red as before.
3. `#856 The number rule and the shape phrase`: `countAt`, `shapeAt`, `setFoundingGazetteer`, `choose` and `overridesFor` as specified, `SHAPE_WORDS` filled; no `refuse`, no step 4; the list checksum in `test/world/founding-covenant.test.ts` re-pinned to 1363090399 here, since neither `refuse` nor step 4 changes a list phrase's founding (measured: 1363090399 with and without them, `commit3.log`). T1c to T1f, T2c to T2e, T3 and T4 green. Expected red at the end of this commit, and nothing else (measured, `commit3.log`): the twelve rows that need `refuse` or step 4 ("100 islands on a vast continent", "a vast archipelago of 100 islands", "seven islands and a free city", "a vast land of 100 islands", "a few warm atolls", "the islands few", "a few rival kingdoms among the isles", "a few kingdoms", "isles countless", "100 islands shaped like Texas", "a vast island shaped like texas", "a ragged island shaped like texas"), T1b (it founds "the islands few"), T2b (it founds "100 islands shaped like Texas"), and the `test/world/founding-sample.test.ts` rows of three T8 sentences, the Aegean row and the two crescent rows (they already found their new values here; their pins move in commit 5). The two other T8 rows, "a few warm atolls" and "the islands few", stay green until commit 5 turns step 4 on.
4. `#856 No founding asks the terrain for what it refuses, red`: T5, red; the same reds as commit 3 besides.
5. `#856 A count needs its archipelago and gives way to a shape, and few and countless count anywhere`: `refuse`; step 4 of `scan`; `FOUNDING_RULES`; T7; the five T8 kept rows re-pinned. Every test green.
6. `#856 The founded shape and count pins (D13)`: `test-support/mask-checksum.ts`, `test/world/land-mask-pins.test.ts` importing it, T6.
7. `#856 The founding spec reads the number rule, the shape phrase and the gazetteer`: `handbook/specs/engine-invariants.md`.

## Rosters and doctrine

- **`handbook/specs/engine-invariants.md`, "Founding a world from a sentence":**
  - In "A published founding version never changes", "the climate traditions and the word list." becomes "the climate traditions, the word list, the number rule (`countAt` in `src/world/founding/counts.ts`), the band words read anywhere (`scan` in `src/world/founding/found.ts`), the shape phrases (`shapeAt` in `src/world/founding/shapes.ts`) and the place names they read."; "the pins in `test/world/founding-covenant.test.ts` and `test/world/founding-sample.test.ts` move with it" becomes "the pins in `test/world/founding-covenant.test.ts`, `test/world/founding-count-covenant.test.ts`, `test/world/founding-shape-covenant.test.ts` and `test/world/founding-sample.test.ts` move with it"; and the paragraph gains, at its end: "The place names come from the gazetteer the host installs, so the name index `src/world/outline-place-names.json` is part of version 1 with them: once the link is public, renaming, adding or removing a place changes what an old sentence founds, and is version 2's."
  - In "The constants and the rules in plain words live with the code", "the exports of `src/world/founding/lexicon.ts`, `FOUNDING_RULES` among them" becomes "the exports of `src/world/founding/lexicon.ts` and `src/world/founding/lexicon-shapes.ts`, `FOUNDING_RULES` among them".
  - "A refusal is a value, never a throw." gains, after "and a version this build does not have": ", and a sentence asking for a real place's outline while no gazetteer is installed (`places-not-loaded`; `setFoundingGazetteer` in `src/world/founding/shapes.ts`)"; and "A surface shows the reason; it does not catch." becomes "A surface shows the reason; it does not catch. `places-not-loaded` is the one reason a surface never shows: the host installs the name index the shape box fetches and founds the sentence again."
  - A new paragraph after it: "**A founding never asks the terrain for what it refuses.** After the clash, a count with no archipelago left steering, or beside a shape, is dropped with its sizes and the shape stays; beside a count or a shape a land word is dropped, and beside a shape a coast word, since neither draws there; beside a count a coast word sets the islands' raggedness and no coast warp (`refuse` and `overridesFor` in `src/world/founding/found.ts`). `test/world/founding-drawable.test.ts` founds every listed phrase beside a count, a band word and a shaped count and builds each through the terrain."
  - "What a surface may read from a founding" gains, before "The founded `culture` comes from": "A count or a shape is one recognised phrase in `steered`: the number with every word to its island word, or the shape words with the name; a band word standing elsewhere is a recognised word of its own. A count that gives way to a shape stays in `steered` with what it kept, and `contested` does not show the count it lost."
- **`FOUNDING_RULES`**: the four sentences in "Files". The page Issue #393 builds renders them; nothing copies a number or a word from them.
- **`FOUNDING_GLOBALS`** (`scripts/lint/import-bounds.ts`) is unchanged, and so is `APPROVED` in `test/repo/import-bounds-founding.test.ts`: the number rule reads digits with `charCodeAt` and `Math.min`, and nothing in the founding throws.
- **`SOURCE_READS`**: nothing joins (the index is JSON).
- **`test/world/founding-climate.test.ts`**: unchanged. Its filters at `NAMING_CLIMATE`, `rivalsOf` and `unclimatic` read `LEXICON` rows naming a climate or a people; none of the three new rows does, so no sweep gains a case.
- **The Issue #829 pointer (comment 6282681072)**: answered by the line above; the PR body says no built-in joined and why.
- **Rulebook, golden, re-roll set:** untouched.

## Evidence

- `node --test test/world/founding-count-covenant.test.ts test/world/founding-shape-covenant.test.ts test/world/founding-gazetteer.test.ts test/world/founding-drawable.test.ts test/world/founding-shape-pins.test.ts test/world/founding-covenant.test.ts test/world/founding-sample.test.ts test/world/founding-lexicon.test.ts test/world/founding-climate.test.ts test/world/founding.test.ts test/world/land-mask-pins.test.ts test/repo/import-bounds-founding.test.ts`, then `npm test` (then `npm run astro:generate`), `npm run check`, `npm run lint`, `npm run format:check`.
- No e2e suite: no page reads a founding before Issue #393 (`git grep -n "founding/found" -- src` prints nothing).
- `vellum-plate-reader` is not owed: nothing here is an appearance; the outlined and counted worlds' look was ruled at Issue #855.
- The PR body carries the blind readers' table (Measurements) and the moved kept rows, grouped as T8 says.

## Calls made

1. **One pull request.** Rule: the D13 pins need both rules, and version 1's covenant is re-pinned once.
2. **ASCII digits only, read by a hand loop clamped at the ceiling; leading zeros read.** Rule: the founding lint (Issue #829) keeps `Number` and `parseInt` out, and "founding agrees across platforms or refuses".
3. **A run of at most three digits joins the three-digit runs after it.** Rule: D6, "a three-digit group joins the number before it".
4. **Number words: "one" to "nineteen", the tens, a tens word then a unit word, "dozen", "hundred", "thousand", "and" between two of them.** Rule: D6, "a number word up to thousand"; "dozen" joins on the readers (three of three read 12).
5. **"few" stays about 5.** Rule: D6. The readers wrote 3, each noting "about 3 to 5".
6. **"countless" is the ceiling, 100.** Rule: D6; two of three readers read a very large count.
7. **The island words are the nine plural listed phrases naming the archipelago**; "archipelago", "island chain", "island group" and the singular "island" end no count. Rule: a count counts islands, and a number before a singular is no count.
8. **The between words are the eleven of `BETWEEN_WORDS` and the coast words.** Rule: D6, "listed size and shape words", kept by ruling 1; the readers read every size word's size three of three. "alike" and "of every size" are not in it: they follow the island word, and "of" is a small word.
9. **"small", "little" and "tiny" may stand between and set nothing.** Rule: the readers read less land in them, which D8 sets aside on a counted world. They were left off the list as steering words in Issue #391's plan; here they steer nothing and leave the chart number.
10. **A band word inside a count phrase is read by the phrase, and anywhere else as a word of its own; two counts in one sentence cancel by the clash rule.** Rule: ruling 1 ("on top of A").
11. **An equal size and round shores are spelled by leaving the field out.** Rule: Issue #854 call 9.
12. **A land word beside a count or a shape is dropped and contested.** Rule: D8, and Issue #851 ruling 3 (the land slider stands down on a shaped world).
13. **A coast word beside a shape is dropped and contested.** Rule: a founded shape rests exact (Issue #844 comment 6545165577, A1), where the coast draws nothing (Issue #854 ruling M2).
14. **The triggers are "shaped like", "in the shape of" and "the shape of"; "like X" alone never fires.** Rule: D5, and the body's "the shape of japan"; three of three readers read "the shape of Italy" as Italy's outline.
15. **One article may stand between the trigger and the name, and a name that starts with one is read whole first.**
16. **The form names are "crescent", "ring" and "circle" (round), read before any place.** No place in the roster has those names.
17. **Accents fold in the match**, as in the shape box (Issue #854 pull request 2, design 8).
18. **A shape phrase sets the outline only.** Rule: the readers; none read Japanese names from "in the shape of Japan".
19. **Only the index's own names; no aliases** ("United States" and "America" find nothing; "United States of America" does). Rule: Issue #853 ruling 1 made the map data's names the roster's; a list of aliases is ours and nobody ruled one.
20. **A missing gazetteer is a refusal value, `places-not-loaded`.** Rule: `handbook/specs/engine-invariants.md`, a refusal is a value; no `RangeError` in the founding.
21. **No word loosens a shape or roughens counted shores beyond the coast words.** Rule: Issue #844 comment 6545165577 A1 and B, and D13 (word feel is reviewed after the lock, Issue #857).
22. **Out: "horseshoe"** (no form draws it), **"ring of islands"** (holds a small word; the ring is reached by "shaped like a ring"), **"ringed"** (reads no ring in either row; the readers read "ringed by mountains" as nothing), so no covenant row moves; **"lone", "many", "twin", "hundreds of", "thousands of"** are not proposed, and are Issue #848's.
23. **Word tables are maps and sets, never plain objects.**
24. **The pins are the epic's two questions**, "tropical island in the shape of Texas" and "exactly 100 equal sized round islands", read through the heightfield as `COUNTED_PINS` is, which equals `generateWorld`'s own mask (Measurements).
25. **`checksum` moves to `test-support/mask-checksum.ts`** as `maskChecksum`, so both pin files read one copy.
26. **Two covenant files and three small test files, not one**: the rows alone would take one file past 400 lines.
27. **A count that gives way to a shape stays in `steered` with its type**, and `contested` does not show the lost count; that is today's rule for a word losing one of several meanings (Issue #391 ruling 4), recorded for Issue #393's planner.
28. **The kind order is restated in the founding** (`PLACE_KINDS`), since the founding may not import the shape box's `KIND_ORDER` from `src/site/`.
29. **Step 4 of the scan lands with `refuse` in commit 5**, not with the count phrase in commit 3: without `refuse`, a band word in a sentence with no archipelago would ask a count of whatever the seed rolls.
30. **No bold delight is taken.**

## Open decisions

None. Alex ruled all nine on 2026-10-31 (Rulings, above).

## Stop conditions

Hand back, with the command and what it printed, when:

- any value this plan prints differs from the built one: a T1a or T2a row, a T1b or T2b steer list, the list checksum 1363090399, the place-name checksum 2072831757, the pins 139361013 and 3918878483, a T8 kept row, or a kept row, `SHEET` row or founding test literal that moves and is not named here;
- at the end of commit 2 any existing test is red, or the list checksum is not 2379797468; at the end of commit 3 or 4 any test is red that commit 3's list of expected reds does not name, or one it names is green;
- any existing test is refused with `places-not-loaded` or needs the gazetteer installed;
- `vellum/founding-locale-clock-free` refuses something this plan specifies (the fix is never a new entry in `FOUNDING_GLOBALS`);
- `src/world/outline-place-names.json` on main no longer holds 5,646 rows, or a `PLACE_PREFERENCES` ID is not the row this plan names;
- `MIN_ISLANDS`, `MAX_ISLANDS`, `IsleSize`, `isleSize`, `islands`, `raggedness`, `outline` or `placeId` is not where this plan says;
- T5 takes over 10 s on the Mac, or a file passes 400 lines or a function 50;
- a step would need a file this plan does not name.

## Measurements

All in the planner's tree `out/856-dry-run/`, copied by the dispatcher to the main checkout's `out/856-dry-run/`, at 6aa9420f, run with `node <file>` from the tree's root. The ruled option set is `final.ts`'s `ruled` (the recommended set with the band words read in the slot and anywhere).

- **The instrument** `founder.ts`: `found.ts`'s procedure with both rules, the band words' two readings and the cross-subject pass behind options. `prove.ts` (log `prove.log`): with every rule off it equals today's `foundWorld` on 3,271 inputs (the 200 kept rows, the 1,428 discovery and 216 held-out sentences in the main checkout's `out/832-gaps/corpus-founded.tsv` and `out/832-check/sentences.tsv`, every string literal of three founding test files, every list phrase alone and with " stone") and re-derives the list checksum 2379797468.
- **Predicted values** `final.ts ruled` (log `final-ruled.log`; row list `final-rows.ts`): the rows, the list checksum 1363090399, the place-name checksum 2072831757, 0 place names founding no outline, 283 founding another place of their name (the shared names), five kept rows moved. `final-recommended.log` and `compare.log` hold the menu's alternatives.
- **What moves** `measure.ts ruled` (log `measure-ruled.log`): kept 5 of 200, discovery 21 of 1,428, held-out 7 of 216, the old covenant 0, every founding drawable; `literals.ts` (log `literals.log`): 465 founding test literals, none moves.
- **Coverage** `coverage.ts` (log `coverage.log`): the existing coverage test stays green under the ruled set; the sample reaches outline "crescent" and counts 100 and 5.
- **No refusal** `sweep.ts` (log `sweep.log`): 5,736 foundings per option set, every listed phrase beside six count, band and shape forms both sides, 0 refused by the terrain under every set, the ruled one included; `sweep-small.ts` (log `sweep-small.log`), T5's three forms: 2,868 foundings, 0 refused, 2.7 s.
- **No place list** `replay.ts` (log `replay.log`): `test/world/founding.test.ts`'s seeded sweep, no gazetteer, ruled set: 1,355 founded, 0 new reasons, 0 not idempotent; `unloaded.ts` (log `unloaded.log`): no kept or held-out sentence asks for the place list; two discovery sentences do ("world shaped like a duck", "... a continent shaped like a horseshoe ...").
- **Commit 3's state** `commit3.ts` (log `commit3.log`): with the count phrase and the shape phrase but no `refuse` and no step 4, the twelve rows named at commit 3 differ from their final values, three kept-sample pins are red, and the list checksum is already 1363090399.
- **The pins** `pins.ts` (log `pins.log`): Texas 139361013 and the counted world 3918878483, the heightfield path equal to `generateWorld`'s; `pin-mutation.ts` (log `pin-mutation.log`): Texas with its last point dropped reads 651414096.
- **Formatted size** `rows-file.ts` then Prettier with the repo's config: the count row table is 126 lines, the shape row table 87 (`rows-count.ts`, `rows-shape.ts`).
- **Bytes** `856-bytes-probe.ts` (log `bytes.log`): the name index 296,411 bytes, 56,507 compressed; a founding-own key-to-ID table 133,927 bytes, 44,210 compressed.
- **Shared names** `856-ties-probe.ts` (log `ties.log`): 129 keys shared by places of the same best kind.
- **The blind readers** `readers.ts` (item lists `856-reader-<n>-items.txt`), their answers `856-reader-<n>.txt`, tabulated by `gate.ts` (log `gate.log`, table `856-gate.txt`). Three fresh agents, no tools, never shown the list, read 37 candidates among 34 controls on nine settings (the five of today, then outline, count, sizes and shores), each in its own seeded order. Calibration: on the 23 controls that are today's list words, every setting the list steers was read by the majority; 14 were read exactly, 9 with a setting added (a climate beside a people word, mostly); the five controls meant to read as nothing ("ringed by mountains", "a horseshoe bay", "a ring of mountains", "a kingdom", "an ancient land") read as nothing. The candidates, majority of three:

| candidate | read | outcome |
|---|---|---|
| a crescent of land | outline crescent | joins (ruling 6) |
| a crescent shaped island | island, outline crescent | joins (ruling 6) |
| a round island | island, outline round | joins (ruling 6) |
| a few islands | archipelago, 3 islands (each: "about 3 to 5") | joins at 5, in the phrase and anywhere (call 5, ruling 1) |
| scattered islands | archipelago only; no reader read a count ("spacing, not a count") | out (ruling 2) |
| countless islands | archipelago, a very large count (2 of 3) | joins, in the phrase and anywhere (call 6, ruling 1) |
| a dozen islands | archipelago, 12 | joins (call 4) |
| equal / equal sized / evenly sized / same sized islands | islands alike | join |
| varied / different sized / unequal islands | islands of every size (varied, unequal: second meanings noted) | join |
| islands alike in size, islands of every size | alike; every size | read, not in the table (call 8) |
| small / little / tiny islands | archipelago, less land | stand between, set nothing (call 9) |
| round islands | shores round | stands between |
| jagged islands, rugged islands | shores ragged (2 of 3; the third, coast ragged) | the shores' raggedness (ruling 5) |
| smooth islands | shores round (2 of 3) | round shores (ruling 5) |
| sandy islands | hot, smooth coast (2 of 3) | its listed meaning stands |
| shaped like a crescent / in the shape of a ring / shaped like a circle | crescent / ring / round | join |
| shaped like Texas, the shape of Italy, in the shape of Japan | the place's outline; Japan adds archipelago, no names | join (call 18) |
| shaped like Florida, shaped like Georgia | the US state, three of three each | the US states (ruling 7) |
| 100 islands on a vast continent | continent, more land, 100 | the two kinds cancel (ruling 3) |
| 100 islands shaped like Texas | archipelago, Texas, 100 | the shape wins (ruling 4) |
| a few rugged isles | archipelago, 3, shores ragged (2 of 3) | 5 ragged islands (rulings 1, 5) |
| a thousand small isles | archipelago, less land, 1000 | joins (ceiling) |
