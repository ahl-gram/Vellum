import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import * as prettier from "prettier";
import formatConfig from "../../prettier.config.ts";
import { PLATE_FACES, faceModulePath } from "../../scripts/plate-face.ts";
import { ciJob } from "../../test-support/ci-job.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { SITE_SHEETS } from "../../test-support/site-sheets.ts";
import type { FaceName } from "../../src/prospect/letter/face.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULED_CONFIG = { printWidth: 120 };
const RULED_IGNORE = [
  "*.*",
  "!*.css",
  "!*.ts",
  "/*",
  "!/e2e/",
  "!/public/",
  "!/scripts/",
  "!/src/",
  "!/test/",
  "!/test-support/",
  "src/prospect/letter/face-*.ts",
];
const IGNORE_PATH = [join(ROOT, ".gitignore"), join(ROOT, ".prettierignore")];

const tracked = (): string[] => {
  const listing = spawnSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.stderr}`);
  return listing.stdout.split("\0").filter(Boolean);
};

const formats = async (file: string): Promise<boolean> => {
  const info = await prettier.getFileInfo(join(ROOT, file), { ignorePath: IGNORE_PATH });
  return !info.ignored && info.inferredParser !== null;
};

test("the ruled config is the one Prettier reads for every file it formats, so no nested config or .editorconfig the CLI obeys changes a subtree (Alex, 2026-10-07, Issue #779)", async () => {
  assert.deepEqual(formatConfig, RULED_CONFIG, "prettier.config.ts does not export the ruled options");
  const formatted: string[] = [];
  for (const file of tracked()) if (await formats(file)) formatted.push(file);
  assert.ok(
    Object.values(WITNESSES).every((w) => formatted.includes(w)),
    "a lint witness is not formatted, so this sweep reads less than the lint does",
  );
  const off: string[] = [];
  for (const file of formatted) {
    const config = await prettier.resolveConfig(join(ROOT, file), { editorconfig: true });
    if (!isDeepStrictEqual(config, RULED_CONFIG)) off.push(`${file}: ${JSON.stringify(config)}`);
  }
  assert.deepEqual(
    off,
    [],
    "Prettier resolves options other than the ruled ones for these files, from a config file or an .editorconfig nearer to them than prettier.config.ts",
  );
});

test(".prettierignore is exactly the ruled list (Alex, 2026-10-07, Issue #779)", () => {
  const file = join(ROOT, ".prettierignore");
  assert.ok(existsSync(file), ".prettierignore is missing, so Prettier formats every kind it knows, archives included");
  assert.deepEqual(
    readFileSync(file, "utf8").split("\n").filter(Boolean),
    RULED_IGNORE,
    ".prettierignore is not the ruled list: a line added, dropped or reordered changes what the formatter reaches",
  );
});

test("through Prettier itself, a tracked file is formatted exactly when it is TypeScript under a lint root or a sheet under public/, the plate face tables aside (Alex, 2026-10-07, Issue #779)", async () => {
  const files = tracked();
  const roots = lintTsRoots();
  const faces = (Object.keys(PLATE_FACES) as FaceName[]).map((name) => relative(ROOT, faceModulePath(name)));
  assert.ok(
    roots.length > 0 && SITE_SHEETS.length > 0 && faces.every((f) => files.includes(f)),
    "the roots, the sheets or the face tables read empty or wrong, so the expectation below is degenerate",
  );
  const ruled = (file: string): boolean =>
    !faces.includes(file) &&
    ((file.endsWith(".ts") && roots.some((r) => file.startsWith(`${r}/`))) || SITE_SHEETS.includes(file));
  const wrong: string[] = [];
  for (const file of files)
    if ((await formats(file)) !== ruled(file)) wrong.push(`${ruled(file) ? "not formatted" : "formatted"}: ${file}`);
  assert.deepEqual(
    wrong,
    [],
    "Prettier reaches a file the ruling leaves out, or misses one it names. BLIND SPOTS, declared: an untracked file is not read; a directory whose name holds a dot under a root drops out of formatting through the *.* line, erring toward passing (none is tracked today)",
  );
});

test("npm run format and npm run format:check are Prettier over the whole tree, and ci.yml's check-and-test job runs the check as a real step", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["format"], "prettier --write .");
  assert.equal(pkg.scripts["format:check"], "prettier --check .");
  assert.match(
    ciJob("check-and-test"),
    /^ {6}- name: Format\n {8}run: npm run format:check\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no Format step of the shape `- name: Format` / `run: npm run format:check` at the step indent, so a pull request that breaks the layout goes green",
  );
});
