import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Specimen Book (#324): the house style lives ONCE in /house.css, linked by BaseLayout on every page. The specs are the 2026-07-30 ledger ratifications (the comment on #324); a change is a re-ratification, so these pins are deliberately literal.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");
const house = () => read("public/house.css");

const ruleOf = (css: string, selector: RegExp): string => {
  const m = css.match(new RegExp(`(^|\\n)\\s*${selector.source}[^{]*\\{([^}]*)\\}`));
  return m ? m[2] : "";
};

test("BaseLayout links /house.css on every page, after motion.css and before extraCss (#324)", () => {
  const layout = read("src/layouts/BaseLayout.astro");
  const motion = layout.indexOf(`<link rel="stylesheet" href="/motion.css">`);
  const houseLink = layout.indexOf(`<link rel="stylesheet" href="/house.css">`);
  const extra = layout.indexOf("extraCss.map");
  assert.ok(houseLink > -1, "BaseLayout should link /house.css");
  assert.ok(motion > -1 && motion < houseLink, "/house.css follows /motion.css");
  assert.ok(extra > houseLink, "/house.css precedes the extraCss links so page rules keep the last word");
});

test("the intro role: flourish italic, ink-brown, centered (#324 decision 1)", () => {
  const rule = ruleOf(house(), /\.intro/);
  assert.match(rule, /var\(--font-flourish/, ".intro wears the flourish face");
  assert.match(rule, /font-style:\s*italic/, ".intro is italic");
  assert.match(rule, /color:\s*var\(--ink-brown\)/, ".intro is ink-brown");
  assert.match(rule, /text-align:\s*center/, ".intro is centered");
});

test("no page sheet re-binds the intro voice (#324)", () => {
  for (const page of [
    "public/index.css", "public/explorer/index.css", "public/explorer/broadside.css",
    "public/faq/index.css",
    "public/glossary/index.css", "public/print-room/index.css",
    "public/reading-room/index.css", "public/seed-of-the-day/index.css",
  ]) {
    const css = read(page);
    assert.ok(
      !/\.intro[^{]*\{[^}]*(font-family|font-style|color)/.test(css),
      `${page} re-binds the intro voice; the house sheet owns it`,
    );
  }
});

test("the status role: body italic, ink-faded (#324 decision 3)", () => {
  const rule = ruleOf(house(), /\.status/);
  assert.match(rule, /font-style:\s*italic/, ".status is italic");
  assert.match(rule, /color:\s*var\(--ink-faded\)/, ".status is ink-faded");
  assert.ok(!/font-family/.test(rule), ".status stays in the body face");
});

test("the warning slip: 6px, line-tan, ink-brown, body size (#324 decision 4)", () => {
  const rule = ruleOf(house(), /\.warning/);
  assert.match(rule, /border-radius:\s*6px/, ".warning wears the panel radius");
  assert.match(rule, /border:\s*1px solid var\(--line-tan\)/, ".warning wears the outer hairline");
  assert.match(rule, /color:\s*var\(--ink-brown\)/, ".warning speaks ink-brown");
  assert.match(rule, /background:\s*var\(--parchment-panel\)/, ".warning sits on panel paper");
  assert.ok(!/font-size/.test(rule), ".warning keeps the body size");
});

test("the archivist's label, two tiers (#324 decision 5, candidate B)", () => {
  const label = ruleOf(house(), /\.archivist-label/);
  assert.match(label, /font-size:\s*0\.72rem/);
  assert.match(label, /letter-spacing:\s*0\.1em/);
  assert.match(label, /font-weight:\s*400/);
  assert.match(label, /text-transform:\s*uppercase/);
  assert.match(label, /color:\s*var\(--ink-faded\)/);
  const head = ruleOf(house(), /\.archivist-head/);
  assert.match(head, /font-size:\s*0\.82rem/);
  assert.match(head, /letter-spacing:\s*0\.18em/);
  assert.match(head, /font-weight:\s*600/);
  assert.match(head, /text-transform:\s*uppercase/);
  assert.match(head, /color:\s*var\(--ink-faded\)/);
});

test("the control idiom: cream, 1.5px ink-dark, 4px, one primary (#324)", () => {
  const css = house();
  const base = ruleOf(css, /input\[type="number"\], select, button/);
  assert.match(base, /background:\s*var\(--control-cream\)/);
  assert.match(base, /border:\s*1\.5px solid var\(--ink-dark\)/);
  assert.match(base, /border-radius:\s*4px/);
  assert.match(base, /font-size:\s*0\.95rem/);
  const primary = ruleOf(css, /button\.primary/);
  assert.match(primary, /background:\s*var\(--ink-dark\)/);
  assert.match(primary, /color:\s*var\(--chart-paper\)/, "the primary's lettering is the chart paper");
  const primaryHover = ruleOf(css, /button\.primary:hover/);
  assert.match(primaryHover, /background:\s*var\(--ink-press\)/);
  const link = ruleOf(css, /a\.control/);
  assert.match(link, /text-decoration:\s*none/, "a.control dresses a link as the idiom");
  assert.match(css, /:not\(\.place-hit\):hover/, "the hover excludes the engine's invisible hit targets");
});

test("the focus ring: 2px ink-dark, everywhere (#324 decision 6)", () => {
  assert.match(
    house(),
    /:focus-visible[^{]*\{[^}]*outline:\s*2px solid var\(--ink-dark\)/,
    "the house sheet binds the ratified focus ring",
  );
  assert.ok(
    !/var\(--ink-brown\)/.test(ruleOf(read("public/living-chart.css"), /\.ages-range:focus-visible/)),
    "the ages-range ring conforms to ink-dark",
  );
});

test("the roles are worn: page markup carries the shared classes (#324)", () => {
  const wears = (file: string, pattern: RegExp, what: string) => {
    assert.match(read(file), pattern, `${file}: ${what}`);
  };
  wears("src/pages/index.astro", /<button[^>]*class="[^"]*primary/, "Draw it joins the primary idiom");
  wears("src/pages/index.astro", /<input id="seed-input" class="control"/,
    "the seed input opts into the idiom (type=text for the iOS numeric keypad, so the attribute selector cannot see it)");
  wears("src/pages/index.astro", /class="notice-head archivist-head"/,
    "the Notice to Mariners head is a standing head (the audit's missed block; candidate C, 2026-07-30)");
  wears("src/pages/gallery/index.astro", /class="sub intro"/, "the gallery sub is an intro");
  wears("src/pages/seed-of-the-day/index.astro", /class="[^"]*hunt-intro intro/, "the hunt intro is an intro");
  wears("src/pages/seed-of-the-day/index.astro", /class="[^"]*dateline archivist-head/, "the dateline is a standing head");
  wears("src/pages/seed-of-the-day/index.astro", /<a[^>]*class="[^"]*control/, "the actions link wears the idiom");
  wears("src/pages/print-room/index.astro", /class="[^"]*desk-head archivist-head/, "the desk head is a standing head");
  wears("src/pages/print-room/index.astro", /class="[^"]*offering-field archivist-label/, "the offering field is an inline label");
  // #270 promoted the Explorer's group heads from the inline tier to the standing tier, the print-room desk-head precedent.
  wears("src/pages/explorer/index.astro", /class="panel-head archivist-head"/, "the Broadside group heads are standing heads");
  wears("src/pages/faq/index.astro", /<strong class="archivist-label">/, "the TOC heading is an inline label");
  wears("src/pages/glossary/index.astro", /<strong class="archivist-label">/, "the TOC heading is an inline label");
});

test("the Notice to Mariners folds into the families (#324 follow-up, candidate C)", () => {
  // Alex chose the full fold from the rendered candidates (2026-07-30): the panel family, the archivist standing head, the flourish body.
  const css = read("public/index.css");
  assert.match(css, /\.notice[^{]*\{[^}]*border-radius:\s*6px/, ".notice wears the panel radius");
  assert.ok(
    !/\.notice-head[^{]*\{[^}]*(font-size|letter-spacing|color)/.test(css),
    ".notice-head's voice belongs to .archivist-head now",
  );
  assert.match(
    css,
    /figcaption, \.card p, \.underhood, \.notice-body \{/,
    ".notice-body joins home's flourish asides",
  );
});

test("the old page-local skins are gone (#324)", () => {
  assert.ok(
    !/border-radius:\s*2px/.test(read("public/index.css")),
    "the seedrow's 2px corners joined the idiom",
  );
  for (const page of [
    "public/explorer/index.css", "public/explorer/broadside.css",
    "public/print-room/index.css",
    "public/reading-room/index.css", "public/seed-of-the-day/index.css",
  ]) {
    assert.ok(
      !/select,\s*button[^{]*\{[^}]*background/.test(read(page)),
      `${page} re-declares the control skin; the house sheet owns it`,
    );
  }
});

test("no token value smuggled past the guards in rgb() form (#324)", async () => {
  // rgb(74 56 38 / a) IS --ink-dark with alpha, invisible to the hex guard; alpha over a token is written rgb(from var(--token) r g b / a) so the quotation stays attached to its name.
  const { SITE_PALETTE } = await import("../../src/atlas/palette.ts");
  const sources = [
    "public/index.css", "public/explorer/index.css", "public/explorer/broadside.css",
    "public/faq/index.css",
    "public/glossary/index.css", "public/print-room/index.css",
    "public/reading-room/index.css", "public/seed-of-the-day/index.css",
    "public/reading-frame.css", "public/living-chart.css", "public/motion.css",
    "public/house.css", "src/layouts/BaseLayout.astro",
    "src/atlas/document.ts", "src/cli/gallery.ts",
  ];
  for (const [name, hex] of Object.entries(SITE_PALETTE)) {
    const h = String(hex);
    if (!/^#[0-9a-f]{6}$/.test(h)) continue;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const smuggled = new RegExp(`rgb\\(\\s*${r}\\s+${g}\\s+${b}\\b`);
    for (const source of sources) {
      assert.ok(
        !smuggled.test(read(source)),
        `${source} carries ${name}'s value as raw rgb(${r} ${g} ${b}); use rgb(from var(${name}) r g b / a)`,
      );
    }
  }
});

test("the chart quotations equal the render constants they quote (#324)", async () => {
  // The --chart-* namespace exists so a site-side value BORROWED from the chart renderer can never silently drift; the render side is byte-identity domain, read here, never changed.
  const { SITE_PALETTE } = await import("../../src/atlas/palette.ts");
  const { STYLES } = await import("../../src/render/style.ts");
  assert.equal(SITE_PALETTE["--chart-paper"], STYLES.antique.paper,
    "--chart-paper quotes the antique chart's paper");
  assert.equal(SITE_PALETTE["--chart-ink"], STYLES.antique.labelColor,
    "--chart-ink quotes the chart's lettering ink (the shadow ink everywhere)");
});
