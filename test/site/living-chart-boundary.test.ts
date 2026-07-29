import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// #191 (Reading Room Sub 1): the living-chart machinery must be hostable by a page
// that is NOT the Explorer. Two things blocked that, and each has a guard here:
//   1. living-chart.ts, voyage.ts and voyage-log-panel.ts resolved
//      document.getElementById against Explorer ids at MODULE scope, so any second
//      host null-bound at import time. The proof of the fix is that Node, which has
//      no `document` at all, can import the engine and construct it against a
//      plain-object host: construction may only STORE the host's elements.
//   2. app.ts had grown to 670 lines (465 triggered #183); the conductor must come
//      back under the workspace 400-line guideline (.claude/rules/coding-style.md).

const REPO = resolve(import.meta.dirname, "..", "..");
const ENGINE_DIR = resolve(REPO, "src/site/living-chart");

test("the engine imports without a DOM: no module-scope document access (#191)", async () => {
  // Node has no `document`; a module-scope getElementById would throw right here.
  const mod = await import("../../src/site/living-chart/index.ts");
  assert.equal(typeof mod.createLivingChart, "function", "the boundary exports createLivingChart");
});

test("createLivingChart constructs against a plain-object host and exposes the full API (#191)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  // Plain empty objects, not DOM stubs: construction must only store the refs.
  // Every element access has to happen inside a method call, or a page host that
  // builds its DOM after wiring the engine would null-bind exactly like #191's bug.
  const el = (): HTMLElement => ({}) as unknown as HTMLElement;
  const lc = createLivingChart({
    mapEl: el(),
    statusEl: el(),
    scrubber: {
      panel: el(),
      playBtn: el() as HTMLButtonElement,
      range: el() as HTMLInputElement,
      year: el(),
      sig: el(),
      strip: el(),
    },
  });
  // The arm / step / paint / reset / teardown surface plus the e2e read hooks,
  // capability-complete for the Explorer today and the Reading Room's later subs
  // (#192 address, #219 frame, #220 fused instrument, #221 page).
  const api = [
    // #53 story cards
    "buildPlaceOverlay", "onDocKeydown", "onDocClick",
    // #220 the fused ages instrument
    "applyAges", "rearmAges", "exitAges", "clearAges",
    "agesSnapToRest", "agesState", "agesDragStart", "agesDragEnd",
    // #54 chronicle scrubber (chart side; the instrument names delegate to ages)
    "applyScrub", "exitScrub", "clearScrub", "cancelScrubRaf",
    "pauseScrub", "togglePlay", "onManualScrub", "scrubTo",
    "scrubSnapToPresent", "scrubState",
    // the Wayfarer's voyage
    "applyVoyage", "rearmVoyage", "exitVoyage", "clearVoyage", "cancelVoyageRaf",
    "voyageSnapToRest", "voyageStepTo", "voyagePaintAt",
    "voyagePlan", "voyageLog", "voyageLegGeometry", "syncRestingTrack",
    // lifecycle for an unmounting host
    "destroy",
  ] as const;
  for (const method of api) {
    assert.equal(typeof (lc as Record<string, unknown>)[method], "function", `the engine exposes ${method}()`);
  }
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
