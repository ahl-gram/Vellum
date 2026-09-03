import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";
import { El, installShim } from "../../test-support/element-shim.ts";
import { contentsRow, contentsRowHtml } from "../../src/site/shared/contents-row.ts";

// #504 (#487 item 3). Skeptic on PR #506: nothing else reads a BUILT row from the two DOM hosts, and the Ribbon's summit glyph hangs on the em nesting inside .cr-text (public/ribbon/index.css), so the hosts are run here.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

installShim();

const serialize = (el: El): string => {
  if (el.tagName === "#TEXT") return el.textContent;
  const tag = el.tagName.toLowerCase();
  const attrs = [...(el.className ? [`class="${el.className}"`] : []), ...[...el.attrs].filter(([k]) => k !== "class").map(([k, v]) => `${k}="${v}"`)].join(" ");
  return `<${tag}${attrs ? " " + attrs : ""}>${el.children.length ? el.children.map(serialize).join("") : el.textContent}</${tag}>`;
};

test("the string face is the Print Room's row to the byte: the numeral in .cr-num, the text (html, already escaped by the host) in .cr-text, nothing else", () => {
  assert.equal(contentsRowHtml("iii", "Thematic surveys: <em>vegetation</em>"), `<span class="cr-num">iii</span><span class="cr-text">Thematic surveys: <em>vegetation</em></span>`);
  assert.equal(contentsRowHtml("vi", `The banners of every realm <span class="n">&middot; 6 arms</span>`), `<span class="cr-num">vi</span><span class="cr-text">The banners of every realm <span class="n">&middot; 6 arms</span></span>`);
});

test("the node face builds the same pair: a plain label lands as text, an inline run keeps its parts in order (the Ribbon's strong, a space, its em)", () => {
  const [num, text] = contentsRow("A", ["the capital"]) as unknown as [El, El];
  assert.equal(serialize(num), `<span class="cr-num">A</span>`);
  assert.equal(serialize(text), `<span class="cr-text">the capital</span>`);

  const strong = document.createElement("strong");
  strong.textContent = "Laukuwelua";
  const em = document.createElement("em");
  em.textContent = "the capital";
  const [, run] = contentsRow("12", [strong, " ", em]) as unknown as [El, El];
  assert.deepEqual(run.children.map((c) => [c.tagName, c.textContent]), [["STRONG", "Laukuwelua"], ["#TEXT", " "], ["EM", "the capital"]]);
  assert.equal(run.textContent, "Laukuwelua the capital");
});

test("the two faces are one shape: a plain row serialized from the nodes, attributes included, is the string face's row", () => {
  const nodes = contentsRow("iv", ["Regional surveys, two close-ins"]) as unknown as [El, El];
  assert.equal(nodes.map(serialize).join(""), contentsRowHtml("iv", "Regional surveys, two close-ins"));
});

test("the hosts build the kit's row through the builder: the Ribbon keeps strong, a space and em INSIDE .cr-text under button.lean, the Prospect's key is li > the pair", async () => {
  const { writeItinerary } = await import("../../src/site/ribbon/seats.ts");
  const { writeNote } = await import("../../src/site/prospect/seats.ts");

  const itinerary = new El("ol");
  const rf = { slipTitle: new El("h2"), slipWhere: new El("p"), itinerary };
  const res = {
    fromIdx: 0, toIdx: 3, fromName: "Laukuwelua", toName: "Toatauhe", leagues: 80.2, title: "The Isle of Rahai", year: 1059, realm: null,
    events: [
      { kind: "waypoint", leagues: 0, text: "Laukuwelua", tier: "capital", index: 0, nx: 0.2, ny: 0.9 },
      { kind: "summit", leagues: 62.4, text: "here the road climbs", nx: 0.6, ny: 0.4 },
      { kind: "waypoint", leagues: 80.2, text: "Toatauhe", index: 3, nx: 0.8, ny: 0.2 },
    ],
  };
  writeItinerary(rf as unknown as Parameters<typeof writeItinerary>[0], res as unknown as Parameters<typeof writeItinerary>[1], () => {});
  assert.deepEqual(itinerary.children.map(serialize), [
    `<li class="waypoint"><button class="lean"><span class="cr-num">0</span><span class="cr-text"><strong>Laukuwelua</strong> <em>the capital</em></span></button></li>`,
    `<li class="summit"><button class="lean"><span class="cr-num">62</span><span class="cr-text"><em>here the road climbs</em></span></button></li>`,
    `<li class="waypoint"><button class="lean"><span class="cr-num">80</span><span class="cr-text"><strong>Toatauhe</strong> </span></button></li>`,
  ]);
  assert.deepEqual(itinerary.children.map((li) => [li.dataset.nx, li.dataset.ny]), [["0.2", "0.9"], ["0.6", "0.4"], ["0.8", "0.2"]], "the lean's seat rides the li");

  const key = new El("ol");
  const pf = { noteTitle: new El("h2"), noteWhere: new El("p"), noteProse: new El("p"), key, keyHead: new El("p"), era: new El("p") };
  const plate = { name: "Laukuwelua", note: "A fair town.", key: [{ letter: "A", label: "the citadel" }, { letter: "B", label: "the harbour" }], era: "standing", epithet: "the capital", founded: 402, year: 1059 };
  writeNote(pf as unknown as Parameters<typeof writeNote>[0], plate as unknown as Parameters<typeof writeNote>[1]);
  assert.deepEqual(key.children.map(serialize), [
    `<li><span class="cr-num">A</span><span class="cr-text">the citadel</span></li>`,
    `<li><span class="cr-num">B</span><span class="cr-text">the harbour</span></li>`,
  ]);
  assert.equal(pf.keyHead.hidden, false);
});

test("the three runtime copies are gone: src/site names cr-num in the shared builder alone, and the Print Room's contents, the Prospect's key and the Ribbon's itinerary import it", () => {
  const byHand = globSync("src/site/**/*.ts", { cwd: REPO }).filter((p) => p !== "src/site/shared/contents-row.ts" && /cr-num/.test(read(p)));
  assert.deepEqual(byHand, [], "no app bundle builds the contents row by hand");
  for (const [p, face] of [["src/site/print-room/contents-markup.ts", "contentsRowHtml"], ["src/site/prospect/seats.ts", "contentsRow"], ["src/site/ribbon/seats.ts", "contentsRow"]] as const) {
    assert.match(read(p), new RegExp(`import \\{[^}]*\\b${face}\\b[^}]*\\} from "\\.\\./shared/contents-row\\.ts"`), `${p} takes ${face} from the kit`);
  }
});
