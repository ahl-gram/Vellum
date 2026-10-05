# The ledger behind the gates

Compiled 2026-09-09 from the bodies, commits and verification comments of PRs #524 to #548 and
their issues, with older and later scars added beneath when a gate needs one (#378, #518 to #521, #525, #526, #529, #531, #532, #539, #540, #543, epic #401).
Every row before "Behind the spec lines Issue #708 promoted" was found by a cold skeptic, a prover, a
plate-reader, CI, or Alex live, after the implementing session had already reported the work done.
Ranked by how many PRs in that window carried it. Where a lesson's rule is written down in this
repo, it is in one of the homes named at the end.

## Families, most recurrent first

**A green check that proved nothing.** Every PR in the window but #527, through four doors:

- *The fixture sat where the hazard is degenerate.* #528: every swept camera on a lattice point,
  where `Math.round` and `Math.floor` agree; a stride of 3 that never lands on 16/32/64, so the edge
  gate could never be false. #536: the window-midpoint shortcut, the exact hazard the finding exists
  for, passed all three checks. #533: a settle returning its last read on timeout kept CL4 green.
  #423: the collar guard's first cut fitted its jitter ceiling to the windows it happened to sample;
  the cold skeptic found border windows failing elsewhere, and the close was a window-independent
  contract plus an exact corner pin rather than a wider sweep. Proves Gate 1 item 2's derived-bound
  clause.
- *The assertion read its own input or the fallback.* #546: CD20 asserted `.hidden`, the property it
  had just set, green over two visible dead presses; CD19 satisfied by the "this world" fallback;
  PRR11's `slice` ran to EOF. #542: CD1 checked only that the dog-ear was CONTAINED, 8x oversized.
  #544: CD10 could not go red and was deleted; CD12's first form was green with the lift restored.
  #535: three states against one 4.5 floor, "it pinned one number three times". #545: old CD6 never
  fired `lay()`. #548: a comment deleted against a cited test that did not pin it. #124: the
  reading's ranking keys were invisible to a test that only asserts a name PARSED, since almost any
  ranking still produces a parse; the prover found the leftmost-longest key guarded nowhere and
  inverting it moved corpus names with the suite green. Earlier, Issue #155: the press check S21, as
  PR #290 first wrote it, asserted the `transform-box` declaration and passed on the buggy origin,
  while S26 measured the town point staying a fixed point of the press, 0.873px on the old origin
  against exactly 0 on the new at a 0.05px tolerance; S26 is RS22 in `e2e/suites/room-ink.ts`
  today. Proves Gate 1 item 3, its outcome clause included.
- *The instance, not the class.* #533: two siblings the first sweep missed. #536: three cameras
  pinned, the lattice unswept. #544: the clamp fixed on the road's button and not the stamp line.
  #530: one arm scoped of a selector list. #545: one child clamped.
- *Synthetic input over a control nobody can press.* #542: `element.click()` ignores
  `pointer-events`; a dead dog-ear reported as working and an eleven-check suite green over it.
  #545: the shut press 0% reachable, "the #520 dog-ear again". #546: the Glass bound but dead to
  touch, "the same defect one layer down"; CD7b read `reachable: 0` THREE times (runs 34305242149,
  34411380228 and 34678766918), the first re-run away and the other two left unexplained on main,
  which #578 settled and `.claude/skills/vellum-footguns/references/flake-record.md` now records; it
  was the drawer's slide not yet painted, leaving all six controls below the viewport.
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
body while the plate-reader was still running. PR #582 round 2: the worktree fence was diagnosed from
reasoning rather than a probe, the child recipe written on that diagnosis was still refused verbatim,
and the body's "proved to run under the fence" had been measured on a fragment with a literal path
rather than on the prescribed block; round 3's cold skeptic withdrew the claim. Proves Gate 5 item 3.

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
  tell is a lane that STALLS rather than fails. Now in `handbook/specs/settle-doctrine.md` under "The
  environment".
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
- Later, #562: the same guard's second clause saw only `*.test.ts` under the ROOT `test/`, while
  node collects any directory named `test` at any depth and the whole by-name family anywhere, so a
  src/x/test/helper.ts or the test-support/test-helpers.ts the gate's own line warns about would
  have run as a silent passing test. Two measurement traps on the way: the first case probe put both
  case variants of a path in ONE scratch tree, which macOS folds onto a single file, and reported a
  nested `test/` directory as uncollected; and "err toward a false positive" was applied to node's
  literal pattern segments, where it prevents no miss on any platform and only makes the message
  false, the reasoning that had withdrawn #561's extension fold eight hours earlier.
- Later, #564: a 200 KB `input` to a child that DRAINS it wedged `spawnSync` on darwin and hung the
  unit lane with no red, twice on 2026-09-10 and twice more in 2000 reproduction runs on 2026-09-11
  (a further 12 in 12000 came back as ETIMEDOUT rather than hanging, because those runs were capped,
  which is what showed the cap is a remedy and not a hope).
  The payload had been delivered in full (the child's `/dev/null` offset read 200000) and the parent
  still held the write end of the socketpair, so the child's `read()` never saw EOF while the parent
  sat in `uv__io_poll`; the issue's own hypothesis, a write blocked into a full pipe, was wrong, and
  the lost-completion mechanism behind it stays UNVERIFIABLE. `--test-timeout` cannot bound a
  synchronous block. Now the Gate 1 line on bounding a spawned child, whose two reasons live here:
  the limit is a cap on a hang, not a performance budget, which is why it sits far above the worst
  real run; and a cap nothing ever reaches cannot bite, which is why one child deliberately outlives
  it. It pins what reaches the spawn rather than what the option builder returns because the seam
  between them is where a default cap goes missing with every child still green.

## Promoted from the memory triage (Issue #708)

Older and later incidents behind gate lines that Issue #708 moved out of private memory, one row
each, with the gate line it proves. Each was read from the public record on 2026-10-02. A sentence
beginning "Added by Issue #729" came in on 2026-10-04: its incident or figure was checked against
the public record that day, and a lesson in it came from a private note.

- Issue #320, PR #349: freezing the manifest passed to `rearmAges` left RS23's output byte-identical,
  because `armAges` takes its range from `overlay.data()` and only forwards that argument. The
  mutation was confirmed live in `dist/reading-room/app.bundle.js` first, so the zero red was the
  aim; retargeted at `buildPlaceOverlay`, it reddened RS23 alone. Proves Gate 1 item 9's
  byte-identical clause.
- Issue #551, PR #552: the guard proving the selftest mints no scratch directory on import first
  read the real tmpdir and failed 3 of 3 beside `test/repo/footgun-gate.test.ts`, whose selftest
  holds a scratch directory mid-window; its child now gets its own `TMPDIR`. Proves Gate 1 item 10's
  `TMPDIR` clause. Added by Issue #729: `TMPDIR` is the instance the gate names; the general form is
  that any guard reading global state is not isolated from its siblings.
- Issue #547: CD14 to CD16 ran only at 390, so the phone leaf's two tabs, standing unstyled on the
  desktop, were asserted only where they belong; the fix's guard asserts them absent at a desktop
  width too. Proves Gate 1 item 11's both-sides clause.
- PR #554: the prover found 10 of 19 arms of Gate 6's roster regex with no fixture, so a typo in any
  of them would have shipped silent; the selftest now generates one row per arm. Proves
  Gate 1 item 13's per-arm clause.
- PR #631: TP2's `[^}]*`-bounded pattern could not cross a `}`, so a second spelling nesting
  `overrides: {}` between its two fields evaded it, the second guard in that PR blinded by the same
  brace, and the third prover round found a third of the family; call sites are now enumerated on
  the bare token. Proves Gate 1 item 13's bare-token clause.
- PR #380: the ci.yml tier guards checked only that their tokens were present, so a swapped ternary
  (pull requests on the full suite, main merged on smoke) and a lost `!` (smoke forced onto risky
  pull requests) both escaped; the run loop and the pass and fail rule moved where tests execute
  them, today `runSelected` and `runOutcome` in `e2e/support/suites.ts`. Proves Gate 1 item 17.
  Added by Issue #729: the shape regexes PR #380 wrote, `/&&\s*'smoke'\s*\|\|\s*'full'/` and one on
  `!contains(...)`, failed loudly on any reformat, harmless or not, the safe direction for a shape
  pin; they left with the logic they pinned, and the PR #380 diff is their only record.
- Issue #309, PR #410: inverting `topByScore` to anchor at the LOWEST score escaped all 1294 tests,
  since both ends of a connecting road land on the web whoever anchors; rank pins closed it, the
  inverted anchor turning the islet's village lane into a town trunk. Proves Gate 1 item 18.
- Issue #398, Issue #443: every finer-view guarantee was measured against the parent's resampled
  surface, where a one-cell strait is already closed, so 1428 passing tests could not see straits
  closing; the guard and the defect shared an oracle, and the fix labels the parent's landmasses on
  the parent's own grid (`test-support/parent-partition.ts`). Proves Gate 1 item 19. Added by
  Issue #729: a control that comes back vacuous is evidence about the oracle, not a fixture to swap
  until green.
- Issue #522, PR #631: every guard on the Chart Table's two doors sat on a pure function or on
  source text, so "the year is the Explorer's present" was pinned as `\d+` and `year: 1` shipped
  green, and swapping the booleans handed to `layPressFace` would have inverted a ruling with
  everything green; both closed by driving checks, each proved by running its mutation. Proves
  Gate 1 item 20. Added by Issue #729: the driving check goes beside the source read, never instead
  of it. The general form is PR #576's (Issue #575): a proof resting on several instruments, each
  blind where another sees, loses coverage silently when one is swapped for a better-looking one;
  there a file listing stood in for `git status --porcelain`, the only one of the two that sees a
  tracked file edited in place, and the proof now runs both.
- Issue #540, PR #545: BR6b's fixed offset landed on the new leaf tabs and read 59 against an
  unchanged ground; it was re-anchored to the docked press's own middle and mutation-proved against
  the pool it was written for. Proves Gate 2 item 4's moved-sample clause.
- Issue #400, PR #452: a held chain cache took a band-1 draw from about 550 ms to 294 ms, which moved
  Z17's read inside the outgoing sheet's crossfade, and `waitRedraft`'s 4 s poll, sized for the bare
  arm, was outrun on CI by a slower detailed draw; three checks had been sized around how fast a bare
  region draw used to be. Proves Gate 2 item 8's moved-cost clause.
- Issue #522: a card hanging below its box is pinned at a clearance of 0, so two arms both read 0.00
  while one card stood 16.28px taller; heights, not clearances, were the honest comparison. Proves
  Gate 2 item 15.
- Issue #638: a tagline measured against a control group's layout box reported two collisions that
  are not there and could not see a dateline at all; ink, every visible text node's line boxes and
  every control's own rect, swept from 320 to 480 a pixel at a time, found the class across eight
  pages. Proves Gate 3 item 3's collision clause. Added by Issue #729: the recipe is a TreeWalker
  over `SHOW_TEXT` that skips hidden ancestors, plus each control's own rect, and a crop of every
  page is viewed before a collision table is posted. The Gallery laid out at 347 when set to 320
  (Issue #672), so the layout width is read before a narrow measurement is trusted.

## Behind the spec lines Issue #708 promoted

The incidents and figures behind spec lines that Issue #708 promoted, brought into the repo by
Issue #729 on 2026-10-04, one row each with the spec line it stands behind. Each was checked against
the public record that day, and a stated unknown says so.

- Issue #368: only the popup was measured. Clipboard, fullscreen, audio and file pickers are likely
  gated on user activation the same way, and none of them has been measured. Stands behind
  `handbook/specs/settle-doctrine.md`'s popup at page load.
- Issue #221, Issue #317, Issue #320: the Explorer's survey checkbox is labelled `survey`, ratified
  on Issue #317 on 2026-07-29, but keeps `id="ages"` in `src/pages/explorer/index.astro`. Arrival
  at rest on every path was ratified on Issue #221 the same day and graduated to stable at Alex's
  post-use review, also on 2026-07-29; e2e RR7 and RR8 in `e2e/suites/reading-room/addresses.ts`
  hold its year address. The static Explorer keeps no voyage hooks by Issue #320's decision A.
  Stands behind `handbook/specs/explorer-doctrine.md`'s two hosts and arrival at rest.
- PR #277: W20b, the facing anti-flicker check, picked its fixture leg by raw x-reversals but
  asserted on the naive flip count; it was passing on a tie, the reordered itinerary shifted which
  leg won that tie, and it went toothless (naive flips 3 to 1) with a 5-flip leg left unselected.
  Issue #298 carried the lesson on as selecting the fixture on the metric asserted. Stands behind
  `handbook/specs/region-and-voyage.md`'s reorder bullet.
- PR #283, PR #277: each carries a comment headed "Raw evidence, mirrored here because `out/` is
  gitignored", Issue #185's ladders and Issue #275's scripts, the model of what an `out/`-only table
  owes. Stands behind `handbook/specs/development-workflow.md` step 10.
- PR #449, Issue #443: fused world landmasses went from 38, 52 and 52 to 0 at bands 1 to 3, while
  landmasses lost read 4 before and 3 after at band 1 against a bare control of 1, so "no shore
  disappears" was false in the one comparison that mattered. Stands behind
  `handbook/specs/development-workflow.md` step 10's control.
- Issue #145: a realm's five name candidates all stood in one column, which settlement labels had
  claimed first, so the realm went unnamed with room to spare; the diagnosis noted the arena itself
  was not instrumented, so its list of blockers is indicative. Stands behind
  `handbook/specs/chart-dress.md`'s claim order.

## Where the rules are written down

Where a lesson's rule is written down in this repo, it is in one of these: the gate lines in
`.claude/skills/vellum-footguns/SKILL.md`, each with its incident; `handbook/specs/settle-doctrine.md`
(how an e2e wait is written and what the harness does); `handbook/specs/development-workflow.md`
(what a pull request owes, and in what order); `handbook/specs/conventions.md` (the comment sweep,
citations, where a rule lives); `handbook/specs/ui-design.md`'s colour, contrast and legibility
section (measuring a ground); `handbook/specs/explorer-doctrine.md`,
`handbook/specs/region-and-voyage.md` and `handbook/specs/chart-dress.md` (the rules the spec-line
rows above stand behind); `CLAUDE.md`'s "Measure before you assert" and "Write visual samples to
out/"; the agent definitions under `.claude/agents/`; and, for the tooling traps (CDP escapes, perl
wide chars, the rebase subject strip, closing keywords), the Never list,
`.claude/skills/vellum-footguns/hooks/README.md` and the Never section of
`.claude/skills/vellum-footguns/references/held-lines.md`.
