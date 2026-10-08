import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { eraFor } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { plateSurroundings } from "../../src/prospect/surroundings.ts";

const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  const cached = worlds.get(seed);
  if (cached) return cached;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
}

function keyOf(seed: number, index: number, year?: number): string[] {
  const w = worldFor(seed);
  const y = year ?? w.title.year;
  const input = buildProspectInput(w, index);
  const era = eraFor(input, y);
  const g =
    era === "before-founding"
      ? composeProspect(input, { era })
      : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  return plateKey(g, { input, surroundings: plateSurroundings(w, index, y), era }).map(
    (k) => `${k.letter}. ${k.label}`,
  );
}

test("the key names the composed town and then the world, numbered, as the ruled stills read", () => {
  assert.deepEqual(
    keyOf(42, 0),
    [
      "1. The Keep",
      "2. The Quay",
      "3. The Mole",
      "4. The Great Woaku",
      "5. The Waters of Lalo",
      "6. The road to Haireno",
      "7. The road to Nanawotani",
    ],
    "the capital",
  );
  assert.deepEqual(
    keyOf(42, 4),
    ["1. The Quay", "2. The Great Woaku", "3. The road to Poalo", "4. In the Ratoa Atolls"],
    "Nailo",
  );
  assert.deepEqual(
    keyOf(42, 10),
    ["1. The Jetty", "2. The Great Woaku", "3. River Naikai", "4. In the Chiefdom of Rekekoa"],
    "Lokai",
  );
  assert.deepEqual(keyOf(42, 22), ["1. The Great Woaku", "2. In the Hauwaiwa Atolls"], "Homaitani, ruined");
  assert.deepEqual(
    keyOf(26, 22),
    ["1. The Weir Mill", "2. The Weir", "3. The Matali Run", "4. The Spires of Nini", "5. In the Realm of Theal"],
    "Voorea",
  );
  assert.deepEqual(
    keyOf(42, 0, 400),
    ["1. The Great Woaku", "2. The Waters of Lalo"],
    "the capital before its founding: the bare ground keys the world alone",
  );
});

test("the sea beast in the bay is named in the key where the plate surfaces it", () => {
  assert.ok(keyOf(7, 6).includes("5. Kaipu, the Weed That Wakes"), JSON.stringify(keyOf(7, 6)));
});

test("over whole worlds the key stays within its rules: at most eight, the sea only at a harbour, the realm never on a capital", () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const w = worldFor(seed);
    w.settlements.forEach((s, i) => {
      const key = keyOf(seed, i);
      assert.ok(key.length <= 8, `seed ${seed} index ${i}: ${key.length} entries`);
      assert.deepEqual(
        key.map((k) => k.split(". ")[0]),
        key.map((_, n) => String(n + 1)),
        "numbered in order",
      );
      if (!s.harbor)
        assert.ok(
          !key.some((k) => k.endsWith(`. ${w.names.sea}`)),
          `seed ${seed} index ${i}: an inland place keys no sea`,
        );
      if (s.kind === "capital")
        assert.ok(!key.some((k) => /\. In /.test(k)), `seed ${seed} index ${i}: a capital keys no realm`);
    });
  }
});

test("the key never names what the viewed year has not yet seen: no realm before the founding or the realm's proclamation, no beast before its first sighting", () => {
  let realmLater = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const w = worldFor(seed);
    w.settlements.forEach((s, i) => {
      const realm = w.realms.labels[s.x + s.y * w.elev.w] ?? -1;
      const rise = w.history.events.find((e) => e.kind === "rise" && e.realm === realm)?.year ?? -Infinity;
      for (const year of [s.founded - 1, s.founded, w.title.year]) {
        const key = keyOf(seed, i, year);
        const keysRealm = key.some((k) => /\. In /.test(k));
        if (year < s.founded)
          assert.ok(!keysRealm, `seed ${seed} index ${i} at An. ${year}: the bare ground keys no realm`);
        if (rise > year) {
          realmLater++;
          assert.ok(
            !keysRealm,
            `seed ${seed} index ${i} at An. ${year}: the realm, proclaimed An. ${rise}, is not yet keyed`,
          );
        }
        for (const b of w.beasts) {
          if (b.firstSeen <= year) continue;
          if (key.some((k) => k.endsWith(`. ${b.name}, ${b.epithet}`)))
            assert.fail(`seed ${seed} index ${i} at An. ${year}: ${b.name}, first seen An. ${b.firstSeen}, is keyed`);
        }
      }
    });
  }
  assert.ok(realmLater > 10, `premise: the sweep meets realms the viewed year has not seen proclaimed (${realmLater})`);
  assert.ok(
    !keyOf(7, 6, 412).some((k) => k.includes("Kaipu")) && keyOf(7, 6).some((k) => k.includes("Kaipu")),
    "the witness: Wailua's bay keys Kaipu, first seen An. 780, at the present and not on its bare ground of An. 412",
  );
});
