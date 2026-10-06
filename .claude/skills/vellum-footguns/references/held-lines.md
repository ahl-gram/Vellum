# Held lines: gate candidates that did not earn a line

This file, `.claude/skills/vellum-footguns/references/held-lines.md`, holds the checklist lines that
were triaged for the gates in `.claude/skills/vellum-footguns/SKILL.md` and declined under the strict
filter (a line joins a gate only when it carries its own incident number or a ruling of Alex's), each
with the sentence naming the incident that would earn it its line. Its siblings prove the other two
things a gate needs: `.claude/skills/vellum-footguns/references/scars.md` proves a gate bites, and
`.claude/skills/vellum-footguns/references/flake-record.md` proves a red is noise. This one records
what did not earn a line, and what would.

**How a line leaves.** By a PR adding it to a gate with the incident cited at that line, or by a dated
line here declining it for good with the ground. A new candidate is a PR row here, never an issue
comment. The one item under "Held, not declined" sits outside both exits: it is frozen with Gate 2
item 10 by Alex's ruling on the flake record (Issue #591, ruling 10 of 2026-09-14), and when that
freeze lifts it becomes an ordinary candidate again, judged under the filter like the others.

**This is a record, not a rule.** It is not required reading before a kind of work; consult it when a
triage declines a line, or when an incident matches one, since that incident is the number the line
lacked.

**Provenance.** Moved from Issue #611 (its body and its comment of 2026-09-14) by Issue #626 on
2026-09-16, word for word, with three stated departures. First, every bare number is written
`Issue #N` or `PR #N` per the house naming rule, which `handbook/specs/conventions.md` states:
four occurrences changed, `Issue #585`, `Issue #591` and `Issue #607` twice. Second, a line
beginning "Noted" beneath a moved line is the repo having overtaken that line before the move, dated,
and is not part of the moved text. Third, the comment's item (1) restated the Never list's first
bullet, and is replaced below by a cross-reference to it (Alex's ruling of 2026-09-16, relayed on
Issue #626).

## From Issue #611, as filed 2026-09-14

Sub 6 of epic Issue #585 (Issue #591, PR #608) triaged candidate gate lines for `vellum-footguns` under the filter Alex ruled: a line joins a gate only when it carries its OWN incident number (an issue, a PR, a scars row) or a ruling of his. The rest are held here: an incident matching one is the number that rule lacked.

## Gate 1: before writing a test or a guard

- A name check that accepts the RENDERED spelling pins the renderer. Earns its line when: the cold skeptic catches one.
- A killed prover leaves mutants in two places; restore both. Earns its line when: a green taken over a mutated tree.
- A scratch tree probing what node loads carries the package's `"type"`, or it silently measures another loader; and a comment naming a built file by its `.js` name reds the citation guard. Earns its line when: a rerun contradicts a probe, or a CI red.
- Assert the OUTCOME, never the declaration; adjacent to the landed just-set clause. Earns its line when: a scars row where a declaration-level assertion survived a broken outcome.

Noted 2026-10-02, promoted: Gate 1 item 3 now carries it with its incident (Issue #155, PR #290, a scars row under "The assertion read its own input or the fallback"), via Issue #708.

- Count the terms; do not pattern-match. Earns its line when: the prover reports a mutant matching the pattern and escaping.

Noted 2026-10-02, promoted: PR #631's brace-bounded pattern is that incident, and Gate 1 item 13 now says count call sites by the bare token, via Issue #708.

- The element shim never grows a selector matcher; where its empty answer makes a removal unprovable, say so. Earns its line when: a guard proved unable to red that way.
- CASUALTY, named in PR #608: `node --test` prints the spec reporter even when piped, so a mutation loop grepping TAP's failure line reads every mutant as escaped. Earns its line when: a zero-red run that is the reporter.

## Gate 2: before writing an e2e check or a CDP probe

- CASUALTY, named in PR #608: CDP touch has a setup order and two unrecoverable states. Emulation on BEFORE the boot navigate; no touch with emulation off; no config change after a touch; coordinates are visual-viewport space. Earns its line when: a run wedges past reload.

Noted 2026-09-16, overtaken before the move: the rule itself is written in `.claude/agents/vellum-plate-reader.md`, the bullet opening "CDP touch is fragile", there since PR #346 (2026-08-10); this row records only that it did not earn a gate line.

- The status region keeps only its LAST write and cannot tell one announcement from two; arm an observer and count. Earns its line when: the cold skeptic catches one.
- Added 2026-10-02 by Issue #708 (its item 14): a clip-path shrinks the hit region to the drawn shape, so aim inside the shape, never at its box's centre, which the dog-ear's triangle (`.dog-ear` in `public/explorer/chart-drawer.css`) puts exactly on its cut edge. Earns its line when: a numbered incident on the public record where a press aimed at a clip-path's box centre missed; Issue #708 attributes the lesson to Issue #520, whose record does not state it.
- A probe leaves the page as it found it: a stayed-on-page claim comes from a FRESH evaluate past the commit, and a probe that adds or strips a class or inline style restores it. Earns its line when: a later check fails on what a probe left.
- Send the left button on every `mouseMoved` of a drag on a native range. Earns its line when: a CI red where such a drag moves nothing.
- A scroll fixture is fragile at both ends: a helper that scrolls first dissolves it, and a CDP space key scrolls only with text alongside. Earns its line when: a CI red.
- Drive a value the field accepts: an input whose pattern refuses garbage never reaches submit. Earns its line when: a check found to measure nothing.
- No CLI screenshot beside a live harness session. Earns its line when: a capture spoiled by a concurrent session.
- Never measure during the unfurl; freeze a frame with the animations API. `handbook/specs/ui-design.md` already makes reduced motion the control for a timing question, so this needs an incident that control cannot settle.

Noted 2026-09-20, overtaken: the wait itself now lives in `handbook/specs/settle-doctrine.md`, The environment, the bullet opening "A sleep past an animation's nominal duration still lands mid-animation", which carries the fact and the poll shape; Gate 2 item 6 stays the imperative. The incident that moved it, the plate read on PR #642, is one the reduced-motion control would have settled, since `public/motion.css` collapses that animation under it too, so this row records that it did not earn a gate line (Alex, 2026-09-20).

## Gate 3: before writing CSS or moving layout

- A cascade fix verified inside a hidden subtree proves nothing about the painted case. Earns its line when: the cold skeptic catches one.

## Gate 4: before adding anything that joins a roster

Nothing here; the roster-is-data rule passed and shipped.

Noted 2026-09-16, overtaken before the move: that rule shipped as Gate 1 item 16 in PR #608 (2026-09-14), not under this gate; the placement ruling is Issue #591's comment of 2026-09-14.

## Gate 5: before the push and the PR body

Nothing targets this gate; its one neighbour is under the Never list.

## The Never list

- Bring a branch current with `git merge origin/main`, never a rebase: a conflicted `rebase --continue` goes through the editor path, whose cleanup strips every line starting with a number sign, so the subject silently becomes the body's first line. Gate 5 rules the one case that wants a rebase, a squash-merged base. Earns its line when: a merged commit carries the wrong subject.
- The pipe-delimited perl substitution is not held here: it is filed as Issue #607, where the hook refusing it retires the prose.

Noted 2026-09-16, overtaken before the move: shipped in PR #620 (merged 2026-09-14), where `PERL_META_DELIMITER` in `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` refuses the class and `.claude/skills/vellum-footguns/hooks/README.md` documents it; Issue #607 is closed.

## Held, not declined

The date-flake clause, that a hunt-suite red not reproducing locally is a date flake first since that suite runs the world today's UTC date seeds, is HELD: Alex's flake-record ruling freezes Gate 2 item 10 until he lifts it.

## Closed out here, no promotion owed

Already written where they are read: the label-parsing helper and the nonexistent-browser fixture (Gate 1's degenerate-fixture line); the bestiary fixture drift (its own test); gitlinked worktrees (`.gitignore`); a rect read mid-transition (`src/site/shared/room-seats.ts`); a colour compared by channel and emulated-media overrides (a comment at each site, plus `handbook/specs/settle-doctrine.md`'s same-run control); the oracle's metric and caption (`scripts/design/oracle.ts` and `scripts/design/compare.ts`, the method in `handbook/specs/settle-doctrine.md`, The environment); a clip inside the viewport (harness default); the harness window height (Issue #607); the wait on the unfurl (`handbook/specs/settle-doctrine.md`, The environment). No cause ever recorded: the camera check that establishes its own state and blurs first. Retired or falsified: the mask byte-compare, the ANSI grep count, two shipped capture rows.

Noted 2026-09-16, overtaken before the move: the harness window height now lives in `handbook/specs/settle-doctrine.md`, The environment, the bullet opening "The harness ASKS for a window far taller than a screen", via PR #620 (merged 2026-09-14).

## From Issue #611's comment of 2026-09-14

Two more for this holder, from PR #608's third round (2026-09-14): (1) the conflicted rebase that strips a number-sign-leading subject is the Never list's first bullet above, which carries it and sits beside Gate 5 item 9's rebase --onto recipe; the comment's own wording of it is replaced by this cross-reference (Alex's ruling of 2026-09-16, relayed on Issue #626). (2) A screenshot cannot photograph a blocked main thread: withdrawn from Gate 2 item 13 as unverifiable (no command in the repo demonstrates it); earns its line when a capture taken during a blocked thread is shown to be the cause of a wrong read.

## From Issue #638, 2026-10-03

Three candidates from building the corners sweep (`e2e/suites/corners.ts`), the first two for Gate 2 and the third for Gate 1, each measured but with no incident of its own yet:

- A sweep that resizes a loaded page cannot read the new width from a frame or two after `Emulation.setDeviceMetricsOverride`: a `vw` length is not recomputed while the resizing goes on (a one-frame read never applied home's `calc(100vw - 15rem)` cap from 396 down to 320), and `screen.width` does not follow the override at all, `screenWidth` passed or not. Wait on `matchMedia("(width: Npx)")` and a 100vw sentinel matching `clientWidth`, then two agreeing frame reads, the shape `restAt` in that suite carries. Earns its line when a check is shown to have passed on a read taken before the width it named.
- A media query read back from the CSSOM is not the text that was written: a block the build minifies (the layout's inlined style) comes back from Chrome in range syntax, `(width <= 720px)` for `(max-width: 720px)` (measured while the layout still carried one, before Issue #762 took its width blocks out), while a page sheet served as written keeps the legacy form. A reader keyed on one form misses the other silently; `mediaEdges` and `unreadWidthConditions` in `e2e/suites/corners/geometry.ts` read both and refuse what they cannot parse. Earns its line when a check is shown to have skipped an edge it claimed to read (the guard prover found exactly that on the corners sweep's first draft, before it shipped).
- A guard whose fixture is a date picks the date by the widest line it lays out over a span, never by the longest words: the Seed of the Day's worst dateline is "Monday, 6 July 2026", whose first line fills the corner's 12.5rem to 199.0px, not "Wednesday, 23 September", which carries the longest weekday and month. Earns its line when a date-dependent check is shown to have passed on a short date.

## From Issue #762, 2026-10-05

Two candidates from the `vellum-plate-reader` sitting on Issue #762's pull request B, both for Gate 2, measured but with no incident of their own yet:

- Under emulated reduced motion every property of every element transitions for 0.01ms, because the motion sheet's blanket sets the duration and the default `transition-property` is `all`; so a script that writes an inline length and reads the box in the same task reads the transition's start value. The top row's step 6 spike engaged on 0 of 10 loads at 1024 that way; `placeLegendRow` in `src/site/shared/room-seats.ts` and `layRow` in `src/site/shell/top-row.ts` hold the transition off while they write and read. Earns its line when a check or a measured placement is shown to have read a start value under reduced motion.
- A `Page.captureScreenshot` with a `clip.scale` of 3 or 4 leaves the page laid out about 1px differently afterwards (a controls row 71.44 to 70.44, the sheet's top by 0.5), where a scale of 1 leaves it untouched; take every measurement before a scaled capture. Earns its line when a check is shown to have measured a layout a scaled capture moved.

Three more from the same pull request's step 11 plate read, measured but with no incident of their own yet, the first two for Gate 2 and the third for the tooling:

- `visibility: hidden` on a `<select>` shortens its box by 1px, and it stays shorter after the visibility is restored, where `opacity: 0` does not; a probe that hides a control to isolate ink reads a layout it moved. Earns its line when a check is shown to have read a control's box after hiding it.
- The Reading Room draws about 1.4s after 600ms of stable reads, so a settle keyed on the page holding still for 600ms reads it before its draw lands. Earns its line when a Reading Room check is shown to have passed on the undrawn page.
- A `magick` child fed a large image on stdin through `execFileSync` can block Node's event loop indefinitely, so no watchdog timer fires; decode in process, or give the child a file and its own time limit. Earns its line when a probe or a check is shown to have hung on it.
