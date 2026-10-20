# Landmass census, seeds 1 to 60, at 581a6de3

Terrain only: heightfield at 320x240, sea level by the type's default land share, four-connected labelling (`labelLandmasses`). A world sheet's count, not a region's.

| type | land share | landmasses at or above N cells: median (range) for N = 1, 5, 10, 20, 50, 100 | realm-bearing size (>= 0.004 of the grid, 307.2 cells): median (range) | largest landmass's share of the land: median (range) |
|---|---|---|---|---|
| archipelago | 0.24 | 29.5 (18 to 54); 12.5 (6 to 24); 9.5 (5 to 18); 8 (3 to 16); 5 (2 to 11); 4 (2 to 10) | 3 (1 to 6) | 0.80 (0.38 to 0.99) |
| island | 0.34 | 11 (3 to 22); 5 (1 to 13); 4 (1 to 10); 3 (1 to 8); 2 (1 to 6); 2 (1 to 4) | 1 (1 to 3) | 0.99 (0.69 to 1.00) |
| continent | 0.46 | 10.5 (2 to 22); 6 (2 to 15); 5 (1 to 13); 4 (1 to 10); 3 (1 to 8); 2 (1 to 7) | 2 (1 to 4) | 0.98 (0.46 to 1.00) |
| citystate | 0.3 | 7 (1 to 15); 4 (1 to 11); 3 (1 to 9); 2.5 (1 to 9); 2 (1 to 6); 2 (1 to 4) | 1 (1 to 3) | 0.99 (0.90 to 1.00) |

## How often an archipelago lands on exactly N islands of 20+ cells (the hit rate a re-roll-until-it-fits scheme would pay)

| islands (20+ cells) | seeds of 60 | share | expected tries to hit it by re-rolling |
|---|---|---|---|
| 3 | 1 | 0.017 | 60.0 |
| 4 | 3 | 0.050 | 20.0 |
| 5 | 7 | 0.117 | 8.6 |
| 6 | 9 | 0.150 | 6.7 |
| 7 | 8 | 0.133 | 7.5 |
| 8 | 11 | 0.183 | 5.5 |
| 9 | 5 | 0.083 | 12.0 |
| 10 | 9 | 0.150 | 6.7 |
| 11 | 2 | 0.033 | 30.0 |
| 12 | 3 | 0.050 | 20.0 |
| 15 | 1 | 0.017 | 60.0 |
| 16 | 1 | 0.017 | 60.0 |

Counts above the table's largest were seen on no seed, so a re-roll scheme never reaches them: the expected tries are unbounded there.

Command: `node out/844/measure/sweep-landmasses.ts 1 60` from the design-844 worktree (re-run for Issue #849 at 581a6de3).
