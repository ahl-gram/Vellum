# The cloud quick-win routine

**This file is the rules of a scheduled cloud Claude Code session that takes one small, fully planned issue, builds it, waits for green CI and merges its own pull request.** It exists to save Alex's time and tokens on small subs. The routine decides nothing: where anything is false, silent or unexpected it stops. Read it before labelling an issue for the routine, before editing the routine's prompt, and before changing the cloud environment it runs in. A local lane is `handbook/specs/orchestration.md`'s; this file is the routine's alone.

## What the cloud session has and lacks

- **It has the clone.** `CLAUDE.md`, `handbook/specs/`, `.claude/agents/`, `.claude/skills/` and the repo's `.claude/settings.json` come with the checkout. It has none of Alex's `~/.claude`: no global `CLAUDE.md`, no auto-memory, no personal skills, no user hooks. Every rule the routine needs is therefore read from the repo.
- **GitHub is REST only.** `gh pr`, `gh issue` and every GraphQL command return 403. The routine uses `gh api` REST: issues and comments, `POST pulls`, `GET commits/<sha>/check-runs`, `PUT pulls/<n>/merge`. The Roadmap board is GraphQL and out of reach, and the routine never touches it.
- **It acts as Alex's GitHub account.** What it posts and merges shows as `ahl-gram`; the `Drafted-By: cloud quick-win routine (<model id>)` trailer and the session id in the comment are what mark it.
- **Node 24 is installed by the environment's setup script**, which links Node 24 over whatever `node`, `npm` and `npx` lead the `PATH` and prepends `/opt/node24/bin`. The routine runs `node -v` first and stops if it is not v24.x.
- **The repository is attached with push access to the environment from the start.** Where a session finds no checkout, or `gh` answers 403 with the `add_repo` message, it calls `add_repo` for `ahl-gram/Vellum` ONLY, with `access: "push"`, which Alex authorises in the routine's prompt; it attaches nothing else.
- **One test fails in the VM and passes in CI**: `test/repo/proof-runner-job.test.ts`, "a budget kills the command's whole process group, so a chain's grandchild does not outlive it". The routine does not run the full local suite (below), so it does not meet it; CI is the judge of it.

## What qualifies

An issue qualifies only when all of these hold, each checkable by command. **Only Alex or the dispatching session applies the label `cloud-quickwin`**; the routine never labels an issue itself and never takes an unlabelled one.

- The body names the exact change (the files, the lines, the test whose red proves it, or says plainly that a text edit has no test) and carries no "Question for Alex", "Not decided" or open-decision section. Its comments (`gh api repos/ahl-gram/Vellum/issues/N/comments`) add none.
- It has no parent epic (`.parent_issue_url` is null) and no sub-issues.
- Its diff fits the cap: at most 5 files and 150 changed lines.
- No file it changes is one an open pull request already changes (`gh api repos/ahl-gram/Vellum/pulls?state=open`, then each pull request's `/files`).
- It moves no committed chart, golden, seed or world identity; its deliverable is not an appearance (nothing owing a still, a spike or the plate reader); it adds no e2e check.

## What the session reads first

`CLAUDE.md` in full, then `handbook/specs/development-workflow.md`, `handbook/specs/conventions.md` and the specs the issue's files fall under (the table in `CLAUDE.md` names them), then the issue body AND its comments by REST. It verifies each path, symbol and count the issue cites with a command; anything false on main is a stop condition.

## The loop

1. **Claim** the oldest labelled open issue by REST, skipping one with a claim comment younger than 6 hours, with a comment `Claimed by a cloud quick-win run, <session id>`.
2. **Branch** from `origin/main`, named as the house names a branch: `fix/N-slug`, `chore/N-slug` or `feat/N-slug`. The environment does not force a `claude/` prefix.
3. **Test first.** The failing test fails on the assertion that matters, not on a missing module. A deletion or a text edit with nothing to test says so in the pull request body.
4. **Fix**, then run prettier on the changed files, `npm run check`, `npm run lint`, `npm run format:check` and the tests the issue names. **The full local `npm test` is not run**: it takes about 15 minutes in the VM and CI runs it on every pull request. No e2e lane runs in the VM either.
5. **Commit** with the house trailer block: `Drafted-By: cloud quick-win routine (<model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: <session link>`. No em-dash outside code. Push at the first commit.
6. **Open the pull request** by REST with every `## ` section of `.github/PULL_REQUEST_TEMPLATE.md`, `Closes #N` alone on its line, and a Records line saying which reviews did not run: the plan, the plan skeptic, the guard prover, the plate reader and the cold skeptic are skipped by Alex's standing order for small subs (`handbook/specs/orchestration.md`).
7. **Wait for CI** by REST check-runs, polling no faster than every 2 minutes, for at most 45 minutes.
8. **Merge** under Alex's standing clearance for a pull request of a labelled issue, only when every check-run is `success` and the head sha is the one it tested: squash by REST with `sha` set to that head. Never an admin bypass; never any pull request but its own. A required check that GitHub still reports `in_progress` after every step has finished is a stuck status, not a pass: the routine waits, and does not re-run it.
9. **Report** in one comment on the issue: the pull request link, the commands run and their results, the time and token cost, anything skipped.

## Caps

At most 60 minutes of wall clock and one issue per run. The scheduled prompt carries Alex's words on time and tokens, and the run stops at the cap. A larger diff than the cap is a stop condition, not a reason to continue.

## Stop conditions

On any of these the session stops, comments what it found on the issue (the command, its output, why it stopped), removes the label `cloud-quickwin`, and does not merge:

- an issue claim, path, symbol or count is false on main;
- the diff would exceed the cap or touch a file outside the issue's named files;
- Node is not v24, or push is refused after the authorised `add_repo`;
- a hook or check refuses and one fix attempt does not clear it;
- CI is red or still pending after 45 minutes, or the pull request conflicts;
- the fix would need a decision the issue did not make;
- anything touches a secret, a settings file, the Roadmap board, auto-memory, or a branch the session did not create.

## Never

Force-push; delete a branch it did not create; edit `.claude/settings.json`, any local settings file, `CLAUDE.md` or an agent definition; merge another session's pull request; file, move or phase a board item; post a review on another's pull request; run a command the Never list in `.claude/skills/vellum-footguns/SKILL.md` names.

## Starting a run

The routine runs on demand: Alex or the dispatching session starts it after labelling an issue, with `claude --cloud` from a terminal (it needs a TTY) or the routines' API fire endpoint. No schedule runs unattended until Alex rules one after watching real runs.

## Not yet known

Whether the repo's `.claude/settings.json` hook fires inside a cloud session (no message appeared in the pilot, and the pull request body was accepted); the pull request's `closingIssuesReferences` cannot be read by REST from the VM (the issue timeline returns no connected events), so the `Closes #N` line and the issue's closing on merge are the evidence.
