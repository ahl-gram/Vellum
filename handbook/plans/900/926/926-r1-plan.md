# Issue #926 plan, revision 1: `npm test` runs the suites under `test/` alone

**Revision 1 of `handbook/plans/900/926/926-plan.md`** (sha256
b0c89cb1ac2fd2b5162371b172b47e65ee50d10483febb391fec4c1e6abec797, archived on the issue as comment
6565882796). It changes these things against that plan, and nothing else:

1. **P3 is withdrawn and replaced by T5.** The plan said the existing test "the guard watches a test
   file of this repo" in `test/repo/source-read-guard.test.ts` holds the launcher's preload (mutation
   M9). It does not: that file imports `watching` from `test-support/source-read-guard.ts`, whose
   `active` is computed at load from `process.argv[1]`, so the import alone turns the guard on in that
   file's own process. Measured at 81e64705: with the two preload lines dropped from `unitArgs`, the
   file reads 17 of 17 green, its unmutated control 17 of 17 too. No other file imports the guard
   (`git grep -l source-read-guard` names only `scripts/unit-suite.ts`,
   `test/repo/source-read-guard.test.ts` and `test/repo/unit-suite.test.ts`), so a launcher that drops
   the preload leaves every other test file unguarded with nothing red. On main the preload was held
   by `test/repo/e2e-tiers.test.ts`'s pin of the whole script string; the plan moved the preload into
   `unitArgs` and re-aimed that pin at `node scripts/unit-suite.ts`, which is where the hold was lost.
   T5, a new test in `test/repo/unit-suite.test.ts`, holds it by its outcome: every suite the launcher
   runs, the whole suite and a named path, runs after `test-support/source-read-guard.ts` has loaded.
   M9 reds it; a new mutation, M10, reds it on the named path alone.
2. **The M2 row is corrected.** M2 reds T1, T2, T4 and, with T5 written, T5, not T2 alone.
3. **T3's blind spot stays where the plan put it, in T3's assertion message, and the comment the
   build put above T3 comes out.** The plan's T3 line wrote the BLIND SPOT inside `<message: ...>`,
   the assertion's message, not a commit message as the hand-back read it.
4. **The `entriesOf` try/catch is proven**: two mutations, M11 and M12, named and run, each reds the
   test "the walk's recursion returns empty for a directory that is already gone, and still throws on
   any other failure" alone.
5. **Commits 1 to 5 are built and stand** on `fix/926-npm-test-ignores-out` at
   81e6470521017a6c72956c7d40abcc9c20e899f7; this revision adds commit 6 and the proof runs after it.
   Every other section below is the plan as it was, with its facts re-read at 81e64705 where a count
   moved.
6. **The acceptance run is taken once more after commit 6**, since the run at 81e64705 left no log
   and reported no count of the planted name (Evidence).

**Planned at:** `origin/main` d36a112d91dacbd1b517ceab68b641793d395f3c, Issue #926 comment count 2
(the rulings comment and the plan archive comment `Plan archive, not a ruling: 926-plan-20261102T000412Z.md`,
which the implementer does not count). The branch's merge base with main is 3791fb76; main then
gained d36a112d (Issue #1009, PR #1177), and
`git diff --stat f475d0f0 d36a112d -- scripts/unit-suite.ts test/repo/unit-suite.test.ts test/repo/test-collection.test.ts test/repo/test-timeout.test.ts test/repo/e2e-tiers.test.ts test/repo/source-read-guard.test.ts test-support/source-read-guard.ts test-support/source-read-list.ts package.json .github/workflows/ci.yml scripts/proof-runner/job.ts`
prints nothing. The blind-spot precedents this plan cites (`test/repo/e2e-sleep.test.ts`,
`test/repo/e2e-steps.test.ts`) moved in d36a112d and still carry their declarations there. Step 10
brings the branch current with `git merge origin/main`.

**Rulings:** https://github.com/ahl-gram/Vellum/issues/926#issuecomment-6565858899 (Alex,
2026-11-01, relayed by the orchestrating session): option 1, ignore files under `out/` and pass;
`npm test` becomes the launcher. This revision opens no new decision.

**Open decisions:** none.

**Ships as:** one pull request.

**Builds on:** branch `fix/926-npm-test-ignores-out`, head 81e6470521017a6c72956c7d40abcc9c20e899f7
on origin. Take it with `git fetch origin fix/926-npm-test-ignores-out`, then
`git checkout -B fix/926-npm-test-ignores-out origin/fix/926-npm-test-ignores-out`, each as its own
command, once the dispatcher says the tree that held it is retired.

## Specs

- `handbook/specs/check-placement.md`: The unit suite (whole section; this plan adds its first
  bullet), and the instrument table.
- `handbook/specs/conventions.md`: Where a rule lives (one normative home, the scars routing), How a
  spec is written (prescriptive voice, backticked paths are scanned, `Issue #N` form), How code is
  cited (`symbol` in `path`, lint-enforced in comments).
- `handbook/specs/rulebook.md`: Durable engineering constraints from shipped work, its first
  paragraph (the comment doctrine: a comment only where no test can practically pin the behaviour),
  which places T3's blind spot in its message.
- `handbook/specs/orchestration.md`: Before the session ends (the bullet this plan rewrites).
- `handbook/specs/development-workflow.md`: step 8 (archive the plan and its revision, failing test
  first, commit before you mutate), step 10 (name the checks that ran), step 11 (prover), step 12
  (calls comment), step 15 (a guard added after the prover's round is proven by the implementing
  session).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 2, 3 (assert the outcome, never the
  declaration), 8, 9, 10 (pin what reaches the spawn, not what the option builder returns), 14;
  Gate 7 item 3; Gate 5 before the push.

## Recon summary

`vellum-spec-recon` at f475d0f0: 0 comments (body only). Counts: CURRENT 8, STALE 4 (one of them a
new fact recon filed with the stale rows: the live files below), UNVERIFIABLE 1. Not re-run for this
revision: the issue holds no new comment but the plan archive, and the code files the plan names did
not move between f475d0f0 and d36a112d (the empty `git diff --stat` above). Each claim this revision adds is
read by a command at 81e64705, named where it is used.

- STALE, blocking, and it shaped the plan: the body's "check what `test/repo/test-collection.test.ts`
  already reads" implies the guard misses `out/`. It does not: its walk prunes only `node_modules`
  and dot segments, and its last test reds on any file node collects outside `test/`, `out/`
  included. Measured here: planting `out/926-w/test/x.test.ts` and `out/926-w/test-y.ts` in this tree
  and running `node --test test/repo/test-collection.test.ts` read `ℹ fail 1`, "2 file(s) node --test
  collects outside test/ (out/926-w/test-y.ts, out/926-w/test/x.test.ts)"; removing them read
  `ℹ pass 8`, `ℹ fail 0` (logs `out/926-witness-red.log`, `out/926-witness-green.log` in the first
  planner's tree). So a red already exists. What it cannot do is stop the runner collecting and
  running every copied suite beside it, which is the incident's cost.
- STALE, blocking: the body's idea keys a guard on a `package.json` or a `test/` folder under `out/`.
  A `package.json` alone collects nothing (recon's scratch run), `.claude/agents/vellum-designer.md`
  puts spikes with their own `package.json` under `out/` by rule, and the live instance had
  neither marker (next bullet).
- New fact at f475d0f0: the main checkout's `out/` held two files node's default pattern collects,
  `out/852-measure/test-values.ts` and `out/853-dry-run/final/engine/test-support-outline-places.ts`.
  Empty files planted at those two exact paths in the first planner's tree made
  `node --test test/repo/test-collection.test.ts` read `ℹ fail 1`; removed, `ℹ pass 8`, `ℹ fail 0`
  (logs `out/926-live-red.log`, `out/926-live-green.log`). At the ruling the orchestrating session
  moved both files to the Trash (the rulings comment).
- STALE, cosmetic: Gate 1 item 8 never names `out/`; only the orchestration bullet makes the link.
- UNVERIFIABLE: the 2026-10-09 and 2026-10-11 incidents (no log survives).
- From the hand-back, verified here: P3's premise is false (revision item 1, logs
  `out/926-r1-dry-run/m9-hole-control.log` and `out/926-r1-dry-run/m9-hole.log`), and M2's row was
  imprecise (revision item 2). Both changed the plan.

## The design

**`npm test` stops collecting the whole checkout and runs `test/**/*.test.ts` alone, through a
small launcher, `scripts/unit-suite.ts`, which loads `test-support/source-read-guard.ts` into every
suite, puts every argument after `npm test --` before the suite's pattern, and adds the pattern only
when no argument is a path.** `package.json`'s `test` becomes `node scripts/unit-suite.ts`. Whatever
sits in `out/` (or `dist/`, `generated/`, a copied tree anywhere) is never collected, so a copy is
inert and `npm test` stays green beside it. The collection guards in
`test/repo/test-collection.test.ts` keep their predicate (node's own default family), stop reading the
scratch `out/` at the repo root, and their names and messages are rewritten for the new split:
`npm test` never runs a suite outside `test/` or under another name, and a bare `node --test` would
still run a helper so placed as a phantom pass.

**The preload is held by its outcome, in a seeded tree (T5).** The seeded tree's
`test-support/source-read-guard.ts` is a stand-in that sets a mark on `globalThis`, and its one suite
names its own test by whether the mark is present. A bare `node --test` reads "without the preload"
(the control, so the fixture can see the case); the launcher must read "after the preload" on the
whole suite and on a named path. The named arm is what sees a preload placed after the forwarded
arguments, since node then reads `--import` and the module's path as two more patterns (fact 2,
measured again as M10).

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
   The same holds for a node option: `--import <module>` after the first positional is two patterns
   (M10's reading below).
3. On a clean tree the new pattern collects exactly what node's default does: `fs.globSync` with
   node's default pattern and with `test/**/*.test.ts`, both excluding `node_modules`, `out` and dot
   names, give equal file sets (symmetric difference empty; 398 files each at f475d0f0, 399 each at
   81e64705).
4. npm runs a script's forwarded arguments after its text, and `pretest` gets none of them (scratch
   package: `npm test -- --test-shard=1/2` and `npm test -- test/repo/` both ran `pretest` first;
   a `pretest` exiting 1 stopped `test`, exit 1). `npm config get ignore-scripts` reads `false`; no
   `.npmrc` in the repo.
5. A folder argument (`node --test test`) collects the same four suites as the glob and NOT
   `test/helper.ts`: Node 26.13 expands a folder to `<folder>/` plus its default pattern, so a helper
   directly under `test/` is dropped either way.
6. A nested `node --test` that inherits `NODE_TEST_CONTEXT` skips every file and exits 0 (recorded
   in `handbook/plans/700/779/779-part2i-plan.md`; `test/repo/test-timeout.test.ts` deletes it).
7. `test-support/source-read-guard.ts` turns itself on in any process whose `process.argv[1]` is a
   `.test.ts` under the repo's `test/` (its `active`), so a test file that imports it is guarded with
   or without the launcher's `--import`; only `test/repo/source-read-guard.test.ts` imports it. The
   runner hands its `--import` to each suite's process: the children of a running `npm test` carry
   `--import ./test-support/source-read-guard.ts` (`ps aux`, 2026-11-01), and T5's whole arm reads
   "after the preload" through the launcher.
8. A preload path that resolves to no file fails every run loudly:
   `node --import ./test-support/no-such-guard.ts --test --test-reporter=tap test/repo/format.test.ts`
   exited 1 with `ERR_MODULE_NOT_FOUND` (log `out/926-r1-dry-run/missing-preload.log`). So T5's
   stand-in, which cannot see the real guard's file, misses only a rename of it, and that miss is a
   red on every run, not a silent pass.

### Alternatives rejected

- **The pattern appended to the `test` script** (`... --test-timeout=600000 'test/**/*.test.ts'`),
  with `ci.yml` calling `node` itself: fact 2. Every `npm test -- <flag>` would be silently ignored
  and every `npm test -- <path>` would run the whole suite too.
- **The folder `test` as the default instead of the glob**: fact 5 shows it gains nothing (the
  phantom-pass arm is lost either way), and it rests on Node's folder expansion, seen in 26.13's
  `createTestFileList` and unverified on the Node 24 `engines` allows.
- **A guard keyed on a `package.json` or a `test/` folder under `out/`** (the issue's idea): recon
  rows above. A `package.json` breaks nothing, designer spikes carry one by rule, and the live
  instance was two by-name files with neither marker.
- **A new guard alone** (the issue's idea in its strongest form): the existing last test of
  `test-collection.test.ts` already reds on every such file (witness above). Another red cannot stop
  the runner collecting the copies; it lands beside their own results.
- **Refuse to start** (a `pretest` script naming the `out/` folders to trash, collection
  unchanged; the menu's option 3): ruled out by Alex (the rulings comment).
- **Aim the runner and still red at the end** (the walk keeps reading `out/`; the menu's option 2):
  ruled out by Alex (the rulings comment).
- **Words only** (more prose in `handbook/specs/orchestration.md`): the rule already exists in
  words, the issue's incidents happened under it, and the main checkout broke it on the day this was
  planned.
- **A preload that rewrites `process.argv`, `NODE_OPTIONS=--test-shard`, or an `${VAR:+...}` shell
  expansion in the script**: each reaches the same order by a mechanism no test here reads, against
  "Prefer the boring, obvious solution"; the launcher has a house precedent (`"test:e2e": "node
  e2e/run.ts"`, pinned by `test/repo/e2e-tiers.test.ts`).
- **The preload held by "the guard watches a test file of this repo"** (the first plan's P3): fact 7;
  that test holds the guard's own switch, and stays as it is for that.
- **The preload held by reading `unitArgs([])`** (the prover's first suggestion, asserting
  `--import ./test-support/source-read-guard.ts` ahead of `--test`): Gate 1 item 3 (assert the
  outcome, never the declaration) and item 10 (pin what reaches the spawn, not what the option builder
  returns). It also asks the wrong order: the constraint is ahead of the first positional (fact 2),
  and `unitArgs([])` has no positional, so it cannot see M10.
- **The child's `process.execArgv` named in T1's suites** (the prover's second suggestion): reads an
  argument list, not whether the module ran in the suite's process; T1's names and its control list
  would change with it; and it would need a named-path arm T1 does not have. T5 reads the outcome in
  a test of its own.
- **A test in this repo asserting its own process carries the preload** (`process.execArgv`, or a
  mark the real guard sets): it reds under a bare `node --test`, which is how `vellum-guard-prover`
  runs a file and how the proof runner runs one (`scripts/proof-runner/job.ts` spawns `--test` with
  no `--import`).

## Files

Commits 1 to 5 built every file below except where "Revision 1" says otherwise; each is described as
it stands at 81e64705, so the plan reads as one design.

**Created: `scripts/unit-suite.ts`** (18 lines at 81e64705), exactly, unchanged by revision 1:

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

No comment: the five tests below pin every behaviour in it. The entry guard is the house form
(`scripts/clean-generated.ts`), so importing the module from a test runs nothing.

**Created: `test/repo/unit-suite.test.ts`** (101 lines at 81e64705, about 125 after revision 1):
tests T1 to T5 below, over trees seeded with `mkdtempSync` under `tmpdir()`, never the repo's own
`out/`. Its module scope at 81e64705 (formatted by `npm run format`; the text below is its content):

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

**Revision 1's edits to `test/repo/unit-suite.test.ts`**, three, and nothing else in the file:

1. Directly after the `ONE_RED` declaration, add the fixture (`runIn` spreads `files` after its own
   seeds, so this stand-in replaces the empty `test-support/source-read-guard.ts` for T5 alone):

   ```ts
   const PRELOAD_SEEN = {
     "test-support/source-read-guard.ts": "Object.assign(globalThis, { vellumPreload: true });\n",
     "test/a.test.ts": `import { test } from "node:test";\ntest("vellumPreload" in globalThis ? "after the preload" : "without the preload", () => {});\n`,
   };
   ```

2. Delete the comment line directly above T3's `test(` call, the one line beginning
   `// BLIND SPOT, declared, erring toward running more:`. T3's `assert.deepEqual` message becomes:

   ```ts
   `a named path no longer narrows the run, which ran ${run.ran.join(", ")}. BLIND SPOT, declared, erring toward running more: a flag's value written as its own word (--test-reporter tap) reads as a path, so the run falls back to node's own collection, out/ included`
   ```

   T3's name, its call and its expected list are unchanged.

3. After T4, at the end of the file, add T5 exactly:

   ```ts
   test("every suite npm test runs, the whole suite or a named path, loads test-support/source-read-guard.ts first, which a bare node --test never does", () => {
     const control = runIn(PRELOAD_SEEN, ["--test", TAP]);
     assert.deepEqual(
       control.ran,
       ["without the preload"],
       `a bare node --test already loads the seeded preload (an --import reaching it from the environment), so this fixture cannot tell a launcher that drops it:\n${control.output}`,
     );
     const whole = runIn(PRELOAD_SEEN, [LAUNCHER, TAP]);
     const named = runIn(PRELOAD_SEEN, [LAUNCHER, TAP, "test/a.test.ts"]);
     assert.deepEqual(
       [whole.ran, named.ran],
       [["after the preload"], ["after the preload"]],
       `npm test ran a suite without test-support/source-read-guard.ts loaded first, so the source-read guard watches no read in it:\n${whole.output}\n${named.output}`,
     );
   });
   ```

Then `npm run format`, until `npm run format:check` passes.

**Edited: `package.json`** (built): `"test": "node scripts/unit-suite.ts"`. Nothing else in the file.

**Edited: `test/repo/e2e-tiers.test.ts`** (built, 396 lines): in the test "ci.yml shards the unit
suite across a matrix of 1 to N, and every leg runs its own slice, so no test file is dropped", the
`assert.equal` on `pkg.scripts["test"]` expects `"node scripts/unit-suite.ts"`, with the message
"npm test no longer runs the unit launcher, so the shard flag ci.yml appends can land after the
suite's pattern, where node --test reads it as one more pattern and every leg runs every file". The
`ci.yml` step regex in the same test is unchanged, as is `.github/workflows/ci.yml`. The preload half
of the old pin's message moved to T5.

**Edited: `test/repo/test-timeout.test.ts`** (built): the test "npm test passes --test-timeout at or
above the bound" reads `unitArgs([]).join(" ")` instead of the script string; `readFileSync` left
the `node:fs` import.

**Edited: `test/repo/test-collection.test.ts`** (built, 226 lines): the comment above `const ROOT`
and the comment above `entriesOf` rewritten as the first plan gave them; `prunedAtRoot` after
`pruned`; `walk` takes the predicate, defaulting to `pruned`; `filesUnder` walks with
`prunedAtRoot`; the walk test renamed and widened (W1); the two last tests renamed and their
messages rewritten. Revision 1 changes nothing in this file.

**Edited (built): `handbook/specs/check-placement.md`** (the new first bullet of "## The unit
suite"), **`.claude/skills/vellum-footguns/SKILL.md`** (Gate 1 item 8),
**`.claude/skills/vellum-footguns/references/scars.md`** (the Issue #926 bullet after "- Later,
#562:"), **`handbook/specs/orchestration.md`** ("Before the session ends", first bullet), each with
the wording the first plan wrote out. Revision 1 changes none of them: no doctrine names how the
preload is loaded or what holds it.

**Created (built): `handbook/plans/900/926/926-plan.md`**, the first plan, frozen.

**Created by revision 1: `handbook/plans/900/926/926-r1-plan.md`**: this file, copied unchanged
from the scratchpad, never over a file already on the branch.

Nothing else changes. `.github/workflows/ci.yml` is untouched: its `npm test -- --test-shard=...`
reaches the launcher, which puts the flag before the pattern (T2).

## Tests, in the order they are written

T1 to T5 live in `test/repo/unit-suite.test.ts`; W1 in `test/repo/test-collection.test.ts`. These are
unit tests, so the readings are the planner's check that each assertion falls on the right side, not
a browser-check obligation.

**Where the readings come from.** T1 to T4's first readings are the first planner's, probe
`out/926-dry-run/probe.ts`, log `out/926-dry-run/probe.log`, at f475d0f0. Every reading marked r1 is
this revision's, taken in the revision planner's tree detached at 81e64705 on Node v26.13.0, after
waiting for another lane's full suite to finish: the probe `out/926-r1-dry-run/unit-suite.test.ts`
is the branch's file with revision 1's edits 2 and 3 applied, and three differences that change
nothing it reads: T5's fixture sits just above T5, T5's control message is worded "the seeded suite
reads a preload that a bare node --test never loads, so the fixture cannot see a launcher that drops
it" (edit 3's wording replaced it after the readings), and `LAUNCHER` is read from
`VELLUM_926_LAUNCHER` when set; each mutant is a copy of `scripts/unit-suite.ts` at 81e64705 that
`diff` shows differs only by its mutation, `out/926-r1-dry-run/launcher-<m>.ts`. Command:
`VELLUM_926_LAUNCHER=<absolute path of the mutant> node --test out/926-r1-dry-run/unit-suite.test.ts`,
logs `out/926-r1-dry-run/matrix-<control|m1|m2|m3|m4|m9|m10>.log`. Each seeded run took about 0.2 s
and T5 about 0.5 s. The same five tests staged over the tracked file read 5 of 5 through
`npm test -- test/repo/unit-suite.test.ts` and 5 of 5 through a bare `node --test` (logs
`out/926-r1-dry-run/in-place-npm-test.log`, `out/926-r1-dry-run/in-place-bare.log`); the tracked file
was restored after. The `out/926-r1-dry-run/` folder goes to the main checkout's `out/` when the
dispatcher retires the revision planner's tree.

**The stub (commit 1, built):** `scripts/unit-suite.ts` with `unitArgs` returning
`["--import", "./test-support/source-read-guard.ts", "--test", "--test-timeout=600000", ...forwarded]`.

**T1** `npm test runs the suites under test/ and none of a copied tree under out/, which node's own default collects` (built)
- Control first: `runIn(COPY_UNDER_OUT, ["--test", TAP])` lists exactly
  `["out/copy/test/c.test.ts", "out/test-d.ts", "test/a.test.ts", "test/sub/b.test.ts"]`. Then the
  launcher: status 0 and `["test/a.test.ts", "test/sub/b.test.ts"]`.
- Readings: planned as above; the stub lists all four: RED on the second `deepEqual`.

**T2** `the shard flag ci.yml appends after npm test -- slices the suites under test/, one part per leg` (built)
- `[first.ran, second.ran]` equals `[["test/a.test.ts", "test/c.test.ts"], ["test/b.test.ts", "test/d.test.ts"]]`.
- Readings: planned as above; the stub `["out/copy/test/e.test.ts","test/b.test.ts","test/d.test.ts"]`
  and `["test/a.test.ts","test/c.test.ts"]`: RED.

**T3** `a path after npm test -- runs that path alone, as node's own patterns do` (built; revision 1 edit 2 moves its blind spot into its message)
- `runIn(COPY_UNDER_OUT, [LAUNCHER, TAP, "test/sub/b.test.ts"])`; `assert.deepEqual(run.ran, ["test/sub/b.test.ts"], <the message in revision 1 edit 2>)`.
- The blind spot, measured r1: `[LAUNCHER, "--test-reporter", "tap"]` over `COPY_UNDER_OUT` exited 0
  and ran `["out/copy/test/c.test.ts","out/test-d.ts","test/a.test.ts","test/sub/b.test.ts"]`
  (probe `out/926-r1-dry-run/blind-spot.ts`, run as `node out/926-r1-dry-run/blind-spot.ts`, log
  `out/926-r1-dry-run/blind-spot.log`). The house writes a declared blind spot into the assertion's
  message, where it prints at the red: `BLIND_SPOT` in `test/repo/e2e-sleep.test.ts`, `BLIND_SPOTS`
  in `test/repo/source-read-guard.test.ts`, the declaration in `test/repo/e2e-steps.test.ts`.

**T4** `a red suite reds npm test, since the launcher hands back the runner's exit status` (built)
- `ran` equals `["red"]`, then status 1.

**T5** `every suite npm test runs, the whole suite or a named path, loads test-support/source-read-guard.ts first, which a bare node --test never does` (revision 1, edit 3)
- Control, `runIn(PRELOAD_SEEN, ["--test", TAP])`: `["without the preload"]`. Then
  `[whole.ran, named.ran]` equals `[["after the preload"], ["after the preload"]]`.
- Readings r1: control `["without the preload"]`; launcher `[["after the preload"], ["after the preload"]]`, green (`matrix-control.log`).
- No stub commit: the preload exists at 81e64705, and a stub launcher dropping it would push a commit
  on which every suite runs unguarded. T5's red is M9's, run in place after commit 6 (below).

**W1** in `test/repo/test-collection.test.ts` (built): "the walk prunes node_modules and dot dirs at
every depth and the scratch out/ at the root alone, so it reads every tree an author writes", as the
first plan gave it.

**P1** the re-aimed pin in `test/repo/e2e-tiers.test.ts` (built). **P2** the re-aimed
`test/repo/test-timeout.test.ts` (built).

**P3 is withdrawn** (revision item 1). "the guard watches a test file of this repo" stays as it is
in `test/repo/source-read-guard.test.ts`: it holds the guard's own switch (fact 7), not the launcher.

### The mutation ledger

Each launcher mutation is BY LINE in `scripts/unit-suite.ts`. "Reds" lists every test the mutation
turns red; a red not named is IMPRECISE. Readings r1 unless marked.

| row | the edit | reds | readings under it |
|---|---|---|---|
| M1 | delete the line `...(forwarded.some((arg) => !arg.startsWith("-")) ? [] : [SUITE]),` | T1, T2 | T1 `["out/copy/test/c.test.ts","out/test-d.ts","test/a.test.ts","test/sub/b.test.ts"]`; T2 `[["out/copy/test/e.test.ts","test/b.test.ts","test/d.test.ts"],["test/a.test.ts","test/c.test.ts"]]`; T5 stays green |
| M2 | move that same line to directly above `...forwarded,` | T1, T2, T4, T5 | T1 `[]`; T2 `[[],[]]`; T4 `[]`; T5 `[[],["after the preload"]]` (the forwarded `--test-reporter=tap` lands after the pattern, so no TAP line prints); T3 stays green |
| M3 | replace that same line with `SUITE,` | T3 | T3 `["test/a.test.ts","test/sub/b.test.ts"]` |
| M4 | `process.exitCode = run.status ?? 1;` becomes `process.exitCode = 0;` | T4 | T4 status 0 |
| M5 | `walk(root, prunedAtRoot)` becomes `walk(root)` in `filesUnder` | W1 | the prover at 81e64705 |
| M6 | `pruned` gains `\|\| name === "out"` (the source edit is a plain double pipe; the backslashes are this table's escape) | W1 | the prover at 81e64705 |
| M7 | restore the old `test` script in `package.json` | P1 | the prover at 81e64705 |
| M8 | `"--test-timeout=600000"` becomes `"--test-timeout=60000"` in `unitArgs` | P2 | the prover at 81e64705 |
| M9 | delete the two lines `"--import",` and `"./test-support/source-read-guard.ts",` | T5 | T5 `[["without the preload"],["without the preload"]]`; T1 to T4 stay green |
| M10 | move those two lines to directly after `...forwarded,` | T3, T5 | T3 `["test-support/source-read-guard.ts","test/sub/b.test.ts"]`; T5 `[["after the preload"],["test-support/source-read-guard.ts","without the preload"]]`, so only the named arm sees it |
| M11 | in `entriesOf` in `test/repo/test-collection.test.ts`, delete the line `if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];` | "the walk's recursion returns empty for a directory that is already gone, and still throws on any other failure" | `Error: ENOENT: no such file or directory, scandir '<tmp>/vanish'`; the other 7 pass |
| M12 | in `entriesOf`, `throw e;` becomes `return [];` | the same test | `AssertionError [ERR_ASSERTION]: Missing expected exception.`; the other 7 pass |

M11 and M12 readings: copies of `test/repo/test-collection.test.ts` at 81e64705 at the same depth,
`out/926-r1-dry-run/test-collection-<control|m11|m12>.test.ts`, run as
`node --test out/926-r1-dry-run/test-collection-<arm>.test.ts`: control 8 of 8 (log
`out/926-r1-dry-run/enoent-control.log`), M11 and M12 7 of 8 (logs `out/926-r1-dry-run/enoent-m11.log`,
`out/926-r1-dry-run/enoent-m12.log`). The `entriesOf` comment's direction (tolerating ENOENT errs
toward missing a name in a tree that vanished mid-walk) is the argued half; M11 and M12 prove the
tolerance is exactly ENOENT, no wider and no narrower.

**Who proves what.** `vellum-guard-prover` spent its one round at 81e64705 (workflow step 15) and
its ledger stands for M1, M3 to M8 at that sha. Everything below is the implementing session's, in
place, after commit 6 is committed and pushed, each run as `node --test <file>` and each restored
with `git checkout -- <file>`: M1, M2, M3, M4, M9 and M10 over `test/repo/unit-suite.test.ts` (T5 is a
guard the prover never saw, T3's message changed after its round, and M2's row is corrected, so the
whole launcher matrix is re-read at the final sha), and M11 and M12 over
`test/repo/test-collection.test.ts`. The PR body's guard table pastes each red line and names these
rows as proven by the implementing session only.

## Order of commits

1 to 5. Built at 81e64705, as the first plan ordered them: the plan, the stub and T1, T2 red; the
   `SUITE` line, T3, T4; P1, `package.json`, P2; W1 and the collection guard's edits; the doctrine.
6. `handbook/plans/900/926/926-r1-plan.md` (this file, unchanged) and revision 1's three edits to
   `test/repo/unit-suite.test.ts`. `npm run format`, then run `node --test test/repo/unit-suite.test.ts`
   (5 pass) and `npm test -- test/repo/unit-suite.test.ts test/repo/source-read-guard.test.ts`
   (22 pass; read r1 with the five tests staged over the tracked file, log
   `out/926-r1-dry-run/in-place-combined.log`). Commit, push.
7. The proof runs of the ledger above, in place, one at a time, each restored before the next;
   `git status --porcelain` prints nothing after the last.

Then step 10's checks, the step 12 comment (the unposted draft at
/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4975255b-409a-4a29-92b7-cae569d5b799/scratchpad/926-calls-comment.md
gains Calls made 11 to 15 below and names this revision), the PR (its body names
`handbook/plans/900/926/926-r1-plan.md` and the five changes it makes against the first plan, from
this file's opening), the cold skeptic.

## Rosters and doctrine

- `package.json` `test`: pinned by `test/repo/e2e-tiers.test.ts` (P1); its timeout by
  `test/repo/test-timeout.test.ts` (P2); its preload by T5.
- No source-read roster: `test/repo/unit-suite.test.ts` reads no source file as text (it spawns the
  launcher and writes a seeded tree; T5 adds no read); `test-timeout.test.ts` imports
  `scripts/unit-suite.ts`, which is no read. `SOURCE_READS` in `test-support/source-read-list.ts`
  holds no entry for either.
- No test pins the gate or spec prose the build rewrote: `test/repo/footgun-gate.test.ts` and the
  hook key on the `## Gate N` headings, and `test/repo/prose-paths.test.ts` checks only that
  backticked paths resolve.
- New `scripts/` file: reached by `tsconfig.json`'s `scripts/**/*.ts` and the lint's `TS_ROOTS`;
  its name is outside node's test family, so `test-collection.test.ts` passes it.
- Doctrine edited (built): `handbook/specs/check-placement.md` (the normative home of what `npm test`
  runs), Gate 1 item 8 (points there), `scars.md` (the incident), `handbook/specs/orchestration.md`
  (the naming caveat goes). Revision 1 adds no doctrine.
- Left as written, each still true: the `test-support/*.ts` header comments, `scripts/lint/source-shape.ts`'s
  sibling-import message, `.claude/agents/vellum-guard-prover.md`'s whole-suite `node --test`, the
  implementer's `npm test -- <file>` and `npm test -- --test-shard=<k>/<n>` (T2, T3),
  `test/repo/source-read-guard.test.ts` (fact 7), `CLAUDE.md` and
  `.github/PULL_REQUEST_TEMPLATE.md`.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, after commit 6.
- The targeted runs in commit 6's line.
- The acceptance, re-taken once after commit 6, folded into the one full local `npm test` step 10
  owes, and run only while `ps aux | grep -c '[r]emote-debugging-port'` reads 0 and no other lane's
  suite is running: plant `out/926-evidence/test/planted.test.ts` and `out/926-evidence/test-planted.ts`,
  each `test("planted under out/", () => { throw new Error("planted"); })`; control
  `node --test out/926-evidence/` (exit 1, both reds name "planted under out/"); then
  `npm test > out/926-evidence.log 2>&1` with its real exit status (0) and
  `grep -c "planted under out/" out/926-evidence.log` (0); then remove `out/926-evidence/` and run
  `npm run astro:generate`. The PR body quotes the three readings with the sha they were taken at.
  It is re-taken because the run at 81e64705 (control exit 1; `npm test` exit 0, `tests 3495, pass
  3495, fail 0`, the hand-back) reported no count of the planted name, and its log is in neither the
  implementer's tree's `out/` nor the scratchpad (`ls`, 2026-11-01).
- CI: the three `check & test k of 3` jobs' `ℹ tests` lines sum to the suite's total, and none of
  them equals that total. Quote all three in the body.
- No e2e suite is touched; none is run. `vellum-plate-reader` is not owed (no appearance).
- The ledger above: the prover's rows at 81e64705, and the implementing session's rows after
  commit 6.

## Calls made

1. **A launcher, not a pattern in the script.** Rule: measure before you assert; fact 2 shows a
   trailing pattern swallows every forwarded flag, CI's shard included, silently; the launcher has
   the house precedent `"test:e2e": "node e2e/run.ts"`.
2. **The default is the glob `test/**/*.test.ts`, not the folder `test`.** Rule: fact 5 (the folder
   gains nothing) and fewer assumptions about Node versions `engines` allows.
3. **A non-flag argument replaces the default, so `npm test -- <path>` keeps narrowing.** Rule: the
   implementer's CI-red procedure and Issue #1009's proof command use that form; the one hole, a
   flag value written as its own word, falls back to today's behaviour and is named in T3's message
   and in `handbook/specs/check-placement.md` as "write `--flag=value`".
4. **The issue's `package.json` and `test/`-folder trigger is not built.** Rule: the guard is keyed
   on what the defect looks like (Gate 7 item 2): what node collects, not a marker that collects
   nothing and that designer spikes carry by rule.
5. **The collection guards keep node's own default family as their predicate**, so a bare
   `node --test` and `npm test` collect the same set on a clean tree (fact 3), and only the root
   `out/` leaves their walk.
6. **The ENOENT tolerance stays**, its reason restated as `generated/`, which a sibling suite still
   removes mid-run; M11 and M12 prove it.
7. **The normative home of "what `npm test` runs" is `handbook/specs/check-placement.md`**; Gate 1
   item 8 points at it; the incident goes to `scars.md`; the gate's `Scars:` header line is left
   alone.
8. **A new test file, `test/repo/unit-suite.test.ts`,** mirroring the new script, rather than adding
   spawned-runner tests to `test-collection.test.ts`, which stays about the tree's shape.
9. **One pull request.**
10. **No merge-order constraint with the lanes beside it** (Issue #1009's, Issue #1017's, Issue
    #616's and Issue #1070's bodies name none of this plan's files).
11. **The preload is held by its outcome in a seeded tree (T5), with a bare-run control and a
    named-path arm.** Rule: Gate 1 item 3 (assert the outcome, never the declaration), item 10 (pin
    what reaches the spawn, not what the option builder returns) and item 2 (the control shows the
    fixture can see the case); M10 is the reading that keeps the named arm.
12. **"the guard watches a test file of this repo" is left unchanged.** Rule: fact 7; it holds the
    guard's own switch, which the launcher does not decide.
13. **P2 keeps reading `unitArgs([])` for the timeout.** Rule: the entry block hands `unitArgs`'s
    output whole to the spawn, and T1 to T5 pin that it does by what the spawned runner does (M9 and
    M1 each red a test), so the builder's timeout is the spawned run's timeout.
14. **T3's blind spot goes in its assertion message, and the build's comment above T3 comes out.**
    Rule: the comment doctrine (`handbook/specs/rulebook.md`, Durable engineering constraints: a
    comment only where no test can practically pin the behaviour; the fallback is a run a test makes,
    measured above) and the house form for a declared blind spot, a message that prints at the red
    (`test/repo/e2e-sleep.test.ts`, `test/repo/e2e-steps.test.ts`,
    `test/repo/source-read-guard.test.ts`). The measurement behind it lives in this plan, not in the
    code.
15. **T5 and the re-read rows are proven by the implementing session, not a second prover round,
    and the acceptance is re-taken once after commit 6.** Rule: workflow step 15 (one prover round
    per pull request; a guard added after it is proven by the implementing session and named so) and
    step 10 (an output file is evidence only of the run that wrote it, and the 81e64705 run left no
    log and no count of the planted name).

## Rulings

One decision went to Alex: when the main checkout's `out/` holds files that node's own patterns
would collect, what `npm test` does. He ruled option 1 of three, "ignore them and pass"
(https://github.com/ahl-gram/Vellum/issues/926#issuecomment-6565858899, 2026-11-01): `npm test`
becomes the launcher above and looks only under `test/`, so nothing in `out/` runs or fails, and
one file, a slice, the whole suite and CI's three slices all keep working. Revision 1 opens no
decision: it restores a hold the first plan lost and corrects two rows.

**Open decisions:** none.

## Stop conditions

Hand back, naming the plan line and the command's output, when:

- `git ls-remote origin refs/heads/fix/926-npm-test-ignores-out` prints a head other than
  81e6470521017a6c72956c7d40abcc9c20e899f7 when you start, or the branch's
  `test/repo/unit-suite.test.ts` does not carry the comment line beginning
  `// BLIND SPOT, declared, erring toward running more:` directly above T3.
- T5's control does not read `["without the preload"]`, or T5 is red with no mutation.
- M9 or M10 leaves T5 green, or any row of the ledger reds a test the row does not name, or leaves
  green a test it names.
- M11 or M12 leaves "the walk's recursion returns empty for a directory that is already gone, and
  still throws on any other failure" green, or reds any other test in the file.
- `npm test -- test/repo/unit-suite.test.ts test/repo/source-read-guard.test.ts` reads anything but
  22 pass, 0 fail.
- `git grep -n -F "source-read-guard.ts --test"` or `git grep -n -E 'scripts\["test"\]|scripts\.test\b'`
  finds a reader of the `test` script beyond `test/repo/e2e-tiers.test.ts`, or `git grep -l
  source-read-guard -- test test-support scripts e2e package.json .github` names a file beyond
  `scripts/unit-suite.ts`, `test/repo/source-read-guard.test.ts` and `test/repo/unit-suite.test.ts`.
- `test/repo/unit-suite.test.ts` passes 400 lines after the edit, or any function this plan edits
  passes 50.
- On CI, any `check & test k of 3` job's `ℹ tests` equals the whole suite's total, or the three do
  not sum to it.
- `.github/workflows/ci.yml`'s Test step is not exactly `npm test -- --test-shard=${{ matrix.shard }}/${{ strategy.job-total }}`
  when you start.
- The full local `npm test` with the planted files reports "planted under out/" anywhere, or exits
  non-zero for any other reason you cannot tie to a known flake row.
