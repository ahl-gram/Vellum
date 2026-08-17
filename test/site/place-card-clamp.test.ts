import { test } from "node:test";
import assert from "node:assert/strict";
import { El, installShim, walk } from "../../test-support/element-shim.ts";
import { realWorld } from "../../test-support/living-chart-hosts.ts";

// #387/#388: clampOffset's arithmetic is pinned in test/render/place-card.test.ts; this file pins the half that is not arithmetic, that showing a card MEASURES it and publishes the nudge. The shim does no layout, so every rect here is stated rather than computed.

const CHART = { left: 0, top: 0, right: 342, bottom: 266 };

async function overlayOver(clampBox: (() => typeof CHART | null) | null) {
  const { manifest } = await realWorld(); // installs the shim
  installShim();
  const { createPlaceOverlay } = await import("../../src/site/living-chart/place-overlay.ts");
  const mapEl = new El("div");
  const overlay = createPlaceOverlay({
    mapEl: mapEl as unknown as HTMLElement,
    isSuppressed: () => false,
    ...(clampBox ? { clampBox: clampBox as unknown as () => typeof CHART } : {}),
  });
  overlay.buildPlaceOverlay(manifest);
  const nodes = walk(mapEl);
  const card = nodes.find((n) => n.getAttribute("id") === "place-card")!;
  const hits = nodes.filter((n) => n.classList.contains("place-hit"));
  // The shim answers "nothing here" to every query by design and must not grow into a selector engine, so this one lookup is stated, the same way the rects below are.
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  card.querySelector = ((sel: string) => (sel === ".pc-inner" ? inner : null)) as El["querySelector"];
  return { card, hits, overlay };
}

const published = (card: El) => ({
  dx: card.style.getPropertyValue("--pc-dx"),
  dy: card.style.getPropertyValue("--pc-dy"),
});

/** Show a card whose UNNUDGED box is `base`, and read back what the engine published. */
const shownWith = (card: El, hit: El, base: typeof CHART) => {
  // Measured THROUGH the published nudge, the way a browser does: a shim that ignores it cannot see a card measured against the previous card's offset.
  card.getBoundingClientRect = () => {
    const dx = parseFloat(card.style.getPropertyValue("--pc-dx")) || 0;
    const dy = parseFloat(card.style.getPropertyValue("--pc-dy")) || 0;
    return {
      left: base.left + dx, right: base.right + dx, top: base.top + dy, bottom: base.bottom + dy,
      width: base.right - base.left, height: base.bottom - base.top,
    };
  };
  hit.fire("focus");
  return published(card);
};

test("#387 a card measured off the bottom of the chart publishes the nudge that brings it back", async () => {
  const { card, hits } = await overlayOver(() => CHART);

  const nudge = shownWith(card, hits[0]!, { left: 80, top: 200, right: 254, bottom: 390 });

  assert.deepEqual(nudge, { dx: "0px", dy: "-124px" });
});

test("#388 a card measured off the side of the viewport publishes the nudge on the other axis", async () => {
  const { card, hits } = await overlayOver(() => CHART);

  const nudge = shownWith(card, hits[0]!, { left: -194, top: 40, right: -1, bottom: 160 });

  assert.deepEqual(nudge, { dx: "194px", dy: "0px" });
});

// The card element is REUSED across places (#128 keeps it stable so the unfurl replays cleanly).
test("#387/#388 the nudge is recomputed per show, never inherited from the card before it", async () => {
  const { card, hits } = await overlayOver(() => CHART);

  shownWith(card, hits[0]!, { left: 80, top: 200, right: 254, bottom: 390 });
  const second = shownWith(card, hits[1]!, { left: 40, top: 40, right: 214, bottom: 230 });

  assert.deepEqual(second, { dx: "0px", dy: "0px" });
});

test("#387/#388 a host that wires no box leaves the card exactly where cardSide anchored it", async () => {
  const { card, hits } = await overlayOver(null);

  const nudge = shownWith(card, hits[0]!, { left: 80, top: 200, right: 254, bottom: 390 });

  // The Reading Room passes none. Its card is permanently suppressed, and this must not become the one thing that positions it.
  assert.deepEqual(nudge, { dx: "", dy: "" });
});

test("#387/#388 a box the host cannot supply yet is not treated as an empty box at the origin", async () => {
  const { card, hits } = await overlayOver(() => null);

  const nudge = shownWith(card, hits[0]!, { left: 80, top: 200, right: 254, bottom: 390 });

  // Clamping into a 0x0 box at (0,0) would drag every card to the top-left corner of the page.
  assert.deepEqual(nudge, { dx: "0px", dy: "0px" });
});

// The redraft path shows its preserved pin from INSIDE buildPlaceOverlay, before the Explorer has published the counter-scale onto the fresh card, so measured there the card is k times too large.
test("#387/#388 an open card is re-measured on demand, so a stale nudge cannot outlive its geometry", async () => {
  let box = CHART;
  const { card, hits, overlay } = await overlayOver(() => box);

  const opened = shownWith(card, hits[0]!, { left: 80, top: 40, right: 254, bottom: 160 });
  box = { left: 0, top: 0, right: 342, bottom: 120 };
  overlay.reclampCard();

  assert.deepEqual(opened, { dx: "0px", dy: "0px" }, "the card fitted the box it was opened against");
  assert.deepEqual(published(card), { dx: "0px", dy: "-40px" }, "the box moved under an open card and the nudge did not follow");
});

test("#387/#388 re-clamping a card nobody opened does nothing at all", async () => {
  const { card, overlay } = await overlayOver(() => CHART);

  overlay.reclampCard();

  // It runs on every camera apply, so a hidden card must cost nothing and must not publish a nudge that a later show would be measured through.
  assert.deepEqual(published(card), { dx: "", dy: "" });
});

test("#387/#388 the host's box reaches the card through createLivingChart, not only the overlay", async () => {
  const { manifest } = await realWorld();
  installShim();
  const { createLivingChart } = await import("../../src/site/living-chart/index.ts");
  const mapEl = new El("div");
  const lc = createLivingChart({
    mapEl: mapEl as unknown as HTMLElement,
    statusEl: new El("p") as unknown as HTMLElement,
    clampBox: () => CHART as unknown as ReturnType<NonNullable<Parameters<typeof createLivingChart>[0]["clampBox"]>>,
  });
  lc.buildPlaceOverlay(manifest);

  const nodes = walk(mapEl);
  const card = nodes.find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  card.querySelector = ((sel: string) => (sel === ".pc-inner" ? inner : null)) as El["querySelector"];
  const hit = nodes.find((n) => n.classList.contains("place-hit"))!;

  // The engine spreads the box in conditionally, and dropping that one line costs every real host its clamp.
  assert.deepEqual(shownWith(card, hit, { left: 80, top: 200, right: 254, bottom: 390 }), { dx: "0px", dy: "-124px" });
});
