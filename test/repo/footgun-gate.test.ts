import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SELFTEST = resolve(import.meta.dirname, "..", "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");
// The cap reaches the selftest's own three deployed rows, which pipe input to a child that drains it and so share the shape #564 wedged on; a cap here bounds that whole subtree in one place. Measured 2026-09-11: the selftest runs in 0.34s, so this is about 90x.
const BOUND_MS = 30_000;

test("the footgun hook's fixture table passes, including the deployed settings.json command", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  assert.doesNotMatch(out, /^FAIL/m, out);
  assert.match(out, /^ok +deployed: symlinked project dir denies stash pop/m, out);
});

// This guard lives here, not beside the readDeployed tests, because it has to survive the defect it guards: footgun-deployed-run.test.ts imports the selftest statically, so an entry guard that stops working exits that whole file at import time and the runner reports it green with every assertion silently absent (measured: 7 gone, "pass 2 fail 0"). This file only ever spawns the selftest, so it still runs.
test("a bare import of the fixture table runs nothing and mints nothing", () => {
  const own = mkdtempSync(join(tmpdir(), "footgun-import-probe-"));
  try {
    const out = execFileSync(process.execPath, ["-e", `import(${JSON.stringify(pathToFileURL(SELFTEST).href)})`], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: own },
    });
    assert.equal(out, "", `run() executed on import and printed ${out.length} bytes`);
    assert.deepEqual(readdirSync(own), []);
  } finally {
    rmSync(own, { recursive: true, force: true });
  }
});
