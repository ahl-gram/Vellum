# The Sub 7 / Sub 8 room mockups (#462, #463)

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
