import { test } from "node:test";
import assert from "node:assert/strict";
import { thinFootFaults, thinTopFaults, type ThinLine, type ThinLines } from "../../e2e/suites/stage/thin-lines.ts";

// The fixtures are the probe's reads on the build of Issue #1076's plan, handbook/plans/1000/1076/1076-plan.md, Tests T1 to T3.
const line = (t: string, row: number, piece = "cluster"): ThinLine => ({ piece, t, row });
const reads = (over: Partial<ThinLines>): ThinLines => ({
  innerH: 800,
  trail: null,
  also: null,
  title: null,
  lines: [],
  ...over,
});

const EXPLORER: ThinLines = reads({
  trail: [6.40625, 22.40625],
  lines: [
    line("Vellum", 14),
    line("The Explorer", 14),
    line("the chart of the atelier", 14),
    line("The rooms", -10),
    line("seed 42", 790, "chart folio"),
  ],
});

test("thinTopFaults keeps the Explorer's trail line and faults a row the head grows above or under it, or a missing atelier press", () => {
  assert.deepEqual(thinTopFaults(EXPLORER), []);
  const above = reads({
    trail: [59.40625, 75.40625],
    lines: [
      line("a row the probe mounts a", 23),
      line("Vellum", 67),
      line("The Explorer", 67),
      line("the chart of the atelier", 67),
    ],
  });
  assert.equal(thinTopFaults(above).length, 2);
  const under = reads({ ...EXPLORER, lines: [...EXPLORER.lines, line("a row the probe mounts u", 49)] });
  assert.equal(thinTopFaults(under).length, 1);
  const bare = reads({ ...EXPLORER, lines: EXPLORER.lines.filter((l) => !l.t.startsWith("the chart of the atelier")) });
  assert.equal(thinTopFaults(bare).length, 1);
});

const PROSPECT: ThinLines = reads({
  trail: [6.40625, 22.40625],
  also: [31.203125, 44.203125],
  lines: [
    line("Vellum", 14),
    line("The Explorer", 14),
    line("The Prospect", 14),
    line("the chart of the atelier", 14),
    line("also reached from", 38),
    line("The Reading Room", 38),
  ],
});

test("thinTopFaults keeps the Prospect's alias line under the trail", () => {
  assert.deepEqual(thinTopFaults(PROSPECT), []);
  const under = reads({ ...PROSPECT, lines: [...PROSPECT.lines, line("a row the probe mounts u", 71)] });
  assert.equal(thinTopFaults(under).length, 1);
  const bare = reads({ ...PROSPECT, lines: PROSPECT.lines.filter((l) => l.row !== 38) });
  assert.equal(thinTopFaults(bare).length, 1);
  const over = reads({ ...PROSPECT, also: [10, 20], lines: PROSPECT.lines.map((l) => ({ ...l, row: 14 })) });
  assert.equal(thinTopFaults(over).length, 1);
});

test("thinTopFaults faults a head with no trail at all", () => {
  assert.equal(thinTopFaults(reads({ lines: EXPLORER.lines })).length, 1);
});

test("thinFootFaults keeps the title's foot within FOOT_WINDOW above the page's foot", () => {
  assert.deepEqual(thinFootFaults(reads({ title: [780.703125, 798.703125] })), []);
  assert.equal(thinFootFaults(reads({ title: [775.703125, 793.703125] })).length, 1);
  assert.equal(thinFootFaults(reads({ title: [783, 801] })).length, 1);
  assert.equal(thinFootFaults(reads({ title: null })).length, 1);
});
