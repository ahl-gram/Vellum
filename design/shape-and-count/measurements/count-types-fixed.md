# The count on every map type, the lobes covering a fixed 0.30 of the sheet (at 581a6de3)

Islands of 20 or more cells achieved, min to max over seeds 1 to 10, each type at its own default land share and shape numbers. "Sunk" lowers baseKeep to 0.2 and deepens sinkDepth to 0.4 between the lobes. The largest landmass's share of the land is given at asked 100.

| type | share | sizes | variant | asked 2 | asked 5 | asked 20 | asked 100 | largest at 100 | border land (sum) |
|---|---|---|---|---|---|---|---|---|---|
| archipelago | 0.24 | equal | as measured | 3 to 12 | 9 to 13 | 19 to 25 | 78 to 91 | 0.04 to 0.10 | 0 |
| archipelago | 0.24 | equal | sunk | 2 to 4 | 5 to 5 | 16 to 20 | 71 to 85 | 0.04 to 0.07 | 44 |
| archipelago | 0.24 | varied | as measured | 2 to 17 | 4 to 15 | 15 to 24 | 68 to 83 | 0.07 to 0.16 | 0 |
| archipelago | 0.24 | varied | sunk | 2 to 12 | 5 to 5 | 14 to 20 | 68 to 78 | 0.06 to 0.17 | 54 |
| island | 0.34 | equal | as measured | 5 to 10 | 7 to 18 | 12 to 21 | 46 to 66 | 0.11 to 0.45 | 0 |
| island | 0.34 | equal | sunk | 5 to 12 | 5 to 15 | 14 to 23 | 44 to 62 | 0.12 to 0.46 | 16 |
| island | 0.34 | varied | as measured | 2 to 15 | 4 to 13 | 11 to 19 | 45 to 62 | 0.17 to 0.38 | 11 |
| island | 0.34 | varied | sunk | 2 to 15 | 4 to 11 | 11 to 17 | 43 to 55 | 0.15 to 0.36 | 137 |
| citystate | 0.3 | equal | as measured | 4 to 12 | 5 to 13 | 15 to 25 | 58 to 80 | 0.15 to 0.48 | 0 |
| citystate | 0.3 | equal | sunk | 4 to 11 | 4 to 12 | 14 to 24 | 58 to 79 | 0.13 to 0.47 | 0 |
| citystate | 0.3 | varied | as measured | 3 to 13 | 5 to 10 | 15 to 20 | 54 to 74 | 0.12 to 0.51 | 6 |
| citystate | 0.3 | varied | sunk | 2 to 12 | 4 to 8 | 16 to 20 | 55 to 72 | 0.12 to 0.49 | 70 |
| continent | 0.46 | equal | as measured | 3 to 8 | 5 to 10 | 7 to 14 | 23 to 42 | 0.31 to 0.71 | 21 |
| continent | 0.46 | equal | sunk | 2 to 7 | 4 to 9 | 8 to 15 | 14 to 39 | 0.30 to 0.82 | 208 |
| continent | 0.46 | varied | as measured | 3 to 11 | 1 to 9 | 5 to 12 | 21 to 39 | 0.41 to 0.86 | 8 |
| continent | 0.46 | varied | sunk | 2 to 10 | 2 to 9 | 4 to 12 | 20 to 35 | 0.33 to 0.85 | 565 |

## Lobes inside the Texas outline (archipelago, share 0.24, equal, sunk, coverage cut to the outline's own share, 0.191)

| asked | islands (seeds 1 to 10) | border land (sum) |
|---|---|---|
| 5 | 12, 15, 17, 14, 9, 16, 16, 15, 18, 14 | 0 |
| 20 | 11, 22, 16, 12, 15, 18, 17, 19, 14, 17 | 0 |
| 100 | 14, 20, 18, 13, 24, 16, 19, 21, 14, 16 | 0 |

Command: `node out/844/measure/sweep-count-types.ts` from the design-844 worktree at 581a6de3.
