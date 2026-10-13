# Issue #779 part 2h: browser checks for the Explorer and the kit sheets

**Planned at**: `origin/main` `2b148100` (`2b1481002759848a58a80626fa4005e3cfa33cde`); Issue #779 read at 51 comments (the newest, 6133488428, 2026-10-12, the rulings below).
**Label and archive**: `2h`; this file is copied unchanged, appendices and all, to `handbook/plans/779/779-part2h-plan.md` as the pull request's first commit (workflow step 8). Branch `chore/779-part2h-explorer-kit`.
**The cold review**: `vellum-pr-skeptic` runs cold at workflow step 14, as on any pull request; that is the default this plan keeps. Ruling 2 below leaves Alex free to skip it when the build is dispatched, so it is skipped only where the build's dispatch brief says so and cites that decision (step 18).
**Rulings that bind**: the part 2 menu, https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6055743231 (items 4, 5, 6, 8 and 9; ruling 8: stop for Alex at a decision these do not cover); the merge clearance 6050922197; a stop on the named check's own read counts, 6090198881; 2f's menu, 6091335054 (item 1: the `is:inline` source checks deleted, Issue #600 decides the word); the carry-through 6092705921 and its sequencing 6093191801; 2g's menu, 6098118329 (ruling 2: one naming rule for new e2e files; ruling 3: the import pins kept for 2i); 6100613317 (part 2 is thirteen pull requests, 2h one of them); the five-lane ruling 6102367152; this part's menu, 6133488428 (the **Rulings** line). The round's conventions are the committed 2g plans (`handbook/plans/779/779-part2g-plan.md`, `779-part2g-plates-plan.md`, `779-part2g-reading-plan.md`) and the lanes' numbered calls, newest in 6103395446 and 6103806702; they bind here and are not restated except where this plan departs.
**Rows handed to 2h**: 2e's table (6089867328, as amended by 6090067196: AK6, the Land's `#beasts`, ER1, the pill fade and screen-only, the zoom-k row); 2f call 9 (6092158219: the two broadside Glossary rows and ER1; AK7's camera press, the lift tokens, AK2, AK3 and the roles worn, to the round of their last suite); the frozen 2g design's call 1 (`handbook/plans/779/779-part2g-plan.md`, "The rounds' owners": AK2 to AK6, living-chart-css's engine hooks, the three shell-css-ground mount rows, the plate dress row, the four-page `is:inline` pin on 6091335054 item 1's terms, the pill fade and screen-only); the PR #833 row in `handbook/errata/guards.md` (AK6's out press). HZ2 went to 2g (that design's call 1); 2h retakes nothing an earlier round took or tabled for 2i.
**Rulings**: https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6133488428 (Alex, 2026-10-12, relayed). Ruling 1: the four-page `is:inline` pin is deleted on the terms of 6091335054 item 1 once the builder's build-both-ways comparison finds the four pages identical; any difference brings the question back to Alex before anything is deleted; the measurement goes on Issue #600. Ruling 2: the cold `vellum-pr-skeptic` round stays the default, and whether this build skips it is decided at build time.
**Open decisions**: none. Every other decision is a call, listed with its rule.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:
- `handbook/specs/check-placement.md`, whole.
- `handbook/specs/settle-doctrine.md`, clauses 4 to 9 and 14, and the whole environment section (waits inside steps, the late metrics clear, Enter's character, the unfurl wait, focus emulation, the same-run control for an emulated condition).
- `handbook/specs/cascade-traps.md`, whole (every dress check reads the computed value, never the declaration).
- `handbook/specs/explorer-doctrine.md`, "The engine boundary and the host contract", "Counter-scale" and "Overlay lifecycle" (the contracts the engine-sheet checks read).
- `handbook/specs/site-architecture.md`, "How a page is authored" (its roster paragraph, edited below) and "The two contractual forms" (its `is:inline` bullet, edited below).
- `handbook/specs/development-workflow.md`, steps 8 to 13 and 15, and step 11's proof-runner paragraph.
- `handbook/specs/conventions.md`, "How code is cited" and "The comment sweep" (a new comment is one line, only for what no check pins).
- `handbook/specs/orchestration.md`, "A lane that stalls, dies or loses its tree" (the handover at step 12).
- `handbook/specs/ui-design.md`, for reference only: the checks assert values it ratified (the control idiom, the focus ring, the archivist's head, the camera's press) and change none.
- `.claude/skills/vellum-footguns/SKILL.md`, Gates 1, 2, 4 and 5, each at the moment it applies; Gate 5 in full at the first push.

## What recon changed

Recon (`vellum-spec-recon` at `2b148100`; its ledger is archived as `779-2h-recon-ledger.md` in the support folder `handbook/plans/779/779-part2h-support/`, and what it changed is written here) found 46 tests to move, at least 187 assertion calls before loops, against the program table's "about 60". What changed the plan:
- **The four-page `is:inline` pin has no holder**: 2f measured that dropping the word leaves `dist` byte-identical for home and the Specimen, and this round's design pass ran the compiler alone on these four tags, with identical output. No built-page read and no browser check can red on it. Ruling 1 of 6133488428 deletes it once the builder's own build-both-ways comparison (row AB1.c-local) finds the four pages identical.
- **The plate dress has no Print Room wearer**: the `.plate` wearers are home's three shelf plates, `#pp-plate` and `#rb-plate`, and Issue #514 holds whether a full-sheet plate should tip. Its check is read on home's shelf (call 5).
- **The Explorer's print `.stage { position: static }` is dead** (the kit's print `body.chart-room .stage` decides it), the class PR #858's `site.md` row records for four other sheets: the row is extended, no pin.
- **Every colour read goes through `e2e/support/pixel.ts`** (`PAGE_RGBA`, `tokenRgba`, `nearRgba`, `SHADE`), not the census's colour strings.
- **AK6's unread press is `out` alone** (SB13 presses `fit` since 2f); `#beasts` is missing from every BR check, not only The Land's.
- **Three census hosts are over the size cap** (`e2e/suites/cards/hold.ts`, `e2e/suites/corners/floor.ts`, `e2e/suites/stage/stage.ts`): nothing new joins them.
- **`turn` has no row left**, and the census also names `runninghead`, `specimen`, `reading-room`, `room-ink` and `chart-drawer` holders.
- **`e2e/suites/broadside.ts:1`'s header** goes false when the broadside unit pins leave: it is edited.
- Two source reads in no round's record, neither 2h's: `test/prospect/plate-face.test.ts` (a committed generated module, out by the census's call 2) and `test/repo/e2e-read-types.test.ts` (a type-checker scan that binds every new kept read here to a declared shape). Named for 2i under "Found on the way".

## The population and each test's fate

46 tests in 13 files. "Leaves" means deleted once every claim's row is proven; "shrinks" means it keeps only its 2I claims, under the name its appendix gives; the holders are the checks of the appendix row.

| file | tests | fate |
|---|---|---|
| `test/site/broadside.test.ts` | the nine (groups in order, seed row, The Land, The Hand, The Press, seals, footnote marks, glossary anchors, drafting table) | all leave; the file is deleted |
| `test/site/explorer-page.test.ts` | the survey label | leaves; the file is deleted |
| `test/site/explorer-room.test.ts` | ER1 to ER7 | ER1 to ER5 leave; ER6 and ER7 shrink (Appendix A, section D) |
| `test/site/table-address.test.ts` | the allowlists mirror the Explorer's selects | leaves |
| `test/site/tip-affordance.test.ts` | the footnote marks tip | leaves |
| `test/site/region-detail-wiring.test.ts` | the worker and its inline twin | shrinks to the worker's chain cache (Appendix A, D) |
| `test/site/app-bundles.test.ts` | the four pages' `is:inline` | leaves (ruling 1), once row AB1.c-local's build-both-ways comparison finds the four pages identical; a difference is a stop |
| `test/site/atelier-kit.test.ts` | AK2 to AK7 | AK2 to AK5 leave; AK6 and AK7 shrink and are renamed (Appendix B, D); AK8 stays as 2i's |
| `test/site/room.test.ts` | screen-only, the pill fade | screen-only leaves; the pill fade shrinks (Appendix B, D) |
| `test/site/house-style.test.ts` | the archivist's label, the control idiom, the focus ring, the roles worn | all four leave (the dead halves to errata) |
| `test/site/shell-css.test.ts` | raise/press tokens, the plate dress, the lifting surfaces | the tokens test shrinks to "declared once" (Appendix B, D); the other two leave |
| `test/site/living-chart-css.test.ts` | LC1, LC2, LC3, LC5, LC6, LC7, LC8 | LC1, LC2, LC8 leave; LC3, LC5, LC6, LC7 shrink to their "declared once" claims (Appendix C, D); LC4 stays as 2i's |
| `test/site/shell-css-ground.test.ts` | the three mount rows | all three leave, with `CHART_MOUNTS`, `QUALIFIED_CHART_RULES`, `DEPTH_TOKENS`, `findRule` and the `rulesIn` import if nothing left uses them |

A test whose claims are not all proven by the end of step 13 keeps exactly its unproven claims (the disposition table) under the name its appendix gives, or its own name where it keeps every claim.

## The design

**The rule this round applies** is 2g's ("The rule this round applies" in `handbook/plans/779/779-part2g-plan.md`) with 2g-plates' and 2g-reading's departures, and these points this round adds or makes explicit:
1. **A claim is held by** a named browser check printing `FAIL` (BITES), or a stop on an exception thrown by the named check's own read of the broken code, read by a person from the ledger's stanza (NEEDS READ, 6090198881). **Every BUILT claim's holder is a browser check** (ruling 4 of 6055743231; the committed 2f and 2g plans open with the same line). Two other holders are admitted, each by a rule of its own: AB1's built-page halves are held by the surviving built-page test in `test/site/astro-scaffold.test.ts` (HELD-DATA), on the terms Alex ruled for the same pins (6091335054 item 1: "what the tag is for stays tested on the built pages"); and RDW1's `worker-client.ts` half is held by the unit tests in the same file that run `runInline` (HELD-RUN; `handbook/specs/check-placement.md`: a unit test runs the code), since that half is code a unit test can run, not markup.
2. **A claim no browser here can see** stays as a smaller unit test for 2i, in one of the classes the appendices name: an import pin (ruling 3); a retire pin outside ruling 6's fifteen rows (2e call 5, 2g-reading call 4); "declared once" (the PR-lay precedent); two synchronous calls nothing interleaves; code shape that changes nothing served. **Dead CSS** (a declaration another rule decides, or a rule for a class no served element wears) loses its pin and gets an errata row (2g-plates call 24, 2g-reading call 5).
3. **"Through the kit" halves** (AK2, AK3, AK5, HS5: that a page takes a shape from the component rather than a paste) leave as the class ruling 6 retired as AK1 (2f call 11): a pasted copy renders the same.
4. **A loop's claim is proven by instance**: "no foreign id in this group" is proven once per foreign group and once for `#beasts` (the one id BR1 cannot see); "the group holds every one of its ids" is proven per id. BR9 reads every group's whole list, so any other instance reds it too.
5. **Every new check** is its own `step(...)` labelled with its id, and its `check(...)` name begins with that id; it undoes everything it changes in a `finally`; it fails rather than throws where its premise is a press or a hover; an absent element reads as a sentinel; every payload states its shape (`Payload<T>` or `evaluate<T>`, `test/repo/e2e-read-types.test.ts`); colours go through `e2e/support/pixel.ts`; every function stays under 50 code lines and every file under 400; nothing joins `eslint-suppressions.json`.
6. **New files follow the naming rule** (6098118329 ruling 2): a new folder for a suite that has none (`e2e/suites/broadside/`, `e2e/suites/render/`, `e2e/suites/glass-ceremony/`), and in a suite that already has a folder (`runninghead/`, `cards/`, `zoom/`, `specimen/`, `home/`, `room-instrument/`, `reading-room/`) new files take the rule's names beside the old ones. The "New checks" table below names every file.
7. **Shared helpers are imported from where 2g exported them** (2g-plates departure 8): `clearMetrics`, `pressAt` from `e2e/suites/print-room/kit.ts`; `LENS`, `lensRest`, `homeCamera` from `e2e/suites/print-room/print.ts`; `LEGEND_RESEAT`, `reseatKept` from `e2e/suites/print-room/proof.ts`; `sendKey` from `e2e/support/home.ts`; `withScriptsOff` from `e2e/support/scripts-off.ts`. A reader of a computed value joins `e2e/support/pixel.ts`; no new support file is made.

**Alternatives rejected, so the build does not rediscover them:**
- A new e2e suite for the kit swept across rooms: a new suite joins `E2E_SUITE_ORDER`, the suite map, `E2E_LANES` and `MEASURED_SECONDS`, and `runninghead` already visits every shelled page in `rhSweep`.
- Letting `test/site/astro-scaffold.test.ts`'s built-page reads hold the BUILT claims of AK2 to AK5 and HS5 (this plan's first draft): that is ruling 4's option B, which Alex did not take, and the 2f and 2g plans refused it in their first lines; RH32 reads them in the browser instead (the plan skeptic's finding 1).
- Keeping AK2 to AK5 as 2i source reads: every claim of theirs is visible on the served page, and RH32 reads it.
- Lint rules for the code-shape claims (the arm scoping, the translate counts, the `is:inline` word): new house rules are 2i's (the witnesses and the enforcement rule are its row).
- Hosting the card's seats and dress in `cards`: its hold group presses card links and travels town to card, so a moved card reds P28 and P31b unpredictably; they run in `zoom` (Appendix C, F17 and F19).
- Hosting the control idiom on the Explorer's `#draw`: it wears the kit's gold; the base idiom is read on the Explorer's `#type` and the house primary on the Specimen's `#sb-report` (Appendix B, doubt 8).
- Folding the "declared once" pins of LC3, LC5, LC6, LC7 into LC4 (Appendix C, F9): that reshapes a 2i test; each test keeps its own claims, as 2g's shrinks did.
- Splitting 2h into several pull requests: Alex counted part 2 at thirteen with 2h one of them (6100613317).

### The new checks

31 checks. The appendices give each one's reads, wants and `finally`; this table is where each lives.

| id | suite (lane) | file | place in the suite's `run` | what it reads | est. CI s |
|---|---|---|---|---|---|
| BR12 | broadside (B) | `e2e/suites/broadside/dress.ts` (new) | right after step "BR1 to BR1c" | the Explorer at rest on a fresh boot: reserves, sheet depth, zoomable, pivot, chart fill, folio lines, legend clear of the folio | 4 |
| BR11 | broadside | `e2e/suites/broadside/room.ts` (new) | right after BR12 | every option of the four pickers parses as a table item | 0.1 |
| BR13 | broadside | `e2e/suites/broadside/gestures.ts` (new) | right after `br5Hover` | a footnote mark tips at the wordmark's numbers | 1 |
| BR14 | broadside | `e2e/suites/broadside/gestures.ts` | right after BR13, before `br6Tap` | a leaned camera prints unzoomed | 2 |
| BR10 | broadside | `e2e/suites/broadside/room.ts` | right after step "BR7" | the Glossary's drafting-table terms | 0.1 |
| BR9 | broadside | `e2e/suites/broadside/room.ts` | after BR10, the last step before `br8Clean` | the Explorer as authored, scripts off | 1.5 |
| RH25 | runninghead (B) | `e2e/suites/runninghead/room.ts` (new) | `kitChecks`, step 1 | the kit's stage shape and the Explorer's leaf (from the sweep) | 0.3 |
| RH26 | runninghead | `e2e/suites/runninghead/dress.ts` (new) | `kitChecks`, step 2 | every chart room's pill fade | 0.3 |
| RH27 | runninghead | `e2e/suites/runninghead/dress.ts` | `kitChecks`, step 3 | the house roles worn | 0.3 |
| RH28 | runninghead | `e2e/suites/runninghead/dress.ts` | `kitChecks`, step 4 | the control idiom and the house primary | 0.3 |
| RH29 | runninghead | `e2e/suites/runninghead/gestures.ts` (new) | `kitChecks`, step 5 | on paper no room paints its folio panel, in its own state (the printed DOM) or any other (a walk of the served CSSOM) | 1 |
| RH30 | runninghead | `e2e/suites/runninghead/gestures.ts` | `kitChecks`, step 6 | the house ring's width and style | 1 |
| RH31 | runninghead | `e2e/suites/runninghead/gestures.ts` | `kitChecks`, step 7 | a nav link rises by the house raise | 1.2 |
| RH32 | runninghead | `e2e/suites/runninghead/room.ts` | `kitChecks`, step 8 | the kit's lifted shapes in every room that wears them: the fog, the vignettes, the Glass, the chart folio, the stage, every road out | 1.7 (the Portfolio visit it shares with RH29 included) |
| P34 | cards (A) | `e2e/suites/cards/gestures.ts` (new) | right after `pCardShot` | a plain button's raise and press at the ratified tokens | 1 |
| P35 | cards | `e2e/suites/cards/gestures.ts` | right after P34 | the card's Prospect road rises by the house raise | 1.5 |
| P36 | cards | `e2e/suites/cards/gestures.ts` | right after step "P28 to P33", before step "P30" | the raised town takes the hand over the box covering it | 1 |
| G9 | glass-ceremony (A) | `e2e/suites/glass-ceremony/dress.ts` (new) | right after `g1Cluster` | the camera's press face at rest | 0.3 |
| G10 | glass-ceremony | `e2e/suites/glass-ceremony/gestures.ts` (new) | right after G9 | the press dark under the hand and under focus | 0.8 |
| SB15 | specimen (C) | `e2e/suites/specimen/gestures.ts` (new) | right after step "SB13" | the Glass's out press in a glass-keys room | 1.5 |
| H21 | home (C) | `e2e/suites/home/gestures.ts` (new) | last, after `h19Floor` | home's shelf plate rests flat and tips under the hand | 2 |
| R16 | render (A) | `e2e/suites/render/room.ts` (new) | right after `r0ToR4Worker` | the Explorer's host contract: mount class, sheet link | 0.1 |
| R17 | render | `e2e/suites/render/dress.ts` (new) | last, after `r14Region` | the Explorer's sheet at the stage depth, the chart filling it unshadowed | 0.2 |
| Z22 | zoom (A) | `e2e/suites/zoom/camera.ts` | first of the five steps after `zGeometric` (override 2) | the hit's box on its mark, the resting ring, the keyboard ring | 1.5 |
| Z24 | zoom | `e2e/suites/zoom/dress.ts` (new) | right after Z22 | the card's seats in four variants at k 1 and 4 | 2 |
| Z25 | zoom | `e2e/suites/zoom/camera.ts` | right after Z24 | every card at depth nudged flush into the box | 3 |
| Z26 | zoom | `e2e/suites/zoom/dress.ts` | right after Z25 | the place card's dress, part by part | 2 |
| Z27 | zoom | `e2e/suites/zoom/gestures.ts` (new) | right after Z26, before step "Z11" | under a pinned card only its own town offers the hand | 3 |
| Z23 | zoom | `e2e/suites/zoom/dress.ts` | right after step "Z20d" | the inked survey's overlay dress | 2.5 |
| RR43 | reading-room (B) | `e2e/suites/reading-room/dress.ts` | in `atTheDesk`, right after step "RR39" | the room's survey overlay casts no shadow | 0.1 |
| RS32 | room-instrument (C) | `e2e/suites/room-instrument/dress.ts` (new) | right after step "RS31", before RS24's gate | the bar wears the engine's instrument | 0.2 |

Lane cost: A about +18.9 s (cards 3.5, glass-ceremony 1.1, render 0.3, zoom 14), B about +16.6 s (broadside 9.5, runninghead 7, reading-room 0.1), C about +3.7 s (specimen 1.5, home 2, room-instrument 0.2), D nothing. `e2e/suites/zoom/camera.ts` ends near 330 code lines with Z22 and Z25 in it.

### Overrides of the appendices (the body wins where they disagree)

1. **`e2e/suites/cards.ts`'s `run` is split first**, as one commit: its unstepped calls from `await p1Overlay(ctx, pm);` through `await p17RuinNote(ctx, pm);` (eighteen lines) move, in order, into `async function pOverlayReads(ctx: SuiteContext, pm: Awaited<ReturnType<typeof pManifest>>): Promise<void>` defined in `e2e/suites/cards.ts` below `run`, and `run` calls `await pOverlayReads(ctx, pm);` in their place. Appendix B's `pShotThenLifts` is not built: P34 and P35 are two steps in `run` right after `await pCardShot(ctx, pm);`, and P36 a step right after step "P28 to P33". `e2e/suites/cards/gestures.ts` holds `p34ButtonLift`, `p35ProspectLift` and `p36RaisedTakesHand`.
2. **`e2e/suites/zoom.ts`'s `run` is split first**, as one commit: its unstepped calls from `await z1ZoomTo(ctx);` through `await z10bNoDblclickLeak(ctx);` (eleven lines) move, in order, into `async function zGeometric(ctx: SuiteContext, k: ZoomKit): Promise<void>` below `run` (`z8bHoverRing(k)` takes the kit), and `run` calls `await zGeometric(ctx, k);` in their place. Z22, Z24, Z25, Z26 and Z27 are five steps right after that call, before step "Z11" (the redraft is still off there); Z23 is a step right after step "Z20d". Appendix C's "right after `z8bHoverRing`" reads as this.
3. **Every new check's step label is its id alone** (`step("BR9", ...)`), and its check name starts with that id, so a stop reads as that id and a red as that id.
4. **A row marked `?`, LOCAL FIRST, or CONDITIONAL as a whole** is run locally before the send (step 9 below), and its sent expect is the set that run measured.
5. **Appendix B's `kitRead`** gathers inside `rhSweep`; its print emulation is reset in the same `finally` per route, and RH25 to RH29 and RH32 judge that data in their own steps, as Appendix B section B says.
6. **Appendix A, F7's fallback is one design**: if the wordmark does not hit-test to itself on the Explorer, BR13 takes the wordmark's hover read on `/glossary/` inside its own step (`k.gotoPlain` there, the real hover and the read, then `k.goto(k.EXP + "#seed=42&style=antique", "broadside-back")` before the step ends), and compares the mark's tip on the Explorer against it.
7. **Appendix B, P4's mismatch is a stop**, not a redesign in the build.
8. **Appendix C, F2's move is bounded**: a target that needs a nudge at k=1 moves 0.05 toward the centre at most twice; a third fault is a stop. Appendix C's "`zoom/camera.ts` about 255 code lines after" reads as about 330 (Z22 and Z25 both join it).
9. **Appendix A, F1: a difference in AB1.c-local's build-and-compare is a stop**, so the question goes back to Alex before anything is deleted (ruling 1); it is not re-routed to the runner.
10. **Appendix B's `pShotThenLifts` and Appendix C's own `cards.ts` split text are replaced by override 1**, and Appendix B's doubt 4 ("`runninghead` ... is the alternative") is closed: H21 stays in `home`.

### Each appendix's doubts, resolved (nothing in an appendix's section F is left open)

- **Probes and CONDITIONALs** (A: F2 to F5, F7; B: P1 to P10; C: F1 to F4, F15, F18): each runs where commit order and step 9 put it, and its outcome changes the check or the row exactly as its own text says. An outcome its text does not list is a stop.
- **`?` members and LOCAL FIRST rows** (A: F5, F6, F8; B: P8, P10; C: F5, F6, F14): measured locally in step 9 (or by the unit drive, step 7, for a unit `?`); the measured set is the one sent.
- **A, F1** (the `is:inline` word): ruling 1 and override 9. **A, F9**: call 10. **A, F10** (RDW1's chain cache): kept for 2i as code shape visible to time alone, call 7. **A, F11, F12, F13** and **C, F10, F16**: no action; where two areas' rows red each other's unit tests, the unit drive measures it, and BR9 and R16 both read the mount class (BR9 for ER5, R16 for LC8), each kept.
- **B, doubt 1 and 8**: call 13. **B, doubt 2**: call 21. **B, doubt 3**: call 3. **B, doubt 4**: H21 stays in `home` (call 5; the brief's host). **B, doubt 5**: call 4. **B, doubt 6**: RH29's check message names its blind spot (a sheet no served page links). **B, doubt 7**: the errata rows say it. **B, doubt 9**: the size list, step 15. **B's follow-up doubts**: RH32's hand-copied rosters join `handbook/specs/site-architecture.md`'s roster bullet (step 15's edit); RH32's scripts-on blind spot (a planted `style` on a folio line) and RH29's walk's blind spots are named in each check's message, each erring toward a miss; P9's runtime premises for RH32 (home's Glass gains only `on`, Today's folio lines only `style` and `drying`, no script adds a road) are confirmed by the unmutated runs commit 6 owes, and one that fails is a stop.
- **C, F7 and E row 3**: call 20 (R16 reads the class as authored; the doctrine's overstated sentence and `public/living-chart.css`'s head comment are corrected in this pull request, wording under "Rosters, doctrine and the errata"). **C, F8**: kept as written. **C, F9**: rejected (the design's alternatives). **C, F11**: overrides 1 and 2. **C, F12, F19, F20**: as written. **C, F13**: call 7. **C, F17**: call 12.

## Files

Created (e2e, each under 400 code lines, every function under 50):
- `e2e/suites/broadside/kit.ts`: `export function broadsideKit(ctx: SuiteContext)` and `export type BroadsideKit = ReturnType<typeof broadsideKit>`, moved verbatim from `e2e/suites/broadside.ts` (its lines 8 and 31 to 57).
- `e2e/suites/broadside/room.ts`: `export async function br9Authored(k: BroadsideKit): Promise<void>`, `export async function br10Terms(k: BroadsideKit): Promise<void>`, `export async function br11Allowlist(k: BroadsideKit): Promise<void>`.
- `e2e/suites/broadside/dress.ts`: `export async function br12Dress(k: BroadsideKit): Promise<void>`.
- `e2e/suites/broadside/gestures.ts`: `export async function br13Tip(k: BroadsideKit): Promise<void>`, `export async function br14Paper(k: BroadsideKit): Promise<void>`.
- `e2e/suites/runninghead/room.ts`: `export type KitSample`, `KIT_READ`, `export async function kitRead(k: RunningHeadKit, route: string): Promise<KitSample>`, `export async function kitChecks(ctx: SuiteContext, step: ReturnType<typeof makeStep>, k: RunningHeadKit, kits: Record<string, KitSample | undefined>): Promise<void>` (it gathers the Portfolio's sample once, unstepped as the sweep is, then runs RH25 to RH32 in order as steps), RH25 and RH32, and RH32's rosters as named constants: `FOG_ROOMS`, `CHART_ROOMS`, `STAGED` (with each stage's gesture-box label) and `KIT_ROADS` (the road roster per route, written from `ROADS` in `test/site/astro-scaffold.test.ts`).
- `e2e/suites/runninghead/dress.ts`: RH26, RH27, RH28 (each `(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>) => void` over the gathered data).
- `e2e/suites/runninghead/gestures.ts`: `PRINTED_READ` (the printed DOM and the CSSOM walk in one payload) and RH29 (judging the gathered reads, no visit of its own), RH30 and RH31 (each `(k: RunningHeadKit) => Promise<void>`).
- `e2e/suites/cards/gestures.ts`: `p34ButtonLift(ctx: SuiteContext)`, `p35ProspectLift(ctx: SuiteContext)`, `p36RaisedTakesHand(hk: ReturnType<typeof holdKit>)` (`holdKit` imported from `e2e/suites/cards/hold.ts`, which already exports it), each `Promise<void>`.
- `e2e/suites/glass-ceremony/dress.ts`: `g9PressFace(k: GlassKit): Promise<void>`; `e2e/suites/glass-ceremony/gestures.ts`: `g10PressDark(k: GlassKit): Promise<void>`. `GlassKit` is the type `glass-ceremony.ts` declares for its kit at its line 6, which gains `export`; the two new files take it with `import type`, so no import cycle runs.
- `e2e/suites/specimen/gestures.ts`: `sb15OutPress(k: SpecimenKit): Promise<void>`.
- `e2e/suites/home/gestures.ts`: `homeGestures(ctx: SuiteContext, k: HomeKit): Promise<void>`, which makes its own `makeStep` and runs step "H21".
- `e2e/suites/render/room.ts`: `r16HostContract(ctx: SuiteContext): Promise<void>`; `e2e/suites/render/dress.ts`: `r17SheetDepth(ctx: SuiteContext): Promise<void>`.
- `e2e/suites/zoom/dress.ts`: `z23SurveyOverlay(k: ZoomKit)`, `z24CardSeats(ctx: SuiteContext)`, `z26CardDress(ctx: SuiteContext)`; `e2e/suites/zoom/gestures.ts`: `z27UnderPinned(ctx: SuiteContext)`; each `Promise<void>`.
- `e2e/suites/room-instrument/dress.ts`: `rs32BarDress(k: InstrumentKit): Promise<void>` (the kit type `room-instrument.ts` already builds).

Edited:
- `e2e/suites/broadside.ts`: the kit moves out (its imports follow); `run` gains the six steps in the order of the table; line 1 becomes `// Broadside e2e (BR1-BR14, Issue #270): the regrouped controls, seals, journal button and footnote apparatus on the built running page, and since Issue #779 part 2h the Explorer as authored and as dressed (BR9 to BR14), self-contained with scoped deltas.`
- `e2e/suites/runninghead.ts` (`run` destructures `kits` and gains `await kitChecks(ctx, step, k, kits);` after the RH24 loop), `e2e/suites/runninghead/heads.ts` (`rhSweep` gathers `kits[route] = await kitRead(k, route)` after its two `shoot` lines and returns `kits`), `e2e/suites/runninghead/reads.ts` (`FLOURISH_FACE` exported).
- `e2e/suites/cards.ts` (override 1), `e2e/suites/zoom.ts` (override 2), `e2e/suites/zoom/camera.ts` (`z22HitAndRing(ctx: SuiteContext)`, `z25ClampFlush(ctx: SuiteContext)`, each `Promise<void>`), `e2e/suites/glass-ceremony.ts` (two steps, the `GlassKit` export), `e2e/suites/specimen.ts` (one step), `e2e/suites/home.ts` (one line), `e2e/suites/render.ts` (two calls), `e2e/suites/reading-room/dress.ts` (`rr43OverlayUnshadowed(ctx: SuiteContext): Promise<void>`, beside `rr39AtRest`) and `e2e/suites/reading-room.ts` (in `atTheDesk`, `await step("RR43", () => rr43OverlayUnshadowed(ctx));` right after the step "RR39" line), `e2e/suites/room-instrument.ts` (one step).
- After the proofs: the 13 unit files of the population table; `test/e2e/lane-timings.test.ts`; `eslint-suppressions.json` and `LIST_AT_REFORMAT` in `test/repo/lint-config.test.ts`; `handbook/errata/site.md`, `guards.md`, `prose.md`; `handbook/specs/site-architecture.md` (three edits); `handbook/specs/explorer-doctrine.md` (one edit); `public/house.css` line 1; `public/living-chart.css` line 1; `.claude/skills/vellum-footguns/references/flake-record.md` (a row per flake, as one arises).

Deleted: `test/site/broadside.test.ts`, `test/site/explorer-page.test.ts` (step 14).

No `src/` file changes, and no `public/` change but two head comments (`public/house.css`'s and `public/living-chart.css`'s): every other source change is a mutation on the runner's own checkout or the local tree, restored byte for byte. No chart, golden, regen, page or engine change.

## The tests, in the order they are written, and how each is proven

This round adds browser checks and removes source reads; it changes no behaviour, so there is no failing test to write before a fix. **Each new check's red is its mutation rows**: the appendix rows that name it, run on the CI proof runner (or locally where a row says LOCAL), each a mutation that makes the claim false and must make that check print `FAIL`. The checks are written in the commit order below; each is green on the unmutated branch, locally and on CI, before any row is sent. Which rows the guard prover owes: its one round covers every new check (step 16); what it finds on a claim these appendices list is fixed and proven by the implementer, as step 16 says; nothing is left to the implementer to prove that the appendices already list.

## Order of commits

1. `#779 part 2h: archive the plan` (this file, unchanged, at `handbook/plans/779/779-part2h-plan.md`), pushed with `-u`. Alex directed (2026-10-12, 6133488428's note) that this plan be merged on its own first; when this file already stands on `origin/main` at that path, unchanged, commit 1 is skipped (a plan is never written over one on main), the branch is pushed with `-u` at commit 2, and the PR body names the plan's own merge.
2. `broadsideKit` moved to `e2e/suites/broadside/kit.ts` (`broadside` green).
3. `e2e/suites/cards.ts` split (override 1; `cards` green).
4. `e2e/suites/zoom.ts` split (override 2; `zoom` green).
5. BR9 to BR14 (`broadside` green).
6. RH25 to RH32 (`runninghead` green, twice: Appendix B, P9).
7. G9, G10 (`glass-ceremony` green).
8. P34, P35, P36 (`cards` green).
9. SB15 and H21 (`specimen`, `home` green).
10. R16, R17 (`render` green).
11. Z22 to Z27 (`zoom` green, twice, and `zoom,zoom-gestures`).
12. RR43 and RS32 (`reading-room`, `room-instrument` green).
13. After the ledgers: the deletions and shrinks (step 14).
14. What it drags (step 15).
15. Any fix after the prover's round (step 16), each named in the PR body as proven by the implementing session only.

Before each of commits 2 to 12: `npm run check`, `npm run lint`, `npm run format` then `npm run format:check`, `npm run build`, then the touched suite locally (`VELLUM_E2E_SUITES=<suite> npm run test:e2e`) until ALL PASS. Every CONDITIONAL probe of an appendix runs before its check is written, and its outcome decides the check exactly as that appendix says. Push after each commit.

## The procedure, step by step

Each step names its command; a step that ends in a hand-back says so. "Locally" means the macOS harness, one suite at a time, each run allowed to finish (never `pkill` a run you will repeat).

1. **Stand the tree up.** `pwd`, `git worktree list`, `git branch --show-current`; `git branch -m chore/779-part2h-explorer-kit`; `[ -e node_modules ] || ln -s ../../../node_modules node_modules`; `ls node_modules/.bin | head -3`. Then `git diff --stat 2b148100 origin/main -- src public e2e test test-support scripts eslint-suppressions.json`: any change to a file this plan names under those paths is a hand-back (Stop conditions). Read the issue's comments and count them: any comment newer than the **Planned at** count that the **Rulings** line does not name is a hand-back.
2. **Commit 1, the plan**, as "Order of commits" says. Read Gate 5 of `.claude/skills/vellum-footguns/SKILL.md` in full now (workflow step 9).
3. **Commits 2 to 12**, as "Order of commits" says, each with its checks and its suite green locally.
4. **The lane-order runs, locally, once every check is in**, each ALL PASS: `ribbon,broadside`; `room-voyage-route,runninghead,cluster`; `home,room-instrument,specimen`; `zoom,zoom-gestures`; `glass-ceremony,cards,health` (render is pulled in); `render,motion`.
5. **CI on Linux before any send**: `gh workflow run ci.yml --ref chore/779-part2h-explorer-kit`, then `gh run list --workflow ci.yml --branch chore/779-part2h-explorer-kit --limit 1` and `gh run watch <id>`. Every lane green. A new check red there and green locally: add a row to `.claude/skills/vellum-footguns/references/flake-record.md`, re-run once; red again is a hand-back with the payload.
6. **Compile the proof lists from the machine-readable rows.** The appendices' rows were also written as JSON working copies at planning time, by the design agents from the same tables and checked equal to them row for row: `779-2h-rows-explorer.json`, `779-2h-rows-kit.json`, `779-2h-rows-engine.json`, each an array of `{ id, kind, edits, unit?, e2e?, measureFirst?, localSuites? }`. They are archived in the support folder `handbook/plans/779/779-part2h-support/` under those names, and the build reads them there. An absent file, or a JSON row that disagrees with its appendix row (id, edits, a set) is a hand-back. Write `779-2h-split.ts` in your own scratchpad: it reads the three files and writes two modules, `779-2h-rows-a.ts` and `779-2h-rows-b.ts`, each `import type { Mutation } from "<repo>/scripts/proof-runner/send.ts"; export const MUTATIONS: Mutation[] = [...]`, one entry per row of kind BITES, NEEDS READ or LOCAL-CONTROL as `{ id, edits, unit, e2e }` (the `kind`, `measureFirst` and `localSuites` fields dropped). **Send A** (`-a`) holds every such row whose `e2e.suites` is `zoom`, `cards`, `render`, `glass-ceremony`, `specimen`, `home`, `hunt`, `hunt,print-room` or `room-instrument`; **send B** (`-b`) every row on `broadside`, `runninghead`, `reading-room` or `room-ink`; a row on any other selection is a hand-back. Rows of kind HELD-DATA, HELD-RUN and LOCAL go to neither (steps 8 and 9).
7. **Measure every row's unit half locally**, the tree committed and clean first (Commit before you mutate). The driver, `779-2h-unit-drive.ts` in the scratchpad, reads the three JSON files and, for each row with `unit` (every kind, LOCAL rows included): `applyEdits(readAt("<repo>", "HEAD"), edits)` (both from `scripts/proof-runner/send.ts`); writes each changed file; runs `node --test --test-reporter=<repo>/scripts/proof-runner/reporter.ts --test-reporter-destination=<tmp file> <files>` with a 600 s timeout; takes the `name` of each `pass: false`, `nesting: 0` event; writes each file back to its `HEAD` bytes; and stops the whole run if `git status --porcelain -- src public e2e test test-support scripts` then prints anything. It writes `779-2h-unit-measured.json` (`{ [id]: string[] }`). Then `779-2h-split.ts` writes the rows modules again with each `unit.expect` the measured set, and a row whose measured set is empty loses its `unit` block and goes e2e-only (2g-plates departure 3). `npm test` is never run between rows; `npm run astro:generate` restores `public/` after the drive.
8. **The unit-only rows are proven by that drive** (workflow step 11: a local proof stays valid): a HELD-DATA or HELD-RUN row whose measured set holds the holder its appendix names is proven, its line in `779-2h-unit-measured.json` the evidence, tabled in the PR body as local; one whose set lacks the holder is a HOLE (the disposition table).
9. **The local rows**, the tree committed and clean first. For every JSON row of kind LOCAL, and every row carrying `measureFirst` (its appendix marks it LOCAL FIRST, CONDITIONAL as a whole, or with a `?` in its e2e set): apply its edits as step 7 does, `npm run build`, run its selection (`VELLUM_E2E_SUITES=<e2e.suites, or localSuites for a LOCAL row> npm run test:e2e`), collect the ids of its `FAIL` lines and its "never reached its assertion" stops, restore every file to its `HEAD` bytes, `npm run build` again before the next row. A LOCAL green arm is proven when its run reds nothing on the e2e side (its control row goes to the runner); a LOCAL row with an expected red is proven when the run reds exactly that; every other row here takes the measured set as its sent `e2e.expect` (`779-2h-split.ts` writes it in), its stops read under the NEEDS READ line of the disposition table. Record each run's red set and stops in `779-2h-local.md`. A LOCAL row whose `edits` touch a page's source (AB1.c-local) runs as its appendix says (a build and a diff of the built pages against an unmutated build) instead of a suite.
10. **Dry-run each list**, posting nothing: `779-2h-dry.ts` in the scratchpad imports `buildList` and `readAt` from `scripts/proof-runner/send.ts`, `planJobs` and `MAX_JOBS` from `scripts/proof-runner/list.ts`, and `E2E_SUITE_ORDER`, `NEEDS_PREDECESSOR`, `OPENS_ON_HOME` from `e2e/support/suites.ts`; it builds each list at `git rev-parse HEAD` with `{ repo, read: readAt(repo, sha), rules: { order, predecessor, opensOnHome } }`, prints every error and warning, and prints `planJobs(list).jobs.length` beside `MAX_JOBS`. Any error is a hand-back (a find not where the plan says). Expected, from the JSON at planning: 114 rows in 9 selections for send A (about 124 jobs) and 164 rows in 4 selections for send B (about 169 jobs); a count of 256 or more moves the rows of that list's largest selection into `779-2h-rows-c.ts`, its own send.
11. **Freeze, then send.** No check a send's rows name is edited after that send; an edit re-sends its rows at the new head. Tell the dispatcher before each send (a running proof queues another pull request's CI). `npm run proof -- send <scratchpad>/779-2h-rows-a.ts`, then `-b` (and `-c`). Each runs about 30 minutes at `max-parallel` 12; the runner queues them one after the other.
12. **Handover boundary: lane 1 stops here.** Write `779-2h-handover.md` in the scratchpad: the branch and its head sha; step 5's CI run id; each send's run id and its rows module; the paths of `779-2h-unit-measured.json` and `779-2h-local.md`; each CONDITIONAL's measured outcome and what it changed; and the next step, 13. Report to the dispatcher. Lane 2 starts at step 13 from that file and this plan.
13. **Read each ledger** (`npm run proof -- read <run>`) and apply the disposition table to every row. One re-send round per send: a module `779-2h-rows-<send>-r1.ts` holding only the rows the table re-sends, read the same way. **Every re-send is e2e-only**: each re-sent entry drops its `unit` block, whose half the first send (or step 7) already measured, since a unit file it names may be deleted by then and a missing file breaks the runner's unit control for the whole send (the plan skeptic measured it; 2g-reading call 25).
14. **The deletions and shrinks**, one commit: every test whose claims are all held leaves whole; a test with a 2I claim, or a claim the disposition table kept, shrinks to those claims under the name its appendix gives (or its own name where it keeps every claim); a file left with no test is deleted. Then `npm test`, then `npm run astro:generate`.
15. **What it drags**, one commit, after a second CI run on the branch: `gh workflow run ci.yml --ref chore/779-part2h-explorer-kit` at the head step 14 left, watched to its end, so the branch set below holds that run and step 5's. Then `MEASURED_SECONDS` and the lane check; the size list (`npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` and `LIST_AT_REFORMAT` in `test/repo/lint-config.test.ts` lowered to match for every file that fell under a cap); the errata rows, the spec edits and the comment edits below; `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, `npm run astro:generate`.
16. **The guard prover's one round** (workflow step 11) at the pushed head, dispatched with the branch and the 31 new checks' ids; its mutation list goes to the runner as `779-2h-rows-prover.ts`, read under step 13's table. A prover HOLE on a claim these appendices list is an execution defect: the check gains the read of exactly what the prover's mutation broke, in the read form the check already uses for its sibling properties, proven red locally on that mutation and named in the PR body as proven by the implementing session only (workflow step 15). A prover HOLE on anything no appendix claim lists is a `handbook/errata/guards.md` row reading `Left by the author:`, not a new read. A prover finding about the design is a hand-back. A check edited in this step has its own appendix rows re-sent once at the new head, e2e-only (step 13's rule), and read under the same table.
17. **The calls comment** on Issue #779 (workflow step 12), in 2g-reading's form: the 2i table first (each appendix's section D, plus every claim the disposition table kept, with its reason), then this plan's "Calls made", then the calls made while proving. Then the pull request (`gh pr create --body-file`), title `#779 part 2h: browser checks for the Explorer and the kit sheets replace their source-text tests`, every template section, the closing-reference line `Issue: #779, stays open because part 2 runs thirteen pull requests and this is the twelfth; 2i follows.`, and `gh pr view <N> --json closingIssuesReferences` read back as `[]`. CI green on its head.
18. **`vellum-pr-skeptic`, dispatched cold** (workflow step 14), the default: the prompt is the pull request number and nothing else, and its one round is fixed as workflow step 15 says. Ruling 2 of 6133488428 leaves Alex free to skip this round when the build is dispatched: it is skipped only when the build's dispatch brief says so and cites his decision, and then the Records line names that decision. Report to the dispatcher and stop; the dispatcher merges.

### The disposition table (what each ledger state does)

| ledger state | what the lane does | hand-back |
|---|---|---|
| BITES | the claim is held | no |
| IMPRECISE, every named check red, extras beside them | an extra that has a row in `references/flake-record.md` gets a new row there and is left unnamed; every other extra is named; the row is re-sent once with that set, and BITES on the re-send is proof | no |
| IMPRECISE, a named check green | that check is a HOLE for this row (next line) | no |
| HOLE (no named check red) | where the row's appendix entry gives a widening or a re-aim for this outcome, apply it, prove it locally, re-send once; otherwise, or still a HOLE after that, the claim keeps its unit pin for 2i, listed in the calls comment's 2i table as "HOLE on the runner, run <id>" | no |
| NEEDS READ, every named check red by its own `FAIL` line | held by those reds; the stops beside them are recorded in the PR body's ledger and named nowhere else (ER3.a and ER5.d1 are this case: BR9 holds them) | no |
| NEEDS READ, a named check among the stops | read the stanza as a person: held only when the exception was thrown by that check's own read of the broken code (its stack inside the read the appendix names for it, on the element or value the mutation broke); a stop in a check's own navigation, settle, metrics clear or setup, or in a page the mutation killed, is not a hold, and the HOLE line applies (Alex's ruling 6090198881; workflow step 11; 2e call 2) | no |
| INCONCLUSIVE (the control not clean, or a run that could not be judged) | re-send that selection's rows once; INCONCLUSIVE again: run those rows locally as step 9 does and record the local result as the proof | no |
| NOT APPLIED | a find not where the plan says | yes |
| UNPROVEN (the budget ran out) | re-send once; still UNPROVEN: the claim keeps its unit pin for 2i, named unproven in the PR body | no |
| every row of one new check is a HOLE | the check cannot bite: it is deleted, and its claims keep their unit pins for 2i | no |
| the runner's run fails as a workflow (not a row) twice | | yes |

## MEASURED_SECONDS and the lanes

**The re-measure (PR #835's rule, as 2f, 2g-plates and 2g-reading took it).** For each touched suite (`broadside`, `runninghead`, `reading-room`, `cards`, `glass-ceremony`, `render`, `zoom`, `specimen`, `home`, `room-instrument`), the new value is the committed value times the median of that suite's per-suite wall clock over this branch's slow-tier lane jobs, over its median over main's slow-tier same-lane jobs. The figures are read with `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, the lines under `per-suite wall clock`. A lane job is slow-tier when its suite total is at least 0.95 of the slowest same-lane job in its set. Main's set is the CI runs on main whose head holds the suites as main does at `2b148100`: `38100572018`, `38190437841`, `38191378114`, `38194585646`, `38200625316`, `38294148573`. The branch's set is step 5's run and step 15's second dispatched run, both at heads carrying every new check. A suite whose lane drew no slow-tier job on the branch side is scaled by its local ratio instead (the branch over `2b148100`, each built and run locally one at a time, as 2f did for `specimen`). The provenance comment above `MEASURED_SECONDS` gains one clause in 2g-reading's form, naming both sets of runs.

**The lane check.** `node --test test/e2e/lane-timings.test.ts` with the new values. Today's committed figures give A 414.9 s (0.2466 of 1682.5 s), B 426.5 s (0.2535), C 391.1 s (0.2325), D 450.0 s (0.2675); the room under the 0.3 cap is A 128.4 s, B 111.8 s, C 161.9 s, D 78.2 s, against this plan's estimate of A +18.9 s, B +16.6 s, C +3.7 s, D nothing, which projects A 0.252, B 0.257, C 0.229, D 0.261 of about 1721.7 s. Every lane at or under 0.3: the four lanes stand, and the calls comment says so with the shares.

**If a lane passes 0.3 (the trigger of Alex's ruling 6102367152)**, the e2e lanes split into five in this pull request, as this table, precomputed so the lane decides nothing:

| lane | suites, in canonical order | committed seconds today |
|---|---|---|
| A | render, motion, turn, verso, zoom, zoom-gestures, glass-ceremony, cards, health, fallback, hunt, print-room | 363.0 |
| B | prospect, ribbon, landfall, broadside, reading-room, room-ink, room-voyage, room-voyage-route, runninghead, cluster | 283.5 |
| C | home, room-instrument, specimen, corners | 391.1 |
| D | survey, chart-drawer, document-rooms, region-detail | 380.6 |
| E | room-address, stage | 264.3 |

It keeps every rule `test/e2e/lanes.test.ts` holds (render leads the lane of every suite that inherits its page; health's lane keeps the whole prefix it certifies; each lane in canonical order; print-room straight after hunt, region-detail straight after document-rooms; no `OPENS_ON_HOME` suite straight after home). It is built only when every lane of it is at or under 0.24 of the total on this pull request's re-measured figures; otherwise the lane hands back with the figures and builds nothing. The change, as one commit:
- `e2e/support/lanes.ts`: `E2E_LANES` takes the table; lane E's `port` is `DEFAULT_E2E_PORT + 4` and its `dport` `DEFAULT_E2E_DPORT + 4`.
- `.github/workflows/ci.yml`: the `build-and-e2e` matrix becomes `lane: ["A", "B", "C", "D", "E"]`.
- `test/e2e/lane-timings.test.ts`: `BALANCE_CAP = 0.24`, its comment line becoming `// The slowest of five lanes at most 1.2 times an even split, which is what 0.6 meant at two (Alex, 2026-10-04, Issue #743; five lanes since Issue #779 comment 6102367152).`
- `.github/workflows/proof-runner.yml`: `max-parallel: 11`, since CI's jobs grow from seven to eight and `test/repo/proof-runner-workflow.test.ts` holds the cap, CI's jobs and the deploy build inside the 20-job limit.
- Not a file: `main`'s required checks gain "build & e2e lane E", which no test can see and the lane cannot set (`handbook/specs/site-architecture.md`, "A new LANE joins three more"); the lane's report names it for the dispatcher.

## Rosters, doctrine and the errata (step 15)

**The size list.** `test/site/atelier-kit.test.ts`, `test/site/house-style.test.ts` and `test/site/room.test.ts` each lose their one function over 50 (AK4's, HS5's, RT2's) and `test/site/table-address.test.ts` may fall under 400: whatever `--prune-suppressions` removes, `LIST_AT_REFORMAT` is lowered to match; nothing joins.

**`handbook/specs/site-architecture.md`, three edits.**
- In "How a page is authored", the rosters bullet's "`PAGES` in `test/site/astro-scaffold.test.ts`;" becomes "`PAGES` in `test/site/astro-scaffold.test.ts`, with `ROADS` and `STAGES` beside it for a page carrying a road out or the kit's stage, and RH32's browser copies of them in `e2e/suites/runninghead/room.ts` (`KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS`, `STAGED`);" (RH32 copies the rosters by hand, so a new road, chart room or kit stage joins them too; RH32 reds a page it does not expect).
- In "How a page is authored", the sentence ending "...and so are the lists that name a sheet for what it does rather than for being a sheet: `CHART_MOUNTS` in `test/site/shell-css-ground.test.ts` and `HOUSE_SHEETS` in `scripts/lint/sheet-owners.ts`, the sheets linked on every page, which `vellum/css-kit-not-redressed` does not read as a page's own." becomes "...and so is the list that names a sheet for what it does rather than for being a sheet: `HOUSE_SHEETS` in `scripts/lint/sheet-owners.ts`, the sheets linked on every page, which `vellum/css-kit-not-redressed` does not read as a page's own."
- Under ruling 1, once row AB1.c-local finds the four pages identical, in "The two contractual forms", the bullet's third and fourth sentences, from "**The guards name their pages by literal path, so the class is covered only indirectly**:" through "AND skips that roster reds nothing.", become: "**No guard reads the word itself**: the built-output assertion that each app page keeps its bundle-twin script tag rendered verbatim runs over `PAGES` in `test/site/astro-scaffold.test.ts`, which a new working page joins, and the word's own guard is Issue #600's." The first two sentences ("is contractual", the #204 analysis) and the last ("Copy a sibling page's script tag whole, and join the roster.") stay as written: the word is Issue #600's (6091335054 item 1).

**`handbook/specs/explorer-doctrine.md`, one edit** (call 20): in "The engine boundary and the host contract", the sentence "A page that skips either renders its overlays undressed." becomes "A page that skips the sheet renders its overlays undressed, and one that skips the class loses the ink-in dress of the chronicle's marks, the `.living-chart g.settlement[data-ink]` rules, the only rules in the sheet that key on it." **`public/living-chart.css` line 1** becomes `/* Living-chart engine overlay dressing, host-agnostic. Host contract: link /living-chart.css, or the overlays render undressed, and put class="living-chart" on the chart mount handed to the engine, which the ink-in rules below key on. */`.

**`public/house.css` line 1** becomes `/* The house style: the type roles, control idiom and shared slips, linked on every page before the page's own sheet, so this sheet owns the voice and a page keeps the last word on layout. */` (the clause citing `ruleOf` "pins the values" goes false when HS2 to HS5 leave; `ruleOf` itself stays for the kept status test).

**The errata**, each row searched first in `handbook/errata/` and the open issues, each one physical line in the file's form:
- `site.md`, the PR #858 row on the dead print `.stage { position: static }`: `public/explorer/index.css` joins its list of sheets, and its last clause names Issue #779 part 2h deleting ER6's pin.
- `site.md`, new row: on Appendix A's probe F4 reading `flex`, the Explorer's print `.stage { display: block }` is dead (Appendix A, E row 2).
- `site.md`, new row: `.actions a` and `.action-link` in `public/motion.css` dress classes no served element wears (Appendix A, E row 3).
- `guards.md`, new row, on row ER7.b-local's local run reading no red: the turn path's `room.layout()` is equivalent by construction, its pin deleted (Appendix A, E row 4).
- `site.md`, new rows: `.archivist-label` worn by no served element; `button.primary:hover` never deciding, with the sibling defect P2 measures; `a.control` worn by no served element; `.ages-range:focus-visible` never deciding, on P3's outcome (Appendix B, E rows 1 to 4; the `.ages-range` row once, it is also Appendix C's E row 2).
- `site.md`, the PR #861 row on transitions motion.css overrides gains the clause "Issue #779 part 2h deleted AK7's pin on the `.zoom-btn` transition" (Appendix B, E row 5).
- `site.md`, on Appendix C's probe F1 reading `none`: `#place-card[hidden] { display: none; }` joins the PR #861 `.warning[hidden]` row's class as a row of its own (Appendix C, E row 1).
- `guards.md`, the PR #714 row on `CHART_MOUNTS` and `QUALIFIED_CHART_RULES`: gains "(moved 2026-10-12, Issue #779 part 2h: both lists left with their tests; R17 reads the Explorer's mount and RR39 and RR43 the Reading Room's, and a new host that mounts the engine is read by no check until one is written for it, the same one-sided shape)".
- `guards.md`, the PR #714 row on sweeps reading the disk: its `test/site/room.test.ts` half leaves with RT2 (its `css-comment-form` half stands), so the row's first clause names that walk alone.
- `guards.md`, the PR #719 row on LC7's whole-file `setProperty` match: deleted as fixed (Z25 reads the nudge land; rows LC7.w and LC7.x rename both writes).
- `guards.md`, the PR #833 row on AK6: gains "(narrowed 2026-10-12, Issue #779 part 2h: SB15 presses the out press, so every press is read; AK6 stays for part 2i as `vellum/explorer-no-glass-keys`'s witness, its regex still unanchored)".
- `prose.md`, the PR #642 row on the shrink-to-fit prose: its test half leaves with LC6, so it names `public/living-chart.css` alone, at the line where that prose then stands; the PR #642 row on `ENGINE_RULES` is deleted, `ENGINE_RULES` having left with LC1.

**`.claude/skills/vellum-footguns/references/flake-record.md`**: a row for every flake the sends meet, before any re-send (Gate 2 item 10).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`, on the final head.
- Locally, one at a time, unmutated: `broadside`, `runninghead` (twice), `cards`, `glass-ceremony`, `zoom` (twice), `render`, `specimen`, `home`, `reading-room`, `room-instrument`, and step 4's lane-order runs.
- CI on the branch before the sends (step 5) and on the pull request's head.
- The runner ledgers by run id, each row with its expected and actual sets; `779-2h-unit-measured.json` for the unit halves and the HELD-DATA and HELD-RUN rows; `779-2h-local.md` for the local rows and green arms. Each lands in the PR body (Guards) as a table: claim, mutation, red set, run id or "local".
- `vellum-guard-prover`'s one round (step 16). `vellum-plate-reader` is not owed: no appearance changes. `vellum-pr-skeptic` runs cold by default (step 18).
- The e2e suites this pull request touches, by name: `broadside`, `runninghead`, `cards`, `glass-ceremony`, `zoom`, `render`, `specimen`, `home`, `reading-room`, `room-instrument`; read by its rows but untouched: `hunt`, `print-room`, `room-ink`, `turn`.

## Calls made (the implementer copies these into its step 12 comment)

1. **Ownership**: 46 tests, the recon ledger's population; owners by 2f call 9's rule and the frozen 2g design's call 1. The pill fade and screen-only are 2h's (`test/site/room.test.ts` is a kit-sheet file); their halves no browser can see stay for 2i.
2. **Two non-browser holders, each for a reason of its own**: AB1's built-page halves are held by `test/site/astro-scaffold.test.ts`'s built-page test (HELD-DATA), on the terms Alex ruled for the two pins before it (6091335054 item 1); RDW1's `worker-client.ts` half by the unit tests that run `runInline` in its own file (HELD-RUN), since it is code, not markup. Every BUILT claim of AK2 to AK5 and HS5 is held in the browser (RH32), by ruling 4 and the 2f and 2g plans' first line, after the plan skeptic's finding 1.
3. **"Through the kit" halves leave as AK1's retired class** (2f call 11).
4. **AK6 splits**: its press half is held by SB13 and SB15; its premise half stays as the 2i witness of `vellum/explorer-no-glass-keys` (2e's table), and the PR #833 row narrows.
5. **The plate's tip is read on home's shelf (H21)**, never on `#pp-plate` or `#rb-plate`: Issue #514 holds whether a full-sheet plate should tip (2g calls 10 and 14).
6. **ER7's `bindRoom` import pin stays for 2i** under ruling 3's class (each room imports the shared sheet-fitting code); what it binds is held by behaviour (row ER7.a-bind: BR12, BR14).
7. **Kept for 2i**: retire pins (ER6's 1100px absence; AK7's `zoom-keys` and home's retired presses), "declared once" (SC3's tokens; LC3, LC5, LC6, LC7), code shape (RT4's arm scoping and an id arm beside the class arm; LC7's translate and scale counts; RDW1's worker chain cache, visible to time alone; ER6's print block's place; ER7's two synchronous calls). Rule: 2e call 5, 2g-reading calls 4 and 5, the PR-lay precedent.
8. **Dead CSS loses its pin and gets an errata row** (2g-plates call 24): the Explorer's print `.stage` position (and, on F4, its `display: block`), `.archivist-label`, `button.primary:hover`, `a.control`, `.ages-range:focus-visible`, AK7's transition, and on F1 `#place-card[hidden]`.
9. **ER7's turn-path refit is equivalent by construction**, on row ER7.b-local's local run: a `guards.md` row, the pin deleted (2g-reading call 26's two equivalent `room.layout()` calls).
10. **A loop's claim is proven by instance** (the design's point 4).
11. **The naming rule** read for 2h's suites: new folders for `broadside`, `render` and `glass-ceremony`; existing folders take files by the rule's names (6098118329 ruling 2).
12. **The card's seats and dress run in `zoom`**, not `cards` (P28 and P31b would red unpredictably there): Appendix C, F17 and F19.
13. **The control idiom is read on the Explorer's `#type` and the house primary on the Specimen's `#sb-report`**, in runninghead's sweep: the Explorer's `#draw` wears the kit's gold (Appendix B, doubt 8).
14. **`cards.ts`'s and `zoom.ts`'s `run` are split by phase first** (overrides 1 and 2; 2g-reading split `reading-room`'s).
15. **Unit-only rows are proven locally** (step 8), and the `?`, LOCAL FIRST and CONDITIONAL rows are measured locally before the send (step 9): workflow step 11, a local proof stays valid.
16. **A HOLE with no widening its appendix gives keeps the claim for 2i** rather than an ad hoc widening (the disposition table).
17. **Two building lanes, the handover at the sends** (step 12): 2g-reading needed two lanes for fewer rows.
18. **The five-lane table is precomputed**, and its `BALANCE_CAP = 0.24` and `max-parallel: 11` are the dispatching session's derivations in 6102367152, not Alex's words.
19. **The appendices are archived inside the one plan file**, so the archive carries every row it was built from (2g's design tables lived only in a scratchpad).
20. **The doctrine's "renders its overlays undressed" is corrected in this pull request**, with the head comment of `public/living-chart.css` that says the same: measured, only the three ink-in rules at `public/living-chart.css` lines 229, 232 and 235 key on `.living-chart`, and R16 newly pins the class, so the measured-false sentence does not stay standing behind it (`CLAUDE.md`: a corrected fact edits the spec that owns it; the plan skeptic's finding 7).
21. **The house primary's hover**, if P2 measures it washing to parchment-bright under chart-paper lettering, is filed as an issue, searched first, on Issue #859's precedent, and not fixed here.
22. **Under ruling 1, the measurement goes to Issue #600** as a comment, searched first, once row AB1.c-local has run: the four pages' build-both-ways comparison, on 2g-plates' Issue #514 precedent for a measurement handed to the issue that asks.
23. **The cold `vellum-pr-skeptic` round is the default** (step 18): ruling 2 of 6133488428 decides any skip at build time, and this plan claims none in Alex's name.
24. **`MEASURED_SECONDS` on PR #835's rule**, the main runs named above, the branch's two runs from steps 5 and 15.
25. **The new dress checks read each part's ratified computed values** (Z22, Z26 above all, and BR12, RH27, RH28, G9), more than the "a rule exists for it" pins they replace: a later restyle edits them with the sheet, as PR38, RB12 and RR39 are edited (the plan skeptic's finding 11).
26. **The JSON rows are working copies** made at planning time and archived in the support folder `handbook/plans/779/779-part2h-support/`: the appendices are the record, a JSON row that disagrees with its appendix row is a hand-back (step 6), and the build reads the JSON so that no row is transcribed by hand (the plan skeptic's finding 9).

## Open decisions

None. Alex ruled this part's menu in 6133488428 (the **Rulings** line): the four-page `is:inline` pin is deleted once row AB1.c-local's build-both-ways comparison finds the four pages identical, and the cold review stays the default.

## Stop conditions (hand back rather than adapt)

- `git diff --stat 2b148100 origin/main` shows a change to a file this plan names under `src/`, `public/`, `e2e/`, `test/`, `test-support/` or `scripts/`, or to `eslint-suppressions.json`.
- Issue #779 has more comments than the planned-at count besides the comments the **Rulings** line names.
- A find not found exactly once at the branch head (the dry run's error, or NOT APPLIED).
- A holder check an appendix names is not where it says (its id, its function, its file).
- An existing suite this plan touches is red locally on the unmutated branch after one re-run, or a new check is red on CI's Linux twice.
- A function or file cannot be written under 50 or 400 code lines in the place this plan gives it.
- A CONDITIONAL probe returns an outcome its appendix does not list.
- Row AB1.c-local's build-and-compare finds the four built pages differ with `is:inline` dropped (ruling 1's premise fails: the question goes back to Alex before anything is deleted).
- A lane passes 0.3 and the five-lane table does not fit 0.24.
- The runner fails twice as a workflow (not as a row).
- A finding (the prover's or a measurement's) about the design rather than its build.
- Anything this plan leaves a builder to decide that is not a local name, the body of a function whose signature the plan gives, or a check's message wording.

## Found on the way (not 2h's)

- `test/prospect/plate-face.test.ts:15` reads the committed generated `src/prospect/letter/face-*.ts` byte for byte, a generated module the census's call 2 puts out of scope, named in no round: for 2i's sweep to confirm as data.
- `test/repo/e2e-read-types.test.ts` reads the e2e tree through the TypeScript program, a parser read ruling 9 counts as source and no round names; for 2i.
- `ChartDrawerDeps.folioHref`'s removal (6103395446 call 1) and the stylesheet block's literal in `test/repo/lint-wiring.test.ts` (6087865648 call 7) are calls still open to Alex on the issue, neither 2h's.

## Plan skeptic

`vellum-plan-skeptic` ran on the issue, this plan (body and appendices) and recon's ledger: two blocking findings, five should-fix and five nits; about 45 factual claims checked and every one of the 327 row edits found exactly once at `2b148100`; four claims wrong. Every finding is folded in; none is rejected.

1. (blocking) The BUILT claims of AK2 to AK5 and HS5 were held by `test/site/astro-scaffold.test.ts`'s built-page reads, which is ruling 4's untaken option B, against the 2f and 2g plans' first line. Folded: RH32 reads them in the browser (Appendix B); the design's point 1, call 2 and the rejected alternatives say so; AB1 keeps its built-page holder on 6091335054 item 1's own terms.
2. (blocking) The NEEDS READ line counted any stop inside a check's step as that check's read. Folded: a stop holds only when its stanza, read by a person, shows the check's own read of the broken code threw; a row whose named checks all printed `FAIL` is held by those reds.
3. RH29 could not see a painting rule scoped to a state the sweep never enters (the zoomed Glass, `body.stage-under`). Folded: RH29 also walks the served CSSOM for any such rule outside the screen block, with a row only that read catches, and names its blind spot (a sheet the page does not load).
4. The re-measure needed two branch CI runs before the pull request existed. Folded: step 15 dispatches the second run first.
5. Re-sends after the deletions would break the unit control. Folded: every re-send is e2e-only (step 13), and a check edited after the prover's round re-sends its rows that way (step 16).
6. Two builder choices were open (Appendix C F3, Appendix B P7). Folded: F3 raises the tries to all 26 places; P7 settles on `innerWidth` reading 1280.
7. A measured-false doctrine sentence stood behind R16's new pin. Folded: the sentence and `public/living-chart.css`'s head comment are corrected here (call 20).
8. The comment-count stop would fire on Alex's own ruling. Folded: the **Rulings** line names the rulings comments, and the stop counts only comments it does not name.
9. About 290 rows were to be copied by hand. Folded: the design agents wrote them as JSON, checked equal to the appendices, and step 6 splits that (call 26).
10. The no-skeptic instruction was on no issue comment. Superseded by ruling 2 of 6133488428: the cold review stays the default, and any skip is decided at build time (call 23).
11. Z22 and Z26 pin more than the claims they replace. Folded as a call (25).
12. Arithmetic drift (lane A +18.9 s, not +20.9; five-lane A 363.0; `zoom/camera.ts` near 330 lines). Folded.

Drawn after the round and not read cold by it: RH32 and its 26 rows with its hand-copied rosters, RH29's CSSOM walk and its row RT2.d, the `explorer-doctrine.md` and `public/living-chart.css` corrections, and the JSON rows (each checked by its design agent's own script against its appendix).

---

The appendices follow: **A**, the Explorer page (`test/site/broadside.test.ts`, `explorer-page`, `explorer-room`, `table-address`'s allowlists, `tip-affordance`'s marks, `region-detail-wiring`'s twin test, `app-bundles`'s `is:inline` test); **B**, the kit across the rooms and the house and motion sheets (`atelier-kit`, `room`, `house-style`, `shell-css`); **C**, the engine's sheet and the chart mounts (`living-chart-css`, `shell-css-ground`). Each was drawn read-only at `2b148100` by a design agent from the round's brief; its provisional check ids are replaced by the final ids above. Where an appendix and the body disagree, the body wins (the overrides). The brief, the recon ledger, the three JSON proof-row files and the first appendix's unit-measurement output (`779-2h-E-unit-out.txt`) are archived in the support folder `handbook/plans/779/779-part2h-support/`: they are provenance, and nothing in the build opens them except the three JSON files step 6 names. The design agents' counting and generating scripts and probes, which each appendix names as having produced its counts, are not archived: Alex ruled them deleted on 2026-10-13 (https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6142497257), since Issue #653's ruling D leaves `design/` the single place code may be tracked outside `src/`, so the appendices and the JSON files are the record. The build reads this plan, the repo, and those JSON files.


# Appendix A

## Issue #779 part 2h, area E (the Explorer page): the per-claim design table

Drawn read-only at `origin/main` `2b148100` from the brief `779-2h-design-brief.md`. Every `find` below was counted with node (`split(find).length - 1`) at `2b148100`, once in its file and once again in the working copy where the row applies it after its own earlier edits: 103 rows, every edit 1 and 1 (the counter and the canonical edit list were a script that section C was rendered from, not archived). Every unit `expect` was MEASURED on a scratch copy of `src/`, `public/`, `scripts/`, `test-support/`, `test/site/` and `package.json` (node `--test`, nothing under the repo written; a drive script that is not archived, whose output `779-2h-E-unit-out.txt` is in the support folder) for `broadside`, `explorer-room`, `explorer-page`, `table-address`, `atelier-kit`, `living-chart-css`, `house-style` (no red in any row), `app-bundles` (AB1 only) and `region-detail-wiring`, except where a row says "predicted": `tip-affordance` (its sheet roster needs git, so the copy could not load it; TF1's regex reds on both edits by reading) and `astro-scaffold` (it builds the site, which this agent may not run). Every e2e expected set is a prediction; a `?` marks a member the implementer measures locally before the send.

Provisional check ids are `BR<n>` (the planner assigns BR9 onward; `grep -rnE 'BR(9|1[0-9])' e2e` finds no such id anywhere in the tree today).

## Measured facts this table rests on

- **`is:inline` is inert on these tags today.** `transform` from `node_modules/@astrojs/compiler-rs` 0.3.1 (Astro 7.1.3), run in memory on `<script type="module" src="./app.bundle.js" is:inline>` and on the same tag without `is:inline`, returns byte-identical render code (`<script type="module" src="./app.bundle.js"></script>`) and an empty `scripts` list both times; only a tag with neither `type="module"` nor `is:inline` is hoisted (`$$renderScript`). So astro-scaffold's "each app page keeps its bundle-twin module script, rendered verbatim inside <main>" cannot see the word; it sees `type="module"` and the `src` (a probe run in memory, not archived).
- **Every Explorer chart has one aspect.** `defaultRecipe` fixes the grid at 320x240 (`src/world/generate.ts:60`), so every world sheet is 1500 by 1157.931, which is `FALLBACK_ASPECT` in `src/site/shared/room.ts`: a dropped refit never changes the sheet's size, only the legend's seat beside the folio text written just before it.
- **Seed 42's folio** (in memory, `generateWorld(defaultRecipe(42)).title`): "The Isle of Rahai", subtitle ending "in the year 1059 of the Cedar Age", so the Explorer writes "The Isle of Rahai · Chart № 42" and "surveyed in the year 1059 of the Cedar Age". `syncAutoSlider` writes no override, so the page's world is `defaultRecipe(42)`.
- **The seal's dress is scoped to `.broadside`** (`public/explorer/broadside.css` lines 90 to 131), so a seal label moved out of the slip loses its countersign (BR3 reads it).
- **`a.fn` is `display: inline-block` with no transition**; the wordmark link's hover tip (`body:has(.room-name) .wordmark a:hover` in `public/motion.css`) transitions over `--paper` (260ms); `header.chrome` is fixed at z-index 10 with its links `pointer-events: auto` (`public/shell.css`).
- **`waitReady` and `waitSettled` in `e2e/harness.ts` read `document.getElementById("status").textContent` unguarded**, and `evaluate` throws on a page exception, so a renamed `#status` stops a goto at that read.
- **FL6 does not hold the Explorer's sheet shadow.** `fl6Paper` (`e2e/suites/corners/floor.ts:375`) reads `#sheet`'s `boxShadow` on `/explorer/` in both media but asserts the shadow only for `/explorer/portfolio/` (line 392); for `/explorer/` it asserts the drawer tab alone (line 390). Deleting the Explorer's `box-shadow: var(--stage-shadow)` (or its print `box-shadow: none`) reds no check today.

## A. The tests

Aliases used in section C's unit lines (the exact names):

| alias | file | exact test name |
|---|---|---|
| BS1 | `test/site/broadside.test.ts` (24) | the Broadside groups exist in reading order: the seed row in the folio, then Land and Hand on the slip, then the Press as the legend row (#270, #463) |
| BS2 | same (35) | the seed row holds the seed, the dice and Draw, and nothing else (#462 ruling 8) |
| BS3 | same (46) | The Land holds every generation control and no dressing control (#270) |
| BS4 | same (56) | The Hand holds every dressing control and no generation control (#270) |
| BS5 | same (66) | The Press is the legend row: Turn the sheet, then the Print Room and the journal as gold roads (#462 ruling 4) |
| BS6 | same (88) | the overlay checkboxes wear the seal dressing with ids untouched (#270) |
| BS7 | same (108) | every footnote mark links a glossary anchor and carries a real note (#270) |
| BS8 | same (116) | every glossary anchor the marks point at exists on the glossary page (#270) |
| BS9 | same (124) | the glossary gained the drafting-table section for the control terms (#270) |
| EP1 | `test/site/explorer-page.test.ts` (8) | the one checkbox wears the ratified survey label (#317 decision 1) |
| ER1 | `test/site/explorer-room.test.ts` (27) | ER1 the Explorer is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead |
| ER2 | same (35) | ER2 the seed row is the folio's one control: seed, dice and Draw stand top right (#462 ruling 8) |
| ER3 | same (45) | ER3 the Broadside is the slip: The Land and The Hand ride it, the Press does not |
| ER4 | same (57) | ER4 the rest of the Press is the legend row: Turn the sheet, then the two gold roads (#462 ruling 4) |
| ER5 | same (75) | ER5 the sheet stays the Glass's gesture box, so a bookmark's cx/cy stay sheet fractions; the Glass stands at the chart's corner outside it |
| ER6 | same (101) | ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10) |
| ER7 | same (126) | ER7 app.ts fits the room after the chart lands on BOTH draw paths and writes the folio's lines |
| TA1 | `test/site/table-address.test.ts` (325) | the allowlists mirror the Explorer's own selects, or a link the Explorer can write cannot be filed |
| TF1 | `test/site/tip-affordance.test.ts` (38) | the footnote marks go to the glossary, so they tip, at the wordmark's numbers (#270 ruling 7) |
| RDW1 | `test/site/region-detail-wiring.test.ts` (117) | the worker and its inline twin build the same region spec, so the two cannot drift apart |
| BAND1, BAND2, BAND3 | same | band 1: the Explorer's region job draws the chained field and stamps detail 1 (and 2, 3) |
| HELD | same | the region job actually builds in the HELD cache, which no byte comparison can see |
| STAMP | same | the stamp follows the WINDOW, not the band index the job happened to carry |
| AB1 | `test/site/app-bundles.test.ts` (19) | all four app pages load their bundled app twin via is:inline, none load raw source (#208, #254) |
| TWIN | `test/site/astro-scaffold.test.ts` | each app page keeps its bundle-twin module script, rendered verbatim inside <main> |
| LINKS | same | every internal link and embed on the rendered pages resolves |
| AK3 | `test/site/atelier-kit.test.ts` | AK3 every chart room stands the Glass and the chart folio from the kit; the Explorer alone names its cluster for glass.ts |
| AK5 | same | AK5 the stage is lifted where the skeleton is one shape (the Print Room, the Prospect, the Ribbon); the three unique skeletons stay in their pages |
| LC | `test/site/living-chart-css.test.ts` | the Explorer host wires the contract: mount class + sheet link (#302) |

Dispositions (BR9 to BR14 are the new checks of section B; "row" names section C's row):

| claim | what it asserts | disposition | rows |
|---|---|---|---|
| BS1.a | the seed group exists (`aria-label="The seed"`) | HELD by BR1 (`e2e/suites/broadside.ts:64`, want map) and NEW BR9 | BS1.a |
| BS1.b | The Land follows the seed row | NEW BR9 (the groups in document order) | BS1.b |
| BS1.c | The Hand follows The Land | NEW BR9 | BS1.c |
| BS1.d | The Press follows The Hand | NEW BR9 | BS1.d |
| **BS1 fate** | leaves whole | | |
| BS2.a | the row holds #seed, #random, #draw | HELD by BR1 | M2, M1, M3 |
| BS2.b | no Land, Hand or Press id in the row (13 ids, one assertion) | HELD by BR1 (one instance per foreign group, F9) | M4, M10, M15 |
| BS2.c | `<button id="draw" class="primary">` (Draw the primary, nothing else on the tag) | NEW BR9 (the row's children as tag#id.class with their type) | BS2.c |
| **BS2 fate** | leaves whole | | |
| BS3.a | The Land holds #type, #band, #land, #coast | HELD by BR1 (BR1b too for the two tracks) | M4, M5, M6, M7 |
| BS3.b | no seed, Hand or Press id in The Land | HELD by BR1 | M2, M8, M16 |
| **BS3 fate** | leaves whole | | |
| BS4.a | The Hand holds #style, #theme, #legend, #arms, #beasts, #ages | HELD by BR1 for five; #beasts NEW BR9 (BR1's want map has no beasts, 2e's finding) | M8, M9, M10, M11, M12, M13 |
| BS4.b | no seed, Land or Press id in The Hand | HELD by BR1 | M3, M7, M14 |
| **BS4 fate** | leaves whole | | |
| BS5.a | the Press holds #verso-turn, #order-plates, #journal-link | HELD by BR1 (BR2 too for the two roads) | M14, M15, M16 |
| BS5.b | no seed, Land or Hand id in the Press | HELD by BR1; the Hand instance by BR9 (#beasts) | M1, M5, M12 |
| BS5.c | `<button id="verso-turn" class="legend-btn" type="button">` | NEW BR9 | ER4.a |
| BS5.d, BS5.e | the Print Room and journal roads are gold LegendButtons | HELD by BR2 (`e2e/suites/broadside.ts:131`, the two roads' className equal) and BR9 | ER4.b-gold, ER4.c-gold |
| **BS5 fate** | leaves whole | | |
| BS6.a | each seal label wears `seal` | NEW BR9 (the four seals as [class, word, input id, type]) | BS6.a |
| BS6.b | each label's word (legend, arms, beasts, survey) | NEW BR9 | BS6.b, EP1.a |
| BS6.c | each input is a checkbox | NEW BR9 (BR3 reads #ages's alone) | BS6.c |
| BS6.d | the ids untouched | HELD by BR1 and BR9 (renamed on both sides) | BS6.d |
| BS6.e | the label wraps its real checkbox | NEW BR9 | BS6.e |
| **BS6 fate** | leaves whole | | |
| BS7.a | each of the four anchors is linked (`href="/glossary/#<anchor>"` somewhere: the mark or its note) | NEW BR9 (the marks' hrefs and the notes' links, exactly) | BS7.a |
| BS7.b | each note's head text | NEW BR9 | BS7.b |
| BS7.c | no mark carries a title | NEW BR9 | BS7.c |
| **BS7 fate** | leaves whole | | |
| BS8.a | at least four glossary links (the loop's floor) | NEW BR9 (with BR6, whose hasLink reads the survey note's link) | BS8.a |
| BS8.b | every anchor the page links exists on the glossary | HELD by BR7 for the four ids (`e2e/suites/broadside.ts:280`); the derived set (a new mark) NEW BR9, which pins the marks to exactly four | BS8.b1, BS8.b2 |
| **BS8 fate** | leaves whole | | |
| BS9.a | "At the drafting table" | HELD by BR7 (`br7.head`) | BS9.a |
| BS9.b | the Survey, Coast warp and Seed's choice entries | NEW BR10 (BR7 reads ids, IX12 reads no drafting term: `OWED` in `e2e/suites/document-rooms/sheets.ts` names none, and a renamed term stays sorted) | BS9.b1, BS9.b2, BS9.b3 |
| **BS9 fate** | leaves whole | | |
| EP1.a | the ages box's label is "survey" | NEW BR9 | EP1.a |
| **EP1 fate** | leaves whole; the file is then empty and goes | | |
| ER1.a | chartRoom on the layout | HELD by RH2, RH3, RH17 (`e2e/suites/runninghead/heads.ts:83`, `:102`, `e2e/suites/runninghead/shell.ts:127`) | ER1.a |
| ER1.b | the RoomFolio stands the room's name | NEW BR9 (one h1, the corner's, "The Explorer") | ER1.b |
| ER1.c | the RoomFolio stands the tagline | NEW BR9 (2e measured runninghead ALL PASS on the tagline dropped) | ER1.c |
| ER1.d | no RoomHead | NEW BR9 (a planted second h1; e2e only, the unit pin stays green: the 2g precedent of PPR1.c and RBR1.4) | ER1.d |
| **ER1 fate** | leaves whole | | |
| ER2.a | seed, dice and Draw stand in the folio corner | HELD by BR1 for each control moved out; the group moved whole (BR1 green) NEW BR9 | M1, M2, M3, ER2.a |
| ER2.b | Draw is the primary | NEW BR9 | BS2.c |
| ER2.c | no seed and no Draw on the slip | HELD by BR1 | M2, M3 |
| **ER2 fate** | leaves whole | | |
| ER3.a | the slip is `#broadside` | NEW BR9 (held by its FAIL; BR1c's stop is in its own judgement of its read of `#broadside`, so it also counts under 6090198881, see the row) | ER3.a |
| ER3.b | The Land and The Hand ride the slip | NEW BR9 (BR3 and BR6 red too) | ER3.b |
| ER3.c | no Press road on the slip | HELD by BR1 | M14, M16 |
| **ER3 fate** | leaves whole | | |
| ER4.a | Turn the sheet is a legend button | NEW BR9 (its membership HELD by BR1, M14) | ER4.a |
| ER4.b | the Print Room road: gold, `../print-room/`, "Take to", "The Print Room" | gold HELD by BR2; the authored href, the verb and the room NEW BR9 (scripts off: the script rewrites the href) | ER4.b-gold, ER4.b-href, ER4.b-verb, ER4.b-room |
| ER4.c | the Reading Room road: gold, `/reading-room/`, "Read the journal in", "The Reading Room" | as ER4.b | ER4.c-gold, ER4.c-href, ER4.c-verb, ER4.c-room |
| ER4.d | Turn the sheet leads the row | NEW BR9 | ER4.d |
| ER4.e | no `action-link` anywhere | NEW BR9 (a planted one counted, as PR36's retired furniture) | ER4.e |
| ER4.f | the Press's head is `p.legend-head#grp-press` | NEW BR9 (BR1 reads its text alone) | ER4.f |
| **ER4 fate** | leaves whole | | |
| ER5.a | `.stage > #sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map.living-chart`, #verso aria-hidden beside the gesture box, both empty as authored | NEW BR9 (scripts off) | ER5.a1 to ER5.a7 |
| ER5.b | the Glass is not inside the gesture box | NEW BR9 | ER5.b |
| ER5.c | the Glass is the kit's cluster with id `zoom-controls` | NEW BR9 | ER5.c |
| ER5.d | `p.status#status[role=status][aria-live=polite]`, empty | NEW BR9 (the id included: row ER5.d1's two stops are in BR1's and BR12's navigation settle, which do not count, so BR9 alone holds it) | ER5.d1 to ER5.d5 |
| ER5.e | folio line one is `[folio-title, folio-title]` | NEW BR9 | ER5.e |
| ER5.f | folio line three is `[folio-coords, caption]` | NEW BR9 | ER5.f |
| **ER5 fate** | leaves whole | | |
| ER6.a | the stage pads by the room's reserves | NEW BR12 | ER6.a |
| ER6.b | no `max-width: 1100px` | 2I class (b) | - |
| ER6.c | `#map-viewport.zoomable` touch-action none | NEW BR12 (Z7 and Z11 in `zoom` also red; unsent) | ER6.c |
| ER6.d | `#map` pivots top left | NEW BR12 (Z1 also reads it; unsent) | ER6.d |
| ER6.e | `#map svg[data-vellum-style]` height 100% | NEW BR12 | ER6.e |
| ER6.f | `#sheet` at `--stage-shadow` | NEW BR12 (FL6 does not red, see the measured facts) | ER6.f |
| ER6.g | the sheet ends with its print block | 2I class (e) (PRR7's and RBR7's precedent; the greedy regex passes a moved block, only a trailing non-rule reds it) | - |
| ER6.h | print `.stage { position: static }` | DEAD: the kit's print `body.chart-room .stage` (0,2,1) decides it; section E row 1 | - |
| ER6.i | print `#map { transform: none !important }` | NEW BR14 | ER6.i |
| **ER6 fate** | shrinks to ER6.b and ER6.g (section D) | | |
| ER7.a | app.ts imports `bindRoom` | 2I class (a); what it binds held by behaviour, NEW BR12 and BR14 (bindRoom stubbed) | ER7.a-bind |
| ER7.b | the turn path refits once the leaf lands | DEAD, equivalent by construction (a style turn re-dresses the same world under the same folio, at the one aspect): section E row 4, CONDITIONAL on the LOCAL row | ER7.b-local |
| ER7.c | the settle path refits once #map holds the chart | NEW BR12 (the legend's reseat; BR1c too), CONDITIONAL (F2) | ER7.c |
| ER7.d | the settle refit follows `lc.buildPlaceOverlay` | 2I class (d) (two synchronous calls in one task; the overlay changes nothing the fit measures) | - |
| ER7.e | app.ts writes folioTitle and folioSub | NEW BR12 (the two lines from the page's own inline draw) | ER7.e1, ER7.e2 |
| **ER7 fate** | shrinks to ER7.a and ER7.d (section D) | | |
| TA1.a | every non-empty option of #style, #type, #band, #theme parses as a table item | NEW BR11 (the served options, parsed in Node by the real `parseTableValue`) | TA1.a to TA1.d |
| **TA1 fate** | leaves whole (the file's other tests stay) | | |
| TF1.a | `a.fn:hover` tips at rotate(-0.6deg) | NEW BR13 (a real hover on the mark against a real hover on the wordmark) | TF1.a |
| TF1.b | ... and raises by `translateY(var(--raise))` | NEW BR13 | TF1.b |
| **TF1 fate** | leaves whole (the file's roster and sheet tests stay) | | |
| RDW1.a | worker.ts `detail: true` | HELD by R14 (`e2e/suites/render.ts:344`) | RDW1.a |
| RDW1.b | worker.ts `regionDetailLevel(` | HELD by R14 | RDW1.b |
| RDW1.c | worker.ts `chainCache: regionChainCache` | 2I class (e): the cache is transparent to every byte (the file's own comment says so), so no browser read sees it, only time | - |
| RDW1.d | worker-client.ts `detail: true` | HELD-RUN by BAND1 to BAND3, HELD, STAMP | RDW1.d |
| RDW1.e | worker-client.ts `regionDetailLevel(` | HELD-RUN by BAND1 to BAND3, STAMP | RDW1.e |
| RDW1.f | worker-client.ts `chainCache: regionChainCache` | HELD-RUN by HELD | RDW1.f |
| **RDW1 fate** | shrinks to RDW1.c (section D) | | |
| AB1.a | each of the four pages loads its twin as `<script type="module" src="(./)app.bundle.js">` | HELD-DATA by TWIN (the built tag verbatim) | AB1.a1 to AB1.a4 |
| AB1.b | none loads `(./)app.js` | HELD-DATA by TWIN (its `doesNotMatch`) and LINKS | AB1.b1 to AB1.b4 |
| AB1.c | the tag carries `is:inline` | deleted on 6091335054 item 1's terms (no reader: the word changes no built byte, measured above); Issue #600 decides the word | AB1.c-local (evidence) |
| **AB1 fate** | leaves whole | | |

## B. The new checks

All six are in the `broadside` suite (lane B), each its own `step(...)` named by its id, in a new folder `e2e/suites/broadside/` by the naming rule. Each fails rather than throws where its premise is a press or a hover (it waits about a second and reads what stands), reads an absent element as a sentinel (`null`), keeps every function under 50 code lines, and types every payload `Payload<T>` (`test/repo/e2e-read-types.test.ts`). Scripts go off only through `withScriptsOff`.

**Files.** `e2e/suites/broadside/kit.ts` (new): `broadsideKit` and `type BroadsideKit` moved verbatim out of `e2e/suites/broadside.ts` (lines 8 and 31 to 57; `Box` and `Room` stay with BR1c), about 35 lines. `room.ts` (new): BR9, BR10, BR11, about 230 lines. `dress.ts` (new): BR12, about 95 lines. `gestures.ts` (new): BR13, BR14, about 100 lines. `e2e/suites/broadside.ts` falls from 302 to about 285 lines; `run` grows from 19 to about 25 code lines. `e2e/suites/corners/floor.ts` is not touched. Shared helpers come from where 2g exported them: `clearMetrics` (`e2e/suites/print-room/kit.ts`), `LENS`, `lensRest`, `homeCamera` (`e2e/suites/print-room/print.ts`), `LEGEND_RESEAT`, `reseatKept` (`e2e/suites/print-room/proof.ts`, as `e2e/suites/ribbon/dress.ts` imports them), `SHADE` and `PAGE_RGBA` (`e2e/support/pixel.ts`), `parseTableValue` (`src/site/shared/table-address.ts`, as `e2e/suites/prospect/room.ts` imports it).

**`run` after the change** (new steps marked +):

```
await step("BR1 to BR1c", ...)                     // unchanged
+ await step("BR12", () => e4Dress(k))    // dress.ts
+ await step("BR11", () => e3Allowlist(k)) // room.ts, on BR12's page
await step("BR2", ...)
await br3Seal(k); await br4Notes(k); await br5Hover(k);
+ await step("BR13", () => e5Tip(k))      // gestures.ts
+ await step("BR14", () => e6Paper(k))    // gestures.ts
await br6Tap(k);
await step("BR7", ...)
+ await step("BR10", () => e2Terms(k))    // room.ts, on BR7's glossary page
+ await step("BR9", () => e1Authored(k)) // room.ts, scripts off
br8Clean(ctx, errBase, httpBase);
```

### BR9, the Explorer as authored (scripts off), `room.ts`

- **Place:** last step before `br8Clean`, after BR10.
- **Setup:** `withScriptsOff(send, ...)`: `Page.navigate` to `about:blank`, then to `http://127.0.0.1:${PORT}/explorer/`; a `makeSettle` (its `evaluate` wrapped `.catch(() => null)`, RR38's shape) on `{ ready: document.readyState, w: width of ".stage noscript .status" }` until `ready === "complete" && w > 0` (label "explorer-scripts-off"): the notice having width is the witness that scripts are off. Then five reads, returned out of the body.
- **finally:** `Page.navigate` to `about:blank` (`withScriptsOff` restores scripts itself).
- **Reads and wants** (text = `textContent` collapsed with `/\\s+/g` and trimmed, the backslash doubled in the template literal):
  - CORNER: `h1s` = every `h1` as `(in .corner.tr.folio-room ? "corner " : "") + className + ": " + text` = `["corner room-name: The Explorer"]`; `tagline` = text of `.corner.tr.folio-room > .room-tagline` = "every seed is a world, draw one"; `group` = `.corner.tr.folio-room > .folio-controls` as `[role, aria-label]` = `["group", "The seed"]`; `kids` = its children as `[tagName#id.classes, type attribute]` = `[["INPUT#seed.control","number"],["BUTTON#random.dice","button"],["BUTTON#draw.primary",null]]`.
  - GROUPS: every `[role="group"]` in document order as its `aria-label` or else its `aria-labelledby` = `["The seed","grp-land","grp-hand","grp-press","Camera"]`.
  - SLIP: `aside.slip`'s id = "broadside"; `#broadside .slip-body > .broadside > .panel[role=group]` as `aria-labelledby` = `["grp-land","grp-hand"]`; per panel the ids of its `input, select, button` in order: grp-land `["type","band","land","coast"]`, grp-hand `["style","theme","legend","arms","beasts","ages"]`; `.seals > label` as `[className, first text node trimmed, inner input's id or null, its type or null]` = `[["check seal","legend","legend","checkbox"],["check seal","arms","arms","checkbox"],["check seal","beasts","beasts","checkbox"],["check seal","survey","ages","checkbox"]]`; every `a.fn` as `[href attribute, data-note, title attribute]` = `[["/glossary/#seeds-choice","note-seeds-choice",null],["/glossary/#coast-warp","note-coast-warp",null],["/glossary/#survey","note-survey",null],["/glossary/#verso","note-verso",null]]`; every `.fn-note` as `[id, text of .fn-head, its a's href or null]` = `[["note-seeds-choice","of the seed's choice","/glossary/#seeds-choice"],["note-coast-warp","of the coast warp","/glossary/#coast-warp"],["note-survey","of the survey","/glossary/#survey"],["note-verso","of the verso","/glossary/#verso"]]`.
  - LEGEND: `nav.legend > #grp-press` as `tagName.className` = "P.legend-head"; `nav.legend > .legend-row` as `[role, aria-labelledby]` = `["group","grp-press"]`; its children as `tagName#id.classes` = `["BUTTON#verso-turn.legend-btn","A.fn","A#order-plates.legend-btn.gold","A#journal-link.legend-btn.gold"]`; `#verso-turn`'s type = "button"; `#order-plates`, `#journal-link` as `[href attribute, text of .verb, text of .room]` = `[["../print-room/","Take to","The Print Room"],["/reading-room/","Read the journal in","The Reading Room"]]`; `.action-link` count = 0.
  - STAGE: `!!document.querySelector(".stage > #sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map.living-chart")` = true; `#map` childElementCount = 0; `#verso` as `[parent id, previous sibling id, aria-hidden, childElementCount]` = `["sheet-inner","map-viewport","true",0]`; `#zoom-controls` as `[className, role, inside #map-viewport, its buttons as [id, data-zoom]]` = `["chrome corner br zoomery","group",false,[["zoom-in","in"],["zoom-out","out"],["zoom-reset","fit"]]]`; `#status` as `[tagName.className, role, aria-live, text, parent is .stage]` = `["P.status","status","polite","",true]`; `.corner.bl.folio > p` as `[className, id, text]` = `[["folio-title","folio-title",""],["folio-sub","folio-sub",""],["folio-coords","caption",""]]`.
- **One check**, its faults listed by part (PR36's `faults` shape): "BR9 the Explorer as authored: the folio's one h1 and tagline with the seed row its one control group (the seed, the dice, Draw the primary), the groups in reading order, the Broadside slip carrying The Land and The Hand with their controls and four seals, four footnote marks and their notes going to the glossary with no title, the Press as the legend row (Turn the sheet first, then the two gold roads at their authored hrefs, verbs and rooms) with no retired action link, the stage's leaf holding the empty gesture box and the hidden verso, the Glass outside it, the status pill a live status, and the chart folio's three empty lines".
- **Size, cost:** about 150 code lines (four payloads, four fault functions, the check); about 1.5 s on CI (a scripts-off load draws nothing).
- **Holds:** BS1.a to d, BS2.a to c, BS3, BS4 (with #beasts), BS5.a to e, BS6.a to e, BS7.a to c, BS8.a, BS8.b's derived set, EP1.a, ER1.b to d, ER2.a to c, ER3.a to c, ER4.a to f, ER5.a to f.

### BR10, the glossary's drafting-table terms, `room.ts`

- **Place:** right after step "BR7", on the `/glossary/` page BR7's `gotoPlain` left; no navigation.
- **Read:** `h = #drafting-table`; `next` = the first `h2` after it; for `["coast-warp","seeds-choice","survey"]` each `[text, tagName.className, after h and before next]` (absent: null) = `[["Coast warp","P.term",true],["Seed's choice","P.term",true],["Survey","P.term",true]]`.
- **Check:** "BR10 the Glossary's drafting-table section names the Explorer's control terms: Coast warp, Seed's choice and Survey, each a term entry under that heading". No finally (read only).
- **Size, cost:** about 25 lines; 0.1 s. **Holds:** BS9.b.

### BR11, every option the Explorer's selects offer is one the Chart Table files, `room.ts`

- **Place:** right after BR12, on BR12's freshly booted page (scripts on; nothing rewrites the options).
- **Read:** `["style","type","band","theme"].map((id) => [id, select ? its non-empty option values : null])`.
- **Node:** for each select, the list is non-null and non-empty, and every value `v` gives `parseTableValue(sample).length === 1`, with TA1's own samples: style `k-s.seed-42.style-${v}.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1`, type `k-s.seed-42.type-${v}.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1`, band and theme the same shape as type (`parseTable` of `#...&table=` reduces to `parseTableValue` for these characters, so the samples need no fixture import). The detail lists every refused `[id, value]`.
- **Check:** "BR11 every value the Explorer's style, type, climate and theme pickers offer is one the Chart Table's grammar files, so no link the Explorer writes is dropped on arrival". No finally.
- **Size, cost:** about 35 lines; 0.1 s. **Holds:** TA1.a.

### BR12, the Explorer at rest as dressed, `dress.ts`

- **Place:** right after step "BR1 to BR1c".
- **Setup:** `clearMetrics(ctx, 1280, 800)` (BR1c's last override was 1280x800 and its clear is not waited); then `k.goto(k.EXP + "#seed=42&style=antique", "broadside-dress")` (about:blank, the page, `waitReady`, `waitSettled`): a fresh boot, because BR1c's three resizes each re-run the room's layout and would heal a seat taken before the folio write; the mouse parked at (1, 1).
- **Settle:** `makeSettle` on DRESS until `!moving && last !== null && same legend rect` (RB12's shape, label "broadside-dress-still").
- **Reads and wants:** the stage's computed `padding` `[t, r, b, l]` against its inline `--reserve-top`, `--reserve-right`, `--reserve-bottom` (each > 0, each within 0.5px of its padding, `l` 0); `#sheet`'s `boxShadow` equal to a probe's (a `div` with `style.boxShadow = "var(--stage-shadow)"` appended to body, read, removed) and `SHADE` of it non-null; `#map-viewport` has `.zoomable` and `touchAction` "none"; `#map`'s `transformOrigin` "0px 0px"; `#map svg[data-vellum-style]`'s rect within 0.5px of `#map`'s on left, top, width and height (absent: fault); `[#folio-title, #folio-sub]` text equal to `[r.title + " · Chart № 42", y ? "surveyed " + y[0] : r.subtitle]` where `r = window.__vellumRunInline({ kind: "draw", seed: 42, overrides: {}, render: { style: "antique", widthPx: 1500, legend: true } })` and `y = /in the year .+$/.exec(r.subtitle)` (no backslash in that literal); the non-empty `.corner.bl.folio > p` text rects (a Range each, at least two) meet no part of `.legend`'s rect; then `evaluate(LEGEND_RESEAT)` and `reseatKept`.
- **Check:** "BR12 the Explorer at rest as dressed: the stage reserving the chrome as its padding, the sheet at the stage depth (the token's), the gesture box zoomable with touch-action none, the transform target pivoting top left, the chart filling its fitted box, the folio's title and survey lines written from the drawn world, and the legend seated clear of the written folio where a fresh refit leaves it".
- **finally:** none owed (nothing emulated; the reseat's own refit puts the legend back; the parked mouse rests where BR2 expects nothing).
- **Size, cost:** about 95 lines; about 4 s on CI (a boot and worker draw about 2.5 s, the inline draw for the expected folio about 1 s, the settle about 0.5 s).
- **Holds:** ER6.a, c, d, e, f; ER7.c; ER7.e; ER7.a's binding (with BR14).

### BR13, a footnote mark tips at the wordmark's numbers, `gestures.ts`

- **Place:** right after `br5Hover` (BR5 leaves the mouse at (4, 4)).
- **Reads:** AT(sel): the element's rect centre and `reach` (the element at that point is the element or inside it; absent: null); TIP(sel): `{ t: computed transform, hover: matches(":hover"), moving: some getAnimations() entry not finished }`.
- **Gesture:** a real `Input.dispatchMouseEvent` `mouseMoved` to the centre of `a.fn[data-note="note-coast-warp"]`, then TIP polled every 50ms up to about 1 s until two equal reads with `hover` and `!moving` (the mark has no transition), taken as it stands at the end; then `mouseMoved` to the centre of `header.chrome .wordmark a`, TIP polled up to about 1.5 s the same way (its `--paper` 260ms transition), taken as it stands.
- **Check:** both reached, both hovered, the mark's transform not "none", and its `matrix(a, b, c, d, e, f)` equal to the wordmark's within 1e-3 on every component: "BR13 a footnote mark goes to the glossary, so under a real hover it tips at the wordmark's own numbers (#270 ruling 7)".
- **finally:** `mouseMoved` to (1, 1).
- **Size, cost:** about 55 lines; about 1 s. **Holds:** TF1.a, TF1.b.

### BR14, a leaned camera still prints the chart unzoomed, `gestures.ts`

- **Place:** right after BR13, before `br6Tap`.
- **Setup:** `window.__vellumSetRedraftEnabled(false)` (a lean past band 0 would draft a region inset on its settle); `Emulation.setEmulatedMedia { features: [] }` (a leaked reduced motion makes the lean's read meaningless).
- **Gesture and reads:** CENTRE = `#map-viewport`'s rect centre and `inside` (the viewport contains the element at that point); a real `wheel(c.x, c.y, -480)` (PR21f's); `screen = lensRest(ctx, "leaned", "explorer-leaned")`; `Emulation.setEmulatedMedia { media: "print" }`; `paper = evaluate(LENS)`.
- **Check:** `c.inside && screen.zoomed && screen.k > 1 && paper.t === "none"`, the screen read the same-run control: "BR14 a leaned camera still prints the chart unzoomed: a real wheel leans the Glass on the chart, and on paper the transform target stands untransformed".
- **finally:** `setEmulatedMedia { media: "" }`, `homeCamera(ctx)` (never throws), `window.__vellumSetRedraftEnabled(true)`.
- **Size, cost:** about 40 lines; about 2 s. **Holds:** ER6.i; ER7.a's binding (with BR12).

**Cost:** about 9.5 s on CI in all, so `broadside` goes from 8.4 to about 18 s and lane B from 426.5 to about 436 of its measured seconds, inside the 112 s of room under `BALANCE_CAP`. The proofs: 87 `broadside` jobs, 2 `render`, 1 `runninghead`, 11 unit-only (3 run, 8 built-page), 2 local.

## C. The rows

103 rows: 90 for the runner with an e2e block (88 with a unit block, ER1.d and ER7.a-bind e2e only), 11 unit only (RDW1.d to f HELD-RUN, AB1.a and b HELD-DATA), 2 LOCAL. `BR9` to `BR14` in the expect sets are `BR9` to `BR14`. A `?` marks a member to measure locally first. Moves are named M1 to M16: "neutral" means just after `</RoomFolio>` (no group), "Land end" and "Hand end" mean the panel's last child outside `.ledger` (so the ledger's pinned columns never shift), and a move into the Press lands inside a `display: none` span so the legend row's layout is untouched.

#### BS1.a
- claims: BS1.a (and BS2's block start)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"aria-label=\"The seed\">","replace":"aria-label=\"The seed row\">"}]
```

- unit: test/site/broadside.test.ts: {BS1, BS2}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: BR1's want map reads the label for seed, random and draw

#### BS1.b
- claims: BS1.b
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<RoomFolio room={room} tagline={tagline}>\n  <div class=\"folio-controls\" role=\"group\" aria-label=\"The seed\">\n    <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">\n    <button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button>\n    <button id=\"draw\" class=\"primary\">Draw</button>\n  </div>\n  <p class=\"gloss\">every chart is reproducible from the number in its margin</p>\n</RoomFolio>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"</Slip>\n","replace":"</Slip>\n<RoomFolio room={room} tagline={tagline}>\n  <div class=\"folio-controls\" role=\"group\" aria-label=\"The seed\">\n    <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">\n    <button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button>\n    <button id=\"draw\" class=\"primary\">Draw</button>\n  </div>\n  <p class=\"gloss\">every chart is reproducible from the number in its margin</p>\n</RoomFolio>\n"}]
```

- unit: test/site/broadside.test.ts: {BS1}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: RoomFolio moved whole after the Slip; BR1 green (groups intact)

#### BS1.c
- claims: BS1.c
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-land\">\n      <p class=\"panel-head archivist-head\" id=\"grp-land\">The Land</p>\n      <p class=\"panel-gloss\">these shape the world itself</p>\n      <div class=\"ledger\">\n        <span class=\"l-label\"><label for=\"type\">type</label><a class=\"fn\" href=\"/glossary/#seeds-choice\" data-note=\"note-seeds-choice\" aria-describedby=\"note-seeds-choice\" aria-label=\"note on the seed's choice\">&dagger;</a></span>\n        <span class=\"l-ctl\"><select id=\"type\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"island\">island</option>\n          <option value=\"archipelago\">archipelago</option>\n          <option value=\"continent\">continent</option>\n          <option value=\"citystate\">city-state</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"band\">climate</label></span>\n        <span class=\"l-ctl\"><select id=\"band\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"temperate\">temperate</option>\n          <option value=\"tropical\">tropical</option>\n          <option value=\"polar\">polar</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"land\">sea level</label></span>\n        <span class=\"land-end land-end-min\">more sea</span>\n        <input id=\"land\" type=\"range\" min=\"100\" max=\"700\" step=\"2\">\n        <span class=\"land-end land-end-max\">more land</span>\n        <span id=\"land-readout\" class=\"land-readout\"></span>\n        <span class=\"l-label\"><label for=\"coast\">coast</label><a class=\"fn\" href=\"/glossary/#coast-warp\" data-note=\"note-coast-warp\" aria-describedby=\"note-coast-warp\" aria-label=\"note on the coast warp\">&Dagger;</a></span>\n        <span class=\"land-end land-end-min\">calm</span>\n        <input id=\"coast\" type=\"range\" min=\"0\" max=\"100\" step=\"5\">\n        <span class=\"land-end land-end-max\">lobed</span>\n        <span id=\"coast-readout\" class=\"land-readout\"></span>\n      </div>\n    </div>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">","replace":"    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-land\">\n      <p class=\"panel-head archivist-head\" id=\"grp-land\">The Land</p>\n      <p class=\"panel-gloss\">these shape the world itself</p>\n      <div class=\"ledger\">\n        <span class=\"l-label\"><label for=\"type\">type</label><a class=\"fn\" href=\"/glossary/#seeds-choice\" data-note=\"note-seeds-choice\" aria-describedby=\"note-seeds-choice\" aria-label=\"note on the seed's choice\">&dagger;</a></span>\n        <span class=\"l-ctl\"><select id=\"type\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"island\">island</option>\n          <option value=\"archipelago\">archipelago</option>\n          <option value=\"continent\">continent</option>\n          <option value=\"citystate\">city-state</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"band\">climate</label></span>\n        <span class=\"l-ctl\"><select id=\"band\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"temperate\">temperate</option>\n          <option value=\"tropical\">tropical</option>\n          <option value=\"polar\">polar</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"land\">sea level</label></span>\n        <span class=\"land-end land-end-min\">more sea</span>\n        <input id=\"land\" type=\"range\" min=\"100\" max=\"700\" step=\"2\">\n        <span class=\"land-end land-end-max\">more land</span>\n        <span id=\"land-readout\" class=\"land-readout\"></span>\n        <span class=\"l-label\"><label for=\"coast\">coast</label><a class=\"fn\" href=\"/glossary/#coast-warp\" data-note=\"note-coast-warp\" aria-describedby=\"note-coast-warp\" aria-label=\"note on the coast warp\">&Dagger;</a></span>\n        <span class=\"land-end land-end-min\">calm</span>\n        <input id=\"coast\" type=\"range\" min=\"0\" max=\"100\" step=\"5\">\n        <span class=\"land-end land-end-max\">lobed</span>\n        <span id=\"coast-readout\" class=\"land-readout\"></span>\n      </div>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">"}]
```

- unit: test/site/broadside.test.ts: {BS1, BS3, BS4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: Land panel moved after the Hand panel; BR1, BR1b green (both tracks still share the Land ledger)

#### BS1.d
- claims: BS1.d
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<nav class=\"legend\" aria-label=\"The Press\">\n  <p class=\"legend-head\" id=\"grp-press\">The Press &middot; what the sheet can do next</p>\n  <div class=\"legend-row\" role=\"group\" aria-labelledby=\"grp-press\">\n    <button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button><a class=\"fn\" href=\"/glossary/#verso\" data-note=\"note-verso\" aria-describedby=\"note-verso\" aria-label=\"note on the verso\">&sect;</a>\n    <LegendButton id=\"order-plates\" gold href=\"../print-room/\" verb=\"Take to\" room=\"The Print Room\" />\n    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n  </div>\n</nav>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"<Slip id=\"broadside\" verb=\"Make one\" title=\"The Broadside\" where=\"the land, and the hand that dresses it\" fold=\"Fold the broadside away\">","replace":"<nav class=\"legend\" aria-label=\"The Press\">\n  <p class=\"legend-head\" id=\"grp-press\">The Press &middot; what the sheet can do next</p>\n  <div class=\"legend-row\" role=\"group\" aria-labelledby=\"grp-press\">\n    <button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button><a class=\"fn\" href=\"/glossary/#verso\" data-note=\"note-verso\" aria-describedby=\"note-verso\" aria-label=\"note on the verso\">&sect;</a>\n    <LegendButton id=\"order-plates\" gold href=\"../print-room/\" verb=\"Take to\" room=\"The Print Room\" />\n    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n  </div>\n</nav>\n<Slip id=\"broadside\" verb=\"Make one\" title=\"The Broadside\" where=\"the land, and the hand that dresses it\" fold=\"Fold the broadside away\">"}]
```

- unit: test/site/broadside.test.ts: {BS1}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: nav.legend moved above the Slip; it is fixed, so no read moves

#### M1
- claims: BS2.a #random; BS5.b (a seed-row id in the Press); ER2.a #random
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button>","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />","replace":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n    <span style=\"display: none\"><button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button></span>"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS5}; test/site/explorer-room.test.ts: {ER2}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: lands in the legend row inside a display:none span so the row's layout is untouched (BR2, BR1c stay green)

#### M2
- claims: BS2.a #seed; BS3.b (a seed-row id in The Land); ER2.a #seed; ER2.c #seed
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">","replace":"      </div>\n      <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS3}; test/site/explorer-room.test.ts: {ER2}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: appended as the Land panel's last child, outside .ledger (no grid shift)

#### M3
- claims: BS2.a #draw; BS4.b (a seed-row id in The Hand); ER2.a #draw; ER2.c #draw
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <button id=\"draw\" class=\"primary\">Draw</button>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">","replace":"      </div>\n      <button id=\"draw\" class=\"primary\">Draw</button>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS4}; test/site/explorer-room.test.ts: {ER2}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: appended as the Hand panel's last child, outside .ledger

#### M4
- claims: BS3.a #type; BS2.b (a Land id in the seed row)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <span class=\"l-ctl\"><select id=\"type\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"island\">island</option>\n          <option value=\"archipelago\">archipelago</option>\n          <option value=\"continent\">continent</option>\n          <option value=\"citystate\">city-state</option>\n        </select></span>","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <button id=\"draw\" class=\"primary\">Draw</button>","replace":"    <button id=\"draw\" class=\"primary\">Draw</button>\n    <select id=\"type\"><option value=\"\" selected>seed's choice</option><option value=\"island\">island</option><option value=\"archipelago\">archipelago</option><option value=\"continent\">continent</option><option value=\"citystate\">city-state</option></select>"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS3}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: the ledger's columns are pinned, so the tracks keep col 3 (BR1b green); BR11 still finds #type's options

#### M5
- claims: BS3.a #band; BS5.b (a Land id in the Press)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <span class=\"l-ctl\"><select id=\"band\">\n          <option value=\"\" selected>seed's choice</option>\n          <option value=\"temperate\">temperate</option>\n          <option value=\"tropical\">tropical</option>\n          <option value=\"polar\">polar</option>\n        </select></span>","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />","replace":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n    <span style=\"display: none\"><select id=\"band\"><option value=\"\" selected>seed's choice</option><option value=\"temperate\">temperate</option><option value=\"tropical\">tropical</option><option value=\"polar\">polar</option></select></span>"}]
```

- unit: test/site/broadside.test.ts: {BS3, BS5}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: hidden span in the legend row, as M1

#### M6
- claims: BS3.a #land
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <input id=\"land\" type=\"range\" min=\"100\" max=\"700\" step=\"2\">","replace":""},{"file":"src/pages/explorer/index.astro","find":"</RoomFolio>","replace":"</RoomFolio>\n<input id=\"land\" type=\"range\" min=\"100\" max=\"700\" step=\"2\">"}]
```

- unit: test/site/broadside.test.ts: {BS3}
- e2e: selection `broadside`; expect {BR1, BR1b, BR9}
- kind: BITES
- note: moved out of every group to just after </RoomFolio>; BR1b reads #land's edges against #coast's

#### M7
- claims: BS3.a #coast; BS4.b (a Land id in The Hand)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <input id=\"coast\" type=\"range\" min=\"0\" max=\"100\" step=\"5\">","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">","replace":"      </div>\n      <input id=\"coast\" type=\"range\" min=\"0\" max=\"100\" step=\"5\">\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">"}]
```

- unit: test/site/broadside.test.ts: {BS3, BS4}
- e2e: selection `broadside`; expect {BR1, BR1b, BR9}
- kind: BITES
- note: BR1b reads #coast's edges; the coast-warp mark BR5 and BR13 hover stays in the Land ledger

#### M8
- claims: BS4.a #style; BS3.b (a Hand id in The Land)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <span class=\"l-ctl\"><select id=\"style\">\n          <option value=\"antique\" selected>antique</option>\n          <option value=\"topographic\">topographic</option>\n          <option value=\"ink\">ink</option>\n          <option value=\"nautical\">nautical</option>\n        </select></span>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">","replace":"      </div>\n      <select id=\"style\"><option value=\"antique\" selected>antique</option><option value=\"topographic\">topographic</option><option value=\"ink\">ink</option><option value=\"nautical\">nautical</option></select>\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">"}]
```

- unit: test/site/broadside.test.ts: {BS3, BS4}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: the census's BS3 mutation, as a move to the Land panel's end

#### M9
- claims: BS4.a #theme
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"        <span class=\"l-ctl\"><select id=\"theme\">\n          <option value=\"\" selected>none</option>\n          <option value=\"vegetation\">vegetation</option>\n          <option value=\"climate\">temperature</option>\n          <option value=\"moisture\">rainfall</option>\n          <option value=\"population\">population</option>\n        </select></span>","replace":""},{"file":"src/pages/explorer/index.astro","find":"</RoomFolio>","replace":"</RoomFolio>\n<select id=\"theme\"><option value=\"\" selected>none</option><option value=\"vegetation\">vegetation</option><option value=\"climate\">temperature</option><option value=\"moisture\">rainfall</option><option value=\"population\">population</option></select>"}]
```

- unit: test/site/broadside.test.ts: {BS4}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: to just after </RoomFolio>

#### M10
- claims: BS4.a #legend; BS2.b (a Hand id in the seed row)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <label class=\"check seal\">legend <input id=\"legend\" type=\"checkbox\" checked></label>","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <button id=\"draw\" class=\"primary\">Draw</button>","replace":"    <button id=\"draw\" class=\"primary\">Draw</button>\n    <label class=\"check seal\">legend <input id=\"legend\" type=\"checkbox\" checked></label>"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS4}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: BS6 stays green (its regex reads the label wherever it stands)

#### M11
- claims: BS4.a #arms
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <label class=\"check seal\">arms <input id=\"arms\" type=\"checkbox\"></label>","replace":""},{"file":"src/pages/explorer/index.astro","find":"</RoomFolio>","replace":"</RoomFolio>\n<label class=\"check seal\">arms <input id=\"arms\" type=\"checkbox\"></label>"}]
```

- unit: test/site/broadside.test.ts: {BS4}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: to just after </RoomFolio>

#### M12
- claims: BS4.a #beasts (BR1's want map has no beasts); BS5.b (a Hand id in the Press)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <label class=\"check seal\">beasts <input id=\"beasts\" type=\"checkbox\"></label>","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />","replace":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n    <span style=\"display: none\"><label class=\"check seal\">beasts <input id=\"beasts\" type=\"checkbox\"></label></span>"}]
```

- unit: test/site/broadside.test.ts: {BS4, BS5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the one Hand control BR1 cannot see; hidden span in the legend row, the label unchanged so BS6 stays green

#### M13
- claims: BS4.a #ages
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<label class=\"check seal\">survey <input id=\"ages\" type=\"checkbox\"></label>","replace":""},{"file":"src/pages/explorer/index.astro","find":"</RoomFolio>","replace":"</RoomFolio>\n<label class=\"check seal\">survey <input id=\"ages\" type=\"checkbox\"></label>"}]
```

- unit: test/site/broadside.test.ts: {BS4}
- e2e: selection `broadside`; expect {BR1, BR3, BR9}
- kind: BITES
- note: the seal's dress is scoped to .broadside (public/explorer/broadside.css), so the label outside it shows no countersign and BR3 FAILs; EP1, BS6 green

#### M14
- claims: BS5.a #verso-turn; BS4.b (a Press id in The Hand); ER3.c; ER4.a (membership)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">","replace":"      </div>\n      <button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button>\n    </div>\n    <div class=\"fn-note\" id=\"note-seeds-choice\" role=\"tooltip\" popover=\"auto\">"}]
```

- unit: test/site/broadside.test.ts: {BS4, BS5}; test/site/explorer-room.test.ts: {ER3, ER4}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: the § mark stays in the row; waitSettled still finds #verso-turn

#### M15
- claims: BS5.a #order-plates; BS2.b (a Press id in the seed row); ER4.b (place)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"order-plates\" gold href=\"../print-room/\" verb=\"Take to\" room=\"The Print Room\" />","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <button id=\"draw\" class=\"primary\">Draw</button>","replace":"    <button id=\"draw\" class=\"primary\">Draw</button>\n    <LegendButton id=\"order-plates\" gold href=\"../print-room/\" verb=\"Take to\" room=\"The Print Room\" />"}]
```

- unit: test/site/broadside.test.ts: {BS2, BS5}; test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR1, BR2, BR9}
- kind: BITES
- note: BR2's sameRow (journal-link's top against order-plates') FAILs with the road in the corner

#### M16
- claims: BS5.a #journal-link; BS3.b (a Press id in The Land); ER3.c; ER4.c (place)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />","replace":""},{"file":"src/pages/explorer/index.astro","find":"      </div>\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">","replace":"      </div>\n      <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n    </div>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">"}]
```

- unit: test/site/broadside.test.ts: {BS3, BS5}; test/site/explorer-room.test.ts: {ER3, ER4}
- e2e: selection `broadside`; expect {BR1, BR2, BR9}
- kind: BITES
- note: BR2's sameRow FAILs with the road on the slip

#### BS2.c
- claims: BS2.c; ER2.b
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<button id=\"draw\" class=\"primary\">Draw</button>","replace":"<button id=\"draw\">Draw</button>"}]
```

- unit: test/site/broadside.test.ts: {BS2}; test/site/explorer-room.test.ts: {ER2}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: Draw loses class primary; no other check reads it

#### ER2.a
- claims: ER2.a (the seed row's group out of the folio corner, whole)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"  <div class=\"folio-controls\" role=\"group\" aria-label=\"The seed\">\n    <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">\n    <button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button>\n    <button id=\"draw\" class=\"primary\">Draw</button>\n  </div>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"  <div class=\"broadside\">\n","replace":"  <div class=\"broadside\">\n  <div class=\"folio-controls\" role=\"group\" aria-label=\"The seed\">\n    <input id=\"seed\" class=\"control\" type=\"number\" min=\"0\" max=\"4294967295\" step=\"1\" aria-label=\"seed\">\n    <button id=\"random\" class=\"dice\" type=\"button\" title=\"random seed\" aria-label=\"Random seed\">&#9860;</button>\n    <button id=\"draw\" class=\"primary\">Draw</button>\n  </div>\n"}]
```

- unit: test/site/broadside.test.ts: {BS2}; test/site/explorer-room.test.ts: {ER2}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the census's ER2 mutation; BR1 green (the group keeps its label)

#### BS6.a
- claims: BS6.a (legend's seal class)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<label class=\"check seal\">legend <input","replace":"<label class=\"check\">legend <input"}]
```

- unit: test/site/broadside.test.ts: {BS6}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the census's BS6 mutation

#### BS6.b
- claims: BS6.b (arms' label text)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<label class=\"check seal\">arms <input","replace":"<label class=\"check seal\">heraldry <input"}]
```

- unit: test/site/broadside.test.ts: {BS6}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### BS6.c
- claims: BS6.c (beasts' type)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<input id=\"beasts\" type=\"checkbox\">","replace":"<input id=\"beasts\" type=\"radio\">"}]
```

- unit: test/site/broadside.test.ts: {BS6}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: beasts, since BR1 and BR3 never read it

#### BS6.d
- claims: BS6.d (an id untouched; renamed on both sides so the page lives)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<input id=\"arms\" type=\"checkbox\">","replace":"<input id=\"arms-seal\" type=\"checkbox\">"},{"file":"src/site/explorer/elements.ts","find":"export const armsChk = $<HTMLInputElement>(\"arms\");","replace":"export const armsChk = $<HTMLInputElement>(\"arms-seal\");"}]
```

- unit: test/site/broadside.test.ts: {BS4, BS6}
- e2e: selection `broadside`; expect {BR1, BR9}
- kind: BITES
- note: page and src/site/explorer/elements.ts renamed together

#### BS6.e
- claims: BS6.e (the label wraps its real checkbox)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<label class=\"check seal\">beasts <input id=\"beasts\" type=\"checkbox\"></label>","replace":"<label class=\"check seal\">beasts</label> <input id=\"beasts\" type=\"checkbox\">"}]
```

- unit: test/site/broadside.test.ts: {BS6}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### EP1.a
- claims: EP1.a; BS6.b (survey)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<label class=\"check seal\">survey <input id=\"ages\"","replace":"<label class=\"check seal\">ages <input id=\"ages\""}]
```

- unit: test/site/broadside.test.ts: {BS6}; test/site/explorer-page.test.ts: {EP1}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the census's EP1 mutation; BR3 green (it reads the box, not the word)

#### BS7.a
- claims: BS7.a (the verso anchor: mark and note both re-pointed)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"href=\"/glossary/#verso\" data-note=\"note-verso\"","replace":"href=\"/glossary/#survey\" data-note=\"note-verso\""},{"file":"src/pages/explorer/index.astro","find":"<a href=\"/glossary/#verso\">read more in the glossary</a>","replace":"<a href=\"/glossary/#survey\">read more in the glossary</a>"}]
```

- unit: test/site/broadside.test.ts: {BS7}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: both edits are owed: the note's own link also carries href="/glossary/#verso", so the mark alone leaves BS7 green; #survey exists, so BS8 stays green

#### BS7.b
- claims: BS7.b (a note's head)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<strong class=\"fn-head\">of the verso</strong>","replace":"<strong class=\"fn-head\">of the back</strong>"}]
```

- unit: test/site/broadside.test.ts: {BS7}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### BS7.c
- claims: BS7.c (no title on a mark)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"href=\"/glossary/#verso\" data-note=\"note-verso\"","replace":"href=\"/glossary/#verso\" title=\"note on the verso\" data-note=\"note-verso\""}]
```

- unit: test/site/broadside.test.ts: {BS7}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the census's BS7 mutation

#### BS8.a
- claims: BS8.a (the floor of four)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"      <a href=\"/glossary/#seeds-choice\">read more in the glossary</a>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      <a href=\"/glossary/#coast-warp\">read more in the glossary</a>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      <a href=\"/glossary/#survey\">read more in the glossary</a>","replace":""},{"file":"src/pages/explorer/index.astro","find":"      <a href=\"/glossary/#verso\">read more in the glossary</a>","replace":""},{"file":"src/pages/explorer/index.astro","find":"href=\"/glossary/#verso\" data-note=\"note-verso\"","replace":"href=\"/glossary/\" data-note=\"note-verso\""}]
```

- unit: test/site/broadside.test.ts: {BS7, BS8}
- e2e: selection `broadside`; expect {BR9, BR6}
- kind: BITES
- note: five links go so three remain; BR6's hasLink reads #note-survey's own link

#### BS8.b1
- claims: BS8.b (an anchor the marks name missing on the glossary)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/glossary/index.astro","find":"<p class=\"term\" id=\"verso\">Verso</p>","replace":"<p class=\"term\" id=\"the-verso\">Verso</p>"}]
```

- unit: test/site/broadside.test.ts: {BS8}
- e2e: selection `broadside`; expect {BR7}
- kind: BITES
- note: the census's BS8 mutation

#### BS8.b2
- claims: BS8.b (the derived set: a fifth mark to an anchor nowhere)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"aria-label=\"note on the coast warp\">&Dagger;</a>","replace":"aria-label=\"note on the coast warp\">&Dagger;</a><a class=\"fn\" href=\"/glossary/#nowhere\">&para;</a>"}]
```

- unit: test/site/broadside.test.ts: {BS8}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: BR7 reads four fixed ids, so it stays green; BR9 reads the marks exactly

#### BS9.a
- claims: BS9.a
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/glossary/index.astro","find":"<h2 id=\"drafting-table\">At the drafting table</h2>","replace":"<h2 id=\"drafting-table\">At the table</h2>"}]
```

- unit: test/site/broadside.test.ts: {BS9}
- e2e: selection `broadside`; expect {BR7}
- kind: BITES
- note: the census's BS9 mutation; BR10 finds the section by id

#### BS9.b1
- claims: BS9.b Survey
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/glossary/index.astro","find":"<p class=\"term\" id=\"survey\">Survey</p>","replace":"<p class=\"term\" id=\"survey\">Surveys</p>"}]
```

- unit: test/site/broadside.test.ts: {BS9}
- e2e: selection `broadside`; expect {BR10}
- kind: BITES
- note: no other glossary term reads >Survey</p> (counted)

#### BS9.b2
- claims: BS9.b Coast warp
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/glossary/index.astro","find":"<p class=\"term\" id=\"coast-warp\">Coast warp</p>","replace":"<p class=\"term\" id=\"coast-warp\">Coastal warp</p>"}]
```

- unit: test/site/broadside.test.ts: {BS9}
- e2e: selection `broadside`; expect {BR10}
- kind: BITES
- note: -

#### BS9.b3
- claims: BS9.b Seed's choice
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/glossary/index.astro","find":"<p class=\"term\" id=\"seeds-choice\">Seed's choice</p>","replace":"<p class=\"term\" id=\"seeds-choice\">Seeds' choice</p>"}]
```

- unit: test/site/broadside.test.ts: {BS9}
- e2e: selection `broadside`; expect {BR10}
- kind: BITES
- note: -

#### ER1.a
- claims: ER1.a chartRoom
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"  chartRoom\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER1}
- e2e: selection `runninghead`; expect {RH2, RH3, RH17}
- kind: BITES
- note: PRR1.a's measured set on the Print Room; ? until measured (another runninghead read of a chart room may join)

#### ER1.b
- claims: ER1.b the name in the folio corner
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<RoomFolio room={room} tagline={tagline}>","replace":"<RoomFolio room=\"The Explorers\" tagline={tagline}>"}]
```

- unit: test/site/explorer-room.test.ts: {ER1}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER1.c
- claims: ER1.c the tagline
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<RoomFolio room={room} tagline={tagline}>","replace":"<RoomFolio room={room}>"}]
```

- unit: test/site/explorer-room.test.ts: {ER1}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: 2e measured runninghead ALL PASS on this edit

#### ER1.d
- claims: ER1.d no RoomHead (a planted second h1)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"</RoomFolio>","replace":"</RoomFolio>\n<h1 class=\"room-head\">The Explorer</h1>"}]
```

- unit: none (unit stays green; no unit block)
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: e2e only: ER1's source pin stays green (no RoomHead component exists), the 2g precedent (PPR1.c, RBR1.4)

#### ER3.a
- claims: ER3.a the slip is #broadside
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<Slip id=\"broadside\" verb=","replace":"<Slip id=\"broadsheet\" verb="}]
```

- unit: test/site/explorer-room.test.ts: {ER3}
- e2e: selection `broadside`; expect {BR9}; stops {"BR1 to BR1c"}
- kind: NEEDS READ (the ledger's verdict, since a stop is present); the claim is held by BR9's FAIL by name
- note: BR9 is the holder: its scripts-off SLIP read finds no `aside.slip#broadside` (the id it reads is the renamed one) and FAILs by name. The stop is BR1c's and is read under 6090198881 as follows. BR1c's own read, the `legendRoom` evaluate (`e2e/suites/broadside.ts:94` to 97), looks the slip up as `r("#broadside")` and gets null. Its own judgement of that read then throws, in Node and not in the page: `legendClear(at1280)` (lines 98 to 104) dereferences `m.sl!.l`, giving TypeError: Cannot read properties of null (reading 'l'). That is past `m.lg.l >= m.folioText + 16`, which holds because the slip is still placed through `.slip`. The throw is not in BR1c's navigation, settle or setup: BR1's goto has already passed, and BR1c's `sleep(400)` and resizes come before the read that throws. So it counts as BR1c's own read of the broken code, but the row does not depend on it. A person reading the stanza confirms the TypeError's stack is in `legendClear`, called from `br1cLegendClear`, and that BR9 is in the reds.

#### ER3.b
- claims: ER3.b The Hand rides the slip
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">\n      <p class=\"panel-head archivist-head\" id=\"grp-hand\">The Hand</p>\n      <p class=\"panel-gloss\">these dress the same world</p>\n      <div class=\"ledger\">\n        <span class=\"l-label\"><label for=\"style\">style</label></span>\n        <span class=\"l-ctl\"><select id=\"style\">\n          <option value=\"antique\" selected>antique</option>\n          <option value=\"topographic\">topographic</option>\n          <option value=\"ink\">ink</option>\n          <option value=\"nautical\">nautical</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"theme\">theme</label></span>\n        <span class=\"l-ctl\"><select id=\"theme\">\n          <option value=\"\" selected>none</option>\n          <option value=\"vegetation\">vegetation</option>\n          <option value=\"climate\">temperature</option>\n          <option value=\"moisture\">rainfall</option>\n          <option value=\"population\">population</option>\n        </select></span>\n        <span class=\"l-label\"></span>\n        <span class=\"l-ctl seals\">\n          <label class=\"check seal\">legend <input id=\"legend\" type=\"checkbox\" checked></label>\n          <label class=\"check seal\">arms <input id=\"arms\" type=\"checkbox\"></label>\n          <label class=\"check seal\">beasts <input id=\"beasts\" type=\"checkbox\"></label>\n          <!-- The survey ink (#317 decision 1): ticked inks the completed survey track onto the sheet at rest; time itself lives in the Reading Room. The id stays `ages`; the box is 1:1 with the bare `survey` hash flag. -->\n          <label class=\"check seal\">survey <input id=\"ages\" type=\"checkbox\"></label><a class=\"fn\" href=\"/glossary/#survey\" data-note=\"note-survey\" aria-describedby=\"note-survey\" aria-label=\"note on the survey\">*</a>\n        </span>\n      </div>\n    </div>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"</Slip>\n","replace":"</Slip>\n    <div class=\"panel\" role=\"group\" aria-labelledby=\"grp-hand\">\n      <p class=\"panel-head archivist-head\" id=\"grp-hand\">The Hand</p>\n      <p class=\"panel-gloss\">these dress the same world</p>\n      <div class=\"ledger\">\n        <span class=\"l-label\"><label for=\"style\">style</label></span>\n        <span class=\"l-ctl\"><select id=\"style\">\n          <option value=\"antique\" selected>antique</option>\n          <option value=\"topographic\">topographic</option>\n          <option value=\"ink\">ink</option>\n          <option value=\"nautical\">nautical</option>\n        </select></span>\n        <span class=\"l-label\"><label for=\"theme\">theme</label></span>\n        <span class=\"l-ctl\"><select id=\"theme\">\n          <option value=\"\" selected>none</option>\n          <option value=\"vegetation\">vegetation</option>\n          <option value=\"climate\">temperature</option>\n          <option value=\"moisture\">rainfall</option>\n          <option value=\"population\">population</option>\n        </select></span>\n        <span class=\"l-label\"></span>\n        <span class=\"l-ctl seals\">\n          <label class=\"check seal\">legend <input id=\"legend\" type=\"checkbox\" checked></label>\n          <label class=\"check seal\">arms <input id=\"arms\" type=\"checkbox\"></label>\n          <label class=\"check seal\">beasts <input id=\"beasts\" type=\"checkbox\"></label>\n          <!-- The survey ink (#317 decision 1): ticked inks the completed survey track onto the sheet at rest; time itself lives in the Reading Room. The id stays `ages`; the box is 1:1 with the bare `survey` hash flag. -->\n          <label class=\"check seal\">survey <input id=\"ages\" type=\"checkbox\"></label><a class=\"fn\" href=\"/glossary/#survey\" data-note=\"note-survey\" aria-describedby=\"note-survey\" aria-label=\"note on the survey\">*</a>\n        </span>\n      </div>\n    </div>\n"}]
```

- unit: test/site/broadside.test.ts: {BS4}; test/site/explorer-room.test.ts: {ER3}
- e2e: selection `broadside`; expect {BR9, BR3, BR6?}
- kind: BITES
- note: the census's ER3 mutation; the panel leaves .broadside, so BR3's seal shows no countersign, and the survey mark lands behind the fixed stage, so BR6's real tap misses it (? until measured)

#### ER4.a
- claims: ER4.a; BS5.c
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<button id=\"verso-turn\" class=\"legend-btn\" type=\"button\">","replace":"<button id=\"verso-turn\" type=\"button\">"}]
```

- unit: test/site/broadside.test.ts: {BS5}; test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.b-gold
- claims: ER4.b gold; BS5.d
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<LegendButton id=\"order-plates\" gold href=","replace":"<LegendButton id=\"order-plates\" href="}]
```

- unit: test/site/broadside.test.ts: {BS5}; test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR2, BR9}
- kind: BITES
- note: BR2 compares the two roads' className

#### ER4.b-href
- claims: ER4.b href as authored
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"href=\"../print-room/\" verb=\"Take to\"","replace":"href=\"/print-room/\" verb=\"Take to\""}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the script rewrites the href at every hash write, so only the scripts-off read sees it

#### ER4.b-verb
- claims: ER4.b verb
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"verb=\"Take to\"","replace":"verb=\"Carry to\""}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.b-room
- claims: ER4.b room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"room=\"The Print Room\" />","replace":"room=\"The Press Room\" />"}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: astro-scaffold's road-name test reds too (unlisted)

#### ER4.c-gold
- claims: ER4.c gold; BS5.e
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<LegendButton id=\"journal-link\" gold href=","replace":"<LegendButton id=\"journal-link\" href="}]
```

- unit: test/site/broadside.test.ts: {BS5}; test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR2, BR9}
- kind: BITES
- note: -

#### ER4.c-href
- claims: ER4.c href as authored
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"href=\"/reading-room/\" verb=\"Read the journal in\"","replace":"href=\"../reading-room/\" verb=\"Read the journal in\""}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.c-verb
- claims: ER4.c verb
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"verb=\"Read the journal in\"","replace":"verb=\"Read the log in\""}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.c-room
- claims: ER4.c room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"room=\"The Reading Room\" />","replace":"room=\"The Journal Room\" />"}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.d
- claims: ER4.d Turn the sheet leads the row
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"    <button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button><a class=\"fn\" href=\"/glossary/#verso\" data-note=\"note-verso\" aria-describedby=\"note-verso\" aria-label=\"note on the verso\">&sect;</a>\n","replace":""},{"file":"src/pages/explorer/index.astro","find":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n","replace":"    <LegendButton id=\"journal-link\" gold href=\"/reading-room/\" verb=\"Read the journal in\" room=\"The Reading Room\" />\n    <button id=\"verso-turn\" class=\"legend-btn\" type=\"button\"><span class=\"verb\">Turn</span><span class=\"room\">The Sheet</span></button><a class=\"fn\" href=\"/glossary/#verso\" data-note=\"note-verso\" aria-describedby=\"note-verso\" aria-label=\"note on the verso\">&sect;</a>\n"}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the whole line (button and § mark) moved after the journal road

#### ER4.e
- claims: ER4.e no action-link (planted, hidden)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"</nav>","replace":"</nav>\n<a class=\"action-link\" href=\"../print-room/\" hidden>Take to the Print Room</a>"}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER4.f
- claims: ER4.f the head's class
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"legend-head\" id=\"grp-press\">","replace":"<p id=\"grp-press\">"}]
```

- unit: test/site/explorer-room.test.ts: {ER4}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: BR1 reads the head's text only

#### ER5.a1
- claims: ER5.a #sheet.sheet
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div class=\"sheet\" id=\"sheet\">","replace":"<div id=\"sheet\">"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER5.a2
- claims: ER5.a #sheet-inner.sheet-inner
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div class=\"sheet-inner\" id=\"sheet-inner\">","replace":"<div id=\"sheet-inner\">"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}; test/site/atelier-kit.test.ts: {AK5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: AK5 is the kit agent's

#### ER5.a3
- claims: ER5.a #map.living-chart
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div id=\"map\" class=\"living-chart\"></div>","replace":"<div id=\"map\"></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}; test/site/living-chart-css.test.ts: {LC}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: living-chart-css's host-contract test is the engine-hooks agent's; BR9 also holds its mount-class claim

#### ER5.a4
- claims: ER5.a #verso beside the gesture box in the leaf
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"  <div id=\"verso\" aria-hidden=\"true\"></div>\n  </div></div>","replace":"  </div></div>\n  <div id=\"verso\" aria-hidden=\"true\"></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: #verso is visibility:hidden at rest, so no hit-test moves

#### ER5.a5
- claims: ER5.a #verso aria-hidden
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div id=\"verso\" aria-hidden=\"true\"></div>","replace":"<div id=\"verso\"></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER5.a6
- claims: ER5.a #map empty as authored
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div id=\"map\" class=\"living-chart\"></div>","replace":"<div id=\"map\" class=\"living-chart\"><span class=\"seed-ink\"></span></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: draw() wipes #map, so only the scripts-off read sees it

#### ER5.a7
- claims: ER5.a #verso empty as authored
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<div id=\"verso\" aria-hidden=\"true\"></div>","replace":"<div id=\"verso\" aria-hidden=\"true\"><span class=\"docket\"></span></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: rebuildVerso replaces #verso's children

#### ER5.b
- claims: ER5.b the Glass outside the gesture box
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<Glass id=\"zoom-controls\" />","replace":""},{"file":"src/pages/explorer/index.astro","find":"<div id=\"map\" class=\"living-chart\"></div></div>","replace":"<div id=\"map\" class=\"living-chart\"></div><Glass id=\"zoom-controls\" /></div>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: AK3 and astro-scaffold's KIT_GLASS stay green (the markup is unchanged, only its place)

#### ER5.c
- claims: ER5.c the Glass's id (renamed on both sides)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<Glass id=\"zoom-controls\" />","replace":"<Glass id=\"zoom-cluster\" />"},{"file":"src/site/explorer/app.ts","find":"cluster: $(\"zoom-controls\")","replace":"cluster: $(\"zoom-cluster\")"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}; test/site/atelier-kit.test.ts: {AK3}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: glass.ts binds stopPropagation on the cluster, so a one-sided rename kills the page; app.ts renamed with it

#### ER5.d1
- claims: ER5.d the status line's id (renamed on both sides)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></p>","replace":"<p class=\"status\" id=\"pill\" role=\"status\" aria-live=\"polite\"></p>"},{"file":"src/site/explorer/elements.ts","find":"export const status = $(\"status\");","replace":"export const status = $(\"pill\");"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}; stops {"BR1 to BR1c", "BR12"}
- kind: NEEDS READ (the ledger's verdict, since stops are present); the claim is held by BR9's FAIL alone
- note: BR9 is the holder: its scripts-off STAGE read finds no `#status` and FAILs by name ("the status pill a live status"). Neither stop counts under 6090198881. Both are thrown in `waitReady` in `e2e/harness.ts` (lines 152 to 163), whose unguarded `document.getElementById("status").textContent` raises "eval exception: TypeError: Cannot read properties of null (reading 'textContent')". The first throw is inside the kit's `goto` (`waitReady` then `waitSettled`), which `br1Groups` calls first in step "BR1 to BR1c", so it is BR1's navigation settle. The second is inside BR12's own `goto` (BR12's setup). Both are a check's navigation or settle, never its read of the broken code. The row stands on BR9; a person reading the stanzas confirms that both stops are in `waitReady` and that BR9 is in the reds.

#### ER5.d2
- claims: ER5.d aria-live
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></p>","replace":"<p class=\"status\" id=\"status\" role=\"status\"></p>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the census's ER5 mutation

#### ER5.d3
- claims: ER5.d role
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></p>","replace":"<p class=\"status\" id=\"status\" aria-live=\"polite\"></p>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER5.d4
- claims: ER5.d class status
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></p>","replace":"<p id=\"status\" role=\"status\" aria-live=\"polite\"></p>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: an empty unstyled p in the flex stage has no width, so the sheet does not move

#### ER5.d5
- claims: ER5.d empty as authored
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></p>","replace":"<p class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\">Drafting…</p>"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: the script overwrites it at the first draw

#### ER5.e
- claims: ER5.e folio line one
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<ChartFolio lines={[[\"folio-title\", \"folio-title\"]","replace":"<ChartFolio lines={[[\"folio-name\", \"folio-title\"]"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: astro-scaffold's folio-lead assertion reds too (unlisted); BR12 reads #folio-title by id and stays green

#### ER5.f
- claims: ER5.f folio line three is #caption, folio-coords
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"[\"folio-coords\", \"caption\"]","replace":"[\"folio-sub\", \"caption\"]"}]
```

- unit: test/site/explorer-room.test.ts: {ER5}
- e2e: selection `broadside`; expect {BR9}
- kind: BITES
- note: -

#### ER6.a
- claims: ER6.a the stage's reserve
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"  padding: var(--reserve-top, 8rem) var(--reserve-right, 0px) var(--reserve-bottom, 8rem) 0;\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR12, BR1c?}
- kind: BITES
- note: the sheet centres in the whole stage, about half the right reserve over toward the slip and the Glass, so BR1c's sh.r <= gl.l - 8 likely FAILs (? until measured)

#### ER6.c
- claims: ER6.c touch-action none
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"  touch-action: none;\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: Z7 and Z11 (zoom) red too, not sent

#### ER6.d
- claims: ER6.d the top-left pivot
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"  transform-origin: 0 0;\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: Z1 (zoom) reds too, not sent (its zoom set is unmeasured)

#### ER6.e
- claims: ER6.e the chart fills its fitted box
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"#map svg[data-vellum-style] {\n  width: 100%;\n  height: 100%;\n","replace":"#map svg[data-vellum-style] {\n  width: 100%;\n"}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: the svg's own height="1158" attribute takes over, past the sheet's fitted height

#### ER6.f
- claims: ER6.f the sheet at the stage depth, via the token
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"  box-shadow: var(--stage-shadow);\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: FL6 (corners) stays green: it reads this shadow and asserts it only for the Portfolio

#### ER6.i
- claims: ER6.i the chart prints unzoomed (!important against the camera's inline transform)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/index.css","find":"    transform: none !important;","replace":"    transform: none;"}]
```

- unit: test/site/explorer-room.test.ts: {ER6}
- e2e: selection `broadside`; expect {BR14}
- kind: BITES
- note: -

#### ER7.a-bind
- claims: ER7.a, what the import binds (bindRoom stubbed)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/app.ts","find":"const room = bindRoom({","replace":"const room = ((parts: unknown) => ({ layout: (): void => undefined, broadside: null, parts }))({"}]
```

- unit: none (unit stays green; no unit block)
- e2e: selection `broadside`; expect {BR12, BR14, BR1c?}
- kind: BITES (CONDITIONAL)
- note: e2e only: ER7 stays green (the import and both slices stand); the 0x0 sheet leaves no gesture box under BR14's wheel, no reserve under BR12, and the legend at the kit's default seat (BR1c ?); CONDITIONAL as a whole: the stub also skips bindSlip and placeSlip, so the slip is never seated or bound and the marks BR4, BR5, BR6 and BR13 aim at may move; measure the row locally on broadside and send the measured set (F5)

#### ER7.b-local
- claims: ER7.b the turn path's refit (equivalence)
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/app.ts","find":"      room.layout();\n      armOnLanding({","replace":"      armOnLanding({"}]
```

- unit: test/site/explorer-room.test.ts: {ER7}
- e2e: selection `broadside, then turn`; expect {}
- kind: LOCAL
- note: expected ALL PASS on both: a style turn re-dresses the same world (every world is 320x240, so the same aspect) under the same folio; green confirms the errata row, any red becomes that row's holder and goes to the runner

#### ER7.c
- claims: ER7.c the settle path's refit
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/app.ts","find":"    room.layout();\n    if (!quiet) startArrival(mapDiv.querySelector(\"svg\"));","replace":"    if (!quiet) startArrival(mapDiv.querySelector(\"svg\"));"}]
```

- unit: test/site/explorer-room.test.ts: {ER7}
- e2e: selection `broadside`; expect {BR12, BR1c?}
- kind: BITES (CONDITIONAL)
- note: the boot seat was taken before the folio write, so the reseat moves it; CONDITIONAL on no later layout healing it (F2)

#### ER7.e1
- claims: ER7.e folioTitle written
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/app.ts","find":"  folioTitle,\n  folioSub,\n","replace":"  folioSub,\n"},{"file":"src/site/explorer/app.ts","find":"  folioTitle.textContent = `${res.title} · Chart № ${seed}`;\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER7}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: the import name goes too, since ER7 only asks that app.ts mention folioTitle

#### ER7.e2
- claims: ER7.e folioSub written
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/app.ts","find":"  folioTitle,\n  folioSub,\n","replace":"  folioTitle,\n"},{"file":"src/site/explorer/app.ts","find":"  folioSub.textContent = year ? `surveyed ${year[0]}` : res.subtitle;\n","replace":""}]
```

- unit: test/site/explorer-room.test.ts: {ER7}
- e2e: selection `broadside`; expect {BR12}
- kind: BITES
- note: as ER7.e1

#### TF1.a
- claims: TF1.a the tip's angle
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/broadside.css","find":"  transform: translateY(var(--raise)) rotate(-0.6deg);","replace":"  transform: translateY(var(--raise)) rotate(-1deg);"}]
```

- unit: test/site/tip-affordance.test.ts: {TF1}
- e2e: selection `broadside`; expect {BR13}
- kind: BITES
- note: unit predicted (the file's roster needs git, so the scratch copy could not load it)

#### TF1.b
- claims: TF1.b the tip's raise via --raise
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"public/explorer/broadside.css","find":"  transform: translateY(var(--raise)) rotate(-0.6deg);","replace":"  transform: translateY(-3px) rotate(-0.6deg);"}]
```

- unit: test/site/tip-affordance.test.ts: {TF1}
- e2e: selection `broadside`; expect {BR13}
- kind: BITES
- note: as TF1.a

#### TA1.a
- claims: TA1.a #style
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <option value=\"nautical\">nautical</option>","replace":"          <option value=\"nautical\">nautical</option>\n          <option value=\"sepia\">sepia</option>"}]
```

- unit: test/site/table-address.test.ts: {TA1}
- e2e: selection `broadside`; expect {BR11}
- kind: BITES
- note: the census's TA1 mutation

#### TA1.b
- claims: TA1.a #type
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <option value=\"citystate\">city-state</option>","replace":"          <option value=\"citystate\">city-state</option>\n          <option value=\"pangaea\">pangaea</option>"}]
```

- unit: test/site/table-address.test.ts: {TA1}
- e2e: selection `broadside`; expect {BR11}
- kind: BITES
- note: -

#### TA1.c
- claims: TA1.a #band
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <option value=\"polar\">polar</option>","replace":"          <option value=\"polar\">polar</option>\n          <option value=\"arid\">arid</option>"}]
```

- unit: test/site/table-address.test.ts: {TA1}
- e2e: selection `broadside`; expect {BR11}
- kind: BITES
- note: -

#### TA1.d
- claims: TA1.a #theme
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"          <option value=\"population\">population</option>","replace":"          <option value=\"population\">population</option>\n          <option value=\"relief\">relief</option>"}]
```

- unit: test/site/table-address.test.ts: {TA1}
- e2e: selection `broadside`; expect {BR11}
- kind: BITES
- note: -

#### RDW1.a
- claims: RDW1.a worker.ts detail
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/worker.ts","find":"    detail: true,","replace":"    detail: false,"}]
```

- unit: test/site/region-detail-wiring.test.ts: {RDW1}
- e2e: selection `render`; expect {R14}
- kind: BITES
- note: R14 compares the worker's region job with runInline in one page; RD1/RD2 (region-detail) would red too, not selected

#### RDW1.b
- claims: RDW1.b worker.ts level
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/worker.ts","find":"detail: regionDetailLevel(spec) };","replace":"detail: 0 };"}]
```

- unit: test/site/region-detail-wiring.test.ts: {RDW1}
- e2e: selection `render`; expect {R14}
- kind: BITES
- note: the stamp differs, so the bytes do

#### RDW1.d
- claims: RDW1.d worker-client.ts detail
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/worker-client.ts","find":"      detail: true,","replace":"      detail: false,"}]
```

- unit: test/site/region-detail-wiring.test.ts: {RDW1, BAND1, BAND2, BAND3, HELD, STAMP}
- e2e: none
- kind: HELD-RUN
- note: unit only; measured on a scratch copy; R14 would red too

#### RDW1.e
- claims: RDW1.e worker-client.ts level
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/worker-client.ts","find":"detail: regionDetailLevel(spec) };","replace":"detail: 0 };"}]
```

- unit: test/site/region-detail-wiring.test.ts: {RDW1, BAND1, BAND2, BAND3, STAMP}
- e2e: none
- kind: HELD-RUN
- note: unit only; measured

#### RDW1.f
- claims: RDW1.f worker-client.ts chainCache
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/site/explorer/worker-client.ts","find":"      chainCache: regionChainCache,\n","replace":""}]
```

- unit: test/site/region-detail-wiring.test.ts: {RDW1, HELD}
- e2e: none
- kind: HELD-RUN
- note: unit only; measured

#### AB1.a1
- claims: AB1.a the Explorer loads its twin as a module script
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script src=\"./app.bundle.js\" is:inline></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN}
- e2e: none
- kind: HELD-DATA
- note: is:inline kept, so the compiler still emits the tag verbatim, now without type="module"

#### AB1.a2
- claims: AB1.a the Print Room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/print-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script src=\"./app.bundle.js\" is:inline></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN}
- e2e: none
- kind: HELD-DATA
- note: -

#### AB1.a3
- claims: AB1.a the Seed of the Day
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/seed-of-the-day/index.astro","find":"<script type=\"module\" src=\"app.bundle.js\" is:inline></script>","replace":"<script src=\"app.bundle.js\" is:inline></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN}
- e2e: none
- kind: HELD-DATA
- note: -

#### AB1.a4
- claims: AB1.a the Reading Room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/reading-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script src=\"./app.bundle.js\" is:inline></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN}
- e2e: none
- kind: HELD-DATA
- note: -

#### AB1.b1
- claims: AB1.b the Explorer loads no raw source
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>\n<script type=\"module\" src=\"./app.js\"></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN, LINKS}
- e2e: none
- kind: HELD-DATA
- note: astro-scaffold's two reds predicted (? on LINKS): its doesNotMatch, and the link resolver finding no /explorer/app.js

#### AB1.b2
- claims: AB1.b the Print Room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/print-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>\n<script type=\"module\" src=\"./app.js\"></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN, LINKS}
- e2e: none
- kind: HELD-DATA
- note: as AB1.b1

#### AB1.b3
- claims: AB1.b the Seed of the Day
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/seed-of-the-day/index.astro","find":"<script type=\"module\" src=\"app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"app.bundle.js\" is:inline></script>\n<script type=\"module\" src=\"app.js\"></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN, LINKS}
- e2e: none
- kind: HELD-DATA
- note: as AB1.b1

#### AB1.b4
- claims: AB1.b the Reading Room
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/reading-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>\n<script type=\"module\" src=\"./app.js\"></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}; test/site/astro-scaffold.test.ts: {TWIN, LINKS}
- e2e: none
- kind: HELD-DATA
- note: as AB1.b1

#### AB1.c-local
- claims: AB1.c is:inline (the word), on 6091335054 item 1's terms
- edits (count 1 each, at 2b148100 and where applied):

```json
[{"file":"src/pages/explorer/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\"></script>"},{"file":"src/pages/print-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\"></script>"},{"file":"src/pages/seed-of-the-day/index.astro","find":"<script type=\"module\" src=\"app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"app.bundle.js\"></script>"},{"file":"src/pages/reading-room/index.astro","find":"<script type=\"module\" src=\"./app.bundle.js\" is:inline></script>","replace":"<script type=\"module\" src=\"./app.bundle.js\"></script>"}]
```

- unit: test/site/app-bundles.test.ts: {AB1}
- e2e: none
- kind: LOCAL
- note: evidence for the deletion: build with is:inline dropped from the four pages; astro-scaffold's TWIN stays GREEN and the four built pages are byte-identical to an unmutated build (F1)

## D. The 2i table

| file | the test, as renamed | what stays | why no browser here sees it (class) |
|---|---|---|---|
| `test/site/explorer-room.test.ts` | "ER6 the page css revives no 1100px column and ends with its print block (kept for Issue #779 part 2i: a retired rule's absence and the block's place; BR12 and BR14 read the rest)" | `!/max-width:\s*1100px/.test(css)`; the `/@media print\s*\{([\s\S]*)\}\s*$/` match | (b) a retire pin outside ruling 6's fifteen rows; (e) the block's place in the file (PRR7's and RBR7's precedent: the greedy regex passes a moved block, only a trailing non-rule reds it, and no rule follows the block to compete in print) |
| same | "ER7 app.ts imports the shared room and refits after the place overlay is built (kept for Issue #779 part 2i: an import, and two synchronous calls in one task)" | the `import { bindRoom } from "../shared/room.ts"` pin; the settle slice's `indexOf("room.layout()") > indexOf("lc.buildPlaceOverlay(res.manifest)")` | (a) an import pin (ruling 3 of 6098118329; what it binds is BR12's and BR14's, row ER7.a-bind); (d) the overlay is built synchronously before or after the fit, and changes nothing the fit measures (the svg's viewBox, the chrome's rects) |
| `test/site/region-detail-wiring.test.ts` | "the worker's region job builds in the held chain cache (kept for Issue #779 part 2i: the cache is transparent to every byte, so only time could see it)" | `chainCache: regionChainCache` in `src/site/explorer/worker.ts` | (e) an argument that changes no served byte (the file's own comment: "The cache is transparent by construction"); runInline's twin of it is RUN by HELD (row RDW1.f) |

Deleted whole: `test/site/broadside.test.ts` (all nine), `test/site/explorer-page.test.ts` (its one test), and ER1 to ER5, TA1, TF1, AB1. ER6's and ER7's other assertions and RDW1's other five pins leave with their rows; ER7's turn-path pin leaves as dead (section E row 4).

## E. Errata rows (each searched first in `handbook/errata/` and the open issues by the planner)

1. **Extend `handbook/errata/site.md`'s PR #858 row (line 75) to five sheets:** the print arm `.stage { position: static }` in `public/explorer/index.css` is dead the same way: the kit's print `body.chart-room .stage { position: static }` in `public/atelier.css` (0,2,1) decides it in print, and on screen the kit's `body.chart-room .stage { position: fixed }` (0,2,1) outranks it (read from the rules, not run). ER6.h's pin goes; the declaration stays for whoever deletes it.
2. **New `site.md` row, CONDITIONAL on one read (F4):** the same print rule's `display: block` is dead too: the Explorer's own unconditional `body.chart-room .stage { display: flex; ... }` (0,2,1) in `public/explorer/index.css` applies in print and outranks `.stage` (0,1,0); its `padding: 0 !important` is live. No unit test pins it, so nothing is deleted; the row records the dead declaration.
3. **New `site.md` row:** `public/motion.css`'s `.actions a` and `.action-link` arms of its three button-motion rules (lines 126 to 143) dress classes no served element wears: `.action-link` retired with the Press strip (ER4.e, held now by BR9) and `grep -rn 'action-link\|class="actions' src scripts design/kit` finds no wearer. Searched here: `handbook/errata/` for "action-link": none.
4. **New `handbook/errata/guards.md` row, CONDITIONAL on row ER7.b-local:** the turn path's `room.layout()` in `landDraw` (`src/site/explorer/app.ts`, inside `runTurn(...).then`) is equivalent by construction: only a style change turns (`styleSel`'s listener in `src/site/explorer/controls.ts`), a style turn re-dresses the same world under the same folio (keepDraw writes it before the turn lands), and every world is 320x240 so the aspect never changes; 2g-reading call 26's precedent for the Reading Room's two equivalent `room.layout()` calls. ER7's pin on it is deleted; the call stays for whoever deletes it.

No other sibling defect was found. FL6's unasserted Explorer shadow read is recorded in the measured facts, not as a defect: it is a read the check prints and never claims.

## F. Probes and doubts

1. **AB1.c, the `is:inline` word (LOCAL, and a fact for Issue #600).** Probe: with all four AB1.c-local edits applied, `npm run astro:generate` then `astro build` once locally, and compare each of the four built pages to an unmutated build: identical, and TWIN green, is the deletion's evidence (as the compiler probe predicts); a difference makes AB1.c HELD-DATA by TWIN and the row goes to the runner. **For Alex, not this round:** the compiler probe says `type="module"` alone already keeps these tags out of Astro's processing, so Issue #600's premise ("Without it the build routes that script through its own Vite pass") and `handbook/specs/site-architecture.md`'s "contractual" sentence look stale today. Ruling 6091335054 item 1 leaves the word to Issue #600; this only hands it the measurement (a comment there, searched first).
2. **ER7.c is CONDITIONAL.** Probe: apply the row locally and run `broadside`. BR12 red (the reseat moves the legend) keeps the row; BR1c's red, if it comes, joins the set. If BR12 stays green, something healed the boot seat after the folio write (a late `document.fonts.ready`): then BR12 gains a redraw before its reads (seed 7 typed into `#seed`, a real press on `#draw`, `waitSettled`, then the reads; seed 42 restored in `finally`), since only the settle path re-seats after a redraw's folio write, and the row is re-measured.
3. **ER7.b-local.** Run `broadside` and `turn` locally with the edit: ALL PASS confirms section E row 4; any red becomes the holder and the row goes to the runner.
4. **The print `display: block` (section E row 2).** Probe: on `/explorer/` under `Emulation.setEmulatedMedia { media: "print" }`, `getComputedStyle(document.querySelector(".stage")).display`: "flex" confirms the row; "block" drops it.
5. **BR1c in rows ER6.a and ER7.c, and BR6 in row ER3.b, are `?`; row ER7.a-bind is CONDITIONAL as a whole.** Each `?` is reasoned from geometry (a sheet re-centred toward the slip, a legend never seated, a mark behind the fixed stage); measure the row locally on `broadside` and name what reds. The bindRoom stub also skips `bindSlip` and `placeSlip`, so the slip is never seated or bound and BR4, BR5, BR6 and BR13 aim at marks that may have moved: its set is taken from a local run, not from this table.
6a. **ER5.d1's stops land inside steps and are not its holders:** the harness's startup only navigates to `/explorer/` (`e2e/harness.ts:345`) and reads `#status` in no wait before the first suite, so with selection `broadside` the first unguarded read is the `waitReady` in BR1's goto, inside step "BR1 to BR1c", and the second is in BR12's goto. Both are navigation settles, which do not count under 6090198881 as the planner reads it, so the row is held by BR9's FAIL alone; the ledger still says NEEDS READ because stops are present.
6b. **BR9's whole-page counts were checked against the wrapper:** `src/layouts/` adds no `role="group"` but the Glass's, no `h1` on a room page (the wordmark is a `p` when `room` is set), and no `a.fn`, `.fn-note` or `.action-link`, so the unmutated control meets every want.
6. **ER1.a's runninghead set** is PRR1.a's measured `{RH2, RH3, RH17}` on the Print Room; the Explorer is also RH6's APP page and RH9b's wash page, neither of which reads `chart-room`, so no extra is expected, but measure it locally first.
7. **BR13's premise.** Probe on `/explorer/` at the harness size: `document.elementFromPoint` at the centre of `header.chrome .wordmark a` returns that link (the cluster is fixed at z-index 10 over the stage). If not, BR13 compares the mark against the wordmark on the page BR9 or BR7 visits instead, still a real hover.
8. **AB1.b's LINKS red is `?`:** predicted from the resolver (no `/explorer/app.js` in `generated`, no `public/explorer/app.js` on disk after the before-hook's clean), not run.
9. **Loops proven by instance, not exhaustively (a call for the planner):** BS2.b, BS3.b, BS4.b and BS5.b each assert over 13 ids; each is proven once per foreign group (three rows each), and the one id BR1 cannot see (#beasts) by its own row; the "holds" halves are proven for every id (16 move rows). BR9 reads every group's full list, so any other instance reds it too.
10. **RDW1.c's class is a loose fit:** (e) is "code shape"; the honest reason is that a transparent cache shows only in time, which no browser check here measures. If the planner reads that as no class at all, the pin is a candidate for deletion instead, which is a call, not this table's.
11. **Overlaps with other 2h areas (no decision, coordination):** rows ER5.a2 and ER5.c red AK5 and AK3 (the kit sheets' agent); ER5.a3 reds LC's mount-class claim (the engine-hooks agent), which BR9 now also holds; house-style's archivist label and the kit's Glass and fog are not designed here.
12. **Selections follow the suite rules:** `broadside`, `render` and `runninghead` each stand alone (none in `NEEDS_PREDECESSOR`; `runninghead` does not follow `home`), and none pulls in `render` beyond RDW1's own.
13. **Nothing here is a DECISION for Alex** beyond item 1's measurement, which is Issue #600's to use.


# Appendix B

## Issue #779 part 2h, area K: the kit across the rooms, and the house and motion sheets

Drawn at `origin/main` `2b148100` by the area-K design agent, read-only. Every `find` below was counted with node (`t.split(f).length - 1`) at `2b148100` and occurs exactly once in its file; the rows are generated, and every find recounted on the tree, by a script that is not archived (its first count flagged two finds at 2, AK7.c1 and AK7.c2, which were lengthened to 1). Every expected `FAIL` set is a prediction from the code; `?` in a note marks a member the implementer confirms locally before the send (the row's `measureFirst`). The check ids are the planner's finals: RH25 to RH32 (`runninghead`), P34 and P35 (`cards`), G9 and G10 (`glass-ceremony`), SB15 (`specimen`), H21 (`home`); each is free across `e2e/` today (the highest in use: RH24, P33, G8, SB14, H20, read by a script that is not archived). Revised after the plan skeptic: no HELD-DATA row (RH32 holds what the built-page test read), RH29 walks the CSSOM as well as the printed page, and P7's wait is exact.

Files cited by alias: AT `public/atelier.css`, HO `public/house.css`, MO `public/motion.css`, LC `public/living-chart.css`.

## A. The tests

### `test/site/atelier-kit.test.ts`

**AK2** (line 22) "AK2 every room wears the fog through the kit; every stage room wears the vignettes, the Gallery none (its captions scroll, #464)"
- AK2.a every room (the eleven `src/pages/**/index.astro` but home: SHELLED's ten and the Portfolio) wears the fog pair: NEW RH32. (The built-page test "the kit's lifted shapes ..." reads it too; it is no holder, ruling 4.)
- AK2.b every chart room (the eight, the Portfolio among them) wears the vignette pair: NEW RH32.
- AK2.c the Gallery wears none: NEW RH32, and RH22 (`e2e/suites/runninghead/gallery.ts:154`, `.vignette` in its furniture list).
- AK2.d home wears no fog: NEW RH32.
- "through the kit" (the component, not a paste): AK1's class, retired by ruling 6; it leaves on 2f call 11's precedent (a pasted copy renders the same). No row.
- Fate: leaves whole.

**AK3** (line 32) "AK3 every chart room stands the Glass and the chart folio from the kit; the Explorer alone names its cluster for glass.ts"
- AK3.a every chart room stands the Glass: NEW RH32.
- AK3.b every chart room stands the chart folio with [class, id] lines: NEW RH32.
- AK3.c the Explorer's cluster is `id="zoom-controls"`: NEW RH32 (the id read literally, the name `glass.ts` and the suites bind).
- AK3.d home stands the camera as `id="lf-controls"`: NEW RH32.
- AK3.e the Gallery stands no Glass: HELD, RH22 (its `furniture` list holds `.zoomery` and must be empty), and NEW RH32 (the same absence, read beside the rest).
- "from the kit": AK1's class, as AK2. No row.
- Fate: leaves whole.

**AK4** (line 53) "AK4 the kit's shapes: the fog and vignette pairs, the Glass with data-zoom on every press, the chart folio's [class, id] lines, the stage's gesture box and after-slot, the road out"
- AK4.a the fog pair, each an empty aria-hidden div, side by side: NEW RH32.
- AK4.b the vignette pair, likewise: NEW RH32.
- AK4.c the Glass group (the kit's four classes, its id, role group, label Camera): NEW RH32.
- AK4.d each press's id, class, type, data-zoom, label and text glyph (three presses): NEW RH32. Three rows, one field each.
- AK4.e in, out, the whole sheet, in that order: NEW RH32.
- AK4.f no keys slip, no engraved glyph, no tooltip: NEW RH32 (the group's element children are exactly the three presses; each press's `title` attribute and svg count read), three rows. A keys slip planted in `Glass.astro` beside the group (outside it) is the retired slip, which AK7's kept retire pin reads for (D below), so AK4 needs no 2i claim of its own.
- AK4.g the chart folio's corner div wears `chrome corner bl folio`: NEW RH32.
- AK4.h a line is a bare `<p>` with its class and id: NEW RH32 (each line's attribute names, less the `style` Today's `dryIn` writes, are exactly `class` and `id`).
- AK4.i ChartStage: (i1) stage > sheet#sheet > the gesture box (tabindex 0, role application, labelled for its room) > #map, the noscript notice in the stage: NEW RH32; (i2) the page's face in the default slot inside #map: NEW RH25; (i3) the after slot inside the stage, after the sheet: NEW RH25 (with RH26 and RH32, which lose the pill and the noscript there).
- AK4.j the road: (j1) the room span closing the anchor, (j2) the data-road stamp, (j3) the gold class: NEW RH32 (every road's tag, classes, data-road, href's path and its two spans in order, against a literal roster per room); j1 and j3 red RH22 too (the Gallery's one road).
- Fate: leaves whole.

**AK5** (line 119) "AK5 the stage is lifted where the skeleton is one shape (the Print Room, the Prospect, the Ribbon); the three unique skeletons stay in their pages"
- AK5.a the three rooms render ChartStage's skeleton: NEW RH32 (the chain and the gesture box's attributes on each); "takes it from the kit" is AK1's class (no row).
- AK5.b the Explorer's sheet has its leaf (`.sheet-inner#sheet-inner` between the sheet and the gesture box): NEW RH25.
- AK5.c the Reading Room's gesture box is empty as authored: HELD, RR38 (`e2e/suites/reading-room/room.ts:62,75`, scripts off, `childElementCount` 0).
- AK5.d Today's sheet rides inside #map: HELD, HG6 (`e2e/suites/hunt/room.ts:16-30`, #map's children exactly `["DIV#sheet.sheet"]`).
- Fate: leaves whole.

**AK6** (line 111) "AK6 the kit's glass-keys.ts binds every [data-zoom] press on the page, document-wide, which is why vellum/explorer-no-glass-keys keeps the Explorer and home, each binding its own presses by id, off it"
- The one assertion: `querySelectorAll<HTMLElement>("[data-zoom]")` in `src/site/shared/glass-keys.ts`, message "the kit's binding reads every data-zoom press on the page".
- AK6.a every `[data-zoom]` press is bound, each of in, out, fit. The presses the suites make today, read in `e2e/`: PB14, RB14, PR39 and RR40 a real press on `#zoom-in` through `ZOOM_IN` (`e2e/suites/print-room/print.ts:29`); HG5 a real press on `#zoom-in` in Today, a glass-keys room (`src/site/seed-of-the-day/app.ts:12,67`); PR34 `#zoom-in` by `.click()` (`e2e/suites/print-room/atlas.ts:209`), not a real press; CD21 `[data-zoom="in"]` by `.click()`; `homeCamera`'s `#zoom-reset` `.click()` (`print.ts:41`) is an unasserted cleanup; SB13 real presses on `#zoom-in` and `#zoom-reset`. So in HELD by SB13 (and the others); fit HELD by SB13 (`e2e/suites/specimen/desktop.ts:318-334`, a real press on `#zoom-reset` at 323 in the Specimen, a glass-keys room, its settle throwing inside its step when the press goes nowhere); out NEW `SB15` (no suite presses a glass-keys room's `#zoom-out`: `grep -rn "zoom-out" e2e/` finds RR38's and PR36's markup reads, home's reach read in `e2e/suites/home/stations.ts:58` and landfall's press in `e2e/suites/landfall/controls.ts:237`, both on home, which binds its presses by id). Three rows.
- "document-wide": the regex has no `document.` anchor, so `viewport.querySelectorAll` leaves the unit test green (2e call 4); it is not this assertion's claim. CD21, SB13 and every `ZOOM_IN` press would read it anyway (the Glass stands outside `#map-viewport`).
- AK6.b the premise `vellum/explorer-no-glass-keys` rests on: a witness for part 2i (the brief), class (e).
- Fate: stays whole for 2i, renamed (D).

**AK7** (line 140) "AK7 the camera's press is home's face everywhere (#505, ruled 2026-09-02): 2.2rem square in the body face at 1.1rem, the house's rounding kept, the mockup's ease; the keys slip is gone from the kit"
- AK7.a 2.2rem square: width HELD, G1 (`e2e/suites/glass-ceremony.ts:66-104`, `size` within 0.5 of 35.2); height NEW `G9`.
- AK7.b the body face at 1.1rem, line-height 1: NEW `G9` (three rows).
- AK7.c parchment on chart ink at 0.5, a 1px line-tan border: NEW `G9` (three rows).
- AK7.d no border-radius (the house's rounding): HELD, G1 (`radius === "4px"`); no padding, no flex: NEW `G9` (each against a plain house button probed in the same `.zoomery`).
- AK7.e the mockup's ease (`transition: background 0.2s ease, color 0.2s ease`): DEAD, the existing PR #861 row in `handbook/errata/site.md` (motion.css's `button:not(.lf-station):not(.place-hit)` sets `transition` at (0,2,1) over `.zoom-btn`'s (0,1,0)); the pin leaves, the row gains a clause (E).
- AK7.f the hover and focus arm four classes deep, ink-dark under parchment-bright: NEW `G10` (five rows: background, colour, the hover arm, the focus arm, the depth).
- AK7.g no `zoom-keys` in the kit's sheet: 2I (b), a retired class.
- AK7.h no `zoom-keys`, `.lf-btn`, `.lf-controls`, `lf-in`, `lf-out`, `lf-home` in `Glass.astro`, `public/index.css`, `src/site/home/app.ts`, `src/pages/index.astro`: 2I (b), retired names.
- Fate: shrinks to AK7.g and AK7.h (D).

### `test/site/room.test.ts`

**RT2** (line 19) "the room folio's panel is painted screen-only (#538): on paper the corner goes static and in flow, and an absolute panel on a static corner resolved against the whole page (e2e RH10c and SB9b pin the resolved value)"
- Anchors, not claims (Gate 1: finding the anchor is part of the read): the screen block exists; at least one painting rule exists; the sweep reaches the Gallery's generated sheet and the shell sheet.
- RT2.a the painting rule that gives the folio panel its content sits inside `@media screen`: HELD, RH10c (`e2e/suites/runninghead/gallery.ts:72`) and SB9b (`e2e/suites/specimen/print.ts`); also `RH29` (it prints the Gallery in the sweep).
- RT2.b no sheet but the kit paints a tr or folio-room pseudo (every `public/**/*.css`, `src/**/*.astro`, `src/cli/*.ts`), in any state: NEW `RH29`, two reads on every printed page: the printed DOM (the corner and its whole subtree read for `::before`/`::after` content, in the state the sweep leaves) and a CSSOM walk (every rule outside `@media screen` that would give such a pseudo content, whatever state its selector scopes it to: the zoomed Glass's and `body.stage-under`'s arms are never in force at the sweep's 1280 wide window, `stage-under` being set by `src/site/shared/room.ts:55`). Two rows: a plant in force (RT2.b), and a plant scoped to `stage-under` that only the walk sees (RT2.d).
- RT2.c every kit rule giving that pseudo content stands inside the screen block: NEW `RH29`.
- Fate: leaves whole.

**RT4** (line 110) "the kit gives the stage's status pill its fade, keyed to the class so every chart room's pill wears it (#547)"
- RT4.a the base rule `body.chart-room .stage .status` carries `transition: opacity 0.45s`, the length `src/site/shared/announce.ts` waits out: NEW `RH26` (every chart room's pill, against `SAY_FADE_MS`); CD23 and CD24 read two rooms already.
- RT4.b each fade arm sets opacity 0: NEW `RH26` (and CD23, CD24).
- RT4.c the base rule keyed to the class, so every room's pill wears it: NEW `RH26` (an id key leaves the Print Room's, the Prospect's, the Ribbon's, the Specimen's and the Reading Room's pills undressed).
- RT4.d no fade arm keyed to an id: the id arm REPLACING the class arm NEW `RH26`; an id arm BESIDE the class arm changes nothing served: 2I (e).
- RT4.e each fade arm scoped to `body.chart-room .stage`: an arm broadened (`.status.fading`) hides nothing more, since every `.status` stands in a chart room's stage (the PR #835 row's measurement): 2I (e).
- Fate: shrinks to RT4.d's beside form and RT4.e (D).

### `test/site/house-style.test.ts`

**HS2** (line 21) "the archivist's label, two tiers (#324 decision 5, candidate B)"
- HS2.a the label tier `.archivist-label` (0.72rem, 0.1em, 400, uppercase, ink-faded), five pins: DEAD. Verified: `git grep -n "archivist-label" -- . ':!handbook'` finds it only in `public/house.css`, this test and the `design/` mockups; no page, layout, site script, `src/cli` or `src/atlas` composer writes the class. E row 1.
- HS2.b the head tier `.archivist-head` (0.82rem, 0.18em, 600, uppercase, ink-faded): NEW `RH27` on the Explorer's `#grp-land` (five rows). `.broadside .panel-head` sets only `margin`, and `.slip`'s ink-dark is inherited, so the class decides.
- Fate: leaves whole.

**HS3** (line 36) "the control idiom: cream, 1.5px ink-dark, 4px, one primary (#324)"
- HS3.a the base rule's background control-cream: NEW `RH28` (the Explorer's `#type` select, which nothing but the house dresses: `.broadside .l-ctl > select` sets only flex and min-width).
- HS3.b the base rule's border 1.5px solid ink-dark: NEW `RH28`, CONDITIONAL on probe P1 (Chromium may snap a 1.5px border to 1px at DPR 1). Two rows: width, colour.
- HS3.c radius 4px: NEW `RH28` (G1 reads the zoom press's 4px too).
- HS3.d font size 0.95rem: NEW `RH28`.
- HS3.e `button.primary` background ink-dark and HS3.f its lettering chart-paper: NEW `RH28` on the Specimen's `#sb-report` (the slip foot's primary, which no kit or page rule overrides). The census put this on the Explorer, whose one primary, `#draw`, wears the kit's gold (`.folio-controls .primary` at (0,2,0) outranks `button.primary` at (0,1,1)).
- HS3.g `button.primary:hover` background ink-press: DEAD. The house wash `button:not(.lf-station):not(.place-hit):hover` is (0,3,1) and outranks `button.primary:hover` (0,2,1) on every primary; the kit's (`.corner.tr .folio-controls .primary:hover`, 0,4,0) and home's overrides outrank both. CONDITIONAL on probe P2. E row 2 (with a sibling defect).
- HS3.h `a.control` takes no underline: DEAD. `git grep` finds no `<a ... class="control">` and no script writing one; E row 3.
- HS3.i the hover excludes the engine's hit targets (`:not(.place-hit):hover` in HO): HELD, P15 (`e2e/suites/cards/overlay.ts:279-302`, a real hover on the capital's hit reads its background `rgba(0, 0, 0, 0)`; the `.place-hit` reset at (0,1,0) loses to an unexcluded wash at (0,2,1)).
- Fate: leaves whole.

**HS4** (line 53) "the focus ring: 2px ink-dark, everywhere (#324 decision 6)"
- HS4.a the house ring `outline: 2px solid var(--ink-dark)`: colour HELD, RH12 (`e2e/suites/runninghead/shell.ts:251-268`, a keyboard-focused paper link on the Q & A, ink-dark); width and style NEW `RH30`. Three rows.
- HS4.b the ages range's own ring is not ink-brown: DEAD. The only wearer is the Reading Room's `input.rf-range.ages-range` (`src/site/reading-frame/index.ts:47`); HO's `:is(a, input, select, [tabindex], button:not(.place-hit)):focus-visible` is (0,2,1) and decides it over LC's `.ages-range:focus-visible` (0,2,0), with the same values. CONDITIONAL on probe P3. E row 4.
- Fate: leaves whole.

**HS5** (line 65) "the roles are worn: page markup carries the shared classes (#324)"
- HS5.a home's Draw it is a primary: NEW `RH27` (H1 on `home` reads it too).
- HS5.b home's seed input opts into the control idiom: NEW `RH27`.
- HS5.c the Gallery's count is the corner's dateline: HELD, RH22 (`dateline` read by `.folio-room .dateline`).
- HS5.d Today's hunt intro is an intro: NEW `RH27`.
- HS5.e Today's dateline is the corner's line: NEW `RH27`.
- HS5.f Today's roads are legend buttons: NEW RH32 (Today's two roads with their `data-road` stamps in its roster); "the kit's" is AK1's class.
- HS5.g the Print Room's poster plates are legend buttons: HELD, PR36 (`e2e/suites/print-room/room.ts:105,118`, each plate's `className` must be `legend-btn`).
- HS5.h Pull a proof is the room's primary: HELD, PR36 (`room.ts:40`, `BUTTON#pr-draw.primary`; 2g-plates measured PRR2.e reddening this test with PR36).
- HS5.i the Broadside's group heads are standing heads: NEW `RH27` (the same read as HS2.b).
- HS5.j the Q & A's count is the corner's dateline: NEW `RH27` (document-rooms' count read on lane D would red too; not used).
- HS5.k the Glossary's find box opts into the idiom: NEW `RH27`.
- Fate: leaves whole.

### `test/site/shell-css.test.ts`

**SC3** (line 125) "motion.css declares each raise/press token once, at its ratified value (#405)"
- SC3.a each of `--raise: -2px`, `--press: 1px`, `--raise-shadow: 0 6px 16px <chart ink 0.2>`, `--press-shadow: 0 1px 3px <chart ink 0.14>` at its value: NEW `P34` (a plain button's hover and press read against the ratified literals). Four rows.
- SC3.b each declared once: 2I (c).
- Fate: shrinks to SC3.b (D).

**SC4** (line 137) "the plate dress rests flat and tips on hover (#130, the consumer is now print-room)"
- The `.plate` base rule's existence is the anchor.
- SC4.a rests flat (no resting rotate): NEW `H21` (home's shelf plates; never `#pp-plate` or `#rb-plate`, Issue #514).
- SC4.b tips (rotate) and lifts (translateY) under the hand: NEW `H21`. Two rows.
- Fate: leaves whole. (The name's "the consumer is now print-room" is stale: the wearers are home's shelf, `#pp-plate` and `#rb-plate`.)

**SC5** (line 168) "each lifting surface consumes ITS token, not just a token (#405)"
- SC5.a the plain button's hover lifts by `--raise`, SC5.b casts `--raise-shadow`, SC5.c its press sinks by `--press`, SC5.d casts `--press-shadow`: NEW `P34`.
- SC5.e `.rooms a:hover` lifts by `--raise`: NEW `RH31`.
- SC5.f `body:has(.room-name) .wordmark a:hover` lifts by `--raise`: HELD, RH13 (`e2e/suites/runninghead/shell.ts:307-318`, `tipped` needs the matrix's f below 0; `--press` gives +1).
- SC5.g `.pc-prospect:hover` lifts by `--raise`: NEW `P35`.
- Fate: leaves whole.

## B. The new checks (14)

Common to all: each is its own `step(...)`; reads null-safe (an absent element is a sentinel, never a throw); a press or hover premise waits about a second for its effect and then reads what stands, so a dead gesture FAILs rather than stops; every colour through `PAGE_RGBA` and `nearRgba` against `tokenRgba` (SITE_PALETTE); every function under 50 code lines; every change undone in a `finally`; every regex inside an `evaluate` template literal written with its backslashes doubled (Gate 2 item 5).

### Runninghead (lane B): the sweep gathers, steps judge

`rhSweep` (`e2e/suites/runninghead/heads.ts:24`) gains, after its two `shoot` lines, `kits[route] = await kitRead(k, route)` and returns `kits` beside `heads`, `shells`, `unreachable` (+3 lines). `kitRead` (in the new `e2e/suites/runninghead/room.ts`) parks the mouse at (1, 1) with `Input.dispatchMouseEvent mouseMoved`, evaluates `KIT_READ` (screen), then, on every route but `/`, sets `Emulation.setEmulatedMedia {media: "print"}`, evaluates `PRINTED_READ` (the printed DOM and the CSSOM walk in one payload), and resets `{media: ""}` in a `finally`; it throws nothing of its own (no settle, no wait). `run` (`e2e/suites/runninghead.ts`) destructures `kits` and gains one line after the `for ... await step(name, now(read))` loop (line 75): `await kitChecks(ctx, step, k, kits);`. `kitChecks` first gathers the Portfolio, which `SHELLED` leaves out, unstepped as the sweep is: `kits[PORTFOLIO] = (await k.visit("/explorer/portfolio/")) ? await kitRead(k, "/explorer/portfolio/") : undefined` (neither call throws; an unreached Portfolio is a missing entry that RH29 and RH32 fail on by name). That one visit serves both checks (RH29 no longer visits in its own step). Then it runs RH25 to RH32 in order as steps. `run` stays under 50 code lines.

`KIT_READ` (one payload, every route):
- `skeleton: { kids: [...stage.children].map((c) => c.tagName + (c.id ? "#" + c.id : "")) (null with no stage), leaf: !!querySelector(".stage > #sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map"), face: (".stage > #sheet.sheet > #map-viewport > #map")?.childElementCount ?? null }`;
- `pill` for `.stage > p.status` (null if absent): `{ prop: transitionProperty, ms: parseFloat(transitionDuration) * 1000 (read first), rest, faded }`, rest and faded read with `style.transition = "none"`, the page's own `fading` noted, removed (rest read), added (faded read), the original class state put back and the opacity read once more BEFORE `style.transition = ""` is restored, so no transition starts;
- `roles`: for each selector of `ROLE_SELECTORS` present on the page, `{ family, style, size, caps, spacing, weight, transform, color: rgba, bg: rgba, bw, bs, bc: rgba, radius, width }` from `getComputedStyle` (`size`, `spacing`, `width` as numbers). `ROLE_SELECTORS`: `#seed-form button[type=submit]`, `#seed-input`, `.hunt-intro`, `#dateline`, `.folio-room .dateline`, `#grp-land`, `.find input[type=search]`, `#type`, `#sb-report`;
- `rem: parseFloat(root fontSize)`; `before: getComputedStyle(.corner.tr, "::before").content` or null;
- `kit` (RH32's): `fog` and `vignettes`, each `{ items: [...querySelectorAll(".fog" | ".vignette")].map((e) => [e.tagName, e.className, e.getAttribute("aria-hidden"), e.childNodes.length]), adjacent: the items are two and the first's nextElementSibling is the second }`; `glass` for `.zoomery` (null if absent): `{ classes: [...classList], id, role, label: aria-label, presses: [...children].map((b) => [b.tagName, b.id, b.className, b.getAttribute("type"), b.getAttribute("data-zoom"), b.getAttribute("aria-label"), b.textContent.trim(), b.getAttribute("title"), b.querySelectorAll("svg").length]) }`; `folio` for `.corner.bl` (null if absent): `{ classes: [...classList], lines: [...children].map((p) => [p.tagName, p.getAttributeNames().filter((n) => n !== "style").sort().join(","), p.id, p.classList[0] ?? ""]) }` (Today's `dryIn` writes `style` and adds `drying` at runtime, `src/site/seed-of-the-day/app.ts:72-76`); `gesture` for `.stage > #sheet.sheet > #map-viewport`: `[tabindex, role, aria-label]` or null; `noscript: !!querySelector(".stage > noscript")`; `roads: [...querySelectorAll("a.legend-btn")].map((a) => [a.id, [...a.classList], a.getAttribute("data-road"), new URL(a.getAttribute("href") ?? "", location.href).pathname, [...a.children].map((s) => [s.tagName, s.className, s.id])])` (the pathname, since the rooms rewrite their roads' addresses at runtime).

`PRINTED_READ` (under print, every route but `/`):
- `dom`: the `.corner.tr` and every element under it, each with `::before` and `::after`; `null` if there is no corner, else `{ offenders: [[path, pseudo, content]] }` for each content other than `"none"`;
- `walk`: every sheet of `document.styleSheets`, counted in `sheets`; one whose `cssRules` throws is skipped and counted in `unreadable`; every rule visited recursively (into a `CSSMediaRule`, any grouping rule with `cssRules`, a style rule's nested `cssRules`, and a `CSSImportRule`'s `styleSheet`), carrying whether an ancestor `@media`'s `media.mediaText` is screen-only (`/^(only )?screen( and .*)?$/i`); a `CSSStyleRule` whose `selectorText` matches `/:{1,2}(before|after)\b/i` and `/\.(tr|folio-room)\b/i` (any case) and whose `style.getPropertyValue("content")` is neither empty nor `none` counts in `kitArms` when inside a screen-only block and is an offender `[sheet href or "inline", selectorText, content]` otherwise. Its blind spots, each erring toward missing a panel: a sheet the page does not load (none of the eleven printed pages nor the Portfolio links it), a rule a script inserts after the read, and a nested rule that reaches the corner through `&` rather than naming it.

- **RH25** "the kit's stage stands one shape where a room takes it, and the Explorer's sheet keeps its leaf" (`room.ts`, step 1 of `kitChecks`; judges the sweep, no navigation). Asserts: on `/explorer/` `leaf` true; on each of `/print-room/`, `/prospect/`, `/ribbon/`, `/specimen/` `face >= 1`, `kids[0] === "DIV#sheet"`, and `kids[1]` the room's pill (`P#pr-status`, `P#pp-status`, `P#rb-status`, `P#sb-status`). No `finally` (reads only). About 30 code lines with `KIT_READ`'s skeleton part. CI about 0.3 s (in the sweep). Holds AK4.i2, AK4.i3, AK5.b.
- **RH26** "every chart room's status pill fades: an opacity transition the announcer's own length, at rest 1 and 0 under the class" (`dress.ts`, step 2). Asserts on `/explorer/`, `/print-room/`, `/prospect/`, `/ribbon/`, `/reading-room/` (the frame's `p.rf-status.status`, appended to the stage by `src/site/reading-room/seats.ts:27`), `/seed-of-the-day/`, `/specimen/`: pill present, `prop` lists `opacity`, `Math.round(ms) === SAY_FADE_MS` (imported from `src/site/shared/announce.ts`, 450), `rest === "1"`, `faded === "0"`. About 25 lines. Holds RT4.a to RT4.d (replacing form), AK4.i3 (with RH25 and RH32).
- **RH27** "the house roles are worn where the pages author them" (`dress.ts`, step 3). Asserts (rem from the read): `/` Draw it background `control-gold` and face `DISPLAY_FACE`; `/` `#seed-input` width within 0.05 of 6.2 rem and background `chart-ink` at 0.45; `/seed-of-the-day/` `.hunt-intro` italic, face `^"IM Fell English",` (export `FLOURISH_FACE` from `runninghead/reads.ts`), colour `ink-brown`; `/seed-of-the-day/` `#dateline` and `/faq/` `.folio-room .dateline` each `small-caps`, size within 0.05 of 0.85 rem, colour `parchment`; `/explorer/` `#grp-land` size within 0.05 of 0.82 rem, spacing within 0.05 of 0.18 x 0.82 rem, weight `"600"`, transform `uppercase`, colour `ink-faded`; `/glossary/` `.find input[type=search]` width within 0.05 of 11 rem and background `chart-ink` at 0.45. About 40 lines. Holds HS2.b, HS5.a, b, d, e, i, j, k.
- **RH28** "the control idiom as the house dresses a plain control and a plain primary" (`dress.ts`, step 4). Asserts: `/explorer/` `#type` background `control-cream`, `bw === "1.5px"` (CONDITIONAL P1), `bs === "solid"`, `bc` `ink-dark`, `radius === "4px"`, size within 0.05 of 0.95 rem; `/specimen/` `#sb-report` background `ink-dark`, colour `chart-paper`. About 20 lines. Holds HS3.a to HS3.f.
- **RH29** "on paper no room paints its folio's panel, in the state it stands in or in any other, and the screen still does where the kit says so" (`gestures.ts`, step 5; judges the gathered reads, no navigation of its own). Asserts, on every route of `SHELLED` but `/` and on the Portfolio: a printed read present; `dom` non-null with no offender; `walk.offenders` empty, `walk.unreadable === 0`, `walk.kitArms >= 1` (the witness that the walk reached the kit's own screen arms, in the sheet every shelled page links, RH18); and the same-run control: the sweep's screen read on `/gallery/` has `before === '""'` (the kit's stageless arm in force). About 40 lines (`PRINTED_READ` about 25 more). CI about 1 s over the sweep's eleven print reads and the Portfolio's (the visit itself is shared with RH32). Holds RT2.a (with RH10c), RT2.b, RT2.c, RT2.d (the walk alone).
- **RH30** "the house ring is 2px and solid on a keyboard-focused paper link" (`gestures.ts`, step 6). Visits `/faq/`; a Shift keyDown and keyUp (`Input.dispatchKeyEvent`, RH12's idiom), then in one evaluate `.sheet a` focused, `{visible: matches(":focus-visible"), width: outlineWidth, style: outlineStyle}`, blurred. Asserts visible, `width === "2px"`, `style === "solid"`. `finally`: blur the active element. About 20 lines, CI about 1 s. Holds HS4.a width and style.
- **RH31** "a nav link rises by the house raise under the hand" (`gestures.ts`, step 7). Visits `/faq/`; reads the first `header.chrome nav.rooms a:not([aria-current])` centre and `elementFromPoint` witness; a real `mouseMoved` there; polls up to about 1 s (every 50 ms) for `matches(":hover")` and `getAnimations().length === 0`, then reads `getComputedStyle(a).transform` as it stands and, in the same evaluate, a probe `div` with `style.transform = "translateY(var(--raise))"` appended to `body`, read and removed. Asserts witness, hovered, the link's matrix f equals the probe's f and is not 0. `finally`: mouse to (1, 700). About 30 lines, CI about 1.2 s. Holds SC5.e.
- **RH32** "the kit's lifted shapes render one shape in every room that wears them: the fog, the vignettes, the Glass, the chart folio's lines, the stage, every road out" (`room.ts`, step 8; judges the sweep's and the Portfolio's `kit`, no navigation of its own). Rooms: `FOG_ROOMS` = `SHELLED` but `/`, and the Portfolio (eleven); `CHART_ROOMS` = `/explorer/`, `/print-room/`, `/reading-room/`, `/seed-of-the-day/`, `/prospect/`, `/ribbon/`, `/specimen/` and the Portfolio (eight); `STAGED` = `/print-room/`, `/prospect/`, `/ribbon/`, `/specimen/` and the Portfolio, each with its gesture box's label as a literal (the five labels of `STAGES`, `test/site/astro-scaffold.test.ts:848-857`). Asserts:
  - the fog: on each of `FOG_ROOMS`, `items` exactly `[["DIV","fog a","true",0],["DIV","fog b","true",0]]` and `adjacent`; on `/` no `.fog` at all;
  - the vignettes: on each of `CHART_ROOMS`, `[["DIV","vignette top","true",0],["DIV","vignette bottom","true",0]]` and `adjacent`; on `/gallery/` none;
  - the Glass: on each of `CHART_ROOMS` and `/`, `classes.slice(0, 4)` is `chrome, corner, br, zoomery` (home's app adds `on` after them), `id` is `zoom-controls` on the Explorer, `lf-controls` on home and empty elsewhere, `role` `group`, `label` `Camera`, and `presses` exactly `[["BUTTON","zoom-in","zoom-btn","button","in","Draw nearer","+",null,0], ["BUTTON","zoom-out","zoom-btn","button","out","Stand off","−",null,0], ["BUTTON","zoom-reset","zoom-btn","button","fit","The whole sheet","⌂",null,0]]`; on `/gallery/` no Glass;
  - the chart folio: on each of `CHART_ROOMS`, `classes.slice(0, 4)` is `chrome, corner, bl, folio`, at least one line, every line `["P", "class,id", a non-empty id, a non-empty first class]`, the first line's id and first class `folio-title`;
  - the stage: on each of `STAGED`, `gesture` is `["0", "application", <its label>]` and `noscript` true;
  - the roads: on every route and the Portfolio, `roads` equal a literal roster (the eight entries of `ROADS`, `test/site/astro-scaffold.test.ts:860-882`, written with each href's path: the Explorer `[order-plates, gold, /print-room/]`, `[journal-link, gold, /reading-room/]`; the Print Room `[pr-explorer, gold, /explorer/]`; the Portfolio `[pf-explorer, gold, /explorer/]`; the Prospect `[pp-chart-link, gold, /explorer/]`, `[pp-ribbon-link, /ribbon/, verb pp-ribbon-verb]`; the Ribbon `[rb-chart-link, gold, /explorer/]`, `[rb-prospect-link, /prospect/, verb rb-prospect-verb]`; Today `[road explorer, /explorer/]`, `[road reading-room, /reading-room/]`; the Gallery `[gold, /explorer/]`; the Specimen `[/explorer/]`, `[gold, /gallery/]`; every other route none), each road's classes beginning `legend-btn` with `gold` present exactly where the roster says, its `data-road` the roster's or null, and its children exactly `[["SPAN","verb",<verb id or "">],["SPAN","room",""]]`.
  About 110 code lines (the rosters about 40, the judge split by part of the page into helpers under 50 lines). CI about 0.2 s (it judges the sweep; the Portfolio's visit, about 1.5 s, is shared with RH29). Holds AK2.a to d, AK3.a to e, AK4.a to h, i1, i3, j1 to j3, AK5.a, HS5.f.

Files: `e2e/suites/runninghead/room.ts` (new: `KIT_READ`, `kitRead`, `kitChecks`, RH25, RH32; about 210 code lines), `dress.ts` (new: RH26, RH27, RH28; about 100), `gestures.ts` (new: `PRINTED_READ`, RH29, RH30, RH31; about 145); `heads.ts` +3, `runninghead.ts` +2, `reads.ts` one `export`. Suite time: about +7 s on CI (lane B has about 112 s of room).

### Cards (lane A)

`e2e/suites/cards.ts`'s `run` is exactly 50 code lines (45 to 94). Its lines 70 and 71 (the Escape dispatch and `await pCardShot(ctx, pm);`) become one line, `await pShotThenLifts(ctx, step, pm);`, defined in the new `e2e/suites/cards/gestures.ts`: the same Escape dispatch, `await pCardShot(ctx, pm)`, then `await step("P34", ...)` and `await step("P35", ...)`. `run` falls to 49 lines.

- **P34** "a plain button rises by the house raise and casts the raise shadow under the hand, and sinks by the house press with the press shadow under a held press, at the ratified values" (on the Explorer at seed 42, the page the suite stands on after `pCardShot`). `DRAW` payload on `#draw` (the folio's Draw; the kit dresses only its colours, motion.css its lift): centre, `elementFromPoint` witness, `hover`, `active`, `anims` (`getAnimations().length`), `t` (transform), `shadow` (`SHADE` after `PAGE_RGBA`). Sequence: mouse to (5, 5) and read rest; `mouseMoved` to the centre, poll up to about 1 s for hover and anims 0, read; `mousePressed` (`button: "left", buttons: 1`), poll for active and anims 0, read; `mouseMoved` to (5, 5) with `buttons: 1` and `mouseReleased` there (the click lands on the common ancestor, not `#draw`, so nothing redraws). Asserts: witness; rest `t === "none"`; hovered `t === "matrix(1, 0, 0, 1, 0, -2)"`, shadow geometry `"0px 6px 16px 0px"`, colour `chart-ink` at 0.2; pressed `t === "matrix(1, 0, 0, 1, 0, 1)"`, geometry `"0px 1px 3px 0px"`, colour `chart-ink` at 0.14. `finally`: `mouseReleased` at (5, 5) if still held, mouse to (5, 5), blur. About 45 lines, CI about 1 s. Holds SC3.a, SC5.a to SC5.d. CONDITIONAL on P6.
- **P35** "the card's Prospect road rises by the house raise under the hand" Wiring, not the gesture under test: the capital's card is pinned by `hit.click()` (P8's form; a real press can open a neighbour, Issue #750), said at the check. Then a poll up to about 2 s on `#place-card` shown and `.pinned` and `.pc-inner`'s `getAnimations()` non-empty with every entry `finished` (the settle doctrine's unfurl rule); read `.pc-prospect`'s centre and an `elementFromPoint` witness (the link or inside it); one `mouseMoved` there; poll up to about 1 s for the link's `:hover` and `getAnimations().length === 0`; read its `transform` and, in the same evaluate, the `translateY(var(--raise))` probe. Asserts: pinned at rest, witness, hovered, the link's f equals the probe's f and is not 0. `finally`: mouse to (5, 5), blur, the Escape keydown event (`RESET`'s form). About 45 lines, CI about 1.5 s. Holds SC5.g.

File: `e2e/suites/cards/gestures.ts` (new, about 110 code lines). Suite time about +2.5 s.

### Glass ceremony (lane A)

`glass-ceremony.ts` is 359 code lines, so the two checks live in a new `e2e/suites/glass-ceremony/` folder; `run` gains `await step("G9", ...)` and `await step("G10", ...)` right after `await g1Cluster(k);` (the Explorer at seed 42, camera home) and two imports.

- **G9** "the camera's press wears home's face at rest: 2.2rem tall, the body face at 1.1rem on a line of 1, parchment on chart ink at 0.5 inside a line-tan hairline, and the house's own padding and display" (`glass-ceremony/dress.ts`). Mouse to (5, 5), blur, then one evaluate on `#zoom-in`: `h` (box height), `family`, `size`, `lineHeight`, `color`, `bg`, `bw`, `bs`, `bc`, `pad: [paddingTop, paddingLeft]`, `display`, plus two probes made and removed in the same evaluate: a `span` with `style.fontFamily = "var(--font-body)"` on `body` (its family) and a plain `button` appended to `#zoom-controls` (its padding and display). Asserts: `h` within 0.5 of 2.2 rem; `family` equals the probe's; size within 0.05 of 1.1 rem; `parseFloat(lineHeight)` within 0.05 of 1.1 rem; colour `parchment`; background `chart-ink` at 0.5; `bw === "1px"`, `bs === "solid"`, `bc` `line-tan`; padding equals the probe button's; display equals the probe button's. No state changed but the parked mouse. About 40 lines, CI about 0.3 s. Holds AK7.a height, AK7.b, AK7.c, AK7.d padding and display. CONDITIONAL on P4.
- **G10** "the camera's press goes dark under the hand and under keyboard focus, four classes deep against the house wash" (`glass-ceremony/gestures.ts`). Reachability: the first of `#zoom-in`'s centre and four inner points (25% and 75% of each axis) whose `elementFromPoint` is the press (the drawer tab can cover part of it); FAIL with the hits if none. `mouseMoved` there; poll up to about 1 s for `:hover` and `getAnimations().length === 0`; read `bg`, `color`. Mouse to (5, 5). Shift keyDown/keyUp, `#zoom-in.focus()`, read `matches(":focus-visible")`, `bg`, `color`, blur. Asserts: hover bg `ink-dark` and colour `parchment-bright`; focus visible, bg `ink-dark`, colour `parchment-bright`. `finally`: mouse to (5, 5), blur. About 40 lines, CI about 0.8 s. Holds AK7.f.

Files: `e2e/suites/glass-ceremony/dress.ts`, `gestures.ts` (new, about 45 code lines each). Suite time about +1 s.

### Specimen (lane C)

- **SB15** "the Glass's out press answers a real press in a room the kit's key binder binds" (new `e2e/suites/specimen/gestures.ts`; `specimen.ts`'s `run` gains `await step("SB15", () => outPress(k));` after the SB13 step). Clears the emulated features; polls up to about 1.5 s for `st.zoomed` false (SB13's `finally` glides home), reads `before`; a real press (`pressAt` from `e2e/suites/print-room/kit.ts`) on `#zoom-in`'s centre, its `elementFromPoint` witness taken first; polls up to about 1.5 s for `zoomed` true; a real press on `#zoom-out`'s centre (witness likewise); polls up to about 1.5 s for `zoomed` false; reads as it stands. Asserts: witnesses, `before` not zoomed, leaned, then home again. `finally`: `k.setState("rest")`, mouse to (1, 1). About 40 lines, CI about 1.5 s. Holds AK6.a out. CONDITIONAL on P5.

### Home (lane C)

- **H21** "home's shelf plates rest flat and, under the hand, tip and rise" (new `e2e/suites/home/gestures.ts`, `homeGestures(ctx, k)` making its own `makeStep`; `home.ts`'s `run` gains one last line `await homeGestures(ctx, k);` after `h19Floor`). Inside the step: `clearMetrics(ctx, 640, 800)` (h19Floor's 640x800 cleared by `clearMobile`, waited back here), then `makeSettle(ctx)<number>("innerWidth", (w) => w === 1280, "home-gestures-wide")` (the harness window's own width; it throws inside H21's step, so a window that never comes back fails H21 by name), `Emulation.setEmulatedMedia {features: []}`, mouse to (1, 1), `document.querySelector(".lf-shelf-grid .plate").scrollIntoView({block: "center"})`; poll up to about 2 s for the plate's rect equal across two reads with `getAnimations().length === 0` and not hovered; read `t` (rest); `elementFromPoint` witness at its centre; `mouseMoved` there; poll up to about 1.5 s for hovered and anims 0; read `t`. Asserts: witness; rest `t === "none"`; hovered matrix with `|b| > 0.001` and `f < 0`. `finally`: mouse to (1, 1), `window.scrollTo(0, 0)`. About 45 lines, CI about 2 s. Holds SC4.a, SC4.b. CONDITIONAL on P7.

Lane totals: A about +3.5 s (cards, glass-ceremony), B about +7 s (runninghead), C about +3.5 s (specimen, home), D nothing.

## C. The rows

Selections: `runninghead` alone; `cards` and `glass-ceremony` each pull in `render` (no render check reads a Glass press or a button lift: `e2e/suites/render.ts` has no `zoom-btn`, `#draw`, `boxShadow` or mouse read); `hunt,print-room` for PR36; `specimen`, `home`, `reading-room`, `hunt` alone. The `edits` cell is the row's JSON edit list, applied in order. Unit codes (files and exact names in the JSON): AK2 to AK7 are `test/site/atelier-kit.test.ts`'s tests as named in A; LIFT = `test/site/astro-scaffold.test.ts` "the kit's lifted shapes render one shape on every page that wears them: the fog, the vignettes, the Glass, the chart folio's lines, the stage, every road out (#487)"; ROADNAME = the same file's "every road out names its destination by that route's name in the tree (Issue #668)"; ER5 = `test/site/explorer-room.test.ts` "ER5 the sheet stays the Glass's gesture box, so a bookmark's cx/cy stay sheet fractions; the Glass stands at the chart's corner outside it"; RT2, RT4 `test/site/room.test.ts`; HS2 to HS5 `test/site/house-style.test.ts`; SC3 to SC5 `test/site/shell-css.test.ts`. Every find counts 1. The rows that were HELD-DATA (AK2.a to d, AK3.a to d, the sixteen of AK4, AK5.a, HS5.f) keep their ids and unit blocks and now name RH32 on `runninghead`; three of their edits changed so the page lives under them: AK3.b (a hand-made folio for the dropped component, since every room's app writes `folio-title`), AK3.c (renamed on both sides, since `glass.ts` binds the cluster) and AK4.g (`folio` dropped rather than `bl`, since `src/site/shared/room.ts` seats by `.corner.bl`). Other areas' checks that would red on some of these (BR9 on the Explorer's roads and presses, PR36 and RR38 on their rooms' Glass, HG6) are not named, since none runs on `runninghead`.

### AK2

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK2.a | `[{"file":"src/pages/faq/index.astro","find":"<Fog />","replace":""}]` | AK2; LIFT | `runninghead` | RH32 | BITES | the Q & A's fog pair gone |
| AK2.b | `[{"file":"src/pages/prospect/index.astro","find":"<Vignettes />","replace":""}]` | AK2; LIFT | `runninghead` | RH32 | BITES |  |
| AK2.c | `[{"file":"src/pages/gallery/index.astro","find":"import Fog from \"../../layouts/Fog.astro\";","replace":"import Fog from \"../../layouts/Fog.astro\";\nimport Vignettes from \"../../layouts/Vignettes.astro\";"},{"file":"src/pages/gallery/index.astro","find":"<Fog />","replace":"<Fog />\n<Vignettes />"}]` | AK2; LIFT | `runninghead` | RH22, RH32 | BITES | RH22's furniture holds `.vignette`; GR1's source order and GR6's sheet read stay green |
| AK2.d | `[{"file":"src/pages/index.astro","find":"import Glass from \"../layouts/Glass.astro\";","replace":"import Glass from \"../layouts/Glass.astro\";\nimport Fog from \"../layouts/Fog.astro\";"},{"file":"src/pages/index.astro","find":"    <Glass id=\"lf-controls\" />","replace":"    <Glass id=\"lf-controls\" />\n    <Fog />"}]` | AK2; LIFT | `runninghead` | RH32 | BITES, measure first | unit `?`: other AST home tests (their order markers carry no fog) |

### AK3

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK3.a | `[{"file":"src/pages/prospect/index.astro","find":"<Glass />","replace":""}]` | AK3; LIFT | `runninghead` | RH32 | BITES | `bindGlassKeys` finds no press and throws nothing |
| AK3.b | `[{"file":"src/pages/prospect/index.astro","find":"<ChartFolio lines={[[\"folio-title\", \"folio-title\"], [\"folio-sub\", \"folio-sub\"], [\"folio-coords\", \"pp-pressed\"]]} />","replace":"<div class=\"chrome corner bl\"><p class=\"folio-title\" id=\"folio-title\"></p><p class=\"folio-sub\" id=\"folio-sub\"></p><p class=\"folio-coords\" id=\"pp-pressed\"></p></div>"}]` | AK3; LIFT | `runninghead` | RH32 | BITES | a hand-made folio without the kit's `folio` class: the app finds its three ids and lives, `room.ts` seats by `.corner.bl` |
| AK3.c | `[{"file":"src/pages/explorer/index.astro","find":"<Glass id=\"zoom-controls\" />","replace":"<Glass id=\"zoom-cluster\" />"},{"file":"src/site/explorer/app.ts","find":"cluster: $(\"zoom-controls\")","replace":"cluster: $(\"zoom-cluster\")"}]` | AK3; ER5; LIFT | `runninghead` | RH32 | BITES | renamed on both sides: `glass.ts` calls `addEventListener` on the cluster, so a dropped id stops the Explorer's boot |
| AK3.d | `[{"file":"src/pages/index.astro","find":"<Glass id=\"lf-controls\" />","replace":"<Glass />"}]` | AK3; LIFT | `runninghead` | RH32 | BITES | home's app reads `#lf-controls` through `?.` |
| AK3.e | `[{"file":"src/pages/gallery/index.astro","find":"import LegendButton from \"../../layouts/LegendButton.astro\";","replace":"import LegendButton from \"../../layouts/LegendButton.astro\";\nimport Glass from \"../../layouts/Glass.astro\";"},{"file":"src/pages/gallery/index.astro","find":"</BaseLayout>","replace":"<Glass />\n</BaseLayout>"}]` | AK3 | `runninghead` | RH22, RH32 | BITES | `.zoomery` joins RH22's furniture and RH32's no-Glass read; RH10c to RH10e print it as none |

### AK4

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK4.a | `[{"file":"src/layouts/Fog.astro","find":"<div class=\"fog b\" aria-hidden=\"true\"></div>","replace":"<div class=\"fog b\"></div>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | census mutation |
| AK4.b | `[{"file":"src/layouts/Vignettes.astro","find":"<div class=\"vignette bottom\" aria-hidden=\"true\"></div>","replace":"<div class=\"vignette bottom\"></div>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES |  |
| AK4.c | `[{"file":"src/layouts/Glass.astro","find":"id={id} role=\"group\" aria-label=\"Camera\">","replace":"id={id} aria-label=\"Camera\">"}]` | AK4; LIFT | `runninghead` | RH32 | BITES |  |
| AK4.d1 | `[{"file":"src/layouts/Glass.astro","find":"data-zoom=\"in\" aria-label=\"Draw nearer\">+</button>","replace":"aria-label=\"Draw nearer\">+</button>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | in's data-zoom; no runninghead check presses it |
| AK4.d2 | `[{"file":"src/layouts/Glass.astro","find":"aria-label=\"Stand off\">&minus;","replace":"aria-label=\"Step back\">&minus;"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | out's label |
| AK4.d3 | `[{"file":"src/layouts/Glass.astro","find":"aria-label=\"The whole sheet\">&#8962;</button>","replace":"aria-label=\"The whole sheet\">&#8592;</button>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | fit's glyph |
| AK4.e | `[{"file":"src/layouts/Glass.astro","find":"  <button id=\"zoom-in\" class=\"zoom-btn\" type=\"button\" data-zoom=\"in\" aria-label=\"Draw nearer\">+</button>\n  <button id=\"zoom-out\" class=\"zoom-btn\" type=\"button\" data-zoom=\"out\" aria-label=\"Stand off\">&minus;</button>","replace":"  <button id=\"zoom-out\" class=\"zoom-btn\" type=\"button\" data-zoom=\"out\" aria-label=\"Stand off\">&minus;</button>\n  <button id=\"zoom-in\" class=\"zoom-btn\" type=\"button\" data-zoom=\"in\" aria-label=\"Draw nearer\">+</button>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | in and out swapped |
| AK4.f1 | `[{"file":"src/layouts/Glass.astro","find":"aria-label=\"Draw nearer\">+</button>","replace":"aria-label=\"Draw nearer\" title=\"Draw nearer\">+</button>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | a tooltip |
| AK4.f2 | `[{"file":"src/layouts/Glass.astro","find":"aria-label=\"Draw nearer\">+</button>","replace":"aria-label=\"Draw nearer\"><svg width=\"10\" height=\"10\"></svg></button>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | an engraved glyph |
| AK4.f3 | `[{"file":"src/layouts/Glass.astro","find":"  <button id=\"zoom-reset\"","replace":"  <p class=\"zoom-keys\">+ &minus; 0</p>\n  <button id=\"zoom-reset\""}]` | AK4; AK7; LIFT | `runninghead` | RH32 | BITES | a keys slip in the group; AK7 reads `Glass.astro` too |
| AK4.g | `[{"file":"src/layouts/ChartFolio.astro","find":"<div class=\"chrome corner bl folio\">","replace":"<div class=\"chrome corner bl\">"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | `folio` dropped, not `bl`: `src/site/shared/room.ts:44,92` seat the room by `.corner.bl` |
| AK4.h | `[{"file":"src/layouts/ChartFolio.astro","find":"<p class={cls} id={id}></p>","replace":"<p class={cls} id={id} aria-live=\"polite\"></p>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES |  |
| AK4.i1 | `[{"file":"src/layouts/ChartStage.astro","find":"tabindex=\"0\" role=\"application\" aria-label={label}>","replace":"tabindex=\"0\" aria-label={label}>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | RH25 reads children, not attributes |
| AK4.i2 | `[{"file":"src/layouts/ChartStage.astro","find":"<div id=\"map\">\n    <slot />\n  </div></div></div>","replace":"<div id=\"map\"></div></div></div>\n    <slot />"}]` | AK4 | `runninghead` | RH25 | BITES, measure first | `?` RH8: no page script is expected to throw on a face outside `#map` (each finds its face by id); AST stays green |
| AK4.i3 | `[{"file":"src/layouts/ChartStage.astro","find":"  <slot name=\"after\" />\n</div>","replace":"</div>\n<slot name=\"after\" />"}]` | AK4 | `runninghead` | RH25, RH26, RH32 | BITES | the four ChartStage rooms' pill and noscript leave `.stage` (and the Portfolio's, which RH32 reads too) |
| AK4.j1 | `[{"file":"src/layouts/LegendButton.astro","find":"<span class=\"room\">{room}</span></a>","replace":"<span class=\"place\">{room}</span></a>"}]` | AK4; ROADNAME | `runninghead` | RH22, RH32 | BITES | RH22's road `room` reads empty; LIFT's `roadOpening` stops at the verb and stays green |
| AK4.j2 | `[{"file":"src/layouts/LegendButton.astro","find":"data-road={road} href={href}>","replace":"href={href}>"}]` | AK4; LIFT | `runninghead` | RH32 | BITES | Today's stamps |
| AK4.j3 | `[{"file":"src/layouts/LegendButton.astro","find":"class={gold ? \"legend-btn gold\" : \"legend-btn\"}","replace":"class={gold ? \"legend-btn\" : \"legend-btn\"}"}]` | AK4; LIFT | `runninghead` | RH22, RH32 | BITES | RH22's `gold` |

### AK5

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK5.a | `[{"file":"src/pages/ribbon/index.astro","find":"<ChartStage label=\"The scroll. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.\">","replace":"<div class=\"stage\">\n  <div class=\"sheet\" id=\"sheet\"><div id=\"map-viewport\" tabindex=\"0\" aria-label=\"The scroll. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.\"><div id=\"map\">"},{"file":"src/pages/ribbon/index.astro","find":"  <Fragment slot=\"after\">","replace":"  </div></div></div>\n  <Fragment>"},{"file":"src/pages/ribbon/index.astro","find":"</ChartStage>","replace":"</div>"}]` | AK5; LIFT | `runninghead` | RH32 | BITES | a room authoring its own stage with one difference (no role); RH25's children and face stay as they were |
| AK5.b | `[{"file":"src/pages/explorer/index.astro","find":"<div class=\"sheet-inner\" id=\"sheet-inner\">","replace":"<div class=\"sheet-leaf\" id=\"sheet-inner\">"}]` | AK5; ER5 | `runninghead` | RH25 | BITES | one edit: `verso.ts` looks the class up only on a flip back, which runninghead never makes |
| AK5.c | `[{"file":"src/pages/reading-room/index.astro","find":"0 shows the full sheet.\"></div></div>","replace":"0 shows the full sheet.\"><div class=\"rf-ghost\"></div></div></div>"}]` | AK5 | `reading-room` | RR38 | BITES, measure first | `?` others: `seats.ts:26` appends the chart after the ghost, so `#map-viewport > .rf-chart` still matches |
| AK5.d | `[{"file":"src/pages/seed-of-the-day/index.astro","find":"<div id=\"map\"><div id=\"sheet\" class=\"sheet\"></div></div>","replace":"<div id=\"map\"><div class=\"sheet-wrap\"><div id=\"sheet\" class=\"sheet\"></div></div></div>"}]` | AK5 | `hunt` | HG6 | BITES, measure first | `?` others: the wrapper hugs the sheet as `#map`'s one flex item |

### AK6

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK6.a1 | `[{"file":"src/site/shared/glass-keys.ts","find":"querySelectorAll<HTMLElement>(\"[data-zoom]\")","replace":"querySelectorAll<HTMLElement>(\"[data-zoom=in]\")"}]` | AK6 | `specimen` | SB13, SB15 | BITES | 2e call 4's narrowing |
| AK6.a2 | `[{"file":"src/site/shared/glass-keys.ts","find":"querySelectorAll<HTMLElement>(\"[data-zoom]\")","replace":"querySelectorAll<HTMLElement>(\"[data-zoom=in], [data-zoom=fit]\")"}]` | AK6 | `specimen` | SB15 | BITES | out alone dead |
| AK6.a3 | `[{"file":"src/site/shared/glass-keys.ts","find":"querySelectorAll<HTMLElement>(\"[data-zoom]\")","replace":"querySelectorAll<HTMLElement>(\"[data-zoom=in], [data-zoom=out]\")"}]` | AK6 | `specimen` | SB13 | BITES | fit alone dead; `setState("rest")` glides home directly, so SB15 starts home |

### AK7 (AT `public/atelier.css`)

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| AK7.a1 | `[{"file":"public/atelier.css","find":"  width: 2.2rem;\n  height: 2.2rem;","replace":"  width: 2.4rem;\n  height: 2.2rem;"}]` | AK7 | `glass-ceremony` | G1 | BITES | G1's 35.2 |
| AK7.a2 | `[{"file":"public/atelier.css","find":"  width: 2.2rem;\n  height: 2.2rem;","replace":"  width: 2.2rem;\n  height: 2.4rem;"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.b1 | `[{"file":"public/atelier.css","find":"  height: 2.2rem;\n  font-family: var(--font-body,","replace":"  height: 2.2rem;\n  font-family: var(--font-display,"}]` | AK7 | `glass-ceremony` | G9 | BITES | the value changed: a deleted line would inherit the body face through the house's `font-family: inherit` |
| AK7.b2 | `[{"file":"public/atelier.css","find":"  font-size: 1.1rem;\n  line-height: 1;","replace":"  font-size: 1.2rem;\n  line-height: 1;"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.b3 | `[{"file":"public/atelier.css","find":"  font-size: 1.1rem;\n  line-height: 1;","replace":"  font-size: 1.1rem;\n  line-height: 1.2;"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.c1 | `[{"file":"public/atelier.css","find":"  font-size: 1.1rem;\n  line-height: 1;\n  color: var(--parchment);","replace":"  font-size: 1.1rem;\n  line-height: 1;\n  color: var(--parchment-bright);"}]` | AK7 | `glass-ceremony` | G9 | BITES | census mutation |
| AK7.c2 | `[{"file":"public/atelier.css","find":"  line-height: 1;\n  color: var(--parchment);\n  background: rgb(from var(--chart-ink) r g b / 0.5);","replace":"  line-height: 1;\n  color: var(--parchment);\n  background: rgb(from var(--chart-ink) r g b / 0.6);"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.c3 | `[{"file":"public/atelier.css","find":"  border: 1px solid var(--line-tan);\n  cursor: pointer;","replace":"  border: 1px solid var(--line-faint);\n  cursor: pointer;"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.d1 | `[{"file":"public/atelier.css","find":"  width: 2.2rem;\n  height: 2.2rem;","replace":"  width: 2.2rem;\n  height: 2.2rem;\n  border-radius: 6px;"}]` | AK7 | `glass-ceremony` | G1 | BITES | G1's `4px` |
| AK7.d2 | `[{"file":"public/atelier.css","find":"  width: 2.2rem;\n  height: 2.2rem;","replace":"  width: 2.2rem;\n  height: 2.2rem;\n  padding: 0;"}]` | AK7 | `glass-ceremony` | G9 | BITES |  |
| AK7.d3 | `[{"file":"public/atelier.css","find":"  width: 2.2rem;\n  height: 2.2rem;","replace":"  width: 2.2rem;\n  height: 2.2rem;\n  display: flex;"}]` | AK7 | `glass-ceremony` | G9 | BITES | G1's glyph and width read stay green |
| AK7.f1 | `[{"file":"public/atelier.css","find":".zoomery.corner .zoom-btn:focus-visible {\n  background: var(--ink-dark);","replace":".zoomery.corner .zoom-btn:focus-visible {\n  background: var(--ink-brown);"}]` | AK7 | `glass-ceremony` | G10 | BITES |  |
| AK7.f2 | `[{"file":"public/atelier.css","find":".zoomery.corner .zoom-btn:focus-visible {\n  background: var(--ink-dark);\n  color: var(--parchment-bright);","replace":".zoomery.corner .zoom-btn:focus-visible {\n  background: var(--ink-dark);\n  color: var(--parchment);"}]` | AK7 | `glass-ceremony` | G10 | BITES |  |
| AK7.f3 | `[{"file":"public/atelier.css","find":".zoomery.corner .zoom-btn:hover,","replace":""}]` | AK7 | `glass-ceremony` | G10 | BITES | the hover arm gone: the house wash paints parchment-bright |
| AK7.f4 | `[{"file":"public/atelier.css","find":".zoomery.corner .zoom-btn:hover,\n.zoomery.corner .zoom-btn:focus-visible {","replace":".zoomery.corner .zoom-btn:hover {"}]` | AK7 | `glass-ceremony` | G10 | BITES | the focus arm gone |
| AK7.f5 | `[{"file":"public/atelier.css","find":".zoomery.corner .zoom-btn:hover,","replace":".zoom-btn:hover,"}]` | AK7 | `glass-ceremony` | G10 | BITES | (0,2,0) loses to the wash's (0,3,1) |

### RT2 and RT4 (RMT)

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| RT2.a | `[{"file":"public/atelier.css","find":"  body:has(#map-viewport.zoomed) .corner.tr::before,","replace":"}\n@media all {\n  body:has(#map-viewport.zoomed) .corner.tr::before,"}]` | RT2 | `runninghead` | RH10c, RH29, RH10d, RH10e | BITES, measure first | `?` RH10d, RH10e: on paper the Gallery's absolute panel reaches past the page's edge (P8); RH29 by its printed read and its CSSOM walk; SB9b reds on `specimen` (not sent) |
| RT2.b | `[{"file":"public/print-room/index.css","find":".bind-row {","replace":".corner.tr::before {\n  content: \"\";\n}\n.bind-row {"}]` | RT2 | `runninghead` | RH29 | BITES | an empty inline pseudo with no box: nothing moves on screen |
| RT2.c | `[{"file":"public/atelier.css","find":"  --folio-w: 19rem;","replace":"  --folio-w: 19rem;\n}\n.folio-room::after {\n  content: \"\";"}]` | RT2 | `runninghead` | RH29 | BITES | a kit painting rule outside the wrap; RH10c reads `::before` only |
| RT2.d | `[{"file":"public/ribbon/index.css","find":".journey {","replace":"body.stage-under .corner.tr::before {\n  content: \"\";\n}\n.journey {"}]` | RT2 | `runninghead` | RH29 | BITES | a state-scoped plant outside the screen block: the Ribbon is never `stage-under` at the sweep's 1280 wide window, so only RH29's CSSOM walk sees it |
| RT4.a | `[{"file":"public/atelier.css","find":"  transition: opacity 0.45s var(--ease-paper);","replace":"  transition: opacity 0.3s var(--ease-paper);"}]` | RT4 | `runninghead` | RH26 | BITES | CD23, CD24 too (not sent) |
| RT4.b | `[{"file":"public/atelier.css","find":".status.fading {\n  opacity: 0;","replace":".status.fading {\n  opacity: 1;"}]` | RT4 | `runninghead` | RH26 | BITES | `0.5` would leave the unit's `opacity:\s*0` matching |
| RT4.c | `[{"file":"public/atelier.css","find":"body.chart-room .stage .status.fading {","replace":"body.chart-room .stage #status.fading {"}]` | RT4 | `runninghead` | RH26 | BITES | only the Explorer's and Today's `#status` fade |
| RT4.d | `[{"file":"public/atelier.css","find":"body.chart-room .stage .status {","replace":"body.chart-room .stage #status {"}]` | RT4 | `runninghead` | RH26 | BITES | five rooms' pills lose the whole stage dress, the transition with it |

### HS2 to HS5 (HO `public/house.css`; HST)

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| HS2.b1 | `[{"file":"public/house.css","find":"  font-size: 0.82rem;","replace":"  font-size: 0.8rem;"}]` | HS2 | `runninghead` | RH27 | BITES | census mutation |
| HS2.b2 | `[{"file":"public/house.css","find":"  letter-spacing: 0.18em;","replace":"  letter-spacing: 0.16em;"}]` | HS2 | `runninghead` | RH27 | BITES |  |
| HS2.b3 | `[{"file":"public/house.css","find":"  font-weight: 600;","replace":"  font-weight: 500;"}]` | HS2 | `runninghead` | RH27 | BITES |  |
| HS2.b4 | `[{"file":"public/house.css","find":"  font-weight: 600;\n  text-transform: uppercase;","replace":"  font-weight: 600;\n  text-transform: none;"}]` | HS2 | `runninghead` | RH27 | BITES |  |
| HS2.b5 | `[{"file":"public/house.css","find":"  font-weight: 600;\n  text-transform: uppercase;\n  color: var(--ink-faded);","replace":"  font-weight: 600;\n  text-transform: uppercase;\n  color: var(--ink-brown);"}]` | HS2 | `runninghead` | RH27 | BITES |  |
| HS3.a | `[{"file":"public/house.css","find":"  font-family: inherit;\n  font-size: 0.95rem;\n  color: var(--ink-dark);\n  background: var(--control-cream);","replace":"  font-family: inherit;\n  font-size: 0.95rem;\n  color: var(--ink-dark);\n  background: var(--parchment);"}]` | HS3 | `runninghead` | RH28 | BITES | the roles' wearers are kit- or page-dressed and stay green |
| HS3.b1 | `[{"file":"public/house.css","find":"  border: 1.5px solid var(--ink-dark);\n  border-radius: 4px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {","replace":"  border: 2.5px solid var(--ink-dark);\n  border-radius: 4px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {"}]` | HS3 | `runninghead` | RH28 | BITES, measure first | CONDITIONAL on P1; 2.5px stays distinct from 1.5px and from a 1px snap |
| HS3.b2 | `[{"file":"public/house.css","find":"  border: 1.5px solid var(--ink-dark);\n  border-radius: 4px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {","replace":"  border: 1.5px solid var(--ink-brown);\n  border-radius: 4px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {"}]` | HS3 | `runninghead` | RH28 | BITES |  |
| HS3.c | `[{"file":"public/house.css","find":"  border-radius: 4px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {","replace":"  border-radius: 6px;\n  padding: 0.4rem 0.6rem;\n}\nbutton {"}]` | HS3 | `runninghead` | RH28 | BITES | G1 reds too on `glass-ceremony` (not sent) |
| HS3.d | `[{"file":"public/house.css","find":"  font-family: inherit;\n  font-size: 0.95rem;","replace":"  font-family: inherit;\n  font-size: 1rem;"}]` | HS3 | `runninghead` | RH28 | BITES |  |
| HS3.e | `[{"file":"public/house.css","find":"button.primary {\n  background: var(--ink-dark);","replace":"button.primary {\n  background: var(--ink-press);"}]` | HS3 | `runninghead` | RH28 | BITES | home's Draw it is `.lf-seed .primary` (0,2,0) and stays gold |
| HS3.f | `[{"file":"public/house.css","find":"  color: var(--chart-paper);","replace":"  color: var(--parchment);"}]` | HS3 | `runninghead` | RH28 | BITES |  |
| HS3.i | `[{"file":"public/house.css","find":"button:not(.lf-station):not(.place-hit):hover {","replace":"button:not(.lf-station):hover {"}]` | HS3 | `cards` | P15 | BITES | P34's `#draw` takes the kit's (0,4,0) wash and stays green |
| HS4.a1 | `[{"file":"public/house.css","find":"  outline: 2px solid var(--ink-dark);","replace":"  outline: 3px solid var(--ink-dark);"}]` | HS4 | `runninghead` | RH30 | BITES | census mutation |
| HS4.a2 | `[{"file":"public/house.css","find":"  outline: 2px solid var(--ink-dark);","replace":"  outline: 2px dashed var(--ink-dark);"}]` | HS4 | `runninghead` | RH30 | BITES |  |
| HS4.a3 | `[{"file":"public/house.css","find":"  outline: 2px solid var(--ink-dark);","replace":"  outline: 2px solid var(--ink-brown);"}]` | HS4 | `runninghead` | RH12 | BITES |  |
| HS5.a | `[{"file":"src/pages/index.astro","find":"<button type=\"submit\" class=\"primary\">Draw it</button>","replace":"<button type=\"submit\">Draw it</button>"}]` | HS5 | `runninghead` | RH27 | BITES | H1 reds on `home` (not sent); AST's seed-form order markers carry no class |
| HS5.b | `[{"file":"src/pages/index.astro","find":"<input id=\"seed-input\" class=\"control\" name=\"seed\"","replace":"<input id=\"seed-input\" name=\"seed\""}]` | HS5 | `runninghead` | RH27 | BITES |  |
| HS5.c | `[{"file":"src/pages/gallery/index.astro","find":"<p class=\"dateline\">{dateline}</p>","replace":"<p>{dateline}</p>"}]` | HS5 | `runninghead` | RH22 | BITES |  |
| HS5.d | `[{"file":"src/pages/seed-of-the-day/index.astro","find":"<p class=\"hunt-intro intro\">","replace":"<p class=\"hunt-intro\">"}]` | HS5 | `runninghead` | RH27 | BITES |  |
| HS5.e | `[{"file":"src/pages/seed-of-the-day/index.astro","find":"<p class=\"dateline\" id=\"dateline\"></p>","replace":"<p id=\"dateline\"></p>"}]` | HS5 | `runninghead` | RH27 | BITES | the app writes it by id |
| HS5.f | `[{"file":"src/pages/seed-of-the-day/index.astro","find":"<LegendButton road={r.road} href={r.href}","replace":"<LegendButton href={r.href}"}]` | HS5; LIFT | `runninghead` | RH32 | BITES | Today's roads lose their `data-road` stamp |
| HS5.g | `[{"file":"src/pages/print-room/index.astro","find":"<button class=\"legend-btn\" type=\"button\" data-poster=\"chart\"","replace":"<button class=\"poster-btn\" type=\"button\" data-poster=\"chart\""},{"file":"src/pages/print-room/index.astro","find":"<button class=\"legend-btn\" type=\"button\" data-poster=\"desk\"","replace":"<button class=\"poster-btn\" type=\"button\" data-poster=\"desk\""},{"file":"src/pages/print-room/index.astro","find":"<button class=\"legend-btn\" type=\"button\" data-poster=\"wall\"","replace":"<button class=\"poster-btn\" type=\"button\" data-poster=\"wall\""},{"file":"src/pages/print-room/index.astro","find":"<button class=\"legend-btn\" type=\"button\" data-poster=\"grand\"","replace":"<button class=\"poster-btn\" type=\"button\" data-poster=\"grand\""}]` | HS5 | `hunt,print-room` | PR36 | BITES | the unit regex matches any one plate, so all four go; plates are found by `[data-poster]` |
| HS5.h | `[{"file":"src/pages/print-room/index.astro","find":"<button id=\"pr-draw\" class=\"primary\" type=\"button\">","replace":"<button id=\"pr-draw\" type=\"button\">"}]` | HS5 | `hunt,print-room` | PR36 | BITES | 2g-plates' PRR2.e precedent |
| HS5.i | `[{"file":"src/pages/explorer/index.astro","find":"<p class=\"panel-head archivist-head\" id=\"grp-land\">","replace":"<p class=\"panel-head\" id=\"grp-land\">"},{"file":"src/pages/explorer/index.astro","find":"<p class=\"panel-head archivist-head\" id=\"grp-hand\">","replace":"<p class=\"panel-head\" id=\"grp-hand\">"}]` | HS5 | `runninghead` | RH27 | BITES | one edit alone leaves the unit regex matching the other head |
| HS5.j | `[{"file":"src/pages/faq/index.astro","find":"<p class=\"dateline\">{count}</p>","replace":"<p>{count}</p>"}]` | HS5 | `runninghead` | RH27 | BITES |  |
| HS5.k | `[{"file":"src/pages/glossary/index.astro","find":"<input class=\"control\" type=\"search\"","replace":"<input type=\"search\""}]` | HS5 | `runninghead` | RH27 | BITES | the index slip finds it by `.find input` (`src/layouts/IndexSlip.astro:65`) |

### SC3 to SC5 (MO `public/motion.css`; SCT)

| row | edits | unit red | e2e | expected FAIL | kind | note |
|---|---|---|---|---|---|---|
| SC3.a1 | `[{"file":"public/motion.css","find":"  --raise: -2px;","replace":"  --raise: -3px;"}]` | SC3 | `cards` | P34 | BITES | census mutation; P35 compares against the token and stays green |
| SC3.a2 | `[{"file":"public/motion.css","find":"  --press: 1px;","replace":"  --press: 2px;"}]` | SC3 | `cards` | P34 | BITES |  |
| SC3.a3 | `[{"file":"public/motion.css","find":"  --raise-shadow: 0 6px 16px rgb(from var(--chart-ink) r g b / 0.2);","replace":"  --raise-shadow: 0 6px 16px rgb(from var(--chart-ink) r g b / 0.3);"}]` | SC3 | `cards` | P34 | BITES |  |
| SC3.a4 | `[{"file":"public/motion.css","find":"  --press-shadow: 0 1px 3px rgb(from var(--chart-ink) r g b / 0.14);","replace":"  --press-shadow: 0 1px 3px rgb(from var(--chart-ink) r g b / 0.24);"}]` | SC3 | `cards` | P34 | BITES |  |
| SC4.a | `[{"file":"public/motion.css","find":".plate {","replace":".plate {\n  transform: rotate(-0.6deg);"}]` | SC4 | `home` | H21 | BITES | a resting tip |
| SC4.b1 | `[{"file":"public/motion.css","find":"  transform: translateY(-5px) rotate(-0.6deg);","replace":"  transform: translateY(-5px);"}]` | SC4 | `home` | H21 | BITES | census mutation; the lint's TIPPING_LINKS then calls the entry stale (lint, not the runner) |
| SC4.b2 | `[{"file":"public/motion.css","find":"  transform: translateY(-5px) rotate(-0.6deg);","replace":"  transform: rotate(-0.6deg);"}]` | SC4 | `home` | H21 | BITES | no lift |
| SC5.a | `[{"file":"public/motion.css","find":".action-link:hover {\n  transform: translateY(var(--raise));","replace":".action-link:hover {\n  transform: translateY(var(--press));"}]` | SC5 | `cards` | P34 | BITES | census mutation |
| SC5.b | `[{"file":"public/motion.css","find":"  box-shadow: var(--raise-shadow);","replace":"  box-shadow: var(--press-shadow);"}]` | SC5 | `cards` | P34 | BITES |  |
| SC5.c | `[{"file":"public/motion.css","find":"  transform: translateY(var(--press));","replace":"  transform: translateY(var(--raise));"}]` | SC5 | `cards` | P34 | BITES |  |
| SC5.d | `[{"file":"public/motion.css","find":"  box-shadow: var(--press-shadow);","replace":"  box-shadow: var(--raise-shadow);"}]` | SC5 | `cards` | P34 | BITES |  |
| SC5.e | `[{"file":"public/motion.css","find":".rooms a:focus-visible {\n  transform: translateY(var(--raise));","replace":".rooms a:focus-visible {\n  transform: translateY(var(--press));"}]` | SC5 | `runninghead` | RH31 | BITES |  |
| SC5.f | `[{"file":"public/motion.css","find":"  transform: translateY(var(--raise)) rotate(-0.6deg);","replace":"  transform: translateY(var(--press)) rotate(-0.6deg);"}]` | SC5 | `runninghead` | RH13 | BITES | f = +1, so `tipped` is false under hover and focus |
| SC5.g | `[{"file":"public/living-chart.css","find":"  transform: translateY(var(--raise)) rotate(-0.6deg);","replace":"  transform: translateY(var(--press)) rotate(-0.6deg);"}]` | SC5 | `cards` | P35 | BITES | CD57 is on `chart-drawer` (not sent) |

Row count: 99 (AK2 4, AK3 5, AK4 18, AK5 4, AK6 3, AK7 16, RT2 4, RT4 4, HS2 5, HS3 8, HS4 3, HS5 11, SC3 4, SC4 3, SC5 7), every one with an e2e selection and a browser holder (no HELD-DATA row: ruling 4 of 6055743231, the plan skeptic's blocking finding): `runninghead` 63, `glass-ceremony` 16, `cards` 10, `specimen` 3, `home` 3, `hunt,print-room` 2, `reading-room` 1, `hunt` 1. Six rows are measured first (`measureFirst` in the JSON: AK2.d, AK4.i2, AK5.c, AK5.d, RT2.a, HS3.b1). No LOCAL row: no claim here is a derivation proven only by a green arm (RH26 compares against `SAY_FADE_MS` itself, so a changed constant reds it).

Machine-readable: `779-2h-rows-kit.json` (in the support folder) holds the same 99 rows, `{id, kind, edits, unit: {files, expect}, e2e: {suites, expect}, measureFirst?}`, with the unit expects as exact test names. Both were written by one generating script from one list, which counted every find on the tree (all once at `2b148100`), and a second script read this file's tables back and checked them against the JSON row for row; neither is archived.

## D. The 2i table

| file | test, as renamed | what stays | why no browser here sees it |
|---|---|---|---|
| `test/site/room.test.ts` | "the kit's fade arms stand on a chart room's stage and name no page's id (#547; kept for Issue #779 part 2i: every .status stands in a chart room's stage, so a broadened arm, or an id arm beside the class arm, changes nothing served; RH26 reads every room's fade)" | the `fades` extraction and its non-empty anchor; per arm, `body.chart-room .stage` and no `#` | (e): a selector's form that changes nothing served |
| `test/site/shell-css.test.ts` | "motion.css declares each raise/press token once (#405; kept for Issue #779 part 2i: a second declaration repeating the first changes nothing served, and P34 reads each token's ratified value)" | `css.split(`${name}:`).length - 1 === 1` for the four `RAISE_TOKENS` | (c): declared once |
| `test/site/atelier-kit.test.ts` | "AK6 the kit's glass-keys.ts reads every [data-zoom] press on the page, the premise vellum/explorer-no-glass-keys rests on (kept for Issue #779 part 2i as that rule's witness; SB13 and SB15 press what it binds)" | the one regex | (e): a lint rule's premise, which the brief hands to 2i |
| `test/site/atelier-kit.test.ts` | "AK7 the camera's keys slip and home's own camera presses stay retired (#505, ruled 2026-09-02; kept for Issue #779 part 2i: retired names; G1, G9 and G10 read the press's face)" | `doesNotMatch(css, /zoom-keys/)` on the kit's sheet; the `zoom-keys`, `.lf-btn`, `.lf-controls`, `lf-in`, `lf-out`, `lf-home` absence over `Glass.astro`, `public/index.css`, `src/site/home/app.ts`, `src/pages/index.astro` | (b): retire pins outside ruling 6's fifteen rows (2e call 5); the second also covers a keys slip planted beside the group in `Glass.astro`, which AK4 leaves to it |

Leaving whole: AK2, AK3, AK4, AK5 (`test/site/atelier-kit.test.ts`, which then keeps AK6, AK7 shrunk, AK8); RT2; HS2, HS3, HS4, HS5 (`test/site/house-style.test.ts` keeps the status colour, the notice panel and the chart quotations); SC4, SC5 (`TOKEN_CONSUMERS` goes; `rulesIn` stays for the trail test).

## E. Errata rows (`handbook/errata/site.md`, each searched first)

1. **`.archivist-label` in `public/house.css` is worn by no served element**: `git grep -n "archivist-label" -- . ':!handbook'` finds the rule, `test/site/house-style.test.ts` and the `design/` mockups only (no page, layout, site script, `src/cli` or `src/atlas` composer writes it), so its five declarations paint nothing; Issue #779 part 2h deletes HS2's five label pins (dead CSS is an errata row, not a pin: 2g's frozen plan call 7, 2g-plates call 24) and the rule stays for whoever deletes it.
2. **`button.primary:hover`'s `background: var(--ink-press)` in `public/house.css` never decides**: the house wash `button:not(.lf-station):not(.place-hit):hover` in the same sheet is (0,3,1) against its (0,2,1), and the kit's `.corner.tr .folio-controls .primary:hover` (0,4,0) and home's `.lf-seed .primary:hover` (0,3,0, itself under the wash, at the same parchment-bright) cover the rest; HS3's pin goes. **Sibling defect found, not fixed**: an un-overridden house primary (the Print Room's Bind the atlas and Print, `#pr-bind` and `#pr-print`; the Specimen's Empty the pill, `#sb-report`) washes to parchment-bright under the hand while its lettering stays chart-paper: by the token hexes #f2e8cf on #fff7e4, about 1.14:1. Read from the rules, not run (P2 measures it). An appearance: F says what to do.
3. **`a.control` and `a.control:hover` in `public/house.css` are worn by no served element**: no `<a ... class="control">` in `src/` and no script writes one; HS3's `text-decoration: none` pin goes, the rules stay.
4. **`.ages-range:focus-visible` in `public/living-chart.css` never decides**: its only wearer is the Reading Room's `input.rf-range.ages-range` (`src/site/reading-frame/index.ts:47`), whose ring `:is(a, input, select, [tabindex], button:not(.place-hit)):focus-visible` in `public/house.css` sets at (0,2,1) against its (0,2,0), with the same 2px solid ink-dark and 2px offset; HS4's pin goes. CONDITIONAL on P3.
5. **PR #861's row on the dead `.zoom-btn` transition** (and the dice's, the primary's, `.rf-play`'s, `.rf-pace button`'s) gains a clause: Issue #779 part 2h deleted AK7's pin on the `.zoom-btn` transition. No new row.

## F. Probes and doubts

Probes the implementer runs on the built `dist/` before the send (each read-only; outcomes fixed here):
- **P1 (HS3.b1)**: on `/explorer/`, `getComputedStyle(document.getElementById("type")).borderTopWidth`. `"1.5px"`: keep RH28 as designed. `"1px"` (Chromium snapped it at DPR 1): the width read moves out of the sweep into its own read under `Emulation.setDeviceMetricsOverride {width: 1280, height: 800, deviceScaleFactor: 2}` inside RH28's step, cleared through `clearMetrics`, expecting `"1.5px"`; if it still reads 1px there, HS3.b1 goes to 2i as a value no browser read here can tell from 1px, and the row is dropped.
- **P2 (HS3.g, E row 2)**: on `/specimen/`, a real `mouseMoved` onto `#sb-report`, then its `backgroundColor` and `color`. Parchment-bright background: DEAD confirmed and the sibling defect measured (record the contrast). `ink-press`: the claim is live and joins RH28 as a hover read (one more `step` on the Specimen), with the row `button.primary:hover {\n  background: var(--ink-press);` to `var(--ink-dark)`.
- **P3 (HS4.b, E row 4)**: on `/reading-room/`, append `<style>.ages-range:focus-visible{outline:2px solid rgb(255,0,0)}</style>` to `head`, Shift key, focus `.rf-range`, read `outlineColor`, remove the style. Ink-dark: DEAD confirmed. Red: the claim is live; a focus read of `.rf-range` joins RH30 on the Reading Room, with the row `.ages-range:focus-visible {\n  outline: 2px solid var(--ink-dark);` to `var(--ink-brown)` (find counted then).
- **P4 (G9)**: unmutated, `#zoom-in`'s padding and display equal the probe button's (`6.4px`/`9.6px`, `"block"` expected) and `lineHeight` is a px string; a mismatch means a rule this design did not see dresses the press, and is read before the check is written.
- **P5 (SB15)**: unmutated, one in then one out leaves `__vellumSpecimenState().zoomed` false (`1.4 * (1 / 1.4)` is exactly 1 in JS and `isHome` drops `.zoomed`). If it stays true, the check reads `lensRest` from `e2e/suites/print-room/print.ts` (k back to 1) instead.
- **P6 (P34)**: unmutated, `#draw` reads `:active` while held, and the release at (5, 5) draws nothing (the status line stays empty and `#seed` unchanged). If Chromium drops `:active` or a draw fires, the press read releases on `#draw` behind a capture-phase `click` listener on `window` that stops propagation (installed and removed in the step).
- **P7 (H21)**: unmutated after `h19Floor`, the first shelf plate hit-tests to itself at its centre once scrolled into view, and a resting cursor at (1, 1) leaves it untipped. The window's width is settled inside H21's step, not probed: after `clearMetrics(ctx, 640, 800)`, a `makeSettle` on `innerWidth` until it reads 1280 (label `home-gestures-wide`). If the plate is covered, aim at the first of five inner points that hit-tests to it.
- **P8 (RT2.a)**: RH10d and RH10e in the expected set are predicted from RH10c's own message (the printed panel resolves against the whole page); run the row locally on `runninghead` and name exactly what reds.
- **P9 (the sweep)**: RH25 to RH29 and RH32 judge data gathered in the unstepped `rhSweep` and `kitChecks`' Portfolio read, where the lint forbids a wait and a throw would stop RH0 to RH24 on a read that is not their claim's, so: (a) `runninghead` unmutated twice, local and on CI's Chrome, every RH check and all eight new checks green, which also settles RH32's runtime assumptions (home's Glass gains only `on` after the kit's four classes, Today's folio lines only `style` and `drying`, no script adds an `a.legend-btn` or a class to a road's spans) and RH29's walk (`unreadable` 0 and `kitArms` at least 1 on every printed page; a cross-origin sheet would make `unreadable` 1, and the assertion then names it rather than skipping it silently) (the media reset in `finally` before the next route; the pill read's restore starting no transition); (b) the Reading Room's pill is in the stage when the sweep reads it: read from the code, `seatFrame` runs at `src/site/reading-room/app.ts:68`, at module top before the first `await` (line 387), so it is seated by `readyState` complete; CONDITIONAL: if the sweep finds no `.stage > p.status` there, that one pill is read inside RH26's own step after a bounded wait on `/reading-room/` instead; (c) AK4.i3 run locally on `runninghead` to prove `KIT_READ` and `PRINTED_READ` stay null-safe (a sentinel, no throw) when the ChartStage rooms' stage loses its pill.
- **P10 (AK4.i2, AK5.c, AK5.d)**: run each locally on its selection and name every extra red before the send (the `?` members).

Doubts, one line each:
1. The census put the house primary's read on the Explorer; the Explorer's `#draw` wears the kit's gold, so HS3.e and HS3.f are read on the Specimen's `#sb-report` (a call, not a decision).
2. **For Alex**: the house primary under the hand (E row 2's sibling defect) is an appearance: on 2g-reading's Issue #859 precedent the lane files an issue (searched first) and fixes nothing here; whether the cure is the house wash excluding `.primary` or the primary's hover outranking the wash is his.
3. AK2, AK3, AK5 and HS5's "through the kit" halves leave as AK1's retired class (2f call 11), with only what they render held by data; open to overrule.
4. SC4 is hosted in `home` (lane C), the suite that reads the shelf, as the brief asked; `runninghead` (which already hovers home's wordmark) would make each SC4 proof job about a sixth as long, and is the alternative if send time matters.
5. AK6's "document-wide" is in its name but not its assertion (no `document.` anchor); it leaves with the test's other words for 2i's witness and needs no row.
6. RT2's unit sweep reads every sheet on disk; RH29's walk reads every sheet the eleven printed pages and the Portfolio load, in every state its rules scope, so a sheet no such page links (none today), a rule inserted after the read and a nested `&` rule are its blind spots, each erring toward missing.
7. HS2's label tier and HS3's `a.control` are DEAD only while no page wears the class; a future wearer lands unpinned, which errata rows 1 and 3 say.
8. The brief named `cards` for the control idiom; the base idiom and the house primary are read in runninghead's sweep instead, since it already stands on the Explorer (`#type`) and on the Specimen (`#sb-report`) at no extra visit, and the Explorer carries no house primary; `cards` keeps the lifts (P34 on `#draw`, P35 on the card's road) and P15's hover exclusion.
9. `test/site/atelier-kit.test.ts`, `test/site/house-style.test.ts` and `test/site/room.test.ts` each lose their one over-long function (AK4's, HS5's, RT2's), so their `max-lines-per-function` entries leave `eslint-suppressions.json` and `LIST_AT_REFORMAT` in `test/repo/lint-config.test.ts` is lowered for each; nothing new joins.
10. RH32's roster and its five stage labels are literal copies of `ROADS` and `STAGES` in `test/site/astro-scaffold.test.ts` (the PR #502 skeptic's rule: a roster taken from the source it checks is circular); a new road or ChartStage room owes RH32's roster a line, and an unlisted road on a room reds RH32 by name.
11. Three of the former HELD-DATA rows changed their edits so the page lives (AK3.b a hand-made folio, AK3.c renamed on both sides, AK4.g `folio` dropped rather than `bl`); each still reds its unit test and `test/site/astro-scaffold.test.ts`'s lifted-shapes test as before.
12. RH32 reads its rooms with scripts on, so a planted `style` attribute on a folio line (the one attribute a room's script writes there) is its blind spot, erring toward missing; the authored-markup reads with scripts off stay RR38's, PR36's and PB16's in their rooms.


# Appendix C

## Issue #779 part 2h, area L: the engine's shared sheet and the chart mounts

Design table drawn read-only at `origin/main` `2b148100` by the area-L design agent, under the 2h design brief (`779-2h-design-brief.md`). Scope: `test/site/living-chart-css.test.ts` LC1, LC2, LC3, LC5, LC6, LC7, LC8 (LC4 is 2i's and is not designed here, though several rows below red it and name it) and `test/site/shell-css-ground.test.ts` SG3, SG4, SG5.

How the numbers were got, so the planner can re-run them:
- **Every find is counted once** by a script that is not archived: node splits the file at `2b148100` on the find and counts the parts; every find below reads 1, the shell.css token line and the LC3.d1 and LC3.d2 find (`z-index: 1;`) included.
- **Every unit set is computed, not guessed**, for the files a replica can run: a replica script that is not archived copies each assertion of LC1 to LC8, SG3 to SG5, ER5, ER6 (`test/site/explorer-room.test.ts`), house-style's ages-range ring test, shell-css's TOKEN_CONSUMERS test and its token-declaration test's `--stage-shadow` half, applies each row's edits to the text in memory, and lists the tests that throw. Control: all green. `test/site/place-card-clamp.test.ts` runs the engine under the shim and is NOT replicated: its six reds on LC7.w and LC7.x are read from its assertions and marked `?` (the implementer measures them, as the brief asks). `test/repo/sheet-owners.test.ts` and `test/repo/sheet-tokens.test.ts` lint plants through `eslint.lintText`, never the live sheets, so no edit here reaches them; no other unit file names the tokens these edits touch (grep of `test/` for `pc-tongue`, `pc-roots`, `--pc-nx`, `--pc-ny`, `--pc-dx`, `--pc-dy`, `style.left`, `flip-h`, `extraCss`, `#sheet`, `stage-shadow`, `rf-chart svg`, `reading-frame.css`, `reading-room/index.css`, `explorer/index.css`).
- **Seed facts** come from a script that is not archived (the engine's own `generateWorld(defaultRecipe(seed))` and `buildPlaceManifest(world, 1500)`, run in node, writing nothing): seed 42 has 26 places; its capital Laukuwelua (idx 0, nx 0.510, ny 0.410, once Haitani) wears flip-h; its first ruin is Laihoanui (idx 19); the four variants count 7 unflipped, 10 flip-h, 4 flip-v, 5 flip-h.flip-v. Seed 4294967295 (cards' `NARROW_SEED`) has 26 places; Kralgov (idx 23, nx 0.496, ny 0.325) is unflipped.
- **Selections**: `cards` pulls in `render` (`INHERITS_HARNESS_PAGE`); `zoom`, `render`, `room-ink`, `reading-room`, `room-instrument` run alone. None needs a predecessor or opens on home. Each row's expected set is exact for its own selection; a check in another suite that would also red on the same edit is named in the row's note where it is known.
- **Why most card rows run on `zoom`, not `cards`**: the zoom suite's geometric block (Z1 to Z16) runs with the semantic redraft off, on seed 42, with no pointer-travel checks; the cards suite's hold group (P28 to P33) presses card links and travels town to card, so any card that moves or loses pointer events reds P28 and P31b unpredictably. The card reads that need no pointer travel (seats, clamp, dress, a press under a card) live in `zoom`; the one that needs `NARROW_SEED`'s covered towns at 1024 lives in `cards`.

## A. The tests

### `test/site/living-chart-css.test.ts` LC1, "the shared sheet dresses every engine-emitted hook (#302)", line 65

The premise `assert.ok(css.length > 0, ...)` is the reader's anchor (the file's `read` returns "" on a missing file, so it guards a vacuous pass: Gate 7), not a claim of its own; it leaves with the test. The 31 hook claims, each "the sheet dresses <hook>", proven by renaming that hook's OWN rule (the first rule the roster string names) so it matches nothing:

| claim | hook | disposition |
|---|---|---|
| LC1.a | `.place-overlay {` | HELD by P3 (`e2e/suites/cards/overlay.ts:67`) |
| LC1.b | `.place-hit {` | HELD by Z8b (`e2e/suites/zoom/camera.ts:150`), with NEW Z22 and Z27 red beside it |
| LC1.c | `.place-hit::after` | NEW Z22 (the resting ring's content and size) |
| LC1.d | `#place-card {` | NEW Z24, Z25, Z26, Z27 (on `cards` P20, P21, P23, P26, P27 red too, existing holders; F19) |
| LC1.e | `#place-card[hidden]` | DEAD (E1) |
| LC1.f | `#place-card.pinned.pc-scrolls .pc-inner` | HELD by P20 (`e2e/suites/cards/cap.ts:80`) and P26 (`cap.ts:111`) |
| LC1.g | `#place-card.flip-h` | NEW Z24 |
| LC1.h | `#place-card.flip-v` | NEW Z24 |
| LC1.i | `.pc-inner` | NEW Z26, with Z24, 4, 6 on their rest witnesses (on `cards` P14 holds it as an existing check, among a wide set; F19) |
| LC1.j to LC1.s | `.pc-name`, `.pc-rank`, `.pc-founded`, `.pc-former`, `.pc-tongue`, `.pc-roots`, `.pc-tale`, `.pc-acts`, `.pc-prospect`, `.pc-lay` | NEW Z26 (existing holders elsewhere: CD57 in `chart-drawer` reads `.pc-acts`' flex and gap and `.pc-lay`'s gold; P28 and P31b in `cards` red when `.pc-prospect` loses its pointer-events; not sent, F19) |
| LC1.t | `.place-overlay.scrub .place-hit` | HELD by RR11b (`e2e/suites/reading-room/scrub.ts:25`) |
| LC1.u | `.place-hit.pc-near` | NEW P36 |
| LC1.v | `.place-overlay.pc-over .place-hit:not(.pc-own)` | NEW Z27 |
| LC1.w | `.place-hit.pc-near::after` | HELD by Z8b (`zoom/camera.ts:150`); NEW Z27 reds beside it |
| LC1.x | `.living-chart g.settlement[data-ink="founding"]` | HELD by RS19 (`e2e/suites/room-ink.ts:73`) and RS22 (`room-ink.ts:187`) |
| LC1.y | `[data-ink="ruin"]` | HELD by RS21 (`room-ink.ts:129`) |
| LC1.z | `[data-ink] > text` | HELD by RS20 (`room-ink.ts:103`) |
| LC1.aa to LC1.ad | `.voyage-overlay`, `.voyage-track`, `.voyage-ship`, `.voyage-rider` | NEW Z23 |
| LC1.ae | `.ages-range` | NEW RS32 |

Where the roster string also stands in another rule (`.place-hit {` in the scrub rule; `#place-card.flip-h` in flip-h.flip-v; `#place-card.flip-v` and `.pc-inner` in the inner's variant rules; `.pc-prospect`, `.pc-lay`, `.voyage-ship`, `.voyage-rider`, `.ages-range` in their state and part rules; `.voyage-overlay` in the comment above its rule; `.place-hit.pc-near` in the ring rule) the rename leaves LC1 green: those rows go e2e-only (2g-plates call 13), their green unit half recorded. The browser read of the hook's own rule is strictly stronger than the substring: it reds on that rule alone, and a fortiori on all of the hook's rules renamed. Fate: **leaves whole**.

### LC2, "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)", line 73

| claim | what | disposition |
|---|---|---|
| LC2.a | the hit declares its positioning transform | HELD by Z8b (104px at k=4), NEW Z22 |
| LC2.b | its translate(-50%, -50%) pins the box's centre to the mark | NEW Z22 (the box's centre against the mark at k=1 and k=4) |
| LC2.c | its scale divides by --zoom-k | HELD by Z8b (`Math.abs(z8b.hitW - 26) <= 1`), NEW Z22 |
| LC2.d1 | the ring's resting rule exists | NEW Z22 (one row with LC1.c) |
| LC2.d2 | the ring's shown rule exists (its keyboard arm is what the regex matches) | NEW Z22 (a Tabbed town's ring grows) |
| LC2.e1 | the resting ring does not divide again | NEW Z22 (2e measured this unread: zoom ALL PASS 39/39) |
| LC2.e2 | the shown ring does not divide again | HELD by Z8b, NEW Z22 |

Fate: **leaves whole**.

### LC3, "the town raised over an overlapping neighbour stays below the card it opens (#632)", line 90

| claim | what | disposition |
|---|---|---|
| LC3.a | `.place-hit.pc-near` declared once (`soleRule`) | 2I (c) |
| LC3.b | `#place-card` declared once (`soleRule`) | 2I (c) |
| LC3.c1 | the raised town declares a z-index | NEW P36 |
| LC3.c2 | the card declares a z-index | NEW Z27 |
| LC3.d | raised > 0 (over its neighbours) and raised < card (under the card) | NEW P36 (row LC3.d1, z 0) and Z27 (row LC3.d2, z 9, the census's mutation) |

Fate: **shrinks** to "the raised town's rule and the card's rule are each declared once (#632; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and P36 and Z27 read the stacking)".

### LC5, "the philologist's note is dressed, visible, and named the same on both sides (#124)", line 108

| claim | what | disposition |
|---|---|---|
| LC5.a | `.pc-tongue` declared once | 2I (c) |
| LC5.b | `.pc-tongue` carries its hairline (`border-top`) | NEW Z26 |
| LC5.c | `.pc-tongue` is not display none | NEW Z26 (a non-zero box; P16 reads `textContent` and would stay green) |
| LC5.d | `.pc-roots` declared once | 2I (c) |
| LC5.e | `.pc-roots` is not display none | NEW Z26 |
| LC5.f | the engine writes `className = "pc-tongue"` | HELD by P16 (`e2e/suites/cards/glass.ts:26`), with P17 (`glass.ts:92`), P18 (`glass.ts:51`), P18b (`glass.ts:70`) |
| LC5.g | the engine writes `className = "pc-roots"` | HELD by P16, with P17, P18, P18b |

Fate: **shrinks** to "the philologist's note and its roots are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z26 reads the dress and P16 the engine's classes)".

### LC6, "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)", line 125

| claim | what | disposition |
|---|---|---|
| LC6.a | `#place-card.flip-h` declared once | 2I (c) |
| LC6.b | flip-h sets `left: auto` | NEW Z24 |
| LC6.c | flip-h anchors from the right at `calc(100% - var(--pc-nx...` | NEW Z24 |
| LC6.d | flip-h counter-scales about `transform-origin: 100% 0` | NEW Z24 (at k=4 only; exact at rest) |
| LC6.e0 | `#place-card` declared once | 2I (c) |
| LC6.e | the card's left reads `--pc-nx` | NEW Z24 |
| LC6.f | the card's top reads `--pc-ny` | NEW Z24 |
| LC6.g | the engine publishes `--pc-nx` | NEW Z24 |
| LC6.h | the engine publishes `--pc-ny` | NEW Z24 |
| LC6.i | `showPlaceCard` is found | the anchor of LC6.j (Gate 7: finding the anchor is part of reading the file), no claim of its own; leaves with LC6.j |
| LC6.j | `showPlaceCard` writes no inline `left` | NEW Z24 |

Fate: **shrinks** to "the flipped card's rule and the card's own rule are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z24 reads the seats)". Its comment at line 124 (the shrink-to-fit history the PR #642 prose row names) leaves with LC6.b to LC6.j.

### LC7, "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)", line 146

For each variant V of B (`#place-card`), H (`.flip-h`), V (`.flip-v`), HV (`.flip-h.flip-v`):

| claim | what | disposition |
|---|---|---|
| LC7.V0 | the variant is declared once | 2I (c) |
| LC7.V1 | the variant declares a transform | NEW Z24 (B also Z25) |
| LC7.V2 | its transform reads `--pc-dx` | NEW Z25 |
| LC7.V3 | its transform reads `--pc-dy` | NEW Z25 |
| LC7.V4 | its transform leads with the counter-scale | NEW Z24 and Z25 (at k=4 only) |
| LC7.V5 | it carries one translate | 2I (e): the smallest falsifier, a second `translate(0px, 0px)` after the scale, composes to the same matrix; any translate that moves the card is read by Z24 and Z25 |
| LC7.V6 | it carries one scale | 2I (e): likewise a trailing `scale(1)` |
| LC7.w | the engine publishes `--pc-dx` | NEW Z25 (and `test/site/place-card-clamp.test.ts` reds by behaviour) |
| LC7.x | the engine publishes `--pc-dy` | NEW Z25 (and place-card-clamp) |

That is 4 x 7 + 2 = 30 claims. Fate: **shrinks** to "every card variant is declared once, and its transform carries one translate and one scale (#387/#388; kept for Issue #779 part 2i: a repeating block, or a second translate or scale composing to the same matrix, shows nowhere; Z24 and Z25 read the seats and the clamp)".

### LC8, "the Explorer host wires the contract: mount class + sheet link (#302)", line 173

| claim | what | disposition |
|---|---|---|
| LC8.a | the Explorer's `#map` carries `living-chart` | NEW R16 (the authored class; F7) |
| LC8.b | the Explorer page links `/living-chart.css` | NEW R16 |
| LC8.c | BaseLayout emits a page's extra stylesheet links | NEW R16 (the emission line dropped; the unit test, which reads only the word `extraCss`, stays green on it; its literal falsifier, renaming the prop on all three files, is behaviour-neutral) |

The census row (BUILT) named a built-page read; no surviving `astro-scaffold.test.ts` test reads the Explorer's sheet link or its mount class, so there is no HELD-DATA holder. Fate: **leaves whole**.

### `test/site/shell-css-ground.test.ts` SG3, "each chart mount keeps its qualified chart rule (#367, #463)", line 58

| claim | what | disposition |
|---|---|---|
| SG3.a1 | `public/explorer/index.css` carries `#map svg[data-vellum-style]` | NEW R17 |
| SG3.a2 | that rule sizes the chart at `width: 100%` | NEW R17 |
| SG3.b1 | `public/reading-frame.css` carries `.rf-chart svg[data-vellum-style]` | HELD by RR36 (`e2e/suites/reading-room/desk.ts:94`) |
| SG3.b2 | that rule sizes the chart at `width: 100%` | HELD by RR36 |

Fate: **leaves whole**.

### SG4, "each mount dresses its sheet at the house depth, via the token (#367)", line 66

| claim | what | disposition |
|---|---|---|
| SG4.a1 | `public/explorer/index.css` carries the `#sheet` rule | NEW R17 |
| SG4.a2 | the Explorer's `#sheet` rests at `var(--stage-shadow)` | NEW R17 (against the token on a probe) |
| SG4.b1 | `public/reading-room/index.css` carries the `#sheet` rule | HELD by RR39 (`e2e/suites/reading-room/dress.ts:162`) and RR36 (LOCAL FIRST) |
| SG4.b2 | the Reading Room's `#sheet` rests at `var(--stage-shadow)` | HELD by RR39 (its own-against-probe read, as the prompt says) |
| SG4.a2 and SG4.b2, the derivation | "via the token": a hand copy of the token's value reds the unit test and is invisible to any browser | LOCAL green arms SG4.a3 and SG4.b3, with their runner controls SG4.a4 (R17) and SG4.b4 (RR39): the hand copy with the token changed on top |

Fate: **leaves whole**.

### SG5, "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)", line 78

| claim | what | disposition |
|---|---|---|
| SG5.a1 | no `#map`-scoped rule in the Explorer's sheet casts the depth on a bare svg (the census's plant `#map svg`) | NEW R17 (the chart svg unshadowed) |
| SG5.a2 | likewise a plant that reaches only the survey track (`#map > svg ~ svg`, by sibling order) | NEW Z23 (the inked overlay unshadowed) |
| SG5.b | no `.rf-chart`-scoped rule in the room's sheet does (plant `.rf-chart svg`) | HELD by RR39 (its chart-svg read), NEW RR43 beside it |
| SG5.c | likewise in the swept `public/reading-frame.css` | HELD by RR39, NEW RR43 |
| SG5.d | likewise the overlay-only plant in the room's sheet (`.rf-chart > svg ~ svg`) | NEW RR43 |

Fate: **leaves whole**. With SG3 to SG5 gone, `CHART_MOUNTS`, `QUALIFIED_CHART_RULES`, `DEPTH_TOKENS`, `findRule` and the `rulesIn` import leave the file if nothing else uses them; SG1, SG2 (2i's) and SG6 (data) stay.

## B. The new checks

Eleven checks. Each is its own `step`, undoes in `finally` everything it changes, fails rather than throws where its premise is a press or a wait (every poll below is bounded and non-throwing, and its result is a witness the assertion reads), reads an absent element as a sentinel, states each read's shape (`Payload<T>` or `evaluate<T>`, `test/repo/e2e-read-types.test.ts`), compares colours through `PAGE_RGBA` and `nearRgba(tokenRgba(...))`, and reads every rem length against the root's computed font size read in the same payload (`r`, 16px today, never a hard 16). A place card is read only after its unfurl has finished: `.pc-inner`'s `getAnimations()` non-empty and every entry `finished` (settle-doctrine's environment section), polled; where many cards are read, reduced motion is emulated first so each roll rests in a frame or two, and cleared in `finally`. The cursor is parked at (5, 5) before any read of a box under it.

**Run functions at the cap.** `e2e/suites/cards.ts`'s `run` is exactly 50 code lines (`max-lines-per-function` skips blanks and comments) and `e2e/suites/zoom.ts`'s is 46: both are split by phase before anything joins them, as 2g-reading split `reading-room`'s (`cards.ts`: the unstepped P1 to `pCardShot` reads into one function in `cards.ts`; `zoom.ts`, split by the planner: `z1ZoomTo` through `z10bNoDblclickLeak` move into `zGeometric(ctx, k)`, and Z22, Z24, Z25, Z26, Z27 run as five steps right after that call, before step "Z11", the redraft still off; Z23 stays right after step "Z20d"). `render.ts`'s `run` is 40 and takes two lines; `room-instrument.ts`'s is 33 and takes one; `reading-room.ts`'s `atTheDesk` takes one.

### R16, the Explorer wears the engine's host contract

- Suite `render`; file `e2e/suites/render/room.ts` (new; the naming rule: the page as authored and what loading it does). In `run` right after `r0ToR4Worker` (the boot draw has landed).
- One read on the page as it stands: `#map`'s class list; every `head link[rel="stylesheet"]` href; the loaded sheet whose `href` path is `/living-chart.css` and whether its `cssRules` hold a rule with `selectorText === ".place-overlay"` (proves it is the engine's sheet and it loaded; a `cssRules` throw reads as "unreadable").
- Asserts: `#map` wears `living-chart`; `/living-chart.css` is among the head's stylesheet links; the sheet is loaded and carries `.place-overlay`.
- `finally`: nothing to undo (read-only). About 25 code lines; about 0.1 s on CI.
- Holds LC8.a, LC8.b, LC8.c.

### R17, the Explorer's sheet rests at the stage depth by its token, and the chart fills it unshadowed

- Suite `render`; file `e2e/suites/render/dress.ts` (new). Last in `run`, after `r14Region` (seed 42 drawn; no camera, turn or flip in flight).
- One read: two probe divs appended to `body` with `box-shadow: var(--stage-shadow)` and `var(--sheet-shadow)`, their computed shadows, then removed; `#sheet`'s computed `boxShadow`, `width`, `height`; the chart `#map > svg[data-vellum-style]`'s computed `boxShadow`, `width`, `height` (used values, so an arrival ceremony's transform cannot move them).
- Asserts: `#sheet`'s shadow equals the stage probe's string and `SHADE` parses it (one layer); the stage and sheet probes differ (the witness that a swap is visible); the chart is present, its width and height each within 1px of `#sheet`'s; the chart's shadow is `none`.
- `finally`: the probes removed (in the payload). About 40 code lines; about 0.2 s.
- Holds SG3.a1, SG3.a2, SG4.a1, SG4.a2, SG5.a1.

### Z22, a hit holds its 26px box on its mark at rest and at depth, its resting ring 20px at 0.85 with no division of its own, and a keyboard's focus grows the ring to 1 at depth

- Suite `zoom`; file `e2e/suites/zoom/camera.ts` (joins Z8b; the file goes from 162 to about 255 lines). In `run` first of the five steps right after `zGeometric(ctx, k)`, which ends with `z9Keyboard`, `z10Buttons` and `z10bNoDblclickLeak` (redraft off since `zSetup`). Those three leave the camera at home (each polls or sleeps until k=1, x=0, y=0), the mouse where Z8b parked it at (5, 5), and `#map-viewport` focused (`vp.focus()` in `z9Keyboard`): T is a hit, so the premise that T is neither focused, hovered nor raised still holds, the keyboard read focuses P itself before its Tab, and the `finally`'s blur leaves nothing Z11 depends on.
- Setup: mouse to (5, 5); `__vellumZoomTo({k:1,x:0,y:0})`; target T = the hit nearest the viewport's centre with `data-idx` at least 1 (Z8b's rule), P = the hit with `data-idx` one less.
- Read REST(T) at k=1, then after `__vellumZoomTo({k:4, x: W/2 - 4*px, y: H/2 - 4*py})` (Z8b's centring on T), again at k=4: T's rect; T's `nx`, `ny` from its inline `style.left`, `style.top` percentages; `#map`'s rect; whether T is `.pc-near`, focused or hovered (a premise: none); `getComputedStyle(T, "::after")`'s `content`, `width`, `height`, `borderTopWidth`, `borderTopStyle`, `borderTopColor`, `borderTopLeftRadius`, `opacity`, `transform`.
- Then the keyboard: `P.focus({preventScroll: true})` (wiring), `sendKey(send, "Tab", "Tab", 9)` (a real key), and a bounded poll (30 x 50ms) of SHOWN(T): T is `document.activeElement`, `T.matches(":focus-visible")`, the ring's `opacity` and `transform`, until the opacity reads `1`; the last read is judged.
- Asserts, at k=1 and k=4: the box's centre within 0.5px of the mark (`map.left + nx * map.width`, `map.top + ny * map.height`; the overlay is inset 0 on `#map`, so this is exact, where the chart's own CTM would add the overlay-against-chart pixel RS22 warns of); the box 26px square within 1px; the ring's content `'""'`, 20px square, 2px solid, colour ink-dark, radius 50%, opacity `0`, scale (the matrix's `a`) 0.85 within 0.005. Then at k=4: T focused by the key and `:focus-visible`, the ring's opacity `1` and scale 1 within 0.02.
- `finally`: blur the active element, dispatch an Escape keydown, `__vellumZoomTo({k:1,x:0,y:0})`, mouse to (5, 5). About 95 code lines in four functions; about 1.5 s.
- Holds LC1.b, LC1.c, LC2.a, LC2.b, LC2.c, LC2.d1, LC2.d2, LC2.e1, LC2.e2.

### Z23, the inked survey's overlay rides the mount unshadowed, dressed by the engine's sheet

- Suite `zoom`; file `e2e/suites/zoom/dress.ts` (new). In `run` right after the `Z20d` step (which leaves the survey unticked).
- Setup: tick `#ages` and dispatch `change` (Z20d's wiring); bounded poll (120 x 50ms) for `#map .voyage-overlay .voyage-track` with a non-empty `points` (Issue #300: the ink lands a beat after the tick); the result is a witness.
- One read: the overlay svg's computed `boxShadow`, `position`, `pointerEvents`, `zIndex`, `overflow`, `width`, `height` against `#map`'s `offsetWidth`, `offsetHeight`; the track's `fill`, `stroke`, `strokeWidth`, `strokeDasharray`, `strokeLinecap`, `vectorEffect`, `opacity`; the ship's hull (`#map .voyage-ship > path:not([class])`, the first) and the rider's body (`#map .voyage-rider > path:not([class])`, the first): `fill`, `stroke`, `strokeWidth` (computed style reads through a mark the engine has set `display="none"`).
- Asserts: the track inked; the overlay `none`, `absolute`, `none`, `3`, `visible`, its size within 1px of `#map`'s; the track fill `none`, stroke ink-dark, `3px`, `2px, 7px`, `round`, `non-scaling-stroke`, opacity `0.95`; the hull and body fill parchment-panel, stroke ink-dark, the hull `1.5px`.
- `finally`: untick `#ages`, dispatch `change`, bounded poll (40 x 50ms) for no `#map .voyage-overlay`. About 60 code lines; about 2.5 s.
- Holds LC1.aa, LC1.ab, LC1.ac, LC1.ad, SG5.a2.

### Z24, a card stands at its mark on the side it flips toward, 10px off on both axes, at rest and at depth, in all four variants

- Suite `zoom`; file `e2e/suites/zoom/dress.ts`. In `run` after Z22 (redraft off).
- Setup: Escape, blur, mouse (5, 5), reduced motion emulated. Targets read in the page from each hit's inline `left`, `top` percentages: the hit nearest (0.30, 0.35) unflipped, (0.70, 0.35) flip-h, (0.30, 0.65) flip-v, (0.70, 0.65) flip-h.flip-v (seed 42: Poalo, Naukoa, Rauhelunui, Won).
- For k in 1 and 4, for each target: `__vellumZoomTo` home (k=1) or centred on the target (k=4, Z8b's centring); `hit.focus({preventScroll: true})` (wiring: the claim is the seat, not the gesture); bounded poll (20 x 50ms) until the card shows that town's name and its unfurl has finished; read the card's rect, its `flip-h` and `flip-v` classes, its inline `--pc-dx` and `--pc-dy`, `#map`'s rect and the target's `nx`, `ny`.
- Asserts, per read: rested; the classes are the variant's; `--pc-dx` and `--pc-dy` both `0px` (the premise: no nudge, so the seat is the anchor alone); the anchored corner 10px from the mark within 1px on both axes (unflipped: left and top; flip-h: right and top; flip-v: left and bottom; flip-h.flip-v: right and bottom; the mark as in Z22); the card 16r wide within 1px.
- `finally`: blur, Escape, zoom home, emulated media cleared. About 95 code lines; about 2 s.
- Holds LC1.d, LC1.g, LC1.h, LC6.b, LC6.c, LC6.d, LC6.e, LC6.f, LC6.g, LC6.h, LC6.j, LC7.B1, LC7.H1, LC7.V1, LC7.HV1, LC7.B4, LC7.H4, LC7.V4, LC7.HV4.

### Z25, every card shown at depth is nudged flush into its box, in all four variants on both axes

- Suite `zoom`; file `e2e/suites/zoom/camera.ts`. In `run` after Z24 (redraft off).
- Setup: Escape, blur, mouse (5, 5), reduced motion emulated, `__vellumZoomTo({k:4, x: -(3*W)/2, y: -(3*H)/2})` (zK4Shot's centring; most marks stand off screen, so their cards need a nudge).
- One async read (`evaluate(..., true)`): for every `.place-overlay .place-hit`, `focus({preventScroll: true})`, then up to 12 animation frames until the card shows that town and its unfurl has finished; record `{rested, flipH, flipV, dx, dy}` (the inline nudge, parsed) and the card's and `#map-viewport`'s rects; blur at the end.
- Asserts (in node): as many rows as hits; every row rested; every card inside the box within 0.5px on all four sides; every card with a non-zero `dx` touching the box's left or right edge within 0.5px, and with a non-zero `dy` its top or bottom; the witness: each of the four variants has at least one row with `dx` non-zero and one with `dy` non-zero (seed 42 at k=4 centred: the off-screen towns of every quadrant).
- `finally`: blur, Escape, zoom home, emulated media cleared. The engine's clamp measures `#place-card`'s own box at once (`clampIntoView`), which the inner's roll does not change; the per-card rest wait is kept anyway, as the brief binds. About 75 code lines; about 3 s.
- Holds LC7.B2 to LC7.HV2, LC7.B3 to LC7.HV3, LC7.B4 to LC7.HV4 (with Z24), LC7.w, LC7.x, LC7.B1 (with Z24).

### Z26, the place card wears the engine's dress: its box, its paper, its head, its action row and its philologist's note, each part as its own rule sets it

- Suite `zoom`; file `e2e/suites/zoom/dress.ts`. In `run` after Z25 (redraft off; seed 42 at home).
- Read A: Escape, blur, mouse (5, 5); focus the hit whose `aria-label` ends `, Capital` (`placeAriaLabel`; seed 42: Laukuwelua, once Haitani, so its card carries `.pc-former`, read as a premise); bounded poll (40 x 50ms) for the card showing that name with its unfurl finished. Then read, split by part (each payload under 50 lines):
  - card: `position` `absolute`; width 16r within 0.5; `pointerEvents` `none`.
  - inner: `boxSizing` `border-box`; `overflowY` `auto`; `touchAction` `pan-y`; background control-cream; colour ink-dark; top border 1px solid ink-dark; top-left radius `4px`; padding top 0.6r and left 0.75r; font size 0.9r; line height 1.35 x 0.9r; `animationName` `paperUnfurl`; `SHADE(boxShadow)`: colour `tokenRgba("--chart-ink", 0.28)`, geometry `0px 8px 22px 0px`.
  - name: `block`, r, letter spacing 0.02r. rank: `block`, `italic`, ink-brown, 0.82r, `uppercase`, margin top 0.1r. founded: `block`, margin top 0.35r, `tabular-nums`. former (the capital was Haitani): `block`, margin top 0.15r, 0.81r (0.9em of 0.9r), ink-brown.
  - acts: `flex`, `column`, `flex-start`, row gap 0.3r, margin top 0.45r. prospect: `inline-block`, control-gold, top border 1px line-tan, 0.82r, text decoration `none`, `pointerEvents` `auto`, ink-dark. lay (premise: not `.dim`, the device table is empty this early in lane A): control-gold, top border 1px line-tan, `fontFamily` equal to a probe's computed `font-family: var(--font-display)`, 0.82r, `textAlign` `left`, `pointerEvents` `auto`.
  - note: tongue a non-zero box, `block`, top border 1px solid `tokenRgba("--ink-dark", 0.22)`, 0.8r, ink-brown, margin top 0.45r, padding top 0.4r; roots a non-zero box, `italic`, 0.78r, ink-tale.
- Read B: focus the first hit whose `aria-label` ends `, Ruin` (seed 42: Laihoanui) the same way; the tale: a non-zero box, margin top 0.4r, margin bottom `0px`, `italic`, ink-tale.
- Lengths within 0.05px. `finally`: blur, Escape. About 120 code lines in five functions; about 2 s.
- Holds LC1.d, LC1.i, LC1.j to LC1.s, LC5.b, LC5.c, LC5.e.

### Z27, under a pinned card the town the hand raises stays beneath it, and only the card's own town still offers the hand

- Suite `zoom`; file `e2e/suites/zoom/gestures.ts` (new). In `run` after Z26 (redraft off, k=1).
- Setup: Escape, blur, mouse (5, 5). Marks: every hit's centre, index and name. For A in index order (the first eight places, then on through all 26 if none of the eight hosts a B), Issue #716's mitigation as CD57 to CD59 carry it (`e2e/suites/chart-drawer/gestures.ts`): a reachability witness first, `document.elementFromPoint(A.x, A.y)` is A's hit, then a real move to A's centre and a real press there (`Input.dispatchMouseEvent`); a bounded poll (40 x 50ms) for the card shown, pinned, named A, unfurled and not `.pc-scrolls`, then for the card's rect to hold still across two consecutive reads; only then a fresh read of the card's rect and `.pc-acts`' rect; B = the first other mark whose centre stands at least 14px inside the card's rect and at least 14px clear of the action row. The first A with a B wins; none is a fault, not a throw (seed 42: A is likely Laukuwelua, idx 0).
- Control, the hand on A (outside its card): B's and A's computed `cursor`; a one-pixel row through B's centre, `sampleRow(send, round(B.x) - 14, round(B.y), 28)`.
- A real move to B's centre; bounded poll (30 x 50ms) until B is `.pc-near` and its `::after` opacity reads `1`; read B's and A's `cursor`, the card still pinned on A; the same row again.
- Asserts: A and B found; the ring up on B (`.pc-near`, opacity 1); the card still pinned on A; the two rows equal within 6 per channel at every pixel (B's ring, drawn 8 to 10px from its centre, inside the row, is under the card's opaque paper); the control: B's cursor `pointer`; over the card: B's cursor `default`, A's `pointer`. A pixel row and not `elementFromPoint`: the card is `pointer-events: none`, so a hit test passes through it whatever its stacking.
- `finally`: mouse (5, 5), an Escape keydown dispatched, blur (never throws). About 95 code lines; about 3 s.
- Holds LC1.v, LC3.c2, LC3.d (raised under the card).

### P36, the town the hand raises takes the hand over the later box that covers it

- Suite `cards`; file `e2e/suites/cards/gestures.ts` (new; `hold.ts` is on the size list). In `run` after the `P28 to P33` step, before `P30` (the page `hk.boot(false)` left: `NARROW_SEED` at 1024x768, where P29 asserts covered towns exist).
- Setup: mouse (2, 2), Escape, blur (own, never throwing). Marks read by its own payload (index, name, centre). The covered pair: the first m with an o of higher index (later in the overlay, so painted over m) whose centre is within 13px of m's on both axes (P29's rule).
- A real move to m's centre (`hk.move`); bounded poll (20 x 50ms) for m wearing `.pc-near`; read `document.elementFromPoint(m.x, m.y)` (a fresh hit test, which the browser's own hover would only redo on the next move).
- Asserts: a pair found; m raised; the point's element is m's hit, not o's.
- `finally`: mouse (2, 2), Escape dispatched, blur. About 45 code lines; about 1 s.
- Holds LC1.u, LC3.c1, LC3.d (raised over its neighbours).

### RR43, the Reading Room's survey track is no sheet: its overlay casts no shadow in the mount

- Suite `reading-room`; file `e2e/suites/reading-room/dress.ts` (joins RR39; about 185 lines after). In `atTheDesk` right after the `RR39` step.
- One read: `.rf-chart .voyage-overlay`'s computed `boxShadow` (the room is always armed, so the overlay stands even while the present hides it; computed style reads through `display: none`), null when absent.
- Asserts: present, and `none`. `finally`: nothing. About 12 code lines; about 0.1 s.
- Holds SG5.b, SG5.c, SG5.d.

### RS32, the bar wears the engine's instrument

- Suite `room-instrument`; file `e2e/suites/room-instrument/dress.ts` (new). In `run` after the `RS31` step, before RS24's health gate.
- One read of `.rf-range`: its class list (the premise: it wears `ages-range`), computed `appearance`, `height`, `marginTop`, `marginBottom`, and `backgroundImage` (the number of `gradient(` occurrences, and the kinds of the first and fourth layers).
- Asserts: `appearance` `none`; height `24px`; both margins `0px`; five painted layers, the first a `linear-gradient(`, the fourth a `repeating-linear-gradient(`. `finally`: nothing. About 25 code lines; about 0.2 s.
- Holds LC1.ae.

**Pins and presses**: Z27 is the only check that pins a card, and it carries Issue #716's mitigation; no check presses through `.click()`; no check files anything, so no drawer is shut between pins.

**Lane cost**: lane A about +15 s (zoom about +12, render +0.3, cards +1), against about 128 s of room; lane B +0.1 s; lane C +0.2 s; lane D nothing.

## C. The rows

Legend: unit files and tests are named in full in each row. Every e2e set is a prediction until the runner returns it; rows marked LOCAL FIRST carry the widest blast and are measured locally before the send, as 2g-reading measured its CC3 rows. Four rows carry two edits each (LC7.w and LC7.x, both writes needed for the claim to be false; SG4.a4 and SG4.b4, the hand copy and the token). 91 rows: 89 for the runner and 2 LOCAL green arms (SG4.a3, SG4.b3), which the runner refuses (an entry that expects no red) and the lane runs locally, named so in the ledger.

- **LC1.a** (claim LC1.a). Edits: `` [{"file":"public/living-chart.css","find":".place-overlay {","replace":".place-overlayx {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `cards`, expect exactly `["P3"]`. BITES. the overlay box loses position, inset and pointer-events none; its hits and card stay positioned against #map, so only P3's computed read of the overlay sees it.
- **LC1.b** (claim LC1.b (and the hit's cursor)). Edits: `` [{"file":"public/living-chart.css","find":"}\n.place-hit {","replace":"}\n.place-hitx {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z8b","Z22","Z27"]`. BITES. LC1 stays green: `.place-hit {` still stands inside the scrub rule; the hits fall into the overlay's flow as house buttons and inherit pointer-events none, so Z8b's real hover finds no :hover, Z22 reads no 26px box on the mark, Z27's real press pins nothing.
- **LC1.c** (claim LC1.c, LC2.d1). Edits: `` [{"file":"public/living-chart.css","find":".place-hit::after {","replace":".place-hit[data-x]::after {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)"; "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z22"]`. BITES. the ring loses its content, so it never paints; Z8b predicted green, since getComputedStyle still resolves the shown rule's opacity 1 and scale(1) on a pseudo with no content (F5); `[data-x]` keeps LC2's pseudo regex from matching the renamed rule.
- **LC1.d** (claim LC1.d). Edits: `` [{"file":"public/living-chart.css","find":"#place-card {","replace":"#place-card[data-x] {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)"; "the town raised over an overlapping neighbour stays below the card it opens (#632)"; "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)"; "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25","Z26","Z27"]`. BITES. `[data-x]` keeps the id, so `vellum/css-engine-no-host-id` has nothing new to read; the card goes static, full-width and z-auto; Z8 predicted green (seed 42's town nearest the centre is flipped, F14); LOCAL FIRST.
- **LC1.f** (claim LC1.f). Edits: `` [{"file":"public/living-chart.css","find":"#place-card.pinned.pc-scrolls .pc-inner {","replace":"#place-card.pinned.pc-scrollsx .pc-inner {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `cards`, expect exactly `["P20","P26"]`. BITES. a pinned scrolling card keeps pointer-events none: P20 reads it, P26's elementFromPoint misses the card and its wheel reaches the camera; P27 (keyboard) stays green.
- **LC1.g** (claim LC1.g). Edits: `` [{"file":"public/living-chart.css","find":"#place-card.flip-h {","replace":"#place-card.flip-hx {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)"; "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. LC1 stays green (`#place-card.flip-h` stands in the flip-h.flip-v rule); flip-h cards fall back to the base anchor; the clamp still lands them flush, so Z25 stays green.
- **LC1.h** (claim LC1.h). Edits: `` [{"file":"public/living-chart.css","find":"#place-card.flip-v {","replace":"#place-card.flip-vx {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. LC1 stays green (`#place-card.flip-v .pc-inner` keeps the substring); flip-v cards take the base translate and stand below their mark.
- **LC1.i** (claim LC1.i). Edits: `` [{"file":"public/living-chart.css","find":"}\n.pc-inner {","replace":"}\n.x-pc-inner {"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `zoom`, expect exactly `["Z24","Z25","Z26","Z27"]`. BITES. unit green: `.pc-inner` stands in four other rules (no unit block, 2g-plates call 13); no unfurl, no cap, no paper: every card read's rest witness fails; LOCAL FIRST.
- **LC1.j** (claim LC1.j). Edits: `` [{"file":"public/living-chart.css","find":".pc-name {","replace":".x-pc-name {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. .pc-name falls to an inline strong at the inner's 14.4px.
- **LC1.k** (claim LC1.k). Edits: `` [{"file":"public/living-chart.css","find":".pc-rank {","replace":".x-pc-rank {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. .pc-rank loses italic, uppercase, ink-brown, 0.82rem.
- **LC1.l** (claim LC1.l). Edits: `` [{"file":"public/living-chart.css","find":".pc-founded {","replace":".x-pc-founded {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. .pc-founded loses block, 0.35rem and tabular-nums.
- **LC1.m** (claim LC1.m). Edits: `` [{"file":"public/living-chart.css","find":".pc-former {","replace":".x-pc-former {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the capital (Laukuwelua, once Haitani) carries .pc-former.
- **LC1.n** (claim LC1.n). Edits: `` [{"file":"public/living-chart.css","find":".pc-tongue {","replace":".x-pc-tongue {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)"; "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the note loses its hairline and size.
- **LC1.o** (claim LC1.o). Edits: `` [{"file":"public/living-chart.css","find":".pc-roots {","replace":".x-pc-roots {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)"; "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the roots lose italic, 0.78rem, ink-tale.
- **LC1.p** (claim LC1.p). Edits: `` [{"file":"public/living-chart.css","find":".pc-tale {","replace":".x-pc-tale {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the ruin's tale takes the p defaults (1em margins, roman).
- **LC1.q** (claim LC1.q). Edits: `` [{"file":"public/living-chart.css","find":".pc-acts {","replace":".x-pc-acts {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)"; "the card's action row, its filing press and its refusing face are each declared once (#522; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and CD57 reads the dress)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the row goes block, its actions inline side by side; LC4 (2i's) reds on its soleRule.
- **LC1.r** (claim LC1.r). Edits: `` [{"file":"public/living-chart.css","find":".pc-prospect {","replace":".x-pc-prospect {"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `zoom`, expect exactly `["Z26"]`. BITES. unit green: `.pc-prospect` stands in the hover rule; the link loses gold, inline-block and pointer-events auto; on `cards` P28 and P31b would red too (they press the link), so the row runs on `zoom`, where nothing presses it.
- **LC1.s** (claim LC1.s). Edits: `` [{"file":"public/living-chart.css","find":".pc-lay {","replace":".x-pc-lay {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the card's action row, its filing press and its refusing face are each declared once (#522; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and CD57 reads the dress)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. LC1 green (`.pc-lay` stands in five more rules); the press takes the house button's cream and 1.5px ink border and loses pointer-events; CD57 (chart-drawer) reads the same, not sent.
- **LC1.t** (claim LC1.t). Edits: `` [{"file":"public/living-chart.css","find":".place-overlay.scrub .place-hit {","replace":".place-overlay.scrubx .place-hit {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `reading-room`, expect exactly `["RR11b"]`. BITES. the Reading Room's hits take pointer-events auto.
- **LC1.u** (claim LC1.u). Edits: `` [{"file":"public/living-chart.css","find":".place-hit.pc-near {","replace":".place-hit.pc-nearx {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the town raised over an overlapping neighbour stays below the card it opens (#632)". E2e: `cards`, expect exactly `["P36"]`. BITES. LC1 green (`.place-hit.pc-near` stands in the ring rule); LC3's soleRule finds no block; the raised town no longer rises over the later box covering it.
- **LC1.v** (claim LC1.v). Edits: `` [{"file":"public/living-chart.css","find":".place-overlay.pc-over .place-hit:not(.pc-own) {","replace":".place-overlay.pc-overx .place-hit:not(.pc-own) {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z27"]`. BITES. with the hand over a pinned card, the other towns keep cursor pointer.
- **LC1.w** (claim LC1.w). Edits: `` [{"file":"public/living-chart.css","find":".place-hit.pc-near::after,","replace":".place-hit.pc-nearx::after,"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z8b","Z27"]`. BITES. the ring never grows on the town the pointer raises; Z22's keyboard ring (the focus arm) stays green.
- **LC1.x** (claim LC1.x). Edits: `` [{"file":"public/living-chart.css","find":".living-chart g.settlement[data-ink=\"founding\"]","replace":".living-chart g.settlement[data-ink=\"foundingx\"]"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `room-ink`, expect exactly `["RS19","RS22"]`. BITES. no inkStamp on a founding: RS19 reads the name, RS22 finds no animated mark (castles 0).
- **LC1.y** (claim LC1.y). Edits: `` [{"file":"public/living-chart.css","find":".living-chart g.settlement[data-ink=\"ruin\"]","replace":".living-chart g.settlement[data-ink=\"ruinx\"]"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `room-ink`, expect exactly `["RS21"]`. BITES. a ruin's mark loses dryingInk.
- **LC1.z** (claim LC1.z). Edits: `` [{"file":"public/living-chart.css","find":".living-chart g.settlement[data-ink] > text","replace":".living-chart g.settlement[data-inkx] > text"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `room-ink`, expect exactly `["RS20"]`. BITES. a revealed name loses its quick dryingInk.
- **LC1.aa** (claim LC1.aa). Edits: `` [{"file":"public/living-chart.css","find":".voyage-overlay {","replace":".x-voyage-overlay {"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `zoom`, expect exactly `["Z23"]`. BITES. unit green: `.voyage-overlay` also stands in the comment above the rule; the overlay svg goes static, 300x150, pointer-events auto, overflow hidden.
- **LC1.ab** (claim LC1.ab). Edits: `` [{"file":"public/living-chart.css","find":".voyage-track {","replace":".x-voyage-track {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the shared sheet dresses every engine-emitted hook (#302)". E2e: `zoom`, expect exactly `["Z23"]`. BITES. the polyline fills black and strokes nothing.
- **LC1.ac** (claim LC1.ac). Edits: `` [{"file":"public/living-chart.css","find":".voyage-ship path,","replace":".x-voyage-ship path,"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `zoom`, expect exactly `["Z23"]`. BITES. unit green: `.voyage-ship` stands in four more rules; the hook's first rule is the hull arm, so the ship's hull fills black, unstroked.
- **LC1.ad** (claim LC1.ad). Edits: `` [{"file":"public/living-chart.css","find":".voyage-rider path {","replace":".x-voyage-rider path {"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `zoom`, expect exactly `["Z23"]`. BITES. unit green: `.voyage-rider` stands in six more rules; the rider's body fills black, unstroked.
- **LC1.ae** (claim LC1.ae). Edits: `` [{"file":"public/living-chart.css","find":".ages-range {","replace":".x-ages-range {"}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `room-instrument`, expect exactly `["RS32"]`. BITES. unit green: `.ages-range` stands in the focus and thumb rules; the bar takes the native slider, its margin and no painted layers.
- **LC2.a** (claim LC2.a). Edits: `` [{"file":"public/living-chart.css","find":"  transform: translate(-50%, -50%) scale(calc(1 / var(--zoom-k, 1)));\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z8b","Z22"]`. BITES. the hit's transform line deleted: anchored by its corner and 104px at k=4.
- **LC2.b** (claim LC2.b). Edits: `` [{"file":"public/living-chart.css","find":"transform: translate(-50%, -50%) scale(calc(1 / var(--zoom-k, 1)));","replace":"transform: scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z22"]`. BITES. the translate dropped: the box keeps 26px, its centre 13px off the mark at k=1 and 52px at k=4; Z8b hovers the box's own centre and stays green.
- **LC2.c** (claim LC2.c). Edits: `` [{"file":"public/living-chart.css","find":"transform: translate(-50%, -50%) scale(calc(1 / var(--zoom-k, 1)));","replace":"transform: translate(-50%, -50%);"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z8b","Z22"]`. BITES. the division dropped (the census's mutation): 104px at k=4, still on the mark.
- **LC2.d2** (claim LC2.d2). Edits: `` [{"file":"public/living-chart.css","find":".place-hit:focus-visible::after {","replace":".place-hit[data-x]:focus-visible::after {"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z22"]`. BITES. the shown rule's keyboard arm renamed: a Tabbed town's ring stays at rest; the pointer arm (Z8b) stays green.
- **LC2.e1** (claim LC2.e1). Edits: `` [{"file":"public/living-chart.css","find":"transform: scale(0.85);","replace":"transform: scale(calc(0.85 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z22"]`. BITES. 2e's measured mutation (zoom ALL PASS 39/39): the resting ring reads scale 0.2125 at k=4.
- **LC2.e2** (claim LC2.e2). Edits: `` [{"file":"public/living-chart.css","find":"transform: scale(1);","replace":"transform: scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)". E2e: `zoom`, expect exactly `["Z8b","Z22"]`. BITES. the shown ring reads 0.25 at k=4 under the hover (Z8b) and the keyboard (Z22).
- **LC3.c1** (claim LC3.c1). Edits: `` [{"file":"public/living-chart.css","find":"  z-index: 1;\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the town raised over an overlapping neighbour stays below the card it opens (#632)". E2e: `cards`, expect exactly `["P36"]`. BITES. the raised town's z-index deleted.
- **LC3.c2** (claim LC3.c2). Edits: `` [{"file":"public/living-chart.css","find":"  z-index: 5;\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the town raised over an overlapping neighbour stays below the card it opens (#632)". E2e: `zoom`, expect exactly `["Z27"]`. BITES. the card's z-index deleted: the raised town (z 1) paints its ring over the card.
- **LC3.d1** (claim LC3.d (raised > 0)). Edits: `` [{"file":"public/living-chart.css","find":"z-index: 1;","replace":"z-index: 0;"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the town raised over an overlapping neighbour stays below the card it opens (#632)". E2e: `cards`, expect exactly `["P36"]`. BITES. z-index 0: the raised box no longer rises over the later box covering it.
- **LC3.d2** (claim LC3.d (raised < card)). Edits: `` [{"file":"public/living-chart.css","find":"z-index: 1;","replace":"z-index: 9;"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the town raised over an overlapping neighbour stays below the card it opens (#632)". E2e: `zoom`, expect exactly `["Z27"]`. BITES. the census's mutation, z-index 9: the raised town paints over the card it does not own.
- **LC5.b** (claim LC5.b). Edits: `` [{"file":"public/living-chart.css","find":"  border-top: 1px solid rgb(from var(--ink-dark) r g b / 0.22);\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the note's hairline deleted.
- **LC5.c** (claim LC5.c). Edits: `` [{"file":"public/living-chart.css","find":"  margin: 0.45rem 0 0;","replace":"  margin: 0.45rem 0 0;\n  display: none;"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the note gutted to display none: Z26 reads its box; on `cards` P17b would likely red too (the AX description skips a display:none descendant) and P16 would not (it reads textContent), which is why the row runs on `zoom`.
- **LC5.e** (claim LC5.e). Edits: `` [{"file":"public/living-chart.css","find":"  line-height: 1.3;","replace":"  line-height: 1.3;\n  display: none;"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `zoom`, expect exactly `["Z26"]`. BITES. the roots gutted to display none.
- **LC5.f** (claim LC5.f). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"tongue.className = \"pc-tongue\";","replace":"tongue.className = \"pc-tonguex\";"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `cards`, expect exactly `["P16","P17","P18","P18b"]`. BITES. the engine writes .pc-tonguex: P16's tongue read is undefined, the three order strings break; P17b (the AX text) stays green.
- **LC5.g** (claim LC5.g). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"derivation.className = \"pc-roots\";","replace":"derivation.className = \"pc-rootsx\";"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the philologist's note is dressed, visible, and named the same on both sides (#124)". E2e: `cards`, expect exactly `["P16","P17","P18","P18b"]`. BITES. the engine writes .pc-rootsx.
- **LC6.b** (claim LC6.b). Edits: `` [{"file":"public/living-chart.css","find":"  left: auto;\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. flip-h keeps the base left, so the right is ignored and the card hangs right of its mark.
- **LC6.c** (claim LC6.c). Edits: `` [{"file":"public/living-chart.css","find":"  right: calc(100% - var(--pc-nx, 0) * 100%);\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. flip-h with left and right auto stands at the overlay's left edge.
- **LC6.d** (claim LC6.d). Edits: `` [{"file":"public/living-chart.css","find":"  right: calc(100% - var(--pc-nx, 0) * 100%);\n  transform-origin: 100% 0;","replace":"  right: calc(100% - var(--pc-nx, 0) * 100%);"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. visible only at depth: with origin 0 0 a flip-h card's right edge stands 3 card-widths left of its seat at k=4; exact at k=1.
- **LC6.e** (claim LC6.e). Edits: `` [{"file":"public/living-chart.css","find":"  left: calc(var(--pc-nx, 0) * 100%);\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. unflipped and flip-v cards stand at the overlay's left edge.
- **LC6.f** (claim LC6.f). Edits: `` [{"file":"public/living-chart.css","find":"  top: calc(var(--pc-ny, 0) * 100%);\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. every card stands at its static top.
- **LC6.g** (claim LC6.g). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-nx\", String(place.nx));","replace":"el.style.setProperty(\"--pc-nxx\", String(place.nx));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. the engine publishes no anchor x: every card falls back to nx 0.
- **LC6.h** (claim LC6.h). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-ny\", String(place.ny));","replace":"el.style.setProperty(\"--pc-nyx\", String(place.ny));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. no anchor y: ny 0.
- **LC6.j** (claim LC6.j). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-ny\", String(place.ny));","replace":"el.style.setProperty(\"--pc-ny\", String(place.ny));\n    el.style.left = `${place.nx * 100}%`;"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. an inline left beats flip-h's left auto: the flipped cards hang right of their marks.
- **LC7.B1** (claim LC7.B1). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25"]`. BITES. the base card's transform deleted: no gap, no counter-scale, no nudge; Z8 green (its town is flipped); Z27 green unless its A is an unflipped town (F3).
- **LC7.H1** (claim LC7.H1). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. flip-h takes the base translate (+10px) about its right edge.
- **LC7.V1** (claim LC7.V1). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. flip-v takes the base translate and stands below its mark.
- **LC7.HV1** (claim LC7.HV1). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));\n","replace":""}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24"]`. BITES. flip-h.flip-v takes flip-v's translate about its right edge.
- **LC7.B2** (claim LC7.B2). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)))","replace":"translate(calc(10px), calc(10px + var(--pc-dy, 0px)))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. the base card never clamps across.
- **LC7.H2** (claim LC7.H2). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)))","replace":"translate(calc(-10px), calc(10px + var(--pc-dy, 0px)))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-h never clamps across.
- **LC7.V2** (claim LC7.V2). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))","replace":"translate(calc(10px), calc(-100% - 10px + var(--pc-dy, 0px)))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-v never clamps across.
- **LC7.HV2** (claim LC7.HV2). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))","replace":"translate(calc(-10px), calc(-100% - 10px + var(--pc-dy, 0px)))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-h.flip-v never clamps across.
- **LC7.B3** (claim LC7.B3). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)))","replace":"translate(calc(10px + var(--pc-dx, 0px)), calc(10px))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. the base card never clamps down.
- **LC7.H3** (claim LC7.H3). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)))","replace":"translate(calc(-10px + var(--pc-dx, 0px)), calc(10px))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-h never clamps down.
- **LC7.V3** (claim LC7.V3). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))","replace":"translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-v never clamps up.
- **LC7.HV3** (claim LC7.HV3). Edits: `` [{"file":"public/living-chart.css","find":"translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))","replace":"translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px))"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z25"]`. BITES. flip-h.flip-v never clamps up.
- **LC7.B4** (claim LC7.B4). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1))) translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));","replace":"  transform: translate(calc(10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px))) scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25"]`. BITES. the translate outside the counter-scale: exact at k=1, the gap 40px and the nudge four times itself at k=4.
- **LC7.H4** (claim LC7.H4). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)));","replace":"  transform: translate(calc(-10px + var(--pc-dx, 0px)), calc(10px + var(--pc-dy, 0px)))\n    scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25"]`. BITES. as B4 for flip-h.
- **LC7.V4** (claim LC7.V4). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));","replace":"  transform: translate(calc(10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))\n    scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25"]`. BITES. as B4 for flip-v (the -100% lift scaled four times too).
- **LC7.HV4** (claim LC7.HV4). Edits: `` [{"file":"public/living-chart.css","find":"  transform: scale(calc(1 / var(--zoom-k, 1)))\n    translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)));","replace":"  transform: translate(calc(-10px + var(--pc-dx, 0px)), calc(-100% - 10px + var(--pc-dy, 0px)))\n    scale(calc(1 / var(--zoom-k, 1)));"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)". E2e: `zoom`, expect exactly `["Z24","Z25"]`. BITES. as B4 for flip-h.flip-v.
- **LC7.w** (claim LC7.w). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-dx\", \"0px\");","replace":"el.style.setProperty(\"--pc-dxx\", \"0px\");"},{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-dx\", `${dx}px`);","replace":"el.style.setProperty(\"--pc-dxx\", `${dx}px`);"}] ``. Find occurrences: 1, 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)" | `test/site/place-card-clamp.test.ts`: "#387 a card measured off the bottom of the chart publishes the nudge that brings it back" (?); "#388 a card measured off the side of the viewport publishes the nudge on the other axis" (?); "#387/#388 the nudge is recomputed per show, never inherited from the card before it" (?); "#387/#388 a box the host cannot supply yet is not treated as an empty box at the origin" (?); "#387/#388 an open card is re-measured on demand, so a stale nudge cannot outlive its geometry" (?); "#387/#388 the host's box reaches the card through createLivingChart, not only the overlay" (?). E2e: `zoom`, expect exactly `["Z25"]`. BITES. both --pc-dx writes renamed (the reset and the nudge; the PR #719 row: renaming one leaves LC7 green); no card clamps across.
- **LC7.x** (claim LC7.x). Edits: `` [{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-dy\", \"0px\");","replace":"el.style.setProperty(\"--pc-dyx\", \"0px\");"},{"file":"src/site/living-chart/place-overlay.ts","find":"el.style.setProperty(\"--pc-dy\", `${dy}px`);","replace":"el.style.setProperty(\"--pc-dyx\", `${dy}px`);"}] ``. Find occurrences: 1, 1. Unit: `test/site/living-chart-css.test.ts`: "every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)" | `test/site/place-card-clamp.test.ts`: "#387 a card measured off the bottom of the chart publishes the nudge that brings it back" (?); "#388 a card measured off the side of the viewport publishes the nudge on the other axis" (?); "#387/#388 the nudge is recomputed per show, never inherited from the card before it" (?); "#387/#388 a box the host cannot supply yet is not treated as an empty box at the origin" (?); "#387/#388 an open card is re-measured on demand, so a stale nudge cannot outlive its geometry" (?); "#387/#388 the host's box reaches the card through createLivingChart, not only the overlay" (?). E2e: `zoom`, expect exactly `["Z25"]`. BITES. both --pc-dy writes renamed; no card clamps vertically.
- **LC8.a** (claim LC8.a). Edits: `` [{"file":"src/pages/explorer/index.astro","find":"<div id=\"map\" class=\"living-chart\"></div>","replace":"<div id=\"map\"></div>"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the Explorer host wires the contract: mount class + sheet link (#302)" | `test/site/explorer-room.test.ts`: "ER5 the sheet stays the Glass's gesture box, so a bookmark's cx/cy stay sheet fractions; the Glass stands at the chart's corner outside it". E2e: `render`, expect exactly `["R16"]`. BITES. ER5 (explorer-room.test.ts, another area's) reds on its own markup regex; the class keys nothing the Explorer paints today (F7).
- **LC8.b** (claim LC8.b). Edits: `` [{"file":"src/pages/explorer/index.astro","find":"extraCss={[\"/living-chart.css\", \"/explorer/broadside.css\", \"/explorer/chart-drawer.css\"]}","replace":"extraCss={[\"/explorer/broadside.css\", \"/explorer/chart-drawer.css\"]}"}] ``. Find occurrences: 1. Unit: `test/site/living-chart-css.test.ts`: "the Explorer host wires the contract: mount class + sheet link (#302)". E2e: `render`, expect exactly `["R16"]`. BITES. the Explorer loses the engine's sheet; render reads no overlay dress, so only R16 sees it there (on `cards` P2, P3, P15 and more would red).
- **LC8.c** (claim LC8.c). Edits: `` [{"file":"src/layouts/BaseLayout.astro","find":"{extraCss.map((href) => <link rel=\"stylesheet\" href={href} />)}\n","replace":""}] ``. Find occurrences: 1. Unit: none (the edit leaves every unit test green; no unit block). E2e: `render`, expect exactly `["R16"]`. BITES. unit green: `extraCss` still names BaseLayout's prop; every page loses its extra sheets, and render visits only the Explorer.
- **SG3.a1** (claim SG3.a1). Edits: `` [{"file":"public/explorer/index.css","find":"\n#map svg[data-vellum-style] {","replace":"\n#map svg[data-x] {"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each chart mount keeps its qualified chart rule (#367, #463)" | `test/site/explorer-room.test.ts`: "ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)". E2e: `render`, expect exactly `["R17"]`. BITES. SG3 still finds the print block's `#map svg[data-vellum-style]` and reds on its width; the chart lays out at its 1500x1158 attributes.
- **SG3.a2** (claim SG3.a2). Edits: `` [{"file":"public/explorer/index.css","find":"#map svg[data-vellum-style] {\n  width: 100%;\n","replace":"#map svg[data-vellum-style] {\n"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each chart mount keeps its qualified chart rule (#367, #463)". E2e: `render`, expect exactly `["R17"]`. BITES. the census's mutation: the chart takes its 1500px width attribute; ER6 (height 100%) stays green.
- **SG3.b1** (claim SG3.b1). Edits: `` [{"file":"public/reading-frame.css","find":".rf-chart svg[data-vellum-style] {","replace":".rf-chart svg[data-x] {"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each chart mount keeps its qualified chart rule (#367, #463)". E2e: `reading-room`, expect exactly `["RR36"]`. BITES. the Reading Room's chart lays out at its attributes; RR39 reads the same svg's shadow, still none.
- **SG3.b2** (claim SG3.b2). Edits: `` [{"file":"public/reading-frame.css","find":"  display: block;\n  width: 100%;\n  height: 100%;\n}","replace":"  display: block;\n  height: 100%;\n}"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each chart mount keeps its qualified chart rule (#367, #463)". E2e: `reading-room`, expect exactly `["RR36"]`. BITES. the frame's chart takes its 1500px width attribute.
- **SG4.a1** (claim SG4.a1). Edits: `` [{"file":"public/explorer/index.css","find":"\n#sheet {","replace":"\n#sheetx {"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)" | `test/site/explorer-room.test.ts`: "ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)". E2e: `render`, expect exactly `["R17"]`. BITES. SG4 finds the print `#sheet` and reds on its shadow; the Explorer's sheet loses position, shadow and its 0 base size; render reads no layout but R17.
- **SG4.a2** (claim SG4.a2). Edits: `` [{"file":"public/explorer/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: var(--sheet-shadow);"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)" | `test/site/explorer-room.test.ts`: "ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)". E2e: `render`, expect exactly `["R17"]`. BITES. the census's mutation: the sheet rests at the plate depth.
- **SG4.b1** (claim SG4.b1). Edits: `` [{"file":"public/reading-room/index.css","find":"\n#sheet {","replace":"\n#sheetx {"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)". E2e: `reading-room`, expect exactly `["RR36","RR39"]`. BITES. the Reading Room's `#sheet` rule renamed: static, unshadowed, its gesture box re-anchored on the fixed stage; RR40 and RR41 marked ?; LOCAL FIRST.
- **SG4.b2** (claim SG4.b2). Edits: `` [{"file":"public/reading-room/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: var(--sheet-shadow);"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)". E2e: `reading-room`, expect exactly `["RR39"]`. BITES. the Reading Room's sheet at the plate depth: RR39's own-against-probe read.
- **SG4.a3** (claim SG4.a2 (derivation, green arm)). Edits: `` [{"file":"public/explorer/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)" | `test/site/explorer-room.test.ts`: "ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)". E2e: `render`, expect exactly `[]`. LOCAL. the hand copy of the token's value alone: R17 stays green (own equals the probe), as it must; the runner refuses an entry that expects no red, so this arm runs locally and is named so in the ledger.
- **SG4.a4** (claim SG4.a2 (derivation, control)). Edits: `` [{"file":"public/explorer/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);"},{"file":"public/shell.css","find":"  --stage-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);","replace":"  --stage-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.5);"}] ``. Find occurrences: 1, 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)" | `test/site/explorer-room.test.ts`: "ER6 the page css fits the sheet to what the chrome leaves and stands print down (#462 rulings 1 and 10)" | `test/site/shell-css.test.ts`: "public/shell.css declares each palette token once at its ratified value, each depth shadow once, and the walnut deep once (Issue #263, Issue #367, Issue #463, Issue #461)". E2e: `render`, expect exactly `["R17"]`. BITES. the hand copy with the token's value changed on top: the sheet keeps 0.55 while the token reads 0.5, so R17's own-against-probe read reds.
- **SG4.b3** (claim SG4.b2 (derivation, green arm)). Edits: `` [{"file":"public/reading-room/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)". E2e: `reading-room`, expect exactly `[]`. LOCAL. as SG4.a3 for the Reading Room: RR39 stays green; 2g-reading proved the same derivation on this file in two parts for RR-room 6's own test (its plan, 'RR-room 6': the hand copy alone local and green, the token changed on top red), so the browser half is on record; this pair is run again because it names SG4 in its unit half.
- **SG4.b4** (claim SG4.b2 (derivation, control)). Edits: `` [{"file":"public/reading-room/index.css","find":"  box-shadow: var(--stage-shadow);","replace":"  box-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);"},{"file":"public/shell.css","find":"  --stage-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);","replace":"  --stage-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.5);"}] ``. Find occurrences: 1, 1. Unit: `test/site/shell-css-ground.test.ts`: "each mount dresses its sheet at the house depth, via the token (#367)" | `test/site/shell-css.test.ts`: "public/shell.css declares each palette token once at its ratified value, each depth shadow once, and the walnut deep once (Issue #263, Issue #367, Issue #463, Issue #461)". E2e: `reading-room`, expect exactly `["RR39"]`. BITES. the hand copy with the token changed on top: RR39's own-against-probe read reds.
- **SG5.a1** (claim SG5.a1). Edits: `` [{"file":"public/explorer/index.css","find":"/* [data-vellum-style] scopes this to renderer-stamped charts; unqualified it also sized the survey-track svg. */","replace":"#map svg {\n  box-shadow: var(--stage-shadow);\n}\n/* [data-vellum-style] scopes this to renderer-stamped charts; unqualified it also sized the survey-track svg. */"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)". E2e: `render`, expect exactly `["R17"]`. BITES. the census's plant: the chart svg casts the stage shadow under the sheet's (Z23 would red too, on `zoom`, since the overlay is a bare svg as well).
- **SG5.a2** (claim SG5.a2). Edits: `` [{"file":"public/explorer/index.css","find":"/* [data-vellum-style] scopes this to renderer-stamped charts; unqualified it also sized the survey-track svg. */","replace":"#map > svg ~ svg {\n  box-shadow: var(--stage-shadow);\n}\n/* [data-vellum-style] scopes this to renderer-stamped charts; unqualified it also sized the survey-track svg. */"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)". E2e: `zoom`, expect exactly `["Z23"]`. BITES. the overlay-only plant, aimed by sibling order and naming no engine class (a `.voyage-overlay` arm in a host sheet is refused by `vellum/css-engine-dress-one-home` already): the voyage svg follows the chart in `#map` (`mapEl.appendChild` in `src/site/living-chart/voyage-session.ts`), so it casts the stage shadow and the chart stays clean (F18).
- **SG5.b** (claim SG5.b). Edits: `` [{"file":"public/reading-room/index.css","find":"#map-viewport .rf-chart {\n  position: absolute;","replace":".rf-chart svg {\n  box-shadow: var(--stage-shadow);\n}\n#map-viewport .rf-chart {\n  position: absolute;"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)". E2e: `reading-room`, expect exactly `["RR39","RR43"]`. BITES. the bare plant in the room's sheet: RR39's chart-svg read and the overlay read.
- **SG5.c** (claim SG5.c). Edits: `` [{"file":"public/reading-frame.css","find":".rf-chart {\n  position: relative;\n}","replace":".rf-chart {\n  position: relative;\n}\n.rf-chart svg {\n  box-shadow: var(--stage-shadow);\n}"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)". E2e: `reading-room`, expect exactly `["RR39","RR43"]`. BITES. the same plant in the swept frame sheet.
- **SG5.d** (claim SG5.d). Edits: `` [{"file":"public/reading-room/index.css","find":"#map-viewport .rf-chart {\n  position: absolute;","replace":".rf-chart > svg ~ svg {\n  box-shadow: var(--stage-shadow);\n}\n#map-viewport .rf-chart {\n  position: absolute;"}] ``. Find occurrences: 1. Unit: `test/site/shell-css-ground.test.ts`: "no mount dresses a BARE svg: the engine's overlays are not sheets (#367)". E2e: `reading-room`, expect exactly `["RR43"]`. BITES. the overlay-only plant in the room's sheet, by sibling order as SG5.a2 (F18); RR39's chart read stays green.

## D. The 2i table

| file | test, as renamed | what stays | why no browser here sees it | class |
|---|---|---|---|---|
| `test/site/living-chart-css.test.ts` | "the raised town's rule and the card's rule are each declared once (#632; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and P36 and Z27 read the stacking)" | `soleRule(css, ".place-hit.pc-near")`, `soleRule(css, "#place-card")` | a repeating block changes nothing; a differing one moves a value P36, Z24, Z26 or Z27 reads | (c) |
| same | "the philologist's note and its roots are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z26 reads the dress and P16 the engine's classes)" | `soleRule` on `.pc-tongue` and `.pc-roots` | as above | (c) |
| same | "the flipped card's rule and the card's own rule are each declared once (#124; kept for Issue #779 part 2i: a second block repeating the first shows nowhere; Z24 reads the seats)" | `soleRule` on `#place-card.flip-h` and `#place-card` | as above | (c) |
| same | "every card variant is declared once, and its transform carries one translate and one scale (#387/#388; kept for Issue #779 part 2i: a repeating block, or a second translate or scale composing to the same matrix, shows nowhere; Z24 and Z25 read the seats and the clamp)" | per variant: `soleRule`, the translate count, the scale count | a repeating block changes nothing; a trailing `translate(0px, 0px)` or `scale(1)` composes to the same matrix (every function after the leading scale already sits inside it); a second translate or scale that moves the card is read by Z24 (the seat) and Z25 (the flush) | (c), (e) |

`codeOf` and `ENGINE_RULES` leave the file with LC1, LC5's class pins and LC6's and LC7's `setProperty` pins; `soleRule`, `read` and `root` stay for LC3 to LC7 as shrunk and for LC4 (2i's). The file's comment above LC6 leaves with it. Proposal (F9): the four shrunk tests and LC4 are one claim class, so they could be one kept test over a roster of selectors.

## E. Errata rows (dead CSS and sibling defects found)

1. **Dead: `#place-card[hidden] { display: none; }` in `public/living-chart.css` (line 66), and its comment.** No author rule sets `display` on `#place-card` (its own rule, the three flip rules and nothing else in `public/living-chart.css`, `public/house.css`, `public/motion.css`, `public/atelier.css`, `public/shell.css`, `public/explorer/*.css` names the card: grep for `place-card`), so the user agent's `[hidden]` rule already hides the card; the comment's "id plus attribute beats the id-only rule above" names a contest the id-only rule never enters. The same family as PR #861's `.stage .warning[hidden]` row in `handbook/errata/site.md` (line 78): extend that row, or add one beside it, searched first. LC1.e's pin leaves with LC1; the declaration stays for whoever deletes it. Probe F1 confirms before the row is written.
2. **Dead: `.ages-range:focus-visible { outline: 2px solid var(--ink-dark); outline-offset: 2px; }` in `public/living-chart.css` (line 316).** The house ring `:is(a, input, select, [tabindex], button:not(.place-hit)):focus-visible` in `public/house.css` (line 88) is (0,2,1), the arm's own (0,2,0), and it sets the same ring, so the house decides and the rule computes nothing of its own. Not a pin of this area (LC1's `.ages-range` claim is the base rule's), but `test/site/house-style.test.ts`'s "the focus ring: 2px ink-dark, everywhere (#324 decision 6)" reads this rule's body, so its owner should know the pin is on dead CSS (2g-plates call 24). A `handbook/errata/site.md` row.
3. **Sibling defect, prose (a fact, not a rule): the host contract overstates the class's half.** `handbook/specs/explorer-doctrine.md` ("A page that skips either renders its overlays undressed") and the header comment of `public/living-chart.css` ("both halves or the overlays render undressed") say a host without `class="living-chart"` renders its overlays undressed. Only the three ink-in rules key on `.living-chart` (`grep -n "living-chart" public/living-chart.css`); the overlays, hits, card and track are dressed by unscoped class selectors. On the Explorer, whose bar-less host never calls `applyScrub` (`src/site/living-chart/no-bar.ts` calls only `exitScrub` and `clearScrub`) and so never writes `data-ink`, the class keys nothing it paints. A corrected fact edits the spec that owns it (`CLAUDE.md`, "Session handoff"); whether this round corrects it or files a `handbook/errata/prose.md` row is the planner's call (F7).
4. **`handbook/errata/guards.md` PR #714 row (line 109)**, `CHART_MOUNTS` and `QUALIFIED_CHART_RULES` hand-kept: its subject leaves with SG3 to SG5; the row is closed by the pull request that deletes them.
5. **`handbook/errata/guards.md` PR #719 row (line 115)**, LC7's whole-file `setProperty` match blind to the computed nudge: closed when LC7's publish pins leave (Z25 reads the nudge land, and row LC7.w renames both writes).
6. **`handbook/errata/prose.md` PR #642 rows**: line 50's "living-chart-css.test.ts:129" half leaves with LC6 (its shrink-to-fit comment goes); the sheet half now stands at `public/living-chart.css:69`, not `:37`, so the row is re-pointed. Line 52's "`#place-card .pc-inner:focus-visible` did not join ENGINE_RULES" is moot once `ENGINE_RULES` leaves; that focus ring is read by no check (P27 focuses the inner but reads only its tab stop and scroll), noted, not designed (no assertion here claims it).

## F. Probes and doubts

1. **CONDITIONAL, LC1.e DEAD.** Probe (local, built `dist/`): delete `#place-card[hidden] {\n  display: none;\n}` from the built `public/living-chart.css`, open `/explorer/#seed=42&style=antique`, and read `getComputedStyle(document.getElementById("place-card")).display` with the card hidden. `none`: DEAD stands, E1 is written. Anything else: the rule is live, LC1.e becomes NEW, held by Z26 reading the hidden card's display `none` before it focuses the capital, and its row is `[{"file":"public/living-chart.css","find":"#place-card[hidden]","replace":"#place-card[data-x]"}]` (count 1) on `zoom`, expecting `["Z26"]`, unit LC1.
2. **CONDITIONAL, Z24's premise.** Run `zoom` unmutated with the check in. A fault naming a non-zero `--pc-dx` or `--pc-dy` at k=1 means that variant's target needs a nudge in the harness window: move its target 0.05 toward the centre and run again.
3. **CONDITIONAL, Z27's witness and its A.** Run `zoom` unmutated: the step logs A and B. If no A of the first eight hosts a B clear of the action row, the tries are raised to all 26 places; the 14px inset stays. If A is an unflipped town, row LC7.B1 adds Z27 to its set (the base card without its transform stands on its own town, so the hand on A is over the card and the control reads B's cursor `default`).
4. **CONDITIONAL, Z25's witness.** Seed 42's 26 towns at k=4 centred are predicted to give every variant a nudge on both axes; the step logs the per-variant counts. A zero is fixed by adding a second camera seat (k=4 centred on (0.25, 0.25)) to the sweep, not by dropping the witness.
5. **Doubt, Chromium's `::after` style without content.** Row LC1.c predicts Z8b green because `getComputedStyle(hit, "::after")` resolves the shown rule's opacity 1 and `scale(1)` for a pseudo whose `content` is gone; if Z8b reds, it is named in that row's set (it reads the same broken ring). This is why Z22 reads `content` and the ring's size, not only its opacity and transform.
6. **LOCAL FIRST rows**: LC1.d (`#place-card` renamed), LC1.i (`.pc-inner` renamed), SG4.b1 (the Reading Room's `#sheet` renamed, RR40 and RR41 possible extras). Their sets are measured locally before the send and the measured set is sent.
7. **DECISION for Alex, possibly: LC8.a.** The Explorer's `class="living-chart"` keys nothing the Explorer paints (E3): only the ink-in rules read it, and the Explorer never inks. R16 reads the class as authored, which 2g's PR36, PB12 and RB11 did for authored markup; the alternative is to keep LC8.a's source pin for 2i as class (e). The design takes the authored read, but the doctrine sentence it rests on is false as written, which is Alex's to rule (correct the spec, or keep the class as a contract with no visible half).
8. **The unfurl wait in Z25.** The brief binds a rest wait before a card is measured; the clamp itself (`clampIntoView`) measures `#place-card`'s own box at once, which `.pc-inner`'s roll does not move (only the inner's box is foreshortened). The wait is kept, under emulated reduced motion, at about 3 s on CI for 26 cards; dropping it would be a call against the brief, not taken.
9. **Proposal: fold the "declared once" pins into LC4.** LC3, LC5, LC6 and LC7 shrink to `soleRule` calls (and LC7's two counts); with LC4 they are one class (c). One kept test over a roster (`.pc-acts`, `.pc-lay`, `.pc-lay.dim`, `.place-hit.pc-near`, `#place-card`, `.pc-tongue`, `.pc-roots`, the three flips) is the smaller 2i surface; the planner's call.
10. **Overlap with another 2h area.** `test/site/explorer-room.test.ts` ER5 reds on row LC8.a, and ER6 on SG3.a1, SG4.a1, SG4.a2 (named in those rows). If the agent designing explorer-room builds an "Explorer as authored" read in `render` (or elsewhere), R16 merges into it and R17 may share its dress read; the ids then follow that check.
11. **The run caps**: `cards.ts`'s `run` is at 50 and `zoom.ts`'s at 46 with six steps to add, so both are split first (section B; the zoom split is the planner's, `zGeometric(ctx, k)`). Every new function stays under 50 code lines; `zoom/camera.ts` about 255 code lines after, `zoom/dress.ts` about 275, `zoom/gestures.ts` about 95, `cards/gestures.ts` about 45; nothing joins `eslint-suppressions.json`.
12. **Multi-occurrence hooks.** Rows LC1.b, g, h, i, r, s, u, aa, ac, ad, ae rename the hook's own rule and leave LC1 green (the roster string stands elsewhere); they go e2e-only, as 2g-plates did for `.contents` (PRR8.a). The other rules naming those hooks (`.voyage-ship .rig`, the two thumbs, `.pc-prospect:hover`, `.pc-lay.dim`, the inner's variant rules) are not claims of any assertion in scope; `.ages-range::-moz-range-thumb` is Firefox's alone and no Chromium check can read it.
13. **LC7's counts kept as 2I (e)** against the doctrine line that the guard "COUNTS the translates and scales per variant, because the match alone passes on a second leading translate": with the leading counter-scale held by Z24 and Z25 at k=4, any function after it sits inside it, so a second translate or scale is either neutral (invisible) or moves the card (read). Open to overrule.
14. **Z8 under LC1.d.** Predicted green: seed 42's town nearest the viewport's centre is Laukuwelua (flip-h) or Nanawotani (flip-v), a near tie (both 0.0909 sheet-heights from the centre), and either flip rule supplies a counter-scaling transform even with the base rule gone. If Z8 reds, it joins LC1.d's set.
15. **Z23 arms the survey in `zoom`**, as Z14c, Z20d and Z20g do, so SG5's Explorer half is read on lane A rather than on `survey` (lane D). Probe: `zoom` unmutated green twice with the check in, and `zoom,zoom-gestures` green (the next suite in lane order inherits the page).
16. **R17 runs last in `render`**, and `render` is inherited by `motion`, `turn`, `verso`, `glass-ceremony`, `cards`, `fallback`: it only reads. R16 and R17 read host dress and the link, never engine dress, so no `cards` row's expected set inherits a render check.
17. **The P28 and P31b noise is why card rows avoid `cards`.** Rows LC1.r and LC5.c name what `cards` would add if they ran there (P28, P31b; P17b), so a planner moving a row back to `cards` knows its set.
18. **CONDITIONAL, the sibling-order plants (SG5.a2, SG5.d).** `#map > svg ~ svg` and `.rf-chart > svg ~ svg` reach the survey track only if the track is a later sibling of the chart in its mount (the engine appends it, `mapEl.appendChild(svg)` in `src/site/living-chart/voyage-session.ts`, after the draw seats the chart). Probe: in each room, read `[...mount.children].map((c) => c.tagName + "." + c.getAttribute("class"))` with the track inked. The chart first: the rows stand. Otherwise the plant becomes `#map > svg:last-child` (and `.rf-chart > svg:last-child`), re-counted. The plants avoid naming `.voyage-overlay` because `vellum/css-engine-dress-one-home` already refuses an engine class in a host sheet; the runner never lints, but a row should not lean on a form the lint already holds.
19. **A call open to overrule: card rows routed to `zoom` for exact sets.** The brief asks for "a new read only where none does". Existing checks do red on several of these edits: P14 on `.pc-inner` (LC1.i); P28 and P31b on `.pc-prospect` (LC1.r; the link losing its own pointer-events is that rule's dress); CD57 on `.pc-acts` and `.pc-lay` (LC1.q, LC1.s); P20, P21, P23, P26, P27 on `#place-card` (LC1.d). Section A names them. The rows run on `zoom` because `cards` adds the hold group's travel and press checks unpredictably (and `chart-drawer` costs 210 s a job), and because the dress Z26 reads is needed anyway for the head and note parts nothing else reads. A planner who prefers the existing holders moves LC1.i and LC1.r to `cards` with the sets F6 and F17 give, measured locally first.
20. **The SG4 derivation pairs** (SG4.a3 and SG4.a4, SG4.b3 and SG4.b4) change `--stage-shadow` in `public/shell.css` only in the control rows, so `test/site/shell-css.test.ts`'s declaration test reds there (named); the green arms touch no token.
