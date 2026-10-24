import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { release, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  FINGERPRINT_LEAD,
  NOT_PROBED,
  environmentFingerprint,
  fingerprinted,
  hostFacts,
  laneFingerprint,
  unreadBrowser,
} from "../../e2e/support/fingerprint.ts";
import type { BrowserFacts, EnvironmentFacts, HostFacts } from "../../e2e/support/fingerprint.ts";
import { laneCheckTally, laneLineIsSkip } from "../../e2e/support/lanes.ts";
import type { StartOptions } from "../../e2e/types.ts";

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

const HOST: HostFacts = { platform: "testos", release: "1.2.3", arch: "x64", node: "v26.0.0" };
const BROWSER: BrowserFacts = {
  product: "Chrome/1.2.3.4",
  numeroWidth: 100.3125,
  numeroFace: "Palatino",
  selectHeight: 34.21875,
  unread: null,
};
const OPTIONS = { browser: "/fake/browser", PAGE: "http://127.0.0.1:1/explorer/" } as StartOptions;
const ROOT = resolve(import.meta.dirname, "..", "..");
// A cap on a hang, never a budget (2026-10-24: the child exits in about 4.6 s, its launch's two 2 s retry pauses), so a wedged child reds by status instead of holding the unit lane.
const CHILD_TIMEOUT_MS = 30_000;

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

test("a started harness prints the machine once, read from the context it started, before the run is handed that context", async () => {
  const lines: string[] = [];
  const ctx = { id: "ctx" };
  const reads: unknown[] = [];
  const wrapped = fingerprinted(
    () => Promise.resolve(ctx),
    (c, page) => {
      reads.push([c, page]);
      lines.push("(read)");
      return new Promise<BrowserFacts>((settle) => setImmediate(() => settle(BROWSER)));
    },
    HOST,
    (line) => lines.push(line),
  );
  assert.equal(await wrapped(OPTIONS), ctx);
  assert.deepEqual(reads, [[ctx, OPTIONS.PAGE]]);
  assert.deepEqual(lines, [
    "(read)",
    'fingerprint: testos 1.2.3 x64; Node v26.0.0; browser Chrome/1.2.3.4; "Chart № 42" 100.31px; № in Palatino; select 34.22px',
  ]);
});

test("a harness that never starts still prints the machine with every browser fact unread, and the run gets the harness's own failure", async () => {
  const lines: string[] = [];
  const boom = new Error("no devtools page target");
  const wrapped = fingerprinted(
    () => Promise.reject(boom),
    () => Promise.resolve(BROWSER),
    HOST,
    (line) => lines.push(line),
  );
  await assert.rejects(wrapped(OPTIONS), (e) => e === boom);
  assert.deepEqual(lines, [
    'fingerprint: testos 1.2.3 x64; Node v26.0.0; browser version unread; "Chart № 42" unread; № face unread; select unread; unread because the harness stopped before the browser was probed',
  ]);
});

test("a probe that throws anyway is printed unread with its reason, and the run still gets its context", async () => {
  const lines: string[] = [];
  const ctx = { id: "ctx" };
  const wrapped = fingerprinted(
    () => Promise.resolve(ctx),
    () => Promise.reject(new Error("probe broke")),
    HOST,
    (line) => lines.push(line),
  );
  assert.equal(await wrapped(OPTIONS), ctx);
  assert.deepEqual(lines, [
    'fingerprint: testos 1.2.3 x64; Node v26.0.0; browser version unread; "Chart № 42" unread; № face unread; select unread; unread because probe broke',
  ]);
});

test("npm's runner prints the machine it ran on first, even when its browser never starts, and ends as a harness error", () => {
  const tmp = mkdtempSync(join(tmpdir(), "vellum-fingerprint-"));
  try {
    const child = spawnSync(process.execPath, [join(ROOT, "e2e", "run.ts")], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: CHILD_TIMEOUT_MS,
      env: {
        ...process.env,
        VELLUM_BROWSER: "/usr/bin/false",
        VELLUM_E2E_SUITES: "health",
        VELLUM_E2E_PORT: "8899",
        VELLUM_E2E_DPORT: "9399",
        TMPDIR: tmp,
      },
    });
    assert.equal(child.status, 2, child.stdout + child.stderr);
    assert.equal(
      child.stdout,
      `${environmentFingerprint({ ...hostFacts(), binary: "false", ...unreadBrowser(NOT_PROBED) })}\n`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
