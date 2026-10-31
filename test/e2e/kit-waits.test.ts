import { test } from "node:test";
import assert from "node:assert/strict";
import { arrive } from "../../e2e/suites/cluster/chart.ts";
import { dnTablet, type DeskKit } from "../../e2e/suites/cluster/desk-notice.ts";
import type { TrailKit } from "../../e2e/suites/cluster/trail.ts";
import { docRoomsKit } from "../../e2e/suites/document-rooms.ts";
import { atTheDesk } from "../../e2e/suites/reading-room.ts";
import type { ReadingRoomKit } from "../../e2e/suites/reading-room/kit.ts";
import { stripRead } from "../../e2e/suites/reading-room/reads.ts";
import { zoomKit } from "../../e2e/suites/zoom/kit.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import { errorText } from "../../e2e/support/suites.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { fakePage, type FakeFrame, type FakePage } from "../../test-support/fake-page.ts";

type Sent = { method: string; params?: Record<string, unknown> };
const ctxOn = (evaluate: FakePage["evaluate"], onSend: (s: Sent) => void = () => {}) => {
  const checked: { name: string; ok: boolean }[] = [];
  const ctx = {
    evaluate,
    send: (method: string, params?: Record<string, unknown>) => {
      onSend({ method, params });
      return Promise.resolve({});
    },
    sleep: () => Promise.resolve(),
    check: (name: string, ok: unknown) => void checked.push({ name: name.split(" ")[0]!, ok: !!ok }),
    setMobileViewport: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, checked };
};

const landing = (clock: number, from: number): FakeFrame => ({
  nodes: {
    "#index": { rect: [992, 110, 256, 668] },
    ".sheet": {
      rect: [33, clock < from ? 180 - clock : 172.81, 918, 3275],
      anims: clock < from ? ["running", "running"] : ["finished", "finished"],
    },
  },
});
const docRooms = (page: FakePage) => {
  const { ctx } = ctxOn(page.evaluate);
  return docRoomsKit({ ...ctx, settle: makeSettle(ctx) });
};

test("goto hands the page over only once the sheet's landing has finished and the sheet and its index stand still", async () => {
  const page = fakePage((clock) => landing(clock, 5));
  await assert.doesNotReject(docRooms(page).goto("/faq/"));
  assert.deepEqual(
    page.asked.filter((a) => a.selector === ".sheet").map((a) => a.anims[0]),
    ["running", "running", "running", "finished", "finished"],
  );
});

test("goto times out naming the page when the sheet never lands", async () => {
  const page = fakePage((clock) => landing(clock, Infinity));
  await assert.rejects(docRooms(page).goto("/faq/"), (err: Error) =>
    err.message.startsWith("settle timeout /faq/ landed: "),
  );
});

test("goHome hands back once its press is handled and pauses for nothing, since every caller either interrupts the glide or waits for its own landing", async () => {
  const pressed: string[] = [];
  const slept: number[] = [];
  const page = fakePage(
    () => ({ nodes: { "#zoom-reset": {} } }),
    (selector) => pressed.push(selector),
  );
  const { ctx } = ctxOn(page.evaluate);
  const sleep = (ms: number): Promise<void> => {
    slept.push(ms);
    return Promise.resolve();
  };
  await zoomKit({ ...ctx, sleep }).goHome();
  assert.deepEqual(pressed, ["#zoom-reset"]);
  assert.deepEqual(slept, [], "goHome paused after its press");
});

const notice = (over: Record<string, unknown>) => ({
  ready: "complete",
  width: 1024,
  scale: 1,
  narrow: false,
  key: null,
  shown: false,
  w: 0,
  h: 0,
  hitsButton: false,
  bodyPx: 16,
  buttonPx: 0,
  tap: { x: 0, y: 0 },
  ...over,
});
const desk = (reads: (() => unknown) | unknown[]) => {
  const evaluate = (expression: string): Promise<unknown> =>
    Promise.resolve(expression.includes(".desk-notice") ? (Array.isArray(reads) ? reads.shift() : reads()) : null);
  const { ctx, checked } = ctxOn(evaluate);
  const kit = { ...ctx, settle: makeSettle(ctx), open: () => Promise.resolve() } as unknown as DeskKit;
  return { kit, checked };
};

test("the desk notice's checks read the loaded page only once it has held still across two reads", async () => {
  const upright = notice({ scale: 0.8 });
  const { kit, checked } = desk([notice({ scale: 0.9 }), notice({}), notice({}), upright, upright]);
  await assert.doesNotReject(dnTablet(kit));
  assert.deepEqual(checked, [
    { name: "DN5", ok: true },
    { name: "DN5b", ok: true },
  ]);
});

test("the desk notice's read times out naming the page when the page never holds still", async () => {
  let scale = 1;
  const { kit } = desk(() => notice({ scale: (scale -= 0.01) }));
  await assert.rejects(dnTablet(kit), (err: Error) => err.message.startsWith("settle timeout the page on a tablet: "));
});

const HARNESS = { inner: [1280, 2263], sheet: [0, 793.69, 824.59, 636.55] } as const;
const DESK = { inner: [1440, 900], sheet: [122.17, 144.73, 740.27, 571.45] } as const;
type Room = { readonly inner: readonly [number, number]; readonly sheet: readonly [number, number, number, number] };
const after = (since: number, frames: readonly [number, Room][], rest: Room): Room =>
  frames.find(([upTo]) => since <= upTo)?.[1] ?? rest;
const deskRun = (never: "laid out" | "laid out again" | null) => {
  let room: Room = HARNESS;
  let at: { since: number; frames: readonly [number, Room][]; rest: Room } | null = null;
  const seen: { stripRead?: Room; play?: Room } = {};
  const page = fakePage((clock) => {
    if (at) room = after(clock - at.since, at.frames, at.rest);
    const said = page.said[page.said.length - 1]!;
    if (said === stripRead && !seen.stripRead) seen.stripRead = room;
    if (said.includes(".rf-play") && !seen.play) seen.play = room;
    return { nodes: { "#sheet": { rect: room.sheet } }, inner: room.inner };
  });
  const stray = (inner: readonly [number, number]): Room => ({ inner, sheet: [5, 5, 5, 5] });
  const wide: Room = { ...HARNESS, inner: [1440, 900] };
  const narrow: Room = { ...DESK, inner: [1280, 2263] };
  let phase = 0;
  const { ctx } = ctxOn(page.evaluate, ({ method, params }) => {
    if (phase === 0 && method === "Emulation.setDeviceMetricsOverride" && params?.["width"] === 1440) {
      phase = 1;
      at = {
        since: page.said.length,
        frames: [
          [2, stray([1280, 2263])],
          [6, wide],
        ],
        rest: never === "laid out" ? wide : DESK,
      };
    }
    if (phase === 1 && method === "Emulation.clearDeviceMetricsOverride") {
      phase = 2;
      at = {
        since: page.said.length,
        frames: [
          [2, stray([1440, 900])],
          [6, narrow],
        ],
        rest: never === "laid out again" ? narrow : HARNESS,
      };
    }
  });
  const failed: { name: string; message: string }[] = [];
  const step = async (name: string, body: () => Promise<void>): Promise<void> => {
    try {
      await body();
    } catch (err) {
      failed.push({ name, message: errorText(err) });
    }
  };
  const k = { ...ctx, plateShown: () => Promise.resolve(null) } as unknown as ReadingRoomKit;
  return { run: () => atTheDesk(ctx, step, k), seen, failed };
};

test("atTheDesk reads the desk only once the room has laid out at 1440x900, and RR29 runs only once it has laid out again after the clear, never at the window's size alone or at a stray layout", async () => {
  const { run, seen } = deskRun(null);
  await assert.doesNotReject(run());
  assert.deepEqual(seen.stripRead, DESK, "the desk was read before the room laid out at 1440x900");
  assert.deepEqual(seen.play, HARNESS, "RR29 ran before the room laid out again after the clear");
});

test("atTheDesk fails the desk's step by the wait's own label when the room never lays out at 1440x900", async () => {
  const { run, failed } = deskRun("laid out");
  await run();
  const first = failed.at(0);
  assert.ok(first, "no step failed");
  assert.equal(first.name, "RR31, RR35, RR37, RR36");
  assert.match(first.message, /^settle timeout the room laid out at 1440x900: /);
});

test("atTheDesk fails RR29's step by the wait's own label when the room never lays out again after the clear", async () => {
  const { run, failed } = deskRun("laid out again");
  await run();
  const rr29 = failed.find((f) => f.name === "RR29");
  assert.ok(rr29, "RR29's step did not fail");
  assert.match(rr29.message, /^settle timeout the room laid out again after the 1440x900 override: /);
});

const BOOT_FIT = [0, 199.359375, 568.59375, 419.875] as const;
const PLATE_FIT = [7.859375, 163.203125, 552.875, 408.28125] as const;
const prospect =
  (plateAt: number) =>
  (clock: number): FakeFrame => ({
    nodes: {
      "header.chrome": { anims: ["finished"] },
      "#sheet": { rect: clock < plateAt ? BOOT_FIT : PLATE_FIT },
      ...(clock < plateAt ? { "#pp-plate[hidden]": {} } : {}),
    },
  });
const atRest = (page: FakePage): TrailKit => {
  const { ctx } = ctxOn(page.evaluate);
  return { ...ctx, settle: makeSettle(ctx), goto: () => Promise.resolve() };
};

test("AT's rest hands the Prospect over only once its plate is shown and the fit the plate's refit leaves holds still", async () => {
  const page = fakePage(prospect(4));
  await assert.doesNotReject(arrive(atRest(page), "/prospect/", [1024, 768]));
  assert.equal(
    page.said.length,
    5,
    "AT's rest handed the Prospect over before its plate was shown and its refit held still",
  );
});

test("AT's rest times out naming the Prospect when its plate never shows", async () => {
  const page = fakePage(prospect(Infinity));
  await assert.rejects(
    arrive(atRest(page), "/prospect/", [1024, 768]),
    (err: Error) =>
      err.message.startsWith("settle timeout AT rest /prospect/: ") && err.message.includes('"drawn":false'),
  );
});

test("AT's rest hands a page with no plate over on its second still read", async () => {
  const page = fakePage(() => ({ nodes: { "header.chrome": { anims: ["finished"] } } }));
  await assert.doesNotReject(arrive(atRest(page), "/faq/", [1024, 768]));
  assert.equal(page.said.length, 2);
});
