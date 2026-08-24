import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The card criterion (#314, ratified 2026-07-29 as a comment on #202) lives on in the station slips: a verb kicker before every title, grounded and glossed.

const homeSource = readFileSync(
  fileURLToPath(new URL("../../src/pages/index.astro", import.meta.url)),
  "utf8",
);

test("the Go Deeper section is retired; its copy lives on the station slips (#459)", () => {
  assert.ok(!homeSource.includes("Go Deeper"), "the old section must stay gone");
  assert.ok(!homeSource.includes('class="card"'), "no encounter card survives outside the stage");
  assert.ok(!homeSource.includes("cards-gloss"), "the section's gloss went with it");
});

test("the encounter gloss lives once, at the legend head (#459)", () => {
  const hits = homeSource.split("Every seed is a world entire").length - 1;
  assert.equal(hits, 1, "the legend head is the one home of the gloss line");
  const head = homeSource.match(/class="lf-legend-head">([^<]+)</);
  assert.ok(head && head[1].includes("Every seed is a world entire"), "and that one home is the legend head");
});

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
