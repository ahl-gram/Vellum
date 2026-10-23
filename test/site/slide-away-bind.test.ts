import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bindSlideAway,
  LINGER_MS,
  OFF,
  REST_MS,
  type Measured,
  type SlideAway,
} from "../../src/site/shared/slide-away-bind.ts";
import { El, installShim } from "../../test-support/element-shim.ts";

installShim();

const EASE_MS = 340;
const MEASURED: Measured = { fill: 1.94, from: 1.4, up: -105, down: 57 };
const MID = Math.sqrt(1.4 * 1.94);

class Piece extends El {
  inside: El | null = null;
  contains(n: unknown): boolean {
    return n !== null && n === this.inside;
  }
}
class Fold extends El {
  open = false;
}

interface Timer {
  readonly run: () => void;
  readonly ms: number;
  live: boolean;
}

function build(flags: { reduce?: boolean; focusVisible?: boolean } = {}) {
  const head = new Piece("header");
  const folio = new El("div");
  const atelier = new Fold("details");
  const inside = new El("a");
  head.inside = inside;
  const timers: Timer[] = [];
  const state = { reduce: flags.reduce ?? false, focusVisible: flags.focusVisible ?? true };
  const slide: SlideAway = bindSlideAway({
    head: head as unknown as HTMLElement,
    folio: folio as unknown as HTMLElement,
    atelier: atelier as unknown as HTMLDetailsElement,
    reduce: () => state.reduce,
    focusVisible: () => state.focusVisible,
    easeMs: () => EASE_MS,
    after: (run, ms) => timers.push({ run, ms, live: true }),
    cancel: (id) => {
      timers[id - 1]!.live = false;
    },
  });
  const runLive = (ms?: number): void => {
    for (const t of timers.filter((x) => x.live && (ms === undefined || x.ms === ms))) {
      t.live = false;
      t.run();
    }
  };
  const liveAt = (ms: number): number => timers.filter((t) => t.live && t.ms === ms).length;
  slide.measured(MEASURED);
  runLive();
  const read = (piece: El): string => piece.style.getPropertyValue("translate");
  const easing = (piece: El): boolean => piece.classes.has("easing");
  const armedAt = (k: number): void => {
    slide.arm();
    slide.follow(k);
    runLive(EASE_MS);
  };
  return { head, folio, atelier, inside, slide, state, runLive, liveAt, read, easing, armedAt };
}

test("SB1 unarmed, the pieces stay home at any depth; armed, they stand at their travel, eased", () => {
  const t = build();
  t.slide.follow(2.744);
  assert.equal(t.read(t.head), "", "unarmed head");
  assert.equal(t.read(t.folio), "", "unarmed folio");
  t.slide.arm();
  assert.equal(t.read(t.head), "0px -105.00px");
  assert.equal(t.read(t.folio), "0px 57.00px");
  assert.equal(t.easing(t.head) && t.easing(t.folio), true, "the arming eases");
  t.runLive(EASE_MS);
  assert.equal(t.easing(t.head) || t.easing(t.folio), false, "the timer takes the ease off");
});

test("SB2 a camera move writes the follow exactly and never eases it", () => {
  const t = build();
  t.armedAt(2.744);
  t.slide.follow(MID);
  assert.equal(t.read(t.head), "0px -52.50px");
  assert.equal(t.read(t.folio), "0px 28.50px");
  assert.equal(t.easing(t.head) || t.easing(t.folio), false);
  t.slide.follow(1);
  assert.equal(t.read(t.head), "");
  assert.equal(t.read(t.folio), "");
});

test("SB3 a moving mouse arriving on a piece that is away brings it home after REST_MS, keeps it while near, and lets it go LINGER_MS after it leaves the zone", () => {
  const t = build();
  t.armedAt(2);
  t.slide.point({ on: true, near: true }, OFF);
  assert.equal(t.liveAt(REST_MS), 1, "one rest timer");
  assert.equal(t.read(t.head), "0px -105.00px", "nothing moves before the rest is up");
  t.runLive(REST_MS);
  assert.equal(t.read(t.head), "", "home");
  assert.equal(t.easing(t.head), true);
  assert.equal(t.read(t.folio), "0px 57.00px", "the folio is unmoved");
  t.slide.point({ on: false, near: true }, OFF);
  assert.equal(t.liveAt(LINGER_MS), 0, "near the piece, nothing is scheduled");
  t.slide.point(OFF, OFF);
  assert.equal(t.liveAt(LINGER_MS), 1, "leaving the zone starts the linger");
  t.slide.point({ on: false, near: true }, OFF);
  assert.equal(t.liveAt(LINGER_MS), 0, "coming back kills it");
  t.slide.point(OFF, OFF);
  t.runLive(LINGER_MS);
  assert.equal(t.read(t.head), "0px -105.00px");
  assert.equal(t.easing(t.head), true);
});

test("SB8 a pointer on a piece at home starts nothing, and one that leaves before the rest is up cancels it", () => {
  const t = build();
  t.slide.arm();
  t.slide.follow(1);
  t.runLive(EASE_MS);
  t.slide.point({ on: true, near: true }, OFF);
  assert.equal(t.liveAt(REST_MS), 0, "at home there is nothing to bring back");
  t.slide.follow(2);
  t.slide.point({ on: true, near: true }, OFF);
  assert.equal(t.liveAt(REST_MS), 1);
  t.slide.point(OFF, OFF);
  assert.equal(t.liveAt(REST_MS), 0, "leaving kills the rest");
  assert.equal(t.read(t.head), "0px -105.00px");
});

test("SB4 keyboard focus inside the head holds it home until focus leaves the head, and a mouse's focus holds nothing", () => {
  const t = build();
  t.armedAt(2);
  t.head.fire("focusin", { target: t.inside });
  assert.equal(t.read(t.head), "", "focus inside brings the head home");
  t.head.fire("focusout", { relatedTarget: t.inside });
  assert.equal(t.read(t.head), "", "focus moving within the head keeps it");
  t.head.fire("focusout", { relatedTarget: null });
  assert.equal(t.read(t.head), "0px -105.00px", "focus leaving sends it back");
  t.runLive(EASE_MS);
  t.state.focusVisible = false;
  t.head.fire("focusin", { target: t.inside });
  assert.equal(t.read(t.head), "0px -105.00px", "a focus that is not :focus-visible holds nothing");
});

test("SB5 the chart of the atelier open holds the head home", () => {
  const t = build();
  t.armedAt(2);
  t.atelier.open = true;
  t.atelier.fire("toggle");
  assert.equal(t.read(t.head), "");
  t.atelier.open = false;
  t.atelier.fire("toggle");
  assert.equal(t.read(t.head), "0px -105.00px");
});

test("SB6 under reduced motion the pieces stand home short of the fill and away at it", () => {
  const t = build({ reduce: true });
  t.slide.arm();
  t.slide.follow(1.9);
  assert.equal(t.read(t.head), "");
  assert.equal(t.read(t.folio), "");
  t.slide.follow(1.94);
  assert.equal(t.read(t.head), "0px -105.00px");
  assert.equal(t.read(t.folio), "0px 57.00px");
});

test("SB7 a new measurement moves a slid piece with the ease, and one that moves nothing eases nothing", () => {
  const t = build();
  t.armedAt(2);
  t.slide.measured({ ...MEASURED, down: 75 });
  assert.equal(t.read(t.folio), "0px 75.00px");
  assert.equal(t.easing(t.folio), true);
  t.runLive(EASE_MS);
  t.slide.measured({ ...MEASURED, down: 75 });
  assert.equal(t.easing(t.folio), false, "the same measurement adds no ease");
  assert.equal(t.liveAt(EASE_MS), 0, "and starts no timer");
});

test("SB9 a camera move inside an ease rides it and writes the follow's value", () => {
  const t = build();
  t.armedAt(2);
  t.head.fire("focusin", { target: t.inside });
  t.head.fire("focusout", { relatedTarget: null });
  assert.equal(t.read(t.head), "0px -105.00px");
  t.slide.follow(MID);
  assert.equal(t.read(t.head), "0px -52.50px", "the follow's value");
  assert.equal(t.easing(t.head), true, "still riding the ease");
  t.runLive(EASE_MS);
  assert.equal(t.easing(t.head), false);
});

test("SB10 a second eased move inside an ease cancels the first ease's timer, so the first cannot strip the ease from the second", () => {
  const t = build();
  t.armedAt(2);
  t.head.fire("focusin", { target: t.inside });
  assert.equal(t.liveAt(EASE_MS), 1, "one ease timer after the first move");
  t.head.fire("focusout", { relatedTarget: null });
  assert.equal(t.liveAt(EASE_MS), 1, "still one: the second cancelled the first");
  assert.equal(t.easing(t.head), true);
});
