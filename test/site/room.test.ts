import { test } from "node:test";
import assert from "node:assert/strict";
import { dockLegend, legendSeat, type LegendHome } from "../../src/site/shared/room.ts";

// #463: on a phone the legend row (the room's roads out) docks inside the slip so the bottom sheet carries it (#462 ruling 3); on a wide sheet it stands on the stage. One element moves, because the Explorer's roads carry ids the suites and app.ts read, so a second copy is not an option.

test("the legend seats in the slip on a narrow sheet and on the stage on a wide one", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: true }), "slip");
  assert.equal(legendSeat({ narrow: false, hasSlip: true }), "stage");
});

test("a room with no slip keeps its legend on the stage at every width", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: false }), "stage");
  assert.equal(legendSeat({ narrow: false, hasSlip: false }), "stage");
});

// The seat is only a decision until the row moves: a fake stage, dock and row prove the move itself, both ways, and that a second call in the same seat moves nothing.
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
