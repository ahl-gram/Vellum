import { mock, test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { chmodSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { createServer } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LAUNCH_TUNING, launchWithRetry } from "../../e2e/support/launch.ts";
import type { LaunchDeps, LaunchTuning } from "../../e2e/support/launch.ts";
import { laneCheckTally } from "../../e2e/support/lanes.ts";
import { cleanup, launchBrowser } from "../../e2e/harness.ts";
import { STAND_IN_BROWSER, STAND_IN_COUNTER, STAND_IN_SILENT_VAR, standInTarget } from "../../test-support/stand-in-browser.ts";

type Plan = {
  readonly upAtProbe?: number;
  readonly reapMs?: number | null;
  readonly exitAfterMs?: number;
  readonly spawnError?: boolean;
  readonly output?: string;
  readonly lateOutputMs?: number;
};

type Mark = (event: string) => void;

class FakeBrowser extends EventEmitter {
  readonly stdout = new EventEmitter();
  readonly stderr = new EventEmitter();
  gone = false;
  readonly pid: number;
  private readonly plan: Plan;
  private readonly mark: Mark;
  constructor(pid: number, plan: Plan, mark: Mark) {
    super();
    this.pid = pid;
    this.plan = plan;
    this.mark = mark;
  }
  start(): void {
    if (this.plan.output !== undefined) setImmediate(() => this.stdout.emit("data", this.plan.output));
    if (this.plan.exitAfterMs !== undefined) setTimeout(() => this.exit(1, null), this.plan.exitAfterMs);
    if (this.plan.spawnError) setImmediate(() => this.failToSpawn());
  }
  kill(signal: NodeJS.Signals): boolean {
    this.mark(`kill ${this.pid} ${signal}`);
    if (this.gone) return false;
    const reap = this.plan.reapMs === undefined ? 5 : this.plan.reapMs;
    if (reap !== null) setTimeout(() => this.exit(null, signal), reap);
    return true;
  }
  private exit(code: number | null, signal: NodeJS.Signals | null): void {
    if (this.gone) return;
    this.gone = true;
    this.mark(`exit ${this.pid}`);
    this.emit("exit", code, signal);
    const late = this.plan.lateOutputMs;
    if (late !== undefined) setTimeout(() => {
      this.mark(`late ${this.pid}`);
      this.stderr.emit("data", `late line from pid ${this.pid}\n`);
    }, late);
  }
  private failToSpawn(): void {
    this.gone = true;
    this.mark(`error ${this.pid}`);
    this.emit("error", Object.assign(new Error("spawn /no/such/browser ENOENT"), { code: "ENOENT" }));
    this.emit("close", -2, null);
  }
}

const FAST: LaunchTuning = { attempts: 3, polls: 8, pollMs: 10, killGraceMs: 1000, retryPauseMs: 0 };

function rig(plans: readonly Plan[]) {
  const events: string[] = [];
  const at = new Map<string, number>();
  const mark: Mark = (event) => {
    events.push(event);
    at.set(event, performance.now());
  };
  const logs: string[] = [];
  const browsers: FakeBrowser[] = [];
  const probes: number[] = [];
  const deps: LaunchDeps<string> = {
    preflight: () => {
      mark("preflight");
      return Promise.resolve();
    },
    spawn: (attempt) => {
      const browser = new FakeBrowser(100 + attempt, plans[attempt - 1] ?? {}, mark);
      mark(`spawn ${browser.pid}`);
      browsers.push(browser);
      probes.push(0);
      browser.start();
      const discard = () => {
        mark(`discard ${browser.pid}`);
        return Promise.resolve();
      };
      return Promise.resolve({ child: browser, discard });
    },
    probe: () => {
      const i = browsers.length - 1;
      const n = (probes[i] ?? 0) + 1;
      probes[i] = n;
      const up = plans[i]?.upAtProbe;
      return up !== undefined && n >= up ? Promise.resolve(`target of ${100 + i + 1}`) : Promise.reject(new Error("connect ECONNREFUSED 127.0.0.1:9"));
    },
    log: (line) => logs.push(line),
  };
  return { deps, events, at, logs, browsers, probes };
}

const settle = <T>(p: Promise<T>): Promise<{ value?: T; error?: Error }> =>
  p.then((value) => ({ value }), (error: unknown) => {
    assert.ok(error instanceof Error, `the launch rejected with ${String(error)}, which is not an Error`);
    return { error };
  });

test("a killed browser's late exit cannot fail the next attempt: the CI shape launches on attempt 2", async () => {
  const r = rig([{ reapMs: 30 }, { upAtProbe: 6 }]);
  const got = await settle(launchWithRetry(r.deps, FAST));
  assert.match(r.logs[0] ?? "", /attempt 1\/3 exposed no devtools target/, "attempt 1 never failed, so the fixture never reached the retry");
  assert.equal(got.error, undefined, `the launch failed although attempt 2's browser was alive and coming up: ${got.error?.message ?? ""}`);
  assert.equal(got.value, "target of 102", "the launch did not come up on attempt 2's browser");
  assert.equal(r.browsers[1]?.gone, false, "attempt 2's own browser exited, so this is not the CI shape");
});

test("the next browser starts only once the killed one is gone, and the port is checked once, before the first", async () => {
  const r = rig([{ reapMs: 15 }, { upAtProbe: 1 }]);
  await launchWithRetry(r.deps, { ...FAST, retryPauseMs: 5 });
  assert.deepEqual(r.events, ["preflight", "spawn 101", "kill 101 SIGKILL", "exit 101", "discard 101", "spawn 102"]);
});

test("each attempt reports only its own browser's output: a line a gone browser writes after its exit is not the next one's", async () => {
  const r = rig([{ exitAfterMs: 5, lateOutputMs: 20 }, {}]);
  const got = await settle(launchWithRetry(r.deps, { ...FAST, attempts: 2 }));
  assert.ok(r.events.indexOf("late 101") > r.events.indexOf("spawn 102"), `the late line did not land during attempt 2 (${r.events.join(", ")}), so the fixture tests nothing`);
  assert.ok(got.error, "the launch was expected to fail on both attempts");
  assert.doesNotMatch(got.error.message, /late line from pid 101/, "attempt 1's browser's late output was reported as attempt 2's");
});

test("the error after the last attempt names every attempt's own reason and output, a failed spawn included", async () => {
  const flood = "y".repeat(3000);
  const r = rig([{ output: `first browser output${flood}` }, { exitAfterMs: 15, output: "second browser crashed" }, { spawnError: true }]);
  const got = await settle(launchWithRetry(r.deps, FAST));
  const message = got.error?.message ?? "";
  assert.match(
    message,
    /attempt 1\/3[^\n]*no page target in 80ms \(last: connect ECONNREFUSED[\s\S]*first browser output[\s\S]*attempt 2\/3[^\n]*exited code=1[\s\S]*second browser crashed[\s\S]*attempt 3\/3[^\n]*failed to start: spawn \/no\/such\/browser ENOENT[\s\S]*\(none captured\)$/,
  );
  assert.equal(r.probes[0], FAST.polls, "attempt 1 did not run its whole wait before giving up");
  assert.ok(!message.includes(flood), "an attempt's whole output was pasted into the error, uncapped");
});

test("a browser that exits on its own fails its attempt at once, and the next starts without waiting out the kill cap", async () => {
  const r = rig([{ exitAfterMs: 5 }, { upAtProbe: 1 }]);
  const tuning = { ...FAST, polls: 50, killGraceMs: 2000 };
  const t0 = performance.now();
  const got = await settle(launchWithRetry(r.deps, tuning));
  const ms = performance.now() - t0;
  assert.equal(got.error, undefined, got.error?.message);
  assert.ok((r.probes[0] ?? 0) <= 2, `attempt 1 probed ${r.probes[0]} times after its browser had exited`);
  assert.ok(ms < tuning.killGraceMs / 2, `the launch took ${ms}ms, the kill cap's worth, waiting on an exit it had already seen`);
});

test("a killed browser that is never gone stops the launch rather than start another on the port it may hold", async () => {
  const r = rig([{ exitAfterMs: 5, output: "first browser output" }, { reapMs: null, output: "second browser hung" }, { upAtProbe: 1 }]);
  const got = await settle(launchWithRetry(r.deps, { ...FAST, killGraceMs: 100 }));
  assert.match(
    got.error?.message ?? "",
    /pid 102, was not gone 100ms after SIGKILL[\s\S]*attempt 1\/3[^\n]*exited code=1[\s\S]*first browser output[\s\S]*attempt 2\/3[^\n]*no page target[\s\S]*second browser hung/,
  );
  assert.deepEqual(r.events.filter((e) => e.startsWith("spawn")), ["spawn 101", "spawn 102"]);
});

test("no launch line and no line of the launch error reads as a check tally, which a lane that dies at launch would report as its score", async () => {
  const ok = rig([{}, { upAtProbe: 1 }]);
  await launchWithRetry(ok.deps, FAST);
  assert.equal(ok.logs.length, 2, `expected the retry line and the success line, got ${JSON.stringify(ok.logs)}`);
  assert.deepEqual(ok.logs.map((l) => l.includes("launch attempt")), [true, false], `a search for "launch attempt" must find the retry and not the success line: ${JSON.stringify(ok.logs)}`);
  const failed = await settle(launchWithRetry(rig([{ output: "x" }, { exitAfterMs: 5 }, { spawnError: true }]).deps, FAST));
  const stuck = await settle(launchWithRetry(rig([{ exitAfterMs: 5 }, { reapMs: null }]).deps, { ...FAST, killGraceMs: 50 }));
  const unspawnable = rig([{}]);
  const cannot = await settle(launchWithRetry({ ...unspawnable.deps, spawn: (a) => (a === 2 ? Promise.reject(new Error("EMFILE")) : unspawnable.deps.spawn(a)) }, FAST));
  const errors = [failed, stuck, cannot].map((got) => got.error?.message ?? "");
  assert.deepEqual(errors.map((m) => /^(no devtools page target after|browser launch attempt 2\/3, pid 102, was not gone|browser launch attempt 2\/3 could not start)/.test(m)), [true, true, true], `the three ways a launch fails did not all throw: ${JSON.stringify(errors.map((m) => m.split("\n")[0]))}`);
  const lines = [...ok.logs, ...errors.flatMap((m) => m.split("\n"))];
  for (const line of lines) assert.equal(laneCheckTally(line), null, `${JSON.stringify(line)} reads as a check tally`);
});

test("a browser that cannot even be started keeps every earlier attempt in the error", async () => {
  const r = rig([{ output: "first browser output" }]);
  const deps: LaunchDeps<string> = { ...r.deps, spawn: (attempt) => (attempt === 2 ? Promise.reject(new Error("ENOSPC: no space left on device, mkdtemp")) : r.deps.spawn(attempt)) };
  const got = await settle(launchWithRetry(deps, FAST));
  assert.match(got.error?.message ?? "", /attempt 2\/3 could not start a browser: ENOSPC[\s\S]*attempt 1\/3[^\n]*no page target[\s\S]*first browser output/);
});

test("a busy debug port stops the launch before any browser starts", async () => {
  const r = rig([{ upAtProbe: 1 }]);
  const got = await settle(launchWithRetry({ ...r.deps, preflight: () => Promise.reject(new Error("port busy")) }, FAST));
  assert.match(got.error?.message ?? "", /port busy/);
  assert.deepEqual(r.events, []);
});

test("the retry pauses after the killed browser is gone, and never after the last attempt", async () => {
  const r = rig([{ reapMs: 30 }, { upAtProbe: 1 }]);
  await launchWithRetry(r.deps, { ...FAST, retryPauseMs: 60 });
  const discardLag = (r.at.get("discard 101") ?? Infinity) - (r.at.get("exit 101") ?? 0);
  assert.ok(discardLag < 30, `the failed attempt's profile was discarded ${discardLag.toFixed(1)}ms after its browser was gone, inside the 60ms pause`);
  const gap = (r.at.get("spawn 102") ?? 0) - (r.at.get("exit 101") ?? Infinity);
  assert.ok(gap >= 58, `attempt 2 started ${gap.toFixed(1)}ms after attempt 1's browser was gone, inside the 60ms pause`);
  const all = rig([{ exitAfterMs: 1 }, { exitAfterMs: 1 }, { exitAfterMs: 1 }]);
  const pause = 500;
  await settle(launchWithRetry(all.deps, { ...FAST, retryPauseMs: pause }));
  const tail = performance.now() - (all.at.get("exit 103") ?? 0);
  assert.ok(tail < pause / 2, `the launch waited ${tail.toFixed(1)}ms after its last browser was gone, a pause's worth`);
  assert.equal(all.logs.filter((l) => /retrying/.test(l)).length, 2, `a retry was announced after the last attempt: ${JSON.stringify(all.logs)}`);
});

test("the ruled tuning is pinned: three attempts of a 60s wait (480 polls at 125ms), a 5s kill cap, a 2s pause (Issue #621 rulings)", () => {
  assert.deepEqual(LAUNCH_TUNING, { attempts: 3, polls: 480, pollMs: 125, killGraceMs: 5000, retryPauseMs: 2000 });
});

test("with no tuning passed, an attempt that never answers is killed after the ruled 60s: 480 probes, 60000ms of waiting", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const r = rig([{}, { upAtProbe: 1 }]);
    const launch = { done: false };
    void launchWithRetry(r.deps).finally(() => {
      launch.done = true;
    });
    const flush = () => new Promise((res) => setImmediate(res));
    let waited = 0;
    for (; waited <= 90_000; waited += 25) {
      await flush();
      if (r.events.includes("kill 101 SIGKILL")) break;
      mock.timers.tick(25);
    }
    assert.equal(r.probes[0], 480, "attempt 1 did not probe 480 times before its kill");
    assert.equal(waited, 60_000, "attempt 1 was not killed after exactly 60s of waiting");
    for (let n = 0; !launch.done && n < 1000; n++) {
      mock.timers.tick(25);
      await flush();
    }
    assert.ok(launch.done, "the launch never finished once attempt 2's browser answered");
  } finally {
    mock.timers.reset();
  }
});

test("with no tuning passed, a killed browser that is never gone stops the launch after the ruled 5s cap", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const r = rig([{ reapMs: null }]);
    const launch: { error?: unknown } = {};
    void launchWithRetry(r.deps).catch((e: unknown) => {
      launch.error = e;
    });
    const flush = () => new Promise((res) => setImmediate(res));
    let waited = 0;
    for (; waited <= 90_000; waited += 25) {
      await flush();
      if (launch.error) break;
      mock.timers.tick(25);
    }
    assert.ok(launch.error instanceof Error, `the launch did not reject with an Error: it holds ${String(launch.error)}`);
    assert.match(launch.error.message, /pid 101, was not gone 5000ms after SIGKILL/);
    assert.equal(waited, 65_000, "the launch did not give up exactly 5s after its 60s wait ended in a kill");
  } finally {
    mock.timers.reset();
  }
});

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
  return { dir, browser, port: await freePort(), restore, lines, profiles: () => readdirSync(dir).filter((n) => n.startsWith("vellum-e2e-")) };
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

test("the harness's own launch, with a stand-in browser silent on its first start, comes up on attempt 2 and cleanup removes the rest", { timeout: 60_000 }, async () => {
  const s = await standIn(1);
  try {
    const target = await launchBrowser(s.browser, s.port, REAL);
    assert.equal(target.webSocketDebuggerUrl, standInTarget(s.port, 2));
    const retry = s.lines().join("\n").match(/attempt 1\/3 exposed no devtools target: no page target in 3000ms \(last: connect ECONNREFUSED[^)]*\); pid (\d+), gone \d+ms after SIGKILL/);
    assert.ok(retry, `no retry line naming attempt 1's own reason: ${JSON.stringify(s.lines())}`);
    assert.equal(isAlive(Number(retry[1])), false, "attempt 1's stand-in is still running");
    assert.equal(s.profiles().length, 1, `expected only the live attempt's profile, found ${s.profiles().join(", ")}`);
    const up = s.lines().join("\n").match(/browser up on attempt 2\/3, pid (\d+), devtools target in \d+ms$/m);
    assert.ok(up, `no success line: ${JSON.stringify(s.lines())}`);
    cleanup();
    assert.ok(await goneWithin(Number(up[1]), 5000), "cleanup() left attempt 2's stand-in running");
    assert.deepEqual(s.profiles(), [], "cleanup() left attempt 2's profile behind");
  } finally {
    cleanup();
    s.restore();
  }
});

test("the harness's own launch, every stand-in silent, fails with each attempt's own captured output", { timeout: 60_000 }, async () => {
  const s = await standIn(2);
  try {
    const got = await settle(launchBrowser(s.browser, s.port, { ...REAL, attempts: 2, polls: 100 }));
    assert.match(got.error?.message ?? "", new RegExp(`attempt 1/2[\\s\\S]*stand-in launch 1 on port ${s.port}[\\s\\S]*attempt 2/2[\\s\\S]*stand-in launch 2 on port ${s.port}`));
    assert.deepEqual(s.profiles(), [], "a failed attempt's profile was left behind");
  } finally {
    cleanup();
    s.restore();
  }
});

test("the harness's own launch checks the debug port first: a port already held starts no browser", { timeout: 60_000 }, async () => {
  const s = await standIn(0);
  const holder: HttpServer = await new Promise((resolve) => {
    const h = createHttpServer((_req, res) => res.end("{}")).listen(s.port, "127.0.0.1", () => resolve(h));
  });
  try {
    const got = await settle(launchBrowser(s.browser, s.port, REAL));
    assert.match(got.error?.message ?? "", new RegExp(`something is already listening on e2e debug port ${s.port}`));
    assert.equal(existsSync(join(s.dir, STAND_IN_COUNTER)), false, "a stand-in browser was started against a held port");
  } finally {
    holder.close();
    cleanup();
    s.restore();
  }
});

test("the harness's own launch with no tuning passed takes the ruled default: three attempts, a 2s pause before each retry", { timeout: 60_000 }, async () => {
  const s = await standIn(0, "exit 1");
  try {
    const got = await settle(launchBrowser(s.browser, s.port));
    assert.match(got.error?.message ?? "", /no devtools page target after 3 launch attempts[\s\S]*browser exited code=1/);
    const retries = s.lines().filter((l) => /exposed no devtools target/.test(l));
    assert.deepEqual(retries.map((l) => /retrying with a fresh profile in (\d+)ms/.exec(l)?.[1]), ["2000", "2000"]);
  } finally {
    cleanup();
    s.restore();
  }
});
