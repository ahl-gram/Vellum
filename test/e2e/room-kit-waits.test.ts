import { test } from "node:test";
import assert from "node:assert/strict";
import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
import { ribbonKit } from "../../e2e/suites/ribbon/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const PORT = 8765;
const KITS = [
  { room: "prospect", kit: prospectKit, hop: "prospect-goto-away", plate: "pp-plate" },
  { room: "ribbon", kit: ribbonKit, hop: "ribbon-goto-away", plate: "rb-plate" },
] as const;

function page(answer: (nth: number) => unknown) {
  const asked: string[] = [];
  const navigated: string[] = [];
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      asked.push(expression);
      const a = answer(asked.length);
      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
    },
    send: (method: string, params?: Record<string, unknown>): Promise<unknown> => {
      const url = params?.["url"];
      if (method === "Page.navigate") navigated.push(typeof url === "string" ? url : "");
      return Promise.resolve({});
    },
    sleep: (): Promise<void> => Promise.resolve(),
    PORT,
  } as unknown as SuiteContext;
  return { asked, navigated, ctx };
}

for (const { room, kit, hop, plate } of KITS) {
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
}
