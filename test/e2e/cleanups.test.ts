import { test } from "node:test";
import assert from "node:assert/strict";
import { withScriptsOff } from "../../e2e/support/scripts-off.ts";
import { cd50ScriptsOffHome } from "../../e2e/suites/chart-drawer/portfolio.ts";
import type { TableKit } from "../../e2e/suites/chart-drawer/kit.ts";
import { deskKit, dnContinue, dnRefused } from "../../e2e/suites/cluster/desk-notice.ts";
import type { DeskKit } from "../../e2e/suites/cluster/desk-notice.ts";
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
