import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { installShim } from "../../test-support/element-shim.ts";
import type { PlateSpec } from "../../src/site/reading-room/told-plate.ts";

// The stage BUILDS DOM, so the shim stands in for the environment; the blob-URL seams
// are injected so the swap policy runs in Node. #442 made the stage plate-shaped: it
// draws the PlateSpec it is handed, and which spec a told row means is told-plate.ts's.
installShim();
const { createProspectStage } = await import("../../src/site/reading-room/prospect-stage.ts");

const REPO = resolve(import.meta.dirname, "..", "..");

const BEAT: PlateSpec = { index: 0, year: 451 };
const LATER: PlateSpec = { index: 5, year: 620 };
// The same town, at the present rather than at its founding: a DIFFERENT plate, since prospectPlate reads the year as an era filter.
const SAME_TOWN_TODAY: PlateSpec = { index: 0, year: 1218 };

const tick = () => new Promise((r) => setTimeout(r, 0));

function harness() {
  const fetched: PlateSpec[] = [];
  const revoked: string[] = [];
  const stage = createProspectStage({
    toUrl: (svg) => `url:${svg}`,
    revokeUrl: (url) => revoked.push(url),
  });
  const fetchPlate = (s: PlateSpec) => {
    fetched.push(s);
    return Promise.resolve({ svg: `svg-${s.index}-${s.year}`, name: `Town${s.index}` });
  };
  const hrefFor = (s: PlateSpec) => `/prospect/#i=${s.index}&year=${s.year}`;
  return { stage, fetched, revoked, fetchPlate, hrefFor };
}

test("#442 the stage rests hidden and reveals the plate it is shown", async () => {
  const { stage, fetchPlate, hrefFor } = harness();
  stage.setWorld(fetchPlate, hrefFor);
  assert.equal(stage.root.hidden, true, "a bound world alone shows nothing");

  stage.show(BEAT);
  await tick();
  assert.equal(stage.root.hidden, false, "the plate appears");
  assert.equal((stage.img as { src?: string }).src, "url:svg-0-451");
  assert.match(stage.img.alt, /Town0/);
  assert.equal((stage.link as { href?: string }).href, "/prospect/#i=0&year=451");
});

test("#442 show(null) hides the plate: the gate is guarded in BOTH directions", async () => {
  const { stage, fetched, fetchPlate, hrefFor } = harness();
  stage.setWorld(fetchPlate, hrefFor);
  stage.show(LATER);
  await tick();
  assert.equal(stage.root.hidden, false);

  stage.show(null);
  assert.equal(stage.root.hidden, true, "nothing told, nothing shown");
  assert.equal(fetched.length, 1, "and hiding pulls no plate");

  // Back again, so the hide is not a one-way trip a plain visit could get stuck in.
  stage.show(LATER);
  await tick();
  assert.equal(stage.root.hidden, false, "the same plate comes back after a hide");
});

test("#442 the cache key is index AND year: the same town at two eras is two plates", async () => {
  const { stage, fetched, fetchPlate, hrefFor } = harness();
  stage.setWorld(fetchPlate, hrefFor);
  stage.show(BEAT);
  await tick();
  stage.show(SAME_TOWN_TODAY);
  await tick();

  assert.equal(fetched.length, 2, "index 0 at 451 and index 0 at 1218 are fetched separately");
  assert.equal(
    (stage.img as { src?: string }).src,
    "url:svg-0-1218",
    "and the second era is what is on screen, not the first era's cached plate",
  );
  assert.match(stage.img.alt, /year 1218/, "the alt names the era being shown");
});

test("#442 prefetch pulls every spec ahead of the sweep, and a 60fps repaint fetches nothing more", async () => {
  const { stage, fetched, fetchPlate, hrefFor } = harness();
  stage.setWorld(fetchPlate, hrefFor);
  stage.prefetch([BEAT, LATER, SAME_TOWN_TODAY]);
  assert.equal(fetched.length, 3, "every plate the story can reach is pulled before the sweep needs it");

  stage.show(BEAT);
  stage.show(BEAT);
  stage.show(BEAT);
  await tick();
  assert.equal(fetched.length, 3, "repaints inside one plate fetch nothing");
  assert.equal((stage.img as { src?: string }).src, "url:svg-0-451");
});

test("#402 a new world's plate can never paint over it: the prior cache is revoked", async () => {
  const { stage, revoked, fetchPlate, hrefFor } = harness();
  stage.setWorld(fetchPlate, hrefFor);
  stage.show(BEAT);
  await tick();
  assert.equal(stage.root.hidden, false);

  stage.setWorld(fetchPlate, hrefFor);
  assert.equal(stage.root.hidden, true, "binding a world hides whatever the last one was showing");
  await tick();
  assert.deepEqual(revoked, ["url:svg-0-451"], "and the old blob is released");
});

test("#402 a late fetch from a superseded world is dropped, not painted", async () => {
  const { stage, revoked } = (() => {
    const h = harness();
    return h;
  })();
  let release!: (r: { svg: string; name: string }) => void;
  const slow = () => new Promise<{ svg: string; name: string }>((r) => (release = r));
  stage.setWorld(slow, (s) => `/prospect/#i=${s.index}`);
  stage.show(BEAT);

  stage.setWorld(() => Promise.resolve({ svg: "svg-new", name: "New" }), (s) => `/#${s.index}`);
  release({ svg: "svg-old", name: "Old" });
  await tick();
  await tick();

  assert.equal(stage.root.hidden, true, "the superseded world's plate never reaches the screen");
  assert.deepEqual(revoked, ["url:svg-old"], "its blob is revoked instead of leaking");
});

test("#442 the unfurl uses a BACKWARDS fill, so the plate's hover lift survives the reveal", () => {
  const css = readFileSync(resolve(REPO, "public/reading-room/index.css"), "utf8");
  const rule = css.match(/\.rr-prospect img\s*\{[^}]*\}/)?.[0];
  assert.ok(rule, "the plate carries an image rule");
  const anim = rule.match(/animation:[^;]*;/)?.[0];
  assert.ok(anim, "and an entrance animation");
  assert.match(anim, /\bbackwards\b/, "the reveal fills BACKWARDS");
  assert.doesNotMatch(
    anim,
    /\b(both|forwards)\b/,
    "never both/forwards: that pins the final keyframe's transform at animation priority and silently kills the hover lift",
  );
  // The polarity: a keyframe whose `to` sets a transform would re-pin it even under backwards, so the resting frame must be transform: none.
  const name = /animation:\s*(\S+)/.exec(anim)?.[1] ?? "";
  const keyframes = css.match(new RegExp(`@keyframes ${name}\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}`))?.[0];
  assert.ok(keyframes, `the reveal's keyframes (${name}) are here`);
  assert.match(keyframes, /to\s*\{[^}]*transform:\s*none/, "the resting keyframe releases the transform");
  assert.match(
    keyframes,
    /rotateX\(/,
    "and it UNFURLS: the sheet drops open from its edge rather than sliding in (ruled 2026-08-22)",
  );
  assert.match(rule, /transform-origin:\s*top center/, "anchored at the top edge, the way paperUnfurl's consumers are");
  assert.match(css, /\.rr-prospect a:hover img[^{]*\{[^}]*transform:/, "and the hover lift is a transform that must win");
});
