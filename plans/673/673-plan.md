# Issue #673 plan: split the long e2e suites into functions, so every file under `scripts/e2e/` meets the size rules with no exempt marker

Base: main `fd23337` (2026-09-26). Branch `chore/673-e2e-split-suites`. Recon ledger: `673-recon.md` in the lane's scratchpad. Status: after the plan skeptic (its findings folded in, section 11) and Alex's rulings (section 13), archived with PR 1's first commit.

## 1. What is asked, and what binds it

The issue (body only, no comments): split the long e2e suites into functions, and into files where one stays over the line limit, so every file under `scripts/e2e/` and the two runners meets 400 lines a file, 50 a function, depth 4, with no exempt marker. The 50 markers (8 `max-lines`, 38 `max-lines-per-function`, 4 `max-depth`) go in the pull requests that make them unnecessary. The checks, their order, their names, what each measures, its settle and its budget are unchanged, shown per pull request by each lane's printed check list against the base's. "Issue #654's e2e size entries are closed out here with a dated comment": here is Issue #673.

Binding records (recon verified each):

- Issue #653 comment 5795422288, ruling A: the port kept the markers and the split is this issue's.
- Issue #654 comment 5795916408: the e2e size rows (8/38/4) are this issue's.
- Issue #654 comment 5844303968, rulings 2 and 3: the port's 205 type notes and the e2e `no-unnecessary-condition` markers are Issue #654's row 6, which runs LAST, on the split and moved files. This lane does not fix or delete them.
- Issue #679 comment 5801379878, ruling 1: "A suite that Issue #673 split into several files takes a folder of that name". Comment 5801360379: the move to `e2e/` comes after this issue.
- Issue #648 comment 5754543314: physical lines, blank lines counted, limits inclusive; anything new is linted by these rules, so no new marker anywhere, tests included.
- Issue #653 comment 5799258680, call 25 reversed: `scripts/e2e/harness.ts` takes no size marker.
- The dispatcher: Issue #654's parallel lane (rows 5, 7, 8, 9) edits no file under `scripts/e2e/` and no line of `eslint.config.ts`; review is the house default (up to three cold `vellum-pr-skeptic` rounds per PR); locally run only the suites a PR touches and leave the full lanes to CI.

## 2. Inventory at `fd23337`, measured

Commands: the marker grep and the ESLint run in `673-recon.md`; `node <scratchpad>/673-shape.ts` (functions over 50 lines, files over 400); `node <scratchpad>/673-scope.ts` (each `run`'s statements, its steps, and the run-level names read across statements); `node <scratchpad>/673-predict.ts` (the prediction column).

The prediction is arithmetic, not a measurement: +2 lines per step (a one-line step in `run`, a function's signature, close and blank line, less the old wrapper's two), +4 per non-step group of about 40 lines, +6 for a kit. "Folder" means predicted over 380, leaving 20 lines of headroom under 400.

| suite | lines | markers (lines/function/depth) | steps | predicted | files |
|---|---|---|---|---|---|
| turn | 83 | 0/1/0 | 6 | 105 | one |
| verso | 92 | 0/1/0 | 7 | 116 | one |
| zoom-gestures | 101 | 0/1/0 | 2 | 115 | one |
| region-detail | 167 | 0/1/0 | 4 | 189 | one |
| ribbon | 167 | 0/2/0 | 5 | 191 | one |
| render | 225 | 0/1/0 | 13 (12 inside an `else`) | about 280 | one |
| prospect | 250 | 0/2/0 | 6 | 276 | one |
| room-drawer | 207 | 0/1/0 | 6 | 233 | one |
| cluster | 266 | 0/1/0 | 4 | 288 | one |
| broadside | 333 | 0/2/0 | 4 | 367 | one (closest to the line) |
| glass-ceremony | 269 | 0/1/0 | 2 | 303 | one |
| document-rooms | 214 | 0/1/0 | 1 | 234 | one |
| room-ink | 131 | 0/1/0 | 0 | 149 | one |
| room-address | 150 | 0/1/0 | 0 | 172 | one |
| room-voyage | 212 | 0/1/0 | 0 | 238 | one |
| room-voyage-route | 292 | 0/1/0 | 0 | 326 | one |
| hunt | 316 | 0/1/0 | 0 | 350 | one |
| runninghead | 360 | 0/1/0 | 0 | 390 | folder |
| room-instrument | 378 | 0/1/0 | 0 | 420 | folder |
| specimen | 381 | 0/1/0 | 1 | 417 | folder |
| cards | 412 | 1/2/0 | 5 | 452 | folder |
| reading-room | 596 | 1/1/0 | 0 | 658 | folder |
| print-room | 668 | 1/1/0 | 0 | 734 | folder |
| zoom | 691 | 1/1/0 | 10 | 769 | folder |
| survey | 708 | 1/3/0 | 19 | 764 | folder |
| home | 846 | 1/1/0 | 0 | 932 | folder |
| landfall | 852 | 1/2/4 | 0 | 938 | folder |
| chart-drawer | 1236 | 1/3/0 | 28 | 1334 | folder |

Beside them: `scripts/e2e/harness.ts` 399 lines, `start` 55 (one marker). fallback, health and motion have no marker and are not touched. The two runners and `scripts/e2e-port-proof.ts` have none. Totals: 50 markers; 205 type notes (`grep -rn "@ts-expect-error" scripts/e2e scripts/e2e-*.ts`); 75 `no-unnecessary-condition` markers under `scripts/e2e`.

The CI baseline the evidence compares against: lane A 309 checks, lane B 298. The printed names, with each check's detail stripped, are identical between main runs 36247559735 (`2819f29`) and 36253040431 (`b111b7c`), both lanes, no duplicates, and no name carries a run-dependent value (dates in names are ruling dates). So a base-against-head diff of names is a sound instrument.

## 3. Design

### 3.1 What a split suite looks like (menu item 1)

The suite's `run` becomes its table of contents, in the order it runs today:

```ts
export async function run(ctx: SuiteContext): Promise<void> {
  const k = drawerKit(ctx);
  const step = makeStep(ctx);
  await desktopViewport(k);                                 // an unstepped stretch, one-offs included, is a call
  await step("CD1", () => cd1DogEar(k));
  let laid: Read | null = null;
  await step("CD2, CD2b, CD2c", async () => { laid = await cd2Lays(k); });
  ...
  await step("CD4", () => cd4Reload(k, laid));
  ...
  await forget();                                           // a restore that must sit outside every step stays in run
}
```

- **A stepped group is ONE line in `run`**, `await step("NAME", () => groupFn(k));`, and its statements live in a named function. `const step = makeStep(ctx)` stays in `run` (pinned by `test/repo/e2e-tiers.test.ts`), and every `step(` call stays in the suite file, so the roster reads one file in run order.
- **An unstepped stretch is a plain call**, `await groupFn(k)`, or `const x = await groupFn(k)` where a later group reads what it produced. A group is one numbered check, or a contiguous run of checks sharing one fixture, and never crosses a step boundary: a statement outside every step today stays outside every step, and one inside stays inside its own. The split proof (section 6, item 4) keys every literal, payload and call by the step it runs under, so a statement that crosses a boundary reds it.
- **`run` holds only what must be there**: the kit line, `const step = makeStep(ctx)`, the step lines, the `let` a stepped group assigns and the calls of unstepped groups. A comment that leads a step or a stretch moves with it and sits above its group function; a one-off statement (a `send`, a viewport set, a `go`) joins the unstepped group beside it. The one statement that stays in `run` by name is a closing restore whose place outside every step is its point (chart-drawer's closing `forget()`, with its comment). Measured by the plan skeptic on chart-drawer, the largest `run`: exactly 50 lines if step-leading comments stayed in `run`; about 45 with them moved. Where a suite's `run` still passes 50, it becomes two routines in the suite file, both holding steps, which the rebuilt scanner reads (3.6), and the PR says so.
- **State that crosses groups goes by return value and argument.** Where a STEPPED group produces it, `run` keeps the `let` it has today and assigns it inside the step callback on one line, the same crossing today's `let laid` makes. `scripts/e2e/step-support.ts` is unchanged. No shared mutable object is passed as a parameter: `no-param-reassign` with `props: true` reds a write to a parameter's property (recon C6).
- **Helpers.** A helper that closes over nothing from the context (`atInset`, `asSlide`, `drawerUp`, `slipTravelled`, `both` in chart-drawer) moves to module level as it is. A helper that closes over the context (`go`, `forget`, `clickEar`, `settle`, `clickAt`) is declared, exactly as today, inside ONE kit function per suite, `<suite>Kit(ctx)`, which returns `{ ...ctx, settle, go, ... }`; a kit that would pass 50 lines is two kit functions merged in `run`. Group functions take the kit and destructure what they use. The spread copies references, and nothing reassigns a context member after `start()` returns, so `serverState`, `consoleErrors`, `http4xx` and `skippedGroups` are the same objects.
- **Two names are destructured in a group's BODY, never its signature.** `serverState` (print-room and reading-room write `serverState.blockWorker`, which is a parameter-property write if it arrives as a parameter) and `consoleErrors` (the sweep in `test/repo/console-support.test.ts` excuses a line only when it starts `const {`, so a signature naming the accumulator reads as an unfiltered read).
- **Names.** A group function is named for its first check id and what it checks (`t1StyleTurns`, `cd2Lays`), so a reader maps it to the roster and the printed list.

### 3.2 A move is verbatim

- A function over 50 lines splits only at a statement boundary, so a single statement longer than about 45 lines could not move whole. Measured (`node <scratchpad>/673-longest.ts`, every statement in `run`, in a step callback and in any other function over 50 lines, step calls and helpers over 50 excluded since they split at their own bodies): the longest is 39 lines (a `for` in `suite-home.ts`), except inside landfall's `measureEnters` (a 67-line `for...of`, restructured by design, 3.5). So every other statement moves whole, and no payload is hoisted into a constant.
- Every statement moves byte for byte but for its leading indentation. **A line that begins inside a template literal keeps its bytes exactly**, because its leading spaces are payload text, so every `evaluate` payload is byte-identical to the base (the dispatcher: "every payload string and every check id identical"). Such lines then sit two spaces deeper than the code around them, which is the cost of that rule and is named in each PR.
- Comments travel with their lines (a comment leading a step travels with the step's statements, 3.1). No comment is added (house rule), and the per-suite header line stays in the suite file; a part file carries no header. The one comment edited on purpose is `scripts/e2e/harness.ts`'s header, which names the server that leaves it (3.4).
- **The 205 notes and 75 condition markers travel with their lines and none is added or removed** (menu item 5). A group's parameters are typed as the value's type at its old site, narrowed where the site was narrowed, so the checker sees what it saw and every note and marker keeps covering what it covered. The check is automatic: an unused note reds `npm run check` (TS2578), an unused marker reds `npm run lint` (`reportUnusedDisableDirectives`, `--max-warnings 0`), and a new objection reds `npm run check`. Where a site cannot keep its type context, the lane stops at that site and reports it rather than touching Issue #654's row.
- **A group that hands a read on states its shape**: a group function that returns an `evaluate` or `settle` read declares its return type, because the shape scan in `test/repo/e2e-read-types.test.ts` fails a helper declared in the tree that returns a kept unknown.

### 3.3 Files (menu item 2)

- The suite file stays `scripts/e2e/suite-<name>.ts`: the header, the imports, `run`, and every `step(` call. The runner's imports, `E2E_SUITE_ORDER`, `E2E_LANES`, the runner's `SUITES` map, `STEPPED_GROUPS`, the smoke tier and the budgets are untouched. **One suite spread over several files, never new runner suites**: the issue says "into files", and Issue #679's ruling 1 presupposes exactly this. (The deleted text of the PR #663 errata row assumed new suites with lane assignments of their own; that is superseded.)
- A suite predicted over 380 lines (the eleven "folder" rows) takes a folder `scripts/e2e/<name>/`, named by the runner's key, as Issue #679 ruled for its move. Inside: `reads.ts` (payload constants and their types) where the suite has them, `kit.ts` (the context helpers) where it has one, and topic files of group functions, each under 400 with headroom. Nothing inside a folder is named `suite-`, so the footgun hook's new-suite roster gate does not fire on a part, which is right: a part is not a suite.
- A single-file suite whose actual split lands over 380 (broadside is the likeliest, at a predicted 367) takes a folder too; the table is a prediction and the lint is the measurement.

### 3.4 The harness

- `start` (55 lines): its CDP `message` listener moves to a module-level function in `scripts/e2e/harness.ts` taking `consoleErrors` and `http4xx`; `ws` stays a module variable, so the two closure notes on the `open` and `error` listeners keep covering their objections (recon C4), and the waiter notes move with the listener's body. Predicted `start` about 34 lines.
- The file (399 lines) cannot take that function's extra lines, so the static site server moves to `scripts/e2e/site-server.ts`: `MIME`, `serverState`, `BLOCKED_WORKERS`, `SRC_DIR`, `ENGINE_MODULE`, `serveEngineModule`, `startServer`, with the one note in `startServer`. `harness.ts` imports `startServer` and `serverState`. Predicted about 320 and 95 lines. `test/site/fonts.test.ts` re-points its `.woff2` MIME pin to the new file. `evaluate` and `send` stay declared in `harness.ts`, which `knownDeclarations` in `test/repo/e2e-read-types.test.ts` requires; `waitSettled` and `waitTurned` stay there, which the harness-waits test in e2e-tiers requires. No spec or code comment cites a server SYMBOL (`git grep` for the seven names), but `specs/site-architecture.md` says "`scripts/e2e/harness.ts` strips types from `src/*.ts` on demand" (the engine-serving bullet), which is `serveEngineModule`: PR 1 re-points it, and each PR greps `specs/` for every file it moves code out of, not only for symbols.

### 3.5 landfall's `measureEnters`: the one change that is not a move

72 lines, and all four `max-depth` markers are at depth 5 in its narrow branch. Its three polls (close any open card, pin the scroll to the top, poll until the pip is reachable) become named helpers that return what the loop tested, and the `continue` stays in `measureEnters` on the helper's answer. Same payloads, same try counts and sleeps (the split proof counts both), same order. It is the one place control flow is restructured, so its PR names it for review and the reviewer reads it line by line.

### 3.6 The containment guard, rebuilt (menu item 1, consequence)

`test/repo/e2e-tiers.test.ts` is at 400 of 400 lines and its containment scan reads text shapes this design retires (the three-line step, one file per suite, `await name(` call sites). Recon C1 and the advisor both measured that the scan as written would red on phase functions and go silent on part files. So:

- The scan moves out to `test-support/e2e-containment.ts`, rebuilt on the TypeScript syntax tree, and `test/repo/e2e-tiers.test.ts` calls it. `STEPPED_GROUPS` and the step-name order test stay in e2e-tiers (they read the suite file's text, which still holds every step call).
- It reads a suite's FAMILY: `e2eSuiteFamily(name)` in `test-support/e2e-source.ts` returns the suite file plus every `.ts` under `scripts/e2e/<name>/` at any depth.
- A step callback is the function passed as the second argument of a call to `step`. A named function is a function declaration, a const initialised with an arrow or a function expression, or an object-literal member that is a function. The root is the exported `run` plus module top level.
- A named function THROWS if its own body (its body less any nested named function and any step callback) holds a `throw` or a call to a throwing name. Seeds: `waitSettled`, `waitTurned`, `settle` (`CTX_THROWING_WAITS`, still pinned against the harness by the existing harness-waits test). Callees resolve by identifier OR property name (`ctx.waitSettled(`, `k.go(`), to a fixpoint. Reading the property name closes the gap the `errata/guards.md` row from PR #682 records (a wait called through the context was not read), so PR 1 deletes that row, pinned by fixture h below.
- A BREACH is a `throw`, or a call to a throwing name, in the root's own body outside every step callback. Kept from today: a suite with any throwing call must be in the roster, a rostered suite must have at least one throwing call (non-vacuity), and the step count must equal its roster entry.
- It accepts today's shape (three-line steps, helpers declared as consts inside `run`) and the new one, so PR 1 lands green on the unsplit tree.
- Blind spots, named at the scanner with their direction: a function reached through an alias, `.call` or `.bind` is not resolved (a miss); two functions sharing a name in one family merge (a false red); a factory's returned anonymous function is read as part of the factory (a false red, and why the kit declares its helpers as named consts rather than returning them from factories); throwers in shared support modules are not seeded (a miss, unchanged from today, the PR #572 errata row).
- `specs/settle-doctrine.md` clause 4 cites "`STEPPED_GROUPS` and the containment sweep in `test/repo/e2e-tiers.test.ts`", and `specs/site-architecture.md` names "the containment sweep in `test/repo/e2e-tiers.test.ts`" among the rosters a new suite joins; PR 1 re-points both to the scanner's new home.

### 3.7 The readers that must follow a suite into its folder

- `test/repo/console-support.test.ts`, both sweeps: read every `.ts` under `scripts/e2e` at any depth (`e2eSourcePaths` filtered to that tree, so the runners stay outside as the sweep's own blind-spot text says), instead of the top level only (recon C2). Its third arm, the house import spelling, checks `from "./console-support.ts"` literally, which a part file one level down cannot write (it imports `"../console-support.ts"`), so read at depth it would red on every folder suite that calls the drop (runninghead, print-room, reading-room, survey, home, and broadside if it takes a folder). PR 1 makes that arm accept a relative specifier that resolves to `scripts/e2e/console-support.ts` from the importing file, and nothing else.
- `test/site/sheet-height.test.ts`: the height carriers read the tree at any depth; the width witness reads the home and landfall families instead of their two suite files.
- `test/repo/e2e-tiers.test.ts`: the worker-live assertions (render, reading-room) and the `serverState.blockWorker = true` assertion (fallback, reading-room) read the family.
- Unchanged, measured: `test/repo/e2e-type-notes.test.ts` and `test/repo/e2e-read-types.test.ts` already read the tree at any depth through `e2eSourcePaths`; `test/repo/constant-contracts.test.ts` reads `maxTilt <=` in room-voyage-route, which stays one file.

### 3.8 Citations that must follow moved code

Nothing checks the symbol half of a citation in prose, so each PR greps its moved symbols against `specs/`, `.claude/`, `CLAUDE.md` and re-points what moved:

- `specs/settle-doctrine.md`: `go` and `restSeeing` in `scripts/e2e/suite-chart-drawer.ts` (PR 7); "the print checks in `scripts/e2e/suite-specimen.ts`" (PR 3); the viewport overrides in `scripts/e2e/suite-reading-room.ts` (PR 4) and `scripts/e2e/suite-document-rooms.ts` (single file, checked); `legendRoom` in suite-broadside (single file, checked).
- `specs/engine-invariants.md`: `R4` in suite-render and `H11`/`H12` in suite-hunt (single files, checked).
- `specs/site-architecture.md`: the engine-serving bullet (`scripts/e2e/harness.ts` strips types from `src/*.ts`), PR 1; the containment sweep's home among a new suite's rosters, PR 1.
- The CSS comment citations are guarded (`test/repo/comment-citations.test.ts` reds when the symbol leaves the cited file) and re-point when their check moves. The full list (`git grep -nE '[A-Za-z0-9_]+` in `scripts/e2e/' -- public src test scripts`): `P2c` in suite-cards (`public/living-chart.css`, `public/motion.css`, PR 4); `L1i` in suite-landfall (`public/index.css`, PR 6); `RR34` in suite-reading-room (`public/reading-room/index.css`, PR 4); `RH9b` in suite-runninghead (`public/atelier.css`, `public/index.css`, PR 3); `BR2`, `BR1b` and `BR6c` in suite-broadside (`public/atelier.css`, `public/explorer/broadside.css`, `public/explorer/index.css`, PR 2, only if broadside takes a folder, as does `legendRoom` in settle-doctrine); `LAST_INSET` in suite-region-detail and `RS22` in suite-room-ink (single files, unchanged).

## 4. Pull requests (menu item 3)

Recommended, seven, each suite whole in one PR:

| PR | contents | markers retired |
|---|---|---|
| 1, plumbing | the rebuilt scanner and its fixture test, the split proof and its test if kept (menu item 4), `e2eSuiteFamily`, the three readers, e2e-tiers rewired, settle-doctrine clause 4 and the two site-architecture lines, the harness (server out, `start` split), the fonts pin, and the `errata/guards.md` rows from PR #674 (e2e-tiers at 400, harness at 399) and PR #682 (a wait called through the context unread) deleted as fixed; no suite touched | 1 |
| 2, stepped single files | turn, verso, zoom-gestures, region-detail, ribbon, render, prospect, room-drawer, cluster, broadside, glass-ceremony, document-rooms | 15 |
| 3, unstepped single files and the near-cap folders | room-ink, room-address, room-voyage, room-voyage-route, hunt, runninghead, room-instrument, specimen | 8 |
| 4 | cards, reading-room, print-room | 7 |
| 5 | zoom, survey | 6 |
| 6 | home, landfall (with `measureEnters`) | 9 |
| 7 | chart-drawer; the close-out | 4 |

PR 1 carries the issue's frozen plan as `plans/673-plan.md`; each later PR archives its own reviewed design as `plans/673-<label>-plan.md` (Alex's ruling of 2026-09-26, Issue #693) and never edits the first. Each opens from a fresh branch off `origin/main` after the one before it merges. PR 7 closes the issue with the template's closing line; PRs 1 to 6 write `Issue: #673, stays open because ...` in its place, the template's form for a PR that deliberately leaves its issue open (PR #694 used it), and `closingIssuesReferences` is read empty on each.

## 5. Tests, each with the mutation that reds it

The suites get no new test: the CI lanes run them, and the check-list comparison is the evidence. The guards that watch them:

1. **`test/repo/e2e-containment.test.ts` (new), fixture families in memory**, each a `{ path, text }` list:
   - a. a wait called in `run` outside a step: one breach. Mutation: derive `run` like a helper; zero breaches, red.
   - b. a one-line step whose group function, in a part file, awaits `settle`: no breach; the same function called in `run` outside a step: one breach naming it. Mutation: read only the first file of a family; red.
   - c. render's shape, a named helper holding step callbacks that call a thrower, called in `run` outside a step: no breach. Mutation: stop excluding step callbacks from a helper's own body; a breach, red.
   - d. a helper declared inside a kit function, destructured from the kit and called in `run` outside a step: one breach. Mutation: skip consts nested in a function; red.
   - e. a `throw` in `run` outside a step: one breach; inside one: none. Mutation: ignore throw statements; red.
   - f. today's shape (three-line steps, helpers as consts inside `run`, a throwing helper called inside a step): no breach. Mutation: do not exclude nested named functions from the root's own body; a breach, red.
   - g. `e2eSuiteFamily` on a planted temp tree (a suite file, its folder, a nested file, a sibling suite whose name shares a prefix): exactly the suite and its folder. Mutation: prefix match instead of the folder; red.
   - h. a wait called through the context or the kit, `await ctx.waitSettled(...)` and `await k.go(...)` where `go` throws, in `run` outside a step: two breaches (the PR #682 errata row's class). Mutation: resolve callees by identifier only; red.
   - i. a chain two hops from a seed (a helper calling a helper that awaits `settle`), called in `run` outside a step: one breach. Mutation: one derivation pass instead of a fixpoint; red.
   - j. a helper whose body holds a `throw` and no wait, called in `run` outside a step: one breach. Mutation: seed throwers from the three names only; red.
   - k. an object-literal member that awaits `waitTurned`, called as `k.member()` in `run` outside a step: one breach. Mutation: leave object-literal members out of the named functions; red.
   - l. a wait awaited at module top level: one breach. Mutation: leave module top level out of the root; red.
   - **The first red**: the test is written against a stub `containmentBreaches` with the real signature that returns no breach, and fixture a reds on its breach count, 0 against the expected 1, not on a missing module.
2. **`test/repo/e2e-tiers.test.ts`, the three containment tests over the real families.** Mutations the guard-prover runs on the real tree: move one `await waitSettled(` in `suite-turn.ts` out of its step into `run`; red. From PR 2 on, call a split suite's group function in `run` without its step; red. Delete one step line; the roster test reds.
3. **`test/repo/console-support.test.ts`, all three arms.** Mutations: plant a file in a folder under `scripts/e2e` with an inline cancellation opening, then with an unfiltered accumulator read; each reds. Plant a folder file that calls `dropExpectedCancellations(` with a specifier that does not resolve to the module (`"./console-support.ts"` from one level down); the import arm reds, and with `"../console-support.ts"` it is green. Reverting the reader to the top level turns the first two green again, which proves the widening is what bites.
4. **`test/site/sheet-height.test.ts`.** Mutation: an off-derivation height literal in a planted folder file; red. The width witness: strip EVERY occurrence of the width literal from the home family (it sits at five lines in `suite-home.ts` today and will spread across group files); red. Stripping one occurrence cannot red it, so that is not the mutation.
5. **The e2e-tiers worker and fallback assertions.** Mutation: delete `serverState.blockWorker = true` from the reading-room family; red.
6. **`test/site/fonts.test.ts`.** Mutation: change the `.woff2` MIME in `scripts/e2e/site-server.ts`; red.
7. **If the split proof is kept (menu item 4): `test/repo/e2e-split-proof.test.ts`**, the ten fixture pairs of section 6 item 4 as in-memory cases, each with its expected verdict. Mutations: drop the numeric kind from the literal set (the changed sleep passes, red); key by lexical position instead of resolving through calls (the pure move across two files DIFFs, red); stop keying by step (the check moved into a step passes, red).

`vellum-guard-prover` runs on 1 to 6 (and 7, if the proof is kept) in PR 1, and again on the real-tree containment test the first time real code takes each new shape, because in PR 1 the one-line step, the group function and the part folder exist only in fixtures, and a guard green against real code it was never tried on is untested there: in PR 2 (the first one-line-step suites) a group function called in `run` outside its step, and a wait moved from a group function into `run`; in PR 3 (the first folder suites) a throwing group function in a part file called outside its step. And in any later PR that changes a guard. A mutation not reached in its budget is named unproven.

## 6. Evidence, per PR

1. `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`, which restores the generated assets `npm test` deletes).
2. Markers: `grep -rnE "eslint-disable[^*]*max-(lines|lines-per-function|depth)" scripts/e2e scripts/e2e-explorer.ts scripts/e2e-lanes.ts | wc -l`: 50 at `fd23337`, falling by the PR's count, 0 after PR 7. The lint is what enforces the rules themselves.
3. Notes and condition markers travel: `grep -rn "@ts-expect-error" scripts/e2e scripts/e2e-*.ts | wc -l` stays 205 and `grep -rn "no-unnecessary-condition" scripts/e2e scripts/e2e-*.ts | wc -l` stays 75 (Issue #654's row 6 runs after this issue).
4. **The split proof** (built and proved during planning as `673-split-proof.ts <base>` in the lane's scratchpad; kept in the repo or not is menu item 4). It is the ONLY instrument for the issue's "not its settle, its budget": the check list cannot see a changed number. It compares: per suite family, and for the harness with `site-server.ts`, base against head, the multisets of string, template, regular-expression and NUMERIC literals (module specifiers excluded), of `evaluate` payload texts and of callee names, EACH KEYED BY THE STEP IT RUNS UNDER: the step whose callback holds it, resolved through calls (a group function takes the step whose one-line callback calls it; a helper called from several steps takes all of them; code outside every step is `unstepped`), the same resolution on both sides. Pass: every keyed literal and payload present at the same multiplicity; no call gone; the only calls added are to names the base family never called; note and condition-marker counts equal. Proved on ten fixture pairs (`673-fx/run-fixtures.ts`, 10 of 10 as expected): a pure move and a pure move across two files are `same`; a changed check name, a changed sleep, a dropped call, a changed payload, a re-indented payload line, a duplicated call, a check moved INTO a step and a sleep moved OUT of its step are each `DIFF`. On the unchanged tree it reports 42 families, 0 differing. It covers "the settle and the budget unchanged", which ids and counts cannot (recon item 4), and the plan skeptic's finding 6, a statement moved across a step boundary, which the check list cannot see. Blind spots it names: statement order within one step (a moved check shows in the CI order; a moved wait or gesture inside one group is read by eye in review), and a helper passed as a value rather than called by name, keyed `(never called by name)` on both sides (a miss when it moves between steps, since it keeps its key).
5. **The check lists, the issue's own acceptance.** Per lane, the names from the PR head's CI job log against the base commit's main CI job log: `gh run view --job <id> --log | grep -E '\] (PASS|FAIL)  ' | sed -E 's/^.*Z \[[AB]\] //' | perl -CSD -pe 's/  \x{2014} .*$//'` (the harness separates a check's detail with two spaces and an em-dash, U+2014, written by its code point here so no em-dash enters a body), then `diff`, empty, and the lane's `N/N checks` count equal. Measured on run 36253040431's lane A log: the same 309 names as the plain-text strip.
6. Local: `npm run build`, then ONE serial run of the PR's suites, `VELLUM_E2E_SUITES=<list> npm run test:e2e`, let run to completion (the runner adds the boot-draw suite itself). The full lanes are CI's. PR 1 touches no suite but moves the server they all stand on, so its local run takes the suites that lean on the server's two special paths: fallback, reading-room and print-room (`blockWorker`), and hunt, print-room and zoom (the type-stripped `/explorer/engine/` modules).
7. The merged state, before the hand-off: merge `origin/main` locally, run check, lint and the unit suite, abort the merge; the result goes in the body (workflow step 10).

## 7. Rosters and doctrine the change drags

- `test/repo/e2e-tiers.test.ts` (scan out, readers by family; `STEPPED_GROUPS` unchanged: no step renamed, added, removed or reordered), `test-support/e2e-containment.ts` (new), `test/repo/e2e-containment.test.ts` (new), `test-support/e2e-source.ts` (`e2eSuiteFamily`), `test/repo/console-support.test.ts`, `test/site/sheet-height.test.ts`, `test/site/fonts.test.ts`.
- `specs/settle-doctrine.md` (clause 4 in PR 1; the citations in 3.8 as their code moves), `specs/site-architecture.md` (two lines, PR 1), `specs/engine-invariants.md` (checked, expected unchanged).
- The guarded CSS citations in 3.8, as their checks move.
- `scripts/e2e/harness.ts` header line.
- `errata/guards.md`: PR 1 deletes the PR #674 row (e2e-tiers at 400, harness at 399) and the PR #682 row (a wait called through the context unread), both fixed there (`errata/README.md`: a fix that lands without deleting its row is incomplete). PR 7 deletes `- PR #663: promoted to Issue #673.` (the pointer leaves when the issue closes). New rows only for findings a PR does not fix, each on its own line, since Issue #654's lane writes this file too and the later PR merges main in.
- Issue #673: one new dated comment before each PR opens, with the relayed rulings and the lane's calls; the dated close-out of Issue #654's e2e size entries is posted here with PR 7, and Issue #654 gets a one-line dated comment linking it.
- Untouched: `eslint.config.ts`, `E2E_SUITE_ORDER`, `E2E_LANES`, the runner, `MEASURED_SECONDS`, `step-support.ts`, `settle-support.ts`, every note and condition marker.
- Handed to Issue #679: `e2eSuiteFamily` and the scanner name `scripts/e2e`, and its move re-points them; its `e2e/suites/<name>/` takes each folder here plus its suite file; and `scripts/e2e/site-server.ts` is a new top-level e2e module its ruled layout does not place (harness and types stay at the top, support modules go to `support/`), so Issue #679 decides where it goes.

## 8. Not this issue

Anything that changes what a check measures, its settle, its budget or its id; the notes and condition markers (Issue #654 row 6); new suites or a lane rebalance; seeding throwers from the shared support modules (the PR #572 errata row); `scripts/e2e-port-proof.ts` (Issue #679 rules its home and whether it learns renames).

## 9. Open decisions for Alex

1. How a split suite reads: one line per numbered group in the suite's main routine, the group's code in a named function, with the "every wait that can give up sits inside its numbered group" check rebuilt to read that shape and follow a suite into its folder (recommended; the biggest suite's main routine lands at about 45 of the 50 allowed lines); or keep each group's three-line wrapper and add a layer of phase functions, which still needs that check changed, and reads one level deeper.
2. Where a split suite's extra files live: a folder named for the suite (recommended; Issue #679's own layout, and two sweeps learn to look inside folders); or files side by side with the suite's name as a prefix (no sweep widens, but `room-voyage-` and `room-voyage-route-`, `zoom-` and `zoom-gestures-` collide as prefixes, and Issue #679 regroups them anyway).
3. How many pull requests: seven (recommended, section 4); or four (the plumbing with the stepped single files; the unstepped single files with cards; reading-room, print-room, zoom and survey; home, landfall and chart-drawer).
4. The proof that no number, message or page script changed (the check list alone cannot show a changed wait length or try count, and this proof is the only thing that can): keep it in the repo as `scripts/e2e-split-proof.ts` with its own fixture test, landed in PR 1, so a reviewer re-runs it from the repo and Issue #679's move can reuse it, since it compares a suite's files as a group rather than file by file (recommended; the precedent is Issue #653's kept port proof; the cost is one more tool and test in PR 1, which Issue #679 then moves into `e2e/`); or leave it as a throwaway tool whose command and full output go in each PR body, which no reviewer can re-run from the repo.
5. A type note or lint marker a move would leave covering nothing: restructure so none is touched, and stop and ask where that is impossible (recommended); or delete it and record each one on Issue #654.

## 10. Calls made by the lane

1. One suite over several files, no new runner suite (the issue's "into files"; Issue #679 ruling 1).
2. State crosses groups by return value and argument; `step-support.ts` unchanged.
3. One kit per suite for the helpers that close over the context; pure helpers to module level as they are.
4. Group functions named for their first check id and what they check.
5. Template continuation lines keep their bytes, so payloads are byte-identical.
6. No comment added; part files carry no header; comments travel.
7. The harness's server moves to `scripts/e2e/site-server.ts`; `ws` stays a module variable.
8. `measureEnters` is restructured, the one non-move, named in its PR.
9. Evidence of record: the CI check lists for both lanes (names and order), the split proof (settle, budget, payload and message text, keyed by step), and check, lint and the unit suite; locally one serial run of the PR's suites.
10. The close-out comment goes on Issue #673, as the acceptance says ("here"), with a one-line dated comment on Issue #654 linking it, so both readings are met; PR 7 deletes the errata pointer.
11. No new guard pins "zero size markers in the e2e tree": the lint refuses an unneeded marker and a new one is a reviewed choice; Issue #654's ruling 12 owns any list of kept skips.
12. The scanner lives in `test-support/`, because e2e-tiers is at 400 of 400 lines.
13. The console-support sweeps keep their current reach, `scripts/e2e` only with the runners outside, and gain depth.

## 11. The plan skeptic's findings, and what became of each

All thirteen folded in; none rejected.

1. BLOCKING, the close-out comment's home decided as a call against the acceptance's "here": dissolved, call 10. The close-out posts on Issue #673 and Issue #654 gets a dated link.
2. The chart-drawer `run` measured at exactly 50 lines under the draft's own rules: 3.1 now moves step-leading comments and one-off statements into their groups (about 45), with two routines in the suite file as the named fallback; menu item 1 carries the number.
3. Two open errata rows fixed by PR 1 and not deleted (PR #674, PR #682): PR 1 deletes both (section 4, section 7), the second pinned by fixture h.
4. Five scanner arms no fixture pinned: fixtures h to l added, each with its mutation, before the guard-prover runs.
5. The console-support import arm reds at depth on every folder suite that calls the drop: 3.7 makes it resolve the specifier; test 3 plants both spellings.
6. The split proof could not see a statement moved across a step boundary: the proof now keys every literal, payload and call by the step it runs under, proved on ten fixture pairs including a check moved into a step and a sleep moved out of one (section 6, item 4).
7. `specs/site-architecture.md` describes `serveEngineModule` as the harness's and names the containment sweep's home: PR 1 edits both; each PR greps `specs/` by file as well as by symbol.
8. The CSS citation list was incomplete: 3.8 now carries the full `git grep` list, with broadside hedged.
9. The template form for a PR that leaves its issue open: section 4 uses `Issue: #673, stays open because ...`.
10. No first red named: section 5 names it (fixture a, 0 breaches against 1, on a stub with the real signature).
11. `site-server.ts` missing from the hand-off to Issue #679: added in section 7.
12. PR 1 named no local suites: section 6 item 6 names fallback, reading-room, print-room, hunt and zoom.
13. The width-witness mutation could not red after a split: test 4 strips every occurrence.

## 12. Written after the plan skeptic ran, so not yet read cold

The 3.1 rule moving step-leading comments and one-off statements into their groups; the step-keyed split proof and its ten fixtures; fixtures h to l; the PR 2 and PR 3 prover runs; the longest-statement measurement in 3.2; menu item 4's reframing (the proof as the only instrument for settle and budget, recommended kept). None is expected to block; the cold `vellum-pr-skeptic` on PR 1 reads them first.

## 13. Alex's rulings, 2026-09-26, relayed by the dispatcher

All five menu items ruled as recommended, and all thirteen lane calls stand (none overruled):

1. **Split shape: A.** Each suite's `run` lists its numbered checks one line each, each check's code moved verbatim into its own named function; the containment guard is rebuilt on the syntax tree to read this shape and follow a suite into its folder.
2. **Extra files: A.** A folder per suite, `scripts/e2e/<name>/`.
3. **Pull requests: A.** Seven, as section 4 lays out.
4. **The split proof: A.** Kept in the repo as a small tool with its own test, landed in PR 1: `scripts/e2e-split-proof.ts` and `test/repo/e2e-split-proof.test.ts` (section 5 item 7).
5. **A note or marker a move would leave covering nothing: A.** Restructure so none is touched; where that is impossible, STOP and ask, and the dispatcher relays.

Process, relayed with the rulings: this file is archived as `plans/673-plan.md` in PR 1's first commit, pushed at that commit; PRs 2 to 7 each archive their own reviewed design as `plans/673-<label>-plan.md` where it goes beyond this plan (Issue #693); the rulings and the lane's calls are recorded in one new dated comment on Issue #673 before PR 1 opens; PR 1's first cold skeptic round is pointed at section 12 explicitly. One edit made at archive time, before the first commit: the section 3.1 example showed a one-off `send` kept in `run`, which the skeptic-driven rule in the same section had retired, so the example now shows an unstepped call.
