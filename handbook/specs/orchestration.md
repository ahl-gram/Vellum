# Running several lanes at once

**This file is the orchestrating session's half of running several lanes at once**, a lane being
one issue's `vellum-planner` and then its `vellum-implementer`: how it briefs them, relays their menus and Alex's rulings, watches them, recovers one that
stalls or loses its tree, merges what it is cleared to merge, and retires them. Read it before
dispatching a lane, and before handing an issue from one lane to another.

Each lane runs `handbook/specs/development-workflow.md` up to an open pull request with CI green,
the planner through step 6 and the implementer from step 7 to that point, and the lane's own half is its two definitions':
`.claude/agents/vellum-planner.md` holds the plan, the STOP and the folded rulings, and
`.claude/agents/vellum-implementer.md` the branch, the build, the hand-back and never merging. `CLAUDE.md`'s Worktrees section holds the worktree conduct every session keeps. This
file points at those homes rather than restating them, and where a step here meets one of them, that
home's line wins for the lane and this file's for the orchestrator.

## Dispatching lanes

- **Dispatch a `vellum-planner` per issue**, or per pull request of an issue that ships as several,
  and a `vellum-implementer` on its plan only once Alex has seen it at the STOP, empty menu or not,
  and its Open decisions line reads `none`; never
  a general-purpose agent with a retyped brief. Each definition carries the model, the effort, the
  worktree isolation and its half of the sequence, and a retyped brief drops one of them.
- **The implementer's brief adds the plan's absolute scratchpad path**, and nothing of the planner's
  reasoning beyond what the plan itself says: the plan is the contract, and a builder told why a
  design was chosen is a builder invited to re-choose it.
- **The brief carries what the lane cannot read for itself**: the issue number; the lanes running
  beside it and the files each owns; where two lanes must edit the same lines, the order they merge
  in (`vellum-footguns` Gate 5 item 9) and the instruction to keep both edits in that order; the
  session link for the attribution trailer (`CLAUDE.md`, Process); push at the first commit and
  commit small and often; any ruling of Alex's, quoted from its posted comment; and, where it asks
  for a read of the roadmap board, a read that counts its rows against the board's total, since a
  listing cut short is not an absence (the Never list).
- **A sub Alex calls small gets a brief that carries his cap and names the reviews he skips.** The
  brief quotes his words on time and tokens (a cap, or "keep time and tokens down") and lists the
  rounds he skips (the plan, the guard prover, the cold skeptic); the lane runs no
  more than that and stops at the open pull request. Where he skips the plan, the issue body is
  the plan and the implementer is dispatched on it, handing back if the issue is not true on main.
  The pull request body's Records line says which reviews were skipped by his order, with the date.
  A sub is small when he calls it so, never on the orchestrator's own judgement.
- **Several planners may run at once.** Recon and the plan write no code,
  so running them together is cheap and batches Alex's menus into one sitting; the builds are the
  expensive part.
- **No agent in a parallel run runs the full local e2e lanes.** A starved machine stalls the lanes
  beside it rather than failing them, which is why local suites run one at a time (`vellum-footguns`
  Gate 2 item 11); CI runs every lane on every pull request. The implementer's and every review
  agent's own definition carries this, and the scratch prefix where the agent writes scratch.
- **The orchestrator's own scratch files carry a prefix too**, since the scratchpad is shared with
  every lane and every agent a lane dispatches.

## The STOP and the relay

- **A planner's menu is its hand-back** (workflow step 6). Put it to Alex; post his answer on the
  issue as a dated comment the moment he gives it, in his own words; then message the same planner
  with the rulings, quoting that comment, never a paraphrase, so it folds them into the plan. The
  implementer's record points at the post rather than restating it (workflow step 12).
- **Archive a finished plan in two places before anything else happens to it.** Until the
  implementer's first commit is pushed, the scratchpad holds the only copy and it ends with the
  session. When the planner reports `Open decisions: none`, copy the plan to `out/plans/` in the
  main checkout under its file name with a UTC timestamp before `.md`, so a revision never
  overwrites an earlier copy, and `cmp` the copy against the scratchpad file. Then post it on the
  issue, which survives the machine. Each archive comment opens with the fixed line
  `Plan archive, not a ruling: <plan file name>, part <i> of <k>, sha256 <hex>`, `<hex>` being
  `shasum -a 256` of the whole plan file on every part, then a blank line and the plan text. A
  revision is archived the same way under its own file name, the one its planner gave it (workflow
  step 8), `<plan file name>` naming that file with nothing added after it. Where two archives name
  one file, the sha256 on their opening lines says which is which. A plan too long for one comment
  is cut at line boundaries into parts of at most 60,000 bytes, posted in
  order, one `gh issue comment --body-file` per call. Read the comments back with `gh api` and
  confirm the parts, joined, equal the file apart from a final newline. A lost plan is restored
  from `out/plans/`, or from the comments by joining the parts, dropping each opening line and
  checking the sha256. `.claude/agents/vellum-implementer.md` quotes the opening line's fixed text
  so that it does not count these comments as new ones, `.claude/agents/vellum-planner.md` to count
  revisions and `.claude/agents/vellum-pr-skeptic.md` to read a plan as the design the rulings
  ratified and not as a ruling: edit the four together.
- **Once the plan is archived, retire the planner's tree** after copying its `out/` across
  (Retiring, below), and dispatch the implementer on the plan's scratchpad path.
- **An implementer's hand-back goes to a fresh `vellum-planner`**, which gets a fresh tree, dispatched
  with the issue, the plan's path and the hand-back, never a message to the retired one, which has no
  tree to stand in, and from the planner to Alex when it opens a
  decision. Never answer a hand-back yourself with a design call: that puts the decision back in the
  cheaper lane by another route. The implementer resumes on the revised plan's path and commits the revision beside the plans before it (workflow step 8).
- **A ruling a lane will need before its own record is on the issue before the lane is briefed.** A
  standing ruling above all: a cold skeptic reads only the issue, and raises a rule it finds
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
- **A red job on a lane's pull request is read before it is re-run or handed to a planner.** Read
  the failing job's log
  (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), the numbers
  of its `FAIL` lines and, for an e2e lane, the fingerprint its verdict line ends on, against
  "Where the Mac and the CI runner disagree" in `handbook/specs/settle-doctrine.md`; then send the
  lane on with the red, its job id and what you read, and its definition has it take the Mac's
  reading and the staged one (`VELLUM_E2E_RUNNER_LAYOUT=1`) where it names them, and report. A red
  of the same check on several lanes' pull requests at once is read and fixed once, by the lane you
  pick, the others merging `main` after its pull request lands, and their local runs go one at a
  time (`vellum-footguns` Gate 2 item 11). A red its Mac run reproduces is the lane's, by its
  definition, and is not re-run. Whether a red is explained is that spec's clause 15; an explained
  red gets no flake row and no re-run: tell the lane, which rewrites the check as its definition
  says, and no planner sees it (Alex, 2026-10-24), except on a check the lane rewrote, or one
  already carrying the marker its definition leaves on a rewrite, where the fix would be a rewrite
  of the check: it is never rewritten twice, and that red goes to a fresh planner of the lane's own
  issue with both readings, a browser check and a unit test alike (Alex, 2026-10-25). A red that is
  neither explained nor the lane's by its definition, on such a check, whichever pull request
  rewrote it, is never re-run either (Alex, 2026-10-25). An e2e check is pulled out with no flake
  row: once the lane has given the later checks in its suite their own waits, committed every other
  fix the run asks of it without pushing, and reported, file an issue holding both readings and what
  was tried, put it on the board, take the lane's tree out loud (One writer per tree, above), add
  the check's entry as that spec's item 11 says, run its suite there and push, the one push for that
  run, saying so in the pull request's body, then hand the tree back out loud and the lane goes on
  with its build; the pull request merges without the check, which is unguarded until its issue is
  fixed. A unit test has no skip list, so its red gets its flake row, in a pull request of your own
  as below, with a disposition that keeps the words `a rewritten unit test re-planned`, and goes to
  a fresh planner as an explained one does; and you tell Alex at once, plainly and at the head of
  your message, and again in your next report to him, that a rewritten unit test has failed again on
  CI: the test, the pull request, the run and job, what the list did and did not explain, and how
  many times it has happened, the rows with those words in the flake record on `main` and the one
  you filed (Alex, 2026-10-25). A rewrite, or those waits, made after the cold review's one round is
  read only by you, before the merge (Merging, below), your report to Alex naming each rewritten or
  pulled-out check. Any other red is re-run once, on `vellum-footguns` Gate 2 item 10's terms: open
  a pull request of your own that adds its row to
  `.claude/skills/vellum-footguns/references/flake-record.md`, post the pull request comment that
  item asks for on the lane's, then re-run that job alone (`gh run rerun <run> --job <job>`), your
  pull request's own checks running beside it, and set the row's disposition from the re-run in
  your pull request, one more for Alex to merge (Alex, 2026-10-24). Where the same run also needs
  a rewrite or a pull-out, the push that carries it is that re-run, made once your row's pull
  request is open, since a push cancels a run still in progress for the same pull request (the
  `concurrency` group in `.github/workflows/ci.yml`). Where the row is its step's third, its pull
  request also carries clause 12's issue and skip, no re-run is made, and the lane merges `main`
  once it lands. Your row pull requests merge as two errata rows do (Merging, below). The re-run
  clears the red only if that check passes, and the lane goes on with its build; a red in another
  check on it is a new red, read the same way. Any red the lane hands back carries its read, and
  goes to a fresh planner with it, never as the bare red; a difference the subsection does not
  name goes named so, since the change that records it adds its line there.
- **When a lane's next report does not mention a request sent to it, check its branch and send the
  request again.** A message to a lane that has stopped can sit unread.
- **End the poll loops a lane leaves behind.** A wait loop on a marker that never comes runs for
  hours after its lane has finished; find them with `ps` and end them.
- **Every update to Alex names each lane in flight by what it is for and what hangs on it.** For
  each lane give, in this order: the issue or pull request number with a plain-words description of
  what it is for, what the lane is doing now, and what depends on it or comes next (the issues and
  pull requests that wait on it or overlap its files, and the decision it will hand back, if any).
  Close with what waits on Alex, or say nothing does. A lane that finished since the last update is
  named once with its outcome. Alex keeps several lanes in his head at once, and a bare number
  makes him look each one up.
- **Where the issue-dial pane is present, set its columns whenever a lane starts or ends or what
  follows one is agreed**: one column per issue in hand, up to three, each with the issues that
  could follow it without colliding with the other columns.

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
- **A fresh implementer takes over a dead lane's pull request on the pull request's own branch, once
  the dead lane's tree is retired**, since git refuses to check out a branch another tree holds.
  Commit the dead lane's uncommitted edits as a WIP commit in its tree, taking the tree over out
  loud (One writer per tree, above), and push it; retire the tree as "Handing over and retiring a
  lane" says, though its pull request is still open; then brief the fresh lane with the pull request
  and its branch, which its definition takes in place of a rename.
- **When Alex says he is near his usage limit**, tell every running lane to commit and push small and
  often, and start the handoff early.
- **A lost tree is rebuilt by the orchestrator, never by the lane.** Workflow step 6 says when the
  harness takes a lane's tree; the branch survives it. First confirm the tree is gone: `ls <path>`
  fails. A path that still holds its `.git` file is a live tree, whatever its lane is doing, and is
  never cleared, since `worktree remove -f -f` deletes a live tree's uncommitted work. Then read
  `git -C <main checkout> worktree list --porcelain`: where the dead tree's registration outlives
  its directory, locked or not, a plain `worktree add` at the same path refuses, and a locked one is
  listed without the word `prunable`, so the missing directory is the test, never that word. Rebuild
  at the SAME path on the lane's branch in two commands,
  `git -C <main checkout> worktree remove -f -f <path>` to clear that dead registration (skip it when
  the listing does not name the path) and then `git -C <main checkout> worktree add <path> <branch>`,
  reading each exit code rather than the output, which prints a preparing line before a refusal.
  Never `-f` on the `add`, which also switches off git's refusal to check out a branch some live tree
  already has, and never `git worktree prune`, which clears every other unlocked missing
  registration too, other sessions' included. A leftover directory that holds files but no `.git`
  file blocks both commands: move it to the Trash first. Then link `node_modules` by path as
  `scripts/agent-sandbox.ts` does, bring a lane that had no commits current with
  `git -C <path> merge --ff-only origin/main`, and message the lane to resume from its scratchpad
  plan. A planner whose tree is lost is never resumed without one: dispatch a fresh planner on the
  scratchpad plan, after copying any stills its tree still held.

## Merging

- **Alex merges** (`CLAUDE.md` Process, workflow step 16). He clears the orchestrator to merge per
  pull request or per named group of lanes, and a clearance covers what it names: a pull request or
  a lane outside it goes back to him.
- **Before a merge, the pull request's one review round has run and its fixes are in** (workflow
  step 15). What says so is the lane's final report, the one its definition's "When to stop" lists,
  carrying the head sha and the skeptic's findings with what was done about each; that sha is the
  one the merge's `--match-head-commit` takes. Never your own reading of the branch's commits, its
  body or CI. Read every commit after that round yourself, since nothing reviewed it, and say so in
  your report to Alex. Where main moved under the branch, the lane runs workflow step 10's
  combined-state check first: `main`'s required checks do not require a branch to be current, so the
  merged state is not the state CI ran.
- **For a refactor, a moved proof or a new guard, run a check of your own before the merge.** Build a
  detached tree at the pull request's head (`git -C <main checkout> worktree add --detach <path>
  <sha>`, `node_modules` linked by path as `scripts/agent-sandbox.ts` does), run the lane's proof and
  guard tests there, plant one change in the moved code or against the new guard and confirm the
  proof reports it, then remove the tree. The plant may instead go to the CI proof runner, on the
  terms `handbook/specs/development-workflow.md` step 11 sets, when the queue ahead of it is short. Place the planted change where coverage shows the code
  runs: one on a path real worlds never reach moves nothing and proves nothing. A lint probe goes in
  an existing file, since a new file outside what the type checker includes fails the lint's project
  service as a parse error before any rule runs; run the lint as `npm run lint`; a probe of the
  footgun hook reads its output rather than its exit code, which is clean on a refusal, and runs the
  same payload against main's hook as the control.
- **Squash with `gh pr merge <PR> --squash --match-head-commit <sha> --subject "<#N title> (#<PR>)"
  --body-file <file>`.** Build the body from `git log --no-merges origin/main..origin/<branch>
  --reverse --format='* %s%n%n%b'` with each commit's trailer lines taken out, since the pull
  request's own commit listing cuts headlines short; close it with one trailer block, each distinct
  `Drafted-By:` line those commits carried beside the session's own lines (`CLAUDE.md`, Process),
  since a lane's `Co-Authored-By` or session link can drift; and grep it for an em-dash before
  merging, since the hook reads no merge body. Write the file in one call and merge in the next (the
  Never list's last line).
- **Merge in the stated order** where two lanes edit the same lines (Gate 5 item 9). Two pull
  requests that both append rows to one `handbook/errata/` file conflict on the second merge, every
  time: brief the second lane up front to `git merge origin/main` once the first lands, keep both
  rows in pull request order, re-run check, lint and test, and push. That commit earns no review
  round (`vellum-footguns`, Defaults this repo has already ruled).
- **A dependency a lane adds or upgrades** is installed in the lane's own tree (its definition) and
  reported with its resolved version. Mirror every outstanding lane's dependencies into the main
  checkout in ONE `npm install --no-save <pkg>@<ver> ...` call, lockfile untouched, so the review
  sandboxes, which link the main checkout's `node_modules`, can import them. Name only what the
  lanes' `package.json` files name: npm brings each package's pinned family along, and listing that
  family beside it can make npm refuse the whole call against what is installed. A second
  `--no-save` install removes the package the first one added. Run it, and the one `npm ci` in the
  main checkout after the merge, only while no lane or sandbox is running a suite, since every one of
  them links that install.
- **A lane's next pull request for the same issue starts on a fresh branch from `origin/main`**,
  never by merging main into a branch whose pull request squash-merged.

## Issues a lane files

- **Lanes never touch the board** (their definition). Every issue a lane files is the orchestrator's
  to add and phase, and is reported to Alex on its own line with its number and the phase it went
  into. A small defect found during docs or spec work is proposed for a phase that does not displace
  the active work, never the active one; read the phase names from the board.

## Handing over and retiring a lane

- **Plan a handover at each pull request boundary of an issue that ships as several**, and take a
  lane's own estimate of its remaining context as a guess. A fresh `vellum-planner` takes over from
  the committed plan, the issue's comments (the rulings and the numbered calls) and the earlier
  lane's prefixed scratch tools, and runs recon on its own pull request's row,
  as workflow step 8's plan per pull request implies; a fresh implementer builds that plan.
- **Retire a lane's tree once its last pull request has merged and it has reported.** Copy its `out/`
  first, giving each delivery folder copied its page as workflow step 6 says: `git worktree remove`
  deletes the gitignored `out/`, and `git status --porcelain` reports nothing there. The harness locks the tree to the session's own process, so unlock it once the lane
  has reported (`git -C <main checkout> worktree unlock <path>`), remove the `node_modules` link,
  then `git -C <main checkout> worktree remove --force <path>`.
- **Stop the finished review agents a retired lane dispatched.** They stay in the session's agent
  list as finished rows after their lane goes, and with the parent gone they show at the top level
  beside the main session, where they read as stuck. List the session's agents, and stop each
  finished one the lane dispatched, so no finished child is left at the top level. One still running
  is never stopped: nudge it with a message, as `handbook/specs/development-workflow.md` step 11 says.

## Before the session ends

- **The scratchpad does not outlive the session.** Copy each lane's tools, and every plan not yet
  finished, to `out/scratch-<date>/` with a handover note of each lane's open items; a finished
  plan is already in `out/plans/`.
- **Every issue filed in the session is on the board and phased** (`CLAUDE.md`, Session handoff).

---

*Companion to `handbook/specs/development-workflow.md` (the sequence each lane runs),
`.claude/agents/vellum-planner.md` and `.claude/agents/vellum-implementer.md` (the lane's own half), `CLAUDE.md` (the worktree conduct and
the board), and `.claude/skills/vellum-footguns/SKILL.md` (the gates, the Never list and the
defaults this file points at).*
