import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generate, parse, walk } from "@eslint/css-tree";
import { rulesIn } from "../../test-support/shell-css-rules.ts";

// The shell dresses once (Issue #263): the palette is named ONCE in public/shell.css and consumed as var() everywhere it matched exactly.

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

const RETIRED_INKS = ["#3d2f1f", "#5a4326"] as const;

const SHELL = "public/shell.css";
const layoutStyle = () => read(SHELL);

const shellDeclarations = (): Map<string, string[]> => {
  const found = new Map<string, string[]>();
  walk(parse(layoutStyle(), { parseCustomProperty: false }), (node) => {
    if (node.type !== "Declaration" || !node.property.startsWith("--")) return;
    const value = node.value.type === "Raw" ? node.value.value : generate(node.value);
    found.set(node.property, [...(found.get(node.property) ?? []), value.replace(/\s+/g, " ").trim()]);
  });
  return found;
};

test("public/shell.css declares each palette token once at its ratified value, each depth shadow once, and the walnut deep once (Issue #263, Issue #367, Issue #463, Issue #461)", () => {
  const declared = shellDeclarations();
  for (const [name, hex] of Object.entries(TOKENS))
    assert.deepEqual(declared.get(name), [hex], `public/shell.css should declare ${name}: ${hex}, once`);
  // The sheet's lift is ONE token (Issue #367), ratified at 0.4 (2026-08-12): two coincident 0.2 shadows measured as a single 0.385.
  assert.deepEqual(
    declared.get("--sheet-shadow"),
    ["0 12px 34px rgb(from var(--chart-ink) r g b / 0.4)"],
    "the sheet shadow is declared once, at its ratified depth",
  );
  assert.deepEqual(
    declared.get("--stage-shadow"),
    ["0 18px 60px rgb(from var(--chart-ink) r g b / 0.55)"],
    "the stage shadow is declared once, the mockup's own dress",
  );
  assert.equal(declared.get("--the-deep")?.length, 1, "the walnut deep is declared once, so ground and band share it");
});

test("the composers dress from the same palette (#269 review follow-up)", async () => {
  // The generated atlas and gallery cannot render through BaseLayout (the single-file download links nothing external), so each declares the tokens in its own :root.
  const { GALLERY_PAGE_CSS, cardFigureHtml } = await import("../../src/cli/gallery.ts");
  const card = { seed: 7, file: "c.svg", title: "T", mapType: "island", band: "temperate", width: 9, height: 7 };
  const gallery = `${GALLERY_PAGE_CSS}\n${cardFigureHtml(card)}`.toLowerCase();
  for (const [name, hex] of Object.entries(TOKENS)) {
    assert.ok(!gallery.includes(hex), `the gallery carries raw ${hex}; consume var(${name})`);
  }
  for (const hex of RETIRED_INKS) {
    assert.ok(!gallery.includes(hex), `the gallery carries retired ink ${hex}; use var(--ink-dark)`);
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
    title: "T",
    subtitle: "s",
    seed: 7,
    hero: plate,
    draughtings: [plate],
    themes: [plate],
    regions: [plate],
    prospects: [plate],
    bannersHtml: "",
    chronicleHtml: "",
    gazetteerHtml: "",
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
    assert.ok(!html.includes("#5a4326"), `the ${label} atlas carries retired ink #5a4326; use var(--ink-dark)`);
  }
});

// The hover raise and press are house values (Issue #405), named in motion.css's :root, the one sheet both the site pages and the standalone atlas page load.
const RAISE_TOKENS = ["--raise", "--press", "--raise-shadow", "--press-shadow"] as const;

test("motion.css declares each raise/press token once (#405; kept for Issue #779 part 2i: a second declaration repeating the first changes nothing served, and P34 reads each token's ratified value)", () => {
  const css = read("public/motion.css");
  for (const name of RAISE_TOKENS) {
    assert.equal(css.split(`${name}:`).length - 1, 1, `${name} should have exactly one declaration in motion.css`);
  }
});

// A `:visited` link's colour is one no browser hands a script (Issue #779 part 2f).
test("no rule that dresses the trail reaches for an ink under the floor on the deep, in any state (Issue #668)", () => {
  const trail = rulesIn(layoutStyle()).filter((r) => /\.(trail|also|where)\b/.test(r.selector));
  assert.ok(trail.length >= 10, `the reader found the trail's rules (${trail.length}), so the sweep is not of nothing`);
  for (const r of trail)
    assert.doesNotMatch(
      r.body,
      /--ink-faded|--line-tan/,
      `${r.selector} wears an ink that reads under 4.5:1 on the deep`,
    );
});
