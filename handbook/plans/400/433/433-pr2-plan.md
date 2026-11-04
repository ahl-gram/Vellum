# Issue #433, pull request 2 of the issue: the road from the capital can be ordered by itself in the Print Room

**Planned at:** `origin/main` bc72cc6ff67a36a3b95e07066dd0b2223704d9a5 (PR #1235, pull request 1 of this issue with its revision 1, merged while this was planned; `farthestReachable` and `defaultJourney` now in `src/itinerary/route.ts`), the issue read at 13 comments (`gh api repos/ahl-gram/Vellum/issues/433/comments --paginate | jq length` printed 13: the re-baseline 5533804552, the deferral 5533954968, the rulings 6282029630 and 6282038151, the delegation 6619124326 and its extension 6619143522, the merge clearance 6619157358, pull request 1's plan archive 6619486549, pull request 1's calls 6619724388, Alex's ruling on this pull request's design round 6620144566, pull request 1's revision 1 archive 6620413869, revision 1's calls 6620517919, and Alex's ruling on this plan's one blocking question 6620828024). Every reading below was taken on a build of bc72cc6f, still `origin/main` when the ruling was folded in (`git rev-parse origin/main` after `git fetch origin main`).

**Pull request 1 has merged, so this pull request builds on main as it stands.** Every PR1 symbol this plan builds on is listed under **What PR2 takes from PR1**, each read at bc72cc6f; the implementer re-reads the list before the first commit.

**Rulings:** Alex's rulings of 2026-10-20 (issuecomment-6282029630: several sizes, PNG and SVG, the ribbon an atlas row; issuecomment-6282038151: and a standalone Print Room order "like the other plates"), his design ruling on this pull request (issuecomment-6620144566: seat A, a second dropdown at the start of the head picking "A poster plate" or "The road from the capital", picking the road lays it on the sheet and the same four presses take its sizes, the row keeps four presses and the gold road, amending Issue #463's ruling of 2026-08-30; sizes 1060, 2400, 3300, 4200; with the bound atlas's road page on the sheet the presses press the road, and another page or a new proof sets them back; the words "As drawn"; the designer's fifth question, the head's dropdowns at 16 px, taken as ruled under the delegation by the orchestrator's note there), his ruling on this plan's one blocking question (https://github.com/ahl-gram/Vellum/issues/433#issuecomment-6620828024: with the road chosen the caveat's last sentence reads "The road is pressed either way.", as drawn in `out/433/stills/crop/1280-antique-A2.png`, a new visible sentence the earlier ruling had not named), and his delegation of 2026-11-03 (issuecomment-6619124326, extended to every pull request in issuecomment-6619143522): every question here that is not BLOCKING takes the recommended option and appears under **Calls made**.

**Open decisions:** none.

## Specs

Read these before building, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/ui-design.md`: The room and its furniture (the legend row's seat, `placeLegendRow`), The voice (a press is a verb and a place; print options speak of the engraving and an impression), Colour, contrast and legibility (4.5:1 measured on the painted ground; the 16px bullet this pull request amends), Print ("the sheet prints as paper").
- `handbook/specs/cascade-traps.md`, whole: two rules change, a font size and a print rule; read the computed result, never the declaration.
- `handbook/specs/engine-invariants.md`: "A ribbon result substitutes a refused departure or destination without announcing it" (the head offers "the road from the capital" only where the capital has a road, and says so where it has none).
- `handbook/specs/chart-dress.md`: "A derived plate falls back through the dresses in order" (the road takes `plateDressFor` of the proof's style).
- `handbook/specs/site-architecture.md`: "A job that draws a plate loads the plate's code on demand" (`test/site/app-bundles.test.ts`); no page, sheet, bundle or suite is added.
- `handbook/specs/check-placement.md`: The unit suite, The browser lanes and a plate read.
- `handbook/specs/settle-doctrine.md`: When a check is pulled out of the run ("What a step holds", "Who finds a slow step"), and The environment's bullet opening "CI's browser lays a chart room's furniture out" (a change to a staged piece's own dress leaves its staged value behind).
- `handbook/specs/conventions.md`: the fidelity rule (ship what Alex saw), how a spec is written (the amended 16px line), how code is cited, the comment rules.
- `handbook/specs/development-workflow.md`: step 8 (archive this plan as `handbook/plans/400/433/433-pr2-plan.md`), step 11 (the plate reader and the proof runner), step 15.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1, Gate 2 (items 1, 5, 6, 16, 17), Gate 3, Gate 4.

## What PR2 takes from PR1

Each read at bc72cc6f (`git grep -n` for the symbol, and the probe's bound readings below); the implementer reads them again before the first commit:

- `PlateSection` in `src/atlas/document.ts` includes `"ribbon"`.
- `src/site/print-room/bound-atlas.ts` (281 lines): the module-level `plates: Map<string, Bound>`, `Bound` carrying `section` and `aspect`, `renderBoundAtlas` minting the road with `mint(p, "ribbon", 0)`, `turnTo(key)` at line 178 calling `face.showPlate({ href: b.plate.href, title: b.plate.title, line: plateLine(b.section, b.plate.title, b.ordinal) })` at line 192, `sheetAspect()` at line 84, `SheetFace` and `PosterBasis` exported.
- `plateLine("ribbon", title)` in `src/site/print-room/contents-markup.ts`: the folio read "plate ix of the bound atlas · the road from Laukuwelua to Homaitani" with the road page turned in the built room; the bound contents carry row ix as `<figure data-plate="ribbon-capital">` with a `.thumb` and a `.turn[data-plate="ribbon-capital"]`; plate i's figure is `data-plate="antique"` (the probe's `here` with row i turned).
- `ribbonPlates(world, bannerStyle)` in `src/atlas/compose.ts` returns the key `"ribbon-capital"` and the title `` `The Road from ${from} to ${to}` ``.
- `defaultJourney(world)` in `src/itinerary/route.ts` returns `null` for a world with no capital and for a capital with no road (`test/itinerary/default-journey.test.ts`'s T2 and T3).
- The bound atlas's rows: plate i the antique world chart, temperature iv, the road ix (the probe's `on`).

## The design

**The head names what's pressed, and the sheet and the head are kept in step both ways.** A second dropdown, `#pr-pressing`, stands at the start of the head before "pressed as" and Pressed-as: "A poster plate" or "The road from the capital". Whatever is on the sheet decides what the four presses press, and choosing in the head changes the sheet:

| what happens | the sheet | the head and the presses |
|---|---|---|
| a proof lands | the proof | poster; the road is asked for at once, its option closed until the answer |
| the answer: a road from the capital | unchanged | the road option opens |
| the answer: the capital has no road, or the world no capital | unchanged | the road option stays closed and reads "The road from the capital: none for this world" |
| head to the road, nothing bound | the road, laid on the sheet at its own 1060 by 740, the folio's line "the road from X to Y" | road: Ribbon 1060, Desk 2400, Wall 3300, Grand 4200 |
| head to the road, the atlas bound | the atlas turned to its road page, row ix inked | road |
| head back to a poster plate, nothing bound | the proof | poster: Chart 1500, Desk, Wall, Grand |
| head back to a poster plate, the atlas bound | the atlas turned to plate i, the page a bind lands on | poster |
| the atlas's road page turned from the contents | the road page | road |
| any other page turned | that page | poster |
| Bind (it lands on plate i), Hide, a new proof, a style change | plate i, the proof, the proof | poster |
| a draw that fails | the previous proof | poster; the previous proof's road is asked for again |
| a press while an order rolls | unchanged | every press closed until the order settles, as today |
| the atlas's road page turned while the room's road never came (a worker failure) | the road page | poster, for that proof |

So "the presses press the road" means: the head reads "The road from the capital" exactly when the road (the room's own, or the bound atlas's road page) is on the sheet.

**The room's road is the Ribbon room's bare-visit plate for the world on the desk.** When a proof lands, the room runs the existing `"ribbon"` job with `from: null`, `to: null`, the proof's seed and overrides, and `dress: plateDressFor(style)`; that is byte for byte the plate the Ribbon room draws on a bare visit, and the plate the bound atlas carries (PR1's T4 and T5 hold `ribbonPlates` to `ribbonResultFor`). The answer is a road on offer only when the job resolves AND its departure is a settlement of kind `"capital"` (`roadOnOffer`): `ribbonResultFor` throws "no road leaves this place" when the capital has no road, and silently sets out from settlement 0 when the world has no capital, the two cases `defaultJourney` answers `null`. Measured over seeds 1 to 30, 42 and 57 at d73b108d (pull request 1 since moved the walk without changing an answer: revision 1's sweep of 1,518 departures read 0 mismatches), both dresses: the job takes 5 ms at the median and 10.9 ms at worst on a cached world, every departure a capital (`node out/433-dry-run/433-job-cost.ts`, `out/433-dry-run/433-job-cost.log`). No rolled seed in 1 to 30 of any map type has a road-less capital (`out/433-dry-run/433-noroad-sweep.log`); the Print Room's own address reaches one: `#seed=1&style=antique&type=archipelago&islands=100`, its capital settlement 0 with no road (`out/433-dry-run/433-noroad-address.log`, and read in the page, below).

**A road press makes its size by rewriting the root.** `roadAtWidth(svg, widthPx)` writes `width` and `height` on the `<svg>` root over the unchanged `viewBox="0 0 1060 740"`, the height rounded to two decimals (2400 gives 1675.47, 3300 gives 2303.77, 4200 gives 2932.08), and leaves every byte after the root alone; at 1060 it returns the plate unchanged. SVG downloads that string; PNG and the finer PNG press it through `rasterizeSvg` in `src/site/shared/rasterize.ts` at scale 1 or 2 under its 24,000,000 pixel budget. The road presets never pass `clampPosterWidth` and never reach the worker as a width: the job draws the one plate, the client sizes it.

**The order counter leaves `src/site/print-room/app.ts`** (392 lines at main) **as its own module**, `src/site/print-room/order-counter.ts`, carrying the poster orders verbatim and the road's beside them; `app.ts` stays the conductor of the proof, the address and the atlas.

**A turned plate carries its own aspect.** `Plate` in `src/site/print-room/seats.ts` gains `section` and `aspect`; `showPlate` records the aspect on `#pr-turned`, and the fit reads `matterAspect(furniture) ?? turnedAspect(furniture)`, so the room's own road, which no bound atlas holds, takes the sheet at 1060/740 the same way a bound plate does. `sheetAspect` in `bound-atlas.ts` then has no reader and is deleted.

**Alternatives rejected, so none is rediscovered mid-build:**

- **Ask the road only when the head is turned to it.** The option would offer a road before knowing there is one, against engine-invariants' "owes a check that X has a road"; asking per proof costs 5 ms.
- **Put the road's sizes in `POSTER_PRESETS`.** `clampPosterWidth` would raise the Ribbon's 1060 to 2400, and `test/repo/constant-contracts.test.ts` ("POSTER_PRESETS stays width-ascending", "clamps exactly Wall and Grand at x2") would red.
- **Send the road's width to the worker.** `RibbonSpec` takes no width and the plate is one viewBox; a worker change touches both transports for a string edit the client can make.
- **Keep the presses' `data-poster` keys fixed and map by position.** The first press then reads `chart` while it presses the Ribbon; the key is rewritten to `ribbon` in road mode instead, and Desk, Wall and Grand keep theirs.
- **Let the head change the presses without touching the sheet.** Ruling 1 says picking the road lays it on the sheet.
- **Head back to a poster plate while bound shows the proof.** The proof face is reachable only by dropping the atlas (`resetBoundAtlas`); a bound sheet always shows a page of the atlas, and plate i is the one a bind lands on.
- **Keep the poster path in `app.ts` and add the road there.** `app.ts` would pass 400 lines.
- **Infer the road from the proof's `DrawResult`.** It carries no road flag; only the ribbon job's answer does.

## Files

Counts read at bc72cc6f with `wc -l`.

**Created:**

- **`src/site/print-room/road-press.ts`** (pure, DOM-free, about 75 lines). Header, one line: `// The road from the capital as the Print Room presses it: its four sizes, what the head and the caveat say, whether the answer offers a road, the plate sized by its root, and its file names. Pure and DOM-free; src/site/print-room/order-counter.ts does the wiring.` Exports:
  ```ts
  import { CHART_PRESET, POSTER_PRESETS, type PosterPreset } from "./poster-presets.ts";
  export type Pressing = "poster" | "road";
  export type RoadState = "pending" | "none" | "drawn";
  export const ROAD_PRESETS: readonly PosterPreset[] = [
    { key: "ribbon", label: "Ribbon", width: 1060 },
    { key: "desk", label: "Desk", width: 2400 },
    { key: "wall", label: "Wall", width: 3300 },
    { key: "grand", label: "Grand", width: 4200 },
  ];
  export const ROAD_CHOICE = "The road from the capital";
  export const ROAD_NONE = "The road from the capital: none for this world";
  export const POSTER_CHOICE = "A poster plate";
  export const POSTER_TAIL = "The chart is pulled only as the engraving.";
  export const ROAD_TAIL = "The road is pressed either way.";
  export function pressesFor(pressing: Pressing): readonly PosterPreset[]   // road: ROAD_PRESETS; poster: [CHART_PRESET, ...POSTER_PRESETS]
  export const pressVerb = (preset: PosterPreset): string => `${preset.width} px`;
  export const pressingLabel = (pressing: Pressing): string               // road: ROAD_CHOICE; poster: POSTER_CHOICE
  export const caveatTail = (pressing: Pressing): string                  // road: ROAD_TAIL; poster: POSTER_TAIL
  export function roadChoice(state: RoadState): { readonly text: string; readonly disabled: boolean }  // pending: ROAD_CHOICE, true; drawn: ROAD_CHOICE, false; none: ROAD_NONE, true
  export interface RoadAnswer { readonly fromIdx: number; readonly options: ReadonlyArray<{ readonly kind: string }> }
  export function roadOnOffer(answer: RoadAnswer): boolean                // answer.options[answer.fromIdx]?.kind === "capital"
  export const roadTitle = (fromName: string, toName: string): string => `The Road from ${fromName} to ${toName}`;
  export const roadLine = (fromName: string, toName: string): string => `the road from ${fromName} to ${toName}`;
  export function roadAtWidth(svg: string, widthPx: number): string
  export const roadFilename = (seed: number, dress: string, width: number): string => `vellum-road-${seed}-${dress}-${width}.svg`;
  export const roadPngFilename = (seed: number, dress: string, outWidth: number): string => `vellum-road-${seed}-${dress}-${outWidth}.png`;
  ```
  `roadAtWidth`'s body: `const root = /^<svg\b[^>]*>/.exec(svg)`; the box `/\sviewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(root[0])`; either missing throws `new Error("the road's plate carries no viewBox to size it by")`; `height = Math.round(((boxH * widthPx) / boxW) * 100) / 100`; the root's first ` width="..."` and first ` height="..."` (each `/\swidth="[^"]*"/` and `/\sheight="[^"]*"/`, no global flag) replaced by ` width="${widthPx}"` and ` height="${height}"`; return the new root plus `svg.slice(root[0].length)`.
- **`src/site/print-room/order-counter.ts`** (DOM, about 330 lines, every function under 50): the legend row's counter. Header, one line: `// The Print Room's order counter: the head's two dropdowns, the four presses and the line under them; it presses a poster through the shared worker, or the road from the capital the room asked for when the proof landed, and keeps the head in step with whatever is on the sheet.` Contents, in this order:
  1. Imports: `runJob, type DrawResult` from `../explorer/worker-client.ts`; `POSTER_PRESETS, CHART_PRESET, clampPosterWidth, posterFilename, posterPngFilename, chartFilename, type PosterPreset` from `./poster-presets.ts`; `rasterizeSvg, type RasterizeResult` from `../shared/rasterize.ts`; `plateDressFor, type ProspectDress` from `../../prospect/dress/context.ts`; `plateAspect` from `./plate-aspect.ts`; `turnToSection, type PosterBasis, type SheetFace` from `./bound-atlas.ts`; everything `road-press.ts` exports that the bodies below name; `errorText` from `../shared/error-text.ts`; `$` from `../shared/by-id.ts`; `downloadBlob` from `../shared/object-url.ts`; `type StyleName` from `../../render/style.ts`.
  2. The `declare global` block for `__vellumLastPoster` and `__vellumLastPng`, moved verbatim from `app.ts` (lines 49 to 60).
  3. `export interface CounterHost { readonly basis: () => PosterBasis | null; readonly drawing: () => boolean; readonly face: SheetFace; }` and `interface Road { readonly svg: string; readonly href: string; readonly title: string; readonly line: string; readonly dress: ProspectDress; readonly seed: number; }`.
  4. DOM handles: `posterStatus`, `plateButtons`, `formatSel` (with its comment) and `presetByKey` (with its comment) moved from `app.ts` lines 88 to 92; `const pressingSel = $<HTMLSelectElement>("pr-pressing");`, `const roadOption = pressingSel.querySelector<HTMLOptionElement>('option[value="road"]')!;`, `const legendNav = document.querySelector<HTMLElement>("nav.legend")!;`, `const legendRow = legendNav.querySelector<HTMLElement>(".legend-row")!;`, `const noteTail = $("pr-note-tail");`.
  5. State: `let host: CounterHost = { basis: () => null, drawing: () => false, face: { showProof: () => {}, showPlate: () => {}, showMatter: () => {} } };`, `ordering` and `posterGen` moved from `app.ts` lines 115 and 116 with their comments, `let roadGen = 0;`, `let road: Road | null = null;`, `let roadState: RoadState = "pending";`, `let pressing: Pressing = "poster";`.
  6. `export function refreshOrderControls(): void`: `app.ts`'s, its comment kept, `posterBasis`/`drawing` read as `host.basis()`/`host.drawing()`, and one more line, `pressingSel.disabled = host.drawing();`.
  7. `export function clearPosterStatus(): void { posterStatus.textContent = ""; }`.
  8. `function paintRoadChoice(): void { const choice = roadChoice(roadState); roadOption.textContent = choice.text; roadOption.disabled = choice.disabled; }`.
  9. `export function dropRoad(): void`: `roadGen++;` revoke `road.href` when `road` is not null; `road = null; roadState = "pending"; paintRoadChoice();`.
  10. `export function askRoad(basis: PosterBasis): void`: `const myGen = ++roadGen; const dress = plateDressFor(basis.style);` then `runJob({ kind: "ribbon", seed: basis.seed, overrides: basis.overrides, from: null, to: null, dress })`, `.then((res) => { if (myGen !== roadGen) return; if (roadOnOffer(res)) road = { svg: res.svg, href: URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" })), title: roadTitle(res.fromName, res.toName), line: roadLine(res.fromName, res.toName), dress, seed: basis.seed }; roadState = road === null ? "none" : "drawn"; paintRoadChoice(); })`, `.catch(() => { if (myGen !== roadGen) return; roadState = "none"; paintRoadChoice(); })`.
  11. `export function sheetShows(shown: Pressing): void`: `pressing = shown === "road" && road !== null ? "road" : "poster"; pressingSel.value = pressing;` then for each of `plateButtons` at index `i`, with `const preset = pressesFor(pressing)[i]!`: `b.dataset.poster = preset.key`, `.verb`'s text `pressVerb(preset)`, `.room`'s text `preset.label`; then `const label = pressingLabel(pressing);` set as `aria-label` on `legendNav` and on `legendRow`; `noteTail.textContent = caveatTail(pressing);`; `refreshOrderControls();`.
  12. `function layRoad(): void`: `if (road === null) return;` then `host.face.showPlate({ href: road.href, title: road.title, line: road.line, section: "ribbon", aspect: plateAspect(road.svg) });`.
  13. `function choosePressing(): void`: `if (!ordering) posterStatus.textContent = "";` then `if (pressingSel.value === "road") { if (!turnToSection("ribbon")) layRoad(); } else if (!turnToSection("hero")) host.face.showProof();`.
  14. `downloadSvg`, `selectedFormat`, `orderShape`, `pullSvg`, `pressPng`, `orderSettled`, `orderPoster`: moved verbatim from `app.ts` lines 249 to 359, comments included, every `posterBasis` read as `host.basis()` and every `drawing` as `host.drawing()` (in `orderPoster`: `if (!preset || ordering || host.drawing() || !host.basis()) return;` and `const basis = host.basis()!;` in place of the two lines that read the module variables).
  15. `function pullRoad(svg: string, held: Road, preset: Readonly<PosterPreset>): void`: `const filename = roadFilename(held.seed, held.dress, preset.width); downloadSvg(svg, filename); window.__vellumLastPoster = { svg, filename, width: preset.width, seed: held.seed, style: held.dress }; posterStatus.textContent = \`${preset.label} plate pulled: ${filename}\`;`.
  16. `function pressRoadPng(png: Readonly<RasterizeResult>, held: Road, preset: Readonly<PosterPreset>): void`: `pressPng`'s body with `roadPngFilename(held.seed, held.dress, png.width)` for the name and `held.seed`, `held.dress` for `seed` and `style` in `__vellumLastPng`, the same two status templates.
  17. `function orderRoad(key: string): void`:
      ```ts
      const preset = ROAD_PRESETS.find((p) => p.key === key);
      const held = road;
      if (!preset || !held || ordering || host.drawing() || !host.basis()) return;
      const format = selectedFormat();
      const myGen = ++posterGen;
      ordering = true;
      refreshOrderControls();
      posterStatus.textContent = `The press is rolling at ${preset.width}px…`;
      Promise.resolve()
        .then(async () => {
          const svg = roadAtWidth(held.svg, preset.width);
          if (myGen !== posterGen) return;
          if (format === "svg") {
            pullRoad(svg, held, preset);
            return;
          }
          const scale = format === "png2" ? 2 : 1;
          let png;
          try {
            png = await rasterizeSvg(svg, { scale });
          } catch (err) {
            if (myGen !== posterGen) return;
            posterStatus.textContent = errorText(err);
            return;
          }
          if (myGen !== posterGen) return;
          pressRoadPng(png, held, preset);
        })
        .catch((err: unknown) => {
          if (myGen !== posterGen) return;
          posterStatus.textContent = "The press jammed: " + errorText(err);
        })
        .finally(() => orderSettled());
      ```
  18. `function orderAt(key: string): void { if (pressing === "road") orderRoad(key); else orderPoster(key); }`.
  19. `export function initOrderCounter(counterHost: CounterHost): void`: `host = counterHost;` the format select's change listener moved from `app.ts` lines 244 to 247 with its comment; `pressingSel.addEventListener("change", choosePressing);`; `for (const b of plateButtons) b.addEventListener("click", () => { const key = b.dataset.poster as string; orderAt(key); });`.
  Every call of a function this file declares and does not export passes arguments named as that function's parameters (`vellum/split-arguments-by-name`), the one excused call being the moved `downloadSvg(res.svg, filename)`.
- **`test/print-room/road-press.test.ts`**: U1 to U6 under **Tests**.
- **`e2e/suites/print-room/road.ts`**: PR41 to PR49 under **Tests**, exporting `prRoadUnbound(k: PrintRoomKit)`, `prRoadBound(ctx: SuiteContext)` and `pr49NoRoad(ctx: SuiteContext)`.

**Edited:**

- **`src/site/print-room/app.ts`** (392 lines, about 290 after):
  - Imports: from `./poster-presets.ts` keep `clampPosterWidth` alone; drop the `rasterizeSvg` import and the `downloadBlob` import; `./bound-atlas.ts` becomes `initBoundAtlas, clearBoundAtlas, enableBind, type PosterBasis, type SheetFace`; `./seats.ts` adds `turnedAspect`; add `import { askRoad, clearPosterStatus, dropRoad, initOrderCounter, refreshOrderControls, sheetShows } from "./order-counter.ts";`. The `declare global` block loses `__vellumLastPoster` and `__vellumLastPng`.
  - `const sheet = bindPrintRoom(furniture, () => matterAspect(furniture) ?? turnedAspect(furniture));`, and directly after it:
    ```ts
    const face: SheetFace = {
      showProof: () => {
        showProof(furniture);
        sheet.rebase();
        sheet.room.layout();
        sheetShows("poster");
      },
      showPlate: (plate) => {
        showPlate(furniture, plate);
        sheet.rebase();
        sheet.room.layout();
        sheetShows(plate.section === "ribbon" ? "road" : "poster");
      },
      showMatter: (matter) => {
        showMatter(furniture, matter);
        sheet.rebase();
        sheet.room.layout();
        sheetShows("poster");
      },
    };
    ```
  - Deleted: lines 88 to 92 (moved), 115 and 116 (moved), 122 to 127 (moved), 244 to 361 (moved).
  - `keepProof`: after `enableBind();`, `askRoad(posterBasis);`.
  - `draw()`: `dropRoad();` directly before `clearBoundAtlas();`; the line `posterStatus.textContent = ""; // a new proof clears any stale poster-order status` becomes `clearPosterStatus(); // a new proof clears any stale poster-order status`; in `.catch`, after `enableBind();`, `if (posterBasis !== null) askRoad(posterBasis);`.
  - Before `initBoundAtlas(...)`: `initOrderCounter({ basis: () => posterBasis, drawing: () => drawing, face });`, and the inline face object passed to `initBoundAtlas` is replaced by `face` (its comment line above it kept).
- **`src/site/print-room/seats.ts`** (115 lines): `import type { PlateSection } from "../../atlas/document.ts";`; `Plate` gains `readonly section: PlateSection;` and `readonly aspect: number | null;`; `showPlate` first writes `roomEls.turned.dataset.aspect = plate.aspect === null ? "" : String(plate.aspect);`; add after `matterAspect`:
  ```ts
  export function turnedAspect(roomEls: RoomFurniture): number | null {
    if (roomEls.turned.hidden) return null;
    const a = Number(roomEls.turned.dataset.aspect);
    return Number.isFinite(a) && a > 0 ? a : null;
  }
  ```
- **`src/site/print-room/bound-atlas.ts`** (PR1's, 281 lines, about 284 after): delete `export function sheetAspect()`; in `turnTo`, `face.showPlate({ href: b.plate.href, title: b.plate.title, line: plateLine(b.section, b.plate.title, b.ordinal), section: b.section, aspect: b.aspect });`; add directly after `turnTo` (before `bindAtlas`, which `test/site/print-room-room.test.ts`'s PRR6 slices to):
  ```ts
  export function turnToSection(section: PlateSection): boolean {
    const b = [...plates.values()].find((p) => p.section === section);
    if (!b) return false;
    turnTo(b.plate.key);
    return true;
  }
  ```
- **`src/site/print-room/poster-presets.ts`**: the header's "app.ts does the worker and download wiring" becomes "`src/site/print-room/order-counter.ts` does the worker and download wiring".
- **`src/pages/print-room/index.astro`**, the legend row (lines 84 to 93 at main; PR1 edits only the slip's intro above it):
  ```astro
  <Fragment slot="head"><span class="pressed"><select id="pr-pressing" aria-label="What the presses pull">
      <option value="poster" selected>A poster plate</option>
      <option value="road" disabled>The road from the capital</option>
    </select> pressed as
    <select id="pr-format" aria-label="Pressed as">
      ...the three options unchanged...
    </select></span></Fragment>
  <p class="legend-note" slot="note">The engraving is exact at any size; an impression is pressed with your
  device's fonts, and a large one is fitted to what your browser can hold.
  <span id="pr-note-tail">The chart is pulled only as the engraving.</span></p>
  ```
  The `LegendRow` props, the four press buttons and the gold road are unchanged.
- **`src/styles/print-room/index.css`** (480 lines, unchanged count): `.legend-head select`'s `font-size: 0.86rem;` becomes `font-size: 1rem;`; in the `@media print` block, `#pr-turned { display: none; }` becomes `#pr-turned { position: static; height: auto; }` (specificity 1,0,0, later than the base rule's 1,0,0 arm, so it wins position and height; `#pr-turned[hidden]` at 1,1,0 still hides it unshown; `body.has-atlas .stage` still hides the stage bound).
- **`scripts/lint/split-arguments.ts`**: `SPLIT_FILES` gains `"src/site/print-room/order-counter.ts"` directly after `"src/site/print-room/app.ts"`; in `OLDER_CALLS` the `"src/site/print-room/app.ts"` entry is deleted and `"src/site/print-room/order-counter.ts": ["downloadSvg(res.svg, filename)", "orderPoster(b.dataset.poster as string)"],` takes its place at commit 3, where the click listener moves verbatim; at commit 5 the listener becomes `orderAt(key)` and the entry keeps `"downloadSvg(res.svg, filename)"` alone (the rule reds an excuse whose call is gone).
- **`e2e/suites/print-room.ts`**: import `prRoadUnbound, prRoadBound, pr49NoRoad` from `./print-room/road.ts`; after `await pr17Png(k);`, `await step("PR41, PR42, PR43, PR44, PR45, PR46", () => prRoadUnbound(k));`; in `boundAndPaper`, after `await pr34Leaned(ctx);`, `await step("PR47, PR48", () => prRoadBound(ctx));`; after `await step("PRW8", () => prwCountType(ctx));`, `await step("PR49", () => pr49NoRoad(ctx));`.
- **`e2e/suites/print-room/room.ts`**: PR36 extended, under **Tests**.
- **`e2e/support/runner-layout.ts`** and **`test/e2e/runner-layout.test.ts`**: the staged `.legend-head select` height re-measured, commit 6.
- **`handbook/specs/ui-design.md`**, the bullet opening "A control a reader types into": the bold lead becomes "**A control a reader types into, a field or a select, does not go below a 16px font in the corner chrome, in the legend row's head or on the Broadside's slip**", its parenthesis gains "; the legend row's head, Issue #433 comment 6620144566", and its first sentence ends "...are held to it by `BR21` in `e2e/suites/broadside/dress.ts`, and the Print Room's two dropdowns by `PR36` in `e2e/suites/print-room/room.ts`." Issue #1229's branch edits a different paragraph of this file (motion); edit this bullet's lines alone.

**Not edited:** `src/site/explorer/` (the job and both transports), `src/itinerary/`, `src/atlas/`, `src/prospect/`, `src/site/print-room/contents-markup.ts`, `plate-numbers.ts`, `matter-markup.ts`, `e2e/suites/print-room/atlas.ts`, any `src/site/ribbon/` file, `test/repo/constant-contracts.test.ts`, `test/site/astro-scaffold.test.ts` (`LEGENDS` reads the authored nav and row labels, unchanged, and its head and note regexes take any content), `test/e2e/lane-timings.test.ts` (no pull request re-times a suite). Shared with a parallel lane: `handbook/specs/ui-design.md` (Issue #1229, another paragraph); nothing else. `src/styles/print-room/index.css` stays 480 lines: the 400-line bar is the TypeScript lint's (`max-lines` in `eslint.config.ts`), and the house's sheets run past it (`src/styles/shared/atelier.css` 859, `src/styles/index.css` 825).

## Tests, in the order they are written

**Unit, `test/print-room/road-press.test.ts`, commit 1, against this stub of `road-press.ts`** (right shapes, wrong behaviour): `ROAD_PRESETS` is `[CHART_PRESET, ...POSTER_PRESETS]`; `pressesFor` returns `[CHART_PRESET, ...POSTER_PRESETS]` for both; `pressingLabel` and `caveatTail` return the poster's words for both; `roadChoice` returns `{ text: ROAD_CHOICE, disabled: false }` for every state; `roadOnOffer` returns `true`; `roadTitle`, `roadLine` return `""`; `roadAtWidth` returns `svg`; `roadFilename` and `roadPngFilename` return `""`. The constants carry their real words. The prover (`vellum-guard-prover`) owes U1 to U6, one round, after commit 5 is pushed.

- **U1** "the road's four presses are Ribbon 1060, Desk 2400, Wall 3300 and Grand 4200, the smallest the Ribbon room's own plate (Issue #433 rulings 2 and 4), outside the poster clamp": `ROAD_PRESETS.map((p) => [p.key, p.label, p.width])` deep-equals `[["ribbon","Ribbon",1060],["desk","Desk",2400],["wall","Wall",3300],["grand","Grand",4200]]`; `ROAD_PRESETS[0]!.width === RIBBON_W` (`src/itinerary/finished.ts`); `pressesFor("road")` is `ROAD_PRESETS`; `pressesFor("poster")` deep-equals `[CHART_PRESET, ...POSTER_PRESETS]`; both have length 4; `!POSTER_PRESETS.some((p) => p.key === "ribbon")`. Red on the stub's first deep-equal. Mutation: the Ribbon's width 1500.
- **U2** "roadAtWidth leaves the plate byte for byte at its own 1060 and rewrites only the root's width and height above it": `svg = ribbonResultFor(generateWorld(defaultRecipe(42)), { from: null, to: null, dress: "antique" }).svg`; `roadAtWidth(svg, 1060) === svg`; for 4200, `out.slice(0, out.indexOf(">") + 1)` includes `' width="4200" height="2932.08" viewBox="0 0 1060 740"'` and `out.slice(out.indexOf(">")) === svg.slice(svg.indexOf(">"))`; `readSvgSize(roadAtWidth(svg, 2400))` deep-equals `{ width: 2400, height: 1675.47 }`; on the fixture `'<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="740" viewBox="0 0 1060 740"><rect width="10" height="20" stroke-width="2"/></svg>'` at 2120 the result is `'<svg xmlns="http://www.w3.org/2000/svg" width="2120" height="1480" viewBox="0 0 1060 740"><rect width="10" height="20" stroke-width="2"/></svg>'`; `assert.throws(() => roadAtWidth("<svg/>", 2400), /no viewBox/)`. Red on the 4200 root. Mutations: the height kept at 740; the replace made global (the rect's width and height move).
- **U3** "roadOnOffer offers the road only from a capital the roads leave, the atlas's own answer (engine-invariants: a ribbon result substitutes a refused departure)": seed 42: `roadOnOffer(ribbonResultFor(w42, bare))` is `true` and `defaultJourney(w42) !== null`. No capital: `noCap = { ...w42, settlements: w42.settlements.map((s) => (s.kind === "capital" ? { ...s, kind: "town" as const } : s)) }`; preconditions `noCap.settlements.findIndex((s) => s.kind === "capital") === -1`, `res.fromIdx === 0` and `res.options[0]!.kind !== "capital"` for `res = ribbonResultFor(noCap, bare)`; then `roadOnOffer(res) === false` and `defaultJourney(noCap) === null`. A road-less capital, the address's own world: `w1 = generateWorld(defaultRecipe(1, { mapType: "archipelago", islands: 100 }))`; precondition `roadReachable(w1, roadMask(w1), capital).length === 0` (measured: capital 0, 0 reachable); `assert.throws(() => ribbonResultFor(w1, bare), /no road leaves this place/)` (the rejection the counter reads as no road) and `defaultJourney(w1) === null`. Red on the no-capital witness. Mutation: `roadOnOffer` answering `answer.options.length > 0`.
- **U4** "the head's road option opens once the road is drawn, stays closed while the answer is out, and says why when the capital has none": `roadChoice("pending")` is `{ text: "The road from the capital", disabled: true }`, `"drawn"` `{ text: "The road from the capital", disabled: false }`, `"none"` `{ text: "The road from the capital: none for this world", disabled: true }`. Red on pending. Mutation: `"none"` answering `ROAD_CHOICE`.
- **U5** "the road's names: its title the atlas's, its folio line the bound page's without the plate number, its files by seed, dress and width": `roadTitle(res.fromName, res.toName) === ribbonPlates(w42, "antique")[0]!.title` (PR1's composer, "The Road from Laukuwelua to Homaitani"); `plateLine("ribbon", roadTitle("Laukuwelua", "Homaitani")) === "plate ix of the bound atlas · " + roadLine("Laukuwelua", "Homaitani")`; `roadLine("Laukuwelua", "Homaitani") === "the road from Laukuwelua to Homaitani"`; `roadFilename(42, "antique", 1060) === "vellum-road-42-antique-1060.svg"`; `roadPngFilename(42, "ink", 5863) === "vellum-road-42-ink-5863.png"`. Red on the title. Mutation: `roadLine` capitalised.
- **U6** "the head and the caveat name what is pressed": `pressingLabel("poster") === "A poster plate"`, `pressingLabel("road") === "The road from the capital"`, `caveatTail("poster") === "The chart is pulled only as the engraving."`, `caveatTail("road") === "The road is pressed either way."` (Alex, issuecomment-6620828024). Red on the road label. Mutation: the two tails swapped.

U2, U3 and U5 generate seed 42's world once in a `before` (about 0.4 s) and seed 1's counted archipelago once (0.35 s measured).

**Browser checks, written in commit 5.** Readings taken on the site `npm run build` made in this planner's tree at bc72cc6ff67a36a3b95e07066dd0b2223704d9a5 (pull request 1 merged, so the bound atlas carries row ix), by `out/433-dry-run/433-pr2-probe.ts` (command `node out/433-dry-run/433-pr2-probe.ts > out/433-dry-run/433-pr2-probe.log`, exit 0), which drives the built site through `start` in `e2e/harness.ts` in the harness's own window and stages each fixture in the page (the head's select inserted as the plan writes it, the 16 px rule and the planned print rule injected, the road's own plate laid on `#pr-turned` with its aspect carried through `#pr-page`'s `data-aspect`, as the designer's round staged it). The probe and its log go to the main checkout's `out/433-dry-run/` beside pull request 1's when the dispatcher retires this tree. Main IS every check's mutation reading where no other is named. Every check asserts on one instance, seed 42's room unless named.

Shared constants in `road.ts`: `PLATE_ASPECT = 1060 / 740`; `CHART_ASPECT = 1500 / 1157.931` (PR31b's); `ROAD = "the road from Laukuwelua to Homaitani"`; `ROAD_PRESSES = [["ribbon","1060 px","Ribbon"],["desk","2400 px","Desk"],["wall","3300 px","Wall"],["grand","4200 px","Grand"]]`; `POSTER_PRESSES = [["chart","1500 px","Chart"],["desk","2400 px","Desk"],["wall","3300 px","Wall"],["grand","4200 px","Grand"]]`; the 0.01 tolerance on an aspect is PR31's. The reads, each written with `String.raw`:

```js
// COUNTER
(() => { const t = (e) => e ? e.textContent.replace(/\s+/g, " ").trim() : null; const sel = document.getElementById("pr-pressing"), s = document.getElementById("sheet").getBoundingClientRect(), tu = document.getElementById("pr-turned"), nav = document.querySelector("nav.legend"), row = nav.querySelector(".legend-row");
  return { value: sel ? sel.value : null, ratio: s.width / s.height, turned: !tu.hidden && /^blob:/.test(tu.src), proofHidden: document.getElementById("pr-preview").hidden, line: t(document.getElementById("pr-plate-line")), presses: [...row.querySelectorAll("[data-poster]")].map((b) => [b.dataset.poster, t(b.querySelector(".verb")), t(b.querySelector(".room"))]), nav: nav.getAttribute("aria-label"), row: row.getAttribute("aria-label"), note: t(nav.querySelector(".legend-note")), on: (document.querySelector("#pr-contents li.on .cr-num") || { textContent: null }).textContent, here: (document.querySelector("#pr-contents .plates figure.here") || { dataset: {} }).dataset.plate || null }; })()
// ROAD_READY (a readiness wait, throws on timeout inside the step)
(() => { const o = document.querySelector('#pr-pressing option[value="road"]'); return !!o && !o.disabled; })()
// choose(value): wiring, not the claim
(() => { const s = document.getElementById("pr-pressing"); s.value = "<value>"; s.dispatchEvent(new Event("change")); return true; })()
// PRINT
(() => { const cs = (e) => getComputedStyle(e), tu = document.getElementById("pr-turned"); return { stage: cs(document.querySelector(".stage")).display, turned: cs(tu).display, pos: cs(tu).position, h: Math.round(tu.getBoundingClientRect().height), w: Math.round(tu.getBoundingClientRect().width), proof: cs(document.getElementById("pr-preview")).display, atlasEmpty: document.getElementById("pr-atlas").children.length === 0 }; })()
// ROAD_OPTION
(() => { const o = document.querySelector('#pr-pressing option[value="road"]'); return o ? { disabled: o.disabled, text: o.textContent, value: document.getElementById("pr-pressing").value } : null; })()
```

Each `choose(...)` and each press `.click()` carries one line at the check: `// Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it (a press is clicked as PR12 does); the claim is what the room lays on the sheet and presses.`

`prRoadUnbound(k)`, its step "PR41, PR42, PR43, PR44, PR45, PR46", seed 42 antique on the desk after PR17, format left at png2 by PR19:

- **PR41** "the head lays the road from the capital on the sheet and the four presses take its sizes (Issue #433 rulings 1, 2 and 4): the sheet at the road's own 1060 by 740, the folio's line names the road, Ribbon 1060 then Desk, Wall and Grand, the row named for the road, the caveat's last sentence the road's". Settle `ROAD_READY` true (the suite's default budget, 120 tries at 50 ms), `choose("road")`, read `COUNTER`. Assert `value === "road"`, `Math.abs(ratio - PLATE_ASPECT) < 0.01`, `turned`, `proofHidden`, `line === ROAD`, `presses` same as `ROAD_PRESSES`, `nav` and `row` both `"The road from the capital"`, `note.endsWith(" The road is pressed either way.")`.
  - Fixture reading (seat A staged with the road chosen): `{"value":"road","ratio":1.4324412355463874,"turned":true,"proofHidden":true,"line":"the road from Laukuwelua to Homaitani","presses":[["ribbon","1060 px","Ribbon"],["desk","2400 px","Desk"],["wall","3300 px","Wall"],["grand","4200 px","Grand"]],"nav":"The road from the capital","row":"The road from the capital","note":"...hold. The road is pressed either way."}`: passes, the ratio 0.00001 from 1060/740.
  - Mutation reading, main: `value` null, ratio 1.295226408148239, `turned` false, presses the chart's: fails.
  - Mutation reading, the head reading road with nothing laid (the select staged at road, no change handled): `value` "road", ratio 1.2952, `turned` false, presses the chart's, `nav` "A poster plate": fails.
- **PR42** "with the road on the sheet and nothing bound, print is the road: the stage in flow, the road at its own proportion, the proof and the document as nothing". Settle `(() => { const t = document.getElementById("pr-turned"); return !t.hidden && t.complete && t.naturalWidth > 0; })()` true, `send("Emulation.setEmulatedMedia", { media: "print" })`, read `PRINT`, `send("Emulation.setEmulatedMedia", { media: "" })`. Assert `stage !== "none"`, `turned === "block"`, `pos === "static"`, `h > 0`, `Math.abs(w / h - PLATE_ASPECT) < 0.01`, `proof === "none"`, `atlasEmpty`.
  - Fixture reading (the planned print rule injected): `{"stage":"block","turned":"block","pos":"static","h":894,"w":1280,"proof":"none","atlasEmpty":true}`: passes (1280/894 is 1.4318, 0.0006 from 1060/740).
  - Mutation reading, main's print rule: `{"stage":"block","turned":"none","pos":"absolute","h":0,"w":0,...}`: fails.
- **PR43** "the Ribbon press pulls the road on the sheet byte for byte as the engraving, named for the road": evaluate `(() => { document.getElementById("pr-format").value = "svg"; window.__vellumLastPoster = undefined; const b = document.querySelector('[data-poster="ribbon"]'); if (!b) return false; b.click(); return true; })()`; when it returns true, settle `!!window.__vellumLastPoster` true; then the async read (evaluate with `true`) `(async () => { const p = window.__vellumLastPoster; if (!p) return null; const sheet = await (await fetch(document.getElementById("pr-turned").src)).text(); return { filename: p.filename, width: p.width, same: p.svg === sheet, status: document.getElementById("pr-poster-status").textContent, open: !document.querySelector('[data-poster="ribbon"]').disabled }; })()`. Assert the setter returned true, `filename === "vellum-road-42-antique-1060.svg"`, `width === 1060`, `same`, `status === "Ribbon plate pulled: vellum-road-42-antique-1060.svg"`, `open`.
  - Fixture reading: UNVERIFIABLE: only the change's order path writes `__vellumLastPoster` for a road, and no probe can stage an order without source.
  - Mutation reading, main: `[data-poster="ribbon"]` is absent (`{"mainRibbonPress":null}` in the log), the setter returns false: fails.
- **PR44** "the road honours the PNG format: the Ribbon press's impression is 1060 by 740 (the Chart's SVG-only posture is set aside for the road, Issue #433 ruling of 2026-10-20)". `const png = await k.orderPng("png1", "ribbon")`. Assert `png.type === "image/png"`, `png.width === 1060`, `png.height === 740`, `png.clamped === false`, `png.filename === "vellum-road-42-antique-1060.png"`, `png.status === "Ribbon plate pressed: vellum-road-42-antique-1060.png"`.
  - Fixture reading: UNVERIFIABLE, for PR43's reason.
  - Mutation reading, main: the press is absent and `orderPng`'s setter throws on `null.click()`: the step reds as "PR41, PR42, PR43, PR44, PR45, PR46 never reached its assertion".
- **PR45** "the Grand press pulls the same drawing at 4200: only the root's width and height change". Evaluate `(() => { document.getElementById("pr-format").value = "svg"; window.__vellumLastPoster = undefined; document.querySelector('[data-poster="grand"]').click(); return true; })()`, settle `!!window.__vellumLastPoster` true, async read `(async () => { const p = window.__vellumLastPoster, sheet = await (await fetch(document.getElementById("pr-turned").src)).text(); return { filename: p.filename, width: p.width, root: p.svg.slice(0, p.svg.indexOf(">") + 1), rest: p.svg.slice(p.svg.indexOf(">")) === sheet.slice(sheet.indexOf(">")) }; })()`. Assert `filename === "vellum-road-42-antique-4200.svg"`, `width === 4200`, `root.includes(' width="4200" height="2932.08" viewBox="0 0 1060 740"')`, `rest`.
  - Fixture reading: UNVERIFIABLE, for PR43's reason.
  - Mutation reading, main: the Grand press pulls the chart's poster (`vellum-poster-42-antique-4200.svg`): fails.
- **PR46** "the head back to a poster plate puts the proof on the sheet and the presses back to the chart's sizes, the row and the caveat the poster's". `choose("poster")`, read `COUNTER`. Assert `value === "poster"`, `Math.abs(ratio - CHART_ASPECT) < 0.01`, `!turned`, `!proofHidden`, `line === ""`, `presses` same as `POSTER_PRESSES`, `nav` and `row` both `"A poster plate"`, `note.endsWith(" The chart is pulled only as the engraving.")`.
  - Fixture reading (seat A on arrival, the poster chosen): `{"value":"poster","ratio":1.295226408148239,"turned":false,"proofHidden":false,"line":"","presses":[["chart","1500 px","Chart"],...],"nav":"A poster plate","row":"A poster plate","note":"...hold. The chart is pulled only as the engraving."}`: passes, 0.0002 from the chart's aspect.
  - Mutation reading, the head set back with the road left on the sheet: `value` "poster", ratio 1.4324, `turned` true, presses the road's, `nav` "The road from the capital": fails.

`prRoadBound(ctx)`, its step "PR47, PR48", after PR34 (the atlas bound, the vegetation survey turned, the camera at rest):

- **PR47** "turning the bound atlas's road page sets the head and the presses to the road, and turning another page sets them back (Issue #433 ruling 3)". Read A: click `#pr-contents .plates figure[data-plate="ribbon-capital"] .thumb` (null when absent: the read returns null) and read `COUNTER` in the same evaluate. Read B: the same with `#pr-contents .turn[data-plate="theme-climate"]`. Assert A: `value === "road"`, `presses` same as `ROAD_PRESSES`, `line === "plate ix of the bound atlas · " + ROAD`, `on === "ix"`, `Math.abs(ratio - PLATE_ASPECT) < 0.01`; B: `value === "poster"`, `presses` same as `POSTER_PRESSES`, `on === "iv"`.
  - Fixture reading: UNVERIFIABLE: the switch is a movement only the change drives (the face's `showPlate` handing `section` to `sheetShows`).
  - Mutation reading, main (the harness window; 1280 by 800 and 1024 by 768 read the same but for the ratio's fourth decimal): A `{"value":null,"ratio":1.4324412355463874,"turned":true,"line":"plate ix of the bound atlas · the road from Laukuwelua to Homaitani","presses":[["chart","1500 px","Chart"],...],"on":"ix","here":"ribbon-capital"}`, B `{"value":null,"line":"plate iv of the bound atlas · a thematic survey of temperature","presses":[["chart",...]],"on":"iv","here":"theme-climate"}`: fails on `value` and A's presses. The fixture carries the rest of what the check reads: row ix's thumbnail turns the road page at 0.00001 from 1060/740 under its plate line.
- **PR48** "while the atlas is bound, the head turns it: the road to row ix, a poster plate back to plate i". `choose("road")`, read `COUNTER` (C); `choose("poster")`, read `COUNTER` (D). Assert C: `value === "road"`, `on === "ix"`, `here === "ribbon-capital"`; D: `value === "poster"`, `on === "i"`, `/^plate i of the bound atlas · /.test(line)`.
  - Fixture reading: UNVERIFIABLE, for PR47's reason.
  - Mutation reading, main: `#pr-pressing` is absent and `choose` throws on `null.value`: the step reds as "PR47, PR48 never reached its assertion". The fixture carries the rest: turned from the contents at main, row ix reads `on` "ix", `here` "ribbon-capital", and row i reads `on` "i", the line "plate i of the bound atlas · the world chart, drawn in the antique manner".
  The step leaves plate i turned, the head at a poster plate, which is the state a bind leaves; `print-room-bound.png`, PR21 and every later bound check read the atlas, not the turned page.

`pr49NoRoad(ctx)`, its step "PR49", after PRW8:

- **PR49** "a world whose capital has no road never offers it: the head's road option stays closed and says so (engine-invariants: a surface offering the road from X checks X has a road)". `bounce(ctx.send, \`http://127.0.0.1:${ctx.PORT}/print-room/#seed=1&style=antique&type=archipelago&islands=100\`)`; settle the proof (`window.__vellumPrintRoomState().seed === 1`, `#pr-status` empty, the Grand press open; prbBare's budget, 160 tries at 50 ms) and the answer (`ROAD_OPTION` not null and not `text === "The road from the capital" && disabled`); the witness (evaluate with `true`) `(async () => { const g = await import("/explorer/engine/world/generate.js"); const j = await import("/explorer/engine/site/explorer/ribbon-job.js"); const w = g.generateWorld(g.defaultRecipe(1, { mapType: "archipelago", islands: 100 })); try { j.ribbonResultFor(w, { from: null, to: null, dress: "antique" }); return { threw: false }; } catch (e) { return { threw: true, message: e.message }; } })()`; read `ROAD_OPTION`. Assert `witness.threw`, `/no road leaves this place/.test(witness.message)`, `option.disabled`, `option.text === "The road from the capital: none for this world"`, `option.value === "poster"`.
  - Fixture reading: UNVERIFIABLE (only the change writes the option). The fixture carries what the check reads: the witness read in the page at 1280 by 800 and at 1024 by 768 `{"threw":true,"message":"no road leaves this place: the survey has nothing to unroll","hash":"#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&islands=100","capital":0}`, so the address keeps `islands=100` through the room's own hash write and its capital has no road.
  - Mutation reading, main at that address: `ROAD_OPTION` null: fails.

**PR36 extended** (`e2e/suites/print-room/room.ts`, scripts off): `Legend` gains `pressing: unknown[] | null`, `fonts: (string | null)[]`, `selects: string[]`, `tail: string | null`; `LEGEND` reads `const p = document.querySelector(".legend-head #pr-pressing")`, `pressing: p && [p.getAttribute("aria-label"), [...p.options].map((o) => [o.value, text(o), o.defaultSelected, o.disabled])]`, `fonts: [p, fmt].map((s) => (s ? getComputedStyle(s).fontSize : null))`, `selects: [...document.querySelectorAll(".legend-head select")].map((s) => s.id)`, `tail: text(document.getElementById("pr-note-tail"))`; `legendFaults` gains `same(l.pressing, ["What the presses pull", [["poster", "A poster plate", true, false], ["road", "The road from the capital", false, true]]]) || "the head's own dropdown, the poster chosen and the road closed until its answer"`, `same(l.selects, ["pr-pressing", "pr-format"]) || "the head's dropdown before Pressed-as"`, `same(l.fonts, ["16px", "16px"]) || "both dropdowns at the 16px floor"`, `l.tail === "The chart is pulled only as the engraving." || "the caveat's last sentence in its own span"`. `NOTE`, `PLATES` and every other clause are unchanged. The check's name: "the legend row (Pressed-as, ..." becomes "the legend row (the head's own dropdown before Pressed-as, both at 16px, ...".
  - Fixture reading (the authored markup and the 16px rule staged with scripts off): `{"pressing":["What the presses pull",[["poster","A poster plate",true,false],["road","The road from the capital",false,true]]],"fonts":["16px","16px"],"note":"...hold. The chart is pulled only as the engraving."}`: passes.
  - Mutation reading, main: `pressing` null, `fonts` `[null,"13.76px"]`: fails.

**What each step holds and costs** (settle-doctrine, "Who finds a slow step"). "PR41, PR42, PR43, PR44, PR45, PR46" holds six claims no other check holds, on one room: not thin. "PR47, PR48" holds four (the road page sets the road, another page sets it back, the head turns to row ix, the head turns back to plate i): not thin. Each is read for its seconds from the pull request's own CI run of the print-room lane, one run. "PR49" holds one claim on one room, a navigation to a fresh world: THIN; its reading under 4 seconds passes, 4 to 20 seconds is near the line and two more runs of the lane's job started by hand give the median, over 20 seconds is too slow (a stop condition). PR36 is made longer by fields of one read already taken, so it adds no wait.

**Who proves what.** `vellum-guard-prover` owes U1 to U6, one round, after commit 5 is pushed. The browser checks are proved by the implementer on the CI proof runner (`npm run proof -- send`) before the pull request opens, selection `hunt,print-room` (print-room's `NEEDS_PREDECESSOR`), each row one find-and-replace against the pushed head, expecting exactly the checks named:

| row | file | find | replace | expect red |
|---|---|---|---|---|
| R1 | `src/site/print-room/order-counter.ts` | `legendRow.setAttribute("aria-label", label);` | (deleted) | PR41 |
| R2 | `src/styles/print-room/index.css` | `#pr-turned {\n    position: static;\n    height: auto;\n  }` | `#pr-turned {\n    display: none;\n  }` | PR42 |
| R3 | `src/site/print-room/order-counter.ts` | `const svg = roadAtWidth(held.svg, preset.width);` | `const svg = roadAtWidth(held.svg, preset.width + 1);` | PR43, PR44, PR45 |
| R4 | `src/site/print-room/order-counter.ts` | `const format = selectedFormat();\n  const myGen = ++posterGen;\n  ordering = true;\n  refreshOrderControls();\n  posterStatus.textContent = \`The press is rolling at ${preset.width}px…\`;\n  Promise` | the same with `const format = preset.key === "ribbon" ? "svg" : selectedFormat();` | PR44 |
| R5 | `src/site/print-room/order-counter.ts` | `} else if (!turnToSection("hero")) host.face.showProof();` | `} else sheetShows("poster");` | PR46, PR48 |
| R6 | `src/site/print-room/bound-atlas.ts` | `section: b.section, aspect: b.aspect` | `section: "hero", aspect: b.aspect` | PR47, PR48 |
| R7 | `src/site/print-room/order-counter.ts` | `if (!turnToSection("ribbon")) layRoad();` | `layRoad();` | PR48 |
| R8 | `src/site/print-room/order-counter.ts` | `.catch(() => {\n      if (myGen !== roadGen) return;\n      roadState = "none";` | the same with `roadState = "drawn";` | PR49 |
| R9 | `src/pages/print-room/index.astro` | `<option value="road" disabled>` | `<option value="road">` | PR36 |
| R10 | `src/styles/print-room/index.css` | `.legend-head select {\n  appearance: none;\n  -webkit-appearance: none;\n  cursor: pointer;\n  font-size: 1rem;` | the same with `font-size: 0.86rem;` | PR36 |

The find strings follow the formatted file (`npm run format`); where Prettier lays a line out otherwise, the row takes the formatted text of the same line, which is a builder's detail. A row whose ledger names a check outside its expect column is sent again with that check named only where the plan's mutation explains it (R3's PNG at 1061 px is PR44's); otherwise it is a stop condition.

## Order of commits

1. The plan archived at `handbook/plans/400/433/433-pr2-plan.md`, copied unchanged from the scratchpad, with `road-press.ts`'s stub and U1 to U6, red on their assertions. Pushed at once.
2. `road-press.ts` built: U1 to U6 green.
3. The counter leaves `app.ts`: `order-counter.ts` created with items 1 and 2, `CounterHost` (item 3, without `Road`), the moved DOM handles (item 4 without `pressingSel`, `roadOption`, `legendNav`, `legendRow` and `noteTail`, which the page does not carry until commit 5), `host`, `ordering` and `posterGen` (item 5), `refreshOrderControls` (item 6 without its `pressingSel` line), `clearPosterStatus` (item 7), the moved poster path (item 14), and `initOrderCounter` wiring the moved format listener and the moved click loop verbatim (`b.addEventListener("click", () => orderPoster(b.dataset.poster as string))`); `app.ts` slimmed to it, `initOrderCounter` called with a `face` that does what today's inline object does; `scripts/lint/split-arguments.ts`'s two lists at their commit-3 state; `poster-presets.ts`'s header. `npm run lint` and `npm test -- test/repo/split-arguments.test.ts test/site/app-bundles.test.ts` green, behaviour unchanged.
4. A turned plate carries its aspect: `seats.ts` (`Plate`'s two fields, `showPlate`'s dataset line, `turnedAspect`), `bound-atlas.ts` (`sheetAspect` deleted, `turnTo` passing `section` and `aspect`), `app.ts`'s fit reading `turnedAspect`. Behaviour unchanged.
5. The road: `index.astro`'s head and caveat span; the rest of `order-counter.ts` (`Road`, the five new DOM handles, the road state, `pressingSel`'s line in `refreshOrderControls`, items 8 to 13 and 15 to 18, and `initOrderCounter`'s head listener and `orderAt` click loop); `turnToSection` in `bound-atlas.ts`; `app.ts`'s `face` calling `sheetShows`, and `askRoad`, `dropRoad`; the final `OLDER_CALLS`; the two CSS rules; `e2e/suites/print-room/road.ts` and its wiring in `e2e/suites/print-room.ts`; PR36 extended; the `ui-design.md` bullet. The print-room suite green locally.
6. After the pull request's own CI run of the print-room lane at commit 5: the staged `.legend-head select` height re-measured. Read PR37's PASS detail line in that lane's log (`legend` `t` and `b`) and in the implementer's local `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` run at the same commit; read the Mac's `#pr-format` height in the harness window (this planner's probe read 28.375 at 16 px, 27.375 at 13.76 px, the row 150.90625 tall against main's 149.90625); the runner's select height is the Mac's less (the Mac's row height less the runner's). `RUNNER_SELECTS`' `.legend-head select` `px` takes it, its dated line rewritten in the same form ("2026-11-0x: N px shorter on the runner than the Mac harness browser's 28.375 at the 16px floor, read as PR37's Press row R px tall against the Mac's 150.90625 (CI run <id>)."), and `test/e2e/runner-layout.test.ts`'s pinned sheet string takes the new value.

## Rosters and doctrine

- **Rosters joined by hand:** `SPLIT_FILES` and `OLDER_CALLS` in `scripts/lint/split-arguments.ts` (above; `test/repo/split-arguments.test.ts` reds on an excuse for an unlisted file and on a listed file the rule does not reach); the print-room suite's step list in `e2e/suites/print-room.ts`; `RUNNER_SELECTS` in `e2e/support/runner-layout.ts` and its pin. Closing themselves: `vellum/room-no-scroll` reaches the new modules through `src/site/print-room/**` in `eslint.config.ts`; the print-room bundle takes them through `app.ts`'s imports (`test/site/app-bundles.test.ts` holds that no plate code reaches the page at load). No page, sheet, bundle, suite, lane or route is added, so no roster in `handbook/specs/site-architecture.md`'s list is joined, and `MEASURED_SECONDS` is not re-timed (no pull request re-times a suite).
- **Doctrine changed:** `handbook/specs/ui-design.md`'s 16px bullet takes the legend row's head and PR36 (above). `handbook/specs/engine-invariants.md` (the road-from-X check) and `handbook/specs/chart-dress.md` (`plateDressFor`) are met and not edited. Issue #463's ruling of 2026-08-30 lives in no spec (`git grep -n '#463' -- handbook/specs` prints nothing); its amendment lives in issuecomment-6620144566 and in PR36, and no spec line is added for one room's row.
- **Comments:** the two one-line headers of the new modules; `poster-presets.ts`'s header made true; every comment moved with its code; the wiring line at each `choose` and press click in `road.ts`. Nothing else.
- **Golden and regen:** none owed. No world chart, committed file, recipe or plate's bytes change.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/print-room/road-press.test.ts test/print-room/poster-presets.test.ts test/repo/constant-contracts.test.ts test/repo/split-arguments.test.ts test/repo/site-shape.test.ts test/site/app-bundles.test.ts test/site/astro-scaffold.test.ts test/site/print-room-room.test.ts test/site/print-room-contents.test.ts test/e2e/runner-layout.test.ts test/e2e/suite-waits.test.ts test/site/ribbon-job.test.ts`, then the whole `npm test` once, then `npm run astro:generate`.
- `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once, alone, never the full local lanes; after commit 6, `VELLUM_E2E_RUNNER_LAYOUT=1 VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once, quoting its `RUNNER LAYOUT:` line.
- The e2e suites the change touches, all run by CI: `print-room` (PR36, PR37, PR40 and PR41 to PR49), `fallback` (the inline road job), and, through the legend row's head growing a pixel at 16 px, `stage` (NS1 reads the Print Room's head over a floored sheet), `corners` and `runninghead` (they read the Print Room's row and road).
- The steps' seconds from the pull request's own CI run as **Tests** says.
- `vellum-plate-reader` is owed at step 11 (the step 6 sitting ruled from stills). It measures, against main's row as the control, at 1280 by 800 and 1024 by 768, antique and ink, on seed 42, on seed 57 (the longest road name, "The road from Cintalihaven to Velasselecove") and on the no-road address: the head on arrival and with the road chosen (both dropdowns at 16 px, its line count), the row's press lines and seat (beside at 1280, risen at 1024), the row's clearances (32, 16 and 14 px beside the folio, 12, 16 and 14 risen), the sheet with the road at 1060/740 within 0.01 and wholly inside the stage, no sideways scroll; contrast at 4.5:1 or better, by the painted ground, for the closed dropdowns' shown text, "pressed as", the Ribbon press's "1060 px" and "Ribbon", the caveat's road sentence, the folio's road line and the line under the row; a press while it rolls (every press closed, "The press is rolling at 4200px…") and the line under the row after a Ribbon SVG and after a Grand finer impression fitted to the budget, its lines and its clearance from the Glass; the bound atlas's road page at both windows; the no-road head; and the room's road printed under print emulation at a Letter page, inside the page box. The planner's own readings, which the plate read retakes on the build (`out/433-dry-run/433-pr2-probe.log`, `seats` and `words`): at 1280 by 800 the road chosen keeps the row on one line beside the folio on seed 42 (sheet 669 by 467 against the control's 606 by 468), the bound road page and seed 57 take two press lines (581 by 405), both as the ruled stills `1280-antique-A3.png` and `stress-57-1280-A2.png` show; at 1024 by 768 every arm is risen on one line (529 by 369 with the road); the clearances hold at 32, 16 and 14 beside and 12, 16 and 14 risen in every arm; no arm scrolls sideways; the head's two dropdowns read 183 and 205 px wide at 16 px, one head line; of the words read (the closed dropdowns' shown text, "pressed as", the first press's two lines, the caveat's last sentence, the folio's plate line, the line under the row), the faintest is the folio's road line at 5.34:1, bound and unbound alike (the plate line's class today), and every other reads 9.15:1 or better ("pressed as" at 1024 with the road page turned), the presses while they roll included. The open dropdown's options, the closed road option and "The road from the capital: none for this world" among them, are UNVERIFIABLE: the browser draws an open select's list as a native menu outside the page's paint, so neither this probe nor the plate read can sample it, and no rule is written for it.

## Calls made

Each taken under Alex's delegation of 2026-11-03 (issuecomment-6619124326, extended in issuecomment-6619143522), none BLOCKING: none amends a ratified ruling, none is an appearance not shown in the ruled stills except where named, and each is undone in a later pull request at no cost to a reader.

1. **The one appearance no ruled still shows: the head in a world whose capital has no road.** The closed road option reads "The road from the capital: none for this world", pull request 1's words for the atlas row; the dropdown widens from 183 to 298 px, the head takes two lines, and the sheet goes from 526 by 406 to 478 by 369 at 1280 and from 503 by 388 to 454 by 351 at 1024 (`seats` in the probe log). It shows only on counted archipelagos such as seed 1 `islands=100`; no rolled seed in 1 to 30 of any type has a road-less capital. Overrule option: the option closed in its own words, the head on one line and the sheet as today, the reader not told why. Rule: engine-invariants' "carries that answer".
2. **The head's words are the relayed ruling and the house's existing words.** The two options and the presses' names are ruling 4 as relayed; "pressed as" without today's comma is today's words with "A poster plate," moved into the dropdown, as `/Users/ahl/CodeProjects/Vellum/out/433/stills/crop/1280-antique-A2.png` draws it; the folio's "the road from Laukuwelua to Homaitani" while the room's road is on the sheet is pull request 1's ruled `plateLine` text without its plate number. The caveat's new sentence, the one new sentence, is Alex's own ruling (issuecomment-6620828024) and no call of this plan's.
3. **The sheet and the head kept in step both ways**, the table under **The design**: the head to the road while bound turns the atlas to row ix; the head back to a poster plate while bound turns it to plate i. Rule: ruling 1 (picking the road lays it on the sheet) and ruling 3; plate i because a bound sheet always shows a page of the atlas and a bind lands there.
4. **The road is asked for once per proof, as the proof lands** (5 ms median, 10.9 ms worst over 64 calls), so the head never offers a road it cannot press. Rule: engine-invariants, "any surface offering the road from X owes a check that X has a road".
5. **The check is "the answer departs from the capital"**, and a refused job is no road: a road-less capital (ribbonResultFor throws) and a world with no capital (it sets out from settlement 0) both refuse, as `defaultJourney` does. A worker failure while the answer is out also reads as none for that proof (the next proof asks again). Rule: the atlas's own answer (PR1) and engine-invariants.
6. **When the bound atlas's road page is turned but the room's own road never came** (a worker failure while it was asked for), the presses stay on the poster plates for that proof. Rule: the presses press only a road the room holds; the next proof asks again.
7. **Sizes by rewriting the root**, the height rounded to two decimals, the 1060 press the plate byte for byte. Rule: the plate is one viewBox (`RIBBON_W` and `RIBBON_H`); the designer measured everything after the root identical at every size.
8. **PNG through `rasterizeSvg`** at the press width, x1 and x2, under the 24,000,000 pixel budget: Wall and Grand at x2 both fit to 5863 by 4093 with the same name and bytes, as the posters' two largest do today. Rule: the room's existing press.
9. **File names `vellum-road-<seed>-<dress>-<width>.svg` and `vellum-road-<seed>-<dress>-<pixel width>.png`**, the dress (antique or ink) rather than the proof's style, since the file carries the dress. Rule: `posterFilename`'s pattern.
10. **The road's lines under the row reuse the posters' templates** with the road's press label ("Ribbon plate pulled: …", "Desk plate pressed: …", the rolling line). Rule: no new words. The longest, "Grand plate pressed at reduced resolution to fit this browser: vellum-road-4294967295-antique-5863.png", is no longer than a topographic poster's line today, and was measured on one line at 1280 and 1024 on seed 42 and on two at 1280 on seed 57 (whose row is narrower), 16 px clear of the Glass in every case, the seed-57 sheet giving 581 by 405 to 556 by 388 while the two lines stand.
11. **The head's accessible name "What the presses pull"** (the designer's, never visible), and the nav's and the row's accessible names follow the head ("A poster plate" or "The road from the capital"). Rule: the row's group is named for what it presses; overrule is free.
12. **The first press's key reads `ribbon` while the road is chosen**; Desk, Wall and Grand keep theirs; the road's sizes stay out of `POSTER_PRESETS`. Rule: the clamp and `constant-contracts` (recon).
13. **The counter leaves `app.ts` as `order-counter.ts`**, the poster path moved verbatim, the split-builder lint following it. Rule: the 400-line bar (`app.ts` 392 at main).
14. **The room's road prints when it is on the sheet.** Rule: ui-design, Print ("the sheet prints as paper"); today's rule would print a blank stage (`printMain` in the log).
15. **The 16px floor written into ui-design.md's bullet for the legend row's head**, and PR36 holds both dropdowns to it. Rule: a rule change edits the spec that owns it (`CLAUDE.md`); the designer named it a reading of that bullet.
16. **The staged runner height re-measured** in commit 6. Rule: settle-doctrine, a change to a staged piece's own dress leaves its staged value behind.
17. **Nine browser checks**, PR41 to PR49, in a new part file, the no-road check on a real address. Rule: check-placement (the cascade, the fit, the downloads and the wiring are the page's); `e2e/suites/print-room/atlas.ts` is PR1's and long.
18. **The head's dropdown closes during a draw with Pressed-as and stays open during an order**, as Pressed-as does; a fresh choice in the head clears a stale line under the row, as a fresh Pressed-as choice does. Rule: the room's existing counter.
19. **The road option is authored closed**, so the page with scripts off offers no road. Rule: the room's presses are authored closed the same way.
20. **No spec line for the row's shape.** Rule: Issue #463's ruling lived in no spec; its amendment is recorded where it was.
21. **`src/styles/print-room/index.css` is not split** (480 lines, unchanged). Rule: the 400-line bar is the TypeScript lint's; the house's sheets run past it.

## Open decisions

None. The one blocking question, the caveat's last sentence while the road is chosen, is ruled: "The road is pressed either way." (Alex, 2026-11-03, issuecomment-6620828024), as `ROAD_TAIL` in `src/site/print-room/road-press.ts`, U6, PR41 and the staged readings already carry it.

## Foreseen for pull request 3, BLOCKING when it is planned

Not built here. Each needs Alex under the delegation's reading (issuecomment-6619124326):

1. **A journey carried into the Print Room by address**, the Ribbon's `a` and `b` keys (`parseRibbonAddress` in `src/site/ribbon/address.ts`) read by `parsePrintRoomAddress`: a public address, not cheaply undone.
2. **A road out of the Ribbon room to the Print Room** on the Ribbon's legend row: an appearance ruled from stills, amending that row.
3. **The head's words for a carried journey**: "The road from the capital" is false for a road that sets out elsewhere, so a carried road needs a new visible name, and whether it replaces the capital's road in the head or stands beside it as a third option.
4. **What the bound atlas's road page does once a carried road is chosen**: the atlas keeps the capital's road (`defaultJourney`), so ruling 3's "the presses press the road on the sheet" and a carried road in the head can disagree.

Issue #1229's branch edits `src/site/ribbon/ink.ts`, `src/styles/ribbon/index.css` and `handbook/specs/ui-design.md`'s motion paragraph, so pull request 3 lands after it.

## Stop conditions

Hand back, with the command and what it printed, when:

- Any line of **What PR2 takes from PR1** does not hold, or a named code or test file moved between bc72cc6f and the build's `origin/main` (`git diff --stat bc72cc6f origin/main -- src/site/print-room src/pages/print-room src/styles/print-room e2e/suites/print-room.ts e2e/suites/print-room e2e/support/runner-layout.ts scripts/lint/split-arguments.ts test/print-room test/e2e/runner-layout.test.ts`), as `.claude/agents/vellum-implementer.md` ("Check the plan still stands") already makes a hand-back.
- `test/site/app-bundles.test.ts` reds: the plate's code reached the page through the new imports.
- `npm run lint` reds on `vellum/split-arguments-by-name` in a way the lists above do not answer, or on `max-lines-per-function` for a moved function.
- U2's 1060 identity or U3's preconditions fail at the planned-at sha (`ribbonResultFor` no longer throws for seed 1 `islands=100`, or that world's capital gains a road).
- The implementer's first run of PR43, PR44, PR45, PR47, PR48 or PR49 falls on the wrong side of its assertion: their fixture readings were UNVERIFIABLE.
- A check not named here reds on the legend row, the head, a select's height or the sheet's size (PR37, PR38, PR40, NS1, a `corners` or `runninghead` check): a pin this plan's greps missed, or the 1 px head the 16 px floor adds moving a seat.
- A proof-runner row's ledger names a red outside its expect column that the plan does not explain, or a row reads HOLE.
- The plate read finds the head on two lines, a press line more, or a clearance smaller than main's at either window with the road chosen on seed 42, a word under 4.5:1, or the printed road outside a Letter page box.
- PR49's step reads over 20 seconds on GitHub's machines, or either other new step is found too slow by settle-doctrine's rule.
- The CI log of commit 5 carries no PR37 detail to read the runner's row from.
