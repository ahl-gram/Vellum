import { before, faults, kids, same, text } from "../built-dom.ts";

const CONTROLS = [
  ["INPUT#pr-seed.control", "number", "0", "4294967295", "1", "seed", ""],
  ["BUTTON#pr-random.dice", "button", null, null, null, "Random seed", "⚄"],
  ["SELECT#pr-style.control", null, null, null, null, "style", "antique topographic ink nautical"],
  ["BUTTON#pr-draw.primary", "button", null, null, null, null, "Pull a proof"],
];

const NOTE =
  "The engraving is exact at any size; an impression is pressed with your device's fonts, and a large one is fitted to what your browser can hold. The chart is pulled only as the engraving.";
const PLATES = [
  ["chart", "1500 px", "Chart"],
  ["desk", "2400 px", "Desk"],
  ["wall", "3300 px", "Wall"],
  ["grand", "4200 px", "Grand"],
].map(([p, verb, room]) => [p, "legend-btn", "button", true, ["SPAN.verb.dim", "SPAN.room"], verb, room]);

function cornerFaults(doc: Document): string[] {
  const corner = doc.querySelector(".corner.tr.folio-room");
  const group = corner?.querySelector(":scope > .folio-controls") ?? null;
  const h1s = [...doc.querySelectorAll("h1")].map(
    (h) => (corner?.contains(h) ? "corner " : "") + h.className + ": " + text(h),
  );
  const retired = [
    ".order-desk",
    ".counter",
    "[class^=offering], [class*=' offering']",
    ".plate-row",
    ".plate-dim",
  ].map((s) => doc.querySelectorAll(s).length);
  const intros = [...doc.querySelectorAll(".intro")].map(text);
  const controls = group
    ? [...group.children].map((e) => [
        e.tagName + "#" + e.id + "." + e.className,
        e.getAttribute("type"),
        e.getAttribute("min"),
        e.getAttribute("max"),
        e.getAttribute("step"),
        e.getAttribute("aria-label"),
        text(e),
      ])
    : [];
  const ids = ["pr-seed", "pr-random", "pr-style", "pr-draw"].map(
    (id) => doc.querySelectorAll("[id=" + id + "]").length,
  );
  const inSlip = doc.querySelectorAll(".slip [id=pr-seed], .slip [id=pr-draw]").length;
  return faults([
    same(h1s, ["corner room-name: The Print Room"]) || "one h1, the folio's name",
    text(corner?.querySelector(":scope > .room-tagline") ?? null) === "take a world home" || "the tagline",
    retired.every((n) => n === 0) || "no retired furniture",
    intros.every((t) => !t?.startsWith("This is")) || "no order-desk intro",
    (group?.getAttribute("role") === "group" && !!group.getAttribute("aria-label")) ||
      "the control row's role and label",
    same(controls, CONTROLS) || "the controls in order, each its own kind",
    (ids.every((n) => n === 1) && inSlip === 0) || "each control once, none on the slip",
  ]);
}

function slipFaults(doc: Document): string[] {
  const slip = doc.querySelector("aside.slip#atlas");
  const q = (s: string) => slip?.querySelector(s) ?? null;
  const bind = q(".slip-body #pr-bind");
  const road = doc.getElementById("pr-portfolio");
  const list = q(".slip-body > ol#pr-contents");
  const head = [
    text(q(".card-verb")),
    text(q("#atlas-title")),
    text(q(".card-where")),
    q(".slip-fold")?.getAttribute("aria-label") ?? null,
  ];
  const foot = ["pr-print", "pr-download", "pr-hide"].filter((id) => !!q(".slip-foot #" + id));
  return faults([
    same(head, ["Take home", "The Bound Atlas", "the whole atlas on one sheet", "Fold the atlas away"]) ||
      "the slip's head",
    same(bind && [bind.className, bind.getAttribute("type"), text(bind), bind.hasAttribute("disabled")], [
      "primary",
      "button",
      "Bind the atlas",
      true,
    ]) || "Bind, closed until a proof",
    (list && list.className) === "contents" || "the contents list the kit's row",
    foot.length === 3 || "Print, Download and Hide in the foot",
    same(road && [!!slip?.contains(road), road.getAttribute("href"), text(road)], [
      true,
      "../explorer/portfolio/",
      "The Portfolio",
    ]) || "the Portfolio road, in the slip",
    before(slip, doc.querySelector(".corner.bl.folio")) || "the slip before the chart folio",
    !doc.body.textContent.includes("about 20 MB") || "no 'about 20 MB'",
  ]);
}

function legendFaults(doc: Document): string[] {
  const nav = doc.querySelector("nav.legend");
  const row = nav?.querySelector(":scope > .legend-row") ?? null;
  const fmt = doc.querySelector(".legend-head #pr-format");
  const p = doc.querySelector(".legend-head #pr-pressing");
  const last = row?.lastElementChild ?? null;
  const st = doc.getElementById("pr-poster-status");
  const options = (s: Element | null) => (s ? [...s.querySelectorAll("option")] : []);
  return faults([
    nav?.getAttribute("aria-label") === "A poster plate" || "the legend's label",
    same(nav && [...nav.children].map((c) => c.className), [
      "legend-head",
      "legend-note",
      "legend-row",
      "legend-status",
    ]) || "the legend's parts in order",
    same(fmt && options(fmt).map((o) => [o.getAttribute("value"), text(o), o.hasAttribute("selected")]), [
      ["svg", "The engraving itself (SVG)", true],
      ["png1", "An impression (PNG)", false],
      ["png2", "A finer impression (PNG ×2)", false],
    ]) || "Pressed-as in the head, its options and labels",
    same(
      p && [
        p.getAttribute("aria-label"),
        options(p).map((o) => [
          o.getAttribute("value"),
          text(o),
          o.hasAttribute("selected"),
          o.hasAttribute("disabled"),
        ]),
      ],
      [
        "What the presses pull",
        [
          ["poster", "A poster plate", true, false],
          ["road", "The road from the capital", false, true],
        ],
      ],
    ) || "the head's own dropdown, the poster chosen and the road closed until its answer",
    same(
      [...doc.querySelectorAll(".legend-head select")].map((s) => s.id),
      ["pr-pressing", "pr-format"],
    ) || "the head's dropdown before Pressed-as",
    text(doc.getElementById("pr-note-tail")) === "The chart is pulled only as the engraving." ||
      "the caveat's last sentence in its own span",
    text(nav?.querySelector(".legend-note") ?? null) === NOTE || "the caveat",
    same(row && [row.getAttribute("role"), row.getAttribute("aria-label"), row.getAttribute("aria-labelledby")], [
      "group",
      "A poster plate",
      null,
    ]) || "the row's role and label",
    same(
      row
        ? [...row.querySelectorAll("[data-poster]")].map((b) => [
            b.getAttribute("data-poster"),
            b.className,
            b.getAttribute("type"),
            b.hasAttribute("disabled"),
            kids(b),
            text(b.querySelector(".verb")),
            text(b.querySelector(".room")),
          ])
        : [],
      PLATES,
    ) || "the four plates ascending, closed, with their verb and room",
    same(
      last && [
        last.tagName + "#" + last.id + "." + last.className,
        last.getAttribute("href"),
        text(last.querySelector(".verb")),
        text(last.querySelector(".room")),
      ],
      ["A#pr-explorer.legend-btn gold", "../explorer/", "Back to", "The Explorer"],
    ) || "the gold road last",
    (row ? (row.outerHTML.match(/portfolio/gi) ?? []).length : -1) === 0 || "nothing in the row names the portfolio",
    same(
      st && [
        doc.querySelectorAll("[id=pr-poster-status]").length,
        st.className,
        st.getAttribute("role"),
        st.getAttribute("aria-live"),
        text(st),
      ],
      [1, "legend-status", "status", "polite", ""],
    ) || "the poster status under the row",
  ]);
}

function stageFaults(doc: Document): string[] {
  const id = (s: string) => doc.getElementById(s);
  const vp = id("map-viewport");
  const pill = id("pr-status");
  const atlas = id("pr-atlas");
  const measure = id("pr-page-measure");
  const inner = id("pr-page-inner");
  const warning = id("pr-warning");
  return faults([
    !!doc.querySelector(".stage > #sheet.sheet > #map-viewport > #map") ||
      "the stage, the sheet, the gesture box and the transform target",
    !!vp?.getAttribute("aria-label")?.startsWith("The proof. ") || "the gesture box's label",
    same(kids(id("map")), ["DIV#pr-preview.preview", "IMG#pr-turned.turned", "DIV#pr-page.page"]) ||
      "the proof, the turned plate and the page in the transform target",
    same(
      ["pr-preview", "pr-turned", "pr-page"].map((s) => !!id(s) && id(s)!.hasAttribute("hidden")),
      [false, true, true],
    ) || "the turned plate and the page hidden as authored",
    same(inner && [kids(id("pr-page"))!.length, inner.className, inner.childElementCount], [
      1,
      "page-inner matter-page",
      0,
    ]) || "the page face's one inner, in the matter dress",
    same(kids(doc.querySelector(".stage")), [
      "DIV#sheet.sheet",
      "P#pr-status.status",
      "P#pr-warning.warning",
      "NOSCRIPT",
    ]) || "the pill, the warning and the notice in the stage",
    same(
      pill && [
        pill.getAttribute("role"),
        pill.getAttribute("aria-live"),
        text(pill),
        warning && warning.hasAttribute("hidden"),
      ],
      ["status", "polite", "", true],
    ) || "the pill a live status, the warning hidden",
    same(
      [...doc.querySelectorAll(".corner.br.zoomery > button")].map((b) => [b.id, b.getAttribute("data-zoom")]),
      [
        ["zoom-touch", null],
        ["zoom-in", "in"],
        ["zoom-out", "out"],
        ["zoom-reset", "fit"],
      ],
    ) || "the Glass's three presses",
    same(
      [...doc.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]),
      [
        ["folio-title", "folio-title"],
        ["folio-sub plate-line", "pr-plate-line"],
        ["folio-sub", "folio-sub"],
      ],
    ) || "the folio's three lines",
    same(
      atlas && [atlas.tagName, atlas.className, atlas.childElementCount, before(doc.querySelector(".zoomery"), atlas)],
      ["DIV", "atlas-sheet", 0, true],
    ) || "the hidden document, after the furniture",
    same(measure && [measure.className, measure.getAttribute("aria-hidden")], ["page-measure matter-page", "true"]) ||
      "the measure box in the matter dress",
  ]);
}

export function pr36Faults(doc: Document): string[] {
  return [...cornerFaults(doc), ...slipFaults(doc), ...legendFaults(doc), ...stageFaults(doc)];
}
