import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { API, bareEl } from "../../test-support/living-chart-hosts.ts";

// The engine must be hostable by a page that is NOT the Explorer (#191) and the bar is OPTIONAL (#319): document-less Node can import and construct it. Bar-less BEHAVIOUR lives in living-chart-no-bar.test.ts; this file stays DOM-free so the import proof keeps its meaning.

const REPO = resolve(import.meta.dirname, "..", "..");
const ENGINE_DIR = resolve(REPO, "src/site/living-chart");

const assertFullApi = (lc: unknown, shape: string): void => {
  const returned = Object.keys(lc as Record<string, unknown>);
  for (const method of API) {
    assert.equal(
      typeof (lc as Record<string, unknown>)[method],
      "function",
      `the engine exposes ${method}() (${shape})`,
    );
  }
  // Both directions, so the roster catches an ADDED entry too: #319's contract is that the optional bar earns no new method.
  assert.deepEqual(
    returned.filter((k) => !(API as readonly string[]).includes(k)),
    [],
    `${shape}: no engine method is missing from the shared roster`,
  );
  assert.equal(returned.length, API.length, `${shape}: the surface is exactly ${API.length} names`);
};

test("the engine imports without a DOM: no module-scope document access (#191)", async () => {
  assert.equal(typeof (globalThis as { document?: unknown }).document, "undefined", "no DOM is installed here");
  const mod = await import("../../src/site/living-chart/index.ts");
  assert.equal(typeof mod.createLivingChart, "function", "the boundary exports createLivingChart");
});

test("createLivingChart constructs against a plain-object host and exposes the full API (#191)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  // Plain empty objects, not DOM stubs: every element access must happen inside a method call, or a host that builds its DOM after wiring null-binds exactly like #191's bug.
  const lc = createLivingChart({
    mapEl: bareEl(),
    statusEl: bareEl(),
    scrubber: {
      panel: bareEl(),
      playBtn: bareEl() as HTMLButtonElement,
      range: bareEl() as HTMLInputElement,
      year: bareEl(),
      sig: bareEl(),
      strip: bareEl(),
    },
  });
  assertFullApi(lc, "a host with a full scrubber");
});

test("createLivingChart constructs against a host with NO scrubber: the bar is optional (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const lc = createLivingChart({ mapEl: bareEl(), statusEl: bareEl() });
  assertFullApi(lc, "a host with no scrubber");
});

test("the engine addresses only host-supplied elements: no getElementById in src/site/living-chart (#191)", () => {
  const files = readdirSync(ENGINE_DIR).filter((f) => f.endsWith(".ts"));
  assert.ok(files.length >= 2, "the engine is a small cohesive set of modules");
  for (const f of files) {
    const src = readFileSync(resolve(ENGINE_DIR, f), "utf8");
    assert.doesNotMatch(
      src,
      /getElementById/,
      `${f} must not look elements up by id: ids are the host's namespace, the host passes elements in`,
    );
  }
});

test("the Explorer no longer carries a welded copy of the machinery (#191)", () => {
  for (const old of [
    "src/site/explorer/living-chart.ts",
    "src/site/explorer/voyage.ts",
    "src/site/explorer/voyage-log-panel.ts",
  ]) {
    assert.ok(!existsSync(resolve(REPO, old)), `${old} must not exist: the engine lives in src/site/living-chart/`);
  }
});

test("app.ts is back under the 400-line guideline: the conductor stays wiring (#191)", () => {
  const lines = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8").trimEnd().split("\n").length;
  assert.ok(lines <= 400, `app.ts is ${lines} lines; the 400-line guideline is this sub's ratified acceptance`);
});
