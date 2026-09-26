# Issue #654 row 5 plan: the `no-unnecessary-condition` markers outside the e2e tree

Written 2026-09-26 against main `fd23337` (row 10 merged as PR #694) in the worktree branch `chore/654-row5-condition-guards`, by the second lane on Issue #654. No code was written before this plan. The whole-issue plan is `plans/654-plan.md` (frozen); its row 5 line is one sentence, and this file is that row's detailed design. It builds to that plan's rulings of 2026-09-26 (comment 5844303968): item 1 (this row is the third step of Correctness ruling 3B), item 7 (review rounds) and item 12 (a short named list of skips may remain, each ruled at its row's stop; the refill loop comes here).

**What Correctness ruling 2 of Issue #648 said, and what it did not.** It marked all 110 flagged lines at the time, and declined deleting the flagged checks "not now", for a crash risk where the type lies. "The fix is a truer type, never a deleted guard" is the lane's own ledger prose (Issue #654 comment 5755165520), written about the index-lookup class that row 3's switch then cleared. So where the type is right and a check can never fire, removing it is open to Alex's ruling; where the type is too confident, the fix is a truer type.

`vellum-plan-skeptic` ran cold on the issue and this plan (no recon ledger; this row's inventory is re-measured below) and returned 10 findings, none blocking, 7 should-fix and 3 nits, all folded and marked "(skeptic N)"; none was rejected. Its first finding reshaped the menu: most of the sites the first draft called "type too confident" are ones where the type is right and the guard is dead.

## Scope, and what it does not touch

The `@typescript-eslint/no-unnecessary-condition` markers under `src/`, `test/` and `test-support/` (none remain under the non-e2e `scripts/`). The 75 under `scripts/e2e/` and the e2e runner are row 6's. **This row edits no file under `scripts/e2e/`, no e2e runner and no line of `eslint.config.ts`**, so it does not collide with the parallel lane on Issues #673 and #679, which owns `scripts/e2e/` and will edit `eslint.config.ts` and `test/repo/lint-wiring.test.ts`. This row touches `test/repo/lint-wiring.test.ts` only if Alex asks for an accepted-list guard (decision D), and `errata/guards.md` only by appending rows.

## Inventory at `fd23337`

`git grep -n "no-unnecessary-condition" -- src scripts test test-support`, the `eslint-disable` lines: 123 markers, 75 under `scripts/e2e` (the runner's included), **48 outside it, in 16 `src/` files, 14 test files and 1 test-support file (src 23, test 24, test-support 1)**. Every one is a trailing `eslint-disable-line`. Linted with inline config ignored (`eslint --flag unstable_native_nodejs_ts_config --no-inline-config -f json <files>`, this rule's messages on the marker lines; `654-row5-inventory.ts` in the scratchpad): **51 messages on the 48 lines, none with nothing to suppress**.

By whether the checker is right:

| group | markers (messages) | sites, and what was measured |
|---|---|---|
| **I. the type is too confident: the check is live** | 3 (3) | `navigator.share` and `navigator.clipboard` (the share button, `src/site/seed-of-the-day/app.ts`): absent on some desktop browsers and in insecure contexts; the click target in `onDocClick` (`src/site/living-chart/place-overlay.ts`), cast to `Element \| null` though a click's target need not be an element |
| **II. the type is right: the check can never fire (site)** | 17 (18) | `window.matchMedia &&` in the three `prefersReduce` (`src/site/explorer/app.ts`, `src/site/living-chart/ages.ts`, `src/site/living-chart/voyage.ts`): the same pages call `window.matchMedia(...)` unguarded (`src/site/explorer/app.ts` two lines below, `src/site/shared/room.ts`), and the one unit-test window that reaches `prefersReduce` provides it (skeptic 1); `document.fonts?.ready` (`src/site/shared/room.ts`), present in every browser that can run the bundle (from knowledge, UNVERIFIABLE by command here); `orderLink`, `formatSel`, `sticky`, `hunt`: each id is written unconditionally in its page's markup (`src/pages/explorer/index.astro`, `src/pages/print-room/index.astro`, `src/pages/seed-of-the-day/index.astro`), and `formatSel.addEventListener` already runs unguarded at module load; the two worker-message checks in `src/site/explorer/worker-client.ts`: a dedicated worker's messages come only from its own `src/site/explorer/worker.ts`, which always posts an object (skeptic 1); the manifest's `places` in `applyScrub` (`src/site/living-chart/chronicle.ts`), `buildPlaceOverlay` (`place-overlay.ts`, two messages) and `build` (`src/site/living-chart/voyage-session.ts`): every manifest is `buildPlaceManifest`'s output and `places` always exists; `textContent ?? ""` on an element (`src/site/print-room/bound-atlas.ts`, `src/site/reading-frame/dated-log.ts`, `src/site/specimen/app.ts` twice): never null by the DOM's own definition |
| **III. the type is right: the check can never fire (tests)** | 17 (17) | `m.index === undefined` on a `matchAll` match, which always carries an index (`test/site/landfall-doors.test.ts`, `test/site/landfall-prose.test.ts`); and fifteen re-checks of what an assertion just above established: `if (x.kind === ...)` after `assert.equal(x.kind, ...)` (`test/render/ages-track.test.ts` 1, `test/world/daily-hunt.test.ts` 3, `test/world/lod.test.ts` 4), `before &&` and `card &&` repeated in a second assertion (`test/site/shell-css.test.ts` 2, `test/site/landfall-prose.test.ts` 1), `region.region?.` after an assertion that it exists (`test/world/realm-carry.test.ts` 3), and `dropped.kind === "crossing"` after `assert.equal(undrawn[0]!.kind, "crossing")` (`test/site/ribbon-job.test.ts`, skeptic 8). Each file imports `node:assert/strict`, whose assertions narrow |
| **IV. a test pinning a relation between constants the checker already knows** | 6 (7) | `PACE_RATE_TOLERANCE < 0.125` (`test/cli/e2e-pace.test.ts`), `WIDTH_FACTOR.caps > WIDTH_FACTOR.mixed` (`test/render/label-claim-geometry.test.ts`), `COAST_EMBARK_MAX < INLAND_STUB_CELLS` (`test/repo/constant-contracts.test.ts`), `BOUND_MS > 0` (`test/repo/footgun-deployed-run.test.ts`), `SEAM_U === 0.5` and `0.02 < LABEL_GAP_U < 0.06` (`test/site/instrument-scale.test.ts`): live guards whose job is to fail when someone edits a constant |
| **V. a type that is wrong, or hidden by a cast** | 2 (3) | `r.stdout ?? ""`, `r.stderr ?? ""` (`test/repo/agent-sandbox.test.ts`): Node's types say a `spawnSync` result's output is always a string, but on Node v26.10.0 a failed spawn leaves both `undefined` (skeptic 7); `(anchorRaw as "start" \| "middle" \| "end") ?? "start"` (`test-support/label-geometry.ts`), where the cast drops the `undefined` the `??` exists for |
| **VI. an engine search assigned inside a callback** | 1 (1) | `if (best === null) return null` in `nearCandidate` (`src/world/daily-hunt-clue-facts.ts`): `best` is set inside a `forEach` callback, which narrowing cannot see |
| **VII. the last branch of the worker's dispatch** | 1 (1) | `else if (msg.kind === "tour")` (`src/site/explorer/worker.ts`): no other kind is left in the union |
| **VIII. the Chart Table's refill loop** | 1 (1) | `} while (refill);` in `fill` (`src/site/explorer/chart-drawer.ts`): set by a re-entrant `fill()` during an `await`, which narrowing cannot see across; ruling 12 sends it here |

3 + 17 + 17 + 6 + 2 + 1 + 1 + 1 = 48 markers; 3 + 18 + 17 + 7 + 3 + 1 + 1 + 1 = 51 messages.

## Design

- **I, truer type (a call; ruling-2 prose applies as written).** `(navigator as Partial<Navigator>).share` and `.clipboard`; the click target cast to `(Node & Partial<Pick<Element, "closest">>) | null`. The checks stay exactly as they run. Erasable.
- **II, dead site checks (decision A).** Recommended: remove them, on Alex's ruling, since each defends a state the shipped program cannot reach and the checker then guards the code that replaces it. Widening their types instead is rejected: it would make each type less true, the same cast in all but name the plan rejects for the refill loop (skeptic 1). Alternatives: remove only the four the DOM itself guarantees (the `textContent ?? ""` fallbacks) and accept the other thirteen; or accept all seventeen.
- **III, dead test checks (decision B).** Recommended: remove the re-check and the `m.index === undefined ||`, keeping every assertion; nothing that can fail is removed. Alternative: accept.
- **IV, constant contracts (a call; truer type).** The inline widening `assert.ok((PACE_RATE_TOLERANCE as number) < 0.125)` and the like, which lints clean (skeptic 4) and is erasable, so the test states what it pins, a relation between tunable numbers, and nothing that runs changes. The constants' declarations do not change.
- **V, truer type (a call).** The `spawnSync` result annotated with `stdout` and `stderr` as `string | undefined` on the existing binding; the anchor cast widened to include `undefined`. Erasable.
- **VI, engine (a call; behaviour-identical).** `forEach((a, idx) => ...)` becomes `for (const [idx, a] of world.settlements.entries())` with `continue` for its two early `return`s; the cast on the next line goes with the marker. Same order, same comparisons, no rng.
- **VII, worker dispatch (a call; behaviour-identical).** The `if`/`else if` chain over `msg.kind` becomes a `switch` with one case per kind and no default: an unknown kind still matches nothing, `switch-exhaustiveness-check` holds every kind handled, and the rule does not read switch cases. `ctx.onmessage` grows from 62 to 75 lines under the `max-lines-per-function` marker it already carries (row 8's), named in the PR (skeptic 6).
- **VIII, the refill loop (decision C).** Recommended: the accepted list, its marker kept with its reason. Alternatives: read the flag through a function (`} while (wantsRefill())`), or restructure `fill` to re-invoke itself when `refill` was set; either rewrites CT10's source pins in `test/site/chart-drawer.test.ts` (`do { ... } while (refill)` and `if (drawing) { refill = true; return; }`), which then goes to the guard-prover, and the restructure is also a behaviour change in the drawer's thumbnail drawing owing its own e2e proof (skeptic 3).
- **The accepted list (ruling 12)** gains what Alex accepts here, recorded on the issue by file, symbol and reason; its first entry is the `no-implied-eval` skip in `runPlateScript`. **Decision D** is whether it gets a guard now: a test holding the exact set of this rule's markers, so a NEW trailing marker reds unless ruled onto the list, which nothing catches today (`--max-warnings 0` catches only a stale one; skeptic 10). Recommended: not now, since it lands in `test/repo/lint-wiring.test.ts`, which the parallel lane will edit for Issue #679, and Issue #675 owns moving guards into the linter; the close-out's directive count sees every marker left.

## Files (recommended options)

The 16 `src/` files and 14 test files of the table less `src/site/explorer/chart-drawer.ts` (unchanged under C's recommendation), `test-support/label-geometry.ts`, and this plan archived as `plans/654-row5-plan.md` with the first commit. No `scripts/e2e/` file, no e2e runner, no `eslint.config.ts` line, and `test/repo/lint-wiring.test.ts` only under D's guard option.

## Tests, each with the mutation that reds it

No new test under the recommended options. The red-first step is the lint itself: the 47 markers (all but the refill loop's) deleted with nothing else changed, `npm run lint` reds with 50 messages; each fix takes its sites green, and the rule reds again if a fixed site's condition becomes unnecessary. Class VI is held by `test/world/daily-hunt.test.ts` (the near clue against `nearestAnchor`) and the byte sweep. Under C's alternatives, CT10 is rewritten and proved; under D's guard option, the guard is red first with a planted marker and proved.

## Evidence commands

- `npm run check`; `npm run lint`; the marker count by the `git grep` above, 48 before and the accepted entries after.
- `npm test`, then `npm run astro:generate`.
- The syntax-tree proof (`654-row10-ast.ts`, no renames): classes I, IV and V change nothing that runs; the files that differ are exactly the ones II, III, VI and VII edit.
- For VI, the byte sweep base `fd23337` against head, extended to hash, per seed, the near candidate from `buildClueFacts` (its clue and `holds` evaluated over the fact pool, since the anchor lives only in that closure; skeptic 5), over the 100 seeds; its control, planted in `nearCandidate`, must move every seed that has an anchor (17 of the first 24 do).
- `npm run build`, then locally only the e2e suites the change touches, each to completion (the parallel lane shares this machine): the Explorer's, the living chart's, the Print Room's, the Daily Hunt's, the specimen's and the reading frame's; both full lanes left to CI.
- `gh pr view <N> --json closingIssuesReferences`: `[]`.

## Open decisions for Alex (the build stops here)

- **A.** The seventeen dead checks in site code: remove all (recommended), remove only the four the DOM guarantees and accept the other thirteen, or accept all.
- **B.** The seventeen dead checks in tests: remove them, keeping every assertion (recommended), or accept.
- **C.** The refill loop: onto the accepted list (recommended), read through a function, or restructure `fill`.
- **D.** An accepted-list guard: not now (recommended), or now in `test/repo/lint-wiring.test.ts`.

## Calls made (open to overrule)

1. Groups I, IV and V take a truer type, and VI and VII a behaviour-identical form, without a ruling: each is the fix the rule and the ledger already name.
2. The accepted list is recorded on the issue, not in a spec or the config.
3. The byte sweep is owed only by group VI, the one engine edit; the site and test edits rest on the syntax-tree proof, the unit suite and the touched e2e suites locally, with both full lanes on CI.

## Alex's rulings (2026-09-26, relayed by the dispatcher)

The plan above is unchanged from the state the cold plan skeptic's fold left it in; this section is the record of what Alex ruled on it. The third lane on Issue #654 builds to it.

1. **Decision A: remove all seventeen** checks in the site code that can never fire, the lane's recommendation.
2. **Decision B: remove the repeats in the tests and keep every assertion**, the lane's recommendation.
3. **Decision C: the Chart Table's refill loop** (`} while (refill);` in `src/site/explorer/chart-drawer.ts`) **goes on the accepted list** with its reason, and its code does not change; the lane's recommendation. It is the list's second entry, after the `no-implied-eval` skip in `runPlateScript` (`test/atlas/document.test.ts`).
4. **Decision D: no guard on the accepted list now**, the lane's recommendation. The risk accepted is that nothing catches a new skip until the close-out count; Issue #675 owns moving such guards into the linter.
5. **The lane's calls stand**; none was overruled: the truer types for the three live checks (group I), the inline `as number` on the six constant-contract tests (group IV), the two test types (group V), the `nearCandidate` `for...of` rewrite under the byte sweep with a control (group VI), the worker `switch` (group VII), and the accepted list recorded on the issue.
6. **The archive**: this file is copied unchanged apart from this section to `plans/654-row5-plan.md` in the row's first commit and never edited afterwards (Alex's ruling of 2026-09-26, Issue #693); `plans/654-plan.md` stays frozen.
