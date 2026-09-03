// The Specimen Book (#487 item 4, cut at #465 ruling 6): every kit piece at its seat, in every state, on one page; MEASURED at 1280x800 and a true 390x844, and shot at both as the closing review's pair (specimen-1280.png, specimen-390.png, specimen-390-open.png in the e2e out dir). Every state is reached through the kit's own binders (the fold, the tab, the handle, the Glass), never by planting a class.
import { scopedHealth } from "./room-support.mjs";
import { luminance, sampleRow } from "./pixel-support.mjs";

const PAGE = "/specimen/";
const CHART_ASPECT = 1500 / 1157.931;
const INK_BROWN = "rgb(107, 90, 64)";
const CONTROL_GOLD = "rgb(240, 227, 189)";

const READ = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const cs = (sel, prop, pseudo) => { const e = document.querySelector(sel); return e ? getComputedStyle(e, pseudo || null)[prop] : null; };
  const legend = document.querySelector(".legend");
  const plate = document.getElementById("sb-plate");
  const root = getComputedStyle(document.documentElement);
  return {
    st: window.__vellumSpecimenState ? window.__vellumSpecimenState() : null,
    innerW: innerWidth, innerH: innerHeight, rem: parseFloat(root.fontSize), chromeX: parseFloat(root.getPropertyValue("--chrome-x")),
    plateLoaded: !!plate && plate.complete && plate.naturalWidth > 0, plateAspect: plate && plate.naturalWidth > 0 ? plate.naturalWidth / plate.naturalHeight : null,
    sheet: r("#sheet"), map: r("#map"),
    slip: r(".slip"), slipVis: cs(".slip", "visibility"), slipDisp: cs(".slip", "display"), slipPos: cs(".slip", "position"), slipBody: cs(".slip-body", "display"),
    tabVis: cs(".slip-tab", "visibility"), tabDisp: cs(".slip-tab", "display"),
    folio: r(".corner.tr"), chartFolio: r(".corner.bl"), chartFolioDisp: cs(".corner.bl", "display"), folioRoomPos: cs(".corner.folio-room", "position"),
    // room-seats.ts places the legend from the folio's wrapped TEXT, not its box (a short line leaves the row more room).
    chartFolioText: (() => { const f = document.querySelector(".corner.bl"); if (!f) return null; const range = document.createRange(); let right = null; for (const p of f.querySelectorAll("p")) { if (!p.textContent) continue; range.selectNodeContents(p); const b = range.getBoundingClientRect(); if (b.width > 0) right = Math.max(right ?? 0, b.right); } return right; })(),
    glass: r(".corner.br"), glassDisp: cs(".zoomery", "display"),
    glassOverFolio: (() => { const g = document.querySelector(".corner.br"), f = document.querySelector(".corner.tr"); if (!g || !f) return null; const a = g.getBoundingClientRect(), b = f.getBoundingClientRect(); const w = Math.min(a.right, b.right) - Math.max(a.x, b.x), h = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y); return w > 0 && h > 0 ? [Math.round(w), Math.round(h)] : null; })(),
    legend: r(".legend"), legendDisp: cs(".legend", "display"), legendGround: cs(".legend", "backgroundImage", "::before"), legendGroundOn: cs(".legend", "content", "::before"), legendInSlip: !!legend && legend.classList.contains("in-slip"), legendDocked: !!legend && !!legend.parentElement && legend.parentElement.classList.contains("legend-dock"),
    pool: cs(".corner.tr", "content", "::before"), poolChrome: cs("header.chrome", "content", "::before"), poolGlass: cs(".corner.br", "content", "::before"), folioPanel: cs(".corner.tr", "backgroundImage", "::before"), folioFilter: cs(".corner.tr", "filter", "::before"),
    pillDisp: cs("#sb-status", "display"), pillText: (document.getElementById("sb-status") || { textContent: null }).textContent,
    folioLines: [...document.querySelectorAll(".corner.bl p")].map((p) => p.textContent.length > 0),
    crNum: cs(".contents .cr-num", "color"), inked: cs(".index li.inked", "opacity"), unInked: cs(".index > li:not(.inked)", "opacity"),
    gold: cs(".legend-btn.gold", "background-color"), disabled: cs(".legend-btn:disabled", "opacity"), missDisp: cs(".index .terms a.miss", "display"),
    handleExpanded: (document.querySelector(".slip-handle") || { getAttribute() { return null; } }).getAttribute("aria-expanded"),
    sheetH: document.body.style.getPropertyValue("--sheet-h"),
    fog: cs(".fog.a", "display"), vignette: cs(".vignette.top", "display"),
    noX: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  };
})()`;

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, PORT } = ctx;
  const gate = scopedHealth(ctx);
  const read = () => evaluate(READ);
  const setState = (s) => evaluate(`(()=>{const sel=document.getElementById("sb-state");sel.value=${JSON.stringify(s)};sel.dispatchEvent(new Event("change",{bubbles:true}));return sel.value;})()`);

  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.
  const goto = async () => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${PAGE}` });
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await read(); } catch {}
      if (s && s.st && s.plateLoaded && s.sheet && s.sheet.w > 0) { await sleep(800); return read(); }
      await sleep(50);
    }
    return null;
  };
  // The 800ms after boot is the landing (sheet-land 0.55s) plus the ink-in (0.5s after 0.18s): a shot before it shows the deep and the chart alone, the furniture still at opacity 0.

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const rest = await goto();
  check(
    "SB1 the Specimen Book boots as a chart room: the conductor answers, the Gallery's plate is on the sheet, the sheet is fitted at the PLATE's own aspect (read off the img, not the kit's fallback)",
    !!rest && rest.st.state === "rest" && rest.plateLoaded && Math.abs(rest.sheet.w / rest.sheet.h - rest.plateAspect) < 0.003 && Math.abs(rest.plateAspect - CHART_ASPECT) > 0.0001 && rest.noX,
    JSON.stringify(rest && { st: rest.st, plate: rest.plateLoaded, plateAspect: rest.plateAspect, sheet: rest.sheet }),
  );
  check(
    "SB2 at rest, at 1280: the slip hangs below the room's folio at the right edge, the Glass stands clear of it, the legend row sits between the chart folio and the Glass, the tab is hidden, the pill shows, the chart folio's four lines are written, no pool",
    !!rest && rest.slip.y > rest.folio.bottom && Math.abs(rest.innerW - rest.slip.right - 2 * rest.rem) < 1 && rest.slipVis === "visible" &&
      rest.glass.right < rest.slip.x && rest.legend.x >= rest.chartFolioText + 32 - 1 && rest.legend.right < rest.glass.x && rest.legendDisp !== "none" &&
      rest.tabVis === "hidden" && rest.pillDisp !== "none" && rest.pillText.length > 0 && rest.folioLines.length === 4 && rest.folioLines.every(Boolean) &&
      rest.pool === "none" && rest.poolChrome === "none",
    JSON.stringify(rest && { slip: rest.slip, folio: rest.folio, glass: rest.glass, legend: rest.legend, chartFolioText: rest.chartFolioText, tab: rest.tabVis, pill: rest.pillDisp, lines: rest.folioLines, pool: rest.pool }),
  );
  check(
    "SB3 the dress resolves from the kit sheet: the contents numeral in ink-brown, the inked index row at full ink and the rest at 0.55, the featured road in control gold, a disabled press at 0.45, a missed term hidden",
    !!rest && rest.crNum === INK_BROWN && rest.inked === "1" && rest.unInked === "0.55" && rest.gold === CONTROL_GOLD && rest.disabled === "0.45" && rest.missDisp === "none",
    JSON.stringify(rest && { crNum: rest.crNum, inked: rest.inked, unInked: rest.unInked, gold: rest.gold, disabled: rest.disabled, miss: rest.missDisp }),
  );
  await shoot("specimen-1280.png", { x: 0, y: 0, width: 1280, height: 800, scale: 1 });

  await setState("folded");
  await sleep(500);
  const folded = await read();
  check(
    "SB4 folded, through the slip's own fold: the slip is gone and its tab shown, the Glass moves out to the chrome's inset, the legend row re-centres rightward",
    !!folded && folded.st.folded && folded.slipVis === "hidden" && folded.tabVis === "visible" &&
      Math.abs(folded.innerW - folded.glass.right - folded.chromeX * folded.rem) < 2 && folded.legend.x > rest.legend.x,
    JSON.stringify(folded && { st: folded.st, slip: folded.slipVis, tab: folded.tabVis, glass: folded.glass, legendX: [rest && rest.legend.x, folded.legend.x] }),
  );

  await setState("leaned");
  await sleep(900);
  const leaned = await read();
  check(
    "SB5 leaned, through the Glass's own controller: the slip is back from its tab, the gesture box is zoomed, the sheet spills under the top and the left corners (the slip holds the right), and the corners and the cluster stand on the pool",
    !!leaned && leaned.st.zoomed && !leaned.st.folded && leaned.slipVis === "visible" && leaned.pool === '""' && leaned.poolChrome === '""' &&
      leaned.map.x < 0 && leaned.map.y < 0 && leaned.map.bottom > 800,
    JSON.stringify(leaned && { st: leaned.st, slip: leaned.slipVis, pool: leaned.pool, poolChrome: leaned.poolChrome, map: leaned.map }),
  );
  // The pool must reach past the viewport edge, or its blur fades right on the edge and the chart bleeds through at the corner (Alex's 2026-09-03 call on the Explorer's top-left; home runs its pool 4rem out). Sampled, since no computed style sees a blurred edge.
  const brightest = async (x, y) => Math.round(Math.max(...(await sampleRow(send, x, y, 8)).map(luminance)));
  const interior = await brightest(200, 24);
  const corners = [];
  // The edges the spilled chart reaches under a pooled piece: the two left corners; the right side is the slip's, the legend row carries home's footing (SB5c) and the Glass no pool at all (SB5d).
  for (const [x, y, name] of [[0, 2, "top-left"], [0, 797, "bottom-left"]]) corners.push({ name, max: await brightest(x, y) });
  check(
    "SB5b leaned, every viewport edge under a pooled piece is as dark as the pool's interior: no chart paper bleeds through the pool's fade at the edge (eight edge pixels at each place within 15 of the cluster's interior, which the old inset failed at 97 against 60)",
    corners.every((c) => c.max <= interior + 15),
    JSON.stringify({ interior, corners }),
  );
  const underGlass = await brightest(Math.round(leaned.glass.x) + 2, 797);
  check(
    "SB5d leaned, the Glass stands bare on the chart as home's does: no pool behind its presses, and the chart shows through beside them (the edge just below the Glass reads well above the pooled interior)",
    !!leaned && leaned.poolGlass === "none" && underGlass > interior + 30,
    JSON.stringify({ poolGlass: leaned.poolGlass, underGlass, interior }),
  );
  // Just below the row's box, inside the footing's 0.6rem foot band: the row's own centre is the gold road (227).
  const panelLeft = Math.round(leaned.folio.x - 0.9 * leaned.rem), panelY = Math.round(leaned.folio.y + leaned.folio.h / 2);
  const panelIn = await brightest(panelLeft + 3, panelY), panelOut = await brightest(panelLeft - 11, panelY);
  check(
    "SB5e leaned, the room folio stands on home's seed box: a crisp panel (a top-to-bottom gradient, no blur) whose left edge is a step against the chart, the pixels 3px inside dark and 11px outside bright",
    !!leaned && /^linear-gradient\((?!to top)/.test(leaned.folioPanel) && leaned.folioFilter === "none" && panelOut - panelIn > 60 && rest.pool === "none",
    JSON.stringify({ panel: leaned.folioPanel.slice(0, 44), filter: leaned.folioFilter, panelIn, panelOut, rest: rest.pool }),
  );
  const footing = await brightest(Math.round(leaned.legend.x + leaned.legend.w / 2) - 4, Math.round(leaned.legend.bottom) + 3);
  check(
    "SB5c leaned, the legend row stands on home's footing, a gradient box darkest at its foot drawn as the row's own ::before, not the blurred pool: the gradient resolves, its foot band reads dark over the chart, and at rest the row carried no ground",
    !!leaned && leaned.legendGroundOn === '""' && /linear-gradient/.test(leaned.legendGround) && footing < 120 && rest.legendGroundOn === "none",
    JSON.stringify({ leaned: leaned.legendGround.slice(0, 40), footing, rest: rest.legendGroundOn }),
  );

  await setState("rest");
  await sleep(700);
  const back = await read();
  const emptied = await evaluate(`(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display,btn:document.getElementById("sb-report").textContent};})()`);
  const refilled = await evaluate(`(()=>{document.getElementById("sb-report").click();const p=document.getElementById("sb-status");return{text:p.textContent,disp:getComputedStyle(p).display};})()`);
  check(
    "SB6 at rest again the camera is home and the pool gone; the foot's press empties the status pill (which then hides, :empty) and fills it back",
    !!back && !back.st.zoomed && back.pool === "none" && emptied.text === "" && emptied.disp === "none" && /Fill/.test(emptied.btn) && refilled.text.length > 0 && refilled.disp !== "none",
    JSON.stringify({ back: back && { st: back.st, pool: back.pool }, emptied, refilled }),
  );

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const phone = await goto();
  check(
    "SB7 at a true 390 the slip is the bottom sheet, collapsed to its head: fixed, full width, on the floor, its body hidden; the tab and the chart folio stand down, the legend row is docked in the slip, the Glass seats above the sheet, no sideways scroll",
    !!phone && phone.slipPos === "fixed" && phone.slip.x === 0 && phone.slip.w === 390 && Math.abs(phone.slip.bottom - 844) < 1 && phone.slipBody === "none" &&
      phone.tabDisp === "none" && phone.chartFolioDisp === "none" && phone.legendInSlip && phone.legendDocked &&
      phone.glass.bottom < phone.slip.y && phone.sheetH !== "" && phone.noX,
    JSON.stringify(phone && { slip: phone.slip, pos: phone.slipPos, body: phone.slipBody, tab: phone.tabDisp, chartFolio: phone.chartFolioDisp, docked: [phone.legendInSlip, phone.legendDocked], glass: phone.glass, sheetH: phone.sheetH, noX: phone.noX }),
  );
  await shoot("specimen-390.png", { x: 0, y: 0, width: 390, height: 844, scale: 1 });

  await evaluate(`document.querySelector(".slip-handle").click()`);
  await sleep(300);
  const open = await read();
  check(
    "SB8 the handle opens the sheet: its body shows, the handle reports expanded, the docked legend row is in it, and the Glass stands down while the sheet is open (the kit's rule since the 2026-09-03 sitting, ruling 1; above the sheet it climbed into the corner's row, 35x85 at 390)",
    !!open && open.st && open.slipBody !== "none" && open.handleExpanded === "true" && open.legendDocked && open.slip.y < phone.slip.y && open.glassDisp === "none" && open.glassOverFolio === null && open.noX,
    JSON.stringify(open && { body: open.slipBody, expanded: open.handleExpanded, slip: open.slip, glass: open.glass, glassOverFolio: open.glassOverFolio }),
  );
  await shoot("specimen-390-open.png", { x: 0, y: 0, width: 390, height: 844, scale: 1 });

  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printed = await read();
  check(
    "SB9 print is paper: the fog, the vignettes, the slip, the legend and the Glass print as nothing; the room's folio prints in flow",
    !!printed && printed.fog === "none" && printed.vignette === "none" && printed.slipDisp === "none" && printed.legendDisp === "none" && printed.glassDisp === "none" && printed.folioRoomPos === "static",
    JSON.stringify(printed && { fog: printed.fog, vignette: printed.vignette, slip: printed.slipDisp, legend: printed.legendDisp, glass: printed.glassDisp, folio: printed.folioRoomPos }),
  );
  await send("Emulation.setEmulatedMedia", { media: "" });
  await send("Emulation.clearDeviceMetricsOverride");

  gate.check("SB health: the Specimen Book raised no console error and no 4xx across every state at both widths");
}
