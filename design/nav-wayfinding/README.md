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
clickable, with the alias stated in words underneath. It is what the literature recommends over a multilayer
local nav for pages deep in the space, and unlike B it says something on every page. Its weakness is that it
shows no siblings: it tells you where you are without telling you where else you could go from here.

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

`measurements.json` holds every rendered rect; `stills.mjs` takes them. The headline: **only A collides.**

| still | what collides | by how much |
|---|---|---|
| `prospect-a-901` | the nav runs into the room folio's year control | 133px |
| `prospect-a-1024` | the same, just | 10px |
| `home-a-901` | the nav runs into the seed panel | 110px |
| `faq-a-901` | the nav runs into the room folio | 86px |

B, C and D keep the top line at seven items, so their gap to the furniture opposite is identical to today's at
every width. They pay vertically instead, and on the band page they buy the ground they need: the cluster's ink
ends at 121.3 inside a band taken to 153.6, against today's 101.8 inside 121.6.

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

```
npm run build                              # the mocks are built FROM dist/
node design/nav-wayfinding/lift.mjs        # refresh the kit copy (writes lifted.txt)
node design/nav-wayfinding/build.mjs       # write the twelve mock pages
node design/nav-wayfinding/stills.mjs      # shoot, measure, archive
node design/nav-wayfinding/crop.mjs '<url>|1280|800|0|3|<out>.png'   # a 3x crop of the cluster
```

Full-colour originals land in `out/513-nav/` and are not committed; `stills/` holds the chosen set quantized to
256 colours, which is the convention `design/chart-table/` set.
