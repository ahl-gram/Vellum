import test from "node:test";
import assert from "node:assert/strict";
import { createNameLoader } from "../../src/site/explorer/place-names.ts";
import type { Fetched } from "../../src/site/explorer/place-fetch.ts";

const reply = (ok: boolean, status: number, body = ""): Fetched => ({ ok, status, text: async () => body });
const ONE = '[["ne-1","A","lake",""]]';

test("the index is fetched once and handed on (Issue #854)", async () => {
  let calls = 0;
  const load = createNameLoader(async () => {
    calls += 1;
    return reply(true, 200, ONE);
  });
  const [a, b] = await Promise.all([load(), load()]);
  assert.equal(calls, 1);
  assert.deepEqual(a, [["ne-1", "A", "lake", ""]]);
  assert.equal(a, b);
});

test("a failed fetch rejects with the reason and the next load tries again (Issue #854)", async () => {
  const answers = [reply(false, 404), reply(true, 200, ONE)];
  let calls = 0;
  const load = createNameLoader(async () => answers[calls++] as Fetched);
  await assert.rejects(load(), /^Error: the gazetteer could not be fetched \(404\)/);
  assert.equal((await load()).length, 1);
  assert.equal(calls, 2);
});

test("a fetcher that throws rejects the same way (Issue #854)", async () => {
  const load = createNameLoader(async () => {
    throw new TypeError("offline");
  });
  await assert.rejects(load(), /^Error: the gazetteer could not be fetched/);
});
