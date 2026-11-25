# Issue #1454, pull request 3: the review tools go into a new `scripts/review/`

**Planned at**: `origin/main` 2b941ad3e92cf00d3a666f71751c59c72784f902; Issue #1454 read through `npm run --silent issue -- 1454` with 7 comments shown and 0 withheld. The menu was put at the same sha with 6 comments; the seventh is the rulings comment below, and `origin/main` had not moved when the rulings were folded in.

**Rulings**: Alex's rulings on the two questions of the step 6 menu, posted at https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7150475160 (2026-11-25). Each took the recommended option:

- **Q1, where the five review helpers live: "`scripts/review/`".** The five folders move into a new `scripts/review/`; the rulebook gains the rule that a helper that reads a change and reports on it for a review lives there, and the agents' folder rule is reworded to "everything else the agents run" (Rosters and doctrine).
- **Q2, sessions already open when it lands: "Nothing special".** No restart is asked for and no brief changes. Whichever side of the merge a reviewer's definition and its tree fall on, the plate reader's chart comparison stops with a clear file-not-found rather than a wrong reading, and the code reviewer takes one extra setup step for the same answer; the gap closes as each session restarts. The plan holds nothing for it.

**Branch**: `chore/1454-pr3-scripts-review` (`git ls-remote origin refs/heads/chore/1454-pr3-scripts-review` printed nothing at 2b941ad3). This pull request leaves Issue #1454 open: the last pull request moves the agent tools and `scripts/agent-sandbox.ts`, so the body uses the template's form for a pull request that has an issue and deliberately leaves it open (`vellum-footguns` Gate 5 item 5).

## Specs

Read these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/rulebook.md`, "What `src/` holds, and what runs around it": the paragraph opening "**Inside `scripts/`, a file sits in the folder of who runs it**", which this pull request extends (Rosters and doctrine, below).
- `handbook/specs/conventions.md`, "Where a rule lives", "How a spec, and the rest of the house's prose, is written" (a backticked path is scanned; no roster in a spec), "How code is cited" and "The comment sweep" (four of the five tools are the sweep's).
- `handbook/specs/check-placement.md`, "The unit suite" (what a unit test may read) and the bullet opening "No check holds a judgment that rests on a probability", whose cited paths change.
- `handbook/specs/development-workflow.md` step 14, the paragraph opening "An agent whose own DEFINITION this pull request changes": this pull request changes two (Rosters and doctrine).
- `vellum-footguns` Gate 1 (the strengthened test), Gate 7 (a test that reads the repo's own files), Gate 5 (the push and the body).
- `handbook/errata/guards.md` and `handbook/agents/roles/vellum-plate-reader.md`, `handbook/agents/roles/vellum-pr-skeptic.md`: only the lines listed under Files, whose cited paths change. No rule in them changes.

## The design

A pure move, by the method of pull requests 1 and 2 (`handbook/plans/1400/1454/1454-plan.md`, `handbook/plans/1400/1454/1454-pr2-plan.md`): the five folders move whole with `git mv` into a new `scripts/review/`, every relative path inside a moved file that leaves the five folders gains one `../`, every live reference to an old path is rewritten, the two agent definitions that run these tools by path are edited at their role bodies and regenerated, and the archived plans and rows read at their own sha keep the paths they were written with. The folder test pull request 2 added gains `review` and loses the five names, and the rulebook paragraph gains the clause naming `scripts/review/`. Nothing any tool does changes; no file the site build, the browser suite or CI runs imports any of the five (`git grep -n -E '(copy-hunt|comment-judge|comment-sweep|keeper-scan|still-judge)/' HEAD -- astro.config.ts scripts/build src e2e .github` printed nothing and exited 1 at 2b941ad3), so `dist/` cannot change and no build or browser suite is owed.

### Where each folder goes

| old path | new path | who runs it |
|---|---|---|
| `scripts/comment-judge/` (12 files) | `scripts/review/comment-judge/` | the weekly sitting (`npm run comment-judge`, the `comment-sweep` skill's step 2) |
| `scripts/comment-sweep/` (6 files) | `scripts/review/comment-sweep/` | the weekly sitting and the cold review of a sweep (`npm run comment-sweep -- verify`) |
| `scripts/copy-hunt/` (13 files) | `scripts/review/copy-hunt/` | `vellum-pr-skeptic` on every pull request, and the weekly sitting (`npm run copy-hunt`) |
| `scripts/keeper-scan/` (5 files) | `scripts/review/keeper-scan/` | the weekly sitting (`npm run keeper-scan`) |
| `scripts/still-judge/` (8 files) | `scripts/review/still-judge/` | `vellum-plate-reader`, where a change reaches how a world sheet is drawn (`npm run still-judge`) |

44 files move. Every move keeps its file names, and `git diff --find-renames` reads each as a rename at a similarity of 92 to 100 (measured, `R092` the lowest), so the comment judge, the keeper scan and the copy hunt, which read a range with `--find-renames` (`changedFiles` in `scripts/comment-judge/tree.ts`), read each moved file against its old self.

### What other code imports from the five, and why it stays where it is

Other kinds of script import modules from inside the five: `scripts/lint/word-for-word.ts` (the lint rule) imports `comment-judge/tree.ts` and three files of `copy-hunt/`; five files of `scripts/recon-triage/` (an agent tool) import `comment-judge/tree.ts` or `comment-judge/report.ts`; `eslint.config.ts` imports `copy-hunt/accepted-copies.ts`; two `test-support/` fixtures import from `copy-hunt/` and `comment-judge/`. Each of those import lines is re-aimed at `scripts/review/`, and every imported module stays inside its tool's folder, which moves whole. In the other direction, `comment-judge/tree.ts` keeps importing `readAt` from the proof runner (`scripts/ci/proof-runner/send.ts`), one level deeper.

### Alternatives rejected

- **`readAt` moved out of `scripts/ci/proof-runner/send.ts` into `scripts/shared/`**, since a review tool imports it (pull request 2's call 5 left this to here). A change to what two modules export, not a move; the proof runner and the comment judge each keep their folder whole, the rulebook's "a command of several files keeps them in a folder of its own". Calls made, item 1.
- **`comment-judge/tree.ts` and `comment-judge/report.ts` split out into `scripts/shared/`**, since the lint rule, the recon triage and every review tool import them. Pull request 2 rejected the same split for `feature-match.ts`, which five unit tests borrow from the region kit: a pure move keeps each command's folder whole. Calls made, item 2.
- **A forwarding file at each old path, or renamed npm scripts.** The folder test refuses a folder it does not name, and every npm script keeps its name; only the path each runs changes.
- **Rewording the cold reviewer's "the branch predates the command"** for a branch cut before this merges. Its fallback (a second sandbox at main's head) gives the same copy hunt; Calls made, item 5.
- **A new command for the plate reader's step 4**, so its inline `import` stops naming a folder. A new interface, not a move, and it would not help this merge: a tree cut before the merge holds neither the new folder nor a new command. The straddle is ruled (ruling Q2).
- **No change to the folder test, the move's red being only the imports that break.** A red on a missing module proves nothing (workflow step 8).
- **Rewriting the history.** The archived plans and the copy hunt's trial rows say what was true when they were written (Files, section 5).

## Files

Mechanics for every edit below: the Edit tool, one call per substitution per file, with `replace_all: true` where a file holds the same old text more than once; `.claude/agents/` and `.codex/agents/` are never edited by hand. Line numbers are at 2b941ad3.

### 1. The moves

`mkdir -p scripts/review`, then five commands, each its own: `git mv scripts/comment-judge scripts/review/comment-judge`, `git mv scripts/comment-sweep scripts/review/comment-sweep`, `git mv scripts/copy-hunt scripts/review/copy-hunt`, `git mv scripts/keeper-scan scripts/review/keeper-scan`, `git mv scripts/still-judge scripts/review/still-judge`. `git status` then shows the 44 files as renames.

### 2. Lines inside the moved files (37 lines in 29 files)

Every relative path that leaves the five folders gains one `../`. Line numbers are the old file's; paths are the new.

| file (new path) | lines | from | to |
|---|---|---|---|
| `scripts/review/comment-judge/collect.ts` | 1 | `"../lint/comment-notes.ts"` | `"../../lint/comment-notes.ts"` |
| `scripts/review/comment-judge/judge.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/comment-judge/main.ts` | 3 | `"../jev/cli.ts"` | `"../../jev/cli.ts"` |
| `scripts/review/comment-judge/main.ts` | 4 | `"../../test-support/lint-roots.ts"` | `"../../../test-support/lint-roots.ts"` |
| `scripts/review/comment-judge/parse.ts` | 6 | `resolve(import.meta.dirname, "..", "..")` | `resolve(import.meta.dirname, "..", "..", "..")` |
| `scripts/review/comment-judge/questions.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/comment-judge/report.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/comment-judge/tree.ts` | 2 | `"../ci/proof-runner/send.ts"` | `"../../ci/proof-runner/send.ts"` |
| `scripts/review/comment-sweep/page-tokens.ts` | 2 | `"../shared/is-record.ts"` | `"../../shared/is-record.ts"` |
| `scripts/review/comment-sweep/verify.ts` | 2 | `"../ci/docs-only.ts"` | `"../../ci/docs-only.ts"` |
| `scripts/review/copy-hunt/accepted-faults.ts` | 2 | `"../../test-support/lint-roots.ts"` | `"../../../test-support/lint-roots.ts"` |
| `scripts/review/copy-hunt/changed.ts` | 2 | `"../../test-support/lint-roots.ts"` | `"../../../test-support/lint-roots.ts"` |
| `scripts/review/copy-hunt/functions.ts` | 3 | `"../../test-support/ts-under-roots.ts"` | `"../../../test-support/ts-under-roots.ts"` |
| `scripts/review/copy-hunt/hunt.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/copy-hunt/main.ts` | 4 | `"../jev/cli.ts"` | `"../../jev/cli.ts"` |
| `scripts/review/copy-hunt/questions.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/copy-hunt/report.ts` | 2 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/copy-hunt/runs.ts` | 2 | `"../../test-support/lint-roots.ts"` | `"../../../test-support/lint-roots.ts"` |
| `scripts/review/keeper-scan/collect.ts` | 1 | `"../../test-support/lint-roots.ts"` | `"../../../test-support/lint-roots.ts"` |
| `scripts/review/keeper-scan/main.ts` | 3 | `"../jev/cli.ts"` | `"../../jev/cli.ts"` |
| `scripts/review/keeper-scan/questions.ts` | 3 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/keeper-scan/scan.ts` | 4 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/still-judge/compare.ts` | 1 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/still-judge/compare.ts` | 2 | `"../recon-triage/triage.ts"` | `"../../recon-triage/triage.ts"` |
| `scripts/review/still-judge/main.ts` | 3 | `"../design/shoot.ts"` | `"../../design/shoot.ts"` |
| `scripts/review/still-judge/main.ts` | 4 | `"../jev/cli.ts"` | `"../../jev/cli.ts"` |
| `scripts/review/still-judge/main.ts` | 5 | `"../recon-triage/triage.ts"` | `"../../recon-triage/triage.ts"` |
| `scripts/review/still-judge/png.ts` | 1 | `"../delivery/dims.ts"` | `"../../delivery/dims.ts"` |
| `scripts/review/still-judge/questions.ts` | 2 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/still-judge/report.ts` | 2 | `"../delivery/dims.ts"` | `"../../delivery/dims.ts"` |
| `scripts/review/still-judge/report.ts` | 3 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/still-judge/restage.ts` | 1 | `"../../src/cli/raster.ts"` | `"../../../src/cli/raster.ts"` |
| `scripts/review/still-judge/score.ts` | 2 | `"../jev/system-one.ts"` | `"../../jev/system-one.ts"` |
| `scripts/review/still-judge/trial-set.ts` | 2, 3, 4 | `"../../src/` | `"../../../src/` |
| `scripts/review/still-judge/trial-set.ts` | 5 | `"../design/shoot.ts"` | `"../../design/shoot.ts"` |

**`parse.ts` line 6 is the one line no check sees.** `ROOT` is the repo root that `parseTs` hands the linter as its `cwd`; left at two `..` it becomes `scripts/`, every file name still falls inside it, and nothing reds: measured with every other rewrite in and that line unchanged, `npm run check` and `npm run lint` exited 0 and the 42 test files `test/repo/{comment-judge,copy-hunt,keeper-scan,word-for-word,comment-sweep,recon-triage,still-judge}-*.test.ts` passed 226 of 226 (`out/1454-pr3-dry-run/review-tests-noroot.log`). Evidence 6 reads it by name.

**The imports among the five stay as they are**, since the five keep their places beside one another: `../comment-judge/` in `comment-sweep/main.ts` 9, `comment-sweep/verify.ts` 1, `copy-hunt/changed.ts` 1, `copy-hunt/functions.ts` 4 and 5, `copy-hunt/main.ts` 3, `copy-hunt/report.ts` 1, `copy-hunt/runs.ts` 1, `copy-hunt/trial.ts` 1, `keeper-scan/collect.ts` 2, 3 and 4, `keeper-scan/main.ts` 1 and 2, `keeper-scan/questions.ts` 1 and 2, `keeper-scan/report.ts` 1, `keeper-scan/scan.ts` 1, 2 and 3, `still-judge/report.ts` 1 and `still-judge/score.ts` 1; and every `./` import inside a folder. The other 15 moved files hold no relative path that leaves the five.

### 3. References elsewhere, edited by hand (120 lines in 55 files)

The old-path searches (Evidence 3) print these at 2b941ad3 and nothing once the change is in. The substitution is the plain one: `scripts/<tool>/` to `scripts/review/<tool>/` for each of the five, which also turns `./scripts/...`, `../scripts/...` and `../../scripts/...` into the right form; the two other shapes are named where they occur.

**Configuration (6 lines in 2 files)**:
- `package.json` 22 `comment-judge`: `node scripts/review/comment-judge/main.ts`; 23 `comment-sweep`: `node scripts/review/comment-sweep/main.ts`; 24 `copy-hunt`: `node scripts/review/copy-hunt/main.ts`; 26 `keeper-scan`: `node scripts/review/keeper-scan/main.ts`; 27 `still-judge`: `node scripts/review/still-judge/main.ts`. Every script keeps its name.
- `eslint.config.ts` 27: `import { ACCEPTED_COPIES } from "./scripts/review/copy-hunt/accepted-copies.ts";`. Nothing type-checks this file (`tsconfig.json` does not include it), so `npm run lint` is its check.

**Code under `scripts/` (10 lines in 6 files)**, a relative import from a sibling folder, `"../<tool>/` to `"../review/<tool>/`:
- `scripts/lint/word-for-word.ts` 5 (`../review/comment-judge/tree.ts`), 6 (`../review/copy-hunt/accepted-copies.ts`), 7 (`../review/copy-hunt/accepted.ts`), 8 (`../review/copy-hunt/functions.ts`); and 68, the rule's message, `scripts/copy-hunt/accepted-copies.ts` to `scripts/review/copy-hunt/accepted-copies.ts`, which `test/repo/word-for-word.test.ts` 21 pins (below), so the two change together.
- `scripts/recon-triage/excerpt.ts` 1, `scripts/recon-triage/main.ts` 4, `scripts/recon-triage/triage.ts` 1: `"../comment-judge/tree.ts"` to `"../review/comment-judge/tree.ts"`; `scripts/recon-triage/report.ts` 1, `scripts/recon-triage/trial.ts` 1: `"../comment-judge/report.ts"` to `"../review/comment-judge/report.ts"`.

**Test helpers (4 lines in 2 files)**: `test-support/copy-hunt-fixtures.ts` 1, 2, 3 and `test-support/keeper-scan-fixtures.ts` 1, `"../scripts/<tool>/` to `"../scripts/review/<tool>/`.

**Unit tests (84 lines in 39 files)**, the plain substitution unless said:
- `test/repo/comment-judge-candidates.test.ts` 3, 4, 5; `comment-judge-collect.test.ts` 3; `comment-judge-decide.test.ts` 3, 4; `comment-judge-judge.test.ts` 3 to 7; `comment-judge-questions.test.ts` 9, 10; `comment-judge-tree.test.ts` 6; `comment-judge-trial.test.ts` 3 to 6.
- `test/repo/comment-sweep-instructions.test.ts` 3, 4; `comment-sweep-main.test.ts` 5, 6, 7; `comment-sweep-pages.test.ts` 3; `comment-sweep-scripts.test.ts` 3; `comment-sweep-sheets.test.ts` 3; `comment-sweep-verify.test.ts` 3, 4, 5.
- `test/repo/copy-hunt-accepted.test.ts` 3, 4, 5; `copy-hunt-changed.test.ts` 3, 4; `copy-hunt-functions.test.ts` 3, 4; `copy-hunt-hunt.test.ts` 3, 4, 5; `copy-hunt-main.test.ts` 8 (`resolve(import.meta.dirname, "..", "..", "scripts", "copy-hunt", "main.ts")` to `resolve(import.meta.dirname, "..", "..", "scripts", "review", "copy-hunt", "main.ts")`, the entry the test spawns); `copy-hunt-pairs.test.ts` 3, 4; `copy-hunt-questions.test.ts` 3; `copy-hunt-report.test.ts` 3 to 7; `copy-hunt-runs.test.ts` 3, 4, 5; `copy-hunt-trial.test.ts` 3 to 6.
- `test/repo/jev-system-one.test.ts` 3.
- `test/repo/keeper-scan-collect.test.ts` 3; `keeper-scan-questions.test.ts` 5; `keeper-scan-report.test.ts` 3, 5, 6, 7, 8; `keeper-scan-scan.test.ts` 3.
- `test/repo/recon-triage-excerpt.test.ts` 3; `recon-triage-report.test.ts` 3; `recon-triage-triage.test.ts` 3.
- `test/repo/still-judge-compare.test.ts` 4 to 7; `still-judge-main.test.ts` 7, and 11 (`"scripts", "still-judge", "main.ts"` to `"scripts", "review", "still-judge", "main.ts"`, the entry the test spawns); `still-judge-png.test.ts` 4; `still-judge-questions.test.ts` 5; `still-judge-restage.test.ts` 3; `still-judge-score.test.ts` 4, 5, 6; `still-judge-trial-set.test.ts` 3, 4.
- `test/repo/word-for-word.test.ts` 9, 10, and 21, the `TAIL` the rule's message ends with, to `": fold them into one function, or list each pair in scripts/review/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)"`.
- `npm run format` then rewraps the imports it finds too long: measured, `test/repo/copy-hunt-report.test.ts`, `test/repo/keeper-scan-collect.test.ts`, `test/repo/still-judge-compare.test.ts`, `test/repo/still-judge-questions.test.ts` and `test/repo/still-judge-restage.test.ts` (`out/1454-pr3-dry-run/format.log`), after which `npm run format:check` passed (`format-2.log`).

**Prose (16 lines in 6 files)**, the plain substitution:
- `handbook/specs/check-placement.md` 219, 223, 226, 227, 235, 240, 261.
- `handbook/specs/conventions.md` 276, 293, 313, 322.
- `handbook/specs/development-workflow.md` 468.
- `handbook/errata/guards.md` 218: an open row a builder follows by path.
- `handbook/agents/roles/vellum-plate-reader.md` 45 (`scripts/still-judge/main.ts`) and 50, which names the folder twice: `scripts/still-judge/trial-set.ts`, and the import in step 4's command, `from "./scripts/still-judge/restage.ts"` to `from "./scripts/review/still-judge/restage.ts"`.
- `handbook/agents/roles/vellum-pr-skeptic.md` 90, which names it twice: `ls /the/path/create/printed/scripts/copy-hunt/main.ts` to `ls /the/path/create/printed/scripts/review/copy-hunt/main.ts`, and "A pull request that edits `scripts/copy-hunt/`" to "A pull request that edits `scripts/review/copy-hunt/`".

### 4. Written by `npm run agents:generate` (6 lines in 4 files)

After the two role bodies change, `npm run agents:generate` writes `.claude/agents/vellum-plate-reader.md` (54, 59), `.claude/agents/vellum-pr-skeptic.md` (99), `.codex/agents/vellum-plate-reader.toml` (50, 55) and `.codex/agents/vellum-pr-skeptic.toml` (95), and prints `agents:generate: 4 file(s) written`; `npm run agents:check` then prints `agents:check: every generated agent definition is current` (measured, `out/1454-pr3-dry-run/agents-generate.log`, `agents-check.log`). `test/repo/agent-definitions.test.ts` holds the two in step.

### 5. Left as written

- `handbook/plans/`: the archived plans keep the old paths, as the issue rules.
- `scripts/review/copy-hunt/trial-set.ts` 127 and 134, the `file:` of two trial rows naming `scripts/comment-judge/candidates.ts` and `scripts/comment-judge/questions.ts`: each row is read at its own `sha` (`SCAN`), through `gitTree(repo, sha)` in `trial` of `scripts/review/copy-hunt/main.ts`, where those paths are the ones that exist.
- Names that are not these paths: the npm script names; the `comment-sweep/<date>` tags; the `comment-sweep` skill and its `.agents/skills/comment-sweep` link (which name the commands, never a path); `still-judge/` in a delivery folder's layout (`test/repo/delivery-walk.test.ts`); the `tmpdir()` prefixes `comment-judge-tree-` and `still-judge-`; the command names `runCommand` counts by (`test/repo/jev-cli.test.ts`, `test/repo/jev-usage.test.ts`); the report lines that open with a command's name; the folder names in `test/site/folder-layout.test.ts` (Tests, below).
- The accepted copies (`scripts/review/copy-hunt/accepted-copies.ts`) are keyed by file, and no key names a file under the five (at 2b941ad3, `grep -n 'file:' scripts/copy-hunt/accepted-copies.ts` lists none of them), so no key or hash changes.
- Everything under `scripts/agent-infra/hooks/` and `.codex/hooks.json`: no route names the five, and `BROWSER_SCRIPT` and Gate 2's route match a script at any depth under `scripts/`.

## Rosters and doctrine

**`handbook/specs/rulebook.md`, What `src/` holds, and what runs around it.** The paragraph at line 391, which now reads:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a small module that scripts of several kinds import goes in `scripts/shared/`; what the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`; a script a session runs by hand to measure a world goes in `scripts/measure/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own inside the folder of who runs it. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this: no file stands there but the ones its `NOT_YET_PLACED` names, and no folder but the ones its `SCRIPT_FOLDERS` and `FOLDERS_NOT_YET_PLACED` name.

becomes exactly, one line as before:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a small module that scripts of several kinds import goes in `scripts/shared/`; a command that reads a change and reports on it to a review, the cold review of a pull request, a plate reading or the weekly sitting, goes in `scripts/review/`; whatever else the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`; a script a session runs by hand to measure a world goes in `scripts/measure/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own inside the folder of who runs it. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this: no file stands there but the ones its `NOT_YET_PLACED` names, and no folder but the ones its `SCRIPT_FOLDERS` and `FOLDERS_NOT_YET_PLACED` name.

The new clause sits before the agent-infra clause, which gains "whatever else" (ruling Q1), because the agent-infra clause alone already reads as taking these five (the cold reviewer and the plate reader run them). The boundary holds for the last pull request's moves: `handoff/` starts a build, `issue-reader/` reads a thread, `recon-triage/` orders an issue's claims and `delivery/` gives a folder its page, none of them reading a change, so each falls under "whatever else"; `jev/`, the client every review tool and the recon triage import, is that pull request's to place.

**The agent definitions.** `handbook/agents/roles/vellum-plate-reader.md` and `handbook/agents/roles/vellum-pr-skeptic.md` change (Files, section 3) and are regenerated (section 4). So workflow step 14's paragraph applies: the PR body says which version of each definition wrote the change and which reviewed it. The builder's own definition does not change; the cold reviewer's does, by one path, and its run on this pull request is read with that in mind (Evidence 13).

No roster changes: no moved file is a page, a suite, a sheet or a bundle entry; no test file is added or renamed, so `UNIT_SECONDS` in `scripts/ci/unit-shards.ts` keeps its keys; `SOURCE_READS` in `test-support/source-read-list.ts` names none of the moved files; no model policy changes; `scripts/agent-infra/hooks/` and `.codex/hooks.json` do not change. `CLAUDE.md` names these tools only as `npm run` commands and the `comment-sweep/*` tag, and the `comment-sweep` skill only as `npm run` commands, so neither changes.

## Tests, in the order they are written

**T3, the folder test's lists.** In `test/site/folder-layout.test.ts`, lines 59 to 71 (the two lists pull request 2 added) become exactly, as `npm run format` lays them out:

```ts
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
const FOLDERS_NOT_YET_PLACED: readonly string[] = ["delivery", "handoff", "issue-reader", "jev", "recon-triage"];
```

The test itself, its name and its two assertions, are unchanged.

- Red first, at the first commit, before any move: measured at 2b941ad3, red on the `deepEqual` with `actual: [ 'comment-judge', 'comment-sweep', 'copy-hunt', 'keeper-scan', 'still-judge' ]`, 4 of the file's 5 tests passing (`out/1454-pr3-dry-run/t3-red-formatted.log`). No stub is needed: the test reads the tree, and the tree is the wrong state.
- Green after the moves: measured (`out/1454-pr3-dry-run/unit.log`, and `t3-green.log`).
- The mutations that red it once green, each measured on the moved tree: (a) an untracked `scripts/copy-hunt/x.ts` holding `export {};`, a tool left at the top beside its moved copy (`listWorkingTree` lists untracked files): red on the `deepEqual`, `actual: [ 'copy-hunt' ]` (`t3-mut-d.log`); (b) `"copy-hunt"` put back in `FOLDERS_NOT_YET_PLACED`: the `deepEqual` passes and the `assert.ok` reds with its message, "git listed the tree, and every folder the two lists name still stands at the top of scripts/" (`t3-mut-b.log`), which keeps the list from outliving the folders this pull request moves; (c) `"review"` taken out of `SCRIPT_FOLDERS`: red on the `deepEqual`, `actual: [ 'review' ]` (`t3-mut-c.log`). Pull request 2's own mutation, an untracked `scripts/stray-1454/x.ts`, still reds it, `actual: [ 'stray-1454' ]` (`t3-mut-a.log`).
- The prover owes it, a guard whose lists this pull request tightens (workflow step 11).

**Every other test** changes only the path it imports, spawns or names, and is not a new or strengthened guard. Their red is the move itself: after the `git mv` and before the references are rewritten, `npm run check` fails on each import, which is the expected state between those two steps and is not committed. `test/repo/word-for-word.test.ts` line 21 and `scripts/lint/word-for-word.ts` line 68 change together, and that test holds the message.

No browser check is added or made longer, so no ledger line and no readings are owed, and no browser suite loads a moved file.

## Order of commits

1. `#1454 The plan for pull request 3, and the folder check that reds until the review tools move`: `handbook/plans/1400/1454/1454-pr3-plan.md` (this file, unchanged, beside `1454-plan.md` and `1454-pr2-plan.md`, never over either) and T3's lists, with `npm run format` run before the commit so `npm run format:check` passes on it. Push it (workflow step 9); CI reds on T3, as intended, and on nothing else.
2. `#1454 The review tools move into a new scripts/review/`: the `mkdir` and the five `git mv`, Files sections 2 and 3 complete, `npm run agents:generate`, the rulebook paragraph, with `npm run format` run before the commit so `npm run format:check` passes on it. Green.

## Evidence

Run each command alone, and only while no other lane runs a suite, a build or a browser (`ps -Ao pid,etime,command | grep -E 'node|chrom' | grep -v grep` shows none of theirs); say in the report when you waited. Keep every bare `node --test` bounded (`NODE_OPTIONS=--max-old-space-size=2048`, `--test-timeout=600000`).

1. `npm run check`, `npm run lint`, `npm run format:check`, `npm run agents:check`.
2. `NODE_OPTIONS=--max-old-space-size=2048 npm test`, then `npm run astro:generate` (the suite deletes `generated/`).
3. The old-path searches, each of which must print nothing and exit 1:

   ```
   git grep -n -i -E 'scripts/\(?(copy-hunt|comment-judge|comment-sweep|keeper-scan|still-judge)|scripts\\/\(?(copy-hunt|comment-judge|comment-sweep|keeper-scan|still-judge)|"scripts", "(copy-hunt|comment-judge|comment-sweep|keeper-scan|still-judge)"' -- . ':!handbook/plans' ':!scripts/review/copy-hunt/trial-set.ts'
   ```

   ```
   git grep -n -E '"\.\./(copy-hunt|comment-judge|comment-sweep|keeper-scan|still-judge)/' -- . ':!handbook/plans' ':!scripts/review'
   ```

   At 2b941ad3, each run against that commit (`git grep -n -E '...' HEAD -- ...`), the first printed 119 lines and the second 31: the 126 of Files sections 3 and 4, and 24 inside the five that stay (the 22 imports among the five of section 2 and the two trial rows of section 5). The second search leaves out `scripts/review/`, where the imports among the five stand unchanged, and the first leaves out the trial rows at their new path.
4. The new-path check: `git grep -h -o -E 'scripts/review/(comment-judge|comment-sweep|copy-hunt|keeper-scan|still-judge)/[a-z-]+\.ts' -- . ':!handbook/plans'` piped to `sort -u`, then one `ls` naming every path it printed; `ls` lists each and reports no missing file.
5. `git diff --find-renames --name-status origin/main` lists the 44 moves as `R` rows (`R092` the lowest score in the dry run); `git diff --stat origin/main -- .codex/hooks.json scripts/agent-infra/ .claude/skills/ CLAUDE.md` prints nothing.
6. `git grep -n 'import.meta.dirname' -- scripts/review` prints exactly one line, `scripts/review/comment-judge/parse.ts:6:const ROOT = resolve(import.meta.dirname, "..", "..", "..");`.
7. Each moved entry loads: `npm run --silent comment-judge`, `npm run --silent comment-sweep`, `npm run --silent copy-hunt`, `npm run --silent keeper-scan` and `npm run --silent still-judge`, each alone and with no argument, print their usage line (`usage: npm run <command> -- ...`) and exit 2 (measured, `out/1454-pr3-dry-run/usage-*.log`). None sends anything.
8. The plate reader's step 4 import, from the tree's root: `node --input-type=module -e 'import { carriesEverySubject, cropClip } from "./scripts/review/still-judge/restage.ts"; console.log(typeof carriesEverySubject, typeof cropClip);'` prints `function function` and exits 0 (measured, `restage-new.log`).
9. The moved readers over this pull request's own range, after commit 2, each alone, none sending anything: `npm run --silent copy-hunt -- diff origin/main HEAD --dry-run`, `npm run --silent comment-judge -- diff origin/main HEAD --dry-run` and `npm run --silent keeper-scan -- diff origin/main HEAD --dry-run`. Each exits 0 and prints its report; quote each report's first line in the PR body. The copy hunt reads `0 of <n> functions added or changed`, the comment judge 0 comments and the keeper scan 0 deleted comments: measured on the staged dry run through the three tools' own functions (`changedFunctions`, `functionsIn`, `addedRuns`), whose probe read 92 changed TypeScript files and printed `functions hunted 0; comments added 0; comments deleted 0` (`out/1454-pr3-dry-run/1454-pr3-reads.ts`, `reads.log`), and read a planted function and comment as `functions hunted 1; comments added 1` (`reads-witness.log`). These are also what the next weekly sweep's range gains from this pull request.
10. `vellum-plate-reader` is not owed: nothing under `src/` changes, so step 1 of its "Two versions of one sheet" prints no change, and the deliverable is not an appearance.
11. No build and no browser suite is owed: nothing the build, the browser suite or CI runs imports a moved file (The design). Say so in the body with that command.
12. The PR body carries workflow step 14's line on the two agent definitions: the builder's definition (`vellum-implementer`) is unchanged; `vellum-pr-skeptic`'s changes by one path in this pull request, so the reviewing run's definition is whichever version the dispatching session loaded, which the body names as UNVERIFIABLE.
13. The cold skeptic as workflow step 14 says. Under main's definition its copy-hunt step's `ls <sandbox>/scripts/copy-hunt/main.ts` finds no file in a sandbox at this branch's head, so it builds a second sandbox at main's head and hunts this pull request's two shas with main's copy of the hunt; under this branch's definition `ls <sandbox>/scripts/review/copy-hunt/main.ts` finds the file and it hunts with the branch's copy. Either is the step working, not a defect, and the dispatcher reads it so.

Measurements behind this plan, all in the planner's tree at 2b941ad3, the dry run uncommitted and discarded with `git reset --hard HEAD` after, its folder `out/1454-pr3-dry-run/` (`sha.txt` holds the sha):
- T3 red before the moves (`t3-red-formatted.log`).
- The moves and the rewrites (`node out/1454-pr3-dry-run/1454-pr3-rewrite.ts inside`, then `outside`, then `root`, counts in `rewrite-inside.log`, `rewrite-outside.log`, `rewrite-root.log`), then `npm run agents:generate` and `npm run agents:check`.
- With every rewrite in but `parse.ts` line 6: `npm run check` (`check-noroot.log`) and `npm run lint` (`lint-noroot.log`) exited 0, and the review tools' 42 test files passed 226 of 226 (`review-tests-noroot.log`).
- `npm run format:check` red on the five files named in Files section 3 (`format.log`) and passed once `prettier --write` rewrapped them (`format-2.log`).
- The two old-path searches of Evidence 3 printed nothing and exited 1; `git diff --cached --find-renames --name-status HEAD` gave 44 `R` rows from `R092` to `R100` and 60 `M` rows (`name-status.txt`).
- `npm run check`, `npm run lint`, `npm run format:check` and `npm run agents:check` exited 0 on the finished dry run (`check.log`, `lint.log`, `format-3.log`); `npm test` passed 4,277 of 4,277 in 187 s (`unit.log`), `test/site/folder-layout.test.ts`, `test/repo/agent-definitions.test.ts`, `test/repo/prose-paths.test.ts`, `test/repo/test-collection.test.ts` and the review tools' 42 test files among them; T3 alone passed 5 of 5 (`t3-green.log`).
- Evidence 4 listed 42 paths, all present (`new-paths.txt`); Evidence 5's untouched-files check printed nothing; Evidence 6 printed its one line.
- The moved readers over pull request 2's own range, a pure move, each with `--dry-run` from the moved folders: `npm run --silent copy-hunt -- diff 3374eb47 2b941ad3 --dry-run` read `0 of 8749 functions added or changed since 3374eb47...` (`copy-hunt-pr2-range.log`); `npm run --silent comment-judge -- diff 3374eb47 2b941ad3 --dry-run` read `4 comments` and `npm run --silent keeper-scan -- diff 3374eb47 2b941ad3 --dry-run` read `4 deleted comments` (`comment-judge-pr2-range.log`, `keeper-scan-pr2-range.log`), the four comments whose text that pull request rewrote (`e2e/support/suites.ts` 163 and three region-kit citations in tests), and none of its 28 renamed files.
- Each moved entry's usage line (`usage-*.log`); the step 4 import at the new path printed `function function` (`restage-new.log`) and at the old path threw `ERR_MODULE_NOT_FOUND` (`restage-old.log`); `git cat-file -e 2b941ad3:scripts/review/still-judge/restage.ts` failed, so the new path does not exist in a tree cut before the merge.
- What the three readers read over the staged move, through their own functions (`node out/1454-pr3-dry-run/1454-pr3-reads.ts`): 92 changed TypeScript files, 0 functions hunted, 0 comments added, 0 deleted (`reads.log`); with a planted function and comment, 1 and 1 (`reads-witness.log`).
- Not applied in the dry run: the rulebook paragraph of Rosters and doctrine, the one commit 2 edit the rewrite script did not make, so the suite's pass does not cover it. The only test that reads that file is `test/repo/prose-paths.test.ts`, which extracts a backticked path only where it ends in a file extension, and the new clause adds `scripts/review/` alone, a folder; Evidence 2 is its check.

## Calls made

Each is mine, taken on the rule named; Alex saw them with the menu and overruled none. The step 12 comment copies them and points at the rulings comment for Q1 and Q2 rather than restating them.

1. **`readAt` stays in `scripts/ci/proof-runner/send.ts`**, and `scripts/review/comment-judge/tree.ts` imports it from `../../ci/proof-runner/send.ts`. Rule: a pure move, the issue's acceptance (no behavior change); the rulebook's "a command of several files keeps them in a folder of its own"; pull request 2's call 5 left it to this pull request, and moving it is a change to two modules' exports.
2. **`comment-judge/tree.ts`, `comment-judge/report.ts` and the copy hunt's `accepted-copies.ts`, `accepted.ts` and `functions.ts` stay inside their tools' folders**, though the lint rule, the recon triage and `eslint.config.ts` import them. Rule: a pure move keeps each command's folder whole, pull request 2's precedent for `feature-match.ts`.
3. **`parse.ts` line 6 gains a third `..`**, though no check sees it (measured). Rule: a pure move keeps every value what it was, and `ROOT` names the repo root.
4. **The two agent definitions are edited at their role bodies under `handbook/agents/roles/` and regenerated**, never by hand. Rule: `handbook/specs/conventions.md`, Where a rule lives (the generated definitions are written by `npm run agents:generate`), and `test/repo/agent-definitions.test.ts`.
5. **The cold reviewer's line takes the plain substitution**, `scripts/review/copy-hunt/main.ts`, and its "the branch predates the command" stays: a branch cut before this merge holds the hunt at the old path, so the reviewer builds its second sandbox at main's head and runs the same hunt over the same two shas, which is that line's own fallback. Rule: a pure move; the line's outcome is unchanged.
6. **Strings that only stand for a path are rewritten too**: the lint rule's message and the `TAIL` its test pins, and the two `MAIN` entries the unit tests spawn. Rule: pull request 1's call 6.
7. **What stays as written** is Files, section 5, the copy hunt's trial rows among it. Rule: the issue keeps `handbook/plans/` as written; a row read at its own sha is history (pull request 2's call 7).
8. **`handbook/errata/guards.md` line 218 is rewritten.** It is open work a builder follows by path. Rule: pull request 1's call 5.
9. **No build and no browser suite is run**, since nothing they run imports a moved file (the command under The design); the five usage lines, the step 4 import and the three dry runs of Evidence 7 to 9 stand in for them. Rule: workflow step 10, the local run is the targeted one.
10. **T3's lists are this pull request's failing test, and the prover proves them.** Rule: workflow step 8, the failing test first; step 11, a strengthened guard.
11. **The rulebook clause draws the line at "a command that reads a change and reports on it to a review"**, written so the last pull request's tools fall under the agent-infra clause. Rule: doctrine moves with the code (workflow step 8); one home (`handbook/specs/conventions.md`, Where a rule lives).
12. **When it lands beside the weekly comment sweep**: before the sitting starts (the next is due on or after 2026-11-27, the newest tag being `comment-sweep/2026-11-20`), or once the sitting has ended, its tag pushed and its pull request, where it opens one, merged; never while a sweep branch is open, since a sweep may cut comments in these five folders. The tools themselves are indifferent to the order: the sitting runs each by its npm name, and each reads its range rename-aware, so this pull request adds nothing to what the sweep reads (measured over this move, staged: 0 functions hunted, 0 comments added or deleted; and over pull request 2's pure move from the moved copies: the copy hunt read 0 of 8,749 functions as added or changed, and the comment judge and the keeper scan only the 4 comments that pull request rewrote; Measurements under Evidence). Rule: the issue's "each landed while no open branch touches those files".
13. **Branch `chore/1454-pr3-scripts-review`.** The earlier pull requests' branch names are not reused.
14. **`scripts/lint/word-for-word.ts` stays in `scripts/lint/`**, though it imports the copy hunt's reader (the recon asked whether it is a review tool). It is the lint rule `vellum/no-word-for-word-copy`, which `npm run lint` runs. Rule: the rulebook paragraph puts the house's lint rules in `scripts/lint/`.
15. **Issue #1369 is not folded in.** The recon read its five pairs (`npm run --silent issue -- 1369`, 0 comments, open): none touches a file under the five folders; it names `scripts/copy-hunt/accepted-copies.ts` only as the list a ruling of its might add to, which whichever pull request lands second edits at the path it then has. Rule: pull request 1's call 2, a pure move folds in no behavior change.

## Open decisions

none. The two questions the step 6 menu put to Alex are ruled (Rulings, above), and this plan is built to them.

What ruling Q2 rested on, kept for the next reader: where a dispatched agent's definition is read from, and when, is UNVERIFIABLE (workflow step 14), so a reviewer's definition and the tree it works in can fall on opposite sides of this merge in either direction. The cold reviewer then builds one extra sandbox at main's head and runs the same copy hunt there; the plate reader's chart comparison stops at its step 4 import with `ERR_MODULE_NOT_FOUND` (measured, `restage-old.log`; the new path does not exist at 2b941ad3 either), and is owed only where a change reaches how a world sheet is drawn, which the one live lane, PR #1467, does not (The parallel lanes). The ruling's relay says a session "keeps the definitions it loaded"; the outcome it rules holds whichever way the definitions load.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 2b941ad3 origin/main -- scripts/ test/ test-support/ package.json eslint.config.ts handbook/agents/` shows a change to any file this plan names under those roots, or the old-path searches (Evidence 3), run before the first edit, print a line in a code or test file that Files section 3 does not list. A named spec or errata file that moved is built on as it stands.
- `npm run check`, `npm run lint` or `npm test` reds on an import, a path or a test this plan does not name, or `npm run format:check` reds after `npm run format` has run.
- T3 at commit 1 reds on any folder but the five, or is green.
- `npm run agents:generate` writes any file but the four of Files section 4, or `npm run agents:check` fails after it.
- `git diff --stat origin/main -- .codex/hooks.json scripts/agent-infra/ .claude/skills/ CLAUDE.md` prints anything.
- Evidence 6 prints anything but its one line, any usage run of Evidence 7 prints anything but its usage line or exits other than 2, Evidence 8 prints anything but `function function`, or a run of Evidence 9 throws, exits other than 0, or reads any function as added or changed or any comment as added or deleted.
- The Issue #1302 lane's branch (`fix/1302-see-lines-on-screen`, PR #1467) has come to edit a file this plan moves or edits, or a branch of the weekly sweep is open with a change under the five folders; report it to the dispatcher before merging main into this branch.

## The parallel lanes

- **The Issue #1302 lane**, PR #1467, branch `fix/1302-see-lines-on-screen`, read at 72848c07 and again at its head 0da3b5c7 with `git diff --name-only origin/main...FETCH_HEAD`, the same files both times: it edits `e2e/support/primer-judge.ts`, `e2e/support/primer-reads.ts`, `e2e/support/primer-walk.ts`, `src/site/shared/primer/explorer-sheet.ts`, `src/site/shared/primer/judge.ts`, `test/e2e/primer-judge.test.ts` and its plan. This pull request touches none of them, and none of them imports a moved file. Its change reaches nothing under the plate reader's `<paths>` (`git diff --stat origin/main...FETCH_HEAD -- src ':!src/atlas' ':!src/itinerary' ':!src/layouts' ':!src/pages' ':!src/prospect' ':!src/site' ':!src/static' ':!src/styles'` printed nothing), so it owes no still-judge reading across this merge.
- **PR #1467 is the one open pull request** (`gh pr list --state open --json number,headRefName,title`, read when this plan was finished).
- **Either order merges safely** with the #1302 lane. Whichever lands second runs `git merge origin/main`, the old-path searches, `npm run check`, `npm run lint` and `npm test` before it is merged.

## Later pull requests, for their planners

- The agent tools' move: every review tool imports `../../jev/` (`comment-judge/` judge, main, questions, report; `copy-hunt/` hunt, main, questions, report; `keeper-scan/` main, questions, scan; `still-judge/` compare, main, questions, report, score), `still-judge/compare.ts` and `still-judge/main.ts` import `../../recon-triage/triage.ts`, and `still-judge/png.ts` and `still-judge/report.ts` import `../../delivery/dims.ts`; each is re-aimed when `jev/`, `recon-triage/` and `delivery/` move. The five `scripts/recon-triage/` files that import `../review/comment-judge/` gain one `../` when it moves.
- `jev/` is imported by the review tools and by the recon triage, so the rulebook's `scripts/shared/` clause bears on where it goes as much as the agent-infra clause does.
- The cold reviewer's copy-hunt line names `scripts/review/copy-hunt/main.ts` beside `node scripts/agent-sandbox.ts`, which that pull request moves.
- That pull request empties `FOLDERS_NOT_YET_PLACED` and `NOT_YET_PLACED`.
