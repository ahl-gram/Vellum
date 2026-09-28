import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Linter } from "eslint";
import ts from "typescript";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const TS_ROOT_GLOB = /^([\w-]+)\/\*\*\/\*\.ts$/;
const blocks: readonly Linter.Config[] = lintConfig;

const lintedRoots = (): string[] =>
  [...new Set(blocks.flatMap((b) => (b.files ?? []).flat()).flatMap((glob) => {
    const m = typeof glob === "string" ? glob.match(TS_ROOT_GLOB) : null;
    return m ? [m[1]!] : [];
  }))].sort();

const tsUnder = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name.startsWith(".")) return [];
    if (e.isDirectory()) return tsUnder(join(dir, e.name));
    return e.name.endsWith(".ts") ? [join(ROOT, dir, e.name)] : [];
  });

test("npm run check reaches every TypeScript file the lint reaches, so a root the lint gains is never one the type checker skips (Issue #679)", () => {
  const roots = lintedRoots();
  assert.ok(roots.includes("src"), `read the lint's TypeScript roots as [${roots.join(", ")}], so this reader has lost the config's shape`);
  const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  assert.ok(config, "tsconfig.json did not parse");
  const checked = new Set(ts.createProgram({ rootNames: config.fileNames, options: config.options }).getSourceFiles().map((sf) => resolve(sf.fileName)));
  const linted = roots.flatMap(tsUnder);
  assert.ok(linted.length > 600, `walked only ${linted.length} TypeScript files under [${roots.join(", ")}], so this guard is reading the wrong tree`);
  const unchecked = linted.filter((f) => !checked.has(f)).map((f) => f.slice(ROOT.length + 1));
  assert.deepEqual(unchecked, [], `${unchecked.length} file(s) the lint reads that npm run check never loads: tsconfig.json's include misses their root and nothing it includes imports them, so a type error there passes the check`);
});
