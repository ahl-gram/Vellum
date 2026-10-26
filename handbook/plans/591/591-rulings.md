# 591: Alex's rulings, relayed by the dispatcher 2026-09-14, and what they change

Recorded here because the lane's worktree was removed before phase two began. These supersede the
recommendations in `591-menu.md` wherever they differ. They go on #591 as ONE dated comment before
the PR opens, together with the builder's calls listed at the end.

## The rulings

1. **Q1: C.** Tighten the filter to number-beside-the-line. Only a candidate whose OWN line carries
   the incident number, or an explicit ruling of Alex's, lands. Anything that inherits its number
   from a parent heading stays in memory, the touch-emulation family included. Rebuild the ledger
   against that reading and name each decline's ground.
2. **Q2: falls out of Q1.** The ten with no number anywhere are all declined.
3. **Q3: B.** Gate 5 line 7 gains a SECOND exception: a sibling defect may be folded when an
   orchestrated batch's dispatcher relays Alex's ruling to fold for that batch; otherwise it is
   filed. The memory row becomes dated history, which is the orchestrator's step, not this lane's.
4. **Q3b: A.** The three unrelated Gate 5 corrections land in this PR, each named in the PR body with
   its command.
5. **Q4: A.** The capture rules move to Gate 2; the two-branches rule goes onto Gate 5 item 9. No
   matcher change, and the limit is stated in the body.
6. **Q5: B.** Written tight. With Q1's cut the total lands well under the measured 20,334; the
   measured spans go in the PR body.
7. **Q6: standing rule, not a new ruling.** "No counts" governs the text of `SKILL.md` and
   `scars.md`. Magnitudes in the triage ledger and the PR body are evidence and are fine. A new
   `scars.md` row names the gate it proves, per the acceptance, even though older rows do not.
8. **Q7: file** the three homeless rules as one follow-up issue. Filed, not folded.
9. **Q8: file** the fixed-port unit-test hang as its own issue. Change nothing here.
10. **Q9: A.** Hold the date-flake clause. Alex's flake-record ruling freezes Gate 2 item 10.
11. **The builder's calls stand**, including fixing the absolute home path in `scars.md` and the
    one-word `clickAt` correction in passing. Both named in the PR body.
12. `Closes #591` goes in the PR body.

## The ledger rebuilt against Q1 = C

"Passes" below means the incident number or an Alex ruling sits at the candidate's OWN line or its
own lead sentence, not at a section heading above it. Source: the extraction pass's per-item
attribution field, which recorded clause-level and heading-level separately for every one of the 68.

**Passes the tightened filter (27 rows):** v-29b, v-43e, v-44, v-45, v-56e, lc-6a, lc-39, lc-42b,
lc-48a, lc-56a, lc-64a, lc-64b, lc-64c, lc-66d, lc-66e, lf-9a, s-36h, s-36k, s-44c, s-64d, s-84c,
f-6k, f-29d, r-5, r-9, r-10, p-11b.

**Of those, four do not land for reasons other than the filter:** v-29b (fixed by PR #194, and the
general form is Gate 1 item 2), lc-64a (superseded by r-10, whose content ships), lc-64b (the same
rule as lc-56a, merged), v-43e (HELD by ruling 10).

**Lands by an explicit ruling of Alex's rather than by a number: p-12**, the two-branches rule, which
ruling 5 places on Gate 5 item 9; and **the Gate 5 line 7 second exception**, which is ruling 3
itself and is a new line this PR writes.

**So: 24 rows land.** 23 from the filter plus p-12 by ruling, with the Gate 5 line 7 exception on top
as a ruling-sourced edit that is not one of the 68.

**Declined: 43 rows, plus 1 held.** Grounds, per row, in the rebuilt ledger. The large new group is
"the number is inherited from a section heading, not the line" (ruling 1), which takes the whole
touch-emulation family (lc-17a to lc-17d), lc-35b, lc-54d, lc-58e, lc-58f, lc-60b, lc-60c, lc-44c,
v-40b, v-49c, v-59a, v-59b, v-59c, lc-15, s-26k, s-32g, s-34j, s-92c, lf-5, lf-22, lf-24, lf-53,
lf-60, lf-63, lf-68, lf-71, v-37b. The ten with no number anywhere (ruling 2) take v-43f, v-53b,
lc-4, lc-16, s-38a, s-38b, s-38c, s-82a, r-6, p-8.

**Two casualties worth naming in the PR body**, because they were the highest-cost keeps before the
tightening and a future session should know they were considered and ruled out rather than missed:
the CDP touch-emulation family (two of its rules wedge a whole run irrecoverably) and the
spec-reporter trap that this lane measured twice. Both stay in memory under ruling 1.

## What the edit now is

- **Gate 1**: amend item 2 (lc-48a, v-45 clauses), item 3 (s-44c clause), item 7 (lc-66d clause),
  item 9 (s-84c clause); new item 11 (v-44, the seed sweep, plus the derive-the-bound clause from
  lc-66e); new item 12 (lc-39, the shim, the rect half only, since lc-58e and lc-58f are declined);
  new item 13 (s-36h, s-36k, s-64d, the hand-rolled reader); new item 14 (f-6k only, since v-59a to
  v-59c and lf-63 are declined).
- **Gate 2**: new item 12 carries lf-9a only (the touch family is out), and may not be worth its own
  line at that size: fold it into item 1 instead and say so. New item for lc-56a and lc-64c (the
  probe line), and one for r-10 (the capture line, Gate 2 by ruling 5).
- **Gate 4**: new item 4, lc-6a, the roster is data.
- **Gate 5**: line 7 gains the second exception (ruling 3); item 5 gains v-56e and r-9's adjacency
  and non-default-base clauses; item 9 gains r-9's retarget repair and p-12's two-branches rule.
- **Defaults**: f-29d.
- **Never**: r-5 only (lf-71 and the rebase pair are declined).
- **scars.md**: lc-42b (#124), lc-66e (#423), p-11b (PR #582), each naming the gate it proves; and
  the absolute home path at line 133 comes out.

Re-measure the spans with `591-project-*.mjs` against the reduced set before the PR body claims a
number.

## Two issues to file before the PR opens

1. The three homeless rules (ruling 8): the worktree-switch rule whose home is `CLAUDE.md`; the
   harness window height whose home is the settle spec's environment section; and the two Never-list
   items that are mechanically checkable by the hook.
2. The fixed-port unit-test hang (ruling 9): `test/site/astro-app-surfaces.test.ts` binds port 4877,
   it is the only test in the suite that takes a fixed outside resource, and `npm test` is a bare
   `node --test` with no `--test-timeout`, so a two-lane collision wedges with no red. Evidence: a
   full run read 1994 pass and 1 fail after about fifteen minutes at zero percent CPU with the dev
   server still answering every route by hand; the same file alone passes six tests in 1.76 seconds.
   Contrast for the body: `specs/settle-doctrine.md`'s environment section says the e2e ports are
   overridable precisely so two local lanes can run at once. The unit lane was missed.
