# Issue #764 plan: the house specs, gates and agents for desktop-only

Sub 4 of epic Issue #760. Written 2026-10-07 on `chore/764-desktop-only-specs` at main `5f1a8e8`, after Issue #761
(PR #774), Issue #762's four pull requests (PR #777, PR #784, PR #795, PR #802) and Issue #763 (PR #807) merged. This
is the issue's first plan (workflow step 8), as it stood at the step 6 STOP after the plan skeptic's findings were
folded in.

## What binds this sub

- **The issue body** (2026-10-04): ui-design's 390 phone width, the 320 check, the squeeze rules and the head
  cluster's narrow behaviour give way to the 1024 floor, the fixed viewport and the notice; the narrow sections of
  settle-doctrine, cascade-traps and explorer-doctrine; the `vellum-footguns` gates and the agent definitions that
  require 320 and 390 checks; `CLAUDE.md`'s references to phone checks. Each rule moves or goes in the spec that owns
  it (`handbook/specs/conventions.md`, Where a rule lives).
- **The ruling the specs follow** (Issue #764 issuecomment-6037346181, quoting Alex 2026-10-06 on Issue #762
  issuecomment-6010814718 Q1 and Issue #760 issuecomment-6010814916): a window narrower than 1024 keeps the 1024
  layout at full size and scrolls sideways; one layout, no narrow layout below 1024. It reversed the 2026-10-04
  browser-zoom ruling, so no spec carries "fluid layouts" or "nothing overlaps at 640".
- **The epic's standing rulings** (Issue #760, 2026-10-04): touch input stays, since large tablets are in scope; the
  minimum supported width is 1024; a phone gets the 1024 page scaled to fit with a notice.
- **Handed in**: Issue #761's C9 (the phone-layout lines in ui-design and explorer-doctrine) and Issue #763's K12 (the
  design oracle's 390 row).
- **Not this sub's**: the errata rows and open issues desktop-only makes moot are Issue #765's (its body names "errata
  rows that are phone-only"); a phone held upright is Issue #778's, ordered after this sub with its two decisions
  open, so nothing here rules how a phone frames a chart room beyond what ships today.
- **The lane beside this one**, Issue #801, owns `src/prospect/`, the background-worker bundle, the bundle config and
  their tests, and may add a line to `handbook/specs/site-architecture.md`. This plan does not edit that file. Merge
  order where the two meet: Issue #801 first.

## Recon (`vellum-spec-recon` at `5f1a8e8`)

7 STALE blocking, 17 STALE cosmetic, 4 UNVERIFIABLE, 26 CURRENT. Most of the issue body is already done: Issue #761 to
Issue #763 edited the lines their own changes made false. What changed the plan:

- **No agent definition lists viewports or requires a 320 or 390 check.** The live 390 requirement is Gate 3 item 3;
  the plate reader's stale lines are its overflow check, its window-size trap and its touch trap.
- **"held to BOTH widths" meant 390 and 320** (Issue #633's commit), both gone; the place card's cap is now read at
  1440x300 and 1280x800 (`CAP_WINDOW` in `e2e/suites/cards/reads.ts`, `P19` and `P20` in `e2e/suites/cards/cap.ts`).
  E1 rewrites the sentence without widths and points at the guard.
- **Three cascade traps lost their only instance** (the docked state, the docked piece, the full-bleed handle): E4
  keeps each lesson in its general form (call C3).
- **The rulebook's 360px trigger was kept by Alex on 2026-10-03** (Issue #668 issuecomment-5968839385, ruling 8) and
  is unreachable since 2026-10-06: menu item 3 puts it back to him.
- **The plate reader states the headless clamp as "about 500"**, a figure settle-doctrine declines to write because
  no command here shows it: E8 drops it.
- **`CLAUDE.md` names no phone check**; its one candidate is the Issue #219 line, history used as a rule's example
  (call C4).
- **ui-design says "floor" for the stage's minimum size as well as the 1024 page**, so E1 avoids a bare "floor"; and
  its citation "`fitStage` ..., which marks the page `stage-under`" is inexact, since `bindRoom`'s layout in
  `src/site/shared/room.ts` sets the class from `fitStage`'s answer. That sentence is outside this sub's lines, so it
  becomes a `handbook/errata/prose.md` row in the diff rather than a fold (call C15).
- Confirmed CURRENT and left alone: explorer-doctrine (C9's half done by PR #795); site-architecture's floor bullet;
  settle-doctrine's harness bullet and clause 14; the print measurements at phone and letter width (paper is not the
  screen, Issue #763 K11).

## Design

A documentation change in the main, plus one tooling row. No engine, renderer, chart, golden, page, sheet or bundle
moves, so no regen is owed and Gate 6 does not bind.

### Edits, file by file (the before is main at `5f1a8e8`)

**E1. `handbook/specs/ui-design.md`, Colour, contrast and legibility: the width paragraph**, rewritten where it stands
(call C2).

Before:
> **The ruled phone width is 390.** 320 is checked, and its squeezes are accepted and recorded rather than designed
> for. **The head cluster and the room's right-hand corner never overlap, at any width from 1024 up, which a narrower
> window lays out as its 1024 page:** a room folio line, ... **A panel that quotes generated prose is held to BOTH
> widths, because generated prose has no length and a panel sized for the copy you measured overflows on the next
> seed**: give it a definite width and cap it to the box it stands in, rather than letting it shrink to the room
> beside whatever it points at.

After:
> **Every page is laid out for 1024 wide and up, and nothing is designed for a narrower window**, a desktop window
> zoomed until it is narrower than 1024 included: what a narrower window and a phone get is `handbook/specs/site-architecture.md`'s, and a room's
> half is "The room and its furniture" above. **The head cluster and the room's right-hand corner never overlap, at
> any width from 1024 up:** a room folio line, ... (unchanged) ... **A panel that quotes generated prose is sized for
> no copy in particular, because generated prose has no length and a panel sized for the copy you measured overflows
> on the next seed**: give it a definite width and cap it to the box it stands in, rather than letting it shrink to
> the room beside whatever it points at. (`P19` in `e2e/suites/cards/cap.ts` holds the place card's height to its box
> on every place of its witness seed; nothing holds the definite width, and the sentence does not claim a guard for
> it.)

The first sentence is about WIDTH on purpose: a short window still re-seats pieces (the stage's minimum size, the risen
legend row and its shed, the soft backings, the one `(max-height: 640px)` block), and those stand. It points at the
mechanism rather than restating it, so the viewport tag and the sideways scroll keep their one home.

**E2. `handbook/specs/rulebook.md`, Product direction: desktop only.** Menu item 4, since the section holds Alex's
ratified wording. The recommended text states the direction and the two costs he accepted for it, which today live
only in Issue #760's comments, and leaves the number and the mechanism to their homes. It is scoped to WIDTH, so it
neither forbids nor rules the desktop-shaped frame Issue #778 builds for a phone held upright:
> **Desktop only** (Alex, 2026-10-04 and 2026-10-06, Issue #760). Vellum is made for a desktop, a laptop or a large
> tablet: no layout is built for a window narrower than the one `handbook/specs/ui-design.md` lays every page out for,
> and touch input stays, for the tablets. Two costs are accepted with it: a desktop zoomed far enough to go below that
> width scrolls sideways rather than reflowing, and a search engine ranks a page that is not mobile-friendly lower.
> The way back, if Vellum ever courts search traffic, is the home page alone with a device-width viewport and a
> phone-friendly first screen, its notice pointing to the desktop; home's own narrow layout is gone, so that screen
> would be built anew. How a narrower window and a phone are served is `handbook/specs/site-architecture.md`'s.

The way-back sentence follows Issue #760 issuecomment-5981778865, which called it "a small change contained to one
page" on 2026-10-04; PR #802 has since removed home's narrow layout, so the cost is stated as it now stands.

**E3. `handbook/specs/rulebook.md`, Retired rules: the nav's revisit trigger.** Menu item 3.

**E4. `handbook/specs/cascade-traps.md`.** Each trap keeps its lesson; the examples that name a narrow layout go
(call C3).
- "A media query adds no specificity. A narrow-width override written at a bare class loses ..." becomes "An override
  inside a media block (print, reduced motion, a short window) written at a bare class loses ...". The sheets hold
  `@media print`, `screen`, `(prefers-reduced-motion: reduce)` and one `(max-height: 640px)`, and no width query.
- "The best fix is often no media query at all. Ask whether the state you are dressing already implies the width. An
  override scoped on the docked state alone wins outright and fights nothing." becomes "Ask whether the state you are
  dressing already implies the condition: an override scoped on that state alone wins outright and fights nothing."
- "A docked piece reparents and goes static ..." becomes "A piece a script moves to another parent takes that parent's
  positioning: where it goes static there, an absolutely positioned pseudo-element on it resolves against whatever
  positioned ancestor it lands in and can span a whole sheet." `seatFrame` in `src/site/reading-room/seats.ts` still
  reparents the Reading Room's parts at boot; recon found no positioned pseudo-element on them today.
- "A full-bleed absolutely positioned handle kills anything authored beneath it. A handle laid over a whole sheet head
  is dead to a real touch for every control in that head" keeps its lesson without the removed sheet handle: "A
  full-bleed absolutely positioned layer kills anything authored beneath it: laid over a panel's head, it is dead to a
  real touch for every control there, so such a control takes its own stacking layer."
- "A flex item defaults to `min-width: auto` ... so a control row overflows a narrow viewport" becomes "overflows its
  box": the trap still bites inside a narrow box at 1024 (the Print Room's and the Specimen's corners).
- "An absolutely positioned box wider than a phone viewport makes the browser widen the LAYOUT viewport to fit it,
  and clipping overflow at the root does not stop that sizing. Cap the box." becomes, in two halves by the body it
  lands in: "**An absolutely positioned box wider than the 1024 page fails two ways, by the body it lands in.** On a
  page that scrolls, a phone's or a tablet's browser shrinks the whole page further to fit it, and clipping overflow
  at the root does not stop that, while a desktop window scrolls sideways past the page (`FL1` in
  `e2e/suites/corners/floor.ts` refuses that on a page at rest). In a staged chart room, whose body clips (the
  `contain: layout` trap above), it is cut off at the body's edge in silence: no overflow read sees it, so read the
  box's own rect against the body's. Cap the box." The measurements go in the PR body, not the spec (call C14),
  labelled by the body they were taken on. On a page without the clip (the scratch pages, and the FAQ in the plan
  skeptic's run against this tree's `dist/`): a 1400 box takes a 390x844 phone's page scale from 0.381 to 0.279 and a
  1024x768 tablet's from 1 to 0.731, with `overflow-x: hidden` on the root and without, and a desktop's document
  reads 1400 wide; the old device-width page with a 600 box at 390 is the control that reproduces the old trap (0.65).
  In the Explorer and the Print Room the same box leaves the phone at 0.381 and the document at 1024. A real phone is
  UNVERIFIABLE here.
- "Structural tests cannot see layout. A stylesheet that scrolled a 320px phone sideways passed ..." becomes "A
  stylesheet that scrolled a page sideways at a width it was meant to fit passed ..." (call C4).

**E5. `handbook/specs/settle-doctrine.md`, The environment: the oracle's second row.** Follows menu item 1. Under the
recommended answer, "shoots every page of a built site at 1280x800 and at a 390x844 narrow desktop window" becomes "at
1280x800 and at 1024x768, the narrowest the site is laid out for".

**E6. `scripts/design/oracle.ts`** (`VIEWPORTS`, and its file-head line "a desktop and a narrow desktop viewport"),
with its test in `test/repo/design-kit.test.ts`. Follows menu item 1.

**E7. `.claude/skills/vellum-footguns/SKILL.md`.**
- Gate 3 item 3, "Then render through CDP at 390 and 1280": follows menu item 2. Under the recommended answer: "Then
  render through CDP at 1024 and 1280, and at 640, where every piece must stand where it stands at 1024 with the page
  scrolled sideways (`--window-size` does not set the layout viewport)". The rest of the item stands, and the Issue
  #638 row in `references/scars.md` still proves its collision clause.
- Gate 1 item 11, "Narrow-width or column-width work owes a sweep across seeds": "Narrow-width or" goes; column width
  and generated text still vary by seed, and "a width-scoped feature is guarded on BOTH sides of its breakpoint" still
  binds any breakpoint above 1024 (the Issue #547 row still proves it). (Call C5.)
- Neither line holds a needle the hook's selftest searches a pasted note for ("## Gate N", "for wiring only", "double
  the backslash", "could not read", "browser profile"), and Gate 3 (2,289 characters) with Gate 4 (903) stays far under
  the 8,000-character note bound.

**E8. `.claude/agents/vellum-plate-reader.md`.**
- The overflow check: "`scrollWidth > clientWidth` ... This is the #219 defect" holds at 1024 and wider, with one
  exception: a staged chart room's body clips, so a piece overrunning it reads clean there, and the check is the
  piece's own rect against the body's edge. Below 1024 the page scrolls sideways by design, and the check is `FL1`'s:
  the document overhangs the window by exactly 1024 less its width, and every piece stands where it stands at 1024
  (`FL1` in `e2e/suites/corners/floor.ts`).
- The window-size trap keeps "`--window-size` does not set the layout viewport" and loses its "about 500" figure
  (settle-doctrine's clamp bullet is the home and states none) and "never how to read a narrow layout" (there is
  none). It says what each route is for: `setNarrowViewport` (`mobile: false`) to see a window below 1024 keep the
  1024 page; `setMobileViewport` (`mobile: true`) to see what a phone or a tablet sees, the page laid out at 1024 and
  shrunk to fit with the notice; `shootAll` refuses a phone, so a phone goes through `start()`. Its last sentence,
  "This trap was already in auto-memory when Issue #219 nearly hid behind it.", stays word for word, since `KEPT` in
  `test/repo/memory-pointers.test.ts` holds it.
- The touch trap: "On a phone metric ... check the visual viewport's scale reads about 1 before the first touch" is
  false now (a 390x844 phone reads 0.381). It becomes: touch a chart on a 1024 tablet (`setMobileViewport(1024, 768)`,
  scale 1, as `e2e/suites/zoom-gestures.ts` and `e2e/suites/landfall.ts` do); on a phone the scale is below 1 by
  design and a touch is aimed in layout CSS pixels from the visual viewport's origin, unscaled (settle-doctrine).
- A default, carried in the definition and pointing at its normative home by path: "unless the dispatch names others,
  read at 1024 and 1280, and at 640 for a piece keeping its 1024 seat (Gate 3 item 3 of
  `.claude/skills/vellum-footguns/SKILL.md` is the rule; this is its copy)". The copy is deliberate: the hook shows
  Gate 3 only on a `.css` or `.astro` edit (`gate-routes.ts`) and this agent writes only into `out/`, so it is never
  shown the gate, and whether a subagent reads a file it is pointed at is not settled. Conventions allow a copy that
  names its home. The widths follow menu item 2. (Call C6.)

**E9. `CLAUDE.md`, Write visual samples to out/.** "#219's sideways scroll at 320px is what got through" becomes
"#219's page that scrolled sideways where it was meant to fit is what got through" (call C4).

**E10. `handbook/errata/prose.md`**: one row for the inexact `fitStage` citation in ui-design (call C15).

### What is not edited, and why

- The Issue #219 incident narratives in `.claude/agents/vellum-pr-skeptic.md` (its Agnostic paragraph) and in the
  plate reader's scar list. Call C4's rule: a mention used as a rule's present-tense example is re-worded to the class;
  a dated incident told with its numbers stays as told. The skeptic's definition is also left unedited on purpose, so
  this pull request's cold review is not by an agent whose definition it changes (workflow step 14).
- The dated records under `.claude/skills/vellum-footguns/references/`: history, never rewritten.
- "a narrow viewport read in the harness" in `CLAUDE.md`'s table, workflow step 3, the implementer's reading list and
  the plate reader's settle-doctrine pointer: still true, since `FL1`, `DN6` and `DR11` read windows below 1024 and the
  notice suite emulates a phone. (Call C7.)
- ui-design's "A control's font size does not go below 16px in the corner chrome", whose reason is iOS Safari's zoom
  on focus. Whether a tablet's Safari, or a phone's on the shrunk page, still zooms on focus is UNVERIFIABLE here; the
  rule costs nothing to keep and a wrong deletion costs a zoom on every focus. (Call C8.)
- ui-design's history examples naming a phone (the dark pool over a phone sheet; PR #565's Gallery at a phone page and
  the status pill at phone width, which print rules still measure because paper is not the screen): they assert
  nothing about today's layout, in paragraphs this sub does not otherwise touch. (Call C9.)
- settle-doctrine clause 14's "inherit a phone viewport", its harness bullet and its raw-call note: CURRENT.
- `handbook/specs/site-architecture.md` and `handbook/specs/explorer-doctrine.md`: CURRENT.
- `assertLaidOutAt`'s message in `scripts/design/shoot.ts` ("under phone emulation a page with no viewport meta tag
  lays out 980px wide"): still a true hint for a page without the tag.

## Tests

The doc edits carry no test (call C13): nothing in this repo sweeps a claim in markdown
(`handbook/specs/conventions.md`), a unit test does not search prose (`handbook/specs/check-placement.md`), and a width
named in a sentence is not a construct a lint rule can read. A backticked path is held by
`test/repo/prose-paths.test.ts`, and every path this plan adds exists today.

- **T1** (menu item 1, recommended answer): `test/repo/design-kit.test.ts`'s "every page is shot at a desktop and a
  narrow desktop viewport ... (... the 390 row is the narrow layout a zoomed desktop still gets)" becomes "every page
  is shot at a desktop window and at 1024, the narrowest the site is laid out for": names `*-1024.png` and
  `*-1024-head.png`, heights 800 and 768, `mobile` false. Red first: the test changed and `VIEWPORTS` not, so it reds on
  the names assertion (`atlas-390.png` where `atlas-1024.png` is wanted). Mutations: the row's width back to 390 reds
  the names; its height alone (768 to 844) reds the height assertion. T1 is a changed guard, so `vellum-guard-prover`
  gets its one round on it. Under answer B the test pins one row of five names; under answer C only its title and the
  settle-doctrine sentence change, and no guard changes.

## Evidence

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`).
- `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`: every gate's text found, every size probe under
  the bound.
- `node --test test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/design-kit.test.ts`.
- `npm run build`, then `node scripts/design/oracle.ts dist out/764/oracle`: every shot lays out at the width asked
  (`assertLaidOutAt` throws otherwise), and the 1024 row's probe reads `cw` 1024 and `sw` 1024. One browser, one page at
  a time; not an e2e lane.
- Already run in phase one and re-run for the body: the wide-box probe (`764-probe-wide.ts`, `764-probe-site/` in the
  scratchpad), and the four oracle-row stills (`out/764/oracle-row/`, `shootAll` over `764-oracle-shots.json`: the
  FAQ at 390 reads `cw` 390 and `sw` 1024, at 1024 both 1024).
- `grep` sweeps pasted in the body: no width query in any sheet or page; and every remaining hit of
  `grep -rn -E '\b(390|320|360)\b' handbook/specs .claude/skills/vellum-footguns/SKILL.md .claude/agents CLAUDE.md`
  named (history, a print measurement, or not a width).
- No e2e suite is touched, so none is run locally; CI runs every lane.

## Rosters and doctrine this drags

- No new file, page, sheet, suite, spec or bundle, so no roster joins (Gate 4 does not bind).
- The plan is archived at `handbook/plans/764/764-plan.md`.
- **An agent definition changes** (`vellum-plate-reader`), so the PR body says which version of the definition wrote
  the change and which reviewed it (workflow step 14). The plate reader does not review this pull request; the cold
  skeptic and the prover run on definitions this change leaves alone.
- **Gate text changes** (Gate 1 item 11, Gate 3 item 3): the hook reads gate text from the launch checkout, so the new
  text binds sessions launched after the merge; nothing in this change alters the hook's code.

## What a lane dispatched after the merge does differently

- Writing CSS (Gate 3, pasted on the first `.css` or `.astro` edit): renders at 1024 and 1280 (and at 640 under the
  recommended answer to item 2), never at 390.
- `vellum-plate-reader`: reads overflow only at 1024 and up, treats a sideways scroll below 1024 as the design and
  checks it the way `FL1` does, touches charts on a 1024 tablet, and defaults to Gate 3's widths.
- The design oracle shoots 1280 and 1024 (recommended answer to item 1), so a before-and-after sweep compares the
  whole page at its narrowest rather than its left 390 pixels.
- A session reading the rulebook finds desktop-only stated as product direction, with its accepted costs (menu item
  4, answer A).
- A lane running now keeps the copy it launched with.

## Merge with Issue #801

This plan edits no file Issue #801 owns, and not `handbook/specs/site-architecture.md`. If that lane touches any file
this plan does, its edit merges first; this branch then takes `git merge origin/main`, keeps both, and re-runs check,
lint and test.

## Open decisions for Alex (the step 6 menu)

1. **The design oracle's second row** (Issue #763's K12). Today 1280x800 and 390x844 as a desktop window; at 390 the
   shot is the left 390 pixels of the 1024 page (`out/764/oracle-row/`). A: 1024x768 (recommended). B: 1280 only. C:
   keep 390.
2. **The widths a change to the look is rendered at** (Gate 3 item 3; the plate reader's default by C6). Today 390 and
   1280. A: 1024 and 1280, and 640 for a piece to keep its 1024 seat (recommended; `FL1` reads a fixed list of pieces,
   `PIECES` in `e2e/suites/corners/floor.ts`, so a new piece is unread there). B: 1024 and 1280 only.
3. **The rulebook's nav revisit trigger**, "three or more wrapped lines at 360px", which a lane's call on Issue #668
   kept and Alex left standing on 2026-10-03 (issuecomment-5968839385, item 8), and which cannot fire since
   2026-10-06. A: restate it at 1024, "the nav no longer clearing the room's corner on one line at 1024 at the
   browser's default text size" (recommended); since the nav never wraps, that is the event that turns `CO1` red,
   so the trigger fires as a failing check the day a new nav item does not fit. B: drop the width clause, leaving "an
   eighth surface scheduled for it". C: leave it as written.
4. **A desktop-only line in the rulebook's Product direction** (E2). No spec states the direction or the two costs
   Alex accepted for it (search ranking; sideways scroll under browser zoom). A: add E2's text (recommended). B: add
   the direction alone, without the costs. C: add nothing; the epic's comments stay the only record.

## Plan skeptic's findings, and what was done with each

1. BLOCKING, E2's "no layout is built for a phone" would settle Issue #778 early, cites one date, and repeats the
   number: folded. E2 is scoped to width, cites both dates, points at ui-design for the number, and is menu item 4.
2. SHOULD-FIX, the wide-box trap is false in a staged chart room, whose body clips: folded. The trap is split by the
   body it lands in, the plate reader's overflow check gets the same exception, `FL1`'s reach is narrowed to a page
   at rest, and the PR body labels each measurement by its body.
3. SHOULD-FIX, `P20` checks the pointer, and no check holds the definite width: folded. E1 cites `P19` alone, as a
   height cap, and claims no guard for the width.
4. SHOULD-FIX, the accepted costs of search ranking and zoom reflow live only in Issue #760's comments: folded, into
   E2's recommended text and E1's "a desktop window zoomed until it is narrower than 1024 included".
5. SHOULD-FIX, C6 points the plate reader at a gate the hook never shows it: folded. The definition carries the widths
   and names Gate 3 item 3 by path as their home.
6. NIT, menu item 3 misattributed the trigger and did not say what option A costs: folded.
7. NIT, E8 must keep the sentence `KEPT` in `test/repo/memory-pointers.test.ts` holds: folded, word for word.
8. NIT, the archived copy's header predated the skeptic: folded by copying the plan again after these edits.

## Calls (each open to overrule)

- C1. (Moved to menu item 4.)
- C2. ui-design's width paragraph is rewritten where it stands, pointing at the room section and site-architecture,
  rather than moved.
- C3. Three cascade traps whose only instance went keep their lessons in general form; none is deleted.
- C4. An Issue #219 mention used as a rule's example is re-worded to the class (`CLAUDE.md`, cascade-traps); a dated
  incident narrative stays (pr-skeptic, the plate reader's scar list).
- C5. Gate 1 item 11 drops "Narrow-width or" and keeps its both-sides clause.
- C6. The plate reader defaults to Gate 3 item 3's widths.
- C7. "a narrow viewport read in the harness" stays in the reading lists.
- C8. The 16px input floor stays.
- C9. ui-design's dated phone examples stay.
- C10. Errata and open issues made moot are Issue #765's; nothing about a phone held upright is ruled here (Issue
  #778).
- C11. "held to BOTH widths" (Issue #633's 390 and 320) becomes "sized for no copy in particular", with `P19` named as
  the height cap and no guard claimed for the width.
- C12. The oracle's 1024 row is 768 tall, an iPad held sideways (under item 1's answer A).
- C13. No guard for the doc edits.
- C14. The wide-box trap is re-measured, split by the body it lands in, and rewritten; its numbers live in the PR
  body, each labelled by the body it was taken on.
- C15. The inexact `fitStage` citation in ui-design is an errata row, not a fold.
