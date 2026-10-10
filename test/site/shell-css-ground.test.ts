import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rulesIn } from "../../test-support/shell-css-rules.ts";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const layoutStyle = () => read("public/shell.css");

// A raw hex renders the token mix's colour exactly, so no browser tells the two apart (Issue #779 part 2f).
test("the walnut deep is mixed from the tokens and keeps no daylight wash (#461 ruling 2)", () => {
  const css = layoutStyle();
  const deep = css.match(/--the-deep:\s*([\s\S]*?);/);
  assert.ok(deep, "public/shell.css should declare --the-deep");
  assert.match(
    deep[1]!.replace(/\s+/g, " "),
    /color-mix\(in srgb, var\(--ink-dark\) 90%, var\(--parchment\) 10%\)/,
    "the lit walnut is token-derived (no raw #55402a)",
  );
  assert.equal(css.search(/rgb\(255 250 235/), -1, "the light wash retired with the ground (#461 ruling 2)");
});

test("the deep's focus ring names the footer's links beside the cluster's (#324 decision 6, re-ratified at #461)", () => {
  assert.match(
    layoutStyle(),
    /header\.chrome a:focus-visible,\s*footer a:focus-visible\s*\{[^}]*outline-color:\s*var\(--parchment-bright\)/,
    "the footer's links ring like the cluster's, on the walnut",
  );
});

test("the chrome passes the hand through: drags over the fixed cluster reach the chart, links stay live (#461, skeptic finding 2)", () => {
  // The defect measured on home: a 485x79 dead drag zone under the cluster. The mockup's idiom (stage.css) is the fix: pointer-events none on the container, auto on the interactive children.
  const css = layoutStyle();
  const chrome = css.match(/header\.chrome\s*\{([\s\S]*?)\}/);
  assert.ok(chrome && /pointer-events:\s*none/.test(chrome[1]!), "the chrome container passes pointer events through");
  assert.match(css, /header\.chrome a\s*\{[^}]*pointer-events:\s*auto/, "the links take the hand back");
});

const findRule = (css: string, selector: string) => rulesIn(css).find((r) => r.selector === selector);

/** The attribute the renderer stamps on a chart and nothing else carries: it tells a mount's chart apart from the engine's overlays. */
const CHART_MARKER = "[data-vellum-style]";

/** Every chart mount that dresses a sheet; a NEW host that mounts the engine must join this list or it reintroduces the doubling. */
const CHART_MOUNTS = [
  { host: "Explorer", file: "public/explorer/index.css", mount: "#map", rule: "#sheet", token: "--stage-shadow" },
  {
    host: "Reading Room",
    file: "public/reading-room/index.css",
    mount: ".rf-chart",
    rule: "#sheet",
    token: "--stage-shadow",
    sweep: ["public/reading-frame.css"],
  },
] as const;
const DEPTH_TOKENS = /box-shadow:\s*var\(--(?:sheet|stage)-shadow\)/;

// The qualifier itself (Issue #463 body: "the chart mounts' svg[data-vellum-style] qualifier stays or the Issue #367 shadow doubling returns"), pinned as a presence beside the BARE-svg sweep below.
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
  for (const chart of [
    "chart-42-antique.svg",
    "chart-42-ink.svg",
    "chart-42-nautical.svg",
    "chart-42-topographic.svg",
  ]) {
    assert.match(
      read(`public/charts/${chart}`).slice(0, 4000),
      /data-vellum-style="/,
      `${chart} should carry the data-vellum-style marker the mount rules select on`,
    );
  }
});
