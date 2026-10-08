import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE_FLOOR, pageWidth, pageX } from "../../src/site/shared/page-box.ts";

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
