import { test } from "node:test";
import assert from "node:assert/strict";
import { CHROME_GAP, SLIP_CLEARANCE, fitStage } from "../../src/site/shared/stage-fit.ts";

// Issue #462 chart-room ruling 1: the chart is fitted to the space the chrome leaves, measured off the chrome rects, never guessed.

const ASPECT = 1500 / 1157.931;
const base = { view: { w: 1280, h: 800 }, aspect: ASPECT, gap: 14, narrow: false };

// Issue #463 plate read: at 1680 the keys slip (123px wide, right-aligned under the Glass) ran 17px under the centred sheet, because the reserve knew only the slip. The Glass's left edge bounds the sheet whenever it is handed in.
test("chrome standing at the right edge (the Glass) widens the reserve past the slip's clearance when it reaches further in", () => {
  const withGlass = fitStage({ ...base, above: [100], below: [700], beside: 384, right: [790] });
  assert.equal(withGlass.reserve.right, 1280 - 790 + 14, "the Glass's left edge plus the gap, since that reaches further in than the slip's clearance");
  const glassClear = fitStage({ ...base, above: [100], below: [700], beside: 384, right: [1100] });
  assert.equal(glassClear.reserve.right, 384 + SLIP_CLEARANCE, "a Glass inside the clearance changes nothing");
  assert.equal(fitStage({ ...base, above: [100], below: [700], beside: 0, right: [] }).reserve.right, 0, "no slip, no Glass beside it: no reserve");
});

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

test("the narrow width floor is a landscape rule: a portrait page fits the free height instead of running under the fixed chrome", () => {
  const page = fitStage({ ...base, aspect: 0.5, view: { w: 390, h: 844 }, above: [84], below: [738], gap: 8, beside: 0, narrow: true });
  assert.ok(Math.abs(page.sheet.w / page.sheet.h - 0.5) < 1e-9, "aspect held");
  assert.ok(page.sheet.h <= 844 - 92 - 114 + 1e-9, "height-bound inside the free box");
  assert.ok(page.sheet.w < 390, "narrower than the viewport is the price of fitting");
  const chart = fitStage({ ...base, view: { w: 844, h: 390 }, above: [60], below: [300], beside: 0, narrow: true });
  assert.equal(chart.sheet.w, 844, "the landscape chart keeps the pan rule");
  const square = fitStage({ ...base, aspect: 1, view: { w: 390, h: 844 }, above: [600], below: [844], gap: 8, beside: 0, narrow: true });
  assert.equal(square.sheet.w, 390, "a height-bound square sheet still hits the width floor: the boundary is landscape-inclusive (guard-prover round 2 found the width-bound fixture proved nothing)");
});

test("no chrome at all leaves the gap alone, and a chrome past the viewport cannot push the floor below it", () => {
  const bare = fitStage({ ...base, above: [], below: [], beside: 0 });
  assert.equal(bare.reserve.top, 14);
  assert.equal(bare.reserve.bottom, 14);
  const past = fitStage({ ...base, above: [], below: [900], beside: 0 });
  assert.equal(past.reserve.bottom, 14, "a rect below the fold does not reserve negative space");
});

// The Explorer's own chrome as bindRoom reads it on a build of main, the Broadside open (measured 2026-10-05, Issue #762): the cluster and the folio above, the chart folio and the Press below, the slip beside, the Glass's left edge.
const explorer = (w: number, h: number, folio: number, press: number, glass: number) =>
  fitStage({ ...base, gap: CHROME_GAP, view: { w, h }, above: [127.41, 130.73], below: [folio, press], beside: 384, right: [glass] });
const near = (actual: number, expected: number, what: string) => assert.ok(Math.abs(actual - expected) < 0.05, `${what}: ${actual}, not ${expected}`);

test("a fit the chrome leaves healthy is untouched: the sheet, the reserves and no floor (Issue #762)", () => {
  const wide = explorer(1280, 800, 705.7, 639.77, 806.6);
  near(wide.sheet.w, 623.13, "the Explorer at 1280x800 keeps its fitted sheet");
  near(wide.reserve.top, 144.73, "and its top reserve");
  near(wide.reserve.bottom, 174.23, "and its bottom reserve");
  assert.equal(wide.under, false, "and runs under nothing");
  const tablet = explorer(1024, 768, 673.7, 489.23, 550.6);
  near(tablet.sheet.w, 428.13, "the Explorer at 1024x768 keeps its fitted sheet");
  assert.equal(tablet.under, false, "and runs under nothing");
  const print = fitStage({ ...base, view: { w: 1280, h: 720 }, aspect: 1.2952268987960809, above: [127.41, 131.73], below: [643.7, 486.08], beside: 352, right: [838.6] });
  near(print.sheet.w, 422.69, "the Print Room at 1280x720, within 25px of the trigger, keeps its fitted sheet");
  assert.equal(print.under, false, "and runs under nothing");
});

test("a fit that would leave the sheet under half the room it could show it in takes that whole room, under the chrome (Issue #762, ruling 4a)", () => {
  const phone = explorer(1024, 474, 379.7, 195.23, 550.6);
  near(phone.reserve.right, 487.4, "the open slip's reserve (the Glass's edge) is kept");
  near(phone.sheet.w, 1024 - 487.4 - 28, "the sheet takes the width beside the slip, less a gap each side (47.28 before the floor)");
  near(phone.sheet.h, phone.sheet.w / ASPECT, "at the chart's aspect");
  assert.equal(phone.reserve.top, 0, "the floored sheet is centred in the window's full height");
  assert.equal(phone.reserve.bottom, 0, "under the chrome above and below it");
  assert.equal(phone.under, true, "and the fit says it runs under the chrome");
  assert.ok(phone.sheet.h + 28 <= 474 + 1e-9 && phone.sheet.w + phone.reserve.right + 28 <= 1024 + 1e-9, "the whole sheet stays inside the window");
});

test("the floor fires below half the room exactly, and a sheet shorter than wide is held by the window's height (Issue #762)", () => {
  const square = { view: { w: 1000, h: 600 }, aspect: 1, gap: 0, narrow: false, beside: 0, above: [0] };
  const atHalf = fitStage({ ...square, below: [300] });
  assert.equal(atHalf.sheet.w, 300, "a sheet at exactly half the 600 room");
  assert.equal(atHalf.under, false, "is left as it is");
  const under = fitStage({ ...square, below: [299] });
  assert.equal(under.sheet.w, 600, "one pixel under half takes the room, which the window's height bounds");
  assert.equal(under.under, true);
  const portrait = fitStage({ ...base, aspect: 0.5, view: { w: 1024, h: 474 }, above: [130], below: [195], beside: 0 });
  assert.equal(portrait.under, true, "a degenerate portrait fit floors too");
  near(portrait.sheet.h, 474 - 28, "height-bound inside the window");
  near(portrait.sheet.w, (474 - 28) * 0.5, "at its own aspect");
});

test("the floor waits on a narrow layout, whose own width floor still stands until Issue #762's pull request C", () => {
  const narrow = fitStage({ ...base, aspect: 0.5, view: { w: 390, h: 844 }, above: [700], below: [760], gap: 8, beside: 0, narrow: true });
  assert.equal(narrow.under, false, "no floor on the narrow layout, even for a degenerate portrait fit the width floor leaves alone");
  near(narrow.sheet.h, 760 - 700 - 16, "the narrow fit as it was");
});
