import { test } from "node:test";
import assert from "node:assert/strict";
import { bounce, leaveBlank } from "../../e2e/support/nav.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const recorder = () => {
  const sent: string[] = [];
  const send = ((method: string, params?: Record<string, unknown>): Promise<unknown> => {
    sent.push(`${method} ${String(params?.["url"])}`);
    return Promise.resolve({});
  }) as unknown as SuiteContext["send"];
  return { sent, send };
};

test("bounce sends the page to about:blank and then to the address, so a hash-only change still re-boots the page", async () => {
  const { sent, send } = recorder();
  await bounce(send, "http://127.0.0.1:8765/explorer/#seed=7");
  assert.deepEqual(sent, ["Page.navigate about:blank", "Page.navigate http://127.0.0.1:8765/explorer/#seed=7"]);
});

test("leaveBlank sends the page to about:blank and nowhere after, the page a suite leaves behind or hands to a helper that navigates itself", async () => {
  const { sent, send } = recorder();
  await leaveBlank(send);
  assert.deepEqual(sent, ["Page.navigate about:blank"]);
});
