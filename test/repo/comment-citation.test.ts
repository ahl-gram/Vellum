import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { CITED_ROOTS } from "../../scripts/lint/comment-citation.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });

const reports = async (lines: readonly string[], path: string, rule: string): Promise<number[]> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line);
};

test("every `symbol` in `path` citation in a script's comment resolves: the file exists and the symbol APPEARS in it, a citation wrapped across comment lines read whole (handbook/specs/conventions.md, How code is cited)", async () => {
  const plant = [
    "// `atlasDocument` in `src/atlas/document.ts` resolves",
    "// `atlasDocument` in `src/site/explorer/serialisable-atlas.ts`",
    "// `zzNoSuchSymbolHere` in `src/atlas/document.ts`",
    "// a citation that wraps, `atlasDocument` in",
    "// `src/atlas/no-such-file.ts`",
    "",
    "/**",
    " * a doc block wrapping `atlasDocument`",
    " * in `src/atlas/nowhere.ts` */",
    "export const x = 1; // `atlasDocument` in `src/atlas/document.ts`",
    "export const y = 2; // `zzNoSuchSymbolHere` in `src/atlas/document.ts`",
    'export const z = "`zzNoSuchSymbolHere` in `src/atlas/document.ts`, a string, not a comment";',
  ];
  assert.deepEqual(
    await reports(plant, "src/atlas/document.ts", "vellum/ts-comment-citation-resolves"),
    [2, 3, 4, 7, 11],
  );
});

test("every citation in a sheet's comment resolves the same way", async () => {
  const plant = [
    "/* `atlasDocument` in `src/atlas/document.ts` */",
    ".a { color: red; }",
    "/* `zzNoSuchSymbolHere` in `public/house.css` */",
    "/* `atlasDocument` in `src/atlas/nowhere.ts` */",
  ];
  assert.deepEqual(await reports(plant, "public/house.css", "vellum/css-comment-citation-resolves"), [3, 4]);
});

test("the citation form reads a path under every root the lint reads and under public/, so no citation there goes unchecked (Issue #679)", () => {
  assert.deepEqual(
    lintTsRoots().filter((r) => !CITED_ROOTS.includes(r)),
    [],
    "the lint reads a root the citation form never names",
  );
  assert.ok(CITED_ROOTS.includes("public"), "a citation into a sheet under public/ is not read");
});
