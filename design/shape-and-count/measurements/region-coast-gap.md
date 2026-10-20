# Issue #453 re-measured at 581a6de3: seed 2, band-1 window (0.3125, 0.1875) to (0.8125, 0.6875)

| coast slider | arm | region terrain digest | region title | towns (not hamlets) | world vs region land/sea disagreement |
|---|---|---|---|---|---|
| 0.1 | bare | c453639d9bdc | The Environs of Vunsvyov | 16 | 4696 of 76800 (6.11%) |
| 0.1 | detailed | 74ba3f6f9a12 | The Environs of Vunsvyov | 16 | 4526 of 76800 (5.89%) |
| 0.55 | bare | c453639d9bdc | The Environs of Vyd | 17 | 1326 of 76800 (1.73%) |
| 0.55 | detailed | 29649d38b74d | The Environs of Vyd | 17 | 1143 of 76800 (1.49%) |
| 0.9 | bare | c453639d9bdc | The Environs of Soskin | 15 | 4148 of 76800 (5.40%) |
| 0.9 | detailed | 410afac933b3 | The Environs of Soskin | 15 | 4119 of 76800 (5.36%) |

Reading: on the bare arm the digest is identical at every slider position, so the region's land is the default coast whatever the world's coast is; the title and town count follow the slider. The detailed arm's digest moves only because the sea level moves (`seaLevel` is in `ChainSpec`), not because the warp reaches the chain.

Where the gap is: `regionElevation` in `src/world/region.ts` passes `seed`, `mapType`, `window`, `gridW`, `gridH`, `worldAspect` (and `seaLevel` on the detail arm) and never `recipe.coastWarp`, so `buildHeightfield` falls back to `SHAPES[mapType].coastWarp` (0.55) and `buildChainedField`'s optional `coastWarp` stays undefined. Any new terrain field added only to `buildHeightfield`'s world-sheet call would be dropped the same way.

Command: `node out/844/measure/probe-453.ts` from the design-844 worktree (re-run for Issue #849 at 581a6de3).
