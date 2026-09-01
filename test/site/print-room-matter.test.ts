import { test } from "node:test";
import assert from "node:assert/strict";
import { MATTER_KEYS, PAGE_MEASURE_WIDTH, PAGE_MIN_HEIGHT, isMatterKey, matterLine, matterPage, matterTitle, pageAspect, type MatterSource } from "../../src/site/print-room/matter-markup.ts";

// #497 (Landfall Sub 8a, seat p ruled 2026-08-31): the back matter set as a page of the bound atlas, pure strings like plate-markup.ts, so the page face unit-tests in Node.
const ATLAS: MatterSource = {
  title: "Weship & Sons",
  seed: 42,
  bannersHtml: `<section>\n<h2>Banners of the Realms</h2>\n<div class="banners"><figure class="banner"><svg/></figure></div>\n</section>`,
  chronicleHtml: `<section>\n<h2>Chronicle</h2>\n<ol class="chronicle"><li><span class="year">1</span> a</li></ol>\n</section>`,
  gazetteerHtml: `<section>\n<h2>Gazetteer</h2>\n<table><thead><tr><th>Place</th></tr></thead><tbody><tr><td>A</td></tr></tbody></table>\n</section>`,
};

test("the three matter keys are the contents' last three rows in order, and no plate key is one", () => {
  assert.deepEqual([...MATTER_KEYS], ["banners", "chronicle", "gazetteer"]);
  for (const k of MATTER_KEYS) assert.ok(isMatterKey(k), `${k} is matter`);
  for (const plate of ["antique", "topographic", "theme-vegetation", "region-1", "prospect-capital"]) {
    assert.ok(!isMatterKey(plate), `${plate} is a plate, not matter`);
  }
});

test("the folio's plate line names the matter by its row's numeral, mid-sentence like the plates' lines", () => {
  assert.equal(matterLine("banners"), "plate vi of the bound atlas · the banners of every realm");
  assert.equal(matterLine("chronicle"), "plate vii of the bound atlas · the chronicle");
  assert.equal(matterLine("gazetteer"), "plate viii of the bound atlas · the gazetteer");
});

test("the matter titles are the contents rows' words", () => {
  assert.equal(matterTitle("banners"), "The banners of every realm");
  assert.equal(matterTitle("chronicle"), "The chronicle");
  assert.equal(matterTitle("gazetteer"), "The gazetteer");
});

test("the page sets the document head over the named section's own html, the title escaped, other sections left behind", () => {
  const page = matterPage("gazetteer", ATLAS);
  assert.match(page, /^<p class="page-head">VELLUM · THE BOUND ATLAS OF Weship &amp; Sons · CHART № 42<\/p>/);
  assert.ok(page.endsWith(ATLAS.gazetteerHtml), "the section html rides verbatim under the head");
  assert.ok(!page.includes("Banners of the Realms") && !page.includes("Chronicle</h2>"), "only the named section turns");
  assert.match(matterPage("banners", ATLAS), /Banners of the Realms/);
  assert.match(matterPage("chronicle", ATLAS), /class="chronicle"/);
});

test("an empty section makes no page: a world with no arms or no history has nothing to turn to", () => {
  assert.equal(matterPage("banners", { ...ATLAS, bannersHtml: "" }), "");
  assert.equal(matterPage("chronicle", { ...ATLAS, chronicleHtml: "" }), "");
});

test("the page's aspect is measured at the 900px/16px reference and floored at the minimum height", () => {
  assert.equal(PAGE_MEASURE_WIDTH, 900);
  assert.equal(PAGE_MIN_HEIGHT, 1200);
  assert.equal(pageAspect(1800), 0.5);
  assert.equal(pageAspect(600), 0.75, "a short section keeps the 3:4 page, not a broadside");
  assert.equal(pageAspect(1200), 0.75);
});
