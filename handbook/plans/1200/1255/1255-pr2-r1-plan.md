# Issue #1255, pull request 2, revision 1: the press launches its browser as the e2e harness does

**Revision 1 of `handbook/plans/1200/1255/1255-pr2-plan.md`** (the plan pull request 2 first committed, revision 0, archived on the issue in comments 7118882749 and 7118883137, sha256 91d83a7a67d0c4c868ba865c02c38006423482462ef682b37de1ad3390bb4925). **What it changes against that plan:** Files 15's launch (one browser, a 15 s cap on a 50 ms poll of `/json/list`, no retry) is replaced by a launch through `launchWithRetry` with `LAUNCH_TUNING` from `e2e/support/launch.ts`, three attempts of a 60 s wait, each on a fresh profile; the press's teardown clears its exit cap's timer, which at 0f1dfa8f held every pictures step's process 5 s past its work; two unit tests (PIC12, PIC13) guard the retry, the 60 s wait, the pause, the message and the teardown; two specs gain a sentence each; the two walk-check proofs the launch cap left INCONCLUSIVE are sent again. Everything else in that plan stands as written, its rulings, its calls C1 to C22 and the builder's E1, E3, E4 and E5 included; the builder's E2 is superseded in part (R9). The build resumes on `feat/1255-primer-pictures` at 0f1dfa8f744c89a65a9ee4f68f8f7822d751b000 and applies this file as a delta on top of it.

**Planned at:** origin/main `6161852bb16983f0e3e3563444b27793992c97e2` (`git ls-remote origin refs/heads/main`, 2026-11-24). Issue #1255 carries 9 comments (reader header "Comments: 9 shown, 0 withheld", read 2026-11-24): the five the plan it revises recorded, its two archive parts 7118882749 and 7118883137 (not rulings), the builder's calls 7119167766, and Alex's hand-back ruling 7119381682. Issue #621 carries 6 shown, 0 withheld, of which comment 5965294326 binds here (R8).

**Rulings:** every ruling the plan it revises carries (Alex, https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7115489261, Q1 to Q5; https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7118854565, Q6, "The planner's calls C1 to C22 stand as the plan writes them"; Issue #1155's ruling 8, N8 and M3), and: Alex, 2026-11-24, https://github.com/ahl-gram/Vellum/issues/1255#issuecomment-7119381682, "Revise the plan (Recommended)": "A revision planner revises the plan so the press launches the browser as the e2e harness does, puts any new decision to Alex, and the build resumes on the same branch." Standing, from Issue #621: Alex, 2026-10-02, https://github.com/ahl-gram/Vellum/issues/621#issuecomment-5965294326: "Each launch attempt waits 60 seconds ... Ruled as a VALUE, not a ratio: a later reading that moves the ratio does not reopen it; only a measured first start past 60 seconds comes back to Alex."

**Open decisions:** none.

## Recon, folded (workflow steps 2 and 5)

`vellum-spec-recon` over the issue, the plan it revises and nine claims this revision rests on, at origin/main 6161852b and the branch at 0f1dfa8f: 9 CURRENT, 0 STALE, 0 UNVERIFIABLE (it checked them by direct command and did not run `npm run recon-triage`, a departure it named). Nuances folded: the two failed proof jobs' GitHub conclusion is `success` (the build failed inside them, and the ledger job failed), and their error text lives in the result artifacts `result-4` (artifact 14881770708) and `result-2` (14881197168), not in the job logs; `spawnBrowser` in `e2e/harness.ts` also passes `ABOUT_BLANK` last. Its open decisions, disposed of: the four about the launch (the harness's `launchBrowser` and `cleanup` against `launchWithRetry` alone, `cleanup()`'s profile leak, the 3-minute worst case, the harness's `--window-size`) are each taken below as a call with its rule (R1, R2, R7; `--window-size` is not taken, R2). Whether the survey step carries a picture, which the body left "for the builder to confirm", is ruled: Q2 ruled "The 24", the plan it revises read `explorer-survey` as `no change` in its after probe and names it in C11, and this revision touches no ladder. That the archived plan's "Open decisions: none" predates comment 7119381682 is superseded by this file, which carries that ruling. Its note that Q3 is provisional and Q5 leaves Issue #1384 open is unchanged by this revision.

## What the measurements say

Probes and logs in this planner's tree, `out/1255-dry-run/`, copied to the main checkout's `out/1255-dry-run/` when the tree retires; each ran at 0f1dfa8f (the tree detached there), Node v26.13.1, the browser `findBrowser` takes on this Mac: Brave Browser, engine `Chrome/158.0.8127.42`.

- **The runner's first starts, swept** (`bash out/1255-dry-run/1255-r1-sweep.sh`, output `out/1255-dry-run/1255-r1-launches.tsv`, both first written to the scratchpad's `1255-r1-sweep/`): every `build & e2e lane` job of the 63 CI runs created from 2026-11-17 to 2026-11-24 that were not cancelled, 252 jobs on `ubuntu-26.04`, their logs grepped for `browser up on attempt` and `exposed no devtools target`. 240 printed a launch line (the other 12 are docs-only runs that skip the lanes). Every one came up on attempt 1, none retried: 0.587 s fastest, 6.97 s median, 15.6 s at the 90th percentile, 20.2 s at the 95th, 34.8 s at the 99th; 28 past 15 s, 12 past 20 s, 2 past 35.7 s: 47.5 s (run 45115036570, job 137495926430, image version 20261116.202.1) and **56.4 s, the slowest** (run 44599876768, job 135828041829, image version 20261111.196.1, lane C, whose fingerprint line then read `google-chrome version unread`). Both slow ones are a lane's only launch, so a first start.
- **The press on the runner** (proof runs 45305657670 and 45306297095, both at 0f1dfa8f, their 16 result artifacts and two ledgers unpacked under `out/1255-dry-run/1255-r1-proof-artifacts/`, one folder per artifact id): 14 of 16 builds pressed all 24 pictures; 2 stopped at the cap, `/usr/bin/google-chrome opened no page to press with in 15000 ms` (result-4 and result-2 of 45306297095). 2 of 16 past 15 s fits the lanes' 28 of 240. In all 14 builds that pressed, the harness's own launch that followed came up on attempt 1 in 155 to 289 ms: **the press is now each job's cold start**, and the lane's own launch is warm.
- **The new launch, against stand-in browsers** (`node out/1255-dry-run/1255-r1-launch-probe.ts a 0f1dfa8f`, log `1255-r1-launch-probe-a.log`; the probe carries `launchPress` as Files R1 below gives it, and a stub that passes `attempts: 1`): a stand-in that dies on its first start and serves on its second came up in 275 ms, its URL `standInTarget(port, 1)`, one retry line `attempt 1/3 exposed no devtools target: browser exited code=1 signal=null; pid 55288, already gone; retrying with a fresh profile in 50ms...`, one profile before close and none after; the stub REJECTED it in 93 ms. A stand-in that only exits, with no tuning passed, was rejected after 4,394 ms with retry pauses `["2000","2000"]` and a message opening `<browser> opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless | no devtools page target after 3 launch attempts` and carrying `browser exited code=1`, no profile left; the stub gave pauses `[]`.
- **The pictures do not move** (`node out/1255-dry-run/1255-r1-launch-probe.ts b 0f1dfa8f`, log `1255-r1-launch-probe-b.log`): `writePictures` with the branch's `pressPictures`, then with the probe's press through the new launch: `pictures: 24 pressed with /Applications/Brave Browser.app/Contents/MacOS/Brave Browser (Chrome/158.0.8127.42), 303746 bytes in all` both times, **24 of 24 WebPs byte-identical**, the second run's launch line `e2e: browser up on attempt 1/3, pid 55466, devtools target in 282ms`, no `vellum-primer-pictures-*` profile left in the temporary folder.
- **The teardown held the process open** (`out/1255-dry-run/1255-r1-exit-tail.log`): at 0f1dfa8f, `writePictures` resolved at 11,279 ms and the process exited at 16.36 s, because `Promise.race([gone, sleep(EXIT_MS)])` leaves the 5 s timer pending after the browser is gone. With the cap's timer cleared (`1255-r1-exit-tail-fixed.log`), a launch and close resolved at 406 ms and the process exited at 0.48 s. A browser was gone 12 to 15 ms after its kill, five launches (`1255-r1-launch-probe-c.log`).
- **The planned files, staged and reverted** (Files R1's `press.ts` composed as `out/1255-dry-run/1255-r1-press-planned.ts`, sha256 7804324b4eb5be1c638c6f942a6db95d12d4d67888276800bcfc93ef4abee3c9, and Files R2's test as `out/1255-dry-run/1255-r1-press-test-final.ts`, sha256 16adc4026771435589a514eabe9daab2bb39fcae53af8e71195106fc035d554a, copied into place, run, then `git checkout -- scripts/primer-pictures/press.ts` and the test removed, `git status --short` clean): `eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` on both exit 0 with no line (`1255-r1-lint.log`); `tsc --noEmit` exit 0 (`1255-r1-tsc.log`); `npm test -- test/site/primer-pictures-press.test.ts test/site/primer-pictures-write.test.ts` 5 pass, PIC12 263 ms, PIC13 117 ms, 1,016 ms in all (`1255-r1-unit.log`); `prettier --check` wants both reformatted, which `npm run format` writes. Every mutation Tests names red on its named assertion (`1255-r1-mutate.log`). An earlier draft held the default wait with a stand-in that only exits, which never runs a wait out: a 15 s default stayed green under it, so PIC13 drives the wait on mocked timers instead.
- **The copy hunt's own similarity** (`node out/1255-dry-run/1255-r1-copy-pairs-planned.ts`, log `1255-r1-copy-pairs.log`: `functionsIn` and `jaccard` from `scripts/copy-hunt/` over the planned `press.ts` against every function under `e2e/`, `scripts/` and `test-support/`): the nearest pairs the hunt sees are the launch's `spawn` closure to `spawnBrowser` in `e2e/harness.ts` at 0.561 and `pageTarget` to `probePageTarget` at 0.550, both under its cut of 0.6; every pair at or above 0.6 is a function under 6 names, which the hunt does not read. The dry run over the branch as it stands (`npm run copy-hunt -- diff origin/main origin/feat/1255-primer-pictures --dry-run`) names no pair in `scripts/primer-pictures/press.ts`.

## Specs

Beyond the plan it revises: `handbook/specs/settle-doctrine.md`, the bullet opening "A launch retry is a retry only when" (edited, Rosters below) and "Ports are overridable and the debug port is preflighted" (R4); `handbook/specs/rulebook.md`, What `src/` holds, and what runs around it ("The four may import from `src/` and from one another"); `handbook/specs/check-placement.md`, The unit suite; `handbook/specs/conventions.md`, How a spec is written, and the comment rule (two dated lines, Files R1, one in Files R2); `handbook/specs/site-architecture.md`, the branch's bullet opening "The Primer's pictures need a browser where the site is built" (edited).

## The design, as it changes

**The press launches as the harness does.** `launchPress(browser, tuning = LAUNCH_TUNING)` in `scripts/primer-pictures/press.ts` takes a port from `freePort()` and hands `launchWithRetry` (`e2e/support/launch.ts`) four functions: a preflight that resolves at once; a spawn that makes a fresh profile under the temporary folder and starts the browser with the press's flags, its output piped, as the harness's spawn does; a probe that reads `/json` for a page target, as the harness's does; and a log that writes each line to `console.error`, as the harness's does. `launchWithRetry` then waits up to 60 s for a page, kills a browser that has none, waits for it to be gone, removes its profile, pauses 2 s and starts a fresh one, three times, and fails with every attempt's own reason and output. `launchPress` records each attempt it starts, and its `close` kills each, waits for it to be gone (capped at 5 s, the cap's timer cleared), and removes its profile. `pressPictures` launches through it and closes it in its `finally`; the pressing itself is unchanged.

**What the build log prints.** Each build that presses now prints the harness's own launch line before its `pictures:` line, `  e2e: browser up on attempt 1/3, pid <pid>, devtools target in <ms>ms`, and a retry line when an attempt fails; a press that never gets a page fails the build with `<browser> opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless`, then launchWithRetry's own lines, every attempt's reason and output.

**Rejected, with the reason** (beside the plan's own list, which stands):
- **`launchBrowser` and `cleanup` from `e2e/harness.ts`**, the harness's launch whole: it keeps its browser and profile in module state, names the profile `vellum-e2e-*` (the e2e runs' own), and `cleanup()` removes the profile in the same breath as the kill, which can leave it behind (`handbook/errata/guards.md`, the PR #735 row on `cleanup()`); the press runs at every local `npm run build` and `npm run astro:dev` start, where a profile left per start is the shape of the 2026-09-08 incident `cleanup()`'s own comment records (446 profiles, 20 GB). `launchWithRetry` and `LAUNCH_TUNING` are the launch Alex's ruling names; the spawn and the teardown stay the press's.
- **Moving `e2e/support/launch.ts` to a folder both read**: the rulebook lets the four folders import from one another, `scripts/design/shoot.ts`, `scripts/lint/source-shape-console.ts`, `scripts/unit-file-clock.ts` and the branch's own `scripts/primer-pictures/browser.ts` already import from `e2e/`, and a move would rewrite what `handbook/specs/settle-doctrine.md`, `handbook/errata/guards.md`, `test/e2e/launch.test.ts` and `test/e2e/launch-harness.test.ts` cite, for no behaviour.
- **A longer wait of the press's own, or a raised `LAUNCH_TUNING`**: the 60 s wait is a value Alex ruled on Issue #621 that "only a measured first start past 60 seconds" reopens; the slowest first start swept is 56.4 s (R8). A start past 60 s is killed and retried on a fresh profile, not failed.
- **Exporting `probePageTarget` from `e2e/harness.ts`** in place of `pageTarget`: it would make a build script load the harness's module, with its module state, for a five-line read, and its `httpGet` has no timeout (`handbook/errata/guards.md`, the PR #735 row on `httpGet`), which the press's `fetch` shares; the pair sits under the copy hunt's cut (0.550).

## Files

Every path from the repo root; "unchanged" means as at 0f1dfa8f. Text quoted is the text measured above (the planned files staged and reverted), before `npm run format`.

**R1. `scripts/primer-pictures/press.ts`** (171 lines at 0f1dfa8f, 193 after, before formatting). Exported types `Pressing`, `PressOptions`, `Pressed` and the private `Reply` and `connect` unchanged; `pressPictures(browser: string, pressings: readonly Pressing[], options: PressOptions): Promise<Pressed>` keeps its signature. Changes:
- Imports become exactly:
  ```ts
  import { spawn, type ChildProcess } from "node:child_process";
  import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
  import { rm } from "node:fs/promises";
  import { tmpdir } from "node:os";
  import { join } from "node:path";
  import { pathToFileURL } from "node:url";
  import { LAUNCH_TUNING, launchWithRetry, type LaunchAttempt, type LaunchTuning } from "../../e2e/support/launch.ts";
  import { svgDimensions } from "../../src/cli/raster.ts";
  import { freePort } from "../free-port.ts";
  ```
- After `Pressed`, a new export: `export interface Launched { readonly port: number; readonly url: string; close(): Promise<void>; }`.
- Delete the dated line above `LAUNCH_MS`, and `LAUNCH_MS`, `POLL_MS`, `sleep` and `pageSocket`. In their place, exactly:
  ```ts
  const PROFILE_PREFIX = "vellum-primer-pictures-";
  // 2026-11-24, Issue #1255: a chart loaded in about 40 ms and a browser was gone 12 to 15 ms after its kill on this Mac, and none of the 336 loads in fourteen GitHub proof builds at 0f1dfa8f (runs 45305657670 and 45306297095) reached LOAD_MS; each cap is a hang's cost, not a budget.
  const LOAD_MS = 10_000;
  const EXIT_MS = 5_000;
  ```
  `interface Target` stays as it is. Then, new, exactly:
  ```ts
  interface Live {
    readonly child: ChildProcess;
    readonly profile: string;
    readonly gone: Promise<void>;
  }

  async function pageTarget(port: number): Promise<string> {
    const list = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()) as readonly Target[];
    const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl !== undefined);
    if (page?.webSocketDebuggerUrl === undefined) throw new Error(`/json had ${list.length} targets, none a page`);
    return page.webSocketDebuggerUrl;
  }

  async function stop(live: Live): Promise<void> {
    live.child.kill();
    let timer: NodeJS.Timeout | undefined;
    await Promise.race([live.gone, new Promise<void>((done) => (timer = setTimeout(done, EXIT_MS)))]);
    clearTimeout(timer);
    rmSync(live.profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }

  // 2026-11-24, Issue #1255: the press starts a build's first browser, and on GitHub's runners a first start took 0.6 to 56.4 s over 240 CI lane jobs from 2026-11-17 to 2026-11-24 and passed 15 s in 2 of 16 proof builds at 0f1dfa8f (runs 45305657670 and 45306297095), so it waits and retries as the e2e harness does.
  export async function launchPress(browser: string, tuning: LaunchTuning = LAUNCH_TUNING): Promise<Launched> {
    const port = await freePort();
    const lives: Live[] = [];
    const close = async (): Promise<void> => {
      for (const live of lives) await stop(live);
    };
    const attempt = (): Promise<LaunchAttempt> => {
      const profile = mkdtempSync(join(tmpdir(), PROFILE_PREFIX));
      const child = spawn(
        browser,
        [
          "--headless=new",
          `--remote-debugging-port=${port}`,
          `--user-data-dir=${profile}`,
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--hide-scrollbars",
          "--force-device-scale-factor=1",
          "about:blank",
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
      );
      const gone = new Promise<void>((done) => {
        child.once("exit", () => done());
        child.once("error", () => done());
      });
      lives.push({ child, profile, gone });
      return Promise.resolve({
        child,
        discard: () => rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {}),
      });
    };
    try {
      const url = await launchWithRetry(
        { preflight: () => Promise.resolve(), spawn: attempt, probe: () => pageTarget(port), log: (line) => console.error(line) },
        tuning,
      );
      return { port, url, close };
    } catch (err) {
      await close();
      throw new Error(
        `${browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\n${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }
  }
  ```
- `pressPictures`'s body becomes, exactly (the loop unchanged from 0f1dfa8f):
  ```ts
  const launched = await launchPress(browser);
  let socket: WebSocket | null = null;
  try {
    const product = await fetch(`http://127.0.0.1:${launched.port}/json/version`)
      .then((r) => r.json() as Promise<{ readonly Browser?: string }>)
      .then((v) => v.Browser ?? "unnamed browser");
    const cdp = await connect(launched.url);
    socket = cdp.socket;
    await cdp.send("Page.enable");
    let bytes = 0;
    for (const pressing of pressings) {
      // the 0f1dfa8f loop, unchanged: svgDimensions, setDeviceMetricsOverride, loaded, navigate, captureScreenshot, writeFileSync, bytes
    }
    return { product, bytes };
  } finally {
    socket?.close();
    await launched.close();
  }
  ```
  (the comment line above stands for the loop's ten lines and is not written.) The port, profile, `spawn`, `spawnError`, `exited`, `gone` and `child` handling that 0f1dfa8f's `pressPictures` held, and its `finally`'s kill, race and `rmSync`, are deleted: `launchPress` holds them now.

**R2. `test/site/primer-pictures-press.test.ts`**, new (121 lines before formatting), exactly the measured text (`out/1255-dry-run/1255-r1-press-test-final.ts`, sha256 16adc4026771435589a514eabe9daab2bb39fcae53af8e71195106fc035d554a):
```ts
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
      assert.equal(s.profiles().length, 1, `expected only the live attempt's profile, found ${s.profiles().join(", ")}`);
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
        s.lines().map((l) => /retrying with a fresh profile in (\d+)ms/.exec(l)?.[1]).filter((p) => p !== undefined),
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
```

**R3. `handbook/specs/settle-doctrine.md`**, the bullet opening "**A launch retry is a retry only when the new attempt watches its own browser**": after the sentence ending "grepped for `browser up on attempt` and `exposed no devtools target`." insert, wrapped as the file wraps: "**A lane's first browser is its build's.** The Primer's picture press (`launchPress` in `scripts/primer-pictures/press.ts`) launches through the same `launchWithRetry` with `LAUNCH_TUNING` and prints the same two lines in the build step, so a job's cold start is the first `browser up on attempt` line in its log, and the lane's own launch, after it, starts warm."

**R4. `handbook/specs/site-architecture.md`**, the branch's bullet opening "**The Primer's pictures need a browser where the site is built.**": the sentence "A browser that is found but cannot run headless with a profile under the temporary folder, as a snap-confined Chromium cannot, fails the build at the press, naming itself: point `VELLUM_BROWSER` at another." becomes "A browser that is found but opens no page, as a snap-confined Chromium cannot with a profile under the temporary folder, fails the build at the press once it has been launched as the e2e harness launches one (`launchWithRetry` and `LAUNCH_TUNING` in `e2e/support/launch.ts`, three attempts on fresh profiles), naming itself and every attempt's own output: point `VELLUM_BROWSER` at another."

**R5. `handbook/plans/1200/1255/1255-pr2-r1-plan.md`**, this file, archived beside `1255-plan.md` and `1255-pr2-plan.md`, both frozen.

No other file changes. `scripts/primer-pictures/main.ts`, its `Press` type and PIC8 to PIC10 are untouched (the press's signature is the same). `e2e/support/launch.ts`, `e2e/harness.ts` and their tests are untouched.

## Tests, in the order they are written

Ids free (`git grep -n -E "PIC1[2-9]"` outside `handbook/plans` prints nothing at 0f1dfa8f).

Every red and green below was measured on the planned files staged in this planner's tree and reverted (`node out/1255-dry-run/1255-r1-mutate.ts`, log `out/1255-dry-run/1255-r1-mutate.log`: it writes `out/1255-dry-run/1255-r1-press-planned.ts` over `scripts/primer-pictures/press.ts` with each mutation applied in turn, runs `node --test test/site/primer-pictures-press.test.ts`, and restores). Green: PIC12 281 ms, PIC13 104 ms, the file 590 ms.

1. **PIC12** (`test/site/primer-pictures-press.test.ts`, text in Files R2), the retry on a fresh profile with an explicit fast tuning. Asserts, in order: the launch resolves (`got.error` undefined); its URL is `standInTarget(port, 1)`; exactly one retry line names attempt 1's exit (`browser exited code=1`); one profile while open; no `Timeout` added by `close()`; no profile after. **Stub** (commit 1): `launchPress` as Files R1 gives it except that it passes `{ ...tuning, attempts: 1 }` to `launchWithRetry` in place of `tuning`; red on `the launch rejected: <browser> opened no page to press with; ...` (measured). **Mutations that red it once green**, each in `scripts/primer-pictures/press.ts`: (a) the stub's `{ ...tuning, attempts: 1 }` back in: red on `the launch rejected` (measured); (b) `discard: () => Promise.resolve(),`: red on `expected only the live attempt's profile, found vellum-primer-pictures-..., vellum-primer-pictures-...` (measured); (c) the line `clearTimeout(timer);` in `stop` deleted, which is 0f1dfa8f's teardown: red on `closing the press left a timer holding the process open` (measured; the file then takes 5.5 s); (d) `const close = async (): Promise<void> => {};`: red on `closing the press left a profile behind` (measured; the live stand-in then runs out its own 60 s, so the file takes 60.5 s).
2. **PIC13** (same file), the default tuning, on mocked timers: a stand-in silent on its first start and exiting on every later one, `launchPress` called with no tuning, `setTimeout` mocked and ticked 25 ms at a time after a `setImmediate` until the launch settles (about 3,100 ticks, about 100 ms real). Asserts: the launch settled; attempt 1's retry line reads `no page target in 60000ms`; the retry pauses read `["2000", "2000"]`; the failure opens with the browser, the remedy and `no devtools page target after 3 launch attempts`; no profile left. **Stub**: as PIC12's; red (measured: no retry line, so the first match fails). **Mutations**: (e) `tuning: LaunchTuning = { ...LAUNCH_TUNING, retryPauseMs: 500 }` as `launchPress`'s default: red on the pauses (measured); (f) `; point VELLUM_BROWSER at a Chromium-family browser that runs headless` deleted from the message: red on `the failure does not name the browser, the remedy and the attempts` (measured); (g) `tuning: LaunchTuning = { ...LAUNCH_TUNING, polls: 120 }`, the 15 s wait that sent the plan back: red on `/attempt 1\/3 exposed no devtools target: no page target in 60000ms/` (measured). PIC12 stays green under (e) to (g) and PIC13 under (b) to (d), each test holding its own half.

**Which the prover owes:** none; its one round on this pull request is spent (15 mutations BITE; `handbook/specs/development-workflow.md` step 15). **The implementer proves**, committed first, by breaking the line and running the test file, then restoring: PIC12's (a) to (d) and PIC13's (e) to (g) with `npm test -- test/site/primer-pictures-press.test.ts`, each red line pasted into the PR body's guard table as proven by the implementing session only; and the two mutations the prover's round left unreached: PIC10 with `PICTURE_PIXEL_WIDTH = 70` and `PICTURE_QUALITY = 432` swapped in `scripts/primer-pictures/main.ts` (`npm test -- test/site/primer-pictures-write.test.ts`, red on `call.options`), and BP-P6 with `fetchpriority="low"` deleted from the `img` in `src/pages/primer/index.astro` (`npm test -- test/site/built-pages.test.ts`, red on `pictureFaults`), named the same way.

**The walk check's runner proof, sent again.** After the last commit below is pushed, write `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/27876b88-406f-4f53-ad98-0e558b3f5808/scratchpad/1255-proof-r1.json` holding exactly the two entries `pic-explorer-sea-level` and `pic-reading-room-read` of `1255-proof.json` beside it, unchanged (their `expect` already the step ids), then `npm run proof -- send <that path>` and `npm run proof -- read <run>`. Owed: both rows BITES, both controls CLEAN, the run id in the PR body. The rows `pic-writing-room-plate` and `pic-print-room-style` stand at BITES from run 45306297095 at 0f1dfa8f: this revision changes neither the walk nor a ladder. No browser check is added or lengthened, so no ledger line and no new readings are owed.

## Order of commits

Each commit message ends with the house's three trailer lines (`CLAUDE.md`, Process, the attribution bullet).
0. **Resume and bring current**, once the dispatcher has retired the tree that holds the branch now (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a6d65d82873bf9763`), as `.claude/agents/vellum-implementer.md` says for a resumed branch; git refuses to check out a branch another tree holds. In the implementer's tree: `git fetch origin feat/1255-primer-pictures`, then `git checkout -B feat/1255-primer-pictures origin/feat/1255-primer-pictures`, then `git rev-parse HEAD` prints 0f1dfa8f744c89a65a9ee4f68f8f7822d751b000. `git fetch origin main`, then `git merge origin/main` (never a rebase), whose message is `#1255 Merge origin/main (the flake record's RH33 row)` and the trailers; `git diff --stat HEAD^1 HEAD` prints only `.claude/skills/vellum-footguns/references/flake-record.md`. This merge is not the revision's commit; the revision's plan rides commit 1. Then `npm run build`, and `shasum -a 256 dist/primer/pictures/*.webp > /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/27876b88-406f-4f53-ad98-0e558b3f5808/scratchpad/1255-r1-before.sha` (24 lines).
1. This plan archived at `handbook/plans/1200/1255/1255-pr2-r1-plan.md`; `Launched` and `launchPress` added to `press.ts` as the stub (Tests 1), `pressPictures` and everything else in the file untouched; `test/site/primer-pictures-press.test.ts`. PIC12 and PIC13 red on the assertions Tests names. Push.
2. `launchPress` real; `pressPictures` through it; the deletions and the two dated lines (Files R1). PIC12 and PIC13 green.
3. The two spec edits (Files R3, R4).
Then the hand proofs (Tests), the Evidence, push, the runner proof, the step 12 comment, the pull request.

## Rosters and doctrine

- **No roster joins.** A new test file under `test/site/` joins the unit suite by existing; it reads no source file (`SOURCE_READS`, measured: the unit runner passed it). It weighs under a second on this Mac, far below the 5 s at which `UNIT_SECONDS` names a file.
- **Doctrine**: Files R3 and R4, wording above. `handbook/errata/guards.md`'s PR #735 row on slow cold starts stays as written: its search (`browser up on attempt`, `exposed no devtools target` over a job's log) finds the press's line too. `LAUNCH_TUNING`'s dated line in `e2e/support/launch.ts` stays as written: Issue #621's ruling fixes what it names.
- **The plan it revises, Files 15**: superseded by Files R1 (its launch, its dated line, its `finally`); its connect helper, constants `LOAD_MS` and `EXIT_MS` and the pressing stand. Its Rejected entry "`start` in `e2e/harness.ts` for the press" stands.

## Evidence

- Commit 0's merge prints only `flake-record.md`.
- `npm test -- test/site/primer-pictures-press.test.ts test/site/primer-pictures-write.test.ts`; then `npm run check`, `npm run lint`, `npm run format:check`; then `npm test`, then `npm run astro:generate`.
- `npm run build` after commit 2: its log carries one `e2e: browser up on attempt 1/3, pid <pid>, devtools target in <ms>ms` line before `pictures: 24 pressed with <the Mac's browser> (<product>), <bytes> bytes in all`, the bytes commit 0's build printed (this planner's: 303,746); `shasum -a 256 -c /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/27876b88-406f-4f53-ad98-0e558b3f5808/scratchpad/1255-r1-before.sha` prints 24 `OK` (no pixel moved, so `vellum-plate-reader`'s clean round at 1024 and 1280 stands and is not owed again).
- `/usr/bin/time -p node scripts/primer-pictures/main.ts "$(mktemp -d)"` at commit 0's head and again after commit 2, both reported in the PR body (this planner: 16.36 s at 0f1dfa8f, of which 11.28 s was the work).
- `npm run copy-hunt -- diff origin/main HEAD --dry-run` names no pair in `scripts/primer-pictures/press.ts`.
- The hand proofs (Tests), their red lines in the PR body.
- The runner proof's ledger (Tests), its run id in the PR body.
- On the pull request's CI: from each lane's log (`gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`), the build step's `browser up on attempt` line (the press, the job's cold start), the e2e step's (the lane's own), and any `exposed no devtools target` line, quoted in the PR body; each lane's build step seconds against main's latest run, with the press's launch milliseconds beside them. A retry line on CI or in a proof run whose reason reads `no page target in 60000ms` is a measured first start past 60 s: the final report to the dispatcher names its job and quotes it, since Issue #621's ruling 5965294326 sends that reading to Alex; it does not stop a build that passed.
- The plan it revises: every Evidence line not named here stands (its e2e line was run green on the Mac at 0f1dfa8f and is not run again: the pictures are byte-identical and no suite, step or check changed).
- After merge (the dispatcher's): the first deploy's build log carries the press's `browser up on attempt` line and `pictures: 24 pressed with /usr/bin/google-chrome (...)`.

## Calls made

- **R1.** The press takes `launchWithRetry` and `LAUNCH_TUNING` from `e2e/support/launch.ts`, imported from `scripts/`, and the module is not moved. Rule: Alex's ruling 7119381682 ("launches the browser as the e2e harness does"); `handbook/specs/rulebook.md`, "The four may import from `src/` and from one another", with `scripts/design/shoot.ts`, `scripts/lint/source-shape-console.ts` and `scripts/unit-file-clock.ts` the precedent; a move rewrites what the settle doctrine, the errata and both launch tests cite, for no behaviour.
- **R2.** The spawn and the teardown stay the press's, not `launchBrowser` and `cleanup()` from `e2e/harness.ts`; its flags are 0f1dfa8f's, the harness's less `--window-size`, which the press's per-chart `Emulation.setDeviceMetricsOverride` makes moot. Rule: a build step must not leave a profile per local build (Rejected, above); the flags are measured byte-identical.
- **R3.** The probe reads `/json`, not 0f1dfa8f's `/json/list`. Rule: the harness's `probePageTarget` reads `/json`, and `test-support/stand-in-browser.ts` answers `/json` alone, which PIC12 drives.
- **R4.** The preflight resolves at once. Rule: the harness preflights a fixed port another run may hold (`handbook/specs/settle-doctrine.md`, "Ports are overridable and the debug port is preflighted"); the press takes the port the OS hands `freePort()`.
- **R5.** The launch's lines reach the build log unchanged, `e2e:` included, through `console.error`. Rule: the house's one search for a slow cold start greps a job's log for `browser up on attempt` and `exposed no devtools target` (`handbook/specs/settle-doctrine.md`; `handbook/errata/guards.md`, the PR #735 row), and the press now makes each job's cold start, so a reworded line would hide it; the cost is a build-step line that reads `e2e:`.
- **R6.** The teardown clears its exit cap's timer, as `stop` in `e2e/support/launch.ts` clears its own, and PIC12 holds it. Rule: a defect of the revised plan's own design (Files 15's "await the child's exit or EXIT_MS, whichever comes first"), measured at 5.1 s held open per build, fixed in its revision.
- **R7.** A browser that never opens a page now fails the build after about 3 minutes (three 60 s waits, two 2 s pauses, the kills), not 15 s. The lanes and the proof runner cap their jobs at 30 minutes and the deploy's build job sets no cap of its own. Rule: Issue #621's ruling 5965294326 took "A lane whose every attempt fails now takes about 3 minutes to report" for the same launch.
- **R8.** The wait stays 60 s, no menu: the sweep's slowest first start, 56.4 s, is under it. Rule: Issue #621's ruling 5965294326, a value that "only a measured first start past 60 seconds" brings back to Alex; the press's dated line carries the sweep, and `LAUNCH_TUNING`'s line is left as ruled.
- **R9.** The press's failure message is `<browser> opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless`, then `launchWithRetry`'s own lines. It supersedes the builder's E2 where E2 says "the launch cap's message names the browser as Files 15 gives it"; E2's `connect` helper stands, and E1, E3, E4 and E5 stand. Rule: C22, a found browser that cannot run fails at the press naming itself and the remedy.
- **R10.** PIC12 and PIC13 and the prover's two unreached mutations are proven by the implementer. Rule: `handbook/specs/development-workflow.md` step 15, one prover round per pull request, spent.
- **R11.** Only the two INCONCLUSIVE walk-check rows are sent again. Rule: the BITES rows were proved at 0f1dfa8f, and this revision changes neither the walk nor a ladder.
- **R12.** The branch merges origin/main first. Rule: `handbook/specs/development-workflow.md` step 10, "Bring a branch current with `git merge origin/main`, never a rebase"; the one commit main gained touches no file this branch does.
- **R13.** Names visible in the tree, listed so Alex can overrule: `launchPress`, `Launched`, `test/site/primer-pictures-press.test.ts`, PIC12, PIC13; the profile prefix `vellum-primer-pictures-` is 0f1dfa8f's. Rule: the default that a visible name is Alex's (`vellum-footguns`, Defaults), put here rather than asked one by one.

## Open decisions

none. The one the sweep could have opened, the 60 s wait, is a value Alex ruled on Issue #621 to come back only past 60 s, and the slowest first start is 56.4 s (R8).

## Stop conditions

Hand back, with the command and what it printed, when:
- `git checkout -B feat/1255-primer-pictures origin/feat/1255-primer-pictures` is refused because another tree still holds the branch (report it; the dispatcher retires that tree);
- the branch's head is not 0f1dfa8f744c89a65a9ee4f68f8f7822d751b000 at commit 0, or `git merge origin/main` conflicts or brings a file other than `.claude/skills/vellum-footguns/references/flake-record.md`; where origin/main has moved past 6161852b, any file this plan or the plan it revises names under `src/`, `test/`, `test-support/`, `e2e/` or `scripts/` changed since 6161852b (`git diff --stat 6161852b origin/main -- <files>`);
- `launchWithRetry`, `LAUNCH_TUNING`, `LaunchAttempt` or `LaunchTuning` is not exported from `e2e/support/launch.ts`, `LAUNCH_TUNING` is not `{ attempts: 3, polls: 480, pollMs: 125, killGraceMs: 5000, retryPauseMs: 2000 }`, `STAND_IN_BROWSER`, `STAND_IN_SILENT_VAR` or `standInTarget` is not in `test-support/stand-in-browser.ts`, `settle` is not in `test-support/launch-settle.ts`, or `scripts/primer-pictures/press.ts` at 0f1dfa8f is not as Files R1 describes it (`LAUNCH_MS`, `POLL_MS`, `sleep`, `pageSocket`, the inline spawn);
- PIC12 or PIC13 is not red on the assertion Tests names at commit 1, or not green at commit 2, or any of mutations (a) to (g) leaves its test green;
- the lint or the type check refuses the import of `e2e/support/launch.ts` from `scripts/primer-pictures/press.ts` (measured: both pass);
- `test/site/primer-pictures-press.test.ts` takes more than 5 s on the Mac (measured 0.6 to 1.0 s), PIC13's loop ends without the launch settling, or either test reds on CI with `press.ts` as Files R1 gives it;
- `shasum -a 256 -c` does not print 24 `OK` after commit 2;
- `npm run copy-hunt -- diff origin/main HEAD --dry-run` names a pair in `scripts/primer-pictures/press.ts`;
- the runner proof's ledger gives either row other than BITES, or a control other than CLEAN;
- on CI or a proof run, a build fails with `opened no page to press with` (every attempt failed): the report carries each attempt's reason and output from the log;
- on the pull request's CI, a lane's build step, less the press's own `devtools target in <ms>ms`, takes more than 60 s longer than on main's latest run (this replaces the plan it revises' bound, which counted the launch: a cold start of up to 56.4 s now falls in the build step);
- any stop condition of the plan it revises not replaced here fires.
