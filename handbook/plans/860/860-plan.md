# Issue #860 plan: a newer push to a pull request cancels the run still going on its older head

**Planned at**: `origin/main` f41b4f3c87a8fee233b3d7d1fbf1dcb2b085633a; Issue #860 read with 2 comments (`gh api repos/ahl-gram/Vellum/issues/860/comments --jq length`), the two rulings comments below.

**Rulings**: Alex, 2026-10-13, https://github.com/ahl-gram/Vellum/issues/860#issuecomment-6152733796, with point 3 corrected by https://github.com/ahl-gram/Vellum/issues/860#issuecomment-6152790485. In his selections: 1, "Builder lane now (Recommended)"; 2, "Each gets its own lane (Recommended)"; 3, "Accept the loss, add no rules", then on the two pieces of wording, "drop only the gate 2 sentence"; 4, "No new file". This plan folds them: a lane builds it now beside Issue #779 part 2i; runs on main and runs started by hand each get a concurrency group of their own; the site spec gains a bullet that describes the new behavior and adds no rule, and `vellum-footguns` Gate 2 is not edited; the two checks go into `test/repo/proof-runner-workflow.test.ts`, which the bullet cites as its pin. The orchestrating session's condition on the correction (the bullet cites Gate 2 item 10 for nothing that gate does not say) is met by cutting the bullet's one sentence that rested on the dropped Gate 2 sentence.

**Open decisions**: none.

One pull request. Archive path: `handbook/plans/860/860-plan.md`.

## Specs

Read these first, at these sections, on top of the reading `CLAUDE.md`'s spec table owes:

- `handbook/specs/site-architecture.md`, "Build, check and deploy": the bullets "CI is parallel jobs on the same triggers" and "Required checks are matched by JOB NAME". This plan adds a bullet between them.
- `handbook/specs/check-placement.md`, "The unit suite": a test may read a workflow as DATA and pin its shape.
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" (prescriptive voice; a backticked path is scanned by `test/repo/prose-paths.test.ts` and must not wrap across a line; `Issue #N` form) and the comment doctrine "The comment sweep" points at (the two one-line blind-spot comments below are the house's scanner form).
- `handbook/specs/orchestration.md`, "Merging" (`--match-head-commit` reads only the final head) and "While lanes run" ("Watch CI yourself").
- `handbook/specs/development-workflow.md`, steps 8 to 15; step 11's paragraph on the CI proof runner.
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 1 (items 1, 3, 4, 6, 9), Gate 7 (items 1 and 3; the PR #380 scar behind item 3 is in `.claude/skills/vellum-footguns/references/scars.md`), Gate 2 item 10 (read, not edited), Gate 5.

## The design

Add one workflow-level `concurrency` block to `.github/workflows/ci.yml`, between the `on:` block and the comment line that opens `# Independent jobs run in parallel`, with no comment of its own:

```yaml
concurrency:
  group: ci-${{ github.event_name }}-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

What each event gets:

| event | group | cancel-in-progress | effect |
|---|---|---|---|
| `pull_request` (opened, synchronize, reopened) | `ci-pull_request-<PR number>` | true | the pull request's newest run cancels any of its older runs, running or waiting |
| `push` to `main` | `ci-push-<run id>`, unique to the run | false | alone in its group: never cancelled, never waits |
| `workflow_dispatch` | `ci-workflow_dispatch-<run id>`, unique | false | the same |

Why this shape, measured or read:

- **Groups are repository-wide and case-insensitive, and the default queue keeps one waiting run and cancels any older waiting one, whatever `cancel-in-progress` says** (GitHub's workflow syntax page, `concurrency`: "By default, any existing `pending` job or workflow in the same concurrency group will be canceled"; "concurrency group names must be unique across workflows"). So main's runs must not share a group: in one shared group they would run one at a time, and a waiting main run would be dropped when a third merge lands during a run. Over the 56 main push runs since 2026-10-06 (`gh run list -R ahl-gram/Vellum --workflow ci.yml --limit 600`, whose oldest run is 2026-09-23T17:38:21Z, so the window is whole; simulated over each run's real duration), a shared group would have held 3 of them, the longest 8.0 minutes, and dropped none. The run id gives each non-pull-request run a group nobody else is in, which is ruling 2. It is GitHub's own documented fallback idiom (`${{ github.head_ref || github.run_id }}` on the same page).
- **`ci-` prefix**: the other two workflows hold the groups `pages` (`.github/workflows/deploy.yml`) and `proof-runner` (`.github/workflows/proof-runner.yml`); no CI group can equal either.
- **The event name in the group** keeps a pull request number and a run id from ever meeting in one name.
- **Keyed on the pull request number**, which names the pull request whatever its branch is called, as the issue asks ("keyed to the pull request").
- **No `queue:` key**: the default single queue is what the pull request group wants (the newest waiting run wins). The docs refuse `queue: max` beside `cancel-in-progress: true`.
- **Workflow level, not job level**: the whole run on a superseded head goes, all seven jobs.
- **Placement above `jobs:`**: `test/repo/e2e-tiers.test.ts`'s coverage test slices `ci.yml` from the first `test:e2e:lanes` to the end and refuses `github.event_name` there; the block above `jobs:` is outside that slice.
- **Validated locally**: `actionlint` 1.7.12 (`/opt/homebrew/bin/actionlint`) exits 0 on today's `ci.yml` and on it with this block added, and exits 1 on a negative control whose group reads `${{ env.FOO }}` ("context \"env\" is not allowed here"), so it does check the group's contexts. It checks syntax and contexts only, never which runs cancel.

Required checks: branch protection on `main` requires seven contexts, matched by job name, `strict: false`, no rulesets (`gh api repos/ahl-gram/Vellum/branches/main/protection`; `gh api repos/ahl-gram/Vellum/rulesets` returns `[]`). This change renames no job and adds none, so the required list does not move. A cancelled run's checks attach to the superseded head's sha; protection reads the pull request's current head, whose newest run this block never cancels, since nothing newer exists to cancel it. The proof runner's cap test ("the prove matrix leaves room ...", same file as the new checks) counts `ci.yml`'s matrices, which do not change.

**What cancelled runs cost, accepted by ruling 3**: since 2026-10-09, 21 of 107 pull request runs were overtaken by a newer push while still running; 6 of those are cited as timing sources in `test/e2e/lane-timings.test.ts`'s provenance line and 2 in `.claude/skills/vellum-footguns/references/flake-record.md` (run 38068834224's lane D would have been cancelled before it failed, so its row would not exist; run 38325126279 would read `cancelled` with a red lane C inside). Under this change such runs end cancelled. No rule is added for it: Gate 2 item 10 stands as it is. The site spec bullet describes the behavior and names the hand-started run a lane re-measuring `MEASURED_SECONDS` uses for a second complete run of one head.

### Alternatives rejected

- **The issue's first suggestion, a group keyed `github.event.pull_request.number || github.ref` with the conditional `cancel-in-progress` alone**: main's pushes then share `refs/heads/main`'s group, so they queue and a waiting one is dropped, against the issue's own "A push to `main` is never cancelled"; ruling 2 took the run-id group. This is the red stub of commit 1 (below).
- **`cancel-in-progress: true` unconditionally**: equivalent today, since every non-pull-request group holds one run. Rejected because the conditional states "pull request runs only" on the line that cancels, and a later edit that let main's runs share a group could still not cancel one already running.
- **`github.head_ref` instead of the pull request number**: names the branch, not the pull request.
- **A job-level `concurrency`**: would cancel job by job and leave a run half alive.
- **A test that evaluates the expressions** with a small evaluator of GitHub's expression language: a second implementation that agrees with itself (Gate 1 item 19). The exact-lines shape pin is Gate 7 item 3's form and this file's own precedent ("proof runs queue one at a time ..."); the pull request's own CI is the real evaluator, read as evidence below.
- **Moving `topBlock` to `test-support/`**: the new checks live in the file `topBlock` already lives in (ruling 4), so it gains a `workflow` parameter in place and nothing else imports it.
- **A test that the three workflows' groups are distinct**: `deploy.yml`'s group is pinned by no test, and the `ci-` prefix already keeps CI's apart; nothing measured asks for it.
- **A Gate 2 item 10 sentence on a red inside a cancelled run, and the bullet's sentence pointing at it**: ruling 3 as corrected ("drop only the gate 2 sentence") and the orchestrating session's condition on it.

## Files

| file | change |
|---|---|
| `.github/workflows/ci.yml` | add the three-line `concurrency` block above, with one blank line before and after it, between `  workflow_dispatch:` and the `# Independent jobs run in parallel ...` comment line. Nothing else in the file changes. |
| `test/repo/proof-runner-workflow.test.ts` | `CI_WORKFLOW`, `uncommented`, `topBlock` given a `workflow` parameter, and two new tests, all below. About 135 lines after (109 at f41b4f3c). |
| `test/repo/e2e-tiers.test.ts` | one test's title only, below: the correction of the one existing line this change makes untrue. Line count unchanged at 399. |
| `handbook/specs/site-architecture.md` | add one bullet, below. |
| `handbook/plans/860/860-plan.md` | new: this plan, copied unchanged. |

`.claude/skills/vellum-footguns/SKILL.md` is not edited.

### `test/repo/proof-runner-workflow.test.ts`

1. After `const WORKFLOW = ".github/workflows/proof-runner.yml";` add:

```ts
const CI_WORKFLOW = ".github/workflows/ci.yml";
```

2. Directly above the existing one-line comment that opens `// A top-level block is a key at column 0`, add:

```ts
const uncommented = (workflow: string): string[] =>
  readFileSync(join(ROOT, workflow), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"));

```

3. `topBlock` becomes, its comment line above it unchanged:

```ts
const topBlock = (key: string, workflow = WORKFLOW): string[] => {
  const lines = uncommented(workflow);
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  assert.notEqual(at, -1, `${workflow} has no top-level ${key}, so this reader is looking at the wrong shape`);
  const end = lines.findIndex((l, i) => i > at && /^\S/.test(l));
  return lines.slice(at, end === -1 ? lines.length : end).filter((l) => l.trim() !== "");
};
```

Its three existing calls, `topBlock("on")`, `topBlock("permissions")` and `topBlock("concurrency")`, stay as they are and read `proof-runner.yml` by the default. `TEXT` stays: the permissions sweep, the job-id sweep and the run-line sweep read it.

4. Directly after the test "proof runs queue one at a time, every waiting run kept rather than the default queue's cancelling", add:

```ts
test("a newer push to a pull request cancels the CI run still going on its older head, while a push to main or a run started by hand takes a group of its own and is never cancelled or held (Issue #860)", () => {
  assert.deepEqual(topBlock("concurrency", CI_WORKFLOW), [
    "concurrency:",
    "  group: ci-${{ github.event_name }}-${{ github.event.pull_request.number || github.run_id }}",
    "  cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
  ]);
});

// Blind spot, with its direction: a quoted key (`"concurrency":`) or one inside a flow mapping slips past this sweep, a miss and never a false red.
test("ci.yml sets concurrency once, for the whole workflow, so no job's own group can cancel or hold a run on main", () => {
  assert.deepEqual(
    uncommented(CI_WORKFLOW).filter((l) => /^\s*concurrency\s*:/.test(l)),
    ["concurrency:"],
    "ci.yml sets concurrency somewhere other than once at the top, so a job's own group can cancel or hold a run on main",
  );
});
```

Layout is Prettier's (`npm run format`).

### `test/repo/e2e-tiers.test.ts`

The test titled `every CI trigger gets the same full coverage, so nothing is conditional on the event` (line 292 at f41b4f3c) is renamed `every CI trigger gets the same full coverage, so no e2e step is conditional on the event`. Its body does not change: it reads from the e2e step down, and the new `concurrency` block above `jobs:` is conditional on the event, so the old title becomes untrue while the check stays right.

### `handbook/specs/site-architecture.md`, the new bullet

Inserted as its own bullet after the one ending "two lanes is visible instead of silent." and before "**Required checks are matched by JOB NAME ...**", wrapped exactly so (no backticked span crosses a line):

```markdown
- **A pull request's newest run cancels any of its own runs still going, and no other run is ever
  cancelled that way.** A push to `main` and a run started by hand each take a concurrency group of
  their own, so every merge's own run finishes and none waits behind another; the `concurrency`
  block in `.github/workflows/ci.yml` holds this and `test/repo/proof-runner-workflow.test.ts` pins
  it. Merging reads only the newest run on the final head. A lane that needs a second complete run
  of one head, to re-measure `MEASURED_SECONDS`, starts one with
  `gh workflow run ci.yml --ref <branch>`, which no newer push cancels.
```

It cites no gate.

## Tests, in the order they are written

1. **T1**, `test/repo/proof-runner-workflow.test.ts`, "a newer push to a pull request cancels the CI run still going on its older head, while a push to main or a run started by hand takes a group of its own and is never cancelled or held (Issue #860)". Assertion: `topBlock("concurrency", CI_WORKFLOW)` deep-equals the three exact lines. **Stub that reds it on that assertion** (commit 1's `ci.yml`): the block with main's runs in one group, `  group: ci-${{ github.event_name }}-${{ github.event.pull_request.number || github.ref }}` and the final `cancel-in-progress` line. Red: the deepEqual diff on the `group` line (`github.ref` against `github.run_id`). A red on "has no top-level concurrency" means the stub is missing, not the behaviour: fix the stub, not the test. **Mutations that red it once green** (each one line of `ci.yml`): `github.run_id` to `github.ref` on the group line; `==` to `!=` on the cancel line; the group's operands swapped (`github.run_id || github.event.pull_request.number`); the cancel line to `  cancel-in-progress: false`; the three lines deleted (the anchor message).
2. **T2**, same file, "ci.yml sets concurrency once, for the whole workflow, so no job's own group can cancel or hold a run on main". Assertion: the uncommented lines of `ci.yml` matching `/^\s*concurrency\s*:/` deep-equal `["concurrency:"]`. It is green on commit 1's stub (one block), so it has no red of its own at commit 1; the prover proves it. **Mutations that red it**: three lines added inside `build-and-e2e` after `    runs-on: ubuntu-latest`: `    concurrency:`, `      group: e2e-${{ github.ref }}`, `      cancel-in-progress: true`; and the top-level block deleted (found `[]`).
3. **The reader's change**, no new test: the file's three existing tests "the proof runner starts only by hand, never on a push or a pull request", "no job can push: the token reads contents only, and no checkout keeps its credentials" and "proof runs queue one at a time, every waiting run kept rather than the default queue's cancelling" now read through `topBlock`'s default `workflow` and `uncommented`. **Mutations that red them through the changed reader**: in `.github/workflows/proof-runner.yml`, `  queue: max` to `  queue: single`; a line `  push:` added under `on:`; `  contents: read` to `  contents: write`.
4. **The e2e-tiers rename and the spec bullet** change a title and prose only, and carry no mutation; `test/repo/prose-paths.test.ts` reads the bullet's two paths.

**The prover owes** (one round, `vellum-guard-prover`, unit tests only, after commit 4 is committed): T1's five mutations, T2's two, and the three proof-runner mutations through the changed reader. **Step 15 leaves to the implementer** any guard changed after that round, proven by breaking what it guards, committed first.

## Order of commits

Each subject starts `#860`; each message ends with the trailer block `CLAUDE.md`'s Process section gives.

1. `#860 Archive the plan, and pin CI's concurrency block red: main's runs still share one group` : `handbook/plans/860/860-plan.md`, `test/repo/proof-runner-workflow.test.ts` (all four changes above), and the stub block in `.github/workflows/ci.yml`. Before committing, `node --test test/repo/proof-runner-workflow.test.ts` prints T1 failing on the group line and every other test in the file passing; paste T1's red line for the body. Push (`git push -u origin <branch>`). No CI run starts: `ci.yml` runs on pull requests, and none is open yet.
2. `#860 A pull request's newest CI run cancels its older ones; main and hand-started runs each keep a group of their own` : the group line's `github.ref` becomes `github.run_id`. T1 and T2 green. Push.
3. `#860 The e2e-tiers coverage test's title says what it reads: no e2e step is conditional on the event` : `test/repo/e2e-tiers.test.ts`. **Commit, do not push.**
4. `#860 Say in the site spec what CI cancels and what it never does` : `handbook/specs/site-architecture.md` only. **Commit, do not push.** Commits 3 and 4 are held for the evidence run (below), because a pull request run starts only once the pull request exists.

Then steps 10 to 12 (verify, the prover on commit 4's head, the calls comment), step 13 opens the pull request at commit 2's head with `gh pr create --head <b> --body-file <file>` (the `--head` keeps `gh` from pushing the held commits), and at once `gh pr view <PR> -R ahl-gram/Vellum --json headRefOid` must read `<sha2>`. Then the evidence run's first half (below) pushes commits 3 and 4, and the implementer stops and reports; the dispatcher watches CI and sends it on; the second half reads the runs, the body is edited with the run ids, then step 14.

## Rosters and doctrine

- **Rosters joined**: none. No file is created but the plan. `main`'s required checks do not move (no job renamed or added; Gate 4 item 2: state it in the body with the protection command).
- **The new bullet** in `handbook/specs/site-architecture.md` describes the behavior and adds no rule (ruling 3 as corrected); it is the one place the house states what CI cancels.
- **`vellum-footguns` Gate 2 item 10 is not edited** (ruling 3 as corrected): it says a red is yours and is re-run once, and names no run to re-run, so the change does not contradict it.
- **The one existing line the change makes untrue, corrected**: `test/repo/e2e-tiers.test.ts`'s test title "every CI trigger gets the same full coverage, so nothing is conditional on the event", whose last clause is false once `ci.yml` carries an event-conditional block. The test's rule (PR #383, "a PR now proves exactly what main proves") is about coverage, which this change keeps, so only the title moves.
- **Lines read and left, since the change does not contradict them**: `ci.yml`'s comment "every job runs on every trigger" (every job still starts on every trigger); `handbook/specs/site-architecture.md`'s "CI is parallel jobs on the same triggers" and its `MEASURED_SECONDS` line ("corrected from its pull request's own lane log": the final head's run still completes); `handbook/specs/development-workflow.md` step 11's sentence on a second set of CI checks waiting behind a proof; `handbook/errata/guards.md`'s PR #842 row, which names cases this change does not touch. Surveyed with `git grep -niI cancel` and `git grep -nIE "gh run|gh pr checks|required check|previous head"` over the specs, agents and skills, 2026-10-13.
- **The issue body's first suggestion** ("A conditional `cancel-in-progress` ... does this") and its "nothing the house relies on is lost" are superseded by rulings 2 and 3; the step 12 comment points at the two rulings comments.

## Evidence

Local, each command named in the body:

- `node --test test/repo/proof-runner-workflow.test.ts` red at commit 1 (T1 only), green at commit 2.
- `node --test test/repo/proof-runner-workflow.test.ts test/repo/e2e-tiers.test.ts test/e2e/skips.test.ts test/repo/format.test.ts test/repo/lint-wiring.test.ts test/repo/prose-paths.test.ts test/repo/test-collection.test.ts`: every file that reads `ci.yml`, the prose scan over the new bullet, and the collection check, green at commit 4.
- `actionlint -shellcheck= -pyflakes= .github/workflows/ci.yml` exits 0.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- e2e: no suite is touched and none runs locally; CI runs every lane.

On the pull request's own CI, after step 13 opens it at commit 2's head (`<b>` the branch, `<PR>` its number, `<sha2>`, `<sha3>` the commits' shas).

**First half, the implementer, straight after step 13.** First read `gh run list -R ahl-gram/Vellum --workflow proof-runner.yml --limit 5 --json databaseId,status`: when any run there reads `queued` or `in_progress`, every wait below is bounded at thirty minutes, otherwise at ten, since a proof run holds twelve of the account's runner slots. Each wait is a background until-loop polling every 30 seconds; a wait that hits its bound is a hand-back. "A run has a job running" means `gh run view <run id> -R ahl-gram/Vellum --json jobs --jq '[.jobs[] | select(.status == "in_progress")] | length'` prints more than 0, the run id read from `gh run list -R ahl-gram/Vellum --workflow ci.yml --branch <b> --limit 5 --json databaseId,event,headSha,status,conclusion`. A run cancelled while it only waited proves nothing about `cancel-in-progress`, because the default queue cancels a waiting run anyway; these waits make sure each run is cancelled while a job of it runs.

1. Wait until the `pull_request` run on `<sha2>` has a job running.
2. `git push origin <sha3>:refs/heads/<b>` (commit 3 alone).
3. Wait until the `pull_request` run on `<sha3>` has a job running; then `gh workflow run ci.yml -R ahl-gram/Vellum --ref <b>`; wait until a `workflow_dispatch` run on `<sha3>` is listed.
4. `git push origin <b>` (commit 4). Stop here and report to the dispatcher: the four shas, the run ids listed so far, and that the lane is down to waiting on CI.

**The dispatcher** watches until no run on `<b>` is pending (`handbook/specs/orchestration.md`, "Watch CI yourself"), then sends the lane on.

**Second half, the implementer, when sent on.**

5. Read `gh run list -R ahl-gram/Vellum --workflow ci.yml --branch <b> --limit 10 --json databaseId,event,headSha,status,conclusion,createdAt,updatedAt`. Expected: the `pull_request` runs on `<sha2>` and `<sha3>` read `cancelled`; the `pull_request` run on `<sha3>` has an `updatedAt` no earlier than the `createdAt` of the `pull_request` run on commit 4 (so the dispatched run's start did not cancel it); the `workflow_dispatch` run on `<sha3>` reads `success`; the `pull_request` run on commit 4 reads `success`.
6. For each of the two cancelled runs, `gh run view <run id> -R ahl-gram/Vellum --json jobs --jq '.jobs[] | "\(.name) \(.status) \(.conclusion) \(.startedAt)"'`: at least one job of each carries a `startedAt` and reads `cancelled`. For one job id of the run on `<sha3>`, `gh api repos/ahl-gram/Vellum/check-runs/<job id>/annotations --jq '.[].message'`; record what each prints, an empty list included.
7. `gh pr checks <PR> -R ahl-gram/Vellum` (the seven required checks pass on commit 4) and `gh pr view <PR> -R ahl-gram/Vellum --json headRefOid,mergeStateStatus` (expected `CLEAN`), while the cancelled runs sit on `<sha2>` and `<sha3>`.
8. Edit the body with steps 5 to 7's run ids and readings (`gh pr edit <PR> --body-file <file>`, one call; verify in the next), then step 14.

Which Verify line each answers:

| the issue's Verify line | evidence |
|---|---|
| "A pull request receiving two pushes in quick succession shows the first run cancelled and the second complete." | step 5: commit 3's run cancelled by commit 4's push, commit 4's run `success` (and the opening's run on `<sha2>` cancelled by commit 3's push). |
| "A merge to `main` while a pull request's run is in flight cancels neither." | before the merge, the stand-in only: step 5's dispatched run, a run that is not a pull request's, ran beside the pull request's run on the very same branch and neither cancelled the other. The real case is **UNVERIFIABLE before the merge**; after it, the dispatcher reads `gh run list -R ahl-gram/Vellum --workflow ci.yml --limit 100 --json databaseId,event,headBranch,status,conclusion,createdAt,updatedAt` and checks that, from the merge on, no `push` run reads `cancelled`, and no `pull_request` run whose start-to-finish overlaps a `push` run reads `cancelled` unless a newer `pull_request` run on its own branch was created inside its window. |
| "`test/repo/` holds tests that read `ci.yml` as data; extend one to pin the group and the event condition, red first." | T1, red at commit 1; T2, proven by the prover. |
| (the dispatcher's brief to the planner) a cancelled run leaves no required check pending or red on the head that merges | step 7. |

**UNVERIFIABLE**, named in the body and asked of nothing: whether re-running a superseded head's cancelled run would cancel the newer head's run.

`vellum-plate-reader`: not owed (no presentation change). `vellum-guard-prover`: owed, as above. The evidence run costs one extra set of seven CI jobs (the dispatched run).

## Calls made

1. The group expression and its `ci-` prefix, event name and pull request number, on the rules in "Why this shape" (GitHub's documented queue and scope; the issue's "keyed to the pull request"; ruling 2).
2. The conditional `cancel-in-progress` over plain `true`: it states the scope on the line that cancels (issue: "Pull request runs only").
3. A run started by hand is never cancelled: the issue says "Pull request runs only", and ruling 2 gives it its own group.
4. No `queue:` key: the docs' default is what the pull request group wants.
5. The block above `jobs:` with no comment: a test pins it, and `test/repo/e2e-tiers.test.ts`'s event slice starts at the e2e step.
6. The checks are an exact-lines shape pin plus a one-key sweep (Gate 7 item 3; Gate 1 item 6 for the job-level sweep), not an expression evaluator.
7. With ruling 4, `topBlock` stays in its file and gains a `workflow` parameter defaulting to the proof runner's, beside a new local `uncommented` and the constant `CI_WORKFLOW`; nothing moves to `test-support/`. The names are the planner's.
8. The red stub is the rejected design with main's runs in one group, so the red names the defect the design avoids.
9. Commits 3 and 4 are held unpushed until the pull request is open, against the push-early default, because a pull request run starts only once one exists and the evidence needs two pushes on an open pull request; the pull request is opened with `--head <b>` so `gh` pushes nothing, and the evidence splits at commit 4's push so the implementer stops when it is down to waiting on CI, as its definition says.
10. One run started by hand during the evidence, costing seven extra CI jobs, so the non-pull-request half is seen beside a pull request's run before the merge rather than only after it.
11. The e2e-tiers title is corrected as the one existing line the change makes untrue; every other line in "Rosters and doctrine" is left because the change does not contradict it.
12. The bullet's wording, with its sentence on a red inside a cancelled run cut under ruling 3 as corrected and the orchestrating session's condition; it cites `test/repo/proof-runner-workflow.test.ts` as its pin under ruling 4.
13. Merge order beside Issue #779: no 779 lane edits `ci.yml` now (no open pull request touches it; Issue #779 part 2h's comment 6140131566 reports four lanes standing). Should a five-lane split land first, this branch takes `git merge origin/main` and keeps both edits, as the issue's own "When" says; the two edits sit in different parts of the file. The same holds for `test/repo/e2e-tiers.test.ts` and `test/repo/proof-runner-workflow.test.ts`, which part 2i's survey of test file reads lists, should 2i edit either.

## Open decisions

None.

## Stop conditions

Hand back, rather than adapt, when:

- `git diff f41b4f3c origin/main -- .github/workflows/ci.yml` shows any change above `jobs:`, or `git diff --stat f41b4f3c origin/main -- test/repo/proof-runner-workflow.test.ts test/repo/e2e-tiers.test.ts` prints anything. A change to `ci.yml` below `jobs:` alone (a lane split) is merged and kept, not a hand-back. A change to `handbook/specs/site-architecture.md` is built on as it stands.
- `topBlock` in `test/repo/proof-runner-workflow.test.ts` is not at lines 19 to 26 with exactly the three calls named above, or the e2e-tiers title is not at line 292 as quoted.
- T1 does not red at commit 1 on the `group` line's deepEqual diff, or T2 or any other test in the file reds at commit 1.
- Any test outside `test/repo/proof-runner-workflow.test.ts` goes red after a `ci.yml` edit (for instance `test/repo/e2e-tiers.test.ts`'s coverage test).
- `actionlint` exits non-zero on the edited `ci.yml`, or a run on the pull request fails at startup with no jobs (a workflow file error).
- After step 13, `headRefOid` is not `<sha2>` (the held commits went up with the pull request, and the cancel evidence is gone).
- A window is missed: the `pull_request` run on `<sha2>` reads `completed` before commit 3's push, or the `pull_request` run on `<sha3>` reads `completed` before commit 4's push. Hand back; do not make an extra commit to retry.
- Evidence step 5: a `pull_request` run on `<sha2>` or `<sha3>` does not read `cancelled`, the run on `<sha3>` was cancelled before commit 4's run was created, or the dispatched run reads `cancelled`.
- Evidence step 6: a cancelled run has no job with a `startedAt` (it was cancelled while it only waited, which is not evidence).
- After any `git merge origin/main`, `npm run lint` flags a line this plan adds (Issue #779 part 2i is writing a lint rule about what a test may read, and `uncommented` reads `ci.yml` with `readFileSync` inside the test file, a workflow read that `handbook/specs/check-placement.md` calls data).
- Evidence step 7: `mergeStateStatus` reads `BLOCKED` while all seven required contexts on the head read success.
- `gh api repos/ahl-gram/Vellum/branches/main/protection --jq '.required_status_checks.contexts'` names other contexts than the seven: `check & test 1 of 3` to `3 of 3`, `build & e2e lane A` to `D`.
- A prover mutation listed above leaves its test green.
