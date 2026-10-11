// The Reading Room as authored, read with scripts off, since the frame's seats move the strip, the slip, the tab and the scale at boot (Issue #779 part 2g).
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const TEXT = `((e) => e ? e.textContent.replace(/\\s+/g, " ").trim() : null)`;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

type Corner = {
  h1s: string[];
  tagline: string | null;
  legends: number;
  group: unknown[] | null;
  controls: unknown[][];
};
const CORNER: Payload<Corner> = `(() => { const text = ${TEXT};
  const corner = document.querySelector(".corner.tr.folio-room"), group = corner && corner.querySelector(":scope > div");
  return { h1s: [...document.querySelectorAll("h1")].map((h) => (corner && corner.contains(h) ? "corner " : "") + h.className + ": " + text(h)),
    tagline: text(corner && corner.querySelector(":scope > .room-tagline")),
    legends: document.querySelectorAll(".legend").length,
    group: group && [[...group.classList], group.getAttribute("role"), group.getAttribute("aria-label")],
    controls: group ? [...group.children].map((e) => [e.tagName + "." + [...e.classList].join("."), e.getAttribute("type"), e.getAttribute("min"),
      e.getAttribute("max"), e.getAttribute("step"), e.getAttribute("aria-label"), text(e)]) : [] };
})()`;

const CONTROLS = [
  ["INPUT.control", "number", "0", "4294967295", "1", "seed", ""],
  ["BUTTON.dice.rr-dice", "button", null, null, null, "Random seed", "⚄"],
  ["BUTTON.primary.rr-read", "button", null, null, null, null, "Read"],
];

const cornerFaults = (c: Corner): string[] =>
  faults([
    same(c.h1s, ["corner room-name: The Reading Room"]) || "one h1, the folio's name",
    c.tagline === "watch a world live" || "the tagline",
    c.legends === 0 || "no legend row",
    same(c.group, [["folio-controls", "rr-colophon"], "group", "Read another world"]) ||
      "the colophon, the folio's one control group",
    same(c.controls, CONTROLS) || "the seed, the dice and Read, each in its dress",
  ]);

type Desk = {
  slip: (string | null)[] | null;
  dock: (string | null)[] | null;
  strip: unknown[] | null;
  stripAfterSlip: boolean;
  chain: boolean;
  viewport: unknown[] | null;
  mount: number | null;
  glass: (string | undefined)[][];
  folio: string[][];
};
const DESK: Payload<Desk> = `(() => { const text = ${TEXT}, id = (s) => document.getElementById(s);
  const slip = document.querySelector("aside.slip#journal"), dock = slip && slip.querySelector(":scope > .slip-body > .journal-dock");
  const strip = document.querySelector("div.strip"), vp = id("map-viewport"), mount = id("rr-mount");
  return { slip: slip && [text(slip.querySelector(".card-verb")), text(id("journal-title")), text(document.querySelector(".slip-tab[aria-controls=journal]"))],
    dock: dock && [dock.getAttribute("role"), dock.getAttribute("aria-label")],
    strip: strip && [strip.getAttribute("role"), strip.getAttribute("aria-label"), [...strip.children].map((c) => c.className)],
    stripAfterSlip: !!slip && !!strip && !!(slip.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING),
    chain: !!document.querySelector(".stage > #sheet.sheet > #map-viewport"),
    viewport: vp && [vp.getAttribute("tabindex"), vp.getAttribute("role"), vp.childElementCount],
    mount: mount && mount.tagName === "DIV" ? mount.childElementCount : null,
    glass: [...document.querySelectorAll(".corner.br.zoomery > button")].map((b) => [b.id, b.dataset.zoom]),
    folio: [...document.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]) };
})()`;

const deskFaults = (d: Desk): string[] =>
  faults([
    same(d.slip, ["Watch one", "The Journal", "The Journal"]) || "the Journal slip's verb, title and tab",
    same(d.dock, ["region", "The surveyor's log"]) || "the dock in the slip's body",
    same(d.strip, ["group", "The instrument", ["scale"]]) || "the strip, the instrument's seat, carrying the scale",
    d.stripAfterSlip || "the strip after the slip",
    d.chain || "the stage, the sheet and the gesture box",
    same(d.viewport, ["0", "application", 0]) || "the gesture box focusable, an application, empty as authored",
    d.mount === 0 || "the frame's empty mount",
    same(d.glass, [
      ["zoom-in", "in"],
      ["zoom-out", "out"],
      ["zoom-reset", "fit"],
    ]) || "the Glass's three presses",
    same(d.folio, [
      ["folio-title", "folio-title"],
      ["folio-sub", "folio-sub"],
    ]) || "the chart folio's two lines",
  ]);

type Loaded = { ready: string; path: string; frame: boolean };
const LOADED: Payload<Loaded> = `({ ready: document.readyState, path: location.pathname, frame: !!document.querySelector(".rf") })`;

export async function rr38Authored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const settle = makeSettle({ evaluate: (e: string) => evaluate<Loaded | null>(e).catch(() => null), sleep });
  try {
    const read = await withScriptsOff(send, async () => {
      await send("Page.navigate", { url: "about:blank" });
      await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/` });
      // A loaded page with no frame is the witness that its module never ran: with scripts on the frame mounts before the load event.
      await settle(
        LOADED,
        (d) => d.ready === "complete" && d.path === "/reading-room/" && !d.frame,
        "reading-room-scripts-off",
      );
      return { corner: await evaluate(CORNER), desk: await evaluate(DESK) };
    });
    const wrong = [...cornerFaults(read.corner), ...deskFaults(read.desk)];
    check(
      "RR38 the Reading Room as authored: the folio's one h1 and tagline with no legend row, the colophon group of the seed, the dice and Read in their dress, the Journal slip with its dock, the strip carrying the scale after the slip, the stage's sheet and its empty gesture box, the frame's empty mount, the Glass's three presses and the chart folio's two lines",
      wrong.length === 0,
      JSON.stringify({ wrong, read }),
    );
  } finally {
    // A hash-only navigate from here would keep this scripts-off document, so the next load starts from a blank one.
    await send("Page.navigate", { url: "about:blank" });
  }
}
