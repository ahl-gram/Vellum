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
  "public/explorer/broadside.css",
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

/**
 * #367 The sheet's lift. `0 12px 34px rgb(from var(--chart-ink) r g b / ...)` was written
 * out SEVEN times across five sheets with no token behind it, so the depth every chart
 * rests at could only be changed in seven places at once. It is one named value now, and
 * these guards keep it that way.
 *
 * The value was ratified at 0.4 (Alex, 2026-08-12), deeper than the old 0.2 on purpose. An
 * armed Explorer had been showing a DOUBLE of the old shadow, because the id-strength
 * `#map svg` rule dressed the survey overlay as well as the chart beneath it, and the
 * doubling is what he liked. Measured before the change: two coincident 0.2 shadows read as
 * a single 0.385 (rms residual 1.08 luminance units over the 25px falloff band), and 0.4 is
 * that number rounded to something a stylesheet can own.
 */
const SHEET_SHADOW_GEOMETRY = "0 12px 34px";

test("BaseLayout declares --sheet-shadow, the one depth every sheet rests at (#367)", () => {
  assert.match(
    layoutStyle(),
    /--sheet-shadow:\s*0 12px 34px rgb\(from var\(--chart-ink\) r g b \/ 0\.4\)/,
    "the layout style should declare --sheet-shadow at the ratified 0.4",
  );
});

test("the sheet shadow is declared once and consumed as a var: no raw geometry survives (#367)", () => {
  for (const page of AUTHORED_CSS) {
    assert.ok(
      !read(page).includes(SHEET_SHADOW_GEOMETRY),
      `${page} still writes the sheet shadow out longhand; it should consume var(--sheet-shadow)`,
    );
  }
  assert.equal(
    layoutStyle().split(SHEET_SHADOW_GEOMETRY).length - 1,
    1,
    "the layout should carry the sheet-shadow geometry exactly once (the token declaration)",
  );
});

/**
 * Every host dresses the svgs in its own chart mount with one blanket rule, which is right
 * for the chart and wrong for anything laid OVER it: the engine appends its overlays as
 * children of that same mount, so an overlay that does not opt out paints a second copy of
 * the sheet's shadow in exact register, and the chart silently sits deeper whenever that
 * overlay is present. That is the #367 defect. It was reported on the Explorer's survey
 * track and found here to affect the Reading Room's mount identically.
 *
 * The opt-out has to WIN, and that is the part worth guarding rather than its presence. The
 * first attempt at this fix put `box-shadow: none` on `.voyage-overlay` in the engine's own
 * sheet, where it is (0,1,0) against a (1,0,1) and a (0,1,1) spill: present, readable, and
 * completely powerless. So each row below is checked for specificity, not for text.
 */
/** Rules as (selector, body) pairs, comments stripped FIRST. Stripping matters: a regex that
 *  scoops up whatever precedes the selector will happily swallow a comment and count the
 *  words in it, which inflates the specificity below and lets the very mutation this guard
 *  exists to catch walk straight through. It did, on the first cut of this test. */
const rulesIn = (css: string): ReadonlyArray<{ selector: string; body: string }> =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1].trim(), body: m[2] }));

/** a,b,c counted as one number; a selector LIST takes its strongest arm. */
const specificity = (sel: string): number =>
  Math.max(...sel.split(",").map((one) => {
    const ids = (one.match(/#[\w-]+/g) || []).length;
    const classes = (one.match(/[.:[][\w-]+/g) || []).length;
    const elements = (one.replace(/[#.:[][\w-]+/g, "").match(/\b[a-z]+\b/g) || []).length;
    return ids * 10000 + classes * 100 + elements;
  }));

const findRule = (css: string, selector: string) =>
  rulesIn(css).find((r) => r.selector === selector);

/** Every rule whose selector's LAST compound targets this overlay class. */
const optOutsFor = (css: string, cls: string) =>
  rulesIn(css).filter((r) => r.selector.split(",").some((s) => s.trim().endsWith(cls)));

/** The attribute the renderer stamps on a chart, and nothing else carries. It is what tells
 *  a mount's dressing apart from the overlays the engine lays on top of it. */
const CHART_MARKER = "[data-vellum-style]";

/** Every chart mount that dresses a sheet. A dated measurement of the markup, not a rule:
 *  a NEW host that mounts the engine joins this, or it reintroduces the doubling. */
const CHART_MOUNTS = [
  { host: "Explorer", file: "public/explorer/index.css", mount: "#map", rule: `#map svg${CHART_MARKER}` },
  { host: "Reading Room", file: "public/reading-frame.css", mount: ".rf-chart", rule: `.rf-chart svg${CHART_MARKER}` },
] as const;

test("each mount dresses its sheet at the house depth, via the token (#367)", () => {
  for (const { host, file, rule } of CHART_MOUNTS) {
    const found = findRule(read(file), rule);
    assert.ok(found, `${host}: ${file} should carry the mount rule ${rule}`);
    assert.match(
      found.body,
      /box-shadow:\s*var\(--sheet-shadow\)/,
      `${host}: ${rule} should rest at the house depth, via the token`,
    );
  }
});

test("no mount dresses a BARE svg: the engine's overlays are not sheets (#367)", () => {
  // The defect. An unqualified descendant rule catches every svg in the mount, and the
  // engine appends its overlays as children of that same mount, so each one wore the
  // hairline and the shadow a second time in exact register and the chart sat deeper.
  // Qualifying the rule fixes it at the source and needs no opt-out, which matters because
  // #302 forbids this sheet from naming the engine's classes at all.
  // Scoped to rules INSIDE a mount. Other things legitimately rest at the sheet depth
  // (the verso's ghost image, the Explorer's slips); they hold no engine overlays, so the
  // qualifier would be meaningless on them. What must never happen is a mount-scoped rule
  // reaching an svg it did not mean to dress.
  for (const { host, file, mount } of CHART_MOUNTS) {
    for (const { selector, body } of rulesIn(read(file))) {
      if (!/box-shadow:\s*var\(--sheet-shadow\)/.test(body)) continue;
      for (const arm of selector.split(",").map((s) => s.trim())) {
        if (!arm.startsWith(mount) || !/\bsvg\b/.test(arm)) continue;
        assert.ok(
          arm.includes(CHART_MARKER),
          `${host}: "${arm}" casts the sheet shadow on an svg in the mount without ` +
            `qualifying on ${CHART_MARKER}, so it dresses the engine's overlays too ` +
            `and the shadow doubles`,
        );
      }
    }
  }
});

test("the chart marker is real: the renderer stamps it on every committed chart (#367)", () => {
  // Without this the guard above is satisfiable by a typo. A qualifier that matches nothing
  // does not double the shadow, it removes it from every sheet on the site, and no
  // structural test would notice a page that had simply gone flat.
  for (const chart of ["chart-42-antique.svg", "chart-42-ink.svg", "chart-42-nautical.svg", "chart-42-topographic.svg"]) {
    assert.match(
      read(`public/charts/${chart}`).slice(0, 4000),
      /data-vellum-style="/,
      `${chart} should carry the data-vellum-style marker the mount rules select on`,
    );
  }
});

test("the engine's own sheet states no shadow it could not win (#367)", () => {
  // The engine is host-agnostic (#302), so it has no host selector to lean on: a bare
  // `.voyage-overlay` is (0,1,0) against the mounts' (1,0,1) and (0,1,1). A box-shadow
  // written here would read as a fix and lose every cascade it entered, which is how the
  // first attempt at #367 was written and why it is worth pinning.
  const rule = findRule(read("public/living-chart.css"), ".voyage-overlay");
  assert.ok(rule, "living-chart.css should still carry the .voyage-overlay layout rule");
  assert.ok(
    !/box-shadow/.test(rule.body),
    "the engine sheet must not state a box-shadow it cannot win; the mounts own the fix",
  );
});
