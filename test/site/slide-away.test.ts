import { test } from "node:test";
import assert from "node:assert/strict";
import {
  arms,
  fillDepth,
  folioTravel,
  followStart,
  grown,
  headTravel,
  holdZone,
  reachOf,
  slideProgress,
  steers,
  within,
} from "../../src/site/explorer/slide-away.ts";

const ROOM = { left: 0, top: 0, right: 1000, bottom: 800 };

test("SA1 the fill depth is the magnification about the sheet's centre that reaches the room's farthest edge, each edge binding in turn", () => {
  assert.equal(fillDepth({ left: 700, top: 1, right: 900, bottom: 799 }, ROOM), 8, "the left edge binds");
  assert.equal(fillDepth({ left: 100, top: 1, right: 300, bottom: 799 }, ROOM), 8, "the right edge binds");
  assert.equal(fillDepth({ left: 1, top: 500, right: 999, bottom: 700 }, ROOM), 6, "the top edge binds");
  assert.equal(fillDepth({ left: 1, top: 100, right: 999, bottom: 300 }, ROOM), 6, "the bottom edge binds");
  assert.equal(fillDepth({ left: -10, top: -10, right: 1010, bottom: 810 }, ROOM), 1, "a sheet already covering");
});

test("SA2 the follow starts where the first press lands, or at the fill where the fill comes first", () => {
  assert.equal(followStart(1.94, 1.4), 1.4);
  assert.equal(followStart(1.3, 1.4), 1.3);
});

test("SA3 the slide follows the log of depth from the start to the fill, and reduced motion leaves at the fill alone", () => {
  assert.equal(slideProgress(1.4, 1.4, 1.94, false), 0, "at the start");
  assert.equal(slideProgress(1, 1.4, 1.94, false), 0, "below the start");
  assert.ok(
    Math.abs(slideProgress(Math.sqrt(1.4 * 1.94), 1.4, 1.94, false) - 0.5) < 1e-9,
    "half way at the geometric mean",
  );
  assert.equal(slideProgress(1.94, 1.4, 1.94, false), 1, "at the fill");
  assert.equal(slideProgress(2.744, 1.4, 1.94, false), 1, "past the fill");
  assert.equal(slideProgress(1.9, 1.4, 1.94, true), 0, "reduced, short of the fill");
  assert.equal(slideProgress(1.94, 1.4, 1.94, true), 1, "reduced, at the fill");
  assert.equal(slideProgress(1.46, 1.46, 1.46, false), 1, "start equal to the fill, at it");
  assert.equal(slideProgress(1.45, 1.46, 1.46, false), 0, "start equal to the fill, short of it");
});

test("SA4 the head clears its nav by 3 px past the top and the folio keeps its title 2 px above the foot", () => {
  assert.equal(headTravel(127.4), -131);
  assert.equal(folioTravel(800, 741.5), 57);
});

test("SA5 a key arms the slide anywhere, a wheel or a press only on the chart or the Glass", () => {
  assert.equal(arms({ type: "keydown", onChart: false }), true);
  assert.equal(arms({ type: "wheel", onChart: true }), true);
  assert.equal(arms({ type: "wheel", onChart: false }), false);
  assert.equal(arms({ type: "pointerdown", onChart: true }), true);
  assert.equal(arms({ type: "pointerdown", onChart: false }), false);
});

test("SA8 only a mouse or a pen steers the hold", () => {
  assert.equal(steers("mouse"), true);
  assert.equal(steers("pen"), true);
  assert.equal(steers("touch"), false);
  assert.equal(steers(""), false);
});

test("SA7 a piece's hold zone is its home box grown by its panel's reach and stretched to the edge it slides toward", () => {
  const reach = reachOf({ top: "-11.2px", right: "-14.4px", bottom: "-12.8px", left: "-14.4px" });
  assert.deepEqual(reach, { left: 14.4, top: 11.2, right: 14.4, bottom: 12.8 });
  assert.deepEqual(reachOf({ top: "auto", right: "", bottom: "4px", left: "0px" }), {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
  const home = { left: 26, top: 22, right: 510, bottom: 127 };
  const near = (a: Record<string, number>, b: Record<string, number>) => {
    for (const k of Object.keys(b)) assert.ok(Math.abs(a[k]! - b[k]!) < 1e-9, `${k}: ${a[k]} vs ${b[k]}`);
  };
  near(holdZone(home, reach, "top", 800), { left: 11.6, top: 0, right: 524.4, bottom: 139.8 });
  near(holdZone(home, reach, "bottom", 800), { left: 11.6, top: 10.8, right: 524.4, bottom: 800 });
  near(grown(home, reach), { left: 11.6, top: 10.8, right: 524.4, bottom: 139.8 });
  const box = { left: 0, top: 0, right: 10, bottom: 10 };
  assert.equal(within(0, 5, box), true);
  assert.equal(within(10, 5, box), true);
  assert.equal(within(5, 0, box), true);
  assert.equal(within(5, 10, box), true);
  assert.equal(within(-0.01, 5, box), false);
  assert.equal(within(10.01, 5, box), false);
  assert.equal(within(5, -0.01, box), false);
  assert.equal(within(5, 10.01, box), false);
});
