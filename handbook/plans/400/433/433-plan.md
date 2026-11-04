# Issue #433, pull request 1 of the issue: the road from the capital joins the bound atlas

**Planned at:** `origin/main` 7d72cb3393728954ad5fc769c7f8c5d874edf95a, the issue read at 7 comments (`gh api repos/ahl-gram/Vellum/issues/433/comments --paginate | jq length` printed 7: the 2026-09-03 re-baseline 5533804552 and deferral 5533954968, the 2026-10-20 rulings 6282029630 and 6282038151, the 2026-11-03 delegation 6619124326, its extension to every pull request 6619143522, and the merge clearance 6619157358).

**Rulings:** Alex's rulings of 2026-10-20 (issuecomment-6282029630: several sizes, PNG and SVG, the ribbon a row of the atlas before the text-based entries; issuecomment-6282038151: both, an atlas row and a standalone Print Room order) and his delegation of 2026-11-03 (issuecomment-6619124326, extended to every pull request in issuecomment-6619143522): every question below that is not BLOCKING takes the recommended option as ruled. Every question this pull request raises is non-blocking, so each appears under **Calls made** as ruled by that delegation.

**Open decisions:** none.

## How the issue ships

Three pull requests at most, each with its own plan (workflow step 8).

- **PR1, this plan, in full: the atlas row.** The bound atlas, the served `/atlas/` page and the CLI atlas carry the Ribbon's plate as one more plate, after the prospect of the capital and before the banners, numbered ix, the back matter moving to x, xi and xii. No legend row, no address, no new page, no new stylesheet.
- **PR2: the standalone order in the Print Room's legend row.** Planned by a fresh `vellum-planner` as `433-pr2-plan.md` AFTER a design round (`vellum-designer`, dispatched by the orchestrating session from the main checkout without isolation, as workflow step 6 says) and Alex's sitting on its stills. Its foreseen content: the ribbon press's seat in the legend row, the sizes it offers, PNG and SVG (ruled), the road it presses (PR1's `defaultJourney`, unless the sitting rules a carried one), the dress folded from the room's style select through `plateDressFor`, and the split of `src/site/print-room/app.ts` (392 lines today, so any order path added there must leave it as its own module). Files it is expected to own: `src/site/print-room/app.ts` and a new order module beside it, `src/site/print-room/poster-presets.ts`, `src/pages/print-room/index.astro`, `src/styles/print-room/index.css`, `e2e/suites/print-room/plates.ts`, `e2e/suites/print-room/room.ts` (PR36's `PLATES` and `legendFaults`, which hard-code four plates and the road), `test/print-room/poster-presets.test.ts`.
- **PR3, only if the sitting rules the journey carried in from the Ribbon:** the Print Room's address learns the Ribbon's `a` and `b` keys (`parseRibbonAddress`'s grammar), and the Ribbon's legend row gains a road to the Print Room carrying them. It touches `src/pages/ribbon/index.astro`, `src/site/ribbon/app.ts` and `e2e/suites/ribbon.ts`; the last is Issue #1229's lane's today, so PR3 lands after #1229 merges.

**Foreseen BLOCKING questions of the later pull requests** (the coordinator asked that they be named now):

1. PR2: how the ribbon press seats in the legend row ruled at four sizes plus one gold road (Issue #463, 2026-08-30, ruling 2). It amends a ratified ruling and it is an appearance ruled from stills. The design round comes first, with today's row as the control.
2. PR2: which sizes the ribbon is offered at. They are drawn on the presses, so they are part of the same sitting.
3. PR2: whether the room's presses also press the atlas's road while its page is turned onto the sheet. That is the remaining reading of "both" (issuecomment-6282038151) and part of the seat's design. PR1 builds the same either way.
4. PR3: a journey carried into the Print Room by address keys, a public address (the coordinator's reading (c)), and a road out of the Ribbon to the Print Room, an appearance on the Ribbon's legend row (reading (b)).

Foreseen non-blocking for PR2 (its planner takes the recommended option under the extended delegation): the SVG size made by writing `width` and `height` on the root over the unchanged `0 0 1060 740` viewBox; PNG through `rasterizeSvg` at a scale, under its existing 24,000,000 pixel budget in `src/site/shared/rasterize.ts`; the download file names; what the Pressed-as select does while the ribbon is chosen; the module split of `app.ts`.

**The design round for PR2 can run now, beside PR1's build.** The orchestrating session briefs `vellum-designer` with: real engine output (seed 42's road, Laukuwelua to Homaitani, antique and ink, drawn by `ribbonResultFor` with `from` and `to` null); today's legend row as the control, at 1024 by 768 and 1280 by 800; the directions it weighs, drawing its own honest set: the row's head choosing what is pressed (a poster plate, the road) with the four presses taking that plate's sizes; the presses pressing whatever plate is on the sheet (the proof, the road once turned to); a fifth press for the road before the gold road, its size from the head. What PR2's step 11 plate read then measures: the row on one line at 1280 and its risen seat at 1024, the presses' clearance from the folio and the Glass, any select in the head at 16 px or larger (`handbook/specs/ui-design.md`, the 16px bullet), contrast at 4.5:1 or better.

## Specs

Read these before building, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/rulebook.md`: Golden and committed-chart discipline (no regen is owed: nothing here renders a world chart, moves world identity or touches `src/static/`), Durable engineering constraints, the "Heavy lazy plates (#329)" line (the atlas's reserved frames plus `loading="lazy"`), and What `src/` holds (the dependency points one way: nothing under `src/` imports `test/` or `scripts/`).
- `handbook/specs/chart-dress.md`: "A derived plate falls back through the dresses in order" and "The ribbon plate's antique is painted, its ink is plain".
- `handbook/specs/engine-invariants.md`: "A ribbon result substitutes a refused departure or destination without announcing it" (a surface offering the road from X checks X has a road and carries that answer) and "Measuring a world in a script".
- `handbook/specs/site-architecture.md`: "What a working page's surface owes beyond its files" (one glue per job kind) and "A job that draws a plate loads the plate's code on demand" (`test/site/app-bundles.test.ts` holds it).
- `handbook/specs/ui-design.md`: The voice (a new thing named in the period register) and Print (one plate per page, the atlas download as a take-home artifact).
- `handbook/specs/check-placement.md`: The unit suite and The browser lanes and a plate read.
- `handbook/specs/settle-doctrine.md`: "When a check is pulled out of the run", the bullets "What a step holds" and "Who finds a slow step".
- `handbook/specs/conventions.md`: the comment rules. This pull request adds no comment and edits no spec.
- `handbook/specs/development-workflow.md`: step 8 (the archive path) and step 11 (the plate reader).

## The design

The Ribbon room draws one road per from and to. For a bare visit, `ribbonResultFor` in `src/site/explorer/ribbon-job.ts` sets out from the capital for the place farthest along the roads (`farthestReachable`, the longest `roadWalk` chain, the first such place in `roadReachable`'s order). The atlas carries exactly that plate: the Ribbon room's own engraving for its bare-visit journey, at its own 1060 by 740, in the dress the proof's style folds to (`plateDressFor`: an ink proof draws the plain impression, every other style the painted one).

1. **A pure engine function names the journey.** `defaultJourney(world)` joins the road helpers in `src/itinerary/route.ts`. It returns the capital and the farthest place by road, or `null` when the world has no capital or the capital has no road. `ribbon-job.ts` is NOT edited (the dispatcher holds it read-only, and `src/atlas/` may not import from `src/site/`). A unit test holds the two to the same answer over five seeds.
2. **The composer draws the plate.** `ribbonPlates(world, bannerStyle)` in `src/atlas/compose.ts`, the twin of `prospectPlates`, returns `[]` or one `AtlasPlate`: key `ribbon-capital`, title `The Road from <from> to <to>` (the plate's own banner reads `The ROAD from <FROM> to <TO>`, `ribbonTitle` in `src/itinerary/prose.ts`), svg from `ribbonPlate` in `src/itinerary/finished.ts`. `AtlasComposition` and `AtlasDocumentData` gain `ribbons`, and `PlateSection` gains `"ribbon"`.
3. **Every reader of the atlas carries it.** `serializableAtlas` copies it across the worker boundary; `atlasDocument` shelves it under `<h2>The Road from the Capital</h2>` between the prospect's section and the banners; the CLI writes `ribbon-capital.svg` beside the other plates; the Print Room's bound atlas mints it, lists it as row ix with a thumbnail, and turns it onto the sheet like any plate (its aspect read from its viewBox by `plateAspect`, which gives 1060/740).
4. **The numbering moves by one.** `SECTION_ROW.ribbon` is row 8 (ix) and `MATTER_ROW` hangs on it: banners 9 (x), chronicle 10 (xi), gazetteer 11 (xii), the twelfth and last numeral. A thirteenth row throws, which the existing test "the folio's plate line names the plate by its row's numeral..." already asserts (`numeralOf(NUMERALS.length)` throws a `RangeError`; measured at main: `numeralOf(12)` threw "the contents run to 12 rows; row 13 has no numeral").

**Alternatives rejected, so none is rediscovered mid-build:**

- The road between the atlas's two regional surveys (the capital and the town farthest from it as the crow flies, `regionPlates` in `src/atlas/compose.ts`). It would tie the atlas's plates into one story, and the far town was road-reachable from the capital on 28 of 28 seeds swept. It is rejected because the house's precedent is parity with the room the artifact comes from (the Print Room's Chart plate is the Explorer's own engraving, byte for byte; the atlas's prospect is the Prospect room's bare-visit capital), and because the farthest place by road was that town on 0 of the 28 seeds, so the atlas would show a road the Ribbon never shows on arrival. Kept in **Calls made** as the overrule option.
- Importing `ribbonResultFor` into `src/atlas/compose.ts`: it is site code, and its `options` field floods the roads from every settlement, a cost the atlas does not need.
- Editing `ribbon-job.ts` to call `defaultJourney`: held read-only by the dispatcher; the parity test holds the two together instead.
- Scaling the ribbon to the atlas's 1500 px width: the plate would no longer be the Ribbon room's own bytes, and an SVG scales in its `img` anyway.
- Seating the row after the banners, before the chronicle: it satisfies the ruling only if the banners are not text-based, where the seat before the banners satisfies it under either reading, and it keeps every plate before the back matter.
- Extending `NUMERALS`: nothing needs a thirteenth row, and the throw stays loud at the next addition's first run.
- A new browser check for the road turning onto the sheet: the turn's mechanism is PR31's (the prospect's 520 by 384 plate takes the sheet at its own aspect), the road's aspect is a unit pin on `plateAspect`, and PR20's `thumbs === plates` reds if the road is minted into the hidden document without its row's thumbnail. The step 11 plate read turns to it.

## Files

Created:

- `test/itinerary/default-journey.test.ts`: tests T1 to T3 below.

Edited (every count below read at 7d72cb33 with `wc -l`):

- `src/itinerary/route.ts` (59 lines). Add, after `roadReachable`:
  ```ts
  export interface Journey {
    readonly fromIdx: number;
    readonly toIdx: number;
  }
  export function defaultJourney(world: World): Journey | null
  ```
  Body: `capital = world.settlements.findIndex((s) => s.kind === "capital")`; `capital < 0` returns `null`; `mask = roadMask(world)`; `reachable = roadReachable(world, mask, capital)`; empty returns `null`; otherwise the place whose `roadWalk(world, mask, capital, i)` chain is longest, compared with a strict `>` in `reachable`'s order exactly as `farthestReachable` in `ribbon-job.ts` does; a `null` best returns `null`.
- `src/atlas/compose.ts` (215 lines). Import `defaultJourney` from `../itinerary/route.ts` and `ribbonPlate` from `../itinerary/finished.ts`. `AtlasComposition` gains `readonly ribbons: ReadonlyArray<AtlasPlate>;` after `prospects`. Add `export function ribbonPlates(world: World, bannerStyle: StyleName): AtlasPlate[]`: a `null` journey returns `[]`; `ribbonPlate(world, j.fromIdx, j.toIdx, plateDressFor(bannerStyle))` returning `null` returns `[]`; otherwise `[{ key: "ribbon-capital", title: \`The Road from ${world.settlements[j.fromIdx]!.name} to ${world.settlements[j.toIdx]!.name}\`, svg }]`. `composeAtlas` returns `ribbons: ribbonPlates(world, bannerStyle)` after `prospects`.
- `src/atlas/document.ts` (262 lines). `PlateSection` becomes `"hero" | "draughting" | "theme" | "region" | "prospect" | "ribbon"`. `AtlasDocumentData` gains `readonly ribbons: ReadonlyArray<AtlasPlate>;` after `prospects`. In `plateSections`, a `ribbonSection` built exactly as `prospectSection` is (empty string when `data.ribbons` is empty, else `<section>\n<h2>The Road from the Capital</h2>\n${ribbons}\n</section>\n\n` with `ribbons = data.ribbons.map((p) => fig(p, "ribbon")).join("\n")`), and the template's tail becomes `${prospectSection}${ribbonSection}`. `atlasPlateFilename` is unchanged: a ribbon plate falls to `${plate.key}.svg`.
- `src/site/explorer/serializable-atlas.ts`: `ribbons: a.ribbons` after `prospects`.
- `src/cli/atlas.ts` (54 lines, `buildAtlas` 42 lines without blanks): after the prospects loop, `for (const r of atlas.ribbons) await writeFile(join(dir, atlasPlateFilename(r, "ribbon")), r.svg, "utf8");` in the loops' own form, and `ribbons: atlas.ribbons` in `data` after `prospects`.
- `src/site/print-room/plate-numbers.ts`: `SECTION_ROW` gains `ribbon: FIRST_THEME + THEMATIC.length + 2`; `MATTER_ROW` becomes `{ banners: SECTION_ROW.ribbon + 1, chronicle: SECTION_ROW.ribbon + 2, gazetteer: SECTION_ROW.ribbon + 3 }`. `NUMERALS` is unchanged.
- `src/site/print-room/contents-markup.ts` (138 lines). `ContentsData` gains `readonly ribbons: readonly PlateRef[];` after `prospects`. In `otherPlateRows`, after the prospect row:
  ```ts
  row(
    SECTION_ROW.ribbon,
    on(atlas.ribbons),
    atlas.ribbons.length > 0
      ? atlas.ribbons.map((p) => turn(p, here, `The road <em>${escapeXml(p.title.replace(/^The Road /, ""))}</em>`)).join(", ")
      : "The road from the capital: none for this world",
    plates(atlas.ribbons, here),
  ),
  ```
  In `contentsRows(null)`, `row(SECTION_ROW.ribbon, false, "The road from the capital")` after the prospect's row. `plateLine`'s `what` map gains `ribbon: title.replace(/^The Road /, "the road ")`.
- `src/site/print-room/matter-markup.ts`: no edit; its numerals follow `MATTER_ROW`.
- `src/site/print-room/bound-atlas.ts` (276 lines). `renderContents` passes `ribbons: refs(lastAtlas.ribbons)` after `prospects`. `renderBoundAtlas` mints `const ribbons = atlas.ribbons.map((p) => mint(p, "ribbon", 0));`, adds `...ribbons` after `...prospects` in the `plates` map, and after the prospect's section line emits `${ribbons.length > 0 ? \`<section><h2>The Road from the Capital</h2>${figs(ribbons)}</section>\` : ""}`. The bind status line is unchanged (`plates.size` counts the road).
- `src/pages/print-room/index.astro`: the slip's intro becomes "Every draughting, the thematic and regional surveys, the prospect of the capital and the road from it, the banners, the chronicle, and the gazetteer, bound from the proof on the desk." (the prospect was already missing from it).
- `e2e/suites/print-room/atlas.ts` (353 lines): PR20c, PR33 and PR33b as in **Tests**.
- Unit test files, as in **Tests**: `test/atlas/compose.test.ts`, `test/atlas/document.test.ts`, `test/site/print-room-contents.test.ts`, `test/site/print-room-matter.test.ts`, `test/cli/atlas.test.ts`, `test/site/astro-showcases.test.ts`.
- Fixtures the type check sends you to, each given the field in its neighbours' form: `test/repo/css-beyond-sheets.test.ts` (`ribbons: []`, as its other lists are empty), `test/site/shell-css.test.ts` (`ribbons: [plate]`, as its every list holds `plate`), `test/site/fonts.test.ts` (`ribbons: [{ key: "ribbon-capital", title: "The Road from Café to Brie", svg: "<svg></svg>" }]`, one entry as its other lists hold).

Not edited: `src/site/explorer/ribbon-job.ts`, `src/site/explorer/worker.ts`, `src/site/explorer/worker-client.ts`, anything under `src/itinerary/dress/` (Issue #1218's lane), `src/render/` (Issue #1222's), `src/site/ribbon/`, `src/styles/` (no stylesheet changes), any spec. No file passes 400 lines and no function 50 (the largest after the change: `bound-atlas.ts` near 280 lines, `plateSections` near 47 lines with blanks, `buildAtlas` near 44 without).

**Shared with a parallel lane:** none. Issue #1229 owns `src/site/ribbon/ink.ts`, `src/styles/ribbon/index.css`, `e2e/suites/ribbon/ink.ts` and `e2e/suites/ribbon.ts`; Issue #1218 owns `src/itinerary/dress/` and `test/itinerary/ribbon-seats.test.ts`; Issue #1222 owns `src/render/layers/feature-labels.ts` and one `handbook/specs/engine-invariants.md` paragraph. The one coupling is semantic: #1218 moves the ribbon's caption seats, so the plate's bytes change under this branch. Every test here compares two producers in one process (never a stored hash), so either merge order holds.

## Tests, in the order they are written

All unit tests are written in commit 1 against the shape stubs below and red on their assertions; the e2e edits ride commit 5.

**The shape stubs of commit 1** (right signatures, wrong behaviour):
- `defaultJourney`: `const capital = Math.max(0, world.settlements.findIndex((s) => s.kind === "capital")); const reach = roadReachable(world, roadMask(world), capital); return { fromIdx: capital, toIdx: reach[0] ?? capital };`
- `ribbonPlates`: `return [{ key: "ribbon-capital", title: "The Road", svg: "<svg/>" }];`, wired into `composeAtlas`'s `ribbons`.
- `PlateSection` includes `"ribbon"`; `ribbons` is on both data types and every producer passes it on (`serializableAtlas`, the CLI's `data`, the three fixtures); `plateSections` and `renderBoundAtlas` ignore it; the CLI writes no ribbon file.
- `SECTION_ROW.ribbon` is 8, `MATTER_ROW` still hangs on `SECTION_ROW.prospect`; `ContentsData.ribbons` exists and `otherPlateRows` and `contentsRows(null)` emit no ribbon row; `plateLine`'s `what` has `ribbon: ""`.

**T1** `test/itinerary/default-journey.test.ts`, "defaultJourney sets out from the capital for the place farthest along the roads, the journey the Ribbon draws for a bare visit (Issue #433)". For seeds `[3, 11, 42, 99, 2024]`: `res = ribbonResultFor(world, { from: null, to: null, dress: "antique" })`; first the precondition (Gate 1 item 2) `assert.notEqual(res.toIdx, roadReachable(world, roadMask(world), res.fromIdx)[0])`, then `assert.deepEqual(defaultJourney(world), { fromIdx: res.fromIdx, toIdx: res.toIdx })`. Measured at main: on all five seeds the farthest place differs from the first reachable one (3: 15 against 1; 11: 23 against 1; 42: 22 against 1; 99: 17 against 1; 2024: 20 against 1), so the stub reds on the `deepEqual`. Mutation once green: the strict `>` turned to `<` with the first candidate taken (the nearest place), red on seed 3. The prover owes it.

**T2** same file, "a capital with no road sets out on no journey, where the Ribbon would refuse". Witness `bare = { ...world42, roads: [] }`; precondition `assert.equal(roadReachable(bare, roadMask(bare), capital).length, 0)` (measured at main: 0 for seed 42's capital, index 0); then `assert.equal(defaultJourney(bare), null)`. The stub returns `{ fromIdx: 0, toIdx: 0 }`, red. Mutation: the empty-reach branch returning `{ fromIdx: capital, toIdx: capital }`. The prover owes it.

**T3** same file, "a world without a capital sets out on no journey, as the atlas's prospect has none". Witness: seed 42's world with every `capital` settlement given `kind: "town"`; precondition `assert.equal(witness.settlements.findIndex((s) => s.kind === "capital"), -1)`; then `assert.equal(defaultJourney(witness), null)`. The stub sets out from settlement 0, red. Mutation: `capital < 0` falling back to settlement 0 (the Ribbon's own fallback). The prover owes it.

**T4** `test/atlas/compose.test.ts`, "#433 the atlas carries the road from the capital: the Ribbon's own plate for its bare-visit journey, at its own 1060 by 740". Seed 42: `plates = ribbonPlates(world, "antique")`, `res = ribbonResultFor(world, { from: null, to: null, dress: "antique" })`; `assert.equal(plates.length, 1)`; key `"ribbon-capital"`; `assert.equal(plates[0]!.title, \`The Road from ${res.fromName} to ${res.toName}\`)` (seed 42: "The Road from Laukuwelua to Homaitani"); `assert.equal(plates[0]!.svg, res.svg)`; `assert.equal(plateAspect(plates[0]!.svg), RIBBON_W / RIBBON_H)` (`plateAspect` from `src/site/print-room/plate-aspect.ts`, `RIBBON_W` and `RIBBON_H` from `src/itinerary/finished.ts`). Add to the existing test "composeAtlas yields the hero, the other draughtings, and the surveys" one line: `assert.deepEqual(atlas.ribbons, ribbonPlates(world, "antique"))`. Measured at main: `ribbonPlate(world, 0, 22, "antique") === ribbonResultFor(...).svg` printed `true`, and `plateAspect` printed 1.4324324324324325, equal to 1060 / 740. The stub reds on the title. Mutations: the svg drawn for the first reachable place; the key changed. The prover owes it.

**T5** same file, "#433 the road takes the proof's dress folded to the plate's two: an ink proof draws the plain impression, a nautical one the painted". Precondition: the ink and antique svgs differ (measured at main: they do, the ink one 47,587 characters). Then `ribbonPlates(world, "ink")[0]!.svg === ribbonResultFor(world, { from: null, to: null, dress: "ink" }).svg` and `ribbonPlates(world, "nautical")[0]!.svg === ribbonResultFor(world, { ..., dress: "antique" }).svg`. Asserted at a non-default value (Gate 1 item 3). The stub reds on the svg. Mutation: `plateDressFor(bannerStyle)` replaced by `"antique"`, red on the ink half. The prover owes it.

**T6** `test/atlas/document.test.ts`. `fixture()` gains `ribbons: [plate("ribbon-capital", "The Road from Café to Brie")]`. New test "#433 the road from the capital is shelved after the prospect and before the banners, under its own head, anchored like every plate": file-ref mode; `road = html.indexOf("<h2>The Road from the Capital</h2>")`, `assert.notEqual(road, -1)` (Gate 1 item 4), then `html.indexOf("<h2>The Prospect of the Capital</h2>") < road` and `road < html.indexOf("Banners of the Realms")`; `assert.match(html, /<a href="ribbon-capital\.svg"><img src="ribbon-capital\.svg"/)`; and `atlasDocument({ ...fixture(), ribbons: [] }, ...)` does not match `/The Road from the Capital/` (no empty shelf). The existing data-URI test's count goes from 6 to 7, its comment line reading "1 hero + 2 draughtings + 1 theme + 1 region + 1 prospect + 1 road = 7". The stub reds on `notEqual`. Mutations: the road's section emitted after `bannersHtml`; the empty guard dropped. The prover owes it.

**T7** `test/site/print-room-contents.test.ts`. `DATA` gains `ribbons: [ref("ribbon-capital", "The Road from Laukuwelua to Homaitani")]` after `prospects`.
- Unbound: the title reads "twelve rows"; `li.length` 12, message "twelve rows, i to xii"; numerals `i` to `xii`; `li[8]` matches `/The road from the capital<\/span>/`; `li[7]` still the prospect's.
- Bound: `li.length` 12; `checkBoundBackRows` gains `li[8]` matching `/<span class="cr-num">ix<\/span><span class="cr-text"><button class="turn" type="button" data-plate="ribbon-capital">The road <em>from Laukuwelua to Homaitani<\/em><\/button><\/span><div class="plates"><figure data-plate="ribbon-capital">/`, and the banners, chronicle and gazetteer move to `li[9]`, `li[10]`, `li[11]`; the figures list ends `"prospect-capital", "ribbon-capital"`, message "twelve thumbnails under their rows"; the title's "last three rows" stays true.
- The back-matter and counts-only tests move their indices by one (`li[11]` the gazetteer, `li[9]` and `li[10]` the counts-only rows, and their titles' "rows ix and x" become "rows x and xi").
- New test "#433 a world whose capital has no road says so on the road's row and offers no turn": `contentsRows({ ...DATA, ribbons: [], here: null })`, `li[8]` matches `/The road from the capital: none for this world/` and does not match `/<button|class="plates"/`.
- The escape test adds `ribbons: [{ key: "ribbon-capital", title: "The Road from <script> to X", href: "y" }]` and its `doesNotMatch(html, /<script>/)` covers it.
- The plate-line test adds `assert.equal(plateLine("ribbon", "The Road from Laukuwelua to Homaitani"), "plate ix of the bound atlas · the road from Laukuwelua to Homaitani")`.
The stub reds on the row counts. Mutations: `MATTER_ROW` hung on `SECTION_ROW.prospect` again; `escapeXml` dropped from the road's row; the none branch dropped. The prover owes them.

**T8** `test/site/print-room-matter.test.ts`, the existing test "the folio's plate line names the matter by its row's numeral": `"plate x of the bound atlas · the banners of every realm"`, `"plate xi of the bound atlas · the chronicle"`, `"plate xii of the bound atlas · the gazetteer"`. The stub reds there. Mutation: as T7's first. The prover owes it.

**T9** `test/cli/atlas.test.ts`, "#433 the atlas carries the road from the capital, its plate written beside the others": `buildAtlas(42, { out: "out/test-atlas-road" })` in the file's own try and finally form, `existsSync` imported from `node:fs`; `assert.ok(existsSync(join(dir, "ribbon-capital.svg")))` first, so the stub reds on an assertion and not a thrown read; then the file matches `/^<svg/` and `/viewBox="0 0 1060 740"/`, and `index.html` matches `/<h2>The Road from the Capital<\/h2>/` and `/<figure><a href="ribbon-capital\.svg"><img src="ribbon-capital\.svg"/`. Mutation: the CLI's ribbons loop deleted. The prover owes it.

**T10** `test/site/astro-showcases.test.ts`, the existing test "generateShowcases writes the atlas and gallery a deploy expects": the count 11 becomes 12, its message "atlas should hold 12 SVGs (hero + 3 draughtings + 4 themes + 2 regions + the capital's prospect, #412, + the road from the capital, #433)", and one more line `assert.ok(atlasSvgs.includes("ribbon-capital.svg"), "the road from the capital is written (#433)")`. The stub reds on the count. Mutation: as T9's. The prover owes it.

**The browser checks** (`e2e/suites/print-room/atlas.ts`), written in commit 5. Readings taken at 7d72cb33 on the site `npm run build` made in this planner's tree, by `out/433-dry-run/433-probe.ts` (command `node out/433-dry-run/433-probe.ts > out/433-dry-run/433-probe.log`, run twice, the second run adding the mis-seated arm; the log is the second run's), which drives the built site through `start` in `e2e/harness.ts` in the harness's own window, binds seed 42's atlas, and stages the change by mounting markup in `#pr-atlas`. The probe and its log go to the main checkout's `out/433-dry-run/` when the dispatcher retires this tree. Main IS the mutation for all three checks: a bound atlas with no road row. Each check asserts on one instance, seed 42's bound atlas.

- **PR20c, extended.** In `pr20Bind`, beside `prospectAt` and `regionAt`: `const roadAt = bound ? bound.heads.indexOf("The Road from the Capital") : -1;`, the condition gaining `roadAt > prospectAt && roadAt < bound.heads.indexOf("Banners of the Realms")`, the detail unchanged (it already prints `heads`), the name becoming "PR20c the bound preview shelves the capital's prospect between the surveys and the banners (#412), and the road from the capital after the prospect and before the banners (#433)".
  - Fixture reading (the road's head mounted after the prospect's section): heads `["Other Draughtings","Thematic Surveys","Regional Surveys","The Prospect of the Capital","The Road from the Capital","Banners of the Realms","Chronicle","Gazetteer"]`, `roadAt` 4, `prospectAt` 3, banners 5: passes.
  - Mutation reading, the road not shelved (main as built): `roadAt` -1: fails.
  - Mutation reading, the road shelved after the banners (head mounted after the banners' section): `roadAt` 5, banners 4: fails.
  - The fixture carries what the check reads: the bound atlas at main carries every other head the check reads (`Regional Surveys` 2, `The Prospect of the Capital` 3, `Banners of the Realms` 4).
- **PR33, renumbered.** `matter.on === "xii"`, the regex `/^plate xii of the bound atlas · the gazetteer$/`, the name's "row xi inked" becoming "row xii inked".
  - Fixture reading: UNVERIFIABLE. The numeral comes from `contentsRows`, which only the change rewrites, and no probe can stage it without editing source.
  - Mutation reading (main): `on` "xi", line "plate xi of the bound atlas · the gazetteer": fails.
- **PR33b, renumbered.** `banners.on === "x"`, the regex `/^plate x of the bound atlas · the banners of every realm$/`.
  - Fixture reading: UNVERIFIABLE, for PR33's reason.
  - Mutation reading (main): `on` "ix", line "plate ix of the bound atlas · the banners of every realm": fails.

**What the step holds and costs** (settle-doctrine, "Who finds a slow step"). PR20c, PR33 and PR33b run outside every step, inside `boundAndPaper` in `e2e/suites/print-room.ts`, and every later bound check reads the atlas `pr20Bind` binds, so the unit counted is the bind with all its readers, PR20 to PR39: well over two claims held nowhere else, so it is not thin. The edits add no read, no wait and no navigation (PR20c reads the `heads` array its poll already returns), so they add no seconds by construction. The implementer reads the unit's seconds from the pull request's own CI run of the print-room lane, as that bullet says, one run.

**Who proves what.** `vellum-guard-prover` owes T1 to T10, one round, after commit 5 is pushed. The three e2e checks are proved by the implementer on the CI proof runner before the pull request opens (`npm run proof -- send`), selection `hunt,print-room` (print-room's `NEEDS_PREDECESSOR` is hunt), two rows, each expecting exactly the checks it names so neither comes back IMPRECISE: one with the road's `<section>` emitted after `${atlas.bannersHtml}` in `renderBoundAtlas`, expecting PR20c alone (the thumbnails and the figure count are unchanged, so PR20 stays green; this is the arm the probe read as `pr20cSeatMutation`; dropping the section instead would red PR20 too, its `thumbs === plates` reading 12 against 11); one with `MATTER_ROW` hung on `SECTION_ROW.prospect` again, expecting PR33 and PR33b together.

## Order of commits

1. The plan archived at `handbook/plans/400/433/433-plan.md`, copied unchanged from the scratchpad, with the shape stubs and T1 to T10, red on their assertions. Pushed at once.
2. `defaultJourney` in `src/itinerary/route.ts`: T1 to T3 green.
3. `ribbonPlates`, `composeAtlas`, `serializableAtlas`, the CLI's write: T4, T5, T9 and T10 green.
4. `atlasDocument`'s shelf: T6 green.
5. The Print Room's numbering, contents, bound atlas and slip copy, and the three e2e edits: T7 and T8 green, the print-room suite green.

## Rosters and doctrine

- **Rosters joined by hand:** `PlateSection` (the type check sends you to `SECTION_ROW` and `plateLine`'s `what`, both `Record<PlateSection, ...>`); `AtlasComposition` and `AtlasDocumentData` (the type check sends you to `serializableAtlas`, `src/cli/atlas.ts` and the three test fixtures named under Files); the CLI's per-section write loops; the showcase test's SVG count; the contents' rows. No page, sheet, bundle, suite, lane or discovery route is added, so no roster in `handbook/specs/site-architecture.md`'s list is joined.
- **Doctrine contradicted:** none. `handbook/specs/engine-invariants.md`'s rule that a surface offering "the road from X" checks X has a road and carries the answer is met by `defaultJourney`'s `null` and the "none for this world" row; no spec line names the atlas's sections or numerals. No spec is edited, so nothing here meets Issue #1222's engine-invariants paragraph.
- **Comments:** none added.
- **Golden and regen:** none owed. No world chart, committed file or recipe changes.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/itinerary/default-journey.test.ts test/atlas/compose.test.ts test/atlas/document.test.ts test/site/print-room-contents.test.ts test/site/print-room-matter.test.ts test/cli/atlas.test.ts test/site/astro-showcases.test.ts test/repo/css-beyond-sheets.test.ts test/site/fonts.test.ts test/site/shell-css.test.ts test/site/app-bundles.test.ts`, then the whole `npm test` once, then `npm run astro:generate` (the unit suite deletes the generated assets).
- "No regen owed" is named by `npm test -- test/site/hero-charts.test.ts test/world/golden-seed42.test.ts`, green.
- `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`, once, alone. The print-room lane's seconds for the bound unit from the pull request's own CI run (above). The full local lanes are not run.
- The e2e suites the change touches: `print-room` (PR20c, PR33, PR33b) and, through the inline atlas job, `fallback` (B3, unchanged); CI runs both.
- `vellum-plate-reader` is owed at step 11 (this pull request's deliverable includes an appearance: a twelfth contents row, a wide plate turned onto the sheet, a page more in the printed atlas). It measures, on seed 42, at 1024 by 768 and 1280 by 800, with main's eleven-row slip as the control: the bound slip's twelve rows and the road's thumbnail inside the slip's width with no sideways scroll, the slip body's scroll height against the control's; the road turned onto the sheet, the sheet's width over height within 0.01 of 1060/740, the sheet wholly inside the stage, the folio line reading "plate ix of the bound atlas · the road from Laukuwelua to Homaitani"; the unbound slip's twelfth row; the printed bound atlas under print emulation at a Letter page, the road on a page of its own and inside the page box; and the served `/atlas/` page at 1280, the road's section between the prospect's and the banners', its frame reserved (the figure's height before and after its image decodes within 1 px).

## Calls made

Each ruled by the delegation of 2026-11-03 (issuecomment-6619124326), every one non-blocking: none amends a ratified ruling, none is an appearance ruled from stills, and each is undone by a later pull request at no cost to a reader.

1. **The split** above: PR1 the atlas row, PR2 the order after a design round, PR3 only for a carried journey. Rule: workflow step 8 (a plan per pull request) and step 6 (an appearance ruled from stills first).
2. **The seat:** row ix, after the prospect of the capital and before the banners. Rule: it satisfies "before the text-based entries" whether or not the banners count as text-based, where a seat after the banners satisfies it only if they do not, and it keeps every plate before the back matter (banners, chronicle, gazetteer are the three matter pages, `MATTER_KEYS` in `src/site/print-room/matter-markup.ts`). Alex's "journal history" is read as the chronicle, the atlas's only history.
3. **The road:** the Ribbon room's bare-visit journey, from the capital to the place farthest along the roads (seed 42: Laukuwelua to Homaitani, 83 leagues). Rule: parity with the room the artifact comes from, the Chart plate's precedent. The overrule option, flagged as bold delight: the road between the atlas's two regional surveys (seed 42: Laukuwelua to Toatauhe), which ties the atlas into one story but shows a road the Ribbon never shows on arrival (the two coincided on 0 of 28 seeds).
4. **No road, no plate:** a world whose capital has no road, or that has no capital, carries no road plate and its row says "none for this world". Rule: `handbook/specs/engine-invariants.md`, "A ribbon result substitutes...", and the prospect row's precedent. No swept seed is road-less (0 of 28), so the case is held by a constructed witness (T2).
5. **The dress:** the proof's style folded by `plateDressFor`, ink to the plain impression, every other to the painted. Rule: `handbook/specs/chart-dress.md`, "A derived plate falls back through the dresses in order", and the atlas's prospect plate, which does the same.
6. **The size:** the ribbon's own 1060 by 740, byte-identical to the Ribbon room's plate for that journey, not scaled to the atlas's 1500. Rule: parity, and an SVG scales in its `img`.
7. **The numerals are not extended:** the gazetteer takes xii, the last. Rule: touch only what is asked; the throw already pinned by test makes a thirteenth row loud at its first run.
8. **The names:** the section head "The Road from the Capital" (beside "The Prospect of the Capital"); the plate title "The Road from Laukuwelua to Homaitani" (the plate's own banner reads "The ROAD from LAUKUWELUA to HOMAITANI", and Ogilby's road plates are titled so); the row "The road *from Laukuwelua to Homaitani*", the journey italic as the prospect row italicises its capital; unbound "The road from the capital"; none "The road from the capital: none for this world"; the folio line "plate ix of the bound atlas · the road from Laukuwelua to Homaitani"; the key `ribbon-capital` and its file `ribbon-capital.svg` (beside `prospect-capital`). Rule: `handbook/specs/ui-design.md`, The voice, and the prospect row's pattern.
9. **Sizes and formats reach the atlas row as every atlas plate's do:** one engraving, in the atlas's own Print and Download and on the sheet. Rule: the plain reading of issuecomment-6282038151, which attaches several sizes in PNG or SVG to the order "by itself in the Print Room ... like the other plates". Whether the room's presses also press the road while it is turned onto the sheet is PR2's sitting (foreseen BLOCKING 3); PR1 builds the same either way.
10. **The served `/atlas/` page and the CLI atlas carry the road too.** Rule: they draw from the same `composeAtlas` and `atlasDocument`, and the ruling names the atlas, not one transport of it.
11. **The slip's intro is amended** to name the prospect, which it already omitted, and the road. Rule: the text this pull request edits is made true; a prose list of contents left stale stays stale silently.
12. **`defaultJourney` lives in `src/itinerary/route.ts`**, beside the road helpers it composes, and `ribbon-job.ts` keeps its own copy of the farthest-place walk, held to it by T1. Rule: the dispatcher's read-only hold on the ribbon job glue, and `src/atlas/` importing nothing from `src/site/`.
13. **No new browser check**, only PR20c extended and PR33 and PR33b renumbered. Rule: `handbook/specs/check-placement.md`, the cheapest check that can see each claim (the alternatives above say which holds what).

## Stop conditions

Hand back, with the command and what it printed, when:

- T1's precondition or its `deepEqual` fails on any of the five seeds at the planned-at sha: `ribbon-job.ts`'s bare-visit journey is not what this plan says.
- T2's precondition fails (`{ ...world, roads: [] }` leaves the capital a reachable place).
- `test/site/app-bundles.test.ts` reds: the plate's code reached a page at load through the new imports into `src/atlas/compose.ts`.
- A check or test not named here reds on a numeral (ix, x, xi, xii) or on an atlas plate count: a pin this plan's greps missed.
- The implementer's first run of PR33 reads `on` other than "xii", PR33b other than "x", or PR20c's `roadAt` outside (prospect, banners): the UNVERIFIABLE fixture readings fell on the wrong side.
- The ribbon plate's root does not carry `width="1060" height="740"` adjacent, so `atlasDocument`'s reserved frame regex (`/width="(\d+)" height="(\d+)"/`) misses it.
- `composeAtlas(world)` for seed 42 grows by more than 200 ms over main's (measured at main: about 1.4 s for the atlas, about 7 ms median for a ribbon over 28 seeds, 24 ms the worst).
- A named code or test file moved between 7d72cb33 and the build's `origin/main` (`git diff --stat 7d72cb33 origin/main -- <file>`), as `.claude/agents/vellum-implementer.md` ("Check the plan still stands") already makes a hand-back.
- The step 11 plate read finds the bound slip at 1024 by 768 now hides a control or scrolls sideways where main's did not, or the road's sheet runs outside the stage: a presentation fix that needs a decision.
- The settle-doctrine reading of the bound unit's seconds finds the step too slow: reworking it is a design call.
