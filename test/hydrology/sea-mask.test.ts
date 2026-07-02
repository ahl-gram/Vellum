import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { seaMask } from "../../src/hydrology/sea-mask.ts";

test("seaMask marks border-connected water but not inland lakes", () => {
  const W = 20, H = 16, seaLevel = 0;
  // left column = sea (touches the border); a landlocked block = a lake
  const isSea = (x: number) => x <= 1;
  const isLake = (x: number, y: number) => x >= 10 && x <= 14 && y >= 6 && y <= 10;
  const elev = createField(W, H, (x, y) => (isSea(x) || isLake(x, y) ? -1 : 1));
  const sea = seaMask(elev, seaLevel);
  const at = (x: number, y: number) => sea[x + y * W];

  assert.equal(at(0, 8), 1, "border sea should be marked");
  assert.equal(at(12, 8), 0, "an inland lake is not the sea");
  assert.equal(at(5, 8), 0, "land is not the sea");
});

test("seaMask floods diagonally-blocked but 4-connected water", () => {
  // a one-cell-wide channel from the border must still count as sea
  const W = 12, H = 12, seaLevel = 0;
  const isChannel = (x: number, y: number) => y === 5 && x <= 8; // reaches from x=0 border
  const elev = createField(W, H, (x, y) => (isChannel(x, y) ? -1 : 1));
  const sea = seaMask(elev, seaLevel);
  assert.equal(sea[8 + 5 * W], 1, "far end of a border channel is still sea");
  assert.equal(sea[8 + 4 * W], 0, "the land beside the channel is not sea");
});
