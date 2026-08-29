import { test } from "node:test";
import assert from "node:assert/strict";
import { SLIP_CLEARANCE, fitStage } from "../../src/site/seed-of-the-day/stage-fit.ts";

// #462 chart-room ruling 1: the chart is fitted to the space the chrome leaves, measured off the chrome rects, never guessed.

const ASPECT = 1500 / 1157.931;
const base = { view: { w: 1280, h: 800 }, aspect: ASPECT, gap: 14, narrow: false };

test("the reserves are the chrome's own edges plus the gap: the lowest bottom above, the highest top below", () => {
  const fit = fitStage({ ...base, above: [79, 108], below: [690, 720], beside: 0 });
  assert.equal(fit.reserve.top, 108 + 14, "the room folio, lower than the cluster, bounds the top");
  assert.equal(fit.reserve.bottom, 800 - 690 + 14, "the chart folio, higher than the legend, bounds the bottom");
  assert.equal(fit.reserve.right, 0, "nothing stands beside a folded slip");
});

test("an open slip takes its width plus the mockup's clearance from the right", () => {
  const fit = fitStage({ ...base, above: [100], below: [700], beside: 352 });
  assert.equal(fit.reserve.right, 352 + SLIP_CLEARANCE);
  assert.ok(fit.sheet.w <= 1280 - 352 - SLIP_CLEARANCE, "the sheet stays clear of the slip");
});

test("the sheet keeps the chart's aspect and touches the tighter free edge", () => {
  const wide = fitStage({ ...base, above: [100], below: [700], beside: 0 });
  assert.ok(Math.abs(wide.sheet.w / wide.sheet.h - ASPECT) < 1e-9, "aspect held");
  assert.ok(Math.abs(wide.sheet.h - (700 - 100 - 28)) < 1e-9, "a wide free box is height-bound");
  const tall = fitStage({ ...base, view: { w: 600, h: 800 }, above: [100], below: [700], beside: 0 });
  assert.ok(Math.abs(tall.sheet.w - 600) < 1e-9, "a tall free box is width-bound");
});

test("a narrow sheet fits the viewport's width at least, so a landscape phone pans instead of squinting", () => {
  const fit = fitStage({ ...base, view: { w: 844, h: 390 }, above: [60], below: [300], beside: 0, narrow: true });
  assert.equal(fit.sheet.w, 844, "at least the viewport's width");
  assert.ok(fit.sheet.h > 390 - 60 - 90 - 28, "so it overflows the free height and pans");
  const still = fitStage({ ...base, view: { w: 844, h: 390 }, above: [60], below: [300], beside: 0 });
  assert.ok(still.sheet.w < 844, "the same box on a wide sheet keeps the fit");
});

test("no chrome at all leaves the gap alone, and a chrome past the viewport cannot push the floor below it", () => {
  const bare = fitStage({ ...base, above: [], below: [], beside: 0 });
  assert.equal(bare.reserve.top, 14);
  assert.equal(bare.reserve.bottom, 14);
  const past = fitStage({ ...base, above: [], below: [900], beside: 0 });
  assert.equal(past.reserve.bottom, 14, "a rect below the fold does not reserve negative space");
});
