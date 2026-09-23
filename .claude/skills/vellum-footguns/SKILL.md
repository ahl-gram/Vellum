---
name: vellum-footguns
description: Checklists keyed to the moment of typing. Read the matching gate before writing a test or guard, an e2e check or CDP probe, CSS, anything that joins a roster, anything that can move a chart or the golden, or a push and PR body.
---

# Vellum footguns: the gates

The doctrine behind every line here already exists, in `CLAUDE.md`, in `specs/rulebook.md`, in the
agents, and in the auto-memory doctrine files. It keeps failing anyway, and the record says why: it is read at session
start and applied at the push, hours apart, so the first push routinely carries a guard that cannot
go red, a probe that measured the wrong thing, a cascade rule that loses, or a body claim nobody
measured. The cold skeptic or the prover then changes the diff, and the lesson is re-learned on the
next sub. `references/scars.md` is the dated ledger.
`references/held-lines.md` holds the candidates that did not earn a line, each with the incident that would.

So this file is not doctrine. It is the checklist form of it, keyed to the moment you are about to
type. Read the gate you are at, do each line, and move on. Provenance is in `references/`.

## Gate 1: before writing a test or a guard

Scars: #49, #124, #270, #275, #295, #320, #353, #358, #360, #363, #380, #383, #387, #388, #400, #412, #423, #510, #528, #533, #535, #536, #542, #544, #545, #546, #551, #561, #562, #564.

1. **Write the mutation before the test.** Name the one-line change to `src/` that must turn this
   test red. If you cannot name one, you are about to write a test that cannot fail.
2. **Check the fixture is not degenerate where the hazard lives.** A camera on a lattice point, a
   window at the clamp edge, a stride that never lands on the case, a world that takes the fallback:
   each has passed a RED step. Assert the precondition that makes the case non-trivial in the same test.
   **A differential guard's second world is a MEASUREMENT**: sweep for the seed whose asserted
   quantities actually differ, and pick the fixture on the metric the assertion uses, not a proxy for
   it (#320, #275). A bound is DERIVED and the sweep only corroborates it; a ceiling fitted to the
   windows you happened to sample is not a bound (#423).
3. **Never assert a value the test just set or a value the fallback also yields.** `.hidden` you set,
   a "this world" default, a `slice` that ran to EOF: a check on its own input is not a guard. A
   DEFAULT is a fallback too: a guard that exercises a threaded value only at its default cannot tell
   threading from a hardcode, so assert once through the top-level API at a non-default value (#412).
4. **Narrowing before asserting owes an anchor check.** `indexOf`, `slice`, `match`, `find`: assert
   the anchor was found (`notEqual(at, -1)`) before the negative assertion runs against the remainder.
5. **N states or N siblings need N pins, not one floor.** Assert each state's own resolved value
   against a measured constant. A shared threshold, or A compared to B, is one pin written N times.
6. **Guard the class.** List every instance the rule binds (every arm of a selector list, every page
   that carries its own sheet, every seat of the lattice) and sweep them. Two samples is the instance.
7. **A transparent component (cache, memo, fast path) is guarded by its own counters**, never by an
   output compare. Ask what "delete it entirely" does to the assertion; if nothing, rewrite. A
   determinism oracle builds a FRESH subject for the second run: a per-object memo makes a
   same-object compare a tautology that passes however broken the computation is (#423).
8. **A shared helper goes in `test-support/`, never in `test/`, and never in a sibling.** `node
   --test` collects every `.ts`/`.js` module under ANY directory named `test`, at any depth (its six
   extensions, outside dot segments and `node_modules`), so a bare helper there is reported as a
   passing test of its own, and a `.test.ts` that imports a sibling `.test.ts` runs that sibling's
   tests a second time. Neither fails; both inflate the count. It also collects, ANYWHERE in the
   tree, a file named `test`, `test-*`, `*-test`, `*_test` or `*.test`, so a helper in
   `test-support/` must not carry one of those names either; `test/repo/test-collection.test.ts`
   reds on both arms. If `test-support/` has no precedent for the
   shape you need, that is not evidence the repo lacks the convention: it already holds the helpers
   and the importers.
9. **Run the mutation, paste the red line into the PR body's guard table**, commit, then dispatch
   `vellum-guard-prover` for the whole guard set (10 minutes, unit tests only, name the mutations you
   did NOT try). It mutates in its OWN detached worktree, built by `scripts/agent-sandbox.ts` at the
   DISPATCH tree's HEAD (#575), so uncommitted work is not in the tree it proves unless carried
   across by hand: commit first, or you prove something about a different tree than the one you are
   shipping, and the sha it reports is then a false attribution it has to declare. Zero red is a
   hole. A guard proved unable to red is deleted, never shipped. Mutate BY LINE, never by text:
   several wearers can share one declaration, so a substitution changes them all at once and the red
   names nothing (PR #510).
10. **A test that spawns a child gives it its own time limit.** `execFileSync` takes a `timeout`;
    with none, a wedged child hangs the unit lane forever with no red to read, and `--test-timeout`
    cannot save it, because the block is synchronous and the runner's own timer never gets the event
    loop. The shape that wedges is a large `input` to a child that DRAINS it (#564, measured in
    `references/scars.md`). The limit is a cap on a hang, not a performance budget, so set it far
    above the worst real run; and a cap nothing ever reaches cannot bite, so keep one child that
    deliberately outlives it, written as a SINGLE command (`sh -c 'sleep 5'`), since killing a
    multi-command child orphans its grandchild and the cap then leaks a process every time it fires.
    Pin what reaches the spawn, not what the option builder returns: the seam between them is where
    a default cap goes missing with every child still green.
11. **Narrow-width or column-width work owes a sweep across seeds, never the seed-42 fixture.** Seed
    42 is one of the few clean seeds, which is why a sideways-scroll defect left the suite green
    while other seeds overflowed. Pin the declaration by regex, so flipping its value fails too and
    not only deleting it (#49, PR #406).
12. **`test-support/element-shim.ts` does no layout.** Every rect it reports is the one the test
    STATED, so a box computed from it measures the shim and not the code (#387, #388).
13. **A hand-rolled reader is a guard's blind spot.** A CSS selector reader splits on TOP-LEVEL
    commas and tests the SUBJECT, the last compound; otherwise an `:is()` arm, an ancestor's
    pseudo-class and a colon inside an attribute value each drop rules from the sweep (#358). A
    markup regex allows trailing attributes, and an empty parse never SKIPS a section unless every
    companion parse is empty too (#353, whose guards went blind when #270 added per-term ids).
14. **A test file that imports a module which can exit at import is reported as a PASS.** It dies
    before any `test()` registers and its assertions are simply gone from the tally, with nothing
    saying so, which is the zero-red alarm inverted. A guard for "importing this does no work" SPAWNS
    the module as a child and asserts on stdout (#551, PR #552).
15. **A scan is keyed on what the DEFECT looks like, never on what the rule says.** The
    hyphenated-property cut skipped the unhyphenated properties the contract policed, so the sources
    that could hold the defect were exactly the ones it did not select, and it passed (#360).
16. **A roster a guard checks is exported DATA the guard imports, never a list the guard restates.** A
    hand-copied roster is one-sided by construction: it catches a member removed from the thing it
    checks and can never catch one added and asserted nowhere, and the arithmetic still closes (#320).

## Gate 2: before writing an e2e check or a CDP probe

Scars: #366, #368, #454, #474, #501, #520, #526, #529, #533, #535, #536, #537, #540, #542, #545, #546.

1. **A gesture check drives the gesture.** Press and release with the suites' `clickAt` (`makeStage`
   in `scripts/e2e/home-support.ts`) and the harness's touch helpers, at coordinates read from the
   element's own rect. `element.click()` ignores `pointer-events`
   and every element painted over the target; use it only for wiring, with the reason at the check.
   A multi-touch gesture can hand back the artifact you hoped to see: with no touch-pan path, two
   fingers reached only the pinch handler and the apparent pan was two zoom half-steps whose factors
   cancel unless one is clamped, which a before-and-after read cannot tell from the real thing
   (PR #474's review, fixed in PR #477). A multi-touch claim owes evidence of both fingers.
2. **Reachability is its own assertion**: `document.elementFromPoint(x, y) === el`, taken with the
   thing OPEN and after `scrollIntoView({block: "center"})`. Off-viewport returns null, not "hidden".
3. **Visible means `getBoundingClientRect().width > 0`.** `getComputedStyle(child).display` is not
   `none` when an ANCESTOR is `display: none`.
4. **Sample the thing's own rect, never a fixed offset.** A proxy coordinate decays the day something
   else lands there. Sample a ground with the MEDIAN of a run, never a max (one bright control passes
   it) or a min (one hairline fails it). Give the sample a control that legitimately paints.
5. **A regex inside a CDP `evaluate` template literal loses its backslashes.** Write `\\s`, or build
   the payload with `String.raw`. It never throws: `/\s+/` arrives as `/s+/` and splits on the letter. The hook refuses the
   single-escaped form in every `.ts` and `.mjs` under `scripts/` and `out/`.
6. **No blind sleeps.** A settle polls to rest, requires the geometry to have LEFT where it began
   (stillness at the start looks like stillness at the end), and never carries the check's own claim.
   **A readiness wait THROWS on timeout; a measurement poll keeps reading and asserts on its LAST
   sample, never its first**, which is whatever was still in flight, and it throws too rather than
   handing back that last read (ruled 2026-09-13, #589). **The throw belongs inside a `step`**: wrap
   the gestures, waits and checks of one numbered check in `step("CL5", async () => ...)` and a
   timeout fails that check by name
   instead of taking the suite with it (#534). See `specs/settle-doctrine.md`.
7. **A wait's break condition demands every conjunct the check asserts.** Navigation commits before
   the document parses; a same-URL `Page.navigate` returns on the stale document; any redraft is not
   the redraft the gesture requested.
8. **A budget is derived, dated, and named at the constant**: measured worst case times a runner
   factor, with the suite size it was measured at. A wall-clock cap measures the runner; read the
   engine's own clock. Pin the transition duration so a settle cannot wait out a 10x regression.
9. **Run the probe's control in the same run**: one case known to pass and one known to fail. Your
   root font size, a cached stylesheet from a persistent profile, and a rect field name (`y` read as
   `top` makes `undefined >= n` quietly false) are the first suspects when a probe surprises you.
10. **A red is yours until proven a flake.** Re-run ONCE, alone, never two PRs concurrently; a
    second red is a defect. Put the payload and what to capture next in a PR comment; never re-run it
    away. **Give it a row in `references/flake-record.md` BEFORE you re-run**, one row per failure
    with the run id, the payload and the disposition: #578 found CD7b had failed this way three times and that
    reconstructing even that cost a forty-run dig. A flaky check biting a content-only PR keeps
    measuring and logging but stops asserting, with the issue number at the line.
11. **A run whose log has not moved in ten minutes is hung, not slow.** Before reporting "still
    running", check `ls -d /var/folders/*/*/T/vellum-e2e-* | wc -l` and
    `ps aux | grep '[r]emote-debugging-port'`; a starved machine stalls a lane you did not touch.
    When you kill a run, kill the shell waiting on it too. Run local suites one at a time.
12. **Measure the instant you mean, and say at the check why that is the instant.** An arrival taken
    from the first frame a diff predicate fires on is the OLD chart LEAVING an emptied mount, so
    measure ink as a fraction of the settled frame against a control run (#366).
13. **A capture is a measurement, and it fails by handing back a plausible picture.**
    `Page.captureScreenshot`'s `clip` is in DOCUMENT coordinates, so a viewport rect fed to it on a
    scrolled page photographs empty margin rather than the thing you meant, and a uniformly coloured
    crop is the tell; `sampleRow` in `scripts/e2e/pixel-support.ts` adds the scroll for you (plate
    read on PR #501, ruling 6 of the 2026-09-03 sitting on Issue #454, fixed in PR #510). A
    NEGATIVE origin is the other way a clip lies, and `specs/settle-doctrine.md`'s environment
    section carries what comes back and what to clamp.
14. **Where the window you need is unreachable by a naturally written check, reach it deliberately.**
    Block the page's own main thread, queue a marker behind the code's own hop, or dispatch from
    inside a `MutationObserver` callback, which lands in a gap a wall clock cannot hit. Say at the
    check why the instrument is artificial (#366).

## Gate 3: before writing CSS or moving layout

Scars: #219, #295, #465, #525, #530, #531, #532, #535, #537, #542, #543, #545, #546.

The traps themselves are `specs/cascade-traps.md`'s, and the look they break is `specs/ui-design.md`'s.
This is the checklist; the reasons are not copied here.

1. **Compute the specificity of the rule you are overriding, in numbers.** A media query adds none.
   Each arm of a selector list ranks on its own. `:has()` and compound arms outrank a bare class.
   An inline style beats every sheet rule. Author `display` makes `[hidden]` inert.
2. **Fix the cascade by restructuring, never by another override.** Scope the painting rule so a
   seventh room inherits the safe default without anyone remembering this defect. If your fix is
   one more override, you are writing the bug that was just fixed.
3. **Decide HOW you will look before writing the rule.** Then render through CDP at 390 and 1280
   (`--window-size` does not set the layout viewport) and read the WHOLE frame: rows, wraps, seats,
   the nav, the head, and after every open and close, what the previous state left behind (a
   tooltip, a class, an inline style). The piece you changed is the one place you will look by default.
4. **Re-grounding a surface owes a contrast sweep of everything standing on it**: rest, hover,
   focus-visible, disabled, marks, roads. A defect that painted over a surface hid how the rest of it
   read.
5. **Presentation work owes `vellum-plate-reader` TWICE** where the ruling was made from stills, at
   workflow steps 6 and 11, which that file specifies. The step 11 record goes in the PR as a comment
   before the body claims it exists.
6. **A feel decision gets rendered variants before a ruling**, the contract for which is
   `specs/development-workflow.md` step 6: the candidates, the control arm, and where the stills go.
   The ruling stays provisional until Alex has used the branch live. Pin correctness now, let
   dressing-level pins lag one live cycle.

## Gate 4: before adding anything that joins a roster

Scars: #401, #542, #546.

A new page, sheet, suite, room, or CSS surface joins lists it does not know about, and most of them
fail silently (an undeclared CSS variable, a suite the runner never calls, a budget nobody re-measured).

1. `grep -rn` the nearest sibling's name across `src/`, `scripts/`, `test/`, `.github/` and join
   every list it appears in: the runner's `SUITES` map, `PAGE_CSS`, `MEASURED_SECONDS`, the tiers
   test, the tip-affordance roster, the discovery files.
2. Name in the PR body which rosters self-check and which were joined by hand;
   `specs/site-architecture.md` names the rosters a page or a sheet joins, and which close themselves.
3. Re-measure any budget the roster carries; a number measured on an eleven-check suite is wrong on a
   twenty-three-check one.

## Gate 5: before the push and the PR body

Scars: #49, #101, #203, #255, #408, #486, #491, #492, #507, #508, #524, #528, #530, #541, #542, #546, #548, #582, #593, #596; calls made without a ruling on #519, #542, #546.

1. **Dead code sweep.** Every new export has a second reference. Every new field has a reader that
   produces a STRING on a surface (carries, reads, is wired through describe plumbing; shows, prints,
   says describe a surface). Every new CSS rule shows as winning in a computed-style probe. No
   `x = cond ? x : x`, no rule an inline style already beats.
2. **Comments.** One line, never a wrapped block mid-file. If a test pins it, delete it. Git
   archaeology goes in the commit message. A measured number goes in a dated constant.
3. **A claim about your own work is a claim like any other, and it is the one most often wrong.**
   "Verified live", "the sweep cleared", "recovered 25", "green": each names the command and the run
   it came from (a suite, not a deploy badge; the page opened, not the rule read). Every number in the
   body comes from a log line you can paste. A budget carries its date and the suite size it was
   measured at. A count in a durable doc is a pointer instead.
4. **Say which suites ran and which did not.** A record exists (link it) or is "in flight"; it is
   never "in the comments" before it lands there.
5. `gh pr view <N> --json closingIssuesReferences` lists exactly the issue you mean. GitHub reads
   "does not close #N" as closing #N. The grammar is one KEYWORD immediately followed by one
   reference: `Closes #a, #b` closes only `#a`, a word between the keyword and the number closes
   nothing, and a verb that is not on GitHub's list closes nothing either, which is how PR #255's
   "implements #203" left #203 to be shut by hand an hour after the merge. It is also inert while the
   base is a feature branch, so the keyword goes on the last PR to land and is re-checked after the
   retarget (PR #408).
6. `grep -n '—'` over the body and the diff returns nothing.
7. **A finding this PR does not fix is FILED or added to `errata/`, never left as prose in the
   body.** A sibling defect found on the way is filed, or joins the ledger as one row (the PR, the
   finding, what was searched; `errata/README.md` has the shape), not folded; grep `errata/` and
   the open issues for it first. The exceptions that fold: an accessibility failure this PR itself
   caused, and an orchestrated batch whose dispatcher has relayed Alex's ruling to fold for that
   batch (ruled 2026-09-14, Issue #591).
8. **Any call you made that the issue did not rule on gets a dated issue comment before the PR is
   opened.** The branch goes up at the first commit, so the review is the deadline that matters, not
   the push. The skeptic diffs against the newest ratified statement. A recon that falsifies an
   older comment says so in a new comment; the old one is never edited. **A ruling of Alex's goes
   there too, and you are the one who records it**: he rules in the session, which leaves the issue
   reading unruled to everyone after. Where there is no issue, the PR body and a PR comment are the
   record. Open decisions go to Alex as a menu, and you STOP there.
9. **A stacked PR lands BEFORE its base does.** Squashing a base deletes the branch, and a PR whose
   base is gone is closed and can be neither reopened nor retargeted: the review record goes with it.
   Stacking itself is fine and is how the integration epics ship, every child merging into the epic
   branch before the epic merges to `main`. What kills a PR is its base landing while the child is
   still open, so check for open children before merging any branch that has them. If it has already
   happened, rebase onto `main` and open a fresh successor that cross-references the closed one. A
   child retargeted after its base SQUASH-merged reads CONFLICTING against a byte-identical tree,
   because it carries the base's own commits while main carries one squash: replay only the child's
   with `git rebase --onto origin/main <base-head> <child>`, then read `git log --oneline` over the
   replayed range. The replay is the whole repair for a squashed base: do NOT merge main in for that
   one (PR #491, PR #492). **Two branches that must edit the same roster lines state the insertion
   order UP FRONT, and the lower-numbered PR merges first** (ruled on epic #585); there, and only
   there, the higher one DOES bring its branch current with `git merge origin/main` and take the
   stated position, which is what resolved #593 against #596 with both already open.
10. Then `vellum-pr-skeptic`, dispatched COLD (the PR number and nothing else), with no edits under it
    while it runs; three rounds at most, and a finding not fixed is filed or an `errata/` row
    (item 7), never body prose. **Commit before you dispatch it**,
    and before any review agent: it runs in the directory you launched it from, and a suite run there
    DELETES the generated assets under `public/`, which neither `git status` nor `git status --ignored`
    reports (#573). `.github/PULL_REQUEST_TEMPLATE.md` is the shape, and the hook refuses a body that skips one of its sections.

## Gate 6: before changing the renderer or a committed chart

Scars: #40 (the drift guard exists because a regen was forgotten), #205 (the regen commands), #309 (a change everyone priced as a re-roll and measured as a regen), #489 (the icons, a committed pair with a single writer), and the 2026-09-09 move of these rules out of `CLAUDE.md`.

The authority is `specs/rulebook.md`, its golden discipline and its flight-exclusion set. This is the
checklist; the file has the reasoning, the checksum and the set's current membership, none of which
are copied here.

1. **Decide which cost you are paying.** A render change that moves a label or a path regenerates the
   committed charts and is checksum-safe. A terrain, culture or name-template change moves world
   identity and re-pins the golden. Only the second one is scarce, and confusing them is how a cheap
   change ends up waiting behind a re-roll.
2. **A regen lands ALONE.** Bundled with any other chart-changing work a chart delta cannot be
   attributed to a cause, and the diff is the only non-circular check you have.
3. **Snapshot the committed charts BEFORE you regenerate.** Verification is a diff of old against new
   and you cannot take it afterwards. Name the labels that moved: a good regen is small and explicable.
4. **The drift guard is circular once you have regenerated.** `test/site/hero-charts.test.ts` compares
   a fresh render against the committed one, so it catches a FORGOTTEN regen, never a wrong one. It
   passing after a regen means nothing.
5. **Never byte-compare SVGs rendered in different environments.** Trigonometry is not correctly
   rounded, so coordinates drift and a rounding boundary can flip. Compare structure exactly and
   numbers with a tolerance. A naive byte compare passes on a Mac and fails on linux CI.
6. **A re-roll reads the flight-exclusion set first.** Only one may be in flight at a time. The loser
   rebases, re-pins and regenerates.
7. **"No regen owed" is a claim like any other.** Name the command whose green output says so, in the
   PR body, the way every other claim about your own work is named.

## Defaults this repo has already ruled

- Push the branch at the first commit; eight local commits unpushed was "the wrong default" (#520
  part 2, 2026-09-08).
- No draft PRs; the convention does not exist here (#542 was opened as one and asked about,
  2026-09-08; none of the last hundred PRs is a draft).
- Do not stop mid-build to narrate. A status report with no tool call is a stop, and Alex had to
  type "continue" five times on 2026-09-08. Report at the gate, not between them.
- A mid-build naming or placement choice (a new file, a new stylesheet, a new key) is Alex's when
  it is visible in the tree; ask with a menu, once, before writing it (`drawer.ts` was taken and
  `chart-drawer` ruled, #519, 2026-09-07; the drawer's own stylesheet, #520).
- A trivial one-line edit made after the cold skeptic has finished does not earn another round; name
  it in the PR body and push (Alex, 2026-09-10, on PR #559).

## Never

The hook in `hooks/`, wired in `.claude/settings.json`, refuses the mechanical ones outright, enumerated in `hooks/README.md`; the rest are yours. Provenance: the stash stack (PR #369 and the worktree rules), perl (2026-09-02, twice in one session), CDP escapes (#520, #540), closing keywords (#486, #524), truncation read as absence (2026-07-26), `gh issue view` (CLAUDE.md), the issue-body overwrite (#193, PR #550), the profile leak (#546), counts in durable docs (2026-08, four rulings), the PR body shape (#577).

- A bare mutation of the stash stack (`git stash`, `pop`, `clear`, `apply` or `drop` without a ref): it is shared across every worktree. `git stash push -m ... -- <paths>`, `apply <sha>`, or a WIP commit.
- `perl -pi` with a non-ASCII replacement: it re-encodes every existing non-ASCII byte in the file. Use node or a heredoc, then grep for `Â`.
- A single-escaped `\s`, `\d`, `\w`, `\b` inside a backtick string in a `.ts` or `.mjs` file under `scripts/` or `out/`.
- A PR body with an em-dash, or with "not close #N" / "does not fix #N".
- A PR body that skips one of `.github/PULL_REQUEST_TEMPLATE.md`'s `## ` sections. Presence is the check, not content: a section with nothing to report says so and stays.
- A negative claim built from `head`, `tail`, `--limit`, or a jq slice. Count against the true total or query the item.
- `gh issue view` as evidence an issue is empty. It silently returns nothing for some issues here; use `gh api`.
- `gh api repos/O/R/issues/N -f body=...` with `/comments` left off. Any `-f` switches the call to POST, the issue endpoint treats that as an update, so the BODY is replaced, no comment is created, and it exits 0. Use `gh issue comment N --body-file <file>`, or `.../issues/N/comments -f body=...`, and `-X PATCH` when a body edit IS the intent; the tell is a response `html_url` ending `/issues/N` instead of `#issuecomment-<id>` (#193, PR #550).
- `pkill` on a run you intend to repeat; the harness leaves a browser profile behind for every kill.
- Removing the worktree you stand in, or any worktree another session holds; and, dispatched as a review agent, moving or restoring the tree you were dispatched from at all. `git restore` and `git checkout -- <path>` are the silent ones: they leave no reflog entry at all, while `checkout -f` does. A plain checkout aborts when the modified file differs between the two commits and carries the edit forward when it does not, so it is not the one that eats work.
- A test count, a phase count, or an e2e total in `CLAUDE.md`, memory, or `RESUME-HERE.md`.
- A compound `write the body && gh ...` call; auto mode refuses it as one action. Write the body,
  then one plain `gh` per call.
