// The Print Room as authored, read with scripts off so what the script rewrites at boot (Bind's flag, the roads' hrefs, the plates' flags) is read as the page ships it (Issue #779 part 2g).
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const TEXT = `((e) => e ? e.textContent.replace(/\\s+/g, " ").trim() : null)`;
const KIDS = `((e) => e ? [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + (c.classList.length ? "." + [...c.classList].join(".") : "")) : null)`;
const BEFORE = `((a, b) => !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING))`;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

type Control = (string | null)[];
type Corner = {
  h1s: string[];
  tagline: string | null;
  retired: number[];
  intros: (string | null)[];
  group: (string | null)[] | null;
  controls: Control[];
  ids: number[];
  inSlip: number;
};
const CORNER: Payload<Corner> = `(() => { const text = ${TEXT};
  const corner = document.querySelector(".corner.tr.folio-room"), group = corner && corner.querySelector(":scope > .folio-controls");
  return { h1s: [...document.querySelectorAll("h1")].map((h) => (corner && corner.contains(h) ? "corner " : "") + h.className + ": " + text(h)),
    tagline: text(corner && corner.querySelector(":scope > .room-tagline")),
    retired: [".order-desk", ".counter", "[class^=offering], [class*=' offering']", ".plate-row", ".plate-dim"].map((s) => document.querySelectorAll(s).length),
    intros: [...document.querySelectorAll(".intro")].map(text),
    group: group && [group.getAttribute("role"), group.getAttribute("aria-label")],
    controls: group ? [...group.children].map((e) => [e.tagName + "#" + e.id + "." + e.className, e.getAttribute("type"), e.getAttribute("min"),
      e.getAttribute("max"), e.getAttribute("step"), e.getAttribute("aria-label"), text(e)]) : [],
    ids: ["pr-seed", "pr-random", "pr-style", "pr-draw"].map((id) => document.querySelectorAll("[id=" + id + "]").length),
    inSlip: document.querySelectorAll(".slip [id=pr-seed], .slip [id=pr-draw]").length };
})()`;

const CONTROLS: Control[] = [
  ["INPUT#pr-seed.control", "number", "0", "4294967295", "1", "seed", ""],
  ["BUTTON#pr-random.dice", "button", null, null, null, "Random seed", "⚄"],
  ["SELECT#pr-style.control", null, null, null, null, "style", "antique topographic ink nautical"],
  ["BUTTON#pr-draw.primary", "button", null, null, null, null, "Pull a proof"],
];

const cornerFaults = (c: Corner): string[] =>
  faults([
    same(c.h1s, ["corner room-name: The Print Room"]) || "one h1, the folio's name",
    c.tagline === "take a world home" || "the tagline",
    c.retired.every((n) => n === 0) || "no retired furniture",
    c.intros.every((t) => !t?.startsWith("This is")) || "no order-desk intro",
    (c.group?.[0] === "group" && !!c.group[1]) || "the control row's role and label",
    same(c.controls, CONTROLS) || "the controls in order, each its own kind",
    (c.ids.every((n) => n === 1) && c.inSlip === 0) || "each control once, none on the slip",
  ]);

type Slip = {
  head: (string | null)[];
  bind: unknown[] | null;
  contents: string | null;
  foot: string[];
  road: unknown[] | null;
  beforeFolio: boolean;
  big: boolean;
};
const SLIP: Payload<Slip> = `(() => { const text = ${TEXT}, before = ${BEFORE};
  const slip = document.querySelector("aside.slip#atlas"), q = (s) => slip && slip.querySelector(s), bind = q(".slip-body #pr-bind"), road = document.getElementById("pr-portfolio");
  const list = q(".slip-body > ol#pr-contents");
  return { head: [text(q(".card-verb")), text(q("#atlas-title")), text(q(".card-where")), q(".slip-fold") && q(".slip-fold").getAttribute("aria-label")],
    bind: bind && [bind.className, bind.getAttribute("type"), text(bind), bind.disabled],
    contents: list && list.className,
    foot: ["pr-print", "pr-download", "pr-hide"].filter((id) => !!q(".slip-foot #" + id)),
    road: road && [!!slip && slip.contains(road), road.getAttribute("href"), text(road)],
    beforeFolio: before(slip, document.querySelector(".corner.bl.folio")),
    big: document.body.textContent.includes("about 20 MB") };
})()`;

const slipFaults = (s: Slip): string[] =>
  faults([
    same(s.head, ["Take home", "The Bound Atlas", "the whole atlas on one sheet", "Fold the atlas away"]) ||
      "the slip's head",
    same(s.bind, ["primary", "button", "Bind the atlas", true]) || "Bind, closed until a proof",
    s.contents === "contents" || "the contents list the kit's row",
    s.foot.length === 3 || "Print, Download and Hide in the foot",
    same(s.road, [true, "../explorer/portfolio/", "The Portfolio"]) || "the Portfolio road, in the slip",
    s.beforeFolio || "the slip before the chart folio",
    !s.big || "no 'about 20 MB'",
  ]);

type Legend = {
  nav: string | null;
  kids: string[] | null;
  format: unknown[] | null;
  note: string | null;
  row: (string | null)[] | null;
  plates: unknown[];
  last: (string | null)[] | null;
  folio: number;
  status: unknown[] | null;
};
const LEGEND: Payload<Legend> = `(() => { const text = ${TEXT}, kids = ${KIDS};
  const nav = document.querySelector("nav.legend"), row = nav && nav.querySelector(":scope > .legend-row"), fmt = document.querySelector(".legend-head #pr-format");
  const last = row && row.lastElementChild, st = document.getElementById("pr-poster-status");
  return { nav: nav && nav.getAttribute("aria-label"), kids: nav && [...nav.children].map((c) => c.className),
    format: fmt && [...fmt.options].map((o) => [o.value, text(o), o.defaultSelected]),
    note: text(nav && nav.querySelector(".legend-note")),
    row: row && [row.getAttribute("role"), row.getAttribute("aria-label"), row.getAttribute("aria-labelledby")],
    plates: row ? [...row.querySelectorAll("[data-poster]")].map((b) => [b.dataset.poster, b.className, b.getAttribute("type"), b.disabled, kids(b), text(b.querySelector(".verb")), text(b.querySelector(".room"))]) : [],
    last: last && [last.tagName + "#" + last.id + "." + last.className, last.getAttribute("href"), text(last.querySelector(".verb")), text(last.querySelector(".room"))],
    folio: row ? (row.outerHTML.match(/portfolio/gi) || []).length : -1,
    status: st && [document.querySelectorAll("[id=pr-poster-status]").length, st.className, st.getAttribute("role"), st.getAttribute("aria-live"), text(st)] };
})()`;

const NOTE =
  "The engraving is exact at any size; an impression is pressed with your device's fonts, and a large one is fitted to what your browser can hold. The chart is pulled only as the engraving.";
const PLATES = [
  ["chart", "1500 px", "Chart"],
  ["desk", "2400 px", "Desk"],
  ["wall", "3300 px", "Wall"],
  ["grand", "4200 px", "Grand"],
].map(([p, verb, room]) => [p, "legend-btn", "button", true, ["SPAN.verb.dim", "SPAN.room"], verb, room]);

const legendFaults = (l: Legend): string[] =>
  faults([
    l.nav === "A poster plate" || "the legend's label",
    same(l.kids, ["legend-head", "legend-note", "legend-row", "legend-status"]) || "the legend's parts in order",
    same(l.format, [
      ["svg", "The engraving itself (SVG)", true],
      ["png1", "An impression (PNG)", false],
      ["png2", "A finer impression (PNG ×2)", false],
    ]) || "Pressed-as in the head, its options and labels",
    l.note === NOTE || "the caveat",
    same(l.row, ["group", "A poster plate", null]) || "the row's role and label",
    same(l.plates, PLATES) || "the four plates ascending, closed, with their verb and room",
    same(l.last, ["A#pr-explorer.legend-btn gold", "../explorer/", "Back to", "The Explorer"]) || "the gold road last",
    l.folio === 0 || "nothing in the row names the portfolio",
    same(l.status, [1, "legend-status", "status", "polite", ""]) || "the poster status under the row",
  ]);

type Stage = {
  chain: boolean;
  label: string | null;
  map: string[] | null;
  hidden: boolean[];
  inner: unknown[] | null;
  after: string[] | null;
  pill: unknown[] | null;
  glass: unknown[];
  folio: string[][];
  atlas: unknown[] | null;
  measure: (string | null)[] | null;
};
const STAGE: Payload<Stage> = `(() => { const text = ${TEXT}, kids = ${KIDS}, before = ${BEFORE};
  const id = (s) => document.getElementById(s), vp = id("map-viewport"), pill = id("pr-status"), atlas = id("pr-atlas"), measure = id("pr-page-measure"), inner = id("pr-page-inner");
  return { chain: !!document.querySelector(".stage > #sheet.sheet > #map-viewport > #map"), label: vp && vp.getAttribute("aria-label"),
    map: kids(id("map")), hidden: ["pr-preview", "pr-turned", "pr-page"].map((s) => !!id(s) && id(s).hidden),
    inner: inner && [kids(id("pr-page")).length, inner.className, inner.childElementCount],
    after: kids(document.querySelector(".stage")),
    pill: pill && [pill.getAttribute("role"), pill.getAttribute("aria-live"), text(pill), id("pr-warning") && id("pr-warning").hidden],
    glass: [...document.querySelectorAll(".corner.br.zoomery > button")].map((b) => [b.id, b.dataset.zoom]),
    folio: [...document.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]),
    atlas: atlas && [atlas.tagName, atlas.className, atlas.childElementCount, before(document.querySelector(".zoomery"), atlas)],
    measure: measure && [measure.className, measure.getAttribute("aria-hidden")] };
})()`;

const stageFaults = (s: Stage): string[] =>
  faults([
    s.chain || "the stage, the sheet, the gesture box and the transform target",
    !!s.label?.startsWith("The proof. ") || "the gesture box's label",
    same(s.map, ["DIV#pr-preview.preview", "IMG#pr-turned.turned", "DIV#pr-page.page"]) ||
      "the proof, the turned plate and the page in the transform target",
    same(s.hidden, [false, true, true]) || "the turned plate and the page hidden as authored",
    same(s.inner, [1, "page-inner matter-page", 0]) || "the page face's one inner, in the matter dress",
    same(s.after, ["DIV#sheet.sheet", "P#pr-status.status", "P#pr-warning.warning", "NOSCRIPT"]) ||
      "the pill, the warning and the notice in the stage",
    same(s.pill, ["status", "polite", "", true]) || "the pill a live status, the warning hidden",
    same(s.glass, [
      ["zoom-in", "in"],
      ["zoom-out", "out"],
      ["zoom-reset", "fit"],
    ]) || "the Glass's three presses",
    same(s.folio, [
      ["folio-title", "folio-title"],
      ["folio-sub plate-line", "pr-plate-line"],
      ["folio-sub", "folio-sub"],
    ]) || "the folio's three lines",
    same(s.atlas, ["DIV", "atlas-sheet", 0, true]) || "the hidden document, after the furniture",
    same(s.measure, ["page-measure matter-page", "true"]) || "the measure box in the matter dress",
  ]);

const NOTICE: Payload<{ ready: string; w: number }> =
  `(() => { const n = document.querySelector(".stage noscript .status"); return { ready: document.readyState, w: n ? n.getBoundingClientRect().width : 0 }; })()`;

export async function pr36Authored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const settle = makeSettle({
    evaluate: (e: string) => evaluate<{ ready: string; w: number } | null>(e).catch(() => null),
    sleep,
  });
  const read = await withScriptsOff(send, async () => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/` });
    // The scripts-off notice having width is the witness that the page loaded with its scripts off.
    await settle(NOTICE, (d) => d.ready === "complete" && d.w > 0, "print-room-scripts-off");
    return {
      corner: await evaluate(CORNER),
      slip: await evaluate(SLIP),
      legend: await evaluate(LEGEND),
      stage: await evaluate(STAGE),
    };
  });
  const wrong = [
    ...cornerFaults(read.corner),
    ...slipFaults(read.slip),
    ...legendFaults(read.legend),
    ...stageFaults(read.stage),
  ];
  check(
    "PR36 the Print Room as authored: the folio's one h1 and its tagline with no retired furniture, the control row in order, the Bound Atlas slip (Bind closed, the kit's contents row, the three presses in the foot, the Portfolio road) before the chart folio, the legend row (Pressed-as, the caveat, four plates ascending and closed, the gold road last), the stage's one gesture box with the proof, the turned plate and the page, the pill, the warning and the notice, the Glass, the folio's lines, the hidden document and the measure box",
    wrong.length === 0,
    JSON.stringify({ wrong, read }),
  );
}
