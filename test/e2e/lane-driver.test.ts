import { test } from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { join, resolve } from "node:path";
import { PassThrough } from "node:stream";
import { LANES_SKIP_LINE, RUNNER, runLanes, runLanesFromProcess } from "../../e2e/support/lane-driver.ts";
import type { LaneChild, LaneDriverIo } from "../../e2e/support/lane-driver.ts";
import { E2E_LANES, laneLineIsSkip } from "../../e2e/support/lanes.ts";
import type { EnvLike } from "../../e2e/support/runner.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const BROWSERLESS = ["CI", "VELLUM_REQUIRE_BROWSER", "VELLUM_ALLOW_NO_BROWSER", "VELLUM_E2E_SUITES"] as const;

type Spawned = { command: string; args: readonly string[]; env: Record<string, string>; stdio: readonly string[] };

async function withTTY<T>(value: boolean, body: () => Promise<T>): Promise<T> {
  const own = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  Object.defineProperty(process.stdout, "isTTY", { value, configurable: true });
  try {
    return await body();
  } finally {
    if (own) Object.defineProperty(process.stdout, "isTTY", own);
    else Reflect.deleteProperty(process.stdout, "isTTY");
  }
}

const noExit = (t: TestContext): void => {
  t.mock.method(process, "exit", () => {
    throw new Error("process.exit was reached inside a unit test, which would erase this file's tally");
  });
};

function child(lines: readonly string[], code: number | null): LaneChild {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const emitter = new EventEmitter();
  let open = 2;
  const ended = () => {
    if (--open === 0) emitter.emit("close", code);
  };
  stdout.on("end", ended);
  stderr.on("end", ended);
  setImmediate(() => {
    for (const line of lines) stdout.write(`${line}\n`);
    stdout.end();
    stderr.end();
  });
  return Object.assign(emitter, { stdout, stderr });
}

function rig(
  argv: readonly string[],
  env: EnvLike = {},
  outcome: (lane: string) => [string[], number] = () => [["ALL PASS  (1/1)"], 0],
) {
  const out: string[] = [];
  const err: string[] = [];
  const spawned: Spawned[] = [];
  const probes = { browser: 0 };
  const io: LaneDriverIo = {
    argv,
    env,
    isTTY: false,
    findBrowser: () => {
      probes.browser++;
      return "/fake/browser";
    },
    spawn: (command, args, options) => {
      spawned.push({ command, args, env: options.env, stdio: options.stdio });
      const lane = E2E_LANES.find((l) => String(l.port) === options.env["VELLUM_E2E_PORT"])?.name ?? "?";
      const [lines, code] = outcome(lane);
      return child(lines, code);
    },
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { io, out, err, spawned, probes };
}

test("a misspelled lane is refused with exit 1 before the driver looks for a browser", async (t) => {
  noExit(t);
  const { io, err, probes, spawned } = rig(["--lane", "Q"]);
  assert.equal(await runLanes(io), 1);
  assert.match(err.join("\n"), /^FAIL: --lane "Q" names a lane that does not exist/);
  assert.equal(probes.browser, 0, "the driver probed for a browser before refusing the lane");
  assert.equal(spawned.length, 0);
});

test("a suite selection in the environment is refused with exit 1, since the lanes are themselves the selection", async (t) => {
  noExit(t);
  const { io, err, probes, spawned } = rig([], { VELLUM_E2E_SUITES: "render" });
  assert.equal(await runLanes(io), 1);
  assert.match(err.join("\n"), /^FAIL: /);
  assert.equal(probes.browser + spawned.length, 0);
});

test("with no browser the driver's own terminal decides: an interactive run skips on the driver's skip line, any other fails", async (t) => {
  noExit(t);
  const quiet = rig([]);
  assert.equal(await runLanes({ ...quiet.io, findBrowser: () => null, isTTY: true }), 0);
  assert.deepEqual(quiet.out, [LANES_SKIP_LINE]);
  assert.ok(laneLineIsSkip(LANES_SKIP_LINE));
  const unattended = rig([]);
  assert.equal(await runLanes({ ...unattended.io, findBrowser: () => null }), 1);
  assert.match(unattended.err.join("\n"), /^FAIL: no Chromium-family browser was found/);
  assert.equal(quiet.spawned.length + unattended.spawned.length, 0);
});

test("each selected lane spawns this Node on the runner's own file, with that lane's suites and ports", async (t) => {
  noExit(t);
  const { io, spawned } = rig(["--lane", "C"]);
  assert.equal(await runLanes(io), 0);
  const lane = E2E_LANES.find((l) => l.name === "C")!;
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0]!.command, process.execPath);
  assert.deepEqual(spawned[0]!.args, [join(ROOT, "e2e", "run.ts")]);
  assert.equal(RUNNER, join(ROOT, "e2e", "run.ts"));
  assert.deepEqual(spawned[0]!.stdio, ["ignore", "pipe", "pipe"]);
  assert.equal(spawned[0]!.env["VELLUM_E2E_SUITES"], lane.suites.join(","));
  assert.equal(spawned[0]!.env["VELLUM_E2E_DPORT"], String(lane.dport));
});

test("no lane argument runs every lane, and a lane argument runs that lane alone", async (t) => {
  noExit(t);
  const all = rig([]);
  assert.equal(await runLanes(all.io), 0);
  assert.deepEqual(
    all.spawned.map((s) => s.env["VELLUM_E2E_PORT"]),
    E2E_LANES.map((l) => String(l.port)),
  );
  const one = rig(["--lane", "B"]);
  await runLanes(one.io);
  assert.deepEqual(
    one.spawned.map((s) => s.env["VELLUM_E2E_PORT"]),
    [String(E2E_LANES.find((l) => l.name === "B")!.port)],
  );
});

test("the exit code is the lanes' outcome: a red lane fails the run, and a lane that only skipped never reads as a pass", async (t) => {
  noExit(t);
  const green = rig(["--lane", "A"]);
  assert.equal(await runLanes(green.io), 0);
  assert.ok(green.out.includes("[A] ALL PASS  (1/1)"), JSON.stringify(green.out));
  const red = rig(["--lane", "A"], {}, () => [["SOME FAILED  (1/2)"], 1]);
  assert.equal(await runLanes(red.io), 1);
  const skipped = rig(["--lane", "A"], {}, () => [["SKIP: no browser"], 0]);
  assert.equal(await runLanes(skipped.io), 1);
  const killed = rig(["--lane", "A"], {}, () => [[], null]);
  assert.equal(await runLanes(killed.io), 1);
});

test("the process binding reads the real argv, environment and terminal", async (t) => {
  noExit(t);
  const saved = Object.fromEntries(BROWSERLESS.map((k) => [k, process.env[k]]));
  const errors: string[] = [];
  t.mock.method(console, "error", (...parts: unknown[]) => {
    errors.push(parts.map(String).join(" "));
  });
  t.mock.method(console, "log", () => {});
  const deps = { findBrowser: () => null, spawn: rig([]).io.spawn };
  const argv = t.mock.property(process, "argv", [process.execPath, "e2e/lanes.ts", "--lane", "Q"]);
  try {
    for (const k of BROWSERLESS) delete process.env[k];
    assert.equal(await runLanesFromProcess(deps), 1);
    assert.match(errors.join("\n"), /--lane "Q" names a lane that does not exist/);
    argv.mockImplementation([process.execPath, "e2e/lanes.ts"]);
    process.env["VELLUM_E2E_SUITES"] = "render";
    assert.equal(await runLanesFromProcess(deps), 1);
    assert.match(errors.join("\n"), /VELLUM_E2E_SUITES/);
    delete process.env["VELLUM_E2E_SUITES"];
    assert.equal(
      await withTTY(true, () => runLanesFromProcess(deps)),
      0,
      "an interactive run with no browser did not skip",
    );
    assert.equal(
      await withTTY(false, () => runLanesFromProcess(deps)),
      1,
      "a run with no terminal and no browser did not fail",
    );
  } finally {
    for (const k of BROWSERLESS)
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
  }
});
