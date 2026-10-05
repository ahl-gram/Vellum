# Issue #644 plan: an em-dash inside code passes the hook, so a red line is pasted as printed

Branch `fix/644-pasted-red-line`, cut fresh from `origin/main` and brought current with `git merge origin/main` at `1f9cee0` (PR #773). The issue was filed against `scripts/e2e/harness.mjs:381`; the printer is now the `check` closure inside `start` in `e2e/harness.ts`. This plan writes the character as U+2014 throughout.

## Ruling (Alex, 2026-10-04, Issue #644 comment 5986867844, relayed)

- **A4: an em-dash inside code is allowed.** Everywhere the footgun hook checks (PR bodies, issue bodies, comments on issues and PRs, and commit messages), U+2014 inside inline backticks or a fenced code block passes; one in prose outside code is still refused. A failing e2e line is then pasted as printed, inside code.
- **It supersedes part of the 2026-10-02 ruling recorded in Issue #727's body** ("the hook's refusal on bodies is unchanged"); Issue #727 comment 5986868594 points at it. The prose rule for bodies, commits and published copy stands.
- **B, C and D fall away**: the harness keeps its separator, the four unit-test messages stay, there is no harness-line guard, and the PR removes no U+2014 line.
- **The hook change carries its own tests**: inside code passes, the same character in prose is refused, and an unclosed backtick or fence opens no loophole.
- **Every written home of the rule moves to the new wording in this PR**: `CLAUDE.md`, the gates, the hook's README, the agent definitions that state it, the PR template.
- **The second menu (Alex, 2026-10-04, Issue #644 comment 5987075834, relayed), all as recommended:** it corrects the first ruling's premise (nothing checks commit messages today). E1, the written rule for commit messages takes the same exemption, unenforced. F1, repo markdown and the diff follow the same rule: inside code is fine, in prose it is not; Gate 5 item 6's line stays as written and the flake record may quote error output verbatim; comments in code stay Issue #727's. F2, the reader lives in `.claude/skills/vellum-footguns/hooks/markdown-code.ts`, which the selftest copies beside the hook. F3, written by hand, each rule with a selftest row, its blind spots named in the hook README; no Markdown dependency. The lane's six calls stand.
- The dispatcher's notes: this lane owns the shared lines Issue #727 also edits, and leaves Issue #727's comment-half wording alone; the Issue #728 lane edits Gate 1 item 8 of `SKILL.md`, and the second of the two to merge takes `git merge origin/main`.

## Re-scoped recon, by command, at `1f9cee0`

**Where the hook reads U+2014.** `grep -n "EM_DASH\|GH_BODY_WRITE\|bodyText\|ghRefusal" .claude/skills/vellum-footguns/hooks/footgun-gate.ts`:

- One check: `ghRefusal`, `if (body.includes(EM_DASH))`, on any Bash segment matching `GH_BODY_WRITE` (`^gh (pr|issue) (create|edit|comment)\b`).
- What it reads (`bodyText`): the WHOLE command string (so the `--title` and an inline `--body` / `-b`), plus every file named by `--body-file` / `-F` and every `$(cat f)` / `$(< f)`, appended with newlines.
- **It never reads a commit message.** No `git commit` handling exists in the hook (`grep -n -i commit` finds only a roster comment and the `git stash push -m` advice), `.claude/settings.json` wires only this one PreToolUse hook, `core.hooksPath` is unset, and no workflow under `.github/workflows/` checks commit text. The ruling's list of places the hook checks includes commit messages; it does not check them today (decision E).
- It does not read `gh api .../comments -f body=` (`handbook/errata/guards.md`, the PR #620 row), nor a body passed through a variable or a pipe (the README's blind spots). Unchanged.
- The deny text: "the body carries an em-dash; the house forbids them in issue and PR bodies."
- Its tests: the selftest rows "pr body em-dash denied", "issue body em-dash denied", "pr comment em-dash denied", "pr body em-dash across a line continuation denied", "pr body via subshell cat read", "relative body-file resolved against cwd" (the scratch `body.md` holds `a U+2014 b`), and the check that the PR template carries no U+2014. `test/repo/footgun-gate.test.ts` runs the selftest under `npm test`.

**Every written home of the body rule.** `git grep -n -i -E "em-dash|em dash" -- CLAUDE.md .claude handbook/specs .github handbook/errata/README.md`, plus Gate 5 item 6, which writes the character itself:

| home | today | under the ruling |
|---|---|---|
| `CLAUDE.md`, Process | "No em-dashes in issue bodies, PR bodies, published copy or new code comments." | edited: the body half gains the code exemption; "new code comments" left for Issue #727 |
| `SKILL.md` Gate 5 item 6 | "`grep -n 'U+2014'` over the body and the diff returns nothing." | edited: a hit in the body stands only inside code; the diff half as decision F1 rules |
| `SKILL.md`, Never | "A PR body with an em-dash, or with ..." | edited: "an em-dash outside code" |
| `hooks/README.md`, the refusal list | "whose body carries an em-dash" | edited: outside inline code or a fenced block, with how a span and a fence are read |
| `hooks/README.md`, the selftest paragraph | "the PR template is asserted to carry sections and no em-dash" | unchanged: still true |
| `footgun-gate.ts`, the deny text | as above | edited to name the exemption |
| `.claude/agents/vellum-implementer.md` | "No em-dashes anywhere: code, comments, commit messages, PR body, issue comments." | edited: the body, comment and commit half gains the exemption; "code, comments" left for Issue #727 |
| `.claude/agents/vellum-pr-skeptic.md`, House copy rules | "No em-dashes in the PR body or new code comments." | edited the same way |
| five agents' "No em-dashes in anything you write." (guard-prover, plan-skeptic, plate-reader, pr-skeptic, spec-recon) | the agent's own reports, which are relayed into issue and PR comments | edited: "outside code (inline backticks or a fenced block)" |
| `.github/PULL_REQUEST_TEMPLATE.md` | silent; its Guards header asks for "red line (pasted)" | edited: one sentence in its comment, written without the character, says a red line is pasted as printed inside backticks |
| `handbook/specs/rulebook.md` line 15 | a summary of what `CLAUDE.md` holds: "no em-dashes, measure before you assert" | unchanged (call 4) |
| `handbook/errata/README.md` | "no em-dash" in an errata row | as decision F1 rules (call 5) |
| `.claude/skills/vellum-footguns/references/flake-record.md` | "The payload verbatim" | as decision F1 rules |

## Design

### The reader (decisions F2 and F3 set where it lives and whether it is hand-rolled)

- `bodyText` keeps its pieces apart (the command string, each file it read) and still returns their join for the section and closing-keyword checks, which do not change.
- `proseOf(text)` returns the text with its code removed, and the U+2014 check becomes "any piece's `proseOf` carries U+2014". Each piece is read on its own, so a fence opened in one cannot close in another.
- **A fence** is a line of at most three spaces of indentation, then three or more backticks or three or more tildes; a backtick fence's info string holds no backtick (GitHub reads such a line as an inline span). It is closed by a later line of at most three spaces, a run of the SAME character at least as long, and only whitespace after it. A closed fence, opener and closer included, is code. **An opener with no closer is prose, and the lines after it are read as prose** (the ruling's "an unclosed fence opens no loophole"; CommonMark would run it to the end).
- **A table row** (a line whose first non-blank character is a pipe) is split on unescaped pipes before spans are read, as GitHub splits it even inside a span, so a red line whose payload carries a bare pipe is refused and one written with `\|` passes (plan skeptic round 2, finding 4).
- **An inline span** is a run of N backticks closed by the next run of exactly N backticks on the same line, or within the same table cell; a run with no closer is literal, so what follows it is prose ("an unclosed backtick opens no loophole"). A run preceded by a backslash opens nothing; a backslash before a CLOSING run still closes it, as GitHub renders.
- An indented block (four spaces, no fence) is prose.
- The deny text: "vellum-footguns: the body carries an em-dash outside code, near: <the line>; the house forbids them in the prose of issue and PR bodies and comments. One inside inline backticks or a fenced code block passes, which is how a pasted red line carries one."

### The tests, in `footgun-gate.selftest.ts` (run by `test/repo/footgun-gate.test.ts`)

Every new fixture builds U+2014 from `String.fromCharCode(0x2014)` and writes its body to a scratch file, so shell quoting never touches its backticks. Rows, each with the mutation that reds it:

| row | want | mutation that reds it |
|---|---|---|
| U+2014 inside an inline span in a PR body | allowed | `proseOf` returns its input |
| inside a double-backtick span, the dash AFTER an inner single backtick | allowed | span runs closed by any length |
| inside a closed backtick fence | allowed | fences not stripped |
| inside a closed tilde fence | allowed | the tilde arm dropped |
| inside a fence indented two spaces | allowed | indentation not allowed at all |
| inside a fence whose closer is longer than its opener | allowed | closer length required equal |
| in a table cell, a pasted red line inside a span, its pipe written `\|` | allowed | table rows split on every pipe, escaped or not |
| in an issue comment, inside a span | allowed | the exemption wired only for `gh pr` |
| in an issue body (`gh issue create`), inside a span | allowed | the same |
| in prose beside a span on the same line | refused | a line exempted whole once it holds a span |
| after an unclosed backtick on its line | refused | an unclosed run read as open to the end |
| a span opened on one line and closed on the next | refused | spans allowed across lines |
| after a backslash-escaped opening backtick | refused | the opener backslash rule dropped |
| after a span closed by a backslash-preceded backtick | refused | the backslash rule applied to closers too |
| after an unclosed fence | refused | an unclosed fence run to the end |
| inside a fence whose closer is the other character | refused | closer character not checked |
| inside a fence whose closer is shorter | refused | closer length not checked |
| on the line after a backtick "fence" whose info string holds a backtick | refused | backticks allowed in the info string |
| inside a "fence" indented four spaces | refused | the three-space cap removed |
| in an indented block with no fence | refused | four-space indentation read as code |
| in a table row whose bare pipe splits the span | refused | table rows not split |
| a fence opened in the command and closed in the body file | refused | pieces joined before `proseOf` |
| in the `--title`, outside code | refused | only the body flag's text read |

The six existing refusal rows stay as written.

### The written homes

The edits in the homes table, each the smallest change that states the exemption: inline backticks or a fenced code block, never "code" alone. The template sentence names no issue number (`test/repo/footgun-gate.test.ts` refuses a literal one there) and says a pipe in a pasted red line is written `\|`. Gate 1 item 9 ("paste the red line into the PR body's guard table") stays as written: it is now obeyable, and Gate 1 has 13 characters of headroom. Gate 5 grows by about 150 characters (its worst probe measures 6,209 of 8,000). The hook README's "Blind spots, with their direction" gains the reader's: a raw HTML block (`<details>` with no blank line, a raw `<table>`) shows a span or fence as literal text and lets the dash through (a miss); the command string is shell source, so a backtick typed escaped inside a double-quoted `--body` reads as escaped (a refusal); a span across lines, a fence in a blockquote or a deep list, an indented block and an unclosed fence are refused though GitHub may render them as code (refusals).

## Evidence

- E1: the selftest red first, its new rows failing against a stub `proseOf` that returns its input (right shape, wrong behavior), then green; each mutation in the table red, committed first.
- E2: `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`, every row ok, the size rows and the two rootless rows included; `node --test test/repo/footgun-gate.test.ts test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts`.
- E3: `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`. No e2e: nothing a suite reads changes.
- E4: Gate 5 item 6, read as decision F1 rules, over the body and the diff; every hit named.
- E5: the PR body's own Guards table pastes red lines inside backticks only if they carry no U+2014: the hook enforcing this session is the launch checkout's, which still refuses the character everywhere until this merges.
- `vellum-guard-prover` one round; `vellum-pr-skeptic` cold, one round.
- Workflow step 14: the PR edits `.claude/agents/*.md`, so its body says which definition wrote the change (this lane, on main's definitions) and which reviewed it (main's, before this PR).

## Rosters and doctrine the change drags

- `test/repo/memory-pointers.test.ts` reads the agent and skill files this PR edits; none of the new wording names the memory store.
- Under F2 option 1, the new module joins the selftest's rootless copy (`cpSync` beside `footgun-gate.ts`), the README's "`npm run check` types both files" sentence, and the hooks README's file list; a hook whose static import fails exits non-zero, which Claude Code treats as a non-blocking error, so the rootless rows are what catch a missing copy.
- Issue #727 and this PR edit the same lines of `CLAUDE.md` and the agents; Issue #727 comment 5986868594 says whichever lands second merges the other's edits.
- `SKILL.md` and the Issue #728 lane: the second to merge takes `git merge origin/main`.

## Plan skeptic, on this plan (round 1 of the post-ruling plan)

Two BLOCKING, four SHOULD-FIX, six NIT; all folded, none rejected:

1. BLOCKING, this PR's own diff meets Gate 5 item 6 (its line holds the literal character), and whether the exemption reaches tracked files is unruled: decision F1.
2. BLOCKING, the hook is 393 lines and the reader cannot fit under the workspace's 400 without a new file: decision F2, with the rootless copy and the README sentence it drags.
3. SHOULD-FIX, the fence rule exempted prose GitHub renders as prose (a backtick in the info string; a four-space indent): both closed, each with a refused row.
4. SHOULD-FIX, a bare pipe inside a pasted red line splits the table cell: table rows split on unescaped pipes, the template says `\|`.
5. SHOULD-FIX, the backslash rule for a closing backtick: still closes, with a row.
6. SHOULD-FIX, blind spots unnamed and the hand-rolled reader unargued: the README edit names them with their direction, and the reader against a parser is decision F3.
7. to 12. NIT: the double-backtick fixture places the dash after the inner backtick; the template sentence names no issue number; the deny text quotes the line; Gate 1 item 9 stays and says why; `proseOf` exported only where a module needs it; the `grep commit` claim, the Gate 5 size and the launch checkout corrected.

## Open decisions (the menu)

**E. Commit messages.** The ruling lists them among the places the hook checks; the hook does not check them, and nothing else does (no git hook, no workflow).

1. **Recommended: the hook stays out of commit messages.** The written rule for them states the same exemption in words (`CLAUDE.md`, the implementer's line), unenforced, as today.
2. **The hook starts reading commit messages** (`-m` / `--message`, `-F` / `--file`, a heredoc fed to `-F -`) with the same reader: a new refusal on every commit the house makes.

**F1. Does the exemption reach files in the repo?** Gate 5 item 6 also greps "the diff", and its own line quotes the character inside backticks; the flake record asks for "the payload verbatim".

1. **Recommended: yes, read the same way.** In the diff and in the repo's markdown, U+2014 inside inline backticks or a fenced block is allowed and in prose is not; the gate's own line stays, and a flake row quotes a payload verbatim inside backticks. Code comments stay Issue #727's.
2. **No: files in the repo stay free of it entirely.** Gate 5 item 6 is reworded to name the character as U+2014, this PR's diff then removes one line carrying it, and a flake row keeps writing a payload's dash some other way.

**F2. Where the reader lives.** The hook is 393 lines; the workspace keeps a file under 400.

1. **Recommended: a new module beside the hook**, `.claude/skills/vellum-footguns/hooks/markdown-code.ts`, imported by the hook and copied into the selftest's rootless checkout.
2. **Inside `footgun-gate.ts`**, which then passes 400 lines (no lint reads `.claude/`).

**F3. Hand-rolled reader or a Markdown parser.** No parser is installed.

1. **Recommended: hand-rolled**, about forty lines with a fixture per arm, its blind spots named in the README, most erring toward a refusal.
2. **A GitHub-flavored parser as a dependency** (markdown-it or micromark), loaded only for a body write: fewer blind spots (raw HTML, lists), at the cost of a dependency in the hook and its load time on those calls.

## Calls made without a ruling

1. Each piece (the command, each body file) is read alone. Rule: "an unclosed fence opens no loophole"; joined pieces would let a fence in one close in another.
2. An inline span closes on its own line, or in its own table cell. Rule: the same; a red line is one line, and a span let run across lines would let one stray backtick exempt a paragraph. Errs toward refusing.
3. A tilde fence and a fence indented up to three spaces are fenced code blocks; an indented block with no fence, and a "fence" indented four spaces, are not. Rule: the ruling's words, "a fenced code block", as GitHub's Markdown reads them, capped where it would otherwise be a loophole.
4. `handbook/specs/rulebook.md` line 15 stays: it summarizes what `CLAUDE.md` holds and states no rule of its own.
5. `handbook/errata/README.md`'s "no em-dash" follows F1.
6. The five agents' "No em-dashes in anything you write" lines take the exemption: their reports are relayed into issue and PR comments, which the ruling covers.
