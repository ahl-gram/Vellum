# Issue #675 plan, PR 2: the `Issue #N` / `PR #N` rule on code comments, and the sweep

Written 2026-10-02 against origin/main `ed4c1d3`, after `vellum-spec-recon` (ledger beside this file as `675b-recon-ledger.md`) and `vellum-plan-skeptic` (its findings folded in below, with the ones rejected named). Supersedes the unreviewed draft posted as issuecomment-5963118287, whose figures were at `9ae9a20`. Archived as `handbook/plans/675/675-pr2-plan.md` with this pull request's first commit, with Alex's rulings on decisions A and B (2026-10-02, relayed by the orchestrator) filled in.

## What the rulings ask

- Decision 2 (issuecomment-5959995543): enforce `Issue #N` / `PR #N` on code comments and fix the existing hits in the same pull request; no em-dash rule for code comments.
- Ruling 1 (issuecomment-5960879409): this is PR 2, the rule `vellum/ts-comment-issue-form` and the rewrite of the existing bare numbers; it starts after the Issue #706 and Issue #708 pull requests merge (both merged: PR #730 `a4edabd`, PR #732 `ed4c1d3`), and it is the pull request that closes Issue #675.
- Ruling 4: the rule lives in `scripts/lint/ts-comment-form.ts`, its fixtures and reach check in `test/repo/ts-comment-form.test.ts`; `test/repo/lint-wiring.test.ts` is not split.
- From the dispatcher: Issue #727 (dropping the em-dash comment rules) comes after this pull request, so `vellum/css-comment-no-em-dash` is left alone (Issue #727's own body sequences it after this work too); Issue #621 edits the e2e harness in parallel and merges first, and this branch takes main again afterwards.

## Measured at `ed4c1d3` (2026-10-02)

Probe: `out/675b-hits.ts` (this tree, `git ls-files` over the five roots plus `astro.config.ts`, each file through ESLint with the typescript-eslint parser, every comment from `getAllComments()`, whitespace collapsed, `BARE_NUMBER` made global). Kinds: `gh api 'repos/ahl-gram/Vellum/issues?state=all&per_page=100' --paginate` into `out/675b-kinds.tsv`, 733 numbers, highest 733, no gaps; `out/675b-classify.ts` joins them. Recon reproduced every five-root figure with an independent probe (typescript-estree directly), and calibrated it against the draft's `9ae9a20` figures exactly.

- 598 bare `#N` in 465 comments across 264 of 687 linted `.ts` files; by root (comments): e2e 145, test 168, src 134, scripts 17, test-support 1; 168 distinct numbers. `astro.config.ts`, outside the lint, adds 2 in 2 comments (Issue #204, Issue #202).
- Of the 598: 587 name an issue (160 distinct), 7 name a pull request (PR #481, PR #482, PR #631, PR #635, each a review), 4 are not references: `#888` in `test/render/field.test.ts` (a hex colour), and `#333`, `page.html#12`, `&#8212;` in the comment above `BARE_NUMBER` in `scripts/lint/css-comment-form.ts` (it names the regex's false reds by example). `#12` and `#333` are real issue numbers, so a lookup alone would rewrite them wrongly. The plan skeptic fetched the titles of Issue #9, Issue #40, Issue #49, Issue #53, Issue #54, Issue #78 and Issue #93 (the small numbers) and each matches its comment.
- Grammar: 63 sites are a continuation after another number (34 after a comma, 8 after and/or, 17 in slash chains such as `#133/#134/#135`), 3 hyphen ranges (`#455-#470`, `#396-#398`, `pre-#260`) and one `#53<->#54` pair. No "PRs #N", no "Issue#N" with the space missing, no multi-line block comment, no `//` line ending in Issue or PR with the number on the next line, no `owner/repo#N`.
- 60 numbers in comments already carry the word, none with the wrong kind. 1181 bare numbers sit in strings (768 in test titles), out of scope by the ruling, as the open `handbook/errata/guards.md` PR #625 row ("Code strings are outside the naming rule") already records.
- Outside the lint's reach: `astro.config.ts` (above), `design/` round tools (4 in 3 comments, an archive kept as it ran), the hooks under `.claude/` (none), and `.astro` pages (21 comment lines in 15 files).

## Alex's rulings at the STOP (2026-10-02, relayed by the orchestrator)

- **A: A1.** Every number gets its own word ("Issue #133/Issue #134/Issue #135"); the 63 list sites are swept; the shared matcher keeps flagging an unworded number in a list. (A2, one word covering a list, was not taken.)
- **B: B1.** "PRs" is accepted as the plural, in both the stylesheet rule and the new rule; the comment above `BARE_NUMBER` is made true to that, and the fixture added. (B2, leaving it flagged as an errata row, was not taken.)

## Design

**The rule.** `vellum/ts-comment-issue-form` in `scripts/lint/ts-comment-form.ts`: on `Program`, for every comment from `context.sourceCode.getAllComments()` (line, block and doc comments, trailing ones included), report once per comment whose whitespace-collapsed text holds a bare number, naming every bare number in the message: `a comment names {{numbers}} bare: write Issue #N or PR #N, never a bare #N (Issue #675)`.

**One matcher, shared.** `scripts/lint/css-comment-form.ts` exports `bareNumbers(text: string): string[]` (whitespace collapsed, then every match), the way it exports `jsModuleNames` for PR 1's `.js` rule, and `BARE_NUMBER` gains the `g` flag with `bareNumbers` its only reader (a global regex is stateful under `.test` and `.exec`). `vellum/css-comment-issue-form` calls `bareNumbers(c.value).length > 0` instead of `BARE_NUMBER.test(...)`, the same verdict, which `test/repo/css-comment-form.test.ts` proves unchanged. By rulings A1 and B1 the lookbehind becomes `(?<!\b(?:issue|issues|pr|prs) )`, a widening of the sheets' rule by that one word, with a CSS fixture (`/* PRs #23 */` clean) beside the existing `Issues #17`; a continuation stays flagged.

**The comment above `BARE_NUMBER`** is rewritten in the sweep commit as a named hand edit, comment-only: its three examples become words ("an all-digit hex colour, digits after a word and a hash as in a page fragment, an HTML numeric entity"), and its claim "(either case, singular or plural)", false of "pr" on `ed4c1d3`, becomes true when commit 2 adds `prs` by ruling B1.

**Wiring.** `"vellum/ts-comment-issue-form": "error"` joins the block "Issue #675: the house's rules on every TypeScript root" in `eslint.config.ts` (files `TS_ROOTS`), beside `vellum/ts-comment-no-js-module`.

**The sweep.** A scratch script (`out/675b-sweep.ts`, never committed) reads each comment's range from the parser (never a line regex), finds every bare match on the RAW comment text, asserts the raw matches equal the collapsed ones per comment, that no letter stands directly before the `#`, and that every number is on GitHub, and inserts `Issue ` or `PR ` before each `#`, by GitHub's kind for that number. Over the five roots and `astro.config.ts`. The result is a pure insertion everywhere except the two hand edits, each named exactly (file, old comment, new comment) in `out/675b-hand-edits.json` and applied by exact text:
- `test/render/field.test.ts`: "Ink's realmTints are 3-digit (#888)" becomes "Ink's realmTints are 3-digit hex shorthand".
- `scripts/lint/css-comment-form.ts`, the comment above `BARE_NUMBER`, as above.
Continuations, ranges and the `<->` pair take the word before every number by plain insertion (`Issue #133/Issue #134`, `Issue #455-Issue #470`, `pre-Issue #260`, `Issue #53<->Issue #54`); no other rewording. Dry run at `ed4c1d3` (five roots): 594 insertions (587 Issue, 7 PR) in 464 comments across 263 files, the 63 continuation sites included by ruling A1.

**The proof that the sweep changed no code** (`out/675b-token-proof.ts`, never committed, posted in a PR comment with its output and the kinds table per workflow step 10): per changed `.ts` file against the sweep's parent,
1. the token stream: `ts.createSourceFile` and a leaf walk over `getChildren`, the JSDoc kind range (`FirstJSDocNode` to `LastJSDocNode`) excluded, per `handbook/specs/conventions.md` "The comment sweep";
2. the text outside comments, whitespace included, byte-identical (comments replaced by a placeholder), and each comment equal to its base once every `Issue ` / `PR ` before a `#<digits>` is removed from both, except the named hand edits, matched on the exact old and new comment text, and every named hand edit found;
3. every `Issue #N` / `PR #N` in a comment that was not there before agrees with GitHub's kind for N;
4. the inserted words, as a multiset of (file, number), equal the audited hit list (`out/675b-hits.tsv`) less the four named non-references, so a word set before a colour (`#1a2b3c`) or a non-reference (`#333`), or a reference left bare, reds. (Plan skeptic finding 3: arms 2 and 3 alone passed `// the grey Issue #333` and `// the ink Issue #1a2b3c`.)
The verifier is proved first on fixtures (`out/675b-token-proof-fixtures.ts`, green at this writing): a changed identifier, string, regular-expression body, template literal, object value, a dropped default argument and a dropped type annotation each red arm 1; a reworded comment, a changed number, a reworded doc block and a deleted comment each red arm 2; whitespace changed outside a comment reds arm 2's outside check; a hand edit named for another file, or a second edit in a hand-edited file, reds; a wrong word in a line, doc, wrapped block and trailing comment each red arm 3; a string is never read as a comment; a word before `#333` or `#1a2b3c` is counted as an insertion, an already worded number's second occurrence is counted, and an unaudited insertion or an audited hit left bare reds arm 4. Its comment reader is cross-checked against the ESLint parser over the whole tree: 2546 comments in 687 files, every start offset identical (`out/675b-comment-coverage.ts`). Its blind spot: none known inside a comment, since reindentation there reads as a comment change and reds (the safe direction); outside, reindentation reds the byte check too.

## Commits

1. **The plan and the sweep, comment-only.** `handbook/plans/675/675-pr2-plan.md` plus the rewritten comments. Proved against its parent `ed4c1d3` by the verifier with all four arms (zero failures); `npm run check`, `npm run lint` and `npm test` on this commit alone, since some tests read source text. Pushed.
2. **The rule.** `bareNumbers` exported, the regex as ruled, `vellum/ts-comment-issue-form`, its wiring, the fixtures and the reach pin. Built test-first: the rule stubbed with the right shape and no reports, the fixture test run red on its assertion (pasted into the PR body), then implemented.
3. **Doctrine and errata.**

## Tests, each with the mutation that reds it

In `test/repo/ts-comment-form.test.ts`, one new test, linting a planted file at `src/cli/main.ts` through the real config and asserting the exact `[line, numbers]` list, each form in its own comment so a rule that starts firing on one reds on a line that was clean:
- reports: a line comment (`// fixed in #12`), a block comment (`/* see #16 */`), a doc comment (`/** cites #20 */`), a trailing comment (`export const a = 1; // #19`), a comment carrying two bare numbers (`// #30 and #31`, both named, plan skeptic finding 5), `// Issue#18`, `// a reissue #22`, and the false reds, each declared at the assertion with its direction (toward failing): an all-digit colour (`// the grey #123456`), a fragment (`// page.html#12`), an entity (`// &#8212;`), a field label (`// Issue: #32`), another repository's number (`// owner/repo#33`), a doc block wrapped between the word and the number with its `*` leader (`/**\n * Issue\n * #24\n */`), and a run of line comments wrapped the same way (`// Issue` then `// #25`) (plan skeptic finding 7), and a continuation (`// Issue #133/#134` reports `#134` only, ruling A1).
- clean: `// Issue #13`, `// PR #14`, `// issue #15`, `// pr #16`, `// Issues #17`, a block wrapped between the word and the number with no leader (`/* Issue\n   #26 */`), a colour with a hex letter (`// the ink #1a2b3c`), a string (`"#27"`), a template (`` `#28` ``), a regular expression (`/#29/`), and `// Issue #731`, which is a pull request: the rule reads the form and never the kind, a blind spot declared at the assertion, toward passing, and `// PRs #21` (ruling B1).

Mutations, each one line in `scripts/lint/ts-comment-form.ts` or `scripts/lint/css-comment-form.ts`:
- drop the lookbehind: `// Issue #13` and its siblings report, red;
- read `Line` comments only: the block and doc comments go clean, red;
- drop the whitespace collapse: the wrapped block reports, red;
- drop the hex-letter lookahead: `// the ink #1a2b3c` reports, red;
- drop the `g` flag (or take only the first match): the two-number comment names one, red;
- report nothing (the stub): red on every reporting line;
- drop `prs`: `// PRs #21` and `/* PRs #23 */` report, red in both tests;
- the sheets through the shared helper: invert `bareNumbers(...).length > 0` in `issueForm`, and `test/repo/css-comment-form.test.ts` reds.

Reach: `vellum/ts-comment-issue-form` joins `EVERY_ROOT`, so the existing test "the .js comment rule and the escape twin reach every TypeScript root ..." (retitled to name the comment rules) pins it at error on one witness per root (`ROOT_WITNESSES`, itself pinned to `lintTsRoots()`) and absent from the sheets. Mutation: drop the rule from the block, or narrow the block's files, and that test reds.

Whole tree: `npm run lint` with the rule wired reports nothing; CI runs it (pinned by `test/repo/lint-wiring.test.ts`'s Lint-step test). No unit test lints the whole TypeScript tree, as PR 1's `.js` rule has none: the lint step is that check.

`vellum-guard-prover` on the new test, the changed CSS fixture and the reach pin after commit 2, with the mutations above as its starting list.

## Doctrine and errata (commit 3)

- `handbook/specs/conventions.md`, the `Issue #N` / `PR #N` paragraph: comments in the linted TypeScript join the sheets as enforced by `npm run lint` (`vellum/ts-comment-issue-form` in `scripts/lint/ts-comment-form.ts`, sharing `bareNumbers` with the sheets' rule); each number carries its own word, a list included (ruling A1); strings in code are outside the rule, agreeing with the open `handbook/errata/guards.md` PR #625 row; the trim-as-touched sentence narrows to prose and to comments no lint reads (an `.astro` page, `astro.config.ts`, the hooks under `.claude/`); `design/`'s archived round tools are never edited.
- `handbook/errata/prose.md`, the PR #625 row under Ruled and left: its scope narrows (code comments in the linted TypeScript are swept and linted from this pull request, by decision 2 of 2026-10-02), recorded first as a dated pointer comment on Issue #659 citing issuecomment-5959995543, the precedent being Issue #659's 2026-10-02 comment.
- `handbook/errata/guards.md`: a row for the rule reading the form and never the kind (`Issue #731`, a pull request, lints clean, toward passing).

Nothing else lists the house's TypeScript rules: `git grep` for `ts-comment-no-js-module` finds only `eslint.config.ts`, the rule file and `test/repo/ts-comment-form.test.ts` (plus errata rows and the PR 1 plan, which are history).

## Evidence commands

- `node out/675b-hits.ts` before and after the sweep: 600 (with `astro.config.ts`) then 0 bare in comments.
- `node out/675b-token-proof.ts ed4c1d3 --hand out/675b-hand-edits.json --audited out/675b-hits.tsv --nonrefs <the four>` on commit 1: zero failures.
- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`), on commit 1 and on the head.
- The red of the fixture test against the stub, pasted into the PR body's guard table.
- E2E: none run locally; the sweep's diff is comments only by the token proof, and CI runs every suite.

## After the review rounds: the merge with main

Merge `origin/main` (with Issue #621 in it) into the branch, never rebase. Re-run the hit probe, which finds any bare number the merge brought in, and the lint, which reports it; sweep those in the merge, comment-only, with a fresh audited list. Re-run the verifier on the combined state against `origin/main`, excluding exactly this pull request's own code files (`scripts/lint/css-comment-form.ts`, `scripts/lint/ts-comment-form.ts`, `eslint.config.ts`, `test/repo/ts-comment-form.test.ts`, `test/repo/css-comment-form.test.ts`, each of whose comment edits commit 1's proof covered against its own parent), and `npm run check`, `npm run lint`, `npm test` there. Push, CI green, `closingIssuesReferences` exactly `[675]`.

**The merge order is not enforced by GitHub** (plan skeptic finding 6): `required_status_checks.strict` is false on `main`, so a branch opened before this lands (the Issue #621 lane is at `ed4c1d3`) can merge on a CI that never ran the rule, and a bare number in a comment it adds reds main's lint. Named in the PR body and to the dispatcher: Issue #621 merges first, as planned, and any other branch open when this lands merges main and runs `npm run lint` before it merges.

## Acceptance map for the PR body (plan skeptic finding 11)

Items 1 to 5, the escape twin and the skip guard landed in PR #731 (the four moved tests are gone, item 3's one-spawn witness stands in `test/repo/constant-contracts.test.ts`, ruling 3's follow-up is Issue #728); decision 2's rule and the sweep land here; `npm run lint`, `npm run check`, `npm test` green on the head and on the merged state.

## Calls made without a ruling (to be recorded on Issue #675 before the PR opens)

1. Mechanical classification by GitHub's kind for the number, never by reading what the sentence meant: the number points at exactly one thing.
2. The four non-references are reworded, not skipped (a skip needs Alex's ruling and a rulebook entry); the comment above `BARE_NUMBER` keeps every named direction in words, and the fixtures now pin each.
3. The sweep also covers `astro.config.ts` (2 numbers), a `.ts` file outside the lint that the same verifier proves; `.astro` pages (21 comment lines) and `design/`'s archive are not swept, the first trim-as-touched, the second never edited.
4. One report per comment, naming its bare numbers (the sheets' rule reports once per comment and names none).
5. The TypeScript-only false reds (a `*`-led wrapped doc block, a wrapped `//` run, a field label, another repository's number) are declared at the assertion rather than closed: none occurs today and each errs toward failing.
6. The sweep script, the proof harness and the kinds table stay uncommitted and go in a PR comment with their output.
7. This pull request closes Issue #675 only; Issue #687, whose one acceptance item ruling 5 met, is the dispatcher's to close.

## Plan skeptic findings rejected

None rejected. Finding 1 put decisions A and B to Alex; findings 2 to 7 are folded above; finding 8 is call 3; finding 9 is the strings clause; finding 10 is call 7; finding 11 is the acceptance map.
