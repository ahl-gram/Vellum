import { test } from "node:test";
import assert from "node:assert/strict";
import { bindSlideAway } from "../../src/site/shared/slide-away-bind.ts";
import { awayAt, bandAway } from "../../src/site/primer/head-away.ts";
import { El, installShim } from "../../test-support/element-shim.ts";

installShim();

function slid(reduce: boolean): El {
  const head = new El("header");
  const slide = bindSlideAway({
    head: head as unknown as HTMLElement,
    folio: null,
    atelier: null,
    reduce: () => reduce,
    focusVisible: () => true,
    easeMs: () => 340,
    after: () => 1,
    cancel: () => {},
  });
  slide.arm();
  slide.follow(1, awayAt(101.8));
  return head;
}

test("HA1 a head bound at awayAt slides its whole travel at once at depth 1, under reduced motion too, and no folio moves (Issue #1392)", () => {
  assert.equal(slid(false).style.getPropertyValue("translate"), "0px -105.00px");
  assert.equal(slid(true).style.getPropertyValue("translate"), "0px -105.00px");
});

test("HA2 bandAway takes the head's travel off the band in rem (Issue #1392)", () => {
  assert.equal(bandAway(10.6, -105, 16), 4.0375);
});
