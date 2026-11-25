# Item 3: the Print Room's corner beside a ninth nav item, measured

The real built rooms at b6a77459, reduced motion, the ninth item "Primer" before Q & A where an arm says so, the built page laid out again after it went in (`node out/1248/mock/seats-print.ts` from the design tree). Each arm is read twice: as the room opens (seed 42, antique) and holding the widest thing each control can show (seed 4294967295, the largest a seed can be, and "topographic"). A control is cut when its box is narrower than what it shows needs: the style list against a one-option clone of itself at its natural width, the seed box against the measured width of its digits and its padding, a press against its own words. "Gap" is the corner's left edge less the head cluster's right edge, which the top row holds at the kit's `--chrome-x`, 25.6 px. The chart column is the drawn chart's box, the room's fit. Every result came back with no 4xx and no console error.

| arm | width | holding | nav width | nav lines | gap | corner width | corner height | control rows | controls (px) | cut | chart |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control-eight-items | 1024 | seed 42, antique | 589 | 1 | 26 | 358 | 109 | 1 | pr-seed 87, pr-random 29, pr-style 97, pr-draw 122 | none | 499 by 385 |
| control-eight-items | 1024 | widest | 589 | 1 | 26 | 358 | 109 | 1 | pr-seed 87, pr-random 29, pr-style 97, pr-draw 122 | **pr-seed "4294967295" needs 98 in 87**; **pr-style "topographic" needs 112 in 97** | 499 by 385 |
| control-eight-items | 1280 | seed 42, antique | 589 | 1 | 240 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | none | 602 by 465 |
| control-eight-items | 1280 | widest | 589 | 1 | 240 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | **pr-seed "4294967295" needs 98 in 105** | 602 by 465 |
| control-ninth-item | 1024 | seed 42, antique | 645 | 1 | 23 | 304 | 109 | 1 | pr-seed 63, pr-random 19, pr-style 75, pr-draw 122 | **pr-style "antique" needs 84 in 75** | 499 by 385 |
| control-ninth-item | 1024 | widest | 645 | 1 | 23 | 304 | 109 | 1 | pr-seed 63, pr-random 19, pr-style 75, pr-draw 122 | **pr-seed "4294967295" needs 98 in 63**; **pr-style "topographic" needs 112 in 75** | 499 by 385 |
| control-ninth-item | 1280 | seed 42, antique | 645 | 1 | 183 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | none | 602 by 465 |
| control-ninth-item | 1280 | widest | 645 | 1 | 183 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | **pr-seed "4294967295" needs 98 in 105** | 602 by 465 |
| a-controls-on-two-lines | 1024 | seed 42, antique | 645 | 1 | 23 | 304 | 147 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | none | 451 by 348 |
| a-controls-on-two-lines | 1024 | widest | 645 | 1 | 23 | 304 | 147 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | **pr-seed "4294967295" needs 98 in 111** | 451 by 348 |
| a-controls-on-two-lines | 1280 | seed 42, antique | 645 | 1 | 183 | 400 | 147 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | none | 554 by 428 |
| a-controls-on-two-lines | 1280 | widest | 645 | 1 | 183 | 400 | 147 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | **pr-seed "4294967295" needs 98 in 111** | 554 by 428 |
| a2-wrap-only-where-it-must | 1024 | seed 42, antique | 645 | 1 | 23 | 304 | 147 | 2 | pr-seed 116, pr-random 38, pr-style 133, pr-draw 122 | none | 451 by 348 |
| a2-wrap-only-where-it-must | 1024 | widest | 645 | 1 | 23 | 304 | 147 | 2 | pr-seed 116, pr-random 38, pr-style 133, pr-draw 122 | **pr-seed "4294967295" needs 98 in 116** | 451 by 348 |
| a2-wrap-only-where-it-must | 1280 | seed 42, antique | 645 | 1 | 183 | 400 | 109 | 1 | pr-seed 99, pr-random 38, pr-style 116, pr-draw 122 | none | 602 by 465 |
| a2-wrap-only-where-it-must | 1280 | widest | 645 | 1 | 183 | 400 | 109 | 1 | pr-seed 99, pr-random 38, pr-style 116, pr-draw 122 | **pr-seed "4294967295" needs 98 in 99** | 602 by 465 |
| b-nav-tightened | 1024 | seed 42, antique | 584 | 1 | 26 | 363 | 109 | 1 | pr-seed 89, pr-random 30, pr-style 99, pr-draw 122 | none | 499 by 385 |
| b-nav-tightened | 1024 | widest | 584 | 1 | 26 | 363 | 109 | 1 | pr-seed 89, pr-random 30, pr-style 99, pr-draw 122 | **pr-seed "4294967295" needs 98 in 89**; **pr-style "topographic" needs 112 in 99** | 499 by 385 |
| b-nav-tightened | 1280 | seed 42, antique | 584 | 1 | 245 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | none | 602 by 465 |
| b-nav-tightened | 1280 | widest | 584 | 1 | 245 | 400 | 109 | 1 | pr-seed 105, pr-random 36, pr-style 113, pr-draw 122 | **pr-seed "4294967295" needs 98 in 105** | 602 by 465 |
| c-dice-in-the-seed-box | 1024 | seed 42, antique | 645 | 1 | 23 | 304 | 109 | 2 | pr-seed 88, pr-random 27, pr-style 79, pr-draw 122 | **pr-seed "42" needs 57 in 88**; **pr-style "antique" needs 84 in 79** | 499 by 385 |
| c-dice-in-the-seed-box | 1024 | widest | 645 | 1 | 23 | 304 | 109 | 2 | pr-seed 88, pr-random 27, pr-style 79, pr-draw 122 | **pr-seed "4294967295" needs 119 in 88**; **pr-style "topographic" needs 112 in 79** | 499 by 385 |
| c-dice-in-the-seed-box | 1280 | seed 42, antique | 645 | 1 | 195 | 388 | 109 | 2 | pr-seed 132, pr-random 27, pr-style 118, pr-draw 122 | none | 602 by 465 |
| c-dice-in-the-seed-box | 1280 | widest | 645 | 1 | 195 | 388 | 109 | 2 | pr-seed 132, pr-random 27, pr-style 118, pr-draw 122 | **pr-seed "4294967295" needs 119 in 132** | 602 by 465 |
| d-style-under | 1024 | seed 42, antique | 645 | 1 | 40 | 287 | 151 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | none | 445 by 344 |
| d-style-under | 1024 | widest | 645 | 1 | 40 | 287 | 151 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | **pr-seed "4294967295" needs 98 in 111** | 445 by 344 |
| d-style-under | 1280 | seed 42, antique | 645 | 1 | 296 | 287 | 151 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | none | 549 by 424 |
| d-style-under | 1280 | widest | 645 | 1 | 296 | 287 | 151 | 2 | pr-seed 111, pr-random 38, pr-style 118, pr-draw 122 | **pr-seed "4294967295" needs 98 in 111** | 549 by 424 |
| ribbon-control-ninth-item | 1024 | seed 42, antique | 645 | 1 | 23 | 304 | 167 | 2 | rb-swap 114 | none | 554 by 387 |
| ribbon-control-ninth-item | 1024 | widest | 645 | 1 | 23 | 304 | 167 | 2 | rb-swap 114 | none | 554 by 387 |
| ribbon-b-nav-tightened | 1024 | seed 42, antique | 584 | 1 | 26 | 363 | 167 | 2 | rb-swap 114 | none | 554 by 387 |
| ribbon-b-nav-tightened | 1024 | widest | 584 | 1 | 26 | 363 | 167 | 2 | rb-swap 114 | none | 554 by 387 |
| prospect-b-nav-tightened | 1024 | seed 42, antique | 584 | 1 | 93 | 296 | 108 | 3 | year-label 86, pp-year 104, pp-engrave 90 | none | 569 by 420 |
| prospect-b-nav-tightened | 1024 | widest | 584 | 1 | 93 | 296 | 108 | 3 | year-label 86, pp-year 104, pp-engrave 90 | none | 569 by 420 |
| explorer-b-nav-tightened | 1024 | seed 42, antique | 584 | 1 | 126 | 263 | 108 | 1 | seed 140, random 38, draw 69 | none | 473 by 365 |
| explorer-b-nav-tightened | 1024 | widest | 584 | 1 | 126 | 263 | 108 | 1 | seed 140, random 38, draw 69 | none | 473 by 365 |
