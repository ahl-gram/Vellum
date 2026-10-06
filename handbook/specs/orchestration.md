# Running several lanes at once

**This file is the orchestrating session's half of running several `vellum-implementer` lanes at
once**: how it briefs them, relays their menus and Alex's rulings, watches them, recovers one that
stalls or loses its tree, merges what it is cleared to merge, and retires them. Read it before
dispatching a second lane, and before handing an issue from one lane to another.

Each lane runs `handbook/specs/development-workflow.md` from start to finish, and the lane's own half
is `.claude/agents/vellum-implementer.md`'s: its branch, its tree, its scratch files, its STOP, and
never merging. `CLAUDE.md`'s Worktrees section holds the worktree conduct every session keeps. This
file points at those homes rather than restating them, and where a step here meets one of them, that
home's line wins for the lane and this file's for the orchestrator.

## Dispatching lanes

- **Dispatch a `vellum-implementer` per issue**, or per issue that ships as several pull requests;
  never a general-purpose agent with a retyped brief. The definition carries the model, the effort,
  the worktree isolation and the sequence, and a retyped brief drops one of them.
- **The brief carries what the lane cannot read for itself**: the issue number; the lanes running
  beside it and the files each owns; where two lanes must edit the same lines, the order they merge
  in (`vellum-footguns` Gate 5 item 9) and the instruction to keep both edits in that order; the
  attribution lines; push at the first commit and commit small and often; any ruling of Alex's,
  quoted from its posted comment; and, where it asks for a read of the roadmap board, a read that
  counts its rows against the board's total, since a listing cut short is not an absence (the Never
  list).
- **Several lanes may sit in phase one at once.** Recon, the plan and the plan skeptic write no code,
  so running them together is cheap and batches Alex's menus into one sitting; the builds are the
  expensive part.
- **No agent in a parallel run runs the full local e2e lanes.** A starved machine stalls the lanes
  beside it rather than failing them (`handbook/specs/settle-doctrine.md`, The environment); CI runs
  every lane on every pull request. Each review agent's own definition carries this and the scratch
  prefix.
- **The orchestrator's own scratch files carry a prefix too**, since the scratchpad is shared with
  every lane and every agent a lane dispatches.

## The STOP and the relay

- **A lane's menu is its hand-back** (workflow step 6). Put it to Alex; post his answer on the issue
  as a dated comment the moment he gives it, in his own words; then message the same lane with the
  rulings, quoting that comment, never a paraphrase. The lane's own record points at the post rather
  than restating it (workflow step 12).
- **A ruling a lane will need before its own record is on the issue before the lane is briefed.** A
  standing ruling above all: a cold plan skeptic reads only the issue, and raises a rule it finds
  nowhere there as a defect.
- **The orchestrator's own condition on a ruling is posted labelled as the orchestrator's**, never
  folded into Alex's words.
- **Read every ruling of a sitting together before relaying any of them.** Two rulings can combine
  into a behaviour neither one stated; ask the follow-up question then, not after a lane has built it.
- **A ruled number the lane may later measure past is relayed as a value with its stop condition**
  ("stop again only if a measured start exceeds it"), so a lane reporting a slower reading does not
  turn into one more ruling.
- **A delegation covers what it names.** A "take the recommendations" delegation covers the parts
  it names and nothing after them.
- **A fold ruling (Gate 5 item 7) is relayed for its batch**, never carried over from an earlier one.
- **A menu's quality is workflow step 6's**: its stated consequences measured, its premises about a
  tool checked, a real before and after for code Alex cannot picture. A lane's or an agent's claim
  in it is relayed as workflow step 10 says.

## While lanes run

- **One writer per tree.** Read a lane's tree with `git -C <path>` and write nothing in it. Before
  writing in one at all, check for an operation in progress (a `rebase-merge` or `rebase-apply`
  directory, a `MERGE_HEAD`, `git status`) and take ownership out loud, telling the lane it no longer
  has the tree. Two writers who collide say so, name the owner, abort and restart clean, since a
  half-resolved hunk nobody remembers writing gets trusted rather than re-derived. A merge of main
  into a lane's branch waits until the lane has stopped for good, and the lane that built a branch
  resolves its own conflicts, because it knows which side of a reworded line is right.
- **A task notification is evidence about the shell that exited, never about the lane.** A lane's
  stale poll can drain long after the lane moved on; read its branch for its state.
- **The orchestrator's own Bash** is the Never list's bare `cd` line.
- **Watch CI yourself.** A lane stops when it is down to waiting on CI (its definition); the
  orchestrator watches the checks with a background loop that exits when none is pending, or a
  monitor that prints only what is new since its last poll, because one that prints the whole state
  on every poll notifies on every poll. Then send the lane on.
- **When a lane's next report does not mention a request sent to it, check its branch and send the
  request again.** A message to a lane that has stopped can sit unread.
- **End the poll loops a lane leaves behind.** A wait loop on a marker that never comes runs for
  hours after its lane has finished; find them with `ps` and end them.

## A lane that stalls, dies or loses its tree

- **A lane reported stalled is not taken for dead.** Check its branch, its pull request and `ps` from
  outside, then resume it with a message to the same lane, which picks up from its own transcript;
  dispatch a fresh lane only when the resume fails. When the session's own commands are failing the
  same way at the same moment, the session's connection is the cause: wait for it.
- **A lane stopped by a usage limit leaves its edits uncommitted.** Confirm it is dead from its
  failure notice, never from its silence, since a quiet lane may still be committing; read its tree
  with `git -C` for commits and uncommitted edits; resume it after the limit resets with a message
  telling it to re-verify its own state by command. The review agents share the limit, so a review
  round waits too. Arm a timer for the reset rather than polling for it.
- **When Alex says he is near his usage limit**, tell every running lane to commit and push small and
  often, and start the handoff early.
- **A lost tree is rebuilt by the orchestrator, never by the lane.** Workflow step 6 says when the
  harness takes a lane's tree; the branch survives it. Read
  `git -C <main checkout> worktree list --porcelain` first: where the dead tree's registration
  survives too, locked as a lane's tree is, a plain `worktree add` at the same path refuses. Rebuild
  at the SAME path on the lane's branch in two commands,
  `git -C <main checkout> worktree remove -f -f <path>` to clear a dead registration (skip it when
  none is listed) and then `git -C <main checkout> worktree add <path> <branch>`, reading each
  exit code rather than the output, which prints a preparing line before a refusal. Never `-f` on the
  `add`, which also switches off git's refusal to check out a branch some live tree already has, and
  never `git worktree prune`, which clears every other unlocked missing registration too, other
  sessions' included. A leftover directory with anything in it blocks both commands: move it to the Trash
  first. Then link `node_modules` by path as `scripts/agent-sandbox.ts` does, bring a lane that had
  no commits current with `git -C <path> merge --ff-only origin/main`, and message the lane to resume
  from its scratchpad plan.

## Merging

- **Alex merges** (`CLAUDE.md` Process, workflow step 16). He clears the orchestrator to merge per
  pull request or per named group of lanes, and a clearance covers what it names: a pull request or
  a lane outside it goes back to him.
- **Before a merge, the pull request's one review round has run and its fixes are in** (workflow
  step 15). Read every commit after that round yourself, since nothing reviewed it, and say so in the
  report. Where main moved under the branch, the lane runs workflow step 10's combined-state check
  first: `main`'s required checks do not require a branch to be current, so the merged state is not
  the state CI ran.
- **For a refactor, a moved proof or a new guard, run a check of your own before the merge.** Build a
  detached tree at the pull request's head (`git -C <main checkout> worktree add --detach <path>
  <sha>`, `node_modules` linked by path as `scripts/agent-sandbox.ts` does), run the lane's proof and
  guard tests there, plant one change in the moved code or against the new guard and confirm the
  proof reports it, then remove the tree. Place the planted change where coverage shows the code
  runs: one on a path real worlds never reach moves nothing and proves nothing. A lint probe goes in
  an existing file, since a new file outside what the type checker includes fails the lint's project
  service as a parse error before any rule runs; run the lint as `npm run lint`; a probe of the
  footgun hook reads its output rather than its exit code, which is clean on a refusal, and runs the
  same payload against main's hook as the control.
- **Squash with `gh pr merge <PR> --squash --match-head-commit <sha> --subject "<#N title> (#<PR>)"
  --body-file <file>`.** Build the body from `git log --no-merges origin/main..origin/<branch>
  --reverse --format='* %s%n%n%b'` with each commit's trailer lines taken out, since the pull
  request's own commit listing cuts headlines short; close it with the session's attribution lines,
  since a lane's trailer can drift; and grep it for an em-dash before merging, since the hook reads
  no merge body. Write the file in one call and merge in the next (the Never list's last line).
- **Merge in the stated order** where two lanes edit the same lines (Gate 5 item 9). Two pull
  requests that both append rows to one `handbook/errata/` file conflict on the second merge, every
  time: brief the second lane up front to `git merge origin/main` once the first lands, keep both
  rows in pull request order, re-run check, lint and test, and push. That commit earns no review
  round (`vellum-footguns`, Defaults this repo has already ruled).
- **A dependency a lane adds** is installed in the lane's own tree (its definition) and reported with
  its resolved version. Mirror every outstanding lane's dependencies into the main checkout in ONE
  `npm install --no-save <pkg>@<ver> ...` call, lockfile untouched, so the review sandboxes, which
  link the main checkout's `node_modules`, can import them; a second `--no-save` install removes the
  package the first one added. Run it, and the one `npm ci` in the main checkout after the merge, only
  while no lane or sandbox is running a suite, since every one of them links that install.
- **A lane's next pull request for the same issue starts on a fresh branch from `origin/main`**,
  never by merging main into a branch whose pull request squash-merged.

## Issues a lane files

- **Lanes never touch the board** (their definition). Every issue a lane files is the orchestrator's
  to add and phase, and is reported to Alex on its own line with its number and the phase it went
  into. A small defect found during docs or spec work is proposed for a phase that does not displace
  the active work, never the active one; read the phase names from the board.

## Handing over and retiring a lane

- **Plan a handover at each pull request boundary of an issue that ships as several**, and take a
  lane's own estimate of its remaining context as a guess. A fresh lane takes over from the committed
  plan, the issue's comments (the rulings and the numbered calls) and the earlier lane's prefixed
  scratch tools, and runs recon and the plan skeptic on its own pull request's row, as workflow
  step 8's plan per pull request implies.
- **Retire a lane's tree once its last pull request has merged and it has reported.** Copy its `out/`
  first: `git worktree remove` deletes the gitignored `out/`, and `git status --porcelain` reports
  nothing there. The harness locks the tree to the session's own process, so unlock it once the lane
  has reported (`git -C <main checkout> worktree unlock <path>`), remove the `node_modules` link,
  then `git -C <main checkout> worktree remove --force <path>`.

## Before the session ends

- **The scratchpad does not outlive the session.** Copy each lane's tools to `out/scratch-<date>/`
  with a handover note of each lane's open items, under no name `node --test` collects: Gate 1
  item 8 names the patterns, and they are collected inside the gitignored `out/` too.
- **Every issue filed in the session is on the board and phased** (`CLAUDE.md`, Session handoff).

---

*Companion to `handbook/specs/development-workflow.md` (the sequence each lane runs),
`.claude/agents/vellum-implementer.md` (the lane's own half), `CLAUDE.md` (the worktree conduct and
the board), and `.claude/skills/vellum-footguns/SKILL.md` (the gates, the Never list and the
defaults this file points at).*
