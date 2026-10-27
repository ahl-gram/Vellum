# Issue #783: the orchestration doctrine gets a spec, and no development-process rule stays in private memory

Plan written 2026-10-05 against origin/main `572cb13`, with the plan skeptic's findings folded in, and Alex's rulings on the step 6 menu (M1 to M9, posted on Issue #783 on 2026-10-06) folded in before the build. No code. The routing ledger this plan is derived from names private files and stays with the orchestrating session; nothing below quotes it, names a file in the private store, or carries a private fact.

## The design

Ruling 2 of Issue #783 makes `handbook/specs/orchestration.md` the home of how a session runs several `vellum-implementer` lanes at once. Ruling 1 sends every other development-process rule in the private store to the home `handbook/specs/conventions.md`'s routing rule names, or out as stale or already covered. The lane audited the store's text, handed to it read-only, and routed each rule; the edits below are the rows that land in the repo.

Principles every edit keeps:

1. **One normative home per rule.** The lane's half of orchestration is already tracked, and the new spec points at it by name and restates none of it: the implementer definition (the scratch prefix, the guarded `node_modules` link, the fence, a lost tree, never merging); workflow step 6 (the menu's hand-back, copying stills to the main checkout, a non-isolated dispatch for an agent whose only output is `out/`); workflow step 14 (copying a lane's samples); `CLAUDE.md` Worktrees (never switch worktrees under a running agent; a review agent never moves its dispatch tree); Gate 5 items 7 and 9; the Never list's bare `cd` line and `.claude/skills/vellum-footguns/hooks/README.md`.
2. **A procedure moves; a platform or harness detail stays out (M7).** The routing rule keeps fast-changing empirical traps out of the repo, which Alex held "with no exception" on Issue #729 (ruling B2). As M7 ruled, the spec states each procedure in the imperative with the condition it reacts to in plain words (a lane that has gone quiet, a lane stopped by a usage limit, a message a stopped lane has not acted on), and leaves out error strings, timeout and limit figures, version numbers, model names, which tool does what by default, and the board's configuration.
3. **Prescriptive voice, no provenance, no counts in the spec.** Incidents go to `.claude/skills/vellum-footguns/references/scars.md` on M4's terms, with no counts (Issue #591 ruling 7).
4. **A moment-of-typing check goes to a gate only under the strict filter** (its own incident number or a ruling of Alex's, conventions.md). One routed rule qualifies: a proof resting on several instruments adds a new one beside the old, never in its place (its incident is PR #576, Issue #575, already a scars row). It joins Gate 1, which holds test-writing lines, after Issue #782's merge (see Sequencing). The two lane-side checks with no incident on the public record (`npm ci` through the linked `node_modules`; the review agents' scratch and e2e rules, M8) go to agent definitions, which scars.md's closing list already names as homes, and the first gets a `held-lines.md` row naming the incident that would earn it a gate line.

## The new spec: `handbook/specs/orchestration.md`

Prescriptive, imperative, cites `` `symbol` in `path` `` where a rule is checkable. Sections and the rules each carries (wording settled in the build):

**Intro.** The orchestrating session's half of running several lanes. Read it before dispatching a second lane, and before handing an issue from one lane to another. Each lane runs `handbook/specs/development-workflow.md`; its own half is `.claude/agents/vellum-implementer.md`'s; `CLAUDE.md` holds the worktree conduct. The orchestrator never edits a lane's branch while the lane owns it.

**1. Dispatching lanes.**
- One `vellum-implementer` per issue, or per issue shipped as several pull requests; never a general-purpose agent with a retyped brief, since the definition carries the model, the effort, the isolation and the sequence.
- What the brief carries: the issue number; the lanes beside it and the files each owns; the stated order where two must edit the same lines (Gate 5 item 9), with the keep-both instruction; the attribution lines; push at the first commit, small commits; any ruling of Alex's quoted verbatim from its posted comment; any board read written to count its rows against the board's total (Never list: truncation is not absence).
- Several lanes may sit in phase one at once (recon, plan, plan skeptic, no code), which batches Alex's menus.
- No agent in a parallel run runs the full local e2e lanes: a starved machine stalls the lanes beside it (`handbook/specs/settle-doctrine.md`, The environment). Each review agent's own definition carries this and the scratch prefix (M8), so no follow-up message is sent.
- The orchestrator's own scratch files carry a prefix too.

**2. The STOP and the relay.**
- A lane's menu is its hand-back (workflow step 6). Put it to Alex; post his answer on the issue as a dated comment the moment he gives it, in his own words (M3); message the same lane with the rulings, quoting the posted comment, never a paraphrase. The lane's own record then points at that post.
- A ruling a lane needs before its own record, a standing one above all, is on the issue before the lane is briefed: a cold plan skeptic reads only the issue.
- An orchestrator's own condition on a ruling is posted labelled as the orchestrator's, never folded into Alex's words.
- Read every ruling of a sitting together before relaying any: two rulings can combine into a behaviour neither stated.
- A ruled number the lane may measure past later is relayed as a value with its stop condition.
- A delegation covers what it names (M6): a "take the recommendations" delegation covers the parts it names, nothing after them.
- A fold ruling (Gate 5 item 7) is relayed per batch, never carried over from an earlier one.
- The menu-quality rules (a measured consequence, a checked premise, a real before and after) are workflow step 6's, edited there below; this section points at them.

**3. While lanes run.**
- One writer per tree. The orchestrator reads a lane's tree with `git -C <path>` and writes nothing there; before writing in one at all it checks for an operation in progress (a rebase directory, a `MERGE_HEAD`, `git status`) and takes ownership out loud. Two writers that collide: say so, name the owner, abort and restart clean. A merge of main into a lane's branch waits until the lane has stopped for good; the lane that built a branch resolves its conflicts.
- A task notification is evidence about the shell that exited, never about the lane: read the branch for the lane's state.
- The orchestrator's own Bash: the Never list's bare `cd` line (pointer only).
- Watching CI: a background loop that exits when no check is pending, or a monitor that prints only what is new since its last poll, then send the lane on.
- When a lane's next report does not mention a request sent to it, check its branch and send the request again.
- Poll loops a lane leaves behind are found with `ps` and ended.

**4. A lane that stalls, dies or loses its tree.**
- A lane reported stalled is not taken for dead: check its branch, its PR and `ps` from outside, then resume it with a message to the same lane; dispatch a fresh one only when that fails. When the session's own commands fail the same way at the same time, the session's connection is the cause: wait.
- A lane stopped by a usage limit leaves its edits uncommitted. Confirm it is dead (its failure notice, never its silence: a quiet lane may still be committing) before touching its tree; read the tree with `git -C` for commits and uncommitted edits; resume it after the reset with a message telling it to re-verify its state by command. The review agents share the limit. Arm a timer for the reset rather than polling.
- When Alex says he is near his usage limit, tell every running lane to commit and push small and often, and start the handoff early.
- A lost tree (workflow step 6 says when the harness takes one; the implementer definition says the lane does not rebuild it): the branch survives. Read `git -C <main checkout> worktree list` first; a registration that outlived its directory has to be overridden or removed before the path is reused, and never with `git worktree prune`, which clears every other unlocked missing registration too and which the guard prover's definition forbids. Phase two has a subagent measure the exact command on the plan skeptic's scratch repo (this lane's fence refuses git outside its tree), starting from git's documented `worktree add --force`, given twice for a locked registration, and its effect on a branch the stale registration still holds. Then `git -C <main checkout> worktree add <same path> <branch>`, `node_modules` linked by path as `scripts/agent-sandbox.ts` does, `git -C <path> merge --ff-only origin/main` when the lane had no commits, and a message telling the lane to resume from its scratchpad plan.

**5. Merging.**
- Alex merges (`CLAUDE.md` Process, workflow step 16). He clears the orchestrator to merge per pull request or per named group of lanes, and a clearance covers what it names (M6): a lane or a pull request outside it goes back to him.
- Before a merge: the PR's one review round (workflow step 15) has run and its fixes are in; the orchestrator reads every commit after that round itself, since nothing reviewed it, and says so in its report. Where main moved under the branch, the lane runs workflow step 10's combined-state check first: `main`'s required checks do not require a branch to be current, so the merged state is not what CI ran.
- For a refactor, a moved proof or a new guard, the orchestrator's own pre-merge check (a stated call, flagged): a detached tree at the PR head (`git -C <main checkout> worktree add --detach <path> <sha>`, `node_modules` linked by path), the lane's proof and guard tests run there, one planted change in the moved code or against the new guard confirming the proof reports it, placed where coverage shows the code runs, then the tree removed. A lint probe goes in an existing file, since a new file outside what the type checker includes is a parse error to the lint's project service before any rule runs (measured 2026-10-06: a new file under `test-support/` fails so, one under `src/` does not), the lint runs as `npm run lint`, and a probe of the footgun hook reads its output rather than its exit code, with main's hook as the control.
- Squash with `gh pr merge <PR> --squash --match-head-commit <sha> --subject "<#N title> (#<PR>)" --body-file <file>`. Build the body from `git log --no-merges origin/main..origin/<branch> --reverse --format='* %s%n%n%b'` with each commit's trailer lines stripped, close it with the session's own attribution lines, and grep it for an em-dash before merging, since the hook reads no merge body. Write the file in one call and merge in the next (the Never list's last line).
- Merge order: the stated order where two lanes edit the same lines (Gate 5 item 9). Two PRs that both append rows to one `handbook/errata/` file conflict on the second: brief the second lane to `git merge origin/main` after the first lands, keep both rows in PR order, re-run check, lint and test, and push; that commit earns no review round (`vellum-footguns` defaults).
- A dependency a lane adds: the lane installs in its own tree (implementer definition) and reports the resolved versions; the orchestrator mirrors every outstanding lane's dependencies into the main checkout in ONE `npm install --no-save <pkg>@<ver> ...` call (a second `--no-save` install removes the first's package), only while no lane or review sandbox is running a suite (they all link main's `node_modules`); one `npm ci` in main after the merge, under the same condition.
- A lane's next pull request of the same issue starts on a fresh branch from `origin/main`, never by merging main into a branch whose PR squash-merged.

**6. Issues a lane files.**
- Lanes never touch the board (implementer definition). Every issue a lane files is the orchestrator's to add and phase, and is reported to Alex on its own line with its number and the phase it went into. A small defect found in docs or spec work is proposed for a phase that does not displace the active work, never the active one; phase names are read from the board.

**7. Handing over and retiring a lane.**
- Plan a handover at each PR boundary of a multi-PR issue, and take a lane's own estimate of its remaining context as a guess. A fresh lane takes over from the committed plan, the issue's comments and the earlier lane's prefixed scratch tools, and runs recon and the plan skeptic on its own pull request's row, as workflow step 8's per-PR plan implies.
- Retire a lane's tree once its last PR has merged and it has reported: copy its `out/` first (`git worktree remove` deletes the gitignored `out/`, and `git status --porcelain` reports nothing there); the tree is locked by the session's own process, so unlock it once the lane has reported; remove the `node_modules` link, then `git worktree remove --force`.

**8. Before the session ends.**
- The scratchpad does not outlive the session: copy each lane's tools to `out/scratch-<date>/` with a handover note of each lane's open items, under no name `node --test` collects (Gate 1 item 8 names the patterns; they are collected inside the gitignored `out/` too).

## Other edits

**`CLAUDE.md`** (M2):
- The spec table gains the row for the new spec (what it holds: how a session runs several implementer lanes at once, briefing them, relaying their menus and Alex's rulings, watching CI, a stalled lane or a lost tree, merging, retiring a lane; read it before dispatching a second lane, and before handing an issue from one lane to another).
- The opening paragraph stops saying durable gotchas live in auto-memory and points at the one list of what it keeps, which is `handbook/specs/conventions.md`'s (below): "**What auto-memory keeps is `handbook/specs/conventions.md`'s list (Where a rule lives), and no development-process rule is on it**: the specs, the gates and the agents hold those." The memory file names it already gives stay, by Issue #729's scoping.
- Process: "Alex reviews and merges" points at the new spec for a grant; Worktrees: the `vellum-implementer` bullet points at it for running several lanes.
- Session handoff: the `gh project item-list` recipe counts its rows against the board's total (`--format json --jq '.totalCount, (.items | length)'`, raising `--limit` until they agree: the default page is 30); a finished phase is renamed `<Name> (done)` in place, never deleted, and open stragglers are offered a move, never moved unasked; a phase option is added or renamed only with every existing option resent with its `id`, after snapshotting every item's phase, and the tally is diffed after. No ids. The `gh project item-list` mentions at the head of `CLAUDE.md` and in the rulebook's first list name the Project, not a recipe, and stay.

**`handbook/specs/development-workflow.md`:**
- Intro: the list of other places gains the new spec, and "Four other places" loses its count.
- Step 3: the reading list gains the new spec.
- Step 6: a menu's stated consequence is measured, and a premise about what a tool reads is checked, before it goes to Alex; an option about code he cannot picture carries a real before and after from the repo. The dispatched-lane paragraph points at the new spec for the relay.
- Step 10: bring a branch current with `git merge origin/main`, never a rebase (a conflicted `rebase --continue` strips a subject that starts with `#`, and every subject here does; Gate 5 item 9 rules the squashed-base case). An output file is not evidence that the run just made wrote it: its mtime against the run's start, the command's real exit status (no pipe, or `pipefail`), one expensive run confirmed before the next, and a measuring script with a failed row exits non-zero and writes nothing. A subagent's claim (a lane's, a skeptic's, a prover's) is a claim like any other: relay it with the command behind it, or as its claim; a partial ledger from a prover stopped mid-run is not evidence until its rows are re-run.
- Step 11: arm a deadline when dispatching a budgeted agent, and at it nudge with a message, never a stop: the agent's only durable output is its final report.
- Step 12: before opening a PR with no issue, search the open issues for one it would close or whose ruling it would override (`gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open <keywords>'`). In an orchestrated run the dispatcher posts Alex's rulings as he gives them, and the lane's record points at that post rather than restating it (M3).
- Step 14: a review run by an agent outside the house's set (a Workflow script's subagent) gets a read-only toolset, and after any agent that could write, `grep -rn MUTATION src/ test/`, `git diff` and a fresh test run come before the commit.
- Step 15: an issue filed here is searched for first, open issues and `handbook/errata/` both, and a near duplicate is folded into the older issue.
- Sweeps: the post-epic sweep posts one ledger of the rulings on the epic beside the per-sub comments.

**`.claude/agents/vellum-implementer.md`:**
- Reading list: `handbook/specs/orchestration.md`, for what the session running the lane does at its STOP, its merge and its handover.
- Where you stand: a dependency added in a lane removes the `node_modules` link and installs for real, since `npm ci` through the link empties the main checkout's install, and reports the resolved versions.
- When to stop: every issue the lane filed, each number on its own line.
- Phase two's record line points at the dispatcher's posted rulings rather than restating them (M3).

**Review agent definitions (M8):** `.claude/agents/vellum-pr-skeptic.md`, `.claude/agents/vellum-plan-skeptic.md`, `.claude/agents/vellum-spec-recon.md` and `.claude/agents/vellum-plate-reader.md` each gain one line: the session scratchpad is shared with parallel lanes, so every scratch path carries the issue or PR number as its prefix, and the full local e2e lanes are never run. `.claude/agents/vellum-guard-prover.md` already keeps its scratch under its own prefix outside the scratchpad and is left alone. The recon definition's board recipe also counts against the total.

**Two e2e-writing procedures that sat among the product notes**, routed as M1 ruled, since what a line says decides its home and not where it sat: `.claude/agents/vellum-plate-reader.md`'s "CDP touch is fragile" bullet gains the phone-metric step (scroll the map into view, and check the visual viewport's scale reads about 1, before the first touch; the harness facts behind it stay out per M7); `handbook/specs/cascade-traps.md`'s affordance-gate bullet gains its corollary (assert a visibility that depends on the environment only under the matching `matchMedia` condition, and pin the rule's own scoping by reading the CSSOM, which reproduces a CI-only failure locally).

**`handbook/specs/rulebook.md`:** the sibling paragraph and the companion footer gain the new spec; beside "It replaces the body of issue #193", existing `#193` citations stay as they are and are not drift to report. Nothing goes into Product direction: M5 keeps the outside-users weighting private.

**`handbook/specs/conventions.md`:** "Where a rule lives" gains ruling 1 as the ONE list of what the private auto-memory keeps, with every kind M1 and M7 leave there and nothing else: "No development-process rule lives in the private auto-memory. It keeps private facts (the board's ids, Alex's own devices and accounts), the fast-changing traps this paragraph keeps out of the repo, the measurements behind the product specs, and pointers into the repo." `CLAUDE.md`'s opening points here rather than restating it.

**`.claude/skills/vellum-footguns/SKILL.md`** (after Issue #782's merge, each measured against the pasted-note bound with the selftest and the README's cost one-liner): the instruments line as a new Gate 1 item; Gate 5 item 8's clause per M3.

**`.claude/skills/vellum-footguns/references/scars.md`:** a new section, "Behind the lines Issue #783 moved", before "Where the rules are written down", one row per incident behind a line this change writes, only where an issue or pull request on the public record shows it (M4), each with the line it stands behind and its public anchor, and no counts; the closing list gains the new spec. No row names the private store (`test/repo/memory-pointers.test.ts` reads this file); a lesson from a private note says "a private note".

**`.claude/skills/vellum-footguns/references/held-lines.md`:** a dated "Noted" line under the Never section's rebase row (workflow step 10 now states the rule; the gate line still waits for its incident); a Never-section row for `npm ci` through a linked `node_modules`, with the incident that would earn its line.

**`handbook/specs/settle-doctrine.md`** (M9): clause 12, "A CI flake leaves a trail", gains the three-strikes sentence: when a check's rows in the flake record reach three with no issue open for it, raise it in the same reply and offer to file one. The flake record itself and Gate 2 item 10 are untouched.

**`handbook/plans/783/783-plan.md`:** this plan, as the rulings leave it.

**The PR body** carries a disposition table by destination (which homes received what, which kinds stayed private, which were stale or already covered), with no private file names, as Issue #708's PR table and Issue #729's copy-out condition did, and lists every passage copied into the repo with its destination.

## Tests and the mutation each would need

No new guard: the change is prose. The checks that bind it already exist and must stay green: `test/repo/prose-paths.test.ts` (a backticked path resolves; placeholder and scratch names with an extension go unbackticked), `test/repo/memory-pointers.test.ts` (the agent and skill edits name no memory file, path or store word outside a kept line), and `test/repo/footgun-gate.test.ts` with the selftest if `SKILL.md` is touched. So there is no prover round (workflow step 11 owes one only for a new or strengthened guard).

Not proposed: widening `test/repo/memory-pointers.test.ts` to read `handbook/specs`. Its red is the widening itself, which fails at once on conventions.md's own memory paragraph and the ruling-1 sentence until each joins `KEPT`; `findingsIn` already refuses a store word under any path. Offered as a follow-up issue, not built here (a stated call).

## Evidence

- `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`; the selftest when `SKILL.md` is touched.
- A scan of the whole diff, plan included, for a memory address (the store's file-name prefixes, its index's name, its wikilink form and its directory path, the same forms `ADDRESS` in `test/repo/memory-pointers.test.ts` matches) and for any private fact, in a call of its own.
- `grep -nP '\x{2014}'` over the added lines, in its own call.
- Each factual claim in the new spec names its command in the PR body. Measured in phase one: `main`'s required checks are not strict (`gh api repos/ahl-gram/Vellum/branches/main/protection/required_status_checks --jq .strict` prints `false`); `gh pr merge --help` carries `--match-head-commit`, `--subject` and `--body-file`; a second `git branch <existing> origin/main` exits 128; the footgun hook refuses through its output with exit 0; `gh project item-list` defaults to 30 rows (the plan skeptic's run). Measured in phase two before writing: the lost-tree registration recipe on a scratch repo.
- After merging Issue #782's PR in, every gate citation in the diff is re-read against the merged `SKILL.md` by hand, since no check sees prose.
- `gh pr view <PR> --json closingIssuesReferences` lists Issue #783.
- No e2e: nothing a browser reads changes.

## Rosters and doctrine the change drags

- The five reading lists: the `CLAUDE.md` table, workflow step 3, the implementer's list, the rulebook's sibling paragraph and its companion footer.
- `scars.md`'s closing list.
- Workflow step 14: this PR edits agent definitions, so the body says which version of each wrote the change and which reviewed it. Under M8 it edits `vellum-pr-skeptic` and `vellum-plan-skeptic` themselves, so this PR's one cold round reviews a change to its own reviewer's definition, which step 14 says cannot be trusted to judge that change; the body names it.

## Sequencing

Issue #782's PR (PR #787) merged first, at `08c80c8`, and this branch was brought current with `git merge origin/main` before any edit. It added Gate 7 between Gate 1 and Gate 2 and left markers at Gate 1 items 13, 15 and 17; every gate citation this PR writes is read against that `SKILL.md`.

## The rulings (Alex, 2026-10-06, posted on Issue #783)

- M7: the step goes in, in plain words; the tool's exact behaviour stays out and private, the one kind of note memory keeps besides private facts, measurements and pointers; the items kept out on Issue #708 and Issue #729 stay where they are.
- M1: the four project notes stay private for a follow-up issue; the phone-touch step and the Issue #170 corollary move anyway.
- M6: only what each clearance names (the narrow form, not the one recommended).
- M3: the orchestrator posts Alex's words the moment he answers, and the lane's later record points at that post; workflow step 12, the implementer definition and Gate 5 item 8 change to say so.
- M8: each review agent's own definition carries the scratch-prefix and no-full-e2e lines; no follow-up message.
- M2: the table row, the opening pointing at conventions.md's list, two pointers, the board recipe that counts rows, the phase rename and resend rule; the two claim rules go to workflow step 10.
- M4: one `scars.md` row per incident behind a line this change writes, only where the public record shows it, with no counts.
- M5: stays private; nothing in the rulebook.
- M9: a sentence in settle-doctrine clause 12.

The lane's calls (no new guard; no gate line for `npm ci` through the link; the instruments gate line; merge-never-rebase as a spec rule; the orchestrator's pre-merge probe as practice; a fresh lane's recon on its own row; the copied-passage list in the body; the two test-writing steps; the disagreements not imported; the two memory claims measured false) were not put to Alex one by one and stand as calls open to overrule.
