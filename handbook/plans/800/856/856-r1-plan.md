# Issue #856 plan, revision 1: a place's name counts only where English names a place

**Revision 1 of `handbook/plans/800/856/856-plan.md`.** What it changes against that plan: the shape phrase no longer reads every gazetteer name that follows it. A real place's name counts only straight after the shape words, or after "the" when the place is a country, a nation or territory within one, or a lake; a name that itself begins with "the" is held to the same kinds; and a name made only of direction words ("North", "Southern", "Far North") is never a place. Three exports join `src/world/founding/lexicon-shapes.ts`, `shapeAt`, `placeAt` and `setFoundingGazetteer` in `src/world/founding/shapes.ts` change, `FOUNDING_RULES` gains one sentence, the shape covenant gains fourteen rows and a table test, its place-name checksum moves from 2072831757 to 3158117445 with 68 places (24 names) now founding no outline, and `handbook/specs/engine-invariants.md` gains one paragraph. Nothing else the plan pinned moves: the list checksum 1363090399, the mask pins 139361013 and 3918878483, the five re-pinned kept rows and every existing covenant row stay. It answers the cold skeptic's blocking finding on PR #1156 at 55099114 ("the shape of the coast changes with the tides" founds the Kenyan province Coast), the case Issue #856 comment 6281757291 names ("a place whose name is also a common word") and no ruling settled. It also corrects one line of the plan: `choose` in `src/world/founding/found.ts` is 32 lines as built, not under 30 (the 50-line cap holds).

Everything in `856-plan.md` that this revision does not name stands, as built at 55099114 on `chore/856-founding-shape-count` (PR #1156).

- **Planned at:** `origin/main` d04ec85067e0363268d749ce3442fb77fbe40100 (PR #1157, Issue #1013's stylesheets, which touches no file this plan names; the plan it revises was planned at 6aa9420f). PR #1156's head 55099114d191ad9d5995799e075b2d00d83d005a. Issue #856 comment count 7 (6281757291, 6282681072, 6547808210 the rulings, 6547908501 and 6547909370 the plan archive, 6548058133 the build calls, 6548614731 this revision's ruling). Re-read after the ruling, 2026-10-31: main and the PR head unchanged.
- **Rulings:** https://github.com/ahl-gram/Vellum/issues/856#issuecomment-6548614731 (Alex, 2026-10-31), on this revision's one question, how the founding tells a real place's name from an everyday word. Quoted, not paraphrased: "A: read it the way English names a place (Recommended)". It confirms the design as written; nothing in it changed. The nine rulings of https://github.com/ahl-gram/Vellum/issues/856#issuecomment-6547808210 stand, folded into `856-plan.md`.
- **Open decisions: none.**
- **Recon:** `vellum-spec-recon` on the delta, 2026-10-31, at 6aa9420f and 55099114: 14 CURRENT, 0 STALE, 0 UNVERIFIABLE. It confirmed the finding's names and IDs, that the shape box's matcher (`createMatcher` in `src/site/explorer/place-match.ts`) has no stop list or minimum length for the founding to mirror, that `foundingWords` folds every capital away, that no open issue covers common-word place names, and that Issue #393 and Issue #848 are open, so version 1 may still change.

## Specs

- `handbook/specs/engine-invariants.md`, "Founding a world from a sentence": "A published founding version never changes" (the place names are part of version 1), "The constants and the rules in plain words live with the code" (the new tables), and the new paragraph below.
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" (the new paragraph is prescriptive, cites symbols, and copies no word or count from the tables) and "How code is cited".
- `handbook/specs/check-placement.md`, "The unit suite": the new checks are unit tests over the committed name index, read as data.
- `handbook/specs/development-workflow.md`, steps 8 and 15: this revision is archived beside the plan it revises, and its guards are proven by the implementing session, since PR #1156's prover and skeptic rounds are spent.

## The design

### The rule

`shapeAt` finds a trigger and, as built, checks the forms ("crescent", "ring", "circle") at the word after it and, when that word is "a", "an" or "the", at the word after that. Forms are unchanged. Then, with a gazetteer installed, a place is read:

1. **Straight after the trigger** (`placeAt` at `first`, not after "the"): the longest name there that the gazetteer holds, as built. A name that itself begins with "the" (the index holds "The Bahamas", "The Valley", "The Quarter", "The Farrington") counts only when its place's kind is in `KINDS_AFTER_THE`. A name that begins with "a" or "an" ("A Coruña", "An Giang") counts as built.
2. **Else, when the word after the trigger is "the"** (`PLACE_ARTICLE`), at the word after it: the longest name there whose place's kind is in `KINDS_AFTER_THE` ("country", "unit", "lake").
3. **Never after "a" or "an"**: no place is tried after either.
4. **Never a name made only of `DIRECTION_WORDS`**: such a name is left out of the gazetteer when it is installed, so it is never found.

A name refused by rule 1 or 2 is passed over and the next shorter name at the same word is tried ("shaped like the vatican city": "Vatican City" is a province, so the country "Vatican" is read and "city" goes to the chart number). The "unloaded" refusal comes where it did, after the forms and before any place: a sentence whose trigger is followed by "a" may still name "A Coruña", which needs the list.

### Why this rule

Measured on a scoring set frozen before any option was scored (`856-scoring-set.ts`, Measurements). Its 320 everyday-word cases: every one-word gazetteer name with a dictionary entry, after "a" (219; many are names nobody writes after "a", such as "a berlin", so this group shows what the rule does, not how often it bites), 66 everyday names after "the", 14 direction words before a land the map does not hold ("south america"), and 21 prose sentences, the skeptic's among them. Its 836 real-place requests: every country and nation as written, in lowercase, and with "the" where English uses it, every US state as written and in lowercase, names that start with a direction word ("Northern Ireland", "South Africa", "West Virginia"), and regions named bare and with "the". PR #1156 founds a real place for 317 of the 320 everyday-word cases; this rule for 2, and it loses 7 of the 836 requests, each of which still founds when written without "the". Groups added after the first scoring, and labelled so (75 everyday-word cases, among them the same names capitalised as fantasy prose writes them and a sentence in capitals, and 5 lakes after "the"): this rule 8 wrong and 0 lost, PR #1156 75 wrong.

What it still gets wrong, named: "a continent shaped like lakes and rivers" (South Sudan's Lakes), "in the shape of mountain peaks" (the Philippines' Mountain), and, among the added cases, a country's or a lake's name used as an everyday word after "the" ("in the shape of the turkey", "the china", "the jersey", "the guinea", "the panama", "the reunion", "the long lake", "the north channel"). What it loses: "the Yukon", "the Punjab", "the Northern Territory", "the Northwest Territories", "the Australian Capital Territory", "the Peloponnese", "the Midlands" (provinces written with "the"; "shaped like Yukon" founds Yukon). The 68 places that can no longer be reached by a sentence are the 65 whose names are made only of direction words (21 names; eight provinces are named "Northern" and ten "Central") and the three Anguilla districts whose names begin with "The"; the Explorer's shape box still offers every one.

### Rejected

- **Leave it as built** (option D of the ruled menu): 317 of the 320 everyday-word cases found a real place, among them "the shape of the coast changes with the tides" (Kenya's Coast), "an island shaped like a falcon" (Venezuela's Falcón) and "a continent shaped like south america" (Cameroon's South).
- **Our own list of everyday words** (option B of the ruled menu, `856-score.log` arm B, 73 names): it stops every word on it and every direction name, but a name left off it stays a place after "a": "an island shaped like a turkey" (Turkey), "a china", "a jersey", "a guinea" and "a panama" each still found the country (159 of 320 wrong, 2 of 836 lost). It makes 125 names unreachable, loses New Zealand's "West Coast", and is ours to keep.
- **A capital letter** (option C of the ruled menu): it scores 0 of 320 wrong on the frozen set, whose everyday words are all lowercase, and loses 379 of 836 requests: every place typed in lowercase ("shaped like texas", "the shape of japan"). Among the cases added after it scored zero, it still fires on fantasy capitals ("the shape of the North", "the Coast": 64 of 64; the corpus writers capitalise such a word mid-sentence 20 times in 420) and on a sentence in capitals ("AN ISLAND SHAPED LIKE A TURKEY"), moves five covenant rows, and contradicts `FOUNDING_RULES`'s second rule ("Capitals ... make no difference"); `foundingWords` folds every capital away, so the scan would need a second word list.
- **A minimum name length** (arm J, five letters): lets "coast", "mountain" and "plateau" through and drops Chad, Peru, Mali, Cuba, Iowa, Ohio and Utah (218 of 320 wrong, 35 of 836 lost).
- **The name must end the sentence** (arm K): "an island shaped like a plateau" still fires, and "shaped like Texas, with ..." would not (289 of 320 wrong).
- **Countries and nations only** (arm L): loses every US state, Texas and the epic's pin among them (27 of 320 wrong, 149 of 836 lost, eight shape rows moved).
- **"a" and "an" refused, "the" before any place allowed** (arm D, the article rule alone): fixes "a X" and nothing after "the" (92 of 320 wrong).
- **Direction words alone** (arm F): 270 of 320 wrong.
- **A refused name ending the search** rather than passing to a shorter one: the same on the scoring set; "shaped like the vatican city" would found nothing in place of the Vatican. Passing over reads the gazetteer after "the" as if it held only countries, nations and lakes, which is the rule in plain words.
- **"unit" left out after "the"**: "the Azores", "the West Bank" and the four nations of the United Kingdom are units in the index.
- **"lake" left out after "the"**: "shaped like the Dead Sea" and "the Great Salt Lake" are how English names them.
- **More direction words** ("middle", "lower", "inner", "outer", "center"): no name in the index is made only of them with the others, so they would change nothing; the table holds the sixteen compass forms and "central", "centre", "far" and "upper", the words the index's direction-only names use beside them.

## Files

| file | change | lines after (measured on the reference build) |
|---|---|---|
| `src/world/founding/lexicon-shapes.ts` | edit: three exports | 120 |
| `src/world/founding/shapes.ts` | edit: the rule | 97 |
| `src/world/founding/lexicon.ts` | edit: imports, one `FOUNDING_RULES` sentence | 313 |
| `test/world/founding-shape-covenant.test.ts` | edit: fourteen rows, T2d, one table test | 284 |
| `test/world/founding-lexicon.test.ts` | edit: the direction words join one test | 104 |
| `handbook/specs/engine-invariants.md` | edit: one new paragraph | |
| `handbook/plans/800/856/856-r1-plan.md` | new: this plan, archived | |

No function passes 50 lines; `placeAt` is 16 and `shapeAt` 15 (measured on the reference build, formatted by the repo's Prettier config).

### `src/world/founding/lexicon-shapes.ts` (edit)

Directly before `PLACE_KINDS`, exactly:

```ts
export const PLACE_ARTICLE = "the";
export const KINDS_AFTER_THE: ReadonlySet<string> = new Set(["country", "unit", "lake"]);
export const DIRECTION_WORDS: ReadonlySet<string> = new Set([
  "north", "south", "east", "west", "northern", "southern", "eastern", "western",
  "northeast", "northwest", "southeast", "southwest", "northeastern", "northwestern", "southeastern", "southwestern",
  "central", "centre", "far", "upper",
]);
```

(Prettier puts the twenty words one to a line.)

### `src/world/founding/shapes.ts` (edit)

- The import from `./lexicon-shapes.ts` gains `DIRECTION_WORDS`, `KINDS_AFTER_THE` and `PLACE_ARTICLE`.
- A local type `type Place = { readonly id: OutlineId; readonly kind: string };` and `places: ReadonlyMap<string, Place> | null`.
- `const onlyDirections = (key: string): boolean => key.split(" ").every((word) => DIRECTION_WORDS.has(word));`
- `setFoundingGazetteer`: the row loop also fills `const kindOf = new Map<string, string>()` with each row's `id` to its `kind`; the held map and the preferences are unchanged; in the final loop a key for which `onlyDirections(key)` holds is skipped (`continue`, before `placeId` and before `longest`), and every other key is set to `{ id: placeId(id), kind: kindOf.get(id) ?? "" }`.
- `placeAt(gazetteer: ReadonlyMap<string, Place>, words: ReadonlyArray<string>, from: number, start: number, afterThe: boolean): ShapeHit | null`, the reference shape:

```ts
for (let span = Math.min(longestName, words.length - start); span > 0; span--) {
  const key = placeKey(words.slice(start, start + span));
  const place = gazetteer.get(key);
  if (place === undefined) continue;
  if ((afterThe || key.split(" ")[0] === PLACE_ARTICLE) && !KINDS_AFTER_THE.has(place.kind)) continue;
  return outlineHit(place.id, from, start + span);
}
return null;
```

- `shapeAt`: unchanged down to and including the `"unloaded"` return; its last lines become:

```ts
const bare = placeAt(gazetteer, words, at, first, false);
return bare ?? (head === PLACE_ARTICLE ? placeAt(gazetteer, words, at, first + 1, true) : null);
```

(`starts` stays, for the forms.) The reference build is `out/856-r1-dry-run/final/src/world/founding/shapes.ts`; the builder writes the file from this section, not by copying.

### `src/world/founding/lexicon.ts` (edit)

- The import from `./lexicon-shapes.ts` gains `DIRECTION_WORDS` and `PLACE_ARTICLE`.
- `FOUNDING_RULES` gains, directly after the sentence that ends `are settled by hand.`, exactly:

```ts
  `A real place's name counts only straight after those words, or after "${PLACE_ARTICLE}" when it names a country, a nation or territory within one, or a lake; a name that itself begins with "${PLACE_ARTICLE}" counts only when it names one of those too, and a name made only of ${quoted(DIRECTION_WORDS)} never counts. So "a turkey", "the coast" and "south america" draw no shape.`,
```

## Tests, in the order they are written

No browser check: nothing here is rendered, and no e2e suite reads a founding before Issue #393. Every value below was read from the reference build (`out/856-r1-dry-run/final/`, the PR's sources at 55099114 with this section's edits), which passes all 386 tests of the founding files and `test/world/land-mask-pins.test.ts` (`856-final-tests.log`). A built value that differs is a hand-back, never a re-pin.

**T2a, fourteen new rows**, appended to `SHAPE_SHEET` in `test/world/founding-shape-covenant.test.ts` after "a crescent shaped island", verbatim:

```
["the shape of the coast changes with the tides",3714943204,"shape coast changes tides",{},[],[]],
["a kingdom in the shape of a mountain",1323617895,"kingdom in shape mountain",{},[],[]],
["an island shaped like a plateau",1525959595,"shaped like plateau",{"mapType":"island"},["island"],[]],
["a continent the shape of the northern coast",898802494,"shape northern coast",{"mapType":"continent"},["continent"],[]],
["an island shaped like a turkey",1771816965,"shaped like turkey",{"mapType":"island"},["island"],[]],
["a continent shaped like south america",1707494512,"shaped like south america",{"mapType":"continent"},["continent"],[]],
["shaped like the yukon",2185077823,"shaped like yukon",{},[],[]],
["shaped like yukon",2166136261,"",{"outline":"ne-1159309667"},["shaped like yukon"],[]],
["shaped like northern ireland",2166136261,"",{"outline":"ne-1159320745"},["shaped like northern ireland"],[]],
["in the shape of the valley",1795820626,"in shape valley",{},[],[]],
["shaped like the bahamas",2166136261,"",{"outline":"ne-1159320415"},["shaped like the bahamas"],[]],
["an island shaped like the azores",2166136261,"",{"mapType":"island","outline":"ne-1159321189"},["island","shaped like the azores"],[]],
["shaped like the dead sea",2166136261,"",{"outline":"ne-1159126747"},["shaped like the dead sea"],[]],
["shaped like the vatican city",230981954,"city",{"outline":"ne-1159321407"},["shaped like the vatican"],[]],
```

What each pins: the skeptic's four sentences (a province after "the"; "a" before an everyday word, twice; a direction-word province after "the", which both the "the" rule and the direction rule refuse, so only M10 below reds it); "a" before a country ("a turkey" is the bird); a direction word before a land the map does not hold; a province after "the", and the same province bare; a name that starts with a direction word; a province whose own name begins with "The"; a country whose own name does; a nation within a country (a unit) after "the"; a lake after "the"; a refused name passed over for a shorter one.

**T2d, edited**: the checksum `2072831757` becomes `3158117445`; the shapeless clause becomes `assert.deepEqual([...new Set(shapeless.map(([, name]) => placeKey(foundingWords(name))))].sort(), SHAPELESS, "only a name made only of direction words, and a province whose name begins with the, founds no outline")`, with `SHAPELESS` a module constant above the test, exactly `["central","centre","east","eastern","far north","north","north east","north eastern","north west","northeastern","northern","northwest","northwestern","south","south east","southern","southwest","the farrington","the quarter","the valley","upper east","upper west","west","western"]` (68 rows, 24 names).

**T2f, new**, above T2d, with `TWENTY` a module constant restating the twenty words in `DIRECTION_WORDS`'s order: "a place's name follows only the shape words or the, after the only a country, a nation within one or a lake, and the tables hold no other words": `assert.equal(PLACE_ARTICLE, "the")`, `assert.deepEqual([...KINDS_AFTER_THE], ["country", "unit", "lake"])`, `assert.deepEqual([...DIRECTION_WORDS], TWENTY)`. The file's import from `lexicon-shapes.ts` gains the three names.

**T4, edited** (`test/world/founding-lexicon.test.ts`, "every word of the count and shape tables is already in the form the cleanup gives, and none is a listed phrase"): `...DIRECTION_WORDS` joins the end of `words` (the cleanup-form check only, not the listed-phrase check, since a direction word is read only inside a shape phrase); the import gains `DIRECTION_WORDS`.

**Red first** (measured, `out/856-r1-dry-run/stub/`, the tables and tests in, `shapes.ts` and `lexicon.ts` as built): exactly ten red (`856-stub-tests.log`), each on `assert.deepEqual(f.overrides, ...)` or the checksum: the rows "the shape of the coast changes with the tides", "a kingdom in the shape of a mountain", "an island shaped like a plateau", "a continent the shape of the northern coast", "an island shaped like a turkey", "a continent shaped like south america", "shaped like the yukon", "in the shape of the valley", "shaped like the vatican city", and T2d. The other five rows, T2f and T4 are green from the first commit: they guard that the rule leaves those names alone and pin the tables.

**Mutations** (measured on the reference build, `856-mutate.ts`, log `856-mutate.log`; every one bites):

| mutation | red |
|---|---|
| M1: the `KINDS_AFTER_THE` line in `placeAt` removed | the coast, the yukon, the valley and the vatican city rows; T2d |
| M2: a place tried after "a" and "an" too (`SHAPE_ARTICLES.has(head) ? placeAt(..., first + 1, head === PLACE_ARTICLE)`) | the mountain, plateau and turkey rows |
| M3: direction-only names kept at install | the south america row; T2d |
| M4: `every` to `some` in `onlyDirections` | the northern ireland row; T2d |
| M5: "lake" removed from `KINDS_AFTER_THE` | the dead sea row; T2f |
| M6: "unit" removed from `KINDS_AFTER_THE` | the azores row; T2f |
| M7: a name's own leading "the" not judged (`afterThe` alone) | the valley row; T2d |
| M8: a refused name ends the search (`continue` to `return null`) | the vatican city row |
| M9: "upper" removed from `DIRECTION_WORDS` | T2f; T2d |
| M10: M1 and M3 together | the northern coast row, with the coast, south america, yukon, valley and vatican city rows; T2d |

**Who proves them:** PR #1156's guard prover and cold skeptic each had their one round (workflow step 15), so the implementing session proves M1 to M10 itself, committed first ("Commit before you mutate"), and the PR body names them as proven by the implementing session only. T4's new words need no mutation of their own: the table test T2f pins them, and T4's existing mutation stands.

## Order of commits

On `chore/856-founding-shape-count`, after its seven commits, with `git merge origin/main` first if main has moved (step 10; nothing in PR #1157 touches these files). Push at each.

1. `#856 Revision 1: a place's name only where English names one, its rows red`: `handbook/plans/800/856/856-r1-plan.md` (this file, unchanged); the three exports in `lexicon-shapes.ts`; T2a's fourteen rows, T2d's new values, T2f, T4's edit. Red: the ten named above, nothing else.
2. `#856 A place's name counts only straight after the shape words, or after the for a country, a nation or a lake, and never when made only of direction words`: `shapes.ts` and `FOUNDING_RULES`. Every test green.
3. `#856 The founding spec says how a place's name is told from an everyday word`: `handbook/specs/engine-invariants.md`.

Then the mutation proofs (M1 to M10, each restored to the commit), the PR body edits (Rosters and doctrine), and a step 12 comment on Issue #856 with this revision's calls, pointing at comment 6548614731 for the ruling.

## Rosters and doctrine

- **`handbook/specs/engine-invariants.md`**, a new paragraph directly after "A founding never asks the terrain for what it refuses.", exactly:

  "**A place's name counts only where English names a place.** After a shape phrase, the founding reads a gazetteer name straight after the phrase, or after the one article English puts before a country, a nation within one or a lake, and only for those kinds, whether the article is the sentence's or the name's own; it never reads one after the other articles, and never a name made only of direction words (`shapeAt`, `placeAt` and `setFoundingGazetteer` in `src/world/founding/shapes.ts`, the words and kinds in `src/world/founding/lexicon-shapes.ts`). The gazetteer holds every province of the map data, many of them named by an everyday word, and the founding folds every capital away, so a rule over the words around the name is what tells them apart: never a list of the everyday names, and never a capital letter. `test/world/founding-shape-covenant.test.ts` pins the names that found no outline."
- **`FOUNDING_RULES`**: the sentence in Files.
- **`FOUNDING_GLOBALS`**, `APPROVED`, `SOURCE_READS`: unchanged (`split`, `Map`, `Set` only).
- **The PR body** (#1156), edited by the implementer: the opening says the build follows `856-plan.md` and revision 1 (`856-r1-plan.md`), and quotes revision 1's opening paragraph; item 3 gains the rule in one sentence; the place-name checksum reads 3158117445; the Guards table gains M1 to M10 with their pasted red lines, "proven by the implementing session only"; Records names the skeptic's blocking finding as answered by revision 1, its four sentences now covenant rows, and Alex's ruling, https://github.com/ahl-gram/Vellum/issues/856#issuecomment-6548614731; "Look for these when you use it" gains: "the shape of the coast" and "shaped like a turkey" draw no shape, "shaped like the Yukon" draws none while "shaped like Yukon" does, and "the shape of the turkey" still draws Turkey.
- **Rulebook, golden, re-roll set, committed charts, the name index:** untouched.

## Evidence

- `node --test test/world/founding-shape-covenant.test.ts test/world/founding-lexicon.test.ts test/world/founding-count-covenant.test.ts test/world/founding-gazetteer.test.ts test/world/founding-drawable.test.ts test/world/founding-shape-pins.test.ts test/world/founding-covenant.test.ts test/world/founding-sample.test.ts test/world/founding-climate.test.ts test/world/founding.test.ts test/world/founding-normalize.test.ts test/world/founding-text.test.ts test/world/land-mask-pins.test.ts`: 386 pass, measured on the reference build. Then `npm test` (then `npm run astro:generate`), `npm run check`, `npm run lint`, `npm run format:check`.
- No e2e suite; `vellum-plate-reader` not owed.
- The PR body carries the scoring table below, with `856-score.ts` named as its harness, since `out/` is gitignored.

## Calls made

1. **A refused name is passed over and a shorter one tried.** Rule: the rule in plain words reads the gazetteer after "the" as holding only countries, nations and lakes; measured the same on the scoring set, and it reads "the vatican city" as the Vatican.
2. **"unit" and "lake" count after "the", beside "country".** Rule: English names the Azores, the West Bank, the Dead Sea and the Great Salt Lake with "the"; no lake's name in the index is an everyday word ("Long Lake" and "North Channel" are the nearest, named in "Why this rule").
3. **A name that itself begins with "the" is held to the same kinds; one that begins with "a" or "an" is not held at all.** Rule: "The Bahamas" is a country and keeps its row; "The Valley" (Anguilla) is the skeptic's case in another form; "A Coruña" is a covenant row of the plan and stays.
4. **The direction words are the sixteen compass forms and "central", "centre", "far" and "upper"**, left out of the gazetteer at install, whole names only, so "Northern Ireland", "South Africa" and "West Virginia" stay places.
5. **The "unloaded" refusal stays where it was**, after the forms and before any place, since "shaped like A Coruña" needs the list.
6. **"2.5 islands" stays as built** (5 islands, "2" to the chart number; "0.5 islands" and "1.5 islands" also 5, "3.0 islands" no count; measured, `856-decimal.log`). The cleanup drops the point before the number rule sees it, so "2.5" and "2 5" are one input; a decimal before an island word is not a sentence anyone was measured writing, and it still founds an archipelago. Not on the menu.
7. **The implementer's finding 2 changes nothing**: the kept sample reaches only `outline` and `islands`, and the covenant rows reach `isleSize` and `raggedness`, as ruling 9 ("keep the sample as written") leaves it.
8. **`choose` at 32 lines is accepted**: the plan's "none in `found.ts` passes 30" was the plan's own bound, not a rule; the house cap is 50.

## Open decisions

None. Alex ruled this revision's one question on 2026-10-31, option A, the design above (Rulings). The options he did not take are in Rejected, with their measured values.

## Stop conditions

Hand back, with the command and what it printed, when:

- any value this revision prints differs from the built one: a T2a row, the checksum 3158117445, the 24 names of `SHAPELESS`, or the ten reds of commit 1;
- any test this revision does not name moves: the list checksum 1363090399, the pins 139361013 and 3918878483, a T1 or T2 row of `856-plan.md`, a kept row of `test/world/founding-sample.json`, or anything in `npm test`;
- a mutation of M1 to M10 stays green;
- the branch's `src/world/founding/shapes.ts`, `lexicon-shapes.ts` or `lexicon.ts` is not as built at 55099114 when the work starts (`git diff 55099114 -- src/world/founding/` prints anything), or main has touched `src/world/founding/` or `src/world/outline-place-names.json`;
- `vellum/founding-locale-clock-free` or any other lint refuses the code as specified;
- a step would need a file this revision does not name.

## Measurements

All in the planner's tree `out/856-r1-dry-run/` (the dispatcher copies it to the main checkout's `out/856-r1-dry-run/`), run from the tree's root with `node out/856-r1-dry-run/<file>`, against PR #1156's sources at 55099114 extracted into `pr/` by `git archive origin/chore/856-founding-shape-count src test-support test package.json`.

- **The finding, reproduced** `856-repro.ts` (log `856-repro.log`): the skeptic's four sentences found Coast (Kenya), Mountain (Philippines), Plateau (Benin) and Northern (Zambia); "the lakes", "the centre", "the north", "the south", "the east wind" and "the west" found provinces of South Sudan, Togo, New Caledonia and Cameroon.
- **How widespread** `856-common.ts` (log `856-common.log`): 5,646 rows, 5,363 names, 3,193 of one word. 7 names are listed phrases (Greece, Hawaii, Ireland, Japan, Kurgan, Norway, Scotland), 14 are made only of the founding's own table words (Coast, Free State, Long Island, Ragged Island, Three Kings Islands among them); 220 one-word names have a lowercase entry in `/usr/share/dict/web2`, Canada, China, Brazil, Turkey and Russia among them, which rules out a dictionary as the list; 45 names occur as words in the 1,844 corpus sentences (the 200 kept, 1,428 discovery and 216 held-out), led by coast (74), north (62), south (44), mountain (38) and northern (37). Only 2 corpus sentences hold a shape phrase, and neither names a place, so no corpus sentence moves under any option.
- **The scoring** `856-scoring-set.ts` (frozen before scoring; "beni" was dropped in copying the 220, so 219) and `856-score.ts` (log `856-score.log`), through an instrument (`inst/`, PR #1156's `shapes.ts` with every candidate behind an option) whose as-built arm reproduces 2072831757 and 1363090399. On the frozen set, 320 everyday-word cases and 836 real-place requests (`856-frozen-totals.ts`, log `856-frozen-totals.log`), wrong and lost: A as built 317, 0; B the list 159, 2, checksum 3644236662, 125 names unreachable; C capitals 0, 379, 2878162096, five shape rows moved; D "a"/"an" alone 92, 0; E D plus "the" for countries and nations only 14, 7; F direction words alone 270, 0; G E plus F 2, 7; G2 G with lakes after "the" 2, 7; H D plus F 58, 0; R this revision 2, 7, 3158117445, 68 names; I G plus B's list 0, 9; J five letters 218, 35; K the name ends the sentence 289, 0; L countries and nations only 27, 149, and the Texas pin's sentence founds differently. On the 75 everyday-word cases and 5 lakes added after the first scoring: A 75, 0; B 9, 0; C 67, 0; E and G 6, 5; R 8, 0. Every arm but C and L moves no shape row, count row, corpus sentence or pin, and none moves the list checksum. The capitalised, all-capitals, lake and country-word groups were added after the first scoring and are labelled so in the log.
- **Capitals in the corpus** `856-capitals.ts` (log `856-capitals.log`): everyday gazetteer words mid-sentence, 400 lowercase, 20 capitalised ("the Jade Coast", "the West", "the North").
- **The rows** `856-rows.ts` (log `856-rows.log`): the fourteen rows under this revision and as built, T2d's checksum and names.
- **The reference build** `final/` (tests log `856-final-tests.log`: 386 pass) and the stub `stub/` (log `856-stub-tests.log`: 10 red, named above); **the mutations** `856-mutate.ts` (log `856-mutate.log`).
- **Decimals** `856-decimal.ts` (log `856-decimal.log`).
