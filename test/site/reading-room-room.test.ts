import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #463 (Landfall Sub 8): the Reading Room is a chart room on the #462 pattern. The chart full-bleed on the deep, the room's name and its one control (seed + Read, ruling 2) top right, the Journal on a slip that scrolls (ruling 5), the one dated log's instrument as a bottom strip (ruling 6), the Glass at the chart's corner, no band, no footer, no roads out (the strip owns the bottom), print standing down.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const page = read("src/pages/reading-room/index.astro");
const css = read("public/reading-room/index.css");
const frameCss = read("public/reading-frame.css");
const app = read("src/site/reading-room/app.ts");
const seats = read("src/site/reading-room/seats.ts");

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

test("RR-room 1 the Reading Room is a chart room: chartRoom on the layout, the RoomFolio in place of the RoomHead, no legend row", () => {
  const open = page.match(/<BaseLayout([\s\S]*?)>/);
  assert.ok(open, "the page renders through BaseLayout");
  assert.match(open[1], /\bchartRoom\b/, "the Reading Room passes chartRoom (no band, no footer)");
  assert.ok(page.includes("<RoomFolio room={room} tagline={tagline}>"), "the room's name stands in the folio corner");
  assert.ok(!page.includes("<RoomHead"), "the RoomHead on the sheet retires with the conversion");
  assert.ok(!page.includes('class="legend"'), "no roads out: the strip owns the bottom band");
});

test("RR-room 2 the seed row is the folio's one control, in the colophon's own classes the suites read (#318 re-seated by #462 ruling 2)", () => {
  const folio = between("<RoomFolio", "</RoomFolio>");
  assert.match(folio, /<div class="folio-controls rr-colophon" role="group" aria-label="[^"]+">/, "the colophon is the folio's control group");
  assert.match(folio, /<input class="control" type="number" min="0" max="4294967295" step="1" aria-label="seed">/, "the seed input is a uint32, in the corner's dress");
  assert.match(folio, /<button class="dice rr-dice" type="button"[^>]*aria-label="Random seed">/, "the dice keeps the class the suites click");
  assert.match(folio, /<button class="primary rr-read" type="button">Read<\/button>/, "Read is the room's primary");
  assert.ok(!app.includes("createColophon") && !app.includes("colophon.ts"), "the runtime colophon builder retires: the page seats the row");
});

test("RR-room 3 the Journal is the slip and the instrument is the bottom strip (#462 rulings 5 and 6)", () => {
  assert.match(page, /<Slip id="journal" verb="Watch one" title="The Journal"/, "the journal slip carries the mockup's head");
  const slip = between("<Slip", "</Slip>");
  assert.ok(slip.includes('class="journal-dock"'), "the slip body carries the dock the frame's log and the plate move into");
  assert.match(page, /<div class="strip" role="group" aria-label="The instrument">/, "the strip is the instrument's seat");
  const strip = between('<div class="strip"', "</div>");
  assert.ok(strip.includes('class="scale"'), "the strip carries the scale layer the days and years are marked on");
  assert.ok(page.indexOf('<div class="strip"') > page.indexOf("</Slip>"), "the strip follows the slip in the page");
});

test("RR-room 4 the stage holds the fitted sheet and the gesture box the frame's chart moves into; the Glass stands at the corner", () => {
  assert.match(
    page,
    /<div class="stage">[\s\S]*<div class="sheet" id="sheet">\s*<div id="map-viewport"[^>]*tabindex="0"[^>]*role="application"[^>]*><\/div>\s*<\/div>/,
    "the stage holds the fitted sheet, whose gesture box is empty until the frame's chart moves in",
  );
  assert.match(page, /<div id="rr-mount"><\/div>/, "the frame still mounts on the page (its root stays the arrival's host)");
  assert.ok(page.includes("<Glass />"), "the Glass is the kit's corner cluster (#487; its presses carry data-zoom for the shared keys binding, atelier-kit.test.ts)");
  assert.deepEqual(folioLines(), [["folio-title", "folio-title"], ["folio-sub", "folio-sub"]], "the chart's folio carries the world's name and its survey line");
});

test("RR-room 5 seats.ts seats the frame's parts: chart and status in the stage; strip, slip AND its tab inside the panel the engine hides; log and plate in the slip; the Glass and the room bound", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room");
  assert.match(seats, /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/, "the Glass is the shared controller");
  assert.match(seats, /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/, "its keys and buttons are the kit's");
  assert.match(app, /seatFrame\(frame, stage, furniture\)/, "app.ts seats the frame once, before binding the room");
  // All three slip-side nodes in the ONE append, and none appended anywhere else: a part seated outside the panel stands through every teardown (guard-prover: `document.body.append(slipEl)`; skeptic: the tab).
  assert.match(seats, /scrubber\.panel\.append\(f\.strip, f\.slip, f\.tab\)/, "the strip, the slip and its tab move INTO the panel together");
  for (const node of ["f.strip", "f.slip", "f.tab"]) {
    const found = [...(seats + app).matchAll(new RegExp(String.raw`\.(?:append|appendChild|insertBefore|prepend)\([^)]*${node.replace(".", "\\.")}\b`, "g"))];
    assert.equal(found.length, 1, `${node} is seated exactly once, in the panel (found ${found.length})`);
  }
  assert.match(seats, /restore: \(state\) => zoom\.refit\(state\)/, "the room's refit is the silent one (no settle, no hash)");
  assert.match(app, /room\.layout\(\)/, "the room refits once the chart lands");
  assert.match(seats, /renderScale\(|scaleTicks\(/, "the scale is drawn from the world's days and years");
});

test("RR-room 6 the css: the strip fixed at the bottom, the sheet at the chart-room depth, the frame's sticky shape retired, print standing down", () => {
  assert.match(css, /\.strip\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*0/, "the strip is fixed at the bottom");
  assert.match(css, /#sheet\s*\{[^}]*box-shadow:\s*var\(--stage-shadow\)/, "the sheet rests at the chart-room depth, via the token");
  assert.match(css, /\.stage\s*\{[^}]*padding:\s*var\(--reserve-top/, "the stage reserves the chrome's edges as padding, measured by room.ts");
  // #219's 320px scar, on the rule that now carries it: the bar's well is the shrinking flex item (the range inside it is flex: none).
  assert.match(css, /\.scale-well\s*\{[^}]*flex:\s*1 1[^}]*min-width:\s*0/, "the scale well may shrink below the bar's intrinsic width");
  assert.match(css, /\.scale\s*\{[^}]*margin:\s*0 8px/, "the scale runs the thumb's travel (8px in from each end)");
  assert.doesNotMatch(frameCss, /position:\s*sticky/, "the #442 sticky wrapper retires (ruling 6)");
  assert.match(frameCss, /\.rf-instrument-strip\s*\{[^}]*flex-direction:\s*column-reverse/, "the told row stands above the bar");
  assert.doesNotMatch(frameCss, /\.rf-chart svg\[data-vellum-style\]\s*\{[^}]*box-shadow/, "the frame no longer dresses the sheet: the host's box carries the depth");
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1], /\.strip\s*\{[^}]*display:\s*none/, "the strip prints as nothing");
  assert.match(print[1], /\.stage\s*\{[^}]*position:\s*static/, "the chart prints in flow");
});

test("RR-room 7 the pace is the room's to wire (#493): app.ts binds each of the frame's presses to the engine's setPace and the frame's mark, and the address never carries it (ruled 2026-09-02)", () => {
  assert.match(app, /for \(const \[k, btn\] of frame\.paceButtons\) btn\.addEventListener\("click", \(\) => \{ lc\.setPace\(k\); frame\.markPace\(k\); \}\);/, "one listener per press, the engine first, then the strip's face");
  assert.doesNotMatch(app, /"pace"/, "no hash key: a reload or a shared address plays at the default");
  assert.doesNotMatch(read("src/site/explorer/address.ts"), /pace/i, "the live-address grammar (#192) knows no pace");
});

test("RR-room 8 under reduced motion the pace group hides (#493, ruled 2026-09-02): the engine's Play is a still frame there; the rule is the room's, since the frame's sheet carries no reduced-motion block of its own", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.rf-instrument \.rf-pace \{ display: none; \}\s*\}/);
  assert.doesNotMatch(frameCss, /prefers-reduced-motion/, "and not the frame's (motion.css owns the collapse)");
});
