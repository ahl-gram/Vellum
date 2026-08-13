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
