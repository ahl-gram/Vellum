import type { Payload } from "../../types.ts";
import { atFolded, CHART_ASPECT, CONTROL_GOLD, INK_BROWN, READ } from "./reads.ts";
import type { Specimen } from "./reads.ts";
import type { SpecimenKit } from "./kit.ts";

export async function sb1Boots({ check, shoot }: SpecimenKit, rest: Specimen | null): Promise<void> {
  check(
    "SB1 the Specimen Book boots as a chart room: the conductor answers, the Gallery's plate is on the sheet, the sheet is fitted at the PLATE's own aspect (read off the img, not the kit's fallback)",
    !!rest &&
      rest.st!.state === "rest" &&
      rest.plateLoaded &&
      Math.abs(rest.sheet!.w / rest.sheet!.h - rest.plateAspect!) < 0.003 &&
      Math.abs(rest.plateAspect! - CHART_ASPECT) > 0.0001 &&
      rest.noX,
    JSON.stringify(rest && { st: rest.st, plate: rest.plateLoaded, plateAspect: rest.plateAspect, sheet: rest.sheet }),
  );
  check(
    "SB2 at rest, at 1280: the slip hangs below the room's folio at the right edge, the Glass stands clear of it, the legend row sits between the chart folio and the Glass, the tab is hidden, the pill shows, the chart folio's four lines are written, no pool",
    !!rest &&
      rest.slip!.y > rest.folio!.bottom &&
      Math.abs(rest.innerW - rest.slip!.right - 2 * rest.rem) < 1 &&
      rest.slipVis === "visible" &&
      rest.glass!.right < rest.slip!.x &&
      rest.chartFolioText !== null &&
      rest.legend!.x >= rest.chartFolioText + 32 - 1 &&
      rest.legend!.right < rest.glass!.x &&
      rest.legendDisp !== "none" &&
      rest.tabVis === "hidden" &&
      rest.pillDisp !== "none" &&
      rest.pillText!.length > 0 &&
      rest.folioLines.length === 4 &&
      rest.folioLines.every(Boolean) &&
      rest.pool === "none" &&
      rest.poolChrome === "none",
    JSON.stringify(
      rest && {
        slip: rest.slip,
        folio: rest.folio,
        glass: rest.glass,
        legend: rest.legend,
        chartFolioText: rest.chartFolioText,
        tab: rest.tabVis,
        pill: rest.pillDisp,
        lines: rest.folioLines,
        pool: rest.pool,
      },
    ),
  );
  check(
    "SB3 the dress resolves from the kit sheet: the contents numeral in ink-brown, the inked index row at full ink and the rest at 0.55, the featured road in control gold, a disabled press at 0.45, a missed term hidden",
    !!rest &&
      rest.crNum === INK_BROWN &&
      rest.inked === "1" &&
      rest.unInked === "0.55" &&
      rest.gold === CONTROL_GOLD &&
      rest.disabled === "0.45" &&
      rest.missDisp === "none",
    JSON.stringify(
      rest && {
        crNum: rest.crNum,
        inked: rest.inked,
        unInked: rest.unInked,
        gold: rest.gold,
        disabled: rest.disabled,
        miss: rest.missDisp,
      },
    ),
  );
  await shoot("specimen-1280.png", { x: 0, y: 0, width: 1280, height: 800, scale: 1 });
}

export async function sb4Folded({ check, settle, setState }: SpecimenKit, rest: Specimen | null): Promise<void> {
  await setState("folded");
  const folded = await settle(READ, atFolded(rest!), "specimen-folded");
  check(
    "SB4 folded, through the slip's own fold: the slip is gone and its tab shown, the Glass moves out to the chrome's inset, the legend row re-centres rightward",
    folded.st!.folded &&
      folded.slipVis === "hidden" &&
      folded.tabVis === "visible" &&
      Math.abs(folded.innerW - folded.glass!.right - folded.chromeX * folded.rem) < 2 &&
      folded.legend!.x > rest!.legend!.x,
    JSON.stringify({
      st: folded.st,
      slip: folded.slipVis,
      tab: folded.tabVis,
      glass: folded.glass,
      legendX: [rest && rest.legend!.x, folded.legend!.x],
    }),
  );
}

export function sb5Leaned({ check }: SpecimenKit, leaned: Specimen): void {
  check(
    "SB5 leaned, through the Glass's own controller: the slip is back from its tab, the gesture box is zoomed, the sheet spills under the top and the left corners (the slip holds the right), and the corners and the cluster stand on the pool",
    leaned.st!.zoomed &&
      !leaned.st!.folded &&
      leaned.slipVis === "visible" &&
      leaned.pool === '""' &&
      leaned.poolChrome === '""' &&
      leaned.map!.x < 0 &&
      leaned.map!.y < 0 &&
      leaned.map!.bottom > 800,
    JSON.stringify({
      st: leaned.st,
      slip: leaned.slipVis,
      pool: leaned.pool,
      poolChrome: leaned.poolChrome,
      map: leaned.map,
    }),
  );
}

export async function sb5bEdgesDark({ check, brightest }: SpecimenKit, interior: number): Promise<void> {
  // The pool must reach past the viewport edge, or its blur fades right on the edge and the chart bleeds through at the corner (Alex's 2026-09-03 call on the Explorer's top-left; home runs its pool 4rem out). Sampled, since no computed style sees a blurred edge.
  const corners: { name: string; max: number }[] = [];
  // The edges the spilled chart reaches under a pooled piece: the two left corners; the right side is the slip's, the legend row carries home's footing (SB5c) and the Glass no pool at all (SB5d).
  for (const [x, y, name] of [
    [0, 2, "top-left"],
    [0, 797, "bottom-left"],
  ] as const)
    corners.push({ name, max: await brightest(x, y) });
  check(
    "SB5b leaned, every viewport edge under a pooled piece is as dark as the pool's interior: no chart paper bleeds through the pool's fade at the edge (eight edge pixels at each place within 15 of the cluster's interior, which the old inset failed at 97 against 60)",
    corners.every((c) => c.max <= interior + 15),
    JSON.stringify({ interior, corners }),
  );
}

export async function sb5dGlassBare(
  { check, brightest }: SpecimenKit,
  leaned: Specimen,
  interior: number,
): Promise<void> {
  const underGlass = await brightest(Math.round(leaned.glass!.x) + 2, 797);
  check(
    "SB5d leaned, the Glass stands bare on the chart as home's does: no pool behind its presses, and the chart shows through beside them (the edge just below the Glass reads well above the pooled interior)",
    leaned.poolGlass === "none" && underGlass > interior + 30,
    JSON.stringify({ poolGlass: leaned.poolGlass, underGlass, interior }),
  );
}

export async function sb5eFolioPanel(
  { check, brightest }: SpecimenKit,
  rest: Specimen | null,
  leaned: Specimen,
): Promise<void> {
  const panelLeft = Math.round(leaned.folio!.x - 0.9 * leaned.rem),
    panelY = Math.round(leaned.folio!.y + leaned.folio!.h / 2);
  const panelIn = await brightest(panelLeft + 3, panelY),
    panelOut = await brightest(panelLeft - 11, panelY);
  check(
    "SB5e leaned, the room folio stands on home's seed box: a crisp panel (a top-to-bottom gradient, no blur) whose left edge is a step against the chart, the pixels 3px inside dark and 11px outside bright",
    /^linear-gradient\((?!to top)/.test(leaned.folioPanel!) &&
      leaned.folioFilter === "none" &&
      panelOut - panelIn > 60 &&
      rest!.pool === "none",
    JSON.stringify({
      panel: leaned.folioPanel!.slice(0, 44),
      filter: leaned.folioFilter,
      panelIn,
      panelOut,
      rest: rest!.pool,
    }),
  );
}

const px531 = (rem: number, v: number) => `${Math.round(v * rem * 100) / 100}px`;
const same = (a: string[] | null, b: string[] | null) =>
  !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

export function sb8eInsets({ check }: SpecimenKit, leaned: Specimen): void {
  // Issue #531: the RESOLVED inset, since a value can sit in the stylesheet inert and a text match passes it.
  const insetWide = [-0.7, -0.9, -0.8, -0.9].map((v) => px531(leaned.rem, v));
  check(
    "SB8e leaned at 1280 the folio's panel takes home's base padding, the seed box's own insets (.lf-seed, public/index.css), on the painting arm that gives the pseudo its content (#531; its narrow half went with the narrow layout, Issue #762)",
    same(leaned.folioInset, insetWide),
    JSON.stringify({ rem: leaned.rem, at1280: leaned.folioInset, want1280: insetWide }),
  );
}

export async function sb5cFooting(
  { check, brightest }: SpecimenKit,
  rest: Specimen | null,
  leaned: Specimen,
): Promise<void> {
  // Just below the row's box, inside the footing's 0.6rem foot band: the row's own centre is the gold road (227).
  const footing = await brightest(
    Math.round(leaned.legend!.x + leaned.legend!.w / 2) - 4,
    Math.round(leaned.legend!.bottom) + 3,
  );
  check(
    "SB5c leaned, the legend row stands on home's footing, the seed box's crisp panel (a top-to-bottom gradient, no fade) drawn as the row's own ::before, not the blurred pool: the panel resolves, its foot band reads dark over the chart, and at rest the row carried no ground (the fade left at the 2026-09-03 sitting, ruling 23)",
    leaned.legendGroundOn === '""' &&
      /^linear-gradient\((?!to top)/.test(leaned.legendGround!) &&
      footing < 120 &&
      rest!.legendGroundOn === "none",
    JSON.stringify({ leaned: leaned.legendGround!.slice(0, 40), footing, rest: rest!.legendGroundOn }),
  );
}

export async function sb6RestAgain({ evaluate, check, sleep, setState, read }: SpecimenKit): Promise<void> {
  await setState("rest");
  await sleep(700);
  const back = await read();
  const emptied = await evaluate<{ text: string; disp: string; btn: string }>(
    `(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display,btn:document.getElementById("sb-report").textContent};})()`,
  );
  const refilled = await evaluate<{ text: string; disp: string }>(
    `(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display};})()`,
  );
  check(
    "SB6 at rest again the camera is home and the pool gone; the foot's press empties the status pill (which then hides, :empty) and fills it back",
    !back.st!.zoomed &&
      back.pool === "none" &&
      emptied.text === "" &&
      emptied.disp === "none" &&
      /Fill/.test(emptied.btn) &&
      refilled.text.length > 0 &&
      refilled.disp !== "none",
    JSON.stringify({ back: { st: back.st, pool: back.pool }, emptied, refilled }),
  );
}

const ROUTE: Payload<{ robots: string | null; body: string[]; ogUrl: string | null; navLinks: number }> =
  `(() => ({ robots: document.querySelector("meta[name='robots']")?.getAttribute("content") ?? null, body: [...document.body.classList],
    ogUrl: document.querySelector("meta[property='og:url']")?.getAttribute("content") ?? null,
    navLinks: document.querySelectorAll("nav.rooms a[href$='/specimen/']").length }))()`;

export async function sb10Route({ evaluate, check }: SpecimenKit): Promise<void> {
  const r = await evaluate(ROUTE);
  check(
    "SB10 the Book is a chart room off the nav and off the index: it asks not to be indexed, wears the chart room's classes, names /specimen/ as its own address, and no nav link leads to it (Issue #487 item 4)",
    r.robots === "noindex" &&
      r.body.includes("room") &&
      r.body.includes("chart-room") &&
      !!r.ogUrl &&
      r.ogUrl.endsWith("/specimen/") &&
      r.navLinks === 0,
    JSON.stringify(r),
  );
}

const PIECES = {
  fog: ".fog.a, .fog.b",
  vignettes: ".vignette.top, .vignette.bottom",
  gestureBox: ".stage #map-viewport",
  glassPresses: ".zoomery [data-zoom]",
  chartFolio: ".corner.bl p",
  goldRoad: "nav.legend a.legend-btn.gold",
  plainRoad: "nav.legend a.legend-btn:not(.gold)[href]",
  disabledPress: "nav.legend button.legend-btn:disabled",
  slipFoot: ".slip .slip-foot",
  contentsRows: ".slip ol.contents .cr-num",
  inked: ".slip ol.index li.inked",
  now: ".slip ol.index .now",
  hit: ".slip ol.index .hit",
  pillText: "#sb-status:not(:empty)",
  control: ".folio-room .folio-controls .control",
  dice: ".folio-room .folio-controls .dice",
  primary: ".folio-room .folio-controls .primary",
  stateSelect: "select#sb-state.control",
};
const WANT: Record<keyof typeof PIECES, number> = {
  fog: 2,
  vignettes: 2,
  gestureBox: 1,
  glassPresses: 3,
  chartFolio: 4,
  goldRoad: 1,
  plainRoad: 1,
  disabledPress: 1,
  slipFoot: 1,
  contentsRows: 3,
  inked: 1,
  now: 2,
  hit: 1,
  pillText: 1,
  control: 2,
  dice: 1,
  primary: 1,
  stateSelect: 1,
};

export async function sb11Pieces({ evaluate, check }: SpecimenKit): Promise<void> {
  const counts = await evaluate<Record<string, number>>(
    `(() => Object.fromEntries(Object.entries(${JSON.stringify(PIECES)}).map(([k, s]) => [k, document.querySelectorAll(s).length])))()`,
  );
  const short = Object.entries(WANT).filter(([k, n]) => counts[k] !== n);
  check(
    "SB11 the Book stands every kit piece in every state its dress can show: the fog and vignette pairs, the gesture box, the Glass's three presses, the chart folio's four lines, a gold road, a plain road and a disabled press, the slip's foot, the contents rows, the index's inked, reading and found marks, the pill with its words, and the corner's controls, dice, primary and state select (Issue #487 item 4)",
    short.length === 0,
    short.map(([k, n]) => `${k} ${counts[k]} of ${n}`).join(", ") || JSON.stringify(counts),
  );
}

export async function sb12StatusVoice({ evaluate, check }: SpecimenKit): Promise<void> {
  const v = await evaluate<{ style: string; family: string }>(
    `(() => { const cs = getComputedStyle(document.getElementById("sb-status")); return { style: cs.fontStyle, family: cs.fontFamily }; })()`,
  );
  check(
    "SB12 a room's status pill speaks in the house's status voice: italic, in the body face (Issue #324 decision 3)",
    v.style === "italic" && /^"EB Garamond",/.test(v.family),
    JSON.stringify(v),
  );
}

const PRESS = (id: string): Payload<{ x: number; y: number } | null> =>
  `(() => { const b = document.getElementById(${JSON.stringify(id)}); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`;

async function press(k: SpecimenKit, id: string): Promise<void> {
  const at = await k.evaluate(PRESS(id));
  if (!at) throw new Error(`no ${id} to press`);
  await k.send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
  await k.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
}

export async function sb13GlassPress(k: SpecimenKit): Promise<void> {
  const before = await k.read();
  try {
    await press(k, "zoom-in");
    const leaned = await k.settle(READ, (d) => !!d.st && d.st.zoomed, "specimen-zoom-in");
    await press(k, "zoom-reset");
    const home = await k.settle(READ, (d) => !!d.st && !d.st.zoomed, "specimen-zoom-home");
    k.check(
      "SB13 the Glass answers a real press: zoom-in leans the camera in and the home press brings it back, through the kit's own key binder (Issue #487)",
      !!before.st && !before.st.zoomed && leaned.st!.zoomed && !home.st!.zoomed,
      JSON.stringify({ before: before.st, leaned: leaned.st, home: home.st }),
    );
  } finally {
    await k.setState("rest");
  }
}
