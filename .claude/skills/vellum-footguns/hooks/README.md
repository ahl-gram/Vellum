# footgun-gate.ts

A PreToolUse hook that puts the skill's gates in front of the model at the moment it edits a test
or a shared test helper, a browser-driving script, a stylesheet, or anything that can move a chart or the golden, creates a
file that joins a roster, or pushes; and refuses the mechanical never-list outright. It is wired in the repo's `.claude/settings.json`, so it runs in
every session launched from the Vellum root or a worktree, and for Codex in `.codex/hooks.json`, where it
judges shell calls and file patches (Under Codex, below). The skill works without it if that block is ever removed.

## What it does

- **Injects a gate once per session**, reading the text from `.claude/skills/vellum-footguns/SKILL.md` so the skill stays the single
  source: Gate 1 on `test/**/*.test.ts`; Gate 2 on `.mjs` under `scripts/`, `out/` and `e2e/`, and on `.ts` under `e2e/` and `out/` (the whole e2e tree: the harness, the runners, the suites, their helpers and the two proof tools; never all of `scripts/**/*.ts`, since the first matching route wins and Gate 6 owns the render scripts); Gate 3 on
  `*.css` and `*.astro`; Gate 4 on a Write that creates a new file, or a Codex patch that adds or moves one, under `src/pages/`, `src/site/`,
  `e2e/suites/*.ts` (a suite, never a file in a suite's folder) or a sheet anywhere under `src/styles/` (a page can gain a sheet without a new page file), never a `*.test.ts` or a file in a `test-support/` folder, since a test or its helper joins no roster and its path can echo one (`test/e2e/suites/`); Gate 5 on `git push` and `gh pr create` / `gh pr edit`;
  Gate 6 on the renderer, `generateWorld`'s transitive closure, the committed artifacts and the
  modules their writers reach. Gate 6's roster was derived by walking those import graphs, so widen
  it the same way rather than by adding paths that look related.
  The routes are `scripts/agent-infra/hooks/gate-routes.ts`. Each names its gates in order, an edit is read against the first
  route its path matches, and the first of that route's gates this session has not been shown is
  the one pasted. Two routes name two gates, Gate 1 and then Gate 7, one per edit, because the two
  in one note pass the bound the size probes hold (`HOOK_CONTEXT_LIMIT` in
  `test-support/footgun-gate/size-probes.ts`; Issue #782): tests under
  `test/repo/` and `test/site/`, the first route, and `test-support/*.ts`, the last, so a helper
  folder inside a directory an earlier route owns keeps that route's gate.
- **Refuses** (the tool call does not run, the reason is shown). A command is read in COMMAND position
  only: quoted strings and heredoc bodies are blanked before segmenting, segments split on shell
  separators and the `then`/`do`/`else` keywords, a backslash-newline line continuation is joined back
  into one line first so a command split across lines is still read as one, prefixes like `env X=1`,
  `command`, `time`, `sudo` are stripped, and `git`'s global options (`-C dir`, `-c k=v`,
  `--git-dir=`) are skipped before the subcommand is read. So a grep or a comment that mentions a
  rule passes, and `git -C <other worktree> stash pop` does not.
  - any bare mutation of the shared stash stack: `git stash`, `push` without `-m`, `pop`, `apply` or
    `drop` without an explicit `stash@{n}` or sha, `clear`;
  - `perl -i` / `-pi` / `-0pi` when the command carries a non-ASCII character or a `\x{...}` escape,
    or when it carries an `s` whose delimiter is one of `| + * ? . $` and whose PATTERN half escapes
    that same delimiter, tied together by a backreference so that escaping a DIFFERENT metacharacter
    (`s|a\+b|c|`, which real perl leaves alone) is not refused. Perl strips the backslash before ANY
    delimiter, so the literal the author wrote is lost and the bare metacharacter goes live.
    Measured 2026-09-14 on `hello world`:
    `s|world\||PLANET|` prints `PLANEThello world`, because the pipe unescapes to an alternation with
    an empty branch that matches at offset zero, while `s+world\++`, `s*world\**`, `s?world\??` and
    `s$world\$$` each REPLACE a target their literal pattern does not contain. `s.world\..` does the
    same whenever a character follows the match (`hello worldX` gives `hello PLANET`) and is inert
    only at a line end, where the dot has nothing to consume. All exit 0, and with `-i` they land in
    the file. `#` and `!` were measured to leave the input unchanged at every position, which is why
    the class is the metacharacters and not every delimiter. An escaped delimiter in the REPLACEMENT
    half is correct perl and is not refused;
  - `gh api` on a bare issue or pull-request endpoint (`repos/O/R/issues/N` or `repos/O/R/pulls/N`,
    with nothing after the number but an optional trailing slash) carrying any data field (`-f`,
    `-F`, `--raw-field`, `--field`, `--input`, including inside a combined short-flag cluster such as
    `-if`) and no explicit method other than POST, the method read from the LAST `-X` / `--method` on
    the line because that is the one gh uses. ANY explicit non-POST verb exempts the call, not
    `PATCH` alone. Any data field switches the call to POST, and a POST to that endpoint UPDATES the
    item rather than commenting on it: the fields sent overwrite what is there, nothing is created,
    and it exits 0 (Issue #193, PR #550).
    `/comments` and every other sub-path are untouched by this refusal, so the remedy the Never list names still
    runs (a READ of `/comments` meets the next one), and `-X PATCH` in any of its spellings is the way through when editing IS the intent. Read
    from the SEGMENT only, never the raw command, so that reading an issue and then commenting on it
    in one call is not refused. Pull requests are covered on Alex's ruling of 2026-09-14, which
    widened #607's filed scope;
  - a raw read of an issue's or pull request's comments, reviews or opening text (Issue #1417): `gh api` on a comment, review or timeline path of an issue or pull request (`repos/O/R/issues/N/comments`, `issues/N/timeline`, `issues/comments` with or without an id, `pulls/N/comments`, `pulls/comments`, `pulls/N/reviews`, and every path under them, in the `https://host/` and `{owner}/{repo}` spellings too) whose method is GET, read as the bare-item refusal reads it: no method and no data field, or a last `-X` / `--method` of GET; `gh issue view`, `gh pr view`, `gh issue list` or `gh pr list` with `--comments` or `-c`, or a `--json` naming `comments`, `reviews` or `latestReviews`; and `gh issue view` or `gh pr view` with no `--json`, which print the opening text. A post, a `-X PATCH`, a `-X DELETE` and a single field (`gh api repos/O/R/issues/N --jq .labels`, `gh pr view N --json closingIssuesReferences`) run. The reason names `npm run --silent issue -- <N>`, which withholds what accounts outside the house wrote;
  - a Write, Edit or MultiEdit, or a Codex patch that adds, updates or moves a file, into `.mjs` or `.ts` under `scripts/`, `out/` or `e2e/` (which also
    reaches the unit tests under `test/e2e/`), or a shell redirect or heredoc into one, whose template literal contains a single-escaped `\s \S \d \D \w \W \b \B` or
    `\.`. Template literals are found with the TypeScript parser (`ts.createSourceFile`, parsing
    every fragment as TypeScript, since a JavaScript parse reads a generic arrow's `<T>(` as JSX and
    swallows every template after it), never a hand-rolled lexer, so a stray backtick in a regex or a string does not swallow the code after it,
    and a `String.raw` tag is skipped because it is the remedy. Each of a MultiEdit's edits, and each
    of a patch's hunks, is a fragment of its own, so a template one leaves open cannot hide the next
    one's escape (Issue #1397);
  - `gh pr create` / `gh pr edit` / `gh pr comment` / `gh issue create` / `gh issue edit` /
    `gh issue comment` whose text carries an em-dash in its prose (Issue #644). Each quoted argument
    of the command (a title, an inline body), the rest of the command, and each body file are read
    apart, and `scripts/agent-infra/hooks/markdown-code.ts` takes out of each a fenced code block (backticks or tildes, indented
    at most three spaces, closed by the same character at least as long, a backtick fence's info
    string holding no backtick, and a fence inside a list item ending where its item does) and an
    inline span (a run of backticks closed by an equal run on its own line, or in its own cell of a
    table, which is a line starting with a pipe or a block under a delimiter row, split on unescaped
    pipes; a run after an odd number of backslashes opens nothing). HTML tags and autolinks bind
    before spans, as CommonMark orders them, and an HTML block (a line opening with a tag, to the next
    blank line) is read as prose whole. An unclosed fence or span is prose, so it opens no loophole;
    the rows are `test-support/footgun-gate/markdown-code.fixtures.ts`. And a PR body (create or edit) carrying a
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
  - in a headless Codex build only, which the Codex adapter knows by `VELLUM_HEADLESS_BUILD` in the
    environment Codex hands the hook, and which `npm run handoff` sets on every build and resume it
    starts, with no GitHub login in that environment (Alex, 2026-11-20, Issue #1409, where Codex was
    measured passing both to its hooks and its shell): any push, every `gh` call, the proof run, and
    the wrapped and disguised forms of them it can read, failing closed on these classes. Each
    segment (split again at a lone `&`) is read word by word, a word taken by its last path part, in lower
    case because the Mac's filesystem ignores case, with quotes, backticks and brackets trimmed, and is refused when its command word, or the word after `command`, `exec`, `env`,
    `nohup`, `nice`, `timeout`, `stdbuf`, `sudo`, `xargs` or `parallel`, is not a plain name (a variable, a
    substitution, a quote or a backslash in it), where `if`, `while`, `until`, `case`, `then`, `do`, `!` and
    the like are skipped to find it; when any word starts with a letter and holds a quote or a
    backslash (`setsid g"it" push`); when any word is `eval`, `source` or `trap`, or its command word is `.`; when a package runner or a script runner is followed by a quoted name (`npm run "proof"`, `node "scripts/proof-runner/main.ts"`); when any word is a shell (`sh`, `bash`,
    `zsh`, `dash`, `ksh`, `fish`, `csh`, `tcsh`), `gh` or a `git-` helper; when `xargs` or
    `parallel` feeds `git`; when any word is `git` and its global options carry `-c`, `--config-env` or
    one the hook does not know, its subcommand word is missing or not plain, a later word is `push`,
    `send-pack`, `http-push`, `receive-pack` or starts `credential`, or it is a `config` whose first
    verb is not a read; when a `security` call names a keychain read (`find-internet-password`, `find-generic-password`, `dump-keychain`, `export`) anywhere after it; or when the proof run is
    reached through `npm`, `npx`, `pnpm`, `yarn` or a script runner. The whole command, not a segment, is
    refused when its text names a `GIT_`, `GH_` or `GITHUB_` variable anywhere (an assignment, `export`,
    `declare -x`, `read`, `printf -v`, a `$` expansion), which is how a command would undo the
    environment's credential reset; and a segment whose command word is a variable-setting builtin
    (`export`, `declare`, `typeset`, `readonly`, `local`, `read`, `unset`, `let`, `getopts`, `mapfile`,
    `readarray`, `set` with an `a` or `A` option or `-o`, `printf -v`) is refused unless every argument is
    an option cluster or a plain name with an optional plain value, so a name spelled `G"IT"_X` or
    `$'GIT\x5fX'` cannot get through. Reading every word, not only the first,
    is what finds `xargs git push`, `env -u X git push`, `timeout 60 git push`, `/usr/bin/git push` and
    a command in backticks. It is judged before every other refusal, so the build hears why it
    cannot rather than another way to post. A Claude Code session never reads the variable, and a
    Codex session started without it is never refused here;
  - a bare `cd`, `chdir`, `pushd` or `popd` in the MAIN session that moves it to another directory
    inside the project, worktrees and `out/` included, so that every later relative path, `git` call
    and dispatched agent would run from there (Issue #781). The session is the main one when the
    payload carries no `agent_id`, which Claude Code sets only for a call from inside a subagent (a
    main session started with `--agent` carries `agent_type` and is still the main one), and
    a subagent's directory never carries over between calls, so its `cd` is never refused; the review
    agents' sandbox recipes rely on that. `scripts/agent-infra/hooks/bare-cd.ts` reads the RAW command, because the segmenter
    splits on `(` and blanks quotes. One left-to-right pass, in the order the shell reads, builds a
    mask of the same length that blanks escapes (a backslash-newline becomes a space, so a
    continued line splits words as the shell does), comments (`#` at a word start, so a quote in a
    comment opens nothing), single, double, ANSI-C (`$'...'`) and backtick spans, arithmetic
    expansions (`$((...))`, so a shift is not a heredoc), and heredoc bodies, whether the operator
    is last on its line or not (`cat <<'EOF' > f`, which the hook's own heredoc pattern misses), its
    delimiter bare, quoted, backslash-quoted or holding `-`, and `<<-` stripping tabs from
    the terminator; its boundaries track
    subshell depth (`(`, `$(` and `<(` open one); and only a command at depth zero that no pipe or
    background `&` ends is read, since zsh, the shell here, runs a pipeline's earlier stages and a background job in
    a subshell and its LAST stage in the session. The target is read raw, unquoted, and resolved
    against the payload's `cwd`. It passes when its real path is the cwd's, so a link to where you
    stand passes; and when it lies outside `CLAUDE_PROJECT_DIR` (its real path when it resolves, its
    spelling when it does not, against the project directory both ways), since Claude Code resets
    such a `cd` after the call, which keeps the session-end
    `cd ~/CodeProjects/claude-config && git add -A` working (Alex, 2026-10-05). The project root itself is inside, so a `cd` back to it from
    a worktree is refused, and the reason sends a session that has already moved to Alex for
    `/cd <path>`. A target it cannot work out is refused (Alex, 2026-10-05): a shell variable, a
    command substitution, a glob or brace, `cd -`, `popd`, `pushd` with no directory, more than one
    argument, no `cwd` or one that does not resolve, and every move when `CLAUDE_PROJECT_DIR` is
    unset. The command word is read past assignments and the precommand words `builtin`, `command`,
    `time`, `noglob` and `nocorrect`, with any option after them. A directory the same call creates is
    refused, since it is inside and is not the cwd. Each `cd` is judged alone, so a round trip is
    refused at its first leg. The way through is a subshell with a literal path,
    `( cd <path> && ... )`, `git -C <path>`, or an absolute path. It runs after every refusal above,
    the escape scan of a script written from the shell included, so nothing it does can hide one,
    and the rows are `test-support/footgun-gate/bare-cd.fixtures.ts`;
- **Warns** (context only, the call runs): `.click()` in a browser-script fragment; a punctuation
  escape inside a template literal; `pkill` aimed at the browser; an unreadable body file; a
  `typescript` package that could not be loaded, which skips the escape scan.

## Blind spots, with their direction

- The code reader is hand-rolled and errs toward prose, so most of what it gets wrong is a refusal:
  a span that runs across a line break, a fence in a blockquote or indented past three spaces, an
  indented block with no fence, a fence GitHub would run to the end unclosed, an indented fence
  after an indented paragraph line that is not a list, a line that starts with a pipe outside a
  table, a paragraph line that opens with inline HTML (read as an HTML block), and a backtick typed
  as backslash-backtick inside a double-quoted `--body`, where the shell needs the escape and the
  reader sees an escaped opener, and an inline body holding the other kind of quote, which is split
  at it. Known misses, each checked against GitHub's renderer: an em-dash inside an HTML tag's
  attribute, which a tag takes out whole though a `title` shows as a tooltip; and the dash written
  as an entity (`&mdash;`, `&#8212;`), which GitHub renders and no check of this hook has ever read.
  The reader models no container but a list item's fence, so a blockquote, a deeper list or a
  footnote is read as top-level text: a fence there is usually refused, and anything that would
  close inside such a container and not outside it is a miss this list has not found.

- **The `cd` reader's misses are silence**, and the first is the ruling's own price: a `cd` into a
  directory added with `--add-dir`, `/add-dir` or `additionalDirectories`, outside the project,
  passes, though Claude Code carries such a move over, because the hook sees only
  `CLAUDE_PROJECT_DIR` and not the added set (Alex ruled the outside-project pass on 2026-10-05
  knowing this). The rest are shapes this house does not type by habit, which is the whole of the
  argument for leaving them: an alias or function that changes directory under another name, a
  sourced script (`source x.sh`, `. x.sh`), `eval cd x`, zsh's `repeat 1 cd x`, zsh's `AUTO_CD` (a
  bare directory name as a command), an arithmetic command `(( x << n ))` written without the `$`,
  whose shift reads as a heredoc that blanks the rest, and quote nesting inside a `$( )` inside
  double quotes odd enough to end the reader's quoted span early. The main-session test rests on Claude Code's documented `agent_id`, seen by no
  run here before this merged: if a main-session payload carried it, the refusal would go silent.
- **The `cd` reader's other errors are refusals**, each one edit away: a whole list or compound
  command piped or sent to the background (`cd x && y &`, `{ cd x; } | cat`), which runs in a
  subshell, is read at its own boundary; a redirect on a `cd` that stays (`cd . 2>/dev/null`) counts
  as a second argument; a double-quoted path holding a backslash is not unescaped and reads as one
  the reader cannot work out; `command -v cd x` prints a path and moves nothing; a function
  definition (`f() { cd x; }`) is read as the `cd` it would run; a keyword used as an argument
  (`echo do cd x`) is read as a boundary; an unquoted heredoc whose last body line ends in a
  backslash, which the shell joins to its terminator so that the rest of the command is body, is
  ended at the terminator by the reader; the same odd quote nesting as above can as easily start a
  later span early and expose text as a command; a `case` pattern's
  `)` inside a subshell closes it early; a `cd` in a call run
  with `run_in_background`, whose carry-over is unmeasured; `CDPATH`; a command that fails before its
  end, after which Claude Code's `pwd -P` capture does not run and nothing moves; a path spelled in
  another case on a case-insensitive volume; and `command cd x`, which in zsh runs the external `cd`
  and stays, though in bash it moves. If a subagent's payload lacked `agent_id`, every review agent's
  sandbox `cd` would be refused, loudly, on its first call. `env cd`, `sudo cd`, `nohup cd`, `nice cd`
  and `coproc cd` run the `cd` in another process and pass, which is correct.
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
- The same substitution with no `-i`, and `m` or `tr` rather than `s`, are not checked. Silence, not
  refusal.
- **Paired delimiters are a real member of the bug's family and are NOT covered**, because they need a
  different regex shape: perl's `s(pattern)(replacement)` escapes the CLOSING character rather than a
  repeated single one, so a capture-and-backreference cannot see it. Measured 2026-09-14:
  `echo 'hello (world)X' | perl -pe 's(world\))(PLANET)'` prints `hello (PLANETX`. Silence, not
  refusal, and named rather than left out quietly.
- `^` is excluded on measurement rather than on taste: as a delimiter it is a zero-width start
  assertion that cannot be satisfied once the pattern has consumed anything, so `s^world\^^PLANET^`
  silently does nothing instead of mis-editing. A different failure shape from the one this guard is
  about.
- `$` and `.` are in the class, and each costs a false refusal. `$` bites when `s` sits directly
  before a `$` in ordinary shell text (a variable or a filename) and a `\$` appears later in the same
  command; `.` bites on the commoner shape still, a standalone `s` before a dot plus any later `\.`,
  so `perl -pi -e 's/a/b/' src/s.ts && grep -n '\.mjs' out.txt` is refused. That direction was chosen
  deliberately for both: on a refusal a false positive is visible and one edit away, while a miss is a
  silent corruption of the file. `.` is the one to re-judge first if this proves annoying in practice.
- A method flag whose VALUE the quote blanking ate (`-X "PATCH"`) exempts the call rather than
  refusing it, which is what stops the hook refusing the quoted spelling of the very remedy its own
  message recommends. The cost is that a quoted `-X "POST"` is exempt too. Silence on a shape nobody
  types by accident, bought to keep the remedy usable.
- **Three misses are inherited from the segmenter itself**, so they apply to every refusal that reads
  a segment, not only the newest ones. Each is silence rather than a false refusal, and each is a
  shape a person would have to go out of their way to type, which is the whole of the argument for
  leaving them: the segmenter is deliberately crude, and tightening it risks the false refusals that
  crudeness buys away.
  - A shell keyword in `SEPARATORS` inside an owner or repo NAME splits the call in two, because the
    split is textual and a hyphen is a word boundary. `gh api repos/my-do-org/Vellum/issues/1 -f
    body=x` passes, and so do `-then-`, `-else-` and `-elif-` in either the owner or the repo.
  - A prefix `PREFIX` does not strip leaves the segment starting with the wrong word. `xargs gh api
    repos/o/r/issues/1 -f body=x` passes, where the same call under `env X=1` is refused.
  - A trailing shell COMMENT is read as part of the command, so it can supply a method the call does
    not have: `gh api repos/o/r/issues/1 -f body=x # -X PATCH` passes, where the same call without
    the comment is refused.
- **The headless-build refusal and the missing login guard against a build's mistakes and casual
  attempts, not against a build set on pushing** (Alex, 2026-11-20, Issue #1409, comment 7047982050,
  which supersedes ruling 4 of comment 7046605950). A build that sets out to push can: any command
  the hook does not refuse can bring the login back with `git -c credential.helper=osxkeychain
  push`, which overrides the wrapper's credential reset, and the simplest routes are a build editing
  its own tree's copy of the hook (Codex runs the hook from the tree, and ruling 6 of comment
  7046605950 lets a build edit it) and then pushing, or a one-line interpreter (`node -e`) running
  that push. No list of refused commands can close those. The cheap, common holes are closed in
  the rule itself (tool names matched regardless of case, since the Mac's filesystem ignores it, a
  lone `&` read as a separator, the keychain read in any case), and a further text trick past the
  hook is named here, not chased. The misses, each a command that runs: a push or a GitHub call
  made from inside another program (git's own command runners with a quoted payload, which the blanking of quoted spans hides (`git rebase -x "git -c credential.helper=osxkeychain push ..." HEAD~1`, `git submodule foreach "git push"`, `git bisect run "git push"`), a script the build writes and runs, `node -e`, `python3 -c`,
  `perl -e`, a `make` target, an `npm run` script other than `proof`), `find -exec`, `-execdir` and
  `-ok`, wrappers it does not name (`setsid`, `caffeinate`, `doas`, `ionice`, `chrt`, `watch`,
  `script`, `flock`, `coproc`), a wrapper's option value read as the wrapped command (`sudo -u`,
  `timeout -s`, `env -C` and `-S`, `xargs -I`), a launcher followed by a word it cannot read as a
  command word (`\git`, `$G`), the proof run's name hidden behind a runner option that
  takes a value (`npm --prefix` and `-w`, `pnpm --filter` and `-C`, `node -r` and `--import`), a git
  alias already set in a config file the build did not write, the GitHub API reached by another
  client (`curl`), a build started without the wrapper and so without the variable, and a build that
  edits the hook's own files in its tree, since the hook it runs is that tree's copy. A headless
  build works in its own clone (Alex, 2026-11-22, Issue #1418), so its ordinary git commands land
  there and not in the main repository's `.git`, and the session only fetches from that clone.
  Under full access a build set on it can still write anywhere in Alex's home folder (the main
  repository's `.git`, his shell startup files, test code the guard prover runs) and reach his login
  in the macOS keychain or gh's config folder by a program the hook cannot read; and a push starts
  any workflow file the branch carries. Alex accepted both (comment 7089981355);
  `handbook/specs/orchestration.md` (Lanes that cross harnesses) holds the measurements, among them
  that a command set in the shared git config ran on a push with every git hook off.
  **Its errors the other way are refusals**, each visible and one edit away: every `gh` call, reads
  included; any word that names a shell or `gh` (`which gh`, `ls ~/.config/gh`); `echo git push`;
  any `git -c`; a bare `git` or `git --version`; `git config user.name` without `--get`; a command
  word with a `$` in it; and a quoted command word.
- The `gh api` path is read after quoted spans are blanked, so a quoted path (`gh api
  "repos/O/R/issues/193" -f body=x`), one built from shell variables (`repos/$O/$R/issues/$N`) or one
  built by a subshell is not seen at all, and the destructive call goes through. **This is a MISS, not
  benign silence**: on a refusal the silent direction is the footgun reaching the tool, and the only
  thing bounding it is that the literal unquoted form is what this house types, which is a habit
  rather than a guarantee. It is not closed because the fix, scanning the raw command, false-refuses
  the ordinary read-then-comment pair the fixture table pins. Fixture rows record both halves.
- **The comment-read refusal stops habit, not a determined read** (Issue #1417). Its misses are silence: a quoted or variable-built path, the segmenter's as for the bare-item refusal, which is also how zsh needs a path holding `?per_page=` typed; `--json body`, `--json title` and `gh api ... --jq .body`, which print an opening text or a title; `gh api graphql`; `gh search issues` and `gh api search/issues`, which carry each match's opening text, and `gh issue list` titles; commit comments (`repos/O/R/comments`); `curl` and every other client; a program the session writes; and the GitHub tools a connector adds to a session, which never reach a shell hook. Its errors the other way are refusals, each one edit away: `--comments=false`, `gh issue view --web`, `gh pr view` with a bare `--json` that asks for the field list, and a quoted `--json` field list, which is refused whatever it names because the quotes blank its text before the check reads it.
- A non-body data field on a bare issue path (`-f state=closed`, `-f title=...`) is refused too. That
  is the rule rather than an overreach, since the refusal is about the implicit POST and not about
  the body in particular, and `-X PATCH` or the purpose-built `gh issue` subcommand is the way
  through. Refusal, stated.
- **Gate 7 is pasted only on its route, and only on the edit after Gate 1.** A test elsewhere that
  reads the repo's own files never has it pasted; Gate 1's markers at items 13, 15 and 17 name it,
  and `scripts/lint/` is left off on purpose, since a lint rule is proven by its fixture test under
  `test/repo/`, which is on the route. On the route, a session's first edit gets Gate 1, so a test
  written in one Write and never edited again never has Gate 7 pasted, and a test written first
  meets Gate 7 only once it exists. And since a subagent shares its parent's `session_id` (below),
  parallel lanes share one record of what was shown: Gate 1 can go to one lane and Gate 7 to
  another. Silence, not refusal, all of it.
- **A `test-support/` folder anywhere is read as the helpers folder** where no earlier route claims
  the path, since a route sees a path and not the repository's root, so one nested under
  `src/site/` would get Gate 1 and Gate 7. None is tracked today, and the error is a paste too many,
  never one missing.
- A gate spent on a call the user then rejects is not shown again that session.
- Two calls that owe the same gate at the same moment each read the record before either adds to it,
  so both paste the gate. A repeat, never a gate lost: each gate is appended to the record on a line of
  its own, so one call never writes over a gate another remembered (Issue #1396), and a line read while
  it is still being written names no gate, which repeats that gate once more.
- The once-per-session state is keyed on the hook payload's `session_id`. Measured 2026-09-11 in a
  live dispatch: a subagent's Bash DOES
  reach this hook (a dispatched agent's `perl -i` came back refused with `PERL_REASON` verbatim), and
  it SHARES the parent's `session_id`, so that agent's `git push --dry-run` spent the parent session's
  Gate 5 and the parent never saw it. The remembered gates are read by `evaluate` in
  `scripts/agent-infra/hooks/engine.ts` and checked by `checkBash` in
  `scripts/agent-infra/hooks/shell-checks.ts`, so a subagent cannot re-show a gate the parent spent;
  `deny` carries no such state and fires on every matching call, so refusals reach a subagent
  unaffected, all but the bare `cd`, which reads the payload's `agent_id` and is never refused there.

## How it is wired

The block lives in `.claude/settings.json` (shared, committed); read it there rather than from a copy
here. It runs `node` on the launcher `footgun-gate.ts` beside this file (Node's native TypeScript, the
same way `scripts/**/*.ts` run) only if it exists at `${CLAUDE_PROJECT_DIR}/.claude/skills/vellum-footguns/hooks/`,
and exits 0 otherwise, so a checkout without it is not blocked. The launcher holds no policy: it hands
the call to `runClaudeHook` in `scripts/agent-infra/hooks/claude-adapter.ts`, the one place that reads
`CLAUDE_PROJECT_DIR`, which turns the payload into the request typed in `scripts/agent-infra/hooks/request.ts`
that `evaluate` in `scripts/agent-infra/hooks/engine.ts` judges. The gate text and the PR template are
read from the checkout the adapter sits in, which is the checkout the session was launched in, as
Issue #1395 ruled. The launcher's entry check is `import.meta.main`, so a symlinked project directory
still runs it. Do NOT copy the
block to `~/.claude/settings.json`: `${CLAUDE_PROJECT_DIR}` would resolve to whatever project is
open. Hook entries merge across levels, so user-level hooks keep running beside it.

## Under Codex

`.codex/hooks.json` registers the hook for Codex (Issue #1396). Codex skips a project hook until Alex
trusts it in `/hooks`, and again after any change to that file, so the file is written once and frozen,
holds no logic, and `test/repo/codex-hook.test.ts` pins it byte for byte. Its one command runs in the
folder the Codex session was started in, climbs from there to that folder's repository with
`git rev-parse --show-toplevel`, and runs `scripts/agent-infra/hooks/codex-launcher.ts` there when it
exists, exiting 0 with no answer when it does not, so a worktree cut before the launcher existed is
neither blocked nor checked. The launcher hands the call to `runCodexHook` in
`scripts/agent-infra/hooks/codex-adapter.ts`, and nothing on the Codex path reads `CLAUDE_PROJECT_DIR`.

- **Which checkout's rules.** The gate text and the PR template come from the checkout the adapter sits
  in, which is the checkout the Codex session was started in, never the folder a call runs in: a helper
  working in a lane's folder reads the rules of the checkout its session started in, and a session
  started inside a lane's worktree reads that worktree's, as a Claude session does (Issue #1396). The
  payload's `cwd` is the call's own folder, and a relative body file is read against it.
- **What it judges.** A shell call, which Codex names `Bash`, through the same checks as a Claude one,
  and a file patch, which Codex names `apply_patch` and whose text arrives as its `command`; no other
  tool reaches it.
- **How it reads a patch.** `decodePatch` in `scripts/agent-infra/hooks/codex-patch.ts` reads the text
  into one change a file, in the patch's order, and never runs it. It reads the grammar the patch tool
  gives the model, and each path and line the way codex-cli 0.169.0's own patch tool reads them, measured
  with `codex --codex-run-as-apply-patch` (Issue #1397): a header line is trimmed, a move line's leading
  padding is kept and its trailing whitespace is trimmed, a blank line in a hunk is an empty context
  line, and CRLF line ends are read as LF. U+2028, U+2029 and a mid-line CR are kept in update lines,
  including the text after `@@ `. A file-header or move path holding U+0085 is refused as unreadable,
  because the client's whitespace trimming can change which path the hook would check. Anything else
  is refused with the form to send instead (Issue #1393's D11), a refusal the client would not make
  for a heredoc wrapper and an `*** Environment ID:` line, which its own tool accepts; and so is a patch
  whose payload carries no absolute `cwd`.
- **Which file each change is.** A relative path is read against the payload's `cwd`, the call's own
  folder, never the checkout the rules come from; a path that leaves that folder is checked where it
  lands, never dropped or moved back inside. Each file then meets the checks a Claude edit to its path
  does, under that path. An added file's text is a Write's content, and under a roster path it owes
  Gate 4, even where it overwrites a file already there, which pastes the gate once too often and
  never misses it. An update's hunks are each one Edit's new text: its context lines, its added lines
  and the text after its `@@`, never its removed lines (Issue #1393's D10). A deleted file owes nothing,
  as a Claude `rm` does. A moved file is judged where it lands: its hunks are read under its new path,
  the route there owes its gate, and it owes Gate 4 there as an added file does.
- **The caller.** A helper's payload carries `agent_id`, as a Claude subagent's does.
- **A headless build.** `runCodexHook` reads `VELLUM_HEADLESS_BUILD` from its own environment, the
  one Codex hands the hook, and passes it into the request as `headlessBuild`; nothing else on
  either path reads it, so a test, a Claude Code session or a Codex call that carries the variable
  without coming through that entry is judged as before. The hook sees the model's bare command:
  the `/bin/zsh -lc` wrapper Codex runs it in never reaches it (measured on the planner's run A, `handbook/plans/1400/1409/1409-r1-plan.md`, "The hook sees the model's bare command").
- **The bare `cd`.** Never refused: a Codex shell call does not carry its folder over to the next one
  (Issue #1394's evidence), so the move the refusal exists to stop cannot happen.
- **Gates.** Once per session, as under Claude, and a helper shares its parent's `session_id`, so it
  shares the record of what was shown. The registration sets `additionalContextLimit` to 0, so a note
  reaches the model whole, never as a preview. A shell call's note stays under the 9,000 characters
  the size probes hold; a patch's note carries every gate its files owe, in their order, Gate 1 and
  then Gate 7 for two tests, and the Codex pass's size row holds its every-gate patch under the
  58,980 characters Issue #1396's live check saw reach Codex whole.
- **Time.** The registration's `timeout` is 10 seconds, at least 20 times the slowest run measured when
  it was set (Issue #1396). A hook that runs past it lets the call run unchecked, as a hook whose check
  throws does, since `runHook` exits 0.
- **What it does not see**, each of them silence: input sent to a shell that is already running
  (`write_stdin`), which Codex does not pass through the hook again; the part of a file a patch does
  not carry, so a template opened above an update's hunk and outside its `@@` line is not seen, as
  outside a Claude edit's new text, and neither is the text a move takes to its new path outside its
  hunks; a patch typed into a shell command (`apply_patch <<'EOF'`), which, if it reaches the hook at
  all, is read as the shell command it is; a session in a worktree with no Codex launcher, though
  `/hooks` there still shows the hook Trusted, so the lane check of Issue #1393's D3 cannot catch it;
  and a session whose `/hooks` shows the hook untrusted, which is why each Codex lane checks that
  before it works (Issue #1393, D3).
  A patch note over 58,980 characters is unmeasured: each file can add warnings, so the every-gate
  patch is not a bound on every possible note. Q5 still delivers every gate in full.

## Prove it

```
node test-support/footgun-gate/selftest.ts
```

One line per fixture, `ok` or `FAIL` with the decision and the text it expected; the exit code is
the number of misses. Every gate's text is asserted non-empty first, so a renamed heading in
`.claude/skills/vellum-footguns/SKILL.md` fails here rather than shipping an empty injection, and the PR template is asserted to
carry sections and no em-dash, so a template that would prefill an unusable body fails here too.
The five section names are written out in the fixture table and derived in the hook; that asymmetry
is deliberate, since fixtures built by reading the template would follow a rename and red nothing.
The routing rows are data in `test-support/footgun-gate/gate-routes.fixtures.ts`. Gate 7's each edit a list of paths in one
session and judge the last decision, which is what pins the one-per-edit order and the record the
routes share. Gate 6's rows are generated one per
ARM of its roster regex, because a roster is only as strong as its least-swept alternative: the
prover found 10 of 19 arms carried no fixture, so a typo in any of them would have shipped silent.
Two of its rows exist for shapes no relative path can reach, an absolute `file_path` (which is what
a real tool call passes) and a path matching two gates at once, both of which escaped the first
table. The deployed rows run the exact
command string from `.claude/settings.json` through `sh` with a real, a symlinked, and a missing
`CLAUDE_PROJECT_DIR`, and once from a copy of the checkout while the edit lands in a second checkout
whose gate text differs, so the deployed path is exercised and not only the function, and the gate
text is held to the launch checkout. Every shell row of the table, and every `cd` row, runs once more
through the Codex adapter as a `codex:` row (`test-support/footgun-gate/codex-rows.ts`), every Edit,
Write and MultiEdit row runs once more as the patch that makes the same edit, a `codex: patch:` row
with the same expected decision, and `test/repo/codex-hook.test.ts` runs the exact command from
`.codex/hooks.json` through `sh` with no `CLAUDE_PROJECT_DIR`, from a folder deep in a checkout, from a
lane's worktree, from an older worktree with no Codex launcher and from a folder in no repository.
`test/repo/codex-patch.test.ts` holds the patch reader to what Codex's own patch tool reads, row by
row, and each rule above for a patch to a fixture of its own. The headless-build rows (`test-support/footgun-gate/headless-build.fixtures.ts`) run through the Codex adapter alone with the build marked, and two of them carry the variable into a Claude call and an unmarked Codex call, which it must not change. The comment-read rows are `test-support/footgun-gate/comment-read.fixtures.ts`.
`test/repo/footgun-gate.test.ts` runs the whole table under `npm test`, so CI runs it on every PR.
This is the implementer's own table, not an independent prover run. The once-per-session state
lives at `$TMPDIR/vellum-footguns-<session_id>.txt`, one gate to a line; delete it to see a gate again. `npm run check`,
`npm run lint` and `npm run format:check` read every file under `scripts/agent-infra/hooks/` and
`test-support/footgun-gate/`, and the selftest copies the launcher and the whole of
`scripts/agent-infra/hooks/` into its rootless checkout, so no module the hook imports is left out of
it. The cd rows set
`CLAUDE_PROJECT_DIR` for themselves and put it back, so a session's own value never reaches one.

## Cost

Measured 2026-09-09 on this Mac, ten runs each, through the deployed `sh -c` command:

- a Bash or Edit call that triggers nothing, or a refusal: about 64ms;
- a Write or Edit into a browser-driving script, which loads the TypeScript parser: about 182ms;
- gate text, at most once per session each, and the aggregate if every one fires in a single session.
  Neither figure is written here: they move whenever a gate gains a line, nothing sweeps a claim in markdown,
  and the copy that used to sit here went stale twice. This prints each gate's characters and their
  total, which is the aggregate term; divide by about four for tokens:
  `node --input-type=module -e 'const {gateText}=await import("./scripts/agent-infra/hooks/gate-state.ts");let t=0;for(const g of ["Gate 1","Gate 2","Gate 3","Gate 4","Gate 5","Gate 6","Gate 7"]){const n=gateText(".",g).length;t+=n;console.log(g,n);}console.log("TOTAL",t)'`;
- every turn of every session in this repo: the skill's `description` line in the system prompt.
  That is the only permanent term, and the reason the description is kept short.
