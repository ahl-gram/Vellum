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

/** Declaration blocks whose selector LIST contains `selector`, joined; see the twin in reading-frame.test.ts for why membership beats a literal anchor. */
function declarationsFor(css: string, selector: string): string {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: string[] = [];
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[1]!.split(",").map((s) => s.trim()).includes(selector)) out.push(m[2]!);
  }
  return out.join("\n");
}

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

test("#442 crossing the seam SWAPS the source with no gap: the plate is never hidden between two plates", async () => {
  const { stage, fetchPlate, hrefFor } = harness();
  const seen: boolean[] = [];
  stage.setWorld(fetchPlate, hrefFor);
  stage.prefetch([BEAT, LATER]);
  stage.show(BEAT);
  await tick();
  assert.equal(stage.root.hidden, false);

  // Sampled around the swap, since a hide-then-show would flash exactly here.
  seen.push(stage.root.hidden);
  stage.show(LATER);
  seen.push(stage.root.hidden);
  await tick();
  seen.push(stage.root.hidden);

  assert.deepEqual(seen, [false, false, false], "a plate-to-plate swap never passes through hidden");
  assert.equal((stage.img as { src?: string }).src, "url:svg-5-620", "and it lands on the new plate");
});

test("#311 the stage stalls nothing and moves nothing: no status write, no scroll, in either module", () => {
  for (const path of [
    "src/site/reading-room/prospect-stage.ts",
    "src/site/reading-room/told-plate.ts",
    "src/site/reading-room/app.ts",
    "src/site/reading-frame/index.ts",
  ]) {
    const src = readFileSync(resolve(REPO, path), "utf8");
    // #442 decision 4 (ruled 2026-08-22): Play does not move the reading position, under
    // reduced motion or otherwise. The sticky row is what follows the story, not a scroll.
    assert.doesNotMatch(
      src,
      /scrollIntoView|window\.scrollTo|\.scrollTop\s*=/,
      `${path} moves the reading position; the strip follows the story instead (ruled 2026-08-22)`,
    );
  }
  const stage = readFileSync(resolve(REPO, "src/site/reading-room/prospect-stage.ts"), "utf8");
  assert.doesNotMatch(
    stage,
    /statusEl|#status/,
    "the stage writes nothing to the polite status line: the settle signal is the host's",
  );
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

test("#442 the journal keeps its top edge when the plate stands between it and the strip", () => {
  // The frame drops the journal's top border because it is drawn ABUTTING the instrument,
  // whose own bottom border serves as the divider (#220). The room breaks that adjacency:
  // the stage sits between them, so with a plate showing the journal floats as its own
  // panel with an open top. The room created the gap, so the room closes it.
  const frame = readFileSync(resolve(REPO, "public/reading-frame.css"), "utf8");
  assert.match(
    declarationsFor(frame, ".rf-ages .rf-log"),
    /border-top:\s*0/,
    "the frame still suppresses the top border for the abutting case",
  );

  const css = readFileSync(resolve(REPO, "public/reading-room/index.css"), "utf8");
  const restored = declarationsFor(css, ".rr-prospect:not([hidden]) + .rf-log");
  assert.ok(restored, "the room restores the journal's edge when the stage stands between");
  assert.match(restored, /border-top:\s*1px solid/, "the top edge comes back");
  assert.match(restored, /border-radius:\s*6px/, "and it is a whole panel again, not a bottom-rounded one");

  // Polarity, since a rule keyed on the wrong state would restore the border at the very
  // moment the journal IS abutting: the hidden stage must leave the frame's rule standing.
  assert.doesNotMatch(
    restored,
    /border-top:\s*0/,
    "the restoring rule must not itself remove the border it exists to add",
  );
  assert.equal(
    declarationsFor(css, ".rr-prospect[hidden] + .rf-log"),
    "",
    "and nothing dresses the abutting case from here; that is the frame's rule",
  );
});

test("#442 the unfurl uses a BACKWARDS fill, so the plate's hover lift survives the reveal", () => {
  const css = readFileSync(resolve(REPO, "public/reading-room/index.css"), "utf8");
  // Selector-list membership, not a literal anchor: a comma after the selector defeats an anchor and the assertions below then silently stop checking.
  const rule = declarationsFor(css, ".rr-prospect img");
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
  // Presence of `rotateX(` is not enough: `rotateX(0deg)` in the opening frame satisfies a
  // presence check while producing a plain fade, which is the ruling's "snapping in" all
  // over again. The OPENING angle has to be non-zero for the sheet to drop open at all.
  const from = keyframes.match(/from\s*\{[^}]*\}/)?.[0] ?? "";
  const openingAngle = Number(/rotateX\((-?[\d.]+)deg\)/.exec(from)?.[1] ?? "0");
  assert.notEqual(openingAngle, 0, `the unfurl opens at a real angle, not a fade dressed as one (got ${openingAngle}deg)`);
  assert.ok(Math.abs(openingAngle) > 20, `and an angle you can see, not a token one (got ${openingAngle}deg)`);
  assert.match(rule, /transform-origin:\s*top center/, "anchored at the top edge, the way paperUnfurl's consumers are");
  assert.match(css, /\.rr-prospect a:hover img[^{]*\{[^}]*transform:/, "and the hover lift is a transform that must win");
});
