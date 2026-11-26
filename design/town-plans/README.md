# Town plans

The design round for Issue #793, the town planner, Sub 1b of Epic Issue #753 (the engraved prospects): how a world's capitals, realm seats, towns and villages each take a plan of their own from their ground, whether their streets follow the land or a grid, how a wall meets the water, how built up a town is and what a plan and its plates may weigh, and how the bird's-eye and the skyline read the plan.

- **Drawn:** by `vellum-designer` on 2026-11-25, from a tree detached at `236d7565`, origin/main that day. Every still is real engine output at that commit, drawn by the round's own code beside this file, and every PNG was shot through the shared camera (`scripts/design/shoot.ts`). The places were chosen by `measure/sweep.ts` over seeds 1 to 40 and 42.
- **Ruled:** by Alex on 2026-11-25, in two sittings relayed by the orchestrating session: the menu that ordered the round (Issue #793 comment 7179424246) and the round's own six rulings (Issue #793 comment 7181779471); and on 2026-11-26, on the fold of the round into the build's plan, the budget taken again and this archive's name and contents (Issue #793 comment 7192821132).
- **Built to by:** Issue #793's build, which ports the planner in `planner/` into `src/prospect/town-plan/`, streets with the land only; Issue #755 (Sub 2, the bird's-eye), which draws the plan inside the real coast, rivers and roads; the later sub in which the profile takes its skyline from the plan; and Issue #1492, the plan from directly above as a plate of its own. The post-use re-review is Issue #796.
- **Kept:** the round as it ran, every still and contact sheet, the measurements, the notes and the code, as Alex ruled for this archive (Issue #793 comment 7192821132, D3: "the whole round is archived except the six reference photos and the generated delivery page").

Everything here is the round as it ran. Nothing is edited to match the build or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`).

The notes, the code and the shot lists name the round's delivery folder in the main checkout, out/793/, which is gitignored; a path they give under out/793/ names the same file under this directory. The code ran from the designer's tree, and its imports (`../../../src/...`) read the engine of whatever checkout it stands in; `OUT_ROOT` in `mock/root.ts` sends its output to the main checkout's out/793/ unless `OUT_793` is set, so replaying it as committed draws against today's engine and writes over that folder. It is neither type-checked nor linted: `design/` is outside `tsconfig.json`'s include and the lint's roots.

## What is in the archive

- **`notes.md`**: the designer's notes as they stood when the menu was put: what to look at first, the controls, the places and why each, the menu of six items with the still each option was shown with, what was measured, what is ruled and what is not ("For whoever builds it"), what could not be drawn truthfully, and the bold choices that were the designer's own.
- **`stills/`**: 140 SVG plates as the drawers wrote them and 79 PNG shots: for each of the seven places, from directly above (`plan-*`), in the bird's-eye (`bird-*`) and as a skyline (`prof-*`), in the antique and ink dresses, each as today's look (`*-control-*`), streets with the land (`*-land-*`) and streets on a grid (`*-grid-*`); the lean houses (`*-lean-*`), the wall open to the water (`*-open-*`) and the plan at the land's own width (`*-true-*`) where the menu asked; the full-scale and twice-size crops (`full-*`, `crop-*`); and the eleven contact sheets (`sheet-*.png`), the capital of seed 42 first.
- **`sheets/`**: the twelve pages the contact sheets were shot from, their shot list (`sheets/shots.json`) and its results (`sheets/shots-result.json`). The pages link the stills by relative paths and the house faces through `design/kit/fonts.css`, so served from this repository's root they show every picture.
- **`planner/`**: the planner as it ran, both street systems (`planner/streets-land.ts`, `planner/streets-grid.ts`), with the sitting's switch between them, and `planner/types.ts`, the plan's shape.
- **`mock/`**: the drawers (from directly above `mock/plan-view.ts`, the bird's-eye layer `mock/birdseye.ts`, the skyline `mock/profile.ts`, the houses `mock/houses.ts`, the gate names `mock/names.ts`, the band 4 and 5 close-up control `mock/closeup.ts`) and the harness that drew the stills and the sheets (`mock/build.ts`, `mock/sheets.ts`, `mock/places.ts`, `mock/root.ts`).
- **`ccam/`**: the archived bird's-eye mock C of `design/prospects-after-braun-hogenberg/mock/`, ported so it runs at `236d7565`; `ccam/shared.ts` holds the three functions copied verbatim from that archive, and `measure/port-check.ts` shows the port draws the archived C plates byte for byte.
- **`measure/`**: every measurement, each with its log: the sweep that chose the places (`measure/sweep.ts`), agreement with the world's roads and rivers (`measure/agree.ts`), plate bytes (`measure/bytes.ts`), houses per kind (`measure/houses.ts`), the founding split behind the designer's by-age option (`measure/founding.ts`), the profile's width against the land's (`measure/widths.ts`), determinism (`measure/determinism.ts`) and the C port check (`measure/port-check.ts`).
- **`sizes.json`**: every still's bytes and render time, and every plan's size.
- **`lint.config.ts`** and **`lint-witness.ts`**: how the round ran `vellum/prospect-libm-clock-free` over its own code, and the witness that the run can fail.
- **`refs/`**: `refs/NOTES.md`, what each reference plan taught, and `refs/refs.json`, each one's page, original address, pixel size and licence field (5 public domain, 1 CC BY-SA 2.0, Palmanova). **`refs-tool/`**: the script that fetched them.

## What the archive leaves out, on purpose

- **The six reference scans** under out/793/refs/ (aigues-mortes.jpg, bern.jpg, cologne.jpg, freiburg.jpg, palmanova.jpg, valletta.jpg; 12.5 MB), as `handbook/specs/conventions.md` says a round keeps its references: by link. `refs/refs.json` gives each one's page, and `refs/NOTES.md` still names them.
- **The round's page**, the delivery's generated index.html (0.6 MB), which links every file by the delivery's layout. This README replaces it.

## The rulings, as ruled

Each as the comment that records it gives it, beside the stills it was ruled from.

From the menu that ordered the round (Issue #793 comment 7179424246):

> 1. **The design round comes first, as this issue orders.** The house designer draws candidate town layouts (streets that follow the land, and streets on a grid) for real places in real worlds, each from above, from the high bird's-eye and as a skyline, beside today's look; Alex rules from those stills, the round is archived under `design/`, and only then is the planner's drawing half folded and built.
> 2. **The planner covers the four kinds a world map holds**: capitals, realm seats, towns and villages (1,051 places over seeds 1 to 40 and 42 in the planner's count). Hamlets, farmsteads and mills, which appear only on close-ups, are left out.

From the round's sitting (Issue #793 comment 7181779471):

| ruling | as ruled | ruled from |
|---|---|---|
| 1 | "**Streets follow the land (A).** Not the grid (B), and not the designer's by-age split." | the A column of each `stills/sheet-<place>.png`; `stills/crop-plan-land-capital-laukuwelua-antique.png` |
| 2 | "**The wall is closed at the water too**, keeping the wall a closed ring." | `stills/sheet-shore.png`; `stills/crop-plan-land-capital-laukuwelua-antique.png` against `stills/crop-plan-land-open-capital-laukuwelua-antique.png` |
| 3 | "**Lean density, with the designer's proposed budget**: wider houses, more gaps and open yards (about half the houses); 460 KB per bird's-eye plate, 240 KB per profile and 1,950 points per plan, the round's measured worst cases plus 5%, which the fold re-sweeps over every world before writing a bound." Taken again, below. | `stills/sheet-detail.png`; `stills/crop-bird-land-lean-capital-laukuwelua-antique.png` |
| 4 | "**The skyline reads the plan at today's width** (keep, church, gaps and the climb from the plan; about 10% more bytes), for the later profile sub." | the middle column of `stills/sheet-profile-width.png` |
| 5 | "**The planner's placement rules stand as drawn**: towns walled and villages open; one wall shaped to the land; a gate wherever a road crosses the wall; the market pulled toward the gates and the quay; the keep on the height; the church near the market; a bridge wherever a street crosses the river, with a lane and bridge added where none does; the quay nearest the market; villages along their road." | every place sheet, `stills/sheet-<place>.png` |
| 6 | "**The town from directly above becomes a plate of its own later**, filed as its own issue." That issue is Issue #1492. | every "From directly above" row of the place sheets |

Ruling 3's limits, taken again after the fold swept them wider (Issue #793 comment 7192821132, D1):

> **D1, option (a): the size limits hold for every town.** The round set 460 KB per bird's-eye, 240 KB per skyline and 1,950 points per plan from pictures of 3 worlds; swept wider (seeds 1 to 40 and 42, and the capitals of seeds 43 to 300) all three are passed (plans up to 2,192 points, bird's-eyes up to 553 KB, skylines up to 245 KB). They stay as hard limits: the planner trims a plan's block outlines just enough to fit 1,950 points (only 7 capitals change; no place in the ruled stills or the 41 worlds does), and Issue #755 and the later skyline sub hold 460 KB and 240 KB by standing fewer houses on the heaviest towns (a capital with no houses is at most 280 KB and 181 KB).

It was ruled from stills this archive does not hold, the delivery out/793-budget/ in the main checkout: seed 181's capital from directly above and in the lean bird's-eye, as the round's planner draws it at 2,192 points and trimmed to 1,948, and seed 29's capital as drawn, which the trim leaves alone.

## Found after the sitting

- **The budget's numbers do not hold over every world.** The fold's re-sweep (Issue #793's build plan, archived with the build under handbook/plans/700/793/) drew every place of seeds 1 to 40 and 42 as ruled: the lean bird's-eye of seed 29's capital in the ink dress weighs 476.6 KB and seed 16's profile 241.2 KB, against 460 KB and 240 KB; the plates in `measure/bytes.log` covered seeds 42, 7 and 19 only, and the notes' 439 KB worst case is the antique dress alone (its ink twin, `measure/bytes.log`, is 491 KB for the grid and 437 KB with the land). Past seed 42 the capitals of seeds 43 to 300 reach 2,192 points, 552.7 KB and 245.1 KB. How the budget is held is the re-take above.
- **The profile from the plan stands the full houses**, not the lean tier: `planGeometry` in `mock/profile.ts` calls `housesOf` with its default detail. The 240 KB the notes propose rests on that.
- **The planner's type imports do not all resolve**: `planner/plan.ts` and `planner/network.ts`, among others, import the type `P` from `planner/types.ts`, which does not export it. Node strips the types and the code runs; a type check would refuse it. The build imports `P` from its geometry module.
- **The drawers' streams carry the street system in their names** (`mock-houses:<index>:<direction>:<block>` in `mock/houses.ts`, `mock-birdseye:<index>:<direction>` in `mock/birdseye.ts`), so a drawer built to these stills reproduces their gaps and heights only on a stream named with `land`.
