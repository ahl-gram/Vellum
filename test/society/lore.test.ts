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
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { NamedSettlement, World } from "../../src/world/types.ts";

// createLoreWriter reads only culture.id, elev.w, biomes[idx], and history.events, so a minimal stub isolates the situational lines (empty history = no founding/ruin clauses; ocean biomes = no biome note).
function stubWorld(cultureId: string): World {
  return {
    culture: { id: cultureId },
    elev: { w: 64 },
    biomes: new Uint8Array(64 * 8),
    history: { events: [] },
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

// Goods that must never follow "smell of": minerals and pelts have no aroma; the reported bug was "Its quays smell of obsidian."
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

// Contract pins for the reworked pools (red was verified against the pre-refactor code).

test("gazetteer notes reference the world's history (ruins + dated foundings)", () => {
  const w = generateWorld(defaultRecipe(42));
  const writer = createLoreWriter(w, createRng(w.recipe.seed).fork("lore"));
  const notes = w.settlements.map((s) => ({ s, note: writer.settlementNote(s) }));

  const ruin = notes.find((n) => n.s.ruined);
  assert.ok(ruin, "seed 42 has a ruined settlement");
  assert.match(ruin!.note, /year \d+|abandon|ruin|empty|gone|stones|wind/i);

  assert.ok(
    notes.some((n) => /the year \d+/.test(n.note)),
    "some note cites a founding year",
  );
});

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
