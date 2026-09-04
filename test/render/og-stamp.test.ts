import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { buildOgCard, fontFaceCss, OG_FONT_FACES } from "../../src/render/og-card.ts";
import { OG_STAMP_KEYWORD, cardStamp, readStamps, stampPng, stripStamps } from "../../src/render/og-stamp.ts";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const shippingFontCss = (): string =>
  OG_FONT_FACES.map((face) => fontFaceCss(face, readFileSync(root(`public/fonts/${face.file}`)).toString("base64"))).join("\n");

const shippingCard = (): string =>
  buildOgCard(renderMap(generateWorld(defaultRecipe(42)), { style: "antique", legend: false }), { fontCss: shippingFontCss() });

test("public/og.png carries exactly one vellum-card stamp, the hash of the card as built today (#490)", () => {
  const stamps = readStamps(readFileSync(root("public/og.png")));
  assert.equal(stamps.length, 1, `exactly one ${OG_STAMP_KEYWORD} tEXt chunk`);
  assert.equal(stamps[0], cardStamp(shippingCard()), "public/og.png was rendered from an older card: run npm run og and commit the PNG");
});

test("the stamp covers the card's dress and the embedded faces but not the chart, so chart float drift cannot move it", () => {
  const card = shippingCard();
  const at = card.indexOf('data-vellum-seed="42"');
  const open = card.lastIndexOf("<svg", at);
  const close = card.indexOf("</svg>", at) + "</svg>".length;
  const otherChart = card.slice(0, open) + '<svg x="0" data-vellum-seed="42"><path d="M0 0"/></svg>' + card.slice(close);
  assert.equal(cardStamp(otherChart), cardStamp(card));
  assert.notEqual(cardStamp(card.replace('font-size="100"', 'font-size="101"')), cardStamp(card), "a size moves the stamp");
  assert.notEqual(cardStamp(card.replace("<style>", "<style>/**/")), cardStamp(card), "the font css moves the stamp");
});

test("stampPng writes one tEXt chunk after IHDR with a valid CRC, replaces an earlier stamp, and stripStamps undoes it byte for byte", () => {
  const bare = stripStamps(readFileSync(root("public/og.png")));
  const stamped = stampPng(bare, "abc");
  assert.deepEqual(readStamps(stamped), ["abc"]);
  assert.deepEqual(readStamps(stampPng(stamped, "def")), ["def"]);
  const afterIhdr = 8 + 12 + 13;
  assert.equal(stamped.toString("latin1", afterIhdr + 4, afterIhdr + 8), "tEXt");
  assert.equal(stamped.readUInt32BE(afterIhdr), OG_STAMP_KEYWORD.length + 1 + "abc".length);
  assert.ok(stripStamps(stamped).equals(bare));
  const corrupt = Buffer.from(stamped);
  corrupt[afterIhdr + 8 + OG_STAMP_KEYWORD.length + 1 + "abc".length] ^= 0xff;
  assert.throws(() => readStamps(corrupt), /CRC/);
});
