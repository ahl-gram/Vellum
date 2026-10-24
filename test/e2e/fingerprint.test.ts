import { test } from "node:test";
import assert from "node:assert/strict";
import { release } from "node:os";
import {
  FINGERPRINT_LEAD,
  environmentFingerprint,
  hostFacts,
  laneFingerprint,
  unreadBrowser,
} from "../../e2e/support/fingerprint.ts";
import type { EnvironmentFacts } from "../../e2e/support/fingerprint.ts";
import { laneCheckTally, laneLineIsSkip } from "../../e2e/support/lanes.ts";

const READ: EnvironmentFacts = {
  platform: "darwin",
  release: "25.6.0",
  arch: "arm64",
  node: "v26.12.1",
  binary: "Brave Browser",
  product: "Chrome/156.0.8078.48",
  numeroWidth: 100.3125,
  numeroFace: "Palatino",
  selectHeight: 34.21875,
  unread: null,
};

test("the fingerprint is one line naming the system, the Node, the browser and each probe's reading", () => {
  assert.equal(
    environmentFingerprint(READ),
    'fingerprint: darwin 25.6.0 arm64; Node v26.12.1; Brave Browser Chrome/156.0.8078.48; "Chart № 42" 100.31px; № in Palatino; select 34.22px',
  );
});

test("a fact the run could not read says so, and the reason closes the line on one line", () => {
  assert.equal(
    environmentFingerprint({
      platform: "linux",
      release: "6.17.0-1022-azure",
      arch: "x64",
      node: "v26.0.0",
      binary: "google-chrome",
      ...unreadBrowser("the browser gave no answer within 5000 ms"),
    }),
    'fingerprint: linux 6.17.0-1022-azure x64; Node v26.0.0; google-chrome version unread; "Chart № 42" unread; № face unread; select unread; unread because the browser gave no answer within 5000 ms',
  );
  const stacked = environmentFingerprint({
    ...READ,
    ...unreadBrowser("eval exception: TypeError: x is null\n    at <anonymous>:12:68\n    at <anonymous>:13:3"),
  });
  assert.ok(stacked.endsWith("; unread because eval exception: TypeError: x is null"), stacked);
  assert.equal(stacked.includes("\n"), false);
});

test("the lane driver reads a fingerprint line back whole, and reads it as neither a tally nor a skip", () => {
  const line = environmentFingerprint(READ);
  assert.equal(laneFingerprint(line), line.slice(FINGERPRINT_LEAD.length));
  assert.equal(laneCheckTally(line), null);
  assert.equal(laneLineIsSkip(line), false);
  assert.equal(laneFingerprint("PASS  R1 the chart draws"), null);
  assert.equal(laneFingerprint(`[A] ${line}`), null, "the driver reads the child's own line, before its prefix");
});

test("the host facts are this process's own", () => {
  assert.deepEqual(hostFacts(), {
    platform: process.platform,
    release: release(),
    arch: process.arch,
    node: process.version,
  });
});
