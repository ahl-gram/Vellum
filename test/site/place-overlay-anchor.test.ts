import { test } from "node:test";
import assert from "node:assert/strict";
import { walk } from "../../test-support/element-shim.ts";
import { barlessHost, realWorld } from "../../test-support/living-chart-hosts.ts";
import { armShow } from "../../test-support/living-chart-no-bar-card-fixtures.ts";

const lastOverlay = (mount: { children: unknown[] }) =>
  (mount.children as ReturnType<typeof walk>).filter((c) => c.classList.contains("place-overlay")).at(-1)!;

test("a region inset's hits stand at the sheet's own fractions, the box folded in, and its overlay fills the mount (Issue #751)", async () => {
  const { manifest } = await realWorld();
  const { lc, mount } = await barlessHost();
  lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const overlay = lastOverlay(mount);
  assert.equal(overlay.style.left ?? "", "", "the overlay is not placed at the box");
  assert.equal(overlay.style.width ?? "", "", "nor sized to it");
  const hits = walk(overlay).filter((n) => n.classList.contains("place-hit"));
  assert.equal(hits.length, manifest.places.length, "one hit a place");
  manifest.places.forEach((p, i) => {
    assert.equal(hits[i]!.style.getPropertyValue("--nx"), String(0.25 + p.nx * 0.5), `place ${i} x`);
    assert.equal(hits[i]!.style.getPropertyValue("--ny"), String(0.25 + p.ny * 0.5), `place ${i} y`);
    assert.equal(hits[i]!.style.left ?? "", "", "and by no fractional offset");
  });
});

test("a region inset's card anchors at the same folded fraction and flips by the place's own (Issue #751)", async () => {
  const { manifest } = await realWorld();
  const { lc, mount } = await barlessHost();
  lc.buildPlaceOverlay(manifest, { box: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 } });
  const armed = await armShow(mount);
  const i = manifest.places.findIndex((p) => p.nx > 0.5 && p.nx <= 0.8);
  assert.notEqual(
    i,
    -1,
    "a place whose own fraction flips the card left, where the folded one (0.5 or less) would not",
  );
  const p = manifest.places[i]!;
  armed.hits[i]!.fire("mouseenter", { clientX: -100, clientY: -100 });
  const card = walk(lastOverlay(mount)).find((n) => n.getAttribute("id") === "place-card")!;
  assert.equal(card.style.getPropertyValue("--pc-nx"), String(0.1 + p.nx * 0.5));
  assert.equal(card.style.getPropertyValue("--pc-ny"), String(0.1 + p.ny * 0.5));
  assert.ok(card.classList.contains("flip-h"), "the flip is chosen from the place's own fraction");
});
