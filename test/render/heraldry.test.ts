import { test } from "node:test";
import assert from "node:assert/strict";
import { el, renderSvg } from "../../src/render/svg.ts";
import { STYLES } from "../../src/render/style.ts";
import {
  armsNode,
  armsPlacements,
  armsSvgDocument,
  paletteForStyle,
} from "../../src/render/layers/heraldry.ts";
import { CULTURE_CHARGES, type Arms, type Tincture } from "../../src/society/heraldry.ts";
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

test("a multi-realm world where a realm's shield is boxed in beside its label still arms it (#44 follow-up repro)", () => {
  // seed 40318157 (archipelago): 2 realms, both labelled, but pre-fix one
  // realm's shield was boxed in on all four cardinal sides and silently
  // dropped, so the chart drew 1 shield for 2 realms.
  const w = generateWorld(defaultRecipe(40318157));
  assert.ok(w.arms.length >= 2, "fixture must stay a multi-realm world to exercise the bug");
  const armed = renderMap(w, { style: "antique", arms: true });
  const shields = (armed.match(/class="vellum-arms"/g) ?? []).length;
  assert.equal(shields, w.arms.length, `every realm should be armed, got ${shields}/${w.arms.length}`);
});

test("a side-placed shield clears its realm label's all-caps text (no covered letters, #44 follow-up)", () => {
  // Realm labels render UPPERCASE, which runs wider than spacedTextBox's 0.56
  // mixed-case factor. Pre-fix the shield anchored to the label's underestimated
  // width and tucked over the final letters (seed 40318157 covered the last "N"
  // of "...DOMINION"). The shield box must not overlap the label's true caps box.
  const CAPS = 0.72; // serif all-caps advance width, the basis of the fix
  const w = generateWorld(defaultRecipe(40318157));
  const svg = renderMap(w, { style: "antique", arms: true });
  const k = 1; // width 1500
  const size = 30 * k;
  const sh = size * 1.18;

  const names = w.names.realms as unknown as string[];
  for (let realm = 0; realm < w.arms.length; realm++) {
    const label = names[realm]?.toUpperCase();
    if (!label) continue;
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lm = new RegExp(`<text\\b([^>]*)>${esc}</text>`).exec(svg);
    if (!lm) continue; // realm has no placed label (seat fallback) — nothing to clear
    const at = lm[1]!;
    const lx = Number(/\bx="([\d.]+)"/.exec(at)![1]);
    const ly = Number(/\by="([\d.]+)"/.exec(at)![1]);
    const fs = Number(/font-size="([\d.]+)"/.exec(at)![1]);
    const ls = Number(/letter-spacing="([\d.]+)"/.exec(at)![1]);
    const trueW = label.length * (fs * CAPS + ls);
    const labelBox = { x: lx - trueW / 2, y: ly - fs, w: trueW, h: fs * 1.2 };

    const sm = new RegExp(`vellum-arms-m${realm}[^M]*M([\\d.]+) ([\\d.]+)`).exec(svg);
    if (!sm) continue;
    const shieldBox = { x: Number(sm[1]), y: Number(sm[2]), w: size, h: sh };

    const overlap =
      shieldBox.x < labelBox.x + labelBox.w &&
      shieldBox.x + shieldBox.w > labelBox.x &&
      shieldBox.y < labelBox.y + labelBox.h &&
      shieldBox.y + shieldBox.h > labelBox.y;
    assert.ok(
      !overlap,
      `realm ${realm} shield ${JSON.stringify(shieldBox)} overlaps its caps label ${JSON.stringify(labelBox)}`,
    );
  }
});

// ---- #25: ink-style Petra Sancta tincture hatching (field + divisions only) ----

const ALL_TINCTURES: Tincture[] = ["or", "argent", "gules", "azure", "sable", "vert", "purpure"];

/** Inner content of the <pattern id="hatch-<t>-<suffix>">…</pattern> block, or null. */
function patternBlock(svg: string, t: Tincture): string | null {
  const m = new RegExp(`<pattern id="hatch-${t}-[^"]*"[^>]*>(.*?)</pattern>`).exec(svg);
  return m ? (m[1] as string) : null;
}

/** Every d="…" path string inside a block. */
function pathDs(block: string): string[] {
  return [...block.matchAll(/ d="([^"]*)"/g)].map((m) => m[1] as string);
}

/** Direction {dx,dy} of the first "M x y L x2 y2" line in a block. */
function firstLineDir(block: string): { dx: number; dy: number } | null {
  const m = /M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/.exec(block);
  if (!m) return null;
  return { dx: Number(m[3]) - Number(m[1]), dy: Number(m[4]) - Number(m[2]) };
}

function inkFieldDoc(t: Tincture, suffix: string): string {
  const pal = paletteForStyle(STYLES.ink);
  return armsSvgDocument({ division: "plain", field: [t], charge: null }, SIZE, pal, suffix);
}

test("#25 ink hatches each tincture field with its own <pattern>, referenced by the field", () => {
  for (const t of ALL_TINCTURES) {
    const doc = inkFieldDoc(t, `h-${t}`);
    assert.ok(doc.includes(`url(#hatch-${t}-h-${t})`), `${t} field should reference its hatch pattern`);
    assert.ok(patternBlock(doc, t) !== null, `${t} should define a <pattern>`);
  }
});

test("#25 ink hatch marks follow the Petra Sancta engraving convention per tincture", () => {
  const az = pathDs(patternBlock(inkFieldDoc("azure", "x"), "azure")!).join(" ");
  assert.match(az, /H/, "azure = horizontal lines");
  assert.doesNotMatch(az, /V/, "azure has no verticals");

  const gu = pathDs(patternBlock(inkFieldDoc("gules", "x"), "gules")!).join(" ");
  assert.match(gu, /V/, "gules = vertical lines");
  assert.doesNotMatch(gu, /H/, "gules has no horizontals");

  const sa = pathDs(patternBlock(inkFieldDoc("sable", "x"), "sable")!).join(" ");
  assert.match(sa, /H/, "sable crosshatch has horizontals");
  assert.match(sa, /V/, "sable crosshatch has verticals");

  const or = patternBlock(inkFieldDoc("or", "x"), "or")!;
  assert.match(or, /<circle/, "or = seme of dots");

  const ar = patternBlock(inkFieldDoc("argent", "x"), "argent")!;
  assert.equal(pathDs(ar).length, 0, "argent = plain paper, no line marks");
  assert.doesNotMatch(ar, /<circle/, "argent has no dots");

  const ve = firstLineDir(patternBlock(inkFieldDoc("vert", "x"), "vert")!);
  assert.ok(ve && ve.dx !== 0 && Math.sign(ve.dx) === Math.sign(ve.dy), "vert = \\ diagonal (dexter chief)");

  const pu = firstLineDir(patternBlock(inkFieldDoc("purpure", "x"), "purpure")!);
  assert.ok(pu && pu.dx !== 0 && Math.sign(pu.dx) === -Math.sign(pu.dy), "purpure = / diagonal (sinister chief)");
});

test("#25 every ink hatch tile has an opaque paper base (no bleed-through)", () => {
  // Divided fields paint one region over the other; without an opaque tile base
  // the lower field's hatch shows through the overlay's gaps. Same guard protects
  // on-map arms from terrain bleeding through the gaps.
  const doc = armsSvgDocument(
    { division: "perBend", field: ["vert", "or"], charge: null },
    SIZE, paletteForStyle(STYLES.ink), "d",
  );
  assert.ok(doc.includes("url(#hatch-vert-d)") && doc.includes("url(#hatch-or-d)"), "both regions hatched");
  for (const t of ["vert", "or"] as Tincture[]) {
    assert.match(patternBlock(doc, t)!, /^<rect[^>]*fill="#faf7ef"/, `${t} tile opens with an opaque paper rect`);
  }
});

test("#25 colour styles keep solid field fills, never patterns", () => {
  for (const name of ["antique", "topographic", "nautical"] as const) {
    const pal = paletteForStyle(STYLES[name]);
    const doc = armsSvgDocument({ division: "plain", field: ["azure"], charge: null }, SIZE, pal, name);
    assert.ok(!doc.includes("<pattern"), `${name} field is a solid fill, no hatch`);
    assert.ok(doc.includes(pal.tincture("azure")), `${name} paints the solid tincture`);
  }
});

test("#25 multiple ink arms in one document get collision-free, suffix-scoped pattern ids", () => {
  // Two realms sharing a tincture must not share a <pattern> id — the on-map
  // multi-realm `--style ink --arms` path is the only place ink patterns collide
  // (atlas banners are colour). idSuffix must scope every pattern id.
  const arms: Arms = { division: "plain", field: ["azure"], charge: null };
  const pal = paletteForStyle(STYLES.ink);
  const doc = renderSvg(
    el("svg", { xmlns: "http://www.w3.org/2000/svg" }, [
      armsNode(arms, 60, 70, SIZE, pal, "m0"),
      armsNode(arms, 180, 70, SIZE, pal, "m1"),
    ]),
  );
  assert.ok(doc.includes('id="hatch-azure-m0"'), "realm 0 gets its own pattern id");
  assert.ok(doc.includes('id="hatch-azure-m1"'), "realm 1 gets its own pattern id");
  const ids = [...doc.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, `all ids must be unique, got: ${ids.join(", ")}`);
});

test("armsNode returns a group node, and the document is byte-deterministic", () => {
  const pal = paletteForStyle(STYLES.ink);
  const node = armsNode(SAMPLES[2]!, 45, 53, SIZE, pal, "g0");
  assert.equal(node.tag, "g");
  const a = armsSvgDocument(SAMPLES[2]!, SIZE, pal, "det");
  const b = armsSvgDocument(SAMPLES[2]!, SIZE, pal, "det");
  assert.equal(a, b);
});
