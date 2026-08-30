# The Sub 7 / Sub 8 room mockups (#462, #463, #494)

The visual SPEC for Landfall Act II's rooms, built and ruled 2026-08-28. Six pages in the
atelier-map dress worn by a room: the four **chart rooms** (Today, Explorer, Reading Room,
Print Room: the chart full-bleed on the deep, the room's h1 and its one control top-right, the
working panel on a right-hand slip, the roads out as the legend row, the Glass at the chart's
corner) and the two **document rooms** (Q & A, Glossary: the broadside sheet beside an index
slip that inks the section being read, the sheet taking the width when the index folds).

**The rulings live as dated comments on #462** (two sittings, 2026-08-28: eleven chart-room
rulings, six document-room rulings, the spec-recon re-baseline) with cross-references on #461,
#463 and #454. This directory is the pixels those rulings were made from, archived per the
atelier-map precedent (PR #466). The guide beyond the atelier-map mockup was the map-first site
that inspired the homepage (awwwards, New World Map): the chart is the room, everything else is
an instrument held to the edges.

## Regenerating and looking

```
node design/sub7-chart-rooms/build.mjs     # writes the six self-contained pages beside this README
node design/sub7-chart-rooms/shoot.mjs "file://$PWD/design/sub7-chart-rooms/today.html|1280|800|0|out/today.png" \
  "file://$PWD/design/sub7-chart-rooms/today.html|390|844|1|out/today-390.png"
```

The pages embed the charts as data URIs (chart 42 from `../atelier-map/`, today's seed 20260829
rendered by the CLI) and load the three faces from Google Fonts, so they open from `file://`.
`shoot.mjs` drives headless Brave over CDP with real device metrics, because `--window-size`
does not set the layout viewport (a 390 shot must LAY OUT at 390). `dump.ts` regenerates
`today.json` (the world's title, blurb, clues, annals and a survey log) from the engine.
`faq-main.html` and `glossary-main.html` are the built pages' bodies the document rooms recompose.

`stills/` holds the ruled renders, palette-quantized to 256 colours for the repo (the
originals are in the session's `out/462-mockups/`): every room at 1280, the Explorer at 1680,
the Q & A scrolled and folded, and true-390 phone renders with the sheet closed and open.

## The #494 round (Sub 8 parts 3/4 and 4/4), built 2026-08-30

Three more pages in the same dress, from chart 42's own plates (`dump-plates.ts` writes the
prospect of the capital, the road unrolled from it, `plates.json` and the atlas's eleven plates
to `out/494-plates/`; `shoot.mjs` rasterizes those into `plates-42/` for the slip's thumbnails):

- **`print-room-bound.tpl.html`**, the Print Room with the atlas BOUND. One page, three candidate
  seats for the bound atlas, chosen by `?seat=`: **d** (the default, and RULED 2026-08-30 in Alex's
  words: "same as d, but still display the thumbnails inside the panel; clicking one swaps it out
  for the one on the stage"): the atlas turns on the stage, the plates stay as thumbnails under
  their contents rows, a thumbnail or an entry is a turn, and the plate on the sheet is inked;
  **b**: the plates in the slip's body with the proof kept on the stage (not chosen); **a**: nothing
  on screen, the contents ink in and Print / Download work from the hidden document (not chosen). Seat c (a
  scrolling document below the stage) is not mocked: it is the page as it stands today, and a
  chart room does not scroll (chart-room rulings 1, 7 and 9).
- **`prospect.tpl.html`**, the Prospect as a chart room: the engraving full-bleed at twice its
  plate size, the year as the room's one control (the page's own `year` address key, which has
  no control today), the engraver's note on the slip (the place's lore, the plate's lettered key).
- **`ribbon.tpl.html`**, the Wayfarer's Ribbon as a chart room: the scroll full-bleed, the journey
  (setting out from, bound for, Turn about) as the top-right row, the itinerary league by league
  on the slip in the instrument's dated-row idiom. On a phone the journey row moves into the sheet.

Stills: `print-room-bound-{a,b,d}-1280`, `print-room-bound-d-1280-turned` (the panel scrolled to the
inked entry), `print-room-bound-d-390` (closed and `-open`), `prospect-1280`,
`prospect-1280-folded`, `prospect-390` (closed and `-open`), `ribbon-1280`, `ribbon-1280-leaned` (the Glass at
2.6x on the first strip), `ribbon-390` (closed and `-open`). The seat switch is a query string, not a hash: a
hash-only change is a same-document navigation and the shooter's second job would inherit the
first job's body class.

```
node design/sub7-chart-rooms/dump-plates.ts   # the engine content (writes SVGs beside this README and to out/494-plates/)
node design/sub7-chart-rooms/build.mjs
node design/sub7-chart-rooms/shoot.mjs "file://$PWD/design/sub7-chart-rooms/print-room-bound.html?seat=b|1280|800|0|out/bound-b.png"
```

## Known demo-only shortcuts

- The pages are static recompositions: the chart pans and zooms, the slips fold, the index
  inks and the Glossary's find box filters, but Draw, Play, the hunt and the presses do nothing.
- `shared.css` carries the chart stage's `.sheet` box; `doc.css` overrides it for the document
  sheet. The real build has no such collision (the stage and the survey sheet are different
  pages).
- The nav links point at the private artifact previews in `urls.json`; a cold session may
  replace them with the live rooms.

This is an archived design artifact, not shipping code, which is the stated reason it holds
`.js`/`.mjs` outside `src/` (the workspace one-pipeline rule). Nothing here is served, bundled,
or swept by the site's CSS guards. Do not edit this folder to match the site; the fidelity arrow
points the other way.
