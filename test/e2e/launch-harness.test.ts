import { mock, test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { createServer } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { LaunchTuning } from "../../e2e/support/launch.ts";
import { cleanup, launchBrowser } from "../../e2e/harness.ts";
import {
  STAND_IN_BROWSER,
  STAND_IN_COUNTER,
  STAND_IN_SILENT_VAR,
  standInTarget,
} from "../../test-support/stand-in-browser.ts";
import { settle } from "../../test-support/launch-settle.ts";

// REAL gives a stand-in node child 3000ms to bind: on ten CI runs through 2026-10-03 (PR #735) the slowest second stand-in came up in about 420ms.
const REAL: LaunchTuning = { attempts: 3, polls: 150, pollMs: 20, killGraceMs: 5000, retryPauseMs: 50 };

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });
}

async function standIn(silent: number, body = `exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`) {
  const dir = mkdtempSync(join(tmpdir(), "launch-test-"));
  const saved = { tmp: process.env["TMPDIR"], silent: process.env[STAND_IN_SILENT_VAR] };
  process.env["TMPDIR"] = dir;
  process.env[STAND_IN_SILENT_VAR] = String(silent);
  const browser = join(dir, "browser");
  writeFileSync(browser, `#!/bin/sh\n${body}\n`);
  chmodSync(browser, 0o755);
  const logged = mock.method(console, "error", () => {});
  const restore = () => {
    logged.mock.restore();
    if (saved.tmp === undefined) delete process.env["TMPDIR"];
    else process.env["TMPDIR"] = saved.tmp;
    if (saved.silent === undefined) delete process.env[STAND_IN_SILENT_VAR];
    else process.env[STAND_IN_SILENT_VAR] = saved.silent;
    rmSync(dir, { recursive: true, force: true });
  };
  const lines = () => logged.mock.calls.map((c) => String(c.arguments[0]));
  return {
    dir,
    browser,
    port: await freePort(),
    restore,
    lines,
    profiles: () => readdirSync(dir).filter((n) => n.startsWith("vellum-e2e-")),
  };
}

const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function goneWithin(pid: number, ms: number): Promise<boolean> {
  const until = performance.now() + ms;
  while (isAlive(pid) && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
  return !isAlive(pid);
}

test(
  "the harness's own launch, with a stand-in browser silent on its first start, comes up on attempt 2 and cleanup removes the rest",
  { timeout: 60_000 },
  async () => {
    const s = await standIn(1);
    try {
      const target = await launchBrowser(s.browser, s.port, REAL);
      assert.equal(target.webSocketDebuggerUrl, standInTarget(s.port, 2));
      const retry = s
        .lines()
        .join("\n")
        .match(
          /attempt 1\/3 exposed no devtools target: no page target in 3000ms \(last: connect ECONNREFUSED[^)]*\); pid (\d+), gone \d+ms after SIGKILL/,
        );
      assert.ok(retry, `no retry line naming attempt 1's own reason: ${JSON.stringify(s.lines())}`);
      assert.equal(isAlive(Number(retry[1])), false, "attempt 1's stand-in is still running");
      assert.equal(
        s.profiles().length,
        1,
        `expected only the live attempt's profile, found ${s.profiles().join(", ")}`,
      );
      const up = s
        .lines()
        .join("\n")
        .match(/browser up on attempt 2\/3, pid (\d+), devtools target in \d+ms$/m);
      assert.ok(up, `no success line: ${JSON.stringify(s.lines())}`);
      cleanup();
      assert.ok(await goneWithin(Number(up[1]), 5000), "cleanup() left attempt 2's stand-in running");
      assert.deepEqual(s.profiles(), [], "cleanup() left attempt 2's profile behind");
    } finally {
      cleanup();
      s.restore();
    }
  },
);

test(
  "the harness's own launch, every stand-in silent, fails with each attempt's own captured output",
  { timeout: 60_000 },
  async () => {
    const s = await standIn(2);
    try {
      const got = await settle(launchBrowser(s.browser, s.port, { ...REAL, attempts: 2, polls: 100 }));
      assert.match(
        got.error?.message ?? "",
        new RegExp(
          `attempt 1/2[\\s\\S]*stand-in launch 1 on port ${s.port}[\\s\\S]*attempt 2/2[\\s\\S]*stand-in launch 2 on port ${s.port}`,
        ),
      );
      assert.deepEqual(s.profiles(), [], "a failed attempt's profile was left behind");
    } finally {
      cleanup();
      s.restore();
    }
  },
);

test(
  "the harness's own launch checks the debug port first: a port already held starts no browser",
  { timeout: 60_000 },
  async () => {
    const s = await standIn(0);
    const holder: HttpServer = await new Promise((resolve) => {
      const h = createHttpServer((_req, res) => res.end("{}")).listen(s.port, "127.0.0.1", () => resolve(h));
    });
    try {
      const got = await settle(launchBrowser(s.browser, s.port, REAL));
      assert.match(got.error?.message ?? "", new RegExp(`something is already listening on e2e debug port ${s.port}`));
      assert.equal(
        existsSync(join(s.dir, STAND_IN_COUNTER)),
        false,
        "a stand-in browser was started against a held port",
      );
    } finally {
      holder.close();
      cleanup();
      s.restore();
    }
  },
);

test(
  "the harness's own launch with no tuning passed takes the ruled default: three attempts, a 2s pause before each retry",
  { timeout: 60_000 },
  async () => {
    const s = await standIn(0, "exit 1");
    try {
      const got = await settle(launchBrowser(s.browser, s.port));
      assert.match(
        got.error?.message ?? "",
        /no devtools page target after 3 launch attempts[\s\S]*browser exited code=1/,
      );
      const retries = s.lines().filter((l) => /exposed no devtools target/.test(l));
      assert.deepEqual(
        retries.map((l) => /retrying with a fresh profile in (\d+)ms/.exec(l)?.[1]),
        ["2000", "2000"],
      );
    } finally {
      cleanup();
      s.restore();
    }
  },
);
