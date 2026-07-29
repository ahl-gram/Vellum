import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The Go Deeper card criterion (#314; ratified 2026-07-29 as a comment on
 * #202): one card per distinct mode of encounter, and the section's copy says
 * the mode out loud. A gloss line sits under the head, and EVERY card opens
 * with a verb kicker before its title. Derived from the cards actually
 * present, never a literal count, so a future card (the Reading Room's
 * "Watch one", #221) is forced to carry its verb the moment it lands.
 */

const homeSource = readFileSync(
  fileURLToPath(new URL("../../src/pages/index.astro", import.meta.url)),
  "utf8",
);
const pageCss = readFileSync(
  fileURLToPath(new URL("../../public/index.css", import.meta.url)),
  "utf8",
);

const sectionStart = homeSource.indexOf("<h2>Go Deeper</h2>");
assert.ok(sectionStart >= 0, "home must keep the Go Deeper section");
const section = homeSource.slice(sectionStart, homeSource.indexOf("</section>", sectionStart));

test("the Go Deeper head carries the encounter gloss", () => {
  const gloss = section.match(/<p class="cards-gloss">([^<]+)<\/p>/);
  assert.ok(gloss, "a p.cards-gloss must follow the Go Deeper head");
  assert.ok(gloss[1].trim().length > 0, "the gloss must not be empty");
  assert.ok(section.indexOf(gloss[0]) < section.indexOf('<div class="cards">'), "the gloss sits between the head and the cards");
});

test("every Go Deeper card opens with a verb kicker", () => {
  const cards = section.split('<a class="card"').slice(1);
  assert.ok(cards.length >= 3, "the section should hold the encounter cards");
  for (const card of cards) {
    const body = card.slice(0, card.indexOf("</a>"));
    const kicker = body.match(/<span class="card-verb">([^<]+)<\/span>/);
    assert.ok(kicker, `card must open with a span.card-verb kicker: ${body.slice(0, 60)}`);
    assert.ok(kicker[1].trim().length > 0, "the kicker must not be empty");
    assert.ok(body.indexOf(kicker[0]) < body.indexOf("<h3>"), "the kicker precedes the card title");
  }
});

test("the page css dresses the gloss and the kicker", () => {
  assert.ok(pageCss.includes(".cards-gloss"), "public/index.css must style .cards-gloss");
  assert.ok(pageCss.includes(".card-verb"), "public/index.css must style .card-verb");
});
