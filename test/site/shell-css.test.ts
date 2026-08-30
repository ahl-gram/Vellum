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
  "public/ribbon/index.css",
] as const;

// Host-agnostic sheets (#219 reading frame, #302 living-chart engine dressing): linked by whichever page mounts them, and answering to the same palette discipline.
const SHARED_CSS = ["public/reading-frame.css", "public/living-chart.css"] as const;

// house.css (#324) and atelier.css (#487, the room furniture) are linked by BaseLayout on every page; the role specs are pinned in test/site/house-style.test.ts.
const ROOT_CSS = ["public/house.css", "public/atelier.css"] as const;

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

test("the walnut deep: one declaration, the vignette over the lit walnut, consumed by ground and band alike (#461 ruling 2)", () => {
  // The daylight wash's dark successor (ruled 2026-08-25): the atelier-map mockup's own body deep, token-derived (the #55402a center is the SAME color-mix Act I ratified for the stage), declared ONCE as --the-deep so the fixed ground layer and the running band can never drift apart.
  const css = layoutStyle();
  const deep = css.match(/--the-deep:\s*([\s\S]*?);/);
  assert.ok(deep, "the layout style should declare --the-deep once");
  const vignette = deep[1].search(/radial-gradient\(120% 90% at 50% 30%,\s*rgb\(from var\(--ink-dark\) r g b \/ 0\)/);
  const walnut = deep[1].search(/radial-gradient\(80% 70% at 30% 20%,\s*color-mix\(in srgb, var\(--ink-dark\) 90%, var\(--parchment\) 10%\) 0%,\s*var\(--ink-dark\) 55%,\s*var\(--chart-ink\) 100%\)/);
  assert.ok(vignette > -1, "the deep's darkening vignette is present");
  assert.ok(walnut > -1, "the deep's lit-walnut radial is present, token-derived (no raw #55402a)");
  assert.ok(vignette < walnut, "the vignette paints above the walnut");
  assert.equal(css.split("--the-deep:").length - 1, 1, "--the-deep is declared exactly once");
  const before = css.match(/body::before\s*\{([\s\S]*?)\}/);
  assert.ok(before && /background:\s*var\(--the-deep\)/.test(before[1]), "the fixed ground layer consumes var(--the-deep)");
  assert.ok(before && /position:\s*fixed/.test(before[1]), "the ground layer is fixed (iOS treats background-attachment: fixed as scroll)");
  const band = css.match(/\.band::before\s*\{([\s\S]*?)\}/);
  assert.ok(band && /background:\s*var\(--the-deep\)/.test(band[1]), "the band clips the SAME deep, via the token");
  assert.ok(band && /clip-path:\s*inset\(0 0 calc\(100% - var\(--band-h\)\) 0\)/.test(band[1]), "the band is the deep clipped to --band-h, so the reserved ground cannot misalign");
  const daylight = css.search(/rgb\(255 250 235/);
  assert.equal(daylight, -1, "the light wash retired with the ground (#461 ruling 2)");
});

test("the interim desk panel: an unconverted room's main stands on parchment, not the deep (#461)", () => {
  // Scaffolding with a stated retirement path: a page passes desk="open" once its own conversion sub (7-9) dresses it for the deep, and the class stops rendering.
  const css = layoutStyle();
  const panel = css.match(/main\.desk-panel\s*\{([\s\S]*?)\}/);
  assert.ok(panel, "the layout style should carry main.desk-panel");
  assert.match(panel[1], /background:\s*var\(--parchment\)/, "the panel is the parchment the page css was tuned on");
  assert.match(panel[1], /box-shadow:\s*var\(--sheet-shadow\)/, "the panel rests at the house depth");
});

test("the chrome passes the hand through: drags over the fixed cluster reach the chart, links stay live (#461, skeptic finding 2)", () => {
  // A 485x79 dead drag zone under the cluster on home; the mockup's own idiom (stage.css uses it five times) is none-on-container, auto-on-interactive.
  const css = layoutStyle();
  const chrome = css.match(/header\.chrome\s*\{([\s\S]*?)\}/);
  assert.ok(chrome && /pointer-events:\s*none/.test(chrome[1]), "the chrome container passes pointer events through");
  assert.match(css, /header\.chrome a,\s*header\.chrome \.rooms-reveal\s*\{[^}]*pointer-events:\s*auto/, "the links and the phone reveal take the hand back");
});

test("print is paper all the way down: the dark ground resets with the chrome it carried (#454 open decision 4, skeptic finding 5)", () => {
  const print = layoutStyle().match(/@media print\s*\{([\s\S]*?)\n\}/);
  assert.ok(print, "the layout style carries the print block");
  assert.match(print[1], /body\s*\{[^}]*background:\s*none/, "the body's walnut ground must not print (near-black pages with background graphics on)");
});

test("the deep's focus ring: the chrome on the walnut brightens the ring, paper keeps ink-dark (#324 decision 6, re-ratified at #461)", () => {
  // Guard-prover round 1 (2026-08-26) proved this override unguarded: reverting it ships an invisible ink-dark ring on the deep and nothing reds. house-style.test.ts keeps pinning the paper side.
  const ring = layoutStyle().match(/header\.chrome a:focus-visible,\s*footer a:focus-visible\s*\{([\s\S]*?)\}/);
  assert.ok(ring, "the layout style should carry the deep-chrome focus override");
  assert.match(ring[1], /outline-color:\s*var\(--parchment-bright\)/, "the ring on the deep is parchment-bright (#455's precedent for controls on the walnut)");
});

// #367: the sheet's lift is ONE token now. Ratified at 0.4 (Alex, 2026-08-12): the armed Explorer's two coincident 0.2 shadows measured as a single 0.385, rounded to a value a stylesheet can own.
const SHEET_SHADOW_GEOMETRY = "0 12px 34px";
const STAGE_SHADOW_GEOMETRY = "0 18px 60px";

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

test("the stage shadow is declared once and consumed as a var: the chart-room depth has one home too (#463)", () => {
  for (const page of AUTHORED_CSS) {
    assert.ok(
      !read(page).includes(STAGE_SHADOW_GEOMETRY),
      `${page} still writes the stage shadow out longhand; it should consume var(--stage-shadow)`,
    );
  }
  assert.equal(
    layoutStyle().split(STAGE_SHADOW_GEOMETRY).length - 1,
    1,
    "the layout should carry the stage-shadow geometry exactly once (the token declaration)",
  );
  assert.match(layoutStyle(), /--stage-shadow:\s*0 18px 60px rgb\(from var\(--chart-ink\) r g b \/ 0\.55\);/, "the token is the mockup's own dress");
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
  { host: "Explorer", file: "public/explorer/index.css", mount: "#map", rule: "#sheet", token: "--stage-shadow" },
  { host: "Reading Room", file: "public/reading-room/index.css", mount: ".rf-chart", rule: "#sheet", token: "--stage-shadow", sweep: ["public/reading-frame.css"] },
] as const;
const DEPTH_TOKENS = /box-shadow:\s*var\(--(?:sheet|stage)-shadow\)/;

// The qualifier itself (#463 body: "the chart mounts' svg[data-vellum-style] qualifier stays or the #367 shadow doubling returns"), pinned as a presence beside the BARE-svg sweep below.
const QUALIFIED_CHART_RULES = [
  ["public/explorer/index.css", `#map svg${CHART_MARKER}`],
  ["public/reading-frame.css", `.rf-chart svg${CHART_MARKER}`],
] as const;

test("each chart mount keeps its qualified chart rule (#367, #463)", () => {
  for (const [file, selector] of QUALIFIED_CHART_RULES) {
    const found = findRule(read(file), selector);
    assert.ok(found, `${file} should still carry ${selector}`);
    assert.match(found.body, /width:\s*100%/, `${selector} sizes the chart to its box`);
  }
});

test("each mount dresses its sheet at the house depth, via the token (#367)", () => {
  for (const { host, file, rule, token } of CHART_MOUNTS) {
    const found = findRule(read(file), rule);
    assert.ok(found, `${host}: ${file} should carry the mount rule ${rule}`);
    assert.match(
      found.body,
      new RegExp(`box-shadow:\\s*var\\(${token}\\)`),
      `${host}: ${rule} should rest at its depth, via ${token}`,
    );
  }
});

test("no mount dresses a BARE svg: the engine's overlays are not sheets (#367)", () => {
  // Scoped to mount rules only: other rules legitimately rest at sheet depth but hold no engine overlays; the defect is a mount-scoped rule reaching an svg it did not mean to dress.
  for (const { host, file, mount, ...rest } of CHART_MOUNTS) {
    const sweep = "sweep" in rest ? rest.sweep : [];
    for (const { selector, body } of [file, ...sweep].flatMap((f) => rulesIn(read(f)))) {
      if (!DEPTH_TOKENS.test(body)) continue;
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

test("--raise-grand is retired: no declaration, no consumer (#470 ratified 2026-08-24, the #405 table update)", () => {
  // Its last consumer, Go Deeper's .card:hover, left at #459; Act II re-ratifies a grand lift if its dark-room cards want one.
  for (const sheet of [...AUTHORED_CSS, "public/motion.css", "public/house.css"]) {
    assert.ok(!read(sheet).includes("--raise-grand"), `${sheet} must not declare or consume the retired --raise-grand`);
  }
});

test("the plate dress rests flat and tips on hover (#130, the consumer is now print-room)", () => {
  const css = read("public/motion.css");
  const base = css.match(/\.plate\s*\{([^}]*)\}/);
  assert.ok(base, ".plate base rule exists in motion.css");
  assert.ok(!/rotate\(/.test(base[1]), ".plate rests flat (no resting rotate)");
  const hover = css.match(/\.plate:hover\s*\{([^}]*)\}/);
  assert.ok(
    hover && /rotate\(/.test(hover[1]) && /translateY\(/.test(hover[1]),
    ".plate tips (rotate) and lifts (translateY) under the hand",
  );
});

// The #289 ratified call, moved here from homepage-plates.test.ts when #470 retired that file with home's plates: the guard is about motion.css's scoping, not the plates.
test("the wordmark tips under the hand on room pages, and stays still on home (#289)", () => {
  const css = read("public/motion.css");
  // Keyed on .wordmark, not h1 (#288): on a room page the h1 is the room name with no link to tip, so keying on h1 would silently select nothing.
  const hover = css.match(/body:has\(\.room-name\) \.wordmark a:hover,\s*body:has\(\.room-name\) \.wordmark a:focus-visible\s*\{([^}]*)\}/);
  assert.ok(hover, "the room-scoped wordmark hover rule should exist in motion.css");
  assert.ok(
    /rotate\(/.test(hover[1]) && /translateY\(/.test(hover[1]),
    "the wordmark should tip (rotate) and lift (translateY) under the hand",
  );
  assert.ok(
    !/(?<!\(\.room-name\) )\.wordmark a:hover/.test(css.replace(/body:has\(\.room-name\) \.wordmark a:hover/g, "")),
    "no unscoped .wordmark a:hover may leak the tip onto home",
  );
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
    ["src/pages/index.astro <style>", [...read("src/pages/index.astro").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n")],
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
            `the house lift is translateY(var(--raise)) (or --press)`,
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
  { file: "public/motion.css", arm: ".rooms a:hover", lift: "--raise" },
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
