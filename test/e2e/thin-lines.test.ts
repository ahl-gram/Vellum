import { test } from "node:test";
import assert from "node:assert/strict";
import {
  thinFootFaults,
  thinTopFaults,
  type Span,
  type ThinLine,
  type ThinLines,
} from "../../e2e/suites/stage/thin-lines.ts";

// The fixtures are the probe's reads on the build of Issue #1076's plan, handbook/plans/1000/1076/1076-plan.md, Tests T1 to T3, and of its revision 1, handbook/plans/1000/1076/1076-r1-plan.md, Tests T14 to T18.
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
  assert.deepEqual(thinTopFaults(EXPLORER, false), []);
  const above = reads({
    trail: [59.40625, 75.40625],
    lines: [
      line("a row the probe mounts a", 23),
      line("Vellum", 67),
      line("The Explorer", 67),
      line("the chart of the atelier", 67),
    ],
  });
  assert.equal(thinTopFaults(above, false).length, 3);
  const under = reads({ ...EXPLORER, lines: [...EXPLORER.lines, line("a row the probe mounts u", 49)] });
  assert.equal(thinTopFaults(under, false).length, 1);
  const bare = reads({ ...EXPLORER, lines: EXPLORER.lines.filter((l) => !l.t.startsWith("the chart of the atelier")) });
  assert.equal(thinTopFaults(bare, false).length, 1);
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
  assert.deepEqual(thinTopFaults(PROSPECT, true), []);
  const under = reads({ ...PROSPECT, lines: [...PROSPECT.lines, line("a row the probe mounts u", 71)] });
  assert.equal(thinTopFaults(under, true).length, 1);
  const bare = reads({ ...PROSPECT, lines: PROSPECT.lines.filter((l) => l.row !== 38) });
  assert.equal(thinTopFaults(bare, true).length, 1);
  const over = reads({ ...PROSPECT, also: [10, 20], lines: PROSPECT.lines.map((l) => ({ ...l, row: 14 })) });
  assert.equal(thinTopFaults(over, true).length, 1);
});

test("thinTopFaults faults a head with no trail at all", () => {
  assert.equal(thinTopFaults(reads({ lines: EXPLORER.lines }), false).length, 1);
});

test("thinFootFaults keeps the title's foot within FOOT_WINDOW above the page's foot", () => {
  assert.deepEqual(thinFootFaults(reads({ title: [780.703125, 798.703125] })), []);
  assert.equal(thinFootFaults(reads({ title: [775.703125, 793.703125] })).length, 1);
  assert.equal(thinFootFaults(reads({ title: [783, 801] })).length, 1);
  assert.equal(thinFootFaults(reads({ title: null })).length, 1);
});

const ON_TRAIL: readonly ThinLine[] = [
  line("Today", -10),
  line("Vellum", 14),
  line("The Explorer", 14),
  line("The Prospect", 14),
  line("the chart of the atelier", 14),
];
const aliasAt = (row: number): ThinLine[] => [line("also reached from", row), line("The Reading Room", row)];
const prospect = (also: Span | null, lines: readonly ThinLine[]): ThinLines =>
  reads({ trail: [6.40625, 22.40625], also, lines });

test("thinTopFaults faults the Prospect's alias line gone, hidden, or standing 200 px under the trail", () => {
  assert.equal(thinTopFaults(prospect(null, ON_TRAIL), true).length, 1);
  assert.equal(thinTopFaults(prospect([0, 0], ON_TRAIL), true).length, 2);
  assert.equal(thinTopFaults(prospect([222.40625, 235.40625], [...ON_TRAIL, ...aliasAt(229)]), true).length, 2);
});

test("thinTopFaults faults a thin top line that wraps: the trail, the alias line, or the chart of the atelier press onto a row of its own", () => {
  const trailWraps = reads({
    trail: [6.40625, 51.40625],
    also: [60.203125, 73.203125],
    lines: [
      line("Today", -10),
      line("Vellum", 14),
      line("The Explorer", 30),
      line("The Prospect", 45),
      line("the chart of the atelier", 14),
      ...aliasAt(67),
    ],
  });
  assert.equal(thinTopFaults(trailWraps, true).length, 2);
  const aliasWraps = prospect(
    [31.203125, 57.203125],
    [...ON_TRAIL, line("also reached from", 38), line("The Reading Room", 51)],
  );
  assert.equal(thinTopFaults(aliasWraps, true).length, 2);
  const atelierRow = prospect(
    [44.203125, 57.203125],
    [
      ...ON_TRAIL.filter((l) => !l.t.startsWith("the chart of the atelier")),
      line("the chart of the atelier", 29),
      ...aliasAt(51),
    ],
  );
  assert.equal(thinTopFaults(atelierRow, true).length, 4);
  const explorerTrail = reads({
    trail: [6.40625, 35.40625],
    lines: [line("Vellum", 14), line("The Explorer", 29), line("the chart of the atelier", 14)],
  });
  assert.equal(thinTopFaults(explorerTrail, false).length, 1);
  const explorerAtelier = reads({
    trail: [6.40625, 22.40625],
    lines: [line("Vellum", 14), line("The Explorer", 14), line("the chart of the atelier", 29)],
  });
  assert.equal(thinTopFaults(explorerAtelier, false).length, 2);
});

test("thinTopFaults reads an alias line only in the room that has one", () => {
  assert.equal(thinTopFaults(PROSPECT, false).length, 2);
  assert.equal(thinTopFaults(EXPLORER, true).length, 1);
});

test("thinFootFaults faults a chart folio title that wraps onto two or three rows, reading only the folio's lines on screen", () => {
  const folio = (title: Span, rows: readonly number[]): ThinLines =>
    reads({
      title,
      lines: [
        ...rows.map((r) => line("The Isle of Rahai · Char", r, "chart folio")),
        line("surveyed in the year 105", 807, "chart folio"),
        line("island · temperate · dra", 826, "chart folio"),
      ],
    });
  assert.deepEqual(thinFootFaults(folio([780.703125, 798.703125], [790])), []);
  assert.equal(thinFootFaults(folio([744.703125, 798.703125], [754, 772, 790])).length, 1);
  assert.equal(thinFootFaults(folio([762.703125, 798.703125], [772, 790])).length, 1);
});

test("thinTopFaults keeps the thin top line's foot within main's 48 px ceiling, faulting an alias line 4 px lower or the whole line 6 px lower", () => {
  assert.equal(thinTopFaults(prospect([35.203125, 48.203125], [...ON_TRAIL, ...aliasAt(42)]), true).length, 1);
  const lower = reads({
    trail: [12.40625, 28.40625],
    also: [37.203125, 50.203125],
    lines: [
      line("Today", -10),
      line("Vellum", 20),
      line("The Explorer", 20),
      line("The Prospect", 20),
      line("the chart of the atelier", 20),
      ...aliasAt(44),
    ],
  });
  assert.equal(thinTopFaults(lower, true).length, 1);
});
