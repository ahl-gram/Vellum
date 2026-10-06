import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES, type MapStyle } from "../../src/render/style.ts";
import { renderSvg, type SvgNode } from "../../src/render/svg.ts";
import type { Arms } from "../../src/society/heraldry.ts";
import { paletteForStyle } from "../../src/render/layers/heraldry.ts";
import { finishedPlateSvg, finishProspect } from "../../src/prospect/finished.ts";
import { NO_SURROUNDINGS, type Surroundings } from "../../src/prospect/surroundings.ts";
import { castFor, figureNodes } from "../../src/prospect/dress/figures.ts";
import { engraver } from "../../src/prospect/dress/burin.ts";
import { smallSizeRule, SMALL_WIDTH, SMALLEST_WIDTH } from "../../src/prospect/dress/compose-e.ts";
import { makeInput } from "../../test-support/prospect-fixtures.ts";

const ARMS: Arms = { division: "perPale", field: ["azure", "argent"], charge: null };

test("the cast stands as the round drew it: kind, harbour, roads and era, the rider wherever two roads or more end at the place", () => {
  assert.deepEqual(castFor("capital", true, 3, "standing"), ["gentleman", "lady", "porter", "rider", "dog"], "the capital, three roads");
  assert.deepEqual(castFor("town", true, 2, "standing"), ["gentleman", "lady", "porter", "rider", "dog"], "Nailo, two roads");
  assert.deepEqual(castFor("town", false, 1, "standing"), ["gentleman", "lady", "shepherd", "dog"], "an inland town, one road");
  assert.deepEqual(castFor("village", true, 1, "standing"), ["fisher", "waterbearer", "dog"], "Lokai, one road");
  assert.deepEqual(castFor("village", false, 2, "standing"), ["shepherd", "waterbearer", "rider", "sheep", "sheep"], "Voorea, two roads");
  assert.deepEqual(castFor("hamlet", false, 0, "standing"), ["shepherd", "sheep", "sheep"]);
  assert.deepEqual(castFor("village", true, 1, "ruined"), ["traveller", "dog"], "Homaitani, ruined");
  assert.deepEqual(castFor("capital", true, 3, "before-founding"), ["surveyor", "dog"], "the ground before the founding");
});

test("the people's clothes are cut from the realm's tinctures on the coloured plate, and hatched on the ink", () => {
  const dressed = (style: MapStyle, arms: Arms | null): string => renderSvg(figureNodes(engraver(style), { kind: "gentleman", x: 100, y: 250, h: 50, flip: false }, arms));
  const palette = paletteForStyle(STYLES.antique);
  assert.ok(dressed(STYLES.antique, ARMS).includes(`fill="${palette.tincture("azure")}"`), "the cloak takes the field's first tincture");
  assert.ok(dressed(STYLES.antique, null).includes(`fill="${palette.tincture("gules")}"`), "a place in no realm wears gules");
  assert.ok(renderSvg(figureNodes(engraver(STYLES.antique), { kind: "lady", x: 100, y: 250, h: 50, flip: false }, ARMS)).includes(`fill="${palette.tincture("argent")}"`), "the lady wears the field's second tincture");
  const ink = dressed(STYLES.ink, ARMS);
  assert.ok(!ink.includes(`fill="${palette.tincture("azure")}"`) && /fill="none" stroke="[^"]+" stroke-width="0.385"/.test(ink), "the ink dress hatches the cloth instead");
});

/** WCAG relative luminance and contrast, from #rrggbb. */
function contrast(a: string, b: string): number {
  const lum = (hex: string): number => {
    const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi! + 0.05) / (lo! + 0.05);
}

test("every lettered run stands at 4.5:1 or better on the paper it is set on, in both dresses", () => {
  for (const style of [STYLES.antique, STYLES.ink]) {
    const svg = finishedPlateSvg(makeInput({ kind: "capital", harbor: true, arms: ARMS }), style, 1300);
    const fills = [...svg.matchAll(/<g aria-label="[^"]*" fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]!);
    assert.ok(fills.length > 10, `${style.name}: the plate letters its runs (${fills.length})`);
    for (const fill of new Set(fills)) {
      const ratio = contrast(fill, style.paper);
      assert.ok(ratio >= 4.5, `${style.name}: ${fill} on ${style.paper} is ${ratio.toFixed(2)}:1`);
    }
  }
});

const ROADS: Surroundings = { ...NO_SURROUNDINGS, roadTowns: [{ index: 1, name: "Haireno", kind: "town", lateral: 0.39, dist: 21 }], roadCount: 2 };

test("a plate drops its detail by its own drawn width: the key, the horizon names and the margin words at the smaller width, the cartouche and the medals too at the smallest (ruling D3)", () => {
  const opts = { idSuffix: "s1", surroundings: ROADS };
  const svg = finishedPlateSvg(makeInput({ kind: "capital", harbor: true, arms: ARMS }), STYLES.antique, 1300, opts);
  const root = finishProspect(makeInput({ kind: "capital", harbor: true, arms: ARMS }), STYLES.antique, 1300, opts);
  const groupOf = (cls: string): string => {
    const g = root.children.find((c): c is SvgNode => typeof c !== "string" && c.attrs["class"] === cls);
    assert.ok(g, `the ${cls} group`);
    return renderSvg(g);
  };
  assert.ok(groupOf("pk-s1").includes('aria-label="1. The Keep"'), "the key group holds the key");
  assert.ok(groupOf("pt-s1").includes('aria-label="Haireno"'), "the horizon group holds the road town's name");
  assert.ok(groupOf("pm-s1").includes('aria-label="Septentrio"'), "the margin group holds the cardinal words");
  assert.ok(groupOf("pc-s1").includes('aria-label="TESTHOLM"'), "the cartouche group holds the name");
  assert.ok(groupOf("pd-s1").includes('class="vellum-arms"'), "the medal group holds the arms");
  assert.equal([SMALL_WIDTH, SMALLEST_WIDTH].join(" "), "400 240");
  assert.ok(svg.includes(`<style>${smallSizeRule("s1")}</style>`), "the plate carries its own rule");
  assert.equal(smallSizeRule("s1"), "@media (max-width: 400px){.pk-s1,.pt-s1,.pm-s1{display:none}}@media (max-width: 240px){.pc-s1,.pd-s1{display:none}}");
  for (const cls of ["pk", "pt", "pm", "pc", "pd"]) assert.ok(svg.includes(`class="${cls}-s1"`), `the ${cls} group carries its class`);
});

test("the plate's words survive the engraving as labels on their runs", () => {
  const svg = finishedPlateSvg(makeInput({ kind: "capital", harbor: true, realmName: "The Chiefdom of Rekekoa" }), STYLES.antique, 1300);
  for (const words of ["TESTHOLM", "chief port of the Chiefdom of Rekekoa, founded An. 1100", "CHART", "№ 4242", "An. 1300", "FOUNDED AN. 1100 · VELLUM · CHART № 4242", "Septentrio", "Meridies"]) {
    assert.ok(svg.includes(`aria-label="${words}"`), `the plate keeps ${JSON.stringify(words)}`);
  }
});
