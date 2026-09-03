# The screenshot oracle sweep (#465 body item 2)

`node design/oracle/sweep.mjs <dist-dir> <out-dir> [label]` serves a built `dist/` and shoots every
route at 1280x800 desktop and a true 390x844 phone (CDP device metrics, never `--window-size`): the
content pages full page, the app surfaces as head-box clips (their live SVG never byte-compares),
the Specimen Book as the viewport. It pins the Explorer's "drawn in NNNms" caption before each shot
and writes a `manifest.json` beside the PNGs. A `.mjs` here on the `design/sub7-chart-rooms/shoot.mjs`
precedent: a review instrument, not site code.

Comparing two builds: shoot the unchanged build TWICE first (main-1, main-2) and prove every pair
`magick compare -metric AE a b null:` reads 0; then shoot the branch and compare against main-2.
Trust only 0 against nonzero; locate a change with `-fuzz 1%` and a trimmed diff's bounding box.
Two traps, both measured 2026-09-03 on the first sweep: `captureBeyondViewport` drops a chart room's
bottom-left fixed furniture, so it is used for the scrolling full pages alone; and the ink-in
ceremony's compositor layer rasterizes text differently by timing, so a residual on a corner's
control row with identical geometry is anti-aliasing, and shooting with
`prefers-reduced-motion: reduce` on both builds settles it.
