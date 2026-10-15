import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE_FLOOR, deskFrameDue, pageWidth, pageX, pageY } from "../../src/site/shared/page-box.ts";

test("UF1 the page is never narrower than the floor, and is the window from the floor up", () => {
  assert.equal(PAGE_FLOOR, 1024);
  assert.equal(pageWidth(640), 1024, "a 640 window lays out the 1024 page");
  assert.equal(pageWidth(1023), 1024, "one pixel under the floor still lays out the floor");
  assert.equal(pageWidth(1024), 1024, "at the floor the page is the window");
  assert.equal(pageWidth(1280), 1280, "above the floor the page is the window, never capped at the floor");
});

test("UF2 a viewport x read while the page is scrolled sideways is the page x less the scroll", () => {
  assert.equal(pageX(-358, 384), 26, "the cluster read at -358 with the page scrolled 384 stands at 26 on the page");
  assert.equal(pageX(26, 0), 26, "unscrolled, the two agree");
});

test("UF3 a viewport y read while the page is scrolled down a desk frame is the page y less the scroll (Issue #778)", () => {
  assert.equal(pageY(-180, 294), 114, "the slip's top read at -180 with the frame scrolled 294 stands at 114 on the page");
  assert.equal(pageY(114, 0), 114, "unscrolled, the two agree");
});

test("UF4 a page that boots set small to fit the screen takes the desk frame, either way up, and a page at full size or larger never does (Issue #778 rulings 9 and 10)", () => {
  assert.equal(deskFrameDue(0.380859375), true, "390x844 phone upright: 390 / 1024");
  assert.equal(deskFrameDue(0.82421875), true, "844x390 phone sideways");
  assert.equal(deskFrameDue(0.80078125), true, "820x1180 tablet upright");
  assert.equal(deskFrameDue(1), false, "a 1024x768 tablet, and every desktop, lays the page out at full size");
  assert.equal(deskFrameDue(1.15234375), false, "an 1180x820 tablet held sideways enlarges the page");
});
