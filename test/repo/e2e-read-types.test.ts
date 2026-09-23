import { test } from "node:test";
import assert from "node:assert/strict";
import type { Evaluate, Payload } from "../../scripts/e2e/types.ts";
import { makeSettle } from "../../scripts/e2e/settle-support.ts";

type Cam = { scale: number; x: number; y: number };
const readCam = "(() => null)()" as Payload<Cam | null>;

// Never called: npm run check is what reads these, and each directive reds (TS2578) the day its line stops being an error.
const typedReadFixtures = async (evaluate: Evaluate): Promise<void> => {
  const bare = await evaluate(`({ x: 1 })`);
  // @ts-expect-error an undeclared read has no fields to read
  void bare.x;
  const rect = await evaluate<{ x: number; y: number }>(`({ x: 1, y: 2 })`);
  // @ts-expect-error a declared shape rejects a field its payload does not carry, the top-for-y of Gate 2 item 9
  void rect.top;
  // @ts-expect-error a branded payload cannot be read as a different shape
  await evaluate<{ top: number }>(readCam);
  // @ts-expect-error a shape cannot arrive from where the value is used
  const n: number = await evaluate(`1`);
  void n;
};
void typedReadFixtures;

const settledReadFixtures = async (settle: ReturnType<typeof makeSettle>): Promise<void> => {
  // @ts-expect-error a settle's predicate cannot supply the shape its read never stated
  const r = await settle(`({ open: true })`, (d: { open: boolean; count: number }) => d.open, "open");
  void r;
  // @ts-expect-error nor can the previous read the predicate is handed
  const s = await settle(`({ open: true })`, (d, last: { open: boolean } | null) => last !== null && d.open === last.open, "still");
  void s;
};
void settledReadFixtures;

const reading = (reads: unknown[]) => {
  const asked: string[] = [];
  const slept: number[] = [];
  const evaluate = async (expression: string): Promise<unknown> => {
    asked.push(expression);
    return reads.shift();
  };
  const sleep = async (ms: number): Promise<void> => {
    slept.push(ms);
  };
  return { asked, slept, settle: makeSettle({ evaluate, sleep }) };
};

test("a settle hands back the first read its predicate accepts, and polls past a null read without asking the predicate", async () => {
  const { asked, slept, settle } = reading([null, { n: 1 }, { n: 2 }, { n: 3 }]);
  const seen: number[] = [];
  const got = await settle<{ n: number } | null>("READ", (d) => (seen.push(d.n), d.n >= 2), "climb");
  assert.deepEqual(got, { n: 2 });
  assert.deepEqual(seen, [1, 2], "the predicate was asked about the null read, or asked after it had already accepted");
  assert.equal(asked.length, 3);
  assert.ok(asked.every((e) => e === "READ"), "the settle evaluated something other than the read it was given");
  assert.deepEqual(slept, [50, 50], "the poll does not sleep its 50ms between reads");
});

test("a settle hands the predicate the PREVIOUS read, so a rest with no fixed end can ask for stillness", async () => {
  const { settle } = reading([{ n: 1 }, { n: 4 }, { n: 4 }]);
  const lasts: ({ n: number } | null)[] = [];
  const got = await settle<{ n: number }>("READ", (d, last) => (lasts.push(last), last !== null && d.n === last.n), "still");
  assert.deepEqual(got, { n: 4 });
  assert.deepEqual(lasts, [null, { n: 1 }, { n: 4 }]);
});

test("a settle that runs out of tries THROWS with its label and its last read, and never hands that read back", async () => {
  const { asked, settle } = reading([{ n: 0 }, { n: 0 }, { n: 7 }]);
  await assert.rejects(
    settle<{ n: number }>("READ", (d) => d.n > 10, "never", 3),
    (err: Error) => err.message === 'settle timeout never: {"n":7}',
  );
  assert.equal(asked.length, 3, "the settle did not spend exactly the tries it was given");
});
