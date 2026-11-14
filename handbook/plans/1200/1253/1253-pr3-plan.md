# Issue #1253, pull request 3: the pointing hand in the Reading Room

**Planned at:** origin/main `067740e63180feb60c76272f31318c15ef6e499a` (PR #1386, pull request 2, merged), the issue's comment count 13 (`gh api repos/ahl-gram/Vellum/issues/1253/comments --paginate --jq length`): the orchestrator's note of 2026-11-09 (6754035498), Alex's rulings M1 to M6 (6867668486), the archive of revision 0 (6867691563), Alex's ruling on revision 1 (6869168142), the two parts of the archive of revision 1 (6869172162, 6869172683), the step 12 record of pull request 1 (6869302236), Alex's ruling on PR #1381 (6869932050), Alex's rulings on the pull request 2 plan (6870840753), the archive of the pull request 2 plan (6870879969), the step 12 record of pull request 2 (6871050954) Alex's ruling on PR #1386 (6875859525) and Alex's rulings on this plan (6877686192). Four of the thirteen open `Plan archive, not a ruling:` and are not rulings. Main has not moved since the plan was first written (`git fetch origin main`, then `git rev-parse FETCH_HEAD`).

**Rulings that bind this plan before its own menu:** M1 to M6 (6867668486), C13 and C23 (6869168142), PH3 dropped (6869932050), D0 to D4 and C36 (6870840753), and the reverse check on `HAND_ROOMS` (6875859525): "the next room's plan (pull request 3) adds that assertion before the room joins the list".

**Rulings:** Alex, 2026-11-14, https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-6877686192, every item the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr3/`: E1 "Wait for the reader", E2 "Build as shown", and on call C42 "Keep it" (the Rulings section at the foot quotes each and names what it binds). No ruling changed the design this plan was written to.

**Open decisions:** none.

**Recon.** `vellum-spec-recon` read the issue's body and its 12 comments, Issue #1258 comments 6869564140 and 6870849702, and the bodies of Issues #1385, #1382, #1384 and #1254, at `067740e6`: 42 claims, 35 CURRENT, 3 STALE, 4 UNVERIFIABLE (its claims file is `out/1253-pr3-recon/claims.jsonl` in the planner's tree). The three STALE are cosmetic and superseded by rulings already folded in pull requests 1 and 2: "nothing in `src/site/` reads `location.search`" (only the hand does, as the explorer-doctrine line already says), the body's byte counts (the data is `/primer/steps.json`, C36's weight is the code's), and "the ladder data is imported on demand" (M2 and C36). The four UNVERIFIABLE are the body's "plate reader over all four chart dresses" (settled here by measurement, call C37), the ring's breath under reduced motion (read from source: `src/styles/shared/motion.css` collapses every animation, PR 1's own claim), the body's byte figures, and the residue issues' readings, which are their planners'. Each finding's disposition:
- **Five of the room's six steps are sealed on arrival** as the ladder stands (recon's decision 1, and part A below): ruled E1, "Wait for the reader".
- **The read step cannot seal the way M3 rules**: its watches are `change` on two buttons and the seed box, so the dice never seals it (part U). Taken as call C42 under M3, which Alex kept ("Keep it").
- **Where the hand boots**: call C38 (the `arm:` callback, the room's settle).
- **Whether the room gets browser checks**: call C45, on ruling D1's ground.
- **The four dresses**: call C37, measured.
- Recon's "the Reading Room's slip already lies under the legend row (3,481 px² at 1024)" is rejected: that figure, in Issue #1254's body, is the Reading Room's station slip on home, not this page.
- Issues #1382, #1384 and #1385 do not meet this room (Lanes and residue, below).

## What this pull request delivers

When a reader arrives in the Reading Room from a Try it on the Primer (`/reading-room/?step=<id>#seed=42`), the room does what the Explorer and the Writing Room do: once its first world is drawn and its instrument armed, it rings the controls the step names, lays the manicule beside the ring, seats the slim note under the head cluster's trail, seals the step when the room sees it used, and drops the key with the hash kept. The six steps of the Reading Room's ladder are the only ones whose Try it opens this room, and no step's press onward leads into or out of it (`out/1253-dry-run/1253-pr3-steps.log`, `node out/1253-dry-run/1253-pr3-steps.ts`).

It teaches four of the room's steps what using them is, as the Explorer's ladder already says of its own presses (ruling E1, and C42 as Alex kept it): Play at its press, the pace at a press of 2× or 4×, the ages at a change of the bar, and the read step at the dice, at Enter in the seed box, or at Read.

It adds the reverse check Alex ruled on PR #1386 to PK16 before the room joins `HAND_ROOMS`, then lists the room there.

The other six rooms follow in later pull requests (M1); this one leaves Issue #1253 open (call C47).

## Specs

The implementer reads these, beyond `CLAUDE.md`'s table for the work it does:
- `handbook/plans/1200/1253/1253-r1-plan.md`, The design, for how the hand works; this plan changes none of the kit's code.
- `handbook/plans/1200/1253/1253-pr2-plan.md`, The design, for the wiring this room repeats and for `HAND_ROOMS`, BP-H1 and PK16.
- `handbook/specs/ui-design.md`, The Primer's pointing hand (line 263): the provisional dress this room wears unchanged.
- `handbook/specs/explorer-doctrine.md`, "The address is a photograph" (the `step` key line, 311).
- `handbook/specs/site-architecture.md`, How a page is authored (sheet order, `extraCss`).
- `handbook/specs/cascade-traps.md`, the bullet "`contain: layout` re-anchors every fixed descendant too, and for good": the room's body reads `contain: layout` (part Z), so the hand's page coordinates hold here as in the other two rooms.
- `handbook/specs/check-placement.md`: The unit suite, and "A browser check is written".
- `handbook/specs/settle-doctrine.md`, When a check leaves the run, the bullet "A check's coverage is needless on one of two grounds": the ground call C45 rests on.
- `handbook/specs/conventions.md`: How a design decision is made (building to ruled stills), and comments.

## The design

**The Reading Room takes the hand with two lines and two sheets.**
- `src/pages/reading-room/index.astro` links the Primer's marks and the hand's sheet after the room's own living-chart and reading-frame sheets and before the shared stage sheets, in the Explorer's order: `extraCss={["/shared/living-chart.css", "/shared/reading-frame.css", "/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}` (call C39). Every selector in the two sheets is scoped to `.primer-slip`, `.primer-ring`, `.primer-hand` or `.primer` (their rule heads, read from the files), so neither reaches the room's own furniture.
- `src/site/reading-room/app.ts` boots the hand once the first world's instrument is armed: `void bootHandOnce({ route: "/reading-room/" });` inside the `arm:` callback of `scheduleArm`, on the line after `frame.host.statusEl.textContent = "";` (call C38). That line is the room's settle: it clears the status line the Primer's drift walk and the room's suites gate on (`rest` for `"/reading-room/"` in `e2e/support/primer-rooms.ts`), after `armRoom` has armed the instrument and laid the room out. `bootHandOnce`'s module flag makes every later arm (a Read, the dice) do nothing; a draw that fails never reaches the arm, so it boots no hand (C6).
- That is the whole of the wiring the readings below were taken on: `out/1253-dry-run/1253-pr3-spike.diff` (two files, three lines added and one changed). The readings of arm "use" were taken with the spike's throwaway switch in `out/1253-dry-run/1253-pr3-spike-arms.diff`: an address carrying `arm=use` fetches a second steps file the spike's `scripts/primer-steps.ts` writes from the ladder with E1's acts added, and (`out/1253-dry-run/1253-pr3-spike-arms2.diff`) `arm=head` a third, for the rejected Journal arm. The plan builds neither switch.

**What the hand does in each of the room's six steps**, read on the built spike at 1280 by 800 and 1024 by 768, motion reduced and on, on a bare desk (part A of `out/1253-dry-run/1253-pr3-probe-A.log`, `node out/1253-dry-run/1253-pr3-probe.ts A`, built at `067740e6` with the spike; the summary lines in `out/1253-dry-run/1253-pr3-probe-A-summary.txt`):

| step | as the ladder stands | as ruled (E1 and C42) | ring holds |
|---|---|---|---|
| `reading-room-play` "Press {Play}." | sealed on arrival, `1 done`, `Next, 2× ›`, key gone | waits; sealed at a press of Play | Play, 95.19 by 50.39 |
| `reading-room-pace` "Press {2×} or {4×} to hurry it." (motion only) | motion on: sealed on arrival; reduced: never, its mark `with motion on`, no ring (the presses are hidden), key kept | motion on: waits, sealed at 2× or 4×; reduced: as now | motion on: 2× and 4×, 77.59 by 37.59 |
| `reading-room-ages` "Drag {The ages} to any year." | sealed on arrival | waits; sealed at a change of the bar (a press or drag on it, or an arrow key) | the bar, 1036 by 36 at 1280 reduced (917.69 with motion on, the pace beside it), 780 and 661.69 at 1024 |
| `reading-room-journal` "Read {The Journal} at the right." | sealed on arrival (a read, N2) | the same | the Journal's title, 310.8 by 39.8 |
| `reading-room-road` "On a road leg's row in the Journal, press {Take this road} once the voyage has reached it." | sealed on arrival (a road out, N2) | the same | the first road row's press, 87.5 by 29 |
| `reading-room-read` "Type a seed and press {Read}, or press {⚄}." | waits; sealed only when a typed seed leaves its box (Enter, a press of Read, or a press anywhere else); the dice and an untouched Read never seal it | waits; sealed at the dice, at Enter in the box, or at Read; a typed seed left unread does not seal it | Read and the dice, 125 by 45.19 |

- On arrival at seed 42 the instrument rests at the last year, so the voyage has reached every road leg: the Journal holds 16 road rows, every one pressable (part R of `out/1253-dry-run/1253-pr3-probe-UR.log`), and the ring stands on the first on arrival. After Play the Journal scrolls and the ring follows its press (part R).
- Every named control stands on arrival and the ring holds it, but the pace under reduced motion. No console error and no 4xx across every load of parts A, U, R, Z and D.
- Booting at the arm costs the reader no wait he can see: part A's time from the load to the note is 979 to 1005 ms under reduced motion against the control's 938 to 947 ms to the room's rest, and 2197 to 2216 ms with motion on against the control's 2200 to 2211.
- What each use seals, as the ladder stands and with E1's acts (part U of `out/1253-dry-run/1253-pr3-probe-UR.log`, `node out/1253-dry-run/1253-pr3-probe.ts UR`):
  - as it stands: Play, the ages and the pace already sealed before the press; the read step not sealed by the dice (the box's value is set by script, so no event) nor by Read with the box untouched (a button sends no `change`), and sealed by a typed seed followed by Enter, by Read, or by a press on the room's tagline, the last reading nothing;
  - with the acts: Play, the bar pressed at 0.3 of its width, ArrowLeft on the bar, and 2× (motion on) each seal at once; the read step seals at the dice, at Read untouched, at a typed seed and Enter, and at a typed seed and Read, and stays open after a typed seed and a press on the tagline.
  - The key goes and the room's own hash stays at every seal (`#seed=42&style=antique&legend=1&arms=0&beasts=0&year=1059`, or the read world's).
  - With the acts, another step's control seals nothing: Play pressed on the ages step, the bar pressed on the Play step and Play pressed on the read step each leave the step open with its key (part X of `out/1253-dry-run/1253-pr3-probe-X.log`, `node out/1253-dry-run/1253-pr3-probe.ts X`).
  - No road out of the room carries the key: of the 39 links outside the note, none has a `step` key, with the key in the address and after the seal (part X).

**The note** seats as the seats round ruled for every room (Issue #1155 comment 6754142680, item 5), appended last to `header.chrome`; the room's refit (`refitOnChrome` in `src/site/shared/room.ts`, reached through `bindZoomRoom` in `bindReadingRoom`) fits the chart under it.
- Its width is 620 at 1280 and 590.39 at 1024 (`min(620, slip's left - head's left - 24)`, the Journal's slip at 896 and 640), and it stands 250.41 px clear of the Journal at 1280 and 24.02 at 1024, and 7.07 px under the folio's corner (the step 6 plate read, `out/1253-pr3/measurements.json`, its numbers in `out/1253-pr3/notes.md`).
- Its sentence takes one line on five steps (the note 52.05 to 54.98 px tall) and two on the road step (71.48).
- The done row keeps one line in every state: its children's centres agree to 0.01 px and its right edge stands 12.18 to 12.19 px inside the note's (`Next, Take this road ›` the longest).
- What it costs the chart (the plate read's `out/1253-pr3/table-note-and-sheet.md`, the share of today's sheet area kept, 1280 and 1024): 84.01% and 82.85% with a waiting note, 82.82% and 81.57% with a done one, 76.28% and 74.6% on the road step's two-line note; with motion on, against today's room with motion on, 76.49% and 75.09% waiting, 75.41% and 73.93% done.
- Nothing scrolls sideways at either width in any of the sitting's 35 frames (`scrollWidth` equals `clientWidth`).

**The ring and the manicule** are PR 1's, unchanged (ruling D3).
- The ring stands at z-index 46 and the manicule at 47, above every piece they ring: the instrument strip (12), the Journal's slip (20), the folio's corner with the colophon (10) and the head cluster (10) (part Z of `out/1253-dry-run/1253-pr3-probe-Z.log`).
- The ring encloses every named control in every state, 5.9 to 6.1 px clear of it (the plate read).
- **The ring's line runs through words beside it, the 6 px pad Issue #1258 holds for the review.** Measured on ink at 1280 (1024 differs by 0 to 4 px of ink):
  - on the Journal step its top line runs through the slip's verb "Watch one" (170 px of its ink under the painted line, 268 under the halo), and the where-line under the title clears the line by 0.61 px, its ink under the halo (`out/1253-pr3/05-journal-arrive-1280-ring@2x.png`);
  - on the read step the colophon's gloss "read another: type its seed, or throw the dice" has 19 px of ink under the line and the tagline 172 under the halo;
  - on the ages step "day 1" and "day 81" have 5 and 7 px of ink under the line, the told line above stands 1.3 px clear of it, and the halo takes ink from every tick label.
  - Ringing the Journal's whole head instead keeps the line off its words but runs its foot through the Journal's first line, "Being a true & faithful chart of these waters" (Alternatives rejected).
- **The manicule crowds in this room too, as ruling D3 leaves it** (the plate read's ink of the glyph, animations paused):
  - on the ages step it lies on the Play press (303 px of its ink, 114 on the word "Play") while the ring is on the bar, at both widths (`out/1253-pr3/04b-ages-arrive-use-1280.png`);
  - on the Play step the ring's left edge is 19.59 px from the page's, so the manicule is held at 4 px over its own ring (176 px of ink) and the press's edge (81);
  - beside the pace ring it lies on the lit 1× press (348 px); beside the read ring, in the seed box; beside the road ring, on the Journal's panel between two rows, over no word and no control; beside the Journal's ring, over the desk and the slip's edge.
  - The Explorer and the Writing Room ship the same (Issue #1258 comment 6870849702). The dispatcher adds this room's readings there (C48).
- Contrast from pixels (the plate read, the pull request 2 sitting's method): the ring's gold line reads 9.97 to 10.22:1 over the strip and 8.92 to 9.74:1 over the desk by the colophon, and its walnut line 9.46:1 (median) over the Journal's parchment, where the gold reads 1.09:1; over the dark grounds the walnut reads 1.1 to 1.2:1. One of the two lines carries the ring on every ground, as in the other two rooms. The note's sentence reads 9.46:1 on its panel, its mark "with motion on" 5.64:1. The manicule's fill reads 10.02 to 12.11:1 over the dark grounds and its outline 10.55 to 11.14:1 over the parchment and the lit 1× press.
- The ring, the manicule and the note stand over no part of the chart at either width (part A's boxes against `#sheet`'s), so the chart's dress is under none of them; the ink dress (`out/1253-pr3/08-ages-arrive-use-ink-1280.png`) changes none of the plate read's numbers against `04b`.

**The steps taught their use** (ruling E1, and C42 for the read step). The ladder's form for "a step with an act and no outcome" is the Explorer's: `explorer-arms`, `explorer-legend`, `explorer-nearer` and five more carry `do` and no `then`, and `sealWhen` seals each on use, watching what `useWatches` derives from its acts (`out/1253-dry-run/1253-pr3-forms.log`, `node out/1253-dry-run/1253-pr3-forms.ts`). The Reading Room's ladder carries no `do` at all, so `sealWhen` gives `arrival` for Play, the pace and the ages, and the read step (`kind: "play"`) falls to `useWatches`' fallback, a `change` watch on every control it names. So the room's ladder takes the acts:
- `reading-room-play`: `do: [click(".rf-play")]`, a `click` watch.
- `reading-room-pace`: `do: HURRIED.map((k) => click(`.rf-pace [data-pace="${k}"]`))`, a `click` watch on 2× and on 4×.
- `reading-room-ages`: `do: [set(".rf-range", "912")]`, a `change` watch on the bar. 912 is the middle of the ages on seed 42, the year 755: the bar runs 0 to 1216 and its ages half 608 to 1216 for the years 451 to 1059 (part Z) (call C43).
- `reading-room-read`: `do: [click(".rr-dice"), { kind: "set", css: ".rr-colophon input", value: "1155", release: false }, { kind: "key", css: ".rr-colophon input", key: "Enter" }, click(".rr-read")]`, giving a `click` watch on the dice, a `keydown` Enter watch on the box and a `click` watch on Read (`useWatches` drops a `set` the next act keys on the same control, as for `explorer-enter`). As a driver the acts throw the dice, then type 1155 and read it by Enter and by Read, ending on seed 1155 (call C42).
- The Primer's drift walk is unchanged by them: `walkStep` in `e2e/support/primer-walk.ts` performs a step's `do` only when it has a `then`, and none of these has one. No other reader of `do` meets them (`git grep -n "\.do\b" -- test e2e test-support scripts src`: the walk, the Explorer's hand suite reading Explorer steps, `heldBy`'s step identity, and the kit).
- The steps file grows from 52,830 bytes (7,283 gzipped) to 53,208 (7,355) (`out/1253-dry-run/1253-pr3-weigh-steps.log`, `node out/1253-dry-run/1253-pr3-weigh-steps.ts`).

**What holds the room's wiring, and why no browser check is added** (call C45, on ruling D1's ground).
- Every rule the room calls is the shared hand's, held in the unit suite (PK1 to PK19) and walked in the browser by the Explorer's PH1, PH2 and PH4 to PH8. What is the Reading Room's own is its wiring (the page links the two sheets, its script boots the hand) and its ladder's acts. A browser check here would read only that wiring of a shared module, coverage `handbook/specs/settle-doctrine.md` names needless (Alex, 2026-11-08, Issue #1273), the ground Alex ruled D1 on for the Writing Room.
- So the wiring is held by BP-H1 (the page's sheets) and PK16 (the bundle reaches the hand, and, new here, the bundles that reach it are exactly `HAND_ROOMS`), and the ladder's acts by PK20 (what `sealWhen` and `useWatches` make of them) beside PK6.
- What no instrument then holds in this room: that the boot call runs (a call placed where no arm reaches it passes BP-H1 and PK16). The plate reader reads the room at step 11.

**The reverse check** (Alex, comment 6875859525). PK16 gains one assertion after its loop: the routes of the press's twins whose static or late reach names `/primer/steps.json` equal `HAND_ROOMS`, both sorted. It reads every twin the press builds (`p.twins`, from `BUNDLE_ENTRIES`), so no second list is kept, and `ON_DEMAND`, so a room that loaded the hand late would count too (call C41). Readings, each from `npm test -- --test-name-pattern="no page's bundle carries the Primer" test/site/app-bundles.test.ts` with the clause staged (`out/1253-dry-run/1253-pr3-pk16-staged.diff`):
- R3, main's source and list: pass (`out/1253-dry-run/1253-pr3-pk16-R3-main.log`); the one built file naming the data file is `explorer/chunks/primer-hand.js` (`grep -rl "/primer/steps.json" dist` on main's build).
- R4, main's source, `"/explorer/"` deleted from the list (the ruled mutation): fail, `actual: [ '/explorer/', '/writing-room/' ]`, `expected: [ '/writing-room/' ]` (`out/1253-dry-run/1253-pr3-pk16-R4-main-noexplorer.log`).
- R1, the room wired and the list as on main (the room boots the hand without joining it, the other ruled mutation): fail, `actual: [ '/explorer/', '/reading-room/', '/writing-room/' ]`, `expected: [ '/explorer/', '/writing-room/' ]` (`out/1253-dry-run/1253-pr3-pk16-R1-spike-mainlist.log`).
- R2, the room wired and on the list: pass (`out/1253-dry-run/1253-pr3-pk16-R2-spike-fulllist.log`).

**The press re-cuts once more, and the room's boot grows by the hand's code** (call C46, on ruling C36). With a third room importing the hand, the press splits `src/site/explorer/place-match.ts` back out of the chunk the Explorer and the Writing Room shared, into `explorer/chunks/place-match.js`, and the hand's modules keep `explorer/chunks/primer-hand.js` (17,100 bytes), now shared by three rooms. Read statically from each twin, main's build against the two-line spike's (`out/1253-dry-run/1253-pr3-chunks-main.log` and `-spike.log`, `node out/1253-dry-run/1253-pr3-chunks.ts <label>` after `npm run build`, gzip by node's zlib at its default level):
- The Reading Room: 19 files to 20, 830,018 to 847,235 bytes (226,565 to 232,535 gzipped), so 17,217 bytes (5,970 gzipped, 2.6%) on every visit, with a key or not.
- The Explorer: 21 files to 22, +53 bytes (+245 gzipped). The Writing Room: 15 to 16, +63 (+242).
- Every other room: unchanged, file for file.

### Alternatives rejected

- **Booting the hand in `draw()`'s `.then`, after `landChart`**: the instrument is armed only later, in `scheduleArm`'s `arm:` after the paint and the travel order, and the status line the room's rest reads clears there; a boot before it would arm the hand on a room not yet at rest.
- **Teaching the read step through `useWatches`' fallback** (a `click` watch for every named control of a step with no acts) in place of the ladder's acts: it changes the kit every room shares to mend one step's data, and it would not reach Enter in the box. The Explorer writes its dice and Enter steps as acts.
- **Outcomes (`then`) for Play, the pace and the ages**, so the room sees them done rather than used: the drift walk performs a step's acts and reads its `then`, so each would make a browser check longer, and Play's outcome differs by motion (with motion reduced it goes straight to the last year).
- **Pointing the Journal step at the slip's whole head** (`#journal .slip-head`, "The Journal" read as contained), so the ring stays off "Watch one": staged as a third arm and shot (`out/1253-pr3/09-journal-whole-head-alt-1280.png` and its `-ring@2x` crop). No line of the head lies on the ring's painted edge then, but the Journal's first line, `.rf-log-sig`, does, and the ring's top lies on the slip's own border (part J of `out/1253-dry-run/1253-pr3-probe-J.log`, `node out/1253-dry-run/1253-pr3-probe.ts J`, line boxes against the ring's box grown 5 px). The pad is the review's (Issue #1258), so the step keeps its title.
- **Four dresses in the stills** (call C37).
- **The hand's browser checks in this room, as the issue body lists them per room** (call C45).

## Files

Edited:

- `src/pages/reading-room/index.astro`, line 19: `extraCss={["/shared/living-chart.css", "/shared/reading-frame.css", "/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`.
- `src/site/reading-room/app.ts`:
  - `import { bootHandOnce } from "../shared/primer-hand.ts";` on the line after `import { foundAddress, heldFor, pageFounder, writtenParams, type WrittenWorld } from "../shared/written-world.ts";` (line 26 on main).
  - `void bootHandOnce({ route: "/reading-room/" });` on the line after `frame.host.statusEl.textContent = "";` inside `scheduleArm`'s `arm:` (line 291 on main), the callback's last statement.
  - 405 lines on main, 407 after; the lint's `max-lines` (400, blank lines and comments skipped) reads it clean (`npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 src/site/reading-room/app.ts`, exit 0, on the spike). Not split (call C40).
- `src/site/shared/primer/reading-room.ts` (ruling E1 and C42):
  - its import becomes `import { aria, click, countWord, set, text, type Ladder } from "./shape.ts";`;
  - `reading-room-play` gains `do: [click(".rf-play")],` after its `words`;
  - `reading-room-pace` gains `do: HURRIED.map((k) => click(`.rf-pace [data-pace="${k}"]`)),` after its `words`, before `only`;
  - `reading-room-ages` gains `do: [set(".rf-range", "912")],` after its `words`;
  - `reading-room-read` gains `do: [click(".rr-dice"), { kind: "set", css: ".rr-colophon input", value: "1155", release: false }, { kind: "key", css: ".rr-colophon input", key: "Enter" }, click(".rr-read")],` after its `relies`, before `kind`;
  - 67 lines on main, 76 after, as `npm run format` lays it out (the planner staged it: `out/1253-dry-run/1253-pr3-ladder.diff`, the lint with its flag exit 0, `npx tsc --noEmit -p .` exit 0).
- `test-support/hand-steps.ts`: `HAND_ROOMS` becomes `["/explorer/", "/writing-room/", "/reading-room/"]` (call C44).
- `test/site/app-bundles.test.ts`, PK16 (the test titled "no page's bundle carries the Primer's ladders: a room reads its step from the data file the build writes (Issue #1253)", its title unchanged): after its `for (const route of HAND_ROOMS)` clause, the reverse clause, as staged for the readings:
  ```ts
  const routeOfTwin = (twin: string): string => {
    const dir = dirname(rel(twin)).split(sep).join("/");
    return dir === "." ? "/" : `/${dir}/`;
  };
  assert.deepEqual(
    p.twins
      .filter((twin) => [...reach(p, [twin], ON_DEMAND)].some((f) => p.text(f).includes("/primer/steps.json")))
      .map(routeOfTwin)
      .sort(),
    [...HAND_ROOMS].sort(),
    "the rooms whose bundle reaches the data file are not HAND_ROOMS: a room that boots the hand and is not on the list goes unread by BP-H1, and a room the list names that boots no hand is read for nothing",
  );
  ```
  `dirname` and `sep` are imported already. 377 lines on main, 389 after.
- `test/site/built-pages.test.ts`, BP-H1: `assert.ok(HAND_ROOMS.includes("/reading-room/"), "the rooms list names the Reading Room");` on the line after its Writing Room witness. 254 lines on main, 255 after.
- `test/site/primer-hand-steps.test.ts`:
  - PK6, its line `assert.equal(sealWhen(pace, { touch: false, motion: true }), "arrival", "a motion step with motion on");` becomes `assert.equal(sealWhen(pace, { touch: false, motion: true }), "use", "a motion step with motion on is judged by its acts");`, which `npm run format` lays over five lines (ruling E1); the pace stays `never` with motion off.
  - PK20, new, after PK7 (Tests). 146 lines on main, 168 after.
- The whole of the change as the planner staged it, the wiring, the ladder and the four test files: `out/1253-dry-run/1253-pr3-planned-change.diff` (Prettier clean, the lint with its flag exit 0 on every file it names).

Created: none. Deleted: none. No file passes 400 lines but `src/site/reading-room/app.ts` (C40).

## Tests, in the order they are written

All unit tests. The plan adds no browser check (call C45), so no ledger line and no step seconds are owed.

1. `test/site/app-bundles.test.ts`, **PK16's reverse clause** (Files). A guard on today's state: it passes on main and is proven by the two mutations Alex's ruling names, not by a red at commit 1, since on main the rooms the bundles reach are the list's (reading R3). Mutations: `"/explorer/"` deleted from `HAND_ROOMS` (reading R4, fails); the Reading Room's boot call and import in place with `"/reading-room/"` left off the list (reading R1, fails); a room that boots no hand added to the list (`"/prospect/"`, fails on the same assertion, the expected list longer).
2. `test/site/primer-hand-steps.test.ts`, **PK20** "PK20 the Reading Room's steps are used as M3 rules: Play at its press, the pace at 2× or 4×, the ages at a change of its bar, and the read step at the dice, Enter in the seed box or Read; the Journal and the road are sealed on arrival (Issue #1253 pull request 3)". With the file's own `DESK` (`{ touch: false, motion: true }`), in this order:
   - for each of `reading-room-play`, `reading-room-pace`, `reading-room-ages` and `reading-room-read`, `assert.equal(sealWhen(stepOf(id), DESK), "use", id)`;
   - for `reading-room-journal` and `reading-room-road`, `assert.equal(sealWhen(stepOf(id), DESK), "arrival", id)`;
   - `assert.deepEqual(useWatches(stepOf("reading-room-play")), [{ event: "click", css: ".rf-play" }])`;
   - `assert.deepEqual(useWatches(stepOf("reading-room-pace")), [{ event: "click", css: '.rf-pace [data-pace="2"]' }, { event: "click", css: '.rf-pace [data-pace="4"]' }])`;
   - `assert.deepEqual(useWatches(stepOf("reading-room-ages")), [{ event: "change", css: ".rf-range" }])`;
   - `assert.deepEqual(useWatches(stepOf("reading-room-read")), [{ event: "click", css: ".rr-dice" }, { event: "keydown", css: ".rr-colophon input", key: "Enter" }, { event: "click", css: ".rr-read" }])`.
   - Red at commit 1 on its first assertion, `reading-room-play` being `arrival`; the watches of the play, pace and read steps fail too, and the ages' `change` watch passes on main as on the plan, the fallback giving the same watch (`out/1253-dry-run/1253-pr3-pk20.log`, `node out/1253-dry-run/1253-pr3-pk20.ts`). No stub: the functions exist with their signatures, and the red is the ladder's data.
   - Mutations, each read in the same log: play's acts deleted (fails the `use` loop and the play watch); the read step's Enter dropped, or its dice press dropped (each fails the read watch); the ages bar pressed (`click`) in place of set (fails the ages watch); the pace's 4× press dropped (fails the pace watch).
3. `test/site/primer-hand-steps.test.ts`, **PK6's pace line** (Files). Red at commit 1 (`arrival`). Mutation: the pace's acts deleted (fails, `arrival`).
4. `test/site/built-pages.test.ts`, **BP-H1's witness** (Files). Red at commit 3 on its loop's assertion, the Reading Room's built page linking neither sheet (main's `extraCss`, line 19); green at commit 4 (`out/1253-dry-run/1253-pr3-links-spike.log`, `node out/1253-dry-run/1253-pr3-links.ts spike`: the room's links carry `/shared/primer-marks.css, /shared/primer-hand.css` after `/shared/reading-frame.css`, BP-H1's read true). Mutations: `/shared/primer-hand.css` dropped from the room's `extraCss`; the two sheets swapped in it.
5. PK16's forward clause, unchanged, now reads the Reading Room: red at commit 3 on its assertion for `/reading-room/` (main's twin reaches no file naming the data file, `out/1253-dry-run/1253-pr3-chunks-main.log`: `reading-room/app.bundle.js` reads `hand: false`; the spike's `true`). Mutation: the room's import and boot call deleted.

The prover owes PK16's reverse clause, PK20, PK6's pace line, BP-H1's witness and PK16's forward clause over this room, against the mutations named. PK1 to PK19 (bar PK6's line) and PH1 to PH8 do not change.

## Order of commits

1. The archived plan, `handbook/plans/1200/1253/1253-pr3-plan.md` (this file, unchanged), with PK16's reverse clause (passing over main's two-room list: the check stands before the room joins it), PK20 and PK6's pace line (each red on its assertion). Then push.
2. The ladder's acts in `src/site/shared/primer/reading-room.ts` (PK20 and PK6 green).
3. `HAND_ROOMS` gains `"/reading-room/"` and BP-H1 its witness (BP-H1 red on the room's links, PK16 red on the room's bundle).
4. The room's two sheets and its boot call (BP-H1 and PK16 green).
5. `git merge origin/main` (workflow step 10), then the evidence.

## Rosters and doctrine

- **`HAND_ROOMS`** in `test-support/hand-steps.ts` gains `"/reading-room/"`, the third room in the order they took the hand (C44). PK16's reverse clause now ties it to the press's twins, so a later room that boots the hand without a Rosters line reds PK16.
- **The page's sheet list**: `test/site/astro-scaffold.test.ts`'s head tests pin `chart-stage.css` as the sheet just before a page's own and `shell.css` last; the room's array keeps both (the spike's built links, reading above). Its other head tests read no per-page order for this room (recon).
- **The sheets join no other list**: they stand on disk and in the stylesheet lint, and not in `HOUSE_SHEETS` (`scripts/lint/sheet-owners.ts`), since not every page links them.
- **No spec line changes.** The rulebook's second exception (line 100), the explorer-doctrine `step` key line (311) and the ui-design paragraph (263) are written for every room (recon: CURRENT). The ladder's new acts change no sentence the Primer page shows.
- **No new suite, bundle entry or e2e helper**; `e2e/support/suites.ts` is unchanged.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). The planner's `npm test` over the whole planned change staged (`out/1253-dry-run/1253-pr3-planned-change.diff`: the wiring, the ladder's acts and the four test files) read 4088 pass, 0 fail, exit 0 (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/5fbd4015-d487-49de-a4fd-007109c94984/scratchpad/1253-pr3-unit-planned.log`), so no bundle, chunk, head or Primer test reds over the re-cut, the sheet list or the acts.
- `npm run build`, then, one at a time: `VELLUM_E2E_SUITES=primer-reading-room npm run test:e2e` (the drift walk over the ladder with its new acts, which it does not perform, and over the boot call), `VELLUM_E2E_SUITES=reading-room npm run test:e2e` (the room's own suite over its new sheets and boot), `VELLUM_E2E_SUITES=room-voyage-route npm run test:e2e` (the room's voyage, which runs through the arm the boot call sits in), `VELLUM_E2E_SUITES=primer-explorer npm run test:e2e` (the hand's browser checks over the re-cut chunk) and `VELLUM_E2E_SUITES=writing-room npm run test:e2e` (the Writing Room over its re-cut boot). Never the full local lanes.
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance, ruled from stills): the six steps arriving at 1024 by 768 and 1280 by 800 (the pace with motion on, and reduced for its mark), Play, the pace, the ages and the read step done by a real press, on the antique ground, with contrast sampled from pixels.
- No still judge comparison: nothing here changes how the engine draws a world sheet.

## Calls made

Numbered on from pull request 2's C27 to C36.

- **C37** The stills and the plate read show the antique dress only. Rule: every road that carries a key into this room opens `#seed=42` with no style (all six steps' `at`, and no press onward enters the room), which draws antique; and the four dresses change none of the grounds the ring, the manicule and the note stand on: the desk, the strip, the Journal, the head cluster, the note and the Play press read the same colours under antique, topographic, ink and nautical, with only the chart's own drawing changing (part D of `out/1253-dry-run/1253-pr3-probe-D.log`), and none of the three stands over the chart (The design). `out/1253-pr3/08-ages-arrive-use-ink-1280.png` shows the ink dress for comparison.
- **C38** The hand boots in `scheduleArm`'s `arm:`, after the status line clears. Rule: the issue's "each room's script calls the hand once its first draw settles" and C28; this room settles at its arm, the rest its suites read.
- **C39** The two sheets stand after the room's living-chart and reading-frame sheets and before the shared stage sheets. Rule: the Explorer's order, and the head tests' `chart-stage.css` last before the page's own.
- **C40** `src/site/reading-room/app.ts` (405 lines on main) takes one import and one call and is not split. Rule: C7's, a file past 400 on main; the lint's `max-lines` reads it clean.
- **C41** The reverse clause reads every twin, through static and late imports, and lands in commit 1, before the room joins the list. Rule: Gate 1 item 16 (a roster a guard checks is data the guard reads, never a second list), and the ruling's "before the room joins the list".
- **C42, kept by Alex** ("Keep it", comment 6877686192) The read step takes acts (the dice, a typed seed with Enter, and Read). Rule: M3 ("dice at the press, any number at Enter"), and the Explorer's own form for its dice and Enter steps (`explorer-dice`, `explorer-enter`); as the ladder stands the dice never seals it and a typed seed read by nothing does (part U).
- **C43** The ages act's value is 912, the middle of seed 42's ages. Rule: a `set` carries a value the step's own address can take (the bar's range on seed 42, part Z); the drift walk does not perform it (no `then`).
- **C44** `"/reading-room/"` joins `HAND_ROOMS` at its end. Rule: C32, the rooms in the order they took the hand.
- **C45** No browser check of the hand in this room. Rule: ruling D1's ground, needless coverage of a shared module's wiring (`handbook/specs/settle-doctrine.md`, Issue #1273), the same here as in the Writing Room; PK20 holds the room's own ladder acts.
- **C46** The Reading Room imports the hand statically, as the other two rooms do, and its boot grows by 17,217 bytes (5,970 gzipped) on every visit. Rule: Alex's "Load it always, as built" on C36 (comment 6870840753), the weight here measured above.
- **C47** The pull request leaves Issue #1253 open, its body carrying the closing-reference line in `.github/PULL_REQUEST_TEMPLATE.md`'s form for an issue a pull request deliberately leaves open, and `gh pr view <N> --json closingIssuesReferences` reads `[]`. Rule: M1, six rooms remain (the Prospect, the Ribbon, the Portfolio, the Print Room, Seed of the Day and the Gallery).
- **C48** The manicule's crowding, the ring's line through "Watch one" on the Journal step and through the colophon's gloss on the read step, and the halo's grazes in this room go to Issue #1258 for the post-use review, posted by the dispatcher as https://github.com/ahl-gram/Vellum/issues/1258#issuecomment-6877686546 under ruling E2; Issues #1382, #1384 and #1385 are not touched. Rule: D3, in every room, for the manicule; the ring's 6 px pad, a ruled number Issue #1258 comment 6869564140 already holds for the review; and none of the three issues meets this room (Lanes and residue).

## Open decisions

None. The two items and the call put to Alex at the STOP are ruled (Rulings, below).

## Stop conditions

Hand back, rather than adapt, when:
- a symbol, line or file named here is not where the plan says: `scheduleArm`'s `arm:` and its `frame.host.statusEl.textContent = "";` in `src/site/reading-room/app.ts`, the `extraCss` line of `src/pages/reading-room/index.astro`, the six steps and `HURRIED` in `src/site/shared/primer/reading-room.ts`, `sealWhen` and `useWatches` in `src/site/shared/primer/hand-steps.ts`, PK6's pace lines, PK16's loop, `press`, `reach`, `ON_DEMAND` and `rel` in `test/site/app-bundles.test.ts`, BP-H1 in `test/site/built-pages.test.ts`;
- a red at commit 1 is on anything but the assertion named, or PK16's reverse clause fails at commit 1;
- `npm test` reds a file this plan does not name, above all a bundle or chunk test over the press's re-cut, a head test over the sheet list, or a Primer test over the ladder's acts;
- the `primer-reading-room`, `reading-room`, `room-voyage-route`, `primer-explorer` or `writing-room` suite reds;
- the plate read at step 11 finds a horizontal scroll at 1024 or 1280, the note's row on two lines or past the note, the note over the Journal or the folio's corner, the ring off a control it names, the note's sentence or the ring's carrying line under 4.5:1 against its ground (the step 6 sitting read the gold over the strip and the desk at 8.92 to 10.22:1, the walnut over the parchment at 9.46:1, the sentence at 9.46:1), the ring's painted line (its box grown 5 px) over the ink of any text but the four the step 6 sitting found there ("Watch one", the colophon's gloss, "day 1" and "day 81"), or a step taught its use sealed before it is used;
- `git merge origin/main` conflicts in a file this plan names.

## Lanes and residue

- **Sub 8, Issue #1254** (the "learn this room" press on every room's trail line), not started, meets this pull request in three places; whichever lands second merges them:
  - `src/pages/reading-room/index.astro`'s `extraCss` line, if Sub 8 links a sheet per page;
  - `header.chrome`: Sub 8's press stands on the trail line, and the hand's note, appended by script after the room arms, stays the cluster's last child;
  - the chart's height: the two together make the head cluster taller again. This room keeps 73.93 to 84.01% of today's sheet with the note alone (The design); it has not been measured with both, and Sub 8's plan owes that reading.
- **Issue #1385** (the Explorer note's done row past the note at 1024): this room's longest done row, `Next, Take this road ›`, ends 12.2 px inside its 590-wide note at 1024. Not touched.
- **Issue #1382** (`factsOf` against the drift check's `FACTS`): the hand reads a `then` through `factsOf`, and no step of this room has one. Not touched.
- **Issue #1384**: the Writing Room's. Not touched.
- **Issue #1258**: C48; this room's readings are its comment 6877686546.

## Found while planning, not this pull request's

- **The ages scale's last two labels run together at 1024**: on seed 42 the scale reads `10001059`, the century tick 1000 against the last year 1059, in today's room with no key (`out/1253-pr3/10-found-scale-labels-1024.png`, also `out/1253-pr3/01-control-1024.png`). `scaleTicks` in `src/site/shared/instrument-scale.ts` keeps a label off only within `LABEL_GAP_U` of the bar's end as a fraction of its width, and the bar is narrower at 1024; that this is the cause is the planner's reading, UNVERIFIABLE here, since no arm was staged. Searched: open issues for "scale tick labels", "instrument scale year overlap", and `handbook/errata/` for "tick": none. The dispatcher filed it as Issue #1387; this pull request does not touch it.

## Rulings

Alex, 2026-11-14 (https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-6877686192), quoted as he picked them, each the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr3/` (its page `out/1253-pr3/index.html`):

- **E1, when a Reading Room step reads done:** "Wait for the reader (Recommended)": "Press Play", "Press 2× or 4×" and "Drag the years bar" are done only when the reader presses Play, presses 2× or 4×, or moves the years bar; the Journal and road steps read done on arrival as ruled before. The plan as written: the `do` acts on `reading-room-play`, `reading-room-pace` and `reading-room-ages`, PK20's `use` loop and watches, and PK6's pace line. The options not taken were leaving the three sealed on arrival with the gap filed as its own issue, and teaching the road step its use too.
- **E2, the look:** "Build as shown (Recommended)", provisional until the review after use; the new graze and crowding items join Issue #1258. The hand's dress unchanged from pull request 1; the ring's line through "Watch one" and the colophon's gloss, the manicule on the Play press and the 1× press, and the halo's grazes posted as Issue #1258 comment 6877686546 (C48).
- **C42, the read step:** "Keep it (Recommended)": the dice, Enter in the seed box, and Read each mark it done. The `do` acts on `reading-room-read` and PK20's read watches.

The reverse check on `HAND_ROOMS` that the plan lands in its first commit is Alex's ruling of comment 6875859525. The years scale's labels at 1024 (Found while planning) are filed by the dispatcher as Issue #1387, outside this pull request.
