# The look and feel of Vellum

What Vellum looks like, how it sounds, how it moves, and how to build a new piece of it so that it
belongs. This is the record of the idiom itself, not of how a decision gets made: **the rules live in
`specs/rulebook.md`, the order of operations in `specs/development-workflow.md`, process at the
keyboard in `CLAUDE.md`, and a ruling about one feature as a dated comment on its own issue.**

Where this file names a measured value, a guard pins that value, and **the guard is right if they
disagree.** Where it names a role, the role is the durable thing and the value behind it may be
re-ratified on #324. The ruled pixels live under `design/`, one directory per design round.

## The ground

**The site is an atelier at night: parchment sheets on a walnut desk.** One fixed dress, sitewide.
The deep is painted behind every page and every sheet floats on it. The room's furniture is held to
the edges, and the thing the reader came for (a chart, a sheet of prose, a plate) takes the middle.

Two layers soften the deep, both worn by every room: **the fog**, the mockup's parchment
breath drifting slowly over the walnut, and **the vignettes**, the two fixed edge fades that keep
parchment chrome legible when a pale chart fills the frame. Neither is decoration that can be
dropped: the vignettes are load-bearing contrast.

**This is not a dark mode and there is no theme toggle**, a description of the code rather than a
ruling: there are no `prefers-color-scheme` blocks in the authored sheets. The tokens sit in
inverted roles and
`color-scheme: light` still stands, so a reader on an OS dark setting keeps light form controls and
scrollbars. Do not offer a theme swap as though it were tractable: the page chrome is tokens and
would swap, but the chart cannot, because the renderer writes literal hex into the SVG it emits. A
dark plate would be a fifth chart *style* beside antique, topographic, ink and nautical, meaning new
palettes plus new committed artifacts plus a regen. (Separately: the Explorer's "theme" control
picks a map tint, not a colour scheme.)

## The case

Three faces, three roles, self-hosted, ratified as the Punchcutter's Case (#228). The face files and
the role variables are declared in `public/fonts.css`:

- **Display: IM Fell English SC.** The wordmark, room names, section heads, the nav, the footer.
- **Flourish: IM Fell English italic.** Taglines, intros, captions, asides. The voice that speaks
  around the work rather than in it.
- **Body: EB Garamond.** Prose, controls, tables, everything that is read at length.

**The chart's own lettering is not in this case.** The renderer sets its SVG text in the Iowan serif
stack, and that side is the byte-determinism contract: changing it owes a regen. A guard refuses any
Fell or Garamond leaking into rendered SVG. Keep the boundary.

Things the Fell faces do that have each cost something:

- **Fell has no bold cut.** Asking for weight 700 gets synthetic bold, which looks like a rendering
  fault. Pin the weight you mean explicitly rather than letting a tag's user-agent default choose:
  swapping an element between `h1` and `p` silently flips it.
- **In Fell English SC no lowercase letter descends**, so a nav underline can clear every label and
  still collide. The capital Q carries a drawn flourish and is the letter that finds the floor.
- **The small caps are the face's own**, not a `text-transform`. Nav labels stay mixed-case in the
  markup and let the face set them.
- **Diacritics are avoided outright.** The self-hosted faces are latin-subset, so an accented glyph
  has no coverage.
- **A manicule or other ornament pins the plain serif stack**, never the Fell variable, for the same
  coverage reason.

The fallback stack is written inline as each variable's fallback on purpose: a generated atlas
download links no stylesheet of ours, so with the variables undefined it still lands on a serif.

## The palette, by role

Every colour is a named token, declared once in the layout and mirrored for the generated documents.
The roles are what to design against:

**Inks.** `--ink-dark` is the dark walnut of borders, buttons, prose and emphasis. `--ink-brown` is
the flourish brown of taglines, captions and asides. `--ink-faded` is the faded ink of nav, footer
and small labels. Three journal inks stand apart, chosen by eye from a rendered contact sheet: the
chronicler's iron-gall for annals entries, the surveyor's walnut italic for the prologue, and its
faded companion for the gutter days. `--ink-tale` is the note ink of place-card tales and atlas
notes. `--iron-red` is the ink red of the hunt star and statuses.

**Papers.** `--parchment` is the sheet ground; `--parchment-panel` the raised panels, cards and
pinned slips; `--parchment-bright` the lit cream of hovers and reveals; `--parchment-deep` the
pressed tan of code chips.

**Hairlines.** `--line-tan` for outer frames, `--line-faint` for interior rules. That split is
ratified and it is the fastest way to tell whether a border is framing something or dividing it.

**Quotations from the chart.** `--chart-paper` and `--chart-ink` are borrowed from the renderer's own
constants and pinned equal to them by test. **Every depth shadow on the site is cast in chart ink**,
and alpha over a token is written with the relative-colour form rather than a raw triplet, which a
guard enforces. Four shadow tokens carry that ink: the sheet's and the stage's in the layout, the
raise and the press in the motion sheet. A `box-shadow` used as a ring rather than a depth (the
slider thumbs) is not one of these and wears its own ink.

**The deep itself** is a token, a two-layer radial construction lighter at the centre so a chart does
not wash out on it. `--band-h` and the two chrome offsets are tokens beside it so a room's furniture
anchors through them.

**A new colour goes in both places or the palette test reds.** Per-element data never travels through
a custom property: there is no honest stylesheet default for one settlement's coordinates, so
per-element values go inline on the element.

## The chart's own dress

The charts are the thing the site exists to show, and they are dressed on their own terms.

**A style is a palette over identical geometry.** Antique, topographic, ink and nautical draw the
same world; only the colours, the paper and the lettering change. Antique is the default and is what
a bare request draws.

**A new dress replaces one rather than adding another.** Ruled for the Ribbon's painted plate on
#426 (2026-09-03): the limner's colour took the place of the antique dress rather than becoming a
third option, because an Ogilby plate was sold plain or hand-coloured, which is ink and antique
already. Read as a general rule this is a generalization of that one ruling, not itself ratified, so
treat it as the question to ask (what does this dress replace?) rather than as a refusal.

**A derived plate falls back through the dresses in order**: an ink chart yields an ink plate,
anything else yields antique. That two-dress rule is why a mixed collection reads honestly, and each
sheet keeps the dress it was drawn in rather than being harmonized to its neighbours.

**The dress gates what the engine will do.** The finer redraft is enabled on the antique dress alone,
so every collectible survey is antique and the only other dress that can reach a gathered sheet is a
prospect's pen and ink. A feature that gathers charts inherits that gate whether it means to or not.

**A sheet stands on the desk in one dressing**: a single hairline in the pale tan and the house sheet
shadow, cast in chart ink. The shadow's depth is deeper than it looks like it should be, and
deliberately so: it was arrived at from a bug where an armed survey wore the hairline and shadow
twice in exact register, which read better than the single pass and was ratified at the doubled
value (#367). The mount is qualified on the marker the renderer stamps on a chart and nothing else
carries, so keep that qualifier or the doubling comes back.

**The chart's lettering ink is not the site's prose ink** and the two are not to be unified: the
chart side is inside the byte-determinism contract, and the site quotes it as a token instead.

**A river keeps its name over a graze.** A river yields only where it would truly bury a neighbour, never where it merely touches
one. The bar is `RIVER_MAX_OVERLAP` in `src/render/layers/feature-labels.ts`, tested against the river's true rotated ink rather than an upright box. **What it yields to is
everything already claimed in the arena**, which is more than the labels: the cartouche and the
scalebar are claimed before any label layer runs, and the legend and compass are claimed too when
they are drawn. Terrain glyphs are the exception that reserve nothing, so grazing a stand of trees
costs a river nothing at all. A residual graze just under the bar is correct behaviour, not a defect.

## The room and its furniture

Two room patterns, both ratified whole after live use (#462, ratified at #454).

**A chart room.** The chart is the room: full bleed on the deep, pannable and zoomable, fitted to
what the chrome leaves and **measured off the chrome's own rects, never guessed** (and measured after
the chrome has its text, or the fit reads an empty box). No band, no footer: a chart room does not
scroll. Four corners, each a named piece of the kit:

- **The head cluster**, top left: wordmark, flourish tagline, dot-separated rooms nav, directly on
  the deep. Fixed in a room, riding the page on home.
- **The room folio**, top right: the room's name and tagline, with the room's *one* primary control
  under them. One control. The rest of the press is the legend row.
- **The chart folio**, bottom left: the lines the room's script fills at the draw, the chart's title,
  survey line and coordinates.
- **The Surveyor's Glass**, bottom right of the chart: three presses, the camera. It is a sibling of
  the stage so it never rides the chart's own zoom.

Between them: **the slip**, the working panel on the right, which is the mockup's station card grown
into a desk. It folds away to a bookmark tab on the right edge, and on a phone it is the bottom
sheet. **The legend row** runs along the bottom and carries the roads out.

**A document room** is the sheet instead. It keeps the band and the footer because it scrolls, and it
replaces a table of contents with an **index slip** that inks the section being read and keeps it in
view. Folding the index hands the sheet the width, in one smooth settle, and gives it back the same
way.

**A room's name stands in the corner, not on the sheet.** Exactly one `h1` per page, and it is the
first heading; the wordmark is the `h1` on home alone, because home is roomless.

**The kit is lifted at second use, never at first** (#487). A piece is written in page CSS where it is first
needed; when a second room needs it, it moves to the shared sheet and a component in the same change,
and the first consumer is repointed. Anything still used once stays put. **A page seats a component;
it does not re-dress it.** A page may give its own element inside a piece a face, and may ink a row
under its own state, but an arm made only of kit classes may set no colour, border, shadow, font or
tracking. A guard sweeps for exactly that.

**When the reader is zoomed in, or the room does not scroll under its chrome, the furniture stands on
a pool**: a blurred box that follows the cluster, running well past the viewport edge on its
edge-facing sides so the fade never lands on screen. At rest on a chart, the chrome carries none. The
legend row and the room folio take home's crisp panel instead of the blurred pool, so that a chart
room's corners read the same as home's, corner for corner.

## The voice

Vellum speaks in a period register, and the copy is designed, not written afterwards.

**A road out of a room is two lines: a verb, then a place.** "Take to / The Print Room". "Read the
journal in / The Reading Room". "See the road's end in / The Prospect". The verb line and the room
line wear different faces and different inks, and the pair is one component. A press that acts on the
sheet itself rather than going anywhere wears the same dress as a button.

**A slip introduces itself the same way**: a verb, a title, and a "where" line that says what is
inside. "Make one / The Broadside / the land, and the hand that dresses it". "Watch one / The
Journal / the survey sails first, and the history follows".

**Instruments are named for what they are, not for what they do.** The camera's group is called
Camera, but the house calls the piece the Surveyor's Glass; its presses read "Draw nearer", "Stand
off", "The whole sheet". A waiting frame says "Drafting…". A download offers "the engraving (SVG)".
Print options speak of the engraving itself, an impression, a finer impression.

**Name a new thing in that register**, and name it at the sitting rather than in the code. The Chart
Table's round named the table, its handle, the sheets on it, the road, the page and the address key
all at once, and checked the key against every key already in use.

Rules that catch drift:

- **A count in prose is derived from the thing it counts**, never written twice. A guard reads the
  roster and reds when the two part company.
- **Do not invent a fact for flavour.** A first draft of the glossary claimed a Japanese place name
  was voiced when it is not, and every glossed word must be traceable to a culture's own name
  templates, or no world can print it.

## Colour, contrast and legibility

**The floor is 4.5:1, and it is measured, not judged** (the plate reads on #458, #461, #464, #465
and #525 are where the misses below were each found). Every contrast miss in this project was found
by measuring; none was found by looking. The pattern repeats so often it has a shape: the mockup's
face is `--ink-faded` or `--line-tan`, and at small sizes on the deep or on a panel that lands
between 2.8:1 and 4.0:1, so **the shipped face goes up a step, to parchment on the deep or ink-brown
on a panel.** Assume a small label taken from a mockup needs this until you have measured it.

**Sample a ground with the median of a wide run**, never a single point, and never a maximum or a
minimum: a maximum passes on one bright control sitting under the sample, a minimum fails on one
hairline crossing it, and the point you assumed was dark may be the parchment chart.

**Removing or changing a ground owes the whole surface a sweep.** When a fix changes what a surface's
background *is*, re-measure everything standing on it, not just the element the issue named. A dark
pool had been covering a phone sheet, and four separate things were leaning on it without anyone
knowing, including a keyboard focus ring that fell to about 1.0:1.

**The focus ring is one face**, ratified on #324 and pinned: a control that draws its own is
conforming, not inventing. It is drawn *outside* the control, so it stands on the surrounding ground
and is measured against that ground. Where a ring's contrast leans on a footing, it is scoped with
that footing, and it falls back to the house ink when the piece is docked somewhere paler.

**Controls sit in three radius families, descending**: panels, then slips and controls, then chips.
Warnings are panels, not slips. Beside them: one standard control in the cream fill, one dark primary
whose text is chart paper, one featured gold action, and the translucent overlay presses of the
Glass, whose translucency is load-bearing over a chart.

**A control's font size does not go below 16px in the corner chrome**, because a smaller input font
makes iOS Safari zoom the page on focus.

**The ruled phone width is 390.** 320 is checked, and its squeezes are accepted and recorded rather
than designed for. A deviation that is knowingly shipped is recorded with its measurement, not left
silent, because an unrecorded one reads to the next session as a defect and gets "fixed" back.

## Gesture

**A hover gesture promises navigation** (#289, ratified at #324's post-use feel review). A tip on
something that goes somewhere is the house's
gesture; a tip on something that does not is a false affordance, and the glossary term tip was
removed for exactly that reason. A non-navigating gesture is either a chart instrument, which is its
own ratified class, or it goes on the list awaiting a ruling. A new tip joins one of those lists
consciously, or the sweep refuses it.

**A tip on an inline element needs `display: inline-block`** or the transform silently does nothing.
And an inline-block takes its baseline from its last line box, so a wrapping list item drops its
bullet beside line two: such a box pins `vertical-align: top`. Never "fix" that by going back to
`display: inline`, which kills the tip.

**Touch and hover are branched on the full predicate**, coarse pointer and no hover together, never
on absent hover alone: a headless linux runner reports no hover with no pointer at all.

## Motion and ceremony

Motion is design material here and it is ruled like the rest.

**A ceremony is an arrival, and how often it plays is a ruling.** The homepage's veil plays once per
sitting and any click or key skips it (#457, ratified at #454 ruling 20); a room's landing ceremony
plays on every arrival (#461, ratified at #454 ruling 21). Neither is a default to reason from: a new surface asks
which of the two it is.

**The sheet settles onto the desk, then the chrome inks in.** That is the order, and it is quicker and
subtler in a room than on the homepage.

**Reduced motion is the control, not just a courtesy.** The shared motion sheet zeroes every animation
delay and duration under `prefers-reduced-motion` with `!important`, and three things follow:

- **A functional animation is not a ceremony.** A timer or a progress indicator that must keep running
  needs its own same-origin `!important` exemption at higher specificity, or the blanket stops it.
- **Overriding an `!important` rule takes `!important`**, including from a `noscript` block, because
  author-important beats author-normal before source order is consulted at all.
- **Reduced motion is the honest control for a timing question.** When a defect might be ceremony
  timing rather than a real layout or paint fault, the reduced-motion run collapses the ceremony and
  settles it. It is also how two builds are compared without the compositor's text antialiasing
  producing a residual on identical geometry.

**Read the preference live.** A component that freezes the media query at construction stops responding
when the reader changes the setting.

**A piece seated by a transform is placed with the individual properties**, `translate` and `rotate`,
because the house lift writes `transform` and would replace the seat.

**An entrance animation with a `both` or `forwards` fill pins its final keyframe's transform at
animation-cascade priority permanently**, silently killing any hover transform on that element
afterwards. A shadow escapes if the keyframes do not own it. Only a rendered probe found this.

**A one-shot ceremony needs its own guard rather than an end event.** Hiding an element mid-animation
fires no animation event at all in Chrome, so a ceremony that must not replay cannot record that it
ran by listening for its own end.

**A host that plays an arrival carries the arrival rules in its own page stylesheet**, scoped to its
own mount, or the ceremony is silently inert and its cleanup never runs.

## Print

**Print is paper.** The band, the head cluster, the slips, the instruments, the fog and the vignettes
print as nothing. The chart prints, the sheet prints as paper in one column, and the folio stands in
flow at full width, on the paper and not on its panel (the panel is a screen thing, painted
screen-only; in flow on paper an absolute panel resolved against the whole page, #538). Each room
stands its own furniture down as it converts. The take-home artifacts
are the atlas download and the Print Room's own output; the rest of the site is a screen.
On screen a stray edge hides inside a room's own side padding, but on paper the page box IS the
container, so a full-width bordered box counts its border inside its width or it prints past the
edge (#565, the Gallery's plates 2px over at a phone page and at Letter alike).

**A state expressed as a `:checked` or an open class needs its own print stand-down**, because state
survives the print stylesheet unless something says otherwise.

## How the cascade breaks here

The craft half of everything above. This class of defect has shipped repeatedly and reads as correct
in the source every time, because **the failing declaration is present in the file and merely loses.**
A text search over the CSS passes on the broken code; pin the resolved value instead.

- **A media query adds no specificity.** A narrow-width override written at a bare class loses to any
  wider-specificity rule outside the block, however far above it that rule sits.
- **The arms of a selector list rank independently.** Scoping one arm of a two-arm painting rule is
  scoping neither, and a repair that carries one arm will pass a guard written for the other.
- **The best fix is often no media query at all.** Ask whether the state you are dressing already
  implies the width. An override scoped on the docked state alone wins outright and fights nothing.
- **The layout's inline style block renders after the page stylesheet**, so a page override of a shell
  rule needs higher specificity or it silently does nothing. Equal specificity is not enough.
- **A rule carrying an id cannot be beaten by a plain class.** Change that rule's own variables.
- **The house sheets dress every button.** Their hover wash sits three classes deep, so a chrome hover
  is written four classes deep or the piece flashes bright cream on hover. A button on a load-bearing
  transform joins the exclusions or reuses the excluded class.
- **An author `display` beats the user-agent `[hidden]` rule**, so on a piece that declares its own
  display, setting the `hidden` attribute does nothing at all. Hide it through style.
- **A docked piece reparents and goes static**, so an absolutely positioned pseudo-element on it
  resolves against whatever fixed ancestor it lands in and can span a whole sheet.
- **A transform on a container re-anchors every fixed descendant to it** for the length of the
  animation, so a landing settle applied to the wrong element throws the corner furniture across the
  page.
- **An affordance gate is `(hover: none) and (pointer: coarse)`, never `(hover: none)` on its own**,
  wherever it is asked, which today is a `matchMedia` call rather than a sheet. A machine with no pointing device at all reports `hover: none`
  together with `pointer: none`, so the bare query matches it too and stands the affordance down
  exactly where a keyboard user needs it. Linux headless CI is such a machine (e2e BR4 and BR5 hold the line). The bare query is still the
  right tool for **asking what the environment reports**, which is why an e2e probe uses it to detect
  whether emulation took effect; the rule is about gating an affordance, not about the query.

These are about looking rather than the cascade, and belong beside them:

- **Structural tests cannot see layout.** A stylesheet that scrolled a 320px phone sideways passed the
  full unit suite, the full e2e suite and a twenty-two agent adversarial review, because every
  assertion read file text or DOM shape. Render it and measure it.
- **Read the whole frame of an after-shot**, not the piece you changed. A row that wrapped, a seat that
  moved, a control that fell off the edge: the eye goes to the target and reads past them.
