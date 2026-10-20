import { test } from "node:test";
import assert from "node:assert/strict";
import { El } from "../../test-support/element-shim.ts";
import { createHold, markCaption } from "../../src/site/explorer/glass-hold.ts";

const TITLE = "The Environs of Paukilua · regional survey · band 1 · drawn in 900ms";

function rig(initial: string) {
  const press = new El("button");
  let caption = initial;
  const seen = { caption: [] as string[], writes: 0, hold: 0, letGo: 0, release: 0 };
  const hold = createHold({
    press,
    readCaption: () => caption,
    setCaption: (text) => {
      seen.writes++;
      caption = text;
    },
    onHold: () => {
      seen.hold++;
      seen.caption.push(caption);
    },
    onLetGo: () => void seen.letGo++,
    onRelease: () => void seen.release++,
  });
  return { press, hold, seen, caption: () => caption };
}

test("a press holds the sheet: it lights, drops a draft in flight, then marks the caption (Issue #751)", () => {
  const r = rig(TITLE);
  r.press.fire("click");
  assert.equal(r.hold.held(), true);
  assert.equal(r.press.getAttribute("aria-pressed"), "true");
  assert.equal(r.seen.hold, 1, "onHold runs once");
  assert.equal(r.seen.letGo, 0);
  assert.equal(r.seen.release, 0);
  assert.deepEqual(r.seen.caption, [TITLE], "the caption onHold saw carries no mark");
  assert.equal(r.caption(), `${TITLE} · held`);
});

test("a second press lets go: unlit, the mark stripped, and the let-go runs once (Issue #751)", () => {
  const r = rig(TITLE);
  r.press.fire("click");
  r.press.fire("click");
  assert.equal(r.hold.held(), false);
  assert.equal(r.press.getAttribute("aria-pressed"), "false");
  assert.equal(r.caption(), TITLE);
  assert.equal(r.seen.letGo, 1, "onLetGo runs once");
  assert.equal(r.seen.release, 0);
});

test("a home lets go through the release, never the let-go, and a release with nothing held writes nothing (Issue #751)", () => {
  const r = rig(TITLE);
  r.press.fire("click");
  r.hold.release();
  assert.equal(r.hold.held(), false);
  assert.equal(r.press.getAttribute("aria-pressed"), "false");
  assert.equal(r.caption(), TITLE);
  assert.equal(r.seen.release, 1, "onRelease runs once");
  assert.equal(r.seen.letGo, 0, "a release is not a let-go");

  const free = rig("island · temperate · drawn in 547ms");
  const writesBefore = free.seen.writes;
  free.hold.release();
  assert.equal(free.seen.writes, writesBefore, "a free release writes no caption");
  assert.equal(free.seen.release, 0, "a free release calls nothing");
});

test("the mark is added once and stripped only from the end (Issue #751)", () => {
  assert.equal(markCaption("A", true), "A · held");
  assert.equal(markCaption("A · held", true), "A · held");
  assert.equal(markCaption("", true), "held");
  assert.equal(markCaption("held", false), "");
  assert.equal(markCaption("A · held", false), "A");
  assert.equal(markCaption("held up · A", false), "held up · A");
});
