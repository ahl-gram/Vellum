import { test } from "node:test";
import assert from "node:assert/strict";
import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
import { ribbonKit } from "../../e2e/suites/ribbon/kit.ts";
import { runningHeadKit } from "../../e2e/suites/runninghead/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const PORT = 8765;
const KITS = [
  { room: "prospect", kit: prospectKit, hop: "prospect-goto-away", plate: "pp-plate", glass: "prospect-glass-home" },
  { room: "ribbon", kit: ribbonKit, hop: "ribbon-goto-away", plate: "rb-plate", glass: "ribbon-glass-home" },
] as const;
const PRESS_ZERO = `document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`;
const GLASS_HOME = `!document.getElementById("map-viewport").classList.contains("zoomed")`;
const VEIL = `!!document.getElementById("lf-veil")`;

function page(answer: (nth: number, expression: string) => unknown) {
  const asked: string[] = [];
  const navigated: string[] = [];
  const keys: string[] = [];
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      asked.push(expression);
      const a = answer(asked.length, expression);
      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
    },
    send: (method: string, params?: Record<string, unknown>): Promise<unknown> => {
      const url = params?.["url"];
      if (method === "Page.navigate") navigated.push(typeof url === "string" ? url : "");
      const key = params?.["key"];
      if (method === "Input.dispatchKeyEvent" && params?.["type"] === "keyDown")
        keys.push(typeof key === "string" ? key : "");
      return Promise.resolve({});
    },
    sleep: (): Promise<void> => Promise.resolve(),
    PORT,
  } as unknown as SuiteContext;
  return { asked, navigated, keys, ctx };
}

for (const { room, kit, hop, plate, glass } of KITS) {
  test(`the ${room} kit's goto THROWS, naming its hop, when the page never leaves the plate, and never sends the room's own address after it`, async () => {
    const p = page(() => false);
    await assert.rejects(kit(p.ctx).goto("#seed=42"), (err: Error) => err.message === `settle timeout ${hop}: false`);
    assert.equal(p.asked.length, 100, "the hop did not spend the 100 reads it is given");
    assert.ok(
      p.asked.every((expression) => expression === `!document.getElementById("${plate}")`),
      `the hop read something other than the absence of the room's own plate, ${plate}: ${p.asked[0]}`,
    );
    assert.deepEqual(p.navigated, [`http://127.0.0.1:${PORT}/faq/`]);
  });

  test(`the ${room} kit's goto waits out a read that throws on the way, and then sends the room's address`, async () => {
    const p = page((nth) =>
      nth === 1 ? new Error("eval exception: TypeError: Cannot read properties of null") : true,
    );
    await kit(p.ctx).goto("#seed=42");
    assert.deepEqual(p.navigated, [`http://127.0.0.1:${PORT}/faq/`, `http://127.0.0.1:${PORT}/${room}/#seed=42`]);
  });

  test(`the ${room} kit's opened THROWS with the room, its label and the last read when the plate never draws`, async () => {
    const p = page(() => null);
    await assert.rejects(
      kit(p.ctx).opened("never"),
      (err: Error) => err.message === `settle timeout ${room} page never drew: never: null`,
    );
    assert.equal(p.asked.length, 300, "the draw did not spend the 300 reads (15 s at 50 ms) it is given");
  });

  test(`the ${room} kit's opened waits out a read that throws, and polls past a plate that has not finished drawing`, async () => {
    const drawn = { blob: true, status: "" };
    const reads = [
      new Error('{"code":-32000,"message":"Execution context was destroyed."}'),
      { blob: true, status: "drawing" },
      { blob: false, status: "" },
      drawn,
    ];
    const p = page((nth) => reads[nth - 1]);
    assert.equal(await kit(p.ctx).opened("slow"), drawn);
    assert.equal(p.asked.length, 4, "the draw gave up on a throwing read, or accepted a plate that was not drawn");
  });

  test(`the ${room} kit's glassHome presses 0 and then THROWS, naming its wait, when the Glass never comes home`, async () => {
    const p = page(() => false);
    await assert.rejects(kit(p.ctx).glassHome(), (err: Error) => err.message === `settle timeout ${glass}: false`);
    assert.equal(p.asked[0], PRESS_ZERO, "the wait read before it pressed 0, or pressed something else");
    assert.equal(p.asked.length, 61, "the wait did not spend the 60 reads it is given");
    assert.ok(
      p.asked.slice(1).every((expression) => expression === GLASS_HOME),
      `the wait read something other than the Glass's own zoomed class: ${p.asked[1]}`,
    );
  });

  test(`the ${room} kit's glassHome hands back as soon as the Glass is home`, async () => {
    const p = page((nth) => nth >= 4);
    await kit(p.ctx).glassHome();
    assert.equal(p.asked.length, 4, "the wait read on past the Glass coming home, or never waited for it");
  });

  test(`the ${room} kit's glassHome fails at once with a read's own error, since nothing navigates while the Glass comes home`, async () => {
    const gone = new Error("eval exception: TypeError: Cannot read properties of null (reading 'classList')");
    const p = page((nth) => (nth === 2 ? gone : true));
    await assert.rejects(kit(p.ctx).glassHome(), (err: unknown) => err === gone);
    assert.equal(p.asked.length, 2, "the wait read again after a read threw");
  });
}

test("the running head's visit to home answers false when the veil never lifts, after its 40 presses of Escape", async () => {
  const p = page(() => true);
  assert.equal(await runningHeadKit(p.ctx).visit("/"), false);
  assert.deepEqual(
    p.keys,
    Array.from({ length: 40 }, () => "Escape"),
    "the visit did not press Escape 40 times",
  );
  assert.equal(
    p.asked.filter((expression) => expression === VEIL).length,
    40,
    "the visit did not read the veil once after each press",
  );
});

test("the running head's visit to home answers true once the veil lifts, and stops pressing", async () => {
  let veil = 0;
  const p = page((nth, expression) => (expression === VEIL ? ++veil < 3 : true));
  assert.equal(await runningHeadKit(p.ctx).visit("/"), true);
  assert.equal(p.keys.length, 3, "the visit pressed on after the veil lifted, or stopped before it did");
});

test("the running head's visit to home presses on past a read of the veil that throws", async () => {
  let veil = 0;
  const p = page((nth, expression) =>
    expression === VEIL ? (++veil === 1 ? new Error("eval exception: TypeError: gone") : false) : true,
  );
  assert.equal(await runningHeadKit(p.ctx).visit("/"), true);
  assert.equal(p.keys.length, 2, "a veil read that threw stopped the presses or was read as the veil lifting");
});
