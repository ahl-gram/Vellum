# Issue #839 plan: the founding-word candidates, inside version 1, before Issue #393 locks it

Issue #839 (Write the Age), Epic Issue #278, the home of the founding-word findings Issue #837 carried with no
question; before Issue #393, whose public link locks version 1 (Issue #391 ruling 2,
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088029887). Read 2026-10-10 at `20dd39a5`:
Issue #839's body and its two comments, and the rulings that bind it (Issue #391 6088029887; Issue #831
6089592497 and 6090010840; Issue #832 6091307674, 6091356286 and 6092062097, with that lane's calls
6092222667 and 6092493752; Issue #837 6092671361 and 6093086391, with its calls 6093133607; Epic Issue #278
6091985074). The method is `handbook/plans/832/832-plan.md` and `handbook/plans/837/837-plan.md`, which this
plan does not edit. This version folds in `vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings
(the last two sections).

## Alex's rulings on this plan's menu (2026-10-10)

The record is https://github.com/ahl-gram/Vellum/issues/839#issuecomment-6098085127: all three items as
recommended, A1, B1 and C1. "jungle temple" and "jungle temples" join (a hot land, Nahuatl and Maya names,
winning over other people words in their sentence, accepted); "german", "germans" and "ireland" join
("ireland" with Celtic names only); "middle sea" joins, its side effect on phrases starting at "sea" accepted.
The calls stand for Alex to overrule in the calls comment. So the build is the recommended list: 477 entries,
the six kept rows below re-pinned, the three covenant rows added, the checksum re-measured in the tree. The
body below is the plan the menu came from, kept as it stood.

## The ruling, and the conditions on it

https://github.com/ahl-gram/Vellum/issues/839#issuecomment-6097482413 (Alex, 2026-10-10, relayed): start now,
inside version 1; **the candidates are delegated** to the lane's recommendations, as Issue #832's words were;
item 4 (meanings no setting covers) is out of this pass. The orchestrating session's conditions send three
kinds of item to Alex as a menu instead: a candidate the lane cannot recommend either way; a change that would
move a sentence pinned in `test/world/founding-covenant.test.ts`; anything that reopens one of Alex's earlier
word rulings (temples and shrines kept; living peoples and slur-history names out; no words in another
language; "city states" and "free cities" left out on purpose). Three items below fall under the third, so
the lane stops once, with the menu below, and builds nothing before the answer.

## The method, reused from Issue #832

- **The instrument.** `839-founder.mts` (scratch) is `832-founder.mts` with its tree path moved to this
  worktree, nothing else changed: `found.ts`'s procedure with the word list as a parameter. `839-prove.mts`
  proves it deep-equal to the real `foundWorld` on 3,358 inputs (the 1,428 discovery sentences, the 416 of
  use 4's check, the 200 kept rows, the 380 string literals in `test/world/founding*.test.ts`, the 934
  checksum inputs) and re-derives the list checksum `328613771`. The corpora are `837-corpus-discovery.tsv`
  and `837-corpus-check.tsv`, read, never modified.
- **Predictions the instrument had to meet first** (`839-predict.mts`): "rains" as a mild climate cancels
  "monsoon" in "Monsoon rains drown the lowlands ..."; "moors" as a mild climate cancels "cold" on the kept row
  "I want a cold wet country of moors and lochs ..."; "many island" as a chain cancels the second "island" in
  "Many island, every island have his own king."; "mexica" alone clashes with "temples" and the climate table
  gives Polynesian names. All four hold.
- **One change from Issue #832's measure, which the third prediction forced.** Issue #832 counted a loss only
  when a lost phrase is not part of the new one, so a repeated word cancelled by the new phrase read as a
  swallow. Here a sentence also counts as a loss when a phrase that steered before is `contested` after.
- **Three blind readers** (fresh agents, told to use no tool but one write and never shown the list) read the
  27 candidates shuffled among Issue #832's 60 control words, each in its own order, per setting, with a note
  for a split, a second meaning or "obscure" (the prompt's word for "an ordinary reader would not know the
  phrase"). The traditions were given as letters with `src/society/names.ts`'s descriptions, not as their ids,
  because "thalassic" beside "thalassocracy" is read by its spelling. They read 49 of the 60 controls as the
  list steers them (Issue #832's rounds: 45 and 48). One reader skipped "jungle temple" and was asked to add
  that line; the 20 of its candidate lines printed before the re-ask are unchanged after it
  (`839-r1-before.txt` against the same grep of the rewritten file). The reading is the majority of three per setting (`839-gate.mts`),
  and every note a reader wrote is read by hand, not only the word "obscure".
- **The gate is Issue #832's** (its plan's gate steps 1 to 7, and call 9 of comment 6092222667): the shape
  rules; no ruled-out or witness word; the reading wins over the lane's proposal; a word seen in the discovery
  corpus (it newly steers two or more sentences) joins when its gains are more than twice its clash losses,
  swallows counted apart; a word unseen there joins only when all three readers agree on every setting, none
  calls it obscure, and it is period vocabulary of the kinds the list holds or a name in a class Alex ruled; no
  old pin moves (every literal in `test/world/founding*.test.ts`, every `SHEET` row, every current checksum
  input); then the accepted set together.
- **One rule added to that gate, the held-out test** (call 4). The held-out round (216 sentences written after
  Issue #832's list was final, two readers per sentence) is where item 1's words came from, so a gain there is
  not independent evidence. It is reported for every word, and it vetoes a word only where the word changes
  held-out sentences and honors what both readers expected in none of them. It rests on Alex calling that round
  "the fair test" for "inland sea" (Issue #837 ruling B,
  https://github.com/ahl-gram/Vellum/issues/837#issuecomment-6093086391), made general here; it removes
  "moors" and "fens", which pass Issue #832's gate as written.

## Every candidate, read and measured

Discovery: gains, clash losses (over 1,428). Held-out: what changes against both readers' expectations.
"Kept" counts the rows of `test/world/founding-sample.json` that move. No candidate moves an old pin.

| candidate | item | majority reading (3 readers) and their notes | discovery | held-out | kept | outcome |
|---|---|---|---|---|---|---|
| sand sea | 1 | hot, Persian and Arabic names (unanimous; one notes a few might read "more land") | unseen | climate missed to honored, 1 | 0 | joins (delegated) |
| sand seas | 1, other number | the same (unanimous; one notes "some readers would not know the term") | unseen | none | 0 | joins (delegated; call 6) |
| midnight sun | 1 | cold; Norse names by 2 of 3 | unseen | climate missed to honored, 1 | 0 | out: not unanimous |
| middle sea | 1 | Greek names (all three, each hedged: "readers split, some would say nothing", "else just an inland sea", "to many") | 1 gain | names missed to honored, 1 | 1 | menu C |
| moors | 1 | Celtic names (unanimous); all three note the Moors, a people | 6 gains, 0 losses | names nobody expected, 2; honored, 0 | 1 (seed only) | out: the held-out test, and a second meaning that names a people |
| moor | 1, other number | Celtic names; notes the Moors and "to moor" | 1 gain | none | 0 | out with "moors" |
| fens | 1 | Celtic names, all three "weak" | 5 gains, 0 losses | names nobody expected, 2; honored, 0 | 0 | out: the held-out test |
| fen | 1, other number | the same | 1 gain | none | 0 | out with "fens" |
| rains | 1 | nothing | | | | out |
| german | 1 | Germanic-imperial names (unanimous) | unseen | names missed to honored, 1 | 0 | menu B |
| germans | 1, other number | the same (unanimous) | unseen | none | 0 | menu B |
| ireland | 1 | one island, mild, Celtic names (unanimous) | 2 gains (seed only) | names honored, 1 | 2 (seed only) | menu B, Celtic names only |
| grasslands, grassland | 1 | nothing (steppe, prairie or savanna) | | | | out |
| mexica | 1 | Nahuatl and Maya names; 2 of 3 call it obscure | 0 gains, 1 loss | none | 1 | out: obscure, and alone it trades Greek names for Polynesian |
| thalassocracy, thalassocracies | 1 | Greek names; all three call it obscure | unseen | names missed to honored, 1 | 0 | out: obscure |
| headland | 2 | nothing | | | | out (Issue #832 call 17 stands) |
| snows | 2 | cold (unanimous) | 1 gain | none | 1 | joins (delegated) |
| black pine | 2 | nothing (Japanese black pine, or a dark forest) | | | | out |
| cherry blossom | 2 | mild, Japanese names (unanimous) | swallows "cherry" | none | 0 | out |
| mammoth | 2 | cold; all three note "also means huge" | 1 gain | none | 0 | out (Issue #832 call 17 stands) |
| city states, free cities | 2 | not read | | | | out (Issue #832 call 9 stands) |
| hesperides | 3 | Greek names; all three say ordinary readers would not know it | 1 gain | none | 1 | out: obscure |
| jungle temples | 3 | hot, Nahuatl and Maya names (unanimous; all three note some read Angkor or Southeast Asia) | 4 gains, 0 losses | names contradicted to honored, 2 | 1 | menu A |
| jungle temple | 3, other number | the same (unanimous, one reading re-asked) | unseen | none | 0 | menu A |
| mostly land | 3 | more land (unanimous; one notes it may imply a continent) | 1 gain | none | 1 | joins (delegated; call 7) |
| many island | 3 | a chain of islands (unanimous) | 1 gain, 1 loss | none | 1 | out: the margin |

## The menu (the one stop)

The three items are independent: no corpus or pinned sentence holds words of two of them, so their measured
effects add. Every option of every item keeps every covenant sentence where it is: measured over all twelve
combinations, no old pin moves (`839-options2.mts`).

**A. "jungle temples" and "jungle temple": a hot land with Nahuatl and Maya names.**
Today "jungle" gives the heat and "temples" gives Greek names, which Alex kept on Issue #832, so a sentence
about jungle temples founds a Greek-named land. As a phrase, the longer words win where they stand together,
and "temples" alone still gives Greek names everywhere else. That narrows where his "temples" ruling reaches,
so it is his call. Like "desert" and "taiga", the phrase sets a climate and names a people, so by Issue #831's
ruling it also wins over any other people word in the same sentence: "Greek priests tend the jungle temples"
and "olive groves around jungle temples" go from Greek to Nahuatl and Maya names, and "jungle temples of the
samurai" from the climate's Polynesian names to Nahuatl and Maya. All three readers noted that some readers
picture Angkor or Southeast Asia, which no tradition here names.
1. **Add both (recommended).** 4 of the 1,428 discovery worlds change their names to Nahuatl and Maya (one also
   its chart number); both held-out jungle-temple sentences go from contradicting their readers to honoring
   them; the kept row "Where jungle temples rise over hot lowlands and the priests speak in the tongue of the
   Mexica." keeps its chart number and climate and takes Nahuatl and Maya names, as its readers read it. The
   singular appears in no sentence and joins on the readers alone.
2. **Leave them.** Jungle temples keep Greek names, as Issue #832's closing check left them; the kept row stays
   a surprise.

**B. "german", "germans" and "ireland": a people's name and a country beyond the nine Alex named.**
Issue #832's call 11 added exactly the nine places his ruling named and left any more country to him, and
"german" sits beside the living peoples he left out (maori, tatars, bedouin, cossacks) as much as beside the
house's own tradition names he let in ("japanese", "greek", "persian", "mongol" beside "mongolic"). "german"
and "germans" would give Germanic-imperial names; "ireland" Celtic names only, the form every country on the
list has (as "scotland"), though the readers also read one island and a mild climate in it.
1. **Add all three (recommended).** "german" is the plain form of the house's own "Germanic", as "mongol" is of
   "Mongolic". 2 held-out sentences gain the names both readers expected ("long German titles", "like Ireland
   but bigger"); the two kept Ireland rows take new chart numbers and keep their Celtic names.
2. **Add "ireland" only.** "german" and "germans" stay out with the living peoples; the German held-out
   sentence keeps no names.
3. **Add none**, as call 11 left them.

"germany" and "irish" are not offered: no sentence in either round holds them and no reader has read them, so
after the lock they can only come as version 2.

**C. "middle sea": Greek names, as an old name for the Mediterranean.**
It names a real sea, as "mare nostrum" (in, as an old chart name) does, which Issue #832's gate sent to Alex
by class. All three readers read Greek names, each with a hedge: some readers would say nothing, and one reads
it as "just an inland sea" (Issue #837 dropped "inland sea"). It takes "sea", so where another listed phrase
starts at "sea" it now wins: "the Middle Sea kings" goes from Norse to Greek names, "the middle sea swallowed
the plains" from less land to Greek names, and "the middle sea lochs" from a ragged Celtic coast to nothing
(the names clash). No sentence in either round holds one of these.
1. **Add it (recommended).** The held-out "havens of the Middle Sea" gains the Greek names both readers
   expected (a kept row too); one discovery world, "'Twixt the burning south and the frozen north lay the
   Middle Sea, ...", takes Greek names where the cold climate's table gave Norse.
2. **Leave it.**

## What the delegation adds

| word | steers | placement | why it joins |
|---|---|---|---|
| snows | a cold climate | end of the cold group in `src/world/founding/lexicon.ts`, after "icefield" | named by Issue #839 item 2 as the missing number of "snow"; read cold by all three; one discovery gain |
| mostly land | more land | end of the more-land group, after "waters abated" | call 7: the counterpart of the listed "mostly ocean", read by all three |
| sand sea, sand seas | a hot climate, Persian and Arabic names | end of the desert group in `src/world/founding/lexicon-peoples.ts`, after "burning sands" | a term for a sea of dunes, read by all three as "burning sands" steers (call 6 for the plural's note) |

"sand sea" and "sand seas" set a climate and name a people, so they join Issue #831's class of climate words
that settle a clash over names, beside "desert", "dunes", "burning sands", "taiga" and "atolls"; the sweeps in
`test/world/founding-climate.test.ts` read the list and take them in without an edit. They take "sea" and
"seas" where a listed phrase starts: "the sand seas receded" goes from more land to a hot land with Persian
names, and "the sand sea swallowed the oasis" loses its less land (call 8). "jungle temples" and "jungle
temple", if ruled, join the same class.

## The list edit, as recommended (A1, B1, C1)

- `src/world/founding/lexicon.ts`: "snows" and "mostly land", as above.
- `src/world/founding/lexicon-peoples.ts`: "sand sea", "sand seas" as above; "german", "germans" at the end of
  the Germanic-imperial group, after "landsknecht"; "ireland" at the end of the Celtic group, after "selkie";
  "middle sea" at the end of the Greek group, after "hoplite"; a new group
  `[band("tropical"), tongue("tezcal")]` holding "jungle temples", "jungle temple", after the Nahuatl and Maya
  group (a new combination of steers sits beside its siblings, as the desert, taiga and atoll groups do).
  Additions append to their groups (Issue #832's call 7), so each tradition's first names-only word, which the
  Issue #831 sweeps take, stays first.
- `LEXICON` goes from 467 entries to 477 as recommended (471 with A2, B3 and C2). `FOUNDING_VERSION` stays 1;
  `FOUNDING_RULES`, `found.ts` and `normalize.ts` do not change. Prettier folds the longer desert group onto
  several lines; `npm run format` writes it. `lexicon-peoples.ts` stays well under 400 lines.

## What moves, measured

`839-options2.mts` builds every combination as the source would hold it and measures it
(`839-options2-out.json`). `839-tree-all` (a scratch copy of `src/` and `test/` with every addition applied
by `839-apply.mts`) runs `node --test test/world/founding*.test.ts` with today's pins: 298 tests, 7 red,
exactly the checksum and the six kept rows below; every Issue #831 sweep passes with the new climate words in
it. The plan skeptic reproduced both in its own copies.

| part | entries added | discovery worlds moved | held-out (today: honored 170, missed 62, contradicted 3, overreach 29) | kept rows moved |
|---|---|---|---|---|
| delegated | 4 | 2 | +1 honored, -1 missed | 2 |
| A1 | 2 | 4 | +2 honored, -2 contradicted | 1 |
| B1 (B2) | 3 (1) | 2 (2) | +2 (+1) honored, -2 (-1) missed | 2 (2) |
| C1 | 1 | 1 | +1 honored, -1 missed | 1 |
| as recommended | 10 | 9 | 176, 58, 1, 29 | 6 |

The list checksum as recommended is `3937913670`, and `3585974408` with the delegated words alone; each other
combination's is in `839-options2-out.json`, and the build re-measures the one ruled in the tree. Overreach
does not change in any combination.

The kept rows each moves, each to be "re-pinned by Issue #839's ruling":

| kept row | moved by | before | after |
|---|---|---|---|
| "Mostly land, a few inland seas, and a dry heat that never breaks." | delegated | nothing steered; seed 1423755014 | more land (0.42); residual loses "mostly land"; seed 321352997 |
| "Item: one continent, much broken by firths, with snows upon the northern capes." | delegated | continent, ragged, Celtic names; seed 145662319 | gains a cold climate; seed 684739703 |
| "Where jungle temples rise over hot lowlands and the priests speak in the tongue of the Mexica." | A1 | hot, Greek names; seed 2896996230 | hot, Nahuatl and Maya names; the same seed |
| "My grandmother's stories of Ireland: green, rainy, wild Atlantic cliffs, and names that sing like the Sidhe." | B1, B2 | Celtic names; seed 4115337716 | the same names; seed 1522562755 |
| "Rolling green hills, stone villages, sheep everywhere, and rain every afternoon, like Ireland when we went in 2019." | B1, B2 | mild, Celtic names (the table); seed 4134895115 | the same settings, Celtic names now from "ireland"; seed 2191082914 |
| "On this charte are laid down the coasts, soundings and havens of the Middle Sea." | C1 | nothing steered; seed 2154116297 | Greek names; seed 638532969 |

## Tests, each with the mutation that must red it

1. **The moved kept rows, re-pinned** in `test/world/founding-sample.json` from hand-derived residuals (the
   test checks each seed is `hashString` of its residual). Red first: written before the list edit, each reds
   on its residual or its overrides. Mutations: delete "snows", "mostly land", "jungle temples", "middle sea" or
   "ireland" (its rows red).
2. **Readable covenant rows** in `SHEET` for the additions no kept row holds, in Issue #837's "camels and a
   camel" form, each red first (today each founds nothing, or Greek names):
   `["a sand sea and sand seas", 2166136261, "", { band: "tropical", culture: "veshari" }]`;
   `["a jungle temple and jungle temples", 2166136261, "", { band: "tropical", culture: "tezcal" }]` (A1);
   `["a german and germans", 2166136261, "", { culture: "draket" }]` (B1). Mutations: delete either number of
   a pair (its row reds on residual and seed); drop a setting from both numbers of a pair (its row reds on its
   overrides). Dropping a setting from one number alone leaves the row green, since its partner still sets
   it: for all three pairs only the checksum sees that, and the prover is told so. They add rows; no existing
   row moves.
3. **The list checksum**, re-pinned to the value measured in the tree. Red first: pre-pinned before the edit.
   Mutations: each above, and deleting "sand seas" or "germans", which only their covenant rows and the
   checksum see.
4. **Every other pin holds**: the founding tests with today's pins red exactly the checksum and the moved rows,
   which is the build's own check.

`vellum-guard-prover` gets tests 1 to 3, committed first.

## Build order (phase two, on the answer)

1. Copy this plan as the answer leaves it to `handbook/plans/839/839-plan.md`; first commit; push.
2. The red pins: the re-pinned kept rows, the new covenant rows and the pre-pinned checksum. Run
   `node --test test/world/founding*.test.ts`, keep the red lines: exactly those red. Commit.
3. The list edit; `npm run format`; the founding tests green; commit, push.
4. The dump (`837-dump.ts`, `837-diff.ts`) before and after: every pinned input but the re-pinned rows and the
   new rows identical. `837-corpus.ts` over both corpora. `npm run check`, `npm run lint`,
   `npm run format:check`, `npm test` (then `npm run astro:generate`). No e2e: nothing reaches a page, and the
   golden and every committed chart cannot move (`found.ts`, `generateWorld` and every renderer are untouched).
5. `vellum-guard-prover`; the calls comment on Issue #839; the PR (`Closes #839`); `vellum-pr-skeptic` cold.

## Doctrine and rosters this drags

None. `handbook/specs/engine-invariants.md`'s founding section names no word and no count, and its sentence
that the pins in `test/world/founding-covenant.test.ts` and `test/world/founding-sample.test.ts` move with
version 1 until Issue #393 is what this does. No new file; the plan archive sits outside the roots
`test/repo/prose-paths.test.ts` walks.

For Issue #393's PR body: more climate words naming a people ("sand sea", "jungle temples"), so a few more
worlds count as founded mostly on climate.

## Calls made without a ruling, each with the rule it rests on

1. **The method is Issue #832's gate, re-run on fresh readers** for every candidate, with Issue #832's 60
   controls. Rule: the delegation is "as Issue #832's words were" (6097482413), and that delegation joined no
   word without a blind reading.
2. **The traditions were shown to the readers as letters**, not ids. Rule: a reading must not be a spelling
   match ("thalassic", "thalassocracy").
3. **A clash that cancels a repeated word counts as a loss.** Rule: the third prediction above, which Issue
   #832's measure would have read as a swallow.
4. **The held-out test, a rule added to Issue #832's gate, removes "moors" and "fens"**, though both pass
   that gate as written (6 and 5 gains, no losses): their readers read only Celtic names, and on the held-out
   round, which named them for a mild climate, each gives names nobody expected in two sentences and honors
   none. "moors" also names a people, the Moors, who would take Celtic names. Rule: Alex's "the held-out round
   stands as the fair test" (Issue #837 ruling B), made general; leaving a word out is the cautious default.
5. **"midnight sun" stays out**: two readers read Norse names with the cold, one did not, and it is unseen in
   the discovery corpus. Rule: the unseen-word rule (Issue #832's call 9), all three agreeing on every setting.
6. **"sand seas" joins beside "sand sea"**, though one reader noted "some readers would not know the term".
   The reader did not call it obscure, the word the prompt gave for a phrase an ordinary reader would not know,
   and wrote no such note on the singular; leaving the plural out would make the two numbers found differently.
   Rule: a word's two numbers steer alike (Issue #832's call 17).
7. **"mostly land" joins** with one discovery gain: it is not period vocabulary, but the plain counterpart of
   the listed "mostly ocean", read more land by all three. Rule: the list already holds its pair, so the
   set phrase is of a kind the list holds.
8. **The phrases that take "sea" or "seas" from a listed phrase stand**: "sand sea", "sand seas" (and "middle
   sea", if ruled) win over "sea kings", "sea swallowed", "seas receded", "sea lochs" and "sea loch" where
   they meet. No sentence in either round holds one. Rule: the longest-phrase rule is Issue #391's and
   unchanged, as Issue #837's call 5 left the reverse case.
9. **"cherry blossom" stays out.** As its listed plural steers (Japanese names) it only swallows "cherry",
   which already gives them; as the readers read it (mild, Japanese names) it would steer otherwise than
   "cherry blossoms". Rule: Issue #832's gate step 4, and a word's two numbers steer alike.
10. **"headland", "mammoth", "city states" and "free cities" stay out**, as Issue #832's calls 17 and 9 left
    them; the readers read nothing in "headland" and noted "huge" for "mammoth".
11. **The kept rows the readers contradict and no word fixes stay pinned as version 1 founds them**: the
    Hesperides ("hesperides" is unknown to ordinary readers, all three say), "broke the one continent into
    many", "Many island and one big dragon" ("many island" cancels a second "island" as often as it helps),
    "Alps, fjords, Greek islands ..." (three peoples and a road; no word reads a continent), and "Merchant
    republics ... inland sea ..." (a continent back reopens Issue #837 ruling B). "Mostly land, a few inland
    seas, ..." moves with "mostly land" and gains more land, still without the continent its readers read.
    Rule: the sample is ruled curation (Issue #832 ruling 3, Issue #837 call 3).
12. **No "sea kings" guard.** An entry that steers nothing lands in `contested`
    (`839-empty-probe.mts`: "the inland sea kings" would list "inland sea kings" there), against the founding
    record's meaning in `handbook/specs/engine-invariants.md` and `FOUNDING_RULES`; any guard that steers
    brings back the inland-sea continent (Issue #837 ruling B). No pinned or corpus sentence holds one. Rule:
    Issue #837's call 5.
13. **"ireland", if ruled, sets Celtic names only.** Rule: every country on the list sets only its tradition
    (Issue #832 ruling 5, "Each sets the tradition it matches").
14. **Readable covenant rows for the additions no kept row holds.** Rule: Issue #837's call 2, an added word
    gets a readable pin.
15. **Placement**: appended to their groups, and the new climate-and-people group beside its siblings. Rule:
    Issue #832's call 7.

## Recon's findings and what became of each

`vellum-spec-recon` at `20dd39a5` (`839-recon-ledger.md`): every path, symbol, word and pinned row CURRENT;
8 STALE (2 blocking, 6 cosmetic); 2 UNVERIFIABLE.

| finding | disposition |
|---|---|
| STALE, blocking: four words were left out on purpose, not two ("headland" and "mammoth" by call 17, beside call 9's two) | Folded: call 10; all four stay out, so nothing reopens |
| STALE, blocking: a guard that steers nothing is a procedure and spec change | Folded: call 12, measured |
| STALE: "sea lochs" and "sea loch" are also exposed by the inland-sea drop | Noted in call 12; no corpus or pinned sentence holds "inland sea loch(s)" |
| STALE: counts (city states 9, snows 1), the island-chain count, the "Everywhere" description, Mexica's provenance, call 9's provenance | Noted; this plan quotes its own measured figures |
| UNVERIFIABLE: "measured by Issue #837's recon"; the 837 skeptic's counts | Nothing rests on either; measured here |
| Open: "Ireland" and call 11 | Folded: menu B |
| Open: "German" on the living-peoples line | Folded: menu B |
| Open: "Mexica" needs "temples" changed | Folded: menu A ("jungle temples" leaves "temples" as it is); "mexica" out as obscure |
| Open: "Middle Sea" names a real sea | Folded: menu C |
| Open: "city states", "free cities", "headland", "mammoth" | Call 10: recommended out, so not reopened |
| Open: the "sea kings" guard | Call 12 |
| Open: item 3 rows | Call 11, and menu A for the one row a word fixes |
| Open: whether a fresh reader round is required | Call 1: run |

## The plan skeptic's findings and what became of each

`vellum-plan-skeptic` at `20dd39a5` reproduced every count, checksum, moved row and test outcome in its own
copies; nothing blocking.

| # | finding | disposition |
|---|---|---|
| 1 | Menu A omits that "jungle temples" wins over any people word beside it ("Greek priests tend the jungle temples" goes Greek to Nahuatl and Maya), and the readers' Angkor note | Folded: menu A, re-measured (`839-skeptic-probe.mts`) |
| 2 | "middle sea" and "sand sea(s)" take a word another listed phrase starts with ("the Middle Sea kings" goes Norse to Greek; "the sand seas receded" loses its more land) | Folded: menu C and call 8, re-measured; no sentence in either round holds one |
| 3 | The obscure check is a keyword match; it misses "some readers would not know the term" on "sand seas", and undercounts "hesperides" | Folded: every note read by hand; call 6 for "sand seas"; "hesperides" now three of three, out either way |
| 4 | Menu B called "middle sea" unanimous and hid the hedges, and tied it to two names and a country | Folded: "middle sea" is its own item, C, with every hedge |
| 5 | "The gate is Issue #832's, unchanged" is false: the held-out veto is new; "mostly land" is not period vocabulary | Folded: the method names the added rule (call 4); call 7 rests "mostly land" on its pair |
| 6 | The singular "jungle temple" joins on the readers alone, one reading re-asked | Folded: menu A and the table say so |
| 7 | "snows" cited Issue #832's call 17, which covers delegated words only | Folded: it rests on Issue #839 item 2 |
| 8 | Call 8 said both inland-sea rows stay pinned, but "mostly land" moves one | Folded: call 11 |
| 9 | "germany" and "irish" are not offered | Folded: menu B says why |
| 10 | Each covenant pair's row is blind to one number losing a setting, for all three pairs | Folded: test 2 says so for all three |
