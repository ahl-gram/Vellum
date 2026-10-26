import { test } from "node:test";
import assert from "node:assert/strict";
import {
  br1cLegendClears,
  br5Hover,
  br6Tap,
  CLICKS,
  LEGEND_ROOM,
  MARK,
  NARROW,
  TAPPED,
} from "../../e2e/suites/broadside.ts";
import type { BroadsideKit } from "../../e2e/suites/broadside/kit.ts";
import { emulations, lastSent, recordingSuite, timeline, type Stage } from "../../test-support/recording-suite.ts";

type Box = { l: number; r: number; t: number; b: number; w: number };
const box = (l: number, r: number, t: number, b: number): Box => ({ l, r, t, b, w: r - l });
type LegendRoom = {
  lg: Box;
  bl: Box;
  sl: Box;
  gl: Box;
  sh: Box;
  folioText: number;
  w: number;
  h: number;
  fonts: string;
  moving: boolean;
};
const legendRoom = (w: number, h: number, sheetR: number, lgL: number, over: Partial<LegendRoom> = {}): LegendRoom => ({
  lg: box(lgL, lgL + 300, h - 60, h - 30),
  bl: box(20, 260, h - 120, h - 20),
  sl: box(w - 420, w - 20, 80, h - 20),
  gl: box(w - 500, w - 440, h - 200, h - 120),
  sh: box(40, sheetR, 40, h - 200),
  folioText: 240,
  w,
  h,
  fonts: "loaded",
  moving: false,
  ...over,
});
const AT_1280 = legendRoom(1280, 2263, 700, 300);
const AT_1680 = legendRoom(1680, 900, 1000, 500);
const AT_800 = legendRoom(1280, 800, 650, 320);
const resized = (from: LegendRoom, to: LegendRoom, strayR: number): Stage<LegendRoom> => ({
  phases: [
    [2, { ...from, sh: box(40, strayR, 40, from.h - 200), lg: box(100, 400, from.h - 60, from.h - 30) }],
    [2, { ...to, sh: from.sh, lg: box(100, 400, to.h - 60, to.h - 30) }],
    [2, { ...to, moving: true, lg: box(150, 450, to.h - 60, to.h - 30) }],
  ],
  rest: to,
});
const BOOT: Stage<LegendRoom> = {
  phases: [
    [2, { ...AT_1280, fonts: "loading", lg: box(100, 400, 2203, 2233) }],
    [2, { ...AT_1280, moving: true, lg: box(150, 450, 2203, 2233) }],
  ],
  rest: AT_1280,
};
const legendRun = (stages: readonly Stage<LegendRoom>[]) => {
  const room = timeline(stages);
  const run = recordingSuite((expression, sent) => (expression === LEGEND_ROOM ? room.next(emulations(sent)) : null));
  return { ...run, last: room.last, br1c: () => br1cLegendClears(run.ctx as unknown as BroadsideKit) };
};

test("BR1c reads each size only once the room has laid out there and the legend row has stopped moving, and leaves the room laid out again at the harness's window", async () => {
  const { br1c, checked, sent, last } = legendRun([
    BOOT,
    resized(AT_1280, AT_1680, 777),
    resized(AT_1680, AT_800, 999),
    resized(AT_800, AT_1280, 555),
  ]);
  await br1c();
  assert.deepEqual(checked, [{ code: "BR1c", ok: true }]);
  assert.deepEqual(
    sent.map((s) => s.method),
    [
      "Emulation.setDeviceMetricsOverride",
      "Emulation.setDeviceMetricsOverride",
      "Emulation.clearDeviceMetricsOverride",
    ],
  );
  assert.deepEqual(sent[0]!.params, { width: 1680, height: 900, deviceScaleFactor: 1, mobile: false });
  assert.deepEqual(sent[1]!.params, { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  assert.deepEqual(
    last(),
    AT_1280,
    "BR1c handed the suite back before the room laid out again at the harness's window",
  );
});

test("BR1c times out naming the 1680 layout when the room never lays out at 1680x900, and clears the override", async () => {
  const stuck: Stage<LegendRoom> = { phases: [], rest: { ...AT_1680, sh: AT_1280.sh } };
  const { br1c, sent } = legendRun([BOOT, stuck]);
  await assert.rejects(br1c(), (err: Error) =>
    err.message.startsWith("settle timeout BR1c the room laid out at 1680x900: "),
  );
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR1c times out naming the way back when the window never leaves 1280x800 after the clear", async () => {
  const { br1c } = legendRun([
    BOOT,
    resized(AT_1280, AT_1680, 777),
    resized(AT_1680, AT_800, 999),
    { phases: [], rest: AT_800 },
  ]);
  await assert.rejects(br1c(), (err: Error) =>
    err.message.startsWith("settle timeout BR1c the room laid out again after the override: "),
  );
});

test("BR5 reads the note straight after each real mouse move and pauses for nothing, since the move's own dispatch lands the hover", async () => {
  const run = recordingSuite((expression) =>
    expression.includes("getBoundingClientRect") ? { x: 300, y: 200 } : true,
  );
  await br5Hover(run.ctx as unknown as BroadsideKit);
  assert.deepEqual(run.checked, [{ code: "BR5", ok: true }]);
  assert.deepEqual(run.slept, [], "BR5 paused after a mouse move");
});

type Narrow = { iw: number; ih: number; sheet: Box };
const HARNESS_NARROW: Narrow = { iw: 1280, ih: 2263, sheet: box(40, 700, 40, 2063) };
const TABLET: Narrow = { iw: 1024, ih: 700, sheet: box(30, 520, 40, 500) };
const SEATED = { x: 400, y: 300 };
const tabletRun = ({ laysOut = true, clicks = true }: { laysOut?: boolean; clicks?: boolean } = {}) => {
  const room = timeline<Narrow>([
    { phases: [], rest: HARNESS_NARROW },
    {
      phases: [
        [2, { ...HARNESS_NARROW, sheet: box(5, 5, 5, 5) }],
        [2, { ...TABLET, sheet: HARNESS_NARROW.sheet }],
      ],
      rest: laysOut ? TABLET : { ...TABLET, sheet: HARNESS_NARROW.sheet },
    },
  ]);
  const page = { clicks: 0, pending: Infinity, hit: false, open: false };
  const run = recordingSuite((expression, sent) => {
    if (expression === NARROW) return room.next(emulations(sent));
    if (expression === MARK) return room.last() === TABLET ? SEATED : { x: 100, y: 100 };
    if (expression === CLICKS) {
      if (--page.pending === 0) {
        page.clicks++;
        if (page.hit) page.open = !page.open;
      }
      return { n: page.clicks };
    }
    if (expression === TAPPED) return { stayed: true, open: page.open, hasLink: true };
    return true;
  });
  const touch = (type: string, points: readonly { x: number; y: number }[]): Promise<unknown> => {
    if (type === "touchStart")
      page.hit = JSON.stringify({ x: points[0]!.x, y: points[0]!.y }) === JSON.stringify(SEATED);
    if (type === "touchEnd") page.pending = clicks ? 2 : Infinity;
    return Promise.resolve({});
  };
  const k = { ...run.ctx, touch } as unknown as BroadsideKit;
  return { ...run, br6: () => br6Tap(k) };
};

test("BR6 taps only once the room has laid out at 1024x700, reads each tap only once its click has reached the page, and still leaves a pending navigation its window", async () => {
  const { br6, checked, slept, sent } = tabletRun();
  await br6();
  assert.deepEqual(checked, [{ code: "BR6", ok: true }]);
  assert.equal(slept.filter((ms) => ms === 500).length, 2, "a tap's navigation window went");
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR6 times out naming the tablet's layout when the room never lays out at 1024x700, and gives the window back", async () => {
  const { br6, sent } = tabletRun({ laysOut: false });
  await assert.rejects(br6(), (err: Error) =>
    err.message.startsWith("settle timeout BR6 the room laid out at 1024x700: "),
  );
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});

test("BR6 times out naming the tap's click when no click reaches the page, and gives the window back", async () => {
  const { br6, sent } = tabletRun({ clicks: false });
  await assert.rejects(br6(), (err: Error) => err.message.startsWith("settle timeout BR6 the tap's click: "));
  assert.equal(lastSent(sent)?.method, "Emulation.clearDeviceMetricsOverride");
});
