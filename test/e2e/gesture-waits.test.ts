import { test } from "node:test";
import assert from "node:assert/strict";
import type { HuntKit, Quarry } from "../../e2e/suites/hunt.ts";
import { hg2Taps, hg4Solves, HG2_READ, HG4_READ } from "../../e2e/suites/hunt/zoomed.ts";
import { ENDED, WHEELED, zg1WheelZooms, zg2TouchGestures } from "../../e2e/suites/zoom-gestures.ts";
import type { GesturesKit } from "../../e2e/suites/zoom-gestures.ts";
import { z20eCardSurvives } from "../../e2e/suites/zoom/bands.ts";
import type { ZoomKit } from "../../e2e/suites/zoom/kit.ts";
import {
  DRAFTING,
  INSET_OPAQUE,
  SETTLED_AT,
  z17Inset,
  z19bSupersession,
  zInsetContextShot,
} from "../../e2e/suites/zoom/region.ts";
import { recording } from "../../test-support/recording-ctx.ts";
import type { SuiteContext } from "../../e2e/types.ts";

type Cam = { k: number; x: number; y: number };
const HOME: Cam = { k: 1, x: 0, y: 0 };
const ZOOMED: Cam = { k: 1.2, x: -60, y: -80 };
const PINCHED: Cam = { k: 2.43, x: -500, y: -300 };
const PANNED: Cam = { k: 2.43, x: -580, y: -360 };
const settled = (n: number) => n > 2;

test("ZG1 and ZG1b read the camera only once each wheel has reached the page", async () => {
  let sent = 0;
  let reads = 0;
  const camera = (): Cam[] => (sent === 1 ? [HOME, ZOOMED] : [ZOOMED, HOME]);
  const { ctx, checked } = recording((expression) => {
    if (expression === WHEELED) {
      const [before, after] = camera();
      return settled(++reads) ? { wheels: 1, ...after } : { wheels: 0, ...before };
    }
    if (expression === "window.__vellumZoomState()") return camera()[0];
    return {};
  });
  const k = {
    ...ctx,
    vpRect: () => Promise.resolve({ L: 0, T: 0, W: 1000, H: 800 }),
    state: () => Promise.resolve(camera()[0]),
    wheel: () => {
      sent++;
      reads = 0;
      return Promise.resolve();
    },
  } as unknown as GesturesKit;
  await zg1WheelZooms(k);
  assert.deepEqual(
    checked.filter((c) => c.code === "ZG1" || c.code === "ZG1b"),
    [
      { code: "ZG1", ok: true },
      { code: "ZG1b", ok: true },
    ],
  );
});

test("ZG2 and ZG3 read the camera only once each gesture's last event has reached the page, and ZG2 pauses for nothing after its scroll into view", async () => {
  let gesture = 0;
  let reads = 0;
  let camera: Cam = HOME;
  const phases = (): [Cam, Cam] => (gesture === 1 ? [HOME, PINCHED] : [PINCHED, PANNED]);
  const { ctx, checked, slept } = recording((expression) => {
    if (expression === ENDED) {
      const [before, after] = phases();
      if (settled(++reads)) camera = after;
      return settled(reads) ? { ends: 1, ...after } : { ends: 0, ...before };
    }
    if (expression.includes("visualViewport")) return { width: 1024, scale: 1, coarse: true };
    return {};
  });
  const k = {
    ...ctx,
    vpRect: () => Promise.resolve({ L: 0, T: 0, W: 1000, H: 800 }),
    state: () => Promise.resolve(camera),
    pinch: () => {
      gesture = 1;
      reads = 0;
      return Promise.resolve();
    },
    touchPan: () => {
      gesture = 2;
      reads = 0;
      return Promise.resolve();
    },
  } as unknown as GesturesKit;
  await zg2TouchGestures(k);
  assert.deepEqual(
    checked.filter((c) => c.code === "ZG2" || c.code === "ZG3"),
    [
      { code: "ZG2", ok: true },
      { code: "ZG3", ok: true },
    ],
  );
  assert.ok(
    slept.every((ms) => ms === 50),
    `a pause other than the poll's: ${slept.join(",")}`,
  );
});

const QUARRY = { miss: { fx: 0.2, fy: 0.3 }, hit: { fx: 0.6, fy: 0.5 } } as unknown as Quarry;
const huntKitOver = (ctx: SuiteContext): HuntKit =>
  ({
    ...ctx,
    framePoint: () => Promise.resolve({ px: 10, py: 20, cx: 30, cy: 40, state: { k: 2, x: 0, y: 0 } }),
    mouseTap: () => Promise.resolve(),
    mouseDrag: () => Promise.resolve(),
  }) as unknown as HuntKit;

test("HG2 reads the sounding only once the tap's click has reached the page", async () => {
  let reads = 0;
  const { ctx, checked } = recording((expression) => {
    if (expression === HG2_READ)
      return ++reads <= 2
        ? { clicks: 0, dots: 0, inSvg: false, solved: false, status: "" }
        : { clicks: 1, dots: 1, inSvg: false, solved: false, status: "Cold." };
    if (expression.includes("inSvg")) return { dots: 0, inSvg: false, solved: false, status: "" };
    if (expression.includes("sounding-dot")) return { solved: false, status: "Cold.", dots: 1 };
    return {};
  });
  await hg2Taps(huntKitOver(ctx), QUARRY);
  assert.deepEqual(
    checked.filter((c) => c.code === "HG2"),
    [{ code: "HG2", ok: true }],
  );
});

test("HG4 times out naming the guess tap when its click never reaches the page", async () => {
  const { ctx } = recording((expression) =>
    expression === HG4_READ ? { clicks: 0, solved: false, status: "Cold.", star: false } : {},
  );
  await assert.rejects(hg4Solves(huntKitOver(ctx), QUARRY), (err: Error) =>
    err.message.startsWith("settle timeout HG4 the guess tap handled: "),
  );
});

const zoomKitOver = (ctx: SuiteContext, extra: object = {}): ZoomKit => {
  let redrafts = 0;
  return {
    ...ctx,
    rgn: () => Promise.resolve({ redrafts, band: 0, committed: false }),
    goHome: () => Promise.resolve(),
    enterAt: () => Promise.resolve(undefined),
    waitRedraft: () =>
      Promise.resolve({ redrafts: ++redrafts, band: 1, committed: true, title: "The Environs of Kralgov" }),
    captionMs: () => Promise.resolve(400),
    insetView: () =>
      Promise.resolve({
        insets: 1,
        worldMounted: true,
        stamped: true,
        insetLeft: 25,
        insetW: 50,
        hits: 3,
        caption: "drawn in 400ms",
        zk: 2,
        zx: -500,
      }),
    ...extra,
  } as unknown as ZoomKit;
};

test("Z17 shoots the inset only once its crossfade has landed", async () => {
  const { ctx } = recording((expression) =>
    expression === INSET_OPAQUE ? { insets: 1, opacity: 0.4 } : expression.includes("clientWidth") ? 1000 : {},
  );
  await assert.rejects(z17Inset(zoomKitOver(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout Z17 the inset's crossfade landed: "),
  );
});

test("the inset context shot waits for the camera's settle at k=1.35", async () => {
  const { ctx } = recording((expression) =>
    expression === SETTLED_AT ? { k: "2.0000", drafting: false, insets: 1, opacity: 1 } : {},
  );
  await assert.rejects(zInsetContextShot(zoomKitOver(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout Z17 the camera's settle at k=1.35: "),
  );
});

test("Z19b presses home only once the region job is in flight", async () => {
  let homes = 0;
  const { ctx } = recording((expression) => (expression === DRAFTING ? { drafting: false, redrafts: 5 } : {}));
  const k = zoomKitOver(ctx, {
    rgn: () => Promise.resolve({ redrafts: 5, band: 0, committed: false }),
    goHome: () => {
      homes++;
      return Promise.resolve();
    },
  });
  await assert.rejects(z19bSupersession(k), (err: Error) =>
    err.message.startsWith("settle timeout Z19b the region job in flight: "),
  );
  assert.equal(homes, 1);
});

test("Z20e reads the card straight after the redraft commits", async () => {
  const { ctx, slept } = recording((expression) =>
    expression.includes("card.hidden") ? { hidden: false, name: "Kralgov", zoomK: "3.6" } : "Kralgov",
  );
  await z20eCardSurvives(zoomKitOver(ctx));
  assert.deepEqual(slept, []);
});

test("the inset context shot waits for the region drafting to end, not for the depth alone", async () => {
  const { ctx } = recording((expression) =>
    expression === SETTLED_AT ? { k: "1.3500", drafting: true, insets: 1, opacity: 1 } : {},
  );
  await assert.rejects(zInsetContextShot(zoomKitOver(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout Z17 the camera's settle at k=1.35: "),
  );
});

test("Z19b does not press home once the job it waited for has already landed", async () => {
  const { ctx } = recording((expression) => (expression === DRAFTING ? { drafting: true, redrafts: 6 } : {}));
  const k = zoomKitOver(ctx, { rgn: () => Promise.resolve({ redrafts: 5, band: 0, committed: false }) });
  await assert.rejects(z19bSupersession(k), (err: Error) =>
    err.message.startsWith("settle timeout Z19b the region job in flight: "),
  );
});
