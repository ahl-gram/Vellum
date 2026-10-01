import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

// The Daily Hunt takes the Glass (#167), geometric-only; the behaviour is proven by e2e/suites/hunt.ts. BOUNDARY (#161): the Hunt is a FIXED world and must never import the LOD schedule or the region worker, since revealing new places mid-game would change the clue difficulty.

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
  assert.match(html, /<div id="map-viewport"[^>]*tabindex="0"[^>]*role="application"/, "the stage is the keyboard's Glass, the Explorer's shape");
  assert.ok(!html.includes('id="caption"'), "the world's name left the zoom frame for the chart folio");
  const folio = html.indexOf("<ChartFolio");
  assert.ok(folio > html.indexOf("</div>", html.indexOf('id="map-viewport"')), "the chart folio stands outside the stage");
  assert.match(html.slice(folio), /\["folio-title", "folio-title"\]/, "the chart folio carries the world's name (the kit's ChartFolio, #487)");
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

// The ACTUAL module specifiers, not prose (comments are free to name these paths), read from the syntax tree: static imports and re-exports, dynamic import() and a worker's new URL(...), in either quote; only a specifier computed at run time escapes it.
function specifiers(file: string): string[] {
  const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const out: string[] = [];
  const visit = (n: ts.Node): void => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) out.push(n.moduleSpecifier.text);
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) out.push(n.arguments[0].text);
    if (ts.isNewExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "URL" && n.arguments?.[0] && ts.isStringLiteralLike(n.arguments[0])) out.push(n.arguments[0].text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

test("HZ4 the Hunt stays a FIXED world: no LOD, no region worker (#161 boundary)", () => {
  const dir = "src/site/seed-of-the-day";
  const files = readdirSync(resolve(REPO, dir), { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".ts"));
  assert.ok(files.includes("app.ts") && files.includes("app-hunt.ts"), `the Hunt's entry and its setup were not both found in ${dir}, so this scan reads the wrong place`);
  const seen = files.map((f) => ({ f, paths: specifiers(`${dir}/${f}`) }));
  assert.ok(seen.find((s) => s.f === "app.ts")!.paths.includes("./app-hunt.ts"), "the scan no longer reads the entry's own import of the Hunt, so it reads nothing it should");
  for (const { f, paths } of seen) {
    for (const p of paths) {
      assert.doesNotMatch(p, /lod|region|worker/i, `the Hunt must not import a semantic-redraft path (${dir}/${f} imports ${p})`);
    }
  }
  const js = read(`${dir}/app.ts`);
  const opts = js.match(/createZoomController\(\{([\s\S]*?)\}\)/);
  assert.ok(opts, "app.js should construct the controller with an options literal");
  assert.doesNotMatch(opts[1]!, /onSettle|onApply/, "the Hunt controller is geometric-only (no redraft/counter-scale hooks)");
});

test("HZ5 index.css gives #map-viewport the clip + touch-action wiring and #map a top-left pivot (#167)", () => {
  const css = read("public/seed-of-the-day/index.css");
  assert.match(read("public/atelier.css"), /\.stage\s*\{[^}]*position:\s*fixed;\s*inset:\s*0/, "the stage is the viewport");
  assert.match(css, /#map\s*\{[^}]*inset:\s*0/, "#map covers the stage, so the clamp's extent is the stage");
  assert.match(css, /#map\s*\{[^}]*padding:\s*var\(--reserve-top/, "#map reserves the chrome's edges as padding, measured by room.ts");
  // Clip ONLY while zoomed, so the idle DOM (arrival ceremony overflow, drop shadow) stays byte-identical at home (k=1).
  assert.match(css, /#map-viewport\.zoomed\s*\{[^}]*overflow:\s*hidden/s, "#map-viewport.zoomed should clip");
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/s, "#map-viewport.zoomable should set touch-action:none");
  // transform-origin 0 0 makes the CSS scale pivot match d3-zoom's screen-space math.
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/s, "#map should pivot at the top-left (transform-origin: 0 0)");
});
