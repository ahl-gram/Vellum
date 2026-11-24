import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LAUNCH_TUNING, type LaunchTuning } from "../../e2e/support/launch.ts";
import { launchPress, pressPictures, type Launch, type Launched } from "../../scripts/primer-pictures/press.ts";
import { STAND_IN_COUNTER, standInTarget } from "../../test-support/stand-in-browser.ts";
import { EXEC_STAND_IN, STAND_IN_TUNING, standInBrowser } from "../../test-support/stand-in-launch.ts";
import { settle, settleWithin } from "../../test-support/launch-settle.ts";

const PROFILE_PREFIX = "vellum-primer-pictures-";
const timers = (): number => process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;

test(
  "PIC12 the press's launch retries on a fresh profile as the e2e harness's does: a browser that dies on its first start comes up on its second, and every profile is gone once the press closes",
  { timeout: 60_000 },
  async () => {
    const s = standInBrowser(PROFILE_PREFIX, {
      body: (dir) => `if [ -e "${dir}/started" ]; then ${EXEC_STAND_IN}; fi\n: > "${dir}/started"\nexit 1`,
    });
    let launched: Launched | undefined;
    try {
      const got = await settle(launchPress(s.browser, STAND_IN_TUNING));
      assert.equal(got.error, undefined, `the launch rejected: ${got.error?.message ?? ""}`);
      launched = got.value;
      assert.ok(launched, "the launch gave nothing");
      assert.equal(launched.url, standInTarget(launched.port, 1));
      assert.equal(
        s
          .lines()
          .filter((l) =>
            /attempt 1\/3 exposed no devtools target: browser exited code=1 signal=null; pid \d+, already gone; retrying with a fresh profile in 50ms/.test(
              l,
            ),
          ).length,
        1,
        `no retry line naming attempt 1's exit and the tuning's pause: ${JSON.stringify(s.lines())}`,
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
  "PIC13 with no tuning passed, the press hands the e2e harness's launch its ruled tuning (Issue #621), and a launch that fails stops the browser it started, removes its profile and names the browser and the remedy",
  { timeout: 60_000 },
  async () => {
    const s = standInBrowser(PROFILE_PREFIX);
    const handed: LaunchTuning[] = [];
    const launch: Launch = async (deps, tuning) => {
      handed.push(tuning);
      await deps.spawn(1);
      throw new Error("no devtools page target after 3 launch attempts");
    };
    let launched: Launched | undefined;
    try {
      const got = await settle(launchPress(s.browser, undefined, launch));
      launched = got.value;
      assert.deepEqual(handed, [LAUNCH_TUNING]);
      assert.equal(
        got.error?.message,
        `${s.browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\nno devtools page target after 3 launch attempts`,
      );
      assert.deepEqual(s.profiles(), [], "a failed launch left its browser's profile behind");
    } finally {
      await launched?.close();
      s.restore();
    }
  },
);

test(
  "PIC15 a browser that stops answering fails the press at its reply cap, naming the call it never answered, and leaves no profile",
  { timeout: 60_000 },
  async () => {
    const s = standInBrowser(PROFILE_PREFIX);
    const svg = join(s.dir, "chart.svg");
    writeFileSync(svg, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="8"></svg>');
    try {
      const got = await settleWithin(
        20_000,
        pressPictures(s.browser, [{ svg, out: join(s.dir, "chart.webp") }], {
          pixelWidth: 4,
          quality: 70,
          replyMs: 1_000,
        }),
      );
      assert.equal(got.error?.message, "Page.enable: no reply in 1000 ms");
      assert.deepEqual(readdirSync(s.dir).sort(), ["browser", "chart.svg", STAND_IN_COUNTER]);
    } finally {
      s.restore();
    }
  },
);
