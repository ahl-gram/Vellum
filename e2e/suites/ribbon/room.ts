// The Wayfarer's Ribbon as the browser built it (Issue #779 part 2g): the markup on seed 42's scroll, and the Prospect road standing down until the scroll resolves.
import type { Payload } from "../../types.ts";
import type { RibbonKit } from "./kit.ts";

const TEXT = `((e) => e ? e.textContent.replace(/\\s+/g, " ").trim() : null)`;
const KIDS = `((e) => e ? [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + (c.classList.length ? "." + [...c.classList].join(".") : "")) : null)`;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

type Corner = {
  h1s: string[];
  tagline: string | null;
  retired: number;
  group: unknown[] | null;
  journey: string[] | null;
  labels: unknown[][];
  swap: unknown[] | null;
  gloss: string | null;
  ids: number[];
  to: unknown[] | null;
};
const CORNER: Payload<Corner> = `(() => { const text = ${TEXT}, kids = ${KIDS}, corner = document.querySelector(".corner.tr.folio-room"), group = corner && corner.querySelector(":scope > .folio-controls");
  const swap = document.getElementById("rb-swap"), to = document.getElementById("rb-to");
  return { h1s: [...document.querySelectorAll("h1")].map((h) => (corner && corner.contains(h) ? "corner " : "") + h.className + ": " + text(h)),
    tagline: text(corner && corner.querySelector(":scope > .room-tagline")), retired: document.querySelectorAll(".plate-figure, .actions, #rb-caption").length,
    group: group && [group.getAttribute("role"), group.getAttribute("aria-label"), kids(group)], journey: kids(document.getElementById("rb-journey")),
    labels: [...document.querySelectorAll("#rb-journey label")].map((l) => [l.htmlFor, text(l), document.getElementById(l.htmlFor) && document.getElementById(l.htmlFor).getAttribute("aria-label")]),
    swap: swap && [swap.getAttribute("type"), swap.className, text(swap), swap.previousElementSibling && swap.previousElementSibling.id, !!swap.closest("#rb-journey")],
    gloss: text(corner && corner.querySelector(":scope > .gloss")), ids: ["rb-from", "rb-to", "rb-swap"].map((id) => document.querySelectorAll("[id=" + id + "]").length),
    to: to && [[...to.options].some((o) => o.value === "24"), [...to.options].some((o) => o.value === to.value)] };
})()`;

const cornerFaults = (c: Corner): string[] =>
  faults([
    same(c.h1s, ["corner room-name: The Wayfarer's Ribbon"]) || "one h1, the folio's name",
    c.tagline === "the road, unrolled" || "the tagline",
    c.retired === 0 || "no retired furniture",
    same(c.group, ["group", "The journey", ["DIV#rb-journey.journey", "BUTTON#rb-swap.primary"]]) ||
      "the journey row a group, Turn about outside the journey",
    same(c.journey, ["LABEL.jl", "SELECT#rb-from.control", "LABEL.jl", "SELECT#rb-to.control"]) ||
      "the journey's labels and selects in order",
    same(c.labels, [
      ["rb-from", "setting out from", "setting out from"],
      ["rb-to", "bound for", "bound for"],
    ]) || "each select labelled",
    same(c.swap, ["button", "primary", "Turn about", "rb-journey", false]) ||
      "Turn about the primary, after the journey",
    c.gloss === "choose where you set out and where you are bound; the surveyor unrolls the way between" || "the gloss",
    c.ids.every((n) => n === 1) || "each id once",
    same(c.to, [false, true]) || "bound for offers only reachable places",
  ]);

type Slip = {
  slip: string | null;
  head: (string | null)[];
  body: string[] | null;
  texts: (string | null)[];
  beforeFolio: boolean;
};
const SLIP: Payload<Slip> = `(() => { const text = ${TEXT}, kids = ${KIDS}, slip = document.getElementById("itinerary"), q = (s) => slip && slip.querySelector(s), folio = document.querySelector(".corner.bl.folio");
  return { slip: slip && slip.tagName + "." + slip.className, head: [text(q(".card-verb")), text(document.querySelector(".slip-tab[aria-controls=itinerary]")), q(".slip-fold") && q(".slip-fold").getAttribute("aria-label")],
    body: kids(q(".slip-body")), texts: [text(q(".intro")), text(q(".itinerary-head > span")), text(q(".row-gloss"))],
    beforeFolio: !!slip && !!folio && !!(slip.compareDocumentPosition(folio) & Node.DOCUMENT_POSITION_FOLLOWING) };
})()`;

const INTRO =
  "Every bridge and ford, every wayside village, every fork signed for the town it leaves for, as the wayfarers' chain measured them.";
const slipFaults = (s: Slip): string[] =>
  faults([
    s.slip === "ASIDE.slip" || "the itinerary an aside slip",
    same(s.head, ["The itinerary", "The Itinerary", "Fold the itinerary away"]) || "the slip's head",
    same(s.body, ["P.intro", "P.itinerary-head", "OL#rb-itinerary.contents.itinerary", "P.row-gloss"]) ||
      "the slip's body in order, the itinerary the kit's contents row",
    same(s.texts, [INTRO, "The way, league by league", "A row leans the Glass on that stretch of the road."]) ||
      "the intro, the head and the row gloss",
    s.beforeFolio || "the slip before the chart folio",
  ]);

type Stage = {
  nav: string | null;
  row: string[] | null;
  roads: (string | null)[][];
  verbId: boolean;
  label: string | null;
  map: string[] | null;
  after: string[] | null;
  pill: unknown[] | null;
  glass: (string | undefined)[];
  folio: string[][];
};
const STAGE: Payload<Stage> = `(() => { const text = ${TEXT}, kids = ${KIDS}, id = (s) => document.getElementById(s), row = document.querySelector("nav.legend .legend-row"), pill = id("rb-status");
  return { nav: document.querySelector("nav.legend") && document.querySelector("nav.legend").getAttribute("aria-label"), row: kids(row),
    roads: row ? [...row.children].map((a) => [text(a.querySelector(".verb")), text(a.querySelector(".room"))]) : [], verbId: !!document.querySelector("#rb-prospect-link #rb-prospect-verb"),
    label: id("map-viewport") && id("map-viewport").getAttribute("aria-label"), map: kids(id("map")), after: kids(document.querySelector(".stage")),
    pill: pill && [pill.getAttribute("role"), pill.getAttribute("aria-live"), id("rb-warning") && id("rb-warning").hidden],
    glass: [...document.querySelectorAll(".zoomery [data-zoom]")].map((b) => b.dataset.zoom), folio: [...document.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]) };
})()`;

const stageFaults = (s: Stage, to: string | null): string[] =>
  faults([
    s.nav === "The roads out" || "the legend's label",
    same(s.row, ["A#rb-chart-link.legend-btn.gold", "A#rb-prospect-link.legend-btn"]) ||
      "the gold road back first, the Prospect road after",
    same(s.roads, [
      ["Return to", "The Explorer"],
      [`See ${to} in`, "The Prospect"],
    ]) || "the roads' verbs and rooms",
    s.verbId || "the Prospect road's verb the script rewrites",
    !!s.label?.startsWith("The scroll. ") || "the gesture box's label",
    same(s.map, ["IMG#rb-plate.plate"]) || "the scroll the transform target's one face",
    same(s.after, ["DIV#sheet.sheet", "P#rb-status.status", "P#rb-warning.warning", "NOSCRIPT"]) ||
      "the pill, the warning and the notice in the stage",
    same(s.pill, ["status", "polite", true]) || "the pill a live status, the warning hidden",
    same(s.glass, ["in", "out", "fit"]) || "the Glass's three presses",
    same(s.folio, [
      ["folio-title", "folio-title"],
      ["folio-sub", "folio-sub"],
      ["folio-coords", "rb-unrolled"],
    ]) || "the folio's three lines",
  ]);

export async function rb11Markup({ evaluate, check, opened }: RibbonKit): Promise<void> {
  const st = await opened("seed 42, for its markup");
  const corner = await evaluate(CORNER);
  const slip = await evaluate(SLIP);
  const stage = await evaluate(STAGE);
  const wrong = [...cornerFaults(corner), ...slipFaults(slip), ...stageFaults(stage, st.toName)];
  check(
    "RB11 the Ribbon's markup on seed 42's scroll: the folio's one h1 and tagline with no retired furniture, the journey row a group (two labelled selects, Turn about the primary outside them, each id once, bound for offering only reachable places), the itinerary slip in order before the chart folio, the roads out (the gold road back first, then the Prospect), the scroll the transform target's one face, the pill, the warning and the notice in the stage, the Glass, the folio's lines",
    wrong.length === 0,
    JSON.stringify({ wrong, corner, slip, stage }),
  );
}

// Installed before the page: the first status line the scroll's draw writes, and what the Prospect road and the plate were at that moment.
const WATCH = `(() => { window.__rb16 = null; new MutationObserver(() => { const s = document.getElementById("rb-status"); if (window.__rb16 || !s || !s.textContent) return;
  const road = document.getElementById("rb-prospect-link"), plate = document.getElementById("rb-plate");
  window.__rb16 = { status: s.textContent, road: road && getComputedStyle(road).display, plateHidden: !!plate && plate.hidden }; }).observe(document, { childList: true, subtree: true, characterData: true }); })();`;

export async function rb16RoadStandsDown({ evaluate, send, check, goto, opened }: RibbonKit): Promise<void> {
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
  try {
    await goto("#seed=42");
    await opened("seed 42, watched from boot");
    const r = await evaluate<{
      first: { status: string; road: string | null; plateHidden: boolean } | null;
      drawn: string;
    }>(`({ first: window.__rb16, drawn: getComputedStyle(document.getElementById("rb-prospect-link")).display })`);
    check(
      "RB16 the Prospect road stands down until the scroll resolves: at the draw's first status line the road is not shown and the plate still hidden, and once the scroll is drawn the road stands (the control)",
      !!r.first &&
        r.first.status === "The surveyor unrolls the scroll…" &&
        r.first.road === "none" &&
        r.first.plateHidden &&
        r.drawn !== "none",
      JSON.stringify(r),
    );
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}
