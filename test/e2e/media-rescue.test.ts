import { test } from "node:test";
import assert from "node:assert/strict";
import { runnerHooks } from "../../e2e/support/runner.ts";
import type { Accumulators, RunnerContext } from "../../e2e/support/runner.ts";
import { makeStep } from "../../e2e/support/step.ts";
import { runSelected } from "../../e2e/support/suites.ts";
import type { SuiteTagged } from "../../e2e/support/suites.ts";

const MEDIA = "Emulation.setEmulatedMedia";
const REDUCE = { features: [{ name: "prefers-reduced-motion", value: "reduce" }] };
const CLEARED = { media: "", features: [] };
type Logged = [string, Record<string, unknown> | undefined];

const NEXT: Logged = ["the next suite starts", undefined];
const fresh = (): Accumulators => ({
  results: [],
  consoleErrors: [],
  http4xx: [],
  skippedGroups: [],
  skippedChecks: [],
});

function lane(first: (c: SuiteTagged<RunnerContext>, acc: Accumulators) => Promise<void>, refuse = false) {
  const acc = fresh();
  const log: Logged[] = [];
  const ctx: RunnerContext = {
    send: <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
      log.push([method, params]);
      return refuse ? Promise.reject(new Error("staged: the browser refused")) : Promise.resolve({} as T);
    },
    check: (name, ok) => {
      acc.results.push({ name, ok: Boolean(ok) });
    },
    alive: () => Promise.resolve(true),
    clearMobile: () => (refuse ? Promise.reject(new Error("staged: the browser refused")) : Promise.resolve()),
  };
  const suites = {
    render: (c: SuiteTagged<RunnerContext>) => first(c, acc),
    motion: () => {
      log.push(NEXT);
      return Promise.resolve();
    },
  };
  return {
    acc,
    log,
    run: () =>
      runSelected(
        ["render", "motion"],
        suites,
        ctx,
        runnerHooks(ctx, acc, () => {}, 20),
      ),
  };
}

test("a suite whose step never reached its assertion has every emulated media condition cleared before the next suite starts", async (t) => {
  t.mock.method(console, "error", () => {});
  const { acc, log, run } = lane(async (c, a) => {
    await makeStep({ check: c.check, suite: c.suite, skippedGroups: a.skippedGroups })("P1", async () => {
      await c.send(MEDIA, REDUCE);
      throw new Error("staged: a throw between the set and its trailing reset");
    });
  });
  await run();
  assert.deepEqual(acc.skippedGroups, ["P1"], "the fixture never reached the step's catch");
  assert.deepEqual(log, [[MEDIA, REDUCE], [MEDIA, CLEARED], NEXT]);
});

test("a suite that stopped early has every emulated media condition cleared before the next suite starts", async () => {
  const { log, run } = lane(async (c) => {
    await c.send(MEDIA, REDUCE);
    throw new Error("staged: a throw outside every step");
  });
  const timings = await run();
  assert.equal(timings[0]?.aborted, true, "the fixture did not stop the suite");
  assert.deepEqual(log, [[MEDIA, REDUCE], [MEDIA, CLEARED], NEXT]);
});

test("a suite that ran whole has nothing cleared after it, so a passing run sends the browser nothing new", async () => {
  const { log, run } = lane(async (c) => {
    await c.send(MEDIA, REDUCE);
    await c.send(MEDIA, { features: [] });
  });
  const timings = await run();
  assert.equal(timings[0]?.aborted, undefined, "the fixture stopped the suite");
  assert.deepEqual(log, [[MEDIA, REDUCE], [MEDIA, { features: [] }], NEXT]);
});

test("the media clear after a suite that did not run whole is bounded, so a clear that never settles cannot stall the lane", async () => {
  const ctx: RunnerContext = {
    send: <T>(): Promise<T> => new Promise<T>(() => {}),
    check: () => {},
    alive: () => Promise.resolve(true),
    clearMobile: () => Promise.resolve(),
  };
  const acc = fresh();
  const handler = runnerHooks(ctx, acc, () => {}, 20).onSuiteNotWhole;
  assert.ok(handler, "the runner hands runSelected no handler for a suite that did not run whole");
  let guard: NodeJS.Timeout | undefined;
  const stalled = new Promise<"stalled">((settle) => (guard = setTimeout(() => settle("stalled"), 2000)));
  const outcome = await Promise.race([Promise.resolve(handler()).then(() => "done"), stalled]);
  clearTimeout(guard);
  assert.equal(outcome, "done");
});

test("a browser that refuses the viewport reset or the media clear after a suite stops does not end the lane: the next suite still starts", async () => {
  const { log, run } = lane(async (c) => {
    await c.send(MEDIA, REDUCE).catch(() => {});
    throw new Error("staged: a throw outside every step");
  }, true);
  const timings = await run();
  assert.equal(timings[0]?.aborted, true, "the fixture did not stop the suite");
  assert.deepEqual(log, [[MEDIA, REDUCE], [MEDIA, CLEARED], NEXT]);
});
