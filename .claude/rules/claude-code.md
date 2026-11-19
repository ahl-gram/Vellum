# Claude Code

Claude Code loads this file beside `CLAUDE.md` when a session starts, and Codex never reads it. It
holds the steps of `CLAUDE.md`'s sections that only Claude Code can take, each under the name of
the section it belongs to there (`handbook/specs/conventions.md`, Where a rule lives).

## Process

- **Every definition under `.claude/agents/` carries an `effort`**, because an agent without one
  inherits the session's level. The check is `echo $CLAUDE_EFFORT` inside a dispatched agent, run
  from a session at some level other than that agent's own, since a session at the same level
  cannot tell the frontmatter from inheritance.
- **Dispatch a review agent by its name, never as a fork of the session**: a fork carries the
  conversation, and a cold review carries none of it (`handbook/specs/development-workflow.md`
  step 14).

## Worktrees

- **EnterWorktree is the normal way in.** It branches from `origin/main` rather than local HEAD, so
  the tree is current without a pull. One thing needs fixing by hand: any `/` in the name becomes `+`,
  in the branch AND the directory, and the branch takes a `worktree-` prefix on top. Rename the branch
  before the first commit, or the PR carries the harness's name instead of yours.
- **`vellum-planner` and `vellum-implementer` get their trees through `isolation: worktree`**
  in their frontmatter, so the harness builds and locks one at dispatch, a separate one for each. Inside such a tree, and inside any EnterWorktree tree,
  the harness is a fence: it refuses a compound command whose `cd` goes to a shell variable, any `git`
  run in a directory other than that worktree, a `for` loop around `git`, some quoted `jq` or `sed`
  constructs it cannot parse, and a call that names git (a `.git` path or the bare word `gitdir`
  included) once that call reads `$?`, while a plain single command passes (measured 2026-09-13 and
  2026-11-11, Issue #1340). A dispatched agent stands inside its dispatcher's fence, and its directory
  does not carry from one call to the next. That is why the sandbox recipes take `create`'s printed
  path literally, read the sandbox's sha from its `.git` file in calls of their own, and keep the `cd`
  in the call that runs. How a session runs several such lanes at once is
  `handbook/specs/orchestration.md`'s.
- **Do not switch worktrees while a dispatched agent is still running.** `EnterWorktree` and
  `ExitWorktree` in the parent silently disable that agent's commands for the rest of its life, and
  it goes on reporting what it can rather than failing, so the loss reaches you as a thin report and
  not as an error. Observed 2026-09-10: a cold skeptic finished its round with no tools left to it
  and handed the parent a list of probes to run instead of results. Wait for the agent before you
  move. No command here demonstrates the mechanism, so treat the instruction as the rule and the
  cause as unverified.
