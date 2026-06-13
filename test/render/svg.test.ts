import { test } from "node:test";
import assert from "node:assert/strict";
import {
  el,
  renderSvg,
  escapeXml,
  pathFrom,
} from "../../src/render/svg.ts";
import { createProjection } from "../../src/render/transform.ts";
import { labelCandidates } from "../../src/render/layers/settlements.ts";

test("escapeXml handles the five specials", () => {
  assert.equal(
    escapeXml(`<a & "b" 'c'>`),
    "&lt;a &amp; &quot;b&quot; &apos;c&apos;&gt;",
  );
});

test("el + renderSvg nests and escapes", () => {
  const node = el("g", { id: "layer-x", "stroke-width": 2 }, [
    el("text", {}, ["Tide & Salt"]),
  ]);
  const s = renderSvg(node);
  assert.equal(
    s,
    `<g id="layer-x" stroke-width="2"><text>Tide &amp; Salt</text></g>`,
  );
});

test("self-closing tags when empty", () => {
  assert.equal(renderSvg(el("rect", { x: 0, y: 1 })), `<rect x="0" y="1"/>`);
});

test("pathFrom emits rounded coordinates and closes rings", () => {
  const open = pathFrom([[1.23456, 2], [3, 4.98765]], false);
  assert.equal(open, "M1.23 2L3 4.99");
  const closed = pathFrom([[0, 0], [10, 0], [10, 10]], true);
  assert.equal(closed, "M0 0L10 0L10 10Z");
});

test("pathFrom rejects NaN coordinates", () => {
  assert.throws(() => pathFrom([[NaN, 1], [2, 3]], false), /NaN/);
});

test("labelCandidates offers 8 distinct positions, east first", () => {
  const cands = labelCandidates(100, 50, 12, 8);
  assert.equal(cands.length, 8);
  assert.equal(cands[0]!.anchor, "start");
  assert.ok(cands[0]!.x > 100, "first candidate sits east of the glyph");
  const keys = new Set(cands.map((c) => `${c.x},${c.y},${c.anchor}`));
  assert.equal(keys.size, 8, "candidates must be distinct");
  for (const c of cands) {
    assert.ok(["start", "middle", "end"].includes(c.anchor));
  }
});

test("projection maps grid corners to the framed map area", () => {
  const p = createProjection(321, 241, 1500, 60);
  assert.equal(p.px(0), 60);
  assert.equal(p.px(320), 1440);
  assert.equal(p.py(0), 60);
  // aspect preserved: 240 cells * scale + margins
  const scale = (1500 - 120) / 320;
  assert.ok(Math.abs(p.py(240) - (60 + 240 * scale)) < 1e-9);
  assert.ok(Math.abs(p.heightPx - (120 + 240 * scale)) < 1e-9);
  assert.equal(p.scale, scale);
});
