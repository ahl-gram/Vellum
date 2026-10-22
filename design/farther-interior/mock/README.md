# Issue #950 round: the code that drew it

Throwaway design-round code. Nothing here is served, bundled or type-checked by the repo. It reaches into `../../../src` for the real engine, and it ran from the designer's tree `.claude/worktrees/design-950` at `cbf57b8f`, writing to the main checkout's `out/950/` through the `DELIVERY` constant in `common.ts`. Replaying it from a copy elsewhere imports whatever engine sits three folders up from it, and writes over that folder.

In the order it ran, each from the tree root:

1. `node out/950/mock/make-copies.ts` writes `region-copy.ts` and `chain-copy.ts`, the region pipeline with its seams opened (`hooks.ts`), from the engine's own files by exact replacements.
2. `node out/950/mock/selfcheck.ts` proves the copies draw today's close-up byte for byte with no hook (`measure/selfcheck.txt`).
3. `node scripts/region-detail/sweep.ts --seeds=42,7 --bands=1,2`, run from `out/950/instrument/`, and then `node out/950/mock/check-instruments.ts`, prove the copied instruments in `instruments.ts` read what the committed ones read (`measure/instrument-check.txt`).
4. `node out/950/mock/sweep-places.ts` chooses the places (`measure/places.tsv`, `measure/places.json`). Its "sea edge" turned out to be a lake shore, so `node out/950/mock/sweep-sea-edge.ts` chose the open-sea edge again and added it to `measure/places.json` (`measure/sea-edge.tsv`).
5. `node out/950/mock/build.ts` draws every plate into `svg/` and writes `facts.json`; `node out/950/mock/build.ts sea-edge-on-the-open-sea-23-shore-at-world-cell-106-47` drew the open-sea place into the same files afterwards.
6. `node out/950/mock/measure-arms.ts` and `node out/950/mock/summarize-arms.ts` measure the river arms (`measure/arms*`); `node out/950/mock/cost-warm.ts` their cost with the chain held (`measure/cost-warm.*`); `node out/950/mock/inherit.ts` what carving inside the chain hands down (`measure/inherit.txt`); `node out/950/mock/river-towns.ts` the river towns against the drawn rivers (`measure/river-towns.txt`); `node out/950/mock/straight-coast.ts` the straight coast at depth (`measure/straight-coast.*`); `node out/950/mock/tier-monotone.ts` the finer tier from band 5 to band 6 (`measure/tier-monotone.txt`); `node out/950/mock/coherent-lattice.ts` rivers ending on dry land over the sweep's own lattice windows (`measure/coherent-lattice.txt`).
7. `node out/950/mock/live.ts`, then `node scripts/design/shoot.ts <delivery>/live/shots.json --site <tree>/dist` after `npm run build` in the tree, photographs and measures the live site (`live/`).
8. `node out/950/mock/pages.ts` writes the contact sheets and the shot lists; `node scripts/design/shoot.ts <delivery>/pages/shots-sheets.json --site /Users/ahl/CodeProjects/Vellum` and the same for `shots-stills.json` take the stills.

The files:

- `common.ts`: constants (the delivery folder, the seeds, the grid, the render width) and small helpers.
- `course.ts`: each world river's course through a window, as runs in region grid coordinates.
- `corridor.ts`: the corridor a world cell either side of a course, and the ground's fine relief.
- `reroute.ts`: river arm A.
- `carve.ts`: river arm B, its carve and its water stage.
- `hooks.ts`, `make-copies.ts`, `region-copy.ts`, `chain-copy.ts`: the forked pipeline arm B draws through.
- `farmsteads.ts`: the finer tier (the breakdown's bold suggestion).
- `sheets.ts`: one close-up three ways, and its render.
- `instruments.ts`: the committed instruments, copied.
- `sweep-places.ts`, `sweep-sea-edge.ts`, `build.ts`, `measure-arms.ts`, `summarize-arms.ts`, `cost-warm.ts`, `inherit.ts`, `river-towns.ts`, `straight-coast.ts`, `tier-monotone.ts`, `coherent-lattice.ts`, `check-instruments.ts`, `selfcheck.ts`, `live.ts`, `pages.ts`: as above.
- `devcheck.ts`, `devdebug.ts`, `devtier.ts`, `devdouble.ts`, `devlake.ts` and `../probe-fields.ts`: the working checks the round was built on (the arms tuned, the doubled band-3 river and the lake read); they print, or write only into the tree's own `out/950/dev/`, which is not delivered.

No file calls `Math.random` or reads the clock for anything a still shows: `performance.now` times the `ms` fields only. Nothing formats by locale.
