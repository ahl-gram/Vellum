import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The Surveyor's Glass, Sub 6 (#167): the Daily Hunt takes the glass. The
 * seed-of-the-day page adopts the SAME shared zoom controller the Explorer uses
 * (docs/shared/zoom-controller.js), geometric-only: #map is wrapped in a stable
 * #map-viewport clip/gesture box, the live CSS transform lands on #map so the
 * hunt star and sounding overlays (children of #map) ride one frame, and the
 * guess-click math is untouched (it is ratio-based against getBoundingClientRect,
 * which reflects the live transform by definition).
 *
 * This guards the STATIC wiring shape. The behaviour (a guess resolves at any
 * zoom, a drag-pan never counts as a guess, a sounding lands at the tapped spot
 * while zoomed, pinch on touch) is proven in the browser by scripts/e2e/suite-hunt.mjs.
 *
 * BOUNDARY (epic #161 ratified decision): the Hunt is a FIXED world. It must never
 * import the LOD schedule or the region worker, because revealing new places
 * mid-game would change the clue difficulty. That is asserted here so a future
 * edit that reaches for the semantic-redraft paths reds immediately.
 */

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("HZ1 the Hunt wraps #map in a stable #map-viewport clip/gesture box (#167)", () => {
  const html = read("docs/seed-of-the-day/index.html");
  // #map-viewport is the box d3-zoom binds to; #map (the transform target) nests
  // directly inside it, exactly like the Explorer's #164 wrapper.
  assert.match(
    html,
    /<div id="map-viewport">\s*<div id="map">\s*<\/div>\s*<\/div>/,
    "index.html should wrap #map inside #map-viewport",
  );
  // figcaption (the world's name) stays OUTSIDE the frame, a sibling of the viewport.
  assert.match(html, /<\/div>\s*<figcaption id="caption">/, "figcaption stays outside the zoom frame");
});

test("HZ2 app.js adopts the shared zoom controller, bound to #map-viewport / #map (#167)", () => {
  const js = read("docs/seed-of-the-day/app.js");
  assert.match(
    js,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.js"/,
    "app.js should import the shared createZoomController",
  );
  assert.match(js, /createZoomController\(/, "app.js should construct the controller");
  assert.match(js, /viewportEl:\s*\$\("map-viewport"\)|viewportEl:\s*[A-Za-z0-9_]+/, "controller binds a viewport element");
  assert.match(js, /\.attach\(\)/, "the controller must be attached (binds the gestures)");
});

test("HZ3 app.js exposes the deterministic zoom hooks the e2e drives (#167)", () => {
  const js = read("docs/seed-of-the-day/app.js");
  assert.match(js, /window\.__vellumZoomTo\s*=/, "app.js should expose __vellumZoomTo");
  assert.match(js, /window\.__vellumZoomState\s*=/, "app.js should expose __vellumZoomState");
});

test("HZ4 the Hunt stays a FIXED world: no LOD, no region worker (#161 boundary)", () => {
  const js = read("docs/seed-of-the-day/app.js");
  // Inspect the ACTUAL import specifiers, not prose: the Hunt magnifies geometrically
  // only, and importing the LOD schedule or the region redraft would let zoom reveal new
  // places and change the clue difficulty. (Comments are free to name these paths.)
  const importPaths = [...js.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  for (const p of importPaths) {
    assert.doesNotMatch(p, /lod|region|worker/i, `the Hunt must not import a semantic-redraft path (${p})`);
  }
  // Geometric-only: the options object passed to the controller carries no onSettle
  // redraft hook (extract just the call's argument literal, so a comment can't trip it).
  const opts = js.match(/createZoomController\(\{([\s\S]*?)\}\)/);
  assert.ok(opts, "app.js should construct the controller with an options literal");
  assert.doesNotMatch(opts[1], /onSettle|onApply/, "the Hunt controller is geometric-only (no redraft/counter-scale hooks)");
});

test("HZ5 index.css gives #map-viewport the clip + touch-action wiring and #map a top-left pivot (#167)", () => {
  const css = read("docs/seed-of-the-day/index.css");
  // Clip ONLY while zoomed, so the idle DOM (arrival ceremony overflow, drop shadow)
  // is byte-identical to today at home (k=1).
  assert.match(css, /#map-viewport\.zoomed\s*\{[^}]*overflow:\s*hidden/s, "#map-viewport.zoomed should clip");
  // touch-action:none (added via .zoomable by the controller) is REQUIRED for pinch/drag.
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/s, "#map-viewport.zoomable should set touch-action:none");
  // transform-origin 0 0 makes the CSS scale pivot match d3-zoom's screen-space math.
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/s, "#map should pivot at the top-left (transform-origin: 0 0)");
});
