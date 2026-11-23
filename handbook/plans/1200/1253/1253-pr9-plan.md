# Issue #1253, pull request 9: the pointing hand in the Portfolio

**Planned at:** origin/main `8c68865c509c128778a66db6e22bcb3497d54de5` (`git fetch origin`, then `git rev-parse origin/main`, re-read when Q7 was folded), the issue's comment count 34 (`gh api --paginate repos/ahl-gram/Vellum/issues/1253/comments | jq length`, re-read last before this plan was handed back): the 30 comments pull request 8's archived plan names (Alex's rulings on it, 7091283845, the last of them), that plan's archive (7091307459), Alex's rulings on this plan (7102411658), pull request 8's step 12 record (7102661744), which records no ruling, and Alex's ruling on Q7 (7103237584). Ten of the 34 open `Plan archive, not a ruling:` and are not rulings. Pull request 8 (the Gallery) merged as PR #1434 at `8c68865c`. Every reading below was taken on a tree at `4dfcee7a` with pull request 8's planned change laid under this one, uncommitted (`out/1253-dry-run/1253-pr9-base-pr8.diff` and its new `src/site/gallery/app.ts`), and main as merged equals that base in every file the two touch: each of the 15 files PR #1434 changes but its archived plan, and each of the seven files this plan edits, is byte for byte the planner's base copy (`git archive --output=out/1253-dry-run/1253-pr9-main-8c68865c.tar origin/main <the 19 files>`, extracted and compared with `cmp`, every file the same; `git diff --stat 4dfcee7a origin/main` lists PR #1434's 16 files and nothing else). Main carries `"/gallery/"` as the last line of `HAND_ROOMS`, the Gallery's witness as the last line of BP-H1's witnesses, PK26 after PK25 and the `--primer-slip-h` token in `src/styles/shared/primer-hand.css`, exactly as this plan reads them; `src/site/explorer/portfolio/paint-top.ts`, `test/portfolio/paint-top.test.ts` and `handbook/plans/1200/1253/1253-pr9-plan.md` are not on main, and no test on main is named PK27, PK28, PK29 or PF10 (`git grep` over `origin/main`).

**Rulings:** Alex, 2026-11-23, https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7102411658, ruled from the stills in the main checkout's `out/1253-pr9/`: Q1 "On arrival, mark dropped", Q2 "Both wait, here", Q3 "Open an empty table", Q4 "Build as shown", Q6 "Yes, close it", each the planner's recommendation; Q5 "Fix it here", not the planner's recommendation, which brings the press row's fix into this pull request and this plan back to him with the fix measured; the order "Start Gallery now", pull request 8 building and merging first; and the planner's calls C129 to C143 stand. Then Alex, 2026-11-23, https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7103237584, ruled from the stills in the main checkout's `out/1253-pr9-fix/`: Q7 "Build the fix (Recommended)", and the planner's calls C144 to C146 stand; the two-line press row at 1280 as the arrival state is posted on Issue #1258 (comment 7103237997). This room's look readings are posted on Issue #1258 (comment 7102412007, C139). The Rulings section at the foot quotes each and names what it binds.

**Open decisions:** none.

**Rulings that bind this plan before its own menu:** M1 to M6 (6867668486), C13 and C23 (6869168142), PH3 dropped (6869932050), D0 to D4 and C36 (6870840753), the reverse check on `HAND_ROOMS` (6875859525), E1, E2 and C42 (6877686192), P1 A, P2 a and P3 a (6879653457), the keep ring's contrast left to Issue #1258 (6880308628), Q1 a, Q2 a and Q3 a of pull request 5 (7088448244), Q1 a, Q2 a and Q3 a of pull request 6 (7089960681), the ruling on PR #1428 (7090478396: a browser check a plan deletes or drops is Alex's ruling only where the menu option names the check and the claim it loses; this plan deletes and drops none), Q1 a, Q2 a and Q3 a of pull request 7 (7090881527; its Q2 a set E1 aside for one step whose press the room never shows again), and Q1 a to Q4 a of pull request 8 (7091283845; its Q1 a sealed the Gallery's play step with nothing to do on arrival by deleting its `kind`). E1's rule, as the dispatcher relays it for every room: a step that asks the reader to press something reads done only when they do, and a road or a read step reads done on arrival.

**Recon.** `vellum-spec-recon` read the issue's body and its 31 comments paginated, Issues #1258 and #1385 with their comments, and Issue #1254's body and rulings, at `4dfcee7a`: 48 claims (its claims file `out/1253-pr9-recon/claims.jsonl` in the planner's tree) and a ledger of 33 rows, which the planner tallies 25 CURRENT, 5 STALE (2 blocking, 3 cosmetic) and 3 UNVERIFIABLE (recon gave the rows, not the totals). It flagged the planner's own uncommitted spike in the tree as another lane's edits; they are this plan's, and recon anchored every "on main" verdict on `git show HEAD:` or a `git archive HEAD` extract. Each finding's disposition:
- **"Browser, per room, in Sub 4's suite"** (STALE, blocking): superseded by D1 and the calls after it (C45, C53, C66, C79, C99, C124); call C135.
- **The Portfolio's ladder cannot "seal them when done"** (STALE, blocking): the keep step never seals (Q1), and Bring up The Next Sheet, Download The Engraving and the corner seal on arrival though each asks for a press (call C131 and Q2).
- **Cosmetic**: the head tests read the built `<link>` order, not `extraCss` (BP-H1, `SHARED_ROOM_SHEETS` and "shell.css last" are the guards); the data now weighs 53,096 bytes, 7,322 gzipped, fetched and not imported; the round's stills live in `design/the-primer/shots/stills/`.
- **UNVERIFIABLE**: the body's Explorer bundle figure (historical; this plan weighs the Portfolio's boot itself, C136); pull request 8's weights for this room (re-read here, C136); the four-dress plate read (read here, C138).
- Recon's decisions: 1 (Next and Download) is call C131 under E1 and P1 A; 2 (the keep step) is Q1, its "done when copied" option not offered, since no event reaches a page when its address is copied from the bar; 3 (the corner step, served by the Explorer) is Q2, with the Explorer's own Lay press beside it, found by the planner's census of every step sealed on arrival (`out/1253-dry-run/1253-pr9-seal-census-base.log`); 4 (the bare step on a device holding sheets) is Q3; 5 (close criteria) is Q6; 6 (merge order and tree) is Lanes and residue, and the tree is the planner's own.

## What this pull request delivers

When a reader arrives in the Portfolio from a Try it on the Primer (`/explorer/portfolio/?step=<id>`, the sheets after the hash), the room does what the eight rooms before it do: once its sheets are drafted it rings the control the step names, lays the manicule beside the ring, seats the slim note under the head cluster's trail, seals the step when the room sees it used or has nothing to see, and drops the key. Four of the Portfolio lesson's six steps open this room; the other two (the corner and the road into the Portfolio) open the Explorer, whose hand has served them since pull request 1.

It teaches the lesson's three presses what doing them is: "Press Bring up The Next Sheet" and "Press Download The Engraving" read done at their press (C131), and "press the survey's turned-up corner" at the corner's press in the Explorer (Q2 a). "Copy the address from the bar" reads done on arrival, its play mark dropped (Q1 a). The lesson's first step opens an empty table, so its plate shows on a device that has laid sheets (Q3 a). And the Explorer's "Or press Lay the prospect on the table", the last press step in any room still sealed on arrival but Today's Draft dispatch (ruled so), reads done at its press (Q2 a).

It mends a fault of the room's own (Q5 b): with no step, at 1280, the press row under the sheet stood over the end of the sheet's title, the room laying itself out before it wrote the title. The room now writes the sheet's title and lines first and lays out after, through a small function one unit test drives (`paintTop`, PF10).

It lists the room in `HAND_ROOMS`. It is the last of the nine rooms; with the Gallery's pull request in first, it closes Issue #1253 (Q6 a).

## Specs

The implementer reads these, beyond `CLAUDE.md`'s table for the work it does:
- The issue body's "A step is sealed" bullet (N2) and E1 (comment 6877686192), the rules the ladder edits build to.
- `handbook/plans/1200/1253/1253-r1-plan.md`, The design, for how the hand works; this plan changes none of the kit's code.
- `handbook/plans/1200/1253/1253-pr7-plan.md` and pull request 8's plan (`handbook/plans/1200/1253/1253-pr8-plan.md` once its pull request lands, archived on the issue in comment 7091307459), The design and Tests, for the wiring this room repeats, `HAND_ROOMS`, BP-H1, PK16, and PK25 and PK26, whose form PK27 to PK29 take.
- `handbook/specs/ui-design.md`, The Primer's pointing hand (the paragraph pull request 8 edits): the provisional dress this room wears unchanged.
- `handbook/specs/explorer-doctrine.md`, "The address is a photograph" (the `step` key line) and "The Chart Table has TWO homes" ("the Portfolio shows the folio its address names", else the device's): an empty `table` key names an empty folio (Q3 a).
- `handbook/specs/site-architecture.md`, How a page is authored, "Sheet order is a contract".
- `handbook/specs/check-placement.md`: The unit suite, and "A browser check is written".
- `handbook/specs/settle-doctrine.md`, When a check leaves the run: "A check's coverage is needless on one of two grounds" (C135's ground).
- `handbook/specs/conventions.md`: How a design decision is made and The fidelity rule (building to the ruled stills), and comments.

## The design

**The Portfolio takes the hand with two lines and two sheets** (calls C129 and C130).
- `src/pages/explorer/portfolio/index.astro` links the Primer's marks and the hand's sheet before the shared stage sheets, as the Print Room, the Prospect, the Ribbon and the Writing Room do: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`. `chart-stage.css` stays the last shared sheet before the room's own `index.css`, as `SHARED_ROOM_SHEETS` in `test/site/astro-scaffold.test.ts` reads it.
- `src/site/explorer/portfolio/app.ts` boots the hand once the room comes to rest: `void start();` becomes `void start().then(() => bootHandOnce({ route: "/explorer/portfolio/" }));`. `start` ends in two places: with nothing gathered, after the plate is laid and before its early `return`; with sheets, after `await draft()` has drafted every one. The `.then` follows both, and a `start` that rejects boots no hand (C6). That is the rest the Primer's drift walk reads for `/explorer/portfolio/` (`e2e/support/primer-rooms.ts`: every sheet drawn and `#pf-status` empty).

**What the hand does in each step**, read on the built spike at 1280 by 800 and 1024 by 768, motion reduced, on a bare desk (part A of `out/1253-dry-run/1253-pr9-probe-A.log`, `node out/1253-dry-run/1253-pr9-probe.ts A`; the Explorer's side in part E of `-FEU.log`; the uses in part U of `-FEU.log`). The spike is `out/1253-dry-run/1253-pr9-spike-full.diff` over `4dfcee7a` (pull request 8's change, this plan's, and a switch): its default steps file is the planned ladder, and `?arm=asis` before the step key fetches `/primer/steps-asis.json`, main's Portfolio ladder and main's Lay press (no press acts, the keep step a play step, the bare step at `/explorer/portfolio/`), staged in the steps file alone. The build: `out/1253-dry-run/1253-pr9-build-spike.log`. No console error and no 4xx in any part.

| step | room | as on main | as planned | ring on arrival |
|---|---|---|---|---|
| `explorer-portfolio-bare` "Open the Portfolio with nothing gathered." | Portfolio | sealed on arrival (nothing to see, N2) | the same, its address `/explorer/portfolio/#table=` (Q3 a) | nothing (C133) |
| `explorer-portfolio-turn-down` "In the Explorer, draw nearer until the chart is drafted anew, and press the survey's turned-up corner." | Explorer | sealed on arrival | waits; sealed at a press of the corner (Q2 a) | nothing: the step names no control (C133) |
| `explorer-portfolio-take` "Open {The Drawer} and press {Take the table to The Portfolio}." | Explorer | sealed on arrival (a road, N2) | the same (C132) | as since pull request 1, unchanged here |
| `explorer-portfolio-next` "Press {Bring up The Next Sheet}." | Portfolio | sealed on arrival | waits; sealed at a press of `#pf-next` (C131) | the press, 161.39 by 64 |
| `explorer-portfolio-download` "Press {Download The Engraving}." | Portfolio | sealed on arrival | waits; sealed at a press of `#pf-download` (C131) | the press, 151.8 by 64 |
| `explorer-portfolio-keep` "Copy the address from the bar." | Portfolio | never sealed (a `change` watch on `#pf-explorer`, a link) | sealed on arrival, its play mark dropped (Q1 a) | nothing (C133) |
| `explorer-lay-prospect` "Or press {Lay the prospect on the table}." | Explorer | sealed on arrival | waits; sealed at a press of `#place-card .pc-lay` (Q2 a) | the card's press, 210.59 by 36.09 |

- **Every press seals its own step and nothing else** (parts U and X): a press of Bring up The Next Sheet seals its step, drops the key and keeps the hash, and the next sheet comes up (`top` 0 to 1); a press of Download The Engraving seals its step and saves `vellum-42-antique-the-environs-of-nanawotani.svg` (the probe stubs the save); a press of the corner seals its step, drops the key, and the survey enters the hash and the device's table; a press of Lay the prospect seals its step and lays the prospect (`table=k-p.seed-42.style-antique.i-0.year-1059`). Download pressed on the next step, Bring up The Next Sheet pressed on the download step, and a sheet's title pressed in the slip's contents each leave the step open with its key. Under `?arm=asis` each of the four is sealed before any press.
- **The keep step** (part U): under the planned ladder it reads "6 done" on arrival and the address is `/explorer/portfolio/#table=...`, clean; under main's ladder it waits 3 s and more, and the address keeps `?step=explorer-portfolio-keep`.
- **The download press waits for the drafted sheet**: `#pf-download` is greyed until the sheet on top is drafted (`showTop` in `app.ts`), and the hand boots only at the rest, so the ring stands on an enabled press from its first frame (part A: `greyed: false`); P2 a's rule (a greyed control does not stand) would keep the ring off it before then anyway.
- **No road out carries the key** (part X): of the 26 links outside the note, none has a `step` key, with the key in the address and after the seal; the road home reads `/explorer/#table=...`, built from the hash. The one press onward into the Portfolio is `explorer-portfolio-take`'s, to `explorer-portfolio-next`; the one out is `explorer-portfolio-bare`'s, to the corner step in the Explorer.
- **A device that already holds a sheet** (part D of `-DSKPW.log`, part C of `-KWC.log`): a reader who presses the corner in step 2 (the device's table then holds the survey) and opens step 1's Try it as main writes it sees "The Environs of Nanawotani · Sheet i of i", the step sealed; at the planned address the plate shows, "How a Portfolio is Gathered", and the device's table is untouched (the Portfolio writes no device store: `src/site/explorer/portfolio/app.ts` imports `readStoredTable` and not `writeStoredTable`).
- The time from the load to the note, motion on, three loads on the two-sheet table: 1,056 to 1,062 ms, against the control's 1,039 to 1,050 ms to its rest and 1,028 to 1,038 ms to its first sheet (part W of `-KWC.log`).
- On paper none of it prints: under print media the ring, the manicule and the note read `display: none` (part P of `-DSKPW.log`).

**The note** seats as the seats ruling has it for every room (Issue #1155 comment 6754142680, item 5), appended last to `header.chrome`, under the trail; the room's refit (`refitOnChrome` in `bindRoom`, `src/site/shared/room.ts`) fits the sheet under it.
- Its width is 620 at 1280 and 590.39 at 1024 (`min(620, slip's left - head's left - 24)`, the Portfolio's slip at 896 and 640). It is 52.02 to 55.09 px tall on every step waiting and done at 1280, and at 1024 74.53 once the next step shows done ("Next, Download The Engraving ›" wrapping the row).
- **The done row stands 12.19 px inside the note on every Portfolio step at both widths, waiting and done** (part A, the `rowEdge` reads). So the room adds no reading of its own to Issue #1385 (C137).
- In the Explorer, the corner step's note is 71.45 px tall waiting at 1280 and 90.89 at 1024 (its sentence over three lines in a 495 px note beside the Broadside). **On main the Lay step's done row runs 40.11 px past the note at 1024**: it reads done on arrival, beside the open Broadside, in a 495 px note, the fault Issue #1385 holds for `explorer-to-print`. Under Q2 a it reads done only after the press, which slides the Chart Table out and folds the Broadside away; the note is then 620 px wide and the row stands 12.19 px inside (part E; the plate reader's section 2, `lay-done@1024` against `asis-lay@1024`; `out/1253-pr9/q2-the-explorers-two-presses/stills/q2-a-lay-done-at-the-press-1024.png`) (C137). After the press the ring and the manicule stay on the Lay press, now under the Chart Table, drawn over the table's new sheet (C17, the ring kept after the seal; the same follows a press on main).
- What it costs the chart (`#sheet`'s area against the no-key control's at the same width and table, the plate reader's `out/1253-pr9/y-measurements/tables.md` section 5): on the two-sheet table 0.589 at 1280 and 0.760 at 1024 with the note waiting, 0.615 and 0.716 once the next step reads done; on the bare plate 0.775 and 0.896. The room never goes `stage-under`, and nothing scrolls sideways or down in any state (section 1).
- The note's words against its panel, from pixels at DPR 2 (section 4): the sentence and the lesson's head 9.46:1, "done" 8.78:1, "From The Primer" and the × 5.64:1 (the lowest), the seal's numeral 7.22:1 on its disc, "Back to The Primer" 9.89:1, the press onward 8.72:1 gold and 7.95:1 dimmed on their own grounds. None under 4.5:1.

**The ring and the manicule** are pull request 1's, unchanged in their dress (D3). From pixels at DPR 2 (section 3; the sampled line pixels match the computed colours, median deviation 0):
- The ring holds its control 5.95 to 6.05 px clear on every side in every state. On the dark desk under the press row its gold line reads 9.4 to 10.1:1 (median) and its walnut 1.06 to 1.19; on the Explorer's light card the walnut carries it, 9.81:1 at 1280. Per side, the better of the two lines reads at least 9.37:1 on every Portfolio step and at least 3.89:1 everywhere, the lowest the bottom side of the Lay press's ring at 1024 once done, over a mixed ground.
- The manicule on the next step stands over the Download press beside the one it points at, at both widths and in every dress: its box lies wholly inside that press (1,128.3 px²) and its ink covers 597 px² of it at 1280 (591.5 at 1024), over the word "Engraving"; its fill reads 1.2:1 on the press's cream and its outline 10.11:1. On the dark desk (the download step) the fill reads 11.71:1 and the outline 1.01:1. At 1024 on the download step it is held at the window's left margin (`HAND_MARGIN`, x 4). D3 leaves the manicule's crowding to Issue #1258 in every room.
- The ring and the note overlap the sheet by 0 px² in every Portfolio state (section 7); the ring stands at z-index 46 and the manicule at 47, over the slip (20), the head cluster (10) and the press row (10) (part A's `z` read).
- In the Explorer at 1024 (Q2's steps): the corner step's note, three lines in a 495 px note beside the Broadside, puts the Explorer's own press row over the chart's title by 1,439.6 px², waiting or done, on main and planned alike (section 6); and the Lay press's card opens partly off the window's left edge, the ring's left line at x −17.69 (part E of `-FEU.log`).

**The press row under the sheet** (`nav.legend`, placed by `placeLegendRow` in `src/site/shared/room-seats.ts` between the folio's text and the Glass or the slip): with the note up at 1280 the sheet is narrower, and the row's three presses stand on two lines, "Back to The Explorer" alone on the second (137.84 px tall against 76.22); at 1024 the row stands above the folio as it does today.

**The press row fixed** (Q5 b, calls C144 to C146). On main, with no key at 1280, `showTop` in `src/site/explorer/portfolio/app.ts` writes the sheet, runs `room.layout()`, and only then writes `#folio-title`, `#folio-sub` and `#folio-coords`; `placeLegendRow` measures the folio's text before it is written, and the row stands over the end of the title once it is. Read on main's own build at `4dfcee7a` and on the fixed build, no key, motion reduced (part R of `out/1253-dry-run/1253-pr9-probe-R-main.log` and `-R-fixed.log`, `PROBE_BUILD=<label> node out/1253-dry-run/1253-pr9-probe.ts R` after `npm run build`; the overlap is the area the presses' boxes cover of each folio line's text):

| state | main: over the title | main: row, chart | fixed: over the title | fixed: row, chart |
|---|---|---|---|---|
| two sheets, arrival, 1280 | 275.6 px² | one line, 386,155 px² | 0 | two lines, 303,907 px² (0.787) |
| one sheet, arrival, 1280 | 165.3 px² | one line, 386,155 px² | 0 | two lines, 303,907 px² |
| two sheets, after a press of Bring up The Next Sheet, 1280 | 0 | two lines at x 423.16, 399.44 wide; 317,687 px² | 0 | two lines at x 429.32, 393.27 wide (seated for the new title); 317,687 px² |
| two sheets, after a resize, 1280 | 0 | two lines, 303,907 px² | 0 | two lines, 303,907 px² |
| nothing gathered, 1280 | 0 | one press, 357,710 px² | 0 | the same |
| two sheets and one sheet, arrival, 1024 | 0 | one line, 249,566 px² | 0 | the same |

- The fix is the whole fix in every state read: on arrival the fixed room stands exactly where main's stands after a resize, and nothing over the sub-line or the coordinates line in either build. The plate reader confirmed every box, press top, overlap and area to the hundredth on the fixed build (`out/1253-pr9-fix/y-measurements/tables.md`): no horizontal scroll and no `stage-under` in any state, and with the hand's note up the chart's area unchanged from the first sitting (227,288 px² at 1280, 189,615 at 1024), the note's row 12.19 px inside it. **The first sitting's hand states re-read on the fixed build** (parts A and U, the planned arm, `out/1253-dry-run/1253-pr9-probe-AU-fixed.log` against `-A.log` and `-FEU.log`, compared in `out/1253-dry-run/1253-pr9-AU-fixed-compare.log`: 16 states the same in seal, address, note, row, ring, manicule, chart and press row, and only the no-key control changed; part N of `-N-fixed.log` for the next step done by its press): every state Q4 was ruled from reads as it did, but the next step done by its press at 1280, whose press row stands at x 429.32 and 393.27 wide against 423.16 and 399.44, seated for the new sheet's title, its chart's area the same (237,597 px² at 1280, 178,591 at 1024).
- Its cost, ruled with Q7 a ("Build the fix"): at 1280 with sheets, the row on two lines and the chart at 0.787 of main's first size on arrival, the size main already takes after any re-layout. At 1024, with nothing gathered and with the hand's note up, nothing changes (the note's arrival already lays the room out again).
- `paintTop` writes the sheet and the three lines and then lays out, its elements passed as one record of read-only elements named `roomEls`, the name `no-param-reassign` excuses in `eslint.config.ts` (`PAGE_ELEMENT_PARAMETERS`) and `vellum/param-excuse-holds-element` holds to element records. `showTop` calls it with the lines it already writes, unchanged, and `() => room.layout()`. The bare branch of `start()` already writes its title and source before `room.layout()` and is left as it is (C145).

**The four dresses** (part S of `-DSKPW.log`, C138): the two-sheet table with every `style-antique` replaced draws each dress (`data-vellum-style` antique, topographic, ink, nautical); the ring holds Bring up The Next Sheet at the same box in each, and the ring and the note overlap the sheet by 0 px², so no dress stands under either.

**Three presses taught their use, and one step sealed on arrival** (C131, Q1 a and Q2 a). The ladder's form for "a step with an act and no outcome" is the other rooms': `do` with no `then`, which `sealWhen` seals on use, watching what `useWatches` derives from the acts (`[{ event: "click", css }]` for a `click`).
- `explorer-portfolio-next` gains `do: [click("#pf-next")]`, `explorer-portfolio-download` `do: [click("#pf-download")]`, `explorer-portfolio-turn-down` `do: [click(DOG_EAR)]` (`DOG_EAR` is `"#map .region-inset .dog-ear"`, already imported), and `explorer-lay-prospect` `do: [click("#place-card .pc-lay")]`.
- `explorer-portfolio-keep` loses `kind: "play"` (Q1 a): `sealWhen` then gives `arrival`, and the Primer page's mark for it goes, since `marksOf` in `src/site/primer/page.ts` reads `kind` (part K of `-KWC.log`).
- `explorer-portfolio-bare`'s `at` becomes `"/explorer/portfolio/#table="` (Q3 a); `parseTable` reads an empty table key as an empty table (`[]`), where a missing key reads `null` and falls to the device.
- **The drift walk is unchanged.** `walkStep` in `e2e/support/primer-walk.ts` performs a step's `do` and reads its `then` only where it has a `then`, and none of the six edited steps has one; its keys check reads `at`, and the Portfolio never rewrites its hash, so `#table=` is kept. `heldBy` in `e2e/support/primer-judge.ts` reads `at` and `do` among a step's reads, and over the planned ladders and main's every suite's walked checks are the same, name for name, none newly held (`out/1253-dry-run/1253-pr9-walk-census.log`, `node out/1253-dry-run/1253-pr9-walk-census.ts`: `primer-portfolio` 12 walked checks and `primer-explorer` 97, both `same: true`). Run: `primer-portfolio` reads `ALL PASS  (13/13)` on pull request 8's build and on the planned build (`out/1253-dry-run/1253-pr9-e2e-primer-portfolio-base.log` and `-planned.log`), the same thirteen checks, the bare step's keys check reading `/explorer/portfolio/` on the first and `/explorer/portfolio/#table=` on the second; `primer-explorer` reads `ALL PASS  (115/115)` on the planned build (`out/1253-dry-run/1253-pr9-e2e-primer-explorer-planned.log`).
- No test, e2e module or script outside the ladders names any of the six steps (`git grep -n -E "explorer-portfolio-(bare|turn-down|take|next|download|keep)|explorer-lay-prospect" -- test e2e test-support scripts src` on main finds only the ladder files).

**What holds the room's wiring, and why no browser check is added** (call C135, on ruling D1's ground).
- Every rule the room calls is the shared hand's, held in the unit suite (PK1 to PK26) and walked in the browser by the Explorer's PH1, PH2 and PH4 to PH8. What is the Portfolio's own is its wiring (the page links the two sheets, its script boots the hand) and its ladder.
- So the wiring is held by BP-H1 (the page's sheets) and PK16's two clauses (the room's bundle reaches the hand, and the bundles that reach it are exactly `HAND_ROOMS`), and the ladder by PK27 to PK29.
- What no instrument then holds in this room: that the boot call runs (a call placed where no rest reaches it passes BP-H1 and PK16). The plate reader reads the room at step 11.

**The room's boot grows by the hand's code** (call C136, on ruling C36). Read statically from each twin, pull request 8's build against the planned change's (`out/1253-dry-run/1253-pr9-chunks-base.log` and `-planned.log`, `node out/1253-dry-run/1253-pr9-chunks.ts <label>` after `npm run build`; `out/1253-dry-run/1253-pr9-chunks-compare.log`, `node out/1253-dry-run/1253-pr9-chunks-compare.ts`; gzip by node's zlib at its default level):
- The Portfolio: 18 files to 19, 712,083 to 729,357 bytes (192,210 to 198,208 gzipped), so 17,274 bytes (5,998 gzipped, 3.1%) on every visit, with a key or not. It gains `explorer/chunks/primer-hand.js` and loses nothing.
- Every other room: unchanged, file for file and byte for byte, the Gallery's and the seven other hand rooms' included (pull request 8 had already split `page-box.ts` and `written-address.ts` into chunks of their own).
- The steps file, fetched only on a keyed visit: the planned build's `dist/primer/steps.json` reads 53,265 bytes (7,330 gzipped, node's zlib), against 53,096 (7,322) on main as recon read it, the Gallery's and this change's ladder edits between them.

### Alternatives rejected

- **Booting at the first sheet drawn, inside `draft()`**: the boot would sit in the drafting loop and need a second call for the plate's early return; on the two-sheet table the rest comes 11 to 12 ms after the first sheet (part W), so waiting for it costs nothing a reader sees, and the rest is the one the drift walk already reads.
- **Booting before `start()` resolves, at the room's first `showTop`**: before any sheet is drafted the Download press is greyed and the folio's lines are not written; the note would arrive into a layout that moves again at the first sheet.
- **"Done when the reader copies the address"** for the keep step: no event reaches a page when its address is copied from the browser's bar, so no rule could see it. Not offered.
- **Ringing the Back to The Explorer road on the keep step**: the step names no control in braces; the road is in its `relies` as what carries the table, and a ring there would point the reader at a press the step does not ask for.
- **A rule in the shared kit for the keep step** (a play step with nothing to do sealed on arrival, keeping its mark): offered as Q1 b, not recommended; it changes the kit every room shares for one step's data, as pull request 4's C57 and pull request 8's C116 declined.
- **The corner step on an outcome** (a `then` reading the Drawer's tab, as the Explorer's own `explorer-dog-ear` has): it would add a drift-walk check, a browser check made longer, for a claim `explorer-dog-ear` already walks; E1 asks for the press.
- **Moving `room.layout()` in place inside `showTop`, with no function of its own**: the order then has no unit test that can drive it, and the house writes the failing test first; `paintTop` is the page code shaped so one test can (C144).
- **A browser check that the press row clears the folio line**: the Portfolio's journey is not one Alex has ruled critical, and a browser check on such a page goes on the menu first (`handbook/specs/check-placement.md`, "A browser check is written"); PF10 holds the cause, and the plate reader reads the outcome at step 11 (C144).
- **Routing the bare branch of `start()` through `paintTop`**: it already lays out after its writes, and it then hides two presses after the layout, an order this pull request has no cause to touch (C145).
- **Laying the room out again after the whole draft** (a second `room.layout()` at the end of `start()`): it would mend the arrival but leave `showTop`'s order wrong for every later sheet brought up, and lay out twice.
- **The hand's browser checks in this room, as the issue body lists them per room**: call C135.

## Files

The whole change as the planner staged it over pull request 8's: `out/1253-dry-run/1253-pr9-fixed-change.diff` (9 files, the two new ones included, against pull request 8's tree, so the implementer never re-applies pull request 8); over `4dfcee7a` with pull request 8's under it, `out/1253-dry-run/1253-pr9-fixed-full.diff` and the two new files beside it in `out/1253-dry-run/planned-files/` (`paint-top.ts`, `paint-top.test.ts`). The change before the fix is `out/1253-dry-run/1253-pr9-planned-change.diff`. Over the whole tree so staged, the fix included: `npx prettier --check` on the nine files exit 0 (`out/1253-dry-run/1253-pr9-format-fixed.log`), `npm run lint` exit 0 (`-lint-fixed.log`), `npm run check` exit 0 (`-check-fixed.log`); before the fix the same three read exit 0 (`-format-planned.log`, `-lint-planned.log`, `-check-planned.log`).

Edited (line numbers are main's at `4dfcee7a`, and pull request 8's where it moved the file):
- `src/pages/explorer/portfolio/index.astro`, line 24: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`.
- `src/site/explorer/portfolio/app.ts`:
  - `import { paintTop, type TopEls } from "./paint-top.ts";` on the line after `import { PLATE_CHART, howPlate } from "./how-plate.ts";` (line 27) (Q5 b);
  - `import { bootHandOnce } from "../../shared/primer-hand.ts";` on the line after `import { downloadBlob, nextObjectUrl } from "../../shared/object-url.ts";` (line 29);
  - `const topEls: TopEls = { sheet: sheetBox, title: folioTitle, sub: folioSub, coords: folioCoords };` and a blank line, before `const showTop = (): void => {` (line 91) (Q5 b);
  - in `showTop` (lines 91 to 105), the five statements from `sheetBox.innerHTML = sheet.svg ?? "";` through `folioCoords.textContent = beneathLine(sheets.length - 1 - top);` become one call, `paintTop(topEls, { svg: sheet.svg ?? "", title: <the title expression>, sub: <the sub expression>, coords: <the coords expression> }, () => room.layout());`, each expression the one main writes, unchanged (Q5 b); `download.disabled` and the rows' toggle after it are unchanged;
  - line 283, `void start();`, becomes `void start().then(() => bootHandOnce({ route: "/explorer/portfolio/" }));`;
  - the text exactly as staged: the `app.ts` hunks of `out/1253-dry-run/1253-pr9-fixed-change.diff`;
  - 295 lines on main, 304 after; not split (C134).
- `src/site/shared/primer/portfolio.ts` (77 lines on main, 79 after):
  - line 4: the import from `./shape.ts` gains `click`, in alphabetical place: `import { aria, click, countWord, road, roomOf, text, wait, type Ladder } from "./shape.ts";`;
  - line 25, `explorer-portfolio-bare`'s `at: "/explorer/portfolio/",`, becomes `at: "/explorer/portfolio/#table=",` (Q3 a);
  - in `explorer-portfolio-turn-down`, `do: [click(DOG_EAR)],` on the line after its `relies` array closes (`],`, line 39), before the step's `},` (Q2 a);
  - in `explorer-portfolio-next`, `do: [click("#pf-next")],` on the line after `words: [road("#pf-next", "Bring up The Next Sheet")],` (line 56) (C131);
  - in `explorer-portfolio-download`, `do: [click("#pf-download")],` on the line after `words: [road("#pf-download", "Download The Engraving")],` (line 63) (C131);
  - in `explorer-portfolio-keep`, the line `kind: "play",` (line 72) is deleted (Q1 a).
- `src/site/shared/primer/explorer-sheet.ts` (231 lines on main, 232 after): in `explorer-lay-prospect`, `do: [click("#place-card .pc-lay")],` on the line after `words: [text("#place-card .pc-lay", LAY_ON_CARD)],` (line 148) (Q2 a); `click` is imported already (line 7).
- `test-support/hand-steps.ts`: `HAND_ROOMS` gains `"/explorer/portfolio/",` as its last entry, on the line after pull request 8's `"/gallery/",` (C134).
- `test/site/built-pages.test.ts`, BP-H1: `assert.ok(HAND_ROOMS.includes("/explorer/portfolio/"), "the rooms list names the Portfolio");` on the line after pull request 8's Gallery witness.
- `test/site/primer-hand-steps.test.ts`: `import { parseTable } from "../../src/site/shared/table-address.ts";` on the line after the `hand-words.ts` import (line 12), and PK27, PK28 and PK29, new, after pull request 8's PK26 and before PK8 (Tests). 211 lines with pull request 8's, 235 after.

Created (Q5 b):
- `src/site/explorer/portfolio/paint-top.ts`, 21 lines, exactly:
  ```ts
  export interface TopEls {
    readonly sheet: HTMLElement;
    readonly title: HTMLElement;
    readonly sub: HTMLElement;
    readonly coords: HTMLElement;
  }

  export interface TopLines {
    readonly svg: string;
    readonly title: string;
    readonly sub: string;
    readonly coords: string;
  }

  export function paintTop(roomEls: TopEls, lines: TopLines, layout: () => void): void {
    roomEls.sheet.innerHTML = lines.svg;
    roomEls.title.textContent = lines.title;
    roomEls.sub.textContent = lines.sub;
    roomEls.coords.textContent = lines.coords;
    layout();
  }
  ```
  No comment: PF10 is its record. The `innerHTML` write is main's own (`sheetBox.innerHTML = sheet.svg ?? ""`), the engine's drafted SVG, moved and not new.
- `test/portfolio/paint-top.test.ts`, 38 lines: PF10 (Tests).

Deleted: none. No file the change touches passes 400 lines.

## Tests, in the order they are written

All unit tests. The plan adds no browser check and makes none longer (C135), so no ledger line, no browser-check readings and no step seconds are owed; it deletes and drops none (the walk census above).

1. `test/site/primer-hand-steps.test.ts`, **PK27, PK28 and PK29**, after PK26 and before PK8, exactly:
   ```ts
   test("PK27 the Portfolio's steps are used as rulings E1 and P1 A, and pull request 9's Q1 and Q2, have them: the turned-up corner, Bring up The Next Sheet and Download The Engraving at their press; the bare table, the road to the Portfolio and the address to copy on arrival (Issue #1253 pull request 9)", () => {
     for (const id of ["explorer-portfolio-turn-down", "explorer-portfolio-next", "explorer-portfolio-download"])
       assert.equal(sealWhen(stepOf(id), DESK), "use", id);
     for (const id of ["explorer-portfolio-bare", "explorer-portfolio-take", "explorer-portfolio-keep"])
       assert.equal(sealWhen(stepOf(id), DESK), "arrival", id);
     assert.deepEqual(useWatches(stepOf("explorer-portfolio-turn-down")), [
       { event: "click", css: "#map .region-inset .dog-ear" },
     ]);
     assert.deepEqual(useWatches(stepOf("explorer-portfolio-next")), [{ event: "click", css: "#pf-next" }]);
     assert.deepEqual(useWatches(stepOf("explorer-portfolio-download")), [{ event: "click", css: "#pf-download" }]);
   });

   test("PK28 the Explorer's Lay the prospect on the table is used at its press, as ruling E1 has it (Issue #1253 pull request 9)", () => {
     const lay = stepOf("explorer-lay-prospect");
     assert.equal(sealWhen(lay, DESK), "use");
     assert.deepEqual(useWatches(lay), [{ event: "click", css: "#place-card .pc-lay" }]);
   });

   test("PK29 the Portfolio's first step opens an empty table, so a device holding sheets still shows the plate (Issue #1253 pull request 9)", () => {
     const at = stepOf("explorer-portfolio-bare").at;
     assert.deepEqual(parseTable(at.slice(at.indexOf("#"))), []);
   });
   ```
   `sealWhen`, `useWatches`, `stepOf` and `DESK` (`{ touch: false, motion: true }`) are the file's own already; `parseTable` is `src/site/shared/table-address.ts`'s. The text exactly as staged: the `test/site/primer-hand-steps.test.ts` hunk of `out/1253-dry-run/1253-pr9-planned-change.diff`.
   - Red at commit 1, each on its first assertion, over pull request 8's ladders with the three tests staged (`out/1253-dry-run/1253-pr9-commit1-red.log`, `npm test -- --test-name-pattern="PK2[789]" test/site/primer-hand-steps.test.ts`; 0 pass, 3 fail): PK27 `AssertionError [ERR_ASSERTION]: explorer-portfolio-turn-down`, `actual: 'arrival'`, `expected: 'use'`; PK28 `actual: 'arrival'`, `expected: 'use'`; PK29 `actual: null`, `expected: []`. No stub: the functions exist with their signatures, and the red is the ladders' data.
   - Mutations, each read on the planned ladders (`out/1253-dry-run/1253-pr9-mutate.log`, `node out/1253-dry-run/1253-pr9-mutate.ts`, each row's file copied aside, mutated, the three tests run with the command above, the file copied back and compared byte for byte, every row `restored: true`; the control row 3 pass; each row's whole output in `out/1253-dry-run/mutate/<row>.log`): Bring up The Next Sheet's act deleted (PK27 fails `explorer-portfolio-next`, `'arrival'` for `'use'`); Download's act deleted (PK27 fails `explorer-portfolio-download`, the same); the corner's act deleted (PK27 fails `explorer-portfolio-turn-down`, the same); the keep step's `kind: "play"` put back (PK27 fails `explorer-portfolio-keep`, `'use'` for `'arrival'`); the next step's act a `set` in place of a press (PK27 fails its watch, `actual: [ { event: 'change', css: '#pf-next' } ]`); the road into the Portfolio given a press (PK27 fails `explorer-portfolio-take`, `'use'` for `'arrival'`); the Lay press's act deleted (PK28, `'arrival'` for `'use'`); the Lay press's act a `set` (PK28 fails its watch, `actual: [ { event: 'change', css: '#place-card .pc-lay' } ]`); the bare step's `at` put back to `/explorer/portfolio/` (PK29, `actual: null`). Each row reds its one test alone (2 pass, 1 fail).
2. `test/site/built-pages.test.ts`, **BP-H1's witness** (Files). Red at commit 3 on its loop's assertion, the ladders, the list and the witness staged and the room unwired: `actual: [ '/explorer/portfolio/ links /shared/fonts.css, /shared/motion.css, /shared/house.css, /shared/atelier.css, /shared/chart-of-the-atelier.css, /shared/slide-away.css, /shared/chart-stage.css, /explorer/portfolio/index.css, /shared/shell.css' ]`, `expected: []` (`out/1253-dry-run/1253-pr9-commit3-red.log`, `npm test -- "--test-name-pattern=no page's bundle carries the Primer|BP-H1|PK2[789]" test/site/app-bundles.test.ts test/site/built-pages.test.ts test/site/primer-hand-steps.test.ts`: 3 pass, 2 fail, PK27 to PK29 the passes). Green at commit 4 (the planner's full unit run, Evidence). Mutations: the two sheets swapped in the room's `extraCss` (red, `... /shared/chart-of-the-atelier.css, /shared/primer-hand.css, /shared/primer-marks.css, /shared/slide-away.css, ...`, `out/1253-dry-run/1253-pr9-bph1-swap.log`, `npm test -- --test-name-pattern=BP-H1 test/site/built-pages.test.ts`); `/shared/primer-hand.css` dropped from it (not read here, the prover's).
3. PK16, the test titled "no page's bundle carries the Primer's ladders: a room reads its step from the data file the build writes (Issue #1253)" in `test/site/app-bundles.test.ts`, unchanged, now reads the Portfolio (`join(p.root, "explorer/portfolio/", "app.bundle.js")` for its forward clause; `routeOfTwin` gives `/explorer/portfolio/` for its reverse). Its forward clause is red at commit 3 with `/explorer/portfolio/'s bundle never names the data file, so no Try it can point its hand`, `actual: false`, `expected: true` (the same log). Its reverse clause reds a room that boots the hand without joining the list: with the room wired and `HAND_ROOMS` as pull request 8 leaves it, `actual: [ '/explorer/', '/explorer/portfolio/', '/gallery/', '/print-room/', '/prospect/', '/reading-room/', '/ribbon/', '/seed-of-the-day/', '/writing-room/' ]`, `expected` the same without `'/explorer/portfolio/'` (`out/1253-dry-run/1253-pr9-pk16-wired-pr8list.log`, `npm test -- "--test-name-pattern=no page's bundle carries the Primer" test/site/app-bundles.test.ts`); with the room listed it passes. Mutation: the room's import and boot call deleted.

4. `test/portfolio/paint-top.test.ts`, **PF10**, new (Q5 b, C144), exactly:
   ```ts
   import { test } from "node:test";
   import assert from "node:assert/strict";
   import { parseHTML } from "linkedom";
   import { paintTop } from "../../src/site/explorer/portfolio/paint-top.ts";

   test("PF10 the sheet on top is laid out only once its title and lines are written, so the press row is seated for the folio as it reads (Issue #1253 pull request 9, Q5)", () => {
     const { document } = parseHTML(
       `<div id="pf-sheet"></div><p id="folio-title">Chart № 42</p><p id="folio-sub"></p><p id="folio-coords"></p>`,
     );
     const el = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
     const roomEls = { sheet: el("pf-sheet"), title: el("folio-title"), sub: el("folio-sub"), coords: el("folio-coords") };
     const seen: string[][] = [];
     paintTop(
       roomEls,
       {
         svg: "<svg></svg>",
         title: "The Environs of Nanawotani · Sheet i of ii",
         sub: "a regional survey at band 1, antique · from The Isle of Rahai, chart № 42",
         coords: "one beneath it",
       },
       () => {
         seen.push([
           roomEls.sheet.querySelector("svg") === null ? "no sheet" : "the sheet",
           roomEls.title.textContent,
           roomEls.sub.textContent,
           roomEls.coords.textContent,
         ]);
       },
     );
     assert.deepEqual(seen, [
       [
         "the sheet",
         "The Environs of Nanawotani · Sheet i of ii",
         "a regional survey at band 1, antique · from The Isle of Rahai, chart № 42",
         "one beneath it",
       ],
     ]);
   });
   ```
   - The stub that reds it at commit 1: `src/site/explorer/portfolio/paint-top.ts` as Files gives it, but with `layout();` as the function's first statement, before the four writes (the right shape, main's order). Red: `actual: [ [ 'no sheet', 'Chart № 42', '', '' ] ]` against the four written lines (`out/1253-dry-run/1253-pr9-fix-pf10-red.log`, `npm test -- test/portfolio/paint-top.test.ts`, 0 pass, 1 fail). Green with the order as Files gives it (`-fix-pf10-green.log`, 1 pass).
   - Mutation: `layout();` moved after the sheet's write and before the three lines' (red, `actual: [ [ 'the sheet', 'Chart № 42', '', '' ] ]`, `-fix-pf10-m-sheet-only.log`); the title's write deleted (for the prover). Each read with the file copied aside and copied back, `cmp` exit 0.
   - What PF10 does not hold: that `showTop` calls `paintTop` and runs no layout of its own before it (the wiring); the plate reader reads the press row at step 11, and the stop conditions name its reading.

The prover owes PK27, PK28, PK29, BP-H1's witness, PK16's two clauses over this room and PF10, against the mutations named. PK1 to PK26 and PH1 to PH8 do not change.

## Order of commits

1. The archived plan, `handbook/plans/1200/1253/1253-pr9-plan.md` (this file, unchanged), with PK27, PK28 and PK29 red as Tests item 1 says, and `test/portfolio/paint-top.test.ts` with the stub `src/site/explorer/portfolio/paint-top.ts` (its `layout();` first), PF10 red as Tests item 4 says. Then push.
2. The ladder edits in `src/site/shared/primer/portfolio.ts` and `src/site/shared/primer/explorer-sheet.ts` (PK27 to PK29 green).
3. `HAND_ROOMS` gains `"/explorer/portfolio/"` and BP-H1 its witness (BP-H1 red on the room's links, PK16 red on the room's bundle).
4. The room's two sheets and its boot call (BP-H1 and PK16 green).
5. The press row's fix: `paintTop`'s writes before its `layout()`, and `showTop` calling it, with `topEls` and the import (PF10 green).
6. `git merge origin/main` (workflow step 10), then the evidence.

## Rosters and doctrine

- **`HAND_ROOMS`** in `test-support/hand-steps.ts` gains `"/explorer/portfolio/"`, the ninth room in the order they took the hand (C134). PK16's reverse clause ties it to the press's twins, and its forward clause and BP-H1 read the nested route as they read the others (recon: `join(p.root, route.slice(1), "app.bundle.js")` gives `explorer/portfolio/app.bundle.js`, `routeOfTwin` gives `/explorer/portfolio/`, and BP-H1's built map keys the page at `/explorer/portfolio/`).
- **The page's sheet list**: `test/site/astro-scaffold.test.ts`'s head tests read the built head (`shell.css` last, `chart-stage.css` straight before the room's own `index.css`, which `SHARED_ROOM_SHEETS` reads); the two new sheets stand before `slide-away.css`. They join no other list, and not `HOUSE_SHEETS` (`scripts/lint/sheet-owners.ts`), since not every page links them.
- **No bundle roster moves**: the Portfolio already ships its twin (`BUNDLE_ENTRIES` in `scripts/build-app-bundles.ts`, the press's pin in `test/site/app-bundles.test.ts`, `scriptSrc` in the scaffold's `PAGES`, the `generated` list), its smoke suite is already mapped (`"explorer/portfolio": ["chart-drawer"]` in `test/repo/e2e-tiers.test.ts`), and the screenshot sweep already frames it as an app page (`KEPT_MODES` in `scripts/design/oracle.ts` leaves it to `"head"`). Recon read each (CURRENT).
- **The fix's two new files join no roster**: `src/site/explorer/portfolio/paint-top.ts` sits in the Portfolio's own folder, under `ROOMS_UNDER_THE_EXPLORER` (`scripts/lint/import-bounds.ts`) as `app.ts` does, and `test/portfolio/paint-top.test.ts` beside PF1 to PF9; the full unit run and `npm run lint` read green over both (Evidence), `vellum/param-excuse-holds-element` among the lint's rules over `roomEls`.
- **The Primer page**: the keep step's "play: no wrong answer" mark goes (Q1 a), and the bare step's Try it becomes `../explorer/portfolio/?step=explorer-portfolio-bare#table=` (Q3 a); no sentence changes, and no test pins either (the planner's full unit run below, `BP-P1` to `BP-P5` among it).
- **No spec line changes.** The rulebook's second exception (line 99), the explorer-doctrine `step` key line (311) and the ui-design paragraph (263 on main, edited by pull request 8 for the Gallery's reserve) are written for every room (recon: CURRENT). A step sealed at its use is ruling M3's and E1's and has stood in that paragraph's "a step the room sees done is sealed" since pull request 1. An empty `table` key is a folio the address names, as explorer-doctrine's "The Chart Table has TWO homes" already has the Portfolio read it.
- **The Primer's drift walk** prints the same checks in every suite (the walk census); no suite list, skip list or count changes, and `e2e/support/suites.ts` and `e2e/support/skips.ts` are unchanged.
- A search for `HAND_ROOMS` and for `bootHandOnce` over `src`, `scripts`, `e2e`, `test`, `test-support` and `.github` finds no other roster (`vellum-footguns` Gate 4), as for pull requests 7 and 8.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). The planner's `npm test` over the whole change staged on pull request 8's, the fix included, read `ℹ tests 4196`, `ℹ pass 4196`, `ℹ fail 0`, exit 0 (`out/1253-dry-run/1253-pr9-unit-fixed.log`; 4195 before the fix, `-unit-planned.log`, PF10 the one more).
- `npm run build`, then, one at a time: `VELLUM_E2E_SUITES=primer-portfolio npm run test:e2e` (`ALL PASS  (13/13)` on the planned build, 7.1 s, and on the fixed build, `out/1253-dry-run/1253-pr9-e2e-primer-portfolio-fixed.log`), `VELLUM_E2E_SUITES=primer-explorer npm run test:e2e` (`ALL PASS  (115/115)`, 47.1 s) and `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, the Portfolio's own suite (its smoke map in `test/repo/e2e-tiers.test.ts`). Never the full local lanes.
- **`chart-drawer` reds CD38 on this Mac on main itself**, and no other check: `FAIL  CD38 the same road with the browser's cache refused: ... — {"marker":"cold","navType":"navigate",...}`, `SOME FAILED, and 1 check skipped on purpose (CD25, Issue #716)  (35/36)`, on main's own build at `4dfcee7a` (`out/1253-dry-run/1253-pr9-e2e-chart-drawer-main.log`, the tree set to HEAD and built, `-build-main.log`), on pull request 8's (`-base.log`), twice on the planned build (`-planned.log`, `-planned2.log`) and on the fixed build (`-fixed.log`). CD38 walks the Prospect page and a cold Back, the path Issue #1424 holds for PB18 on this browser (Brave 158); why it reds is not traced (UNVERIFIABLE). CI is its gate (C143).
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance, ruled from stills): with no key, the press row against the three folio lines at 1280 by 800 and 1024 by 768, two sheets and one, on arrival and after a press of Bring up The Next Sheet (the fix's outcome, which PF10 does not hold); the four Portfolio steps arriving at 1024 by 768 and 1280 by 800, the next and download steps done by their press, the next step over each dress, the keep step's address, the bare step on a device holding a sheet, the corner and Lay steps in the Explorer before and after their press, and the Primer page's Portfolio lesson afterwards, with contrast sampled from pixels. The step 6 sittings' drivers are `out/1253-pr9/y-measurements/driver.ts` and `out/1253-pr9-fix/y-measurements/driver.ts` in the planner's tree (each copied to the main checkout's `out/`).
- The other suites that open the Portfolio (`stage`, `slide-away`, `runninghead`) open it with nothing gathered, a branch of `start()` the fix does not touch (C145), so they are not owed here; `chart-drawer` opens it with sheets, through `showTop`.
- No still judge comparison: nothing here changes how the engine draws a world sheet.
- The planner waited for the other lane's runs to clear before each of its builds and unit and e2e runs but two: one probe run (parts D, S, K, P and W of `out/1253-dry-run/1253-pr9-probe-DSKPW.log`) overlapped the other lane's `npm test`, and part W was taken again alone (`-KWC.log`), the figures above being that run's; and the first `primer-portfolio` run overlapped the other lane's `npm run lint`, its thirteen checks passing as on the base build.

## Calls made

Numbered on from pull request 8's plan, which numbers its calls C108 to C128 and its test PK26 (its archive, comment 7091307459).

- **C129** The hand boots once the room comes to rest, `void start().then(() => bootHandOnce({ route: "/explorer/portfolio/" }));` in place of `void start();`. Rule: the issue's "each room's script calls the hand once its first draw settles", as C38, C49, C62, C75, C91 and C108 placed it; `start` settles in two places (the plate's early return and the end of the draft), the `.then` follows both with one call, the rest is what `e2e/support/primer-rooms.ts` reads for the room, and a `start` that rejects boots no hand (C6). Measured, waiting for the rest costs 11 to 12 ms over the first sheet on the two-sheet table (part W).
- **C130** The two sheets stand before `slide-away.css` and `chart-stage.css`. Rule: C39, C50, C63, C76 and C92, the marks and the hand before the shared sheets; `chart-stage.css` stays last before the room's own sheet (`SHARED_ROOM_SHEETS`).
- **C131** Bring up The Next Sheet and Download The Engraving each wait for their press, `do: [click("#pf-next")]` and `do: [click("#pf-download")]`. Rule: E1 ("a step that asks the reader to press something reads done only when they do") and P1 A, as C95 took them for Today's Share; a Download press seals its step whichever sheet is on top, as pull request 5's Q1 a has a press seal "whatever the Chart Table holds".
- **C132** `explorer-portfolio-take` and `explorer-portfolio-bare` stay sealed on arrival. Rule: N2 and E1, a road to another room (as C70, C82 and C97) and a step with nothing to see (as C96).
- **C133** The bare step, the corner step and the keep step ring nothing and the note carries each alone. Rule: M4 ("where nothing can be ringed, the note alone carries the step"), C2 (no named control rings nothing), pull request 6's Q2 a, C103 and C112.
- **C134** `"/explorer/portfolio/"` joins `HAND_ROOMS` at its end, after pull request 8's `"/gallery/"`, BP-H1's witness after the Gallery's, PK27 to PK29 after PK26; `src/site/explorer/portfolio/app.ts` (295 lines) takes one import and one changed line and is not split. Rule: C32, C44, C52, C65, C78, C100 and C111, the rooms in the order they take the hand, pull request 8 landing first (the dispatcher's order); C7 and C94 for the script.
- **C135** No browser check of the hand in this room. Rule: ruling D1's ground, needless coverage of a shared module's wiring (`handbook/specs/settle-doctrine.md`, Issue #1273), as C45, C53, C66, C79, C99 and C124 took it; PK27 to PK29 hold the room's ladder, BP-H1 and PK16 its wiring, and `chart-drawer` and `primer-portfolio` load the room with its new sheets and boot call.
- **C136** The Portfolio imports the hand statically, as the other eight rooms do. Rule: Alex's "Load it always, as built" on C36 (comment 6870840753), and pull request 8's Q3 a. Its boot grows by 17,274 bytes (5,998 gzipped, 3.1%) on every visit, and every other room's boot is unchanged (The design).
- **C137** The Portfolio adds no reading of its own to Issue #1385. The Explorer's Lay step's done row, 40.11 px past the note at 1024 on main, where it reads done on arrival beside the open Broadside, stands 12.19 px inside under Q2 a, the step reading done only after the press has folded the Broadside; under Q2 b or c the dispatcher posts that reading to Issue #1385. Rule: measured (The design); pull request 5's Q2 a sends a done row past the note to Issue #1385, whose "Done when" covers every Explorer step, and a reading Q2 a removes is not posted as a fault that stands.
- **C138** The look stills read the next step over all four dresses at 1280, and every other state over the antique table the lesson's Try its name. Rule: the issue's plate read "over all four chart dresses", which the Portfolio, unlike Today and the Gallery (C101, C118), can satisfy through its table; the ring and the note stand over no sheet in any dress (part S), so the other states would read the same.
- **C139** This room's look readings go to Issue #1258 for the post-use review, posted by the dispatcher under Q4 a: at 1280 the press row under the sheet on two lines with the note up, and the chart keeping 0.589 of its area there (0.760 at 1024); the manicule on the next step over the Download press beside it (597 px² of ink, its fill 1.2:1 on that press's cream); at 1024 the manicule held at the window's left margin on the download step; in the Explorer at 1024 the corner step's three-line note putting the press row over the chart's title (1,439.6 px²), the Lay press's card partly off the window's left edge with the ring's left line cut, and, after the Lay press, the ring and the manicule kept on the press under the Chart Table, over the table's new sheet. Rule: D3, P3 a and the look rulings of pull requests 5 to 8, each sending its room's readings to the review.
- **C140** The tests are three, one claim each: PK27 the Portfolio lesson's seals and watches, PK28 the Explorer's Lay press, PK29 the bare step's empty table. Rule: `handbook/specs/check-placement.md`, a unit test "checks that one claim and nothing beside it"; Q2 and Q3 are separate rulings.
- **C141** The Portfolio goes after the Gallery. Rule: the dispatcher's brief ("Plan as if pull request 8 lands first") and Alex's order "Start Gallery now" (comment 7102411658); the Gallery merged as PR #1434 at `8c68865c`.
- **C142** The pull request closes Issue #1253, its body carrying `.github/PULL_REQUEST_TEMPLATE.md`'s closing line, and `gh pr view <N> --json closingIssuesReferences` reads Issue #1253. Rule: Q6 a; with the Gallery in, every room with a ladder has its hand (What remains, below).
- **C143** A local `chart-drawer` red on CD38 alone is no stop condition; any other `chart-drawer` red is. Rule: it reds identically on main's own build at `4dfcee7a` on this Mac (Evidence), so it is not this change's; `handbook/specs/settle-doctrine.md`, where the Mac and the CI runner disagree, and the dispatcher's known local reds (Issue #1424); CI runs `chart-drawer` on the pull request.
- **C144** The press row's fix is guarded by a unit test of its cause, PF10 over an extracted `paintTop`, and by no browser check. Rule: "Write the failing test first" (`CLAUDE.md`, Process), and `handbook/specs/check-placement.md` ("Where page code has to change for a unit test to hold the claim, the change is source work written test first ... the function takes its inputs ... so one test can drive it"); a browser check on a page whose journey Alex has not ruled goes on the menu before it is written (the bullet opening "A browser check is written"), and the outcome (the row clear of the title) is the plate reader's read at step 11, as a layout is (the bullet opening "What the browser computes is read in a browser").
- **C145** Only `showTop` goes through `paintTop`; the bare branch of `start()` keeps its order. Rule: it already writes its title and source before `room.layout()` (measured clear, part R), and it hides two presses after the layout, which this pull request has no cause to move ("Touch only what you're asked to touch", the workspace rule `CLAUDE.md` refines).
- **C146** The fix is moving the layout after the writes and nothing more. Rule: measured, on arrival the fixed room stands where main's stands after a resize in every state read, two sheets and one, 1280 and 1024 (part R); the folio's sub-line and coordinates line are clear in both builds.

## Open decisions

None. Q1 to Q6 were put to Alex at the first STOP and Q7 at the second, and all are ruled (Rulings, below).

## Stop conditions

Hand back, rather than adapt, when:
- main does not carry pull request 8 when the build starts: `test-support/hand-steps.ts` on `origin/main` does not end `HAND_ROOMS` with `"/gallery/",`, or `test/site/primer-hand-steps.test.ts` on `origin/main` carries no PK26 (main carries it since PR #1434, `8c68865c`; a main that has lost it is a hand-back);
- a symbol, line or file named here is not where the plan says: the `how-plate.ts` and `object-url.ts` imports, `showTop` and its five statements from `sheetBox.innerHTML` through `folioCoords.textContent`, and `void start();` in `src/site/explorer/portfolio/app.ts`; no `src/site/explorer/portfolio/paint-top.ts` or `test/portfolio/paint-top.test.ts` on main, and no PF10; the `extraCss` line of `src/pages/explorer/portfolio/index.astro`; the `./shape.ts` import, the six steps and the lines named in them in `src/site/shared/primer/portfolio.ts`; `explorer-lay-prospect`'s `words` in `src/site/shared/primer/explorer-sheet.ts`; PK26, PK8, `DESK` and the `hand-words.ts` import in `test/site/primer-hand-steps.test.ts`; PK16's clauses in `test/site/app-bundles.test.ts`; BP-H1 and its Gallery witness in `test/site/built-pages.test.ts`;
- a red at commit 1 is on anything but the assertions named (PF10's included, on the stub), or a red at commit 3 on anything but BP-H1's loop and PK16's forward clause;
- `npm test` reds a file this plan does not name, above all a bundle or chunk test, a head test over the sheet list, a Primer page test over the marks or the Try it links, or a Primer ladder test over the ladder edits;
- `npm run lint` reports anything;
- `primer-portfolio` prints anything but `ALL PASS  (13/13)`, `primer-explorer` anything but `ALL PASS  (115/115)`, or `chart-drawer` reds any check but CD38 (C143);
- the plate read at step 11 finds a horizontal scroll at 1024 or 1280; the note over the sheet or over the slip; the ring off the control it names; the note's text under 4.5:1 against its panel, or both of the ring's lines under 3:1 against one ground (a ground being the desk, a panel or a press, never a word's glyphs a line crosses); a done row past the note on any Portfolio step; the next, download, corner or Lay step sealed before its press; the bare, take or keep step not sealed on arrival; the bare step's plate missing on a device holding a sheet; the keep step's play mark still on the Primer page; with no key, any press of the press row over the text of any folio line at 1280 or 1024, two sheets or one, on arrival or after a press of Bring up The Next Sheet (PF10 does not hold the wiring, C144); or the page marked `stage-under` in any state;
- `git merge origin/main` conflicts in a file this plan names.

## Lanes and residue

- **Pull request 8, the Gallery** (its plan archived in comment 7091307459 and committed as `handbook/plans/1200/1253/1253-pr8-plan.md`): merged as PR #1434 at `8c68865c`, before this one, as Alex ordered. This one appends after its `"/gallery/",` in `HAND_ROOMS` and its witness in BP-H1, numbers its tests after its PK26 and its calls after its C128. The readings here were taken with its planned change laid under this one, and main as merged equals that base byte for byte in every file either touches (Planned at); it changes nothing the Portfolio reads but `src/styles/shared/primer-hand.css`'s `--primer-slip-h` token, which no Portfolio sheet consumes (`git grep -n -e "--primer-slip-h" -- src` names only `src/styles/shared/primer-hand.css` and `src/cli/gallery.ts`). The weights in The design are read with it; the implementer quotes the merged build's weights in the PR body, read the same way, and a difference there is no stop condition.
- **Sub 8, Issue #1254, pull request 2** (the "learn this room" press, not yet planned): it meets this pull request in `header.chrome` (its press renders after the trail in `src/layouts/BaseLayout.astro`, and the hand's note, appended by script, stays the cluster's last child) and in the chart's height (about 24 px more cluster in every room, so the Portfolio's chart shrinks again beside the note, a reading its plan owes); not on this page's `extraCss` line, since its press is dressed in `src/styles/shared/shell.css`.
- **Issue #1258**: C139; the dispatcher posted this room's readings there under Q4 a (comment 7102412007), and under Q7 a the two-line press row at 1280 as the Portfolio's arrival state (comment 7103237997).
- **Issue #1385**: C137; nothing from the Portfolio, and the Explorer's Lay reading only under Q2 b or c.
- **Issue #1424** (the Mac's local reds on the Prospect page's cold Back): `chart-drawer`'s CD38 reds on this Mac on main's own build at `4dfcee7a`, on pull request 8's, on the planned and on the fixed build alike (Evidence, C143), a reading for the dispatcher to add there; nothing here touches it.

## What remains before Issue #1253 can close

With pull request 8 and this one merged:
- **Every room with a ladder rings its steps' controls on arrival and seals them when done**: the nine ladders' routes (`LADDERS` in `src/site/shared/primer/ladders.ts`) each boot the hand, and `HAND_ROOMS` names all nine, which PK16's reverse clause ties to the press. Every press step reads done at its press but Today's Draft dispatch (ruled so, pull request 7's Q2 a), once Q2 a lands; every road and read step on arrival; every step with nothing to see on arrival; and no step is left that can never seal, the only steps sealed on use with no act being the two commissions, each watching a `change` of its controls (`out/1253-dry-run/1253-pr9-seal-census-planned.log`, `node out/1253-dry-run/1253-pr9-seal-census.ts` over the planned ladders, against `-base.log` over pull request 8's).
- **Every guard bites**: each pull request's own prover round; this one's owes PK27 to PK29, BP-H1's witness, PK16's clauses and PF10.
- **The plate reader's read matches the ruled D stills**: the round drew D for the Explorer, the Prospect and the Ribbon; every other room was ruled from its own stills under M1, and the look stays provisional until Issue #1258.
- **The spec lines**: the rulebook's second exception and the explorer-doctrine `step` key line are on main since pull request 1 (recon: CURRENT), and the ui-design paragraph since pull request 1, edited by pull request 8.
- **Outside the acceptance**: the post-use review (Issue #1258, Sub 12), the done row past the note (Issue #1385), and Sub 8's press (Issue #1254), each its own issue. So this pull request closes Issue #1253 (Q6 a, C142).

## Found while planning, not this pull request's

- **The Explorer's Lay step at 1024** (Q2): the place card stands partly off the window's left edge, its Lay press's ring at x −17.69, on main and planned alike (part E); the card's seat is the Explorer's; posted to Issue #1258 with C139.

## Rulings

Alex, 2026-11-23 (https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7102411658), quoted as the dispatcher relayed them, ruled from the stills in the main checkout's `out/1253-pr9/` (its page `out/1253-pr9/index.html`, each question's stills in its folder's `stills/`):

- **Q1, "Copy the address from the bar": "On arrival, mark dropped (Recommended)".** "The step seals on arrival and drops its `kind: "play"` mark, as the Gallery's step does; the key leaves the address at once, so the copied address is clean." The plan as written: the keep step's `kind: "play"` deleted, PK27's `arrival` for it. The ruled stills are `out/1253-pr9/q1-the-address-to-copy/stills/q1-a-*`. The options not taken were the mark kept by a shared-kit rule (b) and the step as it stands (c).
- **Q2, the Explorer's two presses that read done on arrival: "Both wait, here (Recommended)".** "The Portfolio lesson's corner step and the Explorer's "Or press Lay the prospect on the table" each wait for their press (ruling E1); after this, every press in every room waits for its press except Draft dispatch, which he set aside on pull request 7." The plan as written: the two `do` acts, PK27's corner row and PK28. The ruled stills are `out/1253-pr9/q2-the-explorers-two-presses/stills/q2-a-*`. The options not taken were the corner alone (b) and neither (c).
- **Q3, the lesson's first step on a device holding sheets: "Open an empty table (Recommended)".** "The step's address gains `#table=`; the device's sheets are untouched." The plan as written: the bare step's `at`, PK29. The ruled stills are `out/1253-pr9/q3-the-first-step-on-a-device-holding-sheets/stills/q3-a-*`.
- **Q4, the look: "Build as shown (Recommended)".** "Provisional until the review after use; this room's look readings join Issue #1258." Posted there by the dispatcher, comment 7102412007 (C139). The ruled stills are every `out/1253-pr9/q4-the-look/stills/q4-a-*.png`.
- **Q5, the room's own press row over the sheet's title at 1280: "Fix it here"** (not the planner's recommendation). "The fix joins this pull request, and the plan comes back to him once more with the fix measured." The plan as written: `paintTop` and PF10, `showTop` calling it (The design, Files, Tests item 4, C144 to C146), measured in `out/1253-pr9-fix/` and put to him as Q7. The options not taken were filing it (a) and no issue (c).
- **Q6, whether this pull request closes Issue #1253: "Yes, close it (Recommended)".** "Issues #1258 and #1385 stay open and carry what is left." The plan as written: C142.
- **The order: "Start Gallery now (Recommended)".** "Pull request 8 (the Gallery) builds and merges first; this pull request builds on top of it." The plan's Gallery-first form stands (C141, the first stop condition).
- "The planner's calls C129 to C143 were not put to him one by one and stand as the plan's."

Alex, 2026-11-23 (https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7103237584), quoted as the dispatcher relayed it, ruled from the stills in the main checkout's `out/1253-pr9-fix/` (its page `out/1253-pr9-fix/index.html`, the stills in `q7-the-press-row-fixed/stills/`):

- **Q7, the press-row fix and its cost: "Build the fix (Recommended)".** "`showTop` writes the folio lines before it lays out (through `paintTop`, with PF10), so the sheet's title reads whole on every arrival; at 1280 with sheets gathered the press row stands on two lines and the chart is 0.787 of today's first size, the layout the room already takes after any resize. Leaving it and filing an issue was not taken. The two-line row at 1280 as the arrival state joins the post-use review on Issue #1258." Posted there by the dispatcher, comment 7103237997. The plan as written: `paintTop`, PF10 and `showTop` calling it (The design, Files, Tests item 4, Order of commits item 5, C144 to C146). The ruled stills are every `out/1253-pr9-fix/q7-the-press-row-fixed/stills/q7-a-*.png`; the option not taken was leaving it and filing it (b, `q7-b-*`).
- "The Gallery (pull request 8) merged as PR #1434 at 8c68865c, so this plan's Gallery-first form stands. The planner's calls C144 to C146 stand."
