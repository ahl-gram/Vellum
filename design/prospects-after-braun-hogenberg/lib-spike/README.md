# Issue #747 library spike

Self-contained: its own `package.json` and `node_modules` (nothing installed into the shared tree). Run from the design-747 worktree: `node /Users/ahl/CodeProjects/Vellum/out/747/lib-spike/run.ts`, then `node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/747/lib-spike/shots.json --site /Users/ahl/CodeProjects/Vellum/out/747`.

Two libraries were tried on direction E's capital plate (seed 42, Laukuwelua), in both dresses:

1. **opentype.js 1.3.4 (MIT)** with a period face from fontsource (OFL 1.1): the plate's `<text>` runs are converted to glyph outlines, so the lettering no longer depends on the fonts a device has. Two faces were compared: **IM Fell DW Pica** (a 1600s face, the Civitates' own era) and **Cormorant Garamond Medium + Cormorant SC Medium** (a clean Garamond). `letter.ts` does the conversion in two forms, inline paths and per-glyph `<defs>` with suffixed ids and `<use>`.
2. **roughjs 4.6.6 (MIT)**: every stroked path gets a seeded hand-drawn wobble (`roughen.ts`).

Files: `sheet-lib-spike.png` (the contact sheet), `full-e-*.png` (1040 px), `crop-*-cartouche.png`, `crop-*-key.png`, `crop-*-figures.png` (2x), the SVGs `e-{today,fell,cormorant,rough}-{antique,ink}.svg`, `sizes.json`, `bundle-*.min.js` (esbuild measurements), `probe*.mjs` (coverage, outline weight and glyph-table measurements), `shots.json` and `shots-result.json`.

## What was measured (2026-10-04)

| | today's E | E + Cormorant (defs) | E + Fell DW Pica (defs) | E + roughjs |
|---|---|---|---|---|
| plate SVG, antique | 146,314 B (30.6 KB gz) | 213,114 B (53.1 KB gz) | 519,047 B (188.4 KB gz) | 660,219 B (280.5 KB gz) |
| same, inline paths instead of defs | | 401,292 B | 1,549,207 B | |
| distinct glyphs defined | | 75 | 75 | |
| extra render time per plate | | 19 to 32 ms | 4 to 12 ms | 19 ms |
| text runs converted | 29 | 29 | 29 | 417 paths wobbled |

- Bundle cost if opentype.js ships: 177,260 B minified, 49,709 B gzipped (esbuild, browser platform), plus the three woff files it parses: Cormorant 91 KB (31.4 + 33.2 + 26.7 KB), Fell 220 KB (72.7 + 79.1 + 67.8 KB). opentype.js reads woff via `tiny-inflate`; it does not read woff2.
- Alternative with no library at runtime: convert printable ASCII plus the middle dot for the three faces at build time and commit the table. Cormorant: 288 glyphs, 174 KB of literal path data and 1,548 kerning pairs; Fell: 288 glyphs, 1,109 KB and 3,785 pairs. The Fell outlines are five times denser than Cormorant's (1,442 path commands for "A a e n 4" against 293), which is what makes every Fell number large.
- roughjs bundle: 27,383 B minified, 9,168 B gzipped.
- The live prospect bundle's baseline size is UNVERIFIABLE here: `public/prospect/app.bundle.js` is not built in this checkout.

## The guard (`test/prospect/dress.test.ts`, libm-free and clock-free)

- **opentype.js**: 13 regex hits in its distribution, all `Math.log` and `Math.pow`. Every one sits in the font writer (`searchRange`, `entrySelector`, CFF `offSize`), in integer `log2` helpers for table directories (`| 0`), in the checksum (`% Math.pow(2, 32)`) or in the bezier bounding-box helper. The three functions the lettering calls (`Glyph.prototype.getPath`, `Font.prototype.forEachGlyph`, `Path.prototype.toPathData`) use only `Math.round`: integer font units times `fontSize / unitsPerEm`, rounded. So the OUTPUT is platform-stable arithmetic. The guard itself scans `src/prospect/` and would not see a library, so the honest claim is "the glyph path is libm-free by construction", not "the guard proves it". No clock anywhere. Node runs it with no build step (plain CommonJS, imported from the `.ts` spike directly).
- **roughjs**: 32 `Math.sin`, 32 `Math.cos`, 1 `Math.tan`, 9 `Math.pow`, 5 `Math.random` in `rough.esm.js`. The seed option makes it repeatable on one machine, but the trig drifts across libms and the plates render at runtime per world, so there is no build step to confine it to. It fails the guard, and it quadruples the plate because curves become polylines.

## What the pictures show

- Both faces read as engraved lettering; Fell adds the period flavour (old-style figures, slightly irregular edges) and Cormorant the cleaner Garamond. Compare `crop-fell-cartouche.png`, `crop-cormorant-cartouche.png` and `crop-today-cartouche.png`, and the key crops. The biggest practical gain is device independence: today's plate sets the Iowan stack as `<text>`, which falls to Palatino or Georgia on a device without Iowan, and a plate shown as a blob `<img>` cannot load web fonts at all.
- The faces carry no U+2116, so "№ 42" is spelled "No. 42" in the lettered plates.
- roughjs: `crop-rough-figures.png` beside `crop-today-figures.png`. Charming on the figures and the strapwork, muddy on the hatching and the sky lines.
