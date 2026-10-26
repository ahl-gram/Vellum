import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { FIXED_DAY, FIXED_SEED, clockScript, fixTheDay, onDay } from "../../e2e/support/fixed-day.ts";
import { withReducedMotion } from "../../e2e/support/reduced-motion.ts";

const OTHER_DAY = Date.UTC(2026, 9, 7, 12);
const ADD = "Page.addScriptToEvaluateOnNewDocument";
const REMOVE = "Page.removeScriptToEvaluateOnNewDocument";
const MEDIA = "Emulation.setEmulatedMedia";
// A page whose own clock stands at 1e12 until tick(ms) moves it, so no test waits on the wall clock.
const STOPPED = `(() => { const Real = Date; let t = 1e12; globalThis.tick = (ms) => { t += ms; }; globalThis.Date = new Proxy(Real, { get: (o, p) => (p === "now" ? () => t : Reflect.get(o, p)) }); })()`;
type Sent = { method: string; params?: Record<string, unknown> };

function page(...scripts: string[]): (expression: string) => unknown {
  const ctx = vm.createContext({});
  for (const s of [STOPPED, ...scripts]) vm.runInContext(s, ctx);
  return (expression) => {
    const value: unknown = vm.runInContext(expression, ctx);
    return value;
  };
}
const isoOf = (run: (e: string) => unknown) => String(run("new Date().toISOString()"));

function recorder(fail: (sent: Sent) => boolean = () => false) {
  const sent: Sent[] = [];
  const send = <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
    const message = params === undefined ? { method } : { method, params };
    sent.push(message);
    if (fail(message)) return Promise.reject(new Error(`${method} refused`));
    const reply = method === ADD ? { identifier: `script-${String(sent.length)}` } : {};
    return Promise.resolve(reply as T);
  };
  return { sent, send };
}

test("the harness's clock holds a page at FIXED_DAY: new Date(), Date() and Date.now read that day and run on from it, while a date built from arguments, Date.UTC and Date.parse are left alone", () => {
  const run = page(clockScript(FIXED_DAY, false));
  assert.equal(FIXED_SEED, 20261005);
  assert.equal(isoOf(run), "2026-10-05T12:00:00.000Z");
  assert.equal(run("Date.now()"), FIXED_DAY);
  assert.equal(Date.parse(String(run("Date()"))), FIXED_DAY);
  assert.deepEqual(
    JSON.parse(
      String(
        run(
          'JSON.stringify([new Date(0).getTime(), Date.UTC(2026, 0, 1), Date.parse("2026-07-06T00:00:00Z"), new Date() instanceof Date])',
        ),
      ),
    ),
    [0, 1767225600000, 1783296000000, true],
  );
  run("tick(250)");
  assert.equal(run("Date.now()"), FIXED_DAY + 250);
  assert.equal(isoOf(run), "2026-10-05T12:00:00.250Z");
});

test("a suite's own day wins over the harness's, whichever of the two new-document scripts the browser runs first", () => {
  assert.equal(isoOf(page(clockScript(FIXED_DAY, false), clockScript(OTHER_DAY, true))), "2026-10-07T12:00:00.000Z");
  assert.equal(isoOf(page(clockScript(OTHER_DAY, true), clockScript(FIXED_DAY, false))), "2026-10-07T12:00:00.000Z");
});

test("fixTheDay registers exactly one new-document script, the harness's clock at FIXED_DAY, which a suite's own day still wins over", async () => {
  const { sent, send } = recorder();
  await fixTheDay(send);
  assert.deepEqual(
    sent.map((s) => s.method),
    [ADD],
  );
  const source = String(sent[0]?.params?.["source"]);
  assert.equal(isoOf(page(source)), "2026-10-05T12:00:00.000Z");
  assert.equal(isoOf(page(clockScript(OTHER_DAY, true), source)), "2026-10-07T12:00:00.000Z");
});

test("onDay gives its body the suite's own day and takes that clock back off by its own identifier, also when the body throws, keeping the body's error when the browser refuses the removal", async () => {
  const { sent, send } = recorder();
  const seen: string[] = [];
  await onDay({ send }, OTHER_DAY, () => {
    seen.push(sent.map((s) => s.method).join());
    return Promise.resolve();
  });
  assert.deepEqual(
    sent.map((s) => s.method),
    [ADD, REMOVE],
  );
  assert.equal(sent[0]?.params?.["source"], clockScript(OTHER_DAY, true));
  assert.deepEqual(sent[1]?.params, { identifier: "script-1" });
  assert.deepEqual(seen, [ADD]);
  const failing = recorder();
  await assert.rejects(
    onDay({ send: failing.send }, OTHER_DAY, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  assert.deepEqual(
    failing.sent.map((s) => s.method),
    [ADD, REMOVE],
  );
  const refusing = recorder((s) => s.method === REMOVE);
  await assert.rejects(
    onDay({ send: refusing.send }, OTHER_DAY, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
});

test("withReducedMotion reduces motion for its body and clears the emulated media after it, also when the body throws, and registers or removes no new-document script", async () => {
  const both = [
    { method: MEDIA, params: { features: [{ name: "prefers-reduced-motion", value: "reduce" }] } },
    { method: MEDIA, params: { media: "", features: [] } },
  ];
  const quiet = recorder();
  await withReducedMotion({ send: quiet.send }, () => Promise.resolve());
  assert.deepEqual(quiet.sent, both);
  const failing = recorder();
  await assert.rejects(
    withReducedMotion({ send: failing.send }, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  assert.deepEqual(failing.sent, both);
  assert.ok(![...quiet.sent, ...failing.sent].some((s) => s.method === ADD || s.method === REMOVE));
});
