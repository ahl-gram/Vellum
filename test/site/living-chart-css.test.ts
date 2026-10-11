import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The engine's overlay dressing is ONE shared sheet, public/living-chart.css (Issue #302), the CSS twin of the Issue #191 boundary: it dresses every engine-emitted hook, names no host's own element, and has ONE home.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => {
  try {
    return readFileSync(root(p), "utf8");
  } catch {
    return "";
  }
};

const SHEET = "public/living-chart.css";

// A rule is only as good as the LAST block that declares it, and a commented-out assignment reads as code to a substring match.
const soleRule = (css: string, selector: string): string => {
  const blocks = [...css.matchAll(new RegExp(`${selector.replace(/\./g, "\\.")}\\s*\\{[^}]*\\}`, "g"))];
  assert.equal(blocks.length, 1, `${SHEET} declares ${selector} ${blocks.length} times, so the last one wins`);
  return blocks[0]![0];
};
const codeOf = (path: string): string =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

// The nodes place-overlay.ts, voyage-session.ts and chronicle.ts create or tag, matched as literal substrings of the sheet so a rename on either side fails here first.
const ENGINE_RULES = [
  ".place-overlay {",
  ".place-hit {",
  ".place-hit::after",
  "#place-card {",
  "#place-card[hidden]",
  "#place-card.pinned.pc-scrolls .pc-inner",
  "#place-card.flip-h",
  "#place-card.flip-v",
  ".pc-inner",
  ".pc-name",
  ".pc-rank",
  ".pc-founded",
  ".pc-former",
  ".pc-tongue",
  ".pc-roots",
  ".pc-tale",
  ".pc-acts",
  ".pc-prospect",
  ".pc-lay",
  ".place-overlay.scrub .place-hit",
  ".place-hit.pc-near",
  ".place-overlay.pc-over .place-hit:not(.pc-own)",
  ".place-hit.pc-near::after",
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
    hit[1]!,
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

test("the town raised over an overlapping neighbour stays below the card it opens (#632)", () => {
  const css = read(SHEET);
  const z = (selector: string) => Number((soleRule(css, selector).match(/z-index:\s*(-?\d+)/) ?? [])[1]);
  const raised = z(".place-hit.pc-near"),
    card = z("#place-card");
  assert.ok(Number.isFinite(raised) && Number.isFinite(card), `both declare a z-index (${raised}, ${card})`);
  assert.ok(
    raised > 0 && raised < card,
    `a raised town paints over its neighbours (${raised} > 0) and under the card (${raised} < ${card})`,
  );
});

test("the card's action row, its filing press and its refusing face are each declared once (#522; kept for Issue #779 part 2i: a second block repeating the first shows nowhere, and CD57 reads the dress)", () => {
  const css = read(SHEET);
  for (const selector of [".pc-acts", ".pc-lay", ".pc-lay.dim"]) soleRule(css, selector);
});

// ENGINE_RULES matches a bare selector as a SUBSTRING, so it cannot see a rule gutted to display:none, nor a rename to .pc-tongue-note.
test("the philologist's note is dressed, visible, and named the same on both sides (#124)", () => {
  const css = read(SHEET);
  const tongue = soleRule(css, ".pc-tongue");
  assert.match(tongue, /border-top:/, ".pc-tongue lost the hairline that sets the note apart");
  for (const [selector, rule] of [
    [".pc-tongue", tongue],
    [".pc-roots", soleRule(css, ".pc-roots")],
  ] as const) {
    assert.doesNotMatch(rule, /display:\s*none/, `${selector} is dressed but hidden`);
  }
  const overlay = codeOf("src/site/living-chart/place-overlay.ts");
  for (const cls of ["pc-tongue", "pc-roots"]) {
    assert.ok(overlay.includes(`className = "${cls}"`), `the engine no longer writes .${cls}`);
  }
});

// A card anchored on the mark's side is shrink-to-fit against the gap it flips AWAY from, so a town near the right edge gets a column, not a card (public/living-chart.css carries the measurement).
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
  // The overlay box and the hits keep their inline left; only the CARD's must go, or it would beat the sheet's flip rule and restore the squeeze.
  const at = overlay.indexOf("function showPlaceCard");
  assert.notEqual(at, -1, "showPlaceCard is gone, so this guard reads an empty slice");
  const body = overlay.slice(at, overlay.indexOf("\n  function ", at + 1));
  assert.doesNotMatch(body, /\.style\.left\s*=/, "the card is positioned with an inline left again");
});

// A variant missing the clamp vars simply never clamps, which no JS test can see: the engine publishes the same two properties either way.
test("every card variant reads the clamp, and reads it INSIDE the counter-scale (#387/#388)", () => {
  const css = read(SHEET);
  const variants = ["#place-card", "#place-card.flip-h", "#place-card.flip-v", "#place-card.flip-h.flip-v"];
  for (const selector of variants) {
    const transform = soleRule(css, selector).match(/transform:\s*([^;}]+)/);
    assert.ok(transform, `${selector} declares no transform`);
    const t = transform[1]!.replace(/\s+/g, " ");
    for (const prop of ["--pc-dx", "--pc-dy"]) {
      assert.ok(t.includes(prop), `${selector} never reads ${prop}, so that variant of the card cannot clamp`);
    }
    assert.ok(
      t.startsWith("scale(calc(1 / var(--zoom-k, 1))) translate("),
      `${selector} does not lead with its counter-scale`,
    );
    assert.equal(
      t.split("translate(").length - 1,
      1,
      `${selector} carries a second translate, and one of them is outside the counter-scale`,
    );
    assert.equal(t.split("scale(").length - 1, 1, `${selector} carries a second scale`);
  }
  const overlay = codeOf("src/site/living-chart/place-overlay.ts");
  for (const prop of ["--pc-dx", "--pc-dy"]) {
    assert.ok(overlay.includes(`setProperty("${prop}"`), `the engine no longer publishes ${prop}`);
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
