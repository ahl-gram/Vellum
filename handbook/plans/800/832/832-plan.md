# Issue #832 plan: a language model helps grow the founding word list, inside version 1

Issue #832 (Write the Age), epic Issue #278, sequenced after Issue #831 (PR #834, main `d9df388e`) and
before Issue #393, whose public link locks version 1 (Issue #391 ruling 2,
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088029887). Read 2026-10-09 at `d9df388e`:
Issue #832's body and its two comments (Alex's rulings, below), Issue #391's body and four comments,
Issue #831's body and six comments, Issue #390's body and four comments, Issue #278's body and its
comment, Issue #393's body and five comments. The plans that built the code are
`handbook/plans/391/391-plan.md` and `handbook/plans/831/831-plan.md`, which this one does not edit.
This version folds in `vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings (their
dispositions are the last two sections).

## Alex's rulings on this plan's menu (2026-10-09), and what they change below

The record is https://github.com/ahl-gram/Vellum/issues/832#issuecomment-6092062097. The body of this
plan is the one the menu came from and is kept as it stood; where a ruling departs from the
recommendation, this section is the build and the text below it is not.

- **Items 1, 2 and 3: "temple", "temples", "shrine", "shrines" and "black pines" all stay** (1 and 2
  against the recommendation). So no covenant row is re-pinned, no Issue #831 test moves to "olives"
  and no founding test moves to "pagodas": `test/world/founding.test.ts` and
  `test/world/founding-climate.test.ts` are untouched, and build step 3 shrinks to item 4c.
- **Item 4: only 4c is taken.** "atoll" alone founds one island, keeping its warmth and its Polynesian
  names; "atolls" stays a chain. 4a and 4b are declined: every word they named stays as it is.
- **Item 5: four classes join**, each word setting the tradition it matches: the house's own names for
  its traditions and their plain forms, the other historical peoples, the old chart names, and,
  against the recommendation, the modern countries and other real places the menu named ("norway",
  "greece", "japan", "hawaii", "scotland", "olympus", "kremlin", "arabian nights", "prussian").
  "norway", "greece", "japan", "hawaii" and "scotland" were not among the words the gate's readers
  read, so each steers only its tradition, as the ruling says. Living peoples ("maori", "tatars",
  "bedouin", "cossacks") and the old names with a slur's history ("huns", "tartars") stay out.
- **Item 6: no word written in another language joins** ("ritter", "schloss", "freiherr", "sakura"
  included), as recommended.
- **The orchestrating session's condition**: the 157 delegated additions, measured against the
  recommended list, are re-measured against the list as ruled. Measured (`832-recheck.mts`): not one
  addition's gains, clash losses or swallows change, none moves a pinned sentence, and none fails call 8's
  margin, so all 157 join and nothing goes back to Alex. Item 5's 45 names, each measured alone on top of
  them, move no pinned sentence and cancel no word that steered.
- **The list as ruled** is 404 entries: today's 202 ("atoll" re-steered), 157 delegated, 45 names.
  Over the 1,428 sample sentences it steers 819 (today 763), changes 219 worlds, moves no old checksum
  input or pinned sentence, and leaves 4 sentences where an added word loses a genuine clash ("Rainforest
  coast ... cold sea"). Written as source and run through Prettier, the land words take 224 lines and
  the peoples' words 277, so the split into `src/world/founding/lexicon-peoples.ts` stands.
- **Build order, as ruled**: the plan archive; the split, proved by the checksum; item 4c, red first on
  a new covenant row ("a lone atoll" founds one island) and the checksum; then use 4's held-out round
  and the kept sample, chosen over the discovery corpus and the held-out round and read by use 4's two
  readers, before the sample test is written red first and the 202 additions are made; then the
  doctrine clause, the checks, the guard prover, the calls comment, the PR and the cold skeptic.

## Alex's rulings (2026-10-09), and the conditions on them

- https://github.com/ahl-gram/Vellum/issues/832#issuecomment-6091307674: **all four uses run, in
  order**: use 3 (audit the list), then use 1 (find the gaps) and use 2 (synonyms, kept to words in
  the house voice rather than a thesaurus list), then use 4 (expectation against outcome) as the
  closing check over the finished list. **The word candidates are delegated**: the lane's recommended
  additions and changes are ruled as recommended, with no word-by-word sitting.
- The orchestrating session's conditions on the delegation (posted labelled as its own): the pull
  request lists every addition and change, grouped by axis; a candidate the lane cannot call either
  way, or one that would move a world an existing covenant row pins, still comes to Alex as a menu
  item, not decided under the delegation.
- https://github.com/ahl-gram/Vellum/issues/832#issuecomment-6091356286: **the sentences are written
  in a session** and saved as data, with no API key, no dependency and no model-calling script; **a
  curated sample of a couple of hundred reviewed sentences is kept as a test**, each pinning its world
  beside the covenant tests, and the rest is not kept; **the lane proposes the size and spread** (in a
  session, roughly a thousand to two thousand sentences, with a stated stopping rule; plain, poetic and
  archaic registers, lengths up to the 120 cap, a few other languages); **the lane names its new files**
  and lists each in the PR body for Alex to rename at review.

**How this plan reads the covenant condition.** Every change to or removal of an existing entry goes
to Alex, not only one whose effect reaches a row of `SHEET` in `test/world/founding-covenant.test.ts`:
the 202 words were ruled as a whole (Issue #391 ruling 7), and changing an entry moves the worlds the
list checksum (the test "the covenant: every word on the list founds what version 1 founds") pins for
it. They go grouped, so he rules a handful of items rather than words. An addition is delegated when
the gate below shows it moves no existing pin and the lane can call it.

**Where the lane stops.** Once, after uses 3, 1 and 2 and the gate, with one menu holding every item
the conditions send to Alex (use 3's changes, the two classes below, and any addition the gate could
not clear). Then again only at the end, where use 4's mismatches come to him with the pull request;
use 4 changes nothing in the list on its own.

## What has been measured, in this session

**The writers.** Fresh in-session agents, each told to use no tool but one write of its answer and
never shown the list, wrote founding sentences against a stand-in page prompt ("Write the founding
sentence of your world."). Round 1 was seven writers (plain everyday, fantasy readers, a period
register, terse and casual, dense lines of 80 to 120 characters, writers told the five things a
sentence can steer but not which words do it, and other languages); every later round is eight
writers of about 30 each (the same registers, poetic and archaic apart, and the other-language writer
writing half in its own script and half in non-native English). A batch takes 16 s to 2 min, all in
parallel. Rounds 2 to 5 were written while the plan skeptic read this plan; nothing in the method
changed but the stopping rule. Exact duplicates (equal cleaned words) are dropped, keeping the earlier.

**The instrument.** `832-founder.mts` (scratchpad) runs `foundWorld`'s procedure (the scan, the clash,
the climate credit, the overrides) over a word list passed in, importing the cleanup, the hash, the
constants and `defaultRecipe` from the tree rather than copying them. On every run `832-measure.mts`
proves it deep-equal to the real `foundWorld` over the whole corpus, the 62 sentences pinned in
`test/world/founding*.test.ts` and the 404 inputs of the list checksum, whose hash both give as
`3678728154`, and exits non-zero on any difference (1,674 inputs at five rounds). It reports a change to
a founding's world (seed or overrides) apart from a change to its record only (`steered`, `contested`).

**How far today's list steers.** Over the six discovery rounds, 763 of 1,428 distinct sentences steer
at least one setting (53%). By register: told the settings 177 of 196, dense 139 of 200, the period and
archaic registers 96 of 194, poetic 70 of 147, fantasy readers 100 of 198, plain everyday 89 of 196,
terse 68 of 192, other languages 24 of 105. With every use 1 candidate added at its proposed steer,
58% would; most sentences that steer nothing speak of things no setting covers.

**What fell to the chart number.** A word in `contested` is a listed word that lost a clash, not a gap
(recon S1), so the ranking counts only words outside every recognised phrase, and two-word runs beside
single words. It is dominated by function words and by meanings with no setting ("mountains", "river",
"forests", "kingdom", "empire", "dragons"); the count of distinct words never flattens (1,221 at 325
sentences), so the stopping rule reads coverage, not vocabulary.

## Use 3 has run: the audit of today's 202 entries

**Method.** Three fresh readers, each given the five settings with the ten traditions described as
`src/society/names.ts` describes them, and the 202 phrases in a different shuffle, never what any
phrase steers, said per phrase and per setting what an ordinary reader expects, or nothing, with a note
where the reading is split. The reading is the majority of three per setting (`832-audit.mts`). Each
entry is then: agree; **overreach** (it steers a setting the majority reads as silent); **surprise**
(the majority reads another value); **underreach** (the majority reads a setting it does not steer).

**Result.** 163 of 202 agree. 39 differ, five of them on two settings: 23 overreach, 1 surprise, 20
underreach findings.

**What the lane recommends.** Overreach and surprise are changes. An overreaching entry that steers one
setting is dropped, since without that setting it steers nothing; it is not re-steered to a setting
the readers underread, because that adds a meaning, and with it new clashes, to an existing word.
Underreach is kept as it is: the narrower reading is the honest floor (a tradition word that gained a
climate would become one of Issue #831's climate words that settle name clashes), and it is listed in
the PR as considered and kept. Every change goes to Alex, grouped as the menu below.

## Use 1 and use 2: the corpus, the stopping rule, the synonyms

- **A round** is eight fresh writers, about 225 sentences after duplicates. Every writer is new.
- **Each round is founded, then sorted by machine** (`832-sort.mts`) before any word is read by hand:
  a fallen word or two-word run that is a plural, a singular, a closed or a hyphen-split form of a
  listed entry ("winters", "viking", "city states") is flagged as a variant; a word on a fixed
  function-word list is noise; the remainder seen by two or more distinct writers is classified by hand.
  A second pass ranks two-word runs that SPAN a listed word ("long island chain" founds a single island
  today, and `looseRuns` breaks its run at "island"), so a phrase refining a listed word is seen.
- **The hand classes**: (a) **a candidate**, whose dominant reading is one value of a setting that
  exists; (b) **a meaning with no setting** (relief, rivers and lakes, forests, polities, creatures),
  which stays a chart-number word and is listed for Alex as a finding, since a new setting is engine
  work he schedules; (c) **a ruled-out or witness word** (the gate, step 2); (d) noise (names, typos,
  words of other languages).
- **The stopping rule reads coverage.** After each round, the candidates the round newly found (class
  (a), seen by two or more writers, with the lane's proposed steers) are added to today's list and every
  earlier round's candidates, and the share of the cumulative corpus whose founding they change is the
  round's yield. **The rounds stop when two consecutive rounds each yield under 1 percent**, with a
  floor of 1,000 sentences and a ceiling of 1,760, so that use 4's held-out round keeps the total
  inside Alex's 2,000. One percent is the point where another round of about 225 sentences returns about
  two sentences a new word would steer, fewer than the gate's own readers disagree on; two rounds in a
  row so one quiet round is not luck. Measured (`832-coverage.mts`): rounds 1 to 6 yield 12.6, 5.6,
  2.3, 1.3, 0.99 (12 of 1,208) and 0.6 percent (8 of 1,428), so **the rule fired after round 6, at
  1,428 discovery sentences**. The 1 percent threshold was set after rounds 1 to 5 were in, when the
  vocabulary rule the plan skeptic refuted was replaced, so round 5 passing it by 0.01 point is a
  threshold chosen with the curve visible; round 6, at 0.6, was the round the rule was set before. The yield of every round is reported, which is the curve the rule reads.
- **Use 2.** Five fresh writers, one per setting family (shape; climate; land; coast; the ten
  traditions), each shown that family's values with today's words for them, asked for the forms an
  antique chart's reader would use: archaic and poetic words, old geographical and nautical terms, set
  phrases, at most fifteen per value, none holding a small word, none a modern coinage or a modern
  country. They are kept to the house voice (`handbook/specs/ui-design.md`, The voice: "a period
  register"), not a thesaurus list, and enter the same gate.

## The gate every addition passes

Each candidate is measured alone against the list as the menu's recommendations would leave it, then the
accepted set together (`832-pool.mts`, `832-gate.mts`, `832-final.mts`).

1. **The house's shape rules**, as `test/world/founding-lexicon.test.ts` holds them: already in the
   cleaned form; not a phrase already listed; no small word in it; no subject steered twice; land and
   coast take the existing strengths only (the type checker holds that).
2. **Not a ruled-out or witness word.** Ruled out: "iron" and "iron harbors" (Issue #391 ruling 7), and
   "city" alone, "great", "broken", "torn", "huge", "small" (the 391 plan's words left out on purpose,
   built under ruling 7). Witnesses, words the covenant relies on staying off the list: "land",
   "quiet", "towns", "long", "afternoon", "kingdom", "waste", "towers", "seas", "lighthouse", "harbors",
   "world", "stone", and the 56 `NOT_SMALL` words. A candidate that IS one of these and that the lane
   would still recommend goes on the menu; otherwise it is dropped and named in the PR. A longer phrase
   that merely contains one ("broken coastline") is judged by step 5.
3. **The blind reading, on all five settings.** Three fresh readers read the candidates shuffled among
   60 of today's entries, never told which are which, exactly as in use 3. A candidate steers what the
   majority reads, on every setting the majority names; a candidate the majority reads as saying
   nothing is dropped. Where that differs from the lane's proposal, the reading wins, and every such case
   is read by hand. **Calibration:** the same readers read 45 of the 60 known entries as today's list
   steers them, which is what a reading is worth. A plain climate word also brings the climate table's
   tradition in a sentence naming none (Issue #391 ruling 1); that is the ruled consequence and is not
   counted against the word, or no climate word could ever join.
4. **The measured effect** over the whole discovery corpus. A word **seen** in the corpus (it steers two
   or more sentences) joins when its gains (sentences where it newly steers) are more than twice its
   losses (sentences where a word that steered before stops because it starts a clash), every loss read
   by hand; a margin thinner than that is inside the readers' noise. A **swallow** (a listed word
   absorbed into the new, longer phrase, as "island" into "island chain") is counted apart, not as a
   loss; a phrase that only swallows a listed word and steers exactly what that word steers adds
   nothing and is dropped. A word **unseen** in the corpus has no measured gain at all, so it joins only
   when all three readers agree on every setting, none calls it obscure, and it is period vocabulary of
   the kinds the list already holds: an old geographic, nautical or climate term or set phrase ("isle
   strewn", "ultima thule", "sea lochs", "waters receded"), or a historical title, institution,
   building, vessel or warrior of a tradition's own past ("caliph", "khanate", "acropolis", "dragon
   ships"). Thesaurus rarities ("frore", "gelid"), modern objects, dress, food and customs ("kimono",
   "samovar", "cacao"), and a god's, hero's or festival's own name ("odin", "quetzalcoatl", "beltane")
   stay off. That is Alex's ruling 1 ("words in the house voice rather than a thesaurus list") made a
   rule.
5. **No existing pin moves**: the old checksum inputs and the 62 pinned sentences (as the menu leaves
   them), founded with the candidate, equal their founding without it, world and record. A candidate
   that moves one and that the lane would still recommend goes on the menu; otherwise it is dropped and
   named in the PR.
6. **Together.** The accepted set is re-measured as one list over the corpus and the pins: any sentence
   where two new words clash, or where the combined founding differs from what the single measurements
   predict, is read by hand and the weaker word dropped.
7. **Names of real peoples and places** are held out of the delegated set whatever the reading, and
   go to the menu as classes (item 5); so are **words of another language written as such** (item 6).
   A word is borrowed, and stays delegated, when it is in ordinary English use ("caliph", "daimyo",
   "khagan", as "jarl" and "samurai" already are); "ritter", "schloss", "freiherr" and "sakura" are
   not. A word of myth or classical geography that names no real land or people ("hyperborean") and an
   English climate adjective ("antarctic", as "arctic" already is) stay delegated.

**Result.** 321 candidates were read (55 from use 1, the rest from use 2 and item 5). 277 passed the
reading and the measurement; under the rules above **157 join under the delegation** (34 seen in the
corpus, 123 unseen period words), 46 are held for item 5 and 4 for item 6, and the rest are set aside
with their reasons (`out/832-gaps/gate.tsv`). Together the 157 change 176 of the 1,428 sample worlds, move no old checksum
input and no pinned sentence, and leave 3 sentences where an added word loses a clash, none of them
undoing a single measurement. With the menu's recommended drops, 734 of the 1,428 sentences steer; with
the additions, 785; with item 5's recommended classes as well, about 820.

Three calls the reading forced, each read by hand:
- "mediterranean" read as the temperate climate and Greek names; it steers the names only, because
  writers so often put "warm" or "sunny" beside it that a climate of its own cancels theirs (its one
  measured loss is exactly that).
- "pine forests" read as temperate, not cold, and lost to "cold" or "snow" in 4 of its 10 sentences; it
  is dropped. "equator", "polis" and "harbour city" fall to the margin.
- "city states", "citystates" and "free cities" are dropped: a plural names several cities and the
  setting is a single city-state, and 3 of 8 "city states" sentences were island chains it cancelled.

Two added words set both a climate and a people, and so join Issue #831's class of climate words that
settle a clash over names: "camels" and "burning sands" (warm, Persian names), beside "desert",
"dunes", "taiga" and "atolls". Ten more steer two settings without a climate ("skerries", "firths",
"sea lochs", "hanse town" and the like), which that rule does not reach.

## The menu (the one stop, after the gate)

The full text, measured over all 1,428 sentences, is `out/832-gaps/menu.md`; `menu-measured.tsv` holds
the numbers. In short:

1. **"temple", "temples" (Greek names): drop** (recommended). 23 sample worlds move; three covenant
   rows ("a desert of sultans and temples" and its siblings) keep climate and Persian names but take a
   new chart number and are re-pinned; the Issue #831 tests that use them move to "olives".
2. **"shrine", "shrines" (Japanese names): drop** (recommended). 7 sample worlds move; no covenant row;
   "a cold land of shrines" (`test/world/founding.test.ts`) would take Norse names, so its test moves to
   "pagodas"; four pinned records change.
3. **"black pines" (Norse names): keep** (recommended). Dropping moves three covenant rows, the epic's
   own sentence first.
4. **The audit's other changes, no pinned world moves** (recommended, each set whole or in part): 4a
   drop "cherry", "chiefdom(s)", "fire peaks", "canoe(s)", "lagoon(s)", "jade", "obsidian",
   "meadow(s)" (27 sample worlds; the Polynesian names keep only "outrigger(s)" among words naming that
   people alone, and lose "fire peaks" and "chiefdoms", the code's own words for that people); 4b drop
   "endless", "boundless", "sandy", "beach(es)", "verdant" (46 sample worlds, mostly "endless"); 4c
   "atoll" founds one island. Not re-steered to a climate: that would add a meaning, and clashes, to an
   existing word, and the climate table would give the same names in a bare sentence anyway.
5. **Names of real peoples and places, by class**: the house's own names for its traditions and their
   plain forms, in; other historical peoples the traditions draw on ("teutonic", "celts", "aztec"), in;
   old chart names for real lands ("muscovy", "tartary", "terra australis", "spice islands"), in; old
   names with a slur history ("huns", "tartars"), out; living peoples outside the house's names
   ("maori", "tatars", "bedouin", "cossacks"), out; modern countries and other real places ("norway",
   "japan", "olympus", "kremlin"), out.
6. **Words of other languages written as such** ("île", "Inseln", "fjörd"), not titles English has
   borrowed: none joins (recommended), including the four the gate passed ("ritter", "schloss",
   "freiherr", "sakura"); 24 of 105 other-language sentences steer today, 22 through their English half.
7. **Additions the gate could not clear: none.**

## The list edit (after the rulings)

- **Two files, measured.** The word table with the recommended outcome (the menu's drops, the 163
  additions and item 5's recommended classes) is 378 phrases; written as the source would hold it and
  run through Prettier at width 120, it takes 458 non-blank lines in one file, over the 400 cap. Split
  where the list already divides (every group that names a people comes after every group that does
  not), the land words take 219 lines and the peoples' words 249. So `src/world/founding/lexicon.ts`
  keeps its constants, types, `FOUNDING_RULES` and the shape, climate, land and coast groups, and a new
  `src/world/founding/lexicon-peoples.ts` holds every group that names a people, with its own small
  group helpers, importing only types from `lexicon.ts`. `lexicon.ts` builds
  `LEXICON = [...its own groups, ...PEOPLE_WORDS]`, which is today's order exactly, so the list checksum
  does not move from the split alone, no import elsewhere changes, and the
  `handbook/specs/engine-invariants.md` sentence that the constants are "the exports of
  `src/world/founding/lexicon.ts`" stays true. The split lands as its own commit, proved by the checksum
  staying `3678728154`. The name is the lane's under Alex's ruling 5 and is listed in the PR for him to
  rename.
- Each addition is appended to its group, or a new group beside its siblings for a new combination of
  steers; the ruled drops and re-steers are made in place. `oneWordPerOtherPeople` in
  `test/world/founding-climate.test.ts` takes each tradition's first tradition-only word, so where a drop
  removes that first word (the `tsuren` group starts with "shrines"), the sweep's witness moves with it,
  which is correct: it reads the list.
- `FOUNDING_VERSION` stays 1; `FOUNDING_RULES` does not change, since no rule changes; `normalize.ts`
  and `found.ts` do not change.
- New words that set both a climate and a people enter Issue #831's sweeps in
  `test/world/founding-climate.test.ts`; that file takes 0.11 s at `d9df388e` and is timed again.

## Use 4 last: the closing check over the finished list

- **A held-out round**, written after the list is final by eight fresh writers in the same registers
  (about 240 sentences), never used to choose a word.
- **Two blind readers** each state, per sentence, what a reader expects on each setting, given the five
  settings and the ten traditions and not the list.
- **Scored on both lists**: today's list at `d9df388e` is the control. Per setting, an expectation both
  readers share is honored, missed (fell to the chart number) or contradicted; a setting the founding
  set where both readers expect nothing is **overreach**, with the climate table's tradition counted
  apart as ruled. Counts for both lists side by side, by register.
- **Every mismatch is listed** (the sentence, what both readers expect, what each list founds) with the
  lane's recommendation, a list fix or "the surprise stands", and goes to Alex as the end's menu with
  the pull request. Use 4 changes nothing in the list itself: it is the closing check (ruling 1), its
  round chose no word, and a fix it suggests is built only on his ruling, red first.
- The page is `out/832-check/`.

## The kept sample (Alex's ruling 3)

- **About two hundred sentences**, chosen after the list is final from the discovery corpus and the
  held-out round, by greedy coverage: every map type, climate, land and coast value; every tradition,
  through a tradition word, through a climate word's own tradition and through the climate table; **the
  climate credit settling a clash over names** (Issue #831), where a natural sentence does it, and
  otherwise that mutation is left to `test/world/founding-climate.test.ts`, which already pins it, and
  the PR says so; a clash on each setting; a word losing only its clashing meaning; the longest phrase
  winning and a swallow; a hyphen, a possessive and punctuation; a sentence steering nothing; off-theme
  and gibberish lines; other languages; every register; lengths up to 120. Then filled by register. A
  rule no natural sentence exercises is named in the PR, not written in by hand. **Reviewed** means use
  4's two readers also read every chosen row, so each kept row's world has been set beside what two blind
  readers expect of it, and a row whose founding contradicts them is either swapped for another covering
  the same classes or kept with its surprise named in the PR.
- **The data** is `test/world/founding-sample.json`, one row per line: `sentence`, `seed`, `residual`,
  `overrides`, `steered` (the phrases that steered, in order: the record Issue #392 and Issue #393 read).
  JSON because two hundred rows of up to 120 characters break across several lines each under Prettier
  at width 120 and would put a `.ts` file past the 400-line cap; JSON under `test/` is not collected by
  `node --test` (`test/repo/test-collection.test.ts` already holds `test/fixtures/data.json` as no
  stray), and Prettier ignores it. It is the first tracked file under `test/` that is not a `.test.ts`.
  Every row founds: a row Issue #392 would turn into a refusal by shrinking the cap is that pull
  request's to re-pin, as it re-pins the covenant's 120 test.
- **The test** is `test/world/founding-sample.test.ts`. It reads the JSON with `readFileSync` and
  `JSON.parse` and checks each row's shape at run time (a string sentence and residual, a whole-number
  seed, an overrides object, a string array) before any assertion, so a malformed row reds by name. Then,
  in the covenant's form, for each row: the founding is ok and version 1, its residual is the pinned
  residual, the pinned seed (a literal, never computed from `foundWorld`) is `hashString` of that
  residual, the founding's seed is the pinned seed, its overrides deep-equal the pinned ones, and its
  steered phrases equal the pinned list, with the covenant's lock message. One more test: the pinned
  rows together reach every map type, climate and coast value, every `CULTURE_IDS` member, and both
  land directions, a land direction read by recomputing the row's own land share (`defaultRecipe(seed,
  { mapType })` times each `LAND_FACTOR`) rather than assumed, so a trim that deleted every "less" row
  reds.

## Files

- Changed: `src/world/founding/lexicon.ts`; `test/world/founding-covenant.test.ts` (the list checksum
  re-pinned; item 1, if ruled, re-pins its three rows); `handbook/specs/engine-invariants.md` (one
  clause, below).
- Changed only as the menu is ruled: `test/world/founding.test.ts` (item 2),
  `test/world/founding-climate.test.ts` (items 1 and 2).
- New: `src/world/founding/lexicon-peoples.ts`, `test/world/founding-sample.test.ts`,
  `test/world/founding-sample.json`; the archive `handbook/plans/832/832-plan.md`.
- Untouched: `src/world/founding/found.ts`, `src/world/founding/normalize.ts`,
  `src/society/culture-ids.ts`, every site file, `e2e/`, `test/e2e/`, the `test/site/` tests, the
  errata and every spec but the founding section (the parallel Issue #779 part 2f lane's ground).
- Scratch only, never tracked: `832-founder.mts`, `832-measure.mts`, `832-candidates.mts`,
  `832-audit.mts`, `832-sort.mts`, `832-rounds.mts`, `832-coverage.mts`, the corpus and the readers'
  tables. The scripts, the audit, the ranking and the stopping curve go into a PR comment; the corpus is
  on the `out/` page (ruling 3: the rest is not kept, and two thousand sentences exceed a comment's
  65,536 characters).

## Build order (phase two), with each first red

1. Copy this plan, as the rulings leave it, to `handbook/plans/832/832-plan.md`; first commit; push.
2. The peoples' groups move to `src/world/founding/lexicon-peoples.ts`, no word changed; the list
   checksum stays `3678728154` and every founding test stays green, which is the move's proof. Commit.
3. **The menu's ruled changes, red first where a pin moves.** Re-pin the moved `SHEET` rows from
   `hashString` of their hand-derived residuals and re-point the tests the drops touch; against the
   step 2 list the re-pinned rows red on their seeds. The re-pointed Issue #831 and founding tests
   ("olives", "pagodas") found the same today as after, so they are not red first; they are proved by
   the guard prover's mutation instead, and the PR says so. Make the drops and re-steers; green; the
   list checksum reds; re-pin it. Commit, push.
4. **The kept sample, red first, for the additions.** Write `test/world/founding-sample.json` and its
   test from the instrument's founding under the final list; against the step 3 list (the right shape
   and the wrong behaviour) every row holding a new word reds on its residual, its overrides or its
   steered list, and the red line is pasted into the PR body. Commit.
5. Add the words; the sample goes green; the checksum reds; re-pin it. Commit, push.
6. Use 4 on the held-out round; its menu for the end. Re-choose the sample's rows over both rounds if
   the held-out round fills a coverage class the discovery corpus missed; commit.
7. The doctrine clause, format, lint; `vellum-guard-prover`; the calls comment; the PR; the cold skeptic.

## Tests, each with the mutation that must red it

1. **The kept sample** (`test/world/founding-sample.test.ts`): per row, residual, seed, overrides and
   steered list. Mutations: delete one added word from the list (its rows red); change a land strength
   (every row with `landFraction` reds); drop the possessive rule in `normalize.ts` (a row with "'s"
   reds, where one is in the sample); keep `-` as a word character (a hyphenated row reds); give the
   climate credit's word back only its kept meanings in `found.ts` (a row whose record lists a credited
   climate word reds, where one is in the sample). The spread test: delete every row naming one
   tradition, or every "less" row, from the JSON (it reds naming the gap). The shape check: a row with a
   string seed reds by name.
2. **The list checksum** (`test/world/founding-covenant.test.ts`), re-pinned: any entry added, removed
   or re-steered reds it; only its value moves.
3. **The re-pointed tests**, if items 1 and 2 are ruled: the Issue #831 clash and credit tests on
   "olives" and the founding test on "pagodas" red under the mutation each already names (always the
   climate table; no credit; a named tradition never outranking the climate), proved again because their
   sentences changed.
4. **Every other existing pin holds unchanged**: their mutations are theirs already.

`vellum-guard-prover` gets tests 1 and 3, committed first.

## Evidence

- The instrument's proof at the branch head: the copy over the final list equals the real
  `foundWorld` on the corpus, the pins and the checksum inputs.
- **No old world moved by an addition**: under the final list, every checksum input and pinned sentence
  of the menu-ruled list founds what it founds without the additions, world and record, so the checksum
  moved only for the ruled changes and because its input set grew.
- The audit, the gap ranking, the stopping curve and use 4's table (control against change, by
  register, with overreach), copied into a PR comment with the scripts.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`);
  `node --test test/world/founding-climate.test.ts` timed before and after. No e2e: nothing reaches a
  page, and the golden and every committed chart cannot move (`found.ts` and `generateWorld` are
  untouched).

## Doctrine and rosters this drags

- `handbook/specs/engine-invariants.md`, "A published founding version never changes": "the pins in
  `test/world/founding-covenant.test.ts` move with it" names `test/world/founding-sample.test.ts` too.
- No roster: a new test file and a JSON beside it join nothing by hand (`node --test` collects the test
  by name; the JSON is read only by its own test); `lexicon-peoples.ts` is inside the engine's type check
  and the world-generation lint block by its folder.
- For the PR body, for Issue #393's plan: a bigger list letters more cartouches (Issue #390 ruling 8),
  shows the "no word steered" line less (ruling 7), and sends more worlds to the vegetation plate
  through the climate credit (Issue #831 ruling 2); and a page that describes the traditions in the
  house's words is answered by item 5's words. For Issue #392: if it shrinks the 120 cap inside
  version 1, sample rows longer than the new cap become refusals and are re-pinned there.

## Calls made without a ruling, each with the rule it rests on

1. **The writers never see the list**, and get a stand-in page prompt, since Issue #393's page does not
   exist. Rule: a sample written by a writer who knows the list measures the list against itself.
2. **Three blind readers and a majority** for every reading (use 3 and the gate); two for use 4, an
   expectation counted only when both share it. Rule: one model's reading is one reader, and the issue's
   use 3 asks what each entry suggests "to a reader".
3. **Underreach is kept, and an overreaching entry is dropped rather than re-steered.** Rule: a second
   meaning on an existing word is a change that opens new clashes.
4. **No new setting.** Meanings with no setting stay chart-number words and are listed for Alex as a
   finding, not filed: a new setting is engine work he schedules.
5. **The kept sample is JSON**, for the line cap, and pins the steered phrases as well as the world;
   **the corpus is on the `out/` page**; the scripts, the audit, the ranking and the curve go into a PR
   comment.
6. **The peoples' groups move to `src/world/founding/lexicon-peoples.ts`**, for the line cap.
7. **Additions append to their groups.**
8. **The covenant condition is read wide** (every change to an existing entry goes to Alex), grouped
   into the menu.
9. **The unseen-word rule** (gate step 4) and the three reading calls ("mediterranean", "pine forests", the
   plurals of the one-city setting): Alex's ruling 1, "words in the house voice rather than a thesaurus
   list", made a rule; a word with no measured gain earns its line only as period vocabulary.

## Recon's findings and what became of each

| finding | disposition |
|---|---|
| S1 a residual ranking counts contested listed words, and one-word tallies miss phrases (blocking) | Folded: the ranking counts words outside every recognised phrase, two-word runs, and runs spanning a listed word |
| S2 the rules new words obey omit ruling 7's departures, the left-out words, Issue #831's calls and the shape rules (blocking) | Folded: gate steps 1 and 2; Issue #831's calls bind through the unchanged `found.ts` and its sweeps |
| S3 pins live in three files; the checksum moves on any addition; witness words must stay off the list (blocking) | Folded: gate steps 2 and 5, the menu's measured consequences, and the evidence that no old input moved |
| S4 a script needs no dependency | Moot: ruling 2, no script |
| S5 "antique register" is "a period register" in the spec | Folded: use 2 cites the spec's words |
| S6 three departures, not two, for clash avoidance | Noted; gate step 2 names all three |
| S7 Issue #831 has two ruling comments, a calls comment and a correction | Noted; all four bind through the code |
| S8 Issue #832 lacks the `epic:writetheage` label | For the dispatcher (labels are its) |
| U2 the 2026-10-09 ruling-out of a model interpreter is recorded nowhere | For the dispatcher; the epic's non-goal "No LLM" is read, as Issue #390's 2026-08-15 comment reads it, as binding at founding time, and Alex's ruling 1 on this issue runs use 2 knowingly |
| Open: changes and removals | Folded: the menu |
| Open: common meanings with no setting | Call 4 |
| Open: non-English words | Folded: menu item 6 |
| Open: the register for use 2 | Ruled: the house voice |
| Open: order against Issue #392's cap | Doctrine section, for Issue #392 |
| Open: the consequences of a bigger list for Issue #393 | Doctrine section, for Issue #393's plan |
| `lexicon.ts` headroom | The list edit, Size: the table moves |

## The plan skeptic's findings and what became of each

| # | finding | disposition |
|---|---|---|
| 1 | Phase two never stops again, though the conditions send uncallable or pin-moving candidates to Alex (blocking) | Folded: one stop after the gate holds every such item (menu item 7), and use 4's mismatches come to him with the PR; nothing the conditions name is decided under the delegation |
| 2 | The stopping rule cannot fire: a cumulative threshold of two writers always admits new words | Folded: the rule reads coverage (each round's new candidates change under 1 percent of the corpus, two rounds running), measured at 12.6, 5.6, 2.3, 1.3, 1.0 percent over five rounds |
| 3 | Menu item 4 misdescribed the lagoon and meadow re-steers; they open climate clashes and keep the table's names; the Polynesian words fall to two | Folded: lagoon(s) and meadow(s) are dropped, not re-steered; item 4a names the Polynesian loss and "fire peaks" and "chiefdoms" being the code's own words for that people |
| 4 | The gate and use 4 cannot see overreach, nor the tradition a new climate word brings | Folded: gate step 3 reads all five settings; use 4 counts overreach; the climate table's tradition is reported apart as ruled, since counting it would bar every climate word |
| 5 | Gate step 4 counts a swallowed word as a loss, and the ranking cannot see a phrase spanning a listed word | Folded: swallows counted apart and read by hand; a ranking pass over runs spanning a listed word |
| 6 | Use 4 changed the list after the closing check | Folded: use 4 changes nothing; its fixes go to Alex with the PR |
| 7 | The size arithmetic was best case only; a split is likely | Folded: measured (458 lines in one file, 219 and 249 in two); the peoples' groups move to `src/world/founding/lexicon-peoples.ts` as their own commit, proved by the checksum |
| 8 | The sample's "drop the credit" mutation has almost no natural row | Folded: a coverage class where a natural row exists, and otherwise that mutation stays with `test/world/founding-climate.test.ts`, said in the PR |
| 9 | Call 4 (no other-language words) is a class decision taken as a call | Folded: menu item 6 |
| 10 | Item 5 did not show its dividing line, the `draket` gap, or where "mediterranean" falls | Folded: item 5 restated on the house's own tradition names, "germanic" for `draket`, "mediterranean" in |
| 11 | The re-pointed tests do not red first | Folded: build step 3 says which red first (the re-pinned rows, the checksum) and that the re-pointed ones are proved by mutation |
| 12 | Numbers: 1,221 words not 1,241; item 1's four Greek temples were three; checksum inputs after drops | Folded: corrected; the inputs become 360 if item 4 is ruled whole |
| 13 | "Every corpus sentence an addition changed contains the phrase" cannot fail | Folded: dropped; the evidence keeps the check that can fail (no old input or pin moved) |
| 14 | The spread test's land check, the unchecked `covers` prose, and the record unpinned | Folded: land direction recomputed; `covers` dropped; the steered phrases pinned |
| 15 | The JSON's loading form and shape check unnamed; refusal rows | Folded: `readFileSync`, `JSON.parse` and a run-time shape check named. Rejected: a refusal row shape now, since every row founds and Issue #392 re-pins its own |
| 16 | The page omitted the corpus; the skeptic section was a placeholder | Folded: the corpus is on the page; this table |
