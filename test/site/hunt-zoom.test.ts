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

const isWrapper = (n: ts.Node): boolean => ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isNonNullExpression(n) || ts.isSatisfiesExpression(n);
const bare = (e: ts.Expression): ts.Expression => (isWrapper(e) ? bare((e as ts.ParenthesizedExpression).expression) : e);
const ctorName = (e: ts.Expression): string => {
  const c = bare(e);
  return ts.isIdentifier(c) ? c.text : ts.isPropertyAccessExpression(c) ? c.name.text : ts.isElementAccessExpression(c) && ts.isStringLiteralLike(c.argumentExpression) ? c.argumentExpression.text : "";
};

// The ACTUAL module specifiers, not prose (comments are free to name these paths), read from the syntax tree in the Hunt's own modules: static imports and re-exports, literal import(), new URL(...), Worker(...) or SharedWorker(...) however the constructor is reached (globalThis.Worker, self["Worker"], a cast or parentheses) and import.meta.glob(...); a specifier computed at run time escapes it, and so does a module whose name hides what IT imports (../explorer/glass.ts imports the finer-survey controller), an errata/guards.md row.
function specifiers(file: string): string[] {
  const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const out: string[] = [];
  const literals = (args: ts.NodeArray<ts.Expression> | undefined): string[] => (args?.[0] && ts.isStringLiteralLike(args[0]) ? [args[0].text] : args?.[0] && ts.isArrayLiteralExpression(args[0]) ? args[0].elements.filter(ts.isStringLiteralLike).map((e) => e.text) : []);
  const visit = (n: ts.Node): void => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) out.push(n.moduleSpecifier.text);
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) out.push(...literals(n.arguments));
    if (ts.isNewExpression(n) && ["URL", "Worker", "SharedWorker"].includes(ctorName(n.expression))) out.push(...literals(n.arguments));
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === "glob" && n.expression.expression.getText(sf) === "import.meta") out.push(...literals(n.arguments));
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

function keyOf(p: ts.ObjectLiteralElementLike): string {
  const computed = !!p.name && ts.isComputedPropertyName(p.name);
  const n = p.name && ts.isComputedPropertyName(p.name) ? p.name.expression : p.name;
  return n && ((!computed && (ts.isIdentifier(n) || ts.isPrivateIdentifier(n))) || ts.isStringLiteralLike(n) || ts.isNumericLiteral(n)) ? n.text : "...";
}

// Where a reference to the factory stands once its wrappers are peeled: a call's callee, `.call`'s receiver and an alias's initializer are read; anything else is refused.
function readable(ref: ts.Node): boolean {
  let top: ts.Node = ref;
  while (isWrapper(top.parent)) top = top.parent;
  const p = top.parent;
  return (ts.isCallExpression(p) && p.expression === top) || (ts.isVariableDeclaration(p) && p.initializer === top) || (ts.isPropertyAccessExpression(p) && p.expression === top && p.name.text === "call" && ts.isCallExpression(p.parent) && p.parent.expression === p);
}

// The shared zoom controller's factory as each module reaches it: every call under an imported name, an alias, a namespace or parentheses, with its option names as the controller reads them (a non-literal argument reads as null, a key that is not a written name as "..."), and every other use of the factory or its module (a re-export, a default or dynamic import, new, apply, handing it on) refused rather than read.
function controllerUses(file: string): { calls: (string[] | null)[]; refused: string[] } {
  const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const isZoom = (s: string): boolean => /zoom-controller/.test(s);
  const names = new Set<string>();
  const spaces = new Set<string>();
  const refused: string[] = [];
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) && isZoom(st.moduleSpecifier.text)) refused.push(`a re-export from ${st.moduleSpecifier.text}`);
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier) || !isZoom(st.moduleSpecifier.text)) continue;
    if (st.importClause?.name) refused.push(`a default import from ${st.moduleSpecifier.text}`);
    const nb = st.importClause?.namedBindings;
    if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) if ((el.propertyName ?? el.name).text === "createZoomController") names.add(el.name.text);
    if (nb && ts.isNamespaceImport(nb)) spaces.add(nb.name.text);
  }
  const isFactory = (e: ts.Expression): boolean => {
    const c = bare(e);
    return (ts.isIdentifier(c) && names.has(c.text)) || (ts.isPropertyAccessExpression(c) && c.name.text === "createZoomController" && ts.isIdentifier(c.expression) && spaces.has(c.expression.text));
  };
  const aliases = (n: ts.Node): boolean => {
    let grew = false;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && isFactory(n.initializer) && !names.has(n.name.text)) { names.add(n.name.text); grew = true; }
    return ts.forEachChild(n, aliases) === true || grew;
  };
  while (aliases(sf));
  const optionsOf = (arg: ts.Expression | undefined): string[] | null => (arg && ts.isObjectLiteralExpression(arg) ? arg.properties.map(keyOf) : null);
  const calls: (string[] | null)[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments.some((a) => ts.isStringLiteralLike(a) && isZoom(a.text))) refused.push("a dynamic import of the zoom controller");
    if (ts.isCallExpression(n) && isFactory(n.expression)) calls.push(optionsOf(n.arguments[0]));
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === "call" && isFactory(n.expression.expression)) calls.push(optionsOf(n.arguments[1]));
    if (ts.isIdentifier(n) && names.has(n.text) && !ts.isImportSpecifier(n.parent) && !(ts.isVariableDeclaration(n.parent) && n.parent.name === n) && !readable(n)) refused.push(`${n.text} used other than as a call`);
    if (ts.isIdentifier(n) && spaces.has(n.text) && !ts.isNamespaceImport(n.parent)) {
      const member = ts.isPropertyAccessExpression(n.parent) && n.parent.expression === n ? n.parent : null;
      if (!member) refused.push(`the namespace ${n.text} used other than for a named member`);
      else if (member.name.text === "createZoomController" && !readable(member)) refused.push(`${n.text}.createZoomController used other than as a call`);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { calls, refused };
}

test("HZ4 the Hunt stays a FIXED world: no LOD, no region worker (#161 boundary)", () => {
  const dir = "src/site/seed-of-the-day";
  const files = readdirSync(resolve(REPO, dir), { recursive: true, encoding: "utf8" }).filter((f) => /\.[cm]?[jt]sx?$/.test(f));
  assert.ok(files.includes("app.ts") && files.includes("app-hunt.ts"), `the Hunt's entry and its setup were not both found in ${dir}, so this scan reads the wrong place`);
  const seen = files.map((f) => ({ f, paths: specifiers(`${dir}/${f}`) }));
  assert.ok(seen.find((s) => s.f === "app.ts")!.paths.includes("./app-hunt.ts"), "the scan no longer reads the entry's own import of the Hunt, so it reads nothing it should");
  for (const { f, paths } of seen) {
    for (const p of paths) {
      assert.doesNotMatch(p, /lod|region|worker/i, `the Hunt must not import a semantic-redraft path (${dir}/${f} imports ${p})`);
    }
  }
  const uses = files.map((f) => ({ f, ...controllerUses(`${dir}/${f}`) }));
  for (const { f, refused } of uses) assert.deepEqual(refused, [], `${dir}/${f} reaches the zoom controller in a form this check cannot read, so its hooks go unchecked`);
  const controllers = uses.flatMap(({ f, calls }) => calls.map((names) => ({ f, names })));
  assert.ok(controllers.some((c) => c.f === "app.ts"), "app.ts should construct the controller");
  for (const { f, names } of controllers) {
    assert.ok(names, `${dir}/${f} should construct the controller with an options literal, so its hooks can be read`);
    assert.ok(!names.some((n) => n === "onSettle" || n === "onApply" || n === "..."), `the Hunt controller is geometric-only (no redraft/counter-scale hooks): ${dir}/${f} hands it ${names.join(", ")}`);
  }
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
