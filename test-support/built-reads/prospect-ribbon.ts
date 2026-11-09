import { LAY_ON_PAGE } from "../../src/site/explorer/chart-drawer.ts";
import { before, faults, kids, same, text } from "../built-dom.ts";

const ERA_GLOSS =
  "The same place, chart and year always press the same plate. Open another settlement's prospect from its card in the Explorer.";
const INTRO =
  "Every bridge and ford, every wayside village, every fork signed for the town it leaves for, as the wayfarers' chain measured them.";
const FOLIO_LINES = (doc: Document) =>
  [...doc.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]);
const h1sOf = (doc: Document, corner: Element | null) =>
  [...doc.querySelectorAll("h1")].map((h) => (corner?.contains(h) ? "corner " : "") + h.className + ": " + text(h));
const taglineOf = (corner: Element | null) => text(corner?.querySelector(":scope > .room-tagline") ?? null);
const roadRows = (row: Element | null) =>
  row ? [...row.children].map((a) => [text(a.querySelector(".verb")), text(a.querySelector(".room"))]) : [];

// The Prospect's markup (from e2e PB12). Dropped with what only a running browser has: the year field's accessible name (its label's `for` stays asserted) and the Ribbon road's verb, which the script writes with the capital's name (its room stays).
export function pb12Faults(doc: Document): string[] {
  const corner = doc.querySelector(".corner.tr.folio-room");
  const form = doc.getElementById("pp-year-form");
  const label = doc.querySelector("label.year-label");
  const y = doc.getElementById("pp-year");
  const e = doc.getElementById("pp-engrave");
  const slip = doc.getElementById("note");
  const q = (s: string) => slip?.querySelector(s) ?? null;
  const nav = doc.querySelector("nav.legend");
  const row = nav?.querySelector(".legend-row") ?? null;
  const vp = doc.getElementById("map-viewport");
  const pill = doc.getElementById("pp-status");
  const warning = doc.getElementById("pp-warning");
  const lay = q("#pp-lay");
  return faults([
    same(h1sOf(doc, corner), ["corner room-name: The Prospect"]) || "one h1, the folio's name",
    taglineOf(corner) === "the second camera" || "the tagline",
    doc.querySelectorAll(".intro, .plate-figure, .actions, #pp-caption").length === 0 || "no retired furniture",
    same(form && [form.tagName, form.className, form.getAttribute("aria-label"), form.parentElement === corner], [
      "FORM",
      "folio-controls",
      "The year viewed",
      true,
    ]) || "the year control a form in the corner",
    same(label && [label.getAttribute("for"), text(label)], ["pp-year", "viewed in the year"]) || "the year's label",
    same(
      y && [
        y.getAttribute("type"),
        y.getAttribute("inputmode"),
        y.getAttribute("autocomplete"),
        y.hasAttribute("aria-label"),
        y.className,
      ],
      ["text", "numeric", "off", false, "control"],
    ) || "the year's own attributes",
    same(e && [e.getAttribute("type"), e.className, text(e), e.closest("form") === form], [
      "submit",
      "primary",
      "Engrave",
      true,
    ]) || "Engrave the form's submit",
    same(kids(form), ["LABEL.year-label", "INPUT#pp-year.control", "BUTTON#pp-engrave.primary"]) ||
      "label, year, Engrave in order",
    text(corner?.querySelector(":scope > .gloss") ?? null) ===
      "turn the year back, even to the ground before it rose" || "the gloss",
    (slip && slip.tagName + "." + slip.className) === "ASIDE.slip" || "the note an aside slip",
    same(
      [
        text(q(".card-verb")),
        text(doc.querySelector(".slip-tab[aria-controls=note]")),
        q(".slip-fold")?.getAttribute("aria-label") ?? null,
      ],
      ["The engraver's note", "The Engraver's Note", "Fold the engraver's note away"],
    ) || "the slip's head",
    same(kids(q(".slip-body")), [
      "P#pp-note.note-prose",
      "P#pp-key-head.key-head",
      "OL#pp-key.contents.plate-key",
      "P#pp-era.era",
      "P.era-gloss",
      "DIV.pp-file",
    ]) || "the slip's body in order",
    same([text(q("#pp-key-head")), text(q(".era-gloss"))], ["The key to the plate", ERA_GLOSS]) ||
      "the key's head and the era gloss",
    (same(kids(q(".pp-file")), ["BUTTON#pp-lay.pp-lay", "P#pp-lay-count.pp-lay-count"]) &&
      lay?.getAttribute("type") === "button") ||
      "the filing press on the note",
    before(slip, doc.querySelector(".corner.bl.folio")) || "the slip before the chart folio",
    same(
      [nav?.getAttribute("aria-label") ?? null, text(nav?.querySelector(".legend-head") ?? null)],
      ["The roads out", "The roads out"],
    ) || "the legend's label and head",
    same(kids(row), ["A#pp-chart-link.legend-btn.gold", "A#pp-ribbon-link.legend-btn"]) ||
      "the gold road back first, the Ribbon road after",
    (same(roadRows(row)[0], ["Return to", "The Explorer"]) && roadRows(row)[1]?.[1] === "The Wayfarer's Ribbon") ||
      "the roads' verbs and rooms",
    !!doc.querySelector("#pp-ribbon-link #pp-ribbon-verb") || "the Ribbon road's verb the script rewrites",
    doc.querySelectorAll(".legend .pp-lay").length === 0 || "no filing press among the roads",
    !!vp?.getAttribute("aria-label")?.startsWith("The plate. ") || "the gesture box's label",
    (same(kids(doc.getElementById("map")), ["IMG#pp-plate.plate"]) &&
      doc.querySelectorAll("#sheet svg").length === 0) ||
      "the plate the transform target's one face, no inline svg",
    same(kids(doc.querySelector(".stage")), [
      "DIV#sheet.sheet",
      "P#pp-status.status",
      "P#pp-warning.warning",
      "NOSCRIPT",
    ]) || "the pill, the warning and the notice in the stage",
    same(pill && [pill.getAttribute("role"), pill.getAttribute("aria-live")], ["status", "polite"]) ||
      "the pill a live status",
    (warning && warning.hasAttribute("hidden")) === true || "the warning hidden",
    same(FOLIO_LINES(doc), [
      ["folio-title", "folio-title"],
      ["folio-sub", "folio-sub"],
      ["folio-coords", "pp-pressed"],
    ]) || "the folio's three lines",
  ]);
}

// The Prospect as authored (from e2e PB16, which read it with scripts off). Dropped with what only a running browser has: the scripts-on control, the plate's resolved display and the scripts-off notice's box inside the stage.
export function pb16Faults(doc: Document): string[] {
  const id = (s: string) => doc.getElementById(s);
  const plate = id("pp-plate");
  const notice = doc.querySelector(".stage noscript .status");
  return faults([
    text(id("pp-lay")) === LAY_ON_PAGE || "the filing press faced with the one constant the script paints with",
    !!text(doc.querySelector("#note .card-where")) || "the note's where line",
    same(
      ["pp-chart-link", "pp-ribbon-link"].map((s) => id(s)?.getAttribute("href") ?? null),
      ["/explorer/", "/ribbon/"],
    ) || "the roads' authored hrefs",
    same(plate && [plate.hasAttribute("hidden"), plate.getAttribute("alt")], [true, ""]) ||
      "the plate hidden with an empty alt",
    String(text(notice)).includes("the Prospect needs JavaScript") || "the scripts-off notice in the stage",
  ]);
}

// The Ribbon's markup (from e2e RB11). Dropped with what only a running browser has: "bound for" holding only reachable places (`roadReachable` holds the logic in test/site/ribbon-job.test.ts) and the Prospect road's verb, which the script writes with the place's name (its room stays).
export function rb11Faults(doc: Document): string[] {
  const id = (s: string) => doc.getElementById(s);
  const corner = doc.querySelector(".corner.tr.folio-room");
  const group = corner?.querySelector(":scope > .folio-controls") ?? null;
  const swap = id("rb-swap");
  const slip = id("itinerary");
  const q = (s: string) => slip?.querySelector(s) ?? null;
  const row = doc.querySelector("nav.legend .legend-row");
  const nav = doc.querySelector("nav.legend");
  const vp = id("map-viewport");
  const pill = id("rb-status");
  const warning = id("rb-warning");
  return faults([
    same(h1sOf(doc, corner), ["corner room-name: The Wayfarer's Ribbon"]) || "one h1, the folio's name",
    taglineOf(corner) === "the road, unrolled" || "the tagline",
    doc.querySelectorAll(".plate-figure, .actions, #rb-caption").length === 0 || "no retired furniture",
    same(group && [group.getAttribute("role"), group.getAttribute("aria-label"), kids(group)], [
      "group",
      "The journey",
      ["DIV#rb-journey.journey", "BUTTON#rb-swap.primary"],
    ]) || "the journey row a group, Turn about outside the journey",
    same(kids(id("rb-journey")), ["LABEL.jl", "SELECT#rb-from.control", "LABEL.jl", "SELECT#rb-to.control"]) ||
      "the journey's labels and selects in order",
    same(
      [...doc.querySelectorAll("#rb-journey label")].map((l) => {
        const target = l.getAttribute("for");
        return [target, text(l), (target && id(target)?.getAttribute("aria-label")) ?? null];
      }),
      [
        ["rb-from", "setting out from", "setting out from"],
        ["rb-to", "bound for", "bound for"],
      ],
    ) || "each select labelled",
    same(
      swap && [
        swap.getAttribute("type"),
        swap.className,
        text(swap),
        swap.previousElementSibling?.id ?? null,
        !!swap.closest("#rb-journey"),
      ],
      ["button", "primary", "Turn about", "rb-journey", false],
    ) || "Turn about the primary, after the journey",
    text(corner?.querySelector(":scope > .gloss") ?? null) ===
      "choose where you set out and where you are bound; the surveyor unrolls the way between" || "the gloss",
    ["rb-from", "rb-to", "rb-swap"].every((x) => doc.querySelectorAll("[id=" + x + "]").length === 1) || "each id once",
    (slip && slip.tagName + "." + slip.className) === "ASIDE.slip" || "the itinerary an aside slip",
    same(
      [
        text(q(".card-verb")),
        text(doc.querySelector(".slip-tab[aria-controls=itinerary]")),
        q(".slip-fold")?.getAttribute("aria-label") ?? null,
      ],
      ["The itinerary", "The Itinerary", "Fold the itinerary away"],
    ) || "the slip's head",
    same(kids(q(".slip-body")), [
      "P#rb-fallback.fallback-gloss",
      "P.intro",
      "P.itinerary-head",
      "OL#rb-itinerary.contents.itinerary",
      "P.row-gloss",
    ]) || "the slip's body in order, the itinerary the kit's contents row",
    same(
      [text(q(".intro")), text(q(".itinerary-head > span")), text(q(".row-gloss"))],
      [INTRO, "The way, league by league", "A row leans the Glass on that stretch of the road."],
    ) || "the intro, the head and the row gloss",
    before(slip, doc.querySelector(".corner.bl.folio")) || "the slip before the chart folio",
    nav?.getAttribute("aria-label") === "The roads out" || "the legend's label",
    same(kids(row), ["A#rb-chart-link.legend-btn.gold", "A#rb-prospect-link.legend-btn"]) ||
      "the gold road back first, the Prospect road after",
    (same(roadRows(row)[0], ["Return to", "The Explorer"]) && roadRows(row)[1]?.[1] === "The Prospect") ||
      "the roads' verbs and rooms",
    !!doc.querySelector("#rb-prospect-link #rb-prospect-verb") || "the Prospect road's verb the script rewrites",
    !!vp?.getAttribute("aria-label")?.startsWith("The scroll. ") || "the gesture box's label",
    same(kids(id("map"), ["rb-inking"]), ["IMG#rb-plate.plate"]) || "the scroll the transform target's one face",
    same(kids(doc.querySelector(".stage")), [
      "DIV#sheet.sheet",
      "P#rb-status.status",
      "P#rb-warning.warning",
      "NOSCRIPT",
    ]) || "the pill, the warning and the notice in the stage",
    same(
      pill && [pill.getAttribute("role"), pill.getAttribute("aria-live"), warning && warning.hasAttribute("hidden")],
      ["status", "polite", true],
    ) || "the pill a live status, the warning hidden",
    same(
      [...doc.querySelectorAll(".zoomery [data-zoom]")].map((b) => b.getAttribute("data-zoom")),
      ["in", "out", "fit"],
    ) || "the Glass's three presses",
    same(FOLIO_LINES(doc), [
      ["folio-title", "folio-title"],
      ["folio-sub", "folio-sub"],
      ["folio-coords", "rb-unrolled"],
    ]) || "the folio's three lines",
  ]);
}
