// The Explorer as authored (scripts off), the Glossary's drafting-table terms and the pickers' options against the Chart Table's grammar (Issue #779 part 2h).
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";
import { axName } from "../prospect/kit.ts";
import { parseTableValue } from "../../../src/site/shared/table-address.ts";

const TEXT = `((e) => e ? e.textContent.replace(/\\s+/g, " ").trim() : null)`;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

type Corner = {
  h1s: string[];
  tagline: string | null;
  group: (string | null)[] | null;
  kids: (string | null)[][] | null;
};
const CORNER: Payload<Corner> = `(() => { const text = ${TEXT};
  const corner = document.querySelector(".corner.tr.folio-room"), group = corner && corner.querySelector(":scope > .folio-controls");
  return { h1s: [...document.querySelectorAll("h1")].map((h) => (corner && corner.contains(h) ? "corner " : "") + h.className + ": " + text(h)),
    tagline: text(corner && corner.querySelector(":scope > .room-tagline")),
    group: group && [group.getAttribute("role"), group.getAttribute("aria-label")],
    kids: group ? [...group.children].map((e) => [e.tagName + "#" + e.id + "." + e.className, e.getAttribute("type")]) : null };
})()`;

const cornerFaults = (c: Corner): string[] =>
  faults([
    same(c.h1s, ["corner room-name: The Explorer"]) || "the folio's one h1",
    c.tagline === "every seed is a world, draw one" || "the tagline",
    same(c.group, ["group", "The seed"]) || "the seed row's role and label",
    same(c.kids, [
      ["INPUT#seed.control", "number"],
      ["BUTTON#random.dice", "button"],
      ["BUTTON#draw.primary", null],
    ]) || "the seed, the dice and Draw, each its own kind",
  ]);

const GROUPS: Payload<(string | null)[]> =
  `[...document.querySelectorAll('[role="group"]')].map((g) => g.getAttribute("aria-label") || g.getAttribute("aria-labelledby"))`;

type Slip = {
  id: string | null;
  name: string | null;
  panels: (string | null)[] | null;
  land: (string | null)[] | null;
  strand: (string | null)[] | null;
  hand: (string | null)[] | null;
  seals: unknown[];
  marks: unknown[];
  notes: unknown[];
  imprint: string | null;
};
const SLIP: Payload<Omit<Slip, "name">> =
  `(() => { const text = ${TEXT}, slip = document.querySelector("aside.slip#broadside");
  const panels = slip ? [...slip.querySelectorAll(".slip-body > .broadside > .panel[role=group]")] : [];
  const ids = (p) => p ? [...p.querySelectorAll("input, select, button")].map((e) => e.id) : null;
  return { id: slip && slip.id, panels: panels.map((p) => p.getAttribute("aria-labelledby")),
    land: ids(panels[0]), strand: ids(panels[1]), hand: ids(panels[2]),
    seals: slip ? [...slip.querySelectorAll(".seals > label")].map((l) => { const i = l.querySelector("input");
      return [l.className, l.childNodes[0].textContent.trim(), i ? i.id : null, i ? i.getAttribute("type") : null]; }) : [],
    marks: [...document.querySelectorAll("a.fn")].map((a) => [a.getAttribute("href"), a.getAttribute("data-note"), a.getAttribute("title")]),
    notes: [...document.querySelectorAll(".fn-note")].map((n) => { const a = n.querySelector("a");
      return [n.id, text(n.querySelector(".fn-head")), a ? a.getAttribute("href") : null]; }),
    imprint: text(slip && slip.querySelector(".imprint")) };
})()`;

const slipFaults = (s: Slip): string[] =>
  faults([
    s.id === "broadside" || "the slip is #broadside",
    s.name === "The Broadside" || "the slip named by its title alone, the title's mark outside the heading",
    same(s.panels, ["grp-land", "grp-strand", "grp-hand"]) || "The Land, The Strand and The Hand ride the slip",
    same(s.land, ["type", "band", "place", "islands", "isle-equal", "isle-varied"]) || "The Land's controls in order",
    same(s.strand, ["land", "coast", "ragged", "looseness"]) || "The Strand's controls in order",
    same(s.hand, ["style", "theme", "legend", "arms", "beasts", "ages"]) || "The Hand's controls in order",
    same(s.seals, [
      ["check seal", "alike", "isle-equal", "radio"],
      ["check seal", "of every size", "isle-varied", "radio"],
      ["check seal", "legend", "legend", "checkbox"],
      ["check seal", "arms", "arms", "checkbox"],
      ["check seal", "beasts", "beasts", "checkbox"],
      ["check seal", "survey", "ages", "checkbox"],
    ]) || "the six seals, each wrapping its input",
    same(s.marks, [
      ["/glossary/#broadside", "note-broadside", null],
      ["/glossary/#seeds-choice", "note-seeds-choice", null],
      ["/glossary/#shape", "note-shape", null],
      ["/glossary/#islands", "note-islands", null],
      ["/glossary/#coast-warp", "note-coast-warp", null],
      ["/glossary/#survey", "note-survey", null],
      ["/glossary/#verso", "note-verso", null],
    ]) || "the seven marks, the title's first",
    same(s.notes, [
      ["note-broadside", "of the broadside", "/glossary/#broadside"],
      ["note-seeds-choice", "of the seed's choice", "/glossary/#seeds-choice"],
      ["note-shape", "of the shape", "/glossary/#shape"],
      ["note-islands", "of the islands", "/glossary/#islands"],
      ["note-coast-warp", "of the coast warp", "/glossary/#coast-warp"],
      ["note-survey", "of the survey", "/glossary/#survey"],
      ["note-verso", "of the verso", "/glossary/#verso"],
    ]) || "the seven notes, each head and its link",
    s.imprint === "Printed at the atelier, for Chart №" || "the printer's line",
  ]);

type Legend = {
  head: string | null;
  row: (string | null)[] | null;
  kids: string[] | null;
  turn: string | null;
  roads: unknown[];
  actionLinks: number;
};
const LEGEND: Payload<Legend> = `(() => { const text = ${TEXT}, nav = document.querySelector("nav.legend");
  const head = nav && nav.querySelector(":scope > #grp-press"), row = nav && nav.querySelector(":scope > .legend-row"), turn = document.getElementById("verso-turn");
  const road = (id) => { const a = document.getElementById(id);
    return a ? [a.getAttribute("href"), text(a.querySelector(".verb")), text(a.querySelector(".room"))] : null; };
  return { head: head ? head.tagName + "." + head.className : null,
    row: row && [row.getAttribute("role"), row.getAttribute("aria-labelledby")],
    kids: row ? [...row.children].map((e) => e.tagName + (e.id ? "#" + e.id : "") + (e.classList.length ? "." + [...e.classList].join(".") : "")) : null,
    turn: turn ? turn.getAttribute("type") : null,
    roads: ["order-plates", "journal-link"].map(road), actionLinks: document.querySelectorAll(".action-link").length };
})()`;

const legendFaults = (l: Legend): string[] =>
  faults([
    l.head === "P.legend-head" || "the Press's head",
    same(l.row, ["group", "grp-press"]) || "the legend row's role and label",
    same(l.kids, [
      "BUTTON#verso-turn.legend-btn",
      "A.fn",
      "A#order-plates.legend-btn.gold",
      "A#journal-link.legend-btn.gold",
    ]) || "Turn the sheet first, then the two gold roads",
    l.turn === "button" || "Turn the sheet's type",
    same(l.roads, [
      ["../print-room/", "Take to", "The Print Room"],
      ["/reading-room/", "Read the journal in", "The Reading Room"],
    ]) || "the roads at their authored hrefs, verbs and rooms",
    l.actionLinks === 0 || "no retired action link",
  ]);

type Stage = {
  leaf: boolean;
  mapKids: number | null;
  verso: (string | null | number)[] | null;
  glass: unknown[] | null;
  status: unknown[] | null;
  folio: (string | null)[][];
};
const STAGE: Payload<Stage> = `(() => { const text = ${TEXT};
  const leaf = document.querySelector(".stage > #sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map.living-chart");
  const map = document.getElementById("map"), verso = document.getElementById("verso"), glass = document.getElementById("zoom-controls"),
    status = document.getElementById("status"), vp = document.getElementById("map-viewport");
  return { leaf: !!leaf, mapKids: map ? map.childElementCount : null,
    verso: verso ? [verso.parentElement.id, verso.previousElementSibling ? verso.previousElementSibling.id : null, verso.getAttribute("aria-hidden"), verso.childElementCount] : null,
    glass: glass ? [glass.className, glass.getAttribute("role"), vp.contains(glass), [...glass.children].map((b) => [b.id, b.getAttribute("data-zoom")])] : null,
    status: status ? [status.tagName + "." + status.className, status.getAttribute("role"), status.getAttribute("aria-live"), text(status), status.parentElement.classList.contains("stage")] : null,
    folio: [...document.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id, text(p)]) };
})()`;

const stageFaults = (s: Stage): string[] =>
  faults([
    s.leaf || "the stage's leaf, the gesture box inside it",
    s.mapKids === 0 || "the gesture box's empty map",
    same(s.verso, ["sheet-inner", "map-viewport", "true", 0]) || "the hidden verso beside it",
    same(s.glass, [
      "chrome corner br zoomery",
      "group",
      false,
      [
        ["zoom-touch", null],
        ["zoom-hold", null],
        ["zoom-loupe", null],
        ["zoom-in", "in"],
        ["zoom-out", "out"],
        ["zoom-reset", "fit"],
      ],
    ]) || "the Glass outside the gesture box",
    same(s.status, ["P.status", "status", "polite", "", true]) || "the status pill, a live status in the stage",
    same(s.folio, [
      ["folio-title", "folio-title", ""],
      ["folio-sub", "folio-sub", ""],
      ["folio-coords", "caption", ""],
    ]) || "the chart folio's three empty lines",
  ]);

type Authored = { corner: Corner; groups: (string | null)[]; slip: Slip; legend: Legend; stage: Stage };
type Notice = { ready: string; w: number };
const NOTICE: Payload<Notice> = `(() => { const n = document.querySelector(".stage noscript .status"); return { ready: document.readyState, w: n ? n.getBoundingClientRect().width : 0 }; })()`;

export async function br9Authored({ evaluate, send, check, sleep, PORT }: BroadsideKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep, tolerant: true });
  try {
    const read = await withScriptsOff(send, async (): Promise<Authored> => {
      await send("Page.navigate", { url: "about:blank" });
      await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
      // The scripts-off notice having width is the witness that the page's module never ran.
      await settle(NOTICE, (d) => d.ready === "complete" && d.w > 0, "explorer-scripts-off");
      return {
        corner: await evaluate(CORNER),
        groups: await evaluate(GROUPS),
        slip: { ...(await evaluate(SLIP)), name: await axName({ send }, "aside.slip#broadside") },
        legend: await evaluate(LEGEND),
        stage: await evaluate(STAGE),
      };
    });
    const wrong = faults([
      ...cornerFaults(read.corner),
      same(read.groups, ["The seed", "grp-land", "held", "grp-strand", "held", "grp-hand", "grp-press", "Camera"]) ||
        "the groups in reading order",
      ...slipFaults(read.slip),
      ...legendFaults(read.legend),
      ...stageFaults(read.stage),
    ]);
    check(
      "BR9 the Explorer as authored: the folio's one h1 and tagline with the seed row its one control group (the seed, the dice, Draw the primary), the groups in reading order, the Broadside slip, named by its title alone, carrying The Land, The Strand and The Hand with their controls and six seals, seven footnote marks and their notes going to the glossary with no title, its printer's line, the Press as the legend row (Turn the sheet first, then the two gold roads at their authored hrefs, verbs and rooms) with no retired action link, the stage's leaf holding the empty gesture box and the hidden verso, the Glass outside it, the status pill a live status, and the chart folio's three empty lines",
      wrong.length === 0,
      JSON.stringify({ wrong, read }),
    );
  } finally {
    // A hash-only navigate from here would keep this scripts-off document, so the next load starts from a blank one.
    await send("Page.navigate", { url: "about:blank" });
  }
}

type Terms = (string | boolean | null)[][];
const TERMS: Payload<{ h: string | null; terms: Terms }> =
  `(() => { const text = ${TEXT}, h = document.getElementById("drafting-table");
  let next = null; if (h) { let e = h.nextElementSibling; while (e && e.tagName !== "H2") e = e.nextElementSibling; next = e; }
  const after = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  return { h: h ? text(h) : null, terms: ["broadside", "coast-warp", "islands", "looseness", "seeds-choice", "shape", "sizes", "survey"].map((id) => { const t = document.getElementById(id);
    return t ? [text(t), t.tagName + "." + t.className, after(h, t) && (!next || after(t, next))] : [null, null, null]; }) };
})()`;

export async function br10Terms({ evaluate, check }: BroadsideKit): Promise<void> {
  const read = await evaluate(TERMS);
  check(
    "BR10 the Glossary's drafting-table section names the Explorer's control terms: Broadside, Coast warp, Islands, Looseness, Seed's choice, Shape, Sizes and Survey, each a term entry under that heading",
    read.h === "At the drafting table" &&
      same(read.terms, [
        ["Broadside", "P.term", true],
        ["Coast warp", "P.term", true],
        ["Islands", "P.term", true],
        ["Looseness", "P.term", true],
        ["Seed's choice", "P.term", true],
        ["Shape", "P.term", true],
        ["Sizes", "P.term", true],
        ["Survey", "P.term", true],
      ]),
    JSON.stringify(read),
  );
}

const OPTIONS: Payload<(string | null)[][]> =
  `["style", "type", "band", "theme"].map((id) => { const s = document.getElementById(id);
  return [id, s ? [...s.options].map((o) => o.value).filter((v) => v !== "") : null]; })`;

const SAMPLES: Record<string, string> = {
  style: "k-s.seed-42.style-VALUE.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  type: "k-s.seed-42.type-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  band: "k-s.seed-42.band-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  theme: "k-s.seed-42.theme-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
};

export async function br11Allowlist({ evaluate, check }: BroadsideKit): Promise<void> {
  const read = await evaluate(OPTIONS);
  const refused: [string, string][] = [];
  const empty: string[] = [];
  for (const [id, values] of read) {
    if (!id) continue;
    if (!values || values.length === 0) {
      empty.push(String(id));
      continue;
    }
    for (const v of values) if (parseTableValue(SAMPLES[id]!.replace("VALUE", v)).length !== 1) refused.push([id, v]);
  }
  check(
    "BR11 every value the Explorer's style, type, climate and theme pickers offer is one the Chart Table's grammar files, so no link the Explorer writes is dropped on arrival",
    empty.length === 0 && refused.length === 0,
    JSON.stringify({ empty, refused }),
  );
}
