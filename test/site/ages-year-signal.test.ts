import { test } from "node:test";
import assert from "node:assert/strict";
import { El, installShim } from "../../test-support/element-shim.ts";
import type { Chronicle } from "../../src/site/living-chart/chronicle.ts";
import type { Voyage } from "../../src/site/living-chart/voyage.ts";

// #402: the instrument announces the story's year so a host can decorate beats (the
// Reading Room's prospect stage). The signal rides the ONE paint primitive, so every
// path (Play, drag, keyboard, jump-to-end, the reduced-motion still frame, a deep-link
// rest) reports through it; buildAnnals needs a document, hence the shim.
installShim();
const { createAges } = await import("../../src/site/living-chart/ages.ts");

const EVENTS = [
  { year: 451, kind: "founding", settlement: 0, text: "Alpha was founded." },
  { year: 700, kind: "war", text: "A war was fought." },
  { year: 900, kind: "ruin", settlement: 3, text: "Gamma fell to ruin." },
];

const chronicleStub = {
  applyScrub: () => {},
  isActive: () => true,
  scrubState: () => ({ min: 451, max: 1218 }),
  paintYear: () => {},
  exitScrub: () => {},
  clearScrub: () => {},
} as unknown as Chronicle;

const voyageStub = {
  rearmVoyage: () => {},
  exitVoyage: () => {},
  clearVoyage: () => {},
  syncRestingTrack: () => {},
  internals: {
    hasSession: () => false,
    paintLive: () => {},
    schedule: () => null,
    setOverlayVisible: () => {},
    clearRestingTrack: () => {},
  },
} as unknown as Voyage;

function instrument(onAgesYear?: (year: number | null) => void) {
  const deps = {
    panel: new El("div"),
    playBtn: new El("button"),
    range: new El("input"),
    readout: new El("span"),
    strip: new El("ul"),
    overlay: { data: () => ({ events: EVENTS }) },
    chronicle: chronicleStub,
    voyage: voyageStub,
    ...(onAgesYear ? { onAgesYear } : {}),
  };
  return createAges(deps as unknown as Parameters<typeof createAges>[0]);
}

test("#402 every paint announces the ages year, and null off the ages chamber", () => {
  const seen: (number | null)[] = [];
  const ages = instrument((y) => seen.push(y));
  ages.armAges(null, null, 42, "sub"); // a first arm parks at the present
  ages.scrubToYear(700);
  ages.scrubToYear(99999); // clamps to the range's present
  ages.snapToRest(); // ages-chamber rest is the present
  ages.exitAges();
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "survey", t: 1 } });
  assert.deepEqual(seen, [1218, 700, 1218, 1218, null, null], "the survey chamber announces null, not a year");
});

test("#402 a deep-link year rest announces on the arming paint itself", () => {
  const seen: (number | null)[] = [];
  const ages = instrument((y) => seen.push(y));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 900 } });
  assert.deepEqual(seen, [900]);
});

test("#402 clearAges announces null so a stale plate cannot outlive its world", () => {
  const seen: (number | null)[] = [];
  const ages = instrument((y) => seen.push(y));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 700 } });
  ages.clearAges();
  assert.equal(seen[seen.length - 1], null);
});

test("#402 the signal is optional: an instrument without it still paints", () => {
  const ages = instrument();
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 700 } });
  ages.scrubToYear(900);
  assert.equal(ages.agesState()?.year, 900);
});
