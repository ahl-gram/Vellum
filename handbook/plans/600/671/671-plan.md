# Issue #671 plan: the chart of the atelier (Sub 6 of epic Issue #667)

**Planned at**: `origin/main` e94fa41eee2b2e3cd2175a320ec5e6aed6a356cd, Issue #671 read with 3 comments (the 2026-10-07 re-baseline, Issue #765, and Alex's two rulings comments of 2026-10-16). Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-16.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6221171042 (Alex, 2026-10-16, the step 6 sitting), each his menu answer as quoted there:

> - **D1, how the chart opens:** "Page-native fold (Recommended)". The press opens and shuts the chart with or without scripts; with scripts, Escape, a click elsewhere or tabbing past the last place also shut it.
> - **D2, where the press sits:** "End of the trail line (Recommended)". On home and the Specimen, which have no trail, it sits under the menu as drawn.
> - **D3, the Atlas:** "Drawn as a small isle". NOT the planner's recommendation (which was not drawn). A road from Vellum; it never shows "you are here", because the Atlas page has no menu.
> - **D4, the Specimen:** "Yes (Recommended)". It carries the press; its chart shows every room as a link and has no pin.
> - **D5, which pictures hold 1024:** "September 1280 pictures (Recommended)".
> - **D6, the trail review:** "End of the epic (Recommended)", on Issue #736's docket.
> - **D7, names near a road or the coast:** "Wide dark outline (Recommended)".
> - **D8, a window under about 600 px tall:** "Leave cut off". NOT the planner's recommendation (which was the chart scrolling inside itself). The cost is recorded; at 474 tall "Q & A" and "The Glossary" fall out of reach, at 388 seven of eleven names.
> - **D9, the 16 px rule:** "Keep ~10 px, narrow the rule (Recommended)". The press keeps the trail's size and the rule narrows to boxes you type in and drop-down lists.

and https://github.com/ahl-gram/Vellum/issues/671#issuecomment-6223392089 (Alex, 2026-10-16, the two decisions the second plan-skeptic round opened):

> - **D10, should the press look different while the chart is open:** "Light background while open". NOT the planner's recommendation (which was no special look). Dark words on cream while the chart is open, so the press reads as lit; stills `671-q10-*-b-ground.png`.
> - **D11, where the chart's styling lives:** "Its own sheet (Recommended)". All chart styling in one new stylesheet linked on every page; the Issue #779 rule gets a clause for a component like this.

**Open decisions**: none.

Epic: Issue #667 (Wayfinding). Sub 6, the last build sub; Sub 7 is the post-use re-review, Issue #736, whose docket this pull request joins and which runs at the epic's end (D6). Ruled inputs read for this plan: Issue #671's body and its two comments; Issue #667's body and its three comments; Issue #736's body and its seven comments; `design/nav-wayfinding/README.md`, `directions.mjs`, `mock.css` and the ruled stills; `handbook/plans/668/668-plan.md` and `handbook/plans/670/670-plan.md`.

**The stills the sitting ruled from** are in the planner's tree until the dispatcher copies them: `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a82fdd765aa9f4838/out/671/`, to land at `/Users/ahl/CodeProjects/Vellum/out/671/`. Files below are named relative to that folder; its page is `index.html` and its tables `measure-tables.md`. The build is held to the September 1280 stills at both 1280 and 1024 (D5), with the deviations this plan names.

## What ships

A press in the head cluster, `✦ the chart of the atelier`, opens a small chart of the site's own shape, drawn from the round's reference markup: every route in the tree is a place, the Atlas a small isle off home, the real roads are roads, the Reading Room's second way into the Prospect is a dashed track, home sits at sea as a ring, and a pin stands on the page you are on. Every place but your own is a link, so the chart is the listing the epic ruled it to be: from every page the Prospect, the Ribbon and the Portfolio become findable. It is a layer over the trail and the nav, which stay whole without it. No bundle is added, no page joins a roster, no chart is regenerated.

## Specs

Read these, at these sections, before building, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/ui-design.md`: The room and its furniture (the head cluster bullet, "The head cluster says where the reader is standing", the band, "A new component's CSS goes in its own sheet"); Colour, contrast and legibility (4.5:1 measured; "Sample the ground UNDER the ink"; "The focus ring is one face"; the 16px line this plan narrows); Print ("A state expressed as a `:checked` or an open class needs its own print stand-down").
- `handbook/specs/site-architecture.md`: How a page is authored (how a page is reached, "A reading page is cheap", the rosters a page or a sheet joins, `HOUSE_SHEETS`); "The shell dresses once"; "Sheet order is a contract"; First paint and inlined scripts ("A layout `<script>` MAY import a `.ts` module", "The cliff is guarded"); "A phone lays every page out at a fixed 1024".
- `handbook/specs/cascade-traps.md`: the whole file, before the sheet.
- `handbook/specs/conventions.md`: How a design decision is made (provisional feel calls; "Pin correctness-level tests immediately; let dressing-level pins lag"); The fidelity rule; How code is cited; Where a rule lives.
- `handbook/specs/check-placement.md`: The unit suite (no source reads), The browser lanes.
- `handbook/specs/settle-doctrine.md`: clauses 4, 5, 6, 9 and 14, and The environment (focus emulation; Enter carries `text: "\r"`; `setNarrowViewport`).
- `handbook/specs/rulebook.md`: Retired rules, the nav paragraph.
- `handbook/specs/explorer-doctrine.md`: "Any interactive control placed inside the zoom-bound gesture box" (the panel is NOT inside it; it is inside `header.chrome`).
- `handbook/errata/README.md`: a row, and the "Ruled and left" section.

## The design

### 1. What the press is, and how the chart opens (Alex, D1)

A native disclosure: `<details class="atelier-fold">` whose `<summary class="atelier-press">` is the press and whose content is the chart panel. The browser opens and shuts it, so it works with scripts off (measured on the spike: a real press opens it on the Q & A with script execution disabled). The shell's own script, `src/site/shell/app.ts`, which already rides every page inlined, adds what a disclosure lacks: Escape shuts it (handing focus back to the press when focus was inside), a click anywhere outside it shuts it (a document `click`, D1's own word and the house's outside-dismiss idiom, which the place card's `onDocClick` in `src/site/living-chart/place-overlay.ts` uses; a pinch or a drag that begins off the panel fires no click, so it leaves the chart open), focus moving to an element outside it shuts it (so a keyboard reader tabbing past the last place never lands on a link hidden under the open panel), and leaving the page shuts it, so Back never brings the page out of the browser's page cache with the chart still open (measured: as built, Back from the Glossary to the Q & A restored the page from the cache with the chart open; with a `pagehide` shut, shut). With scripts off those are lost and the press still opens and shuts it. Escape is heard document-wide, so on home and the Explorer one Escape also shuts an open card, as it does today.

The panel is the fold's content, `position: absolute` inside `header.chrome`, so it rides with the cluster on every page: fixed in a room, riding the page on home, and carried sideways with the 1024 page in a window narrower than the floor (measured: at 640x800 scrolled 384px right, the press and the panel both move by -384 on the Explorer, the Q & A and home). Being inside the cluster also means print's `header.chrome { display: none }` stands it down with the cluster.

**A closed fold's content still reports its boxes to a script that asks** (Chrome lays out a `content-visibility: hidden` subtree when a script reads it): on the spike, before the fix, every ink-reading check in the stage and corners suites read the closed chart's words as present ink (NS1, EA1, EA4, EA6, EL1). `.atelier-fold:not([open]) .atelier { display: none; }` stands it down by display as well; with it those checks are green (measured, the arm B run). That rule carries the one comment line the house allows for a hand-measured browser behaviour.

**The open fold lifts its cluster above every piece of the room's furniture it can meet**: `header.chrome:has(.atelier-fold[open]) { z-index: 19; }`. The panel lives inside the cluster's stacking context (`header.chrome` is fixed at z-index 10), and three pieces painted over it, measured on an 8px grid of hit-tests inside the open panel: the road buttons (`.legend`, z-index 10, later in the page) took 10% of it on the Print Room and 12% on the Seed of the Day at 1024x768, 6% on the Print Room and 1.5% on the Explorer at 1280x720; the Reading Room's instrument strip (`.strip`, z-index 12) took 8% at 1024x650; and the Explorer's Chart Table drawer, once its reader opens it (`.chart-drawer`, z-index 18), took 28% at 1280x720, 16% at 1024x768 and 8% at 1280x800. At 19, 0 on every one of those rows and on every page at 1024x768 and 1280x720. The pieces above 19 stand clear of the panel or must stay above it: the slip (20) and the two tabs at the right edge (19) never meet a panel whose right edge is 569.6, the sheet a reader carries off the Chart Table (30) stays above everything while it is carried, and the desk notice (48) and the veil (50) stay above.

Rejected at the sitting: a native popover (it stayed put while its press scrolled away in a 640 window scrolled sideways, measured), and a press only scripts can open. The issue's "If decision 1 is a bundle" is moot: every page already carries the shell's processed script (`<script>` importing `../site/shell/app.ts` in `src/layouts/BaseLayout.astro`, inlined, 1,778 bytes on main against Vite's 4,096-byte inline limit), and the planned four-listener binder is 528 bytes minified standalone (esbuild); on the ruled build the inlined shell script is 2,292 bytes, so no `BUNDLE_ENTRIES`, `GENERATED_SUBTREES`, `.gitignore`, `is:inline` or `covers` change is owed.

### 2. Where the press sits (Alex, D2)

On a page with a trail (every room in the tree), the press rides at the END of the trail's line: `Vellum › The Explorer › The Prospect   ✦ the chart of the atelier`, the fold rendered inside `div.where` right after `nav.trail`, the row laid out by `display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 1.2rem` and the alias line (`p.also`, the Prospect only) kept on its own line under it by `flex-basis: 100%`. On home and the Specimen, which have no trail, the press takes its own line under the nav, `--press-gap` (0.7rem) below it, as `home-d-c-1280` shows.

Measured on the spike (arm B; 1280x800 and 1024x768 alike, `measure-tables.md`): `header.chrome` ends exactly where main's does on every room (127.4; the Prospect 149.2), so every chart room's fitted sheet (`#sheet`) is main's to the tenth of a pixel, the Gallery's first row keeps its 39.0px, and the Q & A's and the Glossary's cluster keeps its 42.2px inside the 169.6 band. Home and the Specimen grow by 24.2px (101.8 to 126.0); neither page's fit moves. This is a deviation from the ruled stills, which put the press on its own line, and the PR body names it with Alex's D2: on its own line every chart room's chart shrank 4 to 7%, the Print Room floored its sheet at 1280x720 (EA3 red) and the risen roads' backing lay over the press at 1024x360 and 1024x388 (NA4 red), all measured.

### 3. The drawing (Alex, D3 and D7)

Lifted from `atelierChart` in `design/nav-wayfinding/directions.mjs`: `PLACES` (the mock's eleven, their coordinates, ranks and labels, including the short labels "The Ribbon", "Today" and "Q & A" the stills show), `ROADS` (the mock's eight), `TRACKS` (the Reading Room to the Prospect), `COAST`, the pip radii, the road curve, the halo, the pin hung BELOW its pip (`y + 19` to `y + 29`, the words at `y + 42`), the rose at `translate(538 380)`, the cartouche `A Chart of the Atelier` at (86, 408) and the key line `the dashed track is a second way in, not a second home`.

**The Atlas is a twelfth place, a small isle off home** (D3): `"/atlas/": { x: 44, y: 128, rank: "isle", name: "The Atlas" }`, last in `PLACES`, and a ninth road `["/", "/atlas/"]`, last in `ROADS`, the drawing Alex ruled from (`671-q3-home-1280-atlas.png`). Its link goes to `/atlas/`, root-absolute like the rest. It is never pinned: the atlas page carries no shell, so no chart. The drawing is data in `src/layouts/atelier-chart.ts` and markup in `src/layouts/AtelierChart.astro`; `test/site/atelier-chart.test.ts` holds that every route in the tree has a place and that the atlas is the one place off it.

Measured on the ruled combination (the planner's `atlas-b3` build: arm B, the isle and its road, the 8-unit outline and the lift; `671-r-*`): zero overlapping pairs of words, and zero pairs where one word's outline reaches another word or another place's pip, on all twelve pages at 1280x800 and 1024x768 (15 words a page, 14 on the Specimen); every link answers a press at its name and its pip, 11 of 11 on a page in the tree and 12 of 12 on the Specimen.

Changes from the reference markup:

- Every place but the page's own is an SVG `<a href>` to its route, root-absolute; the page's own place is a plain `<g>` with the halo and the pin, and carries no `aria-current` (the one-mark rule). Call 3.
- The chart's container is `<nav class="atelier" aria-label="The chart of the atelier">`; the `<svg>` carries no role and no label; the decorations are `aria-hidden="true"`. Call 4.
- The cartouche's class is `atelier-cartouche`, not the mock's `cartouche`: `test/site/astro-scaffold.test.ts`'s head cluster test holds that home carries no `class="cartouche"` (the hero section it retired), and the chart rides home. Call 23.
- **Every word wears a wide dark outline in the panel's own ink** (D7), so the roads and the coast stop short of the names: `.atelier text { paint-order: stroke; stroke: var(--chart-ink); stroke-width: 8px; stroke-linejoin: round; }`. As drawn, every word read 7.45:1 or better against the panel (median), but 5 to 14% of the pixels round four names fell under 4.5:1, the worst at 1.95. With the outline (B3, `measure-contrast-b3-1024-fill.json`, 1024x768 on the Q & A and the Explorer): no word has more than 1% of its pixels under 4.5:1, the medians rise to 10.2 to 12.1, and the worst single pixel stays under 4.5 for four names where the coast's or a road's edge meets a letter's edge: "The Print Room" 2.46, "The Glossary" 2.88, "The Explorer" 3.14 (3.91 on the Q & A) and "Q & A" 3.63 (3.93 on the Explorer). On the ruled combination with the isle (`atlas-b3`, `measure-contrast-atlas-b3-1024-fill.json`), every one of the twelve names, `you are here`, the cartouche, the rose's N and the key line was read again: the isle's own name reads 9.86 at its worst pixel; "Vellum", whose ring the new road leaves under its name, 4.88 (4.90 on the Explorer); and the same four stay under 4.5 at one pixel, "The Print Room" 2.46, "The Glossary" 2.86, "The Explorer" 3.17 and "Q & A" 3.65, with no word over 1% of its pixels under 4.5 and every median 10.2 or better. Those four are recorded as an errata row (Rosters and doctrine).
- The press's `✦` is drawn by `content: "✦ " / ""`, the empty alternative keeping the glyph out of the press's accessible name. Call 5.

### 4. The dress

A new sheet, `public/chart-of-the-atelier.css`, linked by the layout on every page directly after `/atelier.css`. Its own sheet because `handbook/specs/ui-design.md` says a new component's CSS goes in its own sheet, and because folding it into `public/shell.css` (371 lines) would carry that sheet past 400. **Not** `atelier-*.css`: `kitClasses` in `scripts/lint/sheet-owners.ts` (`/^public\/atelier[^/]*\.css$/`) and L23 in `e2e/suites/landfall/controls.ts` (`/\/atelier[^/]*\.css$/`) read every sheet so named as the kit's, and L23 redded on the spike when the sheet was named `atelier-chart.css` (measured: all 36 of its arms read as kit rules reaching home).

The values are the reference sheet's (`design/nav-wayfinding/mock.css`, its D block) for the panel and the drawing, with these differences:

- the narrow blocks (`max-width: 575px`, `max-width: 900px`) are not lifted (Call 7);
- the panel's width is `34rem`, not `min(34rem, calc(100vw - 2 * var(--chrome-x)))` (Call 7);
- the panel is `position: absolute` inside the cluster at `left: 0; top: calc(11.6rem - var(--chrome-y))`, which puts it at the mock's 11.6rem from the top of the window (measured 185.6 at both widths) while riding with the cluster (Call 8);
- the press is `width: fit-content`, so its hit box is its words (Call 9);
- the press's gap where it takes its own line is `--press-gap: 0.7rem`, not the mock's 0.42rem (Call 10);
- the place links brighten their name and pip to parchment-bright under the hand and under focus (Call 13);
- the press is lit while the chart is open (D10): dark ink on a cream ground with a 0.2em cream spread, `.atelier-fold[open] > .atelier-press { color: var(--ink-dark); background: var(--parchment-bright); box-shadow: 0 0 0 0.2em var(--parchment-bright); }`, the dress of `671-q10-*-b-ground.png`, which `handbook/specs/ui-design.md` asks of a toggle press ("lit when on, never in the dress of its own hover"). Its selector, (0,3,0), outranks the hover's colour, (0,2,0), so the open press under the hand stays lit (measured: dark ink on cream at rest and under the hand alike). Measured on cream (`measure-round5.json`, 1280 and 1024, the Q & A and the Prospect): the words 10.19 at their worst pixel, 10.44 median; the star, a decoration with an empty alternative, 5.7 at its 5th percentile inside the cream, its worst pixel 1.46 to 1.59 where its left point meets the deep beyond the 2px spread. Beside the trail's underlined own-page segment on the Prospect, 17.5px of the deep separates the underline's end from the cream (`671-q10-prospect-trail-and-lit-3x.png`). Under keyboard focus the open press keeps the house ring, 2px solid parchment-bright at a 2px offset, which adjoins the cream spread and reads as the cream's edge thickening by 2px, 8.28:1 against the deep outside it (Call 34; `671-q10-ring-open-faq-3x-lit2.png`);
- the words' outline (D7) and the cluster's lift when open (design item 1).

**On a window too short for the panel, the panel is cut at the window's foot** (D8): it keeps its 399.5px and no part of the page or the panel scrolls to reach what falls below. Measured on the ruled combination (`atlas-b3`): at 1024x600 and up nothing is cut; at 1024x540 only the key line; at 1024x474 "Q & A" and "The Glossary"; at 1024x430 also "Vellum" and "The Gallery"; at 1024x388 and 1024x360 seven of the twelve names (the Atlas, the Explorer, the Prospect, the Portfolio and Today stay). The isle is never cut (its name stands at about 297px from the window's top). On home, where the cluster rides the page, scrolling the page reaches the rest. Recorded as a ruled errata row (Rosters and doctrine); no check pins it (Call 28).

The press joins the head cluster's existing rules by selector rather than by a rule of its own (Gate 3 item 2):

- `public/shell.css`: `header.chrome a { pointer-events: auto; }` becomes `header.chrome :is(a, summary) { pointer-events: auto; }`, the first new member of the cluster's pointer allowlist; and `header.chrome a:focus-visible, footer a:focus-visible` becomes `header.chrome :is(a, summary):focus-visible, footer a:focus-visible`, so the press takes the chrome's ring;
- `public/house.css`: the house ring `:is(a, input, select, [tabindex], button:not(.place-hit)):focus-visible` gains `summary`, so the press wears the one face (2px solid, offset 2px) instead of the browser's own ring. No other `summary` exists on the site (`grep -rl "<summary\|<details" src public` on main: none). The specificity of each widened rule is unchanged ((0,1,2), (0,2,2) and (0,2,1)).

**The press keeps the stills' size, 0.62rem (9.92px), the trail's own size** (D9), and `handbook/specs/ui-design.md`'s "A control's font size does not go below 16px in the corner chrome" narrows to what its reason covers, a field a reader types into or a select (the replacement text is under Rosters and doctrine).

Measured on arm B (`measure-focus-hover-b-faq-1280.json`): the press's ring 8.18:1 at its worst against the deep; the press 7.02:1 at rest and 8.18 under the hand at the worst pixel; a place link's ring median 11.59:1, worst 1.21 where it crosses the road leaving its pip (1.8% of its ground under 4.5; 1.31 and 1.4% under the 3-unit outline), recorded as an errata row (Call 24).

### 5. The Specimen (Alex, D4)

The Specimen carries the press and the chart, with every place a link and no pin, since it has no place.

### 6. What 1024 is held to (Alex, D5)

The September 1280 stills govern 1024 too: the panel is 544x399.5 at (25.6, 185.6) at both widths, and the cluster is identical (measured), so the chart and the press render the same pixels at 1024 as at 1280; only the room beneath is narrower. What that costs the room at 1024 is in the coverage row of "Rosters and doctrine".

### 7. What is not changed

- The band: every page that renders one (the Q & A and the Glossary) carries a trail, and the press rides the trail's line, so the cluster there is main's and `:root:has(.band):has(.trail)` stays as it is. Issue #671's build step 6 ("the band gains the press") is moot under D2.
- `NAV_ITEMS`, `ROUTE_NAMES`, `ROUTE_CHILDREN`, `trailFor`: unchanged; the chart reads the tree.
- No page's own sheet changes.

## Files

Line counts are after the change. No file passes 400 lines except `test/site/astro-scaffold.test.ts`, which already carries `/* eslint-disable max-lines */` and owns the one build (a second file would race it on its output folder); no function passes 50.

### Created

- **`src/layouts/atelier-chart.ts`** (about 60 lines). DOM-free (the engine type-check pass reads it).
  ```ts
  export type PlaceRank = "landing" | "capital" | "town" | "isle" | "village";
  export interface Place {
    readonly x: number;
    readonly y: number;
    readonly rank: PlaceRank;
    readonly name: string;
  }
  export const PLACES: Readonly<Record<string, Place>>;
  export const ROADS: readonly (readonly [string, string])[];
  export const TRACKS: readonly (readonly [string, string])[];
  export const COAST: string;
  export const PIP_R: Readonly<Record<PlaceRank, number>>;
  export function roadPath(pair: readonly [string, string]): string;
  ```
  Values exactly as "The drawing's values" below. `roadPath` looks both ends up in `PLACES`, throws `` new Error(`no place on the chart of the atelier for ${route}`) `` for a missing end, and returns `` `M${p.x} ${p.y} Q ${(p.x + q.x) / 2 + 12} ${(p.y + q.y) / 2 - 10} ${q.x} ${q.y}` ``. One header line and no other comment: `` // The chart of the atelier's drawing (Issue #671): a place for every route in the tree and an isle for the atlas, which `test/site/atelier-chart.test.ts` holds; the coordinates, the roads and the coast are drawn, lifted from `atelierChart` in `design/nav-wayfinding/directions.mjs`. ``
- **`src/layouts/AtelierChart.astro`** (about 25 lines). `interface Props { path: string; }`; `const here = PLACES[path];`. Renders exactly:
  ```astro
  <details class="atelier-fold">
    <summary class="atelier-press">the chart of the atelier</summary>
    <nav class="atelier" aria-label="The chart of the atelier">
      <svg viewBox="0 0 600 420">
        <path class="sea-ring" d={COAST} aria-hidden="true" />
        <path class="land" d={COAST} aria-hidden="true" />
        {ROADS.map((r) => <path class="road" d={roadPath(r)} aria-hidden="true" />)}
        {TRACKS.map((r) => <path class="road track" d={roadPath(r)} aria-hidden="true" />)}
        {Object.entries(PLACES).map(([href, p]) => href === path ? (
          <g class={`place ${p.rank} here`}><circle class="halo" cx={p.x} cy={p.y} r="16" /><circle class="pip" cx={p.x} cy={p.y} r={PIP_R[p.rank]} /><text x={p.x} y={p.y - 11}>{p.name}</text></g>
        ) : (
          <a href={href} class={`place ${p.rank}`}><circle class="pip" cx={p.x} cy={p.y} r={PIP_R[p.rank]} /><text x={p.x} y={p.y - 11}>{p.name}</text></a>
        ))}
        {here && <g class="you"><path d={`M${here.x} ${here.y + 19} L${here.x} ${here.y + 29}`} /><text x={here.x} y={here.y + 42}>you are here</text></g>}
        <g class="rose" transform="translate(538 380)" aria-hidden="true"><circle r="15" /><path d="M0 -15 L3.4 -3.4 L15 0 L3.4 3.4 L0 15 L-3.4 3.4 L-15 0 L-3.4 -3.4 Z" /><text y="-19">N</text></g>
        <text class="atelier-cartouche" x="86" y="408" aria-hidden="true">A Chart of the Atelier</text>
      </svg>
      <p class="atelier-key">the dashed track is a second way in, not a second home</p>
    </nav>
  </details>
  ```
  `href` before `class` on each `a`, as written (AR1's pattern reads that order; the spike's build emits it so). No comment.
- **`public/chart-of-the-atelier.css`** (about 205 lines once `npm run format` lays it out). The rules, in this order, with these values:
  ```css
  :root { --press-gap: 0.7rem; }
  .atelier-fold { display: block; margin: var(--press-gap) 0 0; }
  .atelier-fold:not([open]) .atelier { display: none; }
  header.chrome:has(.atelier-fold[open]) { z-index: 19; }
  .where:has(> .atelier-fold) { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 1.2rem; }
  .where > .atelier-fold { margin: 0; }
  .where > .also { flex-basis: 100%; }
  .atelier-press { display: block; width: fit-content; font-family: var(--font-display, "Iowan Old Style", "Palatino", Georgia, serif); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--parchment); cursor: pointer; list-style: none; }
  .atelier-press::-webkit-details-marker { display: none; }
  .atelier-press::before { content: "✦ " / ""; opacity: 0.8; }
  .atelier-press:hover, .atelier-press:focus-visible { color: var(--parchment-bright); }
  .atelier-fold[open] > .atelier-press { color: var(--ink-dark); background: var(--parchment-bright); box-shadow: 0 0 0 0.2em var(--parchment-bright); }
  .atelier { box-sizing: border-box; position: absolute; left: 0; top: calc(11.6rem - var(--chrome-y)); z-index: 44; width: 34rem; padding: 0.6rem 0.7rem 0.4rem; background: rgb(from var(--chart-ink) r g b / 0.985); border: 1px solid rgb(from var(--line-tan) r g b / 0.45); box-shadow: 0 18px 40px rgb(from var(--chart-ink) r g b / 0.55); pointer-events: auto; }
  .atelier svg { display: block; width: 100%; height: auto; }
  .atelier .land { fill: rgb(from var(--parchment) r g b / 0.1); stroke: var(--line-tan); stroke-width: 1.1; }
  .atelier .sea-ring { fill: none; stroke: rgb(from var(--line-tan) r g b / 0.35); stroke-width: 5; }
  .atelier .road { fill: none; stroke: rgb(from var(--parchment) r g b / 0.45); stroke-width: 1; }
  .atelier .road.track { stroke-dasharray: 3 4; stroke: rgb(from var(--parchment) r g b / 0.3); }
  .atelier text { font-family: var(--font-display, "Iowan Old Style", "Palatino", Georgia, serif); font-size: 11px; letter-spacing: 0.06em; text-anchor: middle; fill: var(--parchment); paint-order: stroke; stroke: var(--chart-ink); stroke-width: 8px; stroke-linejoin: round; }
  .atelier .village text { font-size: 9.5px; }
  .atelier .isle text { font-size: 10px; }
  .atelier .pip { fill: var(--parchment); }
  .atelier .capital .pip, .atelier .here .pip, .atelier a.place:hover .pip, .atelier a.place:focus-visible .pip { fill: var(--parchment-bright); }
  .atelier .here text, .atelier a.place:hover text, .atelier a.place:focus-visible text { fill: var(--parchment-bright); }
  .atelier .halo { fill: none; stroke: var(--parchment-bright); stroke-width: 1; opacity: 0.55; }
  .atelier .landing .pip { fill: none; stroke: var(--parchment); stroke-width: 1.4; }
  .atelier .landing text { font-style: italic; }
  .atelier .you path { stroke: var(--parchment-bright); stroke-width: 1; }
  .atelier .you text { font-family: var(--font-flourish, "Iowan Old Style", "Palatino", Georgia, serif); font-style: italic; font-size: 10.5px; fill: var(--parchment-bright); letter-spacing: 0.04em; }
  .atelier .rose circle { fill: none; stroke: rgb(from var(--line-tan) r g b / 0.5); }
  .atelier .rose path { fill: rgb(from var(--parchment) r g b / 0.55); }
  .atelier .rose text { font-size: 9px; }
  .atelier .atelier-cartouche { text-anchor: start; font-size: 13px; letter-spacing: 0.12em; }
  .atelier-key { font-family: var(--font-flourish, "Iowan Old Style", "Palatino", Georgia, serif); font-style: italic; font-size: 0.62rem; color: var(--parchment); margin: 0.3rem 0 0; text-align: right; }
  ```
  Two comment lines, exactly: above `:root`, `/* The chart of the atelier (Issue #671): its press rides the trail's line, or its own under the nav where no trail is, and its panel stands inside the head cluster so it rides with it on the 1024 page. */`; above `.atelier-fold:not([open]) .atelier`, `/* A closed fold's content still reports its boxes to a script that asks, so it stands down by display as well (Issue #671, measured on the stage and corners suites). */`. No print block (Call 14).
- **`src/site/shell/atelier.ts`** (about 25 lines):
  ```ts
  export function bindAtelier(doc: Document): void;
  ```
  Finds `doc.querySelector<HTMLDetailsElement>("details.atelier-fold")`; returns if absent. Four listeners, each a no-op while the fold is shut:
  - `doc` `keydown`: on `e.key === "Escape"`, note whether `doc.activeElement` is inside the fold, set `fold.open = false`, and if it was, focus the fold's `summary`;
  - `doc` `click`: when `!(e.target instanceof Node && fold.contains(e.target))`, set `fold.open = false`;
  - `fold` `focusout`: when `e.relatedTarget instanceof Node && !fold.contains(e.relatedTarget)`, set `fold.open = false` (a focus moving to nothing, as a press on the panel's own ground gives, leaves it open; measured, Call 27);
  - `doc.defaultView` `pagehide`: set `fold.open = false` (measured, Call 30).
  One header line and no other comment: `// The chart of the atelier's fold opens and shuts natively; this adds what a disclosure lacks: Escape, a click elsewhere, focus leaving it and leaving the page shut it (Issue #671).`
- **`test/site/atelier-chart.test.ts`**: AC1, AC2 (Tests).
- **`e2e/suites/cluster/chart.ts`** (about 370 lines): AT1 to AT8 (Tests), each an exported `async function atN<Name>(k: TrailKit): Promise<void>` under 50 lines, with module-level `Payload` reads, one shared `pressAt(k, x, y)` (a real `mousePressed` and `mouseReleased`) and one shared `sized(k, width, height)` (`Emulation.setDeviceMetricsOverride`, `mobile: false`). Every check sets its own metrics first and puts 1280x800 back in a `finally`.

### Edited

- **`src/layouts/BaseLayout.astro`**: `import AtelierChart from "./AtelierChart.astro";` after the `nav.ts` import; `<link rel="stylesheet" href="/chart-of-the-atelier.css">` on the line after `<link rel="stylesheet" href="/atelier.css">`; in the trail line, `<AtelierChart path={path} />` inserted between the trail's `</nav>` and `{trail.also.length > 0 && ...}`; and on a new line after the trail line, before `<slot name="header-extra" />`, `{!trail && <AtelierChart path={path} />}`. Nothing else.
- **`src/site/shell/app.ts`**: `import { bindAtelier } from "./atelier.ts";` and `bindAtelier(document);` on the line after `bindTopRow();`. Its header line becomes: `/** The shell's own bundle: the one script every shelled page carries. It lays out the top row (Issue #762), shows the desk notice (Issue #761) on a phone that shrank the page, and shuts the chart of the atelier on Escape, a click elsewhere, focus leaving it or leaving the page (Issue #671). */`
- **`public/shell.css`**: the two selectors in design item 4. Nothing else.
- **`public/house.css`**: the ring's `:is(...)` becomes `:is(a, input, select, summary, [tabindex], button:not(.place-hit))`. Nothing else.
- **`scripts/lint/sheet-owners.ts`**: `HOUSE_SHEETS` becomes `/^(atelier[^/]*|house|motion|fonts|shell|chart-of-the-atelier)\.css$/`.
- **`test/repo/sheet-owners.test.ts`**: in the kit test, the `passedAt` list gains `"public/chart-of-the-atelier.css"` after `"public/fonts.css"`.
- **`e2e/suites/runninghead/shell.ts`**: `SHELL_SHEETS` gains `"/chart-of-the-atelier.css"` after `"/atelier.css"`.
- **`e2e/suites/corners.ts`**: `LINKS` maps `(a) => new URL(a.getAttribute("href"), document.baseURI).href` in place of `(a) => a.href`. An SVG `<a>`'s `href` is an `SVGAnimatedString`, so the old read threw `h.startsWith is not a function` on every page carrying the chart and CO1 and CO4 redded (measured); `getAttribute` reads the attribute a script rewrote, so the HTML links resolve exactly as before.
- **`e2e/suites/cluster.ts`**: import `at1Press` to `at8Back` from `./cluster/chart.ts`; after the `DR15` step and before the trailing `clearMobile`, `await step("AT1", () => at1Press(trail));` and so on to `AT8`, each in its own `step`; and CL1 re-anchored (Tests, item 13).
- **`e2e/suites/cluster/trail.ts`**: `READ`'s `links` reads `header.chrome :is(.trail, .also) a` in place of `header.chrome .where a`, so it keeps reading the links it read on main now that the fold sits inside `.where`; `spacing` is exported (`export const spacing`). Nothing else.
- **`test/site/astro-scaffold.test.ts`**: AR1 added (Tests, item 3), with `import { PLACES } from "../../src/layouts/atelier-chart.ts";`; the alias-line test strips the fold from the trail's tail before reading it: `const tail = [...page(p.route).matchAll(TRAIL)][0]?.[2]?.replace(/^<details class="atelier-fold">[\s\S]*?<\/details>/, "");`.
- **`test/e2e/lane-timings.test.ts`**: `MEASURED_SECONDS.cluster` (Rosters and doctrine).
- **`handbook/specs/ui-design.md`**, **`handbook/specs/site-architecture.md`**, **`handbook/specs/rulebook.md`**: Rosters and doctrine.
- **`handbook/errata/site.md`**: the PR #666 coverage row edited, two rows added under `## Open` and one under `## Ruled and left` (Rosters and doctrine).

### Not edited, checked

- `NAV_ITEMS`, `ROUTE_NAMES`, `ROUTE_CHILDREN`, `trailFor` in `src/layouts/nav.ts`: read, not changed.
- `ATLAS_ROUTE` in `scripts/generate-discovery.ts` (`"/atlas/"`): read by AC1, not changed.
- `src/cli/gallery.ts` and the Gallery's generated sheet: the Gallery's first row keeps 39.0px (measured on arm B).
- The band rule in `public/shell.css`: unchanged (design item 7).
- `BUNDLE_ENTRIES`, `GENERATED_SUBTREES`, `.gitignore`, `test/repo/e2e-tiers.test.ts`, `SRC_CSS_FILES`: no bundle, no generated file, no CSS module under `src/`.
- `kitClasses` in `scripts/lint/sheet-owners.ts`: its `read(["public/house.css", "public/motion.css", "public/shell.css"])` subtracts classes a house sheet shares with the kit; the chart's sheet names no class `public/atelier.css` names (grep of each of its classes), so it does not join that list.
- The rest of `test/site/astro-scaffold.test.ts`: the head cluster test's retired-class list (`cartouche` is avoided, design item 3); "every internal link and embed on the rendered pages resolves" (the chart's hrefs are routes, `/atlas/` among them on that test's own `generated` list, and the sheet is in `public/`); the body skeleton and the one-mark tests (the fold sits inside `header.chrome` and carries no `aria-current`).

## The drawing's values

`src/layouts/atelier-chart.ts` carries exactly these (the mock's `PLACES`, `ROADS`, `TRACKS` and `COAST` in `design/nav-wayfinding/directions.mjs` and the radii from its `atelierChart`, with the atlas isle and its road last, as ruled):

```ts
export const PLACES: Readonly<Record<string, Place>> = {
  "/": { x: 62, y: 286, rank: "landing", name: "Vellum" },
  "/explorer/": { x: 300, y: 196, rank: "capital", name: "The Explorer" },
  "/prospect/": { x: 214, y: 148, rank: "town", name: "The Prospect" },
  "/ribbon/": { x: 126, y: 236, rank: "town", name: "The Ribbon" },
  "/explorer/portfolio/": { x: 368, y: 136, rank: "town", name: "The Portfolio" },
  "/reading-room/": { x: 272, y: 274, rank: "town", name: "The Reading Room" },
  "/print-room/": { x: 418, y: 232, rank: "town", name: "The Print Room" },
  "/seed-of-the-day/": { x: 486, y: 96, rank: "isle", name: "Today" },
  "/gallery/": { x: 500, y: 320, rank: "isle", name: "The Gallery" },
  "/faq/": { x: 158, y: 330, rank: "village", name: "Q & A" },
  "/glossary/": { x: 352, y: 336, rank: "village", name: "The Glossary" },
  "/atlas/": { x: 44, y: 128, rank: "isle", name: "The Atlas" },
};
export const ROADS: readonly (readonly [string, string])[] = [
  ["/", "/explorer/"],
  ["/explorer/", "/prospect/"],
  ["/prospect/", "/ribbon/"],
  ["/explorer/", "/explorer/portfolio/"],
  ["/explorer/", "/print-room/"],
  ["/explorer/", "/reading-room/"],
  ["/print-room/", "/glossary/"],
  ["/reading-room/", "/faq/"],
  ["/", "/atlas/"],
];
export const TRACKS: readonly (readonly [string, string])[] = [["/reading-room/", "/prospect/"]];
export const COAST =
  "M74 196 C 70 150 108 108 156 96 C 196 86 222 104 256 92 C 296 78 330 86 356 74 " +
  "C 392 58 430 78 438 112 C 444 140 424 158 436 180 C 452 208 470 218 466 248 C 462 284 430 300 396 300 " +
  "C 366 300 356 320 330 342 C 300 368 250 372 214 356 C 178 340 170 316 140 304 C 100 288 78 244 74 196 Z";
export const PIP_R: Readonly<Record<PlaceRank, number>> = { capital: 5.5, landing: 5, town: 4, isle: 4, village: 3 };
```

## Tests, in the order they are written

Each red lands on its assertion, never on a missing module or a missing element: every export and every element a check reads exists, with the wrong behaviour, before the check is run red. The browser checks are written against the chart's markup before its dress, its allowlist membership and its binder exist (Order of commits 5), so their reds are the defects they guard; AT7 is seen red by mutation only, which its item says.

1. **AC1, `test/site/atelier-chart.test.ts`**: `test("AC1 every route in the tree, and home, is a place on the chart of the atelier, and the one place off the tree is the atlas, drawn as an isle off home (Issue #671; Alex, 2026-10-16, D3)")`. `Object.keys(PLACES).sort()` deep-equals `[...new Set(["/", ...NAV_ITEMS.map((i) => i.href), ...Object.values(ROUTE_CHILDREN).flat(), ATLAS_ROUTE])].sort()` (`NAV_ITEMS`, `ROUTE_CHILDREN` from `src/layouts/nav.ts`; `ATLAS_ROUTE` from `scripts/generate-discovery.ts`).
   - Stub red: `PLACES = {}`.
   - Mutations (prover): delete the Portfolio's entry from `PLACES`; delete the atlas's entry from `PLACES`.
2. **AC2**: `test("AC2 every road and the alias track joins two places on the chart, and the tracks are exactly the tree's aliases (Issue #671)")`. Every end of every `ROADS` and `TRACKS` pair is a key of `PLACES`; `roadPath(r)` starts with `M` for each; `TRACKS` deep-equals `Object.keys(ROUTE_NAMES).flatMap((r) => aliasesOf(r).map((a) => [a, r]))` (`aliasesOf` from `src/layouts/nav.ts`; today `[["/reading-room/", "/prospect/"]]`); and `assert.throws(() => roadPath(["/", "/nowhere/"]))`.
   - Stub red: `TRACKS = []`.
   - Mutation (prover): `TRACKS = [["/explorer/", "/prospect/"]]`.
3. **AR1, `test/site/astro-scaffold.test.ts`**: `test("the chart of the atelier rides every page's head cluster: its fold at the trail's end where the page has a trail and under the nav where it has none, its press reading 'the chart of the atelier', every place a link to its route but the page's own, which carries the pin, the Specimen with every place a link and no pin, and no page mark inside it (Issue #671)")`. For each `PAGES` entry: exactly one match of `/<details class="atelier-fold">([\s\S]*?)<\/details>/g`; where `p.trail`, the match starts at the index right after the `</nav>` that closes `<nav class="trail"`; where not, it lies after the `</nav>` that closes `<nav class="rooms"` and before `</header>`; the fold holds `<summary class="atelier-press">the chart of the atelier</summary>`; the hrefs of `/<a href="([^"]+)" class="place [a-z]+">/g` over it, sorted, deep-equal `Object.keys(PLACES).filter((r) => r !== p.dir).sort()` (eleven on a page in the tree, twelve on the Specimen, `/atlas/` on every page); `/<g class="place [a-z]+ here">/g` matches once when `p.dir in PLACES` and never otherwise, and the first `cx="..."` after it equals `String(PLACES[p.dir].x)`; `<g class="you">` occurs the same number of times; the fold contains no `aria-current`.
   - Stub red: the component renders `<details class="atelier-fold"><summary class="atelier-press">the chart of the atelier</summary></details>` and nothing else (red on the hrefs).
   - Mutations (prover): `href === path` in the component becomes `href === "/"`; the layout's `{!trail && <AtelierChart path={path} />}` becomes `{false && <AtelierChart path={path} />}`.
4. **AT1, `e2e/suites/cluster/chart.ts`**, `at1Press(k)`: at 1280x800 and at 1024x768 (`Emulation.setDeviceMetricsOverride`, `mobile: false`), on `/faq/`, `/explorer/`, `/prospect/` and `/`: `k.goto(page)`; a settle (throwing, label `AT1 rest <page>`) until every animation `header.chrome.getAnimations()` lists has `playState === "finished"` (a room's `ink-in`; home's cluster carries none), `#status` is absent or empty, and two consecutive reads of `#sheet`'s rect agree; its last read is `REST` (the fold's `open`, the press's rect, `header.chrome`'s rect, `#sheet`'s rect or null, and every `header.chrome :is(a, button, summary, input, select, [tabindex])` whose computed `pointer-events` is `none`); a REAL press at the press's rect centre; a measurement poll (`k.settle`, judged on two equal consecutive reads of the fold's `open` and `nav.atelier`'s `checkVisibility()`), then one read `OPEN` (those two, the panel's rect, `header.chrome`'s rect, `#sheet`'s rect, `innerWidth`, `innerHeight`); a second REAL press at the same point, the same poll, one read `SHUT`. The 1280x800 metrics are put back in a `finally`. Check name: `"AT1 a real press on the chart of the atelier's press opens it and a second shuts it, at 1280 and at 1024 on the Q & A, the Explorer, the Prospect and home, and nothing in the head cluster that takes a press is dead to the hand: open, the panel stands below the cluster and inside the window, and neither the cluster nor the fitted sheet moves (Issue #671; the Issue #520 class)"`. Asserts per row: no dead control in `REST`; `REST.open === false`; `OPEN.open && OPEN.shown`; `OPEN.panel.top >= OPEN.cluster.bottom`; `OPEN.panel.right <= OPEN.innerWidth && OPEN.panel.bottom <= OPEN.innerHeight`; every field of `cluster` and of `sheet` within 0.5px between `REST` and `OPEN`; `SHUT.open === false && !SHUT.shown`.
   - Red first (commit 5): the press exists but is not on the allowlist, so it is dead to the hand and the press opens nothing; AT1 reds on `OPEN.open` and on the dead control.
   - Mutations (prover): `header.chrome :is(a, summary)` back to `header.chrome a` in `public/shell.css`; `.atelier`'s `position: absolute` to `position: static`.
5. **AT2**, `at2Places(k)`: at 1024x768, on every route in `Object.keys(ROUTE_NAMES)` (the tree: every page that carries the chart and a place; the atlas page carries no chart) plus `/specimen/` (the page outside the tree, the same-run control for "no pin"); again at 1280x720 on `/explorer/` and `/print-room/` (where the road buttons rise); at 1024x650 on `/reading-room/` (where the instrument strip rises); and at 1280x720 on `/explorer/` with the Chart Table's drawer opened first by a REAL press at `#chart-drawer-tab`'s centre and a settle (throwing) until `.chart-drawer`'s computed `display` is not `none` and two reads of its rect agree: `k.goto(page)` and AT1's rest settle; the fold opened by setting `open = true` through `evaluate` (wiring only: AT1 proves the press, said at the check in one line); one read: for each `nav.atelier a.place`, its `href` attribute and whether `document.elementFromPoint` at its `text`'s rect centre AND at its `.pip`'s rect centre each resolve to the link or inside it; the `.place.here` pip's `cx` and `cy`; whether `.you` exists; every `nav.atelier text` element's rect; the count of `[aria-current]` inside `nav.atelier`; and, on an 8px grid inside the panel's rect (inside the window), the number of points whose `elementFromPoint` lies outside `nav.atelier`. Check name: `"AT2 on every page in the tree and on the Specimen, the open chart of the atelier offers every place but the page's own, the Atlas isle among them, as a link that takes the hand at its name and at its pip, counted against the drawing, pins the page's own place and no other, carries no page mark, lets no two of its words overlap, and nothing in the room paints over it (Issue #671; the round's label overlaps, design/nav-wayfinding/README.md)"`. Asserts per page: the sorted hrefs deep-equal `Object.keys(PLACES).filter((r) => r !== page).sort()`; every link hit at both points; `here` present iff `page in PLACES`, at `PLACES[page].x` and `.y`; `.you` iff `page in PLACES`; zero `[aria-current]`; zero pairs of word rects overlapping by more than 0.5px on both axes; zero grid points outside the panel. The blind spots, named at the check in one line: two points per link, and an 8px grid, so a cover over part of a name or narrower than 8px that misses every point passes; they err toward passing.
   - Red first (commit 5): before the sheet gives `.atelier` `pointer-events: auto`, the panel inherits `none` from `header.chrome`, so every grid point on its ground answers to the page beneath and the grid assertion reds on every page (its links still answer, through `header.chrome a`).
   - Mutations (prover): `PLACES["/faq/"]` to `{ x: 272, y: 280, rank: "village", name: "Q & A" }` (its name lands on the Reading Room's); `href === path` to `href === "/"` in the component; `header.chrome:has(.atelier-fold[open]) { z-index: 19; }` removed (measured: 10% and 12% of the grid on the Print Room and the Seed of the Day at 1024x768); its `19` to `11` (measured: 8% on the Reading Room at 1024x650 and 28% on the Explorer with its drawer open at 1280x720).
   - The fallback, should the lane budget call for it (Rosters and doctrine): the 1024x768 sweep drops the Glossary, the Gallery, the Ribbon, the Portfolio and the Prospect, whose links and pin AR1 already holds in the markup and whose furniture met the panel on no measured row; every other row stays.
6. **AT3**, `at3Keys(k)`: at 1280x800 on `/faq/`: the press focused through `evaluate` (`.focus()`, wiring); Enter (`Input.dispatchKeyEvent` keyDown then keyUp, `key: "Enter"`, `code: "Enter"`, `windowsVirtualKeyCode: 13`, `text: "\r"` on the keyDown); read `open`; Tab (`key: "Tab"`, `code: "Tab"`, `windowsVirtualKeyCode: 9`); read whether `document.activeElement` is an `a.place` inside `nav.atelier`; Escape (`key: "Escape"`, `code: "Escape"`, `windowsVirtualKeyCode: 27`); read `open` and whether the active element is the press; Enter again; Tab once per place link plus one (`Object.keys(PLACES).length` Tabs on the Q & A, which has eleven links), then read `open` and whether the active element lies outside the fold; Enter on the press again (focused through `evaluate`); a REAL press at the panel's rect origin plus (6, 5), inside its own padding and off the drawing; read `open`; then, after asserting `document.elementFromPoint(700, 60)` lies inside no `a` or `button`, a REAL press at (700, 60); read `open` and `location.pathname`. Check name: `"AT3 the chart of the atelier answers the keyboard and the hand: Enter opens it, Tab walks into its places, Escape shuts it and hands the focus back to its press, Tab past its last place shuts it, a click on the panel itself leaves it open, and a click anywhere else on the page shuts it (Issue #671; Alex, 2026-10-16, D1)"`. Asserts: open after Enter; a place focused after Tab; shut and the press focused after Escape; shut with focus outside after the Tabs; open after the panel press; shut after the press elsewhere, the pathname still `/faq/`.
   - Red first (commit 5): no binder, so Escape, Tab-out and the click elsewhere leave it open.
   - Mutations (prover): the Escape listener removed; the `click` listener removed; the `focusout` listener removed; `pointer-events: auto` removed from `.atelier` (the press on the panel falls through to the page, whose click shuts it).
7. **AT4**, `at4ScriptsOff(k)`: at 1280x800: `Emulation.setScriptExecutionDisabled({ value: true })`, `k.goto("/faq/")`, a REAL press at the press's centre, AT1's poll, read `open` and the panel's visibility; a second REAL press, read again; in a `finally`, `setScriptExecutionDisabled({ value: false })` and `k.goto("/faq/")`. Check name: `"AT4 with scripts off the chart of the atelier still opens and shuts by a real press on the Q & A, the scripted run of AT1 its same-run control (Issue #671; Alex, 2026-10-16, D1)"`.
   - Red first (commit 5): the press is dead to the hand without the allowlist, as in AT1; the scripts-off class itself is held by the mutation below.
   - Mutation (prover): the component's `summary` carries `style="display: none"` (an inline style, which outranks the sheet's `display: block`, where a `hidden` attribute would lose to it: the trap `public/atelier.css` records for `.legend-btn`), and `bindAtelier` begins with `doc.querySelector<HTMLElement>("details.atelier-fold summary")?.style.removeProperty("display")` (the press shows only once the script runs; AT1 stays green, AT4 reds).
8. **AT5**, `at5Spacing(k)`: at 1280x800 on `/`, `/specimen/`, `/faq/`, `/seed-of-the-day/`, `/ribbon/` and `/prospect/`, and at 1024x768 on `/` and `/prospect/` (the line it serves says every width; the cluster measured identical at 1024): one read of the press's rect, the right edge of a `Range` over the press's text node, and every `header.chrome :is(nav.rooms, .trail, .also) a` rect; `spacing([press, ...links])[0]` (the press's own margin, `spacing` from `e2e/suites/cluster/trail.ts`). Check name: `"AT5 the chart of the atelier's press clears a thumb's 24px round every link in the head cluster, on its own line under the nav (home, the Specimen) and at the trail's end (the Q & A, the Seed of the Day, the Ribbon, the Prospect), and its box ends with its words (Issue #671; Alex, 2026-10-03, on Issue #668)"`. Asserts each margin `>= 0` and the press's right edge `<=` its words' right edge plus 1px. Measured on the spike: margins 1.1, 1.1, 1.3, 2.8, 3.5, 19.9.
   - Red first (commit 5): undressed, the `summary` takes the cluster's full width under the nav, so the box reds on home and the Specimen.
   - Mutations (prover): `--press-gap: 0.7rem` to `0.42rem` (the mock's; reds the margin on home and the Specimen); `width: fit-content` removed from `.atelier-press` (reds the box on home and the Specimen).
9. **AT6**, `at6Dress(k)`: at 1280x800 on `/faq/`: one read of the press's computed `color`, `backgroundColor` and `boxShadow` at rest, and one painted row through it (`sampleRow` in `e2e/support/pixel.ts`, at the press's vertical middle from its left edge plus 2px to its right edge minus 2px); a `mouseMoved` to its centre and DR15's settle (`:hover` and no running animation), and the same computed read under the hand; a `mouseMoved` to (1, 700); the trail's `Vellum` link focused through `evaluate`, then Tab (as AT3); the press's `matches(":focus-visible")`, `outlineStyle`, `outlineWidth`, `outlineColor`, `outlineOffset`; Enter (as AT3), which opens the chart with the focus kept on the press; the same computed read and painted row with the chart open, and the ring read again; a `mouseMoved` to the press's centre and DR15's settle, and the computed read open and under the hand; Escape. Check name: `"AT6 the chart of the atelier's press is parchment on the deep at rest and parchment-bright under the hand; while the chart is open it is lit, dark ink on a painted cream ground, and stays lit under the hand, never in its hover's dress; and under keyboard focus, shut or open, it wears the chrome's ring, 2px solid parchment-bright at a 2px offset (Issue #671; Alex, 2026-10-16, D10; a toggle press is lit when on, never in the dress of its own hover; the focus ring is one face, Issue #324)"`. Asserts (`nearRgba`, `tokenRgba` and `PAGE_RGBA` from `e2e/support/pixel.ts`): at rest colour near `--parchment` and background transparent; hovered shut colour near `--parchment-bright`; open colour near `--ink-dark`, background near `--parchment-bright`, `boxShadow` naming `--parchment-bright`'s colour; open and hovered the same three; the open row's median pixel near `--parchment-bright`, where the rest row's median, its same-run control, is not (it reads the deep); the ring, shut and open, `:focus-visible` true, `outlineStyle === "solid"`, `outlineWidth === "2px"`, `outlineOffset === "2px"`, colour near `--parchment-bright`.
   - Red first (commit 5): undressed, the press wears the browser's own ring, no hover colour and no lit ground.
   - Mutations (prover): `summary` removed from the house ring in `public/house.css`; `summary` removed from the chrome's ring recolour in `public/shell.css`; `.atelier-press:hover, .atelier-press:focus-visible` removed; `.atelier-fold[open] > .atelier-press` removed; the hover rule widened to `header.chrome .atelier-fold .atelier-press:hover { color: var(--parchment-bright); background: none; }` (it then outranks the lit dress and strips the ground under the hand).
10. **AT7**, `at7Rides(k)`: on `/` at 1280x800, and at a 640x800 window (`k.setNarrowViewport(640, 800)`) on `/`, `/explorer/` and `/faq/`: open by a REAL press and assert the fold open (a dead press cannot pass on a shut panel); read the press's and the panel's rects, `scrollX` and `scrollY`; at 640 `scrollTo({ left: document.documentElement.scrollWidth, top: 0, behavior: "instant" })`, at 1280 on `/` `scrollTo({ left: 0, top: 400, behavior: "instant" })`; a settle (throwing) until the scrolled axis has LEFT 0 and two reads agree; the same read. `clearMobile()` and the 1280x800 metrics in a `finally`. Check name: `"AT7 the open chart of the atelier moves with its press and the cluster wherever the page moves under them: on home, whose cluster rides the page, scrolled down at 1280 and sideways in a window narrower than the 1024 page, and sideways on the Explorer and the Q & A, whose cluster stands in a contained room (Issue #671; Issue #764 ruling 2A)"`. Asserts per row: the fold open; the scroll's amount over 0; the press's and the panel's moves equal within 0.5px on both axes and equal to minus the scroll. Measured on the spike: every row moved by exactly the scroll.
    - Seen red by mutation only: before the dress the panel stands in flow and rides anyway.
    - Mutation (prover): `.atelier`'s `position: absolute; left: 0; top: calc(11.6rem - var(--chrome-y));` to `position: fixed; left: var(--chrome-x); top: 11.6rem;`. Named reds: AT7's two rows on home, where the panel stayed put (measured on the spike: 0 against the press's -384 sideways and -400 down); on the Explorer and the Q & A a fixed panel resolves against the same contained ancestor as the cluster (`contain: layout` on `body.chart-room:has(.stage)` in `public/atelier.css` and on `.desk-layer.on` in `public/shell.css`) and rides anyway (measured), so those rows hold the claim without biting on this mutation.
11. **AT8**, `at8Back(k)`: at 1280x800 on `/faq/`: `k.goto("/faq/")`; `evaluate` plants `window.__at8 = "warm"` (the witness that Back took the page cache's road, the shape CD37 in `e2e/suites/chart-drawer/homes.ts` uses); a REAL press at the press's centre and AT1's poll; a REAL press at the centre of `nav.atelier a[href="/glossary/"] text`; a settle (throwing) until `location.pathname === "/glossary/"` and `document.readyState === "complete"`; `evaluate` `history.back()` (a rejected evaluate tolerated, as the navigation tears the context down); a settle (throwing) until `/faq/` and complete; one read of `window.__at8` and the fold's `open`. Check name: `"AT8 a reader who leaves by a place on the chart of the atelier and comes Back finds the page as they left it but the chart shut, the page restored from the browser's page cache, its planted marker the witness (Issue #671)"`. Asserts: the marker `=== "warm"`; `open === false`. Measured on the spike: without the `pagehide` shut, warm and open; with it, warm and shut.
    - Red first (commit 5): no binder, so the page comes back open.
    - Mutation (prover): the `pagehide` listener removed.
12. **The corners link read** (`e2e/suites/corners.ts`, `LINKS`): the existing CO1 and CO4 now read the chart's links too, the isle's `/atlas/` among them.
    - Red first (commit 5, before the edit): with main's read, CO1 and CO4 throw on the chart's SVG links (measured).
    - Mutation (prover): in the component, `<a href={href}` becomes `` <a href={`${href}x/`} `` (every chart link 404s). Named reds: CO4, AT2, AR1.
13. **CL1 re-anchored**, `e2e/suites/cluster.ts`: in `cl1Wash`'s read, `const foot = document.querySelector("header.chrome .atelier-press").getBoundingClientRect();` and the payload gains `foot: { bottom: foot.bottom }`; the two bottom bounds become `wash.box.bottom - wash.foot.bottom` in place of `wash.box.bottom - wash.nav.bottom`; the right bounds keep `wash.nav.right`. The check name's "it ends 1.5 to 3rem past the nav's right and bottom" becomes "it ends 1.5 to 3rem past the nav's right and past the foot of the cluster's last line, the chart's press (Issue #671)". Measured: on home the wash ends 1.8rem past the press, as on main it ends 1.8rem past the nav; against the nav it reads 3.31rem and reds.
    - Mutation (prover): home's `header.chrome::before` inset bottom in `public/index.css`, `-1.8rem` to `-3.4rem`.

**The prover owes**: AC1, AC2, AR1, AT1 to AT8, the corners read and CL1, with the mutations named above. **The implementer proves under step 15**: nothing left over.

## Order of commits

1. `#671 Archive the plan, and the chart of the atelier's drawing as data, failing` : `handbook/plans/671/671-plan.md` (this plan as finished); `src/layouts/atelier-chart.ts` with `PLACES = {}` and `TRACKS = []` and the rest filled; `test/site/atelier-chart.test.ts`. AC1 and AC2 red on their assertions; `npm run check` clean. Push.
2. `#671 The drawing filled from the round's reference markup and the ruled isle` : `PLACES` and `TRACKS` filled; AC1 and AC2 green.
3. `#671 The chart of the atelier rendered, failing` : `src/layouts/AtelierChart.astro` as AR1's stub; the layout's import, sheet link and the two call sites; `public/chart-of-the-atelier.css` holding only its first comment line and `:root { --press-gap: 0.7rem; }`; AR1 and the alias-test edit in `test/site/astro-scaffold.test.ts`; `HOUSE_SHEETS`, its test line, and `SHELL_SHEETS`. AR1 red on the hrefs; the alias test green.
4. `#671 The chart of the atelier drawn` : the component in full. AR1 green.
5. `#671 The chart of the atelier's browser checks, red` : `e2e/suites/cluster/chart.ts`, `e2e/suites/cluster.ts` (the steps and CL1), `e2e/suites/cluster/trail.ts`, `e2e/suites/corners.ts`. After `npm run build`, `VELLUM_E2E_SUITES=cluster node e2e/run.ts` reds AT1, AT2, AT3, AT4, AT5 and AT6 on the assertions their items name, and AT8 on its settle (the press is dead until commit 6, so the chart never opens and the Glossary is never reached); record each red line for the PR body.
6. `#671 The chart of the atelier's dress, and the press in the cluster's allowlist and the house's ring` : the sheet in full; `public/shell.css` and `public/house.css`. AT1, AT2, AT4, AT5 and AT6 green; AT3 still red, and AT8 now red on its assertion (the page comes back with the chart open).
7. `#671 Escape, a click elsewhere, focus leaving and leaving the page shut the chart` : `src/site/shell/atelier.ts`, `src/site/shell/app.ts`. AT3 and AT8 green; every AT check green.
8. `#671 Specs, errata, the lane's measured seconds` : the three specs, the errata edits, `MEASURED_SECONDS.cluster`.

Commit before every prover and plate-reader dispatch.

## Rosters and doctrine

- **`HOUSE_SHEETS`** in `scripts/lint/sheet-owners.ts` and its test, **`SHELL_SHEETS`** in `e2e/suites/runninghead/shell.ts`: the new sheet, linked on every page (Files). The stylesheet lint, `SITE_SHEETS` and `sheetsOnDisk` reach it by existing.
- **`MEASURED_SECONDS.cluster`** in `test/e2e/lane-timings.test.ts`: AT1 to AT8 add about 39 page loads, about 21 of them chart rooms that draw a chart; at the suite's own committed rate (18.1 s for about 27 loads, mostly document rooms) and at 2 to 2.5 s for a chart room, that is roughly 50 to 65 s of CI time. Commit 8 enters an estimate (the committed 18.1 times the ratio of the cluster suite's local wall clock after over before, `VELLUM_E2E_SUITES=cluster node e2e/run.ts` once on the branch's build and once on `origin/main`'s, one at a time); once the pull request's CI has run, it is corrected from that run's slow-tier lane B job against main's, the way the file's other re-measures were, and the provenance sentence gains a clause naming the runs. Lane B has 88.9 s of room under the balance cap (computed from the committed values). If the estimate is over 80 s, AT2 takes its fallback (Tests, item 5), which removes five chart-room loads, and the estimate is entered again.
- **`handbook/specs/ui-design.md`**, The room and its furniture:
  - the head cluster bullet's first sentence becomes: "**The head cluster**, top left: wordmark, flourish tagline, dot-separated rooms nav and, on every page with a seat in the route tree, the trail under it, the press that opens the chart of the atelier riding the trail's line, or taking its own under the nav where the page has no trail, directly on the deep."
  - after the paragraph "**The head cluster says where the reader is standing, on every page with a seat in the route tree.** ...", a new paragraph: "**The chart of the atelier is the listing, laid over the trail as a layer.** Its press opens a small chart of the site's own shape: every route in the tree is a place and the atlas an isle off home (`PLACES` in `src/layouts/atelier-chart.ts`, held to the tree by `test/site/atelier-chart.test.ts`), the roads are drawn, an alias is a dashed track, home sits at sea as a ring, and a pin stands on the page's own place, which is the one place that is not a link and carries no page mark. Pull it and the nav and the trail are whole. It opens and shuts as a fold the browser keeps, so it works with scripts off, and the shell's script adds Escape, a click elsewhere, focus leaving it and leaving the page. Its press is lit while it is open, dark ink on a cream ground, which its hover never wears. Its panel stands inside the head cluster, so it rides with the cluster on every page and keeps its place on the 1024 page; the cluster rises above the room's furniture while it is open, so no piece of the room paints over it; a closed fold's content stands down by display, since a script reading it otherwise finds its boxes. On a window too short for it the panel is cut at the window's foot, a cost recorded in `handbook/errata/site.md`. Every word on it wears a wide outline in the panel's own ink, so the roads and the coast stop short of the names. **Provisional until the post-use review:** the drawing (the coast, the places, their ranks and labels, the roads, the atlas isle), the press's words, its seat at the trail's end and its lit ground, the panel's size, opacity and seat, the key line, the outline, the cut on a short window, and the press's gap under the nav."
- **`handbook/specs/ui-design.md`**, Colour, contrast and legibility (D9): "**A control's font size does not go below 16px in the corner chrome**, because a smaller input font makes iOS Safari zoom the page on focus." becomes "**A control a reader types into, a field or a select, does not go below a 16px font in the corner chrome**, because a smaller input font makes iOS Safari zoom the page on focus. A press takes no typing and keeps the size of the line it rides, as the chart of the atelier's does."
- **`handbook/specs/site-architecture.md`**, How a page is authored:
  - "The atlas stays out of both, because it is one world's generated output rather than a room, with the home card as its way in." becomes "... rather than a room, with the home card and the chart of the atelier's isle as its ways in."
  - "A child is seated under its room in `ROUTE_CHILDREN` beside it: off the nav's top line, inside the discovery routes, and named by the trail, which is how ..." becomes "... inside the discovery routes, named by the trail and listed by the chart of the atelier, which is how ...".
  - "A destination is off the tree but inside the discovery routes, which is how `/atlas/` is reached," becomes "A destination is off the tree but inside the discovery routes, which is how `/atlas/` is reached (the chart of the atelier draws it as an isle off home),".
  - "A reading page is the `.astro` file plus, if it is a room, its `NAV_ITEMS` entry or its seat in `ROUTE_CHILDREN`, its name in `ROUTE_NAMES`, and its own sheet." becomes "... its name in `ROUTE_NAMES`, its place on the chart of the atelier (`PLACES` in `src/layouts/atelier-chart.ts`, which `test/site/atelier-chart.test.ts` reds without), and its own sheet."
  - "The rosters a page or a sheet joins", after `ROUTE_CHILDREN` in `src/layouts/nav.ts`: "; `PLACES` in `src/layouts/atelier-chart.ts`".
- **`handbook/specs/site-architecture.md`**, "The shell dresses once" (Alex, D11: "Its own sheet"; the line cites his Issue #779 comment 6067462530): "Every shared shell rule lives in `public/shell.css`, and a page's own sheet carries page-specific rules only." becomes "Every shared shell rule lives in `public/shell.css`, save the dress of a component the shell seats on every page, which is its own sheet, linked on every page and named in `HOUSE_SHEETS` (the chart of the atelier's, `public/chart-of-the-atelier.css`); a page's own sheet carries page-specific rules only."
- **`handbook/specs/rulebook.md`**, Retired rules, the nav paragraph: "a room's children are seated under it in `ROUTE_CHILDREN`, which the trail reads." becomes "..., which the trail and the chart of the atelier read."
- **`handbook/errata/site.md`**:
  - under `## Open`, the PR #666 row on the chart's coverage: its trailing parenthesis gains `; Issue #671 measured it built on 2026-10-16 (the press at the trail's end): open over each chart room's fitted sheet, 54.2 to 64.8% at 1280 and 80.5 to 100% at 1024 (the Specimen), shut 0%`. The row stays: the cost is the ruled direction's own.
  - under `## Open`, a new row: `- PR #<this PR> (2026-10-16, high): on the chart of the atelier, four place names keep one worst pixel under 4.5:1 where the coast's or a road's edge meets a letter's edge under the 8-unit outline: "The Print Room" 2.46, "The Glossary" 2.86, "The Explorer" 3.17 and "Q & A" 3.65 (1024x768, the Explorer and the Q & A, the Atlas isle drawn), with no more than 1% of any name's surrounding pixels under 4.5 and every median 10.2 or better. Left by the author: the drawing ruled from stills sets those names on or beside the lines, and the outline Alex ruled (Issue #671 D7) narrows but does not close them; measured by vellum-plate-reader at Issue #671's step 6. Searched errata for "atelier", "outline", "halo": none.`
  - under `## Open`, a new row: `- PR #<this PR> (2026-10-16, high): a place link's focus ring on the chart of the atelier crosses the road leaving its pip, where it reads 1.21:1 at its worst pixel against a median of 11.59 (1.8% of its ground under 4.5, the Vellum landing on the Q & A at 1280). Left by the author: the house ring drawn round a link on a drawing of lines; measured by vellum-plate-reader at Issue #671's step 6. Searched errata for "focus ring", "atelier": none.`
  - under `## Ruled and left`, a new row: `- PR #<this PR> (2026-10-16): on a window shorter than about 600px the open chart of the atelier is cut at the window's foot and nothing scrolls to reach the rest: at 1024x540 the key line, at 1024x474 "Q & A" and "The Glossary", at 1024x430 also "Vellum" and "The Gallery", at 1024x388 and 1024x360 seven of the twelve names; the Atlas isle is never cut; on home the page scrolls to them. Ruling: Alex, Issue #671 step 6, D8, "Leave cut off" (issuecomment-6221171042). Searched errata for "atelier", "short window": none.`
- **The issue's own instructions overridden, each named in the PR body**: build step 1's "A `button` in the cluster's `header-extra` slot" (a `summary`, drawn by the layout beside the trail, the slot left unused, as Issue #668 left it); build steps 3 and 4's narrow-width sizing and overhang (moot, Issue #765); build step 5 (moot, the drawer is gone); build step 6 (moot under D2); the "Process" paragraph's "schedule the post-use re-review ... as a dated ledger on Issue #667" (Issue #736 is that review; its docket gets this pull request's feel calls, as every sub's does). The deviations from the ruled stills, each with Alex's ruling: the press at the trail's end (D2), the Atlas isle (D3), the outline (D7).
- **Issue #736's docket**: a comment there, before the pull request opens, pointing at the two rulings comments and listing this pull request's feel calls: the drawing and the Atlas isle, the press's words and its seat at the trail's end, the panel's size, opacity and seat, the key line, the words' outline, the cut on a short window, the press's 0.7rem gap under the nav, the place links' brightening, the press's lit cream ground while open (D10), the ring adjoining that ground and the star at its edge (Calls 34 and 35), and Escape, a click elsewhere, focus leaving and leaving the page shutting it.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- After `npm run build`, one at a time, never the lanes: `VELLUM_E2E_SUITES=cluster node e2e/run.ts`, then `corners`, `stage`, `runninghead`, `landfall`, `home`, `specimen`, `broadside`. On the spike's `final` build the eight ran 215 of 215 green with the fixes this plan carries (FL1, EA7 and EA8 skipped on purpose by `E2E_SKIPS`, as on main).
- The acceptance: AT1 to AT8 and AR1 (the chart opens, lists, pins and rides), AC1 and AC2 (the drawing holds the tree and the isle), CO4 (every chart link answers, `/atlas/` among them), and every cluster, corners and stage check green.
- **`vellum-plate-reader` is owed** at step 11 on the built pages against `prospect-d-c-1280`, `prospect-d-c-shut-1280`, `home-d-c-1280`, `faq-d-c-1280`, `faq-d-c-shut-1280` and `crop-d-c-shut` (the press at the trail's end, the isle and the outline are the ruled deviations): 1024x768, 1280x800, 1280x720, 1024x474 and a 640x800 window; word overlaps on all twelve pages; the panel inside the window at 1024x768; an 8px hit-test grid over the open panel on every page; coverage of every chart room's sheet open and shut at 1024 and 1280; painted contrast of every place name, `you are here`, the cartouche, the rose's N, the key line, the press at rest and under the hand, and the rings of the press and of a place link, by the house's worst-pixel method; and the cut at 1024x474 against the ruled errata row.
- `vellum-guard-prover` on AC1, AC2, AR1, AT1 to AT8, the corners read and CL1.

## Measured on the spike

The planner's throwaway spike (uncommitted, in its tree; builds under `out/671-spike/`), 2026-10-16, against main's own build at e94fa41e as the control. Each figure names its build: `b` (the fold at the trail's end, no isle, no outline, no lift), `atlas-b3` (with the isle, the 8-unit outline and a lift to 11), `atlas-b4` (the lift at 19), and `final`, the ruled design as this plan writes it (the isle, the outline, the lift at 19, the four-listener binder with `click`, `focusout` and `pagehide`) save its open press's dress, an underline no figure here depends on; and `lit-b`, which is `final` with D10's ruled lit ground and the plan's hover rule. The planner's probe drove a real browser through the harness (`start()` in `e2e/harness.ts`): real mouse presses at the press's centre, real key events, `elementFromPoint` at each place link's name and pip and on an 8px grid, scrolls, and script execution disabled. The plate reader's four rounds are in `out/671/measure-*.json` and `measure-tables.md`.

- **The ruled design** (`final`): the eight suites `cluster`, `corners`, `runninghead`, `stage`, `landfall`, `home`, `specimen` and `broadside`, one at a time, 215 of 215 green (FL1, EA7 and EA8 skipped on purpose); Escape, a click elsewhere, Enter, Tab and scripts off as design item 1 says; twelve Tabs from the press on the Q & A walked through its eleven places and out, and shut it; Back from the Glossary restored the Q & A from the page cache with the chart shut; the inlined shell script 2,292 bytes and the Q & A 29,877 bytes.
- **The ruled combination before the binder and the lift were final** (`atlas-b3`): every place link answered a hit-test at its name and its pip (11 of 11 on a page in the tree, 12 of 12 on the Specimen); the pin stood on the page's own place; the panel stood at (25.6, 185.6), 544 by 399.5, at 1280x800 and at 1024x768 alike; opening it moved neither the cluster nor any fitted sheet; a second press shut it; Escape, a press elsewhere, Enter and Tab behaved as design item 1 says; with script execution disabled a real press opened it; at 640x800 scrolled 384px right the press and the panel both moved by -384; zero overlapping words and zero outline reaching another word or pip on all 24 page-and-width rows; the isle never cut on a short window.
- **The focus clause** (B2 with the listener added at runtime): a press on the panel's padding or its open sea moved focus to the page's body and left the chart open; eleven Tabs from the press walked through the ten places and out to the next control and shut it; Shift+Tab from a place back to the press left it open.
- **The lit press** (`lit-b`, `measure-round5.json`): its words 10.19 to 10.25 at the worst pixel on cream, 10.44 median, at 1280 and 1024 on the Q & A and the Prospect; open and under the hand, dark ink on cream exactly as at rest; its ring 2px at a 2px offset, adjoining the cream, 8.28 against the deep outside; 17.5px of the deep between the trail's underlined "The Prospect" and the cream.
- **Bytes**: the chart adds about 4.5 KB to every page's HTML (`final`: the Q & A 25,363 to 29,877; on `b`, 8,576 to 9,855 gzipped); the inlined shell script is 2,292 bytes on `final` against 1,778 on main and the 4,096-byte inline limit.
- **The cluster** (`header.chrome`'s bottom): main 101.8 (home, the Specimen), 127.4 (a room), 149.2 (the Prospect); the ruled seat 126.0, 127.4, 149.2. The band on the Q & A and the Glossary is 169.6.
- **The press's thumb clearance** (`spacing` in `e2e/suites/cluster/trail.ts`): home 1.1, the Specimen 1.1, the Q & A 1.3, the Seed of the Day 2.8, the Ribbon 3.5, the Reading Room 6.8, the Portfolio 15.4, the Prospect 19.9. At a 0.6rem gap home read -0.5. The trail's own tightest margin under DR11 is 0.61.
- **What paints over the open panel** (8px grid, without the lift): 10% on the Print Room and 12% on the Seed of the Day at 1024x768, 6% on the Print Room and 1.5% on the Explorer at 1280x720, 1% on the Print Room at 1280x800, all the road buttons; with a lift to 11, 0 on all 24 rows at 1024x768 and 1280x720, but the Reading Room's strip took 8% at 1024x650 and the Explorer's opened drawer 28% at 1280x720, 16% at 1024x768 and 8% at 1280x800; with the lift to 19 (`atlas-b4`), 0 on every one of those rows.
- **Back** (`atlas-b4` on the Q & A, a real press on the chart's Glossary link, then `history.back()`): the page came back from the page cache (a planted marker alive) with the chart open; with a `pagehide` shut added, the same road with the chart shut.
- **The e2e suites**, one at a time through `VELLUM_E2E_SUITES` against the spike's builds (`VELLUM_SITE_DIR`), never the lanes: the first spike (the sheet named `atelier-chart.css`, the `svg` a `role="group"`, the closed fold not stood down, main's checks) redded L23, BR9, CL1, CO1, CO4, NS1, NA4, EA1, EA3, EA4, EA6 and EL1; arm B with the fixes this plan carries but the isle, the lift and the outline, and the spike's versions of CL1, `LINKS` and DR11's read, ran `cluster`, `corners`, `runninghead`, `stage`, `landfall`, `home`, `specimen` and `broadside` 215 of 215 green; the press on its own line (arm A) ran `cluster`, `corners` and `stage` 43 of 45, red on exactly NA4 and EA3; the ruled combination (`atlas-b3`) ran `cluster` and `corners` 34 of 34 green (FL1 skipped on purpose), CO4 reading the isle's `/atlas/` among the chart's links.

## Calls made

1. **The press is a `summary`**, where the issue's build step 1 says "a `button`". Rule: D1's fold; a disclosure's press is its `summary`.
2. **The press joins the cluster's pointer allowlist, the chrome's ring recolour and the house ring by widening each selector to `summary`.** Rule: Gate 3 item 2 (restructure, never another override); `handbook/specs/ui-design.md`, "The focus ring is one face".
3. **Every place but the page's own is a link; the page's own carries the pin, no link and no page mark.** Rule: Alex's 2026-09-22 ruling that the chart IS the listing; the issue's own e2e line ("every place's road is pressable where the drawing makes it a link"); the one-mark rule.
4. **The chart is a `nav` named "The chart of the atelier"; its `svg` carries no role; the decorations are hidden from assistive technology.** Rule: `role="img"` (the mock's) hides the links inside it; `role="group"` redded BR9 (measured).
5. **The `✦` carries an empty alternative** (`content: "✦ " / ""`). Rule: a press's accessible name is its words.
6. **The sheet is `public/chart-of-the-atelier.css`** (Alex, D11), its clause written into `handbook/specs/site-architecture.md`'s "The shell dresses once". Rule: `handbook/specs/ui-design.md`, "A new component's CSS goes in its own sheet"; `public/shell.css` would pass 400 lines; L23 and `kitClasses` read every `atelier*.css` as the kit (measured).
7. **The mock's narrow blocks are not lifted and the panel is 34rem flat.** Rule: Issue #765's re-baseline; `vellum/css-no-narrow-width`; every piece keeps its 1024 size below the floor.
8. **The panel stands inside the cluster at 11.6rem from the window's top.** Rule: the fidelity rule for the 11.6rem; Gate 3 item 3 for riding with the cluster (measured at 640).
9. **The press's box is its words** (`width: fit-content`). Rule: the cluster passes the hand through off its links and controls (CL5's claim); a full-width `summary` took the whole row (measured); AT5 holds it.
10. **The press's gap under the nav is 0.7rem, not 0.42rem.** Rule: a thumb's 24px from every cluster link (Alex, 2026-10-03, on Issue #668), measured at 1.1px clearance; the faces are the site's own files, so the metrics are the same on CI, where the trail's links pass DR11 at a tighter 0.61.
11. **A closed fold's content stands down by `display: none`.** Rule: measured (NS1, EA1, EA4, EA6, EL1 read the closed chart's words as ink without it); a hand-measured browser behaviour earns its one comment line.
12. **The labels are the stills' ("The Ribbon", "Today", "Q & A"), and the isle is "The Atlas" at (44, 128) with its road from Vellum, last in the lists.** Rule: the fidelity rule, to the stills and to the isle Alex ruled from (`671-q3-*`).
13. **The place links brighten to parchment-bright under the hand and focus.** Rule: the trail's links do the same (`handbook/specs/ui-design.md`; DR15); the mock drew no links.
14. **No print rule of the chart's own.** Rule: `handbook/specs/ui-design.md` Print, satisfied by the cluster's own stand-down in `public/shell.css`'s print block, which the panel stands inside.
15. **The checks join the cluster suite's family, not a new suite.** Rule: `handbook/specs/site-architecture.md` (a new suite joins five rosters); the cluster suite owns the head cluster's checks.
16. **CO1's and CO4's link read takes the attribute.** Rule: their claim is every link on every page, which now includes the chart's SVG links, whose `href` property is not a string (measured).
17. **DR11 keeps reading main's links** (`.trail a`, `.also a`). Rule: a guard changed only so it reads what it read before is not loosened.
18. **CL1's bottom bound is re-anchored to the cluster's last line.** Rule: its claim is a pool sized by the cluster, and the cluster's last line on home is now the press (measured).
19. **Escape hands focus back to the press only when focus was inside.** Rule: a key that shuts a panel does not move a reader's focus from where they were.
20. **The press is lit while the chart is open, dark ink on cream with a 0.2em cream spread, and stays lit under the hand** (Alex, D10, as `671-q10-*-b-ground.png` shows). Rule: the ruling, and `handbook/specs/ui-design.md`'s toggle line, which the lit ground satisfies as written, so the line is not edited.
21. **The open fold lifts its cluster to z-index 19.** Rule: measured (the road buttons at 10, the Reading Room's strip at 12 and the Explorer's opened drawer at 18 painted over the panel); 19 is the least lift that clears the highest piece the panel can meet, the slip (20) and the right-edge tabs (19) never meet it, and the carried sheet (30), the desk notice (48) and the veil (50) stay above.
22. **The post-use re-review is Issue #736's docket, not a new ledger on Issue #667.** Rule: Issue #667's 2026-10-03 comment; D6 puts the review at the epic's end.
23. **The cartouche's class is `atelier-cartouche`.** Rule: a guard on retired markup is not loosened (`test/site/astro-scaffold.test.ts` holds `class="cartouche"` off home).
24. **A place link's ring crossing a road is recorded, not changed.** Rule: the ring is the house's one face; 98.2% of its ground reads above 4.5:1 and the rest is where it crosses the road at its pip (measured); `handbook/specs/development-workflow.md` step 15 sends a cost the pull request leaves to an errata row.
25. **`MEASURED_SECONDS.cluster` is entered as a local-ratio estimate and corrected from the pull request's own slow-tier lane B job.** Rule: `test/e2e/lane-timings.test.ts`'s own provenance.
26. **The chart's links are root-absolute, `/atlas/` included.** Rule: `handbook/specs/site-architecture.md`, "Link form is scoped".
27. **The fold shuts when focus lands on an element outside it, and not when focus moves to nothing.** Rule: a keyboard reader tabbing past the chart must not land on links hidden under it; measured on B2: a press on the panel's own ground keeps it open, Tab past the last place shuts it.
28. **The short-window cut is recorded as a ruled errata row and pinned by no check.** Rule: the ruling accepts a cost; a check that held names falling off a short window would guard the cost rather than a contract, and the house pins correctness, not the shape of a ruled shortfall.
29. **AC1 admits the atlas as the one place off the tree by `ATLAS_ROUTE`, and AT2 sweeps the tree's pages (`ROUTE_NAMES`) plus the Specimen.** Rule: the atlas page carries no shell and so no chart (D3: it never shows "you are here"); a roster a guard checks is exported data the guard imports (`vellum-footguns` Gate 1 item 16).
30. **Leaving the page shuts the chart** (`pagehide`). Rule: measured: Back to a page left by a chart link restored it from the page cache with the chart open; a page a reader comes back to shows as an arrival does.
31. **A click elsewhere, not a pointer press, shuts the chart.** Rule: D1's own words ("a click elsewhere") and the house's outside-dismiss idiom (the place card's document `click`); a pinch or a drag begun off the panel fires no click.
32. **Every browser check sets its own window and puts 1280x800 back in a `finally`.** Rule: `handbook/specs/settle-doctrine.md` clause 14 (a suite leaves the browser in a known state), applied check by check so a throw in one never sizes the next.
33. **AT2 carries a written fallback for the lane budget**, five chart-room loads dropped. Rule: a stop condition that names no way forward leaves a decision to the builder.
34. **The lit press keeps the house ring at its 2px offset, so the ring adjoins the cream and reads as the cream's edge thickening.** Rule: `handbook/specs/ui-design.md`, "The focus ring is one face", drawn outside the control and measured against the ground it stands on: 8.28:1 against the deep (measured; a 4px offset, also measured, would show a band of the deep at 8.37 but change the face for one state). On Issue #736's docket.
35. **The press's star stays a decoration at the cream's left edge.** Rule: it carries an empty alternative and is no text; inside the cream it reads 5.7 at its 5th percentile, and its worst pixel, 1.46 to 1.59, is the deep beyond the spread its left point meets (measured). On Issue #736's docket.
36. **The short-window row goes straight under `## Ruled and left`, quoting Alex's ruling on Issue #671 with its link.** Rule: `handbook/errata/README.md`'s pointer-comment path is for an open row ruled later; this one is ruled at birth, at the sitting, and its ruling comment already exists.

## Open decisions

None. D1 to D9 are ruled in issuecomment-6221171042 and D10 and D11 in issuecomment-6223392089, all quoted under Rulings.

## Stop conditions

Hand back, with the command and its output, if:

- `git diff --stat e94fa41e origin/main -- src/layouts/ src/site/shell/ public/shell.css public/house.css e2e/suites/cluster.ts e2e/suites/cluster/ e2e/suites/corners.ts e2e/suites/runninghead/shell.ts e2e/suites/landfall/controls.ts scripts/lint/sheet-owners.ts scripts/generate-discovery.ts test/repo/sheet-owners.test.ts test/site/astro-scaffold.test.ts test/site/route-tree.test.ts test/e2e/lane-timings.test.ts` shows any change.
- The trail line in `src/layouts/BaseLayout.astro` is not the one-line form this plan edits (`...</Fragment>)}</nav>{trail.also.length > 0 && ...`), or `LINKS` in `e2e/suites/corners.ts`, `READ` in `e2e/suites/cluster/trail.ts` or `cl1Wash` in `e2e/suites/cluster.ts` is not as quoted.
- Commit 5's run does not red AT1, AT2, AT3, AT4, AT5 and AT6 on the assertions their items name and AT8 on its settle, or reds any other check; or commit 6's does not leave exactly AT3 and AT8 red, AT8 on `open === false`.
- Any check in `cluster`, `corners`, `stage`, `runninghead`, `landfall`, `home`, `specimen` or `broadside` other than CL1, DR11, CO1, CO4 and AT1 to AT8 changes result against `origin/main`'s build.
- AT2 finds a word overlap, a place link that misses a hit-test, a grid point outside the panel, or a missing pin on any page; AT1 finds the panel outside the window at 1024x768; AT5 finds a margin under 0.
- The shell's inlined script crosses 4,096 bytes ("the deploy artifact serves no raw app source" reds).
- `npm test` reds anything but the tests this plan writes red on purpose.
- `npm run lint` refuses the sheet (`content: "✦ " / ""` included), a comment as written, or `HOUSE_SHEETS`' test; or `npm run format` changes a rule's selector or value.
- The re-estimated `MEASURED_SECONDS.cluster` carries lane B past the balance cap (88.9 s of room today).
- The step 11 plate read finds a chart word with more than 1% of its surrounding pixels under 4.5:1, a worst pixel under its step 6 figure on the ruled combination ("The Print Room" 2.46, "The Glossary" 2.86, "The Explorer" 3.17, "Q & A" 3.65; 4.5 for every other word), a cut on a short window other than the ruled errata row's, the press's words under 4.5:1 on its cream ground while open, or the press's ring under 3:1.
