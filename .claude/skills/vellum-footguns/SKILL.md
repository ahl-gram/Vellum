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

So this file is not doctrine. It is the checklist form of it, keyed to the moment you are about to
type. Read the gate you are at, do each line, and move on. Provenance is in `references/`.

## Gate 1: before writing a test or a guard

Scars: #295, #380, #383, #400, #528, #533, #535, #536, #542, #544, #545, #546.

1. **Write the mutation before the test.** Name the one-line change to `src/` that must turn this
   test red. If you cannot name one, you are about to write a test that cannot fail.
2. **Check the fixture is not degenerate where the hazard lives.** A camera on a lattice point, a
   window at the clamp edge, a stride that never lands on the case, a world that takes the fallback:
   each has passed a RED step. Assert the precondition that makes the case non-trivial in the same test.
3. **Never assert a value the test just set or a value the fallback also yields.** `.hidden` you set,
   a "this world" default, a `slice` that ran to EOF: a check on its own input is not a guard.
4. **Narrowing before asserting owes an anchor check.** `indexOf`, `slice`, `match`, `find`: assert
   the anchor was found (`notEqual(at, -1)`) before the negative assertion runs against the remainder.
5. **N states or N siblings need N pins, not one floor.** Assert each state's own resolved value
   against a measured constant. A shared threshold, or A compared to B, is one pin written N times.
6. **Guard the class.** List every instance the rule binds (every arm of a selector list, every page
   that carries its own sheet, every seat of the lattice) and sweep them. Two samples is the instance.
7. **A transparent component (cache, memo, fast path) is guarded by its own counters**, never by an
   output compare. Ask what "delete it entirely" does to the assertion; if nothing, rewrite.
8. **Run the mutation, paste the red line into the PR body's guard table**, commit, then dispatch
   `vellum-guard-prover` for the whole guard set (10 minutes, unit tests only, name the mutations you
   did NOT try). Its restore is `git checkout --`, so uncommitted work under it is gone. Zero red is
   a hole. A guard proved unable to red is deleted, never shipped.

## Gate 2: before writing an e2e check or a CDP probe

Scars: #368, #474, #520, #526, #529, #533, #535, #536, #537, #540, #542, #545, #546.

1. **A gesture check drives the gesture.** Press and release with the harness's `clickAt` / touch
   helpers at coordinates read from the element's own rect. `element.click()` ignores `pointer-events`
   and every element painted over the target; use it only for wiring, with the reason at the check.
2. **Reachability is its own assertion**: `document.elementFromPoint(x, y) === el`, taken with the
   thing OPEN and after `scrollIntoView({block: "center"})`. Off-viewport returns null, not "hidden".
3. **Visible means `getBoundingClientRect().width > 0`.** `getComputedStyle(child).display` is not
   `none` when an ANCESTOR is `display: none`.
4. **Sample the thing's own rect, never a fixed offset.** A proxy coordinate decays the day something
   else lands there. Sample a ground with the MEDIAN of a run, never a max (one bright control passes
   it) or a min (one hairline fails it). Give the sample a control that legitimately paints.
5. **A regex inside a CDP `evaluate` template literal loses its backslashes.** Write `\\s`, or build
   the payload with `String.raw`. It never throws: `/\s+/` arrives as `/s+/` and splits on the letter.
6. **No blind sleeps.** A settle polls to rest, THROWS on timeout (a settle that gives up kills the
   lane), requires the geometry to have LEFT where it began (stillness at the start looks like
   stillness at the end), and never carries the check's own claim. See `references/settle-doctrine.md`.
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
    away. A flaky check biting a content-only PR keeps measuring and logging but stops asserting, with
    the issue number at the line.
11. **A run whose log has not moved in ten minutes is hung, not slow.** Before reporting "still
    running", check `ls -d /var/folders/*/*/T/vellum-e2e-* | wc -l` and
    `ps aux | grep '[r]emote-debugging-port'`; a starved machine stalls a lane you did not touch.
    When you kill a run, kill the shell waiting on it too. Run local suites one at a time.

## Gate 3: before writing CSS or moving layout

Scars: #219, #295, #465, #525, #530, #531, #532, #535, #537, #542, #543, #545, #546.

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
5. **Presentation work owes `vellum-plate-reader` on the pushed branch**, and its record goes in
   the PR as a comment before the body claims it exists.
6. **A feel decision gets rendered variants before a ruling**, and the ruling stays provisional until
   Alex has used the branch live. Pin correctness now, let dressing-level pins lag one live cycle.

## Gate 4: before adding anything that joins a roster

Scars: #401, #542, #546.

A new page, sheet, suite, room, or CSS surface joins lists it does not know about, and most of them
fail silently (an undeclared CSS variable, a suite the runner never calls, a budget nobody re-measured).

1. `grep -rn` the nearest sibling's name across `src/`, `scripts/`, `test/`, `.github/` and join
   every list it appears in: the runner's `SUITES` map, `PAGE_CSS`, `MEASURED_SECONDS`, the tiers
   test, the tip-affordance roster, the discovery files.
2. Name in the PR body which rosters self-check and which were joined by hand.
3. Re-measure any budget the roster carries; a number measured on an eleven-check suite is wrong on a
   twenty-three-check one.

## Gate 5: before the push and the PR body

Scars: #49, #486, #507, #508, #524, #528, #530, #541, #542, #546, #548; calls made without a ruling on #519, #542, #546.

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
   "does not close #N" as closing #N.
6. `grep -n '—'` over the body and the diff returns nothing.
7. **A sibling defect found on the way is filed, not folded**, unless it is an accessibility failure
   this PR itself caused.
8. **Any call you made that the issue did not rule on gets a dated issue comment BEFORE the push.**
   The skeptic diffs against the newest ratified statement. A recon that falsifies an older comment
   says so in a new comment; the old one is never edited. Open decisions go to Alex as a menu, and
   you STOP there.
9. Then `vellum-pr-skeptic`, dispatched COLD (the PR number and nothing else), with no edits under it
   while it runs; three rounds at most, residue named in the body. `references/pr-body.md` is the shape.

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

## Never

The hook in `hooks/`, wired in `.claude/settings.json`, refuses the first four mechanically; the rest are yours. Provenance: the stash stack (PR #369 and the worktree rules), perl (2026-09-02, twice in one session), CDP escapes (#520, #540), closing keywords (#486, #524), truncation read as absence (2026-07-26), `gh issue view` (CLAUDE.md), the profile leak (#546), counts in durable docs (2026-08, four rulings).

- A bare mutation of the stash stack (`git stash`, `pop`, `clear`, `apply` or `drop` without a ref): it is shared across every worktree. `git stash push -m ... -- <paths>`, `apply <sha>`, or a WIP commit.
- `perl -pi` with a non-ASCII replacement: it re-encodes every existing non-ASCII byte in the file. Use node or a heredoc, then grep for `Â`.
- A single-escaped `\s`, `\d`, `\w`, `\b` inside a backtick string in `scripts/e2e/`.
- A PR body with an em-dash, or with "not close #N" / "does not fix #N".
- A negative claim built from `head`, `tail`, `--limit`, or a jq slice. Count against the true total or query the item.
- `gh issue view` as evidence an issue is empty. It silently returns nothing for some issues here; use `gh api`.
- `pkill` on a run you intend to repeat; the harness leaves a browser profile behind for every kill.
- Removing the worktree you stand in, or any worktree another session holds.
- A test count, a phase count, or an e2e total in `CLAUDE.md`, memory, or `RESUME-HERE.md`.
- A compound `write the body && gh ...` call; auto mode refuses it as one action. Write the body,
  then one plain `gh` per call.
