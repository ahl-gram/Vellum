# Issue #669 plan: the Portfolio's address moves under /explorer/

Sub 4 of epic Issue #667. Base: origin/main `293e02e` (Issue #638 PR #742, Issue #668 PR #737, PR #744 and PR #746 all in). Recon ledger: `669-recon-ledger.md` in this scratchpad (22 CURRENT, 13 STALE, 2 UNVERIFIABLE). The STALE claims that shaped this plan: the e2e lives under `e2e/suites/` in TypeScript, the table road's fallback is in `src/site/explorer/chart-drawer-bind.ts`, the population is 20 live string hits plus 4 relative ones, no e2e walks the Print Room's road today, the built-page resolver already covers AUTHORED roads while the RUNTIME ones need source pins or an e2e walk, and the plan archives at `handbook/plans/669/669-plan.md`.

## Rulings (Alex, 2026-10-04, recorded on Issue #669 as issuecomment-5980247272)

1. The table road reads "Take the table to / The Portfolio". A feel ruling for Issue #736's docket; a test pins that the button's room name matches its destination.
2. Both rulebook passages read "its own page, under the Explorer".
3. The old `.gitignore` line is REMOVED, as the issue says (not the recommended keep): no tombstone line, and the guard pins the new line only.
4. The built-site guard is the click-through form (option C below): the e2e that opens every page reads each link's resolved destination after the page's scripts have run and confirms it opens a page that exists.

The lane's nine calls stand. Every section below is written to those rulings; the menu text is kept at the end as it was put.

## Design

The page moves from `/print-room/portfolio/` to `/explorer/portfolio/`. Depth is unchanged (two directories), so the page's component imports, its sheet's relative links (none) and its bundle-twin script tag (`./app.bundle.js`) do not change. Nothing about the page changes but where it lives and the roads to and from it. No redirect is owed (link rot accepted, Issue #669 body).

### The moves (git mv, so history follows)

- `src/pages/print-room/portfolio/index.astro` to `src/pages/explorer/portfolio/index.astro`; its `path` prop to `/explorer/portfolio/`.
- `public/print-room/portfolio/index.css` to `public/explorer/portfolio/index.css` (the layout links `index.css` relative to the page, `src/layouts/BaseLayout.astro`, so the sheet must sit beside the new route).

### The address, wherever it is data

- `ROUTE_NAMES` key and the `ROUTE_CHILDREN["/explorer/"]` entry in `src/layouts/nav.ts` (Sub 2's tree entry).
- `PORTFOLIO_ROUTE` in `scripts/generate-discovery.ts`.
- `BUNDLE_ENTRIES` twin in `scripts/build-app-bundles.ts` to `explorer/portfolio/app.bundle.js`. Vite resolves the shared chunks relative to the twin, so the chunk imports become `../chunks/...` by themselves.
- `GENERATED_SUBTREES` in `scripts/clean-public-generated.ts` GAINS `explorer/portfolio/app.bundle.js` and KEEPS `print-room/portfolio/app.bundle.js` as a tombstone (the list may grow and may not shrink, `handbook/specs/site-architecture.md`).
- `.gitignore`: `public/print-room/portfolio/app.bundle.js` becomes `public/explorer/portfolio/app.bundle.js` (ruling 3). Named consequence: `eslint.config.ts` loads the `.gitignore` through `includeIgnoreFile` and refuses every other `.js` (Issue #653 ruling D), so a checkout holding a pre-move bundle fails `npm run lint` once, until `npm run astro:generate` or `npm test` runs the clean (the tombstone in `GENERATED_SUBTREES` removes it).

### The roads (every one, by direction)

Into the Portfolio:
1. The Explorer's table road (`#table-road`, a button that navigates in script): `folioHref` in `src/site/explorer/app.ts` and the fallback in the road handler in `src/site/explorer/chart-drawer-bind.ts`, both `../print-room/portfolio/` today, become `./portfolio/`.
2. The Print Room's road, in the Bound Atlas slip's foot: the authored `<a id="pr-portfolio" href="./portfolio/">` in `src/pages/print-room/index.astro` and its rewrite `folioRoad.href = "./portfolio/#" + p.toString()` in `writeHash` in `src/site/print-room/app.ts`, both RELATIVE and invisible to a search for the old address, become `../explorer/portfolio/` (the form of the road back beside it, `road.href = "../explorer/#"`).
3. The discovery files list `PORTFOLIO_ROUTE` (above).

Out of the Portfolio:
4. The gold road home `#pf-explorer`: the authored `href="../../explorer/"` and its rewrite `roadHome.href = "../../explorer/" + tableHash(...)` in `src/site/portfolio/app.ts` become `../`. Note, measured by resolving the URL: `../../explorer/` from `/explorer/portfolio/` ALSO lands on `/explorer/`, so this road would not break if missed; the flip is for the canonical form, and only a literal pin can tell the two apart.
5. The scripts-off road in the stage's `<noscript>` (`<a href="../../explorer/">Explorer</a>`) becomes `../`, same note.
6. The trail's crumbs and the nav are root-absolute and derived from the tree, so they follow `nav.ts`.

How relative roads were searched for, since a search for the string misses them:
- every `href` attribute in `src/pages/**` and every `.href =` / `location.href =` / `folioHref` assignment in `src/site/**`, resolved with `new URL(href, page)` against the page that owns it (both old forms of the road home resolve to `/explorer/` from the new address; `./portfolio/` from `/print-room/` resolves to the old address);
- the old relative literals as plain strings over the whole tree, `design/` and `handbook/plans/` aside: `git grep -n -F '../../explorer/'` (the page twice, `src/site/portfolio/app.ts`, the `ROADS` pin, and a COMMENT in CD36 in `e2e/suites/chart-drawer/homes.ts` that names the old road home), `git grep -n -F './portfolio/'` (the Print Room's page and writer), `git grep -n -F '../print-room/portfolio'` (the Explorer pair and CT8's comment);
- the same literals in their regex-escaped form, which `-F` cannot see: `git grep -n -E 'portfolio\\/|\\.\\/portfolio'` over `test/ e2e/` (CT8, PFR4, PRR11, PRR-table);
- `git grep -n -i portfolio` over `src/ scripts/ e2e/ test/` with the old-path hits removed;
- and the built-page resolver test (below), which resolves every relative `href` and `src` on every built page against that page's own URL.

Code that infers a page from a path, searched because the Portfolio now sits under the `explorer/` prefix (`git grep` for `startsWith("/explorer/")`-style tests, `dirname(twin)`, `twin.replace`, and every `explorer/` string in `test-support/`, `scripts/` and `e2e/support/`): `routeOfTwin`/`modeOf` in `scripts/design/oracle.ts` (reads `BUNDLE_ENTRIES`, so it follows the twin, and its test fixtures move); the `covers` lookup in `test/repo/e2e-tiers.test.ts` (twin to surface, so its key moves); the press's input key in `scripts/build-app-bundles.ts` (`explorer/portfolio/app`, no collision with `explorer/app`); `e2e/suites/home/frame.ts`'s `startsWith("/explorer/")` reads home's seed-form address, never the Portfolio. Nothing else. The nav's current mark is exact equality (`item.href === path` in `src/layouts/BaseLayout.astro`), so the Explorer's nav item does not light on the Portfolio.

The table road's fallback changes what it resolves against: `../print-room/portfolio/` worked from any page one directory deep, `./portfolio/` only from `/explorer/`. `git grep -n bindChartDrawer -- src/` finds one binder, `src/site/explorer/app.ts`, so `./portfolio/` is right; recorded as a call.

### Comments and copy the move falsifies

- The header comment of the page ("the Print Room's second page", a three-line block with bare `#521` and `#401`) and the head of `src/site/portfolio/app.ts` (same words, a six-line block) are false after the move. Each block loses the false phrase and is collapsed to ONE line with its other words unchanged, the touched numbers written `Issue #N` (`handbook/specs/conventions.md`: a bare number is trimmed as its line is touched, and the house writes a comment as one long line).
- `test/site/route-tree.test.ts`'s title "the Portfolio at its address until Issue #669 moves it" loses the clause.
- `test/site/chart-drawer.test.ts`'s comment above the CT8 fallback pin names the old literal and why its trailing slash matters; it is rewritten for the new literal.
- CD36's comment in `e2e/suites/chart-drawer/homes.ts` says "pressing a bare ../../explorer/ ALSO lands on a populated drawer"; its literal becomes `../`.
- The Chart Table's road reads "Take the table to / The Print Room" (`src/pages/explorer/index.astro`), ruled in the Chart Table round (`design/chart-table/README.md`). Ruling 1: its room line becomes "The Portfolio". The archive is not edited; it stays the record of the old ruling.

### Doctrine the move drags

- `handbook/specs/rulebook.md`, the destinations rule's exception ("the gathering lands on The Portfolio, a page of the Print Room") and the Chart Table's scheduling line ("a second page of the Print Room"): both become "its own page, under the Explorer" (ruling 2).
- `handbook/specs/site-architecture.md` names the Portfolio as a seated child without its address: no edit. No spec backticks the old path (`git grep` over `handbook/specs/`).
- Archives are not edited: `design/` (fidelity arrow), `handbook/plans/` (frozen plans, including `handbook/plans/709/709-plan.md`'s old path).

## The population

`git grep -n "print-room/portfolio" -- ':!design/' ':!handbook/plans/'` at `293e02e`: `.gitignore`, `e2e/suites/chart-drawer/portfolio.ts`, `e2e/suites/chart-drawer/prospect.ts`, `e2e/suites/corners.ts`, `scripts/build-app-bundles.ts`, `scripts/clean-public-generated.ts`, `scripts/generate-discovery.ts`, `src/layouts/nav.ts`, `src/pages/print-room/portfolio/index.astro`, `src/site/explorer/app.ts`, `src/site/explorer/chart-drawer-bind.ts`, `test/e2e/corners.test.ts`, `test/repo/design-kit.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/site/app-bundles.test.ts`, `test/site/astro-scaffold.test.ts`, `test/site/atelier-kit.test.ts`, `test/site/chart-drawer.test.ts`, `test/site/portfolio-room.test.ts`, `test/site/route-tree.test.ts`. Plus what the string misses: `src/pages/print-room/index.astro`, `src/site/print-room/app.ts`, `src/site/portfolio/app.ts`, `test/site/print-room-room.test.ts` (relative roads and their pins), `public/print-room/portfolio/index.css` (the sheet, by path), `handbook/specs/rulebook.md` (prose, no path).

`test/repo/design-kit.test.ts` is dragged by DERIVATION, not by the string alone: `modeOf` in `scripts/design/oracle.ts` reads the app routes off `BUNDLE_ENTRIES`, so `modeOf("/print-room/portfolio/")` turns from "head" to "full" the moment the twin moves, and the plan-naming fixture with it.

## Tests first, each with the mutation that reds it

Unit (red first against today's code, then green on the move):

- **T1 the bundle twin.** `test/site/app-bundles.test.ts`, "the press bundles from the src/site TypeScript entries": the Portfolio's twin is `explorer/portfolio/app.bundle.js`. Mutation: the twin back to `print-room/portfolio/app.bundle.js`.
- **T2 the cleaning, the ignore and the tombstone.** `test/site/app-bundles.test.ts`, extended "the cleaned set and gitignore cover..." (literal, never derived from the constant): `GENERATED_SUBTREES` includes `explorer/portfolio/app.bundle.js` AND the tombstone `print-room/portfolio/app.bundle.js`; `.gitignore` carries `public/explorer/portfolio/app.bundle.js` (the old line is removed by ruling 3 and not pinned either way). Mutations: drop the tombstone entry; drop the new entry; drop the new `.gitignore` line. No driving clean check: "clean-before-regen removes exactly its own generated subtrees" in `test/site/astro-app-surfaces.test.ts` already drives `cleanPublicGenerated`, and the only mutations that would red a second one red these literals first (plan skeptic, row 7).
- **T3 discovery's route.** `test/site/discovery.test.ts`: `PORTFOLIO_ROUTE` is the literal `/explorer/portfolio/`, and `sitemapXml` lists it and not the old one. Mutation: `PORTFOLIO_ROUTE` back. (`test/site/route-tree.test.ts`'s "the tree and discovery agree" also reds on that mutation, which is two instruments, not one.)
- **T4 the tree.** `test/site/route-tree.test.ts`: `UNDER_THE_EXPLORER` and the `TRAILS` literal at the new address; "every route the tree names is a page" then requires `src/pages/explorer/portfolio/index.astro`. Mutation: the `ROUTE_CHILDREN` entry back.
- **T5 the smoke roster.** `test/repo/e2e-tiers.test.ts`'s `covers` key to `explorer/portfolio`. Mutation: the twin back reds "bundle print-room/portfolio has no smoke suite mapped".
- **T6 the built page.** `test/site/astro-scaffold.test.ts`: `PAGES` (route, dir, trail), `STAGES`, `ROADS` (`pf-explorer` href `../`), the resolver's generated allowlist, which GAINS `/explorer/portfolio/app.bundle.js` and LOSES `/print-room/portfolio/app.bundle.js` (a stale road to the old twin would otherwise hide in it). NEW pin: the built Portfolio's scripts-off road is exactly `href="../"`. Mutations: the `path` prop back (og:url reds); `pf-explorer` left at `../../explorer/` (ROADS reds); the noscript road left (the new pin reds).
- **T7 the Print Room's road.** `test/site/print-room-room.test.ts` PRR11 (the authored anchor) and PRR-table (the writer) at `../explorer/portfolio/`. Mutations: either left at `./portfolio/`.
- **T8 the road home.** `test/site/portfolio-room.test.ts` reads the page and sheet at their new paths; PFR4's anchored line becomes `roadHome.href = "../" + tableHash(location.hash, emitTable(items))`. Mutation: the prefix back to `../../explorer/`.
- **T9 the table road's fallback.** `test/site/chart-drawer.test.ts` CT8 pins `deps.folioHref ?? "./portfolio/"`. Mutation: the fallback left.
- **T10 NEW: no shipped code names the old address but its tombstone.** In `test/site/route-tree.test.ts` (an existing file, so no new name for Alex to rule): every tracked file under `src/`, `scripts/`, `e2e/` and `public/` (via `git ls-files`; `public/` because it is the one tracked tree that ships verbatim, plan skeptic row 5) is read, and the lines naming `print-room/portfolio` are exactly the one tombstone entry in `scripts/clean-public-generated.ts`. `test/` is out of the scan because T2 must name the tombstone. Named blind spot, with its direction: a RELATIVE road to the old address does not contain the string, so the scan MISSES it (never a false red from it); T6's resolver, T7 and E2 cover that class. Mutation: `folioHref` in `src/site/explorer/app.ts` left at the old value, which is the one road no other unit test pins.
- **T11 NEW (ruling 1): the table road names where it goes.** In `test/site/astro-scaffold.test.ts`, beside "every road out names its destination by that route's name in the tree (Issue #668)", whose anchor regex never reached this button: the built Explorer's `#table-road` room line equals `ROUTE_NAMES` of `folioHref` (read from `src/site/explorer/app.ts`, anchor asserted found) resolved against `/explorer/`. Mutations: the room line back to "The Print Room"; `folioHref` pointed at another named route.
- **Existing resolver, proved, not new.** "every internal link and embed on the rendered pages resolves" in `test/site/astro-scaffold.test.ts` resolves every relative href against the page's own URL and reds when it lands on no page. Mutation: the Print Room's authored `./portfolio/` left in place.
- Roster edits that red on their own: `CHART_ROOMS` in `test/site/atelier-kit.test.ts` (it reads `src/pages/<room>/index.astro`), the route list in `test/e2e/corners.test.ts`, `PAGE_FLOOR` in `e2e/suites/corners.ts`, and the `modeOf`, `planSweep` and `routesOf` fixtures in `test/repo/design-kit.test.ts` (the first two red on the twin move by derivation; the third is a file-tree fixture moved so it describes the site).

e2e (lane D, `chart-drawer`, which is the Portfolio's covering suite):

- **E1 CD18b** (the table road, real press, exists): the arrival is asserted as the exact pathname `/explorer/portfolio/` instead of `indexOf` the old one, and the issue's "with the same items" is asserted as the arrival's table EQUAL to the six laid (`SIX`, passed in), not a count of six (if the emit reorders, compared as sets; measured before choosing). Ruling 1's driving half (Gate 1 item 20): the road's room line, read before the press, equals the arriving page's room name. Mutations: `folioHref` left old; the room line back to "The Print Room".
- **E5 NEW CO4 (ruling 4), in `e2e/suites/corners.ts`, the suite that opens every page the tree builds:** at the end of each page's phone stretch and of its wide stretch (seconds after load, so the scripts that rewrite links have run), every same-origin `a[href]`'s RESOLVED path is read; after the sweep each distinct path is fetched once from the harness's own server and must answer 200, and every swept page must have contributed links (a floor, so it cannot pass over an empty read). Its own step, joined to `STEPPED_GROUPS["corners"]`. Named blind spot, with its direction: a link a script writes later than the sweep reads it is read in its authored form, which can only MISS, never false-red; the one script-written road into the Portfolio is walked by CD49 anyway. Buttons are not links: the table road keeps CD18b, T10 and T11. Mutation: the Print Room's authored and script-written road left at `./portfolio/`.
- **E2 NEW CD49, the Print Room's road with its hash**, in its own step: the device cleared, `/print-room/#seed=42&style=antique&legend=1&table=<ONE>` opened through `about:blank`, a readiness wait (throws) until the proof has drawn and `#pr-portfolio`'s href carries `#`, the slip unfolded if folded (wiring, said at the line), a REAL press on the road's own rect through `pressById` (hit-tested), then a measurement poll on the arrival that returns its last read: pathname `/explorer/portfolio/`, the address's table is ONE, `seed=42` rides along, and `__vellumPortfolio().items === 1`. Mutations: the writer left at `./portfolio/#` (lands on a 404); the writer dropping the hash (no table).
- **E3 NEW CD50, the scripts-off road home**, in its own step, scripts re-enabled on the step's own promise in DR8's form (`step("DR8", ...).finally(scriptsBackOn)` in `e2e/suites/room-drawer.ts`, whose comment says why a line after the step is not enough): scripts off, `/explorer/portfolio/` opened, the `<noscript>` road pressed by real input after a hit test (`noscript .status` carries `pointer-events: auto` in `public/atelier.css`), arrival at `/explorer/` with the Explorer's shell standing. Mutation: the noscript href pointed at `./`.
- **E4, the moved page still drafts on the worker.** The one silent failure the move could cause is the worker URL resolving wrong from the moved twin, and the page would fall back to drafting inline, which looks like a slow page (`handbook/specs/site-architecture.md`, the bare relative worker URL). No e2e reads the Portfolio's worker today. CD19 (which already waits for drawn sheets after the table road) adds `#pf-warning`'s state to its read and asserts it still hidden: the page unhides it right after `initWorker()` when `usesWorker()` is false, before drafting, so a drawn sheet means the warning's state is final. Mutations: the worker blocked for the run (`serverState.blockWorker`, the instrument the fallback suites use, which reproduces exactly the failure guarded), and the warning's condition inverted (`if (usesWorker())`), which proves only that the check reads the warning. Plus evidence on the build: the moved twin's chunk imports read `../chunks/` and the worker URL lives in a shared chunk under `explorer/chunks/`, which does not move.
- **CD36** (the gold road home by real press, exists) is unchanged and still walks road 4; its three-line comment naming `../../explorer/` collapses to one line with the new literal (plan skeptic row 10).
- `cd20BarePortfolio` and `cd32MixedFolio` navigate to the new URL; `PAGE_FLOOR` in `e2e/suites/corners.ts` names it.
- Both new steps join `STEPPED_GROUPS["chart-drawer"]` in `test/repo/e2e-tiers.test.ts`, placed BEFORE CD36 so the suite's last page (and so what document-rooms inherits) is unchanged.
- **Who proves the e2e mutations: both, in Gate 1 item 9's order.** I run each mutation first (E1 to E4 included), committed before the loop, each an `npm run build` plus one local `chart-drawer` run allowed to finish (budget: five builds and runs, four mutations and the green), and paste each red line into the body's guard table. Then `vellum-guard-prover` gets the whole set, e2e checks included: its definition escalates to e2e and allows two or three e2e rounds (`.claude/agents/vellum-guard-prover.md`), while Gate 1 item 9 reads "unit tests only", and E1 to E3 each have a unit sibling that reds on the same mutation (T10, T7, T6), which its escalation rule would read as a reason to stay at unit level. So the dispatch names the e2e checks as subjects in their own right. Whatever neither of us reaches is named UNPROVEN.
- Lane cost: two page loads plus one Print Room proof, estimated at under 10 CI seconds. Lane D is 336.3 of 1321.1 measured seconds today, about 86 seconds under the 0.30 cap (`test/e2e/lane-timings.test.ts`). `MEASURED_SECONDS` is NOT edited: its provenance line names nine main runs, and the suite's real delta is read from this pull request's lane log and stated in the body.

## Evidence commands

- `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`).
- `npm run build` FIRST (the runner serves `dist/`, and `npm test` then `npm run astro:generate` rebuild `public/` but not `dist/`), then e2e, one at a time, local: `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, then `VELLUM_E2E_SUITES=corners npm run test:e2e`. CI runs all four lanes.
- The acceptance on the built tree: `npm run build`, then `ls dist/explorer/portfolio/index.html dist/explorer/portfolio/app.bundle.js dist/explorer/portfolio/index.css`; `ls dist/print-room/portfolio/index.html dist/print-room/portfolio/app.bundle.js` both absent (the FILES, not the directory: the file-level tombstone can leave an empty directory locally that the build copies); `grep -rl "print-room/portfolio" dist` returns nothing; `grep -c "/explorer/portfolio/" dist/sitemap.xml dist/llms.txt`.
- Combined state: merge main locally before the PR, run `npm test`, abort the merge.
- No regen: `npm test` green with `test/world/golden-seed42.test.ts` and `test/site/hero-charts.test.ts` in it; no file under `src/render/` or `public/charts/` touched.
- `vellum-plate-reader` is NOT owed for the address change and the PR says so; it IS owed if menu item 1 changes the table road's words. "Moves no pixel" is a prediction until measured: the sweep (`scripts/design/oracle.ts`, then `scripts/design/compare.ts`) shoots the unchanged build twice and the branch once, and since `shotName` renames the Portfolio's shots across the move (`print-roomportfolio-*` to `explorerportfolio-*`, which `verdictOf` reads as one row gone and one new), the branch's two Portfolio shots are copied to the old names before the compare. Every other row compares as it stands.
- `PORTFOLIO_ROUTE`'s comment in `scripts/generate-discovery.ts` ("reached from a gathered table or from the Print Room's Bound Atlas slip, never as a standing room") stays: it names no address and is still true.

## Rosters and doctrine, joined by hand vs closing themselves

Hand-kept and silent when missed: `BUNDLE_ENTRIES`, `GENERATED_SUBTREES`, `.gitignore`, `ROUTE_NAMES`/`ROUTE_CHILDREN`, `PORTFOLIO_ROUTE`, the `covers` map, `PAGES`/`STAGES`/`ROADS` and the resolver's generated allowlist in `test/site/astro-scaffold.test.ts`, `CHART_ROOMS`, `PAGE_FLOOR`, `STEPPED_GROUPS`. Closing themselves: every sheet sweep reads `SITE_SHEETS` from git, so the moved sheet joins by existing (Issue #669's 2026-09-27 and 2026-09-28 comments); the corners sweep's `routesUnder` reads `src/pages`; the oracle's `modeOf` reads `BUNDLE_ENTRIES`.

## Post-use docket

The address is a contract decision, which Issue #736 puts off its docket. Ruling 1's wording is a feel call: it joins Issue #736's docket in a comment there, and the PR body names it as awaiting the re-review. `vellum-plate-reader` is owed at step 11 on the built label (the step 6 stills were a spike).

## Calls made here, with the rule each rests on (recorded on the issue before the PR)

1. **The new road forms**: `./portfolio/` from the Explorer, `../explorer/portfolio/` from the Print Room, `../` home. A page's own in-body links are relative (`handbook/specs/site-architecture.md`, link form is scoped), and each copies the neighbour beside it (`road.href = "../explorer/#"` in the Print Room's writer). `./portfolio/` holds only because the Explorer is the one binder of the Chart Table.
2. **The road home is `../`**, as the issue body says, which Issue #513's ruling comment carries as a note rather than a ruling. The alternatives were leaving `../../explorer/` (it still resolves) or the absolute `/explorer/` the Prospect, the Ribbon and the Gallery use; `../` is what the issue asked for and what the house's relative in-body form gives.
3. (Moved to the open decisions, number 4, on the plan skeptic's row 1: the issue RULED a guard on the built site, so how it is met is Alex's, not a call.)
4. **The scripts-off road is walked (CD50)**, because the issue says every road into and out of the page is walked by a real navigation; DR8 in `e2e/suites/room-drawer.ts` is the form for a scripts-off step.
5. **The new checks live in `chart-drawer` (lane D), before CD36**, because it is the suite that covers the Portfolio's bundle (`covers` in `test/repo/e2e-tiers.test.ts`) and already holds the table fixtures, and placing them before CD36 leaves the page the suite ends on unchanged for document-rooms.
6. **`MEASURED_SECONDS` is not edited**: its provenance line names nine main runs, and one suite corrected from one pull request run would break it. This knowingly differs from the scar in `.claude/skills/vellum-footguns/references/scars.md` (a figure carried from an eleven-check suite into a twenty-three-check one); the body says so and states the measured delta from this pull request's lane D log, against about 86 seconds of room under the cap.
7. **The trail's crumbs are not walked as roads**: they are root-absolute, derived from `ROUTE_CHILDREN` and `ROUTE_NAMES`, and identical in form on every seated page; T4 and T6 pin the Portfolio's.
8. **The two header comments collapse to one line each**, words unchanged but the false phrase (above).
9. **`test/repo/design-kit.test.ts`'s `routesOf` fixture moves too**, though nothing forces it, so every fixture there describes the site as it is.

## Open decisions for Alex

1. **The Chart Table's road reads "Take the table to / The Print Room".** It already lands on a page the tree names "The Portfolio", so the mismatch with Issue #668's call 10 (a road's room name is the tree's name for where it goes, pinned on anchors only, and this road is a button) exists today; the move removes the excuse that the Portfolio was a page of the Print Room. Ruled in the Chart Table round (`design/chart-table/README.md`, "the road"). Candidates: today's words (the control) and "Take the table to / The Portfolio", or words of Alex's own. Rendered from an uncommitted spike through `vellum-plate-reader` before the STOP, at 1280 in the drawer and at 390 docked in the phone sheet.
2. **The rulebook's destinations exception says the gathering lands on "The Portfolio, a page of the Print Room"**, and its scheduling line says "a second page of the Print Room". Both are false after the move. The exception's argument (the table's destination is a page, not an Explorer panel) still holds; only the words naming where that page lives change.
3. **The old `.gitignore` line**: drop it as the issue says (a one-time local lint red on any checkout holding a pre-move bundle, cleared by `npm run astro:generate` or `npm test`), or keep it beside the tombstone so nothing goes red. Precedent: the one existing tombstone, `explorer/engine`, kept its `.gitignore` line, and "the generated runtime trees are gitignored in public/" in `test/site/astro-app-surfaces.test.ts` pins it.
4. **How the issue's "guard that fails if any road in the built site points at the old address" is met.** The unit suite's build carries the pages and none of the bundles (its `before()` cleans the generated trees first), so no unit test reads what the scripts write. Option C (recommended): A plus one e2e check in the suite that already opens every built page (`e2e/suites/corners.ts`, which derives its pages from `src/pages`): at the end of each page's sweep, long after its scripts have run, read every same-origin link's RESOLVED `href` (the browser resolves the relative forms), then fetch each distinct path once and require it to answer 200. It covers the class the issue warns about, a relative link that 404s, including the two links scripts rewrite (`#pr-portfolio`, `#pf-explorer`), for this move and any later one; the table road is a button, not a link, and keeps CD18b and T10. Measured on this worktree's build with `out/669-links.ts` (13 pages, after a 6s settle each): the read costs at most 1.1ms a page, 27 distinct paths fetch in 28ms, every one answers 200 today, and the Print Room's link was read with its script-written hash. Option A, as planned: the built-page resolver plus the noscript pin, the T10 scan, and the e2e walk of each road. Option B: a text search of every finished file for the old address written out in full; it would PASS with the warned breakage in place, since a relative road never contains the address.

## Outside the repo (for the dispatcher, not this branch)

Auto-memory names the old address in `project_vellum.md` and `feedback_vellum_no_external_users.md`; recon found both, and neither is this lane's to edit.

## The plan skeptic's findings, and what became of each

1. BLOCKING, the built-site guard filed as a call: FOLDED, moved to open decision 4, with a third option (C) that covers the relative-link class, measured.
2. "The prover runs unit tests only" was wrong: FOLDED IN PART. The prover gets the e2e checks as subjects, but I also run every mutation first, in Gate 1 item 9's order, because that gate dispatches the prover "unit tests only" and each e2e check has a unit sibling that reds on the same change, which the prover's own escalation rule reads as a reason to stay at unit level. Not the skeptic's remedy alone, and why.
3. Each e2e mutation needs its own build: FOLDED (evidence order and budget).
4. Decision 1 owed named candidates and stills before the STOP, and its framing understated a mismatch that exists today: FOLDED (stills rendered, framing fixed).
5. T10 skipped `public/`: FOLDED.
6. Decision 3 lacked the engine tombstone's precedent: FOLDED.
7. T2's driving clean check repeats an existing test: FOLDED, dropped.
8. Cite DR8's scripts-off form, not L10's: FOLDED.
9. `MEASURED_SECONDS` call repeats a recorded scar without saying so: FOLDED (the body names the scar and the measured delta).
10. CD36's wrapped comment: FOLDED, one line.

## Phase two starts by

Reverting the spike in `src/site/explorer/app.ts` (after the dispatcher has copied the stills), then `npm run astro:generate` and `npm run build`, because this worktree's `public/` and `dist/` hold a build with the spike in it.

## Sibling observations from the step 6 sitting (not caused by this change, UNVERIFIED)

- On a phone arrival with `table=`, the cuttings stayed "drawing…" frames for over 20s: `drawerFill` in `src/site/explorer/chart-drawer-bind.ts` fills thumbnails only while the drawer carries `open`, which the phone leaf never sets. Searched `handbook/errata/` and open issues: not recorded. Phase two files it or adds an errata row in the diff (step 15).
- The selected "The Table" tab rendered pale on cream in one take after a real tap, dark once the pointer moved away; a sticky hover was not confirmed. Searched the same: not recorded. Same disposition, or dropped if phase two cannot reproduce it.
