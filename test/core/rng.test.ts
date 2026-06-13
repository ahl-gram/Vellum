import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng, hashString } from "../../src/core/rng.ts";

test("same seed produces identical sequences", () => {
  const a = createRng(123);
  const b = createRng(123);
  const seqA = Array.from({ length: 20 }, () => a.next());
  const seqB = Array.from({ length: 20 }, () => b.next());
  assert.deepEqual(seqA, seqB);
});

test("different seeds produce different sequences", () => {
  const a = createRng(1);
  const b = createRng(2);
  const seqA = Array.from({ length: 10 }, () => a.next());
  const seqB = Array.from({ length: 10 }, () => b.next());
  assert.notDeepEqual(seqA, seqB);
});

test("next() stays in [0, 1)", () => {
  const rng = createRng(99);
  for (let i = 0; i < 1000; i++) {
    const v = rng.next();
    assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
  }
});

test("next() distribution is roughly uniform", () => {
  const rng = createRng(7);
  let sum = 0;
  const n = 10000;
  for (let i = 0; i < n; i++) sum += rng.next();
  const mean = sum / n;
  assert.ok(mean > 0.45 && mean < 0.55, `mean drifted: ${mean}`);
});

test("int(n) returns integers in [0, n)", () => {
  const rng = createRng(5);
  for (let i = 0; i < 500; i++) {
    const v = rng.int(10);
    assert.ok(Number.isInteger(v));
    assert.ok(v >= 0 && v < 10);
  }
});

test("int throws on non-positive max", () => {
  const rng = createRng(5);
  assert.throws(() => rng.int(0), RangeError);
  assert.throws(() => rng.int(-3), RangeError);
});

test("range(min, max) stays in bounds", () => {
  const rng = createRng(11);
  for (let i = 0; i < 500; i++) {
    const v = rng.range(2, 5);
    assert.ok(v >= 2 && v < 5);
  }
});

test("pick returns an element and throws on empty", () => {
  const rng = createRng(3);
  const items = ["a", "b", "c"];
  for (let i = 0; i < 50; i++) {
    assert.ok(items.includes(rng.pick(items)));
  }
  assert.throws(() => rng.pick([]), RangeError);
});

test("shuffled returns a permutation without mutating input", () => {
  const rng = createRng(42);
  const original = [1, 2, 3, 4, 5, 6, 7, 8];
  const frozen = [...original];
  const result = rng.shuffled(original);
  assert.deepEqual(original, frozen, "input array was mutated");
  assert.notEqual(result, original, "must return a new array");
  assert.deepEqual([...result].sort((a, b) => a - b), frozen);
});

test("shuffled is deterministic per seed", () => {
  const a = createRng(42).shuffled([1, 2, 3, 4, 5, 6, 7, 8]);
  const b = createRng(42).shuffled([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a, b);
});

test("fork with same label yields identical streams", () => {
  const a = createRng(1000).fork("names");
  const b = createRng(1000).fork("names");
  assert.deepEqual(
    Array.from({ length: 10 }, () => a.next()),
    Array.from({ length: 10 }, () => b.next()),
  );
});

test("fork with different labels yields different streams", () => {
  const root = createRng(1000);
  const a = root.fork("names");
  const b = root.fork("rivers");
  assert.notDeepEqual(
    Array.from({ length: 10 }, () => a.next()),
    Array.from({ length: 10 }, () => b.next()),
  );
});

test("fork is independent of parent draw position", () => {
  const early = createRng(77);
  const forkedEarly = early.fork("stage");

  const late = createRng(77);
  for (let i = 0; i < 5; i++) late.next();
  const forkedLate = late.fork("stage");

  assert.deepEqual(
    Array.from({ length: 10 }, () => forkedEarly.next()),
    Array.from({ length: 10 }, () => forkedLate.next()),
  );
});

test("hashString is deterministic and discriminating", () => {
  assert.equal(hashString("velmora"), hashString("velmora"));
  assert.notEqual(hashString("a"), hashString("b"));
  assert.notEqual(hashString("ab"), hashString("ba"));
  const h = hashString("anything");
  assert.ok(Number.isInteger(h) && h >= 0 && h <= 0xffffffff);
});
