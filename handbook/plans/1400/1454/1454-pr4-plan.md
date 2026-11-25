# Issue #1454, pull request 4: the agent tools go into `scripts/agent-infra/`, and the System One client into `scripts/shared/`

**Planned at**: `origin/main` 62b47ee81c56c05f76e260f1746888afedfab25b (PR #1468 merged; re-fetched when the rulings were folded in, unchanged); Issue #1454 read through `npm run --silent issue -- 1454` with 10 comments shown and 0 withheld, the tenth being the rulings comment below. The planner was dispatched at 67ed4181 and planned at PR #1468's head 6fc392d7 until it merged; `git diff --stat 6fc392d7 origin/main` printed nothing, so every reading below, taken at either, holds at 62b47ee8.

**Rulings**: Alex's rulings on the two questions of the step 6 menu, posted at https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7164179939 (2026-11-25). Each took the recommended option:

- **Q1, how the last move lands: "No signpost; restart after".** No forwarding file at `scripts/agent-sandbox.ts`. For this pull request the builder sends its guards to the proof runner rather than dispatching `vellum-guard-prover`, opens the pull request and stops with the ledger; the orchestrating session dispatches `vellum-pr-skeptic` cold from the main checkout before the merge. Right after the merge, the main checkout is updated, then every open Claude session is restarted, before any session dispatches a prover, a skeptic or a designer.
- **Q2, the TypeSafe client: "`scripts/shared/jev/`".** The shared folder's rulebook sentence drops "small" and allows a single file or a folder of its own.

**Review routing, by ruling Q1, which overrides the implementer's definition for this pull request alone.** The builder never dispatches `vellum-guard-prover` or `vellum-pr-skeptic`: its guards go to the CI proof runner (Evidence 12), it opens the pull request, and it stops and reports to the dispatcher with the ledger and the PR number. The dispatcher dispatches `vellum-pr-skeptic` cold from the main checkout before the merge (Evidence 13). After the merge the dispatcher runs the order under Evidence ("For the dispatcher, after the merge").

**Standing rulings it builds on**: https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7144737283 (Q1, the folders `build`, `ci` and `shared`; Q4, `scripts/agent-sandbox.ts` moves in the later pull request that gathers the agent tools into `scripts/agent-infra/`, and the guard allows it by name until then); https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7148735386 (Alex's goal of finishing every remaining move); https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7150475160 (Q1, `scripts/review/`, and the agents' clause reworded to "whatever else the agents run").

**Branch**: `chore/1454-pr4-agent-infra` (`git ls-remote origin refs/heads/chore/1454-pr4-agent-infra` printed nothing at 62b47ee8). This is the last pull request of Issue #1454: the body closes it with `Closes #1454`.

## Specs

Read these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/rulebook.md`, "What `src/` holds, and what runs around it": the paragraph opening "**Inside `scripts/`, a file sits in the folder of who runs it**", which this pull request rewrites (Rosters and doctrine).
- `handbook/specs/conventions.md`, "Where a rule lives", "How a spec, and the rest of the house's prose, is written" (a backticked path is scanned; no roster in a spec), "How code is cited" and "The comment sweep" (the landing's timing, Calls made 12).
- `handbook/specs/check-placement.md`, "The unit suite" (what a unit test may read) and its lines 221 to 255, whose cited paths change.
- `handbook/specs/development-workflow.md` step 11 (the CI proof runner, which this pull request's guard proof uses) and step 14 (the cold skeptic, and the paragraph opening "An agent whose own DEFINITION this pull request changes": four definitions change).
- `handbook/specs/orchestration.md`, "Lanes that cross harnesses" (the Codex clone, which this pull request leaves alone) and "Merging".
- `CLAUDE.md`, Worktrees: two of its lines change (Rosters and doctrine).
- `vellum-footguns` Gate 1 (the strengthened tests), Gate 7 (a test that reads the repo's own files), Gate 5 (the push and the body).

## The design

A pure move, by the method of pull requests 1 to 3 (`handbook/plans/1400/1454/1454-plan.md`, `1454-pr2-plan.md`, `1454-pr3-plan.md`): each mover goes with `git mv`, every relative path inside a moved file that leaves its old folder is re-aimed, every live reference to an old path is rewritten, the four agent definitions that name a moved path are edited at their role bodies and regenerated, and the archived plans keep the paths they were written with. The folder test loses its two lists of what is not yet placed, and the rulebook paragraph loses its exception. Nothing any tool does changes; nothing the site build, the browser suite, CI or the lint runs imports a mover (`git grep -n -E '(handoff|issue-reader|recon-triage|delivery|jev)/|agent-sandbox' HEAD -- astro.config.ts scripts/build scripts/ci src e2e .github eslint.config.ts` printed nothing at 62b47ee8), so `dist/` cannot change and no build or browser suite is owed.

### Where each file goes

| old path | new path | who runs it |
|---|---|---|
| `scripts/agent-sandbox.ts` | `scripts/agent-infra/agent-sandbox.ts` | `vellum-guard-prover` and `vellum-pr-skeptic`, by path; `scripts/agent-infra/handoff/` imports it |
| `scripts/delivery/` (9 files) | `scripts/agent-infra/delivery/` | `npm run delivery`: a session, or `vellum-designer`, giving a folder in `out/` its page |
| `scripts/handoff/` (7 files) | `scripts/agent-infra/handoff/` | `npm run handoff`: the orchestrating session, for a Codex build |
| `scripts/issue-reader/` (3 files) | `scripts/agent-infra/issue-reader/` | `npm run issue`: every session and agent |
| `scripts/recon-triage/` (9 files, `trial-set.jsonl` among them) | `scripts/agent-infra/recon-triage/` | `npm run recon-triage`: `vellum-spec-recon` |
| `scripts/jev/` (3 files) | `scripts/shared/jev/` (ruling Q2) | nothing runs it on its own; the review tools in `scripts/review/` and the recon triage import it |

32 files move. Measured in the dry run: `git diff --cached --find-renames --name-status HEAD` gave 32 `R` rows, `R095` the lowest (`out/1454-pr4-dry-run/name-status.txt`). No name inside `scripts/agent-infra/` collides with a mover.

### What this merge does to a session already open (measured)

**A Claude Code session keeps the agent definitions it loaded when it started, and a definition pulled into the main checkout later is not picked up.** Measured three times from the planning session by dispatching `vellum-plate-reader` and asking it to quote its own step 4 import (`out/1454-pr4-dry-run/definition-probe.log`): before PR #1468 merged it quoted the main checkout's `from "./scripts/still-judge/restage.ts"`, not the dispatch tree's `./scripts/review/still-judge/restage.ts`; after the main checkout was pulled to 62b47ee8 at 04:25:07Z, so that its file read `./scripts/review/still-judge/restage.ts`, it still quoted the old path two minutes later and again 27 minutes later. So a dispatched agent's definition is the launch checkout's as the session found it at start, and the dispatch tree never matters.

**How much names the sandbox's path.** At 62b47ee8, outside `handbook/plans/` and `handbook/retired/`, 72 lines in 25 files name `scripts/agent-sandbox.ts` (the old-path search's own count, `old-paths-before.txt`, `test-support/sandbox-repo.ts`'s path built by segments among them): 40 are edited by hand (Files, section 3) and 32 are written by `npm run agents:generate` (section 4). Three more, the `"../agent-sandbox.ts"` imports in `scripts/handoff/`, stay as they are. Pull request 1's plan counted 78 lines in 29 files without recording its pattern; the recon's broader `git grep -n 'agent-sandbox' -- . ':!handbook/plans'` prints 85 lines in 31 files, the `agent-sandbox-` temporary-folder prefixes, the `.gitignore` comment and the moved file's own lines among them.

**What each agent runs by path, and what it hits after this merge.** The by-path commands are the role bodies' (`git grep -n -E 'node scripts/|ls /the/path' -- handbook/agents`):

- `vellum-guard-prover`: every sandbox step, `node scripts/agent-sandbox.ts snapshot|create|mutate|status|restore|teardown|list`, run from its dispatch tree. With a definition loaded before the merge, in a tree cut after it, its first command fails: `Error: Cannot find module '<tree>/scripts/agent-sandbox.ts'`, exit 1 (measured with the move staged, `out/1454-pr4-dry-run/old-path-in-new-tree.log`). No proof round runs.
- `vellum-pr-skeptic`: `node scripts/agent-sandbox.ts create` and `teardown`, the same failure, so no review runs. Its reader probe `ls <sandbox>/scripts/issue-reader/main.ts` reads a moved tree as "predates the reader" and builds a second sandbox at main's head, then reads the thread there by `npm run issue`: one extra step, the same answer.
- `vellum-designer`: its last step, `node scripts/delivery/main.ts <folder>`, fails the same way, so the folder gets no page; `npm run delivery -- <folder>` gives it one by hand.
- Everything else runs by npm script name and keeps working: the recon triage, the reader, the handoff, the plate reader's still judge, the copy hunt, the proof runner.

**The other direction.** A session started after the merge holds the new paths, and in a tree cut before the merge `node scripts/agent-infra/agent-sandbox.ts` fails the same way (measured at 62b47ee8, `new-path-in-old-tree.log`). No forwarding file can mend this direction: the old tree lacks the new path whatever this pull request adds. A branch cut before the merge brings main in (`git merge origin/main`) before its next review. At 62b47ee8 no pull request is open (`gh pr list --state open` printed `[]`) and no Codex build is live.

**This pull request's own review round is the case that decides the landing.** While it is reviewed, the main checkout holds main without this pull request, so every session's definitions name `scripts/agent-sandbox.ts`, and the builder's tree, after commit 2, has no file there. A guard prover or a cold skeptic dispatched from the builder's tree therefore cannot build its sandbox. By ruling Q1 the round is routed around that (Order of commits, Evidence 12 and 13): the guard proof runs on the CI proof runner, which uses no sandbox (`git grep -n agent-sandbox -- scripts/ci` prints nothing), and the dispatcher sends the cold skeptic from the main checkout, which still holds `scripts/agent-sandbox.ts`, with the pull request's head sha. After the merge, every Claude Code session open since before it restarts before it dispatches a guard prover, a cold skeptic or a designer (Calls made 12, and the dispatcher's note under Evidence).

**What does not break.** The footgun hook (`.claude/settings.json` runs `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` from the main checkout on every call, as a new process) names no mover by path: nothing under `scripts/agent-infra/hooks/`, `.claude/skills/vellum-footguns/hooks/`, `.claude/settings.json` or `.codex/hooks.json` names one, and none of those files changes. Its refusal text names the reader by npm script, "Read the thread with `npm run --silent issue -- <N>`" and "A tree whose package.json has no `issue` script predates the reader" (`scripts/agent-infra/hooks/shell-checks.ts` 79), and `npm run issue` keeps its name, so both stay true. Two fixture rows that use a moved path as an example move with it and keep their verdicts (the selftest printed all 1,176 rows `ok` in the dry run). The Codex clone at `.claude/worktrees/codex-build` is never pulled: `npm run handoff -- build` fetches, deletes the clone and clones it afresh detached at `origin/main` (`makeSlot` in `scripts/handoff/slot.ts`), and `resume` reuses it as it stands, so every build runs one commit's paths throughout. `.codex/hooks.json` stays byte for byte and still starts `scripts/agent-infra/hooks/codex-launcher.ts`, which stays, so the hook trust Alex gave at that path today holds for the next clone (Issue #1418; pull request 1's planner read that the trust hash covers the registration, and here not even a hook script changes). The wrapper itself runs from the main checkout's own `package.json`, whose paths and files move together.

### Alternatives rejected

- **A forwarding file left at `scripts/agent-sandbox.ts` through the merge, removed by a follow-up pull request, and one kept only through the review round.** The menu's options 2 and 3 for Q1, which Alex did not take (ruling Q1). Measured for the menu: with a forwarder at the old path, `git diff --find-renames` reads the move as an added file and a modified one (`fwd-names-M.txt`), which breaks pull request 1's call 9 for this file at the squash and makes the copy hunt, which reads a range with `--find-renames` (`changedFiles` in `scripts/review/comment-judge/tree.ts` 50), read its 25 functions as added.
- **`scripts/agent-infra/jev/`, as the issue's table proposed.** The menu's option 2 for Q2, which Alex did not take (ruling Q2).
- **An npm script name for the sandbox command**, so the definitions stop naming a path. A new interface, not a move (pull request 1's plan left it to this one to weigh), and it would not spare this merge: the definitions every open session loaded name the path. Calls made 2.
- **A forwarder for `scripts/delivery/main.ts`.** It would leave a folder at the top of `scripts/` for the designer's last step alone, which `npm run delivery -- <folder>` does by hand.
- **`scripts/delivery/dims.ts` and `scripts/recon-triage/triage.ts` split out into `scripts/shared/`**, since `scripts/review/still-judge/` borrows `pngDims` and `askAll`. Pull requests 2 and 3 kept `feature-match.ts` and `comment-judge/tree.ts` in their commands' folders on the same facts; a pure move keeps each command whole. Calls made 1.
- **The skeptic's reader probe rewritten to test `package.json` for an `issue` script** instead of a path. Path-free, but a new check, not a move; the plain substitution keeps the line's outcome. Calls made 3.
- **Folding in Issue #1369.** Its pair 5 (`escapeHtml` in `scripts/delivery/markdown.ts`) changes what one escaper outputs. Calls made 8.
- **Leaving the folder test's two lists in place, empty.** A list that names nothing is a constant nobody reads. Calls made 10.
- **Rewriting the history.** The archived plans and the retired routine say what was true when they were written (Files, section 6).

## Files

Mechanics for every edit below: the Edit tool, one call per substitution per file, with `replace_all: true` where a file holds the same old text more than once; `.claude/agents/` and `.codex/agents/` are never edited by hand. Line numbers are at 62b47ee8, in the old file.

**The mechanical rewrites of sections 2 and 3 are made with the planner's dry-run script**, as pull request 3's builder did with its planner's: after the six moves, `mkdir -p out/1454-pr4-dry-run`, then `cp /Users/ahl/CodeProjects/Vellum/out/1454-pr4-dry-run/1454-pr4-rewrite.ts out/1454-pr4-dry-run/`, then from the tree's root, each its own command, `node out/1454-pr4-dry-run/1454-pr4-rewrite.ts inside shared`, `node out/1454-pr4-dry-run/1454-pr4-rewrite.ts outside shared` and `node out/1454-pr4-dry-run/1454-pr4-rewrite.ts silent shared`. Each prints its counts, which must match `/Users/ahl/CodeProjects/Vellum/out/1454-pr4-dry-run/rewrite-inside.log`, `rewrite-outside.log` and `rewrite-silent.log` line for line (19, 88 and 2 lines). The script edits every line of sections 2 and 3, `CLAUDE.md`'s two lines among them, and nothing else; the rulebook paragraph and the folder test are typed by hand from this plan, and section 4 is `npm run agents:generate`.

### 1. The moves

Six commands, each its own: `git mv scripts/agent-sandbox.ts scripts/agent-infra/agent-sandbox.ts`, `git mv scripts/delivery scripts/agent-infra/delivery`, `git mv scripts/handoff scripts/agent-infra/handoff`, `git mv scripts/issue-reader scripts/agent-infra/issue-reader`, `git mv scripts/recon-triage scripts/agent-infra/recon-triage`, `git mv scripts/jev scripts/shared/jev`. No `mkdir`: both folders exist.

### 2. Lines inside the moved files (22 lines in 16 files)

| file (new path) | line | from | to |
|---|---|---|---|
| `scripts/agent-infra/delivery/main.ts` | 13 | `new URL("../../out", import.meta.url)` | `new URL("../../../out", import.meta.url)` |
| `scripts/agent-infra/delivery/page.ts` | 39 | `` `scripts/delivery/walk.ts` `` (a comment the citation lint resolves) | `` `scripts/agent-infra/delivery/walk.ts` `` |
| `scripts/agent-infra/delivery/tables.ts` | 1 | `"../shared/is-record.ts"` | `"../../shared/is-record.ts"` |
| `scripts/agent-infra/handoff/launch.ts` | 3 | `"../agent-infra/hooks/headless-build.ts"` | `"../hooks/headless-build.ts"` |
| `scripts/agent-infra/handoff/main.ts` | 3 | `"../agent-infra/model-policy.ts"` | `"../model-policy.ts"` |
| `scripts/agent-infra/handoff/main.ts` | 4 | `"../agent-infra/roles.ts"` | `"../roles.ts"` |
| `scripts/agent-infra/handoff/main.ts` | 28 | `resolve(import.meta.dirname, "..", "..")` | `resolve(import.meta.dirname, "..", "..", "..")` |
| `scripts/agent-infra/handoff/prompt.ts` | 1 | `"../agent-infra/hooks/headless-build.ts"` | `"../hooks/headless-build.ts"` |
| `scripts/agent-infra/handoff/state.ts` | 3 | `"../agent-infra/model-policy.ts"` | `"../model-policy.ts"` |
| `scripts/agent-infra/recon-triage/excerpt.ts` | 1 | `"../review/comment-judge/tree.ts"` | `"../../review/comment-judge/tree.ts"` |
| `scripts/agent-infra/recon-triage/main.ts` | 4 | `"../review/comment-judge/tree.ts"` | `"../../review/comment-judge/tree.ts"` |
| `scripts/agent-infra/recon-triage/main.ts` | 5 | `"../jev/cli.ts"` | `"../../shared/jev/cli.ts"` |
| `scripts/agent-infra/recon-triage/questions.ts` | 1 | `"../jev/system-one.ts"` | `"../../shared/jev/system-one.ts"` |
| `scripts/agent-infra/recon-triage/report.ts` | 1 | `"../review/comment-judge/report.ts"` | `"../../review/comment-judge/report.ts"` |
| `scripts/agent-infra/recon-triage/report.ts` | 2 | `"../jev/system-one.ts"` | `"../../shared/jev/system-one.ts"` |
| `scripts/agent-infra/recon-triage/triage.ts` | 1 | `"../review/comment-judge/tree.ts"` | `"../../review/comment-judge/tree.ts"` |
| `scripts/agent-infra/recon-triage/triage.ts` | 2 | `"../jev/system-one.ts"` | `"../../shared/jev/system-one.ts"` |
| `scripts/agent-infra/recon-triage/trial.ts` | 1 | `"../review/comment-judge/report.ts"` | `"../../review/comment-judge/report.ts"` |
| `scripts/agent-infra/recon-triage/trial.ts` | 2 | `"../jev/system-one.ts"` | `"../../shared/jev/system-one.ts"` |
| `scripts/shared/jev/cli.ts` | 4 | `"../../src/site/shared/error-text.ts"` | `"../../../src/site/shared/error-text.ts"` |
| `scripts/shared/jev/system-one.ts` | 2 | `"../shared/is-record.ts"` | `"../is-record.ts"` |
| `scripts/shared/jev/usage.ts` | 3 | `"../../src/site/shared/error-text.ts"` | `"../../../src/site/shared/error-text.ts"` |

**Two lines are values, not imports, and one of them no check sees.**
- `HOME_OUT` in `delivery/main.ts` 13 is the `out/` folder that `npm run delivery` with no argument lists. Left at `../../out`, it becomes `scripts/out/`: measured with every other rewrite in, `npm run --silent delivery` printed `<tree>/scripts/out/index.html` and exited 0, and `npm run check`, `npm run lint` and the movers' 115 tests all passed (`delivery-noarg-nosilent.log`, `check-nosilent.log`, `lint-nosilent.log`, `mover-tests-nosilent.log`). With the third `..` it printed `<tree>/out/index.html` and exited 0 (`delivery-noarg.log`). Evidence 9 reads it.
- `HERE_ROOT` in `handoff/main.ts` 28 is the folder `loadModelPolicy` reads `.agents/model-policy.json` from. Left at two levels, `test/repo/handoff-run.test.ts` reds 8 tests on `ENOENT ... scripts/.agents/model-policy.json` (`mover-tests-nosilent.log`), so the suite holds it.

**Stays as it is**, because both ends now sit in `scripts/agent-infra/`: `"../agent-sandbox.ts"` in `handoff/main.ts` 5, `handoff/slot.ts` 3 and `handoff/snapshot.ts` 4; `"../issue-reader/thread.ts"` in `handoff/snapshot.ts` 5. Also every `./` import inside a folder; `new URL("./trial-set.jsonl", import.meta.url)` in `recon-triage/main.ts` 41; `join("..", "..", "..", "node_modules")` in `handoff/slot.ts` 47 and `LINK` in `agent-sandbox.ts` 13, which count up from the clone and the sandbox, never from the file. `agent-sandbox.ts` finds the repository by git from the working folder (`resolveRoot`, `resolveTree`) and holds no path of its own, so it changes no line. `issue-reader/` holds no path outside its folder.

### 3. References elsewhere (131 lines in 73 files)

The plain substitution, unless a line says otherwise: `scripts/agent-sandbox.ts` to `scripts/agent-infra/agent-sandbox.ts`; `scripts/delivery/`, `scripts/handoff/`, `scripts/issue-reader/` and `scripts/recon-triage/` to `scripts/agent-infra/<the same name>/`; `scripts/jev/` to `scripts/shared/jev/`. This also turns `../scripts/...`, `../../scripts/...` and `/the/path/create/printed/scripts/...` into the right form.

**Configuration (4 lines in 1 file)**: `package.json` 18 `"delivery": "node scripts/agent-infra/delivery/main.ts"`, 19 `"handoff": "node scripts/agent-infra/handoff/main.ts"`, 20 `"issue": "node scripts/agent-infra/issue-reader/main.ts"`, 25 `"recon-triage": "node scripts/agent-infra/recon-triage/main.ts"`. Every script keeps its name.

**Code under `scripts/review/` (21 lines in 18 files)**: `"../../jev/` to `"../../shared/jev/` in `comment-judge/judge.ts` 1, `comment-judge/main.ts` 3, `comment-judge/questions.ts` 1, `comment-judge/report.ts` 1, `copy-hunt/hunt.ts` 1, `copy-hunt/main.ts` 4, `copy-hunt/questions.ts` 1, `copy-hunt/report.ts` 2, `keeper-scan/main.ts` 3, `keeper-scan/questions.ts` 3, `keeper-scan/scan.ts` 4, `still-judge/compare.ts` 1, `still-judge/main.ts` 4, `still-judge/questions.ts` 2, `still-judge/report.ts` 3, `still-judge/score.ts` 2; `"../../recon-triage/` to `"../../agent-infra/recon-triage/` in `still-judge/compare.ts` 2 and `still-judge/main.ts` 5; `"../../delivery/` to `"../../agent-infra/delivery/` in `still-judge/png.ts` 1 and `still-judge/report.ts` 2; and `copy-hunt/accepted-copies.ts` 84, the `file:` key `"scripts/agent-sandbox.ts"`, the plain substitution, so the accepted `haveCommit` copy still matches its file (its hash does not change: the lint and `test/repo/copy-hunt-accepted.test.ts` passed in the dry run).

**Test helpers (7 lines in 6 files)**: `test-support/copy-hunt-fixtures.ts` 4; `test-support/jev-fakes.ts` 12, 13; `test-support/jev-interrupted-run.ts` 1; `test-support/footgun-gate/gate-routes.fixtures.ts` 58 (the row "a non-e2e scripts .ts gets no gate 2", whose path becomes `scripts/agent-infra/agent-sandbox.ts`, verdict `null` as before); `test-support/footgun-gate/headless-build.fixtures.ts` 266 (`"node scripts/agent-infra/agent-sandbox.ts list"`, still a command a build may run); `test-support/sandbox-repo.ts` 7, `resolve(import.meta.dirname, "..", "scripts", "agent-sandbox.ts")` to `resolve(import.meta.dirname, "..", "scripts", "agent-infra", "agent-sandbox.ts")`.

**Unit tests (59 lines in 35 files)**: `test/repo/agent-sandbox-listing.test.ts` 6; `agent-sandbox-mutate.test.ts` 5; `agent-sandbox.test.ts` 28 and 327 (a comment); `comment-judge-judge.test.ts` 8; `comment-judge-questions.test.ts` 11; `comment-judge-trial.test.ts` 7; `copy-hunt-hunt.test.ts` 6; `copy-hunt-report.test.ts` 14; `copy-hunt-runs.test.ts` 6; `delivery-dims.test.ts` 6; `delivery-walk.test.ts` 6; `em-dash-string.test.ts` 15 (the stand-in file name the lint reads the plant as); `handoff-collect.test.ts` 16, 17, 18; `handoff-launch.test.ts` 4, 5, 12; `handoff-next.test.ts` 3; `handoff-run.test.ts` 16 to 20; `handoff-slot.test.ts` 17; `import-bounds.test.ts` 239 (a plant, `${up}scripts/agent-infra/delivery/main.ts`); `issue-reader.test.ts` 3, 4; `jev-cli.test.ts` 6, 7, 8; `jev-system-one.test.ts` 14; `jev-usage.test.ts` 5, 15; `keeper-scan-questions.test.ts` 4; `keeper-scan-report.test.ts` 4; `recon-triage-claims.test.ts` 3; `recon-triage-excerpt.test.ts` 4; `recon-triage-questions.test.ts` 3; `recon-triage-report.test.ts` 4 to 9; `recon-triage-route.test.ts` 3, 4; `recon-triage-triage.test.ts` 4 to 8; `recon-triage-trial.test.ts` 3, 12; `still-judge-compare.test.ts` 3; `still-judge-png.test.ts` 3; `still-judge-questions.test.ts` 4; `still-judge-score.test.ts` 3. `npm run format` then rewraps `test/repo/em-dash-string.test.ts` line 15 over four lines (measured: `npm run format:check` red on that file alone until then, `format.log`, and passed after, `format-2.log`).

**Prose (40 lines in 13 files)**:
- `CLAUDE.md` 288 and 298 (Rosters and doctrine).
- `.claude/skills/vellum-footguns/SKILL.md` 62.
- `.gitignore` 2, the comment `# sandbox recipe in scripts/agent-infra/agent-sandbox.ts creates node_modules`.
- `handbook/agents/adapters/codex-local.md` 23.
- `handbook/agents/roles/vellum-designer.md` 9 and 63; `vellum-guard-prover.md` 14, 17, 19, 39, 40, 41, 49, 52, 130, 134; `vellum-pr-skeptic.md` 27 (`ls /the/path/create/printed/scripts/agent-infra/issue-reader/main.ts`), 45, 61, 64, 66, 90; `vellum-spec-recon.md` 28 (the example claim's `"paths": ["scripts/shared/jev/system-one.ts"]`).
- `handbook/errata/guards.md` 104, 105, 138; `handbook/errata/prose.md` 83, 84 (84 names two moved files).
- `handbook/specs/check-placement.md` 221, 248, 250, 255; `handbook/specs/development-workflow.md` 186, 187, 309, 388; `handbook/specs/orchestration.md` 110, 328, 348.

### 4. Written by `npm run agents:generate` (38 lines in 8 files)

After the role bodies and the adapter change, `npm run agents:generate` writes `.claude/agents/vellum-designer.md`, `vellum-guard-prover.md`, `vellum-pr-skeptic.md`, `vellum-spec-recon.md` and `.codex/agents/vellum-designer.toml`, `vellum-guard-prover.toml`, `vellum-pr-skeptic.toml`, `vellum-spec-recon.toml`, and prints `agents:generate: 8 file(s) written`; `npm run agents:check` then prints `agents:check: every generated agent definition is current` (measured, `agents-generate.log`, `agents-check.log`).

### 5. The rulebook paragraph and the folder test

Rosters and doctrine, and Tests, below.

### 6. Left as written

- `handbook/plans/`: the archived plans keep the old paths, as the issue rules.
- `handbook/retired/cloud-routine.md` 39: archived byte for byte (`handbook/specs/rulebook.md`, Retired rules).
- Names that are not these paths: the npm script names `delivery`, `handoff`, `issue` and `recon-triage`; the test files' names (`test/repo/agent-sandbox*.test.ts`, `handoff-*`, `issue-reader.test.ts`, `jev-*`, `recon-triage-*`, `delivery-*`); the `tmpdir()` prefix `agent-sandbox-` (`test/repo/agent-sandbox-listing.test.ts` 104, `test/repo/agent-sandbox.test.ts` 305, `test-support/sandbox-repo.ts` 13); the word `agent-sandbox` in the moved script's usage line (239); `refs/handoff/<issue>`, the branch `handoff-hook-check`, the record folder `out/<issue>-handoff/` and the clone `.claude/worktrees/codex-build`.
- `scripts/agent-infra/recon-triage/trial-set.jsonl`: no row names a mover (the old-path search does not list it), so nothing in it changes.
- Everything under `scripts/agent-infra/hooks/` and `.claude/skills/vellum-footguns/hooks/`, `.claude/settings.json` and `.codex/hooks.json`.
- Issue #1369's body, which cites `scripts/delivery/markdown.ts`: an issue body is left as written (Calls made 8).

## Rosters and doctrine

**`handbook/specs/rulebook.md`, What `src/` holds, and what runs around it.** The paragraph at line 391, which now reads:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a small module that scripts of several kinds import goes in `scripts/shared/`; a command that reads a change and reports on it to a review, the cold review of a pull request, a plate reading or the weekly sitting, goes in `scripts/review/`; whatever else the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`; a script a session runs by hand to measure a world goes in `scripts/measure/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own inside the folder of who runs it. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this: no file stands there but the ones its `NOT_YET_PLACED` names, and no folder but the ones its `SCRIPT_FOLDERS` and `FOLDERS_NOT_YET_PLACED` name.

becomes exactly, one line as before:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a module that scripts of several kinds import and nothing runs on its own, a single file or a folder of its own, goes in `scripts/shared/`; a command that reads a change and reports on it to a review, the cold review of a pull request, a plate reading or the weekly sitting, goes in `scripts/review/`; whatever else the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`; a script a session runs by hand to measure a world goes in `scripts/measure/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own inside the folder of who runs it, even where a script of another kind borrows one of them. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this: no file stands there, and no folder but the ones its `SCRIPT_FOLDERS` names.

The shared clause drops "small" and gains "and nothing runs on its own, a single file or a folder of its own", which is what `scripts/shared/jev/` is (ruling Q2); the folder clause gains "even where a script of another kind borrows one of them", which is the rule pull requests 2 to 4 kept (Calls made 1); the last sentence loses the exception the two lists held. The only test that reads this file is `test/repo/prose-paths.test.ts`, which takes a backticked path only where it ends in a file extension, and the paragraph's paths are folders.

**`CLAUDE.md`, Worktrees.** Exactly two lines change, the plain substitution:
- 288: "NOT ignored, and `scripts/agent-sandbox.ts` assumes that location: it links `node_modules` three" becomes "NOT ignored, and `scripts/agent-infra/agent-sandbox.ts` assumes that location: it links `node_modules` three".
- 298: "  `node scripts/agent-sandbox.ts create guard-<topic>-<round>`. Do not point it at harness isolation." becomes "  `node scripts/agent-infra/agent-sandbox.ts create guard-<topic>-<round>`. Do not point it at harness isolation."

No other line of `CLAUDE.md` names a mover's path: line 185 names `npm run --silent issue`, lines 65 and 67 `npm run handoff`, line 208 `scripts/agent-infra/hooks/`, all of which stand.

**The agent definitions.** Four role bodies and the Codex adapter change (Files, section 3) and are regenerated (section 4), so workflow step 14's paragraph applies: the PR body says the builder's definition (`vellum-implementer`) is unchanged, and that the cold skeptic that reviews it runs the definition its dispatching session loaded when that session started, which predates this pull request (measured, `definition-probe.log`).

No roster changes: no moved file is a page, a suite, a sheet or a bundle entry; no test file is added or renamed, so `UNIT_SECONDS` in `scripts/ci/unit-shards.ts` keeps its keys; `SOURCE_READS` in `test-support/source-read-list.ts` names none of the moved files; no model policy changes. `scripts/agent-infra/hooks/` and `.codex/hooks.json` do not change.

## Tests, in the order they are written

**T1 and T3, the folder test.** In `test/site/folder-layout.test.ts`, lines 47 to 81 (pull request 1's `NOT_YET_PLACED` and its test, and pull request 2's `SCRIPT_FOLDERS`, `FOLDERS_NOT_YET_PLACED` and its test) become exactly, as `npm run format` lays them out:

```ts
test("no file sits directly under scripts/ (Issue #1454)", () => {
  const remainders = listed("scripts");
  const loose = remainders.filter((r) => !r.includes("/"));
  assert.deepEqual(loose, []);
  assert.ok(foldersOf(remainders).has("lint"), "git listed the tree");
});

const SCRIPT_FOLDERS: readonly string[] = [
  "agent-infra",
  "build",
  "ci",
  "design",
  "lint",
  "measure",
  "review",
  "shared",
];

test("every folder directly under scripts/ is one SCRIPT_FOLDERS names, and each of those is still there (Issue #1454)", () => {
  const folders = foldersOf(listed("scripts"));
  const strays = [...folders].filter((name) => !SCRIPT_FOLDERS.includes(name)).sort();
  assert.deepEqual(strays, []);
  assert.ok(
    SCRIPT_FOLDERS.every((name) => folders.has(name)),
    "git listed the tree, and every folder SCRIPT_FOLDERS names still stands at the top of scripts/",
  );
});
```

The file above line 47 is unchanged.

- Red first, at the first commit, before any move: measured at 62b47ee8, the file passed 3 of 5, T1 red on the `deepEqual` with `actual: [ 'agent-sandbox.ts' ]` and T3 red on the `deepEqual` with `actual: [ 'delivery', 'handoff', 'issue-reader', 'jev', 'recon-triage' ]` (`out/1454-pr4-dry-run/t-red.log`). No stub is needed: the tests read the tree, and the tree is the wrong state.
- Green after the moves: 5 of 5 (`t-green.log`), and in the full suite (`unit.log`).
- The mutations that red them once green, each measured on the moved tree: (a) a file left at `scripts/agent-sandbox.ts` beside its moved copy: T1 red, `actual: [ 'agent-sandbox.ts' ]` (`t-mut-a.log`); (b) an untracked `scripts/jev/x.ts` holding `export {};`, a folder left beside its moved copy: T3 red, `actual: [ 'jev' ]` (`t-mut-b.log`); (c) `"gone-1454"` added to `SCRIPT_FOLDERS`: T3's `assert.ok` red with its message (`t-mut-c.log`); (d) `"review"` taken out of `SCRIPT_FOLDERS`: T3 red, `actual: [ 'review' ]` (`t-mut-d.log`); (e) T1's `listed("scripts")` changed to `listed("scripts-x")`: T1's `assert.ok` red, "git listed the tree" (`t-mut-e.log`), the witness that keeps an empty listing from passing.
- Proved on the CI proof runner (Evidence 12), not by `vellum-guard-prover` (ruling Q1), since a prover dispatched from the builder's tree cannot build its sandbox (The design). Workflow step 11 allows it.

**Every other test** changes only the path it imports, spawns or names, and is not a new or strengthened guard. Their red is the move itself: after the `git mv` and before the references are rewritten, `npm run check` fails on each import, which is the expected state between those two steps and is not committed.

No browser check is added or made longer, so no ledger line and no readings are owed, and no browser suite loads a moved file.

## Order of commits

1. `#1454 The plan for pull request 4, and the folder checks that red until the agent tools move`: `handbook/plans/1400/1454/1454-pr4-plan.md` (this file, unchanged, beside the three plans before it, never over one) and T1 and T3 as above, with `npm run format` run before the commit so `npm run format:check` passes on it. Push it (workflow step 9); CI reds on T1 and T3, as intended, and on nothing else.
2. `#1454 The agent tools move into scripts/agent-infra/, and the System One client into scripts/shared/`: the six `git mv`, Files sections 2 and 3 complete, `npm run agents:generate`, the rulebook paragraph and the two `CLAUDE.md` lines, with `npm run format` run before the commit so `npm run format:check` passes on it. Green. Push it.

After commit 2 is pushed, in this order: the proof rows (Evidence 12), the step 12 comment, the pull request, and then stop and report to the dispatcher with the PR number and the proof ledger (Evidence 13).

**You never dispatch `vellum-guard-prover` or `vellum-pr-skeptic` for this pull request** (ruling Q1). Under the definitions your dispatching session loaded, both run `node scripts/agent-sandbox.ts`, which your tree no longer holds after commit 2, so both would stop at their first command. The proof runner stands in for the prover (Evidence 12), and the dispatcher dispatches the skeptic from the main checkout (Evidence 13). Its findings come back to you through the dispatcher.

## Evidence

Run each command alone, and only while no other lane runs a suite, a build or a browser (`ps -Ao pid,etime,command | grep -E 'node|chrom' | grep -v grep` shows none of theirs); say in the report when you waited. Keep every bare `node --test` bounded (`NODE_OPTIONS=--max-old-space-size=2048`, `--test-timeout=600000`).

1. `npm run check`, `npm run lint`, `npm run format:check`, `npm run agents:check`.
2. `node test-support/footgun-gate/selftest.ts` (1,176 rows, every one `ok`, in the dry run), then `NODE_OPTIONS=--max-old-space-size=2048 npm test` (4,278 of 4,278 in 171 s in the dry run, `unit.log`), then `npm run astro:generate` (the suite deletes `generated/`).
3. The old-path search, which must print nothing and exit 1 (at 62b47ee8, run against `HEAD`, it printed 150 lines in 65 files, `old-paths-before.txt`, `old-paths-by-file.txt`; on the finished dry run, nothing, `old-paths-after.txt`):

   ```
   git grep -n -i -E 'scripts/\(?(handoff|issue-reader|recon-triage|delivery|jev)/|scripts/agent-sandbox\.ts|scripts\\/\(?(handoff|issue-reader|recon-triage|delivery|jev|agent-sandbox)|"scripts", "(handoff|issue-reader|recon-triage|delivery|jev|agent-sandbox)' -- . ':!handbook/plans' ':!handbook/retired'
   ```

4. The relative-import searches, each of which must print nothing and exit 1 (at 62b47ee8, 20 lines and 19 lines, `rel-a-before.txt`, `rel-b-before.txt`; on the dry run, nothing):

   ```
   git grep -n -E '"(\.\./)+(handoff|issue-reader|recon-triage|delivery|jev)/|"(\.\./)+agent-sandbox\.ts"' -- . ':!scripts/agent-infra' ':!handbook/plans'
   ```

   ```
   git grep -n -E '"\.\./(jev|shared)/|"\.\./agent-infra/|"\.\./\.\./src/|"\.\./review/' -- scripts/agent-infra/delivery scripts/agent-infra/handoff scripts/agent-infra/issue-reader scripts/agent-infra/recon-triage scripts/agent-infra/agent-sandbox.ts scripts/shared/jev
   ```

5. The new-path check: `git grep -h -o -E 'scripts/(agent-infra/(agent-sandbox\.ts|(delivery|handoff|issue-reader|recon-triage)/[a-z-]+\.(ts|jsonl))|shared/jev/[a-z-]+\.ts)' -- . ':!handbook/plans'` piped to `sort -u`, then one `ls` naming every path it printed; `ls` lists each and reports no missing file.
6. `git diff --find-renames --name-status origin/main` lists the 32 moves as `R` rows (`R095` the lowest in the dry run); `git diff --stat origin/main -- .codex/hooks.json .claude/settings.json scripts/agent-infra/hooks .claude/skills/vellum-footguns/hooks` prints nothing.
7. `git grep -n -E 'import\.meta\.(dirname|url)' -- scripts/agent-infra/delivery/main.ts scripts/agent-infra/handoff/main.ts` prints exactly two lines, the two values with three levels: `scripts/agent-infra/delivery/main.ts:13:const HOME_OUT = fileURLToPath(new URL("../../../out", import.meta.url));` and `scripts/agent-infra/handoff/main.ts:28:const HERE_ROOT = resolve(import.meta.dirname, "..", "..", "..");` (at 62b47ee8 the same command over the old paths printed the same two lines with two levels).
8. Each moved entry loads, each alone and with no argument: `npm run --silent issue` prints `usage: npm run --silent issue -- <number> [--json]` and exits 2; `npm run --silent recon-triage` prints `usage: npm run recon-triage -- rank <claims.jsonl> [--dry-run] [--out <dir>] | trial --out <dir> [--dry-run]` and exits 2; `npm run --silent handoff` prints `usage: npm run handoff -- next <issue> | build <issue> --plan <path> --session <link> | resume <issue> --brief <path> [--plan <path>]` and exits 1; `node scripts/agent-infra/agent-sandbox.ts` prints `usage: agent-sandbox create <name> [sha] | teardown <name> | snapshot <outfile> | list | mutate <name> <path> <line> <from> <to> | restore <name> <path>... | status <name>` and exits 1 (measured, `usage-*.log`). None sends anything.
9. `npm run --silent delivery`, with no argument, prints `<the tree's absolute path>/out/index.html` and exits 0, and `ls scripts/out scripts/agent-infra/out` reports that neither exists (measured, `delivery-noarg.log`).
10. `npm run --silent issue -- 1454` prints the thread, its third line beginning `Comments:` (measured, `reader-moved.log`).
11. No build and no browser suite is owed: the command under The design prints nothing. Say so in the body with it.
12. **The guard proof, on the CI proof runner.** After commit 2 is pushed, write these three files in the scratchpad, each exactly as given, the two patches ending in a newline:

    `1454-pr4-sandbox-left.patch`:

    ```
    diff --git a/scripts/agent-sandbox.ts b/scripts/agent-sandbox.ts
    new file mode 100644
    --- /dev/null
    +++ b/scripts/agent-sandbox.ts
    @@ -0,0 +1 @@
    +export {};
    ```

    `1454-pr4-jev-left.patch`:

    ```
    diff --git a/scripts/jev/x.ts b/scripts/jev/x.ts
    new file mode 100644
    --- /dev/null
    +++ b/scripts/jev/x.ts
    @@ -0,0 +1 @@
    +export {};
    ```

    `1454-pr4-proof.json`, with `<scratchpad>` the scratchpad's absolute path:

    ```json
    [
      {
        "id": "1454-pr4-sandbox-left",
        "patch": "<scratchpad>/1454-pr4-sandbox-left.patch",
        "unit": { "files": ["test/site/folder-layout.test.ts"], "expect": ["no file sits directly under scripts/ (Issue #1454)"] }
      },
      {
        "id": "1454-pr4-listing-witness",
        "edits": [{ "file": "test/site/folder-layout.test.ts", "find": "const remainders = listed(\"scripts\");", "replace": "const remainders = listed(\"scripts-x\");" }],
        "unit": { "files": ["test/site/folder-layout.test.ts"], "expect": ["no file sits directly under scripts/ (Issue #1454)"] }
      },
      {
        "id": "1454-pr4-jev-left",
        "patch": "<scratchpad>/1454-pr4-jev-left.patch",
        "unit": { "files": ["test/site/folder-layout.test.ts"], "expect": ["every folder directly under scripts/ is one SCRIPT_FOLDERS names, and each of those is still there (Issue #1454)"] }
      },
      {
        "id": "1454-pr4-folder-gone",
        "edits": [{ "file": "test/site/folder-layout.test.ts", "find": "  \"shared\",\n];", "replace": "  \"shared\",\n  \"gone-1454\",\n];" }],
        "unit": { "files": ["test/site/folder-layout.test.ts"], "expect": ["every folder directly under scripts/ is one SCRIPT_FOLDERS names, and each of those is still there (Issue #1454)"] }
      },
      {
        "id": "1454-pr4-review-unlisted",
        "edits": [{ "file": "test/site/folder-layout.test.ts", "find": "  \"review\",\n", "replace": "" }],
        "unit": { "files": ["test/site/folder-layout.test.ts"], "expect": ["every folder directly under scripts/ is one SCRIPT_FOLDERS names, and each of those is still there (Issue #1454)"] }
      }
    ]
    ```

    then `npm run proof -- send <scratchpad>/1454-pr4-proof.json` from the tree, and `npm run proof -- read <run id>` once it has finished. Each of the five rows reads BITES beside a clean control. Checked without sending (`out/1454-pr4-dry-run/proof/1454-pr4-check-rows.ts`, log `check-rows.log`): with the moves staged, `git apply --check` passed on both patches, each `find` stands once in the planned test, and the runner's own `parseList` accepted the five entries. The PR body's Guards record quotes the five rows with the run id, says the proofs are the runner's, and says `vellum-guard-prover` was not dispatched, and why.
13. **The cold skeptic, dispatched by the dispatcher, not by you** (ruling Q1). Once the pull request is open and Evidence 12's ledger is in, stop and report to the dispatcher with the PR number and the ledger. The dispatcher dispatches `vellum-pr-skeptic` cold, with the PR number and nothing else, from the main checkout, while the main checkout still holds main without this pull request: its `node scripts/agent-sandbox.ts create skeptic-<pr>-<round> <sha>` runs from there, where the file stands, and builds the sandbox at this pull request's head. Under that definition its reader probe reads this branch as predating the reader and reads the thread from a second sandbox at main's head, and its copy hunt finds its command at the path its definition names or builds that same second sandbox: either is the step working, the same answer. Its findings come back to you through the dispatcher, on workflow step 15's terms.
14. `vellum-plate-reader` is not owed: nothing under `src/` changes, so step 1 of its "Two versions of one sheet" prints no change, and the deliverable is not an appearance.
15. The PR body carries workflow step 14's line on the agent definitions (Rosters and doctrine).
16. The PR body's Rulings section points at https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7164179939 and states the order after the merge, exactly as the paragraph below gives it, so whoever merges reads it at the merge.

**For the dispatcher, after the merge** (ruling Q1; the implementer does not run it), in this order:
1. Update the main checkout to the merged `main`.
2. Restart every Claude Code session that was open before the merge, this orchestrating session included, after its wrap-up. Until a session has restarted it dispatches no `vellum-guard-prover`, no `vellum-pr-skeptic` and no `vellum-designer`.
3. Before any review of a branch cut before the merge, merge `main` into that branch.

Measured: a pulled definition is not picked up without a restart (`definition-probe.log`).

Measurements behind this plan, all in the planner's tree, the dry runs uncommitted and discarded with `git reset --hard HEAD` after, folder `out/1454-pr4-dry-run/`, copied by the dispatcher to `/Users/ahl/CodeProjects/Vellum/out/1454-pr4-dry-run/` (`sha.txt` holds 62b47ee8):
- The definition probe, three dispatches (`definition-probe.log`).
- The two directions of the path (`old-path-in-new-tree.log`, `new-path-in-old-tree.log`).
- T1 and T3 red before the moves (`t-red.log`); the moves and the rewrites (`1454-pr4-rewrite.ts`, `rewrite-inside.log`, `rewrite-outside.log`, `rewrite-silent.log`), `npm run agents:generate`; with the two value lines left, `check-nosilent.log`, `lint-nosilent.log`, `mover-tests-nosilent.log` (8 red, all `HERE_ROOT`), `delivery-noarg-nosilent.log` (`scripts/out/index.html`, exit 0).
- The finished dry run: `check.log`, `lint.log`, `format.log` then `format-2.log`, `agents-check.log`, `selftest.log` (1,176 `ok`), `unit.log` (4,278 of 4,278), the searches (`old-paths-after.txt`, `rel-a-after.txt`, `rel-b-after.txt`, all empty), `name-status.txt` (32 `R`, 82 `M`), `usage-*.log`, `delivery-noarg.log`, `reader-moved.log`, `build-reach.txt` (empty), T1 and T3 green (`t-green.log`) and their mutations (`t-mut-a.log` to `t-mut-e.log`); the full diff is `dry-run.diff`, and the planned folder test is `folder-layout.final.ts`.
- The proof rows, checked without sending (`proof/check-rows.log`).
- The forwarder Alex did not take (ruling Q1), measured for the menu and built by no one: `stub-agent-sandbox.ts`, `stub.log`, `check-stub.log`, `lint-stub.log`, `agent-sandbox-forwarder.test.ts`, `sandbox-repo.diff`, `fwd-red-stub.log`, `fwd-green.log`, `fwd-mut-a.log`, `fwd-mut-b.log`, `fwd-names-M.txt`, `fwd-names-MB.txt`, `fwd-names-C.txt`, `cli-probe.log`.

## Calls made

Each is mine, taken on the rule named; Alex saw them with the menu and overruled none. The step 12 comment copies them and points at the rulings comment (https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7164179939) for Q1 and Q2 rather than restating them.

1. **`scripts/agent-infra/delivery/dims.ts` and `scripts/agent-infra/recon-triage/triage.ts` stay inside their commands' folders**, though `scripts/review/still-judge/` borrows `pngDims` and `askAll`, and the rulebook's folder clause gains "even where a script of another kind borrows one of them". Rule: pull request 2's precedent for `feature-match.ts` and pull request 3's for `comment-judge/tree.ts`; doctrine moves with the code (workflow step 8).
2. **No npm script name for the sandbox command.** Rule: a pure move adds no interface (pull request 1's plan); and it would not spare this merge, since the definitions every open session loaded name the path.
3. **The agents' lines take the plain substitution**, the skeptic's reader probe and the designer's `node scripts/agent-infra/delivery/main.ts` among them. Rule: pull request 3's call 5; each line's outcome is unchanged once a session holds the new definitions.
4. **`HOME_OUT` and `HERE_ROOT` gain a third `..`**, though no check sees the first. Rule: a pure move keeps every value what it was (pull request 3's call 3).
5. **Strings that only stand for a path are rewritten too**: the two fixture rows, the `em-dash-string` and `import-bounds` plants, the accepted copy's `file:` key, the `.gitignore` comment and the recon definition's example claim. None changes a verdict. Rule: pull request 1's call 6.
6. **What stays as written** is Files, section 6. Rule: the issue keeps `handbook/plans/` as written; `handbook/retired/` is archived byte for byte; a name that is not a path is not a reference (pull request 2's call 7).
7. **The five `handbook/errata/` rows are rewritten.** Open work a builder follows by path. Rule: pull request 1's call 5.
8. **Issue #1369 is not folded in, and its body is left as written.** Its pair 5 changes what `escapeHtml` outputs, and its own planner's recon re-baselines the path it cites. Rule: pull request 1's call 2, a pure move folds in no behavior change.
9. **No build and no browser suite is run.** Nothing they run imports a mover (the command under The design). Rule: workflow step 10, the local run is the targeted one.
10. **The folder test's two lists are deleted, not left empty**, and T1's witness becomes `has("lint")` alone. Rule: a constant that names nothing guards nothing; the dispatcher's brief (nothing on the not-yet-placed list after this pull request).
11. **The rulebook's shared clause drops "small" and gains "and nothing runs on its own, a single file or a folder of its own"**, and its last sentence loses the exception. Rule: doctrine moves with the code; the rule has one home (`handbook/specs/conventions.md`, Where a rule lives).
12. **When it lands beside the weekly comment sweep** (due on or after 2026-11-27, the newest tag `comment-sweep/2026-11-20`): before the sitting, only if the merge, the pull of the main checkout and the restart of every open Claude Code session (Evidence, the dispatcher's order) all come before the sitting dispatches its cold skeptic; otherwise once the sitting has ended, its tag pushed and its pull request merged; never while a sweep branch is open. The sweep's range then gains 32 clean renames and two rewritten comment lines (`scripts/agent-infra/delivery/page.ts` 39 and `test/repo/agent-sandbox.test.ts` 327, the only comment lines the dry run's diff adds). Rule: the issue's "each landed while no open branch touches those files", and the definition probe.
13. **Branch `chore/1454-pr4-agent-infra`**, and the body closes Issue #1454.
14. **`npm run delivery`, `npm run handoff`, `npm run issue` and `npm run recon-triage` keep their names.** Rule: a pure move.

## Open decisions

none. The two questions the step 6 menu put to Alex are ruled (Rulings, above), and this plan is built to them.

What ruling Q1 rested on, kept for the next reader: a Claude Code session keeps the agent definitions it loaded when it started, and a definition pulled into the main checkout later is not picked up (three probes, the last 27 minutes after the pull, `definition-probe.log`). So while this pull request is reviewed every session's guard prover and cold skeptic run `node scripts/agent-sandbox.ts`, which the builder's tree no longer holds, and after the merge every session started before it keeps that path until it restarts.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 62b47ee8 origin/main -- scripts/ test/ test-support/ package.json handbook/agents/ CLAUDE.md .gitignore` shows a change to any file this plan names under those roots, or the old-path searches (Evidence 3 and 4), run before the first edit, print a line in a code or test file that Files sections 2 and 3 do not list. A named spec or errata file that moved is built on as it stands.
- `npm run check`, `npm run lint` or `npm test` reds on an import, a path or a test this plan does not name, or `npm run format:check` reds after `npm run format` has run.
- T1 and T3 at commit 1 red on anything but the file and the five folders of Tests, or either is green.
- `npm run agents:generate` writes any file but the eight of Files section 4, or `npm run agents:check` fails after it.
- The selftest prints any row that is not `ok`.
- Any of Evidence 5 to 10 prints other than it says, or `git diff --stat origin/main -- .codex/hooks.json .claude/settings.json scripts/agent-infra/hooks .claude/skills/vellum-footguns/hooks` prints anything.
- `npm run proof -- send` refuses the list, or a row reads anything but BITES beside a clean control.
- A `vellum-guard-prover` or a `vellum-pr-skeptic` dispatched from your own tree stops at its first sandbox command with `Cannot find module '<tree>/scripts/agent-sandbox.ts'`. That is the gap this plan routes around (Evidence 12 and 13), not a defect to work around: never build a sandbox by hand or by another recipe.
- A pull request other than this one opens, or a Codex build starts, before the merge, with a change to a moved file or a line the old-path search matches; report it to the dispatcher before merging main into this branch.

## The parallel lanes

- **None open.** `gh pr list --state open` printed `[]` once PR #1468 merged as 62b47ee8. Only the planner's tree and `.claude/worktrees/codex-build` stand under `.claude/worktrees/`.
- **No live Codex build.** `out/1437-handoff/` in the main checkout is the record of Issue #1437's build, which ended `OUTCOME: hook` on 2026-11-24 (its run's process is gone), and Issue #1437 is closed. The record still holds the build's clone (`slotHolder` in `scripts/handoff/slot.ts` counts any other issue's `state.json`), so the next `npm run handoff -- build` of another issue refuses until it is retired. Alex has ruled it retired; the dispatcher moves it aside as `out/1437-handoff-1443` (PR #1443 closed Issue #1437), outside this pull request. No `refs/handoff/` ref and no `codex-1437` review tree exist (`git for-each-ref refs/handoff/` printed nothing).
- **The weekly sweep** is the one coming branch that may touch these files: Calls made 12.
