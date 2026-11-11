import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { runKeyless } from "../../test-support/keyless-spawn.ts";

const PROBE = "console.log(JSON.stringify({ key: process.env.TYPESAFE_API_KEY ?? null, home: process.env.HOME }))";
const KEY_VAR = "TYPESAFE_API_KEY";

test("a keyless child sees no key in its environment and a home of its own, which is removed afterwards", () => {
  const before = process.env[KEY_VAR];
  process.env[KEY_VAR] = "k-test-never-sent";
  try {
    const run = runKeyless("-e", [PROBE], process.cwd(), 30_000);
    assert.equal(run.status, 0, run.stderr);
    const seen = JSON.parse(run.stdout) as { key: string | null; home: string };
    assert.equal(seen.key, null);
    assert.notEqual(seen.home, process.env.HOME);
    assert.ok(seen.home.startsWith(tmpdir()), seen.home);
    assert.equal(existsSync(seen.home), false);
  } finally {
    if (before === undefined) delete process.env[KEY_VAR];
    else process.env[KEY_VAR] = before;
  }
});
