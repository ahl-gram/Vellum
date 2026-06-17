# Vellum Implementation Roadmap

A phased plan for working through the open GitHub issue backlog across multiple
sessions. Generated 2026-06-16 from a two-lens triage of all 16 open issues: one
pass scored every issue for **feasibility / ease of implementation** (verifying
each issue's claims against the real code), a second scored every issue for
**creative leverage** (what compounds and changes what Vellum *is*), and the two
were merged into the priority grid and phasing below.

To see any issue's full detail: `gh issue view <n>` from the repo.

## Priority grid

Both axes are 1 to 5, higher is better. Ease folds in the determinism contract
(see "Cost model" below); leverage rewards compounding and shareability, not
isolated wow.

| #  | Issue                          | Ease | Leverage | Role |
|----|--------------------------------|:----:|:--------:|------|
| 16 | Gazetteer lore repetition      | 5    | 2        | Quick win (easier than its issue claims) |
| 12 | Accessibility (SVG title/desc) | 5    | 2        | Quick win, pair with #14 |
| 14 | Embed recipe in SVG            | 4    | 3        | Quick win, identity pillar, pair with #12 |
| 7  | Site header menu               | 5    | 1        | Hygiene, do while in the docs pages |
| 1  | Ocean-current streamlines      | 4    | 3        | Quick win, but isolated (compounds with nothing) |
| 10 | Nautical atlas plate           | 4    | 3        | Quick win, rides with the atlas epic |
| 13 | Social cards + favicon         | 4    | 3        | Quick win, marketing, shares a helper with #3 |
| 9  | Mountain-label legibility (bug)| 4\*  | 2        | Halo tier easy; real knockout fix is harder |
| 20 | Heraldry / arms & banners      | 3    | 5        | **The hinge: marquee-shareable AND additive/standalone** |
| 3  | Seed-of-the-day page           | 3    | 4        | Marketing flywheel |
| 17 | Name de-duplication            | 3    | 3        | The one true seed re-roll: a deliberate event |
| 6  | Explorer "bind as atlas"       | 2    | 4        | Atlas-epic keystone (narrower than it sounds) |
| 2  | Atlas PDF export               | 2    | 4        | Capstone (harder than its issue claims) |
| 18 | Thematic plates                | 2    | 5        | Highest leverage of the heavy features (also harder than claimed) |
| 5  | Explorer Web Worker            | 3    | 1        | Invisible plumbing; only as a #6 enabler |
| 19 | Ages of the World              | 1    | 5        | The destination, not the starting line |

\* #9 ease is split: 4 for a halo/casing bump, 2 for the real glyph-knockout fix.

## Cost model: the seed re-roll

Vellum's true cost axis is not size, it is the **seed re-roll**. Additive work (a
new render layer that forks its own label, a pipeline stage appended last, SVG-head
metadata) is byte-changing but seed-safe and cheap. Only **#17 forces a full
re-roll** of every saved name, which means regenerating the showcase (`npm run
site`) and hand-editing the hero captions plus the README sample. So #17 is a
single deliberate PR (code + regen + caption fixes together), never sprinkled in.
**#19** is append-only (no re-roll) but still changes seed 42's rendered output and
rewrites lore, so it also needs a showcase refresh.

## Three corrections from reading the code

The feasibility pass verified the issues against the source and found three places
where the issue's self-estimate is off. These change the plan:

1. **#16 is easier than written.** The cycle-through dedup it asks for already
   exists in `src/society/lore.ts`; the real task is just expanding the
   3-to-6-entry note pools to 12-16, and it forces no hero-caption edits.
2. **#18 is harder than written.** "Just generalize `hypsometricLayer`" is wrong:
   that layer paints iso-rings, not per-cell fills, so vegetation and population
   choropleths need a brand-new painter. The simulation data is done; the rendering
   is not.
3. **#2 is harder than written.** `rasterizeSvg` screenshots one SVG; a bound PDF
   needs a new `--print-to-pdf` invocation over the atlas HTML, not a reuse.
   Conversely **#6 is narrower than it sounds**: the renderer is already
   browser-safe, so only the HTML string-builders need extracting.

## The two lenses, head to head

Stripped to opening moves, the two passes proposed opposite starts:

- **Feasibility-first:** #16, #12, #14, #7, #10, #1 (cheap, additive, no re-roll).
  Pro: safe, fast momentum, zero determinism risk. Con: defers every
  transformation; the product would not feel different for weeks.
- **Creativity-first:** #19, #18, #20, #6, #3, #2 (transformation up top). Pro:
  maximal payoff, executes the stated "world with a history" arc immediately. Con:
  starts cold on the two largest, showcase-affecting, worst-ease features.

Neither wholesale. The reconciliation is the phased plan below: bank the cheap
additive wins, bridge immediately to #20, and build *toward* #19 rather than
opening on it.

## Recommended phased plan

### Phase 0 - Clear the decks (days, not weeks)
**#16, #12 + #14 (the SVG-head pair), #7.** All additive or seed-safe, all
low-risk; #14 quietly strengthens the "reproducible from the number in its corner"
identity.
- Pro: momentum with zero determinism risk.
- Con: housekeeping plus one identity pillar, nothing transformative.

### Phase 1 - The headline feature: #20 Heraldry
The one item both lenses rate highly. The only creativity-5 issue that is fully
additive and standalone (new fork, new render layer behind `--arms`, no re-roll),
and its tincture/charge logic is unit-testable (fits the test-first rule).
- Pro: the most screenshot-and-post-able artifact in the backlog, shippable with no
  heavy scaffolding.
- Con: the SVG drawing is real M-to-L work, and the banners pay off even more once
  #6/#2 exist to surface them.

### Phase 2 - The atlas epic, keystone-first
**#6** (extract the composer) unlocks the cluster, then **#18** (thematic plates)
with **#10** (nautical plate) riding along, **#5** slipped underneath #6 for
smoothness, and **#2** (PDF) as the capstone.
- Pro: maximum compounding; puts heraldry and everything else in front of the web
  audience.
- Con: the heaviest cluster; #18 and #2 each cost more than their issues admit
  (budget for the new painter and the new PDF path).

### Phase 3 - The marketing flywheel
**#13** (social cards, near-pure reuse of `rasterizeSvg`) then **#3**
(seed-of-the-day, shares a hero-render helper with #13). Best after Phases 1-2 so
the previews and daily worlds show off the new richness.
- Pro: recurring-visit and shareable-link growth that compounds with everything
  shipped.
- Con: #3 is a new page; neither transforms the product alone.

### Phase 4 - The destination: #19 Ages of the World
Creativity's #1 and feasibility's last, which is why it goes here. The "map
generator to world-with-a-history" leap; it manufactures the narrative fuel every
surface has been starving for. Do it after #16 has patched lore, since #19 subsumes
#16.
- Pro: the transformation.
- Con: the largest feature, touches the most code, needs a showcase refresh.

### Slot opportunistically
- **#1 (currents):** easy and beautiful, but compounds with nothing. Do it whenever
  a nautical-polish beat is wanted; not a priority.
- **#9 (label bug):** do the halo/casing tier as a quick legibility cleanup; defer
  the real glyph-knockout fix unless it keeps biting.
- **#17 (name de-dup):** its own deliberate re-roll PR (code + `npm run site` +
  caption/README fixes in one PR). Optional: land it in the same release window as
  #19, which also needs a regen, to pay the showcase tax once, at the cost of
  coupling a small fix to a big feature.

## Bottom line

Start with Phase 0, make **#20 your first real feature**, treat **#6** as the
gateway to the atlas value, and build *toward* **#19** as the destination. #17 is
the only item needing special re-roll handling whenever it is done.

## Progress tracker

Update as work lands. `[x]` done, `[~]` in progress, `[ ]` not started.

- Phase 0 (done: branch `phase-0-quick-wins`, 2026-06-16)
  - [x] #16 Gazetteer lore pools
  - [x] #12 Accessibility (SVG title/desc + Explorer aria)
  - [x] #14 Embed recipe in SVG
  - [x] #7 Site header menu
- Phase 1
  - [ ] #20 Heraldry / arms & banners
- Phase 2
  - [ ] #6 Explorer "bind as atlas" (keystone)
  - [ ] #18 Thematic plates
  - [ ] #10 Nautical atlas plate
  - [ ] #5 Explorer Web Worker
  - [ ] #2 Atlas PDF export
- Phase 3
  - [ ] #13 Social cards + favicon
  - [ ] #3 Seed-of-the-day page
- Phase 4
  - [ ] #19 Ages of the World
- Opportunistic
  - [ ] #1 Ocean-current streamlines
  - [ ] #9 Mountain-label legibility (bug)
  - [ ] #17 Name de-duplication (deliberate re-roll PR)
