import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Go Deeper card criterion (#314, ratified 2026-07-29 as a comment on #202): one card per distinct mode of encounter, a gloss line under the head, and EVERY card opens with a verb kicker; derived from the cards present, never a literal count.

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

// Sub 3 (#458) moves the card copy onto the stations' slips; the criterion keeps its #314 shape there (verb kicker before every title, grounded, glossed), asserted on the one rendered template since the slips map from the roster. Go Deeper itself stays until Alex rules who removes it (spec-recon 2026-08-24, open decision 3).

test("the station slip keeps the card criterion: verb kicker before the title, grounded and glossed (#458)", () => {
  const slipStart = homeSource.indexOf('class="lf-card"');
  assert.ok(slipStart >= 0, "the station slips must mount on the stage");
  const slip = homeSource.slice(slipStart, homeSource.indexOf("</aside>", slipStart));
  const verbAt = slip.indexOf('class="lf-card-verb"');
  const titleAt = slip.indexOf('class="lf-card-title"');
  const whereAt = slip.indexOf('class="lf-card-where"');
  const proseAt = slip.indexOf('class="lf-card-prose"');
  assert.ok(verbAt >= 0, "every slip opens with its verb kicker");
  assert.ok(titleAt >= 0 && verbAt < titleAt, "the kicker precedes the slip's title");
  assert.ok(whereAt >= 0 && titleAt < whereAt, "the slip grounds itself below the title");
  assert.ok(proseAt >= 0 && whereAt < proseAt, "the prose follows the grounding");
  assert.match(slip, /class="lf-card-enter" href=\{s\.href\}/, "every slip ends at the room's own door");
});

test("the legend strip glosses the encounters and lists every station (#458)", () => {
  assert.match(homeSource, /class="lf-legend-head">[^<]+</, "the legend carries its gloss line");
  const row = homeSource.slice(homeSource.indexOf('class="lf-legend-row"'), homeSource.indexOf("</nav>"));
  assert.match(row, /\{stations\.map\(/, "the legend renders one entry per station, derived, never a literal count");
  assert.match(row, /class="lf-legend-verb">\{s\.verb\}/, "each legend entry opens with the verb");
  assert.match(row, /class="lf-legend-room">\{s\.legendName\}/, "and names the room");
});
