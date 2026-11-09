import { test } from "node:test";
import assert from "node:assert/strict";
import { rr26BareVisit, rr29Play } from "../../e2e/suites/reading-room/arrival.ts";
import {
  rr17CounterRead,
  rr18Park,
  rr20Superseded,
  rr22MidPlay,
  SWEEP,
} from "../../e2e/suites/reading-room/colophon.ts";
import { rr31StripStands, rr35GoverningBudget } from "../../e2e/suites/reading-room/desk.ts";
import { readingRoomKit } from "../../e2e/suites/reading-room/kit.ts";
import { stripRead, type Room as DeskRoom, type Strip } from "../../e2e/suites/reading-room/reads.ts";
import { recordingSuite, type Checked } from "../../test-support/recording-suite.ts";

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

const HIDDEN = { hidden: true, src: "", alt: "", href: null, inSlip: true, aboveLog: true, belowBar: false };
const NEW_PLATE = {
  hidden: false,
  src: "blob:plate",
  alt: "a plate",
  href: "/prospect/#seed=42&style=antique&i=0&year=1059",
  inSlip: true,
  aboveLog: true,
  belowBar: false,
};
const SETTLED = {
  seed: 42,
  title: "The Isle of Rahai",
  status: "",
  svg: true,
  hash: "#seed=42&style=antique&year=1059",
};
const isBare = (e: string) => e.includes(".rr-prospect") && e.includes("__vellumReadingRoomState");
const isStage = (e: string) => e.includes(".rr-prospect") && !e.includes("__vellumReadingRoomState");
const row = (checked: readonly Checked[], code: string) => checked.find((c) => c.code === code);

const rr26Run = (stage: object | null, plate: string | null) =>
  recordingSuite((e) => (isBare(e) ? { stage, plate } : isStage(e) ? stage : null));

const counterRun = (o: { askedAfterRead: string | null; askedAfterPlay: string | null }) => {
  let played = false;
  return recordingSuite((e) => {
    if (e.includes('.rf-play").click();return null')) played = true;
    const stage = played ? NEW_PLATE : HIDDEN;
    if (isBare(e)) return { stage, plate: played ? o.askedAfterPlay : o.askedAfterRead };
    if (isStage(e)) return stage;
    if (e.includes("__vellumReadingRoomState")) return SETTLED;
    return null;
  });
};

const rr29Run = (asked: string | null) =>
  recordingSuite((e) => (isBare(e) ? { stage: NEW_PLATE, plate: asked } : isStage(e) ? NEW_PLATE : null));

const rr20Run = (polls: readonly object[], lands: number) => {
  let n = 0;
  return recordingSuite((e) => {
    if (e.includes("location.hash")) return { ...SETTLED, lands };
    if (e.includes("__vellumReadingRoomState")) return polls[Math.min(n++, polls.length - 1)];
    return null;
  });
};

test("RR26 reads the stage once the room has settled and pauses for nothing, since the stage names any plate it was asked for at the ask", async () => {
  const run = rr26Run(HIDDEN, null);
  await rr26BareVisit(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR26"), { code: "RR26", ok: true });
  assert.deepEqual(run.slept, [], "RR26 watched the stage for a while instead of reading what it was asked for");
});

test("RR26 fails a hidden stage that was asked for a plate, since that plate is on its way", async () => {
  const run = rr26Run(HIDDEN, "22:1039");
  await rr26BareVisit(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR26"), { code: "RR26", ok: false });
});

test("RR26 fails when the stage is missing, never reading an absent stage as bare", async () => {
  const run = rr26Run(null, null);
  await rr26BareVisit(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR26"), { code: "RR26", ok: false });
});

test("the counter read checks RR17, RR28 and RR28b, reading the stage once after the draw and pausing for nothing", async () => {
  const run = counterRun({ askedAfterRead: null, askedAfterPlay: "0:1059" });
  await rr17CounterRead(readingRoomKit(run.ctx));
  assert.deepEqual(run.checked, [
    { code: "RR17", ok: true },
    { code: "RR28", ok: true },
    { code: "RR28b", ok: true },
  ]);
  assert.deepEqual(run.slept, [], "RR28 watched the stage for a while instead of reading what it was asked for");
});

test("RR28b fails when the stage, with Play's plate up, says it was asked for none", async () => {
  const run = counterRun({ askedAfterRead: null, askedAfterPlay: null });
  await rr17CounterRead(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR28b"), { code: "RR28b", ok: false });
});

test("RR29 fails when the stage, with Play's plate up, says it was asked for none", async () => {
  const run = rr29Run(null);
  await rr29Play(readingRoomKit(run.ctx));
  assert.deepEqual(run.checked, [{ code: "RR29", ok: false }]);
});

test("RR29 passes when the stage, with Play's plate up, says it was asked for it", async () => {
  const run = rr29Run("0:1059");
  await rr29Play(readingRoomKit(run.ctx));
  assert.deepEqual(run.checked, [{ code: "RR29", ok: true }]);
});

test("RR20 reads the race's outcome as soon as the newer draw has settled and holds no window after it", async () => {
  const run = rr20Run([SETTLED], 1);
  await rr20Superseded(run.ctx);
  assert.deepEqual(run.checked, [{ code: "RR20", ok: true }]);
  assert.deepEqual(run.slept, [], "RR20 held a window after the newer draw settled");
});

test("RR20 fails when the poll sees the stale world's name before the newer draw settles", async () => {
  const run = rr20Run([{ seed: 42, title: "The Isle of Ozonia", status: "Drafting…" }, SETTLED], 1);
  await rr20Superseded(run.ctx);
  assert.deepEqual(run.checked, [{ code: "RR20", ok: false }]);
});

test("RR20 fails when the chart was drawn twice, though the poll never saw the stale world's name", async () => {
  const run = rr20Run([SETTLED], 2);
  await rr20Superseded(run.ctx);
  assert.deepEqual(run.checked, [{ code: "RR20", ok: false }]);
});

test("RR28 fails a counter-drawn stage that is hidden but was asked for a plate, since that plate is on its way", async () => {
  const run = counterRun({ askedAfterRead: "22:1039", askedAfterPlay: "0:1059" });
  await rr17CounterRead(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR28"), { code: "RR28", ok: false });
});

const shownRun = (stage: object) => recordingSuite((e) => (isBare(e) ? { stage, plate: "0:1059" } : null));

test("plateShown keeps polling a stage that is hidden though it still carries a plate's blob src, and gives up after its 160 polls, since a hidden stage keeps its last plate's src", async () => {
  const run = shownRun({ ...NEW_PLATE, hidden: true });
  assert.equal(await readingRoomKit(run.ctx).plateShown(), null);
  assert.deepEqual(
    run.slept,
    Array.from({ length: 160 }, () => 50),
  );
});

test("plateShown keeps polling a shown stage whose src is not a blob, and gives up after its 160 polls", async () => {
  const run = shownRun({ ...NEW_PLATE, src: "http://127.0.0.1:8765/prospect/plate.svg" });
  assert.equal(await readingRoomKit(run.ctx).plateShown(), null);
  assert.deepEqual(
    run.slept,
    Array.from({ length: 160 }, () => 50),
  );
});

test("RR26 reads a stage that is hidden and asked for nothing as bare though it still carries a plate's blob src, since a hidden stage keeps its last plate's src", async () => {
  const run = rr26Run({ ...NEW_PLATE, hidden: true }, null);
  await rr26BareVisit(readingRoomKit(run.ctx));
  assert.deepEqual(row(run.checked, "RR26"), { code: "RR26", ok: true });
});
