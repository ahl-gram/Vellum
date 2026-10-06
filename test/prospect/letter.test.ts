import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import * as fontkit from "fontkit";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { CULTURES } from "../../src/society/names.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { plateCaption } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { UNITS_PER_EM, type FaceName } from "../../src/prospect/letter/face.ts";
import { NUMERO } from "../../src/prospect/letter/numero.ts";
import { createLettering, FACES, faceFor, layoutRun, OPTICAL_SCALE, runBox } from "../../src/prospect/letter/letter.ts";
import { PLATE_FACES, PLATE_FONTS } from "../../scripts/plate-face.ts";

const fonts = new Map<FaceName, fontkit.Font>();
function font(face: FaceName): fontkit.Font {
  const cached = fonts.get(face);
  if (cached) return cached;
  const f = fontkit.openSync(join(PLATE_FONTS, PLATE_FACES[face].file));
  assert.ok("layout" in f, "a single face");
  fonts.set(face, f);
  return f;
}

/** The run's advance in font units: a size that cancels the optical scale makes one plate unit one font unit. */
const unitsWide = (text: string, italic: boolean): number =>
  layoutRun({ text, x: 0, y: 0, size: UNITS_PER_EM / OPTICAL_SCALE[faceFor(text, italic)], italic, fill: "#000" }).width;

function worldNames(seeds: readonly number[]): string[] {
  const out: string[] = [];
  for (const seed of seeds) {
    const w: World = generateWorld(defaultRecipe(seed));
    out.push(w.names.sea, ...w.names.realms, ...w.names.rivers.values(), ...w.names.lakes.map((l) => l.name));
    if (w.names.range !== null) out.push(w.names.range);
    if (w.names.forest !== null) out.push(w.names.forest);
    for (const b of w.beasts) out.push(b.name, b.epithet);
    w.settlements.forEach((s, i) => {
      out.push(s.name, ...(s.formerName === undefined ? [] : [s.formerName]));
      const input = buildProspectInput(w, i);
      const g = composeProspect(input);
      out.push(plateCaption(input, g, "standing", w.title.year, w.names.sea).epithet, ...plateKey(g).map((k) => k.label));
      if (s.ruined) out.push(plateCaption(input, g, "ruined", w.title.year, w.names.sea).epithet);
    });
  }
  return out;
}

test("the face rule: italic runs set in the italic, all-capital runs in the small capitals, the rest in the roman", () => {
  assert.equal(faceFor("LAUKUWELUA", false), "caps");
  assert.equal(faceFor("FOUNDED AN. 451 · VELLUM · CHART № 42", false), "caps");
  assert.equal(faceFor("№ 42", false), "roman", "no letter at all is not all capitals");
  assert.equal(faceFor("CHART", true), "italic");
});

test("runs lay out exactly as the face itself does: its kerning and its ligatures, measured against fontkit over real plate text", () => {
  const corpus = [...worldNames([1, 2, 3, 42]), "chief port of the Chiefdom of Rekekoa, founded An. 451", "the ground where Laukuwelua will rise · An. 400", "Officina affluent fiddle", "Meridies Septentrio Oriens Occidens"];
  let kerned = 0;
  for (const text of corpus) {
    const expect = font("italic").layout(text, { calt: false }).positions.reduce((s, p) => s + p.xAdvance, 0);
    assert.equal(unitsWide(text, true), expect, `italic ${JSON.stringify(text)}`);
    const caps = text.toUpperCase().replace(/[^A-Z0-9 ,.\-·]/g, "");
    const capsExpect = font("caps").layout(caps, { calt: false }).positions.reduce((s, p) => s + p.xAdvance, 0);
    assert.equal(unitsWide(caps, false), capsExpect, `caps ${JSON.stringify(caps)}`);
    if (capsExpect !== Array.from(caps).reduce((s, c) => s + font("caps").glyphForCodePoint(c.codePointAt(0) ?? 0).advanceWidth, 0)) kerned++;
  }
  assert.ok(kerned > corpus.length / 2, `premise: the caps face kerns most of these runs (${kerned} of ${corpus.length})`);
});

test("the italic ligatures set as one glyph", () => {
  for (const lig of ["fi", "fl", "ff", "ffi", "ffl"]) {
    assert.equal(layoutRun({ text: lig, x: 0, y: 0, size: 10, italic: true, fill: "#000" }).glyphs.length, 1, `${lig} ligates`);
  }
});

test("the numero sign is the glyph drawn for Vellum, never the face's N or a composite", () => {
  const run = layoutRun({ text: "№ 42", x: 0, y: 0, size: 10, fill: "#000" });
  assert.equal(run.glyphs[0]?.glyph, NUMERO);
  assert.notEqual(NUMERO[5], FACES.roman.glyphs.N?.[5] ?? FACES.caps.glyphs.N?.[5]);
  const svg = renderSvg(createLettering("t").run({ text: "CHART № 42", x: 0, y: 0, size: 7, fill: "#000" }));
  assert.match(svg, /href="#pf-n-t"/, "the caps run places the numero's own def");
});

test("every character any world can print, in every culture's own syllables, is in the face its run is set in", () => {
  const syllables = CULTURES.flatMap((c) => [...c.onsets, ...c.nuclei, ...c.codas, ...c.townSuffixes, ...c.riverTemplates, ...c.peakTemplates, ...c.seaTemplates, ...c.lakeTemplates, ...c.forestTemplates, ...c.realmTemplates].map((s) => s.replaceAll("%", "")));
  const words = [...syllables, ...worldNames(Array.from({ length: 24 }, (_, i) => i + 1))];
  for (const word of words) {
    const proper = word.charAt(0).toUpperCase() + word.slice(1);
    assert.doesNotThrow(() => layoutRun({ text: proper, x: 0, y: 0, size: 6, italic: true, fill: "#000" }), `italic ${JSON.stringify(proper)}`);
    assert.doesNotThrow(() => layoutRun({ text: proper.toUpperCase(), x: 0, y: 0, size: 6, fill: "#000" }), `caps ${JSON.stringify(proper.toUpperCase())}`);
  }
});

test("a character outside the face refuses rather than drawing nothing", () => {
  assert.throws(() => layoutRun({ text: "Café", x: 0, y: 0, size: 6, italic: true, fill: "#000" }), RangeError);
});

test("a plate defines each glyph once, under ids that carry its own suffix", () => {
  const letters = createLettering("p7");
  letters.run({ text: "Nanawotani", x: 0, y: 0, size: 6, italic: true, fill: "#000" });
  letters.run({ text: "Nailo", x: 0, y: 10, size: 6, italic: true, fill: "#000" });
  const ids = letters.defs().map((d) => String(d.attrs.id));
  assert.equal(new Set(ids).size, ids.length, "no glyph defined twice");
  assert.equal(ids.length, new Set("NanawotaniNailo").size, "one def per distinct glyph");
  assert.ok(ids.every((id) => id.endsWith("-p7")), JSON.stringify(ids));
});

test("a run's ink box reads the glyphs' own extents: a descender reaches below the baseline", () => {
  const flat = runBox({ text: "nun", x: 0, y: 100, size: 10, italic: true, fill: "#000" });
  const deep = runBox({ text: "nup", x: 0, y: 100, size: 10, italic: true, fill: "#000" });
  assert.ok(deep.bottom > flat.bottom + 1, `p descends (${deep.bottom} against ${flat.bottom})`);
  assert.ok(flat.top < 100 && flat.x1 > flat.x0, "the box has extent");
});
