# Issue #814, pull request 6 of 8: the prospect dress's thirteen overruns (`prospect`)

**Planned at:** `origin/main` 150e6b413c85a0d59c2177b8e73ab8e001a3ba15 (PR #922, pull request 5, merged), Issue #814 comment count 20, the newest 6268532863 (pull request 5's implementer calls, 2026-10-19T13:36:06Z), read with `git ls-remote origin refs/heads/main` and `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate --jq length`, and re-read at 2026-10-19T18:29Z, after the plan skeptic's folds, unchanged. Every line number below is the file's own at 150e6b41, and every proof's base is 150e6b41.
**Governing plan:** `handbook/plans/814/814-plan.md` on main (archived on the issue as comments 6254754985 and 6254755566), with Alex's rulings in comment 6254713941. Its design binds this slice and is not restated: "The red is the lint", "What a split may change: nothing that runs", K5 (an engine function), "Rosters and doctrine, for every pull request", and its calls 1 to 15. This file is that plan's table row 6, label `prospect`. Pull request 5's slice plan (`handbook/plans/814/814-engine-plan.md`) is the worked form it follows: a tool that writes each family's files from base line ranges, Appendix C's hashes, the statement and clause proofs, ruling 3's byte set, one commit per family.
**Rulings:** none new. The rulings that govern this slice are ruling 3 of comment 6254713941 ("Exact before-and-after set": about 20 worlds, every map style with and without the key, every theme, and every town picture of a few worlds, drawn before and after on the same machine, every file matching exactly, on top of today's fingerprints and committed-chart checks) with the governing plan's call 15 (the comparison reaches the code it vouches for, by adding artifacts), and comment 6256728145 ("Lock it in this PR", for a list a split newly shares; this slice shares none, call 14). Every question this slice meets is answered by the governing plan, its rulings, a house rule named at the call, or a measurement below, so under ruling 2 it brings nothing back to Alex.
**Status:** finished; Open decisions none.
**Archive:** this file, unchanged, is copied to `handbook/plans/814/814-prospect-plan.md` in this pull request's first commit and never edited afterwards (workflow step 8).

## What this slice is

The 13 overruns of five files under `src/prospect/dress/`, every one measured at 150e6b41 by `npm run lint` with this slice's five `eslint-suppressions.json` entries deleted (the red, commit 1). Lines of code as the lint counts them (blank lines and comments skipped).

| file | overrun at the base | at the head |
|---|---|---|
| `src/prospect/dress/compose-e.ts` | `engraveE` 87 | `engraveE` 46; the file 196 |
| `src/prospect/dress/figures.ts` | file 479 | 373 |
| `src/prospect/dress/furniture.ts` | file 403 | 342 |
| `src/prospect/dress/rise.ts` | file 484, `vignette` 61, `picture` 51 | file 289, `vignette` 34; `picture` 43 in `src/prospect/dress/rise-picture.ts` |
| `src/prospect/dress/townscape.ts` | file 667, `gableMass` 79, `verticalMass` 78, `keepMass` 75, `shipEngraved` 62, `quayEngraved` 53, `foregroundEngraved` 71 | file 384, `shipEngraved` 29, `quayEngraved` 43, `foregroundEngraved` 43; `gableMass` 47, `verticalMass` 44, `keepMass` 38 in `src/prospect/dress/townscape-masses.ts` |

Four files get a sibling, named by ruling 1 (call 16): `townscape-masses.ts` takes the townscape's building masses, `rise-picture.ts` the plate's picture, `figures-parts.ts` the parts every figure is drawn with, and `furniture-wreath.ts` the wreath. Nine functions take helpers in their own file. Every moved line moves verbatim but for indentation and the line breaks Prettier sets; the new text is the helpers' signatures, their `const out: SvgNode[] = [];` and `return` lines, the calls that replace the moved runs, the `export` keyword on the declarations a sibling now shares, and the changed import lines. Nothing that runs changes: no draw is added, removed or reordered on any stream, no lettering run is reordered, no arithmetic is regrouped, and the 2,039 artifacts of ruling 3's set and the 4,180 town pictures of this slice's reach set are byte-identical at the base and the head (measured on the dry run).

## Recon, and what it changed

`vellum-spec-recon`, scoped to this slice, at 150e6b41: 17 claims CURRENT (one, K5's "on top of the golden, the hero drift guard", CURRENT but vacuous here), 0 STALE, and one UNVERIFIABLE side note (which tests of `test/site/region-detail-wiring.test.ts` reach the prospect worker; none pins bytes); every size, line, list entry and reach claim of the governing row 6 and K5 re-derived exactly. Its ledger is `814-prospect-recon-ledger.md` in the scratchpad. What it changed:

- **The plate pins are this slice's evidence**, unlike pull request 5's call 13: `test/prospect/finished.test.ts` holds 11 fnv1a sums of whole plates over 5 armless fixtures in both dresses, and reaches all five files. The golden (`test/world/golden-seed42.test.ts`) and the hero drift guard (`test/site/hero-charts.test.ts`) reach none of them, so this plan names them as unchanged, not as evidence.
- **Ruling 3's set reaches only part of this code.** Pull request 5's draw tool draws each town of seeds 3, 33 and 42 at the present year only. Measured here under `NODE_V8_COVERAGE` (`814-engine-cover.ts`), that set never runs the broken keep in `keepMass`, the serpent, `seatBeast` and `shipBox`, the near band and the waterless branch of `vignette`, the surveyor (the `before-founding` era), the `ripples` clause, and more. So this slice adds a reach set (call 7), and the plan's reach claim rests on it: every line of every range this slice moves or edits runs (Measured on the dry run).
- **What is pinned to its file** (each kept where it is): every symbol a test imports. `foregroundEngraved`, `massNodesEngraved`, `shipEngraved`, `wallNodesEngraved` from `townscape.ts` and `flockBox`, `LIFT`, `massReach`, `shipRig`, `wallReach`, `Box` from `rise.ts` (`test/prospect/dress.test.ts`); `skylineOf` from `rise.ts` and `horizonTowns`, `INNER` from `furniture.ts` (`test/prospect/plate-e-world.test.ts`, `test/prospect/finished.test.ts`); `castFor`, `figureNodes` from `figures.ts` and `smallSizeRule`, `SMALL_WIDTH`, `SMALLEST_WIDTH` from `compose-e.ts` (`test/prospect/plate-e.test.ts`). No spec, errata row, agent, skill, hook, lint list or `SOURCE_READS` entry names any of the five files or their symbols. `test/repo/source-shape-prospect.test.ts`'s `BLIND_SPOTS` message says `src/prospect/dress/furniture.ts` reaches `Math.cos` through `armsNode`, which stays true: `wreathedArms` stays in `furniture.ts`.
- **What a new sibling joins by itself**: `vellum/prospect-libm-clock-free` reaches every file under `src/prospect/` by glob (`eslint.config.ts`), `tsconfig.engine.json` and `tsconfig.worker.json` reach it, and `test/site/app-bundles.test.ts`'s `PLATE_MODULE` pattern matches any `src/prospect/` module, so a sibling reached only through the dress files (lazily, through the worker's `prospect-job.ts`) needs no edit. A sibling a page imported statically would red that test; none is.
- **No open issue, pull request or branch** cites or touches these files (Issue #785, Issue #899 and Issue #434 included), and the lint has no import cycle rule; `src/prospect/dress/` holds no cycle today.

## Specs

On top of the governing plan's Specs list (the rulebook's "The accepted lint and type-check skips"; `handbook/specs/check-placement.md` "The lint" and "The unit suite"; `handbook/specs/conventions.md` "Where a rule lives" and "How code is cited"; `handbook/specs/development-workflow.md` steps 8, 10, 11, 12, 13 and 15; and its engine line, `handbook/specs/engine-invariants.md` "Fork derivation"):

- `handbook/specs/rulebook.md` "Durable engineering constraints from shipped work", the "Prospect byte pins" bullet: every new file stays under `src/prospect/`, libm-free and clock-free, and the rule reaches it; "Golden and committed-chart discipline": no regen is owed and none is made, and SVGs are never byte-compared across environments, which is why base and head are drawn on the same machine and the same Node.
- `handbook/specs/engine-invariants.md` "Fork derivation": a draw inserted or moved on a fork moves every later value on it. The prospect's streams (`sky`, `town`, `water`, `rise`, `figures`, `beast`, from `fork` in `engraveE`) are each consumed in call order, and no cut moves a draw (The design, "What holds the order").
- `.claude/skills/vellum-footguns/SKILL.md` Gate 5 item 1 (every new export has a second reference: each one this slice adds is imported by the file it left) and Gate 6 items 5 and 7.

## The design

### The rules that place a cut (call 2)

1. **A symbol a test imports stays in its file** (the governing "Citations hold"; Recon lists them). No test import is re-pointed.
2. **No value import cycle.** A sibling imports from the file it left only as types (`import type`), the shape Issue #654 row 9b left in `src/world/daily-hunt-clue-facts.ts`, which takes the type `Clue` from `src/world/daily-hunt-clues.ts` while that file imports values from it. The lint holds no cycle rule, so this rule is the guard.
3. **No re-export, and the fewest import lines re-pointed**, each only in a file this slice already edits (pull request 1's call 6; pull request 5's call 4).
4. Then the fewest new files, then the most headroom under the margins: no file over 395 lines of code, no function this slice writes or shortens over 48 (the governing margins).

### How a cut inside a function is chosen (call 3)

Pull request 5's rule, restated whole: a **run** is a contiguous sequence of whole statements of one block, or, where the function is a single statement too long to cut, whole case clauses of its switch or whole elements of its returned array. A run is never taken if it holds a `return`, `break` or `continue` that leaves it, writes a `let` it does not declare, or pushes into, sets or otherwise writes a value declared outside it (the governing call 13). A case clause's body moves whole into a helper, one helper per clause, and the clause returns the helper's call (`mastRow`'s block, whose own last statement is its `return`, which the helper keeps); an array element run moves into a helper returning those elements, spread at their place. This slice adds two forms: where a clause's body is the single statement `return only(<expression>)` around `only`, a local of the switch's function, the expression moves into a helper returning it and the clause returns `only(helper(...))`, the form the `quay` and `mole` clauses already take (`beachedHulls`); and form P, below. For each function, the first of these that brings it to 48 or under: the fewest helpers; then the fewest names crossing (the helper's parameters plus the names it hands back); then the most headroom; then the later run; then top level before a block.

**Form P, the owning push (call 4).** In `gableMass`, `verticalMass`, `keepMass`, `shipEngraved` and `quayEngraved` every run long enough to matter pushes into the function's own list `out`, which the rule above refuses to hand to a helper. So such a run is written out as a helper that owns its own list under the same name: it opens `const out: SvgNode[] = [];`, holds the run verbatim, and ends `return out;`, and the run's place in the caller becomes the one statement `out.push(...helper(args));`. The caller's list receives the same nodes in the same order, every expression evaluates in the same order (the helper runs where the run stood, and nothing reads the caller's `out` inside the run), and no function writes into a list it was handed (the governing call 13; pull request 4's form O, the owning sweep, is the same shape where the list is declared inside the run). It adds one array and one spread per call, none inside a per-cell loop (K5).

**A helper's parameters** are the calling function's parameters it reads, in the caller's order, then the caller's locals it reads, in the order the caller declares them. **A helper handing back one value names its type; one handing back a bag of names keeps the inferred type**, its return statement being its type (pull request 5's call 18).

### Per function

Head sizes measured on the dry run after `npm run format`, by `814-tests-size.ts`. "Call" is the line that replaces the moved run, at its place. Runner-up sizes are predicted from the base's line counts, not measured, here and in the per-file table.

| function (base, lines of code) | moved (base lines) | the new function and its call | head | runner-up, and why it lost |
|---|---|---|---|---|
| `engraveE` 87 | 117 to 137 (`tags` through `tagClear`), 164 to 185 (`grain`, `width`, `node`) | `fixedFurniture(p: PlateParts, e: Engraver, letters: Lettering, standing: boolean)` 24, ending `return { cartouche, medals, key, margin, tagClear };`, call `const { cartouche, medals, key, margin, tagClear } = fixedFurniture(p, e, letters, standing);`; `plateNode(p: PlateParts, e: Engraver, letters: Lettering, pic: Picture, furniture: SvgNode[]): SvgNode` 25, ending `return node;`, call `const node = plateNode(p, e, letters, pic, furniture);` | 46 | no single run fits; 156 to 185 with 141 to 154 (the picture call): 16 names to these 15 |
| `vignette` 61 | 261 to 288 (`gaps`, `river`, `nearBand`, `water`) | `vignetteWater(e: Engraver, s: Streams, g: ProspectGeometry, engraved: ReadonlyArray<ReturnType<typeof foregroundEngraved>>)` 36, ending `return { nearBand, water };`, call `const { nearBand, water } = vignetteWater(e, s, g, engraved);` | 34 | 262 to 288 and 272 to 288 take as many names (6) and leave less headroom (35, 45) |
| `picture` 51 | 471 to 479 (`band`) | `meadowBand(meadowTop: number \| null): Pt[] \| null` 12, ending `return band;`, call `const band = meadowBand(meadowTop);` | 43 | 470 to 479 adds `g` and `river` for `meadowTop`: 3 names to 2 |
| `gableMass` 79 | 128 to 160, the else branch (the ridge roof) | form P: `ridgeRoof(e: Engraver, weight: number, x: number, w: number, top: number, gh: number, roofFill: string): SvgNode[]` 42; the else block holds `out.push(...ridgeRoof(e, weight, x, w, top, gh, roofFill));` | 47 | the gable branch alone leaves 55; the whole if statement makes a helper of 64 |
| `verticalMass` 78 | 220 to 254, the else branch (the spire) | form P: `spireRoof(e: Engraver, weight: number, x: number, w: number, h: number, top: number): SvgNode[]` 39; the else block holds `out.push(...spireRoof(e, weight, x, w, h, top));` | 44 | the tower branch leaves 71; the broken branch leaves by `return` |
| `keepMass` 75 | 292 to 329, the turret loop | form P: `keepTowers(e: Engraver, weight: number, x: number, w: number, base: number, top: number): SvgNode[]` 42; call `out.push(...keepTowers(e, weight, x, w, base, top));` | 38 | the broken branch leaves by `return`; nothing else cuts 27 |
| `shipEngraved` 62 | 466 to 499, the mast loop | form P: `shipMasts(e: Engraver, x: number, y: number, s: number, great: boolean): SvgNode[]` 38; call `out.push(...shipMasts(e, x, y, s, great));` | 29 | the hull (453 to 461) leaves 54 |
| `quayEngraved` 53 | 547 to 557, the arcade (`span` and its loop) | form P: `quayArches(e: Engraver, q: Extract<ForegroundElement, { kind: "quay" }>, y: number): SvgNode[]` 15; call `out.push(...quayArches(e, q, y));` | 43 | the steps push (558 to 564), as many names (4), head 47; the joints and the `out` declaration as form O, 5 names |
| `foregroundEngraved` 71 | 630 to 639, the body of the `mastRow` clause's block; 648 to 664, the argument of the `beachedHulls` clause's `only(...)` | `mastRowEngraved(e: Engraver, f: Extract<ForegroundElement, { kind: "mastRow" }>, rng: Rng): { readonly nodes: SvgNode[]; readonly gaps: Gap[] }` 16, clause `case "mastRow": return mastRowEngraved(e, f, rng);`; `beachedHullsEngraved(e: Engraver, f: Extract<ForegroundElement, { kind: "beachedHulls" }>): SvgNode[]` 19, returning line 648's expression, clause `case "beachedHulls": return only(beachedHullsEngraved(e, f));`, the form the `quay` and `mole` clauses already take | 43 | no single clause cuts 23; the beached hulls with the ship clause leave 50 |

Every helper is declared directly above the function that calls it, in the order called, and none is exported (pull request 5's call 6). New imports in the edited files: `type Lettering` joins `compose-e.ts`'s import from `../letter/letter.ts`.

### Per file

| file | the cut | head (lines of code) | runner-up, and why it lost |
|---|---|---|---|
| `townscape.ts` 667 | lines 27 to 336, `SHADOW`, `windows`, `door`, `shadowStrip`, `brokenGable`, `gableMass`, `courses`, `battlements`, `verticalMass`, `keepMass`, to `src/prospect/dress/townscape-masses.ts` (324), with the three form P helpers; `gableMass`, `verticalMass` and `keepMass` gain `export`, and `townscape.ts` imports them for `massNodesEngraved` | 384 | the harbour group (`shipEngraved` through `foregroundEngraved`) re-points two test imports (rule 1) |
| `rise.ts` 484 | `picture` and everything only it reaches, lines 58 and 59 (`FIGURE_H`, `FIGURE_SPAN`) and 313 to 516 (`placeFigures`, `figureBox`, `riseGround`, `fence`, `rocks`, the serpent's constants and `SHIP`, `serpentNodes`, `Picture`, `seatBeast`, `shipBox`, `picture`), to `src/prospect/dress/rise-picture.ts` (217), which imports `LIFT`, `RISE_BOTTOM`, `RISE_TOP`, `WATER_BOTTOM`, `vignette` and the types `Box`, `Scene`, `Streams`, `Vignette` from `rise.ts`; `compose-e.ts`'s one import line from `./rise.ts` becomes two, `picture` and `type Picture` now from `./rise-picture.ts` | 289 | a leaf with nothing to re-point cannot reach 89 lines (`ridgeEngraved` and the serpent group come to about 61); the near ground with `RISE_TOP` and `RISE_BOTTOM` re-points as much (`compose-e.ts` reads `RISE_BOTTOM`), leaves `rise.ts` at about 367 (predicted), and leaves `picture` to split in `rise.ts` |
| `figures.ts` 479 | the parts a figure's glyph is assembled from, lines 72 to 131 (`W`, `sw`, `garment`, `line`, `head`, `hand`, `ruff`, `hat`, `legs`) and 396 to 445 (`horse`, which only `rider` calls, as a part), to `src/prospect/dress/figures-parts.ts` (109); every one but `sw` gains `export`, and `figures.ts` imports the nine; no glyph `DRAW` names leaves `figures.ts` | 373 | every glyph with the parts, about 394 with its imports, at the margin; the parts with the beasts (`dog`, `sheep`, `rider`) in one file named for neither |
| `furniture.ts` 403 | lines 111 to 173, `RING` and `wreath`, to `src/prospect/dress/furniture-wreath.ts` (65), which takes the type `Inked` back from `furniture.ts` (rule 2); `furniture.ts` imports `wreath` for `wreathedArms` and `chartRoundel` | 342 | `frameNodes` to a sibling re-points `compose-e.ts`'s import (rule 3: one line to none); the medals (`wreath`, `wreathedArms`, `chartRoundel`) re-point two names and move `wreathedArms`, which `test/repo/source-shape-prospect.test.ts`'s message places in `furniture.ts` |

The import lines each new file opens with, exactly: `townscape-masses.ts`: `import { el, type SvgNode } from "../../render/svg.ts";`, `import type { Mass } from "../geometry.ts";`, `import { hatchNode, poly, r1, stroke, washOr, type Engraver } from "./burin.ts";`. `figures-parts.ts`: `import { el, type SvgNode } from "../../render/svg.ts";`, `import type { Pt } from "../geometry.ts";`, `import { hatchPolygon, poly, r1, washOr, type Engraver } from "./burin.ts";`. `furniture-wreath.ts`: `import { el } from "../../render/svg.ts";`, `import { r1, washOr, type Engraver } from "./burin.ts";`, `import type { Inked } from "./furniture.ts";`. `rise-picture.ts`: `import { el, type SvgNode } from "../../render/svg.ts";`, `import type { Rng } from "../../core/rng.ts";`, `import { VIEW_X0, VIEW_X1, type Pt } from "../geometry.ts";`, `import { groundSweep, poly, r1, stroke, treeClump, washOr, yOnPolyline, type Engraver } from "./burin.ts";`, `import { shipEngraved } from "./townscape.ts";`, `rise.ts`'s line 41 (`import { castFor, figureNodes, FIGURE_WIDTH, type Figure } from "./figures.ts";`), and the import from `./rise.ts` named above. `rise.ts` loses `shipEngraved` from its `./townscape.ts` import and its line 41; `figures.ts` loses line 6 and its `./burin.ts` import becomes `import { r1, type Engraver } from "./burin.ts";`, then `import { garment, hand, hat, head, horse, legs, line, ruff, W } from "./figures-parts.ts";`; `furniture.ts` and `townscape.ts` each gain one import line after their `./burin.ts` or `./rise.ts` import. The family tool (Appendix B) is the exact form of all of it.

**Two different `WATER_BOTTOM`s.** `src/prospect/dress/rise.ts` exports `WATER_BOTTOM = 268` and `src/prospect/geometry.ts` exports `WATER_BOTTOM = 276`. `picture` and `shipBox` read `rise.ts`'s, so `rise-picture.ts` imports it from `./rise.ts`; importing it from `../geometry.ts` compiles, moves 2,646 of the 4,180 reach-set pictures (witness W3), and reds "finished plates are byte-pinned across the eras and the dresses" in `test/prospect/finished.test.ts` (the plan skeptic's run), so the pins hold it after the merge too.

### What holds the order

- **The streams.** Each prospect stream is consumed in call order: `s.sky` by `cloudsFor`, `skyLines`, the two `s.sky.next()` in `openSky`'s arguments, then `birdFlock`; `s.town` by `foregroundEngraved` (through `engraved`), `townNodes`, then the near band's `groundSweep`; `s.water` by `waterEngraved`; `s.rise` by the plain's `groundSweep`, `shipX`, `shipEngraved`, then `riseGround`. Every cut moves whole statements to a helper called at their place, so no draw changes its turn. A helper handed an `Rng` or the `Streams` (`mastRowEngraved`, `vignetteWater`) consumes it as the run did: a stream is consumed by design, the one standing exception to "a helper writes into nothing it is handed" (call 5).
- **The lettering.** `createLettering`'s `defs()` emits each glyph's path in first-use order (its `defined` map), so the order of every `letters.run` in `engraveE` is part of the output, and `fixedFurniture` keeps the base's order: the cartouche, the banderole, the medals, the key panel and tags, the cardinal words and the footer, then the tags' clearances; `plateNode` reads `letters.defs()` where the base did, after every run. Swapping the key and the margin inside `fixedFurniture` reads `same` to the statement proof and moves 3,802 of the 4,180 pictures (witness W5), which is why the byte sets, not the statement proof, hold the order.

### Measured on the dry run of the whole slice

The base exported from 150e6b41 into the scratchpad (`git archive`, so not a git checkout; the planning tree holds no production code) four times: `814-prospect-base`, the untouched base; `814-prospect-copy`, a second copy, the reach set's determinism control; `814-prospect-dry`, where the slice was written by `814-prospect-split.ts` with the prune and the ceilings and formatted; and `814-prospect-dry3`, a third build from a fresh export, family by family, each family's checks run as the commits below run them. On them:

- **The red** (commit 1's prune and ceilings alone) was exactly the 13 errors of commit 1 below.
- **Each family** (the third build): `npm run format` rewrote only the files commits 2 to 6 name, `npm run format:check` passed, `814-tests-size.ts` printed exactly the lines below, the lint over the family's files exited 0, `npm run check` exited 0, and the hashes were Appendix C's.
- **After the families**: `npm run lint` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` wrote a file byte-identical to `814-prune.ts`'s; and, with the dry head's files copied into the planning tree (a git checkout) and removed again afterwards, the two targeted test sets passed 103 and 80, their counts at the base, and `npm test` passed 2718 of 2718.
- **A second build** from a fresh export, with a whole-tree `npm run format` after the five families, reproduced every Appendix C hash and the same `src/` tree; the family tool run a second time on a written tree threw (`src/prospect/dress/townscape-masses.ts exists already`; for `compose-e`, `the file is 209 lines, not 198`) and wrote nothing.
- **The proofs** printed exactly the lines the commits below name.
- **The sets** (Evidence): the base and the dry head drew ruling 3's 2,039 artifacts and the 4,180 reach pictures each, none throwing; `814-engine-compare.ts` read `2039 artifacts: 0 differ` and `4180 artifacts: 0 differ`. The manifests' sha256: ruling 3's set c80064e4118f7b4c6759b51ed4f0258dfadc693dc72c748499beee36c93c5936 (pull request 5's value, on Node v26.12.0), the reach set 75dfd091c9236eef9d963ecd388f42a5f7ba4088fa7aeef5af6f3bf0446e81c1. The untouched copy's reach set read `4180 artifacts: 0 differ` against the base. The reach set drew in 16.1 s at the base and 16.3 s at the head, one run each, an observation and not a bound (call 12).
- **Reach**: under `NODE_V8_COVERAGE`, the base reach set ran every line of every range this slice moves or edits (`814-engine-cover.ts` over `compose-e.ts` 112 to 198, `figures.ts` 72 to 131 and 396 to 445, `furniture.ts` 111 to 173, `rise.ts` 58 to 59, 251 to 311 and 313 to 516, `townscape.ts` 27 to 336, 452 to 513, 515 to 567 and 616 to 686: "all run" for each). Over the five whole files only two lines never run, both outside every moved or edited range: `furniture.ts` line 404 (`seatLabel`'s last `return null`) and `compose-e.ts` line 59 (`inkChannels`'s throw for an ink that is not `#rrggbb`).

**The instrument bites** (each planted in a scratch copy of the final dry head, the reach set drawn and compared with the base, 2026-10-19):

| witness | plant | read |
|---|---|---|
| W1 | in `keepTowers`, the pennant's `V${r1(top - 19.5)}` becomes `V${r1(top - 19.6)}` | 614 differ: fixture 496, world 118 |
| W2 | in `meadowBand`, `{ x: VIEW_X1, y: WATER_BOTTOM + 4 }` becomes `+ 5` | 1,516 differ: fixture 1,400, world 116 |
| W3 | `rise-picture.ts` takes `WATER_BOTTOM` from `../geometry.ts` instead of `./rise.ts` (it type-checks) | 2,646 differ: fixture 1,652, world 994 |
| W4 | in `horse`, the eye's `r: 0.45` becomes `r: 0.46` | 926 differ: fixture 540, world 386 |
| W5 | in `fixedFurniture`, the `key` and `margin` declarations swap | 3,802 differ: fixture 1,796, world 2,006; the statement proof reads the family `same` |
| W6 | in `furniture-wreath.ts`, `RING`'s `[0.866, 0.5]` becomes `[0.9, 0.5]` | 4,180 differ, every picture (each carries the chart roundel); `[0.867, 0.5]` read 0, a change the 0.1 rounding at emit swallows |

These ran at planning and need not be run again: the tools are pinned by their hashes.

### Alternatives rejected

- **The harbour group out of `townscape.ts`** (`waterEngraved` through `foregroundEngraved`): `test/prospect/dress.test.ts` imports `shipEngraved` and `foregroundEngraved` from `townscape.ts` (rule 1).
- **A value cycle** (a sibling holding `riseGround` and the serpent while reading `rise.ts`'s constants, which `rise.ts` would import back): it would load only because function declarations are bound before evaluation; rule 2 refuses it.
- **Re-exporting a moved symbol from the file it left**: two homes for one name (rule 3).
- **The masses' if statements whole** (gable and ridge in one helper): a helper of 64 lines.
- **A helper handed `out`** to push into, in place of form P: it writes into a list it was handed (the governing call 13).
- **`out.push(...(m.form === "gable" ? gableRoof(...) : ridgeRoof(...)))`** in place of the if statement: it rewrites the gable branch too, and the if statement no longer reads the same to the statement proof.
- **`beachedHullsEngraved` handed `only`**, so the clause body could move whole: `only` is a local of `foregroundEngraved`; the clause keeps it, as its `quay` and `mole` clauses do.
- **`figures-glyphs.ts` with every glyph and `DRAW`** (about 402 lines) or every glyph without `DRAW` (about 394 with imports): over or at the margin.
- **Two siblings for `figures.ts`** (`figures-pen.ts` and `figures-beasts.ts`): one more file than the parts cut, which fits with 22 lines of headroom.
- **Timing a function** as pull request 5 timed `cellSegments`: no function this slice edits runs per cell (K5's hot-path line), call 12.

## Files

Created: `src/prospect/dress/townscape-masses.ts`, `src/prospect/dress/rise-picture.ts`, `src/prospect/dress/figures-parts.ts`, `src/prospect/dress/furniture-wreath.ts`; `handbook/plans/814/814-prospect-plan.md` (this file).

Edited: `src/prospect/dress/compose-e.ts`, `src/prospect/dress/figures.ts`, `src/prospect/dress/furniture.ts`, `src/prospect/dress/rise.ts`, `src/prospect/dress/townscape.ts`; `eslint-suppressions.json` (5 entries out, 12 left); `test/repo/lint-config.test.ts` (the five files' `LIST_AT_REFORMAT` lines out, and nothing else). Nothing else; in particular no other test file, no file under `e2e/`, `scripts/`, `test-support/` or `.claude/`, no spec and no errata row. Appendix A lists every moved range; the family tool (Appendix B) is the exact form.

## The tools, before the first commit

In the scratchpad (`<scratch>` below; `<repo>` is your worktree's absolute path; `<base>` is 150e6b413c85a0d59c2177b8e73ab8e001a3ba15):

- **Reused**, unchanged, each with its sha256 (`shasum -a 256`), and each written again from the archived plan on main named beside it if missing or different: `814-prune.ts` 25f9e51e4d2c190314d685f16b5f19e0c6a5d962d36ce0a4aecb2db5db972032 and `814-test-proof.ts` 3ed5f9dc89537e812d3f89f9dfce81c178736680b318b864e75def91c1d0a707 (`handbook/plans/814/814-plan.md`, Appendix B); `814-tests-size.ts` b4cf45dae8879b8da52c295ae1885b1a3fcf506879827e671d9a14dcc474da43 and `814-tests-counts.ts` e64470854543bbd0c7d549c94028721a79745ff5788ec15eaf7985a37d0f1d04 (`handbook/plans/814/814-tests-plan.md`, Appendix B); `814-engine-draw.ts` a86bcca0b36b58fb3370dc293335a0158356f76fae4fc2f88a16c669687cbd03, `814-engine-compare.ts` 3d402b786393cb40f20a644f5e4fc8b1689c8c34af006472ce30daf92ed1da67 and `814-engine-clauses.ts` bc60382ff019a58ea4bd9dff17205b23ba1af7e28242e750074ef292e58da83e (`handbook/plans/814/814-engine-plan.md`, Appendix B). The text of each is the fenced block under its heading there, with one final newline.
- **This slice's**, written exactly as Appendix B gives them (the planning copies are in the scratchpad under these names, and `shasum -a 256` must print the hash given there): `814-prospect-split.ts` (the family tool) and `814-prospect-towns.ts` (the reach set).

Each loads the repo's own modules by path, so it runs from any directory, on bare `node`. The two draws import only `src/` and `test-support/`, which need no `node_modules`.

## Commits

Branch `chore/814-size-prospect`. The two targeted test sets, named below by their label, each one comma-separated family for `814-tests-counts.ts`:

- **PROSPECT**: `test/prospect/compose-world.test.ts,test/prospect/dress-world.test.ts,test/prospect/dress.test.ts,test/prospect/engraved.test.ts,test/prospect/finished-world.test.ts,test/prospect/finished.test.ts,test/prospect/geometry-invariants.test.ts,test/prospect/geometry.test.ts,test/prospect/input.test.ts,test/prospect/key-world.test.ts,test/prospect/letter.test.ts,test/prospect/plate-e-world.test.ts,test/prospect/plate-e.test.ts,test/prospect/plate-face.test.ts,test/prospect/surroundings.test.ts,test/prospect/transect.test.ts`: 103 tests at the base (the plate pins among them).
- **REACH**: `test/site/prospect-job.test.ts,test/atlas/compose.test.ts,test/atlas/document.test.ts,test/render/former-name-surfaces.test.ts,test/site/print-room-contents.test.ts,test/cli/atlas.test.ts,test/site/app-bundles.test.ts,test/repo/source-shape-prospect.test.ts,test/repo/lint-config.test.ts`: 80.

**Commit 1: the plan, the red and the base's records.**

1. Copy this file to `handbook/plans/814/814-prospect-plan.md`.
2. `node <scratch>/814-prune.ts <repo> src/prospect/dress/compose-e.ts src/prospect/dress/figures.ts src/prospect/dress/furniture.ts src/prospect/dress/rise.ts src/prospect/dress/townscape.ts` prints `5 entries deleted, 12 left`.
3. `node <scratch>/814-prospect-split.ts <repo> ceilings` prints `ceilings: written` (it deletes the five files' `LIST_AT_REFORMAT` lines, and nothing else). Then `shasum -a 256 eslint-suppressions.json test/repo/lint-config.test.ts` prints Appendix C's first two hashes (measured: they need no formatting).
4. `npm run lint` exits 1 with exactly these 13 errors and no other (measured): `src/prospect/dress/compose-e.ts` 112:8 `engraveE` (87); `src/prospect/dress/figures.ts` 423:1 `max-lines` (479); `src/prospect/dress/furniture.ts` 432:1 `max-lines` (403); `src/prospect/dress/rise.ts` 251:8 `vignette` (61), 429:1 `max-lines` (484) and 466:8 `picture` (51); `src/prospect/dress/townscape.ts` 87:1 `gableMass` (79), 183:1 `verticalMass` (78), 262:1 `keepMass` (75), 414:1 `max-lines` (667), 452:8 `shipEngraved` (62), 515:1 `quayEngraved` (53) and 616:8 `foregroundEngraved` (71). `npm test -- test/repo/lint-config.test.ts` passes.
5. Before any file under `src/` changes, take the base's records:
   - `node <scratch>/814-engine-draw.ts <repo> <repo>/out/814-prospect-base/set` prints `atlas: 33 artifacts, 0 threw`, `chart: 800 ...`, `contours: 20 ...`, `namer: 10 ...`, `ribbon: 1010 ...`, `town: 146 ...`, `world: 20 ...`, each `0 threw`, then `total: 2039 artifacts in` about 60 s, and exits 0.
   - `node <scratch>/814-prospect-towns.ts <repo> <repo>/out/814-prospect-base/towns` prints `fixture: 2160 pictures`, `world: 2020 pictures`, then `total: 4180 pictures, 0 threw, in` about 16 s, and exits 0.
   - Note both manifests' sha256 (`shasum -a 256 <repo>/out/814-prospect-base/set/manifest.txt <repo>/out/814-prospect-base/towns/manifest.txt`) for the body. The planning run read c80064e4118f7b4c6759b51ed4f0258dfadc693dc72c748499beee36c93c5936 and 75dfd091c9236eef9d963ecd388f42a5f7ba4088fa7aeef5af6f3bf0446e81c1 on Node v26.12.0; another value names another Node or machine and is not a stop, since the comparison is base against head on yours.
   - `node <scratch>/814-tests-counts.ts <repo> <PROSPECT> <REACH>` prints tests 103 and 80, each `exit 0` and `fail 0`.
   - `npm test`, then `npm run astro:generate`: every test passes, and the total it prints is the base total the closing check compares with (2718 at 150e6b41, measured; a main that moved under files outside this slice may give another, which is then the number).
6. Commit `#814 The plan, and the lint red on the overruns pull request 6 splits`. Push.

**Commits 2 to 6: one family each, in this order.** For each, with `<family>`, its files and its expected output from the tables:

1. `node <scratch>/814-prospect-split.ts <repo> <family>` prints `<family>: written`.
2. `npm run format`; it rewrites exactly the files the table's "format rewrites" column names and no other; then `npm run format:check` passes.
3. `node <scratch>/814-tests-size.ts <repo> 45 <the family's files>` prints exactly the family's lines below (every function of 45 lines of code or more in those files, untouched and moved-whole ones included), and nothing else.
4. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 <the family's files>` exits 0, and `npm run check` exits 0.
5. `shasum -a 256 <the family's files>` prints Appendix C's hashes for that commit.
6. `node <scratch>/814-test-proof.ts <repo> <base> <family spec>` and `node <scratch>/814-engine-clauses.ts <repo> <base> <family spec>` print the verdicts in the table, and for a `DIFF` the lines named after it and no other.
7. `node <scratch>/814-tests-counts.ts <repo> <PROSPECT> <REACH>` prints 103 and 80, each `exit 0`, `fail 0`.
8. Commit with the message in the table.

| # | family | the family's files | format rewrites | `<family spec>` | statement proof | clause proof | commit message |
|---|---|---|---|---|---|---|---|
| 2 | `compose-e` | `src/prospect/dress/compose-e.ts` | none | `src/prospect/dress/compose-e.ts=src/prospect/dress/compose-e.ts` | `same`, 46 -> 46 statements, new functions [fixedFurniture, plateNode] | `same`, 43 -> 43 | `#814 engraveE takes its fixed furniture and its svg root from two helpers` |
| 3 | `figures` | `src/prospect/dress/figures.ts`, `src/prospect/dress/figures-parts.ts` | none | `src/prospect/dress/figures.ts=src/prospect/dress/figures.ts,src/prospect/dress/figures-parts.ts` | `same`, 60 -> 60, [] | `same`, 162 -> 162 | `#814 The parts a figure is drawn with leave figures.ts for a module of their own` |
| 4 | `furniture` | `src/prospect/dress/furniture.ts`, `src/prospect/dress/furniture-wreath.ts` | none | `src/prospect/dress/furniture.ts=src/prospect/dress/furniture.ts,src/prospect/dress/furniture-wreath.ts` | `same`, 137 -> 137, [] | `same`, 97 -> 97 | `#814 The wreath leaves furniture.ts for a module of its own` |
| 5 | `rise` | `src/prospect/dress/rise.ts`, `src/prospect/dress/rise-picture.ts`, `src/prospect/dress/compose-e.ts` | `rise.ts`, `rise-picture.ts` | `src/prospect/dress/rise.ts,src/prospect/dress/compose-e.ts=src/prospect/dress/rise.ts,src/prospect/dress/rise-picture.ts,src/prospect/dress/compose-e.ts` | `same`, 212 -> 212, [fixedFurniture, meadowBand, plateNode, vignetteWater] | `same`, 142 -> 142 | `#814 The plate's picture leaves rise.ts for a module of its own, and vignette takes its water from a helper` |
| 6 | `townscape` | `src/prospect/dress/townscape.ts`, `src/prospect/dress/townscape-masses.ts` | `townscape.ts`, `townscape-masses.ts` | `src/prospect/dress/townscape.ts=src/prospect/dress/townscape.ts,src/prospect/dress/townscape-masses.ts` | `DIFF`, 157 -> 168, [beachedHullsEngraved, keepTowers, mastRowEngraved, quayArches, ridgeRoof, shipMasts, spireRoof] (S1) | `DIFF`, 163 -> 163 (C1) | `#814 The townscape's masses leave townscape.ts for a module of their own, and six long functions take helpers` |

"format rewrites" names the files `npm run format` lists without `(unchanged)`; the family tool writes the other files already in Prettier's layout. The `rise` family proves `compose-e.ts` with it because its import of `picture` moves; the `compose-e` family's two helpers read there as functions the base family does not declare.

Step 3's expected output, per family (measured on the third build):

```
compose-e:  src/prospect/dress/compose-e.ts: 195 lines of code
                line 163: Function 'engraveE' 46
figures:    src/prospect/dress/figures.ts: 373 lines of code
            src/prospect/dress/figures-parts.ts: 109 lines of code
                line 66: Function 'horse' 50
furniture:  src/prospect/dress/furniture.ts: 342 lines of code
            src/prospect/dress/furniture-wreath.ts: 65 lines of code
                line 20: Function 'wreath' 48
rise:       src/prospect/dress/rise.ts: 289 lines of code
            src/prospect/dress/rise-picture.ts: 217 lines of code
            src/prospect/dress/compose-e.ts: 196 lines of code
                line 164: Function 'engraveE' 46
townscape:  src/prospect/dress/townscape.ts: 384 lines of code
                line 271: Function 'moleEngraved' 46
            src/prospect/dress/townscape-masses.ts: 324 lines of code
                line 108: Function 'gableMass' 47
```

The family label on the left is not printed; the tool indents a function's line by four spaces. `horse` moves whole at 50, unchanged from the base and inside the lint's 50, so it is moved text and not a function the slice writes or shortens (pull request 3's reading of `hd1Dispatch`); `wreath` moves whole at 48; `moleEngraved` is untouched at 46.

Every statement-proof line also reads `0 -> 0 tests, 0 -> 0 assertions`. The named DIFF lines, exactly as the tools print them (each cut at 200 characters, so the lines below are cut at their own ends as the tool cuts them), measured:

**S1** (`townscape`, statement proof): the five form P calls and their five `out = [ ] ;` lines, the `foregroundEngraved` switch gone and added, the `beachedHullsEngraved` return, and the ridge roof's first push, gone with its trailing comma and added without it, because Prettier sets it on one line at its new depth:

```
      statement gone: out . push ( el ( "path" , { d : poly ( roof ) , fill : roofFill , ... stroke ( e , weight ) } ) , hatchNode ( e , roof , 0 , 1.3 , 0.35 , 0.8 ) , ) ;
      statement gone: switch ( f . kind ) { case "trees" : return only ( f . items . flatMap ( ( t ) => treeClump ( e , t . x , t . y , t . s * 3.1 , rng , f . species ) ) ) ; case "quay" : return only ( quayEngraved ( ...
      statement added: out . push ( ... shipMasts ( e , x , y , s , great ) ) ;
      statement added: out = [ ] ;
      statement added: out . push ( ... quayArches ( e , q , y ) ) ;
      statement added: return f . hulls . map ( ( h ) => el ( "g" , { transform : `rotate(${ r1 ( h . tilt ) } ${ r1 ( h . x ) } ${ r1 ( h . y ) })` } , [ el ( "path" , { d : `M${ r1 ( h . x - 11 ) } ${ r1 ( h . y ) }q11...
      statement added: switch ( f . kind ) { case "trees" : return only ( f . items . flatMap ( ( t ) => treeClump ( e , t . x , t . y , t . s * 3.1 , rng , f . species ) ) ) ; case "quay" : return only ( quayEngraved ( ...
      statement added: out = [ ] ;
      statement added: out = [ ] ;
      statement added: out . push ( el ( "path" , { d : poly ( roof ) , fill : roofFill , ... stroke ( e , weight ) } ) , hatchNode ( e , roof , 0 , 1.3 , 0.35 , 0.8 ) ) ;
      statement added: out . push ( ... ridgeRoof ( e , weight , x , w , top , gh , roofFill ) ) ;
      statement added: out = [ ] ;
      statement added: out . push ( ... spireRoof ( e , weight , x , w , h , top ) ) ;
      statement added: out = [ ] ;
      statement added: out . push ( ... keepTowers ( e , weight , x , w , base , top ) ) ;
```

**C1** (`townscape`, clause proof): exactly the two clauses that now call a helper, every other clause and element the same:

```
      gone   clause: case "mastRow" : { const scale = ( mastH ) => 0.72 + ( mastH - 42 ) / 90 ; return { nodes : f . masts . flatMap ( ( m ) => shipEngraved ( e , m . x , m . hullY , scale ( m . mastH ) , m . m...
      gone   clause: case "beachedHulls" : return only ( f . hulls . map ( ( h ) => el ( "g" , { transform : `rotate(${ r1 ( h . tilt ) } ${ r1 ( h . x ) } ${ r1 ( h . y ) })` } , [ el ( "path" , { d : `M${ r1 ...
      added  clause: case "mastRow" : return mastRowEngraved ( e , f , rng ) ;
      added  clause: case "beachedHulls" : return only ( beachedHullsEngraved ( e , f ) ) ;
```

Each tool's last line reads `1 families against 150e6b413c85a0d59c2177b8e73ab8e001a3ba15: 1 differ` for a DIFF family and `0 differ` for a `same` one.

### Closing checks (no commit unless one writes something)

- `npx eslint --flag unstable_native_nodejs_ts_config --prune-suppressions .` then `git diff --exit-code eslint-suppressions.json` exits 0 (measured on the dry run: byte-identical).
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test`, which passes every test, the same total as commit 1's run (2718 of 2718 measured; no test is added or removed), then `npm run astro:generate`.
- `git check-ignore -v src/prospect/dress/townscape-masses.ts src/prospect/dress/rise-picture.ts src/prospect/dress/figures-parts.ts src/prospect/dress/furniture-wreath.ts` exits 1.
- **The sets at the head**: `node <scratch>/814-engine-draw.ts <repo> <repo>/out/814-prospect-head/set` prints the seven count lines of commit 1, `total: 2039 artifacts`, exit 0; `node <scratch>/814-prospect-towns.ts <repo> <repo>/out/814-prospect-head/towns` prints commit 1's three lines, exit 0. Then `node <scratch>/814-engine-compare.ts <repo>/out/814-prospect-base/set <repo>/out/814-prospect-head/set` prints `atlas: 33 same, 0 differ`, `chart: 800 same, 0 differ`, `contours: 20 same, 0 differ`, `namer: 10 same, 0 differ`, `ribbon: 1010 same, 0 differ`, `town: 146 same, 0 differ`, `world: 20 same, 0 differ` and `2039 artifacts: 0 differ`, exit 0; and `node <scratch>/814-engine-compare.ts <repo>/out/814-prospect-base/towns <repo>/out/814-prospect-head/towns` prints `fixture: 2160 same, 0 differ`, `world: 2020 same, 0 differ` and `4180 artifacts: 0 differ`, exit 0.
- No e2e suite runs locally: no file under `e2e/` changes. CI runs every lane; the suites whose checks draw a town picture in the browser are among those `git grep -l prospect -- e2e/suites` lists.
- The pull request body's closing-reference line is the template's form for an issue a pull request deliberately leaves open, with no closing keyword beside the number: `Issue: #814, stays open because two more pull requests follow (plan: handbook/plans/814/814-prospect-plan.md).` After the body is written, and again after any rewrite, `gh pr view <N> --json closingIssuesReferences` prints an empty list.

## Tests and guards

No test is added, strengthened or restructured, so no new guard's red is written: the red is commit 1's lint, and the guards are the lint's two caps. `vellum-guard-prover` is not owed: the governing call 10 owes bite parity on a helper that holds assertions, and no test file changes but `test/repo/lint-config.test.ts`'s five ceiling lines, which the governing design lowers in every pull request. `vellum-plate-reader` is not owed: nothing changes an appearance (governing call 12), which the byte-identical sets measure.

**What holds what.** Ruling 3's set holds every artifact the engine draws for its worlds and options, its town pictures and atlas plates the part that reaches this code. The reach set holds the town pictures of all twenty worlds at two years and a fixture grid, and is what reaches every moved and edited line. The plate pins (`test/prospect/finished.test.ts`, in PROSPECT and in `npm test`) hold eleven whole plates. The statement proof holds that every statement the slice moves keeps its text (a multiset, nested blocks elided). The clause proof holds every switch clause and array element whole. What neither proof reads is the order of statements within a moved run, which decides the lettering's defs and each stream's draws: the byte sets read it (W5), the family tool copies base line ranges in order, and Appendix C's hashes pin the head's bytes to the text reviewed here.

## Rosters and doctrine

- **Joined by itself, nothing by hand**: each new file is reached by `tsconfig.engine.json` and `tsconfig.worker.json`, by the lint's TypeScript roots, by `vellum/prospect-libm-clock-free`'s `src/prospect/` glob, and by `test/site/app-bundles.test.ts`'s `PLATE_MODULE` pattern, and reaches the worker bundle through the dress file that imports it. No test reads it as text, so `SOURCE_READS` is unchanged.
- **Citations hold**: every symbol prose or a test names stays in its file (Recon). No spec, agent, skill or test message is re-pointed; `test/repo/source-shape-prospect.test.ts`'s message about `furniture.ts` and `armsNode` stays true.
- **No spec line changes, and no errata row** is added or removed.

## Evidence

The commands above, in order: commit 1's red and base records; per family the format, size, lint, check, hash, statement-proof, clause-proof and count checks; the closing checks and the two compares; CI's lanes and unit shards on the pull request. In the body, and as a pull request comment with the harness named (workflow step 10, since `out/` is not tracked): the two compares' lines and the four manifests' sha256. **No regen is owed** (Gate 6 item 7), on three commands: the compares' `2039 artifacts: 0 differ` and `4180 artifacts: 0 differ`, and `npm test` green, whose `test/prospect/finished.test.ts` holds the plate pins; `test/world/golden-seed42.test.ts` and `test/site/hero-charts.test.ts` pass too and reach none of this code, which the body says. The e2e suites the change touches by file: none.

## Calls made (each open to overrule)

1. **One commit per family, written by a tool from base line ranges** (`814-prospect-split.ts`), each checked on its own before the next. Rule: pull request 2's call 10; pull request 5's call 1.
2. **A cut is placed by the four rules of "The rules that place a cut"**: a symbol a test imports stays in its file; no value import cycle, a type-only import back allowed; no re-export and the fewest import lines re-pointed; then the fewest new files and the most headroom. Rule: the governing "Citations hold"; Issue #654 row 9b's `src/world/daily-hunt-clue-facts.ts` for the type-only import back; pull request 1's call 6 and pull request 5's call 4.
3. **The cut inside a function is chosen by pull request 5's rule**, restated whole in the design (a case clause's body moving whole to a helper the clause returns, as `mastRow`'s does), with this slice's `only(...)` argument form for `beachedHulls`, each runner-up named. Rule: pull request 5's call 2; the argument form is the shape `foregroundEngraved`'s `quay` and `mole` clauses already have.
4. **Form P, the owning push**, for the five functions whose every long run pushes into `out`. Rule: the governing call 13 (a helper owns what it fills and hands it back) and K5 ("the plan writes the replacement out in full" where no plain cut exists); pull request 4's form O is the same shape with the list declared inside the run.
5. **A helper handed an `Rng`, the `Streams` or the `Lettering` consumes it as the run did**, the one standing exception to "a helper writes into nothing it is handed": a stream and the lettering's glyph collector are consumed by design, and each is consumed in the base's order because the helper runs where the run stood. Rule: `handbook/specs/engine-invariants.md` "Fork derivation" (no draw moves); the base already hands both to every dress function.
6. **A helper's parameters** are the caller's parameters in its order, then the caller's locals in their declaration order; a helper handing back one value names its type, one handing back a bag keeps the inferred type. Rule: a mechanical order the builder does not choose; pull request 5's call 18 for the inferred bag.
7. **The reach set joins ruling 3's set**: every settlement of the twenty worlds of ruling 3's set in both dresses at the present year and the year before its founding (2,020 pictures), and a grid of 2,160 fixture plates (every kind, inland, harbour and river, standing and ruined, six foreground bands, two surroundings, three years, both dresses), drawn by `814-prospect-towns.ts`, compared by the same `814-engine-compare.ts`. Rule: the governing call 15 (the comparison must reach the code it vouches for; it adds artifacts, not a heavier method), measured by coverage: ruling 3's set alone never runs large parts of the moved code, and the reach set runs every moved and edited line.
8. **Ruling 3's set stays in full and unchanged** (`814-engine-draw.ts`, pull request 5's tool), though only its town pictures and atlas plates reach this code. Rule: ruling 3 names it; pull request 5's call 8, the same reasoning the other way round.
9. **`rise.ts` gives `picture` and everything only it reaches to `rise-picture.ts`, and `compose-e.ts`'s import of `picture` and `Picture` is re-pointed.** Rule: call 2; no cut with nothing to re-point reaches the 89 lines needed without a value cycle, and against the near-ground cut, which re-points as many lines (`compose-e.ts` reads `RISE_BOTTOM`) and adds as many files, this one leaves the more headroom (289 against about 367, predicted) and moves a whole subtree nothing left in `rise.ts` calls.
10. **`figures-parts.ts` holds the parts and the horse**, and every glyph `DRAW` names stays in `figures.ts`. Rule: call 2; the horse is a part only `rider` assembles, as `rider` assembles the hat and the hand.
11. **`furniture-wreath.ts` takes the type `Inked` back from `furniture.ts`.** Rule: call 2 (none re-pointed, against `frameNodes`' one).
12. **No timing.** Rule: K5 times a hot function, one that runs per cell; none here does, and form P's extra array is per mass, per ship and per quay. The reach set's draw times (16.1 s and 16.3 s) are recorded as an observation only.
13. **The plate pins are cited as evidence**, the golden and the drift guard as unchanged. Rule: recon (the pins reach all five files, the other two none); workflow step 10.
14. **No list is locked by an edit.** The one list a cut newly shares is `RISE_TOP`, which nothing outside `rise.ts` reads at the base and `rise-picture.ts` reads at the head; it is already `ReadonlyArray<Pt>`, and `Pt`'s two fields are read-only (`src/prospect/geometry.ts`), so it is locked as it stands. `RING`, `SHADOW`, `FIGURE_H` and `FIGURE_SPAN` move private, `W` is a number, and every other new export is a function. Rule: comment 6256728145 (a list a split newly shares is typed read-only).
15. **"No regen owed" is named by its commands** in the body. Rule: `vellum-footguns` Gate 6 item 7.
16. **The names**, under ruling 1 (they stand unless Alex objects): the files `src/prospect/dress/townscape-masses.ts`, `src/prospect/dress/rise-picture.ts`, `src/prospect/dress/figures-parts.ts` and `src/prospect/dress/furniture-wreath.ts`; the functions `fixedFurniture`, `plateNode`, `vignetteWater`, `meadowBand`, `ridgeRoof`, `spireRoof`, `keepTowers`, `shipMasts`, `quayArches`, `mastRowEngraved` and `beachedHullsEngraved`, each named for what it draws or holds, the last two after the file's own `<kind>Engraved` form.
17. **No new module carries a header comment.** Rule: Issue #673 call 6; pull request 3's call 11.

The governing plan's calls 1 to 15 stand and are not restated.

## The plan skeptic's findings

`vellum-plan-skeptic` ran cold on the issue number, this plan's draft and recon's ledger. It re-hashed all nine scratch tools (the seven reused ones extracted from the archived plans on main), all eleven Appendix C hashes against the third build, and the Step 3 sizes; drew both sets independently at the base and the third build (`2039 artifacts: 0 differ`, `4180 artifacts: 0 differ`, both manifests' sha256 as stated); ran `npm run check` and the dress directory's lint on the third build, and `test/prospect/finished.test.ts` there (15 of 15); and planted three witnesses of its own on cuts the plan's witnesses do not touch (`mastRowEngraved`'s `0.72` to `0.73`: 586 differ; `beachedHullsEngraved`'s `q11` to `q12`: 658; `spireRoof`'s `h * 0.55` to `h * 0.56`: 2,002). It also showed the `WATER_BOTTOM` trap is held after the merge, not only by the scratch tools: the W3 plant reds "finished plates are byte-pinned across the eras and the dresses" in `test/prospect/finished.test.ts`. 0 blocking, 1 should-fix, 3 nits; 24 claims checked, 2 wrong, both reasoning rather than measurement. All four folded, none rejected:

1. (should-fix) The `mastRow` cut moves a block ending in its own `return`, which the draft's one-line restatement of pull request 5's rule appeared to refuse. Folded: "How a cut inside a function is chosen" now restates that rule whole, whose case-clause sentence is exactly this cut, and names the `only(...)` argument form as this slice's addition; call 3 says so.
2. (nit) Call 14 said no cut newly shares a list; `RISE_TOP` is newly read by `rise-picture.ts`. Folded: call 14 names it and why it is already locked (`ReadonlyArray<Pt>`, read-only fields), so no edit is owed.
3. (nit) Call 9 and the per-file table credited the `rise.ts` cut with keeping the layout constants under their doc comment, but it moves `FIGURE_H` and `FIGURE_SPAN`, which the comment's `LAYOUT_E` also holds. Folded: that reason is gone; the cut is chosen on headroom (289 against about 367) and on moving a closed subtree. The cut does not change.
4. (nit) `horse` moves at exactly the lint's 50, where pull request 3's `hd1Dispatch` moved at 49. Nothing to fold: the plan already reads it as moved text, unchanged from the base.

## Open decisions

none. This slice meets no question the governing plan, its rulings and the house rules named above do not answer, so nothing goes to Alex under ruling 2; the calls above stand unless he overrules one.

## Stop conditions (hand back, do not adapt)

- Issue #814 carries a comment newer than 6268532863 (2026-10-19T13:36:06Z), read with `gh api repos/ahl-gram/Vellum/issues/814/comments --paginate`, other than a dispatcher's plan archive (first line beginning `Plan archive, not a ruling:`) and your own step 12 record.
- `git diff --stat 150e6b413c85a0d59c2177b8e73ab8e001a3ba15 origin/main -- src/prospect test/prospect test-support/prospect-fixtures.ts eslint-suppressions.json test/repo/lint-config.test.ts` prints anything before the first commit.
- A scratch tool's sha256 is not the one given, `814-prune.ts` prints anything but `5 entries deleted, 12 left`, or commit 1's lint red is not exactly the 13 errors listed.
- Either draw at commit 1 exits non-zero, any artifact throws, or the counts are not 33, 800, 20, 10, 1010, 146 and 20, and 2160 and 2020.
- The family tool throws (an anchor line is not what 150e6b41 held, or a new file exists already) or prints anything but `<family>: written`.
- `npm run format` rewrites a file the family's row does not name; after it, a file's sha256 is not Appendix C's, a file is over 395 lines of code, or a function the slice writes or shortens is over 48, as `814-tests-size.ts` counts them; or the size tool prints a line the block above does not.
- The family's lint or `npm run check` fails.
- The statement proof or the clause proof prints a verdict, a count or a line the table does not name, or misses one it does.
- A targeted set's count differs from its base count, or any of its tests fails.
- `npm run lint` fails at the close, the prune writes a diff, `npm test` fails a test, or its total differs from commit 1's.
- A compare prints any differ, or a count other than 2039 or 4180.
- `git check-ignore` reports any of the four new files as ignored.

## Appendix A: every range, at 150e6b41

The family tool (Appendix B) is the exact form; this is its prose, for review. First and last lines are trimmed of indentation and cut at 70 characters.

| file | lines | first | last | where it goes |
|---|---|---|---|---|
| `src/prospect/dress/compose-e.ts` | 117 to 137 | `const tags = p.key.flatMap((k) =>` | `});` | into `fixedFurniture`, which ends `return { cartouche, medals, key, margin, tagClear };` |
| `src/prospect/dress/compose-e.ts` | 164 to 185 | `const grain = (p.g.seed * 31 + p.g.index * 7) % 9973;` | `);` | into `plateNode`, which ends `return node;` |
| `src/prospect/dress/figures.ts` | 72 to 73 | `const W = 0.7;` | `const sw = (w: number): number => Math.round(w * 1000) / 1000;` | `W` (gains `export`) and `sw`, into `figures-parts.ts` |
| `src/prospect/dress/figures.ts` | 75 to 96 | `function garment(e: Engraver, pts: ReadonlyArray<Pt>, fill: string,...` | `}` | `garment` (gains `export`), into the same |
| `src/prospect/dress/figures.ts` | 98 to 117 | `const line = (e: Engraver, d: string, w = W): SvgNode =>` | `});` | `line`, `head`, `hand` and `ruff` (each gains `export`), into the same |
| `src/prospect/dress/figures.ts` | 119 to 124 | `function hat(e: Engraver, cy: number, brim: number, crown: number):...` | `}` | `hat` (gains `export`), into the same |
| `src/prospect/dress/figures.ts` | 126 to 131 | `function legs(e: Engraver, y0: number, stride: number): SvgNode[] {` | `}` | `legs` (gains `export`), into the same |
| `src/prospect/dress/figures.ts` | 396 to 445 | `function horse(e: Engraver): SvgNode[] {` | `}` | `horse` (gains `export`), into the same |
| `src/prospect/dress/furniture.ts` | 111 to 124 | `const RING: ReadonlyArray<readonly [number, number]> = [` | `];` | `RING`, into `furniture-wreath.ts` |
| `src/prospect/dress/furniture.ts` | 126 to 173 | `export function wreath(e: Engraver, cx: number, cy: number, r: numb...` | `}` | `wreath`, into the same |
| `src/prospect/dress/rise.ts` | 58 to 59 | `const FIGURE_H = 50;` | `const FIGURE_SPAN: readonly [number, number] = [VIEW_X0 + 50, VIEW_...` | `FIGURE_H` and `FIGURE_SPAN`, into `rise-picture.ts` |
| `src/prospect/dress/rise.ts` | 261 to 288 | `const gaps: Gap[] = engraved.flatMap((f) => f.gaps).map((h) => ({ ....` | `];` | into `vignetteWater`, which ends `return { nearBand, water };` |
| `src/prospect/dress/rise.ts` | 313 to 465 | `export function placeFigures(scene: Scene, rng: Rng): Figure[] {` | the blank line after `shipBox` | `placeFigures` through `shipBox`, into `rise-picture.ts` |
| `src/prospect/dress/rise.ts` | 466 to 516 | `export function picture(e: Engraver, scene: Scene, s: Streams, beas...` | `}` | `picture`, into the same, its lines 471 to 479 into `meadowBand` |
| `src/prospect/dress/rise.ts` | 471 to 479 | `const band =` | `];` | into `meadowBand`, which ends `return band;` |
| `src/prospect/dress/townscape.ts` | 27 to 336 | `const SHADOW = 0.3;` | `}` | `SHADOW` through `keepMass`, into `townscape-masses.ts` (`gableMass`, `verticalMass` and `keepMass` gain `export`) |
| `src/prospect/dress/townscape.ts` | 128 to 160 | `const rw = w * 0.22;` | `);` | the else branch of `gableMass`, into `ridgeRoof`, which owns its `out` |
| `src/prospect/dress/townscape.ts` | 220 to 254 | `const sp = Math.max(12, h * 0.55);` | ``out.push(el("path", { d: `M${r1(cx - 1.4)} ${r1(top + 3)}v3.4q1.4 -...`` | the else branch of `verticalMass`, into `spireRoof`, which owns its `out` |
| `src/prospect/dress/townscape.ts` | 292 to 329 | `for (const tx of [x - 1, x + w - 5]) {` | `}` | the turret loop of `keepMass`, into `keepTowers`, which owns its `out` |
| `src/prospect/dress/townscape.ts` | 466 to 499 | `for (const mo of great ? [-6, 1, 8] : [0]) {` | `}` | the mast loop of `shipEngraved`, into `shipMasts`, which owns its `out` |
| `src/prospect/dress/townscape.ts` | 547 to 557 | `const span = (q.arcade.x1 - q.arcade.x0) / q.arcade.arches;` | `}` | the arcade of `quayEngraved`, into `quayArches`, which owns its `out` |
| `src/prospect/dress/townscape.ts` | 630 to 639 | `const scale = (mastH: number): number => 0.72 + (mastH - 42) / 90;` | `};` | the body of the `mastRow` clause's block, into `mastRowEngraved` |
| `src/prospect/dress/townscape.ts` | 648 to 664 | `f.hulls.map((h) =>` | `),` | the argument of the `beachedHulls` clause's `only(...)`, into `beachedHullsEngraved`: `return ` and line 648's text, then lines 649 to 663, then `);` in place of line 664 |

## Appendix B: this slice's tools

Written to the scratchpad exactly as below (the planning copies are there already, and `shasum -a 256` must print the hash given). Each loads the repo's own modules by path, so it runs from any directory. The reused tools are in the archived plans on main named under "The tools, before the first commit".

### `814-prospect-split.ts` (sha256 2383c7f8d80ad9dd994d7f97e78a525800d1b18e1736857c20c11bc008b55cc0)

The family tool. Commit 1 runs its `ceilings` family; commits 2 to 6 run one family each.

```ts
// usage: node 814-prospect-split.ts <repo> <family> ...
// Issue #814 pull request 6: rewrites one family's files in <repo> from their base text by line ranges (1-based, inclusive), before Prettier.
// Families, in commit order: ceilings, compose-e, figures, furniture, rise, townscape. Each reads its files as they stand, which must be the base (150e6b41) text, but for compose-e.ts in the rise family, whose line 12 alone it checks: it checks every anchor line first and throws, writing nothing, where one is not what the base held.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [repo, ...families] = process.argv.slice(2);
if (repo === undefined || families.length === 0) {
  console.error("usage: node 814-prospect-split.ts <repo> <family> ...");
  process.exit(2);
}
const D = "src/prospect/dress";
const read = (p: string): string[] => readFileSync(join(repo, p), "utf8").split("\n");
const put = (p: string, lines: string[]): void => writeFileSync(join(repo, p), lines.join("\n") + "\n");
const fresh = (p: string): void => {
  if (existsSync(join(repo, p))) throw new Error(`${p} exists already`);
};
const r = (L: string[], a: number, b: number): string[] => L.slice(a - 1, b);
const expect = (L: string[], n: number, starts: string): void => {
  const line = L[n - 1];
  const holds = starts === "" ? line === "" : line !== undefined && line.trimStart().startsWith(starts);
  if (!holds) throw new Error(`line ${n} is ${JSON.stringify(line)}, not ${JSON.stringify(starts)}`);
};
const expectEnd = (L: string[], n: number): void => {
  if (L.length !== n + 1 || L[n] !== "") throw new Error(`the file is ${L.length - 1} lines, not ${n}`);
};
const exported = (L: string[], n: number, starts: string): string => {
  expect(L, n, starts);
  return `export ${L[n - 1] as string}`;
};
const owning = (head: string, body: string[]): string[] => [head, "  const out: SvgNode[] = [];", ...body, "  return out;", "}", ""];

const FILES = ["compose-e.ts", "figures.ts", "furniture.ts", "rise.ts", "townscape.ts"].map((f) => `${D}/${f}`);

function ceilings(): void {
  const p = "test/repo/lint-config.test.ts";
  const lines = readFileSync(join(repo, p), "utf8").split("\n");
  for (const k of FILES) if (lines.filter((l) => l.startsWith(`  "${k}": [`)).length !== 1) throw new Error(`no single ceiling for ${k}`);
  writeFileSync(join(repo, p), lines.filter((l) => !FILES.some((k) => l.startsWith(`  "${k}": [`))).join("\n"));
}

function composeE(): void {
  const f = `${D}/compose-e.ts`;
  const L = read(f);
  expectEnd(L, 198);
  expect(L, 10, 'import { createLettering, runBox } from "../letter/letter.ts";');
  expect(L, 111, "");
  expect(L, 112, "export function engraveE(style: MapStyle, p: PlateParts): EngravedE {");
  expect(L, 116, "const standing = p.era !== \"before-founding\";");
  expect(L, 117, "const tags = p.key.flatMap((k) =>");
  expect(L, 134, "const tagClear = tags.map((t) => {");
  expect(L, 137, "});");
  expect(L, 138, "const avoid = [...cartouche, ...medals, ...key, ...margin].flatMap((i) => i.boxes);");
  expect(L, 163, "];");
  expect(L, 164, "const grain = (p.g.seed * 31 + p.g.index * 7) % 9973;");
  expect(L, 166, "const node = el(");
  expect(L, 185, ");");
  expect(L, 186, "const boxes = (parts: ReadonlyArray<Inked>): Box[] => parts.flatMap((i) => i.boxes);");
  put(f, [
    ...r(L, 1, 9),
    'import { createLettering, runBox, type Lettering } from "../letter/letter.ts";',
    ...r(L, 11, 111),
    "function fixedFurniture(p: PlateParts, e: Engraver, letters: Lettering, standing: boolean) {",
    ...r(L, 117, 137),
    "  return { cartouche, medals, key, margin, tagClear };",
    "}",
    "",
    "function plateNode(p: PlateParts, e: Engraver, letters: Lettering, pic: Picture, furniture: SvgNode[]): SvgNode {",
    ...r(L, 164, 185),
    "  return node;",
    "}",
    "",
    ...r(L, 112, 116),
    "  const { cartouche, medals, key, margin, tagClear } = fixedFurniture(p, e, letters, standing);",
    ...r(L, 138, 163),
    "  const node = plateNode(p, e, letters, pic, furniture);",
    ...r(L, 186, 198),
  ]);
}

function figures(): void {
  const f = `${D}/figures.ts`;
  const parts = `${D}/figures-parts.ts`;
  fresh(parts);
  const L = read(f);
  expectEnd(L, 504);
  expect(L, 1, 'import { el, type SvgNode } from "../../render/svg.ts";');
  expect(L, 6, 'import type { Pt } from "../geometry.ts";');
  expect(L, 7, 'import { hatchPolygon, poly, r1, washOr, type Engraver } from "./burin.ts";');
  expect(L, 71, "");
  expect(L, 73, "const sw = (w: number): number => Math.round(w * 1000) / 1000;");
  expect(L, 74, "");
  expect(L, 96, "}");
  expect(L, 97, "");
  expect(L, 117, "});");
  expect(L, 118, "");
  expect(L, 124, "}");
  expect(L, 125, "");
  expect(L, 131, "}");
  expect(L, 132, "");
  expect(L, 133, "function gentleman(e: Engraver, c: Cloth): SvgNode[] {");
  expect(L, 394, "}");
  expect(L, 395, "");
  expect(L, 445, "}");
  expect(L, 446, "");
  expect(L, 447, "function rider(e: Engraver, c: Cloth): SvgNode[] {");
  put(parts, [
    'import { el, type SvgNode } from "../../render/svg.ts";',
    'import type { Pt } from "../geometry.ts";',
    'import { hatchPolygon, poly, r1, washOr, type Engraver } from "./burin.ts";',
    "",
    exported(L, 72, "const W = 0.7;"),
    ...r(L, 73, 74),
    exported(L, 75, "function garment("),
    ...r(L, 76, 97),
    exported(L, 98, "const line = (e: Engraver, d: string, w = W): SvgNode =>"),
    ...r(L, 99, 106),
    exported(L, 107, "const head = (e: Engraver, cx: number, cy: number, r: number): SvgNode =>"),
    ...r(L, 108, 108),
    exported(L, 109, "const hand = (e: Engraver, x: number, y: number): SvgNode =>"),
    ...r(L, 110, 110),
    exported(L, 111, "const ruff = (e: Engraver, cy: number, rx: number): SvgNode =>"),
    ...r(L, 112, 118),
    exported(L, 119, "function hat(e: Engraver, cy: number, brim: number, crown: number): SvgNode[] {"),
    ...r(L, 120, 125),
    exported(L, 126, "function legs(e: Engraver, y0: number, stride: number): SvgNode[] {"),
    ...r(L, 127, 132),
    exported(L, 396, "function horse(e: Engraver): SvgNode[] {"),
    ...r(L, 397, 445),
  ]);
  put(f, [
    ...r(L, 1, 5),
    'import { r1, type Engraver } from "./burin.ts";',
    'import { garment, hand, hat, head, horse, legs, line, ruff, W } from "./figures-parts.ts";',
    ...r(L, 8, 71),
    ...r(L, 133, 395),
    ...r(L, 447, 504),
  ]);
}

function furniture(): void {
  const f = `${D}/furniture.ts`;
  const wreathFile = `${D}/furniture-wreath.ts`;
  fresh(wreathFile);
  const L = read(f);
  expectEnd(L, 434);
  expect(L, 9, 'import type { Box } from "./rise.ts";');
  expect(L, 110, "");
  expect(L, 111, "const RING: ReadonlyArray<readonly [number, number]> = [");
  expect(L, 124, "];");
  expect(L, 125, "");
  expect(L, 126, "export function wreath(e: Engraver, cx: number, cy: number, r: number): Inked {");
  expect(L, 173, "}");
  expect(L, 174, "");
  expect(L, 175, "export const ROUNDEL_Y = 60;");
  put(wreathFile, [
    'import { el } from "../../render/svg.ts";',
    'import { r1, washOr, type Engraver } from "./burin.ts";',
    'import type { Inked } from "./furniture.ts";',
    "",
    ...r(L, 111, 173),
  ]);
  put(f, [...r(L, 1, 9), 'import { wreath } from "./furniture-wreath.ts";', ...r(L, 10, 110), ...r(L, 175, 434)]);
}

function rise(): void {
  const f = `${D}/rise.ts`;
  const pic = `${D}/rise-picture.ts`;
  const ce = `${D}/compose-e.ts`;
  fresh(pic);
  const L = read(f);
  const C = read(ce);
  expectEnd(L, 516);
  expect(L, 33, "import {");
  expect(L, 37, "shipEngraved,");
  expect(L, 40, '} from "./townscape.ts";');
  expect(L, 41, 'import { castFor, figureNodes, FIGURE_WIDTH, type Figure } from "./figures.ts";');
  expect(L, 57, "export const SKY_TOP = 92;");
  expect(L, 58, "const FIGURE_H = 50;");
  expect(L, 59, "const FIGURE_SPAN: readonly [number, number] = [VIEW_X0 + 50, VIEW_X0 + 270];");
  expect(L, 60, "const CLOUD_AVOID = [{ x0: 150, x1: 370 }];");
  expect(L, 249, "export type Vignette = Skyline & { readonly nodes: SvgNode[]; readonly birds: ReadonlyArray<Box> };");
  expect(L, 250, "");
  expect(L, 251, "export function vignette(e: Engraver, scene: Scene, s: Streams): Vignette {");
  expect(L, 260, "const engraved = foreground.map((f) => foregroundEngraved(e, f, s.town));");
  expect(L, 261, "const gaps: Gap[] = engraved.flatMap((f) => f.gaps).map((h) => ({ ...h, y0: h.y0 + LIFT, y1: h.y1 + LIFT }));");
  expect(L, 262, 'const river = g.water?.kind === "river";');
  expect(L, 272, "const water: SvgNode[] =");
  expect(L, 288, "];");
  expect(L, 289, "const skyHatch = skyLines(e, VIEW_X0 + 4, VIEW_X1 - 4, SKY_TOP, horizon - 1, clouds, s.sky);");
  expect(L, 311, "}");
  expect(L, 312, "");
  expect(L, 313, "export function placeFigures(scene: Scene, rng: Rng): Figure[] {");
  expect(L, 464, "});");
  expect(L, 465, "");
  expect(L, 466, "export function picture(e: Engraver, scene: Scene, s: Streams, beastRng: Rng): Picture {");
  expect(L, 470, "const meadowTop = g.water === null ? g.ground.base + LIFT : river ? g.water.y1 + LIFT : null;");
  expect(L, 471, "const band =");
  expect(L, 479, "];");
  expect(L, 480, "const plain: SvgNode[] =");
  expect(C, 12, 'import { LIFT, RISE_BOTTOM, picture, skylineOf, type Box, type Picture } from "./rise.ts";');
  put(pic, [
    'import { el, type SvgNode } from "../../render/svg.ts";',
    'import type { Rng } from "../../core/rng.ts";',
    'import { VIEW_X0, VIEW_X1, type Pt } from "../geometry.ts";',
    'import { groundSweep, poly, r1, stroke, treeClump, washOr, yOnPolyline, type Engraver } from "./burin.ts";',
    'import { shipEngraved } from "./townscape.ts";',
    ...r(L, 41, 41),
    'import { LIFT, RISE_BOTTOM, RISE_TOP, WATER_BOTTOM, vignette, type Box, type Scene, type Streams, type Vignette } from "./rise.ts";',
    "",
    ...r(L, 58, 59),
    "",
    ...r(L, 313, 465),
    "function meadowBand(meadowTop: number | null): Pt[] | null {",
    ...r(L, 471, 479),
    "  return band;",
    "}",
    "",
    ...r(L, 466, 470),
    "  const band = meadowBand(meadowTop);",
    ...r(L, 480, 516),
  ]);
  put(f, [
    ...r(L, 1, 36),
    ...r(L, 38, 40),
    ...r(L, 42, 57),
    ...r(L, 60, 250),
    "function vignetteWater(e: Engraver, s: Streams, g: ProspectGeometry, engraved: ReadonlyArray<ReturnType<typeof foregroundEngraved>>) {",
    ...r(L, 261, 288),
    "  return { nearBand, water };",
    "}",
    "",
    ...r(L, 251, 260),
    "  const { nearBand, water } = vignetteWater(e, s, g, engraved);",
    ...r(L, 289, 311),
  ]);
  put(ce, [
    ...r(C, 1, 11),
    'import { LIFT, RISE_BOTTOM, skylineOf, type Box } from "./rise.ts";',
    'import { picture, type Picture } from "./rise-picture.ts";',
    ...C.slice(12, -1),
  ]);
}

function townscape(): void {
  const f = `${D}/townscape.ts`;
  const masses = `${D}/townscape-masses.ts`;
  fresh(masses);
  const L = read(f);
  expectEnd(L, 686);
  expect(L, 25, '} from "./burin.ts";');
  expect(L, 26, "");
  expect(L, 27, "const SHADOW = 0.3;");
  expect(L, 86, "");
  expect(L, 87, "function gableMass(e: Engraver, m: Mass, weight: number, church: boolean): SvgNode[] {");
  expect(L, 127, "} else {");
  expect(L, 128, "const rw = w * 0.22;");
  expect(L, 160, ");");
  expect(L, 161, "}");
  expect(L, 182, "");
  expect(L, 183, "function verticalMass(e: Engraver, m: Mass, weight: number): SvgNode[] {");
  expect(L, 219, "} else {");
  expect(L, 220, "const sp = Math.max(12, h * 0.55);");
  expect(L, 254, "out.push(el(\"path\", { d: `M${r1(cx - 1.4)} ${r1(top + 3)}v3.4q1.4 -1.2 2.8 0v-3.4Z`, fill: e.ink }));");
  expect(L, 255, "}");
  expect(L, 261, "");
  expect(L, 262, "function keepMass(e: Engraver, m: Mass, weight: number): SvgNode[] {");
  expect(L, 292, "for (const tx of [x - 1, x + w - 5]) {");
  expect(L, 329, "}");
  expect(L, 330, "out.push(door(e, x + w / 2, base, 2.2, 4.2));");
  expect(L, 336, "}");
  expect(L, 337, "");
  expect(L, 338, "export function massNodesEngraved(e: Engraver, m: Mass, weight: number, church = false): SvgNode[] {");
  expect(L, 451, "");
  expect(L, 452, "export function shipEngraved(e: Engraver, x: number, y: number, s: number, great: boolean, rng: Rng): SvgNode[] {");
  expect(L, 466, "for (const mo of great ? [-6, 1, 8] : [0]) {");
  expect(L, 499, "}");
  expect(L, 500, "if (great)");
  expect(L, 514, "");
  expect(L, 515, 'function quayEngraved(e: Engraver, q: Extract<ForegroundElement, { kind: "quay" }>): SvgNode[] {');
  expect(L, 547, "const span = (q.arcade.x1 - q.arcade.x0) / q.arcade.arches;");
  expect(L, 548, "for (let i = 0; i < q.arcade.arches; i++) {");
  expect(L, 557, "}");
  expect(L, 558, "out.push(");
  expect(L, 615, "");
  expect(L, 616, "export function foregroundEngraved(");
  expect(L, 629, 'case "mastRow": {');
  expect(L, 630, "const scale = (mastH: number): number => 0.72 + (mastH - 42) / 90;");
  expect(L, 639, "};");
  expect(L, 640, "}");
  expect(L, 641, 'case "ship":');
  expect(L, 646, 'case "beachedHulls":');
  expect(L, 647, "return only(");
  expect(L, 648, "f.hulls.map((h) =>");
  expect(L, 663, "]),");
  expect(L, 664, "),");
  expect(L, 665, ");");
  expect(L, 666, 'case "ripples":');
  put(masses, [
    'import { el, type SvgNode } from "../../render/svg.ts";',
    'import type { Mass } from "../geometry.ts";',
    'import { hatchNode, poly, r1, stroke, washOr, type Engraver } from "./burin.ts";',
    "",
    ...r(L, 27, 86),
    ...owning("function ridgeRoof(e: Engraver, weight: number, x: number, w: number, top: number, gh: number, roofFill: string): SvgNode[] {", r(L, 128, 160)),
    exported(L, 87, "function gableMass("),
    ...r(L, 88, 127),
    "    out.push(...ridgeRoof(e, weight, x, w, top, gh, roofFill));",
    ...r(L, 161, 182),
    ...owning("function spireRoof(e: Engraver, weight: number, x: number, w: number, h: number, top: number): SvgNode[] {", r(L, 220, 254)),
    exported(L, 183, "function verticalMass("),
    ...r(L, 184, 219),
    "    out.push(...spireRoof(e, weight, x, w, h, top));",
    ...r(L, 255, 261),
    ...owning("function keepTowers(e: Engraver, weight: number, x: number, w: number, base: number, top: number): SvgNode[] {", r(L, 292, 329)),
    exported(L, 262, "function keepMass("),
    ...r(L, 263, 291),
    "  out.push(...keepTowers(e, weight, x, w, base, top));",
    ...r(L, 330, 336),
  ]);
  put(f, [
    ...r(L, 1, 25),
    'import { gableMass, keepMass, verticalMass } from "./townscape-masses.ts";',
    ...r(L, 26, 26),
    ...r(L, 338, 451),
    ...owning("function shipMasts(e: Engraver, x: number, y: number, s: number, great: boolean): SvgNode[] {", r(L, 466, 499)),
    ...r(L, 452, 465),
    "  out.push(...shipMasts(e, x, y, s, great));",
    ...r(L, 500, 514),
    ...owning('function quayArches(e: Engraver, q: Extract<ForegroundElement, { kind: "quay" }>, y: number): SvgNode[] {', r(L, 547, 557)),
    ...r(L, 515, 546),
    "  out.push(...quayArches(e, q, y));",
    ...r(L, 558, 615),
    'function mastRowEngraved(e: Engraver, f: Extract<ForegroundElement, { kind: "mastRow" }>, rng: Rng): { readonly nodes: SvgNode[]; readonly gaps: Gap[] } {',
    ...r(L, 630, 639),
    "}",
    "",
    'function beachedHullsEngraved(e: Engraver, f: Extract<ForegroundElement, { kind: "beachedHulls" }>): SvgNode[] {',
    "  return f.hulls.map((h) =>",
    ...r(L, 649, 663),
    "  );",
    "}",
    "",
    ...r(L, 616, 628),
    '    case "mastRow":',
    "      return mastRowEngraved(e, f, rng);",
    ...r(L, 641, 645),
    '    case "beachedHulls":',
    "      return only(beachedHullsEngraved(e, f));",
    ...r(L, 666, 686),
  ]);
}

const RUN: Record<string, () => void> = {
  ceilings,
  "compose-e": composeE,
  figures,
  furniture,
  rise,
  townscape,
};
for (const family of families) {
  const run = RUN[family];
  if (run === undefined) throw new Error(`no family ${family}`);
  run();
  console.log(`${family}: written`);
}
```

### `814-prospect-towns.ts` (sha256 0bda7eea42917d78568dc206d19ade1d582ee03ac7fd62de1709e601228f7535)

The reach set (call 7): the twenty worlds' town pictures at two years and the fixture grid, from a root's own `src/` and `test-support/`, written as a manifest of hashes that `814-engine-compare.ts` reads.

```ts
// usage: node 814-prospect-towns.ts <root> <out dir> [--files]
// Issue #814 pull request 6: draws the town pictures that reach src/prospect/dress/ beyond ruling 3's set, from <root>'s own engine (its src/ and test-support/ imported by path), and writes <out dir>/manifest.txt ("<sha256>  <name>", sorted by name), then prints one count line per kind; with --files it also writes every picture under <out dir>/<kind>/.
// Kinds: "world", every settlement of the twenty worlds of ruling 3's set in both dresses at the present year and the year before its founding; "fixture", a grid of hand-built inputs (every kind, inland, harbour and river, standing and ruined, six foreground bands, three years, both dresses, with no surroundings and with crowded ones). Exits 1 if any picture throws or two share a name, 2 on bad arguments.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type World = { readonly settlements: ReadonlyArray<unknown> };
type Input = Record<string, unknown>;

const [root, out, flag] = process.argv.slice(2);
if (root === undefined || out === undefined || (flag !== undefined && flag !== "--files")) {
  console.error("usage: node 814-prospect-towns.ts <root> <out dir> [--files]");
  process.exit(2);
}
const files = flag === "--files";
const at = (path: string): Promise<unknown> => import(join(root, path));
const gen = (await at("src/world/generate.ts")) as {
  defaultRecipe: (seed: number) => unknown;
  generateWorld: (recipe: unknown) => World;
};
const { prospectResultFor } = (await at("src/site/explorer/prospect-job.ts")) as {
  prospectResultFor: (world: World, spec: { index: number; dress: string; year: number | null }) => { founded: number };
};
const { finishedPlateSvg } = (await at("src/prospect/finished.ts")) as {
  finishedPlateSvg: (input: Input, style: unknown, year: number, opts: Record<string, unknown>) => string;
};
const { STYLES } = (await at("src/render/style.ts")) as { STYLES: Record<string, unknown> };
const { makeInput, bandOf } = (await at("test-support/prospect-fixtures.ts")) as {
  makeInput: (overrides: Input) => Input;
  bandOf: (...runs: ReadonlyArray<readonly [string, number]>) => ReadonlyArray<string>;
};
const { FOREGROUND_SAMPLES } = (await at("src/prospect/transect.ts")) as { FOREGROUND_SAMPLES: number };

const SEEDS = [1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 17, 18, 21, 22, 24, 26, 33, 34, 35, 42];
const DRESSES = ["antique", "ink"];
const KINDS = ["capital", "seat", "town", "village", "hamlet"];
const WATERS: ReadonlyArray<readonly [string, Input]> = [
  ["inland", {}],
  ["harbor", { harbor: true }],
  ["river", { onRiver: true }],
];
const RUIN: ReadonlyArray<readonly [string, Input]> = [
  ["standing", {}],
  ["ruined", { ruined: true, ruinedYear: 1150 }],
];
const BANDS = ["grassland", "shrubland", "desert", "marsh", "beach", "temperateForest"];
const YEARS = [1300, 1120, 1040];
const ROAD_TOWNS = [
  { index: 1, name: "Haireno", kind: "town", lateral: 0.39, dist: 21 },
  { index: 2, name: "Nanawotani", kind: "village", lateral: -0.5, dist: 30 },
  { index: 3, name: "Oskelund", kind: "capital", lateral: 0.42, dist: 26 },
  { index: 4, name: "Brenmoor", kind: "hamlet", lateral: 0.36, dist: 33 },
  { index: 5, name: "Tallowmere", kind: "town", lateral: -0.46, dist: 28 },
  { index: 6, name: "Quillon", kind: "village", lateral: 0.4, dist: 35 },
];
const SURROUNDINGS: ReadonlyArray<readonly [string, Input | null]> = [
  ["bare", null],
  [
    "crowded",
    {
      seaName: "The Great Woaku",
      riverName: "The Waters of Lalo",
      rangeName: null,
      roadTowns: ROAD_TOWNS,
      roadCount: 3,
      beast: { name: "Kaipu", epithet: "the Weed That Wakes", lateral: -0.2 },
      realmProclaimed: true,
    },
  ],
];

const lines: string[] = [];
const counts = new Map<string, number>();
const seen = new Set<string>();
let threw = 0;
function put(kind: string, name: string, make: () => string): void {
  if (seen.has(`${kind}/${name}`)) throw new Error(`two pictures named ${kind}/${name}`);
  seen.add(`${kind}/${name}`);
  let text: string;
  try {
    text = make();
  } catch (e) {
    text = `THROW ${e instanceof Error ? e.message : String(e)}`;
    threw++;
  }
  if (files) {
    mkdirSync(join(out, kind), { recursive: true });
    writeFileSync(join(out, kind, name), text);
  }
  lines.push(`${createHash("sha256").update(text).digest("hex")}  ${kind}/${name}`);
  counts.set(kind, (counts.get(kind) ?? 0) + 1);
}

const t0 = performance.now();
for (const seed of SEEDS) {
  const world = gen.generateWorld(gen.defaultRecipe(seed));
  for (let index = 0; index < world.settlements.length; index++)
    for (const dress of DRESSES) {
      let founded = 0;
      put("world", `${seed}-${index}-${dress}-present.json`, () => {
        const r = prospectResultFor(world, { index, dress, year: null });
        founded = r.founded;
        return JSON.stringify(r);
      });
      put("world", `${seed}-${index}-${dress}-before.json`, () =>
        JSON.stringify(prospectResultFor(world, { index, dress, year: founded - 1 })),
      );
    }
}
for (const kind of KINDS)
  for (const [water, w] of WATERS)
    for (const [ruin, r] of RUIN)
      for (const band of BANDS)
        for (const [around, s] of SURROUNDINGS) {
          const input = makeInput({ kind, ...w, ...r, foreground: bandOf([band, FOREGROUND_SAMPLES]) });
          for (const year of YEARS)
            for (const dress of DRESSES)
              put("fixture", `${kind}-${water}-${ruin}-${band}-${around}-${year}-${dress}.svg`, () =>
                finishedPlateSvg(input, STYLES[dress], year, s === null ? {} : { surroundings: s }),
              );
        }
lines.sort((a, b) => (a.slice(66) < b.slice(66) ? -1 : 1));
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "manifest.txt"), `${lines.join("\n")}\n`);
for (const [kind, n] of [...counts].sort()) console.log(`${kind}: ${n} pictures`);
console.log(`total: ${lines.length} pictures, ${threw} threw, in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
process.exit(threw === 0 ? 0 : 1);
```

## Appendix C: the sha256 of every file the slice writes, after `npm run format`

Measured on the dry run (the third build, family by family). Each commit writes its own files and no other; `compose-e.ts` is written twice, by commits 2 and 5. Every other file is unchanged.

```
commit 1
0477000d3783d5949787eab92381fad5c46fa01cb5d3e17112023aff278d1948  eslint-suppressions.json
4527007e5c544a739adc670737d653c415e550f6d621ff27d628f49e29f7a6dc  test/repo/lint-config.test.ts
commit 2 (compose-e)
62731e001deab91d66e3f58ee06832d4fcc11b0eb7702fd361d22a75c21d4d26  src/prospect/dress/compose-e.ts
commit 3 (figures)
a0b448aa1da3b81bad5aac0f8e025a58980ccb6b3d605f28ff5f4793a39db808  src/prospect/dress/figures.ts
2a0e5a49aa7f0ea3161707e6fb274a8815487344cb13d94ea76d3f5410e37c02  src/prospect/dress/figures-parts.ts
commit 4 (furniture)
1adc19cf242fb8fc3687b76c3f4860888aebe277682b6408d7086914f54348ba  src/prospect/dress/furniture.ts
bb91d3d98e9b2e4b6d3dd0a2037fdc3258767d2fc1c0c93067a97f66da19b2d0  src/prospect/dress/furniture-wreath.ts
commit 5 (rise)
195209a78ba17240878643096e219080ee9313f25750bbb24c5d707d8f425a86  src/prospect/dress/rise.ts
73857407ec08e56b61763e0f88872d0bd687b06c0fe39071bccc9a25f2d20ee4  src/prospect/dress/rise-picture.ts
926a2f56a30909927a4189f87c833a4cd7773a3b2a78ec90826286a918549819  src/prospect/dress/compose-e.ts
commit 6 (townscape)
7aeb670b5bd2a3df42a3dae3a230553b9f88f1667668e14bfa56354cc0bc9898  src/prospect/dress/townscape.ts
32d0bb329ed3c938abfe560278689e8c96a94855b2690eeed2db911595ee7f97  src/prospect/dress/townscape-masses.ts
```
