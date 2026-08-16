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

// #319: a host that hands in no scrubber. The ratified split (2026-08-09 comment on #319): the INSTRUMENT surface goes silently inert while the CHART side stays fully live.
// The construction half lives in living-chart-boundary.test.ts (DOM-free on purpose); this file installs the element shim because proving the chart side runs means running it.

test("the bar-less instrument surface is silent no-ops, and never throws (#319)", async () => {
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mount = emptyMount();
  const { sink, calls } = recordingSink();
  const lc = createLivingChart({ mapEl: mount.el, statusEl: {} as unknown as HTMLElement, restingTrackSink: sink });

  // A throw would add a failure mode with no reachable trigger; clearAges and exitAges are exercised too, though the ratification's list did not name them.
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

  // The "off" reads are what let index.ts route composed entries to their chart-side halves with no bar-less special casing.
  assert.equal(lc.agesState(), null, "there is no instrument state to read");
  assert.equal(lc.scrubState(), null, "no scrub session exists on an undrawn mount");

  // With no session the raw voyage sync clears the verso: proof syncRestingTrack took the voyage path, not the ages driver's rest-aware one.
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

  // destroy() routes through exitAges: the instrument half goes silent, but the two chart-side chamber teardowns must still run; asserted positively so a deleted delegation reds here.
  // SCOPE: this proves the teardown ASKED the mount, not that a node came off; the shim answers every query with "empty" by design, so node removal is e2e's to prove (#364's voyage-session-mount.test.ts covers the builder's removal).
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

  // Through the public surface the split is invisible on an undrawn mount, so it is pinned on the module against its injected collaborators; a blanket-no-op clearAges fails only here.
  const ledger = (drive: (a: ReturnType<typeof barlessAges>) => void): string[] => {
    const chronicle = recordingChamber();
    const voyage = recordingChamber();
    drive(barlessAges({ chronicle: chronicle.as(), voyage: voyage.as() }));
    return [...chronicle.calls, ...voyage.calls];
  };

  // The Explorer calls clearAges after EVERY draw with the instrument off: swallowing it leaks a stale session and overlay once per redraw.
  assert.deepEqual(ledger((a) => a.clearAges()), ["clearScrub", "clearVoyage"], "clearAges clears both chambers");
  assert.deepEqual(ledger((a) => a.exitAges()), ["exitScrub", "exitVoyage"], "exitAges exits both chambers");

  // syncSinkAtRest is here on purpose: index.ts gates it behind isActive(), so on a bar-less engine it must not acquire a dead delegation.
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

  // Picking the stand-in for a FULL host would silently strip the instrument and journal; these are the cheapest DOM-free fingerprints of the real modules.
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
  // The card rides INSIDE the overlay (#169): its % anchor must resolve against the same box the fractions describe.
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card");
  assert.ok(card, "the card is built inside the overlay");
  assert.equal(card.hidden, true, "and starts hidden");
});

test("the place card carries the prospect way in only on a world sheet whose host provides one (#242)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const linked = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}` });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const link = walk(overlay).find((n) => n.classList.contains("pc-prospect"));
  assert.ok(link, "a world-sheet card holds the way in to the prospect page");
  assert.equal(link.tagName, "A", "and it is a real link, not a button");
  assert.match(link.textContent, /prospect/i, "named for what it opens");

  // A region inset renumbers its places (#169), so a world-index link there would name the WRONG settlement.
  linked.lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const overlays = linked.mount.children.filter((c) => c.classList.contains("place-overlay"));
  const inset = overlays[overlays.length - 1]!;
  assert.ok(
    !walk(inset).some((n) => n.classList.contains("pc-prospect")),
    "a region inset's renumbered card carries no prospect link",
  );

  const bare = await barlessHost();
  bare.lc.buildPlaceOverlay(manifest);
  const bareOverlay = bare.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  assert.ok(
    !walk(bareOverlay).some((n) => n.classList.contains("pc-prospect")),
    "a host with no prospect surface (the Reading Room) gets no link",
  );
});

test("a bar-less host PAINTS and clears the resting voyage track (#319)", async () => {
  const { manifest, survey } = await realWorld();
  const { lc, mount, calls } = await barlessHost();

  // rearmVoyage (on the surface since #191, so this sub adds no method): rests on the FULL track at t=1 and, non-quiet, mirrors it to the host's sink.
  lc.rearmVoyage(manifest, survey, 42, "as surveyed by Taiki the Wayfarer");

  // The svg carries its class as an ATTRIBUTE (the SVG idiom), not through className like the HTML overlay.
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
  const verts = points!.trim().split(/\s+/);
  assert.ok(verts.length > 2, `the painted track has ${verts.length} vertices, not a single point`);
  for (const v of verts) assert.match(v, /^-?[\d.]+,-?[\d.]+$/, "every vertex is an x,y pair");
  assert.equal(viewBox, `0 0 1500 ${manifest.heightPx}`, "the sink is told the chart's own viewBox");

  // "Clears" = the sink mirror and the session; taking the svg node off needs a query this harness deliberately cannot answer, so that half is e2e's.
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

  // The ratification lists scrubTo among the no-ops, but index.ts routes it to the chronicle when the instrument is inactive; "does not throw" cannot tell an inert entry apart, hence this test.
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
  // No scrubber means no PANEL, but the log is world data the voyage still needs (status line, e2e hook), so the stand-in builds the REAL log and skips only the DOM.
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

  // The stand-in re-states the real panel's argument normalization (seed >>> 0, subtitle || ""); nothing else pins that parity.
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

  // Includes a negative seed and 2**31, the paths >>> 0 exists for.
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
