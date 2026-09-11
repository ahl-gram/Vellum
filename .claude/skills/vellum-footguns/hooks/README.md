# footgun-gate.ts

A PreToolUse hook that puts the skill's gates in front of the model at the moment it edits a test,
a browser-driving script, a stylesheet, or anything that can move a chart or the golden, creates a
file that joins a roster, or pushes; and refuses the mechanical never-list outright. It is wired in the repo's `.claude/settings.json`, so it runs in
every session launched from the Vellum root or a worktree. The skill works without it if that block
is ever removed.

## What it does

- **Injects a gate once per session**, reading the text from `SKILL.md` so the skill stays the single
  source: Gate 1 on `test/**/*.test.ts`; Gate 2 on `scripts/**/*.mjs` and `out/**/*.mjs`; Gate 3 on
  `*.css` and `*.astro`; Gate 4 on a Write that creates a new file under `src/pages/`, `src/site/`,
  `scripts/e2e/suite-*` or `public/*.css`; Gate 5 on `git push` and `gh pr create` / `gh pr edit`;
  Gate 6 on the renderer, `generateWorld`'s transitive closure, the committed artifacts and the
  modules their writers reach. Gate 6's roster was derived by walking those import graphs, so widen
  it the same way rather than by adding paths that look related.
- **Refuses** (the tool call does not run, the reason is shown). A command is read in COMMAND position
  only: quoted strings and heredoc bodies are blanked before segmenting, segments split on shell
  separators and the `then`/`do`/`else` keywords, prefixes like `env X=1`, `command`, `time`, `sudo`
  are stripped, and `git`'s global options (`-C dir`, `-c k=v`, `--git-dir=`) are skipped before the
  subcommand is read. So a grep or a comment that mentions a rule passes, and `git -C <other
  worktree> stash pop` does not.
  - any bare mutation of the shared stash stack: `git stash`, `push` without `-m`, `pop`, `apply` or
    `drop` without an explicit `stash@{n}` or sha, `clear`;
  - `perl -i` / `-pi` / `-0pi` when the command carries a non-ASCII character or a `\x{...}` escape;
  - a Write, Edit or MultiEdit into `scripts/**/*.mjs` or `out/**/*.mjs`, or a shell redirect or
    heredoc into one, whose template literal contains a single-escaped `\s \S \d \D \w \W \b \B` or
    `\.`. Template literals are found with the TypeScript parser (`ts.createSourceFile`), never a
    hand-rolled lexer, so a stray backtick in a regex or a string does not swallow the code after it,
    and a `String.raw` tag is skipped because it is the remedy;
  - `gh pr create` / `gh pr edit` / `gh pr comment` / `gh issue create` / `gh issue edit` /
    `gh issue comment` whose body carries an em-dash, and a PR body (create or edit) carrying a
    negated closing keyword such as "does not close #N" or "does not fix owner/repo#N". The body is
    read inline, from `--body-file` (resolved against the call's cwd), and from `$(cat file)`; a body
    file it cannot read is named in a warning instead of skipped. A `-F name=value` typed field is
    not read as a body file.
- **Warns** (context only, the call runs): `.click()` in a browser-script fragment; a punctuation
  escape inside a template literal; `pkill` aimed at the browser; an unreadable body file; a
  `typescript` package that could not be loaded, which skips the escape scan.

## Blind spots, with their direction

- A regex inside a single- or double-quoted JS string loses its backslash the same way and is not
  scanned: an apostrophe in prose would open a false span, so the scanner errs toward silence there.
- A script written by anything other than a shell redirect or heredoc (a `python3 -c` write, a
  `node -e` write) is not scanned. Silence, not refusal.
- A body passed through a shell variable or a pipe is not read.
- A gate spent on a call the user then rejects is not shown again that session.
- The once-per-session state is keyed on the hook payload's `session_id`. Whether a subagent shares
  its parent's id (and so never sees a gate the parent already spent) or has its own (and pays the
  full gate cost again) has not been measured in a live multi-agent session.

## How it is wired

The block lives in `.claude/settings.json` (shared, committed); read it there rather than from a copy
here. It runs `node` on this script (Node's native TypeScript, the same way `scripts/*.ts` run) only
if it exists at `${CLAUDE_PROJECT_DIR}/.claude/skills/vellum-footguns/hooks/`, and exits 0
otherwise, so a checkout without the script (a worktree cut before this merged) is not blocked. The
entry check compares real paths, so a symlinked project directory still runs it. Do NOT copy the
block to `~/.claude/settings.json`: `${CLAUDE_PROJECT_DIR}` would resolve to whatever project is
open. Hook entries merge across levels, so user-level hooks keep running beside it.

## Prove it

```
node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts
```

One line per fixture, `ok` or `FAIL` with the decision and the text it expected; the exit code is
the number of misses. Every gate's text is asserted non-empty first, so a renamed heading in
`SKILL.md` fails here rather than shipping an empty injection. Gate 6's rows are generated one per
ARM of its roster regex, because a roster is only as strong as its least-swept alternative: the
prover found 10 of 19 arms carried no fixture, so a typo in any of them would have shipped silent.
Two of its rows exist for shapes no relative path can reach, an absolute `file_path` (which is what
a real tool call passes) and a path matching two gates at once, both of which escaped the first
table. The last three rows run the exact
command string from `.claude/settings.json` through `sh` with a real, a symlinked, and a missing
`CLAUDE_PROJECT_DIR`, so the deployed path is exercised and not only the function.
`test/repo/footgun-gate.test.ts` runs the whole table under `npm test`, so CI runs it on every PR.
This is the implementer's own table, not an independent prover run. The once-per-session state
lives at `$TMPDIR/vellum-footguns-<session_id>.json`; delete it to see a gate again. `npm run check`
types both files through the tsconfig include.

## Cost

Measured 2026-09-09 on this Mac, ten runs each, through the deployed `sh -c` command:

- a Bash or Edit call that triggers nothing, or a refusal: about 64ms;
- a Write or Edit into a browser-driving script, which loads the TypeScript parser: about 182ms;
- gate text, at most once per session each, re-measured 2026-09-11: Gate 1 3902 chars, Gate 2 3288,
  Gate 3 1631, Gate 4 746, Gate 5 3198, Gate 6 2122, roughly 3700 tokens if every one fires in a
  single session (three of the six were already stale when this line was re-measured, the gates
  having grown since 2026-09-10 with nothing sweeping markdown to notice);
- every turn of every session in this repo: the skill's `description` line in the system prompt.
  That is the only permanent term, and the reason the description is kept short.
