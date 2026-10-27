# Issue #707 plan: a mutate and restore for `vellum-guard-prover` that work under the worktree fence

Branch `chore/707-prover-restore`, base main `4152fa2` (origin/main has since moved to `3f07b25`; the plan skeptic ran `git diff --stat 4152fa2 origin/main -- scripts/ test/repo/ .claude/ test-support/ specs/ errata/ eslint.config.ts package.json tsconfig.json` and it is empty). No code written. Recon ran (`707-recon-ledger.md`); the issue has 0 comments, so the body is the whole spec. The plan skeptic ran on the draft with the ledger; its fifteen findings are folded below and listed at the end.

## What was measured before planning (2026-09-27)

From this lane's harness worktree, against sandboxes built with `node scripts/agent-sandbox.ts create guard-707-probe-1` and `guard-707-probe-2` (both printed their path under `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/`, detached at `4152fa2`, both torn down):

| command, run from the lane worktree | result |
|---|---|
| Edit tool on `<sandbox>/scripts/agent-sandbox.ts` | REFUSED: "Edit the worktree copy of this file instead of the shared-checkout path", which points the agent at the DISPATCH tree's copy, the one tree a prover must never edit |
| Write tool on `<sandbox>/out/707-write-probe.txt` | REFUSED, same message |
| `cd <sandbox> && git checkout -- scripts/agent-sandbox.ts` | REFUSED: "changes directory to the shared checkout ... before running git" |
| `cd <sandbox> && git apply --check <file>` | REFUSED, same message |
| `git -C <sandbox> diff --exit-code` (the compare the issue names) | REFUSED: "redirects git to the shared checkout via -C" |
| `node -e '<assert-once replace that writes>' <file> '<code-like anchor>' '<code-like replacement>'` | REFUSED: "runs node with a program that can start another program (repl) next to an operand ... not plain text" |
| `node -e '<arrow replace, prints only>' <file> foo bar` | passes |
| `node -e '<require fs, count only>' <file> '<code-like anchor>' bar` | passes |
| `python3 -c '<assert-once replace, dry run>' <file> '<code-like>' '<code-like>'` | passes |
| Write tool on `/tmp/707-replace.ts`, then `node /tmp/707-replace.ts <sandbox file> '<code-like>' '<code-like>'` | passes, and wrote the sandbox file |
| `cat > /tmp/707-heredoc-probe.ts <<'EOF' ... EOF` | passes (recon holds a 2026-09-27 prover record of heredocs refused; the two conflict, and nothing below depends on a heredoc) |
| `node scripts/agent-sandbox.ts list 'const x = (a) => a > 1 ? [b] : "c" \| $d;' "it's"` | passes: a TRACKED script with code-like operands (the plan skeptic added three more passing shapes, an empty `''` among them) |
| `patch -p1 -d <sandbox> -i /tmp/707-carry.patch` (a one-line text edit) | passes, and the edit landed |
| `git show 4152fa2:scripts/agent-sandbox.ts > /tmp/707-head-agent-sandbox.ts`; `cmp` it against the sandbox copy; `git hash-object <sandbox file>`; `git diff --no-index --exit-code <extract> <sandbox file>`; `cp` into the sandbox | all pass |
| the definition's own setup, `cd <sandbox> && cat "$(sed 's/^gitdir: //' .git)/HEAD" && node --test test/repo/agent-sandbox.test.ts` | passes, `4152fa2...`, 26/26 |

So the issue's premise is CURRENT (Edit and `git checkout --` are both refused), and both of its named instruments are STALE or unreliable as written: `git -C <sandbox> diff --exit-code` is refused outright, and an inline `node -e` replace is accepted or refused depending on its program text and operands together, which a prover cannot predict before typing it. A node script invoked BY PATH with plain operands passed every time it was tried, and a tracked one needs retyping by nobody.

Found on the way (not caused by this issue): widening `SANDBOX_NAME` in `scripts/agent-sandbox.ts` to `(guard|skeptic|agent)` or `(guard|skeptic|probe)` leaves `test/repo/agent-sandbox.test.ts` green, 26/26, in the probe sandbox. `agent-` is the harness's own prefix for a lane's worktree, the one neighbour the name guard exists to keep the script away from: `teardown` of such a name would run `git worktree remove --force` against a live lane, and only the harness's lock on its lanes (a locked tree needs `--force` twice, per `git help worktree`) would stop it.

## Design (the recommended arm; the menu may change it)

Three new commands in `scripts/agent-sandbox.ts`, which already owns the sandbox lifecycle (#575: "none of it is yours to retype"). All three refuse any name that does not start with `guard-`, checked explicitly and not as "not `skeptic-`", because `mutate` is a write command and this is its barrier against a lane's own worktree.

- `mutate <name> <path> <line> <from> <to>`: on line `<line>` of the repo-relative `<path>` in the sandbox, replace the single occurrence of `<from>` with `<to>`, both taken literally (counted with `split`, replaced with a function replacer). `<to>` may be empty, which is how a guard clause is deleted; the CLI tells an empty argument from a missing one by count, not truthiness. It refuses, writing nothing, when: the path is absolute; it is not a file tracked at the sandbox's commit (refuses untracked and generated files, `.git`, and `node_modules`, the link into the SHARED install); it resolves through a symlink to anywhere outside the sandbox; the line does not exist; `<from>` is empty or equals `<to>` (a no-op mutation reads as a HOLE it is not); or `<from>` occurs other than exactly once ON THAT LINE. It writes the file and prints `<path>:<line>` with the line before and after. It keeps no state.
- `restore <name> <path> [<path>...]`: for each path named, under the same name and path checks as `mutate`, writes back the file's bytes at the SANDBOX's commit, read as a Buffer (no encoding, no trim, with the script's `GIT_TIMEOUT_MS` and a `maxBuffer` large enough for any tracked file) from `git cat-file blob <sha>:<path>` run in the dispatch tree, whose object store the sandbox shares. The commit is read from the sandbox's `.git` file and `<gitdir>/HEAD`, as the definition's recipe already reads it. It prints each path it put back.
- `status <name>`: the byte compare the issue asks for, over the whole tree: lists every file tracked at the sandbox's commit (`git ls-tree -r -z <sha>`, run in the dispatch tree) whose bytes on disk hash to a different git blob id, or which is missing, one path per line, and exits 1 when it printed anything. It is derived from the commit's tree and the disk and never from what `mutate` or `restore` were told, so it sees a file changed by hand, by a tool, or by a suite run, and a path the prover forgot to hand `restore`.

A draft kept a record of mutated paths so `restore` needed none; it was cut once `status` existed, because `status` already catches a forgotten path and the record caught nothing `status` does not, while costing state, three tests, and a write into the main checkout's `.git/worktrees/<name>/`.

The prover's loop becomes: `mutate`, then `status` prints exactly that one path (a mutation `status` does not show did not happen, so its green run is not a HOLE); run the narrowest suite; `restore` with every path `status` printed; `status` prints nothing. The HOLE verdict rests on `mutate`'s printed change plus that first `status`, never on `restore`'s output.

Why by line: `vellum-footguns` Gate 1 item 9, "Mutate BY LINE, never by text: several wearers can share one declaration" (PR #510, where four rules carried a byte-identical gradient string and a match-based edit landed twice). The issue's "asserts its anchor occurs exactly once" is kept, scoped to the named line.

Why restore writes the commit's bytes rather than reversing the replace: a reverse replace has to find `<to>` exactly once, and a flipped operator (`>=` to `>`) usually occurs elsewhere, so it would refuse exactly when needed. Against the SANDBOX's commit rather than a moving HEAD, per recon. This is correct only when the sandbox's starting state IS its commit, which is Decision 3's recommended arm; with a carry-across it would erase the carried work.

What the arm assumes about the fence, said plainly: the only git the commands run is `cat-file` and `ls-tree` in the DISPATCH tree, both allowed typed directly there (`git show <sha>:<path>` and `git hash-object` passed above), and the only write is the sandbox file itself, which `cp` and `patch` reach typed directly. So nothing the commands do is something the fence refuses when typed; they package it so no prover retypes it. The fence reads only the command text, which is also why `create` works today. No git runs inside a sandbox, before this change or after it.

`.claude/agents/vellum-guard-prover.md`:

- The fence sentence under `## Your sandbox` gains what a prover meets first: the Edit tool and a `cd` into the sandbox before any git are refused, and the Edit refusal names the dispatch tree's copy as the one to edit instead.
- The sandbox section gains the three commands beside `create` and `teardown`.
- Method step 2 names `mutate` and the `status` that must show it; step 5 names `restore` and the `status` that must print nothing. The two lines that call the final unmutated full-suite run "the restore check" (Scope and budget, Running the suites) say instead that it is the whole-tree confirmation after the last restore, since a green suite is not a byte proof.
- The tool grant, the Edit paragraph and the "only review agent with Edit" line per Decision 2.
- The carry-uncommitted-work paragraph per Decision 3, with the "Name the commit you proved" paragraph and the residue paragraph's stale "line 48" reference moving with it (cited by paragraph, not number).
- The Conventions line that sends scratch scripts to `out/` per Decision 4.

`.claude/agents/vellum-pr-skeptic.md`: no change. `grep -nE "restore|mutat|Edit|git apply|checkout --" .claude/agents/vellum-pr-skeptic.md` finds only its never-touch list for the dispatch tree and its read-only statement; it holds no Edit, never mutates or restores its sandbox, and its only command there, `cd <path> && cat "$(sed ...)/HEAD" && npm test`, is the shape measured passing above. The PR body carries that command and its output.

`.claude/skills/vellum-footguns/SKILL.md` Gate 1 item 9: "unless carried across by hand" follows Decision 3.

## Files

- `scripts/agent-sandbox.ts`: `mutate`, `restore`, `status`, their small helpers (the sandbox's git directory and commit read from files; the tracked and containment checks; a byte-returning git read beside `git()`), the CLI dispatch and the usage string. The file grows from 139 lines to roughly 220, every function under 50.
- `test/repo/agent-sandbox-mutate.test.ts` (new): the existing `test/repo/agent-sandbox.test.ts` is 355 lines and the rules cap a file at 400.
- `test-support/sandbox-repo.ts` (new): `withRepo`, its `git` helper, `cli`, `SCRIPT` and `BOUND_MS` move here from `test/repo/agent-sandbox.test.ts` so both files import one copy (Gate 1 item 8); that file changes only its import.
- `.claude/agents/vellum-guard-prover.md`, `.claude/skills/vellum-footguns/SKILL.md` as above.
- `errata/`: rows for what Decision 4 ledgers.
- `plans/707-plan.md`: this plan, archived at the first commit.

## Tests, each with the mutation that reds it

In `test/repo/agent-sandbox-mutate.test.ts`, against a temp repo whose guard sandbox is built by `create`. The red-first stub is the three commands present and doing nothing; every test below asserts its precondition so that stub reds it (Gate 1 item 2).

1. `mutate` changes only the named line: three byte-identical lines, mutate line 2; line 2 changed, lines 1 and 3 byte-identical. Reds on: replacing in the whole file (line 1 changes); the do-nothing stub (line 2 unchanged).
2. `mutate` refuses, and leaves the file's bytes unchanged after each refusal: an anchor twice on its line, an anchor absent, `<to>` equal to `<from>`, and an empty `<from>` on a two-character line. Reds on: `count !== 1` weakened to `count < 1` (the twice case writes); the equality refusal deleted; the empty refusal deleted (`"ab".split("").length - 1` is 1, so the count alone passes it and the replace inserts at column 0).
3. `mutate` is literal both ways: a `<to>` of `$&$1` lands as those four characters, and a `<from>` of `a.b` on the line `axb a.b` replaces only the literal `a.b`. Reds on: `line.replace(from, to)` in place of the function replacer; a regex count or match (it counts two and refuses).
4. `mutate` and `restore` both refuse a `skeptic-*` name, an `agent-*` name, an absolute path, an untracked file, `node_modules/<file>` (through the link `create` makes into the fixture root's `node_modules`), and a tracked symlink that leads out of the sandbox to the fixture root's `f.txt`; each refusal's message is pinned to the check that made it, and every target is byte-unchanged afterwards. Reds on: dropping the explicit `guard-` check (the skeptic and agent cases write, or fail with another check's message); dropping the tracked check (the untracked case writes, and `node_modules` fails with the containment message instead, which the pinned message catches); dropping the containment check (the symlink case writes the fixture root's own file, the main-checkout analogue), in either command. No tracked symlink exists in the repo today (`git ls-files -s | grep -c ^120000` is 0), so that arm guards a future one and the fixture is its witness.
5. `restore` writes back the bytes at the SANDBOX's commit: sandbox built at c1 from a dispatch tree at c2; after `mutate` the file differs from its bytes read with `readFileSync` before `mutate`; after `restore` it equals them and the literal `"one\n"`, and differs from c2's `"two\n"`. Reds on: reading the commit with `readHead(cwd)` (the dispatch tree's); reading the blob through the trimming `git()` (the trailing newline goes); skipping the write.
6. `restore` puts back every path it is handed: mutate two files; both differ; one `restore` naming both prints both, and both equal their pre-`mutate` bytes. Reds on: restoring only the first path argument.
7. `status` sees the tree, not the commands: after `mutate` it prints exactly the mutated path and exits 1; after `restore` it prints nothing and exits 0; a tracked file changed directly by the test (the Edit-tool analogue, which `mutate` never saw), by removing only its trailing newline, is printed, and so is a tracked file the test deleted. Reds on: comparing trimmed text (misses the newline); skipping a missing file; exiting 0 when it printed; the do-nothing stub (prints nothing after `mutate`).
8. The CLI: `mutate`, `restore` and `status` through `node scripts/agent-sandbox.ts`; `''` as `<to>` deletes the anchor and exits 0; a missing argument, a line of `0` or `x`, and `restore` with no path, exit 1 with the usage. Reds on: `main` not dispatching a command; the truthiness test the existing commands use (the empty `<to>` exits 1).

The existing file keeps its 26 tests unchanged apart from importing the moved fixture, plus, if Decision 4 folds it, an `agent-` name in `validateName`'s refused list.

## Evidence

- `node --test test/repo/agent-sandbox-mutate.test.ts` red first on the do-nothing stub, then green; `node --test test/repo/agent-sandbox.test.ts` still 26/26.
- `npm run check`, `npm run lint`, `node --test test/repo/prose-paths.test.ts` (every new backticked path in the definition must resolve), `npm test`, then `npm run astro:generate`. No e2e: nothing under `src/site/` or `scripts/e2e/` moves. No regen: nothing under `src/` moves (`git diff --stat origin/main -- src/` empty, pasted).
- The fence proof the dispatcher asked for, run from this lane's worktree and pasted into the PR body: `node scripts/agent-sandbox.ts create guard-707-proof-1`; the Edit tool on a sandbox file (refused); `cd <sandbox> && git checkout -- <path>` (refused); then the definition's new recipe VERBATIM: `mutate` the name pattern to admit `other-`; `status` (prints that one path); run `test/repo/agent-sandbox.test.ts` in the sandbox (THREE red: the refused-names list, the CLI refused-name test, and create-refuses-before-git); `restore`; `status` (prints nothing); run it again (26/26); an independent `cmp` of the file against a `git show <sha>:<path>` extract (exit 0); `teardown`; the definition's two residue diffs empty.
- `vellum-guard-prover` on the new tests, its dispatch naming the branch's `mutate`, `restore` and `status` as its method, run from the dispatch tree (a sandbox mutation of `scripts/agent-sandbox.ts` does not touch the dispatch tree's copy it runs). It runs under whichever definition the harness loads (UNVERIFIABLE which), is not asked to prove its own definition, and the PR body names both versions per workflow step 14.

## What the change drags

- `CLAUDE.md` Worktrees, `.claude/agents/vellum-implementer.md` and `.claude/agents/vellum-pr-skeptic.md` each describe the fence; they stay true, and the divergence this PR widens by adding the Edit fact to the prover alone is Decision 4 (iii).
- `specs/development-workflow.md` step 11 and step 14 stay true: the prover still builds its sandbox with the script, and "the other two hold no write tool" names plan-skeptic and spec-recon.
- The residue proof is unchanged: the new commands write only inside the sandbox, and the snapshot listing skips `.claude/worktrees/`.
- Alex's auto-memory `reference_worktree_isolation_git_limits.md` says it "holds the fact until it lands"; the dispatcher trims it after the merge (named in the final report, not touched here).

## Plan skeptic findings and what became of each

1. BLOCKING, no per-restore byte compare: FOLDED as `status`, a whole-tree compare against the commit derived from the tree and the disk alone, run after every `mutate` and every `restore`; the HOLE verdict rests on `mutate`'s printed change and the first `status`.
2. BLOCKING, Decisions 1 and 3 linked: FOLDED; the menu says arm 1A is correct only with 3A, and cites workflow step 11.
3. Trimmed git read: FOLDED; Buffer read with timeout and maxBuffer, tests compare against `readFileSync` bytes and literals.
4. Tests pass on the stub: FOLDED; every test asserts its precondition.
5. Empty arguments and regex characters: FOLDED into tests 2, 3 and 10.
6. Record scope and order: MOOT; the record was cut after the fold of finding 1 (see the Design), so there is no shared state to scope and no write order to pin. `restore` takes its paths as arguments and `status` catches one left out.
7. The name hole matters more here: FOLDED; explicit `guard-` checks and an `agent-` case in test 4; `validateName`'s own list is Decision 4 (i).
8. Recon items without a home: FOLDED into Decision 4 (ii), (iii), (iv).
9. The `node_modules` case: FOLDED; messages pinned per check.
10. The fence assumption: FOLDED; said plainly in the design, and the one unprobed write it named (the record in the main checkout's `.git/worktrees/<name>/`) went with the record.
11. Fixture helpers: FOLDED; `cli`, `SCRIPT`, `BOUND_MS` move too.
12. The "only review agent with Edit" line: FOLDED into the edit list.
13. Three reds, not one: FOLDED into the evidence.
14. This PR's own prover method: FOLDED into the evidence.
15. Arm 1B described thinly: FOLDED into the menu.

None rejected.

## Open decisions for Alex (the menu, recommendation first)

1. How the prover changes a file in its practice copy and puts it back. 1A (recommended): three new commands in `scripts/agent-sandbox.ts`, `mutate`, `restore`, `status`, about 80 lines of script, eight tests and a moved test fixture; correct only with 3A. 1B: no new code, a hand recipe in the definition; forms measured to write under the fence are `cp`, `patch -p1 -d`, and a node script run by its path (which a prover, having no Write tool, must create with a heredoc: measured passing once here, recorded refused once elsewhere); inline `python3` and single-line `sed -i ''` writes are on record from past runs, not measured here.
2. Whether the prover keeps the Edit tool. 2A (recommended): no. 2B: keep it.
3. Uncommitted work at dispatch. 3A (recommended): stop and ask the caller to commit (workflow step 11, Gate 1 item 9). 3B: keep carrying, with `patch -p1 -d` in place of the refused `git apply`; then 1A needs per-file pre-change bytes and `status` lists the carried files.
4. Found on the way: (i) the name-check test hole (`agent-`), (ii) the Conventions line sending scratch scripts to `out/`, (iii) the fence described in four places with no owner, (iv) the skeptic's base-side reads. 4A (recommended): fold (i) and (ii), ledger (iii) and (iv). 4B: ledger all four. 4C: fold all four.
