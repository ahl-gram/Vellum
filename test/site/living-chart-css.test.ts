import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// #302: the engine's overlay dressing is ONE shared sheet, public/living-chart.css, linked by every page that mounts the engine; the CSS twin of the #191 module boundary.
// Three contracts: the sheet dresses every engine-emitted hook; it is host-agnostic (never names a host's own element); and the dressing has ONE home, because two copies drift apart silently.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => {
  try {
    return readFileSync(root(p), "utf8");
  } catch {
    return "";
  }
};

const SHEET = "public/living-chart.css";

// A rule is only as good as the LAST block that declares it, and a commented-out assignment
// reads as code to a substring match; both defeated an earlier cut of the two guards below.
const soleRule = (css: string, selector: string): string => {
  const blocks = [...css.matchAll(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{[^}]*\\}`, "g"))];
  assert.equal(blocks.length, 1, `${SHEET} declares ${selector} ${blocks.length} times, so the last one wins`);
  return blocks[0]![0];
};
const codeOf = (path: string): string =>
  read(path).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

// The nodes place-overlay.ts, voyage-session.ts and chronicle.ts create or tag, matched as literal substrings of the sheet so a rename on either side fails here first.
const ENGINE_RULES = [
  ".place-overlay {",
  ".place-hit {",
  ".place-hit::after",
  "#place-card {",
  "#place-card[hidden]",
  "#place-card.flip-h",
  "#place-card.flip-v",
  ".pc-inner",
  ".pc-name",
  ".pc-rank",
  ".pc-founded",
  ".pc-tongue",
  ".pc-roots",
  ".pc-tale",
  ".place-overlay.scrub .place-hit",
  '.living-chart g.settlement[data-ink="founding"]',
  '.living-chart g.settlement[data-ink="ruin"]',
  ".living-chart g.settlement[data-ink] > text",
  ".voyage-overlay",
  ".voyage-track",
  ".voyage-ship",
  ".voyage-rider",
  ".ages-range",
];

test("the shared sheet dresses every engine-emitted hook (#302)", () => {
  const css = read(SHEET);
  assert.ok(css.length > 0, `${SHEET} exists and is non-empty`);
  for (const rule of ENGINE_RULES) {
    assert.ok(css.includes(rule), `${SHEET} dresses ${rule}`);
  }
});

test("the hit divides by --zoom-k once, on the element; the ring pseudos stay plain (#331)", () => {
  const css = read(SHEET);
  const hit = css.match(/\.place-hit\s*\{[^}]*transform:\s*([^;}]+)/);
  assert.ok(hit, "the hit declares its positioning transform");
  assert.match(
    hit[1],
    /translate\(-50%,\s*-50%\)\s*scale\(calc\(1\s*\/\s*var\(--zoom-k,\s*1\)\)\)/,
    "the whole hit counter-scales, so target AND ring hold their designed size at depth",
  );
  // Exactly ONE division: a second one on the pseudos would shrink the ring k-fold.
  const pseudos = css.match(/\.place-hit[:a-z-]*:after[^{]*\{[^}]*\}|\.place-hit[:a-z-]*::after[^{]*\{[^}]*\}/g) ?? [];
  assert.ok(pseudos.length >= 2, "the ring's rest and shown rules exist");
  for (const rule of pseudos) {
    assert.doesNotMatch(rule, /--zoom-k/, "a ring pseudo must not divide again; its element already does");
  }
});

// ENGINE_RULES matches a bare selector as a SUBSTRING, so it cannot see a rule gutted to display:none, nor a rename to .pc-tongue-note.
test("the philologist's note is dressed, visible, and named the same on both sides (#124)", () => {
  const css = read(SHEET);
  const tongue = soleRule(css, ".pc-tongue");
  assert.match(tongue, /border-top:/, ".pc-tongue lost the hairline that sets the note apart");
  for (const [selector, rule] of [[".pc-tongue", tongue], [".pc-roots", soleRule(css, ".pc-roots")]] as const) {
    assert.doesNotMatch(rule, /display:\s*none/, `${selector} is dressed but hidden`);
  }
  const overlay = codeOf("src/site/living-chart/place-overlay.ts");
  for (const cls of ["pc-tongue", "pc-roots"]) {
    assert.ok(overlay.includes(`className = "${cls}"`), `the engine no longer writes .${cls}`);
  }
});

// A card anchored on the mark's side is shrink-to-fit against the gap it flips AWAY from, so a town near the right edge gets a column, not a card (public/living-chart.css:35 carries the measurement).
test("a flipped card is anchored on the side it flips toward, and reads its anchor from the engine (#124)", () => {
  const css = read(SHEET);
  const flip = soleRule(css, "#place-card.flip-h");
  assert.match(flip, /left:\s*auto/, "flip-h still anchors left, so its width is the wrong gap");
  assert.match(flip, /right:\s*calc\(100% - var\(--pc-nx/, "flip-h does not anchor to the mark from the right");
  assert.match(flip, /transform-origin:\s*100% 0/, "a right-anchored card must counter-scale about its right edge");
  const base = soleRule(css, "#place-card");
  assert.match(base, /left:\s*calc\(var\(--pc-nx/, "the unflipped card no longer reads --pc-nx");
  assert.match(base, /top:\s*calc\(var\(--pc-ny/, "the unflipped card no longer reads --pc-ny");
  const overlay = codeOf("src/site/living-chart/place-overlay.ts");
  for (const prop of ["--pc-nx", "--pc-ny"]) {
    assert.ok(overlay.includes(`setProperty("${prop}"`), `the engine no longer publishes ${prop}`);
  }
  // The overlay box and the hits keep their inline left; only the CARD's must go, and an inline
  // left would silently beat the sheet's flip rule and restore the squeeze.
  const at = overlay.indexOf("function showPlaceCard");
  assert.notEqual(at, -1, "showPlaceCard is gone, so this guard reads an empty slice");
  const body = overlay.slice(at, overlay.indexOf("\n  function ", at + 1));
  assert.doesNotMatch(body, /\.style\.left\s*=/, "the card is positioned with an inline left again");
});

test("the shared sheet is host-agnostic: no host element id, ever (#302)", () => {
  const raw = read(SHEET);
  assert.ok(raw.length > 0, `${SHEET} exists and is non-empty`);
  // Comments may cite a host by name; SELECTORS must not. #place-card is ENGINE-created so it may appear; #map is the Explorer host's own mount.
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!css.includes("#map"), `${SHEET} must never key a rule on a host's #map`);
});

test("the dressing has one home: the Explorer sheet keeps no copy (#302)", () => {
  // Strip comments first: prose may legitimately mention a class name, and the :not(.place-hit) exclusion in the Explorer's button rule stays by design.
  const css = read("public/explorer/index.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const banned = [
    ".place-overlay",
    ".place-hit {",
    ".place-hit::after",
    ".place-hit:hover",
    ".place-hit:focus",
    "#place-card",
    ".pc-",
    "data-ink",
    ".voyage-overlay",
    ".voyage-track",
    ".voyage-ship",
    ".voyage-rider",
    ".ages-range {",
  ];
  for (const s of banned) {
    assert.ok(!css.includes(s), `public/explorer/index.css still carries ${s}; the rule lives in ${SHEET} now`);
  }
});

test("the Explorer host wires the contract: mount class + sheet link (#302)", () => {
  const page = read("src/pages/explorer/index.astro");
  assert.ok(
    /id="map"[^>]*class="[^"]*\bliving-chart\b/.test(page) ||
      /class="[^"]*\bliving-chart\b[^"]*"[^>]*id="map"/.test(page),
    "the Explorer's #map carries the living-chart mount class",
  );
  assert.ok(page.includes("/living-chart.css"), "the Explorer page links /living-chart.css");
  const layout = read("src/layouts/BaseLayout.astro");
  assert.ok(layout.includes("extraCss"), "BaseLayout emits a page's extra stylesheet links");
});

test("the Reading Room host wires the sheet-link half of the contract (#302, #221)", () => {
  // The mount-class half is the frame's (guarded below); the page's half is the extraCss links, and deleting either sheet ships the room live but undressed.
  const page = read("src/pages/reading-room/index.astro");
  assert.ok(page.includes("/living-chart.css"), "the Reading Room page links /living-chart.css");
  assert.ok(page.includes("/reading-frame.css"), "the Reading Room page links /reading-frame.css");
});

test("the reading frame's chart mount carries the class for any future host (#302)", () => {
  const frame = read("src/site/reading-frame/index.ts");
  assert.ok(
    frame.includes('"rf-chart living-chart"'),
    "buildReadingFrame's chart mount carries living-chart alongside rf-chart",
  );
});
