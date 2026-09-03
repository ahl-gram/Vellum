import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";
import { El, installShim } from "../../test-support/element-shim.ts";
import { contentsRow, contentsRowHtml } from "../../src/site/shared/contents-row.ts";

// #504 (#487 item 3): the contents row the app bundles build at runtime is ONE builder in src/site/shared/, two faces of one shape: a string for the Print Room, nodes for the Prospect and the Ribbon.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

installShim();

const serialize = (el: El): string =>
  el.tagName === "#TEXT" ? el.textContent : `<${el.tagName.toLowerCase()} class="${el.className}">${el.children.map(serialize).join("") || el.textContent}</${el.tagName.toLowerCase()}>`;

test("the string face is the Print Room's row to the byte: the numeral in .cr-num, the text (html, already escaped by the host) in .cr-text, nothing else", () => {
  assert.equal(contentsRowHtml("iii", "Thematic surveys: <em>vegetation</em>"), `<span class="cr-num">iii</span><span class="cr-text">Thematic surveys: <em>vegetation</em></span>`);
  assert.equal(contentsRowHtml("vi", `The banners of every realm <span class="n">&middot; 6 arms</span>`), `<span class="cr-num">vi</span><span class="cr-text">The banners of every realm <span class="n">&middot; 6 arms</span></span>`);
});

test("the node face builds the same pair: a plain label lands as one text node, an inline run keeps its parts in order (the Ribbon's strong, a space, its em)", () => {
  const [num, text] = contentsRow("A", ["the capital"]) as unknown as [El, El];
  assert.equal(num.tagName, "SPAN");
  assert.equal(num.className, "cr-num");
  assert.equal(num.textContent, "A");
  assert.equal(text.tagName, "SPAN");
  assert.equal(text.className, "cr-text");
  assert.equal(text.textContent, "the capital");
  assert.equal(text.children.length, 1, "one text node, as textContent would have left it");

  const strong = document.createElement("strong");
  strong.textContent = "Laukuwelua";
  const em = document.createElement("em");
  em.textContent = "the capital";
  const [, run] = contentsRow("12", [strong, " ", em]) as unknown as [El, El];
  assert.deepEqual(run.children.map((c) => [c.tagName, c.textContent]), [["STRONG", "Laukuwelua"], ["#TEXT", " "], ["EM", "the capital"]]);
  assert.equal(run.textContent, "Laukuwelua the capital");
});

test("the two faces are one shape: a plain row serialized from the nodes is the string face's row", () => {
  const nodes = contentsRow("iv", ["Regional surveys, two close-ins"]) as unknown as [El, El];
  assert.equal(nodes.map(serialize).join(""), contentsRowHtml("iv", "Regional surveys, two close-ins"));
});

test("the three runtime copies are gone: src/site names cr-num in the shared builder alone, and the Print Room's contents, the Prospect's key and the Ribbon's itinerary import it", () => {
  const byHand = globSync("src/site/**/*.ts", { cwd: REPO }).filter((p) => p !== "src/site/shared/contents-row.ts" && /cr-num/.test(read(p)));
  assert.deepEqual(byHand, [], "no app bundle builds the contents row by hand");
  for (const [p, face] of [["src/site/print-room/contents-markup.ts", "contentsRowHtml"], ["src/site/prospect/seats.ts", "contentsRow"], ["src/site/ribbon/seats.ts", "contentsRow"]] as const) {
    assert.match(read(p), new RegExp(`import \\{[^}]*\\b${face}\\b[^}]*\\} from "\\.\\./shared/contents-row\\.ts"`), `${p} takes ${face} from the kit`);
  }
});
