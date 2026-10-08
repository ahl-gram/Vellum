import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

// The Daily Hunt takes the Glass (Issue #167), geometric-only; the behaviour is proven by e2e/suites/hunt.ts. BOUNDARY (Issue #161): the Hunt is a FIXED world and must never import the LOD schedule or the region worker, since revealing new places mid-game would change the clue difficulty.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("HZ1 the Hunt wraps #map in a stable #map-viewport clip/gesture box, the chart's own sheet inside (#167, re-seated at #462)", () => {
  const html = read("src/pages/seed-of-the-day/index.astro");
  // #map-viewport is the stage and the box d3-zoom binds to; #map is the transform target; #sheet is the chart's fitted box, so the star and the soundings ride the chart and not the stage.
  assert.match(
    html,
    /<div id="map-viewport"[^>]*>\s*<div id="map">\s*<div id="sheet" class="sheet">\s*<\/div>\s*<\/div>\s*<\/div>/,
    "the page should wrap #sheet inside #map inside #map-viewport",
  );
  assert.match(
    html,
    /<div id="map-viewport"[^>]*tabindex="0"[^>]*role="application"/,
    "the stage is the keyboard's Glass, the Explorer's shape",
  );
  assert.ok(!html.includes('id="caption"'), "the world's name left the zoom frame for the chart folio");
  const folio = html.indexOf("<ChartFolio");
  assert.ok(
    folio > html.indexOf("</div>", html.indexOf('id="map-viewport"')),
    "the chart folio stands outside the stage",
  );
  assert.match(
    html.slice(folio),
    /\["folio-title", "folio-title"\]/,
    "the chart folio carries the world's name (the kit's ChartFolio, #487)",
  );
});

test("HZ2 app.js adopts the shared zoom controller, bound to #map-viewport / #map (#167)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  assert.match(
    js,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/,
    "app.js should import the shared createZoomController",
  );
  assert.match(js, /createZoomController\(/, "app.js should construct the controller");
  assert.match(
    js,
    /viewportEl:\s*\$\("map-viewport"\)|viewportEl:\s*[A-Za-z0-9_]+/,
    "controller binds a viewport element",
  );
  assert.match(js, /\.attach\(\)/, "the controller must be attached (binds the gestures)");
});

test("HZ3 app.js exposes the deterministic zoom hooks the e2e drives (#167)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  assert.match(js, /window\.__vellumZoomTo\s*=/, "app.js should expose __vellumZoomTo");
  assert.match(js, /window\.__vellumZoomState\s*=/, "app.js should expose __vellumZoomState");
});

test("HZ4 witness: the Hunt's entry imports its setup and builds its zoom controller with an options literal, so vellum/hunt-fixed-world has a module source and a controller to hold (#161 boundary)", () => {
  const sf = ts.createSourceFile("app.ts", read("src/site/seed-of-the-day/app.ts"), ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  let literalCalls = 0;
  const visit = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) imports.push(n.moduleSpecifier.text);
    const factory =
      ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "createZoomController";
    if (factory && n.arguments[0] && ts.isObjectLiteralExpression(n.arguments[0])) literalCalls++;
    ts.forEachChild(n, visit);
  };
  visit(sf);
  assert.ok(
    imports.includes("./app-hunt.ts"),
    "the Hunt's entry no longer imports its setup, so the rule reads no source there",
  );
  assert.ok(
    literalCalls > 0,
    "the Hunt's entry no longer builds its controller with an options literal, so the rule reads no hook",
  );
});

test("HZ5 index.css gives #map-viewport the clip + touch-action wiring and #map a top-left pivot (#167)", () => {
  const css = read("public/seed-of-the-day/index.css");
  assert.match(
    read("public/atelier.css"),
    /\.stage\s*\{[^}]*position:\s*fixed;\s*inset:\s*0/,
    "the stage is the viewport",
  );
  assert.match(css, /#map\s*\{[^}]*inset:\s*0/, "#map covers the stage, so the clamp's extent is the stage");
  assert.match(
    css,
    /#map\s*\{[^}]*padding:\s*var\(--reserve-top/,
    "#map reserves the chrome's edges as padding, measured by room.ts",
  );
  // Clip ONLY while zoomed, so the idle DOM (arrival ceremony overflow, drop shadow) stays byte-identical at home (k=1).
  assert.match(css, /#map-viewport\.zoomed\s*\{[^}]*overflow:\s*hidden/s, "#map-viewport.zoomed should clip");
  assert.match(
    css,
    /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/s,
    "#map-viewport.zoomable should set touch-action:none",
  );
  // transform-origin 0 0 makes the CSS scale pivot match d3-zoom's screen-space math.
  assert.match(
    css,
    /#map\s*\{[^}]*transform-origin:\s*0\s+0/s,
    "#map should pivot at the top-left (transform-origin: 0 0)",
  );
});
