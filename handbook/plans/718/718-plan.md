# Issue #718 plan: drop `test/repo/check-reach.test.ts`

Base: origin/main 293e02e. Recon ledger: `718-recon-ledger.md` in the same scratchpad. Plan skeptic's findings folded below. Branch: `chore/718-drop-check-reach`.

## What the file holds (read at 293e02e)

Two tests, not one:

1. T1, "the lint's TypeScript roots are read from globs of one shape, and a TypeScript glob of any other shape is refused rather than dropped": a unit test of `tsRootsOf` in `test-support/lint-roots.ts`, the reader `lintTsRoots` is built on. It feeds synthetic `files` entries and asserts the roots read and the refusals (`/cannot read/`).
2. T2, "npm run check reaches every TypeScript file the lint reaches ... (Issue #679)": builds the program from `tsconfig.json` and asserts every `.ts` under the lint's roots is in it. This is the check the issue's Why argues is redundant with the lint.

The issue's Why argues only about T2. T1 is not redundant with the lint: the lint never runs `tsRootsOf`. Since the issue was filed (checked on f462524), `lintTsRoots` gained readers in `test/repo/ts-comment-form.test.ts` (PR #731, `3990986`: the root-witness case and the skip collector), beside the citation roots case in `test/repo/comment-citations.test.ts`.

What T1 alone holds, measured and read at 293e02e:
- With `rootOf`'s `throw` in `test-support/lint-roots.ts` replaced by `return null` (helper restored after, tree clean), `node --test test/repo/comment-citations.test.ts test/repo/ts-comment-form.test.ts` stays green (tests 7, pass 7, fail 0) and `node --test test/repo/check-reach.test.ts` reds T1 only: `Missing expected exception: "tools/bench/**/*.ts" was dropped, so a root the lint reads through it would be one neither guard walks`. T1 is the only test that the refusal still works.
- Deleting T1 does not delete the refusal. `rootOf` keeps its `throw` under every option here, and a lint glob the reader cannot read still reds both comment guards with "widen this reader". What goes is the proof that the refusal works, so a later edit that weakens it (the `return null` above, or a narrower `TS_GLOB`) passes.
- Overlap, weakening T1's value: the lint-wiring scope test (`test/repo/lint-wiring.test.ts`) already reds 8 of T1's 9 refused entries as the config stands (plan skeptic, in-memory mirror of that test's logic); what T1 alone covers is a deliberate change to the ruled `LINT_SCOPE` in a shape the reader cannot read, and someone weakening the refusal.
- Open work, strengthening T1's value: Issue #728 (open) proposes moving guards into the lint through named-file blocks, a shape lint-wiring admits. The reader refuses it: `tsRootsOf(["src/site/x.ts"])` throws `cannot read a root from the TypeScript files entry "src/site/x.ts"` (probed in memory this session). So the first named-file block Issue #728 lands has to widen the reader, and T1 is the test that widening would be made against.
- The positive read is pinned elsewhere already: `ROOT_WITNESSES` in `test/repo/ts-comment-form.test.ts` is deep-compared to `lintTsRoots()`, and `test/repo/comment-citations.test.ts` asserts it includes `src`.

## Design, by decision 1 (Alex's): what happens to T1

Option 1B, keep T1 in a file named for what it tests (recommended):
- Commit 1 is a pure rename, `git mv test/repo/check-reach.test.ts test/repo/lint-roots.test.ts`, so the branch reads as a move then a deletion when reviewed commit by commit. Main squash-merges, and T1 is about a third of the file, below git's rename threshold once T2 goes, so the PR's combined diff and main's one commit will show a delete and an add; the byte-identity command below is what shows T1 unchanged. T1's failure message ("a root the lint reads through it would be one neither guard walks") stays true: two guards still walk the roots (the citation roots case and the comment-form root witnesses). House precedent for the name: `test/repo/css-box-sweep.test.ts` and `test/repo/e2e-containment.test.ts` are named after their `test-support/` helper.
- Commit 2 deletes T2 and what only T2 used: the `typescript` import, `readdirSync` (and the whole `node:fs` import), `join` and `resolve` (the whole `node:path` import), `ROOT`, `tsUnder`, and `lintTsRoots` from the helper import. T1 stays byte-identical: title, body, messages.
- `test-support/lint-roots.ts` unchanged.
- Rejected home: inside `test/repo/comment-citations.test.ts` (recon's other suggestion). T1 tests the reader both consumers share; putting it inside one consumer hides it from the other, and the house names a helper's test after the helper.

Option 1A, delete the file whole, as filed:
- Delete `test/repo/check-reach.test.ts`.
- `test-support/lint-roots.ts`: `tsRootsOf` cannot go, because `lintTsRoots` calls it; its `export` goes, since the deleted test is its only importer and an export nothing imports is dead code.
- Records: a dated comment on Issue #728 that the reader's refusal has no test and `tsRootsOf` no export, so its named-file work widens an untested reader (or puts the test back).

## Design, by decision 2 (Alex's): how the PR #717 check-reach errata row leaves

Option 2B, move it to `## Ruled and left` in `handbook/errata/guards.md` (recommended), rewritten as the gap that survives the drop: while `tsconfig.json` is the only TypeScript config, a TypeScript root added to neither `tsconfig.json` nor `eslint.config.ts` is type-checked and linted by nothing, and the witness that every tracked `.ts` outside `design/` is in the program was offered and declined. Under 1A the same row also names that the reader's refusal is untested. The ruling quoted is Issue #718's body. A dated comment on Issue #659 records the move, as that issue's comments of 2026-10-02 and 2026-10-03 do. Precedent: the PR #576 row under Ruled and left ("Nothing mechanical covers the agent files now that the scanner is dropped").

Option 2A, delete it, as filed. Consequence: `handbook/errata/README.md` gives a row three exits (Fixed: the pull request that fixes the finding deletes the row; Promoted; Ruled: the row moves to Ruled and left with the ruling quoted). Dropping the guard does not build the fix the row names, so 2A deletes the row by none of them, and nothing is left that stops a later review re-filing the gap.

## Design, either way

- `handbook/errata/guards.md`, the PR #717 `LINT_TS_ROOTS` row (line 126): re-point its one clause naming check-reach to "reaches the lint and the citation roots case in `test/repo/comment-citations.test.ts` and the root-witness case and skip collector in `test/repo/ts-comment-form.test.ts` (which read the config through `lintTsRoots` in `test-support/lint-roots.ts`)". The rest of the row is current (recon). Only these lines change, no rewrap; Issue #728 and the parallel lane may touch this file, so expect a merge from main before landing.
- `handbook/plans/718/718-plan.md`: this plan, archived at the first commit.
- Untouched: `handbook/plans/679/679-plan.md`, `handbook/plans/706/706-plan.md`, `handbook/plans/675/*` (archives under workflow step 8; the issue names 679's).

## Tests

No test is added or strengthened, and there is no red-first step: a deletion has no behavior to stub, and the evidence below takes its place.
Under 1B, T1 moves byte-identical. Proof it still bites in its new home, run by this session on a committed tree: `rootOf`'s `throw` replaced by `return null`, red on T1's `assert.throws` line, helper restored with `git checkout --`. Byte identity for the PR body: `git show 293e02e:test/repo/check-reach.test.ts` and the new file, T1's lines compared with `diff`.

## Evidence (each a named command)

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`, since `npm test` deletes the generated assets under `public/`).
- The ruled premise, re-measured on this tree with a natural witness: plant an unimported file under `test-support/` (a lint root missing from `tsconfig.json`'s include, the case T2 was written for), run the lint on it, expect a project-service parsing error, delete the file, `git status` clean. **If the lint stays green, the ruling rested on a wrong premise: STOP and send it back to Alex**, per workflow step 6. Run in phase one at 293e02e: `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 test-support/probe-718.ts test-support/lint-roots.ts` exit 1, `Parsing error: .../test-support/probe-718.ts was not found by the project service` on the planted file only; `node --test test/repo/check-reach.test.ts` red on T2 naming `test-support/probe-718.ts`. Both red on the same case; the premise holds. Re-run in phase two on the built tree for the PR body.
- Collection: `test/repo/test-collection.test.ts` stays green inside `npm test`.
- Shards: `npm test` is `node --test`, sharded by `--test-shard=k/3` in `.github/workflows/ci.yml`. The shard guard in `test/repo/e2e-tiers.test.ts` reads ci.yml and package.json only, and nothing names unit files per shard, so deleting or renaming a file moves which shard runs some files and changes no guard. A shard can grow or shrink by that move; the timeout floor (1.5 x 4.2 = 6.3 minutes) sits under the cap of 9 against a worst shard of 4m08s, and removing T2 takes a full program build out.
- No e2e suite runs locally: nothing under `e2e/` or `src/` changes, and a parallel lane is using the browser. CI runs all four lanes.
- No chart, golden or regen is touched (Gate 6 not engaged).

## Rosters and doctrine dragged

- `git grep -n -e lint-roots -e tsRootsOf -e lintTsRoots -e check-reach` outside `handbook/plans/`: the two errata rows, the helper, the test file and its two consumers. Nothing in `handbook/specs/`, `.claude/`, `CLAUDE.md`.
- `test/repo/prose-paths.test.ts`: `handbook/errata/` and `handbook/plans/` are outside its roots; no walked file backticks the deleted path.
- No roster lists unit test files.

## Records owed in phase two

- Issue #718 comment, dated, before the PR: Alex's rulings on decisions 1 and 2 as relayed, and the calls below.
- Under 2B: a dated comment on Issue #659 recording the move.
- Under 1A: a dated comment on Issue #728 (above).
- PR body: template sections; `Closes #718`; guards table "None" under 1A, or the moved T1 with its pasted red and the byte-identity command under 1B.

## Calls made without a ruling (for the dispatcher to relay)

- Under 1A, `tsRootsOf` keeps its body and loses only `export`: the issue's "it goes too" assumed it could be deleted, and `lintTsRoots` calls it.
- Under 1B, no `vellum-guard-prover` run: T1 is moved byte-identical and was proved by two prover rounds on PR #717; this session re-proves it in its new home with one mutation, and the PR body carries the byte-identity command, since the combined diff will show it as a new file.
- The `LINT_TS_ROOTS` row's clause names every remaining reader, not only the one the issue knew of.
- The 706 plan, which also names check-reach, stays as written (archive, same rule as 679's).
- The premise is re-measured with a planted file under `test-support/` rather than by editing `tsconfig.json`.
- Branch name `chore/718-drop-check-reach`.
