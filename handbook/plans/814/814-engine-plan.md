# Issue #814, pull request 5 of 8: the engine's eleven overruns (`engine`)

**Planned at:** `origin/main` efa8fc430b8f9909e9658fa47c69939b4253024e (PR #919, pull request 4, merged, then PR #920), Issue #814 comment count 17, the newest 6263410412 (pull request 4's implementer calls, 2026-10-19T08:51:52Z), read with `git ls-remote origin refs/heads/main` and `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate --jq length`, and re-read at 2026-10-19T13:14Z, after the plan skeptic's folds, unchanged. Every line number below is the file's own at efa8fc43, and every proof's base is efa8fc43. No file of this slice changed since 7207cfdd, where the issue-wide plan measured it (`git diff --stat 7207cfdd efa8fc43 -- src/render/layers src/terrain/contours.ts src/society/names.ts src/itinerary` prints nothing).
**Governing plan:** `handbook/plans/814/814-plan.md` on main (sha256 32d7dcbfe4d37e82d5a8334c30f52dbd64369581a0a9abc7ccd1c95dd0d61d50, archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K5 (an engine function), "Rosters and doctrine, for every pull request", and its calls 1 to 15. This file is that plan's table row 5, label `engine`. Pull requests 2 to 4 (`handbook/plans/814/814-tests-plan.md`, `814-e2e-a-plan.md`, `814-e2e-b-plan.md`) are the worked form it follows: a tool that writes each family's files from base line ranges, Appendix C's hashes, the statement proof, one commit per family.
**Rulings:** none new. The ruling that governs this slice is ruling 3 of comment 6254713941 ("Exact before-and-after set": about 20 worlds, every map style with and without the key, every theme, and every town picture of a few worlds, drawn before and after on the same machine, every file matching exactly, on top of today's fingerprints and committed-chart checks), with the governing plan's call 15 (the same worlds' ribbon plates join the set). Every question this slice meets is answered by the governing plan, its rulings, a house rule named at the call, or a measurement below, so it brings nothing back to Alex under ruling 2.
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-engine-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 11 overruns of nine engine files, every one measured at efa8fc43 by `npm run lint` with this slice's nine `eslint-suppressions.json` entries deleted (the red, commit 1). Lines of code as the lint counts them (blank lines and comments skipped).

| file | overrun | lines of code at the head |
|---|---|---|
| `src/render/layers/feature-labels.ts` | `rangeLabelNodes` 52 | 48 |
| `src/render/layers/frame.ts` | `frameLayer` 52 | 47 |
| `src/render/layers/legend-icons.ts` | `markIcon` 56, `areaIcon` 67, `seaIcon` 67 | 25, 40, 37 |
| `src/render/layers/legend.ts` | `legendLayer` 70 | 44 |
| `src/terrain/contours.ts` | `cellSegments` 78 | 16 |
| `src/society/names.ts` | file 410 | 390 |
| `src/itinerary/dress/plate.ts` | `titleBand` 54 | 29 |
| `src/itinerary/dress/strip.ts` | `eventNodes` 53 | 48 |
| `src/itinerary/events.ts` | `branchEvents` 53 | 47 |

Every cut moves whole statements, whole case blocks or whole array elements, verbatim but for indentation and line breaks, into a module-level function in the same file declared directly above the function that calls it, called at the point the moved code stood; `names.ts` gives its title word lists to a new sibling, which exports them typed read-only (call 17), the one change of text the slice makes beyond a move, erased before anything runs. Two sites have no cut at a statement and are written out in full below: `cellSegments`, whose one switch is 60 lines, and `titleBand`, whose body is one returned array. Nothing that runs changes: no draw is added, removed or reordered on any fork, no arithmetic is regrouped, no allocation is added inside a per-cell loop, and the 2,039 artifacts of ruling 3's set are byte-identical at the base and the head (measured on the dry run).

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at efa8fc43: every size claim and "unchanged since 7207cfdd" CURRENT, nothing STALE blocking, three claims of the governing K5 corrected; its ledger is `814-engine-recon-ledger.md` in the scratchpad. What it changed:

- **The prospect plate pins are not this slice's evidence.** `test/prospect/finished.test.ts` and its sums reach none of the nine files (`src/render/layers/heraldry.ts` imports `feature-labels.ts` as a type only, which is erased). This plan does not cite them. The golden (`test/world/golden-seed42.test.ts`, which reaches `names.ts` through `generateWorld`) and the hero drift guard (`test/site/hero-charts.test.ts`: seed 42 in the four styles, key on, plus the arms; structure exact, numbers within a tolerance) are cited, each for what it reaches.
- **No test pins ribbon or itinerary bytes.** `test/itinerary/*` and `test/site/ribbon-job.test.ts` are structural or compare a ribbon with itself, so the ribbon plates of the set (governing call 15) are the only byte evidence for `src/itinerary/`; they are compared whole, `ribbonResultFor`'s svg with its itinerary rows, in both dresses.
- **"The measured 0.7 seconds a chart" has no source.** Measured here instead: the whole set, 2,039 artifacts, draws in 60 to 90 s on this Mac, by load (Node v26.12.0, `/opt/homebrew/bin/node`); a world generates in about 0.45 s and a chart renders in 15 to 70 ms. The full cross of styles, themes and the key fits in that.
- **What is pinned to its file** (each kept where it is): `makeMapTitle` and `CULTURES` in `src/society/names.ts` (`handbook/specs/engine-invariants.md` "What a terrain change moves", `handbook/specs/rulebook.md` "Golden and committed-chart discipline"); `marchingSquares` and `closedIsoRings` in `src/terrain/contours.ts` (`handbook/specs/engine-invariants.md` "Landmass labelling versus the drawn coast" and "What the generator does not do"; `e2e/suites/region-detail.ts` line 118 imports the built `closedIsoRings`); `featureLabelsLayer` and `RIVER_MAX_OVERLAP` in `src/render/layers/feature-labels.ts` (`handbook/specs/chart-dress.md`). Test imports from these files: `CULTURES`, `ENGLISH_BLOCKLIST`, `createNamer`, `isStandaloneSlot`, `makeMapTitle` from `names.ts` (`test/society/names.test.ts`), `isNearExisting` and `Culture` (`test/society/renames.test.ts`), `planLegend` from `legend.ts`, the exports of `contours.ts`, and the type `RibbonEvent` from `events.ts`. None of the ten overrunning functions is named by a spec, an errata row, an agent, a skill, a hook, a test or a lint list.
- **The Issue #901 lane** (PR #918, `chore/901-measured-seconds-line`) touches `handbook/plans/901/901-plan.md`, `handbook/specs/site-architecture.md` and `test/e2e/lane-timings.test.ts` only (three-dot diff), so no file here. Open issues that will later edit these files (#122, #426, #430, #431, #439, #511) are not in flight; #426's body names `eventNodes` in `strip.ts`, which stays there.

## Specs

On top of the governing plan's Specs list (the rulebook's "The accepted lint and type-check skips"; `handbook/specs/check-placement.md` "The lint" and "The unit suite"; `handbook/specs/conventions.md` "Where a rule lives" and "How code is cited"; `handbook/specs/development-workflow.md` steps 8, 10, 11, 12, 13 and 15; and its engine line, `handbook/specs/engine-invariants.md` "Fork derivation"):

- `handbook/specs/rulebook.md` "Golden and committed-chart discipline": no regen is owed and none is made; never byte-compare SVGs rendered in different environments, which is why base and head are drawn on the same machine and the same Node.
- `handbook/specs/engine-invariants.md` "Landmass labelling versus the drawn coast": `marchingSquares` "resolves its ambiguous cases by the cell-centre average", which stays true of it, the two saddle cases moving whole into `saddleSegments` in the same file, reached only through `cellSegments`.
- `handbook/specs/chart-dress.md`, the realm-name literal paragraph and "A river keeps its name over a graze": `featureLabelsLayer` and the label layers' claim order are untouched; `rangeBlob` runs where the blob was built, before the range name claims.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 6 (before changing the renderer), items 5 and 7.

## The design

### How a cut is chosen (call 2)

A **run** is a contiguous sequence of whole statements of one block, or, where the function is a single statement too long to cut, whole case clauses of its switch or whole elements of its returned array. A run is never taken if it holds a `return`, `break` or `continue` that leaves it, writes a `let` it does not declare, or pushes into, sets or otherwise writes a value declared outside it (the governing call 13: a helper writes into nothing it is handed). A case clause's body moves whole into a helper, one helper per clause, and the clause returns the helper's call; an array element run moves into a helper returning those elements, spread at their place. For each function, the first of these that brings it to 48 lines of code or under: the fewest helpers; then the fewest names crossing (the helper's parameters plus the names it hands back); then the most headroom; then the later run; and a run at the function's top level before one inside a block. The margins are the governing plan's: no file over 395 lines of code, and no function this slice writes or shortens over 48.

### Per function

Head sizes measured on the dry run after `npm run format`, by `814-tests-size.ts`. "Call" is the line that replaces the moved code, at its place. Runner-up sizes are predicted unless marked measured.

| function (base) | moved (base lines) | the new function and its call | head | runner-up, and why it lost |
|---|---|---|---|---|
| `rangeLabelNodes` 52 | 143 to 147: `const { w, h } = world.elev;` and the `largestBlob` call | `rangeBlob(world: World): number[]` 8, ending `return blob;`; call `const blob = rangeBlob(world);` | 48 | the casing and lettering with `fit`'s destructure (151 to 188), `rangeLabelMarks(style, range, k, fit)`: 4 names to these 2, head 15 |
| `frameLayer` 52 | 30 to 35: the six measures | `frameMetrics(proj: Projection)` 9, ending `return { m, w, h, outerInset, innerW, innerH };`; call `const { m, w, h, outerInset, innerW, innerH } = frameMetrics(proj);` | 47 | 31 to 35, the same 7 names, head 48 |
| `markIcon` 56 | 48 to 78: the road case's block | `roadIcon(icon: Extract<MarkIcon, { kind: "road" }>, cx: number, cy: number, style: MapStyle, k: number): SvgNode` 39; clause `case "road": return roadIcon(icon, cx, cy, style, k);` | 25 | no other single case fits (the river's leaves 50) |
| `areaIcon` 67 | 88 to 99: the realm case's return; 101 to 116: the hypso case's block | `realmIcon(cx: number, cy: number, style: MapStyle, k: number): SvgNode` 14, clause `case "realm": return realmIcon(cx, cy, style, k);`; `hypsoIcon(cx, cy, style, k)` 18, clause `case "hypso": return hypsoIcon(cx, cy, style, k);` | 40 | no single case fits (hypso alone leaves 51); hypso with contour, the same 8 names, head 46 |
| `seaIcon` 67 | 183 to 197: the wind case's block; 200 to 214: the current case's block | `windIcon(cx, cy, style, k)` 17 and `currentIcon(cx, cy, style, k)` 17, each `(cx: number, cy: number, style: MapStyle, k: number): SvgNode`; clauses `case "wind": return windIcon(cx, cy, style, k);` and `case "current": return currentIcon(cx, cy, style, k);` | 37 | no single case fits (52); every pair takes the same 8 names, and wind with current leaves the most headroom (wind with sounding 39) |
| `legendLayer` 70 | 182 to 208: `children`'s panel rect and KEY title | `legendPanel(style: MapStyle, box: Box, m: ReturnType<typeof metrics>, k: number): SvgNode[]` 30, ending `return children;`; call `const children = legendPanel(style, box, m, k);` | 44 | none: the row loop and the note push into `children` |
| `cellSegments` 78 | the switch (44 to 103) with `segs` (33), `add` (40 to 42) and `return segs;` (104), written out in full below | `saddleSegments(idx, top, right, bottom, left, corners, iso)` 40, cases 5 and 10; `singleSegment(idx, top, right, bottom, left)` 45, the other twelve; `cellSegments` returns `idx === 5 \|\| idx === 10 ? saddleSegments(...) : singleSegment(...)` | 16 | Alternatives rejected, below |
| `names.ts` file 410 | 393 to 415: `TITLE_ADJECTIVES`, `AGES`, `TITLE_PATTERNS` | `src/society/names-title.ts` 22, the three exported and typed read-only (`TITLE_ADJECTIVES: readonly string[]`, `AGES: readonly string[]`, `TITLE_PATTERNS: Readonly<Record<MapType, readonly string[]>>`, call 17), with the `MapType` type import; `names.ts` imports them | 390 | `ENGLISH_BLOCKLIST` (5 to 82) to `src/society/names-blocklist.ts`, 333 measured, but a test imports it from `names.ts` (call 4) |
| `titleBand` 54 | 48 to 73: the two subtitle elements of its returned array | `subtitleLines(c: DressContext, subtitle: readonly string[], cx: number, top: number): SvgNode[]` 30, returning those two elements; element `...subtitleLines(c, subtitle, cx, top),` | 29 | one subtitle line alone, the same 4 names, head 42; the title element alone, 5 names, head 42 |
| `eventNodes` 53 | 240 to 245: the waypoint's `lines` | `waypointLines(e: Extract<RibbonEvent, { kind: "waypoint" }>, caption: string): CaptionLine[]` 9, ending `return lines;`; call `const lines = waypointLines(e, caption);` | 48 | none: every other run pushes into `nodes`, writes `laid`, or saves under five lines |
| `branchEvents` 53 | 132 to 138: the walk | `branchWalk(w: number, h: number, n: number, settlementByCell: ReadonlyMap<number, number>, mask: Uint8Array, chainSet: ReadonlySet<number>): number[] \| null` 17, ending `return walked;`; call `const walked = branchWalk(w, h, n, settlementByCell, mask, chainSet);` | 47 | none at top level; inside the loop every other run carries a `continue`, pushes into `out` or writes `lastK` |

New imports: `import type { World } from "../../world/types.ts";` in `feature-labels.ts`, `import type { MapStyle } from "../style.ts";` in `legend-icons.ts` and `legend.ts`, `import type { RibbonEvent } from "../events.ts";` in `strip.ts`, `import { AGES, TITLE_ADJECTIVES, TITLE_PATTERNS } from "./names-title.ts";` in `names.ts`. No helper is exported; the three title lists are, from their new module only. Files at the head (lines of code): `feature-labels.ts` 365, `frame.ts` 81, `legend-icons.ts` 251, `legend.ts` 233, `contours.ts` 307, `names.ts` 390, `names-title.ts` 22, `plate.ts` 136, `strip.ts` 312, `events.ts` 202.

### `cellSegments`, written out in full (call 3)

The switch is one statement of 60 lines, and every case writes through `add` into `segs`, so no case can leave without either taking the accumulator or writing into it. The replacement: two helpers, each owning its own `segs` and `add` and holding a switch over its cases, the case clauses verbatim; `cellSegments` keeps the corner destructure and the four crossing points and hands each cell to one of them. In this order, directly above `cellSegments`:

```ts
function saddleSegments(
  idx: number,
  top: Point,
  right: Point,
  bottom: Point,
  left: Point,
  corners: readonly [number, number, number, number],
  iso: number,
): Seg[] {
  // lines 32 and 33, a blank line, lines 40 to 42, a blank line, line 44 (`switch (idx) {`),
  // lines 57 to 67 (case 5), lines 80 to 90 (case 10), lines 103 to 105 (`}`, `return segs;`, `}`)
}

function singleSegment(idx: number, top: Point, right: Point, bottom: Point, left: Point): Seg[] {
  // line 33, a blank line, lines 40 to 42, a blank line, lines 44 to 56 (the switch and cases 1 to 4),
  // lines 68 to 79 (cases 6 to 9), lines 91 to 105 (cases 11 to 14, `}`, `return segs;`, `}`)
}

// cellSegments: lines 25 to 32 (its signature and `const [a, b, c, d] = corners;`), a blank line, lines 35 to 38 (the four points), a blank line, then:
  return idx === 5 || idx === 10
    ? saddleSegments(idx, top, right, bottom, left, corners, iso)
    : singleSegment(idx, top, right, bottom, left);
}
```

Every cell still allocates one `segs`, one `add` closure and four points, as at the base, now in the helper; the call adds no allocation. The segments of a cell are pushed in the base's order, and the saddle's cell-centre average is computed from the same four numbers. The comment above `T_MIN` stays where it is.

### Measured on the dry run of the whole slice

The base exported from efa8fc43 into the scratchpad three times (`git archive`, so not a git checkout; the planning tree holds no production code): `814-engine-base`, the untouched base; `814-engine-copy`, a byte-identical second copy, the timing's noise control; and `814-engine-dry`, where the slice was written by `814-engine-split.ts` with the prune and the ceilings, then formatted. On it:

- **The red** (commit 1's prune and ceilings alone) was exactly the 11 errors of commit 1 below.
- **After the families**: `npm run check` exit 0; `npm run lint` exit 0; `npm run format:check` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` wrote a file byte-identical to `814-prune.ts`'s; the four targeted test sets passed 464, 49, 150 and 34, the counts they pass at the base (measured in the planning tree, a git checkout, at efa8fc43); the whole unit suite gave the same outcome as on the untouched copy (2,710 tests, 17 failing in both, every one a test that lists tracked files with git, `diff` of the two failure lists printing nothing); and in the planning tree `npm test` passes 2718 of 2718 at efa8fc43.
- **The statement proof and the clause proof** printed exactly the lines the commits below name.
- **A second build** from a fresh export, with the final family tool and a whole-tree `npm run format` (which rewrapped `legend-icons.ts`, `strip.ts` and `events.ts` and nothing else), reproduced every Appendix C hash and the same `src/` tree; the family tool run a second time on a written file threw (`the file is 85 lines, not 80`) and wrote nothing.
- **A third build**, after the plan skeptic's round, with the title lists typed read-only (call 17): every hash but `names-title.ts`'s unchanged, that one Appendix C's; `npm run check`, `npm run lint`, `npm run format:check` and the prune unchanged in verdict; both proofs printing byte-identical output to the second build's; SOCIETY 150 of 150; the set `2039 artifacts: 0 differ`; and the write probe of call 17 refused by the type checker on this build (`tsc exit 2`, the three errors Tests and guards names) and accepted on the build without the types (`tsc exit 0`).
- **The set** (Evidence): the base and the dry head drew 2,039 artifacts each, none throwing, and `814-engine-compare.ts` read `2039 artifacts: 0 differ`. The base manifest's sha256 was c80064e4118f7b4c6759b51ed4f0258dfadc693dc72c748499beee36c93c5936.
- **Reach**: under `NODE_V8_COVERAGE`, the base draw ran every line of every function this slice edits (`814-engine-cover.ts` over `contours.ts` 25 to 105, `feature-labels.ts` 138 to 189, `frame.ts` 28 to 80, `legend-icons.ts` 26 to 81, 83 to 149 and 151 to 217, `legend.ts` 176 to 249, `plate.ts` 28 to 81, `strip.ts` 229 to 281, `events.ts` 104 to 156 and `names.ts` 393 to 435: "all run" for each, `814-engine-coverage.txt`). So every case of the three icon switches and of `cellSegments` (both saddle branches included), all four ribbon event kinds and a found branch were drawn and compared.
- **The timing**: nine sweeps of `814-engine-bench.ts` (Evidence), 2026-10-19, load averages 3 to 7, five on a first dry head whose only difference from the final one was the `names.ts` cut (call 4), which no timed code reads: `marchingSquares` head over base 0.979 to 1.040, the untouched copy over base 0.961 to 1.051; `renderMap` topographic with the key, head over base 0.959 to 1.019, copy over base 0.957 to 1.003. No slowdown beyond the noise.

### Alternatives rejected

- **`cellSegments` split by index (cases 1 to 7, 8 to 14).** Both halves take the corners and the iso, and each lands at about 47, at the bound; the saddle split sizes them 40 and 45 and puts the ambiguous cases, which the spec names, in a helper of their own.
- **`cellSegments` as a lookup table of edge pairs.** It rewrites every case rather than moving it, and the clause proof could no longer read the cases as unchanged.
- **Helpers handed `add` or `segs`.** Each would write into a value it was handed (the governing call 13).
- **The icon helpers taking `ctx`**, the shape of `markIcon`, `areaIcon` and `seaIcon`: each would re-derive `style` and `k` with a statement of its own that runs (call 5).
- **One helper per icon group, holding several case clauses in a second switch**: it adds a second dispatch on the same kind.
- **`ENGLISH_BLOCKLIST` to `src/society/names-blocklist.ts`** (measured on a first dry run: `names.ts` 333, the new file 78, the set 0 differ): `test/society/names.test.ts` imports it from `names.ts`, so the import is re-pointed or `names.ts` re-exports it, a second home for the name; the title lists move with no citation to re-point (call 4).
- **`MapTitle` moving with the title lists**: `src/world/generate.ts` imports the type from `names.ts`.
- **The base maker (`createBaseMaker` and its helpers) to a sibling**: it reads `ENGLISH_BLOCKLIST` and `isNearExisting`, which `names.ts` exports to other modules, so the sibling would import back from `names.ts`, a cycle.
- **`titleBand` or `eventNodes` cut at an expression where a statement serves** (the title element, the branch's path): more names, or an expression where a statement fits.
- **`branchEvents` handing back the branch found at a step**: it would turn the `out.push` and the `lastK` write into a return, a rewrite rather than a move.

## Files

Created: `src/society/names-title.ts`; `handbook/plans/814/814-engine-plan.md` (this file).

Edited: the nine files of the table; `eslint-suppressions.json` (9 entries out, 17 left); `test/repo/lint-config.test.ts` (the nine files' `LIST_AT_REFORMAT` lines out, and nothing else). Nothing else; in particular no other test file, no file under `e2e/`, `scripts/`, `test-support/` or `.claude/`, no spec and no errata row. Appendix A lists every moved range; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path; `<base>` is efa8fc430b8f9909e9658fa47c69939b4253024e):

- **Reused**, unchanged: `814-prune.ts` (sha256 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032) and `814-test-proof.ts` (3ed5f9dc89537e812d3f89f9dfce81c178736680b318b864e75def91c1d0a707), the governing plan's Appendix B; `814-tests-size.ts` (b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43) and `814-tests-counts.ts` (e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04), pull request 2's Appendix B. Check with `shasum -a 256`; a file missing or different is written again from its appendix.
- **This slice's**, written exactly as Appendix B gives them (the planning copies are in the scratchpad under these names, and `shasum -a 256` must print the hash given there): `814-engine-split.ts` (the family tool), `814-engine-draw.ts` (ruling 3's set), `814-engine-compare.ts`, `814-engine-clauses.ts` (the clause proof) and `814-engine-bench.ts` (the timing).

Each loads the repo's own modules by path, so it runs from any directory, on bare `node`. The draw and the bench import only `src/`, which needs no `node_modules`.

## Commits

Branch `chore/814-size-engine`. The four targeted test sets, named below by their label:

- **RENDER**: the 45 files `test/render/*.test.ts` held at efa8fc43 and `test/site/hero-charts.test.ts`, as one comma-separated family for `814-tests-counts.ts`, exactly `test/render/ages-track.test.ts,test/render/chronicle-scrubber.test.ts,test/render/compass-placement.test.ts,test/render/currents.test.ts,test/render/cvd.test.ts,test/render/favicon.test.ts,test/render/field.test.ts,test/render/former-name-reach.test.ts,test/render/former-name-surfaces.test.ts,test/render/furniture.test.ts,test/render/heraldry.test.ts,test/render/iso.test.ts,test/render/label-claim-geometry.test.ts,test/render/label-overlap.test.ts,test/render/legend.test.ts,test/render/map-renderer.test.ts,test/render/og-card.test.ts,test/render/og-stamp.test.ts,test/render/place-card.test.ts,test/render/place-manifest.test.ts,test/render/range-label.test.ts,test/render/realm-label-placement.test.ts,test/render/realm-labels.test.ts,test/render/realm-legibility.test.ts,test/render/realm-tints.test.ts,test/render/recipe-meta.test.ts,test/render/region-coast.test.ts,test/render/region-lake-label.test.ts,test/render/region-realms.test.ts,test/render/region-scalebar.test.ts,test/render/region-sea-furniture.test.ts,test/render/river-labels.test.ts,test/render/ruins.test.ts,test/render/settlements.test.ts,test/render/survey.test.ts,test/render/svg.test.ts,test/render/terrain-legend.test.ts,test/render/voyage-geometry.test.ts,test/render/voyage-route-sea.test.ts,test/render/voyage-route.test.ts,test/render/voyage-tour.test.ts,test/render/voyage-travel.test.ts,test/render/voyage-water.test.ts,test/render/voyage.test.ts,test/render/wind-streams.test.ts,test/site/hero-charts.test.ts`: 464 tests at the base.
- **TERRAIN**: `test/terrain/contours.test.ts,test/terrain/window.test.ts,test/terrain/detail-guarantees.test.ts,test/terrain/detail-guarantees-world.test.ts,test/render/region-coast.test.ts`: 49.
- **SOCIETY**: `test/society/bestiary.test.ts,test/society/hamlets.test.ts,test/society/heraldry.test.ts,test/society/history.test.ts,test/society/lore.test.ts,test/society/names.test.ts,test/society/philology-lexicon.test.ts,test/society/philology.test.ts,test/society/realms-barrier.test.ts,test/society/realms-landmass.test.ts,test/society/realms-synthetic.test.ts,test/society/realms.test.ts,test/society/renames.test.ts,test/society/roads-realm.test.ts,test/society/roads.test.ts,test/society/sites.test.ts,test/world/golden-seed42.test.ts,test/world/covenant-seed42.test.ts,test/world/culture-pin.test.ts,test/prospect/letter.test.ts`: 150.
- **ITINERARY**: `test/itinerary/event-seats.test.ts,test/itinerary/events.test.ts,test/itinerary/fork-keys.test.ts,test/itinerary/ribbon-frame.test.ts,test/itinerary/route.test.ts,test/site/ribbon-job.test.ts`: 34.

**Commit 1: the plan, the red and the base's records.**

1. Copy this file to `handbook/plans/814/814-engine-plan.md`.
2. `node <scratch>/814-prune.ts <repo> src/itinerary/dress/plate.ts src/itinerary/dress/strip.ts src/itinerary/events.ts src/render/layers/feature-labels.ts src/render/layers/frame.ts src/render/layers/legend-icons.ts src/render/layers/legend.ts src/society/names.ts src/terrain/contours.ts` prints `9 entries deleted, 17 left`.
3. `node <scratch>/814-engine-split.ts <repo> ceilings` prints `ceilings: written` (it deletes the nine files' `LIST_AT_REFORMAT` lines, and nothing else). Then `shasum -a 256 eslint-suppressions.json test/repo/lint-config.test.ts` prints Appendix C's first two hashes (measured: they need no formatting).
4. `npm run lint` exits 1 with exactly these 11 errors and no other (measured): `src/itinerary/dress/plate.ts` 28:1 `titleBand` (54); `src/itinerary/dress/strip.ts` 229:1 `eventNodes` (53); `src/itinerary/events.ts` 104:1 `branchEvents` (53); `src/render/layers/feature-labels.ts` 138:1 `rangeLabelNodes` (52); `src/render/layers/frame.ts` 28:8 `frameLayer` (52); `src/render/layers/legend-icons.ts` 26:1 `markIcon` (56), 83:1 `areaIcon` (67) and 151:1 `seaIcon` (67); `src/render/layers/legend.ts` 176:8 `legendLayer` (70); `src/society/names.ts` 426:1 `max-lines` (410); `src/terrain/contours.ts` 25:1 `cellSegments` (78). `npm test -- test/repo/lint-config.test.ts` passes.
5. Before any file under `src/` changes, take the base's records:
   - `node <scratch>/814-engine-draw.ts <repo> <repo>/out/814-engine-base` prints `atlas: 33 artifacts, 0 threw`, `chart: 800 ...`, `contours: 20 ...`, `namer: 10 ...`, `ribbon: 1010 ...`, `town: 146 ...`, `world: 20 ...`, each `0 threw`, then `total: 2039 artifacts in` 60 to 90 s, and exits 0. Note the sha256 of `<repo>/out/814-engine-base/manifest.txt` in the body: the planning run read c80064e4118f7b4c6759b51ed4f0258dfadc693dc72c748499beee36c93c5936 on Node v26.12.0; another value names another Node or machine and is not a stop, since the comparison is base against head on yours.
   - `git -C <repo> archive -o <scratch>/814-engine-bench.tar efa8fc430b8f9909e9658fa47c69939b4253024e src`, then `mkdir -p <scratch>/814-engine-bench-base <scratch>/814-engine-bench-copy`, then `tar -xf <scratch>/814-engine-bench.tar -C <scratch>/814-engine-bench-base`, then the same into `<scratch>/814-engine-bench-copy`, one command each.
   - `node <scratch>/814-tests-counts.ts <repo> <RENDER> <TERRAIN> <SOCIETY> <ITINERARY>` prints tests 464, 49, 150 and 34, each `exit 0` and `fail 0`.
   - `npm test`, then `npm run astro:generate`: every test passes, and the total it prints is the base total the closing check compares with (2718 at efa8fc43, measured; a main that moved under files outside this slice may give another, which is then the number).
6. Commit `#814 The plan, and the lint red on the overruns pull request 5 splits`. Push.

**Commits 2 to 10: one family each, in this order.** For each, with `<family>`, its files and its set from the table:

1. `node <scratch>/814-engine-split.ts <repo> <family>` prints `<family>: written`.
2. `npm run format`; then `npm run format:check` passes.
3. `node <scratch>/814-tests-size.ts <repo> 45 <the family's files>` prints exactly the family's lines below (every function of 45 lines of code or more in its files, untouched ones included), and nothing else.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes.
6. `node <scratch>/814-test-proof.ts <repo> <base> <family spec>` and `node <scratch>/814-engine-clauses.ts <repo> <base> <family spec>` print the verdicts in the table, and for a `DIFF` the lines named after it and no other (`<family spec>` is `<path>=<path>`, or for `names` `src/society/names.ts=src/society/names.ts,src/society/names-title.ts`).
7. `node <scratch>/814-tests-counts.ts <repo> <the set>` prints the base count, `exit 0`, `fail 0`.
8. Commit with the message in the table.

| # | family | files | statement proof | clause proof | set | commit message |
|---|---|---|---|---|---|---|
| 2 | `feature-labels` | `src/render/layers/feature-labels.ts` | `same`, 130 -> 130 statements, new functions [rangeBlob] | `same`, 42 -> 42 | RENDER | `#814 rangeLabelNodes takes the range's blob from a helper` |
| 3 | `frame` | `src/render/layers/frame.ts` | `same`, 22 -> 22, [frameMetrics] | `same`, 6 -> 6 | RENDER | `#814 frameLayer takes its measures from a helper` |
| 4 | `legend-icons` | `src/render/layers/legend-icons.ts` | `DIFF`, 38 -> 39, [currentIcon, hypsoIcon, realmIcon, roadIcon, windIcon] (S1) | `DIFF`, 33 -> 33 (C1) | RENDER | `#814 The three legend icon switches give their largest cases to helpers` |
| 5 | `legend` | `src/render/layers/legend.ts` | `same`, 112 -> 112, [legendPanel] | `same`, 21 -> 21 | RENDER | `#814 legendLayer takes the key's panel from a helper` |
| 6 | `contours` | `src/terrain/contours.ts` | `DIFF`, 166 -> 171, [saddleSegments, singleSegment] (S2) | `DIFF`, 65 -> 69 (C2) | TERRAIN, then RENDER | `#814 cellSegments hands its cases to two helpers, the saddles and the rest` |
| 7 | `names` | `src/society/names.ts`, `src/society/names-title.ts` | `same`, 81 -> 81, [] | `same`, 681 -> 681 | SOCIETY | `#814 The map title's word lists leave names.ts for a module of their own, typed read-only` |
| 8 | `plate` | `src/itinerary/dress/plate.ts` | `DIFF`, 20 -> 21, [subtitleLines] (S3) | `DIFF`, 20 -> 21 (C3) | ITINERARY | `#814 titleBand takes its two subtitle lines from a helper` |
| 9 | `strip` | `src/itinerary/dress/strip.ts` | `same`, 135 -> 135, [waypointLines] | `DIFF`, 39 -> 39 (C4) | ITINERARY | `#814 eventNodes takes a waypoint's caption lines from a helper` |
| 10 | `events` | `src/itinerary/events.ts` | `same`, 93 -> 93, [branchWalk] | `same`, 3 -> 3 | ITINERARY | `#814 branchEvents takes the branch's walk from a helper` |

Step 3's expected output, per family (measured on the third build):

```
feature-labels:  src/render/layers/feature-labels.ts: 365 lines of code
                     line 148: Function 'rangeLabelNodes' 48
                     line 338: Function 'featureLabelsLayer' 47
frame:           src/render/layers/frame.ts: 81 lines of code
                     line 38: Function 'frameLayer' 47
legend-icons:    src/render/layers/legend-icons.ts: 251 lines of code
legend:          src/render/layers/legend.ts: 233 lines of code
contours:        src/terrain/contours.ts: 307 lines of code
                     line 68: Function 'singleSegment' 45
names:           src/society/names.ts: 390 lines of code
                 src/society/names-title.ts: 22 lines of code
plate:           src/itinerary/dress/plate.ts: 136 lines of code
strip:           src/itinerary/dress/strip.ts: 312 lines of code
                     line 240: Function 'eventNodes' 48
events:          src/itinerary/events.ts: 202 lines of code
                     line 122: Function 'branchEvents' 47
```

The family label on the left is not printed; the tool indents a function's line by four spaces. `featureLabelsLayer` is untouched and stands at 47 at the base too.

Every statement-proof line also reads `0 -> 0 tests, 0 -> 0 assertions`. The named DIFF lines, exactly as the tools print them (each cut at 200 characters), measured:

**S1** (`legend-icons`, statement proof): the three switch statements read as changed, and the realm case's return, now a statement of its own in `realmIcon`, as added:

```
      statement gone: switch ( icon . kind ) { case "settlement" : return settlementGlyph ( icon . tier , cx , cy + ( icon . tier === "capital" || icon . tier === "seat" ? 3 * k : 0 ) , ctx ) ; case "ruin" : return ruin...
      statement gone: switch ( icon . kind ) { case "realm" : return el ( "rect" , { x : cx - 9 * k , y : cy - 6 * k , width : 18 * k , height : 12 * k , rx : 2 * k , fill : style . realmTints [ 0 ] , "fill-opacity" : 0...
      statement gone: switch ( icon . kind ) { case "sounding" : return el ( "text" , { x : cx , y : cy + 3 * k , "text-anchor" : "middle" , "font-family" : style . fontFamily , "font-size" : ( 10 * k ) . toFixed ( 1 ) ...
      statement added: switch ( icon . kind ) { case "settlement" : return settlementGlyph ( icon . tier , cx , cy + ( icon . tier === "capital" || icon . tier === "seat" ? 3 * k : 0 ) , ctx ) ; case "ruin" : return ruin...
      statement added: return el ( "rect" , { x : cx - 9 * k , y : cy - 6 * k , width : 18 * k , height : 12 * k , rx : 2 * k , fill : style . realmTints [ 0 ] , "fill-opacity" : 0.5 , stroke : style . name === "topograp...
      statement added: switch ( icon . kind ) { case "realm" : return realmIcon ( cx , cy , style , k ) ; case "hypso" : return hypsoIcon ( cx , cy , style , k ) ; case "contour" : return el ( "path" , { d : `M${ ( cx - ...
      statement added: switch ( icon . kind ) { case "sounding" : return el ( "text" , { x : cx , y : cy + 3 * k , "text-anchor" : "middle" , "font-family" : style . fontFamily , "font-size" : ( 10 * k ) . toFixed ( 1 ) ...
```

**C1** (`legend-icons`, clause proof): exactly the five clauses that now call a helper, every other clause the same:

```
      gone   clause: case "road" : { const trunk = icon . rank === "trunk" ; const x1 = cx - 10 * k ; const x2 = cx + 10 * k ; const d = `M${ x1 . toFixed ( 1 ) } ${ cy . toFixed ( 1 ) }H${ x2 . toFixed ( 1 ) }...
      gone   clause: case "realm" : return el ( "rect" , { x : cx - 9 * k , y : cy - 6 * k , width : 18 * k , height : 12 * k , rx : 2 * k , fill : style . realmTints [ 0 ] , "fill-opacity" : 0.5 , stroke : sty...
      gone   clause: case "hypso" : { const stops = style . hypsometric ?? [ ] ; const n = stops . length ; const segW = ( 20 * k ) / Math . max ( 1 , n ) ; return el ( "g" , { } , stops . map ( ( s , i ) => el...
      gone   clause: case "wind" : { const x1 = cx - 10 * k ; const x2 = cx + 10 * k ; const hl = 5 * k ; return el ( "path" , { d : `M${ x1 . toFixed ( 1 ) } ${ cy . toFixed ( 1 ) }L${ x2 . toFixed ( 1 ) } ${ ...
      gone   clause: case "current" : { const x1 = cx - 10 * k ; const x2 = cx + 10 * k ; const hl = 4 * k ; const a = Math . PI * 0.78 ; return el ( "path" , { d : `M${ x1 . toFixed ( 1 ) } ${ ( cy + 3 * k ) ....
      added  clause: case "road" : return roadIcon ( icon , cx , cy , style , k ) ;
      added  clause: case "realm" : return realmIcon ( cx , cy , style , k ) ;
      added  clause: case "hypso" : return hypsoIcon ( cx , cy , style , k ) ;
      added  clause: case "wind" : return windIcon ( cx , cy , style , k ) ;
      added  clause: case "current" : return currentIcon ( cx , cy , style , k ) ;
```

**S2** (`contours`, statement proof): the one switch gone, the two new switches, the second copy of the accumulator and its `add`, the second corner destructure (for the saddles' centre), and the dispatching return:

```
      statement gone: switch ( idx ) { case 1 : add ( bottom , left ) ; break ; case 2 : add ( right , bottom ) ; break ; case 3 : add ( right , left ) ; break ; case 4 : add ( top , right ) ; break ; case 5 : {…} case ...
      statement gone: return segs ;
      statement added: switch ( idx ) { case 5 : {…} case 10 : {…} }
      statement added: add = ( p , q ) => {…} ;
      statement added: switch ( idx ) { case 1 : add ( bottom , left ) ; break ; case 2 : add ( right , bottom ) ; break ; case 3 : add ( right , left ) ; break ; case 4 : add ( top , right ) ; break ; case 6 : add ( top...
      statement added: segs . push ( [ p [ 0 ] , p [ 1 ] , q [ 0 ] , q [ 1 ] ] ) ;
      statement added: [ a , b , c , d ] = corners ;
      statement added: return idx === 5 || idx === 10 ? saddleSegments ( idx , top , right , bottom , left , corners , iso ) : singleSegment ( idx , top , right , bottom , left ) ;
      statement added: segs = [ ] ;
```

**C2** (`contours`, clause proof): all fourteen case clauses read the same, whole; the only additions are the second `add`'s array elements:

```
      added  element: p [ 0 ]
      added  element: p [ 1 ]
      added  element: q [ 0 ]
      added  element: q [ 1 ]
```

**S3** (`plate`, statement proof): `titleBand`'s return gone and added with the spread, and `subtitleLines`' return added:

```
      statement gone: return [ el ( "text" , { x : cx , y : top + 30 , "text-anchor" : "middle" , "font-family" : c . style . fontFamilyTitle , "font-size" : r1 ( fit ) , "letter-spacing" : 1.4 , fill : c . ink , } , [ ...
      statement added: return [ el ( "text" , { x : cx , y : top + 47 , "text-anchor" : "middle" , "font-family" : c . style . fontFamily , "font-size" : 11.5 , "font-style" : "italic" , fill : c . soft , } , [ subtitle ...
      statement added: return [ el ( "text" , { x : cx , y : top + 30 , "text-anchor" : "middle" , "font-family" : c . style . fontFamilyTitle , "font-size" : r1 ( fit ) , "letter-spacing" : 1.4 , fill : c . ink , } , [ ...
```

**C3** (`plate`, clause proof): every element reads the same but the spread:

```
      added  element: ... subtitleLines ( c , subtitle , cx , top )
```

**C4** (`strip`, clause proof): the waypoint clause, whole, with the call in place of the `lines` declaration:

```
      gone   clause: case "waypoint" : { nodes . push ( settlementCluster ( c , p . sx , p . sy - 1 , e . tier ) ) ; const lines = e . endpoint ? [ { text : caption , caps : true , size : 10.5 } ] : [ { text : ...
      added  clause: case "waypoint" : { nodes . push ( settlementCluster ( c , p . sx , p . sy - 1 , e . tier ) ) ; const lines = waypointLines ( e , caption ) ; laid = captionNodes ( c , strip , p . sx , p . ...
```

Each tool's last line reads `1 families against efa8fc430b8f9909e9658fa47c69939b4253024e: 1 differ` for a DIFF family and `0 differ` for a `same` one.

**Commit 7 also proves its lock** (call 17), before it commits: write `out/814-ro/probe.ts` holding the four lines `import { AGES, TITLE_ADJECTIVES, TITLE_PATTERNS } from "../../src/society/names-title.ts";`, `AGES.push("Salt");`, `TITLE_ADJECTIVES.push("Salt");` and `TITLE_PATTERNS.island = [];`; run `npx tsc --noEmit --allowImportingTsExtensions --module nodenext --moduleResolution nodenext --target esnext --strict --skipLibCheck --types node out/814-ro/probe.ts`, which exits 2 with exactly `out/814-ro/probe.ts(2,6): error TS2339: Property 'push' does not exist on type 'readonly string[]'.`, `out/814-ro/probe.ts(3,18): error TS2339: Property 'push' does not exist on type 'readonly string[]'.` and `out/814-ro/probe.ts(4,16): error TS2540: Cannot assign to 'island' because it is a read-only property.` (measured; the same probe exits 0 on the build without the types); then delete the probe and its folder.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: byte-identical).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes every test, the same total as commit 1's run (2718 of 2718 at efa8fc43, measured in the planning tree; no test is added or removed), then `npm run astro:generate`.
- `git check-ignore -v src/society/names-title.ts` exits 1.
- **The set at the head**: `node <scratch>/814-engine-draw.ts <repo> <repo>/out/814-engine-head` prints the seven count lines of commit 1, `total: 2039 artifacts`, exit 0; then `node <scratch>/814-engine-compare.ts <repo>/out/814-engine-base <repo>/out/814-engine-head` prints `atlas: 33 same, 0 differ`, `chart: 800 same, 0 differ`, `contours: 20 same, 0 differ`, `namer: 10 same, 0 differ`, `ribbon: 1010 same, 0 differ`, `town: 146 same, 0 differ`, `world: 20 same, 0 differ` and `2039 artifacts: 0 differ`, exit 0.
- **The timing**: `node <scratch>/814-engine-bench.ts <scratch>/814-engine-bench-base <scratch>/814-engine-bench-copy <repo>` prints two lines, `marchingSquares` and `renderMap topographic`, each with the copy's and the head's median ratio to the base. Run it with no other suite running. A run whose copy-over-base ratio on either line falls outside 0.90 to 1.10 is too noisy to read and is run again; on a run whose two copy ratios fall inside, each head-over-base ratio is at most 1.10 (the bound, Evidence).
- No e2e suite runs locally: no file under `e2e/` changes. CI runs every lane, whose `R4` (`e2e/suites/render.ts`) compares the browser worker's draw with the committed chart.
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword beside the number: `Issue: #814, stays open because three more pull requests follow (plan: handbook/plans/814/814-engine-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.

## Tests and guards

No test is added, strengthened or restructured, so no new guard's red is written: the red is commit 1's lint, and the guards are the lint's two caps. The one new guard is the type checker's hold on the three title lists (call 17), proved both ways by commit 7's probe, as pull request 2's commit 10 proved `VALUE_WRAPPERS`' lock. `vellum-guard-prover` is not owed: the governing call 10 owes bite parity on a helper that holds assertions, and no test file changes but `test/repo/lint-config.test.ts`'s nine ceiling lines, which the governing design lowers in every pull request; the lock's refusal is measured directly by the probe, as pull request 2 measured `VALUE_WRAPPERS`'. `vellum-plate-reader` is not owed: nothing changes an appearance (governing call 12), which the byte-identical set measures.

**What holds what.** The byte set holds every artifact the engine draws for these worlds and options. The statement proof holds that every statement the slice moves keeps its text (a multiset, nested blocks elided). The clause proof holds every switch clause and array element whole, so a reorder inside a moved case reads DIFF there. What none of the three reads is the order of statements within a moved run outside a case clause (the proof compares multisets, and a reorder there may move no byte): that order is held by the family tool, which copies base line ranges in order, and by Appendix C's hashes, which pin the head's bytes to the text reviewed here.

**The instrument bites** (each planted in a scratch copy of the final dry head, drawn, and compared with the base, 2026-10-19):

| witness | plant | read |
|---|---|---|
| W1 | in `saddleSegments`, case 5's `if (center > iso)` becomes `if (center < iso)` | 821 differ: atlas 21, chart 780, contours 20 |
| W1a | in the same branch, `add(top, left);` and `add(bottom, right);` swap | the set 0 of 2,039 (a segment order inside one saddle cell that no chain start depends on), the statement proof `DIFF` only on S2's own lines; the clause proof reads `gone clause: case 5 : { ... add ( top , left ) ; add ( bottom , right ) ; ...` and its swapped twin added |
| W2 | in `waypointLines`, the endpoint caption's `size: 10.5` becomes `size: 10.6` | ribbon 1010 differ, nothing else |
| W4 | in `src/society/names-title.ts`, `AGES`' `"Lantern"` becomes `"Lanthorn"` | 41 differ: world 1, chart 40 |

These run at planning and need not be run again: the tools are pinned by their hashes.

## Rosters and doctrine

- **Joined by itself, nothing by hand**: `src/society/names-title.ts` is reached by `tsconfig.engine.json` (every `.ts` under `src/` outside `src/site/`), by the lint's TypeScript roots and by `vellum/world-no-philology`'s `src/society/**` glob, and reaches the worker bundle through `names.ts`'s import. No test reads it as text, so `SOURCE_READS` is unchanged.
- **Citations hold**: every symbol prose or a test names stays in its file (Recon). `handbook/specs/engine-invariants.md`'s sentence on `marchingSquares` stays true of it. No spec, agent, skill or test message is re-pointed.
- **No spec line changes, and no errata row** is added or removed.

## Evidence

The commands above, in order: commit 1's red and base records; per family the size, lint, hash, statement-proof, clause-proof and count checks; the closing checks, the set and the timing; CI's lanes and unit shards on the pull request. In the body, and as a pull request comment with the harness named (workflow step 10, since `out/` is not tracked): the compare's eight lines, both manifests' sha256, and the timing's two lines. **No regen is owed** (Gate 6 item 7), on three commands: the compare's `2039 artifacts: 0 differ`, and `npm test`'s `test/site/hero-charts.test.ts` (the drift guard) and `test/world/golden-seed42.test.ts` (the golden) green. The e2e suites the change touches by file: none.

## Calls made (each open to overrule)

1. **One commit per family, written by a tool from base line ranges** (`814-engine-split.ts`), each checked on its own before the next. Rule: pull request 2's call 10; pull request 3's call 1.
2. **The cut per function is chosen by "How a cut is chosen"**: whole statements, case blocks or array elements; never a run that leaves by `return`, `break` or `continue`, writes a `let` it does not declare, or writes into a value from outside; then the fewest helpers, the fewest names crossing, the most headroom, the later run, top level before a block; each runner-up named in "Per function". Rule: the governing "What a split may change" and call 13; pull request 4's call 2, whose ranking this keeps, read for case clauses and array elements.
3. **`cellSegments` is written out in full as `saddleSegments` and `singleSegment`**, each owning its `segs` and `add`, every case clause verbatim. Rule: the governing K5 ("the plan writes the replacement out in full" where no statement cut exists) and call 13; the saddle split rather than the index split because it names the ambiguous cases `handbook/specs/engine-invariants.md` names and sizes both halves with headroom (40 and 45, measured).
4. **`names.ts` gives the map title's three word lists to `src/society/names-title.ts`.** Rule: pull request 1's call 6 ("the fewest citations to re-point"): it is the one cut that fits with nothing to re-point, since `CULTURES` and `makeMapTitle` are cited in their file, `MapTitle` and `isNearExisting` are imported from it, and `ENGLISH_BLOCKLIST` is imported from it by `test/society/names.test.ts`; within the margin at 390.
5. **The icon helpers take `cx`, `cy`, `style` and `k` (`roadIcon` also `icon`), not `ctx`.** Rule: the governing "What a split may change: nothing that runs": taking `ctx` would add a statement deriving `style` and one deriving `k` to each.
6. **Every helper is declared directly above the function that calls it, in the order it is called, and none is exported**; the title lists are exported from their module alone. Rule: the governing K1 and K5; Issue #654 row 9a's K5.
7. **The set**: seeds 1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 17, 18, 21, 22, 24, 26, 33, 34, 35 and 42, which span the four map types, the three climate bands and all ten cultures, the hero among them; each world in every style crossed with no theme and every theme, with and without the key (40 charts); the contours `marchingSquares` and `closedIsoRings` draw at the sea level and eight levels above it; the ribbon from every settlement as departure, to its default destination, in both dresses; and, for seeds 3, 33 and 42 (a city-state, a five-seat continent and the hero), every town picture in both dresses and the bound atlas's plates, its two region sheets among them; plus a thousand names from each culture's namer. Rule: ruling 3; the governing K5 ("the slice planner of pull requests 5 and 6 fixes the seeds, the towns and the commands") and call 15 (the comparison reaches the code it vouches for), measured by coverage; `src/atlas/thematic.ts` records that the Explorer crosses every style with every theme. Pull request 6 can reuse the tool as it stands.
8. **The town pictures stay in the set**, though they reach this slice's code only through the world's names. Rule: ruling 3 names them.
9. **The draw tool writes a manifest of hashes, and the artifacts only with `--files`.** Rule: the artifacts are about 1.6 GB a side; a differ is a hand-back, and `--files` reproduces it for whoever reads it.
10. **The clause proof joins the statement proof.** Rule: the statement proof elides nested blocks and reads a switch as one statement, which W1a measured blind to a reorder inside a case.
11. **The timing's bound is 1.10**, head over base, on a run whose untouched copy reads within 0.90 to 1.10. Rule: `CLAUDE.md`'s "a bound is derived, and where no principle gives the number, sweep first and set it above the worst case with the headroom named": nine sweeps put the copy's worst at 1.051, and the headroom is about that swing again; Issue #654 row 9b's regression read 2.5.
12. **No prover, no plate reader.** Rule: the governing call 10 (bite parity is for helpers that hold assertions) and call 12 (nothing changes an appearance).
13. **The prospect plate pins are not cited as evidence for this slice.** Rule: recon (they reach none of the nine files); workflow step 10 (every claim names the command that reaches it).
14. **"No regen owed" is named by its commands** in the body. Rule: `vellum-footguns` Gate 6 item 7.
15. **The names**, under ruling 1 (they stand unless Alex objects): the file `src/society/names-title.ts`; the functions `rangeBlob`, `frameMetrics`, `roadIcon`, `realmIcon`, `hypsoIcon`, `windIcon`, `currentIcon`, `legendPanel`, `saddleSegments`, `singleSegment`, `subtitleLines`, `waypointLines` and `branchWalk`, each named for what it draws, measures or holds.
16. **The new module carries no header comment.** Rule: Issue #673 call 6; pull request 3's call 11.
17. **The three title lists are exported typed read-only** (`readonly string[]`, `Readonly<Record<MapType, readonly string[]>>`), a type-only change of text the type stripping erases, so nothing that runs changes and the set and both proofs read the same. Rule: Alex's ruling on pull request 2 (comment 6256728145, "Lock it in this PR"), on a list a split newly shared, which the plan skeptic's finding 4 found these three to be (module-private at the base, they decide world titles); `handbook/specs/check-placement.md` "The type checker" ("make a wrong state unrepresentable"); `CULTURES` beside them is `readonly Culture[]`.
18. **`frameMetrics` keeps an inferred return type**, the one new helper without a written one. Rule: its return statement is its type, a bag of six numbers; `metrics` in `src/render/layers/legend.ts`, the house's other measures helper, carries none; the type checker and the lint pass on it.

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, this plan's draft and recon's ledger. It rebuilt the whole slice from an archive of efa8fc43 with the plan's own tools and reproduced the 11-error red, all twelve Appendix C hashes of the draft, every head size, the S1 to S3 and C1 to C4 lines, the 2,039-artifact set with the base manifest's sha256, and one timing run inside the bound; it counted both saddle branches of both cases reaching the contours (case 5 above the iso 215 times, below 202; case 10 above 181, below 196). 0 blocking, 3 should-fix, 3 nits; 30 claims checked, 1 wrong. Five folded, one rejected:

1. (should-fix) Step 3 pointed at a section "Per family" this plan does not have, and the size tool also prints the untouched `featureLabelsLayer` at 47. Folded: step 3 names exact expected lines per family, `featureLabelsLayer` among them.
2. (should-fix) The closing `npm test` was held to a fixed 2718, which a main moving under unrelated files would break after nine pushed commits. Folded: commit 1 records `npm test`'s total, and the closing check and its stop compare with it.
3. (should-fix) The RENDER and SOCIETY sets were described, not written out. Folded: both are literal comma lists.
4. (nit) The three title lists became importable and writable by the move. Folded as call 17: they are typed read-only, on Alex's pull request 2 ruling; a third build measured it (Measured on the dry run) and commit 7 proves the lock both ways.
5. (nit) Commit 1 did not check its two files' hashes. Folded: commit 1's step 3 does.
6. (nit) `frameMetrics` is the one new helper without a written return type. Rejected, as call 18 says why.

The planner found its own "Per family" slip and the unwritten lists before the skeptic reported; both are the same fixes as findings 1 and 3.

## Open decisions

none. This slice meets no question the governing plan, its rulings and the house rules named above do not answer, so nothing goes to Alex under ruling 2; the calls above stand unless he overrules one.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than 6263410412 (2026-10-19T08:51:52Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat efa8fc430b8f9909e9658fa47c69939b4253024e origin/main -- src/render/layers src/terrain/contours.ts src/society src/itinerary eslint-suppressions.json test/repo/lint-config.test.ts` prints anything before the first commit.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `9 entries deleted, 17 left`, or commit 1's lint red is not exactly the 11 errors listed.
- The draw at commit 1 exits non-zero, any artifact throws, or the counts are not 33, 800, 20, 10, 1010, 146 and 20.
- The family tool throws (an anchor line is not what efa8fc43 held) or prints anything but `<family>: written`.
- After `npm run format`, a file's sha256 is not Appendix C's, a file is over 395 lines of code, or a function the slice writes or shortens is over 48, as `814-tests-size.ts` counts them; or `npm run format` changes a file outside the family.
- The statement proof or the clause proof prints a verdict, a count or a line the table does not name, or misses one it does.
- A targeted set's count differs from its base count, or any of its tests fails.
- `npm run check` or `npm run lint` fails, the prune writes a diff, `npm test` fails a test, or its total differs from commit 1's.
- Commit 7's probe exits other than 2, or prints other than the three errors named.
- The compare prints any differ, or a count other than 2039.
- The timing reads a head-over-base ratio above 1.10 on either line of a run whose copy ratios are both within 0.90 to 1.10, or three runs in a row read a copy ratio outside that range.

## Appendix A: every range, at efa8fc43

The family tool (Appendix B) is the exact form; this is its prose, for review. First and last lines are trimmed of indentation and cut at 70 characters.

| file | lines | first | last | where it goes |
|---|---|---|---|---|
| `src/render/layers/feature-labels.ts` | 143 to 147 | `const { w, h } = world.elev;` | `});` | into `rangeBlob` |
| `src/render/layers/frame.ts` | 30 to 35 | `const m = proj.margin;` | `const innerH = h - 2 * m;` | into `frameMetrics` |
| `src/render/layers/legend-icons.ts` | 48 to 78 | `const trunk = icon.rank === "trunk";` | `});` | the road case's block, into `roadIcon` |
| `src/render/layers/legend-icons.ts` | 88 to 99 | `return el("rect", {` | `});` | the realm case's return, into `realmIcon` |
| `src/render/layers/legend-icons.ts` | 101 to 116 | `const stops = style.hypsometric ?? [];` | `);` | the hypso case's block, into `hypsoIcon` |
| `src/render/layers/legend-icons.ts` | 183 to 197 | `const x1 = cx - 10 * k;` | `});` | the wind case's block, into `windIcon` |
| `src/render/layers/legend-icons.ts` | 200 to 214 | `const x1 = cx - 10 * k;` | `});` | the current case's block, into `currentIcon` |
| `src/render/layers/legend.ts` | 182 to 208 | `const children: SvgNode[] = [` | `];` | into `legendPanel` |
| `src/terrain/contours.ts` | 32 to 33 | `const [a, b, c, d] = corners;` | `const segs: Seg[] = [];` | into `saddleSegments` (both lines) and `singleSegment` (line 33) |
| `src/terrain/contours.ts` | 40 to 42 | `const add = (p: Point, q: Point): void => {` | `};` | into both helpers |
| `src/terrain/contours.ts` | 45 to 56 | `case 1:` | `break;` | cases 1 to 4, into `singleSegment` |
| `src/terrain/contours.ts` | 57 to 67 | `case 5: {` | `}` | case 5, into `saddleSegments` |
| `src/terrain/contours.ts` | 68 to 79 | `case 6:` | `break;` | cases 6 to 9, into `singleSegment` |
| `src/terrain/contours.ts` | 80 to 90 | `case 10: {` | `}` | case 10, into `saddleSegments` |
| `src/terrain/contours.ts` | 91 to 102 | `case 11:` | `break;` | cases 11 to 14, into `singleSegment` |
| `src/society/names.ts` | 393 to 406 | `const TITLE_ADJECTIVES = [` | `];` | `TITLE_ADJECTIVES`, exported as `readonly string[]`, into `src/society/names-title.ts` |
| `src/society/names.ts` | 408 to 408 | `const AGES = ["Lantern", "Ember", "Tide", "Crane", "Iron", "Pale", ...` | `const AGES = ["Lantern", "Ember", "Tide", "Crane", "Iron", "Pale", ...` | `AGES`, exported as `readonly string[]`, into the same |
| `src/society/names.ts` | 410 to 415 | `const TITLE_PATTERNS: Record<MapType, readonly string[]> = {` | `};` | `TITLE_PATTERNS`, exported as `Readonly<Record<MapType, readonly string[]>>`, into the same, which opens with `names.ts` line 2 (the `MapType` import) and a blank line |
| `src/itinerary/dress/plate.ts` | 48 to 73 | `el(` | `),` | into `subtitleLines` |
| `src/itinerary/dress/strip.ts` | 240 to 245 | `const lines: CaptionLine[] = e.endpoint` | `];` | into `waypointLines` |
| `src/itinerary/events.ts` | 132 to 138 | `const walked = bfsPath(` | `);` | into `branchWalk` |

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). Each loads the repo's own modules by path, so it runs from any directory. The reused tools are in the governing plan's Appendix B (`814-prune.ts`, `814-test-proof.ts`) and pull request 2's (`814-tests-size.ts`, `814-tests-counts.ts`).

### `814-engine-split.ts` (sha256 274ce8854e03d176cc60a69435e01f66d411f6380521a3675a7bde1e784a18d1)

The family tool. Commit 1 runs its `ceilings` family; commits 2 to 10 run one family each.

```ts
// usage: node 814-engine-split.ts <repo> <family> ...
// Issue #814 pull request 5: rewrites one family's files in <repo> from their base text by line ranges (1-based, inclusive), before Prettier.
// Families: ceilings, contours, feature-labels, frame, legend-icons, legend, names, plate, strip, events. Each reads the file as it stands, which must be the base (efa8fc43) text: it checks every anchor line first and throws, writing nothing, where one is not what the base held.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, ...families] = process.argv.slice(2);
if (repo === undefined || families.length === 0) {
  console.error("usage: node 814-engine-split.ts <repo> <family> ...");
  process.exit(2);
}
const read = (p: string): string[] => readFileSync(join(repo, p), "utf8").split("\n");
const put = (p: string, lines: string[]): void => writeFileSync(join(repo, p), lines.join("\n") + "\n");
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const expect = (L: string[], n: number, starts: string): void => {
  const line = L[n - 1];
  const holds = starts === "" ? line === "" : line !== undefined && line.trimStart().startsWith(starts);
  if (!holds) throw new Error(`line ${n} is ${JSON.stringify(line)}, not ${JSON.stringify(starts)}`);
};
const expectEnd = (L: string[], n: number): void => {
  if (L.length !== n + 1 || L[n] !== "") throw new Error(`the file is ${L.length - 1} lines, not ${n}`);
};

const FILES = [
  "src/itinerary/dress/plate.ts",
  "src/itinerary/dress/strip.ts",
  "src/itinerary/events.ts",
  "src/render/layers/feature-labels.ts",
  "src/render/layers/frame.ts",
  "src/render/layers/legend-icons.ts",
  "src/render/layers/legend.ts",
  "src/society/names.ts",
  "src/terrain/contours.ts",
];

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(repo, p), "utf8").split("\n");
  for (const k of FILES) if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(repo, p), lines.filter((l) => !FILES.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function contours(): void {
  const f = "src/terrain/contours.ts";
  const L = read(f);
  expectEnd(L, 324);
  expect(L, 25, "function cellSegments(");
  expect(L, 32, "const [a, b, c, d] = corners;");
  expect(L, 33, "const segs: Seg[] = [];");
  expect(L, 35, "const top: Point =");
  expect(L, 38, "const left: Point =");
  expect(L, 40, "const add = (p: Point, q: Point): void => {");
  expect(L, 42, "};");
  expect(L, 44, "switch (idx) {");
  expect(L, 45, "case 1:");
  expect(L, 57, "case 5: {");
  expect(L, 67, "}");
  expect(L, 68, "case 6:");
  expect(L, 80, "case 10: {");
  expect(L, 90, "}");
  expect(L, 91, "case 11:");
  expect(L, 102, "break;");
  expect(L, 103, "}");
  expect(L, 104, "return segs;");
  expect(L, 105, "}");
  put(f, [
    ...r(L, 1, 24),
    "function saddleSegments(",
    "  idx: number,",
    "  top: Point,",
    "  right: Point,",
    "  bottom: Point,",
    "  left: Point,",
    "  corners: readonly [number, number, number, number],",
    "  iso: number,",
    "): Seg[] {",
    ...r(L, 32, 33),
    "",
    ...r(L, 40, 42),
    "",
    ...r(L, 44, 44),
    ...r(L, 57, 67),
    ...r(L, 80, 90),
    ...r(L, 103, 105),
    "",
    "function singleSegment(idx: number, top: Point, right: Point, bottom: Point, left: Point): Seg[] {",
    ...r(L, 33, 33),
    "",
    ...r(L, 40, 42),
    "",
    ...r(L, 44, 56),
    ...r(L, 68, 79),
    ...r(L, 91, 105),
    "",
    ...r(L, 25, 32),
    "",
    ...r(L, 35, 38),
    "",
    "  return idx === 5 || idx === 10",
    "    ? saddleSegments(idx, top, right, bottom, left, corners, iso)",
    "    : singleSegment(idx, top, right, bottom, left);",
    "}",
    ...r(L, 106, 324),
  ]);
}

function featureLabels(): void {
  const f = "src/render/layers/feature-labels.ts";
  const L = read(f);
  expectEnd(L, 384);
  expect(L, 20, 'import { placeRealmLabel } from "./realm-label-placement.ts";');
  expect(L, 138, "function rangeLabelNodes(ctx: RenderCtx): SvgNode[] {");
  expect(L, 143, "const { w, h } = world.elev;");
  expect(L, 144, "const blob = largestBlob(w, h, (i) => {");
  expect(L, 147, "});");
  expect(L, 148, "if (blob.length < 10) return [];");
  put(f, [
    ...r(L, 1, 20),
    'import type { World } from "../../world/types.ts";',
    ...r(L, 21, 137),
    "function rangeBlob(world: World): number[] {",
    ...r(L, 143, 147),
    "  return blob;",
    "}",
    "",
    ...r(L, 138, 142),
    "  const blob = rangeBlob(world);",
    ...r(L, 148, 384),
  ]);
}

function frame(): void {
  const f = "src/render/layers/frame.ts";
  const L = read(f);
  expectEnd(L, 80);
  expect(L, 28, "export function frameLayer(ctx: RenderCtx): SvgNode {");
  expect(L, 29, "const { proj, style } = ctx;");
  expect(L, 30, "const m = proj.margin;");
  expect(L, 35, "const innerH = h - 2 * m;");
  expect(L, 36, "");
  put(f, [
    ...r(L, 1, 27),
    "function frameMetrics(proj: Projection) {",
    ...r(L, 30, 35),
    "  return { m, w, h, outerInset, innerW, innerH };",
    "}",
    "",
    ...r(L, 28, 29),
    "  const { m, w, h, outerInset, innerW, innerH } = frameMetrics(proj);",
    ...r(L, 36, 80),
  ]);
}

function legendIcons(): void {
  const f = "src/render/layers/legend-icons.ts";
  const L = read(f);
  expectEnd(L, 239);
  expect(L, 4, 'import { isoStroke } from "./iso.ts";');
  expect(L, 26, "function markIcon(");
  expect(L, 47, 'case "road": {');
  expect(L, 79, "}");
  expect(L, 83, "function areaIcon(");
  expect(L, 87, 'case "realm":');
  expect(L, 88, 'return el("rect", {');
  expect(L, 99, "});");
  expect(L, 100, 'case "hypso": {');
  expect(L, 117, "}");
  expect(L, 118, 'case "contour":');
  expect(L, 151, "function seaIcon(");
  expect(L, 182, 'case "wind": {');
  expect(L, 198, "}");
  expect(L, 199, 'case "current": {');
  expect(L, 215, "}");
  expect(L, 216, "}");
  const helper = (head: string, a: number, b: number): string[] => [head, ...r(L, a, b), "}", ""];
  put(f, [
    ...r(L, 1, 4),
    'import type { MapStyle } from "../style.ts";',
    ...r(L, 5, 25),
    ...helper('function roadIcon(icon: Extract<MarkIcon, { kind: "road" }>, cx: number, cy: number, style: MapStyle, k: number): SvgNode {', 48, 78),
    ...r(L, 26, 46),
    '    case "road":',
    "      return roadIcon(icon, cx, cy, style, k);",
    ...r(L, 80, 82),
    ...helper("function realmIcon(cx: number, cy: number, style: MapStyle, k: number): SvgNode {", 88, 99),
    ...helper("function hypsoIcon(cx: number, cy: number, style: MapStyle, k: number): SvgNode {", 101, 116),
    ...r(L, 83, 86),
    '    case "realm":',
    "      return realmIcon(cx, cy, style, k);",
    '    case "hypso":',
    "      return hypsoIcon(cx, cy, style, k);",
    ...r(L, 118, 150),
    ...helper("function windIcon(cx: number, cy: number, style: MapStyle, k: number): SvgNode {", 183, 197),
    ...helper("function currentIcon(cx: number, cy: number, style: MapStyle, k: number): SvgNode {", 200, 214),
    ...r(L, 151, 181),
    '    case "wind":',
    "      return windIcon(cx, cy, style, k);",
    '    case "current":',
    "      return currentIcon(cx, cy, style, k);",
    ...r(L, 216, 239),
  ]);
}

function legend(): void {
  const f = "src/render/layers/legend.ts";
  const L = read(f);
  expectEnd(L, 249);
  expect(L, 8, 'import { iconNode, type Icon } from "./legend-icons.ts";');
  expect(L, 176, "export function legendLayer(ctx: RenderCtx, plan: LegendPlan): SvgNode {");
  expect(L, 181, "");
  expect(L, 182, "const children: SvgNode[] = [");
  expect(L, 208, "];");
  expect(L, 209, "");
  put(f, [
    ...r(L, 1, 8),
    'import type { MapStyle } from "../style.ts";',
    ...r(L, 9, 175),
    "function legendPanel(style: MapStyle, box: Box, m: ReturnType<typeof metrics>, k: number): SvgNode[] {",
    ...r(L, 182, 208),
    "  return children;",
    "}",
    "",
    ...r(L, 176, 181),
    "  const children = legendPanel(style, box, m, k);",
    ...r(L, 209, 249),
  ]);
}

function names(): void {
  const f = "src/society/names.ts";
  const L = read(f);
  expectEnd(L, 435);
  expect(L, 2, 'import type { MapType } from "../terrain/heightfield.ts";');
  expect(L, 3, 'import { editDistanceWithin1 } from "../core/text.ts";');
  expect(L, 392, "");
  expect(L, 393, "const TITLE_ADJECTIVES = [");
  expect(L, 406, "];");
  expect(L, 408, "const AGES = [");
  expect(L, 410, "const TITLE_PATTERNS: Record<MapType, readonly string[]> = {");
  expect(L, 415, "};");
  expect(L, 416, "");
  expect(L, 417, "export type MapTitle = {");
  const exported = (a: number, b: number, from: string, to: string): string[] => {
    const lines = r(L, a, b);
    const head = lines[0] ?? "";
    if (!head.startsWith(from)) throw new Error(`line ${a} does not open ${JSON.stringify(from)}`);
    return [`export ${to}${head.slice(from.length)}`, ...lines.slice(1)];
  };
  put("src/society/names-title.ts", [
    ...r(L, 2, 2),
    "",
    ...exported(393, 406, "const TITLE_ADJECTIVES = ", "const TITLE_ADJECTIVES: readonly string[] = "),
    "",
    ...exported(408, 408, "const AGES = ", "const AGES: readonly string[] = "),
    "",
    ...exported(
      410,
      415,
      "const TITLE_PATTERNS: Record<MapType, readonly string[]> = ",
      "const TITLE_PATTERNS: Readonly<Record<MapType, readonly string[]>> = ",
    ),
  ]);
  put(f, [...r(L, 1, 3), 'import { AGES, TITLE_ADJECTIVES, TITLE_PATTERNS } from "./names-title.ts";', ...r(L, 4, 392), ...r(L, 417, 435)]);
}

function plate(): void {
  const f = "src/itinerary/dress/plate.ts";
  const L = read(f);
  expectEnd(L, 136);
  expect(L, 28, "function titleBand(c: DressContext, input: RibbonInput): SvgNode[] {");
  expect(L, 47, "),");
  expect(L, 48, "el(");
  expect(L, 59, '[subtitle[0] ?? ""],');
  expect(L, 72, '[subtitle[1] ?? ""],');
  expect(L, 73, "),");
  expect(L, 74, 'el("path", {');
  put(f, [
    ...r(L, 1, 27),
    "function subtitleLines(c: DressContext, subtitle: readonly string[], cx: number, top: number): SvgNode[] {",
    "  return [",
    ...r(L, 48, 73),
    "  ];",
    "}",
    "",
    ...r(L, 28, 47),
    "    ...subtitleLines(c, subtitle, cx, top),",
    ...r(L, 74, 136),
  ]);
}

function strip(): void {
  const f = "src/itinerary/dress/strip.ts";
  const L = read(f);
  expectEnd(L, 321);
  expect(L, 8, 'import { eventCaption, tierTag } from "../prose.ts";');
  expect(L, 229, "function eventNodes(c: DressContext, input: RibbonInput, strip: StripLayout, rng: Rng): SvgNode[] {");
  expect(L, 240, "const lines: CaptionLine[] = e.endpoint");
  expect(L, 245, "];");
  expect(L, 246, "laid = captionNodes(c, strip, p.sx, p.sy, freeSide, lines, laid);");
  put(f, [
    ...r(L, 1, 8),
    'import type { RibbonEvent } from "../events.ts";',
    ...r(L, 9, 228),
    'function waypointLines(e: Extract<RibbonEvent, { kind: "waypoint" }>, caption: string): CaptionLine[] {',
    ...r(L, 240, 245),
    "  return lines;",
    "}",
    "",
    ...r(L, 229, 239),
    "        const lines = waypointLines(e, caption);",
    ...r(L, 246, 321),
  ]);
}

function events(): void {
  const f = "src/itinerary/events.ts";
  const L = read(f);
  expectEnd(L, 202);
  expect(L, 104, "function branchEvents(");
  expect(L, 131, "if (k - lastK < 4) continue;");
  expect(L, 132, "const walked = bfsPath(");
  expect(L, 138, ");");
  expect(L, 139, "if (!walked) continue;");
  put(f, [
    ...r(L, 1, 103),
    "function branchWalk(",
    "  w: number,",
    "  h: number,",
    "  n: number,",
    "  settlementByCell: ReadonlyMap<number, number>,",
    "  mask: Uint8Array,",
    "  chainSet: ReadonlySet<number>,",
    "): number[] | null {",
    ...r(L, 132, 138),
    "  return walked;",
    "}",
    "",
    ...r(L, 104, 131),
    "        const walked = branchWalk(w, h, n, settlementByCell, mask, chainSet);",
    ...r(L, 139, 202),
  ]);
}

const RUN: Record<string, () => void> = {
  ceilings,
  contours,
  "feature-labels": featureLabels,
  frame,
  "legend-icons": legendIcons,
  legend,
  names,
  plate,
  strip,
  events,
};
for (const family of families) {
  const run = RUN[family];
  if (run === undefined) throw new Error(`no family ${family}`);
  run();
  console.log(`${family}: written`);
}
```

### `814-engine-draw.ts` (sha256 a86bcca0b36b58fb3370dc293335a0158356f76fae4fc2f88a16c669687cbd03)

Ruling 3's set: draws it from a root's own `src/` and writes the manifest of hashes.

```ts
// usage: node 814-engine-draw.ts <root> <out dir> [--files]
// Draws Issue #814 ruling 3's before-and-after set from <root>'s own engine (its src/ imported by path) and writes <out dir>/manifest.txt ("<sha256>  <name>", sorted by name), then prints one count line per kind; with --files it also writes every artifact under <out dir>/<kind>/ (about 1.6 GB).
// Exits 1 if any artifact but a ribbon throws (a ribbon's throw is recorded as its artifact, "THROW <message>"), or two artifacts share a name, and 2 on bad arguments.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Field = { readonly w: number; readonly h: number; readonly data: ArrayLike<number> };
type Settlement = { readonly name: string; readonly kind: string; readonly formerName?: string };
type World = {
  readonly elev: Field;
  readonly seaLevel: number;
  readonly settlements: ReadonlyArray<Settlement>;
  readonly title: unknown;
  readonly names: Record<string, unknown>;
};
type Plate = { readonly key: string; readonly svg: string };
type Atlas = Record<"hero", Plate> & Record<"draughtings" | "themes" | "regions" | "prospects", ReadonlyArray<Plate>>;

const [root, out, flag] = process.argv.slice(2);
if (root === undefined || out === undefined || (flag !== undefined && flag !== "--files")) {
  console.error("usage: node 814-engine-draw.ts <root> <out dir> [--files]");
  process.exit(2);
}
const files = flag === "--files";
const at = (path: string): Promise<unknown> => import(join(root, path));
const gen = (await at("src/world/generate.ts")) as {
  defaultRecipe: (seed: number) => unknown;
  generateWorld: (recipe: unknown) => World;
};
const { renderMap } = (await at("src/render/map-renderer.ts")) as {
  renderMap: (world: World, opts: Record<string, unknown>) => string;
};
const { marchingSquares, closedIsoRings } = (await at("src/terrain/contours.ts")) as Record<
  "marchingSquares" | "closedIsoRings",
  (field: Field, iso: number) => unknown
>;
const { prospectResultFor } = (await at("src/site/explorer/prospect-job.ts")) as {
  prospectResultFor: (world: World, spec: { index: number; dress: string; year: null }) => unknown;
};
const { ribbonResultFor } = (await at("src/site/explorer/ribbon-job.ts")) as {
  ribbonResultFor: (world: World, spec: { from: number; to: null; dress: string }) => unknown;
};
const { composeAtlas } = (await at("src/atlas/compose.ts")) as { composeAtlas: (world: World) => Atlas };
const { CULTURES, createNamer } = (await at("src/society/names.ts")) as {
  CULTURES: ReadonlyArray<{ readonly id: string }>;
  createNamer: (rng: unknown, culture: unknown) => { name: (kind: string) => string };
};
const { createRng } = (await at("src/core/rng.ts")) as { createRng: (seed: number) => { fork: (label: string) => unknown } };

const SEEDS = [1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 17, 18, 21, 22, 24, 26, 33, 34, 35, 42];
const FEW = [3, 33, 42];
const STYLES = ["antique", "topographic", "ink", "nautical"];
const THEMES = ["plain", "vegetation", "climate", "moisture", "population"];
const DRESSES = ["antique", "ink"];
const CONTOUR_LEVELS = 8;
const NAMES = 1000;

const lines: string[] = [];
const counts = new Map<string, number>();
const throws = new Map<string, number>();
const json = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) => (v instanceof Map ? [...v.entries()] : v));
const seen = new Set<string>();
function put(kind: string, name: string, make: () => string): void {
  if (seen.has(`${kind}/${name}`)) throw new Error(`two artifacts named ${kind}/${name}`);
  seen.add(`${kind}/${name}`);
  let text: string;
  try {
    text = make();
  } catch (e) {
    text = `THROW ${e instanceof Error ? e.message : String(e)}`;
    throws.set(kind, (throws.get(kind) ?? 0) + 1);
  }
  if (files) {
    mkdirSync(join(out, kind), { recursive: true });
    writeFileSync(join(out, kind, name), text);
  }
  lines.push(`${createHash("sha256").update(text).digest("hex")}  ${kind}/${name}`);
  counts.set(kind, (counts.get(kind) ?? 0) + 1);
}

function contourLevels(world: World): number[] {
  let max = -Infinity;
  for (let i = 0; i < world.elev.data.length; i++) max = Math.max(max, world.elev.data[i] as number);
  const step = (max - world.seaLevel) / (CONTOUR_LEVELS + 1);
  return Array.from({ length: CONTOUR_LEVELS }, (_, i) => world.seaLevel + step * (i + 1));
}

const t0 = performance.now();
for (const culture of CULTURES)
  put("namer", `${culture.id}.json`, () => {
    const namer = createNamer(createRng(814).fork("names"), culture);
    return json(Array.from({ length: NAMES }, (_, i) => namer.name(i % 5 === 0 ? "settlement" : "bare")));
  });
for (const seed of SEEDS) {
  const world = gen.generateWorld(gen.defaultRecipe(seed));
  put("world", `${seed}.json`, () =>
    json({ title: world.title, names: world.names, settlements: world.settlements.map((s) => [s.name, s.kind, s.formerName ?? null]) }),
  );
  for (const style of STYLES)
    for (const theme of THEMES)
      for (const legend of [false, true])
        put("chart", `${seed}-${style}-${theme}-${legend ? "key" : "nokey"}.svg`, () =>
          renderMap(world, { style, legend, ...(theme === "plain" ? {} : { theme }) }),
        );
  put("contours", `${seed}.json`, () =>
    json({
      sea: closedIsoRings(world.elev, world.seaLevel),
      levels: [world.seaLevel, ...contourLevels(world)].map((iso) => marchingSquares(world.elev, iso)),
    }),
  );
  for (let from = 0; from < world.settlements.length; from++)
    for (const dress of DRESSES) put("ribbon", `${seed}-${from}-${dress}.json`, () => json(ribbonResultFor(world, { from, to: null, dress })));
  if (!FEW.includes(seed)) continue;
  for (let index = 0; index < world.settlements.length; index++)
    for (const dress of DRESSES) put("town", `${seed}-${index}-${dress}.json`, () => json(prospectResultFor(world, { index, dress, year: null })));
  const atlas = composeAtlas(world);
  for (const plate of [atlas.hero, ...atlas.draughtings, ...atlas.themes, ...atlas.regions, ...atlas.prospects])
    put("atlas", `${seed}-${plate.key}.svg`, () => plate.svg);
}
lines.sort((a, b) => (a.slice(66) < b.slice(66) ? -1 : 1));
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "manifest.txt"), `${lines.join("\n")}\n`);
for (const [kind, n] of [...counts].sort()) console.log(`${kind}: ${n} artifacts, ${throws.get(kind) ?? 0} threw`);
console.log(`total: ${lines.length} artifacts in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
const unexpected = [...throws].filter(([kind]) => kind !== "ribbon").reduce((a, [, n]) => a + n, 0);
process.exit(unexpected === 0 ? 0 : 1);
```

### `814-engine-compare.ts` (sha256 3d402b786393cb40f20a644f5e4fc8b1689c8c34af006472ce30daf92ed1da67)

Compares two manifests.

```ts
// usage: node 814-engine-compare.ts <base out dir> <head out dir>
// Compares the two manifests 814-engine-draw.ts wrote: prints, per kind, how many artifacts match and how many differ, then every differing or one-sided artifact by name; exits 1 on any difference.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const [baseDir, headDir] = process.argv.slice(2);
if (baseDir === undefined || headDir === undefined) {
  console.error("usage: node 814-engine-compare.ts <base out dir> <head out dir>");
  process.exit(2);
}
const manifest = (dir: string): Map<string, string> =>
  new Map(
    readFileSync(join(dir, "manifest.txt"), "utf8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => [l.slice(66), l.slice(0, 64)] as const),
  );
const base = manifest(baseDir);
const head = manifest(headDir);
const names = [...new Set([...base.keys(), ...head.keys()])].sort();
const tally = new Map<string, { same: number; differ: number }>();
const odd: string[] = [];
for (const name of names) {
  const kind = name.slice(0, name.indexOf("/"));
  const t = tally.get(kind) ?? { same: 0, differ: 0 };
  const a = base.get(name);
  const b = head.get(name);
  if (a !== undefined && a === b) t.same++;
  else {
    t.differ++;
    odd.push(`${a === undefined ? "ONLY HEAD" : b === undefined ? "ONLY BASE" : "DIFF"}  ${name}`);
  }
  tally.set(kind, t);
}
for (const [kind, t] of [...tally].sort()) console.log(`${kind}: ${t.same} same, ${t.differ} differ`);
for (const line of odd) console.log(line);
console.log(`${names.length} artifacts: ${odd.length} differ`);
process.exit(odd.length === 0 ? 0 : 1);
```

### `814-engine-clauses.ts` (sha256 bc60382ff019a58ea4bd9dff17205b23ba1af7e28242e750074ef292e58da83e)

The clause proof, the statement proof's companion inside one statement.

```ts
// usage: [HEAD_ROOT=<dir>] node 814-engine-clauses.ts <repo> <base sha> <base paths>=<head paths> ...
// For each family, compares at the base and in the tree the multiset of switch case clauses and the multiset of array-literal elements, every one printed whole, token by token, types stripped, and prints each clause or element one side has and the other lacks (cut at 200 characters; the comparison reads the whole text).
// It is the statement proof's companion where a cut falls inside one statement: the statement proof reads a changed switch or array as one statement and elides nested blocks, this reads each clause and element whole, so a reorder inside a case's block reads DIFF here.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";

const [repo, base, ...families] = process.argv.slice(2);
if (repo === undefined || base === undefined || families.length === 0) {
  console.error("usage: node 814-engine-clauses.ts <repo> <base sha> <base paths>=<head paths> ...");
  process.exit(2);
}
const ts = createRequire(join(repo, "package.json"))("typescript") as typeof import("typescript");
type Node = import("typescript").Node;
const headRoot = process.env["HEAD_ROOT"] ?? repo;
const atBase = (path: string): string =>
  execFileSync("git", ["show", `${base}:${path}`], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 26 });
const atHead = (path: string): string => readFileSync(join(headRoot, path), "utf8");
const print = (n: Node): string => {
  const kids = n.getChildren();
  if (kids.length === 0) return n.getText();
  return kids.map(print).filter((x) => x !== "").join(" ");
};
function parts(texts: readonly string[]): string[] {
  const out: string[] = [];
  for (const text of texts) {
    const visit = (n: Node): void => {
      if (ts.isCaseClause(n) || ts.isDefaultClause(n)) out.push(`clause: ${print(n)}`);
      if (ts.isArrayLiteralExpression(n)) for (const e of n.elements) out.push(`element: ${print(e)}`);
      ts.forEachChild(n, visit);
    };
    visit(ts.createSourceFile("f.js", stripTypeScriptTypes(text, { mode: "strip" }), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  }
  return out;
}
const surplus = (a: readonly string[], b: readonly string[]): string[] => {
  const left = new Map<string, number>();
  for (const x of b) left.set(x, (left.get(x) ?? 0) + 1);
  return a.filter((x) => {
    const n = left.get(x) ?? 0;
    if (n === 0) return true;
    left.set(x, n - 1);
    return false;
  });
};
let differ = 0;
for (const family of families) {
  const [before, after] = family.split("=");
  if (!before || !after) throw new Error(`a family is <base paths>=<head paths>, got ${family}`);
  const a = parts(before.split(",").map(atBase));
  const b = parts(after.split(",").map(atHead));
  const short = (s: string): string => (s.length > 200 ? `${s.slice(0, 197)}...` : s);
  const lines = [...surplus(a, b).map((x) => `gone   ${short(x)}`), ...surplus(b, a).map((x) => `added  ${short(x)}`)];
  if (lines.length > 0) differ++;
  console.log(`${lines.length === 0 ? "same" : "DIFF"}  ${before} -> ${after}: ${a.length} -> ${b.length} clauses and elements`);
  for (const line of lines) console.log(`      ${line}`);
}
console.log(`${families.length} families against ${base}: ${differ} differ`);
process.exit(differ === 0 ? 0 : 1);
```

### `814-engine-bench.ts` (sha256 278882aa11c142e2e00e94fbe13f3a4b52cf939c79977b43347be9f0f4117f66)

The timing of `cellSegments` (inside `marchingSquares`) and of `renderMap`.

```ts
// usage: node 814-engine-bench.ts <base root> <copy root> <head root>
// Times cellSegments where it runs, inside marchingSquares, and renderMap topographic with the key, from three roots' own src/ in one process: the base, a byte-identical copy of the base (the noise control) and the head.
// Each of ROUNDS rounds times every root once, in a rotating order, after one untimed warm-up pass each; prints each root's median and the head's and the copy's median ratio to the base, with the range of the per-round ratios.
import { join } from "node:path";

type Field = { readonly w: number; readonly h: number; readonly data: ArrayLike<number> };
type World = { readonly elev: Field; readonly seaLevel: number };
type Engine = { marching: (field: Field, iso: number) => unknown; render: (world: World, opts: Record<string, unknown>) => string };

const roots = process.argv.slice(2);
if (roots.length !== 3) {
  console.error("usage: node 814-engine-bench.ts <base root> <copy root> <head root>");
  process.exit(2);
}
const NAMES = ["base", "copy", "head"];
const SEEDS = [1, 6, 13, 33, 42];
const LEVELS = 8;
const ROUNDS = 12;
const MARCH_REPS = 3;

const engines: Engine[] = [];
for (const root of roots) {
  const c = (await import(join(root, "src/terrain/contours.ts"))) as { marchingSquares: Engine["marching"] };
  const m = (await import(join(root, "src/render/map-renderer.ts"))) as { renderMap: Engine["render"] };
  engines.push({ marching: c.marchingSquares, render: m.renderMap });
}
const gen = (await import(join(roots[0] as string, "src/world/generate.ts"))) as {
  defaultRecipe: (seed: number) => unknown;
  generateWorld: (recipe: unknown) => World;
};
const worlds = SEEDS.map((seed) => gen.generateWorld(gen.defaultRecipe(seed)));
const jobs: Array<{ field: Field; iso: number }> = [];
for (const w of worlds) {
  let max = -Infinity;
  for (let i = 0; i < w.elev.data.length; i++) max = Math.max(max, w.elev.data[i] as number);
  const step = (max - w.seaLevel) / (LEVELS + 1);
  for (let i = 0; i <= LEVELS; i++) jobs.push({ field: w.elev, iso: w.seaLevel + step * i });
}
let sink = 0;
const march = (e: Engine): number => {
  const t = performance.now();
  for (let r = 0; r < MARCH_REPS; r++) for (const { field, iso } of jobs) sink += (e.marching(field, iso) as unknown[]).length;
  return performance.now() - t;
};
const render = (e: Engine): number => {
  const t = performance.now();
  for (const w of worlds) sink += e.render(w, { style: "topographic", legend: true }).length;
  return performance.now() - t;
};
const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return ((s[(s.length - 1) >> 1] as number) + (s[s.length >> 1] as number)) / 2;
};
for (const [label, run] of [
  ["marchingSquares", march],
  ["renderMap topographic", render],
] as const) {
  for (const e of engines) run(e);
  const times: number[][] = engines.map(() => []);
  for (let round = 0; round < ROUNDS; round++)
    for (let j = 0; j < engines.length; j++) {
      const k = (round + j) % engines.length;
      (times[k] as number[]).push(run(engines[k] as Engine));
    }
  const meds = times.map(median);
  const ratio = (k: number): string => {
    const per = (times[k] as number[]).map((t, i) => t / ((times[0] as number[])[i] as number));
    return `${((meds[k] as number) / (meds[0] as number)).toFixed(3)} (rounds ${Math.min(...per).toFixed(3)} to ${Math.max(...per).toFixed(3)})`;
  };
  console.log(
    `${label}: medians ${meds.map((m, k) => `${NAMES[k]} ${m.toFixed(1)} ms`).join(", ")}; copy/base ${ratio(1)}; head/base ${ratio(2)}`,
  );
}
console.log(`(${jobs.length} fields a pass, ${MARCH_REPS} passes a timing; ${ROUNDS} rounds; checksum ${sink})`);
```

### `814-engine-cover.ts` (sha256 b73d85eabecb098cea89269b9edb9007c294fe7b198cbd3bea1032e9153c2387)

Planning only: reads the coverage a `NODE_V8_COVERAGE` run of the draw wrote, for the reach claim; not run by the implementer.

```ts
// usage: node 814-engine-cover.ts <coverage dir> <root> <repo path>:<first line>-<last line> ...
// Reads the V8 coverage NODE_V8_COVERAGE wrote for a run over <root>, and prints, for each named line range of a file, every line whose first non-blank character the run never executed (the innermost covering range has count 0), or "all run".
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

type Range = { startOffset: number; endOffset: number; count: number };
type Fn = { functionName: string; ranges: Range[] };
type Script = { url: string; functions: Fn[] };

const [dir, root, ...specs] = process.argv.slice(2);
if (dir === undefined || root === undefined || specs.length === 0) {
  console.error("usage: node 814-engine-cover.ts <coverage dir> <root> <repo path>:<first>-<last> ...");
  process.exit(2);
}
const scripts = new Map<string, Range[]>();
for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
  const { result } = JSON.parse(readFileSync(join(dir, f), "utf8")) as { result: Script[] };
  for (const s of result) {
    const ranges = scripts.get(s.url) ?? [];
    for (const fn of s.functions) ranges.push(...fn.ranges);
    scripts.set(s.url, ranges);
  }
}
let missing = 0;
for (const spec of specs) {
  const m = /^(.+):(\d+)-(\d+)$/.exec(spec);
  if (!m) throw new Error(`bad range ${spec}`);
  const [, path, a, b] = m as unknown as [string, string, string, string];
  const url = pathToFileURL(join(root, path)).href;
  const ranges = scripts.get(url);
  if (!ranges) {
    console.log(`${spec}: NOT LOADED`);
    missing++;
    continue;
  }
  const text = readFileSync(join(root, path), "utf8");
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  const dead: number[] = [];
  for (let line = Number(a); line <= Number(b); line++) {
    const lineStart = starts[line - 1] as number;
    const lineText = text.slice(lineStart, starts[line] ?? text.length);
    const col = lineText.search(/\S/);
    if (col < 0) continue;
    const off = lineStart + col;
    let best: Range | null = null;
    for (const r of ranges)
      if (r.startOffset <= off && off < r.endOffset && (best === null || r.endOffset - r.startOffset <= best.endOffset - best.startOffset))
        best = r;
    if (best === null || best.count === 0) dead.push(line);
  }
  if (dead.length > 0) missing++;
  console.log(`${spec}: ${dead.length === 0 ? "all run" : `never run: ${dead.join(", ")}`}`);
}
process.exit(missing === 0 ? 0 : 1);
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the dry run. Commit 1 writes the first two; each family commit writes its own files and no other. `test/society/names.test.ts` and every other file are unchanged.

```
74a70129ce21cd4daa6d77919808290b0ad7ebdb9eaa6bd0637f090b619d27e0  eslint-suppressions.json
2f28216616895e1c0194cb0d450e3df86508cdcf2951f6e6aa8fc281fcb3347b  test/repo/lint-config.test.ts
f5b4eba9386f0c37fc55dbec5f5b18fde1f283217c00c7526770b27a196c3cc9  src/render/layers/feature-labels.ts
18c331beb280216ea90e1410bf0cd9a94189b162dd37fd9d89c07a30f086f4b9  src/render/layers/frame.ts
26b1380b2e7ee8f96a36323c38f3a9d18c13912394e9d116906f50329596fabe  src/render/layers/legend-icons.ts
65cc581c5c273b4172176db9aa63324587b2ffdada97ff15c31c775895f04e47  src/render/layers/legend.ts
472e598ba296a4d48af037a4810d091668ca211c1f5066c308f83c7788af85b0  src/terrain/contours.ts
54e335bf371e42c95a045dd98eff3f26c60077d39716de75cb93e0aa8a7b0a1a  src/society/names.ts
096313b91134463d9cb183522b242c511553b0498e916b3288e5445843ba8ba1  src/society/names-title.ts
9ec3e28d028583cffe04c890c1167b32dc5d568aacd52c3c77daad0d3740e1b9  src/itinerary/dress/plate.ts
5224eacd603351dc1a66403e16788ce401c09b5f4befd422893c63aeb7ad4f22  src/itinerary/dress/strip.ts
168c2286517b86bb430bd0da093c853df231cf83019f2087800268506f99fbdc  src/itinerary/events.ts
```
