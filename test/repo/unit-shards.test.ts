import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { shardOf, UNIT_SECONDS, UNLISTED_SECONDS } from "../../scripts/unit-shards.ts";
import { ciJob } from "../../test-support/ci-job.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

const unitFiles = (): string[] =>
  readdirSync(join(ROOT, "test"), { recursive: true, encoding: "utf8" })
    .filter((p) => p.endsWith(".test.ts"))
    .map((p) => `test/${p}`)
    .sort();

const SEVEN = ["a", "b", "c", "d", "e", "f", "g"].map((n) => `test/${n}.test.ts`);

test("at the job count ci.yml runs, every unit file under test/ lands in exactly one shard", () => {
  const matched = /^ {8}shard: \[([^\]]*)\]$/m.exec(ciJob("check-and-test"));
  assert.ok(
    matched,
    "ci.yml's check-and-test job no longer lists its shards as `shard: [..]`, so the job count is unread",
  );
  const total = matched[1]!.split(",").length;
  const files = unitFiles();
  assert.ok(
    files.includes("test/repo/unit-shards.test.ts"),
    "the walk does not find this very file, so it reads the wrong tree",
  );
  const dealt = Array.from({ length: total }, (_, k) => shardOf(files, k + 1, total)).flat();
  assert.deepEqual(
    dealt.sort(),
    files,
    `the ${total} shards dealt ${dealt.length} files against the ${files.length} under test/: a file runs in no job, or in two`,
  );
});

test("shardOf deals the files largest first onto the lightest shard: a file the table weighs at the others' sum takes a shard of its own", () => {
  const table = { "test/a.test.ts": 6 * UNLISTED_SECONDS };
  assert.deepEqual(
    [shardOf(SEVEN, 1, 2, table), shardOf(SEVEN, 2, 2, table)],
    [["test/a.test.ts"], SEVEN.slice(1)],
    "the deal follows count or position, so a heavy file shares its job with as many files as a light one",
  );
});

test("every UNIT_SECONDS entry names a unit file that exists, so a renamed or deleted file cannot keep a weight nobody runs", () => {
  const keys = Object.keys(UNIT_SECONDS);
  assert.ok(keys.length > 0, "UNIT_SECONDS is empty, so no entry is checked");
  const stale = keys.filter((f) => !/^test\/.+\.test\.ts$/.test(f) || !existsSync(join(ROOT, f)));
  assert.deepEqual(stale, [], `UNIT_SECONDS weighs files npm test does not run: ${stale.join(", ")}`);
});

test("shardOf refuses a shard outside 1 to its total, and a shard left with no file, rather than handing node no path", () => {
  assert.throws(() => shardOf(SEVEN, 0, 2), RangeError);
  assert.throws(() => shardOf(SEVEN, 3, 2), RangeError);
  assert.throws(
    () => shardOf(["test/a.test.ts"], 2, 2),
    RangeError,
    "a shard with no file came back, so npm test hands node no path and node collects the whole checkout",
  );
});
