# How the cascade breaks here

The craft half of `handbook/specs/ui-design.md`. This class of defect has shipped repeatedly and reads as correct
in the source every time, because **the failing declaration is present in the file and merely loses.**
A text search over the CSS passes on the broken code; pin the resolved value instead.

Read this file before writing or moving CSS, and before reading a rendered frame after a change:
`handbook/specs/ui-design.md` rules what the site looks like, and this file is what the browser does to the
declaration you write to get there. The checklist form of the same lines is `vellum-footguns` Gate
3, which points here rather than copying the reasons.

- **A media query adds no specificity.** An override inside a media block (print, reduced motion, a
  short window) written at a bare class loses to any wider-specificity rule outside the block, however
  far above it that rule sits.
- **The arms of a selector list rank independently.** Scoping one arm of a two-arm painting rule is
  scoping neither, and a repair that carries one arm will pass a guard written for the other.
- **The best fix is often no media query at all.** Ask whether the state you are dressing already
  implies the condition: an override scoped on that state alone wins outright and fights nothing.
- **The layout's inline style block renders after the page stylesheet**, so a page override of a shell
  rule needs higher specificity or it silently does nothing. Equal specificity is not enough.
- **A rule carrying an id cannot be beaten by a plain class.** Change that rule's own variables.
- **The house sheets dress every button.** Their hover wash sits three classes deep, so a chrome hover
  is written four classes deep or the piece flashes bright cream on hover. A button on a load-bearing
  transform joins the exclusions or reuses the excluded class.
- **An author `display` beats the user-agent `[hidden]` rule**, so on a piece that declares its own
  display, setting the `hidden` attribute does nothing at all. Hide it through style.
- **A piece a script moves to another parent takes that parent's positioning**: where it goes static
  there, an absolutely positioned pseudo-element on it resolves against whatever positioned ancestor
  it lands in and can span a whole sheet. `seatFrame` in `src/site/reading-room/seats.ts` moves the
  Reading Room's parts this way at boot.
- **A flex item defaults to `min-width: auto` and refuses to shrink below its content width**, so a
  control row overflows its box while every rule in it reads as correct. Zero the item's
  own minimum; where the row still cannot fit, let it wrap as well. A range input is the usual
  culprit, because its intrinsic width is far wider than it looks.
- **A percentage max-height dies inside an auto grid track.** Containment without script is an
  absolutely positioned box with auto margins against a definite one, never a viewport formula,
  which crops the moment the chrome above it changes height.
- **A sticky box is clamped inside its containing block.** Pulling a sticky cap into a scroll
  container's padding with a negative margin does not stick it at the top; the browser slides it to
  the content-box top, over the first items. Make the cap the spacer itself, with no padding above
  it, and hit-test the items rather than reading their rects, because the rects still look right.
- **A full-bleed absolutely positioned layer kills anything authored beneath it.** Laid over a
  panel's head, it leaves every control in that head dead to a real touch, so such a control takes
  its own stacking layer.
- **A shown popover renders in the TOP LAYER, which no z-index reaches**, so a scrim cannot dim one.
  Popovers stand down with the scrim instead.
- **The head cluster pins its own line-height**, because a page sheet sets the body's for reading and
  the cluster must not inherit it.
- **An absolutely positioned box wider than the 1024 page fails two ways, by the body it lands in.**
  On a page that scrolls, a phone's or a tablet's browser shrinks the whole page further to fit it,
  and clipping overflow at the root does not stop that, while a desktop window scrolls sideways past
  the page (`FL1` in `e2e/suites/corners/floor.ts` refuses that on a page at rest). In a staged chart
  room, whose body clips (the `contain: layout` trap below), it is cut off at the body's edge in
  silence: no overflow read sees it, so read the box's own rect against the body's. Cap the box.
- **When an engine-dressing rule is the one losing, the opt-out may not be written in the host's own
  sheet.** `handbook/specs/explorer-doctrine.md` rules that engine dressing is edited in the one shared sheet
  and never in a host's, so the repair belongs to the rule that is losing.
- **A transform on a container re-anchors every fixed descendant to it** for the length of the
  animation, so a landing settle applied to the wrong element throws the corner furniture across the
  page.
- **`contain: layout` re-anchors every fixed descendant too, and for good**: the element becomes their
  containing block and a stacking context. The 1024 floor relies on it, on a staged chart room's body,
  so the fixed furniture lays out on the 1024 page and scrolls sideways with it; and that body clips
  (`overflow: clip`) rather than hides, since an `overflow: hidden` box is a scroll container that a
  focus moving onto a piece can scroll out from under the reader (`FL5` in `e2e/suites/corners/floor.ts`).
  Their overflow also counts in the element's own `scrollWidth` and `scrollHeight`, so a script that
  sizes a capture or a scroll by that body reads past anything a reader can reach; read the
  document's instead.
- **An absolutely positioned box with no positioned ancestor lays out against the window, not the
  floored page.** Its containing block is the initial one, the window's size, so under the 1024
  floor a shrink-to-fit box there wraps at a narrow window while every piece around it keeps its
  1024 seat. Home's riding head cluster is one; its body is made its containing block
  (`position: relative`), and `FL1` in `e2e/suites/corners/floor.ts` reads it at a 400 window.
- **An affordance gate is `(hover: none) and (pointer: coarse)`, never `(hover: none)` on its own**,
  wherever it is asked, which today is a `matchMedia` call rather than a sheet. A machine with no pointing device at all reports `hover: none`
  together with `pointer: none`, so the bare query matches it too and stands the affordance down
  exactly where a keyboard user needs it. Linux headless CI is such a machine (e2e BR4 and BR5 hold the line). The bare query is still the
  right tool for **asking what the environment reports**, which is why an e2e probe uses it to detect
  whether emulation took effect; the rule is about gating an affordance, not about the query. So a
  check asserts a visibility that depends on the environment only under the matching `matchMedia`
  condition, and pins the rule's own scoping by reading the CSSOM, which reproduces a failure only
  CI's machine shows on any machine.

These are about looking rather than the cascade, and belong beside them:

- **Structural tests cannot see layout.** A stylesheet that scrolled a page sideways at a width it was
  meant to fit passed the full unit suite, the full e2e suite and a twenty-two agent adversarial
  review, because every assertion read file text or DOM shape. Render it and measure it.
- **Read the whole frame of an after-shot**, not the piece you changed. A row that wrapped, a seat that
  moved, a control that fell off the edge: the eye goes to the target and reads past them.

---

*Companion to `handbook/specs/ui-design.md` (the look these traps break), `handbook/specs/site-architecture.md`
(where the authored CSS lives and what the build does to it), `handbook/specs/explorer-doctrine.md` (the
engine dressing one of these traps defers to), and `handbook/specs/settle-doctrine.md` (how a rendered frame
is read in the harness).*
