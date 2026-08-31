import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dockLegend, legendSeat, type LegendHome } from "../../src/site/shared/room.ts";
import { GLASS_GAP_REM } from "../../src/site/shared/room-seats.ts";

test("the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + 2rem + 1.4rem)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const m = css.match(/\.corner\.br\.zoomery\s*\{[^}]*right:\s*calc\(var\(--slip-w\)\s*\+\s*([\d.]+)rem\s*\+\s*([\d.]+)rem\)/);
  assert.ok(m, "atelier.css seats the Glass at --slip-w plus two rem terms");
  assert.equal(Number(m[1]) + Number(m[2]), GLASS_GAP_REM, "room-seats.ts's GLASS_GAP_REM drifted from the sheet");
});

// #463: on a phone the legend row (the room's roads out) docks inside the slip so the bottom sheet carries it (#462 ruling 3); on a wide sheet it stands on the stage. One element moves, because the Explorer's roads carry ids the suites and app.ts read, so a second copy is not an option.

test("the legend seats in the slip on a narrow sheet and on the stage on a wide one", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: true }), "slip");
  assert.equal(legendSeat({ narrow: false, hasSlip: true }), "stage");
});

test("a room with no slip keeps its legend on the stage at every width", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: false }), "stage");
  assert.equal(legendSeat({ narrow: false, hasSlip: false }), "stage");
});

function home(): LegendHome & { readonly moves: string[]; readonly legend: { parentElement: object | null; classList: { toggle(c: string, f: boolean): boolean }; inSlip: boolean } } {
  const moves: string[] = [];
  const stageNode = {} as { insertBefore(el: object, before: object | null): void };
  const dockNode = {} as { appendChild(el: object): void };
  const legend = {
    parentElement: stageNode as object | null,
    inSlip: false,
    classList: { toggle(c: string, f: boolean) { if (c === "in-slip") legend.inSlip = f; return f; } },
  };
  stageNode.insertBefore = (el, before) => { moves.push(`stage:${before === null ? "end" : "next"}`); legend.parentElement = stageNode; };
  dockNode.appendChild = () => { moves.push("dock"); legend.parentElement = dockNode; };
  const next = {};
  return { legend, dock: dockNode, stage: stageNode, next, moves };
}

test("docking moves the row into the slip and marks it in-slip; seating it on the stage puts it back before its old neighbour", () => {
  const h = home();
  dockLegend(h, "slip");
  assert.equal(h.legend.parentElement, h.dock, "the row moved into the dock");
  assert.equal(h.legend.inSlip, true, "and wears in-slip");
  dockLegend(h, "stage");
  assert.equal(h.legend.parentElement, h.stage, "the row came back to the stage");
  assert.equal(h.legend.inSlip, false, "and dropped in-slip");
  assert.deepEqual(h.moves, ["dock", "stage:next"], "back in front of the sibling it stood before, never at the end");
});

test("a seat already held moves nothing (a resize storm must not churn the row)", () => {
  const h = home();
  dockLegend(h, "stage");
  dockLegend(h, "stage");
  assert.deepEqual(h.moves, [], "on the stage already: no move");
  dockLegend(h, "slip");
  dockLegend(h, "slip");
  assert.deepEqual(h.moves, ["dock"], "docked once, then left alone");
});

// The legend row's width follows the folio's text extent (placeLegendRow), and a narrower row wraps taller; the fit bounds the sheet by the row's top, so the row is seated first or the fit reads a row that is about to grow (plate read 2026-08-30 on #463: the Print Room's sheet over a freshly wrapped row until the next layout).
// Paper is narrower than the 900px phone query, so the kit's narrow block (the folio clamped to 12.5rem, the tagline hidden) reaches every printed chart room; the print block, later in the sheet, takes both back (skeptic on PR #496).
test("the kit's print block restores the room folio's tagline and width after the phone block has hidden and clamped them", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const narrow = css.indexOf("@media (max-width: 900px)");
  const print = css.indexOf("@media print");
  assert.ok(narrow >= 0 && print > narrow, "the print block follows the phone block, so its equal-specificity rules win");
  const block = css.slice(print);
  assert.match(block, /\.folio-room \.room-name, \.folio-room \.room-tagline\s*\{[^}]*display:\s*block/, "the tagline prints");
  assert.match(block, /\.corner\.folio-room\s*\{[^}]*max-width:\s*none/, "the corner unclamps on paper");
  assert.match(block, /\.folio-room \.room-name\s*\{[^}]*font-size:\s*1\.32rem/, "and the name prints at the corner's own size, not the phone's");
});

test("bindRoom seats the legend row before it fits the sheet", () => {
  const room = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/shared/room.ts"), "utf8");
  const layout = room.slice(room.indexOf("const layout = () => {"), room.indexOf("camera.restore(held);"));
  assert.ok(layout.includes("placeLegendRow(") && layout.includes("fitRoom("), "the layout both seats the row and fits the sheet");
  assert.ok(layout.indexOf("placeLegendRow(") < layout.indexOf("fitRoom("), "the row is seated before the fit reads its top");
});
