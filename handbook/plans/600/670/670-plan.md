# Issue #670: the Portfolio's empty first visit shows a stranger something

**Planned at**: `origin/main` 393a7ff5819822f3b6f296ffd3aa9e2b39cd84c5, Issue #670 read with 3 comments (the 2026-10-07 re-baseline and the two rulings comments below). Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-16.

**Rulings**:
- https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6205558519 (Alex, 2026-10-15). Q1: "C: drawn explainer", so a bare visit drafts no sheet and shows one drawn plate of the three steps. Q2: "NA". Q3: "Both dropped", so the room's tagline and gloss stay as today. Q4: "Both dropped", so the title and legend-row overlap is not fixed here. C's captions: "Redraw before planning".
- https://github.com/ahl-gram/Vellum/issues/670#issuecomment-6209966485 (Alex, 2026-10-16), on the redrawn plate (`out/670-C2/`). Q5: "(a) Yes, build it as drawn". Q7: "(a) Keep today's words", so the slip, the road and the chart folio's lines are as this plan gives them. Q6: "(a) Yes", so CD62 holds every plate word, from now on, to the page's own smallest body text. The overlap: "File it as its own issue", filed by the dispatcher and not part of this plan.

**Open decisions**: none.

Epic: Issue #667 (Wayfinding), Sub 5. Builds after Sub 4 (Issue #669, PR #758, closed), before Sub 6 (Issue #671), which lists the Portfolio only once this has landed. What a stranger sees is a feel ruling: provisional, on Issue #736's docket.

**The stills** are in the planner's tree until the dispatcher copies them: `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a160d08d878492ee4/out/670-C2/`, to land at `/Users/ahl/CodeProjects/Vellum/out/670-C2/`. Files below are named relative to that folder. The first round, from which C was ruled, is the sibling folder `out/670/`.

## Specs

Read these, at these sections, before building, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/ui-design.md`: The room and its furniture (the chart folio, the stage), The case (the three faces and their roles), The palette by role, Colour, contrast and legibility (4.5:1, measured).
- `handbook/specs/chart-dress.md`: "A sheet stands on the desk in one dressing" (the mount is qualified on the renderer's marker, which the plate does not carry).
- `handbook/specs/site-architecture.md`: Link form is scoped (a page's own in-body references are relative); What a working page's surface owes; the rule that the stylesheets under `public/` join every sheet rule by existing.
- `handbook/specs/cascade-traps.md`: whole file, before the new CSS.
- `handbook/specs/rulebook.md`: Golden and committed-chart discipline (the committed `public/charts/chart-42-antique.svg`; the re-roll's hand-fixed tail, which this plan joins).
- `handbook/specs/settle-doctrine.md`: clauses 3, 4, 5, 6 and 9, and "The environment".
- `handbook/specs/check-placement.md`: The unit suite, The browser lanes.
- `handbook/specs/conventions.md`: How a design decision is made (provisional feel rulings), The fidelity rule, How code is cited.

## The design

**A visit with nothing gathered lays a drawn plate on the stage, built in the page from committed content, and changes nothing else.**

1. **When the plate shows.** Exactly when today's page shows its bare state: the reader's own folio, read from the address and then the device by `folioOnArrival` as today, is empty. `start()` in `src/site/portfolio/app.ts` already branches there (`sheets.length === 0`); that branch now also mounts the plate. A visit with sheets runs no new line. Measured on the spike against main's own build (`vellum-plate-reader`, `out/670-C2/notes.md` item 6): `document.body.outerHTML` identical once `blob:` URLs are replaced by one token (754,425 characters at 1280x800, 754,477 at 1024x768, two visits each), and `magick compare -metric AE` 0 between the builds at both sizes, against a same-build control of 0.
2. **What the plate is.** An SVG of viewBox 1200 by 1000, built at runtime by a pure function, `howPlate(chartHref)`, in a new `src/site/portfolio/how-plate.ts`, and written into `#pf-sheet`, the same box a drafted sheet takes, so the room's fit reads its aspect from its viewBox and the Glass zooms it like any sheet. Its title, `How a Portfolio is Gathered`, stands over three rows separated by hairlines, each a small picture beside a heading and three lines of caption:
   - `i · At the Explorer`: a crop of the antique chart with a dashed window and its corner turned down; `Draw nearer with the Glass until a` / `region is surveyed anew, then turn` / `down the survey's corner.`
   - `ii · On the Table`: three cuttings of the chart on the walnut, under a paper tab reading `The Drawer`; `Each sheet turned down is laid on the` / `Chart Table, in the drawer at the` / `chart's right edge, up to six.`
   - `iii · In the Portfolio`: a small pile and the gold press `Take the table to` / `The Portfolio`; `Take the table here: each sheet is` / `drafted again from its number, and` / `downloads as the engraving.`
3. **Drawn from committed content, so nothing is drafted and no worker starts.** The plate's only picture is the committed `public/charts/chart-42-antique.svg` (rulebook, committed content; home already embeds the same file, so a visitor arriving from home has it cached), referenced as `../../charts/chart-42-antique.svg`, relative like every other in-body reference of a page (site-architecture.md, Link form is scoped), and cropped by clip paths with a transform, never a nested `svg` (the page's `.pf-sheet svg` rule would size a nested one to the whole sheet). The bare branch already returns before `initWorker()`, and still does. Measured (five cold visits, cache off, a local server, so the times are an order of magnitude): `/explorer/worker.bundle.js` was requested on no bare visit, in either build; the image answered 200 with 1,082,927 bytes (369,499 gzipped, `gzip -c public/charts/chart-42-antique.svg | wc -c`), landing 54 to 65 ms after navigation; the plate stood on the stage at a median of 58 ms.
4. **Every colour and face comes from the page's sheet.** The string carries class names only, no colour, no `style` attribute and no `<style>` element; `public/explorer/portfolio/index.css` dresses the classes on the house tokens (`--chart-paper`, `--chart-ink`, `--ink-dark`, `--ink-brown`, `--line-tan`, `--iron-red`, `--control-gold`) and faces (`--font-display`, `--font-body`, `--font-flourish`). The gold press wears the kit's road dress (flourish italic verb in `--ink-brown`, display room line in `--ink-dark`, on `--control-gold`). The plate carries no `data-vellum-style`, so the chart mount's hairline and shadow do not reach it (chart-dress.md), and the page's own `#sheet` shadow frames it as it frames any sheet.
5. **The chart folio names the plate.** Its first line `How a Portfolio is Gathered`, its second `a plate of the house, drawn from The Isle of Rahai, chart № 42`, its third empty. They are written BEFORE `room.layout()`, so the legend row is seated against them (the order `showTop` gets wrong for drafted sheets, which Alex ruled out of this issue).
6. **Everything else on a bare visit is today's** (Q3 and Q7, both ruled): the slip's where-line `no sheets gathered at the Explorer` and bound line `BARE_LINE`, the room's tagline and gloss (Q3 dropped), the road `Back to / The Explorer` with its href `../`, the two sheet presses stood down, the status pill cleared, and the noscript notice. With scripts off there is no plate, as there is no script.
7. **The readability floor the redraw is held to**, derived from the page itself: every word of the plate renders at no less than the smallest body text today's bare Portfolio already ships, the slip foot's `P.note` in EB Garamond at 13.12 CSS px (measured at 1024 by the planner with `scripts/design/shoot.ts` and a probe over every visible text node on the bare page: EB Garamond 13.12 px, IM Fell English italic 12.16 px for the room's gloss, IM Fell English SC 9.92 px for the trail's `Vellum`; re-measured by `vellum-plate-reader` on main's build, all three reproduced), and paints at 4.5:1 or better against the ground under it (ui-design.md, Colour, contrast and legibility, read on painted pixels). The redraw met it for every one of its 16 words at 1024 and 1280: the smallest renders at 14.21 CSS px at 1024 and 16.38 at 1280 (`The Drawer`, `Take the table to`, `The Portfolio`), and the lowest painted contrast is 4.87:1 at 1024 and 4.88 at 1280, on the press's `Take the table to` in the kit's own road dress, every other line reading 7.6 to 9.14 (`out/670-C2/notes.md` item 2). The first drawing, against the same floor, set its captions at 6.8 px and its smallest labels at 5.7 px. The size half has no number in any spec (ui-design.md's only size rule is a control's 16 px in the corner chrome), so the floor is the planner's derivation, and Alex ruled (Q6) that a browser check holds it from now on, deriving the floor from the page in the same run (CD62). The contrast half is the step 11 plate read's.
8. **The plate quotes the Explorer's own labels, and the build holds them equal.** Its press reads `Take the table to` / `The Portfolio`, the Explorer's `#table-road` (`src/pages/explorer/index.astro`); its tab reads `The Drawer`, the head of `tabLine` in `src/site/explorer/chart-drawer.ts`; its "up to six" is `TABLE_CAP` in `src/site/shared/table-address.ts`. A rename there would leave the plate teaching a press that no longer exists, so PL1 compares the tab with `tabLine` and the cap with `TABLE_CAP`, and CD20, landing on the Explorer, reads `#table-road`'s two lines against the plate's.

### Alternatives rejected, with the reason

- **The plate as authored markup in `src/pages/explorer/portfolio/index.astro`.** It would paint before the bundle runs on every visit, so a visit with sheets would flash the plate until its first sheet is drafted, and it would show with scripts off beside the notice that says the page needs scripts.
- **The plate as a committed SVG file loaded by `<img>`.** An image-loaded SVG cannot load the page's faces, so its words would fall back to a default serif; and a new committed file is a deliberate addition to the rulebook's committed list for no gain over a string built in the page.
- **Colours written into the SVG string.** They would escape the stylesheet lint (`vellum/css-token-by-name`), which reads sheets and the CSS modules `SRC_CSS_FILES` names, and the palette join.
- **A nested `svg` per crop**, as the first spike drew: `.pf-sheet svg` in the page's sheet sizes every `svg` under `#pf-sheet` to 100%, so a nested one fills the plate.
- **A drafted sheet as the picture.** It needs the worker and a world generation, which is what option C was ruled to avoid.
- **The overlap fix in `showTop`.** Ruled out of this issue (Q4); the plate's own branch writes its lines before its layout without touching `showTop`.

## Files

Line counts are after the change; none passes 400 lines and no function passes 50.

### Created

- **`src/site/portfolio/how-plate.ts`** (about 90 lines). Pure, DOM-free.
  ```ts
  import { PLATE_TITLE } from "./folio-lines.ts";
  export const PLATE_CHART = "../../charts/chart-42-antique.svg";
  export interface PlateStep {
    readonly numeral: string;
    readonly head: string;
    readonly lines: readonly [string, string, string];
  }
  export const PLATE_STEPS: readonly [PlateStep, PlateStep, PlateStep]; // the three rows' words, exactly as Design 2 gives them
  export const PLATE_TAB = "The Drawer";
  export const PLATE_VERB = "Take the table to";
  export const PLATE_ROOM = "The Portfolio";
  export function howPlate(chartHref: string): string;
  ```
  `howPlate` returns the markup of `demoPlate2` in the planner's spike (`src/site/portfolio/spike-670.ts` in the planner's tree, reproduced in the "Plate markup" section below) with these changes only: the root `svg` carries `class="how-plate"`; the `<style>` element and every class's declarations move to the page sheet; every text comes from the constants above and `PLATE_TITLE`; every `href` is `chartHref`; clip-path ids are `how-plate-clip-1` to `-5` (one crop in row i, three cuttings in row ii, one crop in row iii), numbered in document order, and each clip path's `rect` carries `class="p-clip"`; every word is written verbatim, with no entity escaping (none contains `<`, `>` or `&`; the apostrophes in `survey's` and `chart's` stand as they are). Split into small helpers (one per row's picture, one for a crop, one for a row) so no function passes 50 lines. One header comment line: `// The plate a Portfolio with nothing gathered shows on its stage (Issue #670).` No other comment.
- **`test/portfolio/how-plate.test.ts`**: PL1 to PL3 below.

### Edited

- **`src/site/portfolio/folio-lines.ts`**: add
  ```ts
  export const PLATE_TITLE = "How a Portfolio is Gathered";
  export const PLATE_SOURCE = "a plate of the house, drawn from The Isle of Rahai, chart № 42";
  ```
  `BARE_LINE` and `gatheredLine` stay as they are.
- **`src/site/portfolio/app.ts`** (287 to about 293 lines): import `PLATE_SOURCE`, `PLATE_TITLE` from `./folio-lines.ts` and `howPlate`, `PLATE_CHART` from `./how-plate.ts`; inside `start()`'s `if (sheets.length === 0)` branch, before its existing statements, add in this order: `sheetBox.innerHTML = howPlate(PLATE_CHART);`, `folioTitle.textContent = PLATE_TITLE;`, `folioSub.textContent = PLATE_SOURCE;`, `room.layout();`. Nothing else in the file changes.
- **`public/explorer/portfolio/index.css`**: the plate's dress, after `.pf-sheet svg`, every selector scoped under `.how-plate`, with these values (the spike's, moved from its `<style>`; the font sizes are viewBox units, which CSS `px` inside an SVG are):
  ```css
  .how-plate .p-ground,
  .how-plate .p-paper,
  .how-plate .p-leaf,
  .how-plate .p-tabpaper { fill: var(--chart-paper); }
  .how-plate .p-leaf { stroke: var(--line-tan); stroke-width: 1.5; }
  .how-plate .p-tabpaper,
  .how-plate .p-paper { stroke: var(--ink-dark); stroke-width: 1.5; }
  .how-plate .p-rule { fill: none; stroke: var(--ink-dark); }
  .how-plate .p-rule.outer { stroke-width: 3; }
  .how-plate .p-rule.inner { stroke-width: 1; }
  .how-plate .p-hair { stroke: var(--line-tan); stroke-width: 2; }
  .how-plate .p-frame { fill: none; stroke: var(--ink-dark); stroke-width: 2; }
  .how-plate .p-window { fill: none; stroke: var(--iron-red); stroke-width: 4; stroke-dasharray: 12 8; }
  .how-plate .p-gold { fill: var(--control-gold); stroke: var(--ink-dark); stroke-width: 1.5; }
  .how-plate .p-walnut { fill: var(--chart-ink); }
  .how-plate .p-title { font-family: var(--font-display); font-size: 58px; fill: var(--ink-dark); letter-spacing: 3px; }
  .how-plate .p-head { font-family: var(--font-display); font-size: 38px; fill: var(--ink-dark); letter-spacing: 1.5px; }
  .how-plate .p-cap { font-family: var(--font-body); font-size: 31px; fill: var(--ink-dark); }
  .how-plate .p-tab { font-family: var(--font-display); font-size: 30px; fill: var(--ink-dark); letter-spacing: 1px; }
  .how-plate .p-verb { font-family: var(--font-flourish); font-style: italic; font-size: 30px; fill: var(--ink-brown); }
  .how-plate .p-room { font-family: var(--font-display); font-size: 30px; fill: var(--ink-dark); letter-spacing: 2px; }
  ```
  laid out by `npm run format`, with one comment line above the block: `/* The plate a Portfolio with nothing gathered shows (Issue #670); its font sizes are viewBox units, and CD62 holds every word to the page's own smallest body text. */`. The outer and inner frame rects carry `class="p-rule outer"` and `class="p-rule inner"` in place of the spike's `stroke-width` attributes.
- **`e2e/suites/chart-drawer/portfolio.ts`** (256 to about 345 lines):
  - `export async function bareArrived(k: DrawerKit): Promise<void>`: `forget()`, navigate `about:blank` then `/explorer/portfolio/` with no hash, and `makeSettle` (default tries, the navigation-tolerant `evaluate` `arrivalFrom` uses) on `document.readyState === "complete"`, fonts `loaded` and `!!window.__vellumPortfolio`, a predicate that carries no check's claim (it does NOT wait for the plate, so a missing plate reds the checks that assert it, by name, and CD21 still runs); it throws with its last read.
  - the reads as module-level `Payload` constants beside `ARRIVAL`, as CD19's `PF` is: `PLATE_VISIT` (Tests, item 5) and `PLATE_WORDS` (Tests, item 6);
  - `cd20BarePortfolio` is replaced by two functions, each under 50 lines: `async function plateVisit(kt: TableKit)`, which installs the worker counter, arrives, reads and returns `PLATE_VISIT`'s read and the store, and `export async function cd20PlatePortfolio(kt: TableKit): Promise<void>`, which calls it, presses the road, reads the Explorer's control, asserts, and removes the counter in a `finally` (Tests, item 5);
  - new `export async function cd62PlateReads(k: DrawerKit): Promise<void>` (Tests, item 6);
  - `cd21PortfolioGlass` keeps its body.
- **`e2e/suites/chart-drawer.ts`**, in `cd9Surfaces`, `await cd20BarePortfolio(kd);` and `await cd21PortfolioGlass(kd);` become:
  ```ts
  await step("CD20", () => cd20PlatePortfolio(tableKit(kd)));
  await step("CD62, CD21", async () => {
    await bareArrived(kd);
    await cd62PlateReads(kd);
    await cd21PortfolioGlass(kd);
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  ```
  the last line outside the step, as the suite's own resets beside it are, so a CD62 that throws at 1024 leaves no later check at 1024. In the import from `./chart-drawer/portfolio.ts`, `cd20BarePortfolio` becomes `cd20PlatePortfolio`, and `bareArrived` and `cd62PlateReads` join; `tableKit` is already imported from `./chart-drawer/kit.ts`. The comment above the two steps (`BARE means bare on both homes since Issue #634: ...`) is unchanged. In the comment at the `let laid` line, `CD55 the bare Portfolio CD20 and CD21 left` becomes `CD55 the bare Portfolio the CD62, CD21 step left`.
- **`e2e/suites/stage/stage.ts`**: in the comment above `STILL_READS`, `(an empty Portfolio)` becomes `(a Portfolio with nothing gathered, which shows its plate)`; nothing else changes.
- **`handbook/specs/rulebook.md`**: in the re-roll paragraph, `` `src/site/home/stations.ts` (mooring names and the station title) and `README.md`. `` becomes `` `src/site/home/stations.ts` (mooring names and the station title), `src/site/portfolio/folio-lines.ts` (the Portfolio plate's source line, which names the world) and `README.md`; the plate's crops in `src/site/portfolio/how-plate.ts` are coordinates on the committed antique chart, so a re-roll, or a regen that moves its labels, changes what they frame. ``
- **`test/portfolio/folio-lines.test.ts`**: PF9 added (Tests, item 4); PF6 and PF8 unchanged.

### Not edited, checked

- `e2e/suites/chart-drawer/room.ts`: CD55's control reads the bare page the CD62, CD21 step leaves, whose where-line is today's `no sheets gathered at the Explorer`; unchanged.
- `src/site/shared/table-store.ts`, `src/site/shared/table-address.ts`: unchanged; the plate reads neither.
- `test/site/astro-scaffold.test.ts`, `e2e/suites/runninghead/room.ts`: the page's markup and its road are unchanged, so `ROADS` and `KIT_ROADS` are.
- The stage, corners (floor included) and chart-drawer suites, run one at a time on 2026-10-16 against the spike with the plate as the bare page and every suite as main has it: stage 11 of 11 in 159.9 s (today's bare page, 158.5 s the day before), corners 13 of 13 in 77.9 s, chart-drawer 56 of 56 in 104.5 s (its provenance line records 102.7 to 103.3 s locally). Main's CD20 passes over the plate, because it asserts nothing about the stage, which is why it is rewritten. The runninghead suite, which visits the bare page, 37 of 37. These times leave out the new CD20's press and Explorer arrival and CD62's navigation and two resizes; the PR body states the chart-drawer suite's time from its own run.
- `test/e2e/lane-timings.test.ts`: no suite's cost moves materially (the runs above), so `MEASURED_SECONDS` is not edited; the PR body states the measured times.
- `scripts/design/oracle.ts`: the Portfolio's bare row now photographs the plate; tooling, not a check.
- `BUNDLE_ENTRIES`, `GENERATED_SUBTREES`, `SRC_CSS_FILES`: no new bundle, no generated file, and no TypeScript module building CSS (the plate's string carries none).

## Plate markup

`howPlate(chartHref)` returns exactly this structure (the spike's `demoPlate2`, values as drawn), with `HREF` standing for `chartHref` and the words from the constants:

- root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" class="how-plate">`
- `<rect width="1200" height="1000" class="p-ground"/>`, `<rect x="20" y="20" width="1160" height="960" class="p-rule outer"/>`, `<rect x="32" y="32" width="1136" height="936" class="p-rule inner"/>`
- title: `<text x="600" y="112" text-anchor="middle" class="p-title">` PLATE_TITLE; hairline `<line x1="330" y1="142" x2="870" y2="142" class="p-hair"/>`
- rows at `y0` = 168, 438, 708, separated by `<line x1="72" x2="1128" class="p-hair"/>` at y 432 and 702; each row: heading `<text x="512" y="y0+52" class="p-head">` `numeral · head`; caption lines `<text x="512" y="y0+108+42i" class="p-cap">`; its picture at x 72, y `y0+12`, 400 by 226.
- a crop is `<clipPath id="how-plate-clip-N"><rect x y w h class="p-clip"/></clipPath><g clip-path="url(#how-plate-clip-N)"><image href="HREF" width="1500" height="1158" transform="translate(tx ty) scale(s)"/></g>`, where for a source window `vx vy vw vh` and a box `x y w h`, `s = max(w/vw, h/vh)`, `tx = x + (w - vw*s)/2 - vx*s`, `ty = y + (h - vh*s)/2 - vy*s`.
- row i's picture: crop box (72, y, 400, 226) of window `460 280 640 362`; `<rect class="p-frame">` over it; `<rect x="212" y="y+58" width="130" height="100" class="p-window"/>`; the turned corner `<path d="M314 y+58 L342 y+58 L342 y+86 Z" class="p-gold"/>` and `<path d="M314 y+58 L342 y+86 L314 y+86 Z" class="p-paper"/>`.
- row ii's picture: `<rect x="72" y width="400" height="226" class="p-walnut"/>`; the tab `<rect x="256" y width="216" height="46" class="p-tabpaper"/>` with `<text x="364" y="y+33" text-anchor="middle" class="p-tab">` PLATE_TAB; three cuttings, each `<g transform="rotate(r cx cy)">` holding a `p-leaf` rect 6 px proud of a 140 by 92 crop: (92, y+62, r -4, window `600 350 520 342`), (250, y+58, r 3, `300 600 520 342`), (170, y+116, r -1.5, `900 200 520 342`), with `cx = x+70`, `cy = y+46` of each.
- row iii's picture: two `p-leaf` rects 236 by 120 at (154, y+12) rotated -1.5 about (272, y+72) and (149, y+8) rotated -0.8 about (267, y+68); a crop box (144, y+4, 236, 120) of window `430 250 700 356` with its `p-frame`; the press `<rect x="112" y="y+144" width="320" height="76" rx="3" class="p-gold"/>`, `<text x="272" y="y+174" text-anchor="middle" class="p-verb">` PLATE_VERB, `<text x="272" y="y+208" text-anchor="middle" class="p-room">` PLATE_ROOM.

## Tests, in the order they are written

Each red lands on its assertion, never on a missing module: every export exists with the right shape and the wrong value first.

1. **PL1, `test/portfolio/how-plate.test.ts`**: `test("PL1 the plate says the three steps in the words ruled from its stills, each a text of its own, and quotes the Explorer's own labels (Issue #670)")`. `PLATE_STEPS`, `PLATE_TAB`, `PLATE_VERB` and `PLATE_ROOM` deep-equal the literals of Design 2. The texts of the plate, collected in order by the regular expression `/<text[^>]*>([^<]*)<\/text>/g` over `howPlate(PLATE_CHART)`, deep-equal exactly these 16 strings in this order, the order Plate markup emits them (each row writes its picture before its heading): `PLATE_TITLE`; `i · At the Explorer` and row i's three lines; `PLATE_TAB`; `ii · On the Table` and row ii's three lines; `PLATE_VERB`, `PLATE_ROOM`; `iii · In the Portfolio` and row iii's three lines (each heading built as `` `${numeral} · ${head}` ``). And `tabLine([]).startsWith(`${PLATE_TAB} · `)` (`src/site/explorer/chart-drawer.ts`), and `TABLE_CAP === 6` with the message `the plate's row ii says "up to six"; rewrite it with the cap`.
   - Stub red: `howPlate = () => '<svg class="how-plate" viewBox="0 0 1200 1000"></svg>'` and the constants filled.
   - Mutation (prover): drop row iii from `howPlate`.
2. **PL2**: `test("PL2 the plate writes no colour and no face of its own, so the page's tokens dress every mark (Issue #670)")`. The returned string matches none of `/#[0-9a-fA-F]{3,8}\b/`, `/\b(fill|stroke|style|font-family|font-size)=/`, `/<style/`, `/rgb\(/`, and every `<rect`, `<path`, `<line` and `<text` carries a `class=` (the clip paths' rects carry `p-clip`).
   - Stub red: the stub returns a `<rect fill="#4a3826"/>` inside its `svg`.
   - Mutation (prover): add `fill="#4a3826"` to the title's `text`.
3. **PL3**: `test("PL3 the plate's one picture is the committed antique chart, reached from the Portfolio's own address (Issue #670)")`. Every `href="..."` in `howPlate(PLATE_CHART)` equals `PLATE_CHART`; `new URL(PLATE_CHART, "https://vellum.example/explorer/portfolio/").pathname === "/charts/chart-42-antique.svg"`; and `existsSync("public/charts/chart-42-antique.svg")` (committed content, not a source read under `test-support/source-read-guard.ts`, whose own test lists the file among the non-sources).
   - Stub red: `PLATE_CHART = ""`.
   - Mutation (prover): `PLATE_CHART = "../charts/chart-42-antique.svg"` (resolves under `/explorer/`).
4. **PF9, `test/portfolio/folio-lines.test.ts`**: `test("PF9 the chart folio names the plate a Portfolio with nothing gathered shows, and the world its pictures are drawn from (Issue #670)")`. `assert.equal` of `PLATE_TITLE` and `PLATE_SOURCE` against the literals of Design 5.
   - Stub red: both `""`.
   - Mutation (implementer, step 15): change `chart № 42` to `chart № 41`.
5. **CD20 rewritten**, in `e2e/suites/chart-drawer/portfolio.ts`. `plateVisit(kt)`: installs a worker counter with `Page.addScriptToEvaluateOnNewDocument`, the instrument CD56 already uses (`e2e/suites/chart-drawer/room.ts`), source `(() => { window.__cd20Workers = 0; const W = window.Worker; window.Worker = class extends W { constructor(...a) { super(...a); window.__cd20Workers++; } }; })();`; `forget()`; navigate `about:blank` then `/explorer/portfolio/` (no hash); settle (throwing) on `document.readyState === "complete"`, fonts `loaded` and `!!window.__vellumPortfolio`, a predicate that carries none of the check's claims; then one read of `PLATE_VISIT`: whether `#pf-sheet svg.how-plate` exists and its `.p-title` text; `#folio-title`, `#folio-sub`; `#pf-bound`, `.card-where`; the rect widths of `#pf-next`, `#pf-download`, `#pf-explorer`; `window.__vellumPortfolio().items`; `location.hash`; `#pf-explorer`'s `getAttribute("href")`; `window.__cd20Workers`; then one async read (`evaluate`'s second argument, `awaitPromise`, true, as `e2e/suites/render.ts` reads its own fetch) of the status of `fetch(new URL(img.getAttribute("href"), document.baseURI).href)` for the plate's first `image`; and the store (`kt.STORE`). `cd20PlatePortfolio(kt)`: `plateVisit`; then `kt.pressById("pf-explorer")` (a REAL press, hit-tested) and `arrivalFrom({ evaluate, sleep }, "/explorer/portfolio/")`; then, on the Explorer, a settle (throwing, label `cd20-explorer-worker-control`) until `window.__cd20Workers >= 1`, the counter's same-run control (the Explorer starts its worker at boot, `initWorker` in `src/site/explorer/app.ts`, so a counter that never counts reds here and not as a pass on the Portfolio); and one read of `#table-road .verb` and `#table-road .room`; the counter's script is removed in a `finally`. Check name: `"CD20 a Portfolio reached with nothing gathered on either home lays the drawn plate of the three steps on its stage, its picture the committed chart, with no worker started, while the slip and the road say what they said (the 2026-09-08 bare voice); the device's table stays empty, the address names none, a REAL press on the road lands on the Explorer carrying no table, and the plate's gold press reads as the Explorer's own does (Issue #670)"`. Asserts: plate present, its title `=== PLATE_TITLE`, the image status `=== 200`, `#folio-title === PLATE_TITLE`, `#folio-sub === PLATE_SOURCE`, the bound line `=== BARE_LINE`, the where-line `=== gatheredLine(0)`, next and download widths `<= 0.5`, the road's width `> 0.5`, `items === 0`, `location.hash === ""`, href `=== "../"`, the Portfolio's worker count `=== 0`, store `=== null`, the press `hit`, arrival path `/explorer/`, arrival `table === null`, and the Explorer's `#table-road` verb `=== PLATE_VERB` and room `=== PLATE_ROOM`. Constants imported from `src/site/portfolio/folio-lines.ts` and `src/site/portfolio/how-plate.ts`.
   - Red first (commit 4): on the unchanged page the plate is absent; CD20 reds on that assertion, by name.
   - Mutations the prover owes, each must red CD20: (a) the `sheetBox.innerHTML = howPlate(PLATE_CHART)` line removed; (b) `initWorker()` called at the top of `start()`, before the bare branch; (c) `PLATE_CHART` resolved wrong (`../charts/...`), which the image fetch reds; (d) `localStorage.setItem("vellum.table.v1", "x")` in the bare branch; (e) the Explorer's `#table-road` verb in `src/pages/explorer/index.astro` changed to `Take the sheets to`.
6. **CD62, new**, `cd62PlateReads(k)`, on the page `bareArrived` left. `PLATE_WORDS` reads, in one evaluate: the number of `text` elements in `#pf-sheet svg.how-plate`, the smallest rendered size over them (computed `font-size` times the svg's rendered width over its viewBox width), the plate's rendered width, and the floor, `parseFloat(getComputedStyle(document.querySelector("#portfolio .slip-foot .note")).fontSize)`. Read at the suite's 1280x800; then `Emulation.setDeviceMetricsOverride` to 1024x768, a settle (throwing) until the plate's rendered width has LEFT its 1280 value and two reads agree (settle-doctrine clauses 4 and 5), and the same read; the 1280x800 metrics are put back in a `finally` with a settle until the width has returned. Check name: `"CD62 every word of the plate reads at no less than the page's own smallest body text, the slip foot's note, at 1280 and at 1024, so the plate a stranger is shown is never set smaller than the page around it (Issue #670, ruled from the redrawn stills)"`. Asserts at each width: the count `=== 16`, the floor `> 0`, and the smallest size `>=` the floor.
   - Witness: the first drawing's captions rendered at 6.8 px at 1024 against the same floor (`out/670/notes.md` item 4), which this reds. Measured on the redraw: 14.21 px at 1024 and 16.38 at 1280 against a floor of 13.12 at both.
   - Mutation the prover owes: `.how-plate .p-cap` `font-size: 31px` to `26px` (12.3 px at 1024, under the floor there, 14.2 at 1280, over it), which must red at 1024 alone.
7. **CD21, in the step**: body unchanged, on the page `bareArrived` left and CD62 restored to 1280x800. A missing plate reds CD62 by its count and leaves CD21 to run, since `bareArrived` does not wait for the plate.
8. **CD55**: unchanged; it reads the bare page the CD62, CD21 step leaves.

**The prover owes**: PL1 to PL3, CD20's five mutations, CD62's. **The implementer proves under step 15**: PF9's.

## Order of commits

1. `#670 Archive the plan, and the plate's words and markup, failing` : `handbook/plans/670/670-plan.md` (this plan as finished, Alex's rulings folded in); in `src/site/portfolio/folio-lines.ts`, `PLATE_TITLE` and `PLATE_SOURCE` stubbed `""`, with PF9 in `test/portfolio/folio-lines.test.ts`; `src/site/portfolio/how-plate.ts` with the stubs PL1 to PL3 name (each applied in turn and its red read locally; the commit carries `howPlate` returning the bare `svg` and `PLATE_CHART = ""`); `test/portfolio/how-plate.test.ts`. PF9 and PL1 to PL3 red on their assertions, and `npm run check` clean. Push.
2. `#670 The plate, drawn in the page from the committed chart, and the chart folio's lines for it` : `how-plate.ts` implemented and the two constants filled; PF9 and PL1 to PL3 green.
3. `#670 CD20 and the CD62, CD21 step written against the plate, red` : `portfolio.ts`, `chart-drawer.ts`. Run `VELLUM_E2E_SUITES=chart-drawer`: CD20 red on the plate's absence and CD62 on its count of 0, both by name; CD21 green.
4. `#670 A Portfolio with nothing gathered lays the plate on its stage` : the `app.ts` branch, the CSS, the `STILL_READS` comment, the rulebook line. CD20, CD62, CD21 and CD55 green.

Commit before every prover and plate-reader dispatch.

## Rosters and doctrine

- **`handbook/specs/rulebook.md`**: the re-roll paragraph's known homes gain the Portfolio's source line and the plate's crops (Files).
- **`e2e/suites/stage/stage.ts`**: the `STILL_READS` comment (Files).
- **The 2026-09-08 bare-state ruling** is narrowed, not superseded: the slip, the road and the presses keep it; the stage, empty under it, now carries the plate. The PR body says so.
- **The overlap of a drafted folio's first title with the legend row** (16.1 px deep at 1280 on a gathered folio, `out/670/notes.md` item 3, the H3 and H6 arms) is not fixed here: Alex ruled it out of this issue (Q4) and then "File it as its own issue" (6209966485), which the dispatcher files. This plan carries no part of it.
- **Issue #736's docket**: the plate (its drawing, its words, its size) and the chart folio's two lines are feel calls awaiting the post-use re-review.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- After `npm run build`, one at a time, never the lanes: `VELLUM_E2E_SUITES=chart-drawer node e2e/run.ts`, `VELLUM_E2E_SUITES=stage node e2e/run.ts`, `VELLUM_E2E_SUITES=corners node e2e/run.ts`, `VELLUM_E2E_SUITES=runninghead node e2e/run.ts`.
- The acceptance: CD20 (the plate on a bare visit, from committed content, no worker, the gotcha), CD62 (the readability floor at both widths), PL1 to PL3, PF9, and CD19, CD24, CD54, CD56 and CD61 green unchanged (a visit with sheets).
- **`vellum-plate-reader` is owed** at step 11 on the built page against the ruled stills (`670-C2-C2-1024.png`, `670-C2-C2-1280.png`): 1024x768, 1280x800 and a 640x800 window, full and 1:1 crops of the plate's rows; every plate word's size and painted contrast against the floor, the press verb's (4.87:1 in the spike) taken at its worst across the chart room's fog drift (the "pale haze" over row iii, most likely `.fog` in `public/atelier.css`, a parchment radial drifting over 90 s at z-index 3), named as such; and a gathered visit compared with main's build, DOM and pixels.
- `vellum-guard-prover` on PL1 to PL3, CD20 and CD62, after the commits exist.

## Calls made

1. **The plate is built by the page's script into `#pf-sheet`**, not authored in the page and not a committed file. Rule: authored markup would flash on visits with sheets and show with scripts off; an image-loaded SVG cannot use the house faces (Alternatives).
2. **Its one picture is the committed `public/charts/chart-42-antique.svg`, by a relative reference.** Rule: rulebook (committed content), site-architecture.md (a page's own references are relative); home already embeds the same file.
3. **Colours and faces live in the page's sheet, on tokens; the string carries classes only.** Rule: the palette join and the stylesheet lint read sheets, never a string (site-architecture.md, Tokens outside the palette join; `vellum/css-token-by-name`).
4. **The chart folio names the plate and its world**, written before the layout, its third line empty. Rule: the chart folio captions the sheet on stage (ui-design.md, The room and its furniture); the order is the one `showTop` gets wrong.
5. **The readability floor is the page's own smallest body text, 13.12 CSS px, and 4.5:1 painted.** Rule: ui-design.md's measured 4.5:1 for the contrast half; the size half has no number in any spec, so it is derived from what the house already ships on this page rather than invented. That a check holds it from now on is Alex's ruling (Q6).
6. **No pixel-contrast check in the e2e.** Rule: every plate word is `--ink-dark` on `--chart-paper` (or the kit's press dress), whose contrast the plate reader measured (lowest 4.87:1 painted, on the press verb in the kit's dress; every other word 7.6 to 9.14); a painted-pixel check per word would cost a lane far more than it guards.
7. **CD20 presses the road, and CD21 takes its own arrival** in a step with CD62 whose wait does not need the plate, with an unconditional viewport reset after the step. Rule: the issue asks CD20 be rewritten with real CDP input; a check never reads a page an earlier step's press left; and the suite resets its viewport outside its steps.
8. **CD20 counts workers with the instrument CD56 already uses, and takes the Explorer's own worker as the same-run control.** Rule: option C was ruled to draft nothing, so a moved `initWorker()` would cost every stranger a worker unseen; and a counter that has never been seen to count is a check that cannot fail (`vellum-footguns` Gate 2 item 9).
9. **The plate's words are the redrawn stills' words.** Rule: conventions.md's fidelity rule.
10. **`MEASURED_SECONDS` is not edited.** Rule: no suite's measured cost moves materially (stage 159.9 s against 158.5 s, Files, Not edited); the plate costs one cached-or-fetched image and no draft.
11. **The rulebook's re-roll tail gains the plate, and names a regen's drift of what its crops frame as accepted.** Rule: rulebook.md says the list is not closed and every new quotation of the hero world joins it; a regen moves labels by fractions of a crop, which no check is worth its cost to watch.
12. **The plate's press and tab are held to the Explorer's own labels, and its "six" to `TABLE_CAP`** (PL1, CD20). Rule: the plate teaches a press a stranger must then find; a copy nothing compares drifts silently.
13. **A shared link whose table is empty or unreadable shows the plate**, as it shows today's bare state. Rule: `folioOnArrival` reads such a link as nothing gathered, and this issue does not change what counts as gathered.

## Open decisions

None. Every decision this issue opened is ruled in the two comments named under Rulings. The ruled stills are `670-C2-C2-1280.png` and `670-C2-C2-1024.png`, with the rows at 1:1 in `670-C2-C2-*-crop-row*.png` and today's page beside them in `670-C2-control-*.png`.

## Verified after the second plan-skeptic round

The skeptic read the plan before its last folds; these claims it did not see were checked by command on 2026-10-16:

- **Five clip paths, and the 16 texts in PL1's order.** `demoPlate2()` from the spike, run in Node: 5 `<clipPath` and exactly the 16 strings PL1 lists, in its order.
- **The tab and the cap.** `tabLine([])` returns `The Drawer · the table is bare` and `TABLE_CAP` is 6 (the same run).
- **CD20's worker counter and its control.** The `window.Worker` subclass installed by `Page.addScriptToEvaluateOnNewDocument` (the planner's probe on the spike's build, `e2e/harness.ts` driving it) read 0 on the plate, 1 on `/explorer/` (the control) and 1 on a Portfolio with a one-sheet table; the Explorer's `#table-road` read `Take the table to` / `The Portfolio`.

## Stop conditions

Hand back, with the command and its output, if:

- `git diff --stat 393a7ff5 origin/main -- src/site/portfolio/ src/pages/explorer/portfolio/ public/explorer/portfolio/ public/charts/chart-42-antique.svg e2e/suites/chart-drawer/ e2e/suites/chart-drawer.ts e2e/suites/stage/stage.ts test/portfolio/` shows any change. Issue #767 (open) moves `src/site/portfolio/` to `src/site/explorer/portfolio/`; if it has landed, every path here is stale.
- CD62 reads a plate word under the floor at either width, or a floor of 0.
- The plate's image does not answer 200 from `/explorer/portfolio/`, a worker is counted on a bare visit, or the Explorer's control never counts one (the counter does not see the page's `new Worker`).
- Any stage, corners, floor, runninghead or chart-drawer check other than CD20, CD62 and CD21 changes result.
- `npm run lint` refuses the CSS as written, the `innerHTML` write, or the comments as written.
- The `.pf-sheet svg` rule, or any other rule under `#pf-sheet`, changes the plate's rendered box away from its viewBox's aspect.
