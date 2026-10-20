# Count through lobes, round 3: two variants the round-2 numbers asked for (at 581a6de3)

Same mechanism as `count-through-outline-2.md` except as each heading says. Sizing measurements, not drawn directions.

## Variant: the ground between lobes sunk (baseKeep 0.2, sinkDepth 0.4), archipelago, fixed coverage 0.30, equal, seeds 1 to 3

| land share | asked 2 | asked 5 | asked 20 | asked 100 | largest island's share at 100 | border land cells (sum) |
|---|---|---|---|---|---|---|
| 0.24 | 4, 2, 3 | 5, 5, 5 | 20, 19, 19 | 85, 79, 71 | 0.05 to 0.07 | 0 |
| 0.336 | 12, 15, 13 | 10, 11, 16 | 22, 25, 21 | 56, 56, 43 | 0.07 to 0.17 | 0 |
| 0.46 | 14, 7, 5 | 10, 13, 11 | 11, 15, 10 | 29, 27, 21 | 0.23 to 0.74 | 0 |

## Variant: the coast wobble scaled to the lobe, archipelago, share 0.24, fixed coverage 0.30, asked 20, equal, seeds 1 to 3

| coast slider | islands (seeds 1, 2, 3) | shore cells per land cell (min to max) | border land cells (sum) |
|---|---|---|---|
| 0.1 | 25, 24, 21 | 0.112 to 0.126 | 0 |
| 0.55 | 25, 23, 19 | 0.110 to 0.127 | 0 |
| 0.95 | 25, 23, 19 | 0.111 to 0.129 | 0 |

Command: `node out/844/measure/probe-lobes-2.ts variants` from the design-844 worktree (re-run for Issue #849 at 581a6de3).
