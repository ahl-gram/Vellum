import { test } from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SUITES } from "../../e2e/support/suite-map.ts";
import {
  RUNNER_SKIP_LINE,
  harnessErrorLines,
  reportLines,
  runE2e,
  runE2eFromProcess,
  runnerHooks,
} from "../../e2e/support/runner.ts";
import type { Accumulators, EnvLike, RunnerIo } from "../../e2e/support/runner.ts";
import { E2E_SUITE_ORDER, resolveSuiteSelection } from "../../e2e/support/suites.ts";
import type { E2eSuiteName } from "../../e2e/support/suites.ts";
import { laneLineIsSkip } from "../../e2e/support/lanes.ts";
import type { StartOptions } from "../../e2e/types.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const BROWSERLESS = ["CI", "VELLUM_REQUIRE_BROWSER", "VELLUM_ALLOW_NO_BROWSER", "VELLUM_E2E_SUITES"] as const;

type Ctx = {
  check: (name: string, ok: unknown, detail?: string) => void;
  alive: () => Promise<boolean>;
  clearMobile: () => Promise<void>;
};

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

function rig(env: EnvLike, run: (name: E2eSuiteName, acc: Accumulators) => void = () => {}) {
  const accumulators: Accumulators = { results: [], consoleErrors: [], http4xx: [], skippedGroups: [] };
  const out: string[] = [];
  const err: string[] = [];
  const ran: E2eSuiteName[] = [];
  const started: StartOptions[] = [];
  const probes = { browser: 0, resets: 0, cleanups: 0, alive: true };
  const ctx: Ctx = {
    check: (name, ok) => accumulators.results.push({ name, ok: Boolean(ok) }),
    alive: () => Promise.resolve(probes.alive),
    clearMobile: () => {
      probes.resets++;
      return Promise.resolve();
    },
  };
  const suites = Object.fromEntries(
    E2E_SUITE_ORDER.map((name) => [
      name,
      () => {
        ran.push(name);
        run(name, accumulators);
        ctx.check(`${name} passed`, true);
        return Promise.resolve();
      },
    ]),
  );
  const io: RunnerIo<Ctx> = {
    env,
    isTTY: false,
    findBrowser: () => {
      probes.browser++;
      return "/fake/browser";
    },
    start: (options) => {
      started.push(options);
      return Promise.resolve(ctx);
    },
    cleanup: () => {
      probes.cleanups++;
    },
    suites,
    accumulators,
    out: (line) => out.push(line),
    err: (...parts) => err.push(parts.map(String).join(" ")),
  };
  return { io, out, err, ran, started, probes, accumulators };
}

test("each suite in the runner's map is the run its own file exports, so no name is wired to a sibling's suite", async () => {
  for (const name of E2E_SUITE_ORDER) {
    const own = (await import(pathToFileURL(join(ROOT, "e2e", "suites", `${name}.ts`)).href)) as { run: unknown };
    assert.equal(SUITES[name], own.run, `the runner's ${name} entry is not e2e/suites/${name}.ts's run`);
  }
});

test("the runner refuses a bad port or a misspelled suite with exit 1, before it ever looks for a browser", async (t) => {
  noExit(t);
  for (const env of [{ VELLUM_E2E_SUITES: "no-such-suite" }, { VELLUM_E2E_PORT: "not-a-port" }]) {
    const { io, err, probes, started } = rig(env);
    assert.equal(await runE2e(io), 1, JSON.stringify(env));
    assert.match(err.join("\n"), /^FAIL: /, `${JSON.stringify(env)} printed no FAIL line`);
    assert.equal(probes.browser, 0, `${JSON.stringify(env)} probed for a browser before refusing`);
    assert.equal(started.length, 0);
  }
});

test("the runner runs exactly the suites the environment selects, and no others", async (t) => {
  noExit(t);
  const env = { VELLUM_E2E_SUITES: "health,prospect" };
  const wanted = resolveSuiteSelection(env).names;
  assert.ok(wanted.length > 0 && wanted.length < E2E_SUITE_ORDER.length, "the fixture selects the full order or none");
  const { io, ran } = rig(env);
  assert.equal(await runE2e(io), 0);
  assert.deepEqual(ran, wanted);
});

test("the runner serves the repo's own dist/ and writes under its out/ by port, unless the environment names them", async (t) => {
  noExit(t);
  const plain = rig({ VELLUM_E2E_SUITES: "health" });
  await runE2e(plain.io);
  const [first] = plain.started;
  assert.ok(first, "the harness was never started");
  assert.equal(first.SITE, join(ROOT, "dist"));
  assert.equal(first.OUT, join(ROOT, "out", "e2e"));
  assert.deepEqual([first.PORT, first.DPORT, first.PAGE], [8765, 9222, "http://127.0.0.1:8765/explorer/"]);
  assert.equal(first.results, plain.accumulators.results, "the harness was handed a copy, not the runner's own tally");
  const moved = rig({ VELLUM_E2E_SUITES: "health", VELLUM_E2E_PORT: "8801", VELLUM_SITE_DIR: "/tmp/site-x" });
  await runE2e(moved.io);
  assert.equal(moved.started[0]?.SITE, "/tmp/site-x");
  assert.equal(moved.started[0].OUT, join(ROOT, "out", "e2e-8801"));
});

test("a suite that throws reds its own check, has its viewport reset, and the lane goes on to the next suite", async (t) => {
  noExit(t);
  const env = { VELLUM_E2E_SUITES: "health,prospect" };
  const [first, second] = resolveSuiteSelection(env).names;
  const { io, ran, probes, accumulators } = rig(env, (name) => {
    if (name === first) throw new Error("boom");
  });
  assert.equal(await runE2e(io), 1);
  assert.deepEqual(ran, [first, second]);
  assert.equal(probes.resets, 1);
  const red = accumulators.results.find((r) => !r.ok);
  assert.match(red?.name ?? "", new RegExp(`^${first} stopped early`));
});

test("the viewport reset after a suite stops is bounded, so a reset that never settles cannot stall the lane", async () => {
  const ctx: Ctx = { check: () => {}, alive: () => Promise.resolve(true), clearMobile: () => new Promise(() => {}) };
  const acc: Accumulators = { results: [], consoleErrors: [], http4xx: [], skippedGroups: [] };
  const handler = runnerHooks(ctx, acc, () => {}, 20).onSuiteError;
  assert.ok(handler, "the runner hands runSelected no per-suite handler");
  let guard: NodeJS.Timeout | undefined;
  const stalled = new Promise<"stalled">((settle) => (guard = setTimeout(() => settle("stalled"), 2000)));
  const outcome = await Promise.race([Promise.resolve(handler("render", new Error("x"))).then(() => "done"), stalled]);
  clearTimeout(guard);
  assert.equal(outcome, "done");
});

test("a browser that died with its suite ends the run as a harness error, exit 2, with the tally of what did run", async (t) => {
  noExit(t);
  const env = { VELLUM_E2E_SUITES: "health,prospect" };
  const [first] = resolveSuiteSelection(env).names;
  const { io, out, err, probes } = rig(env, (name, acc) => {
    acc.results.push({ name: "an earlier check", ok: true });
    if (name === first) {
      probes.alive = false;
      throw new Error("the browser went away");
    }
  });
  assert.equal(await runE2e(io), 2);
  assert.match(err.join("\n"), /^HARNESS ERROR:/m);
  assert.ok(out.includes("\nALL PASS  (1/1)"), `the checks that ran got no tally: ${JSON.stringify(out)}`);
});

test("the harness-error tally is printed when any check ran and not when none did", () => {
  assert.deepEqual(harnessErrorLines([]), []);
  assert.deepEqual(harnessErrorLines([{ ok: true }, { ok: false }]), ["\nSOME FAILED  (1/2)"]);
});

test("a group a suite skipped reaches the report, and the health checkpoint does not certify that suite", async (t) => {
  noExit(t);
  const env = { VELLUM_E2E_SUITES: "render,health" };
  const { io, out } = rig(env, (name, acc) => {
    if (name === "render") acc.skippedGroups.push("R9");
  });
  await runE2e(io);
  assert.ok(
    out.includes(
      "\n1 suite skipped a check group: render (R9). Each ran to its end, so the checks after the skip are real, but it exercised fewer interactions than a whole run.",
    ),
    JSON.stringify(out),
  );
  assert.ok(
    out.includes("  N1/N2 ran, but no suite before them ran to its end, so they certify no suite."),
    JSON.stringify(out),
  );
});

test("the report names the timings, a suite that stopped early and the tier, and certifies what ran whole before health", () => {
  const lines = reportLines(
    [
      { name: "render", ms: 1200 },
      { name: "motion", ms: 100, aborted: true },
      { name: "health", ms: 300 },
    ],
    ["render", "motion", "health"],
    "custom",
  );
  assert.equal(lines[0], "");
  assert.equal(lines[1], "per-suite wall clock (3 suites, 1.6s total):");
  assert.ok(
    lines.includes(
      "\n1 suite stopped early: motion. The checks after the failure in each never ran, so this run proves less than a whole one.",
    ),
    JSON.stringify(lines),
  );
  assert.ok(
    lines.includes(`\ntier: custom (3/${E2E_SUITE_ORDER.length} suites): render, motion, health`),
    JSON.stringify(lines),
  );
  assert.equal(lines.at(-1), "  N1/N2 certified the console/network state of: render");
  assert.ok(
    !reportLines([{ name: "render", ms: 1 }], ["render"], "full").some((l) => l.startsWith("\ntier:")),
    "a full run names a tier",
  );
});

test("the outcome is the last line, and the code is 0 only when every check passed", async (t) => {
  noExit(t);
  const clean = rig({ VELLUM_E2E_SUITES: "health" });
  assert.equal(await runE2e(clean.io), 0);
  assert.equal(clean.out.at(-1), "\nALL PASS  (1/1)");
  assert.equal(clean.probes.cleanups, 1);
  const failing = rig({ VELLUM_E2E_SUITES: "health" }, (_name, acc) => {
    acc.results.push({ name: "a red", ok: false });
  });
  assert.equal(await runE2e(failing.io), 1);
  assert.equal(failing.out.at(-1), "\nSOME FAILED  (1/2)");
});

test("with no browser a run that is not interactive fails, and one allowed to skip prints the line the lane driver reads as a skip", async (t) => {
  noExit(t);
  const failing = rig({});
  const lost = { ...failing.io, findBrowser: () => null };
  assert.equal(await runE2e(lost), 1);
  assert.match(failing.err.join("\n"), /^FAIL: no Chromium-family browser was found and this run is not interactive/);
  const skipping = rig({ VELLUM_ALLOW_NO_BROWSER: "1" });
  assert.equal(await runE2e({ ...skipping.io, findBrowser: () => null }), 0);
  assert.deepEqual(skipping.out, [RUNNER_SKIP_LINE]);
  assert.ok(laneLineIsSkip(RUNNER_SKIP_LINE), "the lane driver does not read the runner's own skip line as a skip");
  assert.equal(failing.started.length + skipping.started.length, 0, "a browserless run started the harness");
});

test("the process binding reads the real environment and the real terminal", async (t) => {
  noExit(t);
  const saved = Object.fromEntries(BROWSERLESS.map((k) => [k, process.env[k]]));
  const errors: string[] = [];
  t.mock.method(console, "error", (...parts: unknown[]) => {
    errors.push(parts.map(String).join(" "));
  });
  t.mock.method(console, "log", () => {});
  const acc: Accumulators = { results: [], consoleErrors: [], http4xx: [], skippedGroups: [] };
  const { io } = rig({});
  const deps = { ...io, findBrowser: () => null };
  try {
    for (const k of BROWSERLESS) delete process.env[k];
    process.env["VELLUM_E2E_SUITES"] = "no-such-suite";
    assert.equal(await runE2eFromProcess(acc, deps), 1);
    assert.match(errors.join("\n"), /VELLUM_E2E_SUITES names a suite that does not exist/);
    delete process.env["VELLUM_E2E_SUITES"];
    assert.equal(
      await withTTY(true, () => runE2eFromProcess(acc, deps)),
      0,
      "an interactive run with no browser did not skip",
    );
    assert.equal(
      await withTTY(false, () => runE2eFromProcess(acc, deps)),
      1,
      "a run with no terminal and no browser did not fail",
    );
  } finally {
    for (const k of BROWSERLESS)
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
  }
});
