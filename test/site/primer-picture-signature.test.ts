import test from "node:test";
import assert from "node:assert/strict";
import { chartSignature, signatureFaults, type Signature } from "../../scripts/build/primer-pictures/signature.ts";

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" aria-label="Chart of A &amp; B" data-vellum-seed="42" data-vellum-founding-text="a &quot;sea&quot;"><g id="layer-ocean"/><g id="other"/><g id="layer-legend"><g id="layer-inner"/></g></svg>';

const SIGNATURE: Signature = {
  stamp: { "data-vellum-founding-text": 'a "sea"', "data-vellum-seed": "42" },
  label: "Chart of A & B",
  layers: ["layer-ocean", "layer-legend", "layer-inner"],
};

test("PIC6 a chart's signature is its root's stamp, its label and its layer ids, read as the browser reads them", () => {
  assert.deepEqual(chartSignature(SVG), SIGNATURE);
});

test("PIC7 two signatures agree only when stamp, label and layers all do, and each difference is named", () => {
  assert.deepEqual(signatureFaults(SIGNATURE, SIGNATURE), []);
  assert.deepEqual(
    signatureFaults(SIGNATURE, { ...SIGNATURE, stamp: { ...SIGNATURE.stamp, "data-vellum-seed": "7" } }),
    ['data-vellum-seed "7", the picture\'s "42"'],
  );
  const label = signatureFaults(SIGNATURE, { ...SIGNATURE, label: "x" });
  assert.equal(label.length, 1);
  assert.match(label[0] ?? "", /^label /);
  const layers = signatureFaults(SIGNATURE, { ...SIGNATURE, layers: ["layer-ocean"] });
  assert.equal(layers.length, 1);
  assert.match(layers[0] ?? "", /^layers /);
  assert.deepEqual(signatureFaults(SIGNATURE, null), ["the room shows no chart"]);
});
