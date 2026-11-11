import assert from "node:assert/strict";
import { test } from "node:test";
import { readOf, scanAll, scanRun } from "../../scripts/keeper-scan/scan.ts";
import { answered, recordingSender } from "../../test-support/jev-fakes.ts";
import { RUN } from "../../test-support/keeper-scan-fixtures.ts";

const LOW = { measured: 0.1, platform: 0.1, deviation: 0.1, golden: 0.1, units: 0.1, convention: 0.1, sentinel: 0.1 };

test("a comment is lost when a confident signal's survival is under 0.3, unsettled from 0.3 to 0.7, still said above 0.7, unsure when its only answers sit from 0.3 to 0.7, and no signal under 0.3", () => {
  assert.deepEqual(readOf({ ...LOW, measured: 0.9 }, { measured: 0.1 }), {
    band: "lost",
    signals: [{ signal: "measured", keeper: 0.9, survival: 0.1 }],
  });
  assert.equal(readOf({ ...LOW, measured: 0.9 }, { measured: 0.5 }).band, "unsettled");
  assert.equal(readOf({ ...LOW, measured: 0.9 }, { measured: 0.8 }).band, "said");
  assert.deepEqual(readOf(LOW, {}), { band: "clear", signals: [] });
  assert.deepEqual(readOf({ ...LOW, units: 0.5 }, {}), { band: "unsure", signals: [] });
  assert.deepEqual(readOf({ ...LOW, measured: 0.9, units: 0.5 }, { measured: 0.8 }), {
    band: "said",
    signals: [{ signal: "measured", keeper: 0.9, survival: 0.8 }],
  });
  assert.deepEqual(readOf({ ...LOW, measured: 0.9, golden: 0.9, units: 0.5 }, { measured: 0.1, golden: 0.5 }), {
    band: "lost",
    signals: [
      { signal: "measured", keeper: 0.9, survival: 0.1 },
      { signal: "golden", keeper: 0.9, survival: 0.5 },
    ],
  });
  assert.equal(readOf({ ...LOW, measured: 0.7 }, {}).band, "unsure");
  assert.equal(readOf({ ...LOW, measured: 0.3 }, {}).band, "unsure");
  assert.equal(readOf({ ...LOW, measured: 0.29 }, {}).band, "clear");
  assert.equal(readOf({ ...LOW, measured: 0.9 }, { measured: 0.3 }).band, "unsettled");
  assert.equal(readOf({ ...LOW, measured: 0.9 }, { measured: 0.7 }).band, "unsettled");
  assert.equal(readOf({ ...LOW, measured: 0.71 }, { measured: 0.71 }).band, "said");
});

test("a comment with a signal above 0.7 is asked that signal's survival question alone against the file after, and a comment with none is asked nothing more", async () => {
  const first = recordingSender([answered({ ...LOW, measured: 0.9, units: 0.5 }), answered({ measured: 0.1 })]);
  const lost = await scanRun({ sha: "b1", run: RUN, fileAfter: "FILE AFTER" }, first.send);
  assert.equal(first.seen.length, 2);
  assert.deepEqual(Object.keys(first.seen[1]!.questions), ["measured"]);
  assert.deepEqual(first.seen[1]!.state, { comment: "a fact", file: "src/keeper.ts", file_after: "FILE AFTER" });
  assert.equal(lost.sha, "b1");
  assert.deepEqual(lost.outcome, {
    kind: "read",
    band: "lost",
    signals: [{ signal: "measured", keeper: 0.9, survival: 0.1 }],
  });
  const second = recordingSender([answered({ ...LOW, units: 0.5 })]);
  const unsure = await scanRun({ sha: "b1", run: RUN, fileAfter: "FILE AFTER" }, second.send);
  assert.equal(second.seen.length, 1);
  assert.deepEqual(unsure.outcome, { kind: "read", band: "unsure", signals: [] });
  const third = recordingSender([
    answered({ measured: 0.2, platform: 0.2, deviation: 0.2, golden: 0.2, units: 0.2, convention: 0.2, sentinel: 0.2 }),
  ]);
  const clear = await scanRun({ sha: "b1", run: RUN, fileAfter: "FILE AFTER" }, third.send);
  assert.equal(third.seen.length, 1);
  assert.deepEqual(clear.outcome, { kind: "read", band: "clear", signals: [] });
});

test("a failed keeper or survival call skips the comment with the service's reason, and never reads it", async () => {
  const first = recordingSender([{ ok: false, reason: "HTTP 529: overloaded" }]);
  const keeperFailed = await scanRun({ sha: "b1", run: RUN, fileAfter: "F" }, first.send);
  assert.deepEqual(keeperFailed.outcome, { kind: "skipped", reason: "HTTP 529: overloaded" });
  assert.equal(first.seen.length, 1);
  const refused = 'HTTP 400: {"detail":{"error_type":"max_tokens_exceeded"}}';
  const second = recordingSender([answered({ ...LOW, measured: 0.9 }), { ok: false, reason: refused }]);
  const survivalFailed = await scanRun({ sha: "b1", run: RUN, fileAfter: "F" }, second.send);
  assert.deepEqual(survivalFailed.outcome, { kind: "skipped", reason: refused });
  assert.equal(survivalFailed.requests.length, 2);
  assert.equal(survivalFailed.replies.length, 2);
});

test("once a run's reported input tokens reach the cap, the comments after it are skipped unsent", async () => {
  const items = [3, 9, 12].map((line) => ({ sha: "b1", run: { ...RUN, line }, fileAfter: "" }));
  const { send, seen } = recordingSender([answered(LOW, 500)]);
  const scanned = await scanAll(items, send, 1000);
  assert.deepEqual(
    scanned.map((s) => s.outcome),
    [
      { kind: "read", band: "clear", signals: [] },
      { kind: "read", band: "clear", signals: [] },
      { kind: "skipped", reason: "the input-token cap of 1000 for this run was reached" },
    ],
  );
  assert.equal(seen.length, 2);
});
