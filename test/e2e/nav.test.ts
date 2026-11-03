import { test } from "node:test";
import assert from "node:assert/strict";
import { bounce } from "../../e2e/support/nav.ts";
import type { SuiteContext } from "../../e2e/types.ts";

test("bounce sends the page to about:blank and then to the address, so a hash-only change still re-boots the page", async () => {
  const sent: string[] = [];
  const send = ((method: string, params?: Record<string, unknown>): Promise<unknown> => {
    sent.push(`${method} ${String(params?.["url"])}`);
    return Promise.resolve({});
  }) as unknown as SuiteContext["send"];
  await bounce(send, "http://127.0.0.1:8765/explorer/#seed=7");
  assert.deepEqual(sent, ["Page.navigate about:blank", "Page.navigate http://127.0.0.1:8765/explorer/#seed=7"]);
});
