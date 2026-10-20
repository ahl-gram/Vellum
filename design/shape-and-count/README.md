# Shape and count

The design round for Issue #849, Sub 0 of Epic Issue #844 (Shape and count): "a Vellum world or a cut-out, and a count you can see". It was drawn by `vellum-designer` on 2026-10-19 from real engine output at `581a6de3`, and ruled at Alex's sitting the same day. The rulings are Issue #844 comment 6281585030 (issuecomment-6281585030), and the premise corrections the round's measurements found are comment 6281585596 (issuecomment-6281585596), which is not a ruling. The subs that build to this round are Issues #850 to #857. Each carries its own re-baseline comment after the sitting, and this README does not restate them.

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`), and the round's own words are the designer's stand-ins until a ruling says otherwise.

## What is in the archive

- `notes.md` and `facts.json`: the designer's notes, which name what to look at first and what was not ruled, and the measured facts of every plate. `notes.md` names files this archive leaves out (below); those names are dangling here, as the round's own page was.
- `overview-shapes.png`, `overview-counts.png` and `overview-types.png`: the three overviews the sitting started from.
- `sheet-*.png`: the contact sheets the sitting ruled from, one case each. Every row is one direction, in four plates: antique world sheet, antique band-1 close-up, ink world sheet and ink close-up. The three shape cases are at their median seeds (the crescent at 17, Texas at 30, Japan at 13, and Japan turned at 13), the counted archipelago at seed 1 with the sunk ground (equal sizes, varied sizes, coast 0.1 and 0.95, and the biting wobble), the three other map types (`sheet-type-*`), the count inside Texas, Texas's close-up at coast 0.1 and 0.95 beside today's, the two border-breach sheets, `sheet-every-dress.png` and `sheet-small-sizes.png`.
- `explorer/`: the Broadside's Land panel as the sitting saw it. Four states at 1024 and 1440 wide, a 2x crop of the Land panel for each, the continent state at the desk frame's 1024 by 768, today's page as the control (`explorer-control-*`), the width sweep from 1024 to 2560, `defect-folio-wrap-1024.png`, and the shot lists and results as the shooter wrote them. The rows were laid onto the live built Explorer by a shot script, and the chart behind each shot is the live engine's draw of that seed, which cannot draw a shape or a count yet.
- `pages/`: the contact pages, the overviews and the plate page that drew the stills, and the shooter's lists and results. Their relative links to `svg/` and `stills/` do not resolve here, as in the earlier archives, because those folders are not kept. `pages/index.html` and the sheets still show their layout and their captions.
- `mock/`: the spike that drew the round, as it ran: the engine's own pipeline with its terrain made pluggable (`terrain.ts`, `make-copies.ts`, `selfcheck.ts`), the outlines (`outlines.ts`), the cases, the page writers, and `mock/explorer/` with the Explorer mock's sheet and shot script. It ran from the designer's tree and wrote to the main checkout's `out/844/`, so its paths name that layout, and replaying it as committed would write over that folder.
- `measure/`: the measurement scripts, and `measurements/` their tables: the shape sweep and its extras, the landmass sweep, the count bands over ten seeds on every type, the count-through-outline arithmetic, the wobble sweep, the terrain cost, the close-up's disagreement with its chart (`region-coast-gap.md`, the Issue #453 class), the words list (`words.md`), `selfcheck.txt` (the spike draws today's dome byte for byte), and three gallery shots.
- `refs/`: `NOTES.md`, what the four Natural Earth files taught, and `refs.json`, their source pages, URLs, sizes, checksums and licence fields. By `refs.json`'s own licence fields all four files are public domain by the terms page (https://www.naturalearthdata.com/about/terms-of-use/), while the mirror repository's own GitHub licence field reads "Other" (NOASSERTION), recorded beside it and not overriding it. The archive holds links and never the data.
- `plate-read/`: the plate reader's run on the mock pages the same day. `notes.md` has the numbers, `measurements.json`, `tab-measure.json`, `sheet-widths.json` and `small-geometry.json` the raw figures, and `work/` the CDP driver scripts as they ran. Its `notes.md` names a `shots/` folder this archive leaves out.

What the archive leaves out, on purpose:

- **`svg/` and `stills/`:** the 618 MB of plate SVGs and the 448 full-scale and 2x-crop stills. The size is the reason. The contact sheets are the stills the sitting ruled from, and the engine and the round's code under `mock/` regenerate the rest. `notes.md` and `facts.json` still name them by id.
- **Eight alternate-seed sheets:** `sheet-texas-8.png`, `sheet-japan-10.png`, `sheet-crescent-11.png` (the 10th-percentile seeds), `sheet-count-12.png` and `sheet-count-35.png` (today's sparsest and densest archipelago), `sheet-example-texas.png` and `sheet-example-100.png` (the epic's two sentences), and `sheet-share-1.png` (why a counted world keeps its share). `notes.md` names all eight, and `facts.json` carries their measured rows.
- **`refs/natural-earth/`:** the four Natural Earth GeoJSON files, as Issue #849 ruled: the archive keeps links and never the data.
- **The plate reader's `shots/`:** its full-scale and 2x captures. Its numbers are all in `plate-read/`.

## The rulings, as ruled

Issue #844 comment 6281585030, Alex's words quoted there. In short:

1. **How the land follows a shape:** a hard cut-out, exactly the shape every time, with an extra slider from exactly the shape through a soft edge and looser to essentially today's island, so the user chooses how far off their Texas is.
2. **How big the shape sits on the sheet:** nearly edge to edge, the designer's 0.06 inset from each side.
3. **Which real places:** any real place the user can think of, from as many countries, states, provinces, lakes and territories as can be named, and combinations of them later. Texas, Japan and the crescent were samples and not the list.
4. **The sunk sea floor between a few counted islands:** kept.
5. **Whether "about N" reads as N:** accepted, as "about".
6. **Round counted islands:** two sliders.
7. **A count on which map types:** the archipelago only.
8. **A count inside a shape:** the pair is refused. No world carries a count with a shape.
9. **The Broadside's Land panel:** the rows as drawn, and the build fixes the crowding.

Not ruled at the sitting, and handed to the planners of the affected subs: how a typed request such as "north like Italy, south like Florida" is read and drawn, and what the two sliders of ruling 6 are named and where the existing coast slider stands beside them.

## What the round found that corrects the issue text

Issue #844 comment 6281585596, summarised from the designer's measurements (`notes.md`, `measurements/`) and the plate reader's. The issue text is not edited, and these stand beside it.

- **The soft likeness spills (Issue #849's D7, "the land share as today").** A soft likeness spills whenever the outline covers less of the sheet than the land share. Texas covers 19% of the sheet against a land share of 34%, and Japan 6% against 24%. Over seeds 1 to 40 the share of land outside the outline is 46% for Texas, 65% for the crescent and 77% for Japan, and drawing Texas's outline larger brings it to 33% (`measurements/shape-sweep.md`, `shape-extras-sweep.md`). The sitting ruled a hard cut-out with a looseness slider instead.
- **The border held over seeds 1 to 3 only (Issue #852's "the border stayed sea in every run").** Over seeds 1 to 10 the sunk ground puts land on the sheet's edge at asked 2 and 5: archipelago asked 2 on seeds 8 and 9, continent asked 2 on 8 of 10 seeds (`sheet-border-archipelago-8.png`, `sheet-border-continent-3.png`). The build keeps big islands off the edge, since `handbook/specs/engine-invariants.md` leans on sea at every border.
- **The D14 bands were measured at the wrong coverage (Issues #849 and #852).** Asked 100 gives island 33 to 46 and continent 10 to 14 when coverage is scaled to the share, but the count sub specifies a fixed 0.30. At fixed coverage it gives island 44 to 66 and continent 14 to 42, and on a sunk continent one landmass holds up to 82% of the land (`measurements/count-types-fixed.md`). The sitting then ruled the count on the archipelago only.
- **The plate reader's figures, in rendered pixels at 1024 and 1440 (`plate-read/notes.md`).** The slider's end words (`.land-end`, 11.52px, #857257) are 3.93:1 on the panel and 4.11:1 in the held box, under the 4.5:1 floor, and today's "more land" measures the same, so it is today's kit. The native unfilled slider track is 1.02:1 against 3:1, also today's kit. The mock's own new text passes (5.64:1 to 9.14:1).
- **The slip crowds (ruling 9's "the build fixes the crowding").** At 1024 by 768 the slip scrolls 76 px with the rows plain, 134 px counted and 156 px with a continent's note and stood box, where today's fits. At 1024 by 900 the slip's foot covers the whole height of the Drawer tab with the rows seated (12.8 by 176 px), where today's corner overlap is 12.8 by 10.9 px.
- **Two defects the round did not cause.** The chart folio orphans the last character of the chart number once its title line nears 375 px (seed 5: "Chart №" and then "5" alone on its own line, the same at every window width because the title carries a 384 px cap, `explorer/defect-folio-wrap-1024.png`), and the Drawer tab is overlapped by the open slip today (12.8 by 10.9 px at 1024 by 900, 12.8 by 142.9 px at 1024 by 768).

## What the stills show that was NOT ruled

Every item is a stand-in the designer picked to make the picture (`notes.md`, "What a builder must be faithful to, and what is NOT ruled"), and a later build is not held to any of them.

- **The 0.14 inner box.** Every outline on the contact sheets is fitted north up into a box inset 0.14 from each edge (`INNER_INSET` in `mock/outlines.ts`). The sitting ruled 0.06, which the sheets show only in the row where the outline is drawn larger (`soft-big`). So the stills do not show the ruled size, and the ruled hard cut-out was not drawn at 0.06.
- **The nudge's two strengths, 0.35 and 0.7**, and **the hard cut-out's floor of -0.05**, just under the lowest the noise reaches (a floor of -5 was tried first and left the land with no towns).
- **The larger fit, inset 0.06,** is the ruled inset, but the row it is drawn in is the soft likeness, which was not ruled.
- **The crescent's proportions.** The ring was not drawn, and the crescent's arcs, Japan's turn and the place projection call `Math.cos`, `Math.sin` or `Math.atan2`, so a build commits their vertices as data and never computes them at draw time.
- **The biting wobble's two numbers,** 1 noise unit across the mean lobe radius and 1.2 lobe radii at full slider, and the lobes' coverage cut to the outline's own share when a count sits inside a shape (a pair the sitting refused).
- **Every word and footnote mark in the Explorer mock:** every label, the end words ("few", "many"), the readouts ("seed's choice", "about 20", "held"), the note texts, the pilcrow and double-bar marks, the stood-down box (cream ground, dashed hairline, a subgrid), and the rows' order and seat after the climate row. Its sheet, `mock/explorer/land-mock.css`, stands in for what the build adds to the Broadside's sheet.
- **The rows crowd the slip.** The control's rows in the mock push the slip past its frame, as the plate reader measured, and the sitting ruled the rows as drawn and the crowding fixed in the build (Issue #854).
- **The designer's own additions,** named in `notes.md` so the sitting could rule on them knowingly: the soft likeness drawn larger, the biting wobble, the epic's two sentences founded both ways, the border-breach sheets, every dress and the small sizes.
- **The second dress is ink,** the designer's call: ink and nautical are the two shipped dresses with no realm tint, and ink drops all colour, so it is the stricter test of whether a shape reads when the tint goes.
- **The close-ups are drawn through the spike,** which hands the close-up every terrain input as Issue #850 will. Today's close-up is drawn beside it as the control at coast 0.1 and 0.95, and across the 100 spike close-ups the disagreement with the chart runs from 0.12% to 2.36%.
