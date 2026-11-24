import { mock, test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { LaunchTuning } from "../../e2e/support/launch.ts";
import { launchPress, type Launched } from "../../scripts/primer-pictures/press.ts";
import { STAND_IN_BROWSER, STAND_IN_SILENT_VAR, standInTarget } from "../../test-support/stand-in-browser.ts";
import { settle } from "../../test-support/launch-settle.ts";

// 2026-11-24, Issue #1255: FAST gives a stand-in its 3000ms to bind as REAL does in test/e2e/launch-harness.test.ts, sized there on ten CI runs whose slowest second stand-in came up in about 420ms.
const FAST: LaunchTuning = { attempts: 3, polls: 150, pollMs: 20, killGraceMs: 5000, retryPauseMs: 50 };
const PROFILE_PREFIX = "vellum-primer-pictures-";
const timers = (): number => process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;

function standIn(body: (dir: string) => string, silent = 0) {
  const dir = mkdtempSync(join(tmpdir(), "press-launch-test-"));
  const saved = { tmp: process.env["TMPDIR"], silent: process.env[STAND_IN_SILENT_VAR] };
  process.env["TMPDIR"] = dir;
  process.env[STAND_IN_SILENT_VAR] = String(silent);
  const browser = join(dir, "browser");
  writeFileSync(browser, `#!/bin/sh\n${body(dir)}\n`);
  chmodSync(browser, 0o755);
  const logged = mock.method(console, "error", () => {});
  return {
    browser,
    lines: () => logged.mock.calls.map((c) => String(c.arguments[0])),
    profiles: () => readdirSync(dir).filter((n) => n.startsWith(PROFILE_PREFIX)),
    restore: () => {
      logged.mock.restore();
      if (saved.tmp === undefined) delete process.env["TMPDIR"];
      else process.env["TMPDIR"] = saved.tmp;
      if (saved.silent === undefined) delete process.env[STAND_IN_SILENT_VAR];
      else process.env[STAND_IN_SILENT_VAR] = saved.silent;
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

test(
  "PIC12 the press's launch retries on a fresh profile as the e2e harness's does: a browser that dies on its first start comes up on its second, and every profile is gone once the press closes",
  { timeout: 60_000 },
  async () => {
    const s = standIn(
      (dir) =>
        `if [ -e "${dir}/started" ]; then exec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"; fi\n: > "${dir}/started"\nexit 1`,
    );
    let launched: Launched | undefined;
    try {
      const got = await settle(launchPress(s.browser, FAST));
      assert.equal(got.error, undefined, `the launch rejected: ${got.error?.message ?? ""}`);
      launched = got.value;
      assert.ok(launched, "the launch gave nothing");
      assert.equal(launched.url, standInTarget(launched.port, 1));
      assert.equal(
        s.lines().filter((l) => /attempt 1\/3 exposed no devtools target: browser exited code=1/.test(l)).length,
        1,
        `no retry line naming attempt 1's exit: ${JSON.stringify(s.lines())}`,
      );
      assert.equal(
        s.profiles().length,
        1,
        `expected only the live attempt's profile, found ${s.profiles().join(", ")}`,
      );
      const held = timers();
      await launched.close();
      assert.equal(timers(), held, "closing the press left a timer holding the process open");
      assert.deepEqual(s.profiles(), [], "closing the press left a profile behind");
    } finally {
      await launched?.close();
      s.restore();
    }
  },
);

test(
  "PIC13 with no tuning passed, the press's launch takes the e2e harness's: a browser that never answers is given 60s, each retry waits 2s, and after three attempts the failure names the browser and the remedy",
  { timeout: 60_000 },
  async () => {
    const s = standIn(
      (dir) =>
        `if [ -e "${dir}/started" ]; then exit 1; fi\n: > "${dir}/started"\nexec "${process.execPath}" "${STAND_IN_BROWSER}" "$@"`,
      1,
    );
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const launch: { settled: boolean; error?: unknown } = { settled: false };
      void launchPress(s.browser).then(
        () => {
          launch.settled = true;
        },
        (error: unknown) => {
          launch.settled = true;
          launch.error = error;
        },
      );
      const flush = () => new Promise((done) => setImmediate(done));
      for (let n = 0; !launch.settled && n < 20_000; n++) {
        await flush();
        mock.timers.tick(25);
      }
      mock.timers.reset();
      assert.ok(launch.settled, "the launch never finished");
      assert.match(
        s.lines().find((l) => l.includes("attempt 1/3 exposed")) ?? "",
        /attempt 1\/3 exposed no devtools target: no page target in 60000ms/,
      );
      assert.deepEqual(
        s
          .lines()
          .map((l) => /retrying with a fresh profile in (\d+)ms/.exec(l)?.[1])
          .filter((p) => p !== undefined),
        ["2000", "2000"],
      );
      assert.ok(
        launch.error instanceof Error &&
          launch.error.message.startsWith(
            `${s.browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\nno devtools page target after 3 launch attempts`,
          ),
        `the failure does not name the browser, the remedy and the attempts: ${String(launch.error)}`,
      );
      assert.deepEqual(s.profiles(), [], "a failed attempt's profile was left behind");
    } finally {
      mock.timers.reset();
      s.restore();
    }
  },
);
