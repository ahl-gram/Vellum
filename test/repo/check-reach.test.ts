import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { lintTsRoots, tsRootsOf } from "../../test-support/lint-roots.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

const tsUnder = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name.startsWith(".")) return [];
    if (e.isDirectory()) return tsUnder(join(dir, e.name));
    return e.name.endsWith(".ts") ? [join(ROOT, dir, e.name)] : [];
  });

test("the lint's TypeScript roots are read from globs of one shape, and a TypeScript glob of any other shape is refused rather than dropped", () => {
  assert.deepEqual(tsRootsOf(["src/**/*.ts", "e2e/**/*.ts", "**/*.js", "public/**/*.css", "src/**/*.ts", ["test/**/*.ts", "**/*.mts"]]), ["e2e", "src", "test"]);
  for (const entry of ["tools/bench/**/*.ts", "e2e/**/*.mts", "src/**/*.{ts,mts}", ".claude/skills/**/*.ts", "**/*.ts", "test/**/*.cts", ["**/*.ts", "**/*.tsx"]]) {
    assert.throws(() => tsRootsOf([entry]), /cannot read/, `${JSON.stringify(entry)} was dropped, so a root the lint reads through it would be one neither guard walks`);
  }
});

test("npm run check reaches every TypeScript file the lint reaches, so a root the lint gains is never one the type checker skips (Issue #679)", () => {
  const roots = lintTsRoots();
  assert.ok(roots.includes("src"), `read the lint's TypeScript roots as [${roots.join(", ")}], so this reader has lost the config's shape`);
  const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  assert.ok(config, "tsconfig.json did not parse");
  const checked = new Set(ts.createProgram({ rootNames: config.fileNames, options: config.options }).getSourceFiles().map((sf) => resolve(sf.fileName)));
  const linted = roots.flatMap(tsUnder);
  assert.ok(linted.length > 600, `walked only ${linted.length} TypeScript files under [${roots.join(", ")}], so this guard is reading the wrong tree`);
  const unchecked = linted.filter((f) => !checked.has(f)).map((f) => f.slice(ROOT.length + 1));
  assert.deepEqual(unchecked, [], `${unchecked.length} file(s) the lint reads that npm run check never loads: tsconfig.json's include misses their root and nothing it includes imports them, so a type error there passes the check`);
});
