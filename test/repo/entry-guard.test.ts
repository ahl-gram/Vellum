import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { eslint, plantMessages, resolvedRule } from "../../test-support/source-shape-reports.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { ARGV_PATH_READS } from "../../scripts/lint/entry-guard.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/no-argv-entry-path";
const GUARD = "test-support/source-read-guard.ts";

const REFUSE = true;
const PASS = false;
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import { realpathSync } from "node:fs";', PASS],
  ['import { fileURLToPath, pathToFileURL } from "node:url";', PASS],
  ['import { argv } from "node:process";', PASS],
  ["export const main = (): void => {};", PASS],
  ["if (process.argv[1] === fileURLToPath(import.meta.url)) main();", REFUSE],
  ["if (fileURLToPath(import.meta.url) === process.argv[1]) main();", REFUSE],
  ["if (process.argv[1] !== fileURLToPath(import.meta.url)) main();", REFUSE],
  ["export const SELF = fileURLToPath(import.meta.url); if (process.argv[1] === SELF) main();", REFUSE],
  ['if (realpathSync(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();', REFUSE],
  ['if (pathToFileURL(process.argv[1] ?? "").href === import.meta.url) main();', REFUSE],
  ['export const isDirectRun = process.argv[1]?.endsWith("main.ts") ?? false;', REFUSE],
  ['export const underTest = process.argv[1]?.startsWith("/repo/test/") ?? false;', REFUSE],
  ['export const entry = process.argv[1] ?? "";', REFUSE],
  ["if (process.argv?.[1] === fileURLToPath(import.meta.url)) main();", REFUSE],
  ["export const second = process.argv.at(1);", REFUSE],
  ["if (import.meta.main) main();", PASS],
  ["export const args = process.argv.slice(2);", PASS],
  ["export const runtime = process.argv[0];", PASS],
  ["export const third = process.argv[2];", PASS],
  ['export const flag = process.argv.find((a) => a.startsWith("--seed="));', PASS],
  ["// process.argv[1] === fileURLToPath(import.meta.url), named in a comment", PASS],
  ['export const quoted = "process.argv[1]";', PASS],
  ["export const [, launched] = process.argv;", PASS],
  ["export const viaImport = argv[1];", PASS],
  ['export const bracketed = process["argv"][1];', PASS],
  ["export const sliced = process.argv.slice(1)[0];", PASS],
];
const REFUSED = PLANT.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOTS =
  'BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row): the second element of argv read any other way, by destructuring (const [, launched] = process.argv), through an argv imported from node:process, by a quoted key (process["argv"][1]) or from a copy (process.argv.slice(1)[0]); and every file outside the lint\'s TypeScript roots, among them the footgun hook under .claude/, whose own entry check resolves both paths, and the round tools under design/';

test("no module reads process.argv[1], the path it was started by as typed, to tell whether it is the entry: a symlinked launch makes that check skip, and import.meta.main is the way round it (Issue #1180)", async () => {
  const messages = await plantMessages(
    PLANT.map(([line]) => line),
    "scripts/regen-hero-charts.ts",
  );
  assert.ok(
    REFUSED.length > 0 && REFUSED.length < PLANT.length,
    "the plant holds no line to refuse or none to pass, so this test cannot tell the rule from its negation",
  );
  assert.deepEqual(
    messages.filter((m) => m.ruleId === RULE).map((m) => m.line),
    REFUSED,
    BLIND_SPOTS,
  );
});

const reported = async (lines: readonly string[]) =>
  (await plantMessages(lines, GUARD)).filter((m) => m.ruleId === RULE).map((m) => [m.line, m.messageId]);

test("test-support/source-read-guard.ts may read process.argv[1] once, to learn which test file node --test started, and a second read there is refused, as is a count left above its reads (Issue #1180)", async () => {
  assert.deepEqual(
    ARGV_PATH_READS,
    { [GUARD]: 1 },
    "a file joins ARGV_PATH_READS only with a ruling: each count is a read of the typed path the lint lets stand, and this test names the one there is",
  );
  for (const key of Object.keys(ARGV_PATH_READS))
    assert.ok(
      existsSync(join(ROOT, key)),
      `${key} is counted in ARGV_PATH_READS but does not exist, so its allowance outlived a rename the stale report cannot see`,
    );
  assert.deepEqual(
    await reported(['export const typed = process.argv[1] ?? "";']),
    [],
    "the one counted read is refused",
  );
  assert.deepEqual(
    await reported(['export const typed = process.argv[1] ?? "";', 'export const again = process.argv[1] ?? "";']),
    [[2, "typed"]],
    "a second read past the count is not refused",
  );
  assert.deepEqual(
    await reported(['export const typed = "";']),
    [[1, "stale"]],
    "a count left above the file's reads is not reported",
  );
});

test("the rule resolves at error on every TypeScript root the lint reads, at any depth and in a room not yet written, and on no sheet (Issue #1180)", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.length > 0, "the lint reads no TypeScript root, so this sweep reads nothing");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(
      witness !== undefined && existsSync(join(ROOT, witness)),
      `${root} has no existing witness in test-support/lint-witnesses.ts, so the rule's reach there is unpinned`,
    );
    assert.equal(await eslint.isPathIgnored(witness), false, `${witness} is ignored, so ${root} reaches nothing`);
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file, RULE), [2], `${RULE} does not resolve at error on ${file}`);
  }
  assert.deepEqual(
    await resolvedRule("src/site/zz-new-room/part.ts", RULE),
    [2],
    `${RULE} does not reach a room written tomorrow`,
  );
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!, RULE), undefined, `${RULE} reaches a sheet`);
});
