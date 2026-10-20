# Count through lobes, round 2: the land share as an axis, the ceiling, every map type, the coast slider (at 581a6de3)

An island here is a landmass of at least 20 cells, which is 2.60e-4 of the grid (20 of 76,800 at 320x240), four-connected. The mechanism is stated exactly at the head of `probe-lobes-2.ts`. Lobe coverage "fixed" is 0.30 of the sheet whatever the share (the first probe); "scaled" is min(1.25 x share, 0.45).

## Every map type at its own share and shape numbers (scaled coverage, equal sizes, seeds 1 to 3)

| type | share | asked 5: islands (seeds 1, 2, 3) | asked 20 | asked 100 | largest island's share at 100 (min to max) | border land cells (sum) |
|---|---|---|---|---|---|---|
| archipelago | 0.24 | 9, 11, 9 | 25, 25, 22 | 91, 86, 83 | 0.04 to 0.07 | 0 |
| island | 0.34 | 8, 6, 6 | 14, 13, 16 | 46, 37, 33 | 0.15 to 0.22 | 0 |
| continent | 0.46 | 5, 6, 4 | 11, 7, 8 | 14, 10, 10 | 0.81 to 0.89 | 0 |
| citystate | 0.3 | 11, 7, 12 | 21, 19, 20 | 74, 69, 52 | 0.12 to 0.12 | 0 |

Command: `node out/844/measure/probe-lobes-2.ts types` from the design-844 worktree (re-run for Issue #849 at 581a6de3).
