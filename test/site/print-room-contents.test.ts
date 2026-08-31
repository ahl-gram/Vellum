import { test } from "node:test";
import assert from "node:assert/strict";
import { contentsRows, plateCounts, plateLine, type ContentsData } from "../../src/site/print-room/contents-markup.ts";
import { plateAspect } from "../../src/site/print-room/plate-aspect.ts";
import { composeAtlas } from "../../src/atlas/compose.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";

// #463 part 3/4: the slip's contents, string in and string out like plate-markup.ts, so the rows unit-test in Node and the page and the runtime render one shape.
const ref = (key: string, title: string) => ({ key, title, href: `blob:http://127.0.0.1:4173/${key}` });
const DATA: ContentsData = {
  hero: ref("antique", "The world chart, drawn in the antique manner"),
  draughtings: [ref("topographic", "Topographic"), ref("ink", "Pen & ink"), ref("nautical", "Nautical")],
  themes: [ref("theme-vegetation", "Vegetation"), ref("theme-climate", "Temperature"), ref("theme-moisture", "Rainfall"), ref("theme-population", "Population")],
  regions: [ref("region-1", "The Environs of Laukuwelua"), ref("region-2", "The Environs of Toatauhe")],
  prospects: [ref("prospect-capital", "The Prospect of Laukuwelua")],
  counts: { arms: 6, entries: 41, places: 30 },
  here: "theme-vegetation",
};

const rows = (html: string): string[] => [...html.matchAll(/<li[\s\S]*?<\/li>/g)].map((m) => m[0]);

test("unbound, the eight rows stand in the mockup's words with no plates and no turns, the proof's row inked", () => {
  const html = contentsRows(null);
  const li = rows(html);
  assert.equal(li.length, 8, "eight rows, i to viii");
  assert.deepEqual(li.map((r) => /<span class="cr-num">([ivx]+)<\/span>/.exec(r)?.[1]), ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]);
  assert.match(li[0], /^<li>/, "nothing of the atlas is on the sheet yet");
  assert.match(li[0], /The chart, drawn in the <em>antique<\/em> manner/, "the atlas's first plate is the antique chart by construction, never 'as proofed' (the proof may be another style, skeptic round 2)");
  assert.match(li[3], /Regional surveys, two close-ins/);
  assert.match(li[4], /The prospect of the capital/);
  assert.doesNotMatch(html, /class="plates"|class="turn"|data-plate=/, "nothing to turn to yet");
});

test("bound, every plate is a turn and a thumbnail, the regions and the prospect are named, the counts ride the last three rows", () => {
  const html = contentsRows(DATA);
  const li = rows(html);
  assert.equal(li.length, 8);
  assert.match(li[0], /<button class="turn" type="button" data-plate="antique">The chart, drawn in the <em>antique<\/em> manner<\/button>/);
  assert.match(li[1], /Other draughtings: <button class="turn" type="button" data-plate="topographic"><em>topographic<\/em><\/button>, <button class="turn" type="button" data-plate="ink"><em>pen &amp; ink<\/em><\/button>, <button class="turn" type="button" data-plate="nautical"><em>nautical<\/em><\/button>/);
  assert.match(li[2], /Thematic surveys: .*<em>vegetation<\/em>.*<em>temperature<\/em>.*<em>rainfall<\/em>.*<em>population<\/em>/);
  assert.match(li[3], /Regional surveys: <button class="turn" type="button" data-plate="region-1"><em>The Environs of Laukuwelua<\/em><\/button>, <button[^>]*data-plate="region-2"><em>The Environs of Toatauhe<\/em><\/button>/);
  assert.match(li[4], /<button class="turn" type="button" data-plate="prospect-capital">The prospect of <em>Laukuwelua<\/em><\/button>/);
  assert.match(li[5], /The banners of every realm <span class="n">&middot; 6 arms<\/span>/);
  assert.match(li[6], /The chronicle <span class="n">&middot; 41 entries<\/span>/);
  assert.match(li[7], /The gazetteer <span class="n">&middot; 30 places<\/span>/);
  const figures = [...html.matchAll(/<figure[^>]*data-plate="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(figures, ["antique", "topographic", "ink", "nautical", "theme-vegetation", "theme-climate", "theme-moisture", "theme-population", "region-1", "region-2", "prospect-capital"], "eleven thumbnails under their rows");
  assert.match(html, /<figure data-plate="theme-vegetation" class="here"><button class="thumb" type="button" data-plate="theme-vegetation" aria-label="Turn to Vegetation"><img src="blob:http:\/\/127\.0\.0\.1:4173\/theme-vegetation" alt=""><\/button><figcaption>Vegetation<\/figcaption><\/figure>/, "a thumbnail is a button on the plate's own blob");
  assert.equal((html.match(/class="(?:turn )?here"/g) ?? []).length, 2, "the plate on the sheet is inked once as a turn and once as a thumbnail");
  assert.match(li[2], /^<li class="on">/, "and its row is on");
  assert.match(li[0], /^<li>/, "the proof's row is not");
  assert.match(li[2], /<button class="turn here" type="button" data-plate="theme-vegetation">/);
});

test("every value the host hands in is escaped: a title with markup stays text, an href stays inside its attribute", () => {
  const html = contentsRows({ ...DATA, regions: [{ key: "region-1", title: `The Environs of <script>`, href: `x" onerror="alert(1)` }], here: null });
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /onerror="/);
  assert.match(html, /<em>The Environs of &lt;script&gt;<\/em>/);
  assert.doesNotMatch(html, /class="here"/, "nothing inked when nothing is on the sheet");
});

test("the counts read the atlas's own html: banner figures, chronicle entries, gazetteer rows less the head", () => {
  const counts = plateCounts({
    bannersHtml: `<div class="banners"><figure class="banner"><svg/></figure><figure class="banner"><svg/></figure></div>`,
    chronicleHtml: `<ol class="chronicle"><li><span class="year">1</span> a</li><li><span class="year">2</span> b</li><li><span class="year">3</span> c</li></ol>`,
    gazetteerHtml: `<table><thead><tr><th>Place</th></tr></thead><tbody><tr><td>A</td></tr><tr><td>B</td></tr></tbody></table>`,
  });
  assert.deepEqual(counts, { arms: 2, entries: 3, places: 2 });
});

// The hand fixtures above are written to the regexes; this one reads the producer, so a changed <li> or <tr> in compose.ts reds here instead of printing "0 entries" (skeptic on PR #496).
test("the counts match the world the atlas was composed from (seed 42): its arms, its chronicle's events, its settlements", () => {
  const world = generateWorld(defaultRecipe(42));
  const atlas = composeAtlas(world, { width: 400 });
  assert.deepEqual(plateCounts(atlas), { arms: world.arms.length, entries: world.history.events.length, places: world.settlements.length });
  assert.ok(world.arms.length > 0 && world.history.events.length > 0 && world.settlements.length > 0, "the witness world has all three");
});

test("a plate's aspect reads its viewBox, then its width and height, and is null with neither (the prospect plate is 520x384, not the chart's 1500x1157.931)", () => {
  assert.equal(plateAspect(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 384" width="520" height="384">`), 520 / 384);
  assert.equal(plateAspect(`<svg viewBox="0 0 520 384" width="999" height="999">`), 520 / 384, "the viewBox wins over a disagreeing width and height (guard-prover round 2 found the agreeing fixture pinned nothing)");
  assert.equal(plateAspect(`<svg width="1500" height="1157.931">`), 1500 / 1157.931);
  assert.equal(plateAspect(`<svg viewBox="0 0 0 10">`), null, "a degenerate box is no aspect");
  assert.equal(plateAspect(`<svg>`), null);
});

test("the folio's plate line names the plate by its section's numeral and reads the title mid-sentence ('plate iii of the bound atlas · a thematic survey of vegetation')", () => {
  assert.equal(plateLine("hero", "The world chart, drawn in the antique manner"), "plate i of the bound atlas · the world chart, drawn in the antique manner");
  assert.equal(plateLine("draughting", "Pen & ink"), "plate ii of the bound atlas · drawn in the pen & ink manner");
  assert.equal(plateLine("theme", "Vegetation"), "plate iii of the bound atlas · a thematic survey of vegetation");
  assert.equal(plateLine("region", "The Environs of Laukuwelua"), "plate iv of the bound atlas · a regional survey, the environs of Laukuwelua");
  assert.equal(plateLine("prospect", "The Prospect of Laukuwelua"), "plate v of the bound atlas · the prospect of Laukuwelua");
});
