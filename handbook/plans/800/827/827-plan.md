# Issue #827 plan: the pages' remaining glue becomes components

**Planned at:** `origin/main` `ed41e29b` (PR #911), Issue #827 read with 1 comment (the rulings, comment 6253738018); re-recorded at the fold, 2026-10-18.

**Rulings:** Alex, 2026-10-18, relayed in https://github.com/ahl-gram/Vellum/issues/827#issuecomment-6253738018: (1) Parts A, B and C are built, and the whole-page layout is not; (2) the placement rule is written into the site spec (commit 5); (3) this pull request closes Issue #827, and the bundle-tag idea is recorded as a follow-up on Issue #600 (Step 12 records, below); (4) Today's status line, which has no live region, is filed as an issue of its own by the dispatcher and stays exactly as it is here. That comment is also the issue's re-baseline: the body's start gate ("not before Issue #779 part 2 closes") is met, since Issue #779 closed on 2026-10-13.

**Open decisions:** none.

**Branch:** `chore/827-kit-glue`. **One pull request**, whose closing line is `Closes #827`.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/site-architecture.md`: "How a page is authored" (the rosters bullet this plan edits, and the bullet it adds); "What the build does to authored markup, and what that costs a test" (a markup lift into components cannot be pinned byte-identical; pin the rendered shapes; the escaping rule is about expressions); "The two contractual forms" (the bundle tag's `is:inline`, which this plan does not touch).
- `handbook/specs/check-placement.md`: "The unit suite" (a test may read a built page as data; no test reads a page's source).
- `handbook/specs/rulebook.md`: the accepted skips list (`max-lines` at the head of `test/site/astro-scaffold.test.ts`) and the `eslint-suppressions.json` paragraph under it (no listed overrun may grow).
- `handbook/specs/conventions.md`: "Where a rule lives" (the routing rule, for the added spec bullet), "How a spec, and the rest of the house's prose, is written", "How code is cited".
- `handbook/specs/ui-design.md`, the room furniture paragraph that names "the legend row" (read only: the name the component takes).

## The design

Three pieces of markup that eight chart rooms repeat by hand become components under `src/layouts/`, beside the Atelier Kit's. **Nothing a reader sees changes**: every built page differs from main only in whitespace between tags, measured below, and every class, id, attribute, word and element order stays exactly as it is, since `src/styles/shared/atelier.css`, `src/site/shared/room-seats.ts`, the page scripts and the e2e suites read them.

### Part A: the legend row becomes `LegendRow`

Every `<nav class="legend">` on the site (eight pages: the Explorer, the Portfolio, the Print Room, the Prospect, the Ribbon, Today, the Gallery, the Specimen) is the same nest, `nav.legend > p.legend-head + div.legend-row`, with two variants: the Explorer's head carries an id that names its row as a group, and the Print Room's row is a group named by its own label, with a note before the row and a status line after it. `src/layouts/LegendRow.astro` renders the nest and takes:

- `label` (the nav's `aria-label`), a prop;
- `headId` (the head's id), an optional prop; when given and `rowLabel` is not, the row is `role="group" aria-labelledby={headId}`;
- `rowLabel`, an optional prop; when given, the row is `role="group" aria-label={rowLabel}`;
- the head's contents in the named slot `head`, the Print Room's note in the named slot `note`, the Print Room's status line in the named slot `status`, and the row's contents (the `LegendButton`s and the pages' own presses) in the default slot.

The head is a slot and not a prop because the Print Room's head carries a `<select>`, which no string prop can, and one way serves all eight; a slot also hands the three heads that carry `&middot;` through as written (`handbook/specs/site-architecture.md`, the escaping rule). Each page keeps every word it has today.

### Part B: the stage's notices become `StageNotices`

Eight pages end their stage with up to three notices: the status pill (`<p class="status" id=... role="status" aria-live="polite">`), the render-worker warning (`<p id=... class="warning" hidden>`), and the scripts-off notice (`<noscript><p class="status">...</p></noscript>`), in that order and last in the stage. `src/layouts/StageNotices.astro` renders whichever a page asks for, and takes:

- `pillId` and `warningId`, optional props: the ids the page's script reads;
- the pill's text in the named slot `pill` (only the Specimen has one), the warning's sentence in the named slot `warning`, and the scripts-off sentence in the named slot `noscript`; the noscript notice renders when that slot is filled.

It is a component of its own rather than props on `ChartStage`, so the Explorer, the Reading Room and Today, whose stages are their own (`ChartStage`'s header comment), wear it too: the five `ChartStage` rooms put it in the stage's `after` slot, the other three put it where their notices stand today. **Today keeps its own pill and wears the component for its scripts-off notice alone**: its pill carries no live region and opens on a line of its own ("Drafting today's world"), so wearing the kit's pill would change what a screen reader announces there, a reader-visible change the issue rules out; its scripts-off notice is the kit's shape, and stands straight after that pill.

### Part C: the folio writes the world's name itself

Every `ChartFolio` call opens with the pair `["folio-title", "folio-title"]`, and the kit test and RH32 both hold that the folio leads with it. `src/layouts/ChartFolio.astro` writes that line itself, and `lines` becomes the lines under it. The second pair is not made a default, because the Print Room's second line is its plate line (`["folio-sub plate-line", "pr-plate-line"]`). The title's `<p>` sits on the same line as the `lines.map(...)` expression, which keeps the built folio byte-identical (measured). With a line break between them, which the probe built first, the folio gains a newline between its first two lines, and the kit test's folio pattern, `/^(<p class="[\w -]+" id="[\w-]+"><\/p>)+$/` over the trimmed folio, admits no whitespace between lines.

### Rejected

- **A `head` prop on `LegendRow`.** The Print Room's head holds a `<select>`; two ways of passing a head would be two shapes.
- **Leaving the Explorer and the Print Room out of `LegendRow`.** That keeps two shapes of the same nav, the thing the issue exists to end; their variants cost two optional props and two slots.
- **Unifying the legend rows' words** (the issue's "the label in one place"). Seven of eight differ (recon), and changing one is a reader-visible change the issue rules out.
- **Notices as props on `ChartStage`.** It serves five rooms and leaves the Explorer's, the Reading Room's and Today's notices hand-written.
- **The warning's shared opening clause in the component** ("Your browser could not start the render worker, so"). It splits one sentence across two files, so neither file reads or greps whole.
- **Today's pill in `StageNotices`**: above. Its scripts-off notice does join.
- **A default for the folio's second line**: above.
- **A component for the bundle script tag** (the issue's item 4, second bullet). Its form is Issue #600's to rule (Alex, Issue #779 comments 6091335054 and 6133488428, recon), so a component now would bake in a form that pull request may change; ruling 3 records it on Issue #600 instead.
- **A chart-room layout over `BaseLayout`** (the issue's candidate 3). Ruled out (ruling 1): it would hold the order for five rooms while the Explorer, the Reading Room and Today keep their own, it reverses the placement rule ruling 2 writes down, and it would carry the bundle tag Issue #600 is still to rule. A probe of it on the Prospect measured whitespace-only differences and the page going from 71 lines to 51.
- **A live region on Today's status line.** Filed as an issue of its own by the dispatcher (ruling 4); this plan leaves the line exactly as it is.
- **Growing the existing kit test** ("the kit's lifted shapes render one shape ...", `test/site/astro-scaffold.test.ts`). It is already over `max-lines-per-function` and suppressed (`eslint-suppressions.json` counts 2 for the file), so its growth is invisible to the guard; the new pins are three tests of their own, each under the cap.
- **A test file of its own for the pins.** It would need its own build and race `test/site/astro-scaffold.test.ts` on the generated folder under `node --test`'s parallel files, which is the reason the rulebook accepts that file's `max-lines` skip.
- **A lint rule refusing a hand-written `<nav class="legend">`**, or a unit test reading page source: the lint does not read `.astro` files, and `check-placement.md` forbids a source read; the built pages are what the pins read.
- **New browser checks.** The e2e suites already read these pieces room by room (PR36, the Prospect's and the Ribbon's room checks, the Broadside's legend read, RH25, RH32, the Gallery's read, the Portfolio's fallback read), and the shape is markup, which the unit suite reads from the build.

## Files

Created:

- `handbook/plans/827/827-plan.md`: this plan, unchanged (workflow step 8).
- `src/layouts/LegendRow.astro`, exactly:

```astro
---
// The legend row at the chart's foot (Issue #462 chart-room ruling 4; the Atelier Kit, Issue #487; Issue #827): the nav the page names, its head, and the row its roads out and presses stand in, a group named by rowLabel or else by the head when the head has an id; the page writes the words and the order, the component keeps the shape.
interface Props {
  label: string;
  headId?: string;
  rowLabel?: string;
}
const { label, headId, rowLabel } = Astro.props;
const group = headId !== undefined || rowLabel !== undefined;
---
<nav class="legend" aria-label={label}>
  <p class="legend-head" id={headId}><slot name="head" /></p>
  <slot name="note" />
  <div class="legend-row" role={group ? "group" : undefined} aria-label={rowLabel} aria-labelledby={rowLabel === undefined ? headId : undefined}><slot /></div>
  <slot name="status" />
</nav>
```

- `src/layouts/StageNotices.astro`, exactly:

```astro
---
// The stage's notices, last in the stage (Issue #827): the live status pill, the render-worker warning that stays hidden until the worker fails, and the scripts-off notice; the page passes the ids its script reads and writes its own sentences.
interface Props {
  pillId?: string;
  warningId?: string;
}
const { pillId, warningId } = Astro.props;
---
{pillId && <p class="status" id={pillId} role="status" aria-live="polite"><slot name="pill" /></p>}
{warningId && <p id={warningId} class="warning" hidden><slot name="warning" /></p>}
{Astro.slots.has("noscript") && <noscript>
  <p class="status"><slot name="noscript" /></p>
</noscript>}
```

Edited:

- `src/layouts/ChartFolio.astro`, the whole file after the edit:

```astro
---
// The chart's folio, lower left (the mockup; the Atelier Kit, #487): the world's name, then the lines a room's script fills at the draw.
interface Props {
  lines: ReadonlyArray<readonly [cls: string, id: string]>;
}
const { lines } = Astro.props;
---
<div class="chrome corner bl folio">
  <p class="folio-title" id="folio-title"></p>{lines.map(([cls, id]) => <p class={cls} id={id}></p>)}
</div>
```

- The nine pages, block by block, in "Page edits" below: `src/pages/explorer/index.astro`, `src/pages/explorer/portfolio/index.astro`, `src/pages/gallery/index.astro`, `src/pages/print-room/index.astro`, `src/pages/prospect/index.astro`, `src/pages/reading-room/index.astro`, `src/pages/ribbon/index.astro`, `src/pages/seed-of-the-day/index.astro`, `src/pages/specimen/index.astro`. The largest after the edit is the Explorer at 162 lines.
- `test/site/astro-scaffold.test.ts`: three tests and their rosters, in "Tests" below. The file keeps its accepted `max-lines` skip; no function in it grows, and each new test function is under 50 lines.
- `handbook/specs/site-architecture.md`: two edits, in "Rosters and doctrine" below.

Nothing is deleted. No `.ts` source under `src/`, no stylesheet, no script and no e2e file changes.

### Page edits

Each edit replaces one block, which appears exactly once in its page, with the block given; whitespace inside the blocks is exactly as shown. Import lines: in each page that gains `LegendRow`, add `import LegendRow from "<prefix>/layouts/LegendRow.astro";` on the line directly after its `import LegendButton from "<prefix>/layouts/LegendButton.astro";`, with the same `<prefix>` (`../..` everywhere but the Portfolio, `../../..` there). In each page that gains `StageNotices`, add `import StageNotices from "<prefix>/layouts/StageNotices.astro";` on the line directly after its `import Glass from "<prefix>/layouts/Glass.astro";`.

**Part A, commit 2.** The Prospect, `src/pages/prospect/index.astro`:

```astro
<nav class="legend" aria-label="The roads out">
  <p class="legend-head">The roads out</p>
  <div class="legend-row">
    <LegendButton id="pp-chart-link" gold href="/explorer/" verb="Return to" room="The Explorer" />
    <LegendButton id="pp-ribbon-link" href="/ribbon/" verbId="pp-ribbon-verb" verb="Take the road from here in" room="The Wayfarer's Ribbon" />
  </div>
</nav>
```

becomes

```astro
<LegendRow label="The roads out">
  <Fragment slot="head">The roads out</Fragment>
  <LegendButton id="pp-chart-link" gold href="/explorer/" verb="Return to" room="The Explorer" />
  <LegendButton id="pp-ribbon-link" href="/ribbon/" verbId="pp-ribbon-verb" verb="Take the road from here in" room="The Wayfarer's Ribbon" />
</LegendRow>
```

The Ribbon, `src/pages/ribbon/index.astro`:

```astro
<nav class="legend" aria-label="The roads out">
  <p class="legend-head">The roads out</p>
  <div class="legend-row">
    <LegendButton id="rb-chart-link" gold href="/explorer/" verb="Return to" room="The Explorer" />
    <LegendButton id="rb-prospect-link" href="/prospect/" verbId="rb-prospect-verb" verb="See the road's end in" room="The Prospect" />
  </div>
</nav>
```

becomes

```astro
<LegendRow label="The roads out">
  <Fragment slot="head">The roads out</Fragment>
  <LegendButton id="rb-chart-link" gold href="/explorer/" verb="Return to" room="The Explorer" />
  <LegendButton id="rb-prospect-link" href="/prospect/" verbId="rb-prospect-verb" verb="See the road's end in" room="The Prospect" />
</LegendRow>
```

The Specimen, `src/pages/specimen/index.astro`:

```astro
<nav class="legend" aria-label="The roads out">
  <p class="legend-head">the legend row: a road, the featured road, a press</p>
  <div class="legend-row">
    <LegendButton href="/explorer/" verb="A road to" room="The Explorer" />
    <LegendButton gold href="/gallery/" verb="The featured road to" room="The Gallery" />
    <button class="legend-btn" type="button" disabled><span class="verb">a press, disabled</span><span class="room">A Plate</span></button>
  </div>
</nav>
```

becomes

```astro
<LegendRow label="The roads out">
  <Fragment slot="head">the legend row: a road, the featured road, a press</Fragment>
  <LegendButton href="/explorer/" verb="A road to" room="The Explorer" />
  <LegendButton gold href="/gallery/" verb="The featured road to" room="The Gallery" />
  <button class="legend-btn" type="button" disabled><span class="verb">a press, disabled</span><span class="room">A Plate</span></button>
</LegendRow>
```

Today, `src/pages/seed-of-the-day/index.astro`:

```astro
<nav class="legend" aria-label="Today's roads out">
  <p class="legend-head">Same day, same world, everywhere &middot; come back tomorrow for a new one</p>
  <div class="legend-row">
    {roads.map((r) => <LegendButton road={r.road} href={r.href} verb={r.verb} room={r.room} />)}
  </div>
</nav>
```

becomes

```astro
<LegendRow label="Today's roads out">
  <Fragment slot="head">Same day, same world, everywhere &middot; come back tomorrow for a new one</Fragment>
  {roads.map((r) => <LegendButton road={r.road} href={r.href} verb={r.verb} room={r.room} />)}
</LegendRow>
```

The Gallery, `src/pages/gallery/index.astro`:

```astro
<nav class="legend" slot="desk" aria-label="The road out">
  <p class="legend-head">every plate is a road into its own world</p>
  <div class="legend-row">
    <LegendButton gold href="/explorer/" verb="Return to" room="The Explorer" />
  </div>
</nav>
```

becomes

```astro
<LegendRow slot="desk" label="The road out">
  <Fragment slot="head">every plate is a road into its own world</Fragment>
  <LegendButton gold href="/explorer/" verb="Return to" room="The Explorer" />
</LegendRow>
```

The Portfolio, `src/pages/explorer/portfolio/index.astro`:

```astro
<nav class="legend" aria-label="This sheet">
  <p class="legend-head">This sheet &middot; what it can do next</p>
  <div class="legend-row">
    <button id="pf-download" class="legend-btn gold" type="button"><span class="verb">Download</span><span class="room">The Engraving</span></button>
    <button id="pf-next" class="legend-btn" type="button"><span class="verb">Bring up</span><span class="room">The Next Sheet</span></button>
    <LegendButton id="pf-explorer" gold href="../" verb="Back to" room="The Explorer" />
  </div>
</nav>
```

becomes

```astro
<LegendRow label="This sheet">
  <Fragment slot="head">This sheet &middot; what it can do next</Fragment>
  <button id="pf-download" class="legend-btn gold" type="button"><span class="verb">Download</span><span class="room">The Engraving</span></button>
  <button id="pf-next" class="legend-btn" type="button"><span class="verb">Bring up</span><span class="room">The Next Sheet</span></button>
  <LegendButton id="pf-explorer" gold href="../" verb="Back to" room="The Explorer" />
</LegendRow>
```

The Explorer, `src/pages/explorer/index.astro` (the HTML comment on the line above the nav stays where it is):

```astro
<nav class="legend" aria-label="The Press">
  <p class="legend-head" id="grp-press">The Press &middot; what the sheet can do next</p>
  <div class="legend-row" role="group" aria-labelledby="grp-press">
    <button id="verso-turn" class="legend-btn" type="button"><span class="verb">Turn</span><span class="room">The Sheet</span></button><a class="fn" href="/glossary/#verso" data-note="note-verso" aria-describedby="note-verso" aria-label="note on the verso">&sect;</a>
    <LegendButton id="order-plates" gold href="../print-room/" verb="Take to" room="The Print Room" />
    <LegendButton id="journal-link" gold href="/reading-room/" verb="Read the journal in" room="The Reading Room" />
  </div>
</nav>
```

becomes

```astro
<LegendRow label="The Press" headId="grp-press">
  <Fragment slot="head">The Press &middot; what the sheet can do next</Fragment>
  <button id="verso-turn" class="legend-btn" type="button"><span class="verb">Turn</span><span class="room">The Sheet</span></button><a class="fn" href="/glossary/#verso" data-note="note-verso" aria-describedby="note-verso" aria-label="note on the verso">&sect;</a>
  <LegendButton id="order-plates" gold href="../print-room/" verb="Take to" room="The Print Room" />
  <LegendButton id="journal-link" gold href="/reading-room/" verb="Read the journal in" room="The Reading Room" />
</LegendRow>
```

The Print Room, `src/pages/print-room/index.astro`:

```astro
<nav class="legend" aria-label="A poster plate">
  <p class="legend-head"><span class="pressed">A poster plate, pressed as
    <select id="pr-format" aria-label="Pressed as">
      <option value="svg" selected>The engraving itself (SVG)</option>
      <option value="png1">An impression (PNG)</option>
      <option value="png2">A finer impression (PNG &times;2)</option>
    </select></span></p>
  <p class="legend-note">The engraving is exact at any size; an impression is pressed with your
  device's fonts, and a large one is fitted to what your browser can hold.
  The chart is pulled only as the engraving.</p>
  <div class="legend-row" role="group" aria-label="A poster plate">
    <button class="legend-btn" type="button" data-poster="chart" disabled><span class="verb dim">1500 px</span><span class="room">Chart</span></button>
    <button class="legend-btn" type="button" data-poster="desk" disabled><span class="verb dim">2400 px</span><span class="room">Desk</span></button>
    <button class="legend-btn" type="button" data-poster="wall" disabled><span class="verb dim">3300 px</span><span class="room">Wall</span></button>
    <button class="legend-btn" type="button" data-poster="grand" disabled><span class="verb dim">4200 px</span><span class="room">Grand</span></button>
    <LegendButton id="pr-explorer" gold href="../explorer/" verb="Back to" room="The Explorer" />
  </div>
  <p class="legend-status" id="pr-poster-status" role="status" aria-live="polite"></p>
</nav>
```

becomes

```astro
<LegendRow label="A poster plate" rowLabel="A poster plate">
  <Fragment slot="head"><span class="pressed">A poster plate, pressed as
    <select id="pr-format" aria-label="Pressed as">
      <option value="svg" selected>The engraving itself (SVG)</option>
      <option value="png1">An impression (PNG)</option>
      <option value="png2">A finer impression (PNG &times;2)</option>
    </select></span></Fragment>
  <p class="legend-note" slot="note">The engraving is exact at any size; an impression is pressed with your
  device's fonts, and a large one is fitted to what your browser can hold.
  The chart is pulled only as the engraving.</p>
  <button class="legend-btn" type="button" data-poster="chart" disabled><span class="verb dim">1500 px</span><span class="room">Chart</span></button>
  <button class="legend-btn" type="button" data-poster="desk" disabled><span class="verb dim">2400 px</span><span class="room">Desk</span></button>
  <button class="legend-btn" type="button" data-poster="wall" disabled><span class="verb dim">3300 px</span><span class="room">Wall</span></button>
  <button class="legend-btn" type="button" data-poster="grand" disabled><span class="verb dim">4200 px</span><span class="room">Grand</span></button>
  <LegendButton id="pr-explorer" gold href="../explorer/" verb="Back to" room="The Explorer" />
  <p class="legend-status" id="pr-poster-status" role="status" aria-live="polite" slot="status"></p>
</LegendRow>
```

**Part B, commit 3.** The Print Room:

```astro
  <Fragment slot="after">
    <p class="status" id="pr-status" role="status" aria-live="polite"></p>
    <p id="pr-warning" class="warning" hidden>Your browser could not start the render
    worker, so proofs are drawn on the main thread. A large plate may pause the page for
    a moment.</p>
    <noscript>
      <p class="status">Every proof is pulled in your browser, so the Print Room needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</p>
    </noscript>
  </Fragment>
```

becomes

```astro
  <StageNotices slot="after" pillId="pr-status" warningId="pr-warning">
    <Fragment slot="warning">Your browser could not start the render
    worker, so proofs are drawn on the main thread. A large plate may pause the page for
    a moment.</Fragment>
    <Fragment slot="noscript">Every proof is pulled in your browser, so the Print Room needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</Fragment>
  </StageNotices>
```

The Prospect:

```astro
  <Fragment slot="after">
    <p class="status" id="pp-status" role="status" aria-live="polite"></p>
    <p id="pp-warning" class="warning" hidden>Your browser could not start the render worker,
    so the plate is engraved on the main thread. It may pause the page for a moment.</p>
    <noscript>
      <p class="status">Every plate is engraved in your browser, so the Prospect needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</p>
    </noscript>
  </Fragment>
```

becomes

```astro
  <StageNotices slot="after" pillId="pp-status" warningId="pp-warning">
    <Fragment slot="warning">Your browser could not start the render worker,
    so the plate is engraved on the main thread. It may pause the page for a moment.</Fragment>
    <Fragment slot="noscript">Every plate is engraved in your browser, so the Prospect needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</Fragment>
  </StageNotices>
```

The Ribbon:

```astro
  <Fragment slot="after">
    <p class="status" id="rb-status" role="status" aria-live="polite"></p>
    <p id="rb-warning" class="warning" hidden>Your browser could not start the render worker,
    so the scroll is drawn on the main thread. It may pause the page for a moment.</p>
    <noscript>
      <p class="status">Every scroll is unrolled in your browser, so the Ribbon needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</p>
    </noscript>
  </Fragment>
```

becomes

```astro
  <StageNotices slot="after" pillId="rb-status" warningId="rb-warning">
    <Fragment slot="warning">Your browser could not start the render worker,
    so the scroll is drawn on the main thread. It may pause the page for a moment.</Fragment>
    <Fragment slot="noscript">Every scroll is unrolled in your browser, so the Ribbon needs
      JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</Fragment>
  </StageNotices>
```

The Portfolio:

```astro
  <Fragment slot="after">
    <p class="status" id="pf-status" role="status" aria-live="polite"></p>
    <p id="pf-warning" class="warning" hidden>Your browser could not start the render
    worker, so the sheets are drafted on the main thread. A gathering may pause the page
    for a moment.</p>
    <noscript>
      <p class="status">Every sheet here is drafted in your browser from the number in its
      margin, so the Portfolio needs JavaScript. The sheets were gathered in the
      <a href="../">Explorer</a>.</p>
    </noscript>
  </Fragment>
```

becomes

```astro
  <StageNotices slot="after" pillId="pf-status" warningId="pf-warning">
    <Fragment slot="warning">Your browser could not start the render
    worker, so the sheets are drafted on the main thread. A gathering may pause the page
    for a moment.</Fragment>
    <Fragment slot="noscript">Every sheet here is drafted in your browser from the number in its
      margin, so the Portfolio needs JavaScript. The sheets were gathered in the
      <a href="../">Explorer</a>.</Fragment>
  </StageNotices>
```

The Specimen:

```astro
  <Fragment slot="after">
    <p class="status" id="sb-status" role="status" aria-live="polite">the status pill, as a room reports a draw</p>
    <noscript>
      <p class="status">The Specimen Book fits its sheet and binds its slip in your browser, so its
      states need JavaScript; the dress stands without it.</p>
    </noscript>
  </Fragment>
```

becomes

```astro
  <StageNotices slot="after" pillId="sb-status">
    <Fragment slot="pill">the status pill, as a room reports a draw</Fragment>
    <Fragment slot="noscript">The Specimen Book fits its sheet and binds its slip in your browser, so its
      states need JavaScript; the dress stands without it.</Fragment>
  </StageNotices>
```

The Explorer (inside its own `<div class="stage">`):

```astro
  <p class="status" id="status" role="status" aria-live="polite"></p>
  <noscript>
    <p class="status">Every world is drawn in your browser, so the Explorer needs
    JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</p>
  </noscript>
```

becomes

```astro
  <StageNotices pillId="status">
    <Fragment slot="noscript">Every world is drawn in your browser, so the Explorer needs
    JavaScript. You can still browse the <a href="../gallery/">gallery</a>.</Fragment>
  </StageNotices>
```

The Reading Room, `src/pages/reading-room/index.astro` (inside its own `<div class="stage">`):

```astro
  <p id="rr-warning" class="warning" hidden>Your browser could not start the render
  worker, so the chart is drawn on the main thread. The page may pause for a moment.</p>
```

becomes

```astro
  <StageNotices warningId="rr-warning">
    <Fragment slot="warning">Your browser could not start the render
  worker, so the chart is drawn on the main thread. The page may pause for a moment.</Fragment>
  </StageNotices>
```

Today, `src/pages/seed-of-the-day/index.astro` (inside its own `<div class="stage">`, directly under its own `<p class="status" id="status">`, which stays as it is):

```astro
  <noscript>
    <p class="status">Today's world is drawn in your browser, so this page needs
    JavaScript. You can still <a href="../explorer/">draw any seed in the
    Explorer</a> or browse the <a href="../gallery/">gallery</a>.</p>
  </noscript>
```

becomes

```astro
  <StageNotices>
    <Fragment slot="noscript">Today's world is drawn in your browser, so this page needs
    JavaScript. You can still <a href="../explorer/">draw any seed in the
    Explorer</a> or browse the <a href="../gallery/">gallery</a>.</Fragment>
  </StageNotices>
```

**Part C, commit 4.** In each of the eight pages that call `ChartFolio` (all nine above but the Gallery), the text `<ChartFolio lines={[["folio-title", "folio-title"], ` appears exactly once and becomes `<ChartFolio lines={[`; nothing else on the line changes. The Reading Room's call becomes `<ChartFolio lines={[["folio-sub", "folio-sub"]]} />`.

## Tests, in the order they are written

All three go into `test/site/astro-scaffold.test.ts`, as one block placed directly after the test "every road out names its destination by that route's name in the tree (Issue #668)" and before "the Chart Table's road names the page it goes to ...". They use the file's own `PAGES`, `page` and `decode`. The block, exactly as Prettier leaves it (measured: `npx prettier --check` and `npx eslint` both clean on it):

```ts
type Legend = { label: string; headId?: string; rowLabel?: string; note?: true; status?: string };
/** Every legend row on the site by page, LITERAL as ROADS is; a page absent here renders none. */
const LEGENDS: Record<string, Legend> = {
  "explorer/index.html": { label: "The Press", headId: "grp-press" },
  "print-room/index.html": {
    label: "A poster plate",
    rowLabel: "A poster plate",
    note: true,
    status: "pr-poster-status",
  },
  "explorer/portfolio/index.html": { label: "This sheet" },
  "prospect/index.html": { label: "The roads out" },
  "ribbon/index.html": { label: "The roads out" },
  "seed-of-the-day/index.html": { label: "Today's roads out" },
  "gallery/index.html": { label: "The road out" },
  "specimen/index.html": { label: "The roads out" },
};
const tight = (s: string) => decode(s.replace(/>\s+</g, "><")).trim();
const literal = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FILLED_P = "(?:(?!</p>)[\\s\\S])+</p>";
const legendShape = (l: Legend): RegExp => {
  const group =
    l.rowLabel !== undefined
      ? ` role="group" aria-label="${l.rowLabel}"`
      : l.headId !== undefined
        ? ` role="group" aria-labelledby="${l.headId}"`
        : "";
  return new RegExp(
    `^${literal(`<nav class="legend" aria-label="${l.label}"><p class="legend-head"${l.headId ? ` id="${l.headId}"` : ""}>`)}${FILLED_P}` +
      (l.note ? `${literal('<p class="legend-note">')}${FILLED_P}` : "") +
      `${literal(`<div class="legend-row"${group}>`)}(?:(?!</?div\\b)[\\s\\S])*${literal("</div>")}` +
      (l.status ? literal(`<p class="legend-status" id="${l.status}" role="status" aria-live="polite"></p>`) : "") +
      `${literal("</nav>")}$`,
  );
};

test("every legend row stands in the kit's one shape: the nav named for the row, its head, the row, named as a group where the page names it, and beside the row only the Print Room's note and status (Issue #827)", () => {
  for (const p of PAGES) {
    const rows = page(p.route).match(/<nav class="legend"[\s\S]*?<\/nav>/g) ?? [];
    const want = LEGENDS[p.route];
    assert.equal(rows.length, want ? 1 : 0, `${p.route} carries ${rows.length} legend rows`);
    if (want) assert.match(tight(rows[0]!), legendShape(want), `${p.route}'s legend row, as the kit renders it`);
  }
});

type Notices = { pill?: string; warning?: string; noscript?: true; follows?: string };
/** Every stage's notices by page, LITERAL; Today's pill is its own (no live region, a first line of its own), so Today's notice follows that pill where every other room's follows the sheet. */
const NOTICES: Record<string, Notices> = {
  "seed-of-the-day/index.html": { noscript: true, follows: "</p>" },
  "explorer/index.html": { pill: "status", noscript: true },
  "print-room/index.html": { pill: "pr-status", warning: "pr-warning", noscript: true },
  "explorer/portfolio/index.html": { pill: "pf-status", warning: "pf-warning", noscript: true },
  "prospect/index.html": { pill: "pp-status", warning: "pp-warning", noscript: true },
  "ribbon/index.html": { pill: "rb-status", warning: "rb-warning", noscript: true },
  "reading-room/index.html": { warning: "rr-warning" },
  "specimen/index.html": { pill: "sb-status", noscript: true },
};
const noticesShape = (n: Notices): RegExp =>
  new RegExp(
    literal(n.follows ?? "</div>") +
      (n.pill ? `${literal(`<p class="status" id="${n.pill}" role="status" aria-live="polite">`)}[^<]*</p>` : "") +
      (n.warning ? `${literal(`<p id="${n.warning}" class="warning" hidden>`)}[^<]+</p>` : "") +
      (n.noscript ? `${literal('<noscript><p class="status">')}${FILLED_P}</noscript>` : "") +
      `${literal("</div>")}$`,
  );

test("every stage's notices stand in the kit's one shape, last in the stage: the live status pill, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827)", () => {
  for (const p of PAGES) {
    const html = page(p.route);
    const want = NOTICES[p.route];
    if (!want?.warning) assert.ok(!html.includes('class="warning"'), `${p.route} carries no render-worker warning`);
    if (!want?.pill)
      assert.doesNotMatch(html, /<p class="status" id="[^"]*" role="status"/, `${p.route} carries no live status pill`);
    if (!want) continue;
    const at = html.indexOf('<div class="stage">');
    const end = html.indexOf('<div class="vignette top"', at);
    assert.ok(at !== -1 && end > at, `${p.route} stands its stage before the vignettes`);
    const stage = html.slice(at, end);
    assert.match(tight(stage), noticesShape(want), `${p.route}'s notices, as the kit renders them`);
  }
});

test("the chart folio names the world once on every chart room (Issue #827)", () => {
  for (const p of PAGES.filter((q) => q.chartRoom && q.dir !== "/gallery/")) {
    const folio = page(p.route).match(/<div class="chrome corner bl folio">([\s\S]*?)<\/div>/)?.[1] ?? "";
    assert.equal(folio.split('id="folio-title"').length - 1, 1, `${p.route}'s folio names the world once: ${folio}`);
  }
});
```

**These pins are green on main by design, and stay green through the lift.** A component lift changes no behaviour, so no assertion can be red before it; the pins hold today's rendered shape, which the lift must keep (Calls made, 9). Their red is the mutation, and each was measured on this plan's probe:

| pin | mutation on main's pages (implementer, at commit 1, step 15's own proof) | red line measured | mutation on the components (prover, after commit 4) | red line measured |
|---|---|---|---|---|
| the legend row | `src/pages/explorer/index.astro`: drop ` role="group"` from the legend row's `<div>` | `explorer/index.html's legend row, as the kit renders it` | `src/layouts/LegendRow.astro`: drop ` role={group ? "group" : undefined}` | `explorer/index.html's legend row, as the kit renders it` |
| the stage's notices | `src/pages/prospect/index.astro`: drop ` hidden` from `pp-warning` | `prospect/index.html's notices, as the kit renders them` | `src/layouts/StageNotices.astro`: drop ` hidden` | `print-room/index.html's notices, as the kit renders them` |
| the legend row, its head | (none: main has no page with an empty head) | | `src/layouts/LegendRow.astro`: delete `<slot name="head" />` | `explorer/index.html's legend row, as the kit renders it` |
| the stage's notices, the scripts-off sentence | (none: main has no empty notice) | | `src/layouts/StageNotices.astro`: delete `<slot name="noscript" />` | `explorer/index.html's notices, as the kit renders them` |
| the folio | `src/pages/ribbon/index.astro`: write `["folio-title", "folio-title"], ` twice at the head of its `lines` | `ribbon/index.html's folio names the world once: ...` | `src/layouts/ChartFolio.astro`: delete `<p class="folio-title" id="folio-title"></p>` | `explorer/index.html's folio names the world once: ` (the existing kit test also reds on `explorer/index.html's folio leads with the world's name`, and the link test on `specimen/index.html fragment #folio-title should exist on the page`) |

The prover is owed the three pins, at the components, on the right-hand mutations above (all five measured on the probe) plus these, each red on the named pin and nowhere expected to be green: `LegendRow`: drop `aria-label={label}` (every legend page); move `<slot name="note" />` below the row's `<div>` (the Print Room); move `<slot name="status" />` above the row's `<div>` (the Print Room). `StageNotices`: drop ` aria-live="polite"` (every page with a pill); move the noscript expression above the warning's (every page with both). The implementer's own proof at commit 1 is the left-hand column, committed first and restored with `git checkout -- <page>` (the page holds no uncommitted work at commit 1).

## Order of commits

Each commit ends with `npm run build` and the compare in Evidence 2, which must print what that commit's row says.

1. `#827 The plan, and the pins that hold the legend row, the stage's notices and the folio to one shape`: `handbook/plans/827/827-plan.md` and the test block. `node --test test/site/astro-scaffold.test.ts` prints 30 tests, 30 pass. Then the left-hand mutations, one at a time, each red on its named line and restored. Then `npm run build` and `cp -Rp dist out/827-dist-main` (this commit changes no served file, so this is main's site).
2. `#827 The legend row becomes LegendRow`: `src/layouts/LegendRow.astro` and Part A's eight page edits with their imports.
3. `#827 The stage's notices become StageNotices`: `src/layouts/StageNotices.astro` and Part B's eight page edits with their imports.
4. `#827 The folio writes the world's name itself`: `src/layouts/ChartFolio.astro` and Part C's eight edits.
5. `#827 The site spec names the new rosters and the kit's placement rule`: `handbook/specs/site-architecture.md`, the two edits below.

## Step 12 records, before the pull request opens

The implementer posts both, each as a comment of its own (workflow step 12):

1. **On Issue #827**, the dated calls comment: this plan's Calls made, pointing at https://github.com/ahl-gram/Vellum/issues/827#issuecomment-6253738018 for Alex's rulings rather than restating them.
2. **On Issue #600**, exactly this text (ruling 3):

   ```markdown
   **Follow-up from Issue #827 (2026-10-18).** Issue #827 left one idea for this issue. Once the form of the line that loads a working page's bundle is ruled here (`<script type="module" src="./app.bundle.js" is:inline>`, and the word `is:inline` in it), a shared component under `src/layouts/` can carry that line, so every page writes the ruled form. The line stands on nine pages today in three spellings: `./app.bundle.js` on six, `app.bundle.js` with no `./` on home and the Seed of the Day, and the Portfolio's with `is:inline` first. It was not built in Issue #827 because a component now would fix a form this issue may change (Alex, ruling 3 at https://github.com/ahl-gram/Vellum/issues/827#issuecomment-6253738018).
   ```

**The pull request body** carries `Closes #827` as its one closing line and names Issue #600 only as "Issue #600", with no closing keyword (close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved) anywhere near it, since GitHub reads a negated keyword beside a number as a closing reference. `gh pr view <N> --json closingIssuesReferences` is read before the pull request is handed over and lists Issue #827 alone.

## Rosters and doctrine

- **Joined by hand, in the test:** `LEGENDS` and `NOTICES` (new, beside `ROADS` and `STAGES`). No other roster is joined: a new `.astro` file under `src/layouts/` is on no list (`git grep` for `LegendButton`, `ChartStage` and `ChartFolio` across `src/`, `scripts/`, `e2e/`, `test/`, `test-support/`, `.github/`, `handbook/specs/` and `.claude/` finds only the pages and the components themselves), and the lint, the formatter and the type checker do not read `.astro` files.
- **`handbook/specs/site-architecture.md`, the rosters bullet.** The text "`PAGES` in `test/site/astro-scaffold.test.ts`, with `ROADS` and `STAGES` beside it for a page carrying a road out or the kit's stage, and RH32's browser copies of them in `e2e/suites/runninghead/room.ts` (`KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS`, `STAGED`);" becomes "`PAGES` in `test/site/astro-scaffold.test.ts`, with `ROADS`, `STAGES`, `LEGENDS` and `NOTICES` beside it for a page carrying a road out, the kit's stage, a legend row or a stage's notices, and RH32's browser copies of `ROADS` and `STAGES` in `e2e/suites/runninghead/room.ts` (`KIT_ROADS`, `CHART_ROOMS`, `FOG_ROOMS`, `STAGED`);".
- **`handbook/specs/site-architecture.md`, "How a page is authored", a new bullet directly after the first one** ("A page is one `.astro` file under `src/pages/` ..."), exactly: "- **A component under `src/layouts/` keeps a piece of the room's furniture one shape, and the page keeps where the piece stands.** The order of a room's furniture inside the shell (the stage, the folios, the slip, the legend row, the Glass) is written in its page, and that order carries the room's stacking and its tab order." (ruling 2).
- **Ratified lines left standing:** the "A markup lift into components cannot be pinned byte-identical" bullet (this change follows it); `ChartStage`'s header comment (its after slot still holds the pill and the notice); `LegendButton`'s header comment; the bundle tag's "contractual" sentence (Issue #600's).

## Evidence

1. `npm run check`, `npm run lint`, `npm run format:check` exit 0; `npm test` prints 2717 tests, 2717 pass (measured on the probe: main at `ed41e29b` prints 2714, and main with the three pins prints 2717), then `npm run astro:generate`.
2. **What is served.** Write `out/827-dist-compare.ts` (scratch, gitignored) exactly as below, and after each commit's `npm run build` run `node out/827-dist-compare.ts out/827-dist-main dist`:

   ```ts
   import { readFileSync, readdirSync } from "node:fs";
   import { join, relative, sep } from "node:path";

   const [beforeDir, afterDir] = process.argv.slice(2);
   if (!beforeDir || !afterDir) throw new Error("usage: node out/827-dist-compare.ts <before site> <after site>");

   const filesUnder = (dir: string): string[] =>
     readdirSync(dir, { recursive: true, withFileTypes: true })
       .filter((entry) => entry.isFile())
       .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
       .sort();
   const betweenTags = (s: string): string => s.replace(/>\s+</g, "><");
   const normalize = (s: string): string => s.replace(/\s+/g, " ").trim();
   const decode = (s: string): string =>
     s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
   const firstDifference = (a: string, b: string): string => {
     let i = 0;
     while (i < a.length && a[i] === b[i]) i++;
     return `at ${i}:\n    before ${JSON.stringify(a.slice(Math.max(0, i - 60), i + 80))}\n    after  ${JSON.stringify(b.slice(Math.max(0, i - 60), i + 80))}`;
   };

   const before = filesUnder(beforeDir);
   const after = filesUnder(afterDir);
   console.log(`before ${before.length} files, after ${after.length} files`);
   console.log(`only before: ${JSON.stringify(before.filter((p) => !after.includes(p)))}`);
   console.log(`only after: ${JSON.stringify(after.filter((p) => !before.includes(p)))}`);
   for (const path of before) {
     if (!after.includes(path)) continue;
     const old = readFileSync(join(beforeDir, path));
     const now = readFileSync(join(afterDir, path));
     if (old.equals(now)) continue;
     const a = old.toString("utf8");
     const b = now.toString("utf8");
     if (betweenTags(a) === betweenTags(b)) {
       console.log(`WHITESPACE BETWEEN TAGS ${path}`);
       continue;
     }
     if (normalize(decode(betweenTags(a))) === normalize(decode(betweenTags(b)))) {
       console.log(`WHITESPACE AND ENTITIES ${path}`);
       continue;
     }
     console.log(`DIFFERS ${path} ${firstDifference(normalize(decode(betweenTags(a))), normalize(decode(betweenTags(b))))}`);
   }
   ```

   Measured on this plan's probe (the same edits, built at `ed41e29b` on this machine), every run prints the three header lines `before 117 files, after 117 files`, `only before: []`, `only after: []`, then:

   - after commit 1: nothing more;
   - after commit 2: `WHITESPACE BETWEEN TAGS <page>` for exactly `explorer/index.html`, `explorer/portfolio/index.html`, `gallery/index.html`, `print-room/index.html`, `prospect/index.html`, `ribbon/index.html`, `seed-of-the-day/index.html` and `specimen/index.html`, in that order;
   - after commit 3: the same eight lines with `reading-room/index.html` in its alphabetical place after `prospect/index.html`;
   - after commit 4 and commit 5: the same nine lines as after commit 3 (Part C is byte-identical).

   The body pastes the commit 4 output. No status line gains text it did not have: after the commit 4 build, `grep -ho '<p class="status" id="[^"]*" role="status" aria-live="polite">[^<]*</p>' dist/*/index.html dist/explorer/portfolio/index.html | sort | uniq -c` prints exactly six lines, each with a count of 1: the empty pills `pf-status`, `pp-status`, `pr-status`, `rb-status` and `status`, and `sb-status` holding `the status pill, as a room reports a draw` (measured on the probe).
3. `node --test test/site/astro-scaffold.test.ts` after commit 4 prints 30 tests, 30 pass (measured on the probe).
4. e2e, after the commit 4 build, three runs one after the other, all measured on the probe:
   - `VELLUM_E2E_SUITES=hunt,print-room,prospect,ribbon,broadside,reading-room,runninghead,specimen VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` prints `ALL PASS, but 1 check skipped on purpose (RR42, Issue #869), so this run proves less than a pass  (265/265)` (127 s on the probe). `hunt` comes before `print-room` as `NEEDS_PREDECESSOR` requires; `runninghead` does not follow `home`.
   - `VELLUM_E2E_SUITES=chart-drawer,stage VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` prints `ALL PASS, but 5 checks skipped on purpose (CD25, CD26, CD30, Issue #716; EA7, Issue #897; EA8, Issue #897), so this run proves less than a pass  (68/68)` (267 s on the probe).
   - `VELLUM_E2E_SUITES=corners VELLUM_REQUIRE_BROWSER=1 npm run test:e2e` prints `ALL PASS, but 1 check skipped on purpose (FL1, Issue #894), so this run proves less than a pass  (13/13)` (78 s on the probe): FL1 reads the legend row's seat on every page and is a declared skip everywhere, so FL3, which reads the same pieces after a layout fired scrolled sideways, is the corners read this change meets.
   CI runs every lane; the body says which ran locally.
5. `vellum-plate-reader` is **not owed** (Calls made, 11). `vellum-guard-prover` is owed the three pins (Tests, above).

## Calls made

1. **The proof bar is the house's ruled one, not byte identity**: two builds compared after collapsing whitespace between tags and decoding entities, every difference named. Rule: `handbook/specs/site-architecture.md`, "A markup lift into components cannot be pinned byte-identical ... compare two builds only after collapsing whitespace between tags and decoding entities". Measured: Parts A and B leave whitespace between tags only, Part C none.
2. **The legend component is `LegendRow`.** Rule: the name Issue #487's ledger comment gave it beside `LegendButton`, and the house already calls the whole nav "the legend row" (`handbook/specs/ui-design.md`; the Specimen's own head; `placeLegendRow` in `src/site/shared/room-seats.ts`).
3. **`LegendRow` serves all eight, the Explorer and the Print Room included.** Rule: the issue's aim, one shape; leaving two hand-written leaves two shapes.
4. **The head is a slot; the words stay on each page; no label is unified.** Rule: the Print Room's select, the escaping rule (`handbook/specs/site-architecture.md`), and the issue's "No reader-visible change is intended".
5. **`StageNotices` is its own component, for eight pages, Today's pill left as it is.** Rule: `ChartStage`'s header comment says the Explorer, the Reading Room and Today keep stages of their own, which props on `ChartStage` would leave hand-written; Today's pill, which has no live region, would gain one, a change in what a screen reader announces, while its scripts-off notice is the kit's shape and joins (the plan skeptic's finding 5).
6. **Each page's sentences stay whole in the page**, the shared opening clause of the warning included. Rule: a sentence split across two files reads and greps whole in neither.
7. **The folio's title line is the component's; the second line is not defaulted.** Rule: the kit test and RH32 already hold that every folio leads with it; the Print Room's second line differs.
8. **The bundle tag (item 4's second bullet) is not built here.** Rule: Alex handed the tag's form to Issue #600 (Issue #779 comments 6091335054 and 6133488428), and a component for the tag would bake in a form that issue may change. Ruling 3 records the idea as a follow-up on Issue #600 (Step 12 records, below).
9. **The pins are characterization pins, green from the first commit, proved by mutation.** Rule: the testing rule's transparency clause (red-green is not available to a change of no behaviour) and the site spec's "Pin the rendered SHAPES instead"; the first commit carries the plan and the pins, and its proof is the left-hand column of the mutation table.
10. **The pins are three new tests in `test/site/astro-scaffold.test.ts`, not growth in the kit test and not a file of their own.** Rule: the rulebook's accepted `max-lines` skip for that file (one build) and `eslint-suppressions.json` (a listed overrun may not grow).
11. **No browser check is added, and `vellum-plate-reader` is not owed.** Rule: `handbook/specs/check-placement.md` (markup is read from the build in the unit suite; the e2e suites already read these pieces room by room), and workflow step 11 owes the plate reader only where the deliverable is an appearance; this one's acceptance is no reader-visible change, measured by Evidence 2 and the three e2e runs.
12. **`LEGENDS` and `NOTICES` are literal rosters written in the test, as `ROADS` is.** Rule: `ROADS`' own doc comment (a roster read from the source it is compared against would be circular, the skeptic on PR #502); `vellum-footguns` Gate 1 item 16's exported data has no home here, since the pages are markup no module exports, and a page that gains a legend row or a notice and is missing from the roster reds, because every page in `PAGES` absent from a roster is held to carrying none.
13. **Nothing in a component is guarded at build time** (no throw for a warning id without its sentence, or a head left empty). Rule: the pins read every page's built output, and an empty head, note, warning or scripts-off sentence fails them (`FILLED_P`, the warning's `[^<]+`; measured for the head and the noscript sentence, the plan skeptic's finding 3); a throw would guard a misuse no page makes.

## Open decisions

None. Alex's rulings (comment 6253738018) are folded throughout; see Rulings, above.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat ed41e29b origin/main -- src/pages src/layouts test/site/astro-scaffold.test.ts` prints anything: a file this plan edits moved since it was planned.
- A "before" block above is not found exactly once in its page, or a page lacks the import line its edit anchors on.
- At commit 1, `node --test test/site/astro-scaffold.test.ts` does not print 30 tests, 30 pass, or a left-hand mutation does not red its named line.
- After any commit, the compare prints a `DIFFERS` or `WHITESPACE AND ENTITIES` line, a file count other than 117 on either side, a name under "only before" or "only after", or a `WHITESPACE BETWEEN TAGS` page its row does not list.
- After commit 2, 3 or 4, any test in `test/site/astro-scaffold.test.ts` is red: the regexes are not to be loosened.
- `npm test` prints a count other than 2717, or any failure.
- Any e2e run prints a `FAIL`, or a skip not named in Evidence 4.
- The prover reports a HOLE on any of the three pins.
- Issue #827 carries a comment newer than comment 6253738018 (this plan was finished at a count of 1) that is neither a plan archive (a comment by `ahl-gram` whose first line begins `Plan archive, not a ruling:`) nor the implementer's own step 12 post.
