import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";

// Node's --test collects a directory AND every *.test.ts by name anywhere in the tree, so all three defects below report as passes rather than failures: a bare module under test/ becomes a phantom pass, a .test.ts outside test/ is collected where nobody looks for it, and an imported sibling re-registers its own tests. None is visible in a green run, only in the total.

const ROOT = resolve(import.meta.dirname, "..", "..");

const pruned = (name: string) => name === "node_modules" || name.startsWith(".");

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (pruned(e.name) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)],
  );

const rel = (p: string) => relative(ROOT, p);
const repoFiles = walk(ROOT).map(rel);
const testDirFiles = repoFiles.filter((f) => f.startsWith("test/"));
const suiteFiles = repoFiles.filter((f) => f.endsWith(".test.ts"));

// Node's own kDefaultPattern (lib/internal/test_runner/utils in the node source) ends .{js,mjs,cjs,ts,mts,cts}; measured 2026-09-10 on v26.8.2 under this package's "type": "module": dot segments, node_modules, .tsx and .json are skipped, and .TS is matched on macOS only, then refused by the loader as a loud red, so it is no phantom.
const COLLECTED = new Set([".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]);
const loadedByNode = (f: string) =>
  !f.split("/").some((s) => s.startsWith(".") || s === "node_modules") && COLLECTED.has(extname(f));
const isPhantom = (f: string) => loadedByNode(f) && !f.endsWith(".test.ts");

// Comments are stripped before matching because this file names ".test.ts" in its own prose; a match still needs an import/export/require keyword, so a bare mention in a string cannot trip it. It errs toward a false positive and never toward a miss.
const importsOf = (src: string): string[] => {
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  const pat = /\b(?:import|export|require)\b[^;]*?["']([^"']*\.test\.ts(?:\?[^"']*)?)["']/g;
  return [...bare.matchAll(pat)].map((m) => m[1]!);
};

test("a stray is a file node --test would load that is not a .test.ts, never a fixture or a Finder artifact", () => {
  const stray = [
    "test/helper.ts",
    "test/a.mjs",
    "test/b.js",
    "test/c.cts",
    "test/d.mts",
    "test/e.cjs",
    "test/out/x.ts",
    "test/x.test.mjs",
    "test/foo_test.ts",
  ];
  const notStray = [
    "test/.DS_Store",
    "test/.hidden.ts",
    "test/.cache/x.ts",
    "test/node_modules/z.ts",
    "test/fixtures/data.json",
    "test/pic.png",
    "test/x.tsx",
    "test/foo.TS",
    "test/real.test.ts",
  ];
  assert.deepEqual([...stray, ...notStray].filter(isPhantom), stray);
});

test("the walk prunes node_modules and dot dirs at every depth and nothing else, so it sees the tree node sees", () => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-walk-"));
  try {
    const seeded = [
      "src/f.ts",
      "test/out/x.ts",
      "test/design/y.ts",
      "out/a.ts",
      "dist/b.ts",
      "public/c.ts",
      "design/d.ts",
      "node_modules/e.ts",
      "test/node_modules/g.ts",
      ".cache/h.ts",
      "test/.cache/i.ts",
    ];
    for (const f of seeded) {
      mkdirSync(join(dir, dirname(f)), { recursive: true });
      writeFileSync(join(dir, f), "");
    }
    const found = walk(dir).map((p) => relative(dir, p)).sort();
    assert.deepEqual(found, [
      "design/d.ts",
      "dist/b.ts",
      "out/a.ts",
      "public/c.ts",
      "src/f.ts",
      "test/design/y.ts",
      "test/out/x.ts",
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("every file node --test loads under test/ is a .test.ts, so none is a phantom pass or an unseen suite", () => {
  assert.ok(
    testDirFiles.length > 100,
    `walked only ${testDirFiles.length} files under test/; this guard is reading the wrong tree`,
  );
  const strays = testDirFiles.filter(isPhantom);
  assert.deepEqual(
    strays,
    [],
    `${strays.length} file(s) under test/ that node --test loads yet are not .test.ts suites (${strays.join(", ")}): a helper here counts as a passing test of its own, and a suite under any other name escapes the .test.ts guards in this file; helpers belong in test-support/`,
  );
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
