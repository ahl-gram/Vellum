import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The shell dresses once (#263), part B: the recurring parchment/ink palette is
 * named ONCE in BaseLayout's global style block and consumed as var() everywhere
 * it matched exactly. Three guards:
 *   1. the four ratified tokens stay declared, at their ratified values;
 *   2. no tokenized hex ever creeps back into the page css files raw;
 *   3. the drift guard: every custom property consumed WITHOUT a fallback is
 *      declared somewhere the page actually loads (a typo'd var() fails to
 *      inherit silently in the browser, so it must fail loudly here instead).
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const PAGE_CSS = [
  "public/index.css",
  "public/explorer/index.css",
  "public/faq/index.css",
  "public/glossary/index.css",
  "public/print-room/index.css",
  "public/reading-room/index.css",
  "public/seed-of-the-day/index.css",
] as const;

// Not a page's stylesheet: the reading frame (#219) is host-agnostic, so its dressing
// is linked by whatever page mounts the frame (#221's room first) rather than owned by
// one room. The living-chart sheet (#302) is the same shape one layer down: the
// ENGINE's overlay dressing, linked by every page that mounts the engine. Both answer
// to the same palette discipline, so they join every guard below.
const SHARED_CSS = ["public/reading-frame.css", "public/living-chart.css"] as const;

// The root house sheet (#324): linked by BaseLayout on EVERY page beside
// fonts.css and motion.css, so it answers to the palette discipline like a
// page sheet. Its role specs are pinned in test/site/house-style.test.ts.
const ROOT_CSS = ["public/house.css"] as const;

/** Every hand-authored stylesheet the palette rules apply to. */
const AUTHORED_CSS = [...PAGE_CSS, ...SHARED_CSS, ...ROOT_CSS] as const;

// The token set: the four ratified by #263, extended by the PR #269 review
// call (item 4: the near-miss inks merged into --ink-dark and retired), and
// by the Specimen Book (#324, ratified 2026-07-30: the journal hands, the
// control idiom, the moved iron-red, and the --chart-* quotations).
const TOKENS: Record<string, string> = {
  "--ink-dark": "#4a3826",
  "--ink-brown": "#6b5a40",
  "--ink-faded": "#857257",
  "--line-tan": "#b9a77f",
  "--parchment": "#efe6cf",
  "--parchment-panel": "#f4ecd8",
  "--parchment-bright": "#fff7e4",
  "--parchment-deep": "#e6d9b8",
  "--line-faint": "#cdbd97",
  "--ink-annals": "#3f3122",
  "--ink-surveyor": "#7a5f38",
  "--ink-surveyor-faded": "#99855f",
  "--control-cream": "#f8f1e0",
  "--ink-press": "#5d4831",
  "--control-gold": "#f0e3bd",
  "--control-gold-lit": "#f7edcd",
  "--ink-tale": "#54452f",
  "--iron-red": "#7a1f12",
  "--chart-paper": "#f2e8cf",
  "--chart-ink": "#3d2f1f",
};

// Retired inks (PR #269 review, item 4): the old body-text and voyage-track
// near-misses merged into --ink-dark. They must never appear RAW in authored
// css. #3d2f1f gained ONE sanctioned home at #324: the layout's --chart-ink
// declaration (the shadow ink is the chart's lettering ink, quoted by name);
// everywhere else it stays banned, and #5a4326 is banned outright.
const RETIRED_INKS = ["#3d2f1f", "#5a4326"] as const;

const layoutStyle = () => {
  const m = read("src/layouts/BaseLayout.astro").match(/<style is:global>([\s\S]*?)<\/style>/);
  assert.ok(m, "BaseLayout.astro should carry the global shell <style>");
  return m[1];
};

test("BaseLayout declares the four palette tokens at their ratified values (#263)", () => {
  const css = layoutStyle();
  for (const [name, hex] of Object.entries(TOKENS)) {
    assert.match(
      css,
      new RegExp(`${name}:\\s*${hex}`),
      `the layout style should declare ${name}: ${hex}`,
    );
  }
});

test("no tokenized hex survives raw: pages consume the vars, the layout declares each once", () => {
  for (const page of AUTHORED_CSS) {
    const css = read(page).toLowerCase();
    for (const [name, hex] of Object.entries(TOKENS)) {
      assert.ok(
        !css.includes(hex),
        `${page} still carries raw ${hex}; it should consume var(${name})`,
      );
    }
  }
  const layout = layoutStyle().toLowerCase();
  for (const [name, hex] of Object.entries(TOKENS)) {
    const count = layout.split(hex).length - 1;
    assert.equal(count, 1, `the layout should carry ${hex} exactly once (the ${name} declaration)`);
  }
});

test("the retired near-miss inks never reappear (#269 review, item 4)", () => {
  for (const source of AUTHORED_CSS) {
    const text = read(source).toLowerCase();
    for (const hex of RETIRED_INKS) {
      assert.ok(!text.includes(hex), `${source} carries retired ink ${hex}; use var(--ink-dark)`);
    }
  }
  // The layout: #5a4326 stays banned outright; #3d2f1f may appear EXACTLY once,
  // as the --chart-ink token declaration (#324), never as a bare value.
  const layout = read("src/layouts/BaseLayout.astro").toLowerCase();
  assert.ok(!layout.includes("#5a4326"), "the layout carries retired ink #5a4326");
  assert.equal(
    layout.split("#3d2f1f").length - 1, 1,
    "the layout should carry #3d2f1f exactly once, as the --chart-ink declaration",
  );
  assert.match(layout, /--chart-ink:\s*#3d2f1f/, "#3d2f1f's one home is the --chart-ink token");
});

test("the composers dress from the same palette (#269 review follow-up)", async () => {
  // The generated atlas and gallery cannot render through BaseLayout (the
  // single-file atlas download links nothing external), so each document
  // declares the same tokens in its own :root and consumes them as var().
  for (const source of ["src/atlas/document.ts", "src/cli/gallery.ts"]) {
    const text = read(source).toLowerCase();
    for (const [name, hex] of Object.entries(TOKENS)) {
      assert.ok(!text.includes(hex), `${source} carries raw ${hex}; consume var(${name})`);
    }
    for (const hex of RETIRED_INKS) {
      assert.ok(!text.includes(hex), `${source} carries retired ink ${hex}; use var(--ink-dark)`);
    }
  }

  const { SITE_PALETTE } = await import("../../src/atlas/palette.ts");
  assert.deepEqual(
    { ...SITE_PALETTE },
    TOKENS,
    "src/atlas/palette.ts must carry exactly the layout's token set (names and values)",
  );

  const { atlasDocument, atlasPlateFilename } = await import("../../src/atlas/document.ts");
  const plate = { key: "antique", title: "hero", svg: "<svg></svg>" };
  const fixture = {
    title: "T", subtitle: "s", seed: 7,
    hero: plate, draughtings: [], themes: [], regions: [],
    bannersHtml: "", chronicleHtml: "", gazetteerHtml: "",
  };
  for (const [label, opts] of [
    ["deployed", { anchor: true, motion: true }],
    ["offline download", { anchor: false, motion: false }],
  ] as const) {
    const html = atlasDocument(fixture, (p, s) => atlasPlateFilename(p, s), opts).toLowerCase();
    for (const [name, hex] of Object.entries(TOKENS)) {
      const count = html.split(hex).length - 1;
      assert.equal(count, 1, `the ${label} atlas should carry ${hex} exactly once (the ${name} :root declaration)`);
    }
  }
});

test("drift guard: every var() consumed without a fallback is declared (#263)", async () => {
  // Declarations may live in the page css itself, the shared fonts.css and
  // motion.css the layout links on every page, the layout's own style block,
  // or the composers' inlined palette :root. Consumptions WITH a fallback are
  // excluded: they define their own behavior when undeclared (the
  // atlas-download font degradation relies on exactly that).
  const { paletteRootCss } = await import("../../src/atlas/palette.ts");
  const declared = new Set<string>();
  const declarationSources = [
    ...AUTHORED_CSS.map(read),
    read("public/fonts.css"),
    read("public/motion.css"),
    layoutStyle(),
    paletteRootCss(),
  ];
  for (const text of declarationSources) {
    for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) declared.add(m[1]);
  }

  const consumers: Array<[string, string]> = [
    ...AUTHORED_CSS.map((p): [string, string] => [p, read(p)]),
    ["BaseLayout <style is:global>", layoutStyle()],
    ["src/atlas/document.ts", read("src/atlas/document.ts")],
    ["src/cli/gallery.ts", read("src/cli/gallery.ts")],
  ];
  for (const [name, text] of consumers) {
    for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g)) {
      assert.ok(declared.has(m[1]), `${name} consumes ${m[1]} but nothing the page loads declares it`);
    }
  }
});

test("the daylight wash: every sheet is lit from the top and dims as it runs on (#289)", () => {
  // Alex's call at the #289 review, adapted from his claude.ai ideas sheet:
  // the shell body carries two soft radial washes over --parchment, a warm
  // light anchored near the top of the document and an umber one at the
  // bottom, so a long page gradually darkens as it scrolls. Order matters:
  // the light ellipse paints above the dark one.
  const css = layoutStyle();
  const body = css.match(/body\s*\{([\s\S]*?)\}/);
  assert.ok(body, "the layout style should carry the body rule");
  const light = body[1].search(/radial-gradient\(ellipse at \d+% 1?\d%,\s*rgb\(255 250 235/);
  const dark = body[1].search(/radial-gradient\(ellipse at \d+% 9\d%,\s*rgb\(120 95 50/);
  assert.ok(light > -1, "the body wash lights the top of the sheet");
  assert.ok(dark > -1, "the body wash dims the foot of the sheet");
  assert.ok(light < dark, "the light wash paints above the dark one");
});
