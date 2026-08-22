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
    prospects: [plate("prospect-capital", "The Prospect of Café")],
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
  assert.equal(atlasPlateFilename({ key: "prospect-capital" }, "prospect"), "prospect-capital.svg");
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
  assert.match(html, /<a href="prospect-capital\.svg"><img src="prospect-capital\.svg"/);
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

test("atlasDocument (data-URI mode): self-contained, with no anchors in the FILE and no external refs", () => {
  const data = fixture();
  const html = atlasDocument(data, (p) => svgToDataUri(p.svg), { anchor: false, motion: false });

  // every plate inlined as a base64 data URI: 1 hero + 2 draughtings + 1 theme + 1 region + 1 prospect = 6
  const dataUris = (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length;
  assert.equal(dataUris, 6, "each plate must be inlined exactly once (self-contained, no doubling)");
  // no anchor wrappers around plates (they would double the ~20MB payload)
  assert.doesNotMatch(html, /<a href="data:/);
  // self-contained: no external stylesheet (motion:false), no file-ref plate srcs
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\/motion\.css">/);
  assert.doesNotMatch(html, /src="world-antique\.svg"/);
  // still a complete, styled document
  assert.match(html, /<body class="atlas-sheet">/);
  assert.match(html, /\.atlas-sheet figure/);
});

// Exactly the browser surface PLATE_LINK_SCRIPT touches, and nothing else. Not a DOM and
// deliberately not a selector engine (test-support/element-shim.ts's standing rule): the
// script's own selector is recorded and checked against the real markup separately, and
// every assertion below reads nodes the script itself rewired.
class StubNode {
  parentNode: StubNode | null = null;
  children: StubNode[] = [];
  src = "";
  href = "";
  target = "";
  rel = "";
  tag: string;
  constructor(tag: string) { this.tag = tag; }
  insertBefore(node: StubNode, ref: StubNode): void {
    node.parentNode = this;
    this.children.splice(this.children.indexOf(ref), 0, node);
  }
  appendChild(node: StubNode): void {
    const from = node.parentNode?.children;
    if (from) from.splice(from.indexOf(node), 1);
    node.parentNode = this;
    this.children.push(node);
  }
}

// Runs the document's own script, so a syntax error throws here rather than shipping.
async function runPlateScript(html: string, plates: number) {
  const body = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(body, "the self-contained atlas must carry its linking script");
  const imgs = Array.from({ length: plates }, (_, i) => {
    const figure = new StubNode("figure");
    const img = new StubNode("img");
    img.src = `data:image/svg+xml;base64,PLATE${i}`;
    figure.appendChild(img);
    return img;
  });
  const queried: string[] = [];
  const doc = {
    querySelectorAll: (sel: string) => { queried.push(sel); return imgs; },
    createElement: (tag: string) => new StubNode(tag),
  };
  const fetchStub = async (src: string) => ({ blob: async () => ({ src }) });
  const urlStub = { createObjectURL: (b: { src: string }) => `blob:vellum/${b.src.slice(-6)}` };
  new Function("document", "fetch", "URL", "console", body[1])(doc, fetchStub, urlStub, { warn() {} });
  await new Promise((r) => setTimeout(r, 0));
  return { imgs, queried };
}

test("data-URI mode: running the document's own script really links every plate (#368)", async () => {
  const html = atlasDocument(fixture(), (p) => svgToDataUri(p.svg), { anchor: false, motion: false });
  const { imgs, queried } = await runPlateScript(html, 6);

  for (const img of imgs) {
    const a = img.parentNode;
    assert.ok(a && a.tag === "a", "every plate must end up inside an anchor");
    assert.match(a.href, /^blob:/, "a data: href is the inert form the measurement ruled out");
    assert.equal(a.target, "_blank", "opens beside the atlas, never over it");
    assert.equal(a.rel, "noopener");
    assert.equal(a.parentNode?.tag, "figure", "the anchor takes the img's place in the figure");
  }

  // The script's reach and the markup must not drift apart: it queries plate imgs as direct
  // figure children, so plateFigure may not grow a wrapper around them.
  assert.equal(queried.length, 1);
  assert.match(queried[0], /figure\s*>\s*img\s*$/, "the plate query must stay a figure > img child match");
  // Scope derived, not pinned: a consistent rename stays green here (the literal belongs to the
  // sibling CSS guards), but a script reaching for a class the document never emits reds.
  const scope = queried[0].match(/^\.([\w-]+)\s/)?.[1];
  assert.ok(scope, "the plate query must be scoped to a class");
  assert.match(html, new RegExp(`<body class="[^"]*\\b${scope}\\b`), "the script's scope must be the class the document emits");
  assert.equal((html.match(/<figure><img /g) ?? []).length, 6, "every plate img is a direct figure child");

  // The reason anchor:false exists in the first place survives: still exactly one copy each.
  assert.equal(
    (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length,
    6,
    "linking the plates must not re-embed them: the file would double",
  );
  assert.doesNotMatch(html, /<a href="data:/);
});

test("#412 the prospect section sits between the regional surveys and the banners", () => {
  const html = atlasDocument(fixture(), (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  const regions = html.indexOf("<h2>Regional Surveys</h2>");
  const prospect = html.indexOf("<h2>The Prospect of the Capital</h2>");
  const banners = html.indexOf("Banners of the Realms");
  assert.ok(regions >= 0, "regional surveys present");
  assert.ok(prospect > regions, "the prospect follows the regional surveys");
  assert.ok(banners > prospect, "the banners follow the prospect");
});

test("#412 a composition with no prospect emits no prospect section", () => {
  const data = { ...fixture(), prospects: [] };
  const html = atlasDocument(data, (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.doesNotMatch(html, /The Prospect of the Capital/);
});

test("file-ref mode carries no plate-linking script: its anchors are already real (#368)", () => {
  const html = atlasDocument(fixture(), (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.doesNotMatch(
    html,
    /<script>/,
    "the CLI page's plates are anchored server-side, so a script here would be dead weight",
  );
});
