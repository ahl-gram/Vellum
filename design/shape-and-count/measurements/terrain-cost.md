# What each edge costs to build, terrain only (at 581a6de3; this machine, median of 7)

| edge | world sheet, ms | band-1 window at detail 1, ms |
|---|---|---|
| today's buildHeightfield | 221 | 235 |
| dome (the spike's restatement) | 224 | 236 |
| soft, the crescent | 255 | 269 |
| soft, Texas (79 vertices) | 238 | 253 |
| soft, Japan (65 vertices) | 236 | 251 |
| hard, Texas | 161 | 163 |
| bias 0.7, Texas | 311 | 341 |
| lobes, asked 20 | 237 | 250 |
| lobes, asked 100 | 293 | 303 |
| lobes, asked 100, biting wobble | 319 | 335 |

A band-1 close-up on the detail arm builds its parent (the world sheet) and itself, so its terrain costs about the sum of the two columns. Command: `node out/844/measure/time-terrain.ts` from the design-844 worktree.
