import { test } from "node:test";
import assert from "node:assert/strict";
import { instrumentKit, type Facts } from "../../e2e/suites/room-instrument/kit.ts";
import { rs29Pace, rs30Rate } from "../../e2e/suites/room-instrument/pace.ts";
import { rs10Drag, rs12Pause } from "../../e2e/suites/room-instrument/sweep.ts";
import { foldLanded, type Pieces } from "../../e2e/suites/slide-away/kit.ts";
import { READ, type Specimen } from "../../e2e/suites/specimen/reads.ts";
import { specimenKit } from "../../e2e/suites/specimen/kit.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const world = (answer: (expression: string) => unknown) => {
  const checked: { code: string; ok: boolean }[] = [];
  const ctx = {
    evaluate: (expression: string) => {
      const said = answer(expression);
      return said instanceof Error ? Promise.reject(said) : Promise.resolve(said);
    },
    send: () => Promise.resolve({}),
    sleep: () => Promise.resolve(),
    check: (name: string, ok: unknown) => void checked.push({ code: name.split(" ")[0]!, ok: !!ok }),
    shoot: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, checked };
};

const PLAY = `document.querySelector(".rf-play").click()`;
const FACTS = { minFounded: 300, present: 1200 } as unknown as Facts;

const sweeping = (start: number) => {
  let plays = 0;
  let reads = 0;
  let year = start;
  return {
    clicked: () => ((plays += 1), (reads = 0)),
    plays: () => plays,
    read: () => ((reads += 1), reads),
    year: (to?: number) => (to === undefined ? year : (year = to)),
  };
};

test("RS29 reads the address only once the Pause has parked the sweep", async () => {
  const frames = [
    { playing: true, hash: "" },
    { playing: true, hash: "" },
  ];
  let clicks = 0;
  let n = 0;
  const frame = () => frames[n++] ?? { playing: false, hash: "#seed=9&style=antique" };
  const w = world((e) => {
    if (e === PLAY) return void (clicks += 1);
    if (e === "location.hash") return frame().hash;
    if (e.includes("playing:")) return frame();
    if (e.includes("Math.max(")) return 1200;
    if (e.includes("aria-label")) {
      return {
        role: "group",
        label: "The pace",
        labels: ["1×", "2×", "4×"],
        shown: true,
        rest: { pressed: ["true", "false", "false"], pace: 1 },
        after: { pressed: ["false", "false", "true"], pace: 4 },
      };
    }
    return null;
  });
  await rs29Pace(instrumentKit(w.ctx), { present: 1200 } as unknown as Facts);
  assert.equal(clicks, 2);
  assert.deepEqual(w.checked, [{ code: "RS29", ok: true }]);
});

test("RS10 drags only once the sweep has left the year it started from", async () => {
  const s = sweeping(300);
  let past = false;
  const w = world((e) => {
    if (e === PLAY) return void s.clicked();
    if (e.includes("Math.max(")) return 300;
    if (e.startsWith("({ year:")) {
      const n = s.read();
      const year = n < 3 ? 300 : 298 + n;
      if (year > 300) past = true;
      return { year };
    }
    if (e.includes("before")) return { before: past ? "Pause" : "Play", after: "Play", year: 750, mid: 750 };
    if (e === "window.__vellumAgesState().year") return 750;
    return null;
  });
  await rs10Drag(instrumentKit(w.ctx), FACTS);
  assert.deepEqual(w.checked, [{ code: "RS10", ok: true }]);
});

test("RS12 pauses only once the sweep has left its start, and reads the resumed year only once it has moved off the frozen one", async () => {
  const s = sweeping(300);
  const w = world((e) => {
    if (e === PLAY) return void s.clicked();
    if (e.includes("Math.max(")) return s.year(300);
    if (e.startsWith("({ year:")) {
      if (s.read() === 3) s.year(s.plays() === 1 ? 305 : 309);
      return { year: s.year() };
    }
    if (e.includes("lbl")) return { year: s.year(), lbl: "Play" };
    if (e === "window.__vellumAgesState().year") return s.year();
    return null;
  });
  await rs12Pause(instrumentKit(w.ctx), FACTS);
  assert.deepEqual(w.checked, [{ code: "RS12", ok: true }]);
});

test("RS30 starts its frame samples only once the sweep has left its start", async () => {
  const s = sweeping(300);
  let past = false;
  let startedAfterMove: boolean | null = null;
  const w = world((e) => {
    if (e === PLAY) return void s.clicked();
    if (e.includes("Math.max(")) return 300;
    if (e.startsWith("({ year:")) {
      const n = s.read();
      const year = n < 3 ? 300 : 298 + n;
      if (year > 300) past = true;
      return { year };
    }
    if (e.includes("__sweep={")) return void (startedAfterMove = past);
    if (e.includes("__sweep.stop=true")) return [];
    if (e.includes("textContent")) return "Pause";
    if (e.includes("min:a.min")) return { min: 300, max: 1200 };
    return null;
  });
  await rs30Rate(instrumentKit(w.ctx), FACTS);
  assert.equal(startedAfterMove, true);
});

const box = (x: number, w = 100) => ({ x, y: 10, w, h: 100, right: x + w, bottom: 110 });
const book = (over: Record<string, unknown>): Specimen =>
  ({
    st: { state: "rest", folded: false, zoomed: false, pill: "" },
    plateLoaded: true,
    sheet: box(0, 918),
    map: box(0),
    ...over,
  }) as unknown as Specimen;
const specimen = (answer: (expression: string) => unknown) => {
  const w = world(answer);
  return specimenKit({ ...w.ctx, settle: makeSettle(w.ctx) });
};

test("the Specimen Book's goto hands the page over only once the legend has inked in and the Book stands still", async () => {
  const [s0, s1, s2] = [book({ map: box(0) }), book({ map: box(5) }), book({ map: box(9) })];
  const seen = [
    { read: s0, anims: ["running"] },
    { read: s1, anims: ["running"] },
    { read: s2, anims: ["finished"] },
    { read: s2, anims: ["finished"] },
  ];
  let plain = 0;
  let witnessed = 0;
  const kit = specimen((e) => {
    if (e.includes("getAnimations")) {
      const w = seen[Math.min(witnessed++, seen.length - 1)]!;
      return { read: w.read, anims: e.includes(`const e = document.querySelector(".legend")`) ? w.anims : null };
    }
    if (e !== READ) return null;
    plain += 1;
    if (plain === 1) return new Error("the page has not parsed");
    return plain === 2 ? s0 : s1;
  });
  assert.equal(await kit.goto(), s2);
});

const MAPS = [box(0), box(40), box(80), box(120)];
const SHEETS = [box(0, 918), box(0, 700)];
const moving = (from: Specimen, frames: Specimen[]) => {
  let set = false;
  let n = 0;
  return specimen((e) => {
    if (e.includes("sb-state")) return void (set = true);
    if (!e.includes(READ)) return null;
    return set ? (frames[Math.min(n++, frames.length - 1)] ?? from) : from;
  });
};

test("toState waits for the map to leave where it stood and come to rest", async () => {
  const [m0, m1, m2] = [MAPS[0]!, MAPS[1]!, MAPS[2]!];
  const from = book({ map: m0 });
  const frames = [m0, m0, m1, m2, m2].map((map) => book({ map, sheetAnims: 0 }));
  assert.deepEqual(await moving(from, frames).toState("rest", "SB6 at rest again"), frames[4]);
});

test("toState from folded waits for the sheet's refit as well as the glide", async () => {
  const folded = { state: "folded", folded: true, zoomed: false, pill: "" };
  const from = book({ st: folded, map: MAPS[0], sheet: SHEETS[0] });
  const frames = [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 0],
    [3, 1],
    [3, 1],
  ].map(([m, s]) => book({ map: MAPS[m!], sheet: SHEETS[s!], sheetAnims: 0 }));
  assert.deepEqual(await moving(from, frames).toState("leaned", "SB5 leaned"), frames[5]);
});

test("toState from folded waits out the sheet's slide while #sheet lists it, pending at the folded box with the map moved and still", async () => {
  const folded = { state: "folded", folded: true, zoomed: false, pill: "" };
  const from = book({ st: folded, map: MAPS[0], sheet: SHEETS[0] });
  // The slide's first keyframe reads the folded box back through a transform, off by float noise, so the departure holds through the stall; a pending box equal to SHEETS[0] leaves this test green with the sheetAnims term gone (Issue #1261).
  const pending = book({ map: MAPS[2], sheet: box(1e-4, 918), sheetAnims: 1 });
  const landed = book({ map: MAPS[3], sheet: SHEETS[1], sheetAnims: 0 });
  const frames = [pending, pending, pending, landed, landed];
  assert.deepEqual(await moving(from, frames).toState("leaned", "SB5 leaned"), landed);
});

test("toState times out naming its label", async () => {
  const from = book({ map: MAPS[0] });
  await assert.rejects(
    moving(from, [book({ map: MAPS[0], sheetAnims: 0 })]).toState("rest", "SB6 at rest again"),
    (err: Error) => err.message.startsWith("settle timeout SB6 at rest again: "),
  );
});

const slid = (left: number, right: number, sheetAnims: number) =>
  ({ slip: { open: false, left }, sheet: [0, 0, right, 800], sheetAnims }) as unknown as Pieces;

test("foldLanded hands back the folded sheet at rest, not the frame laid out before the slide starts nor a frame the slide stalls in mid-way", async () => {
  const from = { slip: { open: true, left: 900 }, sheet: [0, 0, 900, 800] } as unknown as Pieces;
  // The frame laid out at the press before the slide exists, held across two polls as a throttled main thread holds it (handbook/plans/1200/1261/1261-r1-plan.md, "What was measured"), which only the slip term refuses.
  const before = slid(900, 1280, 0);
  // The slip moved with #sheet still listing its slide is the state the r1 plan's staged stall produced, which only the sheetAnims term refuses.
  const stalled = slid(1100, 1100, 1);
  const landed = slid(1240, 1280, 0);
  const frames = [before, before, stalled, stalled, landed, landed];
  let n = 0;
  const w = world((e) => (e.includes("sheetAnims") ? frames[Math.min(n++, frames.length - 1)] : null));
  assert.deepEqual(await foldLanded(w.ctx, from, "SW7 folded sheet"), landed);
});
