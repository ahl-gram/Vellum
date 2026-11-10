import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { perform } from "../../e2e/support/primer-acts.ts";
import type { PrimerKit } from "../../e2e/support/primer-walk.ts";
import type { Act } from "../../src/site/shared/primer/shape.ts";

type Node = {
  readonly rect: readonly [number, number, number, number];
  readonly type?: string;
  readonly value?: string;
  readonly events: string[];
};
type Sent = { readonly method: string; readonly params: Readonly<Record<string, unknown>> };

function kitOver(nodes: Readonly<Record<string, readonly Node[]>>): {
  k: PrimerKit;
  sent: Sent[];
  valueOf: (css: string) => string;
} {
  const sent: Sent[] = [];
  const doc: { activeElement: unknown; querySelectorAll: (css: string) => readonly unknown[] } = {
    activeElement: null,
    querySelectorAll: () => [],
  };
  const element = (n: Node) => {
    let value = n.value ?? "";
    const e = {
      type: n.type ?? "",
      get value() {
        return value;
      },
      set value(v: string) {
        value = v;
      },
      min: "100",
      max: "700",
      step: "2",
      labels: [],
      scrollIntoView: () => undefined,
      getBoundingClientRect: () => ({ left: n.rect[0], top: n.rect[1], width: n.rect[2], height: n.rect[3] }),
      dispatchEvent: (ev: Event) => n.events.push(ev.type) > 0,
      focus: () => {
        doc.activeElement = e;
      },
      select: () => undefined,
    };
    return e;
  };
  const els = Object.fromEntries(Object.entries(nodes).map(([css, list]) => [css, list.map(element)]));
  doc.querySelectorAll = (css) => els[css] ?? [];
  const page = vm.createContext({ document: doc, getComputedStyle: () => ({ clipPath: "none" }), Event });
  const k = {
    evaluate: (expression: string) => Promise.resolve(vm.runInContext(expression, page)),
    send: (method: string, params: Record<string, unknown> = {}) => {
      sent.push({ method, params });
      const focused = doc.activeElement as { value: string } | null;
      if (method === "Input.insertText" && focused !== null) focused.value = String(params.text);
      return Promise.resolve({});
    },
    room: () => ({ rest: `({ marks: 0, frames: 0, quiet: true, view: "" })`, pickFirst: null, repeatCap: 1 }),
    rest: () => Promise.resolve({ marks: 1, frames: 1, quiet: true, view: "" }),
    reachOf: () => Promise.resolve("reachable"),
  };
  return { k: k as unknown as PrimerKit, sent, valueOf: (css) => els[css]?.[0]?.value ?? "" };
}

const node = (rect: Node["rect"], type?: string, value?: string): Node => ({ rect, type, value, events: [] });

test("PA1 a click act presses the nth match at its own centre, or at the point the act names", async () => {
  const { k, sent } = kitOver({ ".mark": [node([0, 0, 10, 10]), node([100, 0, 10, 10]), node([200, 40, 20, 10])] });
  const acts: readonly Act[] = [
    { kind: "click", css: ".mark", nth: 2 },
    { kind: "click", css: ".mark", nth: 1, at: { x: 0.2, y: 0.8 } },
    { kind: "click", css: ".mark" },
  ];
  for (const a of acts) await perform(k, a, "PA1");
  const presses = sent.filter((s) => s.params.type === "mousePressed").map((s) => [s.params.x, s.params.y]);
  assert.deepEqual(presses, [
    [210, 45],
    [102, 8],
    [5, 5],
  ]);
});

test("PA2 a slider's set commits as a reader letting go does, and with release false leaves the value uncommitted", async () => {
  const land = node([0, 0, 200, 20], "range", "100");
  const coast = node([0, 40, 200, 20], "range", "100");
  const { k } = kitOver({ "#land": [land], "#coast": [coast] });
  await perform(k, { kind: "set", css: "#land", value: "300" }, "PA2");
  await perform(k, { kind: "set", css: "#coast", value: "300", release: false }, "PA2");
  assert.deepEqual([land.events, coast.events], [["input", "change"], ["input"]]);
});

test("PA3 a box's set types its value and commits nothing, whether or not it names release", async () => {
  const seed = node([0, 0, 120, 24], "text", "7");
  const { k, sent, valueOf } = kitOver({ "#seed": [seed] });
  await perform(k, { kind: "set", css: "#seed", value: "42" }, "PA3");
  await perform(k, { kind: "set", css: "#seed", value: "1155", release: false }, "PA3");
  assert.deepEqual(
    { sent: sent.map((s) => s.method), events: seed.events, value: valueOf("#seed") },
    { sent: ["Input.insertText", "Input.insertText"], events: [], value: "1155" },
  );
});
