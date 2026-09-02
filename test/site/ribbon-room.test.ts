import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// #463 part 4/4: the Wayfarer's Ribbon is a chart room on the #462 pattern, ruled on #494 (2026-08-30): the scroll full-bleed at its own aspect, the journey row (setting out from, bound for, Turn about) as the corner's control, the itinerary league by league on the slip with a row leaning the Glass on its stretch, the Explorer and the prospect of the road's end as the roads out, print standing down. #428 (the Ribbon out of the nav) is untouched.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => (existsSync(resolve(REPO, p)) ? readFileSync(resolve(REPO, p), "utf8") : "");
const page = read("src/pages/ribbon/index.astro");
const css = read("public/ribbon/index.css");
const kit = read("public/atelier.css");
const printCss = read("public/print-room/index.css");
const app = read("src/site/ribbon/app.ts");
const seats = read("src/site/ribbon/seats.ts");

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

const folioLines = (): string[][] => {
  const m = page.match(/<ChartFolio lines=\{(\[[^\n]*\])\} \/>/);
  assert.ok(m, "the page stands the kit's chart folio");
  return JSON.parse(m![1]!) as string[][];
};
const count = (s: string, needle: string): number => s.split(needle).length - 1;

test("RBR1 the Ribbon is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead, the figure and its caption retired", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Ribbon passes chartRoom (no band, no footer)");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
  for (const gone of ['class="plate-figure"', 'class="actions"', 'id="rb-caption"']) {
    assert.ok(!page.includes(gone), `${gone} left with the sheet`);
  }
});

test("RBR2 the corner is the journey row: the two selects in one movable group, Turn about outside it so it stays in the corner on a phone; every id once (the mockup's duplicate row is a trap for getElementById)", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  assert.match(folio, /<div class="folio-controls" role="group" aria-label="The journey">/, "the row is the folio's control group");
  const journey = folio.slice(folio.indexOf('<div class="journey" id="rb-journey">'), folio.indexOf("</div>", folio.indexOf('id="rb-journey"')));
  assert.ok(journey.length > 0, "the journey group exists");
  assert.match(journey, /<label class="jl" for="rb-from">setting out from<\/label>\s*<select id="rb-from" class="control" aria-label="setting out from"><\/select>/, "setting out from");
  assert.match(journey, /<label class="jl" for="rb-to">bound for<\/label>\s*<select id="rb-to" class="control" aria-label="bound for"><\/select>/, "bound for");
  assert.ok(!journey.includes('id="rb-swap"'), "Turn about is not inside the group that docks");
  assert.match(folio, /<\/div>\s*<button id="rb-swap" class="primary" type="button">Turn about<\/button>/, "Turn about follows the group, the room's primary");
  assert.match(folio, /<p class="gloss">choose where you set out and where you are bound; the surveyor unrolls the way between<\/p>/);
  for (const id of ['id="rb-from"', 'id="rb-to"', 'id="rb-swap"']) assert.equal(count(page, id), 1, `${id} appears once in the page`);
});

test("RBR3 the itinerary is the slip: the journey's phone dock first, the intro, the way league by league in the kit's contents row, the lean gloss, the legend's dock", () => {
  assert.match(page, /<Slip id="itinerary" verb="The itinerary" title="The Itinerary" where="[^"]+" fold="Fold the itinerary away">/, "the slip carries the mockup's head; the h2 takes the journey at the draw");
  const slip = between("<Slip", "</Slip>");
  assert.match(slip, /<div class="journey-dock"><\/div>/, "the dock the selects move into on a phone");
  assert.match(slip, /<p class="intro">Every bridge and ford, every wayside village, every fork signed for the town it leaves for, as the wayfarers' chain measured them\.<\/p>/, "the intro, rewritten short for the slip (the mockup)");
  assert.match(slip, /<p class="itinerary-head"><span>The way, league by league<\/span><\/p>/);
  assert.match(slip, /<ol class="contents itinerary" id="rb-itinerary"><\/ol>/, "the itinerary is the kit's contents row (#487, its fourth use), filled at the draw");
  assert.match(slip, /<p class="row-gloss">A row leans the Glass on that stretch of the road\.<\/p>/);
  assert.ok(slip.includes('class="legend-dock"'), "the slip body carries the dock the legend row moves into on a phone");
  const order = ['class="journey-dock"', 'class="intro"', 'class="itinerary-head"', 'id="rb-itinerary"', 'class="row-gloss"', 'class="legend-dock"'].map((m) => slip.indexOf(m));
  assert.ok(order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1]!)), "dock, intro, head, rows, gloss, legend dock");
  assert.ok(page.indexOf("</Slip>") < page.indexOf("<ChartFolio"), "the slip precedes the chart's folio in the page");
});

test("RBR4 the legend row is the roads out (#494 ruling 3): the Explorer in gold, then the prospect of the road's end", () => {
  const legend = between('<nav class="legend"', "</nav>");
  assert.match(legend, /<nav class="legend" aria-label="The roads out">/);
  assert.match(legend, /<LegendButton id="rb-chart-link" gold href="\/explorer\/" verb="Return to" room="The Explorer" \/>/, "the road back keeps the id the suite reads, in gold (the kit's, #487)");
  assert.match(legend, /<LegendButton id="rb-prospect-link" href="\/prospect\/" verbId="rb-prospect-verb" verb="[^"]*" room="The Prospect" \/>/, "the road out to the Prospect, its verb naming the destination at the draw");
  assert.ok(legend.indexOf('id="rb-chart-link"') < legend.indexOf('id="rb-prospect-link"'), "the gold road first");
});

test("RBR5 the stage holds the fitted sheet with the scroll as the one face in the gesture box; the status pill, the Glass and the chart's folio keep their ids", () => {
  assert.match(
    page,
    /<ChartStage label="The scroll\. [^"]+">\s*<img id="rb-plate" class="plate" alt="" hidden>\s*<Fragment slot="after">/,
    "the kit's stage (#487): its gesture box's transform target holds the scroll (a blob img, never inline svg)",
  );
  const stage = between("<ChartStage", "<Vignettes />");
  assert.match(stage, /<p class="status" id="rb-status" role="status" aria-live="polite"><\/p>/, "the status line keeps its id and is the stage's pill");
  assert.match(stage, /<p id="rb-warning" class="warning" hidden>/, "the inline-fallback warning stands in the stage");
  assert.match(stage, /<noscript>/, "scripts off is said in the stage");
  assert.ok(page.includes("<Glass />"), "the Glass is the kit's corner cluster (#487; its presses carry data-zoom for the shared keys binding, atelier-kit.test.ts)");
  assert.deepEqual(folioLines(), [["folio-title", "folio-title"], ["folio-sub", "folio-sub"], ["folio-coords", "rb-unrolled"]], "the title, the survey line, the unrolling's line");
});

test("RBR6 seats.ts binds the Glass and the room at the scroll's own aspect, docks the journey with the legend's own mechanism, and leans the Glass on a row; app.ts writes the roads and never scrolls the page", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, dockLegend, legendSeat, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room, and its one-node docking for the journey");
  assert.match(seats, /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/, "the Glass is the shared controller");
  assert.match(seats, /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/, "its keys and buttons are the kit's");
  assert.match(seats, /import\s*\{\s*RIBBON_W, RIBBON_H\s*\}\s*from\s*"\.\.\/\.\.\/itinerary\/finished\.ts"/, "the scroll's own size");
  assert.match(seats, /bindRoom\(\{[^}]*aspect: \(\) => RIBBON_W \/ RIBBON_H/, "the fit takes the scroll's aspect explicitly: an img gives the svg scan nothing, and the chart's fallback mis-fits the scroll by 10.6%");
  assert.match(seats, /restore: \(cam\) =>[\s\S]*?\.refit\(/, "the room's refit is the silent one (no settle, no hash)");
  assert.match(seats, /dockLegend(?:<[^>]*>)?\([^)]*legendSeat\(/, "the journey docks by the legend's seat rule: the slip on a phone, the corner on a wide sheet");
  assert.match(seats, /legendSeat\(\{ narrow: narrow\.matches, hasSlip: true \}\)/, "with the slip as its seat, since the itinerary IS the slip (hasSlip: false pins the journey to the corner forever; guard-prover round 2)");
  assert.ok(seats.indexOf('narrow.addEventListener("change", seatJourney)') > 0 && seats.indexOf('narrow.addEventListener("change", seatJourney)') < seats.indexOf("const room = bindRoom("), "the journey's listener is registered BEFORE bindRoom's on the same query, so a live 900px crossing docks first and the kit then measures the corner it left (skeptic round 3)");
  assert.match(read("src/site/ribbon/row-text.ts"), /export function rowText\(/, "the row's text is a DOM-free module a unit test runs (skeptic round 3: regexed source is not a run)");
  assert.match(seats, /export const LEAN_K = 2\.6;/, "the lean's depth is the mockup's 2.6x, one constant");
  assert.match(seats, /lean: \(nx, ny\) => \{[\s\S]*?zoomTo\(transformFromCamera\(\{ cx: nx, cy: ny, k: LEAN_K \}/, "a lean centres the Glass on the row's seat at LEAN_K, through the camera bridge, cx from nx and cy from ny (a swap shipped green past a shape-only regex; skeptic round 2)");
  assert.match(seats, /li\.dataset\.nx = String\(r\.nx\);\s*li\.dataset\.ny = String\(r\.ny\);/, "each row carries its seat, so the suite can check where the Glass landed");
  assert.match(app, /prospectTarget\(location\.hash, /, "the road to the Prospect carries the world and the destination");
  assert.match(app, /end === "to" \? o\.i === res\.toIdx \|\| res\.reachable\.includes\(o\.i\) : o\.roads/, "both selects offer only what a road joins: a departure some road leaves, a destination the departure reaches (#494)");
  assert.match(app.slice(0, app.indexOf("await initWorker()")), /prospectLink\.style\.display = "none"/, "the Prospect road stands down until the scroll resolves its end");
  assert.match(app, /chartTarget\(location\.hash\)/, "the road back sheds the journey's keys");
  assert.match(app, /journeyHash\(location\.hash, /, "a journey still writes the address");
  const settle = app.slice(app.indexOf("showPlate("), app.indexOf("last = {"));
  assert.ok(settle.includes("writeFolio(") && settle.includes("room.layout()"), "the settle path writes the folio and refits");
  assert.ok(settle.indexOf("room.layout()") > settle.indexOf("writeFolio("), "the refit follows the folio write, since the fit measures the folio's rect");
  for (const [name, src] of [["app.ts", app], ["seats.ts", seats]] as const) {
    assert.doesNotMatch(src, /scrollIntoView|window\.scrollTo|\.scrollTop\s*=/, `${name} moves the page`);
  }
});

test("RBR7 the css: the sheet fitted to what the chrome leaves, the scroll as the sheet's face, the journey a grid in the phone sheet, the itinerary rows buttons in the text's dress, print standing down", () => {
  assert.match(css, /\.stage\s*\{[^}]*padding:\s*var\(--reserve-top/, "the stage reserves the chrome's edges as padding, measured by room.ts");
  assert.match(css, /#sheet\s*\{[^}]*box-shadow:\s*var\(--stage-shadow\)/, "the sheet rests at the chart-room depth, via the token");
  assert.match(css, /#map-viewport\.zoomable\s*\{[^}]*touch-action:\s*none/, "touch-action:none stays on the gesture box");
  assert.match(css, /#map\s*\{[^}]*transform-origin:\s*0\s+0/, "#map keeps the top-left pivot");
  assert.match(css, /#rb-plate\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*width:\s*100%;[^}]*height:\s*100%/, "the scroll fills the sheet");
  assert.match(css, /\.folio-controls\s*\{[^}]*flex-wrap:\s*wrap/, "the journey row wraps: two selects with their labels and the turn about are wider than the corner");
  assert.match(css, /\.journey\s*\{[^}]*display:\s*contents/, "in the corner the group's children take their places in the wrapping row");
  assert.match(css, /\.itinerary li \.lean\s*\{[^}]*appearance:\s*none;[^}]*background:\s*none;[^}]*border:\s*0/, "a row is a button in the text's own dress");
  assert.match(css, /\.slip \.itinerary li \.lean:is\(:hover, :focus-visible, :active\)/, "its hover is written four classes deep against the house button skin (0,3,1)");
  assert.match(css, /\.itinerary \.cr-num::after\s*\{[^}]*content:\s*" lg"/, "the league mark");
  assert.match(css, /\.itinerary li\.summit \.cr-text em::before\s*\{[^}]*content:\s*"\\25B3\\00a0"/, "the summit's triangle");
  assert.doesNotMatch(css, /(^|\n)(\.contents )?\.cr-(num|text)\s*\{/, "the page css does not re-dress the kit's row (#302)");
  assert.doesNotMatch(css, /(^|\n)\s*(header|footer|\.plate-figure|\.actions|main)\s*[{,]/, "no rule targets furniture a chart room no longer has");
  const phone = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media print"));
  assert.match(phone, /\.journey\.in-slip\s*\{[^}]*display:\s*grid/, "docked in the sheet the journey is a labelled grid (the mockup's phone shape)");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /\.stage\s*\{[^}]*position:\s*static/, "the scroll prints in flow");
  assert.match(print[1], /#map\s*\{[^}]*transform:\s*none\s*!important/, "unzoomed");
  assert.match(print[1], /#rb-plate\s*\{[^}]*position:\s*static;[^}]*height:\s*auto/, "at its own proportion");
});

test("RBR8 the corner's select dress is the kit's at its second use (#487): atelier.css dresses .folio-controls select.control, the Print Room's sheet no longer does, the Ribbon's sets only the width", () => {
  assert.match(kit, /\.folio-controls select\.control\s*\{[^}]*appearance:\s*none/, "the kit dresses the corner's select");
  assert.match(kit, /\.folio-controls select\.control option\s*\{/, "and its options on the panel");
  assert.doesNotMatch(printCss, /\.folio-controls select\.control\s*\{[^}]*appearance/, "the Print Room's copy moved into the kit");
  assert.match(printCss, /\.folio-controls select\.control\s*\{\s*width:\s*7\.4rem;\s*\}/, "but the Print Room keeps its picker's width at (0,2,1), or the kit's phone clamp narrows the ratified picker (skeptic round 2)");
  const wide = css.slice(0, css.indexOf("@media (max-width: 900px)"));
  const selectRules = [...wide.matchAll(/\.folio-controls select\.control\s*\{([^}]*)\}/g)].map((m) => m[1]!);
  assert.ok(selectRules.length >= 1, "the Ribbon sizes its selects");
  for (const body of selectRules) assert.doesNotMatch(body, /appearance|background-image/, "and re-dresses nothing else");
});
