# Issue #1155 mockups: the guide page

Throwaway design-round code. Nothing here is served, bundled or type-checked by the repo. It ran from the worktree `.claude/worktrees/designer-1155`, detached at `089881ad`, against that tree's own built site (`npm run build`, then `dist/`), and wrote to the main checkout's `out/1155/` (the `OUT_1155` constant in `paths.ts`, overridable with `OUT_1155=`). Its relative imports (`../../../src/...`) read that tree's engine and site code. No source file was edited: every direction is CSS and a few elements laid over the real built pages by a shot's script.

The pages it laid over were served from a folder of links in the tree, `out/1155/site/`: one link per entry of `dist/`, plus `round`, a link to the main checkout's `out/1155/`, so an injected page could show the round's own pictures. That folder is not copied here.

Files:
- `paths.ts`: where it reads and writes.
- `ladder/`: the guide's data, the authoring shape (`shape.ts`), the Explorer's ladder (`explorer.ts`), every other room's (`rooms.ts`), the reading order and the route-tree seating with the `untaught` check (`guide.ts`), and each step's doing and outcome (`done.ts`).
- `drive.ts`: the page-side waits and actions, every wait a bounded count of 100 ms ticks.
- `sweep-seeds.ts`, `explore-probe.ts`, `inventory.ts`: the measurements behind the seeds and the words.
- `check.ts`: the drift check prototype, with its motion and mutate arms.
- `landings.ts`, `pictures.ts`: every step done for real, and the pictures cut from those stills.
- `primer.ts`, `inject.ts`, `schoolroom.ts`, `chart-of-lessons.ts`: the directions.
- `shots.ts`, `top-row.ts`, `extra.ts`, `sheets.ts`, `ladder-md.ts`, `fetch-refs.ts`: the stills, the nav measurement, the floor and dress stills with the slip and trail-press measurements, the contact sheets, the ladder's text and the references.
- `home-pip.ts`, `pip-sweep.ts`: the guide's pip on home (Alex's N7), drawn at three moorings and swept over every free seed-42 place.
- `sitting-links.ts`: the longer link list Alex asked for, `links.md` and `links.html`.
- `growth.ts`, `contrast.ts`: the route-tree check run on four cases, and the added inks against the 4.5:1 floor.

Nothing reads the clock, draws a random number or formats by locale (a grep of these files for `Math.random`, `Date.now`, `new Date`, `performance.now` and `toLocale` finds none). The engine and site modules it imports are `src/world/generate.ts`, `src/itinerary/route.ts`, `src/layouts/nav.ts` and `src/layouts/atelier-chart.ts`. `chart-of-lessons.ts` calls `Math.cos` and `Math.sin` to place the waypoints; no direction here would ship into `src/prospect/`, so the prospect byte pins do not reach it.
