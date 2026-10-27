# Plan for #590, Sub 5 of epic #585: additions to the specs that already exist

Branch `chore/590-process-specs` in worktree `agent-a6043a6db9152c734`. Base: `origin/main` at
`c29e4c8` (merge it in before the first edit). Prose only. No `src/`, no test, no `CLAUDE.md`,
no new spec file, no chart movement, no regen.

## The four files, and what lands in each

### 1. `specs/ui-design.md`

Additions go INSIDE the sections that already exist, never as a trailing pile.

**The chart's own dress**
- Which dress knobs are tokenized and which are deliberately inline: per-style border tokens are
  the style's, while a realm name's contrast and its type size are set inline on the element,
  because per-element data has no honest stylesheet default. (Cross-checks the palette section's
  existing "per-element data goes inline" line rather than repeating it.)
- Ink arms hatch the FIELD, after Petra Sancta: one pattern per field tincture, ids scoped by the
  document's existing suffix so many arms share one sheet without collision, each tile opening on
  an opaque paper rect so nothing bleeds through, charges kept on the grey value ladder because a
  stroke-drawn device shatters at small sizes and an argent charge disappears. The pattern defs are
  emitted only on the hatching dress, which is what keeps every colour dress byte-identical.
- The realm tint is worn by two dresses only, and where it is off, the wash, the seat halo and the
  legend swatch all go with it: they are one dress decision, not three. (DRESS half only.
  `specs/engine-invariants.md` already rules that realm count is a world property and that the
  style flag decides only whether the layer draws; that half is not restated.)
- The sea beast claims the arena AFTER the settlements and the feature labels, never inks over
  land, and escalates full label to name alone to glyph alone, searching near its haunt and then
  the whole sheet before it drops. (Placement half only. `specs/engine-invariants.md` already rules
  the beast a view option and already rules that the anonymous sea-decor serpent stands down where
  a beast draws; neither is restated. Joins the existing arena paragraph beside the river rule.)

**Motion and ceremony**
- A one-shot ceremony is triggered by a host-applied CLASS, never by the hidden attribute, because
  restoring display starts the animation afresh and a hidden-gated rule replays on every toggle.
- The class retires when nothing is animating, on the animation end plus a no-running check, AND
  deterministically at the top of the host's own draw. (Joins the existing "a one-shot ceremony
  needs its own guard rather than an end event" line, which states the need and not the recipe.)
- The voyage ship is the only plan-view object on the sheet, which is why a profile glyph flips
  east to west and tilts rather than rotating: a profile glyph has an up, and a full rotation lays
  it on its beam ends on a northward leg. (The DESIGN reason only. The tilt constant itself is
  already ruled in `specs/region-and-voyage.md` as a ruled look with a bound behind it, so it is
  neither re-cited nor re-explained here. Verified: that file carries the constant, and it carries
  nothing about why the glyph flips.)

**Gesture**
- A real tap fires the compatibility hover and focus events BEFORE its click, and the tap's own
  press light-dismisses an open auto popover, so a tap toggle needs the hover and focus paths to
  stand down on a touch-primary machine plus a close recorded on the synchronous twin: the
  popover's toggle event is queued asynchronously and lands after the click; its beforetoggle
  twin is synchronous.

**Colour, contrast and legibility**
- Sample the ground UNDER the ink, not beside it: isolate the glyph pixels by rendering the ground
  without the copy and diffing, sample the ground in a small halo around those pixels, take the
  worst case, and make the guard model that same ground. A number measured beside the text is a
  number about a different place. (Joins the existing median-of-a-wide-run rule, which says how to
  sample a run and not where to sample it.)

**Print**
- A plate on a page the reader is meant to SAVE AS PDF carries no `loading="lazy"`, because a lazy
  plate below the fold snapshots blank. Rewritten after the cold read, twice over. It is a
  PROHIBITION, not an instruction to add an attribute: `plateFigure` in
  `src/site/print-room/plate-markup.ts` emits `<img src alt>` with no `loading` at all and takes the
  eager default, so "eager-load a bound plate" described nothing authored. And it is SCOPED to the
  printed page: `specs/rulebook.md` ratifies `loading="lazy"` for the atlas download document, which
  is a heavyweight embed a reader scrolls rather than prints, and the workflow spec says the
  rulebook wins where the two disagree. The rule names that boundary instead of leaving two opposite
  instructions about lazy plates standing.
- Save-as-PDF fidelity is not headless-automatable: an e2e may assert a non-empty file and a
  plausible page count, and page breaks, margins and clipping owe a manual pass in two browsers.
- A plain data-URI link is REFUSED from a real file origin, so a take-home document links its
  plates to a blob built by script at load; a link to a blob never doubles the file.

**The room and its furniture**
- DROPPED, and it must be: the two-column table of contents. A LIVE GUARD REFUSES IT.
  `test/site/glossary-sections.test.ts` line 137, "the broadside stands beside the index at 22rem
  columns, and no TOC dress survives", asserts `!/columns:\s*2/` over each page sheet with the
  message "the #353 two-column TOC box stays retired", and line 117 pins that the index slip
  replaced the hand-authored contents list. `grep -rn '\.toc' public/` is empty. Writing this row
  would put a rule in the spec that a test bans. Its surviving idea (a list that FLOWS in columns
  rebalances itself where a grid sized for today's entries spills) folds into the multi-column index
  entry below, whose live subject is the broadside at `column-width: 22rem`.
- The legend row never takes a real padding: its seat gives it its width, and a padding wraps the
  roads. (Ruled constraint with an e2e behind it.)
- On a phone the Glass stands down while the bottom sheet is open, as a KIT rule and not a page
  one, so a new chart room inherits it.
- A new component's CSS goes in its OWN sheet, and joining the sheet rosters is never the reason to
  fold it into an existing one. Fold only if a separate sheet breaks something or costs
  performance. (Sits beside "the kit is lifted at second use". Swept against
  `specs/site-architecture.md`, which rules a PAGE's own sheet and the shell's single dressing but
  not a COMPONENT's. Written with an explicit pointer, so the PR does not commit the defect it
  legislates against: WHICH rosters a new sheet joins and what each costs is
  `specs/site-architecture.md`'s and is not restated here.)
- Derive a clearance from the panel-width token, never from a literal, because a page may
  legitimately redeclare it. (Written as the design consequence only; the redeclaration mechanism
  belongs to `specs/site-architecture.md` and is not restated.)
- A chart room without a stage scrolls its content under the fixed chrome, so it pools every piece
  of chrome rather than the cluster alone, and its vignettes do not ride a scrolling page: a fixed
  darkening band washes out whatever passes through it.
  **This is an AMENDMENT to ratified text, not an addition, and the plan names the two sentences it
  rewrites.** (a) "No band, no footer: a chart room does not scroll" gains the stageless carve-out,
  because a chart room with no stage is the case that does. (b) The pooling sentence's condition,
  "when the reader is zoomed in, or the room does not scroll under its chrome", is restated to match
  what the kit actually does: `public/atelier.css` pools for `body:has(#map-viewport.zoomed)` AND for
  `body.chart-room:not(:has(.stage))`, in one rule, so the second arm is the stageless room, not a
  room that does not scroll. Left as an appended bullet the section would contradict itself twice.
- A multi-column index puts its entries LEVEL across columns, so a reading spy that takes the last
  entry above the line in document order marks the wrong column. Take the entry nearest the line
  from above, ties to the earlier, bounded below the section head.

**The voice**
- The ratified shape of a glossed section is a small band of terms, with over-cap sections named as
  exceptions; a section under the floor is fine, because the floor binds only the sections that
  introduced it. (NO count: the constant and the exceptions are named, the numbers are not.)
- A homograph takes the period form: one headword whose senses run together.
- Culture sections are ordered alphabetically, not in the roster's own order.

**How the cascade breaks here** (the section that collects exactly this class)
- A flex item defaults to `min-width: auto` and refuses to shrink below its content width, so a
  control row overflows a narrow viewport even though every rule in it reads as correct. Zero the
  item's own minimum; where the row still cannot fit, let it wrap as well. Found only by measuring,
  since the page's own width reads clean until it is rendered narrow.
  CORRECTION taken from the repo, not the source row: the row says the shipped fix was BOTH halves.
  It is not. `public/reading-frame.css` carries `min-width: 0` on the range and no `flex-wrap`
  anywhere in the file, so the rule is written as the mechanism plus the two levers in order, and
  does not claim both were needed at that one site.
- A percentage max-height dies inside an auto grid track; no-JS containment uses an absolutely
  positioned box with auto margins against a definite one.
- A sticky box is clamped inside its containing block: pulling a sticky cap into a scroll
  container's padding with a negative margin slides it to the content-box top, over the first
  items. Make the cap the spacer itself and hit-test items rather than reading their rects.
- A full-bleed absolutely positioned handle over a sheet head kills anything authored beneath it,
  so a control in that head takes its own stacking layer.
- A shown popover renders in the TOP LAYER, which no z-index reaches, so a scrim cannot dim one:
  popovers stand down with the scrim.
- The head cluster pins its own line-height, because a page sheet sets the body's for reading.
- An absolutely positioned box wider than a phone viewport makes the browser widen the LAYOUT
  viewport to fit it; clipping overflow does not stop that sizing. Cap the box.
- When an engine-dressing rule is the one losing a cascade, the opt-out may NOT be written into the
  host's own sheet: `specs/explorer-doctrine.md` already rules that engine dressing is edited in the
  one shared sheet and never in a host's. So the repair is to the rule that is losing. (Written as
  the cascade consequence with a pointer, NOT as a second copy of that rule.)

**The rooms / accessibility invariant, written ONCE, in one phrasing**
- A click over an inert subtree retargets to its nearest LIVE ancestor, so the one thing an inert
  set owes is that **every member sits INSIDE the scrim host's subtree**. A member outside it
  retargets to something that is not the scrim and is dead with no way out. Painted extent is a
  separate, visual matter: a fixed wash may sit off an inert region the page has scrolled without
  harm, because the body is that region's host too. This is the single phrasing, taken from the one
  at `src/site/shell/wiring.ts` that survived the skeptic; the killed gloss "the scrim covers
  exactly what goes inert" does not appear, not even as explanation. RESIDUE to name: once the spec
  carries the invariant, that comment is a candidate for the next comment sweep, and this sub
  touches no `src/` file so it stays.
- A scrim that rides the page belongs where the chrome rides the page, and a scrim that is
  absolutely positioned is the mirror defect on a room, whose chrome is fixed. Which shape belongs
  where follows the chrome.

**One pointer line, at the palette join**, in the wording #588 ruling 3 constrains: the "a new
colour goes in both places" rule holds for colours, and the exception for a token that is not a flat
colour is a DERIVATION carried by `specs/site-architecture.md` (Tokens outside the palette join).
The phrase "the three-place join" is NOT used: it belongs to `test/atlas/document.test.ts`, which
uses it in its own title, and `specs/site-architecture.md` already says it is not this file's
wording for the colour rule.

**One pointer edit**: the Surveyor's Glass entry in the four-corners list keeps its furniture
description and hands the seat mechanics to `specs/explorer-doctrine.md` (The camera, the gesture
and the fit), which is now the normative home for "seated as a sibling of the stage".

### 2. `specs/rulebook.md`

**Golden and committed-chart discipline** gains the three named golden-safe levers, each stating
"no regen, no golden re-pin":
- A render GATE that only region sheets pass: a region-only render edit changes region sheets
  without moving a committed chart or the golden. Growing a world-sheet label would owe a full
  regen and lands alone.
- A DOM ATTRIBUTE whose scope is the whole idle-parity question: nothing else writes it, it is
  DOM-only, and the baked sheet string is never touched.
- A module that is RENDER-ONLY BY CONSTRUCTION: never imported by the generator or the namer, and
  holding no rng, so it can neither re-roll nor move the golden.

And the re-roll's hand-fixed tail, in the GOLDEN section's re-roll bullet where a session about to
pay for one reads it: hand-authored copy quoting the hero world by name is not covered by any regen
script and is edited by hand in the same change. Verified live: `src/pages/index.astro` carries "The
Atlas of Rahai" and `README.md` names seed 42's culture draw. The cost-axis section already says
"forces a showcase regen plus caption edits", so the addition names the README half and the
procedure, and the cost-axis summary is left alone rather than duplicated.

Levers verified with commands, not taken from the ledger: the render gate is
`world.region !== undefined` selecting `REGION_FONT_SIZE` in `src/render/layers/settlements.ts`; the
DOM attribute is `data-ink`, written and removed only in `src/site/living-chart/chronicle.ts` from
the pure predicates `glyphRevealedBetween` and `inkGradeFor` in `src/render/chronicle-scrubber.ts`,
with `lastSvg` in `src/site/explorer/app.ts` never touched; the render-only-by-construction module
is `src/society/philology.ts`, which `src/world/generate.ts` and `src/society/names.ts` do not
import.

**Durable engineering constraints** gains:
- The comment citation convention: cite a `symbol` in a full repo-relative `path`, never a file and
  line, because a symbol survives code movement and breaks exactly when a citation should, and
  because basenames repeat under `src/`. The guard that enforces it has two deliberate traps
  (it matches a symbol that APPEARS in the file rather than one declared there, and it matches
  JOINED comment runs rather than single lines) which are not to be simplified away, and it checks
  the citation and never the claim around it.
- The corrected parameter-property note: Node's strip-only limits still hold, but the typechecker
  refuses a parameter property here before Node is ever involved, because the repo sets
  `erasableSyntaxOnly`.

**A new section: the comment sweep.** How a sweep is run and proved here.
- The trailing comment is the highest-value keeper class, and a whole-line diff cannot see it:
  stripping a comment off the end of a surviving code line shows as a changed code line. Sweep
  trailing comments last and most conservatively, and never audit a sweep from a whole-line scan.
- The proof is an AST token-stream comparison against the base, per file, with three traps it must
  handle or it lies: exclude the JSDoc kind range, strip the Astro markup comment form, and never
  use the scanner, which mis-lexes regex literals and backticks. Prove the verifier on fixtures
  before trusting it. Reindentation is its one acceptable blind spot, and a comment inside a
  template literal is string data, out of scope by construction.
- A keeper scan is a separate step the token verifier cannot do: scan the DELETED text for keeper
  signals (a measured number with a unit, a hand measurement, a ratified deviation, a byte-identity
  claim) and check the fact survives somewhere in its file. CSS is the weakest area, because no
  unit test pins why a rule is written a given way.
- Every deletion made on the "a test already pins this" rule NAMES that test, in a ledger written
  while the grep is still open. It cannot be reconstructed afterwards, and the one confirmed keeper
  loss came from a group that filed a ledger naming a test that did not pin the behaviour.
- Merge order when a sweep collides with a feature branch: merge the FEATURE first, then merge main
  into the sweep and re-run its token verifier. A comment-only branch absorbing feature work is
  re-provable mechanically; a feature branch absorbing a sweep costs a full e2e run and can
  silently lose a measured value.

**How to read and update this file** gains the routing rule and the prescriptive-voice rule:
- Where a rule lives: anything Vellum-specific, normative and slow-changing is a spec; an imperative
  keyed to the moment of typing is a `vellum-footguns` gate; an incident whose value is proving a
  gate bites is that skill's scar record; fast-changing empirical traps, private infrastructure and
  status stay out of the repo. Where the repo holds the normative copy, the other copy POINTS.
  Exactly one home is normative.
- Specs are prescriptive: state the rule in the imperative and drop the provenance. No "ratified
  at", no dated story of how a wording was reached. KEEP the `symbol` in `path` citations and keep
  naming a constant where the rule is about its value: those are what make a rule checkable in one
  grep.

**Retired rules, do not resurrect** gains the import line: importing the rulebook into `CLAUDE.md`
with an `@` line was tried and reverted the same day, because it put the whole rulebook in front of
every session for a file only some sessions need. Trim first if it is ever revisited.

**How a design decision is made** gains the ruled process lessons the six steps do not cover.
The issue calls them three; only TWO are new. Dispatch the cold skeptic on the archive pull request
and the plate-reader on the mock pages, because both have found real defects there; and a mock
inherits the live kit's defects unless it says otherwise. The third, "every collectible survey is
antique", is already ratified in `specs/ui-design.md` at the dress-gates-the-engine rule, so it is
NOT restated here.

**Retired rules**: the nav-tax sentence is SCOPED. "Adding a page is one `.astro` file plus one
`src/layouts/nav.ts` entry" gains a few words saying it prices the READING-page kind, and points at
`specs/site-architecture.md` for what a working page that mounts a bundle owes. (`specs/site-architecture.md`
already names #590 as the fix for this, so it is required, not optional.)

**Roster lists**: the siblings-under-`specs/` paragraph and the closing companion footer each gain
`engine-invariants`, `explorer-doctrine`, `region-and-voyage` and `site-architecture`, in the ruled
`CLAUDE.md` order, with the same one-clause descriptions `CLAUDE.md` uses.

**Pointer edit, with the resulting text written out**, because the keeper sits BETWEEN two of the
three clauses being removed and "not touched" is not a mechanism when the edit is "delete around
it". Today the bullet runs: same-draw clause, "static, never live" clause (citing `paintVersoTrack`),
`#status` clause, one-object-URL clause. After the edit it reads, in one bullet:

> **Verso (#116, #174):** `#status` must be empty at rest, because the draw settle and e2e
> `waitSettled` both key on it. The overlay's own rules (the ghost and its overlay from one draw,
> the overlay static and never live, one ghost object URL minted and revoked per redraw) are
> `specs/explorer-doctrine.md`'s, under Overlay lifecycle.

The `#status` clause STAYS because #587 call 6 cut it from explorer-doctrine precisely on the ground
that the rulebook already holds it, so this file is its normative home. The `#sheet-inner`
shared-transform rule under cross-epic coordination is untouched too, by #587 call 1.

**RESIDUE**: the `paintVersoTrack` citation (`src/site/explorer/verso.ts`) is lost by this edit.
`specs/explorer-doctrine.md`'s copy of "static, never live" cites `renderVerso` instead and carries
no painter symbol. Named in the PR body as a candidate one-line addition to that file, not folded
here, since it is Sub 2's file and already merged.

**Also scoped in the same edit**: "This file is normative and complete. A reader who reads only this
file is correctly informed about the rules." That sentence cannot survive a PR that turns three of
its clauses into a pointer AND writes the routing rule ("exactly one home is normative, the other
points") three paragraphs below it. It gains the carve-out: complete on the rules it owns, and
pointing where another spec is the home.

**Not touched in the golden and committed-chart section**: the derivation question is discharged by
#588 ruling 2 (option A, the rulebook stands, the memory row is dropped by the orchestrator). The
issue's one "Open decision for Alex" needs no ruling.

### 3. `specs/development-workflow.md`

- **Step 3**: the required-reading sentence gains `engine-invariants`, `explorer-doctrine`,
  `region-and-voyage` and `site-architecture`, with the trigger phrasings `CLAUDE.md` already uses.
- **Step 9**, beside the hook's once-a-session behaviour: the hook reads its gate text from the
  LAUNCH checkout, so a session standing in a worktree is shown the main checkout's gate, not its
  branch's.
- **Step 10**: REWRITTEN after the cold read. The drafted version waived a requirement that does not
  exist: step 10 already scopes to "the e2e suites the change touches", and no spec, `CLAUDE.md` or
  gate asks for a full local sweep anywhere, so a waiver would make the file read as though the
  sweep had been the default. What survives is the reporting half, which IS absent: **name which
  checks ran**, so "tests pass" is never read as "the whole suite passed locally", and CI is the
  full-suite gate. The saved time does not transfer to skipping the prover or the plate-reader.
- **Step 10**, beside it: written as the PROCEDURE, with the claim about GitHub's internals dropped,
  per #589's ruling 4 that an unprovable assertion is not asserted. When main moves under a branch
  whose tests pin measured values, merge main locally, run the suite, abort the merge, and put the
  combined-state result in the PR body, because a reviewer reading only the branch's CI is reading a
  run against the old main. No sentence claims what a green mergeable verdict does or does not mean.
- **Step 14**: the "agent roster is fixed at launch" claim is DROPPED. No command in this repo
  settles it, and #589 ruling 4 is the precedent. The verifiable half of the same fact is already
  covered by the step 9 line above, which `.claude/settings.json` demonstrates.
- **Near steps 15 and 16**: an integration PR takes no review commits. A long-lived epic branch
  merging to main treats the cold skeptic's report as documentation with dispositions (already
  recorded on a sub, parked on a ratified future sub, or new and worth a follow-up issue), not a fix
  queue, because every commit on it already ran the gauntlet on its own sub PR. Written as a plain
  prescription with no narrative. Its warrant is a ruling, not a command, and there is no epic-branch
  PR in recent history to demonstrate it, so the PR body marks it UNVERIFIABLE from the repo.
- **A new short section beside step 17**, covering two sweeps the per-sub recon rule does not reach:
  after a big epic lands, spec-recon every OPEN epic and sub written before it, one recon per issue,
  each returned draft posted as a dated re-baseline comment, then the open decisions put to Alex and
  ruled as a set; and a review sitting's own ledger owes a recon too, with its docket built by
  grepping every sub and PR of the epic for the deferral words rather than from one issue's
  comments.
- **Process gotcha**: an epic links its subs by body checklist, shared label and board membership,
  never by native sub-issues, so the board shows epic and subs as flat peers and the prose is the
  structure. Trust the prose over the flat board.
- **Counts**: the "Three other places" numeral STAYS. Re-read: that list names `specs/rulebook.md`,
  the footguns skill and `CLAUDE.md`, which is a list of what this file is not about, not a spec
  roster, so the four new specs do not join it and the numeral does not change. Only step 3's
  required-reading sentence grows.

### 4. `specs/flake-record.md`

Into "How to use it": the class of transient failure that is re-run rather than recorded, written
narrowly so it cannot be read as a licence for anything else. **Held until Alex rules**, because as
the issue words it the addition contradicts two live statements, both verified:

- The NEWEST row in this same file, added by PR #602 on 2026-09-14, records exactly such a failure
  (`lane A launch`, `HARNESS ERROR (exit 2)`, no check run, disposition "open, no issue").
- `vellum-footguns` Gate 2 item 10 reads "**Give it a row in `specs/flake-record.md` BEFORE you
  re-run**", and this file's own intro points at that gate line as the reason it exists.
- The FIRST bullet of the very section the addition goes into already reads "**A red you believe is
  a flake gets a row before you re-run anything.**"

So the ruled-safe shape is a RECOGNITION class, not an exemption: the failure is identified by its
symptom (a browser lost at launch before any check runs, or a deploy-side failure that a fresh
dispatch clears rather than a re-run), a row is still written, and what the class buys is that the
single permitted re-run is not owed a defect hunt first. If Alex instead wants a true "do not
record" class, that is a change to Gate 2 item 10 as well, which is #591's file, not this lane's.

## The menu for Alex

Three decisions and two confirmations. Nothing is edited until they are relayed.

**Q1. The look-and-feel spec grows by about a third. One file, or split it?**
`specs/ui-design.md` is the longest house spec at 362 lines. This lane routes roughly thirty rules
into it. ESTIMATE, not a measurement: it finishes between 465 and 500 lines. Yesterday on the
Explorer spec the same proportion made Alex split one file into two rather than accept the size.
Whether that standard binds a file that already EXISTS is ruled nowhere.
- A. One file. Every rule lands in the section it belongs to; the lane reports the measured size in
  the PR body, and if it lands past the ruled proportion it comes back. RECOMMENDED: ui-design has
  an established address that `CLAUDE.md`, the rulebook, the workflow spec and the implementer agent
  all point at, and a split would move that address in a lane forbidden to touch `CLAUDE.md`.
- B. Split the craft half ("How the cascade breaks here") into its own spec. Shorter files, but it
  needs a `CLAUDE.md` line this lane may not write, so it leaves a loose end for a follow-up.
- C. Trim: keep only the rules that would change a future decision and leave the rest in the private
  notes. Shortest file; some rules stay unwritten and unreadable by any reviewer.

**Q2. When the build machine dies before any test runs, do we still write it down?**
The issue asks for a line naming the broken-build failures you simply re-run instead of recording.
Three live statements say the opposite: the first bullet of the very section it joins ("a red you
believe is a flake gets a row before you re-run anything"), the gate line that section points at
("give it a row BEFORE you re-run"), and the newest row in the file, which is exactly this class and
was recorded.
- A. A RECOGNITION class, not an exemption: name the symptom so it is identified on sight, still
  write the row, and what the class buys is that the one permitted re-run is not owed a defect hunt
  first. RECOMMENDED: it fits all three live statements and costs a minute.
- B. A true exemption for this class. That is also a change to the footguns gate line, which the
  parallel lane owns, so it has to be relayed to #591 as well.
- C. Add nothing; the private note is dropped instead.
Whichever way this goes, it must reach #591: the two files point at each other here.

**Q3. Should the world-generation spec point at the finer-view spec?**
Two rulings from yesterday disagree, minutes apart.
- 01:15:28Z, this issue's first amendment: this lane adds one cross-reference.
- 01:20:56Z, #586 ruling E: the detail chain is dropped from `specs/engine-invariants.md` "and no
  forward reference to the other file is added". Executed as written; the file has none today.
- 01:51:54Z, the epic's split comment, and 01:51:59Z, this issue's second amendment: both re-point
  the cross-reference at `specs/region-and-voyage.md`, so both presume it exists.
- A. Add the one line. RECOMMENDED: the two newest statements presume it, and a pointer is a
  signpost rather than level-of-detail material, which is what ruling E was protecting.
- B. Add nothing, following ruling E's literal words. A reader of the generation spec asking about
  finer views finds nothing there.

**C1. Confirmation, not a question: "no counts in these files" reads ADDED LINES ONLY.**
A whole-file ban is unsatisfiable: `specs/ui-design.md` already carries nineteen lines with a
spelled numeral and the rulebook carries several more, all written before this work. #589's call 3
ruled the identical question inside this epic a day ago, the same way. Say so only if you want it
different.

**C2. Confirmation: the rulebook's roster edit touches the two places the amendment names**, its
sibling paragraph and its closing line. There is a third list in that file, an opening "five other
places carry what this one does not". It is a where-else-to-look list rather than a spec roster, so
it is left alone and named as residue in the PR body. Say so only if you want all three.

## Tests

**None, and none is owed.** The change is four markdown files; nothing in this repo sweeps markdown
(the rulebook says so itself). No `vellum-guard-prover` run: there is no new or strengthened guard
to prove. The issue's own Process section says the same.

## Evidence commands

- `npm run check` (type check, unaffected but named because the issue's acceptance asks for it).
- `npm test`, then `npm run astro:generate` to restore the generated assets the suite deletes.
- Citation verification, per citation, before it lands: `ls <path>` for every path, and for every
  symbol a DECLARATION grep (`grep -n 'export .*<symbol>'` or the declaring form), not a bare
  appears-in-file grep, which is the first of the two blind spots this same PR writes into the
  rulebook. Any CSS claim is swept over `src/` as well as `public/`, since authored CSS lives in
  page style blocks and generated sheets too. The issue warns that one known-bad citation is in the
  source rows, so assume others.
- No-em-dash sweep over the diff.
- No-count sweep, scoped to ADDED lines, per #589's call 3 on the equivalent sweep: the rulebook
  already carries several counts ("Five other places", a percentage, a membership set, a ratio) and
  a whole-file ban is unsatisfiable without rewriting lines this sub does not own. Pre-existing
  counts on lines I am already editing come out; the rest are named as residue.
- Public-safety sweep over the diff before the push: no home paths, no `route12b`, no board,
  project or field ids, no token scopes, no personal name other than Alex, nothing from another
  business.
- `git diff --stat` and a line count per file, reported.

## Rosters and doctrine this change drags

- `specs/rulebook.md` siblings paragraph and closing footer (mine).
- `specs/development-workflow.md` step 3 required-reading sentence (mine).
- `.claude/agents/vellum-implementer.md` reading list item 4: adds `engine-invariants` and
  `site-architecture` ONLY. The #587 lane already added `explorer-doctrine` AND `region-and-voyage`,
  verified by reading the file.
- `CLAUDE.md`: untouched, by ruling C on #586 and by this issue's "Not in this sub".
- `.claude/skills/vellum-footguns/`: untouched, Sub 6's (#591).
- `specs/settle-doctrine.md`: untouched. #589 widened its descriptions and Sub 5 re-reads those
  lines rather than editing them (third amendment item 2), which also means merging AFTER #598,
  already on main.
- `specs/engine-invariants.md`: a cross-reference to `specs/region-and-voyage.md` is asked for by
  the first and second amendments and REFUSED by ruling E on #586. See the menu.

## Filed, not folded

`specs/rulebook.md`'s #122 sentence says that epic "sits behind an opt-in `annals?: boolean` render
option and is byte-identical when off". Verified: `grep -rn annals src/render/ src/cli/` returns
nothing, and #122 is still open, so the sentence describes a planned option as though it shipped.
Out of this sub's scope (it is a chart-tier claim, not a roster or a routed row). A sibling defect
is FILED, per Gate 5, and named in the PR body.

## Merge and conflict posture

Merge `origin/main` at `c29e4c8` before the first edit. The parallel lane #591 owns
`.claude/skills/vellum-footguns/SKILL.md` and `references/scars.md`; no file overlaps. TWO places
the two lanes must agree, both named in the report:

1. The comment-sweep section here versus any comment gate line there: this file states the METHOD,
   the gate states the moment.
2. **The flake-record re-run class versus Gate 2 item 10.** `specs/flake-record.md`'s own intro
   already reads "`vellum-footguns` Gate 2 item 10 says a red is yours until proven a flake and must
   never be silently re-run away; this is where the proof goes." A re-run class written here
   QUALIFIES a sentence that points at a gate line #591 owns, so whatever Alex rules on the
   flake-record question has to reach #591 as well as this lane, or the two files ship disagreeing
   inside one pair.
