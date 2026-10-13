# Recon ledger: Issue #779 part 2h, verified at main 2b148100 (vellum-spec-recon, 2026-10-12)

Verbatim in substance from the recon agent's report; read-only throughout. Issue data it fetched is under the scratchpad's `779/` folder.

## 0. What was read and touched
- `git rev-parse HEAD origin/main`: 2b148100 both; no open PR; board 351 of 351 rows; #779 Todo in "Lint & static checks".
- Issue body and all 50 comments (ending 6103806702, 2026-10-11T00:34:55Z); 6065398364 and 6100496370 were edited after posting (current bodies read). #600, #514, #843 read. Part 2, 2g, 2f, 2e, 2c plans read.
- Boundary touches: imported `test/e2e/lane-timings.test.ts` once in a node probe (its two arithmetic tests ran, nothing written); one ESLint CLI `max-lines` count (`--no-config-lookup`, house options), wrote nothing; scratch scripts in the scratchpad.

## A. STALE, blocking
1. **The four-page `is:inline` pin (`test/site/app-bundles.test.ts:19`) held by astro-scaffold's built-page test** (census L443): STALE. 2f measured with the installed compiler that removing `is:inline` leaves `dist` byte-identical for home and the Specimen (`handbook/plans/779/779-part2f-pages-plan.md:15,216`), so no built read can red on its absence and a proof of that mutation comes back HOLE. For the four pages it is inferred, UNVERIFIABLE (not built). Only route: ruling 1 of 6091335054, which names two pins, not this one (decision 1).
2. **The plate dress row's host is the Print Room** (census L433; the test's title "(the consumer is now print-room)"): STALE. No Print Room element wears `.plate`; wearers are home's three shelf plates (`src/pages/index.astro:177,180,183`), `#pp-plate` (`src/pages/prospect/index.astro:24`), `#rb-plate` (`src/pages/ribbon/index.astro:24`). A host on `#pp-plate` or `#rb-plate` would pin the lift and tilt Issue #514 (open, Alex's feel question) asks about (decision 2).
3. **ER6's destination** (census L384: print `.stage` static and `#map` transform none added to `fl6Paper`): STALE (reasoned from the two rules, not run). The kit's print block sets `body.chart-room .stage { position: static; animation: none }` (`public/atelier.css:54,813-819`), so the Explorer's print `.stage { position: static }` (`public/explorer/index.css:255-267`) is redundant, the class the PR #858 row (`handbook/errata/site.md:75`) records for four other sheets and does not list `public/explorer/index.css`: extend the row, no pin (2g call 7, 6100496370 call 24). ER6 asserts about nine claims: stage `padding: var(--reserve-top`, no `max-width: 1100px`, `touch-action: none` on `#map-viewport.zoomable`, `#map` `transform-origin: 0 0`, svg `height: 100%`, `#sheet` `box-shadow: var(--stage-shadow)`, print `.stage` static, print `#map` `transform: none !important`.
4. **Census colour strings** (`rgba(61, 47, 31, 0.5)` and the like; plan L153's parser in `home/reads.ts` and `cluster/trail.ts`): STALE for every colour read. Chromium serialises one token as `rgb()`, `color(srgb ...)` or `oklab(...)` by property; the instrument is `PAGE_RGBA`, `GRADIENT_STOPS`, `SHADE`, `tokenRgba`, `nearRgba` in `e2e/support/pixel.ts` (one canvas pixel, 2 per channel, 3 on alpha; a panel stop within 1, 6096830340).

## A. STALE, cosmetic or narrowing
- AK6 "no suite presses a glass-keys room's out or home": narrowed. `sb13GlassPress` (`e2e/suites/specimen/desktop.ts:323`) presses `zoom-reset` (`data-zoom="fit"`) through the kit's binder since 2f; `handbook/errata/guards.md:174` already says the unread press is the out press alone. `cd21PortfolioGlass` presses only `[data-zoom="in"]`.
- `#beasts` missing from BR1's want map: CURRENT but too narrow. `beasts` is in no BR check; the `HAND` list has it, so broadside's tests at :56 (Hand), :35 (seed row), :66 (Press) and the seals test at :88 share the gap. R15 (`render.ts:29-31,226-249`) reads `#beasts` presence and its effect, not its group or seal dress.
- The 2h suite list (`render`, `cards*`, `broadside`, `glass-ceremony`, `zoom*`, `turn`, `survey`): `turn` has no remaining row (CT7b went to 2g); the census destinations also name `corners/floor.ts` (ER6), `stage` (ER7), `runninghead`, `chart-drawer` (CD21, CD23, CD24), `specimen` (SB9b, SB9c), `room-ink`, `reading-room`, `print-room`.
- HZ2 to 2h: superseded, 2g took it (6098118329 ruling 3's list).
- `fl6Paper` is the function (`e2e/suites/corners/floor.ts:375`); the check id is FL6 (`floor.ts:405`, step `corners.ts:378`).
- `test/site/kit-scope.test.ts` is gone (PR #841).
- "about 60" tests: 46 tests move to 2h, at least 187 static assertion calls (31 hooks in one test alone); size the sends by claims.
- `e2e/suites/broadside.ts:1` header ("the unit pins in test/site/broadside.test.ts hold the SOURCE to this shape") goes false in 2h: edit it.
- Holder line numbers drifted for CD21, CD23, CD24, RH2, RH3, R14 (section C); BR1, BR5, BR7 exact.

## A. CURRENT
- 50 comments; the PR #569 row removed (in PR #861, from `site.md`); ER1's tagline read by no browser check (`HEAD_READ` reads computed style, never text; the 15/15 figure UNVERIFIABLE); `.archivist-label` worn by no served element (rule only at `public/house.css:28`; `.archivist-head` worn by `#grp-land`, `#grp-hand`, `src/pages/explorer/index.astro:50,81`; no errata row yet); `fl6Paper` reads `#sheet` box-shadow on `/explorer/` at :373, asserts it only for the Portfolio at :392; Z8b reads the ring after its grow-in, hit box within 1px of 26 (`zoom/camera.ts:120-166`); R14's worker-vs-inline bytes cannot see the held chain cache (`worker.ts:46`, `worker-client.ts:193`; R14 holds `detail: true` and the stamp); AK6's regex has no `document.` anchor; sequencing and clearance stand (PR #858 `f37a7bda`, PR #861 `2ce997fe`).

## A. UNVERIFIABLE
Every "mutation reds X" or "left Y ALL PASS" in the census and in 6089867328 (reasoned, not run), including zoom 39/39, runninghead 15/15 and 2f's byte-identical dist.

## B1. The population: 46 source-reading tests in the 13 files, not named for 2i
| file:line and name | census row | holder |
|---|---|---|
| atelier-kit:22 AK2 | L447 BUILT | none (runninghead visits every room, lane B) |
| atelier-kit:32 AK3 | L448 BUILT | none |
| atelier-kit:53 AK4 | L449 BUILT | none |
| atelier-kit:111 AK6 | L280 HELD part | CD21 (`chart-drawer/portfolio.ts:252`), SB13 (fit); out unread |
| atelier-kit:119 AK5 | L450 BUILT | none |
| atelier-kit:140 AK7 | L376 BROWSER | extend G1 (`glass-ceremony.ts:89`; G1 holds aria, glyph text, no svg or title, radius 4px, size 35.2 only); last assertion retire-shaped |
| broadside:24 groups in reading order | L452 BUILT | BR1 reads membership, not order |
| broadside:35 seed row | L287 HELD part | BR1; `beasts` unread |
| broadside:46 The Land | L285 HELD whole | BR1 |
| broadside:56 The Hand | L284 HELD part | BR1; `beasts` unread |
| broadside:66 The Press | L286 HELD part | BR1 |
| broadside:88 seals | L453 BUILT | none (BR3 clicks a seal) |
| broadside:108 footnote marks | L451 BUILT | none |
| broadside:116 glossary anchors | L282 HELD part | BR7 (`broadside.ts:287`) |
| broadside:124 drafting-table | L283 HELD part | BR7; the three term entries unread |
| explorer-page:8 survey label | L455 BUILT | none |
| explorer-room:27 ER1 | L289 HELD whole (tagline unheld) | RH2 (`runninghead/heads.ts:83`), RH3 (:102) |
| explorer-room:35 ER2 | L456 BUILT | none |
| explorer-room:45 ER3 | L457 BUILT | none |
| explorer-room:57 ER4 | L458 BUILT | none (retire-shaped `action-link` absence inside) |
| explorer-room:75 ER5 | L459 BUILT | none |
| explorer-room:101 ER6 | L384 BROWSER | FL6 (lane C) |
| explorer-room:126 ER7 | L385 BROWSER | `stage` boot (lane B); first assertion an import pin of `bindRoom` |
| living-chart-css:65 engine hooks | L407 BROWSER | P2/P3 in `cards/overlay.ts`, `room-ink.ts` (31 hooks) |
| living-chart-css:73 zoom-k | L314 HELD whole (ring-at-rest unheld) | Z8b (`zoom/camera.ts:150`) |
| living-chart-css:90 pc-near z | L408 BROWSER | beside P29 (`cards/hold.ts:179`, over cap) |
| living-chart-css:108 philologist | L406 BROWSER | beside P16 |
| living-chart-css:125 flip-h | L403 BROWSER | beside P19 |
| living-chart-css:146 clamp | L404 BROWSER | beside P23 |
| living-chart-css:173 host wiring | L485 BUILT | none |
| room:19 screen-only | L345 HELD whole (other sheets unheld) | RH10c (`runninghead/gallery.ts:41`), SB9b (`specimen/print.ts:5`) |
| room:110 pill fade | L343 HELD whole (arms unheld) | CD23 (`chart-drawer/desk.ts:178`), CD24 (`chart-drawer/portfolio.ts:178`), lane D |
| shell-css-ground:58 qualified chart rule | L423 BROWSER | render; RR36 |
| shell-css-ground:66 house depth | L424 BROWSER | render, reading-room |
| shell-css-ground:78 bare svg | L425 BROWSER | survey (lane D), reading-room |
| shell-css:125 raise/press tokens | L432 BROWSER | beside P2b |
| shell-css:137 plate dress | L433 BROWSER | host STALE |
| shell-css:168 lifting surfaces | L431 BROWSER | cards; runninghead |
| house-style:21 archivist | L393 BROWSER | broadside (`.archivist-head` live; `.archivist-label` unworn) |
| house-style:36 control idiom | L394 BROWSER, ruled to move | beside P2/P2b |
| house-style:53 focus ring | L395 BROWSER | broadside or corners |
| house-style:65 roles worn | L478 BUILT | none; 11 assertions over 8 pages |
| region-detail-wiring:117 worker and inline twin | L339 HELD part | R14 (`render.ts:344/367`), RD1/RD2 |
| table-address:325 allowlists | L506 BUILT | none |
| tip-affordance:38 footnote tip | L435 BROWSER | BR5 (`broadside.ts:227`) |
| app-bundles:19 is:inline | L443 BUILT | none (decision 1) |

## B2. Not 2h moves in those files
room:10 (Glass seat, DATA); shell-css-ground:97 (committed charts, DATA); shell-css:52 (stylesheet value vs `SITE_PALETTE`, DATA); tip-affordance:46 (WITNESS, 2i); app-bundles:45 (2i by 6089867328 calls 5 and 9); app-bundles:82,92,102,117,133 (configs, data).

## B3. Excluded, kept for 2i (verified present)
house-style:17, :119; shell-css-ground:13, :25; shell-css:189; atelier-kit:172 (AK8); room:74; living-chart-css:102.

## B4. Sweep of the rest of test/
Everything else is in a round's record or exempt. In no round's record and not named for 2i: `test/prospect/plate-face.test.ts:15` (reads the committed generated `src/prospect/letter/face-*.ts` byte for byte; census call 2 puts generated files out, named nowhere); `test/repo/e2e-read-types.test.ts:281` (reads the e2e tree through the TypeScript program; binding on 2h: every new kept read states its shape). The names guard's borne half (`lint-wiring.test.ts:520`) is 2i's by 6062144754 call 7.

## C. Holder ids at main
BR1 `br1Groups`@59, check 72; BR5 `br5Hover`@217, 227; BR7 `br7Glossary`@277, 287; CD21 `cd21PortfolioGlass`@239, 252; CD23 `cd23LineLeaves`@178, 196 (`desk.ts`); CD24 `cd24PortfolioSays`@178, 193 (`portfolio.ts`); RH2 `rh2Members`@67, 83; RH3 `rh3Fixed`@89, 102; RH10c `rh10cPrinted`@41, 73; RH17 `rh17ShellOnce`@122, 127; SB9b `sb9bPrinted`@5, 12; SB9c `sb9PrintIsPaper`@33, 58; Z8b `z8bHoverRing`@120, 150 (assert 157); R14 `r14Region`@344, 367; G1 `g1Cluster`@75, 89; P2 `p2Idle`@57, 62; P2b `p2bPressLift`@73, 79; P16 `p16Glass`@4, 27; P19 `p19CardsFit`@8, 26; P23 `p23CapHolds`@153, 167/171; P29 `p29NearestTown`@179, 199; FL6 `fl6Paper`@375, check 405. Helpers: `midGlideRefit` `print-room/print.ts:65`, `lensRest` :12, `homeCamera` :36, `pressAt` `print-room/kit.ts:50`, `clearMetrics` :56, `sendKey` `e2e/support/home.ts:42`, `contrast` `cluster/trail.ts:29`, pixel helpers in `e2e/support/pixel.ts`, `makeStep` `e2e/support/step.ts`.

## D. Code lines (eslint max-lines count) and the size list
render.ts 342 (mlpf 1); broadside.ts 282; glass-ceremony.ts 359 (mlpf 1); turn.ts 173 (mlpf 1); survey.ts 61; cards.ts 92; cards/cap.ts 258 (mlpf 3); cards/glass.ts 112; cards/hold.ts 402 (max-lines 1, mlpf 2, over cap); cards/kit.ts 26; cards/overlay.ts 281 (mlpf 1); cards/reads.ts 24; zoom.ts 93; zoom/bands.ts 254 (mlpf 1); zoom/camera.ts 152; zoom/controls.ts 110; zoom/kit.ts 64 (mlpf 1); zoom/reads.ts 4; zoom/region.ts 262; zoom/resets.ts 188 (mlpf 1); corners.ts 359; corners/floor.ts 410 (max-lines 1, over cap); corners/geometry.ts 134; corners/top-row.ts 185; stage.ts 31; stage/glyphs.ts 44; stage/short.ts 232 (mlpf 2); stage/stage.ts 474 (max-lines 1, over cap). Also zoom-gestures.ts 131 (mlpf 1); survey/arm 212, beat 210 (mlpf 3), closing 19, kit 51, links 169, mount 195 (mlpf 2), turn 161 (mlpf 2); hunt.ts 503. `LIST_AT_REFORMAT` (`test/repo/lint-config.test.ts:48`) matches. Listed unit files among the 13: atelier-kit (mlpf 1), room (mlpf 1), house-style (mlpf 1), app-bundles (mlpf 1), table-address (max-lines 1). The rulebook (about 381-392) says the list counts overruns, not sizes; review holds a listed file's growth.

## E. Lanes at main (MEASURED_SECONDS total 1682.5 s, cap 0.3)
A 414.9 s (24.66%), headroom 128.36 s; B 426.5 s (25.35%), 111.79 s; C 391.1 s (23.25%), 162.36 s; D 450.0 s (26.75%), 78.21 s (agrees with 6103806702 call 28).

## F. The four files
kit-scope gone (PR #841); fonts: no row left (PR #835; RH14 reads the kit's faces); specimen: SB1, SB2 left in PR #835, SB3 reads `.gitignore` and imports `BUNDLE_ENTRIES`; route-tree: its retire row left in 2e (PR #833), `:167` is `existsSync` only.

## G. The proof runner
`npm run proof -- send <mutations.ts|.json> [--sha] [--runner] [--label]` or `send --raw <proof.json>`; `read <run-id> [--out] [--keep]` (deletes the `proof/` branch unless `--keep`; exit 0, 1, or 3 not finished). Entry `{ id, patch?, edits?, unit?, lint?, e2e? }`; an edit is `{file, find, replace}` (find once), `{file, line, from, to}` or `{file, append}`; edits compile to a diff that must apply and cannot create a file. `MAX_JOBS = 256` counting controls; one e2e control per distinct normalised selection, one `control-unit` with the union of unit files, one `control-lint`. Budgets: unit 300 s, lint 300 s, e2e 600 s; `budgetSeconds` may only lower them. `checkProblems` refuses a patched entry expecting no red, an unpatched entry expecting a red, bad ids (`[A-Za-z0-9._-]{1,80}`, no `control-` prefix, no duplicate), a patch touching `package.json`/`package-lock.json` or outside the tree, a lint plant creating a file, and selections breaking `NEEDS_PREDECESSOR` or `OPENS_ON_HOME`. Verdicts: BITES only on an exact match; HOLE if nothing reds; IMPRECISE if the set differs (extras included); NEEDS READ if the suite stopped; INCONCLUSIVE if the control is red on anything; UNPROVEN on timeout; NOT APPLIED if the patch fails.

## H. Open decisions recon flags (not resolved)
1. Does ruling 1 of 6091335054 reach the app-bundles four-page `is:inline` pin? It names home's and the Specimen's tags; 6055743231's closing left "the `is:inline` pins (Issue #600)" to the pull request that meets each; the census (L157) promised to bring the pins to Alex; 2f call 9 and the frozen 2g plan assumed the third goes on ruling 1's terms; no statement of Alex names it. The holder cannot red; `handbook/specs/site-architecture.md:216-222` describes the pin and goes false if it leaves.
2. Where the plate dress read lives, given Issue #514 (home's shelf decides nothing about #514 but is a host the census never named).
3. Retire-shaped and dead-CSS halves: 2e call 5, 2f call 11, 2g-plates call 24 and 2g-reading calls 4 and 5 read ruling 6 differently; all lane calls. 2h meets AK7's `zoom-keys`/`.lf-btn` absences, ER4's `action-link` absence, ER6's 1100px absence and the dead print arm, AK2's "home keeps its own stage dress", the dead `.archivist-label` rule, and `region-detail-wiring:117`'s `chainCache` presence.
4. Does 6098118329 ruling 3 (import pins kept for 2i) reach ER7's `bindRoom` import pin?
5. Where 2h's new checks go: ruling 2 is worded for 2g's rooms; census destinations point into over-cap files (`cards/hold.ts`, `corners/floor.ts`, `stage/stage.ts`).
6. The five-lane split's 0.24 cap and `max-parallel` 11 are the orchestrating session's derivation, not Alex's words.

## H. Ratified statements the 2h work would contradict or move
`handbook/specs/site-architecture.md:216-222` (the `is:inline` bullet names this pin); `handbook/errata/site.md:75` (extend to `public/explorer/index.css`); `handbook/errata/guards.md:109`, `:111`, `:115`, `:174` (each leaves or narrows with its test); `public/house.css:1` cites `ruleOf` in house-style (holds while the kept status test keeps `ruleOf`); `handbook/specs/check-placement.md:76` cites `room.test.ts` (kept as data); `e2e/suites/print-room/print.ts:214` cites `room.test.ts`; `e2e/suites/broadside.ts:1`.
