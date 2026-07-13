import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ATLAS_SHEET_CSS,
  atlasDocument,
  atlasPlateFilename,
  svgToDataUri,
  type AtlasDocumentData,
} from "../../src/atlas/document.ts";

// A minimal, deterministic stand-in for a composed atlas: one plate per section
// plus the three HTML fragments. Section membership (hero/draughting/theme/region)
// drives the filename scheme and the document layout, so one plate each is enough.
function fixture(): AtlasDocumentData {
  const plate = (key: string, title: string) => ({
    key,
    title,
    svg: `<svg width="1500" height="1125" data-vellum-seed="7"><title>${title}</title></svg>`,
  });
  return {
    title: "The Isle of Café",
    subtitle: "surveyed in the year of the long tide",
    seed: 7,
    hero: plate("antique", "The world chart, drawn in the antique manner"),
    draughtings: [plate("topographic", "Topographic"), plate("ink", "Pen & ink")],
    themes: [plate("theme-vegetation", "Vegetation")],
    regions: [plate("region-1", "The Environs of Café")],
    bannersHtml: '<section><h2>Banners of the Realms</h2><div class="banners"></div></section>',
    chronicleHtml: '<section><h2>Chronicle</h2><ol class="chronicle"></ol></section>',
    gazetteerHtml: "<section><h2>Gazetteer</h2><table></table></section>",
  };
}

test("atlasPlateFilename: style plates get the world- prefix, themes/regions use the key", () => {
  assert.equal(atlasPlateFilename({ key: "antique" }, "hero"), "world-antique.svg");
  assert.equal(atlasPlateFilename({ key: "topographic" }, "draughting"), "world-topographic.svg");
  assert.equal(atlasPlateFilename({ key: "ink" }, "draughting"), "world-ink.svg");
  assert.equal(atlasPlateFilename({ key: "theme-vegetation" }, "theme"), "theme-vegetation.svg");
  assert.equal(atlasPlateFilename({ key: "region-1" }, "region"), "region-1.svg");
});

test("svgToDataUri: a base64 SVG data URI that round-trips Unicode", () => {
  const svg = '<svg width="10" height="10"><title>Île Café — Ñoño</title></svg>';
  const uri = svgToDataUri(svg);
  assert.match(uri, /^data:image\/svg\+xml;base64,/);
  const b64 = uri.slice("data:image/svg+xml;base64,".length);
  const decoded = Buffer.from(b64, "base64").toString("utf8");
  assert.equal(decoded, svg, "non-ASCII characters must survive the base64 round-trip");
});

test("ATLAS_SHEET_CSS: the shared inner CSS, scoped under .atlas-sheet, is the drift-trap's single source", () => {
  assert.ok(ATLAS_SHEET_CSS.length > 200, "shared atlas CSS should be substantial, not a stub");
  // Scoped so it can be injected into the Explorer / Print Room without bleeding onto
  // the host page's own figure/table/h2.
  assert.match(ATLAS_SHEET_CSS, /\.atlas-sheet\s+figure\b/);
  // The plate lift under the hand (atlas.test.ts guards this exact pattern downstream).
  assert.match(ATLAS_SHEET_CSS, /\.atlas-sheet\s+figure\s+img:hover\s*\{[^}]*translateY/);
  // A fallback so the self-contained download (no /motion.css) still resolves the timing.
  assert.match(ATLAS_SHEET_CSS, /var\(--paper,\s*\d+ms\)/);
  // Page chrome (body background, header) is NOT part of the shared inner block: it must
  // not change the Explorer bind, which lives inside the Explorer's own page.
  assert.doesNotMatch(ATLAS_SHEET_CSS, /\.atlas-sheet\s*\{[^}]*background/);
});

test("atlasDocument (file-ref mode): a standalone doc that references plate SVG files with anchors", () => {
  const data = fixture();
  const html = atlasDocument(data, (p, section) => atlasPlateFilename(p, section), { anchor: true, motion: true });

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<title>The Isle of Café: a Vellum atlas<\/title>/);
  assert.match(html, /<h1>The Isle of Café<\/h1>/);
  assert.match(html, /surveyed in the year of the long tide/);
  assert.match(html, /CHART № 7/);
  // body carries the shared scope class so ATLAS_SHEET_CSS applies
  assert.match(html, /<body class="atlas-sheet">/);
  // motion:true links the shared motion desk (folio membership; atlas.test.ts guards it)
  assert.match(html, /<link rel="stylesheet" href="\/motion\.css">/);
  assert.match(html, /ATLAS[_ ]?SHEET|\.atlas-sheet figure/i); // the shared CSS is inlined
  // file-ref plate srcs, wrapped in anchors when anchor:true
  assert.match(html, /<a href="world-antique\.svg"><img src="world-antique\.svg"/);
  assert.match(html, /world-topographic\.svg/);
  assert.match(html, /theme-vegetation\.svg/);
  assert.match(html, /region-1\.svg/);
  // fragments flow in
  assert.match(html, /Banners of the Realms/);
  assert.match(html, /<h2>Chronicle<\/h2>/);
  assert.match(html, /<h2>Gazetteer<\/h2>/);
  // no data URIs in file-ref mode
  assert.doesNotMatch(html, /data:image\/svg\+xml/);
});

test("atlasDocument (data-URI mode): a self-contained doc with no anchors and no external refs", () => {
  const data = fixture();
  const html = atlasDocument(data, (p) => svgToDataUri(p.svg), { anchor: false, motion: false });

  // every plate inlined as a base64 data URI: 1 hero + 2 draughtings + 1 theme + 1 region = 5
  const dataUris = (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length;
  assert.equal(dataUris, 5, "each plate must be inlined exactly once (self-contained, no doubling)");
  // no anchor wrappers around plates (they would double the ~20MB payload)
  assert.doesNotMatch(html, /<a href="data:/);
  // self-contained: no external stylesheet (motion:false), no file-ref plate srcs
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\/motion\.css">/);
  assert.doesNotMatch(html, /src="world-antique\.svg"/);
  // still a complete, styled document
  assert.match(html, /<body class="atlas-sheet">/);
  assert.match(html, /\.atlas-sheet figure/);
});
