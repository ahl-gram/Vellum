import { OG_HOOK_LINES } from "../../src/render/og-card.ts";
import { homeStage } from "../../src/site/home/stage-data.ts";
import { homeStations, howStation, unclaimedDots } from "../../src/site/home/stations.ts";
import { faults, pageText, same } from "../built-dom.ts";

// Home's stations and marks (from e2e L13).
export function l13Faults(doc: Document): string[] {
  const want = [...homeStations(), howStation()];
  const dots = unclaimedDots(homeStage().dots, homeStations()).length;
  const pips = [...doc.querySelectorAll(".lf-stations > *")];
  const cards = [...doc.querySelectorAll("aside.lf-card")].map((c) => c.id);
  const pipFaults = pips.flatMap((p, i) => {
    const w = want[i];
    if (!w) return [`pip ${i} has no station`];
    const wrong = [
      p.tagName === "BUTTON" || "tag",
      p.getAttribute("type") === "button" || "type",
      p.getAttribute("data-station") === w.id || "id",
      p.getAttribute("data-nx") === String(w.nx) || "nx",
      p.getAttribute("data-ny") === String(w.ny) || "ny",
      p.classList.contains("at-sea") === w.sea || "at-sea",
    ].filter((f) => f !== true);
    return wrong.length ? [`pip ${w.id}: ${wrong.join(", ")}`] : [];
  });
  return faults([
    doc.querySelector(".lf-marks")?.getAttribute("aria-hidden") === "true" || "the marks' aria shroud",
    doc.querySelector(".lf-stations")?.hasAttribute("aria-hidden") === false ||
      "the stations' layer outside the shroud",
    pips.length === want.length || `${pips.length} pips, want ${want.length}`,
    ...pipFaults,
    want.every((s) => cards.includes(`lf-card-${s.id}`)) || "a slip for every station",
    doc.querySelectorAll(".lf-marks > .lf-dot").length === dots || `the marks are not the ${dots} unclaimed places`,
  ]);
}

const slipKids = (arms: boolean) => [
  "lf-card-close",
  "lf-card-verb",
  "lf-card-title",
  "lf-card-where",
  "lf-card-prose",
  ...(arms ? ["lf-card-arms"] : []),
  "lf-card-enter",
];

// The legend glosses the encounters once and lists one press per station; every station slip runs in order and ends at its room's door (from e2e L14).
export function l14Faults(doc: Document, html: string): string[] {
  const stations = homeStations();
  const arms = ["charts/arms-42-0.svg", "charts/arms-42-1.svg", "charts/arms-42-2.svg"];
  const head = doc.querySelector("nav.lf-legend > p.lf-legend-head")?.textContent ?? null;
  const gloss = pageText(html).split("Every seed is a world entire").length - 1;
  const row = [...doc.querySelectorAll("nav.lf-legend .lf-legend-row > *")].map((b) => ({
    id: b.getAttribute("data-station"),
    verb: b.querySelector(".lf-legend-verb")?.textContent ?? "",
    room: b.querySelector(".lf-legend-room")?.textContent ?? "",
  }));
  const slips = [...doc.querySelectorAll("aside.lf-card:not(.lf-card-how)")].map((c) => ({
    id: c.id,
    kids: [...c.children].map((e) => e.className),
    enter: c.querySelector(":scope > a.lf-card-enter")?.getAttribute("href") ?? null,
    arms: [...c.querySelectorAll(".lf-card-arms img")].map((i) => i.getAttribute("src")),
  }));
  const slipFaults = stations.flatMap((s, i) => {
    const slip = slips[i];
    if (!slip) return [`no slip ${i}`];
    return [
      slip.id === `lf-card-${s.id}` || `slip ${i} id`,
      same(slip.kids, slipKids(s.arms)) || `slip ${s.id} parts`,
      slip.enter === s.href || `slip ${s.id} door`,
      same(slip.arms, s.arms ? arms : []) || `slip ${s.id} arms`,
    ].filter((f): f is string => f !== true);
  });
  return faults([
    !!head?.startsWith("Every seed is a world entire") || "the legend's head",
    gloss === 1 || `the gloss stands ${gloss} times`,
    same(
      row,
      stations.map((s) => ({ id: s.id, verb: s.verb, room: s.legendName })),
    ) || "one press per station, in order",
    slips.length === stations.length || `${slips.length} slips`,
    ...slipFaults,
  ]);
}

const PLATES = [
  ["charts/chart-42-topographic.svg", "Topographic survey"],
  ["charts/chart-42-ink.svg", "Pen & ink"],
  ["charts/chart-42-nautical.svg", "Nautical chart, with fathom soundings"],
] as const;

// The natural size of a served SVG: its root's width and height, or its viewBox's last two numbers where it has none.
function svgSize(svg: string): [number, number] | null {
  const root = /<svg\b[^>]*>/.exec(svg)?.[0];
  if (!root) return null;
  const attr = (n: string) => new RegExp(`\\s${n}="([^"]*)"`).exec(root)?.[1];
  const w = parseFloat(attr("width") ?? "");
  const h = parseFloat(attr("height") ?? "");
  if (w > 0 && h > 0) return [w, h];
  const box = (attr("viewBox") ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  return box.length === 4 && box[2]! > 0 && box[3]! > 0 ? [box[2]!, box[3]!] : null;
}

// The shelf is plain flow after the landfall section, three plates each linking its own chart (from e2e L15). Dropped with what only a running browser has: the link answering 200 over the network, read as the served file's presence, and the decoded size, read from the served SVG.
export function l15Faults(doc: Document, served: (path: string) => string | null): string[] {
  const shelf = doc.querySelector("section.lf-shelf");
  if (!shelf) return ["no shelf"];
  const figures = [...shelf.querySelectorAll("figure")];
  const figFaults = figures.flatMap((f, i) => {
    const a = f.querySelector(":scope > a[href]");
    const img = f.querySelector("img");
    const href = a?.getAttribute("href") ?? null;
    const file = href === null ? null : served(href);
    const size = file === null ? null : svgSize(file);
    const alt = img?.getAttribute("alt");
    return [
      href === PLATES[i]?.[0] || `figure ${i} links ${href}`,
      (f.querySelector("figcaption")?.textContent ?? "") === PLATES[i]?.[1] || `figure ${i} caption`,
      file !== null || `figure ${i}'s chart is not served`,
      img?.getAttribute("loading") === "lazy" || `figure ${i} is not lazy`,
      img?.getAttribute("fetchpriority") === "low" || `figure ${i} is not low priority`,
      !!img?.classList.contains("plate") || `figure ${i} wears no plate tip`,
      (size !== null &&
        img?.getAttribute("width") === String(size[0]) &&
        img.getAttribute("height") === String(size[1])) ||
        `figure ${i}'s size attributes are not its chart's own ${JSON.stringify(size)}`,
      (typeof alt === "string" && alt.trim() !== "") || `figure ${i} has no alt`,
    ].filter((x): x is string => x !== true);
  });
  return faults([
    doc.querySelector("section.landfall")?.nextElementSibling === shelf || "the shelf follows the landfall section",
    (shelf.querySelector("h2")?.textContent ?? null) === "One World, Many Charts" || "the shelf's heading",
    figures.length === PLATES.length || `${figures.length} figures`,
    ...figFaults,
    shelf.querySelectorAll("[hidden]").length + (shelf.hasAttribute("hidden") ? 1 : 0) === 0 ||
      "something on the shelf is hidden",
    !shelf.closest("noscript") || "the shelf stands in a noscript",
  ]);
}

const MARKERS = [
  "Vellum surveys worlds",
  "raises land out of noise",
  "Towns settle where any founder would",
  "drafting table",
  "ten invented languages, one per culture",
  "Under the hood",
  "priority-flood",
  "README",
];
const HOW_KIDS = ["lf-card-close", "lf-card-verb", "lf-card-title", "lf-card-where", "lf-card-scroll"];
const DOORS = ["explorer/", "reading-room/", "atlas/", "gallery/"];

// The Notice to Mariners, the how panel and the noscript (from e2e L16). Dropped with what only a running browser has: the noscript's sheet not fetched with scripts on, a resource timing.
export function l16Faults(doc: Document, html: string): string[] {
  const stamp = doc.querySelector("aside.notice-stamp");
  const how = doc.getElementById("lf-card-how");
  const page = pageText(html);
  const lines = (p: Element | null) =>
    p ? [...p.childNodes].filter((n) => n.nodeType === 3).map((n) => (n.textContent ?? "").trim()) : [];
  const ns = doc.querySelector("section.landfall noscript");
  const scroll = how?.querySelector(":scope > .lf-card-scroll") ?? null;
  const scrollText = (scroll?.textContent ?? "").replace(/\s+/g, " ");
  return faults([
    !!stamp?.closest("#lf-stage") || "the stamp is not in the stage",
    stamp?.getAttribute("aria-hidden") === "true" || "the stamp is not decorative",
    (stamp?.querySelector(".stamp-head")?.textContent ?? null) === "Notice to Mariners" || "the stamp's head",
    same(lines(stamp?.querySelector(".stamp-body") ?? null), [
      "No feature on this chart exists.",
      "Soundings are imaginary.",
    ]) || "the stamp's body",
    page.split("No feature on this chart exists").length - 1 === 1 || "the notice's words are not the only copy",
    !page.includes("Navigation of these waters") || "the retired notice is back",
    how?.className === "lf-card lf-card-how" || "the how panel's class",
    !!how?.hasAttribute("hidden") || "the how panel ships open",
    same(how && [...how.children].map((e) => e.className), HOW_KIDS) || "the how panel's parts",
    (scroll?.getAttribute("tabindex") === "0" && scroll.getAttribute("role") === "region") ||
      "the how panel's prose is not keyboard-reachable",
    MARKERS.every((m) => scrollText.includes(m)) || "the how panel's prose lost a marker",
    !how?.querySelector(".lf-card-enter") || "the how panel carries a door",
    ![...doc.querySelectorAll("h2")].some((h) => h.textContent.trim() === "How It Works") ||
      "the old How It Works head is back",
    same(ns && [...ns.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")), DOORS) ||
      "the noscript's four doors",
    (ns?.querySelector("link[rel='stylesheet']")?.getAttribute("href") ?? null) === "home-noscript.css" ||
      "the noscript's own sheet",
  ]);
}

// The corner's hook is the share card's, line for line, broken where the card breaks it (from e2e L17).
export function l17Faults(doc: Document): string[] {
  const h = doc.querySelector(".lf-seed .seed-hook");
  const hook = h ? [...h.childNodes].map((n) => (n.nodeName === "BR" ? "<br>" : (n.textContent ?? "").trim())) : null;
  return same(hook, [OG_HOOK_LINES[0], "<br>", OG_HOOK_LINES[1]]) ? [] : [`the hook reads ${JSON.stringify(hook)}`];
}
