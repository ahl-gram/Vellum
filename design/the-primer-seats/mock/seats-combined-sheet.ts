// Issue #1248 round, after the sitting: one contact sheet of the ruled directions drawn together, today first in each pair, every measured figure in a caption read from combined/measure/. Shot with the main checkout as the served root, with a probe of its laid-out width.
// node out/1248/mock/seats-combined-sheet.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUT } from "./seats-paths.ts";
import { cell, esc, fig, MAIN, page, row } from "./seats-sheet-kit.ts";
import { probeOf, shoot } from "./seats-shoot.ts";

const BD = "../combined/measure/BD-rooms.md";
const CE = "../combined/measure/C-explorer.md";
const AH = "../combined/measure/A-home.md";
const rm = (room: string, w: string, arm: string, col: number): string => cell(BD, (c) => c[0] === room && c[1] === w && c[2] === arm, col).replace(" UNDER", "");
const s = (f: string): string => `combined/shots/${f}`;
const W = 2260;
const body = `<h2>A, home: slimmer presses, the Gallery moored anew, the Reading Room's label lifted</h2>
${row(fig(s("A-today-1024.png"), 680, "<b>Today, 1024.</b>"), fig(s("A-ruled-1024.png"), 680, `<b>Ruled, 1024.</b> No station under the row, the Glass or past the edge; the Reading Room's label ${esc(cell(AH, (c) => c[0] === "A-ruled-1024", 5))} px above the row, its nearest town mark ${esc(cell(AH, (c) => c[0] === "A-ruled-1024", 7))}.`), fig(s("A-ruled-1280.png"), 680, "<b>Ruled, 1280.</b>"))}
${row(fig(s("A-ruled-1024-2x.png"), 1040, "<b>Ruled, 1024, twice the size</b>: the lifted label over Noloatatani's name."), fig(s("A-ruled-card-1024.png"), 680, "<b>Ruled, the Primer's card open</b>, the ruled words."))}
<h2>B, the trail press on its own line, the Print Room wrapping where it must, the Ribbon and the Gallery (1024)</h2>
${row(fig(s("B-print-room-today-1024-2x.png"), 1040, `<b>The Print Room today.</b> Gap to the corner ${rm("/print-room/", "1024", "today", 5)} px; chart ${rm("/print-room/", "1024", "today", 9)}.`), fig(s("B-print-room-ruled-1024-2x.png"), 1040, `<b>The Print Room ruled.</b> Gap ${rm("/print-room/", "1024", "ruled", 5)} px, under the 25.6 the spec keeps; chart ${rm("/print-room/", "1024", "ruled", 9)}.`))}
${row(fig(s("B-ribbon-ruled-1024-2x.png"), 1040, `<b>The Ribbon ruled.</b> Gap ${rm("/ribbon/", "1024", "ruled", 5)} px; chart ${rm("/ribbon/", "1024", "ruled", 9)}, as today.`), fig(s("B-gallery-ruled-1024.png"), 680, `<b>The Gallery ruled.</b> First row ${esc(rm("/gallery/", "1024", "ruled", 12))} (today ${esc(rm("/gallery/", "1024", "today", 12))}).`))}
<h2>The fixes drawn for the 25.6 px and the Gallery's row</h2>
${row(fig(s("B-print-room-ruled-dots-1024-2x.png"), 1040, `<b>The nav's dots at 0.3em, every room.</b> The Print Room's gap ${rm("/print-room/", "1024", "ruled, dots tightened", 5)} px, the Ribbon's ${rm("/ribbon/", "1024", "ruled, dots tightened", 5)}, the Portfolio's ${rm("/explorer/portfolio/", "1024", "ruled, dots tightened", 5)}.`), fig(s("B-print-room-ruled-floor-1024-2x.png"), 1040, `<b>The corner's floor at 18.8rem, three rooms.</b> Gaps ${rm("/print-room/", "1024", "ruled, floor lowered", 5)}, ${rm("/ribbon/", "1024", "ruled, floor lowered", 5)} and ${rm("/explorer/portfolio/", "1024", "ruled, floor lowered", 5)} px.`))}
${row(fig(s("B-print-room-ruled-navtight-1024-2x.png"), 1040, `<b>The nav tightened as item 3's B, every room.</b> The Print Room's gap ${rm("/print-room/", "1024", "ruled, nav tightened as item 3's B", 5)} px.`), fig(s("B-gallery-ruled-reserve-1024.png"), 680, `<b>The Gallery reserving the press's line.</b> First row ${esc(rm("/gallery/", "1024", "ruled, its first row reserves the press's line", 12))}.`))}
<h2>D, the nav's end over the working panel in the Writing Room and Today (1024)</h2>
${row(fig(s("B-writing-room-ruled-1024-2x.png"), 1040, `<b>The Writing Room ruled.</b> ${esc(rm("/writing-room/", "1024", "ruled", 12))}; the nav ends at ${rm("/writing-room/", "1024", "ruled", 15)}, the panel starts at ${esc(rm("/writing-room/", "1024", "ruled", 16))}.`), fig(s("B-writing-room-ruled-navtight-1024-2x.png"), 1040, `<b>With the nav tightened as item 3's B.</b> The nav ends at ${rm("/writing-room/", "1024", "ruled, nav tightened as item 3's B", 15)}.`))}
${row(fig(s("B-seed-of-the-day-ruled-1024-2x.png"), 1040, `<b>Today's room ruled.</b> ${esc(rm("/seed-of-the-day/", "1024", "ruled", 12))}.`), fig(s("B-seed-of-the-day-ruled-navtight-1024-2x.png"), 1040, "<b>With the nav tightened as item 3's B.</b>"))}
<h2>C, the Explorer: the press on its own line and the slim note under it</h2>
${row(fig(s("C-today-1280.png"), 680, `<b>Today, 1280.</b> Chart ${esc(cell(CE, (c) => c[0] === "C-today-1280", 1))}.`), fig(s("C-note-alone-1280.png"), 680, `<b>The note alone.</b> Chart ${esc(cell(CE, (c) => c[0] === "C-note-alone-1280", 1))}.`), fig(s("C-press-and-note-1280.png"), 680, `<b>Press and note.</b> Chart ${esc(cell(CE, (c) => c[0] === "C-press-and-note-1280", 1))}.`))}
${row(fig(s("C-press-and-note-1024.png"), 680, `<b>Press and note, 1024.</b> Chart ${esc(cell(CE, (c) => c[0] === "C-press-and-note-1024", 1))} (today ${esc(cell(CE, (c) => c[0] === "C-today-1024", 1))}).`), fig(s("C-depth-6-presses-1024.png"), 680, `<b>Six presses deep, 1024.</b> The press ${esc(cell(CE, (c) => c[0] === "C-depth-6-presses-1024", 2))}; the note ${esc(cell(CE, (c) => c[0] === "C-depth-6-presses-1024", 3))}.`), fig(s("C-depth-6-presses-1280.png"), 680, `<b>Six presses deep, 1280.</b> The note ${esc(cell(CE, (c) => c[0] === "C-depth-6-presses-1280", 3))}.`))}`;
const html = page("The ruled directions, together", "Rulings 1 with 2 on home, 3 with 4 in the Print Room, the Ribbon and the Gallery, 3 with 5 in the Explorer, and 3 with the ninth nav item in every room, drawn together at the design tree's b6a77459, seed 42, reduced motion. Every figure from <code>combined/measure/</code>.", body, W);
mkdirSync(join(OUT, "combined", "sheets"), { recursive: true });
writeFileSync(join(OUT, "combined", "sheets", "sheet-combined.html"), html);
const [r] = shoot("../combined/measure/sheet", [{ url: "/out/1248/combined/sheets/sheet-combined.html", width: W, height: 1000, mobile: false, out: join(OUT, "combined", "sheets", "sheet-combined.png"), waitMs: 1500, full: true, probe: "document.documentElement.scrollWidth" }], MAIN);
const sw = Number(probeOf<number>(r!));
if (sw > W) throw new Error(`the sheet lays out ${sw} px wide`);
console.log(`sheet-combined: scrollWidth ${sw} at ${W}`);
