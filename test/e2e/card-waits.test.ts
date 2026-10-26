import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {
  p24NothingToScroll,
  p26TailScrolls,
  COUNT_FRAMES,
  QUIET_FRAMES,
  SCROLLED,
  STOP_FRAMES,
  WHEELED,
} from "../../e2e/suites/cards/cap.ts";
import type { Scrolled } from "../../e2e/suites/cards/cap.ts";
import { pCardShot } from "../../e2e/suites/cards/glass.ts";
import { p30Tablet, TAPPED } from "../../e2e/suites/cards/hold-tablet.ts";
import type { CardsKit } from "../../e2e/suites/cards/kit.ts";
import { p4Capital } from "../../e2e/suites/cards/overlay.ts";
import type { Manifest } from "../../e2e/suites/cards/overlay.ts";
import { z6PinnedCard, z8CardConstant } from "../../e2e/suites/zoom/camera.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import { CARD_ROLL } from "../../e2e/support/witness.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { count, recording } from "../../test-support/recording-ctx.ts";
import type { Said } from "../../test-support/recording-ctx.ts";

type Reads = (n: number) => Scrolled;
const OPEN = { left: 100, right: 356, top: 50, h: 300 } as unknown as Parameters<typeof p26TailScrolls>[1];
const moves =
  (final: number): Reads =>
  (n) =>
    n === 1
      ? { scrollTop: 0, k: 1, frame: 0 }
      : n <= 3
        ? { scrollTop: 0, k: 1, frame: n - 1 }
        : { scrollTop: final, k: 1, frame: n };

const scrollFake = (p26: Reads, p27: Reads) => {
  const n = { p26: 0, p27: 0 };
  const log: { p26: Scrolled[]; p27: Scrolled[] } = { p26: [], p27: [] };
  const { ctx, said, checked, slept } = recording((expression, so) => {
    if (expression === SCROLLED) {
      const phase = count(so, "tabIndex") > 0 ? "p27" : "p26";
      const read = (phase === "p27" ? p27 : p26)(++n[phase]);
      log[phase].push(read);
      return read;
    }
    if (expression.includes("elementFromPoint")) return true;
    if (expression.includes("tabIndex"))
      return { tabIndex: 0, focused: true, scrollTop: 0, scrolls: true, pinned: true };
    if (/scrollTop: \+i\.scrollTop\.toFixed\(2\), k:/.test(expression)) return { scrollTop: 0, k: 1 };
    if (expression.startsWith("+document.querySelector")) return 0;
    return {};
  });
  const withWheel = { ...ctx, wheel: () => Promise.resolve() } as unknown as SuiteContext;
  return { ctx: withWheel, said, checked, slept, log };
};
const scrollChecks = (checked: { code: string | undefined; ok: boolean }[]) =>
  checked.filter((c) => c.code === "P26" || c.code === "P27");

test("P26 and P27 read each scroll only once the input has moved it and it rests across a painted frame, and stop the frame count", async () => {
  const { ctx, said, checked } = scrollFake(moves(60), moves(120));
  await p26TailScrolls(ctx, OPEN);
  assert.deepEqual(scrollChecks(checked), [
    { code: "P26", ok: true },
    { code: "P27", ok: true },
  ]);
  assert.equal(count(said, STOP_FRAMES), 2, "the frame count was left running");
});

test("P27 fails on its own line once QUIET_FRAMES frames are painted with nothing scrolled, and does not time out", async () => {
  const { ctx, checked, log } = scrollFake(moves(60), (n) => ({ scrollTop: 0, k: 1, frame: n }));
  await p26TailScrolls(ctx, OPEN);
  assert.deepEqual(scrollChecks(checked), [
    { code: "P26", ok: true },
    { code: "P27", ok: false },
  ]);
  assert.ok((log.p27.at(-1)?.frame ?? 0) >= QUIET_FRAMES, `the last read carried frame ${log.p27.at(-1)?.frame}`);
});

test("P27 does not take two equal reads with no painted frame between them for rest", async () => {
  const { ctx, checked } = scrollFake(moves(60), (n) =>
    n === 1
      ? { scrollTop: 0, k: 1, frame: 0 }
      : n <= 3
        ? { scrollTop: 0.5, k: 1, frame: 3 }
        : { scrollTop: 120, k: 1, frame: n },
  );
  await p26TailScrolls(ctx, OPEN);
  assert.deepEqual(scrollChecks(checked), [
    { code: "P26", ok: true },
    { code: "P27", ok: true },
  ]);
});

test("P26 and P27 reset the card's scroll and pause for nothing after it", async () => {
  const { ctx, slept } = scrollFake(moves(60), moves(120));
  await p26TailScrolls(ctx, OPEN);
  assert.deepEqual(
    slept.filter((ms) => ms !== 50 && ms !== 120),
    [],
  );
});

test("COUNT_FRAMES counts each painted frame once however soon it is armed again, and STOP_FRAMES ends the count", () => {
  const queue: (() => void)[] = [];
  const win: Record<string, unknown> = { requestAnimationFrame: (f: () => void) => void queue.push(f) };
  win.window = win;
  vm.createContext(win);
  const paint = () => queue.splice(0).forEach((f) => f());
  const frame = (): unknown => vm.runInContext("window.__capFrame", win) as unknown;
  vm.runInContext(COUNT_FRAMES, win);
  paint();
  paint();
  assert.equal(frame(), 2);
  vm.runInContext(COUNT_FRAMES, win);
  assert.equal(frame(), 0);
  paint();
  assert.equal(frame(), 1, "the first count's pending frame counted as well");
  paint();
  assert.equal(frame(), 2);
  vm.runInContext(STOP_FRAMES, win);
  paint();
  paint();
  assert.equal(frame(), 2, "the count went on after STOP_FRAMES");
  assert.equal(queue.length, 0, "a frame callback was still queued");
});

const cardsKitOver = (ctx: SuiteContext) =>
  ({
    ...ctx,
    settle: makeSettle(ctx),
    waitReady: () => Promise.resolve(true),
    setNarrowViewport: () => Promise.resolve(),
    wheel: () => Promise.resolve(),
  }) as unknown as CardsKit;
const KRALGOV = { name: "Kralgov", pinned: true, scrolls: false, tail: 0, pe: "none", k: 1, x: 500, y: 300, h: 200 };
const wheelFake = (wheeled: (n: number) => { wheels: number; k: number }) => {
  let n = 0;
  return recording((expression) => {
    if (expression === WHEELED) return wheeled(++n);
    if (expression === "window.__vellumZoomState().k") return 1;
    if (expression.includes("pc-name")) return KRALGOV;
    if (expression.includes("place-hit")) return { x: 500, y: 300 };
    return {};
  });
};

test("P24 reads the camera only once the wheel has reached the page", async () => {
  const { ctx, checked } = wheelFake((n) => (n <= 2 ? { wheels: 0, k: 1 } : { wheels: 1, k: 1.5 }));
  await p24NothingToScroll(cardsKitOver(ctx));
  assert.deepEqual(
    checked.filter((c) => c.code === "P24"),
    [{ code: "P24", ok: true }],
  );
});

test("P24 times out naming the wheel when it never reaches the page", async () => {
  const { ctx } = wheelFake(() => ({ wheels: 0, k: 1.5 }));
  await assert.rejects(p24NothingToScroll(cardsKitOver(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout P24 the wheel handled: "),
  );
});

test("P30 times out naming the text tap when its click never lands", async () => {
  const marks = [0, 5, 8, 9, 11, 16, 17, 21, 23].map((idx) => ({ idx, name: `T${idx}`, x: 10 * idx, y: 20 }));
  const card = {
    shown: true,
    name: "T0",
    pinned: true,
    rest: true,
    left: 100,
    top: 50,
    right: 300,
    bottom: 350,
    link: null,
  };
  const { ctx } = recording((expression) => (expression === TAPPED ? { clicked: false, shown: true, rest: true } : ""));
  const k = {
    ...ctx,
    settle: makeSettle(ctx),
    boot: () => Promise.resolve(marks),
    reset: () => Promise.resolve(),
    tap: () => Promise.resolve(),
    atRest: () => Promise.resolve(card),
    card: () => Promise.resolve(card),
  } as unknown as Parameters<typeof p30Tablet>[0];
  await assert.rejects(p30Tablet(k), (err: Error) =>
    err.message.startsWith("settle timeout P30 the text tap on T0's card handled: "),
  );
});

const PM = {
  cap: 3,
  capName: "Capital",
  capFounded: 1,
  capSeat: true,
  ruinIdx: -1,
  ruinName: null,
  tale: null,
  seatIdx: 7,
  seatName: "Seat",
  formerIdx: -1,
  formerName: null,
  plainIdx: 2,
  count: 9,
} satisfies Manifest;
const BOX: [number, number, number, number] = [10, 20, 256, 300];
const HIDDEN = { shown: false, pinned: false, card: null };
const witnessedRead = (read: unknown, anims: string[]) => ({ read, anims });
const isWitnessed = (expression: string) => expression !== CARD_ROLL && expression.includes(CARD_ROLL);

test("P5b shoots the seat's card only after reading it pinned with its roll finished", async () => {
  let witnessed = 0;
  const { ctx, said } = recording((expression) => {
    if (expression === CARD_ROLL) return { shown: true, pinned: false, card: BOX };
    if (isWitnessed(expression))
      return witnessedRead(
        ++witnessed <= 3 ? { shown: true, pinned: false, card: BOX } : { shown: true, pinned: true, card: BOX },
        ["finished"],
      );
    if (expression.includes("+3+"))
      return {
        hidden: false,
        aria: "Capital, Capital",
        name: "Capital",
        rank: "Capital",
        founded: "Founded in the year 1.",
        tale: false,
      };
    if (expression.includes("+7+") && expression.includes(".focus()"))
      return { hidden: false, name: "Seat", rank: "Realm Seat", aria: "Seat, Realm Seat", tale: false };
    return {};
  });
  await p4Capital(ctx, PM);
  const shot = said.findIndex((s) => s.kind === "shoot");
  assert.notEqual(shot, -1, "the seat's card was never shot");
  assert.equal(
    said.slice(0, shot).filter((s: Said) => isWitnessed(s.what)).length,
    5,
    "the shot came before the card was read pinned and at rest",
  );
});

const rollFake = (anims: string[]) =>
  recording((expression) => {
    if (expression === CARD_ROLL) return HIDDEN;
    if (isWitnessed(expression)) return witnessedRead(HIDDEN, anims);
    return {};
  });

test("the card shot waits for the card's roll to finish", async () => {
  const { ctx } = rollFake(["running"]);
  await assert.rejects(pCardShot(ctx, { ruinIdx: -1, cap: 3 } as Manifest), (err: Error) =>
    err.message.startsWith("settle timeout P card shot: the card unfurled: "),
  );
});

test("Z6 waits for the pinned card's roll before its shot", async () => {
  const { ctx } = rollFake(["running"]);
  await assert.rejects(z6PinnedCard(ctx), (err: Error) =>
    err.message.startsWith("settle timeout Z6 the pinned card unfurled: "),
  );
});

test("Z8 waits for the pinned card's roll before its shot", async () => {
  const { ctx } = rollFake(["running"]);
  await assert.rejects(z8CardConstant(ctx), (err: Error) =>
    err.message.startsWith("settle timeout Z8 the pinned card unfurled: "),
  );
});
