import { test } from "node:test";
import assert from "node:assert/strict";
import { stillResting, type InstrumentPos } from "../../src/site/reading-room/rearm-window.ts";

// #373: the room arms on the straight-line tour while the matrix runs off-thread, then re-arms silently when the travel order lands.
// That second arm REPAINTS the instrument, so the window it may run in is the whole safety of the design: a reader who moved anything keeps what they are looking at, and waits for the next draw to sail the ordered itinerary.

const RESTING: InstrumentPos = { chamber: "ages", t: null, year: 1420, playing: false, held: false };

test("#373 the room re-arms when the reader has not moved the instrument", () => {
  assert.equal(stillResting(RESTING, { ...RESTING }), true);
});

test("#373 a reader who scrubbed to another year keeps it", () => {
  assert.equal(stillResting(RESTING, { ...RESTING, year: 900 }), false);
});

test("#373 a reader who crossed to the survey chamber keeps it", () => {
  // The one chamber where the overlay is SHOWN, so this is the crossing that would make the re-order visible.
  assert.equal(stillResting(RESTING, { chamber: "survey", t: 0.4, year: null, playing: false, held: false }), false);
});

test("#373 a survey rest that has not moved is still re-armable", () => {
  const survey: InstrumentPos = { chamber: "survey", t: 1, year: null, playing: false, held: false };
  assert.equal(stillResting(survey, { ...survey }), true);
  assert.equal(stillResting(survey, { ...survey, t: 0.5 }), false);
});

test("#373 a sweep in flight is never interrupted", () => {
  assert.equal(stillResting(RESTING, { ...RESTING, playing: true }), false);
});

test("#373 a held drag is never interrupted", () => {
  // held and playing are separate flags: a paused drag reads playing false, and repainting under the reader's finger is the same defect.
  assert.equal(stillResting(RESTING, { ...RESTING, held: true }), false);
});

test("#373 no instrument on either side means no re-arm", () => {
  assert.equal(stillResting(null, { ...RESTING }), false);
  assert.equal(stillResting(RESTING, null), false);
  assert.equal(stillResting(null, null), false);
});
