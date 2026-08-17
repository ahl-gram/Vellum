import { test } from "node:test";
import assert from "node:assert/strict";

// #379: the Print Room's plate markup was covered only by e2e PR20b, a browser round of
// roughly ten minutes, and the guard-prover measured that un-anchoring it left all 1149 unit
// tests green. It could not be unit-tested where it lived: bound-atlas.ts reads the DOM at
// module scope, so a bare Node import throws before any test runs. The first test below is
// that the split held, and it is deliberately the cheapest thing in the file.

const MODULE = "../../src/site/print-room/plate-markup.ts";
const HREF = "blob:http://127.0.0.1:4173/8b1f2c3d-0000-4a5b-9c1d-2e3f4a5b6c7d";
const anchorOf = (html: string): string => {
  const m = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/);
  assert.ok(m, "the plate carries no anchor at all: a reader can look at it but not open it");
  return m[0];
};

test("#379 the plate markup builder imports into a Node with no DOM", async () => {
  // A contract, not decoration: this file must never install a DOM shim, or the import stops proving anything.
  assert.equal(typeof (globalThis as { document?: unknown }).document, "undefined", "no DOM is installed here");
  const mod = await import(MODULE);
  assert.equal(typeof mod.plateFigure, "function", "the pure half is exported");
});

test("#379 a bound plate is an anchor on the plate itself, opening in a new tab (#368)", async () => {
  const { plateFigure } = await import(MODULE);

  const anchor = anchorOf(plateFigure(HREF, "The Isle of Rahai"));

  assert.ok(anchor.includes(`href="${HREF}"`), "the anchor does not point at the plate it was given");
  assert.match(anchor, /target="_blank"/, "navigating in place tears down the page and revokes the blob the link points at");
  assert.match(anchor, /rel="noopener"/, "a target=_blank link without rel=noopener hands the opened tab a window.opener handle");
  // Inside, not merely beside: an img that follows a self-closed anchor renders identically and links nothing.
  assert.match(anchor, /<img\b[^>]*>/, "the plate image sits outside its own anchor");
});

test("#379 a bound plate never lazy-loads: a below-fold lazy plate prints blank", async () => {
  const { plateFigure } = await import(MODULE);

  assert.doesNotMatch(
    plateFigure(HREF, "The Isle of Rahai"),
    /loading=/,
    "the print engine can reach a below-fold plate before the browser loads it",
  );
});

test("#379 the caption is escaped everywhere it lands, alt text included", async () => {
  const { plateFigure } = await import(MODULE);

  const html = plateFigure(HREF, `Rahai <script> & "the North"`);

  assert.doesNotMatch(html, /<script>/, "an unescaped caption reaches innerHTML as markup");
  assert.match(html, /alt="Rahai &lt;script&gt; &amp; &quot;the North&quot;"/, "the alt text is unescaped");
  assert.match(html, /<figcaption>Rahai &lt;script&gt; &amp; &quot;the North&quot;<\/figcaption>/, "the figcaption is unescaped");
});

test("#379 the figure class rides only when the host asks for one", async () => {
  const { plateFigure } = await import(MODULE);

  assert.match(plateFigure(HREF, "Hero", "hero-plate print-only"), /^<figure class="hero-plate print-only">/, "the hero plate lost the classes that hide it on screen");
  assert.match(plateFigure(HREF, "Plain"), /^<figure><a\b/, "a plain plate grew an empty class attribute");
});
