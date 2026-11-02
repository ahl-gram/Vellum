# Issue #428 plan: the place card's road to the Wayfarer's Ribbon, shown only where a road leaves

**Planned at**: `origin/main` `313858a2a6ee63df61930bd530c0030fa2283153` (fetched again after the rulings; main had not moved); Issue #428 read with 7 comments, the newest the rulings comment 6574680225 (2026-11-02).

**Rulings**: Alex, 2026-11-02, https://github.com/ahl-gram/Vellum/issues/428#issuecomment-6574680225, on the four questions of this plan's step 6 menu:
- **Q1 = A: build it now, ahead of the painted ribbon.** This sets aside his 2026-09-03 order that Sub 9 (Issue #511) comes first; there is no code dependency, and the link lands on today's plain scroll until the painted one ships.
- **Q2 = B: choose now from words.** No design round and no picture spike; the look is measured after it is built (`vellum-plate-reader` at step 11) and stays provisional until he has used it. A post-use review is owed (under **Evidence**).
- **Q3 = A: "Take the road".**
- **Q4 = B: second, right under "View the prospect".** The two roads sit together and "Lay the prospect on the table" moves to the bottom, so the Tab key reaches the road before the filing press, and the keyboard check CD57 is re-aimed. This overrides the planner's recommendation (last) and Issue #522's two-button order at the bottom of the card.
- The comment also confirms that the look stands as this plan's calls: gold, the hover tip, the class `pc-ribbon`, the stand-down by `style.display`, world sheets only.

**Open decisions**: none.

## What the issue is now

- **Narrowed by Alex, 2026-09-03** (https://github.com/ahl-gram/Vellum/issues/428#issuecomment-5533955105): the Ribbon stays out of the nav; the place card gains a link to the Ribbon, **road-gated**: "the place data gains a has-roads flag, the link shows only where it is true (the Prospect's `roads` precedent from PR #500), and the card is measured before the PR". The nav question is closed here.
- **The nav question was answered again and built since**: Issue #513 (closed 2026-09-23) became Epic #667 (closed 2026-10-17). `/ribbon/` is a child of `/explorer/` in `ROUTE_CHILDREN` (`src/layouts/nav.ts`), named by the trail and drawn on the chart of the atelier (`PLACES` in `src/layouts/atelier-chart.ts`). Both of those link a bare `/ribbon/` (`src/layouts/AtelierChart.astro` line 21, `BaseLayout.astro` line 123), so they open today's world and its capital, never the reader's world or town. Nothing here touches the nav.
- **The card is measured at 1024 and 1280 plus one 640 window**, not the body's 390 (Issue #765 Q3, https://github.com/ahl-gram/Vellum/issues/765#issuecomment-6040489689; `vellum-footguns` Gate 3 item 3).
- **The order of work**: the epic's 2026-09-03 ledger (https://github.com/ahl-gram/Vellum/issues/426#issuecomment-5533986114) put Sub 9 (Issue #511, the painted ribbon, still open) before this sub; Alex set that aside for this sub on 2026-11-02 (Q1 above). No code of Issue #511 is needed by this plan, and no file this plan touches is one Issue #511 names.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract" (the engine takes its links from the host as injected functions; ids are the host's), "Overlay lifecycle" (the bullets "A place link is world-sheet only", "A card is CAPPED to that box", "A pinned card sits right after its town in the DOM ... A refill keeps the action row in place"), "The address is a photograph" ("a forwarded hash is passed verbatim and never re-serialized"; "A written world is spelt by its sentence alone").
- `handbook/specs/engine-invariants.md`: "Engine outputs a consuming surface must respect", the paragraph "A ribbon result substitutes the capital's departure without announcing it ... any surface offering 'the road from X' owes a check that X has a road, and carries that answer". This plan is that check for the card.
- `handbook/specs/ui-design.md`: "The voice" (a road out names what it opens), "Gesture" ("A hover gesture promises navigation"; "A tip on an inline element needs `display: inline-block`" and `vertical-align: top`), "Colour, contrast and legibility" (4.5:1, measured).
- `handbook/specs/cascade-traps.md`: the bullet "An author `display` beats the user-agent `[hidden]` rule".
- `handbook/specs/rulebook.md`: "The cost axis" (this is cheap and additive: site and manifest only), "Golden and committed-chart discipline" (no chart byte moves: the manifest is not stamped into any SVG).
- `handbook/specs/check-placement.md`: the unit suite and the browser lanes, and "A plan prints a browser check's reading on its fixture and its reading under the mutation".
- `handbook/specs/settle-doctrine.md`: clauses 3 to 6 (a settle is a poll that throws; departure; the predicate never carries the claim), "When a check is pulled out of the run" ("What a step holds", "Who finds a slow step").
- `handbook/specs/conventions.md`: "How a design decision is made" (feel rulings are provisional and named as such in the PR), "The fidelity rule", and the comment rules (one long line, only where no test pins it).
- `handbook/specs/site-architecture.md`: "A suite is one entry file ... A suite with parts keeps its entry there and puts the parts in a folder of the same name"; "Some rosters close themselves and some do not".

## The design

1. **The flag.** `PlaceMark` (`src/render/place-manifest.ts`) gains `readonly roads: boolean`, computed in `buildPlaceManifest` with exactly the predicate the Ribbon uses for its own setting-out list (`options[].roads` in `ribbonResultFor`, `src/site/explorer/ribbon-job.ts`) and the Prospect uses for its road out (`prospectResultFor`, `src/site/explorer/prospect-job.ts`): `roadReachable(world, roadMask(world), idx).length > 0`, from `src/itinerary/route.ts`. One builder makes every manifest (the world draw in `worker.ts` and the inline path in `worker-client.ts`, the region draw, home's build-time stage), so the flag is everywhere a `PlaceMark` is, and the card, the Prospect and the Ribbon cannot disagree about which places a road leaves.
2. **The target.** `ribbonTarget(hash, idx)` in `src/site/explorer/address.ts`, mirroring `prospectTarget` beside it: the chart's hash rides through verbatim, `a=<idx>` is appended, no `b`. The Ribbon then picks the farthest road-reachable destination itself (`farthestReachable` in `ribbon-job.ts`).
3. **The seam.** The host injects `ribbonHref?: (idx: number) => string` exactly as it injects `prospectHref`: `LivingChartHost` (`src/site/shared/living-chart/index.ts`) passes it to `createPlaceOverlay`'s deps (`PlaceOverlayDeps`, `src/site/shared/living-chart/place-overlay.ts`).
4. **The link.** `cardActs` (`src/site/shared/living-chart/place-overlay-card.ts`) builds `a.pc-ribbon` reading "Take the road" once per overlay, only on a world sheet whose host injects `ribbonHref`, and places it SECOND in `.pc-acts`: the row's members are, in order, `a.pc-prospect` ("View the prospect"), `a.pc-ribbon` ("Take the road"), `button.pc-lay` (the filing press, now at the bottom) (Q4 = B). Each time a card is shown, `paintRoad` sets its `href` from the host for the shown place and its `style.display` to `""` where `place.roads` and `"none"` where not. The element stays in the row on every place (a refill keeps the row in place, and the hidden attribute would lose to the sheet's display), so the row always holds three members, roadless place or not.
   - **The Tab order follows the row**: from a pinned town, Tab reaches "View the prospect", then "Take the road", then the filing press. Where the road stands down (`display: none`), Tab skips it and goes from the prospect link to the press. The first Tab from a pinned town still lands on the prospect link, so P31 and its sibling in `e2e/suites/cards/hold.ts` (which assert `active === "pc-prospect"`) are untouched; CD57's one Tab into the press is re-aimed to start from the road (item 22).
5. **The host.** The Explorer (`src/site/explorer/app.ts`) injects `ribbonHref: (idx) => ribbonTarget(location.hash, idx)`. The Reading Room injects nothing and keeps a linkless card.
6. **The dress.** `.pc-ribbon` shares `.pc-prospect`'s rule and its hover tip (gold, rotate on hover and focus), by adding it to both selector lists in `src/styles/shared/living-chart.css`; the tip roster entry in `scripts/lint/sheet-motion.ts` is rewritten to the new selector list.
7. **The checks.** Unit: the flag against the Ribbon's own list (U1), the target (U2), the card's link (LP2 re-pinned to the new order, LP5, LP6). Browser: the Explorer card's road (PB1c, PB1d, in a new part of the prospect suite beside PB1 and PB1b, which already open that card), the Ribbon's arrival on such a road (RB18), two re-pins that read the row (P16's order, CD25's count, CD25 also widened to read the road's pointer reach), and CD57's keyboard step re-aimed to the new Tab order.

### Alternatives rejected

- **Compute the mask in the card's host instead of the manifest.** Rejected: Alex ruled the flag onto the place data; and the host (`app.ts`) holds only `res.manifest`, never the `World`.
- **A one-pass component labelling of the road mask as the flag's helper.** Measured faster (0.02 to 0.17 ms per world against 0.16 to 0.91 ms, `out/428-dry-run/roads-cost.log`) and agreeing on every place of seeds 1 to 25 and 42, but rejected: it is a second definition of "a road leaves this place" that must be kept in step with `roadReachable` by hand, and the cost it saves is under a millisecond per draw.
- **Compute the flag on world sheets only** (an optional field, or a builder option). Rejected: an optional field makes every read a maybe; region manifests cost 0.04 to 0.45 ms more (bands 5, 3, 1 on seed 42), and their cards never read it.
- **Import the Prospect page's `ribbonTarget` into the Explorer.** Rejected: a cross-page import for a contract that differs (it drops `i`, `year`, `a`, `b`); on a live Explorer hash the two agree anyway, because the Explorer writes none of those keys (`writeHash` in `src/site/explorer/hash-sync.ts`) and a `year=` link forwards to the Reading Room before any card exists (`forwardTarget`).
- **Remove the link from the DOM on a roadless place, or set `hidden`.** Rejected: a refill must keep the action row in place (explorer-doctrine), and `hidden` loses to the sheet's `display` (cascade-traps; measured below under PB1d: the hidden attribute left the link shown).
- **Put the browser checks in the ribbon suite.** Rejected for the card half: the ribbon suite opens `/ribbon/` directly and would pay a fresh Explorer boot; PB1 and PB1b already have that card open.
- **Wait for the painted ribbon (Issue #511) first, as the 2026-09-03 order said; or drop the card's road and close the issue.** Rejected by Alex's Q1 ruling (comment 6574680225): build now.
- **Choose the look from pictures first** (a throwaway spike at step 6 with today's card as the control and four arms, read by `vellum-plate-reader`), **or a `vellum-designer` round.** Rejected by Alex's Q2 ruling: choose from words; the build is measured at step 11 and the look stays provisional until used.
- **"Take the road from <town>" or "Unroll the road".** Rejected by Alex's Q3 ruling: "Take the road". (The town-named form was measured to fit one line on every place of two worlds; that is no longer needed.)
- **The road last, after the filing press** (the planner's recommendation, keeping Issue #522's two-button order and CD57 as it stands). Rejected by Alex's Q4 ruling: second, under "View the prospect".
- **A plain cream dress for the road** (the rooms' convention for a sibling road). Not drawn, since there is no spike; the rulings comment confirms the gold dress and tip (call 7).

## Files

Counted lines are ESLint's `max-lines` count (blank and comment lines skipped), read at `313858a2` with `npx --no-install eslint --flag unstable_native_nodejs_ts_config --no-warn-ignored --rule '{"max-lines":["error",{"max":1,"skipBlankLines":true,"skipComments":true}]}' <files>`. No file below passes 400 and no function passes 50.

**Source**

1. `src/render/place-manifest.ts` (53 counted):
   - `import { roadMask, roadReachable } from "../itinerary/route.ts";`
   - `PlaceMark` gains `readonly roads: boolean;` on the line after `readonly seat: boolean;`.
   - `buildPlaceManifest(world: World, widthPx: number): PlaceManifest`, signature unchanged: `const mask = roadMask(world);` before the `places` map, and each mark gains `roads: roadReachable(world, mask, idx).length > 0,` on the line after `seat: seats.has(idx),`. No comment.
2. `src/site/explorer/address.ts` (39 counted): after `prospectTarget`, add
   `export function ribbonTarget(hash: string, idx: number): string`, body: `const raw = hash.startsWith("#") ? hash.slice(1) : hash; return "/ribbon/#" + (raw ? raw + "&" : "") + "a=" + idx;`
3. `src/site/shared/living-chart/place-overlay-card.ts` (105 counted):
   - `import type { PlaceMark } from "../../../render/place-manifest.ts";`
   - `cardActs(inner, opts, prospectHref, layProspect, ribbonHref: PlaceOverlayDeps["ribbonHref"])`, the fifth parameter new, returning `{ prospectLink, ribbonLink, layPress, acts }`. `ribbonLink: HTMLAnchorElement | null` is built when `ribbonHref && onWorldSheet`: `document.createElement("a")`, `className = "pc-ribbon"`, `textContent = "Take the road"`, no listeners. The row is created when any of the three exists, and its members are appended in the order `prospectLink`, `ribbonLink`, `layPress` (Q4 = B).
   - The comment at the `onWorldSheet` line reads, one line: `// Every card action is world-sheet only: a region manifest renumbers its places (Issue #242), so an inset's index names a different settlement.`
   - New `export function paintRoad(link: HTMLAnchorElement | null, place: Readonly<PlaceMark>, href: PlaceOverlayDeps["ribbonHref"]): void`: returns when `!link || !href`; else `link.href = href(place.idx); link.style.display = place.roads ? "" : "none";`.
4. `src/site/shared/living-chart/place-overlay.ts` (315 counted):
   - `PlaceOverlayState` gains `ribbonLink: HTMLAnchorElement | null;` after `prospectLink`.
   - `PlaceOverlayDeps` gains `ribbonHref?: (idx: number) => string;` after `prospectHref`.
   - `createPlaceOverlay`: destructure `ribbonHref` beside `prospectHref`; in `showPlaceCard`, directly after the `prospectLink.href = ...` line, `paintRoad(placeOverlay.ribbonLink, place, ribbonHref);`; in `buildPlaceOverlay`, `cardActs(inner, opts, prospectHref, layProspect, ribbonHref)` destructuring `ribbonLink` too, and `ribbonLink,` in the state literal after `prospectLink,`.
   - Import `paintRoad` with the other `place-overlay-card.ts` names. `createPlaceOverlay` keeps its existing `max-lines-per-function` disable, which is on the rulebook's accepted skip list; it grows by three lines.
5. `src/site/shared/living-chart/index.ts` (160 counted): `LivingChartHost` gains `ribbonHref?: (idx: number) => string;` after `prospectHref`; `createLivingChart` passes `...(host.ribbonHref ? { ribbonHref: host.ribbonHref } : {}),` after the `prospectHref` spread.
6. `src/site/explorer/app.ts` (398 counted, 399 after): the line-29 import becomes `import { forwardTarget, prospectTarget, ribbonTarget } from "./address.ts";`; in the `createLivingChart({...})` call, directly after `prospectHref: (idx) => prospectTarget(location.hash, idx),`, add `ribbonHref: (idx) => ribbonTarget(location.hash, idx),`.
7. `src/styles/shared/living-chart.css`:
   - The comment above `.pc-prospect` reads, one line: `/* The card's roads out, to the prospect page and to the Ribbon; pointer-events restored because the card box is pointer-events: none. */`
   - `.pc-prospect {` becomes the selector list `.pc-prospect,` / `.pc-ribbon {` with its declarations unchanged (it already carries `display: inline-block` and `vertical-align: top`).
   - `.pc-prospect:hover,` / `.pc-prospect:focus-visible {` becomes `.pc-prospect:hover,` / `.pc-prospect:focus-visible,` / `.pc-ribbon:hover,` / `.pc-ribbon:focus-visible {`, declarations unchanged.
8. `scripts/lint/sheet-motion.ts`: in `TIPPING_LINKS`, the entry `"shared/living-chart.css :: .pc-prospect:hover, .pc-prospect:focus-visible"` is replaced by `"shared/living-chart.css :: .pc-prospect:hover, .pc-prospect:focus-visible, .pc-ribbon:hover, .pc-ribbon:focus-visible"`. Settled by a scratch edit of items 7 and 8 at `313858a2`, restored at once: `npx --no-install prettier --check` passed both files as laid out above; with item 7 alone the tip lint reported the old entry stale and named the new key exactly as written here; with both, the lint passed on both files and `npm test -- test/repo/sheet-motion.test.ts` passed 5 of 5.

**Test support**

9. `test-support/living-chart-hosts.ts` (194 counted): `barlessHost`'s `opts` gains `ribbonHref?: (idx: number) => string;`, passed as `...(opts && opts.ribbonHref ? { ribbonHref: opts.ribbonHref } : {}),` after the `prospectHref` spread.
10. `test-support/living-chart-no-bar-card-fixtures.ts`: `armShow`'s returned object gains `road: () => walk(overlay).find((n) => n.classList.contains("pc-ribbon"))`, with no non-null mark, so a test asserts its presence itself.

**Tests (unit)**

11. `test/render/place-manifest.test.ts` (93 counted): U1, below.
12. `test/render/chronicle-scrubber.test.ts`, `test/render/place-card.test.ts`, `test/render/voyage.test.ts`: each `mark()` factory gains `roads: false,` after `seat: false,`. Nothing else changes. These are the only files `npm run check` reds when the field is added (measured: a scratch edit of the type alone at `313858a2` reported exactly these three plus `place-manifest.ts` itself, `out/428-dry-run/` holds no copy since the edit was restored at once).
13. `test/explorer/address.test.ts` (152 counted): U2, below; `ribbonTarget` joins the import list.
14. `test/site/living-chart-no-bar-card-actions.test.ts` (119 counted): LP2 re-pinned, LP5 and LP6 new, below.

**Tests (browser)**

15. `e2e/suites/prospect/way-in.ts`, NEW part file (the prospect suite's entry stands at 378 counted lines): exports `pb1cRoadOut(ctx: SuiteContext): Promise<void>`, holding PB1c and PB1d.
16. `e2e/suites/prospect.ts`: import `pb1cRoadOut` from `./prospect/way-in.ts`; in `run`, directly after `const href = await pb1WayIn(ctx);` and BEFORE `const errBase = consoleErrors.length;`, add `await step("PB1c to PB1d", () => pb1cRoadOut(ctx));` (its Explorer-side requests belong before the health bases, as PB1's do). The suite's head comment gains no words.
17. `e2e/suites/ribbon/room.ts` (162 counted): `const ORPHAN = 24;` becomes `export const ORPHAN = 24;`; new `export async function rb18CardRoad(k: RibbonKit): Promise<void>`, holding RB18.
18. `e2e/suites/ribbon.ts`: import `rb18CardRoad` beside `rb17PlaceLink`; add `await step("RB18", () => rb18CardRoad(k));` directly after the RB17 step.
19. `e2e/suites/cards/glass.ts`: P16, re-pinned.
20. `e2e/suites/chart-drawer/reads.ts`: `Card` gains `road: { hit: string; inActs: boolean } | null;` after `link`; the `CARD` read gains `const road = document.querySelector("#place-card .pc-ribbon");` beside `link`, and `road: road ? { hit: hit(road), inActs: !!acts && acts.contains(road) } : null,` after `link: ...`.
21. `e2e/suites/chart-drawer/prospect.ts`: CD25, re-pinned and widened.
22. `e2e/suites/chart-drawer/gestures.ts` line 73, in `underHand`: `tabInto(k, "#place-card .pc-lay", "#place-card .pc-prospect")` becomes `tabInto(k, "#place-card .pc-lay", "#place-card .pc-ribbon")`. Nothing else in CD57 changes.

## Tests, in the order they are written

Readings below were taken by the planner on `313858a2`: Node probes run from the planner's tree, and browser probes on the site `npm run build` made there (`out/428-dry-run/build.log`), driven through `start` in `e2e/harness.ts` with the change staged by markup injected into the card's row (a `.pc-ribbon` link carrying `.pc-prospect`'s declarations, injected as a `<style>`). Probe paths are relative to the planner's tree; the dispatcher copies `out/428-dry-run/` to the main checkout.

- `out/428-dry-run/428-pb1c.ts`, run as `node out/428-dry-run/428-pb1c.ts > out/428-dry-run/428-pb1c.log 2> out/428-dry-run/428-pb1c.err`: PB1c and PB1d on exactly the flow below, after PB1 and PB1b's own presses. (`428-pb1c-place1.log` is an earlier run of the same flow at place 1, kept as the record of why PB1c moved to place 2.)
- `out/428-dry-run/428-checks.ts`, run as `node out/428-dry-run/428-checks.ts > out/428-dry-run/428-checks.log 2> out/428-dry-run/428-checks.err`: RB18, P16, the row count and Tab order, and the third action's cost.
- `out/428-dry-run/428-cd25.ts`, run as `node out/428-dry-run/428-cd25.ts > out/428-dry-run/428-cd25.log 2> out/428-dry-run/428-cd25.err`.
- `out/428-dry-run/428-cd57.ts`, run as `node out/428-dry-run/428-cd57.ts > out/428-dry-run/428-cd57.log 2> out/428-dry-run/428-cd57.err`, taken after the rulings on the same build (main had not moved).
- `out/428-dry-run/roads-cost.ts` and `out/428-dry-run/u1-cost.ts`, run as `node out/428-dry-run/<name>.ts > out/428-dry-run/<name>.log`.

**U1**, `test/render/place-manifest.test.ts`, two tests, written first.
- `roads flags a place exactly where the Ribbon would set out from it, so the card never offers a road the Ribbon re-seats on the capital (Issue #428)`: for each seed of `[42, 21]`, `const w = generateWorld(defaultRecipe(seed))` (the seed first), `const m = buildPlaceManifest(w, WIDTH)`, `const r = ribbonResultFor(w, { from: null, to: null, dress: "antique" })` (import from `../../src/site/explorer/ribbon-job.ts`); `assert.deepEqual(m.places.map((p) => p.roads), r.options.map((o) => o.roads), ...)`.
- `roads witnesses: seed 42's Tewetulua (24, a village) and seed 21's Hjau (4, a town) are the places no road leaves, and the Ribbon re-seats a departure from Tewetulua (Issue #428)`: `m42.places[24]` has `name === "Tewetulua"` and `roads === false`; `m21.places[4]` has `name === "Hjau"` and `roads === false`; `m42.places.filter((p) => p.roads).length === 25`; `ribbonResultFor(w42, { from: 24, to: null, dress: "antique" }).fromIdx === 0` and `ribbonResultFor(w42, { from: 1, to: null, dress: "antique" }).fromIdx === 1`. One dated line above the `[42, 21]` list, naming no path: `// Swept 2026-11-02 over seeds 1 to 25 and 42: 11 of 661 places have no road, every one a village but seed 21's Hjau, the witness that a town can be roadless too.` Build both worlds once at module level and share them between the two tests.
- Stub that makes it red on the assertion: `PlaceMark.roads` added, `buildPlaceManifest` writes `roads: true` for every place, the three fixtures of item 12 gain `roads: false`. Red: the `deepEqual` on seed 42 (place 24) and the Tewetulua witness.
- Mutations once green: `roads: true`; `roads: roadReachable(world, mask, idx).length >= 0`; `roads: s.kind !== "village" || roadReachable(world, mask, idx).length > 0` (only a village may lack a road: passes seed 42, whose roadless place is a village, and reds seed 21 at Hjau). Each reds U1.
- Cost: measured about 0.8 s for both worlds and three ribbon results each (`out/428-dry-run/u1-cost.log`: generate 382 ms and 372 ms, the ribbon results 5 to 9 ms a world).
- The prover owes U1.

**U2**, `test/explorer/address.test.ts`, two tests beside `prospectTarget`'s.
- `ribbonTarget: the chart's hash rides through verbatim with the place as the departure, a=, and no b (Issue #428)`: `ribbonTarget("#seed=42&style=ink&legend=1&arms=0", 3) === "/ribbon/#seed=42&style=ink&legend=1&arms=0&a=3"`; `ribbonTarget("#seed=7&style=antique&cx=0.5100&cy=0.4900&k=3.0000&survey&note=a%20b", 0) === "/ribbon/#seed=7&style=antique&cx=0.5100&cy=0.4900&k=3.0000&survey&note=a%20b&a=0"`.
- `ribbonTarget: a bare-visit Explorer (empty hash) still names the place`: `ribbonTarget("", 5)` and `ribbonTarget("#", 5)` both `=== "/ribbon/#a=5"`.
- Stub: `export function ribbonTarget(_hash: string, idx: number): string { return "/ribbon/#a=" + idx; }`. Red: the first test's first `assert.equal`.
- Mutations once green: rebuilding the hash through `URLSearchParams` (`survey` becomes `survey=`, `a%20b` becomes `a+b`); appending `b=`; dropping the `&`. Each reds U2.
- The prover owes U2.

**LP2, LP5, LP6**, `test/site/living-chart-no-bar-card-actions.test.ts`, written in three stages against three states of the source:

- Stage S0 (commit 5): `LivingChartHost.ribbonHref`, `PlaceOverlayDeps.ribbonHref`, the `index.ts` spread, items 9 and 10, and `cardActs`/`createPlaceOverlay` accepting and ignoring `ribbonHref`. Written now:
  - **LP2**, re-pinned. New name: `LP2 the card's actions sit inside ONE .pc-acts row, the road to the Ribbon right under the way in to the prospect and the filing press last (#522; Issue #428, ruled 2026-11-02)`. `barlessHost({ prospectHref: (idx) => \`/prospect/#i=${idx}\`, ribbonHref: (idx) => \`/ribbon/#a=${idx}\`, layProspect: host.dep })`; `assert.deepEqual(names, ["pc-prospect", "pc-ribbon", "pc-lay"], "the two roads together, then the press, in the ruled order")`; the last assertion also refuses a bare `pc-ribbon` sibling of the prose. Red at S0: the `deepEqual` (two members).
  - **LP5**, new: `LP5 the card carries the road to the Ribbon only on a world sheet whose host provides one, and it is a real link named for what it opens (Issue #428)`. A host with `prospectHref` and `ribbonHref`: the overlay holds a `pc-ribbon`, `tagName === "A"`, `textContent === "Take the road"`. Rebuilt with `{ box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } }`: the inset holds no `pc-ribbon`. A host with `prospectHref` only: no `pc-ribbon`. Red at S0: `assert.ok(link, ...)`.
- Stage S1 (commit 6): `cardActs` builds and appends the link; `paintRoad` exported with an empty body; `showPlaceCard` calls it; the state carries `ribbonLink`. LP2 and LP5 go green. Written now:
  - **LP6**, new: `LP6 the road names the place the card is SHOWING and stands down where no road leaves it, coming back at the next place that has one (Issue #428)`. `realWorld()` (seed 42, default recipe); witness asserts first: `manifest.places[24].roads === false` and `manifest.places[1].roads === true`. `barlessHost({ ribbonHref: (idx) => \`/ribbon/#a=${idx}\` })`, `armShow(mount)`, `const road = armed.road(); assert.ok(road, ...)`; `armed.show(1)`: `road.href === "/ribbon/#a=1"` and `road.style.display === ""`; `armed.show(24)`: `road.style.display === "none"`; `armed.show(1)`: `road.style.display === ""` and `road.href === "/ribbon/#a=1"`. Red at S1: the first `href` assertion.
- Stage S2 (commit 7): `paintRoad`'s body. LP6 goes green.
- Mutations once green: drop `&& onWorldSheet` from the link's gate (LP5 reds on the inset); build the link without `ribbonHref` (LP5 reds on the host without one); `paintRoad` never sets `display` (LP6 reds at `"none"`); `paintRoad` sets `display` only to `"none"` (LP6 reds at the last `""`); `href(0)` in place of `href(place.idx)` (LP6 reds at the first `href`); **the order mutation**: append the link after the press, so the row reads `pc-prospect,pc-lay,pc-ribbon` (LP2 reds; in the browser the same mutation reds P16 and CD57, below).
- The prover owes LP2, LP5 and LP6.

**PB1c and PB1d**, `e2e/suites/prospect/way-in.ts`, one step `PB1c to PB1d`, run on the Explorer page PB1 and PB1b leave at `/explorer/#seed=42&style=antique&legend=1` (whose own address is then `#seed=42&style=antique&legend=1&arms=0&beasts=0`, read in the dry run).
- The reads, verbatim:
  - `ROAD: Payload<Road>` = `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const p = c.querySelector(".pc-prospect"), r = c.querySelector(".pc-ribbon"); return { name: (c.querySelector(".pc-name") || {}).textContent, prospect: p ? p.getAttribute("href") : null, ribbon: r ? r.getAttribute("href") : null, ribbonDisplay: r ? getComputedStyle(r).display : null, prospectDisplay: p ? getComputedStyle(p).display : null }; })()`, `Road` being that object or `null`.
  - `ESCAPE` = `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))` (a second click on the pinned town would close its card).
  - `PRESS(idx)` = `document.querySelector('.place-hit[data-idx="${idx}"]').click()`, wiring and not a gesture, as PB1's own presses are; say so in one line at the first use.
- The flow: `const settle = makeSettle({ evaluate, sleep })`; `ESCAPE`; `PRESS(2)`; `const one = await settle(ROAD, (d) => /&i=2$/.test(d.prospect ?? ""), "PB1c the card at place 2")`; check PB1c; `ESCAPE`; `PRESS(ORPHAN)` (`ORPHAN` imported from `../ribbon/room.ts`); `const orphan = await settle(ROAD, (d) => new RegExp(\`&i=${ORPHAN}$\`).test(d.prospect ?? ""), "PB1d the card at Tewetulua")`; check PB1d. Each predicate names which card arrived and never the claim (clause 6), and each departs from the card before it (clause 5): PB1b leaves place 1 (Paukilua) pinned, so PB1c waits for place 2 (Weki), and PB1d for place 24. The dry run read the card hidden after `ESCAPE` (its `pinned` class stays on the hidden card, which nothing reads) and each settle resolving on its first read.
- **PB1c**: `PB1c the card's road to the Ribbon rides the chart's own address verbatim with this place as its departure, beside the way in to the prospect, on a nonzero place a road leaves (Issue #428)`. Asserts `!!one.ribbon && one.ribbonDisplay !== "none" && one.ribbon === "/ribbon/#" + one.prospect!.slice("/prospect/#".length).replace(/&i=2$/, "&a=2")`; detail `JSON.stringify(one)`.
  - Fixture reading (`428-pb1c.log`, stage "fixture"): name Weki, prospect `/prospect/#seed=42&style=antique&legend=1&arms=0&beasts=0&i=2`, ribbon `/ribbon/#seed=42&style=antique&legend=1&arms=0&beasts=0&a=2`, ribbon display `block`: passes.
  - Mutation readings (same log): the host wires a hard-coded 0, ribbon `...&a=0`: fails; the host wires the previous card's place, ribbon `...&a=1`: fails; the road stood down on this roaded place, display `none`: fails. In `428-checks.log`, the hash re-serialized to `/ribbon/#seed=42&a=1` also fails. One instance.
  - Red first: written before `app.ts` is wired (commit 8), it reds on `!!one.ribbon` (the dry run read `ribbon: null` on the card as it arrives today).
- **PB1d**: `PB1d a place no road leaves (seed 42's Tewetulua) offers no road on its card, and its way in to the prospect stays (Issue #428)`. Asserts `orphan.name === "Tewetulua" && (orphan.ribbonDisplay === null || orphan.ribbonDisplay === "none") && orphan.prospectDisplay !== null && orphan.prospectDisplay !== "none"`.
  - Fixture reading (`428-pb1c.log`): name Tewetulua, ribbon display `none`, prospect `block` (a flex item is blockified): passes.
  - Mutation readings (same log): never stood down, ribbon `block`: fails; stood down by the `hidden` attribute under the sheet's display, ribbon `block`: fails. One instance.
  - Not red first: before the feature there is no road and the check passes; it is proven by mutation (the prover's `paintRoad` never hiding).
- What the step holds: three claims held nowhere else, on one page: the Explorer host wires the road from the chart's own address with the shown place's index (LP6 holds the overlay with a stand-in host, U2 the target alone; `app.ts`'s line is read only here); the road shows in the computed style where a road leaves; it stands down in the computed style where none does (LP6 reads the shim's style bag, which cannot see the cascade). Not thin, so by "Who finds a slow step" the implementer reads the step's seconds once from the pull request's own CI run and reports it; a step holding more than two claims held nowhere else is never too slow under the rule. No navigation is added: two key events, two presses and two settles on a page already open.
- The prover owes PB1c and PB1d.

**RB18**, `e2e/suites/ribbon/room.ts`, step `RB18`.
- `rb18CardRoad({ check, goto, opened }: RibbonKit)`: `await goto("#seed=42&style=antique&legend=1&arms=0&beasts=0&a=1")` (the Explorer's own address for PB1's link, with place 1 as the departure, the shape of the road PB1c reads; one line saying so), `const st = await opened("the card's road from Paukilua")`; check `RB18 the place card's road arrives on the Explorer's own address with a nonzero departure, and the scroll sets out from that place for its farthest road (Issue #428)` asserting `st.from === 1 && st.to !== 1 && /^Paukilua to /.test(st.title ?? "")`; detail `JSON.stringify({ from: st.from, to: st.to, title: st.title })`.
- Fixture reading: from 1, to 22, title `Paukilua to Homaitani · Chart № 42`: passes.
- Mutation reading (the page ignoring `a`, staged as the same address without it): from 0, title `Laukuwelua to Homaitani · Chart № 42`: fails. An aside the dry run also read: `a=24` (Tewetulua) lands on `from 0`, the capital's road under the capital's name, which is why the card is gated.
- Not red first: the Ribbon already honours `a` today; RB18 is a guard on behaviour the card now depends on, proven by mutation (`draw(null, addr.to)` in `src/site/ribbon/app.ts`).
- What the step holds: one claim held nowhere else in a browser (RB1 reads the bare default's capital; `test/site/ribbon-job.test.ts` holds `from: 0` and the fallbacks), on one page. Thin. By "Who finds a slow step": one CI reading under 4 s passes; from 4 to 20 s, two more runs of the lane's job started by hand give the median; over 20 s it is too slow (a stop condition).
- The prover owes RB18.

**P16**, `e2e/suites/cards/glass.ts`, re-pinned.
- `p16.acts === "pc-prospect,pc-lay"` becomes `p16.acts === "pc-prospect,pc-ribbon,pc-lay"`; the check's name ends `... and the card's ACTION ROW stands between the founding and the note with all three actions inside it, the two roads first and the filing press last (#522; Issue #428)`. Nothing else in P16, P17, P18 or P18b changes (they read `.pc-inner > *`, in which the row is one member).
- Fixture reading (`428-checks.log`, "P16 acts", stage "link second", the capital Laukuwelua): `pc-prospect,pc-ribbon,pc-lay`: passes. Mutation readings: the order mutation (stage "link last"): `pc-prospect,pc-lay,pc-ribbon`: fails; no link: `pc-prospect,pc-lay`: fails.
- Red first: before `app.ts` is wired (commit 8). The prover owes it.
- The step adds no read, navigation or wait; it is counted as it stands and read once from CI.

**CD25**, `e2e/suites/chart-drawer/prospect.ts`, re-pinned and widened, with item 20's read.
- The assertion gains `!!armed.road && armed.road.hit === "self" && armed.road.inActs &&` before `armed.actsRow`, and `armed.actsRow === 2` becomes `armed.actsRow === 3`; the detail adds `road: armed.road`. New name: `CD25 the place card's three actions stand in ONE row and EACH answers a real pointer: #place-card is pointer-events: none, so an action that forgets to restore it passes element.click() and is dead to every reader, which is the #520 dog-ear scar exactly (#518 ruling 7; Issue #428)`.
- Fixture reading (`428-cd25.log`, stage "fixture (link second)", place 1 Paukilua pinned by a real press at CD25's own address, the harness's default window): road hit `self`, press hit `self` (the press now at the bottom of the row), inActs, actsRow 3: passes. Mutation (the link's `pointer-events` left to the card's `none`): road hit `[object SVGAnimatedString]` (the chart under it): fails. The control (no link) read actsRow 2 in `428-checks.log`.
- Red first: before `app.ts` is wired (commit 8). The prover owes the widened claim (mutation: drop `pointer-events: auto` from the shared rule's effect on `.pc-ribbon` only, by a `.pc-ribbon { pointer-events: none; }` rule after it).

**CD57**, `e2e/suites/chart-drawer/gestures.ts`, re-aimed (item 22) because the ruled order puts the road between the prospect link and the press.
- CD57's keyboard arm (`underHand`'s `keyed`) needs ONE Tab to land on the press with `:focus-visible`. It now starts from `#place-card .pc-ribbon`. Its assertion, `gold(open.keyed) && !!open.keyed?.focus` and the held arm's, is unchanged.
- The place CD57 pins is the first from 1 up whose mark answers its own centre (`reachable([])`), read as place 1, Paukilua, which a road leaves, so the road is shown and focusable there (`428-cd57.log`, `cd57Place: 1`).
- Fixture reading (`428-cd57.log`, out/428-dry-run/428-cd57.ts, place 1 pinned by a real press at CD57's address, the road staged second): from the road, one Tab lands on the press with `:focus-visible`: `keyed: true`.
- Mutation readings (same log): the old aim, from the prospect link with the road second, lands on `pc-ribbon`: `keyed: false`; the order mutation (road appended last), from the road, leaves the card for the next town (`place-hit pc-own`): `keyed: false`. Both red CD57.
- Red first: in commit 8 the re-aimed `tabInto` starts from a road the Explorer card does not have yet, so `keyed` is null and CD57 reds; commit 9 makes it green.
- What the step holds is unchanged; its seconds are unchanged (the same one Tab), counted as it stands.
- The prover owes CD57 under the order mutation.

**Left for step 15 to prove**: none; every test above goes to the prover's round.

**The third action's cost**, read for the plate reader and the menu (`428-checks.log`, `cost` lines, a third pill on EVERY place, so the worst case; a roadless place shows none):
- At 1024x768, 1280x800 and 640x768 on seed 42: every card grows 29.60 to 29.61 px (the tallest, the capital's, 250.78 to 280.39 px); no card scrolls before or after.
- At P19's window (1440x300, touch emulated, seed 4294967295, chart box 272.01 px tall): scrolling cards go from 2 to 4 of 26 (Dyrzelitsa and Brakronsk newly scroll), Kralgov's hidden tail goes 20 to 50 px, and the cap holds (Kralgov 272.00 px against the box). A pinned card that scrolls takes the pointer (explorer-doctrine, "A card is CAPPED"), so two more cards on that seed at that window can take a press over their own town.
- (For the option Q3 set aside: "Take the road from <town>" stayed on one 25 px line on every place of seed 42 at 1024x768 and of seed 4294967295 at the P19 window.)
- The sweep was taken with the pill appended last. The ruled order puts the same three members, with the same gap, in a column, which is the same height in either order; that is reasoned, not re-measured, and the step 11 plate read measures the built card.

## Order of commits

1. `handbook/plans/400/428/428-plan.md`, this plan unchanged, with U1 and its stub (the field, `roads: true`, the three fixtures). U1 red on its `deepEqual`. Push.
2. `buildPlaceManifest` computes the flag. U1 green.
3. U2 and its stub. Red.
4. `ribbonTarget`. U2 green.
5. Stage S0 with LP2 re-pinned and LP5. Both red.
6. Stage S1 with LP6. LP2 and LP5 green, LP6 red.
7. Stage S2. LP6 green.
8. The browser checks (items 15 to 22) with no `app.ts`, CSS or lint change; `npm run build`; the prospect, cards and chart-drawer suites run one at a time: PB1c, P16, CD25 and CD57 red on their assertions (PB1d and RB18 green, as said above).
9. `app.ts` wiring (item 6), the CSS (item 7) and the tip roster (item 8). Everything green.
10. Review fixes, as workflow step 15 says.

## Rosters and doctrine

- `TIPPING_LINKS` in `scripts/lint/sheet-motion.ts`: the entry is rewritten (item 8); `test/repo/sheet-motion.test.ts` reds an entry with no tip left, so the old entry cannot be left beside the new.
- `INLINE_BLOCKS_OUTSIDE_MARKER_LISTS`: no entry; the shared rule settles `vertical-align: top`.
- E2E rosters: none. A part file joins no roster; no suite, lane or `MEASURED_SECONDS` value changes.
- `SOURCE_READS`: none; no new test reads a source file.
- Specs and agents: no ratified line is contradicted (`git grep -n -i -e "pc-prospect" -e "pc-acts" -e "both actions" -e "two actions" -e "View the prospect" -e "road from" -- handbook/specs .claude CLAUDE.md README.md src/pages` finds only the engine-invariants paragraph this plan complies with). No spec is edited.
- The issue body's "FAQ mention likely owed": not owed (a call, below).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check` (`npm run format` until it passes), `npm test` then `npm run astro:generate`.
- Targeted: `npm test -- test/render/place-manifest.test.ts test/explorer/address.test.ts test/site/living-chart-no-bar-card-actions.test.ts test/site/living-chart-no-bar-card.test.ts test/repo/sheet-motion.test.ts`.
- No chart or golden moves: `npm test -- test/world/golden-seed42.test.ts test/site/hero-charts.test.ts` green, named in the PR as evidence that the manifest field is stamped into no SVG.
- `npm run build`, then one at a time, waiting for each: `VELLUM_E2E_SUITES=prospect npm run test:e2e`, `VELLUM_E2E_SUITES=ribbon npm run test:e2e`, `VELLUM_E2E_SUITES=cards npm run test:e2e`, `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, `VELLUM_E2E_SUITES=zoom npm run test:e2e` (zoom for Z26, the card's dress, and Z27, which looks for a town under a pinned card's text and outside its action row). Never the full lanes.
- The acceptance is PB1c, PB1d and RB18 green, with LP5 and LP6.
- The step seconds of `PB1c to PB1d` and `RB18` from the pull request's own CI run, in the PR body, as "What a step holds" above says.
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance): the Explorer on seed 42 at 1024x768, 1280x800 and a 640 window, cards for the capital (Laukuwelua, 0), Paukilua (1) and Tewetulua (24, no road); and P19's window (1440x300) on seed 4294967295 for Kralgov, Dyrzelitsa and Brakronsk. It measures: the card's height and hidden tail; the new pill on one line; its text against its own ground at rest, under hover and under keyboard focus, at or over 4.5:1; the tip on hover; the row's order.
- **The look is provisional until Alex has used it (Q2 = B), and a post-use review is owed.** The PR body names as provisional, awaiting that review: the link's words ("Take the road"), its place in the row (second, between the two actions Issue #522 ruled, so the filing press no longer stands directly under "View the prospect"; the PR records this as Alex's ruling against #522's stills, as the fidelity rule asks), and its dress (gold, with the hover tip). Epic #426 has no post-use review sub, so the dispatcher files one issue in the form of Issue #1138 ("The settlement mark ladder's feel calls await Alex's live use"): title `The place card's road to the Ribbon: its feel calls await Alex's live use`, listing those three calls with the rulings comment's link and the files that carry each (`cardActs` in `src/site/shared/living-chart/place-overlay-card.ts`, the `.pc-prospect, .pc-ribbon` rules in `src/styles/shared/living-chart.css`). Epic #426 predates 2026-10-04 and links its subs in prose, so the issue is named in prose on the epic rather than nested (`handbook/specs/development-workflow.md`, "An epic filed before that date that already has a prose-linked sub stays linked in prose"). The implementer files nothing for this: it is the dispatcher's, with the board phase.

## Calls made

1. **The flag lives on `PlaceMark` as `roads: boolean`, computed in `buildPlaceManifest` with the Ribbon's own predicate.** Rule: Alex's 2026-09-03 ruling (comment 5533955105) and engine-invariants' "any surface offering 'the road from X' owes a check that X has a road, and carries that answer". Measured 0.16 to 0.91 ms per world (median of three, seeds 1 to 25 and 42).
2. **Region manifests carry the flag too, unused there.** Rule: one builder for every manifest, and a required field over an optional one (check-placement: make a wrong state unrepresentable). Measured 0.04 to 0.45 ms per region sheet.
3. **`src/render/place-manifest.ts` imports `src/itinerary/route.ts`, which no render module does today.** Deliberate: no lint bounds it, and `route.ts` imports no render module, so there is no cycle.
4. **A distinct `ribbonTarget` in `src/site/explorer/address.ts`, mirroring `prospectTarget`.** Rule: explorer-doctrine "a forwarded hash is passed verbatim and never re-serialized"; the issue body's design; the house's per-page target naming (`prospectTarget` already exists in both `src/site/explorer/address.ts` and `src/site/ribbon/address.ts`). On a live Explorer hash it agrees with the Prospect page's `ribbonTarget`.
5. **The link stands down by `style.display` and stays in the row.** Rule: cascade-traps (measured: the `hidden` attribute left it shown), the Prospect's own `ribbonLink.style.display` precedent, explorer-doctrine's "A refill keeps the action row in place". P16, CD25 and LP2 therefore count three members on every place, roadless or not.
6. **World-sheet only.** Rule: explorer-doctrine "A place link is world-sheet only"; epic #426 ruling 3 parks region-world ribbons on #395.
7. **The dress is `.pc-prospect`'s: gold, with the hover tip and its roster entry.** Rule: #242 ruling 1 made the card's road gold; ui-design "A hover gesture promises navigation". The rulings comment confirms it.
8. **Class `pc-ribbon`.** Rule: its sibling `pc-prospect` names its destination.
9. **No gesture listeners on the link** (the filing press stops `mousedown`, `dblclick`, `wheel`, `touchstart`). Rule: its sibling link carries none; a link leaves on its first click.
10. **The card's browser checks go beside PB1 and PB1b in the prospect suite, in a new part file; the Ribbon's arrival check in the ribbon suite.** Rule: site-architecture (a suite's parts in its folder; the entry is at 378 counted lines); check-placement (the browser holds only what the unit suite cannot: the host wiring, the cascade, the Ribbon's arrival).
11. **CD25 widens to the road's pointer reach.** Rule: CD25's own claim covers every action in the row (the #520 scar).
12. **Z26 (the card's dress at depth) is not extended to the new link.** Rule: conventions, "let dressing-level pins lag one live-use cycle".
13. **No FAQ mention.** Rule: the FAQ names neither the Prospect nor the card's existing road (re-baseline 2026-09-04), and the 2026-09-03 ruling narrowed the issue to the link.
14. **No spec edit.** Rule: conventions, where a rule lives; no ratified line is contradicted and the flag is pinned by its test.
15. **No written-world check of its own.** Rule: check-placement; the hop is a verbatim address (U2) and WR13 (`e2e/suites/writing-room/carry.ts`) holds the Ribbon's arrival on a written world's link.
16. **The plate read is at 1024, 1280 and 640, and P19's window**, not 390. Rule: Issue #765 Q3; Gate 3 item 3.

## Open decisions

none. The four questions of the step 6 menu are ruled (**Rulings**, at the head), and every option they set aside is under **Alternatives rejected**.

## Stop conditions

Hand back, rather than adapt, when:

- `git diff --stat 313858a2 origin/main --` over any `src/`, `test/`, `test-support/`, `e2e/` or `scripts/` file listed above shows a change.
- Issue #428 has a comment newer than the seven read here (the newest the rulings comment 6574680225), other than a `Plan archive, not a ruling:` comment.
- `npm run check` reds a file not listed in items 1 to 14 after the field is added.
- `npm run lint` reports `max-lines` on `src/site/explorer/app.ts` (planned at 399 of 400 counted lines), or `max-lines-per-function` on any function other than `createPlaceOverlay`'s existing skip.
- The tip lint (`vellum/css-tip-goes-somewhere`) names a key other than item 8's string, or `test/repo/sheet-motion.test.ts` reds.
- U1: seed 42's place 24 is not Tewetulua or has a road; seed 21's place 4 is not Hjau or has a road; seed 42 has other than 25 roaded places (a world moved).
- PB1b no longer leaves place 1's card pinned; PB1c's card at place 2 is not Weki, or its prospect link does not end `&i=2`; PB1d's card at place 24 is not Tewetulua; RB18's departure is not Paukilua, or the Explorer's address for PB1's link is not `#seed=42&style=antique&legend=1&arms=0&beasts=0`.
- `RB18`'s step reads over 20 s on CI, or a median over 20 s from three runs where the first read 4 to 20 s: reworking it is a design call.
- Z27 (`e2e/suites/zoom/gestures.ts`) reports "no covered pair found", or P19, P20 or P21 (`e2e/suites/cards/cap.ts`) red, after the change.
- CD57's pinned place (`reachable([])`, read as place 1) is one no road leaves, so its road is hidden and the re-aimed `tabInto` cannot start from it.
- Any browser check other than P16, CD25 and CD57 reds on the row's new order (the press one place lower, the Tab order prospect, road, press).
- The plate reader measures the new pill under 4.5:1 in any state, the pill wrapping, or any card at 1024x768, 1280x800 or 640x768 newly scrolling.
