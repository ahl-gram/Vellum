# 592-plan.md: CLAUDE.md's required-reading sentence and specs/flake-record.md

Lane: vellum-implementer, issue #592, worktree
`.claude/worktrees/agent-a23914a09668a3ccf`.
Branch to be renamed `docs/592-flake-record-reading` before the first commit.
Recon and the plan skeptic have both run; all nine skeptic findings are folded in below.

## The issue, verified

Body only; `gh api repos/ahl-gram/Vellum/issues/592/comments | jq length` returns `0`. Docs-only,
label `documentation`, filed by Alex out of ruling B2 on #586.

The gap is real. `CLAUDE.md`'s specs paragraph has two halves; the enumerating half names
`specs/flake-record.md` and the half that begins "is REQUIRED READING before" does not.

**Line citations are deliberately omitted.** #593 merged at `9d2d721` while this plan was being
written and moved every line in that paragraph, and #596, #588 and #589 will move them again. Cite
the sentence, never a line number, and re-read after the merge.

## The thing the issue does not quote, and which decides the shape

`specs/flake-record.md`, last bullet of "How to use it":

> **This is a record, not a rule.** It is not required reading before a kind of work; it is what you
> consult the moment a check goes red and you are tempted to press re-run.

A tracked, normative line that says in words "do not put me in the required-reading sentence".
`CLAUDE.md`'s own tiebreaker sits in the same paragraph: "where this file and a spec disagree, the
spec is right." The issue quotes only the second half of that bullet.

The grammar is the same point in miniature. Every clause in the required-reading sentence is
`<spec> before <a kind of work>`. The flake record's trigger is a moment, not a kind of work.

## The measured instance, which cuts the other way and belongs on the menu

`specs/flake-record.md` on main carries a row dated 2026-09-14: RS30 red on PR #593, whose payload
cell reads "First on a diff that cannot cause it: PR #593 changes two markdown files. Not re-run;
the next run on that branch was green. Payload and what to capture next are in a comment on that
PR." `.github/workflows/ci.yml` has no `paths:` filter, so the full lane runs on a docs-only PR.

That is exactly the case this issue legislates for, it happened one merge ahead of this lane, and
**the #593 lane handled it correctly under today's wording**, with no clause in `CLAUDE.md`. Alex
sees this before he rules, stated neutrally, alongside option A's weakness.

It also binds this lane: if CI reds on this PR, Gate 2 item 10 applies, the red gets its row in
`specs/flake-record.md` before any re-run, and under option B that row lands in the same file the PR
is already editing.

## The four shapes

**A. It stays out.** No branch, no PR. A dated comment on #592 records the ruling and the reason;
the dispatcher closes the issue. **Measured weakness**: the gate is put in front of a session by
`.claude/skills/vellum-footguns/hooks/footgun-gate.ts`, whose Gate 2 row is
`/(^|\/)(scripts|out)\/.*\.mjs$/`, an EDIT to an e2e script. No hook fires when a check goes red, so
under A the rule reaches a session only if it is editing an e2e script or happens to read the skill.
**Measured counterweight**: the RS30 row above, where a session with no clause did the right thing.

**B. It joins the required-reading sentence.** One clause last, after the settle-doctrine clause,
keyed to a kind of work so it matches its neighbours, with the `and` migrating to the new final
clause. Draft: "..., and `specs/flake-record.md` before re-running any CI check or opening a PR
whose CI is red." Under B the flake record's "not required reading" bullet must be amended in the
SAME PR or two tracked files contradict each other and nothing here sweeps markdown. Two files, and
it contradicts the issue's "No other file changes".

**C. A short sentence of its own, immediately after the required-reading sentence.** The list keeps
its grammar, the flake record's own line stays true, nothing is overridden. Draft:

> `specs/flake-record.md` is deliberately not on that list: it is a record rather than a rule, and
> it is due not before a kind of work but at a moment, the one where a check has gone red and you
> are reaching for re-run.

**Two costs the skeptic priced.** First, the insertion point is mid-line (the paragraph runs "...
CDP probe. None of" / "them is summarized here"), so C splits that line and cascades a rewrap to the
end of the paragraph, the same +12/-8 shape #596's hunk has. C is therefore a multi-line rewrap of
the paragraph tail, not "one sentence, two lines", and the "do not rewrap a neighbour" instruction
is suspended for that tail only. Second, C's draft restates the enumerating clause seven lines
above, which already ends "which is what you consult instead of pressing re-run". If C is chosen its
sentence must carry an imperative that clause does not, or the two are merged.

**D (recommended). Strengthen the clause the flake record already has, in the enumerating half.** The enumerating
half ends "... which is what you consult instead of pressing re-run": a description where an
instruction is wanted. D changes only that tail, for example to "... which you open the moment a
check goes red, giving the red its row before you re-run anything." Smallest diff of the four, no
new sentence, no duplication, contradicts nothing in `specs/flake-record.md`, keeps the file out of
the required-reading half (which is what ruling B2's heading says), and sits in the FIRST half of
the paragraph, which #588 and #589 touch only by inserting above it, so the collision with the
queued lanes is near zero. Weaker than C in one respect: a session skimming the required-reading
sentence still sees no flake record and no note saying why.

**This plan executes whichever of the four Alex picks.** Everything below holds for B, C and D;
under A the lane stops at the issue comment and opens no PR.

## Files

- `CLAUDE.md`, the specs paragraph only.
- `specs/flake-record.md`, the "How to use it" section, ONLY under option B.
- Nothing else. No `src/`, no test, no chart, no regen, no golden.

## Tests, and why there are none

No guard to write and none to strengthen, measured rather than assumed:

- `grep -rn "specs/" test/` returns nothing. No test reads any spec file.
- `grep -rln "CLAUDE.md" test/ scripts/` returns only `test/site/tip-affordance.test.ts`, whose
  single hit at line 91 is prose inside a doc comment citing the "no `.js` outside `src/`" rule.
- `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` has four `EDIT_GATES` rows, complete:
  `test/*.test.ts` (Gate 1), `(scripts|out)/**.mjs` (Gate 2), `.css` or `.astro` (Gate 3), and the
  render closure (Gate 6). `ROSTER_NEW_FILE` is `src/pages/`, `src/site/`, `scripts/e2e/suite-`,
  `public/*.css`. No markdown matcher, so no edit gate fires here. Gate 5 still fires at the push
  and the PR body and is read there.

So the PR's Guards section is the template's blessed `None. This PR carries no test.`,
`vellum-guard-prover` is not owed, and `vellum-plate-reader` is not owed. The red-first rule is
inapplicable rather than skipped: there is no behavior to stub. Stated in the reply and the PR body.

## Evidence, each claim with its command

| claim | command |
|---|---|
| the diff is the files named and nothing else | `git diff --stat origin/main...HEAD` |
| both halves of the paragraph now name the flake record | `grep -n "flake-record" CLAUDE.md` |
| the sentence still reads as one sentence | the whole specs paragraph read back with `sed`, by content and not by line number |
| no em-dash entered the file | `grep -c "—" CLAUDE.md`, which returns 0 on main so the check can bite |
| added lines respect the wrap | no added line exceeds 99 columns. The paragraph also carries short lines of 56, 59, 63 and 9 columns left by #593 and #596; those are left alone |
| the type check is green | `npm run check`, re-run on the branch head after the merge, not the baseline |
| the unit suite is green | `npm test`, re-run on the branch head after the merge, then `npm run astro:generate` because `npm test` deletes the generated assets under `public/` and git does not report it |
| no e2e suite is touched | `git diff --name-only origin/main...HEAD` shows no `scripts/e2e/` path. The suites are not run locally and the PR body says so rather than implying a sweep. CI runs them in full regardless: `.github/workflows/ci.yml` has no `paths:` filter |

Baseline runs on `2ddef7c` were green (`npm run check` clean, `npm test` 1994 of 1994) but are NOT
the numbers for the PR body. The Ran section takes its numbers from a run on the branch head.

**Under option A none of this is owed.** There is no branch and no PR, so no suite run, no evidence
table and no green output. The whole deliverable is one dated comment on #592.

## Rosters and doctrine this change drags

- **The required-reading sentence in `CLAUDE.md`** is the roster the issue is about.
- **`specs/development-workflow.md` step 3** is a second required-reading roster, and
  **`.claude/agents/vellum-implementer.md` item 4** is a third. `grep -n -i "required reading"` over
  `specs/*.md`, `.claude/agents/*.md` and the footguns skill finds no fourth.
- **Who owns those two is already ruled, and it is not this lane.** Ruling C on #586: "Ruled: Sub 5
  updates all of them after the three new files land." #590's first scope amendment takes that work
  and in the same comment says "Not taken: adding `specs/flake-record.md` to the required-reading
  half of `CLAUDE.md` (Alex, ruling B2 on #586: file it separately)." So the flake record's place in
  those two lists is owned by nobody. Under C and D it belongs in neither, both being keyed to a
  kind of work. Under B it arguably belongs in both, and that is unowned work this lane cannot do.
  Named for Alex and the dispatcher rather than taken.
- **`specs/rulebook.md`** enumerates the specs twice and already names the flake record. No trigger,
  nothing to do.
- **Gate 2 item 10** already carries the rule and points at the file. Unchanged under all four.
- **`CLAUDE.md`'s line budget.** 382 lines on main against the 400 maximum in
  `~/CodeProjects/.claude/rules/coding-style.md`. #596 nets +4 measured, #588 about +3, #589 about
  +1 to +2, this lane +1 to +2, landing near 391 to 394. No test enforces 400 and whether that rule
  binds a markdown instructions file is unruled, so the PR body names the number and asserts
  nothing.

## Sequencing

The dispatcher owns merge order and has instructed: do not push until it says #589 has merged, then
`git merge origin/main`, read the sentence as it stands, and add the clause last.

**The skeptic disputes the size of that wait and this lane relays rather than overrides it.** As of
now #593 has merged (`9d2d721`), #596 is the only other open PR, and #588 and #589 have no branch
and no PR. #589's own acceptance already commits it to "Bring the branch current with
`git merge origin/main` and re-read that sentence as it then stands", so #592 landing first costs it
nothing it does not already owe, and under C or D the textual overlap with #588 and #589 is near
zero. The earned wait looks like "after #596 merges". **The dispatcher decides; this lane waits for
whatever it is told.**

- The `and` in front of the final clause is the one line where this lane meets #588 and #589 under
  option B. It may already have migrated. Re-read, touch only that word, name it in the report.
- Do not rewrap a neighbour's line. #593 and #596 leave short lines mid-sentence; leave them. The
  single exception is option C's paragraph tail, which cannot be inserted into without a rewrap.
- **#590 collides on `specs/flake-record.md`, semantically and not only in order.** #590's scope for
  that file is "into 'How to use it', the class of transient failures that are re-run rather than
  recorded, written so it does not read as a licence to press re-run on anything else." Option B
  amends the "record, not a rule" bullet in the same section, and the two edits pull on that
  section's normative force in opposite directions. An agreed order does not resolve that. Under B,
  ask the dispatcher whether the bullet is amended here or handed to #590 with the transient-failures
  clause, so one lane writes the section's whole stance.

## Records and the PR

- A dated comment on #592 before the PR opens, carrying Alex's relayed ruling and every call made
  here that the issue did not rule on. The body is left as written, per the #202/#203 convention.
  The same comment carries the corrections to the body: the omitted first half of the "record, not a
  rule" bullet; the two other rosters and the ruling that gives them to #590; the counts "five" and
  "four" being true only until #593 landed, which it now has; the measured hole in "rely on the
  gate"; and the RS30 row that cuts the other way.
- Under option A that comment is the whole deliverable. There is no branch and no PR, and the
  dispatcher closes the issue, not this lane.
- PR title starts with `#592`. Body via `gh pr create --body-file`, every `## ` section of
  `.github/PULL_REQUEST_TEMPLATE.md` present: Guards, Ran, Records, Rulings, Look for these when you
  use it. Verify a body in one command and edit it in the next, never in one compound command.
- `vellum-pr-skeptic` cold after the push, the PR number and nothing else, at most three rounds,
  residue named in the body.
- If CI reds, Gate 2 item 10: one re-run at most, and the row in `specs/flake-record.md` first.
- Attribution lines as given by the dispatcher on every commit and on the PR body. No em-dashes.
