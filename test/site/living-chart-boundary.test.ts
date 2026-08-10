import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { API, bareEl } from "../../test-support/living-chart-hosts.ts";

// #191 (Reading Room Sub 1): the living-chart machinery must be hostable by a page
// that is NOT the Explorer. Two things blocked that, and each has a guard here:
//   1. living-chart.ts, voyage.ts and voyage-log-panel.ts resolved
//      document.getElementById against Explorer ids at MODULE scope, so any second
//      host null-bound at import time. The proof of the fix is that Node, which has
//      no `document` at all, can import the engine and construct it against a
//      plain-object host: construction may only STORE the host's elements.
//   2. app.ts had grown to 670 lines (465 triggered #183); the conductor must come
//      back under the workspace 400-line guideline (.claude/rules/coding-style.md).
//
// #319 (Survey & Story Sub 2) added a third thing the boundary owes: the bar itself is
// OPTIONAL, so a host may mount the engine for its overlays and the static resting track
// and hand in no scrubber at all. The CONSTRUCTION half of that lives here, beside its
// full-scrubber twin. Everything about how a bar-less engine BEHAVES lives in
// living-chart-no-bar.test.ts, which needs an environment and a world; this file stays
// deliberately DOM-free so guard 1 above keeps its meaning.

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
  // Both directions, so the roster catches an ADDED entry as well as a missing one: #319's
  // contract is that the optional bar earns no new method, and a one-directional roll-call
  // could not see one appear.
  assert.deepEqual(
    returned.filter((k) => !(API as readonly string[]).includes(k)),
    [],
    `${shape}: no engine method is missing from the shared roster`,
  );
  assert.equal(returned.length, API.length, `${shape}: the surface is exactly ${API.length} names`);
};

test("the engine imports without a DOM: no module-scope document access (#191)", async () => {
  // Node has no `document`; a module-scope getElementById would throw right here.
  // The assertion is a contract, not decoration: nothing in THIS file may install the
  // element shim, or the import below stops proving the engine is DOM-free at load.
  assert.equal(typeof (globalThis as { document?: unknown }).document, "undefined", "no DOM is installed here");
  const mod = await import("../../src/site/living-chart/index.ts");
  assert.equal(typeof mod.createLivingChart, "function", "the boundary exports createLivingChart");
});

test("createLivingChart constructs against a plain-object host and exposes the full API (#191)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  // Plain empty objects, not DOM stubs: construction must only store the refs.
  // Every element access has to happen inside a method call, or a page host that
  // builds its DOM after wiring the engine would null-bind exactly like #191's bug.
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
  // The same plain-empty-object discipline as the test above. What is new is the ABSENT
  // scrubber. Before #319 this threw a TypeError reading 'panel' at the
  // createVoyageLogPanel call, because the engine reached through host.scrubber while
  // wiring, so a bar-less host could not be constructed at all.
  const lc = createLivingChart({ mapEl: bareEl(), statusEl: bareEl() });
  // The SAME surface, not a narrower one: one boundary, one host type (ratified 2026-08-09).
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
