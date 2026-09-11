import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

// Node's --test collects every test/ directory anywhere in the tree AND every file named test, test-*, *-test, *_test or *.test (its six extensions, outside dot segments and node_modules; #562 covers the by-name arm), so all three defects below report as passes rather than failures: a bare module under test/ becomes a phantom pass, a .test.ts outside test/ is collected where nobody looks for it, and an imported sibling re-registers its own tests. None is visible in a green run, only in the total.

const ROOT = resolve(import.meta.dirname, "..", "..");

const pruned = (name: string) => name === "node_modules" || name.startsWith(".");

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (pruned(e.name) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)],
  );

const filesUnder = (root: string) => walk(root).map((p) => relative(root, p));

// Node's own kDefaultPattern (its test runner's internal utils module) ends .{js,mjs,cjs,ts,mts,cts}; measured 2026-09-10 on v26.8.2 under this package's "type": "module": .TS is matched case-insensitively on macOS and Windows, then refused by the loader as a loud red, so it is no phantom anywhere.
const COLLECTED = new Set([".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]);
const loadedByNode = (f: string) =>
  !f.split("/").some((s) => s.startsWith(".") || s === "node_modules") && COLLECTED.has(extname(f));
const isStray = (f: string) => loadedByNode(f) && !f.endsWith(".test.ts");
const straysUnder = (root: string) => filesUnder(root).filter((f) => f.startsWith("test/") && isStray(f));

const collectedByNode = loadedByNode;
const collectedOutside = (root: string) =>
  filesUnder(root)
    .filter((f) => collectedByNode(f) && !f.startsWith("test/"))
    .sort();

const repoFiles = filesUnder(ROOT);
const testDirFiles = repoFiles.filter((f) => f.startsWith("test/"));
const suiteFiles = repoFiles.filter((f) => f.endsWith(".test.ts"));

const withSeededTree = (files: string[], run: (dir: string) => void) => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-walk-"));
  try {
    for (const f of files) {
      mkdirSync(join(dir, dirname(f)), { recursive: true });
      writeFileSync(join(dir, f), "");
    }
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

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
  assert.deepEqual([...stray, ...notStray].filter(isStray), stray);
});

test("the walk prunes node_modules and dot dirs at every depth and nothing else, so it sees the tree node sees", () => {
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
  withSeededTree(seeded, (dir) => {
    assert.deepEqual(filesUnder(dir).sort(), [
      "design/d.ts",
      "dist/b.ts",
      "out/a.ts",
      "public/c.ts",
      "src/f.ts",
      "test/design/y.ts",
      "test/out/x.ts",
    ]);
  });
});

test("over a real tree the guard names the helper and passes the Finder artifact, the defect #561 reported", () => {
  const seeded = ["test/helper.ts", "test/.DS_Store", "test/fixtures/data.json", "test/real.test.ts", "src/stray.ts"];
  withSeededTree(seeded, (dir) => {
    assert.deepEqual(straysUnder(dir), ["test/helper.ts"]);
  });
});

test("the collection predicate mirrors node's pattern: the test/ directory and the four by-name arms, folded only where node folds", () => {
  const matched = [
    "src/test.ts",
    "src/a/test.ts",
    "src/foo.test.ts",
    "src/foo_test.ts",
    "src/foo-test.ts",
    "src/_test.ts",
    "src/test-foo.ts",
    "test-support/test-helpers.ts",
    "src/x/test/helper.ts",
    "src/a/b/test/deep/helper.ts",
    "dist/x/test/a.ts",
    "out/y_test.mjs",
    "test/repo/test-collection.test.ts",
    "src/TEST-foo.ts",
    "src/foo_TEST.ts",
    "src/Foo.Test.ts",
  ];
  const unmatched = [
    "src/testfoo.ts",
    "src/footest.ts",
    "src/plain.ts",
    "tests/helper.ts",
    "src/testing/helper.ts",
    "test-support/helpers.ts",
    "src/test.d.ts",
    "src/test.config.ts",
    "src/foo_test.tsx",
    "src/x/test/h.json",
    "src/foo_test.TS",
    "src/.test.ts",
    "src/.hidden/test.ts",
    "src/x/test/.dotfile.ts",
    "node_modules/pkg/test.ts",
    "src/x/test/node_modules/y.ts",
    "src/TEST.ts",
    "src/TEST/helper.ts",
    "src/Test/other.ts",
  ];
  assert.deepEqual([...matched, ...unmatched].filter(collectedByNode), matched);
});

test("the guard's outside-test/ composition names a nested test/ module and a by-name file, and passes a suite under the root test/", () => {
  const seeded = [
    "src/x/test/helper.ts",
    "src/foo_test.ts",
    "test-support/test-helpers.ts",
    "test/real.test.ts",
    "test/helper.ts",
    "test/repo/test-foo.test.ts",
    "src/plain.ts",
    "src/x/test/.dotfile.ts",
    "node_modules/p/test.ts",
  ];
  withSeededTree(seeded, (dir) => {
    assert.deepEqual(collectedOutside(dir), ["src/foo_test.ts", "src/x/test/helper.ts", "test-support/test-helpers.ts"]);
  });
});

// test/site/astro-scaffold.test.ts rm -rf's and rebuilds out/test-astro-build on every run, concurrently with this file's module-load walk of the same tree, so a directory listed by readdirSync can be gone by the time the recursion reaches it.
test("the walk survives a directory that vanished after it was listed, and still throws on any other failure", () => {
  withSeededTree(["keep/y.ts", "vanish/x.ts"], (dir) => {
    assert.deepEqual(filesUnder(dir).sort(), ["keep/y.ts", "vanish/x.ts"]);
    rmSync(join(dir, "vanish"), { recursive: true, force: true });
    assert.deepEqual(walk(join(dir, "vanish")), []);
    assert.deepEqual(filesUnder(dir), ["keep/y.ts"]);
    assert.throws(() => walk(join(dir, "keep", "y.ts")), { code: "ENOTDIR" });
  });
});

test("every file node --test loads under test/ is a .test.ts, so none is a phantom pass or an unseen suite", () => {
  assert.ok(
    testDirFiles.length > 100,
    `walked only ${testDirFiles.length} files under test/; this guard is reading the wrong tree`,
  );
  const strays = straysUnder(ROOT);
  assert.deepEqual(
    strays,
    [],
    `${strays.length} file(s) under test/ that node --test loads yet are not .test.ts suites (${strays.join(", ")}): a helper here counts as a passing test of its own, and a suite under any other name escapes the .test.ts guards in this file; helpers belong in test-support/`,
  );
});

test("every file node --test collects lives under test/, where the runner is aimed", () => {
  assert.ok(repoFiles.includes("package.json"), "the walk did not reach the repo root; this guard is reading the wrong tree");
  const matched = repoFiles.filter(collectedByNode);
  assert.ok(matched.length > 100, `matched only ${matched.length} files; this guard is reading the wrong tree`);
  const outside = collectedOutside(ROOT);
  assert.deepEqual(
    outside,
    [],
    `${outside.length} file(s) node --test collects outside test/ (${outside.join(", ")}): it collects any directory named test at any depth and any file named test, test-*, *-test, *_test or *.test, so a module there is reported as a passing test of its own and a suite there escapes the .test.ts guards in this file; move a real suite under test/, rename a helper out of that family (test-support/ is its home), and keep generated output from carrying one of those names`,
  );
});

test("no .test.ts imports another .test.ts, which would run that file's tests twice", () => {
  const offenders = suiteFiles.flatMap((f) => importsOf(readFileSync(join(ROOT, f), "utf8")).map((s) => `${f} -> ${s}`));
  assert.deepEqual(offenders, [], "share through test-support/ instead; an imported sibling re-registers its tests");
});
