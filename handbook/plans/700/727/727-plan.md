# Issue #727 plan: an em-dash is allowed in any comment

**Planned at**: `origin/main` 88f3762d0705216ec7b0e67edf74def293bbd624, Issue #727 read with 2 comments (the 2026-10-05 supersession by Issue #644's ruling, and the 2026-10-20 delegation, https://github.com/ahl-gram/Vellum/issues/727#issuecomment-6282249989).

**Rulings**: none yet. The 2026-10-20 delegation comment above stands for this issue: any open decision is taken at its recommended option.

**Open decisions**: none.

## Specs

Read these before building, on top of what `CLAUDE.md`'s spec table owes for the work:

- `CLAUDE.md`, Process: the "No em-dashes" bullet (the rule's one normative home, edited here), the attribution bullet, and the "Comments are the exception" bullet.
- `handbook/specs/check-placement.md`, "The formatter" (run `npm run format` before committing) and "The lint" (a house rule lives in `scripts/lint/`, is wired in `eslint.config.ts` and is proven by a fixture test). The issue's acceptance item 2 is what asks for the rule removed with its wiring and its tests.
- `handbook/specs/conventions.md`, "Where a rule lives" (exactly one home is normative) and "How a spec, and the rest of the house's prose, is written" (`Issue #N` / `PR #N`, never bare; a backticked path in prose is scanned by `test/repo/prose-paths.test.ts`, so every backticked path you write must resolve).
- `handbook/specs/development-workflow.md`, steps 8 (archive the plan), 11 (the prover), 12 (the calls comment), 13 and 14 (the paragraph "An agent whose own DEFINITION this pull request changes cannot be trusted to review the change", which this pull request triggers).
- `handbook/specs/orchestration.md`, "Merging" (merge order between lanes), for the section "Shared files with Issue #829" below.
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 1 items 1, 6 and 9, and Gate 5 in full (items 5, 6, 8 and 9 apply).

## The design

Alex ruled on 2026-10-02 that an em-dash is allowed in any comment, in code and in stylesheets alike; the rule stays for issue bodies, PR bodies, issue and PR comments, commit messages and published copy, and Issue #644 (shipped) exempts text inside inline backticks or a fenced code block in those bodies. This pull request removes the comment half everywhere it is enforced or written, pins both halves of the permission with a test, and changes nothing else.

1. **The lint.** `vellum/css-comment-no-em-dash` goes: its definition `noEmDash` and its registration in the plugin's `rules` map in `scripts/lint/css-comment-form.ts`, its wiring in the stylesheet block of `eslint.config.ts`, its roster entry in `SHEET_RULES` in `test/repo/lint-wiring-rules.test.ts`, and its constant and expected row in `test/repo/css-comment-form.test.ts`. The plugin's other three rules (`css-comment-one-line`, `css-comment-issue-form`, `css-comment-no-js-module`) and its two exports (`bareNumbers`, `jsModuleNames`, which `scripts/lint/ts-comment-form.ts` imports) stay byte for byte. No other tracked check refuses an em-dash in a comment (recon and the plan skeptic, by `git grep` over `scripts/lint`, `eslint.config.ts`, `test-support`, `test/repo` and the hook).
2. **Both halves of the permission are pinned.** The stylesheet half: PLANT line 7 of `test/repo/css-comment-form.test.ts` (`"/* an em-dash \u2014 here */"`) stays in the fixture with no expected report, so any rule that starts refusing an em-dash in a stylesheet comment reds that test on line 7; no other row is renumbered. The code half: a new test in `test/repo/ts-comment-form.test.ts` lints a line, a block and a doc comment each carrying an em-dash, through the full config, at every TypeScript root's witness file, and expects no message at all.
3. **The written rule.** Every tracked instruction that forbids an em-dash in a comment is narrowed, with the replacement wording written out under Files: `CLAUDE.md` (the home, which also gains the explicit permission), `.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md` line 94, `vellum-footguns` Gate 5 item 6, and the "anything you write" line of each agent whose tools let it author code (`vellum-designer`, `vellum-planner`, `vellum-plate-reader`). Each narrowing removes the comment half and nothing more: the body, commit, published-copy and (in the implementer's line) code-string halves read as strongly after the edit as before.
4. **What stays, deliberately.** The footgun hook (`.claude/skills/vellum-footguns/hooks/`), its README and fixtures, `.github/PULL_REQUEST_TEMPLATE.md`, `handbook/specs/rulebook.md`'s summary ("no em-dashes"), `handbook/specs/orchestration.md`'s merge-body grep, `handbook/errata/README.md`'s row form, the published-copy tests (`test/render/og-card.test.ts`, `test/render/voyage.test.ts`, `test/world/voyage-log.test.ts`, `test/print-room/rasterize.test.ts`, `test/society/philology-lexicon.test.ts`) and the four read-only agents' "anything you write" lines are not touched.

### Alternatives rejected

- **Delete the PLANT's em-dash line.** Rejected: every later expected row (lines 8 to 21) would renumber, a bigger diff, and the fixture would lose the line that pins the stylesheet half.
- **Replace the PLANT's em-dash line with a neutral comment.** Rejected for the same reason.
- **Leave the rule's definition in `scripts/lint/css-comment-form.ts` and only unwire it.** Rejected: an unwired rule is dead code (Gate 5 item 1), and acceptance item 2 asks for the rule removed with its wiring and tests.
- **Pin only the stylesheet half.** Rejected: the ruling covers code and stylesheets alike, and Gate 1 item 6 asks for the class guarded, not the one instance where a rule happened to exist.
- **Only drop "or new code comments" from `CLAUDE.md`, with no permission clause.** Rejected: the narrowed copies state the permission, so the one normative home states it too; and the same sentence keeps "issue and PR comments" forbidden, so naming the code comment kind keeps the two kinds of comment apart.
- **Drop "code" from `vellum-implementer`'s line outright.** Rejected: it would also allow an em-dash in a string in code that is not published copy (a test name, an assertion message), which the issue never ruled and which Gate 5 item 6's grep over the diff still refuses. The line keeps "code other than a comment".
- **Narrow all eight agent "no em-dash" lines uniformly.** Rejected: the four agents whose tools are `Bash, Read, Glob, Grep` (`vellum-guard-prover`, `vellum-plan-skeptic`, `vellum-pr-skeptic`, `vellum-spec-recon`) author no code, so their line governs their reports and scratch, which is what the issue's "Not in scope" says of them.
- **Leave every "anything you write" line alone, as the issue's "Not in scope" suggests.** Rejected for the three agents that can author code (`vellum-designer` writes mock code that a round archives under `design/`, `vellum-plate-reader` writes probes into `out/`, `vellum-planner` writes the step 6 spike): read literally, their line forbids what acceptance item 1 says no tracked instruction may forbid.
- **Rewrite Gate 5 item 6 to grep "the body, the commit messages and the diff's markdown and published copy".** Rejected: it widens the item (commit messages are not in it today) and reaches past this issue; the narrowing below exempts only the comment kind.
- **Skip the guard prover, since the pull request removes a rule.** Rejected: the clean row 7 is a strengthened pin, the TypeScript test is a new guard, and the 2026-10-20 delegation relay names the guard prover in this pull request's path.

## Files

Every path is repo-relative. No file is created except the archived plan. Line numbers are at the planned-at sha; the quoted old text is what to match.

### `handbook/plans/727/727-plan.md` (created)

This plan, copied unchanged from the scratchpad (workflow step 8).

### `test/repo/css-comment-form.test.ts` (edited, 88 to 86 lines)

- Delete line 11: `const NO_EM_DASH = "vellum/css-comment-no-em-dash";` (left in place it reds `@typescript-eslint/no-unused-vars`).
- Delete line 50: `    [NO_EM_DASH, 7],` inside the first test's expected list.
- Leave line 28 (`"/* an em-dash \u2014 here */",`, written with the six-character escape, not the character) and every other line exactly as it is.

### `test/repo/lint-wiring-rules.test.ts` (edited, 333 to 332 lines)

- Delete line 67: `  "vellum/css-comment-no-em-dash": [2],` from `SHEET_RULES`. Nothing else.

### `test/repo/ts-comment-form.test.ts` (edited, 376 to 391 lines)

Insert, between line 155 (`});`, which ends the test "the two comment rules and the escape twin reach every TypeScript root the lint reads, and the sheets carry the CSS siblings instead (Issue #675)") and line 157 (`const RULEBOOK = "handbook/specs/rulebook.md";`), this test, with one blank line on each side of it:

```ts
test("a line, block or doc comment on any TypeScript root may carry an em-dash (Issue #727)", async () => {
  const dash = String.fromCharCode(0x2014);
  const text = [
    `// a line comment ${dash} here`,
    `/* a block comment ${dash} here */`,
    `/** a doc comment ${dash} here */`,
    "export {};",
    "",
  ].join("\n");
  for (const file of Object.values(ROOT_WITNESSES)) {
    const [result] = await eslint.lintText(text, { filePath: join(ROOT, file) });
    assert.deepEqual(result!.messages, [], `${file}: an em-dash in a comment is reported`);
  }
});
```

`ROOT_WITNESSES` (line 127), `eslint` (line 13), `ROOT` (line 12), `join` and `assert` are already in the file; no import changes. Measured by this plan's probe at the planned-at sha: that text lints with no message at each of the five witnesses (`e2e/harness.ts`, `scripts/build-app-bundles.ts`, `src/cli/main.ts`, `test/repo/lint-wiring.test.ts`, `test-support/element-shim.ts`), and with a rule refusing an em-dash in a comment wired over `**/*.ts` (the control) it reports lines 1, 2 and 3.

### `scripts/lint/css-comment-form.ts` (edited, 96 to 82 lines)

- Delete lines 36 to 48: the whole `const noEmDash: CSSRuleDefinition = { ... };` block (lines 36 to 47) and the blank line after it (48). Line 34 (`};`, the end of `oneLine`) is then followed by one blank line and `const issueForm`.
- Delete line 92: `    "css-comment-no-em-dash": noEmDash,` from the default export's `rules` map.
- After the edit the default export is `{ meta: { name: "vellum" }, rules: { "css-comment-one-line": oneLine, "css-comment-issue-form": issueForm, "css-comment-no-js-module": noJsModule } }`, in that order. `bareNumbers(text: string): string[]` and `jsModuleNames(text: string): string[]` are unchanged. The head comment on line 1 is unchanged.

### `eslint.config.ts` (edited, 260 to 259 lines)

- Delete line 108: `      "vellum/css-comment-no-em-dash": "error",` in the block named "the house's rules on every stylesheet". Nothing else; the `vellum` plugin object on line 31 spreads `cssCommentForm.rules` and needs no edit.

### `CLAUDE.md` (edited, one line longer)

Replace these two lines of the Process bullet (lines 207 and 208):

```
- **No em-dashes** in issue bodies, PR bodies, issue and PR comments, commit messages, published copy
  or new code comments. In an issue or PR body or comment, a commit message or the repo's markdown,
```

with these three:

```
- **No em-dashes** in issue bodies, PR bodies, issue and PR comments, commit messages or published
  copy; a comment in code or a stylesheet may carry one (Issue #727). In an issue or PR body or
  comment, a commit message or the repo's markdown,
```

The bullet's remaining lines (from `  one inside inline backticks or a fenced code block is code, not prose, and stands: that is how a` on) stay exactly as they are; do not rewrap them.

### `.claude/agents/vellum-implementer.md` (edited, line 63)

Replace the line's first sentence:

```
No em-dashes anywhere: code, comments, commit messages, PR body, issue comments. In a commit message,
```

with:

```
No em-dashes in code other than a comment, commit messages, issue and PR bodies, issue and PR comments, or published copy; a comment in code or a stylesheet may carry one, as `CLAUDE.md`'s Process section says. In a commit message,
```

The rest of line 63 is unchanged.

### `.claude/agents/vellum-pr-skeptic.md` (edited, line 94)

Replace:

```
No em-dashes in the PR body's prose or in new code comments; one inside inline backticks or a fenced code block in the body, such as a pasted red line, stands.
```

with:

```
No em-dashes in the PR body's prose; one inside inline backticks or a fenced code block in the body, such as a pasted red line, stands, and one in a comment in code or a stylesheet is not a finding.
```

Line 117 of the same file is not touched.

### `.claude/agents/vellum-designer.md` (edited, line 109)

Replace:

```
- No em-dashes in anything you write, except inside inline backticks or a fenced code block.
```

with:

```
- No em-dashes in anything you write, except inside inline backticks or a fenced code block, or in a comment in code or a stylesheet.
```

### `.claude/agents/vellum-plate-reader.md` (edited, line 68)

Replace:

```
No em-dashes in anything you write, except inside inline backticks or a fenced code block.
```

with:

```
No em-dashes in anything you write, except inside inline backticks or a fenced code block, or in a comment in code or a stylesheet.
```

### `.claude/agents/vellum-planner.md` (edited, line 72)

Replace the line's last sentence:

```
No em-dashes anywhere you write, except inside inline backticks or a fenced code block.
```

with:

```
No em-dashes anywhere you write, except inside inline backticks or a fenced code block, or in a comment in code or a stylesheet.
```

### `.claude/skills/vellum-footguns/SKILL.md` (edited, Gate 5 item 6, one line longer)

Replace (lines 264 and 265):

```
6. `grep -n '—'` over the body and the diff finds nothing outside inline backticks or a fenced code
   block (Issue #644): a pasted red line keeps its own inside code.
```

with:

```
6. `grep -n '—'` over the body and the diff finds nothing outside inline backticks, a fenced code
   block or a comment in code or a stylesheet (Issue #644, Issue #727): a pasted red line keeps its
   own inside code.
```

Line 352 (the Never list's PR-body item) is not touched. The footgun hook shows gate text from the launch checkout, so this edit is enforced from the merge on; expected.

### Files that must not change

`.claude/skills/vellum-footguns/hooks/` (every file), `.github/PULL_REQUEST_TEMPLATE.md`, `handbook/specs/` (every file), `handbook/errata/`, `.claude/agents/vellum-guard-prover.md`, `.claude/agents/vellum-plan-skeptic.md`, `.claude/agents/vellum-spec-recon.md`, `scripts/lint/ts-comment-form.ts`, `scripts/proof-runner/outcome.ts`, `e2e/harness.ts`, and every published-copy test named under The design, item 4.

## Tests, in the order they are written

**T1.** `test/repo/css-comment-form.test.ts`, test "the comment-form rules red on exactly the planted lines and nowhere else".
- Edit: the two deletions under Files.
- Assertion: `assert.deepEqual(await lintSheet(PLANT), [...])` with exactly these eight rows: `[ONE_LINE, 4]`, `[ISSUE_FORM, 8]`, `[ISSUE_FORM, 14]`, `[ISSUE_FORM, 15]`, `[ISSUE_FORM, 16]`, `[ISSUE_FORM, 17]`, `[ISSUE_FORM, 18]`, `[NO_JS_MODULE, 21]`.
- Red at commit 1, with no stub: the code before the removal is the wrong behavior (the rule still wired), so the actual list carries an extra `["vellum/css-comment-no-em-dash", 7]` and the `deepEqual` fails on it. Measured by this plan's probe: with the rule switched off the PLANT yields exactly the eight rows above; with it on, those eight plus `["vellum/css-comment-no-em-dash", 7]`.
- Mutation once green (prover row P1): in `scripts/lint/css-comment-form.ts`, on the line holding `if (bareNumbers(c.value).length > 0) context.report({ loc: c.loc, messageId: "bare" });` (line 45 after commit 2), replace `bareNumbers(c.value).length > 0` with `bareNumbers(c.value).length > 0 || c.value.includes(String.fromCharCode(0x2014))`. Expected red: T1 alone, with an extra `["vellum/css-comment-issue-form", 7]`.

**T2.** `test/repo/lint-wiring-rules.test.ts`, test "through ESLint itself, one witness file per ruled glob resolves to rules that reach it, and the root config resolves to none".
- Edit: the one deletion under Files.
- Assertion: `pinCss`'s last `assert.deepEqual`, the sorted set of rules resolving at a non-zero severity on `src/styles/shared/house.css` against the sorted keys of `SHEET_RULES` (18 after the edit).
- Red at commit 1, with no stub: the witness still resolves `vellum/css-comment-no-em-dash` (19 rules), so that assertion fails with the message "src/styles/shared/house.css: a rule off the stylesheet block's ruled set reaches the sheets, or a ruled one does not (Issue #648, Issue #675, Issue #763, Issue #779)". Measured by this plan's probe: 19 non-zero rules on the witness today, including the em-dash rule; 18 without it.
- Mutation once green (prover row P2, two by-line edits in one row): in `scripts/lint/css-comment-form.ts` replace `"css-comment-one-line": oneLine,` with `"css-comment-one-line": oneLine, "css-comment-no-em-dash": noJsModule,`, and in `eslint.config.ts` replace `"vellum/css-comment-one-line": "error",` with `"vellum/css-comment-one-line": "error", "vellum/css-comment-no-em-dash": "error",`. Expected reds: T2, on the same assertion, and T1, with an extra `["vellum/css-comment-no-em-dash", 21]`. `test/repo/css-beyond-sheets.test.ts` stays green, because the CSS the TypeScript builds already passes `css-comment-no-js-module` with no excusal (a copy of `oneLine` would red it, which is why the row uses `noJsModule`).

**T3.** `test/repo/ts-comment-form.test.ts`, test "a line, block or doc comment on any TypeScript root may carry an em-dash (Issue #727)".
- Edit: the insertion under Files.
- Assertion: for each of the five `ROOT_WITNESSES`, `assert.deepEqual(result!.messages, [], ...)`.
- Red first is not feasible: no rule refuses an em-dash in a TypeScript comment today, so the test is green when written. Its bite rests on prover row P3, and the PR body says so.
- Mutation once green (prover row P3): in `scripts/lint/ts-comment-form.ts`, on line 33 (`          if (numbers.length > 0)`), replace `numbers.length > 0` with `numbers.length > 0 || comment.value.includes(String.fromCharCode(0x2014))`. Expected red: T3 alone, at its first witness (`e2e/harness.ts`), with messages on lines 1, 2 and 3. No tracked TypeScript comment carries an em-dash (plan skeptic, `git grep`), so nothing else reds.

**Who proves what.** `vellum-guard-prover` owes rows P1, P2 and P3, one round, after commit 3 is pushed. The red of T1 and T2 at commit 1 is also pasted into the PR body's guard table. Step 15 leaves nothing else to the implementer to prove unless a finding changes a guard.

## Order of commits

Branch: `git branch -m chore/727-comment-em-dash` before the first commit. Run `npm run format` before each commit (`handbook/specs/check-placement.md`, The formatter).

1. `#727 The plan is archived, and the stylesheet comment tests expect no em-dash rule (red)`: `handbook/plans/727/727-plan.md`, `test/repo/css-comment-form.test.ts`, `test/repo/lint-wiring-rules.test.ts`. Before committing, run `node --test test/repo/css-comment-form.test.ts test/repo/lint-wiring-rules.test.ts` and keep the output: two tests fail (its summary line reads `ℹ fail 2`), and they are T1 and T2, on the assertions named above. Push at this commit (`git push -u origin chore/727-comment-em-dash`); CI is red on this commit by design.
2. `#727 The stylesheet lint stops refusing an em-dash in a comment, and a TypeScript comment is pinned free to carry one`: `scripts/lint/css-comment-form.ts`, `eslint.config.ts`, `test/repo/ts-comment-form.test.ts`. Then `node --test test/repo/css-comment-form.test.ts test/repo/lint-wiring-rules.test.ts test/repo/ts-comment-form.test.ts` fails nothing (`ℹ fail 0`), and `npm run lint` is green.
3. `#727 No instruction forbids an em-dash in a comment`: `CLAUDE.md`, `.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md`, `.claude/agents/vellum-designer.md`, `.claude/agents/vellum-plate-reader.md`, `.claude/agents/vellum-planner.md`, `.claude/skills/vellum-footguns/SKILL.md`.

Each commit message ends with the three-line trailer `CLAUDE.md`'s attribution bullet gives, the session link being https://claude.ai/code/session_01BgTFp5UjwBv9fUKbQNvhjq.

## Rosters and doctrine

Lists this change leaves (each loses one member):

- the `rules` map of the default export of `scripts/lint/css-comment-form.ts`;
- the rules of the block "the house's rules on every stylesheet" in `eslint.config.ts`;
- `SHEET_RULES` in `test/repo/lint-wiring-rules.test.ts`, which `pinCss` holds equal to that block in both directions, so these two must change in the same pull request (they do: commits 1 and 2);
- the rule constants and expected rows of `test/repo/css-comment-form.test.ts`.

Nothing joins a roster. T3 iterates `ROOT_WITNESSES`, which the test "the two comment rules and the escape twin reach every TypeScript root..." already holds equal to the lint's TypeScript roots, so a new root reaches T3 without an edit here.

Doctrine it contradicts, with the replacement wording under Files: `CLAUDE.md` Process (the home), `.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md` line 94, `.claude/skills/vellum-footguns/SKILL.md` Gate 5 item 6, and the "anything you write" lines of `.claude/agents/vellum-designer.md`, `.claude/agents/vellum-plate-reader.md` and `.claude/agents/vellum-planner.md`. No spec under `handbook/specs/` states the comment half (recon: zero hits), so none is edited.

## Shared files with Issue #829, and merge order

A parallel lane builds Issue #829 (a founding-modules lint rule). Both pull requests edit two files, in hunks that do not touch:

- `eslint.config.ts`: this one deletes line 108 inside the stylesheet block; Issue #829 adds a block near the `vellum/philology-no-entropy` block (line 173).
- `test/repo/lint-wiring-rules.test.ts`: this one deletes line 67 inside `SHEET_RULES`; Issue #829 adds an entry elsewhere.

No merge order is required. Whichever pull request lands second brings its branch current with `git merge origin/main` (never a rebase, workflow step 10), keeps both sides' edits, re-runs `npm run check`, `npm run lint` and `node --test test/repo/css-comment-form.test.ts test/repo/lint-wiring-rules.test.ts test/repo/ts-comment-form.test.ts`, then `npm test`, and pushes. If both are ready at the same moment, the lower-numbered pull request merges first (Gate 5 item 9). Keep this pull request's hunks to the lines named under Files. Issue #829's real hunks are UNVERIFIABLE until that lane pushes.

## Evidence

The commands, each with the output that says the acceptance holds:

1. `node --test test/repo/css-comment-form.test.ts test/repo/lint-wiring-rules.test.ts`: two failures (T1, T2; `ℹ fail 2`) at commit 1. With `test/repo/ts-comment-form.test.ts` added to the same command, no failure (`ℹ fail 0`) at commit 2.
2. `npm run check`, `npm run lint`, `npm run format:check`, then `npm test` and afterwards `npm run astro:generate`: all green at commit 3. `npm run format:check` is expected green, since the code edits are deletions and one test written in the layout Prettier gives it; a red from it after `npm run format` has run is a stop condition. Acceptance item 4.
3. `git grep -n -E "css-comment-no-em-dash|noEmDash|NO_EM_DASH" -- ':!handbook/plans'` prints nothing. Acceptance item 2.
4. `git grep -n -i -E "new code comments|anywhere: code" -- ':!handbook/plans'` prints nothing, and `git grep -n -c "or in a comment in code or a stylesheet" -- .claude/agents` prints exactly `.claude/agents/vellum-designer.md:1`, `.claude/agents/vellum-planner.md:1` and `.claude/agents/vellum-plate-reader.md:1`. Acceptance item 1.
5. `git diff --stat origin/main...HEAD -- .claude/skills/vellum-footguns/hooks .github` prints nothing, and `test/repo/footgun-gate.test.ts` passes inside `npm test`. Acceptance item 3 (the body refusal as Issue #644 shipped it).
6. E2E suites touched: none. Run none locally; CI runs every lane.
7. `vellum-plate-reader`: not owed (no presentation change).
8. `vellum-guard-prover`: rows P1, P2 and P3 above, one round.

The PR body:

- Title `#727 An em-dash is allowed in any comment, and the stylesheet lint stops refusing one`; closing line `Closes #727`, checked with `gh pr view <N> --json closingIssuesReferences`.
- The opening paragraph names, flagged as not in the issue's list: Gate 5 item 6, the three agents' "anything you write" lines, the permission clause in `CLAUDE.md`, the implementer line's rewording (it now names issue bodies, PR comments and published copy, and keeps code other than a comment), and the TypeScript test T3.
- The guard table carries T1 and T2 with the red lines from commit 1 and their prover rows, and T3 with its prover row, saying red first was not feasible because the behavior it pins already held.
- It carries this sentence, for workflow step 14: "This pull request edits `.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md`, `.claude/agents/vellum-designer.md`, `.claude/agents/vellum-plate-reader.md` and `.claude/agents/vellum-planner.md`. It was written by `vellum-implementer` and reviewed by `vellum-pr-skeptic`, each dispatched while main still held the old definitions; which definition a dispatched agent loads is UNVERIFIABLE, so the skeptic's report is not evidence that the new wording works."
- Records: plan skeptic ran at step 4 with the recon ledger; guard prover as above; plate reader not owed; the pr-skeptic's ledger.
- Rulings: the calls comment of step 12, and the delegation comment linked under Planned at.
- "Look for these when you use it": none, no feel-dependent choice.

## Calls made

Each decision the issue did not rule on, with its rule. The implementer copies these into the step 12 comment.

1. **Gate 5 item 6 is narrowed**, though the issue does not list it. Rule: acceptance item 1 ("no tracked instruction forbids an em-dash in a comment"), and the item's `grep` over "the diff" refuses an em-dash in a code comment the diff adds.
2. **The "anything you write" line is narrowed for `vellum-designer`, `vellum-planner` and `vellum-plate-reader`, and kept for `vellum-guard-prover`, `vellum-plan-skeptic`, `vellum-pr-skeptic` (line 117) and `vellum-spec-recon`.** Rule: the issue leaves it to the plan; an agent whose tools let it author code (Write or Edit in its frontmatter, or every tool) can write a comment the line would forbid, while the four agents whose tools are `Bash, Read, Glob, Grep` write only reports and scratch, which is the issue's own reading of these lines.
3. **`vellum-implementer`'s line removes only "comments"**: it keeps "code other than a comment", names the full list `CLAUDE.md` gives (adding issue bodies, PR comments and published copy), and points at `CLAUDE.md` for the permission. Rule: the issue's scope is the comment half alone; Gate 5 item 6 still greps the diff for an em-dash in a code string, so the two stay in agreement; and `handbook/specs/conventions.md`, "Where a rule lives", has a copy point at the one home.
4. **`CLAUDE.md` gains "a comment in code or a stylesheet may carry one (Issue #727)" rather than only losing "or new code comments".** Rule: the narrowed copies state the permission, so the home does too; and the sentence still forbids "issue and PR comments", so naming the code comment kind keeps the two apart.
5. **PLANT line 7 stays as a clean row; nothing is renumbered.** Rule: the comment doctrine (the test is the record), and the PLANT's own head comment ("a rule that starts firing on one of them reds on a line that was clean").
6. **T3 is added: a TypeScript comment carrying an em-dash lints clean on every root.** Rule: Gate 1 item 6 (guard the class; the ruling covers code and stylesheets alike, and T1 pins only the stylesheet half). Red first is not feasible since nothing refuses one today; its bite is prover row P3, stated in the PR body as the testing rule's transparency clause asks.
7. **The guard prover runs rows P1, P2 and P3; P2 re-registers `noJsModule`, not `oneLine`, under the removed name.** Rule: workflow step 11 (row 7 is a strengthened pin, T3 a new guard) and the 2026-10-20 delegation relay; `noJsModule` keeps `test/repo/css-beyond-sheets.test.ts` green, so the row's reds are exactly the ones it names.
8. **Everything listed under "Files that must not change" stays.** Rule: the issue body (the rulebook summary stays true) and acceptance item 3 (the body, commit and published-copy rule and the hook's refusal unchanged).
9. **Branch `chore/727-comment-em-dash`, three commits as ordered above.** Rule: `.claude/agents/vellum-implementer.md` (`chore` for a change to tooling and instructions; no product behavior moves).
10. **No merge order against Issue #829.** Rule: the hunks are disjoint; Gate 5 item 9's lower-number-first applies only as a tie-break.

## Open decisions

none

## Stop conditions

Hand back, with the command and its output, when:

1. `git diff --stat 88f3762d origin/main -- scripts/lint/css-comment-form.ts scripts/lint/ts-comment-form.ts eslint.config.ts test/repo/css-comment-form.test.ts test/repo/lint-wiring-rules.test.ts test/repo/ts-comment-form.test.ts` prints anything, UNLESS every commit that `git log --oneline 88f3762d..origin/main -- eslint.config.ts test/repo/lint-wiring-rules.test.ts` lists has a subject starting `#829`, none of the other four files moved, and every line this plan deletes is still present verbatim; then build on main as it stands.
2. `git grep -n "css-comment-no-em-dash" -- ':!handbook/plans'` before the first edit lists anything beyond `eslint.config.ts:108`, `scripts/lint/css-comment-form.ts:92`, `test/repo/css-comment-form.test.ts:11` and `test/repo/lint-wiring-rules.test.ts:67` (a disable directive in a sheet, for one, makes ESLint throw once the rule is gone).
3. The red run at commit 1 does not show exactly T1 and T2 failing, or either fails on anything but the assertion named under Tests (a thrown config error, a missing module, a different message).
4. T3 fails at commit 2 (the probe says it passes; a failure means a rule this plan does not know of refuses an em-dash, or the witness text draws another rule).
5. Any quoted old text under Files is not present verbatim in its file.
6. After commit 2 or 3, a check, lint, format or unit red appears in a file this plan does not name, or `npm run format:check` is red after `npm run format` has run.
7. `wc -l scripts/lint/css-comment-form.ts` is not 82 after commit 2, or `wc -l test/repo/ts-comment-form.test.ts` is over 399.
8. Prover row P1, P2 or P3 does not red exactly the tests it names.
9. Issue #727 carries a comment newer than the 2 counted at Planned at, other than the dispatcher's plan archive (its first line begins `Plan archive, not a ruling:`).
