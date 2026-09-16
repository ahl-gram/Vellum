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
`Issue #N` or `PR #N` per the house naming rule (`specs/rulebook.md`, How to read and update this
file): four occurrences changed, `Issue #585`, `Issue #591` and `Issue #607` twice. Second, a line
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
- Count the terms; do not pattern-match. Earns its line when: the prover reports a mutant matching the pattern and escaping.
- The element shim never grows a selector matcher; where its empty answer makes a removal unprovable, say so. Earns its line when: a guard proved unable to red that way.
- CASUALTY, named in PR #608: `node --test` prints the spec reporter even when piped, so a mutation loop grepping TAP's failure line reads every mutant as escaped. Earns its line when: a zero-red run that is the reporter.

## Gate 2: before writing an e2e check or a CDP probe

- CASUALTY, named in PR #608: CDP touch has a setup order and two unrecoverable states. Emulation on BEFORE the boot navigate; no touch with emulation off; no config change after a touch; coordinates are visual-viewport space. Earns its line when: a run wedges past reload.

Noted 2026-09-16, overtaken before the move: the rule itself is written in `.claude/agents/vellum-plate-reader.md`, the bullet opening "CDP touch is fragile", there since PR #346 (2026-08-10); this row records only that it did not earn a gate line.

- The status region keeps only its LAST write and cannot tell one announcement from two; arm an observer and count. Earns its line when: the cold skeptic catches one.
- A probe leaves the page as it found it: a stayed-on-page claim comes from a FRESH evaluate past the commit, and a probe that adds or strips a class or inline style restores it. Earns its line when: a later check fails on what a probe left.
- Send the left button on every `mouseMoved` of a drag on a native range. Earns its line when: a CI red where such a drag moves nothing.
- A scroll fixture is fragile at both ends: a helper that scrolls first dissolves it, and a CDP space key scrolls only with text alongside. Earns its line when: a CI red.
- Drive a value the field accepts: an input whose pattern refuses garbage never reaches submit. Earns its line when: a check found to measure nothing.
- No CLI screenshot beside a live harness session. Earns its line when: a capture spoiled by a concurrent session.
- Never measure during the unfurl; freeze a frame with the animations API. `specs/ui-design.md` already makes reduced motion the control for a timing question, so this needs an incident that control cannot settle.

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

Already written where they are read: the label-parsing helper and the nonexistent-browser fixture (Gate 1's degenerate-fixture line); the bestiary fixture drift (its own test); gitlinked worktrees (`.gitignore`); a rect read mid-transition (`src/site/shared/room-seats.ts`); a colour compared by channel and emulated-media overrides (a comment at each site, plus `specs/settle-doctrine.md`'s same-run control); the oracle's metric and caption (`design/oracle/`); a clip inside the viewport (harness default); the harness window height (Issue #607). No cause ever recorded: the camera check that establishes its own state and blurs first. Retired or falsified: the mask byte-compare, the ANSI grep count, two shipped capture rows.

Noted 2026-09-16, overtaken before the move: the harness window height now lives in `specs/settle-doctrine.md`, The environment, the bullet opening "The harness ASKS for a window far taller than a screen", via PR #620 (merged 2026-09-14).

## From Issue #611's comment of 2026-09-14

Two more for this holder, from PR #608's third round (2026-09-14): (1) the conflicted rebase that strips a number-sign-leading subject is the Never list's first bullet above, which carries it; the comment's own wording of it is replaced by this cross-reference (Alex's ruling of 2026-09-16, relayed on Issue #626). (2) A screenshot cannot photograph a blocked main thread: withdrawn from Gate 2 item 13 as unverifiable (no command in the repo demonstrates it); earns its line when a capture taken during a blocked thread is shown to be the cause of a wrong read.
