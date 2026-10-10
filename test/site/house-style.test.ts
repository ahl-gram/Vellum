import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The Specimen Book (Issue #324): the house style lives ONCE in /house.css, linked by BaseLayout on every page. The specs are the 2026-07-30 ledger ratifications (the comment on Issue #324); a change is a re-ratification, so these pins are deliberately literal.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");
const house = () => read("public/house.css");

const ruleOf = (css: string, selector: RegExp): string => {
  const m = css.match(new RegExp(`(^|\\n)\\s*${selector.source}[^{]*\\{([^}]*)\\}`));
  return m ? m[2]! : "";
};

test("the status role's colour is ink-faded, a colour no served pill wears (#324 decision 3)", () => {
  assert.match(ruleOf(house(), /\.status/), /color:\s*var\(--ink-faded\)/, ".status is ink-faded");
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
  const base = ruleOf(css, /input\[type="number"\],\s*select,\s*button/);
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
  wears(
    "src/pages/index.astro",
    /<input id="seed-input" class="control"/,
    "the seed input opts into the idiom (type=text for the iOS numeric keypad, so the attribute selector cannot see it)",
  );
  wears(
    "src/pages/gallery/index.astro",
    /<p class="dateline">\{dateline\}<\/p>/,
    "the gallery's count is the folio corner's line",
  );
  wears("src/pages/seed-of-the-day/index.astro", /class="[^"]*hunt-intro intro/, "the hunt intro is an intro");
  wears(
    "src/pages/seed-of-the-day/index.astro",
    /<p class="dateline" id="dateline">/,
    "the dateline is the folio corner's line",
  );
  wears(
    "src/pages/seed-of-the-day/index.astro",
    /<LegendButton road=\{r\.road\}/,
    "the roads out are legend buttons (the kit's, #487)",
  );
  wears(
    "src/pages/print-room/index.astro",
    /<button class="legend-btn" type="button" data-poster=/,
    "the poster plates are legend buttons",
  );
  wears(
    "src/pages/print-room/index.astro",
    /<button id="pr-draw" class="primary"/,
    "Pull a proof is the room's primary",
  );
  wears(
    "src/pages/explorer/index.astro",
    /class="panel-head archivist-head"/,
    "the Broadside group heads are standing heads",
  );
  wears(
    "src/pages/faq/index.astro",
    /<p class="dateline">\{count\}<\/p>/,
    "the question count is the folio corner's line",
  );
  wears(
    "src/pages/glossary/index.astro",
    /<input class="control" type="search"/,
    "the find box opts into the control idiom",
  );
});

// A rule for a class no element wears paints nothing, so this retire pin stays a source read for part 2i of Issue #779.
test("home's sheet keeps no dress for the notice panel that left with its section (#459)", () => {
  const css = read("public/index.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!css.includes(".notice-body"), "the notice panel left home with its section (#459)");
});

test("the chart quotations equal the render constants they quote (#324)", async () => {
  // The render side is byte-identity domain: read here, never changed.
  const { SITE_PALETTE } = await import("../../src/atlas/palette.ts");
  const { STYLES } = await import("../../src/render/style.ts");
  assert.equal(SITE_PALETTE["--chart-paper"], STYLES.antique.paper, "--chart-paper quotes the antique chart's paper");
  assert.equal(
    SITE_PALETTE["--chart-ink"],
    STYLES.antique.labelColor,
    "--chart-ink quotes the chart's lettering ink (the shadow ink everywhere)",
  );
});
