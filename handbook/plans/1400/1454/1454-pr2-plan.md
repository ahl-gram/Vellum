# Issue #1454, pull request 2: `outlines/` and `primer-pictures/` go into `scripts/build/`, `proof-runner/` into `scripts/ci/`, and `region-detail/` into a new `scripts/measure/`

**Planned at**: `origin/main` 86a1a8fc61a3c6dd507921b4c10a9117f43362ab; Issue #1454 read through `npm run --silent issue -- 1454` with 4 comments shown and 0 withheld. The planner was dispatched at 637ae703; PR #1460 (Issue #1456) merged as 86a1a8fc while this was planned, changing none of the files this plan moves and shifting doc lines this plan names, which are given here at 86a1a8fc.

**Rulings**: Alex's ruling on the one question of the step 6 menu, posted at https://github.com/ahl-gram/Vellum/issues/1454#issuecomment-7148735386 (2026-11-24):

- **R1, `scripts/region-detail/`: "Move it to `scripts/measure/`, in this pull request".** A new `scripts/measure/` holds scripts a session runs by hand to measure a world; `region-detail/` moves into it in this pull request, and the rulebook gains the sentence naming `scripts/measure/`.

**Branch**: `chore/1454-pr2-scripts-folders` (`git ls-remote origin refs/heads/chore/1454-pr2-scripts-folders` printed nothing at 86a1a8fc). This pull request leaves Issue #1454 open: later pull requests move the review tools, the agent tools and `scripts/agent-sandbox.ts`, so the body uses the template's form for a pull request that has an issue and deliberately leaves it open (`vellum-footguns` Gate 5 item 5).

## Specs

Read these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/rulebook.md`, "What `src/` holds, and what runs around it": the paragraph opening "**Inside `scripts/`, a file sits in the folder of who runs it**", which pull request 1 added and this one extends (Rosters and doctrine, below).
- `handbook/specs/conventions.md`, "Where a rule lives", "How a spec, and the rest of the house's prose, is written" (a backticked path is scanned; no roster in a spec) and "How code is cited".
- `handbook/specs/check-placement.md`, "The unit suite": what a unit test may read (a `git ls-files` listing is data).
- `handbook/specs/development-workflow.md` step 11, the paragraphs on the CI proof runner: Evidence 10 sends one row through it.
- `handbook/specs/settle-doctrine.md`, the environment section, before the one e2e run (Evidence 9).
- `vellum-footguns` Gate 1 (the new test), Gate 7 (a test that reads the repo's own files), Gate 2 (the e2e run), Gate 5 (the push and the body).
- `handbook/specs/site-architecture.md`, `handbook/specs/settle-doctrine.md`, `handbook/specs/engine-invariants.md`, `handbook/errata/guards.md`, `handbook/errata/prose.md`, `design/kit/README.md` and `.claude/skills/vellum-footguns/hooks/README.md`: only the lines listed under Files, whose cited paths change. No rule in them changes, and no script that measures a world changes what it measures.

## The design

A pure move, by the method of pull request 1 (`handbook/plans/1400/1454/1454-plan.md`): each of the four folders moves whole with `git mv`, every relative path inside a moved file that leaves its folder is re-aimed, every live reference to an old path is rewritten, the archived plans and the records of past runs keep the paths they were written with, and the built `dist/` stays byte for byte the same. One new test holds the folders at the top of `scripts/` the way pull request 1's test holds the files there, and the rulebook paragraph gains the `scripts/measure/` clause and a last sentence that says what the test holds.

### Where each folder goes

| old path | new path | who runs it |
|---|---|---|
| `scripts/outlines/` (7 files) | `scripts/build/outlines/` | `npm run outlines`, which rewrites the committed outline tables under `src/terrain/` and `src/world/` and the kit's README |
| `scripts/primer-pictures/` (5 files) | `scripts/build/primer-pictures/` | `npm run astro:generate`, its last step |
| `scripts/proof-runner/` (7 files) | `scripts/ci/proof-runner/` | `.github/workflows/proof-runner.yml`, and `npm run proof`, which sends a list to it and reads its ledger back |
| `scripts/region-detail/` (9 files) | `scripts/measure/region-detail/` | a session, by hand (`node scripts/measure/region-detail/sweep.ts` and its siblings, each writing under the session's own `out/`); five unit tests import its matcher, `feature-match.ts` (ruling R1) |

28 files move. Every move keeps its file names, so `git log --follow` and `git diff --find-renames` read each as a rename.

### Why the proof runner moves safely while lanes use it

`npm run proof -- send` builds its `proof/` branch on the runner ref, `main` unless `--runner` names another (`sendList(gh, list, option(args, "--runner") ?? "main", label)` in `scripts/proof-runner/main.ts`), and the workflow file and the runner code it starts are both read from that branch. So a run always reads the workflow and the runner from one commit, before the merge or after it. The tree under test is only checked out: `job.ts` runs `node --test`, the tree's own `eslint`, `npm run build` and `node e2e/run.ts` in it, and no path under `scripts/` (`grep -n -E 'scripts|e2e/|npm|"node"|tree,|cwd' scripts/proof-runner/job.ts`). A lane whose tree predates the merge runs its own `package.json`'s `node scripts/proof-runner/main.ts`, which its own tree still holds. No agent definition, skill or spec runs the runner by its file path: they say `npm run proof` (`git grep -n -E 'npm run proof|run proof' -- . ':!handbook/plans'`), and the headless build's refusal matches the path by its ending (`(raw[i] ?? "").toLowerCase().endsWith("proof-runner/main.ts")` in `scripts/agent-infra/hooks/headless-build.ts`), which `scripts/ci/proof-runner/main.ts` still ends with. So nothing under `scripts/agent-infra/hooks/` changes and `.codex/hooks.json` is not touched.

### Alternatives rejected

- **`scripts/test/proof-runner/`, as the issue's table proposed.** Ruled out by Alex's ruling Q1 on pull request 1 (comment 7144737283): `test/repo/test-collection.test.ts` refuses a folder named `test` outside `test/`.
- **The proof runner in `scripts/shared/` or `scripts/agent-infra/`.** A CI workflow runs it, and the rulebook paragraph puts "the steps CI runs" in `scripts/ci/`; the dispatcher's brief names `scripts/ci/`.
- **`scripts/region-detail/` left at the top for good, or moved in a later pull request.** The menu's options 3 and 2, which Alex did not take (ruling R1).
- **`feature-match.ts` split out into `test-support/`**, since five unit tests import it. `sweep-measure.ts` and `depth.ts` import it too, so it is the kit's own matcher that the tests borrow; a pure move keeps the kit whole.
- **`readAt` moved out of `scripts/proof-runner/send.ts` into `scripts/shared/`**, since `scripts/comment-judge/tree.ts`, a review tool, imports it. A change to what a module exports, not a move; the later pull request that moves `comment-judge/` into `scripts/review/` may weigh it.
- **Rewriting the headless build's suffix match to the new full path.** The suffix already matches both, and the hook folder is left untouched so Alex's trust of the Codex hook is not even in question.
- **A forwarding file at each old path, or renamed npm scripts.** `npm run outlines` and `npm run proof` keep their names; only the path each runs changes.
- **No new test, the move's red being only the imports that break.** A red on a missing module proves nothing (workflow step 8); the folder test below is the red this pull request is written against.
- **Rewriting the history.** The archived plans, the flake record's rows, a trial set's rows and the Issue #950 design round say what was true when they were written (Files, section 4).

## Files

Mechanics for every edit below: the Edit tool, one call per substitution per file, with `replace_all: true` where a file holds the same old text more than once. Line numbers are at 86a1a8fc.

### 1. The moves

`mkdir -p scripts/measure`, then four commands, each its own: `git mv scripts/outlines scripts/build/outlines`, `git mv scripts/primer-pictures scripts/build/primer-pictures`, `git mv scripts/proof-runner scripts/ci/proof-runner`, `git mv scripts/region-detail scripts/measure/region-detail`. `git status` then shows the 28 files as renames.

### 2. Lines inside the moved files (87 lines in 20 files)

Every relative path that leaves the moved folder gains one `../`, and a path into `scripts/build/` from inside it loses its `build/`. The imports between files of one moved folder (`./plane.ts`, `./ids.ts`, `./browser.ts`, `./list.ts`, `./feature-match.ts`, `./sweep-measure.ts`, `./sweep-windows.ts` and the rest) stay as they are. `scripts/ci/proof-runner/` changes no line: it holds no relative path outside its folder, and `job.ts` finds `reporter.ts` through `import.meta.dirname`.

| file (new path) | lines | from | to |
|---|---|---|---|
| `scripts/build/outlines/build.ts` | 1 | `"../../src/` | `"../../../src/` |
| `scripts/build/outlines/build.ts` | 3 | `"../build/simplify.ts"` | `"../simplify.ts"` |
| `scripts/build/outlines/extract.ts` | 3 | `"../../src/` | `"../../../src/` |
| `scripts/build/outlines/extract.ts` | 7 | `"../build/simplify.ts"` | `"../simplify.ts"` |
| `scripts/build/outlines/kit.ts` | 7 | `new URL("../../design/kit/outlines", ...)` | `new URL("../../../design/kit/outlines", ...)` |
| `scripts/build/outlines/kit.ts` | 9, 10, 11 | `new URL("../../src/` | `new URL("../../../src/` |
| `scripts/build/outlines/main.ts` | 4 | `"../../src/` | `"../../../src/` |
| `scripts/build/outlines/plane.ts` | 1 | `"../build/simplify.ts"` | `"../simplify.ts"` |
| `scripts/build/outlines/project.ts` | 2 | `"../build/simplify.ts"` | `"../simplify.ts"` |
| `scripts/build/primer-pictures/browser.ts` | 1 | `"../../src/` | `"../../../src/` |
| `scripts/build/primer-pictures/browser.ts` | 2 | `"../../e2e/` | `"../../../e2e/` |
| `scripts/build/primer-pictures/draw.ts` | 1 to 8 | `"../../src/` | `"../../../src/` |
| `scripts/build/primer-pictures/draw.ts` | 9 | `"../../test-support/` | `"../../../test-support/` |
| `scripts/build/primer-pictures/main.ts` | 4, 11, 12, 13 | `"../../src/` | `"../../../src/` |
| `scripts/build/primer-pictures/main.ts` | 14 | `"../../e2e/` | `"../../../e2e/` |
| `scripts/build/primer-pictures/main.ts` | 15 | `"../../test-support/` | `"../../../test-support/` |
| `scripts/build/primer-pictures/main.ts` | 16 | `"../build/clean-generated.ts"` | `"../clean-generated.ts"` |
| `scripts/build/primer-pictures/press.ts` | 13 | `"../../e2e/` | `"../../../e2e/` |
| `scripts/build/primer-pictures/press.ts` | 14 | `"../../src/` | `"../../../src/` |
| `scripts/build/primer-pictures/press.ts` | 15 | `"../shared/free-port.ts"` | `"../../shared/free-port.ts"` |
| `scripts/build/primer-pictures/signature.ts` | 1 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/cost.ts` | 1 to 6 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/depth.ts` | 3 to 10 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/feature-match.ts` | 1 to 3 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/partition.ts` | 1 to 5, 14, 15, 16 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/probes.ts` | 1 to 9 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/probes.ts` | 144 | `node scripts/region-detail/probes.ts` | `node scripts/measure/region-detail/probes.ts` |
| `scripts/measure/region-detail/renders.ts` | 3 to 8 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/sweep-measure.ts` | 1 to 9 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/sweep-windows.ts` | 1, 2 | `"../../src/` | `"../../../src/` |
| `scripts/measure/region-detail/sweep.ts` | 3, 4 | `"../../src/` | `"../../../src/` |

`scripts/build/outlines/ids.ts` holds no such path. `kit.ts` line 62 and line 70 write `npm run outlines` into the kit's README and stay. The region kit's output names (`out/region-detail-depth.json` in `depth.ts`, `out/region-detail/` in `renders.ts`, `out/region-detail-sweep.json` and its siblings in `sweep.ts`) are files a run writes under the session's own `out/`, not paths to the scripts, and stay. `npm run check` cannot see the four `new URL` lines in `kit.ts`; `test/terrain/outline-places.test.ts` reads all four (`PLACE_TABLE`, `PLACE_IDS`, `PLACE_NAMES`, `KIT_README`), and Evidence 7 runs the command that writes them.

### 3. References elsewhere (74 lines in 40 files)

The old-path search (Evidence 3) prints exactly these at 86a1a8fc and nothing once the change is in. In each, the substitution is the plain one, `scripts/outlines/` to `scripts/build/outlines/`, `scripts/primer-pictures/` to `scripts/build/primer-pictures/`, `scripts/proof-runner/` to `scripts/ci/proof-runner/`, `scripts/region-detail/` to `scripts/measure/region-detail/` (which also turns `../../scripts/...`, `./scripts/...`, `/abs/scripts/...` and `../runner/scripts/...` into the right form), with the three other shapes named where they occur.

**Configuration (6 lines in 2 files)**:
- `package.json` 16 `outlines`: `node scripts/build/outlines/main.ts`; 21 `proof`: `node scripts/ci/proof-runner/main.ts`; 30 `astro:generate` becomes exactly `node scripts/build/clean-generated.ts && node scripts/build/kit-fonts.ts && node scripts/build/place-files.ts && node scripts/build/build-app-bundles.ts && node scripts/build/generate-showcases.ts && node scripts/build/generate-discovery.ts && node scripts/build/primer-steps.ts && node scripts/build/primer-pictures/main.ts`.
- `.github/workflows/proof-runner.yml` 33 `run: node scripts/ci/proof-runner/list.ts`, 71 `- run: node ../runner/scripts/ci/proof-runner/job.ts`, 111 `run: node scripts/ci/proof-runner/ledger.ts`. The file keeps its name, so `WORKFLOW_FILE = "proof-runner.yml"` in `main.ts` and the workflow's `name:` and `group:` stand.

**Code under `scripts/` (3 lines in 2 files)**:
- `scripts/comment-judge/tree.ts` 2: `"../proof-runner/send.ts"` to `"../ci/proof-runner/send.ts"`.
- `scripts/copy-hunt/accepted-copies.ts` 64, the `file:` key `"scripts/region-detail/feature-match.ts"`, so the accepted copy still matches its file; and 80, the `reason` string naming `rulesAt in scripts/proof-runner/main.ts`. Both the plain substitution; no hash changes.

**The browser suite's support (3 lines in 3 files)**:
- `e2e/support/primer-reads.ts` 6 and `e2e/support/primer-walk.ts` 26: `../../scripts/primer-pictures/signature.ts` to `../../scripts/build/primer-pictures/signature.ts`.
- `e2e/support/suites.ts` 163, the comment naming `rulesAt` in `scripts/proof-runner/main.ts`, which the comment-citation lint resolves: the plain substitution.

**Test helpers (9 lines in 1 file)**: `test-support/footgun-gate/headless-build.fixtures.ts` 58, 163, 173, 174, 175, 218, 259, 261, the plain substitution; and 43, `"node scripts/Proof-Runner/main.ts read 1"` to `"node scripts/ci/Proof-Runner/main.ts read 1"`, its capitals kept, since that row holds the refusal to the path's case.

**Unit tests (39 lines in 25 files)**, the plain substitution unless said:
- `test/repo/proof-runner-job.test.ts` 6, 7, and 12 (`"scripts", "proof-runner", "reporter.ts"` to `"scripts", "ci", "proof-runner", "reporter.ts"`); `test/repo/proof-runner-ledger.test.ts` 3, 4, 5; `test/repo/proof-runner-list.test.ts` 13; `test/repo/proof-runner-outcome.test.ts` 11, and 13 (the same `"scripts", "ci", "proof-runner", "reporter.ts"`); `test/repo/proof-runner-read.test.ts` 6; `test/repo/proof-runner-rules.test.ts` 4; `test/repo/proof-runner-send.test.ts` 6, 17; `test/repo/proof-runner-workflow.test.ts` 6.
- `test/site/app-bundles.test.ts` 81, `test/site/astro-app-surfaces.test.ts` 19, `test/site/astro-showcases.test.ts` 20: the `astro:generate` string, written exactly as in `package.json` above.
- `test/site/primer-picture-draw.test.ts` 10; `test/site/primer-picture-signature.test.ts` 3; `test/site/primer-pictures-press.test.ts` 6; `test/site/primer-pictures-write.test.ts` 7, 8, 9, 10.
- `test/terrain/outline-places.test.ts` 4, 13; `test/terrain/outline-writer.test.ts` 3, 4, 5, 6, 7.
- The region kit's matcher, imported: `test/world/region-major-rivers.test.ts` 11, `test/world/region-rivers.test.ts` 12, `test/world/region-roads.test.ts` 9, `test/world/river-route.test.ts` 7, `test/world/seat-settlements.test.ts` 14. `npm run format` rewraps `region-roads.test.ts` line 9's import over five lines once it is longer (measured: `npm run format:check` reds on that file alone until then).
- The region kit, cited in a comment: `test/terrain/detail-guarantees-world.test.ts` 152, `test/world/detail-chain-world.test.ts` 83, `test/world/region-detail.test.ts` 162.

**Prose (14 lines in 7 files)**, the plain substitution:
- `handbook/specs/site-architecture.md` 174, 350, 360; `handbook/specs/settle-doctrine.md` 434; `handbook/specs/engine-invariants.md` 80.
- `handbook/errata/guards.md` 29, 180 and 181 (unbackticked), 191, 192, 224; `handbook/errata/prose.md` 84.
- `design/kit/README.md` 7: the kit is live, and its README names the command that reads it.
- `.claude/skills/vellum-footguns/hooks/README.md` 111, the example `node "scripts/proof-runner/main.ts"`, which mirrors fixture row 58.

### 4. Left as written

- `handbook/plans/`: the archived plans keep the old paths, as the issue rules.
- Names that are not these paths: `test-support/proof-runner-repo.ts` and every `test/repo/proof-runner-*.test.ts` keep their names; `test/world/region-detail.test.ts` and `test/site/region-detail-wiring.test.ts` keep theirs; the flake record's branch names (`chore/838-ci-proof-runner`, `feat/1255-primer-pictures`); the `tmpdir()` prefixes `proof-runner-`, `vellum-primer-pictures-` and `vellum-primer-svg-`; the workflow's `group: proof-runner`; the site's `/outlines/` and `generated/outlines/`; `design/kit/outlines/`; the `data-vellum-region-detail` attribute.
- Rows read at their own sha: `scripts/recon-triage/trial-set.jsonl` 195 and `scripts/copy-hunt/trial-set.ts` 79 and 156.
- `.claude/skills/vellum-footguns/references/flake-record.md` 67, a record of a run.
- The Issue #950 design round under `design/farther-interior/` (15 lines in 7 files name `scripts/region-detail/`). Its mock `design/farther-interior/mock/coherent-lattice.ts` line 4 then imports `../../../scripts/region-detail/sweep-windows.ts`, a path that no longer exists, so that round's mock no longer runs as archived; nothing type-checks or lints `design/`, so no check reds on it. Alex took the ruling with this consequence on the menu.
- `scripts/agent-infra/hooks/headless-build.ts` 142, the suffix `"proof-runner/main.ts"`: it matches the new path as it did the old.

## Rosters and doctrine

**`handbook/specs/rulebook.md`, What `src/` holds, and what runs around it.** The paragraph at line 391, which now reads:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a small module that scripts of several kinds import goes in `scripts/shared/`; what the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this, apart from the files its `NOT_YET_PLACED` names.

becomes exactly, one line as before:

> **Inside `scripts/`, a file sits in the folder of who runs it, never loose at the top.** What the site build runs, and a command that rewrites a committed file the product carries, goes in `scripts/build/`; the unit suite's launcher and the steps CI runs go in `scripts/ci/`; a small module that scripts of several kinds import goes in `scripts/shared/`; what the agents, and the sessions that dispatch them, run goes in `scripts/agent-infra/`; a script a session runs by hand to measure a world goes in `scripts/measure/`. The house's lint rules are `scripts/lint/` and the design rounds' tools `scripts/design/`, and a command of several files keeps them in a folder of its own inside the folder of who runs it. `test/site/folder-layout.test.ts` holds the top of `scripts/` to this: no file stands there but the ones its `NOT_YET_PLACED` names, and no folder but the ones its `SCRIPT_FOLDERS` and `FOLDERS_NOT_YET_PLACED` name.

Nothing else in the rulebook changes. `handbook/specs/engine-invariants.md`'s rule that a script measuring a world reads it first is unchanged: the region kit measures what it measured.

No roster changes: no moved file is a page, a suite, a sheet or a bundle entry; no test file is added or renamed, so `UNIT_SECONDS` in `scripts/ci/unit-shards.ts` keeps its keys; `SOURCE_READS` in `test-support/source-read-list.ts` names none of the moved files; no agent definition, role body, adapter or model policy changes, so `npm run agents:generate` writes nothing and workflow step 14's line on which definition wrote and reviewed the change is not owed; `scripts/agent-infra/hooks/` and `.codex/hooks.json` do not change. `CLAUDE.md` and `handbook/specs/development-workflow.md` name the proof runner only as `npm run proof` and `.github/workflows/proof-runner.yml`, both of which stand.

## Tests, in the order they are written

**T3, the folder test.** `test/site/folder-layout.test.ts`, after its last test, reusing that file's `listed` and `foldersOf`, exactly (the form the dry run measured, `npm run format:check` passing on it):

```ts
const SCRIPT_FOLDERS: readonly string[] = ["agent-infra", "build", "ci", "design", "lint", "measure", "shared"];
const FOLDERS_NOT_YET_PLACED: readonly string[] = [
  "comment-judge",
  "comment-sweep",
  "copy-hunt",
  "delivery",
  "handoff",
  "issue-reader",
  "jev",
  "keeper-scan",
  "recon-triage",
  "still-judge",
];

test("every folder directly under scripts/ is one SCRIPT_FOLDERS or FOLDERS_NOT_YET_PLACED names, and each of those is still there (Issue #1454)", () => {
  const folders = foldersOf(listed("scripts"));
  const strays = [...folders]
    .filter((name) => !SCRIPT_FOLDERS.includes(name) && !FOLDERS_NOT_YET_PLACED.includes(name))
    .sort();
  assert.deepEqual(strays, []);
  assert.ok(
    [...SCRIPT_FOLDERS, ...FOLDERS_NOT_YET_PLACED].every((name) => folders.has(name)),
    "git listed the tree, and every folder the two lists name still stands at the top of scripts/",
  );
});
```

- Red first, at the first commit, before any move: measured at 86a1a8fc, red on the `deepEqual` with `actual: [ 'outlines', 'primer-pictures', 'proof-runner', 'region-detail' ]`, 4 of the file's 5 tests passing (`out/1454-pr2-fold/t3-red.log`). No stub is needed: the test reads the tree, and the tree is the wrong state.
- Green after the moves: measured (`out/1454-pr2-fold/unit.log`).
- The mutations that red it once green: (a) an untracked `scripts/stray-1454/x.ts` holding `export {};` (`listWorkingTree` lists untracked files): red on the `deepEqual`, `actual: [ 'stray-1454' ]` (`out/1454-pr2-fold/t3-mut-a.log`); (b) `"still-judge"` misspelled `"still-judge-x"` in `FOLDERS_NOT_YET_PLACED`: red on the `deepEqual`, `actual: [ 'still-judge' ]` (read in the first dry run, `out/1454-pr2-dry-run/t3-mut-c.log`, whose lists differed from these only in `measure` and `region-detail`); (c) `"gone-1454"` added to `FOLDERS_NOT_YET_PLACED`: the `deepEqual` passes and the `assert.ok` reds with its message (`out/1454-pr2-fold/t3-mut-c.log`), which keeps either list from outliving its folders.
- The prover owes it (workflow step 11).

**Pull request 1's test of the loose files** stays as it is; nothing here makes a file loose.

**Every other test** changes only the path it imports or names, and is not a new or strengthened guard. Their red is the move itself: after the `git mv` and before the references are rewritten, `npm run check` fails on each import, which is the expected state between those two steps and is not committed. The nine fixture rows of `headless-build.fixtures.ts` keep the verdict each pins (deny or pass), and the selftest reads them: all 1,176 rows `ok` in the dry run (`out/1454-pr2-fold/selftest.log`).

No browser check is added or made longer, so no ledger line and no readings are owed. `e2e/support/primer-reads.ts` and `e2e/support/primer-walk.ts` change one import each, and one suite that loads them runs once (Evidence 9).

## Order of commits

1. `#1454 The plan for pull request 2, and the folder check that reds until four folders move`: `handbook/plans/1400/1454/1454-pr2-plan.md` (this file, unchanged, beside `1454-plan.md`, never over it) and T3, with `npm run format` run before the commit so `npm run format:check` passes on it. Push it (workflow step 9); CI reds on T3, as intended, and on nothing else.
2. `#1454 outlines/ and primer-pictures/ move into scripts/build/, proof-runner/ into scripts/ci/, and region-detail/ into a new scripts/measure/`: the `mkdir` and the four `git mv`, Files sections 2 and 3 complete, the rulebook paragraph, with `npm run format` run before the commit so `npm run format:check` passes on it. Green.

Before commit 2's build, take the control build at commit 1 (Evidence 6). After commit 2 is pushed, send the proof row (Evidence 10).

## Evidence

Run each command alone, and only while no other lane runs a suite, a build or a browser (`ps -Ao pid,etime,command | grep -E 'node|chrom' | grep -v grep` shows none of theirs); say in the report when you waited. Keep every bare `node --test` bounded (`NODE_OPTIONS=--max-old-space-size=2048`, `--test-timeout=600000`).

1. `npm run check`, `npm run lint`, `npm run format:check`.
2. `node test-support/footgun-gate/selftest.ts` (every row `ok`), then `NODE_OPTIONS=--max-old-space-size=2048 npm test`, then `npm run astro:generate`.
3. The old-path search, which must print nothing and exit 1 (at 86a1a8fc it printed 74 lines in 40 files; it is case-insensitive for fixture row 43):

   ```
   git grep -n -i -E 'scripts/\(?(outlines|primer-pictures|proof-runner|region-detail)|"\.\./(outlines|primer-pictures|proof-runner|region-detail)/|scripts\\/\(?(outlines|primer-pictures|proof-runner|region-detail)|"scripts", "(outlines|primer-pictures|proof-runner|region-detail)"' -- . ':!handbook/plans' ':!design/farther-interior' ':!scripts/copy-hunt/trial-set.ts' ':!.claude/skills/vellum-footguns/references/flake-record.md'
   ```

4. The new-path check: `git grep -h -o -E 'scripts/(build/(outlines|primer-pictures)|ci/proof-runner|measure/region-detail)/[a-z-]+\.ts' -- . ':!handbook/plans'` piped to `sort -u`, then one `ls` naming every path it printed; `ls` lists each and reports no missing file.
5. `git diff --find-renames --name-status origin/main` lists the 28 moves as `R` rows; `git diff --stat origin/main -- .codex/hooks.json scripts/agent-infra/` prints nothing.
6. `dist/` byte for byte: at commit 1, `npm run build`, then `cp -R dist out/1454-pr2-dist-before`; after commit 2, `npm run build`, then `diff -r out/1454-pr2-dist-before dist`, which prints nothing and exits 0. The build log's `pictures:` line names 24 pictures pressed on both sides.
7. `npm run outlines -- build`, then `git status --porcelain` prints nothing: the moved entry point finds its kit and writes the same committed tables.
8. `node scripts/measure/region-detail/probes.ts`, with no argument: it loads the kit's modules, prints `usage: node scripts/measure/region-detail/probes.ts <counterfactual|mouths>` and exits 1 (at 86a1a8fc, from its old path, it printed the same line with the old path and exited 1 in 0.2 s, `out/1454-pr2-fold/probes-usage-main.log`).
9. After a build, `VELLUM_E2E_SUITES=primer-gallery npm run test:e2e`, once, and let it finish: a smoke suite that runs alone (it is in none of `NEEDS_PREDECESSOR`, `OPENS_ON_HOME` and `INHERITS_HARNESS_PAGE` in `e2e/support/suites.ts`) and loads `e2e/support/primer-walk.ts`, so the moved `signature.ts` resolves in the browser harness. No other suite; the full local lanes are never run.
10. The moved workflow, which runs on no pull request: after commit 2 is pushed, write `1454-pr2-proof.json` in the scratchpad holding exactly

    ```json
    [
      {
        "id": "1454-pr2-folder-gone",
        "edits": [{ "file": "test/site/folder-layout.test.ts", "find": "  \"still-judge\",\n];", "replace": "  \"still-judge\",\n  \"gone-1454\",\n];" }],
        "unit": {
          "files": ["test/site/folder-layout.test.ts"],
          "expect": ["every folder directly under scripts/ is one SCRIPT_FOLDERS or FOLDERS_NOT_YET_PLACED names, and each of those is still there (Issue #1454)"]
        }
      }
    ]
    ```

    then `npm run proof -- send <that file's absolute path> --runner <the pushed head's full sha>` from the tree, and `npm run proof -- read <run id>` once it has finished. The ledger's row reads BITES beside a clean control: the plan, prove and ledger jobs ran `scripts/ci/proof-runner/list.ts`, `job.ts` and `ledger.ts` from the pull request's own commit. Quote the row with its run id in the PR body.
11. `vellum-plate-reader` is not owed: nothing under `src/` changes, so step 1 of its "Two versions of one sheet" prints no change, and the deliverable is not an appearance.
12. The cold skeptic as workflow step 14 says.

Measurements behind this plan, all in the planner's tree at 86a1a8fc, each dry run made uncommitted and then discarded with `git reset --hard HEAD`. First dry run, before the ruling, folder `out/1454-pr2-dry-run/` (`sha.txt` holds the sha):
- Two builds at 86a1a8fc: `npm run build` twice (`build-a.log`, 28 s; `build-b.log`, 74 s), each pressing 24 pictures; `diff -r` of the two `dist/` trees empty (`diff-ab.txt`, 0 lines).
- `npm run outlines -- build` at 86a1a8fc (`outlines-a.log`), `git status --porcelain` empty.
- The three build and ci moves (`node out/1454-pr2-dry-run/1454-pr2-rewrite.ts core`, counts in `rewrite-core.log`): `npm run build` after them (`build-c.log`), `diff -r` against the first build empty (`diff-ac.txt`, 0 lines); `npm run outlines -- build` from the new folder (`outlines-c.log`) wrote nothing.

Second dry run, after the ruling, folder `out/1454-pr2-fold/`, all four moves (`1454-pr2-rewrite.ts core`, then `region`, counts in `rewrite-core.log` and `rewrite-region.log`) and T3 exactly as above:
- T3 red before the moves (`t3-red.log`), green after them, and its mutations (`t3-mut-a.log`, `t3-mut-c.log`).
- The old-path search of Evidence 3 printed nothing and exited 1.
- `npm run check` (`check.log`) and `npm run lint` (`lint.log`) exited 0; `npm run format:check` red on `test/world/region-roads.test.ts` alone (`format.log`) and passed once `prettier --write` rewrapped that import (`format-2.log`).
- The selftest printed 1,176 `ok` rows and nothing else (`selftest.log`).
- `npm test` passed 4,271 of 4,271 in 5 min 15 s (`unit.log`), `test/repo/test-collection.test.ts`, `test/repo/copy-hunt-accepted.test.ts`, `test/repo/prose-paths.test.ts` and the five tests importing the region kit's matcher among them.
- `region-detail/` is not in the build (nothing in `astro:generate` or `astro.config.ts` imports it), so the first dry run's `dist/` reading stands for all four moves.

## Calls made

Each is mine, taken on the rule named; Alex saw them with the menu and overruled none. The step 12 comment copies them and points at the rulings comment for R1 rather than restating it.

1. **A new test, T3, holds the folders at the top of `scripts/`**, with a list of the folders still to move that each later pull request shortens. Rule: a load-bearing invariant earns a test (`CLAUDE.md`, Process), as pull request 1's call 7 took it for the files; and workflow step 8, the failing test first, which a pure move otherwise has only as a missing module.
2. **The rulebook's last sentence is reworded to name T3's lists, and "a folder of its own" gains "inside the folder of who runs it"**, which is what T3 holds and what the issue's layout table already meant (`outlines/` under `scripts/build/`). Rule: doctrine moves with the code (workflow step 8); the rule has one home (`handbook/specs/conventions.md`, Where a rule lives).
3. **Strings that only stand for a path are rewritten too**: the nine headless-build fixture rows (row 43 keeping its capitals), the hook README's example, the `suites.ts` comment, the copy hunt's `reason` string and `probes.ts`'s usage line. None changes a verdict, and the old-path search then has no exception to remember. Rule: pull request 1's call 6.
4. **The headless build's suffix match and everything else under `scripts/agent-infra/hooks/` stay as they are, and `.codex/hooks.json` is not touched.** The suffix matches the new path (selftest, all rows `ok`). Rule: the issue's acceptance, no behavior change, and Alex's trust of the Codex hook.
5. **`scripts/comment-judge/tree.ts` keeps importing `readAt` from the proof runner**, at its new path. Rule: a pure move; the later review pull request may weigh moving `readAt`.
6. **The moved workflow is proven by one proof row sent with `--runner` at the pushed head** (Evidence 10). Rule: `CLAUDE.md`, Measure before you assert: the workflow runs on no pull request, so without that run its three lines are unverified until the first proof after the merge.
7. **What stays as written** is Files, section 4, the Issue #950 round's mock among it. Rule: the issue keeps `handbook/plans/` as written; a name that is not a path is not a reference; a row read at its own sha, a record of a run and a design round's archive are history (pull request 1's call 4).
8. **`design/kit/README.md` line 7 is rewritten.** The kit is live. Rule: pull request 1's call 5.
9. **`npm run outlines` and `npm run proof` keep their names**, and `feature-match.ts` stays in the region kit. Rule: a pure move.
10. **Nothing here waits for a later pull request.** The proof runner is safe to move while lanes use it (The design, above), and no open pull request touches the four folders (`gh pr list --state open` printed none at 86a1a8fc). Rule: the issue's "each landed while no open branch touches those files".
11. **Branch `chore/1454-pr2-scripts-folders`.** Pull request 1's branch name is not reused.

## Open decisions

none. The one question the step 6 menu put to Alex is ruled (Rulings, above), and this plan is built to it.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 86a1a8fc origin/main -- scripts/ test/ test-support/ e2e/ package.json .github/workflows/proof-runner.yml` shows a change to any file this plan names under those roots, or the old-path search (Evidence 3), run before the first edit, prints a line in a code or test file that Files section 3 does not list. A named doc or errata file that moved is built on as it stands (the lane of Issue #716 removes one line above line 180 of `handbook/errata/guards.md`, so its rows at 180, 181, 191, 192 and 224 may sit one line higher).
- `npm run check`, `npm run lint` or `npm test` reds on an import, a path or a test this plan does not name, or `npm run format:check` reds after `npm run format` has run.
- T3 at commit 1 reds on any folder but the four, or is green.
- The selftest prints any row that is not `ok`.
- `diff -r out/1454-pr2-dist-before dist` prints anything, or either build presses other than 24 pictures.
- `git status --porcelain` after `npm run outlines -- build` prints anything.
- `node scripts/measure/region-detail/probes.ts` prints anything but its usage line, or throws.
- The proof row of Evidence 10 reads anything but BITES with a clean control, or its plan, prove or ledger job fails before its check runs.
- `VELLUM_E2E_SUITES=primer-gallery npm run test:e2e` reds.
- `git diff --stat origin/main -- .codex/hooks.json scripts/agent-infra/` prints anything.
- The Issue #716 lane's branch (`fix/716-cd25-cd44-return`) has come to add a line the old-path search matches or to edit a moved file; report it to the dispatcher before merging main into this branch.

## The parallel lanes

- **PR #1460 (Issue #1456) merged as 86a1a8fc while this was planned**, and this plan is written at the merged state. It edited none of the files this plan moves or edits under `scripts/`, `test/`, `test-support/`, `e2e/`, `package.json` or the workflow.
- **The Issue #716/#843 lane**, branch `fix/716-cd25-cd44-return` at 4e22a6a5 (no pull request yet), read with `git diff --name-only origin/main...FETCH_HEAD` and a search of its added lines: it edits `e2e/suites/chart-drawer*`, `e2e/suites/zoom-gestures/touch.ts`, `e2e/support/camera-landed.ts`, `e2e/support/skips.ts`, `test/e2e/drawer-waits.test.ts`, `handbook/errata/guards.md` (one hunk at its line 167) and `handbook/specs/settle-doctrine.md` (one hunk at its line 561). This pull request edits `guards.md` 29, 180, 181, 191, 192 and 224 and `settle-doctrine.md` 434, so the two meet in those two files only, in hunks far enough apart that git merges them in either order. Its added lines name "proof-runner rows" as prose, never an old path, and it touches nothing under `scripts/region-detail/`. It sends proofs now, on the runner `main`; whichever side of this merge they land on, each run reads its workflow and runner from one commit.
- **Either order merges safely.** Whichever lands second runs `git merge origin/main`, the old-path search, `npm run check`, `npm run lint` and `npm test` before it is merged.

## Later pull requests, for their planners

- The review tools' move: `scripts/comment-judge/tree.ts`'s import becomes `../../ci/proof-runner/send.ts` from `scripts/review/comment-judge/` unless that pull request moves `readAt`; `scripts/copy-hunt/changed.ts` imports `../comment-judge/tree.ts`; `accepted-copies.ts` keys its copies by file path, so each moved file named in a key is rewritten.
- The agent tools' move: no file this pull request moves is imported by `handoff/`, `issue-reader/`, `recon-triage/`, `delivery/` or `jev/`; `scripts/handoff/prompt.ts` names the runner only as `npm run proof`.
- Each later move shortens `FOLDERS_NOT_YET_PLACED` (and, for `scripts/agent-sandbox.ts`, `NOT_YET_PLACED`) and adds its new folder to `SCRIPT_FOLDERS`.
