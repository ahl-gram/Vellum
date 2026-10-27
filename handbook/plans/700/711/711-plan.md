# Issue #711 plan: `--land` refuses a value that is not a finite number

Branch `fix/711-land-nan`, cut from `origin/main` at `1c6eff7`. The issue was written at `4152fa2`; Issue #654 row 9c has split `main` in `src/cli/main.ts` since, and the check the issue names now sits in `chartOptions` in `src/cli/main.ts`. Recon found no citation staled by the split.

## Rulings (Alex, 2026-10-04, Issue #711 comment 5983185236)

1. **Arm C.** The command line refuses a `--land` that is not a finite number with the out-of-range message; `pickSeaLevel` refuses a land fraction that is not a finite number; `terrainSettings` refuses a coast warp that is not a finite number.
2. **An empty `--land` uses the default**, as today.
3. **The loose ends fold into this pull request under one rule: an empty value means the flag's default.** An empty `--coast-warp` takes the seed's own raggedness, not 0; `--scale` is validated whether or not a PNG is requested; every flag's refusal gets a test.
4. **An empty `--seed` is refused**, the one exception.

## What is wrong, measured at 1c6eff7

- `node src/cli/main.ts chart --seed 11 --land abc` exits 0, logs `seed 11 · continent · The Realm of Tuko` and writes an SVG stamped `data-vellum-land-fraction="NaN"`.
- The CLI's check is `landFraction < 0.1 || landFraction > 0.7`, false for `NaN`. `pickSeaLevel` in `src/terrain/sealevel.ts` checks `landFraction <= 0 || landFraction >= 1`, false for `NaN` too. `quantile` in `src/core/grid.ts` is then called with `1 - landFraction`, indexes `sorted[NaN]`, and the world's `seaLevel` is `undefined`, not a number.
- The resulting world, seed 11 at the default grid (scratch probe `711-probe.ts`, `out/711/711-probe-before.txt`): land in 0 of its cells, 0 rivers, 1 realm, yet 26 settlements, against 0.46 land, 23 rivers and 4 realms for the same seed at a valid fraction.
- Every spelling that `Number` reads as `NaN` passes: `abc`, `NaN`, `0.3abc`. `Infinity`, `0x1`, `0.05`, `0.8` and `" "` are already refused with `--land must be between 0.1 and 0.7` (scratch `711-matrix.ts`, `out/711/711-matrix-before.txt`).
- An empty value is read two ways across the flags (same matrix): `--seed ""` draws seed 0 and `--coast-warp ""` draws a coast warp of 0, while `--land ""`, `--width ""` and `--grid ""` fall back to their defaults. `--scale abc` is checked only when `--png` is given and a browser is found. No flag's refusal is tested: the only refusal in `test/cli/main.test.ts` is the unknown verb.
- **Nothing committed pins today's drawing behavior.** The issue says row 9c's CLI comparison pins it; that runner was a scratch file (`git ls-files | grep 9c-cli` finds nothing).

## Who else can hand the engine a non-finite value

`grep -rn pickSeaLevel src` has three hits outside `src/terrain/sealevel.ts`: the import and the call in `terrainStage` in `src/world/generate.ts`, and a comment in `src/site/explorer/sea-level.ts`. So it has one caller, and every world from every surface goes through it. The doors that carry a land fraction into `generateWorld`, from `grep -rn -e 'generateWorld(' -e landFraction src scripts` and reading each reader:

| door | how the land fraction is read | can it carry NaN today |
|---|---|---|
| the CLI `chart` verb, `chartOptions` in `src/cli/main.ts` | `Number(values.land)`, range check only | YES, this issue |
| `buildAtlas` in `src/cli/atlas.ts` | a `recipe` option; its only caller, `scripts/generate-showcases.ts`, passes none | no |
| Explorer hash, `landFromHash` in `src/site/explorer/hash-sync.ts` | `Number.isFinite` before the clamp | no |
| Explorer slider, `sliderToLand` in `src/site/explorer/sea-level.ts` | `clampLand` passes NaN through, but `#land` is `type="range"` and the HTML value sanitization rule keeps its value a valid number (the spec, not measured here) | no |
| Print Room and Reading Room hash readers (`src/site/print-room/app.ts`, `src/site/reading-room/app.ts`) | `Number.isFinite` before the clamp | no |
| Prospect and Ribbon addresses (`src/site/prospect/address.ts`, `src/site/ribbon/address.ts`) | `Number.isFinite` before the clamp | no |
| the Chart Table address, `readWorld` in `src/site/shared/table-address.ts` | `/^\d+$/` before the clamp | no |
| `recipeFromSvg` in `src/render/recipe-meta.ts` | `Number(attr)`, so a chart this bug already wrote reads back NaN; no `src/` caller rebuilds a world from it | no door |
| gallery, home stage, seed of the day, hero charts, OG card, region scripts | `defaultRecipe(seed)` with no land override | no |

A NaN coast warp makes the same empty world through the same step (plan skeptic, finding 1): at seed 11 and the default grid, 76800 of 76800 elevation cells are NaN, the sea level is NaN, land 0, 0 rivers, 1 realm, 26 settlements (scratch `711-coast.ts`, `out/711/711-coast-before.txt`). `±Infinity` coast warp does not poison the field but draws a different world (sea level 0.027, 41 rivers against 23); arm C refuses it too, and no door can send one.

## Design

### The engine (ruling 1)

- `pickSeaLevel` in `src/terrain/sealevel.ts`: `!Number.isFinite(landFraction) || landFraction <= 0 || landFraction >= 1`, message unchanged (`landFraction must be in (0, 1), got NaN` for the new case).
- `terrainSettings` in `src/terrain/heightfield.ts`, beside the `detail` check: `if (!Number.isFinite(coastWarp)) throw new RangeError(\`coastWarp must be a finite number, got ${coastWarp}\`)`. Finiteness only, no range; the widest committed value, 1.0 in `test/terrain/heightfield-detail.test.ts`, is unaffected.
- Rejected alternative: `pickSeaLevel` refusing a non-finite RESULT. Its message names neither knob, and a partly NaN field can still hand back a finite quantile.

### The command line (rulings 1 to 4), all in `src/cli/main.ts`

- **The parse options become one exported roster, `CHART_OPTIONS`**, so the test can sweep every flag from the data rather than a list it restates (Gate 1 item 16). The style flag loses its parse-time default (`validateStyle(values.style ?? "antique")` instead), so the parsed type stays honest once an empty value is dropped.
- **One rule for an empty value, in one place.** `parseChartArgs` drops every key whose value is the empty string, except `seed`, which it keeps as given. Every consumer then reads an absent value as its default, and every presence test becomes `!== undefined` (today `--land`, `--width` and `--scale` test truthiness, which only agreed with the rule by accident and would hide a deleted rule from the tests).
- **A blank value is not a number.** Numeric flags parse through one helper, `s.trim() === "" ? NaN : Number(s)`, so `" "` is refused rather than read as 0 (`Number(" ")` is 0). This is what refuses an empty `--seed` (ruling 4), with its existing message, `--seed must be a number, got ""`.
- **`--land`**: `!Number.isFinite(landFraction) || landFraction < 0.1 || landFraction > 0.7`, message unchanged.
- **`--scale`** is parsed and checked in `chartOptions`, before anything is drawn, with or without `--png`; `rasterizeChart` takes the checked number.
- **`--out ""`** writes to the default path, `--style ""` draws antique, `--type ""`, `--band ""` and `--theme ""` draw the seed's own, through the same rule.
- The boolean flags take no value at all (`parseArgs` refuses `--png ""` as an unexpected argument), so the rule has nothing to say about them.

No comment is added: the tests are the record.

For every non-empty finite value the parse returns `Number(s)` as before and every check is false exactly where the old one was, so a valid input yields the same bytes by construction. Phase one measured the engine half on throwaway copies (arms A, B and C, 79 files each, byte-identical to the baseline); the final tree is measured again (E2).

## Tests (each with the mutation that reds it)

All in existing files: `test/cli/main.test.ts` and `test/terrain/heightfield.test.ts`. No new test file, so no roster joins.

- **T1, refusals, one table of `[flag, args, message]` driven through `main`** at `--seed 11 --grid 80x60` with an `--out` under the file's `TMP`, each row its own `assert.rejects` with the exact message:
  - `--land`: `abc`, `NaN`, `0.3abc`, `" "`, `Infinity`, `0.05`, `0.8`, all `--land must be between 0.1 and 0.7`.
  - `--seed`: `abc`, `""`, `" "`, all `--seed must be a number, got "<v>"`.
  - `--coast-warp`: `abc`, `" "`, `1.5`, `=-0.1`, all `--coast-warp must be between 0 and 1`.
  - `--scale` with no `--png`: `abc`, `" "`, `0.1`, `5`, all `--scale must be between 0.5 and 4`.
  - `--width`: `abc`, `100`, `7000`; `--grid`: `abc` (the format message) and `10x10` (the range message); `--style`, `--type`, `--band`, `--theme`: `bogus`, each its existing unknown-value message.
  - Red step: today `--land abc`, `--seed ""`, `--seed " "`, `--coast-warp " "` and `--scale abc` (no `--png`) draw instead of refusing; the rest are new pins on refusals that already hold.
  - M1: delete `!Number.isFinite(landFraction) ||` from the `--land` check. Reds on `abc`. (With the engine guard in place the CLI then rejects with `pickSeaLevel`'s RangeError, and the row still reds, on the message, which is why every row pins the exact message.)
  - M2: the numeric helper back to bare `Number(s)`. Reds on `--seed ""`, `--seed " "` and `--coast-warp " "`.
  - M3: `--scale`'s check moved back behind `--png`. Reds on every `--scale` row.
  - M4, per flag: delete each flag's own check; each reds its rows.
- **T2, an empty value means the flag's default.** For every string flag in `CHART_OPTIONS` except `seed`, `--flag ""` draws a chart byte-identical to the same command without the flag (same process, same Node, so a legitimate byte compare), at `--seed 11 --grid 80x60`, except `--grid ""`, compared at the full default grid, and `--out ""`, run in a temporary working directory and checked to land at `out/chart-11-antique.svg` with the same bytes. This covers ruling 2 (`--land ""`) and ruling 3 (`--coast-warp ""` takes the seed's own raggedness, `--scale ""` is not refused).
  - Red step: today `--coast-warp ""` draws coast warp 0 and differs; `--style ""`, `--type ""`, `--band ""` and `--theme ""` are refused as unknown; `--out ""` fails to write.
  - M5: delete the empty-dropping step. Reds on every row (an empty value is then refused or read as 0).
  - M6: swap any one consumer's presence test back to truthiness. Stays green for that flag, since the empty value no longer reaches it: the rule lives in one place, and M5 is the mutation that guards it.
- **T3, the roster is swept.** Every string flag in `CHART_OPTIONS` has a T1 row (except `out`, which refuses nothing) and a T2 row (except `seed`, which is refused, and is in T1). A flag added to the roster without both fails.
  - M7: add a string option to `CHART_OPTIONS`. Reds.
- **T4, valid `--land` still draws and stamps its own value, at both edges**: 0.1, 0.3, 0.7, each read back with `recipeFromSvg`. Non-default values (seed 11's default is 0.46).
  - M8: `< 0.1` to `<= 0.1`. Reds on 0.1. M9: `> 0.7` to `>= 0.7`. Reds on 0.7. M10: invert the finiteness clause. Reds on all three.
- **T5, `test/terrain/heightfield.test.ts`, beside "sea level hits the requested land fraction": sea level refuses a land fraction outside (0, 1), NaN included.** `pickSeaLevel(buildHeightfield(RECIPE), v)` throws `{ name: "RangeError", message: "landFraction must be in (0, 1), got <v>" }` for each of NaN, 0, 1, -0.1, 1.5, Infinity, -Infinity, each its own assertion; and `generateWorld(defaultRecipe(11, { gridW: 80, gridH: 60, landFraction: NaN }))` throws the same.
  - M11: restore `landFraction <= 0 || landFraction >= 1`. Reds on NaN, pure and driving. M12: `<= 0` to `< 0`. Reds on 0. M13: `>= 1` to `> 1`. Reds on 1.
- **T6, same file: the terrain refuses a coast warp that is not a finite number.** `buildHeightfield({ ...RECIPE, coastWarp: v })` throws `{ name: "RangeError", message: "coastWarp must be a finite number, got <v>" }` for NaN, Infinity, -Infinity; and `generateWorld(defaultRecipe(11, { gridW: 80, gridH: 60, coastWarp: NaN }))` throws it too. The file's existing finite cases stay green, the positive control.
  - M14: delete the coast-warp check. Reds on all four.

## Sequence

1. This plan, as it stands after the rulings, over the untracked `handbook/plans/711/711-plan.md`.
2. Export `CHART_OPTIONS` with behavior unchanged (the stub with the right shape), write T1 to T4, observe the reds named above, keep the red lines for the PR body; then the CLI implementation. Commit 1 with the plan archive. Push.
3. T5 and the `pickSeaLevel` fix, T5 red first. Commit 2.
4. T6 and the `terrainSettings` check, T6 red first. Commit 3.
5. E2 on the final tree (and after commit 1).
6. Step 11: `vellum-guard-prover` on T1 to T6, one round.
7. Step 12: one dated comment on Issue #711: the calls below, arm C's `±Infinity` side effect, the phase-one throwaway measurement as an unruled call, and that the rulings comment is the record of Alex's rulings.
8. Steps 13 to 15: the PR (`Closes #711` on its own line, `closingIssuesReferences` checked), then `vellum-pr-skeptic` cold, one round, fixes on step 15's terms.

## Evidence (named commands)

- E1, the acceptance: `node 711-matrix.ts <worktree>` (scratchpad): `abc`, `NaN` and `0.3abc` refused with the `--land` message; `--seed ""` refused; `--coast-warp ""` stamps no coast warp; the rest unchanged. Saved as `out/711/711-matrix-after.txt`.
- E2, byte identity for a valid input: `node 711-bytes.ts <worktree> final-<sha>` renders 72 CLI charts (seeds 42, 11, 7, 1, 2, 3, 99, 1234, each at the default, at `--land` 0.1, 0.24, 0.3, 0.46, 0.7, and at `--coast-warp` 0, 0.3, 1) plus the seven committed hero files through `heroChartSvgs` in `scripts/hero-charts.ts`; `diff -rq out/711/bytes-v2-before-1c6eff7 out/711/bytes-final-<sha>` prints nothing. Same machine, same Node (v26.10.0). Controls: a second render at `1c6eff7` is byte-identical to the first, and the baseline's hero files are byte-identical (`cmp`) to the committed `public/charts/`.
- E3: `node --test test/world/golden-seed42.test.ts test/world/covenant-seed42.test.ts test/site/hero-charts.test.ts` green, and `git status --porcelain public/charts` empty. No regen owed.
- E4: `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`.
- E5: `grep -rln "cli/main\|pickSeaLevel" e2e` finds nothing; no local e2e; CI runs the full set.

## Rosters and doctrine the change drags

- `handbook/specs/engine-invariants.md`: "The CLI rejects a land fraction outside its allowed range rather than clamping it" stays true; no edit.
- The CLI help text stays true: every default it names is still the default, and an empty value now means it.
- The comment at the head of `src/site/explorer/sea-level.ts` stays true, because the hash path tests `Number.isFinite` before the clamp.
- **For the PR body: which error a pair of bad flags reports changes.** `--land abc --coast-warp abc` reported the coast-warp error and now reports the `--land` one; a bad `--scale` is now reported before anything is drawn, and before `--style`.
- No new file outside the plan archive. No committed chart, golden or seed moves (E2, E3).

## Recon and plan skeptic

Recon: 13 CURRENT, 2 STALE (cosmetic), 1 UNVERIFIABLE (the reproduction, run here). Plan skeptic: no blocking finding; every finding folded (the coast warp as arm C, the empty `--land` test, `--land`'s edges, the error-order line, the sibling family, steps 11 and 12, the stale plan copy, call 5's wording, two loose wordings).

## Calls made without a ruling

1. T1 pins `Infinity`, `0.05` and `0.8` to the `--land` message. Rule: the acceptance's own wording, "the same message as an out-of-range one".
2. The `--land` check takes the `--coast-warp` form, `!Number.isFinite(...) || range`. Rule: the acceptance's own wording, "as `--coast-warp` does".
3. `pickSeaLevel`'s existing 0 and 1 refusals and `--land`'s 0.1 and 0.7 edges are pinned. Rule: Gate 1 item 5; the rewritten expressions own them and nothing pins them today.
4. The coast-warp engine check is finiteness only, no range. Rule: touch only what the failure needs.
5. A blank value (only whitespace) is refused as not a number, not treated as empty. Rule: ruling 3 names the empty value, and `Number(" ")` is 0, the same silent zero ruling 3 removes; `--land`, `--width` and `--scale` already refused `" "` by range, so this makes `--seed` and `--coast-warp` agree with them.
6. `--out` and the four named-value flags (`--style`, `--type`, `--band`, `--theme`) join the empty-value rule. Rule: ruling 3 says "every flag"; today their empty value is refused (the four) or fails to write (`--out`).
7. The empty-value rule lives in one step of the parse rather than at each consumer. Rule: ruling 3's "one rule"; one place is one mutation that guards it (T2, M5).
8. The parse options are exported as `CHART_OPTIONS` for the roster sweep. Rule: Gate 1 item 16.
9. Arm C refuses `±Infinity` coast warp, which today draws a different world. No door sends one. Recorded at step 12.
10. All three arms were measured in phase one on throwaway copies of the engine in the scratchpad, never in the worktree and never committed. An unruled call, not a ruled form: workflow step 6's spike carve-out is for appearance stills. Recorded at step 12.
