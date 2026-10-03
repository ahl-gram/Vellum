import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rulesIn } from "../../test-support/shell-css-rules.ts";
import { SITE_SHEETS } from "../../test-support/site-sheets.ts";

// The shell dresses once (Issue #263): the palette is named ONCE in BaseLayout's global style and consumed as var() everywhere it matched exactly.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

// The ratified token set (Issue #263, the PR #269 review item 4, Issue #324).
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

// Near-miss inks merged into --ink-dark: #3d2f1f has ONE sanctioned home, the --chart-ink declaration; #5a4326 is banned outright.
const RETIRED_INKS = ["#3d2f1f", "#5a4326"] as const;

const layoutStyle = () => {
  const m = read("src/layouts/BaseLayout.astro").match(/<style is:global>([\s\S]*?)<\/style>/);
  assert.ok(m, "BaseLayout.astro should carry the global shell <style>");
  return m[1]!;
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
  for (const page of SITE_SHEETS) {
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
  for (const source of SITE_SHEETS) {
    const text = read(source).toLowerCase();
    for (const hex of RETIRED_INKS) {
      assert.ok(!text.includes(hex), `${source} carries retired ink ${hex}; use var(--ink-dark)`);
    }
  }
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
    ...SITE_SHEETS.map(read),
    layoutStyle(),
    paletteRootCss(),
  ];
  for (const text of declarationSources) {
    for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) declared.add(m[1]!);
  }

  const consumers: Array<[string, string]> = [
    ...SITE_SHEETS.map((p): [string, string] => [p, read(p)]),
    ["BaseLayout <style is:global>", layoutStyle()],
    ["src/atlas/document.ts", read("src/atlas/document.ts")],
    ["src/cli/gallery.ts", read("src/cli/gallery.ts")],
  ];
  for (const [name, text] of consumers) {
    for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g)) {
      assert.ok(declared.has(m[1]!), `${name} consumes ${m[1]} but nothing the page loads declares it`);
    }
  }
});

// The sheet's lift is ONE token (Issue #367), ratified at 0.4 (2026-08-12): two coincident 0.2 shadows measured as a single 0.385.
const SHEET_SHADOW_GEOMETRY = "0 12px 34px";
const STAGE_SHADOW_GEOMETRY = "0 18px 60px";

test("the sheet shadow is declared once and consumed as a var: no raw geometry survives (#367)", () => {
  for (const page of SITE_SHEETS) {
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
  for (const page of SITE_SHEETS) {
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

// The hover raise and press are house values (Issue #405), named in motion.css's :root, the one sheet both the site pages and the standalone atlas page load.
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
  for (const sheet of SITE_SHEETS) {
    assert.ok(!read(sheet).includes("--raise-grand"), `${sheet} must not declare or consume the retired --raise-grand`);
  }
});

test("the plate dress rests flat and tips on hover (#130, the consumer is now print-room)", () => {
  const css = read("public/motion.css");
  const base = css.match(/\.plate\s*\{([^}]*)\}/);
  assert.ok(base, ".plate base rule exists in motion.css");
  assert.ok(!/rotate\(/.test(base[1]!), ".plate rests flat (no resting rotate)");
  const hover = css.match(/\.plate:hover\s*\{([^}]*)\}/);
  assert.ok(
    hover && /rotate\(/.test(hover[1]!) && /translateY\(/.test(hover[1]!),
    ".plate tips (rotate) and lifts (translateY) under the hand",
  );
});

test("the wordmark tips under the hand on room pages, and stays still on home (#289)", () => {
  const css = read("public/motion.css");
  // Keyed on .wordmark, not h1 (Issue #288): on a room page the h1 is the room name with no link to tip, so keying on h1 would silently select nothing.
  const hover = css.match(/body:has\(\.room-name\) \.wordmark a:hover,\s*body:has\(\.room-name\) \.wordmark a:focus-visible\s*\{([^}]*)\}/);
  assert.ok(hover, "the room-scoped wordmark hover rule should exist in motion.css");
  assert.ok(
    /rotate\(/.test(hover[1]!) && /translateY\(/.test(hover[1]!),
    "the wordmark should tip (rotate) and lift (translateY) under the hand",
  );
  assert.ok(
    !/(?<!\(\.room-name\) )\.wordmark a:hover/.test(css.replace(/body:has\(\.room-name\) \.wordmark a:hover/g, "")),
    "no unscoped .wordmark a:hover may leak the tip onto home",
  );
});

// The grander plate, gallery and atlas scales are a question Issue #405 left standing, so each literal is sanctioned at its exact selector and value, and every comma arm of a literal-bearing rule must be individually sanctioned: a new surface cannot borrow an exception.
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
  // Scoped to :hover/:active selectors, so keyframe steps pass by construction (their selectors are waypoints like "70%": the paperSettle trap in motion.css); translateY(0) is a return to rest, not a lift.
  const { GALLERY_PAGE_CSS } = await import("../../src/cli/gallery.ts");
  const sheets: Array<[string, string]> = [
    ...SITE_SHEETS.map((p): [string, string] => [p, read(p)]),
    ["BaseLayout <style is:global>", layoutStyle()],
    ["src/pages/index.astro <style>", [...read("src/pages/index.astro").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n")],
    ["src/cli/gallery.ts", GALLERY_PAGE_CSS],
    ["src/atlas/document.ts", await atlasStyleBlocks()],
  ];
  for (const [name, css] of sheets) {
    for (const { selector, body } of rulesIn(css)) {
      if (!/:hover|:active/.test(selector)) continue;
      for (const m of body.matchAll(/translateY\(([^)]*)\)/g)) {
        const arg = m[1]!.trim();
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

// Identity, not presence: the sweep proves a lift is SOME token; this pins WHICH one each consumer uses.
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
