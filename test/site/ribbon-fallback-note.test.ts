import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { fallbackNote, type RibbonAsk } from "../../src/site/ribbon/fallback-note.ts";
import type { World } from "../../src/world/types.ts";

const w42 = generateWorld(defaultRecipe(42));
const w2 = generateWorld(defaultRecipe(2));
const noteFor = (world: World, ask: RibbonAsk) =>
  fallbackNote(ask, ribbonResultFor(world, { ...ask, dress: "antique" }));
const drawn = (world: World, ask: RibbonAsk) => ribbonResultFor(world, { ...ask, dress: "antique" });

const DEPARTURE = "No road leaves Tewetulua; this is the road from the capital.";
const FROM_CAPITAL = "The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua.";

test("an address that asks nothing the roads refuse gets no note, an absent destination included", () => {
  assert.equal(typeof drawn(w42, { from: 1, to: null }).toIdx, "number", "an absent destination still draws one");
  const asks: RibbonAsk[] = [
    { from: null, to: null },
    { from: 1, to: null },
    { from: 0, to: null },
    { from: 1, to: 22 },
    { from: 0, to: 22 },
    { from: 7, to: 17 },
  ];
  for (const ask of asks) assert.equal(noteFor(w42, ask), null, JSON.stringify(ask));
});

test("a departure no road leaves is named, and the road drawn is the capital's", () => {
  const res = drawn(w42, { from: 24, to: null });
  assert.equal(res.options[24]!.roads, false);
  assert.equal(res.options[24]!.name, "Tewetulua");
  assert.equal(res.fromIdx, 0, "the drawn departure is the capital's index");
  assert.equal(noteFor(w42, { from: 24, to: null }), DEPARTURE);
});

test("a destination the road drawn cannot reach is named, on a roadless place and on another network", () => {
  assert.equal(noteFor(w42, { from: null, to: 24 }), FROM_CAPITAL);
  const res = drawn(w2, { from: 0, to: 19 });
  assert.equal(res.options[19]!.roads, true, "Bri has a road of its own");
  assert.notEqual(res.toIdx, 19, "and the capital's road does not reach it");
  assert.equal(
    noteFor(w2, { from: 0, to: 19 }),
    "The road cannot take you to Bri; this is the road to the farthest place from Vunsvyov.",
  );
});

test("a road asked to end where it sets out takes the same sentence", () => {
  assert.equal(
    noteFor(w42, { from: 1, to: 1 }),
    "The road cannot take you to Paukilua; this is the road to the farthest place from Paukilua.",
  );
});

test("both refusals read as one note, the departure's first, and the destination is measured from the road drawn", () => {
  assert.equal(noteFor(w42, { from: 24, to: 24 }), `${DEPARTURE} ${FROM_CAPITAL}`);
  assert.equal(
    noteFor(w42, { from: 24, to: 0 }),
    `${DEPARTURE} The road cannot take you to Laukuwelua; this is the road to the farthest place from Laukuwelua.`,
  );
});

test("an index that names no place is no request, as the address grammar treats a value it cannot read", () => {
  assert.equal(drawn(w42, { from: 9999, to: null }).options.length, 26);
  assert.equal(drawn(w42, { from: 9999, to: null }).fromIdx, 0, "the drawn departure is the capital's");
  assert.equal(noteFor(w42, { from: 9999, to: null }), null);
  assert.equal(noteFor(w42, { from: null, to: 9999 }), null);
  assert.equal(noteFor(w42, { from: 26, to: null }), null);
  assert.equal(noteFor(w42, { from: -1, to: null }), null);
  assert.equal(noteFor(w42, { from: null, to: 1.5 }), null);
});
