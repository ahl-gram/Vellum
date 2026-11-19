# The Codex adapter

This file holds the steps a role body leaves to the harness, written for Codex on Alex's Mac. `npm run agents:generate` (`scripts/agent-infra/main.ts`) builds each `.codex/agents/<role>.toml` from its role body under `handbook/agents/roles/`, the role's row in `scripts/agent-infra/roles.ts` and its model in `.agents/model-policy.json`. In place of each `{{harness:<name>}}` marker in a body it puts the one line this file gives under the comment line `<!-- slot: <name> -->`, and it appends to every role what follows the comment line `<!-- appendix -->`. A slot here stands where the role's Claude Code words, kept in `handbook/agents/adapters/claude-code.md`, name a step only Claude Code can take: a tool Codex lacks, a worktree the harness made, the effort Claude Code reports, a tool list it enforces. Everything else in a role body reads the same under both harnesses.

<!-- slot: designer-effort -->

Before anything else, before any reading, run `pwd`, and put two lines at the head of your report: the line it prints, and `effort: set by your role file, and not read back under Codex`.

<!-- slot: designer-tree -->

What a round or a breakdown delivers is files under `out/`, and they land in the main checkout's `out/`, where Alex looks (`handbook/specs/development-workflow.md` step 6).

<!-- slot: designer-fenced -->

A planner or an implementer, standing in its own worktree, does not dispatch you this way, and hands you to the orchestrating session, as step 6 says.

<!-- slot: designer-menu -->

Do not put a question to Alex yourself, even where Codex offers you a tool that asks one.

<!-- slot: prover-isolation -->

Build your tree only through `scripts/agent-sandbox.ts`, below, and never another way: one made from `origin/main` would leave you to mutate and test the wrong code.

<!-- slot: prover-edit-fence -->

Change a sandbox file only through the commands under "Changing a sandbox file" below, never with your patch tool: Codex leaves that tool to every role, so keeping your hands off it is yours alone, and the dispatch tree is the one tree you must never edit.

<!-- slot: prover-no-edit -->

You use no edit tool, though Codex leaves you one, like every other review agent in this project (a verify agent once left `// MUTATION:` edits in Vellum source):

<!-- slot: implementer-tree -->

You are in the worktree under `.claude/worktrees/` that your dispatcher made, detached at `origin/main`, and named in your prompt; if your prompt names none, stop and report that.

<!-- slot: implementer-branch -->

Give your detached tree its branch BEFORE the first commit, `git switch -c <fix|chore|feat>/N-<slug>`, which is the rename the next line speaks of.

<!-- slot: implementer-fence -->

Run each git command alone and take a printed path literally rather than through a variable, as the house's recipes are written, and make file edits with your patch tool, which the footgun hook checks as it checks a shell call. Codex does not report back the effort you run at; your role file sets it.

<!-- slot: implementer-gone -->

If your worktree is gone, do not rebuild it yourself: the main checkout is off limits to you.

<!-- slot: planner-tree -->

You are in the worktree under `.claude/worktrees/` that your dispatcher made and named in your prompt, and you never run anything in, edit, or restore the main checkout; if your prompt names no tree, stop and report that.

<!-- slot: planner-menu -->

Do NOT put a question to Alex yourself, even where Codex offers you a tool that asks one: `handbook/specs/development-workflow.md` step 6 names the dispatcher as the one who puts your menu to him.

<!-- slot: skeptic-no-edit -->

A verify agent with Edit access once left `// MUTATION:` comments in Vellum source; that is why the standing rule in this project is that review agents never mutate, and under Codex, which leaves every role its patch tool, keeping that rule is yours alone.

<!-- slot: recon-claims-write -->

with your patch tool

<!-- slot: recon-claims-rewrite -->

Where an earlier run left that file, replace it whole.

<!-- slot: recon-tools -->

You use your shell for `gh api`, `ls`, `git log`, `npm` introspection and `npm run recon-triage`, and your patch tool for the claims file alone, a limit Codex leaves to you to keep.

<!-- appendix -->

## Running under Codex

This definition is generated from the same role text as Claude Code's (`npm run agents:generate`), with the harness's steps written for Codex. Where the text above still names something Claude Code gives a session, read it this way:

- **The scratchpad** is the folder `out/scratch/` in the main checkout, the checkout whose `.git` is a folder. Every lane shares it, as Claude Code's sessions share their scratchpad: make it if it is missing, and keep the issue-number prefix this text gives a scratch file.
- **Your working folder** does not carry from one shell call to the next under Codex, so give every command the folder it runs in.
- **Bash** is your shell tool, and a file edit is a patch: the footgun hook checks both once Alex has trusted it.
- **Dispatching a role** is spawning it by its name. Pass it no model and no effort, since its own definition sets both, and Codex reports neither the effort a role ran at nor whether a value you passed would win. A cold dispatch, the review agents' "dispatched COLD", spawns the role with none of your conversation history; if you cannot spawn it that way, the review is not cold, so say so and stop.
- **What a role may read, write or run** is held by this text alone: Codex gives a spawned role the same tools and the same sandbox as the session that spawned it, so nothing enforces a role's limits but the role.
- **A decision for Alex** goes into your report to whoever dispatched you, never to him directly. Whoever puts a menu to him under Codex writes numbered options in plain words, with no jargon or acronyms, the recommended option first and marked, each with what it changes, then ends the turn and waits for his answer. It takes either an explicit option or a clear ruling in his own words, records his wording, asks again when the answer is ambiguous or leaves a decision open, never treats silence as approval, and never chooses an option for him.
