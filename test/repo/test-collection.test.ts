import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

// npm test runs only the .test.ts files under test/ (`SUITE` in `scripts/unit-suite.ts`), while a bare node --test collects every test/ directory anywhere in the tree AND every file named test, test-*, *-test, *_test or *.test (its six extensions, outside dot segments and node_modules), so all three defects below hide in a green run: a suite under test/ under another name, or outside test/, never runs under npm test, a module so placed or named is a phantom pass under a bare run, and an imported sibling re-registers its own tests. None is visible in a green run, only in the total.

const ROOT = resolve(import.meta.dirname, "..", "..");

const pruned = (name: string) => name === "node_modules" || name.startsWith(".");
const prunedAtRoot = (name: string) => pruned(name) || name === "out";

// A sibling suite removes generated/ during the same npm test run (`cleanGenerated` in `scripts/clean-generated.ts`), racing this walk, so tolerating ENOENT errs toward MISSING a collectible name in a tree that vanished mid-walk; it is the one place this file errs toward a miss rather than a false positive.
const entriesOf = (dir: string) => {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
};

const walk = (dir: string, skip: (name: string) => boolean = pruned): string[] =>
  entriesOf(dir).flatMap((e) =>
    e.isDirectory() ? (skip(e.name) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)],
  );

const filesUnder = (root: string) => walk(root, prunedAtRoot).map((p) => relative(root, p));

// Node's own kDefaultPattern (its test runner's internal utils module) ends .{js,mjs,cjs,ts,mts,cts}; measured 2026-09-10 on v26.8.2 under this package's "type": "module": .TS is matched case-insensitively on macOS and Windows, then refused by the loader as a loud red, so it is no phantom anywhere.
const COLLECTED = new Set([".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]);
const loadedByNode = (f: string) =>
  !f.split("/").some((s) => s.startsWith(".") || s === "node_modules") && COLLECTED.has(extname(f));
const isStray = (f: string) => loadedByNode(f) && !f.endsWith(".test.ts");
const straysUnder = (files: string[]) => files.filter((f) => f.startsWith("test/") && isStray(f));

// Node folds case only on pattern segments that contain a wildcard, and only on macOS and Windows; measured 2026-09-11 on v26.8.2 under this package's "type": "module".
const inTestDir = (f: string) => f.split("/").some((s) => s === "test");
const namedTest = (f: string) => {
  const stem = basename(f, extname(f));
  const folded = stem.toLowerCase();
  return stem === "test" || folded.startsWith("test-") || /[._-]test$/.test(folded);
};
const collectedByNode = (f: string) => loadedByNode(f) && (inTestDir(f) || namedTest(f));
const collectedOutside = (files: string[]) => files.filter((f) => collectedByNode(f) && !f.startsWith("test/")).sort();

const repoFiles = filesUnder(ROOT);
const testDirFiles = repoFiles.filter((f) => f.startsWith("test/"));

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

test("the walk prunes node_modules and dot dirs at every depth and the scratch out/ at the root alone, so it reads every tree an author writes", () => {
  const seeded = [
    "src/f.ts",
    "src/out/w.ts",
    "test/out/x.ts",
    "test/design/y.ts",
    "out/a.ts",
    "out/copy/test/z.test.ts",
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
      "public/c.ts",
      "src/f.ts",
      "src/out/w.ts",
      "test/design/y.ts",
      "test/out/x.ts",
    ]);
  });
});

test("over a real tree the guard names the helper and passes the Finder artifact, the defect #561 reported", () => {
  const seeded = ["test/helper.ts", "test/.DS_Store", "test/fixtures/data.json", "test/real.test.ts", "src/stray.ts"];
  withSeededTree(seeded, (dir) => {
    assert.deepEqual(straysUnder(filesUnder(dir)), ["test/helper.ts"]);
  });
});

test("the collection predicate mirrors what node --test LOADS: the test/ directory and the four by-name arms, folded only where node folds", () => {
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
    assert.deepEqual(collectedOutside(filesUnder(dir)), [
      "src/foo_test.ts",
      "src/x/test/helper.ts",
      "test-support/test-helpers.ts",
    ]);
  });
});

test("the walk's recursion returns empty for a directory that is already gone, and still throws on any other failure", () => {
  withSeededTree(["keep/y.ts", "vanish/x.ts"], (dir) => {
    assert.deepEqual(filesUnder(dir).sort(), ["keep/y.ts", "vanish/x.ts"]);
    rmSync(join(dir, "vanish"), { recursive: true, force: true });
    assert.deepEqual(walk(join(dir, "vanish")), []);
    assert.deepEqual(filesUnder(dir), ["keep/y.ts"]);
    assert.throws(() => walk(join(dir, "keep", "y.ts")), { code: "ENOTDIR" });
  });
});

test("every file a bare node --test loads under test/ is a .test.ts, so npm test runs every suite there and a bare run counts no phantom", () => {
  assert.ok(
    testDirFiles.length > 100,
    `walked only ${testDirFiles.length} files under test/; this guard is reading the wrong tree`,
  );
  const strays = straysUnder(repoFiles);
  assert.deepEqual(
    strays,
    [],
    `${strays.length} file(s) under test/ that a bare node --test loads yet are not .test.ts suites (${strays.join(", ")}): npm test runs only the .test.ts files under test/, so a suite under any other name never runs and escapes the guards keyed to the .test.ts name, vellum/test-no-test-import among them, and a bare node --test counts a helper here as a passing test of its own; helpers belong in test-support/`,
  );
});

test("every file in node --test's own family lives under test/, where npm test is aimed, and the scratch out/ is not read", () => {
  assert.ok(
    repoFiles.includes("package.json"),
    "the walk did not reach the repo root; this guard is reading the wrong tree",
  );
  const matched = repoFiles.filter(collectedByNode);
  assert.ok(matched.length > 100, `matched only ${matched.length} files; this guard is reading the wrong tree`);
  const outside = collectedOutside(repoFiles);
  assert.deepEqual(
    outside,
    [],
    `${outside.length} file(s) node --test's own patterns collect outside test/ (${outside.join(", ")}): npm test runs only the .test.ts files under test/, so a suite there never runs, and a bare node --test collects any directory named test at any depth and any file named test, test-*, *-test, *_test or *.test, so a module there is a passing test of its own; move a real suite under test/, rename a helper out of that family (test-support/ is its home), and keep generated output from carrying one of those names`,
  );
});
