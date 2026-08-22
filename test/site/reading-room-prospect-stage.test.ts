import { test } from "node:test";
import assert from "node:assert/strict";
import { installShim } from "../../test-support/element-shim.ts";
import type { StoryBeat } from "../../src/site/reading-room/beats.ts";

// The stage BUILDS DOM, so the shim stands in for the environment; the blob-URL seams
// are injected so the swap policy runs in Node.
installShim();
const { createProspectStage } = await import("../../src/site/reading-room/prospect-stage.ts");

const BEATS: StoryBeat[] = [
  { index: 0, year: 451, kind: "founding" },
  { index: 5, year: 620, kind: "founding" },
];

const tick = () => new Promise((r) => setTimeout(r, 0));

function harness() {
  const fetched: StoryBeat[] = [];
  const revoked: string[] = [];
  const stage = createProspectStage({
    toUrl: (svg) => `url:${svg}`,
    revokeUrl: (url) => revoked.push(url),
  });
  const fetchPlate = (b: StoryBeat) => {
    fetched.push(b);
    return Promise.resolve({ svg: `svg-${b.index}`, name: `Town${b.index}` });
  };
  const hrefFor = (b: StoryBeat) => `/prospect/#i=${b.index}&year=${b.year}`;
  return { stage, fetched, revoked, fetchPlate, hrefFor };
}

test("#402 the stage stays hidden before the first beat and reveals on the crossing", async () => {
  const { stage, fetchPlate, hrefFor } = harness();
  stage.setWorld(BEATS, fetchPlate, hrefFor);
  stage.onYear(450);
  await tick();
  assert.equal(stage.root.hidden, true, "before the first founding, no plate");

  stage.onYear(451);
  await tick();
  assert.equal(stage.root.hidden, false, "the founding crossing reveals the plate");
  assert.equal((stage.img as { src?: string }).src, "url:svg-0");
  assert.match(stage.img.alt, /Town0/);
  assert.equal((stage.link as { href?: string }).href, "/prospect/#i=0&year=451");
});

test("#402 scrubbing back before the first beat hides the plate again", async () => {
  const { stage, fetchPlate, hrefFor } = harness();
  stage.setWorld(BEATS, fetchPlate, hrefFor);
  stage.onYear(700);
  await tick();
  assert.equal(stage.root.hidden, false);
  stage.onYear(400);
  assert.equal(stage.root.hidden, true);
});

test("#402 a null year (survey chamber, teardown) hides the plate", async () => {
  const { stage, fetchPlate, hrefFor } = harness();
  stage.setWorld(BEATS, fetchPlate, hrefFor);
  stage.onYear(1218);
  await tick();
  assert.equal(stage.root.hidden, false);
  stage.onYear(null);
  assert.equal(stage.root.hidden, true);
});

test("#402 prefetch pulls every beat ahead of the sweep, and a 60fps repaint fetches nothing more", async () => {
  const { stage, fetched, fetchPlate, hrefFor } = harness();
  stage.setWorld(BEATS, fetchPlate, hrefFor);
  stage.prefetch();
  assert.equal(fetched.length, BEATS.length, "every beat's plate is pulled ahead of the sweep");
  stage.onYear(460);
  stage.onYear(470);
  stage.onYear(480);
  await tick();
  assert.equal(fetched.length, BEATS.length, "repaints inside one beat fetch nothing");
  assert.equal((stage.img as { src?: string }).src, "url:svg-0");
});

// The failure path re-arms the world beside lastRes with no prefetch step (the skeptic's
// 2026-08-22 finding), so a plate asked for before any prefetch must fetch on demand.
test("#402 a beat shown before any prefetch still fetches on demand", async () => {
  const { stage, fetched, fetchPlate, hrefFor } = harness();
  stage.setWorld(BEATS, fetchPlate, hrefFor);
  assert.equal(fetched.length, 0, "setWorld alone pulls nothing: prefetch is the arm's step");
  stage.onYear(451);
  await tick();
  assert.equal(stage.root.hidden, false, "the plate still arrives, fetched on demand");
  assert.equal(fetched.length, 1, "one beat asked for, one fetch");
});

test("#402 a late plate for a beat the story already left never lands", async () => {
  const { stage, revoked, hrefFor } = harness();
  const holds = new Map<number, (r: { svg: string; name: string }) => void>();
  const slowFetch = (b: StoryBeat) =>
    new Promise<{ svg: string; name: string }>((res) => holds.set(b.index, res));
  stage.setWorld(BEATS, slowFetch, hrefFor);
  stage.onYear(451); // beat 0 requested, unresolved
  stage.onYear(620); // the story moved on to beat 5
  holds.get(5)!({ svg: "svg-5", name: "Town5" });
  await tick();
  assert.equal((stage.img as { src?: string }).src, "url:svg-5");
  holds.get(0)!({ svg: "svg-0", name: "Town0" });
  await tick();
  assert.equal((stage.img as { src?: string }).src, "url:svg-5", "the stale plate never lands");
  assert.equal(revoked.length, 0, "both plates belong to the live world: nothing revoked");
});

test("#402 a counter draw revokes the old world's plates and unbinds in-flight ones", async () => {
  const { stage, revoked, fetchPlate, hrefFor } = harness();
  const holds = new Map<number, (r: { svg: string; name: string }) => void>();
  const slowFetch = (b: StoryBeat) =>
    new Promise<{ svg: string; name: string }>((res) => holds.set(b.index, res));
  stage.setWorld(BEATS, slowFetch, hrefFor);
  stage.prefetch();
  stage.onYear(451);
  holds.get(0)!({ svg: "svg-0", name: "Town0" });
  await tick();
  assert.equal(stage.root.hidden, false);

  const nextBeats: StoryBeat[] = [{ index: 2, year: 500, kind: "founding" }];
  stage.setWorld(nextBeats, fetchPlate, hrefFor);
  assert.equal(stage.root.hidden, true, "a new world clears the stage");
  holds.get(5)!({ svg: "svg-5", name: "Town5" }); // the OLD world's in-flight prefetch lands late
  await tick();
  assert.ok(revoked.includes("url:svg-0"), "the old world's bound plate is revoked");
  assert.ok(revoked.includes("url:svg-5"), "the old world's late plate is revoked on arrival");
  assert.equal(stage.root.hidden, true, "the late plate never shows");
});

test("#402 a failed plate leaves the stage hidden and the clock untouched", async () => {
  const { stage, hrefFor } = harness();
  const failFetch = () => Promise.reject(new Error("the engraver slipped"));
  stage.setWorld(BEATS, failFetch, hrefFor);
  stage.onYear(451);
  await tick();
  assert.equal(stage.root.hidden, true, "no plate, no reveal, no thrown error");
});
