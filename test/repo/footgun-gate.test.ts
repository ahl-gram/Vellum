import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const SELFTEST = resolve(import.meta.dirname, "..", "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");

test("the footgun hook's fixture table passes, including the deployed settings.json command", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8" });
  assert.doesNotMatch(out, /^FAIL/m, out);
  assert.match(out, /^ok +deployed: symlinked project dir denies stash pop/m, out);
});
