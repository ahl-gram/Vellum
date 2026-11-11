import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";

const ROOT = resolve(import.meta.dirname, "..");
export const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
export const ROSTER = "vellum/e2e-cancellation-roster";
export const READS = "vellum/e2e-console-read-through-drop";
const SPLIT_FILE_RULE = "vellum/split-arguments-by-name";
const SHARED_BINDING_RULE = "vellum/shared-binding-imported";
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
export type Plant = ReadonlyArray<readonly [string, boolean]>;

export const plantMessages = async (
  lines: readonly string[],
  path: string,
  linter: ESLint = eslint,
): Promise<Linter.LintMessage[]> => {
  const [result] = await linter.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages;
};

export const ruleLines = async (lines: readonly string[], path: string, rule: string): Promise<number[]> =>
  (await plantMessages(lines, path)).filter((m) => m.ruleId === rule).map((m) => m.line);

export const houseReports = async (lines: readonly string[], path: string): Promise<Array<[string, number]>> =>
  (await plantMessages(lines, path))
    .filter((m) => m.ruleId?.startsWith("vellum/") && m.ruleId !== SPLIT_FILE_RULE && m.ruleId !== SHARED_BINDING_RULE)
    .map((m): [string, number] => [m.ruleId!, m.line]);
export const at = (rule: string, lines: readonly number[]): Array<[string, number]> =>
  lines.map((line) => [rule, line]);

export const reportedLines = async (plant: Plant, path: string, rule: string): Promise<number[]> => [
  ...new Set(
    (
      await plantMessages(
        plant.map(([line]) => line),
        path,
      )
    )
      .filter((m) => m.ruleId === rule)
      .map((m) => m.line),
  ),
];

export const refusedLines = (plant: Plant): number[] => plant.flatMap(([, refused], i) => (refused ? [i + 1] : []));

const rulesOf = async (file: string): Promise<Record<string, unknown> | undefined> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules;

export const resolvedRule = async (file: string, rule: string): Promise<unknown> => (await rulesOf(file))?.[rule];

export const real = async (file: string): Promise<string> => {
  assert.ok(existsSync(join(ROOT, file)), `${file}, a witness here, does not exist`);
  assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so it witnesses nothing`);
  return file;
};

export const resolvedRules = async (file: string): Promise<Record<string, unknown>> =>
  (await rulesOf(await real(file))) ?? {};

export const offList = (names: readonly string[], approved: readonly string[]): string[] =>
  [...new Set(names)].filter((name) => !approved.includes(name) && IDENTIFIER.test(name)).sort();
