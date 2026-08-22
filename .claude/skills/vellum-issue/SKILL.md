---
name: vellum-issue
description: Take a Vellum issue from pickup to an open PR: orient, recon the spec, settle the open questions with Alex, build test-first in a worktree, prove the guards bite, and hand over a skeptic-reviewed PR that Alex merges. Use when Alex names an issue number or a piece of work to start.
---

# Pick up a Vellum issue

`$ARGUMENTS` is the issue number, or a description of the work when no issue exists yet.

**This skill is the ORDER, not the rules.** CLAUDE.md is the rulebook and it is already in context.
Where a step below names a rule, follow it at its source and do NOT restate it here: a second copy
costs a PR to update, and this project has watched two go stale already, the roadmap phase list and
the workspace's `PROJECTS.md`.

If you are not Alex: `RESUME-HERE.md`, the roadmap board, and auto-memory are private. Skip steps 1
and 9 and work from the repo and the public issues.

## 1. Orient before touching anything

- Read `RESUME-HERE.md` at the repo root: current status, recent rulings, and heads-up.
- Read the board: `gh project item-list 1 --owner ahl-gram`.
- Confirm what is already in flight. Another session may hold an issue, with its own worktree.

## 2. Recon the spec

Run `vellum-spec-recon`. It returns a CURRENT / STALE / UNVERIFIABLE ledger plus the open decisions
awaiting Alex. Do not skip it on the belief that the issue is small: it exists because two epics
went stale under exactly that belief.

Read the issue yourself as well, body AND comments, per "Read the issue before you build".

## 3. Put the open questions to Alex, then stop

Every decision the recon surfaced goes to Alex **in menu format** (the AskUserQuestion picker), not
as prose he has to answer in paragraphs. Plain language, no jargon, no acronyms: he is deciding,
so he needs to understand what he is deciding, not decode it.

Then STOP and wait. Do not pick a default and proceed on a decision that is his.

## 4. Take a worktree

Per "## Worktrees" in CLAUDE.md. Two additions specific to running alongside other sessions:

- **Leave every other worktree alone.** Other agents work in their own worktrees under
  `.claude/worktrees/`. Do not remove them, do not commit from them, do not clean them up as tidying.
- Never `git stash` bare: the stack is shared across worktrees and another session may pop yours.

## 5. Build it test-first

RED first, and it must fail on the assertion you care about rather than a missing module. Then
GREEN. Thresholds and scanners follow "## Thresholds and test guards".

## 6. Prove the guards bite

Run `vellum-guard-prover` on anything new or strengthened. Zero red is a hole, not a pass. A guard
you cannot make bite is absent: delete it rather than ship it.

If the work is a presentation sub, run `vellum-plate-reader` too. Structural tests cannot see layout.

## 7. Push, then attack your own PR

Open the PR, then run `vellum-pr-skeptic` COLD: the prompt is the PR number or branch name and
NOTHING else. No summary, no claims about your tests, no rationale. Relay its report in your reply
and let Alex decide what lands.

Fix what it finds, re-verify, and never `git checkout` over an uncommitted review fix.

## 8. Done means

Every acceptance criterion met, the full suite green, and a PR opened.

Then STOP. **Alex reviews and merges.** Do not merge for him, and do not report a PR as delivered
until CI is actually green: name the command whose output says so.

The `/goal` evaluator reads only what this session has SURFACED, never the repo, so a condition is
only checkable if the transcript carries its evidence. Paste the test summary and the CI verdict
into your reply rather than asserting them, or a met goal reads as unmet.

**Alex, for an unattended run**, set the goal yourself when you invoke this skill; a `/goal` line
written in a skill file is inert, since setting one registers a session-scoped Stop hook and only
your input can do that:

```
/goal all acceptance criteria met, tests pass, and a PR is opened.
```

Background work defers goal evaluation: a running subagent or background shell skips that turn's
check. `vellum-pr-skeptic` and a `gh run watch` both trigger this, so expect the goal to wait,
and read the check-in when it comes rather than starting parallel work.

## 9. Hand off

Keep the board current: newly filed issues added and phased, shipped issues closed. File follow-up
issues for anything descoped, and say plainly what you left out and why.
