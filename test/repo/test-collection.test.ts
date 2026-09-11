import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// Node's --test collects a directory AND every *.test.ts by name anywhere in the tree, so all three defects below report as passes rather than failures: a bare module under test/ becomes a phantom pass, a .test.ts outside test/ is collected where nobody looks for it, and an imported sibling re-registers its own tests. None is visible in a green run, only in the total.

const ROOT = resolve(import.meta.dirname, "..", "..");
const ROOT_SKIP = new Set(["dist", "out", "public", "design"]);

const pruned = (name: string, top: boolean) =>
  name === "node_modules" || name.startsWith(".") || (top && ROOT_SKIP.has(name));

const walk = (dir: string, top = false): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (pruned(e.name, top) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)],
  );

const rel = (p: string) => relative(ROOT, p);
const repoFiles = walk(ROOT, true).map(rel);
const testDirFiles = repoFiles.filter((f) => f.startsWith("test/"));
const suiteFiles = repoFiles.filter((f) => f.endsWith(".test.ts"));

const isPhantom = (f: string) => !f.endsWith(".test.ts");

// Comments are stripped before matching because this file names ".test.ts" in its own prose; a match still needs an import/export/require keyword, so a bare mention in a string cannot trip it. It errs toward a false positive and never toward a miss.
const importsOf = (src: string): string[] => {
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  const pat = /\b(?:import|export|require)\b[^;]*?["']([^"']*\.test\.ts(?:\?[^"']*)?)["']/g;
  return [...bare.matchAll(pat)].map((m) => m[1]!);
};

test("a stray is a file node --test would load that is not a .test.ts, never a fixture or a Finder artifact", () => {
  const loaded = [
    "test/helper.ts",
    "test/a.mjs",
    "test/b.js",
    "test/c.cts",
    "test/d.mts",
    "test/e.cjs",
    "test/foo.TS",
    "test/out/x.ts",
    "test/x.test.mjs",
    "test/foo_test.ts",
  ];
  const skipped = [
    "test/.DS_Store",
    "test/.hidden.ts",
    "test/.cache/x.ts",
    "test/node_modules/z.ts",
    "test/fixtures/data.json",
    "test/pic.png",
    "test/x.tsx",
    "test/real.test.ts",
  ];
  assert.deepEqual([...loaded, ...skipped].filter(isPhantom), loaded);
});

test("every file under test/ is a .test.ts, so none is collected as a phantom pass", () => {
  assert.ok(
    testDirFiles.length > 100,
    `walked only ${testDirFiles.length} files under test/; this guard is reading the wrong tree`,
  );
  const strays = testDirFiles.filter(isPhantom);
  assert.deepEqual(strays, [], "a shared helper belongs in test-support/, which node --test does not collect");
});

test("every .test.ts in the repo lives under test/, where node --test is aimed", () => {
  assert.ok(suiteFiles.length > 100, `found only ${suiteFiles.length} suites; this guard is reading the wrong tree`);
  const outside = suiteFiles.filter((f) => !f.startsWith("test/"));
  assert.deepEqual(
    outside,
    [],
    "node --test collects *.test.ts by name anywhere, so one outside test/ runs where nobody looks for it",
  );
});

test("no .test.ts imports another .test.ts, which would run that file's tests twice", () => {
  const offenders = suiteFiles.flatMap((f) => importsOf(readFileSync(join(ROOT, f), "utf8")).map((s) => `${f} -> ${s}`));
  assert.deepEqual(offenders, [], "share through test-support/ instead; an imported sibling re-registers its tests");
});
