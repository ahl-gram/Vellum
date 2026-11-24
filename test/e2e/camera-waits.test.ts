import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { documentOf } from "../../test-support/built-dom.ts";
import { framed, landedWith, STOP_CAMERA_WATCH, type Framed } from "../../e2e/support/camera-landed.ts";
import { lensRest, type Lens } from "../../e2e/suites/print-room/print.ts";
import { glided } from "../../e2e/suites/specimen/gestures.ts";
import type { SpecimenKit } from "../../e2e/suites/specimen/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { cardAtDepth, type CardAtDepth } from "../../e2e/suites/cards/cap.ts";
import { cameraAtRest } from "../../e2e/suites/chart-drawer/floor.ts";
import type { Cam } from "../../e2e/suites/chart-drawer/reads.ts";
import { kLeft, kStill } from "../../e2e/suites/zoom-gestures/touch.ts";
import type { GesturesKit } from "../../e2e/suites/zoom-gestures.ts";

const read = (k: number, frames: number, writes: number): Framed<number> => ({ read: k, frames, writes });
const sameK = (a: number, b: number): boolean => a === b;

test("landedWith takes two equal camera reads only across a drawn frame with no camera write between (Issue #1365)", () => {
  const landed = landedWith(sameK);
  const stalled = read(1.4, 4, 3);
  assert.equal(landed(stalled, stalled), false, "two equal reads with no frame between");
  assert.equal(landed(read(1.4, 5, 4), read(1.4, 4, 3)), false, "a write the matrix's rounding hides");
  assert.equal(landed(read(1.4, 5, 3), read(1.4, 4, 3)), true, "one frame on and no write");
  assert.equal(landed(read(1.5, 5, 3), read(1.4, 4, 3)), false, "reads that differ");
  const none = { read: null, frames: 5, writes: 3 } as unknown as Framed<number>;
  assert.equal(landed(none, read(1.4, 4, 3)), false, "a null read");
  assert.equal(landed(none, { ...none, frames: 4 }), false, "two null reads across a frame");
});

test("landedWith asks for as many drawn frames as it is given between two equal camera reads (Issue #1446)", () => {
  assert.equal(landedWith(sameK, 2)(read(1.4, 5, 3), read(1.4, 4, 3)), false, "one frame where two are asked");
  assert.equal(landedWith(sameK, 2)(read(1.4, 6, 3), read(1.4, 4, 3)), true, "two frames where two are asked");
  assert.equal(landedWith(sameK)(read(1.4, 5, 3), read(1.4, 4, 3)), true, "the default stays one frame");
});

const matrix = (k: number): string => `matrix(${k}, 0, 0, ${k}, 0, 0)`;
const lens = (k: number, frames: number, writes: number): Framed<Lens> => ({
  read: { k, t: matrix(k), zoomed: k > 1 },
  frames,
  writes,
});

const scripted = <T>(reads: readonly Framed<T>[]) => {
  let n = 0;
  let stops = 0;
  const seen: string[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    seen.push(expression);
    if (expression === STOP_CAMERA_WATCH) {
      stops += 1;
      return Promise.resolve(true);
    }
    return Promise.resolve(reads[Math.min(n++, reads.length - 1)]);
  };
  return { evaluate, stops: () => stops, seen };
};

const ctx = (s: { evaluate: (e: string) => Promise<unknown> }) =>
  ({ evaluate: s.evaluate, sleep: () => Promise.resolve() }) as unknown as Pick<SuiteContext, "evaluate" | "sleep">;

test("glided hands the Glass's glide over only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const s = scripted([lens(1, 0, 0), lens(1.37144, 1, 1), lens(1.37144, 1, 1), lens(1.4, 2, 2), lens(1.4, 3, 2)]);
  const k = { evaluate: s.evaluate, sleep: () => Promise.resolve() } as unknown as SpecimenKit;
  assert.equal((await glided(k, matrix(1))).k, 1.4);
  assert.equal(s.stops(), 1);
});

test("lensRest takes a leaned or a still camera only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const leaning = scripted([lens(1, 0, 0), lens(1.37144, 1, 1), lens(1.37144, 1, 1), lens(1.4, 2, 2), lens(1.4, 3, 2)]);
  assert.equal((await lensRest(ctx(leaning), "leaned", "leaned")).k, 1.4);
  assert.equal(leaning.stops(), 1);
  const homing = scripted([lens(1.4, 0, 0), lens(1.4, 0, 0), lens(1, 1, 1), lens(1, 2, 1)]);
  assert.equal((await lensRest(ctx(homing), "still", "home")).k, 1);
  assert.equal(homing.stops(), 1);
});

test("lensRest hands a camera that never left home over as still (Issue #1365)", async () => {
  const home = scripted([lens(1, 0, 0), lens(1, 1, 0), lens(1.3, 2, 1)]);
  assert.equal((await lensRest(ctx(home), "still", "home")).k, 1);
  assert.equal(home.stops(), 1);
});

test("kLeft takes the double tap's depth only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const s = scripted([
    read(1, 0, 0),
    read(1.5863681885612406, 1, 1),
    read(1.5863681885612406, 1, 1),
    read(2, 2, 2),
    read(2, 3, 2),
  ]);
  const k = { evaluate: s.evaluate, sleep: () => Promise.resolve() } as unknown as GesturesKit;
  assert.equal(await kLeft(k, "ZG8b"), 2);
  assert.equal(s.stops(), 1);
});

test("kStill takes a camera that never moved for still only across two drawn frames with no camera write (Issue #1446)", async () => {
  const held = scripted([
    ...Array.from({ length: 6 }, () => read(1, 0, 0)),
    read(1.3, 1, 1),
    read(2, 2, 2),
    read(2, 3, 2),
    read(2, 4, 2),
  ]);
  const k = { evaluate: held.evaluate, sleep: () => Promise.resolve() } as unknown as GesturesKit;
  assert.equal(await kStill(k, "ZG7"), 2, "six equal reads with no frame drawn are not a camera at rest");
  assert.equal(held.stops(), 1);
  const startTick = scripted([
    read(1, 0, 0),
    read(1, 1, 0),
    read(1.2, 2, 1),
    read(2, 3, 2),
    read(2, 4, 2),
    read(2, 5, 2),
  ]);
  const j = { evaluate: startTick.evaluate, sleep: () => Promise.resolve() } as unknown as GesturesKit;
  assert.equal(await kStill(j, "ZG7"), 2, "one quiet frame is the glide's start tick, which writes no change");
  assert.equal(startTick.stops(), 1);
  const written = scripted([read(1, 0, 0), read(1, 1, 1), read(1, 2, 1), read(1, 3, 1)]);
  const w = { evaluate: written.evaluate, sleep: () => Promise.resolve() } as unknown as GesturesKit;
  assert.equal(await kStill(w, "ZG7"), 1, "a write the matrix's rounding hides starts the quiet run again");
  assert.equal(written.stops(), 1);
});

const card = (k: number, h: number, frames: number, writes: number): Framed<CardAtDepth> => ({
  read: { k, w: 256, h, boxH: 272, over: h - 272 },
  frames,
  writes,
});

test("cardAtDepth takes the card at depth for rest only once a frame has drawn with no camera write between (Issue #1446)", async () => {
  const s = scripted([
    card(1, 272, 0, 0),
    card(1.2, 300, 1, 1),
    card(1.2, 300, 1, 1),
    card(1.3947436663504054, 272, 2, 2),
    card(1.3947436663504054, 272, 3, 2),
  ]);
  const at = await cardAtDepth(ctx(s), "P23");
  assert.equal(at.k, 1.3947436663504054);
  assert.equal(at.h, 272);
  assert.equal(s.stops(), 1);
  const growing = scripted([
    card(1.2, 300, 1, 1),
    card(1.2, 300, 1, 1),
    card(1.2, 320, 2, 1),
    card(1.3947436663504054, 272, 3, 2),
    card(1.3947436663504054, 272, 4, 2),
  ]);
  assert.equal(
    (await cardAtDepth(ctx(growing), "P23")).h,
    272,
    "a card still growing under a camera that has not written is not at rest",
  );
  assert.equal(growing.stops(), 1);
});

const cam = (k: number, x: number, y: number, frames: number, writes: number): Framed<Cam> => ({
  read: { x, y, k },
  frames,
  writes,
});

test("cameraAtRest takes the camera for rest only once a frame has drawn with no camera write between (Issue #1446)", async () => {
  const s = scripted([
    cam(8, -1892, -1095, 0, 0),
    cam(8, -1892, -1095, 0, 0),
    cam(6.9, -1600, -930, 1, 1),
    cam(5.714285714285714, -1283.857142857143, -730, 2, 2),
    cam(5.714285714285714, -1283.857142857143, -730, 3, 2),
  ]);
  const at = await cameraAtRest(ctx(s), "CD48");
  assert.equal(at.k, 5.714285714285714);
  assert.equal(s.stops(), 1);
});

type Watched = { cb: (records: unknown[]) => void; seen: { el: unknown; options: unknown }[]; detached: boolean };

const fakePage = (html: string) => {
  const doc = documentOf(html);
  const observers: Watched[] = [];
  const queued: (() => void)[] = [];
  class FakeObserver {
    private readonly watched: Watched;
    constructor(cb: Watched["cb"]) {
      this.watched = { cb, seen: [], detached: false };
      observers.push(this.watched);
    }
    observe(el: unknown, options: unknown): void {
      this.watched.seen.push({ el, options });
    }
    disconnect(): void {
      this.watched.detached = true;
    }
  }
  const context = vm.createContext({
    window: {},
    document: doc,
    MutationObserver: FakeObserver,
    requestAnimationFrame: (f: () => void) => void queued.push(f),
  });
  const run = <T>(expression: string): T => JSON.parse(JSON.stringify(vm.runInContext(expression, context))) as T;
  const draw = (): void => queued.splice(0).forEach((f) => f());
  return { doc, run, draw, observers };
};

const ROOM = `<!doctype html><html><body><div id="map-viewport"><div id="map"><svg><g id="inner"></g></svg></div></div></body></html>`;
const READING = `<!doctype html><html><body><div id="map-viewport"><div class="rf-chart living-chart"><svg><g id="map"></g></svg></div></div></body></html>`;

test("framed watches the camera's own sheet: a room's #map, the Reading Room's frame chart and never the chart's own g#map, and a sheet mounted again afresh (Issue #1365, Issue #1448)", () => {
  const room = fakePage(ROOM);
  const at = framed("1.4");
  assert.deepEqual(room.run(at), { read: 1.4, frames: 0, writes: 0 });
  assert.deepEqual(room.run(at), { read: 1.4, frames: 0, writes: 0 }, "no frame has drawn between two reads");
  room.draw();
  assert.deepEqual(room.run(at), { read: 1.4, frames: 1, writes: 0 });
  assert.equal(room.observers.length, 1, "the watch is installed once");
  const map = room.observers[0]!;
  assert.equal(map.seen.length, 1);
  assert.ok(map.seen[0]!.el === room.doc.getElementById("map"), "the room's #map is the one observed");
  assert.equal(JSON.stringify(map.seen[0]!.options), '{"attributes":true,"attributeFilter":["style"]}');
  map.cb([{}, {}]);
  assert.equal(room.run<Framed<number>>(at).writes, 2);
  room.draw();
  room.draw();
  assert.equal(room.run<Framed<number>>(at).frames, 3);
  assert.equal(room.run(STOP_CAMERA_WATCH), true);
  assert.equal(map.detached, true);
  room.draw();
  assert.equal(room.run<Framed<number>>(at).frames, 0, "a read after the stop starts a fresh watch");

  const reading = fakePage(READING);
  assert.match(reading.doc.querySelector("#map")!.tagName, /^g$/i, "the chart's own g#map stands as the decoy");
  reading.run(at);
  const chart = reading.doc.querySelector(".rf-chart");
  assert.ok(chart !== null, "the frame chart stands");
  assert.ok(reading.observers[0]!.seen[0]!.el === chart, "the frame chart is the one observed");
  assert.ok(reading.observers[0]!.seen[0]!.el !== reading.doc.querySelector("#map"), "never the g#map");
  const fresh = reading.doc.createElement("div");
  fresh.setAttribute("class", "rf-chart living-chart");
  chart.replaceWith(fresh);
  reading.run(at);
  assert.equal(reading.observers[0]!.detached, true, "the watch on the old sheet is dropped");
  assert.ok(reading.observers[1]!.seen[0]!.el === fresh, "and the sheet mounted again is the one observed");
});

test("framed reads an empty gesture box as a camera at rest and refuses a box that holds no camera sheet it knows (Issue #1448)", () => {
  const empty = fakePage(`<!doctype html><html><body><div id="map-viewport"></div></body></html>`);
  assert.deepEqual(empty.run(framed("1.4")), { read: 1.4, frames: 0, writes: 0 });
  assert.equal(empty.observers[0]!.seen.length, 0, "nothing is observed");
  const stray = fakePage(
    `<!doctype html><html><body><div id="map-viewport"><div class="stray"></div></div></body></html>`,
  );
  assert.throws(() => stray.run(framed("1.4")), /no camera target/);
});

test("framed refuses a page with no gesture box at all, even where a #map stands elsewhere (Issue #1448, PR #1453 review)", () => {
  const bare = fakePage(`<!doctype html><html><body><div id="map"></div></body></html>`);
  assert.throws(() => bare.run(framed("1.4")), /no #map-viewport/);
  assert.equal(bare.observers.length, 0, "nothing is watched");
});
