# The Codex adapter

This file holds the steps a role body leaves to the harness, written for Codex on Alex's Mac. `npm run agents:generate` (`scripts/agent-infra/main.ts`) builds each `.codex/agents/<role>.toml` from its role body under `handbook/agents/roles/`, the role's row in `scripts/agent-infra/roles.ts` and its model in `.agents/model-policy.json`. In place of each `{{harness:<name>}}` marker in a body it puts the one line this file gives under the comment line `<!-- slot: <name> -->`, and it appends to every role what follows the comment line `<!-- appendix -->`. A slot here stands where the role's Claude Code words, kept in `handbook/agents/adapters/claude-code.md`, name a step only Claude Code can take: a tool Codex lacks, a worktree the harness made, the effort Claude Code reports, a tool list it enforces. Everything else in a role body reads the same under both harnesses.

<!-- appendix -->

## Running under Codex

This definition is generated from the same role text as Claude Code's (`npm run agents:generate`), with the harness's steps written for Codex. Where the text above still names something Claude Code gives a session, read it this way:

- **The scratchpad** is the folder `out/scratch/` in the main checkout, the checkout whose `.git` is a folder. Every lane shares it, as Claude Code's sessions share their scratchpad: make it if it is missing, and keep the issue-number prefix this text gives a scratch file.
- **Your working folder** does not carry from one shell call to the next under Codex, so give every command the folder it runs in.
- **Bash** is your shell tool, and a file edit is a patch: the footgun hook checks both once Alex has trusted it.
- **Dispatching a role** is spawning it by its name. Pass it no model and no effort, since its own definition sets both, and Codex reports neither the effort a role ran at nor whether a value you passed would win. A cold dispatch, the review agents' "dispatched COLD", spawns the role with none of your conversation history; if you cannot spawn it that way, the review is not cold, so say so and stop.
- **What a role may read, write or run** is held by this text alone: Codex gives a spawned role the same tools and the same sandbox as the session that spawned it, so nothing enforces a role's limits but the role.
- **A decision for Alex** goes into your report to whoever dispatched you, never to him directly. Whoever puts a menu to him under Codex writes numbered options in plain words, with no jargon or acronyms, the recommended option first and marked, each with what it changes, then ends the turn and waits for his answer. It takes either an explicit option or a clear ruling in his own words, records his wording, asks again when the answer is ambiguous or leaves a decision open, never treats silence as approval, and never chooses an option for him.
