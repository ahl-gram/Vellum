# The ledger behind the gates

Compiled 2026-09-09 from the bodies, commits and verification comments of PRs #524 to #548 and
their issues, with older and later scars added beneath when a gate needs one (#378, #518 to #521, #525, #526, #529, #531, #532, #539, #540, #543, epic #401).
Every row was found by a cold skeptic, a prover, a plate-reader, CI, or Alex live, after the
implementing session had already reported the work done. Ranked by how many PRs in that window
carried it. The long form of each lesson, with the earlier scars, is in the auto-memory doctrine
files named at the end.

## Families, most recurrent first

**A green check that proved nothing.** Every PR in the window but #527, through four doors:

- *The fixture sat where the hazard is degenerate.* #528: every swept camera on a lattice point,
  where `Math.round` and `Math.floor` agree; a stride of 3 that never lands on 16/32/64, so the edge
  gate could never be false. #536: the window-midpoint shortcut, the exact hazard the finding exists
  for, passed all three checks. #533: a settle returning its last read on timeout kept CL4 green.
- *The assertion read its own input or the fallback.* #546: CD20 asserted `.hidden`, the property it
  had just set, green over two visible dead presses; CD19 satisfied by the "this world" fallback;
  PRR11's `slice` ran to EOF. #542: CD1 checked only that the dog-ear was CONTAINED, 8x oversized.
  #544: CD10 could not go red and was deleted; CD12's first form was green with the lift restored.
  #535: three states against one 4.5 floor, "it pinned one number three times". #545: old CD6 never
  fired `lay()`. #548: a comment deleted against a cited test that did not pin it.
- *The instance, not the class.* #533: two siblings the first sweep missed. #536: three cameras
  pinned, the lattice unswept. #544: the clamp fixed on the road's button and not the stamp line.
  #530: one arm scoped of a selector list. #545: one child clamped.
- *Synthetic input over a control nobody can press.* #542: `element.click()` ignores
  `pointer-events`; a dead dog-ear reported as working and an eleven-check suite green over it.
  #545: the shut press 0% reachable, "the #520 dog-ear again". #546: the Glass bound but dead to
  touch, "the same defect one layer down"; CD7b read `reachable: 0` once and passed on re-run.
  #543: the tab took 56% of every zoom press, found by Alex live.
- *The probe itself was wrong.* #545: `getComputedStyle(child).display` on a child of a hidden
  ancestor counted three hidden roads as up; `elementFromPoint` at y=882 in an 844 viewport; BR6b's
  fixed 120px offset landed on the new tab and read 59 against an unchanged ground. #542: a rect
  helper returning `y` where the check read `top`, so `undefined >= n` was quietly false; a
  persistent profile served a cached stylesheet. #544: a zero-width row that was the session's own
  32px root font. #530: a pixel MAX that would have passed a fully broken build; a control point
  that was wrong. #529: a pixel diff reading its own noise (11 to 14k AE against 90 of signal).

**The record said something nobody had measured.** #530: "today only the Explorer", six pages.
#541: a mislabeled count and a June-only count. #545: "the table is simply unreachable", true of the
tab and false of the drawer. #546: the commit that broke the download press claimed the opposite;
`MEASURED_SECONDS` 6.9 from an eleven-check suite carried into a twenty-three-check one (37.2).
#548: "every surviving comment is a single line", false when written. #542: 30 guessed, 6.9
measured. #524 and earlier #486: "does not close #N" closed N. #507/#508: a record claimed in the
body while the plate-reader was still running.

**e2e timing.** #527: six CI runs on unchanged code read 2.76 to 4.31 against a fixed bound of 3.
#528: four CI attempts, about 45 minutes; SV2c missed a wall cap by 10ms. #536: the blind sleep's
defect moved one layer up, caught by its own CI. #542: "#529's own lesson landing on my own new
suite". #537, #535: the #529 class again. #545: a settle that gave up killed the lane (#534, since fixed:
the step contains it and the named check goes red). #529
round three: stillness at the START read as stillness at the END. Same-URL `Page.navigate` returns
on the stale document.

**Comments overgrew, then were carved back in a review commit.** #528: eight wrapped mid-file
blocks in the source and five in the test, against zero in every sibling. #537: git archaeology in
a CSS comment. #541: rationale blocks restating three guards. #546: a comment added in one commit
and dropped in the next for restating the assertion under it. #548: the whole-line audit could not
see trailing comments, 28 of 28 restored.

**Dead or unnecessary code shipped, deleted in review.** #542: a rule an inline style beat at any
specificity. #546: `top = at === top ? top : top`; `pileOrder` exported and never used. #544: two
things came out rather than shipping green and worthless. #541: an unused export. #530: a dead
opt-out rule. Earlier, #49: a field populated, tested, re-pinned, and never read by any surface.

**The cascade.** #530: (1,2,2) against (0,2,1), sitting AFTER the painting rule. #531: born dead
since a6521c8, inert on main four days. #537: "this repo has learned this twice already". #545:
`.chart-drawer.open` (0,2,0) beat the stand-down (0,1,0), so a reader could not close what they
opened, live on main between #542 and #545. #546: `el.hidden = true` a silent no-op under an author
`display`. #535: "fixing a cascade defect with another media-query override would have been the
same bug again".

**Structural tests blind to a render the PR itself broke.** #530: the focus ring at 1.0:1, a WCAG
failure invisible to unit, e2e pixel guards, the prover, and the skeptic; four elements had leaned
on the removed pool. #546: the chart drawn at the full viewport under the nav, past 1877 unit and
23 e2e. #544: the head on three lines at 1280x800.

**Rosters joined by hand.** #542: five CSS rosters, one self-checks; the runner's `SUITES` map and
`MEASURED_SECONDS` unnamed by the issue. #546: the body listed none, the recon found seven, building
found two more; `--depth` passed as an undeclared variable because the sheet sat outside `PAGE_CSS`.

**Spec stale at build time, and calls made without a ruling.** #401: eight blocking stale items on
2026-09-05, two ratified statements false as written on 2026-09-08. #521: "waitSettled is ONE
function", the same error already caught in #463's re-baseline. #540: the body wrong when written.
#525: blast radius six pages, not one. Three PRs in a row implemented a call the issue had not ruled:
#519 (`beasts`), #542 (the phone leaf deferred without authority), #546 (a decision the re-baseline
left open and the session failed to write down).

## Once, and expensive

- #546: `cleanup()` called the promise `rm` unawaited; 446 leaked profiles, 20GB, two hours; the
  tell is a lane that STALLS rather than fails. Now in `CLAUDE.md`.
- #548: three of six sweep agents stopped before their ledger; the keeper scan found eleven
  stylesheet invariants; `ts.createScanner` reported 11 false drifts, only the full parser compares.
- #533: a mutation that looked right and was wrong (nulling `get()` made the arm faster and the
  guard passed; only nulling `prime()`'s hit test proved it).
- #536/#542: `decorateInset` ran before the inset was assigned; a singular `querySelector` hit the
  outgoing inset and worked only on the first commit. Both found by driving, not by tests.
- #528: the epic's proposed `~` separator would ride as `%7E`; measured, not taste.
- Earlier, #101: opened onto `feat/72-isotherms`; squashing that base deleted it and closed this PR
  un-reopenably, review record and all. Every PR in the run after it went onto `main`.
- Earlier, #363: searched `test/` for a non-`.test.ts` precedent, found none, concluded the repo had
  no convention and reverted a correct file split. `test-support/` already held six helpers.
- Later, #561: the guard behind Gate 1 line 8 measured "not a `.test.ts`" where node loads six
  extensions outside dot segments and `node_modules`, so a gitignored `.DS_Store` reddened `main`
  for two months unseen by CI, and the gate's own line taught the same over-broad rule. The first
  fix was measured in a scratch tree without `"type": "module"` and was wrong about `.TS`; the cold
  skeptic re-measured under the package's own type and found a loud red where a phantom was claimed.
- Later, #564: a 200 KB `input` to a child that DRAINS it wedged `spawnSync` on darwin and hung the
  unit lane with no red, twice on 2026-09-10 and twice more in 2000 reproduction runs on 2026-09-11
  (a further 12 in 12000 came back as ETIMEDOUT rather than hanging, because those runs were capped,
  which is what showed the cap is a remedy and not a hope).
  The payload had been delivered in full (the child's `/dev/null` offset read 200000) and the parent
  still held the write end of the socketpair, so the child's `read()` never saw EOF while the parent
  sat in `uv__io_poll`; the issue's own hypothesis, a write blocked into a full pipe, was wrong, and
  the lost-completion mechanism behind it stays UNVERIFIABLE. `--test-timeout` cannot bound a
  synchronous block. Now the Gate 1 line on bounding a spawned child.

## Where the long form lives

Auto-memory, `/Users/ahl/.claude/projects/-Users-ahl-CodeProjects/memory/`:
`feedback_guard_doctrine.md` (whether a guard bites), `feedback_measurement_doctrine.md` (whether
a measurement is true), `feedback_drive_real_input_not_synthetic.md`, `feedback_look_at_visual_work.md`,
`feedback_pr_discipline_doctrine.md`, `feedback_verification_budget_doctrine.md`,
`feedback_comment_doctrine.md`, `feedback_check_dont_reason.md`, and the `reference_*` files for
the tooling traps (CDP escapes, perl wide chars, the rebase subject strip, closing keywords).
