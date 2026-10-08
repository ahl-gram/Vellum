import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rulesIn } from "../../test-support/shell-css-rules.ts";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const layoutStyle = () => read("public/shell.css");

test("the walnut deep: one declaration, the vignette over the lit walnut, consumed by ground and band alike (#461 ruling 2)", () => {
  // The deep (ruled 2026-08-25): the mockup's own body deep, token-derived, declared ONCE as --the-deep so the fixed ground layer and the running band can never drift apart.
  const css = layoutStyle();
  const deep = css.match(/--the-deep:\s*([\s\S]*?);/);
  assert.ok(deep, "the layout style should declare --the-deep once");
  const value = deep[1]!.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
  const vignette = value.search(/radial-gradient\(120% 90% at 50% 30%,\s*rgb\(from var\(--ink-dark\) r g b \/ 0\)/);
  const walnut = value.search(
    /radial-gradient\(80% 70% at 30% 20%,\s*color-mix\(in srgb, var\(--ink-dark\) 90%, var\(--parchment\) 10%\) 0%,\s*var\(--ink-dark\) 55%,\s*var\(--chart-ink\) 100%\)/,
  );
  assert.ok(vignette > -1, "the deep's darkening vignette is present");
  assert.ok(walnut > -1, "the deep's lit-walnut radial is present, token-derived (no raw #55402a)");
  assert.ok(vignette < walnut, "the vignette paints above the walnut");
  assert.equal(css.split("--the-deep:").length - 1, 1, "--the-deep is declared exactly once");
  const before = css.match(/body::before\s*\{([\s\S]*?)\}/);
  assert.ok(
    before && /background:\s*var\(--the-deep\)/.test(before[1]!),
    "the fixed ground layer consumes var(--the-deep)",
  );
  assert.ok(
    /position:\s*fixed/.test(before[1]!),
    "the ground layer is fixed (iOS treats background-attachment: fixed as scroll)",
  );
  const band = css.match(/\.band::before\s*\{([\s\S]*?)\}/);
  assert.ok(band && /background:\s*var\(--the-deep\)/.test(band[1]!), "the band clips the SAME deep, via the token");
  assert.ok(
    /clip-path:\s*inset\(0 0 calc\(100% - var\(--band-h\)\) 0\)/.test(band[1]!),
    "the band is the deep clipped to --band-h, so the reserved ground cannot misalign",
  );
  const daylight = css.search(/rgb\(255 250 235/);
  assert.equal(daylight, -1, "the light wash retired with the ground (#461 ruling 2)");
});

test("the interim desk panel: an unconverted room's main stands on parchment, not the deep (#461)", () => {
  // Scaffolding with a stated retirement path: a page passes desk="open" once its own conversion sub (7-9) dresses it for the deep, and the class stops rendering.
  const css = layoutStyle();
  const panel = css.match(/main\.desk-panel\s*\{([\s\S]*?)\}/);
  assert.ok(panel, "the layout style should carry main.desk-panel");
  assert.match(panel[1]!, /background:\s*var\(--parchment\)/, "the panel is the parchment the page css was tuned on");
  assert.match(panel[1]!, /box-shadow:\s*var\(--sheet-shadow\)/, "the panel rests at the house depth");
});

test("the chrome passes the hand through: drags over the fixed cluster reach the chart, links stay live (#461, skeptic finding 2)", () => {
  // The defect measured on home: a 485x79 dead drag zone under the cluster. The mockup's idiom (stage.css) is the fix: pointer-events none on the container, auto on the interactive children.
  const css = layoutStyle();
  const chrome = css.match(/header\.chrome\s*\{([\s\S]*?)\}/);
  assert.ok(chrome && /pointer-events:\s*none/.test(chrome[1]!), "the chrome container passes pointer events through");
  assert.match(css, /header\.chrome a\s*\{[^}]*pointer-events:\s*auto/, "the links take the hand back");
});

test("print is paper all the way down: the dark ground resets with the chrome it carried (#454 open decision 4, skeptic finding 5)", () => {
  const print = layoutStyle().match(/@media print\s*\{([\s\S]*?)\n\}/);
  assert.ok(print, "the layout style carries the print block");
  assert.match(
    print[1]!,
    /body\s*\{[^}]*background:\s*none/,
    "the body's walnut ground must not print (near-black pages with background graphics on)",
  );
});

test("the deep's focus ring: the chrome on the walnut brightens the ring, paper keeps ink-dark (#324 decision 6, re-ratified at #461)", () => {
  const ring = layoutStyle().match(/header\.chrome a:focus-visible,\s*footer a:focus-visible\s*\{([\s\S]*?)\}/);
  assert.ok(ring, "the layout style should carry the deep-chrome focus override");
  assert.match(
    ring[1]!,
    /outline-color:\s*var\(--parchment-bright\)/,
    "the ring on the deep is parchment-bright (#455's precedent for controls on the walnut)",
  );
});

test("BaseLayout declares --sheet-shadow, the one depth every sheet rests at (#367)", () => {
  assert.match(
    layoutStyle(),
    /--sheet-shadow:\s*0 12px 34px rgb\(from var\(--chart-ink\) r g b \/ 0\.4\)/,
    "the layout style should declare --sheet-shadow at the ratified 0.4",
  );
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

test("the engine's own sheet states no shadow it could not win (#367)", () => {
  // Host-agnostic: a shadow written here loses every cascade it enters.
  const rule = findRule(read("public/living-chart.css"), ".voyage-overlay");
  assert.ok(rule, "living-chart.css should still carry the .voyage-overlay layout rule");
  assert.ok(
    !/box-shadow/.test(rule.body),
    "the engine sheet must not state a box-shadow it cannot win; the mounts own the fix",
  );
});
