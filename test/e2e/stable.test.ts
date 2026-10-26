import { test } from "node:test";
import assert from "node:assert/strict";
import { makeSettle, makeStable, STILL_ONLY } from "../../e2e/support/settle.ts";
import type { Payload } from "../../e2e/types.ts";
import { fakePage, type FakeFrame } from "../../test-support/fake-page.ts";

const reading = (reads: unknown[]) => {
  const asked: string[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    asked.push(expression);
    return Promise.resolve(reads.shift());
  };
  const sleep = (): Promise<void> => Promise.resolve();
  return { asked, stable: makeStable(makeSettle({ evaluate, sleep })) };
};
const onPage = (frame: (clock: number) => FakeFrame) => {
  const page = fakePage(frame);
  const sleep = (): Promise<void> => Promise.resolve();
  return { page, stable: makeStable(makeSettle({ evaluate: page.evaluate, sleep })) };
};
const settled = (wait: Promise<unknown>): Promise<unknown> => wait.catch((err: unknown) => err);
const STILL = STILL_ONLY.carry;
const WIDTH: Payload<number> = `document.querySelector(".sheet").getBoundingClientRect().width`;
const BOX: Payload<{ w: number } | null> =
  `(() => { const e = document.querySelector(".sheet"); return e ? { w: e.getBoundingClientRect().width } : null; })()`;
const sheet = (width: number, anims: readonly string[]): FakeFrame => ({
  nodes: { ".sheet": { rect: [0, 0, width, 10], anims } },
});
const sheetFrom =
  (present: (clock: number) => boolean) =>
  (clock: number): FakeFrame => ({
    nodes: { ".card": { anims: ["finished"] }, ...(present(clock) ? { ".sheet": { rect: [0, 0, 100, 10] } } : {}) },
  });

test("a stable read hands back the first read that equals the one before it, never a read still moving", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 2 }, { n: 2 }, { n: 3 }]);
  assert.deepEqual(await settled(stable<{ n: number }>("READ", "climb", { departed: STILL })), { n: 2 });
  assert.equal(asked.length, 3);
});

test("a stable read that never comes to rest throws with its label and its last read, after exactly the tries it was given", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 2 }, { n: 3 }]);
  await assert.rejects(
    stable<{ n: number }>("READ", "moving", { departed: STILL, tries: 3 }),
    (err: Error) => err.message === 'settle timeout moving: {"n":3}',
  );
  assert.equal(asked.length, 3);
});

test("a stable read waits for its departure: equal reads that have not left their start do not settle it", async () => {
  const { asked, stable } = reading([{ x: 0 }, { x: 0 }, { x: 5 }, { x: 5 }]);
  assert.deepEqual(await settled(stable<{ x: number }>("READ", "left", { departed: (d) => d.x !== 0 })), { x: 5 });
  assert.equal(asked.length, 4);
});

test("a stable read compares by the comparator it is given, which is never handed the absent read before the first", async () => {
  const { asked, stable } = reading([{ x: 1 }, { x: 1.3 }, { x: 9 }]);
  const near = (d: { x: number }, last: { x: number }): boolean => Math.abs(d.x - last.x) < 0.5;
  assert.deepEqual(await settled(stable<{ x: number }>("READ", "near", { departed: STILL, same: near })), { x: 1.3 });
  assert.equal(asked.length, 2);
});

test("a stable read owes a departure, an animation or the reason it has none, and reads nothing without one", async () => {
  const { asked, stable } = reading([{ n: 1 }, { n: 1 }]);
  await assert.rejects(
    stable<{ n: number }>("READ", "bare", {} as never),
    (err: Error) => err.message === "makeStable owes a departure, an animation or the reason it has none: bare",
  );
  assert.equal(asked.length, 0);
});

test("only the two waits clause 5's exception covers give a reason in place of a departure: a third is a ruling, and this list its record", () => {
  assert.deepEqual(Object.keys(STILL_ONLY), ["carry", "deskNotice"]);
});

test("a stable read refuses a promise, which the harness hands back as {} and which would pass as still", async () => {
  const { asked, stable } = reading([{}, {}]);
  await assert.rejects(
    stable<{ n: number }>("(async () => ({ n: 1 }))()", "promised", { departed: STILL }),
    (err: Error) => err.message === "makeStable reads a value, and a promise arrives as {}: promised",
  );
  assert.equal(asked.length, 0);
});

test("a witnessed read waits for every animation on the element that carries it to have finished, and hands back the read alone", async () => {
  const { page, stable } = onPage((clock) =>
    sheet(918.9, clock < 4 ? ["running", "running"] : ["finished", "finished"]),
  );
  assert.equal(await settled(stable(WIDTH, "landed", { animated: ".sheet" })), 918.9);
  assert.equal(page.said.length, 4);
});

test("a witnessed read waits for its departure as well as for the animations", async () => {
  const { page, stable } = onPage((clock) => sheet(clock < 4 ? 100 : 200, ["finished"]));
  assert.equal(await settled(stable(WIDTH, "grown", { animated: ".sheet", departed: (w) => w > 150 })), 200);
  assert.equal(page.said.length, 5);
});

test("an element with no animation at all is not finished: [].every() is true, and a witness that trusted it would pass a shut panel", async () => {
  const { page, stable } = onPage(() => sheet(918.9, []));
  await assert.rejects(stable(WIDTH, "bare", { animated: ".sheet", tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout bare: "),
  );
  assert.equal(page.said.length, 4, "the witnessed read did not spend exactly the tries it was given");
});

test("an element the page does not carry is not finished", async () => {
  const { stable } = onPage(() => sheet(918.9, ["finished"]));
  await assert.rejects(stable(WIDTH, "gone", { animated: ".absent", tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout gone: "),
  );
});

test("a witnessed read never settles on a read the page could not make, whatever its comparator accepts", async () => {
  const { stable } = onPage(sheetFrom((clock) => clock < 2));
  await assert.rejects(stable(BOX, "unread", { animated: ".card", same: () => true, tries: 4 }), (err: Error) =>
    err.message.startsWith("settle timeout unread: "),
  );
});

test("a witnessed read never hands its comparator the absent read before a present one", async () => {
  const { stable } = onPage(sheetFrom((clock) => clock > 1));
  const near = (d: { w: number }, last: { w: number }): boolean => Math.abs(d.w - last.w) < 0.5;
  const got = await settled(stable(BOX, "boxed", { animated: ".card", same: near }));
  assert.equal(JSON.stringify(got), '{"w":100}');
});
