# Issue #838: the CI proof runner, plan

Written 2026-10-09 at main `26709a42` by the Issue #838 lane, branch `chore/838-ci-proof-runner`; main has since moved to `e53c5de0` (PR for Issue #837, founding word data only, touching none of the files below), and the branch merges `origin/main` before the pull request opens. Alex's rulings: https://github.com/ahl-gram/Vellum/issues/838#issuecomment-6093127501 (1: built now, beside Issue #779 part 2f-home; 2: a lane builds it, the orchestrating session merges it; 3: the orchestrator, the lanes and their review agents may dispatch it, capped so it always leaves room for a pull request's seven CI jobs within the concurrent-job limit; 4: one list of patches on one throwaway branch, one patch per job on a clean checkout, a patch that does not apply reported and never skipped). The proof procedure it accelerates: `handbook/plans/779/779-part2f-pages-plan.md` ("The rule this round applies", "Procedure" items 2 to 4), the `vellum-guard-prover` definition, `handbook/specs/orchestration.md` (Merging), and Issue #779 comment 6090198881 (a stop on the named check's own read counts as that check failing). File names below are PROPOSED and are Alex's to name (`vellum-footguns`, Defaults); the menu at the end carries them.

## Rulings on this plan's menu

https://github.com/ahl-gram/Vellum/issues/838#issuecomment-6096317235 (Alex, 2026-10-09, relayed): A, the "proof-runner" names as proposed; B, lint proofs are built NOW (against the recommendation), so the lint kind below is in this pull request and in Run A; C, the runner's scripts are proven before the merge by running them locally against scratch copies through every verdict, and the first dispatch from main proves the workflow file, a failure there meaning a follow-up fix before part 2g; D, neither review agent's definition changes, and a review agent that wants a run hands its list to its dispatcher; E, exact match only. The calls below stand for Alex to overrule in the calls comment. The sequencing pointer is comment 6093536530. The rest of this file is the plan as the step 6 report left it.

## What recon changed

Recon (ledger `838-recon-ledger.md`, 2026-10-09 at `26709a42`): of its 26 rows, 14 CURRENT, 5 STALE, 5 UNVERIFIABLE, and 2 split (CURRENT for GitHub's documented limit and for the token's `workflow` scope, UNVERIFIABLE for which plan the account is on and whether the harness lets a lane write a workflow file). What moved this plan:

- **Sequencing**: Issue #779 comment 6093191801 (Alex, eight minutes after ruling 1) holds part 2g until BOTH part 2f's home pull request and this runner have merged, so this issue is on part 2's critical path and ruling 1's "part 2 does not pause" is superseded. The #838 thread does not say so; the dispatcher may want to post recon's one-line pointer.
- **Proving before merge (recon D1)**: a `workflow_dispatch` run triggers only for a workflow file on the default branch. The plan's registration step below is the answer, measured first; if GitHub refuses both routes, the runner cannot prove itself before it merges, which is a STOP for Alex (menu item C).
- **Unit and lint (D3)**: 2e's 25 mutations held 7 lint plants and PR #828's 74 were unit tests, so the runner runs unit files as well as suites (designed below) and, if ruled in, a lint kind (menu item B). `test/site/astro-scaffold.test.ts` empties the generated assets under `public/`, which the unit-before-build order below answers.
- **Exact sets**: the dispatcher's brief rules the pass rule an EXACT expected set; the 2f lane's call to count extra FAILs that read the same broken thing (Issue #779 comment 6092158219, call 1) becomes "list them", and the ledger shows the actual set so a list can be corrected.
- **Agent definitions (D5)**: `vellum-pr-skeptic.md` says "do not create branches" and `vellum-guard-prover.md` never commits from its tree, while ruling 3 lets review agents dispatch. Building the branch through `gh api` removes the local commit but still creates a branch, so the definitions decide (menu item D).
- **The cap across dispatchers (D4)**: answered by `queue: max` below; and parallel lanes' pull requests each run seven jobs, which ruling 3's "a pull request's seven" does not cover (named, not designed for).
- **D10**: if the harness refuses this lane's write or push of a workflow file, that is a STOP for Alex, not a hand-off to the orchestrator.
- **Outside this issue**: CD44 has two CI reds and no flake row (runs 37526087943 and 37624644448, lane D), relayed to the dispatcher.
- The dispatcher's note of 2026-10-09: main is `e53c5de0` (Issue #837, founding word data only); the branch merges `origin/main` and re-runs check, lint, format:check and test before the pull request opens.

## What it does

A lane, the orchestrator or a review agent writes a list of mutations, each a patch with the checks it must red. One command turns the list into a throwaway branch and dispatches the workflow on it. The workflow fans the list out, one job per patch on a clean checkout of the commit under test, runs each entry's named unit files and browser suite, and a last job compares every expected `FAIL` set with the actual one and publishes one ledger (the run's summary page and a `ledger` artifact). The same command reads the ledger back and deletes the branch. The local procedure is untouched: nothing here changes `scripts/agent-sandbox.ts`, the e2e harness, or how a proof is run by hand.

## The design

### The throwaway branch and where each piece of code comes from

- **The branch is the RUNNER plus one commit adding `proof.json`**, named `proof/<label>`. Its parent is main's head (or, with `--runner <ref>`, another ref; this pull request proves itself with `--runner chore/838-ci-proof-runner`). The workflow is dispatched ON that branch, so the YAML and the runner scripts that execute are the parent's, never the code under test's, and a lane branch cut before this lands can still be proved. `proof.json` names the commit under test by sha, and every job checks that sha out on its own path.
- **Why not dispatch on main or on the lane's branch**: a run's check runs attach to the commit it ran on, so a ledger that goes red on purpose would show as a red check on main's head or on a pull request head, and every CI-watching loop (`gh pr checks`, the orchestrator's "none pending" poll) would read it. On its own throwaway commit it touches nothing else, and `gh run list --branch proof/<label>` finds exactly that one run, which `gh workflow run` does not hand back. (UNVERIFIABLE until measured: that a dispatch on main would attach there. The design does not depend on it.)
- **The branch is built server side through `gh api`** (blobs, trees with `base_tree` = the runner's tree, commits, refs), so `send` writes no object, ref or index in the tree it runs from. A review agent with no write tools can therefore dispatch it, and a lane's worktree never moves. `read` deletes the branch after it has the ledger (`--keep` keeps it).
- **The sha under test must be on the remote** (`gh api repos/ahl-gram/Vellum/commits/<sha>`); `send` refuses with "push it first" otherwise. Lanes push at the first commit already.

### The list (`proof.json`, version 1)

```json
{ "version": 1, "sha": "<40 hex>", "entries": [
  { "id": "IX9-faq-border", "patch": "diff --git a/public/faq/index.css b/public/faq/index.css\n...",
    "unit": { "files": ["test/site/x.test.ts"], "expect": ["the exact test name"] },
    "e2e": { "suites": "document-rooms", "expect": ["IX9"] } }
] }
```

- At most one `unit` (any number of files) and one `e2e` (one suite selection) per entry, at least one of the two. Optional `budgetSeconds` on either, which may only LOWER the default.
- An entry with a patch must expect at least one red; an entry with no patch is a control the author asked for (a flake hunt, a timing sample) and must expect none.
- Refused at validation, each with its own message: a duplicate id; an id outside `[A-Za-z0-9._-]{1,80}`; an e2e selection of `full`, `all`, `smoke` or empty (a proof names its suites); a patch touching `package.json` or `package-lock.json` (the install runs before the patch, so such a patch proves nothing); a path in a patch that is absolute or climbs with `..`; more than 256 jobs counting the controls (GitHub's matrix limit, so the list is split into two sends).
- **The suite-order rules are checked by `send`, against the tree at the sha** (plan skeptic finding 1). `resolveSuiteSelection` adds `render` and nothing else: it never adds a `NEEDS_PREDECESSOR` suite (`print-room` after `hunt`, `region-detail` after `document-rooms`), and its canonical order puts an `OPENS_ON_HOME` suite straight after `home` when both are named, the stale-document read of settle-doctrine clause 9. Part 2g's suites include `print-room` and `hunt`, and 2f-home's pair is `home` with `landfall`, so this is the runner's main path, not an edge. `send` reads `e2e/support/suites.ts` AT THE SHA (`git show`, written to a temp file and imported; the file imports nothing, and an import that fails refuses the send loudly) and refuses, naming each entry, a selection that names a suite without its predecessor or puts an `OPENS_ON_HOME` suite directly after `home` in `E2E_SUITE_ORDER`; it refuses rather than expands, so what runs is what the author wrote. It also refuses an unknown suite name there, at no CI cost. The plan job cannot import the tree, so a list pushed by hand skips this check: a missing predecessor still shows as a red control and INCONCLUSIVE rows, an `OPENS_ON_HOME` adjacency may not (it can flake rather than red), which is named as the blind spot of hand-built lists.

### The controls

The plan job adds one unmutated control job per distinct e2e selection (lowercased, split on commas, trimmed, sorted, so `landfall,survey` and `Survey, landfall` share one) and ONE unit control running the union of every unit file named, since `node --test` runs each file in its own process and the reporter keys each result by its file. A mutation's check is INCONCLUSIVE when its control is not clean on the files or selection it uses. Jobs = entries + distinct e2e selections + (one, if any unit check). The 2f proof rule's "the unmutated control is ALL PASS" is this. **The trade-off, named** (plan skeptic finding 16): one flaky red in a control voids every row on that selection, and `chart-drawer`, one of 2g's suites, carries CD44, which recon found red twice in CI with no flake row. Narrowing it (judging a row on its reds minus the control's when the expected set does not touch them) would launder a flake into a verdict, so the rule stays strict and the remedy is a second send of that selection's rows.

### One job

On a fresh `ubuntu-latest` runner, with the job's matrix value carrying only `{index, id}`:

1. Check out the runner (the dispatch ref) to `runner/`, the commit under test to `tree/` by sha, `fetch-depth: 1`, `persist-credentials: false` on both; download the `plan` artifact.
2. `actions/setup-node@v4`, Node 26, with NO npm cache: `setup-node`'s cache saves in its post step on a miss, which would make the npm cache a channel from one job to the next. `npm ci` in `tree/` runs cold; its cost is measured at the first dispatch (UNVERIFIABLE until then; CI's cached `npm ci` measures 2 to 5 s).
3. `node ../runner/scripts/proof-runner/job.ts` in `tree/`, inputs through `env:` only, never `${{ }}` inside `run:`:
   - asserts `HEAD` is the sha and `git status --porcelain` is empty, else the result says so (INCONCLUSIVE);
   - `git apply --check` then `git apply`; a refusal is recorded with git's message (NOT APPLIED) and the job ends there (the plan's earlier "status must list exactly the patch's files" check is dropped: `git apply` writes only the patch's paths, so no fixture could tell it apart from its absence, plan skeptic finding 8);
   - unit first: `node --test --test-reporter=<runner>/scripts/proof-runner/reporter.ts --test-reporter-destination=<tmp>/unit.jsonl <files>`, under its budget. The reporter writes one JSON line per test result (name, file, pass or fail). It replaces TAP, which writes `#` as `\#` (measured 2026-10-09 on Node 26.11.1: `ok 1 - ... (Issue \#763 ruling 2A)`), so an exact compare against a name carrying "Issue #N" would read a real red as a HOLE. A failure whose name EQUALS ONE OF THE FILE ARGUMENTS THE JOB PASSED is that file failing before its tests ran, and is kept apart from the test names: a missing import and a throw at import each report `test:fail` named by the path exactly as passed (`sub/b.test.ts`, or an absolute path when passed absolute), not by its basename (measured 2026-10-09 by the plan skeptic on Node 26.11.1, finding 3, correcting this plan's first draft);
   - then, only if the entry has an e2e check, `npm run build` under its budget (a failure is recorded, and the e2e check is INCONCLUSIVE: the build does not hold a claim, 2e call 2), then `node e2e/run.ts` with `VELLUM_E2E_SUITES`, `VELLUM_REQUIRE_BROWSER=1` and `VELLUM_BROWSER=/usr/bin/google-chrome` as `ci.yml` sets them, under its budget. Unit before build is deliberate: some unit files clean `public/`'s generated assets, and the build regenerates them, so neither run sees the other's leftovers (the 2f plan's finding 1, with no `astro:generate` patch-up needed). The 2f driver's copy-only shortcut for a hand-written sheet is not taken: one path, always the full build, about 30 s on CI;
   - writes `<index>.json` (applied, git's message, each check's expected and actual sets, every stop WITH ITS WHOLE STDERR STANZA, the exit code, the harness flag, the seconds of each phase, and the output's tail) and exits 0 whenever it wrote a result, so an expected red never turns the job red. The stanza is what `makeStep` and `runnerHooks` print with `console.error` (`  <name> never reached its assertion:` or `  <name> stopped early:` and the error with its stack), read from that line to the next line that is not indented under it, capped at 60 lines: the `FAIL` line carries only the message, and a null read's message (`Cannot read properties of null (reading 'right')`) does not say whose read threw, so without the stack every NEEDS READ row would send its reader back to a local run (plan skeptic finding 2).
4. Upload `result-<index>` (`if: always()`, retention 7 days).

**Every budget kills a process GROUP** (plan skeptic finding 4): `npm run build` is a chain (`npm run astro:generate && astro build`), and killing `npm` at a `spawnSync` timeout fires `exit` but leaves the chain's child running with its parent gone and `close` never firing (measured by the skeptic on macOS; argued, not run, on Linux, where both dash and npm pass a signal only to their direct child). So each budgeted command is spawned `detached` into its own process group, a timer kills the whole group (`process.kill(-pid, "SIGKILL")`), and the result is written with the check marked `budget` whatever the child left behind. This is `vellum-footguns` Gate 1 item 10's second clause applied to the runner rather than to a test.

Budgets: unit 300 s (the slowest CI unit shard's Test step is 255 s for a third of every file, and a proof names files), build 300 s (CI's build step: 32 s worst of 20 jobs), e2e 600 s (the slowest single suite in `MEASURED_SECONDS` is corners at 213.6 s; CI's slowest whole lane step is 405 s). Job `timeout-minutes: 25`: setup measured at 19 s or less WITH the npm cache (checkout, setup-node and `npm ci`), so the 25 minutes are the three budgets (20) plus five minutes of headroom for the cold `npm ci` this runner takes and has not measured; the job cap only fires if a budget fails to. Measured 2026-10-09 over CI runs 37994104721 to 38018414672 (five main runs, 35 jobs).

### A lint kind, if menu item B rules it in

`"lint": { "files": [...], "expect": ["vellum/css-comment-issue-form"] }`: after the unit check and before the build, `npx eslint --flag unstable_native_nodejs_ts_config --format json <files>` in `tree/` under a 300 s budget (CI's Lint step: 33 s worst over 15 jobs, for the whole tree); the actual set is the distinct `ruleId`s of every message, and a message with a null `ruleId` (a parse error) is a load failure, kept apart and IMPRECISE, the same way a unit file that fails at import is. Its control is one lint job over the union of the files named. A plant in a NEW file is refused at validation, since a file outside what the type checker includes fails the lint's project service before any rule runs (`handbook/specs/orchestration.md`, Merging): a plant goes in an existing file. Tests: O4 (the JSON shape to a rule set, the null-rule case apart; mutation: count the null rule as a red) and L12 (the new-file refusal; mutation: drop it).

### Reading the output

e2e, from the harness's own line shape (`check` in `e2e/harness.ts` prints `PASS`/`FAIL`, two spaces, the check's name, and, with a detail, two spaces, an em-dash, a space and the detail):
- `FAIL  <ID> never reached its assertion  — ...` is a STOP on `<ID>` (`makeStep` in `e2e/support/step.ts`), never a red, whatever its first token says;
- `FAIL  <suite> stopped early, ...` is a STOP on the suite (`runnerHooks` in `e2e/support/runner.ts`);
- any other `FAIL  <ID> ...` is a red on its first token with trailing `,`, `:` and `;` stripped, since 641 of 652 check names start with a bare id and the rest include `CD22, CD43 ...` and `SB health:` (plan skeptic finding 11);
- `HARNESS ERROR` (exit 2), `FAIL: no checks ran`, and a nonzero exit with no `FAIL  ` line are each INCONCLUSIVE.

Unit: the reporter's lines; a failure named for one of the file arguments is a load failure, kept apart.

### The verdicts (the ledger)

Per check, then per entry as the first in this order any of its checks has: NOT APPLIED, UNPROVEN, INCONCLUSIVE, HOLE, IMPRECISE, NEEDS READ, BITES.

- **BITES**: the actual red set equals the expected set exactly, with no stop. The authority is tracked house text, not only the dispatcher's brief: `.claude/agents/vellum-guard-prover.md` ("Exactly one going red is the good outcome"; BITES is "exactly the claimed test went red") and the 2f plan's Procedure item 4 ("exactly the checks the claim names"). The precedent is split, though: the 2f lane's call 1 (Issue #779 comment 6092158219, merged in PR #835) counted extra `FAIL`s that read the same broken thing, and under an exact rule each such row reads IMPRECISE until a second send lists the extras, about one more queue slot and job each. That is put to Alex as menu item E (plan skeptic finding 5).
- **HOLE**: nothing went red.
- **IMPRECISE**: something went red but the set differs from the expected one, including a unit file that failed before its tests ran.
- **NEEDS READ**: at least one stop. Issue #779 comment 6090198881 counts a stop as the check failing only when it is the claim's OWN read that threw, and the 2f plan leaves a stop at an earlier read inconclusive; a machine cannot tell the two apart, so the row carries the stop's payload and a reader decides. Never counted as BITES.
- **INCONCLUSIVE**: the control for that check is not clean, the build failed, a harness error, no checks ran, or the tree was not clean at the start.
- **NOT APPLIED**: `git apply --check` refused the patch; git's message is the row's note.
- **UNPROVEN**: a budget ran out, or there is no result at all (the job timed out, was cancelled, or failed before writing one). The ledger walks the PLAN, not the results, so a missing result is named rather than skipped.
- An entry with no patch, and every control, reads **CLEAN** or **RED** (UNPROVEN when missing).

The ledger is `ledger.md` (a table, every pasted harness detail inside a code span with its backticks and pipes neutralised, since the harness's ` — ` would otherwise put an em-dash in any pull request body that quotes it) and `ledger.json`, published as the run's step summary and the `ledger` artifact. The ledger job runs `if: always()` after the plan succeeded, and exits nonzero unless every patched entry BITES and every control and patch-less entry is CLEAN, so `gh run watch --exit-status` carries one meaningful bit.

### The workflow (`.github/workflows/proof-runner.yml`, proposed)

- `on: workflow_dispatch` and nothing else; `run-name: proof ${{ github.ref_name }}`; the plan job refuses a ref outside `proof/`.
- `permissions: contents: read` at the top, so no job can push; `persist-credentials: false` on every checkout.
- `concurrency: { group: proof-runner, queue: max, cancel-in-progress: false }`: one proof run at a time, the rest waiting. GitHub's default queue holds one pending run and CANCELS it when another arrives, so without `queue: max` a third dispatch would silently drop the second (docs, 2026-10-09; UNVERIFIABLE until a dispatch shows GitHub accepts the key). If it is refused, `send` instead refuses while any proof run is queued or in progress.
- Three jobs: `plan` (validate, build the matrix and `plan.json`), `prove` (the matrix: `fail-fast: false`, `max-parallel: 12`), `ledger`. Every job has `timeout-minutes`.
- **The cap**: 20 concurrent jobs on the Free plan, less a pull request's 7 (`ci.yml`'s three unit shards and four e2e lanes) leaves 13; 12 leaves one more for the deploy's build job, which runs beside CI on every merge to main. Serialising runs is what makes the cap hold across dispatches, since `max-parallel` caps only its own run. The consequences: 150 mutations run in 13 waves, not the issue's 8; and **a proof queues behind every run dispatched before it, first in, first out** (plan skeptic finding 7): a 2g-sized batch of about 160 jobs at 12 wide is about 14 waves of 2 to 3.5 minutes (setup under a minute plus build plus a suite of `home` 123.0 s, `chart-drawer` 167.8 s or `reading-room` 72.2 s), so it holds the queue for roughly 40 to 50 minutes, and the orchestrator's one-row pre-merge plant sent behind it waits that long. A plant that cannot wait runs locally, which stays valid. UNVERIFIABLE: whether the 20 is per account, so that Alex's other repositories' jobs share it (GitHub's limits page does not say), and which plan the account is on (`gh api user` carries no plan field); a pull request from each of two parallel lanes is 14 jobs, which ruling 3's "a pull request's seven" does not cover, and jobs past the limit wait rather than fail.
- **Registration**: GitHub's documentation says a `workflow_dispatch` run triggers only when the workflow file exists on the default branch. That a workflow which has run once on another branch can then be dispatched there is UNVERIFIABLE folklore, not documentation (plan skeptic finding 12); the evidence section measures it, and menu item C covers its failing.
- Artifacts: `plan`, `result-<index>`, `ledger`.

### The local command (`scripts/proof-runner/main.ts`, proposed, with `npm run proof`)

- `send --raw <proof.json> [--runner <ref>] [--label <label>]` pushes a list already in the runner's own shape, validated by `parseList` alone (no compiling, no order check), for a list built by hand.
- `send <list> [--sha <sha>] [--runner <ref>] [--label <label>]`: `<list>` is a `.ts` module exporting `MUTATIONS` or a `.json` array. Each mutation is `{ id, patch: <path to a diff> }` or `{ id, edits: [...] }` plus its `unit` and `e2e`; an edit is `{ file, find, replace }` (exactly one occurrence), `{ file, line, from, to }` (one occurrence on that line, the by-line form `vellum-footguns` Gate 1 item 9 asks a prover for), or `{ file, append }`. Edits are compiled against the sha's own blobs (`git show <sha>:<path>`, read only) into a unified diff through `git diff --no-index` on temp files, and an edit that cannot be made refuses the whole send, naming every bad entry, so nothing goes up half-built. Every patch is checked with `git apply --cached --check` against a TEMPORARY index read from the sha (`GIT_INDEX_FILE` in the temp dir, so the repo's own index is not touched); a patch FILE that does not apply is sent anyway with a warning, and the ledger reports it NOT APPLIED, which is ruling 4. The list is validated by the same `parseList` the plan job runs. Then the branch through `gh api`, `gh workflow run proof-runner.yml --ref proof/<label>`, whose printed run url is read first (gh 2.102.0's help: "The created workflow run URL will be returned if available", plan skeptic finding 13), with a short poll of `gh run list --branch proof/<label>` as the fallback; the run id and url are printed.
- `read <run-id> [--out <dir>] [--keep]`: refuses unless the run's workflow is `proof-runner.yml` and its branch starts with `proof/` (plan skeptic finding 9: it deletes a branch, so it names whose); prints the run's state and exits 3 while it is not finished; then downloads `ledger` to `--out` (default a temp dir, never the tree's `out/`, which a prover's residue listing walks), prints `ledger.md`, and deletes the branch unless `--keep`. Exit 0 only when the run concluded success.

### Files (all proposed names)

| file | what |
|---|---|
| `.github/workflows/proof-runner.yml` | the workflow |
| `scripts/proof-runner/list.ts` | the list's types, `parseList`, `planJobs` (controls), the limits and budgets; its `import.meta.main` entry is the plan job |
| `scripts/proof-runner/reporter.ts` | the `node --test` reporter, one JSON line per result |
| `scripts/proof-runner/outcome.ts` | `e2eOutcome` and `unitOutcome`: reds, stops, load failures, harness |
| `scripts/proof-runner/job.ts` | one job: clean check, apply, unit, build, e2e, result |
| `scripts/proof-runner/ledger.ts` | verdicts, `ledger.md` and `ledger.json`, the exit bit |
| `scripts/proof-runner/send.ts` | compiling edits, checking patches, the branch plan for `gh api`, dispatch |
| `scripts/proof-runner/main.ts` | `send` and `read` |
| `test/repo/proof-runner-{list,outcome,job,ledger,send,read,workflow}.test.ts` | the tests below; `reporter.ts` is exercised by `-outcome` (O3), which spawns it for real |
| `test-support/ci-job.ts` | `ciJob` gains an optional workflow file argument (default `ci.yml`, so its two callers are untouched), and the workflow test reads `proof-runner.yml` through it: the house's hand-rolled job-block reader, whose blind spot (a job key at any indent but two yields no block) is turned into a red by its own anchor assert, rather than a second reader or a YAML dependency (`js-yaml` is only transitive here; plan skeptic finding 15) |
| `package.json` | `"proof": "node scripts/proof-runner/main.ts"` |
| `handbook/specs/development-workflow.md`, `handbook/specs/orchestration.md`, `handbook/specs/site-architecture.md` | the paragraphs under What it drags |

Scripts import node builtins and each other only, never the tree under test (the one exception is `send` importing a temp copy of the sha's `e2e/support/suites.ts`, which imports nothing, for the order rules). CLIs guard on `import.meta.main` (precedent `e2e/split-proof.ts`), since an import that exits is reported as a PASS (Gate 1 item 14). Every spawned child carries its own time limit (Gate 1 item 10), and every budgeted one is killed as a group.

## Tests, each with the mutation that reds it

Written first and red on the assertion against a stub of the right shape (e.g. `parseList` returning the input unvalidated, `verdict` returning `"BITES"`).

`test/repo/proof-runner-list.test.ts`
- L1 a valid list plans one job per entry, then one control per distinct e2e selection, then one unit control over the union of files. Mutation: drop the control step; red.
- L2 two selections differing in order, case and spacing share one control. Mutation: key controls by the raw string; red.
- L3 to L10, one test per refusal arm (duplicate id, bad id, no check, patched entry expecting nothing, patch-less entry expecting a red, `full`/`all`/`smoke`/empty selection, a patch touching `package.json` or the lockfile, an absolute or `..` path, a budget above the default), each asserting its own message. Mutation: delete that arm's clause; that test alone reds.
- L11 257 jobs counting controls is refused naming the count; 256 passes. Mutation: count entries only; red.
- L12 (in `send`'s check of the order rules, run against a fixture `suites.ts` written into the temp repo) a selection of `print-room` without `hunt`, and one of `home,landfall`, are each refused naming the entry; `hunt,print-room` and `landfall` alone pass. Mutation: drop the predecessor arm, then the adjacency arm; each reds its case.

`test/repo/proof-runner-outcome.test.ts`
- O1 an e2e output with a plain `FAIL`, a never-reached line and a stopped-early line yields reds `{IX9}` and two stops, `{L13}` and `{landfall}`, each with its whole stderr stanza (the error's stack lines included). The stop NAMES and details are produced by the REAL code, `makeStep` and `runnerHooks` driven in the test with a capturing `check` and `err`, so a reworded stop phrase in `e2e/support/step.ts` or `e2e/support/runner.ts` reds this test rather than silently turning stops into reds; only the harness's `FAIL  ` and detail framing is restated, cited to `check` in `e2e/harness.ts`, and the first dispatch's raw job log is the end-to-end witness. Mutation: take the first token of every `FAIL  ` line as a red (the 2f driver's regex); red.
- O1b `FAIL  CD22, CD43 ...` and `FAIL  SB health: ...` read as `CD22` and `SB`. Mutation: keep the raw token; red.
- O2 `HARNESS ERROR`, `FAIL: no checks ran`, and exit 1 with no `FAIL  ` line each come back flagged. Mutation: drop each flag; its case reds.
- O3 the real reporter, spawned over fixture test files in a SUBDIRECTORY of a temp dir and passed with that prefix (one passing, one failing with `#` and a newline in its name, one failing at a missing import, one throwing at import), yields the failing name unescaped and both import failures apart. The subdirectory is the hazard's own fixture: at the top of a temp dir the path and the basename coincide, and a basename rule would pass (plan skeptic finding 3, Gate 1 item 2). Mutation: match the basename instead of the argument passed; red.

`test/repo/proof-runner-job.test.ts` (a temp git repo built the way `test-support/sandbox-repo.ts` builds one, the build and suite commands injected so no browser or build runs, while `git apply` and the budgeted spawn are real)
- J1 a patch that applies leaves the file with the patch's text and the result says applied. Mutation: run only `git apply --check`; red.
- J2 a stale patch is NOT APPLIED with git's message, and the tree is byte-identical after. Mutation: apply without `--check` and ignore the exit; red.
- J3 order: unit runs before the build, the build only when an e2e check exists, e2e after the build. Mutation: build first; red.
- J4 the budgeted spawn, run for real on a CHAIN (`sh -c` starting a long `sleep` in the background, writing its pid, and waiting) with a one-second budget, returns `budget` within a bounded time AND leaves the grandchild dead (`process.kill(pid, 0)` throws). The fixture is the shape `npm run build` has, which a `spawnSync` timeout does not clean up (plan skeptic finding 4). Mutation: kill the child alone instead of its group; the grandchild survives and the test reds. The test's own child carries a timeout far above the budget, and kills the grandchild in a `finally`.
- J5 a tree that is not clean at the start writes an INCONCLUSIVE result before applying anything. Mutation: drop the check; red.
- J6 a budget that runs out still writes the result, with the unit half kept. Mutation: throw on the budget instead of recording it; red.

`test/repo/proof-runner-ledger.test.ts`
- V1 to V9, one per verdict arm, each from its own fixture (BITES, HOLE, IMPRECISE from a superset, IMPRECISE from a load failure, NEEDS READ from a stop even when the stop's id is the expected one, INCONCLUSIVE from a red control, NOT APPLIED, UNPROVEN from a budget, UNPROVEN from no result). Mutation per arm: delete it, or compare as a subset instead of exactly; that test reds.
- V10 every planned job is named exactly once, with or without a result. Mutation: iterate the results instead of the plan; red.
- V11 the exit bit is 0 only when every patched entry BITES and every control is CLEAN; a NEEDS READ row alone makes it 1. Mutation: count NEEDS READ as a pass; red.
- V12 a detail carrying ` — `, a backtick and a pipe lands inside one code span with the backtick and the pipe neutralised. Mutation: paste the detail raw; red.

`test/repo/proof-runner-send.test.ts` (temp git repo)
- S1 each edit form compiles to a patch that `git apply --check` accepts at the fixture's commit and produces the intended text. Mutation: `replaceAll` in the find form; the twice-found case reds in S2.
- S2 a find found 0 or 2 times, a line out of range, and a `from` absent from its line each refuse the send, naming every bad entry at once. Mutation: stop at the first bad entry; red.
- S3 the temporary index leaves the repo's own index, `HEAD` and working tree exactly as they were (`git status --porcelain` and the index file's bytes before and after). Mutation: use the default index; red.
- S4 the branch plan is blobs, then a tree with `base_tree` the runner's tree and the one path `proof.json`, then a commit whose only parent is the runner's sha, then `refs/heads/proof/<label>`. Mutation: parent the commit on the sha under test; red.

`test/repo/proof-runner-read.test.ts`
- R1 `read`'s plan for a finished run of `proof-runner.yml` on `proof/x` is download then delete `proof/x`; for a run of another workflow, or on a branch outside `proof/`, it refuses and deletes nothing; `--keep` deletes nothing; an unfinished run exits 3. Mutation: drop the branch-prefix check; red.

`test/repo/proof-runner-workflow.test.ts` (reads the YAML as data, the form `handbook/specs/check-placement.md` allows for a workflow; each pin proved by inverting the config, Gate 7 item 3)
- W1 `on` holds `workflow_dispatch` and nothing else. Inversion: add `push:`; red.
- W2 top-level `permissions` is `contents: read` alone, and every `actions/checkout` step sets `persist-credentials: false`. Inversion: drop it from one checkout; red.
- W3 the concurrency group sets `queue: max` and `cancel-in-progress: false`. Inversion: drop `queue`; red.
- W4 the prove job's `max-parallel` plus `ci.yml`'s job count (its shard list and lane list, read the way `test/repo/e2e-tiers.test.ts` reads them, with the lane count anchored to `E2E_LANES`) is at most 20 less 1 for the deploy build, and `fail-fast` is false. So a new lane or shard reds this test until the cap comes down. Its blind spot, named with its direction: it counts `ci.yml` and the deploy build only, so a future workflow that also runs on pull requests is not counted, and errs toward a cap too high (plan skeptic finding 10). Inversion: `max-parallel: 13`; red.
- W5 every job carries `timeout-minutes`. Inversion: remove one; red.
- W6 every `run:` is a single line (no `|` or `>` block, so no continuation line can hide one) and none interpolates `${{ ... }}`; inputs reach scripts through `env:`. Inversion: a `run: |` block, then a `${{ }}` on a `run:` line; each reds.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`, after `git merge origin/main`. No local e2e: nothing here changes a suite, and the e2e paths are proved on CI below.
- **The runner proving itself on its own branch**, dispatched with `send --runner chore/838-ci-proof-runner` against main's head, run ids in the pull request:
  - Run A, one row per verdict path, taken from Issue #779 part 2f's local ledger where a local row exists, so CI's verdict is compared with the Mac's (rows re-read against PR #835's merged ledger, plan skeptic finding 6):
    - `IX9-faq-border` (`public/faq/index.css`, local: `FAIL  IX9`) expects BITES;
    - `SB13-attach` (deleting `zoom.attach();` in `src/site/specimen/app.ts`, local: specimen ALL PASS, still an open row in `handbook/errata/guards.md`) expects HOLE, the planted break the suite really does not see;
    - a comment-only edit to `public/faq/index.css` expecting IX9 expects HOLE: the clean mutation, reported clean;
    - `SB13-keys` (deleting `bindGlassKeys(viewport, zoom);`, local: SB13 by a never-reached stop) expects NEEDS READ, with the stop's stack on the row;
    - `IX9-faq-border` again, expecting `IX10`, expects IMPRECISE (the deliberate mismatch);
    - a patch file built against an older text expects NOT APPLIED with git's message;
    - a by-line unit mutation whose red set is measured locally first, on committed code, expects BITES;
    - a test file patched to spin forever with `budgetSeconds: 20` expects UNPROVEN WITH the note `budget` AND a written result, which a job timeout's "no result" would not give;
    - patch-less `specimen` entries expect CLEAN, enough of them that the run plans at least 14 jobs, so the cap of 12 actually holds something back.
    The ledger job goes red, on purpose, and the ledger is pasted.
  - Runs B and C, two small lists dispatched straight after A: both must sit pending and then complete, neither cancelled, which is the evidence `queue: max` holds. Run B carries the INCONCLUSIVE witness, an entry on a misspelled suite whose control goes red with the harness's own refusal; `send` refuses that name, so B goes up through `send --raw <proof.json>`, which pushes a hand-built list through the same `gh api` calls after `parseList` alone, the path any hand-built list takes.
  - From the jobs API over run A: the peak number of overlapping prove jobs (at most 12, with 14 or more planned), and each phase's seconds (checkout, setup, cold `npm ci`, build, suite), which is the figure the issue said to measure before promising one. Until that run exists every throughput figure here is UNVERIFIABLE.
  - Then the reported totals reconciled: every planned job named once in the ledger, the run's conclusion, and `read` deleting the branch.
- **Registration**: GitHub's documentation says a `workflow_dispatch` run triggers only when the workflow file exists on the default branch; that a workflow which has run once can then be dispatched on another branch is UNVERIFIABLE. First try `gh workflow run --ref` on the throwaway branch; if GitHub refuses, push a separate `proof/register-838` branch whose copy carries a temporary `push` trigger with every job skipped, let it run once, delete that branch, and dispatch again. The temporary trigger never touches the pull request's branch. If both refuse, STOP for menu item C.

## What it drags

- **The normative home**: one paragraph in `handbook/specs/development-workflow.md` step 11 (who may dispatch, that a ledger row with its run id is a proof like a pasted red line, the verdict words, that NEEDS READ is read by a person, that the local procedure stays valid and the runner is an accelerator); `handbook/specs/orchestration.md` Merging's "run a check of your own" bullet points at it for the plant. Nothing else restates it (`handbook/specs/conventions.md`, Where a rule lives).
- **Agent definitions**: not edited here (menu item). `vellum-guard-prover` and `vellum-pr-skeptic` hold Bash and could run `send`, but they learn of it only from their definitions or a dispatching prompt.
- **The new-lane roster line**: `handbook/specs/site-architecture.md` ("A new LANE joins two more: `ci.yml`'s job matrix ... and `main`'s required checks") gains the third, the proof runner's cap, which `test/repo/proof-runner-workflow.test.ts` reds when CI's jobs plus the cap pass the limit (plan skeptic finding 10).
- **Rosters**: `tsconfig.json` includes `scripts/**`, the lint's roots and Prettier's `.prettierignore` already admit `scripts/` and `test/`, and `node --test` collects `test/repo/*.test.ts` by name; no hand-joined list. The YAML is outside the formatter and the lint (`.prettierignore` admits only CSS and TS), which is why W1 to W6 exist. `test/repo/prose-paths.test.ts` will check every backticked path the spec paragraphs name.
- **`ci.yml` and `e2e/support/lanes.ts` are not edited.** No chart, golden, regen, page or engine change.
- **The parallel lanes**: none of these files is in `e2e/`, `test/site/` or `src/world/founding/`.

## Calls (for the issue record)

Each with the rule it was made on.

1. The throwaway branch sits on the runner, not on the code under test, and is dispatched on; the sha under test is a field of the list. Rule: ruling 4's "no job's change reaches another job or any branch", read as reaching no other commit's checks either; and the runner must work for a lane branch cut before it landed.
2. The branch is built through `gh api`, so dispatching writes nothing locally. Rule: ruling 3 lets review agents dispatch, and they hold no write tools.
3. No npm cache in a proof job. Rule: ruling 4's isolation; the cache would be a channel between jobs.
4. Always the full build before an e2e check; the copy-only shortcut is not taken. Rule: a clean checkout has no `dist/`, so every job builds anyway (recon D6); the boring path.
5. Unit before build. Rule: the 2f plan's skeptic finding 1, the stale site after a unit file cleans `public/`.
6. One unit control over the union of files, one e2e control per selection. Rule: the 2f plan's Procedure item 4 and 5, "the unmutated control is ALL PASS".
7. The verdict words, BITES, HOLE and IMPRECISE taken from the guard prover, and NEEDS READ for every stop. Rule: Issue #779 comment 6090198881 counts only the claim's OWN read, which a person judges.
8. The ledger job's exit code is the one bit. Rule: `CLAUDE.md`, a mutation not reached is named unproven, and a run that proved less must not read green.
9. `max-parallel: 12`, one under the ruled 13. Rule: ruling 3, plus the deploy build that runs beside CI on every merge.
10. Budgets 300 / 300 / 600 s, job cap 25 minutes. Rule: `CLAUDE.md`, a bound derived from the measured worst with the headroom named.
11. A reporter of its own instead of TAP. Rule: measured, TAP escapes `#` and the house's test names carry "Issue #N".
12. `read` deletes the branch by default. Rule: ruling 4's "throwaway"; refused outside `proof/` and this workflow.
13. Edit-form mutations that cannot be compiled refuse the whole send; patch files that do not apply are sent and reported. Rule: ruling 4, "reported, never skipped"; nothing goes up half-built.
14. `send` refuses, rather than expands, a selection that breaks the suite-order rules. Rule: settle-doctrine clause 9 and `NEEDS_PREDECESSOR`; what runs is what the author wrote.
15. A red control voids every row on its selection. Rule: the 2f plan's "the unmutated control is ALL PASS".
16. Every budgeted command is killed as a process group. Rule: `vellum-footguns` Gate 1 item 10.
17. The serial queue's cost is named, not designed around. Rule: ruling 3's cap holds only if runs wait their turn; the local procedure stays valid for a plant that cannot wait.
18. `send --raw` for a hand-built list. Rule: ruling 4's list is the runner's contract, and `send`'s compiling is a convenience over it.

## Open decisions (for Alex, through the dispatcher)

- A. The names: `.github/workflows/proof-runner.yml`, `scripts/proof-runner/`, `test/repo/proof-runner-*.test.ts`, `npm run proof`, branches `proof/<label>` (recommended); or "mutation-proofs" for the workflow and folder, since `e2e/split-proof.ts` and `e2e/port-proof.ts` already use "proof" for proving a move.
- B. Lint plants as a third kind: recommended NOT in this pull request but as a follow-up issue, because Issue #779 comment 6093191801 holds part 2g until this merges and 2g's rows are unit-plus-browser like 2f's; or now, at one more parser, one more job step and three tests.
- C. If GitHub refuses to run the workflow from a branch before it is on main by both routes: recommended, prove every script before the merge by running the plan, job and ledger scripts locally over a temp checkout through every verdict path, and let the first run from main prove the workflow file itself; or merge and let the first run from main be the whole self-proof, a red one meaning a fix-forward pull request before 2g starts.
- D. The review agents' own instructions: recommended, edit neither here, and a review agent hands its list to the session that dispatched it; or edit the guard prover's only (the agent whose browser-proof budget this relieves); or edit both, against the cold reviewer's read-only "do not create branches". Any edit brings the pull-request note on which version of a definition wrote and which reviewed.
- E. Exact match: recommended, exact, an author lists every check the break reds and re-sends when surprised; or a pass when the expected checks all go red and the extras are named in an "also red" list up front; or any superset passes, extras flagged.

## Plan skeptic (cold, with recon's ledger), 2026-10-09

No finding reached BLOCKING; sixteen findings, every one folded in above or answered here.

1. Suite-order rules unhonoured. Folded: `send` refuses by the sha's own rules; the hand-built blind spot named; test L12.
2. NEEDS READ rows unjudgeable from the ledger. Folded: the whole stderr stanza kept and carried; test O1.
3. The import-failure rule was the basename. Folded: the argument passed; O3's fixtures in a subdirectory.
4. A killed build chain leaves a grandchild. Folded: process-group kill; test J4 on a real chain.
5. The exact rule credited to the brief. Folded: cited to the prover and the 2f plan; put to Alex as item E with its cost.
6. Run A partly stale and partly unable to fail. Folded: `SB13-attach` for the HOLE, `IX9-faq-shadow` dropped (it reads `FAIL  IX9` since PR #835), an INCONCLUSIVE row, the budget row's stricter pass, at least 14 jobs.
7. The serial wait unpriced. Folded: priced in the cap paragraph and call 17.
8. J1 could not go red. Folded: the post-apply check is dropped and J1 re-aimed at the apply itself.
9. `read` deletes unguarded and untested. Folded: refuses outside `proof-runner.yml` and `proof/`; test R1.
10. The new-lane roster line, and W4 one case. Folded: the site-architecture line; W4's blind spot named with its direction.
11. First-token ids with punctuation. Folded: stripped; test O1b.
12. Registration credited to the docs. Folded: marked UNVERIFIABLE.
13. `gh workflow run` does return the run url. Folded: read first, poll as fallback.
14. "About 2 minutes of setup measured". Folded: 19 s measured with the cache, the rest named as headroom for the cold install.
15. The YAML reader unnamed, and W6's block form. Folded: `ciJob` in `test-support/ci-job.ts` with a file argument; W6 forbids block `run:` values.
16. One flaky control voids its selection. Answered: kept strict, the trade-off named (call 15); narrowing would launder a flake into a verdict.
