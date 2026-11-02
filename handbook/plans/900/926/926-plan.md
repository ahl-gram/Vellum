# Issue #926 plan: `npm test` runs the suites under `test/` alone

**Planned at:** `origin/main` f475d0f0835e8a603f8874f8633f0da3e5a246b3, Issue #926 comment count 1
(the rulings comment below).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/926#issuecomment-6565858899 (Alex,
2026-11-01, relayed by the orchestrating session): option 1, ignore files under `out/` and pass;
`npm test` becomes the launcher.

**Open decisions:** none.

**Ships as:** one pull request.

## Specs

- `handbook/specs/check-placement.md`: The unit suite (whole section; this plan adds its first
  bullet), and the instrument table.
- `handbook/specs/conventions.md`: Where a rule lives (one normative home, the scars routing), How a
  spec is written (prescriptive voice, backticked paths are scanned, `Issue #N` form), How code is
  cited (`symbol` in `path`, lint-enforced in comments).
- `handbook/specs/orchestration.md`: Before the session ends (the bullet this plan rewrites).
- `handbook/specs/development-workflow.md`: step 8 (archive the plan, failing test first, commit
  before you mutate), step 10 (name the checks that ran), step 11 (prover), step 12 (calls comment).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 2, 3, 8, 9, 10, 14; Gate 7 item 3; Gate 5
  before the push.

## Recon summary

`vellum-spec-recon` at f475d0f0: 0 comments (body only). Counts: CURRENT 8, STALE 4 (one of them a
new fact recon filed with the stale rows: the live files below), UNVERIFIABLE 1.

- STALE, blocking, and it shaped the plan: the body's "check what `test/repo/test-collection.test.ts`
  already reads" implies the guard misses `out/`. It does not: its walk prunes only `node_modules`
  and dot segments, and its last test reds on any file node collects outside `test/`, `out/`
  included. Measured here: planting `out/926-w/test/x.test.ts` and `out/926-w/test-y.ts` in this tree
  and running `node --test test/repo/test-collection.test.ts` read `ℹ fail 1`, "2 file(s) node --test
  collects outside test/ (out/926-w/test-y.ts, out/926-w/test/x.test.ts)"; removing them read
  `ℹ pass 8`, `ℹ fail 0` (logs `out/926-witness-red.log`, `out/926-witness-green.log` in the
  planner's tree). So a red already exists. What it cannot do is stop the runner collecting and
  running every copied suite beside it, which is the incident's cost.
- STALE, blocking: the body's idea keys a guard on a `package.json` or a `test/` folder under `out/`.
  A `package.json` alone collects nothing (recon's scratch run), `.claude/agents/vellum-designer.md`
  puts spikes with their own `package.json` under `out/` by rule, and the live instance today has
  neither marker (next bullet).
- New fact: the main checkout's `out/` holds, today, two files node's default pattern collects,
  `out/852-measure/test-values.ts` and `out/853-dry-run/final/engine/test-support-outline-places.ts`
  (an `fs.globSync` with node's own default pattern, run read-only over that folder; the two
  `test/` folders also there, `out/785-lint-dry-run/planned/test` and
  `out/1060-r1-dry-run/branch/test`, hold no loadable file). Measured in the planner's tree, not the
  main checkout: empty files planted at those two exact paths made
  `node --test test/repo/test-collection.test.ts` read `ℹ fail 1`, "2 file(s) node --test collects
  outside test/ (out/852-measure/test-values.ts,
  out/853-dry-run/final/engine/test-support-outline-places.ts)"; removed, `ℹ pass 8`, `ℹ fail 0`
  (logs `out/926-live-red.log`, `out/926-live-green.log`). Read, never run: `test-values.ts` is
  Issue #852's planner probe, which on load runs every measuring block it holds
  (`process.argv[2] ?? "all"`), generating worlds across seeds; the other is a 14-line copy of a
  test helper. So a plain `npm test` in the main checkout would have run that probe as a test and
  redded at its last check. At the ruling, the orchestrating session moved both files to the Trash
  (the rulings comment); nothing else in those folders was touched. The build does not depend on
  either file.
- STALE, cosmetic: Gate 1 item 8 never names `out/`; only the orchestration bullet makes the link.
- UNVERIFIABLE: the 2026-10-09 and 2026-10-11 incidents (no log survives).

## The design

**`npm test` stops collecting the whole checkout and runs `test/**/*.test.ts` alone, through a
small launcher, `scripts/unit-suite.ts`, which puts every argument after `npm test --` before the
suite's pattern and adds the pattern only when no argument is a path.** `package.json`'s `test`
becomes `node scripts/unit-suite.ts`. Whatever sits in `out/` (or `dist/`, `generated/`, a copied
tree anywhere) is never collected, so a copy is inert and `npm test` stays green beside it. The
collection guards in `test/repo/test-collection.test.ts` keep their predicate (node's own default
family), stop reading the scratch `out/` at the repo root, and their names and messages are rewritten
for the new split: `npm test` never runs a suite outside `test/` or under another name, and a bare
`node --test` would still run a helper so placed as a phantom pass.

Measured facts the design rests on (Node v26.13.0, npm 11.20.0, this machine):

1. `node --test` has no file-exclude flag. `node --help` lists `--test-skip-pattern` and
   `--test-name-pattern`, both over test NAMES; `--test-coverage-exclude` is coverage only.
2. Node's runner takes every argument after the first positional as another glob pattern
   (`options.globPatterns = ArrayPrototypeSlice(process.argv, 1)` in `internal/main/test_runner`,
   read with `--expose-internals`). In a scratch tree of four suites,
   `node --test --test-reporter=tap 'test/**/*.test.ts' --test-shard=1/2` ran 4 of 4 files, and
   `node --test --test-reporter=tap --test-shard=1/2 'test/**/*.test.ts'` ran 2. So a pattern
   written at the end of the `test` script would turn CI's `npm test -- --test-shard=N/3` into three
   legs running every file, green, and break `npm test -- --test-shard=<k>/<n>` and
   `npm test -- <file>`, both written into `.claude/agents/vellum-implementer.md`'s CI-red procedure.
3. On a clean tree the new pattern collects exactly what node's default does: `fs.globSync` in this
   tree, node's default pattern 398 files, `test/**/*.test.ts` 398 files, symmetric difference empty.
4. npm runs a script's forwarded arguments after its text, and `pretest` gets none of them (scratch
   package: `npm test -- --test-shard=1/2` and `npm test -- test/repo/` both ran `pretest` first;
   a `pretest` exiting 1 stopped `test`, exit 1). `npm config get ignore-scripts` reads `false`; no
   `.npmrc` in the repo.
5. A folder argument (`node --test test`) collects the same four suites as the glob and NOT
   `test/helper.ts`: Node 26.13 expands a folder to `<folder>/` plus its default pattern, so a helper
   directly under `test/` is dropped either way.
6. A nested `node --test` that inherits `NODE_TEST_CONTEXT` skips every file and exits 0 (recorded
   in `handbook/plans/700/779/779-part2i-plan.md`; `test/repo/test-timeout.test.ts` deletes it).

### Alternatives rejected

- **The pattern appended to the `test` script** (`... --test-timeout=600000 'test/**/*.test.ts'`),
  with `ci.yml` calling `node` itself: fact 2. Every `npm test -- <flag>` would be silently ignored
  and every `npm test -- <path>` would run the whole suite too.
- **The folder `test` as the default instead of the glob**: fact 5 shows it gains nothing (the
  phantom-pass arm is lost either way), and it rests on Node's folder expansion, seen in 26.13's
  `createTestFileList` and unverified on the Node 24 `engines` allows.
- **A guard keyed on a `package.json` or a `test/` folder under `out/`** (the issue's idea): recon
  rows above. A `package.json` breaks nothing, designer spikes carry one by rule, and today's live
  instance is two by-name files with neither marker.
- **A new guard alone** (the issue's idea in its strongest form): the existing last test of
  `test-collection.test.ts` already reds on every such file (witness above). Another red cannot stop
  the runner collecting the copies; it lands beside their own results.
- **Refuse to start** (a `pretest` script naming the `out/` folders to trash, collection
  unchanged; the menu's option 3): ruled out by Alex (the rulings comment). It would block every
  `npm test` in a checkout or lane whose `out/` holds such a file until someone cleans it.
- **Aim the runner and still red at the end** (the walk keeps reading `out/`; the menu's option 2):
  ruled out by Alex (the rulings comment). The copies would never run, yet the main checkout's
  `npm test` would red whenever a lane left one behind.
- **Words only** (more prose in `handbook/specs/orchestration.md`): the rule already exists in
  words, the issue's incidents happened under it, and the main checkout broke it on the day this was
  planned.
- **A preload that rewrites `process.argv`, `NODE_OPTIONS=--test-shard`, or an `${VAR:+...}` shell
  expansion in the script**: each reaches the same order by a mechanism no test here reads, against
  "Prefer the boring, obvious solution"; the launcher has a house precedent (`"test:e2e": "node
  e2e/run.ts"`, pinned by `test/repo/e2e-tiers.test.ts`).

## Files

**Created: `scripts/unit-suite.ts`** (about 18 lines), exactly:

```ts
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const SUITE = "test/**/*.test.ts";

export const unitArgs = (forwarded: readonly string[]): string[] => [
  "--import",
  "./test-support/source-read-guard.ts",
  "--test",
  "--test-timeout=600000",
  ...forwarded,
  ...(forwarded.some((arg) => !arg.startsWith("-")) ? [] : [SUITE]),
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const run = spawnSync(process.execPath, unitArgs(process.argv.slice(2)), { stdio: "inherit" });
  process.exitCode = run.status ?? 1;
}
```

No comment: the four tests below pin every behaviour in it. The entry guard is the house form
(`scripts/clean-generated.ts`), so importing the module from a test runs nothing.

**Created: `test/repo/unit-suite.test.ts`** (about 85 lines): tests T1 to T4 below, over trees
seeded with `mkdtempSync` under `tmpdir()`, never the repo's own `out/`. Its module scope:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const LAUNCHER = resolve(import.meta.dirname, "..", "..", "scripts", "unit-suite.ts");
const TAP = "--test-reporter=tap";
// A cap on a hang, never a budget (2026-11-01: each seeded run took about 0.2 s on a Mac).
const CHILD_LIMIT_MS = 60_000;
const TYPE_MODULE = '{"type":"module"}\n';

const suite = (name: string) => `import { test } from "node:test";\ntest(${JSON.stringify(name)}, () => {});\n`;
const suites = (...paths: string[]) => Object.fromEntries(paths.map((p) => [p, suite(p)]));

const COPY_UNDER_OUT = {
  ...suites("test/a.test.ts", "test/sub/b.test.ts", "out/copy/test/c.test.ts", "out/test-d.ts"),
  "out/copy/package.json": TYPE_MODULE,
};
const FOUR_SUITES = suites("test/a.test.ts", "test/b.test.ts", "test/c.test.ts", "test/d.test.ts", "out/copy/test/e.test.ts");
const ONE_RED = { "test/a.test.ts": `import { test } from "node:test";\ntest("red", () => { throw new Error("red"); });\n` };

type Run = { status: number | null; ran: string[]; output: string };

const runIn = (files: Readonly<Record<string, string>>, argv: readonly string[]): Run => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-unit-suite-"));
  try {
    const seeded = { "package.json": TYPE_MODULE, "test-support/source-read-guard.ts": "export {};\n", ...files };
    for (const [rel, body] of Object.entries(seeded)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      writeFileSync(join(dir, rel), body);
    }
    const env = { ...process.env };
    delete env["NODE_TEST_CONTEXT"];
    const run = spawnSync(process.execPath, argv, { cwd: dir, encoding: "utf8", timeout: CHILD_LIMIT_MS, env });
    assert.doesNotMatch(String(run.error), /ETIMEDOUT/, `the child hung until the ${CHILD_LIMIT_MS} ms limit killed it`);
    const ran = [...run.stdout.matchAll(/^(?:not )?ok \d+ - (.+)$/gm)].map((m) => m[1] ?? "").sort();
    return { status: run.status, ran, output: `${run.stdout}${run.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
```

The seeded `test-support/source-read-guard.ts` is an empty module, so the launcher's `--import`
resolves inside the seeded tree; the real preload is held by the existing outcome check (M9 below).
Each seeded test is named by its own path, and Node 26's TAP reporter prints each test at the top
level, so `ran` reads as paths (measured: the probe below).

**Edited: `package.json`**: `"test": "node scripts/unit-suite.ts"`. Nothing else in the file.

**Edited: `test/repo/e2e-tiers.test.ts`** (stays 396 lines): in the test "ci.yml shards the unit
suite across a matrix of 1 to N, and every leg runs its own slice, so no test file is dropped", the
`assert.equal` on `pkg.scripts["test"]` becomes:

```ts
  assert.equal(
    pkg.scripts["test"],
    "node scripts/unit-suite.ts",
    "npm test no longer runs the unit launcher, so the shard flag ci.yml appends can land after the suite's pattern, where node --test reads it as one more pattern and every leg runs every file",
  );
```

The `ci.yml` step regex in the same test is unchanged, as is `.github/workflows/ci.yml`.

**Edited: `test/repo/test-timeout.test.ts`**: the test "npm test passes --test-timeout at or above the
bound" reads the launcher's argv instead of the script string:

```ts
import { unitArgs } from "../../scripts/unit-suite.ts";
...
test("npm test passes --test-timeout at or above the bound", () => {
  const argv = unitArgs([]).join(" ");
  const value = /--test-timeout=(\d+)/.exec(argv)?.[1];
  assert.notEqual(value, undefined, `npm test's runner carries no --test-timeout: ${argv}`);
  assert.ok(Number(value) >= MIN_SUITE_TIMEOUT_MS, `--test-timeout=${value} is under ${MIN_SUITE_TIMEOUT_MS}`);
});
```

`readFileSync` leaves the `node:fs` import (it has no other use in the file); `resolve` stays (used
by `REPO`).

**Edited: `test/repo/test-collection.test.ts`** (about 227 lines after):

- The comment above `const ROOT` (today the line beginning `// Node's --test collects every test/
  directory`) becomes this one line, its backticks part of the comment, in the citation form
  `vellum/ts-comment-citation-resolves` checks:

  ```ts
  // npm test runs only the .test.ts files under test/ (`SUITE` in `scripts/unit-suite.ts`), while a bare node --test collects every test/ directory anywhere in the tree AND every file named test, test-*, *-test, *_test or *.test (its six extensions, outside dot segments and node_modules), so all three defects below hide in a green run: a suite under test/ under another name, or outside test/, never runs under npm test, a module so placed or named is a phantom pass under a bare run, and an imported sibling re-registers its own tests. None is visible in a green run, only in the total.
  ```

- The comment above `entriesOf` (today the line beginning `// Sibling suites build and remove`)
  becomes this one line; its old reason, scratch trees under `out/`, goes with the root `out/`
  prune, and `test/site/astro-scaffold.test.ts` calls `cleanGenerated(root(GENERATED))` in its
  `before`:

  ```ts
  // A sibling suite removes generated/ during the same npm test run (`cleanGenerated` in `scripts/clean-generated.ts`), racing this walk, so tolerating ENOENT errs toward MISSING a collectible name in a tree that vanished mid-walk; it is the one place this file errs toward a miss rather than a false positive.
  ```
- After `pruned`, add `const prunedAtRoot = (name: string) => pruned(name) || name === "out";`.
- `walk` takes the predicate, defaulting to `pruned`, so only the top call prunes `out`:
  `const walk = (dir: string, skip: (name: string) => boolean = pruned): string[] => entriesOf(dir).flatMap((e) => e.isDirectory() ? (skip(e.name) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)]);`
- `const filesUnder = (root: string) => walk(root, prunedAtRoot).map((p) => relative(root, p));`
- The walk test is renamed and widened (W1 below).
- The test "every file node --test loads under test/ is a .test.ts, so none is a phantom pass or an
  unseen suite" is renamed "every file a bare node --test loads under test/ is a .test.ts, so npm
  test runs every suite there and a bare run counts no phantom", and its message becomes:
  `` `${strays.length} file(s) under test/ that a bare node --test loads yet are not .test.ts suites (${strays.join(", ")}): npm test runs only the .test.ts files under test/, so a suite under any other name never runs and escapes the guards keyed to the .test.ts name, vellum/test-no-test-import among them, and a bare node --test counts a helper here as a passing test of its own; helpers belong in test-support/` ``
- The test "every file node --test collects lives under test/, where the runner is aimed" is renamed
  "every file in node --test's own family lives under test/, where npm test is aimed, and the scratch
  out/ is not read", and its message becomes:
  `` `${outside.length} file(s) node --test's own patterns collect outside test/ (${outside.join(", ")}): npm test runs only the .test.ts files under test/, so a suite there never runs, and a bare node --test collects any directory named test at any depth and any file named test, test-*, *-test, *_test or *.test, so a module there is a passing test of its own; move a real suite under test/, rename a helper out of that family (test-support/ is its home), and keep generated output from carrying one of those names` ``
- Every other test, the predicate (`loadedByNode`, `isStray`, `straysUnder`, `inTestDir`,
  `namedTest`, `collectedByNode`, `collectedOutside`) and `withSeededTree` are unchanged.

**Edited: `handbook/specs/check-placement.md`**: a new FIRST bullet of "## The unit suite", wrapped
to the file's width:

```
- **`npm test` runs the `.test.ts` files under `test/` and nothing else** (`SUITE` in
  `scripts/unit-suite.ts`), so nothing under `out/` or any other folder is ever collected. A path
  after `npm test --` runs that path alone, and a flag after it reaches `node --test`, written as
  `--flag=value`, since a value written as its own word reads as a path and the run falls back to
  `node --test`'s own collection of the whole checkout. A suite under any other name or outside
  `test/` never runs, and `test/repo/test-collection.test.ts` reds one.
```

**Edited: `.claude/skills/vellum-footguns/SKILL.md`**: Gate 1 item 8 becomes:

```
8. **A shared helper goes in `test-support/`, never in `test/`, and never in a sibling.** `npm
   test` runs only the `.test.ts` files under `test/` (`handbook/specs/check-placement.md`, The
   unit suite), but a bare `node --test` collects every module under ANY directory named `test`
   outside dot segments and `node_modules`, and ANYWHERE a file named `test`, `test-*`, `*-test`,
   `*_test` or `*.test`, so there a helper so placed or named runs as a passing test of its own;
   under either, a `.test.ts` importing a sibling `.test.ts` runs the sibling's tests twice. Neither
   fails, both inflate the count, and `test/repo/test-collection.test.ts` and the lint red them. No
   precedent in `test-support/` is no evidence against the convention.
```

The gate's `Scars:` line is not touched (touching it would owe every bare number on it the
`Issue #N` or `PR #N` form).

**Edited: `.claude/skills/vellum-footguns/references/scars.md`**: a new bullet directly after the
bullet that begins "- Later, #562:" and ends "eight hours earlier.":

```
- Later, Issue #926: the handoff rule kept a copied tool under no name `node --test` collects, and a
  copied TREE defeated it, since every directory named `test` is collected whole: the issue records
  a saved suite under `out/` failing a local `npm test` twice and a lane's folder holding whole
  repository copies a level below where a cleanup looked, and on 2026-11-01 a planner's dry run left
  copies of the whole test tree under `out/` while two by-name files sat in the main checkout's
  `out/`. A guard over `out/` reds beside the copies it cannot stop, so `npm test` was aimed at
  `test/` instead (`scripts/unit-suite.ts`).
```

**Edited: `handbook/specs/orchestration.md`**, "Before the session ends", the first bullet becomes:

```
- **The scratchpad does not outlive the session.** Copy each lane's tools, and every plan not yet
  finished, to `out/scratch-<date>/` with a handover note of each lane's open items; a finished
  plan is already in `out/plans/`.
```

**Created: `handbook/plans/900/926/926-plan.md`**: this file, copied unchanged once the ruling is
folded.

Nothing else changes. `.github/workflows/ci.yml` is untouched: its `npm test -- --test-shard=...`
now reaches the launcher, which puts the flag before the pattern (T2).

## Tests, in the order they are written

All four new tests live in `test/repo/unit-suite.test.ts`; the walk test in
`test/repo/test-collection.test.ts`. Readings below are from the planner's probe,
`out/926-dry-run/probe.ts` (the launcher under test verbatim in `out/926-dry-run/launcher.ts`, its
stub and mutations switched by `VELLUM_926_ARM`), run as `node out/926-dry-run/probe.ts` at
f475d0f0 on Node v26.13.0, log `out/926-dry-run/probe.log`, each run about 0.2 s. These are unit
tests, so the readings are the planner's check that each assertion falls on the right side, not a
browser-check obligation.

**The stub (commit 1):** `scripts/unit-suite.ts` exactly as in Files, except that `unitArgs` returns
`["--import", "./test-support/source-read-guard.ts", "--test", "--test-timeout=600000", ...forwarded]`
(today's `npm test` argv, no pattern). `SUITE` is exported; the entry block is the real one.

**T1** `npm test runs the suites under test/ and none of a copied tree under out/, which node's own default collects`
- Control first (Gate 1 item 2): `runIn(COPY_UNDER_OUT, ["--test", TAP])`; `assert.deepEqual(control.ran, ["out/copy/test/c.test.ts", "out/test-d.ts", "test/a.test.ts", "test/sub/b.test.ts"], <message: node's own default no longer collects the copy, so the fixture carries no hazard, plus control.output>)`. Reading: exactly those four.
- Then `runIn(COPY_UNDER_OUT, [LAUNCHER, TAP])`: `assert.equal(run.status, 0, run.output)` and `assert.deepEqual(run.ran, ["test/a.test.ts", "test/sub/b.test.ts"], <message naming what ran: a copy of the tree under out/ runs as suites of its own on every local run>)`.
- Readings: planned `["test/a.test.ts","test/sub/b.test.ts"]`, status 0. Stub `["out/copy/test/c.test.ts","out/test-d.ts","test/a.test.ts","test/sub/b.test.ts"]`: RED on the second `deepEqual`.
- Mutation M1: delete the line `...(forwarded.some((arg) => !arg.startsWith("-")) ? [] : [SUITE]),` (reading = the stub's). Prover owes it.

**T2** `the shard flag ci.yml appends after npm test -- slices the suites under test/, one part per leg`
- `first = runIn(FOUR_SUITES, [LAUNCHER, TAP, "--test-shard=1/2"])`, `second = runIn(FOUR_SUITES, [LAUNCHER, TAP, "--test-shard=2/2"])`; `assert.deepEqual([first.ran, second.ran], [["test/a.test.ts", "test/c.test.ts"], ["test/b.test.ts", "test/d.test.ts"]], <message: a flag after the suite's pattern is read as a pattern and ignored, so every leg runs every file, or the slices count a file outside test/>)`.
- Readings: planned `[a, c]` and `[b, d]`. Stub `["out/copy/test/e.test.ts","test/b.test.ts","test/d.test.ts"]` and `["test/a.test.ts","test/c.test.ts"]`: RED.
- Mutation M2: move the `SUITE` line above `...forwarded,`. Reading `[]` and `[]` (the forwarded `--test-reporter=tap` is ignored too, so no TAP line prints): RED. M1 reds it as the stub does. Prover owes both.

**T3** `a path after npm test -- runs that path alone, as node's own patterns do` (written in commit 2)
- `runIn(COPY_UNDER_OUT, [LAUNCHER, TAP, "test/sub/b.test.ts"])`; `assert.deepEqual(run.ran, ["test/sub/b.test.ts"], <message: a named path no longer narrows the run. BLIND SPOT, declared, erring toward running more: a flag's value written as its own word (--test-reporter tap) reads as a path, so the run falls back to node's own collection, out/ included>)`.
- Readings: planned `["test/sub/b.test.ts"]`; the stub also passes (today's behaviour kept). The blind spot measured: `[LAUNCHER, "--test-reporter", "tap"]` ran all four of `COPY_UNDER_OUT`'s suites, `out/` included.
- Mutation M3: replace `...(forwarded.some((arg) => !arg.startsWith("-")) ? [] : [SUITE]),` with `SUITE,`. Reading `["test/a.test.ts","test/sub/b.test.ts"]`: RED. Prover owes it.

**T4** `a red suite reds npm test, since the launcher hands back the runner's exit status` (written in commit 2)
- `runIn(ONE_RED, [LAUNCHER, TAP])`; `assert.deepEqual(run.ran, ["red"], <the red suite never ran, plus output>)`, then `assert.equal(run.status, 1, <npm test exited N over a red suite, so CI reads a red run as green>)`.
- Readings: planned `["red"]`, status 1.
- Mutation M4: `process.exitCode = run.status ?? 1;` becomes `process.exitCode = 0;`. Reading status 0: RED. Prover owes it.

**W1** in `test/repo/test-collection.test.ts`: the test "the walk prunes node_modules and dot dirs at
every depth and nothing else, so it sees the tree node sees" becomes "the walk prunes node_modules
and dot dirs at every depth and the scratch out/ at the root alone, so it reads every tree an author
writes". Its seeded list gains `"src/out/w.ts"` and `"out/copy/test/z.test.ts"` (keeping every
existing entry, `"out/a.ts"` included), and its expected list becomes
`["design/d.ts", "dist/b.ts", "public/c.ts", "src/f.ts", "src/out/w.ts", "test/design/y.ts", "test/out/x.ts"]`.
- Red first: change the test before `prunedAtRoot` exists; it reds with `out/a.ts` and
  `out/copy/test/z.test.ts` in the actual list.
- Mutation M5: `walk(root, prunedAtRoot)` becomes `walk(root)` in `filesUnder` (the same red).
  Mutation M6: `pruned` gains `|| name === "out"` (prunes it at every depth): `src/out/w.ts` and
  `test/out/x.ts` vanish, RED. Prover owes both.

**P1** the re-aimed pin in `test/repo/e2e-tiers.test.ts`: change the expected string first and run
`node --test test/repo/e2e-tiers.test.ts` against the old `package.json` (RED: the old script
string), then edit `package.json` (green). Mutation M7: restore the old `test` script
(`node --import ./test-support/source-read-guard.ts --test --test-timeout=600000`). Prover owes it.

**P2** the re-aimed `test/repo/test-timeout.test.ts`: mutation M8: `"--test-timeout=600000"` becomes
`"--test-timeout=60000"` in `unitArgs` (RED: under the 300000 bound). Prover owes it.

**P3** the preload, held by the existing test "the guard watches a test file of this repo" in
`test/repo/source-read-guard.test.ts`, now reached through the launcher. Mutation M9: delete the
`"--import",` and `"./test-support/source-read-guard.ts",` lines from `unitArgs`, then run
`npm test -- test/repo/source-read-guard.test.ts` (RED: "the guard installed nothing in this
process"). Prover owes it, run through `npm test --`, never a bare `node --test`, which never loads
the preload.

Step 15 leaves to the implementer only a guard changed after the prover's round.

## Order of commits

1. `handbook/plans/900/926/926-plan.md` (this plan, unchanged), `scripts/unit-suite.ts` as the
   stub, `test/repo/unit-suite.test.ts` with its module scope, T1 and T2. Run
   `node --test test/repo/unit-suite.test.ts`: T1 and T2 red on their `deepEqual`, the readings
   above. Commit, push. CI is red at this commit on T1 and T2 alone, by design: that red is
   planned and is not a hand-back. Any other red on it is read as the implementer's definition
   says.
2. `unitArgs` gains the `SUITE` line: T1, T2 green. Add T3 and T4: green. Commit.
3. P1 red then green, `package.json`, P2. Run
   `npm test -- test/repo/unit-suite.test.ts test/repo/e2e-tiers.test.ts test/repo/test-timeout.test.ts test/repo/source-read-guard.test.ts`
   (through the launcher now): green. Commit.
4. W1 red, then `prunedAtRoot`, `walk`'s predicate, `filesUnder`: green. Then the two comments and
   the two renamed tests' names and messages. `node --test test/repo/test-collection.test.ts`
   green. Commit.
5. Doctrine: `handbook/specs/check-placement.md`, Gate 1 item 8, `scars.md`,
   `handbook/specs/orchestration.md`. `node --test test/repo/prose-paths.test.ts` green. Commit.

Then step 10's checks, the prover (commits first), the step 12 comment, the PR, the cold skeptic.

## Rosters and doctrine

- `package.json` `test`: pinned by `test/repo/e2e-tiers.test.ts` (P1); its timeout by
  `test/repo/test-timeout.test.ts` (P2). `git grep -n -F "source-read-guard.ts --test"` outside
  `handbook/plans/` finds only those two places at f475d0f0.
- No source-read roster: the new test reads no source file as text (it spawns the launcher and
  imports nothing from `src/`); `test-timeout.test.ts` imports `scripts/unit-suite.ts`, which is no
  read. `SOURCE_READS` in `test-support/source-read-list.ts` holds no entry for
  `test/repo/test-timeout.test.ts` or for `package.json` (grep at f475d0f0), so dropping that
  file's `package.json` read leaves no unused entry.
- No test pins the gate or spec prose rewritten here: `test/repo/footgun-gate.test.ts` and the hook
  key on the `## Gate N` headings, and `test/repo/prose-paths.test.ts` checks only that backticked
  paths resolve (every path the new prose backticks exists by the time commit 5 writes it).
- New `scripts/` file: reached by `tsconfig.json`'s `scripts/**/*.ts` and the lint's `TS_ROOTS`;
  its name is outside node's test family, so `test-collection.test.ts` passes it.
- Doctrine edited, each with its replacement written out under Files: `handbook/specs/check-placement.md`
  (new normative home of what `npm test` runs), Gate 1 item 8 (points there), `scars.md` (the
  incident), `handbook/specs/orchestration.md` (the naming caveat goes).
- Left as written, each still true: the `test-support/*.ts` header comments ("outside test/ so node
  --test does not collect it"), `scripts/lint/source-shape.ts`'s sibling-import message,
  `.claude/agents/vellum-guard-prover.md`'s whole-suite `node --test` (its sandbox is a fresh tree
  with an empty `out/`), the implementer's `npm test -- <file>` and `npm test -- --test-shard=<k>/<n>`
  (both kept, T2 and T3), `CLAUDE.md` and `.github/PULL_REQUEST_TEMPLATE.md` (`npm test` still names
  the unit suite).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- The targeted run in commit 3's command, then `node --test test/repo/test-collection.test.ts
  test/repo/prose-paths.test.ts`.
- The acceptance, folded into the one full local `npm test` step 10 owes, run only while
  `ps aux | grep -c '[r]emote-debugging-port'` reads 0: plant `out/926-evidence/test/planted.test.ts`
  and `out/926-evidence/test-planted.ts`, each `test("planted under out/", () => { throw new Error("planted"); })`;
  control `node --test out/926-evidence/` (exit 1, both reds name "planted under out/"); then
  `npm test > out/926-evidence.log 2>&1` with its real exit status (0) and
  `grep -c "planted under out/" out/926-evidence.log` (0); then remove `out/926-evidence/` and run
  `npm run astro:generate`. The PR body quotes the three readings.
- CI: the three `check & test k of 3` jobs' `ℹ tests` lines sum to the suite's total, and none of
  them equals that total (a leg running every file would). Quote all three in the body.
- No e2e suite is touched; none is run. `vellum-plate-reader` is not owed (no appearance).
- `vellum-guard-prover`: M1 to M9, unit tests only.

## Calls made

1. **A launcher, not a pattern in the script.** Rule: measure before you assert; fact 2 shows a
   trailing pattern swallows every forwarded flag, CI's shard included, silently; the launcher has
   the house precedent `"test:e2e": "node e2e/run.ts"`.
2. **The default is the glob `test/**/*.test.ts`, not the folder `test`.** Rule: fact 5 (the folder
   gains nothing) and fewer assumptions about Node versions `engines` allows.
3. **A non-flag argument replaces the default, so `npm test -- <path>` keeps narrowing.** Rule: the
   implementer's CI-red procedure and Issue #1009's proof command use that form; the one hole, a
   flag value written as its own word, falls back to today's behaviour and is named at T3 and in
   `handbook/specs/check-placement.md` as "write `--flag=value`".
4. **The issue's `package.json` and `test/`-folder trigger is not built.** Rule: the guard is keyed
   on what the defect looks like (Gate 7 item 2): what node collects, not a marker that collects
   nothing and that designer spikes carry by rule.
5. **The collection guards keep node's own default family as their predicate**, so a bare
   `node --test` (the guard prover's whole-suite run) and `npm test` collect the same set on a clean
   tree (fact 3), and only the root `out/` leaves their walk.
6. **The ENOENT tolerance stays**, its reason restated as `generated/`, which a sibling suite still
   removes mid-run.
7. **The normative home of "what `npm test` runs" is `handbook/specs/check-placement.md`** (it owns
   the unit suite instrument); Gate 1 item 8 points at it; the incident goes to `scars.md`; the
   gate's `Scars:` header line is left alone.
8. **A new test file, `test/repo/unit-suite.test.ts`,** mirroring the new script, rather than adding
   spawned-runner tests to `test-collection.test.ts`, which stays about the tree's shape.
9. **One pull request.**
10. **No merge-order constraint with the lanes beside it**: Issue #1009's, Issue #1017's, Issue
    #616's and Issue #1070's issue bodies name none of this plan's files (they name
    `test/repo/site-shape.test.ts`, `test/repo/comment-citation.test.ts`, `proof-runner.yml`,
    `test/repo/step-support.test.ts`, `.claude/agents/vellum-planner.md`, `handbook/errata/` and
    `handbook/specs/conventions.md`), and `grep "new ESLint"` finds nothing in
    `test-collection.test.ts` or `test-timeout.test.ts` and no ESLint construction in
    `e2e-tiers.test.ts`. Issue #1009's "Prove: `npm test -- test/repo/`" runs the same files before
    and after this merges.

## Rulings

One decision went to Alex: when the main checkout's `out/` holds files that node's own patterns
would collect, what `npm test` does. He ruled option 1 of three, "ignore them and pass"
(https://github.com/ahl-gram/Vellum/issues/926#issuecomment-6565858899, 2026-11-01): `npm test`
becomes the launcher above and looks only under `test/`, so nothing in `out/` runs or fails, and
one file, a slice, the whole suite and CI's three slices all keep working. The two options he did
not take are under Alternatives rejected. At the ruling the orchestrating session moved the two
collectable files out of the main checkout's `out/` to the Trash.

**Open decisions:** none.

## Stop conditions

Hand back, naming the plan line and the command's output, when:

- T1 or T2 passes on the stub, or T1's control does not list the two `out/` files: the nested runner
  is not collecting as measured (`NODE_TEST_CONTEXT` survived, or the seeded `package.json` is
  missing).
- Any reading on your machine differs from the readings above (the shard picks other files, TAP
  prints file names rather than test names, the blind-spot run does not fall back).
- `git grep -n -F "source-read-guard.ts --test"` or `git grep -n -E 'scripts\["test"\]|scripts\.test\b'`
  finds a reader of the `test` script beyond `package.json`, `test/repo/e2e-tiers.test.ts` and
  `test/repo/test-timeout.test.ts`.
- M9 does not red "the guard watches a test file of this repo" through `npm test --`, or that test
  reds without the mutation: the preload is not reaching the tests through the launcher.
- `test/repo/e2e-tiers.test.ts` passes 400 lines after the edit, or any function this plan edits
  passes 50.
- A clean-tree count differs: node's default pattern and `test/**/*.test.ts` give different file sets
  over your tree with `out/` empty (`fs.globSync`, both with `exclude: (n) => n === "node_modules"`).
- On CI, any `check & test k of 3` job's `ℹ tests` equals the whole suite's total, or the three do
  not sum to it.
- The full local `npm test` with the planted files reports "planted under out/" anywhere, or exits
  non-zero for any other reason you cannot tie to a known flake row.
- `.github/workflows/ci.yml`'s Test step is not exactly `npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}`
  when you start.
