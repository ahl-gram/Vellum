# 591 triage ledger (working)

Filter (Alex, 2026-09-13): a line joins a gate only with a recorded incident behind it (a scars.md
row, or a named issue or PR where it bit) or an explicit Alex ruling. Everything else stays in memory.

Dispositions: KEEP-NEW (its own numbered line), KEEP-AMEND (a clause on a line that exists),
KEEP-SCAR (a scars.md row), DECLINE, CLOSE CALL (fails the letter of the filter, high cost).

## classify-project_vellum.md

| item | subject | incident | disposition |
|---|---|---|---|
| 29b | a parsing helper that silently skips a family of labels | #178, closed by PR #194 2026-07-12 | DECLINE: the instance is fixed, the general form is Gate 1 item 2 |
| 37b | seed 42 draws no decor serpent, use seed 2 antique | none at the clause | DECLINE: empirical, and the fixture-drift assertion is already at the test |
| 40b | capitals render uppercased; a terrain clue needs a DRAWN glyph | none at the clause | DECLINE: no named incident |
| 43e | a hunt red that will not reproduce locally is a date flake | #304, body names the UTC-midnight run | KEEP-AMEND on Gate 2 item 10 |
| 43f | `#status` keeps only its last write | none | CLOSE CALL: mechanism confirmed, no incident |
| 44 | narrow-width work owes a seed sweep, not seed 42 | #49, 2026-08-16 | KEEP-NEW Gate 1 |
| 45 | a differential guard's second world is a measurement | #320, 2026-08-11 | KEEP-AMEND Gate 1 item 2 |
| 49c | a killed prover leaves mutants in two places | date only, no number | CLOSE CALL |
| 53b | `git add -A` swept worktrees in as gitlinks | none | DECLINE: gitignored, and the live variant is commented at `.gitignore` with PR #369 |
| 56e | a closing keyword binds to ONE number | PR #255 left #203 open, confirmed by timestamps | KEEP-AMEND Gate 5 item 5 |
| 59a | a scratch tree carries the package's `"type": "module"` | #561, PR #563 | KEEP-NEW Gate 1 (short) |
| 59b | the citation guard reads any `name.js` as a repo module | #561, PR #563 | KEEP-NEW Gate 1 (short) |
| 59c | `node --test` prints ANSI so a grepped count reads zero | #561, PR #563 | MECHANISM FALSIFIED, see landfall 63 |

## classify-project_vellum_livingchart.md

| item | subject | incident | disposition |
|---|---|---|---|
| 4 | never measure during a `paperUnfurl` | none | DECLINE |
| 6a | a roster a guard checks is DATA the guard imports | #320, PR #349 | KEEP-NEW Gate 4 |
| 15 | assert the outcome, not the declaration | retired check codes only | DECLINE |
| 16 | freeze a frame with the Web Animations API | none | DECLINE |
| 17a | touch emulation before the boot navigate | #166 | KEEP, folded into one Gate 2 line |
| 17b | a touch dispatched with emulation off wedges the session | #166 | KEEP, Never list |
| 17c | changing emulation after a touch is unrecoverable | #166 | KEEP, folded into the same Gate 2 line |
| 17d | CDP touch coordinates are visual-viewport space | #166 | KEEP-AMEND Gate 2 item 2 |
| 35b | name another string your regex also satisfies | #387, #388, PR #415 | KEEP-NEW Gate 1 |
| 39 | a rect is STATED on the shim, never computed | #387, #388 | KEEP-NEW Gate 1, merged with 58e and 58f |
| 42b | four of five ranking keys guarded nowhere | #124, PR #386 | KEEP-SCAR |
| 44c | compare a mask byte-wise, not through JSON | #120, PR #182 | DECLINE: the check is retired and `surveyFingerprint` supersedes it |
| 48a | pick the fixture on the metric you assert on | #275 | KEEP-AMEND Gate 1 item 2 |
| 54d | a stayed-on-page claim needs a FRESH evaluate | #270, PR #355 | KEEP, folded into the Gate 2 probe line |
| 56a | measure time-to-legible against a control | #366, 2026-08-12 | KEEP, folded (same rule as 64b) |
| 58e | never grow the shim into a selector engine | #319, PR #348 | KEEP, merged into the shim line |
| 58f | name at the test what the unit suite cannot see | #319, PR #348 | KEEP, merged into the shim line |
| 60b | a native-slider drag needs `button: "left"` | #220, PR #311 | KEEP, folded into the Gate 2 input line |
| 60c | a probe restores the class or style it strips | #220, PR #311 | KEEP, folded into the Gate 2 probe line |
| 64a | capture cannot photograph a blocked main thread | #366 | CLOSE CALL: no helper exists for the remedy |
| 64b | same rule as 56a | #366 | MERGED with 56a |
| 64c | reach an unreachable window deliberately | #366 | CLOSE CALL |
| 66d | a memoized subject makes a same-object oracle a tautology | #423, PR #435 | KEEP-NEW Gate 1 |
| 66e | a bound fitted to the windows it sampled | #423, PR #435 | KEEP-SCAR |

## classify-project_vellum_landfall.md

| item | subject | incident | disposition |
|---|---|---|---|
| 5 | a camera check establishes its own state and blurs first | none | DECLINE |
| 9a | a two-point `touchMove` can arrive as two half-steps | PR #474 | KEEP, folded into the Gate 2 input line |
| 22 | `buttonPoint` scrolls, so it cannot see a scrolled-state defect | none | CLOSE CALL: Gate 2 item 2 currently teaches the cause |
| 24 | a CDP Space keyDown needs `text` to run the native scroll | none | DECLINE |
| 53 | the harness window is 2400px tall | none | DECLINE, and flag: the spec home is settle-doctrine, which no lane owns |
| 60 | a digits `pattern` refuses garbage before submit | none | DECLINE |
| 63 | `node --test` prints the spec reporter even when piped | none | CLOSE CALL, and it is the true mechanism behind 59c |
| 68 | a rect read off the element you just moved is mid-transition | none | DECLINE: already a one-line comment at `room-seats.ts` |
| 71 | a perl `s|` delimiter with a pipe in the pattern | none, but reproduced with a control today | CLOSE CALL, recommend keep on the Never list |

## classify-project_vellum_site.md

| item | subject | incident | disposition |
|---|---|---|---|
| 26k | `getComputedStyle` resolves through a hidden ancestor, which is how a print-only rule is asserted | chain to #295, PR #307, not at the clause | CLOSE CALL: Gate 2 item 3 carries the trap half, this is the affordance half |
| 32g | compare a computed colour by channel, not by string | none at the clause; the live helper cites #324 | CLOSE CALL |
| 34j | `setEmulatedMedia` feature overrides | none, and the claim is OVERBROAD: they work for reduced motion and print, only hover and pointer are inert | DECLINE as written; already a comment at `suite-broadside.mjs` |
| 36h | a selector reader splits on TOP-LEVEL commas and tests the SUBJECT | #353 PR #354, #356 PR #357, #358 PR #359, six escapes found by mutation | KEEP, folded into a Gate 1 parser line |
| 36k | a tag regex goes blind when an attribute arrives, and an empty parse must not skip | #353, #270 | KEEP, folded into the same Gate 1 line |
| 38a | never spawn a CLI screenshot beside a live harness session | date only; and `shoot` is not an export as memory says | CLOSE CALL, lean decline |
| 38b | read `magick compare` AE only as zero or nonzero | none | DECLINE: `design/oracle/README.md` already carries it, tracked |
| 38c | pin the drawn-in caption before shooting | none | DECLINE: `design/oracle/README.md` already does it |
| 44c | a guard that exercises a threaded value only at its DEFAULT | #412, PR #437, a prover hole; #438 still OPEN as the live instance | KEEP-AMEND Gate 1 item 3 |
| 64d | key a scan on what the DEFECT looks like, not on what the rule says | #360, PR #363 | KEEP, folded into the Gate 1 parser line |
| 82a | an explicit clip is shot INSIDE the viewport | date only | DECLINE: the harness already does it and the comment at `harness.mjs` carries the measurement |
| 84c | mutate BY LINE when several wearers share one literal | ruled 2026-09-03, PR #510 | KEEP-AMEND Gate 1 item 9 |
| 92c | a nonexistent `VELLUM_BROWSER` is not a no-browser fixture | none at the clause; and the stated remedy does not exist in the tree | CLOSE CALL, lean decline |

## classify-feedback.md

| item | subject | incident | disposition |
|---|---|---|---|
| 6k (a) | a test file importing a module that can exit at import is reported as a PASS with its assertions gone | PR #554, reproduced by measurement today | KEEP, folded into the Gate 1 node line |
| 6k (b) | a guard reading global process state gets its own TMPDIR | none | DECLINE: no incident, and the fix is already at `test/repo/footgun-gate.test.ts` |
| 29d | a trivial edit after the cold skeptic finishes does not earn another round | Alex, 2026-09-10, PR #559 | KEEP-NEW under Defaults this repo has already ruled |

## classify-reference.md

| item | subject | incident | disposition |
|---|---|---|---|
| 5 | `-f body=` at the issue path REPLACES the body | #193, PR #550, 2026-09-09 | KEEP-NEW Never list |
| 6 | a conflicted `rebase --continue` strips a number-sign subject | date only; mechanism confirmed from git's own docs | KEEP, merged with parallel 8 into one Never line |
| 9 | three stacked-PR failures | PR #408 with #49; PR #491 and PR #492 | KEEP-AMEND Gate 5 items 5 and 9 |
| 10 | a clip in DOCUMENT coordinates; capture cannot see a blocked main thread | #442 2026-08-23; #300 2026-08-12 | KEEP-NEW Gate 2, and it supersedes livingchart 64a |

## classify-project_vellum_parallel_agents.md

| item | subject | incident | disposition |
|---|---|---|---|
| 8 | bring a branch current with `git merge origin/main`, never a rebase | none on the bullet; the mechanism is reference 6 | KEEP, merged into the Never line, scoped |
| 12 | two branches editing the same roster lines | none on the clause; epic #585's own merge-order paragraph is the ruling | KEEP-NEW Gate 4 |
| 11b | PR #582 round 2 prescribed a recipe the fence still refused | PR #582, confirmed from its commit messages | KEEP-SCAR, proves Gate 5 item 3 |

## The close-call group, for Alex to rule on as a set

Ten candidates fail the letter of the filter (no issue or PR number at the clause) but are
mechanically confirmed and cheap. Recommended: keep the first five, drop the rest.

1. landfall 63, the spec reporter, which is also the corrected form of core 59c. Measured twice.
2. landfall 71, the perl pipe delimiter, reproduced with a control today.
3. parallel 8 and reference 6, the rebase subject strip, confirmed from git's own documentation.
4. core 43f, `#status` keeps only its last write, confirmed structurally.
5. site 26k, `getComputedStyle` resolves through a hidden ancestor, the affordance half of a trap
   Gate 2 already carries.
6. core 49c, a killed prover leaves mutants in two places.
7. site 32g, compare a computed colour by channel.
8. landfall 22, `buttonPoint` un-scrolls the page.
9. site 38a, a CLI screenshot beside a live harness session.
10. site 92c, a nonexistent browser path is not a no-browser fixture.

## Corrections after the plan skeptic, 2026-09-14

The parent-heading rule is applied SYMMETRICALLY from here: a candidate inherits the issue or PR
number at the top of its memory section, for a decline exactly as for a keep. That admits about 56 of
the 68, so three further grounds do the cutting and every decline now states which one it rests on:
(a) already written down in a file the repo carries, and whoever needs it reads that file anyway;
(b) a fact rather than an imperative at a moment of typing; (c) too narrow for the reading time it
costs at every firing.

Ground (a) has a stated limit, so it is not applied unevenly: a line-level comment discharges a
candidate only when the person who needs the rule is the person editing THAT file.

| row | was | is now | why |
|---|---|---|---|
| 37b | DECLINE, no incident | DECLINE, ground (a) | it carries PR #420 at its heading; the fixture-drift assertion already sits in `test/society/bestiary.test.ts` with its own failure message |
| 40b | DECLINE, no incident | KEEP, one clause on Gate 1 | #335, PR #336 at the heading; a name-versus-output check accepts the rendered spelling |
| 15 | DECLINE, retired check codes | KEEP, one clause on Gate 1 item 3 | #155, PR #290 at the heading; assert the geometric OUTCOME, never the declaration meant to produce it |
| 64a | CLOSE CALL | SUPERSEDED | reference 10 carries the same trap with #300 and #442, and the Gate 2 capture line ships it |
| 64c | CLOSE CALL, in no group | KEEP, one clause on the Gate 2 probe line | #366 at the item's own lead sentence |
| 43f | listed as both a decline and a close-call keep | KEEP | one filing, not two |
| 66e | proves Gate 1 item 2 | proves the new derive-the-bound clause | the incident is a ceiling fitted to its own samples, which item 2 does not say |
| 42b | proves Gate 1 items 1 and 5 | proves Gate 1 items 5 and 6 | five keys, one assertion, and the class of keys |
| parallel 12 | Gate 4, citing #585 | Gate 5 item 9, citing #593 and #596 | Gate 4 fires only on a Write that CREATES a roster file; and #596's body records the measured conflict, where #585 only states the rule |

**Recomputed:** 46 land, 22 declined. Eleven rows carry no issue or PR number at the clause AND none
at their section heading, so they fail the filter even read generously, and they go to Alex as one
group: core 43f and 53b, livingchart 4 and 16, site 38a, 38b, 38c and 82a, feedback 6k(b), reference
6 and parallel 8.

Recommended inside that group: keep three rows as two lines. Core 43f, confirmed structurally today
(`#status` is one `role="status"` paragraph whose `textContent` is overwritten). Reference 6 with
parallel 8 as one Never line, the mechanism confirmed from git's own documentation of `--cleanup`
rather than reproduced, which the PR body says in those words. Drop the other eight, each on ground
(a) or (c).

Two candidates I reproduced by running something today are NOT in this group, because their sections
carry numbers: landfall 63 (the spec reporter, PR #500) and landfall 71 (the perl delimiter, #463).
They are ordinary keeps.

## The settled count, after applying the three grounds to every row

**48 land, 20 declined.** The four rows the symmetric heading rule moved off the decline list and
into a decision on grounds, each ruled here:

| row | ruling | ground |
|---|---|---|
| 49c, a killed prover leaves mutants in two places | KEEP, one clause on Gate 1 item 9, with its other half: re-run a partial report's greens as well as its reds | passes via PR #582 at the heading, and nothing in the repo addresses the dispatcher after a kill |
| 22, `buttonPoint` un-scrolls the page | KEEP, one clause on Gate 2 item 2 | passes via #472 and PR #481; item 2 currently PRESCRIBES the cause and names no cost |
| 26k, `getComputedStyle` resolves through a hidden ancestor | KEEP, one clause on Gate 2 item 3 | passes via the #295 chain; item 3 carries the trap side and not the affordance side |
| 32g, compare a computed colour by channel | DECLINE, ground (c) | the one place it bit already carries the helper and its comment, and a new colour assertion would copy that helper |
| 92c, a nonexistent browser path is not a no-browser fixture | DECLINE, grounds (a) and (b) | the principle is Gate 1 item 2's fallback clause, and the remedy the note names does not exist in the tree |

The 20 declines: core 29b, 37b, 53b, 59c; livingchart 4, 16, 44c, 64a; landfall 5, 24, 53, 60, 68;
site 32g, 34j, 38a, 38b, 38c, 82a, 92c.

**Reading order for this file.** The per-file tables above are the FIRST pass. The two sections that
follow them, "Corrections after the plan skeptic" and "The settled count", supersede those tables
wherever they differ, exactly as an issue comment supersedes an issue body. The PR body carries one
clean table regenerated from the settled state, not this file's history.
