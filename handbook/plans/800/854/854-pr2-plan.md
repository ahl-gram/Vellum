# Issue #854 plan, pull request 2 of 2: the Broadside's shape and count controls, built to the ruled stills

- **Planned at:** `origin/main` 17baca6368305764d262568436257a1284eabeaf (`git fetch origin main` then `git rev-parse origin/main`, 2026-10-30), re-recorded at the fold of Alex's rulings on the menu, main unmoved since the menu; Issue #854 comment count 13 (`gh api repos/ahl-gram/Vellum/issues/854/comments --paginate | jq length`), the newest 6534752965 (the rulings on this plan's menu); Epic Issue #844 comment count 8. First recorded at the menu with Issue #854 at 12 comments.
- **Rulings this plan builds:** Issue #854 comment 6527008800 (M1 to M6), comment 6533770339 (step 2: layout B, the place wins on an archipelago, the panel steps left for Issue #930, the cream groove for Issue #931, each place's outline beside its name, the designer's word picks), and comment 6528036863 call 14 (pull request 2 stands the sliders down). All of step 2's look is a feel ruling, provisional until Alex has used the panel live.
- **Rulings:** Issue #854 comment 6534752965 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6534752965), Alex, 2026-10-30: M-A "Slide all the way left (Recommended)" and M-B "Hidden until a number is set (Recommended)", each this plan's recommendation, folded in the section "Rulings" below. His answer on this plan's calls (1 to 22) is a separate comment, not yet given: until it is, every call below stands as a call for him to overrule.
- **Open decisions:** none.
- **Branch (for the implementer):** `feat/854-shape-controls`.
- **Closes:** Issue #930 and Issue #931 (M6), and Issue #854 (its last pull request).
- **The words' source.** Ruling 6 says the designer's picks are "in `out/854-controls/notes.md`, listed there per group". They are not: that file lists the groups only and says the picks are "in the report the dispatcher relays". The picks are the designer's hand-back, extracted verbatim from its transcript to `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ca724480-6383-4266-b511-508f7438e704/scratchpad/854p2-pl-designer-report.md` (section "6. The words"). Every word this plan writes onto the page is quoted from there, from the drawn stand-ins in `out/854-controls/mock/arms.ts` (`WORDS`, `NOTE`, `looseWord`), or named below as a call.

## What this pull request builds

Pull request 1 (PR #1128) made a shaped or counted world linkable and fetchable, with nothing on the Broadside. This pull request puts the controls on the Land panel, as layout B drew them:

- a **shape** row: a search box over the 5,646 real places, listing matches as one types, each with its outline drawn beside its name and its second line in the "in Latvia" form;
- a **looseness** slider, live with a place and held without one;
- on the archipelago only (M4), an **islands** slider and, once a count is set, a **sizes** pair, with the raggedness slider in coast's row under the name **coast** (M3);
- every row that draws nothing in the state on screen kept on the panel, set aside in a dashed **held** box with its note (M2, layout B); a held control stays reachable and refuses a press;
- the slip stepped inboard of the Drawer tab (Issue #930), the end words in brown ink and the slider track as a cream groove (Issue #931), and B's tightenings, so the slip fits 1024 by 768 without scrolling in every state;
- four glossary terms and a second sense for the coast, and two footnote notes.

## Recon, and what it changed (workflow step 5)

`vellum-spec-recon` ran against 17baca63 (body, all 12 comments, both archived plans, the designer's notes, Issues #930, #931, #1129, #855, #393). Its ledger: 6 rows STALE or conflicting (2 blocking), 31 CURRENT, 1 UNVERIFIABLE (the native track's 1.02:1, which the groove replaces and the step 11 plate read measures), 1 not applicable; three CURRENT rows carried a figure it could not render (Issue #930's overlap, the chart's size at 1024, the served place files), each of which this planner then measured (Measured, below: 21.8 by 19.9 and 21.8 by 151.9 px counting the slip's painted ring, 536.6 by 414.2 px, and 5,646 files under `dist/outlines/`). Each STALE claim, and what it changed:

1. **BLOCKING, the word picks are not on disk.** Folded as "The words' source" above.
2. **BLOCKING, "the build moves `SLIP_CLEARANCE` and `GLASS_GAP_REM` and limits the change to the Explorer": no seam exists.** Both are module constants read on behalf of all eight `bindRoom` rooms. Folded as design 6: the slip's inset becomes a CSS token that only the Explorer overrides, and the JS reads the inset off the slip's computed `right` (the precedent is `roomRight` in `src/site/shared/slide-away-page.ts`), so the other seven rooms compute byte-identical numbers.
3. **"Eight rooms share the slip":** right for the JS; the Slip component is also worn by `IndexSlip` on the Q & A and the Glossary, which take the shared CSS seat. Design 6 keeps the token's default at 2rem, so those two pages are unchanged.
4. **PRW7 drives a slider this pull request stands down.** Folded as design 9 and test E7: PRW7 gets a new driver that still reaches `landKeysNow`'s gate.
5. **Issue #930's tab is `.chart-drawer-tab`**, not `.slip-tab`; its width is `--chart-drawer-tab-w` (2.8rem) in `src/styles/explorer/chart-drawer.css`. Folded into design 6.
6. **Place-file bytes** (4,793,986 total, not 4,912,555): cosmetic, not acted on.

Recon's open-decision list, each disposed of:
- "where the Explorer-only cut is made": a call (design 6), not Alex's: the rulings asked for the Explorer alone, and the token gives exactly that.
- "PRW7 against the stand-down": a call (design 9).
- "the coast row's end words and readout": the end words are ruled ("coast", from "round" to "ragged", designer's report); the readout is a call (call 9).
- "the held sea level's readout": a call: every held slider reads "held", as every B still draws it.
- **Rejected, with the reason:** recon item 5, "Issue #1129 decides the coast stand-down". The stand-down reads the shape only (`coastDraws` of the drawn shape, design 1), never the `touched.coast` gate, so Issue #1129 changes what a link spells and not which row is held.
- "the glossary mark count": a call (call 13).
- "the twin lists": a call (call 16).

## Measured before the menu (workflow step 6)

All at 17baca63, in this planner's tree.

- **The picker's per-row outline fetch**, by `node out/854-dry-run/854p2-fetch-cost.ts` (log `854p2-fetch-cost.log` beside it, both in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-af6f1e4f5fe2cb661/out/854-dry-run/`), under the round's match rule with the list capped at the largest group of rows sharing one name (21, Valmiera), over all 26 one-letter and 676 two-letter queries and every distinct whole name (6,067 queries): the worst list of 21 rows costs 69,083 bytes of outline files ("c"), its first six 32,995 bytes, and the largest single file shown is Nunavut, 24,247 bytes. Matching takes 0.89 ms a query on average in Node and 2.76 ms for "a" (4,382 matches; one run, so the timings are an order of size, not a bound). So every rendered row fetches its own outline, no lazy loading is needed, and nothing is debounced. "tex" finds Texas and Lake Texoma; "georgia" finds Georgia (country), Georgia (state), Georgian Bay, South Georgia and the Islands, and South Georgia and the South Sandwich Islands, the order the designer drew; "valmiera" finds 21.
- **The name index**, by `node` over the files (log `854p2-sizes.log` beside the above): `src/world/outline-place-names.json` is 296,411 bytes, 56,507 gzipped. Each row is `[id, name, kind, country]`; lakes (745) and countries (258) carry no country, states (4,596) and map units (47) always do, so the "in Latvia" form covers every row. Today's `generated/explorer/app.bundle.js` is 68,314 bytes, 19,635 gzipped; this pull request adds code and no data to it.
- **The two shared constants**, by `git grep -n "SLIP_CLEARANCE\|GLASS_GAP_REM" -- src test e2e scripts`: read only by `fitStage` and `glassLeft`, both reached from `layout` in `src/site/shared/room.ts`; pinned by `test/site/stage-fit.test.ts` (symbolically) and `test/site/room.test.ts` (a regex over `atelier.css`'s Glass rule).
- **The shared-kit change, in the seven other `bindRoom` rooms**, by `node out/854-dry-run/854p2-probe2.ts` (log `854p2-probe2.log`) at 1280 by 800 on `/explorer/portfolio/`, `/print-room/#seed=42`, `/prospect/#seed=42&i=0`, `/reading-room/#seed=42`, `/ribbon/#seed=42`, `/seed-of-the-day/` and `/specimen/`: the slip's computed `right` is `32px` in every one (the value the planned `slipInset` hands the fit, equal to today's constant inset), and with the planned token rules injected at their 2rem default the slip's left and right, the Glass's rect and the stage's `--reserve-right` are identical in all seven. Three rooms (the Print Room, the Ribbon, the Specimen Book) move 1 to 2 px vertically on any stylesheet insertion and keep the move when the style is taken out again (the probe's second control), so that move is a style recalculation's, not the token's. By `node out/854-dry-run/854p2-probe3.ts` (log `854p2-probe3.log`): a slip inside a hidden panel (the Reading Room's between reads, staged by hiding its parent, rect width 0) still computes `right` as `32px`, and the Explorer's with the override as `63.4px`. The Q & A and the Glossary wear the slip's CSS seat through `IndexSlip` and run no `bindRoom`; the token's 2rem default leaves their seat as it is.
- **The page-wide key handlers against the first text box on the Explorer**, by `git grep -n '"keydown"' -- src/site/explorer src/site/shared`: the document- and window-level handlers are the place card's (`onDocKeydown` in `src/site/shared/living-chart/place-overlay.ts`, Escape hides a shown card), the chart of the atelier's (`bindAtelier` in `src/site/shared/shell/atelier.ts`, Escape shuts its open fold), the table carry's (`table-drag.ts`, Escape during a carry) and the slide-away's (`watchInput` in `src/site/shared/slide-away-page.ts`, a key anywhere arms the follow, which `handbook/specs/ui-design.md` rules for the Explorer and which the seed box already does); the camera's, the loupe's and the Glass's key handlers listen on the map viewport alone (`glass.ts`, `loupe-bind.ts`, `src/site/shared/glass-keys.ts`). So no letter or arrow typed in the shape box moves the camera or lights the loupe, and no guard is owed.
- **`src/site/explorer/app.ts` stands at about 396 code lines** against the 400-line lint limit (blank and comment lines skipped, counted by stripping comments in `node`), so this plan does not edit it: every new wire goes through `wirePageControls` and `draftOverrides` in `src/site/explorer/app-wiring.ts` (188 code lines).
- **Browser readings** for every check a probe can stage are in Tests, below, from `node out/854-dry-run/854p2-probe.ts` and `854p2-probe2.ts` (logs `854p2-probe.log` and `854p2-probe2.log`).

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:
- `handbook/specs/ui-design.md`: "The room and its furniture" (the slip, the legend row); "The voice" (name a new thing at the sitting; a glossed section's band; a homograph takes the period form); "Colour, contrast and legibility" (the 4.5:1 floor, "A refusing press dims by swapping its ground", the 16px field).
- `handbook/specs/cascade-traps.md`: all of it, in particular "An author `display` beats the user-agent `[hidden]` rule", "A shown popover renders in the TOP LAYER", "The arms of a selector list rank independently", and "Under reduced motion a change of style is a transition".
- `handbook/specs/conventions.md`: "How a design decision is made" (provisional; pin correctness now, let dressing pins lag), "The fidelity rule", "How code is cited", and the comment doctrine.
- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract"; "The Chart Table and the Broadside never stand open together".
- `handbook/specs/site-architecture.md`: the bullet "A real place's outline is served one file to a place, never bundled"; "Tokens outside the palette join" (a page sheet declaring its own `:root` token); "Build, check and deploy".
- `handbook/specs/settle-doctrine.md`: clauses 3 to 9 and 14, and "The environment", before any e2e check.
- `handbook/specs/check-placement.md`: all of it.
- `handbook/specs/rulebook.md`: "Cross-epic coordination" (Issue #393).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before each test, Gate 2 before each e2e check (items 16 and 17 in particular), Gate 3 before any CSS, Gate 4 before the generate step and the glossary, Gate 5 before the push.

## The design

1. **One pure table decides every row.** `seatOf(type, choice)` in a new `src/site/explorer/land-rows.ts` takes the type menu's value and the Explorer's held choice (`shapeChoice()`) and returns each Land row's state, `live`, `held` or `hidden`, and the held box's note. It derives the held rows from pull request 1's own functions on the drawn shape (`drawnShape`, `landDraws`, `coastDraws` in `src/site/shared/shape-address.ts`), as M2's fold promised. The rows, in authored order: `place`, `looseness`, `islands`, `sizes`, `land` (sea level), `coast`, `ragged`. With `drawn = drawnShape(choice, type)`, `arch = type === "archipelago"`, `outline = drawn.outline !== undefined`, `counted = drawn.islands !== undefined`, `loose = drawn.looseness !== undefined`:
   - `place`: live.
   - `looseness`: live when `outline`, else held.
   - `islands`: hidden off `arch`; on `arch`, held when `outline`, else live.
   - `sizes`: hidden off `arch` or while the held choice has no count (`choice.islands === undefined`; ruling M-B, "Hidden until a number is set"); otherwise held when `outline`, else live.
   - `land`: live when `landDraws(drawn)`, else held.
   - `coast`: hidden when `counted` (the raggedness takes its row, M3); otherwise live when `coastDraws(drawn)`, else held.
   - `ragged`: live when `counted`, else hidden.
   - The note: with `outline`: on `arch`, `loose` ? `archLoose` : `archExact`; off it, `loose` ? `loose` : `exact`. Without: `counted` ? `counted` : `plain`.
   The notes, `HELD_NOTES`, as drawn (ruled "as drawn"): `plain` "the looseness waits for a place to loosen"; `exact` "the outline holds the sea level and the coast; loosen it to free the coast"; `loose` "the outline holds the sea level"; `counted` "the count holds the sea level, and the looseness waits for a place"; `archExact` "the outline holds the count, the sea level and the coast; clear the place to free the islands"; `archLoose`, the one undrawn combination, composed from `archExact` by dropping its coast clause the way `loose` is `exact` without it: "the outline holds the count and the sea level; clear the place to free the islands" (call 6). Every state holds at least one row (without a place the looseness is held; with one the sea level is), so the held box always shows.
2. **The DOM is moved, never rebuilt.** Every Land row after the climate row is authored once in `src/pages/explorer/index.astro`, each wrapped in `<div class="l-row" data-row="...">` with `display: contents`, so its cells stay items of the ledger's five-column grid; the held box is an authored `<div class="held" id="land-held" role="group" aria-label="held">` at the ledger's end, a subgrid, holding the note `<p class="held-note" id="land-held-note">`. `seatLand(seat)` in `src/site/explorer/land-seat.ts` hides hidden rows, moves held rows into the box and live rows before it, both in authored order, and moves only a row whose seat changed, so a control the reader is using is never taken out of the document and keeps its focus. Every input in a held row carries `aria-disabled="true"` and `aria-describedby="land-held-note"`, its readout reads "held", and its value is stored on `data-held`.
3. **A held control refuses a press.** M2's consequence was "every slider that can be moved does something", and the house rule keeps a refusing control pressable, never `disabled` (`handbook/specs/ui-design.md`). So `refuses(input)` in `land-seat.ts`, called first in every Land control's `input` and `change` listener (the sea level and coast in `src/site/explorer/controls.ts`, the new ones in `src/site/explorer/shape-controls.ts`), puts back every input of a held row from its `data-held` and returns true; the listener then returns without touching the gates or drawing. A keyboard reader still reaches the control and hears the note through `aria-describedby`.
4. **The panel follows the held choice at every draw.** `refreshLand()` in `shape-controls.ts`, called by `draftOverrides` after it parks the sea level and coast and writes their readouts, sets the four new controls from `shapeChoice()` (`slidersOf`), writes their readouts, puts the held place's name in the box (`showPlace`), seats the rows (`seatLand(seatOf(typeSel.value, shapeChoice()))`) and fills every track. A link (pull request 1's `readHash` already calls `chooseShape`), a type change, Random, Enter, a slider's release and a pick all reach it through `draw()`.
5. **The new controls write the held choice and redraw on release**, as the coast does (each value is a different world, the Issue #137 note in `controls.ts`): `change` runs `chooseShape(nextChoice(shapeChoice(), edit))` then `draw()`; `input` only writes the readout and the track. `nextChoice` is pure (`land-rows.ts`). The islands slider runs 1 to 100, and its far-left stop, 1, is the seed's choice: it reads "seed's choice", wears the faded thumb the Sub 0 still drew (`design/shape-and-count/explorer/explorer-a-plain-land-crop2x.png`), and leaves the count out of the choice (ruling M-A, "Slide all the way left": the far-left notch, or Home, is the seed's choice, and one notch right is "about 2"). Picking a place keeps the count, the looseness and the touched gates in place, so clearing the place gives back exactly the world the reader left (the place wins only while it is set, ruling 2); clearing the place keeps the looseness in the choice, as a held slider keeps its value.
6. **Issue #930: the slip's inset is a token, and the room reads the inset off the slip.** `atelier.css` declares `--slip-right: 2rem` beside `--slip-w` and uses it in `.slip { right }`, `.slip.folded`'s travel, `.corner.br.zoomery { right }` and `.legend { left }`. Only `src/styles/explorer/index.css` overrides it, beside its own `--slip-w`: `--slip-right: calc(var(--chart-drawer-tab-w) + 0.6rem + 9px)`, the tab's width, the 0.6rem gap the folded Glass already keeps from the tab (`chart-drawer.css`), and the slip's 9px painted ring (its 3px outline at a 6px offset). In JS, `slipInset(slip)` in `src/site/shared/room-seats.ts` reads `parseFloat(getComputedStyle(slip).right)`; `layout` in `room.ts` hands `fitStage` and `glassLeft` the slip's reach (its width plus that inset), and the two constants become the breaths alone: `SLIP_BREATH = 24` (the 1.5rem the old 56 added to the 2rem) and `GLASS_BREATH_REM = 1.4`. For every room with the 2rem default the numbers are identical (slipW + 32 + 24 = slipW + 56; slipW + 32 + 22.4 = slipW + 3.4rem), so the change reaches the Explorer alone. On the Explorer at 1024 the chart gives up 31.4 px of width (536.6 by 414.2 to 505.2 by 390), as ruled.
7. **Issue #931: the end words go up to the brown ink and the track becomes a cream groove** (`.land-end` in `--ink-brown`, 5.64:1; a 6px groove edged in `--ink-faded`, 3.93:1, filled in `--ink-dark` to the thumb by a `--f` the script keeps current). The groove's fill is a gradient read off `--f`, which `fillTrack` writes on every input and `fillTracks` after every seat, since a value the code sets fires no event.
8. **The place picker is a combobox over a served name index.** The index is served as one file beside the place files, `/outlines/names.json` (`writePlaceNames` in `scripts/place-files.ts`, `namesUrl` in `src/site/explorer/place-fetch.ts`), fetched the first time it is needed (the box gains focus, or a place is held whose name the box must show) and never bundled or sent to the worker. Matching is the designer's drawn rule, pure in `src/site/explorer/place-match.ts`: names only, accents folded, the whole name first, then a name starting with the letters, then a word starting with them, then anywhere; ties by kind (country, map unit, state, lake), then by name (`localeCompare` with `"en"`), then the index's order. The list renders every match up to the largest group of rows sharing one whole name (21 today, derived from the index, never written), six visible at a time with the rest a scroll away, and past that cap ends with "and N more; type more of the name"; nothing matching shows "no such place in the gazetteer". Each row draws its place from the loader `runJob` reads (`loadPlace`, exported from `src/site/explorer/worker-client.ts`), so a place picked after being listed is not fetched again. The list is a `popover="manual"` panel in the top layer, as wide as the ledger, seated under the box from their viewport rects at show time (the way `place` in `src/site/explorer/footnotes.ts` seats a note), and it opens upward where it would pass the window's foot.
9. **PRW7 keeps biting through a new driver.** With the sea level held on a shaped world, the old driver (a `change` on `#land`) is refused and draws nothing. The guard it holds (`landKeysNow` skipping `gateLand`, and `draftOverrides` leaking a touched land; Issue #854 comment 6529508430) is reached instead by touching the sea level on a plain world through its link (`land=150`) and then picking Texas: the touched gate stays set (design 5), so only `gateLand` keeps the land out of the link and the draw.

### Rejected, with the reason

- **Layout A or C:** Alex ruled B.
- **A new optional input on `bindRoom` for the inset, or moving the two constants:** a parameter every room must remember, or a change all eight rooms take. The token reaches the Explorer alone by value and the JS follows whatever the CSS seats.
- **Reading the inset token itself in JS:** `getPropertyValue("--slip-right")` returns the unresolved `calc(...)` text for an unregistered custom property; the computed `right` is the resolved length.
- **Building the rows in script:** the authored rows keep their footnote marks bound by `wireFootnotes` at boot, show in the scripts-off page BR9 reads, and keep every id stable for the suites.
- **Hiding the held rows (layout A's single held line):** Alex ruled B, every row kept.
- **A held slider that moves and redraws the same world:** against M2's "every slider that can be moved does something".
- **The name index as a dynamic `import()` chunk:** one served file is pull request 1's own pattern (call 3 there) and keeps the bundler out of a data path; a JSON chunk would also need import attributes the Node-run engine tree does not take.
- **Fetching outlines only for rows scrolled into view:** the worst list costs 69 KB of files and the median file 622 bytes (Measured), so an observer buys nothing.
- **A list in the slip's own flow, or appended to `body`:** in the flow it adds to the slip's scroll at 1024 by 768 (6 px spare with a place on the archipelago); under the chart room's body, which carries `contain: layout`, a fixed box lays out against the floored page, while a top-layer popover lays out against the window its viewport rects are read in.
- **A sixth glossary headword "Coast":** a homograph takes one headword (`handbook/specs/ui-design.md`, The voice), so the coast's second sense runs into the existing "Coast warp" definition.
- **A browser pin on the end words' and the track's contrast:** a dressing-level pin that lags one live-use cycle (`handbook/specs/conventions.md`); Issue #931's own acceptance names the plate reader, which step 11 owes.

## Files

Line counts are today's code lines; "after" is the expected count. No file passes 400 and no function 50 after the change.

**Created**

| file | what it holds |
|---|---|
| `src/site/explorer/land-rows.ts` (about 110) | the row table, the notes, the readout words, `nextChoice`, `slidersOf`; pure |
| `src/site/explorer/land-seat.ts` (about 70) | `seatLand`, `refuses`, `fillTrack`, `fillTracks`; DOM-bound at module scope |
| `src/site/explorer/shape-controls.ts` (about 90) | the four new controls' wiring and `refreshLand`; DOM-bound |
| `src/site/explorer/place-match.ts` (about 80) | the matcher, the second line, the list's words; pure |
| `src/site/explorer/place-names.ts` (about 25) | the name index's loader; no DOM |
| `src/site/explorer/place-picker.ts` (about 130) | the combobox's events and state, `showPlace`; DOM-bound |
| `src/site/explorer/place-list.ts` (about 90) | rendering the list's rows and outlines, lighting a row, seating the popover; DOM |
| `test/site/land-rows.test.ts` | T1 |
| `test/site/place-match.test.ts` | T2 |
| `test/site/place-names.test.ts` | T3 |
| `e2e/suites/broadside/tab.ts` | BR15 |
| `e2e/suites/broadside/shape.ts` | BR16 to BR20 and their payloads |

DOM-bound modules bind their elements at module scope through `$` (`src/site/shared/by-id.ts`), as `src/site/explorer/sea-level.ts` does, and no unit test imports them.

**Exported signatures, exactly**

`src/site/explorer/land-rows.ts`:
```ts
import { coastDraws, drawnShape, landDraws, type ShapeOverrides } from "../shared/shape-address.ts";
import type { OutlineId } from "../../world/outline-ids.ts";
import type { IsleSize } from "../../terrain/lobes.ts";

export const LAND_ROWS = ["place", "looseness", "islands", "sizes", "land", "coast", "ragged"] as const;
export type LandRow = (typeof LAND_ROWS)[number];
export type RowState = "live" | "held" | "hidden";
export const HELD_NOTES: Readonly<Record<"plain" | "exact" | "loose" | "counted" | "archExact" | "archLoose", string>>;
export interface LandSeat {
  readonly rows: Readonly<Record<LandRow, RowState>>;
  readonly note: string;
}
export function seatOf(type: string, choice: ShapeOverrides): LandSeat;
export const ISLANDS_SEEDS_CHOICE = 1;
export const looseWord: (looseness: number) => string;
export const islandsWord: (slider: number) => string;
export const raggedWord: (raggedness: number) => string;
export type ShapeEdit =
  | { readonly kind: "place"; readonly id: OutlineId | null }
  | { readonly kind: "looseness"; readonly slider: number }
  | { readonly kind: "islands"; readonly slider: number }
  | { readonly kind: "size"; readonly size: IsleSize }
  | { readonly kind: "raggedness"; readonly slider: number };
export function nextChoice(choice: ShapeOverrides, edit: ShapeEdit): ShapeOverrides;
export interface ShapeSliders {
  readonly looseness: number;
  readonly islands: number;
  readonly raggedness: number;
  readonly size: IsleSize;
}
export function slidersOf(choice: ShapeOverrides): ShapeSliders;
```
Behaviour, which T1 pins:
- `seatOf` as design 1 states.
- `looseWord(v)`: `v === 0` "exact"; `v <= 0.33` "soft edge"; `v <= 0.8` "looser"; else "nearly the seed's own" (Alex's words from the Sub 0 sitting, the designer's switch points, call 8).
- `islandsWord(n)`: `n === ISLANDS_SEEDS_CHOICE` "seed's choice"; else `` `about ${n}` ``.
- `raggedWord(v)`: `v === 0` "round"; else `` `ragged ${v.toFixed(2)}` ``.
- `nextChoice` returns a new object and never mutates its argument: `place` with an id sets `outline`, with `null` removes it and keeps every other field; `looseness` with slider 0 removes `looseness`, otherwise sets it to `slider / 100`; `islands` with `ISLANDS_SEEDS_CHOICE` removes `islands` and keeps `isleSize` and `raggedness`, otherwise sets it; `size` sets `isleSize`; `raggedness` with 0 removes it, otherwise sets `slider / 100`.
- `slidersOf`: `looseness` `Math.round((choice.looseness ?? 0) * 100)`; `islands` `choice.islands ?? ISLANDS_SEEDS_CHOICE`; `raggedness` `Math.round((choice.raggedness ?? 0) * 100)`; `size` `choice.isleSize ?? "equal"`.

`src/site/explorer/land-seat.ts`:
```ts
import type { LandSeat } from "./land-rows.ts";
export function seatLand(seat: LandSeat): void;
export function refuses(input: HTMLInputElement): boolean;
export function fillTrack(input: HTMLInputElement): void;
export function fillTracks(): void;
```
- Module scope: the Land ledger (`document.querySelector<HTMLElement>('[aria-labelledby="grp-land"] .ledger')`, asserted non-null as `elements.ts` does `stageEl`), `$("land-held")`, `$("land-held-note")`, and a `rowOf(row)` that finds `.l-row[data-row="<row>"]` inside the ledger (the held box is inside it).
- `seatLand`: for each row, `el.hidden = state === "hidden"`; then the live rows, in `LAND_ROWS` order, are placed before the held box, and the held rows, in that order, inside the box before its note, each target walked from its last row to its first with `next` starting at the anchor (the held box for the ledger, the note for the box): `if (row.parentElement !== target || row.nextElementSibling !== next) target.insertBefore(row, next); next = row;` (a hidden row is placed with the live ones). Then `note.textContent = seat.note`, `box.hidden = !Object.values(seat.rows).includes("held")`. For every `input` in a held row: `aria-disabled="true"`, `aria-describedby="land-held-note"`, `data-held` = the range's `value` or the radio's `checked ? "1" : "0"`, a range's `aria-valuetext="held"`, and the row's `.land-readout` (where it has one) reads "held". For every input in a row that is not held, those three attributes are removed.
- `refuses(input)`: `const row = input.closest(".l-row"); if (row === null || row.closest(".held") === null) return false;` then every input in the row is put back from its `data-held` (a range's `value`, a radio's `checked`), each range is filled, and it returns true.
- `fillTrack(input)`: `input.style.setProperty("--f", String(max > min ? (value - min) / (max - min) : 0))` from the input's own `min`, `max` and `value`.
- `fillTracks()`: `fillTrack` on every `.broadside input[type="range"]`.

`src/site/explorer/shape-controls.ts`:
```ts
export function wireShapeControls(draw: () => void): void;
export function refreshLand(): void;
```
- Module scope: `$<HTMLInputElement>("looseness")`, `"islands"`, `"ragged"`, `"isle-equal"`, `"isle-varied"`, their readouts `"looseness-readout"`, `"islands-readout"`, `"ragged-readout"`, and `typeSel` from `./elements.ts`.
- `wireShapeControls(draw)`: on each of the three sliders, `input`: `if (refuses(el)) return;` then the readout (text and `aria-valuetext` both the word: `looseWord(v / 100)`, `islandsWord(v)`, `raggedWord(v / 100)`) and `fillTrack(el)`; `change`: `if (refuses(el)) return;` then `chooseShape(nextChoice(shapeChoice(), { kind, slider: Number(el.value) }))` and `draw()`. On each radio, `change`: `if (refuses(el)) return;` then `chooseShape(nextChoice(shapeChoice(), { kind: "size", size: el.value as IsleSize }))` and `draw()`. One `input` listener on the Land ledger fills the target's track when it is a range, so the sea level's and the coast's drags fill too (it runs after the element's own listener, which may have put the value back).
- `refreshLand()`: `const choice = shapeChoice(); const s = slidersOf(choice);` sets the three sliders' values and the radios' `checked` from `s`, toggles the class `untouched` on `#islands` when `choice.islands === undefined`, writes the three readouts as above, `showPlace(choice.outline)`, `seatLand(seatOf(typeSel.value, choice))`, `fillTracks()`.

`src/site/explorer/place-match.ts`:
```ts
import type { PlaceId } from "../../world/outline-ids.ts";
export type NameRow = readonly [id: PlaceId, name: string, kind: string, country: string];
export interface PlaceHit {
  readonly id: PlaceId;
  readonly name: string;
  readonly sub: string;
  readonly mark: readonly [number, number] | null;
}
export interface PlaceList {
  readonly hits: ReadonlyArray<PlaceHit>;
  readonly more: number;
}
export const fold: (s: string) => string;
export const subLine: (row: NameRow) => string;
export const NO_SUCH_PLACE = "no such place in the gazetteer";
export const moreWords: (n: number) => string;
export function largestNameGroup(rows: ReadonlyArray<NameRow>): number;
export function createMatcher(rows: ReadonlyArray<NameRow>): (query: string) => PlaceList;
export function nameOf(rows: ReadonlyArray<NameRow>, id: PlaceId): string | null;
```
- `fold(s)`: `s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()`.
- `subLine`: kind `"country"` "a country"; kind `"lake"` "a lake"; otherwise `` `in ${country}` ``.
- `moreWords(n)`: `` `and ${n} more; type more of the name` ``.
- `largestNameGroup`: the most rows sharing one exact `name`.
- `createMatcher(rows)` folds every name once and computes `cap = largestNameGroup(rows)` once; the returned function folds and trims the query, returns `{ hits: [], more: 0 }` for an empty one, ranks each row (0 whole name, 1 name starts with it, 2 a word starts with it, splitting the folded name on `/[\s'’-]+/`, 3 anywhere, else no match), sorts by rank, kind (`country` 0, `unit` 1, `state` 2, `lake` 3, any other 4), `name.localeCompare(other, "en")`, then index, and returns the first `cap` as hits with `more` the rest. A hit's `mark` is `[at, at + q.length]` where `at` is the query's index in the folded name, when the folded name has the name's own length and `at >= 0`; otherwise `null`.
- `nameOf`: the row's name, or `null`.

`src/site/explorer/place-names.ts`:
```ts
import type { Fetcher } from "./place-fetch.ts";
import type { NameRow } from "./place-match.ts";
export function createNameLoader(fetcher: Fetcher): () => Promise<ReadonlyArray<NameRow>>;
```
Memoises one promise; a response that is not `ok` rejects with `` new Error(`the gazetteer could not be fetched (${status})`) ``, a fetcher that throws with `new Error("the gazetteer could not be fetched")`; a rejection forgets the memo, so the next call fetches again. The rows are `JSON.parse(await response.text())`.

`src/site/explorer/place-fetch.ts` (32 code lines, about 34 after) gains:
```ts
export const NAMES_FILE = `${PLACE_FOLDER}/names.json`;
export const namesUrl = `/${NAMES_FILE}`;
```

`src/site/explorer/place-list.ts`:
```ts
import type { PlaceId } from "../../world/outline-ids.ts";
import type { PlaceList } from "./place-match.ts";
import type { PlaceText } from "./place-source.ts";
export function renderList(options: HTMLUListElement, foot: HTMLElement, list: PlaceList, outline: (id: PlaceId) => Promise<PlaceText>): void;
export function lightRow(options: HTMLUListElement, box: HTMLInputElement, index: number): void;
export function seatList(panel: HTMLElement, options: HTMLUListElement, box: HTMLElement, ledger: HTMLElement): void;
```
- `renderList` replaces the options' children with one `li` per hit: `id` `place-opt-<i>`, `role="option"`, `aria-selected="false"`; first an `svg.pl-sil` (`viewBox="0 0 1000 1000"`, `preserveAspectRatio="none"`, `aria-hidden="true"`), then `span.pl-text` holding `span.pl-name` (the name, its marked letters in a `mark` element where `mark` is not null) and `span.pl-sub` (the hit's `sub`). For each hit it calls `outline(id)` and, when it resolves, appends a `path` with `d` the text and `fill-rule="evenodd"` to that row's svg; a rejection leaves the svg empty. The foot: no hits, its text `NO_SUCH_PLACE`, class `pl-foot none`, shown; `more > 0`, its text `moreWords(more)`, class `pl-foot`, shown; otherwise hidden.
- `lightRow` sets `aria-selected` true on the row at `index` and false on the rest, sets the box's `aria-activedescendant` to that row's id, and `scrollIntoView({ block: "nearest" })` on it.
- `seatList`, called after `showPopover()`: clears the options' `maxHeight`; with more than six rows sets it to the sixth row's bottom less the options' top (both `getBoundingClientRect`); sets the panel's `left` and `width` from the ledger's rect; with `below = innerHeight - 8 - (box.bottom + 4)` and `above = box.top - 4 - 8` and the panel's height `h`: `h <= below` seats it at `box.bottom + 4`; else `h <= above` seats it at `box.top - 4 - h`; else the roomier side, the options' `maxHeight` shrunk by `h - side`; and sets `panel.dataset.flipped` to `"up"` or `"down"`.

`src/site/explorer/place-picker.ts`:
```ts
import type { OutlineId } from "../../world/outline-ids.ts";
export function wirePlacePicker(draw: () => void): void;
export function showPlace(id: OutlineId | undefined): void;
```
- Module scope: `$<HTMLInputElement>("place")`, `$("place-list")`, `$<HTMLUListElement>("place-options")`, `$("place-foot")`, the Land ledger, the slip body (`document.querySelector("#broadside .slip-body")`), `const names = createNameLoader((url) => fetch(url))`, a memoised matcher built from the rows the first time they arrive, and the list's state (`hits`, `lit`).
- A module function `writeBack()` writes the held choice's outline into the box whatever the focus: `undefined` empties it; a form id (`isFormId`) writes the id itself; a place loads the names and, once they arrive and the held choice's outline is still that id, writes `nameOf(rows, id) ?? id`.
- `showPlace(id)`: when the box has focus, does nothing; otherwise `writeBack()` (the held choice is the one `id` came from).
- `wirePlacePicker(draw)`, the combobox (each a handler of at most 50 lines):
  - `focus`: starts loading the names.
  - `input`: an empty trimmed value closes the list; otherwise, once the names are loaded, the list for the box's value at that moment (not the value at the keystroke) is rendered with `renderList` and `loadPlace` from `./worker-client.ts`, then `lit = 0`, `lightRow`, `showPopover()` where not open, `seatList`, and `aria-expanded="true"`. A failed name load leaves the list shut, and the next keystroke tries again.
  - `keydown`: `ArrowDown` and `ArrowUp` move `lit` within the hits (clamped) and `lightRow`, `preventDefault`; `Enter` picks `hits[lit]` when the list is open with a hit, clears the place when the box is empty, `preventDefault` either way; `Escape` closes the list and runs `writeBack()`.
  - `blur`: closes the list; an empty box with a place held clears it; otherwise `writeBack()`.
  - On the options, `pointerdown` calls `preventDefault()`, so the box keeps its focus, and `click` on a row picks that row's hit.
  - The slip body's `scroll` and the window's `resize` close the list.
  - To pick: the box reads the hit's name, the list closes, `chooseShape(nextChoice(shapeChoice(), { kind: "place", id }))`, `draw()`. To clear: the same with `id: null` and an empty box. To close: `hidePopover()` where open, `aria-expanded="false"`, `aria-activedescendant` removed.

`src/site/explorer/worker-client.ts` (265 code lines, about 266 after): `export const loadPlace = createPlaceLoader((url) => fetch(url));` and `const throughPlace = createPlaceGate(loadPlace);` in place of today's one line.

`src/site/explorer/app-wiring.ts` (188, about 192):
- imports `refreshLand` and `wireShapeControls` from `./shape-controls.ts`, `wirePlacePicker` from `./place-picker.ts`.
- `draftOverrides`: `refreshLand();` after `updateCoastReadout();` and before the `return`.
- `wirePageControls`: after `wireControls({...})`, `wireShapeControls(draw); wirePlacePicker(draw);` (`draw` is the parameter it already takes).

`src/site/explorer/controls.ts` (80, about 84): imports `refuses` from `./land-seat.ts`; the first line of each of the four listeners on `landSlider` and `coastSlider` (`input` and `change` on each) becomes `if (refuses(<slider>)) return;`.

`src/site/shared/stage-fit.ts` (41, unchanged count):
- `SLIP_CLEARANCE = 56` and its doc line become `/** The mockup's breath beside an open slip, 1.5rem; the slip's own inset rides in its reach. */ export const SLIP_BREATH = 24;`.
- `StageInput.beside` gains the doc line `/** How far the open slip reaches in from the right edge: its width plus its inset; 0 when folded. */`.
- `fitStage`: `input.beside > 0 ? input.beside + SLIP_BREATH : 0`.

`src/site/shared/room-seats.ts` (111, about 113):
- the comment above `GLASS_GAP_REM` and the constant become `// atelier.css seats the Glass beside an open slip at right: --slip-w + --slip-right + 1.4rem; computed here rather than read, because the Glass's right transitions with the fold and a rect read at the settle timer was 12px short (e2e Z13c).` and `export const GLASS_BREATH_REM = 1.4;`.
- `glassLeft(glass: HTMLElement | null, slipOpen: boolean, slipReach: number): number | null`: its last line `return pageBox().w - slipReach - GLASS_BREATH_REM * rem - glass.offsetWidth;`.
- new `export function slipInset(slip: HTMLElement): number { return parseFloat(getComputedStyle(slip).right) || 0; }`.

`src/site/shared/room.ts` (99, about 100):
- imports `slipInset` too.
- `FitParts.slipW` becomes `slipReach`; `fitRoom` passes `beside: slipReach` and `right: slipReach > 0 && glassL !== null ? [glassL] : []`.
- `layout`: after `slipW`, `const slipReach = slipOpen && slip !== null ? slipW + slipInset(slip) : 0;`; `glassLeft(q(".corner.br"), slipOpen, slipReach)`; `fitRoom({ frame, sheet, aspect: aspect(), slipReach, glassL })`.

`scripts/place-files.ts` (21, about 30):
```ts
export const PLACE_NAMES: string; // fileURLToPath(new URL("../src/world/outline-place-names.json", import.meta.url)), as PLACE_TABLE is defined beside it
/** Copies the name index, byte for byte, to <root>/outlines/names.json. */
export async function writePlaceNames(root: string, names: string = PLACE_NAMES): Promise<void>;
```
`writePlaceNames` makes `<root>/outlines/` and writes `join(root, NAMES_FILE)` with the file's bytes. The CLI arm runs `writePlaceFiles(root).then(() => writePlaceNames(root))` under the same `catch`. `package.json`'s `astro:generate` and its three pins do not change.

`src/pages/explorer/index.astro`, the Land ledger after the climate row becomes exactly (the sea level's and the coast's cells unchanged, each wrapped):
```html
<div class="l-row" data-row="place">
  <span class="l-label"><label for="place">shape</label><a class="fn" href="/glossary/#shape" data-note="note-shape" aria-describedby="note-shape" aria-label="note on the shape">&para;</a></span>
  <span class="l-ctl"><input id="place" class="control place-box" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="place-options" autocomplete="off" spellcheck="false" placeholder="seed's choice"></span>
</div>
<div class="l-row" data-row="looseness">
  <span class="l-label"><label for="looseness">looseness</label></span>
  <span class="land-end land-end-min">exact</span>
  <input id="looseness" type="range" min="0" max="100" step="1" value="0">
  <span class="land-end land-end-max">loose</span>
  <span id="looseness-readout" class="land-readout"></span>
</div>
<div class="l-row" data-row="islands" hidden>
  <span class="l-label"><label for="islands">islands</label><a class="fn" href="/glossary/#islands" data-note="note-islands" aria-describedby="note-islands" aria-label="note on the islands">&Vert;</a></span>
  <span class="land-end land-end-min">few</span>
  <input id="islands" type="range" min="1" max="100" step="1" value="1">
  <span class="land-end land-end-max">many</span>
  <span id="islands-readout" class="land-readout"></span>
</div>
<div class="l-row" data-row="sizes" hidden>
  <span class="l-label"><span class="l-word" id="sizes-label">sizes</span></span>
  <span class="l-ctl seals" role="radiogroup" aria-labelledby="sizes-label">
    <label class="check seal">alike <input id="isle-equal" type="radio" name="isle-size" value="equal" checked></label>
    <label class="check seal">of every size <input id="isle-varied" type="radio" name="isle-size" value="varied"></label>
  </span>
</div>
<div class="l-row" data-row="land"> <!-- today's five sea-level cells, unchanged --> </div>
<div class="l-row" data-row="coast"> <!-- today's five coast cells, unchanged --> </div>
<div class="l-row" data-row="ragged" hidden>
  <span class="l-label"><label for="ragged">coast</label></span>
  <span class="land-end land-end-min">round</span>
  <input id="ragged" type="range" min="0" max="100" step="1" value="0">
  <span class="land-end land-end-max">ragged</span>
  <span id="ragged-readout" class="land-readout"></span>
</div>
<div class="held" id="land-held" role="group" aria-label="held" hidden><p class="held-note" id="land-held-note"></p></div>
```
Also in that page:
- The Hand's seals: the empty `<span class="l-label"></span>` before them is deleted and their span becomes `<span class="l-ctl seals hand-seals">`.
- Two notes after `note-seeds-choice`, in the existing form: `note-shape`, head "of the shape", text "Any real country, state, province or lake can lend a world its outline. Left to the seed, the land takes its own shape; picked, the land is drawn inside the place's outline, north up, nearly edge to edge.", link `/glossary/#shape`; `note-islands`, head "of the islands", text "On an archipelago, about how many islands the sea holds; a few may touch or sink, so the count is never exact. Left to the seed, the seed decides.", link `/glossary/#islands`.
- After the last note: `<div class="place-list" id="place-list" popover="manual"><ul class="pl-options" id="place-options" role="listbox" aria-label="places in the gazetteer"></ul><p class="pl-foot" id="place-foot" hidden></p></div>`.

`src/pages/glossary/index.astro`, "At the drafting table", the terms in this alphabetical order (IX12): Coast warp, Islands, Looseness, Seed's choice, Shape, Sizes, Survey. Seven terms, under the cap of 8.
- "Coast warp" keeps its id and text, and its definition gains, after "redrawn when the slider is let go.", the coast's second sense: "On a counted archipelago, how ragged each island's shore is: round keeps a soft disc, ragged bites bays and capes into it."
- `<p class="term" id="islands">Islands</p>` with the definition "On an archipelago, about how many islands the sea holds; a few may touch or sink, so the count is never exact. Left to the seed, the seed decides."
- `<p class="term" id="looseness">Looseness</p>`: "How closely the land keeps to a picked outline: exact keeps the line, a soft edge lets the shore wander, looser lets it stray, and at the far end the seed's own island all but returns."
- `<p class="term" id="shape">Shape</p>`: "Any real country, state, province or lake can lend a world its outline. Left to the seed, the land takes its own shape; picked, the land is drawn inside the place's outline, north up, nearly edge to edge."
- `<p class="term" id="sizes">Sizes</p>`: "Whether the counted islands are alike or of every size."

`src/styles/shared/atelier.css`:
- `:root` gains `--slip-right: 2rem;` after `--slip-w`.
- `.corner.br.zoomery { right: calc(var(--slip-w) + var(--slip-right) + 1.4rem); }`.
- `.legend`'s `left: calc((100% - var(--slip-w) - var(--slip-right)) / 2);`.
- `.slip`'s `right: var(--slip-right);`.
- `.slip.folded`'s `transform: translateX(calc(100% + var(--slip-right) + 0.6rem));` (today's 2.6rem is the 2rem inset and 0.6rem).

`src/styles/explorer/index.css`: `:root` gains, after `--slip-w: 24rem;`, `--slip-right: calc(var(--chart-drawer-tab-w) + 0.6rem + 9px);` with the comment above `:root` extended to one line: `/* The Broadside's five-column ledger needs the wider slip, a deviation from the kit's 22rem; the slip stands inboard of the Drawer tab, by the tab, the 0.6rem the folded Glass keeps from it (chart-drawer.css) and the slip's 9px painted ring (its 3px outline at a 6px offset, atelier.css). */`

`src/styles/explorer/broadside.css` (layout B, the values of `out/854-controls/mock/controls-mock.css` with its body classes dropped, since every rule here applies always):
- `.broadside .panel`: adds `display: grid; grid-template-columns: auto 1fr; column-gap: 0.7rem; align-items: baseline;` (keeps its padding and `min-width`).
- `.broadside .panel + .panel`: `margin-top: 0.3rem; padding-top: 0.6rem;` (the border stays).
- new `.broadside .panel > .ledger { grid-column: 1 / -1; }`.
- `.broadside .panel-gloss`: `margin: 0 0 0.4rem;`.
- `.broadside .ledger`: `gap: 0.3rem 0.6rem;`.
- new `.broadside .l-row { display: contents; }` and `.broadside .l-row[hidden], .broadside .held[hidden] { display: none; }` (an author `display` beats the user agent's `[hidden]`).
- the four `.broadside .ledger > X` rules (`.land-end-min`, `input[type="range"]`, `.land-end-max`, `.land-readout`) become descendant rules, `.broadside .ledger X`, so the rows inside `.l-row` and inside the held box take their columns.
- the range rule drops `accent-color` and adds `-webkit-appearance: none; appearance: none; height: 16px; background: transparent;`.
- four rules, each its own (a selector list holding a pseudo-element one engine does not know drops the whole list there): `.broadside .ledger input[type="range"]::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; border: 1px solid var(--ink-faded); background: linear-gradient(to right, var(--ink-dark) calc(7px + (100% - 14px) * var(--f, 0)), var(--control-cream) 0); }`; `...::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; margin-top: -6px; border-radius: 50%; border: 0; background: var(--ink-dark); }`; `...::-moz-range-track { height: 6px; box-sizing: border-box; border-radius: 3px; border: 1px solid var(--ink-faded); background: var(--control-cream); }`; `...::-moz-range-progress { height: 6px; border-radius: 3px; background: var(--ink-dark); }`; `...::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; border: 0; background: var(--ink-dark); }`; and `.broadside .ledger input#islands.untouched::-webkit-slider-thumb { background: var(--ink-faded); }` with its own `::-moz-range-thumb` twin.
- `.land-end`: `color: var(--ink-brown);`.
- new `.broadside .l-word { font-size: 0.85rem; letter-spacing: 0.05em; color: var(--ink-brown); }`.
- new `.broadside .l-ctl > :is(select, input.place-box) { padding-block: 0.22rem; }`; `.broadside .l-ctl > input.place-box { flex: 1; min-width: 0; font-size: 1rem; font-family: inherit; text-overflow: ellipsis; }`; `.broadside input.place-box::placeholder { color: var(--ink-brown); font-style: italic; opacity: 1; }`; `.broadside input.place-box::-webkit-search-cancel-button { -webkit-appearance: none; }`.
- new `.broadside .l-ctl.hand-seals { grid-column: 1 / -1; justify-content: flex-end; gap: 0.4rem; }`.
- `.broadside label.check.seal`: `padding: 0.16rem 0.6rem;`.
- new `.broadside .held { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; gap: inherit; align-items: center; padding: 0.25rem 0.5rem; background: var(--control-cream); border: 1px dashed var(--line-tan); border-radius: 4px; }` and `.broadside .held-note { grid-column: 1 / -1; margin: 0; padding: 0 0.6rem; font-family: var(--font-flourish, "Iowan Old Style", "Palatino", Georgia, serif); font-style: italic; font-size: 0.82rem; line-height: 1.3; color: var(--ink-brown); }`.
- new `#broadside .slip-head { padding-top: 0.95rem; padding-bottom: 0.55rem; }` (the Explorer's slip alone; layout properties on a kit class naming the page's own id, which `test/repo/sheet-owners.test.ts` passes).
- the list, from the mock, with `transition-property: none` on the panel and on its options, since under reduced motion the blanket in `src/styles/shared/motion.css` would run the `top`, `left` and `max-height` `seatList` writes as a transition and its height read in the same task would find the old box (`handbook/specs/cascade-traps.md`, "Under reduced motion a change of style is a transition"): `.place-list { position: fixed; inset: auto; margin: 0; padding: 0.25rem 0; box-sizing: border-box; overflow: visible; transition-property: none; background: var(--parchment-panel); border: 1px solid var(--line-tan); border-radius: 4px; box-shadow: 0 6px 18px rgb(from var(--chart-ink) r g b / 0.28); color: var(--ink-dark); }`; `.place-list .pl-options { list-style: none; margin: 0; padding: 0; overflow-y: auto; overscroll-behavior: contain; transition-property: none; }`; `.place-list .pl-options > li { display: flex; align-items: center; gap: 0.55rem; padding: 0.3rem 0.7rem; cursor: pointer; }`; `.place-list .pl-options > li[aria-selected="true"] { background: var(--parchment-bright); }`; `.place-list .pl-text { min-width: 0; }`; `.place-list .pl-name { display: block; font-size: 1rem; line-height: 1.25; }`; `.place-list .pl-name mark { background: none; color: inherit; text-decoration: underline; text-decoration-color: var(--ink-faded); text-underline-offset: 2px; }`; `.place-list .pl-sub { display: block; font-family: var(--font-flourish, "Iowan Old Style", "Palatino", Georgia, serif); font-style: italic; font-size: 0.8rem; line-height: 1.25; color: var(--ink-brown); }`; `.place-list .pl-sil { flex: none; width: 2.1rem; height: 1.575rem; background: var(--control-cream); border: 1px solid var(--line-faint); }`; `.place-list .pl-sil path { fill: var(--ink-brown); stroke: none; }`; `.place-list .pl-foot { margin: 0; padding: 0.3rem 0.7rem 0.2rem; font-family: var(--font-flourish, "Iowan Old Style", "Palatino", Georgia, serif); font-style: italic; font-size: 0.82rem; color: var(--ink-brown); border-top: 1px solid var(--line-faint); }`; `.place-list .pl-foot.none { border-top: 0; }`.
- The comment on the ledger rule (`BR1b`) stays true and is kept; no other new comment except the two named above.

**Tests and suites edited** (each named in Tests): `test/site/stage-fit.test.ts`, `test/site/room.test.ts`, `test/site/place-files.test.ts`, `test/site/place-fetch.test.ts`, `e2e/suites/broadside.ts`, `e2e/suites/broadside/room.ts`, `e2e/suites/print-room/link.ts`.

## Tests, in the order they are written

The prover owes T1 to T7 (unit). The browser checks E1 to E9 are proved through the CI proof runner (workflow step 11), one row each, by the implementer, since the prover runs unit tests only. Every shared helper goes in `test-support/` (Gate 1 item 8); none is planned.

**T1. `test/site/land-rows.test.ts`** (new). Stub first: `src/site/explorer/land-rows.ts` with the exact exports, where `seatOf` returns every row `"live"` and the note `""`, the three words return `""`, `nextChoice` returns its argument, `slidersOf` returns `{ looseness: 0, islands: 1, raggedness: 0, size: "equal" }`, and `HELD_NOTES` holds the six strings. `TX` is `placeId("ne-1159315211")`.
- T1a "the five ruled B states seat as the stills drew them": `seatOf("", {})` (plain): live place, land, coast; held looseness; hidden islands, sizes, ragged; note `plain`. `seatOf("island", { outline: TX })` (exact): live place, looseness; held land, coast; hidden islands, sizes, ragged; note `exact`. `seatOf("island", { outline: TX, looseness: 0.75 })` (loose): live place, looseness, coast; held land; note `loose`. `seatOf("archipelago", { islands: 20 })` (counted): live place, islands, sizes, ragged; held looseness, land; hidden coast; note `counted`. `seatOf("archipelago", { outline: TX, islands: 20 })` (a place on the archipelago): live place, looseness; held islands, sizes, land, coast; hidden ragged; note `archExact`. Each asserted as the whole `rows` record. Red on the stub. Mutations, each by line: `land` taken as always live; `coast` held where it is hidden (drop the `counted` test); `islands` live with an outline.
- T1b "the states no still drew follow from the same table": `seatOf("archipelago", {})`: live place, islands, land, coast; held looseness; hidden sizes, ragged; note `plain`. `seatOf("archipelago", { outline: TX, looseness: 0.5, islands: 20 })`: live place, looseness, coast; held islands, sizes, land; hidden ragged; note `archLoose`. `seatOf("island", { islands: 20 })` equals plain's seat. `seatOf("", { outline: TX })` and `seatOf("continent", { outline: TX })` each equal exact's. Mutation: `sizes` shown with no count (drop the `choice.islands === undefined` test).
- T1c "every state holds a row, so the held box always shows": over the ten states of T1a and T1b, some row is `"held"`. Mutation: `looseness` live without an outline.
- T1d "the readouts say the ruled words at their switch points": `looseWord` at 0, 0.01, 0.33, 0.34, 0.8, 0.81, 1 gives exact, soft edge, soft edge, looser, looser, nearly the seed's own, nearly the seed's own; `islandsWord(1)` "seed's choice", `islandsWord(20)` "about 20"; `raggedWord(0)` "round", `raggedWord(0.4)` "ragged 0.40". Mutation: `<` in place of `<=` at 0.33.
- T1e "an edit makes a new choice and leaves the old one alone": from `const c = { islands: 20, isleSize: "varied", raggedness: 0.4 }`, `nextChoice(c, { kind: "islands", slider: 1 })` is `{ isleSize: "varied", raggedness: 0.4 }` and `c` still deep-equals its literal; `nextChoice({ outline: TX, looseness: 0.5 }, { kind: "place", id: null })` is `{ looseness: 0.5 }`; `{ kind: "place", id: TX }` on `{ islands: 20 }` is `{ islands: 20, outline: TX }`; `{ kind: "looseness", slider: 0 }` removes looseness and `slider: 67` sets 0.67; `{ kind: "raggedness", slider: 0 }` removes it; `{ kind: "size", size: "varied" }` sets it. Mutations: the islands edit at the seed's choice also drops `isleSize`; mutate in place (`Object.assign(choice, ...)`).
- T1f "the sliders show the held choice, the seed's choice at the islands' far left": `slidersOf({})` is `{ looseness: 0, islands: 1, raggedness: 0, size: "equal" }`; `slidersOf({ outline: TX, looseness: 0.29 })` gives looseness 29 (`Math.round`, since 0.29 * 100 is 28.999999999999996); `slidersOf({ islands: 20, isleSize: "varied", raggedness: 0.4 })` gives 20, 40, `"varied"`. Mutation: `Math.floor`.

**T2. `test/site/place-match.test.ts`** (new). Stub: the exact exports, `createMatcher` returning `() => ({ hits: [], more: 0 })`, `subLine` returning `""`, `largestNameGroup` returning 0, `nameOf` returning `null`, `fold` returning its argument, the words as specified. The committed index is read as data (`src/world/outline-place-names.json`, JSON, not a source file the read guard lists).
- T2a "the drawn lists come back in the drawn order": over the committed index, "tex" gives names `["Texas", "Lake Texoma"]`; "georgia" gives `["Georgia", "Georgia", "Georgian Bay", "South Georgia and the Islands", "South Georgia and the South Sandwich Islands"]` with kinds country, state, lake, country, state (asserted through `subLine`: "a country", "in United States of America", "a lake", "a country", "in South Georgia and the Islands"). Red on the stub. Mutations: rank a word start before a name start; drop the kind tie-break.
- T2b "accents fold, so the letters a reader can type find the place": "calarasi" gives the two `Călărași` rows (Romania, Moldova) and "CĂLĂRAȘI" the same. Mutation: `fold` without the `normalize`.
- T2c "the second line is the in-Latvia form for every kind": `subLine` of a country, a lake, a state and a map unit row gives "a country", "a lake", "in Latvia", "in Belgium"; over the committed index no sub line is "in " with nothing after it. Mutation: write the kind word for a state.
- T2d "a list runs to the largest group of alike names, so every twin is reachable, and says how many more past it": `largestNameGroup` of the committed index is the count of rows named "Valmiera" (counted in the test from the same rows), and "valmiera" gives that many hits, every one `in Latvia`, and `more` 0; "a" gives exactly that many hits and `more` equal to the matches less the hits (the test counts the matches with the same rule written as a filter over folded names). Witness, asserted first: the "Valmiera" group holds more than six rows. Mutations: cap at 6; cap at the matches' count (no cap).
- T2e "the marked letters are the query's own, in the name as written": "georgia" marks `[6, 13]` in "South Georgia and the Islands" and `[0, 7]` in "Georgia"; "lara" marks `[3, 7]` in "Călărași". Mutation: mark from 0 always.
- T2f "an empty query lists nothing; the words are the ruled ones": `""` and `"  "` give `{ hits: [], more: 0 }`; `NO_SUCH_PLACE` is "no such place in the gazetteer"; `moreWords(15)` is "and 15 more; type more of the name"; `nameOf(rows, TX)` is "Texas". Mutation: an empty query matching every row.

**T3. `test/site/place-names.test.ts`** (new). Stub: `createNameLoader` returns `() => Promise.resolve([])` without fetching.
- T3a "the index is fetched once and handed on": a fake fetcher counting calls and answering `{ ok: true, status: 200, text: async () => '[["ne-1","A","lake",""]]' }`; two loads make one call and both resolve to the one row. Red on the stub (no call). Mutation: no memo.
- T3b "a failed fetch rejects with the reason and the next load tries again": first `{ ok: false, status: 404 }`, then the rows; the first rejects matching `/^the gazetteer could not be fetched \(404\)/`, the second resolves, two calls. Mutation: keep the rejected promise.
- T3c "a fetcher that throws rejects the same way": message matching `/^the gazetteer could not be fetched/`.

**T4. `test/site/place-files.test.ts`** (edited): new "the name index is served beside the places, byte for byte (Issue #854)": into a temp folder, `writePlaceNames(dir)` writes `join(dir, NAMES_FILE)` whose bytes equal `readFileSync(PLACE_NAMES)`. Stub: `writePlaceNames` writes nothing. Mutation: write `JSON.stringify(JSON.parse(text))` (the index is pretty-printed, so the bytes differ). The two existing tests stand: `writePlaceFiles` still writes the table's files and nothing else.

**T5. `test/site/place-fetch.test.ts`** (edited): new "the name index is served at the site's root under outlines/": `NAMES_FILE` is `outlines/names.json` and `namesUrl` is `/outlines/names.json`. Mutation: a relative `namesUrl`.

**T6. `test/site/stage-fit.test.ts`** (edited): the import takes `SLIP_BREATH` for `SLIP_CLEARANCE`; "chrome standing at the right edge ..." keeps its numbers with `beside: 384 + 32` and `glassClear.reserve.right` equal to `384 + 32 + SLIP_BREATH`; "an open slip takes its width plus the mockup's clearance from the right" is renamed "an open slip takes its reach, its width and its inset, plus the mockup's breath from the right" with `beside: 352 + 32`, `reserve.right` `352 + 32 + SLIP_BREATH` and the sheet `<= 1280 - 352 - 32 - SLIP_BREATH`. Each value is the one it was (56 = 32 + 24). Mutation: `SLIP_BREATH` read as 56 (the old clearance counted twice with the inset).

**T7. `test/site/room.test.ts`** (edited): the first test is renamed "the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + --slip-right + 1.4rem)"; its pattern becomes `/\.corner\.br\.zoomery\s*\{[^}]*right:\s*calc\(var\(--slip-w\)\s*\+\s*var\(--slip-right\)\s*\+\s*([\d.]+)rem\)/`, its anchor assertion "atelier.css seats the Glass at --slip-w, the slip's inset and one rem term", and it asserts `Number(m[1])` equals `GLASS_BREATH_REM`. Its `SOURCE_READS` entry (`data("src/styles/shared/atelier.css")`) stands. Mutation: the sheet's rule back to `+ 2rem + 1.4rem`.

**The browser checks** (Gate 2 before each; each in a `step`; a wait throws inside its step; every evaluate that awaits a promise passes `awaitPromise`). In `run` in `e2e/suites/broadside.ts` the new steps go after `await step("BR9", ...)` and before `br8Clean`, in this order, each navigating for itself so no earlier step's page changes: `step("BR15", () => br15TabClear(k))`, `step("BR16 to BR19", () => br16To19(k))`, `step("BR17", () => br17Holds(k))`, `step("BR20", () => br20Twins(k))`; BR8's deltas then cover the picker's fetches. A step that sets the window clears it in a `finally` with `Emulation.clearDeviceMetricsOverride`, as BR1c does. The readings are from `node out/854-dry-run/854p2-probe.ts` and `node out/854-dry-run/854p2-probe2.ts`, each run from the root of this planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-af6f1e4f5fe2cb661`), one at a time with no other browser up, on the site `npm run build` made there at 17baca6368305764d262568436257a1284eabeaf, logs `out/854-dry-run/854p2-probe.log` and `854p2-probe2.log` beside them (the dispatcher copies this tree's `out/` to the main checkout's `out/` when it retires the tree, so the probe and log land at `/Users/ahl/CodeProjects/Vellum/out/854-dry-run/`). The probe stages each fixture without editing source: the planned token rules injected as a style, the slip's rect reported as the planned JS computes it (width to 2rem from the edge, so today's arithmetic adds the planned inset), the designer's own seat for layout B (`out/854-dry-run/mock/`, copied from `out/854-controls/mock/`) laid onto the live page, or the planned Land markup mounted in the scripts-off page.

- **E1, BR15** in `e2e/suites/broadside/tab.ts` (`br15TabClear`), step "BR15": at 1024 by 900 and at 1024 by 768 (`Emulation.setDeviceMetricsOverride`, cleared in `finally` as BR1c does), on `EXP + "#seed=42&style=antique"` through the kit's `goto`, settled with `makeStable(makeSettle(...))` on a read of the slip, its painted ring (the rect grown 9px on every side), the tab (`#chart-drawer-tab`), the sheet (`#sheet`) and the Glass (`.corner.br`), departed once the window is the size set, the fonts are loaded and no animation on the Glass, the legend or the slip is running. "BR15 the open Broadside clears the Drawer tab at 1024 by 900 and 1024 by 768, the chart stands clear of the Glass, and the Glass clear of the slip's ring, where the slip now stands". Asserts per window: the ring and the tab's rects do not intersect (zero area); the sheet's right `<=` the Glass's left `- 8` (BR1c's own bound); the Glass's right `<=` the ring's left.
  - Fixture reading, staged (token rules and the reported rect): at 1024 by 900, ring right 969.6 against the tab's left 979.2 (clear by 9.6), sheet right 505.2 against 519 - 8 = 511, Glass right 554.2 against ring left 567.6; at 1024 by 768 the same x figures. Nearest to failing: the sheet against the Glass, 5.8 px, at both windows (identical).
  - Mutation A, `src/styles/explorer/index.css` without its `--slip-right` line (staged as today's page): the ring and tab intersect, 21.8 by 19.9 px at 1024 by 900 and 21.8 by 151.9 at 1024 by 768; the other two relations pass. Red on its first assertion at both windows; nearest to passing, the 900 window (19.9 px tall).
  - Mutation B, `slipInset` returning 32 in place of the computed right (staged as the token rules with today's JS): sheet right 536.6 against 511, at both windows. Red on the second assertion.
  - Mutation C, `.corner.br.zoomery` back to `+ 2rem + 1.4rem` (staged): Glass right 585.6 against ring left 567.6, at both windows. Red on the third assertion (and T7 reds with it; the proof row names both).
- **The step "BR16 to BR19"** is `br16To19` in `e2e/suites/broadside/shape.ts`: at 1024 by 768, `goto(EXP + "#seed=1&style=antique&type=archipelago&islands=20")`, then in order BR16's counted read, BR17's counted instance, BR18, BR19 (whose pick leaves a place on the archipelago), BR16's second read and BR17's place-on-the-archipelago instance, then BR19's clearing.
- **E2, BR16** in `e2e/suites/broadside/shape.ts`, inside `br16To19`: the slip body (`#broadside .slip-body`) `scrollHeight <= clientHeight` in the counted state, and again once BR19 has picked Texas (a place on the archipelago, the tallest state). "BR16 the Broadside fits 1024 by 768 without scrolling, counted and with a place on the archipelago".
  - Fixture reading, staged on this plan's own rows and sheet rules (`node out/854-dry-run/854p2-probe2.ts`, log `854p2-probe2.log`: the planned Land markup laid into the live ledger, the Hand's seals on one line, the planned `broadside.css` rules and inset injected, and the seat the planned `seatLand` makes laid by hand, with the count of 20 held beside the place): counted 472 against 472 (over 0, the slip's foot at 722 against its floor at 746); a place on the archipelago 489 against 489 (over 0, foot at 740); the place box at 16px. Nearest to failing: the place on the archipelago, 6 px from its floor. The designer's own seat (`854p2-probe.log`) reads the same figures to the pixel.
  - Mutation, the ledger's row gap back to `0.5rem 0.6rem` in `.broadside .ledger` (same staging, that one rule changed): counted over 9 (504 against 495), a place on the archipelago over 26. Nearest to passing: counted, 9 px over. With every tightening off (the designer's seat without them): over 144 and 161.
- **E3, BR17** in `shape.ts` (`br17Holds`), step "BR17": a read `SEAT` of each row's state (`hidden` where the row is hidden, `held` where it stands in `#land-held`, else `live`), the note, the box's value and the five readouts, settled until the box shows the held place's name where one is held, on four links, each through `goto`: `#seed=30&style=antique&type=island&outline=ne-1159315211` (exact: held land and coast, `#land` `aria-disabled` "true", land readout "held", note `exact`, box "Texas"); the same with `&looseness=75` (loose: coast live, looseness readout "looser", note `loose`); `#seed=1&style=antique&type=archipelago` (islands live reading "seed's choice", sizes and ragged hidden, coast live, note `plain`); `#seed=42&style=antique` (islands hidden). The counted instance (live place, islands, sizes, ragged; held looseness and land; hidden coast; islands readout "about 20"; note `counted`) and the place-on-the-archipelago instance (E5) are read inside `br16To19`. "BR17 the Land panel holds what the world on screen cannot use and shows the rest, each held row reading held under its note". Mutation: `seatOf`'s land line taking land as always live. Readings: UNVERIFIABLE, because every row state is written by the script this pull request adds and no probe can stage it without editing source; Stop conditions name its first run.
- **E4, BR18** in `shape.ts`, inside `br16To19` on the counted link, where the sea level is held: `#land` focused, its value read, `sendKey(send, "ArrowRight", "ArrowRight", 39)` (`e2e/support/home.ts`), then in the next evaluate the value and the status line. "BR18 a held slider refuses the reader's press: it keeps its value and draws nothing". Asserts the value unchanged and the status not "Drafting…". Mutation: `refuses` returning false at its first line (the key moves the value and the change starts a draw). Readings: UNVERIFIABLE, for the reason E3 gives.
- **E5, BR19** in `shape.ts`, inside `br16To19`: `performance.clearResourceTimings()` and `#place` focused in one evaluate, `Input.insertText` "tex", then a settle on a read `LIST` until the popover is open with two rows whose outlines are drawn (a `path` with a `d` in each `.pl-sil`); asserts names `["Texas", "Lake Texoma"]`, subs `["in United States of America", "a lake"]`, the first row lit, no foot, and the page's resource entries holding `/outlines/names.json` once, `/outlines/ne-1159315211.txt` and `/outlines/ne-1159124507.txt`. Then `sendKey` Enter, and a settle on the draw ending (status neither "Drafting…" nor an error, and the svg carrying `data-vellum-outline="ne-1159315211"`); asserts the box reads "Texas", the list closed, `location.hash` (its table pair removed) exactly `#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&outline=ne-1159315211`, and the `SEAT` read: live place and looseness, held islands, sizes, land, coast, hidden ragged, note `archExact` (E3's instance). Then the box selected (`select()` in an evaluate), `sendKey` Backspace, `sendKey` Enter, the draw settled, and the hash exactly `#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&islands=20` with `SEAT` back to the counted instance. "BR19 the shape box finds a place as one types, draws each match's outline, and picks it; picking holds the count and clearing frees it". Mutation: delete the `pick` call in the Enter branch of `keydown`. Readings: UNVERIFIABLE, for the reason E3 gives.
- **E6, BR20** in `shape.ts` (`br20Twins`), step "BR20" on the page BR17 leaves: `#place` focused, `Input.insertText` "valmiera", a settle on `LIST` until every row's outline is drawn, and the witness count read from the page's own index (`fetch("/outlines/names.json")` in an awaited evaluate, the rows named "Valmiera" counted); asserts the witness is above 6, the rows number the witness, every sub reads "in Latvia", the foot is hidden and the options scroll (`scrollHeight > clientHeight`); then `sendKey` Escape. "BR20 places alike in name, kind and country all list, each with its own outline, and the list scrolls to them rather than asking for more letters". Mutation: cap the matcher at 6. Readings: UNVERIFIABLE, for the reason E3 gives.
- **E7, PRW7** in `e2e/suites/print-room/link.ts` (`prwPlaceLand`, rewritten; its step "PRW7" keeps its seat). `redrawAfter` is split: its wait and read become `drawEnded(ctx, label): Promise<Redrawn>` (the settle on `RESOLVED`, then `REDRAWN`), and PRW8 calls `const moved = await ctx.evaluate(PICK_ISLAND); const after = await drawEnded(ctx, "PRW8 the type change's draw");` with its assertions unchanged. PRW7: `explorerAt(ctx, "#seed=42&style=antique&legend=1&arms=0&beasts=0&land=150")`; `const before = await ctx.evaluate(REDRAWN)`; in one evaluate the svg marked `data-prw-old` and `#place` focused; `Input.insertText` "Texas"; a settle until `#place-options > li` holds a first row whose `.pl-name` reads "Texas"; `sendKey(send, "Enter", "Enter", 13)` (`e2e/support/home.ts`); `const after = await drawEnded(ctx, "PRW7 the pick's draw")`; then the shaped world's own land fraction, read from an inline draw of the same world in one evaluate (`window.__vellumRunInline({ kind: "draw", seed: 42, overrides: { outline: "ne-1159315211" }, render: { style: "antique", widthPx: 1500, legend: true } }).svg` matched against `/data-vellum-land-fraction="([^"]*)"/`, a pattern with no backslash, Gate 2 item 5; the place is already in the page's store, since the pick loaded it). "PRW7 a sea level set on a plain world stays out of the link and the draw once a place is picked". Asserts: `before.land === "0.15"` (the witness that the land was touched and drawn before the pick); the own fraction is not "0.15" (the witness that the two can differ); `after.fresh`, `after.status === ""`, `after.outline === PLACE`, `after.land` equal to the own fraction, and `after.hash === "#seed=42&style=antique&legend=1&arms=0&beasts=0&outline=ne-1159315211"`. `MOVE_LAND`, `FLOOD` and the `Moved.before` field go; `DRAFTING`, `RESOLVED`, `REDRAWN`, `PICK_ISLAND` and `Moved.started` stay for PRW8. Mutations: `landKeysNow` without its `gateLand` (the hash gains `land=150`); `draftOverrides` passing `landKeysNow`'s land before the gate (the stamp reads 0.15). Readings: UNVERIFIABLE, because the pick is the picker this pull request adds.
- **E8, BR9** in `e2e/suites/broadside/room.ts` (edited `slipFaults`): the expected lists become exactly the fixture reading below.
  - Fixture reading, staged (the plan's Land markup and two notes mounted in the scripts-off page): groups `["The seed","grp-land","held","grp-hand","grp-press","Camera"]` (the held box is a named group inside The Land, so `br9Authored`'s "the groups in reading order" list gains "held" after "grp-land"); land `["type","band","place","looseness","islands","isle-equal","isle-varied","land","coast","ragged"]`; seals `[["check seal","alike","isle-equal","radio"],["check seal","of every size","isle-varied","radio"]]` then today's four; marks `seeds-choice`, `shape`, `islands`, `coast-warp`, `survey`, `verso`, each `["/glossary/#<id>","note-<id>",null]`; notes `note-seeds-choice` "of the seed's choice", `note-shape` "of the shape", `note-islands` "of the islands", then today's three, each with its glossary link. The hand list is unchanged. The fault texts "the four seals, each wrapping its checkbox", "the four marks, no title among them" and "the four notes, each head and its link" say "six" for "four", and the check's name says "six seals" and "six footnote marks" for "four seals" and "four footnote marks".
  - Mutation reading, today's markup: groups `["The seed","grp-land","grp-hand","grp-press","Camera"]`, land `["type","band","land","coast"]`, four seals, four marks, four notes. Red on the groups and the land list.
- **E9, BR10 and BR7** (edited): BR10's `TERMS` read takes `["coast-warp","islands","looseness","seeds-choice","shape","sizes","survey"]` and expects `["Coast warp","Islands","Looseness","Seed's choice","Shape","Sizes","Survey"]`, each a `P.term` under the heading; its name lists the seven. BR7's ids gain `"shape"` and `"islands"` after `"seeds-choice"`. Mutation reading, today's glossary: Islands, Looseness, Shape and Sizes read `[null, null, null]`. Fixture reading: UNVERIFIABLE (the probe did not mount the glossary's new terms); its expected value is the markup this plan writes.

Existing checks the change reaches, each run in the touched suites and handed back if it reds: BR1b (staged reading on the B plain seat: the sea level and coast tracks both 722.1 to 787.4, equal), BR1c (the legend row and the sheet against the moved slip at 1280 and 1680; not staged), BR4 to BR6 (the notes' apparatus, now six marks), BR8 (no console error, no 4xx: the picker's fetches answer 200), BR12, IX12 (seven drafting-table terms, alphabetical), PRW8.

## Order of commits

Each step's red is seen before its green; commit before any mutation run. Push at the first commit (workflow step 9).

1. This plan, copied unchanged to `handbook/plans/800/854/854-pr2-plan.md`, with T1 and its stub `src/site/explorer/land-rows.ts` (red on T1's assertions).
2. `land-rows.ts` built (T1 green).
3. T2 and T3 with their stubs `place-match.ts` and `place-names.ts` (red).
4. Both built (green).
5. T4 and T5 with `writePlaceNames` stubbed and the two constants in `place-fetch.ts` stubbed `""` (red).
6. `scripts/place-files.ts` and `place-fetch.ts` built (green).
7. T6 and T7 edited (red: `SLIP_BREATH` and `GLASS_BREATH_REM` absent, the sheet's old rule).
8. `stage-fit.ts`, `room-seats.ts`, `room.ts`, `atelier.css` (green; every room still at the 2rem default, the Explorer included); `npm test` whole, then `npm run astro:generate`.
9. E1 to E9 written; `npm run build`; `VELLUM_E2E_SUITES=broadside npm run test:e2e` (BR15 red on the ring meeting the tab, the rest red on their assertions), then `print-room` (PRW7 red).
10. `src/styles/explorer/index.css`'s `--slip-right` (BR15 green).
11. `src/pages/explorer/index.astro`, `land-seat.ts`, `shape-controls.ts`, `controls.ts`, `app-wiring.ts`, `broadside.css`.
12. `place-list.ts`, `place-picker.ts`, `worker-client.ts`, the glossary; `npm run build`, each suite alone (green).
13. The doctrine edits below.

## Rosters and doctrine

- **No new page, sheet, bundle entry, worker, suite or lane.** The browser checks join `broadside` and `print-room`; `e2e/suites/broadside/tab.ts` and `shape.ts` are helper modules beside `room.ts` and `dress.ts`, no suite, joining no roster. `MEASURED_SECONDS` is not edited (`handbook/specs/site-architecture.md`: "No pull request re-times a suite").
- **The generate step**: `scripts/place-files.ts` writes one file more in the same command, so `astro:generate`'s string and its three pins do not change.
- **`SOURCE_READS`**: T2 and T4 read `src/world/outline-place-names.json`, JSON data and not a source file; nothing joins. T7's existing entry stands.
- **The glossary**: four headwords join "At the drafting table" (IX12 caps it at 8; it holds 7) and BR10's list.
- **`handbook/specs/site-architecture.md`**, the bullet "A real place's outline is served one file to a place, never bundled.": "and the one reader is `runJob` in `src/site/explorer/worker-client.ts`: before it sends" becomes "and the one loader is `loadPlace` in `src/site/explorer/worker-client.ts`, which `runJob` and the Explorer's place picker share: before `runJob` sends", and the bullet gains at its end: "The name index the place picker searches is served beside the places as one file (`writePlaceNames` in `scripts/place-files.ts`, at `namesUrl` in `src/site/explorer/place-fetch.ts`), fetched the first time the picker needs a name, never bundled and never sent to the worker."
- **`handbook/specs/ui-design.md`**, "The room and its furniture", after the paragraph opening "Between them: **the slip**": "**On the Explorer the slip stands inboard of the Drawer tab**: its inset is a token only the Explorer's sheet changes (`--slip-right` in `src/styles/explorer/index.css`), and the room's fit and the Glass read the inset off the slip itself (`slipInset` in `src/site/shared/room-seats.ts`), so the open slip and its painted ring clear the tab at every window (BR15 in `e2e/suites/broadside/tab.ts`). **The Broadside's Land panel keeps every row and sets aside what the world on screen cannot use**: such a row stays on the panel inside a held box, the cream ground behind a dashed rule, under a note saying what holds it, and it refuses a press rather than being disabled (`seatOf` in `src/site/explorer/land-rows.ts`). **Provisional until the post-use review** (Alex, 2026-10-30, Issue #854 comment 6533770339): the layout and its tightenings, the held box and its notes, the shape box and its list, each place's outline in it, the groove, the inset, and every word on the new rows."
- **No ratified line is contradicted.** M2's "Every slider that can be moved does something" is what design 3 builds; comment 6528036863's call 14 handed the stand-down to this pull request.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test` whole (then `npm run astro:generate`).
- `ls generated/outlines/names.json` after `npm run astro:generate`, and `cmp generated/outlines/names.json src/world/outline-place-names.json` exits 0.
- `npm run build`, then each touched suite alone, one at a time, never the full lanes: `VELLUM_E2E_SUITES=broadside npm run test:e2e`, then `print-room`, then `document-rooms` (IX12), then `corners` (FL1 and FL2 read the slip and the tab in view under the floor), then the suites that read the slip's seat or the fit in the rooms the shared change reaches: `stage`, `slide-away`, `zoom` (Z13c, the fold's refit) and `reading-room`. Time each new and rewritten step (Gate 2 item 17) and name the seconds in the body.
- The gzip size of `generated/explorer/app.bundle.js` and of each shared chunk, before (19,635 bytes for the bundle at 17baca63) and after, named in the body.
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance, and the ruling was made from stills): every B state at 1024 by 768, 1024 by 900 and 1440 by 900 (plain, exact, loose, counted, a place on the archipelago, the picker open on "tex", "georgia", "professor" and "valmiera", the open picker states also under reduced motion, Gate 3 item 7), measuring the slip's scroll, the ring against the tab, the end words' and the track's contrast on the panel and in the held box (Issue #931's acceptance: 4.5:1 and 3:1), every new word's contrast, the box's 16px, and the built slip against the ruled stills (`out/854-controls/stills/crops/b-*-slip2x.png`), deviations named.
- `vellum-guard-prover`: T1 to T7, one round. E1 to E9 through `npm run proof -- send` with their suites named (E1's mutation C row names `test/site/room.test.ts` too).

## Calls made

The implementer copies these into its step 12 comment. Alex's rulings are pointed at, not restated. These calls are not ruled: the orchestrating session puts the ones with a consequence to him in a separate menu before the build, and each stands as written, a call for him to overrule, until his answer is posted on the issue; a call he overrules comes back to a planner before it is built.

1. **The fidelity deviation on the coast row's label.** The counted still labels the raggedness row "raggedness" from "round" to "ragged"; ruling 6 took the designer's pick, "coast" from "round" to "ragged". The ruling's word is built and the still's is named as the deviation. Rule: `handbook/specs/conventions.md`, a ruling's words over a stand-in.
2. **The held press refuses** (design 3). Rule: M2's consequence line and `handbook/specs/ui-design.md`, "A refusing press".
3. **PRW7 gets a new driver** (design 9) that still reaches both mutations of Issue #854 comment 6529508430. Rule: the guard Alex ruled is the gate, and the old driver presses a control M2 stands down.
4. **Picking a place keeps the touched gates, the count and the looseness**, so clearing it gives back the world the reader left. Rule: B's held rows keep their values (every B still shows a held slider at its value), ruling 2 (the place wins while it is set), and it keeps `gateLand` reachable from the page.
5. **Random and Enter keep the place and the count**, as pull request 1 built them. Rule: its call 10, which Alex did not overrule and the sitting did not change.
6. **The one undrawn note**, a loosened place on the archipelago, is composed from the ruled `archExact` note by dropping its coast clause, as the ruled `loose` note is `exact`'s without it.
7. **The slip's inset is an Explorer-only token, read off the slip in JS** (design 6). Rule: the rulings' "limit the change to the Explorer", and the `--slip-w` and `roomRight` precedents. The fold's travel follows the token, since today's 2.6rem is the 2rem inset and 0.6rem.
8. **The looseness readout's switch points stay the designer's** (0.33 and 0.8). Rule: ruling 6 left them as stand-ins, and the loose still at 0.75 shows "looser".
9. **The raggedness readout** reads "round" at 0 (drawn in the counted still) and "ragged 0.40" above it (the mock's own code, beside the coast's "warp 0.55").
10. **Every new slider steps by 1.** Rule: every value it can reach is one the link spells exactly (whole hundredths, whole counts).
11. **A slider's readout is also its `aria-valuetext`**, as `updateLandReadout` does for the sea level; a held one reads "held".
12. **The name index is served as `/outlines/names.json`** (design 8). Rule: pull request 1's call 3.
13. **Footnote marks:** the shape row takes the drawn ¶ and the islands row the drawn ‖, each with a note whose text is that term's ruled glossary words and whose head is "of the shape" or "of the islands", the house's form; the looseness, sizes and coast rows take none, as drawn.
14. **The coast's second sense runs into "Coast warp"**, so the glossary gains four headwords, not five. Rule: `handbook/specs/ui-design.md`, a homograph takes one headword.
15. **Every rendered row fetches its outline through `runJob`'s loader** (design 8). Rule: the measured worst case, 69 KB of files for 21 rows.
16. **The list holds every match up to the largest group of alike names and scrolls to them**, with the drawn "and N more; type more of the name" only past that cap. Rule: the designer's note under decision 5 ("such a list scrolls instead"), and the drawn line kept where it is true.
17. **The forms (round, crescent, ring) are not listed**; a link carrying one shows the form's id in the box. Rule: M5 is a search over the 5,646 real places, and pull request 1's grammar still reads a form.
18. **The list is a top-layer popover seated from viewport rects** (design 8). Rule: the footnotes' own seating, and the chart room's `contain: layout`.
19. **A failed name load leaves the list shut and the next keystroke retries**; a failed outline leaves its row's box empty. Rule: pull request 1's call 5 (a failed fetch is that one job's, and the next try retries).
20. **The list's ordering pins `localeCompare` to `"en"`**, so the order is one on every machine.
21. **The contrast of the end words and the track is left to the plate reader**, not pinned in the browser suite. Rule: `handbook/specs/conventions.md`, dressing pins lag one live cycle, and Issue #931's acceptance.
22. **No bold delight is taken.**

## Open decisions

None. Both items of the menu are ruled (below). The calls above are not yet ruled: they are put to Alex in a separate menu before the build, and each stands as a call for him to overrule until his answer is posted.

## Rulings

Alex, 2026-10-30, Issue #854 comment 6534752965 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6534752965), taken by the orchestrating session in `AskUserQuestion`; each is the option he chose, quoted as the menu worded it, and each was this plan's recommendation. Neither rests on a premise this plan found false: the menu stated each consequence in words, no picture having shown either state, and each consequence is the behaviour the plan already specified.

- **M-A, how a set island count goes back to the seed's choice: "Slide all the way left (Recommended)".** The islands slider runs 1 to 100 and its far-left notch, 1 (`ISLANDS_SEEDS_CHOICE` in `land-rows.ts`), reached by sliding or by Home, is the seed's choice: the readout says "seed's choice" (`islandsWord`), the thumb wears the faded ink, the count leaves the choice (`nextChoice` with `{ kind: "islands", slider: 1 }`) and so drops out of the link; one notch right is "about 2". What it changed here: design 5 and the authored `#islands` (`min="1"`) cite the ruling; T1d, T1e and T1f already pin it; nothing else moves.
- **M-B, the "sizes" pair on an archipelago before a number of islands is set: "Hidden until a number is set (Recommended)".** The sizes row is hidden while the held choice has no count, and appears, live or held, once one is set, as the raggedness row does; no new words. What it changed here: design 1's `sizes` line cites the ruling; T1b (`seatOf("archipelago", {})` with sizes hidden) and its mutation already pin it; nothing else moves.

## Stop conditions

Hand back, with the command and its output, when:
- a symbol or path this plan names is not where it says (`SLIP_CLEARANCE`, `fitStage`, `GLASS_GAP_REM`, `glassLeft`, `slipWidth`, `layout`, `fitRoom`, `FitParts`, `draftOverrides`, `wirePageControls`, `wireControls`, `shapeChoice`, `chooseShape`, `drawnShape`, `landDraws`, `coastDraws`, `createPlaceLoader`, `createPlaceGate`, `writePlaceFiles`, `PLACE_FOLDER`, `wireFootnotes`, `prwPlaceLand`, `redrawAfter`, `slipFaults`, `TERMS`, `br7Glossary`, `sendKey`, `explorerAt`), or `git diff --stat 17baca63 origin/main` names a code or test file this plan lists;
- a unit test outside the files named here reds;
- any test in T1 to T7 cannot be made red on the assertion it names with its stub, or a named mutation leaves it green;
- a file passes 400 lines or a function 50 after the change, or `src/site/explorer/app.ts` needs an edit;
- `npm run check` reds in the worker pass on a file this plan adds or edits (`worker-client.ts` is in it);
- a browser check's first run after its wiring is red, or its run at commit 9, before its wiring, is green, or a step takes more than 10 seconds, the step "BR16 to BR19" excepted, whose bound is 15 seconds since it holds three draws;
- a proof row comes back HOLE or NOT APPLIED (BR18's in particular: a key that never reaches the native range leaves it green under its mutation);
- E1's or E2's first run lands on the other side of its staged fixture reading, or on CI, the place on the archipelago (6 px from its floor in the staged reading) scrolls: that is the layout's slack on another machine, not a builder's fix;
- an existing check named under "Existing checks the change reaches", or any other browser check, reds;
- a tightening, a row or a word has to differ from the designer's stills or this plan to fit or to pass (a deviation is Alex's, not the builder's);
- `generated/explorer/app.bundle.js` grows by more than 6 KB gzipped (the plan adds code only), or any bundle or chunk gains the name index;
- any change moves a committed chart, the golden or `test/site/hero-charts.test.ts` (this pull request is site-only).

## Hand-offs

- **Issue #855 (the post-use sitting)**: its docket gains everything this pull request built from the step 2 rulings as provisional (the layout and tightenings, the held box and notes, the shape box and list, the outlines in it, the groove, the inset, the words), and calls 4, 5, 9, 13, 16 and 17 and the rulings M-A and M-B (comment 6534752965, feel rulings, provisional like the rest). The sitting is five to seven URLs (`handbook/specs/conventions.md`).
- **Issue #1139 (the panel heads at 3.93:1)**: changes `.archivist-head` in `src/styles/shared/house.css`, which this pull request does not touch; the heads now share a line with their glosses (`broadside.css`), so its fix is measured on that line.
- **Issue #1140 (the 15.2 px dropdowns)**: a 16px select is taller, and the place on the archipelago has 6 px to spare at 1024 by 768; its fix re-runs BR16.
- **Issue #1141 (the 42 letters that fall back)**: the list shows the names; this pull request touches no face.
- **Issue #1142 (Valmiera 21 times)**: the list's cap derives from the index and BR20 reads its count from the served index, so a corrected roster moves neither. T2d's and BR20's witnesses are the "Valmiera" group; a fix that leaves it six rows or fewer reds both witnesses, and that pull request moves them to another name shared by more than six rows ("Central" holds 10 today).
- **Issue #1129 (the 0.55 coast)**: touches `address-grammar.ts`, `table-address.ts` and `hash-sync.ts`, none of which this pull request edits; the coast's stand-down reads the shape, not the gate.
- **Issue #393 (the surface)**: shares no file with this pull request.
- **The step 2 round's archive**: the designer's delivery (`out/854-controls/`) is a ruled design round, archived under `design/` in its own pull request (`handbook/specs/conventions.md`), as PR #1127 did for Issue #1104; that is the dispatcher's, not this pull request's. That archive pull request still owes the plate reader over the round's mock pages, which the designer's report says it did not run, and the cold skeptic.
- **An observation for the dispatcher, not this pull request's**: the Print Room, the Ribbon and the Specimen Book move 1 to 2 px vertically on any stylesheet insertion and keep the move after it is removed (Measured), which reads as a first layout that a later style recalculation corrects. It is unmeasured beyond that probe and not filed.
