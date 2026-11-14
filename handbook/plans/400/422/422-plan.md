# Plan: Issue #422, the decor ship tries the next berth, landed alone with its regen

The anonymous decor ship walks on from a taken berth to the next free one, deepest first, and the committed hero charts are regenerated in the same pull request with nothing else chart-changing beside them. One pull request.

**Planned at:** origin/main `2f66e4eef52dc8a5c4c475979080c03f9f11023c`, with Issue #422 at 1 comment, the rulings comment below (`gh api repos/ahl-gram/Vellum/issues/422/comments | jq length`).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/422#issuecomment-6867573718 (Alex, 2026-11-13, ruled from the stills in `out/422/`, `42-today-sheet.png` against `42-ship-sheet.png`). The implementer's step 12 comment points at it rather than restating it.

- **Question 1, A:** "Yes (Recommended)". Every chart gets its decor ship; the hero's antique, ink and nautical charts show one for the first time; the link-preview image is unchanged.
- **Question 2, A:** "Not now, ship only (Recommended)". The serpent keeps its single try; no ship drawn on main moves, the link preview is untouched, and no serpent issue is filed.

## What recon and the measurements changed

`vellum-spec-recon` (2026-11-13, at the sha above): 16 claims, STALE 2, CURRENT 14 (several with caveats), UNVERIFIABLE 0; PR #420's record names no seed, so where the issue's seed lists came from cannot be traced. Its claims file is `out/422-recon/claims.jsonl` in the planner's tree. The two STALE claims change the plan:

1. **The issue's premise about seed 42 is backwards.** The issue expected the committed seed-42 charts might not move. No committed hero chart has ever carried the decor ship or the decor serpent (`git log --follow` over `src/static/charts/chart-42-antique.svg` and its earlier homes under `public/` and `docs/`, back to 2026-06-16, finds neither id). The walk adds a ship to the antique, ink and nautical hero charts. It went back to Alex as menu item 1, and he ruled for it from the stills (Question 1, A).
2. **The seal no longer kills a ship.** With the beasts seal on, seeds 1, 11 and 21 keep their ships on main; the issue's loss list does not reproduce. What remains is the cause the sweep below found: the sea's name takes the deepest water, which is exactly the ship's first berth (`seaLabelNodes` in `src/render/layers/feature-labels.ts` walks the same deepest-first order), so on most charts the ship's one try fails.

The sweep (planner's probe, `out/422-dry-run/422-probe.ts` with `422-compare.ts`, the change staged by a Node resolve hook, `422-hooks.ts`, over a copy of the layer, `422-stage.ts`, so no source was edited; seeds 1 to 100; log `out/422-dry-run/422-compare-1-100.log`; commit `2f66e4ee`):

| setting | ships on main | ships with the walk | main's ships kept byte-identical (whole sheet) | sheets changed beyond the ship group | arms moved |
|---|---|---|---|---|---|
| antique, legend (the hero's) | 5 | 100 | 5 of 5 | 0 | 0 |
| antique, no legend (the og card's) | 22 | 100 | 22 of 22 | 0 | 0 |
| antique, legend, beasts | 13 | 100 | 13 of 13 | 0 | 0 |
| antique, beasts | 40 | 100 | 40 of 40 | 0 | 0 |
| ink, legend | 5 | 100 | 5 of 5 | 0 | 0 |
| nautical, legend | 5 | 100 | 5 of 5 | 0 | 0 |
| antique, legend, arms | 5 | 100 | 5 of 5 | 0 | 0 |

No seed had no berth, and none had every berth taken. Where the first berth was taken, the walk passed over a median of 73 taken berths at the hero setting, and at most 416 (seed 32). The decor serpent, which tries one berth the same way, is drawn on 14 of 100 hero-setting sheets today.

Where the walked ships land (`out/422-dry-run/422-edges.log`, the same rows): at the hero setting 56 of the 100 stand in the berths' leftmost column (centre x 145) and about 80 within a berth of some edge of the sheet; without the legend, 55 and about 89. The deepest water on a sheet lies along its edges, and the deepest-first order breaks ties in scan order.

Seed 42 under the walk (`out/422-dry-run/422-hero-identity.log`): a fresh render of every committed hero chart on main is byte-identical to the committed file on the planner's Mac, and with the walk staged `chart-42-antique.svg`, `chart-42-ink.svg` and `chart-42-nautical.svg` each differ from the committed file by one inserted `sea-ship` group of 939 bytes and nothing else; `chart-42-topographic.svg` (no sea decor) and the three `arms-42-*.svg` are byte-identical. The hero ship stands at about (145, 752), its 56th berth, low on the left edge above the sea's name, The Great Woaku.

The step 6 sitting's stills and measurements (`vellum-plate-reader`, 2026-11-13, delivery `out/422/` with its page `out/422/index.html`, measurements `out/422/measurements.txt`; seeds 42, 5, 1 and 32 at the hero setting, and seed 42 with the beasts seal): with the walk, no ship box overlaps any text, the cartouche, the key, the scale bar or the compass; the nearest anything comes is 49.7 px (seed 1's ship to the scale bar, the same on main). The hero ship's box stands 93.3 px from the text of The Great Woaku and 138.1 px from the compass. Every ship and serpent stands inside the neat line. Seed 1's sheet, which carries a ship on main, is byte-identical with the walk. The still judge read no question worse and none better on any chart (`out/422/still-judge/summary.md`). The sitting also drew a second arm, the serpent walking too, which Alex passed over (Question 2); its stills and readings stay in `out/422/` and `out/422-dry-run/` as the record of what was declined.

The places that read coordinates off the committed antique chart stay clear of the hero ship: the Portfolio plate's crops (`crop` in `src/site/explorer/portfolio/how-plate.ts`) all open at x 300 or more, and the walked ship's claimed square spans x 100 to 190; the home page's stations (`src/site/home/stations.ts`) stand at sea near (1185, 845) and (1177, 206), and its moorings on land.

The og card (`out/422-dry-run/422-og.ts`, log `422-og.log`): seed 42 without a legend puts its ship at about (1308, 983), its whole glyph below row 938; the card shows the chart's rows 264 to 894 (`ghostChart` in `src/render/og-card.ts` places the 1500 by 1158 chart at y -264 on a 630-high card), so the card's raster with the walk is byte-identical to main's raster on the same machine. Both differ from the committed `src/static/og.png` (491567 against 491535 bytes, stamps stripped), by the browser alone.

The unit suite with the walk staged (`VELLUM_422_ARM=ship NODE_OPTIONS="--no-deprecation --import=<tree>/out/422-dry-run/422-register.ts" npm test`, log `out/422-dry-run/422-unit-ship.log`, 4043 tests, 2026-11-13, run alone with no other lane's suite running): one red, the hero drift guard in `test/site/hero-charts.test.ts`, at `chart-42-antique.svg`, structural, `<g id="sea-ship"` inserted. A second red in that run, `rasterizeSvg produces a real PNG` in `test/cli/raster.test.ts`, was the headless browser's teardown watchdog under the suite's load; that file passes alone on main and alone with the walk staged (`out/422-dry-run/422-unit-raster-ship.log`).
## Specs

Read these, at these sections, before building, on top of what `CLAUDE.md`'s spec table owes:

- `handbook/specs/rulebook.md`, "Golden and committed-chart discipline": a render change that moves any label or path owes `npm run charts:regen` and `npm run og`; verify by diffing old against new, snapshotted first; the drift guard is circular after a regen; land the regen ALONE; never byte-compare SVGs rendered in different environments.
- `handbook/specs/chart-dress.md`:
  - "A river keeps its name over a graze": the arena, and that the label layers claim in the order `labelledLayers` in `src/render/map-renderer.ts` runs them, the sea decor after the beasts;
  - "A sea beast is drawn last and yields to everything", the paragraph this change mirrors and the one the new paragraph follows.
- `handbook/specs/engine-invariants.md`, "Identity versus view" (a view option may still change other drawing) and "Measuring a world in a script".
- `handbook/specs/check-placement.md`, "The unit suite", and the bullet opening "A claim goes to a unit test wherever one can hold it alone".
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" and "How code is cited".
- `.claude/skills/vellum-footguns/SKILL.md`, Gate 1 (before the tests), Gate 6 (before the regen) and Gate 5 (before the push and the body).

## The design

**1. One claim helper, in `src/render/layers/sea-decor.ts`.** Delete the private `claimSpot` (the seven lines from `function claimSpot(` to its closing brace) and put in its place:

```ts
export function firstBerth<T extends Pt>(labels: LabelArena, berths: ReadonlyArray<T>, half: number): T | undefined {
  return berths.find((o) => labels.tryClaim({ x: o.x - half, y: o.y - half, w: half * 2, h: half * 2 }, 6));
}
```

- It walks `berths` in their order and returns the first whose square, `half` each way, the arena grants with today's pad of 6, claiming that square and no other. `tryClaim` in `src/render/context.ts` claims nothing when it refuses, so a refused berth leaves the arena as it was.
- Imports: `type Pt` joins the existing import from `../geometry.ts` (`import { clearOfCircles, prunePoints, type Pt } from "../geometry.ts";`), and `type LabelArena` joins the existing type import from `../context.ts` (`import type { LabelArena, RenderCtx } from "../context.ts";`).

**2. The two calls in `seaDecorLayer`.** Today's two statements:

```ts
  const serpentAt =
    decor.serpent === false
      ? undefined
      : claimSpot(
          ctx,
          deepSpots.find((o) => clearOf(o.x, o.y, 90 * k)),
          60 * k,
        );
  const shipAt = claimSpot(
    ctx,
    deepSpots.find((o) => !serpentAt || Math.hypot(o.x - serpentAt.x, o.y - serpentAt.y) > 260 * k),
    45 * k,
  );
```

become:

```ts
  const serpentAt = decor.serpent === false ? undefined : firstBerth(ctx.labels, deepSpots.slice(0, 1), 60 * k);
  const shipAt = firstBerth(
    ctx.labels,
    deepSpots.filter((o) => !serpentAt || Math.hypot(o.x - serpentAt.x, o.y - serpentAt.y) > 260 * k),
    45 * k,
  );
```

(`npm run format` settles the line breaks.)

- The serpent keeps its one berth (Question 2, A). `deepSpots` is already filtered by `clearOf(o.x, o.y, 90 * k)`, so today's `deepSpots.find((o) => clearOf(o.x, o.y, 90 * k))` is always `deepSpots[0]`, and `deepSpots.slice(0, 1)` is the same single try.
- The ship walks every deep spot more than 260 px (at 1500) from a drawn serpent, deepest first, the order `deepSpots` is already sorted in, and takes the first the arena grants.
- `rng` and the waves are untouched, and nothing after the decor reads anything new: the only later claimant, `heraldryLayer`, moved on no measured sheet.

Nothing else in the file changes. The file goes from 196 lines to about 189; `seaDecorLayer` gets shorter.

**3. The regen.** `npm run charts:regen` and `npm run og`, on the Mac, after the walk, with the snapshot and the og protocol under Evidence. `og.png` is committed only if the walk changes its pixels, which the measurement says it does not (Call 5).

**4. The doctrine line**, in `handbook/specs/chart-dress.md`, under Rosters.

### Alternatives rejected, so none is rediscovered mid-build

- **Another order for the walk** (nearest the first berth, nearest the cartouche or the compass, away from the sheet's edges, a shuffle). An order that puts another berth first would move ships drawn on main; one that keeps the deepest berth first and sorts only the rest would keep them, but changes where the new ships land for no reason the issue gives. The layer's own deepest-first order is the smallest change, and keeps every ship drawn on main exactly where it is, which the sweep measured on every setting (Call 1).
- **A walk inside `claimSpot`** keeping its `o | undefined` argument. The walk needs the whole list, so the argument changes either way; one helper serving both calls is one function where two would be near copies (`vellum/no-word-for-word-copy` in `scripts/lint/word-for-word.ts`, and the cold review's copy hunt).
- **Reusing `firstBeastFit` in `src/render/layers/beasts.ts`.** It walks lists of spots under an escalation of label texts, and the ship carries no label; it is private to the beast layer, and bending it to fit costs more than the two lines it would save.
- **Forcing a ship onto a taken berth** when every berth is taken, as a settlement's name is forced. The decor yields to everything; a sheet with no free berth draws no ship, as today (T3). The sweep found no such sheet.
- **A browser check.** Every claim here is what `renderMap` returns in Node, so the unit suite holds it (Call 6). The two-readings rule for a browser check does not arise.
- **A pinned coordinate for the hero ship.** The committed chart, through the drift guard, already holds where it stands; a literal in a test would red the parallel cartouche lane (Issues #1108 and #1109), whose change moves the arena on the hero sheet (Call 3).

## Files

- `src/render/layers/sea-decor.ts`, edited, 196 lines to about 189: design items 1 and 2. New export: `firstBerth<T extends Pt>(labels: LabelArena, berths: ReadonlyArray<T>, half: number): T | undefined`. `claimSpot` is deleted.
- `test/render/sea-decor.test.ts`, created, about 90 lines: T1 to T5.
- `src/static/charts/chart-42-antique.svg`, `src/static/charts/chart-42-ink.svg`, `src/static/charts/chart-42-nautical.svg`, rewritten by `npm run charts:regen`: each gains one `<g id="sea-ship" opacity="0.85">` group in `layer-sea-decor` and changes nowhere else.
- `src/static/charts/chart-42-topographic.svg`, `src/static/charts/arms-42-0.svg`, `arms-42-1.svg`, `arms-42-2.svg`: rewritten by the regen, byte-identical, so not in the diff.
- `src/static/og.png`: rewritten by `npm run og` and restored, not committed (Call 5, Evidence step 5).
- `handbook/specs/chart-dress.md`, edited: one paragraph, under Rosters.
- `handbook/plans/400/422/422-plan.md`, created: this plan, copied unchanged after the rulings are folded.

No file is deleted. No file passes 400 lines. `test-support/source-read-list.ts` gains nothing: no test reads a source file. No `UNIT_SECONDS` entry: the new file renders two worlds and is expected well under 5 seconds, and a stale table breaks nothing (`handbook/specs/site-architecture.md`, the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs").

## Tests, in the order they are written

All five are unit tests in one new file, `test/render/sea-decor.test.ts`, run with `npm test -- test/render/sea-decor.test.ts`. No browser check is added or lengthened, so no ledger line and no browser readings are owed.

Imports: `test` from `node:test`; `assert` from `node:assert/strict`; `createLabelArena` from `src/render/context.ts`; `firstBerth` from `src/render/layers/sea-decor.ts`; `defaultRecipe` and `generateWorld` from `src/world/generate.ts`; `renderMap` from `src/render/map-renderer.ts`.

Module scope:

```ts
const HALF = 45;
const A = { x: 200, y: 200 };
const B = { x: 600, y: 600 };
const C = { x: 1000, y: 200 };
const squareAt = (o: { x: number; y: number }) => ({ x: o.x - HALF, y: o.y - HALF, w: HALF * 2, h: HALF * 2 });
const HERO = { style: "antique", legend: true } as const;
```

and one reader, with its single contract line above it:

```ts
// The centre of a decor glyph on a 1500-wide sheet, from its group's first move-to: the ship's hull opens at (-16.25, -2.5) from it and the serpent's tail at (-51, 0) (`shipNode` and `serpentNode` in `src/render/layers/sea-decor.ts`).
const decorCentre = (svg: string, id: string, dx: number, dy: number): { x: number; y: number } | null => {
  const m = new RegExp(`<g id="${id}"[^>]*><path d="M(-?[\\d.]+) (-?[\\d.]+)`).exec(svg);
  return m === null ? null : { x: Number(m[1]) + dx, y: Number(m[2]) + dy };
};
```

The `\\d` is written double inside the template literal, so the regular expression receives `\d`.

**The stub that makes the reds land on their assertions** (commit 1): `firstBerth` exported with the signature above and today's behaviour, `return berths.slice(0, 1).find((o) => labels.tryClaim({ x: o.x - half, y: o.y - half, w: half * 2, h: half * 2 }, 6));`, with design item 2's calls already in place. That is today's layer, byte for byte in what it draws, so the drift guard stays green at commit 1 and T1, T4 and T5 red on their assertions, not on a missing export.

**T1.** `test("the decor ship walks past a taken berth to the next free one, and claims that one alone", ...)`

- Fixture: `const labels = createLabelArena(); labels.claim({ x: A.x + HALF + 4, y: A.y - 10, w: 40, h: 20 });`. The claimed box stands 4 px off A's square: outside it, inside the pad of 6.
- Assertions, in order:
  1. `assert.equal(firstBerth(labels, [A, B, C], HALF), B)`.
  2. `assert.equal(labels.tryClaim({ x: B.x - 1, y: B.y - 1, w: 2, h: 2 }, 0), false)`: B's square was claimed.
  3. `assert.equal(labels.tryClaim({ x: C.x - 1, y: C.y - 1, w: 2, h: 2 }, 0), true)`: C's was not.
- Red at commit 1: assertion 1, `undefined` against B.
- Mutations that must red it, each read off the planner's run of the helper and its mutants (`out/422-dry-run/422-helper.ts`, log `422-helper.log`):
  - (M1) only the first berth tried, `berths.slice(0, 1).find(...)`: got none;
  - (M3) the pad dropped, `tryClaim(box)` with its default 2: got A;
  - (M4) the square halved, `w: half, h: half`: got A;
  - (M6) every free berth claimed, `berths.filter(...)[0]`: C held.

**T2.** `test("the decor ship keeps its first berth whenever it is free", ...)`

- `assert.equal(firstBerth(createLabelArena(), [A, B], HALF), A)`.
- Green at commit 1, a guard of the property that keeps the change additive.
- Mutation that must red it: (M2) the walk starts at the second berth, `berths.slice(1).find(...)`: got B.

**T3.** `test("the decor ship takes no berth when every berth is taken", ...)`

- Fixture: `const labels = createLabelArena(); labels.claim(squareAt(A)); labels.claim(squareAt(B));`.
- `assert.equal(firstBerth(labels, [A, B], HALF), undefined)`.
- Green at commit 1.
- Mutation that must red it: (M5) a taken berth forced, `?? berths[0]` after the `find`: got A.

**T4.** `test("the hero chart carries its decor ship (seed 42, antique, legend)", ...)`

- `const svg = renderMap(generateWorld(defaultRecipe(42)), HERO);`
- `assert.ok(svg.includes('<g id="sea-ship"'), "the hero chart drew no decor ship")`.
- Reading with the walk staged: present, its hull opening at `M128.7155172413793 749.6379310344827`, centre about (145, 752). Reading on main and at commit 1: absent.
- Red at commit 1: this assertion.
- Mutation that must red it: (M1).
- It carries no first-berth witness (Call 4).

**T5.** `test("a walked ship keeps its distance from the decor serpent (seed 82, antique, legend)", ...)`

- `const svg = renderMap(generateWorld(defaultRecipe(82)), HERO); const serpent = decorCentre(svg, "sea-serpent", 51, 0); const ship = decorCentre(svg, "sea-ship", 16.25, 2.5);`
- Assertions, in order:
  1. `assert.ok(serpent !== null, "fixture drift: seed 82 no longer draws its decor serpent")`;
  2. `assert.ok(ship !== null, "the decor ship was lost beside the serpent")`;
  3. `assert.ok(Math.hypot(serpent.x - ship.x, serpent.y - ship.y) > 260, ...)` with the distance in the message.
- Readings (`out/422-dry-run/422-sep.ts`, log `422-sep.log`): serpent (145.0, 829.1); with the walk the ship stands at (880.4, 991.6), 753.2 px off; with the serpent filter dropped from the ship's call it stands at (145.0, 940.3), 111.2 px off. Seed 82 was picked among the hero-setting sheets that draw a serpent today as the one whose two readings stand farthest either side of 260 (seeds 51, 78 and 98 also red under the mutation, at 111.2 to 119.1 px; on the other ten the filter changes nothing).
- Red at commit 1: assertion 2. On main seed 82 draws its serpent and no ship, since the ship's first berth past the serpent is taken.
- Mutation that must red it: (M7) the ship's call given `deepSpots` in place of `deepSpots.filter(...)`: assertion 3, 111.2 against 260.

The guard prover owes all five, with M1 to M7 as named; each was measured red where named and green on the planned helper. Step 15 leaves to the implementer only a guard changed after the prover's round. Paste each red line into the PR body's guard table.

## Order of commits

Push at the first commit. Each subject starts `#422`.

1. **The plan, the tests and the stub.** `handbook/plans/400/422/422-plan.md` (this file, unchanged); `src/render/layers/sea-decor.ts` with `firstBerth` stubbed as above and design item 2's calls; `test/render/sea-decor.test.ts` with T1 to T5. Run `npm test -- test/render/sea-decor.test.ts` (T1, T4 and T5 red on their named assertions, T2 and T3 green) and `npm test -- test/site/hero-charts.test.ts` (green: the stub draws today's sheets). Commit and push, then take Evidence step 2 here, before a line of the walk is written: its og raster must be main's card, which only the stub still draws.
2. **The walk.** `firstBerth`'s body loses `.slice(0, 1)`. `npm test -- test/render/sea-decor.test.ts` is green; the drift guard is red on `chart-42-antique.svg`, structural, at the inserted `<g id="sea-ship"`.
3. **The regen.** Evidence steps 3 to 6 below, then commit the three changed charts alone. The drift guard goes green, which proves nothing (rulebook).
4. **The doctrine.** The `handbook/specs/chart-dress.md` paragraph.

## Rosters and doctrine

- `handbook/specs/chart-dress.md`: a new paragraph directly after the one opening "**A sea beast is drawn last and yields to everything.**", reading:

  > **The decor ship takes the first free berth.** `seaDecorLayer` (`src/render/layers/sea-decor.ts`) lays its deep berths in open sea clear of the cartouche and the compass, deepest first, and draws the anonymous ship at the first whose square the arena grants (`firstBerth` there), more than 260 px from the decor serpent on a 1500 px sheet, so a sheet whose names take the deepest water still carries its ship, and a ship whose first berth is free stands on it. The decor serpent tries the deepest berth alone and is drawn only where it is free. Like the beast, neither forces a berth: a sheet with none free draws neither.

- Contradicted lines: none. `handbook/specs/engine-invariants.md` ("A view option may still change other drawing") stays true: a drawn beast still stands the decor serpent down, and the ship's berth is other drawing. `src/pages/index.astro`'s "a compass rose, a sea serpent" names what Vellum draws, which the decor serpent and the named beast still are (Call 8).
- Rosters: none joined. A new unit test file under `test/` is collected by `SUITE` in `scripts/unit-suite.ts` by its name.

## Evidence

Every command from the tree, one at a time, on the Mac (the rulebook's never-byte-compare rule: the readings below were all taken on the planner's Mac, where main's fresh render is byte-identical to every committed hero chart).

1. `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
2. Right after commit 1 is pushed, before the walk is written (the stub draws today's sheets): `mkdir -p out/422-before`, then `cp -p src/static/charts/*.svg out/422-before/`, then `npm run og`, then `cp -p src/static/og.png out/422-before/og-main-raster.png`, then `git checkout -- src/static/og.png`.
3. After commit 2: `npm run charts:regen`, then `git status --porcelain src/static`, which lists exactly `src/static/charts/chart-42-antique.svg`, `chart-42-ink.svg` and `chart-42-nautical.svg` as modified.
4. The regen diff, naming what moved:

   ```
   node --input-type=module -e 'import { readFileSync } from "node:fs"; import { diffSvg } from "./scripts/svg-drift.ts"; const SHIP = /<g id="sea-ship"[^>]*>[\s\S]*?<\/g>/; for (const n of ["antique", "topographic", "ink", "nautical"]) { const before = readFileSync(`out/422-before/chart-42-${n}.svg`, "utf8"); const after = readFileSync(`src/static/charts/chart-42-${n}.svg`, "utf8"); const d = diffSvg(before, after.replace(SHIP, "")); console.log(n, "ship groups:", (after.match(/id="sea-ship"/g) ?? []).length, "rest of the sheet:", d === null ? "as before" : JSON.stringify(d).slice(0, 300)); }'
   ```

   Expected: `antique ship groups: 1 rest of the sheet: as before`, `topographic ship groups: 0 ... as before`, `ink ... 1 ... as before`, `nautical ... 1 ... as before`. Paste the four lines and the ship's hull opening (`grep -o '<g id="sea-ship"[^>]*><path d="M[^q]*' src/static/charts/chart-42-antique.svg`, expected `M128.7155172413793 749.6379310344827`) in the PR body.
5. `npm run og`, then `cmp src/static/og.png out/422-before/og-main-raster.png`: identical, so the walk does not reach the card's window; `git checkout -- src/static/og.png`, and the PR body says `npm run og` ran, its PNG differs from the committed one by the browser alone (main's card rasterizes to the same new bytes), and `og.png` stays as committed.
6. Commit the three charts (commit 3).
7. `npm run build`, then `VELLUM_E2E_SUITES=render npm run test:e2e`: R4 compares the worker's draw against the committed `chart-42-antique.svg`. No other e2e suite; never the full local lanes.
8. `vellum-plate-reader` is owed at step 11: the deliverable changes how the hero sheet looks, step 6 was ruled from stills, and the diff touches the renderer, so its still judge comparison runs (`.claude/agents/vellum-plate-reader.md`, Two versions of one sheet). Dispatch it for the built hero sheets beside main's, seeds 42, 5 and 32 first.
9. The PR body cites this plan's sweep for the class (100 of 100 sheets carry a ship; every ship on main kept) as the planner's measurement, with the probe's path, since the implementer's tree has no staged arm.

## Calls made

Each is the planner's, on the rule named, and Alex saw them at the STOP; the implementer copies them into its step 12 comment.

1. **The walk keeps the layer's own deepest-first order.** Rule: the smallest change that passes over a taken berth, which is all the issue asks, with the first berth still first, so the change stays additive: every ship drawn on main kept its exact sheet in the sweep (5 of 5, 22 of 22, 13 of 13, 40 of 40 by setting). The order also decides where the new ships land: the deepest water lies along the sheet's edges, so most walked ships sail there, 56 of 100 in the leftmost column at the hero setting (`out/422-dry-run/422-edges.log`). Another spread for the new ships is a new design, with its own stills.
2. **One exported helper, `firstBerth`, replaces `claimSpot` for both calls**, the serpent keeping its single berth through `deepSpots.slice(0, 1)`. Rules: one claim shape, one function (the word-for-word lint and the copy hunt); a function that takes its inputs and returns its answer so a unit test drives it (`handbook/specs/check-placement.md`, the bullet opening "A claim goes to a unit test").
3. **No coordinate pin.** Rule: a unit test checks one claim (same bullet). The hero ship's place is held by the committed chart through the drift guard, and a literal would red the cartouche lane, which lands after this one.
4. **T4 carries no first-berth witness.** No reading short of re-deriving the layer shows that seed 42's deepest berth is taken. T1 and T2 hold the walk on fixtures the test builds itself, so if seed 42's first berth ever came free, T4 would lose only the hero's acceptance, which the committed chart and the drift guard still hold.
5. **`og.png` is left as committed** when the branch's raster equals main's raster on the same machine. Rule: a regen lands alone and explicable (rulebook); a byte change the browser made and the code did not is not this change's to land. Measured: main's card rasterizes 32 bytes off the committed PNG, and the walk's card rasterizes byte-identical to main's.
6. **Unit tests only, no browser check.** Rule: a claim goes to a unit test wherever one can hold it alone (`handbook/specs/check-placement.md`); `renderMap` shows every claim here in Node.
7. **One paragraph in `handbook/specs/chart-dress.md`.** Rule: the routing rule (`handbook/specs/conventions.md`, Where a rule lives); how a chart layer takes its place is that spec's, beside the beast's escalation this change mirrors.
8. **`handbook/specs/engine-invariants.md` and the home page's "a sea serpent" are left as they are**: neither is contradicted.
9. **The fixtures use the hero's setting**, antique with the legend: it is the committed chart's, the case the issue's acceptance names. Recon flagged that the issue never said which setting its seed lists used; this plan's numbers give both.
10. **Names visible in the tree:** the test file `test/render/sea-decor.test.ts` (named for the layer it tests, as `test/render/legend.test.ts` and `test/render/heraldry.test.ts` are) and the export `firstBerth`.
11. **Recon's STALE findings are folded, none rejected**: the seed-42 premise went to Alex as menu item 1 and was ruled (Question 1, A); the seal's loss list is recorded above and drops out of the motivation; the issue's "#193 rules" are `handbook/specs/rulebook.md`'s, cited here.
12. **A regen moving the ship is not a stop for any later lane**, but every lane whose change moves a name, the cartouche, the compass or the key on the hero sheet now also moves the hero's ship, and its regen diff will show it. The dispatcher has told the cartouche lane (Issues #1108 and #1109), which rebases onto this regen, and the name-blocklist lane (Issue #962).

## Open decisions

none

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 2f66e4eef52dc8a5c4c475979080c03f9f11023c origin/main -- src/render/layers/sea-decor.ts src/render/map-renderer.ts src/render/context.ts src/render/geometry.ts src/render/layers/feature-labels.ts src/render/layers/cartouche.ts src/render/layers/scalebar.ts src/render/layers/compass.ts src/render/layers/legend.ts src/render/og-card.ts scripts/hero-charts.ts scripts/build-og.ts test/site/hero-charts.test.ts src/static/charts src/static/og.png` prints anything: a chart-changing lane landed first, against the merge order, and every reading here is stale.
- At commit 1, `test/site/hero-charts.test.ts` reds, or T2 or T3 reds, or T1, T4 or T5 reds on anything but its named assertion: the stub is not today's layer.
- After commit 2, `npm test` reds anything but the drift guard (the raster test excepted only if it passes alone, as measured).
- Step 3's `git status` lists any other file under `src/static/`, or step 4 prints anything but the four expected lines: the regen moved something the walk does not explain.
- Step 5's `cmp` reports a difference: the ship reached the og card's window, against the measurement.
- T5's first assertion reds (seed 82 no longer draws its serpent), or its distance under the walk is not above 260.
- R4 reds at step 7, or any browser lane reds on CI (read as `.claude/agents/vellum-implementer.md` says).
