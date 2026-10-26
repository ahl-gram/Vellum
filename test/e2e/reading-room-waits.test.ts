import { test } from "node:test";
import assert from "node:assert/strict";
import { rr18Park, rr22MidPlay, SWEEP } from "../../e2e/suites/reading-room/colophon.ts";
import { rr31StripStands, rr35GoverningBudget, rr37Envelope, WIDE } from "../../e2e/suites/reading-room/desk.ts";
import { DESK, stripRead, type Room as DeskRoom, type Strip } from "../../e2e/suites/reading-room/reads.ts";
import { emulations, lastSent, recordingSuite, timeline, type Stage } from "../../test-support/recording-suite.ts";

const strip = (h: number, gutter: string): Strip => ({
  position: "fixed",
  top: 900 - h,
  bottom: 0,
  h,
  toldAbove: true,
  toldHidden: false,
  toldDisplay: "flex",
  gutter,
  text: "the told row",
});
const DESK_ROOM: DeskRoom = {
  page: 900,
  vh: 900,
  chartW: 1100,
  chartH: 851,
  ratio: 1158 / 1500,
  fillsSheet: true,
  topClear: 20,
  bottomClear: 20,
};

test("RR31 and RR35 read the strip straight after the scroll and each range move, and pause for nothing, since the page handles both inside the evaluate that makes them", async () => {
  const gutters = ["1059", "day 3", "1059"];
  const run = recordingSuite((expression) => (expression === stripRead ? strip(100, gutters.shift() ?? "1059") : null));
  await rr31StripStands(run.ctx, strip(100, "1059"), DESK_ROOM);
  await rr35GoverningBudget(run.ctx, strip(100, "1059"));
  assert.deepEqual(run.checked, [
    { code: "RR31", ok: true },
    { code: "RR35", ok: true },
  ]);
  assert.deepEqual(run.slept, [], "RR31 or RR35 paused after an action the page handles at once");
});

type Wide = { iw: number; ih: number; sheet: number[] | null; strip: Strip | null };
type DeskRead = { iw: number; ih: number; sheet: number[] | null };
const DESK_SHEET = [122.17, 144.73, 740.27, 571.45];
const NARROW_SHEET = [40, 60, 600, 463.2];
const wideAt = (iw: number, h: number, sheet: number[]): Wide => ({ iw, ih: 900, sheet, strip: strip(h, "day 3") });
const deskStage = (rested: boolean): Stage<DeskRead> => ({
  phases: [
    [2, { iw: 768, ih: 900, sheet: [5, 5, 5, 5] }],
    [2, { iw: 1440, ih: 900, sheet: NARROW_SHEET }],
  ],
  rest: rested ? { iw: 1440, ih: 900, sheet: DESK_SHEET } : { iw: 1440, ih: 900, sheet: NARROW_SHEET },
});
const envelopeRun = ({ reaches900 = true, backAtDesk = true }: { reaches900?: boolean; backAtDesk?: boolean } = {}) => {
  const widths = timeline<Wide>([
    { phases: [], rest: wideAt(1440, 100, DESK_SHEET) },
    { phases: [[2, wideAt(1440, 100, DESK_SHEET)]], rest: wideAt(1024, 126, [30, 60, 640, 494]) },
    {
      phases: [[2, wideAt(1024, 126, [30, 60, 640, 494])]],
      rest: reaches900 ? wideAt(900, 126, [35, 60, 620, 478.6]) : wideAt(1024, 126, [30, 60, 640, 494]),
    },
    { phases: [[2, wideAt(900, 126, [35, 60, 620, 478.6])]], rest: wideAt(768, 126, NARROW_SHEET) },
  ]);
  const desk = timeline<DeskRead>([
    { phases: [], rest: { iw: 768, ih: 900, sheet: NARROW_SHEET } },
    deskStage(backAtDesk),
  ]);
  const run = recordingSuite((expression, sent) => {
    if (expression === WIDE) return widths.next(emulations(sent));
    if (expression === DESK) return desk.next(emulations(sent) - 3);
    return null;
  });
  return { ...run, envelope: () => rr37Envelope(run.ctx, strip(100, "day 3")) };
};

test("RR37 reads each width's strip only once the window reads that width, and hands back only once the room has laid out again at 1440x900", async () => {
  const { envelope, checked, said, slept } = envelopeRun();
  await envelope();
  assert.deepEqual(checked, [{ code: "RR37", ok: true }]);
  const deskReads = said.filter((e) => e === DESK).length;
  assert.equal(deskReads, 6, "RR37 handed back before the room laid out again at 1440x900, or kept reading after");
  assert.deepEqual([...new Set(slept)], [50], "RR37 paused other than to poll");
});

test("RR37 times out naming the width when the window never reaches it, and puts the desk's window back", async () => {
  const { envelope, sent } = envelopeRun({ reaches900: false });
  await assert.rejects(envelope(), (err: Error) => err.message.startsWith("settle timeout RR37 the strip at 900: "));
  assert.deepEqual(lastSent(sent)?.params, { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
});

test("RR37 times out naming the desk when the room never lays out again at 1440x900", async () => {
  const { envelope } = envelopeRun({ backAtDesk: false });
  await assert.rejects(envelope(), (err: Error) =>
    err.message.startsWith("settle timeout RR37 the room laid out again at 1440x900: "),
  );
});

test("RR18 reads the park straight after the range is driven to it and pauses for nothing, since the bar's input and change are handled inside that evaluate", async () => {
  const run = recordingSuite((expression) =>
    expression.includes("__vellumReadingRoomAges")
      ? {
          ages: { chamber: "ages", year: 1059 },
          play: "Play",
          panelHidden: false,
          hash: "#seed=42&year=1059",
          entries: 5,
          inked: 5,
        }
      : null,
  );
  await rr18Park(run.ctx);
  assert.deepEqual(run.checked, [
    { code: "RR18", ok: true },
    { code: "RR19", ok: true },
  ]);
  assert.deepEqual(run.slept, [], "RR18 paused after the range move");
});

const playRun = (sweeps: boolean) => {
  const sweep = { played: false, reads: 0, atRead: null as number | null };
  const u = (): number => (sweep.played && sweeps && sweep.reads > 2 ? 0.01 * sweep.reads : 1);
  const run = recordingSuite((expression) => {
    if (expression === SWEEP) {
      if (sweep.played) sweep.reads++;
      return { u: u() };
    }
    if (expression.includes(".rr-read")) {
      sweep.atRead = u();
      return null;
    }
    if (expression.includes('.rf-play").click()')) {
      sweep.played = true;
      return null;
    }
    if (expression.includes("return{label")) return { label: "Pause" };
    return {
      seed: 42,
      title: "The Isle of Rahai",
      status: "",
      chamber: "ages",
      play: "Play",
      entries: 5,
      inked: 5,
    };
  });
  return { ...run, sweep, rr22: () => rr22MidPlay(run.ctx) };
};

test("RR22 presses Read only once the sweep Play started is under way", async () => {
  const { rr22, checked, sweep } = playRun(true);
  await rr22();
  assert.deepEqual(checked, [{ code: "RR22", ok: true }]);
  assert.ok(sweep.atRead !== null && sweep.atRead !== 1, `Read was pressed before the sweep moved: u ${sweep.atRead}`);
});

test("RR22 times out naming the sweep when Play never starts it", async () => {
  const { rr22 } = playRun(false);
  await assert.rejects(rr22(), (err: Error) => err.message.startsWith("settle timeout RR22 the sweep under way: "));
});
