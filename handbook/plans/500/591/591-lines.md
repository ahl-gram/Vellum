# 591: the lines as they would land, final prose

Every new numbered item is APPENDED to the end of its gate, because `specs/flake-record.md` cites
"Gate 2 item 10" and `references/scars.md` cites "Gate 1 line 8".

## Gate 1, amendments

item 2, appended: **A differential guard's second world is a MEASUREMENT**: sweep for the seed whose
asserted quantities actually differ, since the obvious neighbour usually carries the same values and
the clause goes inert (#320). Pick the fixture on the metric the assertion uses, never a proxy for it
(#275).

item 3, appended: A DEFAULT is a fallback: a guard that exercises a threaded value only at its
default cannot tell threading from a hardcode, so assert once through the top-level API at a
non-default value (#412; #438 is the same hole, still open). A PATTERN is the same trap: name another
string yours also matches, and if the buggy build is one of them, count the terms instead (#387).

item 7, appended: And a determinism oracle builds a FRESH subject for the second run: a per-object
memo makes a same-object compare a tautology that passes however broken the computation is (#423).

item 9, appended: Mutate BY LINE, not by text: several wearers can share one declaration, so a
substitution changes them all at once and the red names nothing (PR #510).

## Gate 1, new items 11 to 14

11. **Seed 42 is the house fixture, and for layout it hides the class.** Narrow-width or
column-width work owes a sweep across seeds: seed 42's widest cell means a longer name fits under the
existing floor, so nothing moves and every test stays green while other seeds scroll sideways. Pin
the declaration by regex, so flipping its value fails too and not only deleting it (#49).

12. **`test-support/element-shim.ts` does no layout.** Every rect it reports is the one the test
STATED, so a computed box measures the shim; its queries answer nothing by design, which is true of
an undrawn mount; and it never grows a selector matcher, since a wrong one turns a caller's
stale-node removal into a silent no-op with the test still green. Where its empty answer makes a
removal unprovable, say so at the test and assert the teardown reached the mount instead (#319,
#387).

13. **A hand-rolled reader is a guard's blind spot.** A CSS selector reader splits on TOP-LEVEL
commas and tests the SUBJECT, the last compound, or an `:is()` arm, a pseudo-class on an ancestor and
a colon inside an attribute value each drop rules from the sweep. A markup regex allows trailing
attributes, and an empty parse never SKIPS a section unless every companion parse is empty too. And a
scan is keyed on what the DEFECT looks like, never on what the rule says: the hyphenated-property cut
skipped the two unhyphenated properties the contract policed, and passed (#353, #358, #360).

14. **Measure node itself, and never read a green off a grep.** A scratch tree probing what node
loads carries the package's `"type": "module"`, or it measures a different loader and neither answer
errors. `node --test` prints the spec reporter on stdout even when piped, so a hand-rolled mutation
loop grepping TAP's `not ok` reads every mutation as escaped. A test file that statically imports a
module which can exit at import dies before any test registers and is reported as one PASS with its
assertions gone from the tally, so a guard for "importing this does no work" spawns a child and
asserts on stdout. And `test/repo/comment-citations.test.ts` reds on any `name.js` inside a comment,
the gitignored bundle twins excepted (#554, #561).

## Gate 2, amendment

item 10, appended: **A hunt-suite red that will not reproduce locally is a date flake first**: that
suite runs the world the current UTC date seeds, so ask whether the run crossed 00:00Z before reading
the diff (#304).

## Gate 2, new items 12 to 14

12. **CDP input has a setup order, and two ways to poison a run for good.** Touch and device-metric
emulation go on BEFORE the navigate that boots the page (`setTouch` and `setMobileViewport` in
`scripts/e2e/harness.mjs`), because the zoom behaviour binds its touch listeners once, at bind time,
off `navigator.maxTouchPoints`. Never dispatch a touch with emulation off: it wedges the session's
touch pipeline and every later touch is silently dropped. Never change the emulation config after a
touch: later touches route to the browser's own pinch-zoom and no reload recovers it, so one
emulation per suite, set once, cleared at the end with no touch after. Coordinates are
visual-viewport space, so assert the scale before computing any. A two-point `touchMove` can still
arrive as two ordered half-steps and read as a one-finger pan, so a multi-touch claim needs more than
a before-and-after read. A drag on a native `range` sets `button: "left"` on every `mouseMoved`,
which d3 does not need, so the suites driven through d3 are the misleading precedent (#166, #220,
PR #474).

13. **A probe reads what it claims to read, and leaves the page as it found it.** `#status` keeps
only its LAST write, so it cannot witness that exactly one announcement was posted: arm a
`MutationObserver` before the gesture and count. A stayed-on-page claim comes from a FRESH evaluate
taken past the commit, because a pending anchor navigation commits only after the dispatching
evaluate returns. A probe that adds or strips a class or an inline style restores it, or a reveal
that fires on arrival diffs is already spent when the next check looks. And an arrival measured as
the first frame a diff predicate fires on is the OLD chart leaving an emptied mount: measure ink as a
fraction of the settled frame, against a control run (#270, #366, #220).

14. **A capture is a measurement, and it fails by returning a plausible picture.**
`Page.captureScreenshot`'s `clip` is in DOCUMENT coordinates, so a viewport rect fed to it on a
scrolled page photographs empty margin; add the scroll, or pass the clip to the `shoot` that
`start()` returns in `scripts/e2e/harness.mjs`, and read a uniformly coloured crop as the tell. And it cannot photograph a blocked main thread at
all: it waits for the next commit and hands back the frame after the block, so an unchanged result is
not evidence a frame failed to paint (#300, #442).

## Gate 4, new items 4 and 5

4. **A roster a guard checks is exported DATA the guard imports, never a list the guard restates.** A
hand-copied roster is one-sided by construction: it catches a member removed from the thing it checks
and can never catch one added and asserted nowhere, and the arithmetic still closes (#320).
`specs/site-architecture.md` names the rosters a page or a sheet joins, and which of them close
themselves.

5. **Two branches that must edit the same roster lines state the insertion order UP FRONT, and the
lower-numbered PR merges before the higher one opens.** Otherwise the higher brings its branch current
with `git merge origin/main` and takes the stated position. Never settle the collision by guessing an
order at merge time (#585).

## Gate 5, amendments

item 5, appended: A keyword binds to ONE reference and must sit immediately beside it: a bare list
closes only the first (PR #255 left #203 open), and any word between the keyword and the number
closes nothing. It is also inert while the base is a feature branch, so it goes on the last PR to
land and is re-checked after GitHub retargets the child (PR #408).

item 9, appended: A child retargeted after its base squash-merged reads CONFLICTING with a
byte-identical tree, because it carries the base's own commits while main carries one squash: replay
only the child's commits with `git rebase --onto origin/main <base-head> <child>`, never by merging
main in (PR #491, PR #492).

## Defaults this repo has already ruled, new bullet

- A trivial one-line edit made after the cold skeptic has finished does not earn another round; name
  it in the PR body and push (Alex, 2026-09-10, on PR #559).

## Never, new bullets

- `gh api repos/O/R/issues/N -f body=...` with `/comments` left off. Any `-f` switches the call to
  POST, the issue endpoint treats that as an update, and the BODY is replaced with no comment created
  and exit 0. Use `gh issue comment N --body-file <file>` or `.../issues/N/comments -f body=...`; the
  tell is a response `html_url` ending `/issues/N` (#193, PR #550).
- A rebase to bring a branch current. A conflicted `rebase --continue` re-commits through the editor
  path, whose default cleanup strips every line beginning with a number sign, which is almost every
  subject here, so the body's first line silently becomes the subject. `git merge origin/main`
  instead. A rebase is still the right tool where the house already prescribes one, after a deleted
  base and for a lost re-roll race.
- A perl substitution delimited by a pipe when the pattern also contains one: the escaped delimiter
  un-escapes to alternation, an empty alternative matches at offset zero, and the in-place write
  lands on the head of the file with no error.

## references/scars.md, three rows in the existing family structure

Under "A green check that proved nothing", the door "The assertion read its own input or the
fallback":

- #124: four of the reading's five ranking keys were pinned nowhere, because almost any ranking still
  produces a parse; the prover inverted the leftmost-longest key and moved corpus names with the
  suite green. Proves Gate 1 items 1 and 5.

Under the door "The fixture sat where the hazard is degenerate":

- #423: the collar guard's first cut fitted its jitter ceiling to the windows it happened to sample;
  the cold skeptic found border windows failing elsewhere, the rework reopened two prover holes, and
  the close was a window-independent contract plus an exact corner pin rather than a wider sweep.
  Proves Gate 1 item 2.

Under "The record said something nobody had measured":

- #582 round 2: the worktree fence was diagnosed as refusing the git token, the child recipe was
  written on that diagnosis and was still refused verbatim, and the body's "proved to run under the
  fence" had been measured on a fragment with a literal path rather than on the prescribed block.
  Round 3's cold skeptic returned four blocking findings, all the same mistake. Proves Gate 5 item 3.

## Gate scar headers

Gate 1 gains #49, #275, #319, #320, #353, #358, #360, #387, #412, #423, #554. Gate 2 gains #166,
#220, #270, #300, #304, #366, #442. Gate 4 gains #320 and #585. Gate 5 gains #193, #203, #255, #408,
#491, #559. Checked as a three-way join at the end: gate line, gate header, scars row.
