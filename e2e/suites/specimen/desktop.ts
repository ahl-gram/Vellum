import { atFolded, CHART_ASPECT, CONTROL_GOLD, INK_BROWN, READ } from "./reads.ts";
import type { Specimen } from "./reads.ts";
import type { SpecimenKit } from "./kit.ts";

export async function sb1Boots({ check, shoot }: SpecimenKit, rest: Specimen | null): Promise<void> {
  check(
    "SB1 the Specimen Book boots as a chart room: the conductor answers, the Gallery's plate is on the sheet, the sheet is fitted at the PLATE's own aspect (read off the img, not the kit's fallback)",
    !!rest && rest.st!.state === "rest" && rest.plateLoaded && Math.abs(
      rest.sheet!.w /
      rest.sheet!.h -
      rest.plateAspect!) < 0.003 && Math.abs(
      rest.plateAspect! - CHART_ASPECT) > 0.0001 && rest.noX,
    JSON.stringify(rest && { st: rest.st, plate: rest.plateLoaded, plateAspect: rest.plateAspect, sheet: rest.sheet }),
  );
  check(
    "SB2 at rest, at 1280: the slip hangs below the room's folio at the right edge, the Glass stands clear of it, the legend row sits between the chart folio and the Glass, the tab is hidden, the pill shows, the chart folio's four lines are written, no pool",
    !!rest && rest.slip!.y >
      rest.folio!.bottom && Math.abs(rest.innerW -
      rest.slip!.right - 2 * rest.rem) < 1 && rest.slipVis === "visible" &&
      rest.glass!.right <
        rest.slip!.x &&
        rest.chartFolioText !== null &&
        rest.legend!.x >=
        rest.chartFolioText + 32 - 1 &&
        rest.legend!.right <
        rest.glass!.x && rest.legendDisp !== "none" &&
      rest.tabVis === "hidden" && rest.pillDisp !== "none" && rest.pillText!.length > 0 && rest.folioLines.length === 4 && rest.folioLines.every(Boolean) &&
      rest.pool === "none" && rest.poolChrome === "none",
    JSON.stringify(rest && { slip: rest.slip, folio: rest.folio, glass: rest.glass, legend: rest.legend, chartFolioText: rest.chartFolioText, tab: rest.tabVis, pill: rest.pillDisp, lines: rest.folioLines, pool: rest.pool }),
  );
  check(
    "SB3 the dress resolves from the kit sheet: the contents numeral in ink-brown, the inked index row at full ink and the rest at 0.55, the featured road in control gold, a disabled press at 0.45, a missed term hidden",
    !!rest && rest.crNum === INK_BROWN && rest.inked === "1" && rest.unInked === "0.55" && rest.gold === CONTROL_GOLD && rest.disabled === "0.45" && rest.missDisp === "none",
    JSON.stringify(rest && { crNum: rest.crNum, inked: rest.inked, unInked: rest.unInked, gold: rest.gold, disabled: rest.disabled, miss: rest.missDisp }),
  );
  await shoot("specimen-1280.png", { x: 0, y: 0, width: 1280, height: 800, scale: 1 });
}

export async function sb4Folded({ check, settle, setState }: SpecimenKit, rest: Specimen | null): Promise<void> {
  await setState("folded");
  const folded = await settle(READ, atFolded(rest!), "specimen-folded");
  check(
    "SB4 folded, through the slip's own fold: the slip is gone and its tab shown, the Glass moves out to the chrome's inset, the legend row re-centres rightward",
    !!folded && folded.st!.folded && folded.slipVis === "hidden" && folded.tabVis === "visible" && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      Math.abs(folded.innerW - folded.glass!.right - folded.chromeX * folded.rem) < 2 &&
        folded.legend!.x >
        rest!.legend!.x,
    JSON.stringify(folded && { st: folded.st, slip: folded.slipVis, tab: folded.tabVis, glass: folded.glass, legendX: [rest && rest.legend!.x, // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      folded.legend!.x] }),
  );
}

export function sb5Leaned({ check }: SpecimenKit, leaned: Specimen): void {
  check(
    "SB5 leaned, through the Glass's own controller: the slip is back from its tab, the gesture box is zoomed, the sheet spills under the top and the left corners (the slip holds the right), and the corners and the cluster stand on the pool",
    !!leaned && leaned.st!.zoomed && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      !leaned.st!.folded && leaned.slipVis === "visible" && leaned.pool === '""' && leaned.poolChrome === '""' &&
      leaned.map!.x < 0 &&
        leaned.map!.y < 0 &&
        leaned.map!.bottom > 800,
    JSON.stringify(leaned && { st: leaned.st, slip: leaned.slipVis, pool: leaned.pool, poolChrome: leaned.poolChrome, map: leaned.map }), // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  );
}

export async function sb5bEdgesDark({ check, brightest }: SpecimenKit, interior: number): Promise<void> {
  // The pool must reach past the viewport edge, or its blur fades right on the edge and the chart bleeds through at the corner (Alex's 2026-09-03 call on the Explorer's top-left; home runs its pool 4rem out). Sampled, since no computed style sees a blurred edge.
  const corners: { name: string; max: number }[] = [];
  // The edges the spilled chart reaches under a pooled piece: the two left corners; the right side is the slip's, the legend row carries home's footing (SB5c) and the Glass no pool at all (SB5d).
  for (const [x, y, name] of [[0, 2, "top-left"], [0, 797, "bottom-left"]] as const) corners.push({ name, max: await brightest(x, y) });
  check(
    "SB5b leaned, every viewport edge under a pooled piece is as dark as the pool's interior: no chart paper bleeds through the pool's fade at the edge (eight edge pixels at each place within 15 of the cluster's interior, which the old inset failed at 97 against 60)",
    corners.every((c) => c.max <= interior + 15),
    JSON.stringify({ interior, corners }),
  );
}

export async function sb5dGlassBare({ check, brightest }: SpecimenKit, leaned: Specimen, interior: number): Promise<void> {
  const underGlass = await brightest(Math.round(leaned.glass!.x) + 2, 797);
  check(
    "SB5d leaned, the Glass stands bare on the chart as home's does: no pool behind its presses, and the chart shows through beside them (the edge just below the Glass reads well above the pooled interior)",
    !!leaned && leaned.poolGlass === "none" && underGlass > interior + 30, // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    JSON.stringify({ poolGlass: leaned.poolGlass, underGlass, interior }),
  );
}

export async function sb5eFolioPanel({ check, brightest }: SpecimenKit, rest: Specimen | null, leaned: Specimen): Promise<void> {
  const panelLeft = Math.round(leaned.folio!.x - 0.9 * leaned.rem), panelY = Math.round(
    leaned.folio!.y +
    leaned.folio!.h / 2);
  const panelIn = await brightest(panelLeft + 3, panelY), panelOut = await brightest(panelLeft - 11, panelY);
  check(
    "SB5e leaned, the room folio stands on home's seed box: a crisp panel (a top-to-bottom gradient, no blur) whose left edge is a step against the chart, the pixels 3px inside dark and 11px outside bright",
    !!leaned && /^linear-gradient\((?!to top)/.test(leaned.folioPanel!) && leaned.folioFilter === "none" && panelOut - panelIn > 60 && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      rest!.pool === "none",
    JSON.stringify({ panel: leaned.folioPanel!.slice(0, 44), filter: leaned.folioFilter, panelIn, panelOut, rest:
      rest!.pool }),
  );
}

export async function sb5cFooting({ check, brightest }: SpecimenKit, rest: Specimen | null, leaned: Specimen): Promise<void> {
  // Just below the row's box, inside the footing's 0.6rem foot band: the row's own centre is the gold road (227).
  const footing = await brightest(Math.round(leaned.legend!.x +
    leaned.legend!.w / 2) - 4, Math.round(
    leaned.legend!.bottom) + 3);
  check(
    "SB5c leaned, the legend row stands on home's footing, the seed box's crisp panel (a top-to-bottom gradient, no fade) drawn as the row's own ::before, not the blurred pool: the panel resolves, its foot band reads dark over the chart, and at rest the row carried no ground (the fade left at the 2026-09-03 sitting, ruling 23)",
    !!leaned && leaned.legendGroundOn === '""' && /^linear-gradient\((?!to top)/.test(leaned.legendGround!) && footing < 120 && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      rest!.legendGroundOn === "none",
    JSON.stringify({ leaned: leaned.legendGround!.slice(0, 40), footing, rest:
      rest!.legendGroundOn }),
  );
}

export async function sb6RestAgain({ evaluate, check, sleep, setState, read }: SpecimenKit): Promise<void> {
  await setState("rest");
  await sleep(700);
  const back = await read();
  const emptied = await evaluate<{ text: string; disp: string; btn: string }>(`(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display,btn:document.getElementById("sb-report").textContent};})()`);
  const refilled = await evaluate<{ text: string; disp: string }>(`(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display};})()`);
  check(
    "SB6 at rest again the camera is home and the pool gone; the foot's press empties the status pill (which then hides, :empty) and fills it back",
    !!back && !back.st!.zoomed && back.pool === "none" && emptied.text === "" && emptied.disp === "none" && /Fill/.test(emptied.btn) && refilled.text.length > 0 && refilled.disp !== "none", // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    JSON.stringify({ back: back && { st: back.st, pool: back.pool }, emptied, refilled }), // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  );
}
