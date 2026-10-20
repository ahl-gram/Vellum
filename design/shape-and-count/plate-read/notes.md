# Issue #849 plate read of out/844 (mock pages), 2026-10-19

Built from `.claude/worktrees/design-844/dist` (read only), driven through CDP with `start()` from `e2e/harness.ts`. Scripts in `work/`; raw numbers in `measurements.json`, `tab-measure.json`, `sheet-widths.json`, `small-geometry.json`; images in `shots/`. Console errors 0, 4xx 0 on every run. Ink is sampled from 3x screenshots: ground = modal pixel, ink = the pixel of greatest contrast against it. Every sampled ink pixel equals the computed `color`, so the sample and the token pair agree to the pixel.

## 1. Contrast under the ink (identical at 1024 and 1440)
| item | ink on ground | ratio | floor | verdict |
|---|---|---|---|---|
| body labels (shape, islands, sea level, sizes), 13.6px | #6b5a40 on #f4ecd8 | 5.64 | 4.5 | PASS |
| readouts "seed's choice", "about 20" | same | 5.64 | 4.5 | PASS |
| islands note (D14), 13.12px | same | 5.64 | 4.5 | PASS |
| stood note, 13.12px | #6a593f on #f8f1e0 | 5.99 (antialias p95 5.9) | 4.5 | PASS |
| "held" (both) | #6b5a40 on #f8f1e0 | 5.90 | 4.5 | PASS |
| selected seal "alike" | #f2e8cf on #4a3826 | 9.14 | 4.5 | PASS |
| `.land-end` "few"/"many"/"more land"/"calm"/"lobed", 11.52px, panel | #857257 on #f4ecd8 | 3.93 | 4.5 | FAIL |
| `.land-end` inside the stood box | #857257 on #f8f1e0 | 4.11 | 4.5 | FAIL |
| untouched islands thumb | #857257 on #f4ecd8 | 3.93 | 3 | PASS |
| touched thumb | #4a3826 on #f4ecd8 | 9.46 | 3 | PASS |
| slider unfilled track (native, every slider today) | #efefef on #f4ecd8 | 1.02 | 3 | FAIL, pre-existing, not the mock's |

The designer's token numbers are confirmed. The end-word failure is today's kit (today's "more land" word measures the same 3.93), and the mock's "few"/"many" inherit it. Select text on the shape row was not sampled (my probe hit a hidden option node); UNVERIFIABLE here.

## 2. Slip foot against the Drawer tab, 1024 by 900 (tab 979..1024 x 700..876; slip right edge 992, slip is above the tab, z 20 over 19)
- today: slip bottom 711. Overlap 12.8 x 10.9 px (corner). The tab's text starts y 731, so 0 px of text covered.
- with rows (continent, stood, rows seated): slip bottom 878. Overlap 12.8 x 176 px: the tab's whole height, a 12.8 px strip of its 45 px width (28%). The first text column (x 988..1002) loses 4 of 14 px over its full 114 px run.
- plain rows (state a): slip bottom 822, overlap 12.8 x 121.6.
- Also at 1024 by 768 today: overlap 12.8 x 142.9 (tab 568..744, slip bottom 711), so today already covers 4 px of the first text column there; with rows 12.8 x 176. Files: `shots/tabcrop-*-1024x900.png`, `shots/tabcrop-*-1024x768.png` (2x), `shots/geo-*.png`.
The overlap exists today at both heights; the rows grow it from 10.9 to 176 px at 900. `tab-measure.json`.

## 3. Slip scroll, scroller is `.slip-body` (the designer's probe read it too)
| 1024 x | state | content / box (px) | scrolls |
|---|---|---|---|
| 768 | today | 451 / 451 | no |
| 768 | rows plain | 562 / 486 | 76 px |
| 768 | rows counted archipelago | 620 / 486 | 134 px |
| 768 | rows, continent, note + stood | 642 / 486 | 156 px |
| 900 | today | 451 / 451 | no |
| 900 | rows plain | 562 / 562 | no |
| 900 | counted | 620 / 618 | 2 px |
| 900 | continent | 642 / 618 | 24 px |
At 768 the slip box is 599 tall (bottom 746) and the Hand panel's lower rows sit below the fold in every rows state; `shots/geo-d-1024x768.png`.

## 4. 640 wide
Desktop window 640 by 900 (CDP, mobile false): `scrollWidth` 1024, `clientWidth` 640, max scroll 384 = 1024 - 640 (FL1 holds); after scrolling right the slip's page-left is 608, as at 1024, today and mock alike. The mock adds no overflow. Slip is off screen at scroll 0 (only its left 32 px shows). Phone-style 640 by 900 (mobile true): lays out 1024, scale 0.625, slip 608,147,384x599, desk notice shown. Files: `shots/w640-desk-{today,a,d}-scroll0.png`, `-scrollright.png`, `shots/w640-mobile-{today,d}.png`.

## 5. sheet-small-sizes.png (3336 x 1124) and pages/small.html
Rendered widths: 537, 382, 170 (scale 0.358, 0.255, 0.113 of the 1500 viewBox). Effective type size: place labels (10.5) 3.8 / 2.7 / 1.2 px; region (13) 4.7 / 3.3 / 1.5 px; chart title (27) 9.7 / 6.9 / 3.1 px; smallest (8.5) 3.0 / 2.2 / 1.0 px. So no label is legible at any of the three sizes (the live gallery card and drawer cutting are the same); the row judges shape and mass only. In the render: Texas hard cut-out reads as Texas at 537, 382 and 170; the soft likeness reads as a blob with mainland and island; asked-20 reads as discs at 537/382 and as a speckle at 170, asked-100 is texture at 170. The png is 3336 wide, so shown to fit a screen (about 0.6x) its 12.5px captions fall to roughly 7px; open it at 1:1 (`shots/small-*-1to1*.png`, `small-170-row-3x-first2.png` are the crops). The 382 and 170 rows fill 2362 and 1090 px of the 3336, leaving the right 29% and 67% of those rows empty.

## 6. Contact sheet widths against shot widths
All 26 contact pages (1680, 1724, 1592, 1686, 3336) and all 224 distinct plate pages (1040) were loaded at their shot widths: `scrollWidth` equals `clientWidth` on every one (0 px of sideways scroll), and no image failed to load. PNG dimensions equal shot width. Table: `sheet-widths.json`.

## 7. Folio wrap defect: CONFIRMED, not 1024-specific
Live Explorer seed 5: the folio title `p.folio-title` is in `.chrome.corner.bl.folio`, `max-width: 384px`. Line 1 "The Sundered Reaches of Brelde · Chart №" is 371 px wide, then "5" (8 px) wraps to line 2: box 384 x 36, two lines. Identical at 1024x900, 1024x768, 1280x800 and 1440x900 (the width is the cap, not the window). Seeds 30, 1, 2, 42 stay on one line (323, 373, 254, 286 px). Chart-number-only orphan occurs when a title reaches about 375 px. Not introduced by the mock; the mock (state d, seed 5) shows it. `shots/folio-live-seed5-1024.png`, `-crop2x.png`; designer's `explorer/defect-folio-wrap-1024.png` matches.

## Not measurable here
Shape select text contrast (UNVERIFIABLE, probe error); real-device range-thumb rendering (headless Chrome's native thumb only); the drawer cutting at 170 is the designer's reading, not live.
