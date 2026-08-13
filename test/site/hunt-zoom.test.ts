import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The Daily Hunt takes the Glass (#167): the seed-of-the-day page adopts the shared zoom controller, geometric-only. This guards the STATIC wiring shape; the behaviour is proven by scripts/e2e/suite-hunt.mjs.
// BOUNDARY (#161 ratified): the Hunt is a FIXED world and must never import the LOD schedule or the region worker, since revealing new places mid-game would change the clue difficulty.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("HZ1 the Hunt wraps #map in a stable #map-viewport clip/gesture box (#167)", () => {
  const html = read("src/pages/seed-of-the-day/index.astro");
  // #map-viewport is the box d3-zoom binds to; #map is the transform target, like the Explorer's #164 wrapper.
  assert.match(
    html,
    /<div id="map-viewport">\s*<div id="map">\s*<\/div>\s*<\/div>/,
    "the page should wrap #map inside #map-viewport",
  );
  assert.match(html, /<\/div>\s*<figcaption id="caption">/, "figcaption stays outside the zoom frame");
});

test("HZ2 app.js adopts the shared zoom controller, bound to #map-viewport / #map (#167)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  assert.match(
    js,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/,
    "app.js should import the shared createZoomController",
  );
  assert.match(js, /createZoomController\(/, "app.js should construct the controller");
  assert.match(js, /viewportEl:\s*\$\("map-viewport"\)|viewportEl:\s*[A-Za-z0-9_]+/, "controller binds a viewport element");
  assert.match(js, /\.attach\(\)/, "the controller must be attached (binds the gestures)");
});

test("HZ3 app.js exposes the deterministic zoom hooks the e2e drives (#167)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  assert.match(js, /window\.__vellumZoomTo\s*=/, "app.js should expose __vellumZoomTo");
  assert.match(js, /window\.__vellumZoomState\s*=/, "app.js should expose __vellumZoomState");
});

test("HZ4 the Hunt stays a FIXED world: no LOD, no region worker (#161 boundary)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  // Inspect the ACTUAL import specifiers, not prose: comments are free to name these paths.
  const importPaths = [...js.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  for (const p of importPaths) {
    assert.doesNotMatch(p, /lod|region|worker/i, `the Hunt must not import a semantic-redraft path (${p})`);
  }
  // Extract just the call's argument literal, so a comment cannot trip the match.
  const opts = js.match(/createZoomController\(\{([\s\S]*?)\}\)/);
  assert.ok(opts, "app.js should construct the controller with an options literal");
  assert.doesNotMatch(opts[1], /onSettle|onApply/, "the Hunt controller is geometric-only (no redraft/counter-scale hooks)");
});

test("HZ5 index.css gives #map-viewport the clip + touch-action wiring and #map a top-left pivot (#167)", () => {
  const css = read("public/seed-of-the-day/index.css");
  // Clip ONLY while zoomed, so the idle DOM (arrival ceremony overflow, drop shadow) stays byte-identical at home (k=1).
  assert.match(css, /#map-viewport\.zoomed\s*\{[^}]*overflow:\s*hidden/s, "#map-viewport.zoomed should clip");
  // touch-action:none (added via .zoomable by the controller) is REQUIRED for pinch/drag.
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/s, "#map-viewport.zoomable should set touch-action:none");
  // transform-origin 0 0 makes the CSS scale pivot match d3-zoom's screen-space math.
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/s, "#map should pivot at the top-left (transform-origin: 0 0)");
});
