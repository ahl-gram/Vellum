# Issue #1256 mockups: the chart of lessons

Throwaway design-round code. Nothing here is served, bundled or type-checked by the repo. It ran from the design tree `.claude/worktrees/designer-1256`, detached at `94ad4392`, against that tree's built site (`npm run build`, then `dist/`), and wrote to the main checkout's `out/1256/` (the `OUT` constant in `paths.ts`, overridable with `OUT_1256=`). Its relative imports (`../../../src/...`) read that tree's site code. No source file was edited: each direction is an SVG and a stylesheet laid over the real built Primer by a shot's script.

The pages were served from a folder of links in the tree, `out/1256/site/`: one link per entry of `dist/`, plus `round`, a link to the main checkout's `out/1256/`. That folder is not copied here.

Files:
- `paths.ts`: where it reads and writes, and the sha.
- `states.ts`: the two seal states, written under the real key, and the room the page opens on for each.
- `layout.ts`: where each lesson's waypoint, or each room's ring of steps, stands round its place, and the rule each grows by.
- `labels.ts`: where each place's name stands.
- `chart.ts`: the chart itself, every answer of the menu a parameter, and the open room's card.
- `dress.ts`: the paper and dark dresses, the card and the three seats, over the house's tokens.
- `inject.ts`: the shot scripts that lay a direction over the page, and the probe every still carries.
- `spec.ts`: every still, by question and option, and the baseline (my recommendation for every question).
- `shots.ts`: the two passes of shot lists, full stills then crops cut where the first pass measured.
- `measure.ts`: contrast and the route's crossings, and the shot lists for the link probe and the hypothetical growth.
- `tables.ts`: the measured tables read back from the shooter's results.
- `sheets.ts`: the contact sheets.

Nothing reads the clock, draws a random number or formats by locale. `layout.ts` calls `Math.cos` and `Math.sin`; no direction would ship into `src/prospect/`, so the prospect byte pins do not reach it.
