import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// Node's --test collects by DIRECTORY here, not by name, so both defects below report as passes rather than failures: a bare module under test/ becomes a phantom 0-subtest pass, and an imported sibling re-registers its own tests. Neither is visible in a green run, only in the total.

const ROOT = resolve(import.meta.dirname, "..", "..");
const TEST_DIR = join(ROOT, "test");

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const files = walk(TEST_DIR);
const rel = (p: string) => relative(ROOT, p);

test("every file under test/ is a .test.ts, so none is collected as a phantom pass", () => {
  assert.ok(files.length > 100, `walked only ${files.length} files; this guard is reading the wrong tree`);
  const strays = files.filter((f) => !f.endsWith(".test.ts")).map(rel);
  assert.deepEqual(strays, [], "a shared helper belongs in test-support/, which is outside node --test's collection");
});

test("no .test.ts imports another .test.ts, which would run that file's tests twice", () => {
  const offenders = files.flatMap((f) => {
    const hits = [...readFileSync(f, "utf8").matchAll(/\bimport\s*(?:\(\s*)?(?:[^;()]*?\bfrom\s*)?["']([^"']*\.test\.ts)["']/g)];
    return hits.map((m) => `${rel(f)} -> ${m[1]}`);
  });
  assert.deepEqual(offenders, [], "share through test-support/ instead; an imported sibling re-registers its tests");
});
