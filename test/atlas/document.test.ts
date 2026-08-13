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
  // The plate lift under the hand, scoped to plates that GO SOMEWHERE (#368 ruling): the
  // gesture promises a destination (#289), so it may only attach to an anchored plate. All
  // three hosts qualify after #368, two of them by wrapping their plates at runtime, so this
  // scoping costs no host its lift; it costs a plate its lift exactly when the link is absent
  // (scripting off in the download), which is the case the contract exists for.
  assert.match(ATLAS_SHEET_CSS, /\.atlas-sheet\s+figure\s+a\s+img:hover\s*\{[^}]*translateY/);
  assert.doesNotMatch(
    ATLAS_SHEET_CSS,
    /\.atlas-sheet\s+figure\s+img:hover\s*\{[^}]*transform/,
    "an unanchored plate must not lift: that is the false affordance #368 ruled out",
  );
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

test("plates reserve their frames: img dims from the plate's own svg root, lazy and async (#329)", () => {
  const html = atlasDocument(fixture(), (p, section) => atlasPlateFilename(p, section), { anchor: true, motion: true });
  assert.match(
    html,
    /<img src="world-antique\.svg" width="1500" height="1125" loading="lazy" decoding="async"/,
    "the plate img reserves the frame its own svg root declares",
  );
  // The waiting frame speaks the drafting voice; the loaded plate paints over it.
  assert.match(ATLAS_SHEET_CSS, /figure\s+a\s*\{[^}]*position:\s*relative/);
  assert.match(ATLAS_SHEET_CSS, /figure\s+a::before\s*\{[^}]*content:\s*"Drafting…"/);
  assert.match(ATLAS_SHEET_CSS, /figure\s+a::before\s*\{[^}]*z-index:\s*-1/);
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

test("data-URI mode: the plates become real links at load, without a second copy (#368)", () => {
  const html = atlasDocument(fixture(), (p) => svgToDataUri(p.svg), { anchor: false, motion: false });

  // The one script this document has ever carried, and it exists for exactly one reason: a
  // plate that lifts must go somewhere. A plain <a href="data:..."> cannot do the job, measured
  // in Brave 151 from a real file:// origin: the tab opens on about:blank and the browser logs
  // "Not allowed to navigate top frame to data URL", i.e. a BROKEN click, worse than no click.
  // So the plate is wrapped at load in a link to a blob built from the data URI it already
  // carries: a real link (focusable, middle-clickable), no second copy in the file.
  assert.match(html, /<script>/, "the self-contained atlas links its plates at load");
  assert.match(html, /URL\.createObjectURL/);
  assert.match(html, /target="_blank"|\.target\s*=\s*"_blank"/, "opens beside the atlas, never over it");

  // The reason anchor:false exists in the first place survives: still exactly one copy each.
  assert.equal(
    (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length,
    5,
    "linking the plates must not re-embed them: the file would double",
  );
  assert.doesNotMatch(html, /<a href="data:/, "the inert form the measurement ruled out");
});

test("file-ref mode carries no plate-linking script: its anchors are already real (#368)", () => {
  const html = atlasDocument(fixture(), (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.doesNotMatch(
    html,
    /<script>/,
    "the CLI page's plates are anchored server-side, so a script here would be dead weight",
  );
});
