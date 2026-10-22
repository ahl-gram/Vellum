# The cloud quick-win routine

**This file is the rules of a cloud Claude Code session that takes one small, fully planned issue, builds it, waits for green CI and merges its own pull request.** It exists to save Alex's time and tokens on small subs. The routine decides nothing: where anything is false, silent or unexpected it stops. Read it before labelling an issue for the routine, before editing the routine's prompt, and before changing the cloud environment it runs in. A local lane is `handbook/specs/orchestration.md`'s; this file is the routine's alone, and it is the one place the routine departs from the sequence in `handbook/specs/development-workflow.md` (steps 2, 14 and 16) and from "Alex reviews and merges" in `CLAUDE.md`.

## What the cloud session has and lacks

- **It has the clone.** `CLAUDE.md`, `handbook/specs/`, `.claude/agents/`, `.claude/skills/` and the repo's `.claude/settings.json` come with the checkout. It has none of Alex's `~/.claude`: no global `CLAUDE.md`, no auto-memory, no personal skills, no user hooks. Every rule the routine needs is read from the repo.
- **GitHub is REST only.** `gh pr`, `gh issue` and every GraphQL command are refused. The routine uses `gh api` REST, paginated (`--paginate`) wherever it counts or lists: issues and comments, `POST pulls`, `GET commits/<sha>/check-runs`, `PUT pulls/<n>/merge`. The Roadmap board is GraphQL and out of reach, and the routine never touches it.
- **It acts as Alex's GitHub account.** What it posts and merges shows as `ahl-gram`; the `Drafted-By: cloud quick-win routine (<model id>)` trailer and the session id in its comments are what mark it.
- **The environment's setup script installs Node 24 ahead of the VM's own.** The routine runs `node -v` first and stops if it is not v24.x. Its prompt names the `PATH` entry and authorises the repository attach below.
- **The repository is attached with push access.** Where a session finds no checkout, or `gh` refuses with the `add_repo` message, it calls `add_repo` for `ahl-gram/Vellum` ONLY, with `access: "push"`, which Alex authorises in the routine's prompt; it attaches nothing else.
- **The hook does not read what it posts.** `.claude/skills/vellum-footguns/hooks/` gates `gh pr create` and `gh pr edit`, not a REST call, so the routine runs the body checks itself (the loop below).

## What qualifies

An issue qualifies only when all of these hold, each checkable by command. **Only Alex or the dispatching session applies the label `cloud-quickwin`**; the routine never labels an issue itself and never takes an unlabelled one. (The label's applier cannot be told from the routine by GitHub, since both act as the same account; the rule is a discipline, and the issue's events show when it was applied.)

- The body names the exact change (the files, the lines, the test whose red proves it, or says plainly that a text edit has no test) and carries no "Question for Alex", "Not decided" or open-decision section. Its comments (`gh api --paginate repos/ahl-gram/Vellum/issues/N/comments`) add none.
- It has no parent epic (`.parent_issue_url` is null) and no sub-issues.
- Its diff fits the cap: at most 5 files and 150 changed lines.
- No file it changes is one an open pull request already changes (`gh api --paginate repos/ahl-gram/Vellum/pulls?state=open`, then `--paginate` each pull request's `/files`).
- It moves no committed chart, golden, seed or world identity, and its deliverable is not an appearance (nothing owing a still, a spike or the plate reader).
- **An e2e change qualifies on the same terms**, a flake fix included: its body names the exact change and the evidence that decides it. The VM runs no e2e lane, so CI is the only judge, and the pull request merges only on a green run of every lane; a red lane is a stop condition.
- It edits neither `CLAUDE.md`, an agent definition, `.claude/settings.json` nor any local settings file.

## What the session reads first

`CLAUDE.md` in full, then `handbook/specs/development-workflow.md`, `handbook/specs/conventions.md` and the specs the issue's files fall under (the table in `CLAUDE.md` names them), then the issue body AND its comments by REST. It verifies each path, symbol and count the issue cites with a command; anything false on main is a stop condition.

## The loop

1. **Claim.** List the open issues labelled `cloud-quickwin` oldest first (`gh api --paginate 'repos/ahl-gram/Vellum/issues?labels=cloud-quickwin&state=open&sort=created&direction=asc'`, dropping any item that carries a `pull_request` key), skip one whose claim comment is younger than 6 hours, and post `Claimed by a cloud quick-win run, <session id>` on the first it takes.
2. **Branch** from `origin/main`, named as the house names a branch: `fix/N-slug`, `chore/N-slug` or `feat/N-slug`.
3. **Test first.** The failing test fails on the assertion that matters, not on a missing module. A deletion or a text edit with nothing to test says so in the pull request body.
4. **Fix**, then run prettier on the changed files, `npm run check`, `npm run lint`, `npm run format:check` and the tests the issue names. **The full local `npm test` is not run**: CI runs it on every pull request. No e2e lane runs in the VM.
5. **Commit** with the house trailer block: `Drafted-By: cloud quick-win routine (<model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: <session link>`. The subject starts with the issue number, `#N <title>`. Push at the first commit.
6. **Check the body before it is posted**, by command, since no hook will: `grep -c` for the em-dash character over the body and every comment (it may appear only inside inline backticks or a fenced code block), `grep '^## '` against the section list of `.github/PULL_REQUEST_TEMPLATE.md`, and no negated closing keyword beside an issue number ("not close", "does not fix"). A failure is fixed before posting, not after.
7. **Open the pull request** by REST with every `## ` section of the template, the title `#N <title>`, `Closes #N` alone on its line, and a Records line that says which reviews did not run: the plan, the plan skeptic, the guard prover, the plate reader and the cold skeptic are skipped by Alex's order for this routine, and this file is that order (`handbook/specs/development-workflow.md` steps 2, 14 and 16 do not apply to it).
8. **Wait for CI** by REST check-runs, polling no faster than every 2 minutes, for at most 45 minutes.
9. **Merge** only when every check-run is `success`, the head sha is the one it tested, and `origin/main` has not moved since that head's checks started (`git fetch origin` and compare the base sha). If main has moved the routine stops and reports, because the required checks do not require a branch to be current and the merged state would be one no check ran. The merge is a squash by REST with `sha` set to the tested head, a subject `<#N title> (#<PR>)` and a body of the pull request's one-paragraph summary, `Closes #N`, and the commit's trailer block, each distinct `Drafted-By:` line included (the shape `handbook/specs/orchestration.md` gives a squash). Never an admin bypass; never any pull request but its own. A required check GitHub still reports `in_progress` after every step of it has finished is a stuck status, not a pass: the routine waits, and a refused merge is not retried another way.
10. **Report** in one comment on the issue: the pull request link, the commands run and their results, the time and token cost, anything skipped.

## Caps

At most 60 minutes of wall clock and one issue per run. The prompt carries Alex's words on time and tokens, and the run checks the clock before each wait. **At the cap the run stops as a stop condition does**: it posts the comment, removes the label and releases its claim, and leaves any open pull request open with a comment saying so, so no stale claim blocks the issue and no open pull request's files block it at the overlap check. A larger diff than the cap is a stop condition, not a reason to continue.

## Stop conditions

On any of these the session stops, comments what it found on the issue (the command, its output, why it stopped), removes the label `cloud-quickwin` and releases its claim, and does not merge:

- an issue claim, path, symbol or count is false on main;
- the diff would exceed the cap or touch a file outside the issue's named files;
- Node is not v24, or push is refused after the authorised `add_repo`;
- a hook or check refuses and one fix attempt does not clear it;
- CI is red, a lane is still pending after 45 minutes, the pull request conflicts, or main has moved since the tested head;
- the 60-minute cap is reached;
- the fix would need a decision the issue did not make;
- anything touches a secret, a settings file, the Roadmap board, auto-memory, or a branch the session did not create.

## Never

Force-push; delete a branch it did not create; edit `.claude/settings.json`, any local settings file, `CLAUDE.md` or an agent definition; merge another session's pull request; file, move or phase a board item; post a review on another's pull request; run a command the Never list in `.claude/skills/vellum-footguns/SKILL.md` names.

## The cloud environment

The environment is defined in the claude.ai/code web UI. No repo file, API or CLI sets it, so this section is the record of what it holds, and `scripts/cloud-setup.sh` is the repo's copy of its script.

- **Setup script:** the contents of `scripts/cloud-setup.sh`, pasted into the environment's "Setup script" field. It installs Node 24 over the VM's own. A setup script runs as root before Claude starts and is cached, which a SessionStart hook is not (it runs on every start), so the install is not a hook. Change the file and the field together.
- **Network access:** Limited (the dialog's levels are None, Limited and Full), with `nodejs.org` added as an allowed domain.
- **Repository:** `ahl-gram/Vellum`, attached with push access, with the Claude GitHub App installed on it.
- **Environment variables:** none.

## Starting a run

The routine runs on demand. Alex starts it from a terminal with `claude --cloud` (which needs a TTY), or the dispatching session fires it through the cloud routine's API endpoint; a session's own shell has no TTY. No unattended schedule runs until Alex rules one after watching real runs.

## Not yet known

Whether the repo's `.claude/settings.json` hooks fire inside a cloud session; and the pull request's `closingIssuesReferences`, which the cloud session cannot read by REST, so the `Closes #N` line and the issue's closing on merge are the evidence.
