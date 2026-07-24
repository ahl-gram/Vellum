import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The shell dresses once (#263), part B: the recurring parchment/ink palette is
 * named ONCE in BaseLayout's global style block and consumed as var() everywhere
 * it matched exactly. Three guards:
 *   1. the four ratified tokens stay declared, at their ratified values;
 *   2. no tokenized hex ever creeps back into the six page css files raw;
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
  "public/seed-of-the-day/index.css",
] as const;

// The ratified token set (#263): exact-match recurring hexes ONLY. Near-miss
// inks (the #3d2f1f body text vs --ink-dark, the #5a4326 voyage track) stay
// raw values on purpose: flagged in the PR, never silently merged.
const TOKENS: Record<string, string> = {
  "--ink-dark": "#4a3826",
  "--ink-brown": "#6b5a40",
  "--ink-faded": "#857257",
  "--line-tan": "#b9a77f",
};

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
  for (const page of PAGE_CSS) {
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

test("drift guard: every var() consumed without a fallback is declared (#263)", () => {
  // Declarations may live in the page css itself, the shared fonts.css and
  // motion.css the layout links on every page, or the layout's own style block.
  // Consumptions WITH a fallback are excluded: they define their own behavior
  // when undeclared (the atlas-download font degradation relies on exactly that).
  const declared = new Set<string>();
  const declarationSources = [...PAGE_CSS.map(read), read("public/fonts.css"), read("public/motion.css"), layoutStyle()];
  for (const text of declarationSources) {
    for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) declared.add(m[1]);
  }

  const consumers: Array<[string, string]> = [
    ...PAGE_CSS.map((p): [string, string] => [p, read(p)]),
    ["BaseLayout <style is:global>", layoutStyle()],
  ];
  for (const [name, text] of consumers) {
    for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g)) {
      assert.ok(declared.has(m[1]), `${name} consumes ${m[1]} but nothing the page loads declares it`);
    }
  }
});
