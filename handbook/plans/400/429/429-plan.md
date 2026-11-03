# Issue #429 plan: the Ribbon's courtesies (Sub 3 of Epic #426)

**Planned at**: `origin/main` `b3489b6410cb69054ba6bab0ac540a116db9c7f7` (PR #1202 and PR #1201 merged after the dispatch base `6683f826`; `git diff --stat 6683f826 b3489b64` over every file this plan names prints nothing), Issue #429 read with **4 comments** (5533759275, the 2026-09-03 re-baseline; 5533954486, Alex's 2026-09-03 rulings; 6591304757, his rulings on this plan's menu; 6591315617, his correction of Q5). Planner: `vellum-planner` (claude-opus-5-5), 2026-11-02, finished again after the rulings.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/429#issuecomment-6591304757, with Q5 superseded by https://github.com/ahl-gram/Vellum/issues/429#issuecomment-6591315617. Q1: build now, before the painted ribbon (Issue #511). Q2: a small gold pill reading "prospect". Q3: every town row, the two ends included. Q4: the notice first on the panel. Q5: one sentence for a refused destination and for a road asked to end where it starts.

**Open decisions**: none.

**Probes and stills**: every probe, log and still this plan quotes was made in the planner's tree and is copied by the dispatcher to the main checkout's `out/429-dry-run/` (probes, logs, captures) and `out/429/` (the stills, `notes.md`, `index.html`, the plate reader's `429-measure.log`). A bare file name below means `out/429-dry-run/<name>`. Builds read, all at `6683f826`: main as built (`build-main.log`), the menu's spike (`build-spike2.log`) and the spike at the ruled options (`build-ruled.log`). The ruled look is `out/429/429-ruled-*.png`; the build is held to those stills and to this plan's words (a STOP sitting owes no archive, `handbook/specs/conventions.md`).

## What ships

One pull request, two page changes on `/ribbon/`, both on the itinerary slip:

1. **The slip names a refused address.** When the address asks for a departure no road leaves, or a destination the road drawn cannot reach (another network, a roadless place, or the departure itself), the page today draws another road and says nothing. After this, a gloss line first on the slip says why, in two sentences at most: Alex's "No road leaves Tewetulua; this is the road from the capital." for the departure, and "The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua." for the destination (names as each case fills them). The stage's status pill keeps clearing to empty on success, so the wait in `opened()` in `e2e/suites/ribbon/kit.ts` for an empty pill still holds for every check, and no other room changes (Alex, 2026-09-03). (`opened()` only gains an optional second argument, below.)
2. **Each town row opens its town's prospect.** Every waypoint row of the itinerary, the departure and the arrival included, keeps its lean button (a press still leans the Glass on that stretch) and gains a small gold pill reading "prospect" beside it, a link to `/prospect/#<the page's world keys>&i=<town index>`. Branch, summit and crossing rows get none. The legend's "See {toName} in The Prospect" road is unchanged (Issue #494 ruling 3).

No chart, golden, seed, engine or worker byte moves. No regen is owed (rulebook, golden discipline): nothing under `src/render/`, `src/itinerary/`, `src/world/` or `src/site/explorer/` changes.

## Recon (step 2)

`vellum-spec-recon` ran on the issue body, both comments, Epic #426 and its comments, Issue #494, Issue #513, Epic #667 and PR #1193 at `6683f826`. Its ledger, counted row by row: **CURRENT 18, STALE 6 (one of them partly), UNVERIFIABLE 2**, plus one UNVERIFIABLE sub-claim inside a CURRENT row (Turn about's safety), which this plan has since measured.

STALE claims that changed this plan:

- `scripts/e2e/suite-ribbon.mjs` is gone. The Ribbon's browser checks are `e2e/suites/ribbon.ts` with `e2e/suites/ribbon/{kit,room,dress,gestures}.ts`; ids today are RB1 to RB18 with RB5b to RB5e and RB6b (23 ids). New checks here are **RB19** and **RB20**.
- `test/site/ribbon-room.test.ts` (RBR1 to RBR8) was deleted by `75b76668` (Issue #892). Its pins moved to the browser: the slip's body order and the row gloss are RB11 (`slipFaults` in `e2e/suites/ribbon/room.ts`), which this plan edits.
- `public/atelier.css` is `src/styles/shared/atelier.css` (moot: the notice is not in the pill).
- The body's "no roadless settlement in seeds 1 to 12": false. Measured over seeds 1 to 100 (`429-sweep.ts`, `429-sweep.log`): **30 of 100 seeds carry a settlement no road leaves (43 in all), 19 of 100 have two road networks that do not meet, and 0 pairs are reachable one way only** (so Turn about never asks a refused place). Seed 42's Tewetulua (24) is the fixture; seed 2's Bri (19), a village with a road that never meets the capital's, is the split-network witness.
- Epic #426's order of work puts Sub 9 (Issue #511) first; Alex set it aside for this sub (Q1).

UNVERIFIABLE: the PR #425 skeptic citation (no record exists) and `parseProspectAddress`'s handling of `a`/`b` (moot: the Ribbon strips them at source). The sub-claim on Turn about is measured: 0 one-way pairs over 100 seeds.

Rejected recon item: recon listed "one pull request or two" as open. It is a call here (C12): the body says one, the rulings do not split it, and each part is one unit file and one browser step.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/ui-design.md`: "The room and its furniture" (the slip), "The voice" (a road out is a verb and a place), "Colour, contrast and legibility" (4.5:1, measured; the focus ring is one face; controls' radius families), "Gesture" (a hover promises navigation).
- `handbook/specs/cascade-traps.md`: the house sheets dress every button; an author `display` makes `[hidden]` inert; a flex item's `min-width: auto`.
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read" (a plan prints each browser check's two readings).
- `handbook/specs/settle-doctrine.md`: clauses on waits (a readiness wait throws, inside a `step`), "What a step holds" and "Who finds a slow step".
- `handbook/specs/engine-invariants.md`: "A ribbon result substitutes the capital's departure without announcing it" (edited here, see Rosters and doctrine).
- `handbook/specs/site-architecture.md`: "What a working page's surface owes beyond its files" (one glue function both transports call; this plan changes neither transport).
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (for the engine-invariants edit), "The fidelity rule" (the pill's height deviates from the menu's still, C17), and "A sitting held at the workflow's STOP is not a round".
- `handbook/specs/rulebook.md`: "Scheduling rules" (Q1 sets Epic #426's order aside for this sub).

## The design

### Part 1: the notice

- **The page compares; the worker does not change.** `draw(from, to)` in `src/site/ribbon/app.ts` already holds what it asked for, and `RibbonPlateData` already carries `fromIdx`, `toIdx`, `fromName` and `options` (every settlement's `name` by index). A new pure function, `fallbackNote(ask, res)` in a new `src/site/ribbon/fallback-note.ts`, returns the notice or `null`. `RibbonPlateData`, `src/site/explorer/worker.ts` and `runInline` in `src/site/explorer/worker-client.ts` are untouched, so the two transports cannot drift.
- **The rules of `fallbackNote`**:
  - A side of the ask names a place only when it is an integer from 0 to `res.options.length - 1`; `null`, and an index that names no settlement, are no request (C2, C3).
  - Departure: when the asked departure names a place and `ask.from !== res.fromIdx`, the sentence is `No road leaves ${options[ask.from].name}; this is the road from the capital.` (Alex's sentence; `ribbonResultFor` falls back only to the capital, and throws when the capital itself has no road).
  - Destination: when the asked destination names a place and `ask.to !== res.toIdx`, the sentence is `The road cannot take you to ${options[ask.to].name}; this is the road to the farthest place from ${res.fromName}.`, one sentence for every case (Q5): a destination on another network, a roadless one, and one that is the departure drawn (C19).
  - Both sentences, when both apply, are joined by one space, the departure's first (C7). No sentence: `null`.
- **Where it shows**: a new `<p class="fallback-gloss" id="rb-fallback" hidden></p>` as the slip body's first child, above the intro paragraph (Q4). `writeItinerary` writes it on every successful draw: `textContent = note ?? ""`, `hidden = note === null` (C4). It wears the row gloss's face (italic flourish, 0.85rem, `--ink-brown`, margin 0.7rem above): the selector `.row-gloss` in `src/styles/ribbon/index.css` becomes `.row-gloss, .fallback-gloss`. No other rule sets `display` on it, so `hidden` hides it (measured: `"shown":false` with `hidden`, readings below). Measured contrast 5.66 on the panel (`out/429/429-measure.log`).
- **Rejected**: (a) carrying `requested` fields on `RibbonPlateData` (moves both transports for data the page already holds); (b) the status pill (Alex, 2026-09-03); (c) an `aria-live` region on the notice (C8).

### Part 2: the town row's pill

- **`rowProspectTarget(hash, row)`**, new in `src/site/ribbon/address.ts`: `prospectTarget(hash, row.index)` for a row whose `kind` is `"waypoint"` and whose `index` is defined, else `null`. It reuses `prospectTarget`, so the link keeps every world key and drops `a`, `b`, `i` and `year`, exactly as the legend road does (RB5d).
- **`rowNode`** in `src/site/ribbon/seats.ts` appends, after the `button.lean`, an `<a class="row-prospect" href="…" aria-label="See {town} in The Prospect">prospect</a>` for every row whose target is not `null` (Q2, Q3). `{town}` is `row.text`, which is the settlement's name for a waypoint (`eventCaption` in `src/itinerary/prose.ts`; measured equal on all 682 waypoint rows of seeds 1 to 100, `429-sweep.log`). The visible word "prospect" is inside the accessible name, as label-in-name asks.
- **Layout** (measured): `.itinerary li.waypoint { flex-wrap: nowrap; align-items: baseline; }` and `.itinerary li.waypoint .lean { flex: 1 1 0; min-width: 0; }`, so the lean takes the row and the pill sits at its right end. `flex-basis: 0` makes the existing `width: 100%` and the hover/leaned `width: calc(100% + 1.2rem)` moot for sizing; the hover and leaned wash still widens the lean by its `margin: 0 -0.6rem`, measured to shrink the gap to the pill from 12.8 px to 3.2 px and never overlap it (`429-states-ruled.log`).
- **The pill's dress** (Q2), the place card's "View the prospect" dress in miniature, at its built height:
  ```css
  .itinerary .row-prospect {
    flex: none;
    align-self: center;
    font-family: var(--font-body, "Iowan Old Style", "Palatino", Georgia, serif);
    font-size: 0.74rem;
    letter-spacing: 0.03em;
    color: var(--ink-dark);
    background: var(--control-gold);
    border: 1px solid var(--line-tan);
    border-radius: 4px;
    padding: 0.2rem 0.45rem;
    text-decoration: none;
  }
  .itinerary .row-prospect:is(:hover, :focus-visible) {
    background: var(--control-gold-lit);
  }
  ```
  Specificity: `.itinerary .row-prospect` is (0,2,0) and beats `.slip a` (0,1,1); `.itinerary li.waypoint` (0,2,1) beats `.contents li` (0,1,1). Measured on the ruled build: 58.19 x 24.95 px, the hit at its centre is the pill at rest, under a hovered lean, leaned and focused, at the harness window and at 1024x768 (`429-states-ruled.log`); no row of 542 over the default roads of seeds 1 to 40 changes height (`429-row-heights.log`), and no waypoint row wraps (`429-wrap-sweep-ruled.log`). Contrast on the menu's pill, the same ink on the same gold: 8.59 at rest, 9.39 hovered, focus ring 9.46 (`out/429/429-measure.log`).
- **Rejected**: (a) the lean button becoming the link (Alex, 2026-09-03: part 2 is a second control); (b) a `title` tip on the pill (C9); (c) absolute positioning inside the row (fights the lean's four-class hover rule's padding).

## Files

Every file created, edited or deleted. Line counts after the change are estimates from the spike; none passes 400 lines and no function passes 50.

- **NEW `src/site/ribbon/fallback-note.ts`** (about 25 lines; first line a one-line header comment in the folder's manner):
  ```ts
  export interface RibbonAsk { readonly from: number | null; readonly to: number | null; }
  export type DrawnJourney = Pick<RibbonPlateData, "fromIdx" | "toIdx" | "fromName" | "options">;
  export function fallbackNote(ask: RibbonAsk, res: DrawnJourney): string | null;
  ```
  `RibbonPlateData` is a type import from `src/site/explorer/ribbon-job.ts`. The wording and rules are the design's, above.
- **EDIT `src/site/ribbon/address.ts`**: add `export function rowProspectTarget(hash: string, row: Pick<RibbonRow, "kind" | "index">): string | null;` with `import type { RibbonRow } from "../explorer/ribbon-job.ts";`. Nothing else changes.
- **EDIT `src/site/ribbon/seats.ts`**:
  - `RoomFurniture` gains `readonly fallback: HTMLElement;`.
  - `writeItinerary` becomes `writeItinerary(roomEls: RoomFurniture, res: Facts, note: string | null, prospectOf: (row: RibbonRow) => string | null, onLean: (row: RibbonRow, li: HTMLLIElement) => void): void`. It writes the slip title and where line as today, then `roomEls.fallback.textContent = note ?? ""; roomEls.fallback.hidden = note === null;`, then the rows through `rowNode(r, prospectOf(r), onLean)`.
  - `rowNode(r: RibbonRow, prospect: string | null, onLean: …)`: as today, then `if (prospect !== null) li.append(prospectLink(r.text, prospect));`.
  - New module-local `function prospectLink(town: string, href: string): HTMLAnchorElement` setting `className = "row-prospect"`, `href`, `aria-label` `See ${town} in The Prospect`, `textContent = "prospect"`.
  - `seats.ts` does not read `location`; the page hands the hash in through `prospectOf`.
- **EDIT `src/site/ribbon/app.ts`**:
  - imports `fallbackNote` from `./fallback-note.ts` and `rowProspectTarget` from `./address.ts` (add to the existing `./address.ts` import).
  - `furniture` gains `fallback: $("rb-fallback"),`.
  - the `writeItinerary` call in `draw` becomes `writeItinerary(furniture, res, fallbackNote({ from, to }, res), (row) => rowProspectTarget(location.hash, row), (row, li) => { sheet.lean(row.nx, row.ny); markLeaned(furniture, li); });` in the same place it stands today (after `history.replaceState`, before `status.textContent = ""`). The `.catch` branch is unchanged (C4).
- **EDIT `src/pages/ribbon/index.astro`**: insert `<p class="fallback-gloss" id="rb-fallback" hidden></p>` as the slip body's first child, directly before `<p class="intro">`.
- **EDIT `src/styles/ribbon/index.css`**: `.row-gloss {` becomes `.row-gloss,\n.fallback-gloss {` (declarations unchanged); add the two `li.waypoint` rules and the two `.row-prospect` rules from the design, after the `.row-gloss` block and before `@media print`. No comment lines.
- **NEW `test/site/ribbon-fallback-note.test.ts`**: U1 to U6 below.
- **EDIT `test/site/ribbon-address.test.ts`**: U7 below; add `rowProspectTarget` to its import.
- **NEW `e2e/suites/ribbon/courtesies.ts`** (about 100 lines; one-line header comment): exports `rb19Refused(k: RibbonKit): Promise<void>` and `rb20RowProspects(k: RibbonKit): Promise<void>`. Imports `ORPHAN` from `./room.ts`, `RibbonKit` from `./kit.ts`, `prospectKit` and `type Prospect` from `../prospect/kit.ts`, `pressAt` from `../print-room/kit.ts`, `Payload` from `../../types.ts`.
- **EDIT `e2e/suites/ribbon.ts`**: import the two functions; after `await step("RB18", () => rb18CardRoad(k));` add `await step("RB19", () => rb19Refused(k));` and `await step("RB20", () => rb20RowProspects(k));`, before `rb9NoErrors`. Its first-line comment gains, before "and the same address presses byte-identical scrolls": ", an address the roads refuse is named on the slip, each town row opens its prospect".
- **EDIT `e2e/suites/ribbon/kit.ts`**: `opened` becomes `const opened = (label: string, until: (s: Ribbon) => boolean = () => true) => settle(STATE, (s) => s.blob && s.status === "" && until(s), \`ribbon page never drew: ${label}\`, 300);`. Every existing call passes one argument and behaves as today.
- **EDIT `e2e/suites/ribbon/room.ts`**: in `slipFaults`, the expected body becomes `["P#rb-fallback.fallback-gloss", "P.intro", "P.itinerary-head", "OL#rb-itinerary.contents.itinerary", "P.row-gloss"]`. Nothing else in RB11 changes.
- **EDIT `handbook/specs/engine-invariants.md`**: the paragraph under "A ribbon result substitutes the capital's departure without announcing it", replaced as Rosters and doctrine gives.
- **NEW `handbook/plans/400/429/429-plan.md`**: this plan, archived unchanged in the first commit.

Not touched, and named so the builder does not reach for them: `src/site/explorer/ribbon-job.ts`, `worker.ts`, `worker-client.ts`, `src/itinerary/**`, `e2e/support/skips.ts`, `test/e2e/lane-timings.test.ts` (no pull request re-times a suite, `handbook/specs/site-architecture.md`), the row gloss's text (C11).

**Shared with other lanes**: none. Issue #403 merged as PR #1201 and Issue #1174 as PR #1202 before this plan finished; neither touched a file named here.

## Tests, in the order they are written

Unit tests first (the prover owes all of them), then the browser checks. Every red is on an assertion: the stubs below give the right shape and the wrong behaviour.

**Stubs for commit 1**: `src/site/ribbon/fallback-note.ts` exports the interface, the type and `fallbackNote` returning `null` always. `rowProspectTarget` in `src/site/ribbon/address.ts` returns `null` always. With them U2, U3, U4, U5 and U7 red on their `assert.equal`; U1 and U6 pass on the stub (their bite is the mutations below).

Fixtures in `test/site/ribbon-fallback-note.test.ts`: `const w42 = generateWorld(defaultRecipe(42)); const w2 = generateWorld(defaultRecipe(2));` and `const noteFor = (world: World, ask: RibbonAsk) => fallbackNote(ask, ribbonResultFor(world, { ...ask, dress: "antique" }));`. Each test asserts its premise first. Every literal below was read off the ruled spike's `fallbackNote` over the real `ribbonResultFor` by `429-units.ts` (`node out/429-dry-run/429-units.ts > out/429-dry-run/429-units-ruled.log`), with the worlds' premises in `429-sweep.log` and `429-split.log`.

- **U1** "an address that asks nothing the roads refuse gets no note, an absent destination included": for each of `{from:null,to:null}`, `{from:1,to:null}`, `{from:0,to:null}`, `{from:1,to:22}`, `{from:0,to:22}`, `{from:7,to:17}` on w42, `noteFor` is `null`. Premise: `ribbonResultFor(w42,{from:1,to:null,…}).toIdx` is a number (an absent destination still draws one). **Mutation M1**: in `fallbackNote`, the departure compared with `res.toIdx` instead of `res.fromIdx`; `{from:1,to:22}` then yields "No road leaves Paukilua…" and U1 reds.
- **U2** "a departure no road leaves is named, and the road drawn is the capital's": `noteFor(w42,{from:24,to:null})` equals `"No road leaves Tewetulua; this is the road from the capital."`. Premises: `options[24].roads === false`, `options[24].name === "Tewetulua"`, the drawn `fromIdx` is the capital's index (0). **M2**: the departure sentence takes `res.fromName` in place of the asked place's name ("No road leaves Laukuwelua…").
- **U3** "a destination the road drawn cannot reach is named, on a roadless place and on another network": `noteFor(w42,{from:null,to:24})` equals `"The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua."`; `noteFor(w2,{from:0,to:19})` equals `"The road cannot take you to Bri; this is the road to the farthest place from Vunsvyov."`. Premises on w2: `options[19].roads === true` and the drawn `toIdx !== 19`. **M3**: the destination sentence takes the drawn `res.toName` ("…take you to Homaitani…").
- **U4** "a road asked to end where it sets out takes the same sentence": `noteFor(w42,{from:1,to:1})` equals `"The road cannot take you to Paukilua; this is the road to the farthest place from Paukilua."`. **M4**: the destination sentence skipped when the asked destination is the departure drawn (`&& ask.to !== res.fromIdx` added to its guard).
- **U5** "both refusals read as one note, the departure's first, and the destination is measured from the road drawn": `noteFor(w42,{from:24,to:24})` equals the U2 sentence, one space, then `"The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua."`; `noteFor(w42,{from:24,to:0})` equals the U2 sentence, one space, then `"The road cannot take you to Laukuwelua; this is the road to the farthest place from Laukuwelua."`. **M5**: the two sentences pushed in the other order. **M6**: the destination sentence names the asked departure (`options[ask.from].name`) in place of `res.fromName` ("…farthest place from Tewetulua").
- **U6** "an index that names no place is no request, as the address grammar treats a value it cannot read": `noteFor(w42,{from:9999,to:null})`, `noteFor(w42,{from:null,to:9999})` and `noteFor(w42,{from:26,to:null})` are `null`. Premises: `options.length === 26`, and the drawn `fromIdx` for `{from:9999}` is the capital's. **M7**: drop `i < res.options.length` from the name lookup; `options[9999].name` throws and U6 reds.
- **U7** (in `test/site/ribbon-address.test.ts`) "rowProspectTarget gives a waypoint row its own town's prospect on the page's world, and every other row none": with `hash = "#seed=7&style=ink&band=temperate&a=1&b=9"`, `rowProspectTarget(hash, { kind: "waypoint", index: 4 })` equals `"/prospect/#seed=7&style=ink&band=temperate&i=4"`; for each of `"branch"`, `"summit"`, `"crossing"` with `index: 4` it is `null`; `{ kind: "waypoint" }` with no index is `null`. **M8**: the kind test removed (every row with an index gets a target). **M9**: `prospectTarget("", row.index)` in place of `prospectTarget(hash, row.index)` (the world keys lost).

Then the browser checks (both new steps go in `e2e/suites/ribbon/courtesies.ts`; the prover owes M10 to M15, by the proof runner's `npm run proof -- send` with the `ribbon` suite named, or locally):

- **RB19** `rb19Refused`, its own `step("RB19", …)`:
  1. `await k.goto(\`#seed=42&a=${ORPHAN}&b=${ORPHAN}\`)`, `const st = await k.opened("RB19: a road asked from and to Tewetulua")`.
  2. Read `NOTE` = `(() => { const n = document.getElementById("rb-fallback"); return { note: n ? n.textContent : null, shown: !!n && n.getBoundingClientRect().width > 0 }; })()` as `refused`.
  3. Pick a departure the way RB6 picks a destination: `document.getElementById("rb-from")`, `value = "1"`, dispatch `change` (wiring, not a gesture claim; say so at the line in one comment), then `const picked = await k.opened("RB19: the pick from Paukilua", (s) => s.from === 1)`, then read `NOTE` again as `cleared`.
  4. `check("RB19 an address the roads refuse is named on the slip: asked from and to Tewetulua, which no road leaves, the slip's gloss says the scroll sets out from the capital and why it cannot end there, and a departure picked from the list clears it (Issue #429)", st.from === 0 && refused.note === REFUSED && refused.shown && picked.from === 1 && cleared.note === "" && !cleared.shown, JSON.stringify({ from: st.from, refused, picked: picked.from, cleared }))`, with `const REFUSED = "No road leaves Tewetulua; this is the road from the capital. The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua.";`.
  - **M10**: `writeItinerary` writes the rows but never the note (the two `fallback` lines deleted). **M11**: the note written only when it is not `null` (`if (note !== null) { …textContent = note; …hidden = false; }`), so a pick never clears it.
  - **Readings** (the ruled spike build at `6683f826`; probe `429-ruled-checks.ts`, run as `node out/429-dry-run/429-ruled-checks.ts spike > out/429-dry-run/429-ruled-checks.log`; and main as built at `6683f826` with `429-checks.ts`, `node out/429-dry-run/429-checks.ts main > out/429-dry-run/429-checks-main.log`):
    - fixture, as drawn: `{"from":0,"to":22,"hash":"#seed=42&a=0&b=22","note":"No road leaves Tewetulua; this is the road from the capital. The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua.","shown":true}` passes; after the pick `{"from":1,"note":"","shown":false}` passes (`429-ruled-checks.log`).
    - change absent (main as built): `"note":null,"shown":false`: fails (`429-checks-main.log`).
    - M10 staged (note written, left hidden): `"shown":false`: fails (`429-ruled-checks.log`).
    - M11 staged (main leaves an injected note through the pick): `{"from":1,"note":"No road leaves Tewetulua; …","shown":true}`: fails (`429-checks-main.log`).
    - the destination's sentence dropped: `"note":"No road leaves Tewetulua; this is the road from the capital."`: fails (`429-ruled-checks.log`).
    - an absent destination read as refused, after the pick: `"note":"The road cannot take you to Homaitani; this is the road to the farthest place from Paukilua.","shown":true`: fails (`429-ruled-checks.log`).
  - **What the step holds**: two claims, read on one page (the Ribbon at the harness window): the refusal is named and shown on the slip, and a draw that asks nothing refused clears it. `git grep -n "rb-fallback\|fallback-gloss" -- e2e test` finds nothing today, and U1 to U6 hold the arithmetic, not the page, so neither claim is held elsewhere: **a thin step**. Mac: 0.58 s (`429-ruled-checks.log`).
- **RB20** `rb20RowProspects`, its own `step("RB20", …)`:
  1. `await k.goto("#seed=42&style=ink")`, `await k.opened("RB20: chart 42 in ink")` (C13: a key other than the seed rides).
  2. Read `ROWS` = for every `#rb-itinerary li`: `cls` (its class), `name` (the `strong` inside its `.lean`), `idx` (that name's `value` among `#rb-from`'s options, the check's own oracle, independent of the code under test; every waypoint is a place a road leaves, so every one is there), and `links` (each `a` inside the `li`: `href`, `aria-label`, and its previous sibling's class).
  3. `faults`: a non-waypoint row with any link; a waypoint row whose `idx` is null, or whose links are not exactly one with `href === "/prospect/#seed=42&style=ink&i=" + idx`, `aria-label === "See " + name + " in The Prospect"`, previous sibling class `"lean"`.
  4. `inner` = the first waypoint row that is neither the first nor the last row (`-1` when there is none). `reach` = its pill's centre and hit, read after `scrollIntoView({ block: "center" })` with `document.elementFromPoint` there (Gate 2 item 2), as `{ x, y, hit }`, or `null` when `inner` is `-1` or the row has no link (today's page: the read returns `null` and the check fails on its assertion, never on a throw). `let landed: Prospect | null = null;`. Only when `reach !== null && reach.hit === "self"`: `await pressAt(k, reach.x, reach.y)` (a real press, Gate 2 item 1), then `landed = await prospectKit(k).opened("RB20: the row's prospect")` (its own 300-read budget; it throws inside the step if the press navigates nowhere).
  5. `check("RB20 each town row opens its town's prospect: on chart 42 in ink every waypoint row carries one pill beside its lean to The Prospect of that town on the same world, named for it, and no other row does; a real press on a town along the way opens that town's prospect (Issue #429)", faults.length === 0 && inner > 0 && reach !== null && reach.hit === "self" && landed !== null && landed.seed === 42 && String(landed.index) === rows[inner].idx && landed.name === rows[inner].name && landed.hash === "#seed=42&style=ink&i=" + rows[inner].idx, JSON.stringify({ faults, inner, reach, landed: landed && { seed: landed.seed, index: landed.index, name: landed.name, hash: landed.hash } }))`. The `rows[inner]` reads stand after `inner > 0` in the same `&&` chain, so a missing row short-circuits rather than throws.
  - **M12**: the page's `prospectOf` returns `null` (no pills). **M13**: `prospectOf` aims at the road's end, `(row) => row.kind === "waypoint" ? prospectTarget(location.hash, res.toIdx) : null`. **M14**: `prospectOf` built from the seed alone, `(row) => rowProspectTarget(\`#seed=${seed}\`, row)`. **M15**: `.itinerary .row-prospect { pointer-events: none; }` added to `src/styles/ribbon/index.css`.
  - **Readings** (the ruled spike build at `6683f826`; probe `429-rb20-ink.ts`, run as `node out/429-dry-run/429-rb20-ink.ts > out/429-dry-run/429-rb20-ink-ruled.log`; and `429-states.ts`, `429-ruled-checks.ts`, `429-checks.ts` as named):
    - fixture, three runs: `"faults":[]`, `inner` 2 (Noloatatani, idx 7), `"hit":"self"` at the pill's centre (1192.3, 502.1), landed `{"seed":42,"index":7,"name":"Noloatatani","dress":"ink","hash":"#seed=42&style=ink&i=7"}`: passes every time (`429-rb20-ink-ruled.log`). The nearest-to-failing instance is none: every waypoint row reads exact.
    - M12, the change absent (main as built, `#seed=42`): faults on rows 0, 2, 6 and 7, all four waypoint rows (`429-checks-main.log`).
    - M13 staged: faults on rows 0, 2 and 6; row 7, the road's end, passes, the one instance M13 is not meant to red (`429-ruled-checks.log`).
    - M14 staged on `#seed=42&style=ink`: faults on rows 0, 2, 6 and 7, the hrefs reading `/prospect/#seed=42&i=…` (`429-states-ruled.log`).
    - M15 staged: `"hit":"LI.waypoint"`, so the check fails without pressing (`429-rb20-ink-ruled.log`); a press made anyway lands on the row and the page stays on `/ribbon/` (`429-ruled-checks.log`).
    - every row carrying a link: faults on rows 1, 3, 4 and 5 (`429-ruled-checks.log`).
  - **What the step holds**: two claims on two pages (the Ribbon, the Prospect): the rows' pills, and a real press on one opening its town's prospect. Neither is held elsewhere (U7 holds the helper, not the page; `git grep -n "row-prospect" -- e2e test` finds nothing today): **a thin step**. Mac: 0.90 to 0.99 s over three runs (`429-rb20-ink-ruled.log`).
- **RB11** (edited, not new): the slip's body list gains `P#rb-fallback.fallback-gloss` first. Reading: the menu spike's ribbon suite (`VELLUM_E2E_SUITES=ribbon npm run test:e2e`, `429-ribbon-suite-spike.log`) read `"body":["P#rb-fallback.fallback-gloss","P.intro","P.itinerary-head","OL#rb-itinerary.contents.itinerary","P.row-gloss"]` and failed RB11 on today's list, its only red; every other RB check passed (RB5b, RB5c, RB12, RB13 and RB15 read the rows and the lean). The ruled spike changes the pill's dress and the note's words, neither of which RB11 or those checks read. Its existing proof stands; the prover needs no new mutation for it.

**Step 15 leaves nothing to the implementer to prove**: every mutation above is the prover's (M1 to M9 unit, M10 to M15 browser).

## Order of commits

1. `#429 The plan, and the failing tests for the slip's notice and the town row's prospect`: `handbook/plans/400/429/429-plan.md`, `test/site/ribbon-fallback-note.test.ts`, the U7 addition, and the two stubs. `npm test -- test/site/ribbon-fallback-note.test.ts test/site/ribbon-address.test.ts` reds U2, U3, U4, U5, U7 on their assertions; paste the red lines. Push.
2. `#429 fallbackNote and rowProspectTarget`: the two implementations; the same command is green.
3. `#429 RB19, RB20 and RB11's slip order, red on today's page`: `e2e/suites/ribbon/courtesies.ts`, `e2e/suites/ribbon.ts`, `e2e/suites/ribbon/kit.ts`, `e2e/suites/ribbon/room.ts`. `npm run build`, then `VELLUM_E2E_SUITES=ribbon npm run test:e2e` reds exactly RB11, RB19 and RB20; paste their FAIL lines.
4. `#429 The slip names a refused address, and each town row opens its prospect`: `src/pages/ribbon/index.astro`, `src/site/ribbon/seats.ts`, `src/site/ribbon/app.ts`, `src/styles/ribbon/index.css`. The suite is green.
5. `#429 engine-invariants: the Ribbon names a substitution it was handed`: the spec paragraph.

## Rosters and doctrine

- **Rosters**: no new page, sheet, bundle, suite or lane. `src/site/ribbon/fallback-note.ts` is reached by the existing `src/site/ribbon/app.ts` entry in `scripts/build-app-bundles.ts` and by the lint blocks that already glob `src/site/ribbon/**` (`eslint.config.ts`, "the house's rules on the chart rooms' modules"). The new test file is collected by `npm test` by its name. `e2e/suites/ribbon/courtesies.ts` is a helper the suite imports, as `room.ts` is; nothing lists those helpers (`git grep -n "ribbon/room" -- . ':!handbook/plans'` finds only imports). `MEASURED_SECONDS` is not edited (site-architecture: no pull request re-times a suite). RB20 leaves the Ribbon suite on `/prospect/` where today it ends on `/ribbon/`; neither `NEEDS_PREDECESSOR` nor `OPENS_ON_HOME` in `e2e/support/suites.ts` names a suite that reads the page the Ribbon suite leaves (lane B runs `broadside` next, the smoke tier `home`), so no successor depends on it.
- **`handbook/specs/engine-invariants.md`**, the paragraph opening "**A ribbon result substitutes the capital's departure without announcing it.**", is replaced whole by:

  > **A ribbon result substitutes a refused departure or destination without announcing it.** `ribbonResultFor` in `src/site/explorer/ribbon-job.ts` reassigns the departure to the capital when `roadReachable` in `src/itinerary/route.ts` returns nothing, and the destination to the farthest place the departure reaches when the one asked for is not among them. The substitution is detectable in the result, which carries the resolved indices and names and a per-option road flag, but the job raises nothing and nothing fails. **So any surface offering "the road from X" owes a check that X has a road, and carries that answer**, and a surface that draws an address it was handed compares the resolved departure and destination with the ones it asked for and says so, as the Ribbon's slip does (`fallbackNote` in `src/site/ribbon/fallback-note.ts`). A non-empty result is not evidence that the ask was honoured.
- **Ratified lines**: the 2026-09-03 rulings are built as worded; Issue #494 ruling 3's legend road is unchanged; Epic #426's order (Sub 9 first) is set aside for this sub by Alex's Q1, recorded in the rulings comment, and no spec line holds that order.
- **The feel calls are provisional** (`handbook/specs/conventions.md`, steps 3 and 6): the pill's word, dress, height and seat, the notice's seat, and both sentences' wording. The PR body names them as awaiting the post-use review; the dispatcher files that review issue as Issue #1192 was filed for Issue #428 (C16).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (after `npm run format`).
- `npm test -- test/site/ribbon-fallback-note.test.ts test/site/ribbon-address.test.ts test/site/ribbon-job.test.ts test/site/ribbon-row-text.test.ts test/site/astro-scaffold.test.ts`, then `npm run astro:generate`.
- `npm run build`, then `VELLUM_E2E_SUITES=ribbon npm run test:e2e`: RB1 to RB20 green. That is the one e2e suite the change touches (it imports the Prospect's kit but changes nothing the `prospect` suite reads). Never the full local lanes.
- The acceptance, seen: `/ribbon/#seed=42`, `/ribbon/#seed=42&a=24&b=24`, `/ribbon/#seed=42&b=24` and `/ribbon/#seed=42&a=1&b=1` at 1280x800, 1024x768 and a 640 wide window (where every piece keeps its 1024 seat and the window scrolls sideways, `vellum-footguns` Gate 3 item 3) from the built branch, by `vellum-plate-reader` (owed at step 11, since the look was ruled from stills), against the ruled stills `out/429/429-ruled-*.png`: the pill's box (at least 24 px tall), its contrast at rest, hovered and leaned, the focus ring, the notice's contrast, row heights against the control's, and overlap on ink.
- **Step seconds** (settle-doctrine, "Who finds a slow step"): RB19 and RB20 are thin steps. Read each from the PR's own lane B run (the `RB18` result line to the `RB19` line, and `RB19` to `RB20`): under 4 s passes; 4 to 20 s, two more runs of lane B's job started by hand give the median; over 20 s, or a median of 10 s or more, is a stop.
- `vellum-guard-prover`: owed, one round, on U1 to U7 and RB19, RB20 (M1 to M15).
- No regen: `node --test test/site/hero-charts.test.ts test/site/gallery-room.test.ts` green, named in the PR body (Gate 6 item 7).

## Calls made

Each is mine, with its rule; the implementer copies them into the step 12 comment. Alex's rulings are not restated here: the step 12 comment points at the two rulings comments.

- **C1** No worker contract change: the page compares what it asked with what came back (re-baseline comment 5533759275; `handbook/specs/site-architecture.md`, one glue function both transports call, left alone).
- **C2** A `null` departure or destination is no request: a bare visit and every departure pick send `to = null` (re-baseline's trap; RB1 opens a bare visit).
- **C3** An index that names no settlement (`a=9999`) is no request and gets no notice (the grammar's own rule, `test/site/ribbon-address.test.ts`, "invalid values are ignored, not guessed at").
- **C4** The notice is recomputed on every successful draw from that draw's own ask, so a pick or Turn about clears it; a failed draw leaves the slip as the last draw left it (the slip shows the journey drawn; Turn about never asks a refused place, 0 one-way pairs over 100 seeds).
- **C5** The departure's sentence is Alex's own, with X the asked place's name, and names no capital (his words; the slip's title already names the departure drawn).
- **C6** The destination sentence measures from the departure actually drawn: "the farthest place from" names `res.fromName`, so a refused departure and a refused destination read as one road (the sentence names the road on the scroll).
- **C7** Both sentences share one gloss line, the departure's first (the order the reader reads the address).
- **C8** No live region on the notice: the page's one live status is the pill (`role=status`, RB11), and the notice is read in the slip's order above the rows.
- **C9** The town pill is an `<a>` (it navigates), named "See {town} in The Prospect" (the legend road's own verb and room, `handbook/specs/ui-design.md` "The voice"), with no hover tip (a tip is a new gesture that joins a list consciously, ui-design "Gesture").
- **C10** The pill carries the page's world keys through the existing `prospectTarget`, as the legend road does (RB5d).
- **C11** The row gloss "A row leans the Glass on that stretch of the road." stays as it is: the lean is unchanged and the pill names itself.
- **C12** One pull request for both parts (the body's "one PR"; the rulings do not split it).
- **C13** RB20's fixture is `#seed=42&style=ink`, so the check sees a key other than the seed ride (Gate 1 item 3; M14 reds only there).
- **C14** The two browser checks live in a new `e2e/suites/ribbon/courtesies.ts`, beside `room.ts`, rather than growing `ribbon.ts` or `room.ts`.
- **C15** The engine-invariants paragraph is rewritten in the prescriptive voice to name the page's comparison (development-workflow step 8: doctrine moves with the code).
- **C16** The feel calls go to a post-use review issue the dispatcher files, as for Issue #428 (conventions, step 6; Epic #426 links its subs in prose).
- **C17** The pill's padding is `0.2rem 0.45rem`, not the menu still's `0.06rem 0.45rem`, so its box is at least 24 px tall (WCAG 2.2's minimum target size, 2.5.8; no house spec rules a target size for a pill in a slip). The height is set by the sheet, not the face: 0.74rem at the row's 1.4 line height is 16.58 px, plus 0.4rem of padding and 2 px of border, 24.98 px; measured 24.95 (`429-states-ruled.log`), against 20.48 in the still Alex ruled from. That deviation is the plan's own measured note relayed with Q2, and the PR body states it under the fidelity rule. It moves no row: 0 of 542 rows over seeds 1 to 40 change height (`429-row-heights.log`).
- **C18** A sibling defect is left alone and reported: a league mark of 100 or more wraps its " lg" under the number (99 of 296 waypoint rows over seeds 1 to 40 stand 52.4 px tall against 32.8, with or without the pill: `429-wrap-sweep-ruled.log`; seen as "102 / LG" in `429-main-1280-seed-42-a-1-b-1.png`). The dispatcher files it as an issue or errata row; this pull request does not touch `.cr-num`.
- **C19** A road asked to end where it sets out takes the one ruled sentence unchanged, both names filled from the case: "The road cannot take you to Paukilua; this is the road to the farthest place from Paukilua." It is true and reads under the slip's title "Paukilua to Homaitani" (`out/429/429-ruled-note-same-1280-slip.png`, `429-ruled-note-same-1024-slip.png`).
- **C20** At 1024 by 768 a destination sentence pushes the road's last row below the panel's fold: seed 42 with both sentences reads the slip body 508 over 428 px and 7 of 8 rows whole, with the destination's alone 488 over 428 and 7 of 8, with the departure's alone 469 over 428 and 8 of 8 (today: 438 over 428, 8 of 8). The panel scrolls, as it already does by 10 px; nothing is cropped (`429-look-ruled.log`, `429-look-ruled2.log`). Alex ruled the notice's seat with that cost stated in the menu.

## Open decisions

none

## Stop conditions

Hand back, rather than adapt, when:

- `git diff --stat b3489b64 origin/main -- src/site/ribbon src/pages/ribbon src/styles/ribbon src/site/explorer/ribbon-job.ts e2e/suites/ribbon.ts e2e/suites/ribbon e2e/suites/prospect/kit.ts e2e/suites/print-room/kit.ts test/site/ribbon-address.test.ts` prints anything.
- A premise reads otherwise: seed 42's settlement 24 is not a road-less "Tewetulua", seed 42 has not 26 settlements, `#seed=42&a=24&b=24` does not draw `0` to `22` (Laukuwelua to Homaitani), seed 2's settlement 19 is not a roaded "Bri" outside the capital's network, or the drawn destination for `{from:0,to:19}` on seed 2 is 19.
- A unit test the plan names does not red on its stub or under its mutation as stated.
- RB19's first run reads a note other than `REFUSED`, or `opened()` does not settle on `#seed=42&a=24&b=24`.
- RB20's first run reads any fault, an `inner` other than row 2 (Noloatatani, index 7), a hit other than `"self"`, or a landing other than `#seed=42&style=ink&i=7`.
- Any RB check other than RB11, RB19 and RB20 reds at commit 3, or any RB check reds at commit 4.
- `npm run lint` refuses a rule in `src/styles/ribbon/index.css` (the ruled spike's sheet passed `eslint` on 2026-11-02, `429-lint-ruled.log`).
- CI reads RB19 or RB20 over 20 s, or at a median of 10 s or more after two more lane B runs (a thin step too slow is a rework, a design call).
- The step 11 plate read finds the pill under 24 px tall, a contrast under 4.5:1, a row whose height differs from the control's, the pill overlapped or not the hit at its centre in any state, or a piece off its 1024 seat at 640.
- Anything needs a file this plan does not name, or leaves one it names unused.
