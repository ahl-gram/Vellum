# footgun-gate.ts

A PreToolUse hook that puts the skill's gates in front of the model at the moment it edits a test,
a browser-driving script, or a stylesheet, creates a file that joins a roster, or pushes; and refuses
the mechanical never-list outright. It is wired in the repo's `.claude/settings.json`, so it runs in
every session launched from the Vellum root or a worktree. The skill works without it if that block
is ever removed.

## What it does

- **Injects a gate once per session**, reading the text from `SKILL.md` so the skill stays the single
  source: Gate 1 on `test/**/*.test.ts`; Gate 2 on `scripts/**/*.mjs` and `out/**/*.mjs`; Gate 3 on
  `*.css` and `*.astro`; Gate 4 on a Write that creates a new file under `src/pages/`, `src/site/`,
  `scripts/e2e/suite-*` or `public/*.css`; Gate 5 on `git push` and `gh pr create` / `gh pr edit`.
- **Refuses** (the tool call does not run, the reason is shown). Refusals read the command in COMMAND
  position only, so a grep or a PR comment that mentions the rule passes:
  - any bare mutation of the shared stash stack: `git stash`, `push` without `-m`, `pop`, `apply` or
    `drop` without an explicit `stash@{n}` or sha, `clear`;
  - `perl -i` / `-pi` / `-0pi` whose segment carries a non-ASCII character or a `\x{...}` escape;
  - a Write, Edit or MultiEdit into `scripts/**/*.mjs` or `out/**/*.mjs`, or a shell redirect or
    heredoc into one, whose backtick string contains a single-escaped `\s \S \d \D \w \W \b \B` or `\.`;
  - `gh pr create` / `gh pr edit` / `gh pr comment` / `gh issue create` / `gh issue edit` /
    `gh issue comment` whose body carries an em-dash, and a PR body (create or edit) carrying a
    negated closing keyword such as "does not close #N". The body is read inline, from `--body-file`
    (resolved against the call's cwd), and from `$(cat file)`; a body file it cannot read is named
    in a warning instead of skipped.
- **Warns** (context only, the call runs): `.click()` in a browser-script fragment; a punctuation
  escape inside a backtick string; `pkill` aimed at the browser; an unreadable body file.

## Blind spots, with their direction

- A regex inside a single- or double-quoted JS string loses its backslash the same way and is not
  scanned: an apostrophe in prose would open a false span, so the scanner errs toward silence there.
- A body passed through a shell variable or a pipe is not read.
- A gate spent on a call the user then rejects is not shown again that session.

## How it is wired

The block lives in `.claude/settings.json` (shared, committed); read it there rather than from a copy
here. It runs `node` on this script (Node's native TypeScript, the same way `scripts/*.ts` run) only if it exists at
`${CLAUDE_PROJECT_DIR}/.claude/skills/vellum-footguns/hooks/`, and exits 0 otherwise, so a checkout
without the script (a worktree cut before this merged) is not blocked. Do NOT copy the block to
`~/.claude/settings.json`: `${CLAUDE_PROJECT_DIR}` would resolve to whatever project is open. Hook
entries merge across levels, so user-level hooks keep running beside it.

## Prove it

```
node .claude/skills/vellum-footguns/hooks/footgun-gate.ts --selftest
```

Every fixture prints `ok` or `FAIL` with the decision and the text it expected, and the exit code is
the number of misses. The five gate texts are asserted non-empty first, so a renamed heading in
`SKILL.md` fails here rather than shipping an empty injection. This is the implementer's own table,
not an independent prover run. The once-per-session state lives at
`$TMPDIR/vellum-footguns-<session_id>.json`; delete it to see a gate again. `npm run check` types the file
through the tsconfig include.

## Cost

- Per Edit, Write or Bash call: one Node start, measured 2026-09-09 at about 27ms (`node -e 0`, five runs).
- Per session: each gate text at most once, a few hundred tokens each.
- Every turn of every session in this repo: the skill's `description` line in the system prompt.
  That is the only permanent term, and the reason the description is kept short.
