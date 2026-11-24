import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { createServer } from "node:net";
import { join } from "node:path";
import { cleanup, launchBrowser } from "../../e2e/harness.ts";
import { STAND_IN_COUNTER, standInTarget } from "../../test-support/stand-in-browser.ts";
import { STAND_IN_TUNING, standInBrowser, type StandInOptions } from "../../test-support/stand-in-launch.ts";
import { settle } from "../../test-support/launch-settle.ts";
import { goneWithin, isAlive } from "../../test-support/process-fakes.ts";

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });
}

async function standIn(options: StandInOptions) {
  return { ...standInBrowser("vellum-e2e-", options), port: await freePort() };
}

test(
  "the harness's own launch, with a stand-in browser silent on its first start, comes up on attempt 2 and cleanup removes the rest",
  { timeout: 60_000 },
  async () => {
    const s = await standIn({ silent: 1 });
    try {
      const target = await launchBrowser(s.browser, s.port, STAND_IN_TUNING);
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
    const s = await standIn({ silent: 2 });
    try {
      const got = await settle(launchBrowser(s.browser, s.port, { ...STAND_IN_TUNING, attempts: 2, polls: 100 }));
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
    const s = await standIn({});
    const holder: HttpServer = await new Promise((resolve) => {
      const h = createHttpServer((_req, res) => res.end("{}")).listen(s.port, "127.0.0.1", () => resolve(h));
    });
    try {
      const got = await settle(launchBrowser(s.browser, s.port, STAND_IN_TUNING));
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
    const s = await standIn({ body: () => "exit 1" });
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
