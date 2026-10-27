# Issue #814, pull request 3 of 8: the first half of the e2e tree (`e2e-a`)

**Planned at:** `origin/main` 7b0537559ec4d3b9a8f826e4cb2c3a0df6653d0e (PR #916, pull request 2, merged), Issue #814 comment count 10, the newest 6258530087 (the rulings comment for this slice), re-read at 2026-10-19T02:44Z after the ruling, with `git ls-remote origin refs/heads/main` and `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate --jq length`. Every line number below is the file's own at 7b053755, and every proof's base is 7b053755. No file under `e2e/` changed since 7207cfdd, where the issue-wide plan measured this slice (`git diff --stat 7207cfdd 7b053755 -- e2e` prints nothing, recon).
**Governing plan:** `handbook/plans/814/814-plan.md` on main (sha256 32d7dcbfe4d37e82d5a8334c30f52dbd64369581a0a9abc7ccd1c95dd0d61d50, archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K3 (an e2e suite or support file, which adopts Issue #673's construction rules as `node e2e/split-proof.ts <base>` reads them), "Rosters and doctrine, for every pull request", and its calls 1 to 15. Pull request 2's slice plan (`handbook/plans/814/814-tests-plan.md`) is the worked form this one follows: a tool writes each family's head from the base by line ranges, every written file's sha256 is given, and each family is a commit of its own. This file is the governing plan's table row 3, label `e2e-a`.
**Rulings:** https://github.com/ahl-gram/Vellum/issues/814#issuecomment-6258530087 (Alex, 2026-10-18, relayed by the orchestrating session): on the one question this slice brought back under ruling 2, how Landfall's `stageKit` is cut, where the shape he ruled for an oversized kit on Issue #673 (a chain of kits made in `run`) cannot keep this pull request's proof at 0 differ, his answer is **"A: helper beside the bundle (Recommended)"**: a small function beside the kit, `stageScrolls`, makes its four scroll helpers and hands them back, every check gets the same kit as today, and the split proof reads all 57 families unchanged. It bends the wording of Issue #673's frozen 3.1, and **the same shape applies to pull request 4's two oversized kits** (`readingRoomKit`, 60 lines, and `zoomKit`, 61). The nineteen Calls made were not put to him and stand as this plan's calls.
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-e2e-a-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 29 overruns of 21 files, every one measured at 7b053755 by the lint with this slice's 21 `eslint-suppressions.json` entries deleted (the red, commit 1). Lines of code as the lint counts them (blank lines and comments skipped).

| file | overruns |
|---|---|
| `e2e/harness.ts` | `start` 66 |
| `e2e/support/pace.ts` | `readPaceSweep` 59 |
| `e2e/suites/fallback.ts` | `run` 59 |
| `e2e/suites/motion.ts` | `run` 71 |
| `e2e/suites/cards/cap.ts` | `p20PinnedTakesPointer` 58, `p26TailScrolls` 58, `p24NothingToScroll` 58 |
| `e2e/suites/cards/hold.ts` | `holdKit` 55, `p33DragKeepsPin` 53, file 402 |
| `e2e/suites/cards/overlay.ts` | `p4Capital` 53 |
| `e2e/suites/chart-drawer/drag.ts` | `cd45SnapBack` 63 |
| `e2e/suites/chart-drawer/homes.ts` | `cd41CachedReturn` 58 |
| `e2e/suites/chart-drawer/prospect.ts` | `cd25CardPress` 72, `cd28PagePress` 77, `cd34PageRefusals` 61, `cd32MixedFolio` 53 |
| `e2e/suites/corners/floor.ts` | file 410 |
| `e2e/suites/document-rooms.ts` | `na3Floor` 65 (the file 394) |
| `e2e/suites/glass-ceremony.ts` | `g4InksIn` 53 |
| `e2e/suites/home/stations.ts` | `h14aFlight` 61 |
| `e2e/suites/hunt.ts` | file 503 |
| `e2e/suites/landfall/clamps.ts` | `l9dCeiling` 54 |
| `e2e/suites/landfall/controls.ts` | `l9fPipGestures` 64 |
| `e2e/suites/landfall/kit.ts` | `stageKit` 67, `gestureKit` 57 |
| `e2e/suites/landfall/page.ts` | `l1gKeys` 59 |
| `e2e/suites/landfall/seed.ts` | `l10NoScriptGet` 54 |
| `e2e/suites/landfall/touch.ts` | `l9aOneFinger` 56 |

Every cut moves whole statements, verbatim but for indentation, into a function the original calls at the same point, or whole groups into a new part file inside the suite's folder; two functions that cannot be cut at a statement within the bound take the replacement the governing design writes out in full for that case (The design, forms T and S). Nothing that runs changes: `node e2e/split-proof.ts 7b053755` reads all 57 families `same`, and the four CI lanes print the base's check names. The checks of the step `CD25, CD26, CD30`, which `E2E_SKIPS` skips (Issue #716), run in neither, so the `cd25CardPress` cut rests on the split proof alone (Tests and guards).

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 7b053755: 5 STALE, 41 CURRENT, 1 UNVERIFIABLE (per-function sizes, since its tree had no dependencies; measured here, the table above). Its ledger is `814-e2e-a-recon-ledger.md` in the scratchpad (sha256 38c06e71e2d6958329a1232b9a9c6fec3ab17dd02e0bbcaab3552178f5d19f99). What it changed:

- **No `STEPPED_GROUPS` and no containment scan remain** (STALE against the Issue #673 plans): Issue #824 replaced both with the lint rule `vellum/e2e-throw-inside-step` (`scripts/lint/e2e-steps.ts`), which `npm run lint` runs on every file under `e2e/suites/` and which follows a thrower across files with the type checker. So "nothing that can throw moves out of its step" is held by the lint at every family commit, beside the split proof.
- **Four e2e lanes, not two** (STALE against the governing table's "both CI lanes"): `.github/workflows/ci.yml` runs lanes A to D. This slice's suites: A (motion, glass-ceremony, cards, fallback, hunt), C (home, corners), D (landfall, chart-drawer, document-rooms); `e2e/harness.ts` runs in all four. The acceptance compares all four lanes (Evidence).
- **The guards' current names**: `test/repo/comment-citation.test.ts` (singular) and the lint rule `scripts/lint/comment-citation.ts`; there is no `e2e-type-notes` test (the split proof counts type notes and condition markers itself).
- **Citations that fix a check in its file**, each left where it is and the cuts chosen around it: `FL1` and `FL5` in `e2e/suites/corners/floor.ts` (`handbook/specs/cascade-traps.md` lines 52, 66, 93; `handbook/specs/site-architecture.md` line 121); `H11` and `H12` in `e2e/suites/hunt.ts` (`handbook/specs/engine-invariants.md` lines 239 and 245 to 248); `p31Keyboard` in `e2e/suites/cards/hold.ts` (`handbook/specs/settle-doctrine.md` line 294); `P19` in `e2e/suites/cards/cap.ts` (`handbook/specs/ui-design.md` line 382, inside `p19CardsFit`, untouched); the lint-guarded `P2c` in `e2e/suites/cards/overlay.ts` and `L1i` in `e2e/suites/landfall/page.ts`; `Emulation.setFocusEmulationEnabled` "at start up ... in `e2e/harness.ts`, inside a try/catch" (`handbook/specs/settle-doctrine.md` line 155), which moves with its `try` into `openSession`, still in `e2e/harness.ts` and still called by `start`; and `start()`'s "`return {...}` is the list" (`.claude/agents/vellum-plate-reader.md` line 44), which stays in `start`.
- **Readers outside the slice**: `test/e2e/corners.test.ts` imports `FLOOR_PAGES` from `corners/floor.ts` (it stays there); `test/e2e/pace.test.ts` imports `readPaceSweep` (it keeps its name and export); `test/repo/e2e-tiers.test.ts` runs fallback's `run` over a stand-in page and pins `waitSettled` and `waitTurned` as `harness.ts`'s only throwing waits; `test/repo/e2e-read-types.test.ts` pins `evaluate` and `send` as top-level declarations of `harness.ts` and a stated shape on every kept read. None of these moves.
- **Recon's open item 3 is not taken**: it read K3's "a part goes into the suite's own folder" as owing `fallback/` and `motion/` folders. A single-file suite keeps its groups in the suite file (Issue #673 pull request 2: "Every suite stays ONE file"), as fallback's own `b2bBackupOrder` already does; the folder rule is for part files (call 14).

## Specs

This slice's ruling (Issue #814 comment 6258530087) binds `stageKit`'s cut and pull request 4's two oversized kits. On top of the governing plan's Specs list (its e2e line: `handbook/specs/settle-doctrine.md`, no wait moves out of its step, and `handbook/specs/site-architecture.md`, "How a page is authored"): `handbook/specs/check-placement.md` "The lint" (the two e2e lint rules these moves cross, `vellum/e2e-throw-inside-step` and `vellum/e2e-console-read-through-drop`); `handbook/specs/settle-doctrine.md`'s environment section at line 155 and its viewport paragraph at lines 352 to 362 (document-rooms sizes its own viewport, in `run` and `na3Floor`, and both stay); `handbook/specs/cascade-traps.md` lines 52, 66 and 93 and `handbook/specs/engine-invariants.md` lines 239 to 248, for the checks that stay where they are cited; `handbook/specs/conventions.md` "How code is cited"; and `.claude/skills/vellum-footguns/SKILL.md` Gate 2 item 10 (the flake record) for the CI acceptance.

## The design

### The forms a cut takes here

- **H, the default.** A contiguous run of whole statements (one check with its own gesture, or a gesture, or a fixture read) moves into a module-level function declared directly above the function that calls it, called at the point the run stood. Where the caller holds its kit or context by name (`k`, `ctx`), the helper takes it by that name; where the caller destructures its kit in its signature, the helper takes a bag of exactly the shorthand names it uses and destructures them in its own signature, typed `Pick<Kit, ...>` on the caller's kit type (Issue #673 pull request 2, rules 6 and 7). A helper that hands values back ends `return <the caller's binding>;`, token for token, and an async one is awaited at its call. It writes into nothing it is handed: a list its closures fill is declared inside it and handed back (governing call 13). Every hand-back here binds a `const` local to the function that calls the helper, never a `let` of `run` or a binding that outlives its step, so Issue #673 pull request 2 rule 6a (a value handed back across a later throw) does not bear on any of them.
- **D, a kit over the cap whose longest helpers only act (`holdKit`, `gestureKit`).** Every helper stays declared in its kit, as Issue #673's frozen 3.1 has it and Alex ruled it stands (Issue #673 pull request 6, ruling 1); the whole block body of a helper that hands nothing back moves to a module-level function that takes the context members it uses by name, and the helper calls it. That function closes over nothing, which is where 3.1 puts such a function. `press` calls `pressPair`; `pressNav` calls `navKeys` and `twoFingerDrag` calls `twoFingers`.
- **K, `stageKit` only, as Alex ruled (comment 6258530087, option A).** Its helpers are one-expression reads or hand back a value, which a call cannot stand in for, so form D moves at most 9 of its 67 lines (counted from the measured 67: two loops and one two-line body), leaving 58. So a contiguous run of its helper declarations, the four scroll helpers, moves into a function the kit calls at their place, which declares them as they are and hands them back by name; the kit's returned bag is unchanged, so every group still reads the same kit. It bends 3.1's "inside ONE kit function", where Alex's earlier answer for an oversized kit, a chain of kits made in `run`, would have had the proof read Landfall as changed (measured, Open decisions); he ruled this shape for it, and the same shape governs pull request 4's `readingRoomKit` (60) and `zoomKit` (61).
- **T, `h14aFlight` only.** Its 55-line `for` is one statement, and moved whole into a helper it would be 59 lines; so the 16-line type literal of the loop's one read moves, verbatim, to `type Visited` directly above the function, and no statement moves (the governing design's clause for a body that "cannot be cut at a statement": the replacement is written out in full here). Types are stripped before the split proof reads anything, so it reads the family the same; the type checker reds a retyped field that a check reads (prover row S1), and Appendix C's hash is what pins the moved literal byte for byte.
- **S, `l10NoScriptGet` only.** Its body is one 44-line statement (the scripts-off arm); moved whole into a helper with its seven-name bag in the signature as Prettier lays it, the helper would be 54 lines. So its signature takes the kit by name and destructures it in its first line, `export async function l10NoScriptGet(k: LandfallKit): Promise<void> {` and `const { evaluate, send, check, sleep, PORT, clickAt, centerOf } = k;`, the house's form where a function needs the kit by name (`na3Floor` in `e2e/suites/document-rooms.ts`; Issue #673 pull request 7, rule 5), under the same clause. The proof drops a shorthand destructure, and the type checker holds every name to the kit.
- **What discharges the governing clause for T and S** ("the output it feeds is compared byte for byte"): the code the proof reads after types are stripped. For T it is identical, so the proof reads home `same`; for S the one change is the destructure, which the proof drops and the type checker holds to `LandfallKit`. Appendix C's hashes pin every byte of both files.
- **C, `cd32MixedFolio` only.** Its 18-line payload `PFM`, a template with no substitution (so a primitive, position-free constant to the proof), moves to module level directly above the comment that leads the function (Issue #673 pull request 7, rule 7, `SEATS`; pull request 2, rule 8).
- **F, a file over 400 lines, or one an in-file cut would take past 395.** Whole groups move, by topic, to a new part file in the suite's own folder; a group a spec cites by file stays (Recon). A part file takes the types it needs from its suite file by `import type`, exported there, as `glass-ceremony/` and `zoom-gestures/` already do.

The margins are the governing plan's: no file over 395 lines of code, and no function this slice writes or shortens over 48.

### Per family

Head sizes measured on the dry runs, after `npm run format`, by `814-tests-size.ts` (lines of code). "Call" is the line that replaces the moved run, at its place.

| function (base) | form | moved | the new function and its call | head |
|---|---|---|---|---|
| `start` 66 | H | lines 325 to 346: the server, the browser, the socket and its listener, the domain enables, the focus emulation with its `try` and comment, the navigate | `openSession({ browser, SITE, OUT, PORT, DPORT, PAGE, consoleErrors, http4xx }: Omit<StartOptions, "results" \| "skippedGroups" \| "skippedChecks">): Promise<void>`, 31; call `await openSession({ browser, SITE, OUT, PORT, DPORT, PAGE, consoleErrors, http4xx });` | 47 |
| `readPaceSweep` 59 | H | 87 to 104: the continuity scan | `continuity(samples: readonly PaceSample[], opts: PaceSweepOpts, span: number)`, 20, ending `return { backward, jump, jumpAllowed };`; call `const { backward, jump, jumpAllowed } = continuity(samples, opts, span);` | 43 |
| fallback `run` 59 | H | 37 to 58: B3's step body, its comment with it | `b3InlineAtlas({ evaluate, check, waitSettled }: SuiteContext): Promise<void>`, 23, below `b2bBackupOrder`; the step line `await step("B3", () => b3InlineAtlas(ctx));`; `run`'s destructure loses `waitSettled` | 37 |
| motion `run` 71 | H | 10 to 30 and 33 to 48: the two step bodies | `d1ArrivalCeremony({ evaluate, check, waitSettled }: SuiteContext): Promise<void>` 23 and `d3DragQuiet({ evaluate, check, sleep, waitSettled }: SuiteContext): Promise<void>` 18, below `run`; the step lines `await step("D1, D2", () => d1ArrivalCeremony(ctx));` and `await step("D3", () => d3DragQuiet(ctx));`; `run`'s destructure becomes `{ evaluate, check }` | 32 |
| `p20PinnedTakesPointer` 58 | H | 33 to 50: the unpinned read with its comment, its throw, the real press | `p20PressKralgov({ evaluate, send }: Pick<CardsKit, "evaluate" \| "send">)`, 20, ending `return at;`; call `const at = await p20PressKralgov({ evaluate, send });` | 42 |
| `p26TailScrolls` 58 | H | 118 to 150: P27 | `p27PageDown({ evaluate, send, check, sleep }: Pick<SuiteContext, "evaluate" \| "send" \| "check" \| "sleep">): Promise<void>`, 39; call `await p27PageDown({ evaluate, send, check, sleep });` | 27 |
| `p24NothingToScroll` 58 | H | 227 to 247: the real press and the pinned read | `p24PinKralgov({ send, settle }: Pick<CardsKit, "send" \| "settle">, at: Point)`, 24, ending `return card;`; call `const card = await p24PinKralgov({ send, settle }, at);` | 38 |
| `p4Capital` 53 | H | 112 to 138: P5b's `if`/`else`, its comment with it | `p5bRealmSeat({ evaluate, check, shoot, sleep }: Pick<SuiteContext, "evaluate" \| "check" \| "shoot" \| "sleep">, pm: Manifest): Promise<void>`, 31; call `await p5bRealmSeat({ evaluate, check, shoot, sleep }, pm);` | 28 |
| `holdKit` 55 | D | 37 to 52: `press`'s two sends | `pressPair({ send }: Pick<SuiteContext, "send">, p: Point, clickCount: number): Promise<void>`, 18, above `holdKit`; `press` keeps its signature and calls `await pressPair({ send }, p, clickCount);` | 40 |
| `p33DragKeepsPin` 53 | H | 220 to 244, inside the `for` block: the move to `b` and the drag | `p33DragFrom(k: Kit, b: Mark): Promise<void>`, 27; call `await p33DragFrom(k, b);` | 29 |
| `cd45SnapBack` 63 | H | 33 to 68: CD45's check | `cd45FilesNothing(check: DragKit["check"], before: Carry, mid: Carry, snapped: Carry, jiggled: Carry, clicked: Carry): void`, 45; call `cd45FilesNothing(check, before, mid, snapped, jiggled, clicked);` | 28 |
| `cd41CachedReturn` 58 | H | 246 to 278: CD42 with its comment | `cd42TakesDevice({ evaluate, check, sleep, restedAtExplorer }: Pick<TableKit, "evaluate" \| "check" \| "sleep" \| "restedAtExplorer">): Promise<void>`, 33; call `await cd42TakesDevice({ evaluate, check, sleep, restedAtExplorer });` | 33 |
| `cd25CardPress` 72 | H | 38 to 70: CD26 | `cd26DrawsPlate({ check, settle, pressCard }: Pick<DrawerKit, "check" \| "settle" \| "pressCard">, armed: Card): Promise<void>`, 36; call `await cd26DrawsPlate({ check, settle, pressCard }, armed);` | 42 |
| `cd28PagePress` 77 | H | 157 to 194: CD29's second year, with its two comments, and CD29's check | `cd29SecondYear({ evaluate, check, sleep, settle, clickAt }: Pick<DrawerKit, "evaluate" \| "check" \| "sleep" \| "settle" \| "clickAt">, one: Pp)`, 42, ending `return two;`; call `const two = await cd29SecondYear({ evaluate, check, sleep, settle, clickAt }, one);`, then the base's `return two;` | 42 |
| `cd34PageRefusals` 61 | H | 236 to 262: CD35's press, its comment, the dwell and the check | `cd35NothingLaid({ evaluate, check, sleep, clickAt }: Pick<DrawerKit, "evaluate" \| "check" \| "sleep" \| "clickAt">, atCapPage: Pp): Promise<void>`, 31; call `await cd35NothingLaid({ evaluate, check, sleep, clickAt }, atCapPage);` | 36 |
| `cd32MixedFolio` 53 | C | 303 to 320: `PFM` | none; `PFM` stands at module level between `cd31RoundTrip` and the comment at 290 | 35 |
| `na3Floor` 65 | H | 297 to 318: the three presses and the landing | `na3Presses(k: DocRoomsKit, scrolled: Index)`, 26, opening `const { evaluate, settle } = k;` and ending `return { fold, folded, tab, back, entry, landed };`; call `const { fold, folded, tab, back, entry, landed } = await na3Presses(k, scrolled);`; `na3Floor`'s destructure loses `settle` | 44 |
| `g4InksIn` 53 | H | 205 to 236: G4's read | `g4ReadInk({ evaluate }: Pick<GlassKit, "evaluate">)`, 35, ending `return g4;`; call `const g4 = await g4ReadInk({ evaluate });` | 22 |
| `h14aFlight` 61 | T | the type literal, 16 to 30 | `type Visited = { ... };` above the function; line 15 with 31 becomes `visited = await evaluate<Visited \| null>(` and the template, unchanged | 45 |
| `stageKit` 67 | K, as ruled | 35 to 60: `scrollToTop`, `freshGesture` with its comment, `readHint`, `scrollToFloor` | `stageScrolls({ evaluate, sleep, scrollY }: Pick<StageKit, "evaluate" \| "sleep" \| "scrollY">)`, 28, ending `return { scrollToTop, freshGesture, readHint, scrollToFloor };`; call `const { scrollToTop, freshGesture, readHint, scrollToFloor } = stageScrolls({ evaluate, sleep, scrollY });` | 43 |
| `gestureKit` 57 | D | 84 to 91: `pressNav`'s two sends; 103 to 112: `twoFingerDrag`'s gesture and settle | `navKeys({ send }: Pick<SuiteContext, "send">, key: string, code: string, vk: number, text: string \| undefined): Promise<void>` 16 and `twoFingers({ touch, sleep }: Pick<SuiteContext, "touch" \| "sleep">, p: Point, sx: number, sy: number): Promise<void>` 17, above `gestureKit`; `pressNav` and `twoFingerDrag` keep their signatures and call `await navKeys({ send }, key, code, vk, text);` and `await twoFingers({ touch, sleep }, p, sx, sy);` | 41 |
| `l9dCeiling` 54 | H | 9 to 20: the saturating pinches with their comment | `l9dSaturate({ sleep, pinch, camNow }: Pick<LandfallKit, "sleep" \| "pinch" \| "camNow">, stagePt9: Point \| null)`, 17, ending `return top9;`; call `const top9 = await l9dSaturate({ sleep, pinch, camNow }, stagePt9);` | 44 |
| `l9fPipGestures` 64 | H | 52 to 73: L9g | `l9gPipTap({ evaluate, check, sleep, touch, pressKey }: Pick<LandfallKit, "evaluate" \| "check" \| "sleep" \| "touch" \| "pressKey">): Promise<void>`, 30; call `await l9gPipTap({ evaluate, check, sleep, touch, pressKey });` | 43 |
| `l1gKeys` 59 | H | 185 to 203: the five key presses, the camera read and L1g's check; `keyRuns` and `keyScroll`, which closes over it, stay in the group | `l1gKeyRuns({ check, camNow, pressNav }: Pick<LandfallKit, "check" \| "camNow" \| "pressNav">, keyScroll: (label: string, setupY: number, fire: () => Promise<void>, moved: (y: number, y0: number) => boolean) => Promise<void>, keyRuns: readonly { label: string; y0: number; y: number; ok: boolean }[], keyCamBefore: Awaited<ReturnType<LandfallKit["camNow"]>>): Promise<void>`, 31; call `await l1gKeyRuns({ check, camNow, pressNav }, keyScroll, keyRuns, keyCamBefore);` | 41 |
| `l10NoScriptGet` 54 | S | none | the signature and first line above | 47 |
| `l9aOneFinger` 56 | H | 26 to 49: the mouse witness drag | `l9aMouseWitness({ send }: Pick<LandfallKit, "send">, stagePt9: Point \| null): Promise<void>`, 26; call `await l9aMouseWitness({ send }, stagePt9);` | 33 |

The file moves (form F), each group whole with the comments that lead it:

- **`e2e/suites/cards/hold.ts` (402 to 373)**: P30, the tablet (`TABLET`, `TAPLOG` with its comment, `p30Tablet`; lines 372 to 410), goes to `e2e/suites/cards/hold-tablet.ts` (38), which takes `holdKit` by `import type` and declares `type Kit = ReturnType<typeof holdKit>;`, as `cards/gestures.ts` does. `p31Keyboard` stays. `e2e/suites/cards.ts` imports `p30Tablet` from the new file.
- **`e2e/suites/corners/floor.ts` (410 to 373)**: FL6, paper (`PRINTED` with its comment, `fl6Paper`; lines 371 to 409), goes to `e2e/suites/corners/floor-paper.ts` (39), importing `load` and `size`, which gain `export` in `floor.ts`. FL1 and FL5 stay (cited), and so does `FLOOR_PAGES`. `e2e/suites/corners.ts` imports `fl6Paper` from the new file.
- **`e2e/suites/document-rooms.ts` (394 to 355)**: an in-file cut of `na3Floor` alone takes it to 399 (measured), past the 395 margin, so IX8, the landmark (`AxNode`, `LANDMARKS`, `roomName`, `ix8Landmark` with its comment; lines 372 to 419), goes to `e2e/suites/document-rooms/landmark.ts` (46), which takes `DocRoomsKit` by `import type`, exported from `document-rooms.ts`. The suite file imports `ix8Landmark`.
- **`e2e/suites/hunt.ts` (503 to 315)**: the HG groups alone leave 409, so two topics go: the solved day, HD1 and H8 (`hd1Dispatch`, `h8Reload`; lines 259 to 359), to `e2e/suites/hunt/solved.ts` (97), and the zoomed hunt, HG0 to HG4 (`hg0Boots`, `hg1Zoom`, `hg2Taps`, `hg4Solves`; lines 361 to 461), to `e2e/suites/hunt/zoomed.ts` (100). `Zoom`, `HuntKit` and `Quarry` gain `export` in `hunt.ts` and reach the parts by `import type`. H11 and H12 stay (cited), with `huntQuarry`, `run` and the H9 to H12 groups.

`e2e/suites/chart-drawer/reads.ts` exports its existing `Carry` and `Pp` types, which the CD45 and CD29/CD35 helpers' parameters name (form H's "typed on the value's type at its old site"); `drag.ts` takes `Carry` by `import type` and `prospect.ts` adds `type Pp` to its existing import from `./reads.ts`.

### Measured on the dry runs of the whole slice

The base exported from 7b053755 into a scratch folder (the planning tree holds no production code), the slice written there by `814-e2e-a-split.ts` with the prune and the ceilings, then `npm run format` over the whole tree. The final run was built that way from a fresh export with the tool as Appendix B gives it, after the cold read (The plan skeptic's findings); the runs before it, which carried the first draft's kit parts, match it file for file but `e2e/suites/cards/hold.ts`, `e2e/suites/landfall/kit.ts` and `e2e/suites/landfall/page.ts` (`diff -rq` printed nothing else outside the generated folders), and every Appendix C hash is the final run's. On the final run: `npm run check` exit 0; `npm run lint` exit 0; `npm run format:check` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` wrote a file byte-identical to `814-prune.ts`'s; the split proof (`814-e2e-a-proof.ts`, `e2e/split-proof.ts`'s own `main` over a tree that is not a git checkout) read `57 families against 7b053755...: 0 differ`, the slice's families at `cards: 8 -> 9 files`, `chart-drawer: 12 -> 12`, `corners: 4 -> 5`, `document-rooms: 2 -> 3`, `e2e/harness.ts: 2 -> 2`, `e2e/support/pace.ts: 1 -> 1`, `fallback: 1 -> 1`, `glass-ceremony: 3 -> 3`, `home: 10 -> 10`, `hunt: 4 -> 6`, `landfall: 12 -> 12`, `motion: 1 -> 1`; the whole unit suite gave the same outcome as the same suite on an untouched copy of the base (2709 tests, 17 failing in both, the two logs each printing `fatal: not a git repository` 21 times, since a copy has no `.git` for the tests that list tracked files; `diff` of the two failure lists printed nothing); and the 22 unit files that read the e2e tree, run together by `814-tests-counts.ts`, passed 195 of 195 in the planning tree at the base, and 193 of 195 in both copies (the same two git-listing tests). In a git checkout `npm test` passes 2717 of 2717 at 7b053755 (measured in the planning tree); this slice adds and removes no test.

The 20 prover rows (Tests and guards) were each planted on the final run and read as the table says, and the tree read 0 differ again after them. The plan skeptic rebuilt the first draft's slice in a git checkout and measured `npm test` there at 2717 of 2717 at the head as well.

### Alternatives rejected

- **A new file beside `e2e/harness.ts` or `e2e/support/pace.ts`.** `familyOf` in `e2e/split-proof.ts` makes any such file a family of its own, so the old family would read a function gone (recon, section 5); both files have room for an in-file helper (349 and 109).
- **Moving a cited group** (FL1, FL5, `p31Keyboard`, H11, H12): the governing "Citations hold" keeps a check prose cites by file in that file, and in each case another group moves cleanly.
- **Typing a helper's bag by a local alias, or re-laying every cut group's signature to take its kit by name**: an alias names nothing a reader needs, and the re-lay departs from Issue #673 pull request 2 rule 7 in sixteen groups where the bag in the signature fits within the bound. Only `l10NoScriptGet` takes form S, where no statement cut fits.
- **`h14aFlight`'s loop into a helper** (59 lines by count) and **the loop's one read into a helper** (52 by count): both over the bound; form T moves no statement.
- **`l10NoScriptGet`'s scripts-off statement into a helper**: 54 lines by count with its bag in the signature as Prettier lays it; 46 only with an invented alias, leaving `l10NoScriptGet` an 11-line function that destructures seven names to bag them again.
- **A helper for `PFM` and its poll in `cd32MixedFolio`**: form C moves the one declaration and writes no function, as `SEATS` did.
- **The first draft's form K for `holdKit` and `gestureKit`** (a part beside each kit declaring `move`, `press`, `tap`, and `seedShown`): it reads `same`, but it departs from 3.1's "inside ONE kit function" where form D, which departs from nothing, fits (`holdKit` 40, `gestureKit` 41, measured; the plan skeptic's finding 1).
- **The kit chain Alex ruled for landfall (Issue #673 pull request 6) for all three kits**: measured on a copy of the first draft's head, `tsc` and the lint exit 0, but the proof reads two families changed: cards (`run`'s `hk = holdKit ( hp ) ;` against the base's `hk = holdKit ( { ... ctx , settle } ) ;`, and `holdKit`'s returned list) and landfall (`run`'s `k1 = gestureKit ( ks ) ;`, and the lists `gestureKit` and `stageKit` return). A kit the base already calls from `run` keeps its call's text only if no link is added before it, and the proof compares a base-named function's call as text.
- **`l1gKeys` cut by moving `keyRuns` and `keyScroll` together into a part that hands both back** (the first draft's `l1gKeyScroll`): `keyScroll` closes over `keyRuns`, a value the group makes, and Issue #673 pull request 6 rule 8 (call 45) keeps such a helper in its group; the cut at the five presses and the check keeps it there (`l1gKeys` 41, measured).
- **`stageKit`'s readers (12 to 34: `armWheelLog`, `lastWheel`, `camNow`, `camScale`, `scrollY`, `centerOf`, `wheelAt`) as its part under the ruled shape**: it fits too (`stageKit` 47, measured on the first dry run), but nine names cross against the scroll run's seven, with four lines less headroom, and pull request 2's call 1 takes the cut that leaves the most headroom and moves the fewest shared names. The scroll run's part types its parameter on `StageKit`, the kit's own return type, which the type checker resolves (measured: `tsc --noEmit` exit 0), since the three names it picks do not depend on the part.
- **`cd28PagePress` cut at the whole of CD29 (151 to 194)**: its helper would be 48 by count, at the bound; cut at CD29's second year (157 to 194) both functions measure 42.
- **`corners/floor.ts` giving FL4** (the header's last claim would leave the file) **or FL6 with FL7** (three shared names, and no one topic): FL6 alone leaves 373 lines and shares two names.
- **`hunt.ts` giving the HG groups alone**: 409.
- **A `fallback/` and a `motion/` folder**: Recon.

## Files

The ruling changes no file in this list: the plan built the ruled option already, `stageScrolls` in `e2e/suites/landfall/kit.ts` included.

Created (5): `e2e/suites/cards/hold-tablet.ts`, `e2e/suites/corners/floor-paper.ts`, `e2e/suites/document-rooms/landmark.ts`, `e2e/suites/hunt/solved.ts`, `e2e/suites/hunt/zoomed.ts`; and `handbook/plans/814/814-e2e-a-plan.md` (this file).

Edited (26): `e2e/harness.ts`, `e2e/support/pace.ts`, `e2e/suites/fallback.ts`, `e2e/suites/motion.ts`, `e2e/suites/cards.ts`, `e2e/suites/cards/cap.ts`, `e2e/suites/cards/overlay.ts`, `e2e/suites/cards/hold.ts`, `e2e/suites/chart-drawer/reads.ts`, `e2e/suites/chart-drawer/drag.ts`, `e2e/suites/chart-drawer/homes.ts`, `e2e/suites/chart-drawer/prospect.ts`, `e2e/suites/corners.ts`, `e2e/suites/corners/floor.ts`, `e2e/suites/document-rooms.ts`, `e2e/suites/glass-ceremony.ts`, `e2e/suites/home/stations.ts`, `e2e/suites/hunt.ts`, `e2e/suites/landfall/kit.ts`, `e2e/suites/landfall/clamps.ts`, `e2e/suites/landfall/controls.ts`, `e2e/suites/landfall/page.ts`, `e2e/suites/landfall/seed.ts`, `e2e/suites/landfall/touch.ts`; `eslint-suppressions.json` (21 entries out, 50 left); `test/repo/lint-config.test.ts` (21 `LIST_AT_REFORMAT` lines out, and nothing else). Nothing else: no spec, no errata row, no file under `src/`, `scripts/`, `.claude/` or `test-support/`, no roster.

Exports added: `export` on `Carry` and `Pp` (`chart-drawer/reads.ts`), `size` and `load` (`corners/floor.ts`), `DocRoomsKit` (`document-rooms.ts`), `Zoom`, `HuntKit`, `Quarry` (`hunt.ts`), and on each group that moves to a new part file (`p30Tablet` already was; `fl6Paper` already was; `ix8Landmark`, `hd1Dispatch`, `h8Reload`, `hg0Boots`, `hg1Zoom`, `hg2Taps`, `hg4Solves` gain it). No helper this slice writes is exported. Appendix A is every range in prose; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path; `<base>` is 7b0537559ec4d3b9a8f826e4cb2c3a0df6653d0e):

- **Reused, unchanged**: `814-prune.ts` (sha256 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032, the governing plan's Appendix B), `814-tests-size.ts` (b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43) and `814-tests-counts.ts` (e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04), both pull request 2's Appendix B. Check with `shasum -a 256`; a file missing or different is written again from that appendix.
- **This slice's**, written exactly as Appendix B gives them, the planning copies already in the scratchpad under these names: `814-e2e-a-split.ts` (the family tool), `814-e2e-a-checknames.ts` (one lane's check names, base against head), `814-e2e-a-proof.ts` and `814-e2e-a-bite.ts` (the prover's rows), `814-e2e-a-typeprobe.ts` (the prover's row S1). Their sha256 are in Appendix B.

## Commits

Branch `chore/814-size-e2e-a`. Each family commit is: run the family tool for it, `npm run format`, then the checks named, then commit. "The family's files" are the files the table names for it.

**Commit 1: the plan and the red.**

1. Copy this file to `handbook/plans/814/814-e2e-a-plan.md`.
2. `node <scratch>/814-prune.ts <repo> e2e/harness.ts e2e/suites/cards/cap.ts e2e/suites/cards/hold.ts e2e/suites/cards/overlay.ts e2e/suites/chart-drawer/drag.ts e2e/suites/chart-drawer/homes.ts e2e/suites/chart-drawer/prospect.ts e2e/suites/corners/floor.ts e2e/suites/document-rooms.ts e2e/suites/fallback.ts e2e/suites/glass-ceremony.ts e2e/suites/home/stations.ts e2e/suites/hunt.ts e2e/suites/landfall/clamps.ts e2e/suites/landfall/controls.ts e2e/suites/landfall/kit.ts e2e/suites/landfall/page.ts e2e/suites/landfall/seed.ts e2e/suites/landfall/touch.ts e2e/suites/motion.ts e2e/support/pace.ts` prints `21 entries deleted, 50 left`.
3. `node <scratch>/814-e2e-a-split.ts <repo> <base> ceilings` prints `ceilings: written`.
4. `shasum -a 256 eslint-suppressions.json test/repo/lint-config.test.ts` prints Appendix C's two hashes.
5. `npm run lint` exits 1 with exactly these 29 errors and no other (measured): `e2e/harness.ts` 312:8 `start` (66); `e2e/suites/cards/cap.ts` 32:8 `p20PinnedTakesPointer` (58), 92:8 `p26TailScrolls` (58), 209:8 `p24NothingToScroll` (58); `e2e/suites/cards/hold.ts` 33:8 `holdKit` (55), 205:8 `p33DragKeepsPin` (53), 426:1 `max-lines` (402); `e2e/suites/cards/overlay.ts` 90:8 `p4Capital` (53); `e2e/suites/chart-drawer/drag.ts` 7:8 `cd45SnapBack` (63); `e2e/suites/chart-drawer/homes.ts` 211:8 `cd41CachedReturn` (58); `e2e/suites/chart-drawer/prospect.ts` 16:8 `cd25CardPress` (72), 116:8 `cd28PagePress` (77), 198:8 `cd34PageRefusals` (61), 291:8 `cd32MixedFolio` (53); `e2e/suites/corners/floor.ts` 431:1 `max-lines` (410); `e2e/suites/document-rooms.ts` 287:1 `na3Floor` (65); `e2e/suites/fallback.ts` 5:8 `run` (59); `e2e/suites/glass-ceremony.ts` 201:1 `g4InksIn` (53); `e2e/suites/home/stations.ts` 9:8 `h14aFlight` (61); `e2e/suites/hunt.ts` 432:1 `max-lines` (503); `e2e/suites/landfall/clamps.ts` 5:8 `l9dCeiling` (54); `e2e/suites/landfall/controls.ts` 8:8 `l9fPipGestures` (64); `e2e/suites/landfall/kit.ts` 9:8 `stageKit` (67), 80:8 `gestureKit` (57); `e2e/suites/landfall/page.ts` 146:8 `l1gKeys` (59); `e2e/suites/landfall/seed.ts` 4:8 `l10NoScriptGet` (54); `e2e/suites/landfall/touch.ts` 8:8 `l9aOneFinger` (56); `e2e/suites/motion.ts` 5:8 `run` (71); `e2e/support/pace.ts` 68:8 `readPaceSweep` (59). The last line reads `29 problems (29 errors, 0 warnings)`.
6. `npm test -- test/repo/lint-config.test.ts` passes, 4 of 4. (Two of its four list tracked files with git, so the planning copies could run only the other two; those passed on the pruned list. Pull request 2's commit 1, the same kind of edit, measured 4 of 4.)
7. Commit `#814 The plan, and the lint red on the overruns pull request 3 splits`. Push.

**Commits 2 to 13: one family each, in this order.** For each, with `<family>` and the family's files from the table:

1. `node <scratch>/814-e2e-a-split.ts <repo> <base> <family>` prints `<family>: written`.
2. `npm run format`; then `npm run format:check` passes, and `git status --porcelain` names no file outside the family's files.
3. `node <scratch>/814-tests-size.ts <repo> 40 <the family's files>` prints the head sizes of the Per family table: every file at or under 395 and no function this slice writes or shortens over 48.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes.
6. `node e2e/split-proof.ts <base>` exits 0 and prints `same` on every one of its 57 family lines, the family's own at the file count the table gives, and the summary `57 families against <base>: 0 differ ...`.
7. `node <scratch>/814-tests-counts.ts <repo> <the 22 reader files, comma-separated, as in Evidence>` prints `exit 0, tests 195, pass 195, fail 0`.
8. Commit with the message in the table.

| # | family | the family's files | proof line | commit message |
|---|---|---|---|---|
| 2 | `harness` | `e2e/harness.ts` | `same  e2e/harness.ts: 2 -> 2 files` | `#814 The harness opens its session in a function of its own` |
| 3 | `pace` | `e2e/support/pace.ts` | `same  e2e/support/pace.ts: 1 -> 1 files` | `#814 The pace sweep reads its continuity in a function of its own` |
| 4 | `fallback` | `e2e/suites/fallback.ts` | `same  fallback: 1 -> 1 files` | `#814 The fallback suite's B3 takes a group of its own` |
| 5 | `motion` | `e2e/suites/motion.ts` | `same  motion: 1 -> 1 files` | `#814 The motion suite's two stepped checks take groups of their own` |
| 6 | `cards` | `e2e/suites/cards.ts`, `e2e/suites/cards/cap.ts`, `e2e/suites/cards/overlay.ts`, `e2e/suites/cards/hold.ts`, `e2e/suites/cards/hold-tablet.ts` | `same  cards: 8 -> 9 files` | `#814 The place cards' long groups call named parts, and P30 takes a file of its own` |
| 7 | `chart-drawer` | `e2e/suites/chart-drawer/reads.ts`, `e2e/suites/chart-drawer/drag.ts`, `e2e/suites/chart-drawer/homes.ts`, `e2e/suites/chart-drawer/prospect.ts` | `same  chart-drawer: 12 -> 12 files` | `#814 The chart drawer's long groups call named parts` |
| 8 | `corners` | `e2e/suites/corners.ts`, `e2e/suites/corners/floor.ts`, `e2e/suites/corners/floor-paper.ts` | `same  corners: 4 -> 5 files` | `#814 The floor's paper check takes a file of its own` |
| 9 | `document-rooms` | `e2e/suites/document-rooms.ts`, `e2e/suites/document-rooms/landmark.ts` | `same  document-rooms: 2 -> 3 files` | `#814 The document rooms' NA3 calls its presses, and IX8 takes a file of its own` |
| 10 | `glass-ceremony` | `e2e/suites/glass-ceremony.ts` | `same  glass-ceremony: 3 -> 3 files` | `#814 The Glass ceremony's G4 reads its ink in a function of its own` |
| 11 | `home` | `e2e/suites/home/stations.ts` | `same  home: 10 -> 10 files` | `#814 The Atlas station's flight names the shape it reads` |
| 12 | `hunt` | `e2e/suites/hunt.ts`, `e2e/suites/hunt/solved.ts`, `e2e/suites/hunt/zoomed.ts` | `same  hunt: 4 -> 6 files` | `#814 The Hunt's solved day and its zoomed play take files of their own` |
| 13 | `landfall` | `e2e/suites/landfall/kit.ts`, `e2e/suites/landfall/clamps.ts`, `e2e/suites/landfall/controls.ts`, `e2e/suites/landfall/page.ts`, `e2e/suites/landfall/seed.ts`, `e2e/suites/landfall/touch.ts` | `same  landfall: 12 -> 12 files` | `#814 The Landfall kits and long groups call named parts` |

After commit 13, `npm run lint` exits 0. Commit 13 builds `stageScrolls` in `landfall/kit.ts` as Alex ruled (comment 6258530087, option A), and commit 1's prune deletes all 21 entries, `e2e/suites/landfall/kit.ts`'s among them, since the ruling settles all 29 overruns in this pull request.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: byte-identical).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes 2717 of 2717 (measured at the base in the planning tree; the slice adds and removes no test), then `npm run astro:generate`.
- No e2e suite runs locally (governing call 14): the split proof reads every family the same, and CI runs all four lanes. A family the proof reads as changed is a stop, not a local run.
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword anywhere beside the number: `Issue: #814, stays open because five more pull requests follow (plan: handbook/plans/814/814-e2e-a-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.
- The body quotes the four lanes' and the three unit shards' job times beside main's run 39183355190 at 7b053755 (lanes A 7.5, B 8.5, C 7.9, D 7.3 minutes; shards 5.2, 5.0, 4.1; recon's reading of `gh run view 39183355190 --json jobs`).

## Tests and guards

No test is added or strengthened, so no new guard's red is written; the red is commit 1's lint. The guards these moves cross are the split proof (that every moved statement runs in its base order under its base step), the lint's `vellum/e2e-throw-inside-step` (that no thrower leaves its step) and `vellum/e2e-console-read-through-drop`, and the type checker (forms T and S, and every bag's names).

**`vellum-guard-prover` is owed the split proof over the shapes this slice puts into real code** (Issue #673's frozen plan, section 5: the proof is proved on real code the first time a shape reaches it), at the head sha, in its own sandbox. Each row is a one-line mutation of a head file, run alone, after which `node e2e/split-proof.ts <base>` must read the row's family `DIFF` (or `same` where named) and every other family `same`; `node <scratch>/814-e2e-a-bite.ts <sandbox> <base> <sandbox>` runs all of them through `e2e/split-proof.ts`'s own `compareFamilies` and restores each file byte for byte (Appendix B), exiting 0 only when every row reads as below; the prover's ledger quotes its output and the sandbox's head sha. Measured on the final dry run, each first line as printed:

| id | shape | file | mutation | expected, first line |
|---|---|---|---|---|
| M1 | a kit helper's body moved out (D) | `cards/hold.ts` | in `pressPair`, the pressed event's `buttons: 1,` becomes `buttons: 0,` | DIFF, `function press diverges at statement 1 of 2 -> 2` |
| M2 | the same, its argument not handed by name | `cards/hold.ts` | in `press`, `pressPair({ send }, p, clickCount)` becomes `pressPair({ send }, p, 1)` | DIFF, `a call to pressPair, a function the split made, is not read through: pressPair ( { send } , p , 1 )` |
| M3 | a kit's part (K, as ruled) | `landfall/kit.ts` | in `stageScrolls`' `scrollToFloor`, `i < 20` becomes `i < 19` | DIFF, `function scrollToFloor diverges at statement 1 of 6 -> 6` |
| M4 | a kit helper's body moved out (D) | `landfall/kit.ts` | in `twoFingers`, the first point's `p.x - 40` becomes `p.x - 41` | DIFF, `function twoFingerDrag diverges at statement 1 of 4 -> 4` |
| M5 | a helper in a family with no `run` | `e2e/harness.ts` | in `openSession`, `Log.enable` and `Network.enable` swap | DIFF, `function start diverges at statement 10 of 21 -> 21` |
| M6 | the same | `e2e/support/pace.ts` | in `continuity`, `if (i < 2) continue;` becomes `if (i < 1) continue;` | DIFF, `function readPaceSweep diverges at statement 12 of 29 -> 29` |
| M7 | a helper called inside a loop's block | `cards/hold.ts` | in `p33DragFrom`, `i <= 8` becomes `i <= 7` | DIFF, `function p33DragKeepsPin diverges at statement 16 of 22 -> 22` |
| M8 | a helper handed a group's closure | `landfall/page.ts` | in `l1gKeyRuns`, End's key code `35` becomes `36` | DIFF, `function l1gKeys diverges at statement 7 of 12 -> 12` |
| M9 | where a helper call stands | `cards/cap.ts` | in `p26TailScrolls`, the `p27PageDown` call moves above the `sleep(200)` before it | DIFF, `function p26TailScrolls diverges at statement 11 of 19 -> 19` |
| M10 | a helper never called | `chart-drawer/homes.ts` | the `cd42TakesDevice` call is deleted | DIFF, `cd42TakesDevice, a function the split made, is never read through` |
| M11 | an argument not handed by name | `landfall/clamps.ts` | `l9dSaturate(..., stagePt9)` becomes `l9dSaturate(..., null)` | DIFF, `a call to l9dSaturate, a function the split made, is not read through: ...` |
| M12 | a helper not awaited | `landfall/touch.ts` | `await l9aMouseWitness(...)` becomes `void l9aMouseWitness(...)` | DIFF, `a call to l9aMouseWitness, a function the split made, is not read through: ...` |
| M13 | a group moved whole to a new part file | `hunt/zoomed.ts` | in `hg4Solves`, `sleep(120)` becomes `sleep(100)` | DIFF, `function hg4Solves diverges at statement 3 of 7 -> 7` |
| M14 | a step body made a group | `fallback.ts` | in `b3InlineAtlas`, `"fallback-draw"` becomes `"fallback-drawn"` | DIFF, `run diverges at statement 35 of 48 -> 48` |
| M15 | the same, the order of two step lines | `motion.ts` | the two step lines swap | DIFF, `run diverges at statement 2 of 24 -> 24` |
| M16 | a hand-back that is not a bag of names | `document-rooms.ts` | `na3Presses`' return hands `folded: back` | DIFF, `a call to na3Presses, a function the split made, is not read through: na3Presses ( k , scrolled )` |
| M17 | a group moved whole to a new part file | `corners/floor-paper.ts` | in `fl6Paper`, `load(ctx, page, 640, 800)` becomes `641` | DIFF, `function fl6Paper diverges at statement 6 of 16 -> 16` |
| M18 | an argument not handed by name | `chart-drawer/prospect.ts` | `cd29SecondYear(..., one)` becomes `cd29SecondYear(..., pp)` | DIFF, `a call to cd29SecondYear, a function the split made, is not read through: ...` |
| M19 | the cut no CI lane runs (`CD25, CD26, CD30` is skipped) | `chart-drawer/prospect.ts` | in `cd26DrawsPlate`, `filed.imgs === 1 &&` becomes `filed.imgs === 2 &&` | DIFF, `function cd25CardPress diverges at statement 8 of 14 -> 14` |
| S1 | form T, held by the type checker and not the proof | `home/stations.ts` | `Visited`'s `arms: number;` becomes `arms: string;` | proof `same` (types are stripped first), and `node <scratch>/814-e2e-a-typeprobe.ts <sandbox>` prints `tsc exit 2` and `e2e/suites/home/stations.ts(93,7): error TS2367` |

Form C has no row: a primitive constant is position-free to the proof by its own named blind spot, and the dry run's `same` on chart-drawer with `PFM` moved is the witness that the move reads so. Form S has no row of its own: the proof drops the destructure, so a changed name there reads `same` and is the type checker's (a name not on `LandfallKit` fails `npm run check`).

**No bite-parity run on the e2e checks.** Governing call 10 owes bite parity on test helpers that hold assertions. Here the split proof establishes, for every moved statement and every `check` call among them, that it runs in the base's order under the base's step with the base's inputs, which is what bite parity would establish for a move, and the four lanes' check-name lists (Evidence) show every check that runs today still runs and passes. The one cut no lane exercises is `cd25CardPress`'s: `E2E_SKIPS` (`e2e/support/skips.ts`) skips the step `CD25, CD26, CD30` on purpose (Issue #716), so `cd26DrawsPlate` first runs when that issue is fixed, and it rests on the split proof alone (row M19 proves the proof reads into it). Bite parity on an e2e check would need a browser per row on the proof runner. The governing table names the split proof and the CI lanes as this row's proof (call 15 below).

## Rosters and doctrine

- **Joined by hand**: nothing. The new part files are imported by their suite files; `SOURCE_READS` reaches `e2e/**` by glob (recon), and no new file reads source; the lint's e2e block covers `e2e/**/*.ts`; `E2E_SUITE_ORDER`, `E2E_LANES`, `MEASURED_SECONDS` and `E2E_SKIPS` are keyed by suite name and step id, and no step is renamed, added, removed or reordered (the step strings `"B3"`, `"D1, D2"`, `"D3"` stay on their lines, and `"CD25, CD26, CD30"` in `e2e/suites/chart-drawer.ts` is not touched). `E2E_SKIPS` skips two steps this slice reaches, `CD25, CD26, CD30` (Issue #716) and `FL1` (Issue #894): FL1 is not cut, and the CD25 group's cut runs in no lane until Issue #716 is fixed (Tests and guards).
- **Readers held**: `test/site/sheet-height.test.ts`'s `1157.931` and `1500` literals stay inside the home and landfall families (form T moves types only); `test/repo/console-support.test.ts`'s more than ten files that hand `consoleErrors` to the drop are unchanged (no moved group reads the accumulator, and `h9Clean` stays in `hunt.ts`).
- **Citations**: every cited check stays in its cited file (Recon). The test comment in `test/site/hunt-zoom.test.ts`, "the behaviour is proven by e2e/suites/hunt.ts", stays: the suite's `run` in that file still drives the zoomed checks, now imported from `e2e/suites/hunt/zoomed.ts` (call 16).
- **Errata**: no row is fixed or made stale by this slice. Rows that name a symbol in a slice file name one that does not move (`onCdpMessage`, `cleanup`, `httpGet`, `launchBrowser` in `e2e/harness.ts`; `huntQuarry` in `e2e/suites/hunt.ts`; `cd46ReducedCarry`; `l1fScrolledPage`), but for `handbook/errata/prose.md`'s PR #746 row, which names `hg0Boots` with no path (it moves to `e2e/suites/hunt/zoomed.ts`; the row's claim, about where `hunt` clears its key, holds), and a row may keep a moved path in any case (`handbook/errata/README.md`). The PR #694 and PR #770 pointers stay until the close-out (governing call 11).
- **No spec line changes.**

## Evidence

The commands above, in order: commit 1's red; per family the size, lint, hash, split-proof and reader-count checks; the closing checks. The 22 reader files are `test/repo/comment-citation.test.ts`, `test/repo/console-support.test.ts`, `test/repo/e2e-port-proof.test.ts`, `test/repo/e2e-read-types.test.ts`, `test/repo/e2e-scripts-off.test.ts`, `test/repo/e2e-split-proof-names.test.ts`, `test/repo/e2e-split-proof.test.ts`, `test/repo/e2e-steps.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/lint-config.test.ts`, `test/repo/source-read-guard.test.ts`, `test/repo/source-shape-console.test.ts`, `test/repo/ts-comment-form.test.ts`, `test/e2e/cleanups.test.ts`, `test/e2e/corners.test.ts`, `test/e2e/pace.test.ts`, `test/e2e/runner.test.ts`, `test/e2e/suites.test.ts`, `test/e2e/suites-containment.test.ts`, `test/e2e/launch-harness.test.ts`, `test/e2e/lane-timings.test.ts`, `test/site/sheet-height.test.ts` (195 of 195 at the base, measured).

**The CI acceptance**: for each lane A to D, the job log of the pull request's CI run and of main's run 39183355190 at 7b053755 (`gh run view --job <id> --log > <scratch>/814-e2e-a-<lane>-<base|head>.log`, one command per job; main's job ids are lane A 117840595932, B 117840595946, C 117840595983, D 117840595862), then `node <scratch>/814-e2e-a-checknames.ts <base log> <head log>`, which prints `identical` and exits 0 for each: lane A 268 checks, B 202, C 132, D 161, none failed. Measured on main's two latest runs (39167010722 at 100c89eb against 39183355190 at 7b053755): identical on all four lanes, at those counts, so the names carry no run-dependent value. The four lists go in a PR comment with the command.

`vellum-plate-reader` is not owed: nothing changes an appearance. `vellum-guard-prover` is owed the 20 rows above.

## Calls made (each open to overrule)

1. **One commit per family, written by a tool from base line ranges** (`814-e2e-a-split.ts`). Rule: pull request 2's call 10; the governing "Every split moves whole statements, verbatim".
2. **The cut per function is a contiguous run of whole statements that is one check, its gesture or a fixture read, called where it stood, chosen to bring both functions to 48 or fewer with the fewest names crossing.** Rule: the governing design ("whole statements ... into a helper the original calls at the same point"); Issue #673 pull request 3 rule 2 (a group is one numbered check, or a contiguous run of checks on one fixture); the governing stop condition's 48.
3. **A helper takes the caller's kit by name where the caller holds one, and otherwise a bag of exactly the shorthand names it uses, destructured in its signature and typed `Pick<Kit, ...>` on the caller's kit type.** Rule: Issue #673 pull request 2 rules 6 and 7.
4. **`holdKit` and `gestureKit` take form D: every helper stays declared in its kit, and the block body of `press`, `pressNav` and `twoFingerDrag` moves to a module-level function taking the context members it uses by name.** Rule: Issue #673's frozen 3.1 as Alex ruled it stands (pull request 6, ruling 1): a helper that closes over the context stays in the kit, and a function that closes over nothing goes to module level; the proof reads each call through (prover rows M1, M2, M4). `stageKit` takes form K, as Alex ruled (Rulings).
5. **`l1gKeys` is cut at its five key presses, its camera read and its check, handed `keyScroll` and `keyRuns`; `keyScroll`, which closes over `keyRuns`, stays in the group.** Rule: Issue #673 pull request 6 rule 8 (call 45: a helper that closes over a value its group computes stays in that group). Read against governing call 13 (a helper writes into nothing it is handed): `l1gKeyRuns` is handed the list and the closure that fills it, and calls the closure; every push into `keyRuns` happens in the group's own `keyScroll`, exactly as at the base, and the helper's own statements contain no push and no write (its `keyRuns` parameter is `readonly`, so the type checker refuses one).
6. **`h14aFlight` takes form T, its read's type literal moved to `type Visited`.** Rule: the governing design's clause for a body that cannot be cut at a statement ("the plan writes the replacement out in full"): its one loop is 55 lines, 59 as a helper; Issue #673 pull request 4 rule 4 wrote a read's shape as a named type.
7. **`l10NoScriptGet` takes form S, its kit by name with a body destructure.** Rule: the same clause (its body is one 44-line statement, 54 as a helper); the house's form where a function needs its kit by name (`na3Floor`; Issue #673 pull request 7 rule 5).
8. **`cd32MixedFolio`'s `PFM` moves to module level (form C).** Rule: Issue #673 pull request 7 rule 7 (`SEATS`) and pull request 2 rule 8.
9. **The file caps move whole groups by topic to new part files, leaving every cited group in place**: P30 to `cards/hold-tablet.ts`, FL6 to `corners/floor-paper.ts`, IX8 to `document-rooms/landmark.ts`, HD1 and H8 to `hunt/solved.ts`, HG0 to HG4 to `hunt/zoomed.ts`. Rule: the governing "Citations hold"; pull request 2's call 1 (within that, the cut that leaves the most headroom and moves the fewest shared names); `document-rooms.ts`'s 394 lines leave no room for `na3Floor`'s in-file cut under the 395 margin.
10. **A part takes what it needs from its suite file by `import type`, exported there** (`DocRoomsKit`; `Zoom`, `HuntKit`, `Quarry`), **and from a sibling part by a plain import of an exported name** (`load`, `size`; `Carry`, `Pp`; `holdKit` by type). Rule: the precedents `glass-ceremony/gestures.ts` and `dress.ts` (`GlassKit`), `zoom-gestures/touch.ts` (`GesturesKit`), `cards/gestures.ts` (`holdKit`); a type-only import is erased, so no module cycle runs.
11. **A new part file carries no header.** Rule: Issue #673 call 6 ("part files carry no header"), and the comment rule; 77 of the 130 part files at the base carry none.
12. **`e2e/harness.ts` and `e2e/support/pace.ts` are cut inside the file.** Rule: `familyOf` makes any new file outside a suite folder a family of its own (recon's open item 1, answered by the governing K3).
13. **The names**, under ruling 1 (they stand unless Alex objects): the files above; the functions `openSession`, `continuity`, `b3InlineAtlas`, `d1ArrivalCeremony`, `d3DragQuiet`, `p20PressKralgov`, `p27PageDown`, `p24PinKralgov`, `p5bRealmSeat`, `pressPair`, `p33DragFrom`, `cd45FilesNothing`, `cd42TakesDevice`, `cd26DrawsPlate`, `cd29SecondYear`, `cd35NothingLaid`, `na3Presses`, `g4ReadInk`, `stageScrolls` (the ruled shape), `navKeys`, `twoFingers`, `l9dSaturate`, `l9gPipTap`, `l1gKeyRuns`, `l9aMouseWitness`; the type `Visited`. A group is named for its first check id and what it checks (Issue #673 call 4); a kit's part for its kit and what it holds; a helper body's function for what it does. Each was checked against every function its base family declares (the proof reads a reused name as a helper, and none collides).
14. **fallback and motion keep their groups in the suite file, and their unstepped stretches (B1 and B2; F1 and F2) stay in `run`.** Rule: Issue #673 pull request 2 rule 1 (one line per step) and its single-file suites; the workspace's "touch only what you're asked to touch" beyond what the cap needs.
15. **No bite-parity run on the e2e checks; the prover runs the 20 proof rows instead.** Rule: the governing table's row 3 and K3 name the split proof and the CI lanes as this slice's proof; Issue #673's frozen plan section 5 for the rows (Tests and guards).
16. **The comment in `test/site/hunt-zoom.test.ts` stays.** Rule: it names the suite whose `run` still drives the zoomed checks; the governing "Citations hold" re-points a moved symbol, and no symbol it names moved.
17. **"Both CI lanes" is read as all four, and the acceptance is the check-name lists identical to main's run 39183355190.** Rule: `.github/workflows/ci.yml` runs four lanes now (recon); Issue #673's frozen plan section 6 item 5, the check-name comparison, made a command (`814-e2e-a-checknames.ts`).
18. **Comments travel with the line they lead**, among them start's focus note into `openSession`, the continuity scan's note into `continuity`, CD42's seven-line note into `cd42TakesDevice`, `freshGesture`'s note into `stageScrolls`, and `l9dCeiling`'s saturation note into `l9dSaturate`; `l1gKeys`' down-key note stays above `keyScroll`, and `gestureKit`'s Space note above `pressNav`; `start`'s by-reference note stays above `start`, `na3Floor`'s above `na3Floor`. Rule: the governing Specs line; workflow step 15 (text a pull request only moves keeps its old owner).
19. **The pull request body quotes the four lanes' and three shards' job times.** Rule: pull request 2's call 11; new part files change what each shard compiles in `test/repo/e2e-read-types.test.ts`, which only CI measures.

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, the plan and recon's ledger. It rebuilt the slice in a sandbox of its own at 7b053755 from the plan's Appendix B and reproduced every hash, the 29-error red, the prune, every size, the proof's `0 differ` at every file count, 195 of 195 readers, all 19 rows as they then stood, the type probe and, in a git checkout, `npm test` 2717 of 2717 at the head; 41 claims checked, 3 wrong. 1 blocking, 3 should-fix, 2 nits, all folded, none rejected:

1. (blocking) Form K for the three kits, and the first draft's `l1gKeyScroll`, departed from Issue #673's frozen 3.1 ("inside ONE kit function") and from call 45 (pull request 6 rule 8), and Alex's ruled answer for an oversized kit is the kit chain (pull request 6, ruling 2), which the plan never named; its call 4 cited 3.1 as the rule it departed from. Folded three ways, each measured: `holdKit` and `gestureKit` now take form D, which keeps every helper in its kit and departs from nothing (40 and 41 lines); `l1gKeys` is cut at its presses and check with `keyScroll` kept in the group (41); and `stageKit`, the one kit neither D nor any statement cut brings under the cap (58 at best), went to Alex as the one open decision, with the chain measured as option B, and he ruled A (comment 6258530087; Open decisions).
2. (should-fix) "Every check still runs" was false for the CD25 group, which `E2E_SKIPS` skips (Issue #716). Named in Tests and guards and Rosters, and row M19 proves the proof reads into `cd26DrawsPlate`.
3. (should-fix, for the dispatcher) The plan and its tools changed while the cold read ran (the `stageKit` part moved from its readers to its scroll helpers, and the rejected-alternative reason "a circular reference" was found false by `tsc` and corrected). The version handed back is frozen at the sha256 the report gives; the stop condition on a tool's hash is what catches a mismatch.
4. (nit) The errata sentence missed `hg0Boots`, which `handbook/errata/prose.md`'s PR #746 row names with no path. Named in Rosters and doctrine.
5. (nit) Form T's guard: the type checker reds only a retyped field a check reads, and Appendix C's hash is what pins the literal; and the governing clause's byte-for-byte comparison was never said to be discharged for T and S. Both said in The design.
6. (nit) The shard constant (4.8 minutes) is already stale on main, whose own shards took 5.2 and 5.3. Said in the stop condition.

Written after the cold read, so not read cold: form D and its rows M1, M2, M4; the `l1gKeys` cut and row M8; row M19; the Open decisions menu and its measured option B; the fold of Alex's ruling (comment 6258530087); and the folds above. Each was built on the final dry run and measured as stated (`npm run check`, `npm run lint`, the proof's `0 differ`, every row).

## Open decisions

none. The one question this slice brought back to Alex under ruling 2, **how Landfall's kit `stageKit` is cut**, is ruled A (Rulings, comment 6258530087), folded into The design (form K), the Per family table, Calls made and Tests and guards (row M3), and governs pull request 4's `readingRoomKit` and `zoomKit` too. Nothing else in the plan changed with the ruling: the plan built option A already, so commit 13, commit 1's prune and ceilings, and Appendices A to C stand as measured. The options as they were put to him, measured:

- **A (recommended, ruled)**: `stageKit` calls a small function beside it, `stageScrolls`, which makes its four scroll helpers and hands them back; every check receives the same kit as today, and the proof reads all 57 families `same`. It departs from 3.1's "inside ONE kit function" (the kit already takes three helpers from a shared support function, `makeStage(ctx)` in `e2e/support/home.ts`, which predates the rule and is no precedent for it), and it sets the shape for the later slices' oversized kits (`readingRoomKit` 60 and `zoomKit` 61, pull request 4).
- **B**: a second kit, `stageScrollKit`, built on the first and made in `run` right after it (`const ks = stageScrollKit(k0);`, then `gestureKit(ks)`), Alex's ruled shape for Landfall's kits. Measured on a copy of the head: `tsc` and the lint exit 0, `stageKit` falls under 40, and the proof reads landfall `DIFF` on two lines (`run`'s `k1 = gestureKit ( ks ) ;` against the base's `( k0 )`, and `stageKit`'s returned list), with `1 differ` in its summary; and since it stops comparing a sequence at its first difference, the 8 statements after it in Landfall's `run` go unread by it in this pull request. The CI check-name lists still compare every check.
- **C**: leave `stageKit` over the cap here, its entry in `eslint-suppressions.json` kept at one function (and its `LIST_AT_REFORMAT` line at `[0, 1]`), and settle its shape with pull request 4's two kits. This pull request then settles 28 of its 29 overruns, and pull request 4 carries 36 instead of the governing table's 35.

B and C are not built; their measurements stand here as the record of what the ruling passed over.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than the Planned at line's count, read with `gh api repos/ahl-gram/Vellum/issues/814/comments`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat 7b053755 origin/main -- e2e eslint-suppressions.json test/repo/lint-config.test.ts` prints anything before the first commit.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `21 entries deleted, 50 left`, or commit 1's lint red is not exactly the 29 errors listed.
- The family tool throws (an anchor line is not what 7b053755 held), or prints anything but `<family>: written`.
- After `npm run format`, a file's sha256 is not Appendix C's, `npm run format` changes a file outside the family's, a file is over 395 lines of code, or a function this slice writes or shortens is over 48, as `814-tests-size.ts` counts them.
- `node e2e/split-proof.ts <base>` prints a `DIFF` or a `new` line, a family line at another file count than the table's, or any summary but `57 families against <base>: 0 differ ...`, at any commit.
- The per-family `eslint` or, after commit 13, `npm run check` or `npm run lint` fails; the 22 readers print anything but 195 of 195; the whole `npm test` passes any count but 2717 of 2717.
- The prover reads a row other than the table says, at the head.
- A CI lane's check-name list differs from main's run 39183355190, or a check FAILs. A failed check's payload is first compared with `.claude/skills/vellum-footguns/references/flake-record.md`: a recorded flake gets its row written before any re-run (Gate 2 item 10); any other payload is a hand-back.
- A `check & test` shard's CI job runs longer than 6.0 minutes (its `timeout-minutes: 9` over the `CAP_HEADROOM` of 1.5 in `test/repo/e2e-tiers.test.ts`), or an e2e lane job longer than 10.0 minutes (its `timeout-minutes: 15` over the same 1.5). A pure move changes no wait or budget, so either is a measurement to bring back, not to explain. A shard between 4.8 minutes and 6.0, or a lane between 9.3 and 10.0 (the recorded worsts `test/repo/e2e-tiers.test.ts` carries), is not a stop; the body names it beside the times, since it makes that constant's dated worst stale. The shard constant is stale on main already (its shards took 5.2 at 7b053755 and 5.3 on an earlier run, recon section 6), so a shard in that band is expected.

## Appendix A: every range, at 7b053755

The family tool (Appendix B) is the exact form; this is its prose, for review. "Exported" is the line with `export ` added before its first token. Each new function is written on the lines the Per family table gives, and Prettier lays it out.

- **ceilings.** In `test/repo/lint-config.test.ts`, each line beginning `  "<file>": [` for the 21 files of commit 1 is deleted, and nothing else.
- **harness.** `e2e/harness.ts`: lines 1 to 310, `openSession` (its signature, lines 325 to 346, `}`), a blank line, lines 311 to 324 (the comment and `start`'s signature), the call, lines 347 to the end.
- **pace.** `e2e/support/pace.ts`: lines 1 to 66, `continuity` (its signature, lines 87 to 104, its return, `}`), a blank line, lines 67 to 86, the call, lines 105 to the end.
- **fallback.** `e2e/suites/fallback.ts`: lines 1 to 5, `run`'s destructure without `waitSettled`, lines 7 to 35, the B3 step line, lines 60 to 90, a blank line, `b3InlineAtlas` (its signature, lines 37 to 58, `}`).
- **motion.** `e2e/suites/motion.ts`: lines 1 to 5, the destructure `{ evaluate, check }`, lines 7 and 8, the two step lines, lines 50 to 77, then `d1ArrivalCeremony` (lines 10 to 30) and `d3DragQuiet` (lines 33 to 48), each after a blank line.
- **cards.** `e2e/suites/cards/cap.ts`: lines 1 to 31, `p20PressKralgov` (33 to 50, `return at;`), line 32, its call, 51 to 91, `p27PageDown` (118 to 150), 92 to 116, its call, 151 to 208, `p24PinKralgov` (227 to 247, `return card;`), 209 to 226, its call, 248 to 274. `e2e/suites/cards/overlay.ts`: 1 to 89, `p5bRealmSeat` (112 to 138), 90 to 111, its call, 139 to the end. `e2e/suites/cards/hold.ts`: 1 to 32, `pressPair` (37 to 52), 33 to 36 (`holdKit`'s signature, its destructure, `move`, `press`'s signature), `press`'s call, 53 to 204, `p33DragFrom` (220 to 244), 205 to 219, its call, 245 to 371, 412 to 427. `e2e/suites/cards/hold-tablet.ts`: `import type { Payload } from "../../types.ts";`, `import type { holdKit } from "./hold.ts";`, a blank line, `type Kit = ReturnType<typeof holdKit>;`, a blank line, 372 to 410. `e2e/suites/cards.ts`: line 38 (`p30Tablet,`) deleted, and `import { p30Tablet } from "./cards/hold-tablet.ts";` after line 43.
- **chart-drawer.** `e2e/suites/chart-drawer/reads.ts`: lines 49 (`type Carry = {`) and 112 (`type Pp = {`) exported. `drag.ts`: 1 to 5, `import type { Carry } from "./reads.ts";`, a blank line, `cd45FilesNothing` (33 to 68), 7 to 32, its call, 69 to the end. `homes.ts`: 1 to 210, `cd42TakesDevice` (246 to 278), 211 to 244, its call, 279 to the end. `prospect.ts`: 1 to 3, line 4 with `, type Pp` after `type Card`, 5 to 15, `cd26DrawsPlate` (38 to 70), 16 to 37, its call, 71 to 114, `cd29SecondYear` (157 to 194, `return two;`), 115 to 156, its call, 195 to 197, `cd35NothingLaid` (236 to 262), 198 to 235, its call, 263 to 289, `PFM` (303 to 320), a blank line, 290 to 302, 321 to the end.
- **corners.** `e2e/suites/corners/floor.ts`: lines 55 (`size`) and 70 (`load`) exported, 371 to 410 deleted. `floor-paper.ts`: `import type { Payload, SuiteContext } from "../../types.ts";`, `import { load, size } from "./floor.ts";`, a blank line, 371 to 409. `e2e/suites/corners.ts`: line 28 (`fl6Paper,`) deleted, and `import { fl6Paper } from "./corners/floor-paper.ts";` after line 30.
- **document-rooms.** `e2e/suites/document-rooms.ts`: 1 to 16, `import { ix8Landmark } from "./document-rooms/landmark.ts";`, 17 to 91, line 92 exported, 93 to 285, `na3Presses` (`const { evaluate, settle } = k;`, 297 to 318, its return), 286 and 287, `const { evaluate, send, check, goto } = k;`, 289 to 296, its call, 319 to 370. `landmark.ts`: `import type { DocRoomsKit } from "../document-rooms.ts";`, a blank line, 372 to 388, line 389 exported, 390 to 419.
- **glass-ceremony.** `e2e/suites/glass-ceremony.ts`: 1 to 200, `g4ReadInk` (205 to 236, `return g4;`), 201 to 204, its call, 237 to the end.
- **home.** `e2e/suites/home/stations.ts`: 1 to 7, a blank line, `type Visited = {`, 16 to 30, `};`, 8 to 14, `      visited = await evaluate<Visited | null>(` with the template's first line `(() => {` as line 31 has it, 32 to the end.
- **hunt.** `e2e/suites/hunt.ts`: 1 to 4, `import { hd1Dispatch, h8Reload } from "./hunt/solved.ts";`, `import { hg0Boots, hg1Zoom, hg2Taps, hg4Solves } from "./hunt/zoomed.ts";`, 5 and 6, lines 7 to 9 exported, 10 to 258, 463 to the end. `solved.ts`: `import type { SuiteContext } from "../../types.ts";`, `import type { Quarry } from "../hunt.ts";`, a blank line, 259 exported, 260 to 311, 312 exported, 313 to 359. `zoomed.ts`: `import type { SuiteContext } from "../../types.ts";`, `import type { HuntKit, Quarry, Zoom } from "../hunt.ts";`, a blank line, 361 exported, 362 to 383, 384 exported, 385 to 414, 415 exported, 416 to 446, 447 exported, 448 to 461.
- **landfall.** `kit.ts`: 1 to 8, `stageScrolls` (35 to 60, its return), 9 to 34, its call, 61 to 79, `navKeys` (84 to 91), `twoFingers` (103 to 112), 80 to 83 (`gestureKit`'s signature, its destructure, the Space note, `pressNav`'s signature), `pressNav`'s call, 92 to 102, `twoFingerDrag`'s call, 113 to the end. `clamps.ts`: 1 to 4, `l9dSaturate` (9 to 20, `return top9;`), 5 to 8, its call, 21 to the end. `controls.ts`: 1 to 7, `l9gPipTap` (52 to 73), 8 to 50, its call, 74 to the end. `page.ts`: 1 to 145, `l1gKeyRuns` (185 to 203), 146 to 184, its call, 204 to the end. `seed.ts`: 1 to 3, the new signature and destructure, 13 to the end. `touch.ts`: 1 to 7, `l9aMouseWitness` (26 to 49), 8 to 25, its call, 50 to the end.

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). Each loads the repo's own modules by path, so it runs from any directory. The reused `814-prune.ts`, `814-tests-size.ts` and `814-tests-counts.ts` are in the governing plan's and pull request 2's Appendix B, with the hashes The tools section gives.

### `814-e2e-a-split.ts` (sha256 8efee4eeec1e65a0e8453ceb204cc656df84a2db1fe301b5aa6937829b2d1241)

The family tool.

```ts
// usage: [OUT_ROOT=<dir>] node 814-e2e-a-split.ts <repo> <base sha> <family> ...   (reads the base from <repo>'s git, writes into OUT_ROOT, which defaults to <repo>)
// Issue #814 pull request 3: writes one family's head files from the base text by line ranges (1-based, inclusive), before Prettier. Families: ceilings, harness, pace, fallback, motion, cards, chart-drawer, corners, document-rooms, glass-ceremony, home, hunt, landfall. A family's files are written only after every anchor of that family has matched; where one is not what the base held it throws and writes none of them.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-e2e-a-split.ts <repo> <base sha> <family> ...");
  process.exit(2);
}
const at = (p: string): string[] =>
  execFileSync("git", ["show", `${base}:${p}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 }).split("\n");
const outRoot = process.env["OUT_ROOT"] ?? repo;
const pending: [string, string[]][] = [];
const put = (p: string, lines: string[]): void => void pending.push([p, lines]);
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const line = (L: string[], n: number): string => {
  const s = L[n - 1];
  if (s === undefined) throw new Error(`no line ${n}`);
  return s;
};
const exported = (L: string[], n: number): string => {
  const s = line(L, n);
  return s.replace(/^(\s*)/, "$1export ");
};
const expect = (f: string, L: string[], checks: readonly (readonly [number, string])[]): void => {
  for (const [n, starts] of checks)
    if (!(L[n - 1] ?? "").trimStart().startsWith(starts))
      throw new Error(`${f} line ${n} is ${JSON.stringify(L[n - 1])}, not ${starts}`);
};
const end = (L: string[]): number => (L.at(-1) === "" ? L.length - 1 : L.length);

const SLICE = [
  "e2e/harness.ts",
  "e2e/suites/cards/cap.ts",
  "e2e/suites/cards/hold.ts",
  "e2e/suites/cards/overlay.ts",
  "e2e/suites/chart-drawer/drag.ts",
  "e2e/suites/chart-drawer/homes.ts",
  "e2e/suites/chart-drawer/prospect.ts",
  "e2e/suites/corners/floor.ts",
  "e2e/suites/document-rooms.ts",
  "e2e/suites/fallback.ts",
  "e2e/suites/glass-ceremony.ts",
  "e2e/suites/home/stations.ts",
  "e2e/suites/hunt.ts",
  "e2e/suites/landfall/clamps.ts",
  "e2e/suites/landfall/controls.ts",
  "e2e/suites/landfall/kit.ts",
  "e2e/suites/landfall/page.ts",
  "e2e/suites/landfall/seed.ts",
  "e2e/suites/landfall/touch.ts",
  "e2e/suites/motion.ts",
  "e2e/support/pace.ts",
];

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(outRoot, p), "utf8").split("\n");
  for (const k of SLICE)
    if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(outRoot, p), lines.filter((l) => !SLICE.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function harness(): void {
  const f = "e2e/harness.ts";
  const L = at(f);
  expect(f, L, [
    [309, "}"],
    [311, "// results/consoleErrors"],
    [312, "export async function start({"],
    [324, "}: StartOptions): Promise<SuiteContext> {"],
    [325, "OUT_DIR = OUT;"],
    [334, 'ws.addEventListener("message"'],
    [336, 'await send("Page.enable");'],
    [342, "// Treat the headless page"],
    [346, 'await send("Page.navigate", { url: PAGE });'],
    [347, "const check = "],
  ]);
  put(f, [
    ...r(L, 1, 310),
    "async function openSession({",
    "  browser,",
    "  SITE,",
    "  OUT,",
    "  PORT,",
    "  DPORT,",
    "  PAGE,",
    "  consoleErrors,",
    "  http4xx,",
    '}: Omit<StartOptions, "results" | "skippedGroups" | "skippedChecks">): Promise<void> {',
    ...r(L, 325, 346),
    "}",
    "",
    ...r(L, 311, 324),
    "  await openSession({ browser, SITE, OUT, PORT, DPORT, PAGE, consoleErrors, http4xx });",
    ...r(L, 347, end(L)),
  ]);
}

function pace(): void {
  const f = "e2e/support/pace.ts";
  const L = at(f);
  expect(f, L, [
    [65, "}"],
    [67, "/** Read a pace sweep"],
    [68, "export function readPaceSweep("],
    [87, "let backward = 0;"],
    [104, "}"],
    [106, "const last = "],
  ]);
  put(f, [
    ...r(L, 1, 66),
    "function continuity(samples: readonly PaceSample[], opts: PaceSweepOpts, span: number) {",
    ...r(L, 87, 104),
    "  return { backward, jump, jumpAllowed };",
    "}",
    "",
    ...r(L, 67, 86),
    "  const { backward, jump, jumpAllowed } = continuity(samples, opts, span);",
    ...r(L, 105, end(L)),
  ]);
}

function fallback(): void {
  const f = "e2e/suites/fallback.ts";
  const L = at(f);
  expect(f, L, [
    [6, "const { evaluate, send, check, sleep, waitSettled, serverState } = ctx;"],
    [36, 'await step("B3", async () => {'],
    [37, "await evaluate("],
    [58, ");"],
    [59, "});"],
    [60, "} finally {"],
    [68, "async function b2bBackupOrder("],
    [90, "}"],
  ]);
  put(f, [
    ...r(L, 1, 5),
    "  const { evaluate, send, check, sleep, serverState } = ctx;",
    ...r(L, 7, 35),
    '    await step("B3", () => b3InlineAtlas(ctx));',
    ...r(L, 60, 90),
    "",
    "async function b3InlineAtlas({ evaluate, check, waitSettled }: SuiteContext): Promise<void> {",
    ...r(L, 37, 58),
    "}",
  ]);
}

function motion(): void {
  const f = "e2e/suites/motion.ts";
  const L = at(f);
  expect(f, L, [
    [6, "const { evaluate, check, sleep, waitSettled } = ctx;"],
    [9, 'await step("D1, D2", async () => {'],
    [31, "});"],
    [32, 'await step("D3", async () => {'],
    [49, "});"],
    [50, "// A view transition cannot be seen by e2e"],
    [77, "}"],
  ]);
  put(f, [
    ...r(L, 1, 5),
    "  const { evaluate, check } = ctx;",
    ...r(L, 7, 8),
    '  await step("D1, D2", () => d1ArrivalCeremony(ctx));',
    '  await step("D3", () => d3DragQuiet(ctx));',
    ...r(L, 50, 77),
    "",
    "async function d1ArrivalCeremony({ evaluate, check, waitSettled }: SuiteContext): Promise<void> {",
    ...r(L, 10, 30),
    "}",
    "",
    "async function d3DragQuiet({ evaluate, check, sleep, waitSettled }: SuiteContext): Promise<void> {",
    ...r(L, 33, 48),
    "}",
  ]);
}

function cards(): void {
  const cap = "e2e/suites/cards/cap.ts";
  const C = at(cap);
  expect(cap, C, [
    [32, "export async function p20PinnedTakesPointer({ evaluate, send, check, settle }: CardsKit) {"],
    [33, "// The unpinned arm"],
    [34, "const at = await evaluate<"],
    [47, "if (at.error) throw"],
    [50, 'await send("Input.dispatchMouseEvent", { type: "mouseReleased"'],
    [51, "const open = await settle<{"],
    [90, "}"],
    [92, "export async function p26TailScrolls("],
    [116, "await sleep(200);"],
    [118, "const kb = await evaluate<{"],
    [150, "await sleep(200);"],
    [151, "}"],
    [209, "export async function p24NothingToScroll({"],
    [224, "const at = await evaluate<Point>("],
    [227, 'await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });'],
    [230, "const card = await settle<{"],
    [247, ");"],
    [248, 'await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: card.x, y: card.y });'],
  ]);
  put(cap, [
    ...r(C, 1, 31),
    'async function p20PressKralgov({ evaluate, send }: Pick<CardsKit, "evaluate" | "send">) {',
    ...r(C, 33, 50),
    "  return at;",
    "}",
    "",
    line(C, 32),
    "  const at = await p20PressKralgov({ evaluate, send });",
    ...r(C, 51, 91),
    'async function p27PageDown({ evaluate, send, check, sleep }: Pick<SuiteContext, "evaluate" | "send" | "check" | "sleep">): Promise<void> {',
    ...r(C, 118, 150),
    "}",
    "",
    ...r(C, 92, 116),
    "  await p27PageDown({ evaluate, send, check, sleep });",
    ...r(C, 151, 208),
    'async function p24PinKralgov({ send, settle }: Pick<CardsKit, "send" | "settle">, at: Point) {',
    ...r(C, 227, 247),
    "  return card;",
    "}",
    "",
    ...r(C, 209, 226),
    "  const card = await p24PinKralgov({ send, settle }, at);",
    ...r(C, 248, end(C)),
  ]);

  const ov = "e2e/suites/cards/overlay.ts";
  const O = at(ov);
  expect(ov, O, [
    [90, "export async function p4Capital({ evaluate, check, shoot, sleep }: SuiteContext, pm: Manifest): Promise<void> {"],
    [111, ""],
    [112, "if (pm.seatIdx >= 0) {"],
    [138, "}"],
    [139, "check("],
    [144, "}"],
  ]);
  put(ov, [
    ...r(O, 1, 89),
    'async function p5bRealmSeat({ evaluate, check, shoot, sleep }: Pick<SuiteContext, "evaluate" | "check" | "shoot" | "sleep">, pm: Manifest): Promise<void> {',
    ...r(O, 112, 138),
    "}",
    "",
    ...r(O, 90, 111),
    "  await p5bRealmSeat({ evaluate, check, shoot, sleep }, pm);",
    ...r(O, 139, end(O)),
  ]);

  const hold = "e2e/suites/cards/hold.ts";
  const H = at(hold);
  expect(hold, H, [
    [33, "export function holdKit(ctx: HoldKit) {"],
    [34, "const { evaluate, send, sleep, settle, waitReady, setTouch, PORT } = ctx;"],
    [35, "const move = "],
    [36, "const press = async (p: Point, clickCount = 1) => {"],
    [37, 'await send("Input.dispatchMouseEvent", {'],
    [52, "});"],
    [53, "};"],
    [54, "const tap = async"],
    [205, "export async function p33DragKeepsPin(k: Kit, marks: Mark[]): Promise<void> {"],
    [218, "if (!b) continue;"],
    [220, "await k.move(b);"],
    [244, "});"],
    [245, "const after = await k.card();"],
    [372, "const TABLET = ["],
    [373, "// What each event of a tap"],
    [378, "export async function p30Tablet(k: Kit): Promise<void> {"],
    [410, "}"],
    [412, "export async function p9Grace("],
  ]);
  put(hold, [
    ...r(H, 1, 32),
    'async function pressPair({ send }: Pick<SuiteContext, "send">, p: Point, clickCount: number): Promise<void> {',
    ...r(H, 37, 52),
    "}",
    "",
    ...r(H, 33, 36),
    "    await pressPair({ send }, p, clickCount);",
    ...r(H, 53, 204),
    "async function p33DragFrom(k: Kit, b: Mark): Promise<void> {",
    ...r(H, 220, 244),
    "}",
    "",
    ...r(H, 205, 219),
    "    await p33DragFrom(k, b);",
    ...r(H, 245, 371),
    ...r(H, 412, end(H)),
  ]);
  put("e2e/suites/cards/hold-tablet.ts", [
    'import type { Payload } from "../../types.ts";',
    'import type { holdKit } from "./hold.ts";',
    "",
    "type Kit = ReturnType<typeof holdKit>;",
    "",
    ...r(H, 372, 410),
  ]);

  const suite = "e2e/suites/cards.ts";
  const S = at(suite);
  expect(suite, S, [
    [38, "p30Tablet,"],
    [43, '} from "./cards/hold.ts";'],
  ]);
  put(suite, [...r(S, 1, 37), ...r(S, 39, 43), 'import { p30Tablet } from "./cards/hold-tablet.ts";', ...r(S, 44, end(S))]);
}

function chartDrawer(): void {
  const reads = "e2e/suites/chart-drawer/reads.ts";
  const R = at(reads);
  expect(reads, R, [
    [49, "type Carry = {"],
    [112, "type Pp = {"],
  ]);
  put(reads, [...r(R, 1, 48), exported(R, 49), ...r(R, 50, 111), exported(R, 112), ...r(R, 113, end(R))]);

  const drag = "e2e/suites/chart-drawer/drag.ts";
  const D = at(drag);
  expect(drag, D, [
    [5, 'import { CARRY, DURATION, atRest, sameCam } from "./reads.ts";'],
    [7, "export async function cd45SnapBack({"],
    [32, 'await shutAndFold("chart-drawer-after-snap-folded");'],
    [33, "check("],
    [68, ");"],
    [69, "}"],
  ]);
  put(drag, [
    ...r(D, 1, 5),
    'import type { Carry } from "./reads.ts";',
    "",
    'function cd45FilesNothing(check: DragKit["check"], before: Carry, mid: Carry, snapped: Carry, jiggled: Carry, clicked: Carry): void {',
    ...r(D, 33, 68),
    "}",
    "",
    ...r(D, 7, 32),
    "  cd45FilesNothing(check, before, mid, snapped, jiggled, clicked);",
    ...r(D, 69, end(D)),
  ]);

  const homes = "e2e/suites/chart-drawer/homes.ts";
  const M = at(homes);
  expect(homes, M, [
    [211, "export async function cd41CachedReturn({"],
    [244, ");"],
    [245, ""],
    [246, "// The cell where two of the rulings collide"],
    [253, "const OTHERS = ["],
    [278, ");"],
    [279, "}"],
  ]);
  put(homes, [
    ...r(M, 1, 210),
    'async function cd42TakesDevice({ evaluate, check, sleep, restedAtExplorer }: Pick<TableKit, "evaluate" | "check" | "sleep" | "restedAtExplorer">): Promise<void> {',
    ...r(M, 246, 278),
    "}",
    "",
    ...r(M, 211, 244),
    "  await cd42TakesDevice({ evaluate, check, sleep, restedAtExplorer });",
    ...r(M, 279, end(M)),
  ]);

  const pros = "e2e/suites/chart-drawer/prospect.ts";
  const P = at(pros);
  expect(pros, P, [
    [4, 'import { CARD, DRAWN, DRESS, PP, type Card } from "./reads.ts";'],
    [15, ""],
    [16, "export async function cd25CardPress("],
    [37, ");"],
    [38, "await pressCard(armed);"],
    [70, ");"],
    [71, "// The DRAWN world"],
    [90, "}"],
    [114, ""],
    [115, "// The page's own capture point"],
    [116, "export async function cd28PagePress("],
    [156, ");"],
    [157, "// The same town at a second year"],
    [194, ");"],
    [195, "return two;"],
    [196, "}"],
    [198, "export async function cd34PageRefusals("],
    [235, ");"],
    [236, "if (atCapPage.press && atCapPage.press.centre)"],
    [262, ");"],
    [263, "}"],
    [289, ""],
    [290, "// A MIXED folio"],
    [291, "export async function cd32MixedFolio("],
    [302, "}"],
    [303, "const PFM: Payload<{"],
    [320, "bound: (document.getElementById"],
    [321, "let pfm = await evaluate(PFM);"],
  ]);
  put(pros, [
    ...r(P, 1, 3),
    'import { CARD, DRAWN, DRESS, PP, type Card, type Pp } from "./reads.ts";',
    ...r(P, 5, 15),
    'async function cd26DrawsPlate({ check, settle, pressCard }: Pick<DrawerKit, "check" | "settle" | "pressCard">, armed: Card): Promise<void> {',
    ...r(P, 38, 70),
    "}",
    "",
    ...r(P, 16, 37),
    "  await cd26DrawsPlate({ check, settle, pressCard }, armed);",
    ...r(P, 71, 114),
    'async function cd29SecondYear({ evaluate, check, sleep, settle, clickAt }: Pick<DrawerKit, "evaluate" | "check" | "sleep" | "settle" | "clickAt">, one: Pp) {',
    ...r(P, 157, 194),
    "  return two;",
    "}",
    "",
    ...r(P, 115, 156),
    "  const two = await cd29SecondYear({ evaluate, check, sleep, settle, clickAt }, one);",
    ...r(P, 195, 197),
    'async function cd35NothingLaid({ evaluate, check, sleep, clickAt }: Pick<DrawerKit, "evaluate" | "check" | "sleep" | "clickAt">, atCapPage: Pp): Promise<void> {',
    ...r(P, 236, 262),
    "}",
    "",
    ...r(P, 198, 235),
    "  await cd35NothingLaid({ evaluate, check, sleep, clickAt }, atCapPage);",
    ...r(P, 263, 289),
    ...r(P, 303, 320),
    "",
    ...r(P, 290, 302),
    ...r(P, 321, end(P)),
  ]);
}

function corners(): void {
  const f = "e2e/suites/corners/floor.ts";
  const L = at(f);
  expect(f, L, [
    [55, "const size = (ctx: SuiteContext"],
    [70, "async function load(ctx: SuiteContext"],
    [370, ""],
    [371, "// Paper is narrower than 900"],
    [372, "const PRINTED: Payload<"],
    [375, "export async function fl6Paper(ctx: SuiteContext): Promise<void> {"],
    [409, "}"],
    [410, ""],
    [411, "// A full-page capture shrinks"],
  ]);
  put(f, [...r(L, 1, 54), exported(L, 55), ...r(L, 56, 69), exported(L, 70), ...r(L, 71, 370), ...r(L, 411, end(L))]);
  put("e2e/suites/corners/floor-paper.ts", [
    'import type { Payload, SuiteContext } from "../../types.ts";',
    'import { load, size } from "./floor.ts";',
    "",
    ...r(L, 371, 409),
  ]);
  const suite = "e2e/suites/corners.ts";
  const S = at(suite);
  expect(suite, S, [
    [28, "fl6Paper,"],
    [30, '} from "./corners/floor.ts";'],
  ]);
  put(suite, [...r(S, 1, 27), ...r(S, 29, 30), 'import { fl6Paper } from "./corners/floor-paper.ts";', ...r(S, 31, end(S))]);
}

function documentRooms(): void {
  const f = "e2e/suites/document-rooms.ts";
  const L = at(f);
  expect(f, L, [
    [16, 'import type { Sheets } from "./document-rooms/sheets.ts";'],
    [92, "type DocRoomsKit = ReturnType<typeof docRoomsKit>;"],
    [285, ""],
    [286, "// At a 640 window the page is the 1024 one"],
    [287, "async function na3Floor(k: DocRoomsKit): Promise<void> {"],
    [288, "const { evaluate, send, check, settle, goto } = k;"],
    [296, "const scrolled = await evaluate(READ);"],
    [297, 'const fold = await evaluate(centreOf("#index .slip-fold"));'],
    [318, ");"],
    [319, "const sameAsWide"],
    [370, "}"],
    [371, ""],
    [372, "type AxNode"],
    [388, "// The accessibility tree itself"],
    [389, "async function ix8Landmark(k: DocRoomsKit): Promise<void> {"],
    [419, "}"],
  ]);
  put(f, [
    ...r(L, 1, 16),
    'import { ix8Landmark } from "./document-rooms/landmark.ts";',
    ...r(L, 17, 91),
    exported(L, 92),
    ...r(L, 93, 285),
    "async function na3Presses(k: DocRoomsKit, scrolled: Index) {",
    "  const { evaluate, settle } = k;",
    ...r(L, 297, 318),
    "  return { fold, folded, tab, back, entry, landed };",
    "}",
    "",
    ...r(L, 286, 287),
    "  const { evaluate, send, check, goto } = k;",
    ...r(L, 289, 296),
    "  const { fold, folded, tab, back, entry, landed } = await na3Presses(k, scrolled);",
    ...r(L, 319, 370),
  ]);
  put("e2e/suites/document-rooms/landmark.ts", [
    'import type { DocRoomsKit } from "../document-rooms.ts";',
    "",
    ...r(L, 372, 388),
    exported(L, 389),
    ...r(L, 390, 419),
  ]);
}

function glassCeremony(): void {
  const f = "e2e/suites/glass-ceremony.ts";
  const L = at(f);
  expect(f, L, [
    [8, "export type GlassKit = ReturnType<typeof glassKit>;"],
    [200, ""],
    [201, "async function g4InksIn({ evaluate, check, shoot, sleep, rgn, enterAt, waitRedraft }: GlassKit): Promise<void> {"],
    [204, "const s4 = await waitRedraft(before4, 1);"],
    [205, "const g4 = await evaluate<"],
    [236, "})()`);"],
    [237, "check("],
    [253, "}"],
  ]);
  put(f, [
    ...r(L, 1, 200),
    'async function g4ReadInk({ evaluate }: Pick<GlassKit, "evaluate">) {',
    ...r(L, 205, 236),
    "  return g4;",
    "}",
    "",
    ...r(L, 201, 204),
    "  const g4 = await g4ReadInk({ evaluate });",
    ...r(L, 237, end(L)),
  ]);
}

function home(): void {
  const f = "e2e/suites/home/stations.ts";
  const L = at(f);
  expect(f, L, [
    [7, "type Flight = Awaited<ReturnType<typeof h14aFlight>>;"],
    [8, ""],
    [9, "export async function h14aFlight({ evaluate, sleep, clickAt }: HomeKit) {"],
    [15, "visited = await evaluate<{"],
    [16, "scale: number;"],
    [30, "arms: number;"],
    [31, "} | null>(`(() => {"],
  ]);
  put(f, [
    ...r(L, 1, 7),
    "",
    "type Visited = {",
    ...r(L, 16, 30),
    "};",
    ...r(L, 8, 14),
    "      visited = await evaluate<Visited | null>(`(() => {",
    ...r(L, 32, end(L)),
  ]);
}

function hunt(): void {
  const f = "e2e/suites/hunt.ts";
  const L = at(f);
  expect(f, L, [
    [4, 'import { huntRoom } from "./hunt/room.ts";'],
    [7, "type Zoom = "],
    [8, "type HuntKit = "],
    [9, "type Quarry = "],
    [258, ""],
    [259, "async function hd1Dispatch("],
    [310, "}"],
    [312, "async function h8Reload("],
    [359, "}"],
    [361, "async function hg0Boots("],
    [384, "async function hg1Zoom("],
    [415, "async function hg2Taps("],
    [447, "async function hg4Solves("],
    [461, "}"],
    [463, "function h9Clean("],
  ]);
  put(f, [
    ...r(L, 1, 4),
    'import { hd1Dispatch, h8Reload } from "./hunt/solved.ts";',
    'import { hg0Boots, hg1Zoom, hg2Taps, hg4Solves } from "./hunt/zoomed.ts";',
    ...r(L, 5, 6),
    exported(L, 7),
    exported(L, 8),
    exported(L, 9),
    ...r(L, 10, 258),
    ...r(L, 463, end(L)),
  ]);
  put("e2e/suites/hunt/solved.ts", [
    'import type { SuiteContext } from "../../types.ts";',
    'import type { Quarry } from "../hunt.ts";',
    "",
    exported(L, 259),
    ...r(L, 260, 311),
    exported(L, 312),
    ...r(L, 313, 359),
  ]);
  put("e2e/suites/hunt/zoomed.ts", [
    'import type { SuiteContext } from "../../types.ts";',
    'import type { HuntKit, Quarry, Zoom } from "../hunt.ts";',
    "",
    exported(L, 361),
    ...r(L, 362, 383),
    exported(L, 384),
    ...r(L, 385, 414),
    exported(L, 415),
    ...r(L, 416, 446),
    exported(L, 447),
    ...r(L, 448, 461),
  ]);
}

function landfall(): void {
  const kit = "e2e/suites/landfall/kit.ts";
  const K = at(kit);
  expect(kit, K, [
    [8, ""],
    [9, "export function stageKit(ctx: SuiteContext) {"],
    [10, "const { evaluate, sleep, wheel } = ctx;"],
    [11, "const { pressKey, clickAt, settleHome } = makeStage(ctx);"],
    [12, "// e.defaultPrevented"],
    [34, "};"],
    [35, "const scrollToTop = async () => {"],
    [42, "// 450ms outwaits GESTURE_BREAK_MS"],
    [47, "const readHint = () =>"],
    [54, "const scrollToFloor = async () => {"],
    [60, "};"],
    [61, "return {"],
    [78, "}"],
    [79, ""],
    [80, "export function gestureKit(k0: StageKit) {"],
    [83, "const pressNav = async (key: string, code: string, vk: number, text?: string) => {"],
    [84, 'await send("Input.dispatchKeyEvent", {'],
    [91, 'await send("Input.dispatchKeyEvent", { type: "keyUp"'],
    [92, "};"],
    [102, "const twoFingerDrag = async (p: Point, sx = 1, sy = 1) => {"],
    [103, 'await touch("touchStart", ['],
    [112, "await sleep(300);"],
    [113, "};"],
    [136, "return { ...k0, pressNav, headroom, twoFingerDrag, recenter, seedShown };"],
  ]);
  put(kit, [
    ...r(K, 1, 8),
    'function stageScrolls({ evaluate, sleep, scrollY }: Pick<StageKit, "evaluate" | "sleep" | "scrollY">) {',
    ...r(K, 35, 60),
    "  return { scrollToTop, freshGesture, readHint, scrollToFloor };",
    "}",
    "",
    ...r(K, 9, 34),
    "  const { scrollToTop, freshGesture, readHint, scrollToFloor } = stageScrolls({ evaluate, sleep, scrollY });",
    ...r(K, 61, 79),
    'async function navKeys({ send }: Pick<SuiteContext, "send">, key: string, code: string, vk: number, text: string | undefined): Promise<void> {',
    ...r(K, 84, 91),
    "}",
    "",
    'async function twoFingers({ touch, sleep }: Pick<SuiteContext, "touch" | "sleep">, p: Point, sx: number, sy: number): Promise<void> {',
    ...r(K, 103, 112),
    "}",
    "",
    ...r(K, 80, 83),
    "    await navKeys({ send }, key, code, vk, text);",
    ...r(K, 92, 102),
    "    await twoFingers({ touch, sleep }, p, sx, sy);",
    ...r(K, 113, end(K)),
  ]);

  const clamps = "e2e/suites/landfall/clamps.ts";
  const C = at(clamps);
  expect(clamps, C, [
    [4, ""],
    [5, "export async function l9dCeiling("],
    [8, "): Promise<void> {"],
    [9, "// Saturate"],
    [10, "let top9 = await camNow();"],
    [20, "}"],
    [21, "const room9d = await headroom();"],
  ]);
  put(clamps, [
    ...r(C, 1, 4),
    'async function l9dSaturate({ sleep, pinch, camNow }: Pick<LandfallKit, "sleep" | "pinch" | "camNow">, stagePt9: Point | null) {',
    ...r(C, 9, 20),
    "  return top9;",
    "}",
    "",
    ...r(C, 5, 8),
    "  const top9 = await l9dSaturate({ sleep, pinch, camNow }, stagePt9);",
    ...r(C, 21, end(C)),
  ]);

  const controls = "e2e/suites/landfall/controls.ts";
  const T = at(controls);
  expect(controls, T, [
    [7, ""],
    [8, "export async function l9fPipGestures({"],
    [50, ");"],
    [51, ""],
    [52, "const tapPt = await evaluate("],
    [73, "await sleep(400);"],
    [74, "}"],
  ]);
  put(controls, [
    ...r(T, 1, 7),
    'async function l9gPipTap({ evaluate, check, sleep, touch, pressKey }: Pick<LandfallKit, "evaluate" | "check" | "sleep" | "touch" | "pressKey">): Promise<void> {',
    ...r(T, 52, 73),
    "}",
    "",
    ...r(T, 8, 50),
    "  await l9gPipTap({ evaluate, check, sleep, touch, pressKey });",
    ...r(T, 74, end(T)),
  ]);

  const page = "e2e/suites/landfall/page.ts";
  const G = at(page);
  expect(page, G, [
    [145, ""],
    [146, "export async function l1gKeys({"],
    [158, "const keyCamBefore = await camNow();"],
    [159, "const keyRuns:"],
    [160, "// Every down-key"],
    [161, "const keyScroll = async ("],
    [184, "};"],
    [185, 'await keyScroll("Space"'],
    [203, ");"],
    [204, "await scrollToTop();"],
  ]);
  put(page, [
    ...r(G, 1, 145),
    'async function l1gKeyRuns({ check, camNow, pressNav }: Pick<LandfallKit, "check" | "camNow" | "pressNav">, keyScroll: (label: string, setupY: number, fire: () => Promise<void>, moved: (y: number, y0: number) => boolean) => Promise<void>, keyRuns: readonly { label: string; y0: number; y: number; ok: boolean }[], keyCamBefore: Awaited<ReturnType<LandfallKit["camNow"]>>): Promise<void> {',
    ...r(G, 185, 203),
    "}",
    "",
    ...r(G, 146, 184),
    "  await l1gKeyRuns({ check, camNow, pressNav }, keyScroll, keyRuns, keyCamBefore);",
    ...r(G, 204, end(G)),
  ]);

  const seed = "e2e/suites/landfall/seed.ts";
  const E = at(seed);
  expect(seed, E, [
    [4, "export async function l10NoScriptGet({"],
    [12, "}: LandfallKit): Promise<void> {"],
    [13, "// L10/L11"],
  ]);
  put(seed, [
    ...r(E, 1, 3),
    "export async function l10NoScriptGet(k: LandfallKit): Promise<void> {",
    "  const { evaluate, send, check, sleep, PORT, clickAt, centerOf } = k;",
    ...r(E, 13, end(E)),
  ]);

  const touch = "e2e/suites/landfall/touch.ts";
  const U = at(touch);
  expect(touch, U, [
    [7, ""],
    [8, "export async function l9aOneFinger("],
    [25, "const oneAfter = await camNow();"],
    [26, "if (stagePt9 !== null) {"],
    [49, "}"],
    [50, "await sleep(300);"],
    [64, "}"],
  ]);
  put(touch, [
    ...r(U, 1, 7),
    'async function l9aMouseWitness({ send }: Pick<LandfallKit, "send">, stagePt9: Point | null): Promise<void> {',
    ...r(U, 26, 49),
    "}",
    "",
    ...r(U, 8, 25),
    "  await l9aMouseWitness({ send }, stagePt9);",
    ...r(U, 50, end(U)),
  ]);
}

const FAMILIES: Record<string, () => void> = {
  ceilings,
  harness,
  pace,
  fallback,
  motion,
  cards,
  "chart-drawer": chartDrawer,
  corners,
  "document-rooms": documentRooms,
  "glass-ceremony": glassCeremony,
  home,
  hunt,
  landfall,
};

for (const family of families) {
  const write = FAMILIES[family];
  if (write === undefined) throw new Error(`no family ${family}; the families are ${Object.keys(FAMILIES).join(", ")}`);
  write();
  for (const [p, lines] of pending.splice(0)) writeFileSync(join(outRoot, p), lines.join("\n") + "\n");
  console.log(`${family}: written`);
}
```

### `814-e2e-a-checknames.ts` (sha256 58ac39ba4c1af5791e5b8d889a7ee098476590d448b0118c063bdce54bf8bf85)

One lane's check names, base against head (the CI acceptance).

```ts
// usage: node 814-e2e-a-checknames.ts <base lane log> <head lane log>
// Issue #814 pull request 3: the check names one e2e lane printed, its detail stripped (the harness writes it after two spaces and U+2014), at the base and at the head, in order; exits non-zero unless both lists are identical, every check passed, and each log carries its LANE summary.
import { readFileSync } from "node:fs";

const [baseLog, headLog] = process.argv.slice(2);
if (baseLog === undefined || headLog === undefined) {
  console.error("usage: node 814-e2e-a-checknames.ts <base lane log> <head lane log>");
  process.exit(2);
}
const CHECK = /Z \[([A-Z])\] (PASS|FAIL) {2}(.*)$/;
const DETAIL = `  ${String.fromCharCode(0x2014)} `;
function read(path: string): { lane: string; names: string[]; fails: number; summary: string } {
  const lines = readFileSync(path, "utf8").split("\n");
  const names: string[] = [];
  let lane = "";
  let fails = 0;
  for (const line of lines) {
    const m = CHECK.exec(line);
    if (!m) continue;
    lane = m[1]!;
    if (m[2] === "FAIL") fails++;
    const text = m[3]!;
    const cut = text.indexOf(DETAIL);
    names.push(cut === -1 ? text : text.slice(0, cut));
  }
  const summary = lines.map((l) => /LANE [A-Z] (PASS|FAIL) .*$/.exec(l)?.[0]).filter((s) => s !== undefined).at(-1) ?? "";
  return { lane, names, fails, summary };
}
const a = read(baseLog);
const b = read(headLog);
let bad = 0;
if (a.lane !== b.lane) bad++;
const at = Array.from({ length: Math.max(a.names.length, b.names.length) }, (_, i) => i).find((i) => a.names[i] !== b.names[i]);
if (at !== undefined) {
  bad++;
  console.log(`lists diverge at check ${at + 1}: base ${JSON.stringify(a.names[at] ?? "(end)")} head ${JSON.stringify(b.names[at] ?? "(end)")}`);
}
if (a.fails > 0 || b.fails > 0 || a.summary === "" || b.summary === "") bad++;
console.log(`lane ${a.lane} -> ${b.lane}: ${a.names.length} -> ${b.names.length} checks, ${a.fails} -> ${b.fails} failed`);
console.log(`  base: ${a.summary}`);
console.log(`  head: ${b.summary}`);
console.log(bad === 0 ? "identical" : "DIFFER");
process.exit(bad === 0 ? 0 : 1);
```

### `814-e2e-a-proof.ts` (sha256 1a273c5fc2c082b68cf1d4e24afe511e7d605cf91cadcb3a45aef0c4678d4cba)

`e2e/split-proof.ts`'s own `main` over a head tree given by `HEAD_ROOT`; in a git checkout `HEAD_ROOT` is the checkout itself. The bite tool runs it.

```ts
// usage: HEAD_ROOT=<dir> node 814-e2e-a-proof.ts <repo> <base sha>
// Issue #814 pull request 3, planning only: e2e/split-proof.ts's own main() over a head tree that is not a git checkout. The base comes from <repo>'s git; the head from HEAD_ROOT's e2e/; every family is compared by the repo's compareFamilies and familyOf, and the output lines are main()'s.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";

type FamilyFile = { readonly path: string; readonly text: string };
type Verdict = { readonly same: boolean; readonly lines: readonly string[] };
const [repo, base] = process.argv.slice(2);
const headRoot = process.env["HEAD_ROOT"];
if (repo === undefined || base === undefined || headRoot === undefined) {
  console.error("usage: HEAD_ROOT=<dir> node 814-e2e-a-proof.ts <repo> <base sha>");
  process.exit(2);
}
const tool = (await import(join(repo, "e2e/split-proof.ts"))) as {
  compareFamilies: (before: readonly FamilyFile[], after: readonly FamilyFile[]) => Verdict;
  familyOf: (path: string) => string;
};
const git = (args: string[]): string =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const inTree = (path: string): boolean => /^e2e\/.+\.ts$/.test(path) && path !== "e2e/split-proof.ts";
const basePaths = git(["ls-tree", "-r", "--name-only", base, "--", "e2e"]).split("\n").filter(inTree).sort();
const now = readdirSync(join(headRoot, "e2e"), { recursive: true, encoding: "utf8" })
  .map((f) => `e2e/${f.split(sep).join("/")}`)
  .filter(inTree)
  .filter((p) => existsSync(join(headRoot, p)))
  .sort();
const families = new Map<string, { before: FamilyFile[]; after: FamilyFile[] }>();
const family = (k: string) => families.get(k) ?? families.set(k, { before: [], after: [] }).get(k)!;
for (const p of basePaths) family(tool.familyOf(p)).before.push({ path: p, text: git(["show", `${base}:${p}`]) });
for (const p of now) family(tool.familyOf(p)).after.push({ path: p, text: readFileSync(join(headRoot, p), "utf8") });
let differ = 0;
for (const [k, f] of [...families].sort(([x], [y]) => x.localeCompare(y))) {
  if (f.before.length === 0) {
    console.log(`new   ${k}: no file at ${base}, nothing to compare`);
    continue;
  }
  const v = tool.compareFamilies(f.before, f.after);
  if (!v.same) differ++;
  console.log(`${v.same ? "same" : "DIFF"}  ${k}: ${f.before.length} -> ${f.after.length} files`);
  for (const line of v.lines) console.log(`      ${line}`);
}
console.log(`\n${families.size} families against ${base}: ${differ} differ`);
process.exit(differ === 0 ? 0 : 1);
```

### `814-e2e-a-bite.ts` (sha256 03d3ab6ad449c1c19b090e51eae1d9c78401e1760290177d5878627b9c6512af)

The prover's rows M1 to M18 and S1 (Tests and guards).

```ts
// usage: node 814-e2e-a-bite.ts <repo> <base sha> <head root>
// Issue #814 pull request 3, planning only: plants each row's one-line mutation in <head root>, runs the split proof (814-e2e-a-proof.ts) over it, records the verdict of the row's family and whether any other family moved, and restores the file. Exits non-zero if a row's verdict is not the one it expects or a file is not restored byte for byte.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, base, head] = process.argv.slice(2);
if (repo === undefined || base === undefined || head === undefined) {
  console.error("usage: node 814-e2e-a-bite.ts <repo> <base sha> <head root>");
  process.exit(2);
}
type Row = { id: string; file: string; family: string; find: string; replace: string; expect: "DIFF" | "same" };
const ROWS: Row[] = [
  { id: "M1", file: "e2e/suites/cards/hold.ts", family: "cards", find: "    buttons: 1,\n    clickCount,", replace: "    buttons: 0,\n    clickCount,", expect: "DIFF" },
  { id: "M2", file: "e2e/suites/cards/hold.ts", family: "cards", find: "    await pressPair({ send }, p, clickCount);", replace: "    await pressPair({ send }, p, 1);", expect: "DIFF" },
  { id: "M3", file: "e2e/suites/landfall/kit.ts", family: "landfall", find: "for (let i = 0; i < 20; i++) {", replace: "for (let i = 0; i < 19; i++) {", expect: "DIFF" },
  { id: "M4", file: "e2e/suites/landfall/kit.ts", family: "landfall", find: "    { x: p.x - 40, y: p.y, id: 0 },", replace: "    { x: p.x - 41, y: p.y, id: 0 },", expect: "DIFF" },
  { id: "M5", file: "e2e/harness.ts", family: "e2e/harness.ts", find: '  await send("Log.enable");\n  await send("Network.enable");', replace: '  await send("Network.enable");\n  await send("Log.enable");', expect: "DIFF" },
  { id: "M6", file: "e2e/support/pace.ts", family: "e2e/support/pace.ts", find: "if (i < 2) continue;", replace: "if (i < 1) continue;", expect: "DIFF" },
  { id: "M7", file: "e2e/suites/cards/hold.ts", family: "cards", find: "for (let i = 1; i <= 8; i++)", replace: "for (let i = 1; i <= 7; i++)", expect: "DIFF" },
  { id: "M8", file: "e2e/suites/landfall/page.ts", family: "landfall", find: 'pressNav("End", "End", 35)', replace: 'pressNav("End", "End", 36)', expect: "DIFF" },
  { id: "M9", file: "e2e/suites/cards/cap.ts", family: "cards", find: "  await sleep(200);\n  await p27PageDown({ evaluate, send, check, sleep });", replace: "  await p27PageDown({ evaluate, send, check, sleep });\n  await sleep(200);", expect: "DIFF" },
  { id: "M10", file: "e2e/suites/chart-drawer/homes.ts", family: "chart-drawer", find: "  await cd42TakesDevice({ evaluate, check, sleep, restedAtExplorer });\n", replace: "", expect: "DIFF" },
  { id: "M11", file: "e2e/suites/landfall/clamps.ts", family: "landfall", find: "await l9dSaturate({ sleep, pinch, camNow }, stagePt9);", replace: "await l9dSaturate({ sleep, pinch, camNow }, null);", expect: "DIFF" },
  { id: "M12", file: "e2e/suites/landfall/touch.ts", family: "landfall", find: "  await l9aMouseWitness({ send }, stagePt9);", replace: "  void l9aMouseWitness({ send }, stagePt9);", expect: "DIFF" },
  { id: "M13", file: "e2e/suites/hunt/zoomed.ts", family: "hunt", find: "await sleep(120);", replace: "await sleep(100);", expect: "DIFF" },
  { id: "M14", file: "e2e/suites/fallback.ts", family: "fallback", find: 'await waitSettled("fallback-draw");', replace: 'await waitSettled("fallback-drawn");', expect: "DIFF" },
  { id: "M15", file: "e2e/suites/motion.ts", family: "motion", find: '  await step("D1, D2", () => d1ArrivalCeremony(ctx));\n  await step("D3", () => d3DragQuiet(ctx));', replace: '  await step("D3", () => d3DragQuiet(ctx));\n  await step("D1, D2", () => d1ArrivalCeremony(ctx));', expect: "DIFF" },
  { id: "M16", file: "e2e/suites/document-rooms.ts", family: "document-rooms", find: "  return { fold, folded, tab, back, entry, landed };", replace: "  return { fold, folded: back, tab, back, entry, landed };", expect: "DIFF" },
  { id: "M17", file: "e2e/suites/corners/floor-paper.ts", family: "corners", find: "await load(ctx, page, 640, 800);", replace: "await load(ctx, page, 641, 800);", expect: "DIFF" },
  { id: "M18", file: "e2e/suites/chart-drawer/prospect.ts", family: "chart-drawer", find: "  const two = await cd29SecondYear({ evaluate, check, sleep, settle, clickAt }, one);", replace: "  const two = await cd29SecondYear({ evaluate, check, sleep, settle, clickAt }, pp);", expect: "DIFF" },
  { id: "M19", file: "e2e/suites/chart-drawer/prospect.ts", family: "chart-drawer", find: "filed.imgs === 1 &&", replace: "filed.imgs === 2 &&", expect: "DIFF" },
  { id: "S1", file: "e2e/suites/home/stations.ts", family: "home", find: "  arms: number;\n};", replace: "  arms: number;\n  extra: boolean;\n};", expect: "same" },
];
const proof = join(import.meta.dirname, "814-e2e-a-proof.ts");
let bad = 0;
for (const row of ROWS) {
  const path = join(head, row.file);
  const before = readFileSync(path, "utf8");
  const hits = before.split(row.find).length - 1;
  if (hits !== 1) {
    console.log(`${row.id}: the text to mutate occurs ${hits} times in ${row.file}`);
    bad++;
    continue;
  }
  writeFileSync(path, before.replace(row.find, row.replace));
  const r = spawnSync(process.execPath, [proof, repo, base], { env: { ...process.env, HEAD_ROOT: head }, encoding: "utf8" });
  writeFileSync(path, before);
  if (readFileSync(path, "utf8") !== before) throw new Error(`${row.file} was not restored`);
  const verdicts = r.stdout.split("\n").filter((l) => /^(same|DIFF) {2}/.test(l));
  const own = verdicts.find((l) => l.split(/\s+/)[1] === `${row.family}:`);
  const others = verdicts.filter((l) => l !== own && l.startsWith("DIFF"));
  const got = own?.startsWith("DIFF") ? "DIFF" : own?.startsWith("same") ? "same" : "missing";
  const ok = got === row.expect && others.length === 0;
  if (!ok) bad++;
  const first = r.stdout.split("\n").find((l) => l.startsWith("      ")) ?? "";
  console.log(`${row.id} ${ok ? "as expected" : "UNEXPECTED"}: ${row.family} ${got} (expected ${row.expect})${others.length ? `; also ${others.join(", ")}` : ""}${got === "DIFF" ? `; first line: ${first.trim().slice(0, 140)}` : ""}`);
}
process.exit(bad === 0 ? 0 : 1);
```

### `814-e2e-a-typeprobe.ts` (sha256 e4026943764755d98a11396d521331417fd7fcad93b9bc1f0211aa1491dd04ef)

Row S1's type check.

```ts
// usage: node 814-e2e-a-typeprobe.ts <head root>
// Issue #814 pull request 3, planning only: retypes Visited's `arms` field in e2e/suites/home/stations.ts, runs the project's first type check, prints its first error lines and exit, and restores the file byte for byte.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const head = process.argv[2];
if (head === undefined) {
  console.error("usage: node 814-e2e-a-typeprobe.ts <head root>");
  process.exit(2);
}
const path = join(head, "e2e/suites/home/stations.ts");
const before = readFileSync(path, "utf8");
const after = before.replace("  arms: number;\n};", "  arms: string;\n};");
if (after === before) throw new Error("Visited's arms field is not where the probe expects it");
writeFileSync(path, after);
const r = spawnSync(join(head, "node_modules/.bin/tsc"), ["--noEmit"], { cwd: head, encoding: "utf8" });
writeFileSync(path, before);
if (readFileSync(path, "utf8") !== before) throw new Error("not restored");
console.log(`tsc exit ${r.status}`);
console.log(r.stdout.split("\n").slice(0, 3).join("\n"));
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the final dry run. `eslint-suppressions.json` and `test/repo/lint-config.test.ts` are commit 1's; each other file is its family commit's and does not change again.

| file | sha256 |
|---|---|
| `eslint-suppressions.json` | 507e2b529b49df9f6c3fa049da3b9a885087ec411f5b2b0b10a3ecccdf46f7fc |
| `test/repo/lint-config.test.ts` | 3b09dae4f8f42fcadf27bc3c841c49a11b8fdb979d9ace2db1902f2c4b85bad7 |
| `e2e/harness.ts` | 373baea09744e9a959caff99656cc7b3330483bd89112444bf6fa92d469362ab |
| `e2e/support/pace.ts` | c41c2da872c948edd707c89138ab5ab99527e4426b0697884b11fe458b8e0a24 |
| `e2e/suites/fallback.ts` | 15c8e20e97942e7c147fef1a60cf8de5711646880728b98bebe4aa7dcf1c836e |
| `e2e/suites/motion.ts` | c072cea76e68d5f97a70a2e0639bf81a4c581a81a64b79f134ea2af7624edada |
| `e2e/suites/cards.ts` | 4bdea98efc18977b169b35804e4025994dd6f0fb2436b103aed922f6dbf1949f |
| `e2e/suites/cards/cap.ts` | 85b4b438f33da5e4856adcb5580127383501f1b62e3a6666085ee8fe814e6271 |
| `e2e/suites/cards/overlay.ts` | 42f1221c800d85f19b0df5af5795d830e77117f324fa0bb93f5d6f7a7626b6a0 |
| `e2e/suites/cards/hold.ts` | 9c3a7d764b4cd96e8ff31120153e77215097627e6cf426f0ddd1c1e809e522e3 |
| `e2e/suites/cards/hold-tablet.ts` | 7cff63105ee4157f0059fa48a19f57ad61a9e9e47ad25e5692982b166fe8593d |
| `e2e/suites/chart-drawer/reads.ts` | 4015f0180841afa674e2db5896c2ffef6c8b6e5e6cf8411f2b75b53b4be0ce45 |
| `e2e/suites/chart-drawer/drag.ts` | 317fc4e36d753916b4c7c150be47dbb7f5e7b2d0ac05dedcf79b77d1320789e1 |
| `e2e/suites/chart-drawer/homes.ts` | fe326aa0caca0a460fa6ca458eb1a8a128514159bbd62c600c411a6875ef7973 |
| `e2e/suites/chart-drawer/prospect.ts` | de1be340b9a1d03fd63dbfbcfd5cd54d5aaf71b3e0f6d71df62a1862ef2ff9d8 |
| `e2e/suites/corners.ts` | d487954ca8d356b4434ab6b8737a7438178c0a12493df37a4ffb33bef332bc7a |
| `e2e/suites/corners/floor.ts` | a872ead08b01cb31d9270c92944c4505f66a8f1e8084c2741c9e134f23099f4a |
| `e2e/suites/corners/floor-paper.ts` | d239a9ca7344f907efa2136bde9920c201c11f9e7da49a7678e14c28f9445488 |
| `e2e/suites/document-rooms.ts` | f76de8e15307dbdfa09b96113742eedc0f75b26f5f6ef8bc0f9e8cf98034b7e0 |
| `e2e/suites/document-rooms/landmark.ts` | 8f2db050093b1d3e0e8180aff49ae70dc26beee00319a8c5ec6a6db48e1c1eaa |
| `e2e/suites/glass-ceremony.ts` | b620675f015c89f10bd398422920f64eb7579b83c4b9ba589f225d60960313dc |
| `e2e/suites/home/stations.ts` | 99e7778b5e662dcbcadea69ad3655583ed8c456ab361d84726db125db24ef49c |
| `e2e/suites/hunt.ts` | 246ef0783659de46a6ae3dc903bb841a12266ea6d836056ad9ee2514a304d508 |
| `e2e/suites/hunt/solved.ts` | 042d8d6f4e6d5681c8784675615a9e9c6548aff31617ca4fe409b7a7b58c2421 |
| `e2e/suites/hunt/zoomed.ts` | f92245b5cd94292658e8e670a2d7f60fa821665e01abf77573568ece2cfc592f |
| `e2e/suites/landfall/kit.ts` | b4423758890d9cee1d42e15cda4a8850483f06e1df31a875a5eacf21d889e2e4 |
| `e2e/suites/landfall/clamps.ts` | b3f812557d2c57d5968477fd610d794a57b016f97adc48538e3d5d90a68a3b5c |
| `e2e/suites/landfall/controls.ts` | 9d53c6e72e1f8b6a4c674a91379c76ebd7526778c0f4cb7d0cbb73335ae8fa88 |
| `e2e/suites/landfall/page.ts` | 892afa3f8af8f05ca2dfc6492045c57d074466b53a4d9f72d1c4ceb250708318 |
| `e2e/suites/landfall/seed.ts` | acc04252d69f2ef30bc81c1ba78a6ec793a8cf8bd3fcd24c88228d0423b4bf6f |
| `e2e/suites/landfall/touch.ts` | dbaab60cd6041ddf33d64013116b857ebd92de1a12ddd4f5081bc03c1ce5bea7 |
