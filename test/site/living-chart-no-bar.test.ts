import { test } from "node:test";
import assert from "node:assert/strict";
import {
  barlessHost,
  emptyMount,
  realWorld,
  recordingBar,
  recordingChamber,
  recordingSink,
} from "../../test-support/living-chart-hosts.ts";

// #319 (Survey & Story Sub 2): how the living chart BEHAVES for a host that hands in no
// scrubber. Sub 4's static Explorer mounts the engine for its overlays and the static
// resting track and has no bar, no Play, no readout and no journal; without the optional
// boundary it would have to ship hidden dead controls to assistive tech to satisfy a type.
//
// The split this file exists to pin, ratified 2026-08-09 on #319: the INSTRUMENT surface
// goes silently inert (no-ops, never a throw) while the CHART side stays fully live. The
// construction half of the boundary lives in living-chart-boundary.test.ts, which stays
// DOM-free on purpose; this file installs the shared element shim, because proving the
// chart side runs means actually running it.

test("the bar-less instrument surface is silent no-ops, and never throws (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mount = emptyMount();
  const { sink, calls } = recordingSink();
  const lc = createLivingChart({ mapEl: mount.el, statusEl: {} as unknown as HTMLElement, restingTrackSink: sink });

  // A host that never wires Play cannot press it, so a throw would add a failure mode with
  // no reachable trigger. Every instrument-side entry is exercised, including the two the
  // ratification's list did not name: clearAges, which the Explorer calls on EVERY draw,
  // and exitAges, which destroy() routes through.
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

  // The instrument reads answer "off", which is what lets the composed entries in index.ts
  // route to their CHART-side halves with no bar-less special casing: agesState() null keeps
  // the address writer and the e2e hooks on their existing null paths, and isActive() false
  // is what sends scrubTo to chronicle.scrubTo and syncRestingTrack to the raw voyage sync.
  assert.equal(lc.agesState(), null, "there is no instrument state to read");
  assert.equal(lc.scrubState(), null, "no scrub session exists on an undrawn mount");

  // The chart side is LIVE, not stubbed: with no session the raw voyage sync clears the
  // host's verso surface, which is the proof syncRestingTrack took the voyage path rather
  // than the ages driver's rest-aware one.
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

  // destroy() routes through exitAges, so a bar-less exitAges that no-oped ENTIRELY would
  // leave an unmounting host's voyage overlay in the mount and its ink on the verso forever.
  // The instrument half of exitAges is what goes silent; the two chamber painters it tears
  // down are chart-side and must still run. Asserted positively, so deleting either
  // delegation goes red here rather than passing as "did not throw".
  //
  // SCOPE, precisely: these two assert that the teardown REACHED the mount and asked it for
  // the nodes it removes, not that a node came off. This harness answers every query with
  // "the mount is empty" by design (see element-shim.ts), so the `.remove()` calls at
  // voyage.ts:301 and place-overlay.ts:220 are not reachable in any unit test and are
  // covered by e2e. What is proven here is that the delegation ran at all, which is the one
  // thing #319 could get wrong; the exact delegation set is pinned by the module ledger below.
  assert.ok(
    mount.asked.some((s) => s.includes(".voyage-overlay")),
    "the teardown asked the mount for the voyage overlay (voyage.exitVoyage ran)",
  );
  assert.ok(
    mount.asked.some((s) => s.includes(".place-overlay")),
    "and for the place overlay nodes (overlay.teardown ran)",
  );
  assert.deepEqual(calls, ["clear"], "the verso sink's ink leaves with the front of the sheet");
});

test("the bar-less ages driver delegates EXACTLY the two chart-side teardowns (#319)", async () => {
  const { barlessAges } = await import("../../src/site/living-chart/no-bar.ts");

  // The whole substance of the bar-less driver is WHICH members stay silent and which still
  // reach the chamber painters. Through the engine's public surface that split is invisible
  // on an undrawn mount (both delegations no-op with no session), so it is pinned here, on
  // the module, against its own injected collaborators. A blanket-no-op clearAges passes
  // every other test in this file; it fails this one.
  const ledger = (drive: (a: ReturnType<typeof barlessAges>) => void): string[] => {
    const chronicle = recordingChamber();
    const voyage = recordingChamber();
    drive(barlessAges({ chronicle: chronicle.as(), voyage: voyage.as() }));
    return [...chronicle.calls, ...voyage.calls];
  };

  // The Explorer calls clearAges after EVERY draw whose instrument is off, so this is the
  // hot path: swallowing it leaks a stale chronicle session and the voyage overlay once per
  // redraw on a host that never had a bar.
  assert.deepEqual(ledger((a) => a.clearAges()), ["clearScrub", "clearVoyage"], "clearAges clears both chambers");
  // destroy() reaches the chamber painters through here.
  assert.deepEqual(ledger((a) => a.exitAges()), ["exitScrub", "exitVoyage"], "exitAges exits both chambers");

  // Everything else is the INSTRUMENT, and touches neither painter. syncSinkAtRest is in
  // this list on purpose: index.ts gates it behind isActive(), so on a bar-less engine it is
  // unreachable, and it must not acquire a delegation that would then be dead code
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
  // host would silently strip the Explorer's and the room's instrument and journal. Before
  // this test only the e2e suites could see that: these are the cheapest DOM-free
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
  assert.equal((bar.sig as { textContent?: string }).textContent, "", "and clears the surveyor's signature line");
  assert.equal((bar.panel as { hidden?: boolean }).hidden, true, "and the instrument panel is hidden");
});

test("a bar-less host BUILDS the place overlay over the baked chart (#319)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();
  const { lc, mount } = await barlessHost();

  lc.buildPlaceOverlay(manifest);

  // The overlay is a real child of the mount, with one focusable hit per place, each
  // positioned by its manifest fraction and labelled for AT. The #53 story-card layer runs
  // in full on a host that has no instrument at all.
  const overlay = mount.children.find((c) => c.classList.contains("place-overlay"));
  assert.ok(overlay, "the place overlay is appended to the host's mount");
  const hits = walk(overlay).filter((n) => n.classList.contains("place-hit"));
  assert.equal(hits.length, manifest.places.length, "one hit-target per place in the manifest");
  assert.ok(manifest.places.length > 1, "seed 42 really does carry several places");
  const first = hits[0]!;
  assert.equal(first.dataset.idx, "0", "the hit carries its manifest index");
  assert.match(first.getAttribute("aria-label") ?? "", /\w/, "the hit is labelled for assistive tech");
  assert.equal(first.getAttribute("aria-describedby"), "place-card", "and described by the one card");
  assert.match(first.style.left ?? "", /%$/, "positioned by fraction, so it aligns at any width");
  assert.match(first.style.top ?? "", /%$/);
  assert.deepEqual(
    [...new Set(first.listeners)].sort(),
    ["blur", "click", "focus", "mouseenter", "mouseleave"],
    "hover / focus / tap are all wired",
  );
  // The one reused parchment card rides INSIDE the overlay (#169: its % anchor must resolve
  // against the same box the fractions describe).
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card");
  assert.ok(card, "the card is built inside the overlay");
  assert.equal(card.hidden, true, "and starts hidden");
});

test("a bar-less host PAINTS and clears the resting voyage track (#319)", async () => {
  const { manifest, survey } = await realWorld();
  const { lc, mount, calls } = await barlessHost();

  // rearmVoyage is the instrument-less arm-at-rest entry, already on the surface since #191,
  // which is why this sub adds no method. It rests on the FULL track at t=1 and, being
  // non-quiet, mirrors it to the host's sink.
  lc.rearmVoyage(manifest, survey, 42, "as surveyed by Taiki the Wayfarer");

  // The svg carries its class as an ATTRIBUTE (setAttribute("class"), the SVG idiom in
  // voyage-session.ts), not through className like the HTML place overlay does.
  const svg = mount.children.find((c) => c.getAttribute("class") === "voyage-overlay");
  assert.ok(svg, "the voyage overlay svg is appended to the mount");
  assert.equal(svg.getAttribute("aria-hidden"), "true", "the track is decorative: the log carries the a11y payload");
  assert.ok(
    svg.children.some((c) => c.getAttribute("class") === "voyage-track"),
    "with the track polyline as a child",
  );
  const plan = lc.voyagePlan();
  assert.ok(plan && plan.ports.length > 1, "a real itinerary was routed");

  assert.equal(calls.length, 1, "the resting track mirrored to the host's sink exactly once");
  const [kind, payload] = calls[0]!.split(":");
  assert.equal(kind, "paint", "and it PAINTED, rather than clearing");
  const [points, viewBox] = payload!.split("|");
  // A real track, not the degenerate origin point a synthetic fixture would have produced.
  const verts = points!.trim().split(/\s+/);
  assert.ok(verts.length > 2, `the painted track has ${verts.length} vertices, not a single point`);
  for (const v of verts) assert.match(v, /^-?[\d.]+,-?[\d.]+$/, "every vertex is an x,y pair");
  assert.equal(viewBox, `0 0 1500 ${manifest.heightPx}`, "the sink is told the chart's own viewBox");

  // ...and the same host CLEARS the resting track, with no instrument anywhere in the path.
  // "Clears" here is the resting track proper: the sink mirror and the session. Taking the
  // svg node itself off the sheet needs a mount that can answer a query, which this harness
  // deliberately cannot (see the destroy test), so that half is e2e's; the node is expected
  // to still be a child below, and saying so keeps the gap visible rather than implied.
  calls.length = 0;
  lc.exitVoyage();
  assert.deepEqual(calls, ["clear"], "the ink leaves the back of the sheet");
  assert.equal(lc.voyagePlan(), null, "and the session is dropped");
  assert.ok(
    mount.children.includes(svg),
    "the svg is still parented HERE, because this mount cannot resolve exitVoyage's query: " +
      "node removal is e2e's to prove, and this assertion exists so nobody reads the test " +
      "title as covering it",
  );
});

test("the bar-less scrubTo still reaches the chronicle's static reveal (#319)", async () => {
  const { manifest } = await realWorld();
  const { lc } = await barlessHost();

  // The ratification lists scrubTo among the no-ops; index.ts routes it to the chronicle
  // whenever the instrument is inactive, which on a bar-less engine is always. Without this
  // test a future session could read the ratification literally, make the whole entry inert,
  // and stay green: chronicle.scrubTo is itself silent with no session, so "does not throw"
  // cannot tell the two apart.
  lc.buildPlaceOverlay(manifest);
  lc.applyScrub();
  const armed = lc.scrubState();
  assert.ok(armed, "the chronicle arms on a bar-less host: the chart side is fully live");
  assert.ok(armed.max > armed.min, "with a real year range");

  const target = armed.min + Math.round((armed.max - armed.min) / 3);
  lc.scrubTo(target);
  assert.equal(lc.scrubState()?.year, target, "scrubTo moved the chronicle's year");
  assert.notEqual(lc.scrubState()?.year, armed.year, "which is a real change, not a no-op");
  assert.equal(lc.agesState(), null, "and it did so with no instrument in the path");
});

test("the bar-less journal keeps the survey's prose and reports no rendered rows (#319)", async () => {
  const { barlessLogPanel } = await import("../../src/site/living-chart/no-bar.ts");
  // No scrubber means no journal PANEL, but the log itself is world data the voyage still
  // needs: paintFrame posts log.summary to the status line on a live completion, and
  // voyageLog() is an e2e read hook. So the stand-in builds the REAL log and skips only the
  // DOM, which it must do with no `document` at all.
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

test("the bar-less journal's log is identical to the rendering panel's (#319)", async () => {
  const [{ barlessLogPanel }, { createVoyageLogPanel }, { El }] = await Promise.all([
    import("../../src/site/living-chart/no-bar.ts"),
    import("../../src/site/living-chart/voyage-log-panel.ts"),
    import("../../test-support/element-shim.ts"),
  ]);
  await realWorld(); // the shim: the REAL panel builds rows and needs a document

  // The stand-in re-states the real panel's argument normalization (seed >>> 0,
  // subtitle || ""). Nothing else pins that parity, and drift there would silently give a
  // bar-less host different prose and a different status summary for the SAME world.
  const ports = [
    { idx: 0, name: "Aelmoor", kind: "town" as const, founded: 300, arrivalMode: null, inlandHandoff: false, legLength: 0 },
    { idx: 1, name: "Cairn Hollow", kind: "town" as const, founded: 420, arrivalMode: "road" as const, inlandHandoff: false, legLength: 44 },
  ];
  const real = createVoyageLogPanel({
    panel: new El("div") as unknown as HTMLElement,
    sig: new El("p") as unknown as HTMLElement,
    strip: new El("ol") as unknown as HTMLElement,
  });
  const bare = barlessLogPanel();

  // Including the paths the normalization exists for: a negative seed and 2**31, which
  // >>> 0 maps into the unsigned domain buildVoyageLog's RNG fork expects.
  for (const seed of [42, 0, -7, 2 ** 31]) {
    const a = real.buildLogPanel(ports, 1059, seed, "as surveyed by Taiki", null);
    const b = bare.buildLogPanel(ports, 1059, seed, "as surveyed by Taiki", null);
    assert.deepEqual(b.log, a.log, `the same log for seed ${seed}, prose included`);
    assert.ok(a.rows.length > 0, "the real panel renders rows");
    assert.equal(b.rows.length, 0, "the stand-in renders none");
  }
  assert.deepEqual(
    bare.buildLogPanel(ports, 1059, 42, "", null).log,
    real.buildLogPanel(ports, 1059, 42, "", null).log,
    "and for an absent subtitle",
  );
});
