# Plan: Issue #434, Sub 8: the voyage's leg opens its ribbon

One pull request. Nothing in the recon or the measurements asks for more than one.

**Planned at**: `origin/main` 7200fdbbd08acb38993d1d283e98dc4afeb9ccd5, the issue read at 7 comments (`gh api repos/ahl-gram/Vellum/issues/434/comments --jq length`). Both were re-recorded after the rulings were folded in.

**Rulings**, all 2026-11-04:
- decisions A to D, https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6643897113;
- the resting label, https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6643975537;
- the STOP menu's M1 to M4, https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6645742777:
  - M1 "Small gold button, own line (Recommended)";
  - M2 "Shown pale from the start";
  - M3 "No button on the last entry";
  - M4 "Resets on any other action (Recommended)";
- M2's spoken note and M5, https://github.com/ahl-gram/Vellum/issues/434#issuecomment-6645788043:
  - the note is "Add a spoken note: \"Not reached yet\"";
  - M5 is "e2e/suites/room-voyage-route/road-press.ts (Recommended)".

**Open decisions**: none.

**How the readings were taken.**
- **The probe for the ruled design** is `out/434-dry-run/434-ruled-probe.ts` in this plan's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-af0c7ce74ae7f693c/`), its logs `434-ruled-<arm>.log` beside it, run as `node out/434-dry-run/434-ruled-probe.ts <arm>`.
- **The build it read** is the spike's (`434-build-spike.log`, from 7200fdbb plus the uncommitted spike) with the spike's query flag off, which serves main's room unchanged. The spike acts only under `?road=`.
- **The probe stages the ruled design**: the press, its label and note spans and the prose span, by injected markup, and this plan's stylesheet rules, verbatim, by an injected style.
- **The pre-ruling probe** `out/434-dry-run/434-probe.ts` and its `434-probe-*.log` hold the readings taken before the rulings, on the site built from 7200fdbb (`434-build-main.log`). Only its `back` arm, C16's, is still quoted.
- **T9's cost and witnesses** come from `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/434-measure.ts`.

## Specs

The implementer reads these first, at these sections, beside what `CLAUDE.md`'s spec table already owes for the work:

- `handbook/specs/explorer-doctrine.md`, "The engine boundary and the host contract". Read all of it, especially the bullets on `createLivingChart`, the host wiring of the document, "A host without a scrubber gets the SAME engine surface", the two hosts, and "the room is the only writer of `year=N`".
- `handbook/specs/region-and-voyage.md`, "The voyage", the itinerary bullet: the homecoming entry shares the first entry's index, so a reveal stays positional.
- `handbook/specs/ui-design.md`:
  - "The voice": the first paragraph, which this pull request edits.
  - "Colour, contrast and legibility": the 4.5:1 floor, and that a refusing press dims by ground.
  - "Gesture": a hover gesture promises navigation.
  - "Motion and ceremony": reduced motion is the control.
- `handbook/specs/cascade-traps.md`, all of it, before the stylesheet edit.
- `handbook/specs/check-placement.md`, "The unit suite" and "The browser lanes and a plate read".
- `handbook/specs/settle-doctrine.md`:
  - clauses 6 and 9;
  - "When a check is pulled out of the run", the bullets "What a step holds" and "Who finds a slow step".
- `handbook/specs/engine-invariants.md`:
  - "A ribbon result substitutes a refused departure or destination without announcing it";
  - "Measuring a world in a script".
- `handbook/specs/conventions.md`, "How a design decision is made", on feel rulings being provisional, and "The comment sweep", on writing comments.
- `.claude/skills/vellum-footguns/SKILL.md`:
  - Gate 1 before each test;
  - Gate 2 before the e2e module, item 16 included;
  - Gate 3 before the stylesheet;
  - Gate 5 at the push.

## The design

A small gold press reads **Take this road** on each road leg's journal row, on its own line under the row's words (M1).

**Before the voyage reaches its row** (M2), that is while the row lacks `inked`:
- The press shows from the start, pale: a cream ground and a faint border, at full strength.
- The row's day and words keep today's fade around it, so the press sits outside the faded row.
- A press there refuses. It goes nowhere, pauses nothing, and closes any question another row is asking.
- It carries `aria-disabled="true"` and a spoken note, "Not reached yet", which a screen reader hears and the eye does not.
- Once the row is told, the press turns gold, drops the note, and works.

**What a press does.**
- A first press on a reached row:
  - pauses the voyage exactly as the reader's own Pause does, which parks it and writes the room's address;
  - relabels the press **Leave the voyage?**;
  - goes nowhere.
- A second press on the same press closes the question and lets the anchor's own navigation open the Ribbon in this tab.
- The question also closes when the reader does anything else (M4):
  - focus leaves the press;
  - Escape is pressed on it;
  - another road press asks, or a pale press is pressed;
  - its row goes untold;
  - the story moves on, by Play or the bar;
  - a new chart is drawn.

**Back.** Back from the Ribbon returns to the room the browser kept, paused where the reader pressed. The press there reads Take this road again, because the question closed as the reader left. Where the browser did not keep the page, the room boots from the address the pause wrote.

**Rows with no press.** Sea and straight legs get none. The departure row has none. The homecoming row, the last entry, has none even when the road home is a road (M3).

### The code split, by ruling B

1. **The engine builds the press and owns its behaviour.** That is `src/site/shared/living-chart/voyage-log-panel.ts`, in a module-level `createRoadAsk`.
2. **The host hands the engine one optional callback**, `roadHref(seed, fromIdx, toIdx) => string`, on `ScrubberRefs`.
   - This follows the place card's `ribbonHref`: the host returns an address and the engine builds the element.
   - A host with no scrubber, the Explorer, has no journal and cannot pass it.
   - A scrubber host that passes nothing keeps today's rows.
3. **The reading frame forwards it** from `ReadingFrameOpts`, as it forwards `onPark` and `onAgesTold`.
4. **The room's writer is a pure function**, `roadHrefFor` in `src/site/reading-room/address.ts`.
   - It follows `prospectHrefFor`'s recipe: seed, style, type, band, the land and coast and shape keys, the Chart Table key, `a` and `b`, all through `writtenParams(..., written)`.
   - It writes no theme, legend, arms, beasts, `survey` or `year`.
5. **The leg each row belongs to comes from the plan itself.** `sessionLog` in `voyage-session.ts` passes `plan.legs` with each routed leg's mode to `buildLogPanel` as a sixth argument.
   - Row r holds leg r−1, positionally.
   - The panel gives the homecoming entry, the last when a homecoming was built, no leg, so it carries no press.
   - Nothing is matched by settlement index, because the homecoming row shares row 0's index.
6. **The pause is late-bound.** `createLivingChart` hands the panel a `park` closure that calls `ages.togglePlay()` when `ages.isPlaying()`. That is the reader's Pause: pause, the resting track synced, `onPark`. The panel is built before the instrument, the same late-bound coupling the overlay and the chronicle use.
7. **The story moving closes the question.** `agesFor` hands the instrument an `onAgesTold` that calls `logPanel.closeAsk()` before the host's own. The instrument calls `onAgesTold` on every paint of the position, by Play, the bar or a key, and the pause itself paints nothing, so the question it opens survives.

### Alternatives rejected

- **A room-side pass over `frame.log.strip` after the arm.** Ruling B chose the optional host hook. Rows are rebuilt on every arm, so a room pass would also have to chase every rebuild.
- **The host building the press and its click**, a hook returning an element.
  - The pause belongs to the engine's instrument, which the host reaches only through the public API.
  - Ruling B names `ribbonHref`'s shape: the host returns a string.
- **The hook on `LivingChartHost`, beside `ribbonHref`.** A scrubber-less host could then pass a writer that does nothing. On `ScrubberRefs` that state cannot be written (`handbook/specs/check-placement.md`, the type checker).
- **A `<button>` whose second press calls `location.assign`.**
  - Every way into the Ribbon in the house is an anchor: `pc-ribbon`, the Prospect's ribbon link, the Ribbon's LegendButtons.
  - An anchor makes the second press the browser's own navigation, with the address visible on hover.
- **Pausing with `pauseScrub` (`ages.pause`).** That is the draw's silent stop. It writes no address, so Back without the page cache would land at the survey's end or the present, not where the reader paused.
- **Matching a row to its leg by settlement index.** The homecoming row shares row 0's index, which is #275's trap.
- **Rebuilding the press per paint, or a document listener for "clicked elsewhere".** The engine adds document listeners only while a place card is shown (`handbook/specs/explorer-doctrine.md`). The closes above use the press's own listeners and the told signal.
- **The writer inline in `app.ts`.** That file is at 388 lines, and it cannot be imported in Node to test.
- **Sharing a helper between `prospectHrefFor` and the new writer.** Ruling C asks for a small new writer, and a refactor of the plate's writer is outside the issue.

## Files

Every file created, edited or deleted. Line counts are measured at 7200fdbb (`wc -l`).

### `src/site/shared/living-chart/voyage-log-panel.ts` (84 lines, about 190 after)

**Add imports:** `import type { LegMode } from "../../../render/voyage-route.ts";`.

**Add exports:**
- `export interface JournalLeg { readonly fromIdx: number; readonly toIdx: number; readonly mode: LegMode }`
- `export interface RoadPressHost { readonly href: (seed: number, fromIdx: number, toIdx: number) => string; readonly park: () => void }`
- `export const ROAD_TAKE = "Take this road";`
- `export const ROAD_ASK = "Leave the voyage?";`
- `export const ROAD_UNREACHED = "Not reached yet";`

**Add the module-level function `roadPressParts(href: string): { press: HTMLAnchorElement; label: HTMLSpanElement; note: HTMLSpanElement }`** (not exported, about 12 lines). It builds:

```html
<a class="cr-road" href="{href}">
  <span class="cr-road-label">Take this road</span>
  <span class="cr-road-note">Not reached yet</span>
</a>
```

- Between the two spans goes `document.createTextNode(" ")`, so the press's spoken name reads "Take this road Not reached yet" and not "roadNot".
- Text nodes, not strings, because `test-support/element-shim.ts`'s `append` takes nodes only.

**Add the module-level type `type Seat = { readonly press: HTMLAnchorElement; readonly label: HTMLSpanElement; readonly note: HTMLSpanElement; readonly row: HTMLLIElement }`.**

**Add the module-level function `paintSeat(s: Seat): void`** (about 5 lines):

```ts
const told = s.row.classList.contains("inked");
s.press.setAttribute("aria-disabled", String(!told));
s.note.hidden = told;
```

**Add the module-level function `createQuestion()`** (not exported, about 22 lines). It holds `let asking: Seat | null = null` and returns:
- `asks(s: Seat): boolean`, which is `asking === s`;
- `open(s: Seat): void`, which sets `s.label.textContent = ROAD_ASK` and then `asking = s`;
- `close(): void`, which, if `asking`, sets `asking.label.textContent = ROAD_TAKE`, then sets `asking = null`;
- `closeIfUntold(): void`, which, if `asking` is set and its row lacks `inked`, calls `close()`;
- `forget(): void`, which sets `asking = null`.

The type `type Question = ReturnType<typeof createQuestion>` sits beside it.

**Add the module-level function `onPress(s: Seat, e: MouseEvent, q: Question, park: () => void): void`** (about 14 lines), in this order:
1. If `!s.row.classList.contains("inked")`: `e.preventDefault(); q.close(); return;`. A pale press refuses, and pressing it is "any other action" (M4).
2. If `q.asks(s)`: `q.close(); return;`, leaving the default alone. This is the leave.
3. Else: `e.preventDefault(); q.close(); park(); q.open(s);`.

**Add the module-level function `createRoadAsk(park: () => void)`** (not exported, about 28 lines). It makes `const q = createQuestion()` and holds `let seats: Seat[] = []`, every press built since the last rebuild. It returns `{ press, close: q.close, settle, forget }`:

- **`press(row: HTMLLIElement, href: string): HTMLAnchorElement`**:
  - `const s: Seat = { ...roadPressParts(href), row }`, then `seats.push(s)` and `paintSeat(s)`.
  - It then binds three listeners on `s.press` itself:
    - `click`: `(e) => onPress(s, e, q, park)`;
    - `focusout`: if `q.asks(s)`, `q.close()`;
    - `keydown` (e: KeyboardEvent): if `e.key === "Escape"` and `q.asks(s)`, `q.close()`.
  - It returns `s.press`.
- **`settle(): void`**: `seats.forEach(paintSeat); q.closeIfUntold();`.
- **`forget(): void`**: `seats = []; q.forget();`. Used when the rows are replaced; their nodes go with them.

**Change `journalRow`** to `journalRow(e: Readonly<VoyageLogEntry>, i: number, road: ((row: HTMLLIElement) => HTMLAnchorElement) | null): HTMLLIElement`.
- The departure's drop-cap branch, `i === 0`, is unchanged, and so is a row with no press.
- A row with a press puts its words in `<span class="cr-prose">`, then a text node `" "`, then `road(li)`, all inside `.cr-text`. The prose span is what lets the row's words fade while the press does not (M2).

**Add the type `type RoadAsk = ReturnType<typeof createRoadAsk>`.**

**Add the module-level function `rowLeg(legs: ReadonlyArray<JournalLeg>, i: number, count: number, homecoming: boolean): JournalLeg | undefined`.** It returns `i === 0 || (homecoming && i === count - 1) ? undefined : legs[i - 1]`. That is M3: the last entry, when a homecoming was built, takes no leg.

**Add the module-level function `roadFor(road: Readonly<RoadPressHost> | undefined, ask: RoadAsk, seed: number, leg: JournalLeg | undefined): ((row: HTMLLIElement) => HTMLAnchorElement) | null`.** It returns `road && leg && leg.mode === "road" ? (row) => ask.press(row, road.href(seed >>> 0, leg.fromIdx, leg.toIdx)) : null`.

**Change `createVoyageLogPanel`** to `createVoyageLogPanel(logEls: VoyageLogHost, road?: RoadPressHost)`. It makes `const ask = createRoadAsk(road ? road.park : () => {})`.
- **`buildLogPanel`** takes `(logPorts, presentYear, seed, subtitle, homecoming?: VoyageHomecoming | null, legs: ReadonlyArray<JournalLeg> = [])`. It calls `ask.forget()` before it builds the rows, and builds each row as `journalRow(e, i, roadFor(road, ask, seed, rowLeg(legs, i, log.entries.length, homecoming != null)))`.
- **`revealLog`** calls `ask.settle()` after its loop.
- **`hideLog`** calls `ask.forget()`.
- **The returned object** adds `closeAsk: ask.close`.

**Function sizes**, counted as `max-lines-per-function` counts, skipping blanks and comments:
- `createVoyageLogPanel` is 35 lines at 7200fdbb and about 42 after.
- `createRoadAsk` is about 28 lines.
- `createQuestion` is about 22.
- `journalRow` is about 25.
- `onPress` is about 14.
- `roadPressParts` is about 12.
- `paintSeat`, `rowLeg` and `roadFor` are about 4 to 6 each.

These are counted as Prettier lays them out at width 120, every braced body on its own lines.

All stay under 50, with no `max-lines-per-function` skip. The file comes to about 190 lines, under 400.

### `src/site/shared/living-chart/no-bar.ts` (60 lines)

- `barlessLogPanel()` adds `closeAsk: () => {}`.
- Its `buildLogPanel` stand-in keeps its five parameters; TypeScript accepts the shorter list.
- Nothing else changes.

### `src/site/shared/living-chart/voyage-session.ts` (222 lines)

`sessionLog`'s `logPanel.buildLogPanel(...)` call gains a sixth argument: `plan.legs.map((leg, i) => ({ fromIdx: leg.fromIdx, toIdx: leg.toIdx, mode: routed[i]!.mode }))`.

### `src/site/shared/living-chart/index.ts` (182 lines)

- **`ScrubberRefs`** adds `roadHref?: (seed: number, fromIdx: number, toIdx: number) => string;`. The name does not start with `onAges`, so the type-level guard in `test/site/ages-told-signal.test.ts` stands.
- **Add the module-level function `journalFor(bar: Readonly<ScrubberRefs> | undefined, park: () => void): VoyageLogPanel`**, with its body in this order:
  1. if `!bar`, return `barlessLogPanel()`;
  2. `const road = bar.roadHref ? { href: bar.roadHref, park } : undefined;`
  3. return `createVoyageLogPanel({ panel: bar.panel, sig: bar.sig, strip: bar.strip }, road)`.

  The type `VoyageLogPanel` joins the import from `./voyage-log-panel.ts`.
- **`agesFor`** takes a fifth parameter, `logPanel: Readonly<VoyageLogPanel>`. Its `createAges` call's `onAgesTold: bar.onAgesTold` becomes `onAgesTold: (told: ToldEntry | null) => { logPanel.closeAsk(); bar.onAgesTold?.(told); }`. It is about 25 lines after, against 21 at 7200fdbb.
- **In `createLivingChart`:**
  - `const logPanel = bar ? createVoyageLogPanel(...) : barlessLogPanel();` becomes `const logPanel = journalFor(bar, () => parkForRoad());`.
  - The `agesFor` call passes `logPanel` last.
  - Add `function parkForRoad(): void { if (ages.isPlaying()) ages.togglePlay(); }`. It is a declaration, so it hoists, and it is called only at click time, after `ages` exists.
  - It is 36 lines at 7200fdbb and about 39 after, so under 50.
- **Nothing joins the returned API.** The roster `API` in `test-support/living-chart-hosts.ts` is unchanged.

### `src/site/shared/reading-frame/index.ts` (165 lines)

- `ReadingFrameOpts` adds `readonly roadHref?: (seed: number, fromIdx: number, toIdx: number) => string;`. Its one-line doc comment: "Forwarded to the journal, so a host can give each road leg's row its way into the Ribbon."
- `frameHost`'s `scrubber` literal adds `roadHref: opts.roadHref,` after `onAgesTold`.

### `src/site/reading-room/address.ts` (13 lines, about 45 after)

**Add `export interface RoadWorld`**, with these fields:
- `readonly style: StyleName`
- `readonly type: MapType | ""`
- `readonly band: ClimateBand | ""`
- `readonly keys: LandKeys`
- `readonly table: string | null`
- `readonly written: Written | null`

**Add `export function roadHrefFor(world: RoadWorld, seed: number, fromIdx: number, toIdx: number): string`**. Its body, in this order:
1. `p = new URLSearchParams()`;
2. `seed`, then `style`;
3. `type` if set, `band` if set;
4. `emitLandKeys(p, world.keys)`;
5. `TABLE_KEY` if `world.table !== null`;
6. `a = fromIdx`, `b = toIdx`;
7. return `"/ribbon/#" + writtenParams(p, world.written).toString()`.

**New imports:**
- `emitLandKeys` and `LandKeys`, from `../shared/address-grammar.ts`;
- `writtenParams`, from `../shared/written-world.ts`;
- the type `Written`, from `../shared/written-address.ts`;
- the types `StyleName`, `MapType` and `ClimateBand`, from the modules `app.ts` imports them from.

### `src/site/reading-room/app.ts` (388 lines; 400 or fewer after, a stop condition)

- The import of `parseReadingRoomAddress` from `./address.ts` becomes `{ parseReadingRoomAddress, roadHrefFor }`.
- The `createReadingFrame(mount, {...})` call at line 60 gains this option:

  ```ts
  roadHref: (forSeed, from, to) =>
    roadHrefFor(
      { style, type: carried.type, band: carried.band, keys: carried.keys, table: carried.table, written: heldFor(written, forSeed) },
      forSeed,
      from,
      to,
    ),
  ```

  It reads module state at call time, as `onPark` does, and the seed is the one the engine armed with.
- Nothing else in the file changes.

### `src/styles/shared/reading-frame.css` (236 lines)

Add, after the `.rf-log-strip .cr-text` rule, these rules: the dress (M1), the pale wait (M2), and the spoken note hidden from sight.

```css
.rf-log-strip li.prologue .cr-road {
  display: block;
  width: fit-content;
  margin-top: 0.3rem;
  padding: 0.16rem 0.55rem;
  font-style: normal;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-decoration: none;
  color: var(--ink-dark);
  background: var(--control-gold);
  border: 1px solid var(--line-tan);
  border-radius: 4px;
  transition:
    transform 160ms ease,
    border-color 160ms ease;
}
.rf-log-strip li.prologue .cr-road:is(:hover, :focus-visible) {
  border-color: var(--ink-brown);
  transform: translateY(var(--raise)) rotate(-0.6deg);
}
.rf-log-strip li.prologue:not(.inked):has(.cr-road) {
  opacity: 1;
}
.rf-log-strip li.prologue:not(.inked):has(.cr-road) > .cr-year,
.rf-log-strip li.prologue:not(.inked) .cr-prose {
  opacity: 0.4;
}
.rf-log-strip li.prologue:not(.inked) .cr-road {
  background: var(--control-cream);
  border-color: var(--line-faint);
}
.rf-log-strip li.prologue:not(.inked) .cr-road:is(:hover, :focus-visible) {
  border-color: var(--line-faint);
  transform: none;
}
.rf-log-strip li.prologue:has(.cr-road) > .cr-year,
.rf-log-strip .cr-prose {
  transition: opacity 0.18s;
}
.rf-log-strip .cr-road-note {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

**Specificity**, each in numbers (`vellum-footguns` Gate 3 item 1):
- **The gold dress**, (0,3,1), outranks `.slip a` at (0,1,1) and the house anchor rules.
- **The lifted row**, (0,4,1), outranks `.rf-log-strip li` at (0,1,1). That is today's 0.4 fade on every untold row, which still fades every sea row and the departure untouched.
- **The faded day and words**, (0,5,1) and (0,4,1), are scoped to rows that carry a press, so no sea row is faded twice.
- **The pale ground**, (0,4,1), ties the gold hover at (0,4,1) and comes after it.
- **The pale hover hold**, (0,5,1), keeps a refusing press from taking the gold hover's tip and border. "A hover gesture promises navigation" (`handbook/specs/ui-design.md`), and the precedent is `.pc-lay.dim` in `src/styles/shared/living-chart.css`.
- **The note's rule sets no `display`**, so the `hidden` attribute the script sets on a told row takes the note out of the accessibility tree (`handbook/specs/cascade-traps.md`: author `display` makes `[hidden]` inert).

**Where these rules live.** `cr-road`, `cr-road-label`, `cr-road-note` and `cr-prose` are not engine hooks for `vellum/css-engine-dress-one-home` (`isHook` in `scripts/lint/sheet-owners.ts` matches `place-overlay|place-hit|ages-range|pc-*|voyage-*`), so they live beside the row rules they ride.

**Fidelity to the stills.** These are the spike's GOLD-HIDE and GOLD-DIM rules with the spike's `body[data-road]` and `body[data-wait]` scoping taken off. There are two differences, both named in the PR body:
- **The fade is narrowed to the rows that carry a press.** The spike lifted every untold row, so its still `434-gold-dim-midvoyage-1024-slipcrop.png` shows untold SEA rows unfaded, a defect of the spike. The ruling's words keep today's fade on the row (C17).
- **The spoken note's rule is added.** The spike had no note.
- **The fade's 0.18 s ink-in is kept on the lifted row's day and words**, as every journal row inks in today (`.rf-log-strip li` in this sheet). A still cannot show a transition, so this is not a departure from one (C18).

No comment is owed: RV8b pins the pale wait and the lift, and the plate reader the dress.

### `handbook/specs/ui-design.md`, "The voice", first paragraph

Replace

> **A road out of a room is two lines: a verb, then a place.** "Take to / The Print Room". "Read the journal in / The Reading Room". "See the road's end in / The Prospect". The verb line and the room line wear different faces and different inks, and the pair is one component. A press that acts on the sheet itself rather than going anywhere wears the same dress as a button.

with

> **A road out of a room is two lines: a verb, then a place.** "Take to / The Print Room". "Read the journal in / The Reading Room". "See the road's end in / The Prospect". The verb line and the room line wear different faces and different inks, and the pair is one component. A press that acts on the sheet itself rather than going anywhere wears the same dress as a button. **A road out of a row or a card that already names its places is one line, a verb on the thing**: the place card's "Take the road" (Issue #428), and the journal's "Take this road" on a road leg's row, which stands pale and says "Not reached yet" to a screen reader until the voyage reaches its row, and asks "Leave the voyage?" before it goes (Alex, 2026-11-04, Issue #434 comments 6643897113, 6643975537, 6645742777 and 6645788043). **Provisional until the post-use review:** the journal press's gold dress, its own line under the entry, its pale wait and its spoken note, the last entry standing plain, and when its question closes.

### `handbook/specs/explorer-doctrine.md`, "The engine boundary and the host contract"

After the bullet that opens "**A host without a scrubber gets the SAME engine surface, not a narrowed one.**" and its two sub-bullets, insert this bullet:

> - **A scrubber host may give the journal its way into the Ribbon, and one that gives none keeps today's rows** (Alex, 2026-11-04, Issue #434 ruling B). `roadHref` on `ScrubberRefs` hands back an address for a road leg's two settlements on the world the engine armed; the engine seats the press on that leg's row, positionally, and pauses through the reader's own Pause, so the park writes the address (`createVoyageLogPanel` in `src/site/shared/living-chart/voyage-log-panel.ts`). The host returns a string and never an element, as for the place card's `ribbonHref`.

## Tests, in the order they are written

**Every unit test** runs under `npm test -- <file>`. The stubs below are written first, each with the right shape and the wrong behaviour, so each test reds on its assertion and not on a missing module or export.

**What the prover owes.**
- `vellum-guard-prover` gets T1 to T9, unit only, in one round, with the mutations below.
- The two browser checks, RV8b and RV8c, are proved by the implementer: each mutation is sent through the proof runner (`npm run proof -- send`) naming the suite `room-voyage-route` and the check id. Where the runner cannot be used, each is run locally with the suite alone.

### The fixture T1 to T5 share: `test/site/reading-frame-log.test.ts`

A new module-level `ROAD_PORTS` and `ROAD_LEGS`, beside the file's existing three ports, which stay as they are.

`ROAD_PORTS` holds four ports. Each also has `inlandHandoff: false`:

| idx | name | kind | founded | arrivalMode | legLength |
|---|---|---|---|---|---|
| 0 | Aldmarch | capital | 214 | null | 0 |
| 4 | Kelder | town | 402 | sea | 28 |
| 9 | Brenmoor | village | 655 | road | 14 |
| 12 | Dunmere | village | 700 | road | 30 |

The homecoming is `HOME = { arrivalMode: "road", inlandHandoff: false, legLength: 14 }`.

`ROAD_LEGS` is `[{ fromIdx: 0, toIdx: 4, mode: "sea" }, { fromIdx: 4, toIdx: 9, mode: "road" }, { fromIdx: 9, toIdx: 12, mode: "road" }, { fromIdx: 12, toIdx: 0, mode: "road" }]`.

A helper `roadPanel(park = () => {})` returns:
- the panel `createVoyageLogPanel({ panel: el(), sig: el(), strip: el() }, { href: (s, a, b) => \`/ribbon/#seed=${s}&a=${a}&b=${b}\`, park })`;
- and `buildLogPanel(ROAD_PORTS, 1200, 42, "x", HOME, ROAD_LEGS)`'s rows.

The rows are:
- 0, the departure;
- 1, Kelder, sea;
- 2, Brenmoor, road;
- 3, Dunmere, road;
- 4, the homecoming, whose leg is a road.

The small helpers:
- `pressOf(li)` finds the `cr-road` child of the row's `.cr-text`.
- `labelOf(p)` and `noteOf(p)` find its two spans by class.
- An event is `ev()`, which returns `{ defaultPrevented: false, preventDefault() { this.defaultPrevented = true } }`.

### T1: `test/site/reading-frame-log.test.ts`

**Name**: "a road leg's journal row carries Take this road to the host's address for that leg; the departure, a sea row and the last entry carry none (#434)"

**Assertions**:
- 5 rows.
- The homecoming's leg is a road: `ROAD_LEGS[3].mode === "road"`, asserted as the witness.
- `pressOf` is undefined on rows 0, 1 and 4.
- Row 2's press:
  - `tagName` "A", `href` "/ribbon/#seed=42&a=4&b=9";
  - `labelOf` text "Take this road", `noteOf` text "Not reached yet";
  - its row's `.cr-text` children are, in order, `SPAN.cr-prose` holding the entry's words, a text node " ", and the press.
- Row 3's press has `href` "/ribbon/#seed=42&a=9&b=12".
- Every row's `.cr-year` text is unchanged from what the entries give.

**Stub**: the new signature, types, constants and `closeAsk` exist, and `roadFor` returns null always. It reds on "row 2 carries a press".

**Mutations**:
- `leg.mode === "road"` → `leg.mode !== "straight"`: row 1, the sea row, carries a press.
- In `rowLeg`, delete `|| (homecoming && i === count - 1)`: row 4 carries a press.
- `legs[i - 1]` → `legs[i]`: row 2's `href` reads a=9&b=12.

### T2: `test/site/reading-frame-log.test.ts`

**Name**: "a host that hands the journal no road writer keeps today's rows (#434 ruling B)"

**Fixture**: the shared ports, homecoming and legs, through `createVoyageLogPanel(els)` with no second argument.

**Assertion**: no row's subtree holds a `cr-road` or a `cr-prose`. Walk with `walk` from `test-support/element-shim.ts`.

**Stub**: T1's implementation. It is green at once, since nothing builds a press without a host. Its red is the mutation.

**Mutation**: `createVoyageLogPanel(logEls, road?)` → `createVoyageLogPanel(logEls, road: RoadPressHost = { href: () => "/ribbon/", park: () => {} })`.

### T3: `test/site/reading-frame-log.test.ts`

**Name**: "the press stands pale until the voyage reaches its row: it refuses, pauses nothing, and says Not reached yet; told, it works and the note goes (#434 M2)"

**Fixture**: `roadPanel(park)`, with `park` recording calls into an array.

**Assertions**:
1. At build, no row inked: row 2's press `getAttribute("aria-disabled") === "true"` and `noteOf(press).hidden === false`.
2. After `revealLog(rows, 2)`, so row 2 is untold: the same two reads.
   - `fire("click", e)` gives `e.defaultPrevented === true`;
   - `park` was called 0 times;
   - the label still reads "Take this road".
3. After `revealLog(rows, 3)`, so row 2 is told: `aria-disabled === "false"` and `noteOf(press).hidden === true`. Row 3's press is still `aria-disabled === "true"` with its note shown.
4. After `revealLog(rows, 2)` again, the scrub back: row 2 reads `aria-disabled === "true"` and its note is shown.

**Stub**: the press built as T1 has it, with no listeners and no `paintSeat`. It reds on clause 1's `aria-disabled`.

**Mutations**:
- delete the `paintSeat(s)` call in `press`;
- delete `seats.forEach(paintSeat)` in `settle`;
- `s.note.hidden = told` → `s.note.hidden = false`;
- delete the inked-guard branch of `onPress`.

Each reds its own clause.

### T4: `test/site/reading-frame-log.test.ts`

**Name**: "the first press on a told row pauses the voyage and asks Leave the voyage?; the second lets the Ribbon open (#434 ruling A)"

**Fixture**: `roadPanel(park)`, then `revealLog(rows, 5)`, a first click on row 2's press with `ev1`, and a second click with `ev2`.

**Assertions**:
- After the first click: `ev1.defaultPrevented` is true, `park` was called once, and `labelOf` reads "Leave the voyage?".
- After the second click: `ev2.defaultPrevented` is false, `park` is still at one call, and the label reads "Take this road", closed as it leaves.
- The note stays hidden throughout, since the row is told.

**Stub**: the listener with its inked guard only. It reds on `park` being called once.

**Mutations**:
- delete `e.preventDefault()` in `onPress`'s last branch;
- delete `park()`;
- make the leave branch `{ e.preventDefault(); q.close(); return; }`.

### T5: `test/site/reading-frame-log.test.ts`

**Name**: "the question closes on any other action: focus leaving, Escape, another road asking, a pale press pressed, its row untold, the engine's closeAsk, and a rebuild (#434 M4)"

**Fixture**: `roadPanel(park)`, `revealLog(rows, 5)`. Each clause opens the question on row 2 with a first click, then does one thing. Six clauses close it:
1. `fire("focusout")` on row 2's press;
2. `fire("keydown", { key: "Escape" })` on it;
3. a first click on row 3's press: row 2 closes and row 3 asks. `revealLog(rows, 5)` again to reset before the next clause.
4. `revealLog(rows, 3)`, so row 3 is untold, then a click on row 3's press: it is prevented, `park` is not called, and row 2 closes. `revealLog(rows, 5)` again after.
5. `revealLog(rows, 2)`, so row 2 itself is untold;
6. `panel.closeAsk()`.

**Assertions**:
- After each of clauses 1 to 6, row 2's label reads "Take this road".
- After each of clauses 1 to 4 and 6, a fresh first click on row 2 is prevented and calls `park` again. That proves the question closed and did not merely relabel.
- Clause 7: after `buildLogPanel` is called again, a rebuild, the new row 2's first click (after `revealLog(newRows, 5)`) is prevented. A forgotten ask would let it through as a leave.

**Stub**: no `focusout` or `keydown` listener, a `settle` that only paints, `closeAsk` that does nothing, and a refuse branch without `q.close()`. It reds at clause 1.

**Mutations**, each one deleted on its own, and each reds its own clause:
- the `focusout` listener;
- the `keydown` listener;
- `q.close()` in `onPress`'s last branch;
- `q.close()` in the refuse branch;
- `q.closeIfUntold()` in `settle`;
- `closeAsk: ask.close`, turned into `() => {}`;
- `createQuestion`'s `forget` body, `asking = null`.

### T6: `test/site/reading-frame.test.ts`

**Name**: "#434 the frame forwards roadHref to the scrubber host beside onPark"

**Shape**: the existing onAgesTold forwarding test's, with `roadHref = () => ""`.

**Assertion**: `frame.host.scrubber.roadHref === roadHref`.

**Stub**: the option type is added and not forwarded. It reds on the equal.

**Mutation**: delete `roadHref: opts.roadHref,`.

### T7: `test/site/reading-room-address.test.ts`

**Name**: "roadHrefFor writes the world, the Chart Table and the leg, and none of the look or live keys (#434 ruling C)"

**Call**: `roadHrefFor({ style: "ink", type: "citystate", band: "polar", keys: { land: 0.35, coast: 0.55, shape: {} }, table: "k-p.seed-42.style-ink.i-3.year-814", written: null }, 42, 3, 7)`.

**Assertions**:
- The result starts with "/ribbon/#".
- The keys of `new URLSearchParams(result.slice(9))`, in order, deepEqual `["seed", "style", "type", "band", "land", "coast", "table", "a", "b"]`.
- `parseRibbonAddress(result.slice(8))` from `src/site/ribbon/address.ts` gives:
  - seed 42, style "ink", type "citystate", band "polar";
  - land 0.35, coast 0.55;
  - from 3, to 7.

**Stub**: it returns "/ribbon/#". It reds on the key list.

**Mutations**:
- Add `p.set("legend", "1")`.
- Drop `p.set("b", ...)`.

### T8: `test/site/reading-room-address.test.ts`

**Name**: "roadHrefFor lets a written world's sentence speak for it: found and v ride, no identity key beside them (#434 ruling C)"

**Call**: T7's world with `written: { sentence: "A cold isle of two towns", version: 1 }`.

**Assertions**:
- The keys deepEqual `["found", "v", "style", "table", "a", "b"]`.
- `found` equals the sentence.

**Stub**: T7's implementation. It reds on the key list, because seed, type, band, land and coast are present.

**Mutation**: return `"/ribbon/#" + p.toString()`, without `writtenParams`.

### T9: `test/site/ribbon-job.test.ts`, appended

**Name**: "every road leg of the voyage the room builds draws in the Ribbon as the same from and to pair (#434 ruling D)"

**What it builds**, for seeds `[1, 2, 5, 42, 526413615]`:
- `generateWorld(defaultRecipe(seed))`, seed first (`handbook/specs/engine-invariants.md`);
- `buildPlaceManifest(world, 1500)` and `buildSurvey(world.elev, world.seaLevel, world.roads)`;
- `createSessionBuilder({ mapEl: new El("div") as unknown as HTMLElement, logPanel: barlessLogPanel() }).build(manifest, survey, seed, "")`.

`installShim()` and `El` come from `test-support/element-shim.ts`, installed at the test's start. For each `plan.legs[i]` it takes the mode from `session.legs[i].mode` and calls `ribbonResultFor(world, { from, to, dress: "antique" })` inside a try.

**Assertions**:
- Every seed's session is not null and holds at least one road leg. That is a witness per world.
- The list of road legs whose result's `fromIdx` or `toIdx` differs from the leg's, or whose call threw, deepEquals `[]`, each entry naming seed, leg index and pair.
- Across the fixture, at least one non-road leg's pair does NOT draw the same. That is the witness that the road filter carries the test.

**Measured on this plan's tree at 7200fdbb**, with `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/b93dd61c-b063-4710-9a57-3af6c9ec9c50/scratchpad/434-measure.ts` run as `node <that path> 42 526413615 1 2 3 4 5 6 7 8`:
- Road legs drawn the same: 18 of 18 on seed 1, 18 of 18 on seed 2, 16 of 16 on seed 5, 17 of 17 on seed 42, and 13 of 13 on seed 526413615.
- Non-road legs not drawn the same: 0, 5, 5, 2 and 2, so 14 witnesses on four of the five seeds.
- Cost per world: generation 345 to 400 ms, the session 297 to 377 ms, and every road leg's Ribbon 24 to 47 ms. That is 0.73 to 0.78 s a world, about 3.8 s for the five, against ruling D's "about 4 seconds".

**Stub**: none. It is a guard on today's behaviour and is green at its first run; its red is each mutation, run before its commit.

**Mutations**:
- M9a, `src/site/explorer/ribbon-job.ts` line 98: `reachable.includes(requested)` → `!reachable.includes(requested)`. Every road leg substitutes.
- M9b, `src/site/shared/living-chart/voyage-session.ts` line 106: `mode: leg.mode,` → `mode: "road" as const,`. The 14 witnessed non-road legs then count as road and fail.

### RV8b: `e2e/suites/room-voyage-route/road-press.ts`, the file M5 named

The check is the export `rv8bRoadRows(ctx: SuiteContext)`, run in `run()` as `await step("RV8b", () => rv8bRoadRows(ctx))` right after `rv8LogMode`, with `const step = makeStep(ctx)` from `e2e/support/step.ts` made at the top of `run()`. It reads RV7's `__vellumVoyageStepTo(999)` state, as RV8 does.

**Label**: "RV8b the journal's road rows carry Take this road to the Ribbon at that leg's two towns, its sea rows and its last entry carry none, and a press stands pale and unfaded on a row the voyage has not reached, gold once it has (#434)"

**Read**, one evaluate, the same as `RV8B_READ` in `out/434-dry-run/434-ruled-probe.ts`:
1. Read `window.__vellumVoyagePlan().legs` and the rows `document.querySelectorAll(".rf-log-strip li.prologue")`.
   - For each leg i, take `rows[i+1].querySelector(".cr-road")`, and read its `.cr-road-label` text, its `target`, and `new URL(press.href)`'s pathname and hash params.
   - The params read are `a`, `b`, `seed`, and which of theme, legend, arms, beasts, survey and year are present.
2. `__vellumVoyageStepTo(0)`, then finish every running animation under the strip's rows: `li.getAnimations({ subtree: true }).forEach((a) => a.finish())`.
   - This is because today's `transition: opacity 0.18s` on `.rf-log-strip li` makes a read taken at once return the starting opacity.
   - Without the finish, the pale-rule mutation read `li` opacity "1" (measured).
   - The check says at its line why it finishes them, an artificial instrument (`vellum-footguns` Gate 2 item 14).
3. For every row without `inked` that holds a press, read the computed `backgroundColor` of the press, and the computed `opacity` of the press, the `li`, its `.cr-prose` and its `.cr-year`.
4. `__vellumVoyageStepTo(999)` and the same finish. Read every press's `backgroundColor` on an inked row, and whether `.rf-status` equals `__vellumVoyageLog().summary`, which restores RV9's state.

**Assertion**:
- rows equals legs plus one;
- at least one inbound leg is road and one leg sea, and the closing leg is road: the witnesses for M3 and the sea negative on this world;
- every inbound road leg's row press reads label "Take this road", path "/ribbon/", `a` = `fromIdx`, `b` = `toIdx`, seed 526413615, target "", with none of the dropped keys;
- every sea row, and the last entry, has no press;
- at stepTo(0), at least one press stood on an untold row, and every such press read:
  - background `rgb(248, 241, 224)`, which is `--control-cream`;
  - its own opacity and its row's "1";
  - its prose's and its gutter's opacity "0.4";
- at stepTo(999), every press read background `rgb(240, 227, 189)`, which is `--control-gold`, and the status line was restored.

Both colours are ruled tokens, so the literals stand (`handbook/specs/check-placement.md`, "A ruled number may stay a literal"); one dated line at the constants names the tokens.

**Readings.** All are from `out/434-dry-run/434-ruled-probe.ts`, on the build and staging under "How the readings were taken", logs `434-ruled-<arm>.log`.

- **Fixture** (`rv8b-fixture`): `ok: true`.
  - 25 rows and 24 legs: 13 road, 11 sea, the closing leg road. 12 presses were staged, the homecoming none, and 0 rows fail.
  - Pale: 12 of 12 pass, each `{ bg: "rgb(248, 241, 224)", press: "1", li: "1", prose: "0.4", gutter: "0.4" }`.
  - Told: 12 of 12 gold, and `restored: true`.
  - Every instance passes alike.
- **The homecoming gets a press** (`rv8b-mut-withhome`, M3's mutation): `ok: false`. Exactly 1 row fails, leg 23 (14 to 0, road, the last entry). That is the one row the mutation is meant to red.
- **A press on every row** (`rv8b-mut-every`): `ok: false`. 12 rows fail, all 11 sea rows plus the homecoming. The nearest to passing is every sea row alike, e.g. leg 2 (19 to 24).
- **Off by one** (`rv8b-mut-offset`): `ok: false`, with 18 rows failing (12 road, 6 sea).
- **The pale rules deleted** (`rv8b-mut-nopale`, the gold dress alone): `ok: false`. The row clauses pass, but 12 of 12 untold presses fail, each `{ bg: "rgb(240, 227, 189)", li: "0.4", prose: "1", gutter: "1" }`.
- **The lift deleted** (`rv8b-mut-nolift`, the pale rules without `li.prologue:not(.inked):has(.cr-road) { opacity: 1 }`): `ok: false`. 12 of 12 untold presses fail on `li: "0.4"`, which fades the press with its row, while `bg` reads cream.
- **Not taken**: `aria-disabled` and the note's `hidden` toggling with `inked`. Only the change's `settle` drives them, so the staging set them once and they are not read here. T3 holds them.

**Mutations**:
- `leg.mode === "road"` → `true`;
- `legs[i - 1]` → `legs[i]`;
- `rowLeg`'s homecoming clause deleted;
- the pale ground rule deleted;
- the lift rule deleted.

### RV8c: the same file

The check is the export `rv8cAsksThenGoes(ctx: SuiteContext)`, run as `await step("RV8c", () => rv8cAsksThenGoes(ctx))` after `rv10Handoff` and before `rv11Seed39`, which navigates away. It sets every state it reads itself.

**Label**: "RV8c a journal road press pauses the playing voyage and asks Leave the voyage?, the story moving on closes the question, and a second press lets the Ribbon open in this tab (#434)"

**Gestures**, all through `sendClick` in `e2e/support/input.ts`, at each element's own rect centre:
1. `__vellumVoyageStepTo(999)`, then `makeBar(ctx).setYear(0)`, the ages chamber at its earliest year, so every survey row is told.
2. Install a document click recorder. It pushes `{ prevented: e.defaultPrevented, label }` for any click inside `.cr-road`, `label` being the press's `.cr-road-label` text, then calls `e.preventDefault()` so the suite never leaves the room. That last call is the recorder's own, said at the check.
3. Press `.rf-play` and read `__vellumReadingRoomAges().playing`, the witness, which must be true.
4. Scroll the first inbound road leg's press (`plan.legs.slice(0, -1).findIndex(mode === "road")`, row i+1) to the centre of its slip with `scrollIntoView({block:"center"})`.
   - Assert that the element `document.elementFromPoint` gives at its centre is the press or inside it, since the label span is the topmost element there.
   - Then press it.
5. **Witness**: `document.activeElement` is the press and its label reads "Leave the voyage?". Then move the story on with the bar, `makeBar(ctx).setYear(min + 50)` with `min` from `__vellumReadingRoomAges()`. That dispatches the range's `input` and moves no focus.
   - Then `makeSettle(ctx)` waits, throwing inside the step, for the label to read "Take this road" while `document.activeElement` is still the press. That is the default 120 tries.
   - Never press Play here. A real press on Play takes focus off the asking press, and its `focusout` closes the question before Play paints, so the check could not see the wrapper go missing.
6. Press the press again (ask), then again (go).

**Assertion**:
- playing was true before step 4;
- after step 4: the first recorded click `prevented` true, playing false, `.rf-play` reads "Play", `location.hash` holds `year=`, and the label reads "Leave the voyage?";
- step 5 settled;
- after step 6: the last recorded click `prevented` false, the label reads "Take this road", the press's `target` is "", and `location.pathname` is still "/reading-room/".

**Readings**, same probe and build, the ruled press staged:
- **Handler deleted** (`rv8c-mut-nohandler`), the mutation reading for the whole behaviour:
  - before step 4: playing true at year 233, so the witness holds;
  - the press hit `elementFromPoint`, on leg 0's row, inked;
  - after the first press: `prevented` false, playing true, Play reads "Pause", no `year=`, 0 asking;
  - it fails at step 4 on every clause.
- **The planned behaviour emulated in the page** (`rv8c-emulated`, a probe-injected listener, not the build's code):
  - after the first press: `prevented` true, playing false, Play reads "Play", `year=` in the hash, 1 asking, focus on the press;
  - after the second press: `prevented` false.
  - That is the fixture side of steps 3, 4 and 6.
- **Pause deleted, the question kept** (`rv8c-emulated-nopause`): after the first press, `prevented` true and 1 asking, but playing true, Play "Pause", no `year=`. It fails at step 4 on its pause clauses.
- **The bar moved with the wrapper absent** (`rv8c-bar`):
  - after the first press, focus is on the press and it asks;
  - after `setYear(min + 50)` the year moved from 232 to 281, focus is still on the press, and 1 press still asks.
  - That is step 5's mutation side: its settle would throw.
- **UNVERIFIABLE until built**: step 5's fixture side, the question closing as the bar moves. Only the change's `onAgesTold` wrapper drives it, and no probe can stage that without editing source. The stop conditions name its first run.
- **The probe's press rect** read 74 by 7 px, because the arrival unfurl was still running when it was measured. In the suite, RV8c runs after RV10, long after the unfurl. The hit test passed either way.

**Mutations**:
- `() => parkForRoad()` → `() => {}`: reds on playing false.
- `agesFor`'s wrapper → `onAgesTold: bar.onAgesTold`, unwrapped: step 5's settle throws inside the step and RV8c reds as "never reached its assertion". The bar move keeps focus on the press, so `focusout` cannot close the question in its place.

### What each step holds

`handbook/specs/settle-doctrine.md`, "What a step holds". Neither step is read by a later check: RV9 reads the state RV8b restores, and RV11 navigates first.

**RV8b**, one check, three claims, one room (seed 526413615):
1. Inbound road rows carry the press to the leg's pair, and the last entry none. This is held by T1 too, but only through a hand-made fixture. The room's real wiring (the frame forwarding, `roadHrefFor`, `sessionLog`'s legs) is held nowhere else.
2. Sea rows carry none. Held by T1.
3. An untold row's press stands pale and unfaded while its words fade, and is gold once told. This is CSS, held nowhere else.

That is two claims held nowhere else, on one room: **thin**.

**RV8c**, one check, three claims, one room:
1. The press pauses the real voyage through the Pause path and parks the address. Held nowhere else; T4 holds only that `park` is called.
2. The story moving on closes the question. Held nowhere else; T5's clause 6 holds only that `closeAsk` closes it.
3. A second press is not prevented. Held by T4.

That is two held nowhere else, on one room: **thin**.

## Order of commits

The branch is `feat/434-journal-road`.

1. `#434 Plan archived, and the journal's road press stubbed with its first failing test (T1)`: `handbook/plans/400/434/434-plan.md`, T1 red against the stub. Push.
2. `#434 A road leg's journal row carries Take this road to the host's address, and the last entry stands plain (T1, T2)`.
3. `#434 The press stands pale and says Not reached yet until its row is told, asks before it goes, and its question closes on any other action (T3 to T5)`.
4. `#434 The room hands the journal its road writer: roadHref through the frame, roadHrefFor beside the room's address (T6 to T8)`, with the `index.ts` and `voyage-session.ts` wiring.
5. `#434 Every road leg of the voyage draws in the Ribbon as the same pair (T9)`.
6. `#434 The press's gold dress, its pale wait and its spoken note in the journal's sheet`: the CSS.
7. `#434 RV8b and RV8c read the press in the room`.
8. `#434 The voice and the engine boundary name the journal's press`: the two spec edits.

A failing test is committed red only in commit 1. Each later commit carries its test and its code together, the red run first, as workflow step 8 says.

## Rosters and doctrine

- **Rosters joined**: none. The checks below were run to confirm it.
  - `git grep -n "full-log"` finds only its import, so a module under `e2e/suites/room-voyage-route/` joins no list.
  - No engine method is added, so `API` in `test-support/living-chart-hosts.ts` stands.
  - No test reads a source file, so `SOURCE_READS` stands.
  - `MEASURED_SECONDS` is not re-timed by a pull request (`handbook/specs/site-architecture.md`).
  - `recordingLogPanel` in `test-support/living-chart-hosts.ts` spreads `barlessLogPanel()`, so it gains `closeAsk` by itself.
- **Doctrine edited**: `handbook/specs/ui-design.md` "The voice" and `handbook/specs/explorer-doctrine.md` "The engine boundary", the wording above.
  - The voice line's "A road out of a room is two lines" was already contradicted by the place card's one-line "Take the road". The edit names both.
- **Doctrine checked and left**, each a line this change keeps true:
  - `handbook/specs/explorer-doctrine.md` "the room is the only writer of `year=N`, on park": the press parks through Pause.
  - "the engine adds document listeners of its own only while a place card is shown": the press binds only on itself.
  - `handbook/specs/region-and-voyage.md`'s positional reveal.
  - `handbook/specs/engine-invariants.md`'s "any surface offering the road from X owes a check that X has a road": the leg's road mode is that check, and T9 holds it to the Ribbon.
  - The "Do not fix it" note in `src/site/shared/reading-frame/dated-log.ts`: untouched.

## Evidence

**Unit**:
```
npm test -- test/site/reading-frame-log.test.ts test/site/reading-frame.test.ts test/site/reading-room-address.test.ts test/site/ribbon-job.test.ts test/site/living-chart-no-bar.test.ts test/site/living-chart-boundary.test.ts test/site/ages-told-signal.test.ts test/repo/constant-contracts.test.ts test/site/voyage-session-mount.test.ts test/site/voyage-tour-order.test.ts
```
Then `npm test`, then `npm run astro:generate`.

**T9's cost**: the `duration_ms` of its own `ok` line in `npm test -- test/site/ribbon-job.test.ts`, quoted in the PR body.

**The rest**: `npm run check`, `npm run lint`, `npm run format:check`.

**Browser**, after `npm run build`, one suite at a time:
- `VELLUM_E2E_SUITES=room-voyage-route npm run test:e2e`, the suite this change touches.
- Then the suites whose checks read journal rows, each alone, to show nothing there moved:
  - `VELLUM_E2E_SUITES=reading-room` (RR30, RR39);
  - `VELLUM_E2E_SUITES=room-voyage` (RW2);
  - `VELLUM_E2E_SUITES=room-instrument` (RS15, RS16);
  - `VELLUM_E2E_SUITES=room-address`.

**Steps' seconds**: RV8b's and RV8c's seconds, read from the pull request's own CI run of the lane holding `room-voyage-route`, as "What a step costs" says. Each step is timed from the result line before it to its own. One run each, since both are thin: under 4 s passes.

**Plate reader**: `vellum-plate-reader` is owed at step 11. The ruling is made from step 6's stills, so the build is measured against them: the gold dress and its pale wait at 1024 by 768 and 1440 by 900, at the states the stills showed:
- mid-voyage, the pale press beside a gold one;
- asking;
- at rest;
- hover, on a gold and on a pale press.

It measures the contrast of both faces (8.62:1 gold and 9.79:1 pale in the stills), that every untold SEA row still reads today's fade (C17), and the slip's height against the control.

It also reads each press's accessible name from CDP's accessibility tree (`Accessibility.getPartialAXTree`). That must be "Take this road Not reached yet" on a pale row and "Take this road" on a told one. This is the one place the spoken note is read as a screen reader gets it; T3 holds only the script's toggling.

## Calls made

Each is one the issue did not rule on, with the rule it was taken on. The implementer copies them into its step 12 comment.

- **C1.** The hook is `roadHref(seed, fromIdx, toIdx) => string` on `ScrubberRefs`, not `LivingChartHost`.
  - Ruling B: an optional callback returning a string, as `ribbonHref` does.
  - It sits on the scrubber because only a scrubber host has a journal, which makes the wrong state unrepresentable (`handbook/specs/check-placement.md`, the type checker).
  - It takes the seed so the room's address binds to the world the engine armed, the lockstep rule (`handbook/specs/explorer-doctrine.md`) and `prospectHrefFor(forSeed, ...)`'s precedent.
- **C2.** The engine builds the press and its behaviour, and pauses through a late-bound closure that calls the Pause press's own path (`togglePlay` while playing).
  - Ruling B.
  - The late-bound coupling `createLivingChart` already uses.
  - Ruling A's "Pause" is the reader's Pause, which parks and writes the address (`handbook/specs/explorer-doctrine.md`, "the room is the only writer of `year=N`, on park").
- **C3.** The press is an `<a href>` with no `target`. The first press prevents its default and the second lets it through.
  - Every way into the Ribbon in the house is an anchor, and ruling A says "same tab".
  - Consequence: a middle-click opens the Ribbon in a new tab with no pause and no question, which is the browser's own gesture. A modified click takes the same two presses.
- **C4.** The press rides inside the row's `.cr-text`, after its words (in a `.cr-prose` span) and a space.
  - That is the structure the ruled still was drawn from.
  - The prose span is what lets the words fade while the press does not.
  - `git grep` over `e2e/` and `test/` finds no read of a road row's `.cr-text` text: RV9 reads row 0, RR30 the annal rows, and `test/site/reading-frame-log.test.ts` rows 0 and 1.
- **C5.** Row r holds leg r−1, from the plan's own legs, which `sessionLog` passes. The rule is `handbook/specs/region-and-voyage.md`'s positional reveal, and the recon's item 2.
- **C6.** The press refuses in script on an untold row: it goes nowhere, pauses nothing, and closes any other question (C23). With M2 the pale press is visible, focusable and pressable, so the script is what holds ruling A's "active only once".
  - T3 holds the script.
  - RV8b holds the pale sheet.
- **C7.** The writer is `roadHrefFor` in `src/site/reading-room/address.ts`.
  - Ruling C: a small new writer in the room.
  - `app.ts` stands at 388 lines.
  - The room's address module is where its address grammar lives.
- **C8.** The writer carries `style`. Ruling C drops only theme, legend, arms, beasts and the live key; `prospectHrefFor` carries style, and `parseRibbonAddress` reads it.
- **C9**, narrowed by the spoken-note ruling, which overrules its first half. No live region, and nothing beyond the visible label and the ruled note "Not reached yet". This is the Play press's precedent: "The label swap IS the state for AT" (`setPlayLabel` in `src/site/shared/living-chart/ages.ts`).
- **C10.** The labels are exactly "Take this road" and "Leave the voyage?". In comment 6643975537 the full stop after "Take this road" ends the sentence; the option Alex chose reads "Take this road (Recommended)".
- **C11.** The asking state wears the resting state's dress, and only its label changes. This is Play's label-swap precedent. The stills show it (M1).
- **C12.** RV8b and RV8c each run in a `step`, and RV8b sits after RV8, because it reads RV7's state as RV8 does. RV8c sits before RV11, because it sets its own state and RV11 navigates away.
  - `vellum-footguns` Gate 2 item 6: the throw belongs inside a step.
  - `handbook/specs/settle-doctrine.md` clause 11: a check sets the state it reads.
- **C13.** T9's seeds are 1, 2, 5, 42 and 526413615. Each holds road legs, four carry the witness, 526413615 is RV's world and 42 the house fixture. They are measured at 0.73 to 0.78 s a world, so the five come to about 3.8 s, ruling D's "about 4 seconds". T9 reads the engine's own session, not a re-derived plan: a reference that went through a transform shares the defect's oracle (`vellum-footguns` Gate 1 item 19).
- **C14.** T9 lives in `test/site/ribbon-job.test.ts`, the Ribbon job's contract with what asks it. The press tests extend `test/site/reading-frame-log.test.ts`, the journal rows' own file. No new unit test file is made.
- **C15.** The press's class is `cr-road`, dressed in `src/styles/shared/reading-frame.css` beside the row rules. `isHook` in `scripts/lint/sheet-owners.ts` does not claim the `cr-` row classes, and the row's dress lives in that sheet.
- **C16.** What Back returns to: the measurement, not a design.
  - Measured with `out/434-dry-run/434-probe.ts back` (`434-probe-back.log`). The room was parked at year 246, left for `/ribbon/#seed=526413615&style=antique&a=0&b=1`, and stepped back. It came back from the browser's page cache: `pageshow` persisted `true`, the window's marker kept, paused at 246, Play reading "Play".
  - So the question closes as the reader leaves (T4).
  - Where a browser does not keep the page, it reboots from the address the pause wrote. In the survey chamber that is `survey`, which rests at the survey's end. In the ages chamber it is `year=N`.
  - Whether Safari and Firefox keep this page is UNVERIFIABLE here.
- **C17.** Today's fade stays on every untold row that carries no press: the sea rows, the departure, the last entry. Only a row with a press is lifted, and its day and words take the fade.
  - The ruled still `434-gold-dim-midvoyage-1024-slipcrop.png` shows untold SEA rows unfaded. That was a defect of the spike, which lifted every untold row.
  - At a STOP sitting the ruling's words carry it alone (`handbook/specs/conventions.md`, "A sitting held at the workflow's STOP is not a round"). The words Alex ruled on said the row's words keep today's fade.
  - The PR body names this as a deviation from the still, with this reason.
- **C18.** A road row keeps today's 0.18 s ink-in. Its row no longer fades, so its day and words fade in on their own spans, and its 2 px slide still eases (RS15). Motion is ruled like the rest (`handbook/specs/ui-design.md`, "Motion and ceremony"), and no ruling changed it. RV8b finishes the row animations before it reads, so the kept fade costs the check nothing (readings retaken with the rule in the injected style).
- **C19.** A pale press carries `aria-disabled="true"`, and `"false"` once told, written by the script beside the note. This is the house's refusing press: pressable, never `disabled`, heard as unavailable (`handbook/specs/explorer-doctrine.md`, the hold's `aria-disabled`; `src/site/explorer/land-seat.ts`).
- **C20.** The spoken note is a span inside the link, hidden from sight, so the press's name reads "Take this road Not reached yet" while pale. It is not `aria-description`, which MDN gives as an ARIA 1.3 editor's draft, recommending `aria-describedby` meanwhile. It is not `aria-describedby` either, which needs an id the engine would mint in the host's namespace (`handbook/specs/explorer-doctrine.md`, "IDS ARE THE HOST'S NAMESPACE"). The single space between label and note is a separator, not wording. On a told row the note's `hidden` takes it out of the name.
- **C21.** The label sits in its own span, so "Leave the voyage?" replaces the label and never the note.
- **C22.** The last entry is left plain by the panel (`rowLeg`), not by `sessionLog` dropping the closing leg. "No button on the last entry" is a rule of the journal, and T1 pins it with a homecoming whose leg is a road.
- **C23.** Pressing a pale press closes another row's question, beside refusing. M4's "resets on any other action"; T5's clause 4 pins it.

## Open decisions

none.

The STOP menu was ruled by comments 6645742777 and 6645788043, recorded under **Rulings** at the top.
- M1 chose the gold pill on its own line.
- M2 chose shown pale from the start, with the spoken note "Not reached yet".
- M3 chose no press on the last entry.
- M4 chose resets on any other action.
- M5 chose `e2e/suites/room-voyage-route/road-press.ts`.

The stills they were ruled from are in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-af0c7ce74ae7f693c/out/434/`, whose page is `out/434/index.html`. C17 names the one place the build departs from them.

## Stop conditions

Hand back, rather than adapt, on any of these:

- **A planned file has moved.** `git diff --stat 7200fdbb origin/main -- src/site/shared/living-chart/ src/site/shared/reading-frame/index.ts src/site/reading-room/ src/styles/shared/reading-frame.css test/site/reading-frame-log.test.ts test/site/reading-frame.test.ts test/site/reading-room-address.test.ts test/site/ribbon-job.test.ts e2e/suites/room-voyage-route.ts e2e/suites/room-voyage-route/` prints any line.
- **`app.ts` is over the limit.** After `npm run format`, `src/site/reading-room/app.ts` exceeds `max-lines` (400, skipping blanks and comments), or any function this plan names exceeds 50 lines.
- **A row is not where the plan puts it.** `sessionLog`'s `plan.legs.length` differs from `routed.length`, or from the row count less one on a world with a homecoming. T1's fixture is hand-made, so RV8b's first run is where this shows: rows ≠ legs + 1.
- **T9 is too slow or wrong.**
  - Its `duration_ms` is over 8000 locally, twice ruling D's "about 4 seconds", which goes back to Alex.
  - Or any fixture seed shows a road leg the Ribbon draws as another pair, or refuses.
  - The measurement says 0, so either means the premise of D moved.
- **A mutation does not bite.** M9b stays green, so the witness is not where it was measured.
- **The pause does not stay paused.** `togglePlay`'s pause path paints the instrument (an `onAgesTold` firing between the first press and its relabel), so the question closes as it opens. T5's clause 6 would pass and RV8c's step 4 red on the label.
- **RV8c's step 5 goes wrong** on the first build that holds the wrapper.
  - Its settle does not settle: the bar's paint did not reach the wrapper. This is the reading printed UNVERIFIABLE above.
  - Or its witness fails: focus is not on the press after a real press, though `434-ruled-rv8c-bar.log` read it there.
- **RV8b's pale half reads otherwise.** On its first run:
  - an untold press reads other than the cream ground, or its row other than opacity 1, or its words other than 0.4;
  - or no press stands on an untold row at stepTo(0).
- **Another check reds.** Any check outside `room-voyage-route` reds in the four journal-reading suites named under Evidence. A row's text or height moved somewhere the grep did not find.
- **A step is too slow.** RV8b or RV8c reads over 4 seconds on CI, which takes two more runs, or over 20, which is too slow (`handbook/specs/settle-doctrine.md`). Reworking a step is a design call.
- **The ruled dress reads under the floor.** The plate reader at step 11 measures the gold or the pale face under 4.5:1 in any state the stills measured above it.
- **A sea row moved.** It measures any untold sea row reading other than today's fade.
- **The spoken note is not what a screen reader gets.** It reads a pale press's accessible name without "Not reached yet", or a told press's with it.
- **A grep missed a reader.** Any check or test reads a road row's `.cr-text` text, or its `.cr-year` opacity, where the grep under C4 found none.
