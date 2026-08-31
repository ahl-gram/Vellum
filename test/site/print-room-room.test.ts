import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #463 part 3/4: the Print Room is a chart room on the #462 pattern, with the four rulings of 2026-08-30 on #463 (print fixed here, the legend row the posters plus a road back, the corner the mockup plus the dice, the caveat one line under the legend's head) and the #494 ruling (the bound atlas turns on the stage, its thumbnails stay in the slip, the hidden document is the paper source, the post-bind scroll retires).
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const page = read("src/pages/print-room/index.astro");
const css = read("public/print-room/index.css");
const kit = read("public/atelier.css");
const app = read("src/site/print-room/app.ts");
const seats = read("src/site/print-room/seats.ts");
const atlas = read("src/site/print-room/bound-atlas.ts");
const room = read("src/site/shared/room.ts");

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

test("PRR1 the Print Room is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead, the order desk retired", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Print Room passes chartRoom (no band, no footer)");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
  for (const gone of ['class="order-desk"', 'class="counter"', 'class="intro">This is', 'class="offering']) {
    assert.ok(!page.includes(gone), `${gone} left with the desk`);
  }
});

test("PRR2 the corner is the mockup plus the dice (ruled 2026-08-30): seed, dice, style and Pull a proof in the folio's control row", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  assert.match(folio, /<div class="folio-controls" role="group" aria-label="[^"]+">/, "the row is the folio's control group");
  assert.match(folio, /<input id="pr-seed" class="control" type="number" min="0" max="4294967295" step="1"/, "the seed input keeps its id and takes the corner's dress");
  assert.match(folio, /<button id="pr-random" class="dice" type="button"[^>]*aria-label="Random seed">/, "the dice stays (the Reading Room kept its own)");
  assert.match(folio, /<select id="pr-style" class="control"/, "the style picker takes the corner's dress");
  assert.match(folio, /<button id="pr-draw" class="primary" type="button">Pull a proof<\/button>/, "Pull a proof is the room's primary");
  assert.ok(folio.indexOf('id="pr-seed"') < folio.indexOf('id="pr-random"') && folio.indexOf('id="pr-random"') < folio.indexOf('id="pr-style"') && folio.indexOf('id="pr-style"') < folio.indexOf('id="pr-draw"'), "seed, dice, style, primary: the mockup's order with the dice beside the seed");
  const slip = between("<Slip", "</Slip>");
  assert.ok(!slip.includes('id="pr-draw"') && !slip.includes('id="pr-seed"'), "the seed row does not also sit on the slip");
});

test("PRR3 the Bound Atlas is the slip: Bind and the contents in its body, Print / Download / Hide in its foot, the legend's phone dock inside it", () => {
  assert.match(page, /<Slip id="atlas" verb="Take home" title="The Bound Atlas" where="the whole atlas on one sheet" fold="Fold the atlas away">/, "the slip carries the mockup's head; the fold names the atlas, not the retired desk");
  const slip = between("<Slip", "</Slip>");
  const foot = slip.slice(slip.indexOf('slot="foot"'));
  assert.ok(foot.length > 0, "the slip has a foot");
  const body = slip.slice(0, slip.indexOf('slot="foot"'));
  assert.match(body, /<button id="pr-bind" class="primary" type="button" disabled>Bind the atlas<\/button>/, "Bind is the slip's own primary, closed until a proof");
  assert.match(body, /<ol class="contents" id="pr-contents"/, "the contents list is the kit's contents row");
  assert.ok(body.includes('class="legend-dock"'), "the slip body carries the dock the legend row moves into on a phone");
  for (const id of ['id="pr-print"', 'id="pr-download"', 'id="pr-hide"']) {
    assert.ok(foot.includes(id), `${id} stands in the foot`);
    assert.ok(!body.includes(id), `${id} is not also in the body`);
  }
  assert.ok(!page.includes("about 20 MB"), "no unmeasured size in the copy (the download reports its own)");
  assert.match(css, /body\.has-atlas \.slip \.intro\s*\{[^}]*display:\s*none/, "bound, the bound line replaces the intro (the mockup)");
  assert.ok(page.indexOf("</Slip>") < page.indexOf('<div class="chrome corner bl folio">'), "the slip precedes the chart's folio in the page");
});

test("PRR4 the legend row is the poster plates plus a road back (ruled 2026-08-30): Pressed-as in the head, the caveat one line under it, the four sizes ascending, the gold road to the Explorer last", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<nav class="legend" aria-label="A poster plate">/, "the row is named for the plates");
  const head = legend.slice(legend.indexOf('class="legend-head"'), legend.indexOf('class="legend-row"'));
  assert.match(head, /<select id="pr-format"/, "Pressed-as stands in the legend's head");
  assert.match(head, /<p class="legend-note">The engraving is exact at any size;/, "the caveat is one dim line between the head and the row");
  assert.ok(head.indexOf('id="pr-format"') < head.indexOf('class="legend-note"'), "the caveat follows the head");
  const row = legend.slice(legend.indexOf('class="legend-row"'));
  const at = (key: string) => row.indexOf(`data-poster="${key}"`);
  assert.ok(at("chart") >= 0 && at("chart") < at("desk") && at("desk") < at("wall") && at("wall") < at("grand"), "chart, desk, wall, grand: ascending width");
  assert.match(row, /<button class="legend-btn" type="button" data-poster="chart" disabled><span class="verb dim">1500 px<\/span><span class="room">Chart<\/span><\/button>/, "a plate is a legend button, its width the verb, closed until a proof");
  assert.match(row, /<a id="pr-explorer" class="legend-btn gold" href="\.\.\/explorer\/"><span class="verb">Back to<\/span><span class="room">The Explorer<\/span><\/a>/, "the road back to the Explorer is gold");
  assert.ok(row.indexOf('id="pr-explorer"') > at("grand"), "the road stands last");
  assert.match(legend, /<div class="legend-row" role="group" aria-label="A poster plate">/, "the row names itself; a labelledby on the head would absorb the select's option text");
  assert.match(legend, /<\/div>\s*<p class="legend-status" id="pr-poster-status" role="status" aria-live="polite"><\/p>\s*$/, "the poster order reports under the row, which a phone docks into its sheet");
  const phoneCss = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(phoneCss, /\.legend\.in-slip \.legend-status\s*\{[^}]*display:\s*block/, "and the status line shows in the docked legend");
  assert.ok(!page.includes('class="plate-row"') && !page.includes('class="plate-dim"'), "the desk's plate row retires");
  const phone = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.ok(!phone.includes("select.control"), "the style picker stays on a phone (ruled 2026-08-30: no feature lost at any width; the wrap makes room)");
  assert.match(phone, /\.legend\.in-slip \.legend-head\s*\{[^}]*display:\s*block/, "docked in the phone sheet the head stays, since it carries the Pressed-as choice (the kit hides it)");
  assert.match(phone, /\.legend\.in-slip \.legend-note\s*\{[^}]*display:\s*none/, "the note stands down there");
  assert.match(phone, /\.folio-controls\s*\{[^}]*flex-wrap:\s*wrap/, "the corner's row wraps on a phone (the mockup's seed-controls)");
  assert.match(phone, /body:has\(\.slip\.open\) \.corner\.br\.zoomery\s*\{[^}]*display:\s*none/, "the Glass stands down while the sheet is open: climbing above it, it sat under the corner's rows and stole their taps (skeptic round 2)");
});

test("PRR5 the stage holds the fitted sheet with the proof and the turned plate in one gesture box; the status pill, the Glass, the chart's folio and the hidden document keep their ids", () => {
  assert.match(
    page,
    /<div class="stage">\s*<div class="sheet" id="sheet"><div id="map-viewport"[^>]*tabindex="0"[^>]*role="application"[^>]*><div id="map">\s*<div id="pr-preview"[^>]*><\/div>\s*<img id="pr-turned"[^>]*hidden>\s*<\/div><\/div><\/div>/,
    "the sheet's gesture box holds the transform target, which holds the proof and the turned plate",
  );
  const stage = between('<div class="stage">', '<div class="vignette');
  assert.match(stage, /<p class="status" id="pr-status" role="status" aria-live="polite"><\/p>/, "the status line keeps its id (the suite's settle probe) and is the stage's pill");
  assert.match(stage, /<p id="pr-warning" class="warning" hidden>/, "the inline-fallback warning stands in the stage");
  assert.match(page, /<div class="chrome corner br zoomery" role="group" aria-label="The Surveyor's Glass">/, "the Glass is the corner cluster");
  assert.match(page, /data-zoom="in"/, "the Glass buttons carry data-zoom for the shared keys binding");
  const folio = between('<div class="chrome corner bl folio">', "</div>");
  assert.match(folio, /<p class="folio-title" id="folio-title">/, "the chart's folio carries the world's name");
  assert.match(folio, /<p class="folio-sub plate-line" id="pr-plate-line">/, "and the line naming the plate on the sheet");
  assert.match(folio, /<p class="folio-sub" id="folio-sub">/, "and its survey line");
  assert.ok(!folio.includes("pr-poster-status"), "the poster order does not report in the chart's folio: the kit hides that corner on a phone, where the plates are still tappable (skeptic on PR #496)");
  assert.match(page, /<div id="pr-atlas" class="atlas-sheet"><\/div>/, "the hidden document stays the Print / Download source");
  assert.ok(page.indexOf('id="pr-atlas"') > page.indexOf('class="chrome corner br zoomery"'), "the document follows the furniture");
});

test("PRR6 seats.ts binds the Glass and the room with the turned plate's own aspect; app.ts refits once the folio is written; nothing scrolls the page (the #494 ruling)", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room");
  assert.match(seats, /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/, "the Glass is the shared controller");
  assert.match(seats, /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/, "its keys and buttons are the kit's");
  assert.match(seats, /bindRoom\(\{[^}]*aspect/, "the room takes the sheet's aspect from the seats (a turned plate is an <img>, so the svg scan finds the hidden proof, not the plate)");
  assert.match(seats, /restore: \(cam\) =>[\s\S]*?\.refit\(/, "the room's refit is the silent one (no settle, no hash)");
  assert.match(room, /readonly aspect\?: \(\) => number \| null;/, "room.ts takes an optional aspect override");
  assert.match(room, /parts\.aspect\?\.\(\) \?\? svgAspect\(\)/, "and consults it before the svg scan");
  const settle = app.slice(app.indexOf("preview.innerHTML = res.svg;"), app.indexOf("enableBind();"));
  assert.ok(settle.includes("writeFolio(") && settle.includes("room.layout()"), "the settle path writes the folio and refits");
  assert.ok(settle.indexOf("room.layout()") > settle.indexOf("writeFolio("), "the refit follows the folio write, since the fit measures the folio's rect");
  for (const [name, src] of [["app.ts", app], ["bound-atlas.ts", atlas], ["seats.ts", seats]] as const) {
    assert.doesNotMatch(src, /scrollIntoView|window\.scrollTo|\.scrollTop\s*=/, `${name} moves the page; the atlas turns on the stage instead (ruled 2026-08-30 on #494)`);
  }
  assert.match(atlas, /turnTo\(/, "the atlas turns a plate onto the sheet");
  const bind = atlas.slice(atlas.indexOf("function bindAtlas"), atlas.indexOf("function printAtlas"));
  assert.ok(bind.indexOf("revokeObjectURL") > bind.indexOf("renderBoundAtlas(res.atlas)"), "a re-bind revokes the previous plates only after the new ones are on the page (a click mid-bind turned a revoked blob, skeptic on PR #496)");
  assert.match(bind, /if \(lastAtlas !== null\) setDeliveryEnabled\(true\)/, "a failed re-bind leaves the previous atlas deliverable");
  assert.match(atlas, /\.focus\(\{ preventScroll: true \}\)/, "a turn re-renders the index, so its successor control takes the focus back without moving the page");
});

test("PRR7 the css: the sheet fitted to what the chrome leaves, the hidden document off screen, print fixed in this sub (ruled 2026-08-30): the atlas one plate per page when bound, the proof otherwise", () => {
  assert.match(css, /\.stage\s*\{[^}]*padding:\s*var\(--reserve-top/, "the stage reserves the chrome's edges as padding, measured by room.ts");
  assert.match(css, /#sheet\s*\{[^}]*box-shadow:\s*var\(--stage-shadow\)/, "the sheet rests at the chart-room depth, via the token");
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/, "touch-action:none stays on the gesture box");
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/, "#map keeps the top-left pivot");
  assert.match(css, /@media screen\s*\{[^}]*#pr-atlas\s*\{[^}]*display:\s*none/, "the hidden document is off screen");
  assert.ok(!/max-width:\s*1000px/.test(css) && !css.includes(".order-desk") && !css.includes(".offering"), "the desk's column and cards are gone: the chart is the room");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /\.stage\s*\{[^}]*position:\s*static/, "unbound, the proof prints in flow");
  assert.match(print[1], /#map\s*\{[^}]*transform:\s*none\s*!important/, "unzoomed");
  assert.match(print[1], /body\.has-atlas \.stage\s*\{[^}]*display:\s*none\s*!important/, "bound, the stage prints as nothing");
  assert.match(print[1], /body\.has-atlas #pr-atlas\s*\{[^}]*display:\s*block/, "and the document prints");
  assert.match(print[1], /body\.has-atlas \.corner\.folio-room\s*\{[^}]*display:\s*none\s*!important/, "the atlas's own head leads, not the room's name");
  assert.match(print[1], /break-after:\s*page/, "one plate per page");
  assert.doesNotMatch(print[1], /> header|\.room-head|> footer|\.order-desk|\.counter/, "no rule targets furniture a chart room no longer has");
});

test("PRR8 the contents row is the kit's (#487, second use of the dated-row idiom): atelier.css dresses .contents / .cr-num / .cr-text, the page css keeps the turning", () => {
  for (const sel of [".contents", ".cr-num", ".cr-text"]) {
    assert.ok(kit.includes(sel), `atelier.css dresses ${sel}`);
  }
  assert.doesNotMatch(css, /(^|\n)(\.contents )?\.cr-(num|text)\s*\{/, "the page css does not re-dress the kit's row (#302); only the inked row's colour is its own");
  assert.match(css, /\.contents li\.on/, "the page inks the row whose plate is on the sheet");
  assert.match(css, /\.plates/, "and seats the thumbnails");
});
