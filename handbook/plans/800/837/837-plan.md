# Issue #837 plan: the six founding-word questions, built as ruled, inside version 1

Issue #837 (Write the Age), epic Issue #278, a follow-up to Issue #832, whose PR #836 merged at main
`f5e7cd3e`; before Issue #393, whose public link locks version 1 (Issue #391 ruling 2,
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088029887). Read 2026-10-09 at `f5e7cd3e`:
Issue #837's body and its three comments, the rulings this one builds on (Issue #832's three ruling
comments, Issue #831's two, Issue #391's, Epic Issue #278's no-model ruling) and
`handbook/plans/832/832-plan.md`, which this plan does not edit. The branch was brought to main
`26709a42` (PR #835) before the build; that merge touched no file under `src/world/` or `test/world/`.
This version folds in `vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings (the last two
sections), and carries the one question the skeptic sent back to Alex (the menu below).

## Alex's rulings on this plan's menu (2026-10-09), and what they change below

The record is https://github.com/ahl-gram/Vellum/issues/837#issuecomment-6093086391. The body of this
plan is the one the menu came from and is kept as it stood; where this section adds to it, this
section is the build.

- **A, option 1: "camels" and "camel" give Persian names and no climate, as ruled, and "bactrian camels"
  and "bactrian camel" join, giving the steppe peoples' names (`ordai`).** Chosen knowing the two
  phrases have had no reader round of their own. They are appended, in that order, to the end of the
  `tongue("ordai")` group in `src/world/founding/lexicon-peoples.ts`, after "felt tent" (call 1's rule),
  so "steppe" stays that group's first word for `oneWordPerOtherPeople`. `LEXICON` goes from 467 entries
  to 467 (three dropped, four added). "Bactrian camels cross the cold steppe." founds a cold land with
  steppe names and is pinned as a covenant row: `["Bactrian camels cross the cold steppe.", 703928475,
  "cross", { band: "polar", culture: "ordai" }]`, red first (today it founds nothing). Mutations: delete
  "bactrian camels" (the row reds: "camels" and "steppe" cancel, Norse names); give "camels" its climate
  back (the phrase still wins the longest match, so this row holds; "camels and a camel" reds). The
  singular gets its own readable row, `["a bactrian camel", 2166136261, "", { culture: "ordai" }]`, red
  first (today "camel" alone matches and gives a warm land with Persian names); mutation: delete
  "bactrian camel".
- **B, option 1: the three inland-sea phrases are dropped, confirmed.** The two kept rows that then
  disagree with their readers on the shape ("Merchant republics squabble over a warm inland sea ..."
  and "Mostly land, a few inland seas, ...") are kept and named in the PR body.
- **Measured under the list as ruled** (`837-bactrian-tree`, the edit above plus the two phrases): the
  founding tests with the old pins red exactly the same 5 (295 tests); the dump of the 575 pinned inputs
  gives the same 570 identical, 4 worlds moved, 1 record only; no corpus or pinned sentence holds
  "bactrian"; the list checksum becomes `328613771`.
- Calls 1 to 5 stand, for Alex to overrule in the calls comment.

## The ruling

https://github.com/ahl-gram/Vellum/issues/837#issuecomment-6092671361 (Alex, 2026-10-09, relayed):
all six as recommended. With the note at
https://github.com/ahl-gram/Vellum/issues/837#issuecomment-6092513943, question 5 covers the singular
"camel" as well as "camels". The merge clearance is
https://github.com/ahl-gram/Vellum/issues/837#issuecomment-6092688097.

1. Drop "inland sea", "inland seas" and "land locked seas" (each a continent).
2. Keep "reef" and "reefs" (hot climate). No change.
3. Add "feathered serpents", with Nahuatl and Maya names (`tezcal`), beside the listed "feathered serpent".
4. Keep "winters" (cold climate). No change.
5. "camels" and "camel" set the Persian names (`veshari`) only, no climate.
6. Keep "galleys" (Greek names). No change.

So the code changes are the drop, the addition and the camel change; the three keeps change nothing.
Questions 1 and 5 go back to Alex once, with what the menu did not measure (the menu below); the build
waits for that answer, and is written here for the ruling as it stands, with what each other answer
changes.

## The list edit (as ruled)

- `src/world/founding/lexicon.ts`: the three phrases leave the `type("continent")` group.
- `src/world/founding/lexicon-peoples.ts`: "camels" and "camel" leave the
  `[band("tropical"), tongue("veshari")]` group, which keeps "dunes", "dune", "desert", "deserts" and
  "burning sands", and are appended, in that order, to the end of the `tongue("veshari")` group;
  "feathered serpents" is appended to the end of the `tongue("tezcal")` group. Additions append to
  their groups, as Issue #832's call 7 did.
- `LEXICON` goes from 467 entries to 465. `FOUNDING_VERSION` stays 1, `FOUNDING_RULES` does not change
  (no rule changes), and `found.ts` and `normalize.ts` do not change.
- Prettier folds the shortened desert group onto one line; `npm run format` writes it.

## What moves, measured

Measured at `f5e7cd3e` against scratch copies of `src/` and `test/` with exactly the edit above
(`837-dump.ts`, `837-diff.ts`, `837-corpus.ts`, `837-options.ts`, scratch only), and reproduced by the
plan skeptic in its own copies. Re-measured in the tree at the build.

**The founding tests against the edited list** (`node --test test/world/founding*.test.ts`, the old pins
unchanged): 295 tests, 5 red, and they are exactly the pins this pull request re-pins:

| pin | file | before | after |
|---|---|---|---|
| the list checksum, "the covenant: every word on the list founds what version 1 founds" | `test/world/founding-covenant.test.ts` | `1150161645` | `1096671429` |
| "Merchant republics squabble over a warm inland sea dotted with harbors, banks, galleys, and very expensive pirates." | `test/world/founding-sample.json` | continent, warm, Greek names; seed 275467094 | warm, Greek names, no shape; residual gains "inland sea"; seed 4238048873 |
| "Mostly land, a few inland seas, and a dry heat that never breaks." | `test/world/founding-sample.json` | continent; seed 3282603392 | nothing steered; seed 1423755014 |
| "Hearken, traveller: these are the lands of the Salt Kings, who drank the inland sea dry." | `test/world/founding-sample.json` | continent; seed 725513052 | nothing steered; seed 3718382739 |
| "Feathered serpents watch over a scatter of tropical islands." | `test/world/founding-sample.json` | archipelago, warm, Polynesian names (from the climate table); seed 2088089784 | archipelago, warm, Nahuatl and Maya names; residual "watch over scatter"; seed 2119591524 |

Each is "re-pinned by Issue #837's ruling" in the commit and the PR body.

**Every other pinned sentence.** `837-dump.ts` founds every double-quoted string literal in
`test/world/founding*.test.ts` and every row of `test/world/founding-sample.json` (575 inputs) under both
lists and compares the whole record: 570 identical, 4 worlds moved (the four rows above), and 1 record-only
change, "desert, oasis, camels, lost city", whose seed, overrides and steered phrases are unchanged
(only "camels"' own steers lose the climate), so its pinned row does not move and no pin sees the change.
What that dump does not see: the sentences `test/world/founding-climate.test.ts` builds from the list in
template literals, which are sweeps over the list rather than pins, and any file outside
`test/world/founding*`. The in-tree run of the founding tests with only the list edit applied, then the
full `npm test`, is the proof; the dump is a cross-check of the whole record. No file outside the
founding tests imports `src/world/founding/` (checked with `grep -rln` over `src`, `scripts`, `test` and
`e2e`; the other matches were `PHILOLOGY_LEXICON`, `FOUNDING_TEMPLATES` and a comment).

**Over Issue #832's corpora** (`837-corpus.ts`, read from the main checkout's
`out/832-gaps/corpus-founded.tsv` and `out/832-check/sentences.tsv`): of 1,428 discovery sentences, 15
worlds move (14 hold "inland sea" or "inland seas", 1 is the feathered serpents sentence) and 4 change
their record only (camels); of the 416 sentences of use 4's check (216 held out plus the 200 kept), 8
worlds move (4 held out, all "inland sea", and the 4 kept rows above) and 1 record only. Every moved
world only lost its continent or moved its chart number, or (feathered serpents) gained the named
tradition; none gained another steer.

**Shorter phrases the drop exposes** (plan skeptic finding 3). The matcher takes the longest listed
phrase, so with "inland sea" gone a phrase starting at "sea" or "seas" can fire: "the inland sea kings"
moves from a continent to Norse names ("sea kings"), "the inland seas receded" and "land locked seas
receded" from a continent to more land, "the inland sea swallowed the plains" to less land. No pinned
sentence and no corpus sentence holds one.

**The readers on "inland sea"** (plan skeptic finding 2). Question 1 gave the held-out round only: both
readers read a shape into 1 of its 4 "inland sea" sentences. Counting every sentence the readers read
(the 4 held out and the 3 kept rows), the drop removes 3 continents the readers did not read, loses 3
they did ("three warring kingdoms around inland sea", held out; "Merchant republics squabble over a warm
inland sea ...", kept; "Mostly land, a few inland seas, ...", kept, which most plausibly takes its
continent from "mostly land", not on the list, and already disagreed with its readers on the climate
and the land), and 1 was split ("Hearken, traveller ..."). The kept rows are re-pinned, not swapped:
swapping would re-curate the sample, which nobody ruled. The merge clearance means Alex does not read
the pull request before it merges, so this goes to him in the menu, not at review.

**The camel change on the menu's own example** (plan skeptic finding 1). "Bactrian camels cross the cold
steppe." founded nothing; as ruled, "cold" keeps the climate while "camels" (Persian) and "steppe"
(steppe names) still cancel each other's names, so the climate table gives Norse names: a cold world with
Norse names. All three of Issue #832's gate readers noted Bactrian camels as the steppe tradition
(`grep -i bactrian 832-gate-reader*.psv`: "Bactrian camels read steppe (ordai)", "Bactrian camels also on
the steppe", "Bactrian camels pull ordai"), while reading "camels" alone as warm with Persian names.
"camels" also leaves Issue #831's class of climate words that settle a clash over names: "camels and
pagodas" founded a warm world with Persian names and founds nothing as ruled. No corpus sentence holds
either case. The four options, measured on the same witnesses (`837-options.ts`):

| sentence | keep as today | names only (ruled) | drop both words | names only, plus "bactrian camel(s)" for steppe names |
|---|---|---|---|---|
| "Bactrian camels cross the cold steppe." | nothing | cold, Norse names | cold, steppe names | cold, steppe names |
| "a land of camels" | warm, Persian names | Persian names | nothing | Persian names |
| "desert, oasis, camels, lost city" (kept row) | warm, Persian | same world | same settings, new chart number (re-pinned) | same world |
| the 3 other corpus camel sentences | warm, Persian | same worlds | same settings, new chart numbers | same worlds |
| "camels and pagodas" | warm, Persian | nothing | Japanese names | nothing |
| "a bactrian camel" | warm, Persian | Persian names | nothing | steppe names |

## Tests, each with the mutation that must red it (as ruled)

1. **The four kept-sample rows, re-pinned** in `test/world/founding-sample.json` from hand-derived
   residuals (each seed is `hashString` of the residual, which the test checks). Red first: written
   against today's list, all four red on their residual. Mutations: put "inland sea" back (the two rows
   holding it red), put "inland seas" back (its row reds), delete "feathered serpents" (its row reds).
2. **A new covenant row** in `SHEET` (`test/world/founding-covenant.test.ts`) that reads the camel
   change in both forms with no clash in it (plan skeptic finding 4):
   `["camels and a camel", 2166136261, "", { culture: "veshari" }]`. Red first: today it founds a warm
   world with Persian names. Mutation: give "camels", or "camel", its climate back (the row reds on its
   overrides). The issue's Bactrian sentence becomes a covenant row only if Alex rules the world it
   founds (the menu).
3. **The list checksum**, re-pinned to the value measured in the tree. Red first: pre-pinned before the
   list edit, it reds on today's list. Mutations: each of the above, and putting "land locked seas" back,
   which no pinned sentence holds and only the checksum sees (plan skeptic finding 5).
4. **Every other pin holds unchanged**; their mutations are theirs already. `test/world/founding-climate.test.ts`'s
   sweeps read the list, so "camels" and "camel" leave its climate-word sweeps and join its
   tradition-word pool without an edit; `oneWordPerOtherPeople` still takes "oasis" for `veshari`, as
   "camels" and "camel" are appended after it.

`vellum-guard-prover` gets tests 1 to 3, committed first.

**What each other answer changes.**
- Question 5, drop both words: "camels" and "camel" leave the list (463 entries); the kept row "desert,
  oasis, camels, lost city" re-pins (seed 4201101846 to 800430443, residual "camels lost city", steered
  "desert", "oasis"); test 2 becomes the Bactrian row (cold, steppe names, seed 3502090232, residual
  "bactrian camels cross"); the checksum re-measured.
- Question 5, names only plus "bactrian camels" and "bactrian camel" for steppe names (467 entries,
  appended to the steppe group): test 2 stays, and a second covenant row pins the Bactrian sentence
  (cold, steppe names, seed 703928475, residual "cross"); the checksum re-measured.
- Question 5, keep as today: no camel edit; test 2 goes; the checksum re-measured.
- Question 1, keep the three phrases: no drop; the three "inland sea" kept rows do not move; the
  checksum re-measured.

## Build order

1. Copy this plan, as the answer leaves it, to `handbook/plans/837/837-plan.md`; the first commit; push.
2. The red pins: the re-pinned kept rows, the new covenant row or rows and the pre-pinned checksum. Run
   `node --test test/world/founding*.test.ts` and keep the red lines: exactly those red. Commit.
3. The list edit; `npm run format`; the founding tests green; the full `npm test` green. Commit, push.
4. Re-run the dump in the tree; `npm run check`, `npm run lint`, `npm run format:check`, `npm test`
   (then `npm run astro:generate`). No e2e: nothing reaches a page, and the golden and every committed
   chart cannot move (`found.ts`, `generateWorld` and every renderer are untouched, and nothing outside
   the founding tests imports the founding).
5. `vellum-guard-prover`; the calls comment on Issue #837; the PR (`Closes #837`); `vellum-pr-skeptic` cold.

## Doctrine and rosters this drags

None. `handbook/specs/engine-invariants.md`'s founding section names no word on the list and no count;
its sentence that the pins in `test/world/founding-covenant.test.ts` and `test/world/founding-sample.test.ts`
move with version 1 is what this pull request does. No new file joins a roster; the plan archive sits
outside the roots `test/repo/prose-paths.test.ts` walks.

For the PR body, for Issue #393: "camels" and "camel" are no longer climate words, so a sentence they
steer counts less often as founded mostly on climate (the vegetation plate's trigger, which Issue #831
ruling 2 feeds); and fewer sentences found a continent.

## Calls made without a ruling, each with the rule it rests on

1. **Where the moved and added words sit**: appended to their groups ("camels", "camel" after "dhow";
   "feathered serpents" after "eagle warrior"). Rule: Issue #832's call 7, additions append to their
   groups. The order moves the list checksum only.
2. **The readable camel pin is "camels and a camel"**, which covers both forms with no clash; the
   issue's Bactrian sentence is pinned only once its world is ruled. Rule: a re-steer gets a readable
   pin, as Issue #832's "a lone atoll" did, and a pin does not make a world Alex has not seen the
   covenant.
3. **The four kept rows are re-pinned, not swapped**, two of them now contradicting their readers on the
   shape. Rule: the sample is ruled curation (Issue #832 ruling 3), and the issue body already keeps
   rows the readers contradict, pinned as version 1 founds them.
4. **No spec line changes.** Rule: no rule changed, and the spec names no list word.
5. **The shorter phrases the drop exposes stay as they are**: no corpus or pinned sentence holds one.
   Rule: the longest-phrase rule is Issue #391's and unchanged.

## Recon's findings and what became of each

`vellum-spec-recon` at `f5e7cd3e`: every path, symbol, word and quoted founding the issue cites is
CURRENT; 4 STALE, all cosmetic; 1 UNVERIFIABLE. No STALE claim changed this plan.

| finding | disposition |
|---|---|
| STALE: "newly steered 13 discovery sentences" is "inland sea" alone; the three phrases steer 14 (13 and 1), and dropping them changes the settings of 12 | Noted; the PR body quotes this plan's own corpus count |
| STALE: the `out/832-check/` page holds questions 1 to 3 only | Noted; nothing here reads that page's figures for questions 4 to 6 |
| STALE: acceptance box 1 unticked, and the six questions read as open in the body | Superseded by the ruling comment; the body stays as written |
| UNVERIFIABLE: the cold review's quoted words | Its substance is PR #836's finding 5; nothing rests on the quote |
| For Alex: "Bactrian camels cross the cold steppe." founds a cold world with Norse names after the change | Folded: with the plan skeptic's finding 1, the menu's question 5 |
| For Alex: whether anything else joins version 1 before Issue #393 (the body's starting list) | Out of this issue's six; for the dispatcher, not built |
| For Alex: the reef words' own held-out effect was 2 overreach, not a tie | Ruled keep; not reopened; for the dispatcher |
| A merge clearance on the issue (comment `6092688097`) | Noted; this lane never merges, and the clearance is why the menu, not the review, is Alex's look |
| Issue #393's sequencing comment names Issue #832 and Issue #831, not Issue #837 | For the dispatcher |
| The spread test holds: continent is reached by 17 kept rows (was 20) | Folded into the evidence |

## The plan skeptic's findings and what became of each

| # | finding | disposition |
|---|---|---|
| 1 | The camel ruling rests on a consequence question 5's menu never measured, on its own example: as ruled, "Bactrian camels cross the cold steppe." takes Norse names, while the unrecommended "drop" takes the steppe names all three gate readers read (blocking) | Folded: the menu's question 5, with every option measured on the same witnesses; the Bactrian covenant row waits for the answer |
| 2 | "So Alex sees it at review" is false: the clearance merges on green; across all 7 sentences the readers read, the "inland sea" drop is a tie | Folded: the sentence is struck, and the full tally is the menu's question 1 |
| 3 | The drop exposes shorter phrases ("inland sea kings" gives Norse names) | Folded: in "What moves" and call 5; no pinned or corpus sentence holds one |
| 4 | The singular "camel" was pinned only by the checksum | Folded: the readable row is "camels and a camel" |
| 5 | Test 3's mutations never named restoring "land locked seas" | Folded |
| 6 | Closing Issue #837 closes the only home of the body's "Findings with no question now"; listed phrases whose other number is missing ("city states", "free cities", "headland", "snows") | For the dispatcher, beside recon's "anything else joins version 1" item; not built |
