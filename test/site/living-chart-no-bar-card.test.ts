import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { barlessHost, realWorld } from "../../test-support/living-chart-hosts.ts";

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

// #522 Sub 4: the card's SECOND action, injected on the same terms as the prospect link.
// The shim's querySelector answers null by design, so showing a card needs the .pc-inner stub place-card-clamp.test.ts already uses.
const armShow = async (mount: { children: unknown[] }) => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const overlay = (mount.children as ReturnType<typeof walk>).find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  card.querySelector = ((sel: string) => (sel === ".pc-inner" ? inner : null)) as typeof card.querySelector;
  const hits = walk(overlay).filter((n) => n.classList.contains("place-hit"));
  return {
    hits,
    show: (at: number) => { hits[at]!.fire("focus"); },
    press: () => walk(overlay).find((n) => n.classList.contains("pc-lay"))!,
  };
};

const layHost = (over: { refuses?: boolean } = {}) => {
  const laid: number[] = [];
  return {
    laid,
    dep: {
      state: (idx: number) => ({ label: over.refuses ? "No room on the table" : `lay ${idx}`, refuses: !!over.refuses }),
      lay: (idx: number) => { laid.push(idx); },
    },
  };
};

test("LP1 the card carries the LAY press only on a world sheet whose host provides one, and it is a real button rather than a link (#522)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const host = layHost();
  const linked = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const press = walk(overlay).find((n) => n.classList.contains("pc-lay"));
  assert.ok(press, "a world-sheet card whose host has a table holds the press onto it");
  assert.equal(press.tagName, "BUTTON", "it acts on the sheet rather than going anywhere, so it is a button and takes no road dress");
  assert.equal(press.type, "button", "untyped, it would submit any form the card ever lands in");
  assert.deepEqual(
    [...new Set(press.listeners)].sort(),
    ["click", "dblclick", "mousedown", "touchstart", "wheel"],
    "the card sits inside the zoom-bound gesture box, so the press stops d3's gesture events or a rapid double-press zooms the chart under the reader (the makeDogEar rule)",
  );

  // A region inset renumbers its places (#242), so the world index a filing would carry names the WRONG settlement there.
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

test("LP2 both actions sit inside ONE .pc-acts row, so Issue #428's third action joins a row that already exists rather than re-laying the card out (#522)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  lc.buildPlaceOverlay(manifest);
  const overlay = mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  const acts = inner.children.filter((c) => c.classList.contains("pc-acts"));
  assert.equal(acts.length, 1, "exactly one action row, and it is a direct child of the card's inner");
  const names = acts[0]!.children.map((c) => String(c.className));
  assert.deepEqual(names, ["pc-prospect", "pc-lay"], "both actions are the row's children, in the ruled stills' order");
  assert.ok(
    !inner.children.some((c) => c.classList.contains("pc-prospect") || c.classList.contains("pc-lay")),
    "and neither action is left a bare sibling of the prose",
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
  assert.equal(pressB.getAttribute("disabled"), null, "a refusing press is not disabled: that leaves the tab order, and the dog-ear's ruled shape stays pressable and answers");
  const overlaySrc = readFileSync(
    new URL("../../src/site/living-chart/place-overlay.ts", import.meta.url),
    "utf8",
  ).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  assert.doesNotMatch(overlaySrc, /\bdisabled\b/, "and nothing in the overlay may reach for disabled, which is the form that silently drops the press out of the tab order");
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
