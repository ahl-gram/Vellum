import { test } from "node:test";
import assert from "node:assert/strict";
import { rowText } from "../../src/site/ribbon/row-text.ts";

test("a waypoint row sets the place in strong and its rank in the italic; every other row is the caption alone", () => {
  assert.deepEqual(rowText({ kind: "waypoint", leagues: 0, text: "Laukuwelua", tier: "capital", index: 0, nx: 0.2, ny: 0.9 }), { strong: "Laukuwelua", em: "the capital" });
  assert.deepEqual(rowText({ kind: "waypoint", leagues: 32, text: "Noloatatani", tier: "town", index: 5, nx: 0.4, ny: 0.5 }), { strong: "Noloatatani", em: "a fair town" });
  assert.deepEqual(rowText({ kind: "waypoint", leagues: 82, text: "Homaitani", index: 22, nx: 0.8, ny: 0.2 }), { strong: "Homaitani", em: "" }, "no tier, no rank line");
  assert.deepEqual(rowText({ kind: "branch", leagues: 1, text: "to Wuwatau", nx: 0.2, ny: 0.88 }), { strong: null, em: "to Wuwatau" });
  assert.deepEqual(rowText({ kind: "summit", leagues: 62, text: "here the road climbs", nx: 0.6, ny: 0.4 }), { strong: null, em: "here the road climbs" });
  assert.deepEqual(rowText({ kind: "crossing", leagues: 49, text: "a ford", nx: 0.5, ny: 0.5 }), { strong: null, em: "a ford" });
});
