import { test } from "node:test";
import assert from "node:assert/strict";
import { barlessHost, realWorld } from "../../test-support/living-chart-hosts.ts";
import { armShow, layHost } from "../../test-support/living-chart-no-bar-card-fixtures.ts";

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

  // A region inset renumbers its places (Issue #169), so a world-index link there would name the WRONG settlement.
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

test("LP1 the card carries the LAY press only on a world sheet whose host provides one, and it is a real button rather than a link (#522)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const host = layHost();
  const linked = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const press = walk(overlay).find((n) => n.classList.contains("pc-lay"));
  assert.ok(press, "a world-sheet card whose host has a table holds the press onto it");
  assert.equal(
    press.tagName,
    "BUTTON",
    "it acts on the sheet rather than going anywhere, so it is a button and takes no road dress",
  );
  assert.equal(press.type, "button", "untyped, it would submit any form the card ever lands in");
  assert.deepEqual(
    [...new Set(press.listeners)].sort(),
    ["click", "dblclick", "mousedown", "touchstart", "wheel"],
    "the card sits inside the zoom-bound gesture box, so the press stops d3's gesture events or a rapid double-press zooms the chart under the reader (the makeDogEar rule)",
  );

  // A region inset renumbers its places (Issue #242), so the world index a filing would carry names the WRONG settlement there.
  linked.lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const insets = linked.mount.children.filter((c) => c.classList.contains("place-overlay"));
  assert.ok(
    !walk(insets[insets.length - 1]!).some((n) => n.classList.contains("pc-lay")),
    "a region inset's renumbered card carries no filing press",
  );

  const bare = await barlessHost();
  bare.lc.buildPlaceOverlay(manifest);
  const bareOverlay = bare.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  assert.ok(
    !walk(bareOverlay).some((n) => n.classList.contains("pc-lay")),
    "a host with no table (the Reading Room) gets no press",
  );
});

test("LP2 the card's actions sit inside ONE .pc-acts row, the road to the Ribbon right under the way in to the prospect and the filing press last (#522; Issue #428, ruled 2026-11-02)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({
    prospectHref: (idx) => `/prospect/#i=${idx}`,
    ribbonHref: (idx) => `/ribbon/#a=${idx}`,
    layProspect: host.dep,
  });
  lc.buildPlaceOverlay(manifest);
  const overlay = mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  const acts = inner.children.filter((c) => c.classList.contains("pc-acts"));
  assert.equal(acts.length, 1, "exactly one action row, and it is a direct child of the card's inner");
  const names = acts[0]!.children.map((c) => String(c.className));
  assert.deepEqual(
    names,
    ["pc-prospect", "pc-ribbon", "pc-lay"],
    "the two roads together, then the press, in the ruled order",
  );
  assert.ok(
    !inner.children.some(
      (c) => c.classList.contains("pc-prospect") || c.classList.contains("pc-ribbon") || c.classList.contains("pc-lay"),
    ),
    "and no action is left a bare sibling of the prose",
  );
});

test("LP5 the card carries the road to the Ribbon only on a world sheet whose host provides one, and it is a real link named for what it opens (Issue #428)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const linked = await barlessHost({
    prospectHref: (idx) => `/prospect/#i=${idx}`,
    ribbonHref: (idx) => `/ribbon/#a=${idx}`,
  });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const road = walk(overlay).find((n) => n.classList.contains("pc-ribbon"));
  assert.ok(road, "a world-sheet card whose host has a Ribbon holds the road to it");
  assert.equal(road.tagName, "A", "a real link, not a button");
  assert.equal(road.textContent, "Take the road", "named for what it opens");

  linked.lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const overlays = linked.mount.children.filter((c) => c.classList.contains("place-overlay"));
  assert.ok(
    !walk(overlays[overlays.length - 1]!).some((n) => n.classList.contains("pc-ribbon")),
    "a region inset's renumbered card carries no road to the Ribbon",
  );

  const prospectOnly = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}` });
  prospectOnly.lc.buildPlaceOverlay(manifest);
  const plain = prospectOnly.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  assert.ok(
    !walk(plain).some((n) => n.classList.contains("pc-ribbon")),
    "a host with no Ribbon (the Reading Room) gets no road",
  );
});

test("LP3 the press's face and its refusal come from the HOST's table, and the press stays pressable when it refuses so a keyboard reader still meets it (#522, ruled 2026-09-17)", async () => {
  const { manifest } = await realWorld();

  const open = layHost();
  const a = await barlessHost({ layProspect: open.dep });
  a.lc.buildPlaceOverlay(manifest);
  const armedA = await armShow(a.mount);
  armedA.show(0);
  const pressA = armedA.press();
  assert.equal(pressA.textContent, "lay 0", "the face is the host's own line for THIS place, not a baked string");
  assert.ok(!pressA.classList.contains("dim"), "a table with room does not dim the press");

  const full = layHost({ refuses: true });
  const b = await barlessHost({ layProspect: full.dep });
  b.lc.buildPlaceOverlay(manifest);
  const armedB = await armShow(b.mount);
  armedB.show(0);
  const pressB = armedB.press();
  assert.equal(pressB.textContent, "No room on the table");
  assert.ok(pressB.classList.contains("dim"), "a refusing press dims");
  assert.equal(
    pressB.getAttribute("disabled"),
    null,
    "a refusing press is not disabled: that leaves the tab order, and the dog-ear's ruled shape stays pressable and answers",
  );
});

test("LP4 the press names the place the card is SHOWING, so a second card's press never files the first card's town (#522)", async () => {
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({ layProspect: host.dep });
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  assert.ok(armed.hits.length > 1, "seed 42 carries several places, so the wrong-index case is reachable");

  armed.show(0);
  assert.equal(armed.press().dataset["idx"], "0", "the press carries the shown place's index");
  armed.show(1);
  assert.equal(armed.press().dataset["idx"], "1", "and follows the card to the next place");
  armed.press().fire("click");
  assert.deepEqual(host.laid, [1], "so pressing files the place on screen, not the one before it");
});

const hrefOf = (el: object): unknown => (el as { href?: string }).href;

test("LP6 the road names the place the card is SHOWING and stands down where no road leaves it, coming back at the next place that has one (Issue #428)", async () => {
  const { manifest } = await realWorld();
  assert.equal(manifest.places[24]!.roads, false, "witness: seed 42's Tewetulua has no road");
  assert.equal(manifest.places[1]!.roads, true, "witness: seed 42's Paukilua has one");
  const { lc, mount } = await barlessHost({ ribbonHref: (idx) => `/ribbon/#a=${idx}` });
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  const road = armed.road();
  assert.ok(road, "the world-sheet card holds the road");

  armed.show(1);
  assert.equal(hrefOf(road), "/ribbon/#a=1", "the road names the shown place");
  assert.equal(road.style.display, "", "and shows where a road leaves it");
  armed.show(24);
  assert.equal(road.style.display, "none", "it stands down where none does");
  armed.show(1);
  assert.equal(road.style.display, "", "and comes back at the next place that has one");
  assert.equal(hrefOf(road), "/ribbon/#a=1");
});
