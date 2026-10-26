import { test } from "node:test";
import assert from "node:assert/strict";
import { $ } from "../../src/site/shared/by-id.ts";

test("the shared id lookup hands back the element on the page, and throws naming the id it could not find (Issue #1012)", () => {
  const g = globalThis as Record<string, unknown>;
  const had = "document" in g;
  const prior = g.document;
  const found = { id: "pp-status" };
  g.document = { getElementById: (id: string) => (id === "pp-status" ? found : null) };
  try {
    assert.equal($("pp-status"), found, "an element on the page comes back as itself");
    assert.throws(() => $("pp-absent"), { message: /pp-absent/ }, "a missing element throws, naming the id it asked for");
  } finally {
    if (had) g.document = prior;
    else delete g.document;
  }
});
