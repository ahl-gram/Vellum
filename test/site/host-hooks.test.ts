import { test } from "node:test";
import assert from "node:assert/strict";
import { HOST_HOOK_NAMES, installHostHooks } from "../../src/site/shared/host-hooks.ts";

type Deps = Parameters<typeof installHostHooks>[0];

test("installHostHooks puts every named seam on the window as a function (Issue #1273, from e2e RS2)", () => {
  const g = globalThis as Record<string, unknown>;
  const [had, prior] = ["window" in g, g.window];
  const w: Record<string, unknown> = {};
  g.window = w;
  try {
    const seam = () => null;
    const livingChart = new Proxy({}, { get: () => seam });
    installHostHooks({ livingChart, runInline: seam } as unknown as Deps);
    const names: readonly string[] = HOST_HOOK_NAMES;
    assert.ok(names.length > 1, "the roster this test sweeps is the installer's own");
    assert.deepEqual(
      names.filter((name) => typeof w[name] !== "function"),
      [],
      "a seam the installer names is missing from the window",
    );
  } finally {
    if (had) g.window = prior;
    else delete g.window;
  }
});
