import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import type { PlaceMark } from "../../src/render/place-manifest.ts";
import type { HistoricalEvent } from "../../src/society/history.ts";
import {
  placeRank,
  placeAriaLabel,
  cardSide,
  composePlaceCard,
  composeDerivation,
} from "../../src/render/place-card.ts";

const UNCERTAIN_LINE = "Of uncertain derivation, even to the philologists.";

// #53: client-side composition of a place's story card from the #52 manifest; pure logic only, the DOM overlay is covered by the Explorer e2e.
// Load-bearing: a founding and a ruin event carry the same settlement idx (history.ts), so the tale must be found by settlement === idx && kind === "ruin"; filtering on settlement alone surfaces the founding text.

const mark = (over: Partial<PlaceMark> = {}): PlaceMark => ({
  idx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 312,
  ruined: false,
  seat: false,
  nx: 0.5,
  ny: 0.5,
  // #120 added the grid cell to PlaceMark; nothing here reads it.
  gx: 0,
  gy: 0,
  ...over,
});

const ev = (over: Partial<HistoricalEvent> = {}): HistoricalEvent => ({
  year: 100,
  kind: "founding",
  text: "An event of no special note.",
  ...over,
});

test("placeRank labels each kind, and a ruin overrides its kind", () => {
  assert.equal(placeRank(mark({ kind: "capital" })), "Capital");
  assert.equal(placeRank(mark({ kind: "town" })), "Town");
  assert.equal(placeRank(mark({ kind: "village" })), "Village");
  assert.equal(placeRank(mark({ kind: "village", ruined: true })), "Ruin");
});

test("placeRank calls a non-capital realm seat a Realm Seat, not a Town", () => {
  // The card had no notion of a seat: a realm's seat town read plain "Town" while the chart drew it with the seat castle and halo.
  assert.equal(placeRank(mark({ kind: "town", seat: true })), "Realm Seat");
  // realms.ts promotes a village when an inhabited landmass would otherwise be seatless
  assert.equal(placeRank(mark({ kind: "village", seat: true })), "Realm Seat");
});

test("placeRank calls a hamlet a Hamlet (#171)", () => {
  assert.equal(placeRank(mark({ kind: "hamlet" })), "Hamlet");
  assert.equal(
    placeAriaLabel(mark({ name: "Weki", kind: "hamlet" })),
    "Weki, Hamlet",
  );
});

test("placeRank ranks capital above seat: realm 0's seat IS the grand capital", () => {
  // `selectSeats` in `src/society/realms.ts` pushes the capital as realm 0's seat, so the capital carries seat===true; it must still read "Capital", matching `tierOf` in `src/render/layers/settlements.ts`.
  assert.equal(placeRank(mark({ kind: "capital", seat: true })), "Capital");
});

test("placeAriaLabel is name + rank, so a ruin announces as it renders", () => {
  assert.equal(placeAriaLabel(mark({ name: "Caersan", kind: "capital" })), "Caersan, Capital");
  assert.equal(
    placeAriaLabel(mark({ name: "Dunmarrow", kind: "town", seat: true })),
    "Dunmarrow, Realm Seat",
  );
  assert.equal(
    placeAriaLabel(mark({ name: "Homaitani", kind: "village", ruined: true })),
    "Homaitani, Ruin",
  );
});

test("composePlaceCard: a living town shows name/rank/founding and no tale", () => {
  const events = [ev({ kind: "founding", settlement: 0, text: "Settlers raised Aelmoor." })];
  const card = composePlaceCard(mark({ idx: 0, kind: "town", founded: 312 }), events, "oromi");
  assert.equal(card.name, "Aelmoor");
  assert.equal(card.rank, "Town");
  assert.equal(card.founded, 312);
  assert.equal(card.foundedLine, "Founded in the year 312.");
  assert.equal(card.tale, undefined, "a living settlement carries no abandonment tale");
});

test("composePlaceCard: a ruin shows its abandonment tale, not its founding text", () => {
  // both events carry settlement===2; founding is pushed FIRST (history.ts).
  const events = [
    ev({ kind: "founding", settlement: 2, year: 400, text: "The hearths of Homaitani were first lit." }),
    ev({ kind: "war", settlement: 5, year: 500, text: "An unrelated war." }),
    ev({ kind: "ruin", settlement: 2, year: 600, text: "Homaitani was abandoned to the gulls." }),
  ];
  const card = composePlaceCard(mark({ idx: 2, name: "Homaitani", kind: "village", ruined: true, founded: 400 }), events, "oromi");
  assert.equal(card.tale, "Homaitani was abandoned to the gulls.");
  assert.notEqual(card.tale, "The hearths of Homaitani were first lit.", "must not surface the founding text");
  assert.equal(card.rank, "Ruin");
});

test("composePlaceCard: a ruin whose event was truncated degrades to no tale", () => {
  // history.ts caps the chronicle at 14 events and pushes ruins LAST, so a ruin event can be sliced off; the card must still render (rank Ruin, no tale).
  const events = [ev({ kind: "founding", settlement: 3, text: "Founding only." })];
  const card = composePlaceCard(mark({ idx: 3, kind: "village", ruined: true }), events, "oromi");
  assert.equal(card.rank, "Ruin");
  assert.equal(card.tale, undefined, "no ruin event in the manifest means no tale, not a crash");
});

test("cardSide flips the card toward the chart's centre", () => {
  assert.deepEqual(cardSide(0.2, 0.2), { h: "right", v: "below" });
  assert.deepEqual(cardSide(0.8, 0.8), { h: "left", v: "above" });
  // boundary: > 0.5 flips, exactly 0.5 does not
  assert.deepEqual(cardSide(0.5, 0.5), { h: "right", v: "below" });
  assert.deepEqual(cardSide(0.51, 0.49), { h: "left", v: "below" });
});

test("integration: real seed 42 ruin and capital compose correctly", () => {
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  const ruin = m.places.find((p) => p.ruined);
  assert.ok(ruin, "seed 42 has a ruin");
  const ruinCard = composePlaceCard(ruin, m.events, m.cultureId);
  assert.equal(ruinCard.rank, "Ruin");
  assert.ok(ruinCard.tale && ruinCard.tale.includes(ruin.name), "the tale names the ruin");
  assert.equal(ruinCard.foundedLine, `Founded in the year ${ruin.founded}.`);

  const capital = m.places.find((p) => p.kind === "capital")!;
  const capCard = composePlaceCard(capital, m.events, m.cultureId);
  assert.equal(capCard.rank, "Capital");
  assert.equal(capCard.tale, undefined, "a thriving capital has no abandonment tale");
});

test("integration: seed 42's non-capital seats card as Realm Seat", () => {
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  assert.ok(world.realms.seats.length > 1, "seed 42 is multi-realm");

  const seats = m.places.filter((p) => p.seat);
  assert.equal(seats.length, world.realms.seats.length, "every realm's seat is flagged");

  const ranks = seats.map((p) => composePlaceCard(p, m.events, m.cultureId).rank);
  assert.equal(ranks.filter((r) => r === "Capital").length, 1, "exactly one grand capital");
  assert.equal(
    ranks.filter((r) => r === "Realm Seat").length,
    world.realms.seats.length - 1,
    "every other seat cards as Realm Seat",
  );
  // the chart's seat glyph count (settlements.test.ts) and the card rank must agree
  assert.equal(ranks.filter((r) => r === "Town" || r === "Village").length, 0);
});

test("composePlaceCard reads the name aloud in the philologist's register (#124)", () => {
  const card = composePlaceCard(mark({ name: "Laukuwelua" }), [], "oromi");
  assert.equal(card.tongueLine, "A word of the Oromi speech: Lau·ku·we·lua");
  assert.equal(
    card.derivationLine,
    "l, leaf, green things; k, sea, salt; w, water, current; -lua, a sheltered mooring. " +
      "So the lexicographers of the age would have it.",
  );
});

test("the hedge is drawn from the name, so a card reads the same way every time it opens", () => {
  const once = composeDerivation("Naukoa", "oromi");
  assert.deepEqual(composeDerivation("Naukoa", "oromi"), once);
  // A constant wearing a hash's clothes would pass the line above; two names must differ.
  const hedges = new Set(
    ["Naukoa", "Weki", "Paukilua", "Laukuwelua", "Laihoanui"].map(
      (n) => composeDerivation(n, "oromi").derivationLine.split(". ").at(-1),
    ),
  );
  assert.ok(hedges.size > 1, `five names all hedge the same way: ${[...hedges].join(" / ")}`);
});

test("a name the grammar cannot have made degrades in-fiction, never to a blank or a throw", () => {
  const card = composePlaceCard(mark({ name: "Xyzzy" }), [], "oromi");
  assert.equal(card.tongueLine, "A word of the Oromi speech: Xyzzy");
  assert.equal(card.derivationLine, UNCERTAIN_LINE);
});

test("a tongue with no lexicon still cards, so an eleventh culture cannot ship a blank line", () => {
  const card = composePlaceCard(mark({ name: "Laukuwelua" }), [], "atlantean");
  assert.equal(card.tongueLine, "A word of no speech the philologists can name.");
  assert.equal(card.derivationLine, UNCERTAIN_LINE);
});

test("integration: every seed 42 place carries a derivation, and the ruin keeps its tale (#124)", () => {
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  assert.equal(m.cultureId, "oromi");
  for (const place of m.places) {
    const card = composePlaceCard(place, m.events, m.cultureId);
    assert.match(card.tongueLine, /^A word of the Oromi speech: /, `${place.name} names no tongue`);
    assert.notEqual(card.derivationLine, UNCERTAIN_LINE, `${place.name} did not derive`);
    assert.ok(card.derivationLine.endsWith("."), `${place.name} derivation is unpunctuated`);
  }
  const ruin = m.places.find((p) => p.ruined)!;
  const ruinCard = composePlaceCard(ruin, m.events, m.cultureId);
  assert.ok(ruinCard.tale && ruinCard.tale.includes(ruin.name), "the ruin's tale survives the new lines");
});
