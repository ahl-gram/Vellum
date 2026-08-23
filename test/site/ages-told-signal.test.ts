import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { El, installShim } from "../../test-support/element-shim.ts";
import type { Chronicle } from "../../src/site/living-chart/chronicle.ts";
import type { Voyage } from "../../src/site/living-chart/voyage.ts";
import { toldAnnal, type ToldEntry } from "../../src/site/living-chart/told.ts";

// #402 gave the instrument a year signal so a host could decorate the story's beats.
// #442 WIDENED that one signal rather than adding a second: it now announces whatever
// the story is telling, a survey day row or a chronicle annal, because a stage holding
// two channels would have to decide which to trust and could paint a stale one over a
// live one. The signal rides the ONE paint primitive, so every path (Play, drag,
// keyboard, jump-to-end, the reduced-motion still frame, a deep-link rest) reports
// through it; buildAnnals needs a document, hence the shim.
installShim();
const { createAges } = await import("../../src/site/living-chart/ages.ts");

const REPO = resolve(import.meta.dirname, "..", "..");

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

/** The voyage's told row is the survey chamber's whole payload, so the stub owns one and records that it was asked. */
function voyageStub(told: ToldEntry | null, asked: number[] = []) {
  return {
    stub: {
      rearmVoyage: () => {},
      exitVoyage: () => {},
      clearVoyage: () => {},
      syncRestingTrack: () => {},
      internals: {
        hasSession: () => false,
        paintLive: (t: number) => asked.push(t),
        schedule: () => null,
        setOverlayVisible: () => {},
        clearRestingTrack: () => {},
        toldEntry: () => told,
      },
    } as unknown as Voyage,
    asked,
  };
}

const DAY_ROW: ToldEntry = {
  chamber: "survey",
  row: 4,
  index: 7,
  day: 61,
  text: "we came to Theril, a town standing since 902.",
};

function instrument(
  onAgesTold?: (told: ToldEntry | null) => void,
  told: ToldEntry | null = DAY_ROW,
) {
  const deps = {
    panel: new El("div"),
    playBtn: new El("button"),
    range: new El("input"),
    readout: new El("span"),
    strip: new El("ul"),
    overlay: { data: () => ({ events: EVENTS }) },
    chronicle: chronicleStub,
    voyage: voyageStub(told).stub,
    ...(onAgesTold ? { onAgesTold } : {}),
  };
  return createAges(deps as unknown as Parameters<typeof createAges>[0]);
}

test("#442 the ages chamber announces the annal being told, not merely its year", () => {
  const seen: (ToldEntry | null)[] = [];
  const ages = instrument((t) => seen.push(t));
  ages.armAges(null, null, 42, "sub"); // a first arm parks at the present
  assert.deepEqual(
    seen[0],
    { chamber: "ages", year: 900, text: "Gamma fell to ruin." },
    "the present tells the LAST annal, with the prose the journal row carries",
  );
  ages.scrubToYear(700);
  assert.deepEqual(seen[1], { chamber: "ages", year: 700, text: "A war was fought." });
  ages.scrubToYear(451);
  assert.deepEqual(seen[2], { chamber: "ages", year: 451, text: "Alpha was founded." });
});

test("#442 the survey chamber announces the voyage's told day row, never a null year", () => {
  const seen: (ToldEntry | null)[] = [];
  const ages = instrument((t) => seen.push(t));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "survey", t: 1 } });
  assert.deepEqual(seen[0], DAY_ROW, "the survey half carries the row, so the plate has a port to draw");
  assert.equal(seen[0]?.chamber, "survey", "and it is discriminated by chamber, not by a null");
});

test("#442 the signal is ONE message: the payload switches chamber, it never doubles up", () => {
  const seen: (ToldEntry | null)[] = [];
  const ages = instrument((t) => seen.push(t));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "survey", t: 1 } });
  ages.scrubToYear(700);
  assert.deepEqual(
    seen.map((t) => t?.chamber ?? null),
    ["survey", "ages"],
    "crossing the seam re-labels the same signal",
  );
  // The contract in source: exactly one told-shaped member on the host's scrubber, so a
  // future sub cannot quietly add the second channel this ruling rejected. Blind spot,
  // argued: it reads the boundary's TEXT, so a channel added under another name escapes
  // it; that costs a miss on a rename, never a false alarm on a working one.
  const boundary = readFileSync(resolve(REPO, "src/site/living-chart/index.ts"), "utf8");
  const refs = boundary.match(/export interface ScrubberRefs \{[\s\S]*?\n\}/)?.[0];
  assert.ok(refs, "the boundary still declares ScrubberRefs");
  const told = refs.match(/^\s*onAges\w*\??:/gm) ?? [];
  assert.equal(told.length, 1, `the scrubber carries one told signal, found ${told.join(", ")}`);
});

test("#442 a deep-link year rest announces on the arming paint itself", () => {
  const seen: (ToldEntry | null)[] = [];
  const ages = instrument((t) => seen.push(t));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 900 } });
  assert.deepEqual(seen, [{ chamber: "ages", year: 900, text: "Gamma fell to ruin." }]);
});

test("#442 the earliest year in range tells the FIRST annal, not a later one", () => {
  const seen: (ToldEntry | null)[] = [];
  const ages = instrument((t) => seen.push(t));
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 900 } });
  ages.scrubToYear(451);
  assert.deepEqual(seen[seen.length - 1], { chamber: "ages", year: 451, text: "Alpha was founded." });
});

// The `last === null` branch, which nothing reached before: the chronicle's range starts
// at the first event, so no year the bar can reach falls before it and only a world whose
// annals all postdate the position exercises it. Pure, so it is provable here even though
// the seam cannot produce it (a cold review flagged the branch as unbacked prose).
test("#442 a position before EVERY annal tells nothing at all, rather than the earliest", () => {
  assert.equal(toldAnnal([{ year: 900, text: "late" }], 800), null, "nothing is told yet");
  assert.equal(toldAnnal([], 800), null, "and an empty chronicle tells nothing either");
  assert.deepEqual(
    toldAnnal([{ year: 900, text: "late" }], 900),
    { chamber: "ages", year: 900, text: "late" },
    "the polarity: one year later the same annal IS told, so the null is a boundary and not a dead return",
  );
});

test("#442 clearAges and exitAges announce null so a stale row cannot outlive its world", () => {
  for (const teardown of ["clearAges", "exitAges"] as const) {
    const seen: (ToldEntry | null)[] = [];
    const ages = instrument((t) => seen.push(t));
    ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 700 } });
    (ages as unknown as Record<string, () => void>)[teardown]!();
    assert.equal(seen[seen.length - 1], null, `${teardown} clears the told row`);
  }
});

test("#442 the signal is optional: an instrument without it still paints", () => {
  const ages = instrument();
  ages.armAges(null, null, 42, "sub", { rest: { chamber: "ages", year: 700 } });
  ages.scrubToYear(900);
  assert.equal(ages.agesState()?.year, 900);
});
