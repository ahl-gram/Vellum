import { test } from "node:test";
import assert from "node:assert/strict";
import { renderSvg } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import {
  armsNode,
  armsPlacements,
  armsSvgDocument,
  paletteForStyle,
} from "../../src/render/layers/heraldry.ts";
import { CULTURE_CHARGES, type Arms } from "../../src/society/heraldry.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";

// One arms of each design family the generator can emit.
const SAMPLES: Arms[] = [
  { division: "plain", field: ["or"], charge: { kind: "mobile", charge: "ship", tincture: "azure" } },
  { division: "plain", field: ["azure"], charge: { kind: "ordinary", ordinary: "cross", tincture: "argent" } },
  { division: "plain", field: ["sable"], charge: { kind: "mobile", charge: "sun", tincture: "or" } },
  { division: "perPale", field: ["or", "azure"], charge: null },
  { division: "perFess", field: ["vert", "argent"], charge: null },
  { division: "perBend", field: ["argent", "sable"], charge: null },
  { division: "perChevron", field: ["azure", "or"], charge: null },
  { division: "quarterly", field: ["gules", "argent"], charge: null },
];

const SIZE = 90;
const STYLE_NAMES = ["antique", "topographic", "ink", "nautical"] as const;

function viewBoxMax(svg: string): number {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  assert.ok(m, "document should carry a viewBox");
  return Math.max(Number(m[1]), Number(m[2]));
}

/** Every numeric token inside a d="..." path attribute. */
function pathCoords(svg: string): number[] {
  const nums: number[] = [];
  for (const d of svg.matchAll(/ d="([^"]*)"/g)) {
    for (const tok of (d[1] as string).matchAll(/-?\d+(?:\.\d+)?/g)) {
      nums.push(Number(tok[0]));
    }
  }
  return nums;
}

test("a coat of arms renders to a well-formed standalone SVG with no NaN/undefined", () => {
  for (const styleName of STYLE_NAMES) {
    const pal = paletteForStyle(STYLES[styleName]);
    SAMPLES.forEach((arms, i) => {
      const doc = armsSvgDocument(arms, SIZE, pal, `${styleName}-${i}`);
      assert.ok(doc.startsWith("<svg"), `sample ${i} ${styleName} should start with <svg`);
      assert.ok(doc.trimEnd().endsWith("</svg>"), `sample ${i} ${styleName} should close </svg>`);
      assert.ok(!doc.includes("NaN"), `NaN in ${styleName} sample ${i}`);
      assert.ok(!doc.includes("undefined"), `undefined in ${styleName} sample ${i}`);
      assert.match(doc, /viewBox="0 0 [\d.]+ [\d.]+"/);
    });
  }
});

test("all shield path coordinates stay within the viewBox", () => {
  const pal = paletteForStyle(STYLES.antique);
  SAMPLES.forEach((arms, i) => {
    const doc = armsSvgDocument(arms, SIZE, pal, `c-${i}`);
    const max = viewBoxMax(doc);
    const coords = pathCoords(doc);
    assert.ok(coords.length > 0, `sample ${i} drew no paths`);
    for (const n of coords) {
      assert.ok(n >= -1 && n <= max + 1, `coord ${n} out of bounds in sample ${i} (max ${max})`);
    }
  });
});

test("a charged plain field paints both the field and the charge tinctures", () => {
  const pal = paletteForStyle(STYLES.antique);
  const doc = armsSvgDocument(SAMPLES[0]!, SIZE, pal, "fc"); // or field, azure ship
  assert.ok(doc.includes(pal.tincture("or")), "field tincture should be painted");
  assert.ok(doc.includes(pal.tincture("azure")), "charge tincture should be painted");
});

test("a divided field paints both of its tinctures", () => {
  const pal = paletteForStyle(STYLES.antique);
  const doc = armsSvgDocument(SAMPLES[3]!, SIZE, pal, "dv"); // per pale or/azure
  assert.ok(doc.includes(pal.tincture("or")));
  assert.ok(doc.includes(pal.tincture("azure")));
});

test("every culture charge renders in-bounds with no NaN", () => {
  const pal = paletteForStyle(STYLES.antique);
  const all = [...new Set(Object.values(CULTURE_CHARGES).flat())];
  assert.ok(all.length >= 12, "expected a full charge set");
  all.forEach((charge, i) => {
    const arms: Arms = { division: "plain", field: ["azure"], charge: { kind: "mobile", charge, tincture: "or" } };
    const doc = armsSvgDocument(arms, SIZE, pal, `all-${i}`);
    assert.ok(!doc.includes("NaN"), `NaN while rendering charge "${charge}"`);
    const max = viewBoxMax(doc);
    for (const num of pathCoords(doc)) {
      assert.ok(num >= -1 && num <= max + 1, `charge "${charge}" coord ${num} out of bounds`);
    }
  });
});

test("on-map arms are opt-in and ride above realm labels", () => {
  // find a multi-realm world so there are realm labels to anchor shields to
  let w = generateWorld(defaultRecipe(1, { gridW: 160, gridH: 120 }));
  for (let s = 2; w.names.realms.length < 2 && s < 60; s++) {
    w = generateWorld(defaultRecipe(s, { gridW: 160, gridH: 120 }));
  }
  assert.ok(w.names.realms.length >= 2, "fixture should have multiple realms");

  const plain = renderMap(w, { style: "antique" });
  assert.ok(!plain.includes("layer-heraldry"), "no arms without the flag");

  const armed = renderMap(w, { style: "antique", arms: true });
  assert.ok(armed.includes("layer-heraldry"), "the flag should add the heraldry layer");
  assert.ok(!armed.includes("NaN"), "no NaN in armed chart");
  assert.ok(!armed.includes("undefined"), "no undefined in armed chart");
});

test("a single-realm world still shows its arms beside the seat", () => {
  // citystates (and small islands) have one unnamed realm, so there is no realm
  // label to anchor to; the lone arms must still appear on the map.
  const w = generateWorld(defaultRecipe(7, { mapType: "citystate", gridW: 160, gridH: 120 }));
  assert.equal(w.names.realms.length, 0, "citystate is a single, unnamed realm");
  assert.ok(w.arms.length >= 1, "but it still has a coat of arms");
  const armed = renderMap(w, { style: "antique", arms: true });
  assert.ok(armed.includes("layer-heraldry"), "single-realm arms should still draw");
  assert.ok(!armed.includes("NaN"));
});

test("armsPlacements covers every realm: labelled realms keep their anchor, unlabelled fall back to their seat", () => {
  // The bug (#44 follow-up): in a multi-realm world where only SOME realm
  // labels place (the rest arena-blocked), the old code armed only the
  // labelled realms and dropped the others, since the seat fallback was gated
  // on zero anchors. armsPlacements must return one placement per realm.
  const world = {
    arms: [{}, {}, {}],
    realms: { seats: [4, 5, 6] },
    settlements: Array.from({ length: 7 }, (_, i) => ({ x: i * 10, y: i * 5 })),
  };
  const proj = { px: (x: number) => x + 1, py: (y: number) => y + 2 };
  const anchors = [{ realm: 1, cx: 111, cy: 222, halfW: 9, halfH: 8 }]; // only realm 1 labelled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out = armsPlacements(world as any, anchors as any, proj as any, 1);
  assert.equal(out.length, 3, "every realm gets a placement, not just labelled ones");
  assert.deepEqual(out.map((p) => p.realm), [0, 1, 2]);
  assert.equal(out.find((p) => p.realm === 1)!.cx, 111, "labelled realm keeps its label anchor");
  const r0 = out.find((p) => p.realm === 0)!; // seat[0]=settlement 4 at (40,20) -> px 41, py 22
  assert.equal(r0.cx, 41);
  assert.equal(r0.cy, 22);
});

test("a multi-realm world with an arena-blocked realm label still arms both realms (#40-followup repro)", () => {
  // seed 40318157 (archipelago): 2 realms, but only one realm label places, so
  // pre-fix the chart drew a single shield and silently dropped the 2nd realm.
  const w = generateWorld(defaultRecipe(40318157));
  assert.ok(w.arms.length >= 2, "fixture must stay a multi-realm world to exercise the bug");
  const armed = renderMap(w, { style: "antique", arms: true });
  const shields = (armed.match(/class="vellum-arms"/g) ?? []).length;
  assert.equal(shields, w.arms.length, `every realm should be armed, got ${shields}/${w.arms.length}`);
});

test("armsNode returns a group node, and the document is byte-deterministic", () => {
  const pal = paletteForStyle(STYLES.ink);
  const node = armsNode(SAMPLES[2]!, 45, 53, SIZE, pal, "g0");
  assert.equal(node.tag, "g");
  const a = armsSvgDocument(SAMPLES[2]!, SIZE, pal, "det");
  const b = armsSvgDocument(SAMPLES[2]!, SIZE, pal, "det");
  assert.equal(a, b);
});
