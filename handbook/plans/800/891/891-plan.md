# Issue #891 plan: what a re-run of an older head and a merge to main do to a pull request's CI run

**Planned at**: `origin/main` 47f2d47dac26405b3e3e38456694713d54afb873; Issue #891 read with 1 comment (`gh api repos/ahl-gram/Vellum/issues/891/comments | jq length`), the rulings comment below.

**Rulings**: Alex, 2026-11-09, https://github.com/ahl-gram/Vellum/issues/891#issuecomment-6748405463. In his selections: D1, "No, the real sighting is the reading (Recommended)"; D2, "Describe it in the site spec, add no rule (Recommended)". This plan folds them: no staged run is made, and the PR #1058 incident is hazard 1's reading; the CI concurrency bullet gains one plain-fact sentence and a corrected lead, `scars.md` gains the incident's row and `handbook/errata/prose.md` the row for the flake record's backwards timeline; no instruction is added anywhere and no follow-up issue to change the CI setting is filed. The planner's calls stood unchallenged.

**Open decisions**: none.

One pull request. Archive path: `handbook/plans/800/891/891-plan.md`.

## What recon and the planner's own reads found

`vellum-spec-recon` (2026-11-09, at 47f2d47d): 14 claims, 14 CURRENT, 0 STALE, 0 UNVERIFIABLE. No stale claim changed the plan. It confirmed: the `concurrency` block in `.github/workflows/ci.yml` (lines 9 to 11) is the one the issue quotes; the bullet in `handbook/specs/site-architecture.md` (lines 377 to 382, "A pull request's newest run cancels any of its own runs still going ...") is silent on re-runs; T1 in `test/repo/proof-runner-workflow.test.ts` ("a newer push to a pull request cancels the CI run still going on its older head, while a push to main or a run started by hand takes a group of its own and is never cancelled or held (Issue #860)") pins the three lines as text; `handbook/plans/800/860/860-plan.md` line 219 names hazard 1 UNVERIFIABLE; no `handbook/errata/` row is about CI's concurrency; the proof runner's group (`proof-runner`) cannot meet CI's. Recon left two things open: whether hazard 2's stricter half holds, settled below by the planner's reads, and whether hazard 1 needs a scratch run at all, which Alex ruled it does not (D1). The planner also read all 5 comments on Issue #860 and PR #890's body (PR #890 has 0 comments): comment 6153675191 (Alex, 2026-10-13) is the ruling that filed this issue ("File one issue for both") and the one that made the bullet "plain facts with no instruction" ("State only what is true"), which binds the wording below.

### Hazard 2, a merge to main beside a pull request's run: settled from the run history

Read 2026-11-09 at about 17:55 UTC, the window from PR #890's merge (2026-10-13T19:48:53Z) to then. Both listings are whole windows: main's oldest row is 2026-09-27T13:49:22Z and the pull request listing's oldest is 2026-09-24T01:06:13Z, each before the merge.

- `gh run list --repo ahl-gram/Vellum --workflow ci.yml --branch main --limit 300 --json event,conclusion,status,headSha,createdAt,updatedAt,databaseId,attempt`: 198 `push` runs since the merge, the first 38457834688 (PR #890's own merge run) and the last 42664755938; 190 `success`, 8 `failure`, **0 `cancelled`**. The 3 hand-started runs on main in the window (42619834618, 42619851853, 42659141247) all read `success`.
- `gh run list --repo ahl-gram/Vellum --workflow ci.yml --event pull_request --limit 1000 --json event,conclusion,status,headSha,headBranch,createdAt,updatedAt,databaseId,attempt,startedAt`: 540 pull request runs in the window, 138 `cancelled`.
- Overlap (program H2-3 below): 83 of the 198 push runs had at least one pull request run going beside them, 148 pairs in all, the most six beside push run 41375303175 (2026-11-02T01:59:38Z to 02:13:54Z). Example: push run 42258912829 (2026-11-06T17:08:47Z to 17:19:45Z) beside pull request run 42259641940 (17:13:26Z to 17:24:28Z), both `success`.
- Every one of the 138 cancelled pull request runs had a newer run on its own branch created inside its own window (program H2-4): 138 explained, 0 unexplained.
- Of the 138, 28 overlapped a push run. For 27 of them the first cancelled job's annotation (`gh api repos/ahl-gram/Vellum/check-runs/<job>/annotations`) reads `Canceling since a higher priority waiting request for ci-pull_request-<N> exists`, its own pull request's group, never a `ci-push-` one. The 28th, 41034904297, has no job at all (`.../runs/41034904297/attempts/1/jobs` total 0): it was cancelled while still waiting, and is among the 138 explained.
- Not held either: for each of the 83 overlapped push runs, the first job started 2 to 83 seconds after the run was created (`.../runs/<id>/attempts/1/jobs`, the earliest `started_at`), median 3; the slowest, 41091909245 at 83 seconds, started beside proof run 41091457884 (2026-10-30T16:36:39Z to 16:45:52Z), whose jobs hold runner slots, a wait for a runner and not for a group.

So both halves of PR #890's own criterion (`handbook/plans/800/860/860-plan.md`, its Verify table) hold: no push run reads `cancelled`, and no pull request run beside a push run was cancelled by anything but a newer run of its own pull request. The bullet already says this ("every merge's own run finishes and none waits behind another"), so hazard 2 changes no line; its result goes on the issue, carried by the implementer's comment (Evidence, step 3).

The dispatcher's brief expected pull request runs beside today's merges of Issue #1273's pull requests. Today's data does not bear that out: none of the 8 push runs on 2026-11-09 overlapped a pull request run, since those merges were made one after another. The 83 overlapping runs above are from earlier days.

### Hazard 1, a re-run of an older head: already seen for real, on PR #1058

Every time below is 2026-10-25, UTC, read with `gh api repos/ahl-gram/Vellum/actions/runs/<run>/attempts/<n>` and `.../attempts/<n>/jobs`, and `gh api repos/ahl-gram/Vellum/check-runs/<job>/annotations`. Branch `docs/1048-layout-derived-number-rule`, group `ci-pull_request-1058`; between 07:45:56 and 08:07:14 there was no run on that branch other than these two.

| time | what happened | run, attempt, job |
|---|---|---|
| 07:45:40 | run on head `09fb4eb0` starts | 40173993060 attempt 1 |
| 07:55:58 | it completes `failure` (lane C red, AT1) | the other six jobs `success` |
| 07:56:42 | the lane's push of head `a9cb1aac` starts a run; its seven jobs start at 07:56:45 | 40174696546 attempt 1 |
| 07:56:54 | the failed job on the OLDER head is re-run (lane C only) | 40173993060 attempt 2, job 121112791423 starts 07:57:02 |
| 07:56:57 to 58 | all seven jobs of the newer head's run are cancelled, each annotated `Canceling since a higher priority waiting request for ci-pull_request-1058 exists` (job 121112743586 read) | 40174696546 attempt 1, concludes `cancelled` |
| 07:57:33 | the newer head's run is re-run by hand (`triggering_actor` ahl-gram) | 40174696546 attempt 2 |
| 07:57:49 | the older head's re-run is cancelled before its lane C finishes, the same annotation (job 121112791423 read) | 40173993060 attempt 2, `cancelled` |
| 08:07:15 | the newer head's re-run passes | 40174696546 attempt 2, `success` |

So a re-run is a new request in the pull request's group and wins it as the newest run, whatever head it is on: re-running one failed job of an older head's run cancelled the newer head's whole run, and the newer head's re-run then cancelled the older one's. `gh run list` shows only each run's latest attempt, which is why 40174696546 reads `success` there and nothing flagged this.

What it covers and what it does not: the run re-run here had FAILED, and one job of it was re-run. The issue's recipe names a CANCELLED run, re-run whole. GitHub's re-run page (docs.github.com, "Re-running workflows and jobs", read 2026-11-09) says nothing about concurrency. The plan argues the direction rather than claiming the second case measured: a whole re-run of a cancelled run is the same kind of request, a new attempt of the run, and the workflow-level group is evaluated for every attempt, so it joins the group the same way; if that is wrong, the sentence below overstates a hazard, which is the safe direction. Alex ruled that the sighting is the reading and no staged run is made (D1, comment 6748405463).

It is the only sighting. Of the 23 pull request runs created since the merge and re-run since (`attempt` above 1 in the pull request listing above), 12 had a newer run on their branch at some time, and only 40173993060 was re-run while that newer run was going (the planner's read: for each re-run, the runs on its branch created after it, and whether one of them was created before the re-run's `startedAt` and last updated after it). A run re-run more than once shows only its last attempt's start, and for every one of those 12 but 40173993060 the newer runs were all created after that last start, so no earlier attempt was hidden.

The same incident shows a sibling defect: the flake record's AT1 row for run 40173993060 (`.claude/skills/vellum-footguns/references/flake-record.md`, the row opening `| 2026-10-25 | AT1 | 40173993060`) keeps an earlier disposition reading "the lane re-ran the failed job and its next push then superseded that run", the order reversed. It goes to an errata row (Calls made, 6).

## Specs

Read these first, at these sections, on top of what `CLAUDE.md`'s spec table owes:

- `handbook/specs/site-architecture.md`, "Build, check and deploy": the bullets "CI is parallel jobs on the same triggers", "A pull request's newest run cancels any of its own runs still going ..." (the one edited) and "`MEASURED_SECONDS` is read from CI's own lane logs" (the line that must stay unchanged, see Order of commits).
- `handbook/specs/conventions.md`, "Where a rule lives" (the routing rule: `.claude/skills/vellum-footguns/references/scars.md` keeps the incident behind a spec line; one normative home) and "How a spec, and the rest of the house's prose, is written" (a backticked path is scanned by `test/repo/prose-paths.test.ts` and must sit on one line; `Issue #N` and `PR #N`, never bare; no volatile state).
- `handbook/errata/README.md`, "A row".
- `handbook/specs/development-workflow.md`, steps 8, 12, 13 and 15.
- `handbook/specs/orchestration.md`, "While lanes run", the bullet opening "A red job on a lane's pull request is read before it is re-run" (read, not edited).
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 5 (items 5, 6, 7 and 8) and Gate 2 item 10 (read, not edited).

## The design

A text change in three files, and the result posted on the issue. No code, no workflow change, no test, no staged run.

1. **The bullet in `handbook/specs/site-architecture.md`** that states what CI cancels gains the re-run: its bold lead says a re-run counts as the newest run, and one sentence says what that does to the current head's run. It stays plain fact with no instruction, as Alex ruled for this issue (D2, comment 6748405463) and, before it, for the bullet on Issue #860: comment 6153675191, ruling 1, "State only what is true", which made the bullet "plain facts with no instruction"; comment 6152790485 (the bullet "describes the new behavior"); and comment 6152733796, ruling 3, "Accept the loss, add no rules". The lead's edit is a correction of a line the finding makes misleading, which comment 6152733796 allows ("Any existing doctrine line the change contradicts is still edited in the same pull request ... that is a correction, not a new rule"). The sentence's "checks then read cancelled" is the same commit check list that ruling 1's bullet already names as what merging reads, where the orchestrating session measured a cancelled run's checks as CANCELLED with the rollup's state FAILURE (comment 6153675191).
2. **A row in `.claude/skills/vellum-footguns/references/scars.md`**, section "Once, and expensive", keeps the PR #1058 incident behind that sentence, since the spec leaves the provenance out.
3. **A row in `handbook/errata/prose.md`**, section "Open", records the flake record's reversed reading, a sibling defect.
4. **Issue #891 gets the readings** of both hazards in the implementer's dated comment (step 12), which is where the issue's Done when asks for hazard 2's result.

### The bullet, exactly

Replace lines 377 to 382 of `handbook/specs/site-architecture.md` (at 47f2d47d), the whole bullet from `- **A pull request's newest run cancels` to `which is what merging reads.`, with exactly these nine lines:

```markdown
- **A pull request's newest run, a re-run included, cancels any of its own runs still going, and no
  other run is ever cancelled that way.** A push to `main` and a run started by hand each take a
  concurrency group of their own, so every merge's own run finishes and none waits behind another;
  the `concurrency` block in `.github/workflows/ci.yml` holds this and
  `test/repo/proof-runner-workflow.test.ts` pins it. A re-run, even of a single job, enters the pull
  request's group as its newest run, so re-running a run of an older head while a run of the current
  head is going cancels the current head's run, whose checks then read cancelled until it is run
  again. A run started by hand is a second full run of one commit, useful for re-timing, and it does
  not replace the pull request's own run in the commit's check list, which is what merging reads.
```

### The scars row, exactly

Append as the last row of the section `## Once, and expensive` in `.claude/skills/vellum-footguns/references/scars.md`, directly after the row that opens `- Later, PR #1042 (Issue #1034):` and its continuation lines, and before the blank line and `## Promoted from the memory triage (Issue #708)`:

```markdown
- Later, PR #1058 (Issue #1048): a re-run of one failed job on an older head cancelled the newer
  head's whole run. Lane C of run 40173993060 failed on head `09fb4eb0`; the lane pushed `a9cb1aac`,
  whose run 40174696546 started its seven jobs at 07:56:45 on 2026-10-25, and the failed job was
  re-run at 07:56:54 as the older run's second attempt. By 07:56:58 every job of the newer run was
  cancelled, each annotated "Canceling since a higher priority waiting request for
  ci-pull_request-1058 exists", and the newer run's own re-run, started at 07:57:33, cancelled the
  older run's second attempt at 07:57:49 before its lane C finished, so the one re-run gave no
  reading. Stands behind `handbook/specs/site-architecture.md`'s bullet that a pull request's newest
  run, a re-run included, cancels its runs still going.
```

### The errata row, exactly

Append as the last row of `## Open` in `handbook/errata/prose.md` (after the row opening `- PR #1283 (2026-11-09, high):`, or after whatever row is last there when you build), one physical line, `<PR>` this pull request's number and `<date>` the day you commit it:

```markdown
- PR #<PR> (<date>, high): the AT1 row for run 40173993060 in `.claude/skills/vellum-footguns/references/flake-record.md` keeps an earlier disposition that reads 2026-10-25's order backwards ("the lane re-ran the failed job and its next push then superseded that run"): the push's run 40174696546 was created at 07:56:42 and the re-run of the older head's failed job at 07:56:54 cancelled it, and that run's own re-run at 07:57:33 cancelled the older head's re-run before its lane C finished, so the one re-run gave no reading (Issue #891). Searched: `grep -rn 40173993060 handbook .claude CLAUDE.md` (the row itself and the Issue #1100 plan's citation of it, nothing else) and the open issues for 40173993060 (none).
```

### Alternatives rejected

- **An errata row in place of the bullet sentence**, the issue's other offered home: an errata row holds a finding left unfixed, and this is a described behaviour of CI whose one home is the bullet that already says what CI cancels (`handbook/specs/conventions.md`, "Exactly one home is normative").
- **Editing the flake record's row in place**: Gate 5 item 7 sends a sibling defect to an issue or an errata row, "not folded", and the row's own text keeps that disposition "as it stood".
- **The run ids and timeline inside the bullet**: specs drop provenance (`handbook/specs/conventions.md`, "State the rule and drop the provenance"); the routing rule gives the incident to `scars.md`.
- **A new sentence in `handbook/specs/orchestration.md`'s re-run bullet or in Gate 2 item 10**: Issue #860's ruling 3 left Gate 2 unedited, comment 6153675191's ruling 1 kept instructions out of the bullet, and that bullet already makes the one push the re-run where both are needed, so it does not set the hazard up; and Alex ruled that no instruction is added (D2, comment 6748405463).
- **A test of the claim**: no test in this repo can run GitHub's choice of which run to cancel. T1 already pins the three lines the bullet describes, so the premise cannot drift without a red.
- **A change to the workflow so a re-run never cancels** (`cancel-in-progress: ${{ github.event_name == 'pull_request' && github.run_attempt == 1 }}`): `actionlint` 1.7.12 exits 0 on a scratch copy of `ci.yml` carrying that line (`actionlint -shellcheck= -pyflakes= <scratch copy>`), which shows only that the context is allowed; whether GitHub then makes the re-run wait is UNVERIFIABLE without its own scratch run, it changes what T1 pins, and it goes past ruling 3 ("add no rules"). Ruled out with no follow-up issue filed (D2, comment 6748405463).
- **A staged run of the issue's exact recipe on a throwaway pull request**: ruled out (D1, comment 6748405463); the PR #1058 sighting is the reading, and a disagreeing staged result would only have narrowed the sentence.
- **Re-reading the annotation and start-lag scripts at build time**: the cheap tallies (H2-1 to H2-4) are re-read to show nothing moved; the annotation and lag readings above are the planner's, dated, and the issue's Done when does not ask for them.

## Files

| file | change |
|---|---|
| `handbook/specs/site-architecture.md` | lines 377 to 382 replaced by the nine lines above. Nothing else in the file changes; line 383 (`- **\`MEASURED_SECONDS\` is read from CI's own lane logs.** ...`) stays byte for byte. |
| `.claude/skills/vellum-footguns/references/scars.md` | one row appended to "Once, and expensive", above. |
| `handbook/errata/prose.md` | one row appended to "Open", above. |
| `handbook/plans/800/891/891-plan.md` | new: this plan, copied unchanged. |

No file under `src/`, `test/`, `test-support/`, `e2e/`, `scripts/` or `.github/` changes. Two of the files are already over 400 lines and each takes one row or three lines: `scars.md` (510 at 47f2d47d, 519 after) and `site-architecture.md` (402, 405 after). Neither is code, and splitting a spec or a ledger is not this issue's; `handbook/errata/prose.md` is 115 lines.

## Tests

None, unit or browser. The change is prose about which run GitHub cancels, which no test in the repo can run (`handbook/specs/development-workflow.md` step 15: "a plain statement that a text edit has no test"). What holds the prose's premise is T1 in `test/repo/proof-runner-workflow.test.ts`, unchanged, which reds if the three `concurrency` lines move. No browser check is added or made longer, so no ledger line and no readings are owed. `vellum-guard-prover`: not owed (no new or strengthened guard). `vellum-plate-reader`: not owed (no presentation change).

The checks the edit itself must pass, run before the first push:

- `node --test test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/proof-runner-workflow.test.ts`: the scan over the backticked paths in the new bullet and the scars row, the memory-pointer scan over the skill file, and T1.
- `git diff -U0 -- '*.md'` read for plus-lines carrying an em-dash (Gate 5 item 6): none.

## Order of commits

Branch: `docs/891-rerun-cancels-current-head`.

1. `#891 Archive the plan, and say in the site spec that a re-run of an older head's CI run cancels the current head's`: `handbook/plans/800/891/891-plan.md`, the bullet, the scars row. Push (`git push -u origin docs/891-rerun-cancels-current-head`).
2. Open the pull request (step 13), then `#891 Add the errata row for the flake record's backwards reading of the 2026-10-25 re-run`: `handbook/errata/prose.md` only, with the number `gh pr create` printed. Push.

Issue #1282's PR #1289 (`chore/1282-even-unit-shards`, open at head 53939c6c03667ad5f26131553e2a535ed94e3b95 when this plan was finished) edits `ci.yml`'s `shard:` matrix line and adds a new bullet in `handbook/specs/site-architecture.md` directly after the `MEASURED_SECONDS` line. It does not touch the `concurrency` block, and this plan does not touch `ci.yml`. The unchanged `MEASURED_SECONDS` line sits between the two edits, so either may merge first. Measured: `git merge-file -p <this plan's bullet edit applied to main's file> <main's file at 47f2d47d> <the file at 53939c6c>` exits 0, prints no conflict marker, and holds both edits (this bullet at line 377, `MEASURED_SECONDS` at 386, PR #1289's `UNIT_SECONDS` bullet at 387, 406 lines), and a three-way merge of two edits gives the same text in either order. Whichever lands second brings its branch current with `git merge origin/main` as step 10 says.

## Rosters and doctrine

- Edited: the concurrency bullet in `handbook/specs/site-architecture.md` (above). It is the one place the house states what CI cancels.
- Added: the scars row and the errata row (above).
- Read and left, since the change does not contradict them:
  - `handbook/specs/orchestration.md`, "While lanes run": "since a push cancels a run still in progress for the same pull request (the `concurrency` group in `.github/workflows/ci.yml`)" stays true, and the bullet's order (the push that carries a rewrite is the re-run) already keeps a re-run from following a push.
  - `.claude/skills/vellum-footguns/SKILL.md` Gate 2 item 10 ("Re-run ONCE, alone, never two PRs concurrently"): names no head; Issue #860's ruling 3 left it unedited.
  - `handbook/specs/settle-doctrine.md` items 12 and 15 on the one re-run: name no head.
  - `.claude/agents/vellum-implementer.md`'s re-run bullets: the dispatcher re-runs; they name no head.
  - `handbook/specs/development-workflow.md` step 11's sentence on a second set of CI checks waiting behind a proof run: the account's job limit, not a group.
  - `handbook/errata/guards.md`'s PR #842 row: the same job limit.
  - The flake record's AT1 row: left as it stands, routed to the errata row.
- Surveyed with `git grep -n -i "concurren\|cancel-in-progress\|superseded"` and `git grep -n -i "gh run rerun\|re-run"` over `handbook/specs`, `.claude` and `CLAUDE.md`, 2026-11-09.

## Evidence

**Step 1, before commit 1: check the plan still stands.**

- `git diff 47f2d47d origin/main -- .github/workflows/ci.yml`: no change in lines 1 to 12 (the `on:` and `concurrency` blocks). A change below `jobs:` alone, Issue #1282's matrix line, is not a hand-back.
- `git diff 47f2d47d origin/main -- handbook/specs/site-architecture.md`: no change inside the bullet at lines 377 to 382. Another change (Issue #1282's new bullet) is built on as it stands.
- `git diff --stat 47f2d47d origin/main -- test/repo/proof-runner-workflow.test.ts`: prints nothing.
- `gh api repos/ahl-gram/Vellum/issues/891/comments | jq length`: equals the count recorded in **Planned at**, the dispatcher's `Plan archive, not a ruling:` comments not counted.

**Step 2, re-read hazard 2 at build time.** Write each program below to the scratchpad under the name given, and run each command alone. `<S>` is the scratchpad path.

- H2-1: `gh run list --repo ahl-gram/Vellum --workflow ci.yml --branch main --limit 400 --json event,conclusion,status,headSha,createdAt,updatedAt,databaseId,attempt > <S>/891-main-runs.json`, then `jq -r 'map(.createdAt) | min' <S>/891-main-runs.json` prints a time before `2026-10-13T19:48:53Z`.
- H2-2: `gh run list --repo ahl-gram/Vellum --workflow ci.yml --event pull_request --limit 1200 --json event,conclusion,status,headSha,headBranch,createdAt,updatedAt,databaseId,attempt,startedAt > <S>/891-pr-runs.json`, then `jq -r 'map(.createdAt) | min' <S>/891-pr-runs.json` prints a time before `2026-10-13T19:48:53Z`.
- H2-3, `<S>/891-overlap.jq`, run as `jq --slurpfile pr <S>/891-pr-runs.json -f <S>/891-overlap.jq <S>/891-main-runs.json`:

```jq
($pr[0] | map(select(.createdAt >= "2026-10-13T19:48:53Z"))) as $prs
| (map(select(.event=="push" and .createdAt >= "2026-10-13T19:48:53Z"))) as $push
| ($push | map(. as $p | {id: .databaseId, c: .createdAt, u: .updatedAt, concl: .conclusion,
     beside: ($prs | map(select(.createdAt < $p.updatedAt and .updatedAt > $p.createdAt)) | map(.databaseId))})) as $rows
| {push_runs: ($push|length),
   push_cancelled: ($push|map(select(.conclusion=="cancelled"))|length),
   push_with_pr_beside: ($rows|map(select((.beside|length)>0))|length),
   pr_beside_pairs: ($rows|map(.beside|length)|add),
   pr_runs_window: ($prs|length),
   pr_cancelled_window: ($prs|map(select(.conclusion=="cancelled"))|length)}
```

  Expected: `push_cancelled` 0, `push_runs` at least 198, `push_with_pr_beside` at least 83.
- H2-4, `<S>/891-cancel-explained.jq`, run as `jq -f <S>/891-cancel-explained.jq <S>/891-pr-runs.json`:

```jq
map(select(.createdAt >= "2026-10-13T19:48:53Z")) as $prs
| $prs
| map(select(.conclusion=="cancelled")) as $cx
| ($cx | map(. as $c | {id: .databaseId, branch: .headBranch, c: .createdAt, u: .updatedAt,
     newer: ($prs | map(select(.headBranch == $c.headBranch and .createdAt > $c.createdAt and .createdAt <= $c.updatedAt)) | map(.databaseId))})) as $rows
| {cancelled: ($rows|length), explained: ($rows|map(select((.newer|length)>0))|length),
   unexplained: ($rows|map(select((.newer|length)==0)))}
```

  Expected: `unexplained` is `[]` and `explained` equals `cancelled`, at least 138.
- H1-1, the hazard 1 witness re-read, each alone: `gh api repos/ahl-gram/Vellum/actions/runs/40174696546/attempts/1 --jq '{conclusion, created_at, updated_at, head_sha}'` (expected `cancelled`, 07:56:42, 07:56:59, `a9cb1aac...`); `gh api repos/ahl-gram/Vellum/actions/runs/40173993060/attempts/2 --jq '{conclusion, run_started_at, head_sha}'` (expected `cancelled`, 07:56:54, `09fb4eb0...`); `gh api repos/ahl-gram/Vellum/check-runs/121112743586/annotations --jq '.[].message'` (expected to include `Canceling since a higher priority waiting request for ci-pull_request-1058 exists`).

**Step 3, the issue comment (workflow step 12), before the pull request opens.** One dated comment on Issue #891, posted with `gh api repos/ahl-gram/Vellum/issues/891/comments -F body=@<file>` (capital `-F`, which reads the file after `@`; lower-case `-f` would post the literal path; and the `/comments` form, never the issue endpoint, which would replace the body), then read back in its own command with `gh api repos/ahl-gram/Vellum/issues/891/comments --jq '.[-1].body' | head -3`, carrying, in this order: "Hazard 2, read on <date>" with H2-3's and H2-4's numbers from your run and the planner's annotation and start-lag readings quoted from this plan's hazard 2 section, labelled as the planner's of 2026-11-09; "Hazard 1, read" with the PR #1058 timeline table from this plan and H1-1's three outputs, and that no staged run was made, by Alex's ruling; then "Calls made", the list below; then a pointer to the rulings comment, https://github.com/ahl-gram/Vellum/issues/891#issuecomment-6748405463, rather than a restatement of it. No em-dash in it.

**Step 4, the checks.** `node --test test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/proof-runner-workflow.test.ts`; `npm run check`; `npm run lint`; `npm run format:check`; `npm test`, then `npm run astro:generate`. e2e: no suite is touched and none runs locally; CI runs every lane on the pull request.

**Step 5, the pull request.** Title `#891 A re-run of an older head's CI run cancels the current head's: say so in the site spec`. Body in the template's shape: `Closes #891`; the paragraph names the bullet, the scars row and the errata row, that no workflow line changes, and that hazard 1's reading is the PR #1058 incident rather than a staged run, by Alex's ruling (comment 6748405463); Rulings: the step 3 comment for the calls made, and the rulings comment for Alex's; Guards: "None. This PR carries no test." with the reason; Ran: the commands in step 4; Records: prover and plate reader not owed, the cold skeptic's round. Then `gh pr view <PR> --json closingIssuesReferences` lists exactly Issue #891. Then commit 2. Then `vellum-pr-skeptic`, cold.

## Calls made

1. Hazard 2 is settled from the run history, with no run made for it, on the stricter half of PR #890's own criterion (`handbook/plans/800/860/860-plan.md`, its Verify table), read over the whole window since the merge; the issue's own half ("no `push` run reading `cancelled`") is its subset.
2. The PR #1058 incident is hazard 1's reading for a re-run of one failed job; the whole re-run of a cancelled run is argued in the safe direction, not claimed measured (ruled D1: no staged run).
3. The result is written in the existing concurrency bullet of `handbook/specs/site-architecture.md`, not an errata row: one normative home (`handbook/specs/conventions.md`, Where a rule lives), and an errata row is for a finding left unfixed.
4. The bullet's bold lead gains "a re-run included", a correction of a line the finding makes misleading, on Issue #860 comment 6152733796 ("that is a correction, not a new rule"); the added sentence is plain fact with no instruction, on comment 6153675191's ruling 1 ("State only what is true") and ruling 3 as corrected by comment 6152790485, and on this issue's D2 ruling (comment 6748405463).
5. The incident's run ids and timeline go in `.claude/skills/vellum-footguns/references/scars.md`, "Once, and expensive", in the form of its PR #1042 row, as the measurement behind the spec line (the routing rule); the spec drops the provenance.
6. The flake record's reversed earlier disposition goes to a `handbook/errata/prose.md` row rather than an edit of the record (Gate 5 item 7: a sibling defect is filed or a row, not folded), in `prose.md` since the errata README gives it the specs and the agent and skill files.
7. No test: a text edit about GitHub's choice of run, which no test can run; T1 pins the block the text describes.
8. The lines read and left in Rosters and doctrine, each because the change does not contradict it.
9. The errata row is the second commit, after `gh pr create`, since it names this pull request's number.
10. Issue #1282's PR #1289 does not block, in either merge order (Order of commits, measured by a three-way merge of the two edits).
11. The staged run's mechanics: not taken, since Alex ruled D1 A (no staged run, comment 6748405463).
12. The branch name `docs/891-rerun-cancels-current-head` and the archive path `handbook/plans/800/891/891-plan.md` (workflow step 8's bucket).

## Open decisions

None. Alex ruled both of the menu's questions on 2026-11-09 (https://github.com/ahl-gram/Vellum/issues/891#issuecomment-6748405463): D1, whether to stage hazard 1 on a throwaway pull request, "No, the real sighting is the reading (Recommended)"; D2, what the house does about it, "Describe it in the site spec, add no rule (Recommended)". The options not taken (a staged run; an instruction in the bullet; a follow-up issue to change the CI setting) are under Alternatives rejected.

## Stop conditions

Hand back, rather than adapt, when:

- Step 1 finds a change in `ci.yml` lines 1 to 12, a change inside the bullet at lines 377 to 382 of `handbook/specs/site-architecture.md`, a change to `test/repo/proof-runner-workflow.test.ts`, or an Issue #891 comment newer than the recorded count that is not the dispatcher's plan archive.
- On `origin/main`, the bullet is not six lines opening `- **A pull request's newest run cancels any of its own runs still going, and no other run is ever` and ending `not replace the pull request's own run in the commit's check list, which is what merging reads.`, or the line after it does not open with the bold `MEASURED_SECONDS` lead.
- `## Once, and expensive` or the row opening `- Later, PR #1042 (Issue #1034):` is missing from `scars.md`.
- The flake record's AT1 row for run 40173993060 no longer carries "its next push then superseded that run": drop the errata row and commit 2, and say so in the body; this one is not a hand-back.
- H2-1 or H2-2's oldest row is not before 2026-10-13T19:48:53Z at `--limit 400` and `--limit 1200`.
- H2-3 reads `push_cancelled` above 0, or H2-4 reads any `unexplained` row.
- H1-1 does not read as expected (the witness's data is gone or differs).
- `node --test test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/proof-runner-workflow.test.ts` reds on any line this plan adds.
- A `git merge origin/main` after PR #1289 lands stops on `handbook/specs/site-architecture.md` with a conflict that touches any line of the concurrency bullet's nine (the planner's three-way merge of the two edits found none, Order of commits).
