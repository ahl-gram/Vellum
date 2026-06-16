import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import {
  AROMATIC_GOODS,
  CAPITAL_NOTES,
  createLoreWriter,
  HARBOR_NOTES,
  INLAND_NOTES,
  RIVER_NOTES,
} from "../../src/society/lore.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

// createLoreWriter only reads world.culture.id, world.elev.w, and
// world.biomes[idx], so a minimal stub exercises the gazetteer prose
// without standing up a whole world. biomes left as ocean (0) so no
// biome note is appended and harbor lines are tested in isolation.
function stubWorld(cultureId: string): World {
  return {
    culture: { id: cultureId },
    elev: { w: 64 },
    biomes: new Uint8Array(64 * 8),
  } as unknown as World;
}

function harbor(i: number): NamedSettlement {
  return {
    x: i % 64,
    y: 1,
    kind: "town",
    harbor: true,
    onRiver: false,
    name: `T${i}`,
  } as unknown as NamedSettlement;
}

// goods that should never appear after "smell of": minerals and pelts have
// no aroma. The reported bug was "Its quays smell of obsidian."
const NON_AROMATIC = [
  "obsidian",
  "black pearls",
  "iron ingots",
  "iron blooms",
  "black granite",
  "glazed tiles",
  "wolf pelts",
  "sealskin",
  "siege timber",
];

test("'smell of' notes never use a non-aromatic good", () => {
  const writer = createLoreWriter(stubWorld("oromi"), createRng(7).fork("lore"));
  for (let i = 0; i < 60; i++) {
    const note = writer.settlementNote(harbor(i));
    const m = note.match(/smell of (.+?) and old rope/);
    if (m) {
      const good = m[1] as string;
      assert.ok(
        !NON_AROMATIC.includes(good),
        `"smell of ${good}" is not aromatic — in: ${note}`,
      );
    }
  }
});

test("harbor notes do not repeat the same sentence excessively", () => {
  const writer = createLoreWriter(stubWorld("oromi"), createRng(7).fork("lore"));
  const counts = new Map<string, number>();
  for (let i = 0; i < 28; i++) {
    const note = writer.settlementNote(harbor(i));
    counts.set(note, (counts.get(note) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  assert.ok(max <= 3, `a single harbor note repeated ${max}x across 28 settlements`);
});

test("lore is deterministic for a given seed", () => {
  const a = createLoreWriter(stubWorld("oromi"), createRng(7).fork("lore"));
  const b = createLoreWriter(stubWorld("oromi"), createRng(7).fork("lore"));
  for (let i = 0; i < 20; i++) {
    assert.equal(a.settlementNote(harbor(i)), b.settlementNote(harbor(i)));
  }
});

// contract pins for the reworked pools (red was verified above against the
// pre-refactor code; these guard the new behavior from regressing)

test("note pools are large enough to avoid clustering", () => {
  assert.ok(HARBOR_NOTES.length >= 12, `harbor pool is ${HARBOR_NOTES.length}`);
  assert.ok(RIVER_NOTES.length >= 12, `river pool is ${RIVER_NOTES.length}`);
  assert.ok(INLAND_NOTES.length >= 12, `inland pool is ${INLAND_NOTES.length}`);
});

test("'smell of' notes draw only from the aromatic register", () => {
  const writer = createLoreWriter(stubWorld("oromi"), createRng(11).fork("lore"));
  const aromatic = AROMATIC_GOODS["oromi"] as readonly string[];
  for (let i = 0; i < 60; i++) {
    const note = writer.settlementNote(harbor(i));
    const m = note.match(/smell of (.+?) and old rope/);
    if (m) assert.ok(aromatic.includes(m[1] as string), `non-aromatic smell: ${note}`);
  }
});

test("the capital's note is drawn from its own register", () => {
  const writer = createLoreWriter(stubWorld("oromi"), createRng(3).fork("lore"));
  const capital = {
    x: 0,
    y: 0,
    kind: "capital",
    harbor: true,
    onRiver: false,
    name: "C",
  } as unknown as NamedSettlement;
  const note = writer.settlementNote(capital);
  const first = note.split(/(?<=\.)\s/)[0] as string;
  assert.ok(CAPITAL_NOTES.includes(first), `capital opens with: ${first}`);
  for (const template of HARBOR_NOTES) {
    if (!template.includes("%")) {
      assert.ok(!note.includes(template), `capital reused a harbor line: ${template}`);
    }
  }
});
