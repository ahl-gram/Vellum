# Issue #391 plan: the founding function, `foundWorld(sentence)`

Issue #391 (Write the Age, Sub 1), epic Issue #278. Read 2026-10-09 at main `c1b8a7cd`: Issue #391's
body and its one comment (2026-10-06, the pointer to Alex's Sub 0 rulings), Issue #390's body and four
comments (the 2026-08-15 crazy-cases amendment, the 2026-10-06 review and rulings
https://github.com/ahl-gram/Vellum/issues/390#issuecomment-6017722842, the closing note, and the
2026-10-06 correction to ruling 2), Issue #278's body and its one comment, and the comments on
Issue #392 and Issue #393. The Sub 0 spike's script and tables were read from Alex's `out/390/`
(`390-lexicon-spike.ts`, `390-sentence-table.md`), the only record of the reviewed rows. This version
folds in `vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings (the disposition table is at
the end).

Phase one is everything up to the STOP for Alex's rulings (recon, this plan, the skeptic, the menu).
Phase two is everything after the rulings arrive, in the order "Build order" gives.

## Alex's rulings on this plan's menu (2026-10-09), and what they change below

The record is https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088029887. The body of this
plan is the one the menu came from and is kept as it stood; where a ruling departs from the
recommendation, this section is the build and the text below it is not.

- Menu items 2, 3 (a cap of 120), 5, 6, 7, 8 and 9 were ruled as recommended.
- **Menu item 1 was ruled B.** A sentence that names no tradition, or names two that cancel, takes its
  tradition from its climate word when one steers the band, and from the chart number (the seed's own
  draw) only when none does. So step 12's overrides gain a culture whenever no tradition word survives
  and a band word does, through a table from band to tradition. Proposed (the menu's own examples,
  which the session put to Alex as examples, and the tropical row his reading of ruling 4 confirmed):
  polar to norden, tropical to oromi, temperate to sylvan. The table is a call for Alex to overrule,
  recorded on the issue and shown in the pull request.
- **Menu item 4 was ruled B.** A word with several meanings loses only the meanings on a contested
  subject and keeps the rest. A word counts toward the chart number only when every one of its
  meanings was cancelled. So step 10 cancels by subject rather than by word: `steered` lists every word
  with a surviving meaning, carrying only its surviving meanings, and `contested` lists the words that
  lost every meaning. One pass and re-evaluation now give the same answer by construction (cancelling
  a subject removes no value from any other subject), so test 4's "re-evaluate" mutation goes.
- The worked cases under the rulings:
  - "sun-drenched atolls ringed with shrines where the old kings drowned": a tropical archipelago with
    less land and oromi names (the cancelled traditions fall to "sun drenched"); residual "ringed
    shrines old kings".
  - "cold atolls and fjords": band and culture are contested; "cold" loses its one meaning and counts;
    "atolls" keeps archipelago and "fjords" keeps the ragged coast; no band survives, so the
    tradition is the seed's draw; residual "cold".
  - "a polar sea of atolls": "polar" counts; "atolls" keeps archipelago and oromi; residual
    "polar sea".
  - The epic's sentence is unchanged: polar, archipelago, less land, norden from "black pines";
    residual "iron harbors kingdom".
  - "a tropical polar waste" is unchanged: nothing steers; residual "tropical polar waste".
- Test 2's "a word equal to the seed's own roll gives the bare seed's recipe" now holds for a map type
  word only: a band word also brings its tradition.
- Test 7's checksum message says version 1 may change until the written-world link goes public in
  Issue #393 and is locked from then.

## The rulings this builds on (Alex, 2026-10-06, Issue #390)

1. Go, with named changes.
2. Warm founds tropical, cold founds polar (the band). Which plate a written world opens on is
   Issue #393's.
3. Naming tradition is never left to chance: the words set it directly, through a new naming-tradition
   setting on the recipe beside the band.
4. The chart number comes from the unrecognised words only, with the small words a, an, the, of, and,
   with, where left out (this settles the issue's whole-sentence recommendation the other way).
5. Contradicting words on one subject: neither wins; both only count toward the chart number.
6. The first word list goes broad: 150 entries or more, phrases allowed.
7. and 8. are Issue #393's and Issue #392's (the quiet line; lettering only when a word was
   recognised), but this sub hands them what they need to decide.
9. The list is versioned from day one, so a link founds the world its list version founded; Issue #391
   rules it formally (menu item 2).

And the 2026-08-15 amendment: off-theme, gibberish and crude sentences found real worlds; "The only
rejected inputs remain ... (empty line, over the length cap, control characters), each with a clear
message, never an error."

## Design

### The new recipe field: `culture`

- `WorldRecipe` (`src/world/types.ts`) gains `readonly culture?: CultureId`, beside `band`. It holds a
  culture's ID, never its index: the index into `CULTURES` is seed 42's covenant and must not become a
  second thing that pins the order.
- "Beside the band" does not mean rolled like the band. `defaultRecipe` never rolls `culture`: rolling
  it on the recipe fork would re-roll every world and stamp every chart. It is optional, never rolled,
  and absent means `generateWorld`'s existing draw.
- `CultureId` comes from a new `CULTURE_IDS` const tuple in a new small module
  (`src/society/culture-ids.ts`, name on the menu), not from `src/society/names.ts`, which is over the
  400-line cap and on `eslint-suppressions.json`, so it must not grow. A test holds
  `CULTURES.map((c) => c.id)` deep-equal to `CULTURE_IDS`, order included, so neither list can gain or
  lose a member alone. `cultureById` in `src/society/philology.ts` already exists but `src/world` may
  not import that module (`vellum/world-no-philology`), so the lookup below is a second one; the PR
  says so.
- `generateWorld` (`src/world/generate.ts`) swaps its one culture line for one helper call:
  `cultureFor(recipe, rng)` returns `rng.fork("culture").pick(CULTURES)` when `recipe.culture` is
  absent, exactly as today, and otherwise the culture with that ID; an ID not in `CULTURES` throws a
  `RangeError` naming it, at the top of the call, on the precedent of `int()` and `pick()` in
  `src/core/rng.ts` (a recipe can reach `generateWorld` from a worker message through `worldFor` in
  `src/site/explorer/world-cache.ts`, not only from a parsed chart). `generateWorld` stays at its line
  count, near the 50-line cap. A named fork is derived from the seed and its label, never from stream
  position (`fork` in `src/core/rng.ts`), so skipping the draw moves no other draw, and an absent field
  takes today's path byte for byte.
- A region world already spreads its parent's recipe (`generateRegionWorld` in `src/world/region.ts`
  returns `recipe: { ...recipe, gridW, gridH }`) and takes `culture: world.culture`, so a pinned culture
  reaches region sheets and their stamp with no change there.
- The stamp, all three places `handbook/specs/rulebook.md` names for an optional recipe field, in
  `src/render/recipe-meta.ts`: `recipeAttrs` emits `data-vellum-culture` by conditional spread;
  `recipeMetadataNode`'s summary gains ` culture=<id>` by ternary; `recipeFromSvg` reads it by
  conditional spread. An ID that is not in `CULTURE_IDS` makes the whole chart unreadable (`null`),
  because reading it as absent would rebuild the seed's own culture, a different world (the precedent
  `detail0` reads junk as the plain field instead).
- The stamp lands in this sub although the issue's scope line says "no SVG", because the rulebook owes
  it to any optional recipe field and without it a founded chart's embedded recipe re-rolls its culture
  from the seed (the Issue #137 precedent landed `coastWarp`'s field, stamp, parse and tests together).
- Identity, not view: `culture` is a recipe field and is stamped. The PR says so
  (`handbook/specs/engine-invariants.md`, Identity versus view). A culture's ID therefore becomes world
  identity: a founded chart's stamp and a written link name it, so an ID is never renamed.

### The founding function

Three small modules under `src/world/founding/` (names on the menu): `normalize.ts` (the boundary and
the cleanup, exporting `displayForm` and `foundingWords` so each half is tested on its own),
`lexicon.ts` (the version, the small words, the strengths, the cap, the word list and a plain-language
list of the rules, all exported as data a page can render), and `found.ts` (`foundWorld`). No DOM, no
I/O, no clock, no randomness, no locale-sensitive call, no new dependency. The engine type check
(`tsconfig.engine.json`, lib ES2023 with no DOM) covers all three, and the existing world-generation
lint block reaches them without an `eslint.config.ts` edit.

```ts
foundWorld(sentence: string, version: number = FOUNDING_VERSION): Founding | Refusal

type Founding = {
  readonly ok: true;
  readonly version: number;
  readonly sentence: string;        // the display form (below): what Issue #392 letters and Issue #393 carries
  readonly seed: number;            // hashString(residual)
  readonly overrides: FoundingOverrides; // for defaultRecipe(seed, overrides), seed FIRST
  readonly steered: ReadonlyArray<Recognised>;   // words that steered, in sentence order
  readonly contested: ReadonlyArray<Recognised>; // words recognised but cancelled by a contradiction
  readonly residual: string;        // the words the chart number came from, joined by single spaces
};
type Refusal = { readonly ok: false; readonly reason: "empty" | "too-long" | "control-character" | "unknown-character" | "unknown-version" };
type FoundingOverrides = Partial<Pick<WorldRecipe, "mapType" | "band" | "landFraction" | "coastWarp" | "culture">>;
type Recognised = { readonly phrase: string; readonly steers: ReadonlyArray<Steer> };
type Steer =
  | { readonly subject: "mapType"; readonly value: MapType }
  | { readonly subject: "band"; readonly value: ClimateBand }
  | { readonly subject: "land"; readonly value: "less" | "more" }
  | { readonly subject: "coast"; readonly value: "ragged" | "smooth" }
  | { readonly subject: "culture"; readonly value: CultureId };
```

A refusal is a returned value, never a throw ("a clear message, never an error"). `steered` and
`contested` are returned because Issue #392 (lettered only when a word was recognised) and Issue #393
(the quiet line when no word steered; the vegetation plate when the founding is primarily on climate)
cannot decide from `{ seed, overrides }` alone. `unknown-version` is not a sentence refusal: it is what
a link carrying a version this build does not have gets.

**The display form** (what the cap counts, what is lettered and carried; it must stay faithful to what
was typed):

1. A version other than `FOUNDING_VERSION` (1) is refused, `unknown-version`.
2. A control character (Unicode category Cc) other than tab, line feed, vertical tab, form feed and
   carriage return is refused, `control-character`.
3. Under menu item 5's recommended option: an unassigned code point or a lone surrogate (Cn, Cs) is
   refused, `unknown-character`. This is a fourth refusal beyond the three the 2026-08-15 comment closed
   the list on, so it is Alex's to add.
4. The direction controls and marks (U+200E, U+200F, U+202A to U+202E, U+2066 to U+2069) and the
   byte-order mark (U+FEFF) are removed; a zero-width space (U+200B) becomes a space. Joiners, the soft
   hyphen and tag characters stay, so an emoji sequence or a Persian word keeps its shape.
5. NFC, every run of whitespace becomes one space, ends trimmed. Empty is refused, `empty`. Longer than
   the cap in code points is refused, `too-long` (menu item 3 says what a code point is and why not
   "characters as a reader sees them").

**The words** (what is matched and hashed), from the display form:

6. NFKC, so fullwidth and ligature letters fold to their plain forms; then every remaining format
   character (Cf) is removed.
7. Under menu item 6's recommended option, a possessive apostrophe-s at a word's end is removed with its
   s ("the island’s lighthouse" reads island), then every other apostrophe (U+0027, U+2018, U+2019,
   U+02BC) is deleted ("o'er" reads oer).
8. Every character that is not a letter, a combining mark or a digit (`\p{L}`, `\p{M}`, `\p{N}`) becomes
   a space (under menu item 6's recommended option, symbols and emoji included), then the text splits
   on spaces, and each word is lower-cased on its own (`toLowerCase`, which is locale-independent), so
   Greek final sigma reads the same whatever separated the words (measured: lower-casing first made
   "ΟΔΟΣ.ΤΗΣ" and "ΟΔΟΣ ΤΗΣ" differ). A display form with no words ("!!!") founds at the empty
   residual, like "the of and", since the ratified list refuses only the empty line.
9. The scan: left to right, the longest table phrase starting at each word wins, else the word is loose.
10. Contradictions, in one pass over every recognised word: a subject is contested when the recognised
    words assert two different values for it, and every recognised word that asserts anything on a
    contested subject is contested as a whole word (menu item 4), stops steering entirely, and its words
    go back into the sentence in place. Contests are not re-evaluated after a word stands down: "cold
    atolls and fjords" contests band (cold, atolls) and culture (atolls, fjords), and all three stand
    down, fjords' ragged coast with them.
11. The residual: every word not covered by a steering phrase, in sentence order, minus the seven small
    words, joined by single spaces. The seed is `hashString(residual)` (`src/core/rng.ts`). An empty
    residual hashes to 2166136261, which every sentence made only of table words and small words shares
    (the collision Sub 0 measured and ruling 4 accepted).
12. The overrides, from the steering words only: `mapType`, `band` and `culture` directly; `coastWarp`
    0.95 for ragged and 0.1 for smooth; `landFraction` the map type's own land share
    (`defaultRecipe(seed, typeOverride).landFraction`, so the seed's own type when no word names one)
    times 0.55 for less or 1.4 for more, rounded to thousandths (0.34 times 0.55 is
    0.18700000000000003 unrounded). Every product stays inside the CLI's 0.1 to 0.7 (measured: island
    0.187 and 0.476, archipelago 0.132 and 0.336, continent 0.253 and 0.644, city-state 0.165 and 0.42),
    so there is no clamp, and a test holds the products in range. Thousandths and hundredths are the
    precisions the Chart Table's address already carries (`land` scaled by 1000, `coast` by 100, in
    `readWorld` in `src/site/shared/table-address.ts`).

What a founding version covers: the whole procedure above (the cleanup, the small words, the
contradiction rule, the strengths, the cap) and the word list, under one number.

### The word list (draft, version 1, 202 entries)

Every Sub 0 row is kept except three stated departures, per the fidelity rule
(`handbook/specs/conventions.md`): "flooded" moves from 0.65 to the drowned strength 0.55, and "gentle"
from 0.15 to the smooth value 0.1, so two words saying the same thing never contradict each other under
ruling 5; and "iron" and "iron harbors" leave the draket rows, because the epic's own sentence ("a cold
archipelago of black pines, iron harbors, and a drowned kingdom") would otherwise name two traditions
and, under ruling 5, found neither (menu item 7). One merge: "city-state" and "city state" become one
row, since the cleanup splits the hyphen. Rows marked * are new since Sub 0.

- **island**: island, isle, islet*
- **archipelago**: archipelago, isles, islands, islets*, archipelagos*
- **continent**: continent, mainland, continents*, landmass*, subcontinent*
- **city-state**: city state, free city, citystate*, walled city*, port city*
- **polar**: cold, frozen, icy, polar, glacial, wintry, boreal, frigid*, arctic*, snowy*, snowbound*,
  icebound*, frost*, frosty*, freezing*, ice*, glacier*, glaciers*, tundra*, permafrost*, winter*,
  snow*, hoarfrost*
- **tropical**: warm, tropical, sweltering, sun drenched, steaming, hot*, humid*, sultry*, balmy*,
  torrid*, tropic*, tropics*, equatorial*, scorching*, sunbaked*, sun baked*, monsoon*, monsoons*,
  jungle*, jungles*, palm*, palms*
- **temperate**: temperate, mild, verdant*
- **less land**: drowned, sunken, flooded, drowning*, sinking*, submerged*, inundated*, foundered*
- **more land**: vast, sprawling, endless*, boundless*, immense*
- **ragged coast**: ragged, jagged, shattered, craggy*, rugged*, fretted*, splintered*, fractured*,
  inlet*, inlets*, cove*, coves*
- **smooth coast**: smooth, gentle, sandy*, beach*, beaches*
- **norden**: fjords (also ragged coast), jarls, black pines, fjord* (also ragged coast), jarl*,
  vikings*, norse*, rune*, runes*, longship*, longships*, skald*, skalds*, mead halls*
- **draket**: margrave*, margraves*, kaiser*, kaisers*, iron crown*, iron crowns*, black eagle*,
  black eagles*
- **zoryan**: birch, birches*, taiga* (also polar), boyar*, boyars*, tsar*, tsars*, onion domes*
- **ordai**: steppe, horde, steppes*, hordes*, khan*, khans*, yurt*, yurts*, kurgan*, kurgans*
- **veshari**: dunes (also tropical), oasis, dune* (also tropical), desert* (also tropical), deserts*
  (also tropical), oases*, sultan*, sultans*, caravan*, caravans*, minaret*, minarets*
- **oromi**: atolls (also archipelago and tropical), atoll* (the same), lagoon*, lagoons*, outrigger*,
  outriggers*, canoe*, canoes*, chiefdom*, chiefdoms*, fire peaks*
- **thalassic**: olive, marble, olives*, temple*, temples*, oracle*, oracles*, trireme*, triremes*,
  laurel*, wine dark*
- **tsuren**: shrines, cherry, shrine*, cherry blossoms*, samurai*, shogun*, shoguns*, torii*,
  pagoda*, pagodas*, bamboo*
- **tezcal**: pyramids, jade, pyramid*, cenote*, cenotes*, jaguar*, jaguars*, obsidian*, feathered
  serpent*
- **sylvan**: meadows, elven, meadow*, elf*, elves*, elvish*, druid*, druids*, glen*, glens*, faerie*,
  standing stones*

Left out on purpose: "city" alone, "great", "broken", "torn", "huge", "small", which are too common in
ordinary sentences to steer without surprise.

## Files

- New: `src/society/culture-ids.ts`, `src/world/founding/normalize.ts`, `src/world/founding/lexicon.ts`,
  `src/world/founding/found.ts`.
- New tests: `test/world/founding-normalize.test.ts`, `test/world/founding-lexicon.test.ts`,
  `test/world/founding.test.ts`, `test/world/founding-covenant.test.ts`, `test/world/culture-pin.test.ts`.
- Changed: `src/world/types.ts`, `src/world/generate.ts`, `src/render/recipe-meta.ts`,
  `test/render/recipe-meta.test.ts`, `handbook/specs/engine-invariants.md`, `handbook/specs/rulebook.md`,
  `README.md` (one sentence).
- Archive: `handbook/plans/391/391-plan.md`.
- Untouched, and why: `src/society/names.ts` (over its cap); `eslint.config.ts` and everything else the
  Issue #779 part 2d-rules lane owns; every site file (Sub 3's scope).

## Build order (phase two), with each first red

1. Copy this plan, as Alex's rulings leave it, to `handbook/plans/391/391-plan.md`.
2. The field. Stub: `CULTURE_IDS`, `CultureId` and `culture?: CultureId` on `WorldRecipe` exist, and
   `generateWorld` ignores the field. Before asserting, a scratch probe measures which of a pinned
   world's outputs equal the unpinned world's at a witness seed. Then `culture-pin.test.ts` reds on its
   assertion that `world.culture.id` is the pinned ID; implement `cultureFor`; green. The unknown-ID test
   reds on "no throw"; add the `RangeError`; green. Commit, push.
3. The stamp. `recipe-meta.test.ts`'s new cases red on the missing `data-vellum-culture`; implement the
   emit, the summary and the parse; green. Commit.
4. The founding. Stub with the real shapes: `lexicon.ts` holds the full table, `displayForm` and
   `foundingWords` return their input trimmed and split on " ", and `foundWorld` returns
   `{ ok: true, version: 1, sentence, seed: 0, overrides: {}, steered: [], contested: [], residual: "" }`.
   Tests 1 to 8 and 11 red on their assertions; implement `normalize.ts`, then `found.ts`; green.
   Commit.
5. The doctrine edits, the format and lint pass, the after run of the baseline, commit, then
   `vellum-guard-prover`.

## Tests, each with the mutation that must red it

The 50-line `max-lines-per-function` lint binds each `test()` callback, so the sheets are tables of
cases with one small `test()` per case or per family, not one long callback.

1. **The cleanup, each step pinned where only that step can see it** (`founding-normalize.test.ts`).
   `displayForm`: a decomposed accent comes out composed (mutation: drop NFC); doubled spaces, a tab and
   a newline collapse to one space (mutation: collapse only " "); a direction override and a byte-order
   mark are removed and a zero-width space becomes a space (mutation: keep them); a zero-width joiner
   inside an emoji sequence survives (mutation: strip every Cf from the display form). `foundingWords`:
   fullwidth letters fold (mutation: NFC in place of NFKC); upper case folds (mutation: drop
   `toLowerCase`); "ΟΔΟΣ.ΤΗΣ" and "ΟΔΟΣ ΤΗΣ" give one word list (mutation: lower-case before splitting);
   a curly apostrophe reads as a straight one and "island’s" reads island (mutations: drop the
   apostrophe set; drop the possessive rule); a hyphen splits (mutation: keep `-` as a word character);
   a zero-width joiner inside a word is removed (mutation: drop the Cf removal); an emoji is ignored
   (mutation: keep `\p{S}`).
2. **Divergence, and where the rulings make sentences converge instead**: pairs differing by one
   unrecognised non-small word ("iron towers" and "iron towns"), by word order, and by a digit, found
   different seeds. Two synonyms ("cold archipelago", "frozen isles") give one seed and one recipe, and
   a band or map type word whose value equals the seed's own roll gives the recipe the bare seed gives
   (not a culture word: that adds a `culture` key, so the recipe differs although the world does not).
   Mutations:
   hash the sorted words; drop `\p{N}`; let a recognised word into the residual.
3. **The small words**: each of the seven, added to or removed from a sentence, leaves the seed
   unmoved (seven pins); each of "in", "on", "by", "to", "at", "for", "its" moves it. Mutations: drop
   "where" from the list; add "in".
4. **Contradictions**: "a tropical polar waste" sets no band, lists both as contested, and its residual
   is "tropical polar waste", whose seed differs from "a waste"'s; "cold frozen isle" sets polar with
   both words steering; "a polar sea of atolls" stands atolls down wholly; "cold atolls and fjords"
   stands all three down. Mutations: last word wins; first word wins; only the contested subject
   cancels; re-evaluate after cancelling.
5. **Degenerate sentences**: all table words ("cold archipelago", "frozen isles") give seed 2166136261
   with their overrides; no table words gives `{}` overrides; only small words, and "!!!", give
   2166136261 and `{}`. Mutations: hash the whole sentence; keep small words in the residual; refuse a
   wordless line.
6. **The boundary**: "", spaces, and a line of only direction marks are `empty`; exactly the cap is
   accepted and one more is `too-long`, with an astral character so that UTF-16 length and code points
   differ; a bell character is `control-character`; U+FDD0 (a permanent noncharacter, so the test holds
   on every Unicode version) and a lone surrogate are `unknown-character` (if ruled); version 2 is
   `unknown-version`. A seeded sweep of a few thousand random strings over a pool of every category
   never throws, and for every `ok` result `foundWorld(f.sentence)` deep-equals `f` (the display form
   is a fixed point, which the link round-trip relies on) and `f.sentence` holds no control, direction
   or unassigned character. Mutations: drop the cap; count `.length`; drop the control check; leave a
   direction override in the display form; a cleanup step that is not idempotent.
7. **The covenant sheet** (`founding-covenant.test.ts`): about fifteen sentences, the Sub 0 sheet's
   families among them, each pinned to a LITERAL seed and overrides re-derived from the new function
   (the Sub 0 table's seed and recipe columns were made under last-word-wins with the small words kept,
   which rulings 4 and 5 overturned, so none of them is an expected value), and one checksum,
   `hashString(JSON.stringify(...))` over the founding of every table phrase alone and with one loose
   word, pinned beside `FOUNDING_VERSION`, whose message follows menu item 2's ruling. Founding uses no
   libm and no float beyond one IEEE multiply and round, so the pins hold on linux CI. Mutations: any
   table value, an entry added or removed, any cleanup step, the small words, dropping the land rounding.
8. **The word list** (`founding-lexicon.test.ts`): at least 150 entries; every phrase is already in its
   cleaned-up form (else it can never match); no duplicate phrase; no entry is or contains a small word;
   no entry steers one subject twice; every map type, band and culture is reachable by some word; every
   entry written with a possessive "'s" (straight or curly) reads as that entry and never as another
   with a different steer (the "island's" against "islands" class; "islands" itself is meant to be
   the archipelago); every land strength times every map type's land share stays
   inside 0.1 to 0.7. Mutations: an entry "Sun-drenched"; a duplicate "cold"; an entry "the north"; a
   factor of 2; deleting every tezcal row; dropping the possessive rule.
9. **The culture pin** (`culture-pin.test.ts`): a witness seed whose own draw differs from the pinned
   culture (the precondition asserted in the test) founds the pinned culture, the same outputs the
   build-order probe measured as culture-free (expected: elevation, sea level, settlement positions and
   kinds, roads, realm labels) and different names; over a sweep of about twenty seeds through
   `generateWorld`, an absent culture is the seed's own `fork("culture")` draw; an unknown ID throws a
   `RangeError`; `CULTURES` ids equal `CULTURE_IDS` in order. The sweep is the guard that bites on the
   culture line across seeds: the golden checksum hashes `realms.labels`, settled before the culture
   fork, so it stays green with that line broken; `test/world/covenant-seed42.test.ts` calls the fork
   directly; and the guards that do go through `generateWorld` (the golden's names, the hero drift
   guard, and the seed 1 and 42 culture check in `test/render/place-manifest.test.ts`) see two seeds.
   Mutations: ignore the pin; pick `CULTURES[0]` when absent; reorder `CULTURE_IDS`; fall back silently
   on an unknown ID.
10. **The stamp** (`recipe-meta.test.ts`): a pinned chart stamps `data-vellum-culture`, its summary
    carries `culture=`, and it round-trips and redraws byte for byte; a region sheet of it carries the
    stamp too; an unpinned chart has no attribute and its recipe has no `culture` key; a hand-edited
    unknown ID reads as `null`. Mutations: drop the emit spread; an unconditional parse key; drop the
    summary fragment; read junk as absent.
11. **The integration** (`founding.test.ts`): the epic's sentence through `foundWorld`, `defaultRecipe`,
    `generateWorld` and `renderMap`, twice from fresh calls, gives one SVG (same environment only, never
    across); `recipeFromSvg` of it gives back `defaultRecipe(seed, overrides)` with the culture; and it
    differs from the unsteered seed's chart. Mutations: a module-level counter in the founding; drop
    the culture stamp.

`vellum-guard-prover` gets every guard above, committed first. Two-call determinism catches in-process
state only; a locale-sensitive call would diverge only in a browser, which no Node test sees (measured
by the skeptic: under `LC_ALL=tr_TR.UTF-8`, Node's `toLocaleLowerCase` still returned the plain form),
so the class belongs to a lint rule over `src/world/founding/**` refusing `toLocale*`, `localeCompare`,
`Intl`, `Date` and `Math.random`. It is filed as an issue at PR time, to land after the Issue #779 lane
releases `eslint.config.ts` (the existing `vellum/philology-no-entropy` refuses any rng import, so it
cannot be reused as is).

## Evidence

- **The numeric path is untouched, measured**: `391-baseline.ts` (scratchpad) records `hashString` and
  length of `renderMap` for seeds 0 to 199 with no overrides, and seeds 0 to 39 under each existing
  override (four map types, three bands, `coastWarp` 0.8, `landFraction` 0.5), plus each world's culture
  ID and title. The before run is done: `391-baseline-before.json`, 560 rows at `c1b8a7cd` on Node
  v26.11.1 in 265.9 s, 200 distinct chart hashes over the 200 bare seeds (so the seed reaches the world),
  seed 42 oromi "The Isle of Rahai" as the golden says. It runs again at the branch head on the same
  machine and Node, and the two files `diff` empty. This is the only byte compare, legitimate because it
  never crosses environments. About half a second a world drawn sizes the sweep in test 9.
- `npm test` (the golden `1792806240` in `test/world/golden-seed42.test.ts`, seed 42's draw in
  `test/world/covenant-seed42.test.ts`, the hero drift guard in `test/site/hero-charts.test.ts`, the
  recipe stamp tests), then `npm run astro:generate`; `npm run check`; `npm run lint`;
  `npm run format:check`. No e2e suite: nothing here reaches a page.
- The Sub 0 sentence sheet founded through the real function, as a table copied into a PR comment with
  the script that made it.

## Doctrine and rosters this drags

- `handbook/specs/engine-invariants.md`: a new section, the founding covenant, stating it without
  numbers (that file's own header keeps counts and measurements out): a published founding version never
  changes and a new one is added beside it; an absent `culture` takes the seed's draw; a refusal is a
  returned value; what `steered` and `contested` mean to a surface; a culture ID is never renamed; and
  where the constants and the plain-language rules live (`src/world/founding/lexicon.ts`). One line
  under "There is one way to build a world": founding only produces `defaultRecipe`'s inputs.
- `handbook/specs/rulebook.md`: the "Seed 42's culture draw is a covenant" bullet says the culture is
  picked with `rng.fork("culture").pick(CULTURES)`; it gains "unless the recipe names one, which skips
  the draw", and that an ID is never renamed.
- `README.md`, "Inventing a name language": one sentence, that a culture's `id` is also a founded
  world's identity and is never renamed.
- No reading list changes (no new spec file).
- Latent, for Issue #393 and not fixed here: every site vocabulary that rebuilds a recipe from its own
  fixed field list drops `culture`: `readWorld` and `worldFields` in `src/site/shared/table-address.ts`,
  `surveyItemFrom`'s overrides in `src/site/explorer/chart-drawer.ts`, `recipeOverrides` in
  `src/site/reading-room/app.ts`, and the hash readers of the Explorer, the Print Room, the Prospect and
  the Ribbon. Nothing produces a culture until Sub 3 wires founding into a page, so nothing loses one
  before then. `worldFor`'s key in `src/site/explorer/world-cache.ts` already keys every override, and
  the detail chain caches elevation only, which culture never touches.
- The acceptance line "no second string hash exists in the tree" is false at `c1b8a7cd`, before any of
  this work: `fnv1a` in `test-support/dress-svg.ts`, `fnv1a` in `test/prospect/input.test.ts` and in
  `test/prospect/compose-world.test.ts`, the inline digest in `insetDigest` in
  `e2e/suites/region-detail.ts`, and `hedgeFor`'s polynomial hash in `src/render/place-card.ts`. None
  makes a world. Menu item 9.
- Issue #392's body also proposes a `WorldRecipe` field (the founding text), so Sub 2 will touch
  `src/world/types.ts` and `src/render/recipe-meta.ts` again; this sub's culture stamp is its pattern.
- No CLI flag: website first (`handbook/specs/rulebook.md`, Product direction).

## Not in this sub

The engraving and the covenant line (Issue #392); the page, the link, the quiet line and the opening
plate (Issue #393), including whether a sentence whose only recognised words cancelled each other is
both lettered (ruling 8) and given the quiet line (ruling 7), which `steered` and `contested` let that
plan decide; any change to an existing world, chart, golden or committed file.

## Open decisions for Alex (recommendation first)

1. **The naming tradition when the words name none, or name two that cancel.** The seed's own draw, as
   today (recommended: the seed itself comes from the words, so the tradition is still fixed by the
   sentence forever, only not chosen by meaning); a tradition implied by the climate word when there is
   one; or one fixed tradition for every written world that names none. Measured on the 26 Sub 0
   sentences under the draft list and the one-pass rule (`391-probe-tradition.ts`, scratchpad): 5 name
   a tradition, 4 keep it, and 22 of 26 would take the seed's draw (21 name none; "sun-drenched atolls
   ringed with shrines where the old kings drowned" names two, which cancel).
2. **When version 1 locks** (ruling 9's formal rule): free to change until the written-world link goes
   public in Issue #393, locked from then, every later change a new version with every old one kept in
   the code so old links found their old worlds (recommended); or locked from this merge.
3. **The longest sentence allowed**, counted in Unicode code points after trimming and collapsing
   spaces, provisional until Issue #392 measures the cartouche: 120 (recommended); 80; 160; 240. Most
   letters and simple emoji count one; some flags, skin-toned emoji and some scripts' letters count two
   or three. Counting characters as a reader sees them was rejected because where one ends depends on
   each browser's own tables, so one browser would accept a sentence another refuses. The epic's own
   sentence is 70 code points.
4. **A word that steers several subjects and clashes on one**, on the Sub 0 sentence "sun-drenched
   atolls ringed with shrines where the old kings drowned" (atolls says archipelago, tropical and
   Polynesian names; shrines says Japanese names; worked by hand and by `391-probe-tradition.ts`): the
   whole word stands down and counts toward the chart number (recommended, the plain reading of ruling
   5): the world is tropical (from "sun drenched") with less land, its map type and names from the seed,
   and "atolls" and "shrines" both feed the chart number; or only the clashing subject cancels: the
   world is a tropical archipelago with less land, its names from the seed, and only "shrines" feeds the
   chart number. Under the recommended rule "cold atolls and fjords" stands all three words down.
5. **Which letters the cleanup understands**: the runtime's own Unicode knowledge, covering every
   alphabet, with a character the runtime does not know refused (recommended; a fourth refusal beside
   the empty line, the cap and control characters; without it a character newly added to Unicode would
   found one world in a new browser and another in an old one); the runtime's knowledge with no extra
   refusal; or a fixed table kept in the repo. The recommended option's residual risk: a character whose
   classification Unicode itself later revises (it has happened, to Cherokee letter case in Unicode 8).
6. **Two cleanup details**: a possessive "'s" is dropped ("the island’s lighthouse" founds an island,
   not an archipelago) and symbols and emoji are ignored like punctuation (recommended); the same but
   symbols and emoji count as words, so different emoji found different worlds; or no possessive rule,
   so "island's" reads as "islands".
7. **The word list**: build the 202-word draft above, with its three stated departures from Sub 0 and
   one merge, and Alex reads the whole list in the pull request (recommended); keep every Sub 0 row
   exactly, so the epic's own sentence names two traditions and gets neither; or Alex reads the draft
   before the build.
8. **Names visible in the tree**: the recipe setting `culture`, stamped `data-vellum-culture`, files
   under `src/world/founding/` and `src/society/culture-ids.ts` (recommended); the same with flat files
   (`src/world/found-world.ts`, `src/world/founding-lexicon.ts`, `src/world/founding-normalize.ts`); or
   the setting named `naming`, stamped `data-vellum-naming`.
9. **The acceptance line about a second string hash**: read it as "the founding adds none" and leave
   the five existing copies (recommended); or fold the three Node-side `fnv1a` copies into `hashString`
   here, behaviour-identical and proven by their pinned checksums.

## Calls made without a ruling, each with the rule it rests on

- The display form keeps what was typed apart from invisible direction controls, the byte-order mark
  and zero-width spaces: Issue #392 letters it and Issue #393 carries it, so it stays faithful (the
  skeptic's measured emoji and Persian cases).
- The word steps 6 to 8, beyond what menu items 5 and 6 decide: the issue's "case folding, whitespace
  collapse, punctuation stripping", made to give one answer whatever separator or letter form was typed.
- A refusal is returned, never thrown: the 2026-08-15 comment's "a clear message, never an error".
- The return carries the display sentence, `steered`, `contested`, `residual` and `version`: rulings 7,
  8 and 9 and the 2026-10-06 correction need them, and contradictions make recognised and steered
  differ. A version the build does not have is refused: ruling 9.
- Land words multiply the map type's own land share: the Sub 0 method Alex reviewed. One strength per
  direction: ruling 5 would otherwise make two synonyms contradict each other. Thousandths and
  hundredths: the precisions the Chart Table's address carries.
- The longest phrase wins, left to right: the Sub 0 scan. Contradictions are judged in one pass: the
  answer then does not depend on word order.
- The small words are exactly seven: ruling 4's own list. No table entry contains one, so a small word
  never steers.
- An unknown culture ID makes a chart's recipe unreadable: the rulebook's warning that the parse is the
  dangerous direction, since reading it as absent rebuilds a different world. It makes `generateWorld`
  throw: the `int()` and `pick()` precedent.
- The culture stamp lands here: the rulebook's line that an optional recipe field is guarded at every
  place the stamp touches it, and the Issue #137 precedent.
- The site's link vocabularies learn `culture` in Issue #393: the issue's scope line, sentence in, seed
  plus overrides out. No CLI flag: Product direction, website first.
- The covenant's written home is a new section of `handbook/specs/engine-invariants.md`, without
  numbers (that file's own header keeps them out), pointing at the exported constants and
  plain-language rules in `src/world/founding/lexicon.ts`, which a page can render (the issue's
  acceptance).

## The plan skeptic's findings and what became of each

| # | finding | disposition |
|---|---|---|
| 1 | "!!!" and emoji-only lines refused, and the unknown-character refusal, against the closed 2026-08-15 list | Folded: a wordless line founds at the empty residual; the unknown-character refusal is put to Alex as a fourth refusal (menu item 5) |
| 2 | Tradition left to the seed's draw in two cases ruling 3 may forbid, filed as a call | Folded: menu item 1 |
| 3 | The cap's wording claimed graphemes while counting code points | Folded: menu item 3 counts code points and says why |
| 4 | "island's" becomes "islands", an archipelago | Folded: the possessive rule (menu item 6) and a lexicon test over the class |
| 5 | Removing every format character from the display form breaks emoji sequences and Persian words | Folded: the display form removes only direction controls and the byte-order mark |
| 6 | Doubly covered convergence pins and a sweep no mutation reds | Folded: display form and words pinned separately; the sweep asserts the fixed point and the display form's content |
| 7 | One-pass versus re-evaluated contests not distinguished | Folded: one pass, "cold atolls and fjords" in test 4, named in menu item 4 |
| 8 | An unknown culture ID in `generateWorld` unspecified | Folded: `RangeError`, tested |
| 9 | Culture IDs become identity | Folded: the rulebook bullet, the README sentence and the spec section say an ID is never renamed |
| 10 | Numbers in a spec whose header forbids them; cleanup rules not page-citable | Folded: the constants and plain-language rules are exported data; the spec section carries no numbers |
| 11 | No red order | Folded: "Build order" |
| 12 | The determinism guard sees one instance of the class | Folded as a filed follow-up lint rule, once the Issue #779 lane releases `eslint.config.ts` |
| 13 | `surveyItemFor` does not exist | Folded: `surveyItemFrom` |
| 14 | "Only seed 42 guards see it" overstated | Folded: `test/render/place-manifest.test.ts` named |
| 15 | Greek final sigma | Folded: each word lower-cased on its own, tested |
| 16 | Singular and plural gaps in the draft | Folded: thirteen singulars added (202 entries) |
| 17 | "A whole number of thousandths" could not fail | Folded: dropped from test 8; the rounding is pinned by the sheet's literal values |
| 18 | The departure count disagreed with itself | Folded: three departures and one merge |
| 19 | `cultureById` already exists in `src/society/philology.ts` | Folded: named in the design; the PR says so |
| 20 | The checksum message contradicts menu item 2's recommendation | Folded: the message follows the ruling |
