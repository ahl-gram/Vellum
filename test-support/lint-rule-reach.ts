import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { lintTsRoots } from "./lint-roots.ts";
import { WITNESSES } from "./lint-witnesses.ts";
import { eslint, resolvedRule } from "./source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..");

export const assertRuleReach = async (rule: string, wired: unknown = [2]): Promise<void> => {
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
      assert.deepEqual(await resolvedRule(file, rule), wired, `${rule} does not resolve as wired on ${file}`);
  }
  assert.deepEqual(
    await resolvedRule("src/site/zz-new-room/part.ts", rule),
    wired,
    `${rule} does not reach a room written tomorrow`,
  );
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!, rule), undefined, `${rule} reaches a sheet`);
};
