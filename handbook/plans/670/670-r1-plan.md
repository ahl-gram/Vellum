# Issue #670, revision 1: the plate on a short window

**Planned at**: `origin/main` 393a7ff5819822f3b6f296ffd3aa9e2b39cd84c5, Issue #670 read with 6 comments (the 2026-10-07 re-baseline, the three rulings comments, the plan archive `6210006900`, the builder's calls `6210373266`), PR #900 at head de82f4179d0b9e20b29509d400d2fd8c6105df53. Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-16.

**Revises**: `handbook/plans/670/670-plan.md`, frozen on PR #900's branch and never edited. This revision builds the remaining commits of PR #900 on its own branch, `feat/670-portfolio-first-visit-plate`, continuing from de82f417, and is archived beside the frozen plan as `handbook/plans/670/670-r1-plan.md`.

**Rulings**:
- https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6205558519 and https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6209966485, as the frozen plan folds them.
- https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6213848650 (Alex, 2026-10-16), Q8, the plate on a window shorter than about 692 px: "(a) Let it shrink, write the cost down (Recommended)". The plate shrinks to fit like every sheet; nothing on the page changes; CD62 keeps reading the two ruled windows and its name says so; the cost is a Ruled and left row in `handbook/errata/site.md` with a comment on Issue #659; how big the plate reads on a short window stays on Issue #736's post-use docket.

**Open decisions**: none.

**Why there is a revision**: PR #900's cold review (finding 1, SHOULD-FIX) measured the plate's smallest words under the 13.12 px floor on short windows; the frozen plan, its stills, the menu Q5 and Q6 were ruled from, and CD62 covered 1024x768 and 1280x800 only. The implementer handed it back as a design finding (workflow step 15). `vellum-spec-recon` and one `vellum-plan-skeptic` round ran on this revision on 2026-10-16, and Alex ruled Q8 from its menu.

## Specs

On top of the frozen plan's list, read before building:

- `handbook/errata/README.md`, whole: a row, its one-line form, Ruled and left, the pointer issue.
- `handbook/specs/development-workflow.md`, steps 12 and 15: a call recorded as a NEW dated comment, a finding fixed after the review round.
- `handbook/specs/ui-design.md`, The room and its furniture, "The chart keeps a minimum size": why the plate shrinks, and what happens below 481 tall.

## What was measured (2026-10-16)

The planner's sweep, `node scripts/design/shoot.ts <list> --site dist` over a throwaway build of PR #900 on 393a7ff5, desktop windows set through device metrics, the bare Portfolio with the store cleared; a plate word's size is its computed font-size times the plate's rendered width over 1200, the floor the computed size of `#portfolio .slip-foot .note` read in the same run (13.12 px at every window). Files and raw probes: `out/670-r1-sweep/` (copied to the main checkout by the dispatcher).

1. **The floor holds at every window 692 px tall and up, at 1024 and 1280 wide, and nowhere from 481 to 691 tall**, where the plate is fitted by height (the chrome takes 254 px: the head cluster's foot at 127.4 plus the gap above, the chart folio and legend row 98.6 plus the gap below).

   | window | plate | smallest word | captions | floor |
   |---|---|---|---|---|
   | 1280x800 | 655.2x546.0 | 16.38 | 16.93 | MET |
   | 1280x720 | 559.2x466.0 | 13.98 | 14.45 | MET |
   | 1280x692 | 525.6x438.0 | 13.14 | 13.58 | MET |
   | 1280x689 | 522.0x435.0 | 13.05 | 13.48 | UNDER |
   | 1366x657 | 483.6x403.0 | 12.09 | 12.49 | UNDER |
   | 1280x650 | 475.2x396.0 | 11.88 | 12.28 | UNDER |
   | 1280x600 and 1024x600 | 415.2x346.0 | 10.38 | 10.73 | UNDER |
   | 1280x481 | 272.4x227.0 | 6.81 | 7.04 | UNDER (the worst) |
   | 1280x480 | 542.4x452.0 | 13.56 | 14.01 | MET (the stage's floor) |
   | 1280x466 | 525.6x438.0 | 13.14 | 13.58 | MET (the stage's floor) |
   | 1280x465 | 524.4x437.0 | 13.11 | 13.55 | UNDER |
   | 1024x768 | 568.6x473.8 | 14.21 | 14.69 | MET |
   | 1536x730, 1440x789, 1920x1080 | | 14.28, 16.05, 24.78 | | MET |

   Below 481 tall the stage's own floor (`fitStage`'s half-room branch) lays the plate over the whole window height under the chrome; NS1 (`e2e/suites/stage/short.ts`) already reads that state on the bare Portfolio at 1024x474 and 1024x430. The laptop window heights (1366x657 for a 1366 by 768 screen, 1536x730, 1440x789) are estimates of a browser's toolbars, UNVERIFIABLE here.

2. **The press verb's painted contrast slips with its size**: a median 4.64:1 at 1280x650 and 4.37:1 at 1280x560, under the 4.5 the contrast half of item 7 holds (`vellum-plate-reader` over the spike, `out/670-r1/notes.md` section 2, re-read by the planner from its `670-r1-plate-data.json`).

3. **Tablets keep the comparison.** An 820x1180 and a 768x1024 tablet held upright take the desk frame and read 14.21 CSS px against the 13.12 floor, since the floor shrinks with the page; an 1180x820 one held sideways lays out 1024x712 and reads 13.71. A real tablet browser's toolbars shorten that last window (UNVERIFIABLE here).

4. **Every sheet on the site shrinks by the same fit, and no sheet's lettering is held to a size anywhere.** Chart lettering reads 3 to 5 px at 1280x800 in the Explorer, the Print Room, the Reading Room, the Seed of the Day and a drafted Portfolio sheet; the Prospect plate's key reads about 10 px at 1280x800 and the slip repeats it at body size. The house checks short windows for sheet geometry (EL1, at 1280x720, 1024x600, 1024x474 and 932x430) and for the chrome's contrast over a floored sheet (NS1), never for a sheet's lettering size. The plate is the one sheet with a size floor, and the one whose words appear nowhere else on its page.

5. **The page's own smallest body text is the floor on the plate page too.** The smallest EB Garamond is the slip foot's note and the where-line, 13.12; the chart folio's new second line, at 12.8, is the flourish face, a caption, like the gloss at 12.16.

## The design

**Item 7's size half, restated** (its contrast half, 4.5:1 painted, stands as the frozen plan wrote it): every plate word renders at no less than the page's own smallest body text, 13.12 CSS px, at the windows the plate was ruled at (1024x768 and 1280x800) and on every window 692 px tall and up. On a shorter window the plate is fitted to the stage by height like every sheet, so its words fall under the floor (table above) and the press verb's contrast slips with them (item 2); the reader zooms it with the Glass (CD21). That cost is ruled (Q8) and recorded as a Ruled and left row in `handbook/errata/site.md`, with a comment on the ledger's pointer issue, Issue #659. **Nothing on the page changes.** CD62 keeps its two windows, and its name is narrowed to say so.

### Alternatives rejected, with the reason

- **A least plate size, the plate running under the chrome on a short window.** Ruled out by Q8. Measured: at 1280x650 the head cluster's pool lay over the title (a median 3.73:1, under 4.5), at 1280x560 the title went under the nav (1.02:1), and EL1 (Issue #762, "the sheet takes all of that room") would have needed a carve-out.
- **The plate's smaller words a size larger (34 viewBox units).** Ruled out by Q8. It reopened Q5's "build it as drawn" to gain about 50 px of window height, and set the press verb within about a pixel of its button's border.
- **The bare Portfolio scrolling down as a desk frame does.** ui-design rules that a desktop or laptop window takes no desk frame and that a chart room with a stage does not scroll.
- **A wider plate on a short window.** A new drawing never put to Alex, for one window range.

## Files

- **`handbook/plans/670/670-r1-plan.md`**: created, this plan copied unchanged from the scratchpad, beside the frozen `handbook/plans/670/670-plan.md`, which is not touched.
- **`e2e/suites/chart-drawer/portfolio.ts`**: CD62's check name only, in `cd62PlateReads`. The string
  `"CD62 every word of the plate reads at no less than the page's own smallest body text, the slip foot's note, at 1280 and at 1024, so the plate a stranger is shown is never set smaller than the page around it (Issue #670, ruled from the redrawn stills)"`
  becomes
  `"CD62 every word of the plate reads at no less than the page's own smallest body text, the slip foot's note, at 1280x800 and at 1024x768, the windows the plate was ruled at, so there the plate a stranger is shown is never set smaller than the page around it; a window under 692 px tall is a ruled cost in handbook/errata/site.md (Issue #670, ruled from the redrawn stills and on the short window)"`.
  Its two windows (the suite's 1280x800, then 1024x768) and its body are unchanged; laid out by `npm run format`. Nothing else in the file changes.
- **`handbook/errata/site.md`**: one row appended at the end of `## Ruled and left`, after the PR #802 row, as one physical line, exactly:
  ```
  - PR #900 (2026-10-16): the Portfolio's plate of the three steps is fitted to the stage by height like every sheet, so on a window under 692 px tall its smallest words fall under the 13.12 px floor CD62 holds at 1024x768 and 1280x800: 12.09 px at 1366x657 (a 1366 by 768 laptop's window, estimated), 11.88 at 1280x650, 10.38 at 1280x600 and at 1024x600 (the stage suite's short laptop window) and 6.81 at worst at 1280x481, above the stage's own floor, which lifts it to 13.14 to 13.56 from 466 to 480 tall, and its press verb paints at a median 4.37:1 at 1280x560 (the planner's sweep and plate read, 2026-10-16) Ruling: Alex, 2026-10-16, Issue #670 issuecomment-6213848650, Q8: "(a) Let it shrink, write the cost down (Recommended)".
  ```
- **Issue #659** (the ledger's pointer issue, "Errata: the ledger"): one comment, exactly:
  ```
  **Ruled and left, 2026-10-16 (Alex): a new PR #900 row in `handbook/errata/site.md`.** The Portfolio's plate of the three steps falls under its 13.12 px floor on a window under 692 px tall, shrinking with the stage like every sheet. Ruled on Issue #670's step 6 menu, Q8, "(a) Let it shrink, write the cost down (Recommended)": https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6213848650. PR #900 carries the row.
  ```
- **Issue #670**: one NEW dated comment (the earlier calls comment `6210373266` is never edited, workflow step 12), opening `Calls made in revision 1 (2026-10-16), none of which the issue or Alex ruled on.`, then: a pointer to the Q8 ruling comment above for Alex's ruling (not restated); a pointer to `handbook/plans/670/670-r1-plan.md` for the plan; the revision's Calls made below, by number, each in a line; and the shas of the two commits this revision adds.
- **PR #900's body** (`gh pr edit 900 --body-file`, every template section kept; verified in its own command afterwards, and `gh pr view 900 --json closingIssuesReferences` still reads Issue #670):
  - the opening paragraph names this revision beside the frozen plan, `handbook/plans/670/670-r1-plan.md`, ruled by Q8 (the link above), and gives its differences from the frozen plan (the list below);
  - Records, the `vellum-pr-skeptic` line: finding (1) was handed back, put to Alex as Q8 and ruled (a), with the ruling's link, the plate shrinking like every sheet, recorded as a Ruled and left row in `handbook/errata/site.md` (with the Issue #659 comment's link) and CD62's name narrowed to its two windows; and its closing `Not fixed here: the short-window floor (item 1), for the reason given` becomes `Not fixed here: the short-window floor (item 1), ruled accepted (Q8) and recorded in handbook/errata/site.md`;
  - Rulings: the line `open decisions still Alex's: the short-window floor ...` is replaced by the Q8 ruling's link with Alex's words, the new Issue #670 calls comment's link, and `open decisions still Alex's: none`;
  - Look for these when you use it: the first bullet (`Open for Alex, before merge: ...`) is replaced by one saying that on a window shorter than 692 px the plate shrinks with the stage like every sheet and its smallest words fall under the 13.12 px floor (12.09 px on a 1366 by 768 laptop's window, estimated; 6.81 at worst at 1280x481), ruled accepted (Q8), recorded in `handbook/errata/site.md`, and on Issue #736's docket;
  - Ran: the commands of this revision's Evidence and their results, named as the targeted local run.

### Not edited

- `src/`, `public/`, `test/`, every other e2e file, `handbook/specs/`: nothing on the page or in any rule changes.
- `handbook/plans/670/670-plan.md`: frozen.

## Tests

No new or strengthened guard: CD62's body is unchanged and only its name narrows to what it reads. No prover round and no plate read are owed (workflow step 15: no guard's behaviour changes and nothing on the page changes).

## Order of commits

On `feat/670-portfolio-first-visit-plate`, continuing from de82f417 (no new branch, no rebase); push each commit.

1. `#670 Archive the plan's revision for the short window`: `handbook/plans/670/670-r1-plan.md`.
2. `#670 CD62 names the windows it reads, and the short window joins the ledger as a ruled cost`: `e2e/suites/chart-drawer/portfolio.ts`, `handbook/errata/site.md`.

Then, in this order: the Evidence runs; the Issue #659 comment; the Issue #670 calls comment; the PR body.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- After `npm run build`: `VELLUM_E2E_SUITES=chart-drawer node e2e/run.ts` alone, never the lanes: 57 checks as before, CD62 green under its new name, the same skips (CD25, CD26, CD30).
- `grep -n "PR #900" handbook/errata/site.md` prints the one row, under `## Ruled and left`, after the PR #802 row.

## Differences from the frozen plan (for the PR body)

1. Design item 7's size half is restated: the floor holds at the windows the plate was ruled at and on every window 692 px tall and up; below that the plate shrinks like every sheet, a cost ruled (Q8) and recorded as a Ruled and left row in `handbook/errata/site.md`.
2. CD62's name narrows to its two windows; its body is unchanged.
3. A new dated calls comment on Issue #670 for this revision.
4. Corrections of fact, already true on the branch: the dark band at the plate's foot is `.vignette.bottom` (fixed, 176 px), not the fog; the CD20 and the CD62, CD21 steps are separate `step`s; the chart-drawer suite runs 57 checks.

## Calls made

1. **The floor is compared in the page's own CSS pixels**, so a tablet's shrunk desk frame keeps the comparison (measured, item 3). Rule: Q6 holds the plate to "the page's own smallest body text", which shrinks with the page.
2. **The chart folio's second line at 12.8 px is not under the floor**: it is the flourish face, a caption, and the floor is the body face's smallest size. Rule: ui-design, The case; Q6's "body text".
3. **The short windows are desktop windows set through device metrics, and the laptop heights are estimates**, labelled as such in the row. Rule: `CLAUDE.md`, Measure before you assert.
4. **The row's numbers name 1024x600**, the stage suite's own short laptop window (EA2), beside the laptop estimate, and carry the press verb's contrast dip in the same row. Rule: one cost, one row (`handbook/errata/README.md`), its measurement stated (ui-design: a deviation knowingly shipped is recorded with its measurement).
5. **CD62's narrowed name says "the windows the plate was ruled at"**, never "the windows the site is checked at", which the stage suite's short windows make false. Rule: a check's name is its claim.
6. **No guard, prover round or plate read is owed by this revision.** Rule: workflow step 15; nothing behaves differently.
7. **The revision is archived beside the frozen plan as `670-r1-plan.md`.** Rule: workflow step 8 (a plan is never edited; a revision is named with its difference), with `handbook/plans/778/` as the precedent for `-r<n>` revisions.

## Open decisions

None. Q8 is ruled in https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6213848650.

## Stop conditions

Hand back, with the command and its output, if:

- `git log --oneline de82f417..origin/feat/670-portfolio-first-visit-plate` lists a commit, or `git diff --stat 393a7ff5 origin/main -- e2e/suites/chart-drawer/ src/site/portfolio/ public/explorer/portfolio/` shows a change (Issue #767, which moves `src/site/portfolio/`, is still open).
- CD62's name on the branch is not exactly the old string quoted under Files.
- `handbook/errata/site.md`'s `## Ruled and left` section does not end with the PR #802 row.
- The chart-drawer suite's result differs from 57 checks with CD62 green and the same three skips.
- `npm run lint` or `npm run format:check` refuses the renamed string as written.
- Issue #670 carries a comment newer than issuecomment-6213848650 that is not a `Plan archive, not a ruling:` comment.
