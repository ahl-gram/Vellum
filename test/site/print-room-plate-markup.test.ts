import { test } from "node:test";
import assert from "node:assert/strict";

// #379: these cannot move back into bound-atlas.ts. It reads the DOM at module scope, so a bare Node import throws before any test runs, and the markup's only other guard is a ten-minute browser round.

const MODULE = "../../src/site/print-room/plate-markup.ts";
const HREF = "blob:http://127.0.0.1:4173/8b1f2c3d-0000-4a5b-9c1d-2e3f4a5b6c7d";

test("#379 the plate markup builder imports into a Node with no DOM", async () => {
  assert.equal(typeof (globalThis as { document?: unknown }).document, "undefined", "no DOM is installed here");
  const mod = await import(MODULE);
  assert.equal(typeof mod.plateFigure, "function", "the pure half is exported");
});

test("#465 ruling 1: a plate of the hidden document is a bare figure, the img and its caption, with no link on it (since seat d no visitor reaches the copy on screen, and the download is composed without links)", async () => {
  const { plateFigure } = await import(MODULE);

  const html = plateFigure(HREF, "The Isle of Rahai");

  assert.equal(html, `<figure><img src="${HREF}" alt="The Isle of Rahai"><figcaption>The Isle of Rahai</figcaption></figure>`);
  assert.doesNotMatch(html, /<a\b|target=|rel=/, "the plate links nowhere: the anchors retired with e2e PR20b");
});

test("#379 a bound plate never lazy-loads: a below-fold lazy plate prints blank", async () => {
  const { plateFigure } = await import(MODULE);

  assert.doesNotMatch(
    plateFigure(HREF, "The Isle of Rahai"),
    /loading=/,
    "the print engine can reach a below-fold plate before the browser loads it",
  );
});

test("#379 every value the host hands in is escaped, and the href is one of them", async () => {
  const { plateFigure } = await import(MODULE);

  const html = plateFigure(`x" onerror="alert(1)`, `Rahai <script> & "the North"`);

  // The quote is the whole attack: escaped, the payload stays inert text INSIDE the attribute, so only a real closing quote is a breakout.
  assert.doesNotMatch(html, /onerror="/, "an href breaks out of its own attribute");
  assert.doesNotMatch(html, /<script>/, "an unescaped caption reaches innerHTML as markup");
  assert.match(html, /alt="Rahai &lt;script&gt; &amp; &quot;the North&quot;"/, "the alt text is unescaped");
  assert.match(html, /<figcaption>Rahai &lt;script&gt; &amp; &quot;the North&quot;<\/figcaption>/, "the figcaption is unescaped");
});

test("#379 the figure class rides only when the host asks for one", async () => {
  const { plateFigure } = await import(MODULE);

  assert.match(plateFigure(HREF, "Hero", "hero-plate print-only"), /^<figure class="hero-plate print-only">/, "the hero plate lost the classes that hide it on screen");
  assert.ok(plateFigure(HREF, "Plain").startsWith("<figure>"), "a plain plate grew an attribute on its figure");
});
