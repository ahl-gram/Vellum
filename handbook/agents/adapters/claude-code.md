# The Claude Code adapter

For the slot and generation rules, read the paragraph **An agent is written once, as its role body, and generated for each harness** under **Where a rule lives** in `handbook/specs/conventions.md`.

<!-- slot: designer-effort -->

Before anything else, before any reading, run `echo "effort=$CLAUDE_EFFORT"` and `pwd`, and put both lines at the head of your report.

<!-- slot: designer-tree -->

What a round or a breakdown delivers is files under `out/`, so you never run in a harness-isolated tree: the harness deletes one when its agent's run ends unless git sees a change in it, and `out/` is not one (`handbook/specs/development-workflow.md` step 6).

<!-- slot: designer-fenced -->

A session fenced inside a worktree (a planner or an implementer, an EnterWorktree session) cannot dispatch you this way, and hands you to the orchestrating session, as step 6 says.

<!-- slot: designer-menu -->

Do not call AskUserQuestion: it cannot reach Alex from where you are.

<!-- slot: prover-isolation -->

Do NOT set up isolation through the harness. `worktree.baseRef` is not set in this repo, so it takes the harness default `fresh` and isolation would branch from `origin/main`, leaving you to mutate and test the wrong code.

<!-- slot: prover-edit-fence -->

The fence refuses the Edit tool on a sandbox file as well, and its refusal names the dispatch tree's copy of that file as the one to edit instead, which is the one tree you must never edit (measured 2026-09-27, Issue #707): that is why you hold no Edit tool, and change a sandbox file only through the commands under "Changing a sandbox file" below.

<!-- slot: prover-no-edit -->

You hold no Edit tool, like every other review agent in this project (a verify agent once left `// MUTATION:` edits in Vellum source):

<!-- slot: implementer-tree -->

You are in a harness worktree under `.claude/worktrees/`, on a branch the harness named.

<!-- slot: implementer-branch -->

Rename the branch BEFORE the first commit: `git branch -m <fix|chore|feat>/N-<slug>`.

<!-- slot: implementer-fence -->

Harness worktree isolation is a fence, and the Worktrees section of `.claude/rules/claude-code.md` lists what it refuses: read it before your first git command. Run each git command alone, take a printed path literally rather than through a variable, and use the Edit and Write tools for file edits. `echo $CLAUDE_EFFORT` prints the effective level you are running at.

<!-- slot: implementer-gone -->

If your worktree is gone, do not rebuild it yourself: the main checkout is off limits to you and the harness refuses the command.

<!-- slot: planner-tree -->

You are in a harness worktree under `.claude/worktrees/`, fenced the way the Worktrees section of `.claude/rules/claude-code.md` describes, which you read before your first git command, and you never run anything in, edit, or restore the main checkout.

<!-- slot: planner-menu -->

Do NOT call AskUserQuestion: it cannot reach Alex from where you are, and `handbook/specs/development-workflow.md` step 6 names the dispatcher as the one who puts your menu to him.

<!-- slot: skeptic-no-edit -->

A verify agent with Edit access once left `// MUTATION:` comments in Vellum source; that is why your toolset has no Edit and no Write, and why the standing rule in this project is that review agents never mutate.

<!-- slot: recon-claims-write -->

with the Write tool

<!-- slot: recon-claims-rewrite -->

Where an earlier run left that file, Read it first, since the Write tool overwrites only a file it has read, and then write over it whole.

<!-- slot: recon-tools -->

You have Bash for `gh api`, `ls`, `git log`, `npm` introspection and `npm run recon-triage`, and the Write tool for the claims file alone.
