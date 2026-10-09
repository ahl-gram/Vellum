# Issue #831 plan: a climate word that names a tradition of its own settles a tradition clash with it

Issue #831, a follow-up to Issue #391 (Write the Age, Sub 1, merged as PR #830 at main `0e7f5c3e`),
epic Issue #278. Read 2026-10-09 at `0e7f5c3e`: Issue #831's body and its two comments (Alex's ruling,
https://github.com/ahl-gram/Vellum/issues/831#issuecomment-6089592497, and his merge clearance,
https://github.com/ahl-gram/Vellum/issues/831#issuecomment-6089634043), and Issue #391's body and its
four comments (the Sub 0 pointer, the rulings
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088029887, the calls
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088342254 and their addendum
https://github.com/ahl-gram/Vellum/issues/391#issuecomment-6088848936). The plan that built the code
is `handbook/plans/391/391-plan.md`, which this one does not edit. This version folds in
`vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings (the disposition table is at the end).

## Alex's rulings on this plan's menu (2026-10-09), and what they change below

The record is https://github.com/ahl-gram/Vellum/issues/831#issuecomment-6090010840. The body of this
plan is the one the menu came from and is kept as it stood; where a ruling departs from the
recommendation, this section is the build and the text below it is not.

- **Question 1 was ruled option 1, as recommended**: a plain climate word steps aside. When the
  climate words that name a people name exactly one, that people wins; "hot", "frozen" and the like
  do not undo it. The design and tests below are built as written for that answer, with "a hot desert
  of sultans and temples" (Persian) as the fifth covenant row.
- **Question 2 was ruled option 2, against the recommendation**: the founding's record credits the
  climate word with the names too. So:
  - The design changes shape. Rather than a culture fallback in `overridesFor`, a credit step runs
    between `settle` and the overrides: when no tradition word survives and the steered climate words'
    own traditions (read through `BY_PHRASE`) are exactly one, every climate word naming it gets its
    culture meaning back in `steered`, in its lexicon entry's order. `choose` then reads the culture
    from `steered` as it reads every other subject, and `overridesFor`'s table fallback is unchanged.
    When the climate words name none, or two that differ, nothing is credited and the table decides,
    as today.
  - `contested` and the residual do not change: "sultans" and "temples" still lost every meaning and
    still feed the chart number (call 3), even when the world takes sultans' people by way of
    "desert".
  - The orchestrating session's note on the ruling: it changes what a founding reports, never which
    world it founds. Every seed and every override stays as the menu's question 1 answer has them; a
    pin on the report moves with the ruling, and the PR body names each one as a re-pin by ruling.
    Measured before building: the one pin on the report that moves is "a word with several meanings
    loses only the clashing one, ..." in `test/world/founding.test.ts`, where "atolls" in
    "sun-drenched atolls ringed with shrines where the old kings drowned" now lists archipelago,
    tropical and `oromi`. The list checksum 3678728154 also hashes `steered`, but a single phrase
    cannot clash, so it is predicted not to move.
  - The tests below gain a report assertion each: the credited words carry the culture, a plain
    climate word does not, and with two peoples named neither climate word is credited. That last one
    narrows test 5's blind spot: a rule that crowned the `oromi` word would now credit "atolls" and
    red, so only a rule landing on `oromi` that credits no word stays unseen.
  - The spec sentence and rule 5 say the credit: a climate word whose own tradition names the world
    lists that tradition among its meanings, and the tradition words that cancelled stay contested.

## The ruling this builds (Alex, 2026-10-09, Issue #831)

1. Option B: when the climate word that settles a name clash names a tradition of its own, the world
   takes that tradition; otherwise the climate table decides. Two climate words that agree on the
   climate but name different traditions ("dunes and atolls") still go to the table.
2. The climate table stands as built: polar to `norden`, tropical to `oromi`, temperate to `sylvan`
   (`CLIMATE_TRADITION` in `src/world/founding/lexicon.ts`).
3. It lands in its own pull request, inside version 1 (`FOUNDING_VERSION` stays 1), before Issue #393
   makes the written-world link public. The ruling says "with the covenant pins re-pinned"; measured,
   no existing pin moves (below), so the covenant gains rows and loses or changes none.

## What happens today, measured at `0e7f5c3e`

`overridesFor` in `src/world/founding/found.ts` takes `culture` from a surviving tradition word, else
`CLIMATE_TRADITION[band]` when a band survives, else nothing (the seed's own draw). Measured with
`831-probe.ts` (scratchpad), through `foundWorld`:

| sentence | today | under the ruling |
|---|---|---|
| "a desert of sultans and temples" | tropical, `oromi` | tropical, `veshari` |
| "taiga of jarls and boyars" | polar, `norden` | polar, `zoryan` |
| "desert shrines" | tropical, `oromi` | tropical, `veshari` |
| "dunes and pagodas" | tropical, `oromi` | tropical, `veshari` |
| "dunes and atolls" | archipelago, tropical, `oromi` | the same (the table) |
| "sun-drenched atolls ringed with shrines where the old kings drowned" | archipelago, tropical, less land, `oromi` | the same under every reading on the menu |
| "cold atolls and fjords" | archipelago, ragged, no culture | the same (the climate itself is contested) |
| "a cold archipelago of black pines, iron harbors, and a drowned kingdom" | polar, archipelago, less land, `norden` | the same (no clash) |

No seed and no residual moves: the residual rule is untouched, and every seed above equals
`hashString` of its hand-derived residual, computed apart from `foundWorld` ("sultans temples"
2731924381, "jarls boyars" 2804905647, "shrines" 431890347, "pagodas" 786575556, "" 2166136261).
Only `culture` moves, and only for a sentence whose tradition words clash while a climate word that
names a tradition survives. No existing pin moves: the skeptic modelled the ruling over the 50 pinned
sentences in the two founding test files and the 404 inputs behind the list checksum 3678728154, and
none changed culture (its model, to be confirmed by the built change's own run).

Who can trigger it, read from `LEXICON`: the words that steer both the climate and a tradition are
"desert", "deserts", "dune", "dunes" (tropical, `veshari`), "taiga" (polar, `zoryan`) and "atoll",
"atolls" (tropical, `oromi`). Since the table's tropical is `oromi`, "atoll" and "atolls" found what
they found today; the visible change is the `veshari` and `zoryan` words.

## The menu for Alex (step 6), and what each answer does to the build

**Question 1 (recon and the skeptic both: Alex's, not a builder's call).** The ruling speaks of "the
climate word" in the singular. A sentence often has a plain climate word as well ("a hot desert of
sultans and temples": "hot" sets the climate and names no tradition; "desert" sets the same climate
and names Persian). Measured with `831-menu-probe.ts` (scratchpad), each reading modelled over
`foundWorld`'s output at `0e7f5c3e`:

| sentence | today | A: plain climate words step aside | B: every climate word must name it | C: only a lone climate word counts |
|---|---|---|---|---|
| "a desert of sultans and temples" | `oromi` | `veshari` | `veshari` | `veshari` |
| "a hot desert of sultans and temples" | `oromi` | `veshari` | `oromi` | `oromi` |
| "sun-drenched desert of sultans and temples" | `oromi` | `veshari` | `oromi` | `oromi` |
| "frozen taiga of jarls and boyars" | `norden` | `zoryan` | `norden` | `norden` |
| "desert and dunes of sultans and temples" | `oromi` | `veshari` | `veshari` | `oromi` |
| "dunes and atolls" | `oromi` | `oromi` | `oromi` | `oromi` |

Over every three-word sentence of a plain climate word, a desert, dune or taiga word of the same
climate, and a tradition word of another tradition (13774 sentences, read from `LEXICON`), A and B
disagree on 9902, and on every one of those B gives today's answer. Recommended: A.

**Question 2 (recon listed it, the skeptic asked for a line).** What the founding reports to a page.
In "a desert of sultans and temples" the world takes Persian names by way of "desert", but the
founding's two lists say "desert" set only the climate, and "sultans" and "temples" cancelled each
other and fed the chart number. Recommended: keep the lists as they are, and the spec says the
tradition can come from a climate word that is listed as setting only the climate; a page that wants
to credit "desert" works it out from the word list. The other answer lists "desert" as setting the
names too, which moves the existing "atolls" pin and changes what Issue #393's still unruled
"founded primarily on climate" test will see.

## Design (under question 1's recommended answer)

In `src/world/founding/found.ts`, `overridesFor` keeps its shape; the fallback becomes a small helper:

```ts
const culture = named ?? (band !== undefined ? climateTradition(steered, band) : undefined);
```

`climateTradition(steered, band)` collects, from every steered word whose surviving meanings include
the band (a climate word), the tradition that word's own lexicon entry names, looked up through
`BY_PHRASE` (phrases are unique, "no phrase is listed twice" in `test/world/founding-lexicon.test.ts`
holds it), since the clash has already stripped the culture meaning from `steered`. The traditions go
in a set, so the answer does not depend on word order. Exactly one tradition in the set: that
tradition. None, or two or more: the table, `CLIMATE_TRADITION[band]`. Under answer B the set also
takes an "undefined" for a plain climate word, so any plain word sends it to the table; under C the
helper returns the one climate word's tradition only when exactly one climate word steered.

The fallback is reached only when no tradition word survives and a band does. A band survives only
when every climate word agrees on it, so "the climate words" are exactly the steered words carrying a
band. A climate word that names a tradition always takes part in the clash it settles (its own
tradition is one of the clashing sides), so the rule is ruling 4's note on Issue #391 made exact: "a
clash whose climate word matches one side is settled by the climate word".

No change to `normalize.ts`, `lexicon.ts`'s table, the residual, the seed, `steered` or `contested`
(under question 2's recommended answer), or `src/society/culture-ids.ts`.

## Files

- `src/world/founding/found.ts`: the helper and the one changed line.
- `src/world/founding/lexicon.ts`: rule 5 of `FOUNDING_RULES`, the rules in plain words a page will
  render. Drafted after the ruling (the skeptic's finding 7: the branch it describes never reaches a
  climate word that names a tongue, and the draft wavered between "climate word" and "climate
  words"). Under answer A, roughly: "A world whose words name no tongue, or two that disagree, takes
  its tongue from its climate: from the one tongue its climate words name, or, when they name none or
  two, from the tongue that climate always gives; with no climate word either, the chart number
  chooses."
- `test/world/founding.test.ts`: the behaviour tests below.
- `test/world/founding-covenant.test.ts`: five new sheet rows, each a literal seed computed apart from
  `foundWorld`.
- `handbook/specs/engine-invariants.md`, "What a surface may read from a founding": the sentence "The
  founded `culture` comes from a tradition word or, when none survives, from the climate word." says
  the new order (a surviving tradition word; else the climate words' own tradition as ruled; else
  `CLIMATE_TRADITION` for the band) and, under question 2's recommended answer, that `steered` and
  `contested` stay as the clash left them: a climate word whose tradition named the world lists only
  the meanings it kept, and the tradition words that cancelled stay in `contested` even when one of
  their traditions is the world's.
- Archive: `handbook/plans/831/831-plan.md`.
- Untouched: `handbook/plans/391/391-plan.md` (frozen), `src/society/culture-ids.ts`, every other file
  under `test/` (the Issue #779 part 2e lane's ground), `eslint.config.ts`.

## Tests, each with the mutation that must red it

The red comes first and needs no stub where today's code already gives the wrong answer: today's
`overridesFor` has the right shape and the wrong behaviour. Not every guard below is red today
(the skeptic's finding 2), so they fall in two groups, and the PR body's guard table keeps them apart.

**Red at `0e7f5c3e`, with a red line to paste:**

1. **A climate word's own tradition settles the clash** (`founding.test.ts`, new): "a desert of sultans
   and temples" founds `veshari`, "taiga of jarls and boyars" `zoryan`, "desert shrines" `veshari`,
   "dunes and pagodas" `veshari`, each with its band. Mutation: today's line (always the table) reds
   all four with `oromi` or `norden`.
2. **The class, swept from `LEXICON`** (`founding.test.ts`, new): every entry that steers both a band
   and a tradition, founded beside one tradition-only word of every other tradition, in both orders,
   founds the entry's own tradition and band (126 sentences, 90 of them red today; the 36 `atoll` and
   `atolls` ones pass today, since their tradition is the table's). The sweep reads the exported
   table, not a list the test restates, and asserts first that at least one swept entry's tradition
   differs from `CLIMATE_TRADITION` of its band. Mutation: always the table.
3. **Plain climate words, as question 1 is ruled** (`founding.test.ts`, new): every plain climate word
   of the same band, beside every climate word that names a tradition, beside a clashing tradition-only
   word of every other tradition, read from `LEXICON` (13774 sentences; 13774 foundings took 35 ms on
   this Mac, 2026-10-09). Under A each founds the climate
   word's own tradition, with "a hot desert of sultans and temples" and "frozen taiga of jarls and
   boyars" pinned by name. Mutation: the other two readings (B reds every A-only sentence with
   `oromi` or `norden`; C reds the same).
4. **Covenant rows** (`founding-covenant.test.ts`), literal seeds from `hashString` of the hand-derived
   residual, never from `foundWorld`:
   - "a desert of sultans and temples": 2731924381, "sultans temples", tropical, `veshari`;
   - "taiga of jarls and boyars": 2804905647, "jarls boyars", polar, `zoryan`;
   - "desert shrines": 431890347, "shrines", tropical, `veshari`;
   - "dunes and pagodas": 786575556, "pagodas", tropical, `veshari`;
   - and, as question 1 is ruled, "a hot desert of sultans and temples": 2731924381, "sultans temples".
   Mutation: always the table.

**Green at `0e7f5c3e`, proven by mutation only:**

5. **Climate words that name different traditions go to the table, the class** (`founding.test.ts`,
   new, the skeptic's finding 3): every pair of `LEXICON` entries that share a band and name different
   traditions, in both orders, founds `CLIMATE_TRADITION` of that band (16 sentences today), with
   "dunes and atolls", "atolls and dunes" and "desert dunes and atolls" pinned by name. Mutations:
   first climate word wins (reds "dunes and atolls"); last wins (reds "atolls and dunes"); the
   most-named wins (reds "desert dunes and atolls"). **Blind spot, named**: the table's tropical is
   `oromi`, the tradition "atolls" names, and no band has a pair whose table answer is neither side,
   so no row can tell "the table" from any rule that lands on `oromi`, "the `oromi` word wins" and an
   alphabetical tie-break included. The sweep starts to bite there the day the list (still free to
   change until Issue #393) gains such a pair; the PR body says so.
6. **Only a climate word counts**: "mild fjords and birches" founds `sylvan`, the table's, because
   "fjords" steers the coast and a tradition but not the climate. Mutation: count any word with
   several meanings, which reds it with `norden`.
7. **The existing pins that must hold**: "cold atolls and fjords" founds no culture (mutation: let the
   climate words' traditions count when the climate itself is contested reds it with `oromi`);
   "sun-drenched atolls ..." keeps "atolls" steering only archipelago and tropical (mutation: give the
   settling word its tradition back in `steered`); "a cold land of shrines" keeps `tsuren`.
8. **The covenant row "dunes and atolls"**: 2166136261, "", archipelago, tropical, `oromi`. Mutation:
   first climate word wins.
9. **No existing pin moves**: the 21 existing covenant rows and the list checksum 3678728154 stay as
   they are. One phrase cannot clash with itself, so the checksum moving would mean the change reached
   past `culture`: a defect, not a re-pin.

`vellum-guard-prover` gets tests 1 to 8, committed first, with the mutation for each of the second
group named in its brief.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
  No e2e: nothing reaches a page, and no surface calls `foundWorld` yet (`git grep foundWorld` finds
  only `src/world/founding/found.ts`, its tests and the spec).
- `831-probe.ts` and `831-menu-probe.ts` re-run at the branch head against the built change, their
  tables beside the ones above, copied into a PR comment with the scripts.
- The golden (`1792806240`) and every committed chart cannot move: founding reaches no surface, and
  `generateWorld` is untouched. `npm test` runs the golden and the hero drift guard anyway.

## Doctrine and rosters this drags

- `handbook/specs/engine-invariants.md`, the one sentence above, extended to both lists.
- `FOUNDING_RULES` rule 5, above.
- No roster: no new file outside the plan archive, no new export.

## Calls made without a ruling, each with the rule it rests on

1. **Different traditions go to the table without counting**: "desert dunes and atolls" founds
   `oromi`, not the twice-named `veshari`. Rule: Sub 0's ruling that contradicting words on one subject
   both lose, and Issue #831's ruling 1.
2. **Only a word that steers the climate is a climate word**: "fjords" (ragged coast and `norden`) is
   not one. Rule: Issue #391's ruling 1, "its climate word (cold, warm, mild and the like)", the band.
3. **A tradition word that lost to the clash still counts toward the chart number**, even when the
   climate word then gives the world the same tradition: "sultans" in "a desert of sultans and
   temples" stays in the residual, so no seed moves. Rule: Sub 0's ruling that contradicting words
   both only count toward the chart number, and Issue #391's ruling 4 (a word that lost every meaning
   counts); Issue #831's ruling speaks only of the names. Recon listed it as Alex's; the skeptic
   attacked that and refuted it, so it stays a call.
4. **Version 1 stays version 1**, and nothing ratified moves: five or six covenant rows are added and
   no existing pin changes. Rule: Issue #831's ruling 3 and the second ruling on Issue #391.

## The reviews' findings and what became of each

`vellum-spec-recon` (ledger in `831-recon-ledger.md`, scratchpad):

| finding | disposition |
|---|---|
| "re-pinned" is stale: no existing pin moves, the work is adding rows (blocking) | Folded: the ruling section and test 9 say so; the menu tells Alex nothing he ratified moves |
| The table is no longer a proposal; the zoryan alternative is retired | Folded: ruling 2 as stated |
| Seven words steer both a climate and a tradition, not four; derive the set from `LEXICON` | Folded: tests 2, 3 and 5 read it from `LEXICON` |
| "dunes and atolls" cannot tell the table from "atolls wins" | Folded: test 5's named blind spot |
| `FOUNDING_RULES` and the spec sentence both need the new rule; nothing pins either | Folded: both are in Files |
| Open decision 1, a plain climate word beside one that names a tradition | Folded: menu question 1 |
| Open decision 2, does "sultans" still count toward the chart number | Kept as call 3: the skeptic refuted it as a blocker on Sub 0's ruling, which settles it |
| Open decision 3, what `steered` reports | Folded: menu question 2 |

`vellum-plan-skeptic`:

| # | finding | disposition |
|---|---|---|
| 1 | Call 1 (plain climate words step aside) is Alex's open decision; 9902 of the measured sentences turn on it, and the merge clearance means he would first see it after merge | Folded: menu question 1, re-measured by this session with `831-menu-probe.ts` (13774 same-climate sentences, 9902 differ, every one of them today's answer under B); the old call 2 (two climate words naming one tradition) is the menu's last row |
| 2 | "Every new assertion reds at `0e7f5c3e`" is false for about half the guards | Folded: the tests split into red today and mutation only |
| 3 | Test 3 samples three rows of a class; the blind spot is any rule landing on `oromi`, the alphabetical tie-break included | Folded: test 5 sweeps every same-band pair from `LEXICON`; the blind spot is named as wide as it is; the plain-climate-word test sweeps too |
| 4 | Call 5 also touches `contested`, which the spec edit left out | Folded: menu question 2 names both lists, and the spec sentence covers both |
| 5 | The plan cited one comment on Issue #831; there are two, the second a merge clearance | Folded: both cited |
| 6 | Call 7's "the pins move with it" contradicts the plan's own prediction | Folded: call 4 says nothing ratified moves |
| 7 | The rule 5 draft cannot reach the case it describes and wavers in number | Folded: redrafted after the ruling, a rough draft under A in Files |
