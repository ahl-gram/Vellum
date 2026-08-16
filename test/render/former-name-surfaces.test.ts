import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { composePlaceCard } from "../../src/render/place-card.ts";
import { composeAtlas } from "../../src/atlas/compose.ts";
import { ATLAS_SHEET_CSS } from "../../src/atlas/document.ts";

// #49: the two PR 1 surfaces. Ruling 4 is the plain voice, ruling 5 keeps ruins out.

const world = generateWorld(defaultRecipe(42));
const manifest = buildPlaceManifest(world, 1200);

const withFormer = world.settlements.filter((s) => s.formerName !== undefined);

test("the fixture actually exercises the feature", () => {
  assert.ok(withFormer.length > 0, "seed 42 renamed nothing; this file proves nothing");
});

test("a renamed place carries its former name onto the manifest mark", () => {
  for (const s of withFormer) {
    const mark = manifest.places.find((p) => p.name === s.name);
    assert.equal(mark?.formerName, s.formerName, s.name);
  }
});

test("the card states the former name plainly, with no hedge", () => {
  const renamedMarks = manifest.places.filter((p) => p.formerName !== undefined);
  assert.ok(renamedMarks.length > 0);
  for (const mark of renamedMarks) {
    const card = composePlaceCard(mark, world.history.events, world.culture.id);
    assert.equal(card.formerLine, `Once called ${mark.formerName}.`);
    assert.ok(
      !/venture|grammars|lexicographers|swear|disputed/i.test(card.formerLine as string),
      "the former-name line hedges; ruling 4 says the annalist records and does not guess",
    );
  }
});

test("an unrenamed place has no former line at all", () => {
  const plain = manifest.places.find((p) => p.formerName === undefined);
  assert.ok(plain);
  const card = composePlaceCard(plain, world.history.events, world.culture.id);
  assert.equal(card.formerLine, undefined);
  assert.ok(!("formerLine" in card), "an absent former name should not leave the key behind");
});

test("no ruin card carries a former line", () => {
  for (const mark of manifest.places.filter((p) => p.ruined)) {
    const card = composePlaceCard(mark, world.history.events, world.culture.id);
    assert.equal(card.formerLine, undefined, mark.name);
  }
});

test("the gazetteer prints the former name, escaped, once per renamed place", () => {
  const html = composeAtlas(world).gazetteerHtml;
  for (const s of withFormer) {
    const line = `Once called ${s.formerName}.`;
    assert.equal(
      html.split(line).length - 1,
      1,
      `gazetteer should carry "${line}" exactly once`,
    );
  }
  assert.equal(
    html.split('<span class="former">').length - 1,
    withFormer.length,
    "one former-name span per renamed settlement",
  );
});

// No generated name carries an XML-special char, so the sweep above cannot see escapeXml go missing. Drive one through.
test("the gazetteer escapes a former name that carries markup", () => {
  const hostile = "Ash & <Ford>";
  const idx = world.settlements.findIndex((s) => s.formerName !== undefined);
  const injected = {
    ...world,
    settlements: world.settlements.map((s, i) =>
      i === idx ? { ...s, formerName: hostile } : s,
    ),
  };
  const html = composeAtlas(injected).gazetteerHtml;
  assert.ok(html.includes("Ash &amp; &lt;Ford&gt;"), "former name was not escaped");
  assert.ok(!html.includes("<Ford>"), "raw markup reached the gazetteer");
});

// The class compose.ts emits and the selector document.ts styles must agree, or a rename on one side ships an unstyled line that no structural test can see.
test("the gazetteer's former-name class is the one the stylesheet targets", () => {
  const doc = composeAtlas(world).gazetteerHtml;
  assert.ok(doc.includes('<span class="former">'));
  assert.ok(
    ATLAS_SHEET_CSS.includes("td.name .former"),
    "the stylesheet does not target the class the gazetteer emits",
  );
  assert.ok(
    ATLAS_SHEET_CSS.includes("text-transform: none"),
    "a renamed CAPITAL would inherit the uppercase rule on td.name.capital",
  );
  // Measured: td.name is nowrap, so without this the sentence sets a min-content floor and 20 of 60 seeds scroll a 390 page sideways. Asserted as the declaration, so flipping it to nowrap fails too.
  assert.ok(
    /td\.name \.former \{[^}]*white-space: normal/.test(ATLAS_SHEET_CSS),
    "the former line must be allowed to wrap inside the nowrap name cell",
  );
});
