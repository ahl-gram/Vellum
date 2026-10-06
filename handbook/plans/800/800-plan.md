# Issue #800: typescript-eslint 8.70.0 to 8.70.1

Lane plan, 2026-10-06, on main `35fbadff`. Recon ran first (ledger: 14 CURRENT, 2 STALE both cosmetic, 1 UNVERIFIABLE, the re-measure, which this plan's measurements below now settle).

## What is asked (body and the one comment, read through `gh api`)

- Upgrade `typescript-eslint` from 8.70.0 to 8.70.1, or the newest 8.70.x patch, measured.
- Re-measure every adopted strict rule and every house rule on the upgraded version; a count that moves comes back to Alex before it is accepted (Issue #779's ruling, comment 6014008755, applied to this upgrade by Issue #800's own ask).
- Remove the `--fix` warning comment at `no-useless-default-assignment`'s line in `eslint.config.ts` once the fix is a suggestion, and say so in the PR.
- A dependency change: install for real in the lane's own tree, never through a linked `node_modules` (the rule's home is `.claude/agents/vellum-implementer.md`; `handbook/specs/orchestration.md` holds the mirror half), and report the resolved versions for the orchestrator to mirror.
- Order: after PR #798 (merged, `35fbadff`); merges before Issue #799's pull request.

## The version

`npm view typescript-eslint versions` and `time` (2026-10-06): the stable releases after 8.70.0 are 8.70.1 (2026-09-21), 8.71.0 (2026-09-28) and 8.71.1 (2026-10-05, `latest`); 8.70.2 shipped only as alphas. The newest 8.70.x patch is 8.70.1, so 8.70.1 is the target. 8.71.x is a minor and outside what the issue asked.

Peers at 8.70.1: `eslint ^8.57.0 || ^9.0.0 || ^10.0.0`, `typescript >=4.8.4 <6.1.0`; installed eslint 10.11.0 and typescript 5.9.3 satisfy both. The presets are byte-identical between 8.70.0 and 8.70.1 (recon, `diff -r` of `dist/configs`).

## Design

1. The tree holds a real install from the committed lockfile (`npm ci` with no link present; the guarded `ln -s` was refused by the auto-mode classifier, and a real install is what a dependency change needs anyway). That install is the 8.70.0 control.
2. `npm install typescript-eslint@8.70.1` in this tree. Done, measured: exactly twelve lockfile entries change (a structural compare of every `packages` entry before and after): `typescript-eslint` and the ten `@typescript-eslint/*` packages (eslint-plugin, parser, project-service, scope-manager, tsconfig-utils, type-utils, types, typescript-estree, utils, visitor-keys) from 8.70.0 to 8.70.1, and the copy of `ignore` nested under `@typescript-eslint/eslint-plugin` from 7.0.9 to 7.0.12; plus the root's `devDependencies` range. `package.json`'s range moves from `^8.70.0` to `^8.70.1`, so the floor itself excludes the version whose fix runs unasked.
3. Delete the one comment line above `"@typescript-eslint/no-useless-default-assignment": "error"` in `eslint.config.ts`. Nothing else in that file changes.
4. Commits: (a) this plan at `handbook/plans/800/800-plan.md` with the `package.json` and `package-lock.json` bump; (b) the comment's deletion. Push at the first.

## Measurements (control and upgrade on the same sha `35fbadff`, only the install differs)

Harness `800-measure.ts`, adapted from Issue #779's `779c-measure.ts` and `779-measure-v.ts` and pointed at this tree; it exits non-zero and writes nothing on a fatal message, and prints any rule-less message (an unused directive is one) rather than exiting on it. `800-diff.ts` compares two runs per rule, per finding (file, line, column, rule) and per suppressed message (file, line, rule). Modes:
- `config`: the house config as it stands, so every adopted strict rule, every house rule (`vellum/*`, 13 TypeScript and 4 CSS), the TypeScript block and the presets, with the messages an inline directive suppresses.
- `strict`: the whole `strictTypeChecked` set layered over the config (the trial's measure, `no-unnecessary-condition` kept at the house setting).
- `stylistic`: the `stylisticTypeChecked` set, for the record.

`800-fixprobe.ts` lints the committed `no-useless-default-assignment` plant from `test/repo/lint-strict.test.ts` at `src/cli/main.ts` through the house config, prints whether the refusal carries a fix or a suggestion, and runs ESLint with `fix: true` over it. It is the instrument's own control: it must read differently at the two versions, or the measure is not seeing the upgrade.

| measure | 8.70.0 | 8.70.1 | moved |
|---|---|---|---|
| config, findings over 773 files | 0 | 0 | none |
| config, suppressed by a directive | 8 (2 `no-unnecessary-condition`, 4 `max-lines-per-function`, 1 `no-implied-eval`, 1 `max-lines`) | the same 8, same files and lines | none |
| strict set, findings | 5649 over 8 rules | 5649, identical by file, line, column and rule | none |
| stylistic set, findings | 2352 over 15 rules | 2352, identical | none |
| fix probe | refusal at line 3, `fix=true`, no suggestion; `--fix` rewrites `(a = 1) => a` to `(a) => a` | refusal at line 3, `fix=false`, suggestion "Remove the default value."; `--fix` leaves the plant unchanged | the deliverable |
| `npm run lint` | exit 0 (CI on `35fbadff`) | exit 0 | none |
| the eleven lint-related test files | 71 pass | 71 pass | none |

The control is stable run to run: two 8.70.0 runs of `strict` and `stylistic` diff to nothing.

No count moved, so nothing goes back to Alex under Issue #779's ruling, and the issue's open choices are calls (below), not decisions.

The release notes' entries that touch what the house runs, and what showed each moved nothing here:
- `no-useless-default-assignment` (adopted): upstream PR #12826, fix to suggestion on all three of its reports (the fix probe; the plan skeptic also showed the `= undefined` report moving from a fix to a suggestion); upstream PR #12768, fewer reports on tuples with a rest element, which neither the plant nor today's config can see (config 0 to 0), so the ruled count at its own tree is the check (below).
- `no-generated-empty-object-type` (adopted): upstream PR #12854 (config 0 to 0; its `Omit<K, "a">` plant still refused at line 2, `test/repo/lint-strict.test.ts` green).
- `no-misused-spread` (adopted): upstream PR #12850, suggestions only (plant green).
- `no-unnecessary-condition` (house block): upstream PR #12747; the two directives for it are suppressed at the same lines at both versions, so neither went unused.
- `no-misused-promises`, `no-unnecessary-type-assertion`, `unbound-method`, `await-thenable`, `no-explicit-any` (preset): config 0 to 0.
- scope-manager upstream PR #12809 (implicit globals), typescript-estree upstream PR #12821 (`<` token), upstream PR #12894, upstream PR #12725 (symlinked paths), type-utils upstream PR #12838 (package specifiers, which `no-floating-promises`'s `node:test` allowance reads): config 0 to 0, and the house rules' own fixture tests (`test/repo/source-shape.test.ts`, `test/repo/source-shape-prospect.test.ts`, `test/repo/ts-comment-form.test.ts`, `test/repo/css-comment-form.test.ts`) and `test/repo/lint-wiring.test.ts` pass at 8.70.1.
- `return-await` (adopted): its dist file changed, but only to move the fixer's removal range into a helper; its reports are unchanged (plan skeptic, `diff` of the two installs' `return-await.js`), config 0 to 0, plant green.
- `await-thenable` (preset): upstream PR #12716 stops its autofix breaking code when it removes an `await`, a second case of the hazard this issue exists for, and a second reason for the upgrade.

What "re-measure" covers: the tree as it stands under every rule the config turns on (a superset of the 17 house rules and the 19 adopted ones), the strict and stylistic sets for the record, and the ruled counts at the trees they were measured at.
- At today's tree every count is 0 at 8.70.0, so no report can drop there, and a report 8.70.1 adds would show as a finding or a directive gone unused. None did.
- The plants do NOT see every change in a rule's reach: the plan skeptic showed upstream PR #12768 dropping a report (`const [n, s = "x"] = t` with `t: [number, ...string[]]`, refused at 8.70.0 with a fix, not refused at 8.70.1) while the plant and config both stay where they were. So the ruled counts were re-measured at their own trees, at 8.70.1, by `800-oldtree.ts` (`git archive` of the tree into this tree's `out/`, linted with the ruled rules at the ruled settings, resolving this tree's 8.70.1 install):
  - band B at `0929dba`: `no-misused-spread` 4, `no-unnecessary-template-expression` 1, `no-unnecessary-type-arguments` 1, `restrict-plus-operands` 2;
  - band C at `5f8db4e`: `use-unknown-in-catch-callback-variable` 8, `no-confusing-void-expression` 5, `no-useless-default-assignment` 1 (`src/site/living-chart/no-bar.ts:45`).
  Each is identical, file and line, to the count the Issue #779 lanes recorded at 8.70.0 (`779-ruled-0929.json`, `779c-bandc.json`). The plan skeptic reproduced bands B and C independently at `8d4ea11` and `5f8db4e` against both installs. Band A was zero at adoption, so it cannot fall, and a rise would show in today's config run.

## Tests

No new guard (call 3). The guards that read the tool run at 8.70.1 and pass: `test/repo/lint-strict.test.ts` (every adopted rule resolves at its ruled value at every witness and refuses its plant at exactly the planted lines), `test/repo/lint-wiring.test.ts`, `test/repo/lint-config.test.ts`, `test/repo/lint-roots.test.ts`, `test/repo/source-shape.test.ts`, `test/repo/source-shape-prospect.test.ts`, `test/repo/ts-comment-form.test.ts`, `test/repo/css-comment-form.test.ts`, `test/repo/comment-citations.test.ts` (the skip list), `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-type-notes.test.ts`. There is no failing-test-first step: nothing in the house's code changes behavior, and the one behavior that does change is upstream's, shown by the fix probe at both versions.

## Evidence commands

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`), at the branch head.
- The three measure modes, the diffs and the fix probe at 8.70.0 and 8.70.1, posted as a PR comment with the harness, since the scratchpad does not outlive the session.
- The lockfile structural compare naming only the twelve entries.
- No e2e suite runs locally: the change is a lint tool that no page, bundle or suite loads at run time. CI runs every lane, on a fresh `npm ci` from this lockfile.

## Rosters and doctrine

- Only `eslint.config.ts` and the two frozen plans under `handbook/plans/779/` mention 8.70 (`grep -rln "8\.70"` over the tracked roots); the plans are archives and stay.
- No spec names the typescript-eslint version, and no test pins it or the comment.
- `handbook/specs/rulebook.md`'s accepted-skip list is untouched: the eight directives are suppressed at the same lines at both versions.

## Coordination

- The review sandboxes (`scripts/agent-sandbox.ts`) link the main checkout's `node_modules`, which stays at 8.70.0 until the orchestrator mirrors. So the cold skeptic waits for the mirror: the lane opens the PR, hands back the exact mirror line, and dispatches the skeptic once the orchestrator confirms. The mirror line: `npm install --no-save typescript-eslint@8.70.1 @typescript-eslint/eslint-plugin@8.70.1 @typescript-eslint/parser@8.70.1 @typescript-eslint/project-service@8.70.1 @typescript-eslint/scope-manager@8.70.1 @typescript-eslint/tsconfig-utils@8.70.1 @typescript-eslint/type-utils@8.70.1 @typescript-eslint/types@8.70.1 @typescript-eslint/typescript-estree@8.70.1 @typescript-eslint/utils@8.70.1 @typescript-eslint/visitor-keys@8.70.1`, which leaves the nested `ignore` to npm; the alternative after this PR merges is the one `npm ci` the orchestration spec already names.
- Issue #799's lane links the main checkout's `node_modules` (`ls -ld` on its tree), so the mirror moves its local runs to 8.70.1 the moment it runs, while its branch's lockfile and its CI stay at 8.70.0 until it merges main after this PR: its evidence splits across two versions unless its dispatcher tells it where the line falls. `handbook/specs/orchestration.md` (Merging) runs the mirror only while no lane or sandbox is running a suite, so its timing is the orchestrator's.
- The only line this PR changes in `eslint.config.ts` is the comment inside the Issue #779 block; Issue #799 adds a block of its own.
- The PR body says the comment was removed, as the issue asks.

## Calls (the issue did not rule these; recorded on the issue before the PR opens)

1. 8.70.1, not 8.71.x: the issue asked for an 8.70.x patch, and 8.71.x is a minor with its own rule changes (8.71.1 adds `no-unsafe-enum-assignment` to the strict sets) to measure.
2. `^8.70.1` in `package.json`, the house's caret form and what `npm install <pkg>@<ver>` writes, which puts the floor above the hazard; a caret still admits 8.71.x on a lockfile-free resolve, as every other dev dependency here does.
3. No guard for "the rule offers a suggestion, not a fix". The issue asks for the comment's removal, not a replacement, and the hazard is gone wherever the lockfile is installed: CI and every fresh install run `npm ci`, and the `package.json` floor keeps a regenerated lockfile from going back below 8.70.1. What the floor does not reach is a tree linked to an install made before this PR (the main checkout until its post-merge `npm ci`, and every lane and sandbox linking it); a one-line assertion in `test/repo/lint-strict.test.ts`'s plant loop (the refusal carries no `fix`) would red there, and in any downgrade or upstream reversal. It is left out as a pin on upstream behavior the issue did not ask for, and is the obvious overrule.
4. "Re-measure" read as the tree as it stands under every rule the config turns on, the strict and stylistic sets, and the ruled band B and C counts at their own trees (recon's option b), all measured above and none moved.
5. The review waits for the orchestrator's mirror (Coordination).

## The plan skeptic (one round, with the recon ledger), and what became of each finding

1. SHOULD-FIX, Coordination wrong about Issue #799 (its tree links the main checkout's install, so the mirror moves it): folded, Coordination rewritten.
2. SHOULD-FIX, call 4's premise false (a plant does not see every change in a rule's reach; upstream PR #12768 shown dropping a report the plant cannot see): folded. The sentence is corrected, and the ruled counts at their own trees were re-measured by the lane at 8.70.1 and match the recorded 8.70.0 counts line for line.
3. NIT, call 3's reasons do not hold (nothing reads the floor in a linked tree; Gate 1 item 1's "no `src/` mutation" would disqualify the config-mutated plants too): folded, call 3 rewritten with the reasons that hold and the guard named as the overrule. The decision not to add one stands as the lane's call.
4. NIT, the release-note walk missed `return-await`'s dist change and `await-thenable`'s upstream PR #12716: folded, both named; upstream PR #12716 goes in the PR body as a second reason.
5. NIT, the PR body step did not plan to say the comment was removed: folded.
