# Issue #781 plan: the footgun hook refuses a bare `cd` that moves the main session

Written at 90c8fe3 after `vellum-spec-recon` (its ledger is `781-recon.md` beside this file); the branch then fast-forwarded to 6778fab (PR #780). `vellum-plan-skeptic` read it at 6778fab; its findings are folded in below and listed with their dispositions at the end. The design was checked for feasibility by a throwaway probe in the scratchpad (`781-probe.ts`, not the implementation), which runs the reader alone: it gave the intended decision on every row in the table below except the three that need `decide()` (the two `agent_id` rows and the stash-ordering row), which are untested until the selftest.

PR #780's `handbook/specs/check-placement.md` is met: every row RUNS the hook's `decide()` with inputs, and `test/repo/footgun-gate.test.ts` reads the selftest's printed output, never a source file's text. No gate section of `SKILL.md` gains a line (the Never list is not a pasted gate), so no gate's pasted-note size moves; the selftest's size probes confirm it.

## What is ruled (Issue #781 body, Alex 2026-10-05; the thread has zero comments)

1. A refusal in `vellum-footguns`'s hook.
2. Any bare `cd` that moves: a `cd` to any directory other than the one the session stands in. A `cd` to the current directory passes.
3. Main session only, never a subagent; the review agents' sandbox recipes stay as written.
4. A `cd` inside a subshell `( cd <path> && ... )`, and `git -C <path>`, always pass.

The body's "measured" section adds that a target the hook cannot work out (a shell variable) is refused in the main session. That sentence is not among the rulings, so it is menu item A; this plan builds it as recommended there.

## The step 6 rulings (Alex, 2026-10-05, Issue #781 comment 6005638553, relayed)

- A: a `cd` whose destination the hook cannot work out is refused. C: as ruled; the refusal sends the session to Alex for `/cd <path>`. B: the hook alone, the setting left off. E: `bare-cd.ts` and `bare-cd.fixtures.ts`, beside the hook.
- **The lane's outside-project call (call 1 in the step 6 report, the first half of call 8 in this file's list) is OVERRULED: a `cd` to a directory outside the project directory PASSES**, since Claude Code resets it after the call and the session-end `cd ~/CodeProjects/claude-config && git add -A` must keep working. The refusal covers a bare `cd` that moves the session to another directory INSIDE the project, worktrees and `out/` included. The blind spot this opens, a directory added with `--add-dir`, is named in the README and the PR body with its direction (silence).
- The other calls (2 to 11 in the report's numbering, every other entry of this file's list) stand as the lane's, open to overrule in the pull request.

What the overruling changes in the design below: step 6 gains the project test. The project directory is `CLAUDE_PROJECT_DIR` from the hook's own environment (set by Claude Code, and the wired command already reads it; it stays the launch root after EnterWorktree, hooks doc lines 608 to 611). A target that does not stay PASSES when it lies outside that directory: its real path when it resolves, else its lexical path, is neither the project directory nor under it (a separator after the prefix, so `Vellum-other` is outside `Vellum`), tested against the project directory's real path and its spelling as given. The project root itself counts as inside, so a `cd` back to it from a worktree is refused (ruling C). With no `CLAUDE_PROJECT_DIR`, nothing is outside, and every move is refused. A target that cannot be worked out is refused before the project test (ruling A). So `cd` with no argument and `cd ~` (the home directory, above the project) now pass, and the reader's verdict order is: cannot work out, refuse; stays, pass; outside the project, pass; else refuse.

The selftest sets `CLAUDE_PROJECT_DIR` itself, so a session's own value never leaks into a row: every cd row names its project (the checkout ROOT, or the scratch S for a row whose cwd is under S, where the symlink, spaced-name and incident directories live), and the row's runner sets it before `decide()` and restores ROOT in a `finally`. Rows changed by the ruling, beside the table below: the symlink rows move into S (a symlink `S/to-a-dir` to `S/a dir`, project S, so a lexical compare lands inside the project and reds); `cd ../src` is replaced by `cd ../test` from SUB (deny), which reds when the target resolves against `process.cwd()`; `cd` and `cd ~` from ROOT now pass; `cd -` from ROOT denies; the created-directory row becomes `mkdir -p out/781-new && cd out/781-new`; the recipe-in-the-main-session row uses an in-project sandbox path, `ROOT/.claude/worktrees/skeptic-781-1`. New rows: the session-end step `cd ~/CodeProjects/claude-config && git add -A` passes; `cd ..` from ROOT passes; `cd ROOT` from SUB is refused; `cd LINK` (the selftest's symlink in S to ROOT) from SUB is refused, since its real path is inside; `cd <S>-781-sibling` from S with project S passes; with no `CLAUDE_PROJECT_DIR`, `cd ~/x` is refused.

## Design

**Where it runs.** `checkBash` in `.claude/skills/vellum-footguns/hooks/footgun-gate.ts`, AFTER the per-segment refusals (stash, perl, `gh api`, the body checks) and before the script escape scan: when `payload.agent_id` is absent, ask the cd reader for a reason; a reason is a `deny`. Running after the segment refusals means nothing the reader does can hide one. `Payload` gains `agent_id?: string` on its existing line. Keyed on `agent_id`, never `agent_type`, which a main session started with `--agent` also carries (hooks doc lines 743 and 744). The hook grows by three lines (the import, the check, the deny) to 400.

**The cd reader** is a new module beside the hook (name: menu item E), exporting one function from the RAW command and the payload's `cwd` to a refusal reason or null. It cannot throw: its only filesystem calls (`realpathSync`) are caught, and a failure reads as "cannot show the session stays", which refuses. Its functions stay under 50 lines by hand, since the lint's caps do not read `.claude/`.

**How it reads a command.** The raw command is needed, because `SEPARATORS` splits on `(` and `QUOTED` blanks a quoted target, so a segment can tell neither `( cd x && y )` from `cd x && y` nor `cd '<cwd>'` from `cd ""` (recon, CURRENT and understated).

1. Join each backslash-newline continuation into spaces of the same length.
2. Build a MASKED copy of the same length in one left-to-right pass, the way the shell reads: a backslash escape, a single-quoted span and a double-quoted span are filled with `_`; a heredoc operator (`<<WORD`, `<<'WORD'`, `<<"WORD"`, `<<-WORD`, never `<<<`, and WORD starting with a letter or `_` so an arithmetic `1 << 2` is not one) is remembered, and at the next newline its body, through its terminator line (tabs stripped for `<<-`), is blanked; a body with no terminator runs to the end, as the shell reads it. Then every comment (`#` at a word start, to its line end) is blanked. Indices line up, so a word found in the mask is read back raw. The reader does not use the hook's `HEREDOC` regex, which strips a body only when the delimiter ends its line, so `cat <<'EOF' > f`, `cat <<EOF | tee f` and a tab-indented `<<-` terminator keep their bodies (skeptic finding 2).
3. Walk the mask's boundaries: newline, `;`, `&&`, `||`, a pipe `|`, a background `&` (never the `&` of `2>&1`, `>&` or `&>`; the `&` of `|&` is read as one, which is harmless since the `|` already ended the stage), `(`, `)`, a backtick, `{ `, ` }`, and the words `if then do else elif while until !` at a word start. Track depth: `(` adds one (covering `$(` and `<(`), `)` takes one away and never below zero (a `case` pattern's lone `)`), a backtick toggles. A simple command is read only when it starts at depth zero outside backticks AND is not ended by a pipe or a background `&`: zsh runs a pipeline's earlier stages and a background job in a subshell, and a pipeline's LAST stage in the session (recon, `zsh -c`; the skeptic measured it in a harness Bash call; Claude Code's Bash runs `/bin/zsh` 5.9 here).
4. In such a command, skip leading assignments (`X=1`) and the words `builtin`, `command`, `time`, `noglob`, `nocorrect`; the next word, read raw and unquoted, must be `cd`, `chdir`, `pushd` or `popd` (the four the tools reference names).
5. Its target, read raw and unquoted: single quotes literal; double quotes literal unless they hold `$` or a backtick; a backslash escape is its character; an unquoted `$`, backtick, `*`, `?`, `[` or `{` cannot be worked out; a leading `~` or `~/` is the home directory (`os.homedir()`), any other leading `~` cannot.
   - `cd`/`chdir` with no argument: the home directory. `-`: cannot. Leading options (`-L`, `-P`, `-q`, `-s`, `-e`, `-@`, bash's and zsh's together) and a `--` are skipped. More than one argument left: cannot.
   - `pushd <dir>`: as `cd <dir>`. `pushd` with no argument, or with a `+N`/`-N`/option: cannot. `popd`: cannot.
6. The target resolves against the payload's `cwd`, never the hook process's own (`path.resolve` normalises `..` lexically before `realpathSync`, which is what the climbs-back rows bite on). It STAYS only when both `realpathSync(target)` and `realpathSync(cwd)` succeed and are equal (a symlink to the cwd stays). A target that does not exist yet never stays (`mkdir -p x && cd x` moves at run time); a `cwd` that does not resolve, or none in the payload, never stays.
7. The first bare `cd` that does not stay is refused. Each is judged alone, so a round trip `cd x && ... && cd <back>` is refused at its first leg (ruling 2, per `cd`).

**The reason** quotes the `cd` it read and the directory the session stands in, says why (every later relative path, `git` call and dispatched agent then runs from the new directory; Issue #781), and gives the way through: a subshell with a LITERAL path, `( cd <path> && ... )` (a fenced worktree refuses a compound `cd` to a shell variable even in a subshell, recon's STALE row), `git -C <path>`, or an absolute path; a `cd` to where you stand passes; a subagent is never refused. Under menu item C option 1 it adds: a session that has already moved asks Alex to type `/cd <path>` (Claude Code 2.1.289 carries `name:"cd"`, "Move this session to a new working directory", read from the binary with `strings`).

## Files

- `.claude/skills/vellum-footguns/hooks/footgun-gate.ts`: `agent_id` on `Payload`, the import, the check after the segment loop in `checkBash`. Lands at 400 lines with no headroom.
- the cd reader, new, beside the hook (item E).
- its rows as data, new, beside it (item E), on `markdown-code.fixtures.ts`'s pattern.
- `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`: maps the rows (placeholders filled, `agent_id` added for a subagent's), makes the scratch directories they need inside the existing `SCRATCH`, and copies the reader into the rootless checkout beside `markdown-code.ts` (else the hook's static import fails there and both rootless rows red). About twelve lines, to about 387.
- `test/repo/footgun-gate.test.ts`: the cd rows written out by name with their decisions in a module-scope constant, on the `CODE_ROWS` pattern (never inside a `test()` callback, which the lint's 50-line function cap reads under `test/`), since a deleted row prints no FAIL. About eighty lines, to about 250.
- `.claude/skills/vellum-footguns/hooks/README.md`: a Refuses bullet; the blind spots below with their direction; the session-state paragraph's "refusals reach a subagent unaffected" gains this exception; the rootless-copy sentence names the reader.
- `.claude/skills/vellum-footguns/SKILL.md`: one Never line ("A bare `cd` that moves the main session ..."), and Issue #781 in the Never list's provenance sentence. No tracked file carries the rule today (recon), so the Never line is its one home, and the README enumerates what the hook refuses, as for every Never item.
- `handbook/specs/development-workflow.md` step 6: "links `node_modules` from inside it" becomes "links `node_modules` into it by path", the one phrase that invites the bare `cd` this refuses (skeptic finding 9; `scripts/agent-sandbox.ts` links with `symlinkSync` and no `cd`).
- `handbook/errata/guards.md`: one row for the hook's own `HEREDOC` gap (a body whose delimiter does not end its line is read as commands by the stash, perl and `gh` refusals: a false refusal on a `git stash pop` line inside such a body, and silence on a real one after an apostrophe in it). A sibling defect in code this PR does not change (step 15); searched `handbook/errata/` (two heredoc rows, neither this) and the issues (`gh search issues heredoc`: none).
- `handbook/plans/781/781-plan.md`: this plan, archived at the first commit.

The two agent recipes stay (ruling 3).

## Tests: selftest rows, each with the mutation that reds it

Placeholders: ROOT the checkout; SUB = ROOT/src; LINK the selftest's existing symlink to ROOT; HOME `os.homedir()`; S the selftest's SCRATCH, holding `a dir` (a name with a space), `.claude/worktrees/orch-779` and `out/762/baseline-phone`, made in `run()`; GONE a path under S never made. A deny row's needle is a phrase of the reason; an allow row wants null.

| row | payload (cwd; who) | want | mutation that reds it |
|---|---|---|---|
| a bare cd into another directory denied | `cd src && ls` (ROOT) | deny | delete the check in `checkBash` |
| a bare cd into a worktree denied, the incident's shape | `cd .claude/worktrees/orch-779 && git status` (S) | deny | same |
| a bare cd into a plain directory denied, the incident's shape | `cd out/762/baseline-phone` (S) | deny | same |
| cd to the absolute cwd allowed | `cd ROOT && git status` (ROOT) | null | drop the stays test (refuse every bare cd) |
| cd . allowed | `cd . && ls` (SUB) | null | resolve against `process.cwd()` instead of the payload's cwd |
| a relative target that climbs back allowed | `cd ../src` (SUB) | null | same |
| a symlink to the cwd allowed | `cd LINK` (ROOT) | null | compare `path.resolve` instead of `realpathSync` |
| cd -P through the symlink allowed | `cd -P LINK` (ROOT) | null | stop skipping options |
| zsh's -q through the symlink allowed | `cd -q LINK` (ROOT) | null | drop zsh's options from the class |
| a double-quoted path with a space that stays allowed | `cd "S/a dir"` (S/a dir) | null | read the target from the mask, not the raw command |
| a single-quoted path with a space that stays allowed | `cd 'S/a dir'` (S/a dir) | null | same |
| a backslash-escaped space that stays allowed | `cd S/a\ dir` (S/a dir) | null | stop masking backslash escapes |
| a subshell cd allowed | `( cd src && ls )` (ROOT) | null | `(` adds no depth |
| a subshell cd with no spaces allowed | `(cd src && ls)` (ROOT) | null | same |
| a nested subshell's close leaves the outer one open | `( (cd src); cd test )` (ROOT) | null | `)` takes away two |
| a cd after the subshell closes denied | `(cd src && ls) && cd test` (ROOT) | deny | `)` takes no depth away |
| a cd after a case statement denied | `case x in a) true;; esac; cd src` (ROOT) | deny | drop the clamp at zero |
| a cd in a command substitution allowed | `X=$(cd src && pwd); echo $X` (ROOT) | null | `(` adds no depth |
| a cd in a process substitution allowed | `diff <(cd src && ls) <(ls)` (ROOT) | null | same |
| a cd in backticks allowed | ``echo `cd src && pwd` `` (ROOT) | null | the backtick does not toggle |
| a cd on its own line denied | `ls` newline `cd src` (ROOT) | deny | drop the newline |
| a cd before an or denied | `cd src \|\| exit 1` (ROOT) | deny | match `\|` before `\|\|` |
| a cd in a braced group denied | `{ cd src; ls; }` (ROOT) | deny | read `{` as a subshell |
| a cd as an if condition denied | `if cd src; then ls; fi` (ROOT) | deny | drop `if` |
| a cd after then denied | `if true; then cd src; fi` (ROOT) | deny | drop `then` |
| a cd after else denied | `if false; then true; else cd src; fi` (ROOT) | deny | drop `else` |
| a cd after elif denied | `if false; then true; elif cd src; then true; fi` (ROOT) | deny | drop `elif` |
| a cd as a while condition denied | `while cd src; do break; done` (ROOT) | deny | drop `while` |
| a cd as an until condition denied | `until cd src; do break; done` (ROOT) | deny | drop `until` |
| a negated cd denied | `! cd src` (ROOT) | deny | drop `!` |
| a cd in a loop body denied | `for d in src; do cd $d; done` (ROOT) | deny | drop `do` |
| a cd at a pipeline's end denied, since zsh runs it in the session | `ls \| cd src` (ROOT) | deny | drop `\|` |
| a cd at a pipeline's start allowed | `cd src \| cat` (ROOT) | null | read a stage a pipe ends |
| a cd piped with its stderr allowed | `cd src \|& cat` (ROOT) | null | read a stage a pipe ends |
| a cd after a pipe with stderr denied | `ls \|& cd src` (ROOT) | deny | drop `\|` |
| a background cd allowed | `cd src &` (ROOT) | null | read a command a background `&` ends |
| a cd after a background job denied | `sleep 1 & cd src` (ROOT) | deny | drop the background `&` |
| a cd whose stderr is redirected is not a background job | `cd src 2>&1 && ls` (ROOT) | deny | read the `&` in `2>&1` as a background `&` |
| a cd whose output is redirected is not a background job | `cd src &>/dev/null && ls` (ROOT) | deny | read the `&` in `&>` as a background `&` |
| a cd across a line continuation denied | `ls && \` newline `  cd src` (ROOT) | deny | skip the continuation join |
| a round trip denied at its first leg | `cd src && ls && cd ROOT` (ROOT) | deny | judge only the last cd |
| a cd into a directory the same call creates denied | `mkdir -p S/781-new && cd S/781-new` (ROOT) | deny | a target that does not resolve stays |
| a cd to a shell variable denied | `cd "$WT" && git status` (ROOT) | deny | none alone; the next two are this arm's witnesses |
| a quoted variable path that climbs back denied | `cd "$SUB/.."` (ROOT) | deny | accept `$` inside double quotes |
| an unquoted variable path that climbs back denied | `cd $SUB/..` (ROOT) | deny | accept an unquoted `$` |
| a glob that climbs back denied | `cd ./*/..` (ROOT) | deny | accept a glob character |
| a bare cd from the home directory allowed | `cd` (HOME) | null | no argument cannot be worked out, rather than home |
| cd ~ from the home directory allowed | `cd ~` (HOME) | null | no tilde expansion |
| a bare cd elsewhere denied | `cd` (ROOT) | deny | no argument means stay |
| cd - denied even from home | `cd -` (HOME) | deny | read `-` as an option (then home, which stays) |
| cd with a second argument denied | `cd . extra` (ROOT) | deny | ignore extra arguments |
| chdir denied | `chdir src` (ROOT) | deny | drop `chdir` |
| builtin cd denied | `builtin cd src` (ROOT) | deny | drop `builtin` from the skipped words |
| an assignment before cd denied | `X=1 cd src` (ROOT) | deny | stop skipping assignments |
| a backslash-escaped cd denied | `\cd src` (ROOT) | deny | compare the masked command word, not the raw one |
| env cd allowed, since it runs an external cd | `env cd src` (ROOT) | null | add `env` to the skipped words |
| pushd elsewhere denied | `pushd src && ls` (ROOT) | deny | drop `pushd` |
| pushd . allowed | `pushd . && ls` (ROOT) | null | read every pushd as one that cannot be worked out |
| popd denied | `popd` (ROOT) | deny | drop `popd` |
| no cwd in the payload denied | `cd .` (none) | deny | fall back to `process.cwd()` |
| a cwd that does not exist denied | `cd .` (GONE) | deny | compare lexically when `realpathSync` fails; with the catch removed the selftest throws |
| a cd the reader cannot place leaves the stash refusal standing | `cd .; git stash pop` (GONE) | deny, needle `refs/stash` | run the cd check before the segment refusals |
| a cd in quotes is not a cd | `echo 'a; cd src'` (ROOT) | null | stop masking quoted spans |
| a cd in an inline body is not a cd | `gh issue comment 1 --body "then cd src"` (ROOT) | null | same |
| a cd in a heredoc body is not a cd | `cat > n.md <<'EOF'` / `ls` / `cd src` / `EOF` (ROOT) | null | stop blanking heredoc bodies |
| a cd in a heredoc body whose operator is not last on its line is not a cd | `cat <<EOF \| tee n.md` / `cd src` / `EOF` (ROOT) | null | blank only a body whose delimiter ends its line (the hook's `HEREDOC`) |
| a cd after a tab-indented heredoc denied, and the one inside it not read | `cat <<-EOF > n.md` / tab `cd src` / tab `EOF` / `cd src` (ROOT) | deny | ignore the `-` (the tabbed terminator is then missed and the body runs to the end, hiding the last line) |
| a cd after a heredoc whose body opens a quote and a paren denied | `cat <<'EOF' > n.md` / `It's a note (with a paren` / `EOF` / `cd .claude/worktrees/orch-779 && gh pr view` (S) | deny | blank only a body whose delimiter ends its line |
| a cd in a trailing comment is not a cd | `ls # then cd src` (ROOT) | null | stop masking comments |
| a word that starts with cd is not a cd | `cdk synth` (ROOT) | null | match the verb by prefix |
| a cd as an argument is not a cd | `echo cd src` (ROOT) | null | read every word, not the command word |
| a subagent's bare cd allowed | `cd src && ls` (ROOT; `agent_id`) | null | delete the `agent_id` test |
| the review agents' sandbox recipe allowed in a subagent | the `cd /the/path/create/printed && cat ...` line from `.claude/agents/vellum-pr-skeptic.md` (ROOT; `agent_id`) | null | same |
| the same recipe denied in the main session | same (ROOT) | deny | delete the check |

Dropped: a `git -C` row (ruling 4), since the reader reads only the four verbs and no mutation of it can red such a row; ruling 4's `git -C` half holds because nothing reads `git` as a directory change, and the PR says so. Under item C option 2, two more rows run the hook as a child with its own `CLAUDE_PROJECT_DIR` (the `inRootlessCheckout` shape, never a `process.env` write).

No existing fixture carries `cd`, `chdir`, `pushd` or `popd` (recon and skeptic grepped, exit 1), so no existing row flips.

## Evidence

- Red first: the reader stubbed with the right signature returning null, rows and wiring in place; `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` shows every deny row FAIL on its decision (`want deny ..., got null`) and every allow row ok. The red lines go in the PR body.
- Green: the selftest prints no FAIL; `node --test test/repo/footgun-gate.test.ts`; `node --test test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts` after the README, SKILL and workflow edits (no backticked example path that does not exist); `npm run check`; `npm run lint`; `npm test`, then `npm run astro:generate`. No e2e suite is touched.
- `vellum-guard-prover`, one round, on the rows at the committed sha.
- Live: UNVERIFIABLE from the lane. The lane is a subagent, so the gate never fires on its own calls, and a session runs the launch checkout's hook, main's, until merge. The first main-session bare `cd` after merge is the live proof, named under "Look for these when you use it". `agent_id` is documented (hooks doc line 743, and the binary's hook-input schema per the skeptic) and seen by no run here: if a subagent's payload lacked it, every review agent's sandbox `cd` would be refused, loudly, on the first review; if a main-session payload carried it, the gate would be silent.

## Rosters and doctrine the change drags

- The selftest's rootless checkout copies every module the hook imports.
- The README's Refuses list, Blind spots, session-state paragraph and rootless sentence.
- SKILL.md's Never list and its provenance sentence.
- The written-out row list in `test/repo/footgun-gate.test.ts`.
- The workflow's step 6 phrase.
- No e2e suite, page, sheet, chart or golden; no Gate 4 or Gate 6 roster.

## Blind spots for the README, each with its direction

- Silence: an alias or function that changes directory under another name (zoxide's `z`; none is defined in this Mac's `~/.zshrc` or `~/.zprofile`, per the skeptic), a sourced script (`source x.sh`, `. x.sh`), `eval cd x`, zsh's `AUTO_CD` (a bare directory name as a command), and quote nesting inside a `$( )` inside double quotes odd enough to end the reader's quoted span early.
- Refusal: a whole list or compound command piped or sent to the background (`cd x && y &`, `{ cd x; } | cat`, `if true; then cd x; fi | cat`) runs in a subshell and stays, but the reader ends the `cd` at its own boundary.
- Refusal: a redirect on a `cd` that stays (`cd . 2>/dev/null`) counts as a second argument.
- Refusal: `( case x in a) cd y;; esac )`, where the pattern's `)` closes the subshell early.
- Silence (after the ruling): a `cd` into a directory added with `--add-dir`, `/add-dir` or `additionalDirectories`, outside the project. Claude Code carries such a move over, but the hook sees only `CLAUDE_PROJECT_DIR`, so it passes as outside the project.
- Refusal: a `cd` in a call with `run_in_background`; the payload carries the flag, but whether such a `cd` carries over is unmeasured (the docs speak only of a call moved to the background at its timeout), so it is refused.
- Refusal: `CDPATH`, which can only send a target that does not already resolve to the cwd elsewhere.
- Refusal: a command that fails before its end, after which Claude Code's `pwd -P` capture does not run and nothing moves (the `&& pwd -P` in the 2.1.289 binary, per the skeptic).
- Refusal: a path spelled in another case on a case-insensitive volume.
- Refusal: `command cd x`, which in zsh runs the external `/usr/bin/cd` and stays (bash's `command` runs the builtin and moves).
- Correct, not blind: `env cd`, `sudo cd`, `nohup cd`, `nice cd` and `coproc cd` each run the `cd` in another process and pass.

## Calls made in the plan (recorded on the issue before the PR opens)

1. `pushd <dir>` is read as `cd <dir>`; `pushd` with no directory or with `+N`/`-N`, and every `popd`, is refused.
2. `cd -` is refused; a bare `cd` is the home directory; a relative target resolves against the payload's `cwd`; a symlink to the cwd stays.
3. `chdir` joins `cd`, `pushd`, `popd` (the four the tools reference names).
4. A `cd` at a pipeline's end is refused (zsh runs it in the session); one at a pipeline's start or in a background job passes (a subshell, ruling 4's spirit).
5. Each `cd` is judged alone: a round trip is refused at its first leg.
6. A target that does not exist yet is refused, though it moves only once created.
7. No `cwd` in the payload, or one that does not resolve, refuses every bare `cd`.
8. A `cd` in a `run_in_background` call is refused, priced above. (Its outside-project half was overruled at step 6: such a `cd` passes.)
9. The rule's prose home is a Never line in `SKILL.md`, with the README enumerating it.
10. The reader is hand-rolled, as Issue #644 ruled for the markdown reader; no shell parser dependency (none maintained for zsh).
11. The cd check runs after the existing refusals, and keys on `agent_id`.
12. The workflow's step 6 phrase is reworded; the hook's own `HEREDOC` gap goes to `handbook/errata/guards.md`.

## The menu (for Alex, through the dispatcher)

**A. A `cd` whose destination the hook cannot work out**, such as `cd "$WT"` (a name filled in when the command runs), `cd -` (back to wherever the session was before), or `popd`.
1. **Recommended: refuse it in the main session.** The hook cannot show the session stays put, so it blocks; the way through is to spell the path out, or put the `cd` in parentheses. `cd "$WT"` is exactly the shape that slipped into a worktree before, so letting it through would leave the commonest slip open.
2. Let it through. Fewer refusals, but any `cd` written with a name in it walks past the guard.

**E. What the two new files are called.** The hook is 397 lines and its fixture table 375; the house keeps a file under 400, so the new reader and its fixture rows each get a file beside the hook, the layout Alex ruled for the em-dash reader on Issue #644 (`markdown-code.ts` and `markdown-code.fixtures.ts`).
1. **Recommended: `bare-cd.ts` and `bare-cd.fixtures.ts`.** Named for what it refuses, the way the em-dash pair is named for what it reads.
2. `cd-reader.ts` and `cd-reader.fixtures.ts`. Named for what it does.
3. No new files: everything goes into the hook and its table, which pass 400 lines (no automatic check reads them, so nothing fails; the house limit is broken by hand).

**C. The way home for a session that has already moved** (through a shape the hook misses, or a move made before this lands). As ruled, every `cd` back to the main checkout is itself a move, so it is refused.
1. **Recommended: as ruled.** The refusal tells the session to ask you, and you type `/cd <path>` (Claude Code's own command for moving a session) to bring it back. Costs you one command on a rare slip.
2. Always let a `cd` to the directory the session was launched from through. The session can fix itself, but a session working inside a worktree through the worktree tool could then `cd` back into the main checkout unrefused, which is this same slip in the other direction.

**B. A Claude Code setting the ruling did not weigh.** `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` sends the main session back to the project directory after every command, so a `cd` never carries over at all (Claude Code's tools reference and environment-variable list). It is set nowhere here.
1. **Recommended: build the hook as ruled and leave the setting off.** What "the project directory" means for a session working inside a worktree is not documented and cannot be measured from this lane; if it means the main checkout, every command in such a session would run in the wrong tree, which is the defect at scale. It can be measured later in a main session and ruled on its own.
2. Set it as well as the hook. A missed shape could no longer strand a session, at the unmeasured worktree risk above. The setting lives in `.claude/settings.json`, which this lane will not edit on a relayed message; you or the main session would make that one-line change.
3. Set it instead of the hook. The same risk, and no refusal text to teach the habit.

## Plan skeptic findings and their dispositions

1. BLOCKING, item A missing from the menu though the preamble said it was there: folded, A is on the menu with a recommendation.
2. SHOULD-FIX, heredoc forms the hook's `HEREDOC` regex does not strip: folded, the reader blanks heredoc bodies itself in its masking pass (design step 2), with four heredoc rows; the hook's own gap goes to the errata ledger as a sibling defect.
3. SHOULD-FIX, boundary arms with no row: folded, rows for the newline, `||`, `then`, `else`, `elif`, `while`, `until`, `!`, `&>` and the clamp. `|&` lost its own arm instead: the probe showed no row can tell it from `|` followed by a background `&`, so it was dead precision; two `|&` rows pin the shape on the pipe arm.
4. SHOULD-FIX, four rows that cannot red on their named mutation: folded. Two subshells became a nested subshell; the round trip ends at ROOT so judging only the last `cd` passes it; `&& popd` dropped from the pushd row; the `git -C` row dropped with the reason stated. The climbs-back rows name the lexical normalisation they bite on.
5. SHOULD-FIX, menu items B and C with no options or costs: folded, each option written out with its cost.
6. SHOULD-FIX, the outside-project blind spot's wrong claim and the unpriced handoff refusal: folded, the sentence now says the hook could see the project directory but not the `--add-dir` set, and the handoff ritual's refusal is priced with its way through; the `run_in_background` case is split out and stated as unmeasured.
7. NIT, blind-spot directions: folded (`coproc` moved to correct, `CDPATH` to refusal, `eval cd` added to silence, piped and backgrounded compound commands and the `pwd -P` capture added to refusal, zsh's `-q` and `-s` added to the options with a row).
8. NIT, no line-count headroom and an unlinted reader: folded, the selftest and test additions counted, the hook named at 400 with no headroom, and the reader's 50-line functions kept by hand.
9. NIT, the workflow's "from inside it": folded, reworded.
10. NIT, the weak `shared` needle, the env-var rows' mechanism, and the 743/744 citation: folded (`refs/stash`, a child with its own environment under C option 2, lines 743 and 744).
