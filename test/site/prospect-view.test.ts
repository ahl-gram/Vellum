import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { engravedBirdseyePlate } from "../../src/prospect/birdseye/plate.ts";
import { prospectPlate } from "../../src/prospect/finished.ts";
import { escapeXml } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import { prospectResultFor } from "../../src/site/explorer/prospect-job.ts";
import type { ProspectJob, ProspectResult } from "../../src/site/explorer/worker-client.ts";
import { PLATE_VIEWS } from "../../src/site/shared/address-grammar.ts";
import { chartTarget, parseProspectAddress, ribbonTarget, viewHash } from "../../src/site/prospect/address.ts";
import { plateName, prospectTitle, subLine } from "../../src/site/prospect/note-lines.ts";
import { emitTable, parseTableValue, prospectItemFrom } from "../../src/site/shared/table-address.ts";
import { filingAt, layOnTable, subOf, thumbJobFor, thumbNames } from "../../src/site/explorer/chart-drawer.ts";
import { PROSPECT } from "../../test-support/table-address-fixtures.ts";

const world = generateWorld(defaultRecipe(42));

const item = (view: "rise" | "above") =>
  prospectItemFrom({ seed: 42, overrides: {}, style: "ink", index: 3, year: 814, view })!;

test("PV1 prospectResultFor draws the view from above through engravedBirdseyePlate byte for byte, and names the view it drew", () => {
  const above = prospectResultFor(world, { index: 1, dress: "antique", year: null, view: "above" });
  const engraved = engravedBirdseyePlate(world, 1, STYLES.antique, world.title.year);
  assert.equal(above.svg, engraved.svg);
  assert.equal(above.view, "above");
  assert.deepEqual(
    above.key,
    engraved.key.map(({ letter, label }) => ({ letter, label })),
  );
  const rise = prospectResultFor(world, { index: 1, dress: "ink", year: 300, view: "rise" });
  assert.equal(rise.svg, prospectPlate(world, 1, STYLES.ink, 300));
  assert.equal(rise.view, "rise");
});

test("PV2 the Prospect's address reads the view from above, and nothing else as a view", () => {
  assert.equal(parseProspectAddress("#seed=42&i=1&view=above").view, "above");
  assert.equal(parseProspectAddress("#seed=42&i=1").view, null);
  assert.equal(parseProspectAddress("#view=sideways").view, null);
});

test("PV3 viewHash writes the view from above after the page's other keys, in place, and the rise as no key at all", () => {
  assert.equal(viewHash("#seed=42&i=1&year=900", "above"), "#seed=42&i=1&year=900&view=above");
  assert.equal(viewHash("#seed=42&view=above&i=1", "rise"), "#seed=42&i=1");
  assert.equal(viewHash("#seed=42&view=above&i=1", "above"), "#seed=42&i=1&view=above", "replaced, never doubled");
  assert.equal(viewHash("#view=above", "rise"), "", "nothing left writes nothing, as tableHash does");
});

test("PV4 the roads out shed the view, as they shed i and year", () => {
  assert.equal(chartTarget("#seed=42&i=1&view=above"), "/explorer/#seed=42");
  assert.equal(ribbonTarget("#seed=42&i=1&view=above", 1), "/ribbon/#seed=42&a=1");
});

test("PV5 a gathered bird's-eye spells its view once, after its year, and a rise spells exactly what it spells today", () => {
  assert.equal(emitTable([item("above")]), "k-p.seed-42.style-ink.i-3.year-814.view-above");
  assert.equal(emitTable([item("rise")]), PROSPECT);
  const first = (raw: string) => parseTableValue(raw)[0];
  const above = first("k-p.seed-42.style-ink.i-3.year-814.view-above");
  assert.ok(above?.kind === "prospect");
  assert.equal(above.view, "above");
  const rise = first(PROSPECT);
  assert.ok(rise?.kind === "prospect");
  assert.equal(rise.view, "rise");
  assert.deepEqual(parseTableValue("k-p.seed-42.style-ink.i-3.year-814.view-rise"), [], "one spelling per sheet");
  assert.deepEqual(parseTableValue("k-p.seed-42.style-ink.i-3.year-814.view-sideways"), []);
});

test("PV6 the view from the rise and the view from above of one place in one year are two sheets, and one view filed twice is refused", () => {
  const laid = layOnTable([item("rise")], item("above"));
  assert.equal(laid.refused, false);
  const again = layOnTable([item("above")], item("above"));
  assert.equal(again.refused, true);
  assert.equal(again.reason, "already");
});

test("PV7 the place card files the view from the rise", () => {
  const filed = filingAt({
    turning: false,
    sheet: { seed: 42, overrides: {}, style: "antique", presentYear: 1059 },
    index: 3,
  });
  assert.equal(filed?.view, "rise");
});

test("PV8 a gathered sheet's job draws the view it was filed in", () => {
  assert.equal((thumbJobFor(item("above")) as ProspectJob).view, "above");
  assert.equal((thumbJobFor(item("rise")) as ProspectJob).view, "rise");
});

test("PV9 a gathered bird's-eye names itself the bird's-eye of its town, in its title and its line", () => {
  const res = {
    ok: true,
    name: "Paukilua",
    title: "The Isle of Rahai",
    svg: "",
    view: "above",
  } as unknown as ProspectResult;
  assert.deepEqual(thumbNames(res), { title: "The Bird's-eye of Paukilua", worldTitle: "The Isle of Rahai" });
  assert.equal(subOf(item("above")), "a bird's-eye, pen & ink, 814");
  assert.equal(subOf(item("rise")), "a prospect, pen & ink, 814");
});

test("PV10 the room's lines name the view", () => {
  assert.equal(prospectTitle("Nailo", "above"), "The Bird's-eye of Nailo");
  assert.equal(prospectTitle("Nailo", "rise"), "The Prospect of Nailo");
  assert.equal(plateName("Nailo", "above"), "The bird's-eye of Nailo");
  assert.equal(
    subLine({ title: "The Isle of Rahai", view: "above" }),
    "The Isle of Rahai · drawn from above, as a bird sees the town and its country",
  );
  assert.equal(
    subLine({ title: "The Isle of Rahai", formerName: "Haitani", view: "above" }),
    "The Isle of Rahai · once called Haitani",
  );
});

test("PV11 the plate's name in the room is the plate's own aria-label, and the two views' names differ", () => {
  assert.notEqual(plateName("Nailo", "above"), plateName("Nailo", "rise"));
  for (const view of PLATE_VIEWS) {
    const { svg } = prospectResultFor(world, { index: 4, dress: "antique", year: null, view });
    const label = `aria-label="${escapeXml(`${plateName("Nailo", view)}, chart 42`)}"`;
    assert.ok(svg.includes(label), `the ${view} plate does not carry ${label}`);
  }
});
