import test from "node:test";
import assert from "node:assert/strict";
import { createPlaceGate } from "../../src/site/explorer/place-gate.ts";
import type { PlaceText } from "../../src/site/explorer/place-source.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const A = placeId("ne-1159315211");

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function rig() {
  const loads = new Map<string, ReturnType<typeof deferred<PlaceText>>>();
  const gate = createPlaceGate((id) => {
    const d = deferred<PlaceText>();
    loads.set(id, d);
    return d.promise;
  });
  const record: string[] = [];
  const sender = (name: string) => (text: PlaceText | null) => {
    record.push(name + (text === null ? "" : `:${text.id}`));
    return Promise.resolve(name);
  };
  return { gate, loads, record, sender };
}

const drain = () => new Promise<void>((r) => setTimeout(r, 0));

test("a plain job with nothing waiting is sent in the same turn (Issue #854)", () => {
  const { gate, record, sender } = rig();
  void gate(null, sender("P"));
  assert.deepEqual(record, ["P"]);
});

test("a place job is sent with its text once it has arrived (Issue #854)", async () => {
  const { gate, loads, record, sender } = rig();
  const done = gate(A, sender("A"));
  await drain();
  assert.deepEqual(record, []);
  loads.get(A)?.resolve({ id: A, text: "t" });
  await done;
  assert.deepEqual(record, [`A:${A}`]);
});

test("a plain job behind a place still being fetched waits its turn (Issue #854)", async () => {
  const { gate, loads, record, sender } = rig();
  const a = gate(A, sender("A"));
  const b = gate(null, sender("B"));
  await drain();
  assert.deepEqual(record, [], "nothing goes before the place arrives");
  loads.get(A)?.resolve({ id: A, text: "t" });
  await Promise.all([a, b]);
  assert.deepEqual(record, [`A:${A}`, "B"]);
});

test("a failed fetch rejects its own job and the next still goes (Issue #854)", async () => {
  const { gate, loads, record, sender } = rig();
  const a = gate(A, sender("A"));
  const aOutcome = assert.rejects(a, /could not be fetched/);
  const b = gate(null, sender("B"));
  await drain();
  loads.get(A)?.reject(new Error("the outline of x could not be fetched"));
  await aOutcome;
  await b;
  assert.deepEqual(record, ["B"]);
});

test("once every place has arrived the gate is clear again (Issue #854)", async () => {
  const { gate, loads, record, sender } = rig();
  const a = gate(A, sender("A"));
  await drain();
  loads.get(A)?.resolve({ id: A, text: "t" });
  await a;
  await drain();
  void gate(null, sender("C"));
  assert.deepEqual(record, [`A:${A}`, "C"], "C was sent in the same turn it was asked");
});
