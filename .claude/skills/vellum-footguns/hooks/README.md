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
  - `perl -i` / `-pi` / `-0pi` when the command carries a non-ASCII character or a `\x{...}` escape,
    or when it carries an `s` whose delimiter is one of `| + * ? .` and whose PATTERN half escapes
    that delimiter. Perl strips the backslash before ANY delimiter, so the literal the author wrote
    is lost and the bare metacharacter goes live. Measured 2026-09-14 on `hello world`:
    `s|world\||PLANET|` prints `PLANEThello world`, because the pipe unescapes to an alternation with
    an empty branch that matches at offset zero, while `s+world\++`, `s*world\**` and `s?world\??`
    each REPLACE a target their literal pattern does not contain. All exit 0, and with `-i` they land
    in the file. `#` and `!` were measured to leave the input unchanged, which is why the class is the
    metacharacters and not every delimiter. An escaped delimiter in the REPLACEMENT half is correct
    perl and is not refused;
  - `gh api` on a bare issue or pull-request endpoint (`repos/O/R/issues/N` or `repos/O/R/pulls/N`,
    with nothing after the number but an optional trailing slash) carrying any data field (`-f`,
    `-F`, `--raw-field`, `--field`, `--input`, including inside a combined short-flag cluster such as
    `-if`) and no explicit method other than POST, the method read from the LAST `-X` / `--method` on
    the line because that is the one gh uses. ANY explicit non-POST verb exempts the call, not `PATCH`
    alone. Any data field
    switches the call to POST, and a POST to that endpoint UPDATES the item rather than commenting on
    it: the fields sent overwrite what is there, nothing is created, and it exits 0 (#193, PR #550).
    `/comments` and every other sub-path are untouched, so the remedy the Never list names still
    runs, and `-X PATCH` in any of its spellings is the way through when editing IS the intent. Read
    from the SEGMENT only, never the raw command, so that reading an issue and then commenting on it
    in one call is not refused. Pull requests are covered on Alex's ruling of 2026-09-14, which
    widened #607's filed scope;
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
    not read as a body file, though `-F file.md` on `gh pr create` / `gh pr edit` is the short
    `--body-file` and is read as one;
  - `gh pr create` / `gh pr edit` whose body skips one of the `## ` sections of
    `.github/PULL_REQUEST_TEMPLATE.md`. The sections are READ from that file on every call, never
    copied here, so renaming one there reds the selftest rather than shipping a hook that checks
    yesterday's shape. Presence of the heading is the check, never its content. It fires only on a
    body the hook can actually read: an inline `-b` / `--body`, or a body file it read. It does not
    fire when no body is supplied at all, nor when the body text cannot be resolved, and a template
    that is missing or carries no `## ` heading WARNS and lets the call run rather than blocking it
    (#577). The warning travels in the warning channel, because a decision returned in the refusal
    slot would take the Gate 5 injection with it. Adding a section to the template is RETROACTIVE:
    the next `gh pr edit --body-file` against a PR opened under the old shape is refused for skipping
    it, and folding a review ledger into a body that way is what workflow step 15 asks for.
    A body file is a body only when a body FLAG named it: `$(cat f)` is read from any flag for the
    em-dash scan, and counting it here would refuse `gh pr edit N --add-label "$(cat notes.md)"` as a
    PR body skipping sections it was never meant to carry.
- **Warns** (context only, the call runs): `.click()` in a browser-script fragment; a punctuation
  escape inside a template literal; `pkill` aimed at the browser; an unreadable body file; a
  `typescript` package that could not be loaded, which skips the escape scan.

## Blind spots, with their direction

- A regex inside a single- or double-quoted JS string loses its backslash the same way and is not
  scanned: an apostrophe in prose would open a false span, so the scanner errs toward silence there.
- A script written by anything other than a shell redirect or heredoc (a `python3 -c` write, a
  `node -e` write) is not scanned. Silence, not refusal.
- A body passed through a shell variable or a pipe is not read. For the em-dash and closing-keyword
  checks that is silence; for the section check it would be a false REFUSAL, since the body flag is
  present and no heading is readable, so a command carrying an expansion the hook cannot resolve
  skips the section check instead. Silence again, at the cost of a `--body "$BODY"` going unchecked.
  Single-quoted spans are stripped before that test, so a literal `$5` in a body does not disarm it,
  but an unquoted `$HOME` anywhere in the same command still does. Silence, not refusal.
- `--fill` / `-f`, `--fill-first`, `--fill-verbose`, `--editor` / `-e`, `--template` / `-T` and
  `--web` build the body inside `gh` or in an editor, so no section check runs on them. Silence,
  not refusal.
- The perl pipe payload is read from the RAW command while the `-i` shape is read from the segment,
  so a compound `perl -pi -e 's/a/b/' f.ts; grep -n 's|x\|y|z|' notes.md` is a false REFUSAL. The
  non-ASCII condition beside it has exactly this shape already, so it is no new class, and the remedy
  is one call each. Refusal, not silence.
- The same substitution with no `-i`, and `m` or `tr` rather than `s`, are not checked. So are the
  paired delimiters (`s{a\}b}{c}` and its kin), which unescape the same way but bracket rather than
  repeat, and `^` and `$`, left out because both are common enough in shell text to false-refuse.
  Silence, not refusal.
- The `gh api` path is read after quoted spans are blanked, so a quoted path (`gh api
  "repos/O/R/issues/193" -f body=x`), one built from shell variables (`repos/$O/$R/issues/$N`) or one
  built by a subshell is not seen at all, and the destructive call goes through. **This is a MISS, not
  benign silence**: on a refusal the silent direction is the footgun reaching the tool, and the only
  thing bounding it is that the literal unquoted form is what this house types, which is a habit
  rather than a guarantee. It is not closed because the fix, scanning the raw command, false-refuses
  the ordinary read-then-comment pair the fixture table pins. Fixture rows record both halves.
- A non-body data field on a bare issue path (`-f state=closed`, `-f title=...`) is refused too. That
  is the rule rather than an overreach, since the refusal is about the implicit POST and not about
  the body in particular, and `-X PATCH` or the purpose-built `gh issue` subcommand is the way
  through. Refusal, stated.
- A gate spent on a call the user then rejects is not shown again that session.
- The once-per-session state is keyed on the hook payload's `session_id`. Measured 2026-09-11 in a
  live dispatch: a subagent's Bash DOES
  reach this hook (a dispatched agent's `perl -i` came back refused with `PERL_REASON` verbatim), and
  it SHARES the parent's `session_id`, so that agent's `git push --dry-run` spent the parent session's
  Gate 5 and the parent never saw it. The once-per-session limit lives in `gateNote` alone, so a
  subagent cannot re-show a gate the parent spent; `deny` carries no such state and fires on every
  matching call, so refusals reach a subagent unaffected.

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
`SKILL.md` fails here rather than shipping an empty injection, and the PR template is asserted to
carry sections and no em-dash, so a template that would prefill an unusable body fails here too.
The five section names are written out in the fixture table and derived in the hook; that asymmetry
is deliberate, since fixtures built by reading the template would follow a rename and red nothing. Gate 6's rows are generated one per
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
- gate text, at most once per session each, and the aggregate if every one fires in a single session.
  Neither figure is written here: they move whenever a gate gains a line, nothing sweeps markdown,
  and the copy that used to sit here went stale twice. This prints each gate's characters and their
  total, which is the aggregate term; divide by about four for tokens:
  `node --input-type=module -e 'const {gateText}=await import("./.claude/skills/vellum-footguns/hooks/footgun-gate.ts");let t=0;for(const g of ["Gate 1","Gate 2","Gate 3","Gate 4","Gate 5","Gate 6"]){const n=gateText(g).length;t+=n;console.log(g,n);}console.log("TOTAL",t)'`;
- every turn of every session in this repo: the skill's `description` line in the system prompt.
  That is the only permanent term, and the reason the description is kept short.
