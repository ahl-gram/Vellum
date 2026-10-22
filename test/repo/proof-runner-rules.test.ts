import { test } from "node:test";
import assert from "node:assert/strict";
import { git } from "../../test-support/sandbox-repo.ts";
import { rulesAt } from "../../scripts/proof-runner/main.ts";

test("the suite rules load at a real sha with every file suites.ts imports at run time", async () => {
  const sha = git(["rev-parse", "HEAD"], process.cwd());
  const rules = await rulesAt(sha);
  assert.ok(Array.isArray(rules.order) && rules.order.length > 0);
  assert.notEqual(rules.predecessor, undefined);
  assert.notEqual(rules.opensOnHome, undefined);
});
