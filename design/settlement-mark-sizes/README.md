# Settlement mark sizes

The design round for Issue #1104, "Settlement marks keep one size at every depth: a farmstead outdraws a town and a capital is barely larger than either". It was drawn by `vellum-designer` on 2026-10-30 from real engine output at `108f8db6`, and ruled at Alex's sitting the same day. The rulings are Issue #1104 comment 6527643605 (issuecomment-6527643605). The build that follows is Issue #1104 itself, which this archive's pull request leaves open.

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`), and the round's own multipliers and rates are the designer's stand-ins until a ruling says otherwise.

## What is in the archive

- `notes.md`: the designer's notes. They name what to look at first, the measurement of how the Explorer scales a close-up, the three ladders and the grown sizes in tables, the places and why they were chosen, and what a builder must be faithful to and what is NOT ruled. `notes.md` names files this archive leaves out (below); those names are dangling here, as the round's own page was.
- `stills/`: every contact sheet the sitting ruled from (`sheet-descent.png`, `sheet-explorer.png`, `sheet-specimen.png`, `sheet-aelegwei.png`, `sheet-fiela.png`, `sheet-vyrna.png`, `sheet-leal.png`, `sheet-key.png`, `sheet-atlas.png`, `sheet-world.png`) and the Explorer frames one to one, `explorer-aelegwei-<direction>.png` with a `-held.png` beside each, for today (`untouched` and `today`) and for ladders A, B and C, A and B grown.
- `pages/`: the contact pages and the shot lists and results the shooter wrote. Their relative links to `../svg/` do not resolve here, as in the earlier archives, because `svg/` is not kept. The pages still show their layout and their captions.
- `mock/`: the spike that drew the round, as it ran: the Node resolve hook (`hooks.ts`) that swaps three engine modules for copies differing only by a per-tier multiplier (`marks-variant.ts`, `settlements-variant.ts`, `legend-icons-variant.ts`), the ladders (`ladder.ts`), the places (`places.ts`), the page writers (`build.ts`, `sheets.ts`, `specimen.ts`), the Explorer frame script (`explorer-frames.ts`) and `control-proof.ts`. It ran from the designer's tree and wrote to the main checkout's `out/1104/`, so its paths name that layout, and replaying it as committed would write over that folder.
- `sweep-windows.ts` and `measure/`: the scripts that chose the places and measured the round (`seat-spacing.ts`, `pair-windows.ts`, `covered-marks.ts`, `gap-rule.ts`, `explorer-scale.ts`) and their outputs: `explorer-scale-*` (the premise measurement at 1024 by 768, 1280 by 800 and 1728 by 1117, open and folded), `control-proof-*.json` (the copies draw today's marks byte for byte at multiplier 1), `build-facts.json` (the sizes and the digests), `covered-marks.txt`, `gap-rule.txt` and the seat-spacing tables.

One rename, kept in the open: the delivery's `sheets/` folder is `pages/` here, as in the earlier archives. `notes.md` (its "The code, as it ran" section), `mock/build.ts` (`SHEETS`) and `mock/explorer-frames.ts` still say `sheets/`, so those names dangle in the archive.

What the archive leaves out, on purpose:

- **`svg/`:** the 75 engine SVGs, one per direction, place, band and dress, about 26 MB. The kept contact sheets are the stills the sitting ruled from, and the engine plus the round's code under `mock/` regenerate the SVGs.
- **The probe shots in `measure/`:** the 52 `explorer-<size>-k<zoom>.png` and `atlas-*.png` captures, about 48 MB. Their numbers are in the `explorer-scale-*-result.json` files and in `notes.md`.
- **The sitting's page:** the delivery's generated `index.html` linked `svg/` and `stills/`, so it would not resolve here. This README replaces it.

## The rulings, as ruled

Issue #1104 comment 6527643605. Each is the option Alex chose, labelled as the menu worded it, followed by the comment's gloss:

1. **Sizes:** "B: great made greater (Recommended)". Capitals and seats half as big again (capital 9.7 px on screen at the deepest zoom, 1280 by 800, three times a town). Towns and villages as today. Farmsteads and mills tiny, 1.7 px, below the village.
2. **Depth:** "Grow with depth (Recommended)". Each band draws the marks about a quarter bigger than the band above, about 3.2 times by the deepest; the pop at each landing softens. The rate is the designer's stand-in and is not ruled.
3. **Which sheets:** "Close-ups only (Recommended)". No regeneration; the committed charts do not move. It still reaches the atlas's two regional plates, which are close-ups. Every sheet is left as a possible later issue.
4. **The key:** "Key keeps ladder sizes (Recommended)". The key keeps the ladder's world-sheet sizes under grow, so it is tidy, at the cost of a key mark smaller than the same mark on a deep close-up.

These are feel rulings, provisional until Alex has used the result live.

## What the round found that corrects the issue text

- **A change to every sheet is not a re-roll.** The issue's third item says it would move the golden `1792806240`. `test/world/golden-seed42.test.ts` hashes `w.realms.labels` only, so it does not. Every sheet would still mean regenerating the committed charts, in their own pull request (comment 6527643605 records the correction).
- **The Explorer already holds a mark's size per band.** At each band's own depth the close-up fills exactly the box the world sheet fills at rest, so a mark stands on screen at its world-sheet size at every band (`measure/explorer-scale-*`). Between bands it grows with the camera, 1.5 times at 3 and at 24 times, and when the next band lands it drops to about 0.81 times; that pop is what growth with depth softens. The sheet stands 537, 703 and 1114 px wide at 1024 by 768, 1280 by 800 and 1728 by 1117; the issue's "about 832 px" matches none.

## What the stills show that was NOT ruled

Every item is a stand-in the designer picked to make the picture (`notes.md`, "For whoever builds it"), and a later build is not held to any of them.

- **Every multiplier** of the ladders, the 3.6 and 3.2 for the farmstead and the mill, and the grow rate of 1.26 per band.
- **The gap between a name and its mark**, grown by the mark's growth and left at today's where a mark shrinks. The builder owes a rule here; without one a doubled castle sits on its own name.
- **Strokes and the seat halo scaling with the mark.**
- **Ruins** keep today's mark in every direction; whether a ruin follows its tier is not drawn.
- **The key under grow and under ladder C**, drawn two ways in `sheet-key.png`; ruling 4 chose the ladder's sizes.
- **Nautical close-ups**, which cannot be drawn truthfully: close-ups are redrafted in antique only (`regionEligible` in `src/site/explorer/app.ts`), so nautical appears only on world sheets and in the specimen.
- **The size the Chart Table drawer and the Portfolio display a gathered survey at**, UNVERIFIABLE.
- **The mill footprint under growth:** a grown mill's wheel outgrows the land block it is placed on (`MARK_FOOTPRINT` in `src/society/farmsteads.ts`, held by `test/society/farmsteads-ground.test.ts`), so the footprint must grow, which moves some mills and farmsteads on close-ups.

## Known and not caused by the round

- Marks under the cartouche or the key on close-ups (chart 56's village Aeleiril and two farmsteads, chart 84's town Liomiomere) are the case `handbook/errata/engine.md` records and Alex ruled on 2026-10-23, "leave them faded under the panel".
- Chart 84's mill Talair stands 4 sheet px from the capital Leal, mark on mark, which `handbook/specs/region-and-voyage.md` allows for a farm nearer a seated harbour town than the spacing.
- No kit defect was neutralised in any mock.
