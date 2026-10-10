import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

// The Daily Hunt takes the Glass (Issue #167), geometric-only; the behaviour is proven by e2e/suites/hunt.ts. BOUNDARY (Issue #161): the Hunt is a FIXED world and must never import the LOD schedule or the region worker, since revealing new places mid-game would change the clue difficulty.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("HZ2 app.ts imports and builds the shared zoom controller (#167; kept for Issue #779 part 2i, what it binds is read by HG5 and HG1)", () => {
  const js = read("src/site/seed-of-the-day/app.ts");
  assert.match(
    js,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/,
    "app.js should import the shared createZoomController",
  );
  assert.match(js, /createZoomController\(/, "app.js should construct the controller");
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
