# The look and feel of Vellum

What Vellum looks like, how it sounds, how it moves, and how to build a new piece of it so that it
belongs. This is the record of the idiom itself, not of how a decision gets made: **how a decision
gets made lives in `specs/conventions.md`, the rules in `specs/rulebook.md`, the order of operations
in `specs/development-workflow.md`, process at the keyboard in `CLAUDE.md`, and a ruling about one
feature as a dated comment on its own issue.** Two halves of the look stand beside this file:
`specs/chart-dress.md` is how a chart itself is dressed, and `specs/cascade-traps.md` is what the
browser does to the declaration you write to get the look ruled here.

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

**That join is stated here for colours, and the tokens it does not reach are
`specs/site-architecture.md`'s**, under tokens outside the palette join. The boundary is a
derivation rather than a list, so check it there before assuming a token has a remembered home.

## The chart's own dress

**How the chart itself is dressed is `specs/chart-dress.md`'s**, from the style as a palette over
identical geometry to the sea beasts; this file is the site around it.

## The room and its furniture

Two room patterns, both ratified whole after live use (#462, ratified at #454).

**A chart room.** The chart is the room: full bleed on the deep, pannable and zoomable, fitted to
what the chrome leaves and **measured off the chrome's own rects, never guessed** (and measured after
the chrome has its text, or the fit reads an empty box). **The stage is the fixed full-viewport box
the chart is mounted in**, declared as `body.chart-room .stage` in `public/atelier.css`; a room that
hangs its plates on the deep rather than mounting one chart has none, and the Gallery is that room
today. No band, no footer: a chart room with a
stage does not scroll. **A chart room without a stage is the exception and it does scroll**, its
content passing under the fixed chrome, which is why it pools every piece of that chrome rather than
the cluster alone, and why **it wears no vignettes**: a vignette is a fixed darkening band, and on a
scrolling page it washes out whatever passes through it. Four corners, each a named piece of the kit:

- **The head cluster**, top left: wordmark, flourish tagline, dot-separated rooms nav, directly on
  the deep. Fixed in a room, riding the page on home.
- **The room folio**, top right: the room's name and tagline, with the room's *one* primary control
  under them. One control. The rest of the press is the legend row.
- **The chart folio**, bottom left: the lines the room's script fills at the draw, the chart's title,
  survey line and coordinates.
- **The Surveyor's Glass**, bottom right of the chart: the camera's presses. Where it is seated and
  why is `specs/explorer-doctrine.md`'s, under the camera, the gesture and the fit.

Between them: **the slip**, the working panel on the right, which is the mockup's station card grown
into a desk. It folds away to a bookmark tab on the right edge, and on a phone it is the bottom
sheet. **The legend row** runs along the bottom and carries the roads out.

**A document room** is the sheet instead. It keeps the band and the footer because it scrolls, and it
replaces a table of contents with an **index slip** that inks the section being read and keeps it in
view. Folding the index hands the sheet the width, in one smooth settle, and gives it back the same
way.

**A room's name stands in the corner, not on the sheet.** Exactly one `h1` per page, and it is the
first heading; the wordmark is the `h1` on home alone, because home is roomless.

**When an overlay takes the room, every member of the inert set sits INSIDE the scrim host's
subtree.** That is the whole of what the set owes. A click over an inert subtree retargets to its
nearest live ancestor, so a member outside the host retargets to something that is not the scrim and
is dead with no way out. Painted extent is a separate, visual question: a fixed wash may sit off an
inert region the page has scrolled without any harm, because the body is that region's host too. The
wirings are `HOME_WIRING` and `ROOM_WIRING` in `src/site/shell/wiring.ts`.

**Which scrim shape belongs where follows the chrome.** Where the chrome rides the page, a fixed
scrim is the defect, because an open overlay scrolls away from it; where the chrome is fixed, the
mirror defect is an absolutely positioned one. Read the chrome first, then choose.

**The kit is lifted at second use, never at first** (#487). A piece is written in page CSS where it is first
needed; when a second room needs it, it moves to the shared sheet and a component in the same change,
and the first consumer is repointed. Anything still used once stays put. **A page seats a component;
it does not re-dress it.** A page may give its own element inside a piece a face, and may ink a row
under its own state, but an arm made only of kit classes may set no colour, border, shadow, font or
tracking. A guard sweeps for exactly that.

**When the reader is zoomed in, or the room has no stage, the furniture stands on
a pool**: a blurred box that follows the cluster, running well past the viewport edge on its
edge-facing sides so the fade never lands on screen. At rest on a chart, the chrome carries none. The
legend row and the room folio take home's crisp panel instead of the blurred pool, so that a chart
room's corners read the same as home's, corner for corner.

**The legend row never takes a real padding.** Its seat gives it its width, and the footing that
looks like padding is the row's own pseudo-element drawn at those insets, so the row's box, which the
seat and the fit both read, never changes. A real padding on it wraps the roads.

**On a phone the Glass stands down while the bottom sheet is open**, and that is a kit rule rather
than a page one, so a new chart room inherits it instead of discovering it. Written anywhere else it
is a copy, and the sweep that looks for copies has to reach every authored sheet, a page's own style
block and the generated sheets alike.

**A new component's CSS goes in its own sheet.** Fold it into an existing one only if a separate
sheet breaks something or costs performance; the rosters a new sheet joins are never the reason,
and what those rosters are and what each costs is `specs/site-architecture.md`'s.

**Derive a clearance from the token, never from either literal.** The panel-width token is redeclared
per page by design, so a clearance computed from a remembered value is right on one page and wrong on
the next.

**A multi-column index puts its entries level across columns**, so a reading spy that takes the last
entry above the line in document order marks the wrong column. Take the entry nearest the line from
above, break a tie to the earlier, and bound it below the section head, which is what `entryAt` in
`src/site/shared/index-ink.ts` does. The same geometry is why such a list is allowed to FLOW in
columns rather than being sized as a grid: a flowing list rebalances itself when an entry is added,
where a grid sized for today's entries spills.

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
- **A glossed section runs to a small band of terms**, and a section that runs over is named as an
  exception rather than left to look like drift. A section under the floor is fine: the floor binds
  only the sections that introduced it. `test/site/glossary-sections.test.ts` holds the cap and the
  named exceptions.
- **A homograph takes the period form**: one headword whose senses run together, rather than a second
  entry under the same word.
- **Culture sections are ordered alphabetically**, not in the order of the roster that generates
  them. The roster's own order is load bearing elsewhere, so the page may not be reordered to match
  it and the roster may not be reordered to match the page.

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

**Sample the ground UNDER the ink, not beside it.** Isolate the glyph pixels by rendering the ground
without the copy and diffing the two, sample the ground in a small halo around those pixels, take the
worst case, and make the guard model that same ground. A number measured beside the text is a number
about a different place, and the error runs both ways: a ratio taken from the bright outer edge of a
radial ground overstates the margin, and one taken from a dark neighbour understates it.

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

**A real tap fires the compatibility hover and focus events BEFORE its click**, and the tap's own
press light-dismisses an open auto popover first. So a press that toggles a popover needs the hover
and focus paths standing down on a touch-primary machine, and it needs the dismissal recorded
SYNCHRONOUSLY: the popover's `toggle` event is queued and lands after the click, while `beforetoggle`
is its synchronous twin. Without that record the closing half of a tap reads as an opening one and
the note re-shows. The working shape is `src/site/explorer/footnotes.ts`.

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
ran by listening for its own end. The recipe is a pair of rules:

- **The trigger is a class the host applies, never the hidden attribute.** Restoring display starts
  an animation afresh, so a rule gated on hidden replays the ceremony every time the element is shown
  again. `.rf-arrival` in `public/reading-frame.css` is the shape to copy.
- **The class retires when nothing is animating**, on the animation end plus a check that no
  animation is still running, AND deterministically at the top of the host's own draw. The second
  half is not belt and braces: it is the only path that runs when the first event never fires.

**A host that plays an arrival carries the arrival rules in its own page stylesheet**, scoped to its
own mount, or the ceremony is silently inert and its cleanup never runs.

**The voyage ship is the only plan-view object on the sheet**, top down solely so that turning it to
its heading works. That is why every other moving mark is a profile glyph that FLIPS east to west and
tilts, rather than rotating: a profile glyph has an up, and a full rotation lays it on its beam ends
on a northward leg. The tilt's own constant, and what moving it costs, are
`specs/region-and-voyage.md`'s.

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
The stage's message boxes print as nothing too, in every chart room (#566, ruled 2026-09-11): the
status pill with its scripts-off notice, and the render-worker warning that stands on the notice's
own seat. The pill reports a draw that is over by the time the page is paper, and every one of them
is absolutely seated, so on paper the box resolves against the page box: the pill's laid a grey slab
that read 2.6:1 below the chart at phone width and about 3.0:1 across the chart itself at letter
width.

**A state expressed as a `:checked` or an open class needs its own print stand-down**, because state
survives the print stylesheet unless something says otherwise.

**A plate on a page the reader is meant to save as PDF carries no `loading="lazy"`.** A lazy plate
below the fold snapshots blank, so the page takes the eager default and authors nothing: this is a
prohibition, not an instruction to add an attribute. It is scoped to the printed page. The atlas
download is a heavyweight embed a reader scrolls rather than prints, and `specs/rulebook.md` ratifies
reserved frames plus lazy loading for it; that rule stands and this one does not reach it.

**Save-as-PDF fidelity is not automatable headlessly.** An e2e may assert that a file came out
non-empty with a plausible page count, and no further. Page breaks, margins and clipping owe a manual
pass in two browsers before a printing change is called done.

**A plain data-URI link is refused from a real file origin**, so a self-contained document links its
plates to a blob built by script at load instead. A link to a blob also never doubles the file the
way wrapping the data server-side would. `PLATE_LINK_SCRIPT` in `src/atlas/document.ts` is the live
form, and a plate whose link fails is left a plain image rather than a dead one.

## How the cascade breaks here

**The craft half of this file is `specs/cascade-traps.md`**: what the browser does to the declaration
you write to get the look above, read before writing or moving CSS.
