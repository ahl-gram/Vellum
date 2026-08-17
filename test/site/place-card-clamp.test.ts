import { test } from "node:test";
import assert from "node:assert/strict";
import { El, installShim, walk } from "../../test-support/element-shim.ts";
import { realWorld } from "../../test-support/living-chart-hosts.ts";

// #387/#388: clampOffset's arithmetic is pinned in test/render/place-card.test.ts. This file pins
// the half that is not arithmetic: that showing a card MEASURES it against the host's box and
// publishes the nudge, and that a host wiring no box gets the old behavior untouched.
// The shim does no layout, so every rect here is stated rather than computed.

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

/** Show a card whose measured box is `rect`, and read back what the engine published. */
const shownWith = (card: El, hit: El, rect: typeof CHART) => {
  card.rect = rect;
  hit.fire("focus");
  return { dx: card.style.getPropertyValue("--pc-dx"), dy: card.style.getPropertyValue("--pc-dy") };
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

test("#387/#388 the nudge is recomputed per show, never inherited from the card before it", async () => {
  const { card, hits } = await overlayOver(() => CHART);

  shownWith(card, hits[0]!, { left: 80, top: 200, right: 254, bottom: 390 });
  const second = shownWith(card, hits[1]!, { left: 40, top: 40, right: 214, bottom: 160 });

  // The card element is REUSED across places (#128 keeps it stable so the unfurl replays cleanly),
  // so a nudge left standing would move a card that fits, and it would be measured through it too.
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
