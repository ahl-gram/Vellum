# Issue #1253, pull request 5: the pointing hand in the Prospect

**Planned at:** origin/main `dc297ca2e2d6c7833c76e4f415bc07e291d2c869` (PR #1423 merged; the hand's last pull request, PR #1390, pull request 4, merged at `17831e5b`), the issue's comment count 20 (`gh api repos/ahl-gram/Vellum/issues/1253/comments --paginate | jq length`): the orchestrator's note of 2026-11-09 (6754035498), Alex's rulings M1 to M6 (6867668486), the archive of revision 0 (6867691563), Alex's ruling on revision 1 (6869168142), the two parts of the archive of revision 1 (6869172162, 6869172683), the step 12 record of pull request 1 (6869302236), Alex's ruling on PR #1381 (6869932050), Alex's rulings on the pull request 2 plan (6870840753), the archive of the pull request 2 plan (6870879969), the step 12 record of pull request 2 (6871050954), Alex's ruling on PR #1386 (6875859525), Alex's rulings on the pull request 3 plan (6877686192), the archive of the pull request 3 plan (6877712263), the step 12 record of pull request 3 (6877831213), Alex's rulings on the pull request 4 plan (6879653457), the archive of the pull request 4 plan (6879676827), the step 12 record of pull request 4 (6879806267), Alex's ruling on PR #1390's ring contrast (6880308628) and Alex's rulings on this plan (7088448244). Six of the twenty open `Plan archive, not a ruling:` and are not rulings. Main has not moved since the plan was first written (`git fetch origin main`, then `git rev-parse FETCH_HEAD`, re-read when the rulings were folded).

**Rulings:** Alex, 2026-11-22, https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7088448244, every item the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr5/`: Q1 "At the press", Q2 "Build now, fix in #1385", Q3 "Build as shown", and the planner's calls C62 to C74 stand as written (the Rulings section at the foot quotes each and names what it binds). No ruling changed the design this plan was written to.

**Open decisions:** none.

**Rulings that bind this plan before its own menu:** M1 to M6 (6867668486), C13 and C23 (6869168142), PH3 dropped (6869932050), D0 to D4 and C36 (6870840753), the reverse check on `HAND_ROOMS` (6875859525, landed in PR #1388), E1, E2 and C42 (6877686192), P1 A, P2 a and P3 a (6879653457), and the keep ring's contrast left to Issue #1258 (6880308628). E1's rule, as the dispatcher relays it for every room: a step that asks the reader to press something reads done only when they do, and a road step reads done on arrival.

**Recon.** `vellum-spec-recon` read the issue's body and its 19 comments, Issue #1258 and its four comments, and Issues #1254, #1382, #1384, #1385, #1387 and #1392 with their comments, at `dc297ca2`: 23 ledger rows, 19 CURRENT, 4 STALE (2 marked blocking, 2 cosmetic), and 2 UNVERIFIABLE sub-claims (the body's byte figures, which no `generated/` in its tree let it weigh, and the plate's fit under the note, which this plan measured); its claims file is `out/1253-pr5-recon/claims.jsonl` in the planner's tree. Each finding's disposition:
- **The Prospect's `extraCss` lacks the two sheets** (STALE, blocking): this pull request's own work (Files).
- **"The ladder data is imported on demand"** and **"browser checks per room"** (STALE, cosmetic): superseded by M2 and C36, and by D1, C45 and C53; call C66.
- **"A step is sealed when the room sees its `then`"** (STALE, blocking), with its two traps: the lay step's outcome pins a one-plate table (ruled Q1, "At the press"), and the year step's outcome asks for 300 alone (call C68, measured).
- Recon's decision 3 (a browser check for the room): call C66. Its decision 4 (the look): ruled Q3, "Build as shown". Its decision 5 (the order of the rooms): nothing made the Prospect unable to go next but the done row's overflow, ruled Q2, "Build now, fix in #1385".
- Recon's "the Explorer's `explorer-drawer` step has the same shape" is rejected: that step's address carries its table (`LAID` is `SURVEYED` plus `&table=ONE_SHEET` in `src/site/shared/primer/explorer-sheet.ts`), and a table the address carries wins over the stored one (`folioOnArrival` in `src/site/shared/table-store.ts`), so its count is fixed. The flaw is the dog-ear step's, whose address carries none (Found while planning).

## What this pull request delivers

When a reader arrives in the Prospect from a Try it on the Primer (`/prospect/?step=<id>#seed=42&i=0`), the room does what the Explorer, the Writing Room, the Reading Room and the Print Room do: once its first plate lands it rings the controls the step names, lays the manicule beside the ring, seats the slim note under the head cluster's trail, seals the step when the room sees it done or used, and drops the key with the hash kept. The four steps of the Prospect's ladder after its first are the only ones whose Try it opens this room (`prospect-enter`, its first, opens the Explorer and has been sealed there since pull request 1). The Explorer's `prospect-enter` press onward, `/prospect/?step=prospect-note#seed=42&i=0`, leads into this room and now finds a hand; no step's press onward leads out of it (`prospect-road` is its ladder's last step) (`out/1253-dry-run/1253-pr5-steps.log`, `node out/1253-dry-run/1253-pr5-steps.ts`).

It teaches the lay step what using it is, as rulings E1 and P1 A have it (Q1 a): "Press Lay this prospect on the table" reads done at a press of that press, whatever the reader's Chart Table already holds.

It lists the room in `HAND_ROOMS`. The other four rooms (the Ribbon, Seed of the Day, the Gallery and the Portfolio) follow in later pull requests (M1); this one leaves Issue #1253 open (call C71).

## Specs

The implementer reads these, beyond `CLAUDE.md`'s table for the work it does:
- `handbook/plans/1200/1253/1253-r1-plan.md`, The design, for how the hand works; this plan changes none of the kit's code.
- `handbook/plans/1200/1253/1253-pr4-plan.md`, The design and Tests, for the wiring this room repeats, `HAND_ROOMS`, BP-H1, PK16 and PK21, whose form PK23 takes.
- `handbook/specs/ui-design.md`, The Primer's pointing hand (line 263): the provisional dress this room wears unchanged.
- `handbook/specs/explorer-doctrine.md`, "The address is a photograph" (the `step` key line, 311).
- `handbook/specs/site-architecture.md`, How a page is authored (sheet order, `extraCss`).
- `handbook/specs/cascade-traps.md`, the bullet "`contain: layout` re-anchors every fixed descendant too, and for good": the Prospect is a staged chart room and its body reads `contain: layout` (part Z of `out/1253-dry-run/1253-pr5-probe-XWDPZ.log`), so the hand's page coordinates hold here as in the other four rooms.
- `handbook/specs/check-placement.md`: The unit suite, and "A browser check is written".
- `handbook/specs/settle-doctrine.md`, When a check leaves the run: the bullets "A check's coverage is needless on one of two grounds" (call C66's ground) and "Every deletion is Alex's ruling" (the drift walk's read Q1 a narrows, ruled with Q1).
- `handbook/specs/conventions.md`: How a design decision is made (building to ruled stills), and comments.

## The design

**The Prospect takes the hand with two lines and two sheets** (calls C62 and C63).
- `src/pages/prospect/index.astro` links the Primer's marks and the hand's sheet before the shared stage sheets, in the Writing Room's and the Print Room's order: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`. Every selector in the two sheets is scoped to `.primer-slip`, `.primer-ring`, `.primer-hand` or `.primer` (pull request 3's reading, unchanged since), so neither reaches the room's furniture.
- `src/site/prospect/app.ts` boots the hand when the first plate lands: `void bootHandOnce({ route: "/prospect/" });` as the last statement of `draw()`'s `.then`, after `paintLay();` (C62).

**What the hand does in each of the room's four steps**, read on the built spike at 1280 by 800 and 1024 by 768, motion reduced, on a bare desk (part A of `out/1253-dry-run/1253-pr5-probe-A.log`, `node out/1253-dry-run/1253-pr5-probe.ts A`; the uses in parts Y and T of `out/1253-dry-run/1253-pr5-probe-YT.log` and `-TLX.log`). The spike is `out/1253-dry-run/1253-pr5-spike.diff` at `dc297ca2`: its default steps file is the planned ladder; `?arm=asis` fetches main's, 53,333 bytes as main's own build serves (`out/1253-dry-run/1253-pr5-build-main.log`'s `dist/primer/steps.json`); `?arm=face` fetches Q1 b's.

| step | as on main | as planned (Q1 a) | ring holds on arrival |
|---|---|---|---|
| `prospect-note` "Read {The engraver's note}." | sealed on arrival (a read, N2) | the same (C69) | the note panel's verb, 310.8 by 30 |
| `prospect-year` "Type an earlier year, 300, in {viewed in the year}, and press {Engrave}." | outcome: sealed when the era line reads `Before the founding · An. 300` (the title and the founding line it also reads already hold) | the same (C68) | the year box with its label and Engrave, one ring 308.09 by 45.19 on the folio's head |
| `prospect-lay` "Press {Lay this prospect on the table}." | outcome: sealed when the press reads `Already on the table` and the count line `one sheet laid · room for five more`, both changed since arrival | waits; sealed at a press of the Lay press, whatever the table holds | the Lay press, 235.39 by 40.59, at the engraver's note panel's foot |
| `prospect-road` "Press {Take the road from Laukuwelua in The Wayfarer's Ribbon}." | sealed on arrival (a road out, N2) | the same (C70) | the Ribbon road press, 211.5 by 64, in the legend row |

- Every named control stands on arrival. Nothing scrolls sideways at either width in any of the sitting's 26 shots, no shot is marked `stage-under`, and the ring, the manicule and the note overlap the plate's sheet by 0 px² in every one (`out/1253-pr5/notes.md`, the plate reader's). No console error and no 4xx across every probe part and the sitting.
- **The year step** (part Y): 300 and Engrave seals it, and so does 300 and Enter (the form sent, D2); 299 and Engrave does not (the era line reads `An. 299`), nor Engrave with the year untouched. At every seal the key goes and the room's hash stays, with the year it writes (`#seed=42&i=0&year=300`).
- **The lay step, over four tables a reader may arrive with** (part T, one press of the Lay press after arrival, the table set in `vellum.table.v1` before the room opened):

  | table on arrival | the press reads | main's ladder (Q1 c) | the press's face alone (Q1 b) | at the press (Q1 a, planned) |
  |---|---|---|---|---|
  | empty | `Lay this prospect on the table` | sealed | sealed | sealed |
  | another town's plate | `Lay this prospect on the table` | not sealed: the count reads `two sheets laid · room for four more` | sealed | sealed |
  | this plate | `Already on the table` | not sealed: nothing changes | not sealed: nothing changes | sealed |
  | full (six plates) | `No room on the table` | not sealed | not sealed | sealed, though nothing was laid |

  **This plate is what a reader who walked the Explorer's lessons arrives with.** The Explorer card's own Lay press (`explorer-lay-prospect`, "Or press {Lay the prospect on the table}") lays `k-p.seed-42.style-antique.i-0.year-1059`, the very plate this step lays (part L of `-TLX.log`: the card pressed on a bare desk, the store read back). Arriving after it, main's ladder never seals the step; the planned one seals it at the press.
- The Lay press is never greyed (a refused press is dimmed by class, never `disabled`), so the ring stands on it in every state, and the hand's `click` watch, on the document in the capture phase, hears a refused press too.
- Another step's control seals nothing (part X): 300 and Engrave on the lay step, under the planned ladder and main's, and the Lay press on the year step, each leave the step open with its key.
- No road out of the room carries the key: of the 30 links outside the note, none has a `step` key, with the key in the address and after the seal (part X).
- **The Explorer's press onward leads in** (part E): the Explorer's `prospect-enter` done row reads `Next, The engraver's note ›` and links `/prospect/?step=prospect-note#seed=42&i=0`; followed, the Prospect seals `prospect-note` on arrival, drops the key and keeps `#seed=42&i=0`. No Explorer file changes for it.
- The time from the load to the note, motion on, three loads: 868 to 873 ms against the control's 865 to 877 ms to the room's rest (part W).

**The note** seats as the seats round ruled for every room (Issue #1155 comment 6754142680, item 5), appended last to `header.chrome`; the room's refit (`bindZoomRoom` in `bindProspectRoom`, `src/site/prospect/seats.ts`) fits the plate under it.
- Its width is 620 at 1280 and 590.39 at 1024 (`min(620, slip's left - head's left - 24)`, the engraver's note panel at 896 and 640).
- It is 52.0 to 55.1 px tall on the note, lay and road steps, 71.5 on the year step waiting (its sentence on two lines), 71.5 on the lay step done, and once the year step is done 91.0 at 1280 and 110.4 at 1024, the done row narrowing the sentence beside it to three and four lines.
- **The done row keeps one line and stands 12.19 px inside the note on every step but the lay step.** On the lay step, done, its press onward `Next, Take the road from Laukuwelua in The Wayfarer's Ribbon ›`, the longest of the 81 steps' (62 letters, `out/1253-dry-run/1253-pr5-onward.log`, `node out/1253-dry-run/1253-pr5-onward.ts`), runs 148.27 px past the note's right edge at 1280 and 177.88 at 1024, over the desk (`out/1253-pr5/q2-done-note-past-its-edge/stills/q2-a-as-built-done-1280.png` and `...-1024.png`). Issue #1385 holds the same fault in the Explorer. Ruled Q2, "Build now, fix in #1385": this pull request leaves it to that issue.
- What it costs the plate (the share of today's sheet area kept, the plate reader's `out/1253-pr5/y-measurements/tables.md`, 1280 and 1024): 76.6% and 73.9% with a one-line note on the note and road steps, 77.6% and 75.1% on the lay step waiting; 71.2% and 67.3% with the year step's two-line note; 65.1% and 52.9% once the year step is done; 71.2% and 67.3% once the lay step is done. The room never goes `stage-under`.

**The ring and the manicule** are pull request 1's, unchanged in their dress (ruling D3).
- The ring stands at z-index 46 and the manicule at 47, above every piece they ring here: the folio's corner (10), the engraver's note panel (20), the legend row (10) and the head cluster (10) (part Z).
- On every step the ring holds its controls 5.9 to 8.0 px clear on each side.
- **The Lay press at 1024 by 768 sits under the engraver's note panel's foot**, as it does today with no key: 11.52 of its 28.59 px show, and the point at its centre is not the press (`out/1253-pr5/x-context/stills/context-today-1024.png`, `out/1253-pr5/q3-the-look/stills/q3-a-lay-arrive-1024.png`). The ring circles it there, its foot at y 768.1 on a 768-tall window, so its bottom line is not drawn. A 17 px scroll of the panel shows the whole press and the ring with it (`out/1253-pr5/q3-the-look/stills/q3-b-lay-scrolled-arrive-1024.png`, the scroll staged; the page itself does not scroll). Of the 65 steps whose Try it opens a room that boots the hand (the four on main and this one), at both widths, this is the only control a scrolling panel cuts on arrival (`out/1253-dry-run/1253-pr5-hidden.log`, `node out/1253-dry-run/1253-pr5-hidden.ts`). Ruled Q3, "Build as shown": it goes to the review (C73).
- **The manicule crowds here too, as ruling D3 leaves it** (the plate read, ink of the glyph): on the year step at 1024 it lies on the nav's last word, "Glossary" (27 px of its ink); on the road step it lies on the legend's "Return to The Explorer" press at both widths (711 px of its ink inside that press, 28 to 30 on its lettering), its pale fill reading 1.2:1 on the cream press and its outline 10.26:1; on the lay step on the Glass's home button (11 to 16 px). On the note and year steps at 1280 it stands on the desk, over nothing.
- **The ring's lines run through words beside it** (the 6 px pad Issue #1258 holds): the folio's tagline and gloss on the year step, the panel's count line on the lay step (38 px of its ink at 1280, 302 at 1024), and the legend's "The roads out" on the road step (`out/1253-pr5/q3-the-look/stills/q3-a-road-arrive-1280-hand@2x.png`).
- Contrast from pixels: the ring's gold line reads 8.8 to 10.2:1 over the walnut desk and the legend row, where its walnut line reads 1.0 to 1.2:1; over the engraver's note panel's parchment the walnut reads 9.46:1 and the gold 1.09:1; over the Explorer press's cream the walnut reads 8.72:1. One of the two lines carries the ring on every ground, as in the other four rooms. The note's sentence reads 7.42 to 8.72:1 on its panel, "done" 6.54:1, the seal's digit 6.3 to 6.4:1, "Back to The Primer" 6.53 to 6.84:1, the press onward 8.72:1 gold and 5.15 to 5.75:1 dimmed. The manicule's fill reads 9.7 to 12.1:1 over the desk and its outline 10.26 to 10.64:1 over the parchment and the cream press.
- The four dresses change none of the grounds under the ring, the manicule and the note (part D: antique, topographic, ink and nautical, the year and lay steps at 1280, every box the same and none over the plate), since none of them stands over the plate (C72).
- On paper none of it prints: under print media the ring, the manicule and the note read `display: none` (part P).

**The lay step taught its use** (Q1 a, "At the press"). The ladder's form for "a step with an act and no outcome" is the Explorer's, the Reading Room's and the Print Room's: `do` with no `then`, which `sealWhen` seals on use, watching what `useWatches` derives from the acts.
- `prospect-lay` keeps `do: [click("#pp-lay")]` and loses its `then`, so `sealWhen` gives `use` and `useWatches` `[{ event: "click", css: "#pp-lay" }]`.
- **What the lost outcome read leaves.** The drift walk (`walkStep` in `e2e/support/primer-walk.ts`) performs a step's `do` and reads its `then` only where it has one, so `primer-prospect` prints 10 checks in place of 11: `prospect-lay shows what it says once the step is done` goes (`out/1253-dry-run/1253-pr5-e2e-primer-prospect-main.log`, `ALL PASS (11/11)` on main's ladder; `...-spike.log`, `ALL PASS (10/10)`). Its claim, that a press on an empty table turns the press to `Already on the table` and the count line to `one sheet laid · room for five more`, is held by PB15 in `e2e/suites/prospect/gestures.ts`, through its conjunct "a real press files the plate: the device, both roads, the dimmed face and the count". Confirmed by mutation (`handbook/specs/settle-doctrine.md`, What a step holds): with `paintLay`'s `layCount.textContent = countLine(table);` in `src/site/prospect/app.ts` made `countLine([])`, built, `VELLUM_E2E_SUITES=prospect npm run test:e2e` printed `FAIL  PB15 the filing press on the engraver's note: ... — {"wrong":["a real press files the plate: the device, both roads, the dimmed face and the count"],...` and `SOME FAILED  (25/28)` (`out/1253-dry-run/1253-pr5-e2e-prospect-pb15-mutant.log`, built from `dc297ca2` with the spike and the one mutated line, `out/1253-dry-run/1253-pr5-pb15-mutant.diff`); unmutated, the same suite on the spike read `SOME FAILED  (26/28)`, PB18 and PB10 alone, which main's own build reds the same on this Mac (Evidence).
- No other reader of `then` meets the change: the drift walk, the hand (`sealWhen`, `watchOutcome`), `heldBy`'s step identity in `e2e/support/primer-judge.ts` (no earlier step shares the lay step's reads, with its `then` or without) and the kit; the Primer page reads a step's `act`, `see`, `at`, `only` and `kind`, not `then` (`git grep -n "step\.\(then\|do\|first\)\|s\.then\|s\.do\b" -- src/site/primer src/site/shared/primer e2e test-support scripts test`).
- The steps file shrinks from 53,333 bytes (7,365 gzipped) to 53,190 (7,347) (node's zlib at its default level, over the spike's `dist/primer/steps-asis.json` and `dist/primer/steps.json`).

**What holds the room's wiring, and why no browser check is added** (call C66, on ruling D1's ground).
- Every rule the room calls is the shared hand's, held in the unit suite (PK1 to PK22) and walked in the browser by the Explorer's PH1, PH2 and PH4 to PH8. What is the Prospect's own is its wiring (the page links the two sheets, its script boots the hand) and its ladder. A browser check here would read only that wiring of a shared module, coverage `handbook/specs/settle-doctrine.md` names needless (Alex, 2026-11-08, Issue #1273), the ground Alex ruled D1 on for the Writing Room.
- So the wiring is held by BP-H1 (the page's sheets) and PK16 (the room's bundle reaches the hand, and the bundles that reach it are exactly `HAND_ROOMS`), and the ladder by PK23.
- What no instrument then holds in this room: that the boot call runs (a call placed where no plate reaches it passes BP-H1 and PK16). The plate reader reads the room at step 11.

**The room's boot grows by the hand's code** (call C67, on ruling C36). With a fifth room importing the hand, the press leaves its chunks as they are and the Prospect's boot reaches `explorer/chunks/primer-hand.js` (17,148 bytes), now shared by five rooms. Read statically from each twin, main's build against the planned change's (`out/1253-dry-run/1253-pr5-chunks-main.log` and `-planned.log`, `node out/1253-dry-run/1253-pr5-chunks.ts <label>` after `npm run build`, gzip by node's zlib at its default level):
- The Prospect: 20 files to 21, 735,767 to 753,027 bytes (199,311 to 205,302 gzipped), so 17,260 bytes (5,991 gzipped, 2.3%) on every visit, with a key or not.
- Every other room: unchanged, file for file and byte for byte.

### Alternatives rejected

- **Booting the hand at the room's start, or before `paintLay()`**: before the first plate lands the note's title, the era line and the Lay press are the empty markup's (the press hidden), so the year step's arrival reads and the ring's first frame would be taken on a room not yet at rest; the end of the first `.then` is the one place every successful first plate passes, after `last` is set, which the press needs.
- **Keeping the lay step's outcome and loosening its count line** (Q1 b): it still never seals for a reader who laid this plate from the Explorer's card, the case the Explorer's own lessons lead to (part L).
- **Sealing the lay step on arrival when the plate is already on the table**: a fourth seal mode in the kit every room shares, to mend one step's data; and such a reader has pressed nothing here, which E1 asks for.
- **Mending the done row's overflow in this pull request, with "Next step ›" for a road press, or holding the room until Issue #1385 is fixed**: Q2's options b and c, which Alex did not take.
- **Scrolling the hidden Lay press into view on arrival**: Q3's option b, which Alex did not take.
- **Four dresses on every still**: call C72.
- **The hand's browser checks in this room, as the issue body lists them per room**: call C66.

## Files

Edited (the whole change as the planner staged it: `out/1253-dry-run/1253-pr5-planned-change.diff`; Prettier clean, `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` exit 0 on every `.ts` file it names, `npm run check` exit 0):

- `src/pages/prospect/index.astro`, line 23: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`.
- `src/site/prospect/app.ts`:
  - `import { bootHandOnce } from "../shared/primer-hand.ts";` on the line after `import { foundAddress, pageFounder, writtenParams } from "../shared/written-world.ts";` (line 29 on main).
  - `void bootHandOnce({ route: "/prospect/" });` on the line after the `paintLay();` that follows the comment opening `// AFTER \`last\`, never before it` inside `draw()`'s `.then` (line 192 on main), the callback's last statement. The other three `paintLay();` calls (lines 132, 140 and 152 on main, in the Lay press's click handler and the `pageshow` handler) are not touched.
  - 216 lines on main, 218 after.
- `src/site/shared/primer/prospect.ts` (Q1 a):
  - in `prospect-lay`, its `then: [...]` (four lines: the held face and the count line) is deleted; `do: [click("#pp-lay")],` stays;
  - the names that `then` alone used go: line 1 becomes `import { LAY_ON_PAGE } from "../../explorer/chart-drawer.ts";`, and the lines `import { parseTableValue } from "../table-address.ts";` (line 4) and `const LAID = parseTableValue("k-p.seed-42.style-antique.i-0.year-1059");` (line 10) are deleted;
  - 72 lines on main, 66 after.
- `test-support/hand-steps.ts`: `HAND_ROOMS` gains `"/prospect/"` at its end (call C65), which Prettier lays out one room a line: `export const HAND_ROOMS: readonly string[] = [` then `"/explorer/",`, `"/writing-room/",`, `"/reading-room/",`, `"/print-room/",`, `"/prospect/",` and `];`. 13 lines on main, 19 after.
- `test/site/built-pages.test.ts`, BP-H1: `assert.ok(HAND_ROOMS.includes("/prospect/"), "the rooms list names the Prospect");` on the line after its Print Room witness (line 247 on main). 256 lines on main, 257 after.
- `test/site/primer-hand-steps.test.ts`: PK23, new, after PK21 and before PK8 (Tests). 183 lines on main, 190 after.

Created: none. Deleted: none. No file passes 400 lines.

## Tests, in the order they are written

All unit tests. The plan adds no browser check (call C66), so no ledger line and no step seconds are owed. It narrows one browser check by deleting the data it reads (the drift walk's `prospect-lay shows what it says once the step is done`, ruled with Q1, "At the press"), whose claim PB15 holds, confirmed by mutation (The design).

1. `test/site/primer-hand-steps.test.ts`, **PK23**, after PK21 and before PK8, exactly:
   ```ts
   test("PK23 the Prospect's steps are used as rulings E1 and P1 A have them: the lay step at its press whatever the table holds; the year step on its outcome; the engraver's note and the road on arrival (Issue #1253 pull request 5)", () => {
     assert.equal(sealWhen(stepOf("prospect-lay"), DESK), "use", "prospect-lay");
     assert.equal(sealWhen(stepOf("prospect-year"), DESK), "outcome", "prospect-year");
     for (const id of ["prospect-note", "prospect-road"]) assert.equal(sealWhen(stepOf(id), DESK), "arrival", id);
     assert.deepEqual(useWatches(stepOf("prospect-lay")), [{ event: "click", css: "#pp-lay" }]);
   });
   ```
   `sealWhen`, `useWatches`, `stepOf` and `DESK` (`{ touch: false, motion: true }`) are the file's own already. The text exactly as staged: the PK23 hunk of `out/1253-dry-run/1253-pr5-planned-change.diff`.
   - Red at commit 1 on its first assertion: `AssertionError [ERR_ASSERTION]: prospect-lay`, `actual: 'outcome'`, `expected: 'use'` (`out/1253-dry-run/1253-pr5-commit1-red.log`, `npm test -- --test-name-pattern="PK23" test/site/primer-hand-steps.test.ts` over main's source with the test staged). No stub: the functions exist with their signatures, and the red is the ladder's data.
   - Mutations, each read on the planned ladder (`out/1253-dry-run/1253-pr5-mutate.log`, `node out/1253-dry-run/1253-pr5-mutate.ts <a copy of the planned prospect.ts>`, the control 0 failing): the lay step's `do` deleted (fails `prospect-lay`, `actual: 'arrival'`); the year step's `then` deleted (fails `prospect-year`, `actual: 'use'`); the lay step's act a `set("#pp-lay", "x")` in place of the press (fails the watch, `actual: [ { event: 'change', css: '#pp-lay' } ]`); and main's ladder, the lay step keeping its `then` (the commit 1 red).
2. `test/site/built-pages.test.ts`, **BP-H1's witness** (Files). Red at commit 3 on its loop's assertion, the Prospect's built page linking neither sheet: `/prospect/ links /shared/fonts.css, /shared/motion.css, /shared/house.css, /shared/atelier.css, /shared/chart-of-the-atelier.css, /shared/slide-away.css, /shared/chart-stage.css, /prospect/index.css, /shared/shell.css` (`out/1253-dry-run/1253-pr5-commit3-red.log`, `npm test -- --test-name-pattern="no page's bundle carries the Primer|BP-H1" test/site/app-bundles.test.ts test/site/built-pages.test.ts`, the list and witness staged and the room unwired). Green at commit 4 (`out/1253-dry-run/1253-pr5-commit4-green.log`, the same pattern with PK23 added, 3 pass). Mutations: `/shared/primer-hand.css` dropped from the room's `extraCss`; the two sheets swapped in it.
3. PK16's forward clause, unchanged, now reads the Prospect: red at commit 3 with `/prospect/'s bundle never names the data file, so no Try it can point its hand` (the same log). Its reverse clause, unchanged, reds a room that boots the hand without joining the list: with the room wired and the list as on main it printed `actual: [ '/explorer/', '/print-room/', '/prospect/', '/reading-room/', '/writing-room/' ]`, `expected: [ '/explorer/', '/print-room/', '/reading-room/', '/writing-room/' ]` (`out/1253-dry-run/1253-pr5-pk16-R1-wired-mainlist.log`), and with the room listed it passes (commit 4's log). Mutation: the room's import and boot call deleted.

The prover owes PK23, BP-H1's witness and PK16's two clauses over this room, against the mutations named. PK1 to PK22 and PH1 to PH8 do not change.

## Order of commits

1. The archived plan, `handbook/plans/1200/1253/1253-pr5-plan.md` (this file, unchanged), with PK23 red on its first assertion. Then push.
2. The lay step's `then` deleted in `src/site/shared/primer/prospect.ts`, with the three names only it used (PK23 green).
3. `HAND_ROOMS` gains `"/prospect/"` and BP-H1 its witness (BP-H1 red on the room's links, PK16 red on the room's bundle).
4. The room's two sheets and its boot call (BP-H1 and PK16 green).
5. `git merge origin/main` (workflow step 10), then the evidence.

## Rosters and doctrine

- **`HAND_ROOMS`** in `test-support/hand-steps.ts` gains `"/prospect/"`, the fifth room in the order they took the hand (C65). PK16's reverse clause ties it to the press's twins.
- **The page's sheet list**: `test/site/astro-scaffold.test.ts`'s head tests read the built head (`shell.css` last, `chart-stage.css` before the page's own); the room's array keeps both (the full unit run below).
- **The sheets join no other list**: they stand on disk and in the stylesheet lint, and not in `HOUSE_SHEETS` (`scripts/lint/sheet-owners.ts`), since not every page links them.
- **No spec line changes.** The rulebook's second exception (line 99), the explorer-doctrine `step` key line (311) and the ui-design paragraph (263) are written for every room (recon: CURRENT). A step sealed at its use is ruling M3's and has stood in that paragraph's "a step the room sees done is sealed" since pull request 1. The lay step's lost `then` changes no sentence the Primer page shows (the page reads a step's `act`, `see`, `at`, `only` and `kind`, not `do` or `then`).
- **The Primer's drift walk** (`primer-prospect`) prints one check fewer, `prospect-lay shows what it says once the step is done`; no suite list, skip list or count names it (`git grep -n "prospect-lay" -- e2e` finds nothing).
- **No new suite, bundle entry or e2e helper**; `e2e/support/suites.ts` is unchanged.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). The planner's `npm test` over the whole planned change staged read 4179 pass, 0 fail, exit 0 (`out/1253-dry-run/1253-pr5-unit-planned.log`).
- `npm run build`, then, one at a time: `VELLUM_E2E_SUITES=primer-prospect npm run test:e2e` (the drift walk over the lay step's lost outcome: 10 of 10 on the spike, `out/1253-dry-run/1253-pr5-e2e-primer-prospect-spike.log`, against 11 of 11 on main's ladder, `...-main.log`) and `VELLUM_E2E_SUITES=prospect npm run test:e2e` (the room's own suite over its new sheets and boot call). **On this Mac the `prospect` suite reds PB18 and PB10 on main's own build**: `out/1253-dry-run/1253-pr5-e2e-prospect-main.log`, built from `dc297ca2` with no change, reads `SOME FAILED  (26/28)`, PB10's line `log.error: Permissions policy violation: unload is not allowed in this document.`, the local browser being Brave 158.1.100.58; CI's lane B passed both at `dc297ca2` (run 44859957436, job 136710830912); the spike reds the same two and no other (`...-spike.log`, 26 of 28). Those two are main's on this Mac, not this pull request's, and CI is their gate (C74). Never the full local lanes.
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance, ruled from stills): the four steps arriving at 1024 by 768 and 1280 by 800, the year step done by a typed 300 and Engrave, the lay step done by a press on a bare table and on a table already holding this plate, with contrast sampled from pixels. The step 6 sitting's driver is `out/1253-pr5/y-measurements/sitting.ts` in the planner's tree (copied to the main checkout's `out/1253-pr5/`).
- No still judge comparison: nothing here changes how the engine draws a world sheet.

## Calls made

Numbered on from pull request 4's C49 to C61.

- **C62** The hand boots as the statement after `paintLay();` in `draw()`'s `.then`, the first plate's landing. Rule: the issue's "each room's script calls the hand once its first draw settles", as C38 and C49 placed it; by that line the plate is shown, the folio and the engraver's note written, the status line cleared, `last` set and the Lay press painted, the room's rest the Primer's drift walk reads for `/prospect/` (`e2e/support/primer-rooms.ts`: `__vellumProspectState()` not null and `#pp-status` empty). `bootHandOnce`'s module flag makes every later draw (an Engrave) do nothing, and a first draw that fails reaches only the `.catch`, so it boots no hand (C6).
- **C63** The two sheets stand before the shared stage sheets, in the Writing Room's and the Print Room's order. Rule: C39 and C50; the head tests keep `chart-stage.css` last before the page's own, and the Prospect has no sheet of its own before them.
- **C64** `src/site/prospect/app.ts` (216 lines on main) takes one import and one call. Rule: it stays under 400.
- **C65** `"/prospect/"` joins `HAND_ROOMS` at its end. Rule: C32, C44 and C52, the rooms in the order they took the hand.
- **C66** No browser check of the hand in this room. Rule: ruling D1's ground, needless coverage of a shared module's wiring (`handbook/specs/settle-doctrine.md`, Issue #1273), as C45 and C53 took it; PK23 holds the room's ladder, BP-H1 and PK16 its wiring.
- **C67** The Prospect imports the hand statically, as the other four rooms do, and its boot grows by 17,260 bytes (5,991 gzipped) on every visit. Rule: Alex's "Load it always, as built" on C36 (comment 6870840753).
- **C68** The year step stays on its outcome: sealed once the plate shows its ground in the year 300 (the era line `Before the founding · An. 300`), whether the reader presses Engrave or Enter; 299, or Engrave with the year untouched, does not seal it. Rule: the step's own sentence asks for 300 ("Type an earlier year, 300, ... and press Engrave"), as the Print Room's pull step asks for 42 and stood on its outcome (pull request 4's table); Enter sends the form, as D2 counts it.
- **C69** The engraver's note step is sealed on arrival. Rule: N2, a step whose only act is a read, and E1 as relayed ("the Journal and road steps read done on arrival as ruled before").
- **C70** The road step is sealed on arrival. Rule: N2 and E1, a road to another room.
- **C71** The pull request leaves Issue #1253 open, its body carrying the closing-reference line in `.github/PULL_REQUEST_TEMPLATE.md`'s form for an issue a pull request deliberately leaves open, and `gh pr view <N> --json closingIssuesReferences` reads `[]`. Rule: M1; four rooms remain.
- **C72** The stills show the antique dress on every step, and one step in ink. Rule: every Try it opens `#seed=42&i=0` with no style, which presses antique; the four dresses change none of the grounds the ring, the manicule and the note stand on, none of which overlaps the plate (part D), as C55 found in the Print Room.
- **C73** This room's look readings go to Issue #1258 for the post-use review, posted by the dispatcher under Q3 a: the manicule's seats (on "Glossary" at 1024 on the year step, on the Explorer road press on the road step, on the Glass's home button on the lay step), the ring's lines through the tagline, the gloss, the count line and "The roads out", the plate's smaller share with the note up (52.9% at 1024 once the year step is done), and the Lay press shown only in part under the engraver's note panel's foot at 1024 by 768, the ring's foot cut by the window there. Rule: D3, in every room, for the manicule; P3 a for the rest.
- **C74** PB18 and PB10 red in a local run of the `prospect` suite are not a stop condition for this pull request, and CI is their gate. Rule: main's own build at `dc297ca2`, with no change, reds the same two on this Mac with Brave 158.1.100.58 (`out/1253-dry-run/1253-pr5-e2e-prospect-main.log`, `SOME FAILED  (26/28)`), while CI's lane B passed both at that commit (run 44859957436, job 136710830912); a red the change did not cause is the sibling kind workflow step 15 sends elsewhere (Found while planning).

## Open decisions

None. The three questions put to Alex at the STOP are ruled (Rulings, below).

## Stop conditions

Hand back, rather than adapt, when:
- a symbol, line or file named here is not where the plan says: the `written-world.ts` import and the `paintLay();` after the `// AFTER \`last\`` comment in `draw()`'s `.then` in `src/site/prospect/app.ts`, the `extraCss` line of `src/pages/prospect/index.astro`, the five steps, `LAID` and the imports of `countLine`, `layPressFace` and `parseTableValue` in `src/site/shared/primer/prospect.ts`, `HAND_ROOMS` in `test-support/hand-steps.ts`, PK21, PK8 and `DESK` in `test/site/primer-hand-steps.test.ts`, PK16's clauses in `test/site/app-bundles.test.ts`, BP-H1 and its Print Room witness in `test/site/built-pages.test.ts`;
- a red at commit 1 is on anything but the assertion named;
- `npm test` reds a file this plan does not name, above all a bundle or chunk test, a head test over the sheet list, or a Primer ladder test over the lay step's lost `then`;
- `primer-prospect` prints anything but 10 of 10; `prospect` reds any check but PB18 and PB10; or PB18 or PB10 red on CI;
- the plate read at step 11 finds a horizontal scroll at 1024 or 1280; the note over the plate or over the engraver's note panel; the ring off a control it names; the note's sentence under 4.5:1 against its panel, or both of the ring's lines under 3:1 against one ground; the done row past the note on any step but the lay step (Q2 a's known fault); the year step sealed by 299, by an untouched Engrave or on arrival; the lay step sealed before a press; or the page marked `stage-under` in any state;
- `git merge origin/main` conflicts in a file this plan names.

## Lanes and residue

- **Sub 8, Issue #1254** (the "learn this room" press on every room's trail line), not started, meets this pull request where it met pull request 4; whichever lands second merges them: `src/pages/prospect/index.astro`'s `extraCss` line, if Sub 8 links a sheet per page; `header.chrome`, where the hand's note, appended by script after the first plate lands, stays the cluster's last child; and the plate's height, which the two together make shorter again (52.9% to 77.6% of today's area with the note alone, The design), a reading Sub 8's plan owes.
- **Issue #1385** (the done row past the note): ruled Q2, "Build now, fix in #1385". The dispatcher adds this room's reading there (the lay step's done row 148.27 px past the note at 1280 and 177.88 at 1024, `out/1253-pr5/q2-done-note-past-its-edge/stills/`), so its fix and its check cover both rooms.
- **Issue #1382** (`factsOf` against the drift check's `FACTS`): the year step's outcome reads three texts, on which the two agree. Not touched.
- **Issue #1258**: C73; this room's readings go there with the dispatcher's post.

## Found while planning, not this pull request's

- **PB18 and PB10 red on this Mac on main's own build** (Evidence): Brave 158.1.100.58 logs `Permissions policy violation: unload is not allowed in this document.` where `backHome` in `e2e/suites/prospect/room.ts` adds an `unload` listener to force a cold Back, and PB18 reds beside it; CI's runner passes both at `dc297ca2`. Settle-doctrine's environment section is the home for a difference between the Mac and the runner; whoever takes it reproduces it first. For the dispatcher to file.
- **The Explorer's `explorer-dog-ear` step pins a one-sheet table in its outcome** (`then: [text("#chart-drawer-tab", tabLine(LAID_ITEMS))]` at `SURVEYED`, an address carrying no table), so a reader whose stored table already holds a sheet sees another tab count and the step never seals: the same flaw as this room's lay step. Read from `src/site/shared/primer/explorer-sheet.ts` and `tableOnArrival` in `src/site/shared/table-store.ts`, not measured. Q1's ruling sets the rule its fix would follow. For the dispatcher to file.

## Rulings

Alex, 2026-11-22 (https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-7088448244), quoted as the dispatcher relayed them, each the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr5/` (its page `out/1253-pr5/index.html`, each question's stills in its folder's `stills/`):

- **Q1, when "Press Lay this prospect on the table" reads done: "At the press (Recommended)".** "It is done the moment the reader presses the button, whatever the Chart Table holds, including the press that reads "No room on the table"." The plan as written: the lay step's `then` deleted with the names only it used, PK23, and the drift walk's `prospect-lay shows what it says once the step is done` dropped, its claim held by PB15 (The design). The ruled still is `out/1253-pr5/q1-when-lay-reads-done/stills/q1-a-at-the-press-done-1280.png`. The options not taken were the press's face alone (b, `out/1253-pr5/q1-when-lay-reads-done/stills/q1-b-held-face-not-done-1280.png`) and the lessons as they stand (c, `out/1253-pr5/q1-when-lay-reads-done/stills/q1-c-as-now-not-done-1280.png`).
- **Q2, the done note's Next button running past the note's edge on the lay step: "Build now, fix in #1385 (Recommended)".** "This room's reading joins Issue #1385, and one fix there mends both rooms." The plan as written: no change to the done row here; the dispatcher adds the reading to Issue #1385 (Lanes and residue); the plate read at step 11 does not stop on it (Stop conditions). The ruled stills are `out/1253-pr5/q2-done-note-past-its-edge/stills/q2-a-as-built-done-1280.png`, `out/1253-pr5/q2-done-note-past-its-edge/stills/q2-a-as-built-done-1024.png` and `out/1253-pr5/q2-done-note-past-its-edge/stills/q2-a-as-built-done-1280-note@2x.png`. The options not taken were "Next step ›" wherever the next step is a road press, for every room (b, `out/1253-pr5/q2-done-note-past-its-edge/stills/q2-b-next-step-done-1280.png` and `out/1253-pr5/q2-done-note-past-its-edge/stills/q2-b-next-step-done-1024.png`), and holding the room until Issue #1385 is fixed (c).
- **Q3, the look: "Build as shown (Recommended)".** "Provisional until the review after use; this room's look readings join Issue #1258." The hand's dress is pull request 1's, unchanged; the dispatcher posts this room's readings on Issue #1258 (C73). The ruled stills are every `out/1253-pr5/q3-the-look/stills/q3-a-*.png`. The option not taken was scrolling the engraver's note to the Lay press on arrival at 1024 (b, `out/1253-pr5/q3-the-look/stills/q3-b-lay-scrolled-arrive-1024.png`).
- "The planner's calls C62 to C74 were not put to him one by one and stand as the plan's."
