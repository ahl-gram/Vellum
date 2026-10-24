import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FINGERPRINT_BOUND_MS,
  GLYPH_SELECTOR,
  MEASURE_PAYLOAD,
  READY_PAYLOAD,
  REMOVE_PAYLOAD,
  readBrowserFacts,
} from "../../e2e/support/fingerprint-probe.ts";
import type { ProbeContext } from "../../e2e/support/fingerprint-probe.ts";
import { unreadBrowser } from "../../e2e/support/fingerprint.ts";
import type { BrowserFacts } from "../../e2e/support/fingerprint.ts";

type Script = {
  version?: () => Promise<unknown>;
  ready?: () => Promise<boolean>;
  measure?: () => Promise<unknown>;
  fonts?: () => Promise<unknown>;
};

function page(script: Script = {}) {
  const calls: string[] = [];
  const selectors: unknown[] = [];
  const send = (method: string, params?: Record<string, unknown>): Promise<unknown> => {
    calls.push(method);
    if (method === "Browser.getVersion")
      return script.version?.() ?? Promise.resolve({ product: "Chrome/1.2.3.4", userAgent: "HeadlessChrome/9.9.9.9" });
    if (method === "DOM.getDocument") return Promise.resolve({ root: { nodeId: 1 } });
    if (method === "DOM.querySelector") {
      selectors.push(params?.["selector"]);
      return Promise.resolve({ nodeId: 7 });
    }
    if (method === "CSS.getPlatformFontsForNode")
      return script.fonts?.() ?? Promise.resolve({ fonts: [{ familyName: "Palatino", glyphCount: 1 }] });
    return Promise.resolve({});
  };
  const evaluate = (expression: string): Promise<unknown> => {
    if (expression === READY_PAYLOAD) {
      calls.push("ready");
      return script.ready?.() ?? Promise.resolve(true);
    }
    if (expression === MEASURE_PAYLOAD) {
      calls.push("measure");
      return script.measure?.() ?? Promise.resolve({ numeroWidth: 100.3125, selectHeight: 34.21875 });
    }
    calls.push(expression === REMOVE_PAYLOAD ? "remove" : "other");
    return Promise.resolve(true);
  };
  const ctx = { send, evaluate, sleep: () => Promise.resolve() } as unknown as ProbeContext;
  return { ctx, calls, selectors };
}

const turn = () => new Promise((settle) => setImmediate(settle));

test("a page that answers gives the browser's product, both readings and the face that drew the glyph, and its probe is taken off the page", async () => {
  const { ctx, calls, selectors } = page();
  assert.deepEqual(await readBrowserFacts(ctx), {
    product: "Chrome/1.2.3.4",
    numeroWidth: 100.3125,
    numeroFace: "Palatino",
    selectHeight: 34.21875,
    unread: null,
  });
  assert.deepEqual(selectors, [GLYPH_SELECTOR]);
  assert.deepEqual(
    calls.filter((c) => c.startsWith("CSS.")),
    ["CSS.enable", "CSS.getPlatformFontsForNode", "CSS.disable"],
  );
  assert.equal(calls.filter((c) => c === "remove").length, 1);
});

test("a probe that throws names why, still takes its box off the page and turns CSS back off, and never throws itself", async () => {
  const thrown = page({ measure: () => Promise.reject(new Error("eval exception: boom")) });
  assert.deepEqual(await readBrowserFacts(thrown.ctx), {
    product: "Chrome/1.2.3.4",
    numeroWidth: null,
    numeroFace: null,
    selectHeight: null,
    unread: "eval exception: boom",
  });
  assert.equal(thrown.calls.filter((c) => c === "remove").length, 1);

  const refused = page({ fonts: () => Promise.reject(new Error("CSS refused")) });
  assert.deepEqual(await readBrowserFacts(refused.ctx), {
    product: "Chrome/1.2.3.4",
    numeroWidth: 100.3125,
    numeroFace: null,
    selectHeight: 34.21875,
    unread: "CSS refused",
  });
  assert.ok(refused.calls.includes("CSS.disable"));
  assert.equal(refused.calls.filter((c) => c === "remove").length, 1);
});

test("a page without the folio title or the fallback faces says which piece it lacks", async () => {
  const { ctx, calls } = page({ measure: () => Promise.resolve({ missing: "#folio-title" }) });
  assert.deepEqual(await readBrowserFacts(ctx), {
    product: "Chrome/1.2.3.4",
    numeroWidth: null,
    numeroFace: null,
    selectHeight: null,
    unread: "no #folio-title on the page",
  });
  assert.equal(calls.filter((c) => c.startsWith("CSS.")).length, 0);
});

test("a browser that never answers is given up on at the bound, and the facts say so", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { ctx } = page({ version: () => new Promise(() => {}) });
  let facts: BrowserFacts | undefined;
  const reading = readBrowserFacts(ctx).then((f) => {
    facts = f;
  });
  await turn();
  t.mock.timers.tick(FINGERPRINT_BOUND_MS - 1);
  await turn();
  assert.equal(facts, undefined, "the probe gave up before its bound");
  t.mock.timers.tick(1);
  await turn();
  await turn();
  assert.deepEqual(facts, unreadBrowser(`the browser gave no answer within ${FINGERPRINT_BOUND_MS} ms`));
  await reading;
});

test("a page that comes ready only after the bound is never measured, so nothing is added to it once the run has moved on", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let open: (v: boolean) => void = () => {};
  const gate = new Promise<boolean>((r) => {
    open = r;
  });
  const { ctx, calls } = page({ ready: () => gate });
  const reading = readBrowserFacts(ctx);
  await turn();
  t.mock.timers.tick(FINGERPRINT_BOUND_MS);
  await turn();
  open(true);
  await turn();
  await turn();
  await turn();
  assert.equal(calls.includes("measure"), false, "the probe measured a page after its bound");
  assert.equal(calls.filter((c) => c === "remove").length, 1);
  await reading;
});

test("a measurement that returns only after the bound asks the page for nothing more, and its box still comes off", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let open: (v: unknown) => void = () => {};
  const gate = new Promise<unknown>((r) => {
    open = r;
  });
  const { ctx, calls } = page({ measure: () => gate });
  const reading = readBrowserFacts(ctx);
  await turn();
  t.mock.timers.tick(FINGERPRINT_BOUND_MS);
  await turn();
  open({ numeroWidth: 100.3125, selectHeight: 34.21875 });
  await turn();
  await turn();
  await turn();
  assert.deepEqual(
    calls.filter((c) => c.startsWith("DOM.") || c.startsWith("CSS.")),
    [],
    "the probe asked the page for more after its bound",
  );
  assert.equal(calls.filter((c) => c === "remove").length, 1);
  await reading;
});
