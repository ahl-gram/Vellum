# Issue #950 mock pages: plate-read measurements

Read through CDP (desktop metrics, mobile false, each page at the width its own viewport meta declares, then at 1440 for the sideways check) against the main checkout served on 8811/8812, 2026-10-22. Raw data: 950-probe.json (21 pages), 950-probe2.json (index, tilted cutting, loupe), 950-label-check.txt (556 figures).

## Layout (declared width = clientWidth = scrollWidth)
All 20 mock pages: scrollWidth equals clientWidth at their declared width (dress 2204, lines 2304, overview 2398, place 2575, surfaces 1736). No figure, caption or .cells grid ends right of the viewport (largest caption right edge 24px inside it). Page height of every fresh render equals its committed PNG (width and height identical, 20 of 20). At a 1440 window the five page widths scroll sideways by design (2204 to 2575 wide): scrollWidth 1440 only for index.html.
## Fonts
IM Fell English SC, IM Fell English and EB Garamond 400/600 italic faces: status loaded, document.fonts.check true, and CDP getPlatformFontsForNode reports custom fonts for h1, .lede, .meta, figcaption, h2, body on the capital place page (no system fallback). EB Garamond 700 stays unloaded (nothing uses it). index.html (generated delivery page) names the faces but links no @font-face: 0 faces, rendered in system Iowan Old Style.
## Images
Mock pages: 0 broken, 0 distorted images over 556 figure images. The 6 "distorted" flags per surfaces page are the Chart Table cutting rotated -2deg: its bounding box is 176.1 x 138.8, its layout box 169.594 x 130.891 (aspect 1.2957 against natural 1.2953). Loupe: 244px box (240 + 2px border) covered by a 1666 x 1286 image, aspect 1.2955. index.html: 939 images, 0 broken once lazy loading is forced, 0 distorted; 990 distinct links, 0 missing.
## Arm labels against what each row shows
556 figures checked (label or row heading against the arm, band, held factor and dress in the plate's file name): 0 inconsistent. Arms present: today, A, B (after the chain), Binside, B0 (without the cut), tier, held16, held24.
## Legibility
Page text: smallest caption 13px (index 14.4px), smallest text contrast 8.34:1 (index 6.58:1); no caption overflows its box. The plates' own text is the limit: the SVGs are 1500 units wide with legend entries 10.5, key heading 9.5, legend note 8.5, chart-number 9. Effective px = units x shown width / 1500: place sheets 833px (x0.555): key 5.8px, note 4.7px; dress 420px: key 2.9px; lines 440px: 3.1px; overview 380px: 2.7px; surfaces 537px: 3.8px. So the key on the dress, lines and overview plates is not legible at 1:1 (it is not on the live Explorer either at these sizes beyond ~5.8px); place sheets show it small but the words read in crops/950-place-capital-42-laukuwelua-1to1-figure.png.
## Console and network
0 console errors and 0 4xx on every page.
## Small things seen
Held-sheet captions on the place pages read "...v 0.32813 to 0.45313. . <i>..." (a stray empty sentence).
