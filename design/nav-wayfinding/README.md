# The nav and wayfinding mockups (Issue #513)

The visual SPEC candidates for the nav, drawn 2026-09-22 from the live kit at main `1e1a3c4` and real seed-42
engine output, for the sitting that rules what the top navigation becomes. Precedents: the atelier-map mockup
(Issue #454), the room mockups (Issue #462 and Issue #494, `design/sub7-chart-rooms/`), the Chart Table mockups
(Issue #518, `design/chart-table/`), the ribbon mockups (Issue #511, `design/ribbon-limner/`).

**The rulings are the dated comment on Issue #513 (2026-09-22).**

## Ruled 2026-09-22

**D over C: the trail, with the chart of the atelier laid over it.** The spec is these stills:
`prospect-d-c-1280`, `prospect-d-c-shut-1280`, `prospect-d-c-901`, `prospect-d-c-320`,
`prospect-d-c-390-open`, `home-d-c-1280`, `home-d-c-901`, `faq-d-c-1280`, `faq-d-c-shut-1280`,
and `crop-d-c-shut` for the type. The house rule since Landfall applies: be faithful to them, deviate only
where something genuinely clashes with Vellum's look and feel, and say why in the pull request.

A, B and C-without-the-chart were passed on and stay here as the record of what was not chosen. B is not
discarded as an idea so much as absorbed: the chart shows siblings, which is what B was for, and it shows them
for every room at once rather than only inside a family that has children.

**A defect the ruling itself surfaced, fixed here.** The band override was keyed to the direction's NAME, so it
never covered D-over-C and the ruled direction fell 22px past the band's bottom edge on the document room at
every width, showing faded ink on bare chart. It is now keyed to what the cluster CARRIES
(`body.room:has(.rank, .trail, .atelier-press)`), at ONE height sized to the tallest case, so no combination
nobody thought of can slip past it, and the band no longer changes depth from room to room. The ruled direction
clears the band by 26.3px.

## Why this round exists

Issue #513 was filed as a membership question against a fixed rule: the nav lists rooms, so do the Prospect and
the Ribbon qualify? Alex changed the rule on 2026-09-22 and added a purpose it did not have:

1. **Relax the rule that only rooms appear in the nav**, or let child items that are not strictly rooms sit under
   their appropriate parent.
2. **The nav shows the reader where they are in Vellum at all times.** As Vellum grows it gets easier to be lost.
3. The drawings go bold, beyond the nav alone.

So the question stopped being "who is admitted" and became "what is this thing".

**The defect behind change 2, measured.** On five of the twelve built pages the nav marks nothing as current:
home and the Specimen deliberately, then the Prospect, the Ribbon and the Portfolio. Standing in the Prospect,
the nav lists seven rooms and none of them is you. The absence is pinned, not accidental: the guard's own message
reads "is not a nav item, so no aria-current". Vellum is not short of position signals (the wordmark, the current
item, the room folio, the title, the URL); it is short of PATH signals, and nothing anywhere says the Prospect
hangs off the Explorer.

## The tree these are drawn against (ruled 2026-09-22)

- **The Explorer parents the Prospect, the Ribbon and the Portfolio.**
- **The Portfolio's address moves under `/explorer/`** so the address and the parentage agree.
- **The Reading Room carries the Prospect a second time, as an ALIAS.**

The alias is the hard part and every direction has to answer it, because two entries then point at one route
while the ratified pin allows exactly one `aria-current` span (Issue #461 ruling 1). The link graph really is a
web and not a tree: the Prospect and the Ribbon link each other, the Reading Room is a second road into the
Prospect, and the gold "Return to The Explorer" road appears on six pages including two top-level rooms, so gold
marks the hub rather than a parent.

## The four directions

Every direction is drawn on the same three pages: the **Prospect** (a chart room, whose room folio carries
controls, which makes it the worst case for the cluster growing rightward), **home** (whose seed panel is the
other thing anchored opposite the cluster), and the **FAQ** (a document room, the only one of the three that
renders the band, and therefore the only place a second line can be measured against the band's bottom edge).

**A, the flat line grown.** The joining rooms become peers on the one dotted line, ten items at the widest. It
is what Issue #513 originally asked for, and it is drawn as the honest floor rather than as a contender: it
answers change 1 and ignores change 2 completely, because a flat list cannot say that the Prospect hangs off the
Explorer. **It is also the only direction that collides**, see the measurements.

**B, parent and child: a second, quieter rank**, present only inside the family you are standing in, with the
ancestor marked on the top line and the current child marked below. This is local navigation as the literature
describes it, including its rule that local navigation must never outrank the global line, which here is carried
by size, a hairline stem and an indent rather than by a dimmer ink. **Its weakness is measured too**: B renders
nothing at all on a room with no children, which is eight of the twelve pages, and `faq-b-1280` is pixel-identical
to `faq-control-1280` for that reason.

**C, the trail.** One quiet line carrying the path, `Vellum › The Explorer › The Prospect`, every segment
clickable but the last, which is the page you are standing on and is not somewhere you can go; with the alias
stated in words underneath. It is what the literature recommends over a multilayer
local nav for pages deep in the space, and it says something in every ROOM, which B does not: B renders nothing
on a room with no children, which is eight of the twelve built pages. **It says nothing on home**, because home
is the root and has no seat in the tree, so a trail there would read "Vellum" and nothing else. On the ruled
direction that leaves home carrying the chart press alone, which `home-d-c-1280` shows. Its other weakness is
that it shows no siblings: it tells you where you are without telling you where else you could go from here.

**D, the chart of the atelier, laid over B.** The site's own shape drawn in the house idiom: the rooms are
places, the real roads are roads, the alias is a dashed track, and a pin says where you are standing. It is the
most Vellum answer available to "I am lost", and it is what change 3 asked for. **It is drawn as a layer over B,
never instead of one**, because the literature is blunt that literal spatial navigation on the web has mostly
failed; home's own Landfall stage is the mitigation and the precedent, carrying stations on a chart with a plain
legend row underneath it. Pull the chart and a complete nav is still standing. `prospect-d-shut-*` is the state
the room spends most of its time in, which is the one a direction is usually not judged on.

**D is drawn over BOTH conventional layers**, because which one it sits on is a real choice and not a detail.
Over B the chart repeats what the rank already says, since both answer "where else can I go". Over C the two
halves are complementary: the trail says where you are in words and the chart says it in space, and the chart
supplies the siblings that C's own weakness is not showing. `directions.mjs` composes it as `withChart(layer)`
for that reason. The cost is vertical: at 1280 on the Prospect the cluster's ink ends at 140.3 for D over B and
158.2 for D over C, against 101.8 today.

## What each direction costs the corner

Every direction but A keeps the top line at seven items, so the clearance to whatever is anchored opposite is
today's at every width (448.1 at 1280, 69.1 at 901). They pay downward instead, and this is the trade:

| direction | cluster ink ends at | versus today |
|---|---|---|
| today, and A | 101.8 | the baseline (A pays sideways instead, and collides) |
| B, the rank | 120.6 | +19 |
| C, the trail | 138.5 | +37 |
| D over B | 140.3 | +39 |
| D over C | 158.2 | +56 |

On a chart room that number is how much chart the corner covers; on a document room it is how much band the
direction has to buy.

## What was measured, not guessed

`measurements.json` holds the four rects the directions add (rank, trail, press, chart) plus the derived
scalars every claim below rests on; `stills.mjs` takes them. The headline: **only A collides.**

| still | what collides | by how much |
|---|---|---|
| `prospect-a-901` | the nav runs into the room folio's year control | 133px |
| `prospect-a-1024` | the same, just | 10px |
| `home-a-901` | the nav runs into the seed panel | 110px |
| `faq-a-901` | the nav runs into the room folio | 86px |

B, C and D keep the top line at seven items, so their gap to the furniture opposite is identical to today's at
every width. They pay vertically instead, and on the band page the ones that draw a line buy the ground for it.
Measured at 1280 on the FAQ: today and B both end at 101.8 inside a band of 121.6, C at 123.6 inside 169.6, and
the ruled direction at 143.3 inside 169.6, clearing by 26.3. **B is identical to the control there**, because it
renders nothing on a room with no children, which is the same weakness its own paragraph names.

**Nothing scrolls sideways at any width, 320 included.** The rank, the trail and the press all survive the 900px
fold, because they sit in the cluster rather than in the nav, and the nav is what flies off as the drawer.

## Two defects this round found in itself, both fixed here

- **Contrast.** The first draft took "quieter" from a dimmer ink and set the rank, the trail and the atelier's
  village labels in `--ink-faded` on the deep. The still showed Q & A and The Glossary barely present.
  `specs/ui-design.md` already records why: line-tan reads 4.03:1 on the deep, under the 4.5:1 floor for small
  text, and ink-faded is darker still. The live nav shows the right division, which the round now follows: the
  container's ink colours the SEPARATORS and the links are parchment. Quietness comes from size.
- **Specificity.** The mock's plate would not appear because `page-prospect.css` carries
  `#sheet { width: 0; height: 0 }`, an id rule no class selector in `mock.css` could outrank. The bundle beats it
  with an inline style at fit time, so the mock writes the same inline style rather than escalating a selector.

## What is real here and what is not

- **Real:** the whole kit (`lift.mjs` copies it from main `1e1a3c4`, so the mocks wear exactly what main wears),
  the page markup (each mock is the actual built page with its nav replaced), and the plate on the Prospect's
  stage, which is the seed-42 antique prospect of Laukuwelua dumped for Issue #518 and reused whole.
- **Stand-in:** the chart folio's three lines, which the bundle writes at draw time and no bundle runs in a mock.
  They are transcribed to match the plate above them rather than invented.
- **Mock-only, nothing proposed for main:** the inline sheet fit, and `#pp-plate` filling it.
- **`shell.css` is archived but LINKED BY NOTHING.** The built pages carry the shell as an inlined `<style>`
  block, which `repoint()` leaves alone, so the mocks already wear it. The file is kept as the record of what the
  shell was at `1e1a3c4`, not as part of the mocks' cascade; do not read it as one.
- **A mock inherits the live kit's defects unless it says otherwise.** This one neutralises none. Issue #638, the
  open and unruled crowding at 320 where the Explorer's tagline sits under the seed pill, is live in these pages
  and Alex ruled on 2026-09-22 to leave it alone for now; the 320 stills therefore show it.

## The cost the drawings surfaced

**D needs a press in the head cluster, and `header.chrome` is `pointer-events: none` with a two-item allowlist**
(`header.chrome a` and `.rooms-reveal`). Anything new that must be pressable joins that allowlist or it is dead
on arrival with no test able to see it, which is the Issue #520 class exactly. D's press is the first new member
the house has needed. Its e2e drives real input and hit-tests; it never uses `element.click()`.

**D also cannot be reached "the way the drawer is reached today" without paying for it.** The drawer is a native
checkbox with no bundle, deliberately, so the doors survive scripts off. An atelier chart on every page either
needs a no-JS form or puts a bundle on all twelve pages including Q & A and the Glossary, which ship none today.
That is a page-roster change, not a stylesheet. **D is an epic, not a sub.**

## How to rebuild

The crops come BEFORE the archive step, because `stills.mjs` copies them into `stills/` and cannot make them.
Run in this order, from the repo root:

```
npm run build                              # the mocks are built FROM dist/
node design/nav-wayfinding/lift.mjs        # refresh the kit copy (writes lifted.txt)
node design/nav-wayfinding/build.mjs       # write the mock pages, every direction on every page
node design/nav-wayfinding/crops.mjs       # the five 3x cluster crops, into out/513-nav/
node design/nav-wayfinding/stills.mjs      # shoot, measure, archive (copies the crops in)
```

`crops.mjs` records the five invocations the archive's crops were actually made with, so they are reproducible
rather than described. `crop.mjs` is the driver it calls, and takes `url|w|h|mobile|scale|out` jobs directly.

Full-colour originals land in `out/513-nav/` and are not committed; `stills/` holds the chosen set quantized to
256 colours, which is the convention `design/chart-table/` set.

## The fix round, 2026-09-22

The cold skeptic on PR #666 returned three blocking findings and nine smaller ones. All were accepted; these are
the ones that changed what the archive shows.

- **The chart panel hung 8.4px off the right edge at 320 and 390, on 20 rows, two of them named spec stills.**
  `.atelier` was a content box, so the padding and border landed outside the viewport calculation in its
  `min()`. It now sets `box-sizing: border-box`, like the house's own fixed panel `.slip`.
- **The round's own sideways check could not see it.** A `position: fixed` element never reaches
  `documentElement.scrollWidth`, which is exactly what that check reads, so it reported clean on all 20 rows.
  `stills.mjs` now carries `fixedOverhang` BESIDE it rather than in place of it, measuring every fixed element's
  right edge against the viewport. It names one intentional exclusion, the fog layers, which are deliberately
  larger than the viewport. It is empty on all 168 rows.
- **The trail put a second `aria-current="page"` on every top-level room**, against the ratified one-span pin.
  The rule is now: the nav carries the mark when the page is in the nav, the trail carries it when the page is
  not. That is exactly the five pages that had no mark at all, so the rule that fixes the defect also answers the
  question this epic was filed over. Verified across all 24 mock pages: every direction carries exactly one on
  every page that is IN the tree, and the pages carrying none are the eight home mocks plus `prospect-control`.
  Home carries none by design, because the wordmark is its own mark and the trail would read "Vellum" alone;
  `prospect-control` carries none because it is today's nav and is the defect itself. The new rule reaches three
  of the five unmarked pages rather than all five: the Specimen is deliberately outside the tree and home is the
  root.
- **Every direction is now drawn on every page.** The first pass drew B and C on two pages and D-over-B on two
  others while claiming all three, so the losing candidate was never measured against the band at all.
- Two numbers in the band paragraph came from a retired draft and appear in none of the measurements; corrected
  above. The archive is the spec, so a wrong number in it is a wrong spec.
- The stills are now byte-reproducible: ImageMagick's date chunks are excluded, so a regen with identical pixels
  no longer differs in bytes.

## The plate read, 2026-09-22, and what it cost

`specs/conventions.md` says a round's mock pages get the plate-reader, because the mocks are the only place a
ruling is made from pixels nobody measured. The first pass of this round argued its way out of that and PR #666's
body claimed it was not owed. It was owed, and running it found three things no rect could see.

- **The drawer and the chart could be open at once, and the chart took five of the seven doors out of the
  hit-test.** Not merely out of sight: `document.elementFromPoint` on each door's own middle resolved to the
  panel, so at 390 only two of seven doors could be pressed. It was already visible in a committed spec still and
  nobody saw it, because rects and overflow cannot see a stacking context. The shell already rules this class one
  line away, hiding `[popover]:popover-open` while the drawer is open; the panel was not a popover so it never
  joined. The press did the same to one door on home at 320 with the panel put away, so the rule now takes the
  whole under-cluster group: **while the drawer is open it IS the nav, and nothing the cluster carries sits over
  its doors.** `stills.mjs` carries `doorsReachable` as a third instrument, beside the other two rather than in
  place of them; 48 drawer-open rows, every door reachable.
- **At 320 the chart's own labels were illegible whatever ink they carried.** Everything inside an SVG scales
  with the SVG, so 9.5-unit labels rendered at 4.17px and pixel-sampled contrast collapsed to 1.45:1 against a
  specified ink of 10.39:1. The dash pattern went sub-pixel at the same width and read as a fainter line rather
  than a dashed one. Sizes and strokes below 620px are now stated so that they RENDER legibly once the scale is
  applied. This is a failure mode the round's earlier contrast fix did not cover: correct ink is not sufficient
  once the art it sits in is scaled below about 5px.
- **The panel was speced against the deep and never against what it sits on.** At 0.93 opacity the plate's own
  title cartouche ghosted through it on the Prospect, and two paragraphs of body prose read straight through it
  on the FAQ. It is now 0.985.

**Measured by `vellum-plate-reader`, not by this round's own sweep, and left as it is:** with the chart open the
corner covers 80.0% of the plate at 320, 48.8% at 390, 57.1% at 901 and 31.2% at 1280. With the chart put away,
which is the state the room spends most of its time in, it covers 0% at 320, 390 and 901 and 2.3% at 1280. Those
five figures need the plate's own rect, which `measurements.json` does not carry, so they are not re-derivable
from the archive; recorded as an `errata/prose.md` row. That is the cost of the direction rather than a defect in it,
and `prospect-d-c-shut-*` is the state to judge it by.

**Found on the CONTROL, so present on main today and not caused by anything here:** at 320 the Prospect's tagline
runs under the room folio's year control, x 16 to 172.5 against a control group starting at x 114.2, a 58.3px
collision that clips "cartography". Recorded on Issue #638 as a second instance of that issue's class rather than
filed again, since Issue #638 is already the epic's sub for the head cluster's budget at 320.

**Still marginal, and named rather than fixed:** at 901 and above the trail and the nav resolve to the SAME
computed colour, `rgb(239,230,207)`. The distinction between them is carried by a 1.6px size step and by the
separator glyph alone. It reads as a path in the crops, but it is a thin distinction and it is the first thing to
look at in live use.

## Round 2 of the cold review, and what Alex ruled from it

Round 2 returned four blocking findings. Two were his to rule and were put to him rather than fixed quietly.

**Ruled: the chart of the atelier IS the listing** (Alex, 2026-09-22). Ruling 1 said all three rooms are listed;
the ruled direction's top line carries seven items, the same as today, and only the rejected flat line lists the
three. His reading: the chart shows every page, and when it is open it shows enough to know where you are, which
is what the listing was for. **The consequence worth carrying forward**: the epic's sub order ships the trail
first and the chart last, so under this reading nothing is listed until the epic's final sub. That is a
sequencing question for the epic, recorded on Issue #667 rather than resolved here.

**Ruled: the trail rides into the drawer.** Fix round 2 had hidden the whole under-cluster group while the drawer
was open, which repaired the door hit-test by removing the wayfinding: on a phone, opening the nav to ask where
you are was the one gesture that took the answer away, measured as a cluster identical to the control's. The
trail and its alias line now sit in the drawer's cap above the doors, the cap grows to make room, and all 48
drawer-open rows still have every door reachable.

**Ruled: the repairs stand.** Seven of the ten named spec stills were re-shot after the ruling, by the two fix
rounds. Two changes were defect repairs and one was the drawer behaviour above; Alex accepted them rather than
re-ruling from the current pixels. Recorded here because the fidelity rule makes a ruling a ruling on exactly
what the picture showed.

**Fixed, from the same round:**

- **Home is now a place on the chart.** It had none, so the one page whose reader most needs the site's shape got
  no pin, which is visible in the screenshots Alex sent. It is drawn at sea off the south west as a ring rather
  than a filled pip, because the front door is where you arrive from rather than a room on the island, with the
  road to the Explorer its seed form actually posts to.
- **The chart press had an invisible focus ring.** It is the first `button` the house has seated in
  `header.chrome`, and the chrome's ring recolour is scoped to anchors, so it fell through to the house ink:
  measured 1.11:1 on the deep against the chrome's own 9.38:1. It now takes the chrome's ring.
- **The chart's ranks collapsed below 620px.** `r` is a CSS geometry property and outranks the SVG attribute, so
  the single value the legibility fix set flattened capital, town and village into one size inside a named spec
  still. Set per rank instead.
- **The band override was raising `--band-h` on chart rooms**, which render no band, pushing the phone drawer's
  cap down by 67px of empty ground. Scoped to rooms that actually render one.
- `pastBand` is null while the drawer is open, with the reason at the line: the trail rides inside the drawer
  there, which is an opaque panel of its own, so the measurement stops meaning what it means elsewhere.

**Named, not fixed, and owed to a later sub:**

- **There is no Explorer mock.** The Explorer is the parent of all three rooms under the ruled tree and the one
  room this round did not draw. Recorded on Issue #638's comment as well.
- **Thirteen of the 58 archived stills are byte-duplicates of another, in six groups**, and three of the named
  spec stills are among them. On home, B renders no rank and C renders no trail, so `home-b`, `home-c` and
  `home-control` coincide at 1280 and at 901, and `home-d-shut` coincides with `home-d-c-shut` at both. On a
  drawer-open phone row the chart is hidden, so `prospect-d-c-390-open` coincides with `prospect-c-390-open` and
  `prospect-d-c-shut-390-open`. They are honest renderings rather than mistakes, but the consequence is that the
  archive holds no picture of the chart on a phone for home or the FAQ, because their only phone stills have the
  drawer open. Recorded as an `errata/prose.md` row.
- The trail names the FAQ "Questions & Answers" two lines under a nav that names it "Q & A". The house carries
  both names deliberately; stacking them in one corner is new and is left as drawn.
- At 901 and above the trail and the nav resolve to the same computed colour, so the distinction between the two
  lines is carried by a 1.6px size step and the separator glyph alone. It reads as a path in the 3x crops, but it
  is thin, and it is the first thing to watch in live use.

## Round 3 of the cold review

Round 3 returned five blocking findings. All were accepted.

**The chart's labels collided at the ruled phone width, and no archived still could show it.** The sub-620
legibility fix enlarged the labels inside a fixed `viewBox`, so they grew relative to the geometry that separates
them: "you are here" ran into "The Reading Room" on the FAQ at 320 and 390 and into "Vellum" on home at 390. The
Prospect did not collide, and the Prospect is the only one of the three whose phone still shows the chart. Fixed
by moving the crowded places apart, hanging the pin BELOW its pip rather than above it into whatever label sits
north of the place, and reducing the boost. **Measured to zero overlaps on all three pages at 320, 390, 576, 901
and 1280**, where before there were two on the FAQ at four widths.

**A 45px band of viewport rendered the chart at full width with 70% oversized labels.** The panel is
`min(34rem, 100vw - 2 * var(--chrome-x))` and `--chrome-x` is 1rem below 720, so it stops shrinking at viewport
576 while the media query kept boosting to 620: an identical 544px chart carried 18px labels at 620 and 12px at
621. The breakpoint is now 575, which is where the panel actually stops shrinking. The round's sweep widths are
320, 390, 901, 1024 and 1280, so nothing between 391 and 900 had ever been shot.

**A fourth instrument, and the reason the first three could not see this.** `labelOverlaps` measures every pair
of label boxes in the chart on every row. A rect check cannot see a text collision, and a still only shows the
page it was taken of; four instances got through three rounds of review between them. It joins `sideways`,
`fixedOverhang` and `doorsReachable` beside them rather than replacing any.

**`drawerOpen` was measuring the wrong thing** on 48 of 168 rows: it read the nav's `position` and so meant "the
nav is FOLDED", which is true on all 96 phone rows and not only the 48 with the drawer open. It now reads the
reveal checkbox, and `navFolded` is recorded separately, since the two are different questions and the clearance
fields want the folded one.

**Nine findings the round does not fix now have rows** in `errata/site.md`, `errata/guards.md` and
`errata/prose.md`, which is the exit the house requires; a finding left as prose in a pull request body is itself
a finding. The largest of them is that `doorsReachable` is a bare count asserted against nothing, which differs
from `doors` on 75 of 168 rows for three benign and previously unstated reasons.

**The sheet was brought into line with the house's one-line CSS comment rule** and lint-checked by staging a copy
under `public/`, since no repo guard walks `design/` and the build sub will lift these rules into a sheet where
that guard reds.
