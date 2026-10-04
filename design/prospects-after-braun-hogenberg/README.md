# Prospects after Braun and Hogenberg

The design round for Issue #747, ruled on 2026-10-04 (issuecomment-5980850979 for the sitting, issuecomment-5980975988 and issuecomment-5980991888 for the lettering), and built by Issue #753: Issue #754 builds direction E and Issue #755 builds direction C.

- `stills/`: the contact sheets (`sheet-*.png`, the capital's first), the full-scale and 2x crop stills, and the 72 plate SVGs. That is today's plate as the control, then directions A to E, in the antique and ink dresses, for five places: four at seed 42, with the capital drawn twice (once before its founding, at An. 400), and one at seed 26.
- `lib-spike/`: the library spike Alex ruled from. IM Fell DW Pica and Cormorant Garamond lettering are converted to outlines with opentype.js, and roughjs gives a hand-drawn stroke. It holds the stills, the plates, `README.md` with the measured sizes, and the code as it ran. The third-party bundles and `node_modules` are not committed.
- `mock/`: the code that drew the round, as it ran. It ran from a worktree and wrote to the main checkout's `out/747/`, so its paths, `mock/sheets/shots.json` and `shots-result.json` name that layout. Replaying them as committed would write over the main checkout's `out/747/`.
- `refs/`: `NOTES.md`, the plate-by-plate reading of 21 Civitates Orbis Terrarum plates, and `refs.json`, their Wikimedia Commons links. By `refs.json`'s own licence fields, 16 are public domain, 4 are CC0 and 1 is CC BY-SA 3.0 (Venice, `Venetia_1572.jpg`). `NOTES.md`'s "public-domain or CC0" and the round's earlier "public-domain" both miss that one.
- `dump-world.ts` and `sweep-sites.ts`: the measurements behind the choice of places.

What the archive leaves out, on purpose:
- The 21 scans and their detail crops, as Issue #747 ruled. `NOTES.md` still names the crops (`crops/`, `genoa-mole-ships.jpg`, `toledo-hills-hatch.jpg`).
- The scans' fetch script, which `NOTES.md` and `mock/README.md` name as `fetch-refs.py`: it carries a personal contact address.

Corrections to the committed stills, which stay as they were ruled:
- **The small-sizes sheet:** `stills/sheet-small-sizes.png` cuts plate E's right 22px at the 352px column. The page lays out 2222px wide and the shot was 2200. `stills/sheet-small-sizes-uncut.png` is the same page re-shot at 2300px by the plate reader on PR #756.
- **The Voorea caption:** it says Voorea is "the only inland hill village in seeds 1 to 40". The round's own `sweep-sites.ts 1 40` finds two: Voorea (seed 26, index 22) and Vlekskin (seed 33, index 20).
- **The sheet captions' face:** the captions name EB Garamond without linking `design/kit/fonts.css`, so they rendered in Iowan Old Style. The plates themselves use the same stack as today's control plate.
