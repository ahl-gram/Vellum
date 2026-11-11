import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { ALPHA, ALPHA_NEAR, OTHER } from "../../test-support/copy-hunt-fixtures.ts";
import { NO_KEY, runKeyless, type Run } from "../../test-support/keyless-spawn.ts";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";

const MAIN = resolve(import.meta.dirname, "..", "..", "scripts", "copy-hunt", "main.ts");
// 2026-11-11, Issue #1319: seven runs over a one- or two-file repository took under 0.6 s each on the Mac; a minute holds a hundred times the slowest.
const RUN_MS = 60_000;

const hunt = (dir: string, args: readonly string[]): Run => runKeyless(MAIN, args, dir, RUN_MS);

test("a run with a pair it could not ask exits 1, and a dry run of the same pair exits 0", async () => {
  await withTempRepo({ "src/a.ts": ALPHA }, (dir, base) => {
    writeFiles(dir, { "src/c.ts": ALPHA_NEAR });
    const head = commitAll(dir, "head");
    const run = hunt(dir, ["diff", base, head]);
    assert.equal(run.status, 1, run.stderr);
    assert.ok(run.stdout.includes("similar pairs 1 (copies 0, unsettled 0, not copies 0, skipped 1)"), run.stdout);
    assert.ok(run.stdout.includes(NO_KEY), run.stdout);
    const dry = hunt(dir, ["diff", base, head, "--dry-run"]);
    assert.equal(dry.status, 0, dry.stderr);
    assert.ok(dry.stdout.includes("similar pairs 1 (copies 0, unsettled 0, not copies 0, skipped 1)"), dry.stdout);
    assert.ok(dry.stdout.includes("dry run: nothing was sent"), dry.stdout);
  });
});

test("a run with nothing to ask exits 0, with no key", async () => {
  await withTempRepo({ "src/d.ts": OTHER }, (dir) => {
    const run = hunt(dir, ["full"]);
    assert.equal(run.status, 0, run.stderr);
    assert.ok(run.stdout.includes("all 1 functions; exact copies 0; similar pairs 0"), run.stdout);
  });
});

test("a command the usage does not name exits 2 and prints the usage", async () => {
  await withTempRepo({ "src/d.ts": OTHER }, (dir) => {
    for (const args of [["bogus"], ["diff", "HEAD"], ["full", "--nope"], ["trial"]]) {
      const run = hunt(dir, args);
      assert.equal(run.status, 2, `${args.join(" ")}: ${run.stderr}`);
      assert.ok(run.stderr.startsWith("usage: npm run copy-hunt -- diff <base> <head>"), run.stderr);
    }
  });
});
