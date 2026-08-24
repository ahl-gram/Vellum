import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The shell dresses once (#263): the palette is named ONCE in BaseLayout's global style and consumed as var() everywhere it matched exactly.

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
  "public/prospect/index.css",
] as const;

// Host-agnostic sheets (#219 reading frame, #302 living-chart engine dressing): linked by whichever page mounts them, and answering to the same palette discipline.
const SHARED_CSS = ["public/reading-frame.css", "public/living-chart.css"] as const;

// house.css (#324) is linked by BaseLayout on every page; its role specs are pinned in test/site/house-style.test.ts.
const ROOT_CSS = ["public/house.css"] as const;

const AUTHORED_CSS = [...PAGE_CSS, ...SHARED_CSS, ...ROOT_CSS] as const;

// The ratified token set: #263, extended by the PR #269 review (item 4) and the Specimen Book (#324).
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

// Near-miss inks merged into --ink-dark (#269 item 4). #3d2f1f has ONE sanctioned home since #324, the --chart-ink declaration; #5a4326 is banned outright.
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
  // The generated atlas and gallery cannot render through BaseLayout (the single-file download links nothing external), so each declares the tokens in its own :root.
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
    hero: plate, draughtings: [], themes: [], regions: [], prospects: [],
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
  // Consumptions WITH a fallback are excluded: they define their own undeclared behavior (the atlas-download font degradation relies on exactly that).
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
    ["public/motion.css", read("public/motion.css")],
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
  // Alex's #289 review call: two radial washes over --parchment so a long page darkens as it scrolls; the light ellipse paints above the dark one.
  const css = layoutStyle();
  const body = css.match(/body\s*\{([\s\S]*?)\}/);
  assert.ok(body, "the layout style should carry the body rule");
  const light = body[1].search(/radial-gradient\(ellipse at \d+% 1?\d%,\s*rgb\(255 250 235/);
  const dark = body[1].search(/radial-gradient\(ellipse at \d+% 9\d%,\s*rgb\(120 95 50/);
  assert.ok(light > -1, "the body wash lights the top of the sheet");
  assert.ok(dark > -1, "the body wash dims the foot of the sheet");
  assert.ok(light < dark, "the light wash paints above the dark one");
});

// #367: the sheet's lift is ONE token now. Ratified at 0.4 (Alex, 2026-08-12): the armed Explorer's two coincident 0.2 shadows measured as a single 0.385, rounded to a value a stylesheet can own.
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

// The #367 defect: a mount's blanket svg rule dresses the engine's overlays too, doubling the shadow. The opt-out has to WIN, so each rule below is checked for specificity, not text.
/** Rules as (selector, body) pairs, comments stripped FIRST: a regex that swallows a comment inflates the specificity count and let the target mutation walk through on the first cut of this test. */
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

const optOutsFor = (css: string, cls: string) =>
  rulesIn(css).filter((r) => r.selector.split(",").some((s) => s.trim().endsWith(cls)));

/** The attribute the renderer stamps on a chart and nothing else carries: it tells a mount's chart apart from the engine's overlays. */
const CHART_MARKER = "[data-vellum-style]";

/** Every chart mount that dresses a sheet; a NEW host that mounts the engine must join this list or it reintroduces the doubling. */
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
  // Scoped to mount rules only: other rules legitimately rest at sheet depth but hold no engine overlays; the defect is a mount-scoped rule reaching an svg it did not mean to dress.
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
  // A typo'd qualifier matches nothing and silently removes the shadow from every sheet, so pin the marker to the real committed charts.
  for (const chart of ["chart-42-antique.svg", "chart-42-ink.svg", "chart-42-nautical.svg", "chart-42-topographic.svg"]) {
    assert.match(
      read(`public/charts/${chart}`).slice(0, 4000),
      /data-vellum-style="/,
      `${chart} should carry the data-vellum-style marker the mount rules select on`,
    );
  }
});

// #405: the hover raise and press are house values, named in motion.css's :root (the one sheet both the site pages and the standalone atlas page load; BaseLayout cannot reach the atlas).
const RAISE_TOKENS = [
  ["--raise", "-2px"],
  ["--press", "1px"],
  ["--raise-grand", "-3px"],
  ["--raise-shadow", "0 6px 16px rgb(from var(--chart-ink) r g b / 0.2)"],
  ["--press-shadow", "0 1px 3px rgb(from var(--chart-ink) r g b / 0.14)"],
] as const;

test("motion.css declares each raise/press token once, at its ratified value (#405)", () => {
  const css = read("public/motion.css");
  for (const [name, value] of RAISE_TOKENS) {
    assert.equal(
      css.split(`${name}: ${value};`).length - 1, 1,
      `motion.css should declare ${name}: ${value}; exactly once`,
    );
    assert.equal(
      css.split(`${name}:`).length - 1, 1,
      `${name} should have exactly one declaration in motion.css`,
    );
  }
});

// The grander plate, gallery and atlas scales are a question #405 left standing, so each literal is sanctioned at its exact selector and value, and every comma arm of a literal-bearing rule must be individually sanctioned: a new surface cannot borrow an exception.
const SANCTIONED_LIFTS: Record<string, string> = {
  ".plate:hover": "-5px",
  ".plate:active": "-1px",
  ".atlas-sheet figure a img:hover": "-5px",
  ".atlas-sheet figure a img:active": "-1px",
  "figure img:hover": "-4px",
  "figure img:active": "-1px",
};

const atlasStyleBlocks = async (): Promise<string> => {
  const { atlasDocument, atlasPlateFilename } = await import("../../src/atlas/document.ts");
  const plate = { key: "antique", title: "hero", svg: "<svg></svg>" };
  const html = atlasDocument(
    {
      title: "T", subtitle: "s", seed: 7,
      hero: plate, draughtings: [], themes: [], regions: [], prospects: [],
      bannersHtml: "", chronicleHtml: "", gazetteerHtml: "",
    },
    (p, s) => atlasPlateFilename(p, s),
    { anchor: true, motion: true },
  );
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
};

test("no hover or active rule states a lift as a px literal: the raise is a token (#405)", async () => {
  // Scoped to :hover/:active selectors, so keyframe steps pass by construction (their selectors are waypoints like "70%": the paperSettle trap at motion.css:30); translateY(0) is a return to rest, not a lift.
  const { GALLERY_PAGE_CSS } = await import("../../src/cli/gallery.ts");
  const sheets: Array<[string, string]> = [
    ...AUTHORED_CSS.map((p): [string, string] => [p, read(p)]),
    ["public/motion.css", read("public/motion.css")],
    ["public/fonts.css", read("public/fonts.css")],
    ["BaseLayout <style is:global>", layoutStyle()],
    ["src/cli/gallery.ts", GALLERY_PAGE_CSS],
    ["src/atlas/document.ts", await atlasStyleBlocks()],
  ];
  for (const [name, css] of sheets) {
    for (const { selector, body } of rulesIn(css)) {
      if (!/:hover|:active/.test(selector)) continue;
      for (const m of body.matchAll(/translateY\(([^)]*)\)/g)) {
        const arg = m[1].trim();
        if (arg === "0" || arg.startsWith("var(")) continue;
        const sanctioned = selector
          .split(",")
          .every((arm) => SANCTIONED_LIFTS[arm.trim()] === arg);
        assert.ok(
          sanctioned,
          `${name}: "${selector}" lifts by the literal ${arg}; ` +
            `the house lift is translateY(var(--raise)) (or --press, --raise-grand)`,
        );
      }
    }
  }
});

test("#402 the prospect reveal releases its transform: fill backwards, never both/forwards", () => {
  const css = read("public/reading-room/index.css");
  const rule = rulesIn(css).find((r) => /\.rr-prospect img\b/.test(r.selector) && /animation\s*:/.test(r.body));
  assert.ok(rule, ".rr-prospect img carries the plate's entrance animation");
  const anim = /animation\s*:\s*([^;]+)/.exec(rule.body)?.[1] ?? "";
  assert.ok(
    /\bbackwards\b/.test(anim) && !/\b(both|forwards)\b/.test(anim),
    `a both/forwards fill pins the final keyframe's transform at animation priority forever, ` +
      `which outranks the hover lift (measured 2026-08-22, the #402 plate-reader control probe); got "${anim}"`,
  );
});

// #405 identity, not presence: the sweep proves a lift is SOME token; this pins WHICH one each consumer uses. broadside's a.fn and the faq/glossary .toc tips are pinned by tip-affordance's re-pins.
const TOKEN_CONSUMERS: ReadonlyArray<{ file: string; arm: string; lift: string; shadow?: string }> = [
  { file: "public/motion.css", arm: "button:not(.lf-station):not(.place-hit):hover", lift: "--raise", shadow: "--raise-shadow" },
  { file: "public/motion.css", arm: "button:not(.lf-station):not(.place-hit):active", lift: "--press", shadow: "--press-shadow" },
  { file: "public/motion.css", arm: ".topnav a:hover", lift: "--raise" },
  { file: "public/motion.css", arm: "body:has(.room-name) .wordmark a:hover", lift: "--raise" },
  { file: "public/living-chart.css", arm: ".pc-prospect:hover", lift: "--raise" },
];

test("each lifting surface consumes ITS token, not just a token (#405)", () => {
  for (const { file, arm, lift, shadow } of TOKEN_CONSUMERS) {
    const rule = rulesIn(read(file)).find((r) =>
      r.selector.split(",").map((s) => s.trim().replace(/\s+/g, " ")).includes(arm),
    );
    assert.ok(rule, `${file} should carry a rule selecting ${arm}`);
    assert.match(
      rule.body,
      new RegExp(`transform:\\s*translateY\\(var\\(${lift}\\)\\)`),
      `${arm} should lift by var(${lift})`,
    );
    if (shadow) {
      assert.match(
        rule.body,
        new RegExp(`box-shadow:\\s*var\\(${shadow}\\)`),
        `${arm} should cast var(${shadow})`,
      );
    }
  }
});

test("the engine's own sheet states no shadow it could not win (#367)", () => {
  // Host-agnostic (#302): a shadow written here loses every cascade it enters, which is how the first attempt at #367 was written.
  const rule = findRule(read("public/living-chart.css"), ".voyage-overlay");
  assert.ok(rule, "living-chart.css should still carry the .voyage-overlay layout rule");
  assert.ok(
    !/box-shadow/.test(rule.body),
    "the engine sheet must not state a box-shadow it cannot win; the mounts own the fix",
  );
});
