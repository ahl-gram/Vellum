import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const REPO = resolve(import.meta.dirname, "..", "..");
const SPLIT_FILES = [
  "src/site/explorer/app.ts",
  "src/site/explorer/chart-drawer-bind.ts",
  "src/site/explorer/controls.ts",
  "src/site/explorer/glass.ts",
  "src/site/explorer/hash-sync.ts",
  "src/site/explorer/sheet-turn.ts",
  "src/site/explorer/worker.ts",
  "src/site/shared/zoom-controller.ts",
];

// Blind spots, each erring toward passing: a module-level const arrow (each in these files takes one parameter, or two of different types, so a swap is a type error), an exported function (five calls in src/site/shared/zoom-controller.ts, moved unchanged, hand values under other names), a call through an alias, a shadowing local, and any file off the list (72 older calls in 17 other files under src/site hand values on under other names).
function handOffs(file: string): { site: string; args: string[]; params: string[] }[] {
  const sf = ts.createSourceFile(file, readFileSync(resolve(REPO, file), "utf8"), ts.ScriptTarget.Latest, true);
  const local = new Map<string, string[]>();
  for (const st of sf.statements) {
    if (!ts.isFunctionDeclaration(st) || !st.name || st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    local.set(st.name.text, st.parameters.map((p) => p.name.getText(sf)));
  }
  const found: { site: string; args: string[]; params: string[] }[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && local.has(n.expression.text) && n.arguments.length > 0) {
      found.push({ site: `${file}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1} ${n.expression.text}`, args: n.arguments.map((a) => a.getText(sf)), params: local.get(n.expression.text)! });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

test("every part and helper the Explorer and the shared zoom were split into is handed each value under the name of the parameter it lands in, so two values of one type cannot trade places with the type check green", () => {
  for (const file of SPLIT_FILES) {
    const calls = handOffs(file);
    assert.ok(calls.length > 0, `${file} hands nothing to a function of its own, so this guard reads nothing there and the list above is stale`);
    for (const { site, args, params } of calls) {
      assert.deepEqual(args, params, `${site} is handed (${args.join(", ")}) for its parameters (${params.join(", ")}); a value under another name, or a literal, is how a swapped element or timer passes the type check`);
    }
  }
});
