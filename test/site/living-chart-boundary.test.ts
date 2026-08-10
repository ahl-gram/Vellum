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

// #319 (Survey & Story Sub 2) added a third thing the boundary owes: the bar itself is
// OPTIONAL. A host may mount the engine for its overlays and the static resting track
// and hand in no scrubber at all, so Sub 4's static Explorer need not ship hidden dead
// controls to assistive tech to satisfy a type. The instrument surface then answers as
// silent no-ops (ratified 2026-08-09 on #319) while the chart side stays fully live.

const REPO = resolve(import.meta.dirname, "..", "..");
const ENGINE_DIR = resolve(REPO, "src/site/living-chart");

// The arm / step / paint / reset / teardown surface plus the e2e read hooks,
// capability-complete for the Explorer today and the Reading Room's later subs
// (#192 address, #219 frame, #220 fused instrument, #221 page). #319 pins this list
// for BOTH host shapes: a bar-less host gets the same 33 names, not a second surface,
// and the optional bar earns no new method (the instrument-less arm-at-rest entry the
// static host calls is rearmVoyage, which has been here since #191).
const API = [
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

const assertFullApi = (lc: unknown, shape: string): void => {
  for (const method of API) {
    assert.equal(
      typeof (lc as Record<string, unknown>)[method],
      "function",
      `the engine exposes ${method}() (${shape})`,
    );
  }
};

/**
 * A chart mount holding NOTHING, for the #319 tests that CALL into a bar-less engine
 * rather than only constructing it. This is deliberately not a selector engine: every
 * query answers "the mount is empty", which is exactly true of a host that has never
 * drawn, so no assertion here can rest on a hand-rolled matcher being right. It records
 * what was ASKED, which is how a teardown that silently skips a chart-side step becomes
 * visible (a pure no-op exitAges asks nothing).
 */
function emptyMount(): { el: HTMLElement; asked: string[] } {
  const asked: string[] = [];
  const mount = {
    querySelector: (sel: string) => {
      asked.push(sel);
      return null;
    },
    querySelectorAll: (sel: string) => {
      asked.push(sel);
      return [] as unknown[];
    },
  };
  return { el: mount as unknown as HTMLElement, asked };
}

/**
 * A recording stand-in for one of the ages driver's two chamber painters. Every property
 * answers as a function that logs its own name, so a test can assert the EXACT set of
 * delegations a member makes, including the empty set. These are the driver's injected
 * collaborators, never the module under test.
 */
function recordingChamber(): { calls: string[]; as<T>(): T } {
  const calls: string[] = [];
  const proxy = new Proxy(
    {},
    { get: (_t, prop: string) => () => calls.push(prop) },
  );
  return { calls, as: <T,>() => proxy as T };
}

/**
 * A scrubber whose elements record what was written to them. Enough to tell the REAL
 * instrument and journal apart from the stand-ins without a DOM: createAges clears the
 * bar's aria-valuetext on exit and the real log panel empties the strip and the signature,
 * and no-bar.ts does neither.
 */
function recordingBar(): { bar: Record<string, unknown>; writes: string[] } {
  const writes: string[] = [];
  const node = (name: string) => ({
    hidden: undefined as boolean | undefined,
    textContent: undefined as string | undefined,
    min: "",
    max: "",
    step: "",
    replaceChildren: () => writes.push(`${name}.replaceChildren`),
    removeAttribute: (attr: string) => writes.push(`${name}.removeAttribute:${attr}`),
    setAttribute: (attr: string) => writes.push(`${name}.setAttribute:${attr}`),
    appendChild: () => writes.push(`${name}.appendChild`),
  });
  return {
    writes,
    bar: {
      panel: node("panel"),
      playBtn: node("playBtn"),
      range: node("range"),
      year: node("year"),
      sig: node("sig"),
      strip: node("strip"),
    },
  };
}

/** The host's optional verso surface (#174), recording so a clear is provable. */
function recordingSink(): { sink: { paint(p: string, v: string): void; clear(): void }; calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    sink: {
      paint: (p: string, v: string) => calls.push(`paint:${p}|${v}`),
      clear: () => calls.push("clear"),
    },
  };
}

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
  assertFullApi(lc, "a host with a full scrubber");
});

test("createLivingChart constructs against a host with NO scrubber: the bar is optional (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  // The same plain-empty-object discipline as the test above: construction may only
  // STORE refs. What is new is the ABSENT scrubber. Before #319 this threw a TypeError
  // reading 'panel' at the createVoyageLogPanel call, because the engine reached
  // through host.scrubber while wiring, so a bar-less host could not exist at all.
  const el = (): HTMLElement => ({}) as unknown as HTMLElement;
  const lc = createLivingChart({ mapEl: el(), statusEl: el() });
  // The SAME surface, not a narrower one: one boundary, one host type (ratified).
  assertFullApi(lc, "a host with no scrubber");
});

test("the bar-less instrument surface is silent no-ops, and never throws (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mount = emptyMount();
  const { sink, calls } = recordingSink();
  const lc = createLivingChart({ mapEl: mount.el, statusEl: {} as unknown as HTMLElement, restingTrackSink: sink });

  // Ratified 2026-08-09: silent no-ops, never a throw. A host that never wires Play
  // cannot press it, so a throw would add a failure mode with no reachable trigger.
  // Every instrument-side entry is exercised, including the two the ratification's
  // list omitted (clearAges, which the Explorer calls on EVERY draw, and exitAges,
  // which destroy() routes through).
  const noThrow = (label: string, fn: () => void) => assert.doesNotThrow(fn, `${label} is a silent no-op`);
  noThrow("applyAges", () => lc.applyAges(null, null, 42, ""));
  noThrow("rearmAges", () => lc.rearmAges(null, null, 42, ""));
  noThrow("agesSnapToRest", () => lc.agesSnapToRest());
  noThrow("agesDragStart", () => lc.agesDragStart());
  noThrow("agesDragEnd", () => lc.agesDragEnd());
  noThrow("togglePlay", () => lc.togglePlay());
  noThrow("onManualScrub", () => lc.onManualScrub());
  noThrow("cancelScrubRaf", () => lc.cancelScrubRaf());
  noThrow("pauseScrub", () => lc.pauseScrub());
  noThrow("scrubTo", () => lc.scrubTo(1200));
  noThrow("scrubSnapToPresent", () => lc.scrubSnapToPresent());
  noThrow("clearAges", () => lc.clearAges());
  noThrow("exitAges", () => lc.exitAges());

  // The instrument reads answer "off", which is what makes the composed entries in
  // index.ts route to their CHART-side halves without any bar-less special casing:
  // agesState() null keeps the address writer and the e2e hooks null-tolerant, and
  // isActive() false is what sends scrubTo to chronicle.scrubTo and syncRestingTrack
  // to the raw voyage.syncRestingTrack.
  assert.equal(lc.agesState(), null, "there is no instrument state to read");
  assert.equal(lc.scrubState(), null, "no scrub session exists on an undrawn mount");

  // The chart side is LIVE, not stubbed: with no session the raw voyage sync clears the
  // host's verso surface. This is the one resting-track behaviour reachable without a
  // DOM, and it is the proof that syncRestingTrack took the voyage path rather than the
  // ages driver's rest-aware one.
  calls.length = 0;
  lc.syncRestingTrack();
  assert.deepEqual(calls, ["clear"], "the resting track clears through the host's sink");
});

test("destroy() on a bar-less host still tears down the chart side (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mount = emptyMount();
  const { sink, calls } = recordingSink();
  const lc = createLivingChart({ mapEl: mount.el, statusEl: {} as unknown as HTMLElement, restingTrackSink: sink });

  mount.asked.length = 0;
  calls.length = 0;
  lc.destroy();

  // destroy() routes through exitAges, so a bar-less exitAges that no-oped ENTIRELY
  // would leave an unmounting host's voyage overlay in the mount and its ink on the
  // verso forever. The instrument half of exitAges is what goes silent; the two chamber
  // painters it tears down are chart-side and must still run. Asserted positively, by
  // what the teardown ASKED the mount and what it did to the sink, so deleting either
  // delegation goes red here rather than passing as "did not throw".
  assert.ok(
    mount.asked.some((s) => s.includes(".voyage-overlay")),
    "the voyage overlay is removed from the mount (voyage.exitVoyage ran)",
  );
  assert.ok(
    mount.asked.some((s) => s.includes(".place-overlay")),
    "the place overlay nodes are removed from the mount (overlay.teardown ran)",
  );
  assert.deepEqual(calls, ["clear"], "the verso sink's ink leaves with the front of the sheet");
});

test("the bar-less ages driver delegates EXACTLY the two chart-side teardowns (#319)", async () => {
  const { barlessAges } = await import("../../src/site/living-chart/no-bar.ts");

  // The whole substance of the bar-less driver is WHICH members stay silent and which
  // still reach the chamber painters. Through the engine's public surface that split is
  // invisible on an undrawn mount (both delegations are no-ops with no session), so it is
  // pinned here, on the module, against its own injected collaborators. A blanket-no-op
  // clearAges passes every other test in this file; it fails this one.
  const ledger = (drive: (a: ReturnType<typeof barlessAges>) => void): string[] => {
    const chronicle = recordingChamber();
    const voyage = recordingChamber();
    drive(barlessAges({ chronicle: chronicle.as(), voyage: voyage.as() }));
    return [...chronicle.calls, ...voyage.calls];
  };

  // The Explorer calls clearAges after EVERY draw whose instrument is off, so this is the
  // hot path: swallowing it leaks a stale chronicle session and the voyage overlay once
  // per redraw on a host that never had a bar.
  assert.deepEqual(ledger((a) => a.clearAges()), ["clearScrub", "clearVoyage"], "clearAges clears both chambers");
  // destroy() reaches the chamber painters through here.
  assert.deepEqual(ledger((a) => a.exitAges()), ["exitScrub", "exitVoyage"], "exitAges exits both chambers");

  // Everything else is the INSTRUMENT, and touches neither painter. syncSinkAtRest is in
  // this list on purpose: index.ts gates it behind isActive(), so on a bar-less engine it
  // is unreachable, and it must not acquire a delegation that would then be dead code
  // pretending to be behaviour.
  for (const [name, drive] of [
    ["armAges", (a: ReturnType<typeof barlessAges>) => a.armAges(null, null, 42, "")],
    ["syncSinkAtRest", (a: ReturnType<typeof barlessAges>) => a.syncSinkAtRest()],
    ["snapToRest", (a: ReturnType<typeof barlessAges>) => a.snapToRest()],
    ["scrubToYear", (a: ReturnType<typeof barlessAges>) => a.scrubToYear(1200)],
    ["togglePlay", (a: ReturnType<typeof barlessAges>) => a.togglePlay()],
    ["onBarInput", (a: ReturnType<typeof barlessAges>) => a.onBarInput()],
    ["pause", (a: ReturnType<typeof barlessAges>) => a.pause()],
    ["cancelRaf", (a: ReturnType<typeof barlessAges>) => a.cancelRaf()],
    ["dragStart", (a: ReturnType<typeof barlessAges>) => a.dragStart()],
    ["dragEnd", (a: ReturnType<typeof barlessAges>) => a.dragEnd()],
  ] as const) {
    assert.deepEqual(ledger(drive), [], `${name} touches neither chamber painter`);
  }
});

test("a host WITH a scrubber still gets the REAL instrument and journal, not the stand-ins (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mount = emptyMount();
  const { bar, writes } = recordingBar();
  const lc = createLivingChart({
    mapEl: mount.el,
    statusEl: {} as unknown as HTMLElement,
    scrubber: bar as unknown as Parameters<typeof createLivingChart>[0]["scrubber"],
  });

  // #319's branch decides which modules a host gets, and picking the stand-in for a FULL
  // host would silently strip the Explorer's and the room's instrument and journal. Until
  // now only the e2e suites could see that: these two writes are the cheapest DOM-free
  // fingerprints of the real modules, taken on the one teardown reachable with no session.
  lc.exitAges();
  assert.ok(
    writes.includes("range.removeAttribute:aria-valuetext"),
    "the real createAges is wired: only it clears the bar's aria-valuetext on exit",
  );
  assert.ok(
    writes.includes("strip.replaceChildren"),
    "the real createVoyageLogPanel is wired: only it empties the journal strip on hide",
  );
  assert.equal(
    (bar.sig as { textContent?: string }).textContent,
    "",
    "and clears the surveyor's signature line",
  );
  assert.equal((bar.panel as { hidden?: boolean }).hidden, true, "and the instrument panel is hidden");
});

test("the bar-less journal keeps the survey's prose and reports no rendered rows (#319)", async () => {
  const { barlessLogPanel } = await import("../../src/site/living-chart/no-bar.ts");
  // No scrubber means no journal PANEL, but the log itself is world data the voyage
  // still needs: paintFrame posts log.summary to the status line on a live completion,
  // and voyageLog() is an e2e read hook. So the stand-in builds the REAL log and skips
  // only the DOM. It must do that without a `document`, which is why this runs in Node.
  const panel = barlessLogPanel();
  const { log, rows } = panel.buildLogPanel(
    [
      { idx: 0, name: "Aelmoor", kind: "town", founded: 300, arrivalMode: null, inlandHandoff: false, legLength: 0 },
      { idx: 1, name: "Cairn Hollow", kind: "town", founded: 420, arrivalMode: "road", inlandHandoff: false, legLength: 44 },
    ],
    1059,
    42,
    "as surveyed by Taiki the Wayfarer",
  );
  assert.equal(rows.length, 0, "no rows are rendered: there is no strip to render them into");
  assert.ok(log.attribution.length > 0, "the surveyor's attribution is real world data");
  assert.equal(log.entries.length, 2, "both ports are logged");

  const snap = panel.logSnapshot(log, rows);
  assert.equal(snap.attribution, log.attribution, "the read hook carries the real prose");
  assert.equal(snap.summary, log.summary, "and the real summary");
  assert.equal(snap.entries.length, 2, "and the real entries");
  assert.equal(snap.rows, 0, "with no rendered rows");
  assert.equal(snap.logged, 0, "none revealed");
  assert.equal(snap.visible, false, "and no visible panel");

  assert.doesNotThrow(() => panel.revealLog(rows, 2), "revealing rows that do not exist is a no-op");
  assert.doesNotThrow(() => panel.hideLog(), "hiding a panel that does not exist is a no-op");
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
