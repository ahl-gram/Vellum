import { test } from "node:test";
import assert from "node:assert/strict";
import { createMinHeap } from "../../src/core/heap.ts";

test("pops indices in ascending value order", () => {
  const h = createMinHeap();
  h.push(10, 5.0);
  h.push(20, 1.0);
  h.push(30, 3.0);
  h.push(40, 0.5);
  assert.equal(h.pop(), 40);
  assert.equal(h.pop(), 20);
  assert.equal(h.pop(), 30);
  assert.equal(h.pop(), 10);
});

test("size tracks pushes and pops; pop on empty throws", () => {
  const h = createMinHeap();
  assert.equal(h.size(), 0);
  h.push(1, 1);
  h.push(2, 2);
  assert.equal(h.size(), 2);
  h.pop();
  assert.equal(h.size(), 1);
  h.pop();
  assert.throws(() => h.pop(), RangeError);
});

test("handles interleaved push/pop and many items", () => {
  const h = createMinHeap();
  const vals: number[] = [];
  let x = 12345;
  for (let i = 0; i < 500; i++) {
    x = (x * 1103515245 + 12345) % 2147483647;
    const v = x / 2147483647;
    vals.push(v);
    h.push(i, v);
    if (i % 7 === 0 && h.size() > 1) h.pop();
  }
  let prev = -Infinity;
  const remaining = h.size();
  for (let i = 0; i < remaining; i++) {
    const idx = h.pop();
    const v = vals[idx] as number;
    assert.ok(v >= prev - 1e-12, "heap order violated");
    prev = v;
  }
});
