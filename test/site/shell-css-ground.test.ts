import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const layoutStyle = () => read("src/styles/shell.css");

// A raw hex renders the token mix's colour exactly, so no browser tells the two apart (Issue #779 part 2f).
test("the walnut deep is mixed from the tokens (#461 ruling 2; kept at the close of Issue #779: a raw hex renders the mix exactly until a token moves)", () => {
  const css = layoutStyle();
  const deep = css.match(/--the-deep:\s*([\s\S]*?);/);
  assert.ok(deep, "src/styles/shell.css should declare --the-deep");
  assert.match(
    deep[1]!.replace(/\s+/g, " "),
    /color-mix\(in srgb, var\(--ink-dark\) 90%, var\(--parchment\) 10%\)/,
    "the lit walnut is token-derived (no raw #55402a)",
  );
});

test("the chart marker is real: the renderer stamps it on every committed chart (#367)", () => {
  for (const chart of [
    "chart-42-antique.svg",
    "chart-42-ink.svg",
    "chart-42-nautical.svg",
    "chart-42-topographic.svg",
  ]) {
    assert.match(
      read(`src/static/charts/${chart}`).slice(0, 4000),
      /data-vellum-style="/,
      `${chart} should carry the data-vellum-style marker the mount rules select on`,
    );
  }
});
