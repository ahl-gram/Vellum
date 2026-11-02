import { test } from "node:test";
import assert from "node:assert/strict";
import { withScriptsOff } from "../../e2e/support/scripts-off.ts";
import { withBlockedUrls, withThrottle } from "../../e2e/support/network-state.ts";
import { cd50ScriptsOffHome } from "../../e2e/suites/chart-drawer/portfolio.ts";
import type { TableKit } from "../../e2e/suites/chart-drawer/kit.ts";
import { deskKit, dnContinue, dnRefused } from "../../e2e/suites/cluster/desk-notice.ts";
import type { DeskKit } from "../../e2e/suites/cluster/desk-notice.ts";
import { h13DeadBundle, h13ePrmNoFlash } from "../../e2e/suites/home/doors.ts";
import { withStyledBoot } from "../../e2e/suites/stage/styled-boot.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const SCRIPTS = "Emulation.setScriptExecutionDisabled";
type Sent = { method: string; params?: Record<string, unknown> };

function recorder(fail: (sent: Sent) => boolean = () => false) {
  const sent: Sent[] = [];
  const send = <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
    const message = params === undefined ? { method } : { method, params };
    sent.push(message);
    if (fail(message)) return Promise.reject(new Error(`${method} refused`));
    const reply = method === "Page.addScriptToEvaluateOnNewDocument" ? { identifier: `script-${sent.length}` } : {};
    return Promise.resolve(reply as T);
  };
  return { sent, send };
}

const scriptsSwitches = (sent: readonly Sent[]) =>
  sent.filter((s) => s.method === SCRIPTS).map((s) => s.params?.["value"]);

const BLOCK = "Network.setBlockedURLs";
const THROTTLE = "Network.emulateNetworkConditions";
const UNBLOCKED = { urls: [] };
const UNTHROTTLED = { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 };
const SLOW = { offline: false, latency: 200, downloadThroughput: 120000, uploadThroughput: 120000 };
const paramsOf = (sent: readonly Sent[], method: string) =>
  sent.filter((s) => s.method === method).map((s) => s.params);
const refusingSecond = (method: string) => {
  let seen = 0;
  return recorder((s) => s.method === method && ++seen === 2);
};
type Holder = {
  method: string;
  on: Record<string, unknown>;
  off: Record<string, unknown>;
  hold: (send: SuiteContext["send"], body: () => Promise<unknown>, boundMs?: number) => Promise<unknown>;
};
const HOLDERS: readonly Holder[] = [
  {
    method: BLOCK,
    on: { urls: ["*app.bundle.js*"] },
    off: UNBLOCKED,
    hold: (send, body, boundMs) => withBlockedUrls(send, ["*app.bundle.js*"], body, boundMs),
  },
  {
    method: THROTTLE,
    on: SLOW,
    off: UNTHROTTLED,
    hold: (send, body, boundMs) => withThrottle(send, SLOW, body, boundMs),
  },
];

test("withScriptsOff turns page scripts off for its body and back on after it, also when the body throws", async () => {
  const quiet = recorder();
  assert.equal(await withScriptsOff(quiet.send, () => Promise.resolve("read")), "read");
  assert.deepEqual(scriptsSwitches(quiet.sent), [true, false]);
  const failing = recorder();
  await assert.rejects(
    withScriptsOff(failing.send, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  assert.deepEqual(scriptsSwitches(failing.sent), [true, false]);
});

test("a restore the browser refuses keeps the body's own error when the body failed, and fails the run when it passed", async () => {
  const refusing = recorder((s) => s.method === SCRIPTS && s.params?.["value"] === false);
  await assert.rejects(
    withScriptsOff(refusing.send, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  await assert.rejects(
    withScriptsOff(refusing.send, () => Promise.resolve(7)),
    /Emulation.setScriptExecutionDisabled refused/,
    "scripts may still be off for every check after this one, and the run said nothing",
  );
});

test("CD50's check turns page scripts back on itself when it fails part way, so no later check inherits them off", async () => {
  const { sent, send } = recorder();
  const kit = {
    send,
    settle: () => Promise.reject(new Error("settle timeout chart-drawer-scripts-off-road")),
    evaluate: () => Promise.resolve(null),
    check: () => {},
    sleep: () => Promise.resolve(),
    clickAt: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as TableKit;
  await assert.rejects(cd50ScriptsOffHome(kit), /settle timeout/);
  assert.deepEqual(scriptsSwitches(sent), [true, false], JSON.stringify(sent));
  assert.equal(sent.at(-1)?.method, SCRIPTS, "something ran after scripts were turned back on");
});

test("DN7's check takes its storage refusal back off itself, by the refusal's own identifier, when it fails part way", async () => {
  const { sent, send } = recorder();
  const kit = {
    send,
    check: () => {},
    setMobileViewport: () => Promise.resolve(),
    consoleErrors: [],
    open: () => Promise.reject(new Error("navigation failed")),
  } as unknown as DeskKit;
  await assert.rejects(dnRefused(kit), /navigation failed/);
  const added = sent.findIndex((s) => s.method === "Page.addScriptToEvaluateOnNewDocument");
  assert.notEqual(added, -1, "the check never refused storage");
  assert.deepEqual(
    sent.filter((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument").map((s) => s.params?.["identifier"]),
    [`script-${added + 1}`],
  );
});

test("DN4's check forgets the dismissal itself when it fails part way, so the notice's state does not outlive the suite", async () => {
  const steps: string[] = [];
  const kit = {
    check: () => {},
    touch: () => Promise.resolve(),
    setMobileViewport: () => Promise.resolve(),
    forget: () => {
      steps.push("forget");
      return Promise.resolve();
    },
    open: () => {
      steps.push("open");
      return Promise.resolve();
    },
    settle: () => Promise.reject(new Error("settle timeout the page before the tap")),
  } as unknown as DeskKit;
  await assert.rejects(dnContinue(kit), /settle timeout/);
  assert.deepEqual(steps, ["forget", "open", "forget"]);
});

test("withScriptsOff keeps scripts off until its body has settled, not merely started", async () => {
  const { sent, send } = recorder();
  let during: unknown[] = [];
  await withScriptsOff(send, async () => {
    await new Promise((settle) => setImmediate(settle));
    during = scriptsSwitches(sent);
  });
  assert.deepEqual(during, [true], "scripts came back on while the body was still running");
});

test("DN7's check keeps its own failure when the browser refuses to take the refusal back off", async () => {
  const { send } = recorder((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument");
  const kit = {
    send,
    check: () => {},
    setMobileViewport: () => Promise.resolve(),
    consoleErrors: [],
    open: () => Promise.reject(new Error("navigation failed")),
  } as unknown as DeskKit;
  await assert.rejects(dnRefused(kit), /navigation failed/);
});

test("the desk kit's forget removes the notice's own key from the page's storage", async () => {
  const { send } = recorder();
  const evaluated: string[] = [];
  const ctx = {
    send,
    evaluate: (expression: string) => {
      evaluated.push(expression);
      return Promise.resolve("complete");
    },
    sleep: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  await deskKit(ctx).forget();
  assert.ok(evaluated.includes(`localStorage.removeItem("vellum.desk-notice.v1")`), JSON.stringify(evaluated));
});

test("withStyledBoot takes its forced style read back off by its own identifier, after its body and when its body throws (Issue #778)", async () => {
  const quiet = recorder();
  const body = () => {
    assert.equal(
      quiet.sent.some((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument"),
      false,
      "the forced style read was taken off before its body ran",
    );
    return Promise.resolve("read");
  };
  assert.equal(await withStyledBoot({ send: quiet.send }, body), "read");
  const failing = recorder();
  await assert.rejects(
    withStyledBoot({ send: failing.send }, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  const refusing = recorder((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument");
  await assert.rejects(
    withStyledBoot({ send: refusing.send }, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  for (const { sent } of [quiet, failing, refusing]) {
    const added = sent.findIndex((s) => s.method === "Page.addScriptToEvaluateOnNewDocument");
    assert.notEqual(added, -1, "the boot was never forced");
    assert.deepEqual(
      sent.filter((s) => s.method === "Page.removeScriptToEvaluateOnNewDocument").map((s) => s.params?.["identifier"]),
      [`script-${added + 1}`],
      "a forced style read outlives its step",
    );
  }
});

test("withBlockedUrls and withThrottle each switch their condition on for the body and off after it, also when the body throws", async () => {
  for (const { method, on, off, hold } of HOLDERS) {
    const quiet = recorder();
    assert.equal(await hold(quiet.send, () => Promise.resolve("read")), "read");
    assert.deepEqual(paramsOf(quiet.sent, method), [on, off], `${method} after a body that passed`);
    const failing = recorder();
    await assert.rejects(
      hold(failing.send, () => Promise.reject(new Error("the body's own error"))),
      /the body's own error/,
    );
    assert.deepEqual(paramsOf(failing.sent, method), [on, off], `${method} after a body that threw`);
  }
});

test("a network condition the browser refuses to switch off keeps the body's own error when the body failed, and fails the run when it passed", async () => {
  for (const { method, hold } of HOLDERS) {
    await assert.rejects(
      hold(refusingSecond(method).send, () => Promise.reject(new Error("the body's own error"))),
      /the body's own error/,
    );
    await assert.rejects(
      hold(refusingSecond(method).send, () => Promise.resolve(7)),
      new RegExp(`${method} refused`),
      `${method} may still be on for every check after this one, and the run said nothing`,
    );
  }
});

test("a network condition whose switch-off never answers after the body failed gives up at its bound, so the body's own error still reaches its step", async () => {
  for (const { method, hold } of HOLDERS) {
    let seen = 0;
    const send = <T>(m: string): Promise<T> =>
      m === method && ++seen === 2 ? new Promise<T>(() => {}) : Promise.resolve({} as T);
    let guard: NodeJS.Timeout | undefined;
    const stalled = new Promise<string>((settle) => {
      guard = setTimeout(() => settle("stalled"), 2000);
    });
    const outcome = await Promise.race([
      hold(send, () => Promise.reject(new Error("the body's own error")), 20).then(
        () => "passed",
        (failure: unknown) => (failure instanceof Error ? failure.message : String(failure)),
      ),
      stalled,
    ]);
    clearTimeout(guard);
    assert.equal(outcome, "the body's own error", method);
  }
});

test("home's dead-bundle stretch unblocks the app bundles itself when it fails part way, so the next suite does not start with every app bundle blocked (Issue #1178)", async () => {
  const { sent, send } = recorder();
  const ctx = {
    send,
    evaluate: () => Promise.reject(new Error("eval exception: the page went away")),
    check: () => {},
    sleep: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  await assert.rejects(
    h13DeadBundle(ctx, (_name, body) => body()),
    /eval exception: the page went away/,
  );
  assert.deepEqual(paramsOf(sent, BLOCK), [{ urls: ["*app.bundle.js*"] }, UNBLOCKED], JSON.stringify(sent));
  assert.equal(sent.at(-1)?.method, BLOCK, "something ran after the bundles were unblocked");
});

test("H13e lifts its own throttle when it fails part way, so the checks after it in home do not load their pages throttled (Issue #1178)", async () => {
  const { sent, send } = recorder((s) => s.method === "Page.navigate");
  const ctx = {
    send,
    evaluate: () => Promise.resolve(undefined),
    check: () => {},
    sleep: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  await assert.rejects(h13ePrmNoFlash(ctx), /Page.navigate refused/);
  const throttles = paramsOf(sent, THROTTLE) as { latency?: number }[];
  assert.ok((throttles[0]?.latency ?? 0) > 0, `the check never slowed the network: ${JSON.stringify(sent)}`);
  assert.deepEqual(throttles.slice(1), [UNTHROTTLED], JSON.stringify(sent));
  assert.equal(sent.at(-1)?.method, THROTTLE, "something ran after the throttle was lifted");
});
