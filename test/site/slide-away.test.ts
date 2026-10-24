import { test } from "node:test";
import assert from "node:assert/strict";
import {
  type Edges,
  arms,
  fillDepth,
  fillAboutCentre,
  fillPress,
  folioTravel,
  followStart,
  grown,
  headTravel,
  holdZone,
  keptStart,
  reachOf,
  restingBox,
  slideProgress,
  steers,
  within,
} from "../../src/site/shared/slide-away.ts";

const ROOM = { left: 0, top: 0, right: 1000, bottom: 800 };

test("SA1 the fill depth is the magnification about the sheet's centre that reaches the room's farthest edge, each edge binding in turn", () => {
  assert.equal(fillDepth({ left: 700, top: 1, right: 900, bottom: 799 }, ROOM), 8, "the left edge binds");
  assert.equal(fillDepth({ left: 100, top: 1, right: 300, bottom: 799 }, ROOM), 8, "the right edge binds");
  assert.equal(fillDepth({ left: 1, top: 500, right: 999, bottom: 700 }, ROOM), 6, "the top edge binds");
  assert.equal(fillDepth({ left: 1, top: 100, right: 999, bottom: 300 }, ROOM), 6, "the bottom edge binds");
  assert.equal(fillDepth({ left: -10, top: -10, right: 1010, bottom: 810 }, ROOM), 1, "a sheet already covering");
});

test("SA2 the follow starts where the Glass's press before the press that fills lands, at the first press where the second press fills, and at the fill where the first press fills (Alex, 2026-10-23, Issue #997 ruling 5)", () => {
  assert.equal(followStart(1.94, 1.4), 1.4);
  assert.equal(followStart(1.3, 1.4), 1.3);
  assert.equal(followStart(2.2069, 1.4), 1.4 * 1.4);
  assert.equal(followStart(2.5827, 1.4), 1.4 * 1.4);
  assert.equal(followStart(3, 1.4), 1.4 * 1.4 * 1.4);
  assert.equal(followStart(1.4 * 1.4, 1.4), 1.4, "a fill exactly at the second press's landing is the second press's");
  assert.equal(
    followStart(1.9615, 1.4),
    1.4 * 1.4,
    "the Prospect's 1280x640 fill lies past the second press's 1.9599999999999997",
  );
  assert.equal(followStart(Infinity, 1.4), Infinity);
});

test("SA9 the press that fills is the first of the Glass's compounded presses at or past the fill", () => {
  assert.equal(fillPress(1.5334, 1.4), 1.4 * 1.4);
  assert.equal(fillPress(1.3359, 1.4), 1.4);
  assert.equal(fillPress(2.0393, 1.4), 1.4 * 1.4 * 1.4);
  assert.equal(fillPress(1.4 * 1.4, 1.4), 1.4 * 1.4);
  assert.equal(fillPress(Infinity, 1.4), Infinity);
});

test("SA10 the Seed of the Day's fill is the magnification about the gesture box's centre that reaches the room's left, top and foot, its right edge unread (Alex, 2026-10-23, Issue #997 ruling 4)", () => {
  const gesture = { left: 0, top: 0, right: 1000, bottom: 800 };
  const sheet = { left: 100, top: 200, right: 400, bottom: 600 };
  assert.equal(fillAboutCentre(sheet, ROOM, gesture), 2);
  assert.equal(fillDepth(sheet, ROOM), 5, "the plain rule reads the sheet's own centre and differs");
  assert.equal(fillAboutCentre({ left: 450, top: 0, right: 900, bottom: 800 }, ROOM, gesture), 10, "the left binds");
  assert.equal(fillAboutCentre({ left: -10, top: -10, right: 1010, bottom: 810 }, ROOM, gesture), 1);
  const low = { left: 0, top: 100, right: 1000, bottom: 800 };
  assert.ok(Math.abs(fillAboutCentre(sheet, ROOM, low) - 7 / 3) < 1e-9, "the foot binds about the centre (500, 450)");
});

test("SA11 a sheet inside the camera's transform reads its resting box with the camera taken off", () => {
  assert.deepEqual(
    restingBox({ left: 50, top: 20, right: 650, bottom: 520 }, { x: 10, y: 10 }, { x: -100, y: -50, k: 2 }),
    {
      left: 80,
      top: 40,
      right: 380,
      bottom: 290,
    },
  );
  const box = { left: 50, top: 20, right: 650, bottom: 520 };
  assert.deepEqual(restingBox(box, { x: 10, y: 10 }, { x: 0, y: 0, k: 1 }), box);
});

test("SA12 a measure taken while the camera stands past the start and short of the fill keeps that start, and at or under the start or at or past the fill takes the room's own (Issue #996 step 6 ruling 4; Alex, 2026-10-23, Issue #1034)", () => {
  assert.equal(keptStart(1.96, 1.4, 1.96, 2.1118), 1.4, "a fold at the second press keeps the first press's start");
  assert.equal(keptStart(1.96, 1.4, 1.4, 2.1118), 1.96, "at the start both pieces stand home, so the room's own");
  assert.equal(keptStart(1.96, 1.4, 1.2, 2.1118), 1.96);
  assert.equal(keptStart(1.96, 1.4, 2.744, 2.1118), 1.96, "past the fill the room's own");
  assert.equal(keptStart(1.96, 1.4, 2.1118, 2.1118), 1.96, "at the fill exactly");
  assert.equal(
    keptStart(1.4, 1.96, 2.744, 1.8015),
    1.4,
    "a fold that narrows the room: its own start, its fill lying under the depth",
  );
  assert.equal(keptStart(Infinity, 1.4, 1.96, Infinity), 1.4, "a room that never fills keeps the start");
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

test("SA5 a key arms the slide anywhere on the Explorer and only on the chart or the Glass in a room, and a wheel or a press only on the chart or the Glass (Issue #996; Alex, 2026-10-23, Issue #997 ruling 7)", () => {
  assert.equal(arms({ type: "keydown", onChart: false }, true), true);
  assert.equal(arms({ type: "keydown", onChart: false }, false), false);
  assert.equal(arms({ type: "keydown", onChart: true }, false), true);
  assert.equal(arms({ type: "wheel", onChart: true }, false), true);
  assert.equal(arms({ type: "wheel", onChart: false }, true), false);
  assert.equal(arms({ type: "pointerdown", onChart: true }, false), true);
  assert.equal(arms({ type: "pointerdown", onChart: false }, true), false);
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
  const near = (a: Edges, b: Edges) => {
    for (const k of ["left", "top", "right", "bottom"] as const)
      assert.ok(Math.abs(a[k] - b[k]) < 1e-9, `${k}: ${a[k]} vs ${b[k]}`);
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
