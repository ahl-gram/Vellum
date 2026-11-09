import { test } from "node:test";
import assert from "node:assert/strict";
import { rr18Park, rr22MidPlay, SWEEP } from "../../e2e/suites/reading-room/colophon.ts";
import { rr31StripStands, rr35GoverningBudget } from "../../e2e/suites/reading-room/desk.ts";
import { stripRead, type Room as DeskRoom, type Strip } from "../../e2e/suites/reading-room/reads.ts";
import { recordingSuite } from "../../test-support/recording-suite.ts";

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
