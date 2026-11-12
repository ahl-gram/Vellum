import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";

const ROOT = resolve(import.meta.dirname, "..", "..");
const ENTRY = "src/cli/main.ts";
const AGENT = ".claude/agents/vellum-plate-reader.md";

const closureOf = (root: string, entry: string): string[] => {
  const seen = new Set<string>();
  const queue = [entry];
  for (let rel = queue.shift(); rel !== undefined; rel = queue.shift()) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    for (const { fileName } of ts.preProcessFile(readFileSync(join(root, rel), "utf8"), true, true).importedFiles) {
      if (!fileName.startsWith(".")) continue;
      const target = relative(root, resolve(root, dirname(rel), fileName));
      assert.ok(existsSync(join(root, target)), `${rel} imports ${fileName}, which resolves to no file`);
      queue.push(target);
    }
  }
  return [...seen].sort();
};

const reached = (closure: readonly string[], excluded: readonly string[]): string[] =>
  closure.filter((file) => excluded.some((dir) => file.startsWith(`${dir}/`)));

const excludedDirectories = (agent: string): string[] => {
  const spec = /`<paths>` stands for `([^`]+)`/.exec(agent)?.[1];
  assert.ok(spec, `${AGENT} no longer says what \`<paths>\` stands for`);
  const [head, ...rest] = spec.split(" ");
  assert.equal(head, "src", "the pathspec opens with src");
  return rest.map((word) => {
    const dir = /^':!(src\/[a-z-]+)'$/.exec(word)?.[1];
    assert.ok(dir, `${word} is not a ':!src/<directory>' exclusion`);
    return dir;
  });
};

test("the closure walk follows static, type-only, re-exported and dynamic imports, ignores a mention in a comment or a string, and names a file inside an excluded directory it reaches (Issue #1309)", () => {
  const dir = mkdtempSync(join(tmpdir(), "plate-reader-trigger-"));
  try {
    const put = (rel: string, text: string): void => {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), text);
    };
    put("src/a/entry.ts", 'import type { T } from "./types.ts";\nexport * from "../b/re.ts";\nimport "node:fs";\n');
    put("src/a/types.ts", "export type T = number;\n");
    put(
      "src/b/re.ts",
      'export const load = () => import("../skip/deep.ts");\n// import "./never.ts"\nexport const s = \'from "./never.ts"\';\n',
    );
    put("src/skip/deep.ts", "export const deep = 1;\n");
    put("src/a/never.ts", "export const never = 1;\n");
    const closure = closureOf(dir, "src/a/entry.ts");
    assert.deepEqual(closure, ["src/a/entry.ts", "src/a/types.ts", "src/b/re.ts", "src/skip/deep.ts"]);
    assert.deepEqual(reached(closure, ["src/skip"]), ["src/skip/deep.ts"]);
    assert.deepEqual(reached(closure, ["src/other"]), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the chart command imports nothing from a directory the plate reader's step 1 leaves out, so a change there cannot alter the sheet the comparison draws (Issue #1309)", () => {
  const agent = readFileSync(join(ROOT, AGENT), "utf8");
  assert.ok(agent.includes("git diff --stat <base> -- <paths>"), "step 1 diffs <paths>");
  assert.ok(agent.includes("package.json <paths>"), "step 3 archives <paths>");
  const excluded = excludedDirectories(agent);
  assert.ok(excluded.length > 0, "the pathspec excludes nothing, so this test would hold nothing");
  for (const dir of excluded)
    assert.ok(statSync(join(ROOT, dir)).isDirectory(), `${dir} is not a directory under src/`);
  const closure = closureOf(ROOT, ENTRY);
  assert.ok(closure.includes(ENTRY) && closure.some((f) => f.startsWith("src/world/")), "the walk reached the engine");
  assert.deepEqual(
    reached(closure, excluded),
    [],
    `${ENTRY} now imports from a directory ${AGENT} step 1 leaves out: take that directory off \`<paths>\` there, or the comparison is silently never owed for a change to it`,
  );
});
