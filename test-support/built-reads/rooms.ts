import { before, faults, same, text } from "../built-dom.ts";

export function r16Faults(doc: Document, served: (path: string) => string | null): string[] {
  const map = doc.getElementById("map");
  const links = [...doc.querySelectorAll('head link[rel="stylesheet"]')].map(
    (l) => new URL(l.getAttribute("href") ?? "", "http://127.0.0.1/explorer/").pathname,
  );
  const sheet = served("shared/living-chart.css");
  return faults([
    (!!map && map.classList.contains("living-chart")) || "the mount carries living-chart",
    links.includes("/shared/living-chart.css") || "the page links the engine's sheet",
    (sheet !== null && /\.place-overlay\s*\{/.test(sheet)) || "the built sheet is the engine's own",
  ]);
}

const GLASS = [
  ["zoom-touch", null],
  ["zoom-in", "in"],
  ["zoom-out", "out"],
  ["zoom-reset", "fit"],
];

export function rr38Faults(doc: Document): string[] {
  const id = (s: string) => doc.getElementById(s);
  const corner = doc.querySelector(".corner.tr.folio-room");
  const group = corner?.querySelector(":scope > div") ?? null;
  const rows = (g: Element | null) =>
    g
      ? [...g.children].map((e) => [
          e.tagName + "." + [...e.classList].join("."),
          e.getAttribute("type"),
          e.getAttribute("min"),
          e.getAttribute("max"),
          e.getAttribute("step"),
          e.getAttribute("aria-label"),
          text(e),
        ])
      : [];
  const h1s = [...doc.querySelectorAll("h1")].map(
    (h) => (corner?.contains(h) ? "corner " : "") + h.className + ": " + text(h),
  );
  const slip = doc.querySelector("aside.slip#journal");
  const dock = slip?.querySelector(":scope > .slip-body > .journal-dock") ?? null;
  const strip = doc.querySelector("div.strip");
  const vp = id("map-viewport");
  const mount = id("rr-mount");
  const stripAfterSlip = before(slip, strip);
  return faults([
    same(h1s, ["corner room-name: The Reading Room"]) || "one h1, the folio's name",
    text(corner?.querySelector(":scope > .room-tagline") ?? null) === "watch a world live" || "the tagline",
    doc.querySelectorAll(".legend").length === 0 || "no legend row",
    same(group && [[...group.classList], group.getAttribute("role"), group.getAttribute("aria-label")], [
      ["folio-controls", "rr-colophon"],
      "group",
      "Read another world",
    ]) || "the colophon, the folio's one control group",
    same(rows(group), [
      ["INPUT.control", "number", "0", "4294967295", "1", "seed", ""],
      ["BUTTON.dice.rr-dice", "button", null, null, null, "Random seed", "⚄"],
      ["BUTTON.primary.rr-read", "button", null, null, null, null, "Read"],
    ]) || "the seed, the dice and Read, each in its dress",
    same(
      slip && [
        text(slip.querySelector(".card-verb")),
        text(id("journal-title")),
        text(doc.querySelector(".slip-tab[aria-controls=journal]")),
      ],
      ["Watch one", "The Journal", "The Journal"],
    ) || "the Journal slip's verb, title and tab",
    same(dock && [dock.getAttribute("role"), dock.getAttribute("aria-label")], ["region", "The surveyor's log"]) ||
      "the dock in the slip's body",
    same(
      strip && [
        strip.getAttribute("role"),
        strip.getAttribute("aria-label"),
        [...strip.children].map((c) => c.className),
      ],
      ["group", "The instrument", ["scale"]],
    ) || "the strip, the instrument's seat, carrying the scale",
    stripAfterSlip || "the strip after the slip",
    !!doc.querySelector(".stage > #sheet.sheet > #map-viewport") || "the stage, the sheet and the gesture box",
    same(vp && [vp.getAttribute("tabindex"), vp.getAttribute("role"), vp.childElementCount], ["0", "application", 0]) ||
      "the gesture box focusable, an application, empty as authored",
    (mount && mount.tagName === "DIV" ? mount.childElementCount : null) === 0 || "the frame's empty mount",
    same(
      [...doc.querySelectorAll(".corner.br.zoomery > button")].map((b) => [b.id, b.getAttribute("data-zoom")]),
      GLASS,
    ) || "the Glass's three presses",
    same(
      [...doc.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]),
      [
        ["folio-title", "folio-title"],
        ["folio-sub", "folio-sub"],
      ],
    ) || "the chart folio's two lines",
  ]);
}

export function hg6Faults(doc: Document): string[] {
  const vp = doc.getElementById("map-viewport");
  const folio = doc.querySelector(".corner.bl.folio");
  const first = folio?.querySelector("p") ?? null;
  const kids = (e: Element | null) =>
    e
      ? [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + (c.className ? "." + c.className : ""))
      : null;
  return faults([
    (vp?.parentElement?.className ?? null) === "stage" || "the stage holds the gesture box",
    same(kids(vp), ["DIV#map"]) || "the gesture box holds the transform target alone",
    same(kids(doc.getElementById("map")), ["DIV#sheet.sheet"]) || "the target holds the chart's own sheet alone",
    same(vp && [vp.getAttribute("tabindex"), vp.getAttribute("role")], ["0", "application"]) ||
      "the box is a focusable application",
    doc.querySelectorAll("#caption").length === 0 || "no caption",
    same(
      folio && [
        !!folio.closest(".stage"),
        before(vp, folio),
        !!first?.classList.contains("folio-title"),
        first?.id ?? null,
      ],
      [false, true, true, "folio-title"],
    ) || "the folio stands outside the stage after it, its first line the title",
  ]);
}
