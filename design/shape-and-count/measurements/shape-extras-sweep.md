# Two remedies for the soft likeness's spill, terrain only, seeds 1 to 40 (at 581a6de3)

"bigger": the outline scaled to cover the dome core's share of the sheet for its type (island 0.302, archipelago 0.238, continent 0.478, citystate 0.196), capped so its box keeps the inset named on every side. "share": the outline at the inner box, the land share set to the outline's own share of the sheet.

| outline | type | variant | outline's share of the sheet | land share | likeness median (min to max) | land beyond median (min to max) | islands median (min to max) | border land cells (sum) |
|---|---|---|---|---|---|---|---|---|
| crescent | island | bigger, min inset 0.06 | 18% | 0.340 | 0.50 (0.43 to 0.53) | 49% (47% to 54%) | 3 (1 to 6) | 0 |
| crescent | island | bigger, min inset 0.08 | 16% | 0.340 | 0.46 (0.41 to 0.48) | 53% (52% to 57%) | 3 (1 to 6) | 0 |
| crescent | island | share = the outline's own | 12% | 0.121 | 0.37 (0.14 to 0.53) | 46% (30% to 76%) | 6 (2 to 10) | 0 |
| texas | island | bigger, min inset 0.06 | 28% | 0.340 | 0.58 (0.47 to 0.66) | 33% (27% to 41%) | 4 (1 to 8) | 0 |
| texas | island | bigger, min inset 0.08 | 26% | 0.340 | 0.58 (0.46 to 0.67) | 36% (29% to 44%) | 3.5 (1 to 8) | 0 |
| texas | island | share = the outline's own | 19% | 0.191 | 0.47 (0.34 to 0.59) | 36% (26% to 49%) | 6 (1 to 11) | 0 |
| japan | archipelago | bigger, min inset 0.06 | 9% | 0.240 | 0.29 (0.23 to 0.35) | 69% (64% to 75%) | 5 (2 to 10) | 0 |
| japan | archipelago | bigger, min inset 0.08 | 8% | 0.240 | 0.28 (0.21 to 0.33) | 71% (67% to 77%) | 4 (1 to 9) | 0 |
| japan | archipelago | share = the outline's own | 6% | 0.059 | 0.17 (0.06 to 0.29) | 70% (55% to 88%) | 9 (5 to 13) | 0 |

Command: `node out/844/measure/sweep-shape-extras.ts` from the design-844 worktree at 581a6de3.
