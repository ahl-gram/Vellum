import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import {
  CULTURES,
  createNamer,
  makeMapTitle,
} from "../../src/society/names.ts";

test("there are at least four distinct cultures", () => {
  assert.ok(CULTURES.length >= 4);
  const ids = new Set(CULTURES.map((c) => c.id));
  assert.equal(ids.size, CULTURES.length);
});

test("namer is deterministic per seed", () => {
  const culture = CULTURES[0]!;
  const a = createNamer(createRng(42), culture);
  const b = createNamer(createRng(42), culture);
  for (let i = 0; i < 20; i++) {
    assert.equal(a.name("settlement"), b.name("settlement"));
  }
});

test("150 settlement names are unique, capitalized, and sane", () => {
  for (const culture of CULTURES) {
    const namer = createNamer(createRng(7), culture);
    const seen = new Set<string>();
    for (let i = 0; i < 150; i++) {
      const n = namer.name("settlement");
      assert.ok(!seen.has(n), `duplicate name: ${n}`);
      seen.add(n);
      assert.ok(n.length >= 3 && n.length <= 24, `bad length: "${n}"`);
      assert.equal(n[0], n[0]!.toUpperCase(), `not capitalized: ${n}`);
      assert.ok(!n.includes("  "), `double space in: ${n}`);
    }
  }
});

test("feature kinds produce flavored names", () => {
  const namer = createNamer(createRng(11), CULTURES[0]!);
  const river = namer.name("river");
  const sea = namer.name("sea");
  const peak = namer.name("peak");
  const forest = namer.name("forest");
  const realm = namer.name("realm");
  for (const n of [river, sea, peak, forest, realm]) {
    assert.ok(n.length >= 3);
    assert.equal(n[0], n[0]!.toUpperCase());
  }
  // each kind set is distinct
  assert.equal(new Set([river, sea, peak, forest, realm]).size, 5);
});

test("some settlement names carry a culture suffix", () => {
  const culture = CULTURES[0]!;
  const namer = createNamer(createRng(3), culture);
  let suffixed = 0;
  for (let i = 0; i < 100; i++) {
    const n = namer.name("settlement").toLowerCase();
    if (culture.townSuffixes.some((s) => n.endsWith(s))) suffixed++;
  }
  assert.ok(suffixed >= 10, `expected suffixes to appear, got ${suffixed}`);
});

test("map titles are deterministic and themed by map type", () => {
  const culture = CULTURES[1]!;
  const a = makeMapTitle(createRng(5), culture, "archipelago");
  const b = makeMapTitle(createRng(5), culture, "archipelago");
  assert.deepEqual(a, b);
  assert.ok(a.title.length > 5);
  assert.ok(a.subtitle.length > 10);
  assert.match(a.subtitle, /year \d+/i);

  const island = makeMapTitle(createRng(5), culture, "island");
  assert.notEqual(island.title, a.title);
});
