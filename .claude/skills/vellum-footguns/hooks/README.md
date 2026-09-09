# footgun-gate.py

A PreToolUse hook that puts the skill's gates in front of the model at the moment it edits a test,
an e2e suite, or a stylesheet, and refuses the four mechanical never-list items outright. It is NOT
wired by default; the skill works without it. Wiring it is a one-block change to a settings file.

## What it does

- **Injects a gate once per session** when the file about to be edited matches: `test/**/*.test.ts`
  (Gate 1), `scripts/e2e/**` and `scripts/e2e-*.mjs` (Gate 2), `*.css` and `*.astro` (Gate 3); and
  when a Bash call is a `git push` or a `gh pr create` / `gh pr edit` (Gate 5). The text is read from
  `SKILL.md`, so the skill stays the single source.
- **Refuses** (the tool call does not run, the reason is shown):
  - a bare `git stash` (anything but `push -m`, `list`, `show`, `drop`, `pop`, `apply`, `clear`, `branch`);
  - `perl -i` / `-pi` / `-0pi` when the command carries a non-ASCII character or a `\x{...}` escape;
  - a Write or Edit into `scripts/e2e/` whose backtick string contains a single-escaped `\s \S \d \D
    \w \W \b \B` or `\.`;
  - `gh pr create` / `gh pr edit` whose body (inline or `--body-file`) carries an em-dash or a
    negated closing keyword ("does not close #N").
- **Warns** (context only, the call runs): `.click()` in an e2e fragment; a punctuation escape inside
  a backtick string in e2e; `pkill` aimed at the browser.

## Wire it

Project-wide and committed, in `.claude/settings.json`; or personal, in `.claude/settings.local.json`
or `~/.claude/settings.json`. Hook entries merge across levels.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"${CLAUDE_PROJECT_DIR}/.claude/skills/vellum-footguns/hooks/footgun-gate.py\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`${CLAUDE_PROJECT_DIR}` is the directory the session launched from, so a session standing in a
worktree under `.claude/worktrees/<name>` resolves to that worktree's copy of the script.

## Prove it

```
/usr/bin/python3 .claude/skills/vellum-footguns/hooks/footgun-gate.py --selftest
```

Every fixture prints `ok` or `FAIL` and the exit code is the count of misses. The once-per-session
state lives at `$TMPDIR/vellum-footguns-<session_id>.json`; delete it to see a gate again.

## Cost

One Python start per Edit, Write or Bash call (tens of milliseconds). Gate text is at most a few
hundred tokens, three times per session at most.
